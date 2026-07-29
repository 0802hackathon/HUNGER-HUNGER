import type { Project, ProjectContinuation } from "./types";

export const sampleProjects: Project[] = [
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
    continuationCount: 4,
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
    continuationCount: 2,
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
    continuationCount: 1,
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
    status: "published",
    difficulty: "intermediate",
    recommendedSkillLevel: "beginner",
    licenseIdentifier: "MIT",
    usageTerms:
      "個人情報を含まないダミーデータでの学習利用を許可します。実在の大学名は使用しないでください。",
    technologies: ["Next.js", "Supabase", "Tailwind CSS"],
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
    continuationCount: 6,
    updatedAt: "2026-07-20T11:20:00.000Z",
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
];
