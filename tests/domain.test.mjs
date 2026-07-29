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
  assert.match(home, /応募も承認もなく/);
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
  const validation = await readFile(new URL("lib/validation.ts", root), "utf8");
  assert.match(validation, /protocol === "https:"/);
  assert.match(validation, /!url\.username && !url\.password/);
  assert.match(validation, /hostname === "github\.com"/);
});

test("OAuthはPKCE callbackでセッションを交換する", async () => {
  const [form, callback] = await Promise.all([
    readFile(new URL("components/auth-form.tsx", root), "utf8"),
    readFile(new URL("app/auth/callback/route.ts", root), "utf8"),
  ]);

  assert.match(form, /provider: provider\.id/);
  assert.match(form, /github/);
  assert.match(form, /google/);
  assert.match(form, /apple/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /!value\.startsWith\("\/\/"\)/);
});
