import React, { useState, useMemo, useCallback, memo, useId } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { getFlag } from '../utils';
import FilterBar        from '../components/FilterBar';
import TeamSection      from '../components/TeamSection';
import PlayerCard       from '../components/PlayerCard';
import TeamCard         from '../components/TeamCard';
import StatsSection     from '../components/StatsSection';
import MatchesGrid      from '../components/MatchesGrid';
import AnalyticsSection from '../components/AnalyticsSection';
import AnimatedNumber   from '../components/AnimatedNumber';
import FeaturedMatchCard from '../components/FeaturedMatchCard';
import MatchModal        from '../components/MatchModal';
import StatsTicker      from '../components/StatsTicker';
import { SectionError } from '../components/Skeletons';
import { ErrorBoundary } from '../components/ErrorBoundary';
import ComparePlayers   from '../components/ComparePlayers';
import MatchPredictor   from '../components/MatchPredictor';
import { useDeferredData, useDebounce } from '../hooks';
import appData from '../data.json';
import scorecards from '../scorecards.json';
import { PLAYER_PHOTOS } from '../playerPhotos';

/* ─── Constants ─── */
const TEAM_FLAGS = {
  India:                    'https://flagcdn.com/w40/in.png',
  Australia:                'https://flagcdn.com/w40/au.png',
  England:                  'https://flagcdn.com/w40/gb-eng.png',
  Pakistan:                 'https://flagcdn.com/w40/pk.png',
  'South Africa':           'https://flagcdn.com/w40/za.png',
  'West Indies':            'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/WestIndiesCricket_flag.svg/300px-WestIndiesCricket_flag.svg.png',
  Afghanistan:              'https://flagcdn.com/w40/af.png',
  Bangladesh:               'https://flagcdn.com/w40/bd.png',
  'New Zealand':            'https://flagcdn.com/w40/nz.png',
  'Sri Lanka':              'https://flagcdn.com/w40/lk.png',
  Ireland:                  'https://flagcdn.com/w40/ie.png',
  Scotland:                 'https://flagcdn.com/w40/gb-sct.png',
  Netherlands:              'https://flagcdn.com/w40/nl.png',
  Canada:                   'https://flagcdn.com/w40/ca.png',
  Uganda:                   'https://flagcdn.com/w40/ug.png',
  Namibia:                  'https://flagcdn.com/w40/na.png',
  Oman:                     'https://flagcdn.com/w40/om.png',
  Nepal:                    'https://flagcdn.com/w40/np.png',
  'Papua New Guinea':       'https://flagcdn.com/w40/pg.png',
  'United States of America': 'https://flagcdn.com/w40/us.png',
};

const TEAM_GROUPS = {
  India: 'A', England: 'B', Australia: 'B', Pakistan: 'A',
  'South Africa': 'D', 'West Indies': 'C', Afghanistan: 'C', Bangladesh: 'D',
  'New Zealand': 'C', 'Sri Lanka': 'D', Ireland: 'A', Scotland: 'B',
  Netherlands: 'D', Canada: 'A', Uganda: 'C', Namibia: 'B',
  Oman: 'A', Nepal: 'D', 'Papua New Guinea': 'C', 'United States of America': 'A',
};

const normalizeTeams = (t1, t2) => {
  if (t2 === 'Australia') return { t1: t2, t2: t1 };
  if (t1 === 'England')   return { t1: t2, t2: t1 };
  return { t1, t2 };
};

/* ─── Data builders ─── */
const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* Build a reliable player → team map from full scorecards (data.json topBatters/topBowlers lacks team fields) */
const buildPlayerMeta = () => {
  const meta = {};

  Object.values(scorecards || {}).forEach((inningsList = []) => {
    inningsList.forEach(inn => {
      (inn.batting || []).forEach(row => {
        const name = row?.name?.trim();
        if (!name) return;
        if (!meta[name]) meta[name] = {
          team: '', battingInnings: 0, bowlingInnings: 0, battingRuns: 0, bowlingWickets: 0,
        };
        if (!meta[name].team && inn.batting_team) meta[name].team = inn.batting_team;
        meta[name].battingInnings += 1;
        meta[name].battingRuns += Number(row.runs || 0);
      });

      (inn.bowling || []).forEach(row => {
        const name = row?.name?.trim();
        if (!name) return;
        if (!meta[name]) meta[name] = {
          team: '', battingInnings: 0, bowlingInnings: 0, battingRuns: 0, bowlingWickets: 0,
        };
        if (!meta[name].team && inn.bowling_team) meta[name].team = inn.bowling_team;
        meta[name].bowlingInnings += 1;
        meta[name].bowlingWickets += Number(row.wickets || 0);
      });
    });
  });

  return meta;
};

