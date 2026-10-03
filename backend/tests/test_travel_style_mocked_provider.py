"""Travel style + OTP lifecycle regression with TEST-ONLY provider mocking (in-process).

Coverage:
- travel_style accepts Budget/Luxury/None and omitted->None
- invalid travel_style values rejected with 422
- lead persisted before mocked provider callback
- travel_style persists across verify/resend/change-number
- exactly one lead record per lead id through lifecycle actions
- GET /api/leads includes travel_style and maps legacy-missing field to null
- GET never leaks internal fields (_id, otp_hash)
"""

import os
import time
from typing import Dict, List, Optional

import httpx
import pytest
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

import routes.leads as leads


pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
def reset_rate_limit_hits():
    """Reset process-local rate limiter state only for this test process."""
    leads._hits.clear()
    yield
    leads._hits.clear()


@pytest.fixture
def cleanup_qa_records():
    """Cleanup scoped QA records created in this file only."""
    prefix = "TEST_QA_TRAVEL_STYLE_"
    yield prefix
    mongo = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    mongo.leads.delete_many({"name": {"$regex": f"^{prefix}"}})


@pytest.fixture
async def mocked_client(monkeypatch):
    """In-process API with real MongoDB + mocked WhatsApp provider transport."""
    motor_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    test_db = motor_client[os.environ["DB_NAME"]]
    monkeypatch.setattr(leads, "db", test_db)

    captured: Dict[str, List] = {
        "otp_by_mobile": {},
        "callback_docs": [],
    }

    async def fake_send_otp_whatsapp(mobile: str, otp: str):
        doc = await test_db.leads.find_one({"mobile": mobile}, sort=[("created_at", -1)])
        captured["callback_docs"].append(
            {
                "mobile": mobile,
                "exists": doc is not None,
                "travel_style": doc.get("travel_style") if doc else None,
                "otp_status": doc.get("otp_status") if doc else None,
            }
        )
        captured.setdefault("otp_by_mobile", {}).setdefault(mobile, []).append(otp)
        return True, "mocked sent"

    monkeypatch.setattr(leads, "send_otp_whatsapp", fake_send_otp_whatsapp)

    app = FastAPI()
    app.include_router(leads.router, prefix="/api")

    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://testserver",
        timeout=30.0,
    ) as client:
        yield client, captured, test_db

    motor_client.close()


def unique_mobile(seed: int) -> str:
    # Use 8XXXXXXXXX range to avoid collisions with other parallel test modules using 9XXXXXXXXX.
    return f"8{seed % 1_000_000_000:09d}"


def payload(name: str, mobile: str, travel_style: Optional[str] = None) -> dict:
    body = {
        "name": name,
        "mobile": mobile,
        "city": "TEST_Delhi",
        "travel_month": "October 2026",
        "travelers": "2 Adults",
        "package": "Custom Bali Trip",
        "form_source": "Hero Form",
    }
    if travel_style is not None:
        body["travel_style"] = travel_style
    return body


async def create_lead(client: httpx.AsyncClient, body: dict):
    res = await client.post("/api/leads", json=body)
    assert res.status_code == 201, res.text
    return res.json()


# --- travel_style create/list validation ---
async def test_create_with_budget_persists_and_callback_sees_saved_value(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    seed = int(time.time() * 1000)
    mobile = unique_mobile(seed)
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile, travel_style="Budget")

    created = await create_lead(client, body)
    lead = await test_db.leads.find_one({"id": created["lead_id"]})

    assert lead["travel_style"] == "Budget"
    assert captured["callback_docs"][-1]["exists"] is True
    assert captured["callback_docs"][-1]["travel_style"] == "Budget"
    assert captured["callback_docs"][-1]["otp_status"] == "unverified"


async def test_create_with_luxury_persists(mocked_client, cleanup_qa_records):
    client, _, test_db = mocked_client
    seed = int(time.time() * 1000) + 1
    mobile = unique_mobile(seed)
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile, travel_style="Luxury")

    created = await create_lead(client, body)
    lead = await test_db.leads.find_one({"id": created["lead_id"]})
    assert lead["travel_style"] == "Luxury"


async def test_create_with_explicit_null_persists_none(mocked_client, cleanup_qa_records):
    client, _, test_db = mocked_client
    seed = int(time.time() * 1000) + 2
    mobile = unique_mobile(seed)
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile)
    body["travel_style"] = None

    created = await create_lead(client, body)
    lead = await test_db.leads.find_one({"id": created["lead_id"]})
    assert lead.get("travel_style") is None


