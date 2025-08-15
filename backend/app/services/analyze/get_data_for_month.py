import pandas as pd
import calendar
from typing import List, Dict, Any

# 各場所の混雑度境界値の定義（月単位用）
CONGESTION_THRESHOLDS_MONTH = {
    # 場所ごとの(min_threshold, max_threshold)を定義（日単位の30倍程度）
    'honmachi2': (69000, 285000),
    'honmachi3': (45000, 255000),
    'honmachi4': (30000, 300000),
    'jinnya': (21000, 210000),
    'kokubunjidori': (48000, 174000),
    'nakabashi': (48000, 234000),
    'omotesando': (21000, 210000),
    'yasukawadori': (210000, 780000),
    'yottekan': (9000, 105000),
    'old-town': (25500, 210000),
    'gyouzinbashi': (9000, 42000),
    'station': (12000, 63000),
    # デフォルト値
    'default': (69000, 285000)
}


def get_data_for_month(
    df: pd.DataFrame,
    year: int = None,  # 互換性のため残すが使用しない
    place: str = 'default',
    weather_data: Dict[int, List[Dict[str, Any]]] = None
) -> List[Dict[str, Any]]:
    """
    DataFrameから歩行者データを取得し、全期間の月単位で混雑度を計算する。
    混雑度を10段階で計算する。
    Args:
        df: 分析対象のDataFrame
        year: 互換性のため残すが使用しない
        place: 場所の名前（CSVファイル名から拡張子を除いたもの）
        weather_data: 天気データ（使用しない）

    Returns:
        List[Dict[str, Any]]: 年月ごとの混雑度データのリスト
    """
    # 人のデータのみをフィルタリング
    df_person = df[df['name'] == 'person']

    # 日付列をdatetimeに変換（既にdatetime型の場合はスキップ）
    date_col = 'datetime_jst'
    if not pd.api.types.is_datetime64_any_dtype(df_person[date_col]):
        df_person[date_col] = pd.to_datetime(df_person[date_col])

    if df_person.empty:
        return []

    # 年月ごとの歩行者数を集計
    df_person = df_person.copy()
    df_person['year_month'] = df_person[date_col].dt.to_period('M')
    monthly_counts = (
        df_person.groupby('year_month')['count_1_hour']
        .sum()
        .reset_index()
    )
    monthly_counts['year'] = monthly_counts['year_month'].dt.year
    monthly_counts['month'] = monthly_counts['year_month'].dt.month
    monthly_counts = monthly_counts.drop(columns=['year_month'])
    monthly_counts.columns = ['total_count', 'year', 'month']

    # 欠損期間の除外: その月のデータ存在日数が少ない年月を除外
    if not monthly_counts.empty:
        df_person_copy = df_person.copy()
        df_person_copy['date_only'] = df_person_copy[date_col].dt.date
        df_person_copy['year_month'] = (
            df_person_copy[date_col].dt.to_period('M')
        )

        days_per_month = (
            df_person_copy.groupby('year_month')['date_only']
            .nunique()
            .reset_index()
            .rename(columns={'date_only': 'days_with_data'})
        )
        days_per_month['year'] = days_per_month['year_month'].dt.year
        days_per_month['month'] = days_per_month['year_month'].dt.month

        # 各年月の暦日数を計算
        days_per_month['calendar_days'] = days_per_month.apply(
            lambda row: calendar.monthrange(row['year'], row['month'])[1],
            axis=1
        )
        days_per_month['coverage_ratio'] = (
            days_per_month['days_with_data'] / days_per_month['calendar_days']
        )

        # 60%未満のカバレッジは除外
        monthly_counts = monthly_counts.merge(
            days_per_month[['year', 'month', 'coverage_ratio']],
            on=['year', 'month'],
            how='left'
        )
        monthly_counts = monthly_counts[
            (monthly_counts['coverage_ratio'].fillna(0) >= 0.6)
        ].drop(columns=['coverage_ratio'])

    if monthly_counts.empty:
        return []

    # 場所に応じた混雑度の境界値を取得
    min_threshold, max_threshold = CONGESTION_THRESHOLDS_MONTH.get(
        place, CONGESTION_THRESHOLDS_MONTH['default']
    )

    # データの平均値を計算（混雑度5,6の境界値）
    middle_raw = monthly_counts['total_count'].mean()

    # middle を安全範囲にクランプ
    middle_threshold = max(
        min(middle_raw, max_threshold - 1),
        min_threshold + 1
    )

    # 段階的な境界値
    step_lower = (middle_threshold - min_threshold) / 4
    step_upper = (max_threshold - middle_threshold) / 4

    # 単調増加な bins を生成
    bins = [0, 1, float(min_threshold)]

    last = bins[-1]
    for i in range(1, 4):
        val = min_threshold + i * step_lower
        if val <= last:
            val = last + 1
        bins.append(float(val))
        last = val

    val = float(middle_threshold)
    if val <= last:
        val = last + 1
    bins.append(val)
    last = val

    for i in range(1, 4):
        val = middle_threshold + i * step_upper
        if val <= last:
            val = last + 1
        bins.append(float(val))
        last = val

    val = float(max_threshold)
    if val <= last:
        val = last + 1
    bins.append(val)

    bins.append(float('inf'))

    # 定義した境界値に基づいて混雑度レベルを割り当て
    monthly_counts['congestion'] = pd.cut(
        monthly_counts['total_count'],
        bins=bins,
        labels=False,
        include_lowest=True,
        right=False
    )

    # 結果を整形（年月順にソート）
    result = []
    monthly_counts = monthly_counts.sort_values(by=['year', 'month'])

    for _, row in monthly_counts.iterrows():
        result.append({
            "year": int(row['year']),
            "month": int(row['month']),
            "month_name": calendar.month_name[int(row['month'])],
            "congestion": int(row['congestion']),
            "total_count": int(row['total_count']),
            "highlighted": False,
            "highlight_reason": "",
            "weather_info": None  # 全期間では天気データは使用しない
        })

    return result
