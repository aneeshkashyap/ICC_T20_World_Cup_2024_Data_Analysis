/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        icc: {
          dark:   '#020617',        // deeper Stripe-style near-black
          navy:   '#0B1E3C',        // primary navy
          card:   '#091428',        // card surface
          hover:  '#122855',        // interactive hover
          gold:   '#FFD700',
          muted:  '#7E93C4',
          border: '#172D56',
          green:  '#22C55E',
          red:    '#EF4444',
          // Premium accent palette
          cyan:   '#06B6D4',
          indigo: '#6366F1',
          rose:   '#F43F5E',
        },
      },
      fontFamily: {
        sans:      ['Inter', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':   'linear-gradient(135deg, #020617 0%, #0B1E3C 50%, #020617 100%)',
        'gold-gradient':   'linear-gradient(135deg, #FFD700, #FFA500)',
        'gold-warm':       'linear-gradient(135deg, #F59E0B, #F97316)',
        'glass-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
        'radial-navy':     'radial-gradient(ellipse at 50% 0%, #0B1E3C 0%, #020617 70%)',
        'radial-gold':     'radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.08) 0%, transparent 65%)',
        'premium-card':    'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%)',
      },
      boxShadow: {
        'card':           '0 4px 20px rgba(0,0,0,0.4)',
        'card-hover':     '0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,215,0,0.14)',
        'gold-glow':       '0 0 24px rgba(255,215,0,0.22)',
        'gold-glow-lg':    '0 0 48px rgba(255,215,0,0.18), 0 0 96px rgba(255,215,0,0.07)',
        'glass':           '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'premium':         '0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.4)',
        'premium-hover':   '0 0 0 1px rgba(255,215,0,0.18), 0 32px 80px rgba(0,0,0,0.7), 0 0 48px rgba(255,215,0,0.08)',
        'inner-top':       'inset 0 1px 0 rgba(255,255,255,0.08)',
        'nav':             '0 1px 0 rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.5)',
        'cyan-glow':       '0 0 24px rgba(6,182,212,0.18)',
        'indigo-glow':     '0 0 24px rgba(99,102,241,0.18)',
      },
      animation: {
        'pulse-slow':      'pulse 3s ease-in-out infinite',
        'float':           'float 6s ease-in-out infinite',
        'float-slow':      'float 9s ease-in-out infinite',
        'shimmer':         'shimmer 1.8s linear infinite',
        'shimmer-fast':    'shimmer 1.2s linear infinite',
        'glow-pulse':      'glowPulse 2.2s ease-in-out infinite',
        'border-glow':     'borderGlow 2.5s ease-in-out infinite',
        'aurora':          'aurora 8s ease-in-out infinite alternate',
        'scan':            'scan 3s linear infinite',
        'spin-slow':       'spin 12s linear infinite',
      },
      keyframes: {
        float:      { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse:  {
          '0%,100%': { boxShadow: '0 0 10px rgba(255,215,0,0.15), 0 0 20px rgba(255,215,0,0.08)' },
          '50%':     { boxShadow: '0 0 28px rgba(255,215,0,0.45), 0 0 56px rgba(255,215,0,0.20)' },
        },
        borderGlow: {
          '0%,100%': { borderColor: 'rgba(255,215,0,0.25)' },
          '50%':     { borderColor: 'rgba(255,215,0,0.65)' },
        },
        aurora: {
          '0%':   { transform: 'translate(-10%, -20%) scale(1.0)', opacity: 0.4 },
          '50%':  { transform: 'translate(10%, 10%) scale(1.15)', opacity: 0.6 },
          '100%': { transform: 'translate(5%, -15%) scale(0.95)', opacity: 0.35 },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
