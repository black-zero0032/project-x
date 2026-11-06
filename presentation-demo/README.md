# Project X — demo presentasi 0.3

## Jalankan tanpa instalasi

1. Ekstrak seluruh ZIP dahulu.
2. Klik dua kali `index.html` (Chrome/Edge di laptop). Semua script dan aset lokal; tidak membutuhkan internet.
3. Pilih **Skenario presentasi · fasilitas siap** untuk demonstrasi singkat, atau **Mulai permukiman baru** untuk perkembangan dari awal.
4. Tekan **Mulai**, gunakan 1×/3×/5× dan tombol jeda. F11 untuk layar penuh.
5. Buka `ASSETS.html` untuk melihat atlas aset. Folder `assets` berisi SVG transparan individual.

Jika membuka HTML lokal dibatasi oleh konfigurasi browser, dari folder ini jalankan `python -m http.server 8000` lalu buka `http://localhost:8000`. Python hanya alternatif, bukan syarat utama.

Save tersimpan pada browser/lokasi yang sama. Private browsing atau kebijakan file lokal bisa membatasi simpan. Jangan menghapus data browser sebelum presentasi. Tidak ada progres offline. Save demo terpisah dari game v0.2.

## Rute presentasi 3–5 menit

- Mulai dengan skenario presentasi; jelaskan bahwa kondisi awalnya disiapkan agar seluruh alur terlihat cepat.
- SDM: tunjukkan satu warga satu pekerjaan, penebang/penambang membutuhkan perkakas dan penjaga membutuhkan tombak. Pemain membagikan alat sendiri.
- Bangun: pilih Hunian lalu klik petak kosong dalam area terang. Pengangkut mengantar bahan; pembangun baru dapat menyelesaikan pekerjaan sesudah bahan tiba.
- Riset: jelaskan cabang Perkakas → Metalurgi/Pertahanan. Di skenario siap riset sudah selesai; pilih mulai baru jika ingin menunjukkan proses penelitian.
- Klik **Buat perkakas**, jalankan waktu. Perajin membuat alat dan pengangkut membawa hasilnya ke gudang. Stok perkakas baru bertambah setelah diantar.
- Dagang: jual kayu dua kali. Tunjukkan stok mitra bertambah, harga berubah, saldo AS bertambah, dan mata uang PX kemudian dikenalkan. Tukarkan AS ke PX, lalu beli pangan dan tunggu kiriman.
- Sebelum malam, tempatkan penjaga dekat tembok timur. Percepat sampai pukul 18.00 untuk melihat serangan; tembok hancur berarti kalah. Penjaga malam wajib tidur 06.00–11.00.
- Tekan Jeda sebelum menjelaskan konsep. Jangan biarkan demo berjalan lama ketika sedang berbicara.

## Yang diterangkan kepada dosen

"Project X adalah sarana simulasi setelah pembelajaran manajemen dan ekonomi. Pemain mempraktikkan pembagian tenaga kerja serta bahan, menanggung biaya peluang, lalu mengenal perdagangan dan nilai tukar. Demo ini memperlihatkan sebagian sistem; efektivitas pembelajaran masih perlu diuji melalui penelitian."

## Aset dan hak penggunaan

Semua pola sprite, palet, SVG, dan kode demo dibuat untuk Project X. Final Outpost adalah referensi pengalaman, bukan sumber aset atau kode. Atlas dapat dipakai untuk menjelaskan desain visual. Potret warga masih memakai satu placeholder bersama.

## Pengembang

`node test.cjs` menjalankan uji perilaku. `node export-assets.cjs` meregenerasi SVG/atlas. Tidak ada dependensi npm.

Repo kanonis: https://github.com/black-zero0032/project-x
Folder kanonis laptop: C:/Users/Muhammad Hadi/Development/project-x
Folder source demo di repo: presentation-demo/
Checkpoint lengkap: docs/PRESENTATION-DEMO-2026-11-07.md

## Batas demo

Era awal saja; bukan seluruh pohon teknologi modern. Gerak langsung belum pathfinding penuh. Input bahan pabrik/riset disederhanakan dari gudang; output dan konstruksi memakai pengangkut. Gudang belum memiliki batas kapasitas. Harga/kurs masih model demo. Penyakit, kebahagiaan, kelahiran, pengalaman pekerja, reboisasi, ekspedisi, modernisasi, dan perk belum tersedia. Target desktop tetap tahap berikutnya; file ini bukan installer .exe.
