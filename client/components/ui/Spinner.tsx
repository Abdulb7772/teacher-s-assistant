"use client";

function ProgressBar() {
  return (
    <div className="h-1 w-36 overflow-hidden rounded-full bg-white/10">
      <div className="animate-progress-slide h-full w-1/3 rounded-full bg-gold" />
    </div>
  );
}

export default function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/90 shadow-glow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold/70">{label}</p>
      <ProgressBar />
    </div>
  );
}

export function FullScreenLoader({ label = "Preparing your portal" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-navy">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-navy/90 shadow-glow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-11 w-11 object-contain" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold/80">{label}</p>
      <ProgressBar />
    </div>
  );
}
