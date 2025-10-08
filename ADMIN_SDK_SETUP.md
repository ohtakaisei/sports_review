# Firebase Admin SDK セットアップガイド

このドキュメントでは、Firebase Admin SDKを使用するために必要な環境変数の設定方法を説明します。

## 📋 必要な環境変数

Admin SDKを使用するには、以下の環境変数を `.env.local` ファイルに追加する必要があります：

```env
# Firebase Admin SDK用の環境変数
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

## 🔧 セットアップ手順

### 1. Firebaseコンソールでサービスアカウントキーを取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 左側のメニューから **⚙️ プロジェクトの設定** をクリック
4. **サービスアカウント** タブをクリック
5. **新しい秘密鍵の生成** ボタンをクリック
6. **キーを生成** をクリック
7. JSONファイルがダウンロードされます

### 2. JSONファイルから必要な情報を抽出

ダウンロードしたJSONファイルを開くと、以下のような構造になっています：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 3. .env.local ファイルに追加

プロジェクトのルートディレクトリにある `.env.local` ファイル（なければ作成）に以下を追加：

```env
# ========================================
# Firebase Admin SDK 設定
# ========================================

# サービスアカウントのメールアドレス
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# プライベートキー（必ず二重引用符で囲む）
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

### ⚠️ 重要な注意点

1. **プライベートキーは二重引用符で囲む**
   - `\n` が改行として正しく解釈されるように、必ず二重引用符（`"`）で囲んでください

2. **改行文字 `\n` をそのまま残す**
   - JSONファイルからコピーする際、`\n` をそのまま残してください
   - 例: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA....\n-----END PRIVATE KEY-----\n"`

3. **既存の環境変数は保持**
   - 既に設定されている環境変数（reCAPTCHAなど）はそのまま残してください

### 4. .env.local の完全な例

```env
# ========================================
# Firebase クライアント設定（既存）
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ========================================
# reCAPTCHA 設定（既存）
# ========================================
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# ========================================
# Firebase Admin SDK 設定（新規追加）
# ========================================
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

### 5. 開発サーバーを再起動

環境変数を追加した後は、開発サーバーを再起動してください：

```bash
# 開発サーバーが起動中の場合は停止（Ctrl + C）
# 再起動
npm run dev
```

## 🧪 動作確認

環境変数が正しく設定されているか確認するには、レビュー投稿機能を試してください：

1. ブラウザでアプリを開く
2. 任意の選手ページに移動
3. レビューフォームに記入して投稿
4. エラーなく投稿できれば成功！

### よくあるエラー

#### エラー: "Firebase Admin SDK の初期化に必要な環境変数が設定されていません"

**原因**: 環境変数が正しく設定されていません

**解決方法**:
1. `.env.local` ファイルが正しい場所（プロジェクトルート）にあるか確認
2. 環境変数名が正確か確認（タイポがないか）
3. 開発サーバーを再起動

#### エラー: "credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token"

**原因**: プライベートキーの形式が正しくありません

**解決方法**:
1. プライベートキーを二重引用符（`"`）で囲んでいるか確認
2. `\n` を実際の改行に変換していないか確認（`\n` のまま残す）
3. JSONファイルから再度コピーして試す

## 🔒 セキュリティ

### Gitに含めない

`.env.local` ファイルは **絶対にGitにコミットしないでください**。

`.gitignore` に以下が含まれていることを確認：

```gitignore
.env.local
.env*.local
```

### 本番環境へのデプロイ

Vercel、Netlify、その他のホスティングサービスにデプロイする場合：

1. 各サービスの環境変数設定画面で同じ変数を設定
2. **Vercel の場合**: Settings → Environment Variables から追加
3. **重要**: プライベートキーの二重引用符は不要な場合があります（サービスによって異なる）

## 📚 参考リンク

- [Firebase Admin SDK ドキュメント](https://firebase.google.com/docs/admin/setup)
- [Next.js 環境変数ドキュメント](https://nextjs.org/docs/basic-features/environment-variables)

## 💡 なぜAdmin SDKが必要？

### 問題

Firestoreのセキュリティルールで `allow write: if false` を設定している場合、クライアント側のSDKでは書き込みができません。

```javascript
// Firestoreセキュリティルール
match /reviews/{reviewId} {
  allow read: if true;
  allow write: if false;  // クライアントからの直接書き込みを禁止
}
```

### 解決策

Admin SDKはサーバー側（API Routes）で動作し、セキュリティルールをバイパスできます。

**フロー**:
1. ユーザーがレビューフォームを送信
2. クライアント → API Routes (`/api/reviews`)
3. API Routesでバリデーション + reCAPTCHA + レート制限チェック
4. **Admin SDKでFirestoreに書き込み**（セキュリティルールをバイパス）
5. 成功レスポンスを返す

これにより、セキュリティを維持しながらユーザーがレビューを投稿できます。

## ✅ 完了チェックリスト

- [ ] Firebase Consoleからサービスアカウントキー（JSON）をダウンロード
- [ ] `.env.local` ファイルに `FIREBASE_CLIENT_EMAIL` を追加
- [ ] `.env.local` ファイルに `FIREBASE_PRIVATE_KEY` を追加（二重引用符で囲む）
- [ ] 開発サーバーを再起動
- [ ] レビュー投稿機能をテスト
- [ ] `.env.local` が `.gitignore` に含まれていることを確認

