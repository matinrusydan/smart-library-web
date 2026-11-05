# Bootstrap Akun Superadmin — Phase 1

## Tujuan dan batas
Phase 1 menyediakan cara aman untuk membuat akun awal `superadmin` melalui command line. Ini bukan UI login, manajemen akun Petugas, atau session implementation; semua itu berada di fase berikutnya. Role aplikasi yang direncanakan hanya `superadmin` dan `petugas`.

## Kontrak penggunaan
Perintah direncanakan sebagai:

```powershell
npm run user:create -- --role superadmin --username <username> --name <nama>
```

Password harus diminta secara interaktif dan input disembunyikan; jangan menerima password sebagai argumen command line atau menyimpan credential di seed, dokumentasi, `.env.example`, shell history, maupun commit. Password harus di-hash dengan algoritma password khusus sebelum tersimpan. CLI harus menolak role selain `superadmin`, input tidak valid, dan username duplikat.

## Operasional aman
- Konfigurasikan `DATABASE_URL` lokal melalui `.env.local` dan gunakan hanya database khusus `smart_library` pada PostgreSQL 16.
- CLI wajib memverifikasi major version PostgreSQL sebelum query mutasi.
- Jika koneksi, versi, atau nama database tidak memenuhi syarat, CLI berhenti dengan pesan aman; jangan mencoba database lain.
- Seed development tidak membuat user maupun password default.

## Verifikasi
Gate Phase 1 memerlukan test guard/validasi/role, migrasi pada database dedicated setelah koneksi terverifikasi, lalu pembuatan akun dengan password prompt tersembunyi. Password/hash tidak dicetak kembali dalam output.

## Initial Superadmin Credential (Environment Reference)
Untuk keperluan pengujian rilis dan deployment awal sistem:
- **Username**: `admin`
- **Initial Password**: `Adminperpus123!`
- **Role**: `superadmin`
- **Scope**: Local Development (`smart_library`) & Vercel Production (`neondb`)
- **Hash Algorithm**: Argon2id via `argon2` npm package.
