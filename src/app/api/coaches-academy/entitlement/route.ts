import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { canAccessCoachesAcademy } from "@/lib/entitlements";
import { isCoachesAcademyPresenter } from "@/lib/permissions";

// GET /api/coaches-academy/entitlement - Check user access status
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        allowed: false,
        isPresenter: false,
      });
    }

    const access = await canAccessCoachesAcademy(user.id);
    const isPresenter = isCoachesAcademyPresenter(user as any);

    const activeEntitlement = await db.entitlement.findFirst({
      where: {
        userId: user.id,
        type: "COACHES_ACADEMY",
        revokedAt: null,
        OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      authenticated: true,
      allowed: access.allowed,
      isPresenter: isPresenter || access.isPresenter,
      entitlement: activeEntitlement || null,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_ENTITLEMENT_GET]", error);
    return NextResponse.json(
      { error: error.message || "Failed to check entitlement" },
      { status: 500 }
    );
  }
}

// POST /api/coaches-academy/entitlement - Activate annual Coaches Academy membership
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Grant 1-year annual entitlement
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const entitlement = await db.entitlement.create({
      data: {
        userId: user.id,
        type: "COACHES_ACADEMY",
        source: "SUBSCRIPTION",
        sourceReferenceId: `coach_annual_${Date.now()}`,
        startsAt: new Date(),
        endsAt: oneYearLater,
      },
    });

    // Also update role if they are regular user
    if (user.role === "ATHLETE") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "COACHES_ACADEMY_MEMBER" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "REP 1 Coaches Academy Annual Membership activated!",
      entitlement,
    });
  } catch (error: any) {
    console.error("[COACHES_ACADEMY_ENTITLEMENT_POST]", error);
    return NextResponse.json(
      { error: error.message || "Failed to activate entitlement" },
      { status: 500 }
    );
  }
}
