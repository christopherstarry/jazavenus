# Dokumen Persetujuan Proyek — Jaza Venus

Dokumen ini dibuat untuk Bapak/Ibu sebagai panduan sebelum proyek dimulai. Isinya menjelaskan masalah, solusi, fitur, jadwal, dan biaya proyek.

---

## 1. Ringkasan Proyek

Saat ini, aplikasi warehouse dan distribusi Jaza masih berjalan di **Windows XP** dan dibuat dengan teknologi yang sudah lama (VB + SQL Server). Aplikasi ini tidak bisa diperbarui, tidak bisa dijalankan di komputer modern, dan sulit untuk dirawat.

Kami akan menggantinya dengan **Jaza Venus** — aplikasi baru berbasis website yang:
- Bisa diakses dari mana saja (laptop, tablet, HP)
- Punya fitur yang **persis sama** dengan aplikasi lama
- Lebih **cepat**, lebih **aman**, dan bisa dirawat **selamanya**

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

### Tujuan Utama (Wajib Tercapai)

- [ ] **Semua fitur lama pindah** — setiap fitur di aplikasi lama ada di aplikasi baru
- [ ] **Semua alur kerja tidak berubah** — cara kerja tetap sama, tidak perlu belajar ulang
- [ ] **Cepat dan aman** — aplikasi baru lebih cepat dari aplikasi lama, dan keamanannya standar web terkini
- [ ] **Semua data lama dipindahkan** — seluruh data dari SQL Server lama pindah ke sistem baru

### Tujuan Peningkatan (Wajib Tercapai)

- [ ] **Teknologi tahan lama (10+ tahun)** — aplikasi baru bisa dirawat selamanya
- [ ] **Invoice jadi 1 langkah** — pembuatan dan revisi invoice dari 3 langkah jadi 1 langkah
- [ ] **Pembagian peran** — tiap jabatan hanya bisa lihat halaman sesuai tugasnya
- [ ] **Data 5 tahun aktif** — hanya data 5 tahun terakhir yang aktif; data lama diarsipkan
- [ ] **Catatan aktivitas lengkap** — setiap membuat, mengubah, atau menghapus data tercatat siapa dan kapan
- [ ] **Dua bahasa** — bisa pilih Bahasa Indonesia atau Inggris

---

## 4. Siapa yang Akan Pakai?

| Jabatan | Perkiraan Pengguna | Hak Akses |
|---------|-------------------|-----------|
| **Developer** | 1–2 orang | Akses teknis penuh + halaman pemantauan error |
| **SuperAdmin** | 3–4 orang | Semua halaman bisnis, kelola pengguna, pengaturan sistem |
| **Admin** | 7-10 orang | Halaman tertentu (ditentukan kemudian) |
| **Operator / Sales** | 20++ orang | Halaman operasional sehari-hari saja |

**Total**: sekitar 50++ pengguna bersamaan saat jam kerja.

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

Target selesai: **Awal tahun 2027**

| Tahap | Waktu | Hasil |
|-------|------|-------|
| **POC (Demo awal)** | Mei–Jun 2026 | Semua tampilan halaman bisa dilihat dan dinavigasi |
| **Modul utama** | Jul–Ags 2026 | Data master, pembelian, penjualan, inventori berfungsi |
| **Invoice + SFA + Laporan** | Sep–Okt 2026 | Invoice 1 langkah, invoice dari vendor otomatis masuk, semua laporan |
| **Audit + Peran + Bahasa** | Nov 2026 | Catatan aktivitas, pembatasan peran, Bahasa Indonesia + Inggris |
| **Pindah data + Arsip** | Nov–Des 2026 | Semua data lama pindah, data di atas 5 tahun diarsipkan |
| **Pengamanan sistem** | Des 2026 | Sistem diperkuat: pembatasan akses, proteksi serangan, enkripsi |
| **Tes keamanan** | Des 2026 | Pihak ketiga menguji keamanan sistem; semua celah diperbaiki |
| **Uji coba oleh pengguna** | Jan 2027 | 2 minggu karyawan mencoba dengan data asli, perbaikan bug |
| **Pelatihan karyawan** | Jan 2027 | Sesi pelatihan per jabatan (maks 1 jam per orang) |
| **Go-live + potong sistem lama** | Jan 2027 | Beralih dari aplikasi lama ke baru; dukungan penuh 2 minggu pertama |

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
