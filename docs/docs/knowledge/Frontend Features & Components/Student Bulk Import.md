# Student bulk import

## User contract

The Data Siswa page exposes Import siswa beside Tambah siswa using shared components and tokens. The dialog supports downloading a styled Excel template, uploading `.xlsx`, reviewing validation and a limited preview, then explicitly confirming import. Only overall processed/total progress and final added/skipped/failed totals are visible: internal batch numbers, retry attempts and infrastructure details are not displayed.

Existing NIS records are not overwritten. Duplicate NIS within the uploaded file are validation errors. NIS should be entered as text to retain leading zeros. A successful import refreshes the student list.

## Execution boundary

Processing is driven by sequential browser requests against a persistent database job. Closing the tab can pause processing; reopening Data Siswa and selecting Lanjutkan import resumes the saved job without uploading again. This is not an autonomous queue worker. Browser storage holds only a job identifier; server endpoints must enforce job ownership and authorization.

This bounded-request approach reduces database write duration but does not remove initial Excel parsing, memory or upload limits. No claim of verified Vercel deployment compatibility is made solely from local lint/build/tests.

## Verification

Automated checks and workbook tests are reported separately from authenticated browser and PostgreSQL integration evidence. Migrations must run only against an explicitly permitted dedicated PostgreSQL 16 database. No production/student records should be inserted for test purposes.
