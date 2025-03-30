from fastapi import APIRouter, HTTPException
import os
import pandas as pd
from app.services.analyze import get_data_for_calendar as calendar_service
from app.services.analyze import get_data_for_week_time as get_data_for_week_time
from app.services.ai_service_debug import analyze_csv_data_debug
from app.models import GraphRequest, GraphResponse

router = APIRouter()

# GraphResponseモデルの拡張（app/modelsに定義）
# class GraphResponse(BaseModel):
#     graph: str
#     data: List[List[Optional[DayCongestion]]]
#     ai_advice: Optional[str] = None  # AIアドバイスフィールドを追加

@router.post("/api/get-graph")
async def get_graph(request: GraphRequest):
    place = request.place
    year = request.year
    month = request.month
    action = request.action
    
    print(place, year, month, action)
    
    # if action == "dummy":
    #     # ダミーデータの生成
    #     data = generate_dummy_data(request.year, request.month)
    #     response = GraphResponse(
    #         graph=f"Graph for {place} in {year}/{month}",
    #         data=data,
    #         ai_advice="これはダミーのAIアドバイスです。実際のデータ分析に基づいたアドバイスではありません。"
    #     )
    #     return response
    
    csv_file_path = f"app/data/meidai/{place}.csv"
    if not os.path.exists(csv_file_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place")
    
    try:
        df = pd.read_csv(csv_file_path)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place")
    
    # データのフィルタリング
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
    df_filtered = df[
        (df['datetime_jst'].dt.year == year) &
        (df['datetime_jst'].dt.month == month) &
        (df['name'] == 'person')
    ]
    if action[:3] == "cal":
        # カレンダーデータの作成
        data = calendar_service.get_data_for_calendar(df_filtered, year, month)
    elif action[:3] == "dti":
        # 時系列データの作成
        data = calendar_service.get_data_for_week_time(df_filtered, year, month)
    
    # AIアドバイスの生成
    ai_advice = await analyze_csv_data_debug(csv_file_path, year, month, action)
    
    response = GraphResponse(
        graph=f"Graph for {place} in {year}/{month}",
        data=data,
        ai_advice=ai_advice
    )
    
    return response
