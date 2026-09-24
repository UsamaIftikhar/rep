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
  Presentation
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

  // Curriculum state
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(6);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  // Live session state (Zoom + Miro)
  const [activeMeeting, setActiveMeeting] = React.useState<any>(null);
  const [activeBoard, setActiveBoard] = React.useState<any>(null);
  const [sessionLoading, setSessionLoading] = React.useState(true);
  const [startingSession, setStartingSession] = React.useState(false);

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
        setActiveBoard(data.activeBoard);
      }
    } catch (e) {
      console.error("Error fetching academy session:", e);
    } finally {
      setSessionLoading(false);
    }
  }, []);

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
      fetchSession();
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
  }, [isAuthenticated, fetchSession]);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, fetchFiles]);

  // Start Meeting modal state (Admin)
  const [startMeetingModalOpen, setStartMeetingModalOpen] = React.useState(false);
  const [customZoomUrlInput, setCustomZoomUrlInput] = React.useState("");

  // Handle Admin starting meeting
  const handleStartMeeting = async (customUrl?: string) => {
    try {
      setStartingSession(true);
      const res = await fetch("/api/academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          topic: "Rep 1 Coaching Academy Live Strategy & Film Session",
          customJoinUrl: customUrl ? customUrl.trim() : undefined,
        }),
      });

      if (res.ok) {
        setStartMeetingModalOpen(false);
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

  const isTester =
    user?.email === "usama@rep1recruiting.com" ||
    user?.email === "student@rep1recruiting.com";

  // Hide page completely (404 Page Not Found) for everyone except the 2 test emails
  if (!isAuthenticated || !isTester) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-24 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#737373]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="font-display uppercase text-3xl md:text-4xl font-black text-white">
              Page Not Found
            </h1>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              The page you are looking for does not exist or is currently undergoing private maintenance.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/">
              <Button variant="outline" size="md" className="border-white/20 text-white hover:bg-white/10 text-xs font-semibold">
                Return to Home Page
              </Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
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

          <p className="text-xs md:text-sm text-[#A3A3A3]">
            When a meeting is started by an admin, the interactive Miro board launches automatically. Presenters and students can collaborate on the board while on the Zoom call!
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Embedded Zoom Video Player (Left Column - 5 cols) */}
            <div className="lg:col-span-5 rounded-xl bg-[#0D0D0D] border border-white/10 overflow-hidden flex flex-col h-[520px]">
              {activeMeeting?.status === "started" ? (
                <ZoomEmbeddedMeeting
                  meetingId={activeMeeting.zoomMeetingId}
                  joinUrl={activeMeeting.joinUrl}
                  userName={user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Academy Member"}
                  height="520px"
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 h-full bg-[#000000]">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#737373]">
                    <Video className="w-8 h-8 text-[#F21717]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display uppercase text-lg font-bold text-white">
                      Live Zoom Stream Offline
                    </h3>
                    <p className="text-xs text-[#A3A3A3] max-w-xs mx-auto leading-relaxed">
                      No active meeting right now. When an admin starts a session, the Zoom video call will embed here automatically!
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      onClick={() => setStartMeetingModalOpen(true)}
                      disabled={startingSession}
                      size="sm"
                      className="mt-2 text-xs bg-[#F21717] hover:bg-[#D90F0F] text-white font-bold gap-2 shadow-[0_0_20px_rgba(242,23,23,0.4)]"
                    >
                      {startingSession ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                      Start Meeting & Board Now
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Embedded Miro Whiteboard (Right Column - 7 cols) */}
            <div className="lg:col-span-7 rounded-xl bg-[#0D0D0D] border border-white/10 p-2 overflow-hidden flex flex-col h-[520px]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Miro Whiteboard
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#A3A3A3] bg-white/5 px-2 py-0.5 rounded">
                  Dual Presenter & Student Edit
                </span>
              </div>

              <div className="w-full flex-1 bg-black/40 relative">
                {activeBoard ? (
                  <MiroBoard boardId={activeBoard.id} height="460px" />
                ) : (
                  <div className="w-full h-[460px] rounded-b-xl flex flex-col items-center justify-center p-8 text-center bg-[#070707]">
                    <Presentation className="w-12 h-12 text-amber-400/40 mb-3" />
                    <h4 className="text-sm font-bold text-white mb-1">
                      Miro Whiteboard Workspace Ready
                    </h4>
                    <p className="text-xs text-[#A3A3A3] max-w-md mb-4">
                      When live strategy starts, the interactive whiteboard will allow presenters and students to draw plays, analyze formations, and annotate diagrams together.
                    </p>
                    {activeMeeting?.status === "started" && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin" /> Session active — interactive board loading...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
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
                      onClick={() => handleStartMeeting(customZoomUrlInput)}
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
      </div>
    </AppShell>
  );
}
