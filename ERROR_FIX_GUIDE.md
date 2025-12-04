# 🔧 エラー解決ガイド: "Project already exists"

## エラー内容

**"Project "sports-review" already exists, please use a new name."**

Vercelで既に "sports-review" というプロジェクトが存在するため、このエラーが発生しています。

---

## ✅ 推奨解決方法

### オプション1: 既存プロジェクトを使用する（最も簡単・推奨）

既存のプロジェクトにGitHubリポジトリを接続するだけです。

#### 手順：

1. **[Vercel Dashboard](https://vercel.com/dashboard)にアクセス**

2. **既存の "sports-review" プロジェクトを開く**
   - プロジェクト一覧から "sports-review" を探してクリック

3. **GitHubリポジトリを接続**
   - Settings タブ → Git セクション
   - 「Connect Git Repository」または「Change Git Repository」をクリック
   - GitHubリポジトリを選択
   - 接続を確認

4. **環境変数を設定**
   - Settings → Environment Variables
   - 必要な環境変数を追加（後述）

5. **デプロイ**
   - GitHubにプッシュすると自動デプロイされます
   - または、Deployments タブから手動デプロイ

---

### オプション2: 新しいプロジェクト名を使用する

別のプロジェクト名で新規作成する場合。

#### プロジェクト名の候補：

- `nba-player-review`
- `sport-review-app`
- `player-review-site`
- `nba-review-2024`
- `sport-review-production`

#### 手順：

1. **Vercel Dashboardでインポート時**
   - 「Project Name」フィールドを探す
   - デフォルトの "sports-review" を削除
   - 新しい名前を入力（例: `nba-player-review`）
   - 続行

2. **または、既存プロジェクト名を先に変更**
   - 既存の "sports-review" プロジェクトを開く
   - Settings → General → Project Name
   - 名前を変更（例: `sports-review-old`）
   - その後、新しいプロジェクト名で作成

---

### オプション3: 既存プロジェクトを削除して新規作成

既存プロジェクトが不要な場合のみ。

#### 手順：

1. **既存プロジェクトを削除**
   - [Vercel Dashboard](https://vercel.com/dashboard)
   - "sports-review" プロジェクトを開く
   - Settings → 一番下までスクロール
   - 「Delete Project」をクリック
   - プロジェクト名を入力して確認
   - 削除完了

2. **新規プロジェクトとして作成**
   - GitHubリポジトリをインポート
   - プロジェクト名: `sports-review` で作成可能

---

## 🚀 完全な手順（既存プロジェクトを使用する場合）

### ステップ1: GitHubリポジトリを作成（まだの場合）

1. [GitHub](https://github.com)にアクセス
2. 右上の「+」→「New repository」
3. リポジトリ名を入力（例: `sport-review`）
4. 公開設定を選択（Private または Public）
5. 「Create repository」をクリック

### ステップ2: コードをGitHubにプッシュ

以下のコマンドを実行（**YOUR_USERNAME** と **YOUR_REPO_NAME** を置き換え）：

```bash
cd /Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review

# GitHubリポジトリを追加（リポジトリURLを入力）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# コードをプッシュ
git push -u origin main
```

### ステップ3: Vercelで既存プロジェクトに接続

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. 既存の "sports-review" プロジェクトを開く
3. Settings → Git
4. 「Connect Git Repository」をクリック
5. 作成したGitHubリポジトリを選択
6. 接続を確認

### ステップ4: 環境変数を設定

Settings → Environment Variables で以下を追加：

**必須環境変数（`.env.local`から値をコピー）：**

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`（⚠️ ダブルクォートで囲む）

各環境変数の適用範囲：
- ✅ Production
- ✅ Preview
- ✅ Development

### ステップ5: デプロイ

- GitHubにプッシュすると自動デプロイされます
- または、Deployments タブから手動で「Redeploy」をクリック

---

## 📋 次のアクション

1. **既存プロジェクトを使用する場合**
   - Vercel Dashboard → 既存プロジェクト → Settings → Git から接続

2. **新しいプロジェクト名を使用する場合**
   - プロジェクト名を変更して続行

3. **既存プロジェクトを削除する場合**
   - Settings → Delete Project → 削除後に新規作成

---

どちらの方法で進めますか？選択した方法に応じて、次のステップを案内します！


