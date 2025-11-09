/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Esto deshabilitará el modo oscuro automático
  theme: {
    extend: {
      colors: {
        "primary": "#13ec5b",
        "background-light": "#f8fcf9",
        "text-light": "#0d1b12",
        "card-light": "#ffffff",
        "border-light": "#e7f3eb",
      }
    },
  },
  plugins: [],
}