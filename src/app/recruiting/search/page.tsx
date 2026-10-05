"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardContent, Button, Input, Select } from "@/components/ui";
import { Search, Filter, MapPin, School, Calendar, ArrowRight, Loader2, UserCheck, Shield, Lock, User, ArrowLeft, X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SearchAthlete {
  id: string;
  slug: string;
  schoolClub: string | null;
  graduationYear: number | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  bio: string | null;
  profilePhoto: string | null;
  profileCompleteness: number;
  potentialDivision?: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    badges?: Array<{
      badge: {
        title: string;
        key: string;
      };
    }>;
  };
}

export default function RecruitSearchPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = React.useState("");
  const [sport, setSport] = React.useState("");
  const [gradYear, setGradYear] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [athleteType, setAthleteType] = React.useState("");

  const [athletes, setAthletes] = React.useState<SearchAthlete[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [accessError, setAccessError] = React.useState<string | null>(null);
  const [isPublicPreview, setIsPublicPreview] = React.useState(false);
  const [signInModalSlug, setSignInModalSlug] = React.useState<string | null>(null);

  const fetchAthletes = React.useCallback(async () => {
    // Authenticated non-recruiter/admin: skip querying
    if (user && user.role !== "RECRUITER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sport) params.set("sport", sport);
    if (gradYear) params.set("graduationYear", gradYear);
    if (location) params.set("location", location);
    if (level) params.set("level", level);
    if (athleteType) params.set("athleteType", athleteType);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/recruiting/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAthletes(data.athletes || []);
        setIsPublicPreview(!!data.isPublicPreview);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      } else if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        setAccessError(err.error || "Access Denied: The recruit database is reserved for college recruiters.");
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  }, [user, query, sport, gradYear, location, level, athleteType, page]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchAthletes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAthletes]);

  // Recruits/Athletes can ONLY access their own page
  if (!isLoading && user?.role === "ATHLETE") {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              RECRUITS ACCESS RESTRICTED
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recruits Cannot Access the Recruiter Database
            </h2>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              As an athlete recruit, your access is focused on your personal athlete showcase profile, highlight reels, and training. The college scouting database is reserved strictly for verified college scouts and recruiters.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/profile">
              <Button className="bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2">
                <User className="w-4 h-4" /> Go to My Athlete Profile
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Coaches enrolled in Coaches Academy cannot access recruit database
  if (!isLoading && (user?.role === "COACHES_ACADEMY_MEMBER" || user?.role === "COACHES_ACADEMY_PRESENTER")) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F21717]/10 border border-[#F21717]/30 flex items-center justify-center text-[#F21717] mx-auto shadow-lg shadow-[#F21717]/10">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#F21717] uppercase tracking-widest bg-[#F21717]/10 border border-[#F21717]/20 px-3 py-1 rounded-full">
              COACHES ACADEMY
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Recruit Database Reserved for College Scouts
            </h2>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              Coaches enrolled in the Coaches Academy cannot access the athlete recruit scouting database. Please return to the Coaches Academy to access live classrooms, chalk-talk whiteboards, and coaching playbooks.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/coaches-academy">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2">
                <ArrowLeft className="w-4 h-4" /> Go to Coaches Academy Hub
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Not signed in: allow but they'll see a public preview (no lock-out)
  // The sign-in modal appears when clicking an individual profile

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiting Database"
        title="Athlete Recruiter Search"
        description="Filter and evaluate verified high school and college athletes by region (US vs International), sport, position, program level, graduation year, and location."
      />

      {/* Sign-In Modal for Public Preview */}
      {signInModalSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSignInModalSlug(null)}>
          <div
            className="relative bg-[#111111] border border-white/15 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSignInModalSlug(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#F21717]/15 border border-[#F21717]/40 flex items-center justify-center mx-auto shadow-lg shadow-[#F21717]/10">
              <Lock className="w-8 h-8 text-[#F21717]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F21717]/10 border border-[#F21717]/30 text-[11px] font-bold text-[#F21717] uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5" /> Recruiter Access Required
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Sign In to View Full Profile
              </h2>
              <p className="text-sm text-[#A3A3A3] leading-relaxed">
                Full athlete profiles — including verified combine metrics, GPA, highlight film, and contact info — are exclusively available to verified college coaches and scouts.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href={`/login?callbackUrl=/athletes/${signInModalSlug}`} className="w-full">
                <Button className="w-full gap-2 bg-[#F21717] hover:bg-[#D01414] text-white font-bold text-sm py-3 rounded-xl">
                  <LogIn className="w-4 h-4" /> Sign In to Recruiter Account
                </Button>
              </Link>
              <Link href={`/signup?plan=recruiter&callbackUrl=/athletes/${signInModalSlug}`} className="w-full">
                <Button variant="outline" className="w-full gap-2 border-white/20 hover:border-[#F21717] text-white font-semibold text-sm py-3 rounded-xl">
                  <UserPlus className="w-4 h-4" /> Create Account ($49.99/yr)
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-[#737373]">
              Already scouting? Sign in to unlock the full REP 1 recruit database.
            </p>
          </div>
        </div>
      )}

      {/* Public Preview Banner */}
      {isPublicPreview && (
        <div className="mb-2 rounded-2xl bg-gradient-to-r from-[#F21717]/10 via-[#F21717]/5 to-transparent border border-[#F21717]/25 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Shield className="w-5 h-5 text-[#F21717]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Recruit Database Preview</p>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                You're viewing a public preview. Sign in or create a recruiter account to access full profiles, combine metrics, GPA, highlight reels, and contact info.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login?callbackUrl=/recruiting/search">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:border-[#F21717] text-xs font-semibold px-4">
                Sign In
              </Button>
            </Link>
            <Link href="/signup?plan=recruiter&callbackUrl=/recruiting/search">
              <Button size="sm" className="bg-[#F21717] hover:bg-[#D01414] text-white text-xs font-bold px-4">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-16">
        {/* Search & Filters Toolbar */}
        <Card className="bg-[#111111] border-white/10 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search athletes by name, school, or position..."
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <Select
                  value={athleteType}
                  onChange={(e) => {
                    setAthleteType(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: "", label: "All Regions (US & Intl)" },
                    { value: "us", label: "🇺🇸 US Athletes" },
                    { value: "international", label: "🌏 International Athletes" },
                  ]}
                  className="w-full sm:w-48"
                />

                <Select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: "", label: "All Program Levels" },
                    { value: "power_4", label: "Power 4" },
                    { value: "division_1", label: "Division 1 (D1)" },
                    { value: "division_2", label: "Division 2 (D2)" },
                    { value: "division_3", label: "Division 3 (D3)" },
                    { value: "juco", label: "JUCO (NJCAA)" },
                    { value: "hbcu", label: "HBCU" },
                    { value: "naia", label: "NAIA" },
                  ]}
                  className="w-full sm:w-44"
                />

                <Select
                  value={sport}
                  onChange={(e) => {
                    setSport(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: "", label: "All Sports" },
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
                  className="w-full sm:w-36"
                />

                <Select
                  value={gradYear}
                  onChange={(e) => {
                    setGradYear(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: "", label: "All Class Years" },
                    { value: "2024", label: "Class of 2024" },
                    { value: "2025", label: "Class of 2025" },
                    { value: "2026", label: "Class of 2026" },
                    { value: "2027", label: "Class of 2027" },
                    { value: "2028", label: "Class of 2028" },
                  ]}
                  className="w-full sm:w-36"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#A3A3A3] pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5 font-semibold">
                <Filter className="w-3.5 h-3.5 text-[#F21717]" /> {total} Verified Prospects Found
              </span>

              {(query || sport || gradYear || location || level || athleteType) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSport("");
                    setGradYear("");
                    setLocation("");
                    setLevel("");
                    setAthleteType("");
                    setPage(1);
                  }}
                  className="text-[#F21717] hover:underline cursor-pointer font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#A3A3A3]">
            <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-semibold">Searching Recruiter Database...</p>
          </div>
        ) : athletes.length === 0 ? (
          <Card className="bg-[#111111] border-white/10 p-12 text-center">
            <UserCheck className="w-12 h-12 text-[#737373] mx-auto mb-3" />
            <h3 className="font-display uppercase text-xl font-bold text-white mb-1">No Athletes Match Search</h3>
            <p className="text-xs text-[#A3A3A3]">Try adjusting your sport or graduation year filter.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((a) => (
              <Card key={a.id} hoverEffect className="bg-[#111111] border-white/10 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center font-display font-black text-white text-xl flex-shrink-0 overflow-hidden">
                      {a.profilePhoto ? (
                        <img src={a.profilePhoto} alt={a.user.name || "Athlete"} className="w-full h-full object-cover" />
                      ) : (
                        a.user.firstName?.[0] || a.user.name?.[0] || "A"
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F21717]">
                        {a.sport || "ATHLETE"} • {a.position || "PROSPECT"}
                      </span>
                      <h4 className="font-display uppercase text-lg font-bold text-white leading-tight">
                        {a.user.name || `${a.user.firstName} ${a.user.lastName}`}
                      </h4>
                      {a.potentialDivision && (
                        <div className="inline-block mt-1 px-2 py-0.5 rounded bg-[#F21717]/10 text-[#F21717] border border-[#F21717]/20 text-[10px] font-bold uppercase tracking-wider">
                          {a.potentialDivision.replace(/_/g, " ")} Prospect
                        </div>
                      )}
                      {a.user.badges && a.user.badges.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-semibold text-emerald-400">Academy Graduate</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#A3A3A3] pt-2 border-t border-white/5">
                    {a.schoolClub && (
                      <div className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-[#F21717]" />
                        <span className="truncate">{a.schoolClub}</span>
                      </div>
                    )}
                    {a.graduationYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#F21717]" />
                        <span>Class of {a.graduationYear}</span>
                      </div>
                    )}
                    {a.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F21717]" />
                        <span>{a.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  {isPublicPreview ? (
                    <button
                      onClick={() => setSignInModalSlug(a.slug)}
                      className="w-full flex items-center justify-center gap-1.5 text-sm py-2 px-3 rounded-lg border border-white/15 hover:border-[#F21717] text-[#A3A3A3] hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#F21717]" /> View Full Profile
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link href={`/athletes/${a.slug}`}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5 hover:border-[#F21717]">
                        View Athlete Profile <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
              size="sm"
            >
              Previous Page
            </Button>
            <span className="text-xs text-[#A3A3A3]">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              size="sm"
            >
              Next Page
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
