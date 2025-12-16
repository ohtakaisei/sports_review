# クイックスタートガイド 🚀

このガイドでは、最も早くプロジェクトを起動する手順を説明します。

## 📋 必要なもの

- Node.js 18.x以上
- Firebaseアカウント（無料）

## ⚡ 5分でスタート

### 1. Firebaseプロジェクトの作成（3分）

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `player-review`）
4. 「Firestore Database」を選択 → 「データベースの作成」
5. 「本番環境モード」を選択 → ロケーション: `asia-northeast1`
6. プロジェクト設定から「ウェブアプリを追加」
7. 設定情報をコピー

### 2. 環境変数の設定（1分）

プロジェクトルートに `.env.local` ファイルを作成：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxx
```

### 3. サンプルデータの投入（1分）

Firebaseコンソールで選手データを手動で登録します：

1. Firestore Database → 「コレクションを開始」
2. コレクションID: `players`
3. ドキュメントID: 選手のID（例: `lebron-james`）
4. 以下のフィールドを追加：

```
playerId: "lebron-james" (string) ← ドキュメントIDと同じ
name: "レブロン・ジェームズ" (string)
team: "ロサンゼルス・レイカーズ" (string)
sport: "nba" (string)
position: "SF" (string)
number: 23 (number)
imageUrl: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png" (string)
reviewCount: 0 (number)
summary: {} (map)
height: "206cm" (string) ← オプション
weight: "113kg" (string) ← オプション
birthDate: "1984年12月30日" (string) ← オプション
country: "アメリカ" (string) ← オプション
```

**📝 詳細な登録方法**: `MANUAL_REGISTRATION.md`を参照してください

**📚 サンプルデータ**: `scripts/sample-players.json`に6名のサンプルがあります（あくまで例です）

### 4. Firestoreセキュリティルールの設定

Firestore Database → 「ルール」タブ：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if false;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
    match /games/{gameId} {
      allow read: if true;
      allow write: if false;
    }
    match /gameReviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

「公開」をクリック

### 5. 開発サーバーの起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開く

## ✅ 動作確認

1. **トップページ**: 八村塁選手のカードが表示される
2. **選手詳細**: カードをクリックして詳細ページへ遷移
3. **レビュー投稿**: 
   - すべての評価項目を選択（S～F）
   - コメントを入力（10文字以上）
   - 「レビューを投稿する」をクリック
4. **レビュー表示**: 投稿したレビューが表示される

## 🎨 主な機能

### UI/UX の特徴

- **游ゴシック体**: 日本語に最適化されたフォント
- **グラデーション**: 美しい青〜紫のカラースキーム
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **アニメーション**: スムーズなトランジション
- **インタラクティブ**: ホバーエフェクトとフィードバック

### レビュー機能

- **16項目評価**: オフェンス・ディフェンス・フィジカルを詳細に評価
- **S～Fグレード**: 直感的な評価システム
- **レーダーチャート**: 選手の能力を視覚化
- **リアルタイム集計**: 投稿と同時に平均評価を更新

### パフォーマンス

- **SSG**: トップページは静的生成（DB負荷ゼロ）
- **ISR**: 選手詳細ページは5分ごとに再検証
- **最適化**: Next.js 15の最新機能を活用

## 📁 追加の選手データ

`scripts/sample-players.json` に6名の選手サンプルデータがあります。
**⚠️ これらはあくまで例です。** 実際の選手情報を正確に登録してください。

詳しい登録方法は `MANUAL_REGISTRATION.md` を参照してください。

### 検索・フィルタリング機能

以下の機能が実装されています：
- **選手名検索**: 名前で選手を検索
- **チームフィルター**: チームで絞り込み
- **ポジションフィルター**: ポジションで絞り込み

これらを活用するために、選手データには `team` と `position` フィールドを必ず設定してください。

## 🔧 トラブルシューティング

### Firebase接続エラー

```
FirebaseError: [code=invalid-argument]
```

→ `.env.local`の設定を確認してください

### ビルドエラー

```bash
npm run build
```

でエラーが出る場合は：
- `node_modules`を削除して`npm install`
- `.next`を削除して再ビルド

### 画像が表示されない

`next.config.ts`を確認：
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.nba.com',
      pathname: '/headshots/nba/**',
    },
  ],
},
```

## 📚 詳細ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [SETUP.md](./SETUP.md) - 詳細なセットアップ手順
- [require.md](../require.md) - 要件定義書

## 🚀 次のステップ

1. **追加の選手を登録**
2. **reCAPTCHA v3を設定**（スパム対策）
3. **Vercel KVを設定**（レート制限）
4. **Vercelにデプロイ**

## 💡 ヒント

- 開発中は`.env.local`をgitignoreに追加
- Firebaseの無料枠で十分運用可能
- 本番環境ではセキュリティルールを厳格に設定

## 🤝 サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

Happy Coding! 🎉

