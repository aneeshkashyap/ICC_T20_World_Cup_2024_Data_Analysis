import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LabelList,
} from 'recharts';

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-3 text-sm shadow-xl border border-icc-gold/20">
      <p className="font-bold text-white mb-1">{label}</p>
      <p className="text-icc-gold font-black text-lg">
        {payload[0].value.toLocaleString()}
        <span className="text-xs text-icc-muted ml-1 font-normal">{unit}</span>
      </p>
    </div>
  );
};

/* ── Bar chart panel ── */
const ChartPanel = memo(({ data, dataKey, unit, color, label }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 48 }}
      barCategoryGap="35%">
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,156,200,0.1)" vertical={false} />
      <XAxis dataKey="name"
        tick={{ fill: '#8B9CC8', fontSize: 10, fontWeight: 600 }}
        axisLine={false} tickLine={false}
        angle={-40} textAnchor="end" interval={0} />
      <YAxis tick={{ fill: '#8B9CC8', fontSize: 10 }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(255,215,0,0.04)' }} />
      <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
        {data.map((_, i) => (
          <Cell key={i}
            fill={i === 0 ? '#FFD700' : i === 1 ? 'rgba(255,215,0,0.7)' : 'rgba(255,215,0,0.35)'}
          />
        ))}
        <LabelList dataKey={dataKey} position="top"
          style={{ fill: '#8B9CC8', fontSize: 9, fontWeight: 600 }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

/* ── Card wrapper with animation ── */
const AnimCard = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className="glass-card rounded-2xl p-6 flex flex-col gap-4"
  >
    {children}
  </motion.div>
);

/* ── Analytics Section ── */
const AnalyticsSection = memo(({ batters = [], bowlers = [] }) => {
  const [tab, setTab] = useState('runs');

  const runsData = batters
    .slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: b.runs }));

  const wicketsData = bowlers
    .slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: b.wickets }));

  const srData = batters
    .filter(b => b.strike_rate != null)
    .sort((a, b) => b.strike_rate - a.strike_rate)
    .slice(0, 10)
    .map(b => ({ name: b.striker?.split(' ').pop() || b.striker, value: Math.round(Number(b.strike_rate)) }));

  const econData = bowlers
    .filter(b => b.economy != null)
    .sort((a, b) => a.economy - b.economy)
    .slice(0, 10)
    .map(b => ({ name: b.bowler?.split(' ').pop() || b.bowler, value: Number(b.economy).toFixed(2) }));

  const charts = {
    runs:     { data: runsData,    dataKey: 'value', unit: 'runs',    label: 'Top Run Scorers',   icon: '🏏' },
    wickets:  { data: wicketsData, dataKey: 'value', unit: 'wickets', label: 'Top Wicket Takers', icon: '⚡' },
    sr:       { data: srData,      dataKey: 'value', unit: 'SR',      label: 'Best Strike Rates',  icon: '💥' },
    economy:  { data: econData,    dataKey: 'value', unit: 'Econ',    label: 'Best Economies',     icon: '🎯' },
  };

  const current = charts[tab];

  return (
    <section id="analytics" className="py-20 bg-icc-dark border-t border-icc-border/50"
      aria-labelledby="analytics-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Data Insights</p>
          <h2 id="analytics-heading"
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide">
            Analytics
          </h2>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-1 p-1.5 rounded-2xl bg-icc-navy/60 border border-icc-border"
            role="tablist" aria-label="Analytics tabs">
            {Object.entries(charts).map(([key, { label, icon }]) => (
              <motion.button key={key}
                role="tab"
                aria-selected={tab === key}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setTab(key)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-200
                  ${tab === key
                    ? 'bg-icc-gold text-icc-dark shadow-md'
                    : 'text-icc-muted hover:text-white'}`}>
                <motion.span
                  aria-hidden="true"
                  className="inline-block mr-1"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                  transition={{ duration: 0.35 }}
                >{icon} </motion.span>{label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main chart — AnimatePresence for smooth tab cross-fade */}
        <AnimCard delay={0}>
          <p className="text-xs font-bold uppercase tracking-widest text-icc-muted">
            {current.icon} {current.label}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ChartPanel
                data={current.data}
                dataKey={current.dataKey}
                unit={current.unit}
                label={current.label}
              />
            </motion.div>
          </AnimatePresence>
        </AnimCard>

        {/* Mini stat cards — stagger entrance */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
        >
          {[
            { label: 'Top Score',   value: batters[0]?.runs,             sub: batters[0]?.striker?.split(' ').pop(),  icon: '🏏', color: 'text-icc-gold' },
            { label: 'Top Wickets', value: bowlers[0]?.wickets,          sub: bowlers[0]?.bowler?.split(' ').pop(),   icon: '⚡', color: 'text-green-400' },
            { label: 'Best SR',     value: srData[0]?.value,             sub: srData[0]?.name,                        icon: '💥', color: 'text-blue-400' },
            { label: 'Best Econ',   value: econData[econData.length-1]?.value, sub: econData[econData.length-1]?.name, icon: '🎯', color: 'text-purple-400' },
          ].map((stat) => (
            <motion.div key={stat.label}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
            >
              <AnimCard delay={0}>
                <motion.span className="text-xl inline-block" aria-hidden="true"
                  whileHover={{ scale: 1.3, rotate: -5 }} transition={{ duration: 0.25 }}>
                  {stat.icon}
                </motion.span>
                <div>
                  <p className={`font-condensed font-black text-3xl ${stat.color}`}>{stat.value ?? '—'}</p>
                  <p className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">{stat.label}</p>
                  <p className="text-[10px] text-icc-muted mt-0.5 truncate">{stat.sub ?? ''}</p>
                </div>
              </AnimCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

AnalyticsSection.displayName = 'AnalyticsSection';
export default AnalyticsSection;
