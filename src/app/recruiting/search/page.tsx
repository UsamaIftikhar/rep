"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardContent, Button, Input, Select } from "@/components/ui";
import { Search, Filter, MapPin, School, Calendar, ArrowRight, Loader2, UserCheck, Shield } from "lucide-react";

interface SearchAthlete {
  id: string;
  slug: string;
  schoolClub: string | null;
  graduationYear: number | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  bio: string | null;
  profileCompleteness: number;
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
  const [query, setQuery] = React.useState("");
  const [sport, setSport] = React.useState("");
  const [gradYear, setGradYear] = React.useState("");
  const [location, setLocation] = React.useState("");

  const [athletes, setAthletes] = React.useState<SearchAthlete[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const fetchAthletes = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sport) params.set("sport", sport);
    if (gradYear) params.set("graduationYear", gradYear);
    if (location) params.set("location", location);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/recruiting/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAthletes(data.athletes || []);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setLoading(false);
    }
  }, [query, sport, gradYear, location, page]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchAthletes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAthletes]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recruiting Database"
        title="Athlete Recruiter Search"
        description="Filter and evaluate verified high school and college athletes by sport, position, graduation year, and location."
      />

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

              <div className="flex items-center gap-2 w-full sm:w-auto">
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

              {(query || sport || gradYear || location) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSport("");
                    setGradYear("");
                    setLocation("");
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
                    <div className="w-14 h-14 rounded-xl bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center font-display font-black text-white text-xl flex-shrink-0">
                      {a.user.firstName?.[0] || a.user.name?.[0] || "A"}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F21717]">
                        {a.sport || "ATHLETE"} • {a.position || "PROSPECT"}
                      </span>
                      <h4 className="font-display uppercase text-lg font-bold text-white leading-tight">
                        {a.user.name || `${a.user.firstName} ${a.user.lastName}`}
                      </h4>
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
                  <Link href={`/athletes/${a.slug}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 hover:border-[#F21717]">
                      View Athlete Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
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
