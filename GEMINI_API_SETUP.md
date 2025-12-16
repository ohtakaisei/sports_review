# Gemini API設定ガイド

## 環境変数の設定

Gemini APIを使って試合結果を取得するには、Google AI Studio APIキーを環境変数に設定する必要があります。

### 1. `.env.local`ファイルの作成

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の内容を追加してください：

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Google AI Studio APIキーの取得方法

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. プロジェクトを選択（または新規作成）
5. 生成されたAPIキーをコピー
6. `.env.local`ファイルの`GEMINI_API_KEY`に貼り付け

### 3. 環境変数の確認

`.env.local`ファイルは以下のようになります：

```env
# Firebase設定（既存）
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# Google Gemini API（新規追加）
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. サーバーの再起動

環境変数を変更した後は、開発サーバーを再起動してください：

```bash
npm run dev
```

## Gemini APIを使った試合結果の取得

### APIエンドポイント

`POST /api/games/fetch-from-chatgpt`

（注: エンドポイント名は`fetch-from-chatgpt`のままですが、内部ではGemini APIを使用しています）

### リクエスト例

```json
{
  "date": "2025-01-15",
  "homeTeam": "ロサンゼルス・レイカーズ",
  "awayTeam": "ゴールデンステート・ウォリアーズ"
}
```

### レスポンス例

```json
{
  "success": true,
  "gameId": "game-xxx",
  "gameData": {
    "date": "2025-01-15",
    "homeTeam": "ロサンゼルス・レイカーズ",
    "awayTeam": "ゴールデンステート・ウォリアーズ",
    "homeScore": 120,
    "awayScore": 115,
    "status": "finished",
    "players": [...]
  },
  "message": "Geminiから試合結果を取得して登録しました"
}
```

## Gemini APIの特徴

- **最新情報へのアクセス**: Geminiは最新のウェブ情報にアクセスできるため、より正確な試合結果を取得できます
- **無料枠**: 月60リクエスト/分まで無料で利用可能
- **高品質な出力**: JSON形式での出力をサポートし、構造化されたデータを取得しやすい

## 注意事項

- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- APIキーは絶対に公開リポジトリにコミットしないでください
- Gemini APIの使用には料金がかかる場合があります（無料枠を超えた場合）
- APIキーが漏洩した場合は、すぐにGoogle AI Studioでキーを無効化してください

## トラブルシューティング

### エラー: "GEMINI_API_KEYが設定されていません"

- `.env.local`ファイルに`GEMINI_API_KEY`が正しく設定されているか確認
- サーバーを再起動しているか確認
- 環境変数名が`GEMINI_API_KEY`（大文字）であることを確認

### エラー: "Gemini API error"

- APIキーが有効か確認
- APIキーの使用制限に達していないか確認
- インターネット接続を確認

### 試合結果が取得できない

- 試合日が正しいか確認（未来の日付は取得できません）
- チーム名が正確か確認（日本語の正式名称を使用）
- 試合が実際に行われたか確認



