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

const PlayersSection = ({ players = [] }) => {
  const [searchRaw,    setSearchRaw]    = useState('');
  const [roleFilter,   setRoleFilter]   = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchId = useId();
  const search   = useDebounce(searchRaw, 250);

  const handleRoleFilter = useCallback(r => { setRoleFilter(r); setVisibleCount(PAGE_SIZE); }, []);
  const handleSearch     = useCallback(v => { setSearchRaw(v);  setVisibleCount(PAGE_SIZE); }, []);

  const filtered = useMemo(() =>
    players.filter(p => {
      const roleOk   = roleFilter === 'All' || p.role === roleFilter;
      const searchOk = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.team?.toLowerCase().includes(search.toLowerCase());
      return roleOk && searchOk;
    })
  , [players, roleFilter, search]);

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

        {/* ── Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-icc-muted pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id={searchId}
              type="search"
              value={searchRaw}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name or team…"
              aria-label="Search players"
              className="w-full pl-10 pr-4 py-2.5 glass-card rounded-full text-sm text-white
                         placeholder-icc-muted outline-none focus:border-icc-gold/40
                         focus:ring-1 focus:ring-icc-gold/20 transition-colors"
            />
          </div>

          {/* Role filter pills */}
          <div role="group" aria-label="Filter by role" className="flex gap-2 flex-wrap">
            {ROLES.map(r => (
              <motion.button
                key={r}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleFilter(r)}
                aria-pressed={roleFilter === r}
                className={`filter-pill ${
                  roleFilter === r ? 'filter-pill-active' : ''
                }`}
              >
                {r}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Result count */}
        <p role="status" aria-live="polite" className="text-xs text-icc-muted mb-5">
          <span className="text-white font-semibold">{filtered.length}</span> player{filtered.length !== 1 ? 's' : ''}
          {roleFilter !== 'All' && <> · <span className="text-icc-gold">{roleFilter}</span></>}
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
              key={`${roleFilter}-${search}`}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((player, idx) => (
                  <motion.div
                    key={player.id ?? idx}
                    layout
                    variants={cardVariants}
                    exit={cardVariants.exit}
                  >
                    <PlayerCard player={player} />
                  </motion.div>
                ))}
              </AnimatePresence>
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
