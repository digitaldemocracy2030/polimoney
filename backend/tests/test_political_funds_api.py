import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.political_funds import PoliticalFunds
from app.core.security import create_access_token


class TestPoliticalFundsAPI:
    """政治資金APIのテストケース

    政治資金関連のAPIエンドポイントをテストするクラス。
    """
    @pytest.mark.asyncio
    async def test_create_political_funds_as_admin(self, async_client: AsyncClient, db_session: Session):
        """管理者として政治資金データ作成テスト"""
        # 管理者ユーザー作成
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # 政治資金データ作成
        funds_data = {
            "document_id": "DOC001",
            "party_name": "テスト政党",
            "party_representative": "テスト代表",
            "accounting_year": 2024,
            "total_income": 1000000,
            "total_expenditure": 800000,
            "political_party_donation": 200000,
            "individual_donation": 300000,
            "public_funding": 500000,
            "other_income": 0,
            "personnel_expenses": 400000,
            "office_expenses": 200000,
            "campaign_expenses": 150000,
            "other_expenses": 50000
        }

        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.post("/api/v1/admin/political-funds", json=funds_data, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["document_id"] == "DOC001"
        assert data["party_name"] == "テスト政党"
        assert data["total_income"] == 1000000
        assert data["total_expenditure"] == 800000

        # DBに保存されていることを確認
        db_funds = db_session.query(PoliticalFunds).filter(PoliticalFunds.document_id == "DOC001").first()
        assert db_funds is not None
        assert db_funds.party_name == "テスト政党"

    @pytest.mark.asyncio
    async def test_create_political_funds_as_regular_user(self, async_client: AsyncClient, db_session: Session):
        """一般ユーザーとして政治資金データ作成テスト（アクセス拒否されるはず）"""
        # 一般ユーザー作成
        regular_user = User(
            email="user@example.com",
            username="user",
            hashed_password="hashed_password",
            role=Role.USER
        )
        db_session.add(regular_user)
        db_session.commit()

        # 一般ユーザートークン生成
        user_token = create_access_token({"sub": str(regular_user.id), "role": regular_user.role.value})

        # 政治資金データ作成試行
        funds_data = {
            "document_id": "DOC002",
            "party_name": "テスト政党2",
            "party_representative": "テスト代表2",
            "accounting_year": 2024,
            "total_income": 500000,
            "total_expenditure": 400000,
            "political_party_donation": 100000,
            "individual_donation": 150000,
            "public_funding": 250000,
            "other_income": 0,
            "personnel_expenses": 200000,
            "office_expenses": 100000,
            "campaign_expenses": 75000,
            "other_expenses": 25000
        }

        headers = {"Authorization": f"Bearer {user_token}"}
        response = await async_client.post("/api/v1/admin/political-funds", json=funds_data, headers=headers)

        assert response.status_code == 403
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_get_political_funds_list_as_admin(self, async_client: AsyncClient, db_session: Session):
        """管理者として政治資金データ一覧取得テスト"""
        # 管理者ユーザー作成
        admin_user = User(
            email="admin2@example.com",
            username="admin2",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 政治資金データ作成
        funds = PoliticalFunds(
            document_id="DOC003",
            party_name="テスト政党3",
            party_representative="テスト代表3",
            accounting_year=2024,
            total_income=750000,
            total_expenditure=600000,
            political_party_donation=150000,
            individual_donation=225000,
            public_funding=375000,
            other_income=0,
            personnel_expenses=300000,
            office_expenses=150000,
            campaign_expenses=112500,
            other_expenses=37500
        )
        db_session.add(funds)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # 一覧取得
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.get("/api/v1/admin/political-funds", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

        # 作成したデータが含まれていることを確認
        found = False
        for item in data:
            if item["document_id"] == "DOC003":
                found = True
                assert item["party_name"] == "テスト政党3"
                assert item["total_income"] == 750000
                break
        assert found

    @pytest.mark.asyncio
    async def test_get_political_funds_by_id_as_admin(self, async_client: AsyncClient, db_session: Session):
        """管理者として政治資金データ詳細取得テスト"""
        # 管理者ユーザー作成
        admin_user = User(
            email="admin3@example.com",
            username="admin3",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 政治資金データ作成
        funds = PoliticalFunds(
            document_id="DOC004",
            party_name="テスト政党4",
            party_representative="テスト代表4",
            accounting_year=2024,
            total_income=600000,
            total_expenditure=480000,
            political_party_donation=120000,
            individual_donation=180000,
            public_funding=300000,
            other_income=0,
            personnel_expenses=240000,
            office_expenses=120000,
            campaign_expenses=90000,
            other_expenses=30000
        )
        db_session.add(funds)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # 詳細取得
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.get(f"/api/v1/admin/political-funds/{funds.id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["document_id"] == "DOC004"
        assert data["party_name"] == "テスト政党4"
        assert data["total_income"] == 600000
        assert data["total_expenditure"] == 480000
