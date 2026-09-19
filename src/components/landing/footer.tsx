import Link from "next/link";
import { Sparkles } from "lucide-react";

const platformLinks = [
  "Find Opportunities",
  "AI Matching",
  "GX Score",
  "Student Exchange",
  "Scholarships",
];

const companyLinks = ["About Us", "Careers", "Blog", "Press", "Contact"];

const legalLinks = [
  "Terms of Service",
  "Privacy Policy",
  "Cookie Policy",
  "Data Protection",
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-bold text-white">
                Global<span className="text-cyan-400">Xcelerate</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Connecting ambitious students with global opportunities.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {["X", "In", "IG", "YT"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label={icon}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Bottom */}
        <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {year} GlobalXcelerate. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ for global students
          </p>
        </div>
      </div>
    </footer>
  );
}
