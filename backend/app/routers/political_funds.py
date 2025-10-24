from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies.auth import get_current_admin_user, get_db

router = APIRouter()


@router.post("/political-funds", response_model=schemas.PoliticalFunds)
async def create_political_funds(
    political_funds_data: schemas.PoliticalFundsCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Create political funds record (admin only)
    """
    try:
        db_political_funds = models.PoliticalFunds(
            user_id=current_user.id,
            **political_funds_data.model_dump()
        )

        db.add(db_political_funds)
        db.commit()
        db.refresh(db_political_funds)

        return db_political_funds
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="政治資金データの作成に失敗しました"
        )


@router.get("/political-funds", response_model=List[schemas.PoliticalFunds])
async def get_political_funds(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get all political funds records (admin only)
    """
    political_funds = db.query(models.PoliticalFunds).offset(skip).limit(limit).all()
    return political_funds


@router.get("/political-funds/{political_funds_id}", response_model=schemas.PoliticalFunds)
async def get_political_funds_by_id(
    political_funds_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get political funds record by ID (admin only)
    """
    political_funds = db.query(models.PoliticalFunds).filter(
        models.PoliticalFunds.id == political_funds_id
    ).first()

    if not political_funds:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="政治資金データが見つかりません"
        )

    return political_funds
