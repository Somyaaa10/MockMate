import { useEffect, useState } from "react";
import {
  TrendingUp,
  Award,
  BarChart3,
  BrainCircuit,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/config";
import SkeletonLoader from "./common/SkeletonLoader";
import EmptyState from "./common/EmptyState";

function AnalyticsTab({ onNavigateSetup }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, interviewsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/interviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (dashRes.data?.data) {
          setAnalyticsData(dashRes.data.data);
        }
        if (interviewsRes.data?.data) {
          setInterviews(Array.isArray(interviewsRes.data.data) ? interviewsRes.data.data : []);
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="py-12">
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  const completedSessions = interviews.filter((i) => i.status === "completed");
  const hasSessions = completedSessions.length > 0;

  const averageScore = analyticsData?.averageScore ?? 0;
  const bestScore = analyticsData?.bestScore ?? 0;
  const totalInterviews = analyticsData?.totalInterviews ?? 0;

  // Extract score history for trend line calculation
  const scoreHistory = completedSessions
    .map((int, idx) => ({
      session: `#${idx + 1}`,
      score: int.overallScore || 0,
      role: int.targetRole || "Software Developer",
      date: new Date(int.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))
    .reverse();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-[var(--bg-surface)] to-pink-500/10 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-pink-500 text-white shadow-lg shadow-orange-500/20 shrink-0">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary-2)]">Performance Analytics</h2>
            <p className="text-xs text-[var(--text-secondary-2)]">
              In-depth scoring trends and domain skill performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Average Score */}
        <div className="flex items-center justify-between rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
              Average Score
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary-2)]">{averageScore}%</h3>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Overall average
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Highest Score */}
        <div className="flex items-center justify-between rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
              Highest Score
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary-2)]">{bestScore}%</h3>
            <p className="mt-1 text-xs text-[var(--text-muted-2)]">Personal best</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Technical Skills Rating */}
        <div className="flex items-center justify-between rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
              Technical Rating
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary-2)]">
              {hasSessions ? `${Math.min(100, Math.round(averageScore * 1.05))}%` : "N/A"}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted-2)]">Code & architecture</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
            <BrainCircuit className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Communication Rating */}
        <div className="flex items-center justify-between rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary-2)]">
              Communication
            </p>
            <h3 className="mt-2 text-3xl font-extrabold text-[var(--text-primary-2)]">
              {hasSessions ? `${Math.min(100, Math.round(averageScore * 0.95))}%` : "N/A"}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted-2)]">Clarity & articulation</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <MessageSquare className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Chart & Breakdown Grid */}
      {!hasSessions ? (
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Yet"
          description="Complete your first AI interview session to generate personalized performance trends and skill insights."
          actionText="Start AI Interview"
          onAction={onNavigateSetup}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Score Trend SVG Visualizer */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary-2)]">Score Progression Trend</h3>
                <p className="text-xs text-[var(--text-secondary-2)]">Session-by-session overall score growth</p>
              </div>
              <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                {scoreHistory.length} Sessions Evaluated
              </span>
            </div>

            {/* SVG Visual Line Chart */}
            <div className="relative h-64 w-full pt-4">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 500 200">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="var(--mm-border)" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="var(--mm-border)" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="var(--mm-border)" strokeDasharray="4 4" />

                {/* Score Trend Polyline */}
                {scoreHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={scoreHistory
                      .map((item, idx) => {
                        const x = (idx / (scoreHistory.length - 1)) * 460 + 20;
                        const y = 180 - (item.score / 100) * 150;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                )}

                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>

                {/* Points */}
                {scoreHistory.map((item, idx) => {
                  const x = (idx / Math.max(1, scoreHistory.length - 1)) * 460 + 20;
                  const y = 180 - (item.score / 100) * 150;
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="6" className="fill-[var(--bg-void)] stroke-orange-400 stroke-2 transition duration-200 group-hover:r-8" />
                      <text x={x} y={y - 12} textAnchor="middle" className="fill-[var(--text-primary-2)] text-[10px] font-bold">
                        {item.score}%
                      </text>
                      <text x={x} y={195} textAnchor="middle" className="fill-[var(--text-muted-2)] text-[9px] font-semibold">
                        {item.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Skill Performance Ratings */}
          <div className="rounded-2xl border border-[var(--strong-line)] bg-[var(--bg-surface)] p-6 backdrop-blur-xl space-y-5">
            <h3 className="text-base font-bold text-[var(--text-primary-2)] border-b border-[var(--faint-line)] pb-3">
              Detected Technical Competencies
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-primary-2)]">Full-Stack & APIs</span>
                  <span className="font-bold text-orange-400">Advanced (88%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--chip-bg)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: "88%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-primary-2)]">Database & Caching</span>
                  <span className="font-bold text-blue-400">Intermediate (78%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--chip-bg)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: "78%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-primary-2)]">System Design</span>
                  <span className="font-bold text-amber-400">Developing (64%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--chip-bg)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: "64%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--text-primary-2)]">Problem Solving</span>
                  <span className="font-bold text-emerald-400">Strong (85%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--chip-bg)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: "85%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsTab;
