import { pb } from "../pocketbase.js";

export const RoleRepository = {
  findByName: async (name) => {
    try {
      return await pb.collection("role").getFirstListItem(`name="${name}"`);
    } catch {
      return null;
    }
  },
};
