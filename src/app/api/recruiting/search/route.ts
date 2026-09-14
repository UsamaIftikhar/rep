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
  const level = searchParams.get("level") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "12", 10));
  const skip = (page - 1) * limit;

  const where: Prisma.AthleteProfileWhereInput = {
    profileVisibility: true,
  };

  if (q.trim()) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" as const } } },
      { user: { firstName: { contains: q, mode: "insensitive" as const } } },
      { user: { lastName: { contains: q, mode: "insensitive" as const } } },
      { schoolClub: { contains: q, mode: "insensitive" as const } },
      { sport: { contains: q, mode: "insensitive" as const } },
      { position: { contains: q, mode: "insensitive" as const } },
    ];
  }

  if (sport) {
    where.sport = { equals: sport, mode: "insensitive" as const };
  }

  if (graduationYear) {
    const year = parseInt(graduationYear, 10);
    if (!isNaN(year)) {
      where.graduationYear = year;
    }
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" as const };
  }

  if (position) {
    where.position = { contains: position, mode: "insensitive" as const };
  }

  if (level) {
    const levelKeywords: Record<string, string[]> = {
      power_4: ["power_4", "power 4", "power4", "p4", "sec", "big ten", "big 12", "acc"],
      division_1: ["division_1", "division 1", "division i", "d1", "fbs", "fcs"],
      division_2: ["division_2", "division 2", "division ii", "d2"],
      division_3: ["division_3", "division 3", "division iii", "d3"],
      juco: ["juco", "junior college", "njcaa"],
      hbcu: ["hbcu", "swac", "meac"],
      naia: ["naia"],
    };

    const keywords = levelKeywords[level] || [level];
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        OR: [
          { potentialDivision: { equals: level, mode: "insensitive" as const } },
          ...keywords.flatMap((kw) => [
            { schoolClub: { contains: kw, mode: "insensitive" as const } },
            { bio: { contains: kw, mode: "insensitive" as const } },
            { adminNotes: { contains: kw, mode: "insensitive" as const } },
            { potentialDivision: { contains: kw, mode: "insensitive" as const } },
          ]),
        ],
      },
    ];
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
        potentialDivision: true,
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
