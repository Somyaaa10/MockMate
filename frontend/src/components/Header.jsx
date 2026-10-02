import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MessagesSquare, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./common/ThemeToggle";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
];

function Header() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Track scroll to switch the navbar into its "scrolled" surface state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav item for the section currently in view.
  const sectionElsRef = useRef([]);
  useEffect(() => {
    sectionElsRef.current = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1))
    );
    const sections = sectionElsRef.current.filter(Boolean);
    if (sections.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      const onScroll = () => {
        const probe = 132;
        let current = null;
        for (const el of sectionElsRef.current) {
          if (el && el.getBoundingClientRect().top <= probe) current = el.id;
        }
        setActiveSection(current);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const bandTopPx = () => window.innerHeight * 0.1;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        let bestTop = Infinity;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.boundingClientRect.top < bestTop) {
            best = entry.target.id;
            bestTop = entry.boundingClientRect.top;
          }
        }
        if (best) {
          setActiveSection(best);
        } else if (
          sections[0] &&
          sections[0].getBoundingClientRect().top > bandTopPx()
        ) {
          setActiveSection(null);
        }
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const hasSurface = scrolled || menuOpen;

  return (
    <header
      className={`site-navbar w-full transition-colors duration-200 ${
        hasSurface ? "site-navbar-scrolled" : ""
      }`}
    >
      <div className="navbar-inner mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] text-white shadow-sm transition duration-200 group-hover:scale-105">
            <MessagesSquare className="h-4.5 w-4.5" />
          </div>
          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--primary)] sm:text-xl">
            MockMate
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? "true" : undefined}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "text-[var(--primary)] bg-[var(--primary-soft)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-5 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-5 py-2 text-sm font-semibold text-white shadow-md transition duration-200 hover:opacity-95 hover:shadow-lg"
              >
                Get Started →
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
          >
            {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="landing-mobile-nav"
          className="fade-in border-t border-[var(--border)] bg-[var(--surface)] px-4 pb-5 pt-2 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={isActive ? "true" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="mt-2 flex flex-col gap-2.5 border-t border-[var(--border)] pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:opacity-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#D946EF] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:opacity-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;