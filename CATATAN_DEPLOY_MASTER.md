# 📘 MASTER PLAYBOOK: Panduan & Rekomendasi Deployment Web di cPanel
**Berdasarkan Pengalaman Riil Proyek: SPMB, SIKMA, KKN Vidya Vardhana, & SIGAP MJIC**

Dokumen ini adalah ringkasan aturan emas (*Golden Rules*) dan solusi atas seluruh kendala teknis yang pernah kita lewati selama mendeploy aplikasi web Node.js & React ke cPanel shared hosting (CloudLinux / Rumahweb).

---

## 🏛️ 1. Aturan Emas Pemilihan Tech Stack (Database & Library)

### A. Database Driver: Wajib Pure JavaScript
| Driver / ORM | Status di cPanel | Alasan & Catatan |
|---|---|---|
| **`mysql2`** | ✅ **Sangat Direkomendasikan** | 100% JavaScript murni. Sangat cepat, hemat RAM, tidak pernah core-dump (digunakan di SPMB & SIGAP). |
| **`Sequelize`** | ✅ **Direkomendasikan** | ORM berbasis JS murni di atas `mysql2` (digunakan di SIKMA). |
| **`Prisma ORM`** | ❌ **HINDARI di Shared Hosting** | Prisma mengandalkan mesin binary native berbasis bahasa **Rust** (`query-engine`, `schema-engine`). Di CloudLinux shared hosting, binary Rust ini selalu dibunuh paksa oleh kernel (`Aborted core dumped`) karena isolasi memori CageFS. |

### B. Library Native vs Pure JS
* Gunakan **`bcryptjs`** (bukan `bcrypt`), karena `bcrypt` membutuhkan kompilasi C++ (`node-gyp`) yang sering gagal karena batasan akses root di cPanel.

---

## ⚙️ 2. Aturan Kompilasi: Selalu Build di Lokal (Pre-built Deployment)

### Mengapa Server Sering `Aborted (core dumped)` Saat Build?
RAM terminal cPanel dibatasi sangat ketat oleh CloudLinux (biasanya hanya 256MB–512MB). Menjalankan proses berat seperti:
* `npm run build` (TypeScript Compiler `tsc`)
* `vite build`
* `npm install` dengan ratusan paket besar

akan langsung memicu **OOM (Out of Memory) Killer** server.

### Solusi Standar:
1. **Lakukan Build di Laptop Anda:**
   ```bash
   # Di komputer lokal:
   npm run build
   ```
2. **Track Folder `dist` ke Git:**
   Di file `.gitignore`, izinkan folder hasil build ikut terunggah:
   ```gitignore
   !/sigap-backend/dist/
   !/sigap-frontend/dist/
   ```
3. **Server cPanel Hanya Menjalankan JS Murni:**
   Saat di cPanel, server tidak perlu mengompilasi apa pun. Cukup `node app.js` yang hanya butuh RAM ~30MB.

---

## 🌐 3. Arsitektur Hosting: Pola Single-Domain (Paling Praktis)

Ada dua pola yang pernah kita terapkan:

### Pola A: Single-Domain (Seperti SIGAP MJIC - Sangat Direkomendasikan)
Express Backend menyajikan file statis React Frontend sekaligus menyediakan API:
* `https://domain.com/` ➡️ Frontend React Dashboard.
* `https://domain.com/api/*` ➡️ REST API Backend.

**Keuntungan Pola Ini:**
* Tidak butuh subdomain tambahan.
* Bebas dari pusing konfigurasi CORS (Cross-Origin Resource Sharing).
* Token login (JWT / Cookie) berada di domain yang sama.
* Konfigurasi rute di `server.ts` Express:
  ```typescript
  // 1. Sajikan folder frontend
  app.use(express.static(path.resolve(__dirname, '../public')));

  // 2. Fallback SPA untuk Express 5 (Wajib pakai middleware, BUKAN app.get('*'))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.resolve(__dirname, '../public/index.html'));
    }
    next();
  });
  ```

