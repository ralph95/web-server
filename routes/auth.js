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
    const { email, password, passwordConfirm, name } = req.body;

    // Create user in PocketBase "users" collection
    const newUser = await pb.collection("users").create({
      email,
      password,
      passwordConfirm,
      name, // optional field if your "users" collection has "name"
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

export default router;
