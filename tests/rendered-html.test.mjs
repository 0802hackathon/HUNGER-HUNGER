import assert from "node:assert/strict";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

function env() {
  return {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
}

function context() {
  return {
    waitUntil() {},
    passThroughOnException() {},
  };
}

test("ホームが製品コンセプトと主要導線をサーバーレンダリングする", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    env(),
    context(),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /HUNGER/);
  assert.match(html, /未完成のコードを/);
  assert.match(html, /未完成の構想と、実践的な題材を探すためのプラットフォーム/);
  assert.match(html, /ビヨンド/);
  assert.match(html, /シュート/);
  assert.match(html, /hunger explore --tech typescript/);
  assert.match(html, /Repositoryを開きました/);
  assert.match(html, /terminal-dot red/);
  assert.match(html, /ACTIVE PROJECTS/);
  assert.match(html, /公開Project/);
  assert.match(html, /技術から探す/);
  assert.match(html, /concept-flow-simple-v2\.png/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /応募も承認もなく|応募・承認なし/);
  assert.doesNotMatch(html, /Starter Project/i);
});

test("Project一覧が検索UIとデモProjectを表示する", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/projects", {
      headers: { accept: "text/html" },
    }),
    env(),
    context(),
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Projectを探す/);
  assert.match(html, /未完成のコードから、次の学びを見つけましょう/);
  assert.match(html, /Study Streak/);
  assert.match(html, /使用技術/);
  assert.match(html, /Python/);
  assert.match(html, /画像処理/);
  assert.match(html, /危険度/);
});

test("Project詳細が開発環境と依存関係を表示する", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/projects/study-streak", {
      headers: { accept: "text/html" },
    }),
    env(),
    context(),
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /開発環境と依存関係/);
  assert.match(html, /Node\.js 22\.x/);
  assert.match(html, /pnpm install --frozen-lockfile/);
  assert.match(html, /RepositoryにCommit済み/);
  assert.doesNotMatch(
    html,
    /応募や承認はありません。自分の環境で開発を始めます/,
  );
});

test("未認証の投稿APIを拒否する", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    }),
    env(),
    context(),
  );

  assert.equal(response.status, 401);
});

test("ログイン画面が4つの認証方法を表示する", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/login", {
      headers: { accept: "text/html" },
    }),
    env(),
    context(),
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /GitHubアカウントでログイン/);
  assert.match(html, /Googleでログイン/);
  assert.match(html, /Appleアカウントでログイン/);
  assert.match(html, /その他メールアドレスでログイン/);
  assert.doesNotMatch(html, /CONTINUE THE UNFINISHED|ビヨンド履歴を残す/);
  assert.doesNotMatch(html, /各認証Providerから共有される基本プロフィール情報/);
});
