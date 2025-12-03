# ⚡ クイックデプロイ手順

## 現在の状態

✅ ビルド成功
✅ 変更をコミット済み
✅ 環境変数ファイル（`.env.local`）存在確認

## デプロイ方法の選択

### オプションA: Vercel CLIで直接デプロイ（対話形式）

以下のコマンドを実行してください：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review
npx vercel
```

初回実行時：
1. ブラウザでログイン画面が開きます
2. 質問に答えてください：
   - Set up and deploy? → `Y`
   - Link to existing project? → `N`
   - Project name? → `sport-review` または任意の名前

デプロイ後、環境変数を設定する必要があります（下記参照）。

### オプションB: GitHub経由（推奨・自動デプロイ可能）

1. GitHubリポジトリを作成
2. コードをプッシュ
3. Vercel Dashboardでインポート
4. 環境変数を設定
5. デプロイ

---

## 環境変数の設定方法

デプロイ後に、以下の環境変数をVercel DashboardまたはCLIで設定してください。

### Vercel Dashboardから設定

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 以下の環境変数を追加（`.env.local`から値をコピー）

### 必要な環境変数

必須：
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

オプション：
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

---

どちらの方法で進めますか？

