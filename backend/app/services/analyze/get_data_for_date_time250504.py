import pandas as pd
import calendar
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, time
import os
import glob

# 各場所の混雑度境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (65, 850),
    'honmachi3': (35, 750),
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

def get_data_for_date_time(df: pd.DataFrame, year: int, month: int, place: str = 'default') -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、時間×日付形式に整形する。
    混雑度を10段階で計算する。7時から22時までの時間帯のデータを返す。

    混雑度計算方法:
    1. CONGESTION_THRESHOLDSから混雑度1,2の境界値と9,10の境界値を取得
    2. 全データの平均値を計算し、混雑度5,6の境界値とする
    3. (混雑度5,6の境界値 - 混雑度1,2の境界値) / 4 で混雑度2,3、3,4、4,5の境界値を計算
    4. (混雑度9,10の境界値 - 混雑度5,6の境界値) / 4 で混雑度6,7、7,8、8,9の境界値を計算

    データがない時間帯は混雑度0となり、データが1以上ある時間帯は混雑度1～10となる。

    Args:
        df: 分析対象のDataFrame
        year: 年
        month: 月
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）

    Returns:
        List[Dict[str, Any]]: [{"date": 日付文字列, "day": 曜日, "hours": [{"hour": 時間, "congestion": 混雑度}, ...]}, ...] の形式で返す
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    # 該当する年月のデータのみにフィルタリング
    df_month = df_person[
        (df_person[date_col].dt.year == year) &
        (df_person[date_col].dt.month == month)
    ]

    # 時間帯をフィルタリング（7時から22時まで）
    df_filtered = df_month[(df_month['time_jst'] >= 7) & (df_month['time_jst'] <= 22)]

    # 日付と時間でグループ化して合計
    grouped = df_filtered.groupby([df_filtered[date_col].dt.day, 'time_jst'])['count_1_hour'].sum().reset_index()

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])

    # データの平均値を計算（混雑度5,6の境界値）
    if not grouped.empty:
        middle_threshold = grouped['count_1_hour'].mean()
    else:
        # データがない場合は、min_thresholdとmax_thresholdの中間値を使用
        middle_threshold = (min_threshold + max_threshold) / 2

    # 混雑度1,2〜5,6の間の段階的な境界値を計算
    step_lower = (middle_threshold - min_threshold) / 4

    # 混雑度5,6〜9,10の間の段階的な境界値を計算
    step_upper = (max_threshold - middle_threshold) / 4

    # 境界値のリストを作成（データが存在すれば1以上の混雑度を割り当てる）
    bins = [0, 1]  # 0=データなし, 1以上=データあり
    bins.append(min_threshold)  # 混雑度1,2の境界

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

    # 最後に無限大を追加（レベル10の上限）
    bins.append(float('inf'))

    # 定義した境界値に基づいて混雑度レベルを割り当て
    # データが0の場合は混雑度0、それ以外は1～10
    grouped['level'] = pd.cut(
        grouped['count_1_hour'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )  # 注：ここでは+1しない。0から始まる混雑度を作成

    # 結果を新しい形式で整理
    result_dict = {}
    for _, row in grouped.iterrows():
        day_num = int(row[date_col])  # 日付の「日」の値

        # ISO形式の日付文字列を作成（YYYY-MM-DD）
        date_str = f"{year}-{month:02d}-{day_num:02d}"
        
        hour = int(row['time_jst'])
        level = int(row['level'])
        count = int(row['count_1_hour'])

        if date_str not in result_dict:
            # 曜日を計算
            date_obj = datetime(year, month, day_num)
            weekday = date_obj.strftime('%a')  # 曜日の省略形
            
            result_dict[date_str] = {
                "date": date_str,  # 日付を文字列で格納
                "day": weekday,
                "hours": []
            }
        
        # その日の時間データを追加（ハイライト用のプロパティも初期化）
        result_dict[date_str]["hours"].append({
            "hour": hour,
            "congestion": level,
            "count": count,
            "highlighted": False,  # ハイライト表示のフラグ（デフォルトはfalse）
            "highlight_reason": ""  # ハイライトの理由（デフォルトは空文字）
        })

    # 辞書をリストに変換して返す
    result = list(result_dict.values())
    
    return result

def count_persons_by_hour(directory=None):
    """
    指定したディレクトリ内のCSVファイルからすべての場所の1時間ごとの歩行者数を集計する。
    7時から22時までのデータのみを対象とする。

    Args:
        directory: CSVファイルが格納されているディレクトリのパス

    Returns:
        Dict[str, Dict[datetime, int]]: {場所: {日時: 歩行者数}} の形式で返す
    """
    # Use provided directory or default
    if directory is None:
        directory = '/Users/WakaY/Desktop/new_dashbord/data/meidai'  # パスは必要に応じて調整

    # List all CSV files in the directory
    csv_files = glob.glob(os.path.join(directory, '*.csv'))
    if not csv_files:
        print(f"No CSV files found in {directory}")
        return {}

    print(f"Found {len(csv_files)} CSV files")

    # Dictionary to store counts: {place: {datetime: count}}
    hourly_person_counts = {}

    for csv_file in csv_files:
        try:
            # Extract place name from file name
            place = os.path.splitext(os.path.basename(csv_file))[0]
            
            # Read the CSV file
            df = pd.read_csv(csv_file)
            
            # Ensure required columns exist
            if 'name' not in df.columns or 'count_1_hour' not in df.columns or 'time_jst' not in df.columns:
                print(f"Warning: Required columns not found in {csv_file}")
                continue
                
            # Find a date column
            date_column = None
            for col in ['date_jst', 'datetime_jst']:
                if col in df.columns:
                    date_column = col
                    break
                    
            if not date_column:
                print(f"Warning: No date column found in {csv_file}")
                continue
                
            print(f"Processing {os.path.basename(csv_file)} using date column: {date_column}")
            
            # Convert the date column to datetime
            df[date_column] = pd.to_datetime(df[date_column])
            
            # Filter data for 'person' entries and time between 7 and 22
            person_df = df[(df['name'] == 'person') & 
                           (df['time_jst'] >= 7) & 
                           (df['time_jst'] <= 22)]
            
            if person_df.empty:
                print(f"No person data found in {csv_file} for time range 7-22")
                continue
                
            # Initialize place in the result dictionary if not exists
            if place not in hourly_person_counts:
                hourly_person_counts[place] = {}
                
            # Add counts to the result dictionary
            for _, row in person_df.iterrows():
                datetime_key = row[date_column]
                count = row['count_1_hour']
                hourly_person_counts[place][datetime_key] = count
                
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")
            
    return hourly_person_counts

if __name__ == "__main__":
    # 使用例
    data = count_persons_by_hour()
    for place, counts in data.items():
        print(f"\n場所: {place}")
        print(f"データがある時間帯の総数: {len(counts)}")
        if counts:
            print(f"データ期間: {min(counts.keys())} から {max(counts.keys())}")
