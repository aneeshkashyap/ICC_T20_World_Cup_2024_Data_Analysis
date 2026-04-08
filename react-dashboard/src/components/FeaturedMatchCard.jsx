import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFlag } from '../utils';

/* Featured match card shown inside the hero — larger, more dramatic */
const FlagImg = ({ team, size = 'md' }) => {
  const [failed, setFailed] = useState(false);
  const src = getFlag(team);
  const sizeClass = size === 'lg' ? 'w-20 h-14' : 'w-14 h-10';
  if (failed || !src) return <div className={`${sizeClass} bg-white/10 rounded-xl`} />;
  return (
    <img src={src} alt={`${team} flag`} loading="lazy" decoding="async"
      className={`${sizeClass} object-cover rounded-xl border border-white/20 shadow-xl`}
      onError={() => setFailed(true)} />
  );
};

const FeaturedMatchCard = memo(({ match, onClick }) => {
  if (!match) return null;

  const {
    team1, team2, winner, margin, city, date,
    player_of_match, match_type, match_num,
  } = match;

  const team1Won = winner === team1;
  const team2Won = winner === team2;

  const short = t => t.replace('United States of America','USA').replace('Papua New Guinea','PNG');

  const handleClick = useCallback(() => onClick(match), [match, onClick]);

  return (
    <motion.button
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="featured-match-card w-full text-left rounded-3xl overflow-hidden cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-icc-gold/50 group"
      aria-label={`Featured: ${team1} vs ${team2}`}
    >
      {/* Header - match info */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">Live Data</span>
          </div>
          <span className="text-[10px] text-white/30 tracking-widest uppercase">{match_num} · {date}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className={`pill-tag ${match_type === 'Final' ? 'pill-final' : match_type === 'Semi Final' ? 'pill-semi' : 'pill-group'}`}>
            {match_type}
          </span>
          {city && <span className="text-[10px] text-white/40">📍 {city}</span>}
        </div>
      </div>

      {/* Teams */}
      <div className="px-6 py-6 flex items-center justify-between gap-4">
        {/* Team 1 */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <FlagImg team={team1} size="lg" />
          <span className={`font-condensed font-black text-2xl uppercase tracking-wide text-center
            ${team1Won ? 'text-icc-gold' : 'text-white'}`}>
            {short(team1)}
            {team1Won && <span className="ml-1.5">🏆</span>}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center
                          bg-white/[0.05] border border-white/10">
            <span className="font-condensed font-black text-xs tracking-widest text-white/30">VS</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <FlagImg team={team2} size="lg" />
          <span className={`font-condensed font-black text-2xl uppercase tracking-wide text-center
            ${team2Won ? 'text-icc-gold' : 'text-white'}`}>
            {short(team2)}
            {team2Won && <span className="ml-1.5">🏆</span>}
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="px-6 pb-6">
        {(team1Won || team2Won) && margin ? (
          <p className="text-sm font-semibold text-emerald-400 text-center mb-3">
            {short(winner)} won by {margin}
          </p>
        ) : (
          <p className="text-sm text-white/30 italic text-center mb-3">No Result</p>
        )}

        {player_of_match && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xs text-white/30">Player of the Match</span>
            <span className="text-xs font-bold text-icc-gold">⭐ {player_of_match}</span>
          </div>
        )}

        <motion.div
          className="w-full py-3 rounded-xl bg-icc-gold/10 border border-icc-gold/20 text-center
                     text-xs font-bold tracking-widest text-icc-gold uppercase
                     group-hover:bg-icc-gold group-hover:text-icc-dark transition-all duration-300"
        >
          View Full Scorecard →
        </motion.div>
      </div>
    </motion.button>
  );
});

FeaturedMatchCard.displayName = 'FeaturedMatchCard';
export default FeaturedMatchCard;
