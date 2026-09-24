import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || "rep1_secret_key_32_bytes_long_crypto!!";

function getDerivedKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, "rep1_salt_v1", 32);
}

/**
 * Encrypts sensitive text (like OAuth access/refresh tokens) using AES-256-GCM.
 */
export function encryptToken(text: string): string {
  if (!text) return "";
  const key = getDerivedKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted tokens. Returns raw plaintext string.
 */
export function decryptToken(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      // Fallback if token was stored plain text
      return encryptedText;
    }
    const [ivHex, authTagHex, encryptedDataHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedDataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt token:", error);
    return encryptedText;
  }
}
