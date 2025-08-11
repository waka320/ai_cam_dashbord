import pandas as pd
from typing import Dict, List
from app.models import HourData, DayWithHours

def get_data_for_week_time(csv_path: str, year: int, month: int) -> List[DayWithHours]:
    """
    CSVファイルから曜日ごとの時間帯別データを取得し、モデルに合わせたフォーマットで返す
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
    ].copy()  # コピーを作成して警告を回避
    
    # 曜日ごとの時間帯別データを集計
    df_filtered['weekday'] = df_filtered['datetime_jst'].dt.dayofweek
    df_filtered['hour'] = df_filtered['datetime_jst'].dt.hour
    
    # 曜日と時間帯でグループ化し、人数の平均を計算
    grouped = df_filtered.groupby(['weekday', 'hour'])['count_1_hour'].mean().reset_index()
    
    # 混雑度レベルを計算（10段階）- データがある場合のみ
    if not grouped.empty:
        # データが0より大きい場合のみをフィルタリング
        data_exists = grouped[grouped['count_1_hour'] > 0]
        
        if not data_exists.empty:
            # 10分位でデータを分割して混雑度1〜10を割り当て
            data_exists['level'], _ = pd.qcut(
                data_exists['count_1_hour'], 
                10, 
                labels=False, 
                duplicates='drop', 
                retbins=True
            )
            data_exists['level'] += 1  # レベルを1から始める
            
            # 元のデータフレームにマージ
            grouped = pd.merge(
                grouped, 
                data_exists[['weekday', 'hour', 'level']], 
                on=['weekday', 'hour'], 
                how='left'
            )
        else:
            # データはあるが全て0の場合
            grouped['level'] = 0
    else:
        # データがない場合
        grouped['level'] = 0
    
    # NaN値（データがない時間帯）を0に置き換え
    grouped['level'] = grouped['level'].fillna(0).astype(int)
    
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
        
        # 全時間帯（0-23時）のデータを作成
        for hour in range(24):
            hour_row = day_data[day_data['hour'] == hour]
            
            if not hour_row.empty:
                hour_data = HourData(
                    hour=int(hour),
                    # float値をintに変換して、HourDataのバリデーションエラーを回避
                    count=int(round(hour_row['count_1_hour'].values[0])),
                    congestion=int(hour_row['level'].values[0])
                )
            else:
                # データがない時間帯は混雑度0で埋める
                hour_data = HourData(
                    hour=int(hour),
                    count=0,  # intに変更
                    congestion=0  # データなしは0
                )
            
            hours_data.append(hour_data)
        
        day_with_hours = DayWithHours(
            day=weekday_names[weekday],
            hours=hours_data
        )
        result.append(day_with_hours)
    
    return result
