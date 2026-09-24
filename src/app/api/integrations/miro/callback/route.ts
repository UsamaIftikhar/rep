import { NextResponse } from "next/server";
import { handleMiroOAuthCallback } from "@/lib/integrations/miro";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/admin?tab=integrations&error=miro_auth_failed", req.url));
  }

  try {
    await handleMiroOAuthCallback(code, state);
    return NextResponse.redirect(new URL("/admin?tab=integrations&success=miro_connected", req.url));
  } catch (err) {
    console.error("Miro callback error:", err);
    return NextResponse.redirect(new URL("/admin?tab=integrations&error=miro_token_failed", req.url));
  }
}