### Pola B: Decoupled / Subdomain (Seperti KKN Vidya Vardhana)
* Frontend statis diletakkan di `public_html/`.
* Backend di subdomain terpisah (`api.domain.com`).
* *Catatan:* Memerlukan pengaturan header CORS (`Access-Control-Allow-Origin`) yang teliti dan konfigurasi `.htaccess` proxy.

---

## 🛠️ 4. Cheat Sheet Mengatasi Error Khas cPanel

### 1. Masalah "Ghost Process" (Proses Hantu / Tampilan Tidak Berubah)
* **Penyebab:** Node.js lama masih aktif di memori server dan menahan kode lama.
* **Solusi Instan:**
  ```bash
  # Bunuh semua proses node milik user Anda
  pkill -9 -u NAMA_USER_CPANEL node
  # Paksa Passenger reload
  touch tmp/restart.txt
  ```

### 2. Error 503 Service Unavailable di Express 5
* **Penyebab:** Di Express 5 (`express@^5.x`), sintaks wildcard `app.get('*')` menyebabkan error fatal `TypeError: Missing parameter name at index 1: *`.
* **Solusi:** Gunakan middleware penangkap `app.use((req, res, next) => ...)` seperti pada poin 3A.

### 3. Masalah Reverse Proxy (Rate Limit / Salah Deteksi IP)
* **Solusi:** Selalu pasang baris ini di file utama Express Anda:
  ```javascript
  app.set('trust proxy', 1);
  ```

### 4. Masalah Folder Permission Rusak (`d?????????`)
* **Penyebab:** Zip yang dibuat dari Windows diekstrak di Linux dengan permission bit hilang.
* **Solusi:**
  ```bash
  chmod -R 755 node_modules
  ```

### 5. Error Pindah Folder di Setup Node.js App (`shutil.Error: Destination path already exists`)
* **Penyebab:** Mengubah kolom *Application root* pada aplikasi yang sudah ada memicu skrip Python cPanel melakukan `shutil.move` yang gagal jika folder tujuan sudah ada isinya.
* **Solusi:** Jangan edit jalur aplikasinya. Cukup klik tombol **Delete (Tempat Sampah)** pada aplikasi lama, lalu klik **Create Application** baru yang langsung mengarah ke folder yang tepat.

---

## 📋 5. Prosedur Standar Update Kode di Masa Depan (Workflow Rutin)

Setiap kali Anda selesai menambah fitur baru di komputer lokal:

1. **Di Komputer Lokal (VS Code):**
   ```bash
   npm run build
   git add .
   git commit -m "feat: deskripsi update"
   git push origin main
   ```
2. **Di Terminal cPanel:**
   ```bash
   cd ~/repositories/NAMA_PROJECT
   git pull origin main
   pkill -9 -u NAMA_USER_CPANEL node
   touch NAMA_FOLDER_BACKEND/tmp/restart.txt
   ```
3. **Di Browser:**
   Buka web lalu tekan **Ctrl + F5** (Hard Refresh).

---

## ⚡ 6. Otomatisasi dengan Script `restart-server.sh`

Di proyek **KKN Vidya Vardhana**, kita menggunakan script `restart-server.sh`. Sekarang, di **SIGAP MJIC**, kita juga sudah menyediakan script `restart-server.sh` serupa!

### Cara Pakai di Terminal cPanel:
```bash
cd ~/repositories/sigap-mjic
bash restart-server.sh
```

### Apa yang Dilakukan Script Ini Secara Otomatis:
1. Menarik commit terbaru dari GitHub (`git fetch` & `git reset --hard origin/main`).
2. Memeriksa keberadaan `node_modules`.
3. Memastikan bundle frontend di `sigap-backend/public/` memiliki izin baca yang tepat (`chmod 755`).
4. Membersihkan zombie process (`pkill -9 -u mjir4837 node`).
5. Memperbarui `tmp/restart.txt` untuk memicu reload Phusion Passenger.
6. Mengetes respons HTTP endpoint API (`https://sigap.mjic.sch.id/api/students`).

