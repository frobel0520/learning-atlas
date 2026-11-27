import os
import socket
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

TEST_DATA = ROOT / "data" / "pytest"
TEST_DATA.mkdir(parents=True, exist_ok=True)

os.environ["DATABASE_URL"] = f"sqlite:///{(TEST_DATA / 'test.db').as_posix()}"
os.environ["CHROMA_DIR"] = str(TEST_DATA / "chroma")
os.environ["LLM_PROVIDER"] = "mock"
os.environ["WEBHOOK_SECRET"] = ""


@pytest.fixture(scope="session")
def client() -> TestClient:
    from app.config import get_settings
    from app.main import create_app

    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client
    get_settings.cache_clear()


def test_learn_page(client: TestClient) -> None:
    response = client.get("/learn")
    assert response.status_code == 200
    assert "新手學習台" in response.text


def test_root_redirects_to_learn(client: TestClient) -> None:
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (307, 308)
    assert response.headers["location"] == "/learn"


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["llm_provider"] == "mock"
    assert body["storage"] == "sqlite"
    assert body["persistent_data"] is False
    assert body["llm_ready"] is True


def test_notes_crud_and_ask(client: TestClient) -> None:
    create = client.post(
        "/notes",
        json={"title": "Test", "content": "LangChain helps build LLM apps."},
    )
    assert create.status_code == 201
    note_id = create.json()["id"]

    listing = client.get("/notes")
    assert listing.status_code == 200
    assert any(item["id"] == note_id for item in listing.json())

    ask = client.post("/ask", json={"question": "What does LangChain help with?"})
    assert ask.status_code == 200
    body = ask.json()
    assert "Mock LLM" in body["answer"]
    assert body["provider"] == "mock"


def test_webhook_registration_and_events(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port, type=0: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.215.14", port))],
    )
    webhook = client.post(
        "/webhooks",
        json={"url": "https://example.com/hook", "event_types": "*"},
    )
    assert webhook.status_code == 201
    webhook_id = webhook.json()["id"]

    events = client.get("/events")
    assert events.status_code == 200
    assert isinstance(events.json(), list)

    deleted = client.delete(f"/webhooks/{webhook_id}")
    assert deleted.status_code == 204


def test_webhook_ssrf_cap_and_security_hardening(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from app.config import Settings, get_settings
    from app.routers import webhooks as webhooks_router

    defaults = Settings(_env_file=None)
    assert defaults.host == "127.0.0.1"
    assert defaults.webhook_secret == ""
    with pytest.raises(ValidationError):
        Settings(_env_file=None, webhook_secret="change-me-in-production")

    # Reject loopback, private, link-local/metadata IP literals, and localhost
    for unsafe_url in [
        "http://127.0.0.1:8000/hook",
        "http://localhost:8000/hook",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.5/hook",
        "http://192.168.1.20/hook",
    ]:
        res = client.post("/webhooks", json={"url": unsafe_url, "event_types": "*"})
        assert res.status_code == 400, unsafe_url

    # Reject hostname resolving to a private IP
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port, type=0: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("192.168.1.10", port))],
    )
    rebind = client.post("/webhooks", json={"url": "https://rebind.example.com/hook", "event_types": "*"})
    assert rebind.status_code == 400

    # Cap active webhook subscriptions
    existing_count = len(client.get("/webhooks").json())
    monkeypatch.setenv("MAX_WEBHOOK_SUBSCRIPTIONS", str(existing_count + 2))
    get_settings.cache_clear()
    monkeypatch.setattr(
        socket,
        "getaddrinfo",
        lambda host, port, type=0: [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.215.14", port))],
    )
    created_ids: list[int] = []
    try:
        for i in range(2):
            r = client.post("/webhooks", json={"url": f"https://example.com/h{i}", "event_types": "*"})
            assert r.status_code == 201
            created_ids.append(r.json()["id"])
        capped = client.post("/webhooks", json={"url": "https://example.com/h-extra", "event_types": "*"})
        assert capped.status_code == 400
        assert "Maximum active webhook subscriptions" in capped.json()["detail"]
    finally:
        for wid in created_ids:
            client.delete(f"/webhooks/{wid}")
        monkeypatch.delenv("MAX_WEBHOOK_SUBSCRIPTIONS", raising=False)
        get_settings.cache_clear()

    # Omit raw exception detail on 502 from /dify/ask
    async def broken_dify(*_args, **_kwargs):
        raise RuntimeError("secret-internal-token-xyz")

    monkeypatch.setattr(webhooks_router, "ask_dify", broken_dify)
    dify_err = client.post("/dify/ask", json={"question": "test"})
    assert dify_err.status_code == 502
    assert dify_err.json()["detail"] == "Dify request failed"
    assert "secret-internal-token-xyz" not in dify_err.text


def test_dify_ask_requires_api_key(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DIFY_API_KEY", "")
    from app.config import get_settings

    get_settings.cache_clear()
    response = client.post("/dify/ask", json={"question": "Hello Dify?"})
    get_settings.cache_clear()
    assert response.status_code == 400
    assert "DIFY_API_KEY" in response.json()["detail"]
