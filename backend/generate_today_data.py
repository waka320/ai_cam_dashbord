import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from app.services.analyze.get_trend_analysis import get_congestion_data

# データ保存ディレクトリ
DATA_OUTPUT_DIR = Path("app/data/generated/today_details")
DATA_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 利用可能な場所のリスト
AVAILABLE_PLACES = [
    "honmachi2", "honmachi3", "honmachi4", "jinnya", "kokubunjidori", 
    "nakabashi", "omotesando", "yasukawadori", "yottekan", 
    "gyouzinbashi", "old-town", "station"
]

def generate_today_data_for_all_places():
    """全ての場所について今日のデータを生成"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    for place in AVAILABLE_PLACES:
        try:
            print(f"Generating data for {place}...")
            
            # CSVファイルパスを構築
            csv_file_path = os.path.join("app", "data", "meidai", f"{place}.csv")
            
            # データを生成
            data = get_congestion_data(csv_file_path, datetime.now())
            
            # ファイルに保存
            output_file = DATA_OUTPUT_DIR / f"{place}_{today}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            
            print(f"✓ Data saved for {place}")
            
        except Exception as e:
            print(f"✗ Error generating data for {place}: {e}")
            # エラーの場合は空のデータ構造を保存
            error_data = {
                "status": "error",
                "message": f"データ生成エラー: {str(e)}",
                "data": None
            }
            output_file = DATA_OUTPUT_DIR / f"{place}_{today}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(error_data, f, ensure_ascii=False, indent=2)

def cleanup_old_data():
    """古いデータファイルを削除（7日より古いもの）"""
    cutoff_date = datetime.now() - timedelta(days=7)
    
    for file_path in DATA_OUTPUT_DIR.glob("*.json"):
        try:
            # ファイル名から日付を抽出
            parts = file_path.stem.split('_')
            if len(parts) >= 2:
                date_str = parts[-1]  # YYYY-MM-DD部分
                file_date = datetime.strptime(date_str, "%Y-%m-%d")
                
                if file_date < cutoff_date:
                    file_path.unlink()
                    print(f"Deleted old file: {file_path}")
        except Exception as e:
            print(f"Error processing file {file_path}: {e}")

if __name__ == "__main__":
    print("Starting today data generation...")
    generate_today_data_for_all_places()
    cleanup_old_data()
    print("Data generation completed!")
