# Project X — Build desktop Windows

8 November 2026 · Zephyr meminta paket desktop untuk pengumpulan UTS. Build membungkus [playtest fondasi](WEB_FOUNDATION.md) dari commit `0fd6443` sebagai aplikasi Windows x64.

## Menjalankan

Ekstrak seluruh ZIP dan buka `Project X - Benteng Lembah.exe`. Paket menyertakan konten game, DLL WebView2, lisensi pihak ketiga, dan `MULAI.txt`. Mesin target memakai Windows 10 atau 11 x64, Microsoft Edge WebView2 Runtime, dan .NET Framework 4.8 atau lebih baru. Konten dilayani melalui pemetaan WebView2 internal dari folder `game/`. Profil save desktop berada di `%LOCALAPPDATA%\Project X\Benteng Lembah`.

## Membuat paket

Ekstrak paket SDK resmi [Microsoft.Web.WebView2 1.0.4314.35](https://www.nuget.org/packages/Microsoft.Web.WebView2/1.0.4314.35) ke sebuah folder. Dari root repo jalankan `./desktop/Build.ps1 -WebView2Sdk <folder SDK> -OutputDirectory <folder output>`, lalu ZIP seluruh isi output.

## Bukti dan batas

- ZIP final lolos uji integritas. Konten web dikemas dari build fondasi dan dicocokkan dengan checkout.
- Pengujian WinForms/WebView2 dijalankan dari folder hasil ekstraksi dengan profil sementara. Pemeriksaan memulai ekspedisi, memuat gambar HUD dan tile, menetapkan profesi, memesan bengkel, menutup proses, lalu membuka proses baru dan melanjutkan sesi dalam keadaan jeda. Build uji memakai host yang sama dengan profil dan pemeriksaan otomatis khusus pengujian.
- Diuji pada mesin Windows Zephyr. Build x64 mengandalkan runtime WebView2 yang tersedia pada mesin tujuan. Paket portable tanpa installer.
