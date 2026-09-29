"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell, PublicNavbar, PublicFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { MiroBoard } from "@/components/integrations/MiroBoard";
import { ZoomEmbeddedMeeting } from "@/components/integrations/ZoomEmbeddedMeeting";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Video,
  Presentation,
  Folder,
  FileText,
  Play,
  Square,
  Plus,
  Download,
  Trash2,
  ExternalLink,
  Users,
  Copy,
  Check,
  Clock,
  History,
  RotateCcw,
  Sparkles,
  Lock,
  Loader2,
  ChevronRight,
  BookOpen,
  Layers,
  Award,
  Calendar,
  AlertCircle,
  Film,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface AcademyFile {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  category: string; // OPERATIONS | OFFENSE | DEFENSE | SPECIAL_TEAMS
  subfolder?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

interface HistoricalSession {
  id: string;
  title: string;
  description?: string | null;
  scheduledDate: string;
  zoomMeetingId?: string | null;
  zoomJoinUrl?: string | null;
  zoomPassword?: string | null;
  whiteboardId?: string | null;
  whiteboardUrl?: string | null;
  recordingUrl?: string | null;
  retentionUntil?: string | null;
  status: string;
  presenterName?: string | null;
  department?: string | null;
}

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  order: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
}

export default function CoachesAcademyPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Entitlement and access state
  const [hasAccess, setHasAccess] = React.useState<boolean>(false);
  const [isPresenter, setIsPresenter] = React.useState<boolean>(false);
  const [checkingAccess, setCheckingAccess] = React.useState<boolean>(true);
  const [activatingMembership, setActivatingMembership] = React.useState<boolean>(false);

  // Active session & Live Classroom state
  const [activeSession, setActiveSession] = React.useState<HistoricalSession | null>(null);
  const [activeMeeting, setActiveMeeting] = React.useState<any>(null);
  const [latestMeeting, setLatestMeeting] = React.useState<any>(null);
  const [activeBoard, setActiveBoard] = React.useState<any>(null);
  const [allBoards, setAllBoards] = React.useState<any[]>([]);
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = React.useState<boolean>(true);
  const [startingSession, setStartingSession] = React.useState<boolean>(false);
  const [isMiroConnected, setIsMiroConnected] = React.useState<boolean>(false);
  const [roomLayout, setRoomLayout] = React.useState<"split" | "zoom_focus" | "miro_focus">("split");

  // Link Miro Board modal state (Presenter only)
  const [linkMiroModalOpen, setLinkMiroModalOpen] = React.useState<boolean>(false);
  const [linkMiroInput, setLinkMiroInput] = React.useState<string>("");
  const [linkingMiro, setLinkingMiro] = React.useState<boolean>(false);

  // Historical sessions (24-Month Retained Recordings & Whiteboards)
  const [pastSessions, setPastSessions] = React.useState<HistoricalSession[]>([]);

  // Start Meeting Modal / Controls
  const [showStartModal, setShowStartModal] = React.useState<boolean>(false);
  const [sessionTopic, setSessionTopic] = React.useState<string>("");
  const [sessionDepartment, setSessionDepartment] = React.useState<string>("OFFENSE");
  const [customZoomUrl, setCustomZoomUrl] = React.useState<string>("");
  const [customMiroUrl, setCustomMiroUrl] = React.useState<string>("");
  const [copiedMeetingId, setCopiedMeetingId] = React.useState<boolean>(false);
  const [copiedMeetingPwd, setCopiedMeetingPwd] = React.useState<boolean>(false);

  const displayedBoard = React.useMemo(() => {
    if (selectedBoardId && allBoards.length > 0) {
      const found = allBoards.find(
        (b: any) => b.id === selectedBoardId || b.miroBoardId === selectedBoardId
      );
      if (found) return found;
    }
    if (activeSession?.whiteboardId && allBoards.length > 0) {
      const sessionBoard = allBoards.find(
        (b: any) => b.miroBoardId === activeSession.whiteboardId || b.id === activeSession.whiteboardId
      );
      if (sessionBoard) return sessionBoard;
    }
    return (
      activeBoard ||
      (allBoards.length > 0
        ? allBoards[0]
        : {
            id: "uXjVHi7vvRw=",
            miroBoardId: "uXjVHi7vvRw=",
            title: "REP 1 Coaching Strategy Whiteboard",
          })
    );
  }, [selectedBoardId, allBoards, activeBoard, activeSession]);

  const copyMeetingPassword = (pwdStr: string) => {
    if (!pwdStr) return;
    navigator.clipboard.writeText(pwdStr);
    setCopiedMeetingPwd(true);
    setTimeout(() => setCopiedMeetingPwd(false), 2000);
  };

  const handleLinkMiroBoard = async (urlOrId: string) => {
    if (!urlOrId.trim()) return;
    try {
      setLinkingMiro(true);
      const res = await fetch("/api/integrations/miro/boards/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrId: urlOrId.trim(),
          title: "Coaches Academy Playbook Whiteboard",
          contextType: "coaching_academy",
          contextId: "coaches-academy-live",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinkMiroModalOpen(false);
        setLinkMiroInput("");
        await fetchSessionData();
        if (data.board?.id) setSelectedBoardId(data.board.id);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to link Miro board");
      }
    } catch (e: any) {
      alert("Error linking board: " + e.message);
    } finally {
      setLinkingMiro(false);
    }
  };

  // Playbooks CMS state
  const [selectedCategory, setSelectedCategory] = React.useState<string>("OFFENSE");
  const [selectedSubfolder, setSelectedSubfolder] = React.useState<string>("ALL");
  const [files, setFiles] = React.useState<AcademyFile[]>([]);
  const [filesLoading, setFilesLoading] = React.useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = React.useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = React.useState<string>("");
  const [uploadDesc, setUploadDesc] = React.useState<string>("");
  const [uploadUrl, setUploadUrl] = React.useState<string>("");
  const [uploadType, setUploadType] = React.useState<string>("pdf");
  const [uploadSubfolder, setUploadSubfolder] = React.useState<string>("QB");
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadingFileToSpaces, setUploadingFileToSpaces] = React.useState<boolean>(false);

  // Direct DigitalOcean Spaces file uploader
  const handleFileUploadToSpaces = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFileToSpaces(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `coaches-academy/${selectedCategory.toLowerCase()}`);

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
        if (file.type.includes("video")) setUploadType("video");
        else if (file.type.includes("pdf")) setUploadType("pdf");
        else if (file.type.includes("presentation") || file.type.includes("powerpoint")) setUploadType("presentation");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to upload file to storage");
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploadingFileToSpaces(false);
    }
  };

  // Active navigation tab
  const [activeTab, setActiveTab] = React.useState<"classroom" | "playbooks" | "curriculum" | "archive">("classroom");

  // The 6 Required Classes state
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(6);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  // Check entitlement status
  const checkEntitlement = React.useCallback(async () => {
    try {
      const res = await fetch("/api/coaches-academy/entitlement");
      if (!res.ok) {
        setHasAccess(false);
        setIsPresenter(false);
        return;
      }
      const data = await res.json();
      setHasAccess(!!data.allowed);
      setIsPresenter(!!data.isPresenter);
    } catch (e) {
      console.warn("Entitlement check error:", e);
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  }, []);

  // Fetch session data
  const fetchSessionData = React.useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await fetch("/api/coaches-academy/session");
      if (!res.ok) return;
      const data = await res.json();
      if (data.allowed) {
        setHasAccess(true);
        setIsPresenter(!!data.isPresenter);
        setIsMiroConnected(!!data.isMiroConnected);
        setActiveSession(data.activeSession || null);
        setActiveMeeting(data.activeMeeting || null);
        setLatestMeeting(data.latestMeeting || null);
        setActiveBoard(data.activeBoard || null);
        setAllBoards(data.allBoards || []);
        if (data.activeSession?.whiteboardId) {
          const matching = (data.allBoards || []).find(
            (b: any) =>
              b.miroBoardId === data.activeSession.whiteboardId ||
              b.id === data.activeSession.whiteboardId
          );
          if (matching) {
            setSelectedBoardId(matching.id);
          } else if (data.activeBoard) {
            setSelectedBoardId(data.activeBoard.id);
          }
        } else if (data.activeBoard) {
          setSelectedBoardId((prev) => prev || data.activeBoard.id);
        }
        setPastSessions(data.pastSessions || []);
      }
    } catch (err) {
      console.warn("Failed to fetch session state:", err);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // Fetch CMS playbook files
  const fetchFiles = React.useCallback(async () => {
    if (!hasAccess) return;
    setFilesLoading(true);
    try {
      let url = `/api/coaches-academy/files?category=${selectedCategory}`;
      if (selectedSubfolder !== "ALL") {
        url += `&subfolder=${selectedSubfolder}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.warn("Failed to load files:", err);
    } finally {
      setFilesLoading(false);
    }
  }, [hasAccess, selectedCategory, selectedSubfolder]);

  React.useEffect(() => {
    checkEntitlement();
  }, [checkEntitlement]);

  React.useEffect(() => {
    if (hasAccess) {
      fetchSessionData();
      fetchFiles();
    }
  }, [hasAccess, fetchSessionData, fetchFiles]);

  React.useEffect(() => {
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
      .catch((err) => console.warn("Failed to load courses:", err))
      .finally(() => setCoursesLoading(false));
  }, []);

  // Activate annual pass (for testing or direct enrollment)
  const handleActivateAnnualPass = async () => {
    setActivatingMembership(true);
    try {
      const res = await fetch("/api/coaches-academy/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate" }),
      });
      if (res.ok) {
        await checkEntitlement();
        await fetchSessionData();
      }
    } catch (e) {
      console.warn("Activation error:", e);
    } finally {
      setActivatingMembership(false);
    }
  };

  // Start live session (Presenter only)
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartingSession(true);
    try {
      const res = await fetch("/api/coaches-academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          topic: sessionTopic || "REP 1 Coaches Academy Live Strategy & Film Session",
          department: sessionDepartment,
          customJoinUrl: customZoomUrl || undefined,
          customMiroUrl: customMiroUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to start live session");
        return;
      }
      setShowStartModal(false);
      setSessionTopic("");
      setCustomZoomUrl("");
      setCustomMiroUrl("");
      if (data.board?.id) {
        setSelectedBoardId(data.board.id);
      } else if (data.session?.whiteboardId) {
        setSelectedBoardId(data.session.whiteboardId);
      }
      await fetchSessionData();
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setStartingSession(false);
    }
  };

  // End live session (Presenter only)
  const handleEndSession = async () => {
    if (!confirm("Conclude this live session? It will be archived with a 24-month retention window.")) return;
    setStartingSession(true);
    try {
      const res = await fetch("/api/coaches-academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      });
      if (res.ok) {
        await fetchSessionData();
      }
    } catch (err: any) {
      alert("Error concluding session: " + err.message);
    } finally {
      setStartingSession(false);
    }
  };

  const [syncingRecordingId, setSyncingRecordingId] = React.useState<string | null>(null);

  // Sync recordings from Zoom Cloud (Presenter only)
  const handleSyncRecording = async (sessionId: string, zoomMeetingId?: string | null) => {
    if (!zoomMeetingId) {
      alert("No Zoom Meeting ID associated with this session to query.");
      return;
    }
    setSyncingRecordingId(sessionId);
    try {
      const res = await fetch("/api/coaches-academy/session/sync-recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, zoomMeetingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Recording not yet available on Zoom Cloud.");
        return;
      }
      alert("Cloud recording synchronized successfully!");
      await fetchSessionData();
    } catch (e: any) {
      alert("Failed to sync recording: " + e.message);
    } finally {
      setSyncingRecordingId(null);
    }
  };

  // Force close any stuck in-progress meetings
  const handleCloseInProgress = async () => {
    if (!confirm("Close all in-progress meetings on Zoom Cloud and local DB?")) return;
    setStartingSession(true);
    try {
      const res = await fetch("/api/coaches-academy/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close_in_progress" }),
      });
      const data = await res.json();
      alert(data.message || "All in-progress meetings cleared.");
      await fetchSessionData();
    } catch (err: any) {
      alert("Failed to close meetings: " + err.message);
    } finally {
      setStartingSession(false);
    }
  };

  // Upload file (Presenter only)
  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadUrl) {
      alert("Title and URL are required");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch("/api/coaches-academy/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDesc,
          fileUrl: uploadUrl,
          fileType: uploadType,
          fileSize: uploadType.toUpperCase() + " Resource",
          category: selectedCategory,
          subfolder: selectedCategory === "SPECIAL_TEAMS" ? null : uploadSubfolder,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Upload failed");
        return;
      }
      setShowUploadModal(false);
      setUploadTitle("");
      setUploadDesc("");
      setUploadUrl("");
      await fetchFiles();
    } catch (e: any) {
      alert("Failed to upload: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file (Presenter only)
  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to remove this playbook asset?")) return;
    try {
      const res = await fetch(`/api/coaches-academy/files?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchFiles();
      }
    } catch (e: any) {
      alert("Failed to delete file: " + e.message);
    }
  };

  const copyMeetingId = (idStr: string) => {
    if (!idStr) return;
    navigator.clipboard.writeText(idStr);
    setCopiedMeetingId(true);
    setTimeout(() => setCopiedMeetingId(false), 2000);
  };

  // Offense & Defense subfolder definitions
  const OFFENSE_SUBFOLDERS = [
    { key: "ALL", label: "All Offense" },
    { key: "QB", label: "Quarterback (QB)" },
    { key: "RB", label: "Running Back (RB)" },
    { key: "WR_TE", label: "Wide Receiver & Tight End (WR/TE)" },
    { key: "OL", label: "Offensive Line (OL)" },
  ];

  const DEFENSE_SUBFOLDERS = [
    { key: "ALL", label: "All Defense" },
    { key: "DL", label: "Defensive Line (DL)" },
    { key: "EDGE", label: "Edge Rushers" },
    { key: "LB", label: "Linebackers (LB)" },
    { key: "SECONDARY", label: "Secondary / DBs" },
  ];

  const activeSubfolders =
    selectedCategory === "OFFENSE"
      ? OFFENSE_SUBFOLDERS
      : selectedCategory === "DEFENSE"
      ? DEFENSE_SUBFOLDERS
      : [];

  // Content rendering wrapper
  const renderContent = () => {
    if (checkingAccess || isAuthLoading) {
      return (
        <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-sm">Verifying Coaches Academy Credentials & Entitlements...</p>
        </div>
      );
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC / NON-MEMBER LANDING PAGE
    // ─────────────────────────────────────────────────────────────
    if (!hasAccess) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-8 sm:p-14 text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Professional Coaching Development Portal
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              REP 1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Coaches Academy</span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Master collegiate and pro-level football schemes, defensive architectures, and game operations. Live interactive whiteboard classrooms led by seasoned coaching staff Marvin, Terry, and Darius.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Button
                  onClick={handleActivateAnnualPass}
                  disabled={activatingMembership}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-6 rounded-xl shadow-lg shadow-amber-500/20 text-base"
                >
                  {activatingMembership ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Activating Annual Pass...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" /> Activate Annual Coaches Pass ($999/yr)
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <Link href="/login?callbackUrl=/coaches-academy">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-6 rounded-xl text-base">
                      Sign In to Coach Account <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/signup?callbackUrl=/coaches-academy">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white font-semibold px-8 py-6 rounded-xl text-base">
                      Create Coach Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pillars of Coaches Academy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Live Virtual Classroom</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero-friction split-screen experience combining live Zoom audio/video with an interactive collaborative whiteboard for play breakdowns and live chalk talks.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">24-Month Retained Archives</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every classroom session is permanently paired with the exact whiteboard created during that chalk talk and archived for at least 24 months for anytime replay.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-amber-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Positional Playbook CMS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Structured scheme repositories categorized across Offense (QB, RB, WR/TE, OL), Defense (DL, Edge, LB, Secondary), Special Teams, and Game Operations.
              </p>
            </div>
          </div>

          {/* Membership Pricing Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Annual Coaches Membership</h2>
            <div className="text-5xl font-black text-amber-400 tracking-tight">
              $999 <span className="text-slate-400 text-lg font-normal">/ year</span>
            </div>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Full 365-day access for coaching staff to live film study, whiteboard diagrams, complete playbook vaults, and 24-month archived session replays.
            </p>
            <div className="pt-2">
              {isAuthenticated ? (
                <Button
                  onClick={handleActivateAnnualPass}
                  disabled={activatingMembership}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-10 py-6 rounded-xl text-base w-full sm:w-auto"
                >
                  {activatingMembership ? "Enrolling..." : "Enroll in Coaches Academy Now"}
                </Button>
              ) : (
                <Link href="/login?callbackUrl=/coaches-academy">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-10 py-6 rounded-xl text-base w-full sm:w-auto">
                    Sign In to Enroll
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }

    const renderCurriculum = () => (
      <div className="space-y-6 pt-6 border-t border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#F21717] uppercase block mb-1">
              ACADEMY CURRICULUM
            </span>
            <h3 className="font-display uppercase text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-amber-400" />
              The 6 Required Classes
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Complete all six required core classes to master financial literacy, branding, NIL foundations, and unlock your official Academy badge.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              {completedCount} of {totalCount} Completed
            </span>
            <Link href="/courses">
              <Button size="sm" variant="outline" className="border-slate-800 text-xs text-slate-300 hover:text-white rounded-xl">
                Open Classroom →
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-300 font-medium">
            <span>Overall Curriculum Progress</span>
            <span className="text-amber-400 font-bold">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-400 rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Courses List */}
        <div className="space-y-3">
          {coursesLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : (
            courses.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      Class {item.order || index + 1}
                    </span>
                    {item.status === "COMPLETED" && (
                      <span className="text-emerald-400 inline-flex items-center gap-1 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                      </span>
                    )}
                  </div>
                  <h4 className="font-display uppercase text-base sm:text-lg font-bold text-white tracking-wide">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : item.status === "IN_PROGRESS"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
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
                      size="sm"
                      className="gap-1.5 h-9 px-4 text-xs font-bold bg-[#F21717] hover:bg-[#D90F0F] text-white rounded-xl"
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
    );

    return (
      <div className="space-y-8 pb-12">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {isPresenter ? "Presenter / Staff Portal" : "Coach Member"}
              </span>
              {activeSession && (
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> LIVE CLASSROOM ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              REP 1 <span className="text-amber-400">Coaches Academy</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Live chalk talk, collaborative strategy whiteboards, and positional scheme repositories.
            </p>
          </div>

          {/* Action Buttons for Presenters */}
          <div className="flex flex-wrap items-center gap-3">
            {isPresenter && (
              <>
                {!activeSession ? (
                  <Button
                    onClick={() => setShowStartModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm"
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Live Session
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndSession}
                    disabled={startingSession}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm"
                  >
                    <Square className="w-4 h-4 mr-2" /> Conclude Session & Archive
                  </Button>
                )}

                <Button
                  onClick={handleCloseInProgress}
                  disabled={startingSession}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs rounded-xl"
                  title="Force close all meetings that may be stuck in progress on Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Meetings
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("classroom")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "classroom"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Video className="w-4 h-4" /> Live Classroom
            {activeSession && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1"></span>}
          </button>

          <button
            onClick={() => setActiveTab("playbooks")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "playbooks"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Playbooks & Content Library
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "archive"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <History className="w-4 h-4" /> Past Sessions & 24-Mo Archives
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
              {pastSessions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("curriculum")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === "curriculum"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> The 6 Required Classes
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
              {completedCount}/{totalCount}
            </span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: LIVE CLASSROOM (ZOOM + MIRO SPLIT SCREEN)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "classroom" && (
          <div className="space-y-4">
            {/* Classroom Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 px-6 py-4 rounded-2xl shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  {(activeMeeting?.status === "started" || activeSession?.status === "started") ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Live Stream Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Standby • 24/7 Collaborative Canvas
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {activeSession?.title || latestMeeting?.topic || "REP 1 Coaching Strategy & Film Review"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Presenter: <span className="text-amber-400 font-semibold">{activeSession?.presenterName || "REP 1 Staff"}</span>
                  {(activeSession?.zoomMeetingId || latestMeeting?.zoomMeetingId) && (
                    <>
                      {" • "}Meeting ID:{" "}
                      <span className="font-mono text-slate-300 font-bold">
                        {activeSession?.zoomMeetingId || latestMeeting?.zoomMeetingId}
                      </span>
                      <button
                        onClick={() => copyMeetingId(activeSession?.zoomMeetingId || latestMeeting?.zoomMeetingId || "")}
                        className="ml-1.5 text-slate-400 hover:text-white inline-flex items-center"
                        title="Copy Meeting ID"
                      >
                        {copiedMeetingId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Layout Mode Controls */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoomLayout("split")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    roomLayout === "split"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Side-by-side split screen"
                >
                  Split View (50/50)
                </button>
                <button
                  type="button"
                  onClick={() => setRoomLayout("zoom_focus")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    roomLayout === "zoom_focus"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Expanded Zoom screen"
                >
                  Zoom Focus
                </button>
                <button
                  type="button"
                  onClick={() => setRoomLayout("miro_focus")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    roomLayout === "miro_focus"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Full-canvas interactive whiteboard"
                >
                  Whiteboard Focus
                </button>
              </div>
            </div>

            {/* Split Classroom View Area */}
            <div
              className={`grid gap-4 transition-all duration-300 ${
                roomLayout === "split"
                  ? "grid-cols-1 lg:grid-cols-2"
                  : roomLayout === "zoom_focus"
                  ? "grid-cols-1"
                  : "grid-cols-1"
              }`}
            >
              {/* Zoom Meeting Container */}
              {roomLayout !== "miro_focus" && (
                <div
                  className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col ${
                    roomLayout === "zoom_focus" ? "h-[740px]" : "h-[680px]"
                  }`}
                >
                  {(activeMeeting?.status === "started" || activeSession?.status === "started") && (activeMeeting?.zoomMeetingId || activeSession?.zoomMeetingId) ? (
                    <ZoomEmbeddedMeeting
                      meetingId={activeMeeting?.zoomMeetingId || activeSession?.zoomMeetingId || ""}
                      joinUrl={activeMeeting?.joinUrl || activeSession?.zoomJoinUrl || undefined}
                      password={activeMeeting?.password || activeSession?.zoomPassword || undefined}
                      userName={user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Coach Member")}
                      userEmail={user?.email || ""}
                      role={isPresenter ? 1 : 0}
                      height="100%"
                      isTheatre={roomLayout === "zoom_focus"}
                      onToggleTheatre={() =>
                        setRoomLayout((prev) => (prev === "zoom_focus" ? "split" : "zoom_focus"))
                      }
                      onForceClose={fetchSessionData}
                    />
                  ) : (
                    <div className="flex flex-col h-full bg-slate-950 divide-y divide-slate-800/80 overflow-y-auto">
                      {/* Standby Header */}
                      <div className="p-4 bg-slate-900/60 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Live Zoom Classroom Hub
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded">
                          {latestMeeting ? "Latest Session Details" : "Standby"}
                        </span>
                      </div>

                      {/* Standby Body */}
                      <div className="p-6 flex-1 flex flex-col justify-center space-y-5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                            SESSION CREDENTIALS & LAUNCH
                          </span>
                          <h3 className="text-lg md:text-xl font-bold text-white">
                            {latestMeeting?.topic || activeSession?.title || "REP 1 Coaching Strategy & Film Review"}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {latestMeeting?.status === "started"
                              ? "Live streaming is currently in progress."
                              : "Meeting is in standby or concluded. Review credentials below, check room status, or start the live room."}
                          </p>
                        </div>

                        {/* Meeting Credentials Card */}
                        {(latestMeeting?.zoomMeetingId || activeSession?.zoomMeetingId) && (
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Meeting ID</span>
                                  <span className="text-xs font-mono font-bold text-white">
                                    {latestMeeting?.zoomMeetingId || activeSession?.zoomMeetingId}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyMeetingId(latestMeeting?.zoomMeetingId || activeSession?.zoomMeetingId || "")}
                                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                  title="Copy Meeting ID"
                                >
                                  {copiedMeetingId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Passcode</span>
                                  <span className="text-xs font-mono font-bold text-white">
                                    {latestMeeting?.password || activeSession?.zoomPassword || "None Required"}
                                  </span>
                                </div>
                                {(latestMeeting?.password || activeSession?.zoomPassword) && (
                                  <button
                                    type="button"
                                    onClick={() => copyMeetingPassword(latestMeeting?.password || activeSession?.zoomPassword || "")}
                                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                    title="Copy Passcode"
                                  >
                                    {copiedMeetingPwd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            </div>

                            {latestMeeting?.createdAt && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>
                                  Scheduled / Last Session:{" "}
                                  {new Date(latestMeeting.createdAt).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {(latestMeeting?.joinUrl || activeSession?.zoomJoinUrl) && (
                            <a
                              href={latestMeeting?.joinUrl || activeSession?.zoomJoinUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                              <span>Join via Browser</span>
                            </a>
                          )}

                          {(latestMeeting?.zoomMeetingId || activeSession?.zoomMeetingId) && (
                            <a
                              href={`zoommtg://zoom.us/join?confno=${latestMeeting?.zoomMeetingId || activeSession?.zoomMeetingId}${
                                (latestMeeting?.password || activeSession?.zoomPassword)
                                  ? `&pwd=${latestMeeting?.password || activeSession?.zoomPassword}`
                                  : ""
                              }`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-bold text-blue-300 transition"
                            >
                              <Video className="w-3.5 h-3.5 text-blue-400" />
                              <span>Open in Zoom App</span>
                            </a>
                          )}

                          {isPresenter && (
                            <>
                              <Button
                                onClick={() => setShowStartModal(true)}
                                disabled={startingSession}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl gap-1.5"
                              >
                                {startingSession ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                <span>Start Live Session</span>
                              </Button>

                              <Button
                                onClick={handleCloseInProgress}
                                disabled={startingSession}
                                variant="outline"
                                size="sm"
                                className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-xl gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                <span>Reset Meetings</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Miro Whiteboard Container */}
              {roomLayout !== "zoom_focus" && (
                <div
                  className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col ${
                    roomLayout === "miro_focus" ? "h-[740px]" : "h-[680px]"
                  }`}
                >
                  {/* Whiteboard Header */}
                  <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
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
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer max-w-[220px] truncate"
                            title="Select whiteboard from session history"
                          >
                            {allBoards.map((b: any) => (
                              <option key={b.id} value={b.id} className="bg-slate-900 text-white">
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
                      <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                        24/7 Canvas Access
                      </span>
                      {isPresenter && (
                        <button
                          onClick={() => setLinkMiroModalOpen(true)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 transition"
                        >
                          Link / Switch Board
                        </button>
                      )}
                      {roomLayout === "miro_focus" && (
                        <button
                          onClick={() => setRoomLayout("split")}
                          className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
                        >
                          Show Zoom
                        </button>
                      )}
                      {displayedBoard && (
                        <a
                          href={`https://miro.com/app/board/${displayedBoard.miroBoardId || displayedBoard.id}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 flex items-center gap-1"
                          title="Open Whiteboard in Separate Window"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Whiteboard Canvas */}
                  <div className="w-full flex-1 bg-slate-950 relative">
                    {displayedBoard ? (
                      <MiroBoard
                        key={displayedBoard.id || displayedBoard.miroBoardId}
                        boardId={displayedBoard.miroBoardId || displayedBoard.id}
                        height="100%"
                        onOpenChangeModal={() => setLinkMiroModalOpen(true)}
                        isAdmin={isPresenter}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                        <Presentation className="w-12 h-12 text-amber-400/40 mb-3" />
                        <h4 className="text-sm font-bold text-white mb-1">
                          Miro Whiteboard Workspace Ready
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md mb-4">
                          Interactive whiteboard allows coaching staff and members to draw plays, analyze formations, and annotate game film together.
                        </p>
                        {isPresenter && (
                          <Button
                            onClick={() => setLinkMiroModalOpen(true)}
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                          >
                            Link / Select Miro Board
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* The 6 Required Classes Curriculum Section */}
            {renderCurriculum()}
          </div>
        )}


        {/* ─────────────────────────────────────────────────────────────
            TAB 2: PLAYBOOKS & CONTENT LIBRARY (CMS)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "playbooks" && (
          <div className="space-y-6">
            {/* Department Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: "OFFENSE", label: "Offense", icon: Shield },
                { key: "DEFENSE", label: "Defense", icon: Shield },
                { key: "SPECIAL_TEAMS", label: "Special Teams", icon: Sparkles, pending: true },
                { key: "OPERATIONS", label: "Operations", icon: Layers },
              ].map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedCategory === dept.key;
                return (
                  <button
                    key={dept.key}
                    onClick={() => {
                      setSelectedCategory(dept.key);
                      setSelectedSubfolder("ALL");
                    }}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                      {dept.pending && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Awaiting Client Names
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-bold text-base text-white">{dept.label}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {dept.key === "OFFENSE" && "QB, RB, WR/TE, OL Schemes"}
                        {dept.key === "DEFENSE" && "DL, Edge, LB, Secondary"}
                        {dept.key === "SPECIAL_TEAMS" && "Child categories pending from staff"}
                        {dept.key === "OPERATIONS" && "Game management & scouting"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subfolder Chips (For Offense & Defense) */}
            {activeSubfolders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 px-2">Subfolders:</span>
                {activeSubfolders.map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setSelectedSubfolder(sub.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedSubfolder === sub.key
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Special Teams Pending Notice */}
            {selectedCategory === "SPECIAL_TEAMS" && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-slate-300 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">Special Teams Structure: Waiting on Client</h4>
                  <p className="text-sm text-slate-300">
                    As confirmed during today's strategy meeting, Darius and Terry are providing the exact positional child-folder names for Special Teams. Once received, they will appear here automatically.
                  </p>
                </div>
              </div>
            )}

            {/* File List Header & Presenter Upload Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-lg">
                  {selectedCategory} Materials ({files.length})
                </h3>
              </div>

              {isPresenter && (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" /> Upload Material
                </Button>
              )}
            </div>

            {/* File Cards Grid */}
            {filesLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-white font-semibold">No materials uploaded in this section yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isPresenter
                    ? "Presenters can click 'Upload Material' above to attach playbook PDFs, coaching videos, or installation diagrams."
                    : "Coaching staff has not yet published files to this specific subfolder."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-amber-400 text-[11px] font-mono font-bold uppercase">
                          {file.subfolder || file.category}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {file.title}
                      </h4>
                      {file.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{file.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download / View
                      </a>

                      {isPresenter && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: HISTORICAL SESSIONS & 24-MONTH ARCHIVE
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "archive" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" /> 24-Month Retained Chalk Talks
                </h3>
                <p className="text-xs text-slate-400">
                  Per client retention policy, historical sessions retain both the classroom recording and the exact paired whiteboard used during the session.
                </p>
              </div>
            </div>

            {pastSessions.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <History className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-white font-semibold">No archived sessions recorded yet</h4>
                <p className="text-xs text-slate-400">
                  Completed live sessions will automatically be stored here with their recording and interactive whiteboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold uppercase">
                          {session.department || "CLASSROOM"}
                        </span>
                        <h4 className="text-lg font-bold text-white">{session.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(session.scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>
                        Presenter: <span className="text-slate-200">{session.presenterName || "Staff"}</span>
                      </div>
                      {session.retentionUntil && (
                        <div className="text-slate-500">
                          Retained until:{" "}
                          <span className="text-slate-400">
                            {new Date(session.retentionUntil).toLocaleDateString()}
                          </span>{" "}
                          (24-Month Retention)
                        </div>
                      )}
                    </div>

                    {/* Paired Assets Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
                      {session.recordingUrl ? (
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Film className="w-3.5 h-3.5" /> Watch Recording
                        </a>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Film className="w-3.5 h-3.5" /> Recording Archiving
                          </span>
                          {isPresenter && session.zoomMeetingId && (
                            <button
                              type="button"
                              onClick={() => handleSyncRecording(session.id, session.zoomMeetingId)}
                              disabled={syncingRecordingId === session.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
                              title="Query Zoom Cloud API to retrieve the finished cloud recording"
                            >
                              <RotateCcw className={`w-3 h-3 ${syncingRecordingId === session.id ? "animate-spin" : ""}`} />
                              <span>{syncingRecordingId === session.id ? "Syncing..." : "Sync Zoom Cloud"}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {session.whiteboardId ? (
                        <a
                          href={`https://miro.com/app/board/${session.whiteboardId}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Presentation className="w-3.5 h-3.5" /> Open Whiteboard
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">Whiteboard Saved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: THE 6 REQUIRED CLASSES CURRICULUM
           ───────────────────────────────────────────────────────────── */}
        {activeTab === "curriculum" && (
          <div className="space-y-6">
            {renderCurriculum()}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODAL: START LIVE SESSION (PRESENTER ONLY)
           ───────────────────────────────────────────────────────────── */}
        {showStartModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Start Coaches Academy Live Classroom</h3>
                <p className="text-xs text-slate-400">
                  Launches a Zoom meeting and automatically binds a fresh, dedicated interactive whiteboard.
                </p>
              </div>

              <form onSubmit={handleStartSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chalk Talk Topic / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g. Red Zone Offensive Schemes & Protection Calls"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={sessionDepartment}
                    onChange={(e) => setSessionDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                  >
                    <option value="OFFENSE">Offense</option>
                    <option value="DEFENSE">Defense</option>
                    <option value="SPECIAL_TEAMS">Special Teams</option>
                    <option value="OPERATIONS">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom Zoom Meeting URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={customZoomUrl}
                    onChange={(e) => setCustomZoomUrl(e.target.value)}
                    placeholder="https://us05web.zoom.us/j/81234567890?pwd=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to auto-create or connect via default Academy classroom room.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">Automatic Whiteboard Creation</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        A fresh, dedicated Miro whiteboard will be created immediately for this meeting and paired with your live classroom.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Custom Whiteboard URL or ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={customMiroUrl}
                      onChange={(e) => setCustomMiroUrl(e.target.value)}
                      placeholder="Leave blank for automatic board creation"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStartModal(false)}
                    className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={startingSession}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    {startingSession ? "Launching Live Classroom..." : "Launch Live Classroom"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODAL: UPLOAD MATERIAL (PRESENTER ONLY)
           ───────────────────────────────────────────────────────────── */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Upload Coaching Playbook / Video</h3>
                <p className="text-xs text-slate-400">
                  Publish coaching materials into {selectedCategory} repository.
                </p>
              </div>

              <form onSubmit={handleUploadFile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. 2026 Pistol Option Installation Packet"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Schematic notes and protection assignments..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Upload File Directly (DigitalOcean Spaces)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.mp4,.mov,.pptx,.key,.png,.jpg,.jpeg"
                    onChange={handleFileUploadToSpaces}
                    disabled={uploadingFileToSpaces}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                  />
                  {uploadingFileToSpaces && (
                    <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading to DigitalOcean Spaces S3 bucket...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    File URL (Direct S3 or External Link) *
                  </label>
                  <input
                    type="url"
                    required
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="https://rep1.nyc3.digitaloceanspaces.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">File Type</label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Coaching Video</option>
                      <option value="presentation">Presentation / Slides</option>
                      <option value="diagram">Play Diagram</option>
                    </select>
                  </div>

                  {selectedCategory !== "SPECIAL_TEAMS" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Subfolder</label>
                      <select
                        value={uploadSubfolder}
                        onChange={(e) => setUploadSubfolder(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none"
                      >
                        {selectedCategory === "OFFENSE" && (
                          <>
                            <option value="QB">Quarterback (QB)</option>
                            <option value="RB">Running Back (RB)</option>
                            <option value="WR_TE">Wide Receiver & Tight End</option>
                            <option value="OL">Offensive Line (OL)</option>
                          </>
                        )}
                        {selectedCategory === "DEFENSE" && (
                          <>
                            <option value="DL">Defensive Line (DL)</option>
                            <option value="EDGE">Edge</option>
                            <option value="LB">Linebackers (LB)</option>
                            <option value="SECONDARY">Secondary / DBs</option>
                          </>
                        )}
                        {selectedCategory === "OPERATIONS" && (
                          <option value="OPERATIONS">Operations</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    {isUploading ? "Uploading..." : "Save Material"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODAL: LINK / SWITCH MIRO BOARD (PRESENTER ONLY)
           ───────────────────────────────────────────────────────────── */}
        {linkMiroModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-amber-400" /> Link or Switch Miro Board
                </h3>
                <p className="text-xs text-slate-400">
                  Paste any existing Miro board share link or board ID to bind it as the interactive collaborative board for the coaching room.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLinkMiroBoard(linkMiroInput);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Miro Board URL or ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkMiroInput}
                    onChange={(e) => setLinkMiroInput(e.target.value)}
                    placeholder="https://miro.com/app/board/uXjV..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 outline-none font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Accepts full Miro share URLs or raw Board IDs. Make sure the board in Miro has sharing set to "Anyone with the link: Can edit" for immediate student access.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLinkMiroModalOpen(false);
                      setLinkMiroInput("");
                    }}
                    className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={linkingMiro}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    {linkingMiro ? "Binding Board..." : "Save & Switch Board"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AppShell isAdmin={isPresenter}>
      {renderContent()}
    </AppShell>
  );
}
