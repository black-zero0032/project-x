# Konsep Project X — v0.2, 4 November 2026

## 1. Identitas dan tujuan

Project X adalah game strategi simulasi manajemen wilayah/peradaban 2D berbasis UI, dengan pola pengelolaan dan perkembangan yang diinginkan pemain seperti Final Outpost. Ini bukan salinan konten, aset, atau seluruh aturan Final Outpost. Intinya adalah keputusan penggunaan tenaga kerja dan sumber daya yang terbatas untuk bertahan, membangun ekonomi, dan mengejar kemajuan.

Pemain menjadi pengelola peradaban: menentukan siapa yang bertani, menebang, menambang, meneliti, menjaga, dan membuat alat. Produksi berjalan otomatis setelah keputusan itu dibuat. Pemain memilih prioritas, bukan mengetuk tombol untuk setiap unit bahan.

Untuk arah skripsi, fokus yang telah dipilih adalah dampak terhadap pemain: pemahaman alokasi sumber daya, biaya peluang, serta ekonomi/kurs sebelum dan sesudah bermain. Efektivitas pendidikan belum terbukti; memerlukan instrumen dan eksperimen tersendiri. Tidak mengklaim simulator ini merepresentasikan ekonomi dunia nyata secara akurat.

## 2. Waktu dan siklus utama

Satu detik pada kecepatan 1× adalah satu hari simulasi. Pilihan 3× dan 5× mempercepat produksi, konsumsi, riset, pembangunan, pembuatan alat, ancaman, dan perkembangan wilayah lain secara bersamaan. Saat dijeda, tab tersembunyi, dialog terbuka, atau aplikasi ditutup, tidak ada kemajuan. Membuka kembali selalu dalam kondisi dijeda.

Siklus permainan: lihat kebutuhan → alokasikan pekerja → hasilkan bahan/ilmu → riset resep → bangun atau produksi → gunakan kapasitas/alat → amati perubahan → sesuaikan strategi. Pemain harus menyeimbangkan kebutuhan jangka pendek dan investasi jangka panjang.

## 3. Awal dan penduduk

Siklus baru dimulai dengan 12 penduduk, 110 pangan, 95 kayu, 60 batu, 100 koin, tanpa ilmu dan alat. Fasilitas awal: dua ladang sederhana, satu pondok kayu, satu tambang, dua permukiman, satu rumah ilmu, dan satu menara. Bangunan awal adalah pengetahuan awal untuk menjaga permainan dapat dimulai; riset membuka fasilitas yang lebih maju.

Pekerja awal: 5 petani, 3 penebang, 2 penambang, 1 peneliti, 1 penjaga. Perajin baru dapat dialokasikan setelah Bengkel selesai. Satu penduduk hanya memegang satu pekerjaan; jumlah pekerja dibatasi penduduk dan kapasitas fasilitas. Pekerja yang dilepas menjadi tersedia untuk pekerjaan lain.

Setiap 15 hari satu pendatang bisa bergabung jika ada ruang hunian dan pangan lebih dari tiga kali jumlah penduduk. Semua penduduk mengonsumsi 0,65 pangan/hari. Ketika pangan habis, setiap empat hari kelaparan satu penduduk pergi; nol penduduk berarti peradaban runtuh.

## 4. Penelitian → resep → hasil fisik

Peneliti menghasilkan ilmu. Pemain memilih satu penelitian aktif; ilmu yang tersedia digunakan sampai biaya riset terpenuhi. Teknologi lanjutan mensyaratkan teknologi sebelumnya. Riset tidak memberikan bangunan gratis, alat gratis, atau bonus produksi langsung.

| Riset | Biaya ilmu | Prasyarat | Yang dibuka |
|---|---:|---|---|
| Pertanian | 35 | — | Kebun terkelola |
| Perkakas batu | 45 | — | Bengkel perkakas, Kapak, Beliung, Cangkul |
| Irigasi | 110 | Pertanian | Saluran irigasi |
| Arsitektur | 130 | Perkakas batu | Rumah batu |
| Perdagangan | 160 | Perkakas batu | Pasar |
| Pertahanan | 180 | Arsitektur | Benteng wilayah |

