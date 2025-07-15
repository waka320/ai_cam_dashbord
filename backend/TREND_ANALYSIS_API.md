# 混雑度データAPI エンドポイント仕様書

## 概要

既存の分析ファイル（`get_data_for_calendar250414.py`、`get_data_for_date_time250504.py`、`get_data_for_week_time250522.py`）から計算された混雑度（congestion）の数値をそのまま取得するAPIエンドポイント群です。「今日から一週間前まで」の直近データと「前年度の同じ日付の前後」の混雑度データを一覧で提供します。

## エンドポイント一覧

### 1. 利用可能な場所一覧取得

```http
GET /available-places
```

**説明**: 混雑度データ取得が可能な場所のリストを取得します。

**レスポンス例**:

```json
{
  "success": true,
  "data": {
    "available_places": ["honmachi2", "honmachi3", "honmachi4", "jinnya", "kokubunjidori", "nakabashi", "omotesando", "yasukawadori", "yottekan", "gyouzinbashi", "old-town", "station"],
    "unavailable_places": [],
    "total_places": 12
  },
  "message": "12箇所でデータが利用可能です"
}
```

### 2. 場所別詳細混雑度データ

```http
GET /congestion-data/{place}?target_date=YYYY-MM-DD
```

**説明**: 指定した場所の詳細な混雑度データを取得します。

**パラメータ**:

- `place`: 分析対象の場所名（必須）
- `target_date`: 基準日（YYYY-MM-DD形式、省略時は今日）

**レスポンス概要**:

```json
{
  "success": true,
  "data": {
    "place": "honmachi2",
    "analysis_date": "2024-07-15",
    "recent_week": {
      "period": "recent_week",
      "start_date": "2024-07-08",
      "end_date": "2024-07-15",
      "daily_data": [
        {
          "date": "2024-07-08",
          "day_of_week": "Mon",
          "congestion_level": 2,
          "hourly_congestion": [
            {
              "hour": 7,
              "congestion": 2,
              "count": 95,
              "highlighted": false,
              "highlight_reason": "",
              "weather_info": null
            }
            // ... 時間別混雑度データ
          ],
          "is_weekend": false
        }
        // ... 8日分のデータ
      ]
    },
    "historical_comparison": {
      "period": "historical",
      "reference_date": "2023-07-15",
      "data_available": true,
      "daily_data": [
        {
          "date": "2023-07-08",
          "day_of_week": "Mon",
          "congestion_level": 5,
          "hourly_congestion": [...],
          "is_weekend": false,
          "days_from_reference": -7
        }
        // ... 15日分のデータ
      ],
      "weekday_pattern": [
        {
          "day": "月",
          "hours": [
            {
              "hour": 7,
              "congestion": 2,
              "count": 49
            }
            // ... 時間別パターン
          ]
        }
        // ... 7曜日分のパターン
      ]
    }
  },
  "message": "honmachi2の混雑度データが取得されました"
}
```

### 3. 場所別サマリー混雑度データ

```http
GET /congestion-data/{place}/summary?target_date=YYYY-MM-DD
```

**説明**: 指定した場所の混雑度データサマリーを取得します（軽量版）。

**レスポンス例**:

```json
{
  "success": true,
  "data": {
    "place": "yasukawadori",
    "analysis_date": "2025-07-15",
    "recent_week_period": "recent_week",
    "recent_week_start_date": "2025-07-08",
    "recent_week_end_date": "2025-07-15",
    "recent_week_daily_summary": [
      {
        "date": "2025-07-08",
        "day_of_week": "Tue",
        "congestion_level": 3,
        "is_weekend": false
      }
      // ... 8日分のサマリー
    ],
    "historical_period": "historical",
    "historical_data_available": true,
    "historical_reference_date": "2024-07-15",
    "historical_daily_summary": [
      {
        "date": "2024-07-08",
        "day_of_week": "Mon",
        "congestion_level": 6,
        "is_weekend": false,
        "days_from_reference": -7
      }
      // ... 15日分のサマリー
    ]
  },
  "message": "yasukawadoriの混雑度データサマリーが取得されました"
}
```

### 4. 全場所一括混雑度データ

```http
GET /congestion-data/?target_date=YYYY-MM-DD
```

**説明**: 全ての場所の混雑度データをまとめて取得します。

**レスポンス概要**:

```json
{
  "success": true,
  "data": {
    "analysis_date": "2025-07-15",
    "results": {
      "honmachi2": { /* 場所別の詳細混雑度データ */ },
      "honmachi3": { /* 場所別の詳細混雑度データ */ }
      // ... 各場所の結果
    },
    "errors": {
      "場所名": "エラーメッセージ"
    },
    "analyzed_places": 10,
    "total_places": 12
  },
  "message": "10箇所の混雑度データが取得されました"
}
```

