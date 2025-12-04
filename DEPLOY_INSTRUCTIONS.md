# 🚀 Vercelデプロイ手順（今すぐ実行可能）

現在の状態: ✅ ビルド成功、✅ コミット済み

## 最も簡単な方法: Vercel Dashboardからデプロイ

### ステップ1: GitHubリポジトリを作成（まだの場合）

1. [GitHub](https://github.com)にアクセス
2. 右上の「+」→「New repository」
3. リポジトリ名を入力（例: `sport-review`）
4. 「Create repository」をクリック
5. 表示されるコマンドをコピー

### ステップ2: コードをGitHubにプッシュ

以下のコマンドを実行してください（GitHubで表示されたURLを使用）：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review

# GitHubリポジトリを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# コードをプッシュ
git push -u origin main
```

### ステップ3: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」でGitHubリポジトリを選択
4. 「Import」をクリック

### ステップ4: プロジェクト設定

以下の設定を確認・変更：

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

### ステップ5: 環境変数を設定

**重要**: デプロイ前に環境変数を設定してください！

Vercel Dashboard → Settings → Environment Variables で以下を追加：

#### 必須環境変数（`.env.local`から取得）

1. `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_API_KEY`の値
   - Environment: Production, Preview, Development すべてにチェック

2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`の値
   - Environment: Production, Preview, Development すべてにチェック

3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_PROJECT_ID`の値
   - Environment: Production, Preview, Development すべてにチェック

4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`の値
   - Environment: Production, Preview, Development すべてにチェック

5. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`の値
   - Environment: Production, Preview, Development すべてにチェック

6. `NEXT_PUBLIC_FIREBASE_APP_ID`
   - Value: `.env.local`の`NEXT_PUBLIC_FIREBASE_APP_ID`の値
   - Environment: Production, Preview, Development すべてにチェック

7. `FIREBASE_CLIENT_EMAIL`
   - Value: `.env.local`の`FIREBASE_CLIENT_EMAIL`の値
   - Environment: Production, Preview, Development すべてにチェック

8. `FIREBASE_PRIVATE_KEY`
   - Value: `.env.local`の`FIREBASE_PRIVATE_KEY`の値（**ダブルクォートを含む**）
   - Environment: Production, Preview, Development すべてにチェック
   - ⚠️ **重要**: 改行文字`\n`を含むため、値全体をダブルクォートで囲んでください

#### オプション環境変数（設定している場合）

9. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - Value: `.env.local`の`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`の値
   - Environment: Production, Preview, Development すべてにチェック

10. `RECAPTCHA_SECRET_KEY`
    - Value: `.env.local`の`RECAPTCHA_SECRET_KEY`の値
    - Environment: Production, Preview, Development すべてにチェック

### ステップ6: デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（2-5分程度）
3. 完了するとURLが表示されます（例: `https://sport-review.vercel.app`）

---

## 代替方法: npxでVercel CLIを使用

GitHubリポジトリを作成したくない場合は、以下のコマンドで直接デプロイできます：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review

# Vercelにログイン（ブラウザが開きます）
npx vercel login

# デプロイ実行
npx vercel

# 初回デプロイ後、環境変数を設定してから本番デプロイ
npx vercel --prod
```

環境変数は以下のコマンドで設定できます：

```bash
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# 各環境変数に対して同じコマンドを実行
```

---

## 📋 次のステップ

デプロイが完了したら、以下を確認してください：

1. ✅ サイトが表示される
2. ✅ 選手一覧が表示される（Firestoreにデータがある場合）
3. ✅ レビュー投稿が動作する

問題があれば、Vercel Dashboardのビルドログを確認してください。

---

## 🆘 必要な情報

デプロイを進めるために、以下の情報が必要です：

1. **GitHubリポジトリのURL**（作成済みの場合）
   - または、新しく作成するかどうか

2. **環境変数の値**
   - `.env.local`ファイルの内容を確認してください

どちらで進めますか？GitHubリポジトリのURLまたは作成状況を教えてください。


