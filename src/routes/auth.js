import express from "express";
import jwt from "jsonwebtoken";
import { pb } from "../pocketbase.js";
import { JWT_SECRET } from "../config.js";
import { AuthController } from "../controllers/AuthController.js";
import passport from "passport";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Authenticate user with PocketBase
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const user = authData.record;

    const expiresIn = rememberMe ? "30d" : "1h";

    // Create JWT
    const token = jwt.sign(
      { id: authData.record.id, email: authData.record.email },
      JWT_SECRET,
      { expiresIn },
    );

    // Send response
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Google Loging
router.get(
  "/google",
  (req, res, next) => {
    console.log("🔐 /auth/google HIT");
    next();
  },
  passport.authenticate("google", {
    scope: ["openid", "email", "profile"],
  }),
);

// Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  },
);

// REGISTER
router.post("/register", AuthController.register);

// ✅ Verify email route (with admin auth)
router.get("/verify", async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ error: "Invalid verification link" });
    }

    // 0️⃣ Authenticate as admin (bypass collection rules)
    try {
      await pb.admins.authWithPassword(
        process.env.USER_NAME, // 🔑 admin email
        process.env.USER_PASSWORD, // 🔑 admin password
      );
    } catch (authErr) {
      console.error("❌ Admin auth failed:", authErr);
      return res.status(500).json({ error: "Admin authentication failed" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user;

    try {
      // 1️⃣ Try to find user by email (admin bypass)
      const result = await pb.collection("users").getList(1, 1, {
        filter: `email = "${normalizedEmail}"`,
      });

      if (result.items.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      user = result.items[0];
    } catch (err) {
      if (err.status === 404) {
        console.log("Looking for:", normalizedEmail);
        return res.status(404).json({ error: "User not found" });
      }
      throw err; // rethrow if it's a different error
    }

    // 2️⃣ Check if already verified
    if (user.verified) {
      return res.status(400).json({ error: "User already verified" });
    }

    // 3️⃣ Validate token + expiry
    if (user.verificationToken !== token) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if (new Date(user.verificationExpiry) < new Date()) {
      return res.status(400).json({ error: "Verification token expired" });
    }

    // 4️⃣ Update user as verified
    const updatedUser = await pb.collection("users").update(user.id, {
      verified: true,
      verificationToken: null,
      verificationExpiry: null,
    });

    // 5️⃣ Success
    return res.json({
      message: "✅ Email verified successfully! You can now log in.",
      user: {
        email: updatedUser.email,
      },
    });
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).json({ error: "Server error during verification" });
  }
});

// UPDATE USER (self-update only)
router.post("/update", async (req, res) => {
  try {
    const { email, password, passwordConfirm, name, currentPassword } =
      req.body;

    // 1. Authenticate the user with their current password
    const authData = await pb
      .collection("users")
      .authWithPassword(email, currentPassword);

    if (!authData || !authData.record) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const userId = authData.record.id;

    // 2. Update this user's own record
    const updatedUser = await pb.collection("users").update(userId, {
      email,
      password,
      passwordConfirm,
      name,
      oldPassword: currentPassword,
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ error: err.message || "Failed to update user" });
  }
});

// GET ALL EMAILS
router.get("/get-all", async (req, res) => {
  try {
    // Authenticate as admin (bypass collection rules)
    await pb.admins.authWithPassword(
      process.env.USER_NAME, // 🔑 admin email
      process.env.USER_PASSWORD, // 🔑 admin password
    );

    // Fetch all users from your "users" collection
    const users = await pb.collection("users").getFullList({
      sort: "-created",
    });

    console.log("Fetched users raw:", JSON.stringify(users, null, 2));

    res.json({ users });
  } catch (err) {
    console.error("Get all emails error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
