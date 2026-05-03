# Dokumen Persetujuan Proyek — Jaza Venus

Dokumen ini dibuat untuk Bapak/Ibu sebagai panduan sebelum proyek dimulai. Isinya menjelaskan masalah, solusi, fitur, jadwal, dan biaya proyek.

---

## 1. Ringkasan Proyek

Saat ini, aplikasi warehouse dan distribusi Jaza masih berjalan di **Windows XP** dan dibuat dengan teknologi yang sudah lama (VB + SQL Server). Aplikasi ini tidak bisa diperbarui, tidak bisa dijalankan di komputer modern, dan sulit untuk dirawat.

Kami akan menggantinya dengan **Jaza Venus** — aplikasi baru berbasis website.

**Yang paling penting**: aplikasi baru akan berjalan **persis sama** dengan aplikasi lama. Semua alur kerja, semua nama menu, semua laporan — sama. Karyawan tidak perlu belajar ulang. Di atas fondasi itu, kami tambahkan perbaikan: invoice 1 langkah, catatan aktivitas, pembagian peran, Bahasa Indonesia, dan koneksi ke SFA vendor.

---

## 2. Masalah Saat Ini

| No | Masalah | Siapa yang kena dampak? | Seberapa parah? |
|----|---------|-------------------------|-----------------|
| 1 | Aplikasi masih pakai Windows XP — sudah tidak ada update keamanan | Semua karyawan | **Sangat parah** |
| 2 | Teknologi lama, tidak bisa diupdate atau diperbaiki | IT / Developer | **Sangat parah** |
| 3 | Bikin invoice butuh 3 langkah terpisah; kalau revisi harus ulang 3 langkah lagi | Sales / Finance | **Parah** |
| 4 | Tidak ada catatan siapa yang mengubah data — tidak bisa audit | SuperAdmin / Manajemen | **Parah** |
| 5 | Semua orang bisa lihat semua data — tidak ada pembatasan peran | Manajemen | **Sedang** |
| 6 | Hanya satu bahasa — tidak bisa ganti ke Bahasa Indonesia | Karyawan non-Inggris | **Sedang** |
| 7 | Data lama menumpuk, tidak ada arsip — aplikasi makin lambat | Semua pengguna | **Sedang** |
| 8 | Tidak ada pemantauan error — bug tidak ketahuan sampai user lapor | Developer | **Ringan** |

---

## 3. Tujuan Proyek

### 🎯 Tujuan #1 — Yang Paling Penting: Operasional Tidak Terganggu

> **Aplikasi baru harus berjalan persis seperti aplikasi lama. Tidak boleh ada alur kerja yang rusak. Tidak boleh ada fitur yang hilang. Tidak boleh ada downtime.**

- [ ] **Semua fitur pindah 100%** — apa yang ada di aplikasi VB lama, ada di aplikasi baru
- [ ] **Semua alur kerja tetap sama** — pembelian, penjualan, gudang, invoice, piutang, laporan — cara kerjanya tidak berubah
- [ ] **Nama menu dan label sama** — karyawan tidak perlu belajar ulang; tampilan menu mengikuti aplikasi lama
- [ ] **Semua data lama pindah** — seluruh data dari SQL Server lama masuk ke sistem baru, tidak ada yang hilang
- [ ] **Operasional tetap jalan saat pergantian** — tidak ada gangguan kerja di gudang saat pindah ke aplikasi baru

### 🎯 Tujuan #2 — Fondasi Baru yang Tahan Lama

> **Ganti teknologi lama supaya aplikasi bisa dirawat dan aman untuk 10+ tahun ke depan.**

- [ ] **Bisa dirawat selamanya** — menggunakan teknologi modern yang didukung jangka panjang
- [ ] **Cepat dan aman** — halaman terbuka lebih cepat dari aplikasi lama, data terlindungi
- [ ] **Bisa diakses dari mana saja** — laptop, tablet, HP, selama ada internet

### 🎯 Tujuan #3 — Perbaikan

> **Perbaiki hal-hal yang selama ini menjadi kendala.**

