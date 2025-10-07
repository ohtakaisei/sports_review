# セットアップガイド

このドキュメントでは、プロジェクトの詳細なセットアップ手順を説明します。

## 📋 前提条件

- Node.js 18.x 以上
- npm または yarn
- Firebaseアカウント
- Vercelアカウント（デプロイ時）

## 🚀 初期セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebaseプロジェクトの作成

#### 2.1 Firebaseコンソールでプロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `player-review`）
4. Google Analyticsは任意で設定
5. プロジェクトを作成

#### 2.2 Firestoreデータベースの有効化

1. Firebaseコンソールで「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. 「本番環境モード」を選択（後でルールを設定）
4. ロケーションを選択（asia-northeast1推奨）

#### 2.3 Webアプリの追加

1. プロジェクト設定（⚙️アイコン）を開く
2. 「アプリを追加」→「ウェブ」を選択
3. アプリのニックネームを入力
4. 「アプリを登録」をクリック
5. 表示される設定情報をコピー

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Google reCAPTCHA v3 (オプション)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Vercel KV (オプション)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
```

### 4. Firestoreへのサンプルデータ投入

#### 方法1: Firebaseコンソールから手動で追加

1. Firebaseコンソールで「Firestore Database」を開く
2. 「コレクションを開始」をクリック
3. コレクションID: `players`
4. ドキュメントIDに選手ID（例: `hachimura-rui`）を入力
5. フィールドを追加：

```
playerId (string): "hachimura-rui"
name (string): "八村 塁"
team (string): "ロサンゼルス・レイカーズ"
sport (string): "nba"
position (string): "PF"
number (number): 28
height (string): "203cm"
weight (string): "104kg"
birthDate (string): "1998年2月8日"
country (string): "日本"
imageUrl (string): "https://cdn.nba.com/headshots/nba/latest/1040x760/1629060.png"
reviewCount (number): 0
summary (map): {}
```

#### 方法2: scripts/seed-data.json を参考に複数選手を追加

`scripts/seed-data.json` に6名の選手データがあります。これを参考に、Firebaseコンソールから手動で追加してください。

### 5. Firestoreセキュリティルールの設定

Firebaseコンソール → Firestore Database → ルール タブを開き、以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // playersコレクション: 読み取りは全員可能、書き込みは不可
    match /players/{playerId} {
      allow read: if true;
      allow write: if false;
    }
    
    // reviewsコレクション: 読み取りは全員可能、書き込みはサーバーのみ
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

> ⚠️ **重要**: レビューの投稿はサーバーサイド（API Route）からのみ行うため、クライアントからの直接書き込みは禁止します。

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 🔐 セキュリティ機能の設定（オプション）

### Google reCAPTCHA v3の設定

#### 1. reCAPTCHAサイトキーの取得

1. [Google reCAPTCHA](https://www.google.com/recaptcha/admin)にアクセス
2. 「+」ボタンをクリックして新しいサイトを登録
3. ラベル: `Player Review`
4. reCAPTCHAタイプ: `reCAPTCHA v3`
5. ドメイン:
   - 開発: `localhost`
   - 本番: あなたのドメイン
6. 「送信」をクリック
7. サイトキーとシークレットキーをコピー

#### 2. 環境変数に追加

`.env.local` に以下を追加：

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

#### 3. reCAPTCHA統合コードの実装

`components/ReviewForm.tsx` にreCAPTCHAを統合する場合：

```tsx
// GoogleReCaptchaProviderでラップ
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        >
          <Header />
          <main>{children}</main>
          <Footer />
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}
```

### Vercel KVでのレート制限

#### 1. Vercel KVの有効化

1. Vercelダッシュボードでプロジェクトを開く
2. 「Storage」タブを選択
3. 「Create Database」→「KV」を選択
4. データベース名を入力（例: `player-review-kv`）
5. リージョンを選択
6. 環境変数が自動的に追加されます

#### 2. レート制限の実装

`app/api/reviews/route.ts` にレート制限ロジックを追加：

```typescript
import { kv } from '@vercel/kv';

// レート制限チェック（1時間に5件まで）
const RATE_LIMIT_WINDOW = 3600; // 1時間（秒）
const RATE_LIMIT_MAX = 5; // 最大投稿数

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate_limit:${ip}`;
  const count = await kv.get<number>(key) || 0;
  
  if (count >= RATE_LIMIT_MAX) {
    return false; // レート制限超過
  }
  
  // カウントを増やす
  await kv.incr(key);
  // 初回の場合は有効期限を設定
  if (count === 0) {
    await kv.expire(key, RATE_LIMIT_WINDOW);
  }
  
  return true;
}
```

## 📦 本番環境へのデプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定（`.env.local`の内容をコピー）
4. デプロイ

### 環境変数の設定（Vercel）

Vercelダッシュボード → Settings → Environment Variables で以下を設定：

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (オプション)
- `RECAPTCHA_SECRET_KEY` (オプション)

KV環境変数は自動的に追加されます。

## 🧪 動作確認

### 基本機能のテスト

1. **選手一覧の表示**
   - トップページで選手カードが表示されることを確認

2. **選手詳細の表示**
   - 選手カードをクリックして詳細ページに遷移
   - レーダーチャートが表示されることを確認

3. **レビュー投稿**
   - すべての評価項目を選択
   - コメントを入力（10文字以上）
   - 「レビューを投稿する」をクリック
   - 成功メッセージが表示されることを確認

4. **レビュー表示**
   - 投稿したレビューがページに表示されることを確認
   - 選手の総合評価が更新されることを確認

## 🔧 トラブルシューティング

### Firebase接続エラー

```
FirebaseError: Firebase: Error (auth/invalid-api-key)
```

→ `.env.local`のFirebase設定を確認してください。

### 画像が表示されない

Next.jsの`next.config.ts`で画像ドメインを許可：

```typescript
const nextConfig = {
  images: {
    domains: ['cdn.nba.com'],
  },
};
```

### ビルドエラー

```bash
npm run build
```

でエラーが出る場合は、型エラーやインポートエラーを確認してください。

## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

## 💡 Tips

- 開発中は`.env.local`をgitignoreに追加しておく
- 本番環境では必ずFirestoreセキュリティルールを設定する
- 画像URLはCDNを使用して高速化
- ISRのrevalidate値を調整してDB負荷を最適化

