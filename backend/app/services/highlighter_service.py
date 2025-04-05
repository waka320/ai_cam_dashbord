import pandas as pd
from typing import List, Dict, Any, Optional
from app.models import DayCongestion, HourData, DayWithHours

# 目的に応じたハイライト条件の設定
HIGHLIGHT_CONDITIONS = {
    # カレンダー形式のハイライト条件
    "cal_holiday": {"condition": "lowest", "count": 2},  # 最も人通りが少ない日を2日ハイライト
    "cal_shoping_holiday": {"condition": "lowest", "count": 2},
    "cal_long_holiday": {"condition": "lowest_consecutive", "count": 3},  # 連続で最も人通りが少ない日を3日
    "cal_event": {"condition": "highest", "count": 2},  # 最も人通りが多い日を2日ハイライト
    "cal_training": {"condition": "lowest", "count": 2},
    "cal_cog": {"condition": "extremes", "count": 3},  # 最も混雑・空いている日をそれぞれ3日ずつ

    # 日時形式のハイライト条件
    "wti_event_effect": {"condition": "highest", "count": 3},
    "wti_event_time": {"condition": "highest", "count": 5},
    "wti_shift": {"condition": "extremes", "count": 3},
    "wti_cog": {"condition": "extremes", "count": 3},

    # 曜日×時間帯形式のハイライト条件
    "dti_open_hour": {"condition": "peak_hours", "count": 2},  # 各曜日のピーク時間を2時間ずつ
    "dti_shoping_open_hour": {"condition": "peak_hours", "count": 2},
    "dti_cog": {"condition": "extremes", "count": 2},
}

def highlight_calendar_data(calendar_data: List[List[Optional[DayCongestion]]], action: str) -> List[List[Optional[DayCongestion]]]:
    """カレンダーデータに目的に応じたハイライトを適用"""
    if action not in HIGHLIGHT_CONDITIONS:
        return calendar_data
    
    # 全日付を1次元リストに変換（Noneを除く）
    all_days = [day for week in calendar_data for day in week if day is not None]
    
    # ハイライト条件の取得
    condition = HIGHLIGHT_CONDITIONS[action]["condition"]
    count = HIGHLIGHT_CONDITIONS[action]["count"]
    
    # 条件に基づいてハイライトすべき日を特定
    highlighted_days = []
    if condition == "lowest":
        # 混雑度が最も低い日を取得
        highlighted_days = sorted(all_days, key=lambda x: x.congestion)[:count]
        for day in highlighted_days:
            day.highlighted = True
            day.highlight_reason = "最も空いている日"
    
    elif condition == "highest":
        # 混雑度が最も高い日を取得
        highlighted_days = sorted(all_days, key=lambda x: x.congestion, reverse=True)[:count]
        for day in highlighted_days:
            day.highlighted = True
            day.highlight_reason = "最も混雑する日"
    
    elif condition == "extremes":
        # 混雑度が最も高い日と低い日の両方を取得
        lowest = sorted(all_days, key=lambda x: x.congestion)[:count]
        highest = sorted(all_days, key=lambda x: x.congestion, reverse=True)[:count]
        
        for day in lowest:
            day.highlighted = True
            day.highlight_reason = "最も空いている日"
        
        for day in highest:
            day.highlighted = True
            day.highlight_reason = "最も混雑する日"
    
    elif condition == "lowest_consecutive":
        # 連続する日で最も混雑度が低い組み合わせを見つける
        # 簡易的な実装として、最も混雑度が低い日を単純に取得
        highlighted_days = sorted(all_days, key=lambda x: x.congestion)[:count]
        for day in highlighted_days:
            day.highlighted = True
            day.highlight_reason = "長期休暇に最適"
    
    return calendar_data

