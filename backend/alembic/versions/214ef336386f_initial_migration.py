"""Initial migration

Revision ID: 214ef336386f
Revises:
Create Date: 2025-10-24 14:25:39.705075+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '214ef336386f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """データベーススキーマをアップグレードする

    初期マイグレーションを実行し、必要なテーブルとデータを作成する。
    """
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('email_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    # Create user_sessions table
    op.create_table('user_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token')
    )

    # Create login_attempts table
    op.create_table('login_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('attempted_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create password_reset_tokens table
    op.create_table('password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )

    # Create political_funds table
    op.create_table('political_funds',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('organization_name', sa.String(length=255), nullable=False),
        sa.Column('organization_type', sa.String(length=100), nullable=False),
        sa.Column('representative_name', sa.String(length=255), nullable=False),
        sa.Column('report_year', sa.Integer(), nullable=False),
        sa.Column('income', sa.BigInteger(), nullable=True),
        sa.Column('expenditure', sa.BigInteger(), nullable=True),
        sa.Column('balance', sa.BigInteger(), nullable=True),
        sa.Column('income_breakdown', sa.Text(), nullable=True),
        sa.Column('expenditure_breakdown', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create election_funds table
    op.create_table('election_funds',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('candidate_name', sa.String(length=255), nullable=False),
        sa.Column('election_type', sa.String(length=100), nullable=False),
        sa.Column('election_area', sa.String(length=255), nullable=False),
        sa.Column('election_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('political_party', sa.String(length=255), nullable=True),
        sa.Column('total_income', sa.BigInteger(), nullable=True),
        sa.Column('total_expenditure', sa.BigInteger(), nullable=True),
        sa.Column('balance', sa.BigInteger(), nullable=True),
        sa.Column('donations', sa.BigInteger(), nullable=True),
        sa.Column('personal_funds', sa.BigInteger(), nullable=True),
        sa.Column('party_support', sa.BigInteger(), nullable=True),
        sa.Column('income_breakdown', sa.Text(), nullable=True),
        sa.Column('expenditure_breakdown', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(GETDATE())'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_users_email', 'users', ['email'])
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_role_id', 'users', ['role_id'])
    op.create_index('ix_user_sessions_token', 'user_sessions', ['session_token'])
    op.create_index('ix_user_sessions_user_id', 'user_sessions', ['user_id'])
    op.create_index('ix_login_attempts_email', 'login_attempts', ['email'])
    op.create_index('ix_login_attempts_attempted_at', 'login_attempts', ['attempted_at'])
    op.create_index('ix_password_reset_tokens_token', 'password_reset_tokens', ['token'])

    # Insert default roles
    op.execute("INSERT INTO roles (name, description) VALUES ('admin', '管理者権限')")
    op.execute("INSERT INTO roles (name, description) VALUES ('user', '一般ユーザー')")


def downgrade() -> None:
    """データベーススキーマをダウングレードする

    初期マイグレーションをロールバックし、作成したテーブルを削除する。
    """
    # Drop tables in reverse order
    op.drop_table('election_funds')
    op.drop_table('political_funds')
    op.drop_table('password_reset_tokens')
    op.drop_table('login_attempts')
    op.drop_table('user_sessions')
    op.drop_table('users')
    op.drop_table('roles')
