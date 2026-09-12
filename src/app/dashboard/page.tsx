"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { ArrowRight, CreditCard } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6 pb-12">
        {/* Hero Section (Matches Bubble Screenshot 4) */}
        <div className="relative w-full h-[440px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
          {/* Athlete Imagery */}
          <Image
            src="/images/IMG_7403.jpeg"
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

          {/* Huge Stencil REP 1 Branding (Matches Screenshot) */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 select-none pointer-events-none opacity-25 hidden md:block">
            <span className="font-display font-black text-8xl md:text-9xl tracking-tighter text-[#F21717]">
              REP 1
            </span>
          </div>

          {/* Welcome Card Overlay (Matches Screenshot 4) */}
          <div className="absolute bottom-6 left-6 z-10 max-w-md w-[calc(100%-3rem)] bg-[#111111]/90 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1.5">
              ATHLETE DASHBOARD
            </span>
            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Welcome back, Marvin Constant
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

        {/* Carousel & Video Showcase Section (User Request) */}
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

        {/* WHAT IS REP 1 Card (Matches Screenshot 4) */}
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

        {/* UPCOMING EVENTS Card (Matches Screenshot 4) */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              UPCOMING EVENTS
            </span>
            <p className="text-xs text-[#737373]">No upcoming events</p>
          </CardContent>
        </Card>

        {/* SUBSCRIPTION Card (Matches Screenshot 4) */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                SUBSCRIPTION
              </span>
              <h4 className="text-sm font-bold text-white">Plan</h4>
              <p className="text-xs text-[#737373] mt-0.5">Renews on</p>
            </div>
            <Link href="/settings">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-semibold">
                <CreditCard className="w-3.5 h-3.5" /> Manage Subscription
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* ATHLETES OF THE MONTH Card (Matches Screenshot 4) */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              ATHLETES OF THE MONTH
            </span>
            <p className="text-xs text-[#737373]">Nominations open for next combine testing cycle.</p>
          </CardContent>
        </Card>

        {/* FROM THE BLOG Card (Matches Screenshot 4) */}
        <Card className="bg-[#111111] border-white/10">
          <CardContent className="p-6">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-3">
              FROM THE BLOG
            </span>
            <p className="text-xs text-[#737373]">No blog posts yet</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
