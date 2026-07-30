# HUNGER×HUNGER

開発を止めた人が残した未完成Projectと、実践的な題材を探す学習者をつなぐWebアプリです。ソースコードや所有権を譲渡するサービスではありません。元の投稿者が所有者のまま、学習者は公開GitHub RepositoryをForkまたはCloneして自由に学習します。

## 共同開発を始める

この章では、サイトの閲覧のために、各メンバーが自分のPCでローカル起動する方法を説明します。

Node.js 22.13以上が必要です。

```bash
git clone https://github.com/0802hackathon/HUNGER-HUNGER.git
cd HUNGER-HUNGER
npm install --global pnpm@11.9.0
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

`http://localhost:3000`を開きます。Supabase未接続でも、読み取り画面はデモ
データで確認できます。

変更は`main`へ直接Commitせず、Branchを作ってPull Requestで共有します。
詳しいBranch名、検証コマンド、セキュリティ上の注意は
[`CONTRIBUTING.md`](CONTRIBUTING.md)を確認してください。

## MVPの言葉

- **ビヨンド**: 学習者が公開Repositoryを開き、自分の環境で開発を始めること。応募・承認・担当Taskはありません。
- **シュート**: 追加開発したForkや成果Repositoryを、元Projectに関連付けて投稿すること。元Repositoryへのマージ承認を意味しません。
- 内部モデルでは中立的な英語名 `ProjectExploration` と `ProjectContinuation` を使用します。

## 技術構成

- Next.js App Router互換: Next.js 16 / Vinext
- TypeScript
- Tailwind CSS 4（ビルド基盤）とGitHubを参考にしたプロジェクト固有CSS
- Supabase Auth / PostgreSQL / Row Level Security
- Supabase Storage（`avatars`、`project-covers`）
- ZodによるAPI入力検証
- Cloudflare Workers / Sites向けVinextビルド

## ローカル起動

Node.js 22.13以上が必要です。

```bash
npm install --global pnpm@11.9.0
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

`http://localhost:3000` を開きます。Supabase環境変数が未設定の場合、読み取り画面はデモデータで動作し、書き込み操作は保存されません。

### 環境変数

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

読み取り画面だけを確認する場合、Supabaseの2項目は空のまま使用できます。
Supabaseへ接続する場合は実際のProject URLとPublishable Keyを設定してください。
Service Role Keyは使用せず、ブラウザとRoute Handlerの双方をRLSで保護します。

## Supabaseセットアップ

1. Supabaseで新しいProjectを作成します。
2. SQL EditorまたはSupabase CLIで `supabase/migrations/202607290001_initial_schema.sql` を適用します。
3. AuthenticationのEmail providerを有効化します。
4. Authentication → URL ConfigurationでSite URLを設定します。
5. Redirect URLに次を追加します。

```text
http://localhost:3000/auth/callback
https://hunger-hunger-mvp.shuta-akiyoshi.chatgpt.site/auth/callback
```

6. `.env.local` にProject URLとPublishable Keyを設定します。

### ログインProvider

ログイン画面は次の4方式に対応しています。

- GitHubアカウント
- Google
- Appleアカウント
- メールアドレスとパスワード

OAuth Providerを利用するには、Supabase DashboardのAuthentication → Sign In
/ Providersで各Providerを有効化します。外部Providerへ登録するCallback URLは、
Supabase Dashboardに表示される次の形式のURLです。

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

#### GitHub

1. GitHub Developer SettingsでOAuth Appを作成します。
2. Homepage URLに本番サイトURLを設定します。
3. Authorization callback URLにSupabaseのCallback URLを設定します。
4. Client IDとClient SecretをSupabaseのGitHub Providerへ登録します。

#### Google

1. Google Auth PlatformでWeb applicationのOAuth Clientを作成します。
2. Authorized JavaScript originsにローカルURLと本番サイトURLを追加します。
3. Authorized redirect URIsにSupabaseのCallback URLを設定します。
4. Client IDとClient SecretをSupabaseのGoogle Providerへ登録します。

#### Apple

1. Apple DeveloperでSign in with Apple対応のApp IDとServices IDを作成します。
2. Services IDのWebsite URLにSupabase ProjectのDomain、Return URLにSupabaseのCallback URLを設定します。
3. Team ID、Services ID、Signing Keyから作成したSecretをSupabaseのApple Providerへ登録します。
4. Apple OAuthのSecretは6か月ごとのローテーションが必要です。

現在のSitesデプロイは所有者限定です。外部ユーザーにこれらのログイン方法を提供する場合は、
Sitesのアクセス設定をPublicへ変更する必要があります。

Migrationは次を作成します。

- プロフィールと学習中・経験済みスキル
- Project、使用技術、実装済み機能、実装予定機能
- ビヨンド履歴、進捗、学習内容
- シュートされた成果
- 投稿者・学習者ごとのRLS
- 利用条件のスナップショット
- 画像用Storage bucketと所有者限定の書き込みPolicy

## コマンド

```bash
pnpm dev        # 開発サーバー
pnpm build      # Production build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript
pnpm test       # レンダリング・API・ドメインテスト
```

完全検証は次の順で実行します。

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## 主要画面

- `/`: コンセプトと注目Project
- `/projects`: キーワード・使用技術・学びたい技術・難易度で検索
- `/projects/[projectId]`: README形式のProject詳細、ビヨンド、シュート一覧
- `/projects/new`: 未完成Projectの投稿
- `/projects/[projectId]/continuations/new`: 成果のシュート
- `/login`: 新規登録・ログイン
- `/profile`: プロフィールとスキル
- `/dashboard`: ビヨンド進捗、学習内容、シュート、所有Projectの成果確認

## セキュリティと権利の方針

- 投稿者だけが自分のProjectを更新・アーカイブできます。物理削除は行いません。
- 学習者は自分のビヨンド履歴だけに進捗と学習内容を記録できます。
- Projectが公開中でない場合、新しいビヨンド・進捗・シュートを拒否します。
- 投稿時とシュート時に、権利・ライセンス・シークレット確認を必須にします。
- 外部URLはHTTPSかつ認証情報を含まない形式に限定します。
- MVPはRepository内容を取得・実行・スキャンせず、公開GitHub URLだけを案内します。
- ビヨンド時点のライセンスと利用条件を保存し、後日の変更と区別します。
- 学習者の成果のライセンスとポートフォリオ利用可否は、元Projectの条件と成果Repositoryの表示で確認します。

これらは法律判断ではなく、利用者が確認すべき事項をプロダクト上で明示するための設計です。

## MVP外

GitHub API自動連携、ZIP/ソースコード直接アップロード、オンライン実行、応募・承認、担当Task、通知、レビュー・評価、AI推薦は含みません。3日規模のMVPで、公開Repositoryの発見・学習開始・成果共有を検証するためです。

## ディレクトリ

```text
app/                    Pages / Route Handlers
components/             UIとClient Components
lib/                    型、検索、Supabase、入力検証
supabase/migrations/    PostgreSQL・RLS・Storage定義
tests/                  レンダリング・認可・ドメインテスト
worker/                 Sites向けWorker entry
```

## デザイン

GitHubの情報設計を参考に、暗色ヘッダー、Repository一覧風カード、README中心の詳細、Topicラベル、タブ、境界線主体の階層を採用しています。GitHubや既存作品のロゴ・画像・キャラクター・台詞・固有フォントは複製していません。
