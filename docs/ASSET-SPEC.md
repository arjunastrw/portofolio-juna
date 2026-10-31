# Asset spec: 3D stage

Spesifikasi untuk modeling sendiri atau mencari aset CC0. Daftar objeknya ada di
`src/assets/scene-manifest.ts`. Manifest itu sumber kebenarannya; kalau ada yang berbeda
dengan file ini, ikuti manifest, lalu perbarui file ini.

## 1. Aturan umum

- Satuan meter, skala nyata. Blender: Unit Scale 1.0, Length = Meters.
- Sumbu: modeling Z-up di Blender, ekspor glTF dengan `+Y Up` aktif. Di scene: +Y ke
  atas, +Z ke arah penonton. Origin dunia ada di lantai, tepat di bawah tengah meja.
- Origin tiap objek ada di tengah bawah bidang kontaknya (permukaan yang menempel ke meja,
  dinding, atau rak), supaya posisi di code tetap sama saat aset diganti.
- Apply semua transform (Ctrl+A → All Transforms) dan semua modifier sebelum ekspor.
  Object transform harus identity.
- Tepi diberi bevel. Tidak boleh ada tepi tajam 90° tanpa bevel, karena di render tepi
  seperti itu terlihat sebagai "box default". Bevel minimal 1–2 mm untuk props, 3–5 mm
  untuk furnitur. Pakai weighted normals atau bevel dengan `harden normals`.
- Material Principled BSDF saja: base color, roughness, metalness, normal (opsional).
  Tidak ada emission, kecuali layar monitor dan bohlam lampu.
- Palet: gelap dan hangat. Base color tidak boleh lebih terang dari sRGB #D8D0C0 (kertas)
  dan tidak boleh lebih jenuh dari kayu/kardus natural. Tidak ada warna aksen di material.
  Satu-satunya aksen amber berasal dari cahaya lampu.
- NDA: nama klien, nama sistem, atau singkatannya tidak boleh muncul di nama file, node,
  material, tekstur, maupun di teks yang tergambar pada tekstur. `npm run check:nda` hanya
  memeriksa source, jadi aset harus dicek manual.

## 2. Tata letak ruang (meter)

| Elemen | Posisi / ukuran |
| --- | --- |
| Lantai | y = 0 |
| Dinding belakang | bidang di z = −0,42 |
| Meja | 1,60 × 0,75, permukaan atas di y = 0,74, tepi depan z = +0,375 |
| Lampu meja | jepitan di (−0,20, 0,74, −0,36), kepala di (0,00, 1,58, 0,02) |
| S1 Monitor | pusat layar di (0,05, 1,03, −0,25), layar menghadap +Z |
| S2 Rak | papan di (0,63, 1,11, −0,34), 5 kotak di atasnya, jarak antar-pusat 0,085 |
| S3 Pegboard | pusat di (−0,52, 1,10, −0,41) |
| S4 Notebook / telepon | notebook di (0,42, 0,74, 0,14), telepon di (0,64, 0,74, 0,10) |

## 3. Objek

Kolom "Node" adalah nama root node di GLB, sama dengan `id` di manifest. Part di dalamnya
diberi nama `<id>_<part>` (contoh: `monitor_screen`, `desk_lamp_head`).

