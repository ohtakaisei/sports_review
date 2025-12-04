# Vercelデプロイガイド 🚀

このドキュメントでは、Vercelにデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料作成可能）
- Firebaseプロジェクトが作成済み
- 環境変数の値が準備済み

## 🚀 デプロイ手順

### ステップ1: GitHubリポジトリの準備

1. GitHubで新しいリポジトリを作成
2. ローカルリポジトリをGitHubにプッシュ

```bash
# リポジトリがまだGitで管理されていない場合
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### ステップ2: Vercelアカウントの作成・ログイン

1. [vercel.com](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで連携（推奨）
4. 必要に応じて権限を許可

### ステップ3: プロジェクトのインポート

1. Vercel Dashboardで「Add New...」→「Project」をクリック
2. GitHubリポジトリを選択
3. 「Import」をクリック

### ステップ4: プロジェクト設定

#### 基本設定

- **Framework Preset**: Next.js（自動検出されるはず）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

#### 環境変数の設定

以下の環境変数をVercel Dashboardで設定してください：

**必須環境変数：**

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**オプション環境変数（推奨）：**

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

**環境変数の設定方法：**

1. Vercel Dashboardのプロジェクト設定画面で「Environment Variables」をクリック
2. 各環境変数を追加
   - Key: 環境変数名
   - Value: 環境変数の値
   - Environment: Production, Preview, Developmentすべてにチェック
3. 「Save」をクリック

⚠️ **重要**: `FIREBASE_PRIVATE_KEY`は改行文字（`\n`）を含むため、値全体をダブルクォートで囲んでください。

### ステップ5: デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（数分かかります）
3. ビルドが完了すると、自動的にURLが生成されます
   - 例: `https://your-project.vercel.app`

### ステップ6: 動作確認

1. デプロイされたURLにアクセス
2. 以下の機能を確認：
   - トップページが表示される
   - 選手一覧が表示される
   - 選手詳細ページが開ける
   - レビュー投稿ができる（Firestoreにデータが保存される）

## 🔧 トラブルシューティング

### ビルドエラー

**エラー: 環境変数が見つからない**

→ Vercel Dashboardで環境変数が正しく設定されているか確認してください。

**エラー: Firebase接続エラー**

→ Firebase設定の環境変数（`NEXT_PUBLIC_FIREBASE_*`）が正しいか確認してください。

**エラー: Admin SDK初期化エラー**

→ `FIREBASE_CLIENT_EMAIL`と`FIREBASE_PRIVATE_KEY`が正しく設定されているか確認してください。
`FIREBASE_PRIVATE_KEY`は改行文字（`\n`）を含む必要があります。

### デプロイ後のエラー

**404エラー**

→ ビルドログを確認し、ビルドが正常に完了したか確認してください。

**API Routesが動作しない**

→ 環境変数（特に`FIREBASE_PRIVATE_KEY`）が正しく設定されているか確認してください。

**Firestoreへの書き込みができない**

→ Firestoreセキュリティルールを確認してください。Admin SDKを使用する場合、サーバー側からの書き込みは可能ですが、クライアント側からの直接書き込みはセキュリティルールで制限されている必要があります。

## 📝 今後の更新

GitHubにプッシュすると、自動的にVercelで再デプロイが行われます。

```bash
git add .
git commit -m "Update: 変更内容"
git push
```

## 🌐 カスタムドメインの設定（オプション）

ベータ版ではカスタムドメインは不要ですが、将来的に設定する場合：

1. Vercel Dashboard → プロジェクト → Settings → Domains
2. ドメイン名を入力
3. DNS設定を指示に従って設定
4. SSL証明書は自動で発行されます

## 📊 モニタリング

Vercel Dashboardで以下を監視できます：

- デプロイ履歴
- ビルドログ
- パフォーマンス分析
- エラーログ

## ⚠️ 重要な注意事項

### Vercel Hobbyプランの制約

- **非商用利用のみ**: 個人プロジェクトや非商用プロジェクトのみ利用可能
- **広告収益禁止**: 広告収益を得る場合は商用プランが必要
- **有料機能禁止**: 有料機能を提供する場合は商用プランが必要

ベータ版テスト期間中は、これらの制約に注意しながら利用してください。
商用化する場合は、後ほどGCP等に移行することをお勧めします。


