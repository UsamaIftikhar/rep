import { db } from "./db";
import { EnrollmentStatus, EnrollmentSource } from "@prisma/client";

export async function getCoursesWithUserProgress(userId?: string | null) {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      slug: { notIn: ["diagnostic-report", "system-audit"] },
    },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: { id: true, title: true, slug: true, estimatedMinutes: true, order: true },
      },
    },
  });

  if (!userId) {
    return courses.map((c) => ({
      ...c,
      status: "NOT_STARTED" as EnrollmentStatus,
      progressPercent: 0,
      completedLessonsCount: 0,
      totalLessonsCount: c.lessons.length,
    }));
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId },
  });

  const lessonProgresses = await db.lessonProgress.findMany({
    where: { userId, completed: true },
  });

  const completedLessonIds = new Set(lessonProgresses.map((lp) => lp.lessonId));
  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

  return courses.map((c) => {
    const enrollment = enrollmentMap.get(c.id);
    const completedCount = c.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const totalCount = c.lessons.length;
    const calculatedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let status: EnrollmentStatus = "NOT_STARTED";
    if (enrollment) {
      status = enrollment.status;
    } else if (completedCount > 0) {
      status = completedCount === totalCount ? "COMPLETED" : "IN_PROGRESS";
    }

    return {
      ...c,
      status,
      progressPercent: enrollment?.progressPercent ?? calculatedPercent,
      completedLessonsCount: completedCount,
      totalLessonsCount: totalCount,
      enrolledAt: enrollment?.enrolledAt || null,
    };
  });
}

export async function getCourseBySlug(slug: string, userId?: string | null) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course || !course.isPublished) return null;

  if (!userId) {
    return {
      ...course,
      userEnrollment: null,
      completedLessonIds: [] as string[],
      progressPercent: 0,
    };
  }

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  });

  const lessonProgresses = await db.lessonProgress.findMany({
    where: {
      userId,
      lessonId: { in: course.lessons.map((l) => l.id) },
      completed: true,
    },
  });

  const completedLessonIds = lessonProgresses.map((lp) => lp.lessonId);
  const total = course.lessons.length;
  const progressPercent = total > 0 ? Math.round((completedLessonIds.length / total) * 100) : 0;

  return {
    ...course,
    userEnrollment: enrollment,
    completedLessonIds,
    progressPercent,
  };
}

export async function enrollInCourse(
  userId: string,
  courseId: string,
  source: EnrollmentSource = "MEMBERSHIP"
) {
  return db.enrollment.upsert({
    where: {
      userId_courseId: { userId, courseId },
    },
    update: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
    create: {
      userId,
      courseId,
      status: "IN_PROGRESS",
      source,
      startedAt: new Date(),
    },
  });
}

export async function markLessonComplete(
  userId: string,
  lessonId: string,
  quizScore?: number | null,
  quizAnswers?: any
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { course: { include: { lessons: true } } },
  });

  if (!lesson) throw new Error("Lesson not found");

  // Upsert lesson progress
  const lp = await db.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      completed: true,
      ...(quizScore !== undefined ? { quizScore } : {}),
      ...(quizAnswers !== undefined ? { quizAnswers } : {}),
      completedAt: new Date(),
      lastViewedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      completed: true,
      quizScore: quizScore ?? null,
      quizAnswers: quizAnswers ?? null,
      completedAt: new Date(),
      lastViewedAt: new Date(),
    },
  });

  // Calculate course progress
  const courseLessons = lesson.course.lessons.map((l) => l.id);
  const completedCount = await db.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: courseLessons },
      completed: true,
    },
  });

  const totalLessons = courseLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = progressPercent === 100;

  await db.enrollment.upsert({
    where: {
      userId_courseId: { userId, courseId: lesson.courseId },
    },
    update: {
      progressPercent,
      status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      ...(isCompleted ? { completedAt: new Date() } : {}),
    },
    create: {
      userId,
      courseId: lesson.courseId,
      progressPercent,
      status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      ...(isCompleted ? { completedAt: new Date() } : {}),
    },
  });

  if (isCompleted) {
    await checkAndAwardAcademyBadge(userId);
  }

  return { lessonProgress: lp, progressPercent, isCompleted };
}

export async function checkAndAwardAcademyBadge(userId: string) {
  // Find all required academy courses
  const requiredCourses = await db.course.findMany({
    where: { isPublished: true, isRequiredForAcademy: true },
    select: { id: true },
  });

  if (requiredCourses.length === 0) return false;

  const requiredIds = requiredCourses.map((c) => c.id);

  // Check completed enrollments
  const completedEnrollmentsCount = await db.enrollment.count({
    where: {
      userId,
      courseId: { in: requiredIds },
      status: "COMPLETED",
    },
  });

  if (completedEnrollmentsCount >= requiredIds.length) {
    const badge = await db.badge.findUnique({
      where: { key: "ACADEMY_GRADUATE" },
    });

    if (badge) {
      await db.userBadge.upsert({
        where: {
          userId_badgeId: { userId, badgeId: badge.id },
        },
        update: {},
        create: {
          userId,
          badgeId: badge.id,
          source: "AUTOMATIC_ACADEMY_COMPLETION",
        },
      });
      return true;
    }
  }

  return false;
}
