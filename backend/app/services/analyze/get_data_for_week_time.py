import pandas as pd
from typing import List, Dict, Optional, Union


def get_data_for_week_time(file_path_or_df: Union[str, pd.DataFrame], year: Optional[int] = None, month: Optional[int] = None) -> Dict[str, List[Dict[str, float]]]:
    """
    曜日×時間の混雑度マトリックスを生成する関数。
    
    Args:
        file_path_or_df (Union[str, pd.DataFrame]): CSVファイルのパスまたはすでに読み込まれたデータフレーム。
        year (Optional[int]): フィルタリングする年（指定しない場合は全期間）。
        month (Optional[int]): フィルタリングする月（指定しない場合は全期間）。
        
    Returns:
        Dict[str, List[Dict[str, float]]]: 曜日×時間ごとの混雑度データ。
    """
    # データの読み込み
    if isinstance(file_path_or_df, str):
        # CSVファイルパスが渡された場合
        df = pd.read_csv(file_path_or_df)
        df["datetime_jst"] = pd.to_datetime(df["datetime_jst"])
    else:
        # DataFrameが直接渡された場合
        df = file_path_or_df.copy()
        if not isinstance(df["datetime_jst"].iloc[0], pd.Timestamp):
            df["datetime_jst"] = pd.to_datetime(df["datetime_jst"])
    
    # 日時から必要な情報を抽出
    df["hour"] = df["datetime_jst"].dt.hour
    df["dayofweek"] = df["datetime_jst"].dt.day_name()
    
    # 年月でフィルタリング（指定がある場合）
    if year is not None:
        df = df[df["datetime_jst"].dt.year == year]
    if month is not None:
        df = df[df["datetime_jst"].dt.month == month]
    
    # データが空の場合は空の結果を返す
    if df.empty:
        print("Warning: No data available for the specified period")
        return {}
    
    # 「person」データのみフィルタリング
    df_person = df[df["name"] == "person"]
    
    # データが空の場合は空の結果を返す
    if df_person.empty:
        print("Warning: No person data available for the specified period")
        return {}
    
    # 欠損している日時情報を補完
    all_dates = pd.date_range(start=df_person["datetime_jst"].min(),
                            end=df_person["datetime_jst"].max(), freq="H")
    all_combinations = pd.DataFrame({"datetime_jst": all_dates})
    all_combinations["hour"] = all_combinations["datetime_jst"].dt.hour
    all_combinations["dayofweek"] = all_combinations["datetime_jst"].dt.day_name()
    
    # 年月でフィルタリング（補完したデータに対しても適用）
    if year is not None:
        all_combinations = all_combinations[all_combinations["datetime_jst"].dt.year == year]
    if month is not None:
        all_combinations = all_combinations[all_combinations["datetime_jst"].dt.month == month]
    
    # 全時間帯と実際のデータを結合
    df_person = pd.merge(all_combinations, df_person, on=["datetime_jst", "hour", "dayofweek"], how="left")
    df_person["count_1_hour"] = df_person["count_1_hour"].fillna(0)
    
    # 曜日×時間ごとの平均人数を計算
    avg_counts = df_person.groupby(["dayofweek", "hour"])["count_1_hour"].mean().reset_index()
    
    # データが10レコード以上ある場合のみqcutを使用
    if len(avg_counts) >= 10:
        # 混雑レベルを計算（0-10）
        avg_counts["level"], bin_edges = pd.qcut(avg_counts["count_1_hour"], 10, duplicates="drop", labels=False, retbins=True)
        avg_counts["level"] += 1  # レベルは1-10とする
    else:
        # データが少ない場合は簡易的なレベル割り当て
        avg_counts["level"] = pd.cut(avg_counts["count_1_hour"], 
                                     bins=[0, avg_counts["count_1_hour"].quantile(0.2), 
                                           avg_counts["count_1_hour"].quantile(0.4),
                                           avg_counts["count_1_hour"].quantile(0.6),
                                           avg_counts["count_1_hour"].quantile(0.8),
                                           avg_counts["count_1_hour"].max() + 1],
                                     labels=[1, 2, 3, 4, 5],
                                     include_lowest=True)
    
    # 結果を曜日ごとに整理して返却
    result = {}
    for day in avg_counts["dayofweek"].unique():
        day_data = avg_counts[avg_counts["dayofweek"] == day][["hour", "count_1_hour", "level"]].to_dict(orient="records")
        result[day] = day_data
    
    return result
