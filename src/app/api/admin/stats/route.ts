import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const [totalUsers, activeMemberships, courseEnrollments, interviewAttempts] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { status: "active" } }),
    db.enrollment.count(),
    db.interviewAttempt.count(),
  ]);

  return NextResponse.json({
    stats: {
      totalUsers,
      activeMemberships,
      courseEnrollments,
      interviewAttempts,
    },
  });
}
