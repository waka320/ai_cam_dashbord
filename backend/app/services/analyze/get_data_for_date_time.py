import pandas as pd
from typing import List, Dict, Any

def get_data_for_date_time(csv_path: str, year: int, month: int) -> List[Dict[str, Any]]:
    """
    CSVファイルから日付ごとの時間帯別データを取得する
    """
    # CSVファイルを読み込む
    df = pd.read_csv(csv_path)
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
    
    # 該当する月のデータをフィルタリング
    df_filtered = df[
        (df['datetime_jst'].dt.year == year) &
        (df['datetime_jst'].dt.month == month) &
        (df['name'] == 'person')
    ]
    
    # 日付と時間帯でグループ化
    df_filtered['date'] = df_filtered['datetime_jst'].dt.date
    df_filtered['hour'] = df_filtered['datetime_jst'].dt.hour
    
    grouped = df_filtered.groupby(['date', 'hour'])['count_1_hour'].mean().reset_index()
    
    # 混雑度レベルを計算（10段階）
    if not grouped.empty:
        grouped['congestion'], _ = pd.qcut(grouped['count_1_hour'], 10, labels=False, duplicates='drop', retbins=True)
        grouped['congestion'] += 1  # レベルを1から始める
    else:
        grouped['congestion'] = 1  # データがない場合は最低レベル
    
    # 結果を日付ごとにまとめる
    result = []
    dates = sorted(grouped['date'].unique())
    
    for date in dates:
        date_str = str(date)
        day_data = grouped[grouped['date'] == date]
        
        hours_data = []
        for _, row in day_data.iterrows():
            hour_data = {
                "hour": int(row['hour']),
                "count": float(row['count_1_hour']),
                "congestion": int(row['congestion']),
                "highlighted": False,
                "highlight_reason": None
            }
            hours_data.append(hour_data)
        
        # 時間が連続するように0-23時のデータを作成
        complete_hours = []
        for hour in range(24):
            existing = next((h for h in hours_data if h["hour"] == hour), None)
            if existing:
                complete_hours.append(existing)
            else:
                # データがない時間帯は最低レベルで埋める
                complete_hours.append({
                    "hour": hour,
                    "count": 0.0,
                    "congestion": 1,
                    "highlighted": False,
                    "highlight_reason": None
                })
        
        day_entry = {
            "date": date_str,
            "day": date_str,
            "hours": complete_hours
        }
        result.append(day_entry)
    
    return result
