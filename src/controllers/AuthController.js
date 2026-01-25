import { AuthService } from "../services/auth/AuthService.js";

export const AuthController = {
  register: async (req, res) => {
    try {
      const user = await AuthService.registerUser(req.body);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (err) {
      res.status(400).json({ error: err.message || "Failed to register user" });
    }
  },
};
