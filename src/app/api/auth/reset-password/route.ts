import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { token, password } = result.data;

    // Find valid token in DB
    const resetTokenRecord = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(resetTokenRecord.expiresAt)) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find target user
    const user = await db.user.findUnique({
      where: { email: resetTokenRecord.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account associated with this token was not found." },
        { status: 404 }
      );
    }

    // Hash new password and update user record
    const passwordHash = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete used token
    await db.passwordResetToken.delete({
      where: { token },
    }).catch(() => {});

    console.log(`[RESET PASSWORD SUCCESS] User password reset completed for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
