import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = ['All', 'Batsman', 'Bowler', 'All-rounder'];

const FilterBar = ({ teams = [], selectedTeam, selectedRole, search, onTeamChange, onRoleChange, onSearch }) => {
  const hasActiveFilters = search || selectedTeam !== 'All Teams' || selectedRole !== 'All';

  const clearAll = () => {
    onSearch('');
    onTeamChange('All Teams');
    onRoleChange('All');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-3 pb-4"
    >
      {/* Search + Team dropdown row */}
      <div className="flex gap-3 flex-wrap sm:flex-nowrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-icc-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search player or team..."
            aria-label="Search players"
            className="w-full pl-8 pr-8 py-2 bg-icc-card border border-icc-border rounded-lg
                       text-sm text-white placeholder-icc-muted outline-none
                       focus:border-icc-gold/40 focus:ring-1 focus:ring-icc-gold/20
                       transition-all duration-200"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => onSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-icc-muted
                           hover:text-white transition-colors rounded-full p-0.5
                           hover:bg-white/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Team dropdown */}
        <div className="relative min-w-[160px] sm:min-w-[200px]">
          <label htmlFor="team-filter" className="sr-only">Filter by team</label>
          <select
            id="team-filter"
            value={selectedTeam}
            onChange={e => onTeamChange(e.target.value)}
            className="w-full appearance-none bg-icc-card border border-icc-border text-white
                       text-sm rounded-lg px-3 py-2 pr-8 outline-none
                       focus:border-icc-gold/40 focus:ring-1 focus:ring-icc-gold/20
                       transition-all duration-200 cursor-pointer"
          >
            <option className="bg-[#080f1e]" value="All Teams">🌍 All Teams</option>
            {teams.map(team => (
              <option key={team} value={team} className="bg-[#080f1e]">{team}</option>
            ))}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-icc-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Role pills + clear all */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-icc-muted uppercase tracking-widest mr-1">Role</span>
        {ROLES.map(role => (
          <motion.button
            key={role}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onRoleChange(role)}
            className={`filter-pill ${selectedRole === role ? 'filter-pill-active' : ''}`}
          >
            {role}
          </motion.button>
        ))}

        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={clearAll}
              aria-label="Clear all filters"
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-red-500/10 border border-red-500/20 text-red-400
                         text-[10px] font-bold uppercase tracking-wider
                         hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FilterBar;

