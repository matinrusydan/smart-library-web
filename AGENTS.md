# Smart Library — Agent Rules

## Execution gates
- Execute one phase only. Stop after producing verification evidence and user instructions.
- Never mark user approval based on automated checks. Do not start Phase 1 until user explicitly approves Phase 0.
- TASK.md is the roadmap/status authority. Keep unresolved blockers visible.

## Architecture
- JavaScript, Next.js App Router, React, Knex.js, PostgreSQL 16. One full-stack application.
- src/app: routing/composition; src/features: feature UI and local components; src/components/ui and layout: shared components; src/server: domain services/repositories; src/lib: infrastructure.
- Server Components read through server services/repositories, not internal HTTP. Client interactivity uses server boundaries with validation and authorization. Never import database code into client components.
- Only superadmin and petugas. Future CLI creates superadmin with hidden interactive password; Petugas management belongs to Superadmin UI. No public registration.

## Design contract
- Visual source of truth: Figma Smart-Library kNDLPmgGdLgo3AKQn8FEyk, Version 2 page 153:54 pending confirmed migration. Never modify Figma during web development without permission.
- Target is 1:1 at matched viewport. Local generators/CSS are reference evidence, not proof of live Figma parity.
- Centralize visual values in tokens. Global patterns use shared components; feature-only compositions stay local. Do not duplicate Light/Dark pages.
- Modal overlays retain page with black 50% scrim, keyboard dismissal/focus handling. Filter bars grow to child height and bottom-align controls.
- No business fixtures in production workflows. Showcase fixtures must be labeled and isolated. No dead controls, unused imports or abandoned scaffold files.
- Constants, labels, domain rules and tokens are legitimate fixed values; do not replace them with needless database configuration.

## Safety / verification
- Never print secrets or commit .env files. No guessed DB password, no destructive DB operations, no use of dashboard-ops database/credentials.
- Use a dedicated database; assert PostgreSQL major version 16 before migrations.
- lint, build, tests and browser evidence are separate checks. Report failures and unverified work honestly.
- Documentation follows docs/docs/knowledge and relevant dashboard-ops categories. Update docs alongside each phase, not only at project end.
- Keep legacy Figma workspace intact. No git push or remote configuration for this new project without user approval.
