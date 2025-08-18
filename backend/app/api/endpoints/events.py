from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.services.csv_events_service import csv_events_service
from app.models import EventInfo
from app.core.config import settings

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

@router.post("/events/sync-from-sheets")
async def sync_events_from_google_sheets(
    authorization: Optional[str] = Header(None)
):
    """
    Google Sheetsからイベントデータを同期（バッチ処理用）
    
    セキュリティのため、CRON_SECRETでの認証が必要
    """
    # 認証チェック
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Bearer トークンの抽出
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    # トークンの検証
    if token != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid authorization token")
    
    try:
        # Google Sheetsから同期
        result = csv_events_service.sync_from_google_sheets_with_validation()
        
        if result["success"]:
            return {
                "message": "Events synchronized successfully from Google Sheets",
                "rows_synced": result["rows_synced"],
                "valid_events": result["valid_events"],
                "sync_time": result["sync_time"]
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Sync failed: {result['error']}"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during sync: {str(e)}"
        )

@router.get("/events/sync-status")
async def get_sync_status():
    """
    同期状況を確認（CSVファイルの存在と最終更新時刻）
    """
    try:
        import os
        from datetime import datetime
        
        events_file = os.path.join("app", "data", "events", "events.csv")
        
        if os.path.exists(events_file):
            # ファイルの最終更新時刻
            mtime = os.path.getmtime(events_file)
            last_modified = datetime.fromtimestamp(mtime).isoformat()
            
            # ファイルサイズ
            file_size = os.path.getsize(events_file)
            
            # イベント数を取得
            events = csv_events_service.get_events_data()
            
            return {
                "csv_exists": True,
                "last_modified": last_modified,
                "file_size_bytes": file_size,
                "total_events": len(events),
                "google_sheets_configured": bool(settings.GOOGLE_SHEETS_ID and settings.GOOGLE_SHEETS_CREDENTIALS)
            }
        else:
            return {
                "csv_exists": False,
                "last_modified": None,
                "file_size_bytes": 0,
                "total_events": 0,
                "google_sheets_configured": bool(settings.GOOGLE_SHEETS_ID and settings.GOOGLE_SHEETS_CREDENTIALS)
            }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking sync status: {str(e)}"
        )
