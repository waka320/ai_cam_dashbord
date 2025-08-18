import pandas as pd
import os
from typing import Dict, Any, Optional

# 目的のマッピング辞書（フロントの ActionSelect.js に合わせて更新）
PURPOSE_MAPPING = {
    # フロントの目的
    "today_details": "今日について詳しく知りたい",
    "cal_holiday": "店舗の定休日を検討したい",
    "cal_shoping_holiday": "商店街の定休日を検討したい",
    "cal_long_holiday": "長期休暇のタイミングを検討したい",
    "cal_event": "イベントの開催日程を検討したい",
    "cal_training": "研修のタイミングを検討したい",
    "dti_event_time": "イベントの開催時刻を検討したい",
    "wti_shift": "アルバイトのシフトを検討したい",
    "dti_open_hour": "お店の営業時刻を検討したい",
    "dti_shoping_open_hour": "商店街の営業時刻を検討したい",
    "cal_cog": "カレンダー形式の混雑度が見たい",
    "dti_cog": "日時形式の混雑度が見たい",
    "wti_cog": "曜日形式の混雑度が見たい",
    "month_trend": "月ごとの傾向を見たい",
    "week_trend": "週ごとの傾向を見たい",

    # 既存の目的（フロント未使用でも後方互換のため残す）
    "wti_event_effect": "イベントの効果を確認したい",
}

# 場所のマッピング辞書（フロントの LocationSelect.js に合わせて更新）
LOCATION_MAPPING = {
    "omotesando": "表参道",
    "yottekan": "よって館しもちょう",
    "honmachi4": "本町4丁目商店街",
    "honmachi3": "本町3丁目商店街",
    "honmachi2": "本町2丁目商店街",
    "kokubunjidori": "国分寺通り 第二商店街",
    "yasukawadori": "やすかわ通り商店街",
    "jinnya": "高山陣屋前交差点",
    "nakabashi": "中橋",
    "station": "駅前",
    "gyouzinbashi": "行神橋",
    "old-town": "古い町並",
}

# ハイライト条件の設定（highlighter_service.pyから統合）
HIGHLIGHT_CONDITIONS = {
    # カレンダー形式のハイライト条件 - 曜日と閾値ベース
    "cal_holiday": {"condition": "weekday_threshold_below", "threshold": 10, "metric": "congestion"}, # 混雑度が少ない曜日で混雑度10以下の日
    "cal_shoping_holiday": {"condition": "weekday_threshold_below", "threshold": 3, "metric": "congestion"}, # 混雑度が少ない曜日で混雑度3以下の日
    
    # カレンダー形式のハイライト条件 - 閾値ベース
    "cal_event": {"condition": "threshold_below", "threshold": 4, "metric": "congestion"}, # 混雑度4以下の日をすべてハイライト
    "cal_long_holiday": {"condition": "threshold_below", "threshold": 2, "metric": "congestion"}, # 混雑度2以下の日をすべてハイライト
    
    # カレンダー形式のハイライト条件 - 個数ベース
    "cal_training": {"condition": "lowest", "count": 2, "metric": "congestion"},
    "cal_cog": {"condition": "extremes", "count": 3, "metric": "congestion"}, # 最も混雑・空いている日をそれぞれ3日ずつ
    "cal_cog_and_count": {"condition": "extremes", "count": 3, "metric": "both"}, # 混雑度と実際の値の両方でハイライト
    
    # 日時形式のハイライト条件
    "wti_event_effect": {"condition": "highest", "count": 3, "metric": "congestion"},
    "dti_event_time": {"condition": "highest", "count": 5, "metric": "congestion"},
    "wti_shift": {"condition": "extremes", "count": 3, "metric": "congestion"},
    "wti_cog": {"condition": "extremes", "count": 3, "metric": "congestion"},
    "wti_count": {"condition": "extremes", "count": 3, "metric": "count"}, # 実際の値ベースでハイライト
    
    # 曜日×時間帯形式のハイライト条件
    "dti_open_hour": {"condition": "peak_hours", "count": 2, "metric": "congestion"}, # 各曜日のピーク時間を2時間ずつ
    "dti_shoping_open_hour": {"condition": "peak_hours", "count": 2, "metric": "congestion"},
    "dti_cog": {"condition": "extremes", "count": 2, "metric": "congestion"},
    "dti_count": {"condition": "extremes", "count": 2, "metric": "count"}, # 実際の値ベースでハイライト
}

