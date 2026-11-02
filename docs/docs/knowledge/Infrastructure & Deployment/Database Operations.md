# Database Operations

## Database safety contract

- PostgreSQL **16** is required.
- Use only the dedicated Smart Library database (`smart_library` locally or a separately named isolated test database explicitly allowed by configuration).
- Never use credentials, databases, or operational procedures belonging to another project.
- Keep `.env.local` and deployment secrets out of Git and logs.
- Do not run migrations, rollback, seed, or destructive test scripts against an unverified database.

## Local setup and migration operations

```powershell
npm run db:check
npm run db:status
npm run db:migrate
```

`db:check` enforces the configured database allowance and PostgreSQL major version. Inspect pending migration names before applying. Migrations are forward changes and schema history should not be edited after deployment; create a new migration for subsequent changes.

Current migration set includes initial schema, Phase 2 session/category changes, required roles, and Phase 4 student import jobs (004). Migration 004 has not been applied or integration-tested as of the current `TASK.md` status.

## Test database process

1. Create or select a dedicated, empty Smart Library test database through the approved local PostgreSQL administration process.
2. Configure its connection locally without sharing credential text in chat or logs.
3. Confirm `npm run db:check` reports PostgreSQL 16 and the allowed test database.
4. Apply migrations and capture `db:status` evidence.
5. Run integration scenarios with synthetic records and explicit cleanup.
6. Never point tests at production or another application database.

## Hosted database

Before production, decide the provider and document connection pooling, TLS enforcement, backups, restore drills, retention and credential rotation. None is implied by local build/test success.
