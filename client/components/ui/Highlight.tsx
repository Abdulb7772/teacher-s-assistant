interface HighlightProps {
  text: string;
  children: string;
  className?: string;
}

export default function Highlight({ text, children, className = "" }: HighlightProps) {
  if (!text) return <>{children}</>;
  const parts = String(children).split(new RegExp(`(${text})`, "gi"));
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === text.toLowerCase() ? (
          <mark key={i} className="rounded bg-gold/30 px-0.5 text-gold-light">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
