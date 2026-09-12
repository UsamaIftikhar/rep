"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, LogIn } from "lucide-react";

export default function ElitePacificPage() {
  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-6xl">
        {/* Top Header Card (Matches Screenshot 5) */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-6 md:p-8">
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

        {/* Hero Photo (Matches Screenshot 5 team huddle) */}
        <div className="relative w-full h-72 md:h-[440px] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
          <Image
            src="/images/athletes_team.jpeg"
            alt="Elite Pacific Sports Athletes"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Action Buttons (Matches Screenshot 5) */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" /> Recruit Search
          </Button>

          <Link href="/admin">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs font-semibold border-red-600/40 text-red-400 hover:bg-red-600/10"
            >
              <LogIn className="w-3.5 h-3.5" /> Admin Login
            </Button>
          </Link>
        </div>

        {/* Two Column Grid: About & Prospects (Matches Screenshot 5) */}
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
                  <div className="font-display font-black text-4xl text-[#F21717]">
                    $75/mo
                  </div>
                  <p className="text-xs text-[#737373]">
                    Unlock the full Australian prospect database.
                  </p>
                </CardContent>
              </Card>

              {/* Big Red Subscribe & Pay Button */}
              <Button
                variant="athletic"
                size="lg"
                className="w-full bg-[#F21717] hover:bg-[#D90F0F] text-sm font-bold"
              >
                Subscribe & Pay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
