"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { ArrowRight, Trophy, Users, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-10">
        {/* Public Hero Banner */}
        <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
          <Image
            src="/images/hero-athletes.webp"
            alt="REP 1 Coaches and Athletes"
            fill
            unoptimized
            className="object-cover brightness-95"
            style={{ objectPosition: "center 30%" }}
            priority
          />

          {/* Athletic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-radial from-[#F21717]/25 via-transparent to-transparent pointer-events-none" />

          {/* Huge Stencil REP 1 Branding */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 select-none pointer-events-none opacity-25 hidden md:block">
            <span className="font-display font-black text-8xl md:text-9xl tracking-tighter text-[#F21717]">
              REP 1
            </span>
          </div>

          {/* Hero Call-to-Action Card */}
          <div className="absolute bottom-8 left-6 md:left-10 z-10 max-w-xl w-[calc(100%-3rem)] bg-[#111111]/90 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F21717]/20 border border-[#F21717]/40 text-[10px] font-bold tracking-widest text-[#F21717] uppercase">
                ATHLETE RECRUITING & EDUCATION PLATFORM
              </span>
            </div>
            <h1 className="font-display uppercase text-3xl md:text-4xl lg:text-5xl font-black text-white leading-none">
              Exposure Has No Borders
            </h1>
            <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">
              Connect with verified college recruiters, master elite NIL playbooks, and practice high-pressure interviews with AI coaching.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="athletic" size="md" className="gap-2 text-xs font-bold">
                    Go to Your Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button variant="athletic" size="md" className="gap-2 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]">
                      Create Athlete Profile <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="md" className="text-xs font-semibold border-white/20 text-white hover:bg-white/10 gap-1.5">
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Media & Combine Video Showcase */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F21717] block mb-1">
                MEDIA & COMBINE HIGHLIGHTS
              </span>
              <h2 className="font-display uppercase text-2xl md:text-3xl font-bold text-white">
                Photos & Camp Showcase
              </h2>
            </div>
          </div>
          <MediaCarousel />
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-white">
              Verified Combine Metrics
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Laser-timed 40-yard sprints, broad jumps, and verified athletic profiles scouted by college programs.
            </p>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D1B2]/15 border border-[#00D1B2]/30 flex items-center justify-center text-[#00D1B2]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-white">
              Mock AI Interview Prep
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Master recruiter questions across Beginner, Intermediate, and Pro tiers with real-time feedback.
            </p>
            <Link href="/interview" className="inline-block text-xs font-semibold text-[#00D1B2] hover:underline">
              Try Practice Scenarios →
            </Link>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display uppercase text-lg font-bold text-white">
              Elite Pacific Sports
            </h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Dedicated recruiting network connecting top Australian football prospects with global collegiate pathways.
            </p>
            <Link href="/elite-pacific" className="inline-block text-xs font-semibold text-amber-400 hover:underline">
              Explore Australian Talent →
            </Link>
          </Card>
        </div>

        {/* WHAT IS REP 1 Card */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6 md:p-8 space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              WHAT IS REP 1
            </span>
            <h3 className="font-display uppercase text-2xl font-bold text-white">
              The Recruiting Platform Built for Athletes
            </h3>
            <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed max-w-5xl">
              Rep 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and academy training progress. Build a standout profile, track your athletic growth, and get discovered by the programs looking for players just like you.
            </p>
          </CardContent>
        </Card>

        {/* Bottom 2-Col: Upcoming Events & Athletes of the Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#111111] border-white/10 p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-2">
              UPCOMING EVENTS
            </span>
            <h4 className="font-display uppercase text-lg font-bold text-white mb-2">
              2026 Combine & Showcase Schedule
            </h4>
            <p className="text-xs text-[#737373]">
              Registration opens soon for the Brisbane & Sydney Winter Combines.
            </p>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-2">
              ATHLETES OF THE MONTH
            </span>
            <h4 className="font-display uppercase text-lg font-bold text-white mb-2">
              Gridiron & Track Standouts
            </h4>
            <p className="text-xs text-[#737373]">
              Nominations open for verified combine test leaders.
            </p>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
