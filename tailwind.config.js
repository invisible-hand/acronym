/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {},
    fontFamily: {
      sans: [
        'Geist',
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
      ],
    },
  },
  plugins: [],
};
