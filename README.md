# Smart Library Web

Aplikasi perpustakaan sekolah berbasis JavaScript, Next.js App Router, React, Knex.js, dan PostgreSQL 16 lokal.

## Status pengerjaan
Saat ini **Phase 0**: fondasi aplikasi dan design-system showcase. Fitur bisnis, autentikasi, schema/migrations, dan akun belum dibuat. Eksekusi harus berhenti pada setiap user gate di `TASK.md`.

## Menjalankan lokal
```powershell
cd C:\laragon\www\smart-library-web
npm install
npm run dev
```
Buka http://localhost:3000. Setelan PostgreSQL ada di `.env.local` (buat dari `.env.example`); jangan commit file rahasia. Detail setup: `docs/docs/knowledge/Getting Started.md`.

## Verifikasi kode
```powershell
npm run lint
npm run build
```

## Design fidelity
Target acuan visual adalah Figma Smart-Library, page `Version 2`. Phase 0 menyalin token dari referensi lokal dan membuat primitives/showcase; parity visual 1:1 harus dikonfirmasi melalui perbandingan Figma live pada viewport yang sama. Jangan klaim sudah 1:1 sebelum gate itu lulus.

Lihat `AGENTS.md` untuk aturan proyek dan `TASK.md` untuk phase/gate.
