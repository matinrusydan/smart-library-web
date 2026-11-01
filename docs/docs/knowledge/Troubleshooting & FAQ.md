# Troubleshooting & FAQ

## Next.js says another development server is running
Stop only the PID printed by Next.js after confirming it belongs to this project. If no such process exists, delete the stale `.next/dev/lock`, then run `npm run dev` again. Do not kill unrelated Node.js processes.

## Database check fails
Create `.env.local` from `.env.example`, use credentials for the local PostgreSQL 16 instance, and ensure the dedicated `smart_library` database exists. Run `npm run db:check`. The script rejects PostgreSQL versions other than major version 16.

## Why is the page not yet claimed as 1:1 Figma?
The source tokens and local reference files were used, but exact fidelity needs a live side-by-side comparison at matching viewport. Build success is not visual evidence.
