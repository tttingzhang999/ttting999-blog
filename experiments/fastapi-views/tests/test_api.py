"""Test HTTP boundaries and original SQL against disposable SQLite data."""

import asyncio
import sqlite3
from pathlib import Path
from types import SimpleNamespace

import httpx
import pytest

import app as probe

ORIGIN = "https://probe.invalid"
SLUG = "/blog/pw012-probe"


@pytest.fixture
def client(monkeypatch):
    db = sqlite3.connect(":memory:")
    db.executescript((Path(__file__).parents[3] / "migrations/0001_article_views.sql").read_text())
    state = SimpleNamespace(unavailable=False, allowed=True)

    class Statement:
        def __init__(self, sql):
            self.sql = sql
            self.args = ()

        def bind(self, *args):
            bound = Statement(self.sql)
            bound.args = args
            return bound

        async def first(self):
            if state.unavailable:
                raise RuntimeError("synthetic storage fault")
            row = db.execute(self.sql, self.args).fetchone()
            return SimpleNamespace(views=row[0]) if row else None

    class Limiter:
        async def limit(self, options):
            assert len(options["key"]) == 64
            return SimpleNamespace(success=state.allowed)

    env = SimpleNamespace(DB=SimpleNamespace(prepare=Statement), VIEW_LIMITER=Limiter(), SITE_ORIGIN=ORIGIN)
    monkeypatch.setattr(probe, "_limiter_options", lambda key: {"key": key}, raising=False)

    async def wrapped(scope, receive, send):
        await probe.app({**scope, "env": env}, receive, send)

    async def request(method="GET", **kwargs):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=wrapped), base_url=ORIGIN) as session:
            return await session.request(method, headers={"Origin": ORIGIN, "CF-Connecting-IP": "192.0.2.1", **kwargs.pop("headers", {})}, **kwargs)

    yield lambda *args, **kwargs: asyncio.run(request(*args, **kwargs)), state, db
    db.close()


def test_existing_schema_atomic_increment_and_read_only_zero(client):
    request, _, db = client
    assert request(url="/api/views", params={"slug": SLUG}).json()["data"]["views"] == 0
    assert db.execute("SELECT count(*) FROM article_views").fetchone()[0] == 0
    for expected in (1, 2, 3):
        response = request("POST", url="/api/views", json={"slug": SLUG})
        assert response.status_code == 200
        assert response.json() == {"success": True, "data": {"slug": SLUG, "views": expected}, "error": None}
        assert response.headers["cache-control"] == "no-store"
    assert request(url="/api/views", params={"slug": SLUG}).json()["data"]["views"] == 3


@pytest.mark.parametrize("kwargs,status", [
    ({"json": {"slug": SLUG}, "headers": {"Origin": "https://other.invalid"}}, 403),
    ({"json": {"slug": SLUG, "extra": True}}, 400),
    ({"json": {"slug": "/blog/not-published"}}, 404),
    ({"content": "x" * 4097, "headers": {"Content-Type": "application/json"}}, 413),
    ({"content": "{}", "headers": {"Content-Type": "text/plain"}}, 415),
])
def test_write_rejection_never_inserts(client, kwargs, status):
    request, _, db = client
    response = request("POST", url="/api/views", **kwargs)
    assert response.status_code == status
    assert db.execute("SELECT count(*) FROM article_views").fetchone()[0] == 0


def test_unavailable_and_throttling_are_bounded(client):
    request, state, _ = client
    state.unavailable = True
    response = request(url="/api/views", params={"slug": SLUG})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "UNAVAILABLE"
    assert response.headers["cache-control"] == "no-store"
    state.unavailable, state.allowed = False, False
    assert request(url="/api/views", params={"slug": SLUG}).status_code == 429


def test_invalid_queries_and_methods(client):
    request, _, _ = client
    assert request(url=f"/api/views?slug={SLUG}&slug={SLUG}").status_code == 400
    assert request("DELETE", url="/api/views").status_code == 405


def test_disposable_storage_fault(client):
    request, _, _ = client
    response = request(url="/api/probe-failure")
    assert response.status_code == 503
    assert response.json() == {"success": False, "data": None, "error": {"code": "UNAVAILABLE"}}


def test_bad_json_query_and_missing_edge_ip(client):
    request, _, _ = client
    assert request("POST", url="/api/views?extra=1", json={"slug": SLUG}).status_code == 400
    assert request("POST", url="/api/views", content="{", headers={"Content-Type": "application/json"}).status_code == 400
    assert request(url="/api/views", params={"slug": "/blog/../other"}).status_code == 400
    assert request(url="/api/views", params={"slug": SLUG}, headers={"CF-Connecting-IP": ""}).status_code == 503
