"use client";

import React from "react";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Tv,
  Globe,
  Radio,
  Lock,
  Hash,
  LogOut
} from "lucide-react";

interface ZoomEmbeddedMeetingProps {
  meetingId: string;
  joinUrl?: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  role?: number; // 0 = attendee, 1 = host
  height?: string;
  className?: string;
  isTheatre?: boolean;
  onToggleTheatre?: () => void;
  onLeave?: () => void;
  onForceClose?: () => void;
}

export function ZoomEmbeddedMeeting({
  meetingId,
  joinUrl,
  password: initialPassword,
  userName = "Academy Member",
  userEmail = "",
  role = 0,
  height = "640px",
  className = "",
  isTheatre = false,
  onToggleTheatre,
  onLeave,
  onForceClose,
}: ZoomEmbeddedMeetingProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedPwd, setCopiedPwd] = React.useState(false);

  // Extract passcode from joinUrl if not explicitly provided
  let passcode = initialPassword || "";
  if (!passcode && joinUrl) {
    const pwdMatch = joinUrl.match(/pwd=([^&]+)/);
    if (pwdMatch && pwdMatch[1]) {
      passcode = decodeURIComponent(pwdMatch[1]);
    }
  }

  const cleanMeetingNumber = meetingId.replace(/[^0-9]/g, "");

  // Listen to native fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
      // Fallback to CSS fullscreen
      setIsFullscreen((prev) => !prev);
    }
  };

  const copyMeetingId = () => {
    if (cleanMeetingNumber) {
      navigator.clipboard.writeText(cleanMeetingNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const copyPassword = () => {
    if (passcode) {
      navigator.clipboard.writeText(passcode);
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 2000);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ZOOM_LEAVE") {
        if (onLeave) onLeave();
      }
      if (event.data && event.data.type === "ZOOM_FORCE_CLOSE") {
        if (onForceClose) onForceClose();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLeave, onForceClose]);

  const embedSrc = `/zoom-embed.html?meetingNumber=${encodeURIComponent(
    cleanMeetingNumber
  )}&role=${role}&passcode=${encodeURIComponent(passcode)}&userName=${encodeURIComponent(
    userName
  )}&userEmail=${encodeURIComponent(userEmail)}`;

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-xl bg-[#000000] border border-white/10 overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] rounded-none h-screen w-screen border-0"
          : "relative h-full"
      } ${className}`}
      style={{
        height: isFullscreen ? "100vh" : height,
        minHeight: isFullscreen ? "100vh" : "560px",
      }}
    >
      {/* Interactive Top Control Bar */}
      <div className="px-3.5 py-2 bg-[#0D0D0D] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-white uppercase tracking-wider text-[11px] sm:text-xs">
            Zoom Session
          </span>

          {cleanMeetingNumber && (
            <button
              onClick={copyMeetingId}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#A3A3A3] hover:text-white transition-colors"
              title="Copy Meeting ID"
            >
              <Hash className="w-2.5 h-2.5 text-[#F21717]" />
              <span className="font-mono">{cleanMeetingNumber}</span>
              {copiedId ? (
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          )}

          {passcode && (
            <button
              onClick={copyPassword}
              className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#A3A3A3] hover:text-white transition-colors"
              title="Copy Passcode"
            >
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span className="font-mono">Passcode</span>
              {copiedPwd ? (
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          )}
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleTheatre && (
            <button
              onClick={onToggleTheatre}
              className={`p-1.5 rounded text-[11px] flex items-center gap-1 transition-colors border ${
                isTheatre
                  ? "bg-[#F21717]/20 border-[#F21717]/40 text-white"
                  : "bg-white/5 border-white/10 text-[#A3A3A3] hover:text-white hover:bg-white/10"
              }`}
              title={isTheatre ? "Switch to Split View" : "Expand to Theatre Mode"}
            >
              <Tv className="w-3 h-3 text-[#F21717]" />
              <span className="hidden sm:inline">
                {isTheatre ? "Split View" : "Theatre Mode"}
              </span>
            </button>
          )}

          {cleanMeetingNumber && (
            <a
              href={`zoommtg://zoom.us/join?confno=${cleanMeetingNumber}${
                passcode ? `&pwd=${encodeURIComponent(passcode)}` : ""
              }`}
              className="text-[10px] sm:text-[11px] text-[#A3A3A3] hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded transition-colors"
              title="Open inside Native Zoom Desktop App"
            >
              <ExternalLink className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Zoom App</span>
            </a>
          )}

          {cleanMeetingNumber && (
            <a
              href={`https://zoom.us/wc/${cleanMeetingNumber}/join${
                passcode ? `?pwd=${encodeURIComponent(passcode)}` : ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-[11px] text-[#A3A3A3] hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded transition-colors"
              title="Open Zoom in dedicated browser tab"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Browser Tab</span>
            </a>
          )}

          {onLeave && (
            <button
              onClick={onLeave}
              className="text-[10px] sm:text-[11px] text-red-400 hover:text-white flex items-center gap-1 bg-red-500/10 hover:bg-red-600/30 border border-red-500/30 px-2 py-1 rounded transition-colors"
              title={role === 1 ? "End Meeting & Archive Session" : "Leave Live Classroom"}
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span className="hidden sm:inline">{role === 1 ? "End Session" : "Leave"}</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-[#A3A3A3] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main SDK Container (Same-Origin Iframe) */}
      <div className="flex-1 w-full relative bg-black overflow-hidden flex flex-col min-h-0">
        <iframe
          src={embedSrc}
          allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *; screen-wake-lock *"
          className="w-full h-full border-0 flex-1 min-h-0"
          title="Zoom Strategy Session"
        />
      </div>
    </div>
  );
}
