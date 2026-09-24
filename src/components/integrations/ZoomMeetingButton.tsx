"use client";

import React from "react";
import { Video, Calendar, Plus, Copy, Check, Loader2 } from "lucide-react";

interface ZoomMeetingButtonProps {
  contextType?: string;
  contextId?: string;
  className?: string;
}

export function ZoomMeetingButton({ contextType = "classroom", contextId, className = "" }: ZoomMeetingButtonProps) {
  const [meetings, setMeetings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

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

  const nextUpcoming = meetings.find((m) => m.status === "scheduled");

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#A3A3A3] ${className}`}>
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

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <a
        href={nextUpcoming.joinUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-md shadow-blue-900/20"
      >
        <Video className="w-3.5 h-3.5" /> Join Live Zoom ({nextUpcoming.topic})
      </a>
      <button
        onClick={() => handleCopyLink(nextUpcoming.id, nextUpcoming.joinUrl)}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
        title="Copy Link"
      >
        {copiedId === nextUpcoming.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
