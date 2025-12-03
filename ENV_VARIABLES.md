# 環境変数リスト

Vercel Dashboardで設定する環境変数のリストです。

## 📋 必須環境変数

### Firebase クライアント設定

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK設定

```
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

⚠️ **重要**: `FIREBASE_PRIVATE_KEY`の値は、改行文字（`\n`）を含むため、**必ずダブルクォートで囲んでください**。

例:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

## 🔒 オプション環境変数（推奨）

### Google reCAPTCHA v3

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

これらの環境変数を設定すると、スパム対策が有効になります。

### Vercel KV (Redis) - レート制限用

レート制限機能を有効にする場合のみ設定：

```
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

## 📝 Vercelでの設定方法

1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 各環境変数を追加：
   - **Key**: 環境変数名（上記のリストから）
   - **Value**: 環境変数の値
   - **Environment**: 
     - Production ✅
     - Preview ✅
     - Development ✅
3. 「Save」をクリック

## 🔍 環境変数の取得方法

### Firebase設定の取得

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. ⚙️ プロジェクトの設定 → 全般タブ
4. 「アプリ」セクションからWebアプリを選択
5. 設定情報をコピー

### Firebase Admin SDK設定の取得

1. Firebase Console → ⚙️ プロジェクトの設定
2. 「サービスアカウント」タブ
3. 「新しい秘密鍵の生成」をクリック
4. JSONファイルをダウンロード
5. JSONファイルから以下を抽出：
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`（改行文字`\n`を含む）

### reCAPTCHA設定の取得

1. [Google reCAPTCHA](https://www.google.com/recaptcha/admin)にアクセス
2. 「サイトを登録」をクリック
3. ラベル、reCAPTCHAタイプ（v3）を選択
4. ドメインを入力（`*.vercel.app`も追加）
5. 「送信」をクリック
6. サイトキーとシークレットキーをコピー

## ✅ 設定確認

環境変数を設定した後、以下のコマンドで確認できます：

```bash
# ローカル環境で確認（.env.localが必要）
npm run dev
```

Vercelでは、デプロイ後にビルドログを確認してください。環境変数が正しく設定されていない場合、ビルドエラーが発生します。

