import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  CheckCircle,
  CheckCheck,
  FileText,
  LogOut,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import ThemeToggle from "../common/ThemeToggle";
import { cx } from "./cx";

function formatTimeAgo(value) {
  if (!value) return "";
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getNotificationIcon(type) {
  switch (type) {
    case "INTERVIEW_COMPLETED":
    case "INTERVIEW_REPORT_READY":
      return <Award className="h-4 w-4 text-[#F97316]" />;
    case "RESUME_ANALYSIS_COMPLETED":
      return <FileText className="h-4 w-4 text-[#ec4899]" />;
    case "SUBSCRIPTION_SUCCESS":
    case "PAYMENT_SUCCESS":
      return <CheckCircle className="h-4 w-4 text-[#10B981]" />;
    case "PEER_INTERVIEW_INVITE":
    case "PEER_INTERVIEW_STARTED":
    case "PEER_INTERVIEW_COMPLETED":
      return <Users className="h-4 w-4 text-[#3B82F6]" />;
    default:
      return <Bell className="h-4 w-4 text-[#F97316]" />;
  }
}

function AppMark() {
  return (
    <span
      className="mm-logo-crown relative grid h-11 w-11 shrink-0 place-items-center rounded-[13px]"
      style={{ backgroundImage: "var(--mm-grad)" }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-[13px] ring-1 ring-inset ring-white/25" />
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] text-white" fill="currentColor">
        <path d="M3 8.2a1 1 0 0 1 1.53-.85l2.72 1.9 3.6-5.3a1.5 1.5 0 0 1 2.5 0l3.6 5.3 2.72-1.9A1 1 0 0 1 21 8.2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.2Z" />
        <rect x="3" y="20" width="18" height="2.2" rx="1.1" opacity="0.75" />
      </svg>
    </span>
  );
}

function DashboardHeader({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const userName = user?.fullName || "Candidate";
  const isPremium = Boolean(user?.isPremium);

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markAsRead(item._id);
    }
    setNotifOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--mm-border)] bg-[var(--mm-bg)]/92 backdrop-blur-xl">
      <div
        className="mm-header-gradient absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[90px] w-full max-w-[1340px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: mark + title + greeting */}
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <AppMark />
          <div className="min-w-0">
            <h1 className="font-display truncate text-[19px] font-bold leading-tight tracking-tight text-[var(--mm-text)] sm:text-[22px]">
              Dashboard
            </h1>
            <p className="truncate text-[12.5px] leading-tight text-[var(--mm-text-2)] sm:text-[13px]">
              Welcome back, {userName}
            </p>
          </div>
          <span
            className={cx(
              "mm-badge ml-1 hidden shrink-0 sm:inline-flex",
              isPremium && "!border-transparent text-white"
            )}
            style={isPremium ? { backgroundImage: "var(--mm-grad)" } : undefined}
          >
            {isPremium ? "Pro" : "Free"}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Real-time Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="mm-icon-btn relative"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              aria-expanded={notifOpen}
              aria-haspopup="true"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="mm-notif-dot" aria-hidden="true">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-[-10px] sm:right-0 top-[calc(100%+10px)] z-50 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-card)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-[var(--mm-border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-[var(--mm-text)]">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[var(--mm-purple)]/20 px-2 py-0.5 text-[10.5px] font-bold text-[var(--mm-purple)]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-[var(--mm-purple)] hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List / Loading / Empty */}
                {loading && notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[12.5px] text-[var(--mm-text-3)]">
                    Loading notifications...
                  </p>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="mx-auto mb-2 h-7 w-7 text-[var(--mm-text-3)] opacity-40" />
                    <p className="text-[12.5px] font-medium text-[var(--mm-text-2)]">No notifications yet</p>
                    <p className="mt-1 text-[11px] text-[var(--mm-text-3)]">You'll see activity updates here</p>
                  </div>
                ) : (
                  <ul className="max-h-[340px] divide-y divide-[var(--mm-border)] overflow-y-auto">
                    {notifications.map((item) => (
                      <li
                        key={item._id}
                        className={cx(
                          "group relative flex items-start justify-between gap-2 transition-colors hover:bg-[var(--overlay-wash)]",
                          !item.read ? "bg-[var(--mm-purple)]/5" : ""
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className="flex flex-1 items-start gap-3 p-3.5 text-left min-w-0"
                        >
                          <span
                            className="mm-icon-tile mt-0.5 h-8 w-8 shrink-0 rounded-xl"
                            style={{
                              backgroundColor: "var(--mm-card-2)",
                              borderColor: "var(--mm-border)",
                            }}
                            aria-hidden="true"
                          >
                            {getNotificationIcon(item.type)}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span
                                className={cx(
                                  "block truncate text-[12.5px]",
                                  !item.read ? "font-bold text-[var(--mm-text)]" : "font-semibold text-[var(--mm-text-2)]"
                                )}
                              >
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--mm-purple)]" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--mm-text-2)] line-clamp-2">
                              {item.message}
                            </span>
                            <span className="mt-1 block text-[10.5px] text-[var(--mm-text-3)]">
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item._id);
                          }}
                          className="mr-3 mt-3.5 rounded-md p-1 text-[var(--mm-text-3)] opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 transition-all"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="mm-icon-btn"
            aria-label="Settings and profile"
          >
            <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          <ThemeToggle />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mm-icon-btn hover:!border-[rgba(239,68,68,0.45)] hover:!text-[#F87171]"
            aria-label="Log out"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
