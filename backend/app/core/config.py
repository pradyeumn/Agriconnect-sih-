from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "agriconnect"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # App
    APP_NAME: str = "AgriConnect"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
