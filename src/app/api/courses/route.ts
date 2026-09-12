import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCoursesWithUserProgress } from "@/lib/courses";

export async function GET() {
  const user = await getAuthenticatedUser();
  const courses = await getCoursesWithUserProgress(user?.id);

  const completedAcademyCount = courses.filter(
    (c) => c.isRequiredForAcademy && c.status === "COMPLETED"
  ).length;
  const totalAcademyCount = courses.filter((c) => c.isRequiredForAcademy).length;

  return NextResponse.json({
    courses,
    summary: {
      completedAcademyCount,
      totalAcademyCount: totalAcademyCount || 6,
    },
  });
}
