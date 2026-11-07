# Project X — Paket aset statis v0.1

8 November 2026 · Lingkup disetujui Zephyr untuk evaluasi sebelum pembuatan game web.

Buka [pratinjau](preview.png) untuk melihat aset pada ukuran usulan. [Manifest](manifest.json) mencatat path, ukuran asli, ukuran tampilan usulan, titik pijak sprite bila relevan, lokasi potongan di lembar sumber, dan SHA-256 setiap PNG. Koordinat dihitung dari kiri atas dalam piksel. Gunakan nearest-neighbor untuk mempertahankan tampilan pixel-art.

| Folder | Isi |
| --- | --- |
| `world/` | 14 sprite bangunan, tembok, reruntuhan, dan lingkungan. |
| `tiles/` | 2 tekstur permukaan 64 × 64 untuk rumput dan jalan. |
| `citizens/` | 3 sprite pilihan untuk warga biasa, pembawa barang, dan penjaga. |
| `portraits/` | 6 potret profesi. |
| `threats/` | Mutan dan babi hutan mutasi. |
| `ui/` | 27 aset HUD, panel, tombol, dan ikon. |

## Verifikasi dan batas

- Seluruh 54 PNG dibuka kembali dan diperiksa ukuran, mode RGBA, dan kesetaraan piksel dengan hasil ekspor. Sprite warga dipotong langsung dari lembar pilihan tanpa mengubah pikselnya. Pada potongan lain, alfa latar yang samar dibersihkan.
- Kedua tile dibuat dari bagian dalam tekstur sumber dengan pencerminan. Tepi kiri dan kanan serta atas dan bawah cocok piksel demi piksel untuk pengulangan tile yang sama. Sambungan rumput ke jalan memerlukan tile transisi saat integrasi peta.
- Ukuran tampilan pada manifest adalah usulan berdasarkan pratinjau, dengan tinggi warga sekitar 32 px. Contoh bar progres dan HP memiliki isi tetap. Nilai dinamis, animasi, dan pemeriksaan di dalam game menjadi bagian tahap web setelah evaluasi Zephyr.

Sumber visual dan keputusan persetujuan tersimpan dalam [arsip desain](../../docs/design/README.md). Acuan gameplay ada di [Master GDD](../../docs/MASTER_GDD.md).
