/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        youth: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0066FF',
          600: '#0052cc',
          700: '#003d99',
        },
        security: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          emerald: '#059669',
        },
        other: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

