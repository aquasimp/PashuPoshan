import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "sans-serif"],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(35, 48, 42, 0.05)',
        'card': '0 8px 30px -4px rgba(31, 77, 58, 0.08)',
        'float': '0 12px 40px -6px rgba(20, 54, 40, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
