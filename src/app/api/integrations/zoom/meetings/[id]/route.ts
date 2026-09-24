import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { getValidZoomAccessToken } from "@/lib/integrations/zoom";

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

  const meeting = await db.zoomMeeting.findFirst({
    where: { id, orgId },
    include: { recordings: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found or access denied" }, { status: 404 });
  }

  return NextResponse.json({ meeting });
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

  const meeting = await db.zoomMeeting.findFirst({
    where: { id, orgId },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found or access denied" }, { status: 404 });
  }

  // Attempt Zoom API meeting deletion if connected
  try {
    const accessToken = await getValidZoomAccessToken(orgId);
    await fetch(`https://api.zoom.us/v2/meetings/${meeting.zoomMeetingId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
  } catch (err) {
    console.warn("Zoom API delete call skipped or failed:", err);
  }

  await db.zoomMeeting.update({
    where: { id },
    data: { status: "cancelled" },
  });

  return NextResponse.json({ success: true, message: "Meeting cancelled successfully" });
}
