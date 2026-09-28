"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell, PublicNavbar, PublicFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { MiroBoard } from "@/components/integrations/MiroBoard";
import { ZoomEmbeddedMeeting } from "@/components/integrations/ZoomEmbeddedMeeting";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  Lock,
  Loader2,
  Video,
  Play,
  Square,
  FileText,
  Folder,
  FolderPlus,
  Plus,
  Download,
  Trash2,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Users,
  Presentation,
  Copy,
  Check,
  Clock,
  History
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
}

interface AcademyFile {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  category: string; // OPERATIONS | OFFENSE | DEFENSE | SPECIAL_TEAMS
  subfolder?: string; // QB | RB | WR_TE | OL | SECONDARY | LB | DL | EDGE
  uploadedBy?: string;
  uploadedAt: string;
}

export default function AcademyPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isAdmin =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "RECRUITER";

  const isZoomTester =
    user?.email === "usama@rep1recruiting.com" ||
    user?.email === "student@rep1recruiting.com";

  // Curriculum state
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(6);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  // Live session state (Zoom + Miro)
  const [activeMeeting, setActiveMeeting] = React.useState<any>(null);
  const [latestMeeting, setLatestMeeting] = React.useState<any>(null);
  const [recentMeetings, setRecentMeetings] = React.useState<any[]>([]);
  const [activeBoard, setActiveBoard] = React.useState<any>(null);
  const [allBoards, setAllBoards] = React.useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [startingSession, setStartingSession] = React.useState(false);
  const [roomLayout, setRoomLayout] = React.useState<"split" | "zoom_focus" | "miro_focus">("split");
  const [showMeetingHistory, setShowMeetingHistory] = React.useState(false);
  const [copiedMeetingId, setCopiedMeetingId] = React.useState(false);
  const [copiedMeetingPwd, setCopiedMeetingPwd] = React.useState(false);

  const copyMeetingId = (idStr: string) => {
    if (!idStr) return;
    navigator.clipboard.writeText(idStr);
    setCopiedMeetingId(true);
    setTimeout(() => setCopiedMeetingId(false), 2000);
  };

  const copyMeetingPassword = (pwdStr: string) => {
    if (!pwdStr) return;
    navigator.clipboard.writeText(pwdStr);
    setCopiedMeetingPwd(true);
    setTimeout(() => setCopiedMeetingPwd(false), 2000);
  };

  // File Vault state
  const [activeFolder, setActiveFolder] = React.useState<"OPERATIONS" | "OFFENSE" | "DEFENSE" | "SPECIAL_TEAMS">("OFFENSE");
  const [activeSubfolder, setActiveSubfolder] = React.useState<string>("QB");
  const [files, setFiles] = React.useState<AcademyFile[]>([]);
  const [filesLoading, setFilesLoading] = React.useState(false);

  // Upload modal state (Admin)
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [uploadDesc, setUploadDesc] = React.useState("");
  const [uploadUrl, setUploadUrl] = React.useState("");
  const [uploadCategory, setUploadCategory] = React.useState<"OPERATIONS" | "OFFENSE" | "DEFENSE" | "SPECIAL_TEAMS">("OFFENSE");
  const [uploadSubfolder, setUploadSubfolder] = React.useState<string>("QB");
  const [submittingFile, setSubmittingFile] = React.useState(false);
  const [uploadingFileToSpaces, setUploadingFileToSpaces] = React.useState(false);

  // Handle uploading file directly to DigitalOcean Spaces S3 bucket (https://rep1.nyc3.digitaloceanspaces.com)
  const handleFileUploadToSpaces = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFileToSpaces(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `academy/${uploadCategory.toLowerCase()}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUploadUrl(data.url);
        if (!uploadTitle) {
          setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setUploadingFileToSpaces(false);
    }
  };

  // Fetch session data
  const fetchSession = React.useCallback(async () => {
    try {
      setSessionLoading(true);
      const res = await fetch("/api/academy/session");
      if (res.ok) {
        const data = await res.json();
        setActiveMeeting(data.activeMeeting);
        setLatestMeeting(data.latestMeeting);
        setRecentMeetings(data.recentMeetings || []);
        setActiveBoard(data.activeBoard);
        setAllBoards(data.allBoards || []);
        if (data.activeBoard) {
          setSelectedBoardId((prev) => prev || data.activeBoard.id);
        }
      }
    } catch (e) {
      console.error("Error fetching academy session:", e);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const displayedBoard = React.useMemo(() => {
    if (selectedBoardId && allBoards.length > 0) {
      const found = allBoards.find((b: any) => b.id === selectedBoardId);
      if (found) return found;
    }
    return activeBoard || (allBoards.length > 0 ? allBoards[0] : null);
  }, [selectedBoardId, allBoards, activeBoard]);

  // Fetch files based on active category & subfolder
  const fetchFiles = React.useCallback(async () => {
    try {
      setFilesLoading(true);
      let url = `/api/academy/files?category=${activeFolder}`;
      if (activeFolder === "OFFENSE" || activeFolder === "DEFENSE") {
        if (activeSubfolder) url += `&subfolder=${activeSubfolder}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error("Error fetching files:", e);
    } finally {
      setFilesLoading(false);
    }
  }, [activeFolder, activeSubfolder]);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (isZoomTester) {
        fetchSession();
      }
      // Fetch 6-class courses
      fetch("/api/courses")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            if (data.courses) setCourses(data.courses);
            if (data.summary) {
              setCompletedCount(data.summary.completedAcademyCount);
              setTotalCount(data.summary.totalAcademyCount);
            }
          }
        })
        .catch(() => {})
        .finally(() => setCoursesLoading(false));
    }
  }, [isAuthenticated, isZoomTester, fetchSession]);

  React.useEffect(() => {
    if (isAuthenticated && isZoomTester) {
      fetchFiles();
    }
  }, [isAuthenticated, isZoomTester, fetchFiles]);

  // Start Meeting modal state (Admin)
  const [startMeetingModalOpen, setStartMeetingModalOpen] = React.useState(false);
  const [customZoomUrlInput, setCustomZoomUrlInput] = React.useState("");
  const [customMiroUrlInput, setCustomMiroUrlInput] = React.useState("");
  const [linkMiroModalOpen, setLinkMiroModalOpen] = React.useState(false);
  const [linkMiroInput, setLinkMiroInput] = React.useState("");
  const [linkingMiro, setLinkingMiro] = React.useState(false);

  // Handle Admin linking Miro board
  const handleLinkMiroBoard = async (urlOrId: string) => {
    if (!urlOrId.trim()) return;
    try {
      setLinkingMiro(true);
      const res = await fetch("/api/integrations/miro/boards/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrId: urlOrId.trim(),
          title: "Coaching Strategy & Playbook Whiteboard",
          contextType: "coaching_academy",
          contextId: "academy-live",
        }),
      });
      if (res.ok) {
        setLinkMiroModalOpen(false);
        setLinkMiroInput("");
        await fetchSession();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to link Miro board");
      }
    } catch (e) {
      console.error("Error linking Miro board:", e);
    } finally {
      setLinkingMiro(false);
    }
  };

  // Handle Admin starting meeting
  const handleStartMeeting = async (customUrl?: string, customMiro?: string) => {
    try {
      setStartingSession(true);
      const res = await fetch("/api/academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          topic: "Rep 1 Coaching Academy Live Strategy & Film Session",
          customJoinUrl: customUrl ? customUrl.trim() : undefined,
          customMiroUrl: customMiro ? customMiro.trim() : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStartMeetingModalOpen(false);
        if (data.board) {
          setSelectedBoardId(data.board.id);
        }
        await fetchSession();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to start meeting.");
      }
    } catch (e) {
      console.error("Error starting meeting:", e);
    } finally {
      setStartingSession(false);
    }
  };

  // Handle Admin ending meeting
  const handleEndMeeting = async () => {
    try {
      setStartingSession(true);
      const res = await fetch("/api/academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      if (res.ok) {
        await fetchSession();
      }
    } catch (e) {
      console.error("Error ending meeting:", e);
    } finally {
      setStartingSession(false);
    }
  };

  // Handle Admin upload file
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadUrl) return;

    try {
      setSubmittingFile(true);
      const res = await fetch("/api/academy/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDesc,
          fileUrl: uploadUrl,
          category: uploadCategory,
          subfolder:
            uploadCategory === "OFFENSE" || uploadCategory === "DEFENSE"
              ? uploadSubfolder
              : null,
        }),
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setUploadTitle("");
        setUploadDesc("");
        setUploadUrl("");
        fetchFiles();
      }
    } catch (e) {
      console.error("Error uploading file:", e);
    } finally {
      setSubmittingFile(false);
    }
  };

  // Handle Admin delete file
  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/academy/files?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchFiles();
      }
    } catch (e) {
      console.error("Error deleting file:", e);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 rounded-full text-[#F21717] animate-spin" />
      </div>
    );
  }

  // Locked Gate if user is not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F21717]/10 border border-[#F21717]/30 flex items-center justify-center text-[#F21717] shadow-[0_0_30px_rgba(242,23,23,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase">
              STUDENT ACADEMY ACCESS
            </span>
            <h1 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
              Members Only Curriculum
            </h1>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              The 6-Class Student Academy (Financial Literacy, Personal Branding, NIL Playbooks, Conflict Resolution, Behavioral Analysis) is exclusively available to logged-in athletes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button variant="athletic" size="md" className="gap-2 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]">
                Sign In to Enter Academy <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="md" className="text-xs font-semibold border-white/20 text-white hover:bg-white/10">
                Create Athlete Account
              </Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Static Student Academy Page for all regular accounts (admin & other students)
  if (!isZoomTester) {
    return (
      <AppShell>
        <div className="space-y-8 pb-16 max-w-5xl">
          {/* Student Academy Hero Card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#990000] via-[#550000] to-[#1A0A0A] border border-white/10 p-8 md:p-10 shadow-2xl">
            <span className="text-xs font-bold tracking-widest text-red-300 uppercase block mb-3">
              STUDENT ACADEMY
            </span>
            <h2 className="font-display uppercase text-3xl md:text-5xl font-black text-white leading-tight mb-3">
              Complete Your 6-Class Academy
            </h2>
            <p className="text-sm md:text-base text-white/80 max-w-2xl leading-relaxed mb-4">
              Finish all six required classes to boost your recruiting profile and unlock your Academy badge.
            </p>
            <p className="text-xs font-bold text-red-200 uppercase tracking-wider">
              {completedCount} of {totalCount} classes completed
            </p>
          </div>

          {/* Curriculum Section Header */}
          <div className="pt-2">
            <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              CURRICULUM
            </span>
            <h3 className="font-display uppercase text-3xl font-black text-white tracking-wide">
              The 6 Classes
            </h3>
          </div>

          {/* The 6 Classes List */}
          <div className="space-y-6">
            {coursesLoading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#F21717]" />
              </div>
            ) : (
              courses.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/5"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#A3A3A3]">
                      Class {item.order || index + 1}
                    </span>
                    <h4 className="font-display uppercase text-xl font-bold text-white tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#737373]">{item.category}</p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : item.status === "IN_PROGRESS"
                          ? "bg-white text-[#990000]"
                          : "bg-[#1E1E1E] text-[#A3A3A3]"
                      }`}
                    >
                      {item.status === "COMPLETED"
                        ? "Completed"
                        : item.status === "IN_PROGRESS"
                        ? "In Progress"
                        : "Not Started"}
                    </span>

                    <Link href={`/courses/${item.slug}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5 h-9 px-4 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F]"
                      >
                        <span>{item.status === "NOT_STARTED" ? "Enroll / Open" : "Continue"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-10 pb-16 max-w-6xl mx-auto">
        {/* Academy Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#800000] via-[#4A0000] to-[#120505] border border-white/10 p-8 md:p-10 shadow-2xl">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-red-400 uppercase bg-red-950/60 px-3 py-1 rounded-full border border-red-500/30">
                REP 1 COACHING ACADEMY
              </span>
              {isAdmin && (
                <span className="text-xs font-bold tracking-widest text-amber-300 uppercase bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> ADMIN PRESENTER
                </span>
              )}
            </div>
            <h1 className="font-display uppercase text-3xl md:text-5xl font-black text-white leading-tight">
              Strategy, Whiteboards & Position Vaults
            </h1>
            <p className="text-sm md:text-base text-white/80 max-w-3xl leading-relaxed">
              Join live interactive Zoom + Miro sessions with coaches, review position playbooks, and access specific departmental file vaults for Offense, Defense, Special Teams, and Operations.
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECTION 1: DUAL LIVE SESSION (ZOOM + MIRO)  */}
        {/* ========================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                COLLABORATIVE STRATEGY ROOM
              </span>
              <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Video className="w-6 h-6 text-[#F21717]" />
                Live Session & Interactive Whiteboard
              </h2>
            </div>
            {isAdmin && (
              <div>
                {activeMeeting?.status === "started" ? (
                  <Button
                    onClick={handleEndMeeting}
                    disabled={startingSession}
                    variant="destructive"
                    size="sm"
                    className="gap-2 bg-red-600 hover:bg-red-700 text-xs font-bold"
                  >
                    {startingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-white" />}
                    End Live Session
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStartMeetingModalOpen(true)}
                    disabled={startingSession}
                    className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-white text-xs font-bold shadow-[0_0_20px_rgba(242,23,23,0.4)]"
                  >
                    {startingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    Start Meeting & Board
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Subheader and Interactive Layout Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs md:text-sm text-[#A3A3A3]">
              {roomLayout === "zoom_focus"
                ? "Zoom Theatre Mode: Expanded 12-column view with full-size video, chat, and participants."
                : roomLayout === "miro_focus"
                ? "Miro Whiteboard Mode: Full-canvas whiteboard for deep playbook and film diagramming."
                : "Collaborative Split Mode: Zoom live video on left with interactive Miro whiteboard on right."}
            </p>

            {/* Layout Mode Controls */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-white/10 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setRoomLayout("split")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  roomLayout === "split"
                    ? "bg-[#F21717] text-white shadow-[0_0_12px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
                title="Balanced side-by-side view"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomLayout("zoom_focus")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  roomLayout === "zoom_focus"
                    ? "bg-[#F21717] text-white shadow-[0_0_12px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
                title="Maximize Zoom to full conference room width"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Zoom Focus</span>
              </button>

              <button
                type="button"
                onClick={() => setRoomLayout("miro_focus")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  roomLayout === "miro_focus"
                    ? "bg-[#F21717] text-white shadow-[0_0_12px_rgba(242,23,23,0.4)]"
                    : "text-[#A3A3A3] hover:text-white hover:bg-white/5"
                }`}
                title="Maximize Miro Whiteboard to full width"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Miro Focus</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Embedded Zoom Video Player */}
            {roomLayout !== "miro_focus" && (
              <div
                className={`rounded-xl bg-[#0D0D0D] border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${
                  roomLayout === "zoom_focus"
                    ? "lg:col-span-12 h-[720px]"
                    : "lg:col-span-6 h-[660px]"
                }`}
              >
                {activeMeeting?.status === "started" ? (
                  <ZoomEmbeddedMeeting
                    meetingId={activeMeeting.zoomMeetingId}
                    joinUrl={activeMeeting.joinUrl}
                    password={activeMeeting.password || undefined}
                    userName={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Academy Member"}
                    userEmail={user?.email || ""}
                    height={roomLayout === "zoom_focus" ? "720px" : "660px"}
                    isTheatre={roomLayout === "zoom_focus"}
                    onToggleTheatre={() =>
                      setRoomLayout((prev) => (prev === "zoom_focus" ? "split" : "zoom_focus"))
                    }
                  />
                ) : (
                  <div className="flex flex-col h-full bg-[#070707] divide-y divide-white/10 overflow-y-auto">
                    {/* Header bar */}
                    <div className="p-4 bg-white/[0.02] flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Live Session Hub & Checker
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A3A3A3] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        {latestMeeting ? "Latest Meeting Details" : "Standby"}
                      </span>
                    </div>

                    {/* Main Content Area */}
                    <div className="p-6 flex-1 flex flex-col justify-center space-y-5">
                      {latestMeeting ? (
                        <>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#F21717] tracking-wider uppercase">
                              SESSION DETAILS
                            </span>
                            <h3 className="font-display uppercase text-lg md:text-xl font-bold text-white">
                              {latestMeeting.topic || "Rep 1 Coaching Strategy & Film Review"}
                            </h3>
                            <p className="text-xs text-[#A3A3A3]">
                              {latestMeeting.status === "started"
                                ? "Host is currently streaming live."
                                : "Meeting has concluded. You can review meeting credentials, check room status, or launch Zoom below."}
                            </p>
                          </div>

                          {/* Meeting Credentials Card */}
                          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-[#737373] block uppercase font-bold">Meeting ID</span>
                                  <span className="text-xs font-mono font-bold text-white">
                                    {latestMeeting.zoomMeetingId}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyMeetingId(latestMeeting.zoomMeetingId)}
                                  className="p-1.5 rounded hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
                                  title="Copy Meeting ID"
                                >
                                  {copiedMeetingId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="bg-white/5 rounded-lg p-2.5 border border-white/5 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-[#737373] block uppercase font-bold">Passcode</span>
                                  <span className="text-xs font-mono font-bold text-white">
                                    {latestMeeting.password || "No Passcode"}
                                  </span>
                                </div>
                                {latestMeeting.password && (
                                  <button
                                    type="button"
                                    onClick={() => copyMeetingPassword(latestMeeting.password)}
                                    className="p-1.5 rounded hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
                                    title="Copy Passcode"
                                  >
                                    {copiedMeetingPwd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </div>

                            {latestMeeting.createdAt && (
                              <div className="flex items-center gap-1.5 text-[11px] text-[#737373] pt-1">
                                <Clock className="w-3 h-3 text-[#A3A3A3]" />
                                <span>Last Session Held: {new Date(latestMeeting.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {latestMeeting.joinUrl && (
                              <a
                                href={latestMeeting.joinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white transition-all shadow-sm"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                <span>Check / Join in Browser</span>
                              </a>
                            )}

                            <a
                              href={`zoommtg://zoom.us/join?confno=${latestMeeting.zoomMeetingId}${latestMeeting.password ? `&pwd=${latestMeeting.password}` : ""}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold text-blue-300 transition-all"
                            >
                              <Video className="w-3.5 h-3.5 text-blue-400" />
                              <span>Open in Zoom App</span>
                            </a>

                            {isAdmin && (
                              <Button
                                onClick={() => setStartMeetingModalOpen(true)}
                                disabled={startingSession}
                                size="sm"
                                className="text-xs bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2 shadow-[0_0_20px_rgba(242,23,23,0.4)]"
                              >
                                {startingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                                Start New Meeting & Board
                              </Button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 space-y-3">
                          <Video className="w-12 h-12 text-[#F21717]/40 mx-auto" />
                          <h4 className="text-sm font-bold text-white">No Live Session Started</h4>
                          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto">
                            When coaches begin a meeting, live video streams automatically here. In the meantime, use the interactive whiteboard on the right to design plays.
                          </p>
                          {isAdmin && (
                            <Button
                              onClick={() => setStartMeetingModalOpen(true)}
                              disabled={startingSession}
                              size="sm"
                              className="text-xs bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2"
                            >
                              <Play className="w-4 h-4 fill-white" /> Start Meeting & Board
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Past Meetings Toggle */}
                      {recentMeetings.length > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowMeetingHistory((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-white transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-semibold">{showMeetingHistory ? "Hide Past Sessions" : `View Session History (${recentMeetings.length})`}</span>
                          </button>

                          {showMeetingHistory && (
                            <div className="mt-2.5 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                              {recentMeetings.map((m: any) => (
                                <div
                                  key={m.id}
                                  className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-white truncate max-w-[180px]">
                                      {m.topic}
                                    </div>
                                    <div className="text-[10px] text-[#737373]">
                                      ID: {m.zoomMeetingId} &bull; {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </div>
                                  </div>
                                  {m.joinUrl && (
                                    <a
                                      href={m.joinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
                                    >
                                      Join / Check
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Embedded Miro Whiteboard */}
            {roomLayout !== "zoom_focus" && (
              <div
                className={`rounded-xl bg-[#0D0D0D] border border-white/10 p-2 overflow-hidden flex flex-col transition-all duration-300 ${
                  roomLayout === "miro_focus"
                    ? "lg:col-span-12 h-[720px]"
                    : "lg:col-span-6 h-[660px]"
                }`}
              >
                <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Interactive Whiteboard
                    </span>
                    {allBoards.length > 1 ? (
                      <div className="flex items-center gap-1.5 ml-1">
                        <select
                          value={displayedBoard?.id || ""}
                          onChange={(e) => setSelectedBoardId(e.target.value)}
                          className="bg-black/60 border border-white/15 rounded px-2 py-0.5 text-[11px] text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer max-w-[200px] truncate"
                          title="Select whiteboard from session history"
                        >
                          {allBoards.map((b: any) => (
                            <option key={b.id} value={b.id} className="bg-[#141414] text-white">
                              {b.id === activeBoard?.id ? `★ (Active) ${b.title}` : b.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded truncate max-w-[180px]">
                        {displayedBoard?.title || "Active Canvas"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-[10px] font-semibold text-[#A3A3A3] bg-white/5 px-2 py-0.5 rounded">
                      24/7 Canvas Access
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setLinkMiroModalOpen(true)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition-colors"
                      >
                        Link / Switch Board
                      </button>
                    )}
                    {roomLayout === "miro_focus" && (
                      <button
                        onClick={() => setRoomLayout("split")}
                        className="text-[10px] text-[#A3A3A3] hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                      >
                        Show Zoom
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full flex-1 bg-black/40 relative">
                  {displayedBoard ? (
                    <MiroBoard
                      key={displayedBoard.id}
                      boardId={displayedBoard.id}
                      height={roomLayout === "miro_focus" ? "660px" : "600px"}
                      onOpenChangeModal={() => setLinkMiroModalOpen(true)}
                      isAdmin={isAdmin}
                    />
                  ) : (
                    <div
                      className={`w-full rounded-b-xl flex flex-col items-center justify-center p-8 text-center bg-[#070707] ${
                        roomLayout === "miro_focus" ? "h-[660px]" : "h-[600px]"
                      }`}
                    >
                      <Presentation className="w-12 h-12 text-amber-400/40 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">
                        Miro Whiteboard Workspace Ready
                      </h4>
                      <p className="text-xs text-[#A3A3A3] max-w-md mb-4">
                        When live strategy starts, the interactive whiteboard will allow presenters and students to draw plays, analyze formations, and annotate diagrams together.
                      </p>
                      {isAdmin && (
                        <Button
                          onClick={() => setLinkMiroModalOpen(true)}
                          className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5"
                        >
                          <Presentation className="w-4 h-4" /> Link Miro Whiteboard
                        </Button>
                      )}
                      {activeMeeting?.status === "started" && !isAdmin && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-2">
                          <Sparkles className="w-4 h-4 animate-spin" /> Session active — interactive board loading...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================== */}
        {/* SECTION 2: FILE VAULT (SPECIFIC FOLDERS)    */}
        {/* ========================================== */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
                COACHING ASSETS & PLAYBOOKS
              </span>
              <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Folder className="w-6 h-6 text-blue-400" />
                Position & Department File Vault
              </h2>
            </div>

            {isAdmin && (
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Upload File Resource
              </Button>
            )}
          </div>

          {/* Department Main Folders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "OPERATIONS", label: "Operations Folder", icon: Layers, color: "text-purple-400" },
              { id: "OFFENSE", label: "Offense Folder", icon: Folder, color: "text-red-400" },
              { id: "DEFENSE", label: "Defense Folder", icon: Shield, color: "text-blue-400" },
              { id: "SPECIAL_TEAMS", label: "Special Teams Folder", icon: Sparkles, color: "text-amber-400" },
            ].map((folder) => {
              const IconComp = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setActiveFolder(folder.id as any);
                    if (folder.id === "OFFENSE") setActiveSubfolder("QB");
                    else if (folder.id === "DEFENSE") setActiveSubfolder("Secondary");
                    else setActiveSubfolder("");
                  }}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                    isActive
                      ? "bg-white/10 border-white/30 shadow-lg"
                      : "bg-[#0D0D0D] border-white/10 hover:bg-white/5"
                  }`}
                >
                  <IconComp className={`w-5 h-5 ${folder.color}`} />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">
                      {folder.label}
                    </span>
                    <span className="text-[10px] text-[#737373]">
                      {isActive ? "Selected Folder" : "Click to View"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subfolders for OFFENSE */}
          {activeFolder === "OFFENSE" && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block">
                Offense Position Subfolders:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "QB", label: "QB (Quarterback)" },
                  { id: "RB", label: "RB (Running Back)" },
                  { id: "WR_TE", label: "WR / TE (Receivers & Tight Ends)" },
                  { id: "OL", label: "OL (Offensive Line)" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubfolder(sub.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeSubfolder === sub.id
                        ? "bg-[#F21717] text-white"
                        : "bg-white/5 text-[#A3A3A3] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    📁 {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subfolders for DEFENSE */}
          {activeFolder === "DEFENSE" && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider block">
                Defense Position Subfolders:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "Secondary", label: "Secondary (DB / Safety)" },
                  { id: "LB", label: "LB (Linebackers)" },
                  { id: "DL", label: "DL (Defensive Line)" },
                  { id: "Edge", label: "Edge (Outside Linebacker / Edge Rusher)" },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubfolder(sub.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeSubfolder === sub.id
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-[#A3A3A3] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    📁 {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Vault Listing Container */}
          <div className="rounded-xl bg-[#0D0D0D] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-400" />
                Files in {activeFolder} {activeSubfolder ? `> ${activeSubfolder}` : ""}
              </span>
              <span className="text-xs text-[#737373]">
                {files.length} {files.length === 1 ? "File" : "Files"} Available
              </span>
            </div>

            {filesLoading ? (
              <div className="py-12 flex justify-center items-center text-[#737373]">
                <Loader2 className="w-6 h-6 animate-spin text-[#F21717]" />
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FolderPlus className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-sm font-semibold text-white">
                  No files stored in this folder yet
                </p>
                <p className="text-xs text-[#737373]">
                  {isAdmin
                    ? "Click 'Upload File Resource' above to add documents, playbooks, or film notes."
                    : "Coaches will upload resources for this position soon."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-400" />
                        <h4 className="text-sm font-bold text-white">
                          {file.title}
                        </h4>
                        <span className="text-[10px] font-semibold bg-white/10 text-[#A3A3A3] px-2 py-0.5 rounded">
                          {file.fileSize || "File"}
                        </span>
                      </div>
                      {file.description && (
                        <p className="text-xs text-[#A3A3A3] pl-6">
                          {file.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[#737373] pl-6">
                        Uploaded {new Date(file.uploadedAt).toLocaleDateString()} {file.uploadedBy ? `by ${file.uploadedBy}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-6 sm:pl-0">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download / View
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================== */}
        {/* SECTION 3: ACADEMY 6-CLASS CURRICULUM       */}
        {/* ========================================== */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              ATHLETE CURRICULUM
            </span>
            <h2 className="font-display uppercase text-2xl md:text-3xl font-black text-white">
              The 6 Core Classes ({completedCount}/{totalCount} Completed)
            </h2>
          </div>

          {coursesLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#F21717]" />
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0D0D0D] border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#A3A3A3]">
                      Class {item.order || index + 1}
                    </span>
                    <h4 className="font-display uppercase text-lg font-bold text-white tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#737373]">{item.category}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/courses/${item.slug}`}>
                      <Button
                        variant={item.status === "COMPLETED" ? "outline" : "athletic"}
                        size="sm"
                        className={`text-xs font-bold ${
                          item.status === "COMPLETED"
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "bg-[#F21717] hover:bg-[#D90F0F] text-white"
                        }`}
                      >
                        {item.status === "COMPLETED" ? "Review Class" : "Start / Continue"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upload Modal (Admin Only) */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display uppercase text-xl font-bold text-white">
                  Upload Coaching Asset File
                </h3>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-xs text-[#737373] hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white uppercase">
                    File Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QB Passing Tree & Reading Progression"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F21717]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white uppercase">
                    Description / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional details or playbook instructions..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F21717]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white uppercase flex items-center justify-between">
                    <span>File Asset (DigitalOcean Spaces / Cloud Link) *</span>
                    {uploadingFileToSpaces && (
                      <span className="text-emerald-400 font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Spaces...
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      onChange={handleFileUploadToSpaces}
                      className="w-full text-xs text-[#A3A3A3] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#F21717] file:text-white hover:file:bg-[#D90F0F] cursor-pointer"
                    />
                    <input
                      type="url"
                      required
                      placeholder="https://rep1.nyc3.digitaloceanspaces.com/..."
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F21717]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white uppercase">
                      Department Folder *
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e: any) => setUploadCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F21717]"
                    >
                      <option value="OPERATIONS" className="bg-[#0D0D0D]">Operations</option>
                      <option value="OFFENSE" className="bg-[#0D0D0D]">Offense</option>
                      <option value="DEFENSE" className="bg-[#0D0D0D]">Defense</option>
                      <option value="SPECIAL_TEAMS" className="bg-[#0D0D0D]">Special Teams</option>
                    </select>
                  </div>

                  {(uploadCategory === "OFFENSE" || uploadCategory === "DEFENSE") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white uppercase">
                        Position Subfolder *
                      </label>
                      <select
                        value={uploadSubfolder}
                        onChange={(e) => setUploadSubfolder(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F21717]"
                      >
                        {uploadCategory === "OFFENSE" ? (
                          <>
                            <option value="QB" className="bg-[#0D0D0D]">QB</option>
                            <option value="RB" className="bg-[#0D0D0D]">RB</option>
                            <option value="WR_TE" className="bg-[#0D0D0D]">WR / TE</option>
                            <option value="OL" className="bg-[#0D0D0D]">OL</option>
                          </>
                        ) : (
                          <>
                            <option value="Secondary" className="bg-[#0D0D0D]">Secondary</option>
                            <option value="LB" className="bg-[#0D0D0D]">LB</option>
                            <option value="DL" className="bg-[#0D0D0D]">DL</option>
                            <option value="Edge" className="bg-[#0D0D0D]">Edge</option>
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadModalOpen(false)}
                    className="border-white/20 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingFile}
                    size="sm"
                    className="bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2"
                  >
                    {submittingFile && <Loader2 className="w-4 h-4 animate-spin" />} Save Resource
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Start Meeting Modal (Admin) */}
        {startMeetingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display uppercase text-lg font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#F21717]" />
                    Launch Strategy Session & Whiteboard
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Starts live embedded video stream and Miro whiteboard side-by-side. 100% inside your website.
                  </p>
                </div>
                <button
                  onClick={() => setStartMeetingModalOpen(false)}
                  className="text-xs text-[#737373] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-[#CCCCCC] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Automatic Embedded Room Creation
                  </div>
                  <p>
                    Clicking <strong>Start Live Session</strong> creates a real live Zoom meeting automatically. Neither you nor your athletes need to leave the website or download anything.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white uppercase flex items-center justify-between">
                    <span>Custom Zoom Link / Meeting ID (Optional)</span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">Leave blank for automatic room</span>
                  </label>
                  <input
                    type="text"
                    value={customZoomUrlInput}
                    onChange={(e) => setCustomZoomUrlInput(e.target.value)}
                    placeholder="e.g. https://zoom.us/j/85700805622 (Optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F21717]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white uppercase flex items-center justify-between">
                    <span>Custom Miro Board Link / ID (Optional)</span>
                    <span className="text-[10px] text-[#A3A3A3] font-normal">Leave blank for active board</span>
                  </label>
                  <input
                    type="text"
                    value={customMiroUrlInput}
                    onChange={(e) => setCustomMiroUrlInput(e.target.value)}
                    placeholder="e.g. https://miro.com/app/board/uXjV... (Optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <a
                    href="/api/integrations/zoom/connect"
                    className="text-xs text-[#A3A3A3] hover:text-white underline flex items-center gap-1"
                  >
                    Connect Zoom Account
                  </a>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStartMeetingModalOpen(false)}
                      className="border-white/20 text-white text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={startingSession}
                      onClick={() => handleStartMeeting(customZoomUrlInput, customMiroUrlInput)}
                      size="sm"
                      className="bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2 text-xs shadow-[0_0_20px_rgba(242,23,23,0.4)] px-5 py-2.5"
                    >
                      {startingSession ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                      Start Live Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Link Miro Board Modal */}
        {linkMiroModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                    <Presentation className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Link Miro Whiteboard</h3>
                    <p className="text-xs text-[#A3A3A3]">
                      Embed an interactive whiteboard for playbook diagrams & film review
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLinkMiroModalOpen(false)}
                  className="text-xs text-[#737373] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3.5 text-xs text-[#CCCCCC] space-y-1.5">
                  <p className="font-semibold text-amber-300">Public Access Tip:</p>
                  <p>
                    In your Miro board, click <strong>Share</strong> in the top-right corner, and make sure <strong>&quot;Anyone with the link can edit&quot;</strong> is enabled so athletes and students can collaborate without signing into Miro!
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase">
                    Miro Board Link or Board ID
                  </label>
                  <input
                    type="text"
                    value={linkMiroInput}
                    onChange={(e) => setLinkMiroInput(e.target.value)}
                    placeholder="https://miro.com/app/board/uXjV... or Board ID"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[11px] text-[#737373]">
                    Paste the full Miro board URL or the board ID. We&apos;ll automatically format it for live embedding.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLinkMiroModalOpen(false)}
                    className="border-white/20 text-white text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={linkingMiro || !linkMiroInput.trim()}
                    onClick={() => handleLinkMiroBoard(linkMiroInput)}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold gap-2 text-xs px-5 py-2.5"
                  >
                    {linkingMiro ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Presentation className="w-4 h-4" />
                    )}
                    Save & Link Board
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
