import pandas as pd
import calendar
import os
import glob
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import time
import requests
from bs4 import BeautifulSoup
from dateutil.relativedelta import relativedelta
from astral import LocationInfo
from astral.sun import sun

# モデルクラスの定義
class HourData:
    def __init__(self, hour: int, congestion: int, count: int, highlighted: bool = False, highlight_reason: str = ""):
        self.hour = hour
        self.congestion = congestion
        self.count = count
        self.highlighted = highlighted
        self.highlight_reason = highlight_reason
    
    def __repr__(self):
        return f"HourData(hour={self.hour}, congestion={self.congestion}, count={self.count})"

class DayWithHours:
    def __init__(self, day: str, hours: List[HourData]):
        self.day = day
        self.hours = hours
    
    def __repr__(self):
        return f"DayWithHours(day={self.day}, hours_count={len(self.hours)})"

class DayCongestion:
    def __init__(self, date: int, congestion: int):
        self.date = date
        self.congestion = congestion
    
    def __repr__(self):
        return f"DayCongestion(date={self.date}, congestion={self.congestion})"

# 各場所の混雑度の境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    # 時間帯別分析用
    'hour': {
        'honmachi2': (15, 400),
        'honmachi3': (10, 250),
        'honmachi4': (15, 300),
        'jinnya': (10, 500),
        'kokubunjidori': (15, 220),
        'nakabashi': (10, 350),
        'omotesando': (5, 160),
        'yasukawadori': (100, 2000),
        'yottekan': (3, 70),
        'gyouzinbashi': (25, 350),
        'old-town': (15, 150),
        'station': (40, 700),
        'default': (10, 500)
    },
    # 日毎の分析用
    'date': {
        'honmachi2': (65, 850),
        'honmachi3': (35, 750),
        'honmachi4': (50, 2000),
        'jinnya': (50, 1000),
        'kokubunjidori': (40, 450),
        'nakabashi': (40, 650),
        'omotesando': (25, 700),
        'yasukawadori': (400, 2900),
        'yottekan': (10, 300),
        'old-town': (15, 150),
        'gyouzinbashi': (25, 350),
        'station': (40, 700),
        'default': (10, 500)
    },
    # カレンダー表示用
    'calendar': {
        'honmachi2': (2300, 9500),
        'honmachi3': (1500, 8500),
        'honmachi4': (1000, 10000),
        'jinnya': (700, 7000),
        'kokubunjidori': (1600, 5800),
        'nakabashi': (1600, 7800),
        'omotesando': (700, 7000),
        'yasukawadori': (7000, 26000),
        'yottekan': (300, 3500),
        'gyouzinbashi': (500, 5000),
        'old-town': (900, 20000),
        'station': (300, 7000),
        'default': (2300, 9500)
    }
}

# 曜日名のマッピング
WEEKDAY_NAMES = {
    0: {"en": "Mon", "jp": "月"},
    1: {"en": "Tue", "jp": "火"},
    2: {"en": "Wed", "jp": "水"},
    3: {"en": "Thu", "jp": "木"},
    4: {"en": "Fri", "jp": "金"},
    5: {"en": "Sat", "jp": "土"},
    6: {"en": "Sun", "jp": "日"}
}

# 天気データのキャッシュ
weather_cache = {}  # キー: 'YYYY-MM', 値: その月の天気データ

# 高山市の位置情報
city = LocationInfo("Takayama", "Japan", "Asia/Tokyo", 36.1429, 137.2526)

# ------------ 天気情報関連の関数 ------------

def get_sun_info(date):
    """日の出・日の入り時刻と日照時間を取得する"""
    try:
        # その日の太陽情報を取得
        s = sun(city.observer, date=date)
        
        # 日本時間に変換（UTCから+9時間）
        sunrise = (s['sunrise'] + timedelta(hours=9)).strftime('%H:%M')
        sunset = (s['sunset'] + timedelta(hours=9)).strftime('%H:%M')
        
        # 日照時間計算（分単位）
        sunrise_time = s['sunrise']
        sunset_time = s['sunset']
        daylight_seconds = (sunset_time - sunrise_time).total_seconds()
        daylight_hours = daylight_seconds / 3600  # 秒から時間に変換
        
        return sunrise, sunset, f"{daylight_hours:.2f}h"
    except Exception as e:
        print(f"日の出・日の入り計算エラー: {date}, {e}")
        return None, None, None

