# 🚀 GitHub経由でVercelにデプロイする手順

## ステップ1: GitHubリポジトリを作成

1. [GitHub](https://github.com)にアクセス
2. 右上の「+」ボタンをクリック → 「New repository」を選択
3. リポジトリ情報を入力：
   - **Repository name**: `sport-review`（または任意の名前）
   - **Description**: （任意）NBA選手レビューサイト
   - **Visibility**: Private または Public を選択
   - **Initialize this repository with**: すべてチェックを外す（既にコードがあるため）
4. 「Create repository」をクリック

## ステップ2: ローカルリポジトリをGitHubに接続

以下のコマンドを実行してください（**YOUR_USERNAME** と **YOUR_REPO_NAME** を実際の値に置き換えてください）：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review

# GitHubリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# または、SSHを使用する場合
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
```

### GitHubリポジトリのURLを確認

GitHubリポジトリ作成後、ページ上部に表示されるURLをコピーしてください。
例: `https://github.com/YOUR_USERNAME/sport-review.git`

## ステップ3: コードをGitHubにプッシュ

```bash
# 現在のブランチ名を確認（通常はmainまたはmaster）
git branch

# mainブランチにいることを確認（いない場合は切り替え）
git checkout main

# GitHubにプッシュ
git push -u origin main
```

初回プッシュ時、GitHubの認証情報を求められる場合があります。

## ステップ4: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. ログインしていない場合は、GitHubアカウントでログイン（推奨）
3. 「Add New...」ボタンをクリック → 「Project」を選択
4. 「Import Git Repository」セクションで：
   - GitHubリポジトリを検索または選択
   - 表示されたら「Import」をクリック

### ⚠️ エラー: "Project "sports-review" already exists"

このエラーが出た場合は、以下のいずれかの方法で解決してください：

#### 解決方法A: 既存プロジェクトを使用する（推奨）

1. Vercel Dashboardで既存の "sports-review" プロジェクトを開く
2. Settings → Git → Connect Git Repository
3. 作成したGitHubリポジトリを選択して接続
4. 環境変数を設定（下記ステップ6参照）
5. Deployments タブから手動デプロイ、またはGitHubにプッシュすると自動デプロイ

#### 解決方法B: 新しいプロジェクト名を使用する

1. プロジェクト設定画面で「Project Name」を変更：
   - 例: `nba-player-review`
   - 例: `sport-review-app`
   - 例: `player-review-site`
2. 変更後、続行

#### 解決方法C: 既存プロジェクトを削除して新規作成

1. Vercel Dashboard → 既存の "sports-review" プロジェクトを開く
2. Settings → 一番下までスクロール → 「Delete Project」をクリック
3. 削除後、再度インポートを試す

## ステップ5: プロジェクト設定を確認

Vercelが自動的にNext.jsを検出します。以下の設定を確認：

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

変更する必要は通常ありません。

## ステップ6: 環境変数を設定（重要！）

**デプロイ前に必ず環境変数を設定してください。**

1. プロジェクト設定画面で「Environment Variables」セクションを開く
   - または、Settings → Environment Variables から後で設定可能
2. 以下の環境変数を追加（`.env.local`ファイルから値をコピー）：

### 必須環境変数

| 環境変数名 | 値（`.env.local`から） | 適用範囲 |
|-----------|---------------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `.env.local`の値 | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `.env.local`の値 | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `.env.local`の値 | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `.env.local`の値 | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `.env.local`の値 | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `.env.local`の値 | Production, Preview, Development |
| `FIREBASE_CLIENT_EMAIL` | `.env.local`の値 | Production, Preview, Development |
| `FIREBASE_PRIVATE_KEY` | `.env.local`の値（⚠️重要） | Production, Preview, Development |

### オプション環境変数（設定している場合）

| 環境変数名 | 値（`.env.local`から） | 適用範囲 |
|-----------|---------------------|---------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `.env.local`の値 | Production, Preview, Development |
| `RECAPTCHA_SECRET_KEY` | `.env.local`の値 | Production, Preview, Development |

### 環境変数の設定方法

1. 「Add New」または「Add」をクリック
2. **Key**: 環境変数名を入力
3. **Value**: `.env.local`ファイルの値を貼り付け
4. **Environment**: 
   - Production ✅
   - Preview ✅
   - Development ✅
5. 「Save」をクリック

### ⚠️ 重要: FIREBASE_PRIVATE_KEY の設定

`FIREBASE_PRIVATE_KEY`は改行文字（`\n`）を含むため、設定時に注意が必要です：

1. `.env.local`から値をコピー
2. 値全体がダブルクォートで囲まれていることを確認
3. 改行文字`\n`はそのまま残す
4. Vercel Dashboardに貼り付け

例:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

## ステップ7: デプロイ実行

環境変数を設定した後：

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（2-5分程度）
3. ビルドログを確認（問題があれば表示されます）

## ステップ8: デプロイ完了後の確認

デプロイが完了すると、以下のようなURLが表示されます：
- Production URL: `https://sport-review.vercel.app`
- プレビューURL: `https://sport-review-git-main-your-username.vercel.app`

### 確認項目

1. **サイトが表示される**
   - Production URLにアクセス
   - トップページが表示されることを確認

2. **選手一覧が表示される**
   - Firestoreにデータがある場合、選手カードが表示されることを確認

3. **レビュー投稿が動作する**
   - 任意の選手ページを開く
   - レビューを投稿してみる
   - エラーなく投稿できることを確認

## 📝 環境変数の一覧（コピー用）

以下の環境変数名をコピーして使用してください：

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

## 🔧 トラブルシューティング

### ビルドエラー

- Vercel Dashboard → プロジェクト → Deployments → 最新のデプロイ → Build Logs を確認
- 環境変数が正しく設定されているか確認
- ビルドログのエラーメッセージを確認

### 環境変数が見つからない

- Settings → Environment Variables で環境変数が追加されているか確認
- 適用範囲（Production/Preview/Development）を確認
- 環境変数名のタイポがないか確認

### Firebase接続エラー

- Firebase設定の環境変数が正しいか確認
- Firestoreデータベースが作成されているか確認
- Firestoreセキュリティルールを確認

### サイトが404エラー

- ビルドログを確認
- ビルドが正常に完了したか確認
- 環境変数が設定されているか確認

## ✅ 次のステップ

デプロイが成功したら：

1. サイトの動作確認
2. Google Analyticsの設定（オプション）
3. Google Search Consoleへの登録（オプション）
4. カスタムドメインの設定（将来的に）

---

準備ができたら、GitHubリポジトリのURLを教えてください。次のステップのコマンドを生成します！

