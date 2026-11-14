"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { partners, getPartnerInitials, Partner } from "@/data/partners";
import {
  MapPin,
  PlusCircle,
  LogIn,
  Handshake,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

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
    title: "Global Partner Prospects & Combine Athletes",
    category: "Recruiting Combine • Regional Circuit",
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
    imageUrl: "/images/IMG_1960.jpeg",
    objectPosition: "object-[center_12%]",
  },
  {
    id: 6,
    title: "Partner Showcase Camp Field Session",
    category: "Development Camp Series",
    imageUrl: "/images/coach_shaka.jpeg",
    objectPosition: "object-[center_10%]",
  },
];

interface PartnerCardProps {
  partner: Partner;
}

function PartnerCard({ partner }: PartnerCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const initials = getPartnerInitials(partner.name);
  const isContainLogo = partner.imageFit === "contain";

  const getTierBadge = (tier: Partner["tier"]) => {
    switch (tier) {
      case "Founding":
        return (
          <Badge
            variant="athletic"
            size="sm"
            className="shadow-[0_0_14px_rgba(242,23,23,0.5)] backdrop-blur-md"
          >
            Founding Partner
          </Badge>
        );
      case "Strategic":
        return (
          <Badge
            variant="default"
            size="sm"
            className="bg-black/90 text-[#F21717] border border-[#F21717]/50 backdrop-blur-md shadow-md"
          >
            Strategic Partner
          </Badge>
        );
      case "Official":
      default:
        return (
          <Badge
            variant="neutral"
            size="sm"
            className="bg-black/90 text-[#F5F5F5] border border-white/20 backdrop-blur-md shadow-md"
          >
            Official Partner
          </Badge>
        );
    }
  };

  const customBorderStyle = partner.brandColor
    ? { borderColor: partner.brandColor }
    : undefined;

  return (
    <Card
      hoverEffect
      style={customBorderStyle}
      className="group flex flex-col justify-between h-full bg-[#111111] border-white/10 rounded-2xl overflow-hidden transition-all duration-300 relative shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)] hover:border-white/25"
    >
      {/* Top Media Banner: Perfectly sized to fit logos or photography */}
      <div
        className="relative w-full h-60 overflow-hidden flex items-center justify-center border-b border-white/10"
        style={{ backgroundColor: partner.imageBg || "#0D0D0D" }}
      >
        {partner.profileImage && !imgError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={partner.profileImage}
              alt={partner.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`transition-all duration-500 ease-out ${
                isContainLogo
                  ? "object-contain pt-10 pb-4 px-8 group-hover:scale-105"
                  : "object-cover object-center group-hover:scale-106 group-hover:brightness-105"
              }`}
              onError={() => setImgError(true)}
              priority
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center font-display font-black text-4xl text-white bg-gradient-to-tr from-[#171717] via-[#242424] to-[#171717]">
            <span>{initials}</span>
            <span className="text-xs uppercase tracking-widest text-[#737373] mt-1 font-sans font-normal">
              Official Partner
            </span>
          </div>
        )}

        {/* Gradient Scrim only for photos, keeping logos clean and unobstructed */}
        {!isContainLogo && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-black/30 pointer-events-none" />
        )}

        {/* Floating Top Bar on Image: Tier Badge & Region Pill with high-contrast frosted backing */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div>{getTierBadge(partner.tier)}</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white shadow-lg">
            <MapPin className="w-3 h-3 text-[#F21717]" />
            <span>{partner.region}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 pt-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block truncate">
                {partner.category}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#A3A3A3] flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F21717]" /> Verified
              </span>
            </div>

            <h3 className="font-display uppercase text-2xl font-black text-white tracking-wide group-hover:text-[#F21717] transition-colors leading-tight">
              {partner.name}
            </h3>
          </div>

          {/* Partner Tagline */}
          <p className="text-sm font-semibold text-white/95 leading-snug">
            {partner.tagline}
          </p>

          {/* Partner Detailed Description */}
          <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">
            {partner.description}
          </p>

          {/* Feature Highlights Pills */}
          {partner.highlights && partner.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {partner.highlights.map((highlight, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#D4D4D4] bg-white/5 border border-white/10 px-2 py-1 rounded-md"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#F21717]" /> {highlight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Action Button with Custom Button Text & External Link */}
        <div className="pt-4 border-t border-white/5">
          <a
            href={partner.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between h-11 px-4 text-xs font-semibold border-white/15 text-[#F5F5F5] group-hover:border-[#F21717] group-hover:bg-[#F21717] group-hover:text-white transition-all cursor-pointer"
            >
              <span>{partner.buttonText || "Explore Partner"}</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}

export default function PartnersPage() {
  const { isAuthenticated } = useAuth();
  const [partnerList] = React.useState<Partner[]>(partners);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const filteredPartners = React.useMemo(() => {
    if (selectedFilter === "all") return partnerList;
    if (selectedFilter === "founding") {
      return partnerList.filter((p) => p.tier === "Founding");
    }
    if (selectedFilter === "strategic") {
      return partnerList.filter((p) => p.tier === "Strategic");
    }
    return partnerList;
  }, [selectedFilter, partnerList]);

  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Top Header Card matching existing site standard */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="space-y-1.5">
            {/* PLACEHOLDER COPY: Eyebrow label - easily replaceable */}
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
              GLOBAL PARTNERSHIPS
            </span>

            {/* PLACEHOLDER COPY: Primary Page Heading - easily replaceable */}
            <h1 className="font-display uppercase text-2xl md:text-4xl font-black text-white leading-tight">
              OFFICIAL PARTNERS
            </h1>

            <p className="text-xs md:text-sm text-[#A3A3A3] max-w-2xl">
              Connecting elite sporting organizations, academies, and combines worldwide with collegiate and professional exposure pathways.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
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
        </div>

        {/* Media Photo Carousel Slideshow with Caption & Counter */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] group shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

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
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/75 text-white border border-white/15 hover:bg-[#F21717] hover:border-[#F21717] transition-colors z-20 cursor-pointer shadow-lg"
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

        {/* Highlight Feature Card matching "Verified Combine Metrics" style */}
        <Card className="bg-[#111111] border-[#F21717]/30 p-6 space-y-3 shadow-[0_0_20px_rgba(242,23,23,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F21717] block">
                GLOBAL ATHLETIC NETWORK
              </span>
              <h2 className="font-display uppercase text-lg font-bold text-white">
                Co-Branded Scouting & Combine Affiliates
              </h2>
            </div>
          </div>
          <p className="text-xs md:text-sm text-[#A3A3A3] leading-relaxed">
            REP 1 partners receive dedicated talent pipelines, unified combine telemetry, verified scouting evaluations, and reciprocal athlete placement opportunities across colleges and pro teams.
          </p>
        </Card>

        {/* Directory Section Header & Interactive Filter Bar */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
                DIRECTORY
              </span>
              <h2 className="font-display uppercase text-2xl font-bold text-white">
                Official Partner Programs ({filteredPartners.length})
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "bg-white/5 text-[#A3A3A3] hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                All ({partnerList.length})
              </button>
              <button
                onClick={() => setSelectedFilter("founding")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === "founding"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "bg-white/5 text-[#A3A3A3] hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Founding
              </button>
              <button
                onClick={() => setSelectedFilter("strategic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === "strategic"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "bg-white/5 text-[#A3A3A3] hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                Strategic
              </button>
            </div>
          </div>

          {/* Large-Image Responsive Partner Card Grid */}
          {filteredPartners.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-[#737373]" />}
              title="NO PARTNERS IN THIS CATEGORY"
              description="No partner organizations matched your selected filter. Switch to all partners or inquire to join this tier."
              actionLabel="Show All Partners"
              onAction={() => setSelectedFilter("all")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Call To Action */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
              COLLABORATE WITH REP 1
            </span>
            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white">
              BECOME AN OFFICIAL PARTNER
            </h2>
            <p className="text-xs md:text-sm text-[#A3A3A3] max-w-xl">
              Elevate your athletes’ visibility. Integrate with our verified combine metrics, recruit directory, and student academy ecosystem.
            </p>
          </div>

          <Link href="/contact" className="z-10 flex-shrink-0">
            <Button
              variant="athletic"
              size="lg"
              className="gap-2 text-xs md:text-sm font-bold uppercase tracking-wider"
            >
              Become a partner <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          {/* Background ambient red glow */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#F21717]/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </AppShell>
  );
}
