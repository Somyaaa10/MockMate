import { Code2, BriefcaseBusiness, Mail, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-main)]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-[70px]">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-xl font-bold tracking-tight text-[var(--text-primary)] transition hover:text-[var(--text-accent)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EC4899] text-white shadow-sm">
                <MessagesSquare className="h-4.5 w-4.5" />
              </span>
              MockMate
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              An AI-powered and peer-to-peer mock interview platform designed to
              help you prepare with confidence.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-2.5 text-[var(--text-muted)] transition duration-200 hover:border-[rgba(249,115,22,0.35)] hover:bg-[var(--card-elevated-2)] hover:text-[var(--text-primary)]"
              >
                <Code2 className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-2.5 text-[var(--text-muted)] transition duration-200 hover:border-[rgba(249,115,22,0.35)] hover:bg-[var(--card-elevated-2)] hover:text-[var(--text-primary)]"
              >
                <BriefcaseBusiness className="h-5 w-5" />
              </a>

              <a
                href="mailto:hello@mockmate.dev"
                aria-label="Email"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg-3)] p-2.5 text-[var(--text-muted)] transition duration-200 hover:border-[rgba(236,72,153,0.35)] hover:bg-[var(--card-elevated-2)] hover:text-[var(--text-primary)]"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
              <a href="#features" className="block transition hover:text-[var(--text-primary)]">
                Features
              </a>

              <a href="#how-it-works" className="block transition hover:text-[var(--text-primary)]">
                How It Works
              </a>

              <a href="#pricing" className="block transition hover:text-[var(--text-primary)]">
                Pricing
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
              <Link to="/login" className="block transition hover:text-[var(--text-primary)]">
                Sign In
              </Link>

              <Link to="/register" className="block transition hover:text-[var(--text-primary)]">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--text-muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} MockMate. All rights reserved.</p>
          <p>Built for better interviews.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
