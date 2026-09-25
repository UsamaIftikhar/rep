import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAuthenticatedOrgId } from "@/lib/org";
import { db } from "@/lib/db";

function generateZoomSDKJWT(
  sdkKey: string,
  sdkSecret: string,
  meetingNumber: string,
  role: number
): string {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours validity
  const tokenExp = iat + 60 * 60 * 2;

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    appKey: sdkKey,
    sdkKey: sdkKey,
    mn: meetingNumber,
    role: role,
    iat: iat,
    exp: exp,
    tokenExp: tokenExp,
  };

  const base64UrlEncode = (data: string | Buffer) => {
    const buf = typeof data === "string" ? Buffer.from(data) : data;
    return buf
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const rawSignature = crypto
    .createHmac("sha256", sdkSecret)
    .update(signatureInput)
    .digest();

  const encodedSignature = base64UrlEncode(rawSignature);

  return `${signatureInput}.${encodedSignature}`;
}

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
      // Fallback: allow authorized admin or student tester if testing live session
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
      "";
    const sdkSecret =
      process.env.ZOOM_SDK_SECRET ||
      process.env.ZOOM_CLIENT_SECRET ||
      "";

    if (!sdkKey || !sdkSecret) {
      return NextResponse.json(
        { error: "Zoom SDK credentials missing in server environment" },
        { status: 500 }
      );
    }

    const signature = generateZoomSDKJWT(
      sdkKey,
      sdkSecret,
      cleanMeetingNumber,
      roleNumber
    );

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
