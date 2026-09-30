import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FeedShield Semantic Design System Tokens (Section 4.2)
        "bg-0": "var(--bg-0)",
        "bg-1": "var(--bg-1)",
        "glass-1": "var(--glass-1)",
        "glass-2": "var(--glass-2)",
        "glass-3": "var(--glass-3)",
        "glass-active": "var(--glass-active)",
        "ink-1": "var(--ink-1)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "edge": "var(--edge)",
        "edge-hi": "var(--edge-hi)",

        // Brand Palette (Light Warm Agritech)
        ivory: "#FAF6EC",
        bone: "#F3EDDD",
        surface: "#FFFDF7",
        forest: "#1F4D3A",
        deep: "#143628",
        moss: "#6B8F5E",
        sage: "#A9BFA0",
        mist: "#E4EBDD",
        amber: "#C98A2B",
        terracotta: "#B95C3A",
        ink: "#23302A",
        muted: "#6E7A70",

        // Dark Theme Tokens (Obsidian / Mineral)
        dark: {
          bg: "#030303",
          surface: "rgba(15, 20, 17, 0.64)",
          card: "rgba(22, 29, 24, 0.72)",
          cardSubtle: "#0A0D0B",
          ink: "#F3EDDD",
          muted: "#8A958B",
          forest: "#2F6B52",
          moss: "#6B8F5E",
          sage: "#A9BFA0",
          amber: "#DDA245",
          terracotta: "#D46D4B",
          border: "rgba(236, 241, 230, 0.10)",
          borderHover: "rgba(250, 246, 236, 0.16)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "sans-serif"],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(35, 48, 42, 0.05)',
        'card': '0 8px 30px -4px rgba(31, 77, 58, 0.08)',
        'float': '0 12px 40px -6px rgba(20, 54, 40, 0.12)',
        'glass': '0 8px 32px 0 rgba(31, 77, 58, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(250, 246, 236, 0.16)',
        'specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
