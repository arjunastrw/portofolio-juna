# SEO

## Yang sudah dikerjakan

Semua dibuat saat `npm run build`, jadi tidak ada yang perlu diisi manual.

- **HTML prerender.** `scripts/prerender.mjs` me-render seluruh isi situs (layout bertumpuk,
  semua window terbuka) ke `dist/index.html`, lalu React meng-hydrate-nya. Crawler, preview link
  (WhatsApp/LinkedIn/Slack), dan pengunjung tanpa JS langsung dapat semua konten. Di layar
  desktop, HTML ini disembunyikan sampai desktop Win98 siap, jadi tidak ada layout shift (CLS 0).
- **Meta tag** dari `src/seo.ts` (sumber datanya `src/data/portfolio.ts`): title, description
  (< 160 karakter), canonical, robots, Open Graph (`og:image` 1200×630 + alt), Twitter card.
  Di-inject ke `<!--seo-->` di `index.html` oleh plugin di `vite.config.ts`.
- **Structured data (JSON-LD)**: `WebSite`, `ProfilePage`, `Person` (jabatan, Jakarta,
  `knowsAbout` dari toolkit, `sameAs` GitHub + LinkedIn). Tanpa nama klien; build gagal kalau
  ada istilah NDA yang lolos.
- **`robots.txt`, `sitemap.xml`** (lastmod = tanggal build), **`404.html`** (noindex).
- **Performa**: preload 2 font utama, sprite ikon digambar per warna (HTML 148 KB → 55 KB,
  7 KB gzip).
- Satu `<h1>` (nama + jabatan), satu `<h2>` per window.

Lighthouse (build lokal via `vite preview`): mobile dan desktop **100 / 100 / 100 / 100**
(Performance, Accessibility, Best Practices, SEO). LCP 1,3 s mobile, 0,3 s desktop, CLS 0.

Cek ulang setelah deploy:

```bash
curl -s https://arjunastrw.web.id/ | grep -c 'application/ld+json'   # harus 1
curl -s https://arjunastrw.web.id/robots.txt
curl -s https://arjunastrw.web.id/sitemap.xml
```

Validator: https://search.google.com/test/rich-results dan https://validator.schema.org
(tempel URL situs).

## Prasyarat: deploy dulu

GitHub Action hanya deploy dari branch `main`. Selama perubahan masih di `version-2`, situs live
belum punya sitemap/robots/meta baru (saat dicek: `sitemap.xml` 404).

## Setup Google Search Console

Pakai **Domain property** (verifikasi lewat DNS). Satu property mencakup `http`, `https`, dan
semua subdomain, dan tidak perlu file/meta tag di repo. DNS `arjunastrw.web.id` ada di
**Sumopod** (`ns1.sumopod.com`, `ns2.sumopod.com`).

1. Buka https://search.google.com/search-console, login dengan akun Google yang mau dipakai.
2. **Add property** → pilih kotak kiri **Domain** → isi `arjunastrw.web.id` → Continue.
3. Google menampilkan record TXT: `google-site-verification=xxxxxxxx`. Salin.
4. Di panel DNS Sumopod untuk `arjunastrw.web.id`, tambah record:
   - Type: `TXT`
   - Name/Host: `@` (root domain)
   - Value: `google-site-verification=xxxxxxxx`
   - TTL: default
   Jangan ubah 4 record `A` GitHub Pages (`185.199.108–111.153`).
5. Cek dari terminal sampai record terlihat (biasanya beberapa menit):
   `dig +short TXT arjunastrw.web.id`
6. Kembali ke Search Console → **Verify**.
7. Setelah verified dan situs sudah ter-deploy:
   - **Sitemaps** → isi `sitemap.xml` → Submit.
   - **URL Inspection** → `https://arjunastrw.web.id/` → **Request indexing**.
8. Opsional, **Bing Webmaster Tools** (https://www.bing.com/webmasters): pilih
   "Import from Google Search Console". Tidak perlu verifikasi ulang.

Kalau lebih suka verifikasi via meta tag (URL-prefix property): tambahkan
`<meta name="google-site-verification" content="..." />` di `index.html` setelah `<!--seo-->`,
deploy, lalu Verify. Cara DNS lebih disarankan.

## Yang masih bisa menaikkan ranking (butuh keputusan juna)

- **Nama lengkap.** Situs hanya menyebut "Juna", nama yang sangat umum, sehingga hampir mustahil
  muncul di pencarian nama. Isi `fullName` di `src/data/portfolio.ts`; title, meta, dan JSON-LD
  otomatis ikut.
- **Backlink dari profil sendiri**: isi field Website di GitHub (`arjunastrw`, sekarang kosong)
  dan LinkedIn dengan `https://arjunastrw.web.id/`. Ini sinyal terkuat bahwa situs ini milik
  profil tersebut (cocok dengan `sameAs` di JSON-LD).
- **Foto profil** (`profile.png`, belum dipakai): kalau dipakai, kompres ke WebP < 100 KB dan
  tambahkan sebagai `image` di `Person`.
- **Link repo/demo publik** untuk side project (`url` di `portfolio.ts`) menambah konten yang bisa
  diindeks.
