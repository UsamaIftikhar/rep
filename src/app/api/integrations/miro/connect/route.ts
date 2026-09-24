import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/permissions";
import { getAuthenticatedOrgId } from "@/lib/org";
import { getMiroAuthUrl } from "@/lib/integrations/miro";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !canAccessAdminPanel(user)) {
    return NextResponse.json({ error: "Unauthorized: Only School/Super Admin can connect Miro" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requestedOrgId = searchParams.get("org_id");

  const orgId = requestedOrgId || (await getAuthenticatedOrgId(user));
  const authUrl = getMiroAuthUrl(orgId);

  return NextResponse.redirect(authUrl);
}
