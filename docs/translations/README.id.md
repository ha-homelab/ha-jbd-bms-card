# JBD Battery & Cell Card — Bahasa Indonesia

[Bahasa](README.md) · [Dokumentasi lengkap dalam bahasa Inggris](../../README.md)

Kartu Home Assistant hanya-baca untuk menampilkan tingkat pengisian, tegangan paket baterai, arus, daya, suhu, dan tegangan setiap sel. Kartu memakai entitas numerik yang sudah ada; Victron dan Cerbo GX tidak diperlukan. Dukungan untuk seluruh 24 bahasa antarmuka memerlukan versi 0.2.0 atau lebih baru. Periksa catatan rilis yang diterbitkan; dokumentasi pengembangan dapat menjelaskan kode yang lebih baru daripada rilis terakhir.

## Instalasi dan konfigurasi

Di HACS, tambahkan `https://github.com/ha-homelab/ha-jbd-bms-card` sebagai **repositori kustom**, dengan tipe **Dashboard**, lalu unduh rilis yang diinginkan. Kartu belum tersedia di katalog bawaan. Daftarkan modul JavaScript berikut jika HACS belum melakukannya:

```text
/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js
```

Untuk instalasi manual, salin `ha-jbd-bms-card.js` dari rilis ke `/config/www/` dan daftarkan `/local/ha-jbd-bms-card.js` sebagai modul JavaScript. Gunakan hanya satu URL sumber daya, kemudian muat ulang peramban. Lihat [HACS, pembaruan, dan migrasi](../hacs.md) untuk mengganti salinan yang sebelumnya dipasang secara manual.

Tambahkan kartu Manual. Ganti setiap ID entitas contoh dengan ID sebenarnya dari **Developer Tools → States** di Home Assistant:

```yaml
type: custom:ha-jbd-bms-card
language: auto
batteries:
  - name: Battery 1
    soc: sensor.my_battery_soc
    voltage: sensor.my_battery_voltage
    current: sensor.my_battery_current
    power: sensor.my_battery_power
    temperature: sensor.my_battery_temperature
    cells:
      - sensor.my_battery_cell_1
      - sensor.my_battery_cell_2
      - sensor.my_battery_cell_3
      - sensor.my_battery_cell_4
```

Tambahkan satu entri daftar untuk setiap baterai berikutnya. SOC, tegangan paket, dan daftar sel wajib diisi; pengukuran lain bersifat opsional. Pilih sel dari BMS dan monitor yang sama. Mengetuk suatu nilai membuka riwayat atau detailnya di HA, tanpa mengirim perintah ke baterai.

## Bahasa

Hilangkan `language` atau gunakan `language: auto` untuk mengikuti bahasa profil Home Assistant. Gunakan `language: id` untuk menetapkan bahasa Indonesia pada kartu ini. Tag bahasa regional dikenali, dan bahasa yang tidak didukung kembali ke bahasa Inggris. Nama buatan Anda dan ID entitas tidak pernah diterjemahkan. Semua kamus disertakan dalam kartu; tidak ada layanan penerjemahan yang dihubungi. Lihat [pemilihan bahasa](../i18n.md).

## ESPHome dan kualitas pengukuran

Ikuti [panduan penerapan ESPHome](../esphome-deployment.md) dan [proyek firmware](https://github.com/victron-venus/esphome-jbd-bms-mqtt). Setiap profil yang dipelihara dalam proyek tersebut mengharapkan **empat BMS dengan empat sel per BMS**. Konfigurasikan alamat Bluetooth, Wi-Fi, dan broker MQTT secara privat, lalu tambahkan integrasi MQTT atau ESPHome di HA. Memasang kartu ini tidak mem-flash ESP32 atau membuat entitas baterai.

Nilai yang tidak tersedia tetap ditampilkan sebagai tidak tersedia. Kartu menghitung selisih tegangan sel tertinggi dan terendah hanya jika semua sel yang dikonfigurasi memiliki nilai valid. Warna adalah ambang tampilan, bukan pengaturan perlindungan BMS. Nilai MQTT yang disimpan dan koneksi daring tidak membuktikan bahwa pengukuran masih baru; terapkan kedaluwarsa pada sumber data bila diperlukan. Lihat [konfigurasi dan kesegaran data](../configuration.md) serta [kajian kelayakan Echo Dot](../echo-dot-bluetooth.md) yang terpisah.
