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
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' }
        }
      }
    },
  },
  plugins: [],
}