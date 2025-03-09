from pydantic import BaseModel
from typing import List, Optional


class DayCongestion(BaseModel):
    date: int
    congestion: int


class GraphRequest(BaseModel):
    place: str
    year: int
    month: int
    action: str


class GraphResponse(BaseModel):
    graph: str
    data: List[List[Optional[DayCongestion]]]
    ai_advice: Optional[str] = None  # AIアドバイスフィールドを追加
