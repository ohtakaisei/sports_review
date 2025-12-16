# Firestoreセキュリティルール更新ガイド

## 🔴 重要: エラー修正

「Missing or insufficient permissions」エラーが発生している場合、Firestoreのセキュリティルールに新しいコレクション（`games`と`gameReviews`）へのアクセス権限を追加する必要があります。

## 📝 更新手順

### 1. Firebaseコンソールを開く

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Firestore Database」をクリック
4. 「ルール」タブをクリック

### 2. セキュリティルールを更新

以下のルールをコピーして、Firebaseコンソールのルールエディタに貼り付け：

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
    
    // gamesコレクション: 読み取りは全員可能、書き込みはサーバーのみ（新規追加）
    match /games/{gameId} {
      allow read: if true;
      allow write: if false;
    }
    
    // gameReviewsコレクション: 読み取りは全員可能、書き込みはサーバーのみ（新規追加）
    match /gameReviews/{reviewId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 3. ルールを公開

1. 「公開」ボタンをクリック
2. 確認ダイアログで「公開」をクリック

### 4. 動作確認

- 試合一覧ページ（`/games`）が正常に表示されること
- 試合詳細ページ（`/games/[gameId]`）が正常に表示されること
- 試合レビューが表示されること

## ⚠️ 注意事項

- `allow write: if false` により、クライアントからの直接書き込みは禁止されています
- 試合結果と試合レビューの作成は、サーバーサイド（API Routes）からのみ可能です
- これにより、セキュリティを維持しながら機能を提供できます

## 🔍 トラブルシューティング

### エラーが続く場合

1. **ブラウザのキャッシュをクリア**: 開発者ツールで「Disable cache」を有効にする
2. **Firebase SDKの再初期化**: ページをリロード
3. **ルールの反映待ち**: ルールの変更が反映されるまで数秒かかる場合があります

### 管理画面で試合結果を追加する場合

管理画面（`/setup`）で試合結果を追加する際は、API Routes経由で実行されるため、セキュリティルールの影響を受けません。



