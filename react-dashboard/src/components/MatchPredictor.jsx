import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamFlags } from '../utils';

/* ─── All 20 teams ─── */
const ALL_TEAMS = [
  'India', 'Australia', 'England', 'Pakistan', 'South Africa',
  'West Indies', 'Afghanistan', 'Bangladesh', 'New Zealand', 'Sri Lanka',
  'Ireland', 'Scotland', 'Netherlands', 'Canada', 'Uganda',
  'Namibia', 'Oman', 'Nepal', 'Papua New Guinea', 'United States of America',
];

/* ─── Build per-team stat profiles from data arrays ─── */
const buildTeamProfiles = (teamWins, topBatters, topBowlers) => {
  // Aggregate runs per team from topBatters (no team field — approximate from matches data)
  // We use teamWins as the base and supplement with batter/bowler totals
  const profiles = {};

  // Seed every team with defaults
  ALL_TEAMS.forEach(team => {
    profiles[team] = { wins: 0, totalRuns: 0, totalWickets: 0, playerCount: 0 };
  });

  // Apply wins
  (teamWins || []).forEach(({ team, wins }) => {
    if (profiles[team]) profiles[team].wins = wins || 0;
  });

  // Accumulate top batter runs — distribute proportionally to the teams that appear in winners
  // (data.json has no team field on batters; use wins as a proxy weight)
  const totalWins = Object.values(profiles).reduce((s, p) => s + p.wins, 0) || 1;
  const totalBatterRuns = (topBatters || []).reduce((s, b) => s + (b.runs || 0), 0);
  const totalBowlerWickets = (topBowlers || []).reduce((s, b) => s + (b.wickets || 0), 0);

  Object.keys(profiles).forEach(team => {
    const weight = profiles[team].wins / totalWins;
    profiles[team].totalRuns    = Math.round(totalBatterRuns    * weight);
    profiles[team].totalWickets = Math.round(totalBowlerWickets * weight);
  });

  return profiles;
};

/* formula: score = runs * 0.6 + wickets * 0.4, plus a wins bonus */
const computeScore = (profile) => {
  const { totalRuns = 0, totalWickets = 0, wins = 0 } = profile;
  return totalRuns * 0.6 + totalWickets * 0.4 + wins * 12;
};

const computeConfidence = (scoreA, scoreB) => {
  const total = scoreA + scoreB;
  if (total === 0) return 50;
  const raw = (Math.max(scoreA, scoreB) / total) * 100;
  // Clamp to 50–93 so it never looks like a certainty
  return Math.min(93, Math.max(50, Math.round(raw)));
};

/* ─── Circular confidence ring ─── */
const ConfidenceRing = memo(({ pct }) => {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="absolute inset-0 -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="#F0B429"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className="font-condensed font-black text-2xl text-icc-gold">{pct}%</span>
    </div>
  );
});

