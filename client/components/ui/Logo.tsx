import Link from "next/link";

export default function Logo({
  to = "/",
  compact = false,
  className = "",
}: {
  to?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={to} className={`group flex items-center gap-3 ${className}`}>
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gold-gradient shadow-glow transition-transform duration-300 group-hover:scale-105">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Teacher Assistant logo" className="h-7 w-7 object-contain drop-shadow" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight text-white">Teacher Assistant</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70">
            Course Portal
          </span>
        </span>
      )}
    </Link>
  );
}
