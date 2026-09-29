/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Lao', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        fintech: {
          dark: '#0A0F1D',
          darkCard: '#111827',
          darkBorder: '#1F2937',
          emerald: '#10B981',
          rose: '#F43F5E',
          accent: '#6366F1',
        }
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glow-emerald': '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-primary': '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
        'float-button': '0 12px 28px rgba(16, 185, 129, 0.35)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      }
    },
  },
  plugins: [],
}
