import pandas as pd
import calendar
from typing import List, Optional
from app.models import DayCongestion


def get_data_for_calendar(df: pd.DataFrame, year: int, month: int) -> List[List[Optional[DayCongestion]]]:
    """
    DataFrameから歩行者データを取得し、カレンダー形式に整形する。
    混雑度を10段階で計算する。日曜始まりのカレンダーを作成する。
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日ごとの歩行者数を集計
    daily_counts = df_person.groupby(df_person['datetime_jst'].dt.date)[
        'count_1_hour'].sum().reset_index()

    # 混雑度を10段階で計算
    daily_counts['level'], _ = pd.qcut(
        daily_counts['count_1_hour'], 10, duplicates='drop', labels=False, retbins=True)
    daily_counts['level'] += 1  # レベルを1から始める

    # 日付をインデックスに設定
    daily_counts.set_index('datetime_jst', inplace=True)

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
        if date in daily_counts.index:
            level = daily_counts.loc[date, 'level']
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
