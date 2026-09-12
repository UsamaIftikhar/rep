import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { INTERVIEW_TIERS, gradeInterviewAttempt } from "@/lib/ai";
import { z } from "zod";

const startSchema = z.object({
  tier: z.enum(["beginner", "intermediate", "pro"]),
});

const answerSchema = z.object({
  attemptId: z.string().min(1),
  questionIndex: z.number().int().min(0).max(4),
  question: z.string().min(1),
  answer: z.string().min(1, "Please provide an answer before moving forward"),
});

const submitSchema = z.object({
  attemptId: z.string().min(1),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attempts = await db.interviewAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { answers: { orderBy: { questionIndex: "asc" } } },
  });

  return NextResponse.json({ attempts });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "start") {
      const result = startSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: "Invalid tier selection" }, { status: 400 });
      }

      const { tier } = result.data;
      const tierDef = INTERVIEW_TIERS[tier as keyof typeof INTERVIEW_TIERS];

      const attempt = await db.interviewAttempt.create({
        data: {
          userId: user.id,
          tier,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      return NextResponse.json({
        attemptId: attempt.id,
        tier: tierDef.title,
        questions: tierDef.questions,
      });
    }

    if (action === "answer") {
      const result = answerSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: "Invalid answer data" }, { status: 400 });
      }

      const { attemptId, questionIndex, question, answer } = result.data;

      // Ownership check
      const attempt = await db.interviewAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!attempt || attempt.userId !== user.id) {
        return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 403 });
      }

      const savedAnswer = await db.interviewAnswer.upsert({
        where: { attemptId_questionIndex: { attemptId, questionIndex } },
        update: { answer },
        create: { attemptId, questionIndex, question, answer },
      });

      return NextResponse.json({ success: true, answer: savedAnswer });
    }

    if (action === "submit") {
      const result = submitSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
      }

      const { attemptId } = result.data;
      const attempt = await db.interviewAttempt.findUnique({
        where: { id: attemptId },
      });

      if (!attempt || attempt.userId !== user.id) {
        return NextResponse.json({ error: "Attempt not found or unauthorized" }, { status: 403 });
      }

      const gradedAttempt = await gradeInterviewAttempt(attemptId);
      return NextResponse.json({ success: true, attempt: gradedAttempt });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json({ error: "Interview workflow error" }, { status: 500 });
  }
}
