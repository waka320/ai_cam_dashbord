

import pandas as pd
from typing import List, Optional
import calendar
from app.models import DayCongestion


def get_data_for_calendar(df: pd.DataFrame, year: int, month: int) -> List[List[Optional[DayCongestion]]]:
    """
    DataFrameから歩行者データを取得し、カレンダー形式に整形する。
    """
    # 日ごとの歩行者数を集計
    daily_counts = df.groupby(df['datetime_jst'].dt.day)['count_1_hour'].sum()

    # カレンダーの最初の日の曜日を計算
    first_day_weekday = calendar.weekday(year, month, 1)

    # 月の日数を計算
    days_in_month = calendar.monthrange(year, month)[1]

    # カレンダー形式のデータを作成
    calendar_data: List[List[Optional[DayCongestion]]] = []
    week: List[Optional[DayCongestion]] = [
        None] * first_day_weekday  # 最初の週の空白を埋める

    for day in range(1, days_in_month + 1):
        congestion = daily_counts.get(day, 0)  # その日の歩行者数を取得、存在しない場合は0
        day_data = DayCongestion(date=day, congestion=int(congestion))
        week.append(day_data)

        if len(week) == 7:
            calendar_data.append(week)
            week = []

    # 最後の週が7日に満たない場合、Noneで埋める
    if week:
        week += [None] * (7 - len(week))
        calendar_data.append(week)

    return calendar_data
