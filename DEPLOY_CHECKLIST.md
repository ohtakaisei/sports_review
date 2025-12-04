# Vercelデプロイ前チェックリスト ✅

デプロイ前に確認すべき項目のチェックリストです。

## 📋 事前準備

- [ ] GitHubアカウントがある
- [ ] Vercelアカウントを作成済み
- [ ] Firebaseプロジェクトが作成済み
- [ ] 環境変数の値をすべて準備済み

## 🔧 Firebase設定

- [ ] Firestoreデータベースが作成済み
- [ ] Firestoreセキュリティルールが設定済み（読み取り許可、書き込みはAdmin SDK経由のみ）
- [ ] Firebase Webアプリが追加済み
- [ ] Firebase設定情報を取得済み（API Key, Project IDなど）

### Firebase Admin SDK

- [ ] サービスアカウントキーを生成済み
- [ ] `FIREBASE_CLIENT_EMAIL`を取得済み
- [ ] `FIREBASE_PRIVATE_KEY`を取得済み（改行文字`\n`を含む）

## 🌐 reCAPTCHA設定（オプション）

- [ ] Google reCAPTCHA v3でサイトを登録済み
- [ ] サイトキーを取得済み
- [ ] シークレットキーを取得済み
- [ ] Vercelのドメイン（`*.vercel.app`）を登録済み

## 📦 プロジェクト設定

### コード

- [ ] `.gitignore`に`.env.local`が含まれている
- [ ] 不要なファイルが`.gitignore`に追加されている
- [ ] すべての変更がコミット済み

### ビルド

- [ ] ローカルで`npm run build`が成功する
- [ ] ビルドエラーがない
- [ ] TypeScriptの型エラーがない
- [ ] Lintエラーがない

### 動作確認

- [ ] ローカルで`npm run dev`が正常に動作する
- [ ] トップページが表示される
- [ ] 選手一覧が表示される
- [ ] 選手詳細ページが表示される
- [ ] レビュー投稿機能が動作する（Firestoreに保存される）

## 🚀 Vercel設定

### リポジトリ

- [ ] GitHubリポジトリが作成済み
- [ ] コードがGitHubにプッシュ済み

### 環境変数

以下の環境変数がVercel Dashboardで設定されているか確認：

**必須：**
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`（改行文字`\n`を含む、ダブルクォートで囲む）

**オプション：**
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [ ] `RECAPTCHA_SECRET_KEY`

### プロジェクト設定

- [ ] Framework Presetが「Next.js」になっている
- [ ] Build Commandが「`npm run build`」になっている
- [ ] Output Directoryが「`.next`」になっている
- [ ] Install Commandが「`npm install`」になっている

## 🧪 デプロイ後確認

- [ ] デプロイが成功した
- [ ] ビルドログにエラーがない
- [ ] サイトにアクセスできる
- [ ] トップページが表示される
- [ ] 選手一覧が表示される
- [ ] 選手詳細ページが表示される
- [ ] レビュー投稿が動作する
- [ ] Firestoreにデータが保存される
- [ ] 画像が表示される
- [ ] レスポンシブデザインが動作する（モバイル/PC）

## 📝 デプロイ後の作業

- [ ] Google Analyticsを設定（オプション）
- [ ] Google Search Consoleに登録（オプション）
- [ ] サイトマップが生成されているか確認
- [ ] robots.txtが正しく設定されているか確認

## ⚠️ よくある問題

### ビルドエラー

**問題**: 環境変数が見つからない

**解決策**: 
- Vercel Dashboardで環境変数が正しく設定されているか確認
- 環境変数名が正確か確認（大文字小文字も含む）
- 環境変数の適用範囲（Production/Preview/Development）を確認

**問題**: Firebase接続エラー

**解決策**:
- Firebase設定の環境変数が正しいか確認
- Firestoreデータベースが作成されているか確認
- Firestoreセキュリティルールを確認

**問題**: Admin SDK初期化エラー

**解決策**:
- `FIREBASE_PRIVATE_KEY`が正しく設定されているか確認
- 改行文字（`\n`）が含まれているか確認
- ダブルクォートで囲まれているか確認

### デプロイ後のエラー

**問題**: API Routesが動作しない

**解決策**:
- 環境変数（特に`FIREBASE_PRIVATE_KEY`）が正しく設定されているか確認
- ビルドログを確認してエラーがないか確認

**問題**: Firestoreへの書き込みができない

**解決策**:
- Firestoreセキュリティルールを確認
- Admin SDKが正しく初期化されているか確認
- API Routesのログを確認

---

## ✅ すべて確認できたら

デプロイを実行してください！🚀

デプロイ手順は`VERCEL_DEPLOY.md`を参照してください。


