from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.foreigners_service import foreigners_stats_service


router = APIRouter()


@router.get("/foreigners/monthly-ranking")
async def get_foreigners_monthly_ranking(
    month: int = Query(
        ...,
        ge=1,
        le=12,
        description="調べたい月 (1-12)。",
    ),
    year: Optional[str] = Query(
        None, description="年度（例: R6）。未指定時は最新年度を使用。"
    ),
    top_n: int = Query(
        5,
        ge=1,
        le=50,
        description="ランキング表示件数（1〜50）。",
    ),
):
    """
    指定した月にどの国が何人・どの割合で来ているかのランキングを返す。
    """

    try:
        data = foreigners_stats_service.get_monthly_ranking(month, year, top_n)
        return {
            "success": True,
            "data": data,
            "message": "月別ランキングデータを取得しました。",
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="外国人宿泊データが見つかりません。")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(
            status_code=500, detail=f"予期しないエラーが発生しました: {exc}"
        ) from exc

