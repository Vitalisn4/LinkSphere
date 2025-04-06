/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray': {
          400: '#9ca3af',
          500: '#6b7280',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'cyan': {
          400: '#22d3ee',
          500: '#06b6d4',
          900: '#164e63',
        },
        'purple': {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          800: '#6b21a8',
          900: '#581c87',
        },
        'emerald': {
          400: '#34d399',
          500: '#10b981',
        },
      },
    },
  },
  plugins: [],
}

