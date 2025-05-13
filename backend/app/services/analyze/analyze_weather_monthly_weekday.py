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

# 天気データをキャッシュする形式を変更
# キー: 'YYYY-MM-DD', 値: その日の天気データ
weather_cache = {}  

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
    cache_key = date.strftime("%Y-%m-%d")
    if cache_key in weather_cache:
        return weather_cache[cache_key]
        
    # 月データ全体を取得
    year, month = date.year, date.month
    monthly_data = fetch_monthly_weather(year, month)
    
    # 日のデータを抽出
    data = monthly_data.get(date.day, {"weather": "データなし", "high_temp": None, "low_temp": None})
    
    # 個別の日付をキャッシュ
    weather_cache[cache_key] = (data['weather'], data['high_temp'], data['low_temp'])
    return weather_cache[cache_key]


# 一括で日付範囲の天気データを取得
def prefetch_weather_for_dates(dates):
    # 日付を月ごとにグループ化
    months = {}
    for date in dates:
        key = (date.year, date.month)
        if key not in months:
            months[key] = []
        months[key].append(date.day)
    
    # 月ごとのデータを一度に取得
    for (year, month), days in months.items():
        monthly_data = fetch_monthly_weather(year, month)
        
        # 各日のデータをキャッシュに格納
        for day in days:
            if day in monthly_data:
                date_key = f"{year}-{month:02d}-{day:02d}"
                data = monthly_data[day]
                weather_cache[date_key] = (data['weather'], data['high_temp'], data['low_temp'])


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
    # 高山のイベント
    Event("春の高山祭", lambda d: d.month == 4 and d.day in [14, 15], CATEGORY_TAKAYAMA),
    Event("秋の高山祭", lambda d: d.month == 10 and d.day in [9, 10], CATEGORY_TAKAYAMA),
    Event("雫宮祭", lambda d: d.month == 3 and d.day == 20, CATEGORY_TAKAYAMA),
    Event("二十四日市", lambda d: d.month == 1 and d.day == 24, CATEGORY_TAKAYAMA),
    Event("お盆", lambda d: d.month == 8 and 13 <= d.day <= 16, CATEGORY_NATIONAL),
    Event("ゴールデンウィーク", lambda d: d.month == 5 and 3 <= d.day <= 5, CATEGORY_NATIONAL),
    
    # 国民的イベント（祝日）
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
    
    # 国民的イベント（季節の変わり目）
    Event("夏至", lambda d: (d.month == 6 and d.day in [20, 21, 22]), CATEGORY_NATIONAL),
    Event("冬至", lambda d: (d.month == 12 and d.day in [21, 22, 23]), CATEGORY_NATIONAL),
    Event("立春", lambda d: d.month == 2 and d.day in [3, 4, 5], CATEGORY_NATIONAL),
    
    # 追加の年中行事・記念日
    Event("松の内", lambda d: d.month == 1 and 1 <= d.day <= 7, CATEGORY_NATIONAL),
    Event("七草の節句", lambda d: d.month == 1 and d.day == 7, CATEGORY_NATIONAL),
    Event("鏡開き", lambda d: d.month == 1 and d.day in [11, 15, 20], CATEGORY_NATIONAL),
    Event("節分", lambda d: d.month == 2 and d.day in [2, 3, 4], CATEGORY_NATIONAL),
    Event("バレンタインデー", lambda d: d.month == 2 and d.day == 14, CATEGORY_NATIONAL),
    Event("ひな祭り", lambda d: d.month == 3 and d.day == 3, CATEGORY_NATIONAL),
    Event("ホワイトデー", lambda d: d.month == 3 and d.day == 14, CATEGORY_NATIONAL),
    
    # 世界的な観光関連イベント
    Event("春節/旧正月", lambda d: (d.month == 1 and d.day >= 20) or (d.month == 2 and d.day <= 20), CATEGORY_OTHER),
    Event("イースター", lambda d: (d.month == 3 and d.day >= 22) or (d.month == 4 and d.day <= 25), CATEGORY_OTHER),
    Event("ハロウィン", lambda d: d.month == 10 and d.day == 31, CATEGORY_OTHER),
    Event("感謝祭（米国）", lambda d: d.month == 11 and 22 <= d.day <= 28 and d.weekday() == 3, CATEGORY_OTHER),
    Event("ブラックフライデー", lambda d: d.month == 11 and 23 <= d.day <= 29 and d.weekday() == 4, CATEGORY_OTHER),
    Event("クリスマスシーズン", lambda d: d.month == 12 and 1 <= d.day <= 23, CATEGORY_OTHER),
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

