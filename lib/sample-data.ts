import type { Project, ProjectContinuation } from "./types";

const sampleProjectDefinitions: Array<Omit<Project, "continuationCount">> = [
  {
    id: "study-streak",
    ownerId: "demo-owner-1",
    ownerName: "mugi_dev",
    title: "Study Streak",
    summary:
      "毎日の学習記録を小さな達成として積み上げる、習慣化支援アプリです。",
    motivation:
      "教材を買って満足してしまう自分のために、学習した事実を気軽に残せる場所を作り始めました。",
    abandonmentReason:
      "本業の繁忙期と認証まわりの設計変更が重なり、継続的な開発時間を確保できなくなりました。",
    currentState:
      "メール認証、学習記録の作成、7日分の履歴表示まで動作します。モバイル表示は一部調整が必要です。",
    knownLimitations:
      "タイムゾーンを跨ぐと連続日数がずれることがあります。E2Eテストは未導入です。",
    repositoryUrl: "https://github.com/vercel/next.js",
    runtimeRequirements: "Node.js 22.x",
    packageManager: "pnpm 10",
    installCommand: "pnpm install --frozen-lockfile",
    lockfileStatus: "committed",
    setupInstructions:
      ".env.exampleを.env.localへコピーしてSupabaseのURLと公開Keyを設定し、依存関係を導入後にpnpm devを実行します。",
    dependencyNotes:
      "pnpm-lock.yamlを基準にしてください。認証Packageを更新する場合はSupabase SSRとの互換性を先に確認してください。",
    testedEnvironment: "Windows 11 / macOS 15 / Node.js 22.13",
    defaultBranch: "main",
    lastTestedCommit: "a1b2c3d",
    status: "published",
    difficulty: "beginner",
    recommendedSkillLevel: "beginner",
    licenseIdentifier: "MIT",
    usageTerms:
      "学習目的のFork・改変・成果公開を許可します。元Projectへのリンクを記載してください。",
    technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    learnableTechnologies: ["認証", "RLS", "フォーム設計", "テスト"],
    implementedFeatures: [
      { id: "sf-1", title: "メールアドレス認証" },
      { id: "sf-2", title: "学習記録の追加・一覧表示" },
      { id: "sf-3", title: "7日間のストリーク表示" },
    ],
    plannedFeatures: [
      {
        id: "sp-1",
        title: "タイムゾーン対応",
        description: "ユーザー設定を基準に連続日数を計算したい。",
      },
      {
        id: "sp-2",
        title: "学習時間の可視化",
        description: "週・月ごとの推移をグラフで表示したい。",
      },
    ],
    beyondCount: 18,
    updatedAt: "2026-07-27T09:30:00.000Z",
  },
  {
    id: "meal-map",
    ownerId: "demo-owner-2",
    ownerName: "sora_codes",
    title: "Meal Map",
    summary:
      "冷蔵庫の食材と現在地から、作れそうな料理や買い足し先を提案するWebアプリです。",
    motivation:
      "一人暮らしで食材を余らせることが多く、手元の材料から次の行動を決められる体験を作りたくなりました。",
    abandonmentReason:
      "地図APIの料金設計とレシピデータの利用条件を整理しきれず、プロトタイプで停止しました。",
    currentState:
      "食材登録と簡易レシピ検索は動作します。地図はモックデータで表示しています。",
    knownLimitations:
      "検索語の表記揺れ、位置情報拒否時の導線、空状態の説明が不足しています。",
    repositoryUrl: "https://github.com/supabase/supabase",
    runtimeRequirements: "Node.js 20.x以上",
    packageManager: "npm 10",
    installCommand: "npm ci",
    lockfileStatus: "committed",
    setupInstructions:
      ".env.exampleを複製して地図APIの公開Keyを設定し、npm ciの後にnpm run devを実行します。",
    dependencyNotes:
      "package-lock.jsonを維持してください。地図SDKのMajor Versionを上げるとMarker APIの変更が必要です。",
    testedEnvironment: "Ubuntu 24.04 / Node.js 20.16",
    defaultBranch: "main",
    lastTestedCommit: "b2c3d4e",
    status: "published",
    difficulty: "intermediate",
    recommendedSkillLevel: "intermediate",
    licenseIdentifier: "Apache-2.0",
    usageTerms:
      "ライセンス表示を維持したFork・改変を許可します。外部APIの利用条件は各自で確認してください。",
    technologies: ["React", "TypeScript", "PostgreSQL", "Map API"],
    learnableTechnologies: ["位置情報", "検索設計", "PostgreSQL", "外部API"],
    implementedFeatures: [
      { id: "mf-1", title: "食材の登録" },
      { id: "mf-2", title: "レシピのキーワード検索" },
    ],
    plannedFeatures: [
      {
        id: "mp-1",
        title: "近隣店舗の表示",
        description: "不足食材を買える店舗を地図に表示したい。",
      },
      {
        id: "mp-2",
        title: "食材の期限通知",
        description: "期限が近い食材を優先して提案したい。",
      },
    ],
    beyondCount: 11,
    updatedAt: "2026-07-25T14:10:00.000Z",
  },
  {
    id: "voice-journal",
    ownerId: "demo-owner-3",
    ownerName: "kiri-lab",
    title: "Voice Journal",
    summary:
      "声で一日を振り返り、テキストと音声の両方を保存する日記アプリです。",
    motivation:
      "文章を書く余裕がない日でも、振り返りを続けられるようにしたかったためです。",
    abandonmentReason:
      "長時間録音とブラウザ互換性の調査が想定より難しく、別Projectを優先しました。",
    currentState:
      "録音、再生、短い音声のアップロードまで動作します。文字起こしは未接続です。",
    knownLimitations:
      "Safariで録音形式が異なります。大きなファイルの再送処理がありません。",
    repositoryUrl: "https://github.com/microsoft/TypeScript",
    runtimeRequirements: "Node.js 22.x / MediaRecorder対応ブラウザ",
    packageManager: "pnpm 10",
    installCommand: "pnpm install --frozen-lockfile",
    lockfileStatus: "committed",
    setupInstructions:
      "Storage Bucketを作成して環境変数を設定し、pnpm installの後にHTTPSの開発環境で起動します。",
    dependencyNotes:
      "録音CodecはOSとブラウザで異なります。音声処理Packageを追加する前にSafariでのBundleと再生を確認してください。",
    testedEnvironment: "macOS 15 Safari / Windows 11 Chrome",
    defaultBranch: "develop",
    lastTestedCommit: "c3d4e5f",
    status: "published",
    difficulty: "advanced",
    recommendedSkillLevel: "intermediate",
    licenseIdentifier: "MIT",
    usageTerms:
      "学習目的の利用・改変・公開を許可します。音声データには個人情報を含めないでください。",
    technologies: ["TypeScript", "Web Audio API", "Supabase Storage"],
    learnableTechnologies: ["音声処理", "Storage", "ブラウザ互換性"],
    implementedFeatures: [
      { id: "vf-1", title: "ブラウザ録音" },
      { id: "vf-2", title: "音声ファイルの保存・再生" },
    ],
    plannedFeatures: [
      {
        id: "vp-1",
        title: "文字起こし連携",
        description: "音声から検索可能な日記本文を生成したい。",
      },
      {
        id: "vp-2",
        title: "レジュームアップロード",
        description: "通信が切れても再開できるようにしたい。",
      },
    ],
    beyondCount: 7,
    updatedAt: "2026-07-22T06:45:00.000Z",
  },
  {
    id: "campus-lost-found",
    ownerId: "demo-owner-4",
    ownerName: "nami",
    title: "Campus Lost & Found",
    summary:
      "大学内の落とし物を、場所・日時・特徴から探せる掲示板です。",
    motivation:
      "紙の掲示とSNS投稿に情報が分散し、持ち主へ届きにくい状況を改善したかったためです。",
    abandonmentReason:
      "卒業制作の期間終了後、運用主体とモデレーション方針を決められませんでした。",
    currentState:
      "投稿、画像表示、カテゴリ検索まで実装済みです。管理機能はありません。",
    knownLimitations:
      "不適切投稿の通報・非表示、投稿期限、大学ごとのデータ分離が未実装です。",
    repositoryUrl: "https://github.com/tailwindlabs/tailwindcss",
    runtimeRequirements: "Node.js 20.x以上",
    packageManager: "npm 10",
    installCommand: "npm ci",
    lockfileStatus: "committed",
    setupInstructions:
      ".env.exampleから環境変数を作成し、Supabase Migration適用後にnpm run devで起動します。",
    dependencyNotes:
      "画像処理Libraryは現在のVersionに固定しています。Package更新後はアップロードとThumbnail生成を再確認してください。",
    testedEnvironment: "Windows 11 / Ubuntu 24.04 / Node.js 20.15",
    defaultBranch: "main",
    lastTestedCommit: "d4e5f6a",
    status: "published",
    difficulty: "intermediate",
    recommendedSkillLevel: "beginner",
    licenseIdentifier: "MIT",
    usageTerms:
      "個人情報を含まないダミーデータでの学習利用を許可します。実在の大学名は使用しないでください。",
    technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    learnableTechnologies: ["画像アップロード", "検索UI", "モデレーション"],
    implementedFeatures: [
      { id: "cf-1", title: "落とし物投稿" },
      { id: "cf-2", title: "カテゴリ・場所検索" },
      { id: "cf-3", title: "画像アップロード" },
    ],
    plannedFeatures: [
      {
        id: "cp-1",
        title: "通報・非表示",
        description: "不適切な投稿を利用者が報告できるようにしたい。",
      },
      {
        id: "cp-2",
        title: "自動アーカイブ",
        description: "一定期間後に投稿を参照専用へ移したい。",
      },
    ],
    beyondCount: 23,
    updatedAt: "2026-07-20T11:20:00.000Z",
  },
  {
    id: "accessible-reader",
    ownerId: "demo-owner-5",
    ownerName: "yui_frontend",
    title: "Accessible Reader",
    summary:
      "読みやすい配色・文字サイズ・行間を選び、設定を共有できる文章ビューアです。",
    motivation:
      "長い技術記事を読むと目が疲れるため、自分に合う表示へすぐ切り替えられる道具を作り始めました。",
    abandonmentReason:
      "基本的な表示設定を実装した後、キーボード操作と読み上げ対応の設計で手が止まりました。",
    currentState:
      "文章の貼り付け、テーマ切り替え、文字サイズと行間の保存まで動作します。",
    knownLimitations:
      "フォーカス移動の順序とスクリーンリーダーでの案内は未検証です。設定の共有URLも未実装です。",
    repositoryUrl: "https://github.com/facebook/react",
    runtimeRequirements: "Node.js 22.x / モダンブラウザ",
    packageManager: "npm 10",
    installCommand: "npm ci",
    lockfileStatus: "committed",
    setupInstructions:
      "依存関係を導入してnpm run devを実行します。外部サービスの設定は不要です。",
    dependencyNotes:
      "CSSの相対単位を維持してください。UI Library更新時はKeyboard操作を再確認してください。",
    testedEnvironment: "Windows 11 NVDA / macOS 15 VoiceOver",
    defaultBranch: "main",
    lastTestedCommit: "e5f6a7b",
    status: "published",
    difficulty: "beginner",
    recommendedSkillLevel: "beginner",
    licenseIdentifier: "MIT",
    usageTerms:
      "学習目的のFork・改変・成果公開を許可します。検証時は個人情報を含まない文章を使用してください。",
    technologies: ["React", "TypeScript", "CSS"],
    learnableTechnologies: [
      "アクセシビリティ",
      "レスポンシブUI",
      "フロントエンド",
    ],
    implementedFeatures: [
      { id: "arf-1", title: "表示テーマの切り替え" },
      { id: "arf-2", title: "文字サイズと行間の保存" },
    ],
    plannedFeatures: [
      {
        id: "arp-1",
        title: "キーボード操作の改善",
        description: "すべての設定をキーボードだけで変更できるようにしたい。",
      },
      {
        id: "arp-2",
        title: "設定の共有",
        description: "表示設定をURLで共有できるようにしたい。",
      },
    ],
    beyondCount: 29,
    updatedAt: "2026-07-31T02:15:00.000Z",
  },
  {
    id: "realtime-study-room",
    ownerId: "demo-owner-6",
    ownerName: "toma_realtime",
    title: "Realtime Study Room",
    summary:
      "同じ時間に勉強している人の集中状況を、リアルタイムに共有するオンライン自習室です。",
    motivation:
      "一人で勉強すると中断しやすく、会話を強制せずに誰かの存在を感じられる場所が欲しかったためです。",
    abandonmentReason:
      "再接続時の状態同期と、長時間接続した際の負荷対策を整理しきれませんでした。",
    currentState:
      "ルーム作成、集中タイマー、参加者のオンライン表示まで実装済みです。",
    knownLimitations:
      "複数タブを開くと参加人数が重複します。切断後のタイマー復元にずれがあります。",
    repositoryUrl: "https://github.com/sveltejs/svelte",
    runtimeRequirements: "Node.js 22.x / WebSocket対応ブラウザ",
    packageManager: "pnpm 10",
    installCommand: "pnpm install --frozen-lockfile",
    lockfileStatus: "committed",
    setupInstructions:
      "SupabaseのRealtimeを有効にして公開Keyを設定し、pnpm devで起動します。",
    dependencyNotes:
      "Realtime Channelの購読解除を維持してください。接続数を増やす前に負荷試験が必要です。",
    testedEnvironment: "Ubuntu 24.04 / Node.js 22.14 / Chrome",
    defaultBranch: "main",
    lastTestedCommit: "f6a7b8c",
    status: "published",
    difficulty: "intermediate",
    recommendedSkillLevel: "intermediate",
    licenseIdentifier: "MIT",
    usageTerms:
      "学習目的のFork・改変を許可します。公開環境では利用中のサービス規約を確認してください。",
    technologies: ["Svelte", "TypeScript", "Supabase", "WebSocket"],
    learnableTechnologies: ["WebSocket", "認可・RLS", "テスト"],
    implementedFeatures: [
      { id: "rsf-1", title: "集中ルームの作成" },
      { id: "rsf-2", title: "参加状態のリアルタイム同期" },
    ],
    plannedFeatures: [
      {
        id: "rsp-1",
        title: "再接続時の状態復元",
        description: "一時的な切断後も同じタイマーへ戻れるようにしたい。",
      },
      {
        id: "rsp-2",
        title: "プレゼンスの重複排除",
        description: "同じ利用者の複数タブを一人として数えたい。",
      },
    ],
    beyondCount: 14,
    updatedAt: "2026-07-29T16:40:00.000Z",
  },
  {
    id: "receipt-lens",
    ownerId: "demo-owner-7",
    ownerName: "haru_ml",
    title: "Receipt Lens",
    summary:
      "レシート画像から品目と金額を読み取り、支出カテゴリの候補を提示する家計入力支援ツールです。",
    motivation:
      "家計簿への手入力を減らし、画像処理と機械学習を実際の題材で学びたかったためです。",
    abandonmentReason:
      "店舗ごとに異なるレイアウトへの対応と、学習データの匿名化に時間を割けなくなりました。",
    currentState:
      "画像の傾き補正、文字領域の検出、合計金額の候補表示まで動作します。",
    knownLimitations:
      "手書き文字と感熱紙の薄い印字には対応できません。カテゴリ推定は少量のダミーデータのみで学習しています。",
    repositoryUrl: "https://github.com/opencv/opencv",
    runtimeRequirements: "Python 3.13 / Docker 27",
    packageManager: "uv 0.8",
    installCommand: "uv sync --frozen",
    lockfileStatus: "committed",
    setupInstructions:
      "uv syncの後にサンプル画像を配置し、uv run fastapi devでAPIを起動します。",
    dependencyNotes:
      "OpenCVとPyTorchの組み合わせはLockfileに固定しています。CPU環境では推論に時間がかかります。",
    testedEnvironment: "Ubuntu 24.04 / Python 3.13 / CPU推論",
    defaultBranch: "main",
    lastTestedCommit: "0a7b8c9",
    status: "published",
    difficulty: "advanced",
    recommendedSkillLevel: "advanced",
    licenseIdentifier: "Apache-2.0",
    usageTerms:
      "匿名化した画像での学習利用・改変を許可します。実在する個人の購入情報を公開しないでください。",
    technologies: ["Python", "FastAPI", "OpenCV", "PyTorch", "Docker"],
    learnableTechnologies: ["画像処理", "機械学習", "API設計"],
    implementedFeatures: [
      { id: "rlf-1", title: "レシート画像の傾き補正" },
      { id: "rlf-2", title: "文字領域と合計金額の抽出" },
    ],
    plannedFeatures: [
      {
        id: "rlp-1",
        title: "品目カテゴリの推定",
        description: "品目名から支出カテゴリを提案したい。",
      },
      {
        id: "rlp-2",
        title: "匿名化パイプライン",
        description: "店舗名や決済情報を学習前に除去したい。",
      },
    ],
    beyondCount: 36,
    updatedAt: "2026-07-18T04:25:00.000Z",
  },
  {
    id: "sensor-garden",
    ownerId: "demo-owner-8",
    ownerName: "ao_embedded",
    title: "Sensor Garden",
    summary:
      "温度・湿度・土壌水分を記録し、植物ごとの水やり目安を表示する小型IoTシステムです。",
    motivation:
      "旅行中に植物の状態を確認したくて、組み込み開発から可視化まで一通り試し始めました。",
    abandonmentReason:
      "センサーの個体差を補正する仕組みと、電池駆動の省電力化を両立できませんでした。",
    currentState:
      "3種類のセンサー値を収集し、ローカルネットワーク上の画面へ表示できます。",
    knownLimitations:
      "センサー値の校正は手動です。通信断中のデータ再送と遠隔更新は未実装です。",
    repositoryUrl: "https://github.com/rust-lang/rust",
    runtimeRequirements: "Rust 1.88 / ESP32-C3 / Docker 27",
    packageManager: "Cargo",
    installCommand: "cargo fetch --locked",
    lockfileStatus: "committed",
    setupInstructions:
      "開発ボードをUSB接続してFirmwareを書き込み、Docker Composeで受信APIを起動します。",
    dependencyNotes:
      "Board Support PackageのVersionを固定しています。異なる基板へ書き込まないでください。",
    testedEnvironment: "ESP32-C3 / Fedora 42 / Rust 1.88",
    defaultBranch: "prototype",
    lastTestedCommit: "1b8c9d0",
    status: "published",
    difficulty: "expert",
    recommendedSkillLevel: "advanced",
    licenseIdentifier: "MIT",
    usageTerms:
      "学習目的のFork・回路変更を許可します。実機作業時は使用する部品の定格を確認してください。",
    technologies: ["Rust", "C", "SQLite", "Docker"],
    learnableTechnologies: ["IoT", "組み込み開発", "データ可視化"],
    implementedFeatures: [
      { id: "sgf-1", title: "センサー値の定期収集" },
      { id: "sgf-2", title: "ローカルDashboard表示" },
    ],
    plannedFeatures: [
      {
        id: "sgp-1",
        title: "センサーの自動校正",
        description: "基準値から個体差を補正できるようにしたい。",
      },
      {
        id: "sgp-2",
        title: "オフラインQueue",
        description: "通信復旧後に未送信データを再送したい。",
      },
    ],
    beyondCount: 9,
    updatedAt: "2026-06-30T10:05:00.000Z",
  },
  {
    id: "pocket-budget",
    ownerId: "demo-owner-9",
    ownerName: "mio_mobile",
    title: "Pocket Budget",
    summary:
      "通信できない場所でも支出を記録し、月ごとの予算残高を確認できるモバイルアプリです。",
    motivation:
      "支出を思い出して後から入力する習慣を変えるため、素早く起動するアプリを作りました。",
    abandonmentReason:
      "端末間同期より先にローカルデータの移行設計が必要だと分かり、開発を中断しました。",
    currentState:
      "支出の追加・編集、月予算の設定、カテゴリ別の円グラフまで動作します。",
    knownLimitations:
      "データのExportとBackupがありません。端末の言語によって金額表示が崩れる場合があります。",
    repositoryUrl: "https://github.com/flutter/flutter",
    runtimeRequirements: "Flutter 3.32 / Dart 3.8",
    packageManager: "pub",
    installCommand: "flutter pub get",
    lockfileStatus: "committed",
    setupInstructions:
      "Flutter SDKを用意して依存関係を導入し、Android EmulatorまたはiOS Simulatorで起動します。",
    dependencyNotes:
      "SQLite Schemaを変更する場合はMigration番号を追加し、既存データからの更新を確認してください。",
    testedEnvironment: "Android 15 / iOS 18 / Flutter 3.32",
    defaultBranch: "main",
    lastTestedCommit: "2c9d0e1",
    status: "published",
    difficulty: "beginner",
    recommendedSkillLevel: "beginner",
    licenseIdentifier: "BSD-3-Clause",
    usageTerms:
      "学習目的のFork・改変・成果公開を許可します。実データを使う場合は端末の保護を有効にしてください。",
    technologies: ["Dart", "Flutter", "SQLite"],
    learnableTechnologies: ["データベース設計", "データ可視化", "テスト"],
    implementedFeatures: [
      { id: "pbf-1", title: "オフライン支出記録" },
      { id: "pbf-2", title: "月予算とカテゴリ集計" },
    ],
    plannedFeatures: [
      {
        id: "pbp-1",
        title: "暗号化Backup",
        description: "端末変更時に安全にデータを移せるようにしたい。",
      },
      {
        id: "pbp-2",
        title: "通貨表示の改善",
        description: "Localeに合わせて金額を表示したい。",
      },
    ],
    beyondCount: 4,
    updatedAt: "2026-06-12T08:50:00.000Z",
  },
  {
    id: "api-observatory",
    ownerId: "demo-owner-10",
    ownerName: "kei_backend",
    title: "API Observatory",
    summary:
      "複数APIの応答時間とStatusを定期観測し、異常の兆候をDashboardにまとめる監視ツールです。",
    motivation:
      "個人開発のAPI障害に利用者からの連絡で気づいた経験から、小さく運用できる監視基盤を作り始めました。",
    abandonmentReason:
      "通知の重複抑制と大量Endpointを監視するScheduler設計が複雑になりました。",
    currentState:
      "HTTP Checkの登録、定期実行、24時間分の応答時間グラフまで実装済みです。",
    knownLimitations:
      "同一障害で通知が複数回送られます。Workerを複数起動するとCheckが重複します。",
    repositoryUrl: "https://github.com/golang/go",
    runtimeRequirements: "Go 1.24 / PostgreSQL 17 / Redis 8",
    packageManager: "Go modules",
    installCommand: "go mod download",
    lockfileStatus: "committed",
    setupInstructions:
      "Docker ComposeでPostgreSQLとRedisを起動し、go run ./cmd/serverを実行します。",
    dependencyNotes:
      "Migration適用前にDatabaseのBackupを取得してください。Redisの永続化は開発環境で無効です。",
    testedEnvironment: "Ubuntu 24.04 / Go 1.24 / Docker 27",
    defaultBranch: "main",
    lastTestedCommit: "3d0e1f2",
    status: "published",
    difficulty: "intermediate",
    recommendedSkillLevel: "intermediate",
    licenseIdentifier: "Apache-2.0",
    usageTerms:
      "学習目的のFork・改変を許可します。第三者のEndpointを無断で高頻度に監視しないでください。",
    technologies: ["Go", "PostgreSQL", "Redis", "Docker"],
    learnableTechnologies: ["バックエンド", "API設計", "パフォーマンス"],
    implementedFeatures: [
      { id: "aof-1", title: "HTTP Checkの定期実行" },
      { id: "aof-2", title: "応答時間の可視化" },
    ],
    plannedFeatures: [
      {
        id: "aop-1",
        title: "通知の重複抑制",
        description: "同じ障害中は一度だけ通知したい。",
      },
      {
        id: "aop-2",
        title: "分散Scheduler",
        description: "複数WorkerでCheckを重複なく分担したい。",
      },
    ],
    beyondCount: 20,
    updatedAt: "2026-05-24T13:35:00.000Z",
  },
  {
    id: "subtitle-studio",
    ownerId: "demo-owner-11",
    ownerName: "rin_media",
    title: "Subtitle Studio",
    summary:
      "短い動画の音声から字幕候補を作成し、時間位置と文章をブラウザで編集するツールです。",
    motivation:
      "勉強会動画へ字幕を付ける作業を減らし、音声処理と編集UIを組み合わせてみたかったためです。",
    abandonmentReason:
      "長い動画の分割処理と、話者が重なった場面の文字起こし精度を改善できませんでした。",
    currentState:
      "動画Upload、音声抽出、字幕候補の生成とタイムライン編集まで動作します。",
    knownLimitations:
      "10分を超える動画は処理できません。字幕のExportはWebVTT形式だけに対応しています。",
    repositoryUrl: "https://github.com/fastapi/fastapi",
    runtimeRequirements: "Node.js 22.x / Python 3.13 / FFmpeg 7",
    packageManager: "pnpm 10 / uv 0.8",
    installCommand: "pnpm install --frozen-lockfile && uv sync --frozen",
    lockfileStatus: "committed",
    setupInstructions:
      "FrontendとAPIの依存関係を導入し、FFmpegのPathを設定して両方の開発Serverを起動します。",
    dependencyNotes:
      "音声モデルは初回起動時に取得されます。モデルのLicenseと必要容量を事前に確認してください。",
    testedEnvironment: "macOS 15 / Python 3.13 / Node.js 22.14",
    defaultBranch: "develop",
    lastTestedCommit: "4e1f2a3",
    status: "published",
    difficulty: "advanced",
    recommendedSkillLevel: "advanced",
    licenseIdentifier: "MIT",
    usageTerms:
      "権利を持つ動画での学習利用・改変を許可します。第三者の音声や映像を無断で使用しないでください。",
    technologies: ["TypeScript", "React", "Python", "FastAPI"],
    learnableTechnologies: ["音声処理", "動画処理", "自然言語処理"],
    implementedFeatures: [
      { id: "ssf-1", title: "動画からの音声抽出" },
      { id: "ssf-2", title: "字幕タイムライン編集" },
    ],
    plannedFeatures: [
      {
        id: "ssp-1",
        title: "長時間動画の分割処理",
        description: "一定時間ごとにJobを分けて処理したい。",
      },
      {
        id: "ssp-2",
        title: "字幕形式の追加",
        description: "SRT形式でも字幕を書き出せるようにしたい。",
      },
    ],
    beyondCount: 42,
    updatedAt: "2026-04-08T07:10:00.000Z",
  },
  {
    id: "city-temperature-atlas",
    ownerId: "demo-owner-12",
    ownerName: "saki_data",
    title: "City Temperature Atlas",
    summary:
      "公開気象データから都市ごとの気温変化を集計し、地図とグラフで比較する分析サイトです。",
    motivation:
      "表形式の公開データを、地域差や長期変化が直感的に分かる形へ変換したかったためです。",
    abandonmentReason:
      "欠損値の扱いと観測地点の変更履歴を反映するデータPipelineを完成できませんでした。",
    currentState:
      "CSV取込、月別集計、3都市の折れ線グラフと地図表示まで動作します。",
    knownLimitations:
      "観測地点が移転した年を区別していません。大きなCSVの取込には数分かかります。",
    repositoryUrl: "https://github.com/pandas-dev/pandas",
    runtimeRequirements: "Python 3.13 / R 4.5 / PostgreSQL 17",
    packageManager: "uv 0.8 / renv",
    installCommand: "uv sync --frozen && Rscript -e 'renv::restore()'",
    lockfileStatus: "committed",
    setupInstructions:
      "公開サンプルCSVをdataディレクトリへ配置し、分析Batchの後にWeb Serverを起動します。",
    dependencyNotes:
      "元データのSchema変更に備えて取込処理を分離しています。分析結果にはデータ出典を残してください。",
    testedEnvironment: "Ubuntu 24.04 / Python 3.13 / R 4.5",
    defaultBranch: "main",
    lastTestedCommit: "5f2a3b4",
    status: "published",
    difficulty: "expert",
    recommendedSkillLevel: "advanced",
    licenseIdentifier: "BSD-3-Clause",
    usageTerms:
      "出典を明記した学習利用・改変・成果公開を許可します。公開データ提供元の規約も確認してください。",
    technologies: ["Python", "R", "PostgreSQL", "Google Cloud"],
    learnableTechnologies: ["データ分析", "データ可視化", "クラウド"],
    implementedFeatures: [
      { id: "ctf-1", title: "公開CSVの取込と月別集計" },
      { id: "ctf-2", title: "都市別グラフと地図表示" },
    ],
    plannedFeatures: [
      {
        id: "ctp-1",
        title: "観測地点履歴の反映",
        description: "地点の移転前後を別系列として扱いたい。",
      },
      {
        id: "ctp-2",
        title: "取込処理の高速化",
        description: "大きなCSVを分割して並列処理したい。",
      },
    ],
    beyondCount: 2,
    updatedAt: "2026-02-14T01:30:00.000Z",
  },
];

