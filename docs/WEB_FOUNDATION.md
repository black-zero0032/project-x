# Playtest fondasi Final Outpost

8 November 2026 · Permintaan Zephyr untuk membuat build berdasarkan hasil audit dan petak persegi yang disepakati. Implementasi melanjutkan UI dan paket aset yang diterima pada build ulang.

## Memainkan

Ekstrak seluruh ZIP dan buka `web/index.html` di Microsoft Edge. Mulai ekspedisi, tugaskan satu Pemburu, satu Penebang, satu Pemulung, dan satu Petarung pisau. Sisakan satu warga untuk konstruksi awal. Di panel Jaga, tempatkan petarung di barat. Klik tile kosong dalam tembok dan pesan Bengkel. Setelah bengkel beroperasi, buka Alat dan buat kapak.

## Cakupan

- Grid persegi 6 × 5. Tile kosong membuka daftar bangunan, dan tile terisi membuka detail bangunan. Pemeriksaan koordinat memakai batas tile. Pusat menempati satu tile tetap.
- Lima warga awal, empat profesi dasar, pekerjaan lanjutan dengan syarat alat, fasilitas, atau level pusat. Warga cadangan menangani konstruksi pembuka. Bengkel membuka resep berdasarkan level.
- Stok daging dan gandum terpisah. Rak pengering menambah kapasitas daging. Penempatan gudang dan kiriman fisik mengikuti model Project X. Pangan memengaruhi kelaparan dan pertumbuhan warga.
- Empat sektor pertahanan dengan petarung dan cadangan. Peringatan membedakan serangan malam biasa dan gelombang besar. Peta memperlihatkan transisi malam, cahaya lokal, serta efek benturan tembok.

## Bukti dan batas

`node --test web/simulation.test.cjs` lulus 3/3. ZIP diekstrak dan diuji di Edge untuk klik dekat batas tile, konstruksi pada tile yang dipilih, resep terkunci, pembuatan kapak, alokasi pertahanan barat, fajar pertama dengan lima warga, pemulihan sesi saat bahan masih di perjalanan, dan lebar 390 px. Jalur kehilangan sesi diverifikasi di mesin. Save fondasi memakai slot lokal baru.

Harga, HP, jadwal makan, waktu pertumbuhan gandum, dan gelombang besar setiap empat malam adalah parameter playtest, sebagian mengacu pada angka yang terbaca pada rekaman. Rute warga melewati titik pintu saat masuk dan keluar. Navigasi di sekitar bangunan dan animasi per frame masih perlu evaluasi. Bukti browser mencakup sesi pembuka sampai fajar pertama, belum pengujian penuh ekonomi akhir atau gelombang besar. Langkah berikutnya adalah penilaian Zephyr dari build lokal.
