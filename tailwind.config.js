/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1a1a2e',
          light: '#2d2d44',
          muted: '#6b7280',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#e8c547',
          dark: '#a68520',
        },
        paper: {
          DEFAULT: '#faf8f5',
          dark: '#f0ebe3',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,26,46,0.06), 0 4px 12px rgba(26,26,46,0.04)',
        'card-hover': '0 4px 16px rgba(26,26,46,0.1)',
      },
    },
  },
  plugins: [],
};
