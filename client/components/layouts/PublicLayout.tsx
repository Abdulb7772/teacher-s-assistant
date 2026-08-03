import type { ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-navy bg-hero-radial">
      <PublicNavbar />
      <main className="relative z-10">{children}</main>
      <PublicFooter />
    </div>
  );
}
