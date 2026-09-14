"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Badge } from "@/components/ui";
import { Users, ShieldCheck, BookOpen, Brain, Search, Loader2, Edit3, X, Star, ExternalLink, Check, Award, Activity, KeyRound, AlertCircle, Camera, Upload, Trash2, Plus, Shield, Lock } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeMemberships: number;
  courseEnrollments: number;
  interviewAttempts: number;
}

interface FullAthleteProfile {
  id?: string;
  slug?: string;
  sport?: string | null;
  position?: string | null;
  schoolClub?: string | null;
  graduationYear?: number | null;
  location?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
  xUrl?: string | null;
  benchPress?: string | null;
  squat?: string | null;
  powerClean?: string | null;
  fortyTime?: string | null;
  vertical?: string | null;
  shuttleTime?: string | null;
  broadJump?: string | null;
  gpa?: string | null;
  highlightVideoUrl?: string | null;
  profileCompleteness?: number;

  // Staff Evaluations
  adminNotes?: string | null;
  potentialDivision?: string | null;
  ratingSpeed?: number | null;
  ratingExplosiveness?: number | null;
  ratingAgility?: number | null;
  ratingStrength?: number | null;
  ratingToughness?: number | null;
  ratingProduction?: number | null;
  ratingTechnique?: number | null;
}

interface AdminUserItem {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "PENDING_PAYMENT";
  createdAt: string;
  image?: string | null;
  athleteProfile?: FullAthleteProfile | null;
  subscriptions?: { id: string; stripePriceId: string; status: string }[];
  entitlements?: { type: string }[];
  purchases?: { id: string }[];
}

interface AdminCourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  isPublished: boolean;
  isRequiredForAcademy: boolean;
  _count: { enrollments: number };
}

interface AdminRoleItem {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  permissions?: string[] | null;
  isSystem: boolean;
  createdAt: string;
  _count?: { users: number };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "users" | "courses" | "roles">("overview");
  const [stats, setStats] = React.useState<AdminStats>({
    totalUsers: 0,
    activeMemberships: 0,
    courseEnrollments: 0,
    interviewAttempts: 0,
  });
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [courses, setCourses] = React.useState<AdminCourseItem[]>([]);
  const [roles, setRoles] = React.useState<AdminRoleItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  // Role Creation Form State
  const [isCreatingRole, setIsCreatingRole] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");
  const [newRoleDisplayName, setNewRoleDisplayName] = React.useState("");
  const [newRoleDescription, setNewRoleDescription] = React.useState("");
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([
    "view_roster",
    "edit_ratings",
  ]);
  const [roleSubmitLoading, setRoleSubmitLoading] = React.useState(false);
  const [roleSubmitSuccess, setRoleSubmitSuccess] = React.useState<string | null>(null);
  const [roleSubmitError, setRoleSubmitError] = React.useState<string | null>(null);

  const availablePermissions = [
    { key: "view_roster", label: "View User Roster" },
    { key: "edit_ratings", label: "Edit Scouting Ratings & Notes" },
    { key: "edit_user_details", label: "Edit Account & Profile Details" },
    { key: "reset_passwords", label: "Reset User Passwords" },
    { key: "manage_courses", label: "Manage & Publish Curriculum" },
    { key: "ai_interviews", label: "Access AI Interviews" },
    { key: "view_recruiting", label: "View Recruiter Search" },
    { key: "manage_roles", label: "Manage Roles & Permissions" },
  ];

  // User Edit Modal State
  const [editingUser, setEditingUser] = React.useState<AdminUserItem | null>(null);
  const [editTab, setEditTab] = React.useState<"account" | "profile" | "ratings">("account");
  const [isSaving, setIsSaving] = React.useState(false);
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
  const [formFortyTime, setFormFortyTime] = React.useState("");
  const [formVertical, setFormVertical] = React.useState("");
  const [formBenchPress, setFormBenchPress] = React.useState("");
  const [formSquat, setFormSquat] = React.useState("");
  const [formPowerClean, setFormPowerClean] = React.useState("");
  const [formShuttleTime, setFormShuttleTime] = React.useState("");
  const [formBroadJump, setFormBroadJump] = React.useState("");
  const [formGpa, setFormGpa] = React.useState("");
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

