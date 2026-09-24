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

    const isTester =
      user.email === "usama@rep1recruiting.com" ||
      user.email === "student@rep1recruiting.com";

    if (!isTester) {
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
      where: { orgId },
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

    // Action: 'start'
    const zoomMeetingId = "academy-" + Date.now();
    const joinUrl = process.env.NEXT_PUBLIC_ZOOM_ACADEMY_URL || "https://zoom.us/j/rep1coachingacademy";

    const meeting = await db.zoomMeeting.create({
      data: {
        orgId,
        zoomMeetingId,
        topic: topic || "Rep 1 Coaching Academy Live Strategy & Film Session",
        startTime: new Date(),
        durationMinutes: 60,
        joinUrl,
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
