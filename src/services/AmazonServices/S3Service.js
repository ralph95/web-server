import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/aws.config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getImageUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}