def fetch_monthly_weather(year, month):
    """月間の天気データを取得する関数"""
    # キャッシュキーを作成
    cache_key = f"{year}-{month:02d}"
    
    # すでにキャッシュにある場合はキャッシュから返す
    if cache_key in weather_cache:
        print(f"キャッシュからデータを取得: {cache_key}")
        return weather_cache[cache_key]
    
    print(f"HTTPリクエスト実行: {year}年{month}月のデータを取得します")
    
    # tenki.jpの過去天気ページURL
    base_url = f"https://tenki.jp/past/{year}/{month:02d}/weather/5/24/47617/"
    
    try:
        # サーバーに負荷をかけないよう少し待機
        time.sleep(0.5)
        
        response = requests.get(base_url)
        if response.status_code != 200:
            print(f"データ取得失敗: ステータスコード {response.status_code}")
            return {}
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 月間データを格納する辞書
        monthly_data = {}
        
        # 日付に該当するセルを見つける
        day_cells = soup.find_all('td')
        for cell in day_cells:
            # セル内に日付データがあるか確認
            date_span = cell.select_one("span.date")
            if date_span and date_span.text.strip().isdigit():
                day = int(date_span.text.strip())
                
                # 天気を取得 (alt属性から)
                img = cell.find('img')
                weather = img['alt'] if img and 'alt' in img.attrs else "不明"
                
                # 最高気温と最低気温を取得
                high_temp = cell.select_one("span.high-temp")
                low_temp = cell.select_one("span.low-temp")
                
                high_temp_text = high_temp.text.strip() if high_temp else None
                low_temp_text = low_temp.text.strip() if low_temp else None
                
                # その日のデータを辞書に格納
                monthly_data[day] = {
                    'weather': weather,
                    'high_temp': high_temp_text,
                    'low_temp': low_temp_text
                }
        
        # キャッシュに保存
        weather_cache[cache_key] = monthly_data
        print(f"{len(monthly_data)}日分のデータを取得しました: {cache_key}")
        return monthly_data
        
    except Exception as e:
        print(f"エラー: {cache_key}のデータ取得中に例外が発生しました: {str(e)}")
        return {}

def fetch_weather_info(date):
    """指定した日の天気情報を取得"""
    # 過去日付か将来日付かを判定
    current_date = datetime.now().date()
    target_date = date.date() if isinstance(date, datetime) else date
    days_diff = (current_date - target_date).days
    
    # 将来の日付の場合、予報データを返す
    if days_diff < 0:
        return "予報データ", None, None
    
    # 対象の年月を取得
    year = target_date.year
    month = target_date.month
    day = target_date.day
    
    # 月間データを取得
    monthly_data = fetch_monthly_weather(year, month)
    
    # 指定した日のデータがあるか確認
    if day in monthly_data:
        data = monthly_data[day]
        return data['weather'], data['high_temp'], data['low_temp']
    else:
        return "データなし", None, None

def get_japanese_weekday(date):
    """日付から日本語の曜日を取得"""
    weekday_kanji = ["月", "火", "水", "木", "金", "土", "日"]
    return weekday_kanji[date.weekday()]

# ------------ イベント情報関連の関数とクラス ------------

class Event:
    """イベント情報を表すクラス"""
    def __init__(self, name, is_match_func, category):
        self.name = name  # イベント名
        self.is_match_func = is_match_func  # このイベントが日付に該当するかを判定する関数
        self.category = category  # イベントのカテゴリ

# カテゴリの定数
CATEGORY_TAKAYAMA = "高山イベント"
CATEGORY_NATIONAL = "国民的イベント"
CATEGORY_OTHER = "その他"

