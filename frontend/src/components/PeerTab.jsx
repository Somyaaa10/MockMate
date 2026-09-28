import { useEffect, useState } from "react";
import {
  Users,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  LogIn,
  Clock,
  Sliders,
  Zap,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_COLORS = {
  waiting: "text-[#D97706] dark:text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25",
  active: "text-[#059669] dark:text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25",
  completed: "text-[var(--text-muted)] bg-[var(--overlay-wash)] border-[var(--border-subtle)]",
};

function PeerTab() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [peerInterviews, setPeerInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const peerRes = await axios.get(`${API_BASE_URL}/peer-interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPeerInterviews(Array.isArray(peerRes.data?.data) ? peerRes.data.data : []);
      } catch (err) {
        console.error("Failed to fetch peer history:", err);
        setError("Failed to load peer interview history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCopyLink = (roomCode, id) => {
    const url = `${window.location.origin}/peer/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Peer Practice</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
            Practice with another candidate in a private interview room.
          </p>
        </div>
        <button
          onClick={() => navigate("/peer/setup")}
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Interview Room
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/08 px-4 py-3 text-[13px] text-[#EF4444]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Room list */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Your Interview Rooms
        </h2>

        {peerInterviews.length === 0 ? (
          <div className="saas-card rounded-2xl p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--card-elevated)] mb-4">
              <Users className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">No interview rooms yet</p>
            <p className="text-[13px] text-[var(--text-muted)] mt-1 mb-5">
              Create a room and share the link with your interview partner.
            </p>
            <button
              onClick={() => navigate("/peer/setup")}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create Interview Room
            </button>
          </div>
        ) : (
          <div className="saas-card rounded-2xl divide-y divide-[var(--border-subtle)]">
            {peerInterviews.map((room) => {
              const statusClass =
                STATUS_COLORS[room.status] || STATUS_COLORS.waiting;
              return (
                <div
                  key={room._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.10)]">
                      <Video className="h-4 w-4 text-[#F97316]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                          {room.title || "Peer Mock Session"}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                        >
                          {capitalize(room.status || "waiting")}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                        <span>{capitalize(room.interviewType)}</span>
                        <span>·</span>
                        <span>{capitalize(room.difficulty)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(room.createdAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopyLink(room.roomCode, room._id)}
                      className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium"
                    >
                      {copiedId === room._id ? (
                        <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedId === room._id ? "Copied!" : "Copy Link"}
                    </button>
                    <button
                      onClick={() => navigate(`/peer/${room.roomCode}`)}
                      className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PeerTab;
