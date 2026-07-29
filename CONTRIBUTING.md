# HUNGER×HUNGERへの参加

このRepositoryでは、`main` へ直接Commitせず、短いBranchを作ってPull
Requestで変更を共有します。

## 1. 開発環境を準備する

必要なもの:

- Git
- Node.js 22.13以上（`.nvmrc`は22.13.0）
- Corepack

```bash
git clone https://github.com/0802hackathon/HUNGER-HUNGER.git
cd HUNGER-HUNGER
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

`http://localhost:3000` を開いてください。Supabaseの値を設定しなくても、
読み取り画面はデモデータで確認できます。投稿・ログインなどの書き込み機能を
確認する場合は、管理者から開発用Supabaseの接続情報を受け取ってください。

## 2. Branchを作る

最新の`main`から、目的が分かる名前でBranchを作ります。

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description
```

推奨Prefix:

- `feat/`: 新機能
- `fix/`: 不具合修正
- `docs/`: ドキュメント
- `refactor/`: 振る舞いを変えない整理
- `test/`: テスト

1つのPull Requestには、原則として1つの目的だけを含めてください。

## 3. 実装時のルール

- UIのパロディ語は画面表示だけで使い、型・API・DBには中立的な英語名を使う。
- 応募、承認、担当Task、Contributor採用フローを追加しない。
- 元Projectの所有者を学習者へ移さない。
- 入力値はRoute Handlerで検証し、Supabase RLSでも認可する。
- Repositoryのコードや実行ファイルをサービス上で実行しない。
- 外部URLはHTTPSに限定する。
- `.env.local`、API Key、Token、個人情報をCommitしない。
- Dependencyを変更した場合は`pnpm-lock.yaml`も同じPull Requestへ含める。
- `package-lock.json`を単独で更新しない。Package Managerは`pnpm`を基準とする。

詳しいプロダクト上の制約は`AGENTS.md`も確認してください。

## 4. Pull Request前に確認する

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

4つすべてが成功し、変更した画面をブラウザで確認してからPull Requestを
作成してください。UI変更では、変更前後が分かるScreenshotを添付してください。

## 5. Pull Requestを作る

```bash
git push -u origin feat/short-description
```

GitHubでPull Requestを作り、テンプレートの確認項目を埋めます。CIが成功し、
少なくとも1人の開発メンバーが確認してからMergeしてください。
