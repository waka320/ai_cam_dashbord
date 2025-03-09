import aiohttp
import pandas as pd
from app.core.config import settings
import os
from datetime import datetime

# 目的のマッピング辞書
PURPOSE_MAPPING = {
    "cal_holiday": "店舗の定休日を検討したい",
    "cal_shoping_holiday": "商店街の定休日を検討したい",
    "cal_long_holiday": "長期休暇のタイミングを検討したい",
    "cal_event": "イベントの開催日程を検討したい",
    "cal_training": "研修のタイミングを検討したい",
    "dti_event_effect": "イベントの効果を確認したい",
    "dti_event_time": "イベントの開催時間を検討したい",
    "dti_shift": "アルバイトのシフトを検討したい",
    "dwe_open_hour": "お店の営業時間を検討したい",
    "dwe_shoping_open_hour": "商店街の営業時間を検討したい",
    "cal_cog": "カレンダー形式の混雑度が見たい",
    "dti_cog": "日時形式の混雑度が見たい",
    "dwe_cog": "曜日と時間帯ごとの混雑度が見たい",
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

async def analyze_csv_data(csv_path: str, year: int, month: int, purpose: str):
    # purpose値をラベルに変換
    purpose_label = PURPOSE_MAPPING.get(purpose, purpose)
    
    # CSVファイル名から場所のコードを抽出
    location_code = os.path.basename(csv_path).replace('.csv', '')
    # 場所コードを日本語名に変換
    location_name = LOCATION_MAPPING.get(location_code, location_code)
    
    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_path)
        
        # データが空の場合は早期リターン
        if df.empty:
            return f"申し訳ありませんが、{location_name}の{year}年{month}月のデータが存在しません。別の期間または場所を選択してください。"

        # datetime_jst列を日時型に変換
        df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
        
        # 全体データの概要を取得
        total_records = len(df)
        date_range = f"{df['datetime_jst'].min().date()} から {df['datetime_jst'].max().date()}"
        
        # personデータのみを抽出
        df_person = df[df['name'] == 'person'].copy()  # コピーを作成して警告を回避
        
        # 全体の月別集計（傾向を把握するため）
        df_person['year_month'] = df_person['datetime_jst'].dt.strftime('%Y-%m')
        monthly_counts = df_person.groupby('year_month')['count_1_hour'].sum().reset_index()
        monthly_counts.columns = ['年月', '歩行者数']
        
        # 全体の曜日別集計
        df_person['dayofweek_num'] = df_person['datetime_jst'].dt.dayofweek
        weekday_counts = df_person.groupby('dayofweek_num')['count_1_hour'].mean().reset_index()
        weekday_counts['曜日'] = weekday_counts['dayofweek_num'].map({
            0: '月曜日', 1: '火曜日', 2: '水曜日', 3: '木曜日', 4: '金曜日', 5: '土曜日', 6: '日曜日'
        })
        weekday_counts = weekday_counts[['曜日', 'count_1_hour']]
        weekday_counts.columns = ['曜日', '平均歩行者数']
        
        # 全体の時間帯別集計
        df_person['hour'] = df_person['datetime_jst'].dt.hour
        hourly_trend = df_person.groupby('hour')['count_1_hour'].mean().reset_index()
        hourly_trend.columns = ['時間帯', '平均歩行者数']
        
        # 指定された年月のデータを抽出
        df_filtered = df_person[
            (df_person['datetime_jst'].dt.year == year) &
            (df_person['datetime_jst'].dt.month == month)
        ].copy()  # コピーを作成して警告を回避
        
        # 指定された年月のデータが存在するか確認
        if df_filtered.empty:
            # 全体データを使って予測を行う
            prompt = f"""岐阜県高山市{location_name}の{year}年{month}月のデータ分析を行い、「{purpose_label}」という目的に対するアドバイスを提供してください。

**全体データの概要:**
- データ収集期間: {date_range}
- 総レコード数: {total_records}

**注意:** 指定された{year}年{month}月のデータは存在しませんが、全体データの傾向から予測を行います。

**月別歩行者数:**
{monthly_counts.to_string(index=False)}

**曜日別平均歩行者数:**
{weekday_counts.to_string(index=False)}

**時間帯別平均歩行者数:**
{hourly_trend.to_string(index=False)}

**分析要件:**
1. {purpose_label}という目的に適したアドバイスを提供する
2. 具体的な日付や時間帯を提案する
3. データに基づいた根拠を示す
4. 高山市の地域特性（観光地、商店街）を考慮する

**追加情報:**
- 高山市は観光地であり、週末や祝日には観光客が増加する傾向がある
- 商店街事業者向けのアドバイスを提供する
- 混雑度の低い時期が事業者の長期休暇に適している可能性がある
- 地域のイベントや季節要因も考慮する"""
            print(prompt)   
        else:
            # 日別集計
            df_filtered['date'] = df_filtered['datetime_jst'].dt.date
            daily_counts = df_filtered.groupby('date')['count_1_hour'].sum().reset_index()
            daily_counts.columns = ['日付', '歩行者数']
            
            # 時間帯別集計
            df_filtered['hour'] = df_filtered['datetime_jst'].dt.hour
            hourly_counts = df_filtered.groupby(['date', 'hour'])['count_1_hour'].sum().reset_index()
            hourly_counts.columns = ['日付', '時間', '歩行者数']
            
            prompt = f"""岐阜県高山市{location_name}の{year}年{month}月のデータ分析を行い、「{purpose_label}」という目的に対するアドバイスを提供してください。

**全体データの概要:**
- データ収集期間: {date_range}
- 総レコード数: {total_records}

**月別歩行者数:**
{monthly_counts.to_string(index=False)}

**曜日別平均歩行者数:**
{weekday_counts.to_string(index=False)}

**時間帯別平均歩行者数:**
{hourly_trend.to_string(index=False)}

**分析対象期間の詳細データ:**

日別歩行者数:
{daily_counts.to_string(index=False)}

時間帯別歩行者数サンプル:
{hourly_counts.head(10).to_string(index=False)}

**分析要件:**
1. {purpose_label}という目的に適したアドバイスを提供する
2. 具体的な日付や時間帯を提案する
3. データに基づいた根拠を示す
4. 高山市の地域特性（観光地、商店街）を考慮する

**追加情報:**
- 高山市は観光地であり、週末や祝日には観光客が増加する傾向がある
- 商店街事業者向けのアドバイスを提供する
- 混雑度の低い時期が事業者の長期休暇に適している可能性がある
- 地域のイベントや季節要因も考慮する"""
        print(prompt)

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
        
        # モデル名を修正
        model_name = "gemini-1.5-pro-001"  # または "gemini-1.5-pro-002"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
                headers=headers,
                json=payload
            ) as response:
                response.raise_for_status()
                result = await response.json()
                
                if "candidates" not in result:
                    raise ValueError("Invalid response format from Gemini API")
                
                return result["candidates"][0]["content"]["parts"][0]["text"]
    
    except Exception as e:
        # エラーが発生した場合はエラーメッセージを返す
        return f"データ分析中にエラーが発生しました: {str(e)}"
