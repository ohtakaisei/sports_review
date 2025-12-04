# 🔧 Vercelエラー解決方法

## エラー内容

**"Project "sports-review" already exists, please use a new name."**

このエラーは、Vercelで既に "sports-review" という名前のプロジェクトが存在するために発生しています。

---

## 🎯 解決方法（3つの選択肢）

### 方法1: 既存のプロジェクトを使用する（最も簡単）

既存のプロジェクトがある場合、それを使用できます。

#### 手順：

1. **Vercel Dashboardで既存プロジェクトを確認**
   - [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
   - "sports-review" プロジェクトを探す

2. **既存プロジェクトにGitHubリポジトリを接続**
   - 既存プロジェクトを開く
   - Settings → Git → Connect Git Repository
   - GitHubリポジトリを選択して接続

3. **環境変数を設定**
   - Settings → Environment Variables
   - 必要な環境変数を追加

4. **デプロイ**
   - Deployments タブから手動デプロイ、または
   - GitHubにプッシュすると自動デプロイ

---

### 方法2: 別のプロジェクト名を使用する

新しいプロジェクト名で作成する場合：

#### プロジェクト名の候補：

- `nba-player-review`
- `sport-review-app`
- `player-review-site`
- `sport-review-production`
- `nba-review-2024`

#### 手順：

1. **Vercel Dashboardでインポート時**
   - プロジェクト名を変更して入力
   - 例: `nba-player-review`

2. **または、既存プロジェクト名を変更**
   - 既存の "sports-review" プロジェクトを開く
   - Settings → General → Project Name
   - 名前を変更（例: `sports-review-old`）
   - その後、新しいプロジェクト名で作成

---

### 方法3: 既存プロジェクトを削除して新規作成

既存プロジェクトが不要な場合：

#### 手順：

1. **既存プロジェクトを削除**
   - [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
   - "sports-review" プロジェクトを開く
   - Settings → 一番下までスクロール
   - 「Delete Project」をクリック
   - 確認して削除

2. **新規プロジェクトとして作成**
   - GitHubリポジトリをインポート
   - プロジェクト名: `sports-review` または任意の名前

---

## 🚀 推奨手順（最も簡単）

### オプションA: 既存プロジェクトを使用する場合

1. Vercel Dashboard → 既存の "sports-review" プロジェクトを開く
2. Settings → Git → Connect Git Repository
3. あなたのGitHubリポジトリを選択
4. 環境変数を設定（Settings → Environment Variables）
5. デプロイ完了！

### オプションB: 新しいプロジェクト名で作成する場合

1. GitHubリポジトリをインポート時、プロジェクト名を変更：
   - `nba-player-review`
   - `sport-review-app`
   - など、任意の名前に変更

2. 環境変数を設定

3. デプロイ完了！

---

## 📋 次のステップ

どちらの方法で進めますか？

1. **既存の "sports-review" プロジェクトを使用**
   - → Settings → Git から接続

2. **新しいプロジェクト名を使用**
   - → プロジェクト名を変更して続行

3. **既存プロジェクトを削除して新規作成**
   - → 削除後に新規作成

選択した方法を教えてください。次のステップを案内します！


