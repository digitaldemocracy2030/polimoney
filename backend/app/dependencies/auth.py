from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.core.auth import AuthService
from app.core.security import verify_token
from app.database import get_db

# JWT Bearer token scheme
security = HTTPBearer()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """AuthServiceインスタンスを取得する依存関数

    データベースセッションを注入してAuthServiceの新しいインスタンスを作成する。
    FastAPIの依存性注入で認証サービスを利用する場合に使用する。

    Args:
        db (Session): データベースセッション（依存性注入で自動提供）

    Returns:
        AuthService: 初期化されたAuthServiceインスタンス
    """
    return AuthService(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    """現在認証されているユーザーを取得する依存関数

    AuthorizationヘッダーからBearerトークンを抽出し、
    JWTを検証してユーザーIDを取得し、データベースからユーザー情報を取得する。
    トークンが無効な場合やユーザーが見つからない場合はHTTPエラーを発生させる。

    Args:
        credentials (HTTPAuthorizationCredentials): Bearerトークン認証情報
        db (Session): データベースセッション

    Returns:
        models.User: 認証されたユーザーオブジェクト

    Raises:
        HTTPException: トークンが無効な場合やユーザーが見つからない場合、
                      またはユーザーが非アクティブな場合
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
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


def get_current_user_with_role(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    """ロール情報付きで現在認証されているユーザーを取得する依存関数

    AuthorizationヘッダーからBearerトークンを抽出し、
    JWTを検証してユーザーIDを取得し、データベースからユーザー情報と
    関連するロール情報を取得する。
    トークンが無効な場合やユーザーが見つからない場合はHTTPエラーを発生させる。

    Args:
        credentials (HTTPAuthorizationCredentials): Bearerトークン認証情報
        db (Session): データベースセッション

    Returns:
        models.User: ロール情報付きの認証されたユーザーオブジェクト

    Raises:
        HTTPException: トークンが無効な場合やユーザーが見つからない場合、
                      またはユーザーが非アクティブな場合
    """
    token = credentials.credentials
    user_id = verify_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = (
        db.query(models.User)
        .options(db.joinedload(models.User.role))
        .filter(models.User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    return user


def get_current_admin_user(
    current_user: models.User = Depends(get_current_user_with_role),
) -> models.User:
    """現在認証されている管理者ユーザーを取得する依存関数

    現在のユーザーが管理者権限を持っているかを確認し、
    管理者権限がない場合はHTTP 403エラーを発生させる。
    管理者権限がある場合はそのままユーザーオブジェクトを返す。

    Args:
        current_user (models.User): ロール情報付きの認証されたユーザー

    Returns:
        models.User: 管理者権限を持つ認証されたユーザーオブジェクト

    Raises:
        HTTPException: ユーザーが管理者権限を持っていない場合
    """
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    return current_user
