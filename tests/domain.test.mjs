import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ドメインモデルは応募・承認ではなくビヨンドとシュートを表現する", async () => {
  const [schema, types, home] = await Promise.all([
    readFile(new URL("supabase/migrations/202607290001_initial_schema.sql", root), "utf8"),
    readFile(new URL("lib/types.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
  ]);

  assert.match(schema, /create table public\.project_explorations/);
  assert.match(schema, /create table public\.project_continuations/);
  assert.match(types, /ProjectExploration/);
  assert.match(types, /ProjectContinuation/);
  assert.doesNotMatch(schema, /project_applications|development_tasks/i);
  assert.match(home, /公開されたRepositoryから自由に始められます/);
  assert.doesNotMatch(home, /応募も承認もなく|応募・承認なし/);
});

test("所有権・進捗・権利確認をRLSとDB関数で保護する", async () => {
  const schema = await readFile(
    new URL("supabase/migrations/202607290001_initial_schema.sql", root),
    "utf8",
  );

  assert.match(schema, /owner_profile_id uuid not null/);
  assert.match(schema, /projects_owner_update/);
  assert.match(schema, /record_progress_update/);
  assert.match(schema, /learner_profile_id <> v_profile_id/);
  assert.match(schema, /rights_confirmed_at timestamptz not null/);
  assert.match(schema, /secrets_confirmed_at timestamptz not null/);
  assert.match(schema, /accepted_usage_terms text not null/);
  assert.match(schema, /project-covers/);
  assert.match(schema, /avatars_owner_insert/);
});

test("外部URLはHTTPSかつ認証情報なしに限定する", async () => {
  const [validation, githubUrl] = await Promise.all([
    readFile(new URL("lib/validation.ts", root), "utf8"),
    readFile(new URL("lib/github-url.ts", root), "utf8"),
  ]);
  assert.match(validation, /protocol === "https:"/);
  assert.match(validation, /!url\.username && !url\.password/);
  assert.match(validation, /parseGitHubRepositoryUrl/);
  assert.match(githubUrl, /url\.hostname !== "github\.com"/);
  assert.match(githubUrl, /segments\.length !== 2/);
});

test("公開前チェックは入力とGitHub情報を再判定し、投稿時にも検証する", async () => {
  const [form, combobox, lookup, lookupRoute, projectRoute, styles] =
    await Promise.all([
      readFile(new URL("components/project-form.tsx", root), "utf8"),
      readFile(new URL("components/search-combobox.tsx", root), "utf8"),
      readFile(new URL("lib/github-repository.ts", root), "utf8"),
      readFile(new URL("app/api/github/repository/route.ts", root), "utf8"),
      readFile(new URL("app/api/projects/route.ts", root), "utf8"),
      readFile(new URL("app/globals.css", root), "utf8"),
    ]);

  assert.match(form, /onChange=\{updateChecks\}/);
  assert.match(form, /onReset=\{resetChecks\}/);
  assert.match(form, /onSubmit=\{submit\}/);
  assert.match(form, /event\.preventDefault\(\)/);
  assert.doesNotMatch(form, /action=\{submit\}/);
  assert.match(form, /repositoryCheck\.status === "valid"/);
  assert.match(form, /onValueChange=\{setRuntimeRequirements\}/);
  assert.match(form, /type="自動判定"/);
  assert.match(form, /type="手動確認"/);
  assert.match(combobox, /onValueChange\?\.\(value\)/);
  assert.match(combobox, /addEventListener\("reset", reset\)/);
  assert.match(lookup, /api\.github\.com\/repos/);
  assert.match(lookup, /data\.private/);
  assert.match(lookupRoute, /getGitHubRepositoryStatus/);
  assert.match(projectRoute, /await getGitHubRepositoryStatus/);
  assert.match(styles, /\.check-item\.is-complete/);
});

test("推奨スキルレベルは入力を要求せず難易度からサーバー側で導出する", async () => {
  const [form, validation, route] = await Promise.all([
    readFile(new URL("components/project-form.tsx", root), "utf8"),
    readFile(new URL("lib/validation.ts", root), "utf8"),
    readFile(new URL("app/api/projects/route.ts", root), "utf8"),
  ]);

  assert.doesNotMatch(form, /recommendedSkillLevel/);
  assert.doesNotMatch(validation, /recommendedSkillLevel/);
  assert.match(route, /skillLevelByDifficulty\[parsed\.data\.difficulty\]/);
  assert.match(route, /expert: "advanced"/);
});

