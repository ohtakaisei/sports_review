# Vertex AI Gemini API セットアップガイド

Google AI StudioのAPIキーには使用制限があるため、Vertex AIを使用してGeminiモデルを利用します。

## 前提条件

- Google Cloudアカウント
- クレジットカード（課金設定用）

## セットアップ手順

### 1. Google Cloudプロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名を記録しておく（例: `sport-review-gemini`）

### 2. Vertex AI APIの有効化

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」に移動
2. 「Vertex AI API」を検索
3. 「有効にする」をクリック

### 3. サービスアカウントの作成

1. 「IAMと管理」→「サービスアカウント」に移動
2. 「サービスアカウントを作成」をクリック
3. 以下の情報を入力：
   - **サービスアカウント名**: `gemini-api-user`（任意）
   - **説明**: `Gemini API用のサービスアカウント`
4. 「作成して続行」をクリック
5. **ロール**: `Vertex AI User` を選択
6. 「続行」→「完了」をクリック

### 4. サービスアカウントキーのダウンロード

1. 作成したサービスアカウントをクリック
2. 「キー」タブに移動
3. 「キーを追加」→「新しいキーを作成」を選択
4. キーのタイプ: **JSON** を選択
5. 「作成」をクリック（JSONファイルがダウンロードされます）

### 5. 環境変数の設定

ダウンロードしたJSONファイルをプロジェクトのルートディレクトリに配置し、`.env.local`に以下を追加：

```env
# Vertex AI設定
GOOGLE_CLOUD_PROJECT_ID=arcane-firefly-352021
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./arcane-firefly-352021-9646acb3fb7a.json
```

**重要**: 
- `GOOGLE_CLOUD_PROJECT_ID`: Google CloudプロジェクトID（JSONファイルの`project_id`と同じ値）
- `GOOGLE_CLOUD_REGION`: リージョン（例: `us-central1`, `asia-northeast1`）
  - **リージョンの確認方法**: 
    1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
    2. プロジェクトを選択
    3. 「Vertex AI」→「モデル」に移動
    4. 利用可能なリージョンが表示されます
    5. または、「Vertex AI」→「APIとサービス」→「Vertex AI API」で確認
    6. 一般的なリージョン: `us-central1`（推奨）, `us-east4`, `asia-northeast1`（東京）, `europe-west1`
- `GOOGLE_APPLICATION_CREDENTIALS`: サービスアカウントキーのJSONファイルのパス
  - プロジェクトルートに配置している場合: `./arcane-firefly-352021-9646acb3fb7a.json`
  - 絶対パスでも指定可能: `/Users/kaiseiota/Desktop/Personal/App/Sport_reveiw/sport-review/arcane-firefly-352021-9646acb3fb7a.json`

### 6. 依存関係のインストール

```bash
npm install @google-cloud/aiplatform
```

## リージョンの確認方法

Vertex AIで使用するリージョンを確認する方法：

### 方法1: Google Cloud Consoleで確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択（`arcane-firefly-352021`）
3. 左側のメニューから「Vertex AI」を選択
4. 「モデル」または「ワークベンチ」をクリック
5. ページ上部にリージョン選択ドロップダウンが表示されます
6. 利用可能なリージョンが一覧表示されます

### 方法2: 一般的なリージョンを使用

以下のリージョンは、ほとんどのプロジェクトで利用可能です：

- **`us-central1`** (アイオワ) - 推奨、最も安定
- **`us-east4`** (バージニア)
- **`asia-northeast1`** (東京) - 日本からのアクセスに最適
- **`europe-west1`** (ベルギー)

**推奨**: まずは `us-central1` を試してください。エラーが出た場合は、上記の他のリージョンを試してください。

## 使用方法

Vertex AIを使用する場合、認証は自動的にサービスアカウントキーから読み込まれます。

## 料金

Vertex AIのGeminiモデルは、Google AI Studioと同様の料金体系です。詳細は[Vertex AI料金ページ](https://cloud.google.com/vertex-ai/pricing)を確認してください。

## トラブルシューティング

### 認証エラーが発生する場合

1. サービスアカウントキーのパスが正しいか確認
2. サービスアカウントに`Vertex AI User`ロールが付与されているか確認
3. Vertex AI APIが有効になっているか確認

### リージョンエラーが発生する場合

- 使用可能なリージョンを確認: `us-central1`, `us-east4`, `asia-northeast1`, `europe-west1`など
- プロジェクトで使用可能なリージョンを確認してください

## 参考リンク

- [Vertex AI Gemini API ドキュメント](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Vertex AI SDK for Node.js](https://cloud.google.com/nodejs/docs/reference/aiplatform/latest)

