"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Badge } from "@/components/ui";
import { Users, ShieldCheck, BookOpen, Brain, Search, Loader2, Edit3, X, Star, ExternalLink, Check, Award, Activity } from "lucide-react";

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

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<"overview" | "users" | "courses">("overview");
  const [stats, setStats] = React.useState<AdminStats>({
    totalUsers: 0,
    activeMemberships: 0,
    courseEnrollments: 0,
    interviewAttempts: 0,
  });
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [courses, setCourses] = React.useState<AdminCourseItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

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
  const [formRatingSpeed, setFormRatingSpeed] = React.useState<number>(0);
  const [formRatingExplosiveness, setFormRatingExplosiveness] = React.useState<number>(0);
  const [formRatingAgility, setFormRatingAgility] = React.useState<number>(0);
  const [formRatingStrength, setFormRatingStrength] = React.useState<number>(0);
  const [formRatingToughness, setFormRatingToughness] = React.useState<number>(0);
  const [formRatingProduction, setFormRatingProduction] = React.useState<number>(0);
  const [formRatingTechnique, setFormRatingTechnique] = React.useState<number>(0);

  React.useEffect(() => {
    let mounted = true;

    Promise.all([
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/courses").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([statsData, usersData, coursesData]) => {
        if (mounted) {
          if (statsData?.stats) setStats(statsData.stats);
          if (usersData?.users) setUsers(usersData.users);
          if (coursesData?.courses) setCourses(coursesData.courses);
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

  const handleOpenEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditTab("ratings");
    setSaveSuccess(false);

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
    setFormPhoto(prof.profilePhoto || "");
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
    setFormRatingSpeed(prof.ratingSpeed || 0);
    setFormRatingExplosiveness(prof.ratingExplosiveness || 0);
    setFormRatingAgility(prof.ratingAgility || 0);
    setFormRatingStrength(prof.ratingStrength || 0);
    setFormRatingToughness(prof.ratingToughness || 0);
    setFormRatingProduction(prof.ratingProduction || 0);
    setFormRatingTechnique(prof.ratingTechnique || 0);
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
                      {users.map((u) => {
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
                      })}
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
                </div>
              )}

              {/* TAB 3: ATHLETE PROFILE & STATS */}
              {editTab === "profile" && (
                <div className="space-y-4">
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
