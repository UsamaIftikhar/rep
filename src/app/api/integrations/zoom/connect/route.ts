import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/permissions";
import { getAuthenticatedOrgId } from "@/lib/org";
import { getZoomAuthUrl } from "@/lib/integrations/zoom";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !canAccessAdminPanel(user)) {
    return NextResponse.json({ error: "Unauthorized: Only School/Super Admin can connect Zoom" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requestedOrgId = searchParams.get("org_id");

  const orgId = requestedOrgId || (await getAuthenticatedOrgId(user));
  const authUrl = getZoomAuthUrl(orgId);

  return NextResponse.redirect(authUrl);
}
