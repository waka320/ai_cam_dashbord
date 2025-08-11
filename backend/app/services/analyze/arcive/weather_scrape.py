import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import os
import logging
import time

# ロギング設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WeatherScraper:
    """
    気象庁のWebサイトから天気データをスクレイピングするクラス
    """
    def __init__(self, city_code="47617"):  # デフォルトは高山市のコード
        self.city_code = city_code
        self.base_url = f"https://www.data.jma.go.jp/obd/stats/etrn/view/daily_s1.php?prec_no=52&block_no={city_code}"
        self.save_dir = os.path.join("app", "data", "weather")  # 保存ディレクトリを修正
        os.makedirs(self.save_dir, exist_ok=True)
    
    def fetch_weather_data(self, year, month):
        """
        指定した年月の天気データを取得
        """
        try:
            url = f"{self.base_url}&year={year}&month={month}&day=1&view="
            logger.info(f"気象データ取得開始: {year}年{month}月")
            
            response = requests.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # テーブルからデータ取得
            table = soup.find('table', class_='data2_s')
            if not table:
                logger.warning(f"{year}年{month}月のデータテーブルが見つかりません")
                return None
                
            # データ抽出とDataFrame作成
            data = []
            rows = table.find_all('tr')[2:]  # ヘッダー行をスキップ
            
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) > 7:  # 日付、天気、気温などの列があることを確認
                    day = cells[0].text.strip()
                    if not day or day == '':
                        continue
                        
                    # 必要なデータを抽出
                    try:
                        weather_data = {
                            'date': f"{year}-{month:02d}-{int(day):02d}",
                            'avg_temp': self._parse_numeric(cells[6].text),
                            'max_temp': self._parse_numeric(cells[7].text),
                            'min_temp': self._parse_numeric(cells[8].text),
                            'precipitation': self._parse_numeric(cells[3].text),
                            'sunshine_hours': self._parse_numeric(cells[16].text)
                        }
                        data.append(weather_data)
                    except Exception as e:
                        logger.error(f"データ解析エラー({day}日): {str(e)}")
                        
            # DataFrameに変換
            df = pd.DataFrame(data)
            if not df.empty:
                df['date'] = pd.to_datetime(df['date'])
                logger.info(f"{year}年{month}月の天気データ取得成功: {len(df)}件")
                return df
            else:
                logger.warning(f"{year}年{month}月の天気データは空です")
                return None
                
        except Exception as e:
            logger.error(f"天気データのスクレイピング中にエラーが発生しました: {str(e)}")
            return None
    
    def save_weather_data(self, df, year, month):
        """
        天気データをCSVファイルに保存
        """
        if df is not None and not df.empty:
            file_path = os.path.join(self.save_dir, f"weather_{year}_{month:02d}.csv")
            df.to_csv(file_path, index=False)
            logger.info(f"天気データをCSVに保存しました: {file_path}")
            return file_path
        return None
    
    def _parse_numeric(self, text):
        """
        数値データをパースする（欠損値は None に変換）
        """
        text = text.strip()
        if text == '' or text == '//':
            return None
        try:
            return float(text)
        except:
            return None
    
    def get_monthly_weather(self, year, month):
        """
        月間の天気データを取得して保存
        """
        df = self.fetch_weather_data(year, month)
        file_path = self.save_weather_data(df, year, month)
        return df, file_path
    
    def fetch_historical_data(self, start_year=2021, start_month=1, skip_existing=True, delay=1):
        """
        指定した開始年月から現在までの気象データを一括で取得

        Args:
            start_year (int): データ取得の開始年
            start_month (int): データ取得の開始月
            skip_existing (bool): 既存のファイルをスキップするかどうか
            delay (int): リクエスト間の待機時間（秒）
            
        Returns:
            dict: 月ごとの取得結果サマリー
        """
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        results = {
            "total_months": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0,
            "details": []
        }
        
        # 2021年1月から現在までループ
        year = start_year
        month = start_month
        
        while (year < current_year) or (year == current_year and month <= current_month):
            file_path = os.path.join(self.save_dir, f"weather_{year}_{month:02d}.csv")
            
            # 既存ファイルのチェック
            if skip_existing and os.path.exists(file_path):
                logger.info(f"{year}年{month}月のデータはすでに存在するためスキップします")
                results["skipped"] += 1
                results["details"].append({
                    "year": year,
                    "month": month,
                    "status": "skipped",
                    "file_path": file_path
                })
            else:
                # 天気データを取得して保存
                df, saved_path = self.get_monthly_weather(year, month)
                
                if df is not None:
                    results["successful"] += 1
                    results["details"].append({
                        "year": year,
                        "month": month,
                        "status": "success",
                        "file_path": saved_path,
                        "records": len(df)
                    })
                else:
                    results["failed"] += 1
                    results["details"].append({
                        "year": year,
                        "month": month,
                        "status": "failed"
                    })
                
                # サーバー負荷軽減のため待機
                time.sleep(delay)
            
            results["total_months"] += 1
            
            # 次の月へ
            month += 1
            if month > 12:
                month = 1
                year += 1
        
        logger.info(f"取得処理完了: 全{results['total_months']}ヶ月中、成功: {results['successful']}、失敗: {results['failed']}、スキップ: {results['skipped']}")
        return results
    
    def combine_all_data(self):
        """
        保存された全ての月間気象データを1つのCSVファイルにまとめる
        """
        try:
            all_files = [f for f in os.listdir(self.save_dir) if f.startswith('weather_') and f.endswith('.csv')]
            if not all_files:
                logger.warning("結合するCSVファイルがありません")
                return None
                
            logger.info(f"気象データの結合を開始: {len(all_files)}ファイル")
            
            dfs = []
            for file in sorted(all_files):
                file_path = os.path.join(self.save_dir, file)
                try:
                    df = pd.read_csv(file_path)
                    dfs.append(df)
                except Exception as e:
                    logger.error(f"ファイル読み込みエラー ({file}): {str(e)}")
            
            if not dfs:
                logger.error("結合するデータがありません")
                return None
                
            # データの結合とソート
            combined_df = pd.concat(dfs, ignore_index=True)
            combined_df['date'] = pd.to_datetime(combined_df['date'])
            combined_df = combined_df.sort_values('date').reset_index(drop=True)
            
            # 結合データの保存
            combined_file = os.path.join(self.save_dir, "weather_all.csv")
            combined_df.to_csv(combined_file, index=False)
            logger.info(f"全気象データを結合しました: {len(combined_df)}件 → {combined_file}")
            
            return combined_file
        except Exception as e:
            logger.error(f"データ結合中にエラーが発生しました: {str(e)}")
            return None

# 使用例
if __name__ == "__main__":
    scraper = WeatherScraper(city_code="47617")  # 高山市の地点コード
    
    # 2021年1月から現在までのデータを取得
    print("2021年1月から現在までの気象データを取得しています...")
    results = scraper.fetch_historical_data(start_year=2021, start_month=1, skip_existing=True, delay=1)
    
    print(f"取得結果: 全{results['total_months']}ヶ月中、成功: {results['successful']}、失敗: {results['failed']}、スキップ: {results['skipped']}")
    
    # 全データを結合
    print("全データを1つのファイルに結合しています...")
    combined_file = scraper.combine_all_data()
    
    if combined_file:
        print(f"全気象データが結合され、以下に保存されました: {combined_file}")
    else:
        print("データ結合中にエラーが発生しました")