const PLAYER_META = buildPlayerMeta();
const KNOWN_ALL_ROUNDERS = new Set([
  'HH Pandya', 'MP Stoinis', 'AD Russell', 'Rashid Khan', 'Rishad Hossain',
  'AR Patel', 'RA Jadeja', 'Shakib Al Hasan', 'Mohammad Nabi',
]);

const inferRole = (name, fallbackRole) => {
  const meta = PLAYER_META[name];
  if (KNOWN_ALL_ROUNDERS.has(name)) return 'All-rounder';
  if (meta && meta.battingRuns >= 60 && meta.bowlingWickets >= 4) return 'All-rounder';
  return fallbackRole;
};

const buildPlayers = () => {
  const players = new Map();

  (appData.topBatters || []).forEach(b => {
    const name = b.striker;
    const meta = PLAYER_META[name] || {};
    const team = meta.team || b.team || '';
    const existing = players.get(name) || {};

    players.set(name, {
      id: existing.id || `player-${slugify(name)}`,
      name,
      team,
      teamFlag: TEAM_FLAGS[team] || '',
      role: inferRole(name, 'Batsman'),
      runs: b.runs ?? existing.runs ?? null,
      balls: b.balls ?? existing.balls ?? null,
      fours: b.fours ?? existing.fours ?? null,
      sixes: b.sixes ?? existing.sixes ?? null,
      strikeRate: b.strike_rate != null ? Number(b.strike_rate).toFixed(1) : existing.strikeRate ?? null,
      wickets: existing.wickets ?? null,
      economy: existing.economy ?? null,
      matches: meta.battingInnings || b.innings || existing.matches || null,
      image: PLAYER_PHOTOS[name] || existing.image || null,
    });
  });

  (appData.topBowlers || []).forEach(b => {
    const name = b.bowler;
    const meta = PLAYER_META[name] || {};
    const team = meta.team || b.team || '';
    const existing = players.get(name) || {};

    players.set(name, {
      id: existing.id || `player-${slugify(name)}`,
      name,
      team,
      teamFlag: TEAM_FLAGS[team] || '',
      role: inferRole(name, 'Bowler'),
      runs: existing.runs ?? null,
      balls: existing.balls ?? b.balls ?? null,
      fours: existing.fours ?? null,
      sixes: existing.sixes ?? null,
      strikeRate: existing.strikeRate ?? null,
      wickets: b.wickets ?? existing.wickets ?? null,
      economy: b.economy != null ? Number(b.economy).toFixed(2) : existing.economy ?? null,
      matches: meta.bowlingInnings || b.innings || existing.matches || null,
      image: PLAYER_PHOTOS[name] || existing.image || null,
    });
  });

  // Enrich all-rounders: fill missing runs/wickets from scorecard meta
  for (const [name, p] of players) {
    if (p.role === 'All-rounder') {
      const meta = PLAYER_META[name] || {};
      if (p.runs == null && meta.battingRuns)   p.runs = meta.battingRuns;
      if (p.wickets == null && meta.bowlingWickets) p.wickets = meta.bowlingWickets;
    }
  }

  return Array.from(players.values());
};

const buildMatches = () =>
  (appData.matches || []).map(m => {
    const { t1, t2 } = normalizeTeams(m.team1, m.team2);
    return {
      match_num: `Match ${m.match_number}`, date: m.date,
      team1: t1, team2: t2,
      winner: m.winner || 'No Result',
      margin: m.winner_wickets ? `${m.winner_wickets} wickets`
            : m.winner_runs    ? `${m.winner_runs} runs` : '',
      venue: m.venue, city: m.city,
      toss_winner: m.toss_winner, toss_decision: m.toss_decision,
      player_of_match: m.player_of_match,
      umpire1: m.umpire1, umpire2: m.umpire2,
      reserve_umpire: m.reserve_umpire, match_referee: m.match_referee,
      match_type: m.match_type,
    };
  });

