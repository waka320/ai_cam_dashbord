import pandas as pd
import requests
import os
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# .envファイルから環境変数をロード
load_dotenv()

# 天気情報を取得する関数（tenki.jpのスクレイピングを使用）
def fetch_weather_info(date):
    # 過去日付か将来日付かを判定
    current_date = datetime.now().date()
    target_date = date.date() if isinstance(date, datetime) else date
    days_diff = (current_date - target_date).days
    
    # 過去の天気情報を取得（tenki.jpのスクレイピング）
    if days_diff >= 0:  # 過去または今日のデータ
        # tenki.jpの過去天気ページURL - 正しい形式に修正
        base_url = f"https://tenki.jp/past/{date.year}/{date.month:02d}/weather/5/24/47617/"
        
        try:
            response = requests.get(base_url)
            if response.status_code != 200:
                return f"データ取得失敗: ステータスコード {response.status_code}", None, None
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 天気、最高気温、最低気温を抽出
            try:
                # 月間カレンダーから特定の日付のデータを探す
                target_day = date.day
                
                # 日付に該当するセルを見つける
                day_cells = soup.find_all('td')
                for cell in day_cells:
                    # セル内に日付データがあるか確認
                    date_span = cell.select_one("span.date")
                    if date_span and date_span.text.strip() == str(target_day):
                        # この日のデータを取得
                        weather_text = cell.get_text().strip()
                        
                        # 天気を取得 (alt属性から)
                        img = cell.find('img')
                        weather = img['alt'] if img and 'alt' in img.attrs else "不明"
                        
                        # 最高気温と最低気温を取得
                        high_temp = cell.select_one("span.high-temp")
                        low_temp = cell.select_one("span.low-temp")
                        
                        high_temp_text = high_temp.text.strip() if high_temp else None
                        low_temp_text = low_temp.text.strip() if low_temp else None
                        
                        return weather, high_temp_text, low_temp_text
                
                # 日付が見つからない場合
                return "データなし", None, None
                
            except Exception as e:
                print(f"解析エラー: {str(e)}")
                return f"データ解析エラー: {str(e)}", None, None
        except Exception as e:
            return f"通信エラー: {str(e)}", None, None
    else:  # 将来の日付の場合
        # 将来の日付は「予報データ」と表示
        return "予報データ", None, None

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
    
    # デバッグ用にループを50回までに制限
    max_rows = 50
    processed_rows = 0
    
    for index, row in df.iterrows():
        # 50行に達したらループを抜ける
        if processed_rows >= max_rows:
            print(f"デバッグ用に{max_rows}行の処理で終了します")
            break
            
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
    input_csv = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather_analyze.csv"  # 絶対パスを使用
    output_csv = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/weather/weather_analyze_result.csv"  # 出力先も絶対パスで指定
    
    process_csv(input_csv, output_csv)
