import { initials } from "@/lib/formatters";

const SIZES = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

export default function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gold-gradient font-bold text-navy shadow-soft ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
