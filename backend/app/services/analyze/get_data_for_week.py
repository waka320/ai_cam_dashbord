import pandas as pd
import calendar
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
import os
import glob

# 各場所の混雑度境界値の定義（週単位用）
CONGESTION_THRESHOLDS_WEEK = {
    # 場所ごとの(min_threshold, max_threshold)を定義（日単位の7倍程度）
    'honmachi2': (16100, 66500),
    'honmachi3': (10500, 59500),
    'honmachi4': (7000, 70000),
    'jinnya': (4900, 49000),
    'kokubunjidori': (11200, 40600),
    'nakabashi': (11200, 54600),
    'omotesando': (4900, 49000),
    'yasukawadori': (49000, 182000),
    'yottekan': (2100, 24500),
    'old-town': (5950, 49000),
    'gyouzinbashi': (2100, 9800),
    'station': (2800, 14700),
    # デフォルト値
    'default': (16100, 66500)
}

def get_data_for_week(df: pd.DataFrame, year: int, month: int, place: str = 'default', weather_data: Dict[int, List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、週単位で混雑度を計算する。
    混雑度を10段階で計算する。
    
    Args:
        df: 分析対象のDataFrame
        year: 年
        month: 月
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
        weather_data: 天気データ

    Returns:
        List[Dict[str, Any]]: [{"week": 週番号, "start_date": 開始日, "end_date": 終了日, "congestion": 混雑度, "total_count": 合計人数}, ...] の形式で返す
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    # 該当する年月のデータのみにフィルタリング
    df_month = df_person[
        (df_person[date_col].dt.year == year) &
        (df_person[date_col].dt.month == month)
    ]

    if df_month.empty:
        return []

    # 日付のみの列を追加
    df_month = df_month.copy()
    df_month['date_only'] = df_month[date_col].dt.date

    # 日ごとの歩行者数を集計
    daily_counts = df_month.groupby('date_only')['count_1_hour'].sum().reset_index()
    daily_counts['datetime'] = pd.to_datetime(daily_counts['date_only'])

    # 週番号を追加（ISO週番号）
    daily_counts['week'] = daily_counts['datetime'].dt.isocalendar().week
    daily_counts['year'] = daily_counts['datetime'].dt.isocalendar().year

    # 週ごとの歩行者数を集計
    weekly_counts = daily_counts.groupby(['year', 'week']).agg({
        'count_1_hour': 'sum',
        'datetime': ['min', 'max']
    }).reset_index()

    # カラム名を平坦化
    weekly_counts.columns = ['year', 'week', 'total_count', 'start_date', 'end_date']

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS_WEEK.get(place, CONGESTION_THRESHOLDS_WEEK['default'])

    # データの平均値を計算（混雑度5,6の境界値）
    if not weekly_counts.empty:
        middle_threshold = weekly_counts['total_count'].mean()
    else:
        middle_threshold = (min_threshold + max_threshold) / 2

    # 混雑度1,2〜5,6の間の段階的な境界値を計算
    step_lower = (middle_threshold - min_threshold) / 4

    # 混雑度5,6〜9,10の間の段階的な境界値を計算
    step_upper = (max_threshold - middle_threshold) / 4

    # 境界値のリストを作成
    bins = [0, 1]  # 0=データなし, 1以上=データあり
    bins.append(min_threshold)  # 混雑度1,2の境界

    # 混雑度2,3、3,4、4,5の境界値
    for i in range(1, 4):
        bins.append(min_threshold + i * step_lower)

    # 混雑度5,6の境界値
    bins.append(middle_threshold)

    # 混雑度6,7、7,8、8,9の境界値
    for i in range(1, 4):
        bins.append(middle_threshold + i * step_upper)

    # 混雑度9,10の境界値
    bins.append(max_threshold)

    # 最後に無限大を追加（レベル10の上限）
    bins.append(float('inf'))

    # 定義した境界値に基づいて混雑度レベルを割り当て
    weekly_counts['congestion'] = pd.cut(
        weekly_counts['total_count'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )

    # 結果を整形
    result = []
    for _, row in weekly_counts.iterrows():
        # 週の天気データを集計
        week_weather = None
        if weather_data:
            start_day = row['start_date'].day
            end_day = row['end_date'].day
            week_weather_data = []
            for day in range(start_day, end_day + 1):
                if day in weather_data:
                    week_weather_data.extend(weather_data[day])
            
            if week_weather_data:
                # 最も頻繁に出現する天気を取得
                weather_list = [wd['weather'] for wd in week_weather_data]
                most_common = max(set(weather_list), key=weather_list.count) if weather_list else None
                avg_temp = sum(wd['temperature'] for wd in week_weather_data if wd['temperature'] is not None) / len([wd for wd in week_weather_data if wd['temperature'] is not None]) if any(wd['temperature'] is not None for wd in week_weather_data) else None
                total_rain = sum(wd['rain'] for wd in week_weather_data if wd['rain'] is not None) if any(wd['rain'] is not None for wd in week_weather_data) else None
                
                week_weather = {
                    'weather': most_common,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': round(total_rain, 1) if total_rain is not None else None
                }

        result.append({
            "week": int(row['week']),
            "start_date": row['start_date'].strftime('%Y-%m-%d'),
            "end_date": row['end_date'].strftime('%Y-%m-%d'),
            "congestion": int(row['congestion']),
            "total_count": int(row['total_count']),
            "highlighted": False,
            "highlight_reason": "",
            "weather_info": week_weather
        })

    return result
