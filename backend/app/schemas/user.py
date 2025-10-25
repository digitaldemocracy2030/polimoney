from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Role schemas
class RoleBase(BaseModel):
    """ロールの基本スキーマ

    ユーザー権限ロールの共通フィールドを定義するベースクラス。
    """

    name: str
    description: Optional[str] = None


class Role(RoleBase):
    """ロールの完全スキーマ

    ロールの全フィールドを含むレスポンス用スキーマ。
    データベースから取得したロール情報を表現する。
    """

    id: int
    created_at: datetime
    updated_at: datetime


class RoleCreate(RoleBase):
    """ロール作成用スキーマ

    新しいロールを作成するためのリクエスト用スキーマ。
    RoleBaseの全フィールドを継承する。
    """


# User schemas
class UserBase(BaseModel):
    """ユーザーの基本スキーマ

    ユーザー情報の共通フィールドを定義するベースクラス。
    認証やプロフィール表示で使用される基本的なフィールド。
    """

    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """ユーザー作成用スキーマ

    新しいユーザーを作成するためのリクエスト用スキーマ。
    UserBaseのフィールドに加えてパスワードフィールドを含む。
    """

    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """ユーザーログイン用スキーマ

    ユーザーログイン時のリクエストデータを定義するスキーマ。
    メールアドレスとパスワードのみを含む。
    """

    email: EmailStr
    password: str


class User(UserBase):
    """ユーザーの完全スキーマ

    ユーザーの全フィールドを含むレスポンス用スキーマ。
    データベースから取得したユーザー情報を表現する。
    関連するロール情報も含む。
    """

    id: int
    role: Role
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """ユーザー更新用スキーマ

    ユーザー情報を更新するためのリクエスト用スキーマ。
    全てのフィールドがオプションで、更新したいフィールドのみ指定可能。
    """

    username: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None


# Token schemas
class Token(BaseModel):
    """アクセストークンスキーマ

    JWT認証で使用されるアクセストークンを表現するスキーマ。
    認証成功時にクライアントに返却される。
    """

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """トークンデータスキーマ

    JWTトークンのペイロードに含まれるデータを表現するスキーマ。
    トークン検証時に使用される。
    """

    user_id: Optional[int] = None
