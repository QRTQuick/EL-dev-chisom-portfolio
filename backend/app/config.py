import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Firebase Configuration
    FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
    
    # GitHub Configuration
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_USERNAME = "QRTQuick"
    
    # Email Configuration
    EMAIL_SERVICE_KEY = os.getenv("EMAIL_SERVICE_KEY")
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    EMAIL_FROM = os.getenv("EMAIL_FROM", "chisomlifeeke@gmail.com")
    
    # Database Configuration
    SQLITE_DATABASE_URL = "sqlite:///./portfolio.db"
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour

settings = Settings()