# 高山市のイベント情報の定義
TAKAYAMA_EVENTS = [
    # 高山のイベント
    Event("春の高山祭", lambda d: d.month == 4 and d.day in [14, 15], CATEGORY_TAKAYAMA),
    Event("秋の高山祭", lambda d: d.month == 10 and d.day in [9, 10], CATEGORY_TAKAYAMA),
    Event("雫宮祭", lambda d: d.month == 3 and d.day == 20, CATEGORY_TAKAYAMA),
    Event("二十四日市", lambda d: d.month == 1 and d.day == 24, CATEGORY_TAKAYAMA),
    
    # 国民的イベント（祝日、季節の変わり目など）
    Event("元日", lambda d: d.month == 1 and d.day >= 1 and d.day <= 3, CATEGORY_NATIONAL),
    Event("成人の日", lambda d: d.month == 1 and d.day >= 8 and d.day <= 14 and d.weekday() == 0, CATEGORY_NATIONAL),
    Event("建国記念の日", lambda d: d.month == 2 and d.day == 11, CATEGORY_NATIONAL),
    Event("天皇誕生日", lambda d: d.month == 2 and d.day == 23, CATEGORY_NATIONAL),
    Event("春分の日", lambda d: d.month == 3 and d.day in [20, 21], CATEGORY_NATIONAL),
    Event("昭和の日", lambda d: d.month == 4 and d.day == 29, CATEGORY_NATIONAL),
    Event("憲法記念日", lambda d: d.month == 5 and d.day == 3, CATEGORY_NATIONAL),
    Event("みどりの日", lambda d: d.month == 5 and d.day == 4, CATEGORY_NATIONAL),
    Event("こどもの日", lambda d: d.month == 5 and d.day == 5, CATEGORY_NATIONAL),
    Event("海の日", lambda d: d.month == 7 and d.day >= 15 and d.day <= 21 and d.weekday() == 0, CATEGORY_NATIONAL),
    Event("山の日", lambda d: d.month == 8 and d.day == 11, CATEGORY_NATIONAL),
    Event("敬老の日", lambda d: d.month == 9 and d.day >= 15 and d.day <= 21 and d.weekday() == 0, CATEGORY_NATIONAL),
    Event("秋分の日", lambda d: d.month == 9 and d.day in [22, 23], CATEGORY_NATIONAL),
    Event("スポーツの日", lambda d: d.month == 10 and d.day >= 8 and d.day <= 14 and d.weekday() == 0, CATEGORY_NATIONAL),
    Event("文化の日", lambda d: d.month == 11 and d.day == 3, CATEGORY_NATIONAL),
    Event("勤労感謝の日", lambda d: d.month == 11 and d.day == 23, CATEGORY_NATIONAL),
    Event("夏至", lambda d: d.month == 6 and d.day in [20, 21, 22], CATEGORY_NATIONAL),
    Event("冬至", lambda d: d.month == 12 and d.day in [21, 22, 23], CATEGORY_NATIONAL),
    Event("立春", lambda d: d.month == 2 and d.day in [3, 4, 5], CATEGORY_NATIONAL),
    
    # 季節の行事
    Event("お盆", lambda d: d.month == 8 and 13 <= d.day <= 16, CATEGORY_NATIONAL),
    Event("ゴールデンウィーク", lambda d: d.month == 5 and 3 <= d.day <= 5, CATEGORY_NATIONAL),
    Event("松の内", lambda d: d.month == 1 and 1 <= d.day <= 7, CATEGORY_NATIONAL),
    Event("七草の節句", lambda d: d.month == 1 and d.day == 7, CATEGORY_NATIONAL),
    Event("鏡開き", lambda d: d.month == 1 and d.day in [11, 15, 20], CATEGORY_NATIONAL),
    Event("節分", lambda d: d.month == 2 and d.day in [2, 3, 4], CATEGORY_NATIONAL),
    Event("バレンタインデー", lambda d: d.month == 2 and d.day == 14, CATEGORY_NATIONAL),
    Event("ひな祭り", lambda d: d.month == 3 and d.day == 3, CATEGORY_NATIONAL),
    Event("ホワイトデー", lambda d: d.month == 3 and d.day == 14, CATEGORY_NATIONAL),
    Event("彼岸入り(春)", lambda d: d.month == 3 and d.day in [17, 18, 19], CATEGORY_NATIONAL),
    Event("彼岸明け(春)", lambda d: d.month == 3 and d.day in [23, 24, 25], CATEGORY_NATIONAL),
    Event("入学式シーズン", lambda d: d.month == 4 and 1 <= d.day <= 10, CATEGORY_NATIONAL),
    Event("端午の節句", lambda d: d.month == 5 and d.day == 5, CATEGORY_NATIONAL),
    Event("母の日", lambda d: d.month == 5 and d.day >= 8 and d.day <= 14 and d.weekday() == 6, CATEGORY_NATIONAL),
    Event("父の日", lambda d: d.month == 6 and d.day >= 15 and d.day <= 21 and d.weekday() == 6, CATEGORY_NATIONAL),
    Event("七夕", lambda d: d.month == 7 and d.day == 7, CATEGORY_NATIONAL),
    Event("土用の丑", lambda d: d.month == 7 and 20 <= d.day <= 30, CATEGORY_NATIONAL),
    Event("立秋", lambda d: d.month == 8 and d.day in [7, 8, 9], CATEGORY_NATIONAL),
    Event("重陽の節句", lambda d: d.month == 9 and d.day == 9, CATEGORY_NATIONAL),
    Event("十五夜", lambda d: d.month == 9 and 8 <= d.day <= 15, CATEGORY_NATIONAL),
    Event("シルバーウィーク", lambda d: d.month == 9 and 19 <= d.day <= 23, CATEGORY_NATIONAL),
    Event("彼岸入り(秋)", lambda d: d.month == 9 and d.day in [19, 20, 21], CATEGORY_NATIONAL),
    Event("彼岸明け(秋)", lambda d: d.month == 9 and d.day in [25, 26, 27], CATEGORY_NATIONAL),
    Event("ハロウィン", lambda d: d.month == 10 and d.day == 31, CATEGORY_NATIONAL),
    Event("立冬", lambda d: d.month == 11 and d.day in [7, 8, 9], CATEGORY_NATIONAL),
    Event("七五三", lambda d: d.month == 11 and d.day == 15, CATEGORY_NATIONAL),
    Event("クリスマスイブ", lambda d: d.month == 12 and d.day == 24, CATEGORY_NATIONAL),
    Event("クリスマス", lambda d: d.month == 12 and d.day == 25, CATEGORY_NATIONAL),
    Event("大晦日", lambda d: d.month == 12 and d.day == 31, CATEGORY_NATIONAL),
    
    # その他イベント
    Event("春節/旧正月", lambda d: (d.month == 1 and d.day >= 20) or (d.month == 2 and d.day <= 20), CATEGORY_OTHER),
    Event("イースター", lambda d: (d.month == 3 and d.day >= 22) or (d.month == 4 and d.day <= 25), CATEGORY_OTHER),
    Event("感謝祭（米国）", lambda d: d.month == 11 and 22 <= d.day <= 28 and d.weekday() == 3, CATEGORY_OTHER),
    Event("ブラックフライデー", lambda d: d.month == 11 and 23 <= d.day <= 29 and d.weekday() == 4, CATEGORY_OTHER),
    Event("クリスマスシーズン", lambda d: d.month == 12 and 1 <= d.day <= 23, CATEGORY_OTHER),
    
    # 気象・季節関連
    Event("梅雨入り（東海）", lambda d: d.month == 6 and 5 <= d.day <= 10, CATEGORY_OTHER),
    Event("梅雨明け（東海）", lambda d: d.month == 7 and 15 <= d.day <= 25, CATEGORY_OTHER),
    
    # ビジネス関連
    Event("年度末", lambda d: d.month == 3 and 25 <= d.day <= 31, CATEGORY_OTHER),
    Event("年度始め", lambda d: d.month == 4 and 1 <= d.day <= 5, CATEGORY_OTHER),
    Event("夏のボーナス時期", lambda d: d.month == 6 and 15 <= d.day <= 30, CATEGORY_OTHER),
    Event("冬のボーナス時期", lambda d: d.month == 12 and 5 <= d.day <= 20, CATEGORY_OTHER),
    
    # 特定の気象災害情報
    Event("停滞前線による記録的な大雨", lambda d: d.year == 2021 and d.month == 8 and 11 <= d.day <= 19, CATEGORY_OTHER),
    Event("台風・梅雨前線による強い降雨", lambda d: d.year == 2022 and d.month == 7 and 14 <= d.day <= 16, CATEGORY_OTHER),
    Event("台風14号（ナンマドル）による強風と大雨", lambda d: d.year == 2022 and d.month == 9 and d.day == 14, CATEGORY_OTHER),
    Event("台風13号から変わった熱帯低気圧による記録的大雨", lambda d: d.year == 2023 and d.month == 9 and 1 <= d.day <= 10, CATEGORY_OTHER),
]

