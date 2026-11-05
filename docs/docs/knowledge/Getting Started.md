# Getting Started

## Status and scope
This document describes the Smart Library web application across all implemented phases through Phase 4. Features include authentication, master data (buku, kategori, siswa), circulation (peminjaman, pengembalian), fines and full payments, stock monitoring, Excel-exportable reports, self-service settings, Superadmin account administration, and bulk student import. See `TASK.md` for gate status and unresolved verification boundaries.

## Requirements
- Node.js 22 or compatible supported runtime
- npm
- Dedicated PostgreSQL 16 database (`smart_library`)
- Access to the Smart Library Figma file (`kNDLPmgGdLgo3AKQn8FEyk`, Version 2 page 153:54) for visual verification

## Install and run
```powershell
cd C:\laragon\www\smart-library-web
npm install
Copy-Item .env.example .env.local
# Edit .env.local with your dedicated PostgreSQL 16 credentials
npm run dev
```
Open http://localhost:3000. Unauthenticated requests redirect to `/login`.

## Database setup
1. Verify database version and dedicated database name:
   ```powershell
   npm run db:check
   ```
2. Check migration status:
   ```powershell
   npm run db:status
   ```
3. Run migrations:
   ```powershell
   npm run db:migrate
   ```
4. Create the initial Superadmin using the interactive hidden-password CLI:
   ```powershell
   npm run user:create -- --role superadmin --username <username> --name "<Nama Lengkap>"
   ```
   Atau untuk database produksi (Neon Cloud):
   ```powershell
   npm run user:create:prod
   ```

### Initial Superadmin Reference
Untuk keperluan verifikasi dan testing akses awal:
- **URL**: `https://smart-library-web-ten.vercel.app/login` (atau `http://localhost:3000/login`)
- **Username**: `admin`
- **Password**: `Adminperpus123!`
- **Role**: `superadmin`

## Available commands
- `npm run dev` — start local development server
- `npm run lint` — run ESLint
- `npm run build` — run Next.js production build
- `npm run test:backend` — run all 25 automated backend tests
- `npm run db:check` — verify dedicated PostgreSQL 16 connection and database allowance
- `npm run db:status` — view Knex migration status
- `npm run db:migrate` — apply forward migrations
- `npm run db:rollback` — roll back the last migration batch
- `npm run user:create` — interactive Superadmin creation CLI
