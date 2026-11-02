# Architecture Overview

## Application shape
A single full-stack Next.js App Router application using JavaScript, React, Knex.js, and PostgreSQL. It is intentionally simpler than Dashboard Ops' separate API/web monorepo while retaining explicit module and server boundaries.

## Current source map
- `src/app`: routes, root layout, global CSS entry
- `src/components/layout`: shared shell, sidebar, topbar
- `src/components/ui`: reusable global primitives
- `src/features/design-system`: Phase 0 showcase, including isolated UI fixtures
- `src/styles`: design tokens and global layout/component styles
- `src/lib/db.js`: server-only Knex infrastructure
- `database/migrations`, `database/seeds`: schema history and development seeds; migration 004 adds durable import jobs (application/integration verification pending)
- `src/server`: authenticated catalogue, circulation, account and import services
- `src/features/library`, `circulation`, `accounts`, `settings`: feature compositions

For detailed request flow see `Architecture and Data Flow.md`; module responsibilities are listed in `Application Modules.md`.
- `docs/docs/knowledge`: project knowledge documentation

## Intended data flow
Server Components should call server-side service/repository modules directly. Do not make an internal HTTP request from a Server Component to this same Next app. Client Components are reserved for interactive state. Mutations must validate input and enforce user/role authorization on the server before reaching repositories. Database access is server-only.

## Reference adaptation
Dashboard Ops uses a separated API and frontend with a broader layered architecture. Smart Library starts as one app and adopts modular feature boundaries, explicit server-only data access, tests, and documentation without adding a separate API service or monorepo tooling.
