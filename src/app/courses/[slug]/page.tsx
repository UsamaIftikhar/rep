"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, BookOpen, Clock, Loader2, Award, Menu, X } from "lucide-react";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  estimatedMinutes?: number | null;
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  lessons: LessonData[];
  completedLessonIds: string[];
  progressPercent: number;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = React.useState<CourseData | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = React.useState(0);
  const [completedLessonIds, setCompletedLessonIds] = React.useState<string[]>([]);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [completing, setCompleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;

    fetch(`/api/courses/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("Entitlement required to access this course.");
          throw new Error("Course not found.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          setCompletedLessonIds(data.course.completedLessonIds || []);
          setProgressPercent(data.course.progressPercent || 0);

          // Find first uncompleted lesson index or default to 0
          const firstUncompleted = data.course.lessons.findIndex(
            (l: LessonData) => !data.course.completedLessonIds.includes(l.id)
          );
          if (firstUncompleted !== -1) {
            setActiveLessonIndex(firstUncompleted);
          }
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 flex flex-col items-center justify-center text-[#A3A3A3]">
          <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mb-2" />
          <p className="text-xs uppercase tracking-widest font-semibold">Loading Course Curriculum...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !course) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-800/50 flex items-center justify-center text-[#F21717] mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-display uppercase text-3xl font-black text-white">Course Unavailable</h2>
          <p className="text-xs text-[#A3A3A3]">{error || "Unable to load requested course lessons."}</p>
          <Link href="/academy">
            <Button variant="athletic" size="md">Return to Student Academy</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const currentLesson = course.lessons[activeLessonIndex] || course.lessons[0];
  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);
  const isLastLesson = activeLessonIndex === course.lessons.length - 1;
  const isCourseFullyCompleted = progressPercent === 100;

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setCompleting(true);

    try {
      const res = await fetch(`/api/courses/${slug}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id }),
      });

      const data = await res.json();
      if (data.success) {
        if (!completedLessonIds.includes(currentLesson.id)) {
          setCompletedLessonIds((prev) => [...prev, currentLesson.id]);
        }
        if (data.progressPercent !== undefined) {
          setProgressPercent(data.progressPercent);
        }

        // Auto-advance to next lesson if available
        if (!isLastLesson) {
          setActiveLessonIndex((prev) => prev + 1);
        }
      }
    } catch {
      // Ignore network failure
    } finally {
      setCompleting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-16">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <Link href="/academy" className="inline-flex items-center gap-1 text-xs text-[#A3A3A3] hover:text-white mb-2 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Student Academy
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#F21717]/20 text-[#F21717] border border-[#F21717]/40">
                {course.category}
              </span>
              <span className="text-xs text-[#A3A3A3]">
                Lesson {activeLessonIndex + 1} of {course.lessons.length}
              </span>
            </div>
            <h1 className="font-display uppercase text-2xl md:text-3xl font-black text-white">
              {course.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-48 bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#F21717] h-full transition-all duration-300 shadow-[0_0_10px_rgba(242,23,23,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-display font-bold text-sm text-white">{progressPercent}%</span>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Course Reader Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Lesson Outline Navigation */}
          <div className={`md:block space-y-3 ${mobileMenuOpen ? "block" : "hidden"}`}>
            <h3 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">
              Syllabus Outline
            </h3>
            <div className="space-y-1">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex;
                const isCompleted = completedLessonIds.includes(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#F21717] text-white font-bold shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                        : "bg-[#111111] hover:bg-white/5 text-[#A3A3A3] hover:text-white border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                      <span className="text-[10px] opacity-70 flex-shrink-0">{idx + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-emerald-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {isCourseFullyCompleted && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-2">
                <Award className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-200 uppercase">Course Completed!</p>
                <p className="text-[11px] text-emerald-400/80">You earned progress towards your Academy Badge.</p>
              </div>
            )}
          </div>

          {/* Main Reading Pane */}
          <div className="md:col-span-3 space-y-6">
            <Card className="bg-[#111111] border-white/10">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#F21717] uppercase tracking-wider">
                      LESSON {activeLessonIndex + 1}
                    </span>
                    <h2 className="font-display uppercase text-2xl font-black text-white mt-1">
                      {currentLesson.title}
                    </h2>
                  </div>
                  {currentLesson.estimatedMinutes && (
                    <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-[#F21717]" />
                      <span>{currentLesson.estimatedMinutes} min read</span>
                    </div>
                  )}
                </div>

                {/* Lesson Interactive Documentation Renderer */}
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[#D4D4D4] space-y-5">
                  {currentLesson.content.split("\n\n").map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Divider ---
                    if (trimmed === "---") {
                      return <hr key={pIdx} className="border-white/10 my-6" />;
                    }

                    // Main Header #
                    if (trimmed.startsWith("# ")) {
                      return (
                        <h1 key={pIdx} className="font-display uppercase text-2xl md:text-3xl font-black text-white pt-2 pb-2 border-b border-white/10 flex items-center gap-2">
                          <span className="w-2.5 h-6 bg-[#F21717] rounded-sm inline-block" />
                          {trimmed.replace(/^#\s+/, "")}
                        </h1>
                      );
                    }

                    // Section Header ##
                    if (trimmed.startsWith("## ")) {
                      return (
                        <h2 key={pIdx} className="font-display uppercase text-xl font-bold text-white pt-4 pb-1 border-b border-white/5 text-[#F5F5F5]">
                          {trimmed.replace(/^##\s+/, "")}
                        </h2>
                      );
                    }

                    // Subsection Header ###
                    if (trimmed.startsWith("### ")) {
                      return (
                        <h3 key={pIdx} className="font-display uppercase text-base font-bold text-[#F21717] pt-2">
                          {trimmed.replace(/^###\s+/, "")}
                        </h3>
                      );
                    }

                    // Quote / Key Takeaway Callout Box >
                    if (trimmed.startsWith("> ")) {
                      return (
                        <div key={pIdx} className="p-4 my-4 rounded-xl bg-[#171717] border-l-4 border-[#F21717] shadow-lg space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F21717]">Key Takeaway & Rule</span>
                          <p className="text-sm font-medium text-white italic">
                            {trimmed.replace(/^>\s+/, "").replace(/"/g, "")}
                          </p>
                        </div>
                      );
                    }

                    // Bulleted Points List (- or * or 1.)
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
                      const items = trimmed.split("\n").filter(Boolean);
                      return (
                        <div key={pIdx} className="bg-[#141414] p-4 rounded-xl border border-white/10 space-y-2.5 my-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">Action Items & Points</span>
                          <ul className="space-y-2">
                            {items.map((rawItem, itemIdx) => {
                              const cleanItem = rawItem.replace(/^[-*]|\d+\.\s*/, "").trim();
                              return (
                                <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-[#E5E5E5] group">
                                  <div className="w-4 h-4 rounded bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center text-[#F21717] flex-shrink-0 mt-0.5 group-hover:bg-[#F21717] group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-bold">{itemIdx + 1}</span>
                                  </div>
                                  <span className="flex-1 font-medium leading-relaxed">{cleanItem}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    }

                    // Bold metadata lines (e.g. **Phase:** Foundation)
                    if (trimmed.startsWith("**") && trimmed.includes(":**")) {
                      return (
                        <div key={pIdx} className="bg-[#171717] p-3 rounded-lg border border-white/5 text-xs text-[#E5E5E5] leading-relaxed">
                          {trimmed.split("\n").map((line, lIdx) => (
                            <p key={lIdx} className="my-0.5">{line}</p>
                          ))}
                        </div>
                      );
                    }

                    // Standard Paragraph
                    return (
                      <p key={pIdx} className="text-sm text-[#D4D4D4] leading-relaxed whitespace-pre-line">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>

                {/* Controls Bar */}
                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      disabled={activeLessonIndex === 0}
                      onClick={() => setActiveLessonIndex((prev) => prev - 1)}
                      variant="outline"
                      size="sm"
                      className="gap-1 flex-1 sm:flex-initial"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>

                    <Button
                      disabled={isLastLesson}
                      onClick={() => setActiveLessonIndex((prev) => prev + 1)}
                      variant="outline"
                      size="sm"
                      className="gap-1 flex-1 sm:flex-initial"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    variant="athletic"
                    size="md"
                    className={`gap-2 w-full sm:w-auto font-bold ${
                      isCurrentCompleted
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#F21717] hover:bg-[#D90F0F]"
                    }`}
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : isCurrentCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Lesson Completed
                      </>
                    ) : (
                      <>
                        Mark Lesson Complete <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
