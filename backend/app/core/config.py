from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: List[str] = [
        "https://ai-cam-dashbord.vercel.app",
        "https://ai-camera.lab.mdg-meidai.com",
        "http://localhost:3000"
    ]
    CORS_ORIGINS: List[str] = ALLOWED_ORIGINS
    AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    GEMINI_API_KEY: str
    CRON_SECRET: str
    AWS_ACCSESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # 追加の環境変数を無視


settings = Settings()
