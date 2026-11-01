# Testing Strategy — Phase 0

## Verification evidence
- ESLint checks source correctness and React rules.
- Production build checks compilation and Next.js route output.
- Browser verification must separately check theme persistence, filtering/pagination, keyboard-operable dialog, visual Light/Dark rendering and responsive layout.
- Compare with Figma at matching viewport; compilation is not evidence of pixel parity.
- Database connection requires a dedicated database and configured credentials, followed by an explicit PostgreSQL 16 version check.

## Current limitations
No business flows, schema, authentication or permission checks exist yet. Automated lint/build results do not imply that Gate 0 has been approved. The user owns phase approval.
