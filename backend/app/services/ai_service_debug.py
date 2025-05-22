import pandas as pd
import os
from typing import Dict, Any, Optional

# 目的のマッピング辞書
PURPOSE_MAPPING = {
    "cal_holiday": "店舗の定休日を検討したい",
    "cal_shoping_holiday": "商店街の定休日を検討したい",
    "cal_long_holiday": "長期休暇のタイミングを検討したい",
    "cal_event": "イベントの開催日程を検討したい",
    "cal_training": "研修のタイミングを検討したい",
    "wti_event_effect": "イベントの効果を確認したい",
    "dti_event_time": "イベントの開催時間を検討したい",
    "wti_shift": "アルバイトのシフトを検討したい",
    "dti_open_hour": "お店の営業時間を検討したい",
    "dti_shoping_open_hour": "商店街の営業時間を検討したい",
    "cal_cog": "カレンダー形式の混雑度が見たい",
    "wti_cog": "日時形式の混雑度が見たい",
    "dti_cog": "曜日と時間帯ごとの混雑度が見たい",
}

# 場所のマッピング辞書
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

# 目的別の分析アプローチ説明
PURPOSE_ANALYSIS_APPROACHES = {
    "cal_holiday": "お店のお休みを考える際は、どの曜日が空いているかを調べ、特に客足が少ない日を見つけます。平日の比較や週ごとのパターンも参考にします。",
    "cal_shoping_holiday": "商店街全体のお休みは、人通りが少ない曜日・時間を探し、他のお店の定休日も参考にします。地元の方と観光客の動きも大切です。",
    "cal_long_holiday": "長期のお休みには、連続して空いている日を探し、月の平均や前後の週末との比較、観光シーズンやイベント情報も考慮します。",
    "cal_event": "イベント日は、人通りが多い日を見つけ、時間帯ごとの人の流れを確認します。滞在時間や曜日による参加しやすさも大切です。",
    "cal_training": "研修には、人通りが少なく静かな環境が確保できる時間帯を探します。午前中や特定の曜日のパターンを見つけます。",
    "wti_event_effect": "イベント効果は、開催日と通常日を比較し、時間帯別の効果や翌日以降への影響も分析します。曜日や天気の影響も確認します。",
    "dti_event_time": "イベント時間は、人通りが最も多い時間帯を探し、曜日ごとの違いや天気の影響も考慮して最適な時間を提案します。",
    "wti_shift": "アルバイトシフトは、混雑する時間帯を特定し、曜日による傾向や時間帯のピークを分析して、効率的な人員配置を提案します。",
    "dti_open_hour": "お店の営業時間は、人通りのピーク時間と曜日による違いを確認し、平日・休日別の需要を分析して最適な時間を提案します。",
    "dti_shoping_open_hour": "商店街の営業時間は、時間帯ごとの人の流れと客層の違いを考慮し、飲食・物販の需要も分析して統一時間を提案します。",
    "cal_cog": "カレンダー形式では、日ごとの混雑度を見やすく表示し、曜日パターンや週による変動、天候の影響なども分析します。",
    "wti_cog": "日時形式では、曜日・時間帯ごとの混雑パターンを探し、特に混む時間や空いている時間帯を見つけます。平日と休日の違いも確認します。",
    "dti_cog": "曜日×時間帯では、曜日と時間の表で混雑パターンを表示し、特に混む・空く時間帯を見つけ、平日・休日別の傾向を分析します。"
}

async def analyze_csv_data_debug(csv_path: str, year: int, month: int, purpose: str):
    """
    デバッグ用：ハイライト基準と分析アプローチの説明のみを返す簡潔バージョン
    """
    # purpose値をラベルに変換
    purpose_label = PURPOSE_MAPPING.get(purpose, purpose)
    
    # CSVファイル名から場所のコードを抽出
    location_code = os.path.basename(csv_path).replace('.csv', '')
    
    # 場所コードを日本語名に変換
    location_name = LOCATION_MAPPING.get(location_code, location_code)

    # ハイライト基準の情報を取得
    highlight_info = HIGHLIGHT_CONDITIONS.get(purpose, {})
    condition_type = highlight_info.get("condition", "未設定")
    threshold = highlight_info.get("threshold", None)
    count = highlight_info.get("count", None)
    metric = highlight_info.get("metric", "congestion")
    
    # ハイライト基準の説明を作成（より簡潔に）
    if condition_type in CONDITION_EXPLANATIONS:
        highlight_explanation = CONDITION_EXPLANATIONS[condition_type]
        
        params = []
        if threshold is not None:
            params.append(f"閾値: {threshold}")
        if count is not None:
            params.append(f"表示数: {count}")
        
        if params:
            highlight_explanation += f"（{', '.join(params)}）"
            
        if metric in METRIC_EXPLANATIONS:
            highlight_explanation += f" / {METRIC_EXPLANATIONS[metric]}"
    else:
        highlight_explanation = "未設定"
    
    # 分析アプローチの説明を取得
    analysis_approach = PURPOSE_ANALYSIS_APPROACHES.get(purpose, "この目的の分析方法は定義されていません")
    
    # CSVファイルが実際に存在するか確認
    try:
        with open(csv_path, 'r') as file:
            pass
    except FileNotFoundError:
        return f"【エラー】{location_name}のデータファイルが見つかりません。パス: {csv_path}"

    # ハイライト基準と分析アプローチの説明のみを返す（簡潔なフォーマット）
    return f"""【{location_name}】{purpose_label}

■ ハイライト方法
{highlight_explanation}

■ 分析のポイント
{analysis_approach}"""
