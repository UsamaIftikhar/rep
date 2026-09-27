"use client";

import React from "react";
import {
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Share2
} from "lucide-react";

interface MiroBoardProps {
  boardId: string;
  height?: string;
  className?: string;
  onOpenChangeModal?: () => void;
  isAdmin?: boolean;
}

export function MiroBoard({
  boardId,
  height = "600px",
  className = "",
  onOpenChangeModal,
  isAdmin = false,
}: MiroBoardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);
  const [directUrl, setDirectUrl] = React.useState<string | null>(null);
  const [boardTitle, setBoardTitle] = React.useState<string>("Miro Whiteboard");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

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
      const rawBoardId = data.board?.miroBoardId || boardId;
      const cleanId = rawBoardId.replace(/^(https?:\/\/)?(www\.)?miro\.com\/app\/(board|live-embed)\//, "").split("?")[0].replace(/\/+$/, "");
      
      setEmbedUrl(data.embedUrl || `https://miro.com/app/live-embed/${cleanId}/?autoplay=true`);
      setDirectUrl(data.directUrl || `https://miro.com/app/board/${cleanId}/`);
      if (data.board?.title) setBoardTitle(data.board.title);
    } catch (err: any) {
      setError(err.message || "Unable to load Miro board");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    fetchBoardEmbed();
  }, [fetchBoardEmbed]);

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (e) {
      console.warn("Fullscreen toggle failed:", e);
      setIsFullscreen((prev) => !prev);
    }
  };

  const copyBoardLink = () => {
    if (directUrl) {
      navigator.clipboard.writeText(directUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div
        className={`w-full rounded-xl bg-[#0D0D0D] border border-white/10 flex flex-col items-center justify-center p-8 text-center ${className}`}
        style={{ height }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-semibold text-white">Connecting Miro Workspace Board...</p>
        <p className="text-xs text-[#737373] mt-1">Initializing live interactive canvas...</p>
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
        <h4 className="text-sm font-bold text-white mb-1">Miro Board Connection Notice</h4>
        <p className="text-xs text-[#A3A3A3] max-w-md mb-4">{error || "Board access expired or board was removed."}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBoardEmbed}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#F21717]" /> Retry Connection
          </button>
          {isAdmin && onOpenChangeModal && (
            <button
              onClick={onOpenChangeModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F21717] hover:bg-[#D90F0F] text-xs font-semibold text-white transition-colors"
            >
              Link Different Board
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border border-white/10 bg-black flex flex-col ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none h-screen w-screen border-0" : ""
      } ${className}`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Sub-toolbar inside Miro */}
      <div className="px-3 py-1.5 bg-[#0D0D0D] border-b border-white/10 flex items-center justify-between text-xs shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold text-white truncate max-w-[200px]">
            {boardTitle}
          </span>
          {directUrl && (
            <button
              onClick={copyBoardLink}
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-[#A3A3A3] hover:text-white transition-colors border border-white/10"
              title="Copy Miro Board Share Link"
            >
              {copiedLink ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copiedLink ? "Copied" : "Copy Link"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#A3A3A3] hover:text-white transition-colors"
              title="Open full board directly on Miro website"
            >
              <span>Open in Miro</span>
              <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
            </a>
          )}

          {isAdmin && onOpenChangeModal && (
            <button
              onClick={onOpenChangeModal}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-[#A3A3A3] hover:text-white transition-colors"
              title="Link another Miro board"
            >
              Change Board
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-[#A3A3A3] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Miro iframe */}
      <div className="flex-1 w-full relative bg-black min-h-0">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="fullscreen; clipboard-read; clipboard-write; microphone; camera; display-capture"
          allowFullScreen
          title="Interactive Miro Whiteboard"
        />
      </div>
    </div>
  );
}
