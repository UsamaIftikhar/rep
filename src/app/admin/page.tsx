"use client";

import * as React from "react";
import { AppShell } from "@/components/layout";
import { PageHeader, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Select, Badge } from "@/components/ui";
import { Users, ShieldCheck, BookOpen, Brain, Search, Loader2 } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeMemberships: number;
  courseEnrollments: number;
  interviewAttempts: number;
}

interface AdminUserItem {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: "ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  athleteProfile?: {
    sport: string | null;
    position: string | null;
    schoolClub: string | null;
    graduationYear: number | null;
    profileCompleteness: number;
  } | null;
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

  const handleUserStatusToggle = async (userId: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
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

  const handleUserRoleChange = async (userId: string, newRole: "ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN") => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      alert("Failed to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="System Operations"
        title="Admin Control Console"
        description="Database metrics, user role management, curriculum publishing, and audit inspection."
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
                <CardDescription>Inspect accounts, toggle status, and update permission roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("users")} variant="athletic" size="sm" className="w-full bg-[#F21717]">
                  Open User Manager
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
                <CardDescription>Manage status, permissions, and profiles.</CardDescription>
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
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-bold text-white">{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Athlete User"}</p>
                            <p className="text-[#A3A3A3] text-[11px]">{u.email}</p>
                          </td>
                          <td className="py-3 px-3 text-[#D4D4D4]">
                            {u.athleteProfile?.sport ? (
                              <span>
                                {u.athleteProfile.sport} • {u.athleteProfile.schoolClub || "High School"}
                              </span>
                            ) : (
                              <span className="text-[#737373] italic">No profile data</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <Select
                              value={u.role}
                              onChange={(e) =>
                                handleUserRoleChange(u.id, e.target.value as "ATHLETE" | "RECRUITER" | "ADMIN" | "SUPER_ADMIN")
                              }
                              disabled={updatingUserId === u.id}
                              options={[
                                { value: "ATHLETE", label: "Athlete" },
                                { value: "RECRUITER", label: "Recruiter" },
                                { value: "ADMIN", label: "Admin" },
                                { value: "SUPER_ADMIN", label: "Super Admin" },
                              ]}
                              className="h-8 text-xs py-1"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
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
                          </td>
                        </tr>
                      ))}
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
    </AppShell>
  );
}
