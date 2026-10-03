"""Leads + WhatsApp OTP verification. One service shared by every enquiry form on the page.

Lead lifecycle: created (otp_status="unverified") -> OTP sent -> verified. The lead is persisted
BEFORE any OTP is sent so that nothing is lost if the visitor never completes verification."""

import hashlib
import hmac
import logging
import os
import re
import secrets
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from lib.db import db
from lib.whatsapp import send_otp_whatsapp

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/leads", tags=["leads"])

OTP_TTL = timedelta(minutes=5)
RESEND_COOLDOWN_SECONDS = 30
MAX_RESENDS = 3
MAX_NUMBER_CHANGES = 3
MAX_VERIFY_ATTEMPTS = 5
DEBUG_EXPOSE = os.environ.get("OTP_DEBUG_EXPOSE", "false").lower() == "true"

PUBLIC_FIELDS = {
    "id", "name", "mobile", "country_code", "city", "travelers", "travel_month", "travel_style", "package",
    "form_source", "source", "otp_status", "otp_verified_at", "otp_send_status", "created_at", "updated_at",
}


# ---------- helpers ----------
def now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_mobile(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if not re.fullmatch(r"[6-9]\d{9}", digits):
        raise ValueError("Enter a valid 10-digit Indian mobile number")
    return digits


def mask_mobile(mobile: str) -> str:
    return f"+91 {mobile[:2]}XXX XX{mobile[-3:]}"


def otp_hash(lead_id: str, otp: str) -> str:
    return hmac.new(lead_id.encode(), otp.encode(), hashlib.sha256).hexdigest()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def public(doc: dict) -> dict:
    return {k: v for k, v in doc.items() if k in PUBLIC_FIELDS}


# ---------- rate limiting (per process, sliding window) ----------
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    q = _hits[key]
    cutoff = time.monotonic() - window_seconds
    while q and q[0] < cutoff:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, detail="Too many OTP requests. Please try again in a few minutes.")
    q.append(time.monotonic())


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


# ---------- models ----------
class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    mobile: str = Field(min_length=10, max_length=20)
    city: str = Field(min_length=2, max_length=120)
    travel_month: str = Field(min_length=1, max_length=60)
    travelers: str = Field(min_length=1, max_length=60)
    travel_style: Optional[Literal["Budget", "Luxury"]] = None
    package: str = Field(default="Custom Bali Trip", min_length=1, max_length=120)
    form_source: str = Field(default="Hero Form", min_length=1, max_length=60)

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, v: str) -> str:
        return normalize_mobile(v)


class OtpVerify(BaseModel):
    otp: str = Field(pattern=r"^\d{6}$")


class ChangeNumber(BaseModel):
    mobile: str = Field(min_length=10, max_length=20)

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, v: str) -> str:
        return normalize_mobile(v)


class OtpSendResult(BaseModel):
    lead_id: str
    otp_status: str
    otp_sent: bool
    masked_mobile: str
    resend_cooldown_seconds: int = RESEND_COOLDOWN_SECONDS
    resends_left: int
    message: str
    debug_otp: Optional[str] = None


class LeadPublic(BaseModel):
    id: str
    name: str
    mobile: str
    country_code: str = "91"
    city: str
    travelers: str
    travel_month: str
    travel_style: Optional[Literal["Budget", "Luxury"]] = None
    package: str
    form_source: str
    source: str
    otp_status: str
    otp_send_status: str
    otp_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ---------- core OTP issue ----------
async def issue_otp(lead: dict, request: Request) -> OtpSendResult:
    """Generate, store (hashed) and send a fresh OTP for `lead`; previous OTP is invalidated."""
    rate_limit(f"ip:{client_ip(request)}", limit=8, window_seconds=600)
    rate_limit(f"mobile:{lead['mobile']}", limit=6, window_seconds=3600)

    otp = generate_otp()
    ts = now()
    ok, provider_message = await send_otp_whatsapp(lead["mobile"], otp)
    update = {
        "otp_hash": otp_hash(lead["id"], otp),
        "otp_created_at": ts,
        "otp_expires_at": ts + OTP_TTL,
        "otp_attempts": 0,
        "last_otp_sent_at": ts,
        "otp_send_status": "sent" if ok else "failed",
        "otp_status": "unverified",
        "otp_verified_at": None,
        "updated_at": ts,
    }
    await db.leads.update_one({"id": lead["id"]}, {"$set": update})
    lead.update(update)
    return OtpSendResult(
        lead_id=lead["id"],
        otp_status="unverified",
        otp_sent=ok,
        masked_mobile=mask_mobile(lead["mobile"]),
        resends_left=max(0, MAX_RESENDS - lead.get("otp_resend_count", 0)),
        message="OTP sent to your WhatsApp" if ok else "We couldn't send the verification code right now. Please try again.",
        debug_otp=otp if DEBUG_EXPOSE else None,
    )


