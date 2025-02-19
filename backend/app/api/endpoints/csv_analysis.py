from fastapi import APIRouter, HTTPException
from app.services.ai_service import analyze_csv_data

router = APIRouter()

@router.post("/analyze-csv")
async def analyze_csv():
    try:
        csv_path = "app/data/your_csv_file.csv"  # CSVファイルのパスを指定
        ai_comment = await analyze_csv_data(csv_path)
        return {"ai_comment": ai_comment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
