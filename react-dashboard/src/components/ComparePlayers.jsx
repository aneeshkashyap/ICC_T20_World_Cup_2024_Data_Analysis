import React, { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   CLEAN STAT HELPER
   Returns '-' for any null / undefined / NaN / empty-string value so the UI
   never renders corrupted characters or blank cells.
   ─────────────────────────────────────────────────────────────────────────── */
function cleanStat(value) {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (isNaN(n)) return '-';
  return value;
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DUAL BAR
   Two bars grow from the centre outward - A leftward, B rightward.
   pctA / pctB are each 0-50 (% of total container width).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const DualBar = memo(({ numA, numB, aWins, bWins, delay = 0 }) => {
  const maxVal = Math.max(numA, numB, 1);
  const pctA   = (numA / maxVal) * 50;
  const pctB   = (numB / maxVal) * 50;
  const isTie  = !aWins && !bWins;

  const aGrad = aWins
    ? 'linear-gradient(to left,  #059669, #34d399)'
    : isTie
    ? 'linear-gradient(to left,  #b45309, #fbbf24)'
    : 'rgba(255,255,255,0.10)';

  const bGrad = bWins
    ? 'linear-gradient(to right, #059669, #34d399)'
    : isTie
    ? 'linear-gradient(to right, #b45309, #fbbf24)'
    : 'rgba(255,255,255,0.10)';

  return (
    <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
      <motion.div
        className="absolute top-0 h-full"
        style={{ right: '50%', borderRadius: '9999px 0 0 9999px', background: aGrad }}
        initial={{ width: 0 }}
        animate={{ width: `${pctA}%` }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute left-1/2 top-0 w-px h-full bg-white/15 z-10" />
      <motion.div
        className="absolute top-0 h-full"
        style={{ left: '50%', borderRadius: '0 9999px 9999px 0', background: bGrad }}
        initial={{ width: 0 }}
        animate={{ width: `${pctB}%` }}
        transition={{ duration: 0.9, delay: delay + 0.05, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
});
DualBar.displayName = 'DualBar';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STAT ROW
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const StatRow = memo(({ label, a, b, higherIsBetter = true, format = v => cleanStat(v), rowIdx = 0 }) => {
  const numA  = parseFloat(a) || 0;
  const numB  = parseFloat(b) || 0;
  const maxVal = Math.max(numA, numB, 1);
  const isTie = numA === numB;
  const aWins = !isTie && (higherIsBetter
    ? numA > numB
    : (numA > 0 && numA < numB) || (numA > 0 && numB === 0));
  const bWins = !isTie && (higherIsBetter
    ? numB > numA
    : (numB > 0 && numB < numA) || (numB > 0 && numA === 0));

  const delay = rowIdx * 0.07;

  /* ── WINNER = bright glow / LOSER = aggressively dimmed ── */
  const clsA = isTie
    ? 'text-icc-gold/80 font-bold'
    : aWins
    ? 'text-emerald-300 font-black drop-shadow-[0_0_10px_rgba(52,211,153,0.65)] scale-110'
    : 'text-white/20 font-medium';

  const clsB = isTie
    ? 'text-icc-gold/80 font-bold'
    : bWins
    ? 'text-emerald-300 font-black drop-shadow-[0_0_10px_rgba(52,211,153,0.65)] scale-110'
    : 'text-white/20 font-medium';

  const BestBadge = (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay: delay + 0.25, stiffness: 500, damping: 18 }}
      className="inline-block text-[7.5px] font-black bg-emerald-500/20 text-emerald-400
                 border border-emerald-500/30 px-1.5 py-0.5 rounded-full
                 uppercase tracking-wide leading-none shadow-[0_0_8px_rgba(52,211,153,0.3)]"
    >
      Best
    </motion.span>
  );

  /* ── BAR WIDTHS: each side 0–100% of the winner's value ── */
  const pctA = (numA / maxVal) * 100;
  const pctB = (numB / maxVal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay }}
      className="group py-3.5 border-b border-white/[0.05] last:border-0
                 hover:bg-white/[0.03] rounded-xl px-2 -mx-2 transition-colors duration-200"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-2">
        {/* A value */}
        <div className="flex items-center justify-end gap-1.5">
          {aWins && BestBadge}
          <span className={`text-lg leading-none tabular-nums transition-all duration-300 ${clsA}`}>
            {format(a)}
          </span>
        </div>

        {/* Label */}
        <div className="w-20 shrink-0 text-center">
          <span className="text-[9px] font-bold tracking-widest uppercase text-icc-muted/60">
            {label}
          </span>
          {isTie && numA > 0 && (
            <div className="text-[8px] text-icc-gold/50 font-bold mt-0.5">Equal</div>
          )}
        </div>

        {/* B value */}
        <div className="flex items-center justify-start gap-1.5">
          <span className={`text-lg leading-none tabular-nums transition-all duration-300 ${clsB}`}>
            {format(b)}
          </span>
          {bWins && BestBadge}
        </div>
      </div>

      {/* ── PREMIUM PROGRESS BARS: separate bar per side ── */}
      {numA > 0 || numB > 0 ? (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mt-1.5 items-center">
          {/* A bar — grows right-to-left */}
          <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.05] flex justify-end">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: aWins
                  ? 'linear-gradient(to left, #34d399, #059669)'
                  : isTie
                  ? 'linear-gradient(to left, #fbbf24, #b45309)'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: aWins ? '0 0 6px rgba(52,211,153,0.5)' : 'none',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pctA}%` }}
              transition={{ duration: 0.85, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Centre divider */}
          <div className="w-px h-3 bg-white/10 shrink-0" />

          {/* B bar — grows left-to-right */}
          <div className="relative h-1.5 rounded-full overflow-hidden bg-white/[0.05]">
            <motion.div
              className="h-full rounded-full absolute left-0 top-0"
              style={{
                background: bWins
                  ? 'linear-gradient(to right, #34d399, #059669)'
                  : isTie
                  ? 'linear-gradient(to right, #fbbf24, #b45309)'
                  : 'rgba(255,255,255,0.08)',
                boxShadow: bWins ? '0 0 6px rgba(52,211,153,0.5)' : 'none',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pctB}%` }}
              transition={{ duration: 0.85, delay: delay + 0.25, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ) : (
        <DualBar numA={numA} numB={numB} aWins={aWins} bWins={bWins} delay={delay + 0.18} />
      )}
    </motion.div>
  );
});
StatRow.displayName = 'StatRow';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PLAYER AVATAR - winner crown + win-count chip
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PlayerAvatar = memo(({ player, side, isWinner = false, winCount = 0, totalStats = 0 }) => {
  const [imgError, setImgError] = React.useState(false);
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0d1f3c&color=F0B429&size=96&bold=true&font-size=0.42`;
  const src = player.image && !imgError ? player.image : fallback;

  const roleCfg = {
    Batsman:       { bg: 'bg-blue-500',    char: 'B' },
    Bowler:        { bg: 'bg-emerald-600', char: 'W' },
    'All-rounder': { bg: 'bg-amber-500',   char: 'A' },
  };
  const role = roleCfg[player.role] || { bg: 'bg-icc-gold', char: '?' };

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-2.5 flex-1"
    >
      <div className="relative">
        {/* Winner crown */}
        <AnimatePresence>
          {isWinner && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.35 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl select-none"
              aria-label="Winner"
            >
              {String.fromCodePoint(0x1F451)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar with animated ring — pulsing halo when dominant (≥75% wins) */}
        <div className="relative">
          {isWinner && winCount >= Math.ceil(totalStats * 0.75) && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none z-10"
              style={{ border: '2px solid rgba(52,211,153,0.55)' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.65, 0, 0.65] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}
          <motion.div
            animate={isWinner
              ? { boxShadow: '0 0 0 2px rgba(52,211,153,0.7), 0 0 24px rgba(52,211,153,0.3)' }
              : { boxShadow: '0 0 0 2px rgba(251,191,36,0.22)' }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full overflow-hidden"
          >
          <img
            src={src}
            alt={player.name}
            className="w-full h-full object-cover"
            loading="lazy"
            width={80} height={80}
            onError={() => setImgError(true)}
          />
          </motion.div>
        </div>{/* /inner relative for halo */}

        {/* Role badge */}
        <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                         flex items-center justify-center text-[8px] font-black text-white
                         shadow-md ${role.bg}`}>
          {role.char}
        </span>
      </div>

      <div className="text-center">
        <p className="font-condensed font-black text-sm text-white leading-tight">
          {player.name}
        </p>
        <p className="text-[10px] text-icc-muted mt-0.5 truncate max-w-[110px]">
          {player.team || 'Unknown'}
        </p>

        {/* Win-count chip */}
        {totalStats > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full
                        text-[9px] font-bold border transition-all duration-500
                        ${isWinner
                          ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25'
                          : 'bg-white/[0.05] text-white/30 border-white/10'}`}
          >
            <span className="font-black">{winCount}</span>
            <span className="opacity-50">/{totalStats}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
PlayerAvatar.displayName = 'PlayerAvatar';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   INSIGHT BULLET
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const InsightBullet = memo(({ icon, text, delay }) => (
  <motion.li
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.35, delay }}
    className="flex items-start gap-2.5 group/ins"
  >
    <span className="text-sm shrink-0 mt-px select-none">{icon}</span>
    <p className="text-[12px] text-white/60 leading-relaxed
                  group-hover/ins:text-white/85 transition-colors duration-200">
      {text}
    </p>
  </motion.li>
));
InsightBullet.displayName = 'InsightBullet';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   WIN-RATIO BAR - stacked A|B using absolute positioning
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const WinRatioBar = memo(({ winsA, winsB, total, nameA, nameB, winnerIsA }) => (
  <div>
    <div className="flex justify-between text-[9px] font-bold text-icc-muted/55 mb-1.5">
      <span className="uppercase tracking-wide truncate">{nameA}</span>
      <span className="uppercase tracking-wide truncate text-right">{nameB}</span>
    </div>
    <div className="relative h-2 rounded-full overflow-hidden bg-white/[0.06]">
      <motion.div
        className={`absolute left-0 top-0 h-full rounded-l-full
                    ${winnerIsA
                      ? 'bg-gradient-to-r from-emerald-700 to-emerald-400'
                      : 'bg-white/15'}`}
        initial={{ width: 0 }}
        animate={{ width: `${(winsA / total) * 100}%` }}
        transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className={`absolute right-0 top-0 h-full rounded-r-full
                    ${!winnerIsA
                      ? 'bg-gradient-to-l from-emerald-700 to-emerald-400'
                      : 'bg-white/15'}`}
        initial={{ width: 0 }}
        animate={{ width: `${(winsB / total) * 100}%` }}
        transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
    <div className="flex justify-between text-[9px] text-icc-muted/45 mt-1">
      <span>{winsA} win{winsA !== 1 ? 's' : ''}</span>
      <span>{winsB} win{winsB !== 1 ? 's' : ''}</span>
    </div>
  </div>
));
WinRatioBar.displayName = 'WinRatioBar';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DROPDOWN
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const PlayerSelect = memo(({ label, value, onChange, options, excludeId, id }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label htmlFor={id} className="text-[10px] text-icc-muted uppercase tracking-widest font-bold">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-white/[0.06] border text-white text-sm rounded-xl
                   px-3 py-2.5 pr-8 focus:outline-none focus:border-icc-gold/50
                   focus:ring-1 focus:ring-icc-gold/30 transition-all duration-200
                   appearance-none cursor-pointer backdrop-blur-sm
                   ${value ? 'border-icc-gold/30' : 'border-white/10'}`}
      >
        <option value="" className="bg-[#080f1e] text-white">Select player{String.fromCodePoint(0x2026)}</option>
        {options
          .filter(p => p.id !== excludeId)
          .map(p => (
            <option key={p.id} value={p.id} className="bg-[#080f1e] text-white">
              {p.name} {String.fromCodePoint(0x2014)} {p.role}
            </option>
          ))}
      </select>
      <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5
                      text-icc-muted pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
));
PlayerSelect.displayName = 'PlayerSelect';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SMART INSIGHT GENERATOR
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function buildInsights(playerA, playerB) {
  const lastName = p => p.name.split(' ').slice(-1)[0];
  const nameA = lastName(playerA);
  const nameB = lastName(playerB);
  const lines = [];

  const runsA = playerA.runs  || 0;
  const runsB = playerB.runs  || 0;
  const batA  = playerA.role === 'Batsman' || playerA.role === 'All-rounder';
  const batB  = playerB.role === 'Batsman' || playerB.role === 'All-rounder';

  if (batA || batB) {
    if (runsA > 0 && runsB > 0) {
      const diff    = Math.abs(runsA - runsB);
      const diffPct = (diff / Math.max(runsA, runsB)) * 100;
      if (diffPct > 20) {
        const leader  = runsA > runsB ? nameA : nameB;
        const trailer = runsA > runsB ? nameB : nameA;
        const lRuns   = runsA > runsB ? runsA : runsB;
        const tRuns   = runsA > runsB ? runsB : runsA;
        lines.push({ icon: String.fromCodePoint(0x1F3CF), text: `${leader} dominates batting with ${lRuns} runs vs ${trailer}'s ${tRuns} — a ${diff}-run gap (${Math.round(diffPct)}% ahead).` });
      } else {
        lines.push({ icon: String.fromCodePoint(0x1F3CF), text: `Bat for bat — ${nameA} has ${runsA} runs vs ${nameB}'s ${runsB}. Within ${Math.round(diffPct)}% of each other.` });
      }
    } else if (runsA > 0 && !batB) {
      lines.push({ icon: String.fromCodePoint(0x1F3CF), text: `${nameA} is the specialist batsman with ${runsA} runs, while ${nameB} focuses elsewhere.` });
    } else if (runsB > 0 && !batA) {
      lines.push({ icon: String.fromCodePoint(0x1F3CF), text: `${nameB} is the specialist batsman with ${runsB} runs, while ${nameA} focuses elsewhere.` });
    }
  }

  const wktsA = playerA.wickets || 0;
  const wktsB = playerB.wickets || 0;
  const bowlA = playerA.role === 'Bowler' || playerA.role === 'All-rounder';
  const bowlB = playerB.role === 'Bowler' || playerB.role === 'All-rounder';

  if (bowlA || bowlB) {
    if (wktsA > 0 && wktsB > 0) {
      if (wktsA !== wktsB) {
        const leader  = wktsA > wktsB ? nameA : nameB;
        const trailer = wktsA > wktsB ? nameB : nameA;
        const lWkts   = wktsA > wktsB ? wktsA : wktsB;
        const tWkts   = wktsA > wktsB ? wktsB : wktsA;
        const diff    = Math.abs(wktsA - wktsB);
        lines.push({ icon: String.fromCodePoint(0x1F3AF), text: `${leader} is deadlier with the ball — ${lWkts} wickets vs ${trailer}'s ${tWkts} (${diff} wicket${diff !== 1 ? 's' : ''} more).` });
      } else {
        lines.push({ icon: String.fromCodePoint(0x1F3AF), text: `Perfectly matched with the ball — both took exactly ${wktsA} wicket${wktsA !== 1 ? 's' : ''} this tournament.` });
      }
    } else if (wktsA > 0 && wktsB === 0) {
      lines.push({ icon: String.fromCodePoint(0x1F3AF), text: `Only ${nameA} has taken wickets (${wktsA}) — the clear bowling threat here.` });
    } else if (wktsB > 0 && wktsA === 0) {
      lines.push({ icon: String.fromCodePoint(0x1F3AF), text: `Only ${nameB} has taken wickets (${wktsB}) — the clear bowling threat here.` });
    }
  }

  const srA = parseFloat(playerA.strikeRate) || 0;
  const srB = parseFloat(playerB.strikeRate) || 0;
  if (srA > 0 && srB > 0 && Math.abs(srA - srB) > 15) {
    const faster  = srA > srB ? nameA : nameB;
    const slower  = srA > srB ? nameB : nameA;
    const fSR     = (srA > srB ? srA : srB).toFixed(1);
    const sSR     = (srA > srB ? srB : srA).toFixed(1);
    lines.push({ icon: String.fromCodePoint(0x26A1), text: `${faster} is far more aggressive (SR ${fSR}) vs ${slower} (SR ${sSR}) — a ${Math.abs(srA - srB).toFixed(1)}-point tempo edge.` });
  }

  return lines.slice(0, 3);
}

