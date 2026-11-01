# Getting Started

## Status and scope
This document describes Phase 0 foundations only. Business modules, authentication, and schema migrations are deferred until their respective user-approved phases. See `TASK.md` for gates.

## Requirements
- Node.js 22 or compatible supported runtime
- npm
- PostgreSQL 16 installed locally for database work
- Access to the Smart Library Figma file for visual validation

## Install and run
```powershell
cd C:\laragon\www\smart-library-web
npm install
Copy-Item .env.example .env.local
# Edit .env.local with the local PostgreSQL credentials and dedicated DB name
npm run dev
```
Open http://localhost:3000. The current Phase 0 page is a design-system component showcase with clearly labeled UI fixture data; it is not connected to business tables.

## PostgreSQL status
Knex and `pg` are installed. Set `DATABASE_URL` in `.env.local`. No database password is assumed or stored. Do not point this app at another project database. Phase 0 connection check is pending credentials and the dedicated `smart_library` database.

## Commands
- `npm run dev` — start local development server; verify that port 3000 is free and no stale `.next/dev` locks remain
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run db:status` — list Knex migration status (requires DB configuration)
- `npm run db:migrate` — apply migrations (schema is introduced in Phase 1)
