// services/image.service.js
import { findAllImages } from "../../repositories/ImageDisplayRepository.js";
import { getImageUrl } from "../AmazonServices/s3.service.js";

export async function getAllImagesWithSignedUrls() {
  // Fetch all images from DB
  const images = await findAllImages();

  if (!images || images.length === 0) {
    throw new Error("No images found in database");
  }

  // Map through each item to generate signed S3 URLs
  const imagesWithUrls = await Promise.all(
    images.map(async (image) => {
      const url = await getImageUrl(image.s3_key);
      return {
        name: image.name,
        s3_key: image.s3_key,
        url, // signed S3 URL
      };
    }),
  );

  return imagesWithUrls;
}
