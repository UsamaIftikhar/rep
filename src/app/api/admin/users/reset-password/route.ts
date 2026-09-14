import { NextResponse } from "next/server";
import { getAuthenticatedUser, hashPassword } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const adminResetPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  newPassword: z.string().min(6, "Password must be at least 6 characters long."),
});

export async function POST(req: Request) {
  const adminUser = await getAuthenticatedUser();
  if (!adminUser || !isAdmin(adminUser)) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = adminResetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { userId, newPassword } = result.data;

    // Check target user
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Clean up any pending reset tokens for this user's email
    await db.passwordResetToken.deleteMany({
      where: { email: targetUser.email },
    }).catch(() => {});

    // Create Audit Log
    await db.auditLog.create({
      data: {
        actorUserId: adminUser.id,
        action: "ADMIN_RESET_USER_PASSWORD",
        entityType: "User",
        entityId: userId,
        metadata: {
          targetEmail: targetUser.email,
          resetByAdminId: adminUser.id,
        },
      },
    }).catch(() => {});

    console.log(`[ADMIN RESET PASSWORD] Admin ${adminUser.email} reset password for user ${targetUser.email}`);

    return NextResponse.json({
      success: true,
      message: `Password successfully updated for ${targetUser.name || targetUser.email}.`,
    });
  } catch (error) {
    console.error("Admin password reset error:", error);
    return NextResponse.json({ error: "Failed to reset user password." }, { status: 500 });
  }
}
