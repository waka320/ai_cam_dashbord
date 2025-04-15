import pandas as pd
from typing import List, Dict, Any

def get_data_for_date_time(csv_path: str, year: int, month: int) -> List[Dict[str, Any]]:
    """
    CSVファイルから日付ごとの時間帯別データを取得する
    データが存在しない時間帯は混雑度0、データが存在する時間帯は混雑度1〜10で表現する
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
    
    # 混雑度レベルを計算（10段階）- データがある場合のみ
    if not grouped.empty:
        # データが0より大きい場合のみをフィルタリング
        data_exists = grouped[grouped['count_1_hour'] > 0]
        
        if not data_exists.empty:
            # 10分位でデータを分割して混雑度1〜10を割り当て
            data_exists['congestion'], _ = pd.qcut(
                data_exists['count_1_hour'], 
                10, 
                labels=False, 
                duplicates='drop', 
                retbins=True
            )
            data_exists['congestion'] += 1  # レベルを1から始める
            
            # 元のデータフレームにマージ
            grouped = pd.merge(
                grouped, 
                data_exists[['date', 'hour', 'congestion']], 
                on=['date', 'hour'], 
                how='left'
            )
        else:
            # データはあるが全て0の場合
            grouped['congestion'] = 0
    else:
        # データがない場合
        grouped['congestion'] = 0
    
    # NaN値（データがない時間帯）を0に置き換え
    grouped['congestion'] = grouped['congestion'].fillna(0).astype(int)
    
    # 結果を日付ごとにまとめる
    result = []
    dates = sorted(grouped['date'].unique()) if not grouped.empty else []
    
    # 月内の全日付を生成
    all_dates = pd.date_range(
        start=pd.Timestamp(year=year, month=month, day=1),
        end=pd.Timestamp(year=year, month=month, day=pd.Timestamp(year=year, month=month, day=1).days_in_month),
        freq='D'
    ).date
    
    for date in all_dates:
        date_str = str(date)
        day_data = grouped[grouped['date'] == date] if date in dates else pd.DataFrame()
        
        hours_data = []
        if not day_data.empty:
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
                # データがない時間帯は混雑度0で埋める
                complete_hours.append({
                    "hour": hour,
                    "count": 0.0,
                    "congestion": 0,  # データなしは0
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
