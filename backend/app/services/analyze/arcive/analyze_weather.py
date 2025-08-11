import pandas as pd
import requests
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from bs4 import BeautifulSoup
import time

# 天文計算用のパッケージを追加
from astral import LocationInfo
from astral.sun import sun

# .envファイルから環境変数をロード

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


class Event:
    """イベント情報を表すクラス"""
    def __init__(self, name, is_match_func, category):
        self.name = name                # イベント名
        self.is_match_func = is_match_func  # このイベントが日付に該当するかを判定する関数
        self.category = category        # イベントのカテゴリ

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
    # 1月
    Event("松の内", lambda d: d.month == 1 and 1 <= d.day <= 7, CATEGORY_NATIONAL),
    Event("七草の節句", lambda d: d.month == 1 and d.day == 7, CATEGORY_NATIONAL),
    Event("鏡開き", lambda d: d.month == 1 and d.day in [11, 15, 20], CATEGORY_NATIONAL),
    
    # 世界的な観光関連イベント
    # 春節/旧正月（1月下旬～2月中旬）- 毎年変動
    Event("春節/旧正月", lambda d: (d.month == 1 and d.day >= 20) or (d.month == 2 and d.day <= 20), CATEGORY_OTHER),
    
    
    
    # イースター（復活祭）- 毎年変動
    Event("イースター", lambda d: (d.month == 3 and d.day >= 22) or (d.month == 4 and d.day <= 25), CATEGORY_OTHER),
    
    
    # ハロウィン（10月31日）- 毎年固定
    Event("ハロウィン", lambda d: d.month == 10 and d.day == 31, CATEGORY_OTHER),
    
    
    # 感謝祭（米国）- 11月第4木曜日
    Event("感謝祭（米国）", lambda d: d.month == 11 and 22 <= d.day <= 28 and d.weekday() == 3, CATEGORY_OTHER),
    
    # ブラックフライデー（米国）- 感謝祭の翌日
    Event("ブラックフライデー", lambda d: d.month == 11 and 23 <= d.day <= 29 and d.weekday() == 4, CATEGORY_OTHER),
    
    # イルミネーションシーズン
    Event("クリスマスシーズン", lambda d: d.month == 12 and 1 <= d.day <= 23, CATEGORY_OTHER),
    
    # カウントダウン
    Event("大晦日", lambda d: d.month == 12 and d.day == 31, CATEGORY_OTHER),
    
    # 2月
    Event("節分", lambda d: d.month == 2 and d.day in [2, 3, 4], CATEGORY_NATIONAL),
    Event("バレンタインデー", lambda d: d.month == 2 and d.day == 14, CATEGORY_NATIONAL),
    
    # 3月
    Event("ひな祭り", lambda d: d.month == 3 and d.day == 3, CATEGORY_NATIONAL),
    Event("ホワイトデー", lambda d: d.month == 3 and d.day == 14, CATEGORY_NATIONAL),
    Event("彼岸入り", lambda d: d.month == 3 and d.day in [17, 18, 19], CATEGORY_NATIONAL),
    Event("彼岸明け", lambda d: d.month == 3 and d.day in [23, 24, 25], CATEGORY_NATIONAL),
    
    # 4月
    Event("入学式シーズン", lambda d: d.month == 4 and 1 <= d.day <= 10, CATEGORY_NATIONAL),
    
    # 5月
    Event("端午の節句", lambda d: d.month == 5 and d.day == 5, CATEGORY_NATIONAL),
    Event("母の日", lambda d: d.month == 5 and d.day >= 8 and d.day <= 14 and d.weekday() == 6, CATEGORY_NATIONAL),
    
    # 6月
    Event("父の日", lambda d: d.month == 6 and d.day >= 15 and d.day <= 21 and d.weekday() == 6, CATEGORY_NATIONAL),
    Event("梅雨入り（東海）", lambda d: d.month == 6 and 5 <= d.day <= 10, CATEGORY_NATIONAL),
    
    # 7月
    Event("七夕", lambda d: d.month == 7 and d.day == 7, CATEGORY_NATIONAL),
    Event("梅雨明け（東海）", lambda d: d.month == 7 and 15 <= d.day <= 25, CATEGORY_NATIONAL),
    Event("土用の丑", lambda d: d.month == 7 and 20 <= d.day <= 30, CATEGORY_NATIONAL),  # 近似値
    
    # 8月
    Event("立秋", lambda d: d.month == 8 and d.day in [7, 8, 9], CATEGORY_NATIONAL),
    
    # 9月
    Event("重陽の節句", lambda d: d.month == 9 and d.day == 9, CATEGORY_NATIONAL),
    Event("十五夜", lambda d: d.month == 9 and 8 <= d.day <= 15, CATEGORY_NATIONAL),  # 近似値
    Event("シルバーウィーク", lambda d: d.month == 9 and 19 <= d.day <= 23, CATEGORY_NATIONAL),
    Event("彼岸入り", lambda d: d.month == 9 and d.day in [19, 20, 21], CATEGORY_NATIONAL),
    Event("彼岸明け", lambda d: d.month == 9 and d.day in [25, 26, 27], CATEGORY_NATIONAL),
    
    # 10月
    Event("ハロウィン", lambda d: d.month == 10 and d.day == 31, CATEGORY_NATIONAL),
    
    # 11月
    Event("立冬", lambda d: d.month == 11 and d.day in [7, 8, 9], CATEGORY_NATIONAL),
    Event("七五三", lambda d: d.month == 11 and d.day == 15, CATEGORY_NATIONAL),
    Event("勤労感謝の日", lambda d: d.month == 11 and d.day == 23, CATEGORY_NATIONAL),
    
    # 12月
    Event("クリスマスイブ", lambda d: d.month == 12 and d.day == 24, CATEGORY_NATIONAL),
    Event("クリスマス", lambda d: d.month == 12 and d.day == 25, CATEGORY_NATIONAL),
    Event("大晦日", lambda d: d.month == 12 and d.day == 31, CATEGORY_NATIONAL),
    
    
    # ビジネス関連
    Event("年度末", lambda d: d.month == 3 and 25 <= d.day <= 31, CATEGORY_OTHER),
    Event("年度始め", lambda d: d.month == 4 and 1 <= d.day <= 5, CATEGORY_OTHER),
    Event("夏のボーナス時期", lambda d: d.month == 6 and 15 <= d.day <= 30, CATEGORY_OTHER),
    Event("冬のボーナス時期", lambda d: d.month == 12 and 5 <= d.day <= 20, CATEGORY_OTHER),
    
    # 気象災害情報
    Event("停滞前線による記録的な大雨", lambda d: d.year == 2021 and d.month == 8 and 11 <= d.day <= 19, CATEGORY_OTHER),
    Event("台風・梅雨前線による強い降雨", lambda d: d.year == 2022 and d.month == 7 and 14 <= d.day <= 16, CATEGORY_OTHER),
    Event("台風14号（ナンマドル）による強風と大雨", lambda d: d.year == 2022 and d.month == 9 and d.day == 14, CATEGORY_OTHER),
    Event("台風13号から変わった熱帯低気圧による記録的大雨", lambda d: d.year == 2023 and d.month == 9 and 1 <= d.day <= 10, CATEGORY_OTHER),
    Event("台風21号から変わった温帯低気圧による記録的大雨", lambda d: d.year == 2024 and d.month == 11 and 1 <= d.day <= 2, CATEGORY_OTHER),
    Event("雪と雨が交互に降る異常気象", lambda d: d.year == 2025 and d.month == 3 and 16 <= d.day <= 17, CATEGORY_OTHER),
    Event("局地的な強い雨", lambda d: d.year == 2025 and d.month == 3 and d.day == 27, CATEGORY_OTHER),
]

