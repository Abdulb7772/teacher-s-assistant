"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onNavStart = (e: MouseEvent): void => {
      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor?.href || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.pathname !== pathname) setVisible(true);
    };
    document.addEventListener("click", onNavStart, true);
    return () => document.removeEventListener("click", onNavStart, true);
  }, [pathname]);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden">
      <div className="animate-progress-slide h-full w-1/3 bg-gold" />
    </div>
  );
}
