import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAccessCoachesAcademy } from "@/lib/entitlements";
import { isCoachesAcademyPresenter } from "@/lib/permissions";

// GET /api/coaches-academy/files?category=OFFENSE&subfolder=QB
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await canAccessCoachesAcademy(user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Access requires active REP 1 Coaches Academy membership" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subfolder = searchParams.get("subfolder");

    const where: any = {};
    if (category) where.category = category;
    if (subfolder && subfolder !== "ALL") where.subfolder = subfolder;

    const files = await db.coachingAcademyFile.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ files, isPresenter: access.isPresenter });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_FILES_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coaching materials" },
      { status: 500 }
    );
  }
}

// POST /api/coaches-academy/files (Presenters & Admins only)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPresenter = isCoachesAcademyPresenter(user as any);
    if (!isPresenter) {
      return NextResponse.json(
        { error: "Forbidden: Only approved presenters and coaching staff can upload playbooks and materials" },
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
        title: title.trim(),
        description: description?.trim() || null,
        fileUrl: fileUrl.trim(),
        fileSize: fileSize || "Document / Video",
        fileType: fileType || "document",
        category,
        subfolder: subfolder || null,
        uploadedBy: user.name || user.email,
      },
    });

    return NextResponse.json({ file: fileRecord });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_FILES_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload coaching playbook file" },
      { status: 500 }
    );
  }
}

// DELETE /api/coaches-academy/files?id=XYZ (Presenters & Admins only)
export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPresenter = isCoachesAcademyPresenter(user as any);
    if (!isPresenter) {
      return NextResponse.json(
        { error: "Forbidden: Only presenters can remove materials" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    await db.coachingAcademyFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true, message: "File removed successfully" });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_FILES_DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
