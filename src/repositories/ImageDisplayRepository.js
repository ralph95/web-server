import { pb } from "../pocketbase.js";

export async function findAllImages() {
  try {
    const imageData = await pb.collection("images").getFullList();
    return imageData;
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}
