import aiohttp
import pandas as pd
from app.core.config import settings


async def analyze_csv_data(csv_path: str):
    # CSVファイルを読み込む
    df = pd.read_csv(csv_path)

    # データの概要を文字列に変換
    data_summary = df.describe().to_string()

    # AIのAPIエンドポイントURL
    ai_api_url = settings.AI_API_URL

    async with aiohttp.ClientSession() as session:
        async with session.post(ai_api_url, json={"data": data_summary}) as response:
            ai_comment = await response.json()

    return ai_comment["comment"]
