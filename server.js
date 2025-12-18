const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIo = require("socket.io");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Inisialisasi Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Penyimpanan memori untuk room dan pesan
// Struktur: { [roomId]: { messages: [], users: [] } }
const rooms = {};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = socketIo(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Gabung Room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Inisialisasi room jika belum ada
      if (!rooms[roomId]) {
        rooms[roomId] = { messages: [], created_at: new Date() };
      }

      // Kirim riwayat chat ke user
      socket.emit("receive_history", rooms[roomId].messages);

      // Broadcast daftar room aktif ke semua (agar user lain melihat room baru)
      io.emit("active_rooms", getActiveRooms());
    });

    // Kirim Pesan
    socket.on("send_message", (data) => {
      const { roomId, text, userId } = data;

      if (!rooms[roomId]) {
        rooms[roomId] = { messages: [], created_at: new Date() };
      }

      const message = {
        id: Date.now().toString(),
        text,
        userId,
        createdAt: new Date(),
      };

      rooms[roomId].messages.push(message);

      // Broadcast ke room
      io.to(roomId).emit("receive_message", message);
    });

    // Permintaan room aktif
    socket.on("get_active_rooms", () => {
      socket.emit("active_rooms", getActiveRooms());
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Helper untuk mendapatkan daftar room aktif
  function getActiveRooms() {
    return Object.keys(rooms)
      .map((id) => ({
        id,
        roomNumber: id.replace("room-", ""), // Client expects roomNumber
        createdAt: rooms[id].created_at,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Tangani semua request lain dengan Next.js
  server.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port} (Socket.IO enabled)`);
  });
});
