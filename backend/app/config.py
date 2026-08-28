import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./mindsense.db')
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # CORS
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173'
    ]
    
    # App
    APP_NAME = 'MINDsense'
    APP_VERSION = '1.0.0'
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    
    # ML Models
    MODEL_DIR = os.path.join(os.path.dirname(__file__), '../ml_training/models')

settings = Settings()
