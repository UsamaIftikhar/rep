"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AcademyClass {
  classNumber: number;
  title: string;
  category: string;
  status: "In Progress" | "Not Started" | "Completed";
}

const academyClasses: AcademyClass[] = [
  {
    classNumber: 1,
    title: "Financial Literacy",
    category: "Financial Literacy",
    status: "In Progress",
  },
  {
    classNumber: 2,
    title: "Athletes for Impact",
    category: "Leadership",
    status: "Not Started",
  },
  {
    classNumber: 3,
    title: "Marketing Playbook",
    category: "Marketing Playbook",
    status: "Not Started",
  },
  {
    classNumber: 4,
    title: "Personal Branding",
    category: "Personal Branding",
    status: "Not Started",
  },
  {
    classNumber: 5,
    title: "Conflict Resolution",
    category: "Community Engagement",
    status: "Not Started",
  },
  {
    classNumber: 6,
    title: "Behavioral Analysis",
    category: "Behavioral Analytics",
    status: "In Progress",
  },
];

export default function AcademyPage() {
  return (
    <AppShell>
      <div className="space-y-8 pb-16 max-w-5xl">
        {/* Student Academy Hero Card (Matches Screenshot 2) */}
        <div className="rounded-2xl bg-gradient-to-r from-[#990000] via-[#550000] to-[#1A0A0A] border border-white/10 p-8 md:p-10 shadow-2xl">
          <span className="text-xs font-bold tracking-widest text-red-300 uppercase block mb-3">
            STUDENT ACADEMY
          </span>
          <h2 className="font-display uppercase text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            Complete Your 6-Class Academy
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-2xl leading-relaxed mb-4">
            Finish all six required classes to boost your recruiting profile and unlock your Academy badge.
          </p>
          <p className="text-xs font-bold text-red-200 uppercase tracking-wider">
            0 of 6 classes completed
          </p>
        </div>

        {/* Curriculum Section Header */}
        <div className="pt-2">
          <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
            CURRICULUM
          </span>
          <h3 className="font-display uppercase text-3xl font-black text-white tracking-wide">
            The 6 Classes
          </h3>
        </div>

        {/* The 6 Classes List (Matches Screenshot 2) */}
        <div className="space-y-6">
          {academyClasses.map((item) => (
            <div
              key={item.classNumber}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#A3A3A3]">
                  Class {item.classNumber}
                </span>
                <h4 className="font-display uppercase text-xl font-bold text-white tracking-wide">
                  {item.title}
                </h4>
                <p className="text-xs text-[#737373]">{item.category}</p>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                {/* Status Badge (Matches Screenshot 2) */}
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    item.status === "In Progress"
                      ? "bg-white text-[#990000]"
                      : "bg-[#1E1E1E] text-[#A3A3A3]"
                  }`}
                >
                  {item.status}
                </span>

                {/* Enroll / Open Button (Matches Screenshot 2) */}
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 h-9 px-4 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                >
                  <span>Enroll / Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
