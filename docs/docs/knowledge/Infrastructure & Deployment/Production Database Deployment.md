# Production Database Deployment

Production database credentials are provided exclusively through the deployment environment (or its secret manager) as `DATABASE_URL`; do not copy `.env.example` or `.env.local` into production. The example file is only for local development. Knex resolves `.env.local` from the repository root in non-production environments, regardless of the directory from which a CLI command is launched. In production, dotenv loading is disabled.

The Knex `production` configuration supports PostgreSQL 16 only and retains the connection-time allowlist: the connected database name must match `SMART_LIBRARY_DATABASE_NAME`, which defaults to `smart_library`. Set that value explicitly only when the intended dedicated production database has a different approved name. The database guard does not provision databases or credentials. Production config intentionally has no seed directory; never run the development seed command against production.

Deployment operator checklist:

1. Provision a dedicated PostgreSQL 16 database and a least-privilege application role outside this application.
2. Configure secret-managed `DATABASE_URL` and, when necessary, `SMART_LIBRARY_DATABASE_NAME` in the runtime environment. Restrict network access and TLS according to the hosting platform; this repository does not prescribe provider-specific TLS settings.
3. Deploy the application and apply reviewed migrations explicitly with the Knex `production` environment. Do not run seeds in production.
   Migration `202611020003_required_roles.js` provisions required role constants idempotently; it does not create any accounts or demo records. Review the migration status before and after applying it. Packaged `npm run db:migrate` targets **development**, so do not use that script as a production deployment command.
4. Confirm the hosting platform's backup, restore, monitoring, rotation, and migration/rollback procedures before launch.

This repository does not define a hosting provider, provisioning automation, CI/CD pipeline, TLS policy, backup schedule, or production migration orchestration. These require deployment-environment decisions and operational verification. The local `db:check` script remains oriented toward the development `.env.local` workflow and is not a production deployment command.
