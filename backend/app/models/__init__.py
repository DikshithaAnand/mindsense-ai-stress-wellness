from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, default='student')  # 'student' or 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    predictions = relationship('Prediction', back_populates='user')
    audit_logs = relationship('AuditLog', back_populates='user')

class Prediction(Base):
    __tablename__ = 'predictions'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    sleep_duration = Column(Float)  # hours
    screen_time = Column(Float)  # hours/day
    predicted_stress = Column(String)  # Low, Medium, High
    probability_low = Column(Float)
    probability_medium = Column(Float)
    probability_high = Column(Float)
    max_probability = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='predictions')
    questionnaire = relationship('QuestionnaireResponse', back_populates='prediction', uselist=False)
    shap_explanation = relationship('SHAPExplanation', back_populates='prediction', uselist=False)
    recommendations = relationship('Recommendation', back_populates='prediction')

class QuestionnaireResponse(Base):
    __tablename__ = 'questionnaire_responses'
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey('predictions.id'))
    q1 = Column(Integer)  # 0-4 scale
    q2 = Column(Integer)
    q3 = Column(Integer)
    q4 = Column(Integer)
    q5 = Column(Integer)
    total_score = Column(Integer)  # Sum of all questions
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    prediction = relationship('Prediction', back_populates='questionnaire')

class SHAPExplanation(Base):
    __tablename__ = 'shap_explanations'
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey('predictions.id'))
    sleep_duration_impact = Column(Float)
    screen_time_impact = Column(Float)
    feature_importance_json = Column(JSON)
    base_value = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    prediction = relationship('Prediction', back_populates='shap_explanation')

class Recommendation(Base):
    __tablename__ = 'recommendations'
    
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey('predictions.id'))
    title = Column(String)
    description = Column(Text)
    priority = Column(String)  # 'High', 'Medium', 'Low'
    category = Column(String)  # 'sleep', 'screen_time', 'stress_management', etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    prediction = relationship('Prediction', back_populates='recommendations')

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    action = Column(String)  # 'login', 'prediction', 'logout', etc.
    details = Column(String)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship('User', back_populates='audit_logs')
