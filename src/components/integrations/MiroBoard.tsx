"use client";

import React from "react";
import { Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

interface MiroBoardProps {
  boardId: string;
  height?: string;
  className?: string;
}

export function MiroBoard({ boardId, height = "600px", className = "" }: MiroBoardProps) {
  const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBoardEmbed = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/integrations/miro/boards/${boardId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load Miro board embed");
      }
      const data = await res.json();
      setEmbedUrl(data.embedUrl || `https://miro.com/app/live-embed/${data.board.miroBoardId}/`);
    } catch (err: any) {
      setError(err.message || "Unable to load Miro board");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    fetchBoardEmbed();
  }, [fetchBoardEmbed]);

  if (loading) {
    return (
      <div
        className={`w-full rounded-xl bg-[#0D0D0D] border border-white/10 flex flex-col items-center justify-center p-8 text-center ${className}`}
        style={{ height }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#F21717] mb-3" />
        <p className="text-sm font-semibold text-white">Loading Miro Workspace Board...</p>
        <p className="text-xs text-[#737373] mt-1">Connecting to Miro Web SDK...</p>
      </div>
    );
  }

  if (error || !embedUrl) {
    return (
      <div
        className={`w-full rounded-xl bg-[#0D0D0D] border border-red-500/20 flex flex-col items-center justify-center p-8 text-center ${className}`}
        style={{ height }}
      >
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <h4 className="text-sm font-bold text-white mb-1">Miro Board Unavailable</h4>
        <p className="text-xs text-[#A3A3A3] max-w-md mb-4">{error || "Board access expired or board was removed."}</p>
        <button
          onClick={fetchBoardEmbed}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#F21717]" /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-white/10 bg-black ${className}`} style={{ height }}>
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="fullscreen; clipboard-read; clipboard-write"
        title="Miro Board Embed"
      />
    </div>
  );
}
