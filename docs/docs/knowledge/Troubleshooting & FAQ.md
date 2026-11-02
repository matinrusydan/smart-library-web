# Troubleshooting & FAQ

## Next.js says another development server is running
Stop only the PID printed by Next.js after confirming it belongs to this project. If no such process exists, delete the stale `.next/dev/lock`, then run `npm run dev` again. Do not kill unrelated Node.js processes.

## Database check fails
Create `.env.local` from `.env.example`, use credentials for the local PostgreSQL 16 instance, and ensure the dedicated `smart_library` database exists. Run `npm run db:check`. The script rejects PostgreSQL versions other than major version 16.

## Why is the page not yet claimed as 1:1 Figma?
The source tokens and local reference files were used, but exact fidelity needs a live side-by-side comparison at matching viewport. Build success is not visual evidence.

## Bulk student import does not progress

The current job driver is browser-based. Reopen Data Siswa, open Import siswa, and use Lanjutkan import. The database job retains its committed progress; the local browser stores only a job ID. Closing the tab or losing connectivity can pause requests. Do not upload the same file repeatedly as a substitute for resume.

## Import reports an invalid header

Download the application template. Its first sheet uses the exact ordered headers `NIS`, `Nama`, `Kelas`, `Email`, `Telepon`. Keep NIS as text to preserve leading zeroes. Fix all validation errors before confirming. Remove or replace the clearly labeled sample row before importing real students.

## Import API fails after updating source

Check pending migrations with `npm run db:status` against an approved dedicated PostgreSQL 16 database. Migration 004 creates the job table. Do not blindly run migrations against production or another project's database. Unexpected server errors are intentionally masked from client responses.

## Missing Kelola Petugas navigation

Only Superadmin sees `/petugas`; services also enforce that role. Petugas can access their own `/pengaturan`. Hiding a navigation entry is not a security boundary.

## What do passing automated tests establish?

They establish only the assertions in the test suite. Current tests do not replace authenticated browser journeys, real database concurrency checks, accessibility review, workbook visual inspection or deployment testing. See `Testing Strategy.md`.
