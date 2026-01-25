import { UserRepository } from "../../repositories/UserRepository.js";
import { RoleRepository } from "../../repositories/RoleRepository.js";
import { sendVerificationEmail } from "../../utils/email.js";
import crypto from "crypto";

export const AuthService = {
  registerUser: async ({ email, password, passwordConfirm, name }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await UserRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error("User already Registered");
    }

    // Setting User Role
    const role = await RoleRepository.findByName("user");
    if (!role) {
      throw new Error("Default role 'user' not found");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await UserRepository.createUser({
      email: normalizedEmail,
      password,
      passwordConfirm,
      name,
      verified: false,
      verificationToken: token,
      verificationExpiry: expiry,
      emailVisibility: true,
      authProvider: "normal",
    });

    await sendVerificationEmail(normalizedEmail, token);

    return newUser;
  },
  registerGoogleUser: async ({ email, name }) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await UserRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return existingUser;
    }

    // Setting User Role
    const role = await RoleRepository.findByName("user");
    if (!role) {
      throw new Error("Default role 'user' not found");
    }

    const randomGooglePassword = crypto.randomBytes(16).toString("hex");

    // Create new Google user
    const newUser = await UserRepository.createUser({
      email: normalizedEmail,
      name,
      password: randomGooglePassword,
      passwordConfirm: randomGooglePassword,
      verified: true,
      authProvider: "google",
      role_id: role.id,
      emailVisibility: true,
    });

    return newUser;
  },
};
