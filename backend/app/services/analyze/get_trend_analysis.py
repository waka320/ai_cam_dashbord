import pandas as pd
import calendar
from typing import List, Dict, Any, Optional
import os
from datetime import datetime, timedelta
from app.models import HourData, DayWithHours, WeatherInfo, DayCongestion
from app.services.analyze.get_data_for_calendar250414 import get_data_for_calendar
from app.services.analyze.get_data_for_date_time250504 import get_data_for_date_time
from app.services.analyze.get_data_for_week_time250522 import get_data_for_week_time
from app.services.weather.weather_service import weather_service

def get_simple_weekday_label(date: datetime) -> str:
    """シンプルな曜日ラベルを返す"""
    weekday_names = ['月', '火', '水', '木', '金', '土', '日']
    return f"{weekday_names[date.weekday()]}曜日"

def get_extended_week_congestion(csv_file_path: str, target_date: datetime, weeks_count: int = 3) -> Dict[str, Any]:
    """
    指定日から過去数週間の混雑度データを取得（拡張版）
    今日を含む過去のデータのみ取得し、未来のデータは除外
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（今日）
        weeks_count: 取得する週数（デフォルト3週間）
        
    Returns:
        Dict[str, Any]: 拡張された週間混雑度データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 過去の週数分の範囲を計算（今日を含む過去のデータのみ）
        total_days = weeks_count * 7
        start_date = target_date - timedelta(days=total_days - 1)
        
        # 今日から1週間後まで表示（去年同期間と同じ期間に合わせる）
        end_date = target_date + timedelta(days=7)
        
        print(f"拡張週間データ取得: {start_date.strftime('%Y-%m-%d')} から {end_date.strftime('%Y-%m-%d')} まで")
        
        # 期間中の天気データを取得（月ごとにキャッシュ）
        weather_data = {}
        weather_cache = {}
        
        for date in pd.date_range(start_date, end_date):
            year = date.year
            month = date.month
            day = date.day
            month_key = f"{year}-{month:02d}"
            
            # 月ごとの天気データをキャッシュから取得
            if month_key not in weather_cache:
                weather_cache[month_key] = weather_service.get_weather_for_date_time(year, month)
            
            monthly_weather = weather_cache[month_key]
            if day in monthly_weather:
                weather_data[date.strftime('%Y-%m-%d')] = monthly_weather[day]

        
        # 期間中の全ての月のデータを事前に取得してキャッシュ
        calendar_cache = {}
        date_time_cache = {}
        
        for date in pd.date_range(start_date, end_date):
            year = date.year
            month = date.month
            month_key = f"{year}-{month:02d}"
            
            if month_key not in calendar_cache:
                calendar_cache[month_key] = get_data_for_calendar(df, year, month, place)
                date_time_cache[month_key] = get_data_for_date_time(df, year, month, place)
        
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            year = current_date.year
            month = current_date.month
            day = current_date.day
            month_key = f"{year}-{month:02d}"
            
            # 未来の日付（明日以降）はデータなしとして処理
            is_future = current_date > target_date
            day_congestion = 0
            
            if not is_future and month_key in calendar_cache:
                # キャッシュからカレンダーデータを取得
                calendar_data = calendar_cache[month_key]
                
                # カレンダーデータから該当日の混雑度を抽出
                for week in calendar_data:
                    for day_data in week:
                        if day_data and day_data.date == day:
                            day_congestion = day_data.congestion
                            break
            
            # その日の時間別データを取得（未来の場合は空）
            hourly_data = []
            if not is_future and month_key in date_time_cache:
                date_time_data = date_time_cache[month_key]
                
                # 該当日の時間別データを抽出
                for day_info in date_time_data:
                    if day_info['date'] == current_date.strftime('%Y-%m-%d'):
                        hourly_data = day_info['hours']
                        break
            
            # その日の天気データを取得
            date_str = current_date.strftime('%Y-%m-%d')
            daily_weather_data = weather_data.get(date_str, [])
            
            # 7-22時の完全な時間データを作成
            complete_hourly_data = []
            for hour in range(7, 23):
                hour_data = next((h for h in hourly_data if h['hour'] == hour), None)
                
                # その時間の天気データを取得
                hour_weather = next((w for w in daily_weather_data if w['hour'] == hour), None)
                weather_info = {
                    'weather': hour_weather['weather'] if hour_weather and hour_weather['weather'] else '-',
                    'temperature': hour_weather['temperature'] if hour_weather and hour_weather['temperature'] is not None else None,
                    'humidity': '-'  # 湿度データがない場合
                }
                
                if hour_data:
                    hour_data['weather_info'] = weather_info
                    complete_hourly_data.append(hour_data)
                else:
                    complete_hourly_data.append({
                        'hour': hour,
                        'congestion': 0,
                        'count': 0,
                        'weather_info': weather_info
                    })
            
            # 基準日からの相対日数を計算
            days_from_today = (current_date - target_date).days
            
            # 今日、明日、明後日のラベルを設定
            date_label = get_relative_date_label(days_from_today)
            
            # その日の天気情報をサマリー化（代表的な天気と平均気温）
            day_weather_info = None
            if daily_weather_data:
                # 最も頻繁な天気を取得
                weather_list = [w['weather'] for w in daily_weather_data if w['weather'] and w['weather'] != '-']
                most_common_weather = max(set(weather_list), key=weather_list.count) if weather_list else '-'
                
                # 平均気温を計算
                temps = [w['temperature'] for w in daily_weather_data if w['temperature'] is not None]
                avg_temp = sum(temps) / len(temps) if temps else None
                
                day_weather_info = {
                    'weather': most_common_weather,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': None  # 必要に応じて計算
                }
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_of_week': current_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': complete_hourly_data,
                'is_weekend': current_date.weekday() >= 5,
                'days_from_today': days_from_today,
                'week_of_month_label': get_simple_weekday_label(current_date),
                'date_label': date_label,
                'is_today': current_date.date() == target_date.date(),
                'is_future': is_future,
                'weather_info': day_weather_info
            })
            

            
            current_date += timedelta(days=1)
        
        print(f"拡張週間データ: {len(daily_data)}日分のデータを取得しました")
        
        return {
            'period': 'extended_week',
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'target_date': target_date.strftime('%Y-%m-%d'),
            'weeks_count': weeks_count,
            'actual_days': len(daily_data),
            'daily_data': daily_data
        }
        
    except Exception as e:
        print(f"拡張週間混雑度データ取得中にエラーが発生しました: {e}")
        return {}

def get_historical_congestion(csv_file_path: str, target_date: datetime, weeks_count: int = 3) -> Dict[str, Any]:
    """
    去年度の同じ時期の混雑度データを取得（拡張版）
    今年と同じ期間（過去3週間 + 未来1週間）のデータを取得
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日
        weeks_count: 取得する週数
        
    Returns:
        Dict[str, Any]: 去年度の混雑度データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 去年度の同じ日付を計算
        last_year_date = target_date.replace(year=target_date.year - 1)
        
        # 今年と同じ期間を取得（過去3週間 + 未来1週間）
        total_days = weeks_count * 7
        start_date = last_year_date - timedelta(days=total_days - 1)
        # 1週間分追加
        end_date = last_year_date + timedelta(days=7)
        
        print(f"去年同期間データ取得: {start_date.strftime('%Y-%m-%d')} から {end_date.strftime('%Y-%m-%d')} まで")
        
        # 期間中の天気データを取得（去年、月ごとにキャッシュ）
        weather_data = {}
        weather_cache = {}
        
        for date in pd.date_range(start_date, end_date):
            year = date.year
            month = date.month
            day = date.day
            month_key = f"{year}-{month:02d}"
            
            # 月ごとの天気データをキャッシュから取得
            if month_key not in weather_cache:
                weather_cache[month_key] = weather_service.get_weather_for_date_time(year, month)
            
            monthly_weather = weather_cache[month_key]
            if day in monthly_weather:
                weather_data[date.strftime('%Y-%m-%d')] = monthly_weather[day]
        
        # 期間中の全ての月のデータを事前に取得してキャッシュ
        calendar_cache = {}
        date_time_cache = {}
        
        for date in pd.date_range(start_date, end_date):
            year = date.year
            month = date.month
            month_key = f"{year}-{month:02d}"
            
            if month_key not in calendar_cache:
                calendar_cache[month_key] = get_data_for_calendar(df, year, month, place)
                date_time_cache[month_key] = get_data_for_date_time(df, year, month, place)
        
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            year = current_date.year
            month = current_date.month
            day = current_date.day
            month_key = f"{year}-{month:02d}"
            
            # キャッシュからカレンダーデータを取得
            day_congestion = 0
            if month_key in calendar_cache:
                calendar_data = calendar_cache[month_key]
                
                # カレンダーデータから該当日の混雑度を抽出
                for week in calendar_data:
                    for day_data in week:
                        if day_data and day_data.date == day:
                            day_congestion = day_data.congestion
                            break
            
            # キャッシュから時間別データを取得
            hourly_data = []
            if month_key in date_time_cache:
                date_time_data = date_time_cache[month_key]
                
                # 該当日の時間別データを抽出
                for day_info in date_time_data:
                    if day_info['date'] == current_date.strftime('%Y-%m-%d'):
                        hourly_data = day_info['hours']
                        break
            
            # その日の天気データを取得
            date_str = current_date.strftime('%Y-%m-%d')
            daily_weather_data = weather_data.get(date_str, [])
            
            # 7-22時の完全な時間データを作成
            complete_hourly_data = []
            for hour in range(7, 23):
                hour_data = next((h for h in hourly_data if h['hour'] == hour), None)
                
                # その時間の天気データを取得
                hour_weather = next((w for w in daily_weather_data if w['hour'] == hour), None)
                weather_info = {
                    'weather': hour_weather['weather'] if hour_weather and hour_weather['weather'] else '-',
                    'temperature': hour_weather['temperature'] if hour_weather and hour_weather['temperature'] is not None else None,
                    'humidity': '-'  # 湿度データがない場合
                }
                
                if hour_data:
                    hour_data['weather_info'] = weather_info
                    complete_hourly_data.append(hour_data)
                else:
                    complete_hourly_data.append({
                        'hour': hour,
                        'congestion': 0,
                        'count': 0,
                        'weather_info': weather_info
                    })
            
            # その日の天気情報をサマリー化（代表的な天気と平均気温）
            day_weather_info = None
            if daily_weather_data:
                # 最も頻繁な天気を取得
                weather_list = [w['weather'] for w in daily_weather_data if w['weather'] and w['weather'] != '-']
                most_common_weather = max(set(weather_list), key=weather_list.count) if weather_list else '-'
                
                # 平均気温を計算
                temps = [w['temperature'] for w in daily_weather_data if w['temperature'] is not None]
                avg_temp = sum(temps) / len(temps) if temps else None
                
                day_weather_info = {
                    'weather': most_common_weather,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': None  # 必要に応じて計算
                }
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_of_week': current_date.strftime('%a'),
                'congestion_level': day_congestion,
                'hourly_congestion': complete_hourly_data,
                'is_weekend': current_date.weekday() >= 5,
                'days_from_reference': (current_date - last_year_date).days,
                'week_of_month_label': get_simple_weekday_label(current_date),
                'weather_info': day_weather_info
            })
            
            current_date += timedelta(days=1)
        
        # 曜日別の混雑度パターンも取得
        try:
            weekday_pattern = get_data_for_week_time(csv_file_path, last_year_date.year, last_year_date.month)
        except:
            weekday_pattern = []
        
        print(f"去年同期間データ: {len(daily_data)}日分のデータを取得しました")
        
        return {
            'period': 'historical',
            'reference_date': last_year_date.strftime('%Y-%m-%d'),
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'weeks_count': weeks_count,
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
        print(f"去年度混雑度データ取得中にエラーが発生しました: {e}")
        return {
            'period': 'historical',
            'reference_date': target_date.replace(year=target_date.year - 1).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'去年度のデータが見つかりません: {e}'
        }

def get_relative_date_label(days_from_today: int) -> str:
    """基準日からの相対日数に基づいてラベルを生成"""
    if days_from_today == 0:
        return "今日"
    elif days_from_today == 1:
        return "明日"
    elif days_from_today == 2:
        return "明後日"
    elif days_from_today == 3:
        return "3日後"
    elif days_from_today == 4:
        return "4日後"
    elif days_from_today == 5:
        return "5日後"
    elif days_from_today == 6:
        return "6日後"
    elif days_from_today == 7:
        return "7日後"
    elif days_from_today == -1:
        return "昨日"
    elif days_from_today == -2:
        return "一昨日"
    else:
        return ""

def get_yesterday_hourly(csv_file_path: str, target_date: datetime) -> Dict[str, Any]:
    """
    昨日の時間別詳細データを取得（拡張版）
    
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
        
        # 天気データを取得
        weather_data = weather_service.get_weather_for_date_time(year, month)
        daily_weather_data = weather_data.get(day, [])
        
        # その日の時間別データを取得
        date_time_data = get_data_for_date_time(df, year, month, place)
        hourly_data = []
        
        # 該当日の時間別データを抽出
        for day_info in date_time_data:
            if day_info['date'] == yesterday_date.strftime('%Y-%m-%d'):
                hourly_data = day_info['hours']
                break
        
        # 7-22時の完全な時間データを作成
        complete_hourly_data = []
        for hour in range(7, 23):  # 7時から22時まで
            hour_data = next((h for h in hourly_data if h['hour'] == hour), None)
            
            # その時間の天気データを取得
            hour_weather = next((w for w in daily_weather_data if w['hour'] == hour), None)
            weather_info = {
                'weather': hour_weather['weather'] if hour_weather and hour_weather['weather'] else '-',
                'temperature': hour_weather['temperature'] if hour_weather and hour_weather['temperature'] is not None else None,
                'humidity': '-'
            } if hour_weather else None
            
            if hour_data:
                hour_data['weather_info'] = weather_info
                complete_hourly_data.append(hour_data)
            else:
                # データがない時間は0で埋める
                complete_hourly_data.append({
                    'hour': hour,
                    'congestion': 0,
                    'count': 0,
                    'weather_info': weather_info
                })
        
        return {
            'date': yesterday_date.strftime('%Y-%m-%d'),
            'day_of_week': yesterday_date.strftime('%a'),
            'congestion_level': day_congestion,
            'hourly_congestion': complete_hourly_data,
            'is_weekend': yesterday_date.weekday() >= 5,
            'data_available': True,
            'week_of_month_label': get_simple_weekday_label(yesterday_date)
        }
        
    except Exception as e:
        print(f"昨日の時間別データ取得中にエラーが発生しました: {e}")
        return {
            'date': (target_date - timedelta(days=1)).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'昨日の時間別データ取得中にエラーが発生しました: {e}'
        }

def get_congestion_data(csv_file_path: str, target_date: datetime = None, weeks_count: int = 3) -> Dict[str, Any]:
    """
    既存の分析ファイルを使用して混雑度データを取得（拡張版）
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（デフォルトは今日）
        weeks_count: 取得する週数（デフォルト3週間）
        
    Returns:
        Dict[str, Any]: 混雑度データ
    """
    if target_date is None:
        target_date = datetime.now()
    
    place = os.path.splitext(os.path.basename(csv_file_path))[0]
    
    print(f"混雑度データ取得開始: {place}, 基準日: {target_date.strftime('%Y-%m-%d')}, 週数: {weeks_count}")
    
    # 拡張された週間混雑度データ
    extended_congestion = get_extended_week_congestion(csv_file_path, target_date, weeks_count)
    
    # 去年度の同時期の混 congestionデータ
    historical_congestion = get_historical_congestion(csv_file_path, target_date, weeks_count)
    
    # 昨日の時間別データ
    yesterday_hourly = get_yesterday_hourly(csv_file_path, target_date)
    
    # 去年の同じ日付の時間別データ
    last_year_hourly = get_last_year_today_hourly(csv_file_path, target_date)
    
    return {
        'place': place,
        'analysis_date': target_date.strftime('%Y-%m-%d'),
        'weeks_count': weeks_count,
        'extended_week': extended_congestion,
        'historical_comparison': historical_congestion,
        'yesterday_hourly': yesterday_hourly,
        'last_year_today_hourly': last_year_hourly
    }

def get_last_year_today_hourly(csv_file_path: str, target_date: datetime) -> Dict[str, Any]:
    """
    去年の今日の時間別詳細データを取得（拡張版）
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（今日）
        
    Returns:
        Dict[str, Any]: 去年の今日の時間別データ
    """
    try:
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        # 去年の同じ日付を計算
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
        
        # 天気データを取得
        weather_data = weather_service.get_weather_for_date_time(year, month)
        daily_weather_data = weather_data.get(day, [])
        
        # その日の時間別データを取得
        date_time_data = get_data_for_date_time(df, year, month, place)
        hourly_data = []
        
        # 該当日の時間別データを抽出
        for day_info in date_time_data:
            if day_info['date'] == last_year_date.strftime('%Y-%m-%d'):
                hourly_data = day_info['hours']
                break
        
        # 7-22時の完全な時間データを作成
        complete_hourly_data = []
        for hour in range(7, 23):  # 7時から22時まで
            hour_data = next((h for h in hourly_data if h['hour'] == hour), None)
            
            # その時間の天気データを取得
            hour_weather = next((w for w in daily_weather_data if w['hour'] == hour), None)
            weather_info = {
                'weather': hour_weather['weather'] if hour_weather and hour_weather['weather'] else '-',
                'temperature': hour_weather['temperature'] if hour_weather and hour_weather['temperature'] is not None else None,
                'humidity': '-'
            } if hour_weather else None
            
            if hour_data:
                hour_data['weather_info'] = weather_info
                complete_hourly_data.append(hour_data)
            else:
                # データがない時間は0で埋める
                complete_hourly_data.append({
                    'hour': hour,
                    'congestion': 0,
                    'count': 0,
                    'weather_info': weather_info
                })
        
        return {
            'date': last_year_date.strftime('%Y-%m-%d'),
            'day_of_week': last_year_date.strftime('%a'),
            'congestion_level': day_congestion,
            'hourly_congestion': complete_hourly_data,
            'is_weekend': last_year_date.weekday() >= 5,
            'data_available': True,
            'week_of_month_label': get_simple_weekday_label(last_year_date)
        }
        
    except Exception as e:
        print(f"去年の時間別データ取得中にエラーが発生しました: {e}")
        return {
            'date': target_date.replace(year=target_date.year - 1).strftime('%Y-%m-%d'),
            'data_available': False,
            'message': f'去年の時間別データ取得中にエラーが発生しました: {e}'
        }

def get_congestion_summary(csv_file_path: str, target_date: datetime = None, weeks_count: int = 3) -> Dict[str, Any]:
    """
    混雑度データのサマリー版を取得（軽量版）
    
    Args:
        csv_file_path: CSVファイルのパス
        target_date: 基準日（デフォルトは今日）
        weeks_count: 取得する週数（デフォルト3週間）
        
    Returns:
        Dict[str, Any]: サマリー混雑度データ
    """
    if target_date is None:
        target_date = datetime.now()
    
    place = os.path.splitext(os.path.basename(csv_file_path))[0]
    
    print(f"サマリーデータ取得開始: {place}, 基準日: {target_date.strftime('%Y-%m-%d')}, 週数: {weeks_count}")
    
    # 基本的なデータ取得
    extended_data = get_extended_week_congestion(csv_file_path, target_date, weeks_count)
    historical_data = get_historical_congestion(csv_file_path, target_date, weeks_count)
    
    # 最近の週間サマリーを作成
    recent_week_summary = []
    if extended_data.get('daily_data'):
        recent_week_summary = [
            {
                'date': day['date'],
                'day_of_week': day['day_of_week'],
                'congestion_level': day['congestion_level'],
                'is_weekend': day['is_weekend'],
                'week_of_month_label': day['week_of_month_label'],
                'is_today': day.get('is_today', False),
                'days_from_today': day.get('days_from_today', 0),
                'is_future': day.get('is_future', False),
                'weather_info': day.get('weather_info')
            }
            for day in extended_data['daily_data']
        ]
    
    # 去年同期間のサマリーを作成
    historical_summary = []
    if historical_data.get('daily_data'):
        historical_summary = [
            {
                'date': day['date'],
                'day_of_week': day['day_of_week'],
                'congestion_level': day['congestion_level'],
                'is_weekend': day['is_weekend'],
                'days_from_reference': day['days_from_reference'],
                'week_of_month_label': day['week_of_month_label'],
                'weather_info': day.get('weather_info')
            }
            for day in historical_data['daily_data']
        ]
    
    # 昨日と去年今日の時間別サマリー
    yesterday_summary = None
    last_year_today_summary = None
    
    try:
        yesterday_data = get_yesterday_hourly(csv_file_path, target_date)
        if yesterday_data.get('data_available'):
            yesterday_summary = {
                'date': yesterday_data['date'],
                'day_of_week': yesterday_data['day_of_week'],
                'congestion_level': yesterday_data['congestion_level'],
                'is_weekend': yesterday_data['is_weekend'],
                'data_available': True
            }
    except:
        yesterday_summary = {'data_available': False}
    
    try:
        last_year_data = get_last_year_today_hourly(csv_file_path, target_date)
        if last_year_data.get('data_available'):
            last_year_today_summary = {
                'date': last_year_data['date'],
                'day_of_week': last_year_data['day_of_week'],
                'congestion_level': last_year_data['congestion_level'],
                'is_weekend': last_year_data['is_weekend'],
                'data_available': True
            }
    except:
        last_year_today_summary = {'data_available': False}
    
    print(f"サマリーデータ作成完了: 今年{len(recent_week_summary)}日, 去年{len(historical_summary)}日")
    
    return {
        'place': place,
        'analysis_date': target_date.strftime('%Y-%m-%d'),
        'weeks_count': weeks_count,
        'actual_days': extended_data.get('actual_days', 0),
        'recent_week_period': 'recent_week',
        'recent_week_start_date': extended_data.get('start_date'),
        'recent_week_end_date': extended_data.get('end_date'),
        'recent_week_daily_summary': recent_week_summary,
        'historical_period': 'historical',
        'historical_data_available': historical_data.get('data_available', False),
        'historical_reference_date': historical_data.get('reference_date'),
        'historical_daily_summary': historical_summary,
        'yesterday_hourly_summary': yesterday_summary,
        'last_year_today_hourly_summary': last_year_today_summary
    }

if __name__ == "__main__":
    # テスト用コード
    test_file = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/yasukawadori.csv"
    result = get_congestion_summary(test_file)
    print(f"混雑度データ: {result}")
