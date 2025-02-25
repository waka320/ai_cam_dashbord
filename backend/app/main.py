from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import root, csv_analysis, fetch_csv, fetch_csv_exmeidai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root.router)
app.include_router(csv_analysis.router)
app.include_router(fetch_csv.router)
app.include_router(fetch_csv_exmeidai.router)
