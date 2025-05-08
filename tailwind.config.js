/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'from-green-500/20', 'to-green-600/20',
    'from-purple-500/20', 'to-purple-600/20',
    'from-yellow-500/20', 'to-yellow-600/20',
    'from-blue-500/20', 'to-blue-600/20',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          100: "#3a3a3a",
          200: "#333333",
          300: "#2e2e2e",
          400: "#292929",
          500: "#242424",
          600: "#1f1f1f",
          700: "#1b1b1b",
          800: "#161616",
          900: "#0f0f0f",
          DEFAULT: "#1a1a1a", // optional default
        },
        background: {
          DEFAULT: "#1a1a1a",
        },
        foreground: {
          DEFAULT: "#f4f4f5", // near-white text
        },
        border: {
          DEFAULT: "#3f3f46", // subtle border
        },
        primary: {
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#3f3f46",
          foreground: "#f4f4f5",
        },
        green: {
          100: "#d1fae5",
          500: "#22c55e",
          600: "#16a34a",
        },
        purple: {
          500: "#a855f7",
          600: "#9333ea",
        },
        yellow: {
          500: "#f59e0b",
          600: "#d97706",
        },
        blue: {
          500: "#3b82f6",
          600: "#2563eb",
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
