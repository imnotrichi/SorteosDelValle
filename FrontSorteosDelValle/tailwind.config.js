/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        "primary": "#13ec5b",
        "background-light": "#f8fcf9",
        "background-dark": "#102216",
        "text-light": "#0d1b12",
        "text-dark": "#e7f3eb",
        "card-light": "#ffffff",
        "card-dark": "#182c1f",
        "border-light": "#e7f3eb",
        "border-dark": "#2a3f31",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "Noto Sans", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.5rem", "lg": "0.75rem", "xl": "1rem", "full": "9999px" },
    },
  },
  plugins: [
  ],
}