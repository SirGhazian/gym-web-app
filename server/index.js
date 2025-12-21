const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

console.log("Starting Server...");

// Safely load dotenv
try {
  const envPath = path.resolve(__dirname, "../.env");
  console.log("Loading .env from:", envPath);
  const dotenvResult = require("dotenv").config({ path: envPath });
  if (dotenvResult.error) {
    console.log("Dotenv warning:", dotenvResult.error.message);
  }
} catch (e) {
  console.error("Dotenv failed:", e);
}

console.log("Current Directory:", process.cwd());
console.log("Has EMAIL_USER?", !!process.env.EMAIL_USER);
console.log("PORT from env:", process.env.PORT);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Pengirim Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ... Endpoint routes ...

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ... socket setup ...

const PORT = process.env.PORT || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Open in browser: http://localhost:${PORT}`);
});
