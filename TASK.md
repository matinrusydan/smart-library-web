# Smart Library — Phased Roadmap

Status: `[ ]` pending · `[~]` implemented, awaiting verification · `[x]` user verified · `[!]` blocked

## Phase 0 — Workspace, PostgreSQL boundary, Design System foundations
- [x] Initialize JavaScript Next.js App Router project at `C:\laragon\www\smart-library-web`.
- [x] Install Knex.js, pg and dotenv; add safe `.env.example` and migration scripts.
- [~] Verify live PostgreSQL 16 connection with project credentials. Service/client 16 exists, but credentials/database are not configured yet.
- [x] Add centralized Light/Dark tokens based on local Smart Library reference evidence.
- [x] Add global UI primitives: Button, Field, Badge, Panel, DataTable, Pagination, Modal.
- [x] Add global shell primitives: Sidebar, Topbar, AppShell.
- [x] Add isolated design-system showcase with labeled fixtures and theme toggle.
- [x] ESLint passes.
- [~] Production build emitted `.next/BUILD_ID`; build console output was incomplete, so full runtime verification remains pending.
- [!] HTTP smoke test could not connect; a subsequent dev launch reported another dev server/lock at port 3000. Resolve startup and rerun browser verification before approval.
- [~] Visual comparison against live Figma Version 2 at matching viewport.
- [x] USER GATE 0: approved by user on 2026-11-02.
- [ ] Follow-up: add configurable selected-row behavior to DataTable after confirming single-select versus multi-select.

### Gate 0 verification
1. Copy `.env.example` to `.env.local`, set the real local PostgreSQL 16 credentials and create/use a dedicated `smart_library` database.
2. Run `npm run dev` and review `http://localhost:3000` in Light and Dark.
3. Review global components, scrim behavior, responsive layout and token fidelity next to Figma Version 2.
4. Approve Phase 0 explicitly before Phase 1 starts.

## Phase 1 — Database schema, migrations, seed, Superadmin CLI
- [ ] PostgreSQL 16 guard and dedicated database setup instructions.
- [ ] Initial normalized schema, reversible Knex migrations and development seed strategy.
- [ ] Interactive hidden-password Superadmin bootstrap CLI with explicit `--role superadmin`, username and name flags.
- [ ] Database/infrastructure and CLI tests.
- [ ] Phase documentation and USER GATE 1.

## Phase 2 — Authentication, Petugas shell and master data
- [ ] Secure sessions, login/logout and server-side authorization.
- [ ] Petugas layout and Dashboard, Buku, Kategori, Siswa using real data.
- [ ] Visual comparison for matching Figma pages in Light/Dark.
- [ ] Phase documentation and USER GATE 2.

## Phase 3 — Circulation, fines and reports
- [ ] Peminjaman, Pengembalian, Denda/Pembayaran, Monitoring Stok.
- [ ] Laporan Peminjaman/Pengembalian and approved export behavior.
- [ ] Modal/overlay interactions and audit history.
- [ ] Phase documentation and USER GATE 3.

## Phase 4 — Superadmin
- [ ] Superadmin account management and Petugas lifecycle.
- [ ] Server-enforced role protection, settings and audit visibility.
- [ ] Superadmin visual language derived from the same design system.
- [ ] Phase documentation and USER GATE 4.

## Phase 5 — Final documentation and quality audit
- [ ] Complete `docs/docs/knowledge` tree modeled on relevant Dashboard Ops categories.
- [ ] Architecture, data flow, security, module, design-system, testing, operations and troubleshooting docs.
- [ ] Full automated checks, browser journeys, accessibility/responsive checks and pixel comparison evidence.
- [ ] Dead-code, hardcoded-style and secret audit.
- [ ] USER GATE 5 / release sign-off.
