import { getImageUrl } from "../services/s3.service.js";

export async function getImage(req, res) {
  try {
    let imageKey = req.params.imageKey;

    // Ensure it's a string (handle arrays if Express parsed it that way)
    if (Array.isArray(imageKey)) {
      imageKey = imageKey.join("/"); // converts ["img-dsply","aws-cloud.jpg"] → "img-dsply/aws-cloud.jpg"
    } else if (typeof imageKey !== "string") {
      imageKey = String(imageKey); // fallback
    }

    console.log("Fetching S3 key:", imageKey);

    const url = await getImageUrl(imageKey);

    res.redirect(url); // browser redirected to valid signed S3 URL
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Failed to get image");
  }
}