def get_events_by_category(date, category):
    """指定カテゴリのイベントのみを取得"""
    matching_events = [event.name for event in TAKAYAMA_EVENTS 
                       if event.is_match_func(date) and event.category == category]
    return "、".join(matching_events) if matching_events else ""

# CSVファイルを読み込み、処理する関数
def process_csv(input_file, output_file):
    # CSV読み込み - ヘッダーがないCSVファイルのため、header=Noneを指定し、カラム名を設定
    df = pd.read_csv(input_file, header=None, names=['日付', '人数'])

    # 新しい列を追加（曜日列を日付と人数の間に挿入）
    df['曜日'] = ""
    df['天気'] = ""
    df['最高気温'] = ""
    df['最低気温'] = ""
    df['日の出'] = ""
    df['日の入り'] = ""
    df['日照時間'] = ""
    df['高山イベント'] = ""
    df['国民的イベント'] = ""
    df['その他'] = ""
    
    # 列の順序を指定して並べ替える
    df = df[['日付', '曜日', '人数', '天気', '最高気温', '最低気温', 
             '日の出', '日の入り', '日照時間', 
             '高山イベント', '国民的イベント', 'その他']]
    
    # 各行を処理
    processed_rows = 0
    
    for index, row in df.iterrows():
        date_str = row['日付']
        date = pd.to_datetime(date_str, format='%Y/%m/%d')
        
        # 曜日情報を追加
        weekday = get_japanese_weekday(date)
        df.at[index, '曜日'] = weekday
        
        # 天気情報取得
        weather, max_temp, min_temp = fetch_weather_info(date)
        
        # 日の出・日の入り・日照時間情報を取得
        sunrise, sunset, daylight = get_sun_info(date)
        
        # イベント情報を各カテゴリ別に取得
        takayama_events = get_events_by_category(date, CATEGORY_TAKAYAMA)
        national_events = get_events_by_category(date, CATEGORY_NATIONAL)
        other_events = get_events_by_category(date, CATEGORY_OTHER)
        
        # データフレームに書き込み
        df.at[index, '天気'] = weather
        df.at[index, '最高気温'] = max_temp
        df.at[index, '最低気温'] = min_temp
        df.at[index, '日の出'] = sunrise
        df.at[index, '日の入り'] = sunset
        df.at[index, '日照時間'] = daylight
        df.at[index, '高山イベント'] = takayama_events
        df.at[index, '国民的イベント'] = national_events
        df.at[index, 'その他'] = other_events
        
        # 気温情報からの特殊な条件判定（猛暑日、極寒日）
        if max_temp and float(max_temp.replace('℃', '')) >= 35:
            if df.at[index, 'その他']:
                df.at[index, 'その他'] += "、猛暑日"
            else:
                df.at[index, 'その他'] = "猛暑日"
                
        if min_temp and float(min_temp.replace('℃', '')) <= -10:
            if df.at[index, 'その他']:
                df.at[index, 'その他'] += "、極寒日"
            else:
                df.at[index, 'その他'] = "極寒日"
        
        print(f"日付: {date_str}({weekday}), 天気: {weather}, 気温: {min_temp}～{max_temp}")
        print(f"日の出: {sunrise}, 日の入り: {sunset}, 日照時間: {daylight}")
        print(f"高山イベント: {takayama_events}, 国民的イベント: {national_events}, その他: {other_events}")
        
        # 処理済み行数をカウントアップ
        processed_rows += 1
    
    # 結果を新しいCSVに保存 - Excel用にエンコーディングを指定
    df.to_csv(output_file, index=False, encoding='utf-8-sig')  # BOM付きUTF-8で保存
    print(f"処理完了: {processed_rows}行処理されました")

