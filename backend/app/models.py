from typing import List, Optional, Any
from pydantic import BaseModel


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


class GraphResponse(BaseModel):
    graph: str
    data: Any
    ai_advice: str
    weather_data: Optional[List[WeatherInfo]] = None
    # 傾向分析時の追加情報（任意）
    type: Optional[str] = None
    highlighted_info: Optional[Any] = None
