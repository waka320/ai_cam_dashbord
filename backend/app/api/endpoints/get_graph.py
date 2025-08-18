from fastapi import APIRouter, HTTPException
import os
import pandas as pd
from app.services.analyze import (
    get_data_for_calendar250414 as calendar_service,
)
from app.services.analyze import get_data_for_week_time250522
from app.services.analyze import get_data_for_date_time250504
from app.services.analyze import get_data_for_year
from app.services.analyze import get_data_for_month
from app.services.analyze import get_data_for_week
from app.services.ai_service_debug import analyze_csv_data_debug
from app.services.highlighter_service import (
    highlight_calendar_data,
    highlight_week_time_data,
    highlight_date_time_data,
)
from app.services.weather.weather_service import weather_service
from app.services.csv_events_service import csv_events_service
from app.models import GraphRequest, GraphResponse, WeatherInfo, EventInfo
import time
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

# キャッシュを格納する辞書
cache = {}
# キャッシュの有効期限（1日 = 86400秒）
CACHE_EXPIRY = 86400


@router.post("/api/get-graph")
async def get_graph(request: GraphRequest):
    place = request.place
    year = request.year
    month = request.month
    action = request.action

    # キャッシュキーの作成
    cache_key = f"{place}_{year}_{month}_{action}"

    # キャッシュが存在し、期限内であれば、キャッシュから返す
    current_time = time.time()
    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if current_time - timestamp < CACHE_EXPIRY:
            print(f"Cache hit for {cache_key}")
            return cached_data
        else:
            # 期限切れのキャッシュを削除
            del cache[cache_key]
            print(f"Cache expired for {cache_key}")

    # キャッシュがない場合、通常の処理を実行
    csv_file_path = f"app/data/meidai/{place}.csv"
    if not os.path.exists(csv_file_path):
        raise HTTPException(
            status_code=404, detail="CSV file not found for the given place"
        )

    try:
        # CSVファイルを読み込む
        df = pd.read_csv(csv_file_path)
        df['datetime_jst'] = pd.to_datetime(df['datetime_jst'])
        
        # 天気データを取得（既存のメソッドを使用）
        weather_data = None
        if year and month:
            # 既存のメソッドを使用して天気データを取得
            weather_data = weather_service.get_daily_weather_summary(
                year, month
            )

        # アクションに応じてデータを処理
        if action == "year_trend":
            # 年ごとの傾向分析
            # 年単位では天気データの形式を変更
            yearly_weather_data = None
            if weather_data:
                # 日ごとの天気データを年単位に変換
                yearly_weather_data = {}
                for wd in weather_data:
                    if wd['day'] not in yearly_weather_data:
                        yearly_weather_data[wd['day']] = []
                    yearly_weather_data[wd['day']].append({
                        'weather': wd['weather'],
                        'temperature': wd['avg_temperature'],
                        'rain': wd['total_rain'],
                    })

            trend_data = get_data_for_year.get_data_for_year(
                df, place, yearly_weather_data
            )
            response_data = {
                "type": "year_trend",
                "data": trend_data,
                "ai_analysis": "",
                "highlighted_info": None,
            }

        elif action == "month_trend":
            # 月ごとの傾向分析（指定年の全月）
            # 月単位でも天気データの形式を変更
            monthly_weather_data = None
            if weather_data:
                monthly_weather_data = {}
                for wd in weather_data:
                    if wd['day'] not in monthly_weather_data:
                        monthly_weather_data[wd['day']] = []
                    monthly_weather_data[wd['day']].append({
                        'weather': wd['weather'],
                        'temperature': wd['avg_temperature'],
                        'rain': wd['total_rain'],
                    })

            trend_data = get_data_for_month.get_data_for_month(
                df, year, place, monthly_weather_data
            )
            response_data = {
                "type": "month_trend",
                "data": trend_data,
                "ai_analysis": "",
                "highlighted_info": None,
            }

        elif action == "week_trend":
            # 週ごとの傾向分析（指定年月の全週）
            # 週単位でも天気データの形式を変更
            weekly_weather_data = None
            if weather_data:
                weekly_weather_data = {}
                for wd in weather_data:
                    if wd['day'] not in weekly_weather_data:
                        weekly_weather_data[wd['day']] = []
                    weekly_weather_data[wd['day']].append({
                        'weather': wd['weather'],
                        'temperature': wd['avg_temperature'],
                        'rain': wd['total_rain'],
                    })

            trend_data = get_data_for_week.get_data_for_week(
                df, year, month, place, weekly_weather_data
            )
            response_data = {
                "type": "week_trend",
                "data": trend_data,
                "ai_analysis": "",
                "highlighted_info": None,
            }

        else:
            # 既存のアクション処理
            # アクションに応じたデータ生成とハイライト
            if action[:3] == "cal":
                # カレンダーデータの作成 - placeをファイル名から抽出して渡す
                place_name = os.path.splitext(os.path.basename(place))[0]
                data = calendar_service.get_data_for_calendar(
                    df, year, month, place_name, weather_data
                )
                # ハイライト処理
                data = highlight_calendar_data(data, action)
            elif action[:3] == "wti":
                # 曜日×時間帯データの作成
                week_weather_data = weather_service.get_weather_for_week_time(
                    year, month
                )
                data = get_data_for_week_time250522.get_data_for_week_time(
                    csv_file_path, year, month, week_weather_data
                )
                # ハイライト処理
                data = highlight_week_time_data(data, action)
            elif action[:3] == "dti":
                # 日付×時間帯データの作成
                date_time_weather_data = (
                    weather_service.get_weather_for_date_time(
                        year, month
                    )
                )
                data = get_data_for_date_time250504.get_data_for_date_time(
                    df,
                    year,
                    month,
                    place,
                    date_time_weather_data,
                )
                # ハイライト処理
                data = highlight_date_time_data(data, action)
            else:
                # 未対応のアクション
                data = []
                print(f"Warning: Unsupported action: {action}")

            # AIアドバイスの生成
            ai_advice = await analyze_csv_data_debug(
                csv_file_path, year, month, action
            )

            # 天気データの取得
            weather_info_list = [
                WeatherInfo(
                    day=wd['day'],
                    date=wd['date'],
                    weather=wd['weather'],
                    avg_temperature=wd['avg_temperature'],
                    total_rain=wd['total_rain'],
                )
                for wd in weather_data or []
            ]

            # イベント情報の取得
            event_info_list = get_events_for_period(year, month)

            response = GraphResponse(
                graph=(
                    f"Graph for {place} in {year}/{month}"
                ),
                data=data,
                ai_advice=ai_advice,
                weather_data=weather_info_list,
                event_data=event_info_list,
            )

            # キャッシュにレスポンスを保存
            cache[cache_key] = (response, current_time)
            print(f"Cache set for {cache_key}")

            return response

        # 新しい傾向分析の場合はここで返す
        if action in ["year_trend", "month_trend", "week_trend"]:
            # AIアドバイスの生成
            ai_advice = await analyze_csv_data_debug(
                csv_file_path, year, month, action
            )
            response_data["ai_analysis"] = ai_advice

            # 天気データの整形
            weather_info_list = []
            if weather_data:
                weather_info_list = [
                    WeatherInfo(
                        day=wd['day'],
                        date=wd['date'],
                        weather=wd['weather'],
                        avg_temperature=wd['avg_temperature'],
                        total_rain=wd['total_rain'],
                    )
                    for wd in weather_data
                ]

            # イベント情報の取得
            event_info_list = get_events_for_period(year, month)

            response = GraphResponse(
                graph=f"Trend analysis for {place}",
                data=response_data["data"],
                ai_advice=response_data["ai_analysis"],
                weather_data=weather_info_list,
                event_data=event_info_list,
                type=response_data["type"],
                highlighted_info=response_data["highlighted_info"],
            )

            # キャッシュにレスポンスを保存
            cache[cache_key] = (response, current_time)
            print(f"Cache set for {cache_key}")

            return response

    except Exception as e:
        # エラーが発生した場合はより詳細な情報を提供
        print(f"Error processing request: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing data: {str(e)}",
        )


def get_events_for_period(year: int, month: int) -> List[EventInfo]:
    """指定された年月のイベント情報を取得"""
    try:
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        events = csv_events_service.get_events_for_date_range(
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d")
        )
        
        return [EventInfo(**event) for event in events]
    except Exception:
        return []

# キャッシュのクリーンアップ関数（定期的に実行する場合）
def cleanup_cache():
    """期限切れのキャッシュエントリを削除します"""
    current_time = time.time()
    expired_keys = [
        key for key, (_, timestamp) in cache.items()
        if current_time - timestamp > CACHE_EXPIRY
    ]

    for key in expired_keys:
        del cache[key]

    if expired_keys:
        print(f"Cleaned up {len(expired_keys)} expired cache entries")
