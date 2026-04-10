import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Stat bar ─── */
const StatBar = memo(({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
});

/* ─── Stat Row ─── */
const StatRow = memo(({ label, a, b, higherIsBetter = true, format = v => v ?? '—' }) => {
  const numA = parseFloat(a) || 0;
  const numB = parseFloat(b) || 0;
  const maxVal = Math.max(numA, numB, 1);

  const aWins = higherIsBetter ? numA > numB : numA < numB && numA > 0;
  const bWins = higherIsBetter ? numB > numA : numB < numA && numB > 0;

  const winCls = 'text-icc-gold font-black';
  const normalCls = 'text-white font-semibold';
  const badgeCls = 'ml-1.5 inline-block text-[9px] font-black bg-icc-gold text-icc-dark px-1.5 py-0.5 rounded-full uppercase tracking-wide';

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center py-2.5 border-b border-white/[0.05] last:border-0">
      {/* Player A value */}
      <div className="text-right flex flex-col gap-1">
        <div className="flex items-center justify-end gap-1">
          <span className={`text-base ${aWins ? winCls : normalCls}`}>
            {format(a)}
          </span>
          {aWins && <span className={badgeCls}>Best</span>}
        </div>
        {a != null && (
          <StatBar
            value={numA}
            max={maxVal}
            color={aWins ? 'bg-icc-gold' : 'bg-white/30'}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center text-[10px] text-icc-muted uppercase tracking-widest font-bold w-20 flex-shrink-0">
        {label}
      </div>

      {/* Player B value */}
      <div className="text-left flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className={`text-base ${bWins ? winCls : normalCls}`}>
            {format(b)}
          </span>
          {bWins && <span className={badgeCls}>Best</span>}
        </div>
        {b != null && (
          <StatBar
            value={numB}
            max={maxVal}
            color={bWins ? 'bg-icc-gold' : 'bg-white/30'}
          />
        )}
      </div>
    </div>
  );
});

/* ─── Player Avatar Card ─── */
const PlayerAvatar = memo(({ player, side }) => {
  const [imgError, setImgError] = React.useState(false);
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=0d1f3c&color=F0B429&size=96&bold=true&font-size=0.42`;
  const avatarSrc = player.image && !imgError ? player.image : fallbackSrc;

  return (
  <motion.div
    initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center gap-3 flex-1"
  >
    <div className="relative">
      <img
        src={avatarSrc}
        alt={player.name}
        className="w-20 h-20 rounded-full border-2 border-icc-gold/50 shadow-gold-glow object-cover"
        loading="lazy"
        width={80}
        height={80}
        onError={() => setImgError(true)}
      />
      <span className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full
        ${player.role === 'Batsman' ? 'bg-blue-500' : player.role === 'Bowler' ? 'bg-green-500' : 'bg-icc-gold'} 
        text-white uppercase`}>
        {player.role?.charAt(0)}
      </span>
    </div>
    <div className={`text-center ${side === 'left' ? 'text-right' : 'text-left'}`}>
      <p className="font-condensed font-black text-base text-white leading-tight">{player.name}</p>
      <p className="text-xs text-icc-muted mt-0.5">{player.team || 'Unknown Team'}</p>
    </div>
  </motion.div>
  );
});

/* ─── Dropdown ─── */
const PlayerSelect = memo(({ label, value, onChange, options, excludeId, id }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label htmlFor={id} className="text-[10px] text-icc-muted uppercase tracking-widest font-bold">{label}</label>
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-xl
                 px-3 py-2.5 focus:outline-none focus:border-icc-gold/50 focus:ring-1
                 focus:ring-icc-gold/30 transition-all appearance-none cursor-pointer
                 backdrop-blur-sm"
    >
      <option value="" className="bg-icc-dark text-white">Select player…</option>
      {options
        .filter(p => p.id !== excludeId)
        .map(p => (
          <option key={p.id} value={p.id} className="bg-icc-dark text-white">
            {p.name} — {p.role}
          </option>
        ))}
    </select>
  </div>
));

/* ─── Main Component ─── */
const ComparePlayers = ({ players = [] }) => {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  const playerA = useMemo(() => players.find(p => p.id === idA) || null, [players, idA]);
  const playerB = useMemo(() => players.find(p => p.id === idB) || null, [players, idB]);

  const canCompare = playerA && playerB;

  const stats = useMemo(() => {
    if (!canCompare) return [];
    return [
      {
        label: 'Runs',
        a: playerA.runs,
        b: playerB.runs,
        higherIsBetter: true,
        format: v => v ?? '—',
      },
      {
        label: 'Wickets',
        a: playerA.wickets,
        b: playerB.wickets,
        higherIsBetter: true,
        format: v => v ?? '—',
      },
      {
        label: 'Strike Rate',
        a: playerA.strikeRate,
        b: playerB.strikeRate,
        higherIsBetter: true,
        format: v => v ?? '—',
      },
      {
        label: 'Economy',
        a: playerA.economy,
        b: playerB.economy,
        higherIsBetter: false,
        format: v => v ?? '—',
      },
      {
        label: 'Balls',
        a: playerA.balls,
        b: playerB.balls,
        higherIsBetter: true,
        format: v => v ?? '—',
      },
    ];
  }, [canCompare, playerA, playerB]);

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
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
          >
            Player Comparison
          </h2>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-3xl p-6 sm:p-8
                     shadow-[0_8px_40px_rgba(0,0,0,0.4)] max-w-3xl mx-auto"
        >
          {/* Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <PlayerSelect
              id="player-a-select"
              label="Player A"
              value={idA}
              onChange={setIdA}
              options={players}
              excludeId={idB}
            />
            <div className="flex items-end justify-center pb-1">
              <span className="font-condensed font-black text-2xl text-icc-gold">VS</span>
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
            {!canCompare && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-icc-muted text-sm"
              >
                Select two players above to compare their stats head-to-head.
              </motion.div>
            )}

            {canCompare && (
              <motion.div
                key={`${idA}-${idB}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                {/* Avatars */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <PlayerAvatar player={playerA} side="left" />
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-12 bg-icc-gold/30" />
                    <span className="text-[10px] font-bold text-icc-gold/60 uppercase tracking-widest">vs</span>
                    <div className="w-px h-12 bg-icc-gold/30" />
                  </div>
                  <PlayerAvatar player={playerB} side="right" />
                </div>

                {/* Stats */}
                <div className="backdrop-blur-sm bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 sm:p-6">
                  {stats.map(s => (
                    <StatRow
                      key={s.label}
                      label={s.label}
                      a={s.a}
                      b={s.b}
                      higherIsBetter={s.higherIsBetter}
                      format={s.format}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparePlayers;
