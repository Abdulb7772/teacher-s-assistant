import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "../ui/Logo";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/course-outline", label: "Course Outline" },
  { to: "/students", label: "Student Marks" },
  { to: "/login", label: "Admin Login" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy-deep/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              The complete course management portal for teachers — plan your course outline, track student
              performance and export results, all in one premium workspace.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold/70">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="text-sm text-white/55 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold/70">Contact</h4>
            <ul className="space-y-2.5 text-sm text-white/55">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-gold/60" /> teacher.assistant@portal.edu
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-gold/60" /> +92 300 1234567
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-gold/60" /> University Campus
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/35">© {new Date().getFullYear()} Teacher Assistant. All rights reserved.</p>
          <p className="text-xs text-white/35">
            Built with <span className="text-gold/70">Next.js + Express + MongoDB</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
