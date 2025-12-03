# Player Review - NBA選手レビューサイト

NBA選手への評価や応援メッセージを自由に投稿・閲覧できるファンコミュニティサイト

## 🌟 特徴

- **匿名投稿**: ログイン不要で気軽にレビューを投稿
- **詳細評価**: 16項目の評価項目でS～Fランクの評価
- **レーダーチャート**: 選手の能力が一目で分かる可視化
- **スパム対策**: Google reCAPTCHA v3とレート制限で安全性を確保
- **美しいUI**: モダンで使いやすいインターフェース

## 🛠 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Firebase Firestore
- **ホスティング**: Vercel
- **チャート**: Chart.js, react-chartjs-2
- **フォーム**: React Hook Form, Zod
- **スパム対策**: Google reCAPTCHA v3
- **レート制限**: Vercel KV (Redis)

## 📦 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Vercel KV (Redis) - Optional
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### 3. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestoreデータベースを有効化
3. Webアプリを追加し、設定情報を取得
4. 取得した設定情報を`.env.local`に記載

### 4. Firestore データベースの初期化

Firestoreに以下のコレクションを作成してください：

#### `players` コレクション

```json
{
  "playerId": "hachimura-rui",
  "name": "八村 塁",
  "team": "ロサンゼルス・レイカーズ",
  "sport": "nba",
  "position": "PF",
  "number": 28,
  "imageUrl": "https://cdn.nba.com/headshots/nba/latest/1040x760/1629060.png",
  "reviewCount": 0,
  "summary": {}
}
```

必要に応じて他の選手も追加してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🚀 デプロイ

### Vercelへのデプロイ（推奨）

詳細な手順は[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)を参照してください。

**クイックスタート:**

1. [Vercel](https://vercel.com)アカウントを作成
2. GitHubリポジトリと連携
3. 環境変数を設定（[ENV_VARIABLES.md](./ENV_VARIABLES.md)を参照）
4. デプロイ

**デプロイ前のチェックリスト:**
- [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)で確認

```bash
# ローカルでビルド確認
npm run build
```

## 📁 プロジェクト構造

```
sport-review/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── route.ts          # レビュー投稿API
│   ├── players/
│   │   └── [playerId]/
│   │       └── page.tsx           # 選手詳細ページ（ISR）
│   ├── globals.css                # グローバルスタイル
│   ├── layout.tsx                 # ルートレイアウト
│   └── page.tsx                   # トップページ（SSG）
├── components/
│   ├── Footer.tsx                 # フッターコンポーネント
│   ├── Header.tsx                 # ヘッダーコンポーネント
│   ├── PlayerCard.tsx             # 選手カードコンポーネント
│   ├── RadarChart.tsx             # レーダーチャートコンポーネント
│   ├── ReviewCard.tsx             # レビューカードコンポーネント
│   └── ReviewForm.tsx             # レビュー投稿フォーム
├── lib/
│   ├── firebase/
│   │   ├── config.ts              # Firebase設定
│   │   └── firestore.ts           # Firestore操作
│   ├── types/
│   │   └── index.ts               # 型定義
│   └── utils/
│       └── index.ts               # ユーティリティ関数
└── README.md
```

## 🎨 デザイン

- **フォント**: 游ゴシック体
- **カラースキーム**: 青〜紫のグラデーション
- **レスポンシブ**: モバイル、タブレット、デスクトップ対応
- **アニメーション**: スムーズなトランジション

## 📊 評価システム

### 評価項目（16項目）

**オフェンス**
- インサイドシュート
- ミドルシュート
- 3ポイントシュート
- ドリブル
- パス
- オフボールの動き

**ディフェンス**
- オンボールDF
- オフボールDF
- 1on1 DF
- ヘルプDF

**フィジカル/その他**
- リバウンド
- ブロック
- スピード
- スタミナ
- バスケIQ
- リーダーシップ

### 評価グレード

- **S**: 6点（最高評価）
- **A**: 5点（優秀）
- **B**: 4点（良好）
- **C**: 3点（普通）
- **D**: 2点（やや劣る）
- **F**: 1点（改善が必要）

## 🔐 セキュリティ

- Google reCAPTCHA v3によるBot対策
- レート制限による連続投稿防止
- サーバーサイドでのバリデーション
- Firestore セキュリティルールの適用

## 📝 ライセンス

このプロジェクトは個人利用目的で作成されています。

## 🤝 コントリビューション

プルリクエストを歓迎します！

## 📮 お問い合わせ

問題や質問がある場合は、GitHubのIssuesで報告してください。
