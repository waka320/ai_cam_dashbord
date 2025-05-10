import pandas as pd
from typing import List, Dict, Any, Optional
from app.models import DayCongestion, HourData, DayWithHours
from datetime import datetime

# 目的に応じたハイライト条件の設定
HIGHLIGHT_CONDITIONS = {
    # カレンダー形式のハイライト条件 - 曜日と閾値ベース
    "cal_holiday": {"condition": "weekday_threshold_below", "threshold": 10, "metric": "congestion"},  # 混雑度が少ない曜日で混雑度3以下の日
    "cal_shoping_holiday": {"condition": "weekday_threshold_below", "threshold": 3, "metric": "congestion"},  # 混雑度が少ない曜日で混雑度3以下の日

    # カレンダー形式のハイライト条件 - 閾値ベース
    "cal_event": {"condition": "threshold_below", "threshold": 4, "metric": "congestion"},  # 混雑度5以下の日をすべてハイライト
    "cal_long_holiday": {"condition": "threshold_below", "threshold": 2, "metric": "congestion"},  # 混雑度2以下の日をすべてハイライト

    # カレンダー形式のハイライト条件 - 個数ベース（既存）
    "cal_shoping_holiday": {"condition": "lowest", "count": 2, "metric": "congestion"},
    "cal_training": {"condition": "lowest", "count": 2, "metric": "congestion"},
    "cal_cog": {"condition": "extremes", "count": 3, "metric": "congestion"},  # 最も混雑・空いている日をそれぞれ3日ずつ
    "cal_cog_and_count": {"condition": "extremes", "count": 3, "metric": "both"},  # 混雑度と実際の値の両方でハイライト

    # 日時形式のハイライト条件
    "wti_event_effect": {"condition": "highest", "count": 3, "metric": "congestion"},
    "wti_event_time": {"condition": "highest", "count": 5, "metric": "congestion"},
    "wti_shift": {"condition": "extremes", "count": 3, "metric": "congestion"},
    "wti_cog": {"condition": "extremes", "count": 3, "metric": "congestion"},
    "wti_count": {"condition": "extremes", "count": 3, "metric": "count"},  # 実際の値ベースでハイライト

    # 曜日×時間帯形式のハイライト条件
    "dti_open_hour": {"condition": "peak_hours", "count": 2, "metric": "congestion"},  # 各曜日のピーク時間を2時間ずつ
    "dti_shoping_open_hour": {"condition": "peak_hours", "count": 2, "metric": "congestion"},
    "dti_cog": {"condition": "extremes", "count": 2, "metric": "congestion"},
    "dti_count": {"condition": "extremes", "count": 2, "metric": "count"},  # 実際の値ベースでハイライト
}

