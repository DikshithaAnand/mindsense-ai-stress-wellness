from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionRequest(BaseModel):
    sleep_duration: float = Field(..., gt=0, le=24)
    screen_time: float = Field(..., ge=0, le=24)

class QuestionnaireResponse(BaseModel):
    q1: int = Field(..., ge=0, le=4)
    q2: int = Field(..., ge=0, le=4)
    q3: int = Field(..., ge=0, le=4)
    q4: int = Field(..., ge=0, le=4)
    q5: int = Field(..., ge=0, le=4)

class PredictionWithQuestionnaire(BaseModel):
    sleep_duration: float = Field(..., gt=0, le=24)
    screen_time: float = Field(..., ge=0, le=24)
    questionnaire: Optional[QuestionnaireResponse] = None

class PredictionResponse(BaseModel):
    id: int
    predicted_stress: str
    probability_low: float
    probability_medium: float
    probability_high: float
    max_probability: float
    sleep_duration: float
    screen_time: float
    created_at: datetime
    questionnaire: Optional[QuestionnaireResponse] = None
    
    class Config:
        from_attributes = True

# SHAP Explanation Schemas
class SHAPExplanationResponse(BaseModel):
    id: int
    sleep_duration_impact: float
    screen_time_impact: float
    feature_importance_json: Dict
    base_value: float
    
    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    category: str
    
    class Config:
        from_attributes = True

class RecommendationsListResponse(BaseModel):
    recommendations: List[RecommendationResponse]
    stress_level: str
    overall_priority: str

# History Schemas
class PredictionHistoryItem(BaseModel):
    id: int
    predicted_stress: str
    sleep_duration: float
    screen_time: float
    max_probability: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    total: int
    predictions: List[PredictionHistoryItem]

# Stats Schemas
class StressTrendResponse(BaseModel):
    date: str
    low_count: int
    medium_count: int
    high_count: int
    average_sleep: float
    average_screen_time: float

class UserStatsResponse(BaseModel):
    total_predictions: int
    stress_distribution: Dict[str, int]
    average_sleep_duration: float
    average_screen_time: float
    recent_stress_level: str

# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    status_code: int
