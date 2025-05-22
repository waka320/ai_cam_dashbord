import os
import boto3
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging
import io
from datetime import datetime

router = APIRouter()
security = HTTPBearer()

# 元のデータ保存先
base_output_dir = os.path.join("app", "data", "exmeidai")
# 新しいフラットなデータ保存先
flat_output_dir = os.path.join("app", "data", "exmeidai_flat")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

s3 = boto3.client('s3',
                  aws_access_key_id=settings.AWS_ACCSESS_KEY_ID,
                  aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                  region_name='ap-northeast-1'
                  )

# ディレクトリ作成
os.makedirs(base_output_dir, exist_ok=True)
os.makedirs(flat_output_dir, exist_ok=True)

def dat_to_csv(dat_content, year, month, day, camera_num):
    """
    datファイルを名古屋大学フォーマットのCSVに変換する
    """
    # 元の処理用のCSV出力
    original_csv_content = io.StringIO()
    original_csv_writer = csv.writer(original_csv_content, quoting=csv.QUOTE_MINIMAL)
    
    # 名大フォーマット用のCSV出力
    flat_csv_content = io.StringIO()
    flat_csv_writer = csv.writer(flat_csv_content)
    
    # 名大フォーマットのヘッダー
    flat_csv_writer.writerow(["datetime_jst", "date_jst", "time_jst", "dayofweek", 
                             "name", "countingDirection", "count_1_hour"])
    
    lines = dat_content.splitlines()
    if len(lines) > 1:
        lines = lines[1:]  # ヘッダー行削除
    
    # 日付情報を準備
    date_obj = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
    dayofweek = date_obj.strftime("%A")
    date_str = date_obj.strftime("%Y-%m-%d")
    
    for line in lines:
        if line.strip():
            # 元の処理: ダブルクォート除去 & フィールド分割
            fields = [field.strip('"').strip() for field in line.split(',')]
            # 空文字列をNoneに変換（任意）
            cleaned_fields = [f if f != '' else None for f in fields]
            original_csv_writer.writerow(cleaned_fields)
            
            # 名大フォーマット用に変換
            try:
                # データ行から時刻と人数を抽出（ファイル形式に合わせて調整）
                time_str = fields[0] if len(fields) > 0 else "00:00"
                count = fields[1] if len(fields) > 1 else "0"
                
                # 時刻から時間だけ抽出
                time_obj = datetime.strptime(time_str, "%H:%M")
                hour = time_obj.strftime("%H")
                
                # 完全な日時文字列を作成
                datetime_str = f"{date_str} {time_str}:00"
                
                # 名大フォーマットの行を作成
                flat_csv_writer.writerow([
                    datetime_str,                 # datetime_jst
                    date_str,                     # date_jst
                    hour,                         # time_jst
                    dayofweek,                    # dayofweek
                    "person",                     # name
                    "SumOfBothDirection",         # countingDirection
                    count                         # count_1_hour
                ])
            except Exception as e:
                logger.error(f"データ変換エラー: {e}, 行: {line}")
                continue
    
    # 最終的な改行コード統一（CRLF → LF）
    return original_csv_content.getvalue().replace('\r\n', '\n'), flat_csv_content.getvalue().replace('\r\n', '\n')


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
                    file_name = os.path.basename(key)
                    # ファイル名から日付情報を抽出 (例: C20200501.dat)
                    date_str = file_name.replace('C', '').replace('.dat', '')
                    
                    if len(date_str) >= 8:
                        year = date_str[:4]
                        month = date_str[4:6]
                        day = date_str[6:8]
                    else:
                        # 日付情報が取得できない場合はスキップ
                        logger.warning(f"日付情報の抽出に失敗: {file_name}")
                        continue

                    # 階層構造用の出力ディレクトリ
                    output_dir = os.path.join(
                        base_output_dir, f'fa-cam{camera_num}', year)
                    os.makedirs(output_dir, exist_ok=True)

                    data = s3.get_object(Bucket=bucket, Key=key)[
                        'Body'].read().decode('utf-8')

                    # 両方のフォーマットに変換
                    original_csv_data, flat_csv_data = dat_to_csv(data, year, month, day, camera_num)

                    # 元の階層構造にCSVを保存
                    original_file_name = os.path.basename(key).replace('.dat', '.csv')
                    original_file_path = os.path.join(output_dir, original_file_name)
                    with open(original_file_path, "w", encoding="utf-8", newline='') as file:
                        file.write(original_csv_data)
                    
                    # フラットな構造に名大フォーマットのCSVを保存
                    flat_file_name = f"fa-cam{camera_num}_{date_str}.csv"
                    flat_file_path = os.path.join(flat_output_dir, flat_file_name)
                    with open(flat_file_path, "w", encoding="utf-8", newline='') as file:
                        file.write(flat_csv_data)

                    logger.info(f"保存完了: 元形式 {original_file_path}, 名大形式 {flat_file_path}")
        return True
    except Exception as e:
        logger.error(f"カメラ{camera_num}の処理エラー: {str(e)}")
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
        "message": "C データの収集とCSV変換が完了しました",
        "results": results,
        "original_directory": base_output_dir,
        "flat_directory": flat_output_dir
    }
