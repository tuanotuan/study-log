import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "#d8dee4",
        canvas: "#f6f8fa",
        ink: "#24292f",
        muted: "#57606a",
        accent: "#0969da",
        success: "#1a7f37"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(27, 31, 36, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
