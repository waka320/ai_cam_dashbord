# 目的ベースダッシュボードWebアプリケーション仕様書

## Links

- [前ダッシュボード](http://35.73.95.100:81/)
- [フロントデプロイ先](https://ai-cam-dashbord.vercel.app/)
- [デザイン(figma)](https://www.figma.com/design/C8bbdecPpwqYXlfJxEWouf/Untitled?node-id=0-1&t=zrU2JK2cVNs5sWGY-1)

## 1. プロダクト概要

### 1.1. コンセプト

本プロダクトは、安田・遠藤・浦田研究室の「高山市におけるデータ地産地消プロジェクト」の一環として開発された目的ベースのダッシュボードです。AIカメラで収集した人流データを商店街の事業者が活用できるように設計されています[3][4]。

特に「何をデータを使用してすれば良いのかわからない」という事業者の課題に対して、「目的を先に入力させてから、適切なデータを示す」という解決アプローチを採用しています。地域DX推進のためのデータ活用ツールとして、複数の可視化機能と直感的なインターフェースを提供します[7]。

### 1.2. ターゲットユーザー

- 高山市の商店街事業者（主要ターゲット）[7]
- 観光関連事業者
- 地方自治体の観光・商工担当者
- データ活用を検討している地域の事業者

### 1.3. 提供価値

- データ活用の敷居を下げる使いやすいインターフェース
- 目的から逆算したデータ提示による意思決定支援[4]
- 人流データの視覚化による商業活動の最適化支援
- 地域事業者のDX促進と売上向上支援[6]

## 2. 技術スタック

### 2.1. フロントエンド

- **フレームワーク:** React.js + Next.js[2]
- **UIライブラリ:** Material-UI（MUI）
- **状態管理:** コンテキストAPI（CalendarContext）
- **スタイリング:** MUIテーマとカスタムCSS
- **UI/コンポーネント:** カレンダー、ヒートマップなど
- **メディアクエリ:** レスポンシブデザイン対応
- **アイコン:** Material-UIアイコン
- **ビルドシステム:** Node.js v22.x[2]

### 2.2. バックエンド

- **フレームワーク:** FastAPI（Python 3.12）[1]
- **データ処理:** カスタム分析サービス（analyze/）
- **AI機能:** AIサービス（ai_service.py、ai_service_debug.py）
- **データ可視化:** ヒストグラム生成、ヒートマップなど
- **ハイライト機能:** highlighter_service.py
- **サーバー:** Uvicorn + Nginx[1]

### 2.3. データソース

- **データ形式:** CSVファイル[4]
- **取得方法:** 外部APIからのCSVデータ取得（fetch_csv.py）
- **保存場所:** ローカルディレクトリ構造
- **外部連携:** AWS S3からのデータ取得（exmeidai用）[4]

### 2.4. インフラストラクチャー

- **フロントエンド:** Vercel（ホスティング）[2]
- **バックエンド:** AWS EC2インスタンス[1]
- **CI/CD:** GitHub Actions[1][2]
- **API連携:** Gemini API（AIサービス用）[4]
- **リバースプロキシ:** Nginx[1]

## 3. デプロイメント構成

### 3.1. フロントエンドデプロイ（Vercel）

- **自動デプロイ:** GitHub Actionsワークフロー（ci_front.yaml）[2]
- **ビルドプロセス:**
  - Node.js 22.xセットアップ
  - 依存関係インストール（npm ci）
  - ビルド実行（npm run build）
  - Vercelへの自動デプロイ
- **環境変数:** Vercel環境で設定

### 3.2. バックエンドデプロイ（AWS EC2）

- **自動デプロイ:** GitHub Actionsワークフロー（ci_back.yaml）[1]
- **デプロイプロセス:**
  - コードをSSH経由でEC2インスタンスに転送
  - Python仮想環境の更新
  - 依存関係インストール
  - Uvicornサーバー再起動（ポート8000）
  - Nginx設定確認と再読み込み
- **実行環境:** Python 3.12仮想環境
- **エラーログ:** app.logファイル

### 3.3. システム構成図

```
[ユーザー] --> [Vercel (フロントエンド)] --> [AWS EC2 (バックエンド API)] --> [CSVデータストア]
                                          |
                                          v
                                    [Gemini API]
```

## 4. ディレクトリ構成

```
.
├── backend/                      # バックエンドコード
│   ├── app/                      # メインアプリケーション
│   │   ├── api/                  # API定義
│   │   │   └── endpoints/        # APIエンドポイント
│   │   │       ├── csv_analysis.py       # CSV分析API
│   │   │       ├── fetch_csv_exmeidai.py # 拡張データ取得
│   │   │       ├── fetch_csv.py          # CSVデータ取得
│   │   │       ├── get_graph.py          # グラフデータ生成
│   │   │       └── root.py               # ルートエンドポイント
│   │   ├── core/                 # コア設定
│   │   │   └── config.py         # アプリケーション設定
│   │   ├── services/             # ビジネスロジック
│   │   │   ├── ai_service.py     # AIアドバイス生成
│   │   │   ├── ai_service_debug.py # デバッグ用AIサービス
│   │   │   ├── highlighter_service.py # データハイライト
│   │   │   └── analyze/          # データ分析サービス
│   │   │       ├── analyze_event.py        # イベント分析
│   │   │       ├── analyze_weather.py      # 天候分析
│   │   │       ├── generate_histograms.py  # ヒストグラム生成
│   │   │       ├── get_data_for_calendar.py # カレンダーデータ
│   │   │       ├── get_data_for_date_time.py # 日付×時間データ
│   │   │       └── get_data_for_week_time.py # 曜日×時間データ
│   │   ├── main.py               # アプリケーションエントリーポイント
│   │   └── models.py             # データモデル定義
│   ├── requirements.txt          # 依存関係
│   ├── run.py                    # 実行スクリプト
│   └── vercel.json               # Vercelデプロイ設定
│
├── frontend/                     # フロントエンドコード
│   ├── public/                   # 静的ファイル
│   │   ├── assets/               # 画像などのアセット
│   │   ├── fonts/                # フォントファイル
│   │   └── index.html            # HTMLエントリーポイント
│   ├── src/                      # ソースコード
│       ├── components/           # Reactコンポーネント
│       │   ├── common/           # 共通コンポーネント
│       │   │   ├── Calendar.js           # カレンダービュー
│       │   │   ├── CongestionLegend.js   # 混雑度凡例
│       │   │   ├── DateTimeHeatmap.js    # 日付×時間ヒートマップ
│       │   │   ├── HeatmapPopper.js      # ポップアップ
│       │   │   ├── Inputs.js             # 入力コンポーネント
│       │   │   ├── SelectionControls.js  # 選択コントロール
│       │   │   └── TimeHeatmap.js        # 時間ヒートマップ
│       │   ├── layout/           # レイアウトコンポーネント
│       │   │   ├── AISection.js          # AI分析セクション
│       │   │   ├── Content.js            # メインコンテンツ
│       │   │   └── Header.js             # ヘッダー
│       │   └── ui/               # UIコンポーネント
│       ├── contexts/             # Reactコンテキスト
│       │   └── CalendarContext.js # データと状態管理
│       ├── styles/               # CSSスタイル
│       └── theme/                # テーマ設定
│           └── theme.js          # MUIテーマ定義
│
├── .github/workflows/            # GitHub Actionsワークフロー
│   ├── ci_back.yaml              # バックエンドCI/CD設定
│   └── ci_front.yaml             # フロントエンドCI/CD設定
│
└── vercel.json                   # プロジェクトレベルのVercel設定
```

## 5. フロントエンドの主要コンポーネント

### 5.1. 可視化コンポーネント

| コンポーネント | 目的 | 主要機能 |
|--------------|------|---------|
| `Calendar.js` | 月間カレンダー形式表示 | 月内の各日の混雑度をヒートマップで表示、ハイライト機能、詳細ポップアップ |
| `TimeHeatmap.js` | 曜日×時間表示 | 曜日と時間帯の組み合わせによる混雑度マトリックス、ハイライト機能 |
| `DateTimeHeatmap.js` | 日付×時間表示 | 特定月の日付と時間帯ごとの詳細な混雑度、ハイライト機能 |
| `CongestionLegend.js` | 混雑度凡例 | 混雑度1〜10の色スケール定義と表示 |

### 5.2. 入力・制御コンポーネント

| コンポーネント | 目的 | 主要機能 |
|--------------|------|---------|
| `Inputs.js` | 計測場所選択 | 高山市内9箇所の計測位置から選択するドロップダウン |
| `SelectionControls.js` | 表示制御 | 場所、表示タイプ、年月選択、リセット機能 |
| `HeatmapPopper.js` | 詳細表示 | セルクリック時のポップアップ、レスポンシブ対応 |

### 5.3. レイアウトコンポーネント

| コンポーネント | 目的 | 主要機能 |
|--------------|------|---------|
| `Header.js` | ヘッダー表示 | ナビゲーション、目的選択UI |
| `Content.js` | メインコンテンツ | 可視化コンポーネントとAIセクションの配置 |
| `AISection.js` | AI分析表示 | AIによるデータ分析結果の表示、対話機能 |

## 6. バックエンドのAPI設計

### 6.1. 公開エンドポイント

| エンドポイント | メソッド | 説明 | パラメータ |
|--------------|---------|------|-----------|
| `/api/get-graph` | POST | グラフデータ取得 | location, year, month, action |
| `/api/fetch-csv` | GET | CSVデータ取得 | なし（内部処理） |
| `/api/fetch-csv-exmeidai` | GET | 拡張データ取得 | なし（内部処理） |
| `/api/analyze-csv` | POST | CSV分析実行 | csvData, question |

### 6.2. サービスレイヤー

| サービス | 目的 | 主要機能 |
|---------|------|---------|
| `ai_service.py` | AIアドバイス生成 | CSVデータ分析、目的別アドバイス生成、Gemini API連携 |
| `highlighter_service.py` | データハイライト | 目的に応じたデータポイントの強調、複数戦略 |
| `analyze/` モジュール群 | データ分析 | カレンダー、時間帯、曜日別データの生成と分析 |

## 7. CI/CD設定

### 7.1. バックエンドCI/CD (ci_back.yaml)

- **トリガー:** main ブランチへのプッシュ
- **プロセス:**
  1. Ubuntu環境でのPython 3.12セットアップ
  2. 依存関係のインストールとテスト
  3. AWS認証情報の設定
  4. SSH鍵のインストール
  5. バックエンドコードをEC2にSCP転送
  6. EC2上でデプロイスクリプト実行:
     - Python仮想環境の更新
     - 依存関係インストール
     - Uvicornサーバー再起動
     - Nginx設定確認と再読み込み

### 7.2. フロントエンドCI/CD (ci_front.yaml)

- **トリガー:** main ブランチへのプッシュ
- **プロセス:**
  1. Ubuntu環境でのNode.js 22.xセットアップ
  2. NPMキャッシュの設定
  3. Next.jsビルドキャッシュの設定
  4. 依存関係のインストール
  5. Next.jsアプリケーションのビルド
  6. Vercelへの自動デプロイ（Vercel連携時）

## 8. 技術的課題と改善点

### 8.1. フロントエンドの課題

- **コードの重複と分離:** 可視化コンポーネント間での類似コードの重複
- **状態管理の集中化:** CalendarContextが肥大化している
- **エラーハンドリングの強化:** ユーザーへのエラー表示が最小限
- **パフォーマンス最適化:** 大量データ処理時の考慮不足
- **アクセシビリティ対応:** 色覚特性への配慮が不足
- **レスポンシブデザインの改善:** 小画面での閲覧性向上
- **コンポーネントテストの不足:** テストコードの導入検討

### 8.2. バックエンドの課題

- **データ管理の最適化:** CSVファイルベースからデータベースへの移行検討
- **コードの重複解消:** 類似サービスの統合
- **エラー処理の強化:** より体系的なエラーハンドリング
- **設定管理の改善:** ハードコード設定の外部化
- **テスト強化:** テストカバレッジの向上

### 8.3. インフラの課題

- **EC2インスタンス管理:** スケーリングと可用性の検討
- **デプロイプロセスの改善:** ブルー/グリーンデプロイなどの検討
- **モニタリングの強化:** アプリケーションとインフラのモニタリング導入
- **バックアップと復旧戦略:** データ保全策の検討

## 9. 今後の開発計画

### 9.1. 短期目標

- UI/UXの改善と最適化
- 新しいデータソースの追加
- データ分析機能の強化
- ユーザーフィードバックの反映

### 9.2. 中長期目標

- 他地域への横展開（既に愛知県の円頓寺商店街に展開開始）
- ユーザーベースの拡大（観光客向け機能の追加）
- データベース化によるデータ管理改善
- AIプレディクション機能の強化

---

本仕様書は開発の進捗に応じて随時更新されます。

Citations:
[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/38158032/cfd9b7bd-45ee-42b7-9eee-cb5d77a8bd7f/ci_back.yaml
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/38158032/b21a5f79-e8b6-4f22-a783-805872706c67/ci_front.yaml
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_260a9487-2d1b-4387-b833-a2bd27b08e44/a06df6e7-f560-4740-8024-a4b7c82dfa9a/Ruo-Song-Yong-Xi-_20250416sahusemi.pdf
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_260a9487-2d1b-4387-b833-a2bd27b08e44/6f4167a1-6c80-410a-a7c4-2a47662707eb/Ruo-Song-Yong-Xi-_Mu-De-hesutatusiyuhoto1.pdf
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_260a9487-2d1b-4387-b833-a2bd27b08e44/c3eb6b1a-df25-47dd-bb2a-59b2262f19d7/Ruo-Song-Yong-Xi-_Quan-Ti-semi250410.pdf
[6] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_260a9487-2d1b-4387-b833-a2bd27b08e44/67d7888f-2aa1-4e8d-b5ad-5d9e84f603a7/DXHui-Yi.pptx
[7] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_260a9487-2d1b-4387-b833-a2bd27b08e44/d7948198-492c-4986-9c93-56b298da0384/192-Ruo-Song-Yong-Xi-Gao-Shan-Fa-Chao-sinhuru-Mu-De-hesutatusiyuhoto-Bu-Xing-Zhe-Shu-ohuntetateGuan-Guang-Huo-Xing-Hua.pdf

---
Perplexity の Eliot より: pplx.ai/share
