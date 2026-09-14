import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ATHLETE", "RECRUITER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_PAYMENT"]).optional(),
  profile: z
    .object({
      sport: z.string().nullable().optional(),
      position: z.string().nullable().optional(),
      schoolClub: z.string().nullable().optional(),
      graduationYear: z.number().nullable().optional(),
      location: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      profilePhoto: z.string().nullable().optional(),
      xUrl: z.string().nullable().optional(),
      benchPress: z.string().nullable().optional(),
      squat: z.string().nullable().optional(),
      powerClean: z.string().nullable().optional(),
      fortyTime: z.string().nullable().optional(),
      vertical: z.string().nullable().optional(),
      shuttleTime: z.string().nullable().optional(),
      broadJump: z.string().nullable().optional(),
      gpa: z.string().nullable().optional(),
      highlightVideoUrl: z.string().nullable().optional(),

      // Staff Evaluation & Ratings (1 to 5)
      adminNotes: z.string().nullable().optional(),
      potentialDivision: z.string().nullable().optional(),
      ratingSpeed: z.number().min(0).max(5).nullable().optional(),
      ratingExplosiveness: z.number().min(0).max(5).nullable().optional(),
      ratingAgility: z.number().min(0).max(5).nullable().optional(),
      ratingStrength: z.number().min(0).max(5).nullable().optional(),
      ratingToughness: z.number().min(0).max(5).nullable().optional(),
      ratingProduction: z.number().min(0).max(5).nullable().optional(),
      ratingTechnique: z.number().min(0).max(5).nullable().optional(),
    })
    .optional(),
});

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
      athleteProfile: true,
      subscriptions: {
        where: { status: "active" },
        select: {
          id: true,
          stripePriceId: true,
          status: true,
        },
      },
      entitlements: {
        where: {
          revokedAt: null,
        },
        select: {
          type: true,
        },
      },
      purchases: {
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid user update input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { userId, email, firstName, lastName, role, status, profile } = result.data;

    // Update User record
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        email: email ?? undefined,
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        name:
          firstName || lastName
            ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
            : undefined,
        role: role ?? undefined,
        status: status ?? undefined,
        image: profile?.profilePhoto !== undefined ? profile.profilePhoto : undefined,
      },
    });

    // Update or Upsert AthleteProfile if profile data provided
    if (profile) {
      const slugBase = (
        updatedUser.name ||
        updatedUser.email.split("@")[0]
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      const existingProfile = await db.athleteProfile.findUnique({
        where: { userId },
      });

      const uniqueSlug = existingProfile
        ? existingProfile.slug
        : `${slugBase}-${Date.now().toString(36)}`;

      await db.athleteProfile.upsert({
        where: { userId },
        create: {
          userId,
          slug: uniqueSlug,
          ...profile,
        },
        update: {
          ...profile,
        },
      });
    }

    // Return complete updated user
    const fullUser = await db.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: true,
      },
    });

    return NextResponse.json({ success: true, user: fullUser });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user details" }, { status: 500 });
  }
}
