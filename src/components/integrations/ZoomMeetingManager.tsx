"use client";

import React from "react";
import { Video, Calendar, Clock, Plus, Copy, Check, Trash2, ExternalLink, Loader2, X, Lock } from "lucide-react";

interface MeetingRecord {
  id: string;
  zoomMeetingId: string;
  topic: string;
  startTime: string;
  durationMinutes: number;
  joinUrl: string;
  password?: string | null;
  status: string;
  contextType?: string | null;
  createdBy: string;
}

export function ZoomMeetingManager() {
  const [meetings, setMeetings] = React.useState<MeetingRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  // Schedule Form State
  const [topic, setTopic] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState("60");
  const [password, setPassword] = React.useState("");
  const [contextType, setContextType] = React.useState("general");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchMeetings = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/zoom/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error("Failed to fetch Zoom meetings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !startDate || !startTime) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const fullStartIso = new Date(`${startDate}T${startTime}`).toISOString();

    try {
      const res = await fetch("/api/integrations/zoom/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          startTime: fullStartIso,
          durationMinutes: Number(durationMinutes),
          password: password || undefined,
          contextType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule Zoom meeting");
      }

      setTopic("");
      setStartDate("");
      setStartTime("");
      setPassword("");
      setIsScheduleOpen(false);
      await fetchMeetings();
    } catch (err: any) {
      setErrorMessage(err.message || "Error scheduling meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelMeeting = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/zoom/meetings/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeletingId(null);
        await fetchMeetings();
      }
    } catch (err) {
      console.error("Failed to cancel meeting:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F0F0F] border border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-500" /> Zoom Live Meetings & Sessions
          </h3>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Schedule live video conferences for recruiting calls, film reviews, and classroom discussions.
          </p>
        </div>
        <button
          onClick={() => setIsScheduleOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {/* Meetings Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-[#0F0F0F] rounded-xl border border-white/10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-xs font-medium text-white">Loading Zoom meetings...</span>
        </div>
      ) : meetings.length === 0 ? (
        <div className="p-8 text-center bg-[#0F0F0F] rounded-xl border border-white/10">
          <Video className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No Upcoming Zoom Meetings</h4>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Schedule a live video meeting for your school organization.
          </p>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule First Meeting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => {
            const start = new Date(m.startTime);
            const isCancelled = m.status === "cancelled";
            const isPast = start.getTime() + m.durationMinutes * 60 * 1000 < Date.now();

            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 ${
                  isCancelled
                    ? "bg-[#0A0A0A] border-white/5 opacity-60"
                    : "bg-[#0D0D0D] border-white/10 hover:border-blue-500/40 transition-colors"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 font-mono text-[#A3A3A3] uppercase">
                      {m.contextType || "General"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCancelled
                          ? "bg-red-500/10 text-red-400"
                          : isPast
                          ? "bg-gray-500/10 text-gray-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {isCancelled ? "Cancelled" : isPast ? "Ended" : "Scheduled"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{m.topic}</h4>

                  <div className="space-y-1 text-xs text-[#A3A3A3]">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ({m.durationMinutes} mins)
                    </p>
                    {m.password && (
                      <p className="flex items-center gap-1.5 font-mono text-[11px] text-[#737373]">
                        <Lock className="w-3 h-3 text-amber-400" /> Passcode: {m.password}
                      </p>
                    )}
                  </div>
                </div>

                {!isCancelled && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={m.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" /> Join
                      </a>
                      <button
                        onClick={() => handleCopyLink(m.id, m.joinUrl)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
                        title="Copy Join Link"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => setIsDeletingId(m.id)}
                      className="p-2 text-[#737373] hover:text-red-400 transition-colors"
                      title="Cancel meeting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-500" /> Schedule Zoom Meeting
              </h3>
              <button onClick={() => setIsScheduleOpen(false)} className="text-[#A3A3A3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Meeting Topic *</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Football Recruiting Strategy Call"
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Duration (mins)</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes (1 hr)</option>
                    <option value="90">90 minutes (1.5 hrs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Passcode (Optional)</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. rep12026"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Context Tag</label>
                <select
                  value={contextType}
                  onChange={(e) => setContextType(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="classroom">Classroom / Academy</option>
                  <option value="recruit_session">Recruit Session</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-lg inline-flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-xl p-5 text-center space-y-4">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Cancel Zoom Meeting?</h4>
            <p className="text-xs text-[#A3A3A3]">
              This will cancel the scheduled meeting in Zoom and update your schedule.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Keep Meeting
              </button>
              <button
                onClick={() => handleCancelMeeting(isDeletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg"
              >
                Cancel Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
