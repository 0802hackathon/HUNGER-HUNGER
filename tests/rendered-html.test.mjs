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
  assert.match(html, /ビヨンド/);
  assert.match(html, /シュート/);
  assert.doesNotMatch(html, /codex-preview|Starter Project/i);
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
  assert.match(html, /Study Streak/);
  assert.match(html, /使用技術/);
  assert.match(html, /危険度/);
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
});
