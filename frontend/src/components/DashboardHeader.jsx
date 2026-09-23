import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Crown,
  LogOut,
  Settings,
  User,
  X,
  LayoutDashboard,
  Bot,
  Users,
  Award,
  BarChart3,
  FileText,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardHeader({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const userName = user?.fullName || "Candidate";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const isPremium = Boolean(user?.isPremium);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const primaryNav = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "interview", label: "AI Interview", icon: Bot },
    { id: "peer", label: "Peer Practice", icon: Users },
    { id: "reports", label: "Reports", icon: Award },
  ];

  const secondaryNav = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "resume", label: "Resume", icon: FileText },
    { id: "plan", label: "Plan", icon: Crown },
    { id: "profile", label: "Profile & Settings", icon: User },
  ];

  const handleNavClick = (tabId) => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (tabId === "interview") {
      navigate("/interview/new");
      return;
    }
    setActiveTab(tabId);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[rgba(255,255,255,0.07)] bg-[#050505]/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-white shadow-sm shadow-purple-900/30">
              <Crown className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#F5F5F5]">
              MockMate
            </span>
          </Link>

          {/* Primary Nav — Desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-[rgba(139,92,246,0.12)] text-[#C4B5FD]"
                      : "text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F5]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#101010] px-2 py-1.5 transition hover:border-[rgba(255,255,255,0.12)] hover:bg-[#151515]"
              aria-label="User menu"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] text-[10px] font-bold text-white">
                {userInitials || "U"}
              </div>
              <span className="hidden sm:block text-[12px] font-medium text-[#F5F5F5] max-w-[100px] truncate">
                {userName}
              </span>
              <ChevronDown
                className={`hidden sm:block h-3 w-3 text-[#71717A] transition-transform duration-150 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#0C0C0C] p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl z-50 fade-in"
                role="menu"
                aria-label="User menu options"
              >
                {/* User info */}
                <div className="px-3 py-2.5 border-b border-[rgba(255,255,255,0.07)] mb-1">
                  <p className="text-[12px] font-semibold text-[#F5F5F5] truncate">{userName}</p>
                  <p className="text-[11px] text-[#71717A] truncate mt-0.5">{user?.email}</p>
                  <span
                    className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isPremium
                        ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        : "bg-[#1A1A1A] text-[#71717A] border border-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    <Crown className="h-2.5 w-2.5" />
                    {isPremium ? "Pro Plan" : "Free Plan"}
                  </span>
                </div>

                {/* Secondary nav items */}
                <div className="space-y-0.5">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleNavClick(item.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F5] transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 text-[#71717A]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[rgba(255,255,255,0.07)] mt-1 pt-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] font-medium text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="relative md:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#101010] text-[#A1A1AA] transition hover:text-[#F5F5F5]"
              aria-label="Open menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Mobile Dropdown */}
            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[#0C0C0C] p-2 shadow-2xl shadow-black/40 backdrop-blur-xl z-50 fade-in">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-1">
                  Navigation
                </p>
                {[...primaryNav, ...secondaryNav].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-purple-500/10 text-purple-300"
                          : "text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#F5F5F5]"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-[rgba(255,255,255,0.07)] mt-2 pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
