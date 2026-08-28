import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
import os
from datetime import datetime

# Set random seed for reproducibility
np.random.seed(42)

class StressModelTrainer:
    def __init__(self, dataset_path='datasets/student_mental_health.csv'):
        self.dataset_path = dataset_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.le = LabelEncoder()
        self.models = {}
        self.metrics = {}
        self.model_dir = 'models'
        
        # Create models directory if it doesn't exist
        os.makedirs(self.model_dir, exist_ok=True)
    
    def load_data(self):
        """Load and explore dataset"""
        print("\n" + "="*50)
        print("LOADING DATASET")
        print("="*50)
        
        self.df = pd.read_csv(self.dataset_path)
        
        print(f"\nDataset shape: {self.df.shape}")
        print(f"\nColumn names:")
        print(self.df.columns.tolist())
        print(f"\nFirst few rows:")
        print(self.df.head())
        print(f"\nData types:")
        print(self.df.dtypes)
        print(f"\nMissing values:")
        print(self.df.isnull().sum())
        print(f"\nStress Level distribution:")
        print(self.df['Stress Level'].value_counts())
        
        return self.df
    
    def prepare_data(self):
        """Prepare features and target"""
        print("\n" + "="*50)
        print("PREPARING DATA")
        print("="*50)
        
        # Select features
        X = self.df[['Sleep Duration (hrs)', 'Screen Time (hrs/day)']].values
        y = self.df['Stress Level'].values
        
        # Encode target variable
        y_encoded = self.le.fit_transform(y)
        
        print(f"\nClass mapping: {dict(zip(self.le.classes_, range(len(self.le.classes_))))}")
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y_encoded.shape}")
        print(f"\nFeature statistics:")
        print(f"Sleep Duration - Min: {X[:, 0].min():.2f}, Max: {X[:, 0].max():.2f}, Mean: {X[:, 0].mean():.2f}")
        print(f"Screen Time - Min: {X[:, 1].min():.2f}, Max: {X[:, 1].max():.2f}, Mean: {X[:, 1].mean():.2f}")
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        print(f"\nTrain set size: {self.X_train.shape[0]}")
        print(f"Test set size: {self.X_test.shape[0]}")
        print(f"\nTrain distribution: {np.unique(self.y_train, return_counts=True)}")
        print(f"Test distribution: {np.unique(self.y_test, return_counts=True)}")
        
        return self.X_train, self.X_test, self.y_train, self.y_test
    
    def train_xgboost(self):
        """Train XGBoost model"""
        print("\n" + "="*50)
        print("TRAINING XGBOOST MODEL")
        print("="*50)
        
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='mlogloss',
            verbosity=0
        )
        
        model.fit(self.X_train, self.y_train)
        
        # Cross-validation
        cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        print(f"\nCross-validation scores: {cv_scores}")
        print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Predictions
        y_pred = model.predict(self.X_test)
        y_pred_proba = model.predict_proba(self.X_test)
        
        # Metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(self.y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(self.y_test, y_pred, average='weighted', zero_division=0)
        
        print(f"\n--- XGBOOST PERFORMANCE ---")
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(self.y_test, y_pred)
        print(cm)
        print(f"\nClassification Report:")
        print(classification_report(self.y_test, y_pred, target_names=self.le.classes_))
        
        self.models['xgboost'] = model
        self.metrics['xgboost'] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'cv_mean': cv_scores.mean(),
            'confusion_matrix': cm.tolist()
        }
        
        # Save model
        joblib.dump(model, os.path.join(self.model_dir, 'xgboost_model.joblib'))
        print(f"\n✓ XGBoost model saved")
        
        return model
    
    def train_random_forest(self):
        """Train Random Forest model for comparison"""
        print("\n" + "="*50)
        print("TRAINING RANDOM FOREST MODEL (COMPARISON)")
        print("="*50)
        
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(self.X_train, self.y_train)
        
        # Cross-validation
        cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        print(f"\nCross-validation scores: {cv_scores}")
        print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Predictions
        y_pred = model.predict(self.X_test)
        
        # Metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(self.y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(self.y_test, y_pred, average='weighted', zero_division=0)
        
        print(f"\n--- RANDOM FOREST PERFORMANCE ---")
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(self.y_test, y_pred)
        print(cm)
        
        self.models['random_forest'] = model
        self.metrics['random_forest'] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'cv_mean': cv_scores.mean(),
            'confusion_matrix': cm.tolist()
        }
        
        joblib.dump(model, os.path.join(self.model_dir, 'random_forest_model.joblib'))
        print(f"\n✓ Random Forest model saved")
        
        return model
    
    def train_logistic_regression(self):
        """Train Logistic Regression model for comparison"""
        print("\n" + "="*50)
        print("TRAINING LOGISTIC REGRESSION MODEL (COMPARISON)")
        print("="*50)
        
        model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            multi_class='multinomial',
            solver='lbfgs'
        )
        
        model.fit(self.X_train, self.y_train)
        
        # Cross-validation
        cv_scores = cross_val_score(model, self.X_train, self.y_train, cv=5, scoring='accuracy')
        print(f"\nCross-validation scores: {cv_scores}")
        print(f"Mean CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Predictions
        y_pred = model.predict(self.X_test)
        
        # Metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(self.y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(self.y_test, y_pred, average='weighted', zero_division=0)
        
        print(f"\n--- LOGISTIC REGRESSION PERFORMANCE ---")
        print(f"Accuracy:  {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall:    {recall:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(self.y_test, y_pred)
        print(cm)
        
        self.models['logistic_regression'] = model
        self.metrics['logistic_regression'] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'cv_mean': cv_scores.mean(),
            'confusion_matrix': cm.tolist()
        }
        
        joblib.dump(model, os.path.join(self.model_dir, 'logistic_regression_model.joblib'))
        print(f"\n✓ Logistic Regression model saved")
        
        return model
    
    def save_label_encoder(self):
        """Save label encoder"""
        joblib.dump(self.le, os.path.join(self.model_dir, 'label_encoder.joblib'))
        print(f"✓ Label encoder saved")
    
    def save_metrics(self):
        """Save metrics to JSON"""
        metrics_path = os.path.join(self.model_dir, 'model_metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(self.metrics, f, indent=4)
        print(f"✓ Metrics saved to {metrics_path}")
    
    def generate_visualizations(self):
        """Generate visualization plots"""
        print("\n" + "="*50)
        print("GENERATING VISUALIZATIONS")
        print("="*50)
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Model Performance Comparison', fontsize=16, fontweight='bold')
        
        # 1. Accuracy comparison
        models_list = list(self.metrics.keys())
        accuracies = [self.metrics[m]['accuracy'] for m in models_list]
        axes[0, 0].bar(models_list, accuracies, color=['#5fc3d0', '#7fb3d5', '#a39ddb'])
        axes[0, 0].set_title('Model Accuracy', fontweight='bold')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].set_ylim([0, 1])
        for i, v in enumerate(accuracies):
            axes[0, 0].text(i, v + 0.02, f'{v:.3f}', ha='center')
        
        # 2. F1-Score comparison
        f1_scores = [self.metrics[m]['f1_score'] for m in models_list]
        axes[0, 1].bar(models_list, f1_scores, color=['#5fc3d0', '#7fb3d5', '#a39ddb'])
        axes[0, 1].set_title('Model F1-Score', fontweight='bold')
        axes[0, 1].set_ylabel('F1-Score')
        axes[0, 1].set_ylim([0, 1])
        for i, v in enumerate(f1_scores):
            axes[0, 1].text(i, v + 0.02, f'{v:.3f}', ha='center')
        
        # 3. Confusion Matrix - XGBoost
        cm_xgb = np.array(self.metrics['xgboost']['confusion_matrix'])
        sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Blues', ax=axes[1, 0],
                    xticklabels=self.le.classes_, yticklabels=self.le.classes_)
        axes[1, 0].set_title('XGBoost Confusion Matrix', fontweight='bold')
        axes[1, 0].set_ylabel('True Label')
        axes[1, 0].set_xlabel('Predicted Label')
        
        # 4. Feature Distribution
        axes[1, 1].scatter(self.X_test[:, 0], self.X_test[:, 1], 
                          c=self.y_test, cmap='viridis', alpha=0.6, s=50)
        axes[1, 1].set_title('Test Data: Sleep vs Screen Time', fontweight='bold')
        axes[1, 1].set_xlabel('Sleep Duration (hrs)')
        axes[1, 1].set_ylabel('Screen Time (hrs/day)')
        axes[1, 1].legend(handles=[plt.scatter([], [], c=c, label=self.le.classes_[i], s=50)
                                   for i, c in enumerate(['#1f77b4', '#ff7f0e', '#2ca02c'])])
        
        plt.tight_layout()
        viz_path = os.path.join(self.model_dir, 'model_performance.png')
        plt.savefig(viz_path, dpi=300, bbox_inches='tight')
        print(f"✓ Visualization saved to {viz_path}")
        plt.close()
    
    def train_all(self):
        """Run complete training pipeline"""
        print("\n\n" + "#"*60)
        print("#" + " "*58 + "#")
        print("#" + "  MINDSENSE - STRESS PREDICTION MODEL TRAINING".center(58) + "#")
        print("#" + " "*58 + "#")
        print("#"*60 + "\n")
        
        # Load and prepare data
        self.load_data()
        self.prepare_data()
        
        # Train all models
        self.train_xgboost()
        self.train_random_forest()
        self.train_logistic_regression()
        
        # Save artifacts
        self.save_label_encoder()
        self.save_metrics()
        self.generate_visualizations()
        
        # Summary
        print("\n" + "="*50)
        print("TRAINING SUMMARY")
        print("="*50)
        print(f"\nBest Model: XGBoost")
        print(f"Accuracy: {self.metrics['xgboost']['accuracy']:.4f}")
        print(f"All models saved in: {self.model_dir}/")
        print(f"\nModel files:")
        print(f"  - xgboost_model.joblib")
        print(f"  - random_forest_model.joblib")
        print(f"  - logistic_regression_model.joblib")
        print(f"  - label_encoder.joblib")
        print(f"  - model_metrics.json")
        print(f"  - model_performance.png")
        print("\n✓ Training complete!\n")

if __name__ == '__main__':
    trainer = StressModelTrainer()
    trainer.train_all()
