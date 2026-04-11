import React, { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerCard from './PlayerCard';
import { useDebounce } from '../hooks';

const ROLES = ['All', 'Batsman', 'Bowler', 'All-rounder'];
const PAGE_SIZE = 10;

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ── Inline stat row used in the compare panel ── */
const CompareRow = ({ label, a, b, higherIsBetter = true }) => {
  const na  = parseFloat(a) || 0;
  const nb  = parseFloat(b) || 0;
  const max = Math.max(na, nb, 1);
  const aWins = higherIsBetter ? na > nb : (na > 0 && na < nb);
  const bWins = higherIsBetter ? nb > na : (nb > 0 && nb < na);
  const badge = 'text-[8px] font-black bg-icc-gold text-icc-dark px-1.5 py-0.5 rounded-full ml-1';
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2.5
                    border-b border-white/[0.05] last:border-0">
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center">
          <span className={`text-sm font-bold ${aWins ? 'text-icc-gold' : 'text-white/70'}`}>
            {a ?? '—'}
          </span>
          {aWins && <span className={badge}>BEST</span>}
        </div>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div className={`h-full rounded-full ${aWins ? 'bg-icc-gold' : 'bg-white/25'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((na / max) * 100, 100)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>
      <div className="text-[9px] text-icc-muted uppercase tracking-widest font-bold
                      text-center w-[72px] flex-shrink-0">{label}</div>
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center">
          <span className={`text-sm font-bold ${bWins ? 'text-icc-gold' : 'text-white/70'}`}>
            {b ?? '—'}
          </span>
          {bWins && <span className={badge}>BEST</span>}
        </div>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div className={`h-full rounded-full ${bWins ? 'bg-icc-gold' : 'bg-white/25'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((nb / max) * 100, 100)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
          />
        </div>
      </div>
    </div>
  );
};

const PlayersSection = ({ players = [] }) => {
  const [searchRaw,    setSearchRaw]    = useState('');
  const [roleFilter,   setRoleFilter]   = useState('All');
  const [teamFilter,   setTeamFilter]   = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [compareMode,  setCompareMode]  = useState(false);
  const [compareIds,   setCompareIds]   = useState([]);
  const searchId = useId();
  const search   = useDebounce(searchRaw, 250);

  const handleRoleFilter = useCallback(r => { setRoleFilter(r); setVisibleCount(PAGE_SIZE); }, []);
  const handleSearch     = useCallback(v => { setSearchRaw(v);  setVisibleCount(PAGE_SIZE); }, []);
  const handleTeamFilter = useCallback(v => { setTeamFilter(v); setVisibleCount(PAGE_SIZE); }, []);

  /* Unique sorted team list from player data */
  const teams = useMemo(() =>
    ['All', ...new Set(players.map(p => p.team).filter(Boolean).sort())]
  , [players]);

  /* Toggle compare mode — clear slots on exit */
  const toggleCompareMode = useCallback(() => {
    setCompareMode(m => !m);
    setCompareIds([]);
  }, []);

  /* Click a card in compare mode — max 2 slots, FIFO replace */
  const toggleCompareSlot = useCallback(id => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2)  return [prev[1], id];
      return [...prev, id];
    });
  }, []);

  const playerA = useMemo(() => players.find(p => p.id === compareIds[0]) || null, [players, compareIds]);
  const playerB = useMemo(() => players.find(p => p.id === compareIds[1]) || null, [players, compareIds]);

  /* Count category wins for verdict banner */
  const verdict = useMemo(() => {
    if (!playerA || !playerB) return null;
    const rows = [
      { a: playerA.runs,       b: playerB.runs,       higher: true  },
      { a: playerA.wickets,    b: playerB.wickets,    higher: true  },
      { a: playerA.strikeRate, b: playerB.strikeRate, higher: true  },
      { a: playerA.economy,    b: playerB.economy,    higher: false },
    ];
    let wa = 0, wb = 0;
    rows.forEach(({ a, b, higher }) => {
      const na = parseFloat(a) || 0, nb = parseFloat(b) || 0;
      if (na === nb) return;
      if (higher) { na > nb ? wa++ : wb++; }
      else { (na > 0 && na < nb) ? wa++ : wb++; }
    });
    if (wa === wb) return { draw: true };
    return { winner: wa > wb ? playerA : playerB, draw: false };
  }, [playerA, playerB]);

  const filtered = useMemo(() =>
    players.filter(p => {
      const roleOk   = roleFilter === 'All' || p.role === roleFilter;
      const teamOk   = teamFilter === 'All' || p.team === teamFilter;
      const searchOk = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.team?.toLowerCase().includes(search.toLowerCase());
      return roleOk && teamOk && searchOk;
    })
  , [players, roleFilter, teamFilter, search]);

  const visible   = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const remaining = filtered.length - visibleCount;

  return (
    <section className="bg-[#091526] py-16 border-b border-icc-border/40" id="players"
      aria-labelledby="players-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Leaderboard</p>
          <h2 id="players-heading"
            className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white">
            Featured <span className="text-icc-gold">Players</span>
          </h2>
          <div className="h-1 w-20 bg-icc-gold mx-auto mt-4" aria-hidden="true" />
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm">
            Top performers leading the charge at the World Cup
          </p>
        </motion.div>

        {/* ── Controls Row 1: Search · Team dropdown · Compare toggle ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-3 items-center mb-3"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icc-muted pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id={searchId} type="search"
              value={searchRaw}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name or team…"
              aria-label="Search players"
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-full text-sm text-white
                         placeholder-icc-muted outline-none focus:border-icc-gold/40
                         focus:ring-1 focus:ring-icc-gold/20 transition-colors"
            />
          </div>

          {/* Team dropdown */}
          <select
            value={teamFilter}
            onChange={e => handleTeamFilter(e.target.value)}
            aria-label="Filter by team"
            className="match-select"
          >
            {teams.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>
            ))}
          </select>

          {/* Compare mode toggle */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleCompareMode}
            aria-pressed={compareMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                        transition-all flex-shrink-0 border
                        ${compareMode
                          ? 'bg-icc-gold text-icc-dark border-icc-gold shadow-[0_0_16px_rgba(255,215,0,0.3)]'
                          : 'glass-card text-white border-white/10 hover:border-icc-gold/40'}`}
          >
            <span aria-hidden="true">⚖️</span>
            {compareMode ? 'Cancel Compare' : 'Compare Players'}
          </motion.button>
        </motion.div>

        {/* ── Controls Row 2: Role filter pills ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex gap-2 flex-wrap mb-5"
          role="group" aria-label="Filter by role"
        >
          {ROLES.map(r => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleFilter(r)}
              aria-pressed={roleFilter === r}
              className={`filter-pill ${roleFilter === r ? 'filter-pill-active' : ''}`}
            >
              {r}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Compare mode instruction banner ── */}
        <AnimatePresence>
          {compareMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl px-5 py-4 mb-6 flex flex-wrap items-center gap-4"
            >
              <p className="text-sm text-white/80 flex-1 min-w-[180px]">
                <span className="text-icc-gold font-bold">Compare mode</span>
                {' '}— click any 2 player cards to compare their stats.
              </p>
              {/* Slot indicators */}
              <div className="flex gap-3">
                {[0, 1].map(i => (
                  <div key={i}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold
                      transition-colors ${compareIds[i]
                        ? 'border-icc-gold/50 bg-icc-gold/10 text-icc-gold'
                        : 'border-white/10 text-white/30'}`}
                  >
                    {compareIds[i] ? (
                      <>
                        <span>{players.find(p => p.id === compareIds[i])?.name?.split(' ').slice(-1)[0]}</span>
                        <button
                          onClick={() => setCompareIds(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-white/50 hover:text-white transition-colors leading-none"
                          aria-label="Remove player from comparison"
                        >✕</button>
                      </>
                    ) : `Slot ${i + 1}`}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result count */}
        <p role="status" aria-live="polite" className="text-xs text-icc-muted mb-5">
          <span className="text-white font-semibold">{filtered.length}</span> player{filtered.length !== 1 ? 's' : ''}
          {roleFilter !== 'All' && <> · <span className="text-icc-gold">{roleFilter}</span></>}
          {teamFilter !== 'All' && <> · <span className="text-icc-gold">{teamFilter}</span></>}
          {search && <> · matching <span className="text-icc-gold">"{search}"</span></>}
        </p>

        {/* ── Player grid ── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-2xl py-20 text-center"
            >
              <p className="text-4xl mb-3">👤</p>
              <p className="text-icc-muted text-sm">
                No players found{search ? ` for "${search}"` : ''}.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${roleFilter}-${teamFilter}-${search}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((player, idx) => {
                  const isSelected = compareIds.includes(player.id);
                  const slotNum    = compareIds.indexOf(player.id) + 1;
                  return (
                    <motion.div
                      key={player.id ?? idx}
                      layout
                      variants={cardVariants}
                      exit={cardVariants.exit}
                      onClick={compareMode ? () => toggleCompareSlot(player.id) : undefined}
                      className={compareMode ? 'cursor-pointer' : ''}
                    >
                      <div className="relative">
                        <PlayerCard player={player} index={idx} />

                        {/* Selection overlay in compare mode */}
                        <AnimatePresence>
                          {compareMode && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`absolute inset-0 rounded-2xl pointer-events-none transition-all duration-200
                                ${isSelected
                                  ? 'ring-2 ring-icc-gold ring-offset-1 ring-offset-[#091526] bg-icc-gold/[0.08]'
                                  : 'ring-1 ring-white/5'}`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-icc-gold rounded-full
                                                flex items-center justify-center text-xs font-black text-icc-dark
                                                shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                                  {slotNum}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Inline comparison panel — slides in when 2 players are selected ── */}
        <AnimatePresence>
          {compareMode && playerA && playerB && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 backdrop-blur-lg bg-white/[0.06] border border-white/10
                         rounded-3xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.45)]
                         max-w-2xl mx-auto"
            >
              {/* VS header */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-6">
                <div className="text-right">
                  <p className="font-condensed font-black text-lg text-white leading-tight truncate">
                    {playerA.name}
                  </p>
                  <p className="text-[10px] text-icc-muted mt-0.5">{playerA.team}</p>
                  <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full
                    ${playerA.role === 'Batsman' ? 'bg-blue-500/20 text-blue-300' :
                      playerA.role === 'Bowler'  ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-amber-500/20 text-amber-300'}`}>
                    {playerA.role}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-6 bg-icc-gold/30" />
                  <span className="font-condensed font-black text-xl text-icc-gold">VS</span>
                  <div className="w-px h-6 bg-icc-gold/30" />
                </div>
                <div className="text-left">
                  <p className="font-condensed font-black text-lg text-white leading-tight truncate">
                    {playerB.name}
                  </p>
                  <p className="text-[10px] text-icc-muted mt-0.5">{playerB.team}</p>
                  <span className={`inline-block mt-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full
                    ${playerB.role === 'Batsman' ? 'bg-blue-500/20 text-blue-300' :
                      playerB.role === 'Bowler'  ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-amber-500/20 text-amber-300'}`}>
                    {playerB.role}
                  </span>
                </div>
              </div>

              {/* Stat comparison rows */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-2">
                <CompareRow label="Runs"        a={playerA.runs}       b={playerB.runs}       higherIsBetter={true} />
                <CompareRow label="Wickets"     a={playerA.wickets}    b={playerB.wickets}    higherIsBetter={true} />
                <CompareRow label="Strike Rate" a={playerA.strikeRate} b={playerB.strikeRate} higherIsBetter={true} />
                <CompareRow label="Economy"     a={playerA.economy}    b={playerB.economy}    higherIsBetter={false} />
              </div>

              {/* Overall verdict */}
              {verdict && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.35 }}
                  className={`mt-5 rounded-2xl px-5 py-3 text-center font-bold text-sm border
                    ${verdict.draw
                      ? 'bg-white/5 border-white/10 text-white/60'
                      : 'bg-icc-gold/10 border-icc-gold/30 text-icc-gold'}`}
                >
                  {verdict.draw
                    ? '🤝 Evenly matched — it\'s a draw'
                    : `🏆 ${verdict.winner.name} wins overall`}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Load more / Show less ── */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mt-10 gap-3"
          >
            {remaining > 0 && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="btn-outline-gold px-6 py-2.5 text-sm rounded-full font-semibold
                           tracking-wide"
              >
                Load {Math.min(remaining, PAGE_SIZE)} more
              </motion.button>
            )}
            {visibleCount > PAGE_SIZE && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="text-icc-muted text-sm hover:text-white transition-colors"
              >
                Show less
              </motion.button>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
};
export default PlayersSection;
