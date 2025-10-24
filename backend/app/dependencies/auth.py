from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.core.auth import AuthService
from app.core.security import verify_token

# JWT Bearer token scheme
security = HTTPBearer()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """
    Dependency to get AuthService instance
    """
    return AuthService(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency to get current authenticated user
    """
    token = credentials.credentials
    user_id = verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return user


def get_current_user_with_role(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency to get current authenticated user with role information
    """
    token = credentials.credentials
    user_id = verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(models.User).options(
        db.joinedload(models.User.role)
    ).filter(models.User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return user


def get_current_admin_user(
    current_user: models.User = Depends(get_current_user_with_role)
) -> models.User:
    """
    Dependency to get current authenticated admin user
    """
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return current_user
