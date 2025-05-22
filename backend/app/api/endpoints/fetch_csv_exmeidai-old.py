import os
import boto3
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging
import io

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


def dat_to_csv(dat_content):
    csv_content = io.StringIO()
    csv_writer = csv.writer(csv_content, quoting=csv.QUOTE_MINIMAL)

    lines = dat_content.splitlines()
    if len(lines) > 1:
        lines = lines[1:]  # ヘッダー行削除

    for line in lines:
        if line.strip():
            # ダブルクォート除去 & フィールド分割
            fields = [field.strip('"').strip() for field in line.split(',')]
            # 空文字列をNoneに変換（任意）
            cleaned_fields = [f if f != '' else None for f in fields]
            csv_writer.writerow(cleaned_fields)

    # 最終的な改行コード統一（CRLF → LF）
    return csv_content.getvalue().replace('\r\n', '\n')


def fetch_and_save_c_data(camera_num: int):
    try:
        bucket = 'datakiban-data-prd-takayama'
        prefix = f'for-work/city-takayama/fa-cam{camera_num}/'

        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

        for page in pages:
            for obj in page.get('Contents', []):
                key = obj['Key']
                if key.endswith('.dat') and os.path.basename(key).startswith('C'):
                    year = key.split('/')[-2]

                    output_dir = os.path.join(
                        base_output_dir, f'fa-cam{camera_num}', year)
                    os.makedirs(output_dir, exist_ok=True)

                    data = s3.get_object(Bucket=bucket, Key=key)[
                        'Body'].read().decode('utf-8')

                    csv_data = dat_to_csv(data)

                    file_name = os.path.basename(key).replace('.dat', '.csv')
                    file_path = os.path.join(output_dir, file_name)

                    with open(file_path, "w", encoding="utf-8", newline='') as file:
                        file.write(csv_data)

                    logger.info(f"Saved CSV data from {key} to {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error processing camera {camera_num}: {str(e)}")
        return False


@router.get("/api/fetch-csv-exmeidai-old")
async def fetch_all_exmeidai_cams(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    results = {}
    for cam_num in [1, 2, 3]:
        success = fetch_and_save_c_data(cam_num)
        results[f'fa-cam{cam_num}'] = "success" if success else "failed"

    return {
        "message": "C data collection and CSV conversion completed for all years",
        "results": results,
        "save_directory": base_output_dir
    }
