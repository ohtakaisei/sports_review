# VercelでのFIREBASE_PRIVATE_KEY設定エラー修正方法

## ❌ エラー内容
```
Failed to parse private key: Error: Invalid PEM formatted message.
```

## 🔍 原因
Vercelに`FIREBASE_PRIVATE_KEY`を設定する際の形式が間違っています。

## ✅ 正しい設定方法

### ステップ1: FirebaseからJSONファイルを取得
1. [Firebase Console](https://console.firebase.google.com/) → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」→ JSONファイルをダウンロード

### ステップ2: JSONファイルから値をコピー
JSONファイルを開いて、`private_key`の値をコピーします。

**重要**: JSONファイルの値は以下のような形式です：
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...（長い文字列）...\n-----END PRIVATE KEY-----\n"
```

### ステップ3: Vercelに設定（⚠️重要）

**Vercelでは、ダブルクォート（`"`）を付けません！**

1. Vercelダッシュボード → Settings → Environment Variables
2. `FIREBASE_PRIVATE_KEY`を編集または追加
3. **Value フィールドに以下を貼り付け**（ダブルクォートなし）：

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...（実際のキー）...\n-----END PRIVATE KEY-----\n
```

### ⚠️ 重要なポイント

1. **ダブルクォートを付けない**
   - ❌ 間違い: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - ✅ 正しい: `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`

2. **`\n`はそのまま残す**
   - 改行文字 `\n` を実際の改行に変換しないでください
   - 文字列として `\n` のまま残します

3. **値の前後に空白や改行を入れない**
   - 値はそのまま貼り付けてください

## 📝 具体例

JSONファイルからコピーした値が：
```json
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...abc123...\n-----END PRIVATE KEY-----\n"
```

VercelのValueフィールドには（ダブルクォートなしで）：
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...abc123...\n-----END PRIVATE KEY-----\n
```
を貼り付けます。

## ✅ 確認方法

設定後、再デプロイしてエラーが出なければ成功です。

もしエラーが続く場合は、以下を確認：
1. 値に余分な空白や改行が入っていないか
2. 値の前後にダブルクォートが入っていないか
3. `\n`が実際の改行になっていないか（文字列として`\n`である必要がある）


