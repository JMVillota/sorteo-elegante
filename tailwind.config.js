/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#10021d',
        'primary-purple': '#250a5e',
        'secondary-purple': '#3a1090',
        'accent': '#ffc857',
        'pink': '#ff3e7f',
        'blue': '#6a26cd',
        'turquoise': '#2ec5ce',
      }
    },
  },
  plugins: [],
}