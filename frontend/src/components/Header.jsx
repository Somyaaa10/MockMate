import { Link } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-600/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Mock<span className="text-cyan-400">Mate</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            How It Works
          </a>

          <a
            href="#pricing"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Pricing
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-200 md:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-6 py-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-slate-300 hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-slate-300 hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#pricing"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-slate-300 hover:text-white"
            >
              Pricing
            </a>

            <div className="flex gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-center text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