Sesudah riset selesai, resep terlihat terbuka. Pemain masih memilih kapan membayar bahan dan memulai konstruksi/produksi. Ini membuat pengetahuan, kemampuan memproduksi, dan hasil yang dimiliki menjadi tiga hal berbeda.

## 5. Bangunan dan fungsinya

Konstruksi memotong bahan saat dipesan. Maksimal tiga bangunan dikerjakan bersamaan. Manfaat baru aktif ketika durasi selesai; konstruksi versi ini tidak memerlukan profesi pembangun.

| Bangunan teknologi | Bahan | Durasi | Fungsi setelah selesai |
|---|---|---:|---|
| Kebun terkelola | 40 kayu, 10 batu | 6 hari | +4 kapasitas petani; +50% hasil dasar untuk 4 petani |
| Bengkel perkakas | 40 kayu, 25 batu | 6 hari | Produksi alat; +2 kapasitas perajin |
| Saluran irigasi | 65 kayu, 45 batu | 8 hari | +70% hasil dasar untuk maksimal 8 petani per saluran |
| Rumah batu | 60 kayu, 70 batu | 10 hari | +12 ruang penduduk |
| Pasar | 50 kayu, 80 koin | 8 hari | Pendapatan koin +60%; maksimum 1 |
| Benteng wilayah | 70 kayu, 100 batu | 12 hari | Pertahanan +35; maksimum 1 |

Petani secara otomatis mendapat cakupan kebun/irigasi sampai batas yang tersedia; versi ini belum memiliki penugasan per bangunan atau penempatan bebas di peta. Tanpa petani, kebun tidak menghasilkan pangan. Bengkel tanpa perajin tidak menghasilkan alat. Rumah batu menambah kapasitas, bukan langsung menciptakan penduduk.

## 6. Pembuatan dan penggunaan alat

Alur konkret: riset Perkakas batu → bayar dan bangun Bengkel → pindahkan penduduk menjadi perajin → pesan alat → bahan dipotong → proses antrean → alat jadi dan digunakan pekerja yang sesuai.

| Alat | Bahan per unit | Tenaga kerja | Pengguna dan manfaat |
|---|---|---:|---|
| Kapak batu | 5 kayu, 4 batu | 3 kerja | 1 penebang mendapat +40% hasil kayu |
| Beliung batu | 4 kayu, 6 batu | 3 kerja | 1 penambang mendapat +40% hasil batu |
| Cangkul batu | 5 kayu, 5 batu | 3 kerja | 1 petani mendapat +30% hasil dasar pangan |

Satu perajin memberikan satu kerja per hari. Antrean maksimal lima pesanan, masing-masing satu alat, diproses berurutan. Dua perajin memberikan dua kerja/hari; sisa kerja dapat melanjutkan pesanan berikutnya. Tanpa perajin, antrean menunggu tanpa menghilangkan bahan yang sudah dibayar.

Alat digunakan otomatis, satu alat per pekerja. Bila ada tiga penebang dan satu kapak, hanya satu yang memperoleh bonus. Lima kapak untuk tiga penebang berarti tiga digunakan dan dua tersimpan. Saat pekerja dipindah, alat tetap dalam persediaan. Alat belum aus atau rusak pada versi ini. Tidak ada bonus dari alat yang tidak digunakan.

## 7. Produksi dan biaya peluang

Tanpa peningkatan, setiap petani menghasilkan 2 pangan/hari, penebang 0,95 kayu/hari, penambang 0,7 batu/hari, dan peneliti 0,8 ilmu/hari. Wilayah mendapat pendapatan dasar 0,18 koin per penduduk/hari. Perk, bangunan, dan alat yang benar-benar tersedia memodifikasi hasil.

Contoh: memindahkan seorang petani menjadi peneliti mengurangi produksi pangan 2/hari dan menambah ilmu 0,8/hari. Memindahkannya menjadi perajin dapat menghasilkan kapak untuk penebang, tetapi pangan tetap harus cukup selama menunggu alat selesai. Strategi yang baik bergantung pada stok, kapasitas, ancaman, dan sasaran berikutnya.

## 8. Wilayah lain dan ekonomi

