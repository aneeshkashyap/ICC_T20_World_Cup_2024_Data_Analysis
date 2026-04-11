import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home',      href: '#hero',      icon: '🏠' },
  { label: 'Matches',   href: '#matches',   icon: '🏏' },
  { label: 'Analytics', href: '#analytics', icon: '📊' },
  { label: 'Compare',   href: '#compare',   icon: '⚖️' },
  { label: 'Predictor', href: '#predictor', icon: '🔮' },
  { label: 'Players',   href: '#players',   icon: '👤' },
  { label: 'Teams',     href: '#teams',     icon: '🌍' },
  { label: 'Stats',     href: '#stats',     icon: '📈' },
];

const Navbar = () => {
  const [open,       setOpen]       = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeLink, setActiveLink] = useState('#hero');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 h-14 glass-nav flex items-center
        transition-shadow duration-300 ${scrolled ? 'shadow-glass' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* ── Brand ── */}
        <a href="#hero" className="flex items-center gap-2.5 no-underline group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-8 h-8 rounded-lg bg-icc-gold flex items-center justify-center
                       font-condensed font-black text-icc-dark text-xs tracking-wider flex-shrink-0
                       shadow-gold-glow"
          >
            T20
          </motion.div>
          <div className="leading-none">
            <div className="font-condensed font-bold text-base text-white tracking-wider leading-none">
              ICC T20 WC 2024
            </div>
            <div className="text-[9px] text-icc-muted tracking-[0.15em] uppercase mt-0.5">
              Analytics Dashboard
            </div>
          </div>
        </a>

        {/* ── Desktop links ── */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`relative px-3.5 py-2 rounded-md text-sm font-medium tracking-wide
                          no-underline transition-all duration-200
                          ${activeLink === link.href
                            ? 'text-icc-gold'
                            : 'text-icc-muted hover:text-white hover:bg-white/5'}`}
            >
              {link.label}
              {activeLink === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-icc-gold rounded-full"
                />
              )}
            </a>
          ))}
        </div>

        {/* ── Live badge ── */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-icc-gold/20 bg-icc-gold/5">
          <span className="w-1.5 h-1.5 rounded-full bg-icc-green animate-pulse-slow" />
          <span className="text-[10px] font-bold text-icc-green tracking-widest uppercase">Live Data</span>
        </div>

        {/* ── Mobile toggle ── */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="md:hidden text-icc-muted hover:text-white p-1.5 transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </motion.button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-14 left-0 right-0 glass-nav border-b border-icc-border overflow-hidden md:hidden"
          >
            <div className="py-2">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setOpen(false); setActiveLink(link.href); }}
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium
                             text-icc-muted hover:text-white hover:bg-white/5
                             transition-all no-underline"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll progress bar ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-icc-gold origin-left pointer-events-none"
        style={{ scaleX }}
      />
    </motion.nav>
  );
};

export default Navbar;
