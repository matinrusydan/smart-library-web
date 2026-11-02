# Application Modules

## Authentication and layout
Opaque database sessions are resolved in `src/server/auth.js`. `/login` authenticates users; protected routes use the Petugas App Router group and shared `AppShell`, `Topbar`, and `Sidebar`. Only `superadmin` and `petugas` roles exist.

## Catalogue and students
`src/server/queries.js` performs server-side reads; `src/app/actions/library.js` validates and persists book/category/student edits. Client components in `src/features/library/` provide lists, pagination, filters and editors. The `/siswa` page additionally exposes bulk `.xlsx` import.

## Circulation, fines and reports
`src/server/circulation.js` implements borrowing, return, stock and full fine-payment rules. `circulation-queries.js` supplies list/summary reads. `circulation-export.js` creates formula-protected Excel workbooks for filtered reports. The six routes are `/peminjaman`, `/pengembalian`, `/denda`, `/monitoring-stok`, `/laporan-peminjaman`, and `/laporan-pengembalian`.

## Superadmin accounts and settings
`src/server/admin-accounts.js` enforces Superadmin-only Petugas lifecycle operations and self-service profile/password operations. `/petugas` is role-protected for account administration; `/pengaturan` is available to authenticated staff for personal settings.

## Shared UI
Global tokens are in `src/styles/tokens.css`; shared shell primitives and controls are under `src/components/`. Feature UI should compose these shared components and tokens rather than introduce duplicated page styles.