async def get_lead_or_404(lead_id: str) -> dict:
    doc = await db.leads.find_one({"id": lead_id})
    if not doc:
        raise HTTPException(404, detail="Lead not found")
    return doc


# ---------- routes ----------
@router.post("", response_model=OtpSendResult, status_code=201, response_model_exclude_none=True)
async def create_lead(payload: LeadCreate, request: Request):
    ts = now()
    lead = {
        **payload.model_dump(),
        "id": str(uuid.uuid4()),
        "country_code": "91",
        "source": "bali_landing_page",
        "otp_status": "unverified",
        "otp_send_status": "pending",
        "otp_attempts": 0,
        "otp_resend_count": 0,
        "number_change_count": 0,
        "otp_verified_at": None,
        "created_at": ts,
        "updated_at": ts,
    }
    await db.leads.insert_one(dict(lead))  # saved before any OTP work -> never lose a lead
    return await issue_otp(lead, request)


@router.post("/{lead_id}/verify-otp")
async def verify_otp(lead_id: str, payload: OtpVerify):
    lead = await get_lead_or_404(lead_id)
    if lead.get("otp_status") == "verified":
        return {"otp_status": "verified", "message": "Already verified"}
    if not lead.get("otp_hash") or not lead.get("otp_expires_at"):
        raise HTTPException(400, detail={"code": "expired", "message": "This OTP has expired. Please request a new OTP."})
    if lead.get("otp_attempts", 0) >= MAX_VERIFY_ATTEMPTS:
        raise HTTPException(429, detail={"code": "locked", "message": "Too many incorrect attempts. Please request a new OTP."})
    expires_at = lead["otp_expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if now() > expires_at:
        await db.leads.update_one({"id": lead_id}, {"$set": {"otp_hash": None, "updated_at": now()}})
        raise HTTPException(400, detail={"code": "expired", "message": "This OTP has expired. Please request a new OTP."})
    if not hmac.compare_digest(lead["otp_hash"], otp_hash(lead_id, payload.otp)):
        await db.leads.update_one({"id": lead_id}, {"$inc": {"otp_attempts": 1}, "$set": {"updated_at": now()}})
        raise HTTPException(400, detail={"code": "incorrect", "message": "Incorrect OTP. Please check the code and try again."})

    ts = now()
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"otp_status": "verified", "otp_verified_at": ts, "otp_hash": None, "updated_at": ts}},
    )
    return {"otp_status": "verified", "otp_verified_at": ts, "message": "Your WhatsApp number is verified"}


@router.post("/{lead_id}/resend-otp", response_model=OtpSendResult, response_model_exclude_none=True)
async def resend_otp(lead_id: str, request: Request):
    lead = await get_lead_or_404(lead_id)
    if lead.get("otp_status") == "verified":
        raise HTTPException(400, detail="This number is already verified")
    if lead.get("otp_resend_count", 0) >= MAX_RESENDS:
        raise HTTPException(429, detail="Maximum OTP resend attempts reached. Our team will contact you on WhatsApp.")
    last = lead.get("last_otp_sent_at")
    if last and lead.get("otp_send_status") == "sent":
        if last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)
        wait = RESEND_COOLDOWN_SECONDS - int((now() - last).total_seconds())
        if wait > 0:
            raise HTTPException(429, detail=f"Please wait {wait}s before requesting a new OTP.")
    lead["otp_resend_count"] = lead.get("otp_resend_count", 0) + 1
    await db.leads.update_one({"id": lead_id}, {"$set": {"otp_resend_count": lead["otp_resend_count"]}})
    return await issue_otp(lead, request)


@router.post("/{lead_id}/change-number", response_model=OtpSendResult, response_model_exclude_none=True)
async def change_number(lead_id: str, payload: ChangeNumber, request: Request):
    lead = await get_lead_or_404(lead_id)
    if lead.get("otp_status") == "verified":
        raise HTTPException(400, detail="This enquiry is already verified")
    if lead.get("number_change_count", 0) >= MAX_NUMBER_CHANGES:
        raise HTTPException(429, detail="Maximum number changes reached. Our team will contact you.")
    lead["mobile"] = payload.mobile
    lead["number_change_count"] = lead.get("number_change_count", 0) + 1
    lead["otp_resend_count"] = 0
    await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"mobile": payload.mobile, "number_change_count": lead["number_change_count"], "otp_resend_count": 0}},
    )
    return await issue_otp(lead, request)


@router.get("", response_model=List[LeadPublic])
async def list_leads():
    docs = await db.leads.find().sort("created_at", -1).to_list(500)
    return [
        LeadPublic(**{"form_source": "Hero Form", "otp_status": "unverified", "otp_send_status": "n/a",
                      "package": "Custom Bali Trip", "updated_at": d.get("created_at"), **public(d)})
        for d in docs
    ]
