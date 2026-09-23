import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Crown,
  ArrowLeft,
  Users,
  PlusCircle,
  LogIn,
  Zap,
  Sliders,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import PeerTab from "../components/PeerTab";

function PeerInterviewSetup() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Tab Choice
  const [activeMode, setActiveMode] = useState("create"); // 'create' | 'join' | 'history'

  // Create Form State
  const [title, setTitle] = useState("Peer Mock Interview");
  const [interviewType, setInterviewType] = useState("technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [creating, setCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);

  // Join Form State
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Error & Status Messages
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle Create Peer Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setCreatedRoom(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/peer-interviews`,
        {
          title: title.trim(),
          interviewType,
          difficulty,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data?.data;
      if (data?.roomCode) {
        setCreatedRoom(data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to create peer room. Please try again.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // Handle Join Peer Room
  const handleJoinRoom = async (e) => {
    e.preventDefault();

    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a room code.");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/peer-interviews/join`,
        { roomCode: cleanCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data?.data;
      if (data?.roomCode) {
        navigate(`/peer/${data.roomCode}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to join room. Please check the code.";
      setError(msg);
    } finally {
      setJoining(false);
    }
  };

  // Copy room code to clipboard
  const handleCopyCode = () => {
    if (!createdRoom?.roomCode) return;
    navigator.clipboard.writeText(createdRoom.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const interviewTypeOptions = [
    { id: "technical", label: "Technical", desc: "System design & algorithms" },
    { id: "hr", label: "HR", desc: "Behavioral & background" },
    { id: "behavioral", label: "Behavioral", desc: "Past situations & teamwork" },
    { id: "mixed", label: "Mixed", desc: "Comprehensive technical + HR" },
  ];

  const difficultyOptions = [
    { id: "easy", label: "Easy", color: "text-emerald-400 border-emerald-500/30" },
    { id: "medium", label: "Medium", color: "text-amber-400 border-amber-500/30" },
    { id: "hard", label: "Hard", color: "text-rose-400 border-rose-500/30" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#000000]">
      {/* Header Bar */}
      <header className="border-b border-[#262626] bg-[#000000] sticky top-0 z-30">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#111111] shadow-sm">
              <Crown className="h-5 w-5 text-[#FFFFFF]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">
              MockMate
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-sm font-semibold text-[#A1A1A1] transition hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#111111] px-4 py-1.5 text-xs font-semibold text-[#A1A1A1] backdrop-blur-xl">
            <Users className="h-3.5 w-3.5 text-[#FFFFFF]" />
            Peer-to-Peer 1:1 Interview
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-[#FFFFFF] sm:text-4xl">
            Peer Interview Practice Room
          </h1>
          <p className="mt-2 text-sm text-[#A1A1A1]">
            Create a live 1:1 video session with WebRTC or join an existing room with a room code.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-xl border border-[#262626] bg-[#0A0A0A] p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveMode("create");
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition ${
                activeMode === "create"
                  ? "bg-[#FFFFFF] text-[#000000] shadow-sm"
                  : "text-[#A1A1A1] hover:text-[#FFFFFF]"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Create Room
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode("join");
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition ${
                activeMode === "join"
                  ? "bg-[#FFFFFF] text-[#000000] shadow-sm"
                  : "text-[#A1A1A1] hover:text-[#FFFFFF]"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Join Room
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode("history");
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition ${
                activeMode === "history"
                  ? "bg-[#FFFFFF] text-[#000000] shadow-sm"
                  : "text-[#A1A1A1] hover:text-[#FFFFFF]"
              }`}
            >
              <FileText className="h-4 w-4" />
              My History & Recordings
            </button>
          </div>
        </div>

        {/* SECTION A — CREATE ROOM */}
        {activeMode === "create" && (
          <div className="mt-10 mx-auto max-w-2xl">
            {createdRoom ? (
              <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/10 p-8 text-center backdrop-blur-xl shadow-2xl space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] text-[#22C55E] border border-[#22C55E]/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#FFFFFF]">Peer Room Created!</h3>
                  <p className="mt-1 text-sm text-[#A1A1A1]">
                    Share this room code with your peer so they can join your session.
                  </p>
                </div>

                {/* Room Code Display Box */}
                <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#737373] font-semibold">
                    Room Code
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold tracking-widest text-[#FFFFFF] font-mono">
                      {createdRoom.roomCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="rounded-lg border border-[#262626] bg-[#111111] p-2 text-[#FFFFFF] hover:bg-[#1A1A1A]"
                      title="Copy Room Code"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/peer/${createdRoom.roomCode}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFFFFF] px-8 py-3.5 text-sm font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5]"
                  >
                    Enter Interview Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatedRoom(null)}
                    className="rounded-xl border border-[#262626] bg-[#0A0A0A] px-6 py-3.5 text-sm font-semibold text-[#A1A1A1] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                  >
                    Create Another Room
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateRoom} className="space-y-6">
                {/* Title */}
                <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-2">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer Mock Interview"
                    required
                    className="w-full rounded-xl border border-[#262626] bg-[#0A0A0A] px-4 py-3 text-sm text-[#FFFFFF] focus:border-[#FFFFFF] focus:outline-none"
                  />
                </div>

                {/* Interview Type */}
                <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3">
                    <Zap className="h-4 w-4 text-[#A1A1A1]" />
                    Interview Type
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {interviewTypeOptions.map((opt) => {
                      const isSelected = interviewType === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setInterviewType(opt.id)}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            isSelected
                              ? "border-[#FFFFFF] bg-[#1A1A1A]"
                              : "border-[#262626] bg-[#0A0A0A] hover:border-white/20"
                          }`}
                        >
                          <p className="text-sm font-bold text-[#FFFFFF]">{opt.label}</p>
                          <p className="mt-1 text-xs text-[#A1A1A1]">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="rounded-2xl border border-[#262626] bg-[#111111] p-6 backdrop-blur-xl">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] mb-3">
                    <Sliders className="h-4 w-4 text-[#A1A1A1]" />
                    Difficulty
                  </label>

                  <div className="flex gap-3">
                    {difficultyOptions.map((opt) => {
                      const isSelected = difficulty === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDifficulty(opt.id)}
                          className={`flex-1 rounded-xl border py-3 text-xs font-bold transition ${
                            isSelected
                              ? "border-[#FFFFFF] bg-[#FFFFFF] text-[#000000]"
                              : "border-[#262626] bg-[#0A0A0A] text-[#A1A1A1] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs font-semibold text-[#EF4444]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creating}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FFFFFF] py-4 text-base font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5] disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Peer Room...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5" />
                      <span>Create Room</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* SECTION B — JOIN ROOM */}
        {activeMode === "join" && (
          <div className="mt-10 mx-auto max-w-lg">
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div className="rounded-2xl border border-[#262626] bg-[#111111] p-8 backdrop-blur-xl space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  Enter Room Code
                </label>
                <p className="text-xs text-[#A1A1A1]">
                  Enter the 12-character code shared by your peer host (e.g. MOCK-A1B2C3D4)
                </p>

                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="MOCK-XXXXXX"
                  required
                  className="w-full text-center tracking-widest font-mono uppercase rounded-xl border border-[#262626] bg-[#0A0A0A] py-4 text-xl font-bold text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#FFFFFF] focus:outline-none"
                />

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs font-semibold text-[#EF4444]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={joining || !joinCode.trim()}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FFFFFF] py-4 text-base font-bold text-[#000000] shadow-sm transition hover:bg-[#F5F5F5] disabled:opacity-50"
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Joining Room...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Join Peer Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION C — HISTORY & RECORDINGS */}
        {activeMode === "history" && (
          <div className="mt-10">
            <PeerTab />
          </div>
        )}
      </main>
    </div>
  );
}

export default PeerInterviewSetup;
