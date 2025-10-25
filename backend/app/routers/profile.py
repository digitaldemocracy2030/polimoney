from fastapi import APIRouter, Depends

from app import models, schemas
from app.dependencies.auth import get_current_user_with_role

router = APIRouter()


@router.get("/profile", response_model=schemas.User)
async def get_my_profile(
    current_user: models.User = Depends(get_current_user_with_role),
):
    """現在認証されているユーザーのプロフィールを取得する

    JWTトークンから認証されたユーザーのプロフィール情報を返却する。
    ロール情報も含めて返却される。

    Args:
        current_user (models.User): ロール情報付きの現在認証されているユーザー

    Returns:
        schemas.User: ユーザーのプロフィール情報（ロール情報付き）
    """
    return current_user
