import { Code2, BriefcaseBusiness, Mail } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold">
              Mock<span className="text-cyan-400">Mate</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              An AI-powered and peer-to-peer mock interview platform designed to
              help you prepare with confidence.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:text-white"
              >
                <Code2 className="h-5 w-5" />{" "}
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:text-white"
              >
                <BriefcaseBusiness className="h-5 w-5" />
              </a>

              <a
                href="mailto:hello@mockmate.dev"
                aria-label="Email"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <a href="#features" className="block hover:text-white">
                Features
              </a>

              <a href="#how-it-works" className="block hover:text-white">
                How It Works
              </a>

              <a href="#pricing" className="block hover:text-white">
                Pricing
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <Link to="/login" className="block hover:text-white">
                Sign In
              </Link>

              <Link to="/register" className="block hover:text-white">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} MockMate. All rights reserved.</p>
          <p>Built for better interviews.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
