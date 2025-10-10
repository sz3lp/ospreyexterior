/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4ED8',
          dark: '#1E3A8A',
          light: '#3B82F6'
        },
        accent: '#0EA5E9'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 20px 45px -30px rgba(30, 64, 175, 0.55)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
