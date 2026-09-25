"use client";

import React from "react";
import { ExternalLink, Maximize2 } from "lucide-react";

interface ZoomEmbeddedMeetingProps {
  meetingId: string;
  joinUrl?: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  role?: number; // 0 = attendee, 1 = host
  height?: string;
  className?: string;
  onLeave?: () => void;
}

export function ZoomEmbeddedMeeting({
  meetingId,
  joinUrl,
  password: initialPassword,
  userName = "Academy Member",
  userEmail = "",
  role = 0,
  height = "480px",
  className = "",
  onLeave,
}: ZoomEmbeddedMeetingProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Extract passcode from joinUrl if not explicitly provided
  let passcode = initialPassword || "";
  if (!passcode && joinUrl) {
    const pwdMatch = joinUrl.match(/pwd=([^&]+)/);
    if (pwdMatch && pwdMatch[1]) {
      passcode = decodeURIComponent(pwdMatch[1]);
    }
  }

  const cleanMeetingNumber = meetingId.replace(/[^0-9]/g, "");

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "ZOOM_LEAVE") {
        if (onLeave) onLeave();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLeave]);

  const embedSrc = `/zoom-embed.html?meetingNumber=${encodeURIComponent(
    cleanMeetingNumber
  )}&role=${role}&passcode=${encodeURIComponent(passcode)}&userName=${encodeURIComponent(
    userName
  )}&userEmail=${encodeURIComponent(userEmail)}`;

  return (
    <div
      className={`w-full rounded-xl bg-[#000000] border border-white/10 overflow-hidden flex flex-col relative ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : ""
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider">
            Live Strategy Session (Zoom SDK)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {joinUrl && (
            <a
              href={`zoommtg://zoom.us/join?confno=${cleanMeetingNumber}&pwd=${encodeURIComponent(passcode)}`}
              className="text-[10px] text-[#A3A3A3] hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded"
              title="Open in Desktop Zoom App"
            >
              Join in Desktop App <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-[#A3A3A3] hover:text-white hover:bg-white/10"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SDK Container (Same-Origin Iframe) */}
      <div className="flex-1 w-full relative bg-black overflow-hidden flex flex-col">
        <iframe
          src={embedSrc}
          allow="camera; microphone; display-capture; autoplay; fullscreen"
          className="w-full h-full border-0 flex-1"
          title="Zoom Strategy Session"
        />
      </div>
    </div>
  );
}
