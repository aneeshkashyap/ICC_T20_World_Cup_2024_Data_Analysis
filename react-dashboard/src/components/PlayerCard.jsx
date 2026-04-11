import React, { memo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { getFlag } from '../utils';

/* ─── Role config ─── */
const ROLE = {
  Batsman:       { grad: 'from-blue-500 to-cyan-400',   pill: 'pill-blue',   accent: '#60A5FA' },
  Bowler:        { grad: 'from-emerald-500 to-green-400', pill: 'pill-green', accent: '#34D399' },
  'All-rounder': { grad: 'from-amber-500 to-yellow-400', pill: 'pill-gold',  accent: '#FBBF24' },
  default:       { grad: 'from-icc-gold to-yellow-300',  pill: 'pill-gold',  accent: '#FFD700' },
};

/* ─── Animated arc bar (circular progress) ─── */
const ArcStat = ({ value, max, accent, label, size = 52, stroke = 4 }) => {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true });
  const pct     = max ? Math.min(value / max, 1) : 0;
  const r       = (size - stroke * 2) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ * (1 - (inView ? pct : 0));

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          {/* Progress */}
          <motion.circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={accent} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black text-white leading-none">{value ?? '—'}</span>
        </div>
      </div>
      <span className="text-[8px] tracking-widest uppercase text-white/35">{label}</span>
    </div>
  );
};