  const handleAdminPhotoUpload = async (file: File) => {
    if (!file || !editingUser) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetUserId", editingUser.id);

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
        setEditingUser((prev) =>
          prev
            ? {
                ...prev,
                image: data.url,
                athleteProfile: prev.athleteProfile
                  ? { ...prev.athleteProfile, profilePhoto: data.url }
                  : prev.athleteProfile,
              }
            : prev
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  image: data.url,
                  athleteProfile: u.athleteProfile
                    ? { ...u.athleteProfile, profilePhoto: data.url }
                    : u.athleteProfile,
                }
              : u
          )
        );
      }
    } catch {
      alert("Error uploading image");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const renderPhotoUploadSection = () => (
    <div>
      <label className="font-bold text-[#A3A3A3] block mb-2 flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-[#F21717]" /> Profile Photo / Avatar
      </label>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAdminPhotoUpload(file);
        }}
      />

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#F21717]/60 bg-[#171717] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(242,23,23,0.3)]">
          {formPhoto ? (
            <img
              src={formPhoto}
              alt="Profile Photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-black text-white text-xl">
              {formFirstName?.[0] || editingUser?.name?.[0] || "A"}
            </span>
          )}
          {isUploadingPhoto && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#F21717] animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs font-bold border-white/20 hover:border-[#F21717]"
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F21717]" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-[#F21717]" /> {formPhoto ? "Change Image" : "Upload Image"}
                </>
              )}
            </Button>

            {formPhoto && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isUploadingPhoto}
                onClick={() => setFormPhoto("")}
                className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-[10px] text-[#A3A3A3]">
            Upload JPEG, PNG, or WEBP (Max 5MB). Photo updates live on user profile & roster cards.
          </p>
        </div>
      </div>
    </div>
  );

  React.useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/courses").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/roles").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([statsData, usersData, coursesData, rolesData]) => {
        if (mounted) {
          if (statsData?.stats) setStats(statsData.stats);
          if (usersData?.users) setUsers(usersData.users);
          if (coursesData?.courses) setCourses(coursesData.courses);
          if (rolesData?.roles) setRoles(rolesData.roles);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [searchQuery]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleDisplayName.trim()) return;

    setRoleSubmitLoading(true);
    setRoleSubmitSuccess(null);
    setRoleSubmitError(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          displayName: newRoleDisplayName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRoleSubmitError(data.error || "Failed to create role");
      } else {
        setRoleSubmitSuccess(`Role "${newRoleDisplayName}" created successfully!`);
        setNewRoleName("");
        setNewRoleDisplayName("");
        setNewRoleDescription("");
        setIsCreatingRole(false);

        const rolesRes = await fetch("/api/admin/roles");
        const rolesData = await rolesRes.json();
        if (rolesData?.roles) setRoles(rolesData.roles);
      }
    } catch {
      setRoleSubmitError("Network error creating role.");
    } finally {
      setRoleSubmitLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/roles?id=${roleId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete role");
      } else {
        setRoles((prev) => prev.filter((r) => r.id !== roleId));
      }
    } catch {
      alert("Error deleting role");
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const name = (u.name || `${u.firstName || ""} ${u.lastName || ""}`).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const status = (u.status || "").toLowerCase();
      const sport = (u.athleteProfile?.sport || "").toLowerCase();
      const school = (u.athleteProfile?.schoolClub || "").toLowerCase();
      const position = (u.athleteProfile?.position || "").toLowerCase();
      const location = (u.athleteProfile?.location || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        status.includes(q) ||
        sport.includes(q) ||
        school.includes(q) ||
        position.includes(q) ||
        location.includes(q)
      );
    });
  }, [users, searchQuery]);

  const handleOpenEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditTab("ratings");
    setSaveSuccess(false);

    setAdminNewPassword("");
    setAdminResettingPassword(false);
    setAdminPasswordResetSuccess(null);
    setAdminPasswordResetError(null);

    setFormFirstName(u.firstName || "");
    setFormLastName(u.lastName || "");
    setFormEmail(u.email || "");
    setFormRole(u.role);
    setFormStatus(u.status);

    const prof = u.athleteProfile || {};
    setFormSport(prof.sport || "");
    setFormPosition(prof.position || "");
    setFormSchoolClub(prof.schoolClub || "");
    setFormGraduationYear(prof.graduationYear ? String(prof.graduationYear) : "");
    setFormLocation(prof.location || "");
    setFormBio(prof.bio || "");
    setFormPhoto(prof.profilePhoto || u.image || "");
    setFormFortyTime(prof.fortyTime || "");
    setFormVertical(prof.vertical || "");
    setFormBenchPress(prof.benchPress || "");
    setFormSquat(prof.squat || "");
    setFormPowerClean(prof.powerClean || "");
    setFormShuttleTime(prof.shuttleTime || "");
    setFormBroadJump(prof.broadJump || "");
    setFormGpa(prof.gpa || "");
    setFormHighlightVideoUrl(prof.highlightVideoUrl || "");

    // Evaluation Ratings & Notes
    setFormAdminNotes(prof.adminNotes || "");
    setFormPotentialDivision(prof.potentialDivision || "");
    setFormRatingSpeed(prof.ratingSpeed || 0);
    setFormRatingExplosiveness(prof.ratingExplosiveness || 0);
    setFormRatingAgility(prof.ratingAgility || 0);
    setFormRatingStrength(prof.ratingStrength || 0);
    setFormRatingToughness(prof.ratingToughness || 0);
    setFormRatingProduction(prof.ratingProduction || 0);
    setFormRatingTechnique(prof.ratingTechnique || 0);
  };

  const handleAdminResetPassword = async () => {
    if (!editingUser || !adminNewPassword) return;
    if (adminNewPassword.length < 6) {
      setAdminPasswordResetError("Password must be at least 6 characters long.");
      return;
    }
    setAdminResettingPassword(true);
    setAdminPasswordResetSuccess(null);
    setAdminPasswordResetError(null);

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: editingUser.id, newPassword: adminNewPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setAdminPasswordResetSuccess(data.message || "Password successfully reset!");
      setAdminNewPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset password.";
      setAdminPasswordResetError(msg);
    } finally {
      setAdminResettingPassword(false);
    }
  };

  const handleSaveUserDetailChanges = async () => {

    if (!editingUser) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        userId: editingUser.id,
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
          fortyTime: formFortyTime || null,
          vertical: formVertical || null,
          benchPress: formBenchPress || null,
          squat: formSquat || null,
          powerClean: formPowerClean || null,
          shuttleTime: formShuttleTime || null,
          broadJump: formBroadJump || null,
          gpa: formGpa || null,
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
      };

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setSaveSuccess(true);
        // Update user state locally
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u))
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.error || "Failed to update user details");
      }
    } catch {
      alert("Error saving user details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: "ACTIVE" | "SUSPENDED" | "PENDING_PAYMENT") => {
    setUpdatingUserId(userId);
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
      }
    } catch {
      alert("Failed to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Helper star selector for 1 to 5 ratings
  const renderStarRatingPicker = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#D4D4D4] uppercase tracking-wider">{label}</span>
        <span className="font-display font-black text-sm text-[#F21717]">
          {value > 0 ? `${value.toFixed(1)} / 5.0` : "Unrated"}
        </span>
      </div>
      <div className="flex items-center justify-between pt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(value === star ? 0 : star)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              star <= value
                ? "bg-[#F21717] text-white shadow-[0_0_10px_rgba(242,23,23,0.5)] font-bold"
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
    <AppShell>
      <PageHeader
        eyebrow="System Operations"
        title="Admin Control Console"
        description="Database metrics, user detail & scouting evaluation editor, curriculum publishing, and audit inspection."
      />

      <div className="space-y-8 pb-16">
        {/* Real Database Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/50 text-[#F21717] flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Total Users</span>
                <span className="font-display font-black text-2xl text-white">{stats.totalUsers}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Active Members</span>
                <span className="font-display font-black text-2xl text-white">{stats.activeMemberships}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-800/50 text-blue-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Enrollments</span>
                <span className="font-display font-black text-2xl text-white">{stats.courseEnrollments}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#111111] border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-800/50 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">AI Interviews</span>
                <span className="font-display font-black text-2xl text-white">{stats.interviewAttempts}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "overview"
                ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "users"
                ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
            }`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "courses"
                ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
            }`}
          >
            Curriculum ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "roles"
                ? "bg-[#F21717] text-white shadow-[0_0_15px_rgba(242,23,23,0.4)]"
                : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
            }`}
          >
            Roles & Permissions ({roles.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & QUICK ACTIONS */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#111111] border-white/10">
              <CardHeader>
                <CardTitle isDisplay>Manage Users & Athletes</CardTitle>
                <CardDescription>Inspect accounts, edit user details, toggle status, and update 1-5 scouting ratings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("users")} variant="athletic" size="sm" className="w-full bg-[#F21717]">
                  Open User Manager & Ratings Editor
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-white/10">
              <CardHeader>
                <CardTitle isDisplay>Curriculum & Lessons</CardTitle>
                <CardDescription>Publish, order, and manage Student Academy course content.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("courses")} variant="athletic" size="sm" className="w-full bg-[#F21717]">
                  Open Curriculum Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT TABLE */}
        {activeTab === "users" && (
          <Card className="bg-[#111111] border-white/10">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle isDisplay>Platform User Roster</CardTitle>
                <CardDescription>Full editing power for any user details, scouting notes, and 1-5 skill evaluations.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users by email or name..."
                  className="pl-9"
                />
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-[#A3A3A3]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#F21717] mx-auto mb-2" />
                  <p className="text-xs uppercase tracking-widest font-semibold">Loading users database...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[#A3A3A3] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3">User</th>
                        <th className="py-3 px-3">Sport / School</th>
                        <th className="py-3 px-3">Staff Rating</th>
                        <th className="py-3 px-3">Membership</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#737373] text-sm">
                            No users found matching &quot;{searchQuery}&quot;
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isPaidMember = (u.subscriptions && u.subscriptions.length > 0) || (u.entitlements && u.entitlements.some((e) => e.type === "ACADEMY" || e.type === "ELITE_PACIFIC" || e.type === "US_ATHLETE"));
                          const isCourseOwner = !isPaidMember && u.purchases && u.purchases.length > 0;

                          const prof = u.athleteProfile;
                          const ratings = [
                            prof?.ratingSpeed,
                            prof?.ratingExplosiveness,
                            prof?.ratingAgility,
                            prof?.ratingStrength,
                            prof?.ratingToughness,
                            prof?.ratingProduction,
                            prof?.ratingTechnique,
                          ].filter((r): r is number => r != null && r > 0);

                          const avgRating = ratings.length > 0
                            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                            : null;

                          return (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-3">
                                <p className="font-bold text-white">{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Athlete User"}</p>
                                <p className="text-[#A3A3A3] text-[11px]">{u.email}</p>
                              </td>
                              <td className="py-3 px-3 text-[#D4D4D4]">
                                {prof?.sport ? (
                                  <span>
                                    {prof.sport} • {prof.schoolClub || "High School"}
                                  </span>
                                ) : (
                                  <span className="text-[#737373] italic">No profile data</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {avgRating ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                                    <Star className="w-3 h-3 fill-current text-amber-400" /> {avgRating} / 5.0
                                  </span>
                                ) : (
                                  <span className="text-[#737373] text-[11px] italic">Not rated</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                {isPaidMember ? (
                                  <Badge variant="success" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                                    ⚡ Paid Member
                                  </Badge>
                                ) : isCourseOwner ? (
                                  <Badge variant="neutral" className="bg-blue-500/15 text-blue-400 border-blue-500/30">
                                    📚 Single Course
                                  </Badge>
                                ) : (
                                  <span className="text-[#737373] text-[11px] font-medium">Free User</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-semibold text-white text-[11px]">{u.role}</span>
                              </td>
                              <td className="py-3 px-3">
                                <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>
                                  {u.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    onClick={() => handleOpenEditModal(u)}
                                    variant="secondary"
                                    size="sm"
                                    className="h-8 text-[11px] gap-1 bg-[#F21717]/20 border-[#F21717]/40 text-white hover:bg-[#F21717] font-semibold"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit Details & Ratings
                                  </Button>
                                  <Button
                                    onClick={() => handleUserStatusToggle(u.id, u.status)}
                                    disabled={updatingUserId === u.id}
                                    variant={u.status === "ACTIVE" ? "outline" : "primary"}
                                    size="sm"
                                    className="h-8 text-[11px]"
                                  >
                                    {updatingUserId === u.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : u.status === "ACTIVE" ? (
                                      "Suspend"
                                    ) : (
                                      "Activate"
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: CURRICULUM MANAGEMENT */}
        {activeTab === "courses" && (
          <Card className="bg-[#111111] border-white/10">
            <CardHeader>
              <CardTitle isDisplay>Student Academy Curriculum</CardTitle>
              <CardDescription>Published courses and lesson structures.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-[#F21717] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F21717]/20 border border-[#F21717]/30">
                          Class {c.order}
                        </span>
                        <h4 className="font-display uppercase text-lg font-bold text-white">{c.title}</h4>
                      </div>
                      <p className="text-xs text-[#A3A3A3]">
                        Category: {c.category} • Enrollments: {c._count?.enrollments || 0} students
                      </p>
                    </div>
                    <Badge variant={c.isPublished ? "success" : "neutral"}>
                      {c.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: ROLE & PERMISSION MANAGEMENT */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            <Card className="bg-[#111111] border-white/10">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle isDisplay>System & Custom Database Roles</CardTitle>
                  <CardDescription>
                    Define new user roles, configure permissions, and manage database authorization policies.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsCreatingRole(!isCreatingRole)}
                  variant="athletic"
                  size="sm"
                  className="bg-[#F21717] gap-2 font-bold shrink-0"
                >
                  {isCreatingRole ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isCreatingRole ? "Close Role Form" : "Create New Role"}
                </Button>
              </CardHeader>

              {isCreatingRole && (
                <CardContent className="border-t border-white/10 pt-6">
                  <form onSubmit={handleCreateRole} className="space-y-5 max-w-2xl bg-[#171717] p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-[#F21717]" />
                      <h3 className="font-display uppercase text-lg font-bold text-white">Create Custom Database Role</h3>
                    </div>

                    {roleSubmitSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{roleSubmitSuccess}</span>
                      </div>
                    )}

                    {roleSubmitError && (
                      <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{roleSubmitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-[#A3A3A3] text-xs block mb-1">
                          Role Technical Identifier <span className="text-[#F21717]">*</span>
                        </label>
                        <Input
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="e.g. SCOUT, COACH, ANALYST"
                          required
                          className="bg-[#111111]"
                        />
                        <span className="text-[10px] text-[#737373] mt-1 block">Upper-case system key identifier</span>
                      </div>

                      <div>
                        <label className="font-bold text-[#A3A3A3] text-xs block mb-1">
                          Role Display Name <span className="text-[#F21717]">*</span>
                        </label>
                        <Input
                          value={newRoleDisplayName}
                          onChange={(e) => setNewRoleDisplayName(e.target.value)}
                          placeholder="e.g. Talent Scout & Evaluator"
                          required
                          className="bg-[#111111]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#A3A3A3] text-xs block mb-1">Description / Notes</label>
                      <textarea
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        placeholder="Describe what access and privileges users with this role possess..."
                        rows={2}
                        className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F21717]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#A3A3A3] text-xs block mb-2">Granted Access Permissions</label>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                        {availablePermissions.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-[#F21717]/15 border-[#F21717]/50 text-white"
                                  : "bg-[#111111] border-white/5 text-[#A3A3A3] hover:text-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPermissions((prev) => [...prev, perm.key]);
                                  } else {
                                    setSelectedPermissions((prev) => prev.filter((k) => k !== perm.key));
                                  }
                                }}
                                className="accent-[#F21717] w-4 h-4 rounded"
                              />
                              <span>{perm.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={roleSubmitLoading}
                        variant="athletic"
                        size="sm"
                        className="bg-[#F21717] gap-2 font-bold"
                      >
                        {roleSubmitLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Registering Role...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Save & Register Role
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingRole(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* ROLES CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((r) => (
                <Card key={r.id} className="bg-[#111111] border-white/10 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.isSystem ? "danger" : "neutral"} className="font-mono text-[10px]">
                          {r.name}
                        </Badge>
                        {r.isSystem && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            Built-in System Role
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#A3A3A3]">
                        {r._count?.users || 0} User(s)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display uppercase text-lg font-bold text-white">{r.displayName}</h3>
                      <p className="text-xs text-[#A3A3A3] mt-1">{r.description || "No description specified."}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1.5">
                        Assigned Permissions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(r.permissions) && r.permissions.length > 0 ? (
                          r.permissions.map((p) => (
                            <span key={p} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white font-mono border border-white/10">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#737373] italic">No specific permissions</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!r.isSystem && (
                    <div className="pt-3 border-t border-white/5 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(r.id, r.displayName)}
                        className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Custom Role
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL USER & EVALUATION EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(242,23,23,0.3)] my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#171717] rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#F21717] uppercase tracking-widest px-2 py-0.5 rounded bg-[#F21717]/20 border border-[#F21717]/30">
                    Admin Full Editor
                  </span>
                  {editingUser.athleteProfile?.slug && (
                    <Link
                      href={`/athletes/${editingUser.athleteProfile.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" /> View Roster Profile
                    </Link>
                  )}
                </div>
                <h2 className="font-display uppercase text-2xl font-black text-white mt-1">
                  Edit Details: {editingUser.name || `${editingUser.firstName || ""} ${editingUser.lastName || ""}`}
                </h2>
              </div>
              <button
                onClick={() => setEditingUser(null)}
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
                      <Input value={formGraduationYear} onChange={(e) => setFormGraduationYear(e.target.value)} placeholder="2027" />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">GPA</label>
                      <Input value={formGpa} onChange={(e) => setFormGpa(e.target.value)} placeholder="3.8" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Location</label>
                    <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Los Angeles, CA" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">40-Yard Dash</label>
                      <Input value={formFortyTime} onChange={(e) => setFormFortyTime(e.target.value)} placeholder="4.45s" />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Vertical Jump</label>
                      <Input value={formVertical} onChange={(e) => setFormVertical(e.target.value)} placeholder='36"' />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Bench Press</label>
                      <Input value={formBenchPress} onChange={(e) => setFormBenchPress(e.target.value)} placeholder="225 lbs" />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Squat</label>
                      <Input value={formSquat} onChange={(e) => setFormSquat(e.target.value)} placeholder="315 lbs" />
                    </div>
                    <div>
                      <label className="font-bold text-[#A3A3A3] block mb-1">Power Clean</label>
                      <Input value={formPowerClean} onChange={(e) => setFormPowerClean(e.target.value)} placeholder="245 lbs" />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Highlight Film URL</label>
                    <Input value={formHighlightVideoUrl} onChange={(e) => setFormHighlightVideoUrl(e.target.value)} placeholder="https://hudl.com/v/..." />
                  </div>

                  <div>
                    <label className="font-bold text-[#A3A3A3] block mb-1">Bio / Recruiting Statement</label>
                    <textarea
                      value={formBio}
                      onChange={(e) => setFormBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[#171717] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F21717]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-[#171717] flex items-center justify-between rounded-b-2xl">
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                variant="athletic"
                size="sm"
                onClick={handleSaveUserDetailChanges}
                disabled={isSaving}
                className="bg-[#F21717] hover:bg-[#D90F0F] gap-2 font-bold"
              >
                {isSaving ? (
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
    </AppShell>
  );
}
