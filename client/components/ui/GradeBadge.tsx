import Badge, { type BadgeVariant } from "./Badge";

const COLORS: Record<string, BadgeVariant> = {
  "A++": "success",
  "A+": "success",
  A: "success",
  "B++": "gold",
  "B+": "gold",
  B: "gold",
  "C+": "gold",
  C: "gold",
  D: "blue",
  E: "danger",
  U: "danger",
};

export default function GradeBadge({ grade, className = "" }: { grade: string; className?: string }) {
  return (
    <Badge variant={COLORS[grade] || "neutral"} className={className}>
      {grade}
    </Badge>
  );
}