/* ─── Linear stat bar ─── */
const StatBar = ({ label, value, max, grad, delay = 0, formatVal }) => {
  const pct = max && value != null ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[9px] font-bold tracking-widest uppercase text-white/35">{label}</span>
        <span className="text-[11px] font-black text-white">{formatVal ? formatVal(value) : (value ?? '—')}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full bg-gradient-to-r ${grad}`}
        />
      </div>
    </div>
  );
};

/* ─── Main PlayerCard ─── */
const PlayerCard = memo(({ player, index = 0, maxRuns = 300, maxWickets = 20,
                          compareMode = false, isSelected = false, onToggleSelect }) => {
  const {
    name, team, teamFlag, role = 'Batsman',
    runs, wickets, strikeRate, economy, matches, image,
  } = player;

  const cfg = ROLE[role] || ROLE.default;
  const [avatarErr, setAvatarErr] = useState(false);
  const [flagErr,   setFlagErr]   = useState(false);
  const onAErr = useCallback(() => setAvatarErr(true), []);
  const onFErr = useCallback(() => setFlagErr(true),   []);

  /* ── 3D tilt ── */
  const cardRef    = useRef(null);
  const motionX    = useMotionValue(0);
  const motionY    = useMotionValue(0);
  const rotateX    = useSpring(useTransform(motionY, [-0.5, 0.5], [8, -8]),  { stiffness: 300, damping: 30 });
  const rotateY    = useSpring(useTransform(motionX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    motionX.set((e.clientX - rect.left) / rect.width - 0.5);
    motionY.set((e.clientY - rect.top)  / rect.height - 0.5);
  }, [motionX, motionY]);

  const handleMouseLeave = useCallback(() => {
    motionX.set(0);
    motionY.set(0);
  }, [motionX, motionY]);

  const initials   = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const avatarSrc  = (!image || avatarErr)
    ? null
    : image;
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0d1f3c&color=FFD700&size=120&bold=true&font-size=0.42`;

  const isBatsman = role === 'Batsman' || role === 'All-rounder';
  const isBowler  = role === 'Bowler'  || role === 'All-rounder';

  /* top-stat badge */
  const isTopScorer = isBatsman && runs != null && runs >= 200;
  const isWicketStar = isBowler && wickets != null && wickets >= 15;
  const topBadge = isTopScorer && isWicketStar ? { icon: '⭐', label: 'Star Player', cls: 'bg-icc-gold/20 text-icc-gold border-icc-gold/30' }
    : isTopScorer  ? { icon: '🏏', label: 'Top Scorer',     cls: 'bg-blue-500/15 text-blue-300 border-blue-500/25' }
    : isWicketStar ? { icon: '🎯', label: 'Wicket Taker',   cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' }
    : null;

  return (
    <motion.article
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -7, scale: 1.05 }}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`player-card rounded-2xl overflow-hidden flex flex-col group relative
                 ${compareMode ? 'cursor-pointer' : 'cursor-default'}
                 ${isSelected ? 'ring-2 ring-icc-gold shadow-[0_0_24px_4px_rgba(255,215,0,0.22)]' : ''}`}
      aria-label={`${name}, ${team}, ${role}`}
      onClick={compareMode && onToggleSelect ? () => onToggleSelect(player.id) : undefined}
    >
      {/* Selected overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none rounded-2xl
                       bg-icc-gold/[0.07] flex items-start justify-end p-2"
          >
            <div className="w-6 h-6 rounded-full bg-icc-gold flex items-center justify-center shadow-lg">
              <svg className="w-3.5 h-3.5 text-icc-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare toggle button (visible in compareMode) */}
      <AnimatePresence>
        {compareMode && !isSelected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={e => { e.stopPropagation(); onToggleSelect?.(player.id); }}
            aria-label={`Add ${name} to comparison`}
            className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full
                       bg-white/10 border border-white/20 text-white/60
                       hover:bg-icc-gold hover:border-icc-gold hover:text-icc-dark
                       flex items-center justify-center transition-all duration-200
                       shadow-md"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Role-colored top bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${cfg.grad}`} />

      {/* Upper half — gradient bg for avatar area */}
      <div className="relative px-5 pt-6 pb-4 flex flex-col items-center gap-3"
        style={{ background: `linear-gradient(180deg, ${cfg.accent}12 0%, transparent 100%)` }}>

        {/* Circular avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/15
                          shadow-[0_8px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <img
              src={avatarSrc || fallbackSrc}
              alt={`Portrait of ${name}`}
              className="w-full h-full object-cover"
              loading="lazy" decoding="async"
              onError={onAErr}
              width={80} height={80}
            />
          </div>
          {/* Team mini-flag badge */}
          {!flagErr && teamFlag && (
            <img src={teamFlag} alt={`${team} flag`}
              className="absolute -bottom-0.5 -right-0.5 w-7 h-5 rounded object-cover
                         border-2 border-icc-dark shadow-md"
              loading="lazy" decoding="async"
              onError={onFErr}
              width={28} height={20} />
          )}
          {/* Glow ring on hover */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `0 0 20px ${cfg.accent}50` }} />
        </div>

        {/* Name + team + role */}
        <div className="text-center">
          <p className="font-bold text-sm text-white leading-tight truncate max-w-[160px]">{name}</p>
          <p className="text-[10px] text-white/40 mt-0.5 truncate">{team}</p>
          {/* Top-stat badge */}
          {topBadge && (
            <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full
                            text-[8px] font-bold border ${topBadge.cls}`}>
              <span>{topBadge.icon}</span><span>{topBadge.label}</span>
            </div>
          )}
          <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full
                            text-[8px] font-bold uppercase tracking-[0.15em] border ${
            role === 'Batsman'       ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' :
            role === 'Bowler'        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' :
            role === 'All-rounder'   ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' :
            'bg-icc-gold/15 text-icc-gold border-icc-gold/20'}`}>
            {role}
          </span>
        </div>

        {/* Arc stat row */}
        <div className="flex items-center justify-center gap-3 mt-1">
          {isBatsman && runs != null && (
            <ArcStat value={runs} max={maxRuns} accent={cfg.accent} label="Runs" />
          )}
          {isBowler && wickets != null && (
            <ArcStat value={wickets} max={maxWickets} accent={cfg.accent} label="Wkts" />
          )}
          {strikeRate != null && (
            <ArcStat value={Number(strikeRate).toFixed(0)} max={250} accent={cfg.accent} label="SR" />
          )}
          {economy != null && (
            <ArcStat value={Number(economy).toFixed(1)} max={15} accent="#94A3B8" label="Econ" />
          )}
        </div>
      </div>

      {/* Lower half — progress bars */}
      <div className="px-5 pb-5 flex flex-col gap-2 border-t border-white/[0.05] pt-4">
        {runs != null && isBatsman && (
          <StatBar label="Runs" value={runs} max={maxRuns} grad={cfg.grad} delay={0.1} />
        )}
        {wickets != null && isBowler && (
          <StatBar label="Wickets" value={wickets} max={maxWickets} grad={cfg.grad} delay={0.15} />
        )}
        {strikeRate != null && (
          <StatBar label="Strike Rate" value={Number(strikeRate).toFixed(1)} max={250}
            grad={cfg.grad} delay={0.2} />
        )}
        {economy != null && (
          <StatBar label="Economy" value={Number(economy).toFixed(2)} max={15}
            grad="from-slate-500 to-slate-400" delay={0.2} />
        )}

        {/* Matches badge */}
        {matches != null && (
          <div className="flex items-center justify-end mt-1">
            <span className="text-[9px] text-white/25 tracking-widest">{matches} innings</span>
          </div>
        )}
      </div>
    </motion.article>
  );
});

PlayerCard.displayName = 'PlayerCard';
export default PlayerCard;
