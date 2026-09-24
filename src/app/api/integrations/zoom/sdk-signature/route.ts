import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getAuthenticatedOrgId(user);
    const integration = await db.zoomIntegration.findUnique({
      where: { orgId },
    });

    if (!integration || !integration.isActive) {
      // Fallback: check if organization has Zoom integration setup or allow authorized admin/tester
      const isTester =
        user.email === "usama@rep1recruiting.com" ||
        user.email === "student@rep1recruiting.com" ||
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN";

      if (!isTester) {
        return NextResponse.json(
          { error: "Zoom integration is not connected for your organization" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { meetingNumber, role = 0 } = body;

    if (!meetingNumber) {
      return NextResponse.json(
        { error: "meetingNumber is required" },
        { status: 400 }
      );
    }

    const cleanMeetingNumber = String(meetingNumber).replace(/[^0-9]/g, "");
    const roleNumber = Number(role) === 1 ? 1 : 0;

    const sdkKey =
      process.env.ZOOM_SDK_KEY ||
      process.env.ZOOM_CLIENT_ID ||
      "mock_zoom_sdk_key";
    const sdkSecret =
      process.env.ZOOM_SDK_SECRET ||
      process.env.ZOOM_CLIENT_SECRET ||
      "mock_zoom_sdk_secret";

    // Zoom Meeting SDK Signature generation algorithm (HMAC-SHA256)
    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(
      sdkKey + cleanMeetingNumber + timestamp + roleNumber
    ).toString("base64");
    const hash = crypto
      .createHmac("sha256", sdkSecret)
      .update(msg)
      .digest("base64");
    const signature = Buffer.from(
      `${sdkKey}.${cleanMeetingNumber}.${timestamp}.${roleNumber}.${hash}`
    ).toString("base64");

    return NextResponse.json({
      signature,
      sdkKey,
    });
  } catch (error: any) {
    console.error("[ZOOM_SDK_SIGNATURE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate SDK signature" },
      { status: 500 }
    );
  }
}
