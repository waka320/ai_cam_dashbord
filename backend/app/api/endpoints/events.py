from fastapi import APIRouter
from typing import List
from datetime import datetime, date, timedelta
from app.services.csv_events_service import csv_events_service
from app.models import EventInfo

router = APIRouter()

@router.get("/events/month/{year}/{month}")
async def get_events_by_month(year: int, month: int) -> List[EventInfo]:
    """指定した年月のイベント情報を取得（フロントエンド用）"""
    # 月の最初と最後の日付を計算
    start_date = date(year, month, 1)
    
    if month == 12:
        end_date = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = date(year, month + 1, 1) - timedelta(days=1)
    
    events = csv_events_service.get_events_for_date_range(
        start_date.strftime("%Y-%m-%d"),
        end_date.strftime("%Y-%m-%d")
    )
    
    return [EventInfo(**event) for event in events]