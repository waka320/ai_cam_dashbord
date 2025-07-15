import pandas as pd
import calendar
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta
from app.models import HourData, DayWithHours, WeatherInfo, DayCongestion
from app.services.analyze.get_data_for_calendar250414 import get_data_for_calendar
from app.services.analyze.get_data_for_date_time250504 import get_data_for_date_time
from app.services.analyze.get_data_for_week_time250522 import get_data_for_week_time

def get_recent_week_congestion(csv_file_path: str, target_date: datetime) -> Dict[str, Any]:
    """
    指定日から1週間前までの混雑度データを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（今日）
        
    Returns:
        Dict[str, Any]: 1週間の混雑度データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 1週間前の日付を計算
        week_ago = target_date - timedelta(days=7)
        
        daily_data = []
        for i in range(8):  # 今日を含む8日間
            current_date = week_ago + timedelta(days=i)
            year = current_date.year
            month = current_date.month
            day = current_date.day
            
            # その日のカレンダーデータを取得（日別混雑度）
            calendar_data = get_data_for_calendar(df, year, month, place)
            day_congestion = 0
            
            # カレンダーデータから該当日の混雑度を抽出
            for week in calendar_data:
                for day_data in week:
                    if day_data and day_data.date == day:
                        day_congestion = day_data.congestion
                        break
            
            # その日の時間別データを取得
            date_time_data = get_data_for_date_time(df, year, month, place)
            hourly_data = []
            
            # 該当日の時間別データを抽出
            for day_info in date_time_data:
                if day_info['date'] == current_date.strftime('%Y-%m-%d'):
                    hourly_data = day_info['hours']
                    break
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_of_week': current_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': hourly_data,
                'is_weekend': current_date.weekday() >= 5
            })
        
        return {
            'period': 'recent_week',
            'start_date': week_ago.strftime('%Y-%m-%d'),
            'end_date': target_date.strftime('%Y-%m-%d'),
            'daily_data': daily_data
        }
        
    except Exception as e:
        print(f"直近1週間の混雑度データ取得中にエラーが発生しました: {e}")
        return {}

def get_historical_congestion(csv_file_path: str, target_date: datetime, days_range: int = 7) -> Dict[str, Any]:
    """
    前年度の同じ時期の混雑度データを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日
        days_range: 前後の日数範囲
        
    Returns:
        Dict[str, Any]: 前年度の混雑度データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 前年度の同じ日付を計算
        last_year_date = target_date.replace(year=target_date.year - 1)
        start_date = last_year_date - timedelta(days=days_range)
        end_date = last_year_date + timedelta(days=days_range)
        
        daily_data = []
        for i in range(days_range * 2 + 1):
            current_date = start_date + timedelta(days=i)
            year = current_date.year
            month = current_date.month
            day = current_date.day
            
            # その日のカレンダーデータを取得（日別混雑度）
            calendar_data = get_data_for_calendar(df, year, month, place)
            day_congestion = 0
            
            # カレンダーデータから該当日の混雑度を抽出
            for week in calendar_data:
                for day_data in week:
                    if day_data and day_data.date == day:
                        day_congestion = day_data.congestion
                        break
            
            # その日の時間別データを取得
            date_time_data = get_data_for_date_time(df, year, month, place)
            hourly_data = []
            
            # 該当日の時間別データを抽出
            for day_info in date_time_data:
                if day_info['date'] == current_date.strftime('%Y-%m-%d'):
                    hourly_data = day_info['hours']
                    break
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_of_week': current_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': hourly_data,
                'is_weekend': current_date.weekday() >= 5,
                'days_from_reference': (current_date - last_year_date).days
            })
        
        # 曜日別の混雑度パターンも取得
        weekday_pattern = get_data_for_week_time(csv_file_path, last_year_date.year, last_year_date.month)
        
        return {
            'period': 'historical',
            'reference_date': last_year_date.strftime('%Y-%m-%d'),
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'data_available': len(daily_data) > 0,
            'daily_data': daily_data,
            'weekday_pattern': [
                {
                    'day': day.day,
                    'hours': [
                        {
                            'hour': hour.hour,
                            'congestion': hour.congestion,
                            'count': hour.count
                        } for hour in day.hours
                    ]
                } for day in weekday_pattern
            ] if weekday_pattern else []
        }
        
    except Exception as e:
        print(f"前年度混雑度データ取得中にエラーが発生しました: {e}")
        return {
            'period': 'historical',
            'reference_date': target_date.replace(year=target_date.year - 1).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'前年度のデータが見つかりません: {e}'
        }

