import { NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { signInSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === UserStatus.PENDING_PAYMENT) {
      const origin = req.headers.get("origin") || "http://localhost:3000";
      const { createStripeCheckoutSession } = await import("@/lib/stripe");
      const session = await createStripeCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        type: "US_ATHLETE",
        origin,
      });

      return NextResponse.json(
        {
          error: "Payment required: Your account registration is incomplete. You must complete your membership payment to activate your account.",
          requiresPayment: true,
          checkoutUrl: session.url,
        },
        { status: 402 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is currently suspended or inactive. Please contact support." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in" },
      { status: 500 }
    );
  }
}
