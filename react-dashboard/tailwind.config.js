/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        icc: {
          dark:   '#080f1e',
          navy:   '#0d1f3c',
          card:   '#0e2347',
          hover:  '#163260',
          gold:   '#FFD700',
          muted:  '#8B9CC8',
          border: '#1e3a6e',
          green:  '#22C55E',
          red:    '#EF4444',
        },
      },
      fontFamily: {
        sans:      ['Inter', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #080f1e 0%, #0d1f3c 50%, #080f1e 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #FFA500)',
        'glass-gradient':'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
      },
      boxShadow: {
        'card':       '0 4px 20px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.12)',
        'gold-glow':  '0 0 24px rgba(255,215,0,0.2)',
        'glass':      '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
