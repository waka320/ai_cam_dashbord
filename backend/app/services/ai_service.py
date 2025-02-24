import aiohttp
import pandas as pd
from app.core.config import settings
from datetime import timedelta
import json


async def analyze_csv_data(csv_path: str):
    df = pd.read_csv(csv_path)

    # datetime_jst列を日時型に変換
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])

    # 最新の日付を取得
    end_date = df['datetime_jst'].max()

    # 1ヶ月前の日付を計算
    start_date = end_date - timedelta(days=30)

    # 直近1ヶ月のデータを抽出
    df_last_month = df[(df['datetime_jst'] >= start_date)
                       & (df['datetime_jst'] <= end_date)]

    df_person = df_last_month[
        (df_last_month['name'] == 'person') &
        (df_last_month['countingDirection'].isin(['toNorth', 'toSouth']))
    ]

    # 時間帯別集計
    hourly_counts = df_person.groupby(['date_jst', 'time_jst'])[
        'count_1_hour'].sum().reset_index()

    # より構造化されたプロンプト
    prompt = f"""岐阜県高山市本町2丁目の直近1ヶ月（{start_date.date()}〜{end_date.date()}）の歩行者データを分析し,店舗経営者がデータに基づいてどのタイミングで長期休暇を取得するべきかを提案してください。

    **分析要件:**
    1. 日別/時間帯別の歩行者数傾向を特定
    2. 観光客が少ないと思われる期間を特定
    3. 具体的な日付と時間帯を提示
    4. データに基づく長期休暇のタイミングの推奨理由を説明

    **生データサンプル:**
    {hourly_counts.to_csv(index=False)}

    **分析ガイドライン:**
    - 週末（金曜日〜日曜日）と平日の比較
    - 早朝（5-8時）と夜間（20-23時）の数値に注目
    - 天候やイベントの可能性を考慮"""

    print("Prompt:", prompt)

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.GEMINI_API_KEY
    }

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(settings.AI_API_URL, headers=headers, json=payload) as response:
            response.raise_for_status()
            result = await response.json()

            # デバッグ用にレスポンス全体を出力
            print("Gemini API Response:", json.dumps(
                result, indent=2, ensure_ascii=False))

            # レスポンス構造のバリデーション
            if "candidates" not in result:
                raise ValueError(
                    "Invalid response format from Gemini API")

        return result["candidates"][0]["content"]["parts"][0]["text"]
