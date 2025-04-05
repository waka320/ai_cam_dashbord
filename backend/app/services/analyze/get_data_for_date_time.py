import pandas as pd
from typing import List, Dict, Optional, Union


def get_data_for_date_time(file_path_or_df: Union[str, pd.DataFrame], year: Optional[int] = None, month: Optional[int] = None) -> List[Dict[str, Union[str, List[Dict[str, float]]]]]:
    """
    日付×時間の混雑度マトリックスを生成する関数。
    
    Args:
        file_path_or_df (Union[str, pd.DataFrame]): CSVファイルのパスまたはすでに読み込まれたデータフレーム。
        year (Optional[int]): フィルタリングする年（指定しない場合は全期間）。
        month (Optional[int]): フィルタリングする月（指定しない場合は全期間）。
        
    Returns:
        List[Dict[str, Union[str, List[Dict[str, float]]]]]: 日付×時間ごとの混雑度データ。
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
    df["date"] = df["datetime_jst"].dt.date
    
    # 年月でフィルタリング（指定がある場合）
    if year is not None:
        df = df[df["datetime_jst"].dt.year == year]
    if month is not None:
        df = df[df["datetime_jst"].dt.month == month]
    
    # データが空の場合は空の結果を返す
    if df.empty:
        print("Warning: No data available for the specified period")
        return []
    
    # 「person」データのみフィルタリング
    df_person = df[df["name"] == "person"]
    
    # データが空の場合は空の結果を返す
    if df_person.empty:
        print("Warning: No person data available for the specified period")
        return []
    
    # 欠損している日時情報を補完
    all_dates = pd.date_range(start=df_person["datetime_jst"].min(),
                            end=df_person["datetime_jst"].max(), freq="h")  
    all_combinations = pd.DataFrame({"datetime_jst": all_dates})
    all_combinations["hour"] = all_combinations["datetime_jst"].dt.hour
    all_combinations["date"] = all_combinations["datetime_jst"].dt.date
    
    # 年月でフィルタリング（補完したデータに対しても適用）
    if year is not None:
        all_combinations = all_combinations[all_combinations["datetime_jst"].dt.year == year]
    if month is not None:
        all_combinations = all_combinations[all_combinations["datetime_jst"].dt.month == month]
    
    # 全時間帯と実際のデータを結合
    df_person = pd.merge(all_combinations, df_person, on=["datetime_jst", "hour", "date"], how="left")
    df_person["count_1_hour"] = df_person["count_1_hour"].fillna(0)
    
    # 日付×時間ごとの人数を計算
    hourly_counts = df_person.groupby(["date", "hour"])["count_1_hour"].mean().reset_index()
    
    # 混雑レベルの計算
    if len(hourly_counts) >= 10:
        # データが十分ある場合は10段階で評価
        hourly_counts["level"], bin_edges = pd.qcut(hourly_counts["count_1_hour"], 10, duplicates="drop", labels=False, retbins=True)
        hourly_counts["level"] += 1  # レベルは1-10とする
    else:
        # データが少ない場合は簡易的なレベル割り当て（5段階）
        hourly_counts["level"] = pd.cut(hourly_counts["count_1_hour"], 
                                     bins=[0, hourly_counts["count_1_hour"].quantile(0.2), 
                                           hourly_counts["count_1_hour"].quantile(0.4),
                                           hourly_counts["count_1_hour"].quantile(0.6),
                                           hourly_counts["count_1_hour"].quantile(0.8),
                                           hourly_counts["count_1_hour"].max() + 1],
                                     labels=[1, 2, 3, 4, 5],
                                     include_lowest=True)
    
    # データを整形
    hourly_counts["date"] = hourly_counts["date"].astype(str)
    
    # 結果を日付ごとに整理して返却
    result = []
    for date in hourly_counts["date"].unique():
        date_data = hourly_counts[hourly_counts["date"] == date][["hour", "count_1_hour", "level"]].to_dict(orient="records")
        
        # hourをintに、count_1_hourをfloatに、levelをintに変換
        processed_hours = []
        for hour_data in date_data:
            processed_hour = {
                "hour": int(hour_data["hour"]),
                "count": float(hour_data["count_1_hour"]),
                "congestion": int(hour_data["level"])
            }
            processed_hours.append(processed_hour)
        
        # WTIとの互換性を確保するため、dateとdayの両方を追加
        # dayプロパティにはdateプロパティの値を設定
        result.append({
            "date": date,
            "day": date,  # day属性も追加して互換性を確保
            "hours": processed_hours
        })
    
    # 日付でソート
    result.sort(key=lambda x: x["date"])
    
    return result