def highlight_calendar_data(calendar_data: List[List[Optional[DayCongestion]]], action: str) -> List[List[Optional[DayCongestion]]]:
    """カレンダーデータに目的に応じたハイライトを適用"""
    print(action)
    if action not in HIGHLIGHT_CONDITIONS:
        return calendar_data
    
    # 全日付を1次元リストに変換（Noneを除く）
    all_days = [day for week in calendar_data for day in week if day is not None]
    
    # データが存在しない日（congestion=0）をフィルタリング
    valid_days = [day for day in all_days if day.congestion > 0]
    
    if not valid_days:
        return calendar_data
    
    # ハイライト条件の取得
    condition = HIGHLIGHT_CONDITIONS[action]["condition"]
    metric = HIGHLIGHT_CONDITIONS[action].get("metric", "congestion")  # デフォルトは混雑度ベース
    
    # 曜日と閾値ベースのハイライト（新機能）
    if condition == "weekday_threshold_below":
        threshold = HIGHLIGHT_CONDITIONS[action]["threshold"]
        
        # 曜日ごとの平均混雑度を計算
        weekday_congestion = {}
        for day in valid_days:
            # dateプロパティから曜日を取得（0=月曜、6=日曜）
            # カレンダーデータから年月を取得する必要があるため、仮に現在の年月を使用
            # 実際の実装では、カレンダーデータの年月情報を使用するべき
            current_year = datetime.now().year
            current_month = datetime.now().month
            
            try:
                # day.dateは日付の数値のみを想定
                date_obj = datetime(current_year, current_month, day.date)
                weekday = date_obj.weekday()  # 0-6の曜日（0=月曜日）
                
                if weekday not in weekday_congestion:
                    weekday_congestion[weekday] = []
                
                weekday_congestion[weekday].append(day.congestion)
            except (ValueError, AttributeError) as e:
                print(f"Error processing date: {e}")
                continue
        
        # 各曜日の平均混雑度を計算
        avg_congestion = {}
        for weekday, congestions in weekday_congestion.items():
            avg_congestion[weekday] = sum(congestions) / len(congestions)
        
        # 混雑度の低い曜日を特定（平均混雑度でソート）
        sorted_weekdays = sorted(avg_congestion.items(), key=lambda x: x[1])
        
        # 混雑度の低い上位2曜日を選択
        low_congestion_weekdays = [weekday for weekday, _ in sorted_weekdays[:2]]
        
        # 選択された曜日で混雑度が閾値以下の日をハイライト
        for day in valid_days:
            try:
                date_obj = datetime(current_year, current_month, day.date)
                weekday = date_obj.weekday()
                
                if weekday in low_congestion_weekdays and day.congestion <= threshold:
                    day.highlighted = True
                    day.highlight_reason = f"混雑度が少ない曜日"
            except (ValueError, AttributeError):
                continue
        
        return calendar_data
    
    # 閾値ベースのハイライト（新機能）
    if condition == "threshold_below" or condition == "threshold_above":
        threshold = HIGHLIGHT_CONDITIONS[action]["threshold"]
        
        for day in all_days:
            # 混雑度ベースの条件
            if metric in ["congestion", "both"]:
                if (condition == "threshold_below" and day.congestion > 0 and day.congestion <= threshold) or \
                   (condition == "threshold_above" and day.congestion >= threshold):
                    day.highlighted = True
                    if condition == "threshold_below":
                        day.highlight_reason = f"混雑度{threshold}以下の空いている日"
                    else:
                        day.highlight_reason = f"混雑度{threshold}以上の混雑する日"
            
            # 実際の値ベースの条件（countプロパティがある場合）
            if metric in ["count", "both"] and hasattr(day, 'count'):
                if (condition == "threshold_below" and day.count > 0 and day.count <= threshold) or \
                   (condition == "threshold_above" and day.count >= threshold):
                    day.highlighted = True
                    if condition == "threshold_below":
                        day.highlight_reason = f"人通り{threshold}以下の空いている日"
                    else:
                        day.highlight_reason = f"人通り{threshold}以上の混雑する日"
        
        return calendar_data
    
    # 個数ベースのハイライト（既存の機能）
    count = HIGHLIGHT_CONDITIONS[action].get("count", 0)
    
    # 混雑度ベースのハイライト
    if metric in ["congestion", "both"]:
        if condition == "lowest":
            # 混雑度が最も低い日を取得（データなし(congestion=0)は除外）
            lowest_days = sorted([day for day in valid_days], key=lambda x: x.congestion)[:count]
            for day in lowest_days:
                day.highlighted = True
                day.highlight_reason = "最も空いている日"
        
        elif condition == "highest":
            # 混雑度が最も高い日を取得
            highest_days = sorted(valid_days, key=lambda x: x.congestion, reverse=True)[:count]
            for day in highest_days:
                day.highlighted = True
                day.highlight_reason = "最も混雑する日"
        
        elif condition == "extremes":
            # 混雑度が最も高い日と低い日の両方を取得
            lowest = sorted(valid_days, key=lambda x: x.congestion)[:count]
            highest = sorted(valid_days, key=lambda x: x.congestion, reverse=True)[:count]
            
            for day in lowest:
                day.highlighted = True
                day.highlight_reason = "最も空いている日"
            
            for day in highest:
                day.highlighted = True
                day.highlight_reason = "最も混雑する日"
        
        elif condition == "lowest_consecutive":
            # 連続する日で最も混雑度が低い組み合わせを見つける
            # 簡易的な実装として、最も混雑度が低い日を単純に取得
            highlighted_days = sorted(valid_days, key=lambda x: x.congestion)[:count]
            for day in highlighted_days:
                day.highlighted = True
                day.highlight_reason = "長期休暇に最適"
    
    # 実際の値（count）ベースのハイライト（該当する場合）
    if metric in ["count", "both"] and hasattr(valid_days[0], 'count'):
        if condition == "lowest":
            # 値が最も低い日を取得
            lowest_count_days = sorted([day for day in valid_days if day.count > 0], key=lambda x: x.count)[:count]
            for day in lowest_count_days:
                day.highlighted = True
                day.highlight_reason = "最も人通りが少ない日"
        
        elif condition == "highest":
            # 値が最も高い日を取得
            highest_count_days = sorted(valid_days, key=lambda x: x.count, reverse=True)[:count]
            for day in highest_count_days:
                day.highlighted = True
                day.highlight_reason = "最も人通りが多い日"
        
        elif condition == "extremes":
            # 値が最も高い日と低い日の両方を取得
            lowest_count = sorted([day for day in valid_days if day.count > 0], key=lambda x: x.count)[:count]
            highest_count = sorted(valid_days, key=lambda x: x.count, reverse=True)[:count]
            
            for day in lowest_count:
                day.highlighted = True
                day.highlight_reason = "最も人通りが少ない日"
            
            for day in highest_count:
                day.highlighted = True
                day.highlight_reason = "最も人通りが多い日"
    
    return calendar_data

