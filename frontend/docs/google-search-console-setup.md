# Google Search Console設定ガイド

## 1. サイトの登録
1. [Google Search Console](https://search.google.com/search-console/)にアクセス
2. 「プロパティを追加」をクリック
3. 「URLプレフィックス」を選択し、`https://ai-cam-dashbord.vercel.app`を入力

## 2. 所有権の確認
以下のいずれかの方法で所有権を確認：

### HTMLファイル方法
1. Search ConsoleからダウンロードしたHTMLファイルを`public/`フォルダに配置
2. ファイル名例: `google[ランダム文字列].html`

### HTMLタグ方法（推奨）
1. Search Consoleから提供されるメタタグを取得
2. `public/index.html`の`<head>`セクションに追加
例: `<meta name="google-site-verification" content="[確認コード]" />`

## 3. サイトマップの送信
1. Search Consoleで「サイトマップ」メニューを選択
2. `sitemap.xml`を送信
3. URL: `https://ai-cam-dashbord.vercel.app/sitemap.xml`

## 4. インデックス登録の確認
- 「URL検査」ツールを使用してページがインデックスされているか確認
- 新しいページがある場合は「インデックス登録をリクエスト」

## 5. パフォーマンスの監視
- 検索パフォーマンスレポートで検索結果での表示状況を確認
- カバレッジレポートでインデックス状況を監視
- Core Web Vitalsでページ体験を確認
