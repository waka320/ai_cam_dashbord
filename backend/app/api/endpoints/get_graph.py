from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import pandas as pd
from app.services.analyze import get_data_for_calendar as calendar_service
import calendar
import random
from app.models import DayCongestion, GraphRequest, GraphResponse

router = APIRouter()


def generate_dummy_data(year: int, month: int) -> List[List[Optional[DayCongestion]]]:
    days_in_month = calendar.monthrange(year, month)[1]
    data = []
    week = []
    for day in range(1, days_in_month + 1):
        weekday = calendar.weekday(year, month, day)
        if weekday == 0 and week:
            data.append(week)
            week = []
        day_congestion = DayCongestion(
            date=day, congestion=random.randint(1, 10))
        week.append(day_congestion)
    while len(week) < 7:
        week.append(None)
    data.append(week)
    first_week = [None] * calendar.weekday(year, month, 1) + data[0]
    data[0] = first_week + [None] * (7 - len(first_week))
    return data


@router.post("/api/graph")
async def get_graph(request: GraphRequest):
    place = request.place
    year = request.year
    month = request.month
    action = request.action

    if action == "dummy":
        # ダミーデータの生成
        data = generate_dummy_data(request.year, request.month)
        response = GraphResponse(
            graph=f"Graph for {place} in {year}/{month}",
            data=data
        )
        return response

    # "place" に対応するCSVファイルのパスを指定
    csv_file_path = f"app/data/meidai/{place}.csv"
    if not os.path.exists(csv_file_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place")

    try:
        df = pd.read_csv(csv_file_path)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place")

    # 3. データのフィルタリング
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
    df_filtered = df[
        (df['datetime_jst'].dt.year == year) &
        (df['datetime_jst'].dt.month == month) &
        (df['name'] == 'person')
    ]

    # 4. データをカレンダー形式に整形
    calendar_data = calendar_service.get_data_for_calendar(
        df_filtered, year, month)

    # 5. レスポンスの作成
    response = GraphResponse(
        graph=f"Graph for {place} in {year}/{month}",
        data=calendar_data
    )

    return response