def highlight_week_time_data(week_data: List[DayWithHours], action: str) -> List[DayWithHours]:
    """曜日×時間帯データに目的に応じたハイライトを適用"""
    if action not in HIGHLIGHT_CONDITIONS:
        return week_data
    
    # ハイライト条件の取得
    condition = HIGHLIGHT_CONDITIONS[action]["condition"]
    metric = HIGHLIGHT_CONDITIONS[action].get("metric", "congestion")  # デフォルトは混雑度ベース
    
    # すべての時間帯を含む1次元リスト
    all_hours = []
    for day_data in week_data:
        all_hours.extend(day_data.hours)
    
    # 閾値ベースのハイライト（新機能）
    if condition == "threshold_below" or condition == "threshold_above":
        threshold = HIGHLIGHT_CONDITIONS[action]["threshold"]
        
        for day_data in week_data:
            for hour in day_data.hours:
                # 混雑度ベースの条件
                if metric in ["congestion", "both"]:
                    if (condition == "threshold_below" and hour.congestion > 0 and hour.congestion <= threshold) or \
                       (condition == "threshold_above" and hour.congestion >= threshold):
                        hour.highlighted = True
                        if condition == "threshold_below":
                            hour.highlight_reason = f"混雑度{threshold}以下の空いている時間"
                        else:
                            hour.highlight_reason = f"混雑度{threshold}以上の混雑する時間"
                
                # 実際の値ベースの条件（countプロパティがある場合）
                if metric in ["count", "both"] and hasattr(hour, 'count'):
                    if (condition == "threshold_below" and hour.count > 0 and hour.count <= threshold) or \
                       (condition == "threshold_above" and hour.count >= threshold):
                        hour.highlighted = True
                        if condition == "threshold_below":
                            hour.highlight_reason = f"人通り{threshold}以下の空いている時間"
                        else:
                            hour.highlight_reason = f"人通り{threshold}以上の混雑する時間"
        
        return week_data
    
    # データが存在しない時間帯（congestion=0）をフィルタリング
    valid_hours = [hour for hour in all_hours if hour.congestion > 0]
    
    if not valid_hours:
        return week_data
    
    # 個数ベースのハイライト（既存の機能）
    count = HIGHLIGHT_CONDITIONS[action].get("count", 0)
    
    # 混雑度ベースのハイライト
    if metric in ["congestion", "both"]:
        if condition == "peak_hours":
            # 各曜日のピーク時間をハイライト
            for day_data in week_data:
                # データが存在する時間帯のみを対象
                valid_day_hours = [h for h in day_data.hours if h.congestion > 0]
                if valid_day_hours:
                    # 時間帯を混雑度でソート
                    sorted_hours = sorted(valid_day_hours, key=lambda x: x.congestion, reverse=True)[:count]
                    for hour in sorted_hours:
                        matching_hour = next((h for h in day_data.hours if h.hour == hour.hour), None)
                        if matching_hour:
                            matching_hour.highlighted = True
                            matching_hour.highlight_reason = "ピーク時間"
        
        elif condition == "extremes":
            # 全体の最も混雑する時間帯と空いている時間帯をハイライト
            lowest = sorted(valid_hours, key=lambda x: x.congestion)[:count]
            highest = sorted(valid_hours, key=lambda x: x.congestion, reverse=True)[:count]
            
            # 該当する時間帯にハイライトフラグを設定
            for low_hour in lowest:
                for day_data in week_data:
                    matching_hour = next((h for h in day_data.hours if h.hour == low_hour.hour and h.congestion == low_hour.congestion), None)
                    if matching_hour:
                        matching_hour.highlighted = True
                        matching_hour.highlight_reason = "最も空いている時間"
            
            for high_hour in highest:
                for day_data in week_data:
                    matching_hour = next((h for h in day_data.hours if h.hour == high_hour.hour and h.congestion == high_hour.congestion), None)
                    if matching_hour:
                        matching_hour.highlighted = True
                        matching_hour.highlight_reason = "最も混雑する時間"
    
    # 実際の値（count）ベースのハイライト（該当する場合）
    if metric in ["count", "both"]:
        # count属性が存在する時間帯のみを対象
        count_hours = [h for h in valid_hours if hasattr(h, 'count') and h.count > 0]
        
        if count_hours and condition == "extremes":
            # 値が最も高い時間帯と低い時間帯をハイライト
            lowest_count = sorted(count_hours, key=lambda x: x.count)[:count]
            highest_count = sorted(count_hours, key=lambda x: x.count, reverse=True)[:count]
            
            # 該当する時間帯にハイライトフラグを設定
            for low_hour in lowest_count:
                for day_data in week_data:
                    matching_hour = next((h for h in day_data.hours if h.hour == low_hour.hour and h.count == low_hour.count), None)
                    if matching_hour:
                        matching_hour.highlighted = True
                        matching_hour.highlight_reason = "最も人通りが少ない時間"
            
            for high_hour in highest_count:
                for day_data in week_data:
                    matching_hour = next((h for h in day_data.hours if h.hour == high_hour.hour and h.count == high_hour.count), None)
                    if matching_hour:
                        matching_hour.highlighted = True
                        matching_hour.highlight_reason = "最も人通りが多い時間"
    
    # 特定の目的に応じた追加ハイライト
    if action == "wti_shift":
        # シフト配置に最適な時間帯を特定
        for day_data in week_data:
            # 混雑度が7以上の時間帯をハイライト
            for hour in day_data.hours:
                if hour.congestion >= 7 and not hour.highlighted:
                    hour.highlighted = True
                    hour.highlight_reason = "人員配置が必要"
    
    return week_data

