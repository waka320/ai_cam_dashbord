import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timedelta
import os
from app.services.analyze.get_data_for_date_time250504 import get_data_for_date_time as dti_get

# 各場所の混雑度境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (65, 850),
    'honmachi3': (35, 400),
    'honmachi4': (50, 2000),
    'jinnya': (50, 1000),
    'kokubunjidori': (40, 450),
    'nakabashi': (40, 650),
    'omotesando': (25, 700),
    'yasukawadori': (400, 2900),
    'yottekan': (10, 300),
    'old-town': (15, 150),        # 旧市街地域の歩行者データ分析に基づく
    'gyouzinbashi': (25, 900),    # 行神橋のデータから適切な値を算出
    'station': (25, 200),  
    # デフォルト値
    'default': (10, 500)
}


# 時間別の混雑度計算では日次閾値を時間にスケーリングして使用
def _scale_thresholds(thresholds):
    min_threshold, max_threshold = thresholds
    # 24でスケールしつつ、極端な小ささを避ける
    min_hourly = max(1, int(min_threshold / 24))
    max_hourly = max(min_hourly + 1, int(max_threshold / 24))
    return (min_hourly, max_hourly)

HOURLY_CONGESTION_THRESHOLDS = {
    place: _scale_thresholds(bounds) for place, bounds in CONGESTION_THRESHOLDS.items()
}


def calculate_congestion_level(count: float, place: str = 'default', hourly: bool = False) -> int:
    """
    混雑度を10段階で計算する
    
    Args:
        count: 人数
        place: 場所名
    
    Returns:
        int: 1-10の混雑度レベル
    """
    if pd.isna(count) or count == 0:
        return 0
    
    # 時間別かどうかで閾値マップを切り替える
    thresholds_map = HOURLY_CONGESTION_THRESHOLDS if hourly else CONGESTION_THRESHOLDS
    min_threshold, max_threshold = thresholds_map.get(place, thresholds_map['default'])
    
    if count < min_threshold:
        return 1
    elif count > max_threshold:
        return 10
    else:
        # min_thresholdとmax_thresholdの間を9段階に分割
        step = (max_threshold - min_threshold) / 9
        if step <= 0:
            return 10 if count >= max_threshold else 1
        level = int((count - min_threshold) / step) + 1
        return min(max(level, 1), 10)


