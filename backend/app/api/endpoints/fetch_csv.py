import os
import requests
import csv as csv_lib
import io
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


def filter_person_only(csv_data):
    """CSVデータから"name"列が"person"の行のみを抽出する関数"""
    input_file = io.StringIO(csv_data)
    output_file = io.StringIO()
    
    csv_reader = csv_lib.reader(input_file)
    csv_writer = csv_lib.writer(output_file)
    
    # ヘッダー行を取得
    header = next(csv_reader)
    csv_writer.writerow(header)
    
    # name列のインデックスを見つける
    try:
        name_index = header.index('name')
    except ValueError:
        # name列がない場合は元のデータをそのまま返す
        logger.warning("CSV does not have 'name' column, returning original data")
        return csv_data
    
    # "person"の行のみをフィルタリング
    person_rows = 0
    for row in csv_reader:
        if len(row) > name_index and row[name_index] == 'person':
            csv_writer.writerow(row)
            person_rows += 1
    
    logger.debug(f"Filtered {person_rows} 'person' rows from CSV")
    return output_file.getvalue()


def run_fetch_csv():
    """
    API に依存しない CSV 取得・フィルタリング・保存の実行関数。
    CLI からも利用できるように切り出し。
    """
    results = []
    for csv in csvs:
        try:
            logger.debug(f"Fetching CSV from {csv['url']}")
            response = requests.get(csv['url'])
            response.raise_for_status()
            csv_data = response.text
            
            # "person" のみにフィルタリング
            logger.debug(f"Filtering '{csv['name']}' for 'person' rows only")
            filtered_csv_data = filter_person_only(csv_data)

            file_path = os.path.join(data_dir, csv['name'])
            logger.debug(f"Saving filtered CSV to {file_path}")
            with open(file_path, "w", encoding="utf-8") as file:
                file.write(filtered_csv_data)

            logger.info(f"CSV {csv['name']} fetched, filtered, and saved successfully")
            results.append({"name": csv['name'], "status": "success"})
        except Exception as e:
            logger.error(f"Error occurred while processing {csv['name']}: {str(e)}")
            results.append({"name": csv['name'], "status": "error", "error": str(e)})

    return {"message": "CSV fetch and filter process completed", "results": results}


@router.post("/api/fetch-csv")
async def fetch_csv(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return run_fetch_csv()
