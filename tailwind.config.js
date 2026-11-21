/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rose accent — deeper and less candy than a pure fuchsia so it reads
        // as ink on ivory paper rather than a UI highlight.
        fuchsia: {
          DEFAULT: '#B8325F',
          50: '#FBEFF2',
          100: '#F7E0E7',
          200: '#EFC4D2',
          300: '#E3A1B7',
          400: '#D47797',
          500: '#C4507A',
          600: '#B8325F',
          700: '#97264D',
          800: '#8A6A76',
          900: '#3B1F2B',
        },
        ink: {
          DEFAULT: '#3B1F2B',
          soft: '#7A5C68',
          faint: '#A8919A',
        },
        paper: {
          warm: '#FBF6F1',
          pale: '#F8EEEA',
          soft: '#EFC4D2',
          ivory: '#FFFCF8',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        hand: ['"Dancing Script"', 'cursive'],
      },
      letterSpacing: {
        tightish: '-0.015em',
        display: '-0.035em',
      },
      boxShadow: {
        glass: '0 10px 30px -12px rgba(120, 40, 70, 0.22), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
        'glass-lg': '0 30px 70px -24px rgba(90, 30, 55, 0.32), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
        soft: '0 12px 40px -16px rgba(59, 31, 43, 0.22)',
        'soft-lg': '0 40px 90px -30px rgba(59, 31, 43, 0.35)',
        photo: '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 60px -30px rgba(59, 31, 43, 0.45), 0 8px 20px -10px rgba(59, 31, 43, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
