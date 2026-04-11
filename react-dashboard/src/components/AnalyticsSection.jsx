/* eslint-disable react/display-name */
// ─── Analytics Section — production-quality: charts, modal, team filter, insights ───
import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList, RadarChart, PolarAngleAxis, PolarGrid, Radar,
} from 'recharts';

/* ── Animated count-up number ── */
const AnimatedValue = ({ value, duration = 0.8 }) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);

  useEffect(() => {
    const num = parseFloat(value);
    if (isNaN(num)) { setDisplay(String(value ?? '—')); return; }
    motionVal.set(num);
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = springVal.on('change', v => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      // Preserve decimal places from the original value
      const decimals = String(value).includes('.') ? String(value).split('.')[1].length : 0;
      setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString());
    });
    return unsub;
  }, [springVal, value]);

  return <span ref={ref}>{display}</span>;
};

/* ── Rich custom tooltip ── */
const CustomTooltip = ({ active, payload, label, unit, rank }) => {
  if (!active || !payload?.length) return null;
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="rounded-2xl px-5 py-4 text-sm shadow-2xl border border-icc-gold/20 min-w-[130px]"
      style={{ background: 'rgba(8,12,30,0.97)', backdropFilter: 'blur(16px)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {rankEmoji && <span className="text-base leading-none">{rankEmoji}</span>}
        <p className="font-bold text-white truncate max-w-[120px]">{label}</p>
      </div>
      <p className="text-icc-gold font-black text-2xl leading-none">
        {Number(payload[0].value).toLocaleString()}
        <span className="text-xs text-icc-muted ml-1.5 font-normal">{unit}</span>
      </p>
      <p className="text-[10px] text-icc-muted mt-2 font-medium">Click bar for full stats</p>
    </motion.div>
  );
};

/* ── Animated, clickable bar chart with persistent selection ── */
const ChartPanel = memo(({ data, dataKey, unit, accentColor = '#FFD700', height = 300, onBarClick }) => {
  const [hoveredIndex,  setHoveredIndex]  = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Reset selection when data changes (team filter)
  useEffect(() => { setSelectedIndex(null); }, [data]);

  const TooltipWithRank = useCallback((props) => {
    const idx = data.findIndex(d => d.name === props.label);
    return <CustomTooltip {...props} unit={unit} rank={idx + 1} />;
  }, [data, unit]);

  const handleClick = useCallback((barData, index) => {
    setSelectedIndex(prev => prev === index ? null : index); // toggle
    onBarClick?.(barData, index);
  }, [onBarClick]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 8, left: -12, bottom: 56 }}
        barCategoryGap="38%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,156,200,0.07)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#8B9CC8', fontSize: 10, fontWeight: 600 }}
          axisLine={false} tickLine={false}
          angle={-40} textAnchor="end" interval={0}
        />
        <YAxis tick={{ fill: '#8B9CC8', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={TooltipWithRank} cursor={{ fill: 'rgba(255,215,0,0.04)' }} />
        <Bar
          dataKey={dataKey}
          radius={[6, 6, 0, 0]}
          isAnimationActive
          animationBegin={150}
          animationDuration={900}
          animationEasing="ease-out"
          onClick={handleClick}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {data.map((_, i) => {
            const isSelected = selectedIndex === i;
            const isActive   = hoveredIndex === i;
            const base = i === 0 ? accentColor : i === 1 ? `${accentColor}CC` : i < 4 ? `${accentColor}77` : `${accentColor}44`;
            return (
              <Cell
                key={i}
                fill={isSelected ? accentColor : base}
                opacity={
                  isSelected ? 1
                  : selectedIndex !== null ? 0.35
                  : hoveredIndex === null ? 1
                  : isActive ? 1 : 0.5
                }
                stroke={isSelected ? '#fff' : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
              />
            );
          })}
          <LabelList dataKey={dataKey} position="top"
            style={{ fill: '#8B9CC8', fontSize: 9, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

/* ── Glass card wrapper ── */
const AnimCard = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`glass-card rounded-2xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

/* ── Achievement badge computation ── */
const getBadges = (player, fieldStats = {}) => {
  const badges = [];
  const runs    = parseFloat(player.runs);
  const sr      = parseFloat(player.strikeRate);
  const wickets = parseFloat(player.wickets);
  const economy = parseFloat(player.economy);
  const sixes   = parseFloat(player.sixes);
  const fours   = parseFloat(player.fours);
  if (!isNaN(runs)    && (fieldStats.maxRuns ?? 0) > 0 && runs >= fieldStats.maxRuns * 0.88)
    badges.push({ label: 'Run Machine',    icon: '🔥', cls: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10'  });
  if (!isNaN(sr)      && sr >= 162)
    badges.push({ label: 'Power Hitter',   icon: '💥', cls: 'text-orange-400 border-orange-400/40 bg-orange-400/10' });
  if (!isNaN(sixes)   && sixes >= 8)
    badges.push({ label: 'Sixer King',     icon: '🚀', cls: 'text-red-400 border-red-400/40 bg-red-400/10'          });
  if (!isNaN(fours)   && fours >= 14)
    badges.push({ label: 'Boundary King',  icon: '🏏', cls: 'text-sky-400 border-sky-400/40 bg-sky-400/10'          });
  if (!isNaN(wickets) && (fieldStats.maxWickets ?? 0) > 0 && wickets >= fieldStats.maxWickets * 0.80)
    badges.push({ label: 'Wicket Maestro', icon: '⚡', cls: 'text-green-400 border-green-400/40 bg-green-400/10'    });
  if (!isNaN(economy) && economy > 0 && economy <= 6.5)
    badges.push({ label: 'Economy Ace',    icon: '🎯', cls: 'text-purple-400 border-purple-400/40 bg-purple-400/10' });
  return badges;
};

/* ── Spider / radar chart for player profile in modal ── */
const PlayerRadarChart = ({ player, fieldStats }) => {
  const isBatter = player.role === 'Batsman'     || player.role === 'All-rounder';
  const isBowler = player.role === 'Bowler'      || player.role === 'All-rounder';
  const N = (val, max) => (max > 0 ? Math.max(0, Math.min(100, Math.round((parseFloat(val) || 0) / max * 100))) : 0);
  const data = [
    ...(isBatter ? [
      { subject: 'Runs', A: N(player.runs,        fieldStats.maxRuns    ?? 1) },
      { subject: 'SR',   A: N(player.strikeRate,   fieldStats.maxSR      ?? 1) },
      { subject: '4s',   A: N(player.fours,        fieldStats.maxFours   ?? 1) },
      { subject: '6s',   A: N(player.sixes,        fieldStats.maxSixes   ?? 1) },
    ] : []),
    ...(isBowler ? [
      { subject: 'Wkts', A: N(player.wickets, fieldStats.maxWickets ?? 1) },
      { subject: 'Econ', A: (fieldStats.maxEconomy ?? 0) > 0
          ? Math.max(0, Math.round((1 - (parseFloat(player.economy) || fieldStats.maxEconomy) / fieldStats.maxEconomy) * 100))
          : 0 },
    ] : []),
  ];
  if (data.length < 3) return null;
  const color = player.role === 'Bowler' ? '#4ADE80' : '#FFD700';
  return (
    <div className="pt-3 border-t border-white/10">
      <p className="text-[9px] font-black uppercase tracking-widest text-icc-muted mb-1">Player Profile</p>
      <ResponsiveContainer width="100%" height={155}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 6, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B9CC8', fontSize: 10, fontWeight: 700 }} />
          <Radar
            name={player.name} dataKey="A"
            stroke={color} fill={color} fillOpacity={0.18}
            isAnimationActive animationDuration={850} animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── Player Detail Modal ── */
const ROLE_GRADIENT = {
  Batsman:     'from-yellow-900/80 to-icc-dark',
  Bowler:      'from-green-900/80 to-icc-dark',
  'All-rounder': 'from-purple-900/80 to-icc-dark',
};

const StatPill = ({ label, value, color = 'text-white' }) => (
  <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl px-4 py-3 min-w-[72px]">
    <span className={`font-condensed font-black text-2xl ${color}`}>
      <AnimatedValue value={value} />
    </span>
    <span className="text-[10px] font-bold text-icc-muted uppercase tracking-widest">{label}</span>
  </div>
);

/* Comparison bar: player value vs max in field */
const CompareBar = ({ label, playerVal, maxVal, color }) => {
  const pct = maxVal > 0 ? Math.min((parseFloat(playerVal) / maxVal) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-icc-muted w-20 text-right flex-shrink-0 uppercase tracking-wide font-bold">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      </div>
      <span className="text-[11px] font-black text-white w-12 flex-shrink-0">{playerVal ?? '—'}</span>
    </div>
  );
};

const PlayerModal = ({ player, onClose, fieldStats = {} }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isBatter   = player.role === 'Batsman'     || player.role === 'All-rounder';
  const isBowler   = player.role === 'Bowler'      || player.role === 'All-rounder';
  const grad = ROLE_GRADIENT[player.role] || ROLE_GRADIENT.Batsman;

  return (
    <motion.div
      key="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,20,0.88)', backdropFilter: 'blur(10px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} stats`}
    >
      <motion.div
        className={`relative w-full max-w-xl rounded-3xl overflow-y-auto border border-white/10 shadow-2xl bg-gradient-to-br ${grad} max-h-[90vh]`}
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20
            flex items-center justify-center text-white transition-colors duration-150 z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4 relative">
          {/* Blurred flag backdrop for premium feel */}
          {player.teamFlag && typeof player.teamFlag === 'string' && player.teamFlag.startsWith('http') && (
            <img
              src={player.teamFlag}
              aria-hidden="true"
              alt=""
              className="absolute -right-1 -top-1 w-32 h-24 object-cover select-none pointer-events-none rounded-xl"
              style={{ opacity: 0.10, filter: 'blur(6px)' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          {player.image ? (
            <img
              src={player.image} alt={player.name}
              className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-white/20 shadow-lg flex-shrink-0"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center
              text-3xl flex-shrink-0 border border-white/10">
              {player.role === 'Bowler' ? '⚡' : '🏏'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-condensed font-black text-2xl sm:text-3xl text-white leading-tight">
              {player.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {player.teamFlag && (
                typeof player.teamFlag === 'string' && player.teamFlag.startsWith('http')
                  ? <img src={player.teamFlag} alt={player.team || 'flag'}
                      className="w-6 h-4 object-cover rounded-sm border border-white/20 flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  : <span className="text-xl">{player.teamFlag}</span>
              )}
              {player.team && (
                <span className="text-xs font-bold text-white/60 uppercase tracking-wide">{player.team}</span>
              )}
              {player.role && (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                  ${player.role === 'Batsman' ? 'border-yellow-500/40 text-yellow-400'
                    : player.role === 'Bowler' ? 'border-green-500/40 text-green-400'
                    : 'border-purple-500/40 text-purple-400'}`}>
                  {player.role}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 mx-6" />

        {/* Achievement Badges */}
        {(() => {
          const badges = getBadges(player, fieldStats);
          if (!badges.length) return null;
          return (
            <div className="px-6 pt-4 flex flex-wrap gap-2">
              {badges.map(b => (
                <motion.span
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${b.cls} inline-flex items-center gap-1.5`}
                >
                  {b.icon} {b.label}
                </motion.span>
              ))}
            </div>
          );
        })()}

        {/* Stats */}
        <div className="p-6 space-y-5">
          {isBatter && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-icc-muted mb-3">Batting</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatPill label="Runs"   value={player.runs}        color="text-icc-gold" />
                <StatPill label="Balls"  value={player.balls} />
                <StatPill label="SR"     value={player.strikeRate}  color="text-yellow-300" />
                <StatPill label="4s"     value={player.fours}       color="text-blue-300" />
                <StatPill label="6s"     value={player.sixes}       color="text-red-300" />
              </div>
              {/* vs. field comparison bars */}
              {fieldStats.maxRuns > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-icc-muted mb-2">vs. Tournament Field</p>
                  <CompareBar label="Runs"  playerVal={player.runs}       maxVal={fieldStats.maxRuns}   color="#FFD700" />
                  {player.strikeRate != null && (
                    <CompareBar label="SR"  playerVal={player.strikeRate} maxVal={fieldStats.maxSR}     color="#FBBF24" />
                  )}
                </div>
              )}
            </div>
          )}
          {isBowler && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-icc-muted mb-3">Bowling</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <StatPill label="Wickets" value={player.wickets}  color="text-green-400" />
                <StatPill label="Economy" value={player.economy}  color="text-emerald-300" />
              </div>
              {fieldStats.maxWickets > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-icc-muted mb-2">vs. Tournament Field</p>
                  <CompareBar label="Wickets" playerVal={player.wickets} maxVal={fieldStats.maxWickets} color="#4ADE80" />
                </div>
              )}
            </div>
          )}
          {player.matches != null && (
            <p className="text-[11px] text-icc-muted font-medium border-t border-white/10 pt-3">
              {player.matches} innings in this tournament
            </p>
          )}
          <PlayerRadarChart player={player} fieldStats={fieldStats} />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Top Performer hero card — clickable ── */
const PerformerCard = ({ label, name, value, unit, sub, icon, gradientFrom, gradientTo, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92, y: 24 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-xl flex flex-col
      ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
    role={onClick ? 'button' : undefined}
    aria-label={onClick ? `View ${name} stats` : undefined}
  >
    {onClick && (
      <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest
        text-white/40 border border-white/20 rounded-full px-2 py-0.5">
        View Stats
      </div>
    )}
    <div className="p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest text-white/70">{label}</span>
      </div>
      <p className="font-condensed font-black text-2xl sm:text-3xl text-white leading-tight pr-16">
        {name || '—'}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-condensed font-black text-4xl sm:text-5xl text-white">
          {value != null ? <AnimatedValue value={Number(value)} /> : '—'}
        </span>
        <span className="text-sm font-bold text-white/60 uppercase tracking-wide">{unit}</span>
      </div>
      {sub && (
        <p className="text-xs text-white/50 font-medium border-t border-white/10 pt-3 mt-1">{sub}</p>
      )}
    </div>
  </motion.div>
);

/* ── Analytics Section ── */
const AnalyticsSection = memo(({ batters = [], bowlers = [], players = [] }) => {
  const [extraTab,      setExtraTab]      = useState('sr');
  const [selectedTeam,  setSelectedTeam]  = useState('All Teams');
  const [activePlayer,  setActivePlayer]  = useState(null); // modal

  /* ── Build a name→player lookup from the enriched players array ── */
  const playerByName = Object.fromEntries(players.map(p => [p.name, p]));

  /* ── Unique team list for the filter dropdown ── */
  const teamOptions = ['All Teams', ...Array.from(
    new Set(players.map(p => p.team).filter(Boolean))
  ).sort()];

  /* ── Filter batters/bowlers by selected team ── */
  const teamPlayerNames = selectedTeam === 'All Teams'
    ? null
    : new Set(players.filter(p => p.team === selectedTeam).map(p => p.name));

  const filteredBatters = teamPlayerNames
    ? batters.filter(b => teamPlayerNames.has(b.striker))
    : batters;
  const filteredBowlers = teamPlayerNames
    ? bowlers.filter(b => teamPlayerNames.has(b.bowler))
    : bowlers;

  /* ── Sorted chart data (fullName carries the real name for modal lookup) ── */
  const runsData = [...filteredBatters]
    .sort((a, b) => b.runs - a.runs).slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: b.runs, fullName: b.striker }));

  const wicketsData = [...filteredBowlers]
    .sort((a, b) => b.wickets - a.wickets).slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: b.wickets, fullName: b.bowler }));

  const srData = [...filteredBatters]
    .filter(b => b.strike_rate != null)
    .sort((a, b) => b.strike_rate - a.strike_rate).slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: Math.round(Number(b.strike_rate)), fullName: b.striker }));

  const econData = [...filteredBowlers]
    .filter(b => b.economy != null)
    .sort((a, b) => a.economy - b.economy).slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: Number(b.economy).toFixed(2), fullName: b.bowler }));

  /* ── Top performers (uses filtered data) ── */
  const topBatter = filteredBatters.reduce((best, p) => (p.runs > (best?.runs ?? -1) ? p : best), null);
  const topBowler = filteredBowlers.reduce((best, p) => (p.wickets > (best?.wickets ?? -1) ? p : best), null);

  /* ── Field stats for "vs. avg" comparison bars in modal ── */
  const maxFours   = filteredBatters.reduce((m, b) => Math.max(m, b.fours   ?? 0), 0) || 1;
  const maxSixes   = filteredBatters.reduce((m, b) => Math.max(m, b.sixes   ?? 0), 0) || 1;
  const maxEconomy = filteredBowlers.reduce((m, b) => Math.max(m, parseFloat(b.economy) || 0), 0) || 12;
  const fieldStats = {
    maxRuns:    runsData[0]?.value    ?? 1,
    maxWickets: wicketsData[0]?.value ?? 1,
    maxSR:      srData[0]?.value      ?? 1,
    maxFours,
    maxSixes,
    maxEconomy,
  };

  /* ── Open modal: merge raw batter/bowler stats with enriched player meta ── */
  const openModal = useCallback((fullName, fallbackRole = 'Batsman') => {
    const enriched = playerByName[fullName];
    if (enriched) { setActivePlayer(enriched); return; }
    // Fallback: build a stub from raw data
    const rawB = batters.find(b => b.striker === fullName);
    const rawBo = bowlers.find(b => b.bowler === fullName);
    setActivePlayer({
      name: fullName, role: fallbackRole, team: '', teamFlag: '', image: null,
      runs: rawB?.runs ?? null, balls: rawB?.balls ?? null,
      fours: rawB?.fours ?? null, sixes: rawB?.sixes ?? null,
      strikeRate: rawB?.strike_rate != null ? Number(rawB.strike_rate).toFixed(1) : null,
      wickets: rawBo?.wickets ?? null,
      economy: rawBo?.economy != null ? Number(rawBo.economy).toFixed(2) : null,
      matches: null,
    });
  }, [playerByName, batters, bowlers]);

  const handleBarClick = useCallback((fallbackRole) => (barData) => {
    if (barData?.fullName) openModal(barData.fullName, fallbackRole);
  }, [openModal]);

  /* ── Advanced stats tabs ── */
  const extraCharts = {
    sr:      { data: srData,   unit: 'SR',   label: 'Best Strike Rates', icon: '💥', color: '#60A5FA', role: 'Batsman' },
    economy: { data: econData, unit: 'Econ', label: 'Best Economies',    icon: '🎯', color: '#A78BFA', role: 'Bowler'  },
  };
  const activeExtra = extraCharts[extraTab];

  return (
    <>
      {/* ── Player Modal (rendered outside section flow via AnimatePresence) ── */}
      <AnimatePresence>
        {activePlayer && (
          <PlayerModal player={activePlayer} onClose={() => setActivePlayer(null)} fieldStats={fieldStats} />
        )}
      </AnimatePresence>

      <section
        id="analytics"
        className="py-20 bg-icc-dark border-t border-icc-border/50"
        aria-labelledby="analytics-heading"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 space-y-14">

          {/* ══ Section header ══ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="eyebrow mb-4" aria-hidden="true">Data Insights</p>
            <h2
              id="analytics-heading"
              className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
            >
              Analytics
            </h2>
            <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
            <p className="text-icc-muted text-sm mt-4 max-w-lg mx-auto">
              Explore the tournament&apos;s top performers. Click any bar or card for full stats.
            </p>
          </motion.div>

          {/* ══ Team filter ══ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="text-xs font-black uppercase tracking-widest text-icc-muted">Filter by Team</span>
            <div className="flex flex-wrap gap-2">
              {teamOptions.map(team => (
                <motion.button
                  key={team}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedTeam(team)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider
                    transition-colors duration-200 border
                    ${selectedTeam === team
                      ? 'bg-icc-gold text-icc-dark border-icc-gold shadow-md'
                      : 'border-icc-border text-icc-muted hover:text-white hover:border-white/30'}`}
                >
                  {team}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ══ Insights strip — progress bar leaderboard ══ */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTeam}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-icc-muted mb-4">
                ⭐ Key Insights
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Top 3 run scorers with progress bars */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-icc-muted">🏏 Top Batsmen</p>
                  {runsData.slice(0, 3).map((p, i) => {
                    const pct = runsData[0]?.value > 0 ? (p.value / runsData[0].value) * 100 : 0;
                    return (
                      <div
                        key={p.fullName}
                        className="cursor-pointer group space-y-1"
                        onClick={() => openModal(p.fullName, 'Batsman')}
                        title={`View ${p.fullName} stats`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm leading-none w-5 flex-shrink-0">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-icc-gold transition-colors truncate flex-1">
                            {p.fullName}
                          </span>
                          <span className="font-condensed font-black text-icc-gold text-sm flex-shrink-0">{p.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-icc-gold"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top 3 wicket takers with progress bars */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-icc-muted">⚡ Top Bowlers</p>
                  {wicketsData.slice(0, 3).map((p, i) => {
                    const pct = wicketsData[0]?.value > 0 ? (p.value / wicketsData[0].value) * 100 : 0;
                    return (
                      <div
                        key={p.fullName}
                        className="cursor-pointer group space-y-1"
                        onClick={() => openModal(p.fullName, 'Bowler')}
                        title={`View ${p.fullName} stats`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm leading-none w-5 flex-shrink-0">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-green-400 transition-colors truncate flex-1">
                            {p.fullName}
                          </span>
                          <span className="font-condensed font-black text-green-400 text-sm flex-shrink-0">{p.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-green-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Best SR with progress bars */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-icc-muted">💥 Best Strike Rates</p>
                  {srData.slice(0, 3).map((p, i) => {
                    const pct = srData[0]?.value > 0 ? (p.value / srData[0].value) * 100 : 0;
                    return (
                      <div
                        key={p.fullName}
                        className="cursor-pointer group space-y-1"
                        onClick={() => openModal(p.fullName, 'Batsman')}
                        title={`View ${p.fullName} stats`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm leading-none w-5 flex-shrink-0">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate flex-1">
                            {p.fullName}
                          </span>
                          <span className="font-condensed font-black text-blue-400 text-sm flex-shrink-0">{p.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ══ Top Performer hero cards ══ */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-icc-muted mb-5">
              🏆 Top Performers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PerformerCard
                delay={0} label="Highest Run Scorer" icon="🏏"
                name={topBatter?.striker}
                value={topBatter?.runs} unit="Runs"
                sub={`${topBatter?.balls ?? '—'} balls · SR ${topBatter?.strike_rate != null ? Number(topBatter.strike_rate).toFixed(1) : '—'}`}
                gradientFrom="#92620a" gradientTo="#1a1200"
                onClick={topBatter?.striker ? () => openModal(topBatter.striker, 'Batsman') : undefined}
              />
              <PerformerCard
                delay={0.08} label="Most Wickets" icon="⚡"
                name={topBowler?.bowler}
                value={topBowler?.wickets} unit="Wickets"
                sub={`Economy ${topBowler?.economy != null ? Number(topBowler.economy).toFixed(2) : '—'}`}
                gradientFrom="#0d5c2a" gradientTo="#0a1a10"
                onClick={topBowler?.bowler ? () => openModal(topBowler.bowler, 'Bowler') : undefined}
              />
              <PerformerCard
                delay={0.16} label="Best Strike Rate" icon="💥"
                name={srData[0]?.fullName}
                value={srData[0]?.value} unit="SR"
                sub="Fastest scoring rate"
                gradientFrom="#1e3a6e" gradientTo="#0a0f1e"
                onClick={srData[0]?.fullName ? () => openModal(srData[0].fullName, 'Batsman') : undefined}
              />
              <PerformerCard
                delay={0.24} label="Best Economy" icon="🎯"
                name={econData[0]?.fullName}
                value={econData[0]?.value} unit="Econ"
                sub="Runs conceded per over"
                gradientFrom="#3b1c6e" gradientTo="#0f0a1e"
                onClick={econData[0]?.fullName ? () => openModal(econData[0].fullName, 'Bowler') : undefined}
              />
            </div>
          </div>

          {/* ══ Dual bar charts (always visible) ══ */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-icc-muted mb-5">
              📊 Run Scorers &amp; Wicket Takers
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimCard delay={0}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-icc-gold text-lg" aria-hidden="true">🏏</span>
                  <p className="text-sm font-black uppercase tracking-wider text-white">Top Run Scorers</p>
                  <span className="ml-auto text-[10px] font-bold text-icc-muted border border-icc-border rounded-full px-2 py-0.5 uppercase tracking-wider">
                    Top 10
                  </span>
                </div>
                <p className="text-[10px] text-icc-muted mb-2">Click a bar to see full player stats</p>
                <ChartPanel
                  data={runsData} dataKey="value" unit="runs"
                  accentColor="#FFD700" height={300}
                  onBarClick={handleBarClick('Batsman')}
                />
              </AnimCard>

              <AnimCard delay={0.1}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-green-400 text-lg" aria-hidden="true">⚡</span>
                  <p className="text-sm font-black uppercase tracking-wider text-white">Top Wicket Takers</p>
                  <span className="ml-auto text-[10px] font-bold text-icc-muted border border-icc-border rounded-full px-2 py-0.5 uppercase tracking-wider">
                    Top 10
                  </span>
                </div>
                <p className="text-[10px] text-icc-muted mb-2">Click a bar to see full player stats</p>
                <ChartPanel
                  data={wicketsData} dataKey="value" unit="wickets"
                  accentColor="#4ADE80" height={300}
                  onBarClick={handleBarClick('Bowler')}
                />
              </AnimCard>
            </div>
          </div>

          {/* ══ Advanced stats (SR / Economy) ══ */}
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <p className="text-xs font-black uppercase tracking-widest text-icc-muted">
                📈 Advanced Stats
              </p>
              <div
                className="inline-flex gap-1 p-1.5 rounded-2xl border border-icc-border"
                style={{ background: 'rgba(10,14,35,0.7)' }}
                role="tablist"
                aria-label="Advanced stats tabs"
              >
                {Object.entries(extraCharts).map(([key, { label, icon }]) => (
                  <motion.button
                    key={key}
                    role="tab"
                    aria-selected={extraTab === key}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setExtraTab(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-200
                      ${extraTab === key
                        ? 'bg-icc-gold text-icc-dark shadow-md'
                        : 'text-icc-muted hover:text-white'}`}
                  >
                    {icon} {label}
                  </motion.button>
                ))}
              </div>
            </div>
            <AnimCard delay={0}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={extraTab + selectedTeam}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg" aria-hidden="true">{activeExtra.icon}</span>
                    <p className="text-sm font-black uppercase tracking-wider text-white">{activeExtra.label}</p>
                  </div>
                  <p className="text-[10px] text-icc-muted mb-3">Click a bar to see full player stats</p>
                  <ChartPanel
                    data={activeExtra.data}
                    dataKey="value"
                    unit={activeExtra.unit}
                    accentColor={activeExtra.color}
                    height={280}
                    onBarClick={handleBarClick(activeExtra.role)}
                  />
                </motion.div>
              </AnimatePresence>
            </AnimCard>
          </div>

          {/* ══ Quick stat ribbon ══ */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
          >
            {[
              { label: 'Top Score',   value: topBatter?.runs,    fullName: topBatter?.striker, sub: topBatter?.striker?.split(' ').pop(), icon: '🏏', color: 'text-icc-gold',    role: 'Batsman' },
              { label: 'Top Wickets', value: topBowler?.wickets, fullName: topBowler?.bowler,  sub: topBowler?.bowler?.split(' ').pop(),  icon: '⚡', color: 'text-green-400', role: 'Bowler'  },
              { label: 'Best SR',     value: srData[0]?.value,   fullName: srData[0]?.fullName, sub: srData[0]?.name,                    icon: '💥', color: 'text-blue-400',  role: 'Batsman' },
              { label: 'Best Econ',   value: econData[0]?.value, fullName: econData[0]?.fullName, sub: econData[0]?.name,                icon: '🎯', color: 'text-purple-400', role: 'Bowler' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => stat.fullName && openModal(stat.fullName, stat.role)}
                  className="glass-card rounded-2xl p-5 flex flex-col gap-3 h-full cursor-pointer"
                  title={stat.fullName ? `View ${stat.fullName} stats` : undefined}
                >
                  <motion.span
                    className="text-xl inline-block" aria-hidden="true"
                    whileHover={{ scale: 1.3, rotate: -5 }} transition={{ duration: 0.25 }}
                  >
                    {stat.icon}
                  </motion.span>
                  <div>
                    <p className={`font-condensed font-black text-3xl ${stat.color}`}>{stat.value ?? '—'}</p>
                    <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">{stat.label}</p>
                    <p className="text-[10px] text-icc-muted mt-0.5 truncate">{stat.sub ?? ''}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
});

AnalyticsSection.displayName = 'AnalyticsSection';
export default AnalyticsSection;