/* ─────────────────────────────────────────────────────────────────────────────
   VERDICT SUMMARY — one-sentence human-readable comparison result
   ─────────────────────────────────────────────────────────────────────────── */
function buildVerdictSummary(verdict, playerA, playerB, stats) {
  if (!verdict) return '';
  const last = name => name.split(' ').pop();
  if (verdict.draw) {
    return `A perfect dead heat \u2014 both players win exactly ${verdict.winsA} categor${verdict.winsA !== 1 ? 'ies' : 'y'} each.`;
  }
  const winner = verdict.winner;
  const loser  = winner === playerA ? playerB : playerA;
  const winsCount = winner === playerA ? verdict.winsA : verdict.winsB;
  const total  = stats.length;

  // Find which labels the winner leads in
  const strongIn = stats
    .filter(({ a, b, higherIsBetter }) => {
      const na = parseFloat(a) || 0, nb = parseFloat(b) || 0;
      if (na === nb) return false;
      if (winner === playerA) {
        return higherIsBetter ? na > nb : (na > 0 && na < nb) || (na > 0 && nb === 0);
      }
      return higherIsBetter ? nb > na : (nb > 0 && nb < na) || (nb > 0 && na === 0);
    })
    .map(s => s.label);

  const edge = strongIn.slice(0, 2).join(' & ');
  const dominance = winsCount >= Math.ceil(total * 0.8) ? 'dominates' : 'edges ahead in';
  return `${last(winner.name)} ${dominance} ${winsCount} of ${total} categories${edge ? ` \u2014 stronger in ${edge}` : ''}. ${last(loser.name)} trails behind overall.`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOMAIN VERDICT — batting vs bowling dominance breakdown
   ─────────────────────────────────────────────────────────────────────────── */
function buildDomainVerdicts(playerA, playerB) {
  const last = n => n.split(' ').pop();
  const nameA = last(playerA.name), nameB = last(playerB.name);

  const runsA = playerA.runs    || 0, runsB  = playerB.runs    || 0;
  const srA   = parseFloat(playerA.strikeRate) || 0;
  const srB   = parseFloat(playerB.strikeRate) || 0;
  const wkA   = playerA.wickets || 0, wkB    = playerB.wickets || 0;
  const econA = parseFloat(playerA.economy)   || 0;
  const econB = parseFloat(playerB.economy)   || 0;

  // Batting domain: Runs + Strike Rate (both higher = better)
  let batA = 0, batB = 0;
  if (runsA > runsB) batA++; else if (runsB > runsA) batB++;
  if (srA   > srB  ) batA++; else if (srB   > srA  ) batB++;

  // Bowling domain: Wickets (higher = better) + Economy (lower = better)
  let bowlA = 0, bowlB = 0;
  if (wkA > wkB) bowlA++; else if (wkB > wkA) bowlB++;
  if (econA > 0 && econB > 0) {
    if (econA < econB) bowlA++; else if (econB < econA) bowlB++;
  } else if (econA > 0 && econB === 0) bowlA++;
    else if (econB > 0 && econA === 0) bowlB++;

  const batWinner  = batA  > batB  ? 'A' : batB  > batA  ? 'B' : 'tie';
  const bowlWinner = bowlA > bowlB ? 'A' : bowlB > bowlA ? 'B' : 'tie';

  return {
    batting: {
      winner: batWinner,
      label:  batWinner === 'A'
        ? `${nameA} dominates batting`
        : batWinner === 'B'
        ? `${nameB} dominates batting`
        : 'Batting is level',
    },
    bowling: {
      winner: bowlWinner,
      label:  bowlWinner === 'A'
        ? `${nameA} leads bowling`
        : bowlWinner === 'B'
        ? `${nameB} leads bowling`
        : 'Bowling is level',
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   DOMAIN CHIP — small pill badge for batting/bowling verdict
   ─────────────────────────────────────────────────────────────────────────── */
const DomainChip = memo(({ icon, label, winner, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 360, damping: 22, delay }}
    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border
               text-[11px] font-bold min-w-0 cursor-default"
    style={{ borderColor: `${accent}44`, background: `${accent}12`, color: accent }}
  >
    <span className="text-base shrink-0 select-none" aria-hidden="true">{icon}</span>
    <span className="truncate leading-tight">{label}</span>
    {winner !== 'tie' && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="ml-auto shrink-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5
                   rounded-full"
        style={{ background: `${accent}22`, color: accent }}
      >
        Edge
      </motion.span>
    )}
  </motion.div>
));
DomainChip.displayName = 'DomainChip';

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ComparePlayers = ({ players = [], defaultIdA = '', defaultIdB = '' }) => {
  const [idA, setIdA] = useState(defaultIdA);
  const [idB, setIdB] = useState(defaultIdB);

  /* Sync when parent pre-selects via compare tray */
  useEffect(() => { if (defaultIdA) setIdA(defaultIdA); }, [defaultIdA]);
  useEffect(() => { if (defaultIdB) setIdB(defaultIdB); }, [defaultIdB]);

  const swapPlayers = useCallback(() => {
    const tmpA = idA;
    setIdA(idB);
    setIdB(tmpA);
  }, [idA, idB]);

  const playerA    = useMemo(() => players.find(p => p.id === idA) || null, [players, idA]);
  const playerB    = useMemo(() => players.find(p => p.id === idB) || null, [players, idB]);
  const canCompare = !!(playerA && playerB);

  const stats = useMemo(() => {
    if (!canCompare) return [];
    return [
      { label: 'Runs',        a: playerA.runs,        b: playerB.runs,        higherIsBetter: true,  format: v => cleanStat(v) },
      { label: 'Wickets',     a: playerA.wickets,     b: playerB.wickets,     higherIsBetter: true,  format: v => cleanStat(v) },
      { label: 'Strike Rate', a: playerA.strikeRate,  b: playerB.strikeRate,  higherIsBetter: true,  format: v => cleanStat(v) === '-' ? '-' : Number(v).toFixed(1) },
      { label: 'Economy',     a: playerA.economy,     b: playerB.economy,     higherIsBetter: false, format: v => cleanStat(v) === '-' ? '-' : Number(v).toFixed(2) },
      { label: 'Balls',       a: playerA.balls,       b: playerB.balls,       higherIsBetter: true,  format: v => cleanStat(v) },
    ];
  }, [canCompare, playerA, playerB]);

  const verdict = useMemo(() => {
    if (!canCompare || !stats.length) return null;
    let winsA = 0, winsB = 0;
    stats.forEach(({ a, b, higherIsBetter }) => {
      const na = parseFloat(a) || 0, nb = parseFloat(b) || 0;
      if (na === nb) return;
      if (higherIsBetter) { na > nb ? winsA++ : winsB++; }
      else { (na > 0 && na < nb) || (na > 0 && nb === 0) ? winsA++ : winsB++; }
    });
    if (winsA === winsB) return { draw: true, winsA, winsB };
    return {
      draw: false,
      winner: winsA > winsB ? playerA : playerB,
      winsA,
      winsB,
    };
  }, [canCompare, stats, playerA, playerB]);

  const insights = useMemo(
    () => (canCompare ? buildInsights(playerA, playerB) : []),
    [canCompare, playerA, playerB],
  );

  const verdictSummary = useMemo(
    () => (canCompare && verdict ? buildVerdictSummary(verdict, playerA, playerB, stats) : ''),
    [canCompare, verdict, playerA, playerB, stats],
  );

  const domainVerdicts = useMemo(
    () => (canCompare ? buildDomainVerdicts(playerA, playerB) : null),
    [canCompare, playerA, playerB],
  );

  const aIsWinner = canCompare && !!verdict && !verdict.draw && verdict.winner === playerA;
  const bIsWinner = canCompare && !!verdict && !verdict.draw && verdict.winner === playerB;

  return (
    <section
      id="compare"
      aria-labelledby="compare-heading"
      className="bg-icc-dark py-16 border-b border-icc-border/40"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Head to Head</p>
          <h2
            id="compare-heading"
            className="font-condensed font-bold text-5xl text-white uppercase tracking-wide"
          >
            Player Comparison
          </h2>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="backdrop-blur-lg bg-white/[0.06] border border-white/10 rounded-3xl
                     p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.45)] max-w-3xl mx-auto"
        >
          {/* Dropdowns + swap */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <PlayerSelect
              id="player-a-select"
              label="Player A"
              value={idA}
              onChange={setIdA}
              options={players}
              excludeId={idB}
            />
            <div className="flex flex-col items-center justify-center gap-2 pb-1 shrink-0">
              <span className="font-condensed font-black text-2xl text-icc-gold leading-none">VS</span>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.25 }}
                onClick={swapPlayers}
                disabled={!idA || !idB}
                aria-label="Swap players"
                title="Swap players"
                className="w-7 h-7 rounded-full bg-white/10 border border-white/15 text-icc-muted
                           hover:bg-icc-gold/20 hover:border-icc-gold/40 hover:text-icc-gold
                           flex items-center justify-center transition-all duration-200
                           disabled:opacity-25 disabled:pointer-events-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </motion.button>
            </div>
            <PlayerSelect
              id="player-b-select"
              label="Player B"
              value={idB}
              onChange={setIdB}
              options={players}
              excludeId={idA}
            />
          </div>

          <AnimatePresence mode="wait">
            {/* Empty state */}
            {!canCompare && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-14 gap-3"
              >
                <motion.p
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="text-4xl select-none"
                  aria-hidden="true"
                >
                  {String.fromCodePoint(0x2696, 0xFE0F)}
                </motion.p>
                <p className="text-sm text-icc-muted text-center max-w-xs leading-relaxed">
                  Select two players above to compare their stats head-to-head.
                </p>
              </motion.div>
            )}

            {/* Comparison */}
            {canCompare && (
              <motion.div
                key={`${idA}-${idB}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.38 }}
              >
                {/* Avatars */}
                <div className="flex items-start justify-between gap-4 mb-8">
                  <PlayerAvatar
                    player={playerA}
                    side="left"
                    isWinner={aIsWinner}
                    winCount={verdict?.winsA ?? 0}
                    totalStats={stats.length}
                  />
                  <div className="flex flex-col items-center gap-1 mt-7 shrink-0">
                    <div className="w-px h-10 bg-icc-gold/20" />
                    <span className="text-[8px] font-bold text-icc-gold/40 uppercase tracking-widest">vs</span>
                    <div className="w-px h-10 bg-icc-gold/20" />
                  </div>
                  <PlayerAvatar
                    player={playerB}
                    side="right"
                    isWinner={bIsWinner}
                    winCount={verdict?.winsB ?? 0}
                    totalStats={stats.length}
                  />
                </div>

                {/* Stats table */}
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl
                                px-4 sm:px-5 py-1 mb-4">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 py-2.5
                                  border-b border-white/[0.06] mb-1">
                    <p className="text-right text-[9px] font-black text-icc-muted/50
                                  uppercase tracking-widest truncate">
                      {playerA.name.split(' ').slice(-1)[0]}
                    </p>
                    <div className="w-20 shrink-0" />
                    <p className="text-left text-[9px] font-black text-icc-muted/50
                                  uppercase tracking-widest truncate">
                      {playerB.name.split(' ').slice(-1)[0]}
                    </p>
                  </div>

                  {stats.map((s, i) => (
                    <StatRow
                      key={s.label}
                      label={s.label}
                      a={s.a}
                      b={s.b}
                      higherIsBetter={s.higherIsBetter}
                      format={s.format}
                      rowIdx={i}
                    />
                  ))}
                </div>

                {/* Insights panel */}
                <AnimatePresence>
                  {insights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.32 }}
                      className="mb-4 bg-white/[0.025] border border-white/[0.06]
                                 rounded-2xl px-5 py-4"
                    >
                      <p className="flex items-center gap-1.5 text-[9px] font-black
                                    text-icc-muted/65 uppercase tracking-widest mb-3">
                        <svg className="w-3 h-3 text-icc-gold shrink-0" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3
                               m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547
                               A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531
                               c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Match Insights
                      </p>
                      <ul className="flex flex-col gap-2.5" aria-label="Comparison insights">
                        {insights.map((ins, i) => (
                          <InsightBullet key={i} icon={ins.icon} text={ins.text} delay={0.38 + i * 0.1} />
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ══════ ENHANCED FINAL VERDICT SECTION ══════ */}
                {verdict && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="backdrop-blur-lg rounded-2xl border overflow-hidden"
                    style={verdict.draw
                      ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }
                      : {
                          background: 'linear-gradient(135deg, rgba(52,211,153,0.07) 0%, rgba(5,150,105,0.04) 50%, rgba(0,0,0,0) 100%)',
                          borderColor: 'rgba(52,211,153,0.22)',
                          boxShadow: '0 0 40px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }
                    }
                  >
                    {/* Header strip */}
                    <div
                      className="px-5 py-3 border-b"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-icc-muted/55 flex items-center gap-1.5">
                        <span>🏆</span> Final Verdict
                      </p>
                    </div>

                    <div className="p-5">
                      {verdict.draw ? (
                        /* ── Draw state ── */
                        <div className="flex items-center justify-center gap-3 mb-4">
                          <span className="text-2xl select-none" aria-hidden="true">{String.fromCodePoint(0x1F91D)}</span>
                          <div className="text-center">
                            <p className="font-condensed font-black text-lg text-white uppercase tracking-wide">
                              It&apos;s a Draw!
                            </p>
                            <p className="text-xs text-icc-muted mt-0.5">
                              Both players won{' '}
                              <span className="text-icc-gold font-bold">{verdict.winsA}</span>{' '}
                              categor{verdict.winsA !== 1 ? 'ies' : 'y'} each.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* ── Three verdict lines: batting / bowling / overall ── */}
                          <div className="flex flex-col gap-3 mb-5">

                            {/* Line 1: 🔥 Batting dominance */}
                            <motion.div
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.35 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl
                                         border border-amber-400/15 backdrop-blur-sm"
                              style={{ background: 'rgba(251,191,36,0.06)' }}
                            >
                              <span className="text-xl shrink-0" aria-hidden="true">🔥</span>
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-amber-400/60 mb-0.5">
                                  Batting
                                </p>
                                <p className="text-sm font-bold text-amber-200/90">
                                  {domainVerdicts
                                    ? domainVerdicts.batting.winner === 'tie'
                                      ? 'Batting is perfectly level'
                                      : domainVerdicts.batting.label + ' in batting'
                                    : '—'
                                  }
                                </p>
                              </div>
                            </motion.div>

                            {/* Line 2: 🎯 Bowling lead */}
                            <motion.div
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.45 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl
                                         border border-cyan-400/15 backdrop-blur-sm"
                              style={{ background: 'rgba(6,182,212,0.06)' }}
                            >
                              <span className="text-xl shrink-0" aria-hidden="true">🎯</span>
                              <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-cyan-400/60 mb-0.5">
                                  Bowling
                                </p>
                                <p className="text-sm font-bold text-cyan-200/90">
                                  {domainVerdicts
                                    ? domainVerdicts.bowling.winner === 'tie'
                                      ? 'Bowling is perfectly level'
                                      : domainVerdicts.bowling.label + ' in bowling'
                                    : '—'
                                  }
                                </p>
                              </div>
                            </motion.div>

                            {/* Line 3: 🏆 Overall Winner */}
                            <motion.div
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.55 }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl
                                         border border-emerald-500/25 backdrop-blur-sm relative overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, rgba(52,211,153,0.10), rgba(5,150,105,0.06))',
                                boxShadow: '0 0 20px rgba(52,211,153,0.10)',
                              }}
                            >
                              {/* Animated shimmer accent */}
                              <motion.div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.06) 50%, transparent 100%)',
                                }}
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                              />
                              <span className="text-xl shrink-0" aria-hidden="true">🏆</span>
                              <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-emerald-400/70 mb-0.5">
                                  Overall Winner
                                </p>
                                <p className="font-condensed font-black text-lg text-emerald-300 uppercase tracking-wide
                                             drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                                  {verdict.winner.name}
                                </p>
                              </div>
                              {/* Win count badge */}
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.65 }}
                                className="shrink-0 w-10 h-10 rounded-full flex flex-col items-center justify-center
                                           bg-emerald-500/20 border border-emerald-500/30"
                              >
                                <span className="font-black text-sm text-emerald-300 leading-none">
                                  {verdict.winner === playerA ? verdict.winsA : verdict.winsB}
                                </span>
                                <span className="text-[7px] text-emerald-400/50 font-bold">/{stats.length}</span>
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Win-ratio bar */}
                          <WinRatioBar
                            winsA={verdict.winsA}
                            winsB={verdict.winsB}
                            total={stats.length}
                            nameA={playerA.name.split(' ').slice(-1)[0]}
                            nameB={playerB.name.split(' ').slice(-1)[0]}
                            winnerIsA={verdict.winner === playerA}
                          />

                          {/* Verdict summary sentence */}
                          {verdictSummary && (
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.6 }}
                              className="mt-4 text-center text-[11px] text-white/40 leading-relaxed
                                         italic border-t border-white/[0.06] pt-4"
                            >
                              {verdictSummary}
                            </motion.p>
                          )}
                        </>
                      )}

                      {/* Domain chips row — always shown if available */}
                      {domainVerdicts && verdict.draw && (
                        <div className="flex gap-2.5 mt-3">
                          <DomainChip
                            icon={String.fromCodePoint(0x1F3CF)}
                            label={domainVerdicts.batting.label}
                            winner={domainVerdicts.batting.winner}
                            accent="#FFD700"
                            delay={0.42}
                          />
                          <DomainChip
                            icon={String.fromCodePoint(0x26A1)}
                            label={domainVerdicts.bowling.label}
                            winner={domainVerdicts.bowling.winner}
                            accent="#34D399"
                            delay={0.52}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparePlayers;