def get_events_by_category(date, category):
    """指定カテゴリのイベントのみを取得"""
    matching_events = [event.name for event in TAKAYAMA_EVENTS 
                      if event.is_match_func(date) and event.category == category]
    return "、".join(matching_events) if matching_events else ""

# ------------ 混雑度計算関連の関数 ------------

def calculate_congestion_level(count, place, mode='hour'):
    """
    混雑度レベルを計算する関数
    
    Args:
        count: 歩行者数
        place: 場所名
        mode: 'hour', 'date', 'calendar'のいずれか
    
    Returns:
        int: 0-10の混雑度レベル (0はデータなし)
    """
    if count == 0:
        return 0
    
    # 閾値の取得
    thresholds = CONGESTION_THRESHOLDS.get(mode, CONGESTION_THRESHOLDS['hour'])
    min_threshold, max_threshold = thresholds.get(place, thresholds['default'])
    
    # 中間値（混雑度5,6の境界値）
    middle_threshold = (min_threshold + max_threshold) / 2
    
    # 混雑度1,2〜5,6の間のステップ
    step_lower = (middle_threshold - min_threshold) / 4
    
    # 混雑度5,6〜9,10の間のステップ
    step_upper = (max_threshold - middle_threshold) / 4
    
    # 境界値のリスト
    bins = [0, 1, min_threshold]  # 0=データなし, 1以上=データあり, min_threshold=レベル2の開始
    
    # 混雑度2,3、3,4、4,5の境界値
    for i in range(1, 4):
        bins.append(min_threshold + i * step_lower)
    
    # 混雑度5,6の境界値
    bins.append(middle_threshold)
    
    # 混雑度6,7、7,8、8,9の境界値
    for i in range(1, 4):
        bins.append(middle_threshold + i * step_upper)
    
    # 混雑度9,10の境界値
    bins.append(max_threshold)
    
    # 混雑度10の上限（無限大）
    bins.append(float('inf'))
    
    # 混雑度レベルの判定
    for i in range(len(bins) - 1):
        if bins[i] <= count < bins[i+1]:
            return i
    
    return 10  # 最大混雑度

# ------------ データ取得と分析関数 ------------

def load_pedestrian_data(directory_path='/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai'):
    """
    指定したディレクトリ内のすべてのCSVファイルを読み込み、場所ごとのデータフレームを返す
    
    Returns:
        Dict[str, pd.DataFrame]: {場所名: データフレーム} の辞書
    """
    # CSVファイルをリストアップ
    csv_files = glob.glob(os.path.join(directory_path, '*.csv'))
    
    if not csv_files:
        print(f"指定したディレクトリ {directory_path} にCSVファイルが見つかりませんでした")
        return {}
    
    print(f"CSVファイル {len(csv_files)} 件を読み込みます")
    
    # 場所ごとのデータフレームを格納する辞書
    location_data = {}
    
    for csv_file in csv_files:
        try:
            # ファイル名から場所名を取得
            place = os.path.splitext(os.path.basename(csv_file))[0]
            
            # CSVファイルを読み込む
            df = pd.read_csv(csv_file)
            
            # 必要な列が存在するか確認
            required_cols = ['name', 'count_1_hour', 'time_jst']
            date_cols = ['datetime_jst', 'date_jst']
            
            missing_cols = [col for col in required_cols if col not in df.columns]
            date_col = next((col for col in date_cols if col in df.columns), None)
            
            if missing_cols or not date_col:
                print(f"警告: {csv_file} に必要な列がありません。スキップします。")
                print(f"  不足している列: {missing_cols}")
                print(f"  日付列: {date_col}")
                continue
            
            # 日付列をdatetimeに変換
            df[date_col] = pd.to_datetime(df[date_col])
            
            # データフレームを辞書に格納
            location_data[place] = df
            
            print(f"{place}: {len(df)} 行のデータを読み込みました ({df[date_col].min()} ~ {df[date_col].max()})")
            
        except Exception as e:
            print(f"エラー: {csv_file} の読み込み中に例外が発生しました: {str(e)}")
    
    return location_data