## データ項目説明

### 混雑度レベル (congestion_level / congestion)

- **0**: データなし
- **1-2**: 非常に少ない
- **3-4**: 少ない
- **5-6**: 普通（平均的）
- **7-8**: 多い
- **9-10**: 非常に多い

### データ構造

#### 日別データ (daily_data)

- `date`: 日付（YYYY-MM-DD形式）
- `day_of_week`: 曜日（Mon, Tue, Wed...）
- `congestion_level`: その日の混雑度レベル（0-10）
- `hourly_congestion`: 時間別の混雑度データ配列
- `is_weekend`: 週末フラグ
- `days_from_reference`: 基準日からの日数差（履歴データのみ）

#### 時間別データ (hourly_congestion)

- `hour`: 時間（7-22）
- `congestion`: その時間の混雑度レベル（0-10）
- `count`: その時間の歩行者数
- `highlighted`: ハイライト表示フラグ
- `highlight_reason`: ハイライト理由
- `weather_info`: 天気情報（nullの場合あり）

#### 曜日パターン (weekday_pattern)

- `day`: 曜日名（月、火、水...）
- `hours`: その曜日の時間別混雑度パターン

## 使用例

### cURLでのテスト

```bash
# 1. 利用可能な場所を確認
curl -X GET "http://localhost:8000/available-places"

# 2. やすかわ通りの混雑度データサマリーを取得
curl -X GET "http://localhost:8000/congestion-data/yasukawadori/summary"

# 3. 本町2の詳細混雑度データ（特定日付指定）
curl -X GET "http://localhost:8000/congestion-data/honmachi2?target_date=2024-07-15"

# 4. 全場所の混雑度データ
curl -X GET "http://localhost:8000/congestion-data/"
```

### JavaScriptでの呼び出し例

```javascript
// 場所別サマリー取得
async function getCongestionSummary(place, targetDate = null) {
  const url = targetDate 
    ? `/congestion-data/${place}/summary?target_date=${targetDate}`
    : `/congestion-data/${place}/summary`;
    
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    console.log('混雑度データ:', data.data);
    return data.data;
  } else {
    console.error('エラー:', data.message);
    return null;
  }
}

// 使用例
getCongestionSummary('yasukawadori', '2024-07-15');
```

### 混雑度データの可視化例

```javascript
// 直近1週間の混雑度トレンドグラフ用データ
function formatForChart(congestionData) {
  const recentWeek = congestionData.recent_week.daily_data;
  
  return {
    labels: recentWeek.map(day => day.date),
    datasets: [{
      label: '混雑度レベル',
      data: recentWeek.map(day => day.congestion_level),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  };
}

// 時間別混雑度ヒートマップ用データ
function formatForHeatmap(dailyData) {
  return dailyData.map(day => ({
    date: day.date,
    hours: day.hourly_congestion.map(hour => ({
      hour: hour.hour,
      value: hour.congestion
    }))
  }));
}
```

## エラーハンドリング

APIは以下のHTTPステータスコードを返します：

- **200**: 成功
- **400**: 不正なリクエスト（不正な場所名、日付形式など）
- **404**: データファイルが見つからない
- **500**: サーバー内部エラー

エラーレスポンス例：

```json
{
  "detail": "指定された場所 'invalid_place' は利用できません。利用可能な場所: honmachi2, honmachi3, ..."
}
```

## 注意事項

1. **データ可用性**: 前年度のデータが存在しない場合、`historical_comparison.data_available`が`false`になります。
2. **混雑度計算**: 各場所固有の閾値に基づいて既存の分析ファイルで計算された混雑度をそのまま返します。
3. **時間範囲**: 分析は7時から22時までのデータのみを対象とします。
4. **データ更新**: データは定期的に更新され、最新の混雑度が反映されます。
5. **基準日**: 省略時は今日の日付が基準日として使用されます。

## 技術仕様

- **フレームワーク**: FastAPI
- **データ処理**: 既存の分析ファイル（get_data_for_*）を使用
- **日時処理**: Python datetime
- **レスポンス形式**: JSON
- **認証**: 現在は認証なし（将来的に追加予定）

## 既存分析ファイルとの関係

このAPIは以下の既存分析ファイルから混雑度データを取得します：

- `get_data_for_calendar250414.py`: 日別混雑度データ
- `get_data_for_date_time250504.py`: 時間別混雑度データ
- `get_data_for_week_time250522.py`: 曜日パターン混雑度データ

これらのファイルで計算された混雑度の数値をそのまま利用し、独自の傾向分析は行いません。
