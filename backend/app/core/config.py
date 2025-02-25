from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8080",
    ]
    AI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    GEMINI_API_KEY: str
    CRON_SECRET: str

    class Config:
        env_file = ".env"


settings = Settings()