def analyze_calendar_data(df, year, month, place):
    """
    カレンダー形式の歩行者データを分析
    
    Returns:
        List[List[Optional[DayCongestion]]]: カレンダー形式のデータ (日曜始まり)
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']
    
    # 日付列を取得
    date_col = next((col for col in ['datetime_jst', 'date_jst'] if col in df_person.columns), None)
    
    if not date_col:
        print("エラー: 日付列が見つかりません")
        return []
    
    # 日付のみの列を追加
    df_person['date_only'] = df_person[date_col].dt.date
    
    # 日ごとの歩行者数を集計
    daily_counts = df_person.groupby('date_only')['count_1_hour'].sum().reset_index()
    daily_counts['datetime_jst'] = pd.to_datetime(daily_counts['date_only'])
    
    # 該当する月のデータをフィルタリング
    monthly_counts = daily_counts[
        (daily_counts['datetime_jst'].dt.year == year) &
        (daily_counts['datetime_jst'].dt.month == month)
    ]
    
    # 混雑度レベルを計算
    monthly_counts['level'] = monthly_counts['count_1_hour'].apply(
        lambda x: calculate_congestion_level(x, place, 'calendar')
    )
    
    # 日付をインデックスに設定
    monthly_counts.set_index('datetime_jst', inplace=True)
    
    # カレンダーの最初の日の曜日を計算（日曜始まりに調整）
    first_day_weekday = calendar.weekday(year, month, 1)
    first_day_weekday = (first_day_weekday + 1) % 7  # 月曜=0 を 日曜=0 に変換
    
    # 月の日数を計算
    days_in_month = calendar.monthrange(year, month)[1]
    
    # カレンダー形式のデータを作成
    calendar_data = []
    week = [None] * first_day_weekday  # 最初の週の空白を埋める
    
    for day in range(1, days_in_month + 1):
        date = pd.Timestamp(year=year, month=month, day=day)
        
        if date in monthly_counts.index:
            level = monthly_counts.loc[date, 'level']
        else:
            level = 0  # データがない場合は混雑度0
        
        day_data = DayCongestion(date=day, congestion=int(level))
        week.append(day_data)
        
        if len(week) == 7:
            calendar_data.append(week)
            week = []
    
    # 最後の週が7日に満たない場合、Noneで埋める
    if week:
        week += [None] * (7 - len(week))
        calendar_data.append(week)
    
    return calendar_data

def analyze_weekly_hourly_data(df, year, month, place):
    """
    曜日×時間帯形式の歩行者データを分析
    
    Returns:
        List[DayWithHours]: 曜日ごとの時間帯データ
    """
    # 日付列を取得
    date_col = next((col for col in ['datetime_jst', 'date_jst'] if col in df.columns), None)
    
    if not date_col:
        print("エラー: 日付列が見つかりません")
        return []
    
    # 該当する年月のデータのみにフィルタリング
    df_month = df[
        (df[date_col].dt.year == year) &
        (df[date_col].dt.month == month) &
        (df['name'] == 'person')  # 人のデータのみ
    ]
    
    # 時間帯をフィルタリング（7時から22時まで）
    df_filtered = df_month[(df_month['time_jst'] >= 7) & (df_month['time_jst'] <= 22)].copy()
    
    # 曜日情報を追加
    df_filtered['weekday'] = df_filtered[date_col].dt.weekday
    
    # 曜日と時間でグループ化して平均
    grouped = df_filtered.groupby(['weekday', 'time_jst'])['count_1_hour'].mean().reset_index()
    
    # 結果を格納するリスト
    result = []
    
    for weekday in range(7):  # 0:月曜〜6:日曜
        weekday_data = grouped[grouped['weekday'] == weekday]
        
        hours_data = []
        # 7時から22時までの各時間のデータを取得
        for hour in range(7, 23):
            hour_data = weekday_data[weekday_data['time_jst'] == hour]
            
            if not hour_data.empty:
                count = int(hour_data['count_1_hour'].values[0])
                level = calculate_congestion_level(count, place, 'hour')
            else:
                count = 0
                level = 0
            
            # HourDataオブジェクトとして追加
            hours_data.append(HourData(
                hour=hour,
                congestion=level,
                count=count,
                highlighted=False,
                highlight_reason=""
            ))
        
        # DayWithHoursオブジェクトとして結果に追加
        result.append(DayWithHours(
            day=WEEKDAY_NAMES[weekday]["jp"],
            hours=hours_data
        ))
    
    return result

def analyze_daily_hourly_data(df, year, month, place):
    """
    日付×時間帯形式の歩行者データを分析
    
    Returns:
        List[Dict]: [{"date": 日付, "day": 曜日, "hours": [時間データ]}, ...]
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']
    
    # 日付列を取得
    date_col = next((col for col in ['datetime_jst', 'date_jst'] if col in df_person.columns), None)
    
    if not date_col:
        print("エラー: 日付列が見つかりません")
        return []
    
    # 該当する年月のデータのみにフィルタリング
    df_month = df_person[
        (df_person[date_col].dt.year == year) &
        (df_person[date_col].dt.month == month)
    ]
    
    # 時間帯をフィルタリング（7時から22時まで）
    df_filtered = df_month[(df_month['time_jst'] >= 7) & (df_month['time_jst'] <= 22)]
    
    # 日付と時間でグループ化して合計
    grouped = df_filtered.groupby([df_filtered[date_col].dt.day, 'time_jst'])['count_1_hour'].sum().reset_index()
    
    # 結果を新しい形式で整理
    result_dict = {}
    
    for _, row in grouped.iterrows():
        day_num = int(row[date_col])  # 日付の「日」の値
        
        # ISO形式の日付文字列を作成（YYYY-MM-DD）
        date_str = f"{year}-{month:02d}-{day_num:02d}"
        
        hour = int(row['time_jst'])
        count = int(row['count_1_hour'])
        level = calculate_congestion_level(count, place, 'date')
        
        if date_str not in result_dict:
            # 曜日を計算
            date_obj = datetime(year, month, day_num)
            weekday = date_obj.strftime('%a')  # 曜日の省略形
            
            result_dict[date_str] = {
                "date": date_str,
                "day": weekday,
                "hours": []
            }
        
        # その日の時間データを追加
        result_dict[date_str]["hours"].append({
            "hour": hour,
            "congestion": level,
            "count": count,
            "highlighted": False,
            "highlight_reason": ""
        })
    
    # 辞書をリストに変換して返す
    result = list(result_dict.values())
    
    return result

