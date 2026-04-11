import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFlag } from '../utils';
import scorecards from '../scorecards.json';

/* ── Fallback flag ── */
const FlagImg = ({ team, className }) => {
  const [failed, setFailed] = useState(false);
  const src = getFlag(team);
  if (failed || !src) return (
    <div className={`${className} bg-white/10 flex items-center justify-center rounded-md`}>
      <span className="text-xs text-white/50">{team?.[0]}</span>
    </div>
  );
  return (
    <img src={src} alt={`${team} flag`} className={className}
      loading="lazy" decoding="async" onError={() => setFailed(true)} />
  );
};

const TYPE_PILL = { Final: 'pill-final', 'Semi Final': 'pill-semi' };
const short = t => t.replace('United States of America', 'USA').replace('Papua New Guinea', 'PNG');
const fmtOvers = o => (Number.isInteger(o) ? o : parseFloat(o.toFixed(1)));

/* Derive innings scores from scorecards.json keyed by match number string */
const getScores = (matchNum) => {
  const key = String(matchNum).replace('Match ', '').trim();
  const innings = scorecards[key];
  if (!innings || innings.length === 0) return null;
  return innings.map(inn => ({
    team: inn.batting_team,
    runs: inn.total_runs,
    wickets: inn.total_wickets,
    overs: fmtOvers(inn.overs),
  }));
};

/* ── Main MatchCard ── */
const MatchCard = memo(({ match, onClick, index = 0 }) => {
  const {
    match_num, date, team1, team2, winner, margin,
    city, player_of_match, toss_winner, toss_decision, match_type,
  } = match;

  const typePill  = TYPE_PILL[match_type] || 'pill-group';
  const team1Won  = winner === team1;
  const team2Won  = winner === team2;
  const scores    = getScores(match_num);
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
      className="bg-[#122B5A] w-full text-left rounded-xl shadow-md overflow-hidden flex flex-col group focus:outline-none focus:ring-2 focus:ring-icc-gold/50 cursor-pointer"
      aria-label={`Match: ${team1} vs ${team2}`}
    >
      {/* Shimmer top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-icc-gold/50 to-transparent" />

      <div className="p-4 flex flex-col gap-3">

        {/* ── Row 1: Badge + Match# + Date ── */}
        <div className="flex items-center gap-2">
          <span className={`pill-tag text-[9px] ${typePill}`}>{match_type}</span>
          <span className="text-[10px] tracking-widest text-white/40 uppercase font-medium">{match_num}</span>
          <span className="text-[10px] text-white/25 ml-auto">{date}</span>
        </div>

        {/* ── Row 2: Teams horizontal — [Flag+Name] VS [Flag+Name] ── */}
        <div className="flex items-center justify-between gap-2">

          {/* Team 1 */}
          <div className={`flex items-center gap-2 min-w-0 flex-1 ${team1Won ? '' : 'opacity-65'}`}>
            <FlagImg team={team1}
              className="w-9 h-6 object-cover rounded-md border border-white/15 shadow flex-shrink-0" />
            <span className={`font-bold text-sm uppercase tracking-wide truncate leading-tight
              ${team1Won ? 'text-icc-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]' : 'text-white'}`}>
              {short(team1)}
            </span>
          </div>

          {/* VS */}
          <span className="text-xs font-bold text-gray-400 flex-shrink-0 px-1">VS</span>

          {/* Team 2 */}
          <div className={`flex items-center gap-2 min-w-0 flex-1 justify-end ${team2Won ? '' : 'opacity-65'}`}>
            <span className={`font-bold text-sm uppercase tracking-wide truncate leading-tight text-right
              ${team2Won ? 'text-icc-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]' : 'text-white'}`}>
              {short(team2)}
            </span>
            <FlagImg team={team2}
              className="w-9 h-6 object-cover rounded-md border border-white/15 shadow flex-shrink-0" />
          </div>
        </div>

        {/* ── Row 3: Scorecard ── */}
        {scores && (
          <div className="flex flex-col gap-1 border-t border-white/[0.07] pt-2">
            {scores.map(inn => {
              const isWinner = inn.team === winner;
              return (
                <div key={inn.team}
                  className={`flex items-center justify-between text-[11px] ${isWinner ? 'text-white font-semibold' : 'text-white/50'}`}>
                  <span className="truncate mr-2">{short(inn.team)}{isWinner && ' 🏆'}</span>
                  <span className="font-mono flex-shrink-0 tabular-nums">
                    {inn.runs}/{inn.wickets}
                    <span className="text-white/40 font-normal"> ({inn.overs} ov)</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Row 4: Result ── */}
        <div className="border-t border-white/[0.07] pt-2">
          {!team1Won && !team2Won ? (
            <p className="text-[10px] text-white/40 italic">No Result</p>
          ) : (
            <p className="text-[11px] font-semibold text-green-400 leading-tight">
              {short(winner)} won by {margin}
            </p>
          )}
        </div>

        {/* ── Row 5: Meta + CTA ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
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
          <span className="ml-auto text-[9px] font-bold tracking-[0.18em] uppercase text-white/25 group-hover:text-icc-gold transition-colors duration-200">
            View Scorecard →
          </span>
        </div>

      </div>
    </motion.button>
  );
});

MatchCard.displayName = 'MatchCard';
export default MatchCard;
