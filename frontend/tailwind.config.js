/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#FF0026",
          yellow: "#FFEA00",
          dark: "#12142D",
          navy: "#1B2B5A",
          slate: "#6674A3",
          while: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Gomme Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        terminator: ["Terminator NTL", "sans-serif"],
        gomme: ["Gomme Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
