export const formatDate = (value?: string | Date | null, opts: Intl.DateTimeFormatOptions = {}): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", ...opts });
};

export const formatDateTime = (value?: string | Date | null): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const initials = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const shortMonth = (monthName: string): string => {
  const idx = new Date(`${monthName} 1, 2026`).getMonth();
  return Number.isNaN(idx) ? monthName : new Date(2000, idx, 1).toLocaleString("en-US", { month: "short" });
};
