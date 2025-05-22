from fastapi import APIRouter, HTTPException
import os
import pandas as pd
from app.services.analyze import get_data_for_calendar250414 as calendar_service
from app.services.analyze import get_data_for_week_time250522
from app.services.analyze import get_data_for_date_time250504
from app.services.ai_service_debug import analyze_csv_data_debug
from app.services.highlighter_service import highlight_calendar_data, highlight_week_time_data, highlight_date_time_data
from app.models import GraphRequest, GraphResponse, DayWithHours
import time
from datetime import datetime, timedelta

router = APIRouter()

# キャッシュを格納する辞書
cache = {}
# キャッシュの有効期限（1日 = 86400秒）
CACHE_EXPIRY = 86400

@router.post("/api/get-graph")
async def get_graph(request: GraphRequest):
    place = request.place
    year = request.year
    month = request.month
    action = request.action
    
    # キャッシュキーの作成
    cache_key = f"{place}_{year}_{month}_{action}"
    
    # キャッシュが存在し、期限内であれば、キャッシュから返す
    current_time = time.time()
    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if current_time - timestamp < CACHE_EXPIRY:
            print(f"Cache hit for {cache_key}")
            return cached_data
        else:
            # 期限切れのキャッシュを削除
            del cache[cache_key]
            print(f"Cache expired for {cache_key}")
    
    # キャッシュがない場合、通常の処理を実行
    csv_file_path = f"app/data/meidai/{place}.csv"
    if not os.path.exists(csv_file_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place")
    
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
        
        # データのフィルタリング（person データのみを事前に抽出）
        df_filtered = df[
            (df['datetime_jst'].dt.year == year) &
            (df['datetime_jst'].dt.month == month) &
            (df['name'] == 'person')
        ]
        
        # データが存在するか確認
        if df_filtered.empty:
            print(f"Warning: No data found for {place} in {year}/{month}")
            
        # アクションに応じたデータ生成とハイライト
        if action[:3] == "cal":
            # カレンダーデータの作成 - placeをファイル名から抽出して渡す
            place_name = os.path.splitext(os.path.basename(place))[0]
            data = calendar_service.get_data_for_calendar(df, year, month, place_name)
            # ハイライト処理
            data = highlight_calendar_data(data, action)
        elif action[:3] == "wti":
            # 曜日×時間帯データの作成
            data = get_data_for_week_time250522.get_data_for_week_time(csv_file_path, year, month)
            # ハイライト処理
            data = highlight_week_time_data(data, action)
        elif action[:3] == "dti":
            # 日付×時間帯データの作成
            data = get_data_for_date_time250504.get_data_for_date_time(df, year, month, place)
            # ハイライト処理
            data = highlight_date_time_data(data, action)
        else:
            # 未対応のアクション
            data = []
            print(f"Warning: Unsupported action: {action}")

        # AIアドバイスの生成
        ai_advice = await analyze_csv_data_debug(csv_file_path, year, month, action)
        
        response = GraphResponse(
            graph=f"Graph for {place} in {year}/{month}",
            data=data,
            ai_advice=ai_advice
        )
        
        # キャッシュにレスポンスを保存
        cache[cache_key] = (response, current_time)
        print(f"Cache set for {cache_key}")
        
        return response
        
    except Exception as e:
        # エラーが発生した場合はより詳細な情報を提供
        print(f"Error processing request: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing data: {str(e)}"
        )

# キャッシュのクリーンアップ関数（定期的に実行する場合）
def cleanup_cache():
    """期限切れのキャッシュエントリを削除します"""
    current_time = time.time()
    expired_keys = [key for key, (_, timestamp) in cache.items() 
                   if current_time - timestamp > CACHE_EXPIRY]
    
    for key in expired_keys:
        del cache[key]
    
    if expired_keys:
        print(f"Cleaned up {len(expired_keys)} expired cache entries")