def get_yesterday_hourly(csv_file_path: str, target_date: datetime) -> Dict[str, Any]:
    """
    昨日の時間別詳細データを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（今日）
        
    Returns:
        Dict[str, Any]: 昨日の時間別データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 昨日の日付を計算
        yesterday_date = target_date - timedelta(days=1)
        year = yesterday_date.year
        month = yesterday_date.month
        day = yesterday_date.day
        
        # その日のカレンダーデータを取得（日別混雑度）
        calendar_data = get_data_for_calendar(df, year, month, place)
        day_congestion = 0
        
        # カレンダーデータから該当日の混雑度を抽出
        for week in calendar_data:
            for day_data in week:
                if day_data and day_data.date == day:
                    day_congestion = day_data.congestion
                    break
        
        # その日の時間別データを取得
        date_time_data = get_data_for_date_time(df, year, month, place)
        hourly_data = []
        
        # 該当日の時間別データを抽出
        for day_info in date_time_data:
            if day_info['date'] == yesterday_date.strftime('%Y-%m-%d'):
                hourly_data = day_info['hours']
                break
        
        if hourly_data:
            return {
                'date': yesterday_date.strftime('%Y-%m-%d'),
                'day_of_week': yesterday_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': hourly_data,
                'is_weekend': yesterday_date.weekday() >= 5,
                'data_available': True
            }
        else:
            return {
                'date': yesterday_date.strftime('%Y-%m-%d'),
                'data_available': False,
                'message': '昨日の時間別データが見つかりません'
            }
        
    except Exception as e:
        print(f"昨日の時間別データ取得中にエラーが発生しました: {e}")
        return {
            'date': (target_date - timedelta(days=1)).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'昨日の時間別データ取得中にエラーが発生しました: {e}'
        }

def get_congestion_data(csv_file_path: str, target_date: datetime = None) -> Dict[str, Any]:
    """
    既存の分析ファイルを使用して混雑度データを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（デフォルトは今日）
        
    Returns:
        Dict[str, Any]: 混雑度データ
    """
    if target_date is None:
        target_date = datetime.now()
    
    place = os.path.splitext(os.path.basename(csv_file_path))[0]
    
    # 直近1週間の混雑度データ
    recent_congestion = get_recent_week_congestion(csv_file_path, target_date)
    
    # 前年度の同時期の混雑度データ
    historical_congestion = get_historical_congestion(csv_file_path, target_date)
    
    # 昨日の時間別データ
    yesterday_hourly = get_yesterday_hourly(csv_file_path, target_date)
    
    # 前年の同じ日付の時間別データ
    last_year_hourly = get_last_year_today_hourly(csv_file_path, target_date)
    
    return {
        'place': place,
        'analysis_date': target_date.strftime('%Y-%m-%d'),
        'recent_week': recent_congestion,
        'historical_comparison': historical_congestion,
        'yesterday_hourly': yesterday_hourly,
        'last_year_today_hourly': last_year_hourly
    }

def get_last_year_today_hourly(csv_file_path: str, target_date: datetime) -> Dict[str, Any]:
    """
    前年の今日の時間別詳細データを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（今日）
        
    Returns:
        Dict[str, Any]: 前年の今日の時間別データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 前年の同じ日付を計算
        last_year_date = target_date.replace(year=target_date.year - 1)
        year = last_year_date.year
        month = last_year_date.month
        day = last_year_date.day
        
        # その日のカレンダーデータを取得（日別混雑度）
        calendar_data = get_data_for_calendar(df, year, month, place)
        day_congestion = 0
        
        # カレンダーデータから該当日の混雑度を抽出
        for week in calendar_data:
            for day_data in week:
                if day_data and day_data.date == day:
                    day_congestion = day_data.congestion
                    break
        
        # その日の時間別データを取得
        date_time_data = get_data_for_date_time(df, year, month, place)
        hourly_data = []
        
        # 該当日の時間別データを抽出
        for day_info in date_time_data:
            if day_info['date'] == last_year_date.strftime('%Y-%m-%d'):
                hourly_data = day_info['hours']
                break
        
        if hourly_data:
            return {
                'date': last_year_date.strftime('%Y-%m-%d'),
                'day_of_week': last_year_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': hourly_data,
                'is_weekend': last_year_date.weekday() >= 5,
                'data_available': True
            }
        else:
            return {
                'date': last_year_date.strftime('%Y-%m-%d'),
                'data_available': False,
                'message': '前年の時間別データが見つかりません'
            }
        
    except Exception as e:
        print(f"前年の時間別データ取得中にエラーが発生しました: {e}")
        return {
            'date': target_date.replace(year=target_date.year - 1).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'前年の時間別データ取得中にエラーが発生しました: {e}'
        }

if __name__ == "__main__":
    # テスト用コード
    test_file = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/yasukawadori.csv"
    result = get_congestion_data(test_file)
    print(f"混雑度データ: {result}")
