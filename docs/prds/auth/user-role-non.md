# Aturan Pengguna & Hak Akses — Jaza Venus

Dokumen ini menjelaskan siapa yang bisa mengakses apa di aplikasi Jaza Venus. Silakan dicek: apakah aturannya sudah sesuai?

---

## 1. Ringkasan

Aplikasi ini punya **4 jabatan** (role), tapi akses tiap orang bisa diatur sendiri-sendiri sesuai kebutuhan. Semua menu tetap terlihat — tapi kalau seseorang tidak punya akses, menunya **abu-abu dan tidak bisa diklik**. Tombol di halaman juga akan **mati** (disabled) kalau tidak punya izin.

---

## 2. Empat Jabatan (Role)

| Jabatan | Siapa | Aksesnya |
|---------|------|---------|
| **Developer** | IT / pembuat aplikasi | Buka semua halaman. Satu-satunya yang bisa lihat halaman log error. |
| **SuperAdmin** | Keluarga pemilik (~4 orang) | Buka semua halaman bisnis + atur pengguna + atur izin akses. Tidak bisa lihat halaman log error. |
| **Admin** | Cadangan | Saat ini tidak dipakai oleh 8 orang yang sudah spesifik. |
| **Sales** | Staf umum | Paling terbatas. Akses akan ditentukan kemudian. |

---

## 3. 8 Orang dengan Akses Spesifik

Setiap orang di bawah ini punya aturan akses yang berbeda. Tidak pakai jabatan standar — aksesnya diatur satu per satu.

### Keterangan Tabel

- ✅ edit = bisa lihat, bisa buat baru, bisa ubah data (tapi **tidak bisa hapus**)
- ✅ edit+hapus = bisa lihat, buat baru, ubah, **dan hapus**
- ❌ = tidak bisa akses (menu abu-abu, tidak bisa diklik)

#### 1. Didi

| Modul | Akses |
|-------|-------|
| Master (data induk) | ✅ edit |
| Pembelian (Purchase) | ✅ edit+hapus |
| Penjualan (Sales) | ✅ edit+hapus |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | Hanya **Laporan Piutang (A/R)** |

#### 2. Pai

| Modul | Akses |
|-------|-------|
| Master (data induk) | ✅ edit |
| Pembelian (Purchase) | ✅ edit+hapus |
| Penjualan (Sales) | ❌ |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ✅ edit+hapus |
| Laporan | Hanya **Laporan Piutang (A/R)** |

#### 3. Nenden

| Modul | Akses |
|-------|-------|
| Master (data induk) | ✅ edit |
| Pembelian (Purchase) | ✅ edit+hapus |
| Penjualan (Sales) | ❌ |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | **Semua laporan** (Penjualan, Gudang, Pembelian, Piutang) |

#### 4. Atep

| Modul | Akses |
|-------|-------|
| Master (data induk) | ✅ edit |
| Pembelian (Purchase) | ❌ |
| Penjualan (Sales) | ✅ edit+hapus |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | Hanya **Laporan Piutang (A/R)** |

#### 5. Yane

| Modul | Akses |
|-------|-------|
| Master (data induk) | ❌ |
| Pembelian (Purchase) | ❌ |
| Penjualan (Sales) | ✅ edit+hapus |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | ❌ Tidak ada |

#### 6. Ilham

| Modul | Akses |
|-------|-------|
| Master (data induk) | ❌ |
| Pembelian (Purchase) | ❌ |
| Penjualan (Sales) | ❌ |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | Hanya **Laporan Piutang (A/R)** |

#### 7. Robby

| Modul | Akses |
|-------|-------|
| Master (data induk) | ❌ |
| Pembelian (Purchase) | ❌ |
| Penjualan (Sales) | ❌ |
| Piutang (A/R) | ❌ |
| Inventori / Gudang | ❌ |
| Laporan | Hanya **Laporan Piutang (A/R)** dan **Laporan Penjualan** |