Asteria, Valdora, dan Nusantara adalah wilayah simulasi dengan pertumbuhan indeks masing-masing +10, +12, dan +8 per bulan. Mereka bergerak pada waktu simulasi yang sama, tidak berkembang saat aplikasi ditutup.

Indeks ekonomi pemain dihitung dari penduduk, bangunan, teknologi yang telah diwujudkan sebagai fasilitas/alat, dan simpanan ilmu. Kurs = indeks mitra / indeks pemain, dengan minimum 0,35. Indeks mitra yang tumbuh lebih cepat meningkatkan biaya impor dalam koin pemain.

Pemain dapat membeli/menjual 10 pangan, kayu, atau batu per transaksi. Harga dasar per unit 1; 1,5; dan 2 koin mitra. Harga beli memakai faktor 1,15, harga jual 0,85, keduanya dikalikan kurs. Pasar menaikkan pemasukan koin; barter/perdagangan dasar tetap tersedia sebelum membangun Pasar. Tidak ada biaya pemeliharaan bangunan atau simulasi aktor ekonomi individual pada versi ini.

## 9. Ancaman dan peradaban

Ancaman muncul tiap 30 hari. Awalnya satwa liar, sejak hari 120 penjarah. Kekuatan meningkat 7 per bulan di atas dasar 18. Penjaga memberi 8 pertahanan, menara 12, benteng 35; perk menambah perlindungan. Pertahanan cukup menahan serangan; jika kalah, hilang 22% pangan dan 10% kayu.

Ancaman wilayah/peperangan skala penuh tetap arah konsep jangka panjang, belum berjalan sebagai diplomasi, pasukan, perebutan wilayah, atau perang antarnegara. Label era bergerak dari Permukiman ke Desa lalu Kota berdasarkan teknologi yang diwujudkan, bukan pohon era lengkap.

## 10. Reset dan warisan

Pemain bisa mengakhiri siklus, atau memulai siklus baru setelah runtuh. Penduduk, bangunan, stok, alat, antrean konstruksi/produksi, dan perkembangan wilayah kembali ke kondisi awal. Pengetahuan dasar yang ditemukan tetap diketahui. Teknologi lanjutan yang pernah ditemukan harus diriset ulang dengan 50% biaya dan prasyarat tetap berlaku.

Walaupun resep dasar sudah diketahui, bangunan dan alatnya tetap harus dibuat kembali. Poin warisan = floor(hari/60) + jumlah jenis teknologi yang sudah diwujudkan dalam bangunan/alat. Membuat banyak kapak tidak menggandakan poin jenis teknologi Perkakas Batu.

Perk permanen: Tradisi agraris +10% hasil dasar pangan per tingkat; Ingatan kolektif +15% produksi ilmu; Semangat penjaga +5 pertahanan. Harga tingkat berikutnya bertambah. Perk yang dibeli bertahan lintas siklus.

## 11. Simpan dan kompatibilitas

Simpan otomatis berlangsung di browser setelah aksi/tick; tidak ada progres offline maupun akun cloud. Ekspor/impor JSON adalah cadangan portabel. Save v0.1 yang valid diterima dan dimigrasikan: penerapan lama menjadi bangunan pengganti, serta kapak/beliung sesuai pekerja lama untuk teknologi perkakas. Tidak dibebani biaya ulang. Ekonomi dapat sedikit bergeser akibat kapasitas bangunan baru; balancing masih prototipe.

## 12. Batas dan keputusan berikutnya

Sudah berjalan: alokasi pekerja, bahan, riset berprasyarat, pembukaan bangunan/resep, konstruksi, bengkel/perajin, inventaris/pemakaian alat, perdagangan-kurs sederhana, ancaman, pertumbuhan/kelaparan, reset/perk, simpan/muat/migrasi.

Belum berjalan: deposit SDA terbatas, pengolahan bahan bertingkat (bijih→logam→alat), keausan, penempatan bangunan bebas, penugasan individu, diplomasi/perang penuh, skenario edukasi dan pencatatan eksperimen pre-post. Hal tersebut merupakan kandidat pengembangan, bukan otomatis pekerjaan yang disetujui.
