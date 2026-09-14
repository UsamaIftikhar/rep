import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const email = result.data.email.toLowerCase().trim();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, firstName: true },
    });

    // Always return success message even if user doesn't exist (to prevent email enumeration)
    if (user) {
      // Delete existing reset tokens for this email
      await db.passwordResetToken.deleteMany({
        where: { email },
      });

      // Generate random secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      await db.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      const name = user.name || user.firstName || "Athlete";

      // Send reset email asynchronously
      await sendPasswordResetEmail({
        email: user.email,
        name,
        resetUrl,
      });

      console.log(`[FORGOT PASSWORD] Reset token generated for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email address, password reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
