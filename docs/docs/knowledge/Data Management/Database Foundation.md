# Database Foundation — Phase 0

Smart Library uses local PostgreSQL 16 via Knex.js and the `pg` driver. Set `DATABASE_URL` in the ignored `.env.local` using `.env.example` as the template. `knexfile.js` loads this file for CLI migrations, while Next.js loads it for server runtime. Do not include passwords in docs, code, or commits.

No business tables, migrations, seed data, or credentials were created in Phase 0. The PostgreSQL 16 Windows service and `psql` binary were observed, but credentials and actual connection were not verified; this is explicitly pending in `TASK.md`. Phase 1 must include version checks and reversible migrations before writing business data.
