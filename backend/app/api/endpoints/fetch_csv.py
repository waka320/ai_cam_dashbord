import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging

router = APIRouter()
security = HTTPBearer()

data_dir = os.path.join("app", "data", "meidai")
os.makedirs(data_dir, exist_ok=True)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

csvs = [
    {"name": "honmachi2.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/plaza.csv"},
    {"name": "honmachi3.csv", "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/kajibashichushajo.csv"},
    {"name": "honmachi4.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/daimasa.csv"},
    {"name": "jinnya.csv", "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/jinnya.csv"},
    {"name": "kokubunjidori.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/kokubunjidori.csv"},
    {"name": "nakabashi.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/nakabashi.csv"},
    {"name": "omotesando.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/omotesando.csv"},
    {"name": "yasukawadori.csv",
        "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/yasugawadori.csv"},
    {"name": "yottekan.csv", "url": "https://machinaka-ai-camera-opendata.s3.ap-northeast-1.amazonaws.com/public/csv/yottekan.csv"},
]


@router.get("/api/fetch-csv")
async def fetch_csv(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    results = []
    for csv in csvs:
        try:
            logger.debug(f"Fetching CSV from {csv['url']}")
            response = requests.get(csv['url'])
            response.raise_for_status()
            csv_data = response.text

            file_path = os.path.join(data_dir, csv['name'])
            logger.debug(f"Saving CSV to {file_path}")
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(csv_data)

            logger.info(f"CSV {csv['name']} fetched and saved successfully")
            results.append({"name": csv['name'], "status": "success"})
        except Exception as e:
            logger.error(
                f"Error occurred while fetching {csv['name']}: {str(e)}")
            results.append(
                {"name": csv['name'], "status": "error", "error": str(e)})

    return {"message": "CSV fetch process completed", "results": results}
