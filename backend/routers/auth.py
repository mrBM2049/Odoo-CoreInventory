from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, UserResponse
from auth import get_password_hash, verify_password, create_access_token, verify_token

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

@router.post("/signup", response_model=UserResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pass = get_password_hash(user_data.password)
    new_user = User(
        id=str(uuid.uuid4()),
        full_name=user_data.full_name,
        email=user_data.email,
        password=hashed_pass
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "full_name": user.full_name})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(user_info: dict = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_info["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
