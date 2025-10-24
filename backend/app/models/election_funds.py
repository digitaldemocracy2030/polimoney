from sqlalchemy import Column, Integer, String, DateTime, Text, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional

from app.database import Base


class ElectionFunds(Base):
    __tablename__ = "election_funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, comment="ユーザーID")
    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="候補者名")
    election_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="選挙種別")
    election_area: Mapped[str] = mapped_column(String(255), nullable=False, comment="選挙区")
    election_date: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, comment="選挙実施日")
    political_party: Mapped[Optional[str]] = mapped_column(String(255), comment="所属政党")

    # TODO: 選挙資金収支報告書の具体的なデータ構造を定義
    total_income: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収入合計")
    total_expenditure: Mapped[Optional[int]] = mapped_column(BigInteger, comment="支出合計")
    balance: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収支差額")
    donations: Mapped[Optional[int]] = mapped_column(BigInteger, comment="寄付金額")
    personal_funds: Mapped[Optional[int]] = mapped_column(BigInteger, comment="自己資金")
    party_support: Mapped[Optional[int]] = mapped_column(BigInteger, comment="政党支援金")
    income_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="収入内訳（JSON形式）")
    expenditure_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="支出内訳（JSON形式）")

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
