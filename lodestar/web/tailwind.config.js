/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lodestar brand palette (mirrors the app).
        night: "#0B1026",
        deep: "#141B3C",
        star: "#E8B04B",
        ink: "#EDEFF7",
        muted: "#8A93B8",
        care: "#7FA8E8",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      maxWidth: {
        content: "1120px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.04)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s ease-out both",
        breathe: "breathe 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
