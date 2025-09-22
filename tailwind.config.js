/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "50%": { transform: "translateY(-40px) translateX(30px) scale(1.05)" },
        },
        floatMedium: {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "50%": { transform: "translateY(40px) translateX(-30px) scale(1.1)" },
        },
        floatFast: {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)" },
          "50%": { transform: "translateY(-60px) translateX(20px) scale(1.1)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeZoom: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeZoomOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.9)" },
        },
      },
      animation: {
        "float-slow": "floatSlow 25s ease-in-out infinite",
        "float-medium": "floatMedium 18s ease-in-out infinite",
        "float-fast": "floatFast 12s ease-in-out infinite",
        fadeIn: "fadeIn 0.4s ease-out",
        fadeZoom: "fadeZoom 0.4s ease-out forwards",
        fadeZoomOut: "fadeZoomOut 0.3s ease-in forwards",
      },
    },
  },
  plugins: [],
};
