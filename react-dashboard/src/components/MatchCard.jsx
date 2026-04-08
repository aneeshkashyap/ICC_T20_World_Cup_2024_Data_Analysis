import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFlag } from '../utils';

/* ── Fallback flag ── */
const FlagImg = ({ team, className }) => {
  const [failed, setFailed] = useState(false);
  const src = getFlag(team);
  if (failed || !src) return (
    <div className={`${className} bg-white/10 flex items-center justify-center rounded-xl`}>
      <span className="text-xs text-icc-muted">{team?.[0]}</span>
    </div>
  );
  return (
    <img src={src} alt={`${team} flag`} className={className}
      loading="lazy" decoding="async" onError={() => setFailed(true)} />
  );
};

const TYPE_PILL = { Final: 'pill-final', 'Semi Final': 'pill-semi' };

/* ── Team block inside card ── */
const TeamBlock = ({ team, won, isLeft }) => {
  const short = team
    .replace('United States of America', 'USA')
    .replace('Papua New Guinea', 'PNG');
  return (
    <div className={`flex-1 flex flex-col items-center gap-2 ${isLeft ? 'items-end pr-4' : 'items-start pl-4'}`}>
      <FlagImg team={team}
        className="w-16 h-11 object-cover rounded-xl border border-white/15 shadow-lg group-hover:scale-105 transition-transform duration-300" />
      <span className={`font-condensed font-black text-xl uppercase tracking-wide leading-tight text-center
        ${won ? 'text-icc-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : 'text-white'}`}>
        {short}
        {won && <span className="ml-1">🏆</span>}
      </span>
    </div>
  );
};

/* ── Main MatchCard ── */
const MatchCard = memo(({ match, onClick, index = 0 }) => {
  const {
    match_num, date, team1, team2, winner, margin,
    city, player_of_match, toss_winner, toss_decision, match_type,
  } = match;

  const typePill = TYPE_PILL[match_type] || 'pill-group';
  const team1Won = winner === team1;
  const team2Won = winner === team2;
  const handleClick = useCallback(() => onClick(match), [match, onClick]);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="match-card w-full text-left rounded-2xl overflow-hidden flex flex-col group
                 focus:outline-none focus:ring-2 focus:ring-icc-gold/50 cursor-pointer"
      aria-label={`Match: ${team1} vs ${team2}`}
    >
      {/* Shimmer top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-icc-gold/50 to-transparent" />

      <div className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-center justify-between w-full">
          <span className={`pill-tag ${typePill}`}>{match_type}</span>
          <p className="text-[10px] tracking-widest uppercase text-white/40 font-medium">
            {match_num} · {date}
          </p>
        </div>

        {/* Teams + VS */}
        <div className="flex items-center w-full">
          <TeamBlock team={team1} won={team1Won} isLeft />

          <div className="flex-shrink-0 flex flex-col items-center gap-1 px-2">
            <span className="font-condensed font-black text-[10px] tracking-[0.4em] text-white/30">VS</span>
          </div>

          <TeamBlock team={team2} won={team2Won} isLeft={false} />
        </div>

        {/* Result strip */}
        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3 flex flex-col gap-1.5
                        group-hover:border-icc-gold/20 transition-colors duration-300">
          {!team1Won && !team2Won ? (
            <p className="text-center text-xs text-white/40 italic">No Result</p>
          ) : (
            <p className="text-center text-xs font-semibold text-emerald-400 tracking-wide">
              {winner.replace('United States of America', 'USA').replace('Papua New Guinea','PNG')} won by {margin}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {city && <span className="text-[10px] text-white/40">📍 {city}</span>}
            {toss_winner && (
              <span className="text-[10px] text-white/40">
                🪙 {toss_winner.split(' ').at(-1)} to {toss_decision}
              </span>
            )}
            {player_of_match && (
              <span className="text-[10px] text-icc-gold/80 font-medium">⭐ {player_of_match}</span>
            )}
          </div>
        </div>

        {/* CTA row */}
        <div className="text-center text-[10px] font-bold tracking-[0.2em] uppercase
                        text-white/25 group-hover:text-icc-gold transition-colors duration-200">
          View Full Scorecard →
        </div>
      </div>
    </motion.button>
  );
});

MatchCard.displayName = 'MatchCard';
export default MatchCard;
