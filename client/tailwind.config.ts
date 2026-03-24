import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        aqua: "#67e8f9",
        mint: "#86efac",
        coral: "#fb7185"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(103, 232, 249, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(103, 232, 249, 0.16), transparent 36%), linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)"
      },
      backgroundSize: {
        "hero-grid": "100% 100%, 48px 48px, 48px 48px"
      }
    }
  },
  plugins: []
};

export default config;
