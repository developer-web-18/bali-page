"""Backend tests for /api/leads endpoints (Bali landing page) — iteration 3 (validation only — OTP/lead creation flows live in test_otp_flow.py)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_URL", "https://bali-escapes-2.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health ---
def test_root(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert "message" in r.json()


# --- Leads: validation failures ---
def test_create_lead_missing_name(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "mobile": "+91 98765 43210",
        "city": "Delhi",
        "travelers": "2 Adults",
        "travel_month": "October 2026",
    })
    assert r.status_code == 422


def test_create_lead_short_name(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "name": "A",
        "mobile": "+91 98765 43210",
        "city": "Delhi",
        "travelers": "2 Adults",
        "travel_month": "October 2026",
    })
    assert r.status_code == 422


def test_create_lead_missing_mobile(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST Name",
        "city": "Delhi",
        "travelers": "2 Adults",
        "travel_month": "October 2026",
    })
    assert r.status_code == 422


def test_create_lead_missing_city(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST Name",
        "mobile": "+91 98765 43210",
        "travelers": "2 Adults",
        "travel_month": "October 2026",
    })
    assert r.status_code == 422


def test_create_lead_short_mobile(api):
    r = api.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST Name",
        "mobile": "123",
        "city": "Delhi",
        "travelers": "2 Adults",
        "travel_month": "October 2026",
    })
    assert r.status_code == 422


def test_create_lead_package_too_long(api):
    payload = {
        "name": "TEST Name",
        "mobile": "+91 98765 43212",
        "city": "TEST_Kolkata",
        "travelers": "2 Adults",
        "travel_month": "December 2026",
        "package": "X" * 121,
    }
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 422


# --- Leads: list ---
def test_list_leads_returns_list(api):
    r = api.get(f"{BASE_URL}/api/leads")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
