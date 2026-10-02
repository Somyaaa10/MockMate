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
  Users,
  X,
  MessagesSquare,
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
      return <Award className="h-4 w-4 text-[var(--primary)]" />;
    case "RESUME_ANALYSIS_COMPLETED":
      return <FileText className="h-4 w-4 text-[var(--primary-hover)]" />;
    case "SUBSCRIPTION_SUCCESS":
    case "PAYMENT_SUCCESS":
      return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
    case "PEER_INTERVIEW_INVITE":
    case "PEER_INTERVIEW_STARTED":
    case "PEER_INTERVIEW_COMPLETED":
      return <Users className="h-4 w-4 text-[var(--primary)]" />;
    default:
      return <Bell className="h-4 w-4 text-[var(--primary)]" />;
  }
}

function AppMark() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-xs">
      <MessagesSquare className="h-5 w-5" />
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
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1340px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: mark + title + greeting */}
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <AppMark />
          <div className="min-w-0">
            <h1 className="font-display truncate text-lg font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-xl">
              Dashboard
            </h1>
            <p className="truncate text-xs leading-tight text-[var(--text-secondary)] sm:text-sm">
              Welcome back, {userName}
            </p>
          </div>
          <span
            className={cx(
              "ml-1.5 hidden shrink-0 sm:inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border border-[var(--border)]",
              isPremium
                ? "bg-[var(--primary)] text-white border-transparent"
                : "bg-[var(--background-soft)] text-[var(--text-secondary)]"
            )}
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
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] relative"
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
              aria-expanded={notifOpen}
              aria-haspopup="true"
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-[-10px] sm:right-0 top-[calc(100%+8px)] z-50 w-[340px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--panel-shadow)]"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[var(--text-primary)]">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--primary)]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List / Loading / Empty */}
                {loading && notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                    Loading notifications...
                  </p>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="mx-auto mb-2 h-7 w-7 text-[var(--text-muted)] opacity-50" />
                    <p className="text-xs font-medium text-[var(--text-secondary)]">No notifications yet</p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">You'll see activity updates here</p>
                  </div>
                ) : (
                  <ul className="max-h-[340px] divide-y divide-[var(--border)] overflow-y-auto">
                    {notifications.map((item) => (
                      <li
                        key={item._id}
                        className={cx(
                          "group relative flex items-start justify-between gap-2 transition-colors hover:bg-[var(--surface-hover)]",
                          !item.read ? "bg-[var(--primary-subtle)]" : ""
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          className="flex flex-1 items-start gap-3 p-3.5 text-left min-w-0"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] border border-[var(--border)]" aria-hidden="true">
                            {getNotificationIcon(item.type)}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span
                                className={cx(
                                  "block truncate text-xs",
                                  !item.read ? "font-bold text-[var(--text-primary)]" : "font-semibold text-[var(--text-secondary)]"
                                )}
                              >
                                {item.title}
                              </span>
                              {!item.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-[var(--text-secondary)] line-clamp-2">
                              {item.message}
                            </span>
                            <span className="mt-1 block text-[10px] text-[var(--text-muted)]">
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
                          className="mr-3 mt-3.5 rounded-md p-1 text-[var(--text-muted)] opacity-0 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] group-hover:opacity-100 transition-all"
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
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Settings and profile"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </button>

          <ThemeToggle />

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/40 hover:text-[var(--danger)]"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
