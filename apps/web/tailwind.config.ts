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
        // Light Theme: Warm agricultural editorial palette
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

        // Dark Theme: Deep forest obsidian & warm mineral surfaces
        dark: {
          bg: "#0E1813",
          surface: "#16231D",
          card: "#1C2D25",
          cardSubtle: "#14201A",
          ink: "#F5F2E9",
          muted: "#97A59C",
          forest: "#2D6A50",
          moss: "#7EA870",
          sage: "#A9BFA0",
          amber: "#DDA245",
          terracotta: "#D46D4B",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
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
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'specular': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