# CSVファイルから特定の日付と時間の人数データを抽出する関数
def extract_visitors_from_csv(csv_file, date, hour):
    """指定された日付と時間の人数データをCSVから抽出"""
    try:
        # CSVの形式によって読み込み方を変更
        try:
            # 通常のCSV形式を試す
            df = pd.read_csv(csv_file, encoding='utf-8-sig')
            
            # 日時列の名前を確認
            datetime_col = None
            count_col = None
            
            # 列名を特定
            if '日時' in df.columns:
                datetime_col = '日時'
                if '人数' in df.columns:
                    count_col = '人数'
            elif 'datetime_jst' in df.columns:
                datetime_col = 'datetime_jst'
                if 'count_1_hour' in df.columns:
                    count_col = 'count_1_hour'
            
            if datetime_col and count_col:
                # 日時列をdatetime型に変換
                df[datetime_col] = pd.to_datetime(df[datetime_col], errors='coerce')
                
                # 日付と時間でフィルタリング（同じ日付の同じ時間帯のデータを抽出）
                date_filter = df[datetime_col].dt.date == date.date()
                hour_filter = df[datetime_col].dt.hour == hour
                
                matching_rows = df[date_filter & hour_filter]
                
                if not matching_rows.empty:
                    return matching_rows[count_col].values.tolist()
            
            return []
            
        except Exception as e:
            print(f"標準フォーマットでの読み込みに失敗: {e}")
            
            # ヘッダーなしCSVとして再試行
            df = pd.read_csv(csv_file, header=None)
            
            # 最初の列を日時、2列目を人数と仮定
            df.columns = [f'col{i}' for i in range(len(df.columns))]
            
            # 日時列をdatetime型に変換
            df['col0'] = pd.to_datetime(df['col0'], errors='coerce')
            
            # 日付と時間でフィルタリング
            date_filter = df['col0'].dt.date == date.date()
            hour_filter = df['col0'].dt.hour == hour
            
            matching_rows = df[date_filter & hour_filter]
            
            if not matching_rows.empty and len(df.columns) > 1:
                return matching_rows['col1'].values.tolist()
            
            return []
            
    except Exception as e:
        print(f"CSVファイルの読み込みエラー: {csv_file}, {e}")
        return []

# CSVファイル内の日時データのフォーマットを自動判定する関数
def detect_date_format(csv_file):
    """CSVファイル内の日時データのフォーマットを自動判定"""
    try:
        # ファイルの最初の数行を読み込む
        sample_data = pd.read_csv(csv_file, nrows=5)
        
        # カラム名を確認
        if 'datetime_jst' in sample_data.columns:
            return 'datetime_jst', 'count_1_hour'
        elif '日時' in sample_data.columns:
            return '日時', '人数'
        else:
            # ヘッダーがない場合、最初の列を日付、2列目を人数と仮定
            return 0, 1  # カラムインデックスを返す
            
    except Exception as e:
        print(f"日付フォーマット検出エラー: {csv_file}, {e}")
        return None, None

