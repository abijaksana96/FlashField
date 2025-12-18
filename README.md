# 🔬 FlashField

<p align="center">
  <strong>Platform Citizen Science untuk Micro-Experiments</strong><br>
  <em>Sains untuk Semua — Mulai dari Sekitarmu</em>
</p>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Screenshot](#-screenshot)
- [Instalasi & Setup](#-instalasi--setup)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Kontributor](#-kontributor)

---

## 🎯 Tentang Project

**FlashField** adalah platform *citizen science* yang memungkinkan peneliti (*researcher*) untuk membuat eksperimen mikro dan mengumpulkan data dari kontributor (*volunteer*). Platform ini dirancang untuk memudahkan pengumpulan data sains dari masyarakat umum dengan fitur lokasi geografis, form dinamis, dan visualisasi data real-time.

### Konsep Utama

- **Researcher**: Membuat dan mengelola eksperimen, melihat statistik dan data submission
- **Volunteer**: Berkontribusi pada eksperimen dengan mengirimkan data observasi
- **Admin**: Mengelola user dan eksperimen di seluruh platform

---

## ✨ Fitur Utama

### Untuk Volunteer
- 🔍 Menelusuri dan berpartisipasi dalam eksperimen yang tersedia
- 📍 Mengirim data observasi dengan dukungan lokasi GPS
- 📊 Melihat kontribusi dan statistik pribadi
- 🎯 Form input dinamis sesuai kebutuhan eksperimen

### Untuk Researcher
- ➕ Membuat eksperimen baru dengan konfigurasi field yang fleksibel
- 📈 Dashboard statistik dengan visualisasi data
- 🗺️ Peta heatmap untuk melihat distribusi data
- 📋 Mengelola submission dari volunteer

### Untuk Admin
- 👥 Manajemen user (aktivasi, deaktivasi, role management)
- 🔬 Manajemen eksperimen di seluruh platform
- 📊 Statistik global dan monitoring sistem

---

## 🛠️ Tech Stack

### Backend
| Teknologi | Deskripsi |
|-----------|-----------|
| **FastAPI** | Web framework modern untuk Python dengan performa tinggi |
| **SQLAlchemy** | ORM untuk interaksi dengan database |
| **PostgreSQL** | Database relasional utama |
| **JWT (python-jose)** | Autentikasi berbasis token |
| **Pydantic** | Validasi data dan serialization |
| **Uvicorn** | ASGI server untuk production |
| **Passlib + Bcrypt** | Hashing password yang aman |

### Frontend
| Teknologi | Deskripsi |
|-----------|-----------|
| **React 18** | Library UI component-based |
| **Vite** | Build tool dan dev server yang cepat |
| **React Router** | Routing untuk Single Page Application |
| **Axios** | HTTP client untuk komunikasi API |
| **Leaflet** | Library peta interaktif |
| **Chart.js** | Visualisasi data dengan grafik |
| **TailwindCSS** | Utility-first CSS framework |

---

## 📁 Struktur Project

```
FlashField/
├── backend/
│   ├── app/
│   │   ├── auth/           # Autentikasi (JWT, login, register)
│   │   ├── core/           # Konfigurasi & security
│   │   ├── crud/           # Database operations
│   │   ├── router/         # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── database.py     # Koneksi database
│   │   ├── main.py         # Entry point FastAPI
│   │   └── models.py       # SQLAlchemy models
│   ├── requirements.txt    # Dependencies Python
│   └── wsgi.py             # WSGI entry point
│
├── frontend/
│   └── flashfield/
│       ├── src/
│       │   ├── api/        # API service layer
│       │   ├── assets/     # Static assets
│       │   ├── components/ # React components
│       │   ├── context/    # React context (auth)
│       │   ├── pages/      # Halaman aplikasi
│       │   ├── App.jsx     # Main App component
│       │   └── main.jsx    # Entry point React
│       ├── package.json    # Dependencies Node.js
│       └── vite.config.js  # Vite configuration
│
├── docs/
│   └── screenshots/        # Screenshot aplikasi
│
└── README.md               # Dokumentasi ini
```

---

## 📸 Screenshot

### Landing Page
Halaman utama yang menampilkan hero section dan informasi platform.

![Landing Page](docs/screenshots/landing_page.png)

### Login Page
Halaman login dengan validasi form.

![Login Page](docs/screenshots/login_page.png)

### Register Page
Halaman registrasi user baru dengan pilihan role (Volunteer/Researcher).

![Register Page](docs/screenshots/register_page.png)

---

## 🚀 Instalasi & Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Clone Repository
```bash
git clone https://github.com/username/FlashField.git
cd FlashField
```

### 2. Setup Backend

```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# atau
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
```

**Konfigurasi `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/flashfield
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
# Jalankan server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Setup Frontend

```bash
# Masuk ke direktori frontend
cd frontend/flashfield

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan URL API backend
```

**Konfigurasi `.env.local`:**
```env
VITE_API_URL=http://localhost:8000
```

```bash
# Jalankan development server
npm run dev
```

### 4. Akses Aplikasi

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/auth/register` | Registrasi user baru |
| `POST` | `/auth/login` | Login dan mendapatkan JWT token |
| `GET` | `/auth/me` | Mendapatkan info user yang login |

### Users
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/users/` | List semua user (Admin only) |
| `GET` | `/users/{id}` | Detail user tertentu |
| `PUT` | `/users/{id}` | Update user |
| `DELETE` | `/users/{id}` | Hapus user (Admin only) |

### Experiments
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/experiments/` | List semua eksperimen |
| `POST` | `/experiments/` | Buat eksperimen baru (Researcher) |
| `GET` | `/experiments/{id}` | Detail eksperimen |
| `PUT` | `/experiments/{id}` | Update eksperimen |
| `DELETE` | `/experiments/{id}` | Hapus eksperimen |
| `GET` | `/experiments/{id}/fields` | Konfigurasi field eksperimen |
| `POST` | `/experiments/{id}/submissions` | Submit data ke eksperimen |
| `GET` | `/experiments/{id}/submissions` | List submission eksperimen |

### Statistics
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/stats/overview` | Statistik overview platform |
| `GET` | `/stats/experiments/{id}` | Statistik eksperimen tertentu |

---

## 💾 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     Users       │       │   Experiments   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ created_by (FK) │
│ full_name       │       │ id (PK)         │
│ email           │       │ title           │
│ hashed_password │       │ description     │
│ role            │       │ input_fields    │
│ is_active       │       │ require_location│
│ created_at      │       │ deadline        │
└────────┬────────┘       │ created_at      │
         │                └────────┬────────┘
         │                         │
         │    ┌────────────────────┘
         │    │
         ▼    ▼
┌─────────────────┐       ┌─────────────────┐
│   Submissions   │       │   Audit_Logs    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ experiment_id   │       │ action          │
│ user_id (FK)    │       │ user_id (FK)    │
│ geo_lat         │       │ details         │
│ geo_lng         │       │ timestamp       │
│ data_json       │       └─────────────────┘
│ timestamp       │
└─────────────────┘
```

### Tabel Users
- **id**: Primary key
- **full_name**: Nama lengkap user
- **email**: Email (unique)
- **hashed_password**: Password yang di-hash
- **role**: `volunteer`, `researcher`, atau `admin`
- **is_active**: Status aktif user
- **created_at**: Waktu registrasi

### Tabel Experiments
- **id**: Primary key
- **title**: Judul eksperimen
- **description**: Deskripsi detail
- **input_fields**: JSON konfigurasi field input dinamis
- **require_location**: Boolean untuk kebutuhan lokasi
- **deadline**: Batas waktu partisipasi
- **created_by**: Foreign key ke Users
- **created_at**: Waktu pembuatan

### Tabel Submissions
- **id**: Primary key
- **experiment_id**: Foreign key ke Experiments
- **user_id**: Foreign key ke Users
- **geo_lat**: Latitude lokasi
- **geo_lng**: Longitude lokasi
- **data_json**: Data submission sesuai field config
- **timestamp**: Waktu submission

### Tabel Audit_Logs
- **id**: Primary key
- **action**: Jenis aksi (USER_LOGIN, dll)
- **user_id**: Foreign key ke Users
- **details**: Detail tambahan
- **timestamp**: Waktu aksi

---

## 🔧 Dynamic Input Fields

Eksperimen di FlashField mendukung konfigurasi field input yang dinamis. Researcher dapat menentukan field yang diperlukan dengan berbagai tipe:

### Tipe Input yang Didukung
- `text` - Input teks satu baris
- `textarea` - Input teks multi baris
- `number` - Input angka
- `select` - Dropdown selection
- `radio` - Radio button (pilih satu)
- `checkbox` - Checkbox (pilih multiple)
- `date` - Input tanggal
- `time` - Input waktu
- `datetime` - Input tanggal dan waktu

### Contoh Konfigurasi
```json
{
  "input_fields": [
    {
      "name": "temperature",
      "label": "Suhu (°C)",
      "type": "number",
      "required": true,
      "min_value": -50,
      "max_value": 60
    },
    {
      "name": "weather",
      "label": "Kondisi Cuaca",
      "type": "select",
      "required": true,
      "options": ["Cerah", "Berawan", "Hujan"]
    }
  ]
}
```

Lihat [API_DYNAMIC_FIELDS.md](backend/API_DYNAMIC_FIELDS.md) untuk dokumentasi lengkap.

---

## 👥 Kontributor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/farafahirun">
        <img src="https://github.com/farafahirun.png" width="100px;" alt="Developer"/><br />
        <sub><b>Fara Rahmasari Fahirun</b></sub>
      </a><br />
      Universitas Hasanuddin
    </td>
  </tr>
</table>

---

## 📄 Lisensi

Project ini dibuat untuk keperluan akademis Mata Kuliah **Web Lanjutan** di **Universitas Hasanuddin**.
