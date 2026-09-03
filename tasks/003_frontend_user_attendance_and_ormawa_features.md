# 📑 TASK-003: UI Presensi QR Gate & Penjelajah Stand Ormawa Expo di Frontend User

* **Status:** ⏳ Menunggu TASK-002
* **Target Komponen:** `frontend/user/src/views/`, `frontend/user/src/components/`
* **Prinsip:** Menerapkan Zero-Install PWA menggunakan kamera browser untuk presensi gerbang dan perburuan lencana pameran UKM Hari ke-3.

---

## 🎯 Tujuan
1. Memfasilitasi mahasiswa baru melakukan **presensi mandiri** via kamera handphone tanpa perlu memasang aplikasi tambahan.
2. Menyediakan **katalog penjelajah stand Ormawa Expo** yang membuat mahasiswa aktif berinteraksi dengan stand UKM di selasar Lantai 3, 4, dan 5.
3. Menyediakan **kuesioner kepulangan harian** yang rapi sebelum check-out.

---

## 🛠️ Rincian Fitur yang Akan Dibangun

### 1. Komponen Pemindai Kamera HTML5 Universal (`QrScannerModal.vue`)
* Menggunakan kamera native browser (`navigator.mediaDevices.getUserMedia`).
* Desain HUD bingkai pixel art RPG dengan garis radar pemindaian bergerak (*scanline animation*).
* Bunyi *beep* 8-bit saat QR berhasil terbaca.
* Penanganan izin kamera yang ramah: Menampilkan instruksi jika kamera diblokir browser.

### 2. Modul Presensi Gerbang Harian (`AttendanceView.vue`)
* Menampilkan status hari aktif acara (Hari 1, 2, atau 3):
  * **Sesi Pagi (07:00 - 07:30):**
    - Tombol besar: **"📷 Scan QR Kedatangan Gerbang"**.
    - Memanggil `POST /api/attendance/check-in`.
    - Muncul animasi badge emas *"HADIR TEPAT WAKTU (+100 XP)"*.
  * **Sesi Kepulangan (16:00):**
    - Sebelum scan kepulangan, muncul modal **Kuesioner Refleksi Harian**:
      - 3 Pertanyaan Rating Bintang (1-5): Fasilitas Kampus, Pemahaman Materi, Pendampingan Buddy.
      - 1 Kolom Esai Singkat: *"Pelajaran atau inspirasi terbaik apa yang Anda peroleh hari ini?"*
    - Tombol simpan refleksi otomatis membuka kamera scan QR Pulang.
    - Status check-out tersimpan (+50 XP).

### 3. Modul UKM / Ormawa Expo QR Hunting (`OrmawaExpoView.vue` - Hari 3)
* **Katalog Stan Pameran UKM (Selasar Lantai 3, 4, 5):**
  * Filter Kategori: *Sains & AI, Seni & Budaya, Olahraga Beladiri, Sosial & Relawan*.
  * Kartu booth interaktif: Menampilkan nomor stand (misal: `E3-01`), foto icon, nama UKM, deskripsi karya/prestasi, dan tautan Instagram resmi.
* **Mekanisme Perburuan Lencana (Badge Hunting):**
  * Di setiap kartu stand terdapat tombol **"Scan QR Booth Ini"**.
  * Saat terpindai, sistem menembak `POST /api/ormawa/scan`:
    * Efek animasi: Lencana UKM (contoh: Lencana Perisai Pagar Nusa, Lencana Chip Robotika) berubah dari warna abu-abu menjadi berwarna emas berkilau.
    * Menambahkan bonus **+75 XP** per stan.
* **Counter Progres Pemburu UKM:**
  * Header menampilkan counter kemajuan: *"Stand Dikunjungi: 4 / 10 (Bonus XP: +300 / +750 XP)"*.
  * Setelah mencapai 10 stan, counter menampilkan status *"Kuota Bonus Maksimal Tercapai! Anda tetap dapat memindai untuk membuka seluruh koleksi lencana paspor"*.

---

## ✅ Checklist Pengerjaan
- [ ] Buat komponen scanner kamera `QrScannerModal.vue` dengan fallback input manual (untuk antisipasi kamera HP rusak/bermasalah).
- [ ] Buat tampilan Presensi Harian dengan indikator status Check-In pagi dan Check-Out sore.
- [ ] Buat modal Kuesioner Refleksi Harian 3 rating bintang + kolom esai singkat.
- [ ] Buat halaman Ormawa Expo dengan grid stan pameran UKM.
- [ ] Buat galeri koleksi lencana UKM pada Paspor Digital MABA.
- [ ] Uji responsivitas pada layar mobile Android dan iOS.
