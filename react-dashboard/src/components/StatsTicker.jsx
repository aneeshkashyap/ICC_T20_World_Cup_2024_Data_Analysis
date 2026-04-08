import React, { memo } from 'react';
import { motion } from 'framer-motion';

/* Scrolling stats ticker — like a live sports broadcast chyron */
const TICKER_ITEMS = [
  { label: '🏆 CHAMPIONS', value: 'India', highlight: true },
  { label: '🥈 RUNNERS-UP', value: 'South Africa' },
  { label: '🏏 TOP SCORER', value: 'Rahmanullah Gurbaz — 281 runs' },
  { label: '⚡ TOP WICKETS', value: 'Fazalhaq Farooqi — 17 wkts' },
  { label: '📍 FINAL VENUE', value: 'Kensington Oval, Bridgetown' },
  { label: '📅 TOURNAMENT', value: 'Jun 1 – Jun 29, 2024' },
  { label: '🌍 TEAMS', value: '20 nations competed' },
  { label: '🏟️ MATCHES', value: '52 games played' },
  { label: '💥 TOTAL RUNS', value: '12,188 scored' },
  { label: '⭐ PLAYER OF TOURNAMENT', value: 'Jasprit Bumrah' },
];

const TickerItem = memo(({ item }) => (
  <span className="flex items-center gap-2.5 whitespace-nowrap px-8">
    <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${item.highlight ? 'text-icc-gold' : 'text-white/35'}`}>
      {item.label}
    </span>
    <span className="text-[9px] text-white/60 font-medium">{item.value}</span>
    <span className="text-white/15 text-xs">•</span>
  </span>
));

const StatsTicker = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div
      className="relative py-2.5 overflow-hidden border-y border-white/[0.06]"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      aria-label="Live tournament statistics ticker"
      role="marquee"
    >
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #080f1e, transparent)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #080f1e, transparent)' }} />

      {/* Gold left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-icc-gold/30" />

      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        className="flex items-center"
        style={{ willChange: 'transform' }}
      >
        {items.map((item, i) => (
          <TickerItem key={i} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

export default StatsTicker;
