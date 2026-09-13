import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardContent, Button } from "@/components/ui";
import { Trophy, BookOpen, Sparkles, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 flex-1 w-full space-y-10">
        <PageHeader
          eyebrow="ABOUT REP 1 EXPOSURE"
          title="The Recruiting Platform Built for Athletes"
          description="Connecting student-athletes with college recruiters through verified performance metrics, elite academy education, and global exposure."
        />

        {/* What is REP 1 Featured Card */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#111111] via-[#161616] to-[#111111] border border-[#F21717]/30 shadow-[0_0_30px_rgba(242,23,23,0.15)] relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F21717]/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
            WHAT IS REP 1
          </span>
          <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white leading-tight">
            Exposure Has No Borders
          </h2>
          <p className="text-sm md:text-base text-[#D4D4D4] leading-relaxed max-w-3xl">
            Rep 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and academy training progress. Build a standout profile, track your athletic growth, and get discovered by the programs looking for players just like you.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-[#F21717] uppercase block">
            OUR CORE PILLARS
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717]">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Verified Combine Metrics
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Official laser-timed sprint data, broad jumps, and athletic testing scores verified by certified scouts and recruiters.
              </p>
            </Card>

            <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Student Academy
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Structured courses covering recruiting strategy, NIL financial literacy, mental toughness, and collegiate eligibility.
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
                Practice high-pressure coach and media interviews with instant AI feedback across beginner, intermediate, and pro tiers.
              </p>
            </Card>

            <Card className="bg-[#111111] border-white/10 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Global Pathways
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Connecting prospects from Australia and worldwide with American collegiate athletic programs and recruiting networks.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Card */}
        <Card className="bg-[#111111] border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display uppercase text-xl font-bold text-white">
              Ready to Build Your Athlete Profile?
            </h3>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Join REP 1 Exposure today and start showcasing your verified metrics to college programs.
            </p>
          </div>
          <Link href="/signup">
            <Button variant="athletic" size="md" className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold whitespace-nowrap">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </main>

      <PublicFooter />
    </div>
  );
}
