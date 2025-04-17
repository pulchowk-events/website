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
    },
  },
  plugins: [],
}