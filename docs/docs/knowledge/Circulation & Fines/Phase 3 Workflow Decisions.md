# Phase 3 Workflow Decisions

Decisions confirmed by the user on 2026-11-02:

- Default loan period: 7 calendar days from the borrowing date.
- Late fine: IDR 1,000 per day per borrowing transaction, independent of the number of copies in that borrowing.
- Fine payment: one payment must settle the full outstanding balance; partial payment is not supported.
- Return flow: staff may accept the books even if a fine remains unpaid; the return completes and a separate outstanding fine is recorded.
- Borrowing and return report export format: Excel `.xlsx` (not CSV-only).

Implementation implications:

- Fine accrual is calculated from the borrowing due date through the actual return date; define an open-loan view using the current date for overdue monitoring without creating duplicate daily fine records.
- Returning a transaction should be idempotent and transactional: record return, restore available book quantities once, calculate/store the final fine if late.
- A fully paid fine should record a payment row and update fine paid amount/status atomically; reject underpayment and overpayment.
- These are product rules, not yet a completed or user-approved Phase 3 implementation. Gate 3 remains pending until UI, real database flows, tests, and documentation are verified by the user.
