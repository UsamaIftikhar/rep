"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@/components/ui";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  Loader2,
  Award,
  Sparkles,
  Layers,
  CheckSquare,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  order: number;
  totalLessonsCount: number;
  completedLessonsCount: number;
  progressPercent: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  lessons: {
    id: string;
    title: string;
    slug: string;
    estimatedMinutes?: number | null;
    order: number;
  }[];
}

const CATEGORY_HIGHLIGHTS: Record<string, string[]> = {
  "Financial Literacy": [
    "50/30/20 Budgeting rule for athlete stipends & NIL earnings",
    "Form 1099-NEC & 25–30% quarterly tax reserve rule",
    "High-yield banking setup & expense separation",
  ],
  "Leadership": [
    "Establishing your personal 501(c)(3) community foundation",
    "Measuring real community outcomes & youth clinic impact",
    "Authentic student-athlete leadership presence",
  ],
  "Marketing Playbook": [
    "Pitching local & national sponsors with high-ROI pitch decks",
    "Navigating exclusivity clauses & deliverable schedules",
    "Valuing engagement rate vs follower count",
  ],
  "Personal Branding": [
    "Crafting an executive athletic brand story",
    "Social media audit checklist for college recruiters",
    "Maintaining brand posture under public scrutiny",
  ],
  "Community Engagement": [
    "De-escalation techniques during high-pressure coaching",
    "Requesting objective depth chart performance milestones",
    "Film breakdown active listening & locker room dynamics",
  ],
  "Behavioral Analytics": [
    "Collegiate recruiter 3-dimensional evaluation frameworks",
    "Executive poise during high-stakes recruiting visits",
    "Vocal clarity & body language in media interviews",
  ],
};

export default function CoursesDocumentationPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = React.useState<CourseSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.courses) {
          setCourses(data.courses);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = ["ALL", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lessons.some((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalCompletedLessons = courses.reduce((acc, c) => acc + (c.completedLessonsCount || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c.totalLessonsCount || 0), 0);
  const completedCoursesCount = courses.filter((c) => c.status === "COMPLETED").length;

  return (
    <AppShell>
      <div className="space-y-8 pb-16">
        {/* Header Section */}
        <PageHeader
          eyebrow="Curriculum & Interactive Documentation"
          title="Student-Athlete Classroom & Playbooks"
          description="Structured learning modules, interactive action items, and executive playbooks designed to prepare high school and college athletes for elite collegiate and professional success."
        />

        {/* Top Analytics & Progress Bar Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#0E0E0E] border-white/10 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Classroom Modules</p>
              <h3 className="font-display font-black text-2xl text-white">{courses.length} Modules</h3>
            </div>
          </Card>

          <Card className="bg-[#0E0E0E] border-white/10 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Lessons Progress</p>
              <h3 className="font-display font-black text-2xl text-white">
                {totalCompletedLessons} / {totalLessons || 12} <span className="text-xs font-normal text-[#737373]">Completed</span>
              </h3>
            </div>
          </Card>

          <Card className="bg-[#0E0E0E] border-white/10 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">Academy Badge Progress</p>
              <h3 className="font-display font-black text-2xl text-white">
                {completedCoursesCount} / {courses.length || 6} <span className="text-xs font-normal text-[#737373]">Courses</span>
              </h3>
            </div>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0E0E0E] p-4 rounded-xl border border-white/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#F21717] text-white shadow-[0_0_10px_rgba(242,23,23,0.4)]"
                      : "bg-white/5 text-[#A3A3A3] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat === "ALL" ? "All Modules" : cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
            <input
              type="text"
              placeholder="Search lessons, topics, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171717] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#F21717]"
            />
          </div>
        </div>

        {/* Course Modules Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#A3A3A3]">
            <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold">Loading Interactive Documentation...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center bg-[#0E0E0E] border border-white/10 rounded-2xl p-8 space-y-3">
            <FileText className="w-10 h-10 text-[#737373] mx-auto" />
            <h3 className="font-display uppercase text-lg font-bold text-white">No Matching Courses Found</h3>
            <p className="text-xs text-[#A3A3A3]">Try adjusting your search terms or selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((c) => {
              const highlights = CATEGORY_HIGHLIGHTS[c.category] || [
                "Master core concepts with actionable bullet points",
                "Complete lesson progress checkpoints",
                "Apply learnings directly to recruiting profile",
              ];
              const totalMins = c.lessons.reduce((acc, l) => acc + (l.estimatedMinutes || 15), 0);

              return (
                <Card key={c.id} hoverEffect className="bg-[#0E0E0E] border-white/10 flex flex-col justify-between">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" className="bg-[#F21717]/15 text-[#F21717] border-[#F21717]/40 text-[10px] uppercase font-bold tracking-wider">
                        {c.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                        <Clock className="w-3.5 h-3.5 text-[#F21717]" />
                        <span>{totalMins} min total</span>
                      </div>
                    </div>

                    <div>
                      <CardTitle isDisplay className="text-xl md:text-2xl text-white">
                        {c.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-[#A3A3A3] mt-1 line-clamp-2">
                        {c.description}
                      </CardDescription>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-[#A3A3A3]">
                        <span>Progress</span>
                        <span className="text-white font-bold">{c.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#F21717] h-full transition-all duration-300 shadow-[0_0_8px_rgba(242,23,23,0.8)]"
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 pt-2">
                    {/* Documentation Key Takeaways / Points */}
                    <div className="space-y-2 bg-[#141414] p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#F21717]" />
                        <span>Key Documentation Points</span>
                      </div>
                      <ul className="space-y-1.5">
                        {highlights.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-xs text-[#D4D4D4]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#F21717] flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Lessons Count & Start Action Button */}
                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-[#737373]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{c.lessons.length} Detailed Lessons</span>
                      </div>

                      <Link href={`/courses/${c.slug}`}>
                        <Button variant="athletic" size="md" className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] font-bold text-xs">
                          {c.status === "COMPLETED" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Review Documentation
                            </>
                          ) : c.status === "IN_PROGRESS" ? (
                            <>
                              Continue Reading <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Read Documentation <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
