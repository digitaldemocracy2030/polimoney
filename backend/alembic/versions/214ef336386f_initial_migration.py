"""Initial migration with Auth0

Revision ID: 214ef336386f
Revises:
Create Date: 2025-10-24 14:25:39.705075+00:00

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "214ef336386f"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """データベーススキーマをアップグレードする

    初期マイグレーションを実行し、Auth0対応のテーブルとデータを作成する。
    """
    # Create roles table
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    # Create users table (Auth0 integrated)
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("auth0_user_id", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("email_verified", sa.Boolean(), nullable=False, default=False),
        sa.Column("last_login", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("auth0_user_id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("email"),
    )

    # Create political_funds table
    op.create_table(
        "political_funds",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("organization_name", sa.String(length=255), nullable=False),
        sa.Column("organization_type", sa.String(length=100), nullable=False),
        sa.Column("representative_name", sa.String(length=255), nullable=False),
        sa.Column("report_year", sa.Integer(), nullable=False),
        sa.Column("income", sa.BigInteger(), nullable=True),
        sa.Column("expenditure", sa.BigInteger(), nullable=True),
        sa.Column("balance", sa.BigInteger(), nullable=True),
        sa.Column("income_breakdown", sa.Text(), nullable=True),
        sa.Column("expenditure_breakdown", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create election_funds table
    op.create_table(
        "election_funds",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("candidate_name", sa.String(length=255), nullable=False),
        sa.Column("election_type", sa.String(length=100), nullable=False),
        sa.Column("election_area", sa.String(length=255), nullable=False),
        sa.Column("election_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("political_party", sa.String(length=255), nullable=True),
        sa.Column("total_income", sa.BigInteger(), nullable=True),
        sa.Column("total_expenditure", sa.BigInteger(), nullable=True),
        sa.Column("balance", sa.BigInteger(), nullable=True),
        sa.Column("donations", sa.BigInteger(), nullable=True),
        sa.Column("personal_funds", sa.BigInteger(), nullable=True),
        sa.Column("party_support", sa.BigInteger(), nullable=True),
        sa.Column("income_breakdown", sa.Text(), nullable=True),
        sa.Column("expenditure_breakdown", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("(GETDATE())"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_auth0_user_id", "users", ["auth0_user_id"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_username", "users", ["username"])

    # Insert default roles
    op.execute("INSERT INTO roles (name, description) VALUES ('admin', '管理者権限')")
    op.execute("INSERT INTO roles (name, description) VALUES ('user', '一般ユーザー')")


def downgrade() -> None:
    """データベーススキーマをダウングレードする

    初期マイグレーションをロールバックし、作成したテーブルを削除する。
    """
    # Drop tables in reverse order
    op.drop_table("election_funds")
    op.drop_table("political_funds")
    op.drop_table("users")
    op.drop_table("roles")
