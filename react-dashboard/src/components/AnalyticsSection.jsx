/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';

// ─── UPGRADED: Real data-viz dashboard with dual charts + hero performer cards ───

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm shadow-2xl border border-icc-gold/30"
      style={{ background: 'rgba(10,14,35,0.97)', backdropFilter: 'blur(12px)' }}>
      <p className="font-bold text-white mb-1">{label}</p>
      <p className="text-icc-gold font-black text-xl">
        {Number(payload[0].value).toLocaleString()}
        <span className="text-xs text-icc-muted ml-1.5 font-normal">{unit}</span>
      </p>
    </div>
  );
};

/* ── Bar chart panel ── */
const ChartPanel = memo(({ data, dataKey, unit, accentColor = '#FFD700', height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 8, left: -12, bottom: 56 }} barCategoryGap="38%">
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,156,200,0.08)" vertical={false} />
      <XAxis
        dataKey="name"
        tick={{ fill: '#8B9CC8', fontSize: 10, fontWeight: 600 }}
        axisLine={false} tickLine={false}
        angle={-40} textAnchor="end" interval={0}
      />
      <YAxis tick={{ fill: '#8B9CC8', fontSize: 10 }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(255,215,0,0.04)' }} />
      <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
        {data.map((_, i) => (
          <Cell
            key={i}
            fill={
              i === 0
                ? accentColor
                : i === 1
                ? `${accentColor}BB`
                : i < 4
                ? `${accentColor}66`
                : `${accentColor}33`
            }
          />
        ))}
        <LabelList dataKey={dataKey} position="top"
          style={{ fill: '#8B9CC8', fontSize: 9, fontWeight: 700 }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

/* ── Card wrapper with animation ── */
const AnimCard = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`glass-card rounded-2xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

/* ── Top Performer hero card ── */
const PerformerCard = ({ label, name, value, unit, sub, icon, gradientFrom, gradientTo, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92, y: 24 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, scale: 1.015 }}
    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl flex flex-col cursor-default"
    style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
  >
    <div className="p-6 flex flex-col gap-3">
      {/* Icon + label */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-black uppercase tracking-widest text-white/70">{label}</span>
      </div>
      {/* Player name */}
      <p className="font-condensed font-black text-2xl sm:text-3xl text-white leading-tight">
        {name || '—'}
      </p>
      {/* Big stat */}
      <div className="flex items-baseline gap-2 mt-1">
        <span className="font-condensed font-black text-4xl sm:text-5xl text-white">
          {value != null ? Number(value).toLocaleString() : '—'}
        </span>
        <span className="text-sm font-bold text-white/60 uppercase tracking-wide">{unit}</span>
      </div>
      {sub && (
        <p className="text-xs text-white/50 font-medium border-t border-white/10 pt-3 mt-1">{sub}</p>
      )}
    </div>
  </motion.div>
);

/* ── Analytics Section ── */
const AnalyticsSection = memo(({ batters = [], bowlers = [] }) => {
  const [extraTab, setExtraTab] = useState('sr');

  /* ── Sorted chart data ── */
  const runsData = [...batters]
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: b.runs }));

  const wicketsData = [...bowlers]
    .sort((a, b) => b.wickets - a.wickets)
    .slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: b.wickets }));

  const srData = [...batters]
    .filter(b => b.strike_rate != null)
    .sort((a, b) => b.strike_rate - a.strike_rate)
    .slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: Math.round(Number(b.strike_rate)) }));

  const econData = [...bowlers]
    .filter(b => b.economy != null)
    .sort((a, b) => a.economy - b.economy)
    .slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: Number(b.economy).toFixed(2) }));

  /* ── Top performers ── */
  const topBatter = batters.reduce((best, p) => (p.runs > (best?.runs ?? -1) ? p : best), null);
  const topBowler = bowlers.reduce((best, p) => (p.wickets > (best?.wickets ?? -1) ? p : best), null);

  /* ── Advanced stats tabs ── */
  const extraCharts = {
    sr:      { data: srData,   unit: 'SR',   label: 'Best Strike Rates', icon: '💥', color: '#60A5FA' },
    economy: { data: econData, unit: 'Econ', label: 'Best Economies',    icon: '🎯', color: '#A78BFA' },
  };
  const activeExtra = extraCharts[extraTab];

  return (
    <section
      id="analytics"
      className="py-20 bg-icc-dark border-t border-icc-border/50"
      aria-labelledby="analytics-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 space-y-14">

        {/* ══ Section header ══ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Data Insights</p>
          <h2
            id="analytics-heading"
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
          >
            Analytics
          </h2>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
          <p className="text-icc-muted text-sm mt-4 max-w-lg mx-auto">
            Visual breakdown of the tournament&apos;s top performers across batting and bowling.
          </p>
        </motion.div>

        {/* ══ Top Performer hero cards ══ */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-black uppercase tracking-widest text-icc-muted mb-5"
          >
            ⭐ Top Performers
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformerCard
              delay={0} label="Highest Run Scorer" icon="🏏"
              name={topBatter?.striker}
              value={topBatter?.runs} unit="Runs"
              sub={`${topBatter?.balls ?? '—'} balls · SR ${topBatter?.strike_rate != null ? Number(topBatter.strike_rate).toFixed(1) : '—'}`}
              gradientFrom="#92620a" gradientTo="#1a1200"
            />
            <PerformerCard
              delay={0.08} label="Most Wickets" icon="⚡"
              name={topBowler?.bowler}
              value={topBowler?.wickets} unit="Wickets"
              sub={`Economy ${topBowler?.economy != null ? Number(topBowler.economy).toFixed(2) : '—'}`}
              gradientFrom="#0d5c2a" gradientTo="#0a1a10"
            />
            <PerformerCard
              delay={0.16} label="Best Strike Rate" icon="💥"
              name={srData[0]?.name}
              value={srData[0]?.value} unit="SR"
              sub="Fastest scoring rate (min. innings)"
              gradientFrom="#1e3a6e" gradientTo="#0a0f1e"
            />
            <PerformerCard
              delay={0.24} label="Best Economy" icon="🎯"
              name={econData[0]?.name}
              value={econData[0]?.value} unit="Econ"
              sub="Runs conceded per over"
              gradientFrom="#3b1c6e" gradientTo="#0f0a1e"
            />
          </div>
        </div>

        {/* ══ Always-visible dual bar charts ══ */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-xs font-black uppercase tracking-widest text-icc-muted mb-5"
          >
            📊 Run Scorers &amp; Wicket Takers
          </motion.p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimCard delay={0}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-icc-gold text-lg" aria-hidden="true">🏏</span>
                <p className="text-sm font-black uppercase tracking-wider text-white">Top Run Scorers</p>
                <span className="ml-auto text-[10px] font-bold text-icc-muted border border-icc-border rounded-full px-2 py-0.5 uppercase tracking-wider">
                  Top 10
                </span>
              </div>
              <ChartPanel data={runsData} dataKey="value" unit="runs" accentColor="#FFD700" height={300} />
            </AnimCard>

            <AnimCard delay={0.1}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg" aria-hidden="true">⚡</span>
                <p className="text-sm font-black uppercase tracking-wider text-white">Top Wicket Takers</p>
                <span className="ml-auto text-[10px] font-bold text-icc-muted border border-icc-border rounded-full px-2 py-0.5 uppercase tracking-wider">
                  Top 10
                </span>
              </div>
              <ChartPanel data={wicketsData} dataKey="value" unit="wickets" accentColor="#4ADE80" height={300} />
            </AnimCard>
          </div>
        </div>

        {/* ══ SR & Economy tabbed chart ══ */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xs font-black uppercase tracking-widest text-icc-muted"
            >
              📈 Advanced Stats
            </motion.p>
            <div
              className="inline-flex gap-1 p-1.5 rounded-2xl border border-icc-border"
              style={{ background: 'rgba(10,14,35,0.7)' }}
              role="tablist"
              aria-label="Advanced stats tabs"
            >
              {Object.entries(extraCharts).map(([key, { label, icon }]) => (
                <motion.button
                  key={key}
                  role="tab"
                  aria-selected={extraTab === key}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setExtraTab(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-200
                    ${extraTab === key
                      ? 'bg-icc-gold text-icc-dark shadow-md'
                      : 'text-icc-muted hover:text-white'}`}
                >
                  {icon} {label}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimCard delay={0}>
            <AnimatePresence mode="wait">
              <motion.div
                key={extraTab}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">{activeExtra.icon}</span>
                  <p className="text-sm font-black uppercase tracking-wider text-white">{activeExtra.label}</p>
                </div>
                <ChartPanel
                  data={activeExtra.data}
                  dataKey="value"
                  unit={activeExtra.unit}
                  accentColor={activeExtra.color}
                  height={280}
                />
              </motion.div>
            </AnimatePresence>
          </AnimCard>
        </div>

        {/* ══ Quick stat ribbon ══ */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {[
            { label: 'Top Score',   value: topBatter?.runs,    sub: topBatter?.striker?.split(' ').pop(), icon: '🏏', color: 'text-icc-gold' },
            { label: 'Top Wickets', value: topBowler?.wickets, sub: topBowler?.bowler?.split(' ').pop(),  icon: '⚡', color: 'text-green-400' },
            { label: 'Best SR',     value: srData[0]?.value,   sub: srData[0]?.name,                      icon: '💥', color: 'text-blue-400' },
            { label: 'Best Econ',   value: econData[0]?.value, sub: econData[0]?.name,                    icon: '🎯', color: 'text-purple-400' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="glass-card rounded-2xl p-5 flex flex-col gap-3 h-full"
              >
                <motion.span
                  className="text-xl inline-block" aria-hidden="true"
                  whileHover={{ scale: 1.3, rotate: -5 }} transition={{ duration: 0.25 }}
                >
                  {stat.icon}
                </motion.span>
                <div>
                  <p className={`font-condensed font-black text-3xl ${stat.color}`}>{stat.value ?? '—'}</p>
                  <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-icc-muted mt-0.5 truncate">{stat.sub ?? ''}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
});

AnalyticsSection.displayName = 'AnalyticsSection';
export default AnalyticsSection;
