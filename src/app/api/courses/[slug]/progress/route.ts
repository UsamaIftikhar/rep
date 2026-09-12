import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { markLessonComplete } from "@/lib/courses";
import { z } from "zod";

const progressSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
});

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = progressSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    const { lessonId } = result.data;
    const progressResult = await markLessonComplete(user.id, lessonId);

    return NextResponse.json({
      success: true,
      progressPercent: progressResult.progressPercent,
      isCompleted: progressResult.isCompleted,
    });
  } catch (error) {
    console.error("Mark lesson complete error:", error);
    return NextResponse.json(
      { error: "Failed to update lesson progress" },
      { status: 500 }
    );
  }
}
