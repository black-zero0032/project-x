# Spesifikasi dan verifikasi v0.2

Tanggal: 4 November 2026. Pemilik produk: Zephyr. Pelaksana: Amel.
Baseline: 9125b6c7d1742b3e93b6c54b361e63f1479f72b5, tidak ada perubahan lokal saat mulai.

## Permintaan dan lingkup

User meminta pola seperti Final Outpost: riset membuka bangunan teknologi, sedangkan alat memerlukan bahan pembuatan; minta konsep dijelaskan ulang dan kode/dokumentasi dihubungkan dengan GitHub perusahaan. Implementasi memakai stack yang sudah ada; tanpa paket baru, tanpa server database, tanpa perubahan akses Site.

## Penerimaan

1. Fasilitas teknologi tidak bisa dibangun sebelum penelitian terkait selesai.
2. Penelitian sendiri tidak mengubah hasil produksi; membangun memerlukan bahan dan durasi.
3. Resep alat membutuhkan riset dan Bengkel selesai; produksi membutuhkan perajin.
4. Pesanan memotong bahan tepat satu kali; antrean terbatas; nol perajin berarti tidak ada progres produksi.
5. Jumlah alat membatasi pekerja yang mendapat manfaat; tidak ada manfaat alat cadangan.
6. Save v0.1 dimigrasikan, save v0.2 menyimpan antrean, reset menghapus alat/bangunan dan mempertahankan aturan pengetahuan/perk.
7. Waktu offline tetap nol. Lingkup lama main/simpan/muat tidak sengaja dihapus.
8. Kode, instruksi menjalankan tes, konsep, checkpoint, dan serah-terima tersedia bagi tim di GitHub.

## Bukti eksekusi

- PASS: `node --check dist/engine.js`, `node --check dist/app.js`, exit 0.
- PASS: `node test-engine.cjs`, exit 0, 14 skenario. Mencakup unlock, biaya/konstruksi, produksi perajin, alat terpakai vs cadangan, antrean, batas bangunan unik, prasyarat/diskon, migrasi, round-trip state berisi pekerjaan aktif, save tidak valid, perdagangan, keruntuhan, dan 240 hari perkembangan.
- Riwayat adaptasi tes: suite v0.1 gagal setelah `applied/apply` dihapus (TypeError pada assertion mekanik lama); suite kemudian diganti dengan kontrak perilaku baru. Ini bukan klaim RED test baru sebelum implementasi.
- PASS UI Chrome cloud/preview: save v0.1 hari 11 dimuat sebagai v0.2, petani 4 dan peneliti 2 tetap sama; pesan migrasi terlihat.
- PASS UI: Perkakas Batu diteliti; Bengkel terbuka sementara Kebun/Irigasi/Rumah Batu masih terkunci sesuai prasyarat.
- PASS UI: pembangunan Bengkel memotong 40 kayu dan 25 batu; setelah selesai kapasitas perajin menjadi 2.
- PASS UI: satu peneliti dipindah ke perajin; pesanan kapak memotong 5 kayu dan 4 batu, menampilkan 3 kerja tersisa; sesudah waktu berjalan kapak dimiliki/digunakan 1/1, tiga penebang tetap bekerja dan hasil kayu UI naik dari +2,8 ke +3,2/hari (hasil tepat mesin 2,85→3,23).
- Pemeriksaan v0.1 sebelumnya untuk ekspor/impor dan tutup-buka tercatat di HQ. Pada v0.2 round-trip penuh data diperiksa otomatis; impor JSON v0.2 melalui dialog belum diulang di browser.

## Batas bukti

Pengujian UI memakai salinan preview dari sumber yang akan diterbitkan. Android dan lintas-browser belum diperiksa. Tidak ada klaim gameplay telah seimbang atau dampak edukasi sudah terbukti. Multica lokal tidak diakses dan tidak ada kartu yang telah dijalankan. Detail publikasi/commit akhir dicatat di jurnal HQ sesudah hasil native deploy terkonfirmasi.
