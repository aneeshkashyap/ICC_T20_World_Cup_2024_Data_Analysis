import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFlag } from '../utils';

/* ── Fallback flag ── */
const FlagImg = ({ team, className }) => {
  const [failed, setFailed] = useState(false);
  const src = getFlag(team);
  if (failed || !src) return (
    <div className={`${className} bg-white/10 flex items-center justify-center rounded-md`}>
      <span className="text-xs text-icc-muted">{team?.[0]}</span>
    </div>
  );
  return (
    <img src={src} alt={`${team} flag`} className={className}
      loading="lazy" decoding="async" onError={() => setFailed(true)} />
  );
};

const TYPE_PILL = { Final: 'pill-final', 'Semi Final': 'pill-semi' };
const short = t => t.replace('United States of America', 'USA').replace('Papua New Guinea', 'PNG');

/* ── Main MatchCard — horizontal two-column layout ── */
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
      className="match-card w-full text-left rounded-2xl overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-icc-gold/50 cursor-pointer"
      aria-label={`Match: ${team1} vs ${team2}`}
    >
      {/* Shimmer top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-icc-gold/50 to-transparent" />

      {/* ── Two-column body ── */}
      <div className="p-4 flex flex-row gap-3 items-stretch flex-1">

        {/* ── LEFT: Flags + Teams + VS ── */}
        <div className="flex flex-col justify-center items-start gap-2 w-[48%] border-r border-white/[0.06] pr-3">

          {/* Team 1 */}
          <div className={`flex items-center gap-2 w-full ${team1Won ? '' : 'opacity-70'}`}>
            <FlagImg team={team1}
              className="w-9 h-6 object-cover rounded-md border border-white/15 shadow flex-shrink-0" />
            <span className={`font-condensed font-black text-sm uppercase tracking-wide truncate ${team1Won ? 'text-icc-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.45)]' : 'text-white'}`}>
              {short(team1)}{team1Won && ' 🏆'}
            </span>
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-condensed font-black text-[9px] tracking-[0.35em] text-white/25">VS</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Team 2 */}
          <div className={`flex items-center gap-2 w-full ${team2Won ? '' : 'opacity-70'}`}>
            <FlagImg team={team2}
              className="w-9 h-6 object-cover rounded-md border border-white/15 shadow flex-shrink-0" />
            <span className={`font-condensed font-black text-sm uppercase tracking-wide truncate ${team2Won ? 'text-icc-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.45)]' : 'text-white'}`}>
              {short(team2)}{team2Won && ' 🏆'}
            </span>
          </div>
        </div>

        {/* ── RIGHT: Meta info ── */}
        <div className="flex flex-col justify-between gap-1 flex-1 min-w-0 pl-1">

          {/* Match type badge + number + date */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`pill-tag text-[9px] ${typePill}`}>{match_type}</span>
            <span className="text-[9px] tracking-widest text-white/35 uppercase font-medium">
              {match_num}
            </span>
            <span className="text-[9px] text-white/25">· {date}</span>
          </div>

          {/* Result */}
          <div>
            {!team1Won && !team2Won ? (
              <p className="text-[10px] text-white/40 italic">No Result</p>
            ) : (
              <p className="text-[11px] font-bold text-emerald-400 leading-tight">
                {short(winner)} won by {margin}
              </p>
            )}
          </div>

          {/* Meta — city, toss, POTM */}
          <div className="flex flex-col gap-0.5">
            {city && (
              <span className="text-[9px] text-white/40 truncate">📍 {city}</span>
            )}
            {toss_winner && (
              <span className="text-[9px] text-white/40 truncate">
                🪙 {short(toss_winner).split(' ').at(-1)} chose to {toss_decision}
              </span>
            )}
            {player_of_match && (
              <span className="text-[9px] text-icc-gold/75 font-medium truncate">
                ⭐ POTM: {player_of_match}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/25 group-hover:text-icc-gold transition-colors duration-200 pt-0.5">
            View Scorecard →
          </div>
        </div>
      </div>
    </motion.button>
  );
});

MatchCard.displayName = 'MatchCard';
export default MatchCard;
