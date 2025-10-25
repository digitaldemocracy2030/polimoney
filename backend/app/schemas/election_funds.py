from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ElectionFundsBase(BaseModel):
    """選挙資金データの基本スキーマ

    選挙運動費用収支報告書の基本フィールドを定義するベースクラス。
    候補者情報と選挙関連の財務データを表現する。
    """

    candidate_name: str = Field(..., min_length=1, max_length=255)
    election_type: str = Field(..., min_length=1, max_length=100)
    election_area: str = Field(..., min_length=1, max_length=255)
    election_date: datetime
    political_party: Optional[str] = Field(None, max_length=255)

    # Optional financial data
    total_income: Optional[int] = Field(None, ge=0)
    total_expenditure: Optional[int] = Field(None, ge=0)
    balance: Optional[int] = None
    donations: Optional[int] = Field(None, ge=0)
    personal_funds: Optional[int] = Field(None, ge=0)
    party_support: Optional[int] = Field(None, ge=0)
    income_breakdown: Optional[str] = None
    expenditure_breakdown: Optional[str] = None


class ElectionFundsCreate(ElectionFundsBase):
    """選挙資金データ作成用スキーマ

    新しい選挙資金データを作成するためのリクエスト用スキーマ。
    ElectionFundsBaseの全フィールドを継承する。
    """


class ElectionFundsUpdate(BaseModel):
    """選挙資金データ更新用スキーマ

    選挙資金データを更新するためのリクエスト用スキーマ。
    全てのフィールドがオプションで、更新したいフィールドのみ指定可能。
    """

    candidate_name: Optional[str] = Field(None, min_length=1, max_length=255)
    election_type: Optional[str] = Field(None, min_length=1, max_length=100)
    election_area: Optional[str] = Field(None, min_length=1, max_length=255)
    election_date: Optional[datetime] = None
    political_party: Optional[str] = Field(None, max_length=255)
    total_income: Optional[int] = Field(None, ge=0)
    total_expenditure: Optional[int] = Field(None, ge=0)
    balance: Optional[int] = None
    donations: Optional[int] = Field(None, ge=0)
    personal_funds: Optional[int] = Field(None, ge=0)
    party_support: Optional[int] = Field(None, ge=0)
    income_breakdown: Optional[str] = None
    expenditure_breakdown: Optional[str] = None


class ElectionFunds(ElectionFundsBase):
    """選挙資金データの完全スキーマ

    選挙資金データの全フィールドを含むレスポンス用スキーマ。
    データベースから取得した選挙資金情報を表現する。
    """

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
