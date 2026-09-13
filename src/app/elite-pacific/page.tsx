"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, LogIn, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Shield, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface MediaSlide {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  objectPosition?: string;
}

const slides: MediaSlide[] = [
  {
    id: 1,
    title: "Elite Pacific Sports Prospects",
    category: "Recruiting Combine • Brisbane",
    imageUrl: "/images/athletes_team.jpeg",
    objectPosition: "object-center",
  },
  {
    id: 2,
    title: "Combine Metric & Broad Jump Testing",
    category: "Verified Performance Data",
    imageUrl: "/images/combine_jump.jpeg",
    objectPosition: "object-center",
  },
  {
    id: 3,
    title: "Rep 1 Coaching Staff — Exposure Has No Borders",
    category: "Mentorship & Leadership",
    imageUrl: "/images/IMG_7403.jpeg",
    objectPosition: "object-top",
  },
  {
    id: 4,
    title: "Marvin Constant with Gridiron Prospects",
    category: "Player Development & Scouting",
    imageUrl: "/images/marvin_athletes.jpeg",
    objectPosition: "object-top",
  },
  {
    id: 5,
    title: "On-Field Technique & Position Drills",
    category: "Academy Training",
    imageUrl: "/images/marvin_coaching.jpeg",
    objectPosition: "object-[center_12%]",
  },
  {
    id: 6,
    title: "Elite Pacific Camp Field Session",
    category: "Queensland Training Camp",
    imageUrl: "/images/coach_shaka.jpeg",
    objectPosition: "object-[center_10%]",
  },
];

export default function ElitePacificPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isSubscribing, setIsSubscribing] = React.useState(false);

  const isAdminUser = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ELITE_PACIFIC" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.replace(data.url);
      } else {
        alert(data.error || "Unable to initiate subscription checkout");
      }
    } catch {
      alert("Network error initiating payment");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-6xl">
        {/* Top Header Card */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1.5">
              AUSTRALIAN RECRUITING
            </span>
            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white leading-tight mb-1">
              ELITE PACIFIC SPORTS RECRUITING
            </h2>
            <p className="text-xs text-[#A3A3A3]">
              Search and evaluate Australian athlete profiles.
            </p>
          </div>

          {isAdminUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" /> Admin Access Granted
            </div>
          )}
        </div>

        {/* Media Photo Carousel */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] group">
          <Image
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].title}
            fill
            unoptimized
            className={`object-cover transition-all duration-500 group-hover:scale-102 ${
              slides[currentIndex].objectPosition || "object-center"
            }`}
            priority
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

          {/* Caption Overlay */}
          <div className="absolute bottom-6 left-6 right-20 z-10">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              {slides[currentIndex].category}
            </span>
            <h3 className="font-display uppercase text-xl md:text-2xl font-bold text-white leading-tight">
              {slides[currentIndex].title}
            </h3>
            <span className="text-[11px] text-[#A3A3A3] mt-1 block">
              Photo {currentIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 right-6 flex items-center gap-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "w-6 bg-[#F21717]"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/recruiting/search">
            <Button
              variant="primary"
              size="md"
              className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" /> Recruit Search
            </Button>
          </Link>

          {!isAuthenticated && (
            <Link href="/login">
              <Button
                variant="outline"
                size="md"
                className="gap-2 text-xs font-semibold border-white/20 text-white hover:bg-white/10"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Verified Combine Metrics Feature Card */}
        <Card className="bg-[#111111] border-[#F21717]/30 p-6 space-y-3 shadow-[0_0_20px_rgba(242,23,23,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F21717] block">
                OFFICIAL RECRUITING METRICS
              </span>
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Verified Combine Metrics
              </h3>
            </div>
          </div>
          <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">
            Laser-timed 40-yard sprints, vertical & broad jumps, and verified athletic profiles scouted by college programs across Australia and internationally.
          </p>
        </Card>

        {/* Two Column Grid: About & Prospects */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Left Column: About */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display uppercase text-2xl font-bold text-white">
              About
            </h3>
            <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">
              Elite Pacific Sports is a dynamic sports organization dedicated to developing athletes, creating opportunities, and connecting the next generation of sporting talent with pathways to success. Based in Brisbane, we focus on excellence, leadership, teamwork, and personal development both on and off the field. Through high-quality programs, training, events, and sporting opportunities, Elite Pacific Sports aims to inspire athletes to reach their full potential while building confidence, discipline, and a lifelong passion for sport. Our mission is to create an environment where athletes can grow, compete, and thrive.
            </p>
          </div>

          {/* Right Column: Prospects & Get Full Access */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                PROSPECTS
              </span>
              <h4 className="font-display uppercase text-2xl font-bold text-white">
                Australian Athletes
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                  ELITE PACIFIC SPORTS ACCESS
                </span>
                <h4 className="font-display uppercase text-2xl font-bold text-white">
                  Get Full Access
                </h4>
              </div>

              {/* Price Card */}
              <Card className="bg-[#111111] border-white/10 text-center p-6 space-y-3">
                <CardContent className="p-0 space-y-2">
                  <h5 className="font-display uppercase text-base font-semibold text-white">
                    Elite Pacific Sports
                  </h5>
                  <div className="flex items-baseline justify-center gap-1 my-1">
                    <span className="font-display font-black text-4xl text-[#F21717]">
                      $75
                    </span>
                    <span className="text-xs text-[#737373]">One-time fee</span>
                  </div>
                  <p className="text-xs text-[#737373]">
                    One-time fee — unlock the full Australian prospect database with lifetime access.
                  </p>
                </CardContent>
              </Card>

              {/* Subscribe & Pay Button */}
              <Button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                variant="athletic"
                size="lg"
                className="w-full bg-[#F21717] hover:bg-[#D90F0F] text-sm font-bold gap-2"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Subscribe & Pay <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
