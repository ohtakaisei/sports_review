# 🛡️ スパム対策設定ガイド

## 実装済みの対策

### 1. レート制限
- **制限**: 1分間あたり2回までレビュー投稿可能
- **識別**: IPアドレスベース
- **実装**: メモリベース（本番環境ではVercel KV推奨）
- **効果**: スパムボットの連投を防止

### 2. reCAPTCHA v3
- **機能**: ボット検出とスコアリング
- **閾値**: スコア0.5以上で投稿許可
- **実装**: フロントエンド + サーバーサイド検証

## 🔧 設定手順

### ステップ1: Google reCAPTCHA v3の設定

1. **Google reCAPTCHA Admin Console**にアクセス:
   https://www.google.com/recaptcha/admin

2. **新しいサイトを登録**:
   - ラベル: `Sport Review Site`
   - reCAPTCHAタイプ: `reCAPTCHA v3`
   - ドメイン: `localhost` (開発用), `your-domain.com` (本番用)

3. **キーを取得**:
   - サイトキー (公開)
   - シークレットキー (非公開)

### ステップ2: 環境変数の設定

`.env.local`ファイルに以下を追加:

```bash
# reCAPTCHA設定
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### ステップ3: Firestoreセキュリティルールの設定

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if false; // 管理者のみ
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false; // API Routes経由のみ
    }
  }
}
```

## 🚀 本番環境での追加対策

### 1. Vercel KVを使用したレート制限

```bash
npm install @vercel/kv
```

```typescript
// lib/utils/rate-limit-kv.ts
import { kv } from '@vercel/kv';

export async function checkRateLimitKV(identifier: string) {
  const key = `rate_limit:${identifier}`;
  const current = await kv.get<number>(key) || 0;
  
  if (current >= 2) {
    return { allowed: false, remaining: 0 };
  }
  
  await kv.incr(key);
  await kv.expire(key, 60); // 1分間
  
  return { allowed: true, remaining: 2 - current - 1 };
}
```

### 2. コンテンツフィルタリング

```typescript
// lib/utils/content-filter.ts
const SPAM_KEYWORDS = ['spam', 'bot', 'fake', 'scam'];
const SUSPICIOUS_PATTERNS = [
  /(.)\1{10,}/, // 同じ文字の繰り返し
  /https?:\/\/[^\s]+/g, // URLの大量含む
];

export function isSpamContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // キーワードチェック
  if (SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword))) {
    return true;
  }
  
  // パターンチェック
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text))) {
    return true;
  }
  
  return false;
}
```

### 3. ユーザー行動分析

```typescript
// lib/utils/behavior-analysis.ts
interface UserBehavior {
  reviewCount: number;
  averageTimeBetweenReviews: number;
  commonWords: string[];
  suspiciousPatterns: string[];
}

export function analyzeUserBehavior(reviews: Review[]): UserBehavior {
  // ユーザーの行動パターンを分析
  // 異常な投稿パターンを検出
}
```

## 📊 監視とアラート

### 1. 異常な投稿の検出

```typescript
// 監視すべき指標
- 1分間あたりの投稿数 > 2
- 同じIPからの連続投稿
- 類似コメントの大量投稿
- reCAPTCHAスコア < 0.3
```

### 2. 自動ブロック機能

```typescript
// 自動ブロック条件
- 1分間に2回以上投稿（レート制限）
- reCAPTCHAスコアが0.5未満
- スパムキーワードを含む投稿
- 同じコメントの繰り返し
- 異常に短い時間での連続投稿
```

## 🔍 トラブルシューティング

### よくある問題

1. **reCAPTCHAが表示されない**
   - サイトキーが正しく設定されているか確認
   - ドメインがreCAPTCHA設定と一致しているか確認

2. **レート制限が効かない**
   - IPアドレスの取得方法を確認
   - メモリベースの制限はサーバー再起動でリセット

3. **APIエラーが発生**
   - 環境変数が正しく設定されているか確認
   - Firebaseのセキュリティルールを確認

## 📈 効果測定

### 監視すべき指標

- スパム投稿の検出率
- レート制限によるブロック数
- reCAPTCHAのスコア分布
- 正常なユーザーの投稿成功率

### 改善のポイント

- レート制限の閾値調整
- reCAPTCHAスコアの閾値調整
- コンテンツフィルタの精度向上
- ユーザー体験の最適化
