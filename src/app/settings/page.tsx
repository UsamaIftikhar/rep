"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Textarea } from "@/components/ui";
import { ShieldCheck, CreditCard, CheckCircle2, Loader2, Upload, Camera, Trash2, Copy, Check, ExternalLink, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [slug, setSlug] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [schoolClub, setSchoolClub] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("2026");
  const [location, setLocation] = React.useState("");
  const [sport, setSport] = React.useState("basketball");
  const [position, setPosition] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [profilePhoto, setProfilePhoto] = React.useState("");
  const [xUrl, setXUrl] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [benchPress, setBenchPress] = React.useState("");
  const [squat, setSquat] = React.useState("");
  const [powerClean, setPowerClean] = React.useState("");
  const [fortyTime, setFortyTime] = React.useState("");
  const [vertical, setVertical] = React.useState("");
  const [shuttleTime, setShuttleTime] = React.useState("");
  const [broadJump, setBroadJump] = React.useState("");
  const [gpa, setGpa] = React.useState("");
  const [actSat, setActSat] = React.useState("");
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
          if (p.slug) setSlug(p.slug);
          setFirstName(p.user?.firstName || user?.firstName || "");
          setLastName(p.user?.lastName || user?.lastName || "");
          setSchoolClub(p.schoolClub || "");
          setGraduationYear(p.graduationYear ? String(p.graduationYear) : "2026");
          setLocation(p.location || "");
          setSport(p.sport || "basketball");
          setPosition(p.position || "");
          setBio(p.bio || "");
          setProfilePhoto(p.profilePhoto || "");
          setXUrl(p.xUrl || "");
          setHeight(p.height || "");
          setWeight(p.weight || "");
          setBenchPress(p.benchPress || "");
          setSquat(p.squat || "");
          setPowerClean(p.powerClean || "");
          setFortyTime(p.fortyTime || "");
          setVertical(p.vertical || "");
          setShuttleTime(p.shuttleTime || "");
          setBroadJump(p.broadJump || "");
          setGpa(p.gpa || "");
          setActSat(p.actSat || "");
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
          profilePhoto,
          xUrl,
          height,
          weight,
          benchPress,
          squat,
          powerClean,
          fortyTime,
          vertical,
          shuttleTime,
          broadJump,
          gpa,
          actSat,
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to upload profile photo");
      } else {
        setProfilePhoto(data.url);
        setSuccessMessage("Profile photo uploaded successfully!");
      }
    } catch {
      setErrorMessage("Network error uploading profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCopyLink = () => {
    if (!slug) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/athletes/${slug}` : `https://rep1exposure.com/athletes/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
          {slug && (
            <Card className="bg-[#111111] border-[#F21717]/30 shadow-[0_0_30px_rgba(242,23,23,0.15)]">
              <CardContent className="pt-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center text-[#F21717] flex-shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display uppercase text-sm font-bold text-white tracking-wider">
                        Your Shareable Recruiting Profile Link
                      </h3>
                      <p className="text-[11px] text-[#A3A3A3]">
                        Share this verified URL with college coaches & scouts to view your profile and staff ratings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </Button>

                    <a href={`/athletes/${slug}`} target="_blank" rel="noreferrer">
                      <Button
                        type="button"
                        variant="athletic"
                        size="sm"
                        className="gap-1.5 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Profile
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#171717] border border-white/10 flex items-center justify-between">
                  <span className="font-mono text-xs text-white truncate mr-2">
                    {typeof window !== "undefined" ? `${window.location.origin}/athletes/${slug}` : `https://rep1exposure.com/athletes/${slug}`}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0">
                    Live Link
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Position / Event</label>
                    <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Quarterback / Safety" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Grade Point Average (GPA)</label>
                    <Input value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 3.85" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">ACT / SAT Score</label>
                    <Input value={actSat} onChange={(e) => setActSat(e.target.value)} placeholder="e.g. 28 / 1350" />
                  </div>
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

                {/* Profile Media & Social Links */}
                <div className="pt-2 space-y-4 border-t border-white/10">
                  <h4 className="font-display uppercase text-sm font-bold text-white">Media & Social Links</h4>

                  {/* Upload Profile Photo */}
                  <div className="p-4 rounded-2xl bg-[#171717] border border-white/10 space-y-3">
                    <label className="text-xs font-semibold text-white block uppercase tracking-wider">
                      Athlete Profile Photo
                    </label>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[#F21717]/20 border-2 border-[#F21717]/50 flex items-center justify-center overflow-hidden flex-shrink-0 text-white font-black font-display text-2xl shadow-[0_0_20px_rgba(242,23,23,0.3)]">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                          firstName?.[0] || user?.firstName?.[0] || "A"
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <p className="text-xs text-[#A3A3A3]">
                          Upload a high-resolution headshot or athletic portrait. File is stored directly on the platform server. (JPG, PNG, WEBP — Max 5MB).
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="gap-2 text-xs font-bold border-white/20 hover:border-white text-white"
                          >
                            {uploadingPhoto ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Photo...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-[#F21717]" /> Choose Image File
                              </>
                            )}
                          </Button>

                          {profilePhoto && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setProfilePhoto("")}
                              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            >
                              Remove Photo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">X (Twitter) Profile Link</label>
                      <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="https://x.com/yourhandle" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Highlight Reel Video URL</label>
                      <Input value={highlightVideoUrl} onChange={(e) => setHighlightVideoUrl(e.target.value)} placeholder="https://hudl.com/... or YouTube link" />
                    </div>
                  </div>
                </div>

                {/* Athletic Combine Metrics */}
                <div className="pt-2 space-y-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display uppercase text-sm font-bold text-white">Athletic Combine Metrics</h4>
                    <span className="text-[10px] text-[#F21717] font-bold uppercase tracking-wider">Verified Combine Standards</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Height</label>
                      <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder='e.g. 6&#39;2"' />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Weight</label>
                      <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 215 lbs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Bench Press</label>
                      <Input value={benchPress} onChange={(e) => setBenchPress(e.target.value)} placeholder="e.g. 275 lbs" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Squat</label>
                      <Input value={squat} onChange={(e) => setSquat(e.target.value)} placeholder="e.g. 405 lbs" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Power Clean</label>
                      <Input value={powerClean} onChange={(e) => setPowerClean(e.target.value)} placeholder="e.g. 245 lbs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">40-Yard Dash</label>
                      <Input value={fortyTime} onChange={(e) => setFortyTime(e.target.value)} placeholder="e.g. 4.45s" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Vertical Jump</label>
                      <Input value={vertical} onChange={(e) => setVertical(e.target.value)} placeholder="e.g. 34.5 in" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Shuttle Time</label>
                      <Input value={shuttleTime} onChange={(e) => setShuttleTime(e.target.value)} placeholder="e.g. 4.12s" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Broad Jump</label>
                      <Input value={broadJump} onChange={(e) => setBroadJump(e.target.value)} placeholder="e.g. 10'2&quot;" />
                    </div>
                  </div>
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
