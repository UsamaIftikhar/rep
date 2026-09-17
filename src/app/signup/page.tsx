"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, Button, Input, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Flame, Loader2, ShieldCheck, CheckCircle2, DollarSign, Lock } from "lucide-react";

function SignupForm() {
  const { signup } = useAuth();
  const searchParams = useSearchParams();

  const rawPlan = searchParams.get("plan");
  const courseSlugParam = searchParams.get("courseSlug") || "";
  const courseIdParam = searchParams.get("courseId") || "";

  const isPlanLocked = searchParams.has("plan") || Boolean(courseSlugParam || courseIdParam);

  const initialPlan = rawPlan || "us_athlete";

  const [region, setRegion] = React.useState<"us" | "international" | "course">(
    initialPlan === "course" || courseSlugParam || courseIdParam
      ? "course"
      : initialPlan === "international" || initialPlan === "elite_pacific"
      ? "international"
      : "us"
  );

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sport, setSport] = React.useState("basketball");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getPriceSummary = () => {
    if (region === "course") {
      return {
        title: "Single Classroom Course Pass",
        amount: "$9.99",
        subtitle: "One-time enrollment fee for selected course",
        type: "COURSE",
      };
    }
    if (region === "international") {
      return {
        title: "International Athlete Pass (Elite Pacific)",
        amount: "$29.99",
        subtitle: "Full global roster placement, collegiate pathway, and student academy access",
        type: "INTERNATIONAL",
      };
    }
    return {
      title: "US Student Athlete Pass",
      amount: "$29.99",
      subtitle: "Full access to student academy, AI interview prep, and athlete profile tools",
      type: "US_ATHLETE",
    };
  };

  const currentPrice = getPriceSummary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signup({
        firstName,
        lastName,
        email,
        password,
        sport,
        role: "ATHLETE",
        planType: region,
        courseId: courseIdParam || undefined,
      });

      if (!res.success) {
        setError(res.error || "Registration failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch {
      setError("An unexpected error occurred during signup.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#111111] border-white/10">
      <CardContent className="space-y-4 pt-6">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                First Name
              </label>
              <Input
                placeholder="Jordan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
                Last Name
              </label>
              <Input
                placeholder="Davis"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="jordan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#A3A3A3]">
                Selected Membership Tier / Pass
              </label>
              {isPlanLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F21717]">
                  <Lock className="w-3 h-3" /> Selected & Locked
                </span>
              )}
            </div>
            <Select
              options={[
                { value: "us", label: "US / American Athlete ($29.99)" },
                { value: "international", label: "International Athlete ($29.99)" },
                ...(region === "course" || initialPlan === "course"
                  ? [{ value: "course", label: "Single Classroom Course ($9.99)" }]
                  : []),
              ]}
              value={region}
              onChange={(e) => setRegion(e.target.value as "us" | "international" | "course")}
              disabled={isSubmitting || isPlanLocked}
            />
            {isPlanLocked && (
              <p className="text-[11px] text-[#737373] mt-1">
                Locked to your selected option. To choose a different tier, visit our{" "}
                <Link href="/pricing" className="text-[#F21717] hover:underline font-semibold">
                  Pricing Page
                </Link>
                .
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
              Primary Sport
            </label>
            <Select
              options={[
                { value: "football", label: "American Football" },
                { value: "flag_football", label: "Flag Football" },
                { value: "basketball", label: "Basketball" },
                { value: "volleyball", label: "Volleyball" },
                { value: "swimming", label: "Swimming" },
                { value: "golf", label: "Golf" },
                { value: "rugby", label: "Rugby League / Union" },
                { value: "soccer", label: "Soccer" },
                { value: "track", label: "Track & Field" },
                { value: "other", label: "Other" },
              ]}
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">
              Create Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Summary Box */}
          <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">
                Total Due Today
              </span>
              <span className="font-display font-black text-xl text-[#F21717]">
                {currentPrice.amount}
              </span>
            </div>
            <p className="text-xs font-semibold text-white">{currentPrice.title}</p>
            <p className="text-[11px] text-[#A3A3A3] leading-normal">{currentPrice.subtitle}</p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mandatory payment at signup • Instant full access</span>
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="athletic"
              size="md"
              className="w-full gap-2 font-bold bg-[#F21717] hover:bg-[#D90F0F]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Signup & Payment...
                </>
              ) : (
                <>
                  Pay {currentPrice.amount} & Register <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-9 h-9 rounded-lg bg-[#F21717] flex items-center justify-center text-white shadow-[0_0_20px_rgba(242,23,23,0.5)]">
              <Flame className="w-5 h-5 fill-current text-white" />
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-white uppercase">
              REP <span className="text-[#F21717]">1</span>
            </span>
          </Link>
          <h1 className="font-display uppercase text-3xl font-black text-white">
            Create Athlete Account
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            Select your membership tier and register your official REP 1 recruiting profile.
          </p>
        </div>

        <React.Suspense
          fallback={
            <div className="py-12 text-center text-[#A3A3A3]">
              <Loader2 className="w-6 h-6 animate-spin text-[#F21717] mx-auto mb-2" />
              <p className="text-xs uppercase tracking-widest font-semibold">Loading registration...</p>
            </div>
          }
        >
          <SignupForm />
        </React.Suspense>

        <p className="text-center text-xs text-[#737373]">
          Already have an athlete account?{" "}
          <Link href="/login" className="text-[#F21717] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
