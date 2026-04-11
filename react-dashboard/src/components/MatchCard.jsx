import React, { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFlag } from '../utils';
import scorecards from '../scorecards.json';

/* ── Fallback flag ── */
const FlagImg = ({ team, className }) => {
  const [failed, setFailed] = useState(false);
  const src = getFlag(team);
  if (failed || !src) return (
    <div className={`${className} bg-white/10 flex items-center justify-center rounded-full`}>
      <span className="text-xs text-white/50 font-bold">{team?.[0]}</span>
    </div>
  );
  return (
    <img src={src} alt={`${team} flag`} className={className}
      loading="lazy" decoding="async" onError={() => setFailed(true)} />
  );
};

const TYPE_PILL   = { Final: 'pill-final', 'Semi Final': 'pill-semi' };
const short       = t => t.replace('United States of America', 'USA').replace('Papua New Guinea', 'PNG');
// overs in scorecards.json are stored as strings — parse first, then round to 1dp
const fmtOvers    = o => { const n = parseFloat(o); return isNaN(n) ? '—' : (Number.isInteger(n) ? n : parseFloat(n.toFixed(1))); };

/* Compute balls remaining when chasing team wins by wickets */
const ballsLeft = (overs) => {
  const totalBalls    = 20 * 6;                              // 120
  const whole         = Math.floor(overs);
  const partial       = Math.round((overs - whole) * 10);   // e.g. 13.1 → 1
  const ballsUsed     = whole * 6 + partial;
  const remaining     = totalBalls - ballsUsed;
  return remaining > 0 ? remaining : null;
};

/* Build innings data from scorecards.json keyed by match number */
const getInnings = (matchNum) => {
  const key     = String(matchNum).replace('Match ', '').trim();
  const innings = scorecards[key];
  if (!innings || innings.length === 0) return null;
  return innings.map(inn => ({
    team:    inn.batting_team,
    runs:    inn.total_runs,
    wickets: inn.total_wickets,
    overs:   fmtOvers(inn.overs),
  }));
};

