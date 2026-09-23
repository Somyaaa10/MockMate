import { Code2, BriefcaseBusiness, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)] bg-[#050505]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-[#F5F5F5] hover:text-white transition">
              MockMate
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-[#A1A1AA]">
              An AI-powered and peer-to-peer mock interview platform designed to
              help you prepare with confidence.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111113] p-2.5 text-[#71717A] transition duration-200 hover:border-[rgba(139,92,246,0.35)] hover:bg-[#16161A] hover:text-[#F5F5F5]"
              >
                <Code2 className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111113] p-2.5 text-[#71717A] transition duration-200 hover:border-[rgba(139,92,246,0.35)] hover:bg-[#16161A] hover:text-[#F5F5F5]"
              >
                <BriefcaseBusiness className="h-5 w-5" />
              </a>

              <a
                href="mailto:hello@mockmate.dev"
                aria-label="Email"
                className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111113] p-2.5 text-[#71717A] transition duration-200 hover:border-[rgba(139,92,246,0.35)] hover:bg-[#16161A] hover:text-[#F5F5F5]"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-[#71717A]">
              <a href="#features" className="block transition hover:text-[#F5F5F5]">
                Features
              </a>

              <a href="#how-it-works" className="block transition hover:text-[#F5F5F5]">
                How It Works
              </a>

              <a href="#pricing" className="block transition hover:text-[#F5F5F5]">
                Pricing
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F5]">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-[#71717A]">
              <Link to="/login" className="block transition hover:text-[#F5F5F5]">
                Sign In
              </Link>

              <Link to="/register" className="block transition hover:text-[#F5F5F5]">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6 text-sm text-[#71717A] sm:flex-row">
          <p>© {new Date().getFullYear()} MockMate. All rights reserved.</p>
          <p>Built for better interviews.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
