# PW-012 result: CPU gate failed

Measured 2026-10-19, 14:56–14:58 Asia/Taipei. This experiment did not migrate
production. Keep the existing JavaScript counter and production D1 unchanged.

| Check | Evidence | Result |
| --- | --- | --- |
| API / original D1 SQL | 12 GET + 12 POST, all HTTP 200; count advanced from 0 to 12 | Pass |
| Cloudflare CPU telemetry | 24/24 requests matched exactly once by CF ray ID; no missing CPU values | Verified |
| Free CPU budget | 8–244 ms; nearest-rank p50 16 ms; 18 above 10 ms, one exactly 10 ms | **Fail** |
| First API requests after deployment | GET 244 ms, POST 78 ms | Over budget |
| Batch 1 subsequent 10 requests (SIN) | 13–35 ms | Over budget |
| Batch 2 subsequent 10 requests (SJC) | 8–22 ms, five at/above 10 ms | Insufficient headroom |
| Real counting storage failure | Dropped only disposable `article_views`; normal `/api/views` returned 503 / UNAVAILABLE | Pass |
| Static isolation during storage failure | Article HTTP 200 before/after, exact bytes equal to fixture | Pass |
| Local HTTP/SQL tests | 10 passed, app coverage 91% | Pass |
| Cleanup | Exact recorded temporary Worker and D1 deleted; API list readback confirms both absent | Pass |

The second batch's first GET/POST used 87/27 ms. Neither batch proves a specific
isolate was cold or warm; routing moved from SIN to SJC. Subsequent requests
are warm candidates, not guaranteed same-isolate measurements. This small
sample is enough to reject the stated <10 ms acceptance gate, not to establish
production percentiles. The p50 uses nearest-rank calculation.

All 24 API requests had invocation outcome `ok`. That does **not** prove Free
compatibility: [Cloudflare documents a 10 ms Free HTTP CPU limit and temporary
isolate flexibility](https://developers.cloudflare.com/workers/platform/limits/#cpu-time).
There were no CPU-termination errors in this small run, but relying on that
flexibility would fail the requested budget criterion. D1/network waiting is
excluded from CPU; the recorded wall times were not used as CPU estimates.

## Measurement setup

- FastAPI 0.146.0, Starlette 1.9.0, Pydantic 2.14.1.
- workers-py 1.17.8, workers-runtime-sdk 1.9.4, Wrangler 4.151.1.
- Cloudflare Python 3.14 compatibility date 2026-10-19; local tests CPython 3.14.7,
  deployed packaging Pyodide CPython 3.14.2.
- Full measured API path: ASGI/FastAPI, input validation, SHA-256 IP key,
  Python→JS rate limiter options, native rate binding, native D1 read/upsert,
  JSON response. No rate-limit rejection was included as a successful SQL sample.
- Two batches of 12 sequential alternating requests; total below 30 requests
  per IP/minute. The native binding, D1 bridge and atomic SQL executed successfully.
- Invocation logs sampled at 100%; official
  [Workers telemetry API](https://developers.cloudflare.com/api/resources/workers/subresources/observability/subresources/telemetry/methods/query/)
  supplied `$workers.cpuTimeMs`. Only matching `cf-worker-event` records used.
- Uploaded gzip package 2331 KiB. Wrangler reported startup 1768 ms; this is
  recorded separately and is not treated as request CPU time.
- Isolated random Worker `pw012-fastapi-effd809a`, version
  `840dd64a-6e54-4723-9749-4bb816236d2b`, synthetic slug only, new disposable D1.
  No custom domain, production binding, Terraform state, release workflow,
  account plan or paid service changed. Temporary resources removed afterwards.
- Sanitized per-request evidence is in `results.json`; raw invocation logs with
  client/network metadata remain outside Git in the private local runtime.

## Decision

Do not create or implement a production FastAPI migration plan from this result.
The existing D1 counter and asset-first static delivery remain in place. This
proves one pinned FastAPI configuration exceeds the required budget; it does not
prove every possible Python implementation would fail. A separately authorized
smaller Python handler experiment could test Python without FastAPI/ASGI overhead,
with the same D1 and static isolation requirements. That experiment was not run.
