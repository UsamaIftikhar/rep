import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Company Zoom integration
    const zoom =
      (await db.zoomIntegration.findFirst({
        where: { isActive: true },
        orderBy: { connectedAt: "desc" },
      })) ||
      (await db.zoomIntegration.findFirst({
        orderBy: { connectedAt: "desc" },
      }));

    // Company Miro integration
    const miro =
      (await db.miroIntegration.findFirst({
        where: { isActive: true },
        orderBy: { connectedAt: "desc" },
      })) ||
      (await db.miroIntegration.findFirst({
        orderBy: { connectedAt: "desc" },
      }));

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    return NextResponse.json({
      zoom: {
        connected: !!zoom,
        isActive: !!zoom?.isActive,
        connectedAt: zoom?.connectedAt || null,
        accountEmail: "usama@rep1recruiting.com",
        serviceName: "REP 1 Live Strategy Session & Meeting SDK",
      },
      miro: {
        connected: !!miro,
        isActive: !!miro?.isActive,
        connectedAt: miro?.connectedAt || null,
        teamId: miro?.miroTeamId || null,
        serviceName: "REP 1 Interactive Whiteboard Canvas",
      },
      isAdmin,
    });
  } catch (error: any) {
    console.error("[INTEGRATIONS_STATUS_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch integrations status" },
      { status: 500 }
    );
  }
}
