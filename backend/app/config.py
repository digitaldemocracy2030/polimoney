from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """アプリケーション設定

    アプリケーション全体の設定を管理するクラス。
    """

    # Database settings
    database_server: str = Field(..., env="DATABASE_SERVER")
    database_name: str = Field(..., env="DATABASE_NAME")
    database_user: str = Field(..., env="DATABASE_USER")
    database_password: str = Field(..., env="DATABASE_PASSWORD")
    database_driver: str = Field(
        "{ODBC Driver 18 for SQL Server}", env="DATABASE_DRIVER"
    )

    # Or use connection string directly
    database_url: Optional[str] = Field(None, env="DATABASE_URL")

    # Auth0 settings
    auth0_domain: str = Field(..., env="AUTH0_DOMAIN")
    auth0_api_audience: str = Field(..., env="AUTH0_API_AUDIENCE")
    auth0_algorithms: str = Field(..., env="AUTH0_ALGORITHMS")
    auth0_issuer: str = Field(..., env="AUTH0_ISSUER")

    # Application settings
    env: str = Field("development", env="ENV")
    debug: bool = Field(True, env="DEBUG")

    # Server settings
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")

    # CORS settings
    cors_origins: List[str] = Field(
        ["http://localhost:3000", "http://localhost:8080"], env="CORS_ORIGINS"
    )

    class Config:
        """Pydantic設定

        Pydanticの設定クラス。
        """

        env_file = ".env"
        case_sensitive = False

    @property
    def sqlalchemy_database_url(self) -> str:
        """SQLAlchemyデータベースURLを生成する

        Azure SQL Database用の接続文字列を生成する。

        Returns:
            str: SQLAlchemyデータベースURL
        """
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
