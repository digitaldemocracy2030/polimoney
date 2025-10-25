import hashlib
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_password_hash(password: str) -> str:
    """SHA256とbcryptを使用してパスワードハッシュを作成する

    Goとの互換性のため、まずSHA256でハッシュ化した後、
    bcryptでさらにハッシュ化する2段階のハッシュ化を行う。

    Args:
        password (str): ハッシュ化するパスワード（平文）

    Returns:
        str: bcryptでハッシュ化されたパスワード文字列
    """
    # First hash with SHA256 (for Go compatibility)
    salt = settings.password_salt
    sha256_hash = hashlib.sha256((password + salt).encode()).hexdigest()

    # Then hash with bcrypt
    return pwd_context.hash(sha256_hash)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """平文パスワードをハッシュと照合する

    SHA256で平文パスワードをハッシュ化した後、
    bcryptで保存されたハッシュと照合する。

    Args:
        plain_password (str): 照合する平文パスワード
        hashed_password (str): 保存されたハッシュ化されたパスワード

    Returns:
        bool: パスワードが一致すればTrue、そうでなければFalse
    """
    # First hash the plain password with SHA256
    salt = settings.password_salt
    sha256_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()

    # Then verify with bcrypt
    return pwd_context.verify(sha256_hash, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWTアクセストークンを作成する

    指定されたデータをペイロードに含むJWTトークンを生成する。
    有効期限が指定されない場合は、設定されたデフォルトの有効期間を使用する。

    Args:
        data (dict): JWTペイロードに含めるデータ
        expires_delta (Optional[timedelta]): トークンの有効期間。
                                           指定されない場合は設定値を使用

    Returns:
        str: 生成されたJWTトークン文字列
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")
    return encoded_jwt


def verify_token(token: str) -> Optional[int]:
    """JWTトークンを検証し、有効な場合はユーザーIDを返す

    JWTトークンをデコードし、署名を検証する。
    有効な場合はペイロードからユーザーIDを抽出して返す。

    Args:
        token (str): 検証するJWTトークン

    Returns:
        Optional[int]: トークンが有効な場合はユーザーID、無効な場合はNone
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None
