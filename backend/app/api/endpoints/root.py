from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Hello World from FastAPI~~~"}


@router.get("/api/data")
async def get_data():
    data = [1, 2, 3]
    if settings.SECRET_KEY:
        print(f"SECRET_KEY is: {settings.SECRET_KEY}")
    else:
        print("SECRET_KEY is not set.")
    return {"data": data}
