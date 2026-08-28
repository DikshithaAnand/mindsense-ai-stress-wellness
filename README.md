# MINDsense - AI-Based Student Stress Estimation & Wellness Recommendation System

## 🧠 Project Overview

MINDsense is an intelligent wellness support system designed for students. It uses machine learning (XGBoost) to estimate stress levels based on sleep duration and screen time, then provides personalized wellness recommendations.

### ⚠️ Disclaimer
**MINDsense is an educational wellness-support system and is not a medical diagnostic tool. Always consult healthcare professionals for mental health concerns.**

---

## 🎨 Features

✅ **ML-Powered Stress Prediction** - XGBoost model trained on real student data
✅ **Sleep & Screen Time Analysis** - Key stress indicators
✅ **5-Question Stress Questionnaire** - Quick wellness check-in
✅ **SHAP Explainability** - Understand how predictions are made
✅ **Model Probability Scores** - Confidence levels for each stress category
✅ **Personalized Recommendations** - Priority-based wellness tips
✅ **Calming UI Theme** - "Midnight Calm" premium design
✅ **Assessment History & Trends** - Track mental wellness over time
✅ **Secure Authentication** - User registration & login
✅ **Role-Based Access** - Student & Admin dashboards
✅ **Responsive Design** - Mobile, tablet, desktop support

---

## 🏗️ Tech Stack

### Frontend
- **React** 18.x
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Recharts** for data visualization
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **SQLite/PostgreSQL** - Database
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### ML/Data
- **XGBoost** - Main prediction model
- **Scikit-learn** - Random Forest comparison model
- **SHAP** - Model explainability
- **Pandas & NumPy** - Data processing
- **Matplotlib & Seaborn** - Visualization

---

## 📦 Project Structure

```
mindsense-ai-stress-wellness/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routes/           # API endpoints
│   │   ├── auth/             # Authentication logic
│   │   ├── ml/               # ML model & SHAP
│   │   └── utils/
│   ├── ml_training/          # Model training scripts
│   ├── datasets/             # CSV data
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── .gitignore
└── SETUP.md                  # Detailed setup guide
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

### 1️⃣ Clone Repository
```bash
git clone https://github.com/DikshithaAnand/mindsense-ai-stress-wellness.git
cd mindsense-ai-stress-wellness
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Train ML model
python ml_training/train_model.py

# Initialize database
python -c "from app.database import init_db; init_db()"

# Create admin user
python -c "from app.auth.admin import create_admin; create_admin()"

# Start backend
python run.py
```

Backend runs on: `http://localhost:8000`

### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📊 Dataset Information

**Source:** Kaggle - Student Mental Health Analysis During Online Learning

**Key Columns Used:**
- `Sleep Duration (hrs)` - Sleep per night (target feature)
- `Screen Time (hrs/day)` - Daily screen exposure (target feature)
- `Stress Level` - Target variable (Low/Medium/High)

**Total Records:** 1000 student assessments

---

## 🤖 ML Model Details

### Model: XGBoost
- **Features:** Sleep Duration, Screen Time
- **Target:** Stress Level (Low/Medium/High)
- **Training:** 80-20 split
- **Validation:** Cross-validation with 5 folds

### Model Comparison
- XGBoost vs Random Forest vs Logistic Regression
- Metrics: Accuracy, Precision, Recall, F1-Score, Confusion Matrix

### SHAP Explainability
- Feature importance for each prediction
- SHAP force plots showing impact of Sleep & Screen Time
- Decision tree visualizations

---

## 🎯 User Flow

1. **Register/Login** → Create account with email & password
2. **Dashboard** → View quick stats and recent assessments
3. **Quick Assessment** → Enter Sleep Duration & Screen Time
4. **Stress Questionnaire** → Optional 5-question check-in
5. **ML Prediction** → Get stress level (Low/Medium/High)
6. **Probability Scores** → See confidence for each category
7. **SHAP Explanation** → Understand prediction factors
8. **Recommendations** → Get personalized wellness tips
9. **Relax & Reset** → Soothing breathing/nature animation
10. **History & Trends** → Track wellness over time

---

## 🔐 Authentication & Authorization

### Security Features
- Password hashing with Bcrypt
- JWT token-based authentication
- Protected routes (student & admin only)
- Secure HTTP-only cookies
- CORS protection
- Input validation & sanitization

### Roles
- **Student:** Can assess stress, view own data
- **Admin:** Can view system stats, user management

---

## 🎨 UI Theme: "Midnight Calm"

**Color Palette:**
- Primary: `#0f1a2e` (Deep Midnight Navy)
- Secondary: `#e8d5f2` (Soft Lavender)
- Accent: `#5fc3d0` (Muted Teal)
- Background: `#1a2540` (Dark Blue-Gray)
- Text: `#e8e8e8` (Soft White)

**Design Elements:**
- Rounded corners (12-16px)
- Subtle shadows & gradients
- Smooth transitions
- Clean typography (Inter/Poppins)
- Responsive grid layout

---

## 📱 API Endpoints

### Public
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### Student
- `POST /api/predictions/predict` - Get stress prediction
- `GET /api/predictions/history` - Assessment history
- `GET /api/predictions/{id}/shap` - SHAP explanation
- `GET /api/recommendations/{prediction_id}` - Get recommendations
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/model/performance` - Model metrics

---

## 📈 Database Schema

### Users Table
- id, email, password_hash, first_name, last_name, role, created_at, updated_at

### Predictions Table
- id, user_id, sleep_duration, screen_time, predicted_stress, probability_low, probability_medium, probability_high, created_at

### QuestionnaireResponses Table
- id, prediction_id, q1, q2, q3, q4, q5, total_score

### Recommendations Table
- id, prediction_id, title, description, priority, category, created_at

### SHAP Explanations Table
- id, prediction_id, sleep_duration_impact, screen_time_impact, feature_importance_json

### AuditLogs Table
- id, user_id, action, details, created_at

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm test
```

---

## 📝 Environment Variables

**Backend (.env)**
```
DATABASE_URL=sqlite:///./mindsense.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:5173"]
```

---

## 🤝 Contributing

This is an educational project. Feel free to fork, modify, and learn!

---

## 📄 License

MIT License - Free for educational use

---

## 👨‍💻 Author

**Dikshitha Anand**
Final Year Engineering Student

---

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub Issue
- Email: your-email@example.com
- Documentation: See SETUP.md

---

## 🙏 Acknowledgments

- Kaggle dataset by Utkarsh Sharma
- XGBoost & SHAP documentation
- React & FastAPI communities

---

**Made with ❤️ for student wellness**
