# pErC LMS Design System

Dokumen ini menjelaskan sistem desain dan identitas visual yang digunakan pada platform **pErC LMS (Percik Lab)**. Desain ini mengusung tema modern, premium, dan interaktif dengan pendekatan **Glassmorphism**.

## 🎨 Identitas Visual & Tema
Platform ini menggunakan pendekatan desain **Glassmorphic** yang memberikan kesan kedalaman, transparansi, dan kemewahan.

- **Karakter Utama**: Modern, Clean, Premium, Responsive.
- **Efek Utama**: Backdrop blur, border semi-transparan, bayangan lembut (soft shadows), dan animasi mikro.
- **Mode Tampilan**: Mendukung sepenuhnya **Light Mode** dan **Dark Mode** secara otomatis.

---

## 🌈 Sistem Warna (Color Palette)

Platform ini menggunakan sistem **Dynamic Accent Color** yang memungkinkan seluruh antarmuka berubah warna berdasarkan preferensi pengguna atau peran (Role).

### 1. Warna Dasar
| Nama | Light Mode | Dark Mode | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Background** | `#fdfdfd` | `#09090b` | Warna latar belakang utama. |
| **Foreground** | `#0f172a` | `#fafafa` | Warna teks utama. |
| **Primary** | `#3b82f6` (Blue) | `#60a5fa` | Warna brand default. |
| **Accent** | `#8b5cf6` (Purple) | `#a78bfa` | Warna penekanan kedua. |

### 2. Sistem Aksen Dinamis (HSL)
Warna aksen dikontrol melalui variabel HSL untuk fleksibilitas:
- `--accent-h`: Hue (Default: 217)
- `--accent-s`: Saturation (Default: 91%)
- `--accent-l`: Lightness (Default: 60%)

---

## Typography
Menggunakan font keluarga **Geist** dari Google Fonts untuk tampilan yang tajam dan teknis.
- **Sans-serif**: `Geist Sans` - Digunakan untuk teks umum, menu, dan konten.
- **Monospace**: `Geist Mono` - Digunakan untuk data teknis, kode, atau elemen detail.

---

## 🧊 Komponen UI (Glassmorphism)

### 1. Glass Panel (`.glass-panel`)
Elemen dasar untuk kartu dan sidebar.
- **Background**: `rgba(255, 255, 255, 0.7)` (Light) / `rgba(24, 24, 27, 0.6)` (Dark).
- **Blur**: `backdrop-filter: blur(16px)`.
- **Border**: `1px solid rgba(255, 255, 255, 0.3)`.

### 2. Stat Card
Kartu informasi di dasbor dengan efek visual tambahan:
- **Glow Effect**: Cahaya melingkar di sudut yang berubah saat hover.
- **Micro-rotation**: Ikon berputar sedikit saat hover untuk kesan hidup.

### 3. Sidebar & Header
- **Sidebar**: Model mengambang (floating) dengan fitur *collapsible*.
- **Navigation**: Menggunakan efek `hover-lift` dan bayangan lembut pada item aktif.

---

## ✨ Animasi & Interaksi

Platform ini menggunakan animasi halus untuk meningkatkan pengalaman pengguna:
- **Hover Lift (`.hover-lift`)**: Efek elemen terangkat sedikit ke atas saat kursor diarahkan.
- **Floating Animation (`.animate-float`)**: Animasi melayang naik-turun secara halus untuk elemen ilustratif.
- **Transitions**: Semua perubahan warna dan tema menggunakan transisi berdurasi `300ms`.

---

## 📱 Responsivitas
Desain dioptimalkan untuk berbagai perangkat:
- **Desktop**: Sidebar tetap di samping dengan margin.
- **Tablet/Mobile**: Sidebar berubah menjadi *overlay drawer* yang dapat dibuka/tutup melalui tombol menu di Header.

---
*Dokumen ini dibuat secara otomatis sebagai referensi desain sistem pErC LMS.*
