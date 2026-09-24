import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/academy/files?category=OFFENSE&subfolder=QB
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isTester =
      user.email === "usama@rep1recruiting.com" ||
      user.email === "student@rep1recruiting.com";

    if (!isTester) {
      return NextResponse.json({ error: "Access denied during testing phase" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subfolder = searchParams.get("subfolder");

    const where: any = {};
    if (category) where.category = category;
    if (subfolder) where.subfolder = subfolder;

    const files = await db.coachingAcademyFile.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("[ACADEMY_FILES_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// POST /api/academy/files (Admin only)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: Admin only (usama@rep1recruiting.com)
    const isAdmin =
      user.email === "usama@rep1recruiting.com" ||
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can upload academy files" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, fileUrl, fileSize, fileType, category, subfolder } = body;

    if (!title || !fileUrl || !category) {
      return NextResponse.json(
        { error: "Title, fileUrl, and category are required" },
        { status: 400 }
      );
    }

    const fileRecord = await db.coachingAcademyFile.create({
      data: {
        title,
        description,
        fileUrl,
        fileSize: fileSize || "PDF / Document",
        fileType: fileType || "document",
        category,
        subfolder: subfolder || null,
        uploadedBy: user.email,
      },
    });

    return NextResponse.json({ file: fileRecord });
  } catch (error: any) {
    console.error("[ACADEMY_FILES_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to save file record" },
      { status: 500 }
    );
  }
}

// DELETE /api/academy/files?id=XYZ (Admin only)
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can delete academy files" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 });
    }

    await db.coachingAcademyFile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ACADEMY_FILES_DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file record" },
      { status: 500 }
    );
  }
}
