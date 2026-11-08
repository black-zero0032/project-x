# Project X — Build ulang web Benteng Lembah

8 November 2026 · Zephyr menyetujui build ulang setelah meninjau build lama. Referensi UI berasal dari lima tangkapan layar Final Outpost yang disertakan Zephyr dan [arah visual Project X](design/README.md). Implementasi baru memakai [aset Project X v0.1](../assets/project-x-v0.1/README.md) dan keputusan [Master GDD](MASTER_GDD.md). Kode antarmuka dan simulasi ada di `web/`. Riwayat slice lama tersedia di branch `gdd/web-survival-slice`.

## Memainkan

Ekstrak seluruh ZIP playtest dan buka `web/index.html` di Microsoft Edge. Dari checkout repo, buka file yang sama. Simpan otomatis memakai penyimpanan browser. Lanjutkan dari browser dan lokasi yang sama. Build ini memakai slot baru untuk simulasi baru.

1. Pilih **Mulai ekspedisi**. Buka **Profesi** dan coba dua pengumpul pangan, satu penebang, satu penambang, satu pembangun, dan dua penjaga.
2. Klik petak di peta dan pesan Bengkel atau Kebun. Mulai waktu. Amati warga mengambil bahan dan proyek mulai setelah semua bahan tiba.
3. Buka **Jaga** dan tempatkan regu sesuai peringatan arah serangan. Saat gudang penuh atau deposit habis, gunakan panel Status dan klik lokasi untuk mengubah penugasan.
4. Buka **Alat** setelah Bengkel beroperasi. Resep awal memakai kayu dan batu. Alat yang jadi dipakai otomatis oleh profesi terkait.

Peta bisa digeser dengan seret dan diperbesar dengan roda mouse. Saat kalah sesi berakhir. Selama pusat dan warga bertahan, malam terus berulang dengan ancaman meningkat.

## Bukti dan batas playtest

- `node --test web/simulation.test.cjs` lulus 3/3 untuk pengiriman paralel, penyimpanan kargo, pembatalan, pertahanan malam, dan Game Over.
- ZIP final diuji di Edge setelah diekstrak. Layar judul, pemilihan petak lewat peta, alokasi profesi, bahan tiba, Bengkel selesai, simpan/muat ketika kargo dalam perjalanan, jeda setelah muat, malam pertama, pembuatan kapak, kontrol pada lebar 390 px, dan layar Game Over lulus. Game Over di browser memakai skenario save uji dengan pusat hampir hancur.
- Durasi hari, HP, resep, efek alat, dan kurva serangan adalah angka playtest. Warga bergerak lewat rute garis lurus. Sprite memakai pergantian keadaan bawaan, pembawa barang, dan penjaga. Perdagangan, riset lanjutan, warisan lengkap, dan pathfinding menunggu tahap setelah evaluasi.
- Build ditujukan untuk tinjauan Zephyr di Edge lokal. Publikasi situs memerlukan persetujuan rilis tersendiri.
