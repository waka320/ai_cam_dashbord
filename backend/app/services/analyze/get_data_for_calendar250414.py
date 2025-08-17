import pandas as pd
import calendar
from typing import List, Optional
from app.models import DayCongestion, WeatherInfo
import os
import glob

# 各場所の混雑度境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (2300, 9500),
    'honmachi3': (1500, 8500),
    'honmachi4': (1000, 10000),
    'jinnya': (700, 7000),
    'kokubunjidori': (1600, 5800),
    'nakabashi': (1600, 7800),
    'omotesando': (700, 7000),
    'yasukawadori': (7000, 26000),
    'yottekan': (300, 3500),
    'gyouzinbashi': (300, 1400),  # 行神橋の閾値
    'old-town': (850, 7000),     # 古い町並の閾値
    'station': (400, 2100),   
    # デフォルト値
    'default': (2300, 9500)
}

def get_data_for_calendar(df: pd.DataFrame, year: int, month: int, place: str = 'default', weather_data: List[dict] = None) -> List[List[Optional[DayCongestion]]]:
    """
    DataFrameから歩行者データを取得し、カレンダー形式に整形する。
    混雑度を10段階で計算する。日曜始まりのカレンダーを作成する。
    
    混雑度計算方法:
    1. CONGESTION_THRESHOLDSから混雑度1,2の境界値と9,10の境界値を取得
    2. 全データの平均値を計算し、混雑度5,6の境界値とする
    3. (混雑度5,6の境界値 - 混雑度1,2の境界値) / 4 で混雑度2,3、3,4、4,5の境界値を計算
    4. (混雑度9,10の境界値 - 混雑度5,6の境界値) / 4 で混雑度6,7、7,8、8,9の境界値を計算
    
    データがない日は混雑度0となり、データが1以上ある日は混雑度1～10となる。
    
    Args:
        df: 分析対象のDataFrame
        year: 年
        month: 月
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']
    
    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])
    
    # 日付のみの列を追加
    df_person['date_only'] = df_person[date_col].dt.date

    # 日ごとの歩行者数を集計（全方向の合計）
    daily_counts = df_person.groupby('date_only')['count_1_hour'].sum().reset_index()
    daily_counts['datetime_jst'] = pd.to_datetime(daily_counts['date_only'])

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS.get(place, CONGESTION_THRESHOLDS['default'])
    
    # データの平均値を計算（混雑度5,6の境界値）
    if not daily_counts.empty:
        middle_threshold = daily_counts['count_1_hour'].mean()
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

    # デバッグログを削減（必要時のみ出力）
    # print(f"場所: {place}")
    # print(f"混雑度1,2の境界値: {min_threshold}")
    # print(f"混雑度5,6の境界値 (平均値): {middle_threshold}")
    # print(f"混雑度9,10の境界値: {max_threshold}")
    # print(f"計算された境界値: {[int(b) for b in bins[:-1]]}, inf")
    
    # データの最大値を確認（ログ出力は削減）
    max_count = daily_counts['count_1_hour'].max() if not daily_counts.empty else 0
    # print(f"{place}の最大歩行者数: {max_count}")

    # 定義した境界値に基づいて混雑度レベルを割り当て
    # データが0の場合は混雑度0、それ以外は1～10
    daily_counts['level'] = pd.cut(
        daily_counts['count_1_hour'], 
        bins=bins, 
        labels=False, 
        include_lowest=True,
        right=False
    )  # 注：ここでは+1しない。0から始まる混雑度を作成

    # 該当する月のデータをフィルタリング
    monthly_counts = daily_counts[
        (daily_counts['datetime_jst'].dt.year == year) &
        (daily_counts['datetime_jst'].dt.month == month)
    ]

    # 日付をインデックスに設定
    monthly_counts.set_index('datetime_jst', inplace=True)

    first_day_weekday = calendar.weekday(year, month, 1)
    first_day_weekday = (first_day_weekday + 1) % 7

    # 月の日数を計算
    days_in_month = calendar.monthrange(year, month)[1]

    # 天気データを日付でマッピング
    weather_map = {}
    if weather_data:
        for wd in weather_data:
            weather_map[wd['day']] = WeatherInfo(
                day=wd['day'],
                date=wd['date'],
                weather=wd['weather'],
                avg_temperature=wd['avg_temperature'],
                total_rain=wd['total_rain']
            )

    # カレンダー形式のデータを作成
    calendar_data: List[List[Optional[DayCongestion]]] = []
    week: List[Optional[DayCongestion]] = [
        None] * first_day_weekday  # 最初の週の空白を埋める

    for day in range(1, days_in_month + 1):
        date = pd.Timestamp(year=year, month=month, day=day)
        if date in monthly_counts.index:
            level = monthly_counts.loc[date, 'level']
        else:
            level = 0  # データがない場合は混雑度0

        # 天気情報を取得
        weather_info = weather_map.get(day, None)

        day_data = DayCongestion(date=day, congestion=int(level), weather_info=weather_info)
        week.append(day_data)

        if len(week) == 7:
            calendar_data.append(week)
            week = []

    # 最後の週が7日に満たない場合、Noneで埋める
    if week:
        week += [None] * (7 - len(week))
        calendar_data.append(week)

    return calendar_data

def count_persons_by_day(directory=None):
    # Use provided directory or default
    if directory is None:
        directory = '/Users/WakaY/Desktop/new_dashbord/data/meidai'  # Adjust this path as needed
    
    # List all CSV files in the directory
    csv_files = glob.glob(os.path.join(directory, '*.csv'))
    
    if not csv_files:
        print(f"No CSV files found in {directory}")
        return {}
    
    print(f"Found {len(csv_files)} CSV files")
    
    # Dictionary to store counts: {date: count}
    daily_person_counts = {}
    
    for csv_file in csv_files:
        try:
            # Read the CSV file
            df = pd.read_csv(csv_file)
            
            # Ensure required columns exist
            if 'name' not in df.columns or 'count_1_hour' not in df.columns:
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
            
            # Extract date part (ignoring time)
            df['date_only'] = df[date_column].dt.date
            
            # Sum 'count_1_hour' values for 'person' entries by date
            person_df = df[df['name'] == 'person']
            daily_count = person_df.groupby('date_only')['count_1_hour'].sum()
            
            # Update the daily counts
            for date, count in daily_count.items():
                if date in daily_person_counts:
                    daily_person_counts[date] += count
                else:
                    daily_person_counts[date] = count
        except Exception as e:
            print(f"Error processing {csv_file}: {e}")
    
    # Sort the counts by date
    sorted_counts = {k: daily_person_counts[k] for k in sorted(daily_person_counts.keys())}
    
    # Print the result
    print("\nDaily counts for 'person':")
    for date, count in sorted_counts.items():
        print(f"{date}: {count} persons")
    
    return sorted_counts

if __name__ == "__main__":
    count_persons_by_day()
