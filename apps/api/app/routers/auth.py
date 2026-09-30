from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from apps.api.app.database import get_db
from apps.api.app.models.user import User
from apps.api.app.security import verify_password, create_access_token, create_refresh_token
from apps.api.app.dependencies import get_current_user, log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserSummary(BaseModel):
    id: str
    email: str
    full_name: str
    phone: str | None = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserSummary


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    log_audit(
        db=db,
        user_id=user.id,
        action="user_login",
        entity_type="user",
        entity_id=user.id,
        details={"email": user.email, "role": user.role.name}
    )

    user_summary = UserSummary(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role.name,
        is_active=user.is_active,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_summary
    )


@router.get("/me", response_model=UserSummary)
def get_me(current_user: User = Depends(get_current_user)):
    return UserSummary(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role.name,
        is_active=current_user.is_active,
    )
