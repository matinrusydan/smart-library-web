# Batas Arsitektur Phase 0.1 dan Phase 1

## Tujuan
Smart Library adalah satu aplikasi Next.js App Router dengan React dan JavaScript. Pola modular `dashboard-ops` dipakai sebagai prinsip pemisahan UI, domain, dan akses data, **tanpa** membawa monorepo dan proses API Fastify terpisah. Semua data bisnis kelak berasal dari PostgreSQL 16 melalui Knex, tidak dari fixture UI.

## Aliran data yang dituju
- Server Component membaca lewat service/repository server secara langsung, bukan melakukan `fetch` HTTP ke Route Handler milik aplikasi sendiri.
- Interaksi client hanya memanggil server boundary dengan validasi dan pengecekan izin; boundary memanggil service, lalu repository Knex.
- SQL, connection string, dan password tidak boleh diimpor ke Client Component. Data showcase Phase 0.1 adalah fixture demonstrasi visual saja.
- Pilihan jumlah data per halaman (`10`, `25`, `50`, `100`) adalah state UI; query bisnis nanti mengirim `limit` dan `offset` yang tervalidasi di server, bukan memuat seluruh tabel ke browser.

## Pemisahan modul
`src/components/ui` menampung komponen global; `src/features/*` menampung komposisi lokal; `src/styles/tokens.css` menjadi sumber nilai tema; `src/server` untuk domain, repository, dan guard; `database/migrations` serta `database/seeds` untuk perubahan skema dan data development. Kontrak rinci berkembang per fase setelah gate diverifikasi pengguna.

## Batas Phase 1
Phase 1 menyiapkan skema, migration, seed development tanpa rahasia, dan bootstrap Superadmin melalui CLI. Phase 1 **bukan** implementasi login, API bisnis, CRUD Petugas, atau UI Superadmin; itu dijadwalkan pada fase berikutnya.
