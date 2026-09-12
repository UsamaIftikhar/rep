import { AppShell, PublicNavbar, PublicFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center text-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#F21717] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Locked Gate if user is not signed in (User Request: Student Academy only shows when logged in)
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
            <Link href="/login">
              <Button variant="athletic" size="md" className="gap-2 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]">
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
