import pandas as pd
import requests
import os
import glob
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import calendar
from bs4 import BeautifulSoup
import time

# 天文計算用のパッケージを追加
from astral import LocationInfo
from astral.sun import sun

# 天気データをキャッシュするディクショナリ（月単位）
weather_cache = {}  # キー: 'YYYY-MM', 値: その月の天気データ

# 高山市の位置情報を設定
city = LocationInfo("Takayama", "Japan", "Asia/Tokyo", 36.1429, 137.2526)


# 日の出・日の入り時刻と日照時間を取得する関数
def get_sun_info(date):
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


# 月間の天気データを取得する関数
def fetch_monthly_weather(year, month):
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


# 天気情報を取得する関数（キャッシュシステム対応）
def fetch_weather_info(date):
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


# 日付から日本語の曜日を取得する関数を追加
def get_japanese_weekday(date):
    weekday_kanji = ["月", "火", "水", "木", "金", "土", "日"]
    return weekday_kanji[date.weekday()]


# カテゴリの定数
CATEGORY_TAKAYAMA = "高山イベント"
CATEGORY_NATIONAL = "国民的イベント"
CATEGORY_OTHER = "その他"

class Event:
    """イベント情報を表すクラス"""
    def __init__(self, name, is_match_func, category):
        self.name = name
        self.is_match_func = is_match_func
        self.category = category

# 高山市のイベント情報の定義
TAKAYAMA_EVENTS = [
    # 高山のイベント（既存ファイルから流用）
    Event("春の高山祭", lambda d: d.month == 4 and d.day in [14, 15], CATEGORY_TAKAYAMA),
    Event("秋の高山祭", lambda d: d.month == 10 and d.day in [9, 10], CATEGORY_TAKAYAMA),
    Event("雫宮祭", lambda d: d.month == 3 and d.day == 20, CATEGORY_TAKAYAMA),
    Event("二十四日市", lambda d: d.month == 1 and d.day == 24, CATEGORY_TAKAYAMA),
    Event("お盆", lambda d: d.month == 8 and 13 <= d.day <= 16, CATEGORY_NATIONAL),
    Event("ゴールデンウィーク", lambda d: d.month == 5 and 3 <= d.day <= 5, CATEGORY_NATIONAL),
    
    # 国民的イベント（祝日）- 他のイベントも同様に追加
    Event("元日", lambda d: d.month == 1 and d.day >= 1 and d.day <= 3, CATEGORY_NATIONAL),
    Event("成人の日", lambda d: d.month == 1 and d.day >= 8 and d.day <= 14 and d.weekday() == 0, CATEGORY_NATIONAL),
    # 他のイベントも同様に定義していく...
]

def get_events_by_category(date, category):
    """指定カテゴリのイベントのみを取得"""
    matching_events = [event.name for event in TAKAYAMA_EVENTS 
                       if event.is_match_func(date) and event.category == category]
    return "、".join(matching_events) if matching_events else ""

# 指定された年月の全ての日付を生成する関数
def get_month_dates(year, month):
    """指定された年月の全日程のリストを返す"""
    _, days_in_month = calendar.monthrange(year, month)
    return [datetime(year, month, day) for day in range(1, days_in_month + 1)]

# 曜日ごとに日付をグループ化する関数
def group_dates_by_weekday(dates):
    """日付を曜日ごとにグループ化"""
    weekdays = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: []}  # 0:月曜〜6:日曜
    for date in dates:
        weekday = date.weekday()
        weekdays[weekday].append(date)
    return weekdays

# 曜日番号から曜日名を取得
def get_weekday_name(weekday):
    return ["月", "火", "水", "木", "金", "土", "日"][weekday]

# CSVファイルから特定の日付の人数データを抽出する関数
def extract_visitors_from_csv(csv_file, date):
    """指定された日付の人数データをCSVから抽出"""
    try:
        df = pd.read_csv(csv_file, encoding='utf-8-sig')
        
        # 日付列をdatetime型に変換
        if '日付' in df.columns:
            df['日付'] = pd.to_datetime(df['日付'], errors='coerce')
            date_filter = df['日付'].dt.date == date.date()
            matching_rows = df[date_filter]
            if not matching_rows.empty and '人数' in df.columns:
                return matching_rows['人数'].sum()
        
        return None
    except Exception as e:
        print(f"CSVファイルの読み込みエラー: {csv_file}, {e}")
        return None

