"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell, PublicNavbar, PublicFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  Lock,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Shield,
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
}

export default function AcademyPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "RECRUITER";

  // Curriculum state
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(6);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  // Initial curriculum fetch
  React.useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/courses")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.courses) setCourses(data.courses);
            if (data.summary) {
              setCompletedCount(data.summary.completedAcademyCount);
              setTotalCount(data.summary.totalAcademyCount);
            }
          }
        })
        .catch(() => {})
        .finally(() => setCoursesLoading(false));
    }
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 rounded-full text-[#F21717] animate-spin" />
      </div>
    );
  }

  // Locked Gate if user is not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F21717]/10 border border-[#F21717]/30 flex items-center justify-center text-[#F21717] shadow-[0_0_30px_rgba(242,23,23,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase">
              STUDENT ACADEMY ACCESS
            </span>
            <h1 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
              Members Only Curriculum
            </h1>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              The 6-Class Student Academy (Financial Literacy, Personal Branding, NIL Playbooks, Conflict Resolution, Behavioral Analysis) is exclusively available to logged-in athletes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login?callbackUrl=/academy">
              <Button size="md" className="gap-2 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F] text-white">
                Sign In to Enter Academy <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="md" className="text-xs font-semibold border-white/20 text-white hover:bg-white/10">
                Create Athlete Account
              </Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-5xl">
        {/* Student Academy Hero Card */}
        <div className="rounded-2xl bg-gradient-to-r from-[#990000] via-[#550000] to-[#1A0A0A] border border-white/10 p-8 md:p-10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-red-300 uppercase block">
              STUDENT ATHLETE ACADEMY
            </span>
            <span className="text-xs font-bold text-red-200 uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full border border-white/10">
              {completedCount} of {totalCount} classes completed
            </span>
          </div>

          <h2 className="font-display uppercase text-3xl md:text-5xl font-black text-white leading-tight">
            Complete Your 6-Class Academy
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">
            Finish all six required classes to boost your recruiting profile, master NIL and financial foundations, and unlock your official Academy badge.
          </p>

          {/* Progress bar */}
          <div className="pt-2 max-w-md space-y-1.5">
            <div className="flex justify-between text-xs text-red-200 font-medium">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Curriculum Section Header */}
        <div className="pt-2">
          <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
            CURRICULUM
          </span>
          <h3 className="font-display uppercase text-3xl font-black text-white tracking-wide">
            The 6 Required Classes
          </h3>
        </div>

        {/* The 6 Classes List */}
        <div className="space-y-4">
          {coursesLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#F21717]" />
            </div>
          ) : (
            courses.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/15 transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#A3A3A3] font-mono">
                      Class {item.order || index + 1}
                    </span>
                    {item.status === "COMPLETED" && (
                      <span className="text-emerald-400 inline-flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    )}
                  </div>
                  <h4 className="font-display uppercase text-lg sm:text-xl font-bold text-white tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#737373]">{item.category}</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.status === "IN_PROGRESS"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-[#1E1E1E] text-[#A3A3A3]"
                    }`}
                  >
                    {item.status === "COMPLETED"
                      ? "Completed"
                      : item.status === "IN_PROGRESS"
                      ? "In Progress"
                      : "Not Started"}
                  </span>

                  <Link href={`/courses/${item.slug}`}>
                    <Button
                      size="sm"
                      className="gap-1.5 h-9 px-4 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F] text-white"
                    >
                      <span>{item.status === "NOT_STARTED" ? "Enroll / Open" : "Continue"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
