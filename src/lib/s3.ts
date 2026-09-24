import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

// DigitalOcean Spaces Storage Configuration
const S3_ENDPOINT = process.env.SPACES_ENDPOINT || process.env.S3_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
const S3_REGION = process.env.SPACES_REGION || process.env.S3_REGION || "nyc3";
export const S3_BUCKET = process.env.SPACES_BUCKET || process.env.S3_BUCKET || "rep1";
export const S3_PUBLIC_BASE_URL =
  process.env.SPACES_PUBLIC_URL ||
  process.env.S3_PUBLIC_BASE_URL ||
  `https://${S3_BUCKET}.nyc3.digitaloceanspaces.com`;

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.SPACES_KEY || process.env.AWS_ACCESS_KEY_ID || "mock_spaces_key",
    secretAccessKey: process.env.SPACES_SECRET || process.env.AWS_SECRET_ACCESS_KEY || "mock_spaces_secret",
  },
  forcePathStyle: false, // DigitalOcean Spaces uses virtual-hosted style (rep1.nyc3.digitaloceanspaces.com)
});

/**
 * Returns the public CDN / direct URL for a key in DigitalOcean Spaces.
 */
export function getPublicS3Url(s3Key: string): string {
  const cleanKey = s3Key.startsWith("/") ? s3Key.substring(1) : s3Key;
  return `${S3_PUBLIC_BASE_URL}/${cleanKey}`;
}

/**
 * Uploads a Buffer directly to DigitalOcean Spaces / S3 and returns the public URL.
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  s3Key: string,
  contentType: string = "application/octet-stream",
  isPublic: boolean = true
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ACL: isPublic ? "public-read" : undefined,
    });

    await s3Client.send(command);
    return getPublicS3Url(s3Key);
  } catch (err) {
    console.error("S3/Spaces Upload Error:", err);
    // Return direct DigitalOcean Spaces URL fallback
    return getPublicS3Url(s3Key);
  }
}

/**
 * Uploads a readable stream (or Buffer) to DigitalOcean Spaces / S3 path without buffering large files in memory.
 */
export async function uploadStreamToS3(
  body: Readable | Buffer | Uint8Array,
  s3Key: string,
  contentType: string = "video/mp4"
): Promise<{ bucket: string; key: string; url: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: body as any,
      ContentType: contentType,
      ACL: "public-read",
    });

    await s3Client.send(command);
    return { bucket: S3_BUCKET, key: s3Key, url: getPublicS3Url(s3Key) };
  } catch (err) {
    console.error("S3 Stream Upload Error:", err);
    return { bucket: S3_BUCKET, key: s3Key, url: getPublicS3Url(s3Key) };
  }
}

/**
 * Generates a short-lived pre-signed download URL or returns the direct public URL.
 */
export async function getPresignedS3Url(s3Key: string, expiresInSeconds: number = 3600): Promise<string> {
  const expires = Math.min(expiresInSeconds, 3600);
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expires });
  } catch (err) {
    console.error("Failed to generate pre-signed S3 URL:", err);
    return getPublicS3Url(s3Key);
  }
}

/**
 * Deletes an object from DigitalOcean Spaces / S3 bucket.
 */
export async function deleteFromS3(s3Key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error("S3 Delete error:", err);
    return false;
  }
}
