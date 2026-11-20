/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fuchsia: {
          DEFAULT: '#D81B72',
          50: '#FCE5EF',
          100: '#FAD4E3',
          200: '#F7B6D2',
          300: '#F299BE',
          400: '#F47EAF',
          500: '#E83E8C',
          600: '#D81B72',
          700: '#B4155E',
          800: '#916A7D',
          900: '#54263D',
        },
        ink: {
          DEFAULT: '#54263D',
          soft: '#916A7D',
        },
        paper: {
          warm: '#FFF7FA',
          pale: '#FCE5EF',
          soft: '#F7B6D2',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Be Vietnam Pro"', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      letterSpacing: {
        tightish: '-0.015em',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(216, 27, 114, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.45)',
        'glass-lg': '0 20px 60px -10px rgba(84, 38, 61, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
        soft: '0 12px 40px -12px rgba(84, 38, 61, 0.18)',
        'soft-lg': '0 30px 80px -20px rgba(84, 38, 61, 0.28)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '70%': { transform: 'scale(1.2)', opacity: '0' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        'drift-a': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(4%, 6%) scale(1.08)' },
        },
        'drift-b': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-5%, -4%) scale(1.1)' },
        },
        'drift-c': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(3%, 5%) scale(0.94)' },
        },
        'drift-d': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(6%, -5%)' },
        },
        'drift-e': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-4%, 6%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 1s ease both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
        'float-soft': 'float-soft 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'drift-a': 'drift-a 26s ease-in-out infinite',
        'drift-b': 'drift-b 32s ease-in-out infinite',
        'drift-c': 'drift-c 22s ease-in-out infinite',
        'drift-d': 'drift-d 28s ease-in-out infinite',
        'drift-e': 'drift-e 19s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
