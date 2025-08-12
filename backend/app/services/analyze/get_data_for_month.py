import pandas as pd
import calendar
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
import os
import glob

# 各場所の混雑度境界値の定義（月単位用）
CONGESTION_THRESHOLDS_MONTH = {
    # 場所ごとの(min_threshold, max_threshold)を定義（日単位の30倍程度）
    'honmachi2': (69000, 285000),
    'honmachi3': (45000, 255000),
    'honmachi4': (30000, 300000),
    'jinnya': (21000, 210000),
    'kokubunjidori': (48000, 174000),
    'nakabashi': (48000, 234000),
    'omotesando': (21000, 210000),
    'yasukawadori': (210000, 780000),
    'yottekan': (9000, 105000),
    'old-town': (25500, 210000),
    'gyouzinbashi': (9000, 42000),
    'station': (12000, 63000),
    # デフォルト値
    'default': (69000, 285000)
}

def get_data_for_month(df: pd.DataFrame, year: int, place: str = 'default', weather_data: Dict[int, List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、月単位で混雑度を計算する。
    混雑度を10段階で計算する。
    
    Args:
        df: 分析対象のDataFrame
        year: 年
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
        weather_data: 天気データ

    Returns:
        List[Dict[str, Any]]: [{"month": 月, "congestion": 混雑度, "total_count": 合計人数}, ...] の形式で返す
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    # 該当する年のデータのみにフィルタリング
    df_year = df_person[df_person[date_col].dt.year == year]

    if df_year.empty:
        return []

    # 月ごとの歩行者数を集計
    monthly_counts = df_year.groupby(df_year[date_col].dt.month)['count_1_hour'].sum().reset_index()
    monthly_counts.columns = ['month', 'total_count']

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS_MONTH.get(place, CONGESTION_THRESHOLDS_MONTH['default'])

    # データの平均値を計算（混雑度5,6の境界値）
    if not monthly_counts.empty:
        middle_threshold = monthly_counts['total_count'].mean()
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
    monthly_counts['congestion'] = pd.cut(
        monthly_counts['total_count'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )

    # 結果を整形
    result = []
    for _, row in monthly_counts.iterrows():
        # 月の天気データを集計
        month_weather = None
        if weather_data:
            month_weather_data = []
            for day_data in weather_data.values():
                month_weather_data.extend(day_data)
            
            if month_weather_data:
                # 最も頻繁に出現する天気を取得
                weather_list = [wd['weather'] for wd in month_weather_data]
                most_common = max(set(weather_list), key=weather_list.count) if weather_list else None
                avg_temp = sum(wd['temperature'] for wd in month_weather_data if wd['temperature'] is not None) / len([wd for wd in month_weather_data if wd['temperature'] is not None]) if any(wd['temperature'] is not None for wd in month_weather_data) else None
                total_rain = sum(wd['rain'] for wd in month_weather_data if wd['rain'] is not None) if any(wd['rain'] is not None for wd in month_weather_data) else None
                
                month_weather = {
                    'weather': most_common,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': round(total_rain, 1) if total_rain is not None else None
                }

        result.append({
            "month": int(row['month']),
            "month_name": calendar.month_name[int(row['month'])],
            "congestion": int(row['congestion']),
            "total_count": int(row['total_count']),
            "highlighted": False,
            "highlight_reason": "",
            "weather_info": month_weather
        })

    return result
