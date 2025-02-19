from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8080",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
