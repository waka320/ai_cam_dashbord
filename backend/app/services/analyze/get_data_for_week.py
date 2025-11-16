import pandas as pd
from typing import List, Dict, Any
from app.services.analyze.utils.congestion_scale import (
    TOTAL_CONGESTION_LEVELS,
    build_congestion_bins,
)

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
    'default': (16100, 66500)
}


def get_data_for_week(
    df: pd.DataFrame,
    year: int = None,  # 互換性のため残すが使用しない
    month: int = None,  # 互換性のため残すが使用しない
    place: str = 'default',
    weather_data: Dict[int, List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、全期間の週単位で混雑度を計算する。
    混雑度を20段階で計算する。
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    if df_person.empty:
        return []

    # 7時から22時までのデータのみをフィルタリング
    df_person = df_person[
        (df_person[date_col].dt.hour >= 7) & 
        (df_person[date_col].dt.hour <= 22)
    ]

    if df_person.empty:
        return []

    # 日付のみの列を追加
    df_person = df_person.copy()
    df_person['date_only'] = df_person[date_col].dt.date

    # 日ごとの歩行者数を集計
    daily_counts = (
        df_person.groupby('date_only')['count_1_hour']
        .sum()
        .reset_index()
    )
    daily_counts['datetime'] = pd.to_datetime(daily_counts['date_only'])

    # 週番号を追加（ISO週番号）
    daily_counts['week'] = daily_counts['datetime'].dt.isocalendar().week
    daily_counts['year'] = daily_counts['datetime'].dt.isocalendar().year

    # 週ごとの歩行者数を集計
    weekly_counts = (
        daily_counts.groupby(['year', 'week'])
        .agg({
            'count_1_hour': 'sum',
            'datetime': ['min', 'max', 'nunique']
        })
        .reset_index()
    )

    # カラム名を平坦化
    weekly_counts.columns = [
        'year',
        'week',
        'total_count',
        'start_date',
        'end_date',
        'days_with_data'
    ]

    # 欠損期間（週）を除外
    weekly_counts['calendar_days'] = (
        (weekly_counts['end_date'] - weekly_counts['start_date']).dt.days + 1
    )
    weekly_counts['coverage_ratio'] = (
        weekly_counts['days_with_data'] / weekly_counts['calendar_days']
    )
    
    # 7日に満たない週（最新週など）と欠損率が高い週を除外
    coverage_threshold_ratio = 0.8  # より厳しい基準に変更
    weekly_counts = weekly_counts[
        (weekly_counts['calendar_days'] >= 7) &  # 7日以上の週のみ
        (weekly_counts['days_with_data'] >= 5) &  # 最低5日はデータが必要
        (weekly_counts['coverage_ratio'] >= coverage_threshold_ratio)
    ]
    weekly_counts = weekly_counts.drop(
        columns=['days_with_data', 'calendar_days', 'coverage_ratio']
    )

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS_WEEK.get(
        place, CONGESTION_THRESHOLDS_WEEK['default']
    )

    # データの平均値を計算（混雑度5,6の境界値）
    if not weekly_counts.empty:
        middle_raw = weekly_counts['total_count'].mean()
    else:
        middle_raw = (min_threshold + max_threshold) / 2

    # middle を安全な範囲にクランプ（min < middle < max）
    # 下限・上限と同一/逆転になると bins が単調でなくなるため
    middle_threshold = max(
        min(middle_raw, max_threshold - 1),
        min_threshold + 1
    )

    bins = build_congestion_bins(min_threshold, middle_threshold, max_threshold, TOTAL_CONGESTION_LEVELS)

    weekly_counts['congestion'] = pd.cut(
        weekly_counts['total_count'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )

    # 結果を整形
    result = []

    # 開始日でソート（年月週の順になる）
    weekly_counts = weekly_counts.sort_values(by=['start_date'])

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
                weather_list = [wd['weather'] for wd in week_weather_data]
                most_common = (
                    max(set(weather_list), key=weather_list.count)
                    if weather_list else None
                )
                temps = [
                    wd['temperature'] for wd in week_weather_data
                    if wd.get('temperature') is not None
                ]
                avg_temp = (sum(temps) / len(temps)) if temps else None
                rains = [
                    wd['rain'] for wd in week_weather_data
                    if wd.get('rain') is not None
                ]
                total_rain = sum(rains) if rains else None
                week_weather = {
                    'weather': most_common,
                    'avg_temperature': (
                        round(avg_temp, 1)
                        if avg_temp is not None
                        else None
                    ),
                    'total_rain': (
                        round(total_rain, 1)
                        if total_rain is not None
                        else None
                    )
                }

        # 週の開始日から年月を取得
        start_date = row['start_date']
        year = start_date.year
        month = start_date.month

        item = {
            "year": year,
            "month": month,
            "week": int(row['week']),
            "start_date": row['start_date'].strftime('%Y-%m-%d'),
            "end_date": row['end_date'].strftime('%Y-%m-%d'),
            "congestion": int(row['congestion']),
            "total_count": int(row['total_count']),
            "highlighted": False,
            "highlight_reason": "",
            "weather_info": week_weather,
        }

        try:
            start = row['start_date']
            end = row['end_date']
            item['date_range'] = (
                f"{start.strftime('%-m/%-d')}~"
                f"{end.strftime('%-m/%-d')}"
            )
        except Exception:
            pass

        result.append(item)

    return result
