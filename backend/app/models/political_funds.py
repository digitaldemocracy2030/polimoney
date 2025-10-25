from typing import Optional

from sqlalchemy import BigInteger, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class PoliticalFunds(Base):
    """政治資金収支報告書データを表すモデル

    政治団体等の収支状況を記録するテーブル。
    団体情報と財務データを管理し、政治資金の透明性を確保する。

    Attributes:
        id (int): プライマリキー
        user_id (int): データを登録したユーザーID
        organization_name (str): 団体名
        organization_type (str): 団体種別
        representative_name (str): 代表者名
        report_year (int): 報告年度
        income (int): 収入合計
        expenditure (int): 支出合計
        balance (int): 収支差額
        income_breakdown (str): 収入内訳（JSON形式）
        expenditure_breakdown (str): 支出内訳（JSON形式）
        created_at (datetime): データ作成日時
        updated_at (datetime): データ更新日時
    """

    __tablename__ = "political_funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, comment="ユーザーID")
    organization_name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="団体名"
    )
    organization_type: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="団体種別"
    )
    representative_name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="代表者名"
    )
    report_year: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="報告年度"
    )

    # TODO: 政治資金収支報告書の具体的なデータ構造を定義
    income: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収入合計")
    expenditure: Mapped[Optional[int]] = mapped_column(BigInteger, comment="支出合計")
    balance: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収支差額")
    income_breakdown: Mapped[Optional[str]] = mapped_column(
        Text, comment="収入内訳（JSON形式）"
    )
    expenditure_breakdown: Mapped[Optional[str]] = mapped_column(
        Text, comment="支出内訳（JSON形式）"
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
