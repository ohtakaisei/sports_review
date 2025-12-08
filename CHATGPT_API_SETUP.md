# ChatGPT API設定ガイド

## 環境変数の設定

ChatGPT APIを使って試合結果を取得するには、OpenAI APIキーを環境変数に設定する必要があります。

### 1. `.env.local`ファイルの作成

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の内容を追加してください：

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. OpenAI APIキーの取得方法

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. アカウントを作成（またはログイン）
3. API Keysページ（https://platform.openai.com/api-keys）に移動
4. 「Create new secret key」をクリック
5. 生成されたAPIキーをコピー
6. `.env.local`ファイルの`OPENAI_API_KEY`に貼り付け

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

# OpenAI API（新規追加）
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 4. サーバーの再起動

環境変数を変更した後は、開発サーバーを再起動してください：

```bash
npm run dev
```

## ChatGPT APIを使った試合結果の取得

### APIエンドポイント

`POST /api/games/fetch-from-chatgpt`

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
  "message": "ChatGPTから試合結果を取得して登録しました"
}
```

## 注意事項

- `.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- APIキーは絶対に公開リポジトリにコミットしないでください
- OpenAI APIの使用には料金がかかります（gpt-4o-miniは比較的安価）
- APIキーが漏洩した場合は、すぐにOpenAI Platformでキーを無効化してください

