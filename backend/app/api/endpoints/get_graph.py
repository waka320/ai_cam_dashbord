from fastapi import APIRouter, HTTPException
import os
import pandas as pd
from app.services.analyze import get_data_for_calendar as calendar_service
from app.services.analyze import get_data_for_week_time
from app.services.ai_service_debug import analyze_csv_data_debug
from app.models import GraphRequest, GraphResponse, DayWithHours

router = APIRouter()

@router.post("/api/get-graph")
async def get_graph(request: GraphRequest):
    place = request.place
    year = request.year
    month = request.month
    action = request.action
    
    print(place, year, month, action)
    
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
        
        # アクションに応じたデータ生成
        if action[:3] == "cal":
            # カレンダーデータの作成
            data = calendar_service.get_data_for_calendar(df_filtered, year, month)
        elif action[:3] == "dti" or action[:3] == "dwe":
            # 時系列データまたは曜日×時間帯データの作成
            week_data = get_data_for_week_time.get_data_for_week_time(csv_file_path, year, month)
            
            # 辞書をリスト形式に変換
            data = []
            for day_name, hours_data in week_data.items():
                # 時間データを適切な形式に変換
                processed_hours = []
                for hour_data in hours_data:
                    # キー名を変換してフロントエンドの期待する形式に合わせる
                    processed_hour = {
                        "hour": hour_data["hour"],
                        "count": hour_data["count_1_hour"],
                        "congestion": int(hour_data["level"])
                    }
                    processed_hours.append(processed_hour)
                
                day_entry = DayWithHours(day=day_name, hours=processed_hours)
                data.append(day_entry)
        else:
            # 未対応のアクション
            data = []
            print(f"Warning: Unsupported action: {action}")

        print(f"Data for {place} in {year}/{month}: {data}")
        
        # AIアドバイスの生成
        ai_advice = await analyze_csv_data_debug(csv_file_path, year, month, action)
        
        response = GraphResponse(
            graph=f"Graph for {place} in {year}/{month}",
            data=data,
            ai_advice=ai_advice
        )
        
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
