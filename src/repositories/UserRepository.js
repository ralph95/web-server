import { pb } from "../pocketbase.js";

export const UserRepository = {
  createUser: async (data) => await pb.collection("users").create(data),
  findUserByEmail: async (email) => {
    try {
      return await pb.collection("users").getFirstListItem(`email="${email}"`);
    } catch {
      return null;
    }
  },
};
