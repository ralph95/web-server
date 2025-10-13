import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import { JWT_SECRET } from "./config.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ----- Middleware -----
app.use(cors());
app.use(express.json());

// ----- REST API Routes -----
app.use("/", authRoutes);

// ----- Create HTTP server & attach Socket.IO -----
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Authenticate each socket connection using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // store user info for later use
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// ----- WebSocket events -----
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.user);

  socket.on("send_message", (msg) => {
    console.log(`Message from ${socket.user.email}:`, msg);

    // broadcast to everyone
    io.emit("receive_message", {
      user: socket.user.email,
      text: msg,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// ----- Start HTTP + WS server -----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
