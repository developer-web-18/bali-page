"""Isolated OTP lifecycle regression with TEST-ONLY mocked provider (no live sends).

Coverage:
- lead saved before provider callback
- incorrect then correct OTP verify
- provider failure keeps lead record
- change-number invalidates old OTP on same lead id
- resend cooldown enforced, resend OTP can verify
"""

import time
import os
import asyncio
from typing import Dict, List

import httpx
import pytest
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

import routes.leads as leads


pytestmark = pytest.mark.asyncio


@pytest.fixture(scope="session")
def event_loop():
    """Use one loop for all tests so module-level Motor client stays valid."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def cleanup_qa_records():
    """Cleanup TEST_ records created in this file only."""
    prefix = "TEST_QA_OTP_MOCKED_"
    yield prefix
    mongo = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
    mongo.leads.delete_many({"name": {"$regex": f"^{prefix}"}})


@pytest.fixture
async def mocked_client(monkeypatch):
    """In-process app client with provider monkeypatched for this test process only."""
    motor_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    test_db = motor_client[os.environ["DB_NAME"]]
    monkeypatch.setattr(leads, "db", test_db)

    captured: Dict[str, List[str] | List[dict]] = {
        "otp_by_mobile": {},
        "callback_checks": [],
    }

    async def fake_send_otp_whatsapp(mobile: str, otp: str):
        doc = await test_db.leads.find_one({"mobile": mobile}, sort=[("created_at", -1)])
        captured["callback_checks"].append(
            {
                "mobile": mobile,
                "exists": doc is not None,
                "status": doc.get("otp_status") if doc else None,
            }
        )
        captured.setdefault("otp_by_mobile", {}).setdefault(mobile, []).append(otp)
        if mobile.endswith("7777"):
            return False, "forced provider failure"
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


def lead_payload(name: str, mobile: str):
    return {
        "name": name,
        "mobile": mobile,
        "city": "TEST_Delhi",
        "travel_month": "October 2026",
        "travelers": "2 Adults",
        "package": "Bali Escape",
        "form_source": "Hero Form",
    }


def unique_mobile(seed: int) -> str:
    # deterministic valid Indian numbers: 9XXXXXXXXX
    return f"9{seed % 1_000_000_000:09d}"


async def create_lead(client: httpx.AsyncClient, name_prefix: str, seed: int):
    mobile = unique_mobile(seed)
    payload = lead_payload(name=f"{name_prefix}{seed}", mobile=mobile)
    res = await client.post("/api/leads", json=payload)
    assert res.status_code == 201, res.text
    return res.json(), mobile


async def test_create_callback_sees_persisted_unverified_lead(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    ts = int(time.time() * 1000)
    body, mobile = await create_lead(client, cleanup_qa_records, ts)

    assert body["otp_status"] == "unverified"
    assert body["otp_sent"] is True
    assert body["lead_id"]

    lead_doc = await test_db.leads.find_one({"id": body["lead_id"]})
    assert lead_doc is not None
    assert lead_doc["otp_status"] == "unverified"
    assert lead_doc["mobile"] == mobile
    assert lead_doc["otp_hash"] is not None

    assert captured["callback_checks"], "provider callback should have been invoked"
    callback = captured["callback_checks"][-1]
    assert callback["exists"] is True
    assert callback["status"] == "unverified"


async def test_wrong_then_correct_otp_verify(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    ts = int(time.time() * 1000) + 1
    body, mobile = await create_lead(client, cleanup_qa_records, ts)
    lead_id = body["lead_id"]

    sent_otp = captured["otp_by_mobile"][mobile][-1]
    wrong = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": "000000"})
    assert wrong.status_code == 400
    assert wrong.json()["detail"]["code"] == "incorrect"

    doc_after_wrong = await test_db.leads.find_one({"id": lead_id})
    assert doc_after_wrong["otp_status"] == "unverified"

    ok = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": sent_otp})
    assert ok.status_code == 200
    assert ok.json()["otp_status"] == "verified"

    doc_after_ok = await test_db.leads.find_one({"id": lead_id})
    assert doc_after_ok["otp_status"] == "verified"
    assert doc_after_ok["otp_hash"] is None


async def test_provider_failure_retains_lead_unverified(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    ts = int(time.time() * 1000) + 2

    fail_mobile = unique_mobile(ts)[:-4] + "7777"
    payload = lead_payload(name=f"{cleanup_qa_records}{ts}_FAIL", mobile=fail_mobile)
    res = await client.post("/api/leads", json=payload)
    assert res.status_code == 201
    body = res.json()
    assert body["otp_sent"] is False
    assert body["otp_status"] == "unverified"

    doc = await test_db.leads.find_one({"id": body["lead_id"]})
    assert doc is not None
    assert doc["otp_status"] == "unverified"
    assert doc["otp_send_status"] == "failed"

    callback = captured["callback_checks"][-1]
    assert callback["exists"] is True
    assert callback["status"] == "unverified"


async def test_change_number_invalidates_old_otp_same_lead_id(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    ts = int(time.time() * 1000) + 3
    body, mobile = await create_lead(client, cleanup_qa_records, ts)
    lead_id = body["lead_id"]
    old_otp = captured["otp_by_mobile"][mobile][-1]

    new_mobile = unique_mobile(ts + 50)
    change = await client.post(f"/api/leads/{lead_id}/change-number", json={"mobile": new_mobile})
    assert change.status_code == 200
    assert change.json()["lead_id"] == lead_id

    new_otp = captured["otp_by_mobile"][new_mobile][-1]
    assert new_otp != old_otp

    old_try = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": old_otp})
    assert old_try.status_code == 400
    assert old_try.json()["detail"]["code"] == "incorrect"

    ok = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": new_otp})
    assert ok.status_code == 200
    assert ok.json()["otp_status"] == "verified"

    assert await test_db.leads.count_documents({"id": lead_id}) == 1


async def test_resend_cooldown_enforced_then_resend_verifiable(mocked_client, cleanup_qa_records):
    client, captured, test_db = mocked_client
    ts = int(time.time() * 1000) + 4
    body, mobile = await create_lead(client, cleanup_qa_records, ts)
    lead_id = body["lead_id"]

    early = await client.post(f"/api/leads/{lead_id}/resend-otp")
    assert early.status_code == 429
    assert "Please wait" in early.text

    # Move last send back in time to bypass cooldown and resend
    await test_db.leads.update_one(
        {"id": lead_id},
        {"$set": {"last_otp_sent_at": leads.now() - leads.timedelta(seconds=35)}},
    )
    resend = await client.post(f"/api/leads/{lead_id}/resend-otp")
    assert resend.status_code == 200

    resent_otp = captured["otp_by_mobile"][mobile][-1]
    ok = await client.post(f"/api/leads/{lead_id}/verify-otp", json={"otp": resent_otp})
    assert ok.status_code == 200
    assert ok.json()["otp_status"] == "verified"
