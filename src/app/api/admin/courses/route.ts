import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { db } from "@/lib/db";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  order: z.number().int().default(1),
  isRequiredForAcademy: z.boolean().default(true),
  includedWithMembership: z.boolean().default(true),
  standalonePurchasable: z.boolean().default(false),
  priceInCents: z.number().int().default(4900),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const courses = await db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const course = await db.course.create({
      data: result.data,
    });

    await db.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "CREATE_COURSE",
        entityType: "Course",
        entityId: course.id,
        metadata: { title: course.title, slug: course.slug },
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
