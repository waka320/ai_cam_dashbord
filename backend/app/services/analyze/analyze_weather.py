import pandas as pd
import requests
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import time

# .envファイルから環境変数をロード
load_dotenv()

# 天気データをキャッシュするディクショナリ（月単位）
weather_cache = {}  # キー: 'YYYY-MM', 値: その月の天気データ

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
        time.sleep(1)
        
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

def fetch_event_info(date):
    """指定された日付に応じて岐阜県高山市のイベント情報を返す関数"""
    # 特記事項なしをデフォルトとする
    events = []
    
    # 朝市（毎日開催）
    # events.append("陣屋前朝市")
    
    # 春の高山祭（4月14日・15日）
    if date.month == 4 and date.day in [14, 15]:
        events.append("春の高山祭")
    
    # 秋の高山祭（10月9日・10日）
    if date.month == 10 and date.day in [9, 10]:
        events.append("秋の高山祭")
    
    # 雫宮祭（3月20日）
    if date.month == 3 and date.day == 20:
        events.append("雫宮祭")
    
    # 二十四日市（1月24日）
    if date.month == 1 and date.day == 24:
        events.append("二十四日市")
    
    # お盆（8月13日～16日）
    if date.month == 8 and 13 <= date.day <= 16:
        events.append("お盆")
    
    # ゴールデンウィーク（5月3日～5月5日）
    if date.month == 5 and 3 <= date.day <= 5:
        events.append("ゴールデンウィーク")
    
    # === 特記気象災害情報 ===
    
    # 2021年: 停滞前線による記録的な大雨（8月11日～19日）
    if date.year == 2021 and date.month == 8 and 11 <= date.day <= 19:
        events.append("停滞前線による記録的な大雨")
    
    # 2022年: 台風・梅雨前線の影響（7月14日～16日）
    if date.year == 2022 and date.month == 7 and 14 <= date.day <= 16:
        events.append("台風・梅雨前線による強い降雨")
    
    # 2022年: 台風14号（9月14日～20日）
    if date.year == 2022 and date.month == 9 and 14 <= date.day <= 20:
        events.append("台風14号（ナンマドル）による強風と大雨")
    
    # 2023年: 台風13号から変わった熱帯低気圧（9月1日～10日）
    if date.year == 2023 and date.month == 9 and 1 <= date.day <= 10:
        events.append("台風13号から変わった熱帯低気圧による記録的大雨")
    
    # 2024年: 台風21号が温帯低気圧に変化（11月1日～2日）
    if date.year == 2024 and date.month == 11 and 1 <= date.day <= 2:
        events.append("台風21号から変わった温帯低気圧による記録的大雨")
    
    # 2025年: 雪と雨が交互に降る異常気象（3月16日～17日）
    if date.year == 2025 and date.month == 3 and 16 <= date.day <= 17:
        events.append("雪と雨が交互に降る異常気象")
    
    # 2025年: 局地的な強い雨（3月27日）
    if date.year == 2025 and date.month == 3 and date.day == 27:
        events.append("局地的な強い雨")
    
    return "、".join(events) if events else ""

# CSVファイルを読み込み、処理する関数
def process_csv(input_file, output_file):
    # CSV読み込み - ヘッダーがないCSVファイルのため、header=Noneを指定し、カラム名を設定
    df = pd.read_csv(input_file, header=None, names=['日付', '人数'])

    # 新しい列を追加
    df['天気'] = ""
    df['最高気温'] = ""
    df['最低気温'] = ""
    df['備考'] = ""
    
    # デバッグ用にループを制限
    max_rows = 50  # デバッグが終わったら制限を解除または大きな数に設定
    processed_rows = 0
    
    for index, row in df.iterrows():
        # if processed_rows >= max_rows:
        #     print(f"デバッグ用に{max_rows}行の処理で終了します")
        #     break
            
        date_str = row['日付']
        date = pd.to_datetime(date_str, format='%Y/%m/%d')
        
        # 天気情報取得
        weather, max_temp, min_temp = fetch_weather_info(date)
        
        # イベント情報取得
        event_info = fetch_event_info(date)
        
        # データフレームに書き込み
        df.at[index, '天気'] = weather
        df.at[index, '最高気温'] = max_temp
        df.at[index, '最低気温'] = min_temp
        df.at[index, '備考'] = event_info
        print(f"日付: {date_str}, 天気: {weather}, 最高気温: {max_temp}, 最低気温: {min_temp}, 備考: {event_info}")
        
        # 処理済み行数をカウントアップ
        processed_rows += 1
    
    # 結果を新しいCSVに保存
    df.to_csv(output_file, index=False)
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
