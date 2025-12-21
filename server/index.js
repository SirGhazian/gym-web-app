const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");
const dotenvResult = require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

if (dotenvResult.error) {
  console.error("Dotenv Error:", dotenvResult.error);
}

console.log("Current Directory:", process.cwd());
console.log("Env File Path:", path.resolve(__dirname, "../.env"));
console.log(
  "Loaded Env Keys:",
  Object.keys(process.env).filter((key) => !key.startsWith("npm_") && !key.startsWith("Program"))
);
console.log("Has EMAIL_USER?", !!process.env.EMAIL_USER);
console.log("Has EMAIL_PASS?", !!process.env.EMAIL_PASS);

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // izinkan semua origin untuk kemudahan, batasi di produksi
    methods: ["GET", "POST"],
  },
});

// Pengirim Email (Konfigurasi di file .env Anda)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint untuk mengirim email invoice
app.post("/send-invoice", async (req, res) => {
  console.log("------------------------------------------");
  console.log("Menerima permintaan /send-invoice");

  const { email, name, packageName, price, date, orderId } = req.body;
  console.log("Payload:", { email, name, packageName, price, date, orderId });

  // Cek Variabel Lingkungan
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("ERROR: EMAIL_USER atau EMAIL_PASS tidak diset di file .env.");
    return res.status(500).json({
      error: "Kesalahan konfigurasi server: Kredensial email hilang.",
      details: "Silakan periksa file .env di direktori server.",
    });
  }
  console.log("Menggunakan Email User:", process.env.EMAIL_USER);

  if (!email || !name) {
    console.error("ERROR: Email atau nama hilang dalam permintaan.");
    return res.status(400).json({ error: "Email dan Nama wajib diisi" });
  }

  // Gaya & Konten Email HTML
  const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { background-color: #000000; color: #ccff00; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
                .content { padding: 40px; }
                .intro { text-align: center; margin-bottom: 30px; color: #666; font-size: 14px; }
                .badge { background-color: #ecfccb; color: #3f6212; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; display: inline-block; letter-spacing: 1px; }
                .details-grid { width: 100%; border-collapse: separate; border-spacing: 0 12px; margin-bottom: 30px; }
                .details-grid td { vertical-align: bottom; }
                .label { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; width: 40%; }
                .value { color: #000; font-weight: 600; text-align: right; }
                .highlight { color: #4d7c0f; }
                .total-section { background-color: #18181b; color: #ffffff; padding: 25px; border-radius: 8px; margin-top: 25px; }
                .total-label { font-size: 15px; color: #d4d4d8; font-weight: 500; }
                .total-price { font-size: 28px; font-weight: 800; color: #ccff00; margin: 0; letter-spacing: -0.5px; }
                .footer { background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
                .divider { height: 1px; background-color: #e4e4e7; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Gym Invoice</h1>
                </div>
                <div class="content">
                    <p class="intro">Terima kasih atas pembayaran Anda.<br>Berikut adalah detail layanan membership Anda.</p>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <span class="badge">✓ LUNAS</span>
                    </div>

                    <table class="details-grid">
                        <tr>
                            <td class="label">Order ID</td>
                            <td class="value" style="font-family: monospace; letter-spacing: 1px;">${orderId}</td>
                        </tr>
                         <tr>
                            <td colspan="2"><div style="height: 1px; background-color: #f0f0f0;"></div></td>
                        </tr>
                        <tr>
                            <td class="label">Nama Member</td>
                            <td class="value">${name}</td>
                        </tr>
                         <tr>
                            <td colspan="2"><div style="height: 1px; background-color: #f0f0f0;"></div></td>
                        </tr>
                        <tr>
                            <td class="label">Paket</td>
                            <td class="value highlight">${packageName}</td>
                        </tr>
                         <tr>
                            <td colspan="2"><div style="height: 1px; background-color: #f0f0f0;"></div></td>
                        </tr>
                        <tr>
                            <td class="label">Tanggal</td>
                            <td class="value">${date}</td>
                        </tr>
                    </table>

                     <!-- Bagian Total menggunakan Tabel untuk perataan yang lebih baik -->
                     <table width="100%" class="total-section" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="left" class="total-label">Total Pembayaran</td>
                            <td align="right" class="total-price">${price}</td>
                        </tr>
                    </table>
                </div>
                <div class="footer">
                    <p>Ini adalah email otomatis. Mohon tidak membalas email ini.</p>
                    <p>&copy; ${new Date().getFullYear()} Gym App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

  try {
    console.log("Mencoba mengirim email...");
    const info = await transporter.sendMail({
      from: `"Gym App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice Pembayaran - ${packageName}`,
      html: htmlContent,
    });
    console.log(`Email berhasil dikirim ke ${email}. MessageID: ${info.messageId}`);
    res.json({ success: true, message: "Email berhasil dikirim" });
  } catch (error) {
    console.error("Nodemailer Gagal Mengirim:", error);
    res.status(500).json({
      error: "Gagal mengirim email",
      details: error.message,
      code: error.code,
    });
  }
});

// penyimpanan data di memori (reset saat server restart)
let activeRooms = new Set();
// map untuk menyimpan pesan setiap room: roomId -> [Message]
let roomMessages = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // user bergabung ke room
  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);
    console.log(`User ${username} joined room: ${room}`);

    // tambahkan ke room aktif
    if (!activeRooms.has(room)) {
      activeRooms.add(room);
      // inisialisasi pesan untuk room baru
      if (!roomMessages.has(room)) {
        roomMessages.set(room, []);
      }
    }

    // kirim daftar room aktif yang diperbarui ke semua orang
    // broadcast 'active_rooms' ke semua yang terhubung
    io.emit(
      "active_rooms",
      Array.from(activeRooms).map((r) => ({ roomNumber: r, id: r }))
    );

    // kirim pesan yang ada ke user yang baru bergabung
    const messages = roomMessages.get(room) || [];
    socket.emit("receive_history", messages);
  });

  // user mengirim pesan
  socket.on("send_message", (data) => {
    // data: { room, author, message, time }
    const { room, author, message, time, username } = data;

    const messageData = {
      id: Date.now().toString(), // id sederhana
      text: message,
      userId: username, // menggunakan username sebagai userId
      authorName: author,
      createdAt: time,
    };

    // simpan pesan
    if (roomMessages.has(room)) {
      roomMessages.get(room).push(messageData);
    } else {
      roomMessages.set(room, [messageData]);
    }

    // broadcast ke room
    io.to(room).emit("receive_message", messageData);
  });

  // dapatkan room aktif (untuk lobi)
  socket.on("get_active_rooms", () => {
    socket.emit(
      "active_rooms",
      Array.from(activeRooms).map((r) => ({ roomNumber: r, id: r }))
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
