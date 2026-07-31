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
