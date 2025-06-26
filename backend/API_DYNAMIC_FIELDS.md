# API Documentation: Dynamic Input Fields for Experiments

## Overview
Sistem experiment di FlashField sekarang mendukung konfigurasi field input yang dinamis. Researcher dapat menentukan field apa saja yang perlu diisi oleh volunteer, beserta validasinya.

## Struktur Input Field

Setiap input field memiliki konfigurasi sebagai berikut:

```json
{
  "name": "field_name",           // Nama field (untuk data storage)
  "label": "Field Label",         // Label yang ditampilkan ke user
  "type": "text",                 // Tipe input
  "required": true,               // Apakah field wajib diisi
  "placeholder": "Enter value",   // Placeholder text (optional)
  "description": "Help text",     // Deskripsi bantuan (optional)
  "options": ["A", "B", "C"],    // Opsi untuk select/radio/checkbox (optional)
  "min_value": 0,                 // Nilai minimum untuk number (optional)
  "max_value": 100,               // Nilai maksimum untuk number (optional)
  "min_length": 5,                // Panjang minimum untuk text (optional)
  "max_length": 200               // Panjang maksimum untuk text (optional)
}
```

## Tipe Input yang Didukung

1. **text** - Input teks satu baris
2. **textarea** - Input teks multi baris
3. **number** - Input angka (integer/float)
4. **select** - Dropdown selection
5. **radio** - Radio button (pilih satu)
6. **checkbox** - Checkbox (pilih multiple)
7. **date** - Input tanggal
8. **time** - Input waktu
9. **datetime** - Input tanggal dan waktu

## Contoh Penggunaan

### 1. Membuat Experiment dengan Field Input

```json
POST /experiments/
{
  "title": "Pengukuran Tingkat Kebisingan",
  "description": "Mengukur tingkat kebisingan di berbagai lokasi",
  "require_location": true,
  "deadline": "2025-12-31T23:59:59Z",
  "input_fields": [
    {
      "name": "noise_level",
      "label": "Tingkat Kebisingan (dB)",
      "type": "number",
      "required": true,
      "min_value": 0,
      "max_value": 150,
      "description": "Masukkan tingkat kebisingan dalam desibel"
    },
    {
      "name": "environment_type",
      "label": "Jenis Lingkungan",
      "type": "select",
      "required": true,
      "options": ["Perumahan", "Perkantoran", "Industri", "Jalan Raya", "Area Publik"]
    },
    {
      "name": "weather_condition",
      "label": "Kondisi Cuaca",
      "type": "radio",
      "required": true,
      "options": ["Cerah", "Berawan", "Hujan", "Mendung"]
    },
    {
      "name": "noise_sources",
      "label": "Sumber Kebisingan",
      "type": "checkbox",
      "required": false,
      "options": ["Kendaraan", "Konstruksi", "Pabrik", "Manusia", "Alam"]
    },
    {
      "name": "measurement_time",
      "label": "Waktu Pengukuran",
      "type": "datetime",
      "required": true
    },
    {
      "name": "additional_notes",
      "label": "Catatan Tambahan",
      "type": "textarea",
      "required": false,
      "max_length": 500,
      "placeholder": "Tambahkan catatan jika diperlukan"
    }
  ]
}
```

### 2. Submit Data ke Experiment

```json
POST /experiments/1/submissions
{
  "geo_lat": -5.135399,
  "geo_lng": 119.4210883,
  "data_json": {
    "noise_level": 75.5,
    "environment_type": "Jalan Raya",
    "weather_condition": "Cerah",
    "noise_sources": ["Kendaraan", "Konstruksi"],
    "measurement_time": "2025-06-27T14:30:00Z",
    "additional_notes": "Pengukuran dilakukan saat jam sibuk"
  }
}
```

### 3. Mendapatkan Konfigurasi Field untuk Form

```json
GET /experiments/1/fields

Response:
{
  "experiment_id": 1,
  "title": "Pengukuran Tingkat Kebisingan",
  "description": "Mengukur tingkat kebisingan di berbagai lokasi",
  "require_location": true,
  "deadline": "2025-12-31T23:59:59Z",
  "input_fields": [
    // ... konfigurasi field seperti di atas
  ]
}
```

## Validasi Data

Sistem akan otomatis memvalidasi data submission berdasarkan konfigurasi field:

1. **Required Fields** - Field wajib harus ada dan tidak kosong
2. **Data Types** - Validasi tipe data sesuai konfigurasi
3. **Number Range** - Validasi min_value dan max_value untuk field number
4. **Text Length** - Validasi min_length dan max_length untuk field text/textarea
5. **Options** - Validasi pilihan harus sesuai dengan options yang disediakan
6. **Location** - Validasi lokasi jika require_location = true

## Error Responses

Jika validasi gagal, API akan mengembalikan error 400 dengan detail yang spesifik:

```json
{
  "detail": "Field 'Tingkat Kebisingan (dB)' (noise_level) wajib diisi"
}
```

```json
{
  "detail": "Field 'Tingkat Kebisingan (dB)' harus minimal 0"
}
```

```json
{
  "detail": "Field 'Jenis Lingkungan' harus salah satu dari: Perumahan, Perkantoran, Industri, Jalan Raya, Area Publik"
}
```
