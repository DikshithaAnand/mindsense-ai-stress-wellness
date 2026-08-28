from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.schemas import (
    PredictionWithQuestionnaire, PredictionResponse, QuestionnaireResponse,
    SHAPExplanationResponse, RecommendationsListResponse, PredictionHistoryResponse,
    UserStatsResponse, PredictionHistoryItem
)
from app.models import User, Prediction, QuestionnaireResponse as QR, SHAPExplanation, Recommendation
from app.auth.utils import AuthUtils
from ml_training.predictor import get_predictor
import json
from datetime import datetime, timedelta

router = APIRouter(prefix='/api/predictions', tags=['predictions'])

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    if not authorization:
        raise HTTPException(status_code=401, detail='Not authenticated')
    
    try:
        token = authorization.split(' ')[1]
    except IndexError:
        raise HTTPException(status_code=401, detail='Invalid token format')
    
    user = AuthUtils.get_user_from_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid token')
    
    return user

@router.post('/predict', response_model=PredictionResponse)
def predict(request: PredictionWithQuestionnaire, db: Session = Depends(get_db), 
            user: User = Depends(get_current_user)):
    """Make stress prediction"""
    try:
        predictor = get_predictor()
        
        # Get prediction
        prediction_result = predictor.predict(request.sleep_duration, request.screen_time)
        
        # Get SHAP explanation
        shap_explanation = predictor.get_shap_explanation(request.sleep_duration, request.screen_time)
        
        # Save prediction to database
        db_prediction = Prediction(
            user_id=user.id,
            sleep_duration=request.sleep_duration,
            screen_time=request.screen_time,
            predicted_stress=prediction_result['predicted_stress'],
            probability_low=prediction_result['probabilities'].get('Low', 0),
            probability_medium=prediction_result['probabilities'].get('Medium', 0),
            probability_high=prediction_result['probabilities'].get('High', 0),
            max_probability=prediction_result['max_probability']
        )
        db.add(db_prediction)
        db.flush()
        
        # Save questionnaire if provided
        if request.questionnaire:
            q_response = request.questionnaire
            total_score = q_response.q1 + q_response.q2 + q_response.q3 + q_response.q4 + q_response.q5
            db_questionnaire = QR(
                prediction_id=db_prediction.id,
                q1=q_response.q1,
                q2=q_response.q2,
                q3=q_response.q3,
                q4=q_response.q4,
                q5=q_response.q5,
                total_score=total_score
            )
            db.add(db_questionnaire)
        
        # Save SHAP explanation
        db_shap = SHAPExplanation(
            prediction_id=db_prediction.id,
            sleep_duration_impact=shap_explanation['sleep_duration_impact'],
            screen_time_impact=shap_explanation['screen_time_impact'],
            feature_importance_json=shap_explanation,
            base_value=shap_explanation.get('base_value', 0)
        )
        db.add(db_shap)
        
        # Generate and save recommendations
        recommendations_list = generate_recommendations(
            db_prediction.id,
            prediction_result['predicted_stress'],
            request.sleep_duration,
            request.screen_time,
            shap_explanation
        )
        for rec in recommendations_list:
            db.add(rec)
        
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/history', response_model=PredictionHistoryResponse)
def get_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get user's prediction history"""
    predictions = db.query(Prediction).filter(
        Prediction.user_id == user.id
    ).order_by(desc(Prediction.created_at)).all()
    
    history_items = [
        PredictionHistoryItem(
            id=p.id,
            predicted_stress=p.predicted_stress,
            sleep_duration=p.sleep_duration,
            screen_time=p.screen_time,
            max_probability=p.max_probability,
            created_at=p.created_at
        )
        for p in predictions
    ]
    
    return PredictionHistoryResponse(
        total=len(predictions),
        predictions=history_items
    )

@router.get('/{prediction_id}', response_model=PredictionResponse)
def get_prediction(prediction_id: int, db: Session = Depends(get_db), 
                   user: User = Depends(get_current_user)):
    """Get specific prediction"""
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail='Prediction not found')
    
    return prediction

@router.get('/{prediction_id}/shap', response_model=SHAPExplanationResponse)
def get_shap_explanation(prediction_id: int, db: Session = Depends(get_db),
                        user: User = Depends(get_current_user)):
    """Get SHAP explanation for prediction"""
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail='Prediction not found')
    
    shap = db.query(SHAPExplanation).filter(
        SHAPExplanation.prediction_id == prediction_id
    ).first()
    
    if not shap:
        raise HTTPException(status_code=404, detail='SHAP explanation not found')
    
    return shap

