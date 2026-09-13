import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const evalSchema = z.object({
  athleteProfileId: z.string().min(1),
  adminNotes: z.string().nullable().optional(),
  ratingSpeed: z.number().min(0).max(5).nullable().optional(),
  ratingExplosiveness: z.number().min(0).max(5).nullable().optional(),
  ratingAgility: z.number().min(0).max(5).nullable().optional(),
  ratingStrength: z.number().min(0).max(5).nullable().optional(),
  ratingToughness: z.number().min(0).max(5).nullable().optional(),
  ratingProduction: z.number().min(0).max(5).nullable().optional(),
  ratingTechnique: z.number().min(0).max(5).nullable().optional(),
});

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = evalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid evaluation input", details: result.error.format() },
        { status: 400 }
      );
    }

    const { athleteProfileId, ...evalData } = result.data;

    const updatedProfile = await db.athleteProfile.update({
      where: { id: athleteProfileId },
      data: evalData,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Evaluation update error:", error);
    return NextResponse.json({ error: "Failed to update staff evaluation" }, { status: 500 });
  }
}
