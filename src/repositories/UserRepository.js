import { pb } from "../pocketbase.js";

export const UserRepository = {
  createUser: async (data) => {
    try {
      return await pb.collection("users").create(data);
    } catch (err) {
      console.error("❌ PocketBase createUser failed");
      console.error("Status:", err.status);
      console.error("Message:", err.message);
      console.error("Data:", err.data); // 👈 THIS shows exact field errors
      throw err;
    }
  },
  findUserByEmail: async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const user = await pb
        .collection("users")
        .getFirstListItem(`email = '${normalizedEmail}'`);
      return user;
    } catch (err) {
      return null;
    }
  },
};
