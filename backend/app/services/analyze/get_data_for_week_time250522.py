import pandas as pd
import calendar
from typing import List, Dict, Any
import os
from app.models import HourData, DayWithHours

# 各場所の混雑度境界値の定義
CONGESTION_THRESHOLDS = {
    # 場所ごとの(min_threshold, max_threshold)を定義
    'honmachi2': (15, 400),
    'honmachi3': (10, 250),
    'honmachi4': (15, 300),
    'jinnya': (10, 500),
    'kokubunjidori': (15, 220),
    'nakabashi': (10, 350),
    'omotesando': (5, 160),
    'yasukawadori': (100, 2000),
    'yottekan': (3, 70),
    # デフォルト値
    'default': (10, 500)
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

def get_data_for_week_time(csv_file_path: str, year: int, month: int) -> List[DayWithHours]:
    """
    CSVファイルから特定の年月の歩行者データを取得し、曜日×時間帯形式で整形する。
    混雑度を10段階で計算する。7時から22時までの時間帯のデータを返す。

    Args:
        csv_file_path: CSVファイルのパス
        year: 年
        month: 月

    Returns:
        List[DayWithHours]: 曜日ごとの時間帯データを含むモデルオブジェクトのリスト
    """
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        
        # 日時列をdatetimeに変換
        date_col = 'datetime_jst'
        if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
            df[date_col] = pd.to_datetime(df[date_col])
        
        # 該当する年月のデータのみにフィルタリング
        df_month = df[
            (df[date_col].dt.year == year) &
            (df[date_col].dt.month == month) &
            (df['name'] == 'person')  # 人のデータのみ
        ]
        
        # 時間帯をフィルタリング（7時から22時まで）
        df_filtered = df_month[(df_month['time_jst'] >= 7) & (df_month['time_jst'] <= 22)].copy()  # コピーを作成して警告を回避
        
        # 曜日情報を追加
        df_filtered['weekday'] = df_filtered[date_col].dt.weekday
        
        # 曜日と時間でグループ化して合計
        grouped = df_filtered.groupby(['weekday', 'time_jst'])['count_1_hour'].mean().reset_index()
        
        # 場所の名前を取得（ファイル名から拡張子を除いたもの）
        place = os.path.splitext(os.path.basename(csv_file_path))[0]
        
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
        
        # 境界値のリストを作成
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
        grouped['level'] = pd.cut(
            grouped['count_1_hour'],
            bins=bins,
            labels=False,
            include_lowest=True,
            right=False
        )
        
        # 結果を新しい形式で整理
        result = []
        for weekday in range(7):  # 0:月曜〜6:日曜
            weekday_data = grouped[grouped['weekday'] == weekday]
            
            hours_data = []
            # 7時から22時までの各時間のデータを取得
            for hour in range(7, 23):
                hour_data = weekday_data[weekday_data['time_jst'] == hour]
                
                if not hour_data.empty:
                    # データがある場合
                    level = int(hour_data['level'].values[0])
                    count = int(hour_data['count_1_hour'].values[0])  # intに変換
                else:
                    # データがない場合
                    level = 0
                    count = 0
                
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
                day=WEEKDAY_NAMES[weekday]["en"],
                hours=hours_data
            ))
        
        return result
        
    except Exception as e:
        print(f"曜日×時間データの作成中にエラーが発生しました: {e}")
        import traceback
        print(traceback.format_exc())
        # エラー時は空のリストを返す
        return []

if __name__ == "__main__":
    # テスト用コード
    test_file = "/Users/WakaY/Desktop/new_dashbord/backend/app/data/meidai/yasukawadori.csv"
    result = get_data_for_week_time(test_file, 2024, 4)
    print(f"結果データ数: {len(result)}")
    if result:
        print(f"最初の曜日: {result[0].day}")
        print(f"時間帯データ数: {len(result[0].hours)}")
        print(f"サンプル時間帯データ: {result[0].hours[0]}")
