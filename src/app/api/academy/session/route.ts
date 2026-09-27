import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";

// GET /api/academy/session - Fetch active Coaching Academy session (Zoom + Miro)
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAllowed =
      user.email === "usama@rep1recruiting.com" ||
      user.email === "student@rep1recruiting.com";

    if (!isAllowed) {
      return NextResponse.json({ error: "Access denied during testing phase" }, { status: 403 });
    }

    const orgId = await getAuthenticatedOrgId(user);

    // Fetch active meeting for coaching_academy
    const activeMeeting = await db.zoomMeeting.findFirst({
      where: {
        contextType: "coaching_academy",
        status: { in: ["started", "scheduled"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch latest active Miro board integration for org
    const miroIntegration = await db.miroIntegration.findFirst({
      where: { orgId },
    });

    const activeBoard = await db.miroBoard.findFirst({
      where: { orgId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      activeMeeting: activeMeeting || null,
      miroIntegration: !!miroIntegration,
      activeBoard: activeBoard || null,
    });
  } catch (error: any) {
    console.error("[ACADEMY_SESSION_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch session state" },
      { status: 500 }
    );
  }
}

// POST /api/academy/session - Start or End a live session (Admin Only)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getAuthenticatedOrgId(user);

    const isAdmin =
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only admins can start/end coaching academy live sessions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, topic } = body; // action: 'start' | 'end'

    if (action === "end") {
      await db.zoomMeeting.updateMany({
        where: {
          contextType: "coaching_academy",
          status: "started",
        },
        data: { status: "ended" },
      });
      return NextResponse.json({ success: true, status: "ended" });
    }

    // Action: 'start' - End any prior active sessions first
    await db.zoomMeeting.updateMany({
      where: {
        contextType: "coaching_academy",
        status: "started",
      },
      data: { status: "ended" },
    });
    let zoomMeetingId = "";
    let joinUrl = "";
    let meetingPassword = "";

    if (body.customJoinUrl) {
      joinUrl = body.customJoinUrl.trim();
      const match = joinUrl.match(/\/j\/(\d+)/) || joinUrl.match(/\/wc\/(\d+)/) || joinUrl.match(/^(\d+)$/);
      if (match && match[1]) {
        zoomMeetingId = match[1];
      } else {
        zoomMeetingId = joinUrl.replace(/[^0-9]/g, "");
      }
      const pwdMatch = joinUrl.match(/[?&]pwd=([^&]+)/);
      if (pwdMatch && pwdMatch[1]) {
        meetingPassword = decodeURIComponent(pwdMatch[1]);
      }
    }

    if (body.customMiroUrl) {
      let cleanMiroId = body.customMiroUrl.trim();
      const boardUrlMatch = cleanMiroId.match(/board\/([a-zA-Z0-9_=-]+)/) || cleanMiroId.match(/live-embed\/([a-zA-Z0-9_=-]+)/);
      if (boardUrlMatch && boardUrlMatch[1]) {
        cleanMiroId = boardUrlMatch[1];
      }
      await db.miroBoard.create({
        data: {
          orgId,
          miroBoardId: cleanMiroId,
          title: "Coaching Strategy & Playbook Whiteboard",
          contextType: "coaching_academy",
          contextId: "academy-live",
          createdBy: user.name || user.email,
          isActive: true,
        },
      });
    }

    // Try to create real Zoom meeting via Zoom API if Zoom OAuth is connected
    const integration = await db.zoomIntegration.findUnique({ where: { orgId } });
    if (integration && integration.isActive && !joinUrl) {
      try {
        const { getValidZoomAccessToken } = await import("@/lib/integrations/zoom");
        const token = await getValidZoomAccessToken(orgId);
        const zoomApiRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic || "Rep 1 Coaching Academy Live Strategy & Film Session",
            type: 2, // Scheduled meeting (enables join_before_host)
            start_time: new Date().toISOString(),
            duration: 60,
            settings: {
              host_video: true,
              participant_video: true,
              join_before_host: true,
              jbh_time: 0,
              waiting_room: false,
              approval_type: 2,
              audio: "both",
              auto_recording: "none",
            },
          }),
        });

        if (zoomApiRes.ok) {
          const zoomData = await zoomApiRes.json();
          if (zoomData.id) zoomMeetingId = String(zoomData.id);
          if (zoomData.join_url) joinUrl = zoomData.join_url;
          meetingPassword = zoomData.encrypted_password || zoomData.password || "";
        } else {
          const errText = await zoomApiRes.text();
          console.error("Zoom API error creating meeting:", zoomApiRes.status, errText);
          if (errText.includes("meeting:write")) {
            return NextResponse.json(
              {
                error:
                  "Zoom Marketplace App is missing the 'meeting:write:meeting' scope. Please add the scope under Scopes in your Zoom Marketplace App settings and click 'Connect Zoom Account' again.",
              },
              { status: 400 }
            );
          }
        }
      } catch (e: any) {
        console.warn("Failed to create meeting via Zoom API:", e);
      }
    }

    // Fallback if no zoomMeetingId set yet
    if (!zoomMeetingId && !joinUrl) {
      return NextResponse.json(
        {
          error:
            "Unable to start session. Please either Connect Zoom Account (with meeting:write scope on Zoom Marketplace) or enter a custom Zoom Meeting link.",
        },
        { status: 400 }
      );
    }

    const meeting = await db.zoomMeeting.upsert({
      where: { zoomMeetingId },
      update: {
        orgId,
        topic: topic || "Rep 1 Coaching Academy Live Strategy & Film Session",
        startTime: new Date(),
        durationMinutes: 60,
        joinUrl,
        password: meetingPassword || undefined,
        contextType: "coaching_academy",
        contextId: "academy-live",
        status: "started",
        createdBy: user.id,
      },
      create: {
        orgId,
        zoomMeetingId,
        topic: topic || "Rep 1 Coaching Academy Live Strategy & Film Session",
        startTime: new Date(),
        durationMinutes: 60,
        joinUrl,
        password: meetingPassword || undefined,
        contextType: "coaching_academy",
        contextId: "academy-live",
        status: "started",
        createdBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      meeting,
      status: "started",
    });
  } catch (error: any) {
    console.error("[ACADEMY_SESSION_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to manage session" },
      { status: 500 }
    );
  }
}
