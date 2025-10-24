from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database settings
    database_server: str = "your-server.database.windows.net"
    database_name: str = "your-database-name"
    database_user: str = "your-username"
    database_password: str = "your-password"
    database_driver: str = "{ODBC Driver 18 for SQL Server}"

    # Or use connection string directly
    database_url: Optional[str] = None

    # Security settings
    jwt_secret: str = "your_jwt_secret_key_here"
    password_salt: str = "your_password_salt_here"
    jwt_expiration_hours: int = 24

    # Application settings
    env: str = "development"
    debug: bool = True

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS settings
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Optional admin user creation
    admin_username: str = "admin"
    admin_email: str = "admin@example.com"
    admin_password: str = "admin123"

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def sqlalchemy_database_url(self) -> str:
        """Generate SQLAlchemy database URL for Azure SQL Database"""
        if self.database_url:
            return self.database_url

        # Build connection string for Azure SQL Database
        return (
            f"mssql+pyodbc://{self.database_user}:{self.database_password}@"
            f"{self.database_server}/{self.database_name}?"
            f"driver={self.database_driver}"
        )


# Global settings instance
settings = Settings()