| id | Stasiun | Ukuran (L × T × D, m) | Tris maks | Lightmap | Catatan |
| --- | --- | --- | --- | --- | --- |
| `room_shell` | room | lantai dan dinding 6 × 3 | 200 | ya | Plane saja; dinding plester matte, lantai kayu/beton gelap |
| `desk` | room | 1,60 × 0,74 × 0,75 | 4.000 | ya | Top kayu atau linoleum gelap, kaki baja. Bevel 3 mm |
| `desk_lamp` | room | 0,30 × 0,86 × 0,45 | 6.000 | ya | Lampu arsitek dengan jepitan. Bagian dalam shade dan bohlam dibuat part terpisah: `desk_lamp_shade_inner`, `desk_lamp_bulb` (emissive) |
| `monitor` | S1 | 0,62 × 0,50 × 0,20 | 5.000 | ya | Layar 0,60 × 0,34 sebagai part `monitor_screen` (material emissive terpisah, tanpa teks) |
| `wall_shelf` | S2 | 0,50 × 0,06 × 0,16 | 800 | ya | Papan dan 2 bracket |
| `archive_box_01`…`05` | S2 | 0,075 × (0,150 / 0,135 / 0,145 / 0,125 / 0,140) × 0,12 | 600 per kotak | tidak (bergerak) | Satu file `archive_boxes.glb`, lima root node. Nomor 01–05 tercetak di punggung (sisi +Z), lihat §6 |
| `pegboard` | S3 | 0,50 × 0,40 × 0,02 | 3.000 | ya | Lubang dari normal map atau alpha, bukan geometri |
| `pegboard_tools` | S3 | 0,46 × 0,34 × 0,06 | 8.000 | ya | 4–6 alat tangan nyata (penggaris, obeng, tang, gulungan selotip, gunting) beserta pengaitnya |
| `notebook` | S4 | 0,296 × 0,012 × 0,21 | 1.500 | ya | Notebook A5 terbuka, halaman tanpa tulisan yang terbaca |
| `pen` | S4 | 0,14 × 0,01 × 0,01 | 600 | ya | |
| `phone` | S4 | 0,072 × 0,008 × 0,147 | 1.200 | ya | Layar mati, tidak menampilkan apa pun |

Total target sekitar 33.000 tris.

## 4. UV

- UV0 (`UVMap`): untuk tekstur material. Boleh overlap atau mirror.
- UV1 (`Lightmap`): khusus lightmap. Wajib unwrap tanpa overlap, tidak mirror, dan tidak
  keluar dari 0–1. Di glTF tersimpan sebagai `TEXCOORD_1`; three.js membacanya sebagai
  `uv1` (`texture.channel = 1`).
- Semua objek `lightmapped: true` berbagi satu atlas. Pack bersama dengan Lightmap Pack,
  atau UVPackmaster kalau ada.
- Padding antar-island minimal 8 px pada resolusi atlas, supaya mip tidak bocor.
- Texel density: sekitar 512 px/m untuk permukaan yang dekat kamera (top meja, dinding di
  belakang stasiun, rak, pegboard), sekitar 128 px/m untuk lantai dan dinding di luar frame.

## 5. Lightmap dan AO (baked)

Scene hanya punya satu sumber cahaya, yaitu lampu meja, ditambah ambient yang sangat
redup. Bake harus memakai lampu yang sama:

