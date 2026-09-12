import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { signUpSchema } from "@/lib/validation";

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

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const fullName = `${firstName} ${lastName}`.trim();
    const slugBase = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        name: fullName,
        role,
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
      },
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
