from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PoliticalFundsBase(BaseModel):
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
    pass


class PoliticalFundsUpdate(BaseModel):
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
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
