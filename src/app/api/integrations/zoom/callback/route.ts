import { NextResponse } from "next/server";
import { handleZoomOAuthCallback } from "@/lib/integrations/zoom";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/admin?tab=integrations&error=zoom_auth_failed", req.url));
  }

  try {
    await handleZoomOAuthCallback(code, state);
    return NextResponse.redirect(new URL("/admin?tab=integrations&success=zoom_connected", req.url));
  } catch (err) {
    console.error("Zoom callback error:", err);
    return NextResponse.redirect(new URL("/admin?tab=integrations&error=zoom_token_failed", req.url));
  }
}
