import Link from "next/link";
import Image from "next/image";

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
        <Image
          src="/logo.png"
          alt="Teacher Assistant logo"
          width={28}
          height={28}
          className="object-contain drop-shadow"
          priority
        />
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
