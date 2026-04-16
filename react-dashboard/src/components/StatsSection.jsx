import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlag } from '../utils';
import { StatsTableSkeleton, EmptyState } from './Skeletons';

/* ─── Row animation variants ─── */
const rowVars = {
  hidden: { opacity: 0, x: -16 },
  show: i => ({
    opacity: 1, x: 0,
    transition: { duration: 0.38, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] },
  }),
};

const tableVars = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25 } },
  exit:   { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

/* ─── Helpers ─── */
const srColor   = sr => sr >= 150 ? 'text-green-400 font-bold' : sr >= 120 ? 'text-amber-400 font-bold' : 'text-white';
const econColor = e  => e <= 5   ? 'text-green-300 font-bold'  : e <= 7   ? 'text-green-400' : e <= 9 ? 'text-amber-400' : 'text-red-400';

/* ─── MedalIcon ─── */
const MedalIcon = memo(({ rank }) => {
  if (rank === 1) return <span aria-label="Gold medal">🥇</span>;
  if (rank === 2) return <span aria-label="Silver medal">🥈</span>;
  if (rank === 3) return <span aria-label="Bronze medal">🥉</span>;
  return <span className="text-xs font-bold text-icc-muted" aria-label={`Rank ${rank}`}>{rank}</span>;
});
MedalIcon.displayName = 'MedalIcon';

/* ─── ProgressBar (animated on mount) ─── */
const ProgressBar = memo(({ value, max, color = 'bg-icc-gold', label, isTop }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <motion.div
        className={`h-full rounded-full ${color}`}
        style={isTop ? { boxShadow: `0 0 8px rgba(255,215,0,0.6)` } : {}}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

/* ─── TeamCell ─── */
const TeamCell = memo(({ team }) => {
  const [flagFailed, setFlagFailed] = useState(false);
  const flagSrc = getFlag(team || '');
  return (
    <div className="flex items-center gap-1.5">
      {!flagFailed && flagSrc && (
        <img
          src={flagSrc}
          alt={`${team} flag`}
          className="w-4 h-3 object-cover rounded-sm flex-shrink-0"
          loading="lazy"
          decoding="async"
          onError={() => setFlagFailed(true)}
          width={16}
          height={12}
        />
      )}
      <span className="text-xs text-icc-muted font-medium truncate max-w-[80px]">
        {team || '—'}
      </span>
    </div>
  );
});
TeamCell.displayName = 'TeamCell';

/* ─── Sortable column header ─── */
const SortTh = memo(({ col, label, sortKey, direction, onSort }) => {
  const isActive = sortKey === col;
  return (
    <th scope="col" className="th-cell">
      <button
        onClick={() => onSort(col)}
        className={`flex items-center gap-1 group transition-colors ${isActive ? 'text-icc-gold' : 'text-icc-muted hover:text-white'}`}
        aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        {label}
        <span
          className={`text-[9px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
          aria-hidden="true"
        >
          {isActive && direction === 'asc' ? '▲' : '▼'}
        </span>
      </button>
    </th>
  );
});
SortTh.displayName = 'SortTh';

/* ─── TopPerformerGlow (gold halo behind rank-1 row) ─── */
const TopGlowRow = ({ isTop, children, accent = 'rgba(255,215,0,0.07)' }) => (
  <div className="relative">
    {isTop && (
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, transparent 80%)`,
          boxShadow: `inset 2px 0 0 rgba(255,215,0,0.35)`,
        }}
        aria-hidden="true"
      />
    )}
    {children}
  </div>
);

/* ─── Batting table ─── */
const BattingTable = memo(({ batters, loading }) => {
  const [sortKey, setSortKey] = useState('runs');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = useCallback(col => {
    setSortDir(d => (sortKey === col ? (d === 'desc' ? 'asc' : 'desc') : 'desc'));
    setSortKey(col);
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!batters.length) return [];
    return [...batters].sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [batters, sortKey, sortDir]);

  const maxRuns = useMemo(() => Math.max(...batters.map(b => b.runs || 0), 1), [batters]);

  if (loading) return <StatsTableSkeleton />;
  if (!batters.length) return <EmptyState message="No batting data available." icon="🏏" />;

  return (
    <div className="overflow-x-auto" role="region" aria-label="Top batting performances">
      <AnimatePresence mode="wait">
        <motion.table
          key={`${sortKey}-${sortDir}`}
          className="w-full"
          aria-label="Top batters leaderboard"
          variants={tableVars}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <thead>
            <tr>
              <th scope="col" className="th-cell w-9 text-center" aria-label="Rank">#</th>
              <th scope="col" className="th-cell">Batter</th>
              <th scope="col" className="th-cell">Team</th>
              <SortTh col="runs"        label="Runs"  sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="balls"       label="Balls" sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="fours"       label="4s"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="sixes"       label="6s"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="strike_rate" label="SR"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <th scope="col" className="th-cell" aria-label="Relative performance">
                <span className="sr-only">Bar chart</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b, idx) => {
              const sr    = b.strike_rate ?? b.strikeRate;
              const isTop = idx === 0;
              return (
                <motion.tr
                  key={b.striker || idx}
                  custom={idx}
                  variants={rowVars}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-20px' }}
                  className={`transition-colors group ${
                    isTop
                      ? 'bg-gradient-to-r from-icc-gold/[0.06] to-transparent'
                      : 'hover:bg-white/[0.03]'
                  }`}
                  style={isTop ? { boxShadow: 'inset 2px 0 0 rgba(255,215,0,0.4)' } : {}}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <td className="td-cell text-center" headers="rank">
                    <MedalIcon rank={idx + 1} />
                  </td>
                  <td className="td-cell font-semibold text-white">
                    <span className={isTop ? 'text-gold-glow' : ''}>{b.striker}</span>
                    {isTop && (
                      <span className="ml-2 text-[8px] font-black uppercase tracking-widest
                                       px-1.5 py-0.5 rounded-full bg-icc-gold/15 text-icc-gold
                                       border border-icc-gold/25">
                        Leader
                      </span>
                    )}
                  </td>
                  <td className="td-cell"><TeamCell team={b.team} /></td>
                  <td
                    className={`td-cell text-center font-bold text-base ${isTop ? 'text-icc-gold' : 'text-icc-gold/80'}`}
                    aria-label={`${b.runs} runs`}
                  >
                    {b.runs}
                  </td>
                  <td className="td-cell text-center text-icc-muted">{b.balls}</td>
                  <td className="td-cell text-center font-semibold text-green-400">{b.fours}</td>
                  <td className="td-cell text-center font-semibold text-blue-400">{b.sixes}</td>
                  <td
                    className={`td-cell text-center text-xs ${srColor(sr)}`}
                    aria-label={`Strike rate ${Number(sr ?? 0).toFixed(1)}`}
                  >
                    {sr != null ? Number(sr).toFixed(1) : '—'}
                  </td>
                  <td className="td-cell">
                    <ProgressBar
                      value={b.runs || 0}
                      max={maxRuns}
                      color={isTop ? 'bg-gradient-to-r from-amber-400 to-icc-gold' : 'bg-icc-gold/60'}
                      isTop={isTop}
                      label={`${b.runs} runs out of max ${maxRuns}`}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </motion.table>
      </AnimatePresence>
    </div>
  );
});
BattingTable.displayName = 'BattingTable';

/* ─── Bowling table ─── */
const BowlingTable = memo(({ bowlers, loading }) => {
  const [sortKey, setSortKey] = useState('wickets');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = useCallback(col => {
    setSortDir(d => (sortKey === col ? (d === 'desc' ? 'asc' : 'desc') : 'desc'));
    setSortKey(col);
  }, [sortKey]);

  const sorted = useMemo(() => {
    if (!bowlers.length) return [];
    return [...bowlers].sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [bowlers, sortKey, sortDir]);

  const maxWkts = useMemo(() => Math.max(...bowlers.map(b => b.wickets || 0), 1), [bowlers]);

  if (loading) return <StatsTableSkeleton />;
  if (!bowlers.length) return <EmptyState message="No bowling data available." icon="⚡" />;

  return (
    <div className="overflow-x-auto" role="region" aria-label="Top bowling performances">
      <AnimatePresence mode="wait">
        <motion.table
          key={`${sortKey}-${sortDir}`}
          className="w-full"
          aria-label="Top bowlers leaderboard"
          variants={tableVars}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          <thead>
            <tr>
              <th scope="col" className="th-cell w-9 text-center" aria-label="Rank">#</th>
              <th scope="col" className="th-cell">Bowler</th>
              <th scope="col" className="th-cell">Team</th>
              <SortTh col="wickets"    label="Wkts"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="overs"      label="Overs"   sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="runs_given" label="Runs"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="dots"       label="Dots"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <SortTh col="economy"    label="Economy" sortKey={sortKey} direction={sortDir} onSort={handleSort} />
              <th scope="col" className="th-cell">
                <span className="sr-only">Bar chart</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b, idx) => {
              const isTop = idx === 0;
              return (
                <motion.tr
                  key={b.bowler || idx}
                  custom={idx}
                  variants={rowVars}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-20px' }}
                  className={`transition-colors group ${
                    isTop
                      ? 'bg-gradient-to-r from-emerald-400/[0.06] to-transparent'
                      : 'hover:bg-white/[0.03]'
                  }`}
                  style={isTop ? { boxShadow: 'inset 2px 0 0 rgba(52,211,153,0.4)' } : {}}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <td className="td-cell text-center"><MedalIcon rank={idx + 1} /></td>
                  <td className="td-cell font-semibold text-white">
                    <span className={isTop ? 'drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' : ''}>{b.bowler}</span>
                    {isTop && (
                      <span className="ml-2 text-[8px] font-black uppercase tracking-widest
                                       px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400
                                       border border-emerald-500/25">
                        Leader
                      </span>
                    )}
                  </td>
                  <td className="td-cell"><TeamCell team={b.team} /></td>
                  <td
                    className={`td-cell text-center font-bold text-base ${isTop ? 'text-emerald-400' : 'text-green-400/80'}`}
                    aria-label={`${b.wickets} wickets`}
                  >
                    {b.wickets}
                  </td>
                  <td className="td-cell text-center text-icc-muted">{b.overs}</td>
                  <td className="td-cell text-center text-icc-muted">{b.runs_given}</td>
                  <td className="td-cell text-center text-icc-muted">{b.dots ?? '—'}</td>
                  <td
                    className={`td-cell text-center text-xs ${econColor(b.economy)}`}
                    aria-label={`Economy ${Number(b.economy ?? 0).toFixed(2)}`}
                  >
                    {b.economy != null ? Number(b.economy).toFixed(2) : '—'}
                  </td>
                  <td className="td-cell">
                    <ProgressBar
                      value={b.wickets || 0}
                      max={maxWkts}
                      color={isTop ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-green-500/60'}
                      isTop={isTop}
                      label={`${b.wickets} wickets out of max ${maxWkts}`}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </motion.table>
      </AnimatePresence>
    </div>
  );
});
BowlingTable.displayName = 'BowlingTable';

/* ─── Animated background orbs ─── */
const BackgroundOrbs = memo(() => (
  <>
    <motion.div
      className="absolute top-20 left-[-80px] w-72 h-72 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }}
      animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
    <motion.div
      className="absolute bottom-10 right-[-60px] w-56 h-56 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }}
      animate={{ x: [0, -15, 0], y: [0, 10, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      aria-hidden="true"
    />
  </>
));
BackgroundOrbs.displayName = 'BackgroundOrbs';

/* ─── StatsSection ─── */
const StatsSection = memo(({ batters = [], bowlers = [], loading = false }) => {
  const [tab, setTab] = useState('batting');

  return (
    <section
      id="stats"
      className="relative py-14 bg-icc-navy border-t border-icc-border overflow-hidden"
      aria-labelledby="stats-heading"
    >
      <BackgroundOrbs />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="section-label" aria-hidden="true">Leaderboards</p>
          <h2 id="stats-heading" className="section-title">Tournament Statistics</h2>
          <div className="accent-bar" aria-hidden="true" />
        </motion.div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Statistics view"
          className="flex border-b border-icc-border mb-4 w-fit"
        >
          {[['batting', '🏏 Top Batters'], ['bowling', '⚡ Top Bowlers']].map(([key, label]) => (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              className={`tab-btn ${tab === key ? 'tab-btn-active' : ''} relative`}
            >
              {label}
              {tab === key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-icc-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Panels with smooth tab transitions */}
        <AnimatePresence mode="wait">
          {tab === 'batting' && (
            <motion.div
              key="batting"
              id="panel-batting"
              role="tabpanel"
              aria-labelledby="tab-batting"
              className="card-base rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <BattingTable batters={batters} loading={loading} />
            </motion.div>
          )}
          {tab === 'bowling' && (
            <motion.div
              key="bowling"
              id="panel-bowling"
              role="tabpanel"
              aria-labelledby="tab-bowling"
              className="card-base rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <BowlingTable bowlers={bowlers} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';
export default StatsSection;
