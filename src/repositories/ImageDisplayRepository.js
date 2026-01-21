import { pb } from "../pocketbase.js";

export async function findAllImages() {
  try {
    // DEBUG: check if superuser is logged in
    console.log("Auth valid:", pb.authStore.isValid); // true if logged in
    console.log("Current user:", pb.authStore.model); // should show superuser data
    console.log("Auth token:", pb.authStore.token); // should be a JWT

    const imageData = await pb.collection("images").getFullList();
    return imageData;
  } catch (err) {
    console.error("Error fetching images:", err);
    return [];
  }
}
