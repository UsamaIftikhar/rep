import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);
  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get("meeting_id");

  const whereClause: any = {
    orgId,
  };

  if (meetingId) {
    whereClause.meetingId = meetingId;
  }

  const rawRecordings = await db.zoomRecording.findMany({
    where: whereClause,
    include: {
      meeting: {
        select: {
          topic: true,
          startTime: true,
          durationMinutes: true,
          contextType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert BigInt fileSizeBytes to Number/String for JSON serialization
  const recordings = rawRecordings.map((r) => ({
    ...r,
    fileSizeBytes: Number(r.fileSizeBytes),
  }));

  return NextResponse.json({ recordings });
}
