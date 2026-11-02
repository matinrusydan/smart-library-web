# Smart Library — Phased Roadmap

Status: `[ ]` pending · `[~]` implemented, awaiting verification · `[x]` user verified · `[!]` blocked

## Phase 0 — Workspace, PostgreSQL boundary, Design System foundations
- [x] Initialize JavaScript Next.js App Router project at `C:\laragon\www\smart-library-web`.
- [x] Install Knex.js, pg and dotenv; add safe `.env.example` and migration scripts.
- [x] Live `db:check` verified PostgreSQL 16 and dedicated `smart_library` database (2026-11-02).
- [x] Add centralized Light/Dark tokens based on local Smart Library reference evidence.
- [x] Add global UI primitives: Button, Field, Badge, Panel, DataTable, Pagination, Modal.
- [x] Add global shell primitives: Sidebar, Topbar, AppShell.
- [x] Add isolated design-system showcase with labeled fixtures and theme toggle.
- [x] ESLint passes.
- [x] Production build verified successfully during Phase 0.1/1.
- [x] Production HTTP smoke test on temporary port 3107 returned HTTP 200 and showcase markup. Interactive browser visual checks remain pending.
- [~] Visual comparison against live Figma Version 2 at matching viewport.
- [x] USER GATE 0: approved by user on 2026-11-02.
- [x] Phase 0.1: Tailwind CSS v4 configured with `@theme inline` mapping to centralized tokens.
- [x] Phase 0.1: UI primitives and layout migrated to Tailwind utilities; dead CSS files removed.
- [x] Phase 0.1: Configurable page-size selector (`10`, `25`, `50`, `100`) added to `Pagination` with page reset/clamping in showcase.
- [ ] USER GATE 0.1: user verification of Tailwind foundation and page-size selector.

## Phase 1 — Database schema, migrations, seed, Superadmin CLI
- [x] PostgreSQL 16 and allowlisted dedicated DB guard (`smart_library` by default).
- [x] Initial normalized schema and reversible Knex migration.
- [x] Development seed for roles/domain data; no default user or credential.
- [x] Interactive hidden-password Superadmin CLI with `--role`, `--username`, `--name`; Argon2 hash.
- [x] Focused database guard and CLI validation tests (4/4 pass).
- [x] Initial architecture and Superadmin bootstrap documentation.
- [x] Live `db:check` and `db:status` verified PostgreSQL 16 / `smart_library` and one completed migration with no pending migrations; user reported migration, seed, and Superadmin `admin` creation succeeded. No password was exposed or re-entered by agent.
- [x] Hidden CLI prompts repaired and covered by mock TTY tests; full backend tests 6/6 passed.
- [x] Full lint passes; backend focused tests pass (4/4); production Next.js build passes (static `/` and `/_not-found`).
- [~] Browser/UI visual validation and live Figma 1:1 comparison still require user review; no claim of pixel parity.
- [~] USER GATE 1: user requested moving to Phase 2 after CLI fix; UI 1:1 review still pending.

## Phase 2 — Authentication, Petugas shell and master data
- [~] Database-backed opaque sessions, Argon2 login, logout, and server-side authorization implemented; authenticated login/logout journey not yet manually verified.
- [~] Petugas layout, Dashboard, Buku, Kategori, Siswa, real-data lists, and edit/create overlays implemented; authenticated CRUD and responsive browser journeys remain to be verified.
- [!] User rejected visual 1:1 claim. Final local Version 2 exports confirmed by user; visual rework implemented for Login/Dashboard/Buku/Kategori/Siswa. A real 1024 × 880 Login screenshot was compared to `v2-login.png`; text/details and spacing still differ, so parity is not claimed. Authenticated Dashboard/Buku/Kategori/Siswa and Light/Dark screenshots still require real browser comparison. `v2-dashboard-dark.png` is Admin, not Petugas.
- [x] USER GATE 2: user approved moving to Phase 3 on 2026-11-02. Phase 2 implementation committed and pushed; live authenticated browser CRUD journeys, full pixel parity, and production PostgreSQL password enforcement remain noted as unverified.
- [x] Production-hardening pass: catalogue book edits now lock the row, reject stale stock totals, and derive availability from outstanding copies; creation initializes availability from total. Production Knex config accepts deployment environment credentials without loading `.env.local` or exposing production seeds. Required role constants are bootstrapped in forward migration 003 (not yet applied to local DB). Layout unified across all Petugas routes via AppShell: single shared vertical flex layout with explicit padding (top 22px, horizontal 32px desktop / 20px mobile, bottom 48px, gap 20px) and no inner max-w/mx-auto wrapping; Topbar, Dashboard and RecordList now share the exact same fluid gutters. Lint, 12 backend tests and build passed; live authenticated browser CRUD and visual parity remain unverified. No deployment/production readiness claim yet.

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

## Release boundary
- [!] User requested **all roadmap features** for production on 2026-11-02; hosting provider not chosen. This is not a Phase 2-only limited release. Gates 2–5, live UI and data-flow checks, operations (TLS, backups/restore, secrets, rate limiting), and deployment choice must be closed before release.
