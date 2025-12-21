from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Candidate(Base):
    """候補者情報モデル。

    候補者の識別情報（氏名、かな表記、生年月日、所属政党など）を保持します。

    Attributes:
        id: 主キー
        name: 候補者名（漢字/かな併用可）
        name_kana: 候補者名（かな）
        political_party: 所属政党/政治団体/無所属
        election_type_code: 選挙種別コード (city_code.csv参照 衆院選: 999999, 参院選: 999998)
        election_area_single: 小選挙区 (地方選や不出馬などの場合はNULL)
        election_area_proportional: 比例代表選挙区 (地方選や不出馬などの場合はNULL)
        election_date: 選挙実施日
        created_at: レコード作成時刻
        updated_at: レコード更新時刻
    """

    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="候補者名（漢字/かな併用可）"
    )
    name_kana: Mapped[Optional[str]] = mapped_column(
        String(255), comment="候補者名（かな）"
    )
    political_party: Mapped[Optional[str]] = mapped_column(
        String(255), comment="所属政党/政治団体/無所属"
    )
    election_type_code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="選挙種別コード (city_code.csv参照 衆院選: 999999, 参院選: 999998)",
    )
    election_area_single: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, comment="小選挙区 (地方選や不出馬などの場合はNULL)"
    )
    election_area_proportional: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="比例代表選挙区 (地方選や不出馬などの場合はNULL)",
    )
    election_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, comment="選挙実施日"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    election_funds: Mapped[list["ElectionFunds"]] = relationship(
        "ElectionFunds", back_populates="candidate"
    )


class ElectionFunds(Base):
    """選挙運動費用収支報告書モデル。

    このモデルは日本の選挙運動費用収支報告書（Election Campaign Expense Report）に
    特化したフィールドを保持します。政治資金の一般的な収支モデルとは別扱いとし、
    将来的に別種の収支報告書を扱う際には別モデルで定義してください。

    Attributes:
        id: 主キー
        candidate_id: 候補者ID（candidates.id）
        category: カテゴリ
        date: 日付
        price: 金額
        type: 種別
        purpose: 支出の目的 (収入はNULL)
        non_monetary_basis: 金銭以外の見積もりの根拠
        note: 備考
        created_at: レコード作成時刻
        updated_at: レコード更新時刻
    """

    __tablename__ = "election_funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False,
        index=True,
        comment="候補者ID（candidates.id）",
    )

    category: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="カテゴリ"
    )
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, comment="日付"
    )
    price: Mapped[int] = mapped_column(Integer, nullable=False, comment="金額")
    type: Mapped[str] = mapped_column(String(100), nullable=False, comment="種別")
    purpose: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, comment="支出の目的 (収入はNULL)"
    )
    non_monetary_basis: Mapped[Optional[str]] = mapped_column(
        String(255), comment="金銭以外の見積もりの根拠"
    )
    note: Mapped[Optional[str]] = mapped_column(String(255), comment="備考")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    candidate: Mapped["Candidate"] = relationship(
        "Candidate", back_populates="election_funds"
    )
