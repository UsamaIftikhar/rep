import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { getPresignedS3Url } from "@/lib/s3";

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
  });

  if (!recording) {
    return NextResponse.json({ error: "Recording not found or access denied" }, { status: 404 });
  }

  // Generate short-lived pre-signed URL (expires in 1 hour max / 3600s)
  const url = await getPresignedS3Url(recording.s3Key, 3600);

  return NextResponse.json({
    url,
    expiresInSeconds: 3600,
  });
}
