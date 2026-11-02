# Phase 3 Integration

## Implemented boundaries

- Staff routes: `/peminjaman`, `/pengembalian`, `/denda`, `/monitoring-stok`, `/laporan-peminjaman`, `/laporan-pengembalian`.
- Shared client composition: `src/features/circulation/CirculationPage.js`; all pages retain the global staff shell.
- Read API: `GET /api/circulation` with `kind`, `query` (or `q`), `page`, `pageSize`, `status`, `from`, `to`. Page sizes are 10/25/50/100. API returns `items`, `total`, `page`, `pageSize`, `pageCount`.
- Roles: read and mutation services require an authenticated `superadmin` or `petugas`; navigation is not the authorization boundary.
- Existing server actions handle borrowing, whole-transaction returns, and full fine payment; business rules are recorded in Phase 3 Workflow Decisions.
- Overdue status is computed from Jakarta calendar today and due date, not dependent on a scheduled status mutation.
- Query dates are PostgreSQL DATE values formatted as `YYYY-MM-DD` so driver timezone conversion does not shift them.

## Reports

`GET /api/circulation/export?kind=borrowing-report|return-report` accepts the same report filters. ExcelJS produces an XLSX attachment; a 10,000-transaction export cap rejects oversized requests instead of silently truncating. Each borrowed book is a workbook row. Return report fine figures are per transaction, not per copy; summing repeated rows is not a valid fine total. User-controlled strings are escaped against spreadsheet formula interpretation.

Dependency audit after ExcelJS installation reports moderate transitive advisories, including minimatch and uuid (24 total across full dependency tree; 9 production advisory entries). No high/critical findings were reported by `npm audit --omit=dev --audit-level=high`, but audit exits nonzero due moderate findings. No forced downgrade/fix was applied.

## Verification boundary

Pure validation tests and production build do not establish PostgreSQL transaction correctness, concurrency safety, actual downloaded workbook accuracy, or Figma parity. These still require isolated database and authenticated browser verification. No test accounts or demo business rows were added to the user's database. Live Figma tool availability was intermittent; local reference and shared project components were used without claiming pixel parity. Gate 3 remains pending.
