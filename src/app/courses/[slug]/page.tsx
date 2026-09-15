"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, BookOpen, Clock, Loader2, Award, Menu, X, Lock } from "lucide-react";

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

function parseInlineText(text: string): React.ReactNode {
  if (!text) return null;

  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold text **...**
      tokens.push(
        <strong key={match.index} className="font-bold text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text *...*
      tokens.push(
        <em key={match.index} className="italic text-[#E5E5E5]">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Code `...`
      tokens.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-white/10 text-amber-300 font-mono text-xs">
          {match[6]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  if (tokens.length === 0) {
    return text.replace(/\*/g, "");
  }

  return <>{tokens}</>;
}

export default function CoursePlayerPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = React.useState<CourseData | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = React.useState(0);
  const [completedLessonIds, setCompletedLessonIds] = React.useState<string[]>([]);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [isLocked, setIsLocked] = React.useState(false);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
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
          setIsLocked(!!data.isLocked);
          setCompletedLessonIds(data.course.completedLessonIds || []);
          setProgressPercent(data.course.progressPercent || 0);

          // Find first uncompleted lesson index or default to 0
          const firstUncompleted = data.course.lessons?.findIndex(
            (l: LessonData) => !data.course.completedLessonIds?.includes(l.id)
          );
          if (firstUncompleted !== undefined && firstUncompleted !== -1) {
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

  const handlePurchase = async (type: "COURSE" | "SUBSCRIPTION") => {
    setIsPurchasing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type === "SUBSCRIPTION" ? "US_ATHLETE" : "COURSE", courseId: course?.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.replace(data.url);
      } else {
        alert(data.error || "Unable to initiate payment session");
      }
    } catch {
      alert("Network error initiating payment session");
    } finally {
      setIsPurchasing(false);
    }
  };

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

  if (isLocked && course) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto py-12 space-y-8">
          <Link href="/classroom" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3A3A3] hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Classroom
          </Link>

          <div className="p-8 rounded-2xl bg-gradient-to-r from-[#111111] via-[#161616] to-[#111111] border border-[#F21717]/40 shadow-[0_0_30px_rgba(242,23,23,0.2)] text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717] mx-auto shadow-[0_0_20px_rgba(242,23,23,0.3)]">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
                PREMIUM CURRICULUM • PAYMENT REQUIRED
              </span>
              <h2 className="font-display uppercase text-3xl font-black text-white">
                {course.title} is Locked
              </h2>
              <p className="text-xs md:text-sm text-[#A3A3A3] max-w-xl mx-auto leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => handlePurchase("COURSE")}
                disabled={isPurchasing}
                variant="athletic"
                size="lg"
                className="w-full sm:w-auto bg-[#F21717] hover:bg-[#D90F0F] font-bold gap-2 text-xs"
              >
                {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Unlock This Course ($9.99)
              </Button>

              <Button
                onClick={() => handlePurchase("SUBSCRIPTION")}
                disabled={isPurchasing}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 font-bold gap-2 text-xs"
              >
                Get Full Access Pass ($29.99)
              </Button>
            </div>

            <p className="text-[11px] text-[#737373]">
              Full Access members unlock all Student Academy courses, unlimited AI Mock Interviews, and verified profile features.
            </p>
          </div>
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
                      <span className="truncate">{lesson.title.replace(/\*/g, "")}</span>
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
                <p className="text-[11px] text-emerald-400/80">You earned progress towards your Academy completion.</p>
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
                      {currentLesson.title.replace(/\*/g, "").replace(/^ros[a-z]+\s*—\s*/i, "")}
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

                    // Filter out any source / origin metadata lines
                    const lower = trimmed.toLowerCase();
                    if (
                      lower.includes("source:") ||
                      lower.includes("lovable project") ||
                      lower.startsWith("extracted verbatim")
                    ) {
                      return null;
                    }

                    // Divider ---
                    if (trimmed === "---") {
                      return <hr key={pIdx} className="border-white/10 my-6" />;
                    }

                    // Main Header #
                    if (trimmed.startsWith("# ")) {
                      const titleText = trimmed
                        .replace(/^#\s+/, "")
                        .replace(/^ros[a-z]+\s*—\s*/i, "")
                        .replace(/\*/g, "");
                      return (
                        <h1 key={pIdx} className="font-display uppercase text-2xl md:text-3xl font-black text-white pt-2 pb-2 border-b border-white/10 flex items-center gap-2">
                          <span className="w-2.5 h-6 bg-[#F21717] rounded-sm inline-block" />
                          {parseInlineText(titleText)}
                        </h1>
                      );
                    }

                    // Section Header ##
                    if (trimmed.startsWith("## ")) {
                      return (
                        <h2 key={pIdx} className="font-display uppercase text-xl font-bold text-white pt-4 pb-1 border-b border-white/5 text-[#F5F5F5]">
                          {parseInlineText(trimmed.replace(/^##\s+/, ""))}
                        </h2>
                      );
                    }

                    // Subsection Header ###
                    if (trimmed.startsWith("### ")) {
                      return (
                        <h3 key={pIdx} className="font-display uppercase text-base font-bold text-amber-400 pt-3 pb-1">
                          {parseInlineText(trimmed.replace(/^###\s+/, ""))}
                        </h3>
                      );
                    }

                    // Standalone bold heading (e.g. **Objective**)
                    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
                      const cleanHeading = trimmed.replace(/\*\*/g, "");
                      return (
                        <div key={pIdx} className="pt-3 pb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#F21717] bg-[#F21717]/15 px-3 py-1 rounded-md border border-[#F21717]/30 inline-block shadow-sm">
                            {cleanHeading}
                          </span>
                        </div>
                      );
                    }

                    // Quote / Key Takeaway Callout Box >
                    if (trimmed.startsWith("> ")) {
                      return (
                        <div key={pIdx} className="p-4 my-4 rounded-xl bg-[#171717] border-l-4 border-[#F21717] shadow-lg space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F21717]">Key Takeaway & Rule</span>
                          <p className="text-sm font-medium text-white italic">
                            {parseInlineText(trimmed.replace(/^>\s+/, "").replace(/"/g, ""))}
                          </p>
                        </div>
                      );
                    }

                    // Bulleted Points List (- or * or 1.)
                    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
                      const items = trimmed.split("\n").filter(Boolean);
                      return (
                        <div key={pIdx} className="bg-[#141414] p-4 rounded-xl border border-white/10 space-y-3 my-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F21717]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">Action Checklist & Key Points</span>
                          </div>
                          <ul className="space-y-2">
                            {items.map((rawItem, itemIdx) => {
                              const isChecked = rawItem.includes("[✓]") || rawItem.includes("[x]");
                              const isCheckbox = isChecked || rawItem.includes("[ ]");
                              const cleanItem = rawItem.replace(/^[-*]|\d+\.\s*|\[[ x✓]\]/g, "").trim();

                              return (
                                <li key={itemIdx} className="flex items-start gap-3 text-xs text-[#E5E5E5] bg-[#1a1a1a] p-3 rounded-lg border border-white/5 hover:border-[#F21717]/30 transition-colors">
                                  <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] ${
                                    isChecked ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-[#F21717]/20 text-[#F21717] border border-[#F21717]/40"
                                  }`}>
                                    {isChecked ? "✓" : isCheckbox ? "○" : itemIdx + 1}
                                  </div>
                                  <span className="flex-1 font-medium leading-relaxed">
                                    {parseInlineText(cleanItem)}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    }

                    // Bold metadata lines (e.g. **Phase:** Foundation)
                    if (trimmed.startsWith("**") && (trimmed.includes(":**") || trimmed.includes("Phase:") || trimmed.includes("Primary skill:"))) {
                      const lines = trimmed.split("\n").filter(Boolean);
                      return (
                        <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#141414] rounded-xl border border-white/10 my-3">
                          {lines.map((line, lIdx) => (
                            <div key={lIdx} className="text-xs text-[#E5E5E5] flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#F21717]" />
                              <span>{parseInlineText(line)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Standard Paragraph
                    return (
                      <p key={pIdx} className="text-sm text-[#D4D4D4] leading-relaxed whitespace-pre-line">
                        {parseInlineText(trimmed)}
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
