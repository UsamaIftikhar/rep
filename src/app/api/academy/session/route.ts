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

    // 1. Fetch active meeting for coaching_academy (started or scheduled)
    const activeMeeting = await db.zoomMeeting.findFirst({
      where: {
        contextType: "coaching_academy",
        status: { in: ["started", "scheduled"] },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch the most recent meeting regardless of status so users can check meeting details anytime
    const latestMeeting = await db.zoomMeeting.findFirst({
      where: {
        contextType: "coaching_academy",
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch past sessions history (recent 10)
    const recentMeetings = await db.zoomMeeting.findMany({
      where: {
        contextType: "coaching_academy",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 4. Fetch latest active Miro board for coaching_academy
    const activeBoard = await db.miroBoard.findFirst({
      where: {
        isActive: true,
        OR: [{ contextType: "coaching_academy" }, { orgId }],
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Fetch all Miro boards (up to 15) so user can review any past whiteboard anytime
    const allBoards = await db.miroBoard.findMany({
      where: {
        OR: [{ contextType: "coaching_academy" }, { orgId }],
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // Fetch company Miro integration
    const miroIntegration =
      (await db.miroIntegration.findFirst({
        where: { isActive: true },
      })) || (await db.miroIntegration.findFirst());

    return NextResponse.json({
      activeMeeting: activeMeeting || null,
      latestMeeting: latestMeeting || null,
      recentMeetings: recentMeetings || [],
      activeBoard: activeBoard || null,
      allBoards: allBoards || [],
      miroIntegration: !!miroIntegration,
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

    if (action === "end" || action === "close_in_progress") {
      // 1. Find all active coaching_academy meetings in DB
      const activeMeetings = await db.zoomMeeting.findMany({
        where: {
          contextType: "coaching_academy",
          status: "started",
        },
      });

      // 2. Attempt to terminate meetings on Zoom Cloud
      try {
        const { endZoomMeetingOnCloud, endAllLiveZoomMeetings } = await import("@/lib/integrations/zoom");
        for (const m of activeMeetings) {
          await endZoomMeetingOnCloud(orgId, m.zoomMeetingId);
        }
        await endAllLiveZoomMeetings(orgId);
      } catch (e) {
        console.warn("[SESSION_END] Could not terminate on Zoom Cloud:", e);
      }

      // 3. Mark all started meetings as ended in DB
      await db.zoomMeeting.updateMany({
        where: {
          contextType: "coaching_academy",
          status: "started",
        },
        data: { status: "ended" },
      });

      return NextResponse.json({
        success: true,
        status: "ended",
        message: "All in-progress meetings closed successfully.",
      });
    }

    // Action: 'start' - End any prior active sessions first locally and on Zoom Cloud
    try {
      const { endAllLiveZoomMeetings } = await import("@/lib/integrations/zoom");
      await endAllLiveZoomMeetings(orgId);
    } catch (e) {}

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

    // Clean or determine Miro Board ID for this meeting session
    let cleanMiroId = "";
    if (body.customMiroUrl) {
      const trimmed = body.customMiroUrl.trim();
      const boardUrlMatch = trimmed.match(/board\/([a-zA-Z0-9_=-]+)/) || trimmed.match(/live-embed\/([a-zA-Z0-9_=-]+)/);
      if (boardUrlMatch && boardUrlMatch[1]) {
        cleanMiroId = boardUrlMatch[1];
      } else {
        cleanMiroId = trimmed;
      }
      cleanMiroId = cleanMiroId.split("?")[0].replace(/\/+$/, "");
    }

    // Attempt real Miro API board creation if Miro OAuth is connected
    if (!cleanMiroId) {
      try {
        const { getValidMiroAccessToken } = await import("@/lib/integrations/miro");
        const miroToken = await getValidMiroAccessToken(orgId);
        const miroRes = await fetch("https://api.miro.com/v2/boards", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${miroToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: topic ? `${topic} - Whiteboard` : `Coaching Strategy Whiteboard (${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
            description: "Live collaborative whiteboard for strategy diagrams and film review.",
          }),
        });
        if (miroRes.ok) {
          const miroData = await miroRes.json();
          if (miroData.id) {
            cleanMiroId = miroData.id;
          }
        }
      } catch (err) {
        console.warn("Miro API automatic board creation fallback:", err);
      }
    }

    // Fallback: If Miro API is not connected or token expired, use established interactive whiteboard ID
    if (!cleanMiroId) {
      const latestBoard = await db.miroBoard.findFirst({
        where: { orgId },
        orderBy: { createdAt: "desc" },
      });
      cleanMiroId = latestBoard?.miroBoardId || "uXjVHi7vvRw=";
    }

    // Deactivate previous academy boards so new board is the active one
    await db.miroBoard.updateMany({
      where: { orgId, contextType: "coaching_academy" },
      data: { isActive: false },
    });

    const nowFormatted = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const boardTitle = topic
      ? `${topic} - Whiteboard`
      : `Coaching Strategy Whiteboard (${nowFormatted})`;

    const sessionBoard = await db.miroBoard.create({
      data: {
        orgId,
        miroBoardId: cleanMiroId,
        title: boardTitle,
        description: `Whiteboard created for session: ${topic || "Coaching Academy Live Session"}`,
        contextType: "coaching_academy",
        contextId: "academy-live",
        createdBy: user.name || user.email,
        isActive: true,
      },
    });

    // Try to create real Zoom meeting via Zoom API using company Zoom integration
    const integration =
      (await db.zoomIntegration.findUnique({ where: { orgId } })) ||
      (await db.zoomIntegration.findFirst({ where: { isActive: true } })) ||
      (await db.zoomIntegration.findFirst());

    if (integration && !joinUrl) {
      try {
        const { getValidZoomAccessToken } = await import("@/lib/integrations/zoom");
        const token = await getValidZoomAccessToken(integration.orgId);
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
                  "Zoom Marketplace App is missing the 'meeting:write:meeting' scope. Please verify the scope in your Zoom Marketplace settings.",
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
            "Unable to generate meeting automatically. Please enter a custom Zoom Meeting link or check Settings.",
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
      board: sessionBoard,
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
