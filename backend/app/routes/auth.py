from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserRegister, UserLogin, Token, UserResponse
from app.auth.crud import create_user, authenticate_user
from app.auth.utils import AuthUtils
from datetime import timedelta

router = APIRouter(prefix='/api/auth', tags=['auth'])

@router.post('/register', response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user"""
    user = create_user(db, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Email already registered'
        )
    return user

@router.post('/login', response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password'
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = AuthUtils.create_access_token(
        data={'sub': user.id},
        expires_delta=access_token_expires
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_id': user.id,
        'role': user.role
    }

@router.post('/logout')
def logout():
    """Logout user (token invalidation handled on frontend)"""
    return {'message': 'Logged out successfully'}
