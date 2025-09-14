import express from "express";
import jwt from "jsonwebtoken";
import { pb } from "../pocketbase.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Authenticate user with PocketBase
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    // Create JWT
    const token = jwt.sign(
      { id: authData.record.id, email: authData.record.email },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.json({ token, user: authData.record });
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, passwordConfirm, name, role } = req.body;

    // Create user in PocketBase "users" collection
    const newUser = await pb.collection("users").create({
      email,
      password,
      passwordConfirm,
      name,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to register user" });
  }
});

// UPDATE USER (self-update only)
router.post("/update", async (req, res) => {
  try {
    const { email, password, passwordConfirm, name, role, currentPassword } =
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
      role,
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
      "sanjikunpunyama@gmail.com",
      "R@fserver2025"
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
