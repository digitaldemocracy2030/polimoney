from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies.auth import get_current_admin_user, get_db

router = APIRouter()


@router.get("/users", response_model=List[schemas.User])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get all users (admin only)
    """
    users = db.query(models.User).options(
        db.joinedload(models.User.role)
    ).offset(skip).limit(limit).all()

    return users


@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get user by ID (admin only)
    """
    user = db.query(models.User).options(
        db.joinedload(models.User.role)
    ).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません"
        )

    return user
