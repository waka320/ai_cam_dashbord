import os
import boto3
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging
from tqdm import tqdm

router = APIRouter()
security = HTTPBearer()

base_output_dir = os.path.join("app", "data", "exmeidai")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

s3 = boto3.client('s3',
                  aws_access_key_id=settings.AWS_ACCSESS_KEY_ID,
                  aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                  region_name='ap-northeast-1'
                  )


def fetch_and_save_c_data(camera_num: int):
    try:
        bucket = 'datakiban-data-prd-takayama'
        prefix = f'for-work/city-takayama/fa-cam{camera_num}/'

        # S3オブジェクトのリストを取得
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

        for page in pages:
            for obj in page.get('Contents', []):
                key = obj['Key']
                if key.endswith('.dat') and os.path.basename(key).startswith('C'):
                    # 年度を取得
                    year = key.split('/')[-2]

                    # カメラと年度ごとの出力ディレクトリ設定
                    output_dir = os.path.join(
                        base_output_dir, f'fa-cam{camera_num}', year)
                    os.makedirs(output_dir, exist_ok=True)

                    # データの取得
                    data = s3.get_object(Bucket=bucket, Key=key)[
                        'Body'].read().decode('utf-8')

                    # ファイル名
                    file_name = os.path.basename(key)
                    file_path = os.path.join(output_dir, file_name)

                    # .dat形式で保存
                    with open(file_path, "w", encoding="utf-8") as file:
                        file.write(data)

                    logger.info(f"Saved data from {key} to {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error processing camera {camera_num}: {str(e)}")
        return False


@router.get("/api/fetch-csv-exmeidai")
async def fetch_all_exmeidai_cams(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    results = {}
    for cam_num in [1, 2, 3]:
        success = fetch_and_save_c_data(cam_num)
        results[f'fa-cam{cam_num}'] = "success" if success else "failed"

    return {
        "message": "C data collection completed for all years",
        "results": results,
        "save_directory": base_output_dir
    }


