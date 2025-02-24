from fastapi import APIRouter, HTTPException
from app.services.ai_service import analyze_csv_data
import aiohttp

router = APIRouter()


# csv_analysis.py の修正
@router.post("/analyze-csv")
async def analyze_csv():
    try:
        csv_path = "app/data/honmachi2.csv"
        ai_comment = await analyze_csv_data(csv_path)
        return {"ai_comment": ai_comment}
    except aiohttp.ClientError as e:
        return {"error": f"Communication error with Gemini API: {str(e)}"}
    except (KeyError, ValueError) as e:
        return {"error": f"Data processing error: {str(e)}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
