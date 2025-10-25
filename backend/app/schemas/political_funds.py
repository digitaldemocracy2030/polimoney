from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PoliticalFundsBase(BaseModel):
    """政治資金データの基本スキーマ

    政治資金収支報告書の基本フィールドを定義するベースクラス。
    団体情報と財務データを表現する。
    """

    organization_name: str = Field(..., min_length=1, max_length=255)
    organization_type: str = Field(..., min_length=1, max_length=100)
    representative_name: str = Field(..., min_length=1, max_length=255)
    report_year: int = Field(..., ge=1900, le=2100)

    # Optional financial data
    income: Optional[int] = Field(None, ge=0)
    expenditure: Optional[int] = Field(None, ge=0)
    balance: Optional[int] = None
    income_breakdown: Optional[str] = None
    expenditure_breakdown: Optional[str] = None


class PoliticalFundsCreate(PoliticalFundsBase):
    """政治資金データ作成用スキーマ

    新しい政治資金データを作成するためのリクエスト用スキーマ。
    PoliticalFundsBaseの全フィールドを継承する。
    """


class PoliticalFundsUpdate(BaseModel):
    """政治資金データ更新用スキーマ

    政治資金データを更新するためのリクエスト用スキーマ。
    全てのフィールドがオプションで、更新したいフィールドのみ指定可能。
    """

    organization_name: Optional[str] = Field(None, min_length=1, max_length=255)
    organization_type: Optional[str] = Field(None, min_length=1, max_length=100)
    representative_name: Optional[str] = Field(None, min_length=1, max_length=255)
    report_year: Optional[int] = Field(None, ge=1900, le=2100)
    income: Optional[int] = Field(None, ge=0)
    expenditure: Optional[int] = Field(None, ge=0)
    balance: Optional[int] = None
    income_breakdown: Optional[str] = None
    expenditure_breakdown: Optional[str] = None


class PoliticalFunds(PoliticalFundsBase):
    """政治資金データの完全スキーマ

    政治資金データの全フィールドを含むレスポンス用スキーマ。
    データベースから取得した政治資金情報を表現する。
    """

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
