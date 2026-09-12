"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Textarea } from "@/components/ui";
import { ShieldCheck, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [schoolClub, setSchoolClub] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("2026");
  const [location, setLocation] = React.useState("");
  const [sport, setSport] = React.useState("football");
  const [position, setPosition] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [highlightVideoUrl, setHighlightVideoUrl] = React.useState("");
  const [profileVisibility, setProfileVisibility] = React.useState(true);
  const [profileCompleteness, setProfileCompleteness] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.profile) {
          const p = data.profile;
          setFirstName(p.user?.firstName || user?.firstName || "");
          setLastName(p.user?.lastName || user?.lastName || "");
          setSchoolClub(p.schoolClub || "");
          setGraduationYear(p.graduationYear ? String(p.graduationYear) : "2026");
          setLocation(p.location || "");
          setSport(p.sport || "football");
          setPosition(p.position || "");
          setBio(p.bio || "");
          setHighlightVideoUrl(p.highlightVideoUrl || "");
          setProfileVisibility(p.profileVisibility ?? true);
          setProfileCompleteness(p.profileCompleteness || 0);
        }
      })
      .catch(() => {
        if (mounted) setErrorMessage("Failed to load profile data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          schoolClub,
          graduationYear: parseInt(graduationYear, 10) || 2026,
          location,
          sport,
          position,
          bio,
          highlightVideoUrl,
          profileVisibility,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save settings");
      } else {
        setSuccessMessage("Settings saved successfully!");
        if (data.profile?.profileCompleteness !== undefined) {
          setProfileCompleteness(data.profile.profileCompleteness);
        }
      }
    } catch {
      setErrorMessage("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleStripePortal = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Stripe portal configuration pending");
      }
    } catch {
      alert("Unable to open billing portal");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center text-[#A3A3A3]">
          <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mb-2" />
          <p className="text-xs uppercase tracking-widest font-semibold">Loading profile settings...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Account & Profile"
        title="Settings"
        description="Manage your athlete profile details, billing subscription, and platform preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle isDisplay>Personal Information</CardTitle>
                  <CardDescription>Update your public recruiting profile data.</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Completeness</span>
                  <span className="font-display font-black text-lg text-[#F21717]">{profileCompleteness}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {successMessage && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">First Name</label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Last Name</label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">High School / Club</label>
                    <Input value={schoolClub} onChange={(e) => setSchoolClub(e.target.value)} placeholder="Mater Dei High School" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Graduation Year</label>
                    <Select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      options={[
                        { value: "2024", label: "2024" },
                        { value: "2025", label: "2025" },
                        { value: "2026", label: "2026" },
                        { value: "2027", label: "2027" },
                        { value: "2028", label: "2028" },
                        { value: "2029", label: "2029" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Location / City</label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Los Angeles, CA" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Primary Sport</label>
                    <Select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      options={[
                        { value: "football", label: "American Football" },
                        { value: "basketball", label: "Basketball" },
                        { value: "rugby", label: "Rugby League / Union" },
                        { value: "soccer", label: "Soccer" },
                        { value: "track", label: "Track & Field" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Position / Event</label>
                  <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Quarterback / Safety" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Recruiting Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share your athletic achievements, academic goals, and leadership experiences..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Highlight Reel Video URL</label>
                  <Input value={highlightVideoUrl} onChange={(e) => setHighlightVideoUrl(e.target.value)} placeholder="https://hudl.com/... or YouTube link" />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="profileVisibility"
                      checked={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-black text-[#F21717] focus:ring-[#F21717]"
                    />
                    <label htmlFor="profileVisibility" className="text-xs text-[#A3A3A3] cursor-pointer">
                      Make my profile visible in Recruiter Search
                    </label>
                  </div>

                  <Button type="submit" variant="primary" size="md" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle isDisplay>Membership & Billing</CardTitle>
              <CardDescription>Your current subscription tier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
                  <span className="text-sm font-bold text-white uppercase font-display">REP 1 Member Tier</span>
                </div>
                <p className="text-xs text-[#A3A3A3]">Active via Stripe • Renews monthly</p>
              </div>
              <Button onClick={handleStripePortal} variant="outline" size="sm" className="w-full gap-2">
                <CreditCard className="w-4 h-4" /> Manage in Stripe Portal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle isDisplay>Account Identity</CardTitle>
              <CardDescription>Your verified login details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center font-bold text-white text-sm">
                  {user?.firstName?.[0] || user?.email?.[0] || "A"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name || `${firstName} ${lastName}`}</p>
                  <p className="text-xs text-[#A3A3A3]">{user?.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block mb-1">Role</span>
                <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 text-xs font-semibold text-white uppercase">
                  {user?.role || "ATHLETE"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
