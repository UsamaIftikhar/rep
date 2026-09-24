"use client";

import React from "react";
import { Play, Download, Trash2, Video, Calendar, Clock, HardDrive, Loader2, X, AlertCircle } from "lucide-react";

interface RecordingRecord {
  id: string;
  recordingType: string;
  fileSizeBytes: number;
  durationSeconds: number;
  status: string;
  recordedAt: string;
  meeting?: {
    topic: string;
    startTime: string;
    durationMinutes: number;
    contextType?: string;
  } | null;
}

export function ZoomRecordingPlayer({ meetingId }: { meetingId?: string }) {
  const [recordings, setRecordings] = React.useState<RecordingRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Playback Modal State
  const [playingVideoUrl, setPlayingVideoUrl] = React.useState<string | null>(null);
  const [playingTopic, setPlayingTopic] = React.useState<string>("");
  const [isLoadingUrl, setIsLoadingUrl] = React.useState<string | null>(null);

  // Delete State
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const fetchRecordings = React.useCallback(async () => {
    try {
      const url = new URL("/api/integrations/zoom/recordings", window.location.origin);
      if (meetingId) url.searchParams.set("meeting_id", meetingId);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      console.error("Failed to fetch Zoom recordings:", err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  React.useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // Polling logic: if any recording is in 'processing' status, poll every 10s
  React.useEffect(() => {
    const hasProcessing = recordings.some((r) => r.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchRecordings();
    }, 10000);

    return () => clearInterval(interval);
  }, [recordings, fetchRecordings]);

  const handlePlayRecording = async (recording: RecordingRecord) => {
    setIsLoadingUrl(recording.id);
    try {
      const res = await fetch(`/api/integrations/zoom/recordings/${recording.id}/url`);
      if (res.ok) {
        const data = await res.json();
        setPlayingVideoUrl(data.url);
        setPlayingTopic(recording.meeting?.topic || "Zoom Meeting Recording");
      }
    } catch (err) {
      console.error("Failed to fetch pre-signed URL:", err);
    } finally {
      setIsLoadingUrl(null);
    }
  };

  const handleDownloadRecording = async (recording: RecordingRecord) => {
    try {
      const res = await fetch(`/api/integrations/zoom/recordings/${recording.id}/url`);
      if (res.ok) {
        const data = await res.json();
        const a = document.createElement("a");
        a.href = data.url;
        a.download = `zoom_recording_${recording.id}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to fetch download URL:", err);
    }
  };

  const handleDeleteRecording = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/zoom/recordings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeletingId(null);
        await fetchRecordings();
      }
    } catch (err) {
      console.error("Failed to delete recording:", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F0F0F] border border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-400" /> Meeting Cloud Recordings (S3 Vault)
          </h3>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Auto-archived meeting recordings stored in encrypted S3 bucket with tenant isolation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-[#0F0F0F] rounded-xl border border-white/10">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
          <span className="text-xs font-medium text-white">Loading S3 recordings...</span>
        </div>
      ) : recordings.length === 0 ? (
        <div className="p-8 text-center bg-[#0F0F0F] rounded-xl border border-white/10">
          <Video className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No Cloud Recordings Yet</h4>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1">
            Completed Zoom meetings will automatically pull and archive recordings here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((r) => {
            const isProcessing = r.status === "processing";
            const isFailed = r.status === "failed";
            const isReady = r.status === "ready";

            return (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-[#0D0D0D] border border-white/10 hover:border-white/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{r.meeting?.topic || "Zoom Meeting Recording"}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                        isProcessing
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : isFailed
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {isProcessing && <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-400" />}
                      {r.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A3A3A3]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#F21717]" />
                      {new Date(r.recordedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {Math.floor(r.durationSeconds / 60)} mins
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                      {formatBytes(r.fileSizeBytes)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <span className="text-xs text-amber-400 font-medium animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing S3 Upload...
                    </span>
                  )}

                  {isReady && (
                    <>
                      <button
                        onClick={() => handlePlayRecording(r)}
                        disabled={isLoadingUrl === r.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
                      >
                        {isLoadingUrl === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />} Play
                      </button>
                      <button
                        onClick={() => handleDownloadRecording(r)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
                        title="Download MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setIsDeletingId(r.id)}
                    className="p-2 text-[#737373] hover:text-red-400 transition-colors"
                    title="Delete recording"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Playback Modal */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 px-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" /> {playingTopic}
              </h3>
              <button onClick={() => setPlayingVideoUrl(null)} className="text-[#A3A3A3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
              <video
                src={playingVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-xl p-5 text-center space-y-4">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Delete Recording?</h4>
            <p className="text-xs text-[#A3A3A3]">
              This will permanently delete the recording file from S3 storage. This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRecording(isDeletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