/* ─── KPI Card with animated count-up ─── */
const KPICard = memo(({ icon, value, label, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="glass-card gradient-border rounded-2xl p-6 flex flex-col items-center text-center gap-3"
    role="group"
    aria-label={`${label}: ${Number(value).toLocaleString()}${sub ? `, ${sub}` : ''}`}
  >
    <motion.div className="w-12 h-12 rounded-xl bg-icc-gold/10 flex items-center justify-center text-2xl flex-shrink-0"
      aria-hidden="true"
      whileHover={{ scale: 1.2, rotate: -8 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 500 }}
    >{icon}</motion.div>
    <div>
      <AnimatedNumber
        value={value}
        duration={1800}
        className="font-condensed font-black text-4xl text-icc-gold"
      />
      <p className="text-sm font-semibold text-white mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-icc-muted mt-0.5">{sub}</p>}
    </div>
  </motion.div>
));

/* ─── Section header ─── */
const SectionHeader = memo(({ eyebrow, title, id }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className="text-center mb-10"
  >
    <p className="eyebrow mb-4" aria-hidden="true">{eyebrow}</p>
    <h2 id={id} className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide">
      {title}
    </h2>
    <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
  </motion.div>
));

/* ─── Player table row (table view) ─── */
const PlayerTableRow = memo(({ player, rank }) => (
  <motion.tr
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: rank * 0.03 }}
    className="hover:bg-white/[0.03] transition-colors"
  >
    <td className="td-cell text-icc-muted text-center w-10">{rank + 1}</td>
    <td className="td-cell">
      <div className="flex items-center gap-2.5">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=122B5A&color=F0F4F8&size=40&bold=true`}
          alt={player.name}
          className="w-7 h-7 rounded-full border border-white/10"
          loading="lazy" width={28} height={28}
        />
        <span className="font-semibold text-white text-sm">{player.name}</span>
      </div>
    </td>
    <td className="td-cell text-icc-muted text-xs">{player.team}</td>
    <td className="td-cell">
      <span className={`pill-tag text-[9px] ${
        player.role === 'Batsman' ? 'pill-blue' :
        player.role === 'Bowler'  ? 'pill-green' : 'pill-gold'}`}>
        {player.role}
      </span>
    </td>
    <td className="td-cell text-center font-bold text-icc-gold">{player.runs ?? '—'}</td>
    <td className="td-cell text-center text-xs text-icc-muted">{player.strikeRate ?? '—'}</td>
    <td className="td-cell text-center font-bold text-green-400">{player.wickets ?? '—'}</td>
    <td className="td-cell text-center text-xs text-icc-muted">{player.economy ?? '—'}</td>
  </motion.tr>
));

/* ─── Dashboard ─── */
const Dashboard = () => {
  const { data: players, loading: pLoad, error: pErr, retry: retryP } = useDeferredData(buildPlayers);
  const { data: matches, loading: mLoad, error: mErr }                = useDeferredData(buildMatches);

  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [selectedRole, setSelectedRole] = useState('All');
  const [rawSearch,    setRawSearch]    = useState('');
  const [view,         setView]         = useState('grid'); // 'grid' | 'table' | 'teams'
  const [heroMatch,    setHeroMatch]    = useState(null);

  /* ── Hero parallax ── */
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 900], [0, 80]);

  const search = useDebounce(rawSearch, 250);

  const allPlayers = players || [];

  const teamNames = useMemo(() =>
    [...new Set(allPlayers.map(p => p.team).filter(Boolean))].sort()
  , [allPlayers]);

  const filteredPlayers = useMemo(() =>
    allPlayers.filter(p => {
      const teamOk   = selectedTeam === 'All Teams' || p.team === selectedTeam;
      const roleOk   = selectedRole === 'All'       || p.role === selectedRole;
      const searchOk = !search
        || p.name.toLowerCase().includes(search.toLowerCase())
        || p.team.toLowerCase().includes(search.toLowerCase());
      return teamOk && roleOk && searchOk;
    })
  , [allPlayers, selectedTeam, selectedRole, search]);

  const maxRuns    = useMemo(() => Math.max(...filteredPlayers.map(p => p.runs  || 0), 1), [filteredPlayers]);
  const maxWickets = useMemo(() => Math.max(...filteredPlayers.map(p => p.wickets || 0), 1), [filteredPlayers]);

  const groupedByTeam = useMemo(() => {
    const map = {};
    filteredPlayers.forEach(p => {
      if (!map[p.team]) map[p.team] = [];
      map[p.team].push(p);
    });
    return map;
  }, [filteredPlayers]);

  const kpis = useMemo(() => [
    { icon: '🏏', label: 'Matches',  value: appData.totalMatches  || 0, sub: 'Games played' },
    { icon: '🏆', label: 'Runs',     value: appData.totalRuns     || 0, sub: 'Tournament total' },
    { icon: '⚡', label: 'Wickets',  value: appData.totalWickets  || 0, sub: 'All innings' },
    { icon: '🌍', label: 'Nations',  value: appData.totalTeams    || 0, sub: 'Competing' },
  ], []);

  const teamsForCards = useMemo(() => {
    const raw = appData.teamWins || [];
    const india       = raw.find(t => t.team === 'India');
    const southAfrica = raw.find(t => t.team === 'South Africa');
    const afghanistan = raw.find(t => t.team === 'Afghanistan');
    const england     = raw.find(t => t.team === 'England');
    const SEMI_FINALIST_TEAMS = new Set(['India', 'South Africa', 'Afghanistan', 'England']);
    const rest = raw.filter(t => !SEMI_FINALIST_TEAMS.has(t.team));
    return [
      india       && { ...india,       rank: 1 },
      southAfrica && { ...southAfrica, rank: 2 },
      afghanistan && { ...afghanistan, rank: 3 },
      england     && { ...england,     rank: 3 },
      ...rest.map((t, idx) => ({ ...t, rank: idx + 5 })),
    ].filter(Boolean).map(t => ({
      team: t.team, wins: t.wins, rank: t.rank,
      flag: TEAM_FLAGS[t.team] || getFlag(t.team),
      group: TEAM_GROUPS[t.team] || '—',
    }));
  }, []);

  const handleTeamChange = useCallback(t => setSelectedTeam(t), []);
  const handleRoleChange = useCallback(r => setSelectedRole(r), []);
  const handleSearch     = useCallback(s => setRawSearch(s),    []);

  const filterTitleId = useId();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ══════ HERO (cinematic split) ══════ */}
      <section id="hero" aria-labelledby="hero-heading" className="hero-stadium">
        {/* Parallax stadium background */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none"
          style={{
            position: 'absolute',
            top: '-12%', left: 0, right: 0, bottom: '-12%',
            backgroundImage: `url(${import.meta.env.BASE_URL}stadium.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            y: heroParallaxY,
          }}
        />
        {/* Dark cinematic overlay */}
        <div className="hero-overlay" aria-hidden="true" />

        {/* Radial gold glow - left side */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] -translate-y-1/2
                        bg-icc-gold/[0.03] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative w-full max-w-screen-xl mx-auto px-4 sm:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── LEFT: Title + CTAs ── */}
            <div className="flex flex-col gap-6">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 w-fit"
              >
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                 bg-icc-gold/10 border border-icc-gold/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-icc-gold animate-pulse" />
                  <span className="text-[10px] font-bold text-icc-gold tracking-[0.2em] uppercase">
                    ICC Men's T20 WC · 2024
                  </span>
                </span>
              </motion.div>

              {/* Main title */}
              <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-condensed font-black text-[clamp(3rem,8vw,6.5rem)]
                           text-white uppercase leading-[0.9] tracking-tight"
              >
                T20<br />
                World<br />
                <span className="text-icc-gold">Cup</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base text-white/50 max-w-sm leading-relaxed font-light"
              >
                Data-driven cricket insights — complete scorecards, player stats &amp; tournament analytics
                from all 52 matches across USA &amp; West Indies.
              </motion.p>

              {/* Stat pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-2"
              >
                {[
                  { v: appData.totalMatches || 52,  l: 'Matches' },
                  { v: appData.totalTeams   || 20,  l: 'Teams'   },
                  { v: appData.totalRuns    || 0,   l: 'Runs'    },
                ].map(({ v, l }) => (
                  <div key={l} className="px-4 py-2 rounded-full featured-match-card
                                          flex items-center gap-2">
                    <span className="font-condensed font-black text-lg text-icc-gold">{v.toLocaleString()}</span>
                    <span className="text-xs text-white/40 font-medium">{l}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <motion.a href="#matches"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.96 }}
                  className="btn-gold">
                  View Matches
                </motion.a>
                <motion.a href="#players"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.96 }}
                  className="btn-outline-gold">
                  Explore Players
                </motion.a>
                <motion.a href="#analytics"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.96 }}
                  className="btn-outline-gold">
                  Analytics
                </motion.a>
              </motion.div>

              {/* Bottom facts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/[0.06]"
              >
                {['📍 USA & West Indies', '🏟️ 9 Venues', '🏆 India — Champions'].map(fact => (
                  <span key={fact} className="text-xs text-white/35 font-light">{fact}</span>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: Featured match card ── */}
            <div className="hidden lg:block">
              {matches && matches.length > 0 && (
                <FeaturedMatchCard
                  match={matches.find(m => m.match_type === 'Final') || matches[0]}
                  onClick={m => setHeroMatch(m)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24
                        bg-gradient-to-t from-icc-dark to-transparent pointer-events-none" aria-hidden="true" />
      </section>

      {/* ══════ STATS TICKER ══════ */}
      <ErrorBoundary fallbackMessage="Stats ticker failed to load.">
        <StatsTicker />
      </ErrorBoundary>

      {/* ══════ KPI STATS ══════ */}
      <section className="bg-icc-dark py-16 border-b border-icc-border/40"
        aria-label="Key tournament statistics">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="By the Numbers" title="Tournament Stats" id="kpi-heading" />
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            role="list" aria-labelledby="kpi-heading"
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {kpis.map((kpi, i) => (
              <motion.div key={kpi.label} role="listitem"
                variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } }}>
                <KPICard {...kpi} delay={0} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ MATCHES ══════ */}
      <ErrorBoundary fallbackMessage="Matches grid failed to load.">
        <motion.section
          className="bg-icc-dark border-b border-icc-border/40"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-16">
            <SectionHeader eyebrow="Full Results" title="Tournament Matches" id="matches-heading" />
          </div>
          <MatchesGrid matches={matches || []} loading={mLoad} error={mErr} />
        </motion.section>
      </ErrorBoundary>

      {/* ══════ ANALYTICS (Recharts) ══════ */}
      <ErrorBoundary fallbackMessage="Analytics charts failed to load.">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnalyticsSection
            batters={appData.topBatters || []}
            bowlers={appData.topBowlers || []}
            players={players || []}
          />
        </motion.div>
      </ErrorBoundary>

      {/* ══════ COMPARE PLAYERS ══════ */}
      <ErrorBoundary fallbackMessage="Player comparison failed to load.">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ComparePlayers players={allPlayers} />
        </motion.div>
      </ErrorBoundary>

      {/* ══════ MATCH PREDICTOR ══════ */}
      <ErrorBoundary fallbackMessage="Match predictor failed to load.">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <MatchPredictor
            teamWins={appData.teamWins || []}
            topBatters={appData.topBatters || []}
            topBowlers={appData.topBowlers || []}
          />
        </motion.div>
      </ErrorBoundary>

      {/* ══════ PLAYERS ══════ */}
      <ErrorBoundary fallbackMessage="Players section failed to load.">
        <motion.section id="players" aria-labelledby={filterTitleId}
        className="bg-icc-dark py-16 border-b border-icc-border/40"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <SectionHeader eyebrow="Top Performers" title="Players" id={filterTitleId} />

          {/* View toggle + count */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="inline-flex gap-1 p-1 rounded-xl glass-card"
              role="group" aria-label="Player view mode">
              {[
                ['grid',  '⊞ Grid'],
                ['table', '≡ Table'],
                ['teams', '⊟ Teams'],
              ].map(([v, label]) => (
                <motion.button key={v}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200
                    ${view === v ? 'bg-icc-gold text-icc-dark shadow' : 'text-icc-muted hover:text-white'}`}>
                  {label}
                </motion.button>
              ))}
            </div>
            <p role="status" aria-live="polite" className="text-xs text-icc-muted">
              Showing <span className="text-white font-semibold">{filteredPlayers.length}</span> player{filteredPlayers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <FilterBar
            teams={teamNames}
            selectedTeam={selectedTeam}
            selectedRole={selectedRole}
            search={rawSearch}
            onTeamChange={handleTeamChange}
            onRoleChange={handleRoleChange}
            onSearch={handleSearch}
          />

          {pErr && <SectionError message="Failed to load player data." onRetry={retryP} />}

          {/* Skeleton loaders */}
          {pLoad && !pErr && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="skeleton w-14 h-14 rounded-full" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="skeleton h-4 w-28 rounded" />
                      <div className="skeleton h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="skeleton h-2 w-full rounded-full" />
                  <div className="skeleton h-2 w-3/4 rounded-full" />
                  <div className="skeleton h-2 w-5/6 rounded-full" />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!pLoad && !pErr && (
              <motion.div key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── Grid view ── */}
                {view === 'grid' && (
                  <div role="list" aria-label="Player cards"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                    {filteredPlayers.length === 0 ? (
                      <p role="status" className="col-span-full text-center py-16 text-icc-muted text-sm">
                        No players match your filters.
                      </p>
                    ) : filteredPlayers.map((player, idx) => (
                      <div key={player.id} role="listitem">
                        <PlayerCard player={player} index={idx} maxRuns={maxRuns} maxWickets={maxWickets} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Table view ── */}
                {view === 'table' && (
                  <div className="glass-card rounded-2xl overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                      <table className="w-full" aria-label="Player statistics table">
                        <thead>
                          <tr>
                            <th className="th-cell w-10 text-center">#</th>
                            <th className="th-cell">Player</th>
                            <th className="th-cell">Team</th>
                            <th className="th-cell">Role</th>
                            <th className="th-cell text-center">Runs</th>
                            <th className="th-cell text-center">SR</th>
                            <th className="th-cell text-center">Wkts</th>
                            <th className="th-cell text-center">Econ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPlayers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="td-cell text-center py-12 text-icc-muted">
                                No players match your filters.
                              </td>
                            </tr>
                          ) : filteredPlayers.map((player, idx) => (
                            <PlayerTableRow key={player.id} player={player} rank={idx} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Teams view ── */}
                {view === 'teams' && (
                  <>
                    {Object.keys(groupedByTeam).length === 0 && (
                      <p role="status" className="text-center py-16 text-icc-muted text-sm mt-8">
                        No players match your filters.
                      </p>
                    )}
                    {Object.entries(groupedByTeam).map(([team, teamPlayers]) => (
                      <TeamSection key={team} teamName={team}
                        teamFlag={TEAM_FLAGS[team] || getFlag(team)} players={teamPlayers} />
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
      </ErrorBoundary>
      <ErrorBoundary fallbackMessage="Team rankings failed to load.">
        <motion.section id="teams" aria-labelledby="teams-heading"
          className="bg-icc-navy/50 py-16 border-b border-icc-border/40"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
            <SectionHeader eyebrow="2024 Tournament" title="Team Rankings" id="teams-heading" />
            <motion.div role="list" aria-label="Team cards"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={{ show: { transition: { staggerChildren: 0.09 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {teamsForCards.map((t) => (
                <motion.div key={t.team} role="listitem"
                  variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
                  <TeamCard team={t.team} wins={t.wins} rank={t.rank}
                    group={t.group} flag={t.flag} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </ErrorBoundary>
      <ErrorBoundary fallbackMessage="Stats leaderboard failed to load.">
        <StatsSection batters={appData.topBatters || []} bowlers={appData.topBowlers || []} loading={false} />
      </ErrorBoundary>

      {/* ══════ FOOTER ══════ */}
      <footer role="contentinfo" className="border-t border-icc-border/40 bg-icc-dark py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-icc-gold flex items-center justify-center
                            font-condensed font-black text-icc-dark text-xs shadow-gold-glow"
              aria-hidden="true">T20</div>
            <span className="font-condensed font-bold text-sm text-white tracking-wider">
              ICC T20 World Cup 2024
            </span>
          </div>
          <p className="text-xs text-icc-muted">
            React · Tailwind CSS · Framer Motion · Recharts · Vite
            &nbsp;|&nbsp; ICC Official Records 2024
          </p>
        </div>
      </footer>

      {/* Scorecard modal for Featured Match (hero section) */}
      {heroMatch && <MatchModal match={heroMatch} onClose={() => setHeroMatch(null)} />}
    </motion.div>
  );
};

export default Dashboard;