/* ── Main MatchCard — Google-style centered scorecard ── */
const MatchCard = memo(({ match, onClick, index = 0 }) => {
  const {
    match_num, date, team1, team2, winner, margin,
    city, player_of_match, toss_winner, toss_decision, match_type,
  } = match;

  const typePill    = TYPE_PILL[match_type] || 'pill-group';
  const team1Won    = winner === team1;
  const team2Won    = winner === team2;
  const hasResult   = team1Won || team2Won;
  const innings     = getInnings(match_num);
  const handleClick = useCallback(() => onClick(match), [match, onClick]);

  /* Map innings to team order (team1 bats first or second) */
  const inn1 = innings?.find(i => i.team === team1) ?? innings?.[0] ?? null;
  const inn2 = innings?.find(i => i.team === team2) ?? innings?.[1] ?? null;

  /* Compute "X balls left" extra for wicket wins */
  const ballsRemaining = (() => {
    if (!hasResult || !inn2 || !margin.includes('wicket')) return null;
    const winnerInn = team1Won ? inn1 : inn2;
    if (!winnerInn) return null;
    return ballsLeft(winnerInn.overs);
  })();

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.05, boxShadow: '0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.28), 0 0 32px rgba(255,215,0,0.12)' }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="match-card w-full text-center rounded-xl overflow-hidden flex flex-col items-center group focus:outline-none focus:ring-2 focus:ring-icc-gold/50 cursor-pointer"
      aria-label={`Match: ${team1} vs ${team2}`}
    >
      {/* Shimmer top border — brightens on hover */}
      <motion.div
        className="h-px w-full bg-gradient-to-r from-transparent via-icc-gold/50 to-transparent"
        whileHover={{ opacity: 1 }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: (index % 6) * 0.4 }}
      />

      <div className="p-4 flex flex-col items-center gap-3 w-full">

        {/* ── Header: Badge · Match# · Date ── */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className={`pill-tag text-[9px] ${typePill}`}>{match_type}</span>
          <span className="text-[10px] tracking-widest text-white/40 uppercase font-medium">{match_num}</span>
          <span className="text-[10px] text-white/25">· {date}</span>
        </div>

        {/* ── 3-column scorecard body ── */}
        {/*  LEFT [flag + name]  |  CENTER [score vs score]  |  RIGHT [flag + name]  */}
        <div className="flex items-center justify-between w-full gap-2">

          {/* LEFT — Team 1 */}
          <div className={`flex flex-col items-center gap-1.5 w-16 flex-shrink-0 ${team1Won ? '' : 'opacity-60'}`}>
            <FlagImg team={team1}
              className="w-10 h-7 object-cover rounded-md border border-white/15 shadow" />
            <span className={`text-xs font-semibold uppercase text-center leading-tight w-full truncate
              ${team1Won ? 'text-icc-gold' : 'text-white/80'}`}>
              {short(team1)}
            </span>
          </div>

          {/* CENTER — Scores */}
          <div className="flex items-center justify-center gap-3 flex-1 min-w-0">
            {/* Score 1 */}
            <div className={`flex flex-col items-center ${team1Won ? '' : 'opacity-60'}`}>
              {inn1 ? (
                <>
                  <span className={`text-2xl font-black tabular-nums leading-tight
                    ${team1Won ? 'text-icc-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.35)]' : 'text-white'}`}>
                    {inn1.runs}/{inn1.wickets}
                  </span>
                  <span className="text-[10px] text-gray-400">({inn1.overs} ov)</span>
                </>
              ) : (
                <span className="text-white/25 text-sm">—</span>
              )}
            </div>

            {/* VS divider */}
            <span className="text-xs font-bold text-gray-500 flex-shrink-0">vs</span>

            {/* Score 2 */}
            <div className={`flex flex-col items-center ${team2Won ? '' : 'opacity-60'}`}>
              {inn2 ? (
                <>
                  <span className={`text-2xl font-black tabular-nums leading-tight
                    ${team2Won ? 'text-icc-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.35)]' : 'text-white'}`}>
                    {inn2.runs}/{inn2.wickets}
                  </span>
                  <span className="text-[10px] text-gray-400">({inn2.overs} ov)</span>
                </>
              ) : (
                <span className="text-white/25 text-sm">—</span>
              )}
            </div>
          </div>

          {/* RIGHT — Team 2 */}
          <div className={`flex flex-col items-center gap-1.5 w-16 flex-shrink-0 ${team2Won ? '' : 'opacity-60'}`}>
            <FlagImg team={team2}
              className="w-10 h-7 object-cover rounded-md border border-white/15 shadow" />
            <span className={`text-xs font-semibold uppercase text-center leading-tight w-full truncate
              ${team2Won ? 'text-icc-gold' : 'text-white/80'}`}>
              {short(team2)}
            </span>
          </div>
        </div>

        {/* ── Result ── */}
        <div className="border-t border-white/[0.07] pt-2 w-full flex flex-col items-center gap-0.5">
          {!hasResult ? (
            <p className="text-[10px] text-white/40 italic">No Result</p>
          ) : (
            <>
              <p className="text-[11px] font-semibold text-green-400 leading-tight">
                {short(winner)} won by {margin}
                {ballsRemaining ? ` (${ballsRemaining} balls left)` : ''}
              </p>
              <p className="text-[9px] text-white/35">
                {match_type} · {match_num} of 55{city ? ` · ${city}` : ''}
              </p>
            </>
          )}
        </div>

        {/* ── POTM + CTA ── */}
        <div className="flex items-center justify-between w-full">
          <span className="text-[9px] text-icc-gold/70 font-medium truncate">
            {player_of_match ? `⭐ ${player_of_match}` : ''}
          </span>
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/25 group-hover:text-icc-gold transition-colors duration-200 flex-shrink-0">
            View Scorecard →
          </span>
        </div>

      </div>
    </motion.button>
  );
});

