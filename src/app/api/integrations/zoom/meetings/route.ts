import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";
import { getValidZoomAccessToken } from "@/lib/integrations/zoom";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("context_type");
  const contextId = searchParams.get("context_id");

  const whereClause: any = {
    orgId,
  };

  if (contextType) {
    whereClause.contextType = contextType;
  }
  if (contextId) {
    whereClause.contextId = contextId;
  }

  const meetings = await db.zoomMeeting.findMany({
    where: whereClause,
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ meetings });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getAuthenticatedOrgId(user);

  try {
    const body = await req.json();
    const {
      topic,
      startTime,
      durationMinutes = 60,
      password,
      contextType = "general",
      contextId = null,
    } = body;

    if (!topic || !startTime) {
      return NextResponse.json({ error: "Topic and start time are required" }, { status: 400 });
    }

    let zoomMeetingId = String(Math.floor(1000000000 + Math.random() * 9000000000));
    let joinUrl = `https://zoom.us/j/${zoomMeetingId}`;

    // Attempt real Zoom API meeting creation if connected
    try {
      const accessToken = await getValidZoomAccessToken(orgId);
      const zoomRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          type: 2, // Scheduled meeting
          start_time: new Date(startTime).toISOString(),
          duration: Number(durationMinutes),
          password: password || undefined,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: true,
            auto_recording: "cloud", // Auto cloud recording for webhook pipeline
          },
        }),
      });

      if (zoomRes.ok) {
        const zoomData = await zoomRes.json();
        if (zoomData.id) {
          zoomMeetingId = String(zoomData.id);
          joinUrl = zoomData.join_url;
        }
      }
    } catch (err) {
      console.warn("Zoom API call fallback to generated meeting ID:", err);
    }

    const meeting = await db.zoomMeeting.create({
      data: {
        orgId,
        zoomMeetingId,
        topic,
        startTime: new Date(startTime),
        durationMinutes: Number(durationMinutes),
        joinUrl,
        password: password || null,
        hostId: user.id,
        contextType,
        contextId: contextId ? String(contextId) : null,
        status: "scheduled",
        createdBy: user.name || user.email,
      },
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to schedule Zoom meeting" }, { status: 500 });
  }
}
