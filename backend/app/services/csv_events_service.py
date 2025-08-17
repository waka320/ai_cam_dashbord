import os
import csv
from typing import List, Dict
from datetime import datetime

class CSVEventsService:
    def __init__(self):
        self.events_file = os.path.join("app", "data", "events", "events.csv")
    
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

# シングルトンインスタンス
csv_events_service = CSVEventsService()