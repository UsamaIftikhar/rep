"use client";

import React from "react";
import { Plus, Link2, Trash2, ExternalLink, Loader2, Layout, X, CheckCircle2 } from "lucide-react";
import { MiroBoard } from "./MiroBoard";

interface MiroBoardRecord {
  id: string;
  miroBoardId: string;
  title: string;
  description?: string | null;
  contextType: string;
  contextId?: string | null;
  createdBy: string;
  createdAt: string;
}

export function MiroBoardManager() {
  const [boards, setBoards] = React.useState<MiroBoardRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBoardId, setSelectedBoardId] = React.useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isLinkOpen, setIsLinkOpen] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  // Form states
  const [createTitle, setCreateTitle] = React.useState("");
  const [createDescription, setCreateDescription] = React.useState("");
  const [createContextType, setCreateContextType] = React.useState("general");
  const [linkUrlOrId, setLinkUrlOrId] = React.useState("");
  const [linkTitle, setLinkTitle] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchBoards = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/miro/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
        if (data.boards?.length > 0 && !selectedBoardId) {
          setSelectedBoardId(data.boards[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load Miro boards:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedBoardId]);

  React.useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integrations/miro/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle,
          description: createDescription,
          contextType: createContextType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create Miro board");
      }

      setCreateTitle("");
      setCreateDescription("");
      setIsCreateOpen(false);
      await fetchBoards();
    } catch (err: any) {
      setErrorMessage(err.message || "Error creating board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrlOrId.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integrations/miro/boards/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrId: linkUrlOrId,
          title: linkTitle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to link Miro board");
      }

      setLinkUrlOrId("");
      setLinkTitle("");
      setIsLinkOpen(false);
      await fetchBoards();
    } catch (err: any) {
      setErrorMessage(err.message || "Error linking board");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/integrations/miro/boards/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedBoardId === id) {
          setSelectedBoardId(null);
        }
        setIsDeletingId(null);
        await fetchBoards();
      }
    } catch (err) {
      console.error("Failed to delete board:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0F0F0F] border border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#F21717]" /> Miro Collaborative Workspace Boards
          </h3>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Embed interactive whiteboards into classrooms, strategy sessions, and recruiting meetings.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsLinkOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-400" /> Link Board
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F21717] hover:bg-[#D01010] text-xs font-semibold text-white transition-colors shadow-lg shadow-red-900/20"
          >
            <Plus className="w-4 h-4" /> Create Board
          </button>
        </div>
      </div>

      {/* Boards selector & View layout */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-[#0F0F0F] rounded-xl border border-white/10">
          <Loader2 className="w-6 h-6 animate-spin text-[#F21717] mr-2" />
          <span className="text-xs font-medium text-white">Loading Miro boards...</span>
        </div>
      ) : boards.length === 0 ? (
        <div className="p-8 text-center bg-[#0F0F0F] rounded-xl border border-white/10">
          <Layout className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No Miro Boards Connected</h4>
          <p className="text-xs text-[#A3A3A3] max-w-sm mx-auto mt-1 mb-4">
            Create a new whiteboard or link an existing Miro board ID to get started.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F21717] hover:bg-[#D01010] text-xs font-semibold text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Boards List Sidebar */}
          <div className="lg:col-span-1 space-y-2.5">
            <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider px-1">Connected Boards</p>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {boards.map((b) => {
                const isSelected = selectedBoardId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBoardId(b.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#181818] border-[#F21717] text-white"
                        : "bg-[#0D0D0D] border-white/5 hover:border-white/20 text-[#A3A3A3] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold truncate pr-2">{b.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeletingId(b.id);
                        }}
                        className="text-[#737373] hover:text-red-400 p-1"
                        title="Remove board"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 font-mono text-[#A3A3A3] uppercase">
                        {b.contextType}
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Board Viewer */}
          <div className="lg:col-span-3">
            {selectedBoardId ? (
              <MiroBoard boardId={selectedBoardId} height="620px" />
            ) : (
              <div className="h-[620px] rounded-xl bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-xs text-[#737373]">
                Select a board from the list to view
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F21717]" /> Create New Miro Board
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#A3A3A3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Board Title *</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Offense Playbook Whiteboard"
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-[#F21717]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Optional notes or instructions..."
                  rows={2}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-[#F21717]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Context Tag</label>
                <select
                  value={createContextType}
                  onChange={(e) => setCreateContextType(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#F21717]"
                >
                  <option value="general">General</option>
                  <option value="classroom">Classroom / Academy</option>
                  <option value="recruit_session">Recruit Session</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#F21717] hover:bg-[#D01010] text-xs font-semibold text-white rounded-lg inline-flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Existing Modal */}
      {isLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-400" /> Link Existing Miro Board
              </h3>
              <button onClick={() => setIsLinkOpen(false)} className="text-[#A3A3A3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLinkBoard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Miro Board URL or ID *</label>
                <input
                  type="text"
                  required
                  value={linkUrlOrId}
                  onChange={(e) => setLinkUrlOrId(e.target.value)}
                  placeholder="https://miro.com/app/board/uXjVO...=/"
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-[#F21717]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Display Title (Optional)</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Custom name for this board"
                  className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-xs text-white placeholder:text-[#525252] focus:outline-none focus:border-[#F21717]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkOpen(false)}
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
                  Link Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-xl p-5 text-center space-y-4">
            <Trash2 className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Deactivate Miro Board?</h4>
            <p className="text-xs text-[#A3A3A3]">
              This will un-link the board from your portal. The board in Miro itself will not be deleted.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#A3A3A3] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBoard(isDeletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-lg"
              >
                Remove Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