def analyze_pedestrian_with_weather(location_data, year, month):
    """
    歩行者データと天気・イベントデータを組み合わせて分析する
    
    Args:
        location_data: {場所名: データフレーム} の辞書
        year: 年
        month: 月
    
    Returns:
        Dict: 分析結果
    """
    # 対象となる年月の全日付を生成
    days_in_month = calendar.monthrange(year, month)[1]
    dates = [datetime(year, month, day) for day in range(1, days_in_month + 1)]
    
    # 天気データを予め取得
    fetch_monthly_weather(year, month)
    
    # 日付ごとの天気・イベント・日照情報を格納する辞書
    daily_info = {}
    
    # 各日付について天気とイベント情報を取得
    for date in dates:
        # 天気情報取得
        weather, max_temp, min_temp = fetch_weather_info(date)
        
        # 日の出・日の入り・日照時間情報を取得
        sunrise, sunset, daylight = get_sun_info(date)
        
        # イベント情報を各カテゴリ別に取得
        takayama_events = get_events_by_category(date, CATEGORY_TAKAYAMA)
        national_events = get_events_by_category(date, CATEGORY_NATIONAL)
        other_events = get_events_by_category(date, CATEGORY_OTHER)
        
        # データを格納
        date_str = date.strftime('%Y-%m-%d')
        daily_info[date_str] = {
            'date': date_str,
            'weekday': get_japanese_weekday(date),
            'weather': weather,
            'max_temp': max_temp,
            'min_temp': min_temp,
            'sunrise': sunrise,
            'sunset': sunset,
            'daylight': daylight,
            'takayama_events': takayama_events,
            'national_events': national_events,
            'other_events': other_events,
        }
    
    # 各場所のデータを分析
    results = {}
    
    for place, df in location_data.items():
        # 各種データ分析を実行
        calendar_data = analyze_calendar_data(df, year, month, place)
        weekly_data = analyze_weekly_hourly_data(df, year, month, place)
        daily_data = analyze_daily_hourly_data(df, year, month, place)
        
        # イベント情報とのマッチング
        for day_data in daily_data:
            date_str = day_data['date']
            if date_str in daily_info:
                day_info = daily_info[date_str]
                
                # イベント情報を追加
                day_data['weather'] = day_info['weather']
                day_data['max_temp'] = day_info['max_temp']
                day_data['min_temp'] = day_info['min_temp']
                day_data['sunrise'] = day_info['sunrise']
                day_data['sunset'] = day_info['sunset']
                day_data['daylight'] = day_info['daylight']
                day_data['takayama_events'] = day_info['takayama_events']
                day_data['national_events'] = day_info['national_events']
                day_data['other_events'] = day_info['other_events']
        
        # 結果の格納
        results[place] = {
            'calendar': calendar_data,
            'weekly': weekly_data,
            'daily': daily_data
        }
    
    return {
        'results': results,
        'daily_info': daily_info
    }

def output_analysis_to_csv(analysis_result, output_dir, year, month):
    """分析結果をCSVファイルに出力する"""
    # 出力ディレクトリがなければ作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 日付ごとの歩行者数と天気情報を結合したデータを作成
    daily_data = []
    
    for place, data in analysis_result['results'].items():
        for day_info in data['daily']:
            date_str = day_info['date']
            base_info = {
                '日付': date_str,
                '曜日': day_info.get('day', ''),
                '場所': place,
                '天気': day_info.get('weather', ''),
                '最高気温': day_info.get('max_temp', ''),
                '最低気温': day_info.get('min_temp', ''),
                '日の出': day_info.get('sunrise', ''),
                '日の入り': day_info.get('sunset', ''),
                '日照時間': day_info.get('daylight', ''),
                '高山イベント': day_info.get('takayama_events', ''),
                '国民的イベント': day_info.get('national_events', ''),
                'その他': day_info.get('other_events', ''),
            }
            
            # 時間帯別の歩行者数を追加
            for hour_data in day_info.get('hours', []):
                hour = hour_data['hour']
                count = hour_data['count']
                base_info[f'{hour}時'] = count
            
            daily_data.append(base_info)
    
    # DataFrameに変換してCSV出力
    if daily_data:
        df = pd.DataFrame(daily_data)
        output_file = os.path.join(output_dir, f"pedestrian_analysis_{year}_{month:02d}.csv")
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"分析結果を {output_file} に保存しました")

