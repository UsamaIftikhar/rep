import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

// POST /api/webhooks/zoom - Handle Zoom webhooks (URL validation & recording.completed)
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const zoomSecret =
      process.env.ZOOM_WEBHOOK_SECRET ||
      process.env.ZOOM_WEBHOOK_SECRET_TOKEN ||
      process.env.ZOOM_SECRET_TOKEN ||
      process.env.ZOOM_CLIENT_SECRET ||
      "zoom_webhook_secret";

    // 1. Zoom URL Validation Challenge
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken;
      if (!plainToken) {
        return NextResponse.json({ error: "Missing plainToken" }, { status: 400 });
      }

      const encryptedToken = crypto
        .createHmac("sha256", zoomSecret)
        .update(plainToken)
        .digest("hex");

      return NextResponse.json(
        {
          plainToken,
          encryptedToken,
        },
        { status: 200 }
      );
    }

    // 2. Handle Recording Completed Event
    if (body.event === "recording.completed") {
      const meetingObj = body.payload?.object;
      if (!meetingObj) {
        return NextResponse.json({ message: "No meeting object in payload" }, { status: 200 });
      }

      const zoomMeetingId = String(meetingObj.id || "");
      const files = Array.isArray(meetingObj.recording_files) ? meetingObj.recording_files : [];

      // Find the main MP4 video recording
      const mp4File =
        files.find((f: any) => f.file_type === "MP4") ||
        files.find((f: any) => f.file_extension === "MP4") ||
        files[0];

      let recordingUrl = meetingObj.share_url || mp4File?.play_url || mp4File?.download_url;
      const passcode = meetingObj.recording_play_passcode || (meetingObj.password ? encodeURIComponent(meetingObj.password) : "");
      if (passcode && recordingUrl && !recordingUrl.includes("pwd=")) {
        const separator = recordingUrl.includes("?") ? "&" : "?";
        recordingUrl = `${recordingUrl}${separator}pwd=${passcode}`;
      }

      // Calculate 24-Month Retention
      const retentionUntil = new Date();
      retentionUntil.setMonth(retentionUntil.getMonth() + 24);

      if (zoomMeetingId && recordingUrl) {
        // Update CoachesAcademySession
        await db.coachesAcademySession.updateMany({
          where: { zoomMeetingId },
          data: {
            recordingUrl,
            retentionUntil,
            status: "ended",
          },
        });

        // Also record in ZoomRecording table
        const matchingMeeting = await db.zoomMeeting.findFirst({
          where: { zoomMeetingId },
        });

        if (matchingMeeting) {
          await db.zoomRecording.create({
            data: {
              orgId: matchingMeeting.orgId,
              meetingId: matchingMeeting.id,
              zoomRecordingId: mp4File?.id ? String(mp4File.id) : `rec_${Date.now()}`,
              recordingType: "video",
              s3Key: `recordings/zoom_${zoomMeetingId}.mp4`,
              s3Bucket: process.env.SPACES_BUCKET || "rep1",
              fileSizeBytes: BigInt(mp4File?.file_size || 0),
              durationSeconds: (meetingObj.duration || 0) * 60,
              status: "ready",
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Recording processed and 24-month retention applied",
        meetingId: zoomMeetingId,
      });
    }

    // 3. Handle Meeting Ended Event
    if (body.event === "meeting.ended") {
      const meetingId = String(body.payload?.object?.id || "");
      if (meetingId) {
        await db.coachesAcademySession.updateMany({
          where: { zoomMeetingId: meetingId },
          data: { status: "ended" },
        });
        await db.zoomMeeting.updateMany({
          where: { zoomMeetingId: meetingId },
          data: { status: "ended" },
        });
      }
      return NextResponse.json({ success: true, message: "Meeting marked ended" });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[ZOOM_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
