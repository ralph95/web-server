import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import { JWT_SECRET } from "./config.js";
import imageRoutes from "./routes/ImageDisplayRoutes.js";

// ----- OAUTH2 Google -----
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

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

// ----- OAUTH2 events -----
console.log("🚀 OAuth setup starting...");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      sameSite: "none",
    }, // important for HTTPS + Cloudflare
  }),
);

console.log("✅ express-session initialized");

app.use(passport.initialize());
console.log("✅ passport.initialize() loaded");

app.use(passport.session());
console.log("✅ passport.session() loaded");

console.log("🔍 GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log(
  "🔍 GOOGLE_CLIENT_SECRET exists:",
  !!process.env.GOOGLE_CLIENT_SECRET,
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://home.philippinesheadline.com/auth/google/callback",
    },
    (_, __, profile, done) => {
      console.log("Google profile:", profile);
      const userData = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value,
      };
      return done(null, userData);
    },
  ),
);

// ----- Passport session handlers -----
passport.serializeUser((user, done) => {
  console.log("📦 serializeUser called:", user?.id);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("📤 deserializeUser called:", user?.id);
  done(null, user);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
  }),
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.redirect(
      `https://home.philippinesheadline.com/dashboard?token=${token}`,
    );
  },
);

// ----- Start HTTP + WS server -----
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
