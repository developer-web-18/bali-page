"""WhatsApp OTP + lead lifecycle tests. Run against the live backend (supervisor) with
OTP_DEBUG_EXPOSE=true in backend/.env so the OTP is returned for assertions.
Real OTP messages are sent to TEST_MOBILE — keep the number of flows small."""

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parent.parent / ".env")
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:8001").rstrip("/")
DEBUG_EXPOSE = os.environ.get("OTP_DEBUG_EXPOSE", "false").lower() == "true"
needs_debug_otp = pytest.mark.skipif(not DEBUG_EXPOSE, reason="requires OTP_DEBUG_EXPOSE=true (preview only)")
TEST_MOBILE = "9289505505"
mongo = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]


def payload(**over):
    base = {
        "name": "TEST_OTP Flow",
        "mobile": f"+91 {TEST_MOBILE[:5]} {TEST_MOBILE[5:]}",
        "city": "TEST_Delhi",
        "travel_month": "October 2026",
        "travelers": "2 Adults",
        "package": "Bali Escape",
        "form_source": "Hero Form",
    }
    base.update(over)
    return base


def create_lead(**over):
    r = requests.post(f"{BASE_URL}/api/leads", json=payload(**over), timeout=30)
    assert r.status_code == 201, r.text
    return r.json()


@needs_debug_otp
def test_create_lead_saves_before_verification_and_sends_otp():
    data = create_lead()
    assert data["otp_status"] == "unverified"
    assert data["otp_sent"] is True
    assert data["masked_mobile"].endswith(TEST_MOBILE[-3:]) and "XXX" in data["masked_mobile"]
    assert data["debug_otp"] and len(data["debug_otp"]) == 6
    doc = mongo.leads.find_one({"id": data["lead_id"]})
    assert doc["mobile"] == TEST_MOBILE and doc["country_code"] == "91"
    assert doc["otp_status"] == "unverified" and doc["otp_send_status"] == "sent"
    assert doc["otp_hash"] != data["debug_otp"]  # never stored in plaintext
    assert doc["form_source"] == "Hero Form" and doc["package"] == "Bali Escape"


@needs_debug_otp
def test_wrong_then_correct_otp_marks_verified():
    data = create_lead(form_source="Package Popup", package="Bali Honeymoon")
    lid = data["lead_id"]
    bad = requests.post(f"{BASE_URL}/api/leads/{lid}/verify-otp", json={"otp": "000000"})
    assert bad.status_code == 400 and bad.json()["detail"]["code"] == "incorrect"
    assert mongo.leads.find_one({"id": lid})["otp_status"] == "unverified"
    good = requests.post(f"{BASE_URL}/api/leads/{lid}/verify-otp", json={"otp": data["debug_otp"]})
    assert good.status_code == 200 and good.json()["otp_status"] == "verified"
    doc = mongo.leads.find_one({"id": lid})
    assert doc["otp_status"] == "verified" and doc["otp_verified_at"] and doc["otp_hash"] is None
    # verification must not create another lead
    assert mongo.leads.count_documents({"id": lid}) == 1


@needs_debug_otp
def test_expired_otp_keeps_lead_unverified():
    data = create_lead()
    lid = data["lead_id"]
    mongo.leads.update_one({"id": lid}, {"$set": {"otp_expires_at": datetime.now(timezone.utc) - timedelta(minutes=1)}})
    r = requests.post(f"{BASE_URL}/api/leads/{lid}/verify-otp", json={"otp": data["debug_otp"]})
    assert r.status_code == 400 and r.json()["detail"]["code"] == "expired"
    assert mongo.leads.find_one({"id": lid})["otp_status"] == "unverified"


@needs_debug_otp
def test_resend_cooldown_and_change_number_flow():
    data = create_lead()
    lid = data["lead_id"]
    too_soon = requests.post(f"{BASE_URL}/api/leads/{lid}/resend-otp")
    assert too_soon.status_code == 429
    changed = requests.post(f"{BASE_URL}/api/leads/{lid}/change-number", json={"mobile": TEST_MOBILE})
    assert changed.status_code == 200, changed.text
    new = changed.json()
    assert new["lead_id"] == lid and new["otp_status"] == "unverified" and new["debug_otp"] != data["debug_otp"]
    # old OTP invalidated
    old = requests.post(f"{BASE_URL}/api/leads/{lid}/verify-otp", json={"otp": data["debug_otp"]})
    assert old.status_code == 400
    ok = requests.post(f"{BASE_URL}/api/leads/{lid}/verify-otp", json={"otp": new["debug_otp"]})
    assert ok.status_code == 200 and ok.json()["otp_status"] == "verified"
    assert mongo.leads.count_documents({"id": lid}) == 1


def test_invalid_mobile_rejected():
    r = requests.post(f"{BASE_URL}/api/leads", json=payload(mobile="12345 67890"))
    assert r.status_code == 422


def test_list_leads_never_exposes_otp_hash():
    r = requests.get(f"{BASE_URL}/api/leads")
    assert r.status_code == 200
    for lead in r.json():
        assert "otp_hash" not in lead and "debug_otp" not in lead
        assert lead["otp_status"] in {"unverified", "verified"}


@pytest.mark.asyncio
async def test_provider_failure_still_saves_lead(monkeypatch):
    """In-process: WhatsApp API failure -> lead saved, otp_sent false, friendly message."""
    import httpx
    from fastapi import FastAPI
    import routes.leads as leads

    async def failing_send(mobile, otp):
        return False, "wrong request"

    monkeypatch.setattr(leads, "send_otp_whatsapp", failing_send)
    app = FastAPI()
    app.include_router(leads.router, prefix="/api")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://t") as c:
        r = await c.post("/api/leads", json=payload(name="TEST_Provider Fail"))
    assert r.status_code == 201
    body = r.json()
    assert body["otp_sent"] is False and body["otp_status"] == "unverified"
    assert body["message"].startswith("We couldn't send the verification code")
    doc = mongo.leads.find_one({"id": body["lead_id"]})
    assert doc and doc["otp_send_status"] == "failed" and doc["otp_status"] == "unverified"
