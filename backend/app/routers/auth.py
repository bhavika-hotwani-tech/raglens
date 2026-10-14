"""
Authentication Router.

WHAT: Exposes /auth/register, /auth/login, and /auth/me endpoints.
WHY: Implements user onboarding, secure credential verification, and identity retrieval
     in strict accordance with the API_CONTRACT.md schema.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, AuthResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new enterprise user.
    WHAT: Validates unique email, hashes password, persists User, and returns JWT.
    WHY: Enables self-service user creation with immediate authenticated session.
    """
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An enterprise account with this email address already exists"
        )

    # Hash password with bcrypt
    hashed_pwd = hash_password(payload.password)

    # Create new user entity
    new_user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        hashed_password=hashed_pwd,
        role="Lead AI & Retrieval Engineer",
        organization="Acme Global Defense & Health AI"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate access token containing user identity claims
    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and issues an access token.
    WHAT: Compares bcrypt hash and generates JWT on match.
    WHY: Protects against unauthorized access while returning the signed JWT session.
    """
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user's profile.
    WHAT: Resolves Bearer JWT token into the associated User record.
    WHY: Used by frontend during application reload to restore the session user state.
    """
    return UserResponse.model_validate(current_user)
