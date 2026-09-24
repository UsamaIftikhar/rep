import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { deleteFromS3 } from "@/lib/s3";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = await getAuthenticatedOrgId(user);

  const recording = await db.zoomRecording.findFirst({
    where: { id, orgId },
    include: {
      meeting: {
        select: {
          topic: true,
          startTime: true,
          durationMinutes: true,
        },
      },
    },
  });

  if (!recording) {
    return NextResponse.json({ error: "Recording not found or access denied" }, { status: 404 });
  }

  return NextResponse.json({
    recording: {
      ...recording,
      fileSizeBytes: Number(recording.fileSizeBytes),
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orgId = await getAuthenticatedOrgId(user);

  const recording = await db.zoomRecording.findFirst({
    where: { id, orgId },
  });

  if (!recording) {
    return NextResponse.json({ error: "Recording not found or access denied" }, { status: 404 });
  }

  // Delete file from S3
  await deleteFromS3(recording.s3Key);

  // Delete DB record
  await db.zoomRecording.delete({
    where: { id },
  });

  return NextResponse.json({ success: true, message: "Recording deleted successfully" });
}
