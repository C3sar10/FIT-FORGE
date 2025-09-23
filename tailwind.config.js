/** @type   {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
