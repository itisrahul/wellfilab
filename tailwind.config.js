/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        fadeSlideIn: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        auroraA: { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '50%': { transform: 'translate(50px, -35px) scale(1.12)' } },
        auroraB: { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '50%': { transform: 'translate(-40px, 30px) scale(1.08)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        floatY: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        fadeSlideIn: 'fadeSlideIn .25s ease',
        'aurora-a': 'auroraA 19s ease-in-out infinite',
        'aurora-b': 'auroraB 25s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        float: 'floatY 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
