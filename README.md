# Perciklab — Platform Pembelajaran Digital

> Platform LMS (Learning Management System) berbasis web untuk **SMK Perguruan Cikini Jakarta**, dibangun dengan Next.js 15, Prisma ORM, dan MySQL.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Panduan Instalasi & Development](#panduan-instalasi--development)
- [Variabel Lingkungan (.env)](#variabel-lingkungan-env)
- [Dokumentasi API](#dokumentasi-api)
- [Panduan Pengeditan](#panduan-pengeditan)
- [Panduan Deploy ke Server](#panduan-deploy-ke-server)
- [Konvensi Git Commit](#konvensi-git-commit)

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎓 **Multi-Role** | Siswa, Guru, dan Admin dengan hak akses berbeda |
| 📚 **Manajemen Kursus** | Guru membuat kursus, materi (lesson), tugas, dan quiz |
| 📅 **Modul Minggu** | Konten dikelompokkan per modul minggu |
| 📝 **Quiz Interaktif** | Multiple Choice, Essay, Short Answer dengan penilaian otomatis |
| 📊 **Penilaian** | Guru memberi nilai tugas essay/short answer secara manual |
| 📆 **Jadwal** | Jadwal kelas per hari dengan tampilan harian/mingguan |
| 🔐 **MFA Authenticator** | TOTP 2FA dengan Google Authenticator / Authy |
| 🎨 **Tema & Warna** | Dark/Light mode + kustomisasi warna aksen |
| 🔔 **Notifikasi** | Feed aktivitas terbaru (tugas baru, nilai masuk, quiz) |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS v4 + Vanilla CSS (Glass Morphism) |
| **ORM** | [Prisma v5](https://www.prisma.io/) |
| **Database** | MySQL 8+ |
| **Auth** | [NextAuth.js v4](https://next-auth.js.org/) (Credentials + JWT) |
| **MFA** | [otpauth](https://www.npmjs.com/package/otpauth) (TOTP) + [qrcode](https://www.npmjs.com/package/qrcode) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | Geist Sans / Geist Mono (Next.js built-in) |

---

## Struktur Proyek

```
src/
├── app/
│   ├── (auth)/               # Halaman autentikasi (login, verify-mfa)
│   ├── admin/                # Halaman admin (user management, courses)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/ # NextAuth handler
│   │   │   └── verify-mfa/   # API endpoint verifikasi TOTP
│   │   └── ...
│   ├── assignments/          # Halaman daftar tugas (siswa)
│   ├── courses/
│   │   └── [id]/             # Detail kursus (siswa): Materi, Tugas, Quiz, Nilai
│   ├── grades/               # Halaman nilai (siswa)
│   ├── notifications/        # Feed notifikasi aktivitas
│   ├── schedule/             # Jadwal kelas
│   ├── settings/             # Pengaturan akun (profil, tampilan, notif, keamanan/MFA)
│   └── teacher/
│       └── courses/[id]/     # Detail kursus (guru): Materi, Tugas, Quiz, Jadwal, Peserta
├── actions/                  # Server Actions (Next.js)
│   ├── assignment.ts         # CRUD tugas + submit + grade
│   ├── enrollment.ts         # Enroll/unenroll kursus
│   ├── lesson.ts             # CRUD materi (lesson)
│   ├── mfa.ts                # Setup/verify/disable TOTP MFA
│   ├── quiz.ts               # CRUD quiz + soal + attempt
│   ├── schedule.ts           # CRUD jadwal
│   ├── user.ts               # Update profil & password
│   └── weekModule.ts         # CRUD modul minggu
├── components/
│   ├── dashboards/           # Dashboard per role (Student, Teacher, Admin)
│   ├── AccentProvider.tsx    # Context untuk warna aksen dinamis
│   ├── Header.tsx            # Header dengan search, notif, profil
│   ├── LayoutWrapper.tsx     # Wrapper layout (sidebar + main)
│   ├── MfaSection.tsx        # Komponen setup/disable MFA di settings
│   ├── Sidebar.tsx           # Sidebar navigasi
│   ├── StatCard.tsx          # Kartu statistik di dashboard
│   └── ThemeToggle.tsx       # Toggle dark/light mode
├── lib/
│   └── prisma.ts             # Prisma client singleton
├── middleware.ts             # Auth + MFA redirect middleware
prisma/
├── schema.prisma             # Definisi schema database
├── migrations/               # File SQL migrasi database
└── seed.ts                   # Script seeding data awal
```

---

## Panduan Instalasi & Development

### Prasyarat

- Node.js **v18+**
- MySQL **8+** (atau MariaDB 10.5+)
- Git

### 1. Clone repo

```bash
git clone https://github.com/hbbidev/IAE.git
cd IAE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi environment

Salin file contoh dan isi nilainya:

```bash
cp .env.example .env
```

Edit `.env` — lihat bagian [Variabel Lingkungan](#variabel-lingkungan-env).

### 4. Setup database

```bash
# Jalankan semua migrasi
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# (Opsional) Seed data awal
npx prisma db seed
```

### 5. Jalankan development server

```bash
npm run dev
```

Akses di: [http://localhost:3000](http://localhost:3000)

> ⚠️ **Penting**: Jika menambah/mengubah kolom di `schema.prisma`, selalu jalankan `npx prisma generate` setelah `migrate` dan **setelah mematikan dev server** agar tidak terjadi EPERM error di Windows.

---

## Variabel Lingkungan (.env)

```env
# URL koneksi database MySQL
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/lms_db"

# Secret untuk enkripsi JWT session NextAuth
# Generate dengan: openssl rand -base64 32
NEXTAUTH_SECRET="your_secret_here"

# URL publik aplikasi (tanpa trailing slash)
NEXTAUTH_URL="http://localhost:3000"
```

Untuk **production**, ubah `NEXTAUTH_URL` ke domain publik:
```env
NEXTAUTH_URL="https://perciklab.yourdomain.com"
```

---

## Dokumentasi API

Semua endpoint berada di `/api/`. Autentikasi menggunakan **session cookie** NextAuth.

### Auth

| Metode | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/signin` | Login (NextAuth handler) |
| `POST` | `/api/auth/signout` | Logout |
| `GET`  | `/api/auth/session` | Ambil data session aktif |
| `POST` | `/api/auth/verify-mfa` | Verifikasi kode TOTP MFA saat login |

#### `POST /api/auth/verify-mfa`

**Request Body:**
```json
{ "code": "123456" }
```

**Response (sukses):**
```json
{ "success": true }
```

**Response (gagal):**
```json
{ "error": "Kode salah. Coba lagi." }
```

**Status:** `400` jika kode salah, `401` jika tidak terautentikasi.

---

### Server Actions (Next.js)

Selain REST API, sebagian besar mutasi data dilakukan via **Next.js Server Actions** di folder `src/actions/`. Dipanggil langsung dari komponen client/server.

#### MFA Actions (`src/actions/mfa.ts`)

| Action | Deskripsi |
|--------|-----------|
| `generateTotpSetup()` | Buat secret TOTP baru, simpan ke DB, return URI untuk QR Code |
| `verifyAndEnableTotp(code)` | Verifikasi kode → aktifkan MFA di akun |
| `disableTotp(code)` | Verifikasi kode → nonaktifkan MFA |
| `getMfaStatus()` | Cek apakah MFA aktif untuk user saat ini |

#### Assignment Actions (`src/actions/assignment.ts`)

| Action | Deskripsi |
|--------|-----------|
| `createAssignment(data)` | Buat tugas baru di kursus |
| `updateAssignment(id, data)` | Update tugas |
| `deleteAssignment(id)` | Hapus tugas |
| `submitAssignment(assignmentId, content)` | Siswa mengumpulkan tugas |
| `gradeSubmission(submissionId, score, feedback)` | Guru memberi nilai |

#### Quiz Actions (`src/actions/quiz.ts`)

| Action | Deskripsi |
|--------|-----------|
| `createQuiz(data)` | Buat quiz baru |
| `addQuestion(quizId, data)` | Tambah soal ke quiz |
| `deleteQuestion(id)` | Hapus soal |
| `publishQuiz(id)` | Publikasikan quiz (terlihat oleh siswa) |
| `submitQuizAttempt(quizId, answers)` | Siswa submit jawaban quiz |

#### Week Module Actions (`src/actions/weekModule.ts`)

| Action | Deskripsi |
|--------|-----------|
| `createWeekModule(courseId, data)` | Buat modul minggu baru |
| `deleteWeekModule(id, courseId)` | Hapus modul minggu |

---

## Panduan Pengeditan

### Menambah Halaman Baru

1. Buat file `src/app/[nama-halaman]/page.tsx`
2. Tambahkan route ke middleware (`src/middleware.ts`) jika perlu proteksi:
   ```ts
   matcher: ["/nama-halaman/:path*"]
   ```
3. Tambahkan link ke Sidebar (`src/components/Sidebar.tsx`) jika perlu navigasi.

### Menambah Kolom ke Database

1. Edit `prisma/schema.prisma`
2. **Hentikan dev server**
3. Jalankan:
   ```bash
   npx prisma migrate dev --name nama_perubahan
   # atau di production:
   npx prisma migrate deploy
   ```
4. Jalankan ulang prisma generate jika perlu:
   ```bash
   npx prisma generate
   ```
5. Restart dev server

### Menambah Server Action

1. Buat/edit file di `src/actions/nama.ts`
2. Tambahkan directive `"use server";` di baris pertama
3. Semua fungsi di file tersebut otomatis menjadi server action
4. Panggil dari komponen client dengan `import { namaFungsi } from "@/actions/nama"`

### Mengubah Tema & Warna

- **Warna aksen**: diatur via CSS variables `--accent-h`, `--accent-s`, `--accent-l` di `AccentProvider.tsx`
- **Preset warna**: tambahkan entry ke array `ACCENT_PRESETS` di `src/components/AccentProvider.tsx`
- **Shadow global**: edit nilai di `src/app/globals.css` pada blok `@theme`
- **Dark/Light mode**: via `next-themes` — gunakan class `dark:` di Tailwind

### Role & Hak Akses

Role tersedia: `STUDENT`, `TEACHER`, `ADMIN`

- Middleware di `src/middleware.ts` hanya mengecek **apakah sudah login**
- Pengecekan role dilakukan di level **page/action** masing-masing:
  ```ts
  const session = await getServerSession(authOptions);
  if ((session.user as any).role !== 'TEACHER') redirect('/');
  ```

---

## Panduan Deploy ke Server

### Opsi 1: VPS / Server Bare Metal (Recommended)

#### Prasyarat Server
- Ubuntu 22.04 LTS
- Node.js 20 LTS
- MySQL 8
- Nginx (reverse proxy)
- PM2 (process manager)

#### Langkah Deploy

**1. Clone & install di server:**
```bash
git clone https://github.com/hbbidev/IAE.git /var/www/perciklab
cd /var/www/perciklab
npm ci --production=false
```

**2. Konfigurasi environment:**
```bash
cp .env.example .env
nano .env
# Isi DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

**3. Setup database:**
```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed   # jika perlu data awal
```

**4. Build aplikasi:**
```bash
npm run build
```

**5. Jalankan dengan PM2:**
```bash
npm install -g pm2
pm2 start npm --name "perciklab" -- start
pm2 save
pm2 startup   # agar auto-start saat reboot
```

**6. Konfigurasi Nginx:**
```nginx
server {
    server_name perciklab.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**7. SSL dengan Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d perciklab.yourdomain.com
```

#### Update Aplikasi (Rolling Deploy)
```bash
cd /var/www/perciklab
git pull origin main
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart perciklab
```

---

### Opsi 2: Deploy ke Vercel

> Cocok untuk demo/staging. Database MySQL harus accessible dari internet (gunakan PlanetScale, TiDB Cloud, atau MySQL di VPS dengan port terbuka).

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set environment variables di dashboard Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → URL Vercel deployment
4. Deploy otomatis setiap push ke `main`

---

### Opsi 3: Docker (Self-hosted)

Buat `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

Buat `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:password@db:3306/lms_db
      NEXTAUTH_SECRET: your_secret
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: lms_db
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Jalankan:
```bash
docker compose up -d
docker compose exec app npx prisma migrate deploy
```

---

## Konvensi Git Commit

Proyek ini menggunakan **Conventional Commits**:

| Prefix | Kapan digunakan |
|--------|----------------|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `docs:` | Perubahan dokumentasi |
| `style:` | Perubahan formatting/CSS (tanpa ubah logic) |
| `refactor:` | Refaktor kode (tanpa fitur baru) |
| `test:` | Menambah/mengubah testing |
| `chore:` | Hal kecil (config, dependencies, dll) |

**Contoh:**
```bash
git commit -m "feat: add weekly module grouping to student dashboard"
git commit -m "fix: prisma client not updated after migration"
git commit -m "style: reduce shadow thickness on glass panels"
```

---

## Lisensi

MIT License — © 2025 SMK Perguruan Cikini Jakarta
