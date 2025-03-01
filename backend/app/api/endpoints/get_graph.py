from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter()


class GraphRequest(BaseModel):
    place: str
    action: str
    year: int
    month: int


class DayCongestion(BaseModel):
    date: int
    congestion: int


class GraphResponse(BaseModel):
    graph: str
    data: List[List[Optional[DayCongestion]]]


@router.post("/api/graph")
async def get_graph(request: GraphRequest):
    # ダミーデータを生成する関数
    def generate_dummy_data(year: int, month: int) -> List[List[Optional[DayCongestion]]]:
        import calendar

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

        # 最後の週を埋める
        while len(week) < 7:
            week.append(None)
        data.append(week)

        # 最初の週を埋める
        first_week = [None] * calendar.weekday(year, month, 1) + data[0]
        data[0] = first_week + [None] * (7 - len(first_week))

        return data

    # ダミーデータを生成
    dummy_data = generate_dummy_data(request.year, request.month)

    # レスポンスを作成
    response = GraphResponse(
        graph=f"Graph for {request.place} {request.action} in {request.year}/{request.month}",
        data=dummy_data
    )
    print(response)

    return response
