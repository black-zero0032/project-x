# Arsip desain Project X

8 November 2026 · Persetujuan Zephyr · [Buat game Project X](https://chatgpt.com/c/6ac9a499-fdb4-83ec-9da0-f072ae0ff999)

Mulai dari [Master GDD 001–044](../MASTER_GDD.md) untuk keputusan gameplay dan [catatan playtest Benteng Lembah](../WEB_PLAYTEST.md) untuk cakupan prototipe. Arsip ini menyimpan delapan PNG asli yang Zephyr serahkan setelah persetujuan desain.

## Diagram

| Artefak | Cakupan |
| --- | --- |
| [Flowchart](diagrams/Flowchart.png) | Konstruksi, pengiriman bahan, pekerjaan tertunda, pembatalan dan refund, kerusakan, perbaikan, serta reruntuhan. |
| [ERD](diagrams/ERD.png) | Hubungan konseptual antara profil, sesi, warisan, wilayah, penduduk, bangunan, stok, logistik, riset dan data permainan lainnya. |
| [Use case](diagrams/Usecase%20Diagram.png) | Aksi pemain sebagai kepala permukiman, dari mulai dan simpan/muat hingga pertahanan, perdagangan setelah terbuka, dan mulai ulang dengan aturan warisan. |

Diagram merekam desain konseptual. ERD dapat dipakai untuk memodelkan state lokal dan tidak menetapkan pilihan backend. Cakupan diagram mencakup fitur di luar prototipe web.

## Arah visual dan paket evaluasi aset v0.1

| Artefak | Peran |
| --- | --- |
| [Arah visual Project X](visual/Arah%20visual%20Project%20X.png) | Acuan palet pixel-art, komposisi permukiman, HUD sumber daya, panel profesi, dan kontrol waktu. |
| [Bangunan dan lingkungan](visual/Koleksi%20bangunan%20dan%20lingkungan%20pixel%20art.png) | Hunian, gudang, bengkel, menara, kebun, tembok, reruntuhan, vegetasi, deposit dan tile. |
| [Potret warga dan ancaman](visual/Potret%20Warga%20dan%20Simbol%20Ancaman.png) | Acuan enam potret profesi serta desain mutan dan hewan buas mutasi. |
| [Tiga sprite warga yang dipilih](visual/Potret%20Warga%20dan%20Simbol%20Ancaman1.png) | Acuan utama untuk warga kecil di peta. Pertahankan bentuk kepala kuning dan badan putih pada warga biasa, pembawa barang, dan penjaga. |
| [Komponen UI dan ikon](visual/Komponen%20UI%20dan%20ikon%20sumber%20daya.png) | Bar sumber daya, panel, kartu profesi, indikator progres dan HP, tombol, serta ikon bahan dan alat. |

Lembar visual berstatus referensi evaluasi. Saat masuk tahap produksi, gunakan sprite pilihan dan periksa ukuran, pemisahan sprite, transparansi, sambungan tile, animasi, serta keterbacaan dalam game. Arsip ini tidak mengintegrasikan aset ke prototipe.

[Paket aset statis v0.1](../../assets/project-x-v0.1/README.md) memuat PNG terpisah, manifest, dan pratinjau untuk evaluasi sebelum pembuatan game web.
