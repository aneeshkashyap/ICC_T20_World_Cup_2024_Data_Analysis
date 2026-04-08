import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const RANK_CONFIG = {
  1: { label: '🥇 Champion',    border: 'rgba(255,215,0,0.35)',    glow: 'rgba(255,215,0,0.12)',   text: 'text-icc-gold',  pill: 'pill-gold' },
  2: { label: '🥈 Runner-up',   border: 'rgba(147,197,253,0.3)',   glow: 'rgba(147,197,253,0.08)', text: 'text-blue-300',  pill: 'pill-blue' },
  3: { label: '🥉 Semi-final',  border: 'rgba(52,211,153,0.25)',   glow: 'rgba(52,211,153,0.07)',  text: 'text-green-300', pill: 'pill-green' },
};

const TeamCard = memo(({ team, wins, rank, group, flag }) => {
  const [flagFailed, setFlagFailed] = useState(false);

  const cfg = RANK_CONFIG[rank] || {
    label: `Group ${group || '—'}`, border: 'rgba(255,255,255,0.08)',
    glow: 'transparent', text: 'text-white', pill: 'pill-group',
  };

  const shortName = team
    .replace('United States of America', 'USA')
    .replace('Papua New Guinea', 'PNG');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.015 }}
      className="team-card rounded-2xl p-6 flex flex-col items-center gap-4 relative overflow-hidden cursor-default"
      style={{ border: `1px solid ${cfg.border}`, boxShadow: `0 8px 32px ${cfg.glow}` }}
      aria-label={`${team} — ${wins} wins, Rank ${rank}`}
    >
      {/* Background glow for top ranked */}
      {rank <= 2 && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow} 0%, transparent 65%)` }} />
      )}

      {/* Top-left rank badge */}
      {rank <= 3 && (
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-black tracking-widest ${cfg.text} opacity-60`}>#{rank}</span>
        </div>
      )}

      {/* Flag */}
      <div className="relative">
        <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/15 shadow-xl">
          {!flagFailed && flag ? (
            <img src={flag} alt={`${team} flag`}
              className="w-full h-full object-cover"
              loading="lazy" decoding="async"
              onError={() => setFlagFailed(true)}
              width={96} height={64} />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-3xl">🏏</span>
            </div>
          )}
        </div>
        {rank === 1 && (
          <div className="absolute -top-2 -right-2 text-lg filter drop-shadow-lg">🏆</div>
        )}
      </div>

      {/* Team name */}
      <div className="text-center flex flex-col gap-1">
        <h3 className={`font-condensed font-black text-2xl uppercase tracking-wide leading-none ${cfg.text}`}>
          {shortName}
        </h3>
        <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase">ICC T20 World Cup 2024</p>
      </div>

      {/* Rank pill */}
      <span className={`pill-tag ${cfg.pill}`}>{cfg.label}</span>

      {/* Giant wins counter */}
      <div className="flex flex-col items-center gap-0.5">
        <AnimatedNumber
          value={wins}
          duration={1200}
          className={`font-condensed font-black text-5xl leading-none ${cfg.text}`}
        />
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/30">
          {wins === 1 ? 'Win' : 'Wins'}
        </span>
      </div>

      {/* Divider + meta */}
      <div className="w-full border-t border-white/[0.06] pt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/30">Matches won</span>
          <span className={`font-bold ${cfg.text}`}>{wins}</span>
        </div>
        {group && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/30">Group stage</span>
            <span className="font-bold text-white/60">Group {group}</span>
          </div>
        )}
      </div>
    </motion.article>
  );
});

TeamCard.displayName = 'TeamCard';
export default TeamCard;
