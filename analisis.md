# Analisis Skema Penggunaan Aplikasi Gym

Dokumen ini berisi analisis detail mengenai alur penggunaan fitur-fitur utama dalam aplikasi Gym App beserta snippet sintaks penting yang digunakan dalam implementasinya.

## A. Skema Daftar Akun (Register)

Fitur ini memungkinkan pengguna baru untuk mendaftar ke dalam sistem.

1.  User mengakses halaman `/register`.
2.  User mengisi form: Nama Lengkap, Email, Username, dan Password.
3.  User klik tombol **"Daftar Sekarang"**.
4.  Sistem memproses pendaftaran:
    - Mengubah username menjadi lowercase dan menghapus spasi.
    - Mengecek di Firebase Firestore apakah username sudah ada.
    - Jika belum ada, menyimpan data user baru.
5.  Jika berhasil, user diarahkan ke halaman Login.

**Sintaks Penting (Firebase):**

```typescript
// Cek ketersediaan username
const userRef = doc(db, "users", checkUsername);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  throw new Error("Username sudah digunakan");
}

// Simpan data user baru
await setDoc(userRef, {
  username: checkUsername,
  name: formData.name,
  email: formData.email,
  password: formData.password, // Catatan: Sebaiknya di-hash di production
  createdAt: serverTimestamp(),
  fotoProfil: "...", // URL Avatar Generator
});
```

---

## B. Skema Login

Fitur untuk masuk ke dalam aplikasi bagi pengguna yang sudah terdaftar.

1.  User mengakses halaman `/login`.
2.  User memasukkan Username dan Password.
3.  User klik tombol **"Masuk"**.
4.  Sistem memverifikasi kredensial:
    - Mengambil data user dari Firestore berdasarkan username.
    - Mencocokkan password yang diinput dengan yang ada di database.
5.  Jika valid, `AuthContext` menyimpan sesi user dan redirect ke Dashboard Home.

**Sintaks Penting (Firebase):**

```typescript
// Ambil data user
const userRef = doc(db, "users", checkUsername);
const userSnap = await getDoc(userRef);

// Validasi Password (Sederhana)
if (userData.password !== formData.password) {
  throw new Error("Password salah.");
}
```

---

## C. Skema Masuk Room Chat (Join Room)

Fitur untuk bergabung ke dalam ruang obrolan spesifik.

1.  User mengakses menu **Chat / Room Chat**.
2.  User melihat daftar room aktif atau menginput nomor room baru.
3.  User memasukkan "Nomor Room" (misal: 101) dan klik **"Masuk Room"**.
4.  Sistem menghubungkan user ke Socket.IO room tersebut.
5.  Tampilan berubah menjadi antarmuka chat.

**Sintaks Penting (Socket.IO Client):**

```typescript
// Join Room event
socket.emit("join_room", {
  room: roomNumber,
  username: user.username,
});
```

---

## D. Skema Chat (Kirim & Terima Pesan)

Alur pertukaran pesan real-time dalam room.

1.  User mengetik pesan di kolom input.
2.  User klik tombol **Kirim** (ikon pesawat).
3.  Pesan dikirim ke server via Socket.IO.
4.  Server menyebarkan pesan ke semua member di room yang sama.
5.  Pesan muncul di layar chat user lain secara real-time.

**Sintaks Penting (Socket.IO Client):**

```typescript
// Kirim Pesan
socket.emit("send_message", {
  room: roomNumber,
  username: user.username,
  message: inputText,
  time: new Date().toISOString(),
});

// Terima Pesan
socket.on("receive_message", (message: Message) => {
  setMessages((prev) => [...prev, message]);
});
```

---

## E. Skema List Latihan

Fitur untuk mencari dan melihat daftar latihan.

1.  User mengakses halaman **List Latihan**.
2.  (Opsional) User mengetik kata kunci pencarian (misal: "Push Up").
3.  (Opsional) User memilih filter "Target Otot" (misal: "Chest").
4.  User klik **"Cari"** atau sistem memuat otomatis.
5.  Sistem memanggil Action `getLatihan` yang mengambil data dari API eksternal (ExerciseDB).
6.  Daftar kartu latihan ditampilkan.

**Sintaks Penting (API Fetching):**

```typescript
// Fetch data dari ExerciseDB
export async function getLatihan(query: string, bodyPart: string) {
  // Logic URL building...
  const response = await fetch(url, options);
  const data = await response.json();
  return { success: true, data };
}
```

---

## F. Skema Cek Salah Satu Latihan (Detail Latihan)

Melihat detail instruksi dan video/gambar latihan.

1.  User mengklik salah satu kartu latihan di halaman List Latihan.
2.  Sistem menavigasi ke halaman detail `/latihan/[id]`.
3.  Halaman memuat data detail (instruksi, gif/video, target otot) via API.
4.  Sistem juga mengecek ke Firebase apakah latihan ini ada di daftar **Favorit** user.
5.  User bisa klik tombol **Love/Hati** untuk menambah/menghapus dari favorit.

**Sintaks Penting (Firebase Array Update):**

```typescript
// Tambah ke Favorit
await updateDoc(userRef, {
  favorit_latihan: arrayUnion(idLatihan),
});

// Hapus dari Favorit
await updateDoc(userRef, {
  favorit_latihan: arrayRemove(idLatihan),
});
```

---

## G. Skema Cek Nutrisi

Fitur AI untuk menganalisis kandungan nutrisi makanan.

1.  User mengakses menu **Cek Nutrisi**.
2.  User memasukkan deskripsi makanan (misal: "1 mangkok bakso dan es teh").
3.  User klik **"Cek"**.
4.  Sistem mengirim prompt ke **Gemini API** via server action.
5.  Gemini mengembalikan teks JSON berisi estimasi Kalori, Protein, Lemak, dll.
6.  Hasil ditampilkan dalam bentuk kartu nutrisi visual.

