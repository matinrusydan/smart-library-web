# Session dan Akses — Phase 2

## Batas akses

Website hanya memiliki dua role: `superadmin` dan `petugas`. Keduanya boleh mengakses halaman operasional Petugas; fitur administrasi akun untuk Superadmin baru dikerjakan di Phase 4. Akun awal Superadmin dibuat melalui CLI, bukan melalui registrasi publik. Password yang tersimpan adalah hash Argon2, bukan teks asli.

## Alur yang harus diverifikasi

1. Login memeriksa username, status aktif, dan hash password di server; pesan kegagalan tidak mengungkap apakah username ada.
2. Session tersimpan di database; cookie browser memuat token acak, HttpOnly dan SameSite=Lax, dengan `Secure` saat berjalan lewat HTTPS di production. Database menyimpan hash token, bukan token mentah.
3. Halaman terlindungi dan setiap Server Action memeriksa session serta role di server sebelum query maupun mutasi. Menyembunyikan menu bukan otorisasi.
4. Logout mencabut session dan menghapus cookie; session kedaluwarsa atau dicabut ditolak.
5. Login, logout, akses tanpa session, akses role salah, perubahan data, dan kebocoran pesan error diuji sebelum Gate 2 disetujui.

**Status:** sesi, login/logout, dan pemeriksaan otorisasi diimplementasikan. Migration 002 telah diterapkan pada PostgreSQL 16 `smart_library` dan tidak ada migration pending. Pengujian anonim membuktikan halaman terlindungi mengalihkan ke login dan API daftar mengembalikan 401. Belum ada pengujian login/logout terautentikasi maupun penolakan role salah dengan browser; jangan menganggap pemeriksaan anonim sebagai bukti seluruh alur autentikasi benar. Pengaturan `pg_hba.conf` untuk kewajiban password pada localhost belum diverifikasi.
