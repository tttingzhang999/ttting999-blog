"""Isolated API probe; never bind a production database here."""
import hashlib
import json
import re

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, ValidationError

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
SLUG = "/blog/pw012-probe"
READ = "SELECT views FROM article_views WHERE slug = ?"
WRITE = "INSERT INTO article_views (slug, views) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET views = views + 1 RETURNING views"


class Payload(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    slug: str


def reply(status, code=None, data=None):
    return JSONResponse({"success": status == 200, "data": data, "error": {"code": code} if code else None}, status_code=status, headers={"Cache-Control": "no-store"})


def _limiter_options(key):
    from js import Object
    from pyodide.ffi import to_js
    return to_js({"key": key}, dict_converter=Object.fromEntries)


@app.get("/api/probe-failure")
async def storage_failure(request: Request):
    """Deliberate missing-table error, only in this disposable database."""
    try:
        await request.scope["env"].DB.prepare("SELECT views FROM pw012_missing_table").first()
    except Exception:
        return reply(503, "UNAVAILABLE")
    return reply(500, "FAULT_NOT_TRIGGERED")


@app.api_route("/api/views", methods=["GET", "POST"])
async def views(request: Request):
    env = request.scope["env"]
    increment = request.method == "POST"
    if increment and request.headers.get("origin") != env.SITE_ORIGIN:
        return reply(403, "ORIGIN_DENIED")
    if increment and request.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json":
        return reply(415, "UNSUPPORTED_MEDIA_TYPE")
    try:
        if increment:
            if request.url.query:
                return reply(400, "INVALID_INPUT")
            body = b""
            async for chunk in request.stream():
                body += chunk
                if len(body) > 4096:
                    return reply(413, "BODY_TOO_LARGE")
            slug = Payload.model_validate(json.loads(body.decode("utf-8"))).slug
        else:
            items = list(request.query_params.multi_items())
            if len(items) != 1 or items[0][0] != "slug":
                return reply(400, "INVALID_INPUT")
            slug = items[0][1]
        if len(slug.encode("utf-8")) > 2048 or not slug.startswith("/blog/") or re.search(r"[%?#\\\x00-\x20\x7f]", slug) or any(part in ("", ".", "..") for part in slug[6:].split("/")):
            return reply(400, "INVALID_INPUT")
    except (ValueError, UnicodeError, ValidationError):
        return reply(400, "INVALID_INPUT")
    if slug != SLUG:
        return reply(404, "UNKNOWN_ARTICLE")
    ip = request.headers.get("cf-connecting-ip")
    if not ip:
        return reply(503, "UNAVAILABLE")
    try:
        limited = await env.VIEW_LIMITER.limit(_limiter_options(hashlib.sha256(ip.encode()).hexdigest()))
        if limited.success is False:
            return reply(429, "RATE_LIMITED")
        if limited.success is not True:
            return reply(503, "UNAVAILABLE")
        row = await env.DB.prepare(WRITE if increment else READ).bind(slug).first()
        count = 0 if row is None and not increment else row.views
        if isinstance(count, bool) or int(count) != count or not 0 <= count <= 9007199254740991:
            return reply(503, "UNAVAILABLE")
        return reply(200, data={"slug": slug, "views": int(count)})
    except Exception:
        return reply(503, "UNAVAILABLE")