def output_analysis_by_location(analysis_results, output_dir):
    """
    複数月の分析結果を場所ごとに3種類のCSVファイルに出力する
    
    Args:
        analysis_results: {(year, month): 分析結果} の辞書
        output_dir: 出力ディレクトリ
    """
    # 出力ディレクトリがなければ作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 場所ごとのデータを格納する辞書を初期化
    location_daily_data = {}  # 日別集計データ用
    location_hourly_data = {}  # 日付×時間帯データ用
    location_weekly_data = {}  # 曜日×時間帯データ用
    
    # 曜日と年月から日付のマッピングを作成するための辞書
    location_weekday_dates = {}  # {場所: {(年, 月, 曜日): [日付のリスト]}}
    
    # すべての分析結果から場所ごとのデータを収集
    for (year, month), result in analysis_results.items():
        print(f"{year}年{month}月のデータを処理しています...")
        
        # 1. 日別集計データ（カレンダー形式のデータから）
        for place, data in result['results'].items():
            # 場所がまだ辞書にない場合は初期化
            if place not in location_daily_data:
                location_daily_data[place] = []
            
            # 場所ごとに曜日→日付のマッピングを保持する辞書を初期化
            if place not in location_weekday_dates:
                location_weekday_dates[place] = {}
            
            # 日付ごとの歩行者数を集計するために日別データを準備
            daily_counts = {}
            for day_info in data['daily']:
                date_str = day_info['date']
                total_count = sum([hour_data['count'] for hour_data in day_info.get('hours', [])])
                daily_counts[date_str] = total_count
                
                # 曜日と日付のマッピングを保存（weekly.csv用）
                # 日付から曜日を取得
                date_obj = datetime.fromisoformat(date_str)
                weekday_jp = get_japanese_weekday(date_obj)  # "月", "火", ...
                
                # 年月曜日の組み合わせをキーとして日付を追加
                key = (year, month, weekday_jp)
                if key not in location_weekday_dates[place]:
                    location_weekday_dates[place][key] = []
                location_weekday_dates[place][key].append(date_str)
            
            # 各日付について基本情報と合計を格納
            for date_str, day_info in result['daily_info'].items():
                daily_count = daily_counts.get(date_str, 0)
                
                # 日別集計データを追加
                location_daily_data[place].append({
                    '日付': date_str,
                    '曜日': day_info.get('weekday', ''),
                    '合計歩行者数': daily_count,
                    '天気': day_info.get('weather', ''),
                    '最高気温': day_info.get('max_temp', ''),
                    '最低気温': day_info.get('min_temp', ''),
                    '日の出': day_info.get('sunrise', ''),
                    '日の入り': day_info.get('sunset', ''),
                    '日照時間': day_info.get('daylight', ''),
                    '高山イベント': day_info.get('takayama_events', ''),
                    '国民的イベント': day_info.get('national_events', ''),
                    'その他イベント': day_info.get('other_events', ''),
                })
            
            # 2. 日付×時間帯の詳細データ
            if place not in location_hourly_data:
                location_hourly_data[place] = []
                
            # 日付と時間ごとのデータを追加
            for day_info in data['daily']:
                date_str = day_info['date']
                base_info = {
                    '日付': date_str,
                    '曜日': day_info.get('day', ''),
                    '天気': day_info.get('weather', ''),
                    '最高気温': day_info.get('max_temp', ''),
                    '最低気温': day_info.get('min_temp', ''),
                    '高山イベント': day_info.get('takayama_events', ''),  # 追加: 高山イベント
                    '国民的イベント': day_info.get('national_events', ''),  # 追加: 国民的イベント
                }
                
                # 時間帯ごとのデータを個別の行として追加
                for hour_data in day_info.get('hours', []):
                    hour = hour_data['hour']
                    row_data = base_info.copy()  # 基本情報をコピー
                    row_data['時間'] = hour
                    row_data['歩行者数'] = hour_data['count']
                    row_data['混雑度'] = hour_data['congestion']
                    location_hourly_data[place].append(row_data)
            
            # 3. 曜日×時間帯の平均データ
            if place not in location_weekly_data:
                location_weekly_data[place] = []
            
            # 曜日ごとのデータを取得
            for weekday_data in data['weekly']:
                weekday = weekday_data.day  # "月", "火", ...
                
                # この年月の特定曜日に対応する日付リスト
                month_key = (year, month, weekday)
                date_list = location_weekday_dates[place].get(month_key, [])
                
                # 日付リストから代表日を選択（最初の日付）
                representative_date = date_list[0] if date_list else f"{year}-{month:02d}-01"
                
                # イベント情報の収集（その曜日のすべての日のイベントを集約）
                takayama_events = set()
                national_events = set()
                
                for date_str in date_list:
                    # daily_infoから日付に対応するイベント情報を取得
                    day_info = result['daily_info'].get(date_str, {})
                    
                    # イベント情報を集約（重複を避けるためsetを使用）
                    if day_info.get('takayama_events'):
                        takayama_events.update(day_info.get('takayama_events').split('、'))
                    if day_info.get('national_events'):
                        national_events.update(day_info.get('national_events').split('、'))
                
                # 空の値を除去
                takayama_events.discard('')
                national_events.discard('')
                
                # 時間帯ごとのデータを個別の行として追加
                for hour_data in weekday_data.hours:
                    location_weekly_data[place].append({
                        '曜日': weekday,
                        '代表日': representative_date,  # 追加: 代表的な日付
                        '時間': hour_data.hour,
                        '平均歩行者数': hour_data.count,
                        '混雑度': hour_data.congestion,
                        '高山イベント': '、'.join(takayama_events) if takayama_events else '',  # 追加: 高山イベント
                        '国民的イベント': '、'.join(national_events) if national_events else '',  # 追加: 国民的イベント
                    })
    
    # 各場所ごとに3種類のCSVファイルを出力
    for place in location_daily_data.keys():
        # 1. 日別集計データ
        if location_daily_data[place]:
            # データを日付でソート
            sorted_data = sorted(location_daily_data[place], key=lambda x: x['日付'])
            
            # DataFrameに変換
            df = pd.DataFrame(sorted_data)
            
            # CSVとして出力
            output_file = os.path.join(output_dir, f"{place}_daily.csv")
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"{place}の日別集計データを {output_file} に保存しました（{len(df)}行）")
        
        # 2. 日付×時間帯の詳細データ
        if location_hourly_data[place]:
            # データを日付と時間でソート
            sorted_data = sorted(location_hourly_data[place], 
                                key=lambda x: (x['日付'], x['時間']))
            
            # DataFrameに変換
            df = pd.DataFrame(sorted_data)
            
            # CSVとして出力
            output_file = os.path.join(output_dir, f"{place}_hourly.csv")
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"{place}の時間帯別データを {output_file} に保存しました（{len(df)}行）")
        
        # 3. 曜日×時間帯の平均データ
        if location_weekly_data[place]:
            # データを曜日と時間でソート（曜日の並び順を月→日にする）
            weekday_order = {"月": 0, "火": 1, "水": 2, "木": 3, "金": 4, "土": 5, "日": 6}
            sorted_data = sorted(location_weekly_data[place], 
                               key=lambda x: (weekday_order.get(x['曜日'], 99), x['時間']))
            
            # DataFrameに変換
            df = pd.DataFrame(sorted_data)
            
            # CSVとして出力
            output_file = os.path.join(output_dir, f"{place}_weekly.csv")
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"{place}の曜日別平均データを {output_file} に保存しました（{len(df)}行）")


