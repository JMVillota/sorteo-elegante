/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'prodispro-blue': 'rgb(1, 155, 220)',
        'prodispro-black': '#000000',
        'prodispro-gray': '#1a1a1a',
        'prodispro-light-gray': '#333333',
      }
    },
  },
  plugins: [],
}