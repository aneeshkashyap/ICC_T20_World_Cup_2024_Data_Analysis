import React from 'react';
import { motion } from 'framer-motion';

const NAV_QUICK = [
  { label: 'Matches',   href: '#matches' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Compare',   href: '#compare' },
  { label: 'Predictor', href: '#predictor' },
  { label: 'Players',   href: '#players' },
  { label: 'Teams',     href: '#teams' },
];

const TECH_STACK = [
  { name: 'React 19',          color: 'text-cyan-400' },
  { name: 'Vite 8',            color: 'text-purple-400' },
  { name: 'Tailwind CSS',      color: 'text-sky-400' },
  { name: 'Framer Motion',     color: 'text-pink-400' },
  { name: 'Recharts',          color: 'text-green-400' },
];

const Footer = () => (
  <motion.footer
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="border-t border-icc-border/40"
    style={{
      background: 'rgba(8,15,30,0.90)',
      backdropFilter: 'blur(20px)',
    }}
  >
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <motion.div className="flex items-center gap-3"
            whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 400 }}>
            <div className="w-10 h-10 rounded-xl bg-icc-gold flex items-center justify-center
                            font-condensed font-black text-icc-dark text-sm shadow-gold-glow">
              T20
            </div>
            <div>
              <div className="font-condensed text-lg font-black text-white tracking-wider leading-none">
                ICC T20 WC 2024
              </div>
              <div className="text-[10px] text-icc-muted uppercase tracking-[0.15em] mt-0.5">
                Analytics Dashboard
              </div>
            </div>
          </motion.div>
          <p className="text-xs text-icc-muted leading-relaxed max-w-xs">
            A portfolio-level data analytics dashboard for the 2024 ICC Men's T20 World Cup, covering all 55 matches across the USA & West Indies.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { v: '55', l: 'Matches' },
              { v: '20', l: 'Teams' },
              { v: '9',  l: 'Venues' },
            ].map(({ v, l }) => (
              <div key={l} className="px-3 py-1.5 rounded-lg glass-card text-center">
                <span className="font-condensed font-black text-base text-icc-gold block">{v}</span>
                <span className="text-[9px] text-icc-muted uppercase tracking-widest">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-icc-muted uppercase tracking-widest font-bold mb-1">Sections</p>
          {NAV_QUICK.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              whileHover={{ x: 4, color: '#FFD700' }}
              transition={{ duration: 0.15 }}
              className="text-sm text-white/60 hover:text-icc-gold transition-colors no-underline flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-icc-border inline-block" />
              {label}
            </motion.a>
          ))}
        </div>

        {/* Tech stack */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-icc-muted uppercase tracking-widest font-bold mb-1">Built With</p>
          {TECH_STACK.map(({ name, color }) => (
            <div key={name} className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${color}`}>{name}</span>
            </div>
          ))}
          <a
            href="https://github.com/aneeshkashyap/ICC_T20_World_Cup_2024_Data_Analysis"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline mt-2"
          >
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(255,215,0,0.15)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card
                         border border-icc-gold/30 text-xs font-bold text-icc-gold tracking-wide"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source
            </motion.div>
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 pt-6 border-t border-icc-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-icc-muted">
          🏆 <span className="text-white font-semibold">India</span> — T20 World Cup 2024 Champions
        </p>
        <p className="text-xs text-icc-muted">
          © 2024 ICC T20 World Cup Analytics · Data for educational use
        </p>
      </div>
    </div>
  </motion.footer>
);

export default Footer;
