import pandas as pd
import calendar
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
import os
import glob
from app.services.analyze.utils.congestion_scale import (
    TOTAL_CONGESTION_LEVELS,
    build_congestion_bins,
)

# 各場所の混雑度境界値の定義（年単位用）
CONGESTION_THRESHOLDS_YEAR = {
    # 場所ごとの(min_threshold, max_threshold)を定義（日単位の365倍程度）
    'honmachi2': (838500, 3467500),
    'honmachi3': (547500, 3102500),
    'honmachi4': (365000, 3650000),
    'jinnya': (255500, 2555000),
    'kokubunjidori': (584000, 2117000),
    'nakabashi': (584000, 2847000),
    'omotesando': (255500, 2555000),
    'yasukawadori': (2555000, 9490000),
    'yottekan': (109500, 1277500),
    'old-town': (310250, 2555000),
    'gyouzinbashi': (109500, 511000),
    'station': (146000, 766500),
    # デフォルト値
    'default': (838500, 3467500)
}

def get_data_for_year(df: pd.DataFrame, place: str = 'default', weather_data: Dict[int, List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、年単位で混雑度を計算する。
    混雑度を20段階で計算する。
    
    Args:
        df: 分析対象のDataFrame
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
        weather_data: 天気データ

    Returns:
        List[Dict[str, Any]]: [{"year": 年, "congestion": 混雑度, "total_count": 合計人数}, ...] の形式で返す
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    if df_person.empty:
        return []

    # 年ごとの歩行者数を集計
    yearly_counts = df_person.groupby(df_person[date_col].dt.year)['count_1_hour'].sum().reset_index()
    yearly_counts.columns = ['year', 'total_count']

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS_YEAR.get(place, CONGESTION_THRESHOLDS_YEAR['default'])

    # データの平均値を計算（混雑度5,6の境界値）
    if not yearly_counts.empty:
        middle_threshold = yearly_counts['total_count'].mean()
    else:
        middle_threshold = (min_threshold + max_threshold) / 2

    bins = build_congestion_bins(min_threshold, middle_threshold, max_threshold, TOTAL_CONGESTION_LEVELS)

    # 定義した境界値に基づいて混雑度レベルを割り当て
    yearly_counts['congestion'] = pd.cut(
        yearly_counts['total_count'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )

    # 結果を整形
    result = []
    for _, row in yearly_counts.iterrows():
        # 年の天気データを集計
        year_weather = None
        if weather_data:
            year_weather_data = []
            for day_data in weather_data.values():
                year_weather_data.extend(day_data)
            
            if year_weather_data:
                # 最も頻繁に出現する天気を取得
                weather_list = [wd['weather'] for wd in year_weather_data]
                most_common = max(set(weather_list), key=weather_list.count) if weather_list else None
                avg_temp = sum(wd['temperature'] for wd in year_weather_data if wd['temperature'] is not None) / len([wd for wd in year_weather_data if wd['temperature'] is not None]) if any(wd['temperature'] is not None for wd in year_weather_data) else None
                total_rain = sum(wd['rain'] for wd in year_weather_data if wd['rain'] is not None) if any(wd['rain'] is not None for wd in year_weather_data) else None
                
                year_weather = {
                    'weather': most_common,
                    'avg_temperature': round(avg_temp, 1) if avg_temp is not None else None,
                    'total_rain': round(total_rain, 1) if total_rain is not None else None
                }

        result.append({
            "year": int(row['year']),
            "congestion": int(row['congestion']),
            "total_count": int(row['total_count']),
            "highlighted": False,
            "highlight_reason": "",
            "weather_info": year_weather
        })

    return result

def count_persons_by_year(directory=None):
    """
    指定したディレクトリ内のCSVファイルからすべての場所の年ごとの歩行者数を集計する。

    Args:
        directory: CSVファイルが格納されているディレクトリのパス

    Returns:
        Dict[str, Dict[int, int]]: {場所: {年: 歩行者数}} の形式で返す
    """
    if directory is None:
        directory = '/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai'

    csv_files = glob.glob(os.path.join(directory, '*.csv'))
    if not csv_files:
        print(f"No CSV files found in {directory}")
        return {}

    print(f"Found {len(csv_files)} CSV files")

    yearly_person_counts = {}

    for csv_file in csv_files:
        try:
            place = os.path.splitext(os.path.basename(csv_file))[0]
            df = pd.read_csv(csv_file)
            
            if 'name' not in df.columns or 'count_1_hour' not in df.columns:
                print(f"Warning: Required columns not found in {csv_file}")
                continue
                
            date_column = None
            for col in ['date_jst', 'datetime_jst']:
                if col in df.columns:
                    date_column = col
                    break
                    
            if not date_column:
                print(f"Warning: No date column found in {csv_file}")
                continue
                
            print(f"Processing {os.path.basename(csv_file)} using date column: {date_column}")
            
            df[date_column] = pd.to_datetime(df[date_column])
            
            person_df = df[df['name'] == 'person']
            
            if person_df.empty:
                print(f"No person data found in {csv_file}")
                continue
                
            if place not in yearly_person_counts:
                yearly_person_counts[place] = {}
                
            yearly_count = person_df.groupby(person_df[date_column].dt.year)['count_1_hour'].sum()
            
            for year, count in yearly_count.items():
                if year in yearly_person_counts[place]:
                    yearly_person_counts[place][year] += count
                else:
                    yearly_person_counts[place][year] = count
                
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")
            
    return yearly_person_counts

if __name__ == "__main__":
    data = count_persons_by_year()
    for place, counts in data.items():
        print(f"\n場所: {place}")
        print(f"データがある年の総数: {len(counts)}")
        if counts:
            print(f"データ期間: {min(counts.keys())} から {max(counts.keys())}")
            for year, count in sorted(counts.items()):
                print(f"  {year}年: {count:,} 人")
