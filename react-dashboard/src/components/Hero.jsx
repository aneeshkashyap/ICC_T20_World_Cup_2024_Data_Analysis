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
