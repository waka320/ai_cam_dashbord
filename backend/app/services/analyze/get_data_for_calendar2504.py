import pandas as pd
import calendar
from typing import List, Optional
from app.models import DayCongestion

# 各場所の混雑度境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (2300, 9500),
    'honmachi3': (1500, 8500),
    'honmachi4': (1000, 10000),
    'jinnya': (700, 7000),
    'kokubunjidori': (1600, 5800),
    'nakabashi': (1600, 7800),
    'omotesando': (700, 7000),
    'yasukawadori': (7000, 26000),
    'yottekan': (300, 3500),
    # デフォルト値
    'default': (2300, 9500)
}

def get_data_for_calendar(df: pd.DataFrame, year: int, month: int, place: str = 'default') -> List[List[Optional[DayCongestion]]]:
    """
    DataFrameから歩行者データを取得し、カレンダー形式に整形する。
    混雑度を10段階で計算する。日曜始まりのカレンダーを作成する。
    
    Args:
        df: 分析対象のDataFrame
        year: 年
        month: 月
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日ごとの歩行者数を集計
    daily_counts = df_person.groupby(df_person['datetime_jst'].dt.date)[
        'count_1_hour'].sum().reset_index()

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])
    
    step = (max_threshold - min_threshold) / 8  # 各レベル間のステップ
    
    # 境界値を計算
    bins = [0, min_threshold]  # レベル1の範囲は0からmin_thresholdまで
    for i in range(1, 8):
        bins.append(min_threshold + step * i)
    bins.append(max_threshold)  # レベル9の上限＝レベル10の下限
    bins.append(float('inf'))  # レベル10の上限は無限大

    print(bins)  # デバッグ用に境界値を表示
    
    # 定義した境界値に基づいて混雑度レベルを割り当て
    daily_counts['level'] = pd.cut(
        daily_counts['count_1_hour'], 
        bins=bins, 
        labels=False, 
        include_lowest=True
    ) + 1  # レベルを1から始める


    # 該当する月のデータをフィルタリング
    daily_counts['datetime_jst'] = pd.to_datetime(daily_counts['datetime_jst'])
    monthly_counts = daily_counts[
        (daily_counts['datetime_jst'].dt.year == year) &
        (daily_counts['datetime_jst'].dt.month == month)
    ]

    # 日付をインデックスに設定
    monthly_counts.set_index('datetime_jst', inplace=True)

    first_day_weekday = calendar.weekday(year, month, 1)
    first_day_weekday = (first_day_weekday + 1) % 7

    # 月の日数を計算
    days_in_month = calendar.monthrange(year, month)[1]

    # カレンダー形式のデータを作成
    calendar_data: List[List[Optional[DayCongestion]]] = []
    week: List[Optional[DayCongestion]] = [
        None] * first_day_weekday  # 最初の週の空白を埋める

    for day in range(1, days_in_month + 1):
        date = pd.Timestamp(year=year, month=month, day=day)
        if date in monthly_counts.index:
            level = monthly_counts.loc[date, 'level']
        else:
            level = 1  # データがない場合は最低レベル

        day_data = DayCongestion(date=day, congestion=int(level))
        week.append(day_data)

        if len(week) == 7:
            calendar_data.append(week)
            week = []

    # 最後の週が7日に満たない場合、Noneで埋める
    if week:
        week += [None] * (7 - len(week))
        calendar_data.append(week)

    return calendar_data
