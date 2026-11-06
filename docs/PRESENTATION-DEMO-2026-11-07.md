# Project X — checkpoint demo presentasi, 7 November 2026

Pemilik produk: Zephyr. Pelaksana: Amel. Baseline produk: ee38e6ecc5e80682831f334bb0f72fa975113307.

## Tujuan, izin, dan perubahan

Zephyr menyetujui demo playable untuk presentasi pukul 08.00, beserta aset game. Target akhir aplikasi desktop; hasil tahap ini adalah browser lokal/offline tanpa instalasi. Lingkup disetujui: peta grid tidak persegi dan penempatan bangunan; alokasi SDM/SDA; rantai penelitian–bangunan–bijih–logam–alat; siang/malam dan pertahanan tembok; penjelasan belajar; satu mitra perdagangan/kurs. Percakapan produk menjadi sumber keputusan terbaru. HQ tidak digunakan untuk menyimpan kode produk.

Demo ditambahkan di presentation-demo/ sebagai implementasi terpisah dari dist/ v0.2. Save lama tidak dibaca atau diubah. Tidak ada modifikasi deployment lama, instalasi paket, biaya, perubahan konfigurasi Windows, ataupun dispatch Multica. Folder Windows kanonis tetap C:/Users/Muhammad Hadi/Development/project-x. Pengerjaan di workspace cloud tidak membuktikan file sudah tersalin ke laptop.

## Keputusan produk yang dikonfirmasi

- Game sarana simulasi setelah pengajaran: manajemen alokasi SDM/SDA, lalu ekonomi ketika perdagangan dan kurs diperkenalkan. Target utama pelajar. Dampak pendidikan belum diuji empiris.
- Pascaapokaliptik; perspektif atas; penduduk titik putih, kartu individu; pemain kepala permukiman. Satu wilayah pemain dahulu; perluasan petak di dalam peta. Multiwilayah/penaklukan ditunda.
- Dunia hanya berjalan saat dimainkan. Malam pekerja tidur, penjaga bertugas. Penjaga malam wajib tidur 06.00–11.00, tidak dapat dipaksa bekerja.
- Peringatan musuh dari tepi peta; pemain dapat memindahkan penjaga saat serangan. Tembok awal; tembok hancur berarti kalah. Warga tidur bisa diganti menjadi penjaga jika punya alat. Serangan harian, mingguan, bulanan, enam bulanan digabung bila bersamaan.
- Riset bercabang membutuhkan pekerja, waktu, bangunan, dan bahan. Cabang berikut terlihat bertahap. Setelah reset, teknologi yang pernah terlihat tetap terlihat; tidak otomatis bisa digunakan.
- Batu/bijih besi merupakan SDA. Bijih diolah menjadi logam. Kayu sebagai bahan bakar awal. Mineral lain dan batu bara ditunda.
- Konstruksi perlu pembangun dan kiriman; pengangkut adalah pekerjaan khusus. Alat dibagikan manual, rusak dan harus dibuat ulang; pekerjaan terkait berhenti tanpa alat.
- Kurs/perdagangan dibuka setelah pertemuan wilayah. Uang awal dari penjualan dalam uang mitra. Mata uang lokal dikenalkan kemudian melalui kesepakatan. Harga mengikuti stok/kebutuhan; perkembangan memengaruhi produksi/perdagangan, bukan otomatis skor kemajuan = kurs.
- Wilayah sistem sederhana (karakteristik, stok, perkembangan). Pajak, bank, utang, dan kontrol pencetakan uang ditunda.
- Reset sukarela maupun setelah kalah. Semua wilayah kembali ke awal; detail warisan/perk dibahas kemudian. Teknologi akhir modern (contoh senjata api/panel surya), permainan berlanjut dengan kesulitan meningkat.
- Kelahiran/usia: arah pertumbuhan dipercepat dengan kalender, rinciannya ditunda. Penyakit, kebahagiaan, keahlian, latar karakter, reboisasi tetap visi, bukan klaim selesai.

## Keputusan implementasi sementara untuk demo

Nilai berikut hanya konfigurasi demonstrasi, bukan persetujuan desain final: 12 warga, 26×19 petak, 4 detik aktif = 1 jam game, 1×/3×/5×, stok awal, biaya resep, durasi kerja, hp tembok/mutan, jangkauan penjaga, nama sektor/warga/mata uang, serta formula harga dan kurs. Tidak menafsirkan angka sebagai hasil balancing atau bukti ekonomi nyata.

Skenario presentasi menyiapkan bengkel, peleburan, pos, riset, alat, dan saldo 30 AS. Ini kondisi contoh yang berlabel, bukan hasil gameplay normal. Permukiman baru tetap dimulai tanpa riset/uang.

## Arsitektur tahap demo

