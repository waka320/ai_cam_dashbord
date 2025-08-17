from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
import os
from app.services.analyze.get_trend_analysis import get_congestion_data

router = APIRouter()

# データディレクトリの設定
DATA_DIR = os.path.join("app", "data", "meidai")

# 利用可能な場所のリスト
AVAILABLE_PLACES = [
    "honmachi2", "honmachi3", "honmachi4", "jinnya", "kokubunjidori", 
    "nakabashi", "omotesando", "yasukawadori", "yottekan", 
    "gyouzinbashi", "old-town", "station"
]

@router.get("/congestion-data/{place}")
async def get_place_congestion_data(
    place: str,
    target_date: Optional[str] = Query(None, description="基準日 (YYYY-MM-DD形式、省略時は今日)"),
    weeks_count: Optional[int] = Query(3, description="取得する週数 (デフォルト3週間)")
):
    """
    指定した場所の混雑度データを取得する
    
    - **place**: 分析対象の場所名
    - **target_date**: 基準日（省略時は今日の日付）
    
    返却データ:
    - recent_week: 直近1週間の混雑度データ
    - historical_comparison: 去年度同時期の混雑度データ
    """
    try:
        # 場所名の検証
        if place not in AVAILABLE_PLACES:
            raise HTTPException(
                status_code=400, 
                detail=f"指定された場所 '{place}' は利用できません。利用可能な場所: {', '.join(AVAILABLE_PLACES)}"
            )
        
        # CSVファイルのパスを構築
        csv_file_path = os.path.join(DATA_DIR, f"{place}.csv")
        
        # ファイルの存在確認
        if not os.path.exists(csv_file_path):
            raise HTTPException(
                status_code=404, 
                detail=f"場所 '{place}' のデータファイルが見つかりません"
            )
        
        # 基準日の解析
        analysis_date = None
        if target_date:
            try:
                analysis_date = datetime.strptime(target_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="日付形式が正しくありません。YYYY-MM-DD形式で入力してください"
                )
        
        # 混雑度データの取得
        result = get_congestion_data(csv_file_path, analysis_date, weeks_count)
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="混雑度データの取得中にエラーが発生しました"
            )
        
        return {
            "success": True,
            "data": result,
            "message": f"{place}の混雑度データが取得されました"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"予期しないエラーが発生しました: {str(e)}"
        )

@router.get("/congestion-data/")
async def get_all_places_congestion_data(
    target_date: Optional[str] = Query(None, description="基準日 (YYYY-MM-DD形式、省略時は今日)")
):
    """
    全ての場所の混雑度データを取得する
    
    - **target_date**: 基準日（省略時は今日の日付）
    
    各場所の混雑度データをまとめて返却
    """
    try:
        # 基準日の解析
        analysis_date = None
        if target_date:
            try:
                analysis_date = datetime.strptime(target_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="日付形式が正しくありません。YYYY-MM-DD形式で入力してください"
                )
        
        results = {}
        errors = {}
        
        # 各場所のデータを取得
        for place in AVAILABLE_PLACES:
            try:
                csv_file_path = os.path.join(DATA_DIR, f"{place}.csv")
                
                # ファイルが存在する場合のみ取得実行
                if os.path.exists(csv_file_path):
                    result = get_congestion_data(csv_file_path, analysis_date)
                    if result:
                        results[place] = result
                    else:
                        errors[place] = "混雑度データが取得できませんでした"
                else:
                    errors[place] = "データファイルが見つかりません"
                    
            except Exception as e:
                errors[place] = f"データ取得中にエラーが発生しました: {str(e)}"
        
        return {
            "success": True,
            "data": {
                "analysis_date": analysis_date.strftime("%Y-%m-%d") if analysis_date else datetime.now().strftime("%Y-%m-%d"),
                "results": results,
                "errors": errors if errors else None,
                "analyzed_places": len(results),
                "total_places": len(AVAILABLE_PLACES)
            },
            "message": f"{len(results)}箇所の混雑度データが取得されました"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"予期しないエラーが発生しました: {str(e)}"
        )

