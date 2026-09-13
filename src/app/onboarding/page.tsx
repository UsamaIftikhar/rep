"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Select, Textarea } from "@/components/ui";
import { Flame, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [schoolClub, setSchoolClub] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("2026");
  const [location, setLocation] = React.useState("");
  const [sport, setSport] = React.useState("basketball");
  const [position, setPosition] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user?.firstName || user?.name?.split(" ")[0] || "Athlete",
          lastName: user?.lastName || user?.name?.split(" ")[1] || "",
          schoolClub,
          graduationYear: parseInt(graduationYear, 10) || 2026,
          location,
          sport,
          position,
          bio,
          profileVisibility: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to complete onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Network error while completing onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
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
            Complete Your Athlete Profile
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1 max-w-md mx-auto">
            Provide your basic recruiting info so college coaches and recruiters can identify you.
          </p>
        </div>

        <Card className="bg-[#111111] border-white/10">
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">High School / Club</label>
                  <Input
                    value={schoolClub}
                    onChange={(e) => setSchoolClub(e.target.value)}
                    placeholder="Mater Dei High School"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Graduation Year</label>
                  <Select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    disabled={isSubmitting}
                    options={[
                      { value: "2024", label: "2024" },
                      { value: "2025", label: "2025" },
                      { value: "2026", label: "2026" },
                      { value: "2027", label: "2027" },
                      { value: "2028", label: "2028" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Location (City, State)</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Los Angeles, CA"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Primary Sport</label>
                  <Select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    disabled={isSubmitting}
                    options={[
                      { value: "basketball", label: "Basketball" },
                      { value: "volleyball", label: "Volleyball" },
                      { value: "flag_football", label: "Flag Football" },
                      { value: "swimming", label: "Swimming" },
                      { value: "golf", label: "Golf" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Primary Position / Event</label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Quarterback / Safety"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Short Recruiting Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters about your athletic goals and accomplishments..."
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="athletic"
                  size="md"
                  className="w-full gap-2 font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                    </>
                  ) : (
                    <>
                      Complete Setup & Launch Dashboard <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
