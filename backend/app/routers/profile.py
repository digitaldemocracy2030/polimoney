from fastapi import APIRouter, Security

from app.utils.verify import VerifyToken

router = APIRouter()
auth = VerifyToken()


@router.get("/profile")
async def get_my_profile(auth_result: dict = Security(auth.verify)):
    """認証が成功していることを確認するエンドポイント

    JWTトークンの検証が成功した場合、デコードされたトークンペイロードを返却する。
    データベース接続は行わず、認証の確認のみを行う。

    Args:
        auth_result (dict): 検証済みのJWTトークンペイロード

    Returns:
        dict: JWTトークンのペイロード（iss, sub, aud, iat, expなど）
    """
    return auth_result
