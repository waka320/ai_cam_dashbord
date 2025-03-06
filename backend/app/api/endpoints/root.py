from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://test.ryo-univ.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@router.get("/")
async def root():
    return {"message": "Hello World from FastAPI~~~"}


@router.get("/api/data")
async def get_data():
    data = [1, 2, 3]
    return {"data": data}
