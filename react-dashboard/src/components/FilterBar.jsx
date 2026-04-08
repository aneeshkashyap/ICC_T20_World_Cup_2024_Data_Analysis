import React from 'react';

const ROLES = ['All', 'Batsman', 'Bowler', 'All-rounder'];

const FilterBar = ({ teams = [], selectedTeam, selectedRole, search, onTeamChange, onRoleChange, onSearch }) => (
  <div className="flex flex-col gap-3 pb-4">
    {/* Search */}
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-icc-muted"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search player or team..."
        className="w-full pl-8 pr-4 py-2 bg-icc-card border border-icc-border rounded-lg text-sm text-white placeholder-icc-muted outline-none focus:border-icc-gold/40 transition-colors"
      />
    </div>

    {/* Team filter */}
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold text-icc-muted uppercase tracking-widest mr-1">Team</span>
      {['All Teams', ...teams].map(team => (
        <button
          key={team}
          onClick={() => onTeamChange(team)}
          className={`filter-pill ${selectedTeam === team ? 'filter-pill-active' : ''}`}
        >
          {team}
        </button>
      ))}
    </div>

    {/* Role filter */}
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold text-icc-muted uppercase tracking-widest mr-1">Role</span>
      {ROLES.map(role => (
        <button
          key={role}
          onClick={() => onRoleChange(role)}
          className={`filter-pill ${selectedRole === role ? 'filter-pill-active' : ''}`}
        >
          {role}
        </button>
      ))}
    </div>
  </div>
);

export default FilterBar;