- [ ] **Invoice jadi 1 langkah** — pembuatan dan revisi invoice dari 3 langkah jadi 1 langkah
- [ ] **Pembagian peran** — tiap jabatan hanya bisa lihat halaman sesuai tugasnya
- [ ] **Catatan aktivitas lengkap** — setiap buat, ubah, hapus data tercatat siapa dan kapan (cegah kecurangan)
- [ ] **Data 5 tahun aktif** — hanya data 5 tahun terakhir yang aktif; data lama diarsipkan (masih bisa dibuka)
- [ ] **Bahasa Indonesia + Inggris** — bisa ganti bahasa kapan saja
- [ ] **Invoice dari SFA vendor otomatis masuk** — tidak perlu input ulang manual

---

## 4. Siapa yang Akan Pakai?

| Jabatan | Perkiraan Pengguna | Hak Akses |
|---------|-------------------|-----------|
| **Developer** | 1–2 orang | Akses teknis penuh + halaman pemantauan error |
| **SuperAdmin** | 1–2 orang | Semua halaman bisnis, kelola pengguna, pengaturan sistem |
| **Admin** | 3–5 orang | Halaman tertentu (ditentukan kemudian) |
| **Operator / Sales** | 15–20 orang | Halaman operasional sehari-hari saja |
| **Finance** | 3–5 orang | Halaman piutang, invoice, pembayaran |
| **Gudang** | 10–15 orang | Halaman stok, penerimaan barang, perpindahan stok |

**Total**: sekitar 35–50 pengguna bersamaan saat jam kerja.

---

## 5. Apa Saja yang Akan Dibangun?

### Tahap 1 — Penggantian Aplikasi Lama (Sekarang)

**Data Master**
- [ ] Data karyawan
- [ ] Data pelanggan + klasifikasi outlet (kelas, grup, lokasi, jenis pasar, channel, tipe, salesman, collector, area penjualan)
- [ ] Data produk + klasifikasi (brand, kategori, sub-kategori, harga, diskon, lokasi gudang, tipe gudang, satuan)
- [ ] Data supplier / principle
- [ ] Data bank
- [ ] Data pajak
- [ ] Data syarat pembayaran
- [ ] Data tipe biaya

**Transaksi Pembelian**
- [ ] Purchase Order (pesanan ke supplier)
- [ ] Penerimaan Barang (GRN)
- [ ] Retur Pembelian

**Transaksi Penjualan**
- [ ] Sales Order (pesanan dari pelanggan)
- [ ] Sales Confirmation (konfirmasi pesanan)
- [ ] Retur Penjualan
- [ ] **Pembuatan Invoice** (disederhanakan dari 3 langkah → 1 langkah)
- [ ] **Penerimaan Invoice dari SFA vendor** — saat sales vendor membuat invoice di sistem SFA mereka, otomatis masuk ke Jaza Venus

**Transaksi Inventori / Gudang**
- [ ] Barang Masuk (BPB)
- [ ] Barang Keluar (BBK)
- [ ] Transfer Antar Gudang
- [ ] Stock Taking (persiapan + pencatatan)

**Transaksi Piutang (A/R)**
- [ ] Transfer Bank
- [ ] Pencairan PDC (cek mundur)
- [ ] Pembatalan Pencairan PDC

**Laporan**
- [ ] Laporan penjualan (semua jenis laporan seperti di aplikasi lama)
- [ ] Laporan inventori
- [ ] Laporan pembelian
- [ ] Laporan piutang
- [ ] Laporan pajak

**Sistem**
- [ ] Login / Logout
- [ ] Ganti password
- [ ] Pengaturan peran (role)
- [ ] Pengaturan pengguna
- [ ] Riwayat aktivitas (audit log) — untuk SuperAdmin
- [ ] Pemantauan error — untuk Developer
- [ ] Pengaturan / preferensi
- [ ] Tutup periode A/R
- [ ] Hitung ulang saldo A/R
- [ ] Hapus dokumen yang dibatalkan

**Fitur Lintas Modul**
- [ ] Catatan aktivitas lengkap (siapa melakukan apa, kapan)
- [ ] Dua bahasa (Indonesia + Inggris)
- [ ] Data 5 tahun aktif + arsip untuk data lama
- [ ] Pemindahan data dari aplikasi lama
- [ ] Dashboard ringkasan harian

### Tahap 2 — Pengembangan Lanjutan (Tidak Sekarang)

- [ ] Scan barcode dari HP
- [ ] Portal pelanggan (customer bisa cek invoice sendiri)
- [ ] Portal supplier
- [ ] Integrasi dengan software akuntansi
- [ ] Prediksi permintaan dengan AI
- [ ] Aplikasi mobile (Android / iOS)