def get_hourly_data_for_date(df: pd.DataFrame, target_date: datetime, place: str = 'default') -> List[Dict[str, Any]]:
    """
    指定日の時間別データを取得する
    
    Args:
        df: DataFrameデータ
        target_date: 対象日付
        place: 場所名
    
    Returns:
        List[Dict]: 時間別データのリスト
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person'].copy()
    
    # datetime_jst列をdatetimeに変換
    if not pd.api.types.is_datetime64_any_dtype(df_person['datetime_jst']):
        df_person['datetime_jst'] = pd.to_datetime(df_person['datetime_jst'])
    
    # 指定日のデータを抽出
    target_date_str = target_date.strftime('%Y-%m-%d')
    df_date = df_person[df_person['datetime_jst'].dt.date == target_date.date()].copy()
    
    # 時間別に集計
    df_date['hour'] = df_date['datetime_jst'].dt.hour
    hourly_counts = df_date.groupby('hour')['count_1_hour'].sum().reset_index()
    
    # 7-22時のデータを作成
    hourly_data = []
    for hour in range(7, 23):
        hour_data = hourly_counts[hourly_counts['hour'] == hour]
        if not hour_data.empty:
            count = int(hour_data['count_1_hour'].values[0])
            congestion = calculate_congestion_level(count, place, hourly=True)
        else:
            count = 0
            congestion = 0
        
        hourly_data.append({
            'hour': hour,
            'count': count,
            'congestion': congestion
        })
    
    return hourly_data


def get_event_effect_data(
    csv_file_path: str,
    event_year: int,
    event_month: int,
    event_day: int
) -> Dict[str, Any]:
    """
    イベント効果分析用のデータを取得する
    
    Args:
        csv_file_path: CSVファイルのパス
        event_year: イベント開催年
        event_month: イベント開催月
        event_day: イベント開催日
    
    Returns:
        Dict: イベント効果分析データ
    """
    try:
        print(f"get_event_effect_data called with: {csv_file_path}, {event_year}/{event_month}/{event_day}")
        
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
        print(f"CSV loaded: {len(df)} rows, place: {place}")
        
        # イベント日付を作成
        event_date = datetime(event_year, event_month, event_day)
        prev_week_date = event_date - timedelta(days=7)
        next_week_date = event_date + timedelta(days=7)
        
        print(f"Analyzing dates: event={event_date.strftime('%Y-%m-%d')}, prev={prev_week_date.strftime('%Y-%m-%d')}, next={next_week_date.strftime('%Y-%m-%d')}")
        
        # 各日付の時間別データを取得
        # DateTimeHeatmapと同一の混雑度計算に合わせるため、該当月ごとにDTIの月次データを生成して抽出
        def build_month_data(y: int, m: int) -> List[Dict[str, Any]]:
            try:
                return dti_get(df, y, m, place, None) or []
            except Exception:
                return []

        event_month_data = build_month_data(event_year, event_month)
        prev_month_data = event_month_data if (prev_week_date.year == event_year and prev_week_date.month == event_month) else build_month_data(prev_week_date.year, prev_week_date.month)
        next_month_data = event_month_data if (next_week_date.year == event_year and next_week_date.month == event_month) else build_month_data(next_week_date.year, next_week_date.month)

        def extract_hours(month_list: List[Dict[str, Any]], date_obj: datetime) -> List[Dict[str, Any]]:
            date_str = date_obj.strftime('%Y-%m-%d')
            for item in month_list:
                if item.get('date') == date_str:
                    return item.get('hours', [])
            # 見つからない場合はフォールバック
            return get_hourly_data_for_date(df, date_obj, place)

        event_hourly = extract_hours(event_month_data, event_date)
        prev_week_hourly = extract_hours(prev_month_data, prev_week_date)
        next_week_hourly = extract_hours(next_month_data, next_week_date)
        
        print(f"Hourly data collected: event={len(event_hourly)}, prev={len(prev_week_hourly)}, next={len(next_week_hourly)}")
        print(f"Event day total: {sum(h['count'] for h in event_hourly)}")
        
        # 増加率を計算（時間別）
        increase_rates = []
        for i in range(len(event_hourly)):
            event_count = event_hourly[i]['count']
            prev_count = prev_week_hourly[i]['count']
            next_count = next_week_hourly[i]['count']
            
            # 前週と翌週の平均
            avg_count = (prev_count + next_count) / 2
            
            # 増加率を計算
            if avg_count > 0:
                increase_rate = ((event_count - avg_count) / avg_count) * 100
            else:
                increase_rate = 0 if event_count == 0 else 100
            
            increase_rates.append({
                'hour': event_hourly[i]['hour'],
                'increase_rate': round(increase_rate, 1)
            })
        
        # 全体の合計人数と増加率を計算
        event_total = sum(h['count'] for h in event_hourly)
        prev_week_total = sum(h['count'] for h in prev_week_hourly)
        next_week_total = sum(h['count'] for h in next_week_hourly)
        avg_total = (prev_week_total + next_week_total) / 2
        
        if avg_total > 0:
            total_increase_rate = ((event_total - avg_total) / avg_total) * 100
        else:
            total_increase_rate = 0 if event_total == 0 else 100
        
        return {
            'place': place,
            'event_date': event_date.strftime('%Y-%m-%d'),
            'prev_week_date': prev_week_date.strftime('%Y-%m-%d'),
            'next_week_date': next_week_date.strftime('%Y-%m-%d'),
            'event_hourly': event_hourly,
            'prev_week_hourly': prev_week_hourly,
            'next_week_hourly': next_week_hourly,
            'increase_rates': increase_rates,
            'summary': {
                'event_total': event_total,
                'prev_week_total': prev_week_total,
                'next_week_total': next_week_total,
                'average_total': round(avg_total, 0),
                'total_increase_rate': round(total_increase_rate, 1)
            }
        }
    
    except Exception as e:
        print(f"Error in get_event_effect_data: {e}")
        import traceback
        print(traceback.format_exc())
        return {
            'error': str(e),
            'place': '',
            'event_date': '',
            'prev_week_date': '',
            'next_week_date': '',
            'event_hourly': [],
            'prev_week_hourly': [],
            'next_week_hourly': [],
            'increase_rates': [],
            'summary': {}
        }

