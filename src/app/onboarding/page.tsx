"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Select, Textarea } from "@/components/ui";
import { Flame, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { US_STATES, GRADUATION_CLASSES, POSITIONS } from "@/lib/constants";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [schoolClub, setSchoolClub] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("2026");
  const [state, setState] = React.useState("NC");
  const [city, setCity] = React.useState("");
  const [sport, setSport] = React.useState("football");
  const [position, setPosition] = React.useState("QB");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [xUrl, setXUrl] = React.useState("");
  const [collegeOffers, setCollegeOffers] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fullLocation = city.trim() ? `${city.trim()}, ${state}` : state;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user?.firstName || user?.name?.split(" ")[0] || "Athlete",
          lastName: user?.lastName || user?.name?.split(" ")[1] || "",
          schoolClub,
          graduationYear: parseInt(graduationYear, 10) || 2026,
          location: fullLocation,
          state,
          sport,
          position,
          instagramUrl: instagramUrl.trim() || null,
          xUrl: xUrl.trim() || null,
          collegeOffers: collegeOffers.trim() || null,
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
      <div className="w-full max-w-xl space-y-6">
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
            Provide your recruiting info, state, class, social handles, and current college offers so coaches can discover and evaluate you.
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
              {/* High School & Graduation Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">High School / Club</label>
                  <Input
                    value={schoolClub}
                    onChange={(e) => setSchoolClub(e.target.value)}
                    placeholder="e.g. Charlotte Catholic"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Graduation Class</label>
                  <Select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    disabled={isSubmitting}
                    options={GRADUATION_CLASSES}
                  />
                </div>
              </div>

              {/* State Dropdown & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Home State</label>
                  <Select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isSubmitting}
                    options={US_STATES}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Charlotte"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Sport & Position Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Primary Sport</label>
                  <Select
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    disabled={isSubmitting}
                    options={[
                      { value: "football", label: "American Football" },
                      { value: "flag_football", label: "Flag Football" },
                      { value: "basketball", label: "Basketball" },
                      { value: "volleyball", label: "Volleyball" },
                      { value: "soccer", label: "Soccer" },
                      { value: "track", label: "Track & Field" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Primary Position</label>
                  <Select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={isSubmitting}
                    options={POSITIONS}
                  />
                </div>
              </div>

              {/* Instagram & X Social Handles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Instagram Handle / Link</label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="@yourhandle or full link"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">X (Twitter) Profile Link</label>
                  <Input
                    value={xUrl}
                    onChange={(e) => setXUrl(e.target.value)}
                    placeholder="https://x.com/yourhandle"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Current College Scholarship Offers */}
              <div>
                <label className="text-xs font-semibold text-white mb-1.5 block">
                  Current College Scholarship Offers
                </label>
                <Textarea
                  value={collegeOffers}
                  onChange={(e) => setCollegeOffers(e.target.value)}
                  placeholder="e.g. Appalachian State, Charlotte, Coastal Carolina (You can update and add more anytime after setup)"
                  rows={2}
                  disabled={isSubmitting}
                />
                <span className="text-[11px] text-[#737373] mt-1 block">
                  List any college programs that have extended scholarship offers. Leave blank if open.
                </span>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Recruiting Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell recruiters about your athletic goals, combine metrics, and work ethic..."
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
