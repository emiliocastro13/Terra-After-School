/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terra: {
          50: '#eef5f0',
          100: '#d4e8db',
          200: '#a9d1b8',
          300: '#75b391',
          400: '#479870',
          500: '#2f7d59',
          600: '#226345',
          700: '#1b4e37',
          800: '#163d2c',
          900: '#113022',
        },
      },
    },
  },
  plugins: [],
}