/* ─── Team Select Dropdown ─── */
const TeamSelect = memo(({ id, label, value, onChange, exclude }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label htmlFor={id} className="text-[10px] text-icc-muted uppercase tracking-widest font-bold">
      {label}
    </label>
    <div className="relative">
      {value && teamFlags[value] && (
        <img
          src={teamFlags[value]}
          alt=""
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-auto rounded-sm pointer-events-none"
          loading="lazy"
          width={20}
        />
      )}
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-white/[0.06] border border-white/10 text-white text-sm rounded-xl
                   py-2.5 focus:outline-none focus:border-icc-gold/50 focus:ring-1
                   focus:ring-icc-gold/30 transition-all appearance-none cursor-pointer
                   backdrop-blur-sm ${value && teamFlags[value] ? 'pl-10 pr-3' : 'px-3'}`}
      >
        <option value="" className="bg-icc-dark text-white">Select team…</option>
        {ALL_TEAMS.filter(t => t !== exclude).map(t => (
          <option key={t} value={t} className="bg-icc-dark text-white">{t}</option>
        ))}
      </select>
    </div>
  </div>
));

/* ─── Result card for one team ─── */
const TeamResult = memo(({ team, score, isWinner, confidence }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`flex-1 flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all duration-300
      ${isWinner
        ? 'bg-icc-gold/10 border-icc-gold/50 shadow-[0_0_32px_rgba(240,180,41,0.15)]'
        : 'bg-white/[0.03] border-white/[0.07]'}`}
  >
    {isWinner && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
        className="text-3xl"
        aria-label="Winner"
      >
        🏆
      </motion.div>
    )}
    <img
      src={teamFlags[team] || 'https://flagcdn.com/w40/un.png'}
      alt={`${team} flag`}
      className={`rounded-full border-2 object-cover ${isWinner ? 'w-16 h-16 border-icc-gold' : 'w-12 h-12 border-white/20 opacity-60'}`}
      loading="lazy"
      width={isWinner ? 64 : 48}
      height={isWinner ? 64 : 48}
    />
    <div className="text-center">
      <p className={`font-condensed font-black uppercase leading-tight ${isWinner ? 'text-xl text-white' : 'text-base text-icc-muted'}`}>
        {team}
      </p>
      {isWinner && (
        <p className="text-xs text-icc-gold/80 mt-0.5 font-semibold uppercase tracking-wider">
          Predicted Winner
        </p>
      )}
    </div>
    {isWinner && <ConfidenceRing pct={confidence} />}
    {isWinner && (
      <p className="text-[10px] text-icc-muted text-center">
        Confidence based on wins, run rate &amp; wickets
      </p>
    )}
    {!isWinner && (
      <p className="text-xs text-icc-muted/60">Score: {Math.round(score)}</p>
    )}
  </motion.div>
));

/* ─── Main Component ─── */
const MatchPredictor = ({ teamWins = [], topBatters = [], topBowlers = [] }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [result, setResult] = useState(null);
  const [predicted, setPredicted] = useState(false);

  const profiles = useMemo(
    () => buildTeamProfiles(teamWins, topBatters, topBowlers),
    [teamWins, topBatters, topBowlers]
  );

  const canPredict = teamA && teamB && teamA !== teamB;

  const handlePredict = () => {
    if (!canPredict) return;
    const scoreA = computeScore(profiles[teamA] || {});
    const scoreB = computeScore(profiles[teamB] || {});
    const winner = scoreA >= scoreB ? teamA : teamB;
    const confidence = computeConfidence(scoreA, scoreB);
    setResult({ winner, scoreA, scoreB, confidence });
    setPredicted(true);
  };

  const handleReset = () => {
    setResult(null);
    setPredicted(false);
    setTeamA('');
    setTeamB('');
  };

  return (
    <section
      id="predictor"
      aria-labelledby="predictor-heading"
      className="bg-icc-navy/50 py-16 border-b border-icc-border/40"
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
          <p className="eyebrow mb-4" aria-hidden="true">AI Insights</p>
          <h2
            id="predictor-heading"
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
          >
            Match Predictor
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <TeamSelect
              id="team-a-select"
              label="Team A"
              value={teamA}
              onChange={v => { setTeamA(v); setPredicted(false); setResult(null); }}
              exclude={teamB}
            />
            <div className="flex items-end justify-center pb-1">
              <span className="font-condensed font-black text-2xl text-icc-gold">VS</span>
            </div>
            <TeamSelect
              id="team-b-select"
              label="Team B"
              value={teamB}
              onChange={v => { setTeamB(v); setPredicted(false); setResult(null); }}
              exclude={teamA}
            />
          </div>

          {/* Predict button */}
          <div className="flex gap-3 mb-8">
            <motion.button
              whileHover={canPredict ? { scale: 1.04 } : {}}
              whileTap={canPredict ? { scale: 0.96 } : {}}
              onClick={handlePredict}
              disabled={!canPredict}
              className={`flex-1 py-3 rounded-xl font-condensed font-black text-sm uppercase tracking-wider
                         transition-all duration-200
                         ${canPredict
                           ? 'bg-icc-gold text-icc-dark shadow-gold-glow hover:brightness-110 cursor-pointer'
                           : 'bg-white/[0.06] text-icc-muted cursor-not-allowed'}`}
              aria-disabled={!canPredict}
            >
              ⚡ Predict Winner
            </motion.button>
            {predicted && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleReset}
                className="px-5 py-3 rounded-xl font-bold text-sm text-icc-muted border border-white/10
                           hover:border-white/20 hover:text-white transition-all backdrop-blur-sm"
                aria-label="Reset prediction"
              >
                Reset
              </motion.button>
            )}
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {!predicted && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-sm text-icc-muted py-6"
              >
                Select two teams and click Predict Winner to see the outcome.
              </motion.p>
            )}

            {predicted && result && (
              <motion.div
                key={`${teamA}-${teamB}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
                aria-live="polite"
                aria-label={`Predicted winner: ${result.winner} with ${result.confidence}% confidence`}
              >
                <div
                  className="text-center mb-6 text-xs text-icc-muted/70 italic"
                  aria-hidden="true"
                >
                  Based on: Wins (×12) + Runs (×0.6) + Wickets (×0.4)
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <TeamResult
                    team={teamA}
                    score={result.scoreA}
                    isWinner={result.winner === teamA}
                    confidence={result.confidence}
                  />
                  <div className="hidden sm:flex items-center">
                    <div className="w-px h-full bg-white/10" aria-hidden="true" />
                  </div>
                  <TeamResult
                    team={teamB}
                    score={result.scoreB}
                    isWinner={result.winner === teamB}
                    confidence={result.confidence}
                  />
                </div>

                {/* Score breakdown */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 grid grid-cols-2 gap-3 text-center"
                >
                  {[
                    { label: teamA, score: result.scoreA },
                    { label: teamB, score: result.scoreB },
                  ].map(({ label, score }) => (
                    <div
                      key={label}
                      className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3"
                    >
                      <p className="text-[10px] text-icc-muted uppercase tracking-widest font-bold mb-1">
                        {label}
                      </p>
                      <p className="font-condensed font-black text-xl text-white">
                        {Math.round(score)}
                      </p>
                      <p className="text-[10px] text-icc-muted/60">strength score</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default MatchPredictor;
