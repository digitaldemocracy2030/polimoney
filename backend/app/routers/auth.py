from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.core.auth import AuthService
from app.dependencies.auth import get_auth_service

router = APIRouter()


@router.post("/signup", response_model=schemas.Token)
async def signup(
    user_data: schemas.UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    User registration endpoint
    """
    try:
        user = auth_service.register_user(user_data)
        access_token = auth_service.create_access_token_for_user(user)

        return schemas.Token(access_token=access_token, token_type="bearer")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー登録に失敗しました"
        )


@router.post("/login", response_model=schemas.Token)
async def login(
    login_data: schemas.UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    User login endpoint
    """
    user = auth_service.authenticate_user(login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token_for_user(user)

    return schemas.Token(access_token=access_token, token_type="bearer")
