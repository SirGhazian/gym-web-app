const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

console.log("Starting Chat Server...");

// Safely load dotenv if not in production
if (process.env.NODE_ENV !== "production") {
  try {
    const envPath = path.resolve(__dirname, "../.env");
    const dotenvResult = require("dotenv").config({ path: envPath });
    if (dotenvResult.error) {
      console.log("Info: .env not loaded (normal for production)");
    } else {
      console.log("Loaded .env from:", envPath);
    }
  } catch (e) {
    console.log("Dotenv skipped.");
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Simple health check endpoint
app.get("/", (req, res) => {
  res.send("Gym Chat Server is Running!");
});

const io = new Server(server, {
  cors: {
    origin: "*",
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
    // data: { room, author, message, time, username, authorPhoto }
    const { room, author, message, time, username, authorPhoto } = data;

    const messageData = {
      id: Date.now().toString(),
      text: message,
      userId: username,
      authorName: author,
      authorPhoto: authorPhoto,
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

// Bind to 0.0.0.0 for Railway support
server.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
