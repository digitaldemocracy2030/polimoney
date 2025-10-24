from fastapi import APIRouter, Depends

from app import models, schemas
from app.dependencies.auth import get_current_user_with_role

router = APIRouter()


@router.get("/profile", response_model=schemas.User)
async def get_my_profile(
    current_user: models.User = Depends(get_current_user_with_role)
):
    """
    Get current user's profile
    """
    return current_user