export const sampleContinuations: ProjectContinuation[] = [
  {
    id: "shoot-1",
    sourceProjectId: "study-streak",
    authorId: "demo-learner-1",
    authorName: "aya_learns",
    title: "ストリーク計算をタイムゾーン対応",
    summary: "日付境界をユーザー設定で扱えるように修正しました。",
    changesMade:
      "UTC固定だった集計関数を分離し、Asia/TokyoとAmerica/New_Yorkのテストを追加しました。",
    repositoryUrl: "https://github.com/vercel/next.js",
    pullRequestUrl: "https://github.com/vercel/next.js/pulls",
    learningOutcome:
      "日時処理では保存形式と表示形式を分ける必要があることを学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-28T08:00:00.000Z",
  },
  {
    id: "shoot-2",
    sourceProjectId: "study-streak",
    authorId: "demo-learner-2",
    authorName: "ren_builds",
    title: "Playwrightで主要フローをテスト",
    summary: "登録から学習記録作成までのE2Eテストを追加しました。",
    changesMade:
      "認証済みStorage Stateを使い、正常系と必須入力エラーの2シナリオを実装しました。",
    repositoryUrl: "https://github.com/vercel/next.js",
    learningOutcome:
      "UIの文言よりdata-testidの方が変更に強いことを実感しました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-26T12:30:00.000Z",
  },
  {
    id: "shoot-3",
    sourceProjectId: "study-streak",
    authorId: "demo-learner-3",
    authorName: "natsu_codes",
    title: "学習記録フォームのモバイル表示を改善",
    summary: "狭い画面でも入力欄と送信Buttonが重ならないように調整しました。",
    changesMade:
      "フォームを一列Layoutへ切り替えるBreakpointを追加し、Keyboard表示中の操作を確認しました。",
    repositoryUrl: "https://github.com/vercel/next.js",
    learningOutcome:
      "入力画面はViewportだけでなくSoftware Keyboard表示時にも確認する必要があると学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-24T10:15:00.000Z",
  },
  {
    id: "shoot-4",
    sourceProjectId: "meal-map",
    authorId: "demo-learner-4",
    authorName: "mio_kitchen",
    title: "食材の期限からレシピ候補を並び替え",
    summary: "期限が近い食材を優先してレシピ候補へ表示するように改善しました。",
    changesMade:
      "食材の期限と使用量から優先度を計算する関数を追加し、期限未設定の場合を含むUnit Testを実装しました。",
    repositoryUrl: "https://github.com/supabase/supabase",
    learningOutcome:
      "欠損値を含むデータでは、並び替えの基準と同順位時の扱いを先に決めることが重要だと学びました。",
    licenseIdentifier: "Apache-2.0",
    publishedAt: "2026-07-24T07:20:00.000Z",
  },
  {
    id: "shoot-5",
    sourceProjectId: "meal-map",
    authorId: "demo-learner-5",
    authorName: "kei_maps",
    title: "位置情報を拒否した場合の検索導線を追加",
    summary: "現在地を共有しなくても地域名から店舗を検索できる画面を追加しました。",
    changesMade:
      "位置情報の権限状態を判定し、拒否時は地域名入力へ切り替える処理と入力エラー表示を実装しました。",
    repositoryUrl: "https://github.com/supabase/supabase",
    learningOutcome:
      "ブラウザ権限は許可される前提にせず、拒否後も主要機能を使える代替導線が必要だと学びました。",
    licenseIdentifier: "Apache-2.0",
    publishedAt: "2026-07-22T13:40:00.000Z",
  },
  {
    id: "shoot-6",
    sourceProjectId: "voice-journal",
    authorId: "demo-learner-6",
    authorName: "riku_audio",
    title: "Safari向けの録音形式判定を追加",
    summary: "利用可能な音声形式を確認してから録音を開始するように修正しました。",
    changesMade:
      "MediaRecorderの対応形式を順番に検査し、選択したMIME Typeを保存処理へ渡す実装とブラウザ別テストを追加しました。",
    repositoryUrl: "https://github.com/microsoft/TypeScript",
    learningOutcome:
      "Web APIの存在だけで対応可否を判断せず、入力形式まで実行環境ごとに確認する必要があると学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-21T09:10:00.000Z",
  },
  {
    id: "shoot-7",
    sourceProjectId: "voice-journal",
    authorId: "demo-learner-7",
    authorName: "sena_uploads",
    title: "音声アップロードの再試行を実装",
    summary: "通信が中断した音声を再送できるQueueと状態表示を追加しました。",
    changesMade:
      "失敗したUploadをIndexedDBへ一時保存し、接続復帰後に再試行する処理と重複送信を防ぐ識別子を実装しました。",
    repositoryUrl: "https://github.com/microsoft/TypeScript",
    learningOutcome:
      "大きなデータの再送では、再試行回数だけでなく重複保存を防ぐ設計も必要だと学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-18T15:30:00.000Z",
  },
  {
    id: "shoot-8",
    sourceProjectId: "accessible-reader",
    authorId: "demo-learner-8",
    authorName: "hina_a11y",
    title: "キーボードだけで表示設定を変更",
    summary: "すべての表示設定をキーボードで操作できるように改善しました。",
    changesMade:
      "設定項目のFocus順序を整理し、Arrow Keyで値を変更できるControlと操作方法の読み上げを追加しました。",
    repositoryUrl: "https://github.com/facebook/react",
    learningOutcome:
      "見た目のFocus表示だけでなく、移動順序と読み上げ内容を一緒に検証する重要性を学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-30T05:45:00.000Z",
  },
  {
    id: "shoot-9",
    sourceProjectId: "accessible-reader",
    authorId: "demo-learner-9",
    authorName: "yuto_frontend",
    title: "読みやすさ設定の共有URLを追加",
    summary: "配色、文字サイズ、行間の設定をURLで共有できるようにしました。",
    changesMade:
      "表示設定を短いQuery Parameterへ変換し、不正な値を既定値へ戻すValidationと共有Buttonを実装しました。",
    repositoryUrl: "https://github.com/facebook/react",
    learningOutcome:
      "共有URLの入力値は信頼せず、許可する値を限定して復元する必要があると学びました。",
    licenseIdentifier: "MIT",
    publishedAt: "2026-07-29T11:25:00.000Z",
  },
];

export const sampleProjects: Project[] = sampleProjectDefinitions.map(
  (project) => ({
    ...project,
    continuationCount: sampleContinuations.filter(
      (continuation) => continuation.sourceProjectId === project.id,
    ).length,
  }),
);
