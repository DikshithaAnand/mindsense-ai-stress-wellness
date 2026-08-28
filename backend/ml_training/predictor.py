import numpy as np
import joblib
import os
import shap
from typing import Dict, List, Tuple

class StressPredictor:
    """Load and use trained stress prediction model"""
    
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.xgb_model = None
        self.rf_model = None
        self.lr_model = None
        self.label_encoder = None
        self.metrics = None
        self.load_models()
    
    def load_models(self):
        """Load trained models and encoder"""
        try:
            self.xgb_model = joblib.load(os.path.join(self.model_dir, 'xgboost_model.joblib'))
            self.rf_model = joblib.load(os.path.join(self.model_dir, 'random_forest_model.joblib'))
            self.lr_model = joblib.load(os.path.join(self.model_dir, 'logistic_regression_model.joblib'))
            self.label_encoder = joblib.load(os.path.join(self.model_dir, 'label_encoder.joblib'))
            print("✓ All models loaded successfully")
        except Exception as e:
            print(f"Error loading models: {e}")
            raise
    
    def predict(self, sleep_duration: float, screen_time: float) -> Dict:
        """
        Predict stress level using XGBoost model
        
        Args:
            sleep_duration: Hours of sleep
            screen_time: Hours of screen time per day
        
        Returns:
            Dictionary with prediction, probabilities, and metrics
        """
        try:
            # Prepare input
            X = np.array([[sleep_duration, screen_time]])
            
            # Get prediction
            prediction_idx = self.xgb_model.predict(X)[0]
            stress_level = self.label_encoder.inverse_transform([prediction_idx])[0]
            
            # Get probabilities
            probabilities = self.xgb_model.predict_proba(X)[0]
            
            # Create probability dict
            prob_dict = {
                class_name: float(prob)
                for class_name, prob in zip(self.label_encoder.classes_, probabilities)
            }
            
            return {
                'predicted_stress': stress_level,
                'prediction_idx': int(prediction_idx),
                'probabilities': prob_dict,
                'max_probability': float(max(probabilities))
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            raise
    
    def get_shap_explanation(self, sleep_duration: float, screen_time: float) -> Dict:
        """
        Get SHAP explanation for prediction
        
        Args:
            sleep_duration: Hours of sleep
            screen_time: Hours of screen time per day
        
        Returns:
            Dictionary with SHAP values and feature importance
        """
        try:
            X = np.array([[sleep_duration, screen_time]])
            
            # Create SHAP explainer
            explainer = shap.TreeExplainer(self.xgb_model)
            shap_values = explainer.shap_values(X)
            
            # Get base value and feature names
            base_value = explainer.expected_value
            feature_names = ['Sleep Duration (hrs)', 'Screen Time (hrs/day)']
            
            # Create explanation dict
            explanation = {
                'base_value': float(base_value) if isinstance(base_value, np.ndarray) else float(base_value),
                'feature_names': feature_names,
                'feature_values': [float(sleep_duration), float(screen_time)],
                'shap_values': shap_values[0].tolist() if isinstance(shap_values, np.ndarray) else [float(sv) for sv in shap_values[0]],
                'sleep_duration_impact': float(shap_values[0][0]),
                'screen_time_impact': float(shap_values[0][1])
            }
            
            return explanation
        except Exception as e:
            print(f"SHAP explanation error: {e}")
            # Return basic explanation if SHAP fails
            return {
                'base_value': 0,
                'feature_names': ['Sleep Duration (hrs)', 'Screen Time (hrs/day)'],
                'feature_values': [float(sleep_duration), float(screen_time)],
                'sleep_duration_impact': -0.5 if sleep_duration < 6 else 0.5,
                'screen_time_impact': 0.5 if screen_time > 7 else -0.5,
                'error': 'SHAP calculation skipped for demo'
            }
    
    def compare_models(self, sleep_duration: float, screen_time: float) -> Dict:
        """
        Compare predictions from all three models
        
        Args:
            sleep_duration: Hours of sleep
            screen_time: Hours of screen time per day
        
        Returns:
            Dictionary with predictions from all models
        """
        try:
            X = np.array([[sleep_duration, screen_time]])
            
            predictions = {
                'xgboost': self.label_encoder.inverse_transform(
                    [self.xgb_model.predict(X)[0]]
                )[0],
                'random_forest': self.label_encoder.inverse_transform(
                    [self.rf_model.predict(X)[0]]
                )[0],
                'logistic_regression': self.label_encoder.inverse_transform(
                    [self.lr_model.predict(X)[0]]
                )[0]
            }
            
            return predictions
        except Exception as e:
            print(f"Model comparison error: {e}")
            raise
    
    def get_feature_importance(self) -> Dict:
        """
        Get XGBoost feature importance
        
        Returns:
            Dictionary with feature importance scores
        """
        try:
            importance = self.xgb_model.feature_importances_
            feature_names = ['Sleep Duration (hrs)', 'Screen Time (hrs/day)']
            
            return {
                'sleep_duration': float(importance[0]),
                'screen_time': float(importance[1])
            }
        except Exception as e:
            print(f"Feature importance error: {e}")
            return {
                'sleep_duration': 0.5,
                'screen_time': 0.5
            }

# Initialize global predictor
predictor = None

def get_predictor():
    """Get or create predictor instance"""
    global predictor
    if predictor is None:
        predictor = StressPredictor()
    return predictor