async def test_create_with_omitted_travel_style_persists_none(mocked_client, cleanup_qa_records):
    client, _, test_db = mocked_client
    seed = int(time.time() * 1000) + 3
    mobile = unique_mobile(seed)
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile)

    created = await create_lead(client, body)
    lead = await test_db.leads.find_one({"id": created["lead_id"]})
    assert lead.get("travel_style") is None


@pytest.mark.parametrize(
    "bad_value",
    [True, False, "budget", "LUXURY", "Midrange", 123, 9.5],
)
async def test_create_rejects_invalid_travel_style_values(mocked_client, cleanup_qa_records, bad_value):
    client, _, _ = mocked_client
    seed = int(time.time() * 1000) + 10
    mobile = unique_mobile(seed + (1 if isinstance(bad_value, bool) else 2))
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile)
    body["travel_style"] = bad_value

    res = await client.post("/api/leads", json=body)
    assert res.status_code == 422


# --- travel_style across OTP lifecycle ---
async def test_travel_style_survives_verify_resend_change_number_and_single_record(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    seed = int(time.time() * 1000) + 30
    mobile = unique_mobile(seed)
    body = payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile, travel_style="Luxury")

    created = await create_lead(client, body)
    lead_id = created["lead_id"]
    first_otp = captured["otp_by_mobile"][mobile][-1]

    # verify once
    verify_ok = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": first_otp})
    assert verify_ok.status_code == 200
    after_verify = await test_db.leads.find_one({"id": lead_id})
    assert after_verify["travel_style"] == "Luxury"
    assert await test_db.leads.count_documents({"id": lead_id}) == 1

    # unverify to continue resend/change-number flow on same lead id
    await test_db.leads.update_one(
        {"id": lead_id},
        {
            "$set": {
                "otp_status": "unverified",
                "otp_verified_at": None,
                "last_otp_sent_at": leads.now() - leads.timedelta(seconds=35),
            }
        },
    )

    resend = await client.post(f"/api/leads/{lead_id}/resend-otp")
    assert resend.status_code == 200
    after_resend = await test_db.leads.find_one({"id": lead_id})
    assert after_resend["travel_style"] == "Luxury"
    assert await test_db.leads.count_documents({"id": lead_id}) == 1

    new_mobile = unique_mobile(seed + 55)
    change = await client.post(f"/api/leads/{lead_id}/change-number", json={"mobile": new_mobile})
    assert change.status_code == 200
    after_change = await test_db.leads.find_one({"id": lead_id})
    assert after_change["travel_style"] == "Luxury"
    assert after_change["mobile"] == new_mobile
    assert await test_db.leads.count_documents({"id": lead_id}) == 1


# --- list endpoint serialization/backward-compat ---
async def test_get_leads_includes_travel_style_and_legacy_missing_field_as_null(mocked_client, cleanup_qa_records):
    client, _, test_db = mocked_client
    seed = int(time.time() * 1000) + 60

    # modern record with travel_style
    mobile1 = unique_mobile(seed)
    created = await create_lead(
        client,
        payload(name=f"{cleanup_qa_records}{seed}", mobile=mobile1, travel_style="Budget"),
    )

    # legacy-like record missing travel_style (inserted directly)
    legacy_id = f"legacy-{seed}"
    ts = leads.now()
    await test_db.leads.insert_one(
        {
            "id": legacy_id,
            "name": f"{cleanup_qa_records}{seed}_LEGACY",
            "mobile": unique_mobile(seed + 1),
            "country_code": "91",
            "city": "TEST_Delhi",
            "travelers": "2 Adults",
            "travel_month": "October 2026",
            "package": "Custom Bali Trip",
            "form_source": "Hero Form",
            "source": "bali_landing_page",
            "otp_status": "unverified",
            "otp_send_status": "pending",
            "otp_attempts": 0,
            "otp_resend_count": 0,
            "number_change_count": 0,
            "otp_verified_at": None,
            "created_at": ts,
            "updated_at": ts,
            "otp_hash": "SHOULD_NOT_LEAK",
        }
    )

    r = await client.get("/api/leads")
    assert r.status_code == 200
    rows = r.json()
    by_id = {row["id"]: row for row in rows}

    assert by_id[created["lead_id"]]["travel_style"] == "Budget"
    assert by_id[legacy_id]["travel_style"] is None

    # no private/internal field leaks
    for row in rows:
        assert "_id" not in row
        assert "otp_hash" not in row
        assert "debug_otp" not in row
