import { useEffect } from "react";

export default function useKeyShortcut(
  key: string,
  callback: () => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing) return;
      if (e.key === key) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, enabled]);
}
