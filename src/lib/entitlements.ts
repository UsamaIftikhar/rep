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
    select: { id: true, includedWithMembership: true, standalonePurchasable: true },
  });

  if (!course) return false;

  // Active subscription or Full Access Membership entitlement unlocks all courses
  const hasSub = user.subscriptions.length > 0;
  const hasFullMembership = user.entitlements.some(
    (e) => e.type === "ACADEMY" || e.type === "ELITE_PACIFIC"
  );

  if (hasSub || hasFullMembership) {
    return true;
  }

  // Check explicit single course purchase or course entitlement
  const hasPurchased = user.purchases.some((p) => p.courseId === courseId);
  const hasCourseEntitlement = user.entitlements.some(
    (e) => e.type === "COURSE" && e.referenceId === courseId
  );

  return hasPurchased || hasCourseEntitlement;
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

export async function isMember(userId: string): Promise<boolean> {
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
        take: 1,
      },
      entitlements: {
        where: {
          revokedAt: null,
          OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
        },
        take: 1,
      },
    },
  });

  if (!user) return false;

  if (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.SUPER_ADMIN ||
    user.role === UserRole.RECRUITER
  ) {
    return true;
  }

  return (
    user.subscriptions.length > 0 ||
    user.purchases.length > 0 ||
    user.entitlements.length > 0
  );
}

export async function canAccessCoachesAcademy(userId: string): Promise<{
  allowed: boolean;
  isPresenter: boolean;
  reason?: string;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      subscriptions: {
        where: { status: "active" },
      },
      entitlements: {
        where: {
          revokedAt: null,
          OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
        },
      },
    },
  });

  if (!user) {
    return { allowed: false, isPresenter: false, reason: "User not found" };
  }

  // Presenter check: Marvin, Terry, Darius, Super Admin, Admin
  const isPresenter =
    user.role === UserRole.SUPER_ADMIN ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.COACHES_ACADEMY_PRESENTER ||
    [
      "marvin@rep1recruiting.com",
      "terry@rep1recruiting.com",
      "darius@rep1recruiting.com",
      "usama@rep1recruiting.com",
    ].includes(user.email.toLowerCase());

  if (isPresenter) {
    return { allowed: true, isPresenter: true };
  }

  // Coaches Academy Member check
  const isDirectMember = user.role === UserRole.COACHES_ACADEMY_MEMBER;
  const hasEntitlement = user.entitlements.some((e) => e.type === "COACHES_ACADEMY");
  const hasActiveSub = user.subscriptions.length > 0;

  if (isDirectMember || hasEntitlement || hasActiveSub) {
    return { allowed: true, isPresenter: false };
  }

  return { allowed: false, isPresenter: false, reason: "Requires active REP 1 Coaches Academy Membership" };
}

