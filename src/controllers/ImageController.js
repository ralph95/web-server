import { getAllImagesWithSignedUrls } from "../services/sharedModule/ImageDisplayService.js";

export async function getAllImages(req, res) {
  try {
    const images = await getAllImagesWithSignedUrls();
    res.json(images); // Return array of images with signed URLs
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
}
