# イベント機能（簡素版）

## 概要

CSVファイルからイベント情報を読み込んで、フロントエンドのヒートマップに表示する機能です。

## ファイル構成

```
backend/app/data/events/
└── events.csv  # イベントデータ（日付, イベント名）

backend/app/services/
└── csv_events_service.py  # CSVファイル読み込み

backend/app/api/endpoints/
└── events.py  # イベントAPI（月間取得のみ）
```

## CSVファイル形式

`backend/app/data/events/events.csv`

```csv
2024/1/24,二十四日市
2025/3/14,雫宮祭
2024/4/14,高山祭
2024/8/3,花火大会
```

- **1列目**: 日付（YYYY/MM/DD形式）
- **2列目**: イベント名

## API

### 月間イベント取得

```
GET /events/month/{year}/{month}
```

**例**:
```bash
curl http://localhost:8000/events/month/2024/8
```

**レスポンス**:
```json
[
  {"date": "2024-08-03", "title": "花火大会"},
  {"date": "2024-08-07", "title": "七夕祭"}
]
```

## 使用方法

1. **CSVファイルにイベントデータを追加**
   - `backend/app/data/events/events.csv`を編集
   - 日付は`YYYY/MM/DD`形式で入力

2. **フロントエンドで自動取得**
   - カレンダー表示時に自動的にイベント情報を取得
   - `EventIcon`コンポーネントでアイコン表示

## フロントエンド連携

- `CalendarContext.js`で月間イベントデータを取得
- `Calendar.js`で`EventIcon`コンポーネントを使用してアイコン表示
- イベント名から自動的にアイコンを判定（🎆花火、🎪祭り、🛒市場など）