# 複数のCSVファイルから曜日ごとのデータを集計する関数
def aggregate_data_by_weekday(input_dir, years_months, output_file):
    """複数のCSVから年月曜日ごとにデータを集計し、一つのCSVにまとめる"""
    
    # CSVファイルを検索
    csv_files = glob.glob(os.path.join(input_dir, "*.csv"))
    if not csv_files:
        print(f"入力ディレクトリ {input_dir} にCSVファイルが見つかりませんでした。")
        return
    
    print(f"{len(csv_files)}個のCSVファイルからデータを集計します...")
    
    # 集計結果を格納するリスト
    results = []
    
    # 地点名を抽出（ファイル名から）
    locations = [os.path.splitext(os.path.basename(file))[0] for file in csv_files]
    
    # 与えられた年月を新しい順に処理
    for year, month in sorted(years_months, reverse=True):
        print(f"{year}年{month}月のデータを処理中...")
        
        # その月の全日付を取得
        dates = get_month_dates(year, month)
        
        # 曜日ごとにグループ化
        weekday_dates = group_dates_by_weekday(dates)
        
        # 月曜から日曜まで順に処理
        for weekday in range(7):  # 0:月曜〜6:日曜
            weekday_name = get_weekday_name(weekday)
            dates_for_weekday = weekday_dates[weekday]
            
            # 曜日ごとの統計データ
            total_dates = len(dates_for_weekday)
            if total_dates == 0:
                continue
            
            # 基本情報の集計
            weathers = []
            high_temps = []
            low_temps = []
            events_takayama = set()
            events_national = set()
            events_other = set()
            
            # 各日付について処理
            for date in dates_for_weekday:
                # 天気情報取得
                weather, high_temp, low_temp = fetch_weather_info(date)
                if weather:
                    weathers.append(weather)
                
                if high_temp and high_temp.replace('℃', '').strip().replace('-', '').isdigit():
                    high_temps.append(float(high_temp.replace('℃', '')))
                
                if low_temp and low_temp.replace('℃', '').strip().replace('-', '').isdigit():
                    low_temps.append(float(low_temp.replace('℃', '')))
                
                # イベント情報取得
                takayama = get_events_by_category(date, CATEGORY_TAKAYAMA)
                if takayama:
                    events_takayama.update(takayama.split("、"))
                
                national = get_events_by_category(date, CATEGORY_NATIONAL)
                if national:
                    events_national.update(national.split("、"))
                
                other = get_events_by_category(date, CATEGORY_OTHER)
                if other:
                    events_other.update(other.split("、"))
            
            # 「2025年4月月曜日」のような行識別子を作成
            weekday_identifier = f"{year}年{month}月{weekday_name}曜日"
            
            # 各地点の人数データを集計
            location_visitors = {}
            for location, csv_file in zip(locations, csv_files):
                total_visitors = 0
                for date in dates_for_weekday:
                    visitors = extract_visitors_from_csv(csv_file, date)
                    if visitors:
                        total_visitors += visitors
                location_visitors[f"{location}_人数"] = total_visitors
            
            # ヘッダー行を作成
            row_data = {
                '年月曜日': weekday_identifier,
                '日数': total_dates,
                '日付': ", ".join([d.strftime("%d日") for d in dates_for_weekday]),
                '天気': '、'.join(set(weathers)) if weathers else "データなし",
                '平均最高気温': f"{sum(high_temps)/len(high_temps):.1f}℃" if high_temps else "データなし",
                '平均最低気温': f"{sum(low_temps)/len(low_temps):.1f}℃" if low_temps else "データなし",
                '最高気温': f"{max(high_temps):.1f}℃" if high_temps else "データなし",
                '最低気温': f"{min(low_temps):.1f}℃" if low_temps else "データなし",
                '高山イベント': "、".join(events_takayama) if events_takayama else "",
                '国民的イベント': "、".join(events_national) if events_national else "",
                'その他': "、".join(events_other) if events_other else ""
            }
            
            # 各地点のデータを追加
            row_data.update(location_visitors)
            
            # 結果リストに追加
            results.append(row_data)
    
    # DataFrameを作成してCSVに保存
    df = pd.DataFrame(results)
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"処理完了: {len(results)}行のデータを {output_file} に保存しました")

# メイン処理
if __name__ == "__main__":
    # 処理する年月のリスト（最新から過去へ）
    years_months = [
        (2025, 4),  # 2025年4月
        (2025, 3),  # 2025年3月
        (2025, 2),  # 2025年2月
        # 必要に応じて他の月も追加
    ]
    
    # データディレクトリとCSVファイルのパス
    base_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data"
    input_dir = os.path.join(base_dir, "locations")  # 各地点のデータが入ったディレクトリ
    output_dir = os.path.join(base_dir, "weekday_summary")
    output_file = os.path.join(output_dir, "weekday_location_summary.csv")
    
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 処理の前に、対象期間の月ごとのデータを先にすべて取得
    print("対象期間の天気データを先に取得します...")
    for year, month in years_months:
        fetch_monthly_weather(year, month)
    
    print("月間データの事前取得が完了しました")
    
    # 曜日ごとの要約データをCSVに出力
    aggregate_data_by_weekday(input_dir, years_months, output_file)
    
    print("すべての処理が完了しました！")
