/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%": { transform: "translateY(-5%)", opacity: 0 },
          "100%": { transform: "translateY(0%)", opacity: 100 },
        },
      },
      animation: {
        wiggle: "wiggle 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
