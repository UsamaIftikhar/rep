import { NextResponse } from "next/server";
import { getAuthenticatedUser, hashPassword } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";
import { EntitlementType, EntitlementSource } from "@prisma/client";

const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ATHLETE", "RECRUITER", "ADMIN", "SUPER_ADMIN"]).default("ATHLETE"),
  customRoleId: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_PAYMENT"]).default("ACTIVE"),
  grantMembership: z.boolean().default(true),
  profile: z
    .object({
      sport: z.string().nullable().optional(),
      position: z.string().nullable().optional(),
      schoolClub: z.string().nullable().optional(),
      graduationYear: z.number().nullable().optional(),
      location: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || !isAdmin(currentUser)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role,
      customRoleId,
      status,
      grantMembership,
      profile,
    } = result.data;

    // Check if user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || email.split("@")[0];

    // Create user in database
    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: fullName,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
        role,
        customRoleId: customRoleId || null,
        status,
      },
    });

    // Create AthleteProfile if role is ATHLETE/RECRUITER or profile data is provided
    const slugBase = (fullName || email.split("@")[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

    await db.athleteProfile.create({
      data: {
        userId: newUser.id,
        slug: uniqueSlug,
        sport: profile?.sport || null,
        position: profile?.position || null,
        schoolClub: profile?.schoolClub || null,
        graduationYear: profile?.graduationYear || null,
        location: profile?.location || null,
        bio: profile?.bio || null,
      },
    });

    // If grantMembership is true (or admin-handled payment), create active ACADEMY entitlement
    if (grantMembership) {
      await db.entitlement.create({
        data: {
          userId: newUser.id,
          type: EntitlementType.ACADEMY,
          source: EntitlementSource.ADMIN,
          startsAt: new Date(),
        },
      });
    }

    // Fetch complete newly created user record to return to frontend
    const createdUserRecord = await db.user.findUnique({
      where: { id: newUser.id },
      include: {
        athleteProfile: true,
        subscriptions: { where: { status: "active" } },
        entitlements: { where: { revokedAt: null } },
        purchases: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${fullName} created successfully!`,
      user: createdUserRecord,
    });
  } catch (error) {
    console.error("Error creating user from admin panel:", error);
    return NextResponse.json(
      { error: "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}
