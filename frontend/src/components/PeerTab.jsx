import { useEffect, useState } from "react";
import {
  Users,
  Video,
  ExternalLink,
  Trash2,
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
  waiting: "text-[#F59E0B] bg-[#F59E0B]/08 border-[#F59E0B]/20",
  active: "text-[#22C55E] bg-[#22C55E]/08 border-[#22C55E]/20",
  completed: "text-[#71717A] bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
};

function PeerTab() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [peerInterviews, setPeerInterviews] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [peerRes, recRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/peer-interviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/recordings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPeerInterviews(Array.isArray(peerRes.data?.data) ? peerRes.data.data : []);
        setRecordings(Array.isArray(recRes.data?.data) ? recRes.data.data : []);
      } catch (err) {
        console.error("Failed to fetch peer history:", err);
        setError("Failed to load peer interview history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDeleteRecording = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recording?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_BASE_URL}/recordings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecordings((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete recording.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (roomCode, id) => {
    const url = `${window.location.origin}/peer/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Peer Practice</h1>
          <p className="text-[13px] text-[#A1A1AA] mt-0.5">
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
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
          Your Interview Rooms
        </h2>

        {peerInterviews.length === 0 ? (
          <div className="saas-card rounded-2xl p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#151515] mb-4">
              <Users className="h-5 w-5 text-[#71717A]" />
            </div>
            <p className="text-[14px] font-semibold text-[#F5F5F5]">No interview rooms yet</p>
            <p className="text-[13px] text-[#71717A] mt-1 mb-5">
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
          <div className="saas-card rounded-2xl divide-y divide-[rgba(255,255,255,0.06)]">
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
                      <Video className="h-4 w-4 text-[#8B5CF6]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-[#F5F5F5] truncate">
                          {room.title || "Peer Mock Session"}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}
                        >
                          {capitalize(room.status || "waiting")}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-0.5 flex items-center gap-2">
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

      {/* Recordings */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
            Saved Recordings
          </h2>
          <div className="saas-card rounded-2xl divide-y divide-[rgba(255,255,255,0.06)]">
            {recordings.map((rec) => (
              <div
                key={rec._id}
                className="flex items-center justify-between px-5 py-3.5 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.10)]">
                    <Video className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#F5F5F5] truncate">
                      {rec.title || "Interview Recording"}
                    </p>
                    <p className="text-[11px] text-[#71717A]">
                      {rec.duration || "Recorded session"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary flex h-8 w-8 items-center justify-center rounded-lg"
                    title="Open recording"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteRecording(rec._id)}
                    disabled={deletingId === rec._id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#151515] text-[#71717A] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#EF4444] hover:border-[rgba(239,68,68,0.20)] transition-colors disabled:opacity-50"
                    title="Delete recording"
                  >
                    {deletingId === rec._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PeerTab;
