import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds limit (Max 5MB)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads/avatars directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadsDir, { recursive: true });

    const targetUserId = (formData.get("targetUserId") as string) || (formData.get("userId") as string) || user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const effectiveUserId = isAdmin && targetUserId ? targetUserId : user.id;

    const fileExt = path.extname(file.name) || ".jpg";
    const fileName = `avatar-${effectiveUserId}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save image to filesystem
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/avatars/${fileName}`;

    // Target User record
    const targetUser = await db.user.findUnique({
      where: { id: effectiveUserId },
      select: { firstName: true },
    });

    // Update user athleteProfile in database
    await db.athleteProfile.upsert({
      where: { userId: effectiveUserId },
      update: { profilePhoto: publicUrl },
      create: {
        userId: effectiveUserId,
        slug: `${targetUser?.firstName || "athlete"}-${Date.now().toString(36)}`,
        profilePhoto: publicUrl,
      },
    });

    // Also update user image
    await db.user.update({
      where: { id: effectiveUserId },
      data: { image: publicUrl },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profile photo uploaded successfully!",
    });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while uploading your profile photo." },
      { status: 500 }
    );
  }
}
