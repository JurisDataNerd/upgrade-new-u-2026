# 📑 TASK-004: Form Penilaian Rubrik FGD Buddy & Generator QR Center A4 di Frontend Admin

* **Status:** ⏳ Menunggu TASK-001
* **Target Komponen:** `frontend/admin/pages/buddies/`, `frontend/admin/pages/qr-center.vue`, `frontend/admin/pages/teams/`
* **Prinsip:** Memberdayakan panitia dan Buddy pendamping dengan alat penilaian berbasis adab santri terstandar serta pusat pencetakan kartu QR A4 siap tempel di gedung kampus.

---

## 🎯 Tujuan
1. Menyediakan formulir evaluasi FGD bagi Buddy dengan **rubrik 3 pilar terstandar**: Keaktifan, Kedalaman Visi, dan Adab/Etika.
2. Memastikan panel **QR Center** mampu mencetak kartu QR A4 berkualitas tinggi dengan bingkai pixel art resmi untuk seluruh pos, gerbang, dan stand UKM.
3. Menyediakan visibilitas manajemen rute kelompok (*crowd control*) agar arus maba terbagi merata di 9 lantai gedung.

---

## 🛠️ Rincian Fitur yang Akan Diselaraskan

### 1. Portal Penilaian Rubrik FGD Buddy (`frontend/admin/pages/buddies/[id].vue`)
* Buddy memilih kelompok bimbingannya (misal: *Kelompok 01 - KH. Hasyim Asyari*).
* Memilih sesi diskusi:
  * **FGD 1 (Hari 1 - 08:30):** *"Intention: Ke UNU apa yang kau cari?"*
  * **FGD 2 (Hari 1 - 10:00):** *"Agent of Change & Bela Negara"*
  * **FGD 6 (Hari 3 - 11:00):** *"Refleksi Impact & Kontribusi Mahasiswa"*
* **Komponen Rubrik Penilaian 3 Pilar per Mahasiswa:**
  * 🌟 **Keaktifan Diskusi (1 - 5):** Partisipasi, keberanian berbicara, inisiatif.
  * 💡 **Kedalaman Visi & Analisis (1 - 5):** Relevansi argumen dengan nilai-nilai kampus.
  * 🤝 **Adab, Etika & Kolaborasi (1 - 5):** Sopan santun, mendengarkan orang lain, sikap tawadhu'.
  * 📝 **Catatan Apresiasi Buddy:** Kolom feedback personal untuk mahasiswa.
* Aksi Simpan:
  * Panggil `POST /api/buddy/evaluations` ➔ Nilai tersimpan dan XP (+40 s/d +200 XP) langsung masuk ke akun mahasiswa secara real-time.

### 2. Generator & Pusat Cetak Kartu QR Center A4 (`/qr-center`)
* Menyediakan filter kategori cetak:
  1. **18 Pos Mini Game (9 Lantai, Zona A & B):** Kartu pos bertuliskan nama pos, nomor lantai, logo fakultas, dan instruksi main.
  2. **Gerbang Presensi:** Kartu besar *Presensi Masuk Pagi* & *Presensi Pulang Sore* (Hari 1, 2, 3).
  3. **20+ Stand Ormawa Expo:** Kartu resmi stand UKM lengkap dengan nama organisasi, kategori, dan nomor booth.
* **Standar Layout Cetak (Print CSS `@media print`):**
  * Ukuran standar lembar A4 portrait.
  * Bingkai ornamen pixel art khas *GENIUS UNU 2026*.
  * QR Code ukuran besar di tengah (mudah dipindai dari jarak 1 - 2 meter).
  * Instruksi singkat: *"Arahkan kamera aplikasi GENIUS Anda ke kode QR ini"*.
  * Tombol **"Cetak Seluruh Pos Lantai Ini"** atau **"Cetak Semua (PDF)"** satu klik.

### 3. Manajemen Rute Kelompok / Crowd Control (`/teams`)
* Di halaman `/teams`, admin dapat melihat alokasi rute per kelompok:
  * Kelompok 01 - 04: Mulai penjelajahan dari Lantai 1 & 2.
  * Kelompok 05 - 08: Mulai penjelajahan dari Lantai 3 & 4.
  * Kelompok 09 - 12: Mulai penjelajahan dari Lantai 5 & 6.
  * Kelompok 13 - 16: Mulai penjelajahan dari Lantai 7 & 8.
* Fitur ini menjamin tangga dan selasar 9 lantai tidak macet saat sesi Campus Quest dimulai pukul 09:30.

---

## ✅ Checklist Pengerjaan
- [ ] Implementasikan form rubrik 3 pilar pada detail Buddy `/buddies/[id]`.
- [ ] Tambahkan tombol submit cepat per mahasiswa dan "Submit Nilai Seluruh Anggota".
- [ ] Sempurnakan tata letak CSS cetak A4 di `/qr-center` (bebas dari navbar/sidebar admin saat dicetak).
- [ ] Uji cetak virtual printer (Save as PDF) untuk memastikan ketajaman QR Code.
- [ ] Tampilkan rute kelompok pada tabel manajemen regu `/teams`.
