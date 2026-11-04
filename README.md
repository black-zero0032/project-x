# Project X v0.2

Simulasi manajemen peradaban 2D berbahasa Indonesia. Pemain mengalokasikan penduduk, menjaga sumber daya, meneliti teknologi, membangun fasilitas, dan membuat alat untuk mengembangkan wilayah. Tidak ada progres offline.

## Menjalankan dan menguji

Tidak memerlukan paket tambahan. Dari folder produk:

```powershell
node --check dist/engine.js
node --check dist/app.js
node test-engine.cjs
python -m http.server 8080 --directory dist
```

Buka http://localhost:8080. Jika Python belum tersedia, gunakan server statis yang sudah disetujui di mesin. Jangan memasang dependensi tanpa izin.

## Berkas utama

- `dist/engine.js`: definisi teknologi/bangunan/resep, state, tick, transaksi, reset, migrasi, validasi.
- `dist/app.js`: antarmuka, peta prosedural, simpan/muat, kontrol waktu.
- `dist/style.css`, `dist/index.html`: tampilan.
- `test-engine.cjs`: 14 skenario perilaku, termasuk perjalanan 240 hari.
- `fixtures/v1-save.json`: save sintetis untuk migrasi; tidak berisi data pemain.
- `docs/CONCEPT.md`: konsep lengkap, aturan yang berjalan, serta batas versi.
- `docs/ACCEPTANCE.md`: lingkup dan bukti pengujian perubahan v0.2.
- `docs/TEAM_HANDOFF.md`: mandat, lokasi sumber, peran, dan alur kerja tim.

## Penyimpanan

State versi 2 masih memakai key browser `project-x-v1` agar save terdahulu ditemukan. Save versi 1 dimigrasikan saat dibuka; salinan mentah dipertahankan pada `project-x-v1-backup` bila penyimpanan tersedia. Impor menerima versi 1 atau 2 yang valid. Tidak ada sinkronisasi antarperangkat. Ekspor JSON tersedia lewat Simpan.

## Keputusan versi 0.2

Riset hanya membuka resep. Bangunan memberi fungsi setelah konstruksi selesai. Alat dibuat di Bengkel oleh perajin dengan bahan; satu alat melayani satu pekerja. Kode tombol bonus langsung `apply` telah dihapus. Seluruh kegiatan bergerak hanya selama waktu simulasi aktif; tab tersembunyi atau dialog menjeda permainan.

## Pengelolaan

Kode kerja tim berada di `black-zero0032/ai-development-team`, folder `projects/project-x`. Source repo Sites memuat salinan yang dipublikasikan. Sinkronisasi keduanya dilakukan eksplisit per rilis; tidak ada pipeline otomatis atau koneksi Multica yang diaktifkan oleh perubahan ini. Identitas deployment pada `.openai/hosting.json` menunjuk Site yang sudah ada; jangan membuat Site baru untuk pembaruan.
