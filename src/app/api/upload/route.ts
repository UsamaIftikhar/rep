import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { uploadBufferToS3 } from "@/lib/s3";
import path from "path";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "academy-files";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique DigitalOcean Spaces S3 Key
    const ext = path.extname(file.name) || "";
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const s3Key = `${folder}/${Date.now()}_${cleanName}${ext}`;

    // Upload directly to DigitalOcean Spaces: https://rep1.nyc3.digitaloceanspaces.com
    const publicUrl = await uploadBufferToS3(buffer, s3Key, file.type || "application/octet-stream");

    return NextResponse.json({
      success: true,
      url: publicUrl,
      s3Key,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Direct S3/DigitalOcean Spaces upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to DigitalOcean Spaces" },
      { status: 500 }
    );
  }
}
