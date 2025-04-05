import pandas as pd
from typing import Dict, List
from app.models import HourData, DayWithHours

def get_data_for_week_time(csv_path: str, year: int, month: int) -> List[DayWithHours]:
    """
    CSVファイルから曜日ごとの時間帯別データを取得し、モデルに合わせたフォーマットで返す
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
    
    # 曜日ごとの時間帯別データを集計
    df_filtered['weekday'] = df_filtered['datetime_jst'].dt.dayofweek
    df_filtered['hour'] = df_filtered['datetime_jst'].dt.hour
    
    # 曜日と時間帯でグループ化し、人数の合計を計算
    grouped = df_filtered.groupby(['weekday', 'hour'])['count_1_hour'].mean().reset_index()
    
    # 混雑度レベルを計算（10段階）
    grouped['level'], _ = pd.qcut(grouped['count_1_hour'], 10, labels=False, duplicates='drop', retbins=True)
    grouped['level'] += 1  # レベルを1から始める
    
    # 曜日の数字を日本語名に変換
    weekday_names = {
        0: '月曜日',
        1: '火曜日',
        2: '水曜日',
        3: '木曜日',
        4: '金曜日',
        5: '土曜日',
        6: '日曜日'
    }
    
    # 結果をモデルに合わせたフォーマットに変換
    result = []
    for weekday in range(7):
        day_data = grouped[grouped['weekday'] == weekday]
        hours_data = []
        
        for _, row in day_data.iterrows():
            hour_data = HourData(
                hour=int(row['hour']),
                count=int(row['count_1_hour']),
                congestion=int(row['level'])
            )
            hours_data.append(hour_data)
        
        # 時間帯でソート
        hours_data.sort(key=lambda x: x.hour)
        
        day_with_hours = DayWithHours(
            day=weekday_names[weekday],
            hours=hours_data
        )
        result.append(day_with_hours)
    
    return result
