import boto3
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

s3 = boto3.client('s3', aws_access_key_id=settings.AWS_ACCSESS_KEY_ID,
                  aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY, region_name='ap-northeast-1')


def fetch_camera_data(bucket, key):
    try:
        obj = s3.get_object(Bucket=bucket, Key=key)
        df = pd.read_csv(obj['Body'])
        return df
    except Exception as e:
        logger.error(f"Error fetching data from S3: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Error fetching data from S3")


@router.get("/api/fetch-csv-exmeidai")
async def fetch_csv_exmeidai(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        current_date = datetime.now().strftime("%Y%m%d")
        bucket = 'datakiban-data-prd-takayama'

        # 顔認識データの取得
        face_key = f'for-work/city-takayama/fa-cam1/2025/C{current_date}.dat'
        face_recognition_data = fetch_camera_data(bucket, face_key)

        # 年齢性別推定データの取得
        age_gender_key = f'for-work/city-takayama/fa-cam1/2025/S{current_date}.dat'
        age_gender_data = fetch_camera_data(bucket, age_gender_key)

        # データの処理や保存をここで行う
        # 例: データフレームを辞書に変換
        face_recognition_dict = face_recognition_data.to_dict(orient='records')
        age_gender_dict = age_gender_data.to_dict(orient='records')

        return {
            "message": "Data fetched successfully",
            "face_recognition_data": face_recognition_dict[:10],  # 最初の10行のみ返す
            "age_gender_data": age_gender_dict[:10]  # 最初の10行のみ返す
        }

    except Exception as e:
        logger.error(f"Error in fetch_csv_exmeidai: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
