const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const socketIo = require("socket.io");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory storage for rooms and messages
// Structure: { [roomId]: { messages: [], users: [] } }
const rooms = {};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = socketIo(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join Room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Initialize room if not exists
      if (!rooms[roomId]) {
        rooms[roomId] = { messages: [], created_at: new Date() };
      }

      // Send chat history to user
      socket.emit("receive_history", rooms[roomId].messages);
      
      // Broadcast active room list to everyone (so other users see the new room)
      io.emit("active_rooms", getActiveRooms());
    });

    // Send Message
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

      // Broadcast to room
      io.to(roomId).emit("receive_message", message);
    });

    // Request active rooms
    socket.on("get_active_rooms", () => {
       socket.emit("active_rooms", getActiveRooms());
    });
    
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Helper to get active rooms list
  function getActiveRooms() {
    return Object.keys(rooms).map(id => ({
      id,
      roomNumber: id.replace("room-", ""), // Client expects roomNumber
      createdAt: rooms[id].created_at
    })).sort((a, b) => b.createdAt - a.createdAt);
  }

  // Handle all other requests with Next.js
  server.all("*", (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port} (Socket.IO enabled)`);
  });
});
