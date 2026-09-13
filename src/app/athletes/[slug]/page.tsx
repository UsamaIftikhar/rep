"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { Button, Card, CardContent, Badge as UIBadge } from "@/components/ui";
import { Shield, Award, MapPin, School, Calendar, Trophy, ArrowLeft, Lock, Video, ExternalLink, Activity } from "lucide-react";

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
  xUrl: string | null;
  benchPress: string | null;
  squat: string | null;
  powerClean: string | null;
  fortyTime: string | null;
  vertical: string | null;
  shuttleTime: string | null;
  broadJump: string | null;
  gpa: string | null;
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
  const [isLocked, setIsLocked] = React.useState(false);
  const [requiresLogin, setRequiresLogin] = React.useState(false);
  const [requiresMembership, setRequiresMembership] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;

    fetch(`/api/athletes/${slug}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (data.isLocked) {
            setIsLocked(true);
            setRequiresLogin(Boolean(data.requiresLogin));
            setRequiresMembership(Boolean(data.requiresMembership));
            setError(data.error || "Recruiter membership required to view athlete profiles.");
            return;
          }
          if (res.status === 403) throw new Error("This athlete profile is private.");
          throw new Error("Athlete profile not found.");
        }
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
        ) : isLocked ? (
          <Card className="bg-[#111111] border-[#F21717]/30 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-[0_0_50px_rgba(242,23,23,0.15)] relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F21717]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-[#F21717]/20 border-2 border-[#F21717]/60 flex items-center justify-center text-[#F21717] mx-auto mb-6 shadow-[0_0_30px_rgba(242,23,23,0.3)]">
              <Lock className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F21717]/10 border border-[#F21717]/30 text-[11px] font-bold text-[#F21717] uppercase tracking-widest mb-4">
              <Shield className="w-3.5 h-3.5" /> Recruiter & Member Access Only
            </div>

            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white mb-3">
              {requiresLogin ? "Log In to View Prospect Roster" : "Active Membership Required"}
            </h2>

            <p className="text-xs md:text-sm text-[#A3A3A3] max-w-lg mx-auto mb-8 leading-relaxed">
              {requiresLogin
                ? "This athlete profile, verified combine metrics, GPA, and recruiting film are restricted. Please sign in with your member or recruiter account to view."
                : "Your account does not currently have an active membership pass or recruiter subscription. Upgrade your account to unlock verified athlete profiles."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {requiresLogin ? (
                <>
                  <Link href={`/login?redirect=/athletes/${slug}`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-[#F21717] hover:bg-[#D01414] font-bold uppercase tracking-wider text-xs">
                      Sign In to View Roster
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-bold uppercase tracking-wider text-xs border-white/20 hover:border-white">
                      Join / Become a Member
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 bg-[#F21717] hover:bg-[#D01414] font-bold uppercase tracking-wider text-xs">
                    Get Member Pass ($29.99 / $75)
                  </Button>
                </Link>
              )}
            </div>
          </Card>
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
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#F21717]/20 border-2 border-[#F21717]/50 flex items-center justify-center font-display font-black text-white text-3xl flex-shrink-0 shadow-[0_0_30px_rgba(242,23,23,0.3)] overflow-hidden">
                  {athlete.profilePhoto ? (
                    <img src={athlete.profilePhoto} alt={athlete.user.name || "Athlete"} className="w-full h-full object-cover" />
                  ) : (
                    athlete.user.firstName?.[0] || athlete.user.name?.[0] || "A"
                  )}
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
                    {athlete.gpa && (
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> GPA: {athlete.gpa}
                      </span>
                    )}
                    {athlete.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#F21717]" /> {athlete.location}
                      </span>
                    )}
                    {athlete.xUrl && (
                      <a
                        href={athlete.xUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#00D1B2] hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3 h-3" /> X Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Athletic Combine Performance Metrics */}
                {(athlete.benchPress || athlete.squat || athlete.powerClean || athlete.fortyTime || athlete.vertical || athlete.shuttleTime || athlete.broadJump) && (
                  <Card className="bg-[#111111] border-white/10">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display uppercase text-lg font-bold text-white tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#F21717]" /> Combine & Lifting Metrics
                        </h3>
                        <UIBadge variant="success" className="text-[10px] uppercase">
                          Verified Metrics
                        </UIBadge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {athlete.fortyTime && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">40-Yard Dash</span>
                            <span className="font-display font-black text-lg text-white">{athlete.fortyTime}</span>
                          </div>
                        )}
                        {athlete.vertical && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Vertical Jump</span>
                            <span className="font-display font-black text-lg text-white">{athlete.vertical}</span>
                          </div>
                        )}
                        {athlete.shuttleTime && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Shuttle Time</span>
                            <span className="font-display font-black text-lg text-white">{athlete.shuttleTime}</span>
                          </div>
                        )}
                        {athlete.broadJump && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Broad Jump</span>
                            <span className="font-display font-black text-lg text-white">{athlete.broadJump}</span>
                          </div>
                        )}
                        {athlete.benchPress && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Bench Press</span>
                            <span className="font-display font-black text-lg text-white">{athlete.benchPress}</span>
                          </div>
                        )}
                        {athlete.squat && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Squat</span>
                            <span className="font-display font-black text-lg text-white">{athlete.squat}</span>
                          </div>
                        )}
                        {athlete.powerClean && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Power Clean</span>
                            <span className="font-display font-black text-lg text-white">{athlete.powerClean}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

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
