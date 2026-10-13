# Catatan Perkembangan Proyek: SIGAP MJIC
**Sistem Informasi Administrasi Guru & Penilaian Siswa (SIGAP)**

Dokumen ini ditujukan sebagai panduan ringkas dan komprehensif bagi AI maupun developer selanjutnya untuk memahami arsitektur, apa yang telah dikerjakan, dan langkah teknis berikutnya.

---

## 1. Ringkasan Proyek & Struktur Direktori

Aplikasi dirancang dengan pendekatan manual monorepo yang memisahkan client (frontend) dan server (backend) dalam satu repositori Git:

```text
sigap-mjic/
├── .cpanel.yml             # Skrip automasi deployment cPanel via Git Version Control
├── .gitignore              # Mengabaikan node_modules, .env, dist, dsb.
├── catatan1.md             # Catatan dokumentasi proyek
├── sigap-backend/          # Backend API (Node.js, Express, TypeScript, Prisma ORM, MySQL)
│   ├── prisma/
│   │   ├── schema.prisma   # Schema database (User, Student, Subject, Attendance, Grade)
│   │   └── seed.ts         # Seeder awal data siswa, mapel, dan user admin
│   ├── src/
│   │   ├── controllers/    # Controller API (auth, attendance, grade, report, master)
│   │   ├── routes/         # Routing Express (/api/login, /api/students, /api/attendance, dsb.)
│   │   └── index.ts        # Entry point server Express & middleware JWT
│   ├── tsconfig.json       # Konfigurasi build TypeScript (output ke dist/ CommonJS)
│   └── package.json
└── sigap-frontend/         # Frontend SPA (React 19, Vite, Tailwind CSS v4, TypeScript)
    ├── src/
    │   ├── components/     # UI Components (AttendanceForm, GradeForm, ReportForm, LoginForm, Layout)
    │   ├── services/
    │   │   └── api.ts      # Axios client dengan interceptor Bearer Token JWT
    │   ├── App.tsx         # Routing state & proteksi login
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 2. Tech Stack & Library Kunci

- **Backend**:
  - **Runtime & Language**: Node.js, TypeScript (di-compile ke CommonJS untuk kompatibilitas Phusion Passenger cPanel).
  - **Framework**: Express.js, CORS, dotenv.
  - **ORM & Database**: Prisma ORM (v6.19.3) terhubung ke MySQL.
  - **Keamanan**: `jsonwebtoken` (JWT) untuk session auth, `bcryptjs` untuk hashing password.
- **Frontend**:
  - **Framework**: React 19 + Vite (TypeScript).
  - **Styling**: Tailwind CSS v4.
  - **Ikon**: `lucide-react` (**Catatan Penting**: Desain diinstruksikan menghindari emoji dan selalu memakai SVG icon modern agar terlihat profesional).
  - **PDF Export**: `html2pdf.js` untuk generate lembar rapor siswa langsung dari browser.

---

## 3. Database & Model Data (Prisma)

Model yang telah didefinisikan pada `sigap-backend/prisma/schema.prisma`:
1. **User**: Autentikasi guru/admin (`id`, `username`, `password`, `name`, `role`).
   - Akun default seeder: `admin` / `admin123`.
2. **Student**: Data siswa (`id`, `nis`, `name`, `class`).
3. **Subject**: Mata pelajaran (`id`, `name`, `code`).
4. **Attendance**: Presensi harian (`id`, `studentId`, `date`, `status: HADIR/IZIN/SAKIT/ALPA`, `notes`).
5. **Grade**: Nilai siswa (`id`, `studentId`, `subjectId`, `semester`, `scoreFormatif`, `scoreSumatif`, `scorePTS`, `scorePAS`, `finalScore`).

---

## 4. Fitur yang Telah Selesai Diimplementasikan

1. **Sistem Autentikasi (Login & Logout)**:
   - Endpoint: `POST /api/login` (verifikasi hash bcrypt & issue JWT token).
   - Frontend: Form login terintegrasi, token disimpan di `localStorage`, otomatis diarahkan ke Dashboard. Tombol logout menghapus token dan mereset state.
2. **Manajemen Presensi Siswa**:
   - Mendukung input presensi massal per tanggal dan kelas.
   - Status: Hadir, Izin, Sakit, Alpa.
3. **Input Nilai Akademik**:
   - Filter berdasarkan kelas dan mata pelajaran.
   - Input nilai Formatif, Sumatif, PTS, dan PAS dengan kalkulasi otomatis nilai akhir.
4. **Cetak & Preview Rapor Siswa**:
   - Kalkulasi rekap kehadiran dan rata-rata nilai siswa per semester.
   - Fitur ekspor langsung ke PDF menggunakan `html2pdf.js` dengan layout kop surat resmi.
5. **Dashboard Overview**:
   - Statistik total siswa, mata pelajaran, ringkasan kehadiran hari ini, dan aksi cepat.

---

## 5. Konfigurasi Deployment ke cPanel

File automasi telah diperbarui di [.cpanel.yml](file:///d:/sigap-mjic/.cpanel.yml).

### Komponen Kesiapan Produksi (Sudah Disiapkan):
1. **Entry Point Passenger**: Disediakan file [app.js](file:///d:/sigap-mjic/sigap-backend/app.js) di root `sigap-backend` yang memanggil `dist/server.js` secara otomatis.
2. **Reverse Proxy cPanel**: Baris `app.set('trust proxy', 1)` telah dipasang di [server.ts](file:///d:/sigap-mjic/sigap-backend/src/server.ts) agar rate-limit dan pembacaan IP aman di cPanel.
3. **Apache SPA Routing (.htaccess)**: File `.htaccess` telah ditambahkan di `sigap-frontend/public/` agar routing halaman React tidak error 404 saat direfresh di cPanel.
4. **Build Verification**: TypeScript build frontend & backend telah diuji dan berhasil 100% tanpa error kompilasi.
5. **Template Environment**:
   - Backend: [sigap-backend/.env.example](file:///d:/sigap-mjic/sigap-backend/.env.example) (`DATABASE_URL`, `JWT_SECRET`, `PORT`).
   - Frontend: [sigap-frontend/.env.example](file:///d:/sigap-mjic/sigap-frontend/.env.example) (`VITE_API_URL`).

---

## 6. Panduan Eksekusi Deploy ke cPanel (Step-by-Step)

### A. Di Komputer Lokal (Sebelum Push)
1. Periksa path pada [.cpanel.yml](file:///d:/sigap-mjic/.cpanel.yml) (sesuaikan `CPANEL_USER` misal: `mjir4837`, dan target `FRONTEND_DIR` serta `BACKEND_DIR`).
2. Commit dan Push perubahan ke GitHub:
   ```bash
   git add .
   git commit -m "chore: siapkan konfigurasi build dan deploy production cPanel"
   git push origin main
   ```

### B. Di Akun cPanel (Langkah Pertama Kali Setup)
1. **Buat Database MySQL**:
   - Masuk menu **MySQL Databases** di cPanel.
   - Buat database: misal `mjir4837_sigap_db`.
   - Buat user: misal `mjir4837_sigap_user` dan password-nya.
   - Sambungkan user ke database dengan checklist **ALL PRIVILEGES**.
2. **Setup Node.js App (Passenger)**:
   - Masuk menu **Setup Node.js App** di cPanel.
   - Klik **Create Application**.
   - Node.js version: **v20.x** atau **v22.x**.
   - Application mode: **Production**.
   - Application root: `sigap-backend` (path: `/home/mjir4837/sigap-backend`).
   - Application startup file: `app.js`.
   - Application URL: pilih domain/subdomain untuk API (misal: `api-sigap.mjic.sch.id` atau subdomain terkait).
   - Klik **Create**.
3. **Git Version Control di cPanel**:
   - Buka menu **Git Version Control**.
   - Klik **Create**.
   - Masukkan Clone URL: `https://github.com/HamzahHuzaifah/sigap-mjic.git`.
   - Repository Path: `repositories/sigap-mjic`.
   - Repository Name: `sigap-mjic`.
   - Klik **Create**, lalu buka tab **Manage** -> **Deploy HEAD Commit**.
4. **Konfigurasi .env & Migrasi Database**:
   - Masuk ke **File Manager** cPanel -> buka folder `/home/mjir4837/sigap-backend`.
   - Buat/edit file `.env`, isi:
     ```env
     PORT=3000
     NODE_ENV=production
     DATABASE_URL="mysql://mjir4837_sigap_user:PASSWORD_ANDA@127.0.0.1:3306/mjir4837_sigap_db"
     JWT_SECRET="kunci_rahasia_sigap_mjic_super_aman_2026"
     ```
   - Buka **Terminal cPanel**, masuk ke virtual environment Node.js aplikasi (salin perintah dari bagian atas menu Setup Node.js App), contoh:
     ```bash
     source /home/mjir4837/nodevenv/sigap-backend/20/bin/activate && cd /home/mjir4837/sigap-backend
     npx prisma db push
     npx tsx prisma/seed.ts
     ```
   *(Data tabel dan akun admin default `admin` / `admin123` akan langsung siap digunakan).*
5. **Restart Aplikasi**:
   - Klik tombol **Restart** pada aplikasi di menu *Setup Node.js App*, atau jalankan perintah:
     ```bash
     touch /home/mjir4837/sigap-backend/tmp/restart.txt
     ```
