from sqlalchemy.orm import Session
from app.database import get_db


def get_database_session() -> Session:
    """
    Alias for get_db to make it clearer in dependencies
    """
    return next(get_db())
