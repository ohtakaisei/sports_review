# VercelにFirebase Admin SDK環境変数を設定する方法

## 🔧 設定手順

### ステップ1: Firebaseからサービスアカウントキーを取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. あなたのプロジェクトを選択
3. 左メニューから **⚙️ プロジェクトの設定** をクリック
4. **サービスアカウント** タブをクリック
5. **新しい秘密鍵の生成** ボタンをクリック
6. **キーを生成** をクリック
7. JSONファイルがダウンロードされます

### ステップ2: JSONファイルから値を取得

ダウンロードしたJSONファイルを開いて、以下の2つの値をコピー：

```json
{
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
}
```

### ステップ3: Vercelに環境変数を追加

Vercelダッシュボードで以下を追加：

#### 1. `FIREBASE_CLIENT_EMAIL` を追加

- **Key**: `FIREBASE_CLIENT_EMAIL`
- **Value**: JSONファイルの `client_email` の値をそのまま貼り付け
  - 例: `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### 2. `FIREBASE_PRIVATE_KEY` を追加

- **Key**: `FIREBASE_PRIVATE_KEY`
- **Value**: JSONファイルの `private_key` の値を**ダブルクォートで囲んで**貼り付け
  - 例: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"`
  - ⚠️ **重要**: 値全体をダブルクォート（`"`）で囲む必要があります
  - ⚠️ **重要**: `\n` はそのまま残してください（実際の改行に変換しない）
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### ステップ4: デプロイを再実行

環境変数を追加した後：

1. Vercelダッシュボードで最新のデプロイを開く
2. 「Redeploy」をクリック
3. または、新しいコミットをプッシュして自動デプロイ

## ✅ 確認方法

デプロイ後、ビルドログにエラーが出なければ成功です。

レビュー投稿機能を試して、エラーが出ないか確認してください。

## ⚠️ 注意点

- `FIREBASE_PRIVATE_KEY` は改行文字（`\n`）を含むため、必ずダブルクォートで囲んでください
- 値はJSONファイルからそのままコピーしてください（編集しない）
- 環境変数は3つの環境すべて（Production, Preview, Development）に設定してください


