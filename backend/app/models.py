from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import date


class WeatherInfo(BaseModel):
    day: int
    date: str
    weather: str
    avg_temperature: Optional[float] = None
    total_rain: Optional[float] = None


class DayCongestion(BaseModel):
    date: int
    congestion: int
    highlighted: bool = False
    highlight_reason: Optional[str] = None
    weather_info: Optional[WeatherInfo] = None


class HourData(BaseModel):
    hour: int
    count: int
    congestion: int
    highlighted: bool = False
    highlight_reason: Optional[str] = None
    weather_info: Optional[WeatherInfo] = None


class DayWithHours(BaseModel):
    day: str
    hours: List[HourData]
    highlighted: bool = False
    highlight_reason: Optional[str] = None
    weather_info: Optional[WeatherInfo] = None


class GraphRequest(BaseModel):
    place: str
    year: int
    month: int
    action: str
    day: Optional[int] = None  # イベント効果分析用の日付


class EventInfo(BaseModel):
    date: str  # YYYY-MM-DD形式
    title: str


class GraphResponse(BaseModel):
    graph: str
    data: Any
    ai_advice: str
    weather_data: Optional[List[WeatherInfo]] = None
    event_data: Optional[List[EventInfo]] = None  # イベント情報を追加
    # 傾向分析時の追加情報（任意）
    type: Optional[str] = None
    highlighted_info: Optional[Any] = None
    # 先月のデータ（定休日検討系アクション用）
    previous_month_data: Optional[Any] = None
    previous_month_weather_data: Optional[List[WeatherInfo]] = None
    previous_month_event_data: Optional[List[EventInfo]] = None
    previous_year: Optional[int] = None
    previous_month: Optional[int] = None
