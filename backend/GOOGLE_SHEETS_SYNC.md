# Google Sheets同期機能

Google Sheetsからイベントデータを取得して、CSVファイルに同期する機能です。

## 🔧 設定

### 1. 環境変数

以下の環境変数を設定してください：

```bash
GOOGLE_SHEETS_ID="your_google_sheets_id"
GOOGLE_SHEETS_CREDENTIALS='{"type": "service_account", ...}'
CRON_SECRET="your_secret_token"
```

### 2. Google Sheets ID の取得

Google SheetsのURLから取得できます：

```
https://docs.google.com/spreadsheets/d/[GOOGLE_SHEETS_ID]/edit
```

### 3. サービスアカウント認証情報

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Sheets API を有効化
3. サービスアカウントを作成してキーをJSON形式でダウンロード
4. JSON全体を`GOOGLE_SHEETS_CREDENTIALS`環境変数に設定
5. Google Sheetsでサービスアカウントのメールアドレスに読み取り権限を付与

## 📊 データ形式

Google Sheetsの「**イベント情報**」シートは以下の形式である必要があります：

| 列A (日付) | 列B (イベント名) |
|-----------|----------------|
| 2024/1/15 | 新年会 |
| 2024/2/14 | バレンタイン |
| 2024/3/3  | ひな祭り |

**重要**: シート名は必ず「**イベント情報**」にしてください。

### サポートする日付形式

- `YYYY/MM/DD` (例: 2024/1/15)
- `YYYY-MM-DD` (例: 2024-01-15)

## 🚀 使用方法

### 1. スクリプトによる同期

```bash
cd backend
python sync_events.py
```

### 2. API経由での同期

```bash
curl -X POST "https://your-api-domain.com/events/sync-from-sheets" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. 同期状況の確認

```bash
curl "https://your-api-domain.com/events/sync-status"
```

## 🔄 定期実行（本番環境）

### GitHub Actions の例

```yaml
name: Sync Events
on:
  schedule:
    - cron: '0 */6 * * *'  # 6時間ごと

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync Events from Google Sheets
        run: |
          curl -X POST "https://your-api-domain.com/events/sync-from-sheets" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Vercel Cron Jobs の例

```javascript
// api/cron/sync-events.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://your-backend-domain.com/events/sync-from-sheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 📁 ファイル構成

```
backend/
├── app/
│   ├── services/
│   │   └── csv_events_service.py    # メイン同期ロジック
│   ├── api/endpoints/
│   │   └── events.py                # API エンドポイント
│   ├── core/
│   │   └── config.py               # 環境変数設定
│   └── data/events/
│       └── events.csv              # 同期されたデータ
├── sync_events.py                  # 手動同期スクリプト
└── requirements.txt                # 依存関係
```

## 🛠️ トラブルシューティング

### よくあるエラー

1. **認証エラー**: サービスアカウントに適切な権限が付与されているか確認
2. **シートが見つからない**: Google Sheets IDが正しいか確認
3. **データ形式エラー**: 日付形式が正しいか確認

### ログの確認

```bash
# API サーバーのログを確認
tail -f logs/app.log

# 手動同期時のログ
python sync_events.py
```

## 🔒 セキュリティ

- API エンドポイントは`CRON_SECRET`で保護されています
- サービスアカウント認証情報は環境変数で管理
- Google Sheetsには読み取り専用権限のみ付与

## 📈 監視

同期状況は以下のエンドポイントで確認できます：

```bash
GET /events/sync-status
```

レスポンス例：

```json
{
  "csv_exists": true,
  "last_modified": "2024-01-15T10:30:00",
  "file_size_bytes": 1024,
  "total_events": 15,
  "google_sheets_configured": true
}
```