- Spot light di posisi `desk_lamp_bulb`, warna sekitar 2.700 K (#F2B56B), sudut sekitar
  57°, blend 0,7. World color #0F0E0C dengan strength yang sangat rendah. Tidak ada lampu
  lain.
- Cycles, Bake Type: Diffuse dengan Direct + Indirect, tanpa Color (lighting saja).
  Minimal 1.024 sample, Denoise OIDN.
- AO sudah termasuk dalam bake indirect, jadi tidak perlu aoMap terpisah untuk objek
  statis. Objek bergerak (kotak arsip) boleh memakai `aoMap` kecil di UV1, khusus kontak
  dengan rak.

### Resolusi dan pencegahan banding

- Atlas 2048 × 2048. Kalau budget memungkinkan dan banding masih terlihat di dinding,
  naikkan ke 4096 × 2048, dengan sisi panjang mengikuti dinding.
- Bake ke **32-bit float (OpenEXR)**, bukan langsung ke PNG 8-bit.
- Konversi ke 8-bit dengan urutan berikut:
  1. Normalisasi exposure: kalikan supaya nilai terang (pool cahaya di meja) sekitar 0,9.
     Catat faktornya sebagai `lightMapIntensity`.
  2. Encode dengan transfer function sRGB. Dengan begitu nilai gelap (dinding, pegboard)
     mendapat lebih banyak kode 8-bit; nilai gelap adalah tempat banding paling terlihat.
  3. Dither triangular (TPDF) ±1 LSB, atau blue-noise, **sebelum** kuantisasi ke 8-bit.
- Encode WebP lossy, quality ≥ 90, dengan `-sharp_yuv`. Target ≤ 700 KB untuk atlas 2048².
  Kalau banding muncul lagi setelah encode, pakai lossless (`-lossless -q 100`); risikonya
  file membesar.
- Di runtime, three.js memuat lightmap dengan `colorSpace = SRGBColorSpace`, dan semua
  material memakai `dithering: true`, supaya falloff lampu real-time di area gelap juga
  tidak banding.
- Lightmap dikirim sebagai file WebP terpisah (`models/lightmap_atlas.webp`), tidak di
  dalam GLB, supaya colorspace dan dithering-nya bisa dikontrol.

### Real-time dan baked tidak boleh dicampur

Mode lighting berlaku untuk satu set ruangan sekaligus, tidak per objek:

- **realtime** (sekarang): semua objek pakai MeshStandardMaterial dan diterangi spot
  lampu. Shadow map dirender sekali, lalu hanya di-refresh saat kotak arsip bergerak.
- **baked** (setelah atlas tersedia): objek statis pakai material `map × lightMap` tanpa
  lampu real-time, supaya tidak tersinari dua kali. Objek bergerak (kotak arsip) tetap
  diterangi spot real-time, dengan intensitas dikalibrasi supaya cocok dengan bake.

## 6. Nomor pada kotak arsip

- Angka 01–05 sesuai urutan project di `src/data/portfolio.ts`. Kalau urutan project
  berubah, tekstur nomor ikut diganti.
- Angka dicetak di punggung kotak (sisi +Z, menghadap kamera), di label kertas sekitar
  40 × 25 mm.
- Font Geist Mono (OFL), tinta gelap di label krem. Tidak ada teks lain.
- Kelima kotak memakai satu tekstur base color 1024 × 1024 berisi lima label (UV0 per kotak
  menunjuk ke label masing-masing).

## 7. Ekspor dan kompresi

Ekspor dari Blender: File → Export → glTF 2.0, Format **glTF Binary (.glb)**, dengan:

- Include: Selected Objects. Cameras dan Punctual Lights **mati**.
- Transform: +Y Up.
- Data: Mesh → Apply Modifiers, UVs, Normals. Tangents mati (dihitung di runtime kalau
  perlu). Vertex Colors mati.
- Material: Export. Images: Automatic.
- Compression di Blender **mati**. Kompresi dikerjakan di langkah berikutnya.

Lalu optimasi dengan meshopt dan tekstur WebP (`@gltf-transform/cli` sudah ada di
devDependencies):

```sh
npx gltf-transform optimize raw/<id>.glb public/models/<id>.glb \
  --compress meshopt --texture-compress webp --texture-size 1024
npx gltf-transform inspect public/models/<id>.glb   # cek tris, ukuran, extension
```

- Draco dan KTX2 tidak dipakai (keputusan D4), supaya tidak ada decoder wasm yang perlu
  diunduh.
- Setelah aset final masuk, set `status: 'final'` di manifest.

## 8. Budget

| Item | Batas |
| --- | --- |
| Semua isi `public/models/` (GLB, tekstur, lightmap) | ≤ 2 MB total, dicek `npm run build` |
| Lightmap atlas | ≤ 700 KB |
| Tekstur base color per props | 1024² maksimal, ≤ 150 KB |
| Triangles keseluruhan | sekitar 35.000 |
| JS awal (gzip) | ≤ 90 KB, dicek `npm run build` |

## 9. Sumber aset CC0

Kalau memakai aset pihak ketiga, isi `source` di manifest dengan nama situs dan lisensi
(contoh: `"Poly Haven, CC0"`), dan simpan URL halaman asalnya di commit message atau di
file ini. Hanya lisensi CC0 atau CC-BY yang atribusinya ditampilkan di colophon.

- Poly Haven (model dan tekstur, CC0)
- ambientCG (tekstur PBR, CC0)
