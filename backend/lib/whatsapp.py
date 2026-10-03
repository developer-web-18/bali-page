"""Promotion Kart WhatsApp template sender. The Authkey only ever lives in the process env."""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

_URL = os.environ["PROMOTIONKART_URL"]
_WID = os.environ["PROMOTIONKART_WID"]
_COUNTRY_CODE = "91"


def _authkey() -> str:
    return os.environ["PROMOTIONKART_AUTHKEY"]


async def send_otp_whatsapp(mobile: str, otp: str) -> tuple[bool, str]:
    """Send the `otp_msgs` template (single variable {{1}} = OTP). Returns (ok, provider_message).
    Never logs the OTP or the Authkey; the mobile is masked in logs."""
    payload = {
        "country_code": _COUNTRY_CODE,
        "mobile": mobile,
        "wid": _WID,
        "type": "text",
        "bodyValues": {"1": otp},
    }
    headers = {"Authorization": f"Basic {_authkey()}", "Content-Type": "application/json"}
    masked = f"******{mobile[-4:]}"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(_URL, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        logger.warning("whatsapp otp send to %s failed: %s", masked, type(exc).__name__)
        return False, "network_error"

    try:
        data = response.json()
    except ValueError:
        data = {}
    status = str(data.get("status", "")).lower()
    message = str(data.get("Message") or data.get("message") or response.status_code)
    ok = response.is_success and status == "success"
    logger.info("whatsapp otp send to %s -> http %s status=%s message=%s", masked, response.status_code, status or "-", message)
    return ok, message
