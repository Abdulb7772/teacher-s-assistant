import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#071A2F", deep: "#102C57" },
        gold: { DEFAULT: "#D4AF37", light: "#F6C453" },
        accent: "#FFD166",
        success: "#22C55E",
        danger: "#EF4444",
        surface: "#F8FAFC",
        ink: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(0,0,0,0.25)",
        glow: "0 0 40px -8px rgba(212,175,55,0.45)",
        card: "0 4px 24px -6px rgba(7,26,47,0.14)",
        "card-dark": "0 4px 24px -6px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F6C453 0%, #D4AF37 60%, #B8860B 100%)",
        "navy-gradient": "linear-gradient(160deg, #102C57 0%, #071A2F 100%)",
        "hero-radial": "radial-gradient(ellipse at top, rgba(212,175,55,0.16), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.5)" },
          "70%": { boxShadow: "0 0 0 12px rgba(212,175,55,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0)" },
        },
        "spin-slow": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease both",
        "fade-in": "fade-in 0.4s ease both",
        shimmer: "shimmer 1.4s linear infinite",
        float: "float 5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
