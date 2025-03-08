from typing import List
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ALLOWED_ORIGINS: List[str] = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        "https://ai-cam-dashbord.vercel.app/",
        "https://54.146.178.210:8000",
        "https://54.146.178.210",
        "https://test.ryo-univ.com/",
    ]
    CORS_ORIGINS: List[str] = ALLOWED_ORIGINS
    AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    GEMINI_API_KEY: str
    CRON_SECRET: str
    AWS_ACCSESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