---

## 6. Perbaikan Dibanding Aplikasi Lama

| Aplikasi Lama | Aplikasi Baru |
|--------------|--------------|
| Bikin invoice: 3 langkah terpisah | Bikin invoice: **1 langkah** |
| Revisi invoice: ulang 3 langkah | Revisi invoice: **1 langkah** |
| Tidak ada catatan aktivitas | **Semua aktivitas tercatat** — siapa, apa, kapan |
| Semua orang lihat semua data | **Pembagian peran** — tiap jabatan lihat halaman sesuai tugas |
| Hanya satu bahasa | **Bahasa Indonesia + Inggris**, bisa ganti kapan saja |
| Semua data aktif selamanya | **Data 5 tahun aktif**, data lama diarsipkan |
| Tidak ada pemantauan error | **Developer bisa pantau** error yang terjadi |
| Tidak terhubung SFA vendor | **Invoice dari SFA vendor otomatis masuk** ke Jaza Venus |
| Hanya bisa diakses di komputer kantor | **Bisa diakses dari mana saja** — laptop, tablet, HP |

---

## 7. Jadwal Proyek

Target selesai: **Awal tahun 2027 (Januari–Februari)**

| Tahap | Waktu | Hasil |
|-------|------|-------|
| **POC (Demo awal)** | Mei–Jun 2026 | Semua tampilan halaman bisa dilihat dan dinavigasi |
| **Modul utama** | Jul–Ags 2026 | Data master, pembelian, penjualan, inventori berfungsi |
| **Invoice + SFA + Laporan** | Sep–Okt 2026 | Invoice 1 langkah, invoice dari vendor otomatis masuk, semua laporan |
| **Audit + Peran + Bahasa** | Jan 2027 | Catatan aktivitas, pembatasan peran, Bahasa Indonesia + Inggris |
| **Pindah data + Arsip** | Jan 2027 | Semua data lama pindah, data di atas 5 tahun diarsipkan |
| **Pengamanan + Tes keamanan** | Jan 2027 | Sistem diperkuat; tes keamanan menyeluruh; semua celah diperbaiki |
| **Uji coba + Pelatihan** | Jan 2027 | Karyawan mencoba dengan data asli; pelatihan per jabatan |
| **Go-live + potong sistem lama** | Feb 2027 | Beralih dari aplikasi lama ke baru; dukungan penuh 2 minggu pertama |

---

## 8. Biaya

| Item | Perkiraan Biaya |
|------|----------------|
| Pembangunan aplikasi | (Akan didiskusikan) |
| Server + hosting — Tahun pertama | ~Rp 600.000/bulan (sekitar Rp 7,2 juta/tahun) |
| Nama domain (jaza-venus.com) | ~Rp 250.000/tahun |
| Pengamanan (Cloudflare) | Gratis |
| Sertifikat keamanan (SSL) | Gratis |
| **Total infrastruktur Tahun 1** | **~Rp 7,5 juta** |

---

## 9. Hal yang Perlu Diperhatikan

| Risiko | Dampak | Solusi |
|--------|--------|--------|
| Data lama sangat besar | Pemindahan data bisa lambat | Uji coba pindah data dulu; data > 5 tahun langsung diarsipkan |
| Karyawan sudah terbiasa dengan aplikasi lama 10+ tahun | Bisa bingung kalau tampilan berbeda | Tampilan dan menu dibuat semirip mungkin dengan aplikasi lama |
| Beberapa cabang internetnya lambat | Halaman harus tetap cepat dibuka | Aplikasi dibuat ringan; data ditampilkan per halaman (tidak sekaligus) |
| Data keuangan sensitif | Risiko kecurangan dari dalam | Setiap aktivitas tercatat; akses dibatasi sesuai peran |
| Vendor SFA punya format data berbeda-beda | Invoice bisa gagal masuk | Format invoice diseragamkan; semua percobaan kirim dicatat |

---

## 10. Tanda Tangan Persetujuan

| Nama | Jabatan | Tanggal | Tanda Tangan |
|------|---------|--------|-------------|
| | Pemberi Proyek | | |
| | Manajer Gudang | | |
| | Manajer Keuangan | | |
| | IT / Developer | | |

---

**Setelah dokumen ini disetujui, kami akan mulai membuat tampilan demo (POC) untuk Bapak/Ibu lihat dan beri masukan.**
