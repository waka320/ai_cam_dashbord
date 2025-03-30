import pandas as pd
from typing import List, Dict


def get_day_hour_matrix(file_path: str) -> Dict[str, List[Dict[str, float]]]:
    """
    曜日×時間の混雑度マトリックスを生成する関数。
    
    Args:
        file_path (str): CSVファイルのパス。
        
    Returns:
        Dict[str, List[Dict[str, float]]]: 曜日×時間ごとの混雑度データ。
    """
    # CSVデータ読み込み
    df = pd.read_csv(file_path)
    
    # 日時列から必要な情報を抽出
    df["datetime_jst"] = pd.to_datetime(df["datetime_jst"])
    df["hour"] = df["datetime_jst"].dt.hour
    df["dayofweek"] = df["datetime_jst"].dt.day_name()
    
    # 「person」データのみフィルタリング
    df_person = df[df["name"] == "person"]
    
    # 欠損している日時情報を補完
    all_dates = pd.date_range(start=df_person["datetime_jst"].min(),
                              end=df_person["datetime_jst"].max(), freq="H")
    all_combinations = pd.DataFrame({"datetime_jst": all_dates})
    all_combinations["hour"] = all_combinations["datetime_jst"].dt.hour
    all_combinations["dayofweek"] = all_combinations["datetime_jst"].dt.day_name()
    
    # 全時間帯と実際のデータを結合
    df_person = pd.merge(all_combinations, df_person, on=["datetime_jst", "hour", "dayofweek"], how="left")
    df_person["count_1_hour"] = df_person["count_1_hour"].fillna(0)
    
    # 曜日×時間ごとの平均人数を計算
    avg_counts = df_person.groupby(["dayofweek", "hour"])["count_1_hour"].mean().reset_index()
    
    # 混雑レベルを計算（0-10）
    avg_counts["level"], bin_edges = pd.qcut(avg_counts["count_1_hour"], 10, duplicates="drop", labels=False, retbins=True)
    avg_counts["level"] += 1  # レベルは1-10とする
    
    # 結果を曜日ごとに整理して返却
    result = {}
    for day in avg_counts["dayofweek"].unique():
        day_data = avg_counts[avg_counts["dayofweek"] == day][["hour", "count_1_hour", "level"]].to_dict(orient="records")
        result[day] = day_data

    # print(result)
    
    return result
