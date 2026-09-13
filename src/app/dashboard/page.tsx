"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { ArrowRight, CreditCard, BookOpen, Brain, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [academyProgress, setAcademyProgress] = React.useState<{ completed: number; total: number }>({
    completed: 0,
    total: 6,
  });
  const [latestInterview, setLatestInterview] = React.useState<{ tier: string; score: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;

    fetch("/api/courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.summary) {
          setAcademyProgress({
            completed: data.summary.completedAcademyCount || 0,
            total: data.summary.totalAcademyCount || 6,
          });
        }
      })
      .catch(() => {});

    fetch("/api/interview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.attempts && data.attempts.length > 0) {
          const completedAttempts = data.attempts.filter((a: { status: string; overallScore: number | null }) => a.status === "COMPLETED" && a.overallScore !== null);
          if (completedAttempts.length > 0) {
            setLatestInterview({
              tier: completedAttempts[0].tier,
              score: completedAttempts[0].overallScore,
            });
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const athleteName = user?.firstName || user?.name || "Athlete";

  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Hero Section */}
        <div className="relative w-full h-[440px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
          {/* Athlete Imagery */}
          <Image
            src="/images/hero-athletes.webp"
            alt="REP 1 Coaches and Athletes"
            fill
            unoptimized
            className="object-cover brightness-95"
            style={{ objectPosition: "center 30%" }}
            priority
          />

          {/* Red and dark athletic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-radial from-[#F21717]/20 via-transparent to-transparent pointer-events-none" />

          {/* Huge Stencil REP 1 Branding */}
          <div className="absolute top-2/5 left-8 -translate-y-1/2 select-none pointer-events-none opacity-25 hidden md:block">
            <span className="font-display font-black text-8xl md:text-9xl tracking-tighter text-[#F21717]">
              REP 1
            </span>
          </div>

          {/* Welcome Card Overlay */}
          <div className="absolute bottom-6 left-6 z-10 max-w-md w-[calc(100%-3rem)] bg-[#111111]/90 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1.5">
              ATHLETE DASHBOARD
            </span>
            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Welcome back, {athleteName}
            </h2>
            <p className="text-xs text-[#A3A3A3] mb-4 leading-relaxed">
              Your recruiting profile, academy progress, and recruiter activity at a glance.
            </p>
            <Link href="/settings">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
                View Full Profile <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Metric Widgets Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/50 text-[#F21717] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Student Academy</span>
                <span className="font-display font-bold text-sm text-white">
                  {academyProgress.completed} of {academyProgress.total} Classes Complete
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/50 text-[#F21717] flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Latest AI Interview</span>
                <span className="font-display font-bold text-sm text-white">
                  {latestInterview ? `${latestInterview.score} / 100 (${latestInterview.tier.toUpperCase()})` : "No Attempt Yet"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Account Tier</span>
                <span className="font-display font-bold text-sm text-emerald-400 uppercase">
                  {user?.role || "ATHLETE MEMBER"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carousel & Video Showcase Section */}
        <div>
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F21717]">
              MEDIA & COMBINE HIGHLIGHTS
            </span>
            <h3 className="font-display uppercase text-xl font-bold text-white">
              Photos & Video Showcase
            </h3>
          </div>
          <MediaCarousel />
        </div>

        {/* WHAT IS REP 1 Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-2">
              WHAT IS REP 1
            </span>
            <h3 className="font-display uppercase text-xl md:text-2xl font-bold text-white mb-3">
              The Recruiting Platform Built for Athletes
            </h3>
            <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed max-w-5xl">
              Rep 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and academy training progress. Build a standout profile, track your athletic growth, and get discovered by the programs looking for players just like you.
            </p>
          </CardContent>
        </Card>

        {/* UPCOMING EVENTS Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              UPCOMING EVENTS
            </span>
            <p className="text-xs text-[#737373]">Future events coming soon as scheduled</p>
          </CardContent>
        </Card>

        {/* SUBSCRIPTION Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                SUBSCRIPTION
              </span>
              <h4 className="text-sm font-bold text-white">REP 1 Full Access Member Tier</h4>
              <p className="text-xs text-[#737373] mt-0.5">Active Membership • Unlimited Access to All Features</p>
            </div>
            <Link href="/settings">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-semibold">
                <CreditCard className="w-3.5 h-3.5" /> Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* REP 1 TOP PERFORMERS Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              REP 1 TOP PERFORMERS
            </span>
            <p className="text-xs text-[#737373]">Nominations open for next combine testing cycle.</p>
          </CardContent>
        </Card>

        {/* FROM THE BLOG Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              FROM THE BLOG
            </span>
            <p className="text-xs text-[#737373]">No blog posts published yet.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