# 年月の範囲を自動的に特定する関数
def detect_date_range(csv_files):
    """CSVファイルから日付データの範囲を検出"""
    min_date = None
    max_date = None
    
    for csv_file in csv_files:
        try:
            # 日付フォーマットを検出
            date_col, _ = detect_date_format(csv_file)
            
            if date_col is not None:
                if isinstance(date_col, int):  # ヘッダーなしCSVの場合
                    df = pd.read_csv(csv_file, header=None)
                    date_series = pd.to_datetime(df.iloc[:, date_col], errors='coerce')
                else:
                    df = pd.read_csv(csv_file)
                    date_series = pd.to_datetime(df[date_col], errors='coerce')
                
                # 無効な日付を除外
                date_series = date_series.dropna()
                
                if not date_series.empty:
                    file_min_date = date_series.min()
                    file_max_date = date_series.max()
                    
                    if min_date is None or file_min_date < min_date:
                        min_date = file_min_date
                    
                    if max_date is None or file_max_date > max_date:
                        max_date = file_max_date
            
        except Exception as e:
            print(f"日付範囲検出エラー: {csv_file}, {e}")
    
    return min_date, max_date

# 年月のリストを生成する関数
def generate_year_month_list(min_date, max_date):
    """最小日付から最大日付までの年月リストを生成"""
    if min_date is None or max_date is None:
        return []
    
    # 開始年月
    start_year = min_date.year
    start_month = min_date.month
    
    # 終了年月
    end_year = max_date.year
    end_month = max_date.month
    
    # 年月のリスト
    year_month_list = []
    
    # 逆順で生成（新しい年月から古い年月へ）
    current_year = end_year
    current_month = end_month
    
    while (current_year > start_year) or (current_year == start_year and current_month >= start_month):
        year_month_list.append((current_year, current_month))
        
        # 前月に移動
        current_month -= 1
        if current_month == 0:
            current_month = 12
            current_year -= 1
    
    return year_month_list

