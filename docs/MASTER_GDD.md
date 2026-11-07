# Project X — Master GDD 001–044

7 November 2026 · Pemilik produk Zephyr · Pelaksana Codex

Keputusan di bawah dipulihkan dari wawancara [GDD project X](https://chatgpt.com/c/6aee6eef-ea0c-83ec-a212-003f6b6bf008). Dokumen ini menjadi acuan arah baru dan mengungguli [konsep historis v0.2](CONCEPT.md) jika keduanya bertentangan. Zephyr mengotorisasi audit, dokumentasi, dan implementasi vertical slice web di repo privat. Penambahan desktop menunggu playtest dan persetujuan Zephyr. Rilis, biaya, dan tindakan destruktif memerlukan izin terpisah.

| ID | Keputusan |
| --- | --- |
| 001 | Final Outpost adalah referensi utama pengalaman bermain. |
| 002 | Awali dengan survival, lalu berkembang ke pengelolaan peradaban, produktivitas, teknologi, ekonomi, dan kesejahteraan. Survival dan pertahanan tetap relevan. |
| 003 | Game Over mengakhiri sesi secara permanen. Pemain memulai peradaban baru. |
| 004 | Penduduk, bangunan, stok, alat, pekerjaan, dan kondisi fisik direset. Pengetahuan dasar, pengetahuan yang memenuhi syarat, poin warisan, dan perk bertahan. Riset lanjutan yang tuntas perlu diriset ulang dengan biaya 50% serta prasyarat normal. Riset belum tuntas gugur. |
| 005 | Game Over dan reset sukarela menggunakan aturan imbalan warisan yang sama. |
| 006 | Kekalahan dapat terjadi karena kepunahan, pusat peradaban hancur, penaklukan total, atau bencana/kondisi khusus. Krisis ekonomi bekerja melalui konsekuensi. |
| 007 | Gunakan kombinasi Final Outpost klasik dan Definitive Edition. Perbandingan 70/30 dalam wawancara menunjukkan arah desain. Kode dan aset Project X orisinal. |
| 008 | Atur jumlah pekerja per profesi. Lokasi, bangunan, dan kapasitas menentukan tugas yang tersedia. Kendali individu dipertimbangkan kemudian. |
| 009 | Bangun hanya di petak yang ditetapkan. Penempatan hibrida dapat dipertimbangkan setelah fondasi matang. |
| 010 | Aturan bongkar dan ganti bergantung pada kategori bangunan. |
| 011 | Pusat peradaban tetap di petak awal, bisa ditingkatkan, dan dilarang dibongkar. |
| 012 | Bangunan berkembang melalui upgrade level dan evolusi tipe. |
| 013 | Evolusi memerlukan level, teknologi, dan material. |
| 014 | Pembangunan dan upgrade membutuhkan bahan, waktu simulasi, dan pembangun. |
| 015 | Pekerja tambahan mempercepat pekerjaan dengan kontribusi marjinal menurun. Kapasitas pekerja dapat berbeda per proyek. |
| 016 | Konstruksi paralel dibatasi oleh petak, material, dan pekerja, tanpa batas angka proyek global. |
| 017 | Alokasi pembangun otomatis secara default dengan opsi pengaturan manual. |
| 018 | Proyek menyimpan progres ketika pekerja habis dan melanjutkan saat tersedia. |
| 019 | Pembatalan proyek mengembalikan sebagian bahan. |
| 020 | Refund mengikuti progres. Kurva dan batas pengembalian masih perlu balancing. |
| 021 | Perbaikan membutuhkan pekerja konstruksi, bahan, dan waktu. |
| 022 | Kerusakan menurunkan efektivitas. Pada HP ≤10% operasional berhenti. |
| 023 | Di atas ambang kritis, efektivitas linear terhadap persentase HP. Kurva nonlinier dapat dipertimbangkan kemudian. |
| 024 | Bangunan yang hancur menjadi reruntuhan yang menempati petak. |
| 025 | Pembangun membersihkan reruntuhan dengan waktu kerja dan kemungkinan salvage. |
| 026 | Hasil salvage bergantung pada jenis bangunan. |
| 027 | HP tidak menurun seiring waktu secara alami. Serangan, bencana, atau peristiwa dapat merusak. |
| 028 | Bahan bertingkat mengikuti perkembangan peradaban. |
| 029 | Pekerja mengumpulkan bahan mentah dari lingkungan. Fasilitas mengolahnya menjadi bahan lanjutan. |
| 030 | Sumber daya dapat terbarukan atau tak terbarukan. Pengelolaan dinamis dapat menyusul. |
| 031 | Regenerasi terbarukan membutuhkan tindakan pemain, dengan kondisi lingkungan sebagai pengembangan. |
| 032 | Dampak awal eksploitasi adalah pengurangan cadangan. Dampak lingkungan dan kesejahteraan dipertimbangkan kemudian. |
| 033 | Deposit habis membuat pekerja menunggu penugasan manual. |
| 034 | Tampilkan notifikasi, indikator lokasi, dan pekerja yang menunggu. Peringatan dini dapat ditambahkan. |
| 035 | Inventaris bersifat fisik dan melekat pada lokasi penyimpanan. |
| 036 | Pengumpul dapat mengantar hasilnya ke gudang. Profesi logistik menangani distribusi antarlokasi. |
| 037 | Distribusi otomatis sebagai default, dengan kendali manual atas prioritas, rute, atau tujuan. |
| 038 | Kebutuhan dasar didahulukan secara default. Pemain dapat mengubah prioritas. |
| 039 | Kapasitas angkut dasar berkembang melalui teknologi dan sarana angkut. |
| 040 | Waktu pengiriman mengikuti jarak dan teknologi transportasi. |
| 041 | Kapasitas gudang dihitung terpisah per jenis bahan. |
| 042 | Pengumpulan bahan berhenti ketika kapasitas bahan di gudang tujuan penuh. |
| 043 | Ketika ruang tersedia, pekerja otomatis kembali bekerja dengan tujuan lama. Tidak ada pengalihan gudang otomatis. |
| 044 | Kapasitas bertambah lewat gudang baru, upgrade gudang, serta teknologi penyimpanan. |

## Audit sebelum perubahan

HEAD lokal dan GitHub `main` sama pada `ee38e6ecc5e80682831f334bb0f72fa975113307`. Status Git lokal bersih. Sintaks kedua skrip v0.2 valid dan 14 dari 14 tes baseline lulus saat dijalankan dari root produk. Dokumentasi penerimaan dan serah-terima versi lama disimpan bersama riwayat Git.

| v0.2 | Arah baru |
| --- | --- |
| Simulasi berpusat pada panel dan produksi agregat | Permukiman di peta, pekerja terlihat bergerak, ancaman dari tepi |
| Stok global dan produksi tanpa deposit terbatas | Deposit berhingga, inventaris per lokasi, waktu pengangkutan |
| Maksimal tiga proyek dengan timer | Pembangun fisik, progres dan material per proyek, alokasi paralel |
| Pertahanan berupa perbandingan angka berkala | Tembok awal, serangan malam, penjaga dan HP bangunan |
| Kunci simpan lama `project-x-v1` | Sesi slice terpisah, riwayat permainan lama tetap tersedia pada baseline |

Dua tangkapan layar lampiran [Buat game Project X](https://chatgpt.com/c/6ac9a499-fdb4-83ec-9da0-f072ae0ff999) memperlihatkan permukiman berpagar di tengah, hutan di tepi, tampilan stok atas, dan kontrol profesi/waktu yang ringkas. Referensi ini dipakai untuk komposisi dan keterbacaan. Nama lampiran video ditemukan di riwayat GDD. Isi video belum diverifikasi langsung pada tahap audit ini.

## Penerimaan vertical slice web

Pemain dapat mengelola satu permukiman dengan tutorial yang menuntun pengumpulan, pembangunan, dan pertahanan pertama. Gunakan peta pixel-art orisinal, lima profesi inti, tiga bahan awal, petak tetap, gudang fisik, proyek yang menunggu bahan serta pembangun, waktu aktif tanpa progres offline, dan serangan bertahap yang dapat dimenangkan atau berakhir Game Over. Sesi browser dapat disimpan dan dimulai ulang secara terpisah dari v0.2.

Progres peradaban penuh, penaklukan, bencana, perk/warisan lengkap, olahan bertingkat, alat angkut dan teknologi, serta dampak lingkungan lebih luas berada di backlog. Rincian angka, rute, dan pilihan desain sementara dicatat bersama bukti verifikasi slice.
