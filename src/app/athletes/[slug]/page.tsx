"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { Button, Card, CardContent, Badge as UIBadge, Input, Select } from "@/components/ui";
import { Shield, Award, MapPin, School, Calendar, Trophy, ArrowLeft, Lock, Video, ExternalLink, Activity, Star, Edit3, X, Check, Loader2, MessageSquare, BookOpen, CheckCircle2, Users, KeyRound, AlertCircle, Camera, Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface PublicAthlete {
  id: string;
  userId: string;
  slug: string;
  schoolClub: string | null;
  graduationYear: number | null;
  location: string | null;
  sport: string | null;
  position: string | null;
  bio: string | null;
  profilePhoto: string | null;
  xUrl: string | null;
  height?: string | null;
  weight?: string | null;
  benchPress: string | null;
  squat: string | null;
  powerClean: string | null;
  fortyTime: string | null;
  vertical: string | null;
  shuttleTime: string | null;
  broadJump: string | null;
  gpa: string | null;
  actSat: string | null;
  highlightVideoUrl: string | null;
  potentialDivision?: string | null;
  profileCompleteness: number;

  // Staff Evaluation & Ratings
  adminNotes?: string | null;
  ratingSpeed?: number | null;
  ratingExplosiveness?: number | null;
  ratingAgility?: number | null;
  ratingStrength?: number | null;
  ratingToughness?: number | null;
  ratingProduction?: number | null;
  ratingTechnique?: number | null;

  user: {
    id: string;
    email?: string | null;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    image?: string | null;
    role: string;
    status?: string | null;
    badges?: Array<{
      badge: {
        id: string;
        key: string;
        title: string;
        description: string;
      };
    }>;
    enrollments?: Array<{
      id: string;
      status: string;
      completedAt: string | null;
      course: {
        id: string;
        title: string;
        slug: string;
        category: string;
        coverImage: string | null;
      };
    }>;
  };
}

export default function PublicAthleteProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user: currentUser } = useAuth();

  const [athlete, setAthlete] = React.useState<PublicAthlete | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);
  const [requiresLogin, setRequiresLogin] = React.useState(false);
  const [requiresMembership, setRequiresMembership] = React.useState(false);

  // Admin Full Editor Modal State
  const [isEvalModalOpen, setIsEvalModalOpen] = React.useState(false);
  const [editTab, setEditTab] = React.useState<"ratings" | "account" | "profile">("ratings");
  const [isSavingEval, setIsSavingEval] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Form State for User Edit
  const [formFirstName, setFormFirstName] = React.useState("");
  const [formLastName, setFormLastName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formRole, setFormRole] = React.useState<"ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN">("ATHLETE");
  const [formStatus, setFormStatus] = React.useState<"ACTIVE" | "SUSPENDED" | "PENDING_PAYMENT">("ACTIVE");

  // Profile Form State
  const [formSport, setFormSport] = React.useState("");
  const [formPosition, setFormPosition] = React.useState("");
  const [formSchoolClub, setFormSchoolClub] = React.useState("");
  const [formGraduationYear, setFormGraduationYear] = React.useState("");
  const [formLocation, setFormLocation] = React.useState("");
  const [formBio, setFormBio] = React.useState("");
  const [formPhoto, setFormPhoto] = React.useState("");
  const [formHeight, setFormHeight] = React.useState("");
  const [formWeight, setFormWeight] = React.useState("");
  const [formFortyTime, setFormFortyTime] = React.useState("");
  const [formVertical, setFormVertical] = React.useState("");
  const [formBenchPress, setFormBenchPress] = React.useState("");
  const [formSquat, setFormSquat] = React.useState("");
  const [formPowerClean, setFormPowerClean] = React.useState("");
  const [formShuttleTime, setFormShuttleTime] = React.useState("");
  const [formBroadJump, setFormBroadJump] = React.useState("");
  const [formGpa, setFormGpa] = React.useState("");
  const [formActSat, setFormActSat] = React.useState("");
  const [formHighlightVideoUrl, setFormHighlightVideoUrl] = React.useState("");

  // Staff Scouting Evaluation & 1-5 Ratings State
  const [formAdminNotes, setFormAdminNotes] = React.useState("");
  const [formPotentialDivision, setFormPotentialDivision] = React.useState("");
  const [formRatingSpeed, setFormRatingSpeed] = React.useState<number>(0);
  const [formRatingExplosiveness, setFormRatingExplosiveness] = React.useState<number>(0);
  const [formRatingAgility, setFormRatingAgility] = React.useState<number>(0);
  const [formRatingStrength, setFormRatingStrength] = React.useState<number>(0);
  const [formRatingToughness, setFormRatingToughness] = React.useState<number>(0);
  const [formRatingProduction, setFormRatingProduction] = React.useState<number>(0);
  const [formRatingTechnique, setFormRatingTechnique] = React.useState<number>(0);

  // Admin Password Reset State
  const [adminNewPassword, setAdminNewPassword] = React.useState("");
  const [adminResettingPassword, setAdminResettingPassword] = React.useState(false);
  const [adminPasswordResetSuccess, setAdminPasswordResetSuccess] = React.useState<string | null>(null);
  const [adminPasswordResetError, setAdminPasswordResetError] = React.useState<string | null>(null);

  // Admin Profile Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const fetchProfile = React.useCallback(() => {
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

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEvalModal = () => {
    if (!athlete) return;
    setEditTab("ratings");
    setSaveSuccess(false);

    setAdminNewPassword("");
    setAdminResettingPassword(false);
    setAdminPasswordResetSuccess(null);
    setAdminPasswordResetError(null);

    setFormFirstName(athlete.user.firstName || "");
    setFormLastName(athlete.user.lastName || "");
    setFormEmail(athlete.user.email || "");
    setFormRole((athlete.user.role as any) || "ATHLETE");
    setFormStatus((athlete.user.status as any) || "ACTIVE");

    setFormSport(athlete.sport || "");
    setFormPosition(athlete.position || "");
    setFormSchoolClub(athlete.schoolClub || "");
    setFormGraduationYear(athlete.graduationYear ? String(athlete.graduationYear) : "");
    setFormLocation(athlete.location || "");
    setFormBio(athlete.bio || "");
    setFormPhoto(athlete.profilePhoto || athlete.user.image || "");
    setFormHeight(athlete.height || "");
    setFormWeight(athlete.weight || "");
    setFormFortyTime(athlete.fortyTime || "");
    setFormVertical(athlete.vertical || "");
    setFormBenchPress(athlete.benchPress || "");
    setFormSquat(athlete.squat || "");
    setFormPowerClean(athlete.powerClean || "");
    setFormShuttleTime(athlete.shuttleTime || "");
    setFormBroadJump(athlete.broadJump || "");
    setFormGpa(athlete.gpa || "");
    setFormActSat(athlete.actSat || "");
    setFormHighlightVideoUrl(athlete.highlightVideoUrl || "");

    setFormAdminNotes(athlete.adminNotes || "");
    setFormPotentialDivision(athlete.potentialDivision || "");
    setFormRatingSpeed(athlete.ratingSpeed || 0);
    setFormRatingExplosiveness(athlete.ratingExplosiveness || 0);
    setFormRatingAgility(athlete.ratingAgility || 0);
    setFormRatingStrength(athlete.ratingStrength || 0);
    setFormRatingToughness(athlete.ratingToughness || 0);
    setFormRatingProduction(athlete.ratingProduction || 0);
    setFormRatingTechnique(athlete.ratingTechnique || 0);

    setIsEvalModalOpen(true);
  };

  const handleAdminPhotoUpload = async (file: File) => {
    if (!file || !athlete) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetUserId", athlete.userId);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload profile photo");
        return;
      }

      if (data.url) {
        setFormPhoto(data.url);
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAdminResetPassword = async () => {
    if (!athlete || !adminNewPassword) return;
    setAdminResettingPassword(true);
    setAdminPasswordResetSuccess(null);
    setAdminPasswordResetError(null);

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: athlete.userId,
          newPassword: adminNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminPasswordResetError(data.error || "Failed to reset password");
      } else {
        setAdminPasswordResetSuccess("Password successfully updated!");
        setAdminNewPassword("");
      }
    } catch {
      setAdminPasswordResetError("Network error resetting password");
    } finally {
      setAdminResettingPassword(false);
    }
  };

  const handleSaveEval = async () => {
    if (!athlete) return;
    setIsSavingEval(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: athlete.userId,
          email: formEmail,
          firstName: formFirstName,
          lastName: formLastName,
          role: formRole,
          status: formStatus,
          profile: {
            sport: formSport || null,
            position: formPosition || null,
            schoolClub: formSchoolClub || null,
            graduationYear: formGraduationYear ? parseInt(formGraduationYear) : null,
            location: formLocation || null,
            bio: formBio || null,
            profilePhoto: formPhoto || null,
            height: formHeight || null,
            weight: formWeight || null,
            benchPress: formBenchPress || null,
            squat: formSquat || null,
            powerClean: formPowerClean || null,
            fortyTime: formFortyTime || null,
            vertical: formVertical || null,
            shuttleTime: formShuttleTime || null,
            broadJump: formBroadJump || null,
            gpa: formGpa || null,
            actSat: formActSat || null,
            highlightVideoUrl: formHighlightVideoUrl || null,
            adminNotes: formAdminNotes || null,
            potentialDivision: formPotentialDivision || null,
            ratingSpeed: formRatingSpeed > 0 ? formRatingSpeed : null,
            ratingExplosiveness: formRatingExplosiveness > 0 ? formRatingExplosiveness : null,
            ratingAgility: formRatingAgility > 0 ? formRatingAgility : null,
            ratingStrength: formRatingStrength > 0 ? formRatingStrength : null,
            ratingToughness: formRatingToughness > 0 ? formRatingToughness : null,
            ratingProduction: formRatingProduction > 0 ? formRatingProduction : null,
            ratingTechnique: formRatingTechnique > 0 ? formRatingTechnique : null,
          },
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setIsEvalModalOpen(false);
          fetchProfile();
        }, 600);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update user details");
      }
    } catch {
      alert("Failed to update user details");
    } finally {
      setIsSavingEval(false);
    }
  };

  const renderPhotoUploadSection = () => (
    <div>
      <label className="font-bold text-[#A3A3A3] block mb-2 flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-[#F21717]" /> Profile Photo / Avatar
      </label>
      <div className="flex items-center gap-4 p-3 rounded-xl bg-[#171717] border border-white/10">
        <div className="w-14 h-14 rounded-full bg-neutral-800 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
          {formPhoto ? (
            <img src={formPhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-neutral-500" />
          )}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAdminPhotoUpload(f);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs font-semibold gap-1.5 border-[#F21717]/40 text-white hover:bg-[#F21717]/20"
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#F21717]" /> Upload Photo
                </>
              )}
            </Button>
            {formPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFormPhoto("")}
                className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[#A3A3A3]">Upload a PNG, JPG, or WEBP (Max 5MB). Photo updates dynamically.</p>
        </div>
      </div>
    </div>
  );

  const renderStarRatingPicker = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div className="p-3 rounded-xl bg-[#171717] border border-white/10 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-white uppercase tracking-wider">{label}</span>
        <span className={`text-[11px] font-bold ${value > 0 ? "text-amber-400" : "text-[#737373]"}`}>
          {value > 0 ? `${value}.0 / 5.0` : "Unrated"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(value === star ? 0 : star)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
              star <= value
                ? "bg-[#F21717] text-white shadow-[0_0_10px_rgba(242,23,23,0.5)] scale-105"
                : "bg-white/5 text-[#737373] hover:bg-white/10 hover:text-white"
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    </div>
  );

  const isAdminUser = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  // Calculate Overall Staff Rating
  const ratingValues = athlete
    ? [
        athlete.ratingSpeed,
        athlete.ratingExplosiveness,
        athlete.ratingAgility,
        athlete.ratingStrength,
        athlete.ratingToughness,
        athlete.ratingProduction,
        athlete.ratingTechnique,
      ].filter((r): r is number => r != null && r > 0)
    : [];

  const overallScore = ratingValues.length > 0
    ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
    : null;

  const skillAttributes = [
    { key: "Speed", label: "Speed", value: athlete?.ratingSpeed, icon: "⚡" },
    { key: "Explosiveness", label: "Explosiveness", value: athlete?.ratingExplosiveness, icon: "💥" },
    { key: "Agility", label: "Agility", value: athlete?.ratingAgility, icon: "🔄" },
    { key: "Strength", label: "Strength", value: athlete?.ratingStrength, icon: "💪" },
    { key: "Toughness", label: "Toughness", value: athlete?.ratingToughness, icon: "🛡️" },
    { key: "Production", label: "Production", value: athlete?.ratingProduction, icon: "📈" },
    { key: "Technique", label: "Technique", value: athlete?.ratingTechnique, icon: "🎯" },
  ];

  const renderAttributeBar = (label: string, icon: string, value: number | null | undefined) => {
    const score = value || 0;
    const pct = (score / 5) * 100;

    return (
      <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span>{icon}</span> {label}
          </span>
          <span className="font-display font-black text-[#F21717]">
            {score > 0 ? `${score.toFixed(1)} / 5.0` : "N/A"}
          </span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#F21717] to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  const renderRatingSelector = (label: string, val: number, setVal: (n: number) => void) => (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white uppercase">{label}</span>
        <span className="font-display font-black text-[#F21717]">
          {val > 0 ? `${val.toFixed(1)} / 5.0` : "Unrated"}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setVal(val === star ? 0 : star)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              star <= val
                ? "bg-[#F21717] text-white shadow-[0_0_10px_rgba(242,23,23,0.5)]"
                : "bg-white/10 text-[#737373] hover:bg-white/20 hover:text-white"
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/recruiting/search" className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-white font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiter Search
          </Link>

          {isAdminUser && athlete && (
            <Button
              onClick={handleOpenEvalModal}
              size="sm"
              className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] font-bold text-xs shadow-[0_0_15px_rgba(242,23,23,0.4)]"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Staff Ratings & Notes
            </Button>
          )}
        </div>

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
                    Get Member Pass ($29.99)
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
                    {athlete.potentialDivision && (
                      <UIBadge variant="outline" className="text-[10px] uppercase font-bold border-[#F21717]/40 text-[#F21717] bg-[#F21717]/10">
                        {athlete.potentialDivision.replace(/_/g, " ")} Level Prospect
                      </UIBadge>
                    )}
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
                    {athlete.height && (
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Activity className="w-3.5 h-3.5 text-[#F21717]" /> Height: {athlete.height}
                      </span>
                    )}
                    {athlete.weight && (
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Activity className="w-3.5 h-3.5 text-[#F21717]" /> Weight: {athlete.weight}
                      </span>
                    )}
                    {athlete.gpa && (
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> GPA: {athlete.gpa}
                      </span>
                    )}
                    {athlete.actSat && (
                      <span className="flex items-center gap-1.5 font-semibold text-white">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> ACT/SAT: {athlete.actSat}
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

                {/* Overall Rating Badge Header */}
                {overallScore && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-[#F21717]/20 border border-amber-500/30 text-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      Staff Overall Rating
                    </span>
                    <div className="flex items-center justify-center gap-1 font-display font-black text-2xl text-white my-0.5">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {overallScore}
                    </div>
                    <span className="text-[10px] text-[#A3A3A3]">Out of 5.0</span>
                  </div>
                )}
              </div>
            </div>

            {/* STAFF SCOUTING EVALUATION & RATINGS CARD */}
            {(overallScore || athlete.adminNotes) && (
              <Card className="bg-[#111111] border-[#F21717]/30 shadow-[0_0_30px_rgba(242,23,23,0.1)]">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F21717]/20 border border-[#F21717]/40 flex items-center justify-center text-[#F21717]">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display uppercase text-lg font-bold text-white tracking-wider">
                          Official Staff Scouting Report
                        </h3>
                        <p className="text-[11px] text-[#A3A3A3]">
                          Evaluated by REP 1 Scouting Staff
                        </p>
                      </div>
                    </div>

                    {overallScore && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Overall Rating: {overallScore} / 5.0
                      </div>
                    )}
                  </div>

                  {/* 1 to 5 Attribute Ratings Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">
                      Verified 1-5 Skill Attribute Evaluation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {skillAttributes.map((attr) => renderAttributeBar(attr.label, attr.icon, attr.value))}
                    </div>
                  </div>

                  {/* Staff Scouting Commentary / Notes */}
                  {athlete.adminNotes && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#F21717] uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-[#F21717]" /> Staff Evaluation & Scout Commentary
                      </div>
                      <p className="text-xs text-[#D4D4D4] leading-relaxed whitespace-pre-line">
                        {athlete.adminNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Athletic Combine Performance Metrics */}
                {(athlete.height || athlete.weight || athlete.benchPress || athlete.squat || athlete.powerClean || athlete.fortyTime || athlete.vertical || athlete.shuttleTime || athlete.broadJump) && (
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
                        {athlete.height && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Height</span>
                            <span className="font-display font-black text-lg text-white">{athlete.height}</span>
                          </div>
                        )}
                        {athlete.weight && (
                          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-[#A3A3A3] uppercase block">Weight</span>
                            <span className="font-display font-black text-lg text-white">{athlete.weight}</span>
                          </div>
                        )}
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

                {/* Completed Academy Classes */}
                <Card className="bg-[#111111] border-white/10">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display uppercase text-sm font-bold text-white tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#F21717]" /> Completed Academy Classes
                      </h3>
                      {athlete.user.enrollments && athlete.user.enrollments.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#F21717]/20 border border-[#F21717]/30 text-[10px] font-bold text-[#F21717]">
                          {athlete.user.enrollments.length} Completed
                        </span>
                      )}
                    </div>

                    {athlete.user.enrollments && athlete.user.enrollments.length > 0 ? (
                      <div className="space-y-3">
                        {athlete.user.enrollments.map((e) => (
                          <Link
                            key={e.id}
                            href={`/courses/${e.course.slug}`}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#F21717]/60 hover:bg-white/[0.08] transition-all flex items-center justify-between gap-3 group block"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-[#F21717] uppercase tracking-wider block">
                                  {e.course.category || "Student Academy"}
                                </span>
                                <h4 className="text-xs font-bold text-white group-hover:text-[#F21717] transition-colors leading-snug">
                                  {e.course.title}
                                </h4>
                                {e.completedAt && (
                                  <p className="text-[10px] text-[#A3A3A3] mt-0.5">
                                    Completed {new Date(e.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px] uppercase tracking-wider">
                                Verified Pass
                              </span>
                              <span className="text-[10px] text-[#737373] group-hover:text-white font-semibold transition-colors flex items-center gap-0.5">
                                View Course <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#737373] italic">No Student Academy coursework completed yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL USER & EVALUATION EDIT MODAL FOR ADMINS */}
      {isEvalModalOpen && athlete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(242,23,23,0.3)] my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#171717] rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#F21717] uppercase tracking-widest px-2 py-0.5 rounded bg-[#F21717]/20 border border-[#F21717]/30">
                    Admin Full Editor
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-semibold">
                    ID: {athlete.userId}
                  </span>
                </div>
                <h2 className="font-display uppercase text-2xl font-black text-white mt-1">
                  Edit Details: {athlete.user.name || `${athlete.user.firstName || ""} ${athlete.user.lastName || ""}`.trim() || "Athlete User"}
                </h2>
              </div>
              <button
                onClick={() => setIsEvalModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-[#A3A3A3] hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-navigation */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-[#141414]">
              <button
                onClick={() => setEditTab("ratings")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  editTab === "ratings"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Staff Ratings & Notes (1-5)
              </button>
              <button
                onClick={() => setEditTab("account")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  editTab === "account"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Account & Role
              </button>
              <button
                onClick={() => setEditTab("profile")}
                className={`px-4 py-2.5 rounded-t-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  editTab === "profile"
                    ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Athlete Stats & Film
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {saveSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">User details and scouting ratings updated successfully!</span>
                </div>
              )}

              {/* TAB 1: STAFF RATINGS & NOTES */}
              {editTab === "ratings" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[#F21717]/10 border border-[#F21717]/30 space-y-2">
                    <h4 className="font-display uppercase text-sm font-bold text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Staff Scouting Evaluation
                    </h4>
                    <p className="text-[11px] text-[#D4D4D4]">
                      Enter overall staff evaluation notes and rate the athlete on a scale of 1 to 5 for each attribute. These ratings will be visible on their verified public profile for scouts and recruiters.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>Evaluated Potential Division / Level</span>
                      <span className="text-[10px] text-[#F21717] font-bold">Mapped to Recruiter Search</span>
                    </label>
                    <Select
                      value={formPotentialDivision}
                      onChange={(e) => setFormPotentialDivision(e.target.value)}
                      options={[
                        { value: "", label: "Not Evaluated / Unranked" },
                        { value: "power_4", label: "Power 4 (FBS Power Conference)" },
                        { value: "division_1", label: "Division 1 (NCAA D1 / FBS / FCS)" },
                        { value: "division_2", label: "Division 2 (NCAA D2)" },
                        { value: "division_3", label: "Division 3 (NCAA D3)" },
                        { value: "juco", label: "JUCO (NJCAA Junior College)" },
                        { value: "hbcu", label: "HBCU (Historically Black Colleges)" },
                        { value: "naia", label: "NAIA (Collegiate Athletics)" },
                      ]}
                      className="w-full bg-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] uppercase tracking-wider block mb-1.5">
                      Staff Scouting Notes & Assessment
                    </label>
                    <textarea
                      value={formAdminNotes}
                      onChange={(e) => setFormAdminNotes(e.target.value)}
                      placeholder="Write evaluation commentary about the athlete's work ethic, potential, game film, leadership, or recruiting readiness..."
                      rows={4}
                      className="w-full bg-[#171717] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F21717]"
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-display uppercase text-xs font-bold text-white tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#F21717]" /> 1 to 5 Attribute Ratings
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderStarRatingPicker("Speed", formRatingSpeed, setFormRatingSpeed)}
                      {renderStarRatingPicker("Explosiveness", formRatingExplosiveness, setFormRatingExplosiveness)}
                      {renderStarRatingPicker("Agility", formRatingAgility, setFormRatingAgility)}
                      {renderStarRatingPicker("Strength", formRatingStrength, setFormRatingStrength)}
                      {renderStarRatingPicker("Toughness", formRatingToughness, setFormRatingToughness)}
                      {renderStarRatingPicker("Production", formRatingProduction, setFormRatingProduction)}
                      {renderStarRatingPicker("Technique", formRatingTechnique, setFormRatingTechnique)}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ACCOUNT DETAILS */}
              {editTab === "account" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">First Name</label>
                      <Input value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Last Name</label>
                      <Input value={formLastName} onChange={(e) => setFormLastName(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Email Address</label>
                    <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </div>

                  {renderPhotoUploadSection()}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">User Permission Role</label>
                      <Select
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value as any)}
                        options={[
                          { value: "ATHLETE", label: "Athlete" },
                          { value: "RECRUITER", label: "Recruiter" },
                          { value: "ADMIN", label: "Admin" },
                          { value: "SUPER_ADMIN", label: "Super Admin" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Account Status</label>
                      <Select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        options={[
                          { value: "ACTIVE", label: "Active" },
                          { value: "SUSPENDED", label: "Suspended" },
                          { value: "PENDING_PAYMENT", label: "Pending Payment" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Admin Reset User Password Section */}
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <h4 className="font-display uppercase text-xs font-bold text-white tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#F21717]" /> Reset User Password
                    </h4>
                    <p className="text-[11px] text-[#A3A3A3]">
                      Directly set a new password for this user account.
                    </p>

                    {adminPasswordResetSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{adminPasswordResetSuccess}</span>
                      </div>
                    )}

                    {adminPasswordResetError && (
                      <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{adminPasswordResetError}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="Enter new password (min 6 chars)"
                        value={adminNewPassword}
                        onChange={(e) => setAdminNewPassword(e.target.value)}
                        disabled={adminResettingPassword}
                        className="bg-[#171717]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAdminResetPassword}
                        disabled={adminResettingPassword || !adminNewPassword}
                        className="shrink-0 font-bold border-[#F21717]/50 text-[#F21717] hover:bg-[#F21717]/10"
                      >
                        {adminResettingPassword ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Resetting...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATHLETE PROFILE & STATS */}
              {editTab === "profile" && (
                <div className="space-y-4">
                  {renderPhotoUploadSection()}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Primary Sport</label>
                      <Input value={formSport} onChange={(e) => setFormSport(e.target.value)} placeholder="Basketball, Football..." />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Position</label>
                      <Input value={formPosition} onChange={(e) => setFormPosition(e.target.value)} placeholder="Quarterback, Guard..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">School / Club Team</label>
                      <Input value={formSchoolClub} onChange={(e) => setFormSchoolClub(e.target.value)} />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Graduation Year</label>
                      <Input value={formGraduationYear} onChange={(e) => setFormGraduationYear(e.target.value)} placeholder="2026" />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Location / State</label>
                      <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Sydney, NSW" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Bio / Scouting Overview</label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[#171717] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F21717]"
                      placeholder="Scouting bio, key athletic honors..."
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <h4 className="font-display uppercase text-xs font-bold text-white tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#F21717]" /> Athletic Testing & Combines
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Height</label>
                        <Input value={formHeight} onChange={(e) => setFormHeight(e.target.value)} placeholder='6&#39;2"' />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Weight</label>
                        <Input value={formWeight} onChange={(e) => setFormWeight(e.target.value)} placeholder="215 lbs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">40-Yard Dash</label>
                        <Input value={formFortyTime} onChange={(e) => setFormFortyTime(e.target.value)} placeholder="4.45s" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Vertical Jump</label>
                        <Input value={formVertical} onChange={(e) => setFormVertical(e.target.value)} placeholder="36 in" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Bench Press</label>
                        <Input value={formBenchPress} onChange={(e) => setFormBenchPress(e.target.value)} placeholder="275 lbs" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Squat</label>
                        <Input value={formSquat} onChange={(e) => setFormSquat(e.target.value)} placeholder="405 lbs" />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Power Clean</label>
                        <Input value={formPowerClean} onChange={(e) => setFormPowerClean(e.target.value)} placeholder="285 lbs" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Shuttle Time</label>
                        <Input value={formShuttleTime} onChange={(e) => setFormShuttleTime(e.target.value)} placeholder="4.12s" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">Broad Jump</label>
                        <Input value={formBroadJump} onChange={(e) => setFormBroadJump(e.target.value)} placeholder="10 ft 2 in" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">GPA</label>
                        <Input value={formGpa} onChange={(e) => setFormGpa(e.target.value)} placeholder="3.8" />
                      </div>
                      <div>
                        <label className="font-bold text-[#A3A3A3] block mb-1 text-[11px]">ACT / SAT Score</label>
                        <Input value={formActSat} onChange={(e) => setFormActSat(e.target.value)} placeholder="28 / 1350" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Highlight Video Link (HUDL / YouTube)</label>
                    <Input value={formHighlightVideoUrl} onChange={(e) => setFormHighlightVideoUrl(e.target.value)} placeholder="https://hudl.com/v/..." />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-[#171717] flex items-center justify-between rounded-b-2xl">
              <Button variant="outline" size="sm" onClick={() => setIsEvalModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="athletic"
                size="sm"
                onClick={handleSaveEval}
                disabled={isSavingEval}
                className="bg-[#F21717] hover:bg-[#D90F0F] gap-2 font-bold px-6"
              >
                {isSavingEval ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save User Details & Evaluation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
