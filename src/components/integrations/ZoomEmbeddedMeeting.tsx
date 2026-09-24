"use client";

import React from "react";
import { Loader2, Video, ExternalLink, Maximize2, RefreshCw, AlertCircle } from "lucide-react";

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
  const [isClient, setIsClient] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const clientRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
    setIsClient(true);
  }, []);

  const initZoomSDK = React.useCallback(async () => {
    if (!cleanMeetingNumber) {
      setErrorMessage("Invalid Meeting Number provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch SDK signature from backend
      const sigRes = await fetch("/api/integrations/zoom/sdk-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingNumber: cleanMeetingNumber,
          role,
        }),
      });

      if (!sigRes.ok) {
        const errData = await sigRes.json();
        throw new Error(errData.error || "Failed to generate Zoom Meeting SDK signature.");
      }

      const { signature, sdkKey } = await sigRes.json();

      // 2. Dynamically import Zoom Meeting SDK (Embedded Component View)
      const ZoomMtgEmbedded = (await import("@zoom/meetingsdk/embedded")).default;

      // Clean up any existing client instance
      if (clientRef.current) {
        try {
          clientRef.current.leaveMeeting();
        } catch {}
      }

      const client = ZoomMtgEmbedded.createClient();
      clientRef.current = client;

      const zoomAppRoot = document.getElementById("zoom-meeting-root");
      if (!zoomAppRoot) {
        throw new Error("Zoom meeting root container element not found.");
      }

      // 3. Initialize SDK Client
      await client.init({
        zoomAppRoot,
        language: "en-US",
        customize: {
          meetingInfo: [
            "topic",
            "host",
            "mn",
            "pwd",
            "telPwd",
            "invite",
            "participant",
            "dc",
            "enctype",
          ],
          toolbar: {
            buttons: [
              {
                text: "Leave",
                className: "LeaveBtn",
                onClick: () => {
                  if (clientRef.current) {
                    try {
                      clientRef.current.leaveMeeting();
                    } catch {}
                  }
                  if (onLeave) onLeave();
                },
              },
            ],
          },
        },
      });

      // 4. Join Meeting
      await client.join({
        sdkKey,
        signature,
        meetingNumber: cleanMeetingNumber,
        password: passcode,
        userName,
        userEmail,
      });

      setLoading(false);
    } catch (err: any) {
      console.error("Zoom Meeting SDK initialization error:", err);
      setErrorMessage(err.message || "Failed to initialize Zoom Meeting SDK.");
      setLoading(false);
    }
  }, [cleanMeetingNumber, role, passcode, userName, userEmail, onLeave]);

  React.useEffect(() => {
    if (isClient && cleanMeetingNumber) {
      initZoomSDK();
    }

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.leaveMeeting();
        } catch {}
        clientRef.current = null;
      }
    };
  }, [isClient, cleanMeetingNumber, initZoomSDK]);

  if (!isClient) {
    return (
      <div
        className={`w-full rounded-xl bg-[#070707] border border-white/10 flex flex-col items-center justify-center p-8 text-center ${className}`}
        style={{ height }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mb-2" />
        <span className="text-xs text-[#A3A3A3] font-semibold">Initializing Zoom Meeting SDK...</span>
      </div>
    );
  }

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

      {/* Main Container */}
      <div className="flex-1 w-full relative bg-black overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#F21717]" />
            <p className="text-xs font-semibold text-white">Loading Zoom Meeting SDK Component...</p>
            <p className="text-[11px] text-[#A3A3A3]">Generating secure SDK token & joining session...</p>
          </div>
        )}

        {errorMessage && !loading && (
          <div className="absolute inset-0 z-20 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500/80" />
            <p className="text-sm font-bold text-white">Meeting SDK Connection Error</p>
            <p className="text-xs text-[#A3A3A3] max-w-md">{errorMessage}</p>
            <button
              onClick={initZoomSDK}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rejoin Meeting
            </button>
          </div>
        )}

        {/* Zoom Meeting SDK Root Container */}
        <div
          id="zoom-meeting-root"
          ref={containerRef}
          className="w-full h-full flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
}
