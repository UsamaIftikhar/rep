"use client";

import React from "react";
import { Video, Calendar, Plus, Copy, Check, Loader2, ExternalLink, X } from "lucide-react";
import { ZoomEmbeddedMeeting } from "./ZoomEmbeddedMeeting";

interface ZoomMeetingButtonProps {
  contextType?: string;
  contextId?: string;
  className?: string;
}

export function ZoomMeetingButton({
  contextType = "classroom",
  contextId,
  className = "",
}: ZoomMeetingButtonProps) {
  const [meetings, setMeetings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [showEmbeddedSDK, setShowEmbeddedSDK] = React.useState(false);

  const fetchContextMeetings = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/integrations/zoom/meetings", window.location.origin);
      if (contextType) url.searchParams.set("context_type", contextType);
      if (contextId) url.searchParams.set("context_id", contextId);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error("Failed to fetch context meetings:", err);
    } finally {
      setLoading(false);
    }
  }, [contextType, contextId]);

  React.useEffect(() => {
    fetchContextMeetings();
  }, [fetchContextMeetings]);

  const activeMeeting = meetings.find((m) => m.status === "started");
  const nextUpcoming = activeMeeting || meetings.find((m) => m.status === "scheduled");

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#A3A3A3] ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /> Checking Zoom session...
      </div>
    );
  }

  if (!nextUpcoming) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-[#737373] ${className}`}>
        <Video className="w-3.5 h-3.5 text-gray-500" /> No upcoming Zoom session
      </div>
    );
  }

  const cleanId = nextUpcoming.zoomMeetingId || nextUpcoming.id;
  const desktopAppUrl = `zoommtg://zoom.us/join?confno=${cleanId.replace(/[^0-9]/g, "")}`;

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {nextUpcoming.status === "started" ? (
          <button
            onClick={() => setShowEmbeddedSDK(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-md shadow-emerald-900/20 animate-pulse"
          >
            <Video className="w-3.5 h-3.5" /> Join Live SDK Session ({nextUpcoming.topic})
          </button>
        ) : (
          <a
            href={nextUpcoming.joinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-md shadow-blue-900/20"
          >
            <Video className="w-3.5 h-3.5" /> Scheduled: {nextUpcoming.topic}
          </a>
        )}

        <a
          href={desktopAppUrl}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors text-xs flex items-center gap-1"
          title="Join in Desktop Zoom App"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => handleCopyLink(nextUpcoming.id, nextUpcoming.joinUrl)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
          title="Copy Link"
        >
          {copiedId === nextUpcoming.id ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Inline Embedded SDK Modal */}
      {showEmbeddedSDK && activeMeeting && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#121212] border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Embedded Zoom Session — {activeMeeting.topic}
              </h3>
              <button
                onClick={() => setShowEmbeddedSDK(false)}
                className="p-1 text-[#A3A3A3] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full bg-black">
              <ZoomEmbeddedMeeting
                meetingId={activeMeeting.zoomMeetingId}
                joinUrl={activeMeeting.joinUrl}
                password={activeMeeting.password}
                height="100%"
                onLeave={() => setShowEmbeddedSDK(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
