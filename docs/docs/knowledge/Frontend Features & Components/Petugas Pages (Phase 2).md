# Halaman Petugas — Phase 2

Acuan visual utama: ekspor final Figma `Smart-Library` page `Version 2` di `C:\Users\lilol\Documents\Smart-Library-Figma\figma-shots\` (pengguna mengonfirmasi ekspor lokal adalah final). Target Petugas: `v2-login.png`, `v2-dashboard.png`, `r-buku.png`, `v2-master-kategori.png`, `v2-data-siswa.png`, serta ekspor modal terkait. Bandingkan hasil render pada viewport referensi 1024 × 880, termasuk mode Light/Dark yang tersedia. `v2-dashboard-dark.png` menampilkan **Admin**, sehingga tidak boleh dijadikan struktur dashboard Petugas mode gelap. Acuan lokal ini bukan bukti otomatis bahwa implementasi sudah 1:1.

## Cakupan

- **Login:** satu formulir tanpa sidebar; tidak ada akun demo yang tertanam dalam aplikasi.
- **Dashboard:** satu-satunya halaman dengan global search, statistik dari database (bukan fixture) dan navigasi operasional.
- **Daftar Buku:** tabel berpaginasi, filter lokal, tambah buku lewat modal overlay (bukan halaman tambahan).
- **Master Kategori:** kolom Kategori, Status Aktif/Tidak Aktif, Aksi Edit; tidak memuat kolom Jumlah Buku.
- **Data Siswa:** NIS, nama, Kelas berupa satu rombel gabungan, email, Aksi Edit; filter Kelas tunggal.

Semua daftar menampilkan pilihan ukuran halaman 10/25/50/100. Modal menggunakan scrim hitam 50% dan mempertahankan halaman di belakang. Komponen global hidup di `src/components`, komposisi khusus halaman di `src/features`. Buku, kategori, dan siswa memakai sumber data PostgreSQL melalui query terautentikasi; showcase tetap fixture terpisah.

**Status:** pengguna menolak kesesuaian desain; perbaikan visual berdasarkan ekspor final sedang berjalan. Login, shell responsif, Dashboard (termasuk pencarian tiga sumber data), daftar Buku/Kategori/Siswa, filter, pagination dan modal tambah/edit sudah memiliki implementasi fungsional awal dengan data server, tetapi tidak boleh dinyatakan 1:1 sampai perbandingan screenshot halaman per halaman dilakukan. Aksi import siswa belum diimplementasikan dan tidak ditampilkan sebagai tombol mati. Uji login, CRUD, tema Light/Dark dan responsive secara langsung masih diperlukan. Menu fase selanjutnya berupa label non-klik, bukan fitur aktif.

## Bukti audit visual sementara

- Hasil render Login 1024 × 880: `C:\Users\lilol\AppData\Local\Temp\opencode\smart-login-final-1024.png`, dibandingkan dengan `figma-shots/v2-login.png` (keduanya dibaca dan dibandingkan secara langsung). Struktur split, posisi logo, kartu login, dan ilustrasi buku mendekati referensi; tipografi, detail ikon, serta copy/nilai contoh sengaja tidak disalin persis. Ini **belum** memenuhi klaim 1:1.
- Lint, 10 tes backend, dan build production lulus setelah perubahan visual. Ini membuktikan kode dapat dibangun, **bukan** paritas visual.
- Dashboard, Buku, Kategori, Siswa, modal, dan mode gelap masih perlu screenshot terautentikasi pada viewport yang sama; tidak ada kredensial pengguna yang dikumpulkan atau disimpan untuk pengujian ini.

## Penerjemahan kode referensi ke React

`C:\Users\lilol\Documents\Smart-Library-Figma\smart-library` berisi prototipe vanilla JavaScript dan Web Components (`sl-sidebar`, `sl-topbar`, `sl-stat`, `sl-panel`, `sl-table`) bersama `assets/{tokens,base,layout}.css`. Pola visual dan interaksinya dipakai sebagai acuan untuk komponen React di `src/components` dan `src/features`. Ini bukan aplikasi React yang dapat disalin langsung: token lama `--sidebar-w: 250px`, konten lama, dan akun demo tidak cocok dengan ekspor final Petugas Version 2. Website memakai sidebar Petugas 200px, autentikasi server, dan data PostgreSQL nyata. Port visual tidak mengganti batas keamanan/data tersebut. Kesesuaian 1:1 belum disetujui pengguna.
