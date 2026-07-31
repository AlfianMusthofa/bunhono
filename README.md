## 1. Deskripsi Project
 
**BunHono** adalah backend API untuk **SaaS Event Management Platform**. Cakupannya lebih luas dari sekadar manajemen event — juga mencakup fitur artikel/blog (dengan like & komentar), review event, mentor, sertifikat, laporan peserta, notifikasi email otomatis, hingga integrasi AI chat.
 
## 2. Tech Stack
 
| Kategori | Teknologi |
|---|---|
| Runtime | [Bun](https://bun.sh/) |
| Framework | [Hono](https://hono.dev/) v4 |
| ORM | Sequelize v6 |
| Database | MySQL (`mysql2`) |
| Autentikasi | JWT (access token + refresh token) |
| Hashing password | bcryptjs |
| Media/File Storage | Cloudinary |
| Email | Nodemailer |
| AI | `@google/genai` (Gemini API) |
| PDF/Sertifikat | pdfkit, canvas, qrcode |
| Scheduler | node-cron |
| Export data | xlsx |
| Validasi | Zod |
| ID generator | nanoid, uuid |
 
## 3. Struktur Project
 
```
bunhono/
├── src/
│   ├── app.ts                # Registrasi seluruh route & middleware global
│   ├── server.ts             # Entry point: connect DB, sync model, start server
│   ├── config/
│   │   ├── database.ts       # Koneksi Sequelize ke MySQL
│   │   └── cloudinary.ts     # Konfigurasi Cloudinary
│   ├── controllers/          # Logic handler untuk tiap endpoint
│   ├── routes/                # Definisi route per modul
│   ├── models/                # Model Sequelize + relasi antar tabel
│   ├── middleware/
│   │   └── auth.middleware.ts # authMiddleware (wajib login) & optionalAuth
│   ├── jobs/                  # Cron job terjadwal
│   │   ├── eventStatus.job.ts     # Update status event (ended) tiap jam
│   │   └── ReminderMail.job.ts    # Kirim email reminder H-1 event
│   ├── service/                # Business logic terpisah dari controller
│   ├── validators/             # Skema validasi (Zod)
│   ├── errors/                 # Custom error handling
│   ├── utils/                  # Helper (JWT, email, dll)
│   └── test/                   # Test suite
├── uploads/                    # File upload lokal (misalnya template sertifikat)
├── index.ts
├── package.json
├── tsconfig.json
└── README.md
```
 
## 4. Instalasi & Setup
 
### 4.1 Clone Repository
 
```bash
git clone https://github.com/AlfianMusthofa/bunhono.git
cd bunhono
```
 
### 4.2 Install Dependencies
 
```bash
bun install
```
 
### 4.3 Environment Variables
 
Project **tidak menyertakan file `.env.example`** di repo, jadi environment variable berikut perlu dibuat manual dalam file `.env` di root project (diambil dari seluruh penggunaan `process.env` di source code):
 
```env
# Database
DB_NAME=
DB_USER=
DB_PASS=
 
# JWT
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=
 
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
 
# Email (Nodemailer)
MAIL_HOST=
MAIL_PORT=
EMAIL_USER=
PASS_USER=
ADMIN_EMAIL=
 
# AI (Google Gemini)
GEMINI_API_KEY=
```
 
> Catatan: konfigurasi database (`src/config/database.ts`) meng-hardcode `host: "localhost"` dan `dialect: "mysql"`, jadi pastikan MySQL berjalan secara lokal (atau sesuaikan kode jika deploy ke server terpisah).
 
### 4.4 Menjalankan Server
 
```bash
bun --watch src/server.ts   # mode development (via `bun run dev`)
# atau
bun src/server.ts           # mode production (via `bun run start`)
```
 
Server berjalan di **port 3000**. Saat start, aplikasi otomatis:
- Konek ke database
- Menjalankan `sequelize.sync({ alter: true })` — otomatis menyesuaikan skema tabel
- Mengaktifkan cron job (`eventStatus.job.ts` dan `ReminderMail.job.ts`)
## 5. Cron Jobs (Terjadwal)
 
| Job | Jadwal | Fungsi |
|---|---|---|
| `eventStatus.job.ts` | Tiap jam (`0 * * * *`, timezone Asia/Jakarta) | Otomatis mengubah status event menjadi "ended" jika sudah lewat waktu |
| `ReminderMail.job.ts` | Tiap jam (`0 * * * *`) | Mengirim email reminder ke peserta yang event-nya berlangsung besok (H-1) |
 
## 6. Autentikasi
 
Middleware `authMiddleware` mewajibkan header:
```
Authorization: Bearer <accessToken>
```
Ada juga `optionalAuth` — tetap lanjut walau tanpa token, dipakai di beberapa endpoint publik yang perilakunya bisa berbeda jika user login (misal: detail artikel).
 
## 7. Dokumentasi Endpoint API
 
Base URL: `http://localhost:3000`
 
### 7.1 `/auth` — Autentikasi
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | - | Login user |
| POST | `/auth/refresh` | - | Refresh access token |
| POST | `/auth/send-otp` | - | Kirim kode OTP (untuk registrasi) |
| POST | `/auth/verify-otp` | - | Verifikasi kode OTP |
| POST | `/auth/logout` | ✅ | Logout user |
| GET | `/auth/me` | ✅ | Ambil data user yang sedang login |
 
### 7.2 `/users` — User
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/users` | - | Ambil semua/list user |
| POST | `/users/register` | - | Registrasi user baru |
| PATCH | `/users` | - | Update data user (sendiri) |
| PATCH | `/users/:id` | - | Update user berdasarkan ID |
| GET | `/users/:id` | - | Ambil detail user berdasarkan ID |
| GET | `/users/me/history` | ✅ | Riwayat event yang pernah diikuti user |
 
### 7.3 `/events` — Event
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/events` | - | Buat event baru |
| GET | `/events` | - | Ambil semua event |
| GET | `/events/upcoming` | - | Ambil event yang akan datang |
| PATCH | `/events/id/:id` | - | Update event berdasarkan ID |
| POST | `/events/:id/join` | ✅ | User join/daftar ke event |
| GET | `/events/:id` | - | Detail event berdasarkan ID |
| GET | `/events/:id/participants` | - | Daftar peserta event |
| GET | `/events/slug/:slug` | - | Detail event berdasarkan slug |
| GET | `/events/charts/monthly` | - | Data chart jumlah event per bulan |
| GET | `/events/dashboard/participants/monthly` | - | Data chart jumlah peserta per bulan |
| GET | `/events/totalHistory` | ✅ | Total riwayat event user |
| POST | `/events/checkin` | - | Check-in peserta (misalnya via scan QR) |
| GET | `/events/:eventId/my-review` | ✅ | Review milik user untuk event tertentu |
 
### 7.4 `/category` — Kategori Event
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/category` | - | Ambil semua kategori |
| POST | `/category` | - | Tambah kategori baru |
| GET | `/category/events` | - | Kategori beserta list event-nya |
| GET | `/category/:id/events` | - | Event berdasarkan kategori tertentu |
 
### 7.5 `/mentors` — Mentor
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/mentors` | - | Ambil semua mentor |
| POST | `/mentors` | - | Tambah mentor baru |
| PUT | `/mentors/:id` | - | Update data mentor |
 
### 7.6 `/status` — Status Event
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/status` | - | Ambil semua status event |
| GET | `/status/count/active` | - | Jumlah event aktif |
| GET | `/status/count/pending` | - | Jumlah event pending |
| GET | `/status/count/ended` | - | Jumlah event yang sudah berakhir |
| GET | `/status/count/cancelled` | - | Jumlah event yang dibatalkan |
 
### 7.7 `/certificate` — Sertifikat
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/certificate/:id/get` | - | Ambil template sertifikat event |
| GET | `/certificate/:id/participants/report` | - | Download laporan peserta |
| GET | `/certificate/:id/download` | ✅ | Download sertifikat peserta |
| POST | `/certificate/:id/upload` | - | Upload template sertifikat |
| PUT | `/certificate/:id/update` | - | Update template sertifikat |
 
### 7.8 `/report` — Laporan
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/report/:id/participants/report` | - | Download laporan peserta (format Excel/xlsx) |
 
### 7.9 `/articles` — Artikel/Blog
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/articles` | - | Ambil semua artikel |
| GET | `/articles/:slug` | Optional | Detail artikel berdasarkan slug |
| POST | `/articles` | - | Buat artikel baru |
| PATCH | `/articles/:slug` | - | Update artikel |
| DELETE | `/articles/:slug` | - | Hapus artikel |
| POST | `/articles/:articleId/like` | ✅ | Like/unlike artikel (toggle) |
 
### 7.10 `/comments` — Komentar Artikel
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/comments` | - | Ambil semua komentar |
| GET | `/comments/:articleId` | - | Komentar untuk artikel tertentu (mendukung reply/thread) |
| POST | `/comments/:articleId` | ✅ | Tambah komentar baru |
 
### 7.11 `/reviews` — Review Event
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/reviews` | - | Ambil semua review |
| GET | `/reviews/total` | ✅ | Total jumlah review |
| GET | `/reviews/:eventId` | - | Review untuk event tertentu |
| POST | `/reviews/:eventId` | ✅ | Kirim review (rating + komentar) untuk event |
 
### 7.12 `/ai` — AI Chat
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/ai/chat` | - | Chat umum dengan AI (Gemini) |
| POST | `/ai/events/:slug/ai` | - | Chat AI dalam konteks event tertentu |
 
### 7.13 `/email` — Email
 
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/email/contact` | - | Kirim email dari form kontak |
 
### 7.14 Static Files
 
| Path | Deskripsi |
|---|---|
| `/uploads/*` | File statis (misalnya gambar/template) disajikan langsung dari folder `uploads/` |
 
## 8. Skema Database (Ringkasan Model & Relasi)
 
| Tabel | Deskripsi Singkat |
|---|---|
| `users` | Data user: name, email, password (hashed), image, total_points |
| `events` | Data event: title, description, waktu mulai/selesai, lokasi (online/offline), kategori, mentor, kapasitas, harga, status, poin reward |
| `categories` | Kategori event |
| `mentors` | Data mentor/pembicara event |
| `event_statuses` | Master status event (active, pending, ended, cancelled, dll) |
| `event_participants` | Relasi many-to-many antara user & event (peserta), termasuk kode tiket & status check-in |
| `certificates` | Sertifikat per event/peserta, menyimpan template & hasil sertifikat |
| `refresh_tokens` | Penyimpanan refresh token per user |
| `otp_codes` | Kode OTP untuk verifikasi registrasi |
| `articles` | Artikel/blog (soft-delete/`paranoid`) |
| `tags` & `article_tags` | Tag artikel (many-to-many) |
| `likes` | Like user terhadap artikel |
| `comments` | Komentar artikel, mendukung reply (self-referencing `parentId`) |
| `reviews` | Review & rating user terhadap event (unik per user+event) |
 
**Relasi penting:**
- `User` ↔ `Event` : many-to-many melalui `EventParticipantModel` (peserta event)
- `Event` → `Category`, `Event` → `Mentor`, `Event` → `EventStatus` : belongsTo
- `Event` → `Certificate` : one-to-many
- `EventParticipantModel` → `Certificate` : one-to-one (sertifikat per peserta)
- `Article` → `Category`, `Article` → `Like`, `Article` → `Comment` : one-to-many
- `Comment` → `Comment` (self-relation `parentId`/`replies`) : untuk thread balasan komentar
- `Review` → `User`, `Review` → `Event` : belongsTo (unik per kombinasi user+event)
## 9. Fitur Utama (Ringkasan Fungsional)
 
1. **Autentikasi** — Register via OTP email, login dengan JWT (access + refresh token)
2. **Manajemen Event** — CRUD event, kategori, mentor, status otomatis via cron
3. **Partisipasi Event** — Join event, check-in peserta (QR code), riwayat event user
4. **Sertifikat** — Upload template, generate & download sertifikat otomatis (pdfkit + canvas + qrcode)
5. **Laporan** — Export laporan peserta ke Excel (xlsx)
6. **Blog/Artikel** — CRUD artikel, like, komentar berjenjang (reply)
7. **Review & Rating** — User dapat memberi review terhadap event yang diikuti
8. **AI Chat** — Chat interaktif berbasis Gemini AI, termasuk chat dalam konteks event tertentu
9. **Notifikasi Email** — Reminder otomatis H-1 sebelum event via cron job + Nodemailer
10. **Dashboard/Statistik** — Chart jumlah event & peserta per bulan, hitung status event
