# 🚀 Vercelへのデプロイ手順

現在の状態: ビルド成功 ✅、変更をコミット済み ✅

## 方法1: Vercel CLIで直接デプロイ（推奨・簡単）

GitHubリポジトリがなくても、Vercel CLIを使って直接デプロイできます。

### ステップ1: Vercel CLIのインストール

```bash
npm install -g vercel
```

### ステップ2: Vercelにログイン

```bash
vercel login
```

ブラウザが開いてログイン画面が表示されます。GitHubアカウントでログインすることをお勧めします。

### ステップ3: プロジェクトをデプロイ

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review
vercel
```

初回デプロイ時には質問が表示されます：

1. **Set up and deploy "sport-review"?** → `Y`
2. **Which scope?** → あなたのアカウントを選択
3. **Link to existing project?** → `N`（新規プロジェクト）
4. **What's your project's name?** → `sport-review` または任意の名前
5. **In which directory is your code located?** → `./`（Enterキー）
6. **Want to override the settings?** → `N`

### ステップ4: 環境変数の設定

デプロイが完了したら、環境変数を設定する必要があります：

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
```

各環境変数の値は`.env.local`ファイルから取得してください。

または、Vercel Dashboardから設定することもできます：
1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 環境変数を追加

### ステップ5: 環境変数を追加した後、再デプロイ

```bash
vercel --prod
```

---

## 方法2: GitHub経由でデプロイ（推奨）

GitHubリポジトリを作成して、Vercelと連携します。

### ステップ1: GitHubリポジトリを作成

1. [GitHub](https://github.com)にアクセス
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `sport-review`）
4. 「Create repository」をクリック

### ステップ2: ローカルリポジトリをGitHubに接続

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review

# GitHubリポジトリのURLを設定（作成したリポジトリのURLを使用）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# コードをプッシュ
git branch -M main
git push -u origin main
```

### ステップ3: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」からGitHubリポジトリを選択
4. 「Import」をクリック

### ステップ4: 環境変数を設定

Vercel Dashboard → Settings → Environment Variables で以下を設定：

詳細は`ENV_VARIABLES.md`を参照してください。

### ステップ5: デプロイ

「Deploy」ボタンをクリック

---

## 📋 環境変数の準備

`.env.local`ファイルから以下の環境変数をVercelに設定してください：

### 必須環境変数

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### オプション環境変数

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

---

## ⚠️ 重要な注意事項

### FIREBASE_PRIVATE_KEY の設定

`FIREBASE_PRIVATE_KEY`は改行文字（`\n`）を含むため、Vercel Dashboardで設定する際は：

1. **値全体をダブルクォートで囲む**
2. **改行文字`\n`をそのまま含める**

例:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

### 環境変数の適用範囲

各環境変数を以下の環境に適用することを推奨します：
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🎯 デプロイ後の確認

デプロイが完了したら、以下を確認してください：

1. **サイトが表示されるか**
   - Vercelから提供されるURLにアクセス
   - トップページが表示されるか確認

2. **選手一覧が表示されるか**
   - Firestoreにデータがある場合、選手一覧が表示されるか確認

3. **レビュー投稿が動作するか**
   - 任意の選手ページでレビューを投稿してみる
   - エラーなく投稿できるか確認

---

## 🔧 トラブルシューティング

### ビルドエラー

- ビルドログを確認
- 環境変数が正しく設定されているか確認

### Firebase接続エラー

- Firebase設定の環境変数が正しいか確認
- Firestoreデータベースが作成されているか確認

### 環境変数が見つからない

- Vercel Dashboardで環境変数が設定されているか確認
- 適用範囲（Production/Preview/Development）を確認

---

どちらの方法で進めますか？