- engine.js: simulasi deterministik tanpa DOM, definisi bahan/resep, penugasan, waktu, logistik, riset, pertempuran, perdagangan, reset. State dimutasi hanya di mesin demi loop simulasi; bukan state antarmuka framework.
- app.js: antarmuka, renderer Canvas, kontrol, tutorial, simpan lokal. Waktu memakai delta frame dibatasi; tab tersembunyi selalu jeda.
- sprites.js: sprite pixel orisinal dengan palet dan pola grid; dipakai Canvas dan generator SVG.
- assets/*.svg + ASSETS.html: 20 aset terpisah dan atlas untuk presentasi.
- export-assets.cjs: meregenerasi SVG dari pola sprite yang sama.
- test.cjs: uji perilaku mesin via Node, tanpa paket eksternal.

Tidak ada backend, database server, API, login, atau telemetri pada demo ini. localStorage adalah simpanan lokal, bukan database perusahaan. Paket desktop dan layanan data perlu rancangan lanjutan sesuai kebutuhan produk.

## Batas yang harus disebut saat presentasi

- Ini vertical slice era awal, bukan seluruh game dari batu sampai modern.
- Jalur berjalan masih gerak langsung menuju target dengan pengaruh medan/jalan; belum navigasi menghindari semua bangunan/tembok.
- Logistik fisik berlaku pada hasil produksi, kiriman dagang, dan bahan konstruksi. Bahan masukan riset/peleburan/bengkel masih didebit dari gudang tanpa pengiriman masukan terpisah.
- Gudang belum membatasi kapasitas. Gerbang/tembok tidak ikut diperluas otomatis saat petak dibuka. Serangan demo dari timur; belum variasi arah.
- Perdagangan jual langsung, beli memakai waktu kiriman. Permintaan mitra diwakili target stok; belum perkembangan ekonomi otonom lengkap. Kurs memakai tekanan arus transaksi dibatasi, bukan simulator moneter lengkap.
- Tidak ada penyakit, kelahiran, penuaan, kebahagiaan, pemberontakan, pengalaman kerja, reboisasi, diplomasi, ekspedisi aktif, modernisasi penuh, ataupun perk permanen.
- Reset demo hanya menjaga keterlihatan riset. Ketentuan warisan lain tidak ditetapkan ulang.
- SVG/pola pixel dibuat untuk Project X. Tidak mengambil aset atau kode Final Outpost. Kemiripan visual persis tidak diklaim.
- Belum diuji pada Windows pengguna atau aplikasi desktop native. Akses bridge baca-saja tidak dipakai sebagai bukti eksekusi agen.

## Bukti uji

16 skenario otomatis PASS: jeda/game-over; riset/prasyarat; lokasi/resep terkunci; kiriman+pembangun; hasil mentah sebelum angkut; alat rusak/pengganti; durabilitas ketika ditukar; tidur penjaga; gabungan gelombang; tembok kalah; penjaga menahan gelombang awal; peleburan–crafting–angkut; transaksi/kiriman; mata uang lokal tanpa uang gratis; reset; round-trip save.

Bug yang ditemukan dan diperbaiki: posisi pekerja berhenti sedikit sebelum target membuat satu musuh tepat di luar jangkauan penjaga; posisi kini dipaskan saat tiba. Simpan otomatis pada layar intro sebelumnya berpotensi menimpa simpanan yang belum dimuat; kini simpan hanya aktif setelah pemain memilih mulai/lanjut. Akses hutan awal diperbaiki. Panel statis tidak terus diganti saat jeda.

Pengujian UI Chrome preview: memilih skenario, membuka riset, memesan perkakas memotong 2 kayu/1 logam, menjalankan 5×, jurnal menunjukkan hasil alat; menjual kayu mengurangi stok 73→68→63, uang 30→35→39,5 AS, harga jual turun 5→4,5 AS per 5 kayu; penjualan kedua membuka mata uang lokal. Bukti lanjutan dicatat setelah pemeriksaan selesai.

## Langkah berikut

Presentasikan demo dan bedakan fitur berjalan dari roadmap. Setelah presentasi, tinjau model ekonomi, navigasi/logistik lengkap, aturan warisan, serta kebutuhan desktop. Integrasi lokal dilakukan dari branch produk melalui jalur resmi; jangan menimpa perubahan laptop atau menganggap PR sudah merged.

UI lanjutan PASS: tukar 5 AS memperoleh 9,7 PX pada kurs 1,94, simpan/reload memulihkan 34,5 AS dan 9,7 PX pada hari 1 pukul 08.27 dalam keadaan jeda. Penempatan hunian di [12,12] memotong 12 kayu/4 batu, menampilkan kiriman 0/16 dan akhirnya jurnal "Hunian selesai dibangun". Perkakas hasil pesanan bertambah dari 3 menjadi 4 setelah diangkut.
