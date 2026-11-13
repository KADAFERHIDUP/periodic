# Periodic

Tabel periodik 118 unsur dalam 3D yang bisa berubah susunan: **tabel**, **bola**, **heliks**, dan **grid**.

## Fitur

- Animasi perpindahan susunan yang halus, tiap unsur bergerak bergantian
- Geser untuk memutar (di mode tabel: geser untuk menggeser), scroll atau cubit untuk zoom
- Warna berdasarkan **kategori**, **blok** (s, p, d, f), atau **wujud** pada 25 °C
- Klik keterangan warna untuk menyembunyikan atau menampilkan kelompok unsur
- Cari unsur lewat simbol, nama, atau nomor atom (contoh: `Fe`, `emas`, `79`), tekan Enter untuk membuka detailnya
- Klik unsur untuk melihat nomor atom, massa atom, kategori, golongan, periode, blok, dan wujud
- Tombol keyboard: `1` tabel, `2` bola, `3` heliks, `4` grid, `Esc` menutup detail
- Tampilan HP sudah disesuaikan

## Teknis

HTML, CSS, dan JavaScript murni tanpa library. Efek 3D memakai CSS `transform` dengan `perspective`, jadi ringan dan jalan di browser mana pun.

```
index.html
css/style.css
js/data.js   data 118 unsur
js/app.js    susunan, animasi, kamera, interaksi
```

Jalankan lokal:

```bash
python -m http.server 8000
# buka http://localhost:8000
```

Terinspirasi dari demo tabel periodik 3D karya Julian Garnier di CodePen dan contoh CSS3D three.js. Kode di sini ditulis ulang dari awal.

---

Dibuat oleh Ahmad Umraithi
