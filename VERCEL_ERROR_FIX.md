# 🔧 Vercelエラー解決方法

## エラー内容

"Project "sports-review" already exists, please use a new name."

このエラーは、Vercelで既に "sports-review" という名前のプロジェクトが存在するために発生しています。

## 解決方法

### 方法1: 既存のプロジェクトにリンクする（推奨）

既存のプロジェクトを削除せずに使用する場合：

1. **既存プロジェクトを使用する**
   - プロジェクト設定画面で「Link to existing project?」→ `Y`（Yes）を選択
   - 既存のプロジェクト一覧から選択

2. **または、Vercel Dashboardから既存プロジェクトを削除**
   - [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
   - 既存の "sports-review" プロジェクトを探す
   - Settings → 一番下の「Delete Project」をクリック
   - 削除後、新しいプロジェクトとして作成

### 方法2: 別のプロジェクト名を使用する

プロジェクト名を変更する場合：

1. **新しいプロジェクト名を入力**
   - 例: `sport-review-app`
   - 例: `player-review-site`
   - 例: `nba-player-review`

2. **プロジェクト名の候補**
   - `sport-review-v2`
   - `nba-review-site`
   - `player-review-2024`
   - `sport-review-production`

### 方法3: Vercel Dashboardから直接設定

ブラウザから直接設定する場合：

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. 既存の "sports-review" プロジェクトがある場合：
   - **Option A**: 既存プロジェクトを使用
     - 既存プロジェクトを開く
     - Settings → Git → GitHubリポジトリを接続
   - **Option B**: 既存プロジェクトを削除して新規作成
     - 既存プロジェクト → Settings → 一番下「Delete Project」
     - 削除後、新規プロジェクトとして作成

## 推奨アクション

### 既存プロジェクトを確認

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. プロジェクト一覧を確認
3. "sports-review" という名前のプロジェクトがあるか確認

### 既存プロジェクトがない場合

- プロジェクト名を変更して続行
- 例: `nba-player-review` など

### 既存プロジェクトがある場合

- 既存プロジェクトにGitHubリポジトリを接続
- または、既存プロジェクトを削除して新規作成

---

次に進むために、以下の情報を教えてください：

1. **既存の "sports-review" プロジェクトは使用したいですか？**
   - はい → 既存プロジェクトに接続
   - いいえ → 新しいプロジェクト名を使用

2. **新しいプロジェクト名を希望する場合、どの名前にしますか？**

この情報があれば、次のステップを案内します！

