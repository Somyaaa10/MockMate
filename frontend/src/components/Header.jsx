import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#050505]/85 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)] shadow-sm text-[#8B5CF6] transition duration-200 group-hover:border-[rgba(139,92,246,0.35)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Crown className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F5F5F5] transition group-hover:text-white">
            MockMate
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="#features"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#A1A1AA] transition duration-200 hover:bg-[#111113] hover:text-[#F5F5F5]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#A1A1AA] transition duration-200 hover:bg-[#111113] hover:text-[#F5F5F5]"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#A1A1AA] transition duration-200 hover:bg-[#111113] hover:text-[#F5F5F5]"
          >
            Pricing
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-md shadow-purple-900/20 btn-saas-primary hover:bg-[#7C3AED]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] transition duration-200 hover:bg-[#111113] hover:text-[#F5F5F5]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-md shadow-purple-900/20 btn-saas-primary hover:bg-[#7C3AED]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
