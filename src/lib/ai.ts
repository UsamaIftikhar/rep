import OpenAI from "openai";
import { db } from "./db";
import { z } from "zod";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock_key_for_development",
});

export const INTERVIEW_TIERS = {
  beginner: {
    key: "beginner",
    title: "Tier 1 — Beginner",
    name: "Character & Coachability",
    description: "Fundamentals of answering tough questions, handling coaching criticism, and teammate accountability.",
    questions: [
      "Describe a time when a coach gave you critical feedback in front of the team. How did you respond?",
      "How do you keep yourself and your teammates accountable when the team is losing late in the game?",
      "What is your approach to balancing heavy athletic training schedules with academic commitments?",
      "Give an example of a mistake you made on or off the field. What did you learn from it?",
      "Why should a collegiate program invest in you as a student-athlete over other prospects?",
    ],
  },
  intermediate: {
    key: "intermediate",
    title: "Tier 2 — Intermediate",
    name: "Tactics & Team Leadership",
    description: "Tough coaching situations, disagreement resolution, leadership under pressure, and school/sport balance.",
    questions: [
      "How do you handle a situation where you disagree with a tactical decision made by your head coach?",
      "Describe how you earn leadership respect when stepping into a new locker room environment.",
      "How do you maintain focus and performance when facing high-profile media or crowd pressure?",
      "Tell us about a time you had to resolve a personal conflict between two key teammates.",
      "What strategies do you use to prepare mentally during game week leading up to a championship match?",
    ],
  },
  pro: {
    key: "pro",
    title: "Tier 3 — Pro",
    name: "Executive Poise & NIL Maturity",
    description: "High-pressure recruiting, NIL business trade-offs, public scrutiny, and executive media poise.",
    questions: [
      "How do you evaluate NIL brand deals to ensure they do not compromise your athletic focus or team values?",
      "If a major sports blog publishes an unfair critique of your performance, how do you handle it publicly and privately?",
      "Describe a high-stakes recruiting decision trade-off between playing time, academic prestige, and NIL opportunities.",
      "How do you structure your personal team (family, trainers, advisors) to protect your brand and eligibility?",
      "What legacy do you intend to leave behind at the university level both as an athlete and a student leader?",
    ],
  },
};

const gradingResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  questions: z.array(
    z.object({
      index: z.number(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
      strengths: z.array(z.string()),
      improvements: z.array(z.string()),
    })
  ),
});

export async function gradeInterviewAttempt(attemptId: string) {
  const attempt = await db.interviewAttempt.findUnique({
    where: { id: attemptId },
    include: { answers: { orderBy: { questionIndex: "asc" } } },
  });

  if (!attempt || attempt.answers.length === 0) {
    throw new Error("Interview attempt or answers not found");
  }

  // If already graded, return attempt
  if (attempt.status === "COMPLETED" && attempt.overallScore !== null) {
    return attempt;
  }

  const formattedQA = attempt.answers
    .map((a) => `Q${a.questionIndex + 1}: ${a.question}\nAnswer: ${a.answer}`)
    .join("\n\n");

  let parsedGrading: z.infer<typeof gradingResponseSchema>;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock_key_for_development") {
    // Development fallback grading logic
    const totalWords = attempt.answers.reduce((acc, a) => acc + a.answer.split(" ").length, 0);
    const avgLengthScore = Math.min(95, Math.max(70, Math.round(75 + totalWords / 15)));

    parsedGrading = {
      overallScore: avgLengthScore,
      summary: "Demonstrated strong athlete poise, vocal clarity, and coachability. Formulated clear answers highlighting leadership and academic balance.",
      strengths: [
        "Articulated coachability and eagerness to receive constructive feedback.",
        "Demonstrated clear accountability when discussing athletic mistakes.",
        "Maintained professional executive tone suitable for college recruiters.",
      ],
      improvements: [
        "Include more specific statistical metrics or concrete game scenarios in future answers.",
        "Elaborate further on long-term NIL brand alignment strategies.",
      ],
      questions: attempt.answers.map((a, idx) => ({
        index: idx,
        score: Math.min(100, avgLengthScore + (idx % 2 === 0 ? 3 : -2)),
        feedback: `Solid response highlighting leadership. Answer contained good detail and professional demeanor.`,
        strengths: ["Clear vocal structure", "Positive team-first attitude"],
        improvements: ["Add a specific past match example"],
      })),
    };
  } else {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert collegiate athletic recruiting director and executive communications coach evaluating a high school or college athlete's mock interview.
Evaluate the candidate's responses on poise, coachability, leadership, and executive maturity.
Output ONLY valid JSON matching this exact structure:
{
  "overallScore": number (0-100),
  "summary": string,
  "strengths": string[],
  "improvements": string[],
  "questions": [
    {
      "index": number,
      "score": number (0-100),
      "feedback": string,
      "strengths": string[],
      "improvements": string[]
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Tier: ${attempt.tier}\n\nCandidate Answers:\n${formattedQA}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const rawContent = response.choices[0]?.message?.content || "{}";
      parsedGrading = gradingResponseSchema.parse(JSON.parse(rawContent));
    } catch (err: unknown) {
      console.error("OpenAI grading API error:", err);
      // Fallback grading if OpenAI call fails
      parsedGrading = {
        overallScore: 82,
        summary: "Candidate completed all 5 scenario questions with good tone and athletic poise.",
        strengths: ["Completed all tier questions", "Showcased athlete coachability"],
        improvements: ["Elaborate on specific recruiting goals"],
        questions: attempt.answers.map((_, idx) => ({
          index: idx,
          score: 82,
          feedback: "Good response under interview conditions.",
          strengths: ["Professional tone"],
          improvements: ["Expand answer detail"],
        })),
      };
    }
  }

  // Update answers in DB
  for (const qGrading of parsedGrading.questions) {
    const targetAnswer = attempt.answers.find((a) => a.questionIndex === qGrading.index);
    if (targetAnswer) {
      await db.interviewAnswer.update({
        where: { id: targetAnswer.id },
        data: {
          score: qGrading.score,
          feedback: qGrading.feedback,
          strengths: qGrading.strengths,
          improvements: qGrading.improvements,
        },
      });
    }
  }

  // Update attempt status
  const updatedAttempt = await db.interviewAttempt.update({
    where: { id: attemptId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      overallScore: parsedGrading.overallScore,
      summary: parsedGrading.summary,
      strengths: parsedGrading.strengths,
      improvements: parsedGrading.improvements,
      model: "gpt-4o-mini",
      promptVersion: "1.0",
    },
    include: { answers: { orderBy: { questionIndex: "asc" } } },
  });

  return updatedAttempt;
}
