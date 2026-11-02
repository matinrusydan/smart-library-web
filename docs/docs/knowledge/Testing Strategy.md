# Testing Strategy

## Evidence categories

Checks must be reported independently because each establishes a different claim:

1. **Lint** (`npm run lint`) checks ESLint and React rules.
2. **Backend tests** (`npm run test:backend`) cover pure validation, migration/source contracts, circulation calculations, account policy, student import parsing and styled workbook generation.
3. **Production build** (`npm run build`) checks compilation and emitted Next.js routes.
4. **Database integration** checks migrations, transactions, authorization, concurrency and data invariants against an isolated dedicated PostgreSQL 16 database.
5. **Authenticated browser journeys** check real forms, dialogs, downloads, filters, pagination, theme, logout and role visibility.
6. **Responsive/accessibility review** checks keyboard focus, screen-reader labels, overflow, mobile navigation and matched desktop/mobile viewports.
7. **Visual comparison** compares screenshots with the Version 2 Figma source at the same viewport.
8. **Deployment verification** checks the selected production platform, environment, upload/runtime limits, TLS, secrets, backups and restoration.

Passing one category does not imply another passed. In particular, lint/build are not evidence of database correctness, browser behavior, deployment readiness or Figma parity.

## Automated suite

`npm run test:backend` currently runs:

- `backend-foundations.test.js` — production Knex configuration, PostgreSQL guard, database allowance and hidden-password CLI.
- `phase2-backend.test.js` — validation, stock invariants, dashboard query shape and migration source boundary.
- `phase3-circulation.test.js` — calendar validation, borrowing rules and fine calculation.
- `phase3-queries.test.js` — circulation query/filter validation.
- `phase4-admin-accounts.test.js` — account input, password policy, activation and Superadmin safeguards.
- `student-import.test.js` — import rows, duplicate detection, leading-zero NIS, exact headers, styled template and import bounds.

These are not database integration tests unless explicitly stated in the test itself.

## Safe database verification

Before any database mutation:

1. Use only a dedicated Smart Library test database.
2. Run `npm run db:check` and confirm PostgreSQL major version 16.
3. Run `npm run db:status` and inspect pending migrations.
4. Do not reuse credentials or databases from other projects.
5. Prepare known test records and a cleanup strategy; do not use production/student data.
6. Record migration version, scenarios and observable results.

Migration 004 and bulk import remain unverified against PostgreSQL until this explicit procedure is followed.

## Gate policy

Automated checks never approve a user gate. The user must review the evidence and explicitly approve progression. Unverified work remains visible in `TASK.md` even after a gate is approved.
