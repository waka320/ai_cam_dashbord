from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Hello World from FastAPI~~~"}


@router.get("/api/data")
async def get_data():
    data = [1, 2, 3]
    return {"data": data}
