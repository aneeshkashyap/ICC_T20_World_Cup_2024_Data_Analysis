import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ── Animated counter ── */
const Counter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(end);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ── Stagger variants ── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const Hero = ({ stats }) => {
  const kpis = [
    { label: 'Matches Played', value: stats.totalMatches,  icon: '🏏', gradient: 'from-amber-400 to-orange-500',    glow: '251,146,60'  },
    { label: 'Total Runs',     value: stats.totalRuns,     icon: '🏆', gradient: 'from-cyan-400 to-blue-500',       glow: '6,182,212'   },
    { label: 'Total Wickets',  value: stats.totalWickets,  icon: '⚡', gradient: 'from-violet-400 to-purple-600',   glow: '139,92,246'  },
    { label: 'Nations',        value: stats.totalTeams,    icon: '🌍', gradient: 'from-emerald-400 to-teal-500',    glow: '52,211,153'  },
  ];

  return (
    /* ── SECTION: full-screen gradient background ── */
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        background:
          'linear-gradient(160deg, #020617 0%, #05101f 35%, #080d24 65%, #020617 100%)',
      }}
    >

      {/* ── GLOW 1: large gold radial spotlight at top-centre ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0"
        style={{
          height: '65%',
          background:
            'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(255,215,0,0.13) 0%, transparent 70%)',
        }}
      />

      {/* ── GLOW 2: cyan accent orb — bottom-right ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 -z-0 w-[520px] h-[520px] animate-float-slow"
        style={{
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.09) 0%, transparent 65%)',
          filter: 'blur(1px)',
        }}
      />

      {/* ── GLOW 3: purple mid orb ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-20 -z-0 w-[380px] h-[380px] animate-aurora"
        style={{
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, transparent 65%)',
        }}
      />

      {/* ── Dot grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 dot-grid opacity-30"
      />

      {/* ══════════════════════════════ CONTENT ══════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* ── FADE+SLIDE animated entry wrapper ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Live badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full
                         text-[10px] font-black uppercase tracking-[0.22em] text-icc-gold
                         border border-icc-gold/25"
              style={{
                background: 'rgba(255,215,0,0.06)',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 0 24px rgba(255,215,0,0.10), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <span className="w-1.5 h-1.5 bg-icc-gold rounded-full animate-pulse shrink-0" aria-hidden="true" />
              ICC Men&apos;s T20 World Cup 2024
            </div>
          </motion.div>

          {/* ── MAIN HEADING: text-6xl+ with gold-gradient "2024" ── */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1
              className="font-condensed font-bold uppercase tracking-tight leading-[0.88]"
              style={{ fontSize: 'clamp(4.5rem, 14vw, 10.5rem)' }}
            >
              {/* "T20 WORLD CUP" — shimmer white */}
              <span className="shimmer-text block">T20 World</span>
              <span className="text-white block">Cup</span>

              {/* "2024" — vivid gold gradient + glow */}
              <span
                className="block bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400
                           bg-clip-text text-transparent"
                style={{
                  textShadow: 'none',
                  filter:
                    'drop-shadow(0 0 48px rgba(255,215,0,0.35)) drop-shadow(0 0 16px rgba(255,165,0,0.25))',
                }}
              >
                2024
              </span>
            </h1>

            <p className="mt-7 text-base sm:text-lg text-icc-muted/85 max-w-xl mx-auto leading-relaxed font-light">
              The ultimate data-driven analytics dashboard&nbsp;&mdash; every match, every player,
              every stat from the ICC T20 World Cup in the{' '}
              <span className="text-white font-semibold">USA &amp; West Indies</span>.
            </p>

            {/* ── CTA BUTTONS with hover scale + gradient ── */}
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {/* Primary CTA */}
              <motion.a
                href="#matches"
                whileHover={{ scale: 1.08, boxShadow: '0 0 36px rgba(255,215,0,0.45)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="px-8 py-3 rounded-full font-bold text-sm text-black
                           bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400
                           shadow-[0_0_18px_rgba(255,215,0,0.25)]
                           transition-shadow duration-300"
              >
                🏏 Explore Matches
              </motion.a>

              {/* Secondary CTA */}
              <motion.a
                href="#players"
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,215,0,0.10)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="px-8 py-3 rounded-full font-bold text-sm text-icc-gold
                           border border-icc-gold/40 backdrop-blur-sm
                           transition-all duration-300"
              >
                Player Stats ↓
              </motion.a>

              {/* Tertiary CTA */}
              <motion.a
                href="#analytics"
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(99,102,241,0.12)' }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="px-8 py-3 rounded-full font-bold text-sm text-indigo-300
                           border border-indigo-400/30 backdrop-blur-sm
                           transition-all duration-300"
              >
                Analytics ↓
              </motion.a>
            </div>
          </motion.div>

          {/* ── KPI CARDS ── */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
          >
            {kpis.map(({ label, value, icon, gradient, glow }) => (
              <motion.div
                key={label}
                whileHover={{
                  scale: 1.06,
                  boxShadow: `0 0 32px rgba(${glow},0.22), 0 8px 32px rgba(0,0,0,0.5)`,
                  y: -4,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl
                           shadow-lg transition-all duration-300
                           p-5 text-center flex flex-col items-center gap-2 cursor-default
                           overflow-hidden relative group"
              >
                {/* Top-edge gold accent */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none
                             transition-all duration-300 group-hover:opacity-100 opacity-60"
                  style={{
                    width: '70%',
                    background: `linear-gradient(to right, transparent, rgba(${glow},0.6), transparent)`,
                  }}
                />

                {/* Bottom inner glow on hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 110%, rgba(${glow},0.10) 0%, transparent 70%)`,
                  }}
                />

                <div className="text-2xl" aria-hidden="true">{icon}</div>
                <div className={`font-condensed text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  <Counter end={value} />
                </div>
                <div className="text-[10px] text-icc-muted/70 uppercase tracking-[0.18em] font-bold leading-tight">
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-35 pointer-events-none">
        <span className="text-[9px] text-white uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-5 h-8 border border-white/25 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
