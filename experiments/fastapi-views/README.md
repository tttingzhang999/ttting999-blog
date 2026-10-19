# FastAPI views feasibility probe (PW-012)

This is an isolated experiment, not a production migration. Do not point this
project at the existing blog Worker, hostname, D1 database or rate-limit namespace.

Plan and acceptance:

1. Exercise the existing `article_views` schema and parameterized GET/upsert SQL
   using synthetic articles in a disposable database. Cover validation, origin,
   throttling and unavailable storage before deployment.
2. Deploy one randomly named Python Worker with its own disposable D1 and static
   article fixture. Keep asset-first routing; only `/api/*` invokes Python.
3. Measure real Cloudflare invocation CPU, separately from HTTP latency. Record
   first-after-deploy candidates and warm samples, errors and missing telemetry.
   Require every measured API sample below 10 ms with no CPU-limit failures;
   report headroom and coverage. Missing metrics cannot pass the CPU gate.
4. Prove the static article still returns its exact bytes while the counting API
   fails. Do not exhaust account-wide quotas or inject faults into production.
5. Delete only the recorded experimental Worker/database. Preserve production
   resources and counts. Write a migration proposal only after these gates pass.

The probe uses fake article paths only. It does not import private data, expose
credentials, change account plans, add routes, or enable a production workflow.
Local SQLite tests establish SQL/API behavior, not deployed performance or the
Python-to-JavaScript bridge; those require the separate Cloudflare test.

Reproduction:

- Use Python 3.14 and uv >= 0.12.3 (required by workers-py 1.17.8).
- `uv run --python 3.14 pytest --cov=app --cov-report=term-missing`.
- Copy `wrangler.example.jsonc` to ignored `wrangler.jsonc`. Supply unique
  disposable resource names/IDs and your workers.dev origin. Never reuse any
  production binding. Initialize the new D1 using `../../migrations/0001_article_views.sql`.
- With an authorized account token supplied through the environment, run
  `uv run --python 3.14 pywrangler deploy`. The committed uv/pylock files pin
  the native test and deployed package resolutions respectively.
- Send alternating GET/POST to `/api/views` with slug `/blog/pw012-probe`;
  POST needs the exact configured Origin. Stay below 30 combined requests per
  minute from one IP, so timing covers D1 rather than early rate rejection.
- Retrieve invocation `cpuTimeMs` from Workers Logs at 100% sampling. Distinguish
  successful D1 calls from rejection/fault handlers. Never use HTTP wall time as CPU.
- To test a real storage outage, first verify the exact disposable database
  identity, then drop its `article_views` table. Check `/api/views` returns 503
  and the static fixture still returns HTTP 200 with identical bytes.
- Delete the exact recorded disposable Worker and database; verify both absent.

References: [Python Workers](https://developers.cloudflare.com/workers/languages/python/),
[CPU limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time),
[Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/),
[CPU telemetry API](https://developers.cloudflare.com/api/resources/workers/subresources/observability/subresources/telemetry/methods/query/).

This is not full production contract/security parity: route publication,
edge-metadata verification, malformed URL decoding, exact method/error handling
and frontend regression checks remain migration acceptance requirements.
