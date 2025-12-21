const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // izinkan semua origin untuk kemudahan, batasi di produksi
    methods: ["GET", "POST"],
  },
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

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
