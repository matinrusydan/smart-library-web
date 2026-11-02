# Architecture and Data Flow

## Runtime shape

Smart Library is a JavaScript full-stack Next.js App Router application. PostgreSQL 16 is accessed through Knex. There is no separate public API server: server-rendered routes, Server Actions and Route Handlers share the same repository and domain services.

## Source boundaries

- `src/app/` — route composition, layouts, Server Actions and Route Handlers.
- `src/features/` — feature-level client and server UI compositions.
- `src/components/` — shared layout and UI primitives.
- `src/server/` — authenticated domain services, queries, validation and workflows. Server modules must not enter client bundles.
- `src/lib/` — infrastructure such as database configuration.
- `src/styles/tokens.css` — visual tokens exposed to Tailwind; shared components consume the tokens.
- `database/migrations/` — forward schema changes; `database/seeds/` — development-only seed data.
- `tests/` — automated Node tests.

## Request/data flow

1. A user reaches an App Router page. The protected Petugas layout resolves an opaque session via `src/server/auth.js` and redirects unauthenticated users to `/login`.
2. Server Components call server services/queries directly. They do not call their own HTTP endpoints for server-side reads.
3. Client interactions submit Server Actions or call Route Handlers. Those entrypoints and server services validate inputs and enforce roles; authorization must not rely on hidden navigation alone.
4. Server services query or mutate PostgreSQL through Knex. Business mutations use transactions and audit records where required.
5. Response data is shaped to feature needs; secrets, password hashes and raw database errors must not be returned to clients.

## Bulk student import flow

The `.xlsx` preview endpoint bounds upload size/row count, validates exact headers and all rows, then persists a draft job. The user confirms; subsequent bounded requests process at most 100 rows, with student writes and the job cursor committed transactionally. Unique NIS conflicts are skipped and never overwrite existing students. The browser stores only the job ID and resumes by polling authenticated job endpoints. Internal batch details are not displayed. If the tab closes, polling pauses; this implementation is not an autonomous Vercel Queue worker. Runtime/upload constraints require deployment-specific verification.

## Database discipline

Use a dedicated PostgreSQL 16 database only. Migrations are the source of schema; migrations must be reviewed before application. Never run test writes against another project's database. Details: `database/migrations/` and `Infrastructure & Deployment/Database Operations.md`.
