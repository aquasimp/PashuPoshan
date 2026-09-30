import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "pashuposhan_development_secret_key_change_in_production_32chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # SQLite local file default for easy demo and local run
    DATABASE_URL: str = "sqlite:///./pashuposhan.db"
    
    UPLOAD_DIR: str = "./uploads"
    REPORTS_DIR: str = "./reports"
    
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
