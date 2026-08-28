from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Prediction
from app.schemas import UserResponse
from app.auth.utils import AuthUtils
from fastapi import Header
from typing import List

router = APIRouter(prefix='/api/admin', tags=['admin'])

def get_current_admin(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current admin user"""
    if not authorization:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    try:
        token = authorization.split(' ')[1]
    except IndexError:
        raise HTTPException(status_code=401, detail='Invalid token format')
    
    user = AuthUtils.get_user_from_token(token, db)
    if not user or user.role != 'admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    
    return user

@router.get('/stats')
def get_system_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get system statistics"""
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == 'student').count()
    total_predictions = db.query(Prediction).count()
    
    # Stress distribution
    all_predictions = db.query(Prediction).all()
    stress_dist = {
        'Low': sum(1 for p in all_predictions if p.predicted_stress == 'Low'),
        'Medium': sum(1 for p in all_predictions if p.predicted_stress == 'Medium'),
        'High': sum(1 for p in all_predictions if p.predicted_stress == 'High')
    }
    
    return {
        'total_users': total_users,
        'total_students': total_students,
        'total_predictions': total_predictions,
        'stress_distribution': stress_dist
    }

@router.get('/users', response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """List all users"""
    users = db.query(User).filter(User.role == 'student').all()
    return users

@router.get('/model/performance')
def get_model_performance(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    """Get model performance metrics"""
    import json
    import os
    
    metrics_path = 'ml_training/models/model_metrics.json'
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            metrics = json.load(f)
        return metrics
    else:
        return {'error': 'Model metrics not found. Please train the model first.'}