# メイン処理
if __name__ == "__main__":
    # 入力ディレクトリと出力ディレクトリを指定
    input_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather/input"
    output_dir = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather/output"
    
    # 処理の前に、対象期間の月ごとのデータを先にすべて取得
    start_date = datetime(2021, 6, 1)  # 2021年6月から
    end_date = datetime.now()
    
    print("対象期間の天気データを先に取得します...")
    current_date = start_date
    while current_date <= end_date:
        # 月ごとに天気データを取得
        fetch_monthly_weather(current_date.year, current_date.month)
        # 次の月に進む
        current_date += relativedelta(months=1)
    
    print("月間データの事前取得が完了しました")
    
    # 入力ディレクトリ内のすべてのCSVファイルをリストアップ
    import glob
    
    csv_files = glob.glob(os.path.join(input_dir, "*.csv"))
    
    if not csv_files:
        print(f"入力ディレクトリ {input_dir} にCSVファイルが見つかりませんでした。")
    else:
        print(f"{len(csv_files)}個のCSVファイルを処理します...")
        
        # 各CSVファイルを処理
        for input_csv in csv_files:
            # 入力ファイル名から出力ファイル名を生成
            filename = os.path.basename(input_csv)
            output_csv = os.path.join(output_dir, f"result_{filename}")
            
            print(f"\n処理中: {filename}")
            print(f"入力ファイル: {input_csv}")
            print(f"出力ファイル: {output_csv}")
            
            # 出力ディレクトリが存在しない場合は作成
            os.makedirs(output_dir, exist_ok=True)
            
            # CSVファイルを処理
            try:
                process_csv(input_csv, output_csv)
                print(f"ファイル {filename} の処理が完了しました")
            except Exception as e:
                print(f"エラー: ファイル {filename} の処理中に例外が発生しました: {str(e)}")
        
        print("\nすべてのファイルの処理が完了しました")
