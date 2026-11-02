# Deployment Readiness

## Current boundary

The application builds with Next.js and uses PostgreSQL through Knex. The hosting provider is not selected. Local lint, tests and build do not prove that a host's runtime, request duration, upload limits, Node native dependencies, database connectivity, or file-download behavior work in production.

## Vercel-specific considerations to resolve

- Student import currently parses an uploaded workbook in an HTTP request, persists a durable job, then processes bounded batches through sequential browser-triggered requests. Closing the browser pauses work; this is not an autonomous queue.
- A bounded database batch does **not** bound the initial upload, ExcelJS workbook parsing time/memory, or total client polling time.
- Before deployment, verify request body/upload size, function duration, memory, Node runtime support for `argon2`, database networking/connection pooling, function concurrency and rate limiting on the selected Vercel plan.
- Decide whether import requires a durable queue/background consumer that continues when the user's browser closes. Do not describe the current browser driver as background processing.
- Confirm migrations run as a controlled release operation, not on each request.

## Production release checklist

- [ ] Hosting provider and plan selected; runtime limits recorded.
- [ ] Production PostgreSQL provider, PostgreSQL 16, TLS and pool configuration verified.
- [ ] Environment secrets configured outside source control and rotated.
- [ ] Rate limits and abuse controls set for login, uploads and mutation routes.
- [ ] Backup retention and restore drill documented.
- [ ] Migration release procedure tested against a production-like clone.
- [ ] Authenticated browser flows and file exports/imports tested on deployed preview.
- [ ] Error monitoring and privacy-conscious logs configured.
- [ ] User approves final release gate.