@router.get("/congestion-data/{place}/summary")
async def get_place_congestion_summary(
    place: str,
    target_date: Optional[str] = Query(None, description="基準日 (YYYY-MM-DD形式、省略時は今日)"),
    weeks_count: Optional[int] = Query(3, description="取得する週数 (デフォルト3週間)")
):
    """
    指定した場所の混雑度データサマリーを取得する（軽量版）
    
    - **place**: 分析対象の場所名
    - **target_date**: 基準日（省略時は今日の日付）
    
    サマリー情報のみを返却（詳細な時間別データは含まれない）
    """
    try:
        # 場所名の検証
        if place not in AVAILABLE_PLACES:
            raise HTTPException(
                status_code=400, 
                detail=f"指定された場所 '{place}' は利用できません。利用可能な場所: {', '.join(AVAILABLE_PLACES)}"
            )
        
        # CSVファイルのパスを構築
        csv_file_path = os.path.join(DATA_DIR, f"{place}.csv")
        
        # ファイルの存在確認
        if not os.path.exists(csv_file_path):
            raise HTTPException(
                status_code=404, 
                detail=f"場所 '{place}' のデータファイルが見つかりません"
            )
        
        # 基準日の解析
        analysis_date = None
        if target_date:
            try:
                analysis_date = datetime.strptime(target_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="日付形式が正しくありません。YYYY-MM-DD形式で入力してください"
                )
        
        # 混雑度データの取得
        result = get_congestion_data(csv_file_path, analysis_date, weeks_count)
        
        if not result:
            raise HTTPException(
                status_code=500,
                detail="混雑度データの取得中にエラーが発生しました"
            )
        
        # サマリー情報のみを抽出（時間別の詳細データは除く）
        summary_data = {
            "place": result.get("place"),
            "analysis_date": result.get("analysis_date"),
            "recent_week_period": result.get("recent_week", {}).get("period"),
            "recent_week_start_date": result.get("recent_week", {}).get("start_date"),
            "recent_week_end_date": result.get("recent_week", {}).get("end_date"),
            "recent_week_daily_summary": [
                {
                    "date": day.get("date"),
                    "day_of_week": day.get("day_of_week"),
                    "congestion_level": day.get("congestion_level"),
                    "is_weekend": day.get("is_weekend"),
                    "weather_info": day.get("weather_info"),
                    "is_today": day.get("is_today"),
                    "days_from_today": day.get("days_from_today"),
                    "is_future": day.get("is_future"),
                    "week_of_month_label": day.get("week_of_month_label")
                } for day in result.get("recent_week", {}).get("daily_data", [])
            ],
            "historical_period": result.get("historical_comparison", {}).get("period"),
            "historical_data_available": result.get("historical_comparison", {}).get("data_available"),
            "historical_reference_date": result.get("historical_comparison", {}).get("reference_date"),
            "historical_daily_summary": [
                {
                    "date": day.get("date"),
                    "day_of_week": day.get("day_of_week"),
                    "congestion_level": day.get("congestion_level"),
                    "is_weekend": day.get("is_weekend"),
                    "days_from_reference": day.get("days_from_reference"),
                    "weather_info": day.get("weather_info")
                } for day in result.get("historical_comparison", {}).get("daily_data", [])
            ],
            "yesterday_hourly_summary": {
                "date": result.get("yesterday_hourly", {}).get("date"),
                "day_of_week": result.get("yesterday_hourly", {}).get("day_of_week"),
                "congestion_level": result.get("yesterday_hourly", {}).get("congestion_level"),
                "is_weekend": result.get("yesterday_hourly", {}).get("is_weekend"),
                "data_available": result.get("yesterday_hourly", {}).get("data_available")
            },
            "last_year_today_hourly_summary": {
                "date": result.get("last_year_today_hourly", {}).get("date"),
                "day_of_week": result.get("last_year_today_hourly", {}).get("day_of_week"),
                "congestion_level": result.get("last_year_today_hourly", {}).get("congestion_level"),
                "is_weekend": result.get("last_year_today_hourly", {}).get("is_weekend"),
                "data_available": result.get("last_year_today_hourly", {}).get("data_available")
            }
        }
        
        return {
            "success": True,
            "data": summary_data,
            "message": f"{place}の混雑度データサマリーが取得されました"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"予期しないエラーが発生しました: {str(e)}"
        )

@router.get("/available-places")
async def get_available_places():
    """
    混雑度データ取得が可能な場所のリストを取得する
    """
    try:
        places_with_data = []
        places_without_data = []
        
        for place in AVAILABLE_PLACES:
            csv_file_path = os.path.join(DATA_DIR, f"{place}.csv")
            if os.path.exists(csv_file_path):
                places_with_data.append(place)
            else:
                places_without_data.append(place)
        
        return {
            "success": True,
            "data": {
                "available_places": places_with_data,
                "unavailable_places": places_without_data,
                "total_places": len(AVAILABLE_PLACES)
            },
            "message": f"{len(places_with_data)}箇所でデータが利用可能です"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"予期しないエラーが発生しました: {str(e)}"
        )
