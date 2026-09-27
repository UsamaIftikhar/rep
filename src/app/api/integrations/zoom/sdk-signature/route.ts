import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * Generates an HMAC-SHA256 JWT signature for Zoom Meeting SDK for Web.
 * Required claims per Zoom Meeting SDK specification:
 * - appKey: SDK Key / General App Client ID
 * - sdkKey: SDK Key / General App Client ID
 * - mn: Clean meeting number (numeric string)
 * - role: 0 (Attendee) or 1 (Host)
 * - iat: Timestamp of token issuance (epoch seconds)
 * - exp: Expiration time (epoch seconds)
 * - tokenExp: Token expiration time (epoch seconds)
 */
function generateZoomSDKJWT(
  sdkKey: string,
  sdkSecret: string,
  meetingNumber: string,
  role: number
): string {
  // Issued 30 seconds in the past to guard against client/server clock skew
  const iat = Math.floor(Date.now() / 1000) - 30;
  // Valid for 2 hours
  const exp = iat + 60 * 60 * 2;
  const tokenExp = exp;

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

    const isAllowed =
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN" ||
      user.role === "RECRUITER" ||
      user.email === "usama@rep1recruiting.com" ||
      user.email === "student@rep1recruiting.com";

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Access denied during testing phase" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { meetingNumber, role = 0 } = body;

    if (!meetingNumber) {
      return NextResponse.json(
        { error: "meetingNumber is required" },
        { status: 400 }
      );
    }

    const cleanMeetingNumber = String(meetingNumber).replace(/[^0-9]/g, "");
    if (!cleanMeetingNumber || cleanMeetingNumber.length < 9 || cleanMeetingNumber.length > 11) {
      return NextResponse.json(
        { error: "Invalid meeting number. Zoom meeting numbers must be 9 to 11 digits." },
        { status: 400 }
      );
    }

    // Role validation:
    // Only verified platform administrators may request role = 1 (host).
    // For standard participants/athletes, strictly enforce role = 0.
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const requestedRole = Number(role);
    const roleNumber = isAdmin && requestedRole === 1 ? 1 : 0;

    // Retrieve Zoom General App Meeting SDK credentials
    const sdkKey = process.env.ZOOM_SDK_KEY || process.env.ZOOM_CLIENT_ID || "";
    const sdkSecret = process.env.ZOOM_SDK_SECRET || process.env.ZOOM_CLIENT_SECRET || "";

    if (!sdkKey || !sdkSecret) {
      return NextResponse.json(
        {
          error:
            "Zoom Meeting SDK credentials missing in server environment. Ensure ZOOM_SDK_KEY and ZOOM_SDK_SECRET are set.",
        },
        { status: 500 }
      );
    }

    const signature = generateZoomSDKJWT(
      sdkKey,
      sdkSecret,
      cleanMeetingNumber,
      roleNumber
    );

    // Return the generated signature and the public SDK Key (Client ID).
    // Note: The SDK Secret is never exposed to the client.
    return NextResponse.json({
      signature,
      sdkKey,
      role: roleNumber,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    // Log safe error summary without exposing secrets
    console.error("[ZOOM_SDK_SIGNATURE_ERROR]", errMessage);
    return NextResponse.json(
      { error: errMessage || "Failed to generate Zoom Meeting SDK signature" },
      { status: 500 }
    );
  }
}
