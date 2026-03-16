import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        primary: {
          main: "#FFFFFF",
          85: "rgba(255,255,255,0.85)",
          60: "rgba(255,255,255,0.60)",
          35: "rgba(255,255,255,0.35)",
        }
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      spacing: {
        4: "4px",
        8: "8px",
        16: "16px",
        24: "24px",
        32: "32px",
        64: "64px",
        128: "128px",
      }
    },
  },
  plugins: [],
};
export default config;
