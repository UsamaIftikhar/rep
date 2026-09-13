import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCourseBySlug, enrollInCourse } from "@/lib/courses";
import { canAccessCourse } from "@/lib/entitlements";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await getAuthenticatedUser();

  const course = await getCourseBySlug(slug, user?.id);

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Check entitlement if user is logged in
  if (!user) {
    return NextResponse.json({
      course: {
        ...course,
        lessons: course.lessons.map((l) => ({ ...l, content: "" })),
      },
      hasAccess: false,
      isLocked: true,
    });
  }

  const hasAccess = await canAccessCourse(user.id, course.id);
  if (!hasAccess) {
    return NextResponse.json({
      course: {
        ...course,
        lessons: course.lessons.map((l) => ({ ...l, content: "" })),
      },
      hasAccess: false,
      isLocked: true,
    });
  }

  // Auto-enroll user if not enrolled yet
  if (!course.userEnrollment) {
    await enrollInCourse(user.id, course.id, "MEMBERSHIP");
  }

  return NextResponse.json({ course, hasAccess: true, isLocked: false });
}
