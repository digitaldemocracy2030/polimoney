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
    current_user: models.User = Depends(get_current_admin_user),
):
    """全ユーザーの一覧を取得する（管理者専用）

    ページネーション機能付きで全ユーザーのリストを返却する。
    ロール情報も同時に取得する。

    Args:
        skip (int): スキップするレコード数（デフォルト: 0）
        limit (int): 取得する最大レコード数（デフォルト: 100）
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        List[schemas.User]: ユーザー情報のリスト（ロール情報付き）
    """
    users = (
        db.query(models.User)
        .options(db.joinedload(models.User.role))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return users


@router.get("/users/{user_id}", response_model=schemas.User)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user),
):
    """指定したIDのユーザーを取得する（管理者専用）

    ユーザーIDを指定して特定のユーザー情報を取得する。
    ロール情報も同時に取得する。

    Args:
        user_id (int): 取得するユーザーのID
        db (Session): データベースセッション
        current_user (models.User): 管理者権限を持つ現在認証されているユーザー

    Returns:
        schemas.User: 指定されたユーザーの情報（ロール情報付き）

    Raises:
        HTTPException: 指定されたユーザーが見つからない場合
            - 404: ユーザーが存在しない場合
    """
    user = (
        db.query(models.User)
        .options(db.joinedload(models.User.role))
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
        )

    return user
