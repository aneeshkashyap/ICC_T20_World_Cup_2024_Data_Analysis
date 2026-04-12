import React, { useEffect, useRef, useState } from 'react';

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

const Hero = ({ stats }) => {
  const kpis = [
    {
      label: 'Matches Played',
      value: stats.totalMatches,
      icon: '🏏',
      gradient: 'from-amber-400 to-orange-500',
      glow: 'rgba(251,146,60,0.18)',
      border: 'rgba(251,146,60,0.22)',
    },
    {
      label: 'Total Runs',
      value: stats.totalRuns,
      icon: '🏆',
      gradient: 'from-cyan-400 to-blue-500',
      glow: 'rgba(6,182,212,0.18)',
      border: 'rgba(6,182,212,0.22)',
    },
    {
      label: 'Total Wickets',
      value: stats.totalWickets,
      icon: '⚡',
      gradient: 'from-violet-400 to-purple-600',
      glow: 'rgba(139,92,246,0.18)',
      border: 'rgba(139,92,246,0.22)',
    },
    {
      label: 'Nations',
      value: stats.totalTeams,
      icon: '🌍',
      gradient: 'from-emerald-400 to-teal-500',
      glow: 'rgba(52,211,153,0.18)',
      border: 'rgba(52,211,153,0.22)',
    },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* ── Layer 0: base deep background ── */}
      <div className="absolute inset-0 -z-10 bg-[#020617]" />

      {/* ── Layer 1: radial navy centre glow ── */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(11,30,60,0.95) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Layer 2: aurora orbs ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Gold top-left orb */}
        <div
          className="ambient-orb w-[600px] h-[600px] -top-32 -left-40 animate-aurora"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.07) 0%, transparent 65%)' }}
        />
        {/* Cyan bottom-right orb */}
        <div
          className="ambient-orb w-[500px] h-[500px] bottom-0 -right-32 animate-float-slow"
          style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.06) 0%, transparent 65%)', animationDelay: '2s' }}
        />
        {/* Purple mid orb */}
        <div
          className="ambient-orb w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 65%)', animationDelay: '4s' }}
        />
      </div>

      {/* ── Layer 3: dot grid ── */}
      <div className="absolute inset-0 -z-10 dot-grid opacity-40 pointer-events-none" aria-hidden="true" />

      {/* ── Layer 4: gold centre spotlight (very subtle) ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,215,0,0.05) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* Live badge */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full
                       text-[10px] font-black uppercase tracking-[0.22em] text-icc-gold
                       border border-icc-gold/22"
            style={{
              background: 'rgba(255,215,0,0.05)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 bg-icc-gold rounded-full animate-pulse shrink-0" aria-hidden="true" />
            ICC Men&apos;s T20 World Cup 2024
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-10">
          <h1
            className="font-condensed font-black uppercase tracking-tight leading-[0.88]"
            style={{ fontSize: 'clamp(4rem, 12vw, 9rem)' }}
          >
            <span className="shimmer-text">T20</span>
            <br />
            <span className="text-white">WORLD</span>
            <br />
            <span className="gold-text">CUP 2024</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-icc-muted/85 max-w-xl mx-auto leading-relaxed font-light">
            The ultimate data-driven analytics dashboard&nbsp;&mdash; every match, every player,
            every stat from the ICC T20 World Cup in the{' '}
            <span className="text-white font-semibold">USA &amp; West Indies</span>.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a
              href="#matches"
              className="btn-gold text-base px-8 py-3.5 font-condensed tracking-wider"
            >
              Explore Matches&nbsp;↓
            </a>
            <a
              href="#players"
              className="btn-outline-gold text-base px-8 py-3.5 font-condensed tracking-wider"
            >
              Player Stats&nbsp;↓
            </a>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {kpis.map(({ label, value, icon, gradient, glow, border }, i) => (
            <div
              key={label}
              className="relative rounded-2xl p-5 text-center flex flex-col items-center gap-2
                         card-hover cursor-default overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid ${border}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.45), 0 0 28px ${glow}, inset 0 1px 0 rgba(255,255,255,0.07)`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* Top edge accent line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px pointer-events-none"
                style={{
                  width: '70%',
                  background: `linear-gradient(to right, transparent, ${border.replace('0.22', '0.6')}, transparent)`,
                }}
                aria-hidden="true"
              />

              <div className="text-2xl" aria-hidden="true">{icon}</div>
              <div
                className={`font-condensed text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
              >
                <Counter end={value} />
              </div>
              <div className="text-[10px] text-icc-muted/70 uppercase tracking-[0.18em] font-bold leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
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


const Hero = ({ stats }) => {
  const kpis = [
    { label: 'Matches Played', value: stats.totalMatches, icon: '🏏', color: 'from-yellow-400 to-orange-500' },
    { label: 'Total Runs', value: stats.totalRuns, icon: '🏆', color: 'from-blue-400 to-cyan-500' },
    { label: 'Total Wickets', value: stats.totalWickets, icon: '⚡', color: 'from-purple-400 to-pink-500' },
    { label: 'Nations', value: stats.totalTeams, icon: '🌍', color: 'from-green-400 to-emerald-500' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020B18] via-[#041228] to-[#020B18]"></div>
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{animationDelay:'2s'}}></div>
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{background: 'repeating-linear-gradient(0deg,transparent,transparent 60px,#fff 60px,#fff 61px), repeating-linear-gradient(90deg,transparent,transparent 60px,#fff 60px,#fff 61px)'}}>
        </div>
        {/* Cricket ball decoration */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 opacity-5 animate-float" style={{animationDelay:'1s'}}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="#cc2200" stroke="#fff" strokeWidth="1"/>
            <path d="M50 2 Q70 25 50 50 Q30 75 50 98" stroke="#fff" strokeWidth="2" fill="none"/>
            <path d="M50 2 Q30 25 50 50 Q70 75 50 98" stroke="#fff" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-yellow-400">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
            ICC Men's T20 World Cup 2024
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-8">
          <h1 className="font-condensed text-6xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tight leading-[0.9]">
            <span className="shimmer-text">T20</span>
            <br/>
            <span className="text-white">WORLD</span>
            <br/>
            <span className="gold-text">CUP 2024</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The ultimate data-driven analytics dashboard — every match, every player, every stat from the ICC T20 World Cup 2024 in the <strong className="text-white">USA & West Indies</strong>.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a href="#matches" className="px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-condensed font-black uppercase tracking-wider rounded-full hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
              Explore Matches ↓
            </a>
            <a href="#batting" className="px-8 py-3.5 glass text-yellow-400 font-condensed font-black uppercase tracking-wider rounded-full hover:scale-105 hover:bg-yellow-400/10 transition-all border border-yellow-400/30">
              Player Stats ↓
            </a>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {kpis.map(({ label, value, icon, color }) => (
            <div key={label} className="glass rounded-2xl p-5 card-hover text-center">
              <div className={`text-3xl mb-2`}>{icon}</div>
              <div className={`font-condensed text-4xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                <Counter end={value} />
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs text-white uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
