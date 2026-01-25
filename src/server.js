import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import { JWT_SECRET } from "./config.js";
import imageRoutes from "./routes/ImageDisplayRoutes.js";
import { SetupAuth } from "./auth/AuthSetup.js";

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
    origin: "https://home.philippinesheadline.com",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Fetch Images Display on HomePage
app.use("/images", imageRoutes);

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
    console.log(`📨 Message received:`, msg);

    // Broadcast what the frontend sent
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

// Setup Passport, sessions, GoogleStrategy
SetupAuth(app);

// ----- START GOOGLE LOGIN -----
app.use("/auth", authRoutes);
// app.get(
//   "/auth/google",
//   (req, res, next) => {
//     console.log("🔐 /auth/google HIT");
//     next();
//   },
//   passport.authenticate("google", {
//     scope: ["openid", "email", "profile"], // ✅ REQUIRED
//   }),
// );

// // ----- GOOGLE CALLBACK -----
// app.get(
//   "/auth/google/callback",
//   (req, res, next) => {
//     console.log("🔄 /auth/google/callback HIT");
//     next();
//   },
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     console.log("✅ Google login SUCCESS", req.user);

//     const token = jwt.sign(
//       {
//         id: req.user.id,
//         name: req.user.name,
//         email: req.user.email,
//         photo: req.user.photo,
//       },
//       JWT_SECRET,
//       { expiresIn: "1d" },
//     );

//     console.log("🔑 JWT created, redirecting user");

//     res.redirect(`https://home.philippinesheadline.com/main`);
//   },
// );

// ----- Start HTTP + WS server -----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
