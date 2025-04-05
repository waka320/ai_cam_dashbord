from typing import Dict, List, Union, Optional, Any
from pydantic import BaseModel, Field


class DayCongestion(BaseModel):
    date: int
    congestion: int
    highlighted: bool = False
    highlight_reason: Optional[str] = None


class HourData(BaseModel):
    hour: int
    count: int
    congestion: int
    highlighted: bool = False
    highlight_reason: Optional[str] = None


class DayWithHours(BaseModel):
    day: str
    hours: List[HourData]
    highlighted: bool = False
    highlight_reason: Optional[str] = None


class GraphRequest(BaseModel):
    place: str
    year: int
    month: int
    action: str


class GraphResponse(BaseModel):
    graph: str
    data: Any
    ai_advice: str
