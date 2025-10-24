from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ElectionFundsBase(BaseModel):
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
    pass


class ElectionFundsUpdate(BaseModel):
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
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
