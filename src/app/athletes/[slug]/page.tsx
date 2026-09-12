"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { Button, Card, CardContent, Badge as UIBadge } from "@/components/ui";
import { Shield, Award, MapPin, School, Calendar, Trophy, ArrowLeft, Lock, Video, ExternalLink } from "lucide-react";

interface PublicAthlete {
  id: string;
  slug: string;
  schoolClub: string | null;
  graduationYear: number | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  bio: string | null;
  profilePhoto: string | null;
  highlightVideoUrl: string | null;
  profileCompleteness: number;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    role: string;
    badges?: Array<{
      badge: {
        id: string;
        key: string;
        title: string;
        description: string;
      };
    }>;
  };
}

export default function PublicAthleteProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [athlete, setAthlete] = React.useState<PublicAthlete | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;

    fetch(`/api/athletes/${slug}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error("This athlete profile is private.");
          throw new Error("Athlete profile not found.");
        }
        return res.json();
      })
      .then((data) => {
        setAthlete(data.profile);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        <Link href="/recruiting/search" className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-white font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Recruiter Search
        </Link>

        {loading ? (
          <div className="py-20 text-center text-[#A3A3A3]">
            <div className="w-8 h-8 rounded-full border-2 border-[#F21717] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold">Loading Athlete Profile...</p>
          </div>
        ) : error || !athlete ? (
          <Card className="bg-[#111111] border-white/10 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-[#F21717] mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-display uppercase text-2xl font-black text-white mb-2">Profile Unavailable</h2>
            <p className="text-xs text-[#A3A3A3] max-w-md mx-auto mb-6">{error || "The requested athlete profile could not be found."}</p>
            <Link href="/recruiting/search">
              <Button variant="outline" size="sm">Return to Recruiter Directory</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Athlete Header Card */}
            <div className="rounded-2xl bg-[#111111] border border-white/10 p-6 md:p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#F21717]/20 border-2 border-[#F21717]/50 flex items-center justify-center font-display font-black text-white text-3xl flex-shrink-0 shadow-[0_0_30px_rgba(242,23,23,0.3)]">
                  {athlete.user.firstName?.[0] || athlete.user.name?.[0] || "A"}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase">
                      {athlete.sport || "ATHLETE"} • {athlete.position || "PROSPECT"}
                    </span>
                    <UIBadge variant="success" className="text-[10px] uppercase font-bold">
                      Verified Recruit
                    </UIBadge>
                  </div>

                  <h1 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
                    {athlete.user.name || `${athlete.user.firstName} ${athlete.user.lastName}`}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A3A3A3]">
                    {athlete.schoolClub && (
                      <span className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-[#F21717]" /> {athlete.schoolClub}
                      </span>
                    )}
                    {athlete.graduationYear && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F21717]" /> Class of {athlete.graduationYear}
                      </span>
                    )}
                    {athlete.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F21717]" /> {athlete.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Recruiting Bio */}
                <Card className="bg-[#111111] border-white/10">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-display uppercase text-lg font-bold text-white tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#F21717]" /> Recruiting Statement
                    </h3>
                    <p className="text-xs text-[#D4D4D4] leading-relaxed whitespace-pre-line">
                      {athlete.bio || "No recruiting statement published yet."}
                    </p>
                  </CardContent>
                </Card>

                {/* Highlight Video */}
                {athlete.highlightVideoUrl && (
                  <Card className="bg-[#111111] border-white/10">
                    <CardContent className="pt-6 space-y-3">
                      <h3 className="font-display uppercase text-lg font-bold text-white tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#F21717]" /> Highlight Film
                      </h3>
                      <a
                        href={athlete.highlightVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F21717] text-xs font-semibold text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[#F21717]" /> Watch Highlight Film on External Platform
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Earned Badges */}
                <Card className="bg-[#111111] border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-display uppercase text-sm font-bold text-white tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#F21717]" /> Earned Badges
                    </h3>

                    {athlete.user.badges && athlete.user.badges.length > 0 ? (
                      <div className="space-y-2">
                        {athlete.user.badges.map((b) => (
                          <div key={b.badge.id} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#F21717]" />
                            <div>
                              <p className="text-xs font-bold text-white">{b.badge.title}</p>
                              <p className="text-[10px] text-[#A3A3A3]">{b.badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#737373] italic">No Academy badges awarded yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
