# Database Migrations and Domain Seeds (Phase 1)

## Skema database
Skema awal Phase 1 didefinisikan dalam `database/migrations/202611020001_initial_schema.js` dengan relasi yang dinormalisasi:
- `roles`: `id`, `name` unik dengan check constraint (`superadmin`, `petugas`), timestamps.
- `users`: `role_id` (FK ke `roles`, RESTRICT), `username` unik, `name`, `password_hash`, `is_active`, timestamps.
- `categories`: `id`, `name` unik, `description`, timestamps.
- `books`: `category_id` (FK ke `categories`), `isbn`, `title`, `author`, `publisher`, `publication_year`, `stock_total`, `stock_available` dengan check constraint stok, timestamps.
- `students`: `student_number` unik, `name`, `class_name` (rombel gabungan seperti `XI MIPA 2`), `email`, `phone`, `is_active`, timestamps.
- `borrowings`: `student_id` (FK ke `students`), `user_id` (petugas pencatat), `borrowed_at`, `due_at`, `returned_at`, `status` (`borrowed`, `returned`, `overdue`), `notes`, timestamps.
- `borrowing_items`: `borrowing_id` (CASCADE), `book_id` (RESTRICT), `quantity` positif, unik per peminjaman-buku, timestamps.
- `fines`: `borrowing_id`, `student_id`, `amount`, `paid_amount`, `reason`, `status` (`unpaid`, `partial`, `paid`), timestamps.
- `payments`: `fine_id`, `user_id`, `amount` positif, `paid_at`, `method`, `reference`, timestamps.
- `audit_logs`: pencatatan aktivitas terstruktur (`action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`).

Migration bersifat reversible (`down` menghapus tabel secara berurutan sesuai relasi FK).

## Guard PostgreSQL 16 & nama database
Setiap script backend (`knexfile.js`, `scripts/check-db.js`, `scripts/create-user.js`) memeriksa bahwa koneksi:
1. Merupakan PostgreSQL major version 16.
2. Terhubung ke database yang diizinkan (default `smart_library`, atau nilai `SMART_LIBRARY_DATABASE_NAME`). Operasi ke database lain diblokir otomatis demi keamanan.

## Seed development
`database/seeds/dev_domain.js` hanya mengisi:
- Role wajib: `superadmin` dan `petugas`.
- Kategori referensi non-sensitif: Fiksi, Sains, dan Sejarah.
- Buku dan siswa belum di-seed; data fixture di showcase terpisah dari database.
- **Tidak ada akun pengguna atau password bawaan dalam seed.** Akun pertama wajib dibuat melalui CLI `npm run user:create`.
