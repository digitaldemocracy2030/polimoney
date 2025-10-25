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
    current_user: models.User = Depends(get_current_admin_user),
):
    """選挙資金データを新規作成する（管理者専用）

    選挙運動費用収支報告書のデータをデータベースに登録する。
    作成したユーザーのIDを自動的に設定する。

    Args:
        election_funds_data (schemas.ElectionFundsCreate): 作成する選挙資金データ
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        schemas.ElectionFunds: 作成された選挙資金データ

    Raises:
        HTTPException: データ作成に失敗した場合
            - 500: データベースエラー等のサーバーエラー
    """
    try:
        db_election_funds = models.ElectionFunds(
            user_id=current_user.id, **election_funds_data.model_dump()
        )

        db.add(db_election_funds)
        db.commit()
        db.refresh(db_election_funds)

        return db_election_funds
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="選挙資金データの作成に失敗しました",
        )


@router.get("/election-funds", response_model=List[schemas.ElectionFunds])
async def get_election_funds(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """全選挙資金データのリストを取得する（管理者専用）

    ページネーション機能付きで全選挙資金データのリストを返却する。

    Args:
        skip (int): スキップするレコード数（デフォルト: 0）
        limit (int): 取得する最大レコード数（デフォルト: 100）
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        List[schemas.ElectionFunds]: 選挙資金データのリスト
    """
    election_funds = db.query(models.ElectionFunds).offset(skip).limit(limit).all()
    return election_funds


@router.get("/election-funds/{election_funds_id}", response_model=schemas.ElectionFunds)
async def get_election_funds_by_id(
    election_funds_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """指定したIDの選挙資金データを取得する（管理者専用）

    選挙資金データIDを指定して特定のデータを取得する。

    Args:
        election_funds_id (int): 取得する選挙資金データのID
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        schemas.ElectionFunds: 指定された選挙資金データ

    Raises:
        HTTPException: 指定されたデータが見つからない場合
            - 404: 選挙資金データが存在しない場合
    """
    election_funds = (
        db.query(models.ElectionFunds)
        .filter(models.ElectionFunds.id == election_funds_id)
        .first()
    )

    if not election_funds:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="選挙資金データが見つかりません",
        )

    return election_funds
