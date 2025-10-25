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
    current_user: models.User = Depends(get_current_admin_user),
):
    """政治資金データを新規作成する（管理者専用）

    政治資金収支報告書のデータをデータベースに登録する。
    作成したユーザーのIDを自動的に設定する。

    Args:
        political_funds_data (schemas.PoliticalFundsCreate): 作成する政治資金データ
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        schemas.PoliticalFunds: 作成された政治資金データ

    Raises:
        HTTPException: データ作成に失敗した場合
            - 500: データベースエラー等のサーバーエラー
    """
    try:
        db_political_funds = models.PoliticalFunds(
            user_id=current_user.id, **political_funds_data.model_dump()
        )

        db.add(db_political_funds)
        db.commit()
        db.refresh(db_political_funds)

        return db_political_funds
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="政治資金データの作成に失敗しました",
        )


@router.get("/political-funds", response_model=List[schemas.PoliticalFunds])
async def get_political_funds(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """全政治資金データのリストを取得する（管理者専用）

    ページネーション機能付きで全政治資金データのリストを返却する。

    Args:
        skip (int): スキップするレコード数（デフォルト: 0）
        limit (int): 取得する最大レコード数（デフォルト: 100）
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        List[schemas.PoliticalFunds]: 政治資金データのリスト
    """
    political_funds = db.query(models.PoliticalFunds).offset(skip).limit(limit).all()
    return political_funds


@router.get(
    "/political-funds/{political_funds_id}", response_model=schemas.PoliticalFunds
)
async def get_political_funds_by_id(
    political_funds_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """指定したIDの政治資金データを取得する（管理者専用）

    政治資金データIDを指定して特定のデータを取得する。

    Args:
        political_funds_id (int): 取得する政治資金データのID
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        schemas.PoliticalFunds: 指定された政治資金データ

    Raises:
        HTTPException: 指定されたデータが見つからない場合
            - 404: 政治資金データが存在しない場合
    """
    political_funds = (
        db.query(models.PoliticalFunds)
        .filter(models.PoliticalFunds.id == political_funds_id)
        .first()
    )

    if not political_funds:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="政治資金データが見つかりません",
        )

    return political_funds
