import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ATHLETE", "RECRUITER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
      athleteProfile: {
        select: {
          sport: true,
          position: true,
          schoolClub: true,
          graduationYear: true,
          profileCompleteness: true,
        },
      },
      subscriptions: {
        where: { status: "active" },
        select: {
          id: true,
          stripePriceId: true,
          status: true,
        },
      },
      entitlements: {
        where: {
          revokedAt: null,
        },
        select: {
          type: true,
        },
      },
      purchases: {
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid user update input" }, { status: 400 });
    }

    const { userId, role, status } = result.data;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: role ?? undefined,
        status: status ?? undefined,
      },
    });

    // Create audit log entry
    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "UPDATE_USER",
        entityType: "User",
        entityId: userId,
        metadata: { role, status },
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
