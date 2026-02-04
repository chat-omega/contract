/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold/Yellow primary palette (matching vanilla app)
        primary: {
          50: '#FFFBEB',   // lightest gold
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FEC62C',  // Main brand gold color
          600: '#F5B800',  // Hover state
          700: '#D97706',
          800: '#B45309',
          900: '#78350F',
        },
        // Orange accent for active states
        accent: {
          50: '#FFF3E0',   // Light orange background for active nav
          100: '#FFECB3',
          500: '#FF9800',  // Orange accent
          600: '#F57C00',  // Darker orange for active text
          700: '#E65100',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
