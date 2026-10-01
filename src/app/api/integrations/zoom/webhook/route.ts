import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { uploadStreamToS3, S3_BUCKET } from "@/lib/s3";
import { Readable } from "stream";

const ZOOM_WEBHOOK_SECRET = process.env.ZOOM_WEBHOOK_SECRET || "mock_zoom_webhook_secret";
const ZOOM_DELETE_AFTER_UPLOAD = process.env.ZOOM_DELETE_AFTER_UPLOAD === "true";

function verifyZoomSignature(req: Request, rawBody: string): boolean {
  const message = `v0:${req.headers.get("x-zm-request-timestamp")}:${rawBody}`;
  const hash = crypto.createHmac("sha256", ZOOM_WEBHOOK_SECRET).update(message).digest("hex");
  const expectedSignature = `v0=${hash}`;
  const actualSignature = req.headers.get("x-zm-signature");
  return expectedSignature === actualSignature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // 1. Handle Zoom Endpoint URL Validation (Challenge-Response)
    if (body.event === "endpoint.url_validation" && body.payload?.plainToken) {
      const plainToken = body.payload.plainToken;
      const encryptedToken = crypto
        .createHmac("sha256", ZOOM_WEBHOOK_SECRET)
        .update(plainToken)
        .digest("hex");

      return NextResponse.json({
        plainToken,
        encryptedToken,
      });
    }

    // 2. Validate HMAC Signature for standard events if secret configured
    if (process.env.ZOOM_WEBHOOK_SECRET && !verifyZoomSignature(req, rawBody)) {
      console.warn("Invalid Zoom webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, payload } = body;

    // 3. Handle Event: meeting.ended
    if (event === "meeting.ended" && payload?.object?.id) {
      const zoomMeetingId = String(payload.object.id);
      const cleanId = zoomMeetingId.replace(/[^0-9]/g, "");
      const twentyFourMonthsLater = new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000);

      await db.zoomMeeting.updateMany({
        where: {
          OR: [{ zoomMeetingId }, { zoomMeetingId: cleanId }],
        },
        data: { status: "ended" },
      });

      await db.coachesAcademySession.updateMany({
        where: {
          OR: [
            { zoomMeetingId },
            { zoomMeetingId: cleanId },
            { status: "started" },
          ],
        },
        data: {
          status: "ended",
          retentionUntil: twentyFourMonthsLater,
        },
      });

      return NextResponse.json({ success: true, event, message: "Meeting marked ended and archived" });
    }

    // 4. Handle Event: recording.completed
    if (event === "recording.completed" && payload?.object?.id) {
      const zoomMeetingId = String(payload.object.id);
      const cleanId = zoomMeetingId.replace(/[^0-9]/g, "");
      const recordingFiles = payload.object.recording_files || [];
      const downloadToken = payload.download_token || "";

      // 1-Click recording passcode embedding for Coaches Academy archive
      const mp4File = recordingFiles.find((f: any) => f.file_type === "MP4") || recordingFiles[0];
      let shareUrl = payload.object.share_url || mp4File?.play_url || mp4File?.download_url;
      const passcode = payload.object.recording_play_passcode || (payload.object.password ? encodeURIComponent(payload.object.password) : "");
      if (passcode && shareUrl && !shareUrl.includes("pwd=")) {
        shareUrl += `${shareUrl.includes("?") ? "&" : "?"}pwd=${passcode}`;
      }

      if (shareUrl) {
        const twentyFourMonthsLater = new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000);
        await db.coachesAcademySession.updateMany({
          where: {
            OR: [
              { zoomMeetingId },
              { zoomMeetingId: cleanId },
              { status: "started" },
            ],
          },
          data: {
            recordingUrl: shareUrl,
            status: "ended",
            retentionUntil: twentyFourMonthsLater,
          },
        });
      }

      const meeting = await db.zoomMeeting.findFirst({
        where: {
          OR: [{ zoomMeetingId }, { zoomMeetingId: cleanId }],
        },
      });

      if (meeting) {
        // Trigger async processing pipeline — DO NOT BLOCK webhook response
        processRecordingPipeline(meeting, recordingFiles, downloadToken).catch((err) => {
          console.error("Async recording pipeline error:", err);
        });
      }

      return NextResponse.json({ success: true, message: "Recording processing job triggered and academy session archived" });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Zoom webhook handler error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}

/**
 * Async background job to download recording files from Zoom and stream upload to S3.
 */
async function processRecordingPipeline(
  meeting: { id: string; orgId: string; zoomMeetingId: string },
  recordingFiles: any[],
  downloadToken: string
) {
  for (const file of recordingFiles) {
    if (!file.download_url) continue;

    const fileType = file.file_type ? file.file_type.toLowerCase() : "video";
    const extension = file.file_extension ? file.file_extension.toLowerCase() : "mp4";
    const filename = `${fileType}_${file.id || Date.now()}.${extension}`;
    const s3Key = `recordings/${meeting.orgId}/${meeting.zoomMeetingId}/${filename}`;

    // Create placeholder recording record in DB (status: processing)
    const dbRecording = await db.zoomRecording.create({
      data: {
        orgId: meeting.orgId,
        meetingId: meeting.id,
        zoomRecordingId: file.id ? String(file.id) : null,
        recordingType: fileType,
        s3Key,
        s3Bucket: S3_BUCKET,
        fileSizeBytes: BigInt(file.file_size || 0),
        durationSeconds: file.duration || 0,
        status: "processing",
        recordedAt: new Date(file.recording_start || Date.now()),
      },
    });

    try {
      // Download recording stream from Zoom
      const downloadUrl = `${file.download_url}?access_token=${downloadToken}`;
      const zoomRes = await fetch(downloadUrl);

      if (!zoomRes.ok || !zoomRes.body) {
        throw new Error(`Failed to download recording file from Zoom: ${zoomRes.statusText}`);
      }

      // Convert Web Stream to Node Readable Stream
      const nodeStream = Readable.fromWeb(zoomRes.body as any);

      // Upload to S3
      await uploadStreamToS3(nodeStream, s3Key, file.file_extension === "mp4" ? "video/mp4" : "application/octet-stream");

      // Update DB record status = ready
      await db.zoomRecording.update({
        where: { id: dbRecording.id },
        data: { status: "ready" },
      });

      // Optional: Delete from Zoom Cloud after successful upload
      if (ZOOM_DELETE_AFTER_UPLOAD && file.id) {
        console.log(`ZOOM_DELETE_AFTER_UPLOAD enabled: deleting ${file.id} from Zoom Cloud`);
      }
    } catch (err: any) {
      console.error(`Failed to process recording ${file.id}:`, err);
      await db.zoomRecording.update({
        where: { id: dbRecording.id },
        data: { status: "failed" },
      });
    }
  }
}