def highlight_date_time_data(date_time_data: List[Dict], action: str) -> List[Dict]:
    """日付×時間帯データに目的に応じたハイライトを適用"""
    if action not in HIGHLIGHT_CONDITIONS:
        return date_time_data
    
    # ハイライト条件の取得
    condition = HIGHLIGHT_CONDITIONS[action]["condition"]
    metric = HIGHLIGHT_CONDITIONS[action].get("metric", "congestion")  # デフォルトは混雑度ベース
    
    # countを常に取得するようにして、未定義エラーを回避
    count = HIGHLIGHT_CONDITIONS[action].get("count", 2)  # デフォルト値を設定
    
    # 閾値ベースのハイライト（新機能）
    if condition == "threshold_below" or condition == "threshold_above":
        threshold = HIGHLIGHT_CONDITIONS[action]["threshold"]
        
        for day_data in date_time_data:
            for hour_data in day_data["hours"]:
                # 混雑度ベースの条件
                if metric in ["congestion", "both"]:
                    congestion = hour_data.get("congestion", 0)
                    if (condition == "threshold_below" and congestion > 0 and congestion <= threshold) or \
                       (condition == "threshold_above" and congestion >= threshold):
                        hour_data["highlighted"] = True
                        if condition == "threshold_below":
                            hour_data["highlight_reason"] = f"混雑度{threshold}以下の空いている時間"
                        else:
                            hour_data["highlight_reason"] = f"混雑度{threshold}以上の混雑する時間"
                
                # 実際の値ベースの条件
                if metric in ["count", "both"] and "count" in hour_data:
                    count = hour_data.get("count", 0)
                    if (condition == "threshold_below" and count > 0 and count <= threshold) or \
                       (condition == "threshold_above" and count >= threshold):
                        hour_data["highlighted"] = True
                        if condition == "threshold_below":
                            hour_data["highlight_reason"] = f"人通り{threshold}以下の空いている時間"
                        else:
                            hour_data["highlight_reason"] = f"人通り{threshold}以上の混雑する時間"
        
        return date_time_data
    
    # 全ての時間帯データを1次元リストに変換
    all_hours = []
    for day_data in date_time_data:
        for hour_data in day_data["hours"]:
            # 時間帯データとその親の日付情報を一緒に格納
            all_hours.append({
                "date": day_data["date"],
                "day": day_data["day"],
                "hour_data": hour_data,
                "full_day": day_data  # 元の日データへの参照を保持
            })
    
    # 混雑度ベースのハイライト
    if metric in ["congestion", "both"]:
        # 条件に基づいてハイライト処理
        if condition == "extremes":
            # 最も混雑する時間帯と空いている時間帯をハイライト
            # データが存在する時間帯のみを対象（congestion > 0）
            valid_hours = [h for h in all_hours if h["hour_data"]["congestion"] > 0]
            
            if valid_hours:
                # 混雑度が最も高い時間帯
                highest = sorted(valid_hours, key=lambda x: x["hour_data"]["congestion"], reverse=True)[:count]
                for hour in highest:
                    hour["hour_data"]["highlighted"] = True
                    hour["hour_data"]["highlight_reason"] = "最も混雑する時間"
                
                # 混雑度が最も低い時間帯（congestion値が0より大きいもの）
                lowest = sorted(valid_hours, key=lambda x: x["hour_data"]["congestion"])[:count]
                for hour in lowest:
                    hour["hour_data"]["highlighted"] = True
                    hour["hour_data"]["highlight_reason"] = "最も空いている時間"
        
        elif condition == "peak_hours":
            # 各日付のピーク時間をハイライト
            for day_data in date_time_data:
                # 有効なデータを持つ時間帯のみを対象に（congestion > 0）
                valid_hours = [h for h in day_data["hours"] if h["congestion"] > 0]
                if valid_hours:
                    # その日の中で最も混雑している時間帯をハイライト
                    peak_hours = sorted(valid_hours, key=lambda x: x["congestion"], reverse=True)[:count]
                    for hour in peak_hours:
                        hour["highlighted"] = True
                        hour["highlight_reason"] = "ピーク時間"
    
    # 実際の値（count）ベースのハイライト（該当する場合）
    if metric in ["count", "both"]:
        # count属性を持ち、値が0より大きい時間帯のみを対象
        count_hours = [h for h in all_hours if "count" in h["hour_data"] and h["hour_data"]["count"] > 0]
        
        if count_hours and condition == "extremes":
            # 値が最も高い時間帯と低い時間帯をハイライト
            highest_count = sorted(count_hours, key=lambda x: x["hour_data"]["count"], reverse=True)[:count]
            for hour in highest_count:
                hour["hour_data"]["highlighted"] = True
                hour["hour_data"]["highlight_reason"] = "最も人通りが多い時間"
            
            lowest_count = sorted(count_hours, key=lambda x: x["hour_data"]["count"])[:count]
            for hour in lowest_count:
                hour["hour_data"]["highlighted"] = True
                hour["hour_data"]["highlight_reason"] = "最も人通りが少ない時間"
    
    
    return date_time_data
