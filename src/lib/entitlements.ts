import { db } from "./db";
import { UserRole } from "@prisma/client";

export async function getUserRoleAndSubscription(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      subscriptions: {
        where: { status: "active" },
        take: 1,
      },
      purchases: {
        where: { status: "completed" },
      },
      entitlements: {
        where: {
          revokedAt: null,
          OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
        },
      },
    },
  });

  return user;
}

export async function canAccessAcademy(userId: string): Promise<boolean> {
  const user = await getUserRoleAndSubscription(userId);
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  return true;
}

export async function canAccessCourse(userId: string, courseId: string): Promise<boolean> {
  const user = await getUserRoleAndSubscription(userId);
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { includedWithMembership: true, standalonePurchasable: true },
  });

  if (!course) return false;

  // Membership included
  if (course.includedWithMembership) {
    return true;
  }

  // Check explicit course purchase or entitlement
  const hasPurchased = user.purchases.some((p) => p.courseId === courseId);
  const hasEntitlement = user.entitlements.some(
    (e) => e.type === "COURSE" && e.referenceId === courseId
  );

  return hasPurchased || hasEntitlement;
}

export async function canAccessElitePacific(userId: string): Promise<boolean> {
  const user = await getUserRoleAndSubscription(userId);
  if (!user) return false;

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  const hasEntitlement = user.entitlements.some((e) => e.type === "ELITE_PACIFIC");
  const hasSub = user.subscriptions.length > 0;

  return hasEntitlement || hasSub;
}

export async function canUseInterviewTier(userId: string): Promise<boolean> {
  const user = await getUserRoleAndSubscription(userId);
  if (!user) return false;
  return true;
}
