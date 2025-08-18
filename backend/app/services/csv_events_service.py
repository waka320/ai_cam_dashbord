import os
import csv
import json
from typing import List, Dict, Optional
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials
from app.core.config import settings

class CSVEventsService:
    def __init__(self):
        self.events_file = os.path.join("app", "data", "events", "events.csv")
        self.events_dir = os.path.dirname(self.events_file)
    
    def get_events_data(self) -> List[Dict]:
        """CSVファイルからイベントデータを取得"""
        if not os.path.exists(self.events_file):
            return []
        
        events = []
        try:
            with open(self.events_file, 'r', encoding='utf-8') as f:
                csv_reader = csv.reader(f)
                for row in csv_reader:
                    if len(row) >= 2:  # 日付とイベント名が必要
                        try:
                            # 日付の解析（YYYY/MM/DD形式をYYYY-MM-DDに変換）
                            date_str = row[0].strip()
                            if '/' in date_str:
                                parts = date_str.split('/')
                                if len(parts) == 3:
                                    date_str = f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
                            
                            # 基本的な日付検証
                            datetime.strptime(date_str, '%Y-%m-%d')
                            
                            events.append({
                                'date': date_str,
                                'title': row[1].strip()
                            })
                        except (ValueError, IndexError):
                            continue  # 不正な行はスキップ
        except Exception as e:
            print(f"Error reading events CSV: {e}")
        
        return events
    
    def get_events_for_date_range(self, start_date: str, end_date: str) -> List[Dict]:
        """指定した日付範囲のイベントを取得"""
        events = self.get_events_data()
        
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            return [
                event for event in events
                if start_dt <= datetime.strptime(event['date'], '%Y-%m-%d').date() <= end_dt
            ]
        except ValueError:
            return []
    
    def _get_google_sheets_client(self) -> Optional[gspread.Client]:
        """Google Sheetsクライアントを取得"""
        try:
            if not settings.GOOGLE_SHEETS_CREDENTIALS:
                print("Google Sheets credentials not found in environment variables")
                return None
            
            # 環境変数からJSON認証情報を取得
            credentials_json = json.loads(settings.GOOGLE_SHEETS_CREDENTIALS)
            
            # 必要なスコープを定義
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ]
            
            # 認証情報を作成
            credentials = Credentials.from_service_account_info(
                credentials_json, 
                scopes=scopes
            )
            
            # gspreadクライアントを作成
            client = gspread.authorize(credentials)
            return client
            
        except Exception as e:
            print(f"Error creating Google Sheets client: {e}")
            return None
    
    def sync_from_google_sheets(self) -> bool:
        """
        Google Sheetsからデータを取得してCSVファイルに保存
        
        Returns:
            bool: 同期が成功した場合True
        """
        try:
            if not settings.GOOGLE_SHEETS_ID:
                print("Google Sheets ID not found in environment variables")
                return False
            
            # Google Sheetsクライアントを取得
            client = self._get_google_sheets_client()
            if not client:
                return False
            
            # スプレッドシートを開く
            spreadsheet = client.open_by_key(settings.GOOGLE_SHEETS_ID)
            
            # 「イベント情報」シートを取得
            try:
                worksheet = spreadsheet.worksheet("イベント情報")
            except gspread.WorksheetNotFound:
                print("Worksheet 'イベント情報' not found. Available sheets:")
                for sheet in spreadsheet.worksheets():
                    print(f"  - {sheet.title}")
                return False
            
            # 全データを取得
            all_values = worksheet.get_all_values()
            
            if not all_values:
                print("No data found in Google Sheets")
                return False
            
            # ディレクトリが存在しない場合は作成
            os.makedirs(self.events_dir, exist_ok=True)
            
            # CSVファイルに書き込み
            with open(self.events_file, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerows(all_values)
            
            print(f"Successfully synced {len(all_values)} rows from Google Sheets to {self.events_file}")
            return True
            
        except Exception as e:
            print(f"Error syncing from Google Sheets: {e}")
            return False
    
    def sync_from_google_sheets_with_validation(self) -> Dict[str, any]:
        """
        Google Sheetsからデータを取得してCSVファイルに保存（検証付き）
        
        Returns:
            Dict: 同期結果の詳細情報
        """
        try:
            if not settings.GOOGLE_SHEETS_ID:
                return {
                    "success": False,
                    "error": "Google Sheets ID not found in environment variables",
                    "rows_synced": 0,
                    "valid_events": 0
                }
            
            # Google Sheetsクライアントを取得
            client = self._get_google_sheets_client()
            if not client:
                return {
                    "success": False,
                    "error": "Failed to create Google Sheets client",
                    "rows_synced": 0,
                    "valid_events": 0
                }
            
            # スプレッドシートを開く
            spreadsheet = client.open_by_key(settings.GOOGLE_SHEETS_ID)
            
            # 「イベント情報」シートを取得
            try:
                worksheet = spreadsheet.worksheet("イベント情報")
            except gspread.WorksheetNotFound:
                return {
                    "success": False,
                    "error": "Worksheet 'イベント情報' not found in the spreadsheet",
                    "rows_synced": 0,
                    "valid_events": 0
                }
            
            # 全データを取得
            all_values = worksheet.get_all_values()
            
            if not all_values:
                return {
                    "success": False,
                    "error": "No data found in Google Sheets",
                    "rows_synced": 0,
                    "valid_events": 0
                }
            
            # ディレクトリが存在しない場合は作成
            os.makedirs(self.events_dir, exist_ok=True)
            
            # CSVファイルに書き込み
            with open(self.events_file, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerows(all_values)
            
            # 有効なイベント数をカウント
            valid_events = 0
            for row in all_values:
                if len(row) >= 2 and row[0].strip() and row[1].strip():
                    try:
                        # 日付の検証
                        date_str = row[0].strip()
                        if '/' in date_str:
                            parts = date_str.split('/')
                            if len(parts) == 3:
                                date_str = f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
                        datetime.strptime(date_str, '%Y-%m-%d')
                        valid_events += 1
                    except ValueError:
                        continue
            
            return {
                "success": True,
                "error": None,
                "rows_synced": len(all_values),
                "valid_events": valid_events,
                "sync_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error syncing from Google Sheets: {str(e)}",
                "rows_synced": 0,
                "valid_events": 0
            }

# シングルトンインスタンス
csv_events_service = CSVEventsService()
