import hashlib
import hmac
import ipaddress
import json
import socket
from datetime import datetime
from urllib.parse import urlparse

import httpx
from sqlalchemy.orm import Session

from app.config import Settings
from app.database import EventLog, WebhookDelivery, WebhookSubscription

BLOCKED_HOSTNAMES = {
    "localhost",
    "localhost.localdomain",
    "ip6-localhost",
    "ip6-loopback",
    "metadata",
    "metadata.google.internal",
    "instance-data",
}
BLOCKED_HOST_SUFFIXES = (
    ".localhost",
    ".local",
    ".internal",
    ".home.arpa",
    ".lan",
    ".intranet",
)


def _is_disallowed_ip(ip_str: str) -> bool:
    addr = ipaddress.ip_address(ip_str)
    if isinstance(addr, ipaddress.IPv6Address) and addr.ipv4_mapped is not None:
        addr = addr.ipv4_mapped
    return (
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_multicast
        or addr.is_reserved
        or addr.is_unspecified
        or not addr.is_global
    )


def validate_webhook_target(url: str, *, allow_private_targets: bool = False) -> None:
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Webhook URL must use http or https")
    if parsed.username or parsed.password:
        raise ValueError("Webhook URL must not embed credentials")

    hostname = (parsed.hostname or "").strip().rstrip(".").lower()
    if not hostname:
        raise ValueError("Webhook URL must include a valid hostname")

    if allow_private_targets:
        return

    if hostname in BLOCKED_HOSTNAMES or hostname.endswith(BLOCKED_HOST_SUFFIXES):
        raise ValueError("Webhook target hostname is not allowed")

    try:
        literal_ip = ipaddress.ip_address(hostname)
    except ValueError:
        literal_ip = None

    if literal_ip is not None:
        if _is_disallowed_ip(str(literal_ip)):
            raise ValueError("Webhook target IP address is not allowed")
        return

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ValueError("Webhook target hostname could not be resolved") from exc

    if not infos:
        raise ValueError("Webhook target hostname could not be resolved")

    for info in infos:
        resolved_ip = info[4][0].split("%", 1)[0]
        if _is_disallowed_ip(resolved_ip):
            raise ValueError("Webhook target resolves to a disallowed IP address")


def _matches_event(subscription: WebhookSubscription, event_type: str) -> bool:
    if subscription.event_types.strip() == "*":
        return True
    allowed = {item.strip() for item in subscription.event_types.split(",") if item.strip()}
    return event_type in allowed


def _sign_payload(secret: str, payload: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256)
    return digest.hexdigest()


async def dispatch_event(
    db: Session,
    settings: Settings,
    event_type: str,
    payload: dict,
) -> EventLog:
    serialized = json.dumps(payload, ensure_ascii=False, default=str)
    event = EventLog(event_type=event_type, payload=serialized)
    db.add(event)
    db.commit()
    db.refresh(event)

    subscriptions = db.query(WebhookSubscription).all()
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
        for subscription in subscriptions:
            if not _matches_event(subscription, event_type):
                continue

            body = {
                "id": event.id,
                "type": event_type,
                "created_at": datetime.utcnow().isoformat() + "Z",
                "data": payload,
            }
            body_text = json.dumps(body, ensure_ascii=False)
            headers = {"Content-Type": "application/json", "X-Event-Type": event_type}
            secret = subscription.secret or settings.webhook_secret
            if secret:
                headers["X-Webhook-Signature"] = _sign_payload(secret, body_text)

            delivery = WebhookDelivery(
                event_id=event.id,
                subscription_id=subscription.id,
                success=0,
            )
            try:
                validate_webhook_target(
                    subscription.url,
                    allow_private_targets=settings.webhook_allow_private_targets,
                )
                response = await client.post(subscription.url, content=body_text, headers=headers)
                delivery.status_code = response.status_code
                delivery.response_body = response.text[:2000]
                delivery.success = 1 if response.status_code < 400 else 0
            except ValueError as exc:
                delivery.response_body = str(exc)[:200]
            except httpx.HTTPError:
                delivery.response_body = "Webhook delivery request failed"

            db.add(delivery)

    db.commit()
    return event
