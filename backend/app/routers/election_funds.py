from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.dependencies.auth import get_current_admin_user, get_db

router = APIRouter()


@router.post("/election-funds", response_model=schemas.ElectionFunds)
async def create_election_funds(
    election_funds_data: schemas.ElectionFundsCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Create election funds record (admin only)
    """
    try:
        db_election_funds = models.ElectionFunds(
            user_id=current_user.id,
            **election_funds_data.model_dump()
        )

        db.add(db_election_funds)
        db.commit()
        db.refresh(db_election_funds)

        return db_election_funds
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="選挙資金データの作成に失敗しました"
        )


@router.get("/election-funds", response_model=List[schemas.ElectionFunds])
async def get_election_funds(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get all election funds records (admin only)
    """
    election_funds = db.query(models.ElectionFunds).offset(skip).limit(limit).all()
    return election_funds


@router.get("/election-funds/{election_funds_id}", response_model=schemas.ElectionFunds)
async def get_election_funds_by_id(
    election_funds_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """
    Get election funds record by ID (admin only)
    """
    election_funds = db.query(models.ElectionFunds).filter(
        models.ElectionFunds.id == election_funds_id
    ).first()

    if not election_funds:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="選挙資金データが見つかりません"
        )

    return election_funds
