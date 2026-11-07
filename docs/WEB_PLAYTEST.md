# Benteng Lembah — Playtest web Project X

7 November 2026 · Pemilik produk Zephyr · Pelaksana Codex

Benteng Lembah menguji bagian pembuka [Master GDD 001–044](MASTER_GDD.md). Pemain mengatur profesi, menyuplai proyek, dan menjaga permukiman sampai fajar ketiga. Peta, sprite, dan antarmuka digambar dengan Canvas dan CSS dari aset orisinal. Komposisi permukiman berpagar dan penempatan HUD mengacu pada dua screenshot Final Outpost yang dilampirkan.

## Memainkan

Ekstrak seluruh ZIP playtest atau buka checkout repo, lalu buka `web-slice/index.html` di Microsoft Edge. Folder `assets/` perlu tetap berdampingan dengan `web-slice/`. Pilih **Mulai ekspedisi**. Panduan interaktif berada di samping peta. Saran rute pertama:

1. Tugaskan 2 pengumpul pangan, 1 penebang, 1 penambang, 2 penjaga, dan 2 pembangun. Jalankan 1×.
2. Pilih petak dekat pusat, pesan Kebun, dan amati kiriman bahan serta progres. Setelah selesai, pilih Kebun untuk menugaskan pengumpul pangan.
3. Bangun Pos jaga di petak timur. Pilih pos dan tekan **Tempatkan penjaga**. Perbaiki tembok bila HP turun.
4. Jika deposit habis, pilih deposit pengganti. Jika gudang penuh, kurangi stok melalui proyek atau tunjuk gudang lain secara manual.

Sesi disimpan otomatis di browser dengan kunci terpisah. Mode file lokal mengikuti dukungan penyimpanan browser masing-masing. Kembali dari tab lain dalam kondisi jeda. Sesi baru meminta konfirmasi.

## Perilaku slice dan gap

| Area | Cakupan slice | Pengembangan tersisa |
| --- | --- | --- |
| Profesi dan peta | Enam profesi, petak tetap, pusat, hunian, kebun, gudang, pos, tembok, dua sumber per bahan, fokus kamera | Medan dan pathfinding. Pergerakan kini mengikuti jarak garis lurus, termasuk saat melewati tembok. Penugasan sumber/gudang berlaku per profesi. |
| Konstruksi | Kiriman fisik, prioritas tunggal, alokasi otomatis atau manual, kontribusi menurun, perbaikan, upgrade satu tingkat, pembatalan, pembongkaran tertentu, pembersihan reruntuhan | Evolusi level/teknologi/material. Refund dan salvage langsung kembali ke gudang yang punya ruang. Material yang kehabisan ruang dapat hilang. |
| Logistik | Stok lokal, kapasitas per material, kargo dalam perjalanan, pengangkut otomatis, penentuan gudang dan prioritas proyek, berhenti saat gudang penuh, penugasan ulang saat deposit habis | Konfigurasi rute lengkap, teknologi kapasitas/kecepatan, pengolahan bertingkat. |
| Survival | Konsumsi pangan pusat, kelaparan, pendatang, gelombang malam dari timur, penempatan penjaga, HP, reruntuhan, kekalahan karena kepunahan/pusat hancur, milestone tiga malam | Gelombang dari arah berbeda, bencana dan penaklukan, warisan/perk, kurva ancaman dan cakupan audio. |
| Regenerasi | Pemain memulihkan sumber terbarukan dengan pangan pusat. Batu tidak terbarukan. | Pekerjaan penanaman berdurasi dan dampak kondisi lingkungan. |
| Tampilan | Peta pixel-art, sprite per profesi, indikator kargo/cadangan/HP, pilihan petak via peta atau daftar, kontrol waktu, dan panduan lima langkah | Playtest visual langsung dan pemeriksaan lintas browser/perangkat. Isi lampiran video belum diperiksa langsung. |

Biaya bangunan, laju kerja, kapasitas, damage, panjang hari (84 tick), ukuran regu awal (8), dan target fajar ketiga adalah parameter playtest. Milestone tercapai sesudah malam ketiga berlalu dan musuh tersisa dibersihkan. Sesi dapat diteruskan dengan ancaman yang meningkat.

## Bukti dan tahap berikut

- Baseline v0.2 terverifikasi di `ee38e6e`. Sintaks skrip valid dan tes 14/14 lulus. Sumber v0.2 tetap dapat dimainkan dari `dist/`.
- Slice lolos pemeriksaan sintaks dan 9/9 tes dengan `node --test web-slice/test-slice.cjs`. Rute simulasi yang mengikuti panduan membangun kebun dan pos, menyapu gelombang ketiga, dan mempertahankan delapan warga.
- Percobaan pratinjau browser lokal terhenti karena browser tidak dapat mengakses alamat lokal dan kontrol Windows menghentikan navigasi file. Bukti perilaku berasal dari pengujian mesin simulasi. Keterbacaan UI, klik peta, dan persistensi browser masih perlu playtest.
- Pemeriksaan Multica melalui akses baca-saja gagal pada sesi ini. Implementasi dan pengujian dikerjakan langsung melalui repo produk.
- Tahap berikutnya adalah playtest Zephyr dan revisi gameplay web. Build desktop menunggu persetujuan Zephyr setelah playtest.

## 8 November 2026 · Build untuk evaluasi Zephyr

Zephyr menyetujui penggunaan Benteng Lembah sebagai fondasi playtest web pertama, integrasi paket visual, dan pengujian alur sampai fajar ketiga atau Game Over. Paket [aset statis v0.1](../assets/project-x-v0.1/README.md) kini dipakai untuk tile rumput dan jalan, vegetasi, bangunan, tembok, reruntuhan, tiga tampilan warga, mutan, potret profesi, ikon sumber daya, dan tombol waktu. Indikator HP dan konstruksi membaca nilai simulasi. Mesin dan format simpan tetap menggunakan versi Benteng Lembah yang sudah ada.

- **Bukti mesin:** `node --test web-slice/test-slice.cjs`, 9/9 lulus.
- **Bukti build:** ZIP final diekstrak dan dibuka dari berkas lokal di Microsoft Edge. Alokasi pekerja, pengiriman hasil, Kebun, Pos jaga, pemuatan ulang sesi di tengah proyek dalam keadaan jeda, pemilihan lewat klik peta, dan fajar ketiga dengan delapan warga lulus. Perbaikan hingga HP penuh diuji terpisah dari save dengan tembok rusak. Jalur Game Over diuji dari sesi baru dan tick berhenti setelah kalah. Aset termuat dan lebar 390 px tidak memicu gulir horizontal.
- **Batas:** pengujian browser memakai Edge desktop dan satu lebar layar kecil. Animasi sprite per frame, sambungan tile transisi, serta perilaku di browser atau perangkat lain belum diverifikasi. Save berkas lokal mengikuti browser dan lokasi ekstraksi.
- **Langkah berikut:** Zephyr memainkan build dan menilai visual serta keseimbangan pembuka. Evaluasi ini memakai ZIP lokal. Publikasi situs mengikuti izin rilis terpisah.