MatchCard.displayName = 'MatchCard';

/* ── ListMatchCard — compact single-row layout for list view ── */
export const ListMatchCard = memo(({ match, onClick, index = 0 }) => {
  const {
    match_num, date, team1, team2, winner, margin,
    player_of_match, match_type,
  } = match;

  const typePill  = TYPE_PILL[match_type] || 'pill-group';
  const team1Won  = winner === team1;
  const team2Won  = winner === team2;
  const innings   = getInnings(match_num);
  const inn1      = innings?.find(i => i.team === team1) ?? innings?.[0] ?? null;
  const inn2      = innings?.find(i => i.team === team2) ?? innings?.[1] ?? null;
  const handleClick = useCallback(() => onClick(match), [match, onClick]);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3, delay: (index % 12) * 0.03, ease: 'easeOut' }}
      whileHover={{ x: 4, backgroundColor: 'rgba(255,215,0,0.04)' }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className="w-full text-left rounded-xl overflow-hidden group focus:outline-none focus:ring-2
                 focus:ring-icc-gold/50 cursor-pointer border border-icc-border/60
                 hover:border-icc-gold/30 transition-colors duration-200
                 flex items-center gap-3 px-4 py-2.5"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(8px)' }}
      aria-label={`Match: ${team1} vs ${team2}`}
    >
      {/* Type pill */}
      <span className={`pill-tag text-[9px] flex-shrink-0 ${typePill}`}>{match_type}</span>

      {/* Team 1 */}
      <div className={`flex items-center gap-1.5 w-[88px] flex-shrink-0 ${team1Won ? '' : 'opacity-55'}`}>
        <FlagImg team={team1} className="w-6 h-4 object-cover rounded border border-white/15" />
        <span className={`text-[11px] font-semibold truncate ${team1Won ? 'text-icc-gold' : 'text-white/80'}`}>
          {short(team1)}
        </span>
      </div>

      {/* Score 1 */}
      <span className={`text-sm font-black tabular-nums w-[60px] text-right flex-shrink-0 ${team1Won ? 'text-icc-gold' : 'text-white/70'}`}>
        {inn1 ? `${inn1.runs}/${inn1.wickets}` : '—'}
      </span>

      <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">vs</span>

      {/* Score 2 */}
      <span className={`text-sm font-black tabular-nums w-[60px] flex-shrink-0 ${team2Won ? 'text-icc-gold' : 'text-white/70'}`}>
        {inn2 ? `${inn2.runs}/${inn2.wickets}` : '—'}
      </span>

      {/* Team 2 */}
      <div className={`flex items-center gap-1.5 w-[88px] flex-shrink-0 ${team2Won ? '' : 'opacity-55'}`}>
        <FlagImg team={team2} className="w-6 h-4 object-cover rounded border border-white/15" />
        <span className={`text-[11px] font-semibold truncate ${team2Won ? 'text-icc-gold' : 'text-white/80'}`}>
          {short(team2)}
        </span>
      </div>

      {/* Result — fills remaining space */}
      <p className="flex-1 text-[10px] text-green-400/80 font-medium truncate hidden sm:block">
        {winner ? `${short(winner)} won by ${margin}` : 'No Result'}
      </p>

      {/* POTM */}
      {player_of_match && (
        <span className="text-[9px] text-icc-gold/60 truncate hidden md:block w-[100px] flex-shrink-0">
          ⭐ {player_of_match}
        </span>
      )}

      {/* Date */}
      <span className="text-[9px] text-white/30 flex-shrink-0">{date}</span>

      {/* CTA chevron */}
      <svg className="w-3.5 h-3.5 text-white/20 group-hover:text-icc-gold transition-colors flex-shrink-0"
        fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </motion.button>
  );
});

ListMatchCard.displayName = 'ListMatchCard';
export default MatchCard;
