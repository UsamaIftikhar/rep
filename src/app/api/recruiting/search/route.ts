import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const sport = searchParams.get("sport") || "";
  const graduationYear = searchParams.get("graduationYear");
  const location = searchParams.get("location") || "";
  const position = searchParams.get("position") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "12", 10));
  const skip = (page - 1) * limit;

  const where: Prisma.AthleteProfileWhereInput = {
    profileVisibility: true,
  };

  if (q.trim()) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { firstName: { contains: q, mode: "insensitive" } } },
      { user: { lastName: { contains: q, mode: "insensitive" } } },
      { schoolClub: { contains: q, mode: "insensitive" } },
      { sport: { contains: q, mode: "insensitive" } },
      { position: { contains: q, mode: "insensitive" } },
    ];
  }

  if (sport) {
    where.sport = { equals: sport, mode: "insensitive" };
  }

  if (graduationYear) {
    const year = parseInt(graduationYear, 10);
    if (!isNaN(year)) {
      where.graduationYear = year;
    }
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (position) {
    where.position = { contains: position, mode: "insensitive" };
  }

  const [athletes, total] = await Promise.all([
    db.athleteProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        schoolClub: true,
        graduationYear: true,
        location: true,
        sport: true,
        position: true,
        bio: true,
        profilePhoto: true,
        profileCompleteness: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            image: true,
            badges: {
              select: {
                badge: {
                  select: {
                    title: true,
                    key: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.athleteProfile.count({ where }),
  ]);

  return NextResponse.json({
    athletes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}
