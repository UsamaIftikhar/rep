import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { canAccessCoachesAcademy } from "@/lib/entitlements";
import { isCoachesAcademyPresenter } from "@/lib/permissions";

// GET /api/coaches-academy/session - Fetch active session & past archives
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await canAccessCoachesAcademy(user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          isPresenter: false,
          reason: access.reason || "Annual Coaches Academy subscription required",
        },
        { status: 403 }
      );
    }

    const orgId = await getAuthenticatedOrgId(user);

    // 1. Fetch active session from CoachesAcademySession model
    let activeSession = await db.coachesAcademySession.findFirst({
      where: {
        status: { in: ["started", "scheduled"] },
      },
      orderBy: { scheduledDate: "desc" },
    });

    // Fallback: check ZoomMeeting table if no CoachesAcademySession is active
    if (!activeSession) {
      const activeZoom = await db.zoomMeeting.findFirst({
        where: {
          contextType: "coaching_academy",
          status: { in: ["started", "scheduled"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeZoom) {
        const pairedBoard = await db.miroBoard.findFirst({
          where: {
            OR: [
              { contextId: activeZoom.zoomMeetingId },
              { contextType: "coaching_academy", isActive: true },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        activeSession = {
          id: activeZoom.id,
          title: activeZoom.topic,
          description: null,
          scheduledDate: activeZoom.startTime,
          zoomMeetingId: activeZoom.zoomMeetingId,
          zoomJoinUrl: activeZoom.joinUrl,
          zoomPassword: activeZoom.password,
          whiteboardId: pairedBoard?.miroBoardId || null,
          whiteboardUrl: pairedBoard?.miroBoardId
            ? `https://miro.com/app/live-embed/${pairedBoard.miroBoardId}/?embedAutoplay=true`
            : null,
          recordingUrl: null,
          retentionUntil: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
          status: activeZoom.status,
          presenterId: activeZoom.createdBy,
          presenterName: "REP 1 Coaching Staff",
          department: "GENERAL",
          createdAt: activeZoom.createdAt,
          updatedAt: activeZoom.createdAt,
        };
      }
    }

    // 2. Fetch active and latest Zoom meetings
    const activeMeeting = await db.zoomMeeting.findFirst({
      where: {
        contextType: "coaching_academy",
        status: "started",
      },
      orderBy: { createdAt: "desc" },
    });

    const latestMeeting = await db.zoomMeeting.findFirst({
      where: {
        contextType: "coaching_academy",
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch past sessions history (24-month retained sessions)
    const pastSessions = await db.coachesAcademySession.findMany({
      orderBy: { scheduledDate: "desc" },
      take: 25,
    });

    // Also fetch recent zoom meetings for any older sessions
    const recentZoomMeetings = await db.zoomMeeting.findMany({
      where: {
        contextType: "coaching_academy",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 4. Fetch active Miro board (prioritizing current live session board)
    let activeBoard = null;
    if (activeSession?.whiteboardId) {
      activeBoard = await db.miroBoard.findFirst({
        where: {
          miroBoardId: activeSession.whiteboardId,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!activeBoard) {
      activeBoard = await db.miroBoard.findFirst({
        where: {
          isActive: true,
          OR: [{ contextType: "coaching_academy" }, { orgId }],
        },
        orderBy: { createdAt: "desc" },
      });
    }

    let allBoards = await db.miroBoard.findMany({
      where: {
        OR: [{ contextType: "coaching_academy" }, { orgId }],
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    if (!activeBoard) {
      activeBoard = await db.miroBoard.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (activeBoard && allBoards.length === 0) {
        allBoards = [activeBoard];
      }
    }

    const miroIntegration =
      (await db.miroIntegration.findFirst({
        where: { isActive: true },
      })) || Boolean(process.env.MIRO_ACCESS_TOKEN);

    return NextResponse.json({
      allowed: true,
      isPresenter: access.isPresenter,
      isMiroConnected: Boolean(miroIntegration),
      activeSession,
      activeMeeting: activeMeeting || null,
      latestMeeting: latestMeeting || null,
      recentMeetings: recentZoomMeetings,
      pastSessions,
      activeBoard,
      allBoards,
    });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_SESSION_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch session state" },
      { status: 500 }
    );
  }
}

// POST /api/coaches-academy/session - Start or End a live session (Presenter Only)
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPresenter = isCoachesAcademyPresenter(user as any);
    if (!isPresenter) {
      return NextResponse.json(
        { error: "Forbidden: Only approved presenters and admins can manage live classroom sessions" },
        { status: 403 }
      );
    }

    const orgId = await getAuthenticatedOrgId(user);
    const body = await req.json();
    const { action, topic, department, customJoinUrl, customMiroUrl, recordingUrl } = body;

    // --- Action: 'end' or 'close_in_progress' ---
    if (action === "end" || action === "close_in_progress") {
      // 1. Terminate all live Zoom meetings on Zoom Cloud
      try {
        const { endAllLiveZoomMeetings } = await import("@/lib/integrations/zoom");
        await endAllLiveZoomMeetings(orgId);
      } catch (e) {
        console.warn("[COACHES_SESSION_END] Zoom cloud cleanup warning:", e);
      }

      // 2. Mark active sessions as ended in CoachesAcademySession
      const twentyFourMonthsLater = new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000);
      await db.coachesAcademySession.updateMany({
        where: { status: "started" },
        data: {
          status: "ended",
          retentionUntil: twentyFourMonthsLater,
          ...(recordingUrl ? { recordingUrl } : {}),
        },
      });

      // 3. Mark active meetings in ZoomMeeting as ended
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
        message: "Live session concluded. Archival record retained for 24 months.",
      });
    }

    // --- Action: 'start' ---
    // End any prior active sessions first
    try {
      const { endAllLiveZoomMeetings } = await import("@/lib/integrations/zoom");
      await endAllLiveZoomMeetings(orgId);
    } catch (e) {}

    await db.coachesAcademySession.updateMany({
      where: { status: "started" },
      data: { status: "ended" },
    });

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

    if (customJoinUrl) {
      joinUrl = customJoinUrl.trim();
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

    // Determine Miro Board for this session
    let cleanMiroId = "";
    if (customMiroUrl) {
      const trimmed = customMiroUrl.trim();
      const boardUrlMatch = trimmed.match(/board\/([a-zA-Z0-9_=-]+)/) || trimmed.match(/live-embed\/([a-zA-Z0-9_=-]+)/);
      if (boardUrlMatch && boardUrlMatch[1]) {
        cleanMiroId = boardUrlMatch[1];
      } else {
        cleanMiroId = trimmed;
      }
      cleanMiroId = cleanMiroId.split("?")[0].replace(/\/+$/, "");
    }

    const sessionTopic = topic || "REP 1 Coaches Academy Live Strategy & Film Session";
    const nowFormatted = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Attempt automatic Miro API board creation if connected
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
            name: `${sessionTopic} - Board (${nowFormatted})`,
            description: `Dedicated interactive whiteboard for Coaches Academy playbook diagrams and film review: ${sessionTopic}`,
            policy: {
              sharingPolicy: {
                access: "view",
                teamAccess: "edit",
              },
            },
          }),
        });
        if (miroRes.ok) {
          const miroData = await miroRes.json();
          if (miroData.id) {
            cleanMiroId = miroData.id;
            console.log("Successfully created fresh Miro board for session:", cleanMiroId, miroData.name);
          }
        } else {
          const errText = await miroRes.text();
          console.warn("Miro API automatic board creation failed with status:", miroRes.status, errText);
        }
      } catch (err) {
        console.warn("Miro API automatic board creation fallback:", err);
      }
    }

    // Fallback whiteboard ID if API board creation was not possible
    if (!cleanMiroId) {
      const latestBoard = await db.miroBoard.findFirst({
        where: { orgId },
        orderBy: { createdAt: "desc" },
      });
      cleanMiroId = latestBoard?.miroBoardId || "uXjVHg26c9M=";
    }

    // Deactivate previous academy boards in DB
    await db.miroBoard.updateMany({
      where: { orgId, contextType: "coaching_academy" },
      data: { isActive: false },
    });

    const sessionBoard = await db.miroBoard.create({
      data: {
        orgId,
        miroBoardId: cleanMiroId,
        title: `${sessionTopic} - Board (${nowFormatted})`,
        description: `Dedicated whiteboard for: ${sessionTopic}`,
        contextType: "coaching_academy",
        contextId: "coaches-academy-live",
        createdBy: user.name || user.email,
        isActive: true,
      },
    });

    // Attempt Zoom API meeting creation if no custom URL
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
            topic: sessionTopic,
            type: 2,
            start_time: new Date().toISOString(),
            duration: 90,
            settings: {
              host_video: true,
              participant_video: true,
              join_before_host: true,
              jbh_time: 0,
              waiting_room: false,
              approval_type: 2,
              audio: "both",
              auto_recording: "cloud", // Auto record for 24-month retention
            },
          }),
        });

        if (zoomApiRes.ok) {
          const zoomData = await zoomApiRes.json();
          if (zoomData.id) zoomMeetingId = String(zoomData.id);
          if (zoomData.join_url) joinUrl = zoomData.join_url;
          meetingPassword = zoomData.encrypted_password || zoomData.password || "";
        }
      } catch (e: any) {
        console.warn("Zoom meeting creation fallback:", e);
      }
    }

    // Fallback if no Zoom meeting ID or join URL created via Zoom API
    if (!zoomMeetingId && !joinUrl) {
      const latestMeeting = await db.zoomMeeting.findFirst({
        where: { orgId },
        orderBy: { createdAt: "desc" },
      });
      if (latestMeeting?.zoomMeetingId) {
        zoomMeetingId = latestMeeting.zoomMeetingId;
        joinUrl = latestMeeting.joinUrl || `https://zoom.us/j/${zoomMeetingId}`;
        meetingPassword = latestMeeting.password || "";
      } else {
        zoomMeetingId = "7788990011";
        joinUrl = `https://zoom.us/j/${zoomMeetingId}`;
        meetingPassword = "";
      }
    }

    // Save Zoom Meeting in DB
    const meeting = await db.zoomMeeting.upsert({
      where: { zoomMeetingId },
      update: {
        orgId,
        topic: sessionTopic,
        startTime: new Date(),
        durationMinutes: 90,
        joinUrl,
        password: meetingPassword || undefined,
        contextType: "coaching_academy",
        contextId: "coaches-academy-live",
        status: "started",
        createdBy: user.id,
      },
      create: {
        orgId,
        zoomMeetingId,
        topic: sessionTopic,
        startTime: new Date(),
        durationMinutes: 90,
        joinUrl,
        password: meetingPassword || undefined,
        contextType: "coaching_academy",
        contextId: "coaches-academy-live",
        status: "started",
        createdBy: user.id,
      },
    });

    // Pair Miro board to Zoom meeting ID
    if (sessionBoard && zoomMeetingId) {
      await db.miroBoard.update({
        where: { id: sessionBoard.id },
        data: { contextId: zoomMeetingId },
      });
    }

    // 24 months retention calculation
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() + 24);

    // Create high-level CoachesAcademySession record
    const coachSession = await db.coachesAcademySession.create({
      data: {
        title: sessionTopic,
        description: `Live interactive classroom session led by ${user.name || user.email}`,
        scheduledDate: new Date(),
        zoomMeetingId,
        zoomJoinUrl: joinUrl,
        zoomPassword: meetingPassword || undefined,
        whiteboardId: cleanMiroId,
        whiteboardUrl: `https://miro.com/app/live-embed/${cleanMiroId}/?embedAutoplay=true`,
        retentionUntil: retentionDate,
        status: "started",
        presenterId: user.id,
        presenterName: user.name || user.email,
        department: department || "GENERAL",
      },
    });

    return NextResponse.json({
      success: true,
      session: coachSession,
      meeting,
      board: sessionBoard,
      status: "started",
    });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_SESSION_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to manage session" },
      { status: 500 }
    );
  }
}
