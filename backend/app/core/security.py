from datetime import datetime, timedelta
from typing import Optional
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_password_hash(password: str) -> str:
    """
    Create password hash using SHA256 + bcrypt for Go compatibility
    """
    # First hash with SHA256 (for Go compatibility)
    salt = settings.password_salt
    sha256_hash = hashlib.sha256((password + salt).encode()).hexdigest()

    # Then hash with bcrypt
    return pwd_context.hash(sha256_hash)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash
    """
    # First hash the plain password with SHA256
    salt = settings.password_salt
    sha256_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()

    # Then verify with bcrypt
    return pwd_context.verify(sha256_hash, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create JWT access token
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
    """
    Verify JWT token and return user_id if valid
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None
