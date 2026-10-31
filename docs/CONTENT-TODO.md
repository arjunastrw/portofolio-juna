# Konten yang masih perlu dikonfirmasi

Semua copy ada di `src/data/portfolio.ts`. Item di bawah sudah tampil di situs, tapi
belum dikonfirmasi juna. Tolong cek, lalu hapus barisnya dari file ini kalau sudah benar.

Aturan: nama klien, nama sistem internal, dan singkatannya tidak boleh muncul di situs
maupun di file ini. Jalankan `npm run check:nda` (daftar istilah ada di `.nda-terms`,
yang di-gitignore).

## Masthead

- [ ] Baris "Stack" di masthead: Go · React · TypeScript · Laravel (`headlineStack` di
      `portfolio.ts`, diambil dari grup "At work"). **Belum diverifikasi.**

## Experience

- [ ] Nama employer ditulis "Software vendor". Boleh pakai nama perusahaan?
- [ ] Stack engagement 01: Go / React / TypeScript / PostgreSQL / Python. Python di sini
      karena tooling migrasinya. Masih sesuai?
- [ ] Engagement 01, kontribusi kedua masih umum ("Contribute to the platform's backend
      services and its web frontend"). Bisa lebih spesifik?
- [ ] Migrasi data issuer: perlu dirinci (pemetaan skema, script migrasi, validasi)?
      Tanpa angka sampai ada data yang disetujui.
- [ ] Stack engagement 02: Laravel / PHP / SQL Server. Masih sesuai?
- [ ] Status peer-analysis dashboard ditulis "In user testing". Masih benar, dan boleh
      disebut?
- [ ] Deskripsi satu kalimat yang aman untuk dashboard peer-analysis dan modul annual
      review, kalau mau lebih informatif.
- [ ] "Several internal applications" untuk integrasi SSO. Boleh sebut jumlahnya?

## Side projects

- [ ] Kelima project tetap ditampilkan? Copy diambil dari situs lama (`js/data.js`).
- [ ] Simmer SDK: versi lama menyebut Python di PyPI, versi React menyebut TypeScript.
      Yang tampil sekarang Python. Kalau ada di PyPI, link-nya bisa ditambahkan.
- [ ] Tidak ada link repo karena semua repo private. Tambahkan `url` kalau ada yang publik
      atau punya demo.

## Lainnya

- [ ] Email `arjunastrw@gmail.com` dan LinkedIn `linkedin.com/in/arjunasatria`. Ada dua
      versi LinkedIn di kode lama (`arjunasatria` dan `arjunastrw`).
- [ ] Riwayat sebelum Oct 2024 (pendidikan, pekerjaan lama): tampilkan atau tidak?
- [ ] Foto profil (`profile.png`, 3,8 MB) belum dipakai.
- [ ] `docs/REVIEW.md` berisi nama klien. Hapus atau pindahkan sebelum commit apa pun.
