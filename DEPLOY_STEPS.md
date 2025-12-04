# 🚀 デプロイ手順（実行コマンド）

## ステップ1: Vercelにログイン

以下のコマンドを実行してください。ブラウザが開いてログイン画面が表示されます：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review
npx vercel login
```

ログイン後、この画面に戻ってください。

---

## ステップ2: 初回デプロイ

以下のコマンドを実行してください：

```bash
npx vercel
```

質問に答えてください：
- **Set up and deploy?** → `Y`（Yes）
- **Which scope?** → あなたのアカウントを選択
- **Link to existing project?** → `N`（No - 新規プロジェクト）
- **What's your project's name?** → `sport-review` または任意の名前（Enterでデフォルト）
- **In which directory is your code located?** → `./`（Enterキー）
- **Want to override the settings?** → `N`（No）

これでプレビューデプロイが完了します。

---

## ステップ3: 環境変数を設定

デプロイ後、環境変数を設定する必要があります。以下のコマンドを実行してください：

### 方法A: Vercel Dashboardから設定（推奨）

1. デプロイ後に表示されるURLを開くか、[Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables を開く
4. 以下の環境変数を追加（`.env.local`から値をコピー）：

#### 必須環境変数

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`（⚠️ 改行文字`\n`を含むため、ダブルクォートで囲む）

#### オプション環境変数

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

各環境変数の適用範囲：
- ✅ Production
- ✅ Preview  
- ✅ Development

### 方法B: コマンドラインから設定

以下のコマンドを実行（各環境変数の値を入力）：

```bash
# 対話形式で環境変数を追加
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
npx vercel env add FIREBASE_CLIENT_EMAIL
npx vercel env add FIREBASE_PRIVATE_KEY
```

各コマンド実行時に：
1. Value: `.env.local`の値を貼り付け
2. Environment: `Production, Preview, Development`すべてを選択

---

## ステップ4: 本番環境にデプロイ

環境変数を設定した後、本番環境にデプロイ：

```bash
npx vercel --prod
```

---

## 完了！

デプロイが完了すると、以下のようなURLが表示されます：
- 例: `https://sport-review.vercel.app`

このURLにアクセスして、サイトが正常に表示されるか確認してください。

---

## 次のステップ

1. ✅ サイトが表示されることを確認
2. ✅ 選手一覧が表示されることを確認（Firestoreにデータがある場合）
3. ✅ レビュー投稿が動作することを確認

問題があれば、Vercel Dashboardのビルドログを確認してください。


