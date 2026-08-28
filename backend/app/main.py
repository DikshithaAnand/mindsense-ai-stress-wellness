from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes import auth, predictions, admin
import os

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

# Initialize database
@app.on_event('startup')
def startup():
    """Initialize database on startup"""
    if not os.path.exists('mindsense.db'):
        init_db()

# Include routers
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(admin.router)

# Root endpoint
@app.get('/')
def root():
    return {
        'message': 'MINDsense API',
        'version': settings.APP_VERSION,
        'status': 'running'
    }

@app.get('/health')
def health():
    return {'status': 'healthy'}
