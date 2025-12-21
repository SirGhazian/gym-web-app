# Gym App 🏋️‍♂️

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Firebase](https://img.shields.io/badge/Firebase-Verified-orange)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-blue)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-cornflowerblue)

**Gym App** adalah aplikasi kebugaran modern dan lengkap yang dirancang untuk membantu pengguna melacak latihan mereka, memantau nutrisi dengan bantuan AI, dan terhubung dengan komunitas melalui real-time chat. Dibangun menggunakan **Next.js** dan diintegrasikan dengan layanan canggih seperti **Firebase**, **ExerciseDB**, dan **Google Gemini**.

## 【 🌟 Fitur Utama 】

### 🔐 Manajemen User (Authentication)

- **Registrasi & Login Aman**: Ditenagai oleh **Firebase Authentication** dan **Firestore**.
- **Manajemen Profil**: Profil pengguna yang dapat dikustomisasi, termasuk tujuan latihan dan data pribadi.

### 💬 Real-Time Community Chat

- **Live Room Chat**: Gabung ke room aktif atau buat room baru untuk chat dengan member gym lain secara instan.
- **Integrasi Socket.IO**: Pengalaman messaging yang _seamless_ dengan latency rendah.
- **List Room Aktif**: Lihat room mana yang sedang ramai sebelum bergabung.

### 🥗 AI-Powered Nutrition Checker

- **Analisis Cerdas**: Cukup ketik apa yang Anda makan (contoh: "1 mangkok bakso dan es teh"), dan AI kami (ditenagai oleh **Google Gemini**) akan menguraikannya.
- **Data Nutrisi Visual**: Dapatkan estimasi instan untuk Kalori, Protein, Lemak, dan Karbohidrat dalam format visual yang bersih.

### 💪 Pustaka Latihan (Exercise Library)

- **Search & Filter**: Cari latihan berdasarkan nama atau bagian tubuh (_Chest_, _Back_, _Legs_, dll).
- **Instruksi Detail**: Akses panduan langkah demi langkah, animasi GIF/Gambar, dan informasi target otot.
- **Favorit**: Simpan latihan andalan Anda untuk akses cepat.
- **Sumber Data**: Data berkualitas tinggi yang diambil dari **ExerciseDB API V2**.

### 💳 Membership & Billing

- **Paket Fleksibel**: Pilih dari opsi membership Basic, Gold, atau VIP.
- **Invoice Generator**: Buat invoice profesional secara otomatis untuk langganan.
- **PDF & Email**: Cetak invoice langsung ke PDF atau kirimkan ke email Anda.

## 【 🛠️ Tech Stack 】

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) (Icons), [Sonner](https://sonner.emilkowal.ski/) (Toasts)
- **Backend / Services**:
  - **Firebase**: Firestore (Database) & Authentication.
  - **Socket.IO**: Server real-time untuk fungsionalitas chat.
  - **Google Gemini API**: Generative AI untuk analisis nutrisi.
  - **ExerciseDB API**: API eksternal untuk data latihan.
- **Deployment Targets**:
  - Frontend: Vercel
  - Socket Server: Railway

## 【 🚀 Panduan Instalasi (Getting Started) 】

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal (_local environment_).

### Prasyarat (Prerequisites)

- **Node.js** (v18 atau lebih baru direkomendasikan)
- **npm** atau **yarn**
- Sebuah **Firebase Project**
- Akses **ExerciseDB API** (jika diperlukan/dikonfigurasi)
- **Google Cloud Project** dengan **Gemini API** yang aktif

### Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/username-anda/gym-app.git
   cd gym-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di direktori root dan tambahkan key berikut:

   ```env
   # Konfigurasi Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=api_key_firebase_anda
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project_anda.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=id_project_anda
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project_anda.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
   NEXT_PUBLIC_FIREBASE_APP_ID=app_id_anda

   # URL Socket.IO Server (Lokal atau Production)
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

   # Google Gemini API Key (untuk AI Nutrisi)
   GEMINI_API_KEY=api_key_gemini_anda
   ```

4. **Jalankan Development Server**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

5. **Jalankan Backend Server (untuk Chat & Email)**
   Aplikasi ini menggunakan server Node.js terpisah untuk real-time chat (Socket.IO) dan pengiriman email (Nodemailer).

   ```bash
   cd server
   npm install
   node index.js
   ```

   Server akan berjalan di port **3001**.

## 【 📂 Struktur Proyek 】

Sekilas mengenai file dan direktori tingkat atas:

```
.
├── src/
│   ├── app/              # Next.js App Router pages & layouts
│   ├── components/       # UI components yang reusable
│   ├── lib/              # Utility functions (Firebase init, helpers)
│   ├── actions/          # Server Actions (Logic untuk Exercise & Nutrition)
│   └── context/          # React Context (AuthContext, dll.)
├── public/               # Static assets
├── server/               # Backend server code (Socket.IO & Nodemailer)
│   └── index.js          # Entry point untuk backend server
├── next.config.ts        # Konfigurasi Next.js
├── package.json          # Dependencies proyek utama
└── README.md             # Dokumentasi proyek
```

## 【 🤝 Kontribusi 】

Kontribusi sangat diterima! Jangan ragu untuk mengirimkan Pull Request.

1. Fork proyek ini
2. Buat feature branch Anda (`git checkout -b feature/FiturKeren`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan FiturKeren'`)
4. Push ke branch (`git push origin feature/FiturKeren`)
5. Buka Pull Request

## 【 Informasi Dosen 】

<img align="left" width="160" src="https://github.com/SirGhazian/praktikum-struktur-data-UNP/assets/142916107/58bffcd0-9983-4a84-9fc6-857c625cb609">

**Randi Proska Sandra, S.Pd, M.Sc** </br>
`Lecturer in Informatics` </br></br>
Randi completed his graduate degree at the Graduate Institute of Network Learning Technology, National Central University, Taiwan. He is a lecturer in the Informatics Bachelor Program at Universitas Negeri Padang, with interests in learning analytics, UI/UX design, software engineering project management, AI-supported educational technologies, and educational data mining. He has training from Microsoft, INTEL, AWS, and the Python Institute, and is a Google Certified Educator and Adobe Creative Educator.

## 【 Informasi Developer 】

Aplikasi Web ini dibuat oleh 2 mahasiswa UNP dalam rangka pemenuhan tugas akhir mata kuliah Praktikum Pemrograman Jaringan.

- Muhammad Ghazian Tsaqif Zhafiri Andoz (23343057)
- Ridho Hamdani Putra (23343052)
