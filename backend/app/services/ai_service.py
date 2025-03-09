import aiohttp
import pandas as pd
from app.core.config import settings
from datetime import timedelta
import json

async def analyze_csv_data_for_purpose(csv_path: str, year: int, month: int, purpose: str):
    df = pd.read_csv(csv_path)
    
    # datetime_jst列を日時型に変換
    df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
    
    # 全体データの概要を取得（まず全体を見る）
    total_records = len(df)
    date_range = f"{df['datetime_jst'].min().date()} から {df['datetime_jst'].max().date()}"
    
    # 指定された年月のデータを抽出
    df_filtered = df[
        (df['datetime_jst'].dt.year == year) &
        (df['datetime_jst'].dt.month == month)
    ]
    
    df_person = df_filtered[
        (df_filtered['name'] == 'person') &
        (df_filtered['countingDirection'].isin(['toNorth', 'toSouth']))
    ]
    
    # 時間帯別集計
    hourly_counts = df_person.groupby(['date_jst', 'time_jst'])[
        'count_1_hour'].sum().reset_index()
    
    # 日別集計
    daily_counts = df_person.groupby('date_jst')[
        'count_1_hour'].sum().reset_index()
    
    # より構造化されたプロンプト
    prompt = f"""岐阜県高山市{os.path.basename(csv_path).replace('.csv', '')}の{year}年{month}月のデータ分析を行い、「{purpose}」という目的に対するアドバイスを提供してください。

    **全体データの概要:**
    - データ収集期間: {date_range}
    - 総レコード数: {total_records}
    
    **分析対象期間の詳細データ:**
    
    日別歩行者数:
    {daily_counts.to_string(index=False)}
    
    時間帯別歩行者数サンプル:
    {hourly_counts.head(10).to_string(index=False)}
    
    **分析要件:**
    1. {purpose}という目的に適したアドバイスを提供する
    2. 具体的な日付や時間帯を提案する
    3. データに基づいた根拠を示す
    4. 高山市の地域特性（観光地、商店街）を考慮する
    
    **追加情報:**
    - 高山市は観光地であり、週末や祝日には観光客が増加する傾向がある
    - 商店街事業者向けのアドバイスを提供する
    - 混雑度の低い時期が事業者の長期休暇に適している可能性がある
    - 地域のイベントや季節要因も考慮する"""
    
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
            
            if "candidates" not in result:
                raise ValueError("Invalid response format from Gemini API")
            
            return result["candidates"][0]["content"]["parts"][0]["text"]