test("既存AuthユーザーをProfileへ補完し、Project保存失敗を安全に分類する", async () => {
  const [migration, route, readme] = await Promise.all([
    readFile(
      new URL(
        "supabase/migrations/202607310001_backfill_auth_profiles.sql",
        root,
      ),
      "utf8",
    ),
    readFile(new URL("app/api/projects/route.ts", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
  ]);

  assert.match(migration, /from auth\.users as auth_user/);
  assert.match(migration, /where not exists/);
  assert.match(migration, /on conflict \(auth_user_id\) do nothing/);
  assert.match(route, /authenticated profile required/);
  assert.match(route, /code === "PGRST202"/);
  assert.doesNotMatch(
    route,
    /NextResponse\.json\(\s*\{ message: error\?\.message/,
  );
  assert.match(readme, /SQLをファイル名順に適用/);
});

test("公開データはRLSを通して読めるがテーブル書込権限を開放しない", async () => {
  const grants = await readFile(
    new URL(
      "supabase/migrations/202607310002_grant_public_read_access.sql",
      root,
    ),
    "utf8",
  );

  assert.match(grants, /grant select on table/);
  assert.match(grants, /public\.projects/);
  assert.match(grants, /public\.project_continuations/);
  assert.match(grants, /to anon, authenticated/);
  assert.doesNotMatch(grants, /grant (?:insert|update|delete|all)/i);
});

test("Projectのアーカイブと削除は所有者検証済みDB関数だけを通す", async () => {
  const [migration, route, controls, detail] = await Promise.all([
    readFile(
      new URL(
        "supabase/migrations/202608010001_project_owner_management.sql",
        root,
      ),
      "utf8",
    ),
    readFile(new URL("app/api/projects/[projectId]/route.ts", root), "utf8"),
    readFile(new URL("components/owner-project-controls.tsx", root), "utf8"),
    readFile(new URL("app/projects/[projectId]/page.tsx", root), "utf8"),
  ]);

  assert.match(migration, /archive_owned_project/);
  assert.match(migration, /delete_owned_project/);
  assert.match(migration, /owner_profile_id <> v_profile_id/);
  assert.match(migration, /project has learning activity/);
  assert.match(migration, /revoke update, delete on table public\.projects/);
  assert.match(migration, /title like 'ああああ%'/);
  assert.match(migration, /title like 'いいいいいいいい%'/);
  assert.match(migration, /v_target_count <> 2/);
  assert.match(route, /rpc\("archive_owned_project"/);
  assert.match(route, /export async function DELETE/);
  assert.match(route, /rpc\("delete_owned_project"/);
  assert.match(controls, /method: "DELETE"/);
  assert.match(controls, /enteredTitle\.trim\(\) !== projectTitle/);
  assert.match(detail, /projectTitle=\{project\.title\}/);
});

test("サンプルProjectの管理状態はログインProfileごとに保存する", async () => {
  const [migration, projects, route, controls, detail] = await Promise.all([
    readFile(
      new URL(
        "supabase/migrations/202608010002_sample_project_management.sql",
        root,
      ),
      "utf8",
    ),
    readFile(new URL("lib/projects.ts", root), "utf8"),
    readFile(new URL("app/api/projects/[projectId]/route.ts", root), "utf8"),
    readFile(new URL("components/owner-project-controls.tsx", root), "utf8"),
    readFile(new URL("app/projects/[projectId]/page.tsx", root), "utf8"),
  ]);

  assert.match(
    migration,
    /create table if not exists public\.sample_project_preferences/,
  );
  assert.match(migration, /enable row level security/);
  assert.match(migration, /profile_id = public\.current_profile_id\(\)/);
  assert.match(migration, /archive_sample_project/);
  assert.match(migration, /delete_sample_project/);
  assert.match(migration, /revoke insert, update, delete/);
  assert.match(projects, /getSampleProjectStates/);
  assert.match(projects, /state === "deleted"/);
  assert.match(projects, /status: "archived"/);
  assert.match(route, /rpc\("archive_sample_project"/);
  assert.match(route, /rpc\("delete_sample_project"/);
  assert.match(controls, /sample[\s\S]*rpc\("current_profile_id"\)/);
  assert.match(detail, /sample=\{isSampleProject\(project\.id\)\}/);
});

test("全Projectは作成者または明示された管理者が管理できる", async () => {
  const [migration, controls, route] = await Promise.all([
    readFile(
      new URL(
        "supabase/migrations/202608010003_project_management_grants.sql",
        root,
      ),
      "utf8",
    ),
    readFile(new URL("components/owner-project-controls.tsx", root), "utf8"),
    readFile(new URL("app/api/projects/[projectId]/route.ts", root), "utf8"),
  ]);

  assert.match(migration, /create table if not exists public\.project_management_grants/);
  assert.match(migration, /project\.owner_profile_id = public\.current_profile_id\(\)/);
  assert.match(migration, /management_grant\.manager_profile_id = public\.current_profile_id\(\)/);
  assert.match(migration, /create or replace function public\.can_manage_project/);
  assert.match(migration, /delete from public\.progress_updates/);
  assert.match(migration, /delete from public\.learning_outcomes/);
  assert.match(migration, /delete from public\.project_continuations/);
  assert.match(migration, /delete from public\.project_explorations/);
  assert.match(migration, /revoke insert, update, delete/);
  assert.match(controls, /rpc\("can_manage_project"/);
  assert.match(controls, /関連するビヨンド、進捗、学習成果、シュートも削除されます/);
  assert.match(route, /project manager required/);
});

test("Project投稿は非公開の一意キーで冪等に作成される", async () => {
  const [form, validation, route, migration] = await Promise.all([
    readFile(new URL("components/project-form.tsx", root), "utf8"),
    readFile(new URL("lib/validation.ts", root), "utf8"),
    readFile(new URL("app/api/projects/route.ts", root), "utf8"),
    readFile(
      new URL(
        "supabase/migrations/202607310003_project_submission_idempotency.sql",
        root,
      ),
      "utf8",
    ),
  ]);

  assert.match(form, /sessionStorage\.getItem\(SUBMISSION_KEY_STORAGE\)/);
  assert.match(form, /window\.crypto\.randomUUID\(\)/);
  assert.match(form, /if \(submittingRef\.current\) return/);
  assert.match(form, /submissionKey: getSubmissionKey\(\)/);
  assert.match(form, /clearSubmissionKey\(\);\s*router\.push/);
  assert.match(validation, /submissionKey: z\.uuid/);
  assert.match(route, /submission_key: parsed\.data\.submissionKey/);
  assert.match(migration, /create table public\.project_submission_keys/);
  assert.match(
    migration,
    /primary key \(owner_profile_id, submission_key\)/,
  );
  assert.match(migration, /enable row level security/);
  assert.match(
    migration,
    /revoke all on table public\.project_submission_keys from anon, authenticated/,
  );
  assert.match(
    migration,
    /on conflict \(owner_profile_id, submission_key\) do nothing/,
  );
  assert.match(migration, /return v_project_id/);
});

test("Project一覧は全ての並び替え条件をサーバー側で処理する", async () => {
  const projects = await readFile(new URL("lib/projects.ts", root), "utf8");

  assert.match(projects, /case "updated-asc"/);
  assert.match(projects, /case "beyond-desc"/);
  assert.match(projects, /case "continuation-desc"/);
  assert.match(projects, /return \[\.\.\.projects\]\.sort/);
});

test("Project検索Filterは狭い画面でControlをGrid内に収める", async () => {
  const styles = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(styles, /\.filter-panel > \* \{\s*min-width: 0;/);
  assert.match(
    styles,
    /\.filter-panel input,\s*\.filter-panel select \{[^}]*max-width: 100%;[^}]*min-width: 0;[^}]*width: 100%;/s,
  );
  assert.match(
    styles,
    /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\)/);
});

test("OAuthはPKCE callbackでセッションを交換する", async () => {
  const [form, callback, header] = await Promise.all([
    readFile(new URL("components/auth-form.tsx", root), "utf8"),
    readFile(new URL("app/auth/callback/route.ts", root), "utf8"),
    readFile(new URL("components/site-header.tsx", root), "utf8"),
  ]);

  assert.match(form, /provider: provider\.id/);
  assert.match(form, /github/);
  assert.match(form, /google/);
  assert.doesNotMatch(form, /apple/i);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /!value\.startsWith\("\/\/"\)/);
  assert.match(header, /supabase\.auth\.signOut\(\)/);
  assert.match(header, /ログアウト/);
  assert.match(header, /header-avatar/);
  assert.match(header, /プロフィールを開く/);
  assert.match(header, /user_metadata\?\.avatar_url/);
  assert.match(header, /url\.protocol === "https:"/);
  assert.doesNotMatch(header, /displayName/);
});

test("Supabase未接続のローカル環境はデモデータを使用する", async () => {
  const [exampleEnv, config] = await Promise.all([
    readFile(new URL(".env.example", root), "utf8"),
    readFile(new URL("lib/supabase-config.ts", root), "utf8"),
  ]);

  assert.match(exampleEnv, /^NEXT_PUBLIC_SUPABASE_URL=$/m);
  assert.match(exampleEnv, /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$/m);
  assert.match(config, /https:\/\/your-project\.supabase\.co/);
  assert.match(config, /sb_publishable_your_key/);
  assert.match(config, /return null/);
});

test("Supabase接続時も公開ProjectへサンプルProjectを追加する", async () => {
  const [projects, sampleData, detail, home, styles] = await Promise.all([
    readFile(new URL("lib/projects.ts", root), "utf8"),
    readFile(new URL("lib/sample-data.ts", root), "utf8"),
    readFile(new URL("app/projects/[projectId]/page.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(projects, /function mergeWithSampleProjects/);
  assert.match(
    projects,
    /mergeWithSampleProjects\(data\.map\(\(row\) => mapProject\(row\)\), sampleStates\)/,
  );
  assert.match(
    projects,
    /const sampleProject = sampleProjects\.find[\s\S]*state === "archived"[\s\S]*const client = publicClient\(\);/,
  );
  assert.match(projects, /project_continuations\(count\)/);
  assert.match(projects, /continuationCountRows\[0\]\?\.count/);
  assert.match(
    projects,
    /if \(isSampleProject\(projectId\)\)[\s\S]*sampleContinuations\.filter/,
  );
  assert.match(
    sampleData,
    /sampleProjectDefinitions: Array<Omit<Project, "continuationCount">>/,
  );
  assert.match(
    sampleData,
    /continuationCount: sampleContinuations\.filter\([\s\S]*sourceProjectId === project\.id/,
  );
  assert.match(detail, /const continuationCount = continuations\.length/);
  assert.match(detail, /<ProjectTabs continuationCount=\{continuationCount\}/);
  assert.match(home, /className="code-caret"/);
  assert.match(styles, /@keyframes code-caret-blink/);
});

test("初期表示では認証SDKと画像Componentを読み込まない", async () => {
  const [browserClient, home, styles] = await Promise.all([
    readFile(new URL("lib/supabase-browser.ts", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(browserClient, /import\("@supabase\/ssr"\)/);
  assert.doesNotMatch(browserClient, /^import .* from "@supabase\/ssr"/m);
  assert.doesNotMatch(home, /from "next\/image"/);
  assert.match(home, /concept-illustration concept-save/);
  assert.match(styles, /concept-flow-simple-v2\.webp/);
});

test("再現可能な開発環境と幅広い技術分類を保持する", async () => {
  const [schema, types, validation, options, layout] = await Promise.all([
    readFile(
      new URL("supabase/migrations/202607290001_initial_schema.sql", root),
      "utf8",
    ),
    readFile(new URL("lib/types.ts", root), "utf8"),
    readFile(new URL("lib/validation.ts", root), "utf8"),
    readFile(new URL("lib/technology-options.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  assert.match(schema, /runtime_requirements text not null/);
  assert.match(schema, /lockfile_status text not null/);
  assert.match(schema, /last_tested_commit/);
  assert.match(types, /LockfileStatus/);
  assert.match(validation, /installCommand/);
  assert.match(options, /Python/);
  assert.match(options, /C\+\+/);
  assert.match(options, /画像処理/);
  assert.match(options, /機械学習/);
  assert.match(options, /getTechnologyColor/);
  assert.match(layout, /@fontsource-variable\/mona-sans/);
});
