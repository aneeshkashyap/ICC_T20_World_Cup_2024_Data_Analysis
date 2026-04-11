import React, { useState, useCallback, useMemo, useId, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchCard, { ListMatchCard } from './MatchCard';
import MatchModal from './MatchModal';
import { useDebounce } from '../hooks';

const TYPES = ['All', 'Group', 'Semi Final', 'Final'];
const shortTeam = t => t.replace('United States of America', 'USA').replace('Papua New Guinea', 'PNG');

/* Skeleton card */
const MatchSkeleton = () => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <div className="h-[2px] skeleton" />
    <div className="p-6 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="skeleton w-14 h-10 rounded-xl" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="skeleton h-4 w-6 rounded" />
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="skeleton w-14 h-10 rounded-xl" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
      <div className="skeleton h-8 w-full rounded-xl" />
    </div>
  </div>
);

const MatchesGrid = memo(({ matches = [], loading = false, error = null }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [filter,        setFilter]        = useState('All');
  const [searchRaw,     setSearchRaw]     = useState('');
  const [visibleCount,  setVisibleCount]  = useState(9);
  const [viewMode,      setViewMode]      = useState('grid'); // 'grid' | 'list'
  const [teamFilter,    setTeamFilter]    = useState('All');

  const searchId = useId();
  const search   = useDebounce(searchRaw, 250);

  const handleFilter     = useCallback(v => { setFilter(v); setVisibleCount(9); }, []);
  const handleSearch     = useCallback(v => { setSearchRaw(v); setVisibleCount(9); }, []);
  const handleLoadMore   = useCallback(() => setVisibleCount(v => v + 9), []);
  const handleClose      = useCallback(() => setSelectedMatch(null), []);
  const handleTeamFilter = useCallback(v => { setTeamFilter(v); setVisibleCount(9); }, []);

  const teams = useMemo(() =>
    ['All', ...new Set([...matches.map(m => m.team1), ...matches.map(m => m.team2)].sort())]
  , [matches]);

  const filtered = useMemo(() =>
    matches.filter(m => {
      const typeOk   = filter === 'All' || m.match_type === filter;
      const teamOk   = teamFilter === 'All' || m.team1 === teamFilter || m.team2 === teamFilter;
      const searchOk = !search || [m.team1, m.team2, m.venue, m.city, m.player_of_match]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()));
      return typeOk && teamOk && searchOk;
    })
  , [matches, filter, teamFilter, search]);

  const visible   = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const remaining = filtered.length - visibleCount;

  return (
    <section id="matches" className="py-4 pb-16" aria-labelledby="matches-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3 mb-6"
        >
          {/* Row 1: Search + view toggle */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icc-muted pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id={searchId} type="search"
                value={searchRaw}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by team, city, venue or player…"
                className="w-full pl-10 pr-4 py-2.5 glass-card rounded-full text-sm text-white
                           placeholder-icc-muted outline-none focus:border-icc-gold/40
                           focus:ring-1 focus:ring-icc-gold/20 transition-colors"
              />
            </div>

            {/* View toggle */}
            <div role="group" aria-label="Toggle view mode" className="flex rounded-xl overflow-hidden border border-icc-border/60">
              {[
                { mode: 'grid', icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )},
                { mode: 'list', icon: (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )},
              ].map(({ mode, icon }) => (
                <motion.button
                  key={mode}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  aria-label={`${mode} view`}
                  className={`px-3 py-2 transition-all duration-150 text-xs
                    ${viewMode === mode
                      ? 'bg-icc-gold text-icc-dark font-bold'
                      : 'bg-transparent text-icc-muted hover:text-white'}`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Row 2: Type filter pills + Team dropdown */}
          <div className="flex flex-wrap gap-2 items-center">
            <div role="group" aria-label="Filter by match type" className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <motion.button key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFilter(t)}
                  aria-pressed={filter === t}
                  className={`filter-pill ${filter === t ? 'filter-pill-active' : ''}`}>
                  {t}
                </motion.button>
              ))}
            </div>

            {/* Team filter dropdown */}
            <select
              value={teamFilter}
              onChange={e => handleTeamFilter(e.target.value)}
              aria-label="Filter by team"
              className="match-select"
            >
              {teams.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Teams' : shortTeam(t)}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Count */}
        <p role="status" aria-live="polite" className="text-xs text-icc-muted mb-5">
          <span className="text-white font-semibold">{filtered.length}</span> match{filtered.length !== 1 ? 'es' : ''}
          {teamFilter !== 'All' && <> · <span className="text-icc-gold">{shortTeam(teamFilter)}</span></>}
          {search && <> · Filtered by <span className="text-icc-gold">"{search}"</span></>}
        </p>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <MatchSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div role="alert" className="glass-card rounded-2xl py-16 text-center">
            <p className="text-sm text-icc-muted">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card rounded-2xl py-20 text-center"
          >
            <p className="text-4xl mb-3">🏏</p>
            <p className="text-icc-muted text-sm">No matches found{search ? ` for "${search}"` : ''}.</p>
          </motion.div>
        )}

        {/* Grid / List */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.ol
                  key="grid"
                  layout
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0"
                  aria-label={`${visible.length} of ${filtered.length} matches`}
                >
                  <AnimatePresence mode="popLayout">
                    {visible.map((match, idx) => (
                      <motion.li key={match.match_num} layout
                        variants={{ hidden: { opacity: 0, y: 28, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}
                        exit={{ opacity: 0, scale: 0.95 }}>
                        <MatchCard match={match} onClick={setSelectedMatch} index={idx} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ol>
              ) : (
                <motion.ol
                  key="list"
                  layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5 list-none p-0"
                  aria-label={`${visible.length} of ${filtered.length} matches`}
                >
                  <AnimatePresence mode="popLayout">
                    {visible.map((match, idx) => (
                      <motion.li key={match.match_num} layout exit={{ opacity: 0, x: -16 }}>
                        <ListMatchCard match={match} onClick={setSelectedMatch} index={idx} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ol>
              )}
            </AnimatePresence>

            {remaining > 0 && (
              <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={handleLoadMore}
                  className="btn-outline-gold"
                >
                  Load more ({remaining} remaining)
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {selectedMatch && <MatchModal match={selectedMatch} onClose={handleClose} />}
    </section>
  );
});

MatchesGrid.displayName = 'MatchesGrid';
export default MatchesGrid;
