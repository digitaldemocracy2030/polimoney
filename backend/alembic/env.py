import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# appディレクトリをPythonパスに追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# モデルをインポート
from app.database import Base

# これはAlembic Configオブジェクトで、使用中の.iniファイル内の値へのアクセスを提供します
config = context.config

# Pythonロギング用の設定ファイルを解釈
# この行は基本的にロガーを設定します
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 'autogenerate'サポートのために、モデルのMetaDataオブジェクトをここに追加
target_metadata = Base.metadata

# env.pyの必要性によって定義される、設定からの他の値は以下のように取得できます:
# my_important_option = config.get_main_option("my_important_option")
# ... など


def run_migrations_offline() -> None:
    """オフラインマイグレーションを実行する関数

    データベース接続なしでマイグレーションを実行するための関数。
    主に以下のタスクを実行する：
    - SQLAlchemyのURLを取得
    - マイグレーションコンテキストを設定
    - トランザクション内でマイグレーションを実行

    Returns:
        None: マイグレーションを実行し、スキーマを更新する
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """オンラインマイグレーションを実行する関数

    データベース接続を使用してマイグレーションを実行するための関数。
    主に以下のタスクを実行する：
    - 環境変数または設定からデータベースURLを取得
    - マイグレーションコンテキストを設定
    - トランザクション内でマイグレーションを実行

    Returns:
        None: マイグレーションを実行し、スキーマを更新する
    """
    # 環境変数または設定からデータベースURLを取得
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        # Azure SQL Database用の個別の環境変数へのフォールバック
        database_url = (
            f"mssql+pyodbc://{os.getenv('DATABASE_USER')}:"
            f"{os.getenv('DATABASE_PASSWORD')}@"
            f"{os.getenv('DATABASE_SERVER')}/"
            f"{os.getenv('DATABASE_NAME')}?"
            f"driver={os.getenv('DATABASE_DRIVER')}"
        )

    connectable = engine_from_config(
        {"sqlalchemy.url": database_url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