# 複数のCSVファイルから曜日と時間ごとのデータを集計する関数
def aggregate_data_by_weekday_and_hour(input_dir, output_dir):
    """複数のCSVから年月曜日+時間ごとにデータを集計し、場所ごとに出力ファイルを生成"""
    
    # CSVファイルを検索
    csv_files = glob.glob(os.path.join(input_dir, "*.csv"))
    if not csv_files:
        print(f"入力ディレクトリ {input_dir} にCSVファイルが見つかりませんでした。")
        return
    
    print(f"{len(csv_files)}個のCSVファイルからデータを集計します...")
    
    # 地点名を抽出（ファイル名から拡張子を除去）
    locations = [os.path.splitext(os.path.basename(file))[0] for file in csv_files]
    
    # 日付範囲を自動検出
    print("日付範囲を検出中...")
    min_date, max_date = detect_date_range(csv_files)
    
    if min_date is None or max_date is None:
        print("有効な日付データが見つかりませんでした。")
        return
    
    print(f"検出された日付範囲: {min_date.date()} から {max_date.date()}")
    
    # 年月リストを生成
    years_months = generate_year_month_list(min_date, max_date)
    
    if not years_months:
        print("処理する年月がありません。")
        return
    
    print(f"処理する年月: {years_months}")
    
    # 処理の前に、対象期間の月ごとのデータを先にすべて取得
    print("対象期間の天気データを先に取得します...")
    for year, month in years_months:
        fetch_monthly_weather(year, month)
    
    print("月間データの事前取得が完了しました")
    
    # 各場所ごとに結果を保存する辞書
    location_results = {location: [] for location in locations}
    
    # 与えられた年月を新しい順に処理
    for year, month in years_months:
        print(f"{year}年{month}月のデータを処理中...")
        
        # その月の全日付を取得
        dates = get_month_dates(year, month)
        
        # 曜日ごとにグループ化
        weekday_dates = group_dates_by_weekday(dates)
        
        # 月曜から日曜まで順に処理
        for weekday in range(7):  # 0:月曜〜6:日曜
            weekday_name = get_weekday_name(weekday)
            dates_for_weekday = weekday_dates[weekday]
            
            if not dates_for_weekday:
                continue
            
            # 時間ごとに処理
            for hour in range(24):
                # 「2024年4月日曜日7:00」のような行識別子を作成
                hourly_identifier = f"{year}年{month}月{weekday_name}曜日{hour:02d}:00"
                
                # 基本情報の集計
                weathers = []
                high_temps = []
                low_temps = []
                events_takayama = set()
                events_national = set()
                events_other = set()
                
                # 日付情報のリストを保存
                date_strs = []
                
                # 各日付について処理
                for date in dates_for_weekday:
                    # 日付文字列を保存
                    date_strs.append(date.strftime("%d日"))
                    
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
                
                # 日の出・日の入り情報を集計（その月の代表的な値を使用）
                middle_date = dates_for_weekday[len(dates_for_weekday)//2]  # 中央値の日付を使用
                sunrise, sunset, daylight = get_sun_info(middle_date)
                
                # 各地点の人数データを集計して平均を計算
                for location_idx, (location, csv_file) in enumerate(zip(locations, csv_files)):
                    all_visitors = []
                    for date in dates_for_weekday:
                        visitors_list = extract_visitors_from_csv(csv_file, date, hour)
                        all_visitors.extend(visitors_list)
                    
                    # 平均人数を計算
                    avg_visitors = sum(all_visitors) / len(all_visitors) if all_visitors else 0
                    
                    # 行データを作成
                    row_data = {
                        '年月曜日時間': hourly_identifier,
                        '日数': len(dates_for_weekday),
                        '日付': ", ".join(date_strs),
                        '天気': '、'.join(set(weathers)) if weathers else "データなし",
                        '平均最高気温': f"{sum(high_temps)/len(high_temps):.1f}℃" if high_temps else "データなし",
                        '平均最低気温': f"{sum(low_temps)/len(low_temps):.1f}℃" if low_temps else "データなし",
                        '最高気温': f"{max(high_temps):.1f}℃" if high_temps else "データなし",
                        '最低気温': f"{min(low_temps):.1f}℃" if low_temps else "データなし",
                        '日の出': sunrise if sunrise else "データなし",
                        '日の入り': sunset if sunset else "データなし",
                        '日照時間': daylight if daylight else "データなし",
                        '高山イベント': "、".join(events_takayama) if events_takayama else "",
                        '国民的イベント': "、".join(events_national) if events_national else "",
                        'その他': "、".join(events_other) if events_other else "",
                        '人数': f"{avg_visitors:.2f}"
                    }
                    
                    # 結果リストに追加
                    location_results[location].append(row_data)
    
    # 各地点ごとにCSVファイルを作成
    for location, results in location_results.items():
        if results:
            # 結果を日付時刻でソート
            df = pd.DataFrame(results)
            
            # 列の順序を整理
            columns = ['年月曜日時間', '日数', '日付', '天気', '平均最高気温', '平均最低気温', 
                     '最高気温', '最低気温', '日の出', '日の入り', '日照時間', 
                     '高山イベント', '国民的イベント', 'その他', '人数']
            
            # 実際に存在する列だけを選択（エラー回避）
            existing_columns = [col for col in columns if col in df.columns]
            
            df = df[existing_columns]
            
            # 出力ファイルパスを作成
            output_file = os.path.join(output_dir, f"weekday_hourly_{location}.csv")
            
            # 出力ディレクトリが存在しない場合は作成
            os.makedirs(output_dir, exist_ok=True)
            
            # CSVファイルに保存
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"処理完了: {len(results)}行のデータを {output_file} に保存しました")

# メイン処理
if __name__ == "__main__":
    # データディレクトリとCSVファイルのパス
    base_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data"
    input_dir = os.path.join(base_dir, "meidai")  # 指定されたディレクトリ
    output_dir = os.path.join(base_dir, "monthly_weekday_hourly")
    
    # 出力ディレクトリが存在しない場合は作成
    os.makedirs(output_dir, exist_ok=True)
    
    # 曜日と時間ごとの要約データをCSVに出力（場所ごとに別ファイル）
    aggregate_data_by_weekday_and_hour(input_dir, output_dir)
    
    print("すべての処理が完了しました！")
