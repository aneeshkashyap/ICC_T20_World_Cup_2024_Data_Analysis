import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { PLAYER_PHOTOS } from '../playerPhotos';

/* ─────────────────────────────────────────────────────────────────────────────
   INSIGHT ENGINE
   Three spotlight cards: Top Scorer · Best Bowler · Fastest Striker
   Derived entirely from the players prop — no extra data fetching needed.
   ─────────────────────────────────────────────────────────────────────────── */

const MIN_BALLS_FOR_SR  = 30; // Minimum balls faced to qualify for SR spotlight
const MIN_WICKETS_ECON  = 1;  // Minimum wickets taken to qualify for economy spotlight

/* ─── Avatar with photo fallback ─── */
const SpotlightAvatar = ({ player, ring }) => {
  const [err, setErr] = useState(false);
  const photo = PLAYER_PHOTOS?.[player?.name];
  const showPhoto = photo && !err;
  const initials = (player?.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('');

  return (
    <div
      className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0"
      style={{ boxShadow: `0 0 0 2px ${ring}, 0 0 20px ${ring}55` }}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt={player.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setErr(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-xl font-black text-white"
          style={{ background: 'linear-gradient(135deg, #0d1f3c, #1e3a6e)' }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

/* ─── Single spotlight card ─── */
const SpotlightCard = ({ spot, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.03 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-3xl p-6 flex flex-col gap-5 overflow-hidden cursor-default"
      style={{
        background: 'rgba(8, 15, 30, 0.85)',
        border: `1px solid ${spot.border}`,
        boxShadow: hovered
          ? `0 24px 56px rgba(0,0,0,0.65), 0 0 40px ${spot.glow}`
          : `0 8px 32px rgba(0,0,0,0.45), 0 0 16px ${spot.glow}55`,
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${spot.glow} 0%, transparent 65%)`,
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.35s ease',
        }}
        aria-hidden="true"
      />

      {/* Header: icon + title */}
      <div className="relative flex items-center gap-2.5">
        <motion.span
          className="text-2xl select-none"
          animate={hovered ? { scale: [1, 1.3, 1], rotate: [0, -12, 0] } : {}}
          transition={{ duration: 0.45 }}
          aria-hidden="true"
        >
          {spot.icon}
        </motion.span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: spot.accent }}>
            {spot.eyebrow}
          </p>
          <p className="text-xs font-semibold text-white/50 leading-tight">{spot.subtitle}</p>
        </div>
        {/* Rank badge */}
        <span
          className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
          style={{ color: spot.accent, borderColor: spot.border, background: `${spot.glow}` }}
        >
          #1
        </span>
      </div>

      {/* Player row */}
      <div className="relative flex items-center gap-4">
        <SpotlightAvatar player={spot.player} ring={spot.accent} />
        <div className="flex-1 min-w-0">
          <p className="font-condensed font-black text-xl text-white leading-tight truncate">
            {spot.player.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {spot.player.teamFlag && (
              <img
                src={spot.player.teamFlag}
                alt={spot.player.team}
                className="w-4 h-3 object-cover rounded-sm"
                loading="lazy"
                width={16} height={12}
              />
            )}
            <p className="text-xs text-white/45 truncate">{spot.player.team}</p>
          </div>
          {/* Role badge */}
          <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider
                           px-2 py-0.5 rounded-full"
            style={{ background: `${spot.glow}`, color: spot.accent,
                     border: `1px solid ${spot.border}` }}>
            {spot.player.role}
          </span>
        </div>
      </div>

      {/* Stat value + bar */}
      <div className="relative">
        <div className="flex items-end justify-between mb-2">
          <div>
            <AnimatedNumber
              value={Number(spot.displayValue)}
              duration={1400}
              className="font-condensed font-black text-4xl leading-none"
              style={{ color: spot.accent }}
            />
            <span className="text-xs text-white/40 ml-1.5 font-medium">{spot.unit}</span>
          </div>
          {spot.secondaryStat && (
            <div className="text-right">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">
                {spot.secondaryStat.label}
              </p>
              <p className="text-sm font-bold" style={{ color: `${spot.accent}99` }}>
                {spot.secondaryStat.value}
              </p>
            </div>
          )}
        </div>

        {/* Animated progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${spot.accent}99, ${spot.accent})` }}
            initial={{ width: 0 }}
            whileInView={{ width: `${spot.pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.4 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="text-[8px] text-white/25 mt-1 text-right font-medium">
          {spot.barLabel}
        </p>
      </div>
    </motion.div>
  );
};

/* ─── Main component ─── */
const InsightEngine = ({ players = [] }) => {
  const spots = useMemo(() => {
    if (!players.length) return [];

    const withRuns    = players.filter(p => (p.runs    || 0) > 0);
    const withWickets = players.filter(p => (p.wickets || 0) > 0);
    const withSR      = players.filter(p =>
      parseFloat(p.strikeRate) > 0 && (p.balls || 0) >= MIN_BALLS_FOR_SR
    );
    const withEconomy = players.filter(p =>
      parseFloat(p.economy) > 0 && (p.wickets || 0) >= MIN_WICKETS_ECON
    );

    // Sort descending / ascending
    const topScorer     = [...withRuns].sort((a, b) => (b.runs    || 0) - (a.runs    || 0))[0];
    const bestBowler    = [...withWickets].sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0];
    const fastStriker   = [...withSR].sort(
      (a, b) => parseFloat(b.strikeRate) - parseFloat(a.strikeRate)
    )[0];
    const bestEconomist = [...withEconomy].sort(
      (a, b) => parseFloat(a.economy) - parseFloat(b.economy)   // ascending — lower is better
    )[0];

    return [
      topScorer && {
        key:          'scorer',
        eyebrow:      'Top Scorer',
        subtitle:     'Most runs this tournament',
        icon:         '\uD83C\uDFCF', // 🏏
        player:       topScorer,
        displayValue: topScorer.runs,
        unit:         'runs',
        pct:          100,
        barLabel:     `Best in tournament`,
        secondaryStat: topScorer.strikeRate
          ? { label: 'SR', value: Number(topScorer.strikeRate).toFixed(1) }
          : null,
        accent: '#FFD700',
        glow:   'rgba(255,215,0,0.16)',
        border: 'rgba(255,215,0,0.28)',
      },
      bestBowler && {
        key:          'bowler',
        eyebrow:      'Best Bowler',
        subtitle:     'Most wickets in the tournament',
        icon:         '\u26A1', // ⚡
        player:       bestBowler,
        displayValue: bestBowler.wickets,
        unit:         'wickets',
        pct:          100,
        barLabel:     `Tournament leader`,
        secondaryStat: bestBowler.economy
          ? { label: 'Econ', value: Number(bestBowler.economy).toFixed(2) }
          : null,
        accent: '#34D399',
        glow:   'rgba(52,211,153,0.16)',
        border: 'rgba(52,211,153,0.28)',
      },
      fastStriker && {
        key:          'striker',
        eyebrow:      'Fastest Striker',
        subtitle:     `Min ${MIN_BALLS_FOR_SR} balls faced`,
        icon:         '\uD83D\uDCA5', // 💥
        player:       fastStriker,
        displayValue: Number(fastStriker.strikeRate).toFixed(1),
        unit:         'SR',
        pct:          Math.min(100, Math.round((parseFloat(fastStriker.strikeRate) / 200) * 100)),
        barLabel:     '/ 200 benchmark',
        secondaryStat: fastStriker.runs
          ? { label: 'Runs', value: fastStriker.runs }
          : null,
        accent: '#818CF8',
        glow:   'rgba(129,140,248,0.16)',
        border: 'rgba(129,140,248,0.28)',
      },
      bestEconomist && {
        key:          'economy',
        eyebrow:      'Best Economy',
        subtitle:     'Tightest bowler — runs per over',
        icon:         String.fromCodePoint(0x1F512), // 🔒
        player:       bestEconomist,
        displayValue: Number(bestEconomist.economy).toFixed(2),
        unit:         'econ',
        pct:          100,
        barLabel:     'Tournament best (lower = better)',
        secondaryStat: bestEconomist.wickets
          ? { label: 'Wickets', value: bestEconomist.wickets }
          : null,
        accent: '#FB923C',
        glow:   'rgba(251,146,60,0.16)',
        border: 'rgba(251,146,60,0.28)',
      },
    ].filter(Boolean);
  }, [players]);

  if (!spots.length) return null;

  return (
    <section
      id="insights"
      aria-labelledby="insights-heading"
      className="bg-icc-dark py-16 border-b border-icc-border/40"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Intelligence</p>
          <h2
            id="insights-heading"
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
          >
            Tournament <span className="text-icc-gold">Insights</span>
          </h2>
          <p className="text-icc-muted text-sm mt-2">
            Auto-computed spotlight performers from all tournament data
          </p>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spots.map((spot, i) => (
            <SpotlightCard key={spot.key} spot={spot} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsightEngine;