@router.get('/{prediction_id}/recommendations', response_model=RecommendationsListResponse)
def get_recommendations(prediction_id: int, db: Session = Depends(get_db),
                       user: User = Depends(get_current_user)):
    """Get recommendations for prediction"""
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id,
        Prediction.user_id == user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail='Prediction not found')
    
    recommendations = db.query(Recommendation).filter(
        Recommendation.prediction_id == prediction_id
    ).all()
    
    # Determine overall priority
    high_count = sum(1 for r in recommendations if r.priority == 'High')
    overall_priority = 'High' if high_count > 0 else 'Medium' if any(r.priority == 'Medium' for r in recommendations) else 'Low'
    
    return RecommendationsListResponse(
        recommendations=recommendations,
        stress_level=prediction.predicted_stress,
        overall_priority=overall_priority
    )

@router.get('/user/stats', response_model=UserStatsResponse)
def get_user_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get user statistics"""
    predictions = db.query(Prediction).filter(
        Prediction.user_id == user.id
    ).all()
    
    if not predictions:
        return UserStatsResponse(
            total_predictions=0,
            stress_distribution={'Low': 0, 'Medium': 0, 'High': 0},
            average_sleep_duration=0,
            average_screen_time=0,
            recent_stress_level='N/A'
        )
    
    # Count stress levels
    stress_dist = {
        'Low': sum(1 for p in predictions if p.predicted_stress == 'Low'),
        'Medium': sum(1 for p in predictions if p.predicted_stress == 'Medium'),
        'High': sum(1 for p in predictions if p.predicted_stress == 'High')
    }
    
    # Calculate averages
    avg_sleep = sum(p.sleep_duration for p in predictions) / len(predictions)
    avg_screen = sum(p.screen_time for p in predictions) / len(predictions)
    
    # Most recent
    recent = max(predictions, key=lambda p: p.created_at)
    
    return UserStatsResponse(
        total_predictions=len(predictions),
        stress_distribution=stress_dist,
        average_sleep_duration=round(avg_sleep, 2),
        average_screen_time=round(avg_screen, 2),
        recent_stress_level=recent.predicted_stress
    )

def generate_recommendations(prediction_id: int, stress_level: str, sleep_duration: float,
                            screen_time: float, shap_explanation: dict) -> list:
    """Generate personalized recommendations"""
    recommendations = []
    
    # Sleep recommendations
    if sleep_duration < 6:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Increase Sleep Duration',
            description='Your sleep duration is below 6 hours. Aim for 7-9 hours per night. Try to sleep at regular times and create a bedtime routine.',
            priority='High',
            category='sleep'
        ))
    elif sleep_duration < 7:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Optimize Sleep Quality',
            description='Try to get closer to 7-9 hours of sleep. Small improvements can significantly reduce stress.',
            priority='Medium',
            category='sleep'
        ))
    
    # Screen time recommendations
    if screen_time > 8:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Reduce Screen Time',
            description='Your screen exposure is high. Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.',
            priority='High',
            category='screen_time'
        ))
    elif screen_time > 6:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Digital Wellness Break',
            description='Consider taking short breaks from screens. Engage in offline activities like reading or exercise.',
            priority='Medium',
            category='screen_time'
        ))
    
    # Stress-specific recommendations
    if stress_level == 'High':
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Practice Mindfulness',
            description='Try 5-10 minute meditation or breathing exercises daily. Apps like Calm or Headspace can help.',
            priority='High',
            category='stress_management'
        ))
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Physical Activity',
            description='Exercise for 30 minutes daily. Even a short walk can reduce stress and improve sleep quality.',
            priority='High',
            category='exercise'
        ))
    elif stress_level == 'Medium':
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Maintain Wellness Routine',
            description='Continue with regular exercise and relaxation activities. Consistency is key.',
            priority='Medium',
            category='stress_management'
        ))
    else:  # Low stress
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Maintain Current Habits',
            description='Great job! Keep up your current sleep and screen time balance. Continue with healthy practices.',
            priority='Low',
            category='general'
        ))
    
    # SHAP-based recommendations
    if shap_explanation.get('sleep_duration_impact', 0) < -0.1:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Sleep Duration is Key Factor',
            description='Increasing your sleep is strongly associated with lower stress. Focus on getting more rest.',
            priority='High',
            category='sleep'
        ))
    
    if shap_explanation.get('screen_time_impact', 0) > 0.1:
        recommendations.append(Recommendation(
            prediction_id=prediction_id,
            title='Screen Time is Increasing Stress',
            description='Reducing screen time could help lower your stress levels. Set daily screen time limits.',
            priority='High',
            category='screen_time'
        ))
    
    # General wellness
    recommendations.append(Recommendation(
        prediction_id=prediction_id,
        title='Connect with Others',
        description='Social interaction and talking to friends or counselors can help manage stress effectively.',
        priority='Low',
        category='general'
    ))
    
    return recommendations
