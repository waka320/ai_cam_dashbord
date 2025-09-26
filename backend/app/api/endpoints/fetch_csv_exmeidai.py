import os
import boto3
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.core.config import settings
import logging
import io
from datetime import datetime
import pandas as pd

router = APIRouter()
security = HTTPBearer()

# 出力ディレクトリを他のCSVファイルと同じmeidaiに変更
data_dir = os.path.join("app", "data", "meidai")
# 一時的にデータを保存するディレクトリ（処理途中で使用）
temp_dir = os.path.join("app", "data", "temp_exmeidai")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

s3 = boto3.client('s3',
                  aws_access_key_id=settings.AWS_ACCSESS_KEY_ID,
                  aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                  region_name='ap-northeast-1'
                  )

# カメラ番号と出力ファイル名のマッピング
CAMERA_NAME_MAPPING = {
    1: "old-town",
    2: "station",
    3: "gyouzinbashi"
}

# ディレクトリ作成
os.makedirs(data_dir, exist_ok=True)
os.makedirs(temp_dir, exist_ok=True)

def dat_to_csv(dat_content, year, month, day, camera_num):
    """
    datファイルを名古屋大学フォーマットのCSVに変換する
    """
    # 名大フォーマット用のCSV出力
    csv_content = io.StringIO()
    csv_writer = csv.writer(csv_content)
    
    # 日付情報を準備
    date_obj = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
    dayofweek = date_obj.strftime("%A")
    date_str = date_obj.strftime("%Y-%m-%d")
    
    lines = dat_content.splitlines()
    if len(lines) > 1:
        lines = lines[1:]  # ヘッダー行削除
    
    rows = []
    for line in lines:
        if line.strip():
            try:
                # ダブルクォート除去 & フィールド分割
                fields = [field.strip('"').strip() for field in line.split(',')]
                
                # データ行から時刻と人数を抽出
                time_str = fields[0] if len(fields) > 0 else "00:00"
                count = fields[1] if len(fields) > 1 else "0"
                
                # 時刻から時間だけ抽出
                time_obj = datetime.strptime(time_str, "%H:%M")
                hour = time_obj.strftime("%H")
                
                # 完全な日時文字列を作成
                datetime_str = f"{date_str} {time_str}:00"
                
                # 名大フォーマットの行を作成
                rows.append([
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
    
    # 行を書き込み
    for row in rows:
        csv_writer.writerow(row)
    
    return csv_content.getvalue()

def fetch_and_process_camera_data(camera_num: int):
    """
    カメラデータを取得し、一時ファイルに保存する
    """
    try:
        camera_name = CAMERA_NAME_MAPPING.get(camera_num, f"fa-cam{camera_num}")
        temp_file = os.path.join(temp_dir, f"{camera_name}_temp.csv")
        
        # 一時ファイルが存在する場合は削除
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        # ヘッダー行を書き込み
        with open(temp_file, "w", encoding="utf-8", newline='') as file:
            file.write("datetime_jst,date_jst,time_jst,dayofweek,name,countingDirection,count_1_hour\n")
        
        bucket = 'datakiban-data-prd-takayama'
        prefix = f'for-work/city-takayama/fa-cam{camera_num}/'

        logger.info(f"カメラ{camera_num}({camera_name})のデータ取得を開始します")
        
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

        processed_files = 0
        
        for page in pages:
            for obj in page.get('Contents', []):
                key = obj['Key']
                if key.endswith('.dat') and os.path.basename(key).startswith('C'):
                    file_name = os.path.basename(key)
                    # ファイル名から日付情報を抽出 (例: C20200501.dat)
                    date_str = file_name.replace('C', '').replace('.dat', '')
                    
                    if len(date_str) >= 8:
                        year = date_str[:4]
                        month = date_str[4:6]
                        day = date_str[6:8]
                        
                        logger.debug(f"処理中: {file_name}, 日付: {year}-{month}-{day}")
                        
                        try:
                            data = s3.get_object(Bucket=bucket, Key=key)['Body'].read().decode('utf-8')
                            
                            # CSVに変換
                            csv_data = dat_to_csv(data, year, month, day, camera_num)
                            
                            # 一時ファイルに追記
                            with open(temp_file, "a", encoding="utf-8", newline='') as file:
                                file.write(csv_data)
                            
                            processed_files += 1
                            if processed_files % 100 == 0:
                                logger.info(f"カメラ{camera_num}({camera_name}): {processed_files}ファイル処理済み")
                                
                        except Exception as e:
                            logger.error(f"ファイル{file_name}の処理中にエラー発生: {str(e)}")
                    else:
                        logger.warning(f"日付情報の抽出に失敗: {file_name}")
        
        logger.info(f"カメラ{camera_num}({camera_name})の処理完了: {processed_files}ファイル処理")
        return True, processed_files
    
    except Exception as e:
        logger.error(f"カメラ{camera_num}の全体処理でエラー発生: {str(e)}")
        return False, 0

def aggregate_by_hour(df):
    """
    15分単位のデータを1時間単位に集計する
    """
    # 日時データを確実に日時型に変換
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
    
    # 日付と時間でグループ化するための列を作成
    df['date_hour'] = df['datetime_jst'].dt.floor('H')
    
    # 必要な列を抽出してグループ化し、countを合計
    aggregated = df.groupby([
        'date_hour',
        'date_jst',
        'time_jst',
        'dayofweek',
        'name',
        'countingDirection'
    ])['count_1_hour'].apply(lambda x: pd.to_numeric(x, errors='coerce').sum()).reset_index()
    
    # データ型整理と書式設定
    aggregated['datetime_jst'] = aggregated['date_hour'].dt.strftime('%Y-%m-%d %H:00:00')
    aggregated.drop('date_hour', axis=1, inplace=True)
    
    # count_1_hourを整数に変換
    aggregated['count_1_hour'] = aggregated['count_1_hour'].round().astype(int)
    
    # 列の順序を整理
    return aggregated[[
        'datetime_jst',
        'date_jst',
        'time_jst',
        'dayofweek',
        'name',
        'countingDirection',
        'count_1_hour'
    ]]

def sort_and_finalize_csv(camera_num: int):
    """
    一時的なCSVファイルを日時でソートして、1時間単位に集約後、最終的なファイルを作成
    """
    try:
        camera_name = CAMERA_NAME_MAPPING.get(camera_num, f"fa-cam{camera_num}")
        temp_file = os.path.join(temp_dir, f"{camera_name}_temp.csv")
        final_file = os.path.join(data_dir, f"{camera_name}.csv")
        
        # CSVを読み込み
        df = pd.read_csv(temp_file)
        
        # 空のデータフレームならエラー
        if df.empty:
            logger.error(f"カメラ{camera_num}({camera_name})のデータが空です")
            return False
        
        logger.info(f"カメラ{camera_num}({camera_name})のデータを1時間単位に集計します")
        
        # 1時間単位に集約
        aggregated_df = aggregate_by_hour(df)
        
        # 日時でソート
        aggregated_df = aggregated_df.sort_values('datetime_jst')
        
        # 結果を保存
        aggregated_df.to_csv(final_file, index=False)
        logger.info(f"カメラ{camera_num}({camera_name})の最終ファイルを作成しました: {final_file}")
        
        # 一時ファイルを削除
        os.remove(temp_file)
        
        return True
    
    except Exception as e:
        logger.error(f"カメラ{camera_num}のデータのソートと最終化中にエラー発生: {str(e)}")
        return False


def run_fetch_all_exmeidai():
    """
    API に依存しない Exmeidai 全カメラ取得・集計の実行関数。
    CLI からも利用できるように切り出し。
    """
    results = {}
    total_processed = 0
    for cam_num in [1, 2, 3]:
        camera_name = CAMERA_NAME_MAPPING.get(cam_num, f"fa-cam{cam_num}")
        success, processed = fetch_and_process_camera_data(cam_num)
        if success:
            final_success = sort_and_finalize_csv(cam_num)
            results[camera_name] = {
                "status": "success" if final_success else "partial_success",
                "files_processed": processed
            }
            total_processed += processed
        else:
            results[camera_name] = {
                "status": "failed",
                "files_processed": processed
            }

    return {
        "message": "カメラデータの収集と集約が完了しました",
        "total_processed": total_processed,
        "results": results,
        "output_directory": data_dir
    }

@router.get("/api/fetch-csv-exmeidai")
async def fetch_all_exmeidai_cams(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return run_fetch_all_exmeidai()
