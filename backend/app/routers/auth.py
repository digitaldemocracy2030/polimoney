from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas
from app.core.auth import AuthService
from app.dependencies.auth import get_auth_service

router = APIRouter()


@router.post("/signup", response_model=schemas.Token)
async def signup(
    user_data: schemas.UserCreate, auth_service: AuthService = Depends(get_auth_service)
):
    """新規ユーザー登録エンドポイント

    ユーザー情報を検証し、新しいアカウントを作成する。
    登録成功時はJWTアクセストークンを返却する。

    Args:
        user_data (schemas.UserCreate): ユーザー作成データ
        auth_service (AuthService): 認証サービスインスタンス

    Returns:
        schemas.Token: JWTアクセストークン

    Raises:
        HTTPException: ユーザー登録に失敗した場合
            - 400: メールアドレスまたはユーザー名が既に存在する場合
            - 500: サーバーエラー
    """
    try:
        user = auth_service.register_user(user_data)
        access_token = auth_service.create_access_token_for_user(user)

        return schemas.Token(access_token=access_token, token_type="bearer")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー登録に失敗しました",
        )


@router.post("/login", response_model=schemas.Token)
async def login(
    login_data: schemas.UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    """ユーザーログインエンドポイント

    メールアドレスとパスワードでユーザーを認証し、
    認証成功時はJWTアクセストークンを返却する。

    Args:
        login_data (schemas.UserLogin): ログイン情報（メールアドレスとパスワード）
        auth_service (AuthService): 認証サービスインスタンス

    Returns:
        schemas.Token: JWTアクセストークン

    Raises:
        HTTPException: ログインに失敗した場合
            - 401: メールアドレスまたはパスワードが正しくない場合
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
