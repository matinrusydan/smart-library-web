# Authentication and Security

## Session model

`src/server/auth.js` authenticates usernames and Argon2 password hashes, creates opaque random session tokens, stores only SHA-256 token hashes in PostgreSQL, and sets an HTTP-only, SameSite=Lax cookie. Production cookies use `Secure`. Session lookup rejects revoked, expired, or inactive-user sessions.

## Roles and authorization

Only `superadmin` and `petugas` are supported. The protected route layout redirects unauthenticated users. Server Actions and every domain service must independently enforce authorization; sidebar visibility is presentation only. Petugas can use circulation and master-data flows. Superadmin-only account operations are enforced in `admin-accounts.js`.

## Password/account handling

Passwords are Argon2 hashed and never returned to clients or placed in audit details. The initial Superadmin is created through the hidden interactive CLI. Self-service password change verifies the current password, rotates the password hash and revokes other sessions while retaining the current session. Superadmin reset revokes all target sessions. Deactivation revokes sessions; self-deactivation and deactivation of the last active Superadmin are rejected under a PostgreSQL advisory lock.

## Validation and audit

Server-side validators constrain identifiers, names, usernames, passwords, dates, statuses and pagination. Account changes and circulation mutations record audit events. Student import records aggregate job/batch progress without logging source workbook data or credentials. Unexpected import server failures return a generic client-safe message.

## Remaining security verification

No security claim substitutes for authenticated browser tests, PostgreSQL concurrency testing, dependency review, rate limiting, production TLS, backup/restore exercises and deployment configuration review. These remain release work items in `TASK.md`.