def highlight_week_time_data(week_data: List[DayWithHours], action: str) -> List[DayWithHours]:
    """曜日×時間帯データに目的に応じたハイライトを適用"""
    if action not in HIGHLIGHT_CONDITIONS:
        return week_data
    
    # ハイライト条件の取得
    condition = HIGHLIGHT_CONDITIONS[action]["condition"]
    count = HIGHLIGHT_CONDITIONS[action]["count"]
    
    # 条件に基づいてハイライト
    if condition == "peak_hours":
        # 各曜日のピーク時間をハイライト
        for day_data in week_data:
            # 時間帯を混雑度でソート
            sorted_hours = sorted(day_data.hours, key=lambda x: x.congestion, reverse=True)[:count]
            for hour in sorted_hours:
                matching_hour = next((h for h in day_data.hours if h.hour == hour.hour), None)
                if matching_hour:
                    matching_hour.highlighted = True
                    matching_hour.highlight_reason = "ピーク時間"
    
    elif condition == "extremes":
        # 全体の最も混雑する時間帯と空いている時間帯をハイライト
        all_hours = []
        for day_data in week_data:
            all_hours.extend(day_data.hours)
        
        lowest = sorted(all_hours, key=lambda x: x.congestion)[:count]
        highest = sorted(all_hours, key=lambda x: x.congestion, reverse=True)[:count]
        
        # 該当する時間帯にハイライトフラグを設定
        for low_hour in lowest:
            for day_data in week_data:
                matching_hour = next((h for h in day_data.hours if h.hour == low_hour.hour), None)
                if matching_hour and matching_hour.congestion == low_hour.congestion:
                    matching_hour.highlighted = True
                    matching_hour.highlight_reason = "最も空いている時間"
        
        for high_hour in highest:
            for day_data in week_data:
                matching_hour = next((h for h in day_data.hours if h.hour == high_hour.hour), None)
                if matching_hour and matching_hour.congestion == high_hour.congestion:
                    matching_hour.highlighted = True
                    matching_hour.highlight_reason = "最も混雑する時間"
    
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
    count = HIGHLIGHT_CONDITIONS[action]["count"]
    
    # 全ての時間帯データを1次元リストに変換（データ構造の分析用）
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
    
    # 条件に基づいてハイライト処理
    if condition == "extremes":
        # 最も混雑する時間帯と空いている時間帯をハイライト
        
        # congestion値が1の時間帯（データなし）を除外
        valid_hours = [h for h in all_hours if h["hour_data"]["congestion"] > 1]
        
        if valid_hours:
            # 混雑度が最も高い時間帯
            highest = sorted(valid_hours, key=lambda x: x["hour_data"]["congestion"], reverse=True)[:count]
            for hour in highest:
                hour["hour_data"]["highlighted"] = True
                hour["hour_data"]["highlight_reason"] = "最も混雑する時間"
            
            # 混雑度が最も低い時間帯（congestion値が1より大きいもの）
            lowest = sorted(valid_hours, key=lambda x: x["hour_data"]["congestion"])[:count]
            for hour in lowest:
                hour["hour_data"]["highlighted"] = True
                hour["hour_data"]["highlight_reason"] = "最も空いている時間"
    
    elif condition == "peak_hours":
        # 各日付のピーク時間をハイライト
        for day_data in date_time_data:
            # 有効なデータを持つ時間帯のみを対象に
            valid_hours = [h for h in day_data["hours"] if h["congestion"] > 1]
            if valid_hours:
                # その日の中で最も混雑している時間帯をハイライト
                peak_hours = sorted(valid_hours, key=lambda x: x["congestion"], reverse=True)[:count]
                for hour in peak_hours:
                    hour["highlighted"] = True
                    hour["highlight_reason"] = "ピーク時間"
    
    # 特定の目的に応じた追加ハイライト
    if action == "dti_open_hour" or action == "dti_shoping_open_hour":
        # 営業時間の設定に最適な時間帯を特定
        # 午前と午後のピーク時間をハイライト
        for day_data in date_time_data:
            # 午前（12時まで）と午後（12時以降）に分ける
            morning_hours = [h for h in day_data["hours"] if h["hour"] < 12 and h["congestion"] > 1]
            afternoon_hours = [h for h in day_data["hours"] if h["hour"] >= 12 and h["congestion"] > 1]
            
            # 午前のピーク
            if morning_hours:
                morning_peak = sorted(morning_hours, key=lambda x: x["congestion"], reverse=True)[0]
                if not morning_peak.get("highlighted", False):
                    morning_peak["highlighted"] = True
                    morning_peak["highlight_reason"] = "午前のピーク時間"
            
            # 午後のピーク
            if afternoon_hours:
                afternoon_peak = sorted(afternoon_hours, key=lambda x: x["congestion"], reverse=True)[0]
                if not afternoon_peak.get("highlighted", False):
                    afternoon_peak["highlighted"] = True
                    afternoon_peak["highlight_reason"] = "午後のピーク時間"
    
    return date_time_data
