from sqlalchemy.orm import Session
from app.models import User
from app.auth.utils import AuthUtils
from app.schemas import UserRegister

def create_user(db: Session, user_data: UserRegister) -> User:
    """Create new user"""
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        return None
    
    # Create new user
    hashed_password = AuthUtils.hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role='student'
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate user"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    if not AuthUtils.verify_password(password, user.password_hash):
        return None
    
    return user

def create_admin(email: str = 'admin@mindsense.com', password: str = 'admin123'):
    """Create admin user (run once)"""
    from app.database import SessionLocal
    
    db = SessionLocal()
    existing_admin = db.query(User).filter(User.email == email).first()
    
    if existing_admin:
        print(f"Admin user already exists: {email}")
        return
    
    hashed_password = AuthUtils.hash_password(password)
    admin_user = User(
        email=email,
        password_hash=hashed_password,
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    
    db.add(admin_user)
    db.commit()
    print(f"\u2713 Admin user created: {email}")
    print(f"Default password: {password}")
    print("IMPORTANT: Change the default password immediately!")
    db.close()

if __name__ == '__main__':
    create_admin()
