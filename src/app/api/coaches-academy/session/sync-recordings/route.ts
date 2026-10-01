import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { isCoachesAcademyPresenter } from "@/lib/permissions";
import { getValidZoomAccessToken } from "@/lib/integrations/zoom";

// POST /api/coaches-academy/session/sync-recordings - Query Zoom Cloud API for recordings
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPresenter = isCoachesAcademyPresenter(user as any);
    if (!isPresenter) {
      return NextResponse.json({ error: "Forbidden: Presenters only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { sessionId, zoomMeetingId } = body;

    let targetMeetingId = zoomMeetingId;
    let session = null;

    if (sessionId) {
      session = await db.coachesAcademySession.findUnique({
        where: { id: sessionId },
      });
      if (session?.zoomMeetingId) {
        targetMeetingId = session.zoomMeetingId;
      }
    }

    if (!targetMeetingId) {
      return NextResponse.json(
        { error: "Zoom Meeting ID is required to sync recordings" },
        { status: 400 }
      );
    }

    const orgId = await getAuthenticatedOrgId(user);
    const cleanId = targetMeetingId.replace(/[^0-9]/g, "");

    try {
      const token = await getValidZoomAccessToken(orgId);
      const res = await fetch(`https://api.zoom.us/v2/meetings/${cleanId}/recordings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        let message = `Zoom Cloud returned ${res.status}: recordings may still be processing on Zoom Cloud.`;
        if (errText.includes("4711") || errText.includes("cloud_recording") || errText.includes("scope")) {
          message = "Zoom API: Your Zoom App is missing the 'cloud_recording:read:list_recording_files' scope in Zoom App Marketplace. You can also manually attach the recording URL using 'Attach Link'.";
        }
        return NextResponse.json(
          {
            error: message,
            details: errText,
          },
          { status: 400 }
        );
      }

      const data = await res.json();
      const files = Array.isArray(data.recording_files) ? data.recording_files : [];
      const mp4File =
        files.find((f: any) => f.file_type === "MP4") ||
        files.find((f: any) => f.file_extension === "MP4") ||
        files[0];

      const recordingUrl = mp4File?.play_url || mp4File?.download_url || data.share_url;

      if (!recordingUrl) {
        return NextResponse.json(
          { error: "No video file found in this Zoom cloud recording yet." },
          { status: 404 }
        );
      }

      const retentionUntil = new Date();
      retentionUntil.setMonth(retentionUntil.getMonth() + 24);

      if (sessionId) {
        await db.coachesAcademySession.update({
          where: { id: sessionId },
          data: { recordingUrl, retentionUntil },
        });
      } else {
        await db.coachesAcademySession.updateMany({
          where: { zoomMeetingId: targetMeetingId },
          data: { recordingUrl, retentionUntil },
        });
      }

      return NextResponse.json({
        success: true,
        recordingUrl,
        retentionUntil,
        durationMinutes: data.duration,
      });
    } catch (e: any) {
      console.warn("Zoom cloud recording query failed:", e);
      return NextResponse.json(
        { error: e.message || "Failed to retrieve recordings from Zoom Cloud" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[SYNC_RECORDINGS_ERROR]", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