**Sintaks Penting (Gemini AI Integration):**

```typescript
// Server Action: Panggil Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const result = await model.generateContent(prompt);
const text = result.response.text();
// Parse JSON dari response text
```

---

## H. Skema Edit Profil

Fitur untuk mengubah data diri user.

1.  User masuk ke halaman **Profil**.
2.  User klik tombol **"Edit Profil"**.
3.  Modal formulir muncul berisi data saat ini.
4.  User mengubah data (Nama, No HP, Alamat, Tujuan Latihan).
5.  User klik **"Simpan Perubahan"**.
6.  Data di Firestore diperbarui tanpa mengubah status paket.

**Sintaks Penting (Firestore Update):**

```typescript
await updateDoc(doc(db, "users", username), {
  namaLengkap: formData.namaLengkap,
  nomorTelepon: formData.nomorTelepon,
  // ... field lainnya
});
```

---

## I. Skema Pilih Paket (Langganan)

Fitur memilih membership gym.

1.  User masuk ke halaman **Profil**.
2.  User melihat bagian "Pilihan Paket Membership".
3.  User memilih salah satu paket (Basic, Gold, atau VIP) dan klik **"Pilih Paket"**.
4.  Jika data diri belum lengkap, user diminta melengkapi form terlebih dahulu.
5.  User klik **"Simpan & Aktifkan Paket"**.
6.  Sistem membuat `Order ID` baru dan mengupdate status `paketAktif` user di Firestore.

**Sintaks Penting (Logic Pembuatan Order):**

```typescript
const newOrderId = `GYM-${Math.floor(10000 + Math.random() * 90000)}`;
await updateDoc(userRef, {
  paketAktif: selectedPlanId,
  idPesanan: newOrderId,
  paketAktifTanggal: new Date().toISOString(),
});
```

---

## J. Skema Cetak Invoice (Cetak Paket)

Fitur mencetak bukti pembayaran langganan.

1.  User yang memiliki paket aktif masuk ke halaman **Profil**.
2.  User klik tombol **"Lihat Invoice"** pada kartu paket aktif.
3.  Modal Invoice muncul.
4.  User klik tombol **"Cetak PDF"**.
5.  Sistem memanggil fungsi `window.print()`.
6.  CSS `@media print` akan mengatur agar hanya area Invoice yang tercetak di kertas/PDF.

**Sintaks Penting (Browser API):**

```typescript
const cetakStruk = () => {
  document.title = `Invoice_${orderId}`; // Set nama file PDF
  window.print(); // Trigger dialog print browser
};
```

---

## K. Skema Kirim Invoice ke Email

Mengirim detail invoice ke alamat email user.

1.  Di dalam modal Invoice, user klik **"Kirim ke Email"**.
2.  Aplikasi mengirim request POST ke endpoint backend `/send-invoice`.
3.  Backend (presumable Nodemailer) mengirim email ke user.
4.  Sistem menampilkan notifikasi "Email Terkirim".

**Sintaks Penting (Fetch API):**

```typescript
await fetch(`${API_URL}/send-invoice`, {
  method: "POST",
  body: JSON.stringify({
    email: userEmail,
    orderId: currentOrderId,
    // ... data invoice lainnya
  }),
});
```

---

## L. Skema Batalkan Paket

Fitur berhenti berlangganan.

1.  User klik tombol **"Batalkan Langganan"** di kartu paket aktif.
2.  Muncul dialog konfirmasi "Apakah Anda yakin?".
3.  User klik **"Ya, Batalkan"**.
4.  Sistem menghapus data paket (`paketAktif = null`) di Firestore.
5.  Status user kembali menjadi non-member (UI berubah menampilkan pilihan paket lagi).

**Sintaks Penting (Firestore Nullify):**

```typescript
await updateDoc(userRef, {
  paketAktif: null,
  idPesanan: null,
  paketAktifTanggal: null,
});
```

---

## M. Skema Logout

Keluar dari akun.

1.  User klik tombol **"Keluar"** di header halaman Profil.
2.  Dialog konfirmasi muncul.
3.  User klik **"Keluar"**.
4.  Sistem menghapus data sesi dari LocalStorage/Context.
5.  User diarahkan kembali ke halaman Login.

**Sintaks Penting:**

```typescript
// AuthContext logout
const logout = () => {
  setUser(null);
  localStorage.removeItem("gym_user");
  router.push("/login"); // Redirect
};
```

---

## N. Skema Tambah ke Favorit

Fitur untuk menyimpan latihan ke dalam daftar favorit pribadi.

1.  User membuka halaman detail latihan (`/latihan/[id]`).
2.  User mengklik tombol **Hati (Heart Icon)** di pojok kanan atas.
3.  Sistem mengecek status saat ini:
    - Jika belum favorit: Menambahkan ID Latihan ke array `favorit_latihan` di Firestore.
    - Jika sudah favorit: Menghapus ID Latihan dari array `favorit_latihan`.
4.  Ikon hati berubah warna (Merah = Favorit, Abu-abu = Tidak Favorit).
5.  Data tersimpan di profil pengguna.

**Sintaks Penting (Toggle Favorit Firestore):**

```typescript
// Toggle Favorit Logic
const userRef = doc(db, "users", user.username);

if (statusBaru) {
  // Tambah ID ke Array
  await updateDoc(userRef, {
    favorit_latihan: arrayUnion(id),
  });
} else {
  // Hapus ID dari Array
  await updateDoc(userRef, {
    favorit_latihan: arrayRemove(id),
  });
}
```
