import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAccessCoachesAcademy } from "@/lib/entitlements";
import { s3Client, S3_BUCKET, extractS3KeyFromUrl, getPresignedS3Url } from "@/lib/s3";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

// GET /api/coaches-academy/files/download?id=XYZ
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      const loginUrl = new URL("/login?callbackUrl=/coaches-academy", req.url);
      return NextResponse.redirect(loginUrl);
    }

    const access = await canAccessCoachesAcademy(user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Access requires active REP 1 Coaches Academy membership" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");
    const rawUrl = searchParams.get("url");

    let targetUrl = rawUrl;
    let fileTitle = "file";

    if (fileId) {
      const fileRecord = await db.coachingAcademyFile.findUnique({
        where: { id: fileId },
      });

      if (!fileRecord) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      targetUrl = fileRecord.fileUrl;
      fileTitle = fileRecord.title;
    }

    if (!targetUrl) {
      return NextResponse.json({ error: "File ID or URL is required" }, { status: 400 });
    }

    // If external URL (e.g. Hudl, Youtube, Vimeo), redirect directly
    const s3Key = extractS3KeyFromUrl(targetUrl);
    if (!s3Key) {
      return NextResponse.redirect(targetUrl);
    }

    // Verify file existence in DigitalOcean Spaces
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
      }));
    } catch (headErr: any) {
      if (headErr.name === "NotFound" || headErr.$metadata?.httpStatusCode === 404) {
        return NextResponse.json(
          {
            error: `File "${fileTitle}" was not found in cloud storage. It may need to be re-uploaded.`,
            notFound: true,
          },
          { status: 404 }
        );
      }
      console.warn("HeadObject warning:", headErr.message);
    }

    // Generate pre-signed URL (valid for 1 hour)
    const presignedUrl = await getPresignedS3Url(s3Key, 3600);

    if (searchParams.get("format") === "json") {
      return NextResponse.json({ url: presignedUrl });
    }

    // Redirect browser directly to the pre-signed download/view URL
    return NextResponse.redirect(presignedUrl);
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_FILE_DOWNLOAD]", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}