# ハイライト条件の説明辞書
CONDITION_EXPLANATIONS = {
    "weekday_threshold_below": "空いている曜日の中で閾値以下の日",
    "threshold_below": "閾値以下の日",
    "threshold_above": "閾値以上の日",
    "lowest": "最も空いている日",
    "highest": "最も混んでいる日",
    "extremes": "最も混雑/空いている日",
    "lowest_consecutive": "連続して空いている日",
    "peak_hours": "曜日ごとのピーク時間"
}

# メトリックの説明辞書
METRIC_EXPLANATIONS = {
    "congestion": "混雑度基準",
    "count": "人通り数基準",
    "both": "混雑度と人通り数の両方"
}

# 目的別のアドバイス内容（CSVベース）
PURPOSE_ADVICE_CONTENT = {
    "cal_holiday": {
        "action": "混雑度が低い曜日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。"
        ],
        "advice": []
    },
    "cal_shoping_holiday": {
        "action": "混雑度が低い曜日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。"
        ],
        "advice": []

    },
    "cal_long_holiday": {
        "action": "連続して混雑度が低い日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "長期休暇が、高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "cal_event": {
        "action": "人が多い時にイベントを開催するなら、混雑度が高い日を探してください。\nイベントで商店街を盛り上げたいなら、混雑度が低い日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "イベントが、高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "cal_training": {
        "action": "混雑度が特別に低い日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "研修日が、高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "wti_event_effect": {
        "action": "目的に合わせて、それに合う混雑度の日時を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "イベントが、高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "dti_event_time": {
        "action": "人が多い時にイベントを開催するなら、混雑度が高い日時を探してください。\nイベントで商店街をより盛り上げたいなら、混雑度が低い日時を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "イベントが高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "wti_shift": {
        "action": "混雑度が高い時刻に人数を多めに、低い時刻に人数を少なめにしましょう。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "高山祭のようなイベントと時間が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "dti_open_hour": {
        "action": "混雑度が十分に高い時刻を探して営業時刻を設定しましょう。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "平日・土日祝に分けて傾向を考えてみましょう。"
        ],
        "advice": [
            "今の営業時刻が長過ぎる・短過ぎるか振り返りましょう。"
        ]
    },
    "dti_shoping_open_hour": {
        "action": "混雑度が十分に高い時刻を探して営業時刻を設定しましょう。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "平日・土日祝に分けて傾向を考えてみましょう。"
        ],
        "advice": [
            "今の営業時刻が長過ぎる・短過ぎるか振り返りましょう。"
        ]
    },
    "cal_cog": {
        "action": "目的に合わせて、それに合う混雑度の日を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "高山祭のようなイベントと日付が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "wti_cog": {
        "action": "目的に合わせて、それに合う混雑度の日時を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "高山祭のようなイベントと日時が重なっていないのか検討しましょう。"
        ],
        "advice": []
    },
    "dti_cog": {
        "action": "目的に合わせて、それに合う混雑度の曜日/時刻を探してください。",
        "notes": [
            "前の月や去年も見て、他の月も同じような傾向なのか確認しましょう。",
            "高山祭のようなイベントと時間が重なっていないのか検討しましょう。"
        ],
        "advice": []
    }
}

async def analyze_csv_data_debug(csv_path: str, year: int, month: int, purpose: str):
    """
    デバッグ用：新しい構造でアドバイスを生成（やること・注意点・アドバイスに分割）
    """
    # purpose値をラベルに変換
    purpose_label = PURPOSE_MAPPING.get(purpose, purpose)
    
    # CSVファイル名から場所のコードを抽出
    location_code = os.path.basename(csv_path).replace('.csv', '')
    
    # 場所コードを日本語名に変換
    location_name = LOCATION_MAPPING.get(location_code, location_code)

    # CSVファイルが実際に存在するか確認
    try:
        with open(csv_path, 'r') as file:
            pass
    except FileNotFoundError:
        return f"【エラー】{location_name}のデータファイルが見つかりません。パス: {csv_path}"

    # 目的別のアドバイス内容を取得
    advice_content = PURPOSE_ADVICE_CONTENT.get(purpose, {})
    action = advice_content.get("action", "目的に応じた分析を実施してください。")
    notes = advice_content.get("notes", [])
    advice_list = advice_content.get("advice", [])
    
    # アドバイステキストを構造化して生成
    result = f"【{location_name}】{purpose_label}\n\n"
    
    # 去年と
    result += f"■ やること\n{action}\n\n"
    
    # 注意点
    if notes:
        result += "■ 注意点\n"
        for note in notes:
            result += f"・{note}\n"
        result += "\n"
    
    # アドバイス（ある場合のみ表示）
    if advice_list:
        result += "■ アドバイス\n"
        for advice_item in advice_list:
            result += f"・{advice_item}\n"
    
    return result.strip()
