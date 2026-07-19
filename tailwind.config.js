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
        'cycle-sweep': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-552' }, // one full lap of the r=88 ring (2*pi*88 ~= 553)
        },
        'cycle-node-pulse': {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
          '10%': { transform: 'scale(1.15)', boxShadow: '0 0 0 8px rgba(255,255,255,0.18)' },
          '20%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,255,255,0)' },
        },
        'cycle-center-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        'cycle-caption': {
          '0%, 3%':   { opacity: '0', transform: 'translateY(4px)' },
          '7%, 13%':  { opacity: '1', transform: 'translateY(0)' },
          '18%, 100%': { opacity: '0', transform: 'translateY(0)' },
        },
      },
      animation: {
        'cycle-sweep': 'cycle-sweep 9s linear infinite',
        'cycle-node-pulse': 'cycle-node-pulse 9s ease-in-out infinite',
        'cycle-center-pulse': 'cycle-center-pulse 4s ease-in-out infinite',
        'cycle-caption': 'cycle-caption 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
