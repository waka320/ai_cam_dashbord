from pydantic import BaseModel
from typing import List, Optional


class GraphRequest(BaseModel):
    place: str
    action: str
    year: int
    month: int


class DayCongestion(BaseModel):
    date: int
    congestion: int


class GraphResponse(BaseModel):
    graph: str
    data: List[List[Optional[DayCongestion]]]
