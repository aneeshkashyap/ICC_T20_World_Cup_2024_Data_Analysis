import React, { useState, useCallback, useMemo, memo } from 'react';
import { getFlag } from '../utils';
import { StatsTableSkeleton, EmptyState } from './Skeletons';

/* ─── Helpers ─── */
const srColor   = sr  => sr >= 150 ? 'text-green-400 font-bold' : sr >= 120 ? 'text-amber-400 font-bold' : 'text-white';
const econColor = e   => e <= 5   ? 'text-green-300 font-bold'  : e <= 7   ? 'text-green-400' : e <= 9 ? 'text-amber-400' : 'text-red-400';

/* ─── MedalIcon ─── */
const MedalIcon = memo(({ rank }) => {
  if (rank === 1) return <span aria-label="Gold medal">🥇</span>;
  if (rank === 2) return <span aria-label="Silver medal">🥈</span>;
  if (rank === 3) return <span aria-label="Bronze medal">🥉</span>;
  return <span className="text-xs font-bold text-icc-muted" aria-label={`Rank ${rank}`}>{rank}</span>;
});

/* ─── ProgressBar ─── */
const ProgressBar = memo(({ value, max, color = 'bg-icc-gold', label }) => (
  <div
    className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden"
    role="meter"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
    aria-label={label}
  >
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${max ? Math.round((value / max) * 100) : 0}%` }}
    />
  </div>
));

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

/* ─── Batting table ─── */
const BattingTable = memo(({ batters, loading }) => {
  const [sortKey,  setSortKey]  = useState('runs');
  const [sortDir,  setSortDir]  = useState('desc');

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
      <table className="w-full" aria-label="Top batters leaderboard">
        <thead>
          <tr>
            <th scope="col" className="th-cell w-9 text-center" aria-label="Rank">#</th>
            <th scope="col" className="th-cell">Batter</th>
            <th scope="col" className="th-cell">Team</th>
            <SortTh col="runs"         label="Runs"  sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="balls"        label="Balls" sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="fours"        label="4s"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="sixes"        label="6s"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="strike_rate"  label="SR"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <th scope="col" className="th-cell" aria-label="Relative performance">
              <span className="sr-only">Bar chart</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b, idx) => {
            const sr = b.strike_rate ?? b.strikeRate;
            return (
              <tr key={b.striker || idx} className="hover:bg-white/[0.03] transition-colors">
                <td className="td-cell text-center" headers="rank">
                  <MedalIcon rank={idx + 1} />
                </td>
                <td className="td-cell font-semibold text-white">{b.striker}</td>
                <td className="td-cell"><TeamCell team={b.team} /></td>
                <td className="td-cell text-center font-bold text-icc-gold text-base"
                   aria-label={`${b.runs} runs`}>{b.runs}</td>
                <td className="td-cell text-center text-icc-muted">{b.balls}</td>
                <td className="td-cell text-center font-semibold text-green-400">{b.fours}</td>
                <td className="td-cell text-center font-semibold text-blue-400">{b.sixes}</td>
                <td className={`td-cell text-center text-xs ${srColor(sr)}`}
                   aria-label={`Strike rate ${Number(sr ?? 0).toFixed(1)}`}>
                  {sr != null ? Number(sr).toFixed(1) : '—'}
                </td>
                <td className="td-cell">
                  <ProgressBar value={b.runs || 0} max={maxRuns} color="bg-icc-gold"
                    label={`${b.runs} runs out of max ${maxRuns}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

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
      <table className="w-full" aria-label="Top bowlers leaderboard">
        <thead>
          <tr>
            <th scope="col" className="th-cell w-9 text-center" aria-label="Rank">#</th>
            <th scope="col" className="th-cell">Bowler</th>
            <th scope="col" className="th-cell">Team</th>
            <SortTh col="wickets"  label="Wkts"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="overs"    label="Overs"   sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="runs_given" label="Runs"  sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="dots"     label="Dots"    sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <SortTh col="economy"  label="Economy" sortKey={sortKey} direction={sortDir} onSort={handleSort} />
            <th scope="col" className="th-cell">
              <span className="sr-only">Bar chart</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((b, idx) => (
            <tr key={b.bowler || idx} className="hover:bg-white/[0.03] transition-colors">
              <td className="td-cell text-center"><MedalIcon rank={idx + 1} /></td>
              <td className="td-cell font-semibold text-white">{b.bowler}</td>
              <td className="td-cell"><TeamCell team={b.team} /></td>
              <td className="td-cell text-center font-bold text-green-400 text-base"
                 aria-label={`${b.wickets} wickets`}>{b.wickets}</td>
              <td className="td-cell text-center text-icc-muted">{b.overs}</td>
              <td className="td-cell text-center text-icc-muted">{b.runs_given}</td>
              <td className="td-cell text-center text-icc-muted">{b.dots ?? '—'}</td>
              <td className={`td-cell text-center text-xs ${econColor(b.economy)}`}
                 aria-label={`Economy ${Number(b.economy ?? 0).toFixed(2)}`}>
                {b.economy != null ? Number(b.economy).toFixed(2) : '—'}
              </td>
              <td className="td-cell">
                <ProgressBar value={b.wickets || 0} max={maxWkts} color="bg-green-500"
                  label={`${b.wickets} wickets out of max ${maxWkts}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ─── StatsSection ─── */
const StatsSection = memo(({ batters = [], bowlers = [], loading = false }) => {
  const [tab, setTab] = useState('batting');

  return (
    <section
      id="stats"
      className="py-14 bg-icc-navy border-t border-icc-border"
      aria-labelledby="stats-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <p className="section-label" aria-hidden="true">Leaderboards</p>
          <h2 id="stats-heading" className="section-title">Tournament Statistics</h2>
          <div className="accent-bar" aria-hidden="true" />
        </div>

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
              className={`tab-btn ${tab === key ? 'tab-btn-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panels */}
        <div
          id={`panel-batting`}
          role="tabpanel"
          aria-labelledby="tab-batting"
          hidden={tab !== 'batting'}
          className="card-base rounded-xl overflow-hidden"
        >
          <BattingTable batters={batters} loading={loading} />
        </div>
        <div
          id={`panel-bowling`}
          role="tabpanel"
          aria-labelledby="tab-bowling"
          hidden={tab !== 'bowling'}
          className="card-base rounded-xl overflow-hidden"
        >
          <BowlingTable bowlers={bowlers} loading={loading} />
        </div>
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';
export default StatsSection;
