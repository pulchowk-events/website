/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1a1a1a",
          800: "#2d2d2d",
          700: "#383838",
        },
        primary: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        green: {
          100: "#d1fae5",
        },
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          '0%': { transform: 'translate(-50%, 100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, -50%)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-in-out",
        fadeOut: "fadeOut 0.2s ease-in-out",
        slideUp: "slideUp 0.3s ease-in-out",
      },
      
    },
  },
  plugins: [],
}