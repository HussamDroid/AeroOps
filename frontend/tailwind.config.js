/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qatar: '#8a1538', // This creates the 'bg-qatar' class
      },
    },
  },
  plugins: [],
}