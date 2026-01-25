import { UserRepository } from "../../repositories/UserRepository.js";
import { sendVerificationEmail } from "../../utils/email.js";
import crypto from "crypto";

export const AuthService = {
  registerUser: async ({ email, password, passwordConfirm, name }) => {
    const normalizedEmail = email.trim().toLowerCase();

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
    });

    await sendVerificationEmail(normalizedEmail, token);

    return newUser;
  },
};
