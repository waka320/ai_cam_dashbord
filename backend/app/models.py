from typing import Dict, List, Union, Optional, Any
from pydantic import BaseModel, Field


class DayCongestion(BaseModel):
    date: int
    congestion: int


class HourCongestion(BaseModel):
    hour: int
    count_1_hour: float = Field(..., alias="count")
    level: int = Field(..., alias="congestion")


class DayWithHours(BaseModel):
    day: str
    hours: List[Dict[str, Union[int, float]]]


class GraphRequest(BaseModel):
    place: str
    year: int
    month: int
    action: str


class GraphResponse(BaseModel):
    graph: str
    data: Union[List[List[Optional[DayCongestion]]], List[DayWithHours], List[Dict[str, Any]]]
    ai_advice: str
