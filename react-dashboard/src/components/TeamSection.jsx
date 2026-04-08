import React from 'react';
import PlayerCard from './PlayerCard';

const TeamSection = ({ teamName, teamFlag, players = [] }) => {
  if (!players.length) return null;

  return (
    <div className="mb-10">
      {/* Team header */}
      <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-icc-border">
        <div className="flex items-center gap-3">
          {teamFlag && (
            <img
              src={teamFlag}
              alt={teamName}
              className="w-9 h-6 object-cover rounded border border-white/10 shadow-card flex-shrink-0"
              onError={e => e.target.style.display = 'none'}
            />
          )}
          <div>
            <h3 className="font-condensed font-extrabold text-xl text-white uppercase tracking-wide leading-none">
              {teamName}
            </h3>
            <p className="text-xs text-icc-muted mt-0.5">
              {players.length} player{players.length !== 1 ? 's' : ''} in leaderboard
            </p>
          </div>
        </div>
        <span className="badge badge-blue">{players.length}</span>
      </div>

      {/* Player grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {players.map((player, idx) => (
          <PlayerCard key={player.id || idx} player={player} />
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
