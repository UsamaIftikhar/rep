import { NextResponse } from "next/server";
import { UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signUpSchema } from "@/lib/validation";
import { sendNewUserRegistrationEmail } from "@/lib/email";
import { createStripeCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      schoolClub,
      graduationYear,
      location,
      sport,
      position,
    } = result.data;

    const planType: "US_ATHLETE" | "INTERNATIONAL" | "COURSE" | "RECRUITER" =
      body.planType === "recruiter" || body.planType === "RECRUITER"
        ? "RECRUITER"
        : body.planType === "international" || body.planType === "INTERNATIONAL"
        ? "INTERNATIONAL"
        : body.planType === "course" || body.planType === "COURSE"
        ? "COURSE"
        : "US_ATHLETE";

    const userRole = planType === "RECRUITER" ? "RECRUITER" : (role || "ATHLETE");

    const courseId = body.courseId;

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.status === "PENDING_PAYMENT") {
        // Allow user to complete checkout if previous signup was left unpaid
        const origin = req.headers.get("origin") || "http://localhost:3000";
        const session = await createStripeCheckoutSession({
          userId: existingUser.id,
          userEmail: existingUser.email,
          type: planType,
          courseId,
          origin,
        });

        return NextResponse.json({
          success: true,
          user: existingUser,
          checkoutUrl: session.url,
          requiresPayment: true,
        });
      }

      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const fullName = `${firstName} ${lastName}`.trim();
    const slugBase = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

    // Create user in PENDING_PAYMENT status until payment is confirmed
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        name: fullName,
        role: userRole,
        status: UserStatus.PENDING_PAYMENT,
        athleteProfile: {
          create: {
            slug: uniqueSlug,
            schoolClub,
            graduationYear,
            location,
            sport,
            position,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    // Send email alert to jrmarvinconstant@gmail.com
    sendNewUserRegistrationEmail({
      name: user.name || fullName,
      email: user.email,
      role: user.role,
      firstName: user.firstName || firstName,
      lastName: user.lastName || lastName,
      sport,
      position,
      schoolClub,
      graduationYear,
      location,
    }).catch((err) => {
      console.error("Background email sending error:", err);
    });

    // Mandatory Stripe Checkout URL creation
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      type: planType,
      courseId,
      origin,
    });

    return NextResponse.json({
      success: true,
      user,
      checkoutUrl: session.url,
      requiresPayment: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}


