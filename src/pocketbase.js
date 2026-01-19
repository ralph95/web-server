import PocketBase from "pocketbase";
import { POCKETBASE_URL } from "./config.js";
import dotenv from "dotenv";
dotenv.config();

export const pb = new PocketBase(POCKETBASE_URL);

// Server-wide superuser login
export async function loginSuperuser() {
  try {
    console.log("POCKETBASE_URL:", process.env.POCKETBASE_URL);
    console.log("USER_NAME:", process.env.USER_NAME);
    console.log("USER_PASSWORD:", process.env.USER_PASSWORD);
    await pb.admins.authWithPassword(
      process.env.USER_NAME, // 🔑 admin email
      process.env.USER_PASSWORD, // 🔑 admin password
    );
    console.log("PocketBase superuser logged in ✅");
  } catch (err) {
    console.error("Failed to login superuser:", err);
  }
}

// Call once at server startup
loginSuperuser();
