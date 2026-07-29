# HUNGER×HUNGER contribution guide

- UIのパロディ語は表示層だけで使い、DB・API・TypeScriptでは中立的な英語名を使う。
- 応募、承認、担当Task、Contributor採用フローを追加しない。
- `ProjectExploration` はビヨンド、`ProjectContinuation` はシュートを表す。
- 元Projectの `owner_profile_id` を学習者へ移さない。
- すべての書き込みをサーバー側で検証し、Supabase RLSも通す。
- Repositoryのコードや実行ファイルをサービス上で実行しない。
- 外部リンクはHTTPSに限定し、`target="_blank"` では `rel="noopener noreferrer"` を付ける。
- 変更後は `npm run lint`、`npm run typecheck`、`npm run build`、`npm test` を実行する。
