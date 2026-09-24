"""Browse metadata and debt detail edits must preserve user ownership."""

from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx
import pytest
from fastapi import FastAPI

from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundError
from app.dependencies.auth import get_current_user
from app.models.debt import Debt
from app.routers import debts as debts_router
from app.schemas.debt import DebtDetailsUpdate
from app.services.debt import DebtService


def make_debt(user_id):
    return Debt(
        id=uuid4(),
        user_id=user_id,
        person_id=uuid4(),
        amount=100_000,
        amount_settled=40_000,
        type="receivable",
        status="partial",
        description="Lunch",
        due_date=None,
        created_at=datetime.now(timezone.utc),
        updated_at=None,
    )


@pytest.mark.asyncio
async def test_browse_returns_person_names_and_page_total(monkeypatch):
    user_id = uuid4()
    debt = make_debt(user_id)
    browse = AsyncMock(return_value=([(debt, "Budi")], 42))
    monkeypatch.setattr(DebtService, "browse_user_debts", browse)

    app = FastAPI()
    app.include_router(debts_router.router)
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=user_id)
    app.dependency_overrides[get_db] = lambda: None

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/api/v1/debts/browse",
            params={"status": "active", "debt_type": "receivable", "search": " Budi ", "page": 2},
        )

    assert response.status_code == 200
    assert response.json()["data"]["items"][0]["person_name"] == "Budi"
    assert response.json()["data"]["total"] == 42
    assert response.json()["data"]["page"] == 2
    browse.assert_awaited_once_with(user_id, "active", "receivable", "Budi", 2, 20)


@pytest.mark.asyncio
async def test_details_route_accepts_clearing_due_date(monkeypatch):
    user_id = uuid4()
    debt = make_debt(user_id)
    update = AsyncMock(return_value=debt)
    monkeypatch.setattr(DebtService, "update_debt_details", update)

    app = FastAPI()
    app.include_router(debts_router.router)
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=user_id)
    app.dependency_overrides[get_db] = lambda: None

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.patch(
            f"/api/v1/debts/{debt.id}/details",
            json={"description": "Updated", "due_date": None},
        )

    assert response.status_code == 200
    assert response.json()["data"]["id"] == str(debt.id)
    called_id, called_user, body = update.await_args.args
    assert (called_id, called_user) == (debt.id, user_id)
    assert body.model_dump(exclude_unset=True) == {
        "description": "Updated",
        "due_date": None,
    }


@pytest.mark.asyncio
async def test_edit_details_rejects_another_users_debt():
    service = DebtService(AsyncMock())
    service.repo.get_by_id = AsyncMock(return_value=make_debt(uuid4()))
    service.repo.update = AsyncMock()

    with pytest.raises(ResourceNotFoundError):
        await service.update_debt_details(
            uuid4(), uuid4(), DebtDetailsUpdate(description="Changed")
        )

    service.repo.update.assert_not_awaited()


@pytest.mark.asyncio
async def test_edit_details_can_clear_nullable_fields_without_changing_payments():
    user_id = uuid4()
    debt = make_debt(user_id)
    service = DebtService(AsyncMock())
    service.repo.get_by_id = AsyncMock(return_value=debt)
    service.repo.update = AsyncMock(return_value=debt)

    await service.update_debt_details(
        debt.id, user_id, DebtDetailsUpdate(description=None, due_date=None)
    )

    updated_debt, changes = service.repo.update.await_args.args
    assert updated_debt is debt
    assert changes.model_dump(exclude_unset=True) == {
        "description": None,
        "due_date": None,
    }
