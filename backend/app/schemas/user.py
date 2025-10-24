from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# Role schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class Role(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime


class RoleCreate(RoleBase):
    pass


# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    role: Role
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