#### 8. Alvin

| Modul | Akses |
|-------|-------|
| Master (data induk) | ✅ edit |
| Pembelian (Purchase) | ❌ |
| Penjualan (Sales) | ❌ |
| Piutang (A/R) | ✅ edit+hapus |
| Inventori / Gudang | ❌ |
| Laporan | **Semua laporan** (Penjualan, Gudang, Pembelian, Piutang) |

---

## 4. Aturan Tampilan

| Situasi | Yang Terjadi |
|---------|-------------|
| Punya akses penuh ke modul | Menu bisa diklik, semua tombol berfungsi |
| Punya akses tapi tidak bisa hapus | Tombol **Hapus** disembunyikan |
| Punya akses tapi tidak bisa ubah | Form hanya bisa dibaca (read-only), tombol Simpan mati |
| Tidak punya akses sama sekali | Menu **abu-abu**, tidak bisa diklik |
| Buka halaman langsung lewat URL | Muncul pesan "Akses Dibatasi" + tombol kembali ke Dashboard |

---

## 5. Aturan Laporan

Laporan ada 4 kategori:
1. Laporan Penjualan (Sales Report)
2. Laporan Gudang (Inventory Report)
3. Laporan Pembelian (Purchase Report)
4. Laporan Piutang (A/R Report)

Setiap orang hanya bisa buka laporan yang diizinkan. Misalnya Didi hanya bisa buka Laporan Piutang — tiga laporan lainnya **abu-abu** di menu. Di dalam Laporan Piutang, semua sub-halaman bisa dibuka.

---

## 6. Siapa yang Bisa Atur Pengguna?

| Tugas | Developer | SuperAdmin | Lainnya |
|-------|-----------|------------|---------|
| Buat pengguna baru | ✅ | ✅ | ❌ |
| Ubah nama / email / jabatan | ✅ | ✅ | ❌ |
| Ganti password pengguna lain | ✅ | ✅ | ❌ |
| Atur izin akses per orang | ✅ | ✅ | ❌ |
| Nonaktifkan pengguna | ✅ | ✅ | ❌ |

Pengaturan izin akses dilakukan lewat halaman Kelola Pengguna. Ada dialog untuk mengatur akses modul dan laporan per orang, seperti tabel di atas.

---

## 7. Keamanan

- Setiap login pakai email internal (contoh: `didi@jaza.local`) + password
- Email hanya sebagai identitas login — bukan email asli, tidak ada pengiriman email
- **Hanya Developer dan SuperAdmin yang bisa mengganti password** pengguna. Pengguna biasa tidak bisa ganti password sendiri.
- Password minimal 12 karakter (huruf besar, kecil, angka, simbol)
- Salah password 5x → akun terkunci 15 menit
- SuperAdmin wajib pakai kode keamanan (MFA / Google Authenticator)
- Setiap 24 jam harus login ulang (sesi otomatis habis)
- Semua aktivitas (login, ubah data, hapus) tercatat — ketahuan siapa yang melakukan

---

## 8. Preferensi Pribadi

Setiap pengguna bisa atur sendiri:

| Pengaturan | Pilihan |
|-----------|---------|
| Bahasa | Indonesia / Inggris |
| Ukuran teks | Kecil / Normal / Besar |
| Tema | Terang / Gelap |

Pengaturan disimpan ke database. Saat login lagi (besok atau kapan pun), pengaturan otomatis kembali seperti sebelumnya — tidak perlu atur ulang.

---

## 9. Konfirmasi

Apakah aturan akses di atas sudah sesuai dengan yang Bapak/Ibu inginkan?

Jika ada yang perlu diubah (misalnya: Didi seharusnya juga bisa buka Laporan Penjualan, atau Alvin tidak boleh hapus data Piutang), mohon dikabari sebelum kami mulai membangun.

Setelah dokumen ini disetujui, kami akan mulai membuat sistem login dan hak akses sesuai aturan di atas.