# メイン処理
if __name__ == "__main__":
    # 入力ディレクトリと出力ディレクトリを指定
    input_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai"
    output_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/output"
    
    # データの読み込み
    location_data = load_pedestrian_data(input_dir)
    
    if not location_data:
        print("分析対象のデータがありません")
        exit(1)
    
    print(f"{len(location_data)}箇所のデータを読み込みました")
    
    # 分析期間の設定
    # 各場所のデータの開始日と終了日を確認
    all_dates = []
    for place, df in location_data.items():
        date_col = next((col for col in ['datetime_jst', 'date_jst'] if col in df.columns), None)
        if date_col:
            min_date = df[date_col].min()
            max_date = df[date_col].max()
            all_dates.extend([min_date, max_date])
            print(f"{place}: {min_date.strftime('%Y-%m-%d')} から {max_date.strftime('%Y-%m-%d')}")
    
    # 分析する年月の範囲を自動で決定
    start_date = min(all_dates)
    end_date = max(all_dates)
    
    print(f"分析期間: {start_date.strftime('%Y-%m-%d')} から {end_date.strftime('%Y-%m-%d')}")
    
    # 月ごとに分析を実行し、結果を格納
    all_analysis_results = {}
    
    current_date = datetime(start_date.year, start_date.month, 1)
    end_date_month = datetime(end_date.year, end_date.month, 1)
    
    while current_date <= end_date_month:
        year = current_date.year
        month = current_date.month
        
        print(f"\n{year}年{month}月のデータを分析しています...")
        
        # 分析実行
        analysis_result = analyze_pedestrian_with_weather(location_data, year, month)
        
        # 月単位のCSVも出力する場合はこの行を有効化
        # output_analysis_to_csv(analysis_result, output_dir, year, month)
        
        # 全期間の分析結果に追加
        all_analysis_results[(year, month)] = analysis_result
        
        # 次の月へ
        if month == 12:
            current_date = datetime(year + 1, 1, 1)
        else:
            current_date = datetime(year, month + 1, 1)
    
    # すべての月の分析が完了したら、場所ごとにCSVを出力
    output_analysis_by_location(all_analysis_results, output_dir)
    
    print("\nすべての分析が完了しました")
