/* ══════════════════════════════════════════════════════
   ICC T20 World Cup 2024 — Professional Dashboard JS
   ══════════════════════════════════════════════════════ */
'use strict';

/* ── Chart.js global defaults ── */
Chart.defaults.color = '#6b7a92';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;

/* ── Team flags ── */
const FLAGS = {
  'India': '🇮🇳', 'South Africa': '🇿🇦', 'Australia': '🇦🇺', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'West Indies': '🏝️', 'Afghanistan': '🇦🇫', 'Bangladesh': '🇧🇩', 'Pakistan': '🇵🇰',
  'New Zealand': '🇳🇿', 'Sri Lanka': '🇱🇰', 'Ireland': '🇮🇪', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Netherlands': '🇳🇱', 'Canada': '🇨🇦', 'Uganda': '🇺🇬', 'Namibia': '🇳🇦',
  'Oman': '🇴🇲', 'Nepal': '🇳🇵', 'Papua New Guinea': '🇵🇬',
  'United States of America': '🇺🇸',
};

/* ── Player photo map (local generated portraits + dynamic web photos) ── */
const localPhotos = {
  'Rahmanullah Gurbaz': 'images/players/gurbaz.png',
  'RG Sharma': 'images/players/rohit.png',
  'TM Head': 'images/players/head.png',
  'Q de Kock': 'images/players/dekock.png',
  'Ibrahim Zadran': 'images/players/ibrahim.png',
  'N Pooran': 'images/players/pooran.png',
};
const PLAYER_PHOTOS = typeof DYNAMIC_PLAYER_PHOTOS !== 'undefined'
  ? { ...DYNAMIC_PLAYER_PHOTOS, ...localPhotos }
  : localPhotos;

/* ── Player team & role map ── */
const PLAYER_TEAM = {
  'Rahmanullah Gurbaz': 'Afghanistan', 'RG Sharma': 'India', 'TM Head': 'Australia',
  'Q de Kock': 'South Africa', 'Ibrahim Zadran': 'Afghanistan', 'N Pooran': 'West Indies',
  'AGS Gous': 'United States of America', 'JC Buttler': 'England', 'SA Yadav': 'India',
  'H Klaasen': 'South Africa', 'PD Salt': 'England', 'DA Warner': 'Australia',
  'Aaron Jones': 'United States of America', 'RR Pant': 'India', 'MP Stoinis': 'Australia',
  'Arshdeep Singh': 'India', 'Fazalhaq Farooqi': 'Afghanistan', 'A Nortje': 'South Africa',
  'Naveen-ul-Haq': 'Afghanistan', 'JJ Bumrah': 'India', 'K Rabada': 'South Africa',
  'AS Joseph': 'West Indies', 'Rishad Hossain': 'Bangladesh', 'Rashid Khan': 'Afghanistan',
  'A Zampa': 'Australia', 'AD Russell': 'West Indies', 'HH Pandya': 'India',
  'KA Maharaj': 'South Africa', 'Tanzim Hasan Sakib': 'Bangladesh', 'AU Rashid': 'England',
};

/* ── Team jersey colors for avatar backgrounds ── */
const TEAM_COLORS = {
  'India': '#0047ab', 'Afghanistan': '#003087', 'Australia': '#ffe000',
  'South Africa': '#007749', 'West Indies': '#7b1fa2', 'England': '#cf142b',
  'Bangladesh': '#006a4e', 'Pakistan': '#01411c', 'New Zealand': '#000000',
  'Sri Lanka': '#002f7f', 'United States of America': '#002868',
};

/* ── Get player avatar HTML ── */
function playerAvatarHTML(name) {
  const photo = PLAYER_PHOTOS[name];
  if (photo) {
    return `<div class="player-avatar"><img src="${photo}" alt="${name}" onerror="this.parentElement.innerHTML='<span class=\\'player-initials\\'>${initials(name)}</span>'"/></div>`;
  }
  const team = PLAYER_TEAM[name] || '';
  const color = TEAM_COLORS[team] || '#1c3560';
  const textColor = ['Australia'].includes(team) ? '#1a1a1a' : '#f5c518';
  return `<div class="player-avatar" style="background:${color}"><span class="player-initials" style="color:${textColor}">${initials(name)}</span></div>`;
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}


/* ── Color palette ── */
const C = {
  gold: '#c9a227', goldL: '#e6be5a', navy: '#0a1628',
  green: '#22c55e', red: '#e95b5b', blue: '#3b82f6',
  teal: '#14b8a6', purple: '#a78bfa', orange: '#ea6c1a',
  grey: '#6b7a92', white: 'rgba(240,244,248,0.9)',
};

/* ── Tooltip style ── */
const TT = {
  backgroundColor: 'rgba(5,13,26,0.95)',
  borderColor: 'rgba(201,162,39,0.25)',
  borderWidth: 1, titleColor: '#e6be5a',
  bodyColor: '#b0bac8', padding: 12, cornerRadius: 8,
};

/* ── Shared chart bar options ── */
function barOpts(extra = {}) {
  return {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { ...TT, ...(extra.tooltip || {}) } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7a92' }, ...(extra.x || {}) },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7a92' }, ...(extra.y || {}) },
    },
    ...(extra.raw || {}),
  };
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
window.addEventListener('load', () => {
  runLoader(() => {
    initNavbar();
    initReveal();
    buildStats();
    buildMatchesSection();
    buildTeamsSection();
    buildRankings();
    buildPlayerStats();
    buildNews();
    initStatsTabs();
    initBackTop();
  });
});

/* ════════════════════════════════════════
   LOADER
════════════════════════════════════════ */
function runLoader(cb) {
  const bar = document.getElementById('loaderBar');
  let w = 0;
  const iv = setInterval(() => {
    w += 2 + Math.random() * 4;
    if (w >= 100) { w = 100; clearInterval(iv); }
    bar.style.width = w + '%';
    if (w >= 100) {
      setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        cb();
      }, 280);
    }
  }, 40);
}

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
function initNavbar() {
  const nb = document.getElementById('navbar');
  const hb = document.getElementById('hamburger');
  const menu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    nb.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  }, { passive: true });

  hb.addEventListener('click', () => {
    menu.classList.toggle('open');
    hb.classList.toggle('open');
  });
  menu.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => menu.classList.remove('open'))
  );
}

function updateActiveNav() {
  const ids = ['home', 'matches', 'teams', 'rankings', 'stats', 'news', 'insights'];
  let cur = 'home';
  ids.forEach(id => {
    const el = document.getElementById(id) || document.getElementById(
      id === 'home' ? 'home' : id
    );
    if (el && window.scrollY >= el.offsetTop - 90) cur = id;
  });
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.nav === cur)
  );
}

/* ════════════════════════════════════════
   REVEAL ON SCROLL
════════════════════════════════════════ */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.08 });
  document.querySelectorAll(
    '.stat-card,.team-card,.match-card,.news-card,.insight-card,.chart-card,.table-card'
  ).forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

/* ════════════════════════════════════════
   QUICK STATS CARDS
════════════════════════════════════════ */
function buildStats() {
  const items = [
    { icon: '🏟️', cls: 'ic-matches', val: WC_DATA.totalMatches, lbl: 'Matches Played' },
    { icon: '🏏', cls: 'ic-runs', val: WC_DATA.totalRuns, lbl: 'Total Runs' },
    { icon: '🎳', cls: 'ic-wickets', val: WC_DATA.totalWickets, lbl: 'Wickets Fallen' },
    { icon: '💥', cls: 'ic-sixes', val: WC_DATA.totalSixes, lbl: 'Sixes Hit' },
    { icon: '4️⃣', cls: 'ic-fours', val: WC_DATA.totalFours, lbl: 'Fours Hit' },
    { icon: '🌍', cls: 'ic-teams', val: WC_DATA.totalTeams, lbl: 'Nations' },
    { icon: '🗓️', cls: 'ic-days', val: 29, lbl: 'Tournament Days' },
    { icon: '📍', cls: 'ic-venues', val: 9, lbl: 'Venues' },
  ];
  const grid = document.getElementById('statsGrid');
  items.forEach(it => {
    const d = document.createElement('div');
    d.className = 'stat-card reveal';
    d.innerHTML = `
      <div class="stat-icon ${it.cls}">${it.icon}</div>
      <div class="stat-info">
        <div class="stat-val">${Number(it.val).toLocaleString()}</div>
        <div class="stat-lbl">${it.lbl}</div>
      </div>`;
    grid.appendChild(d);
  });
  observeReveal(grid.querySelectorAll('.reveal'));
}

/* ════════════════════════════════════════
   MATCHES
════════════════════════════════════════ */
let _activeStage = 'All';
let _searchTerm = '';

function buildMatchesSection() {
  renderMatches();

  // Stage tabs
  document.querySelectorAll('#matchTabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#matchTabs .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _activeStage = btn.dataset.stage;
      renderMatches();
    });
  });

  // Search
  document.getElementById('matchSearch').addEventListener('input', e => {
    _searchTerm = e.target.value.toLowerCase();
    renderMatches();
  });
}

function renderMatches() {
  const grid = document.getElementById('matchesGrid');
  const meta = document.getElementById('resultsCount');
  grid.innerHTML = '';

  let data = WC_DATA.matches;
  if (_activeStage !== 'All') data = data.filter(m => m.match_type === _activeStage);
  if (_searchTerm) data = data.filter(m =>
    [m.team1, m.team2, m.venue, m.city, m.winner].some(v => v && v.toLowerCase().includes(_searchTerm))
  );

  meta.textContent = `Showing ${data.length} of ${WC_DATA.matches.length} matches`;

  data.forEach((m, i) => {
    const isFinal = m.match_type === 'Final';
    const isSemi = m.match_type === 'Semi Final';
    const t1Won = m.winner === m.team1;
    const t2Won = m.winner === m.team2;
    const hasRes = m.winner && m.winner !== 'No Result';

    let cardCls = ''; let badgeCls = 'sb-group'; let badgeTxt = 'Group';
    if (isFinal) { cardCls = 'mc-final'; badgeCls = 'sb-final'; badgeTxt = 'Final'; }
    else if (isSemi) { cardCls = 'mc-semi'; badgeCls = 'sb-semi'; badgeTxt = 'Semi Final'; }

    let margin = '';
    if (m.winner_runs) margin = `by ${m.winner_runs} runs`;
    else if (m.winner_wickets) margin = `by ${m.winner_wickets} wkt${m.winner_wickets !== 1 ? 's' : ''}`;

    const dateStr = m.date ? new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const f1 = FLAGS[m.team1] || '🏏';
    const f2 = FLAGS[m.team2] || '🏏';

    const card = document.createElement('div');
    card.className = `match-card ${cardCls} reveal`;
    card.style.transitionDelay = `${(i % 8) * 30}ms`;
    card.innerHTML = `
      <div class="match-header">
        <div><span class="match-num">M${m.match_number}</span> <span class="match-date">${dateStr}</span></div>
        <span class="stage-badge ${badgeCls}">${badgeTxt}</span>
      </div>
      <div class="match-teams">
        <div class="match-team">
          <div class="team-flag-big">${f1}</div>
          <div class="team-name-card ${t1Won ? 'won' : ''}">${m.team1}${t1Won ? ' ✓' : ''}</div>
        </div>
        <div class="vs-text">VS</div>
        <div class="match-team">
          <div class="team-flag-big">${f2}</div>
          <div class="team-name-card ${t2Won ? 'won' : ''}">${m.team2}${t2Won ? ' ✓' : ''}</div>
        </div>
      </div>
      <div class="match-result-bar">
        ${hasRes && m.winner !== 'No Result'
        ? `<div class="win-text"><strong>${m.winner}</strong> <span class="win-margin">${margin}</span></div>`
        : `<div class="no-result">No Result / Abandoned</div>`}
        <div class="match-venue">📍 ${m.venue}, ${m.city}</div>
        ${m.player_of_match ? `<div class="match-pom">⭐ ${m.player_of_match}</div>` : ''}
      </div>`;
    grid.appendChild(card);
  });
  observeReveal(grid.querySelectorAll('.reveal'));
}

/* ════════════════════════════════════════
   TEAMS
════════════════════════════════════════ */
function buildTeamsSection() {
  buildTeamCards();
  buildBoundaryChart();
}

function buildTeamCards() {
  const grid = document.getElementById('teamsGrid');
  const winsMap = {};
  WC_DATA.teamWins.forEach(w => winsMap[w.team] = w.wins);

  const allTeams = [...new Set([
    ...WC_DATA.matches.map(m => m.team1),
    ...WC_DATA.matches.map(m => m.team2),
  ])].filter(Boolean).sort();

  allTeams.forEach(team => {
    const wins = winsMap[team] || 0;
    const isChamp = team === 'India';
    const card = document.createElement('div');
    card.className = `team-card reveal${isChamp ? ' champion' : ''}`;
    card.innerHTML = `
      <div class="tc-flag">${FLAGS[team] || '🏏'}</div>
      <div class="tc-name">${team}</div>
      <div class="tc-wins">${wins}</div>
      <div class="tc-wins-lbl">Win${wins !== 1 ? 's' : ''}</div>`;
    grid.appendChild(card);
  });
  observeReveal(grid.querySelectorAll('.reveal'));
}

function buildBoundaryChart() {
  const bounds = WC_DATA.boundaries.slice(0, 14);
  const labels = bounds.map(b => shortTeam(b.batting_team));
  const ctx = document.getElementById('boundaryChart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Fours', data: bounds.map(b => b.fours), backgroundColor: 'rgba(201,162,39,0.75)', borderRadius: 4 },
        { label: 'Sixes', data: bounds.map(b => b.sixes), backgroundColor: 'rgba(233,91,91,0.75)', borderRadius: 4 },
      ],
    },
    options: {
      ...barOpts({ x: { ticks: { maxRotation: 45 } } }),
      plugins: {
        legend: {
          display: true, position: 'top',
          labels: { color: '#b0bac8', font: { size: 12 }, padding: 16 }
        },
        tooltip: { ...TT },
      },
    },
  });
}

/* ════════════════════════════════════════
   RANKINGS
════════════════════════════════════════ */
function buildRankings() {
  buildRankingsTable();
  buildWinsChart();
  buildTossChart();
}

function buildRankingsTable() {
  const wins = WC_DATA.teamWins;
  const tbody = document.getElementById('rankingsBody');

  // Count total matches per team
  const matchCount = {};
  WC_DATA.matches.forEach(m => {
    matchCount[m.team1] = (matchCount[m.team1] || 0) + 1;
    matchCount[m.team2] = (matchCount[m.team2] || 0) + 1;
  });

  wins.forEach((w, i) => {
    const total = matchCount[w.team] || 1;
    const pct = ((w.wins / total) * 100).toFixed(0);
    const medals = ['🥇', '🥈', '🥉'];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="rank-col">${i < 3 ? `<span class="rank-medal">${medals[i]}</span>` : i + 1}</td>
      <td class="team-col">${FLAGS[w.team] || '🏏'} ${w.team}</td>
      <td class="wins-col">${w.wins}</td>
      <td>${total}</td>
      <td class="win-pct-col">${pct}%</td>`;
    tbody.appendChild(tr);
  });
}

function buildWinsChart() {
  const wins = WC_DATA.teamWins.slice(0, 10);
  const teamColors = wins.map(w => {
    const map = {
      'India': 'rgba(30,144,255,0.8)', 'South Africa': 'rgba(22,163,74,0.8)',
      'Australia': 'rgba(201,162,39,0.8)', 'England': 'rgba(214,59,59,0.8)',
      'West Indies': 'rgba(124,58,237,0.8)', 'Afghanistan': 'rgba(20,184,166,0.8)',
    };
    return map[w.team] || 'rgba(176,186,200,0.6)';
  });
  new Chart(document.getElementById('winsChart'), {
    type: 'bar',
    data: {
      labels: wins.map(w => shortTeam(w.team)),
      datasets: [{ data: wins.map(w => w.wins), backgroundColor: teamColors, borderRadius: 6, borderSkipped: false }],
    },
    options: barOpts({
      tooltip: { callbacks: { label: ctx => ` Wins: ${ctx.raw}` } },
      y: { ticks: { stepSize: 1 }, title: { display: true, text: 'Wins', color: '#6b7a92' } },
    }),
  });
}

function buildTossChart() {
  const toss = WC_DATA.tossDecision;
  new Chart(document.getElementById('tossChart'), {
    type: 'doughnut',
    data: {
      labels: toss.map(t => t.decision === 'field' ? 'Field First' : 'Bat First'),
      datasets: [{
        data: toss.map(t => t.count),
        backgroundColor: ['rgba(22,163,74,0.8)', 'rgba(201,162,39,0.8)'],
        borderColor: ['rgba(22,163,74,0.3)', 'rgba(201,162,39,0.3)'],
        borderWidth: 2, hoverOffset: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '65%',
      plugins: {
        legend: {
          display: true, position: 'bottom',
          labels: { color: '#b0bac8', font: { size: 12 }, padding: 16 }
        },
        tooltip: {
          ...TT,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / 52 * 100)}%)` }
        },
      },
    },
  });
}

/* ════════════════════════════════════════
   PLAYER STATS
════════════════════════════════════════ */
let _battData = [...WC_DATA.topBatters];
let _bowlData = [...WC_DATA.topBowlers];
let _battChart = null;
let _bowlChartW = null, _bowlChartE = null;

function buildPlayerStats() {
  buildPlayersShowcase();
  renderBattingChart(_battData.slice(0, 10));
  renderBattingTable(_battData);
  renderBowlingCharts(_bowlData.slice(0, 10));
  renderBowlingTable(_bowlData);

  // Batting sort
  document.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.sort;
      _battData = [...WC_DATA.topBatters].sort((a, b) => b[key] - a[key]);
      renderBattingChart(_battData.slice(0, 10));
      renderBattingTable(_battData);
    });
  });

  // Bowling sort
  document.querySelectorAll('[data-bsort]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-bsort]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.bsort;
      _bowlData = key === 'economy'
        ? [...WC_DATA.topBowlers].filter(b => b.overs >= 2).sort((a, b) => a[key] - b[key])
        : [...WC_DATA.topBowlers].sort((a, b) => b[key] - a[key]);
      renderBowlingCharts(_bowlData.slice(0, 10));
      renderBowlingTable(_bowlData);
    });
  });
}

function renderBattingChart(data) {
  const ctx = document.getElementById('battingChart');
  if (_battChart) _battChart.destroy();
  _battChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(p => shortName(p.striker)),
      datasets: [
        { label: 'Runs', data: data.map(p => p.runs), backgroundColor: 'rgba(201,162,39,0.8)', borderRadius: 5, borderSkipped: false, yAxisID: 'y' },
        {
          label: 'Strike Rate', data: data.map(p => p.strike_rate), type: 'line',
          borderColor: C.teal, backgroundColor: 'rgba(20,184,166,0.1)',
          pointBackgroundColor: C.teal, pointRadius: 4, tension: 0.4, fill: true, yAxisID: 'y1'
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#b0bac8' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#6b7a92' }, title: { display: true, text: 'Runs', color: '#6b7a92' } },
        y1: { position: 'right', grid: { display: false }, ticks: { color: C.teal }, title: { display: true, text: 'Strike Rate', color: C.teal } },
      },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#b0bac8', padding: 16 } },
        tooltip: { ...TT },
      },
    },
  });
}

function renderBattingTable(data) {
  const tbody = document.getElementById('battingBody');
  tbody.innerHTML = '';
  data.forEach((p, i) => {
    const bPct = ((p.fours + p.sixes) / p.balls * 100).toFixed(1);
    const bW = Math.min(80, parseFloat(bPct));
    const medals = ['🥇', '🥈', '🥉'];
    const srColor = p.strike_rate >= 150 ? C.green : p.strike_rate >= 120 ? C.gold : '#b0bac8';
    const team = PLAYER_TEAM[p.striker] || '';
    const flag = FLAGS[team] || '🏏';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="dt-rank">${i < 3 ? medals[i] : i + 1}</td>
      <td>
        <div class="player-cell">
          ${playerAvatarHTML(p.striker)}
          <div class="player-name-wrap">
            <span class="player-full-name">${p.striker}</span>
            <span class="player-country">${flag} ${team}</span>
          </div>
        </div>
      </td>
      <td class="dt-hi">${p.runs}</td>
      <td>${p.balls}</td>
      <td style="color:${C.gold}">${p.fours}</td>
      <td style="color:${C.red}">${p.sixes}</td>
      <td style="color:${srColor};font-weight:700">${p.strike_rate}</td>
      <td>
        <div class="mini-bar-wrap">
          <div class="mini-bar" style="width:${bW}px"></div>
          <span style="font-size:0.8rem">${bPct}%</span>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderBowlingCharts(data) {
  const labels = data.map(p => shortName(p.bowler));

  const ctx1 = document.getElementById('bowlingWktsChart');
  if (_bowlChartW) _bowlChartW.destroy();
  _bowlChartW = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Wickets', data: data.map(p => p.wickets),
        backgroundColor: 'rgba(233,91,91,0.8)', borderRadius: 5, borderSkipped: false
      }]
    },
    options: barOpts({
      x: { ticks: { maxRotation: 40 } },
      tooltip: { callbacks: { label: ctx => ` Wickets: ${ctx.raw}` } },
    }),
  });

  const ctx2 = document.getElementById('bowlingEconChart');
  if (_bowlChartE) _bowlChartE.destroy();
  _bowlChartE = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Economy', data: data.map(p => p.economy),
        backgroundColor: data.map(p => p.economy <= 6.5 ? 'rgba(22,163,74,0.8)' : p.economy <= 8 ? 'rgba(201,162,39,0.8)' : 'rgba(233,91,91,0.8)'),
        borderRadius: 5, borderSkipped: false,
      }]
    },
    options: barOpts({
      x: { ticks: { maxRotation: 40 } },
      y: { title: { display: true, text: 'Runs/Over', color: '#6b7a92' } },
      tooltip: {
        callbacks: {
          label: ctx => ` Economy: ${ctx.raw}`,
          afterLabel: ctx => ctx.raw <= 6.5 ? ' ✅ Excellent' : ctx.raw <= 8 ? ' ⚠️ Average' : ' ❌ Expensive',
        },
      },
    }),
  });
}

function renderBowlingTable(data) {
  const tbody = document.getElementById('bowlingBody');
  tbody.innerHTML = '';
  data.forEach((p, i) => {
    const dotPct = ((p.dots / p.balls) * 100).toFixed(1);
    const dW = Math.min(70, parseFloat(dotPct));
    const econColor = p.economy <= 6.5 ? C.green : p.economy <= 8 ? C.gold : C.red;
    const medals = ['🥇', '🥈', '🥉'];
    const team = PLAYER_TEAM[p.bowler] || '';
    const flag = FLAGS[team] || '🏏';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="dt-rank">${i < 3 ? medals[i] : i + 1}</td>
      <td>
        <div class="player-cell">
          ${playerAvatarHTML(p.bowler)}
          <div class="player-name-wrap">
            <span class="player-full-name">${p.bowler}</span>
            <span class="player-country">${flag} ${team}</span>
          </div>
        </div>
      </td>
      <td class="dt-hi">${p.wickets}</td>
      <td>${p.balls}</td>
      <td>${p.runs_given}</td>
      <td style="color:${econColor};font-weight:700">${p.economy}</td>
      <td>${p.dots}</td>
      <td>
        <div class="mini-bar-wrap">
          <div class="mini-bar" style="width:${dW}px;background:linear-gradient(90deg,${C.blue},${C.teal})"></div>
          <span style="font-size:0.8rem">${dotPct}%</span>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ════════════════════════════════════════
   PLAYERS SHOWCASE GRID
════════════════════════════════════════ */
function buildPlayersShowcase() {
  // Data for showcase: mix of top batters + top bowlers
  const showcasePlayers = [
    { name: 'Rahmanullah Gurbaz', role: 'Top Run Scorer', stat: '281', statLbl: 'Runs', team: 'Afghanistan' },
    { name: 'RG Sharma', role: 'India Captain', stat: '257', statLbl: 'Runs', team: 'India' },
    { name: 'TM Head', role: 'Power Hitter', stat: '255', statLbl: 'Runs', team: 'Australia' },
    { name: 'Q de Kock', role: 'Wicketkeeper-Bat', stat: '243', statLbl: 'Runs', team: 'South Africa' },
    { name: 'Ibrahim Zadran', role: 'Opening Bat', stat: '231', statLbl: 'Runs', team: 'Afghanistan' },
    { name: 'N Pooran', role: 'WI Captain & Bat', stat: '228', statLbl: 'Runs', team: 'West Indies' },
    { name: 'Arshdeep Singh', role: 'Leading Wicket-Taker', stat: '18', statLbl: 'Wickets', team: 'India' },
    { name: 'Fazalhaq Farooqi', role: 'Pace Spearhead', stat: '17', statLbl: 'Wickets', team: 'Afghanistan' },
    { name: 'A Nortje', role: 'Fastest Bowler', stat: '16', statLbl: 'Wickets', team: 'South Africa' },
    { name: 'Naveen-ul-Haq', role: 'Seam Bowler', stat: '16', statLbl: 'Wickets', team: 'Afghanistan' },
    { name: 'JJ Bumrah', role: 'Death Over Specialist', stat: '15', statLbl: 'Wickets', team: 'India' },
    { name: 'Rashid Khan', role: 'Leg-Spin Legend', stat: '14', statLbl: 'Wickets', team: 'Afghanistan' },
  ];

  const wrap = document.getElementById('playersShowcase');
  if (!wrap) return;
  wrap.innerHTML = '';

  showcasePlayers.forEach(p => {
    const photo = PLAYER_PHOTOS[p.name];
    const flag = FLAGS[p.team] || '🏏';
    const color = TEAM_COLORS[p.team] || '#1c3560';
    const txtColor = p.team === 'Australia' ? '#1a1a1a' : '#f5c518';

    const card = document.createElement('div');
    card.className = 'player-showcase-card reveal';
    card.innerHTML = `
      <div class="player-showcase-img" style="background:${color}22">
        ${photo
        ? `<img src="${photo}" alt="${p.name}" onerror="this.style.display='none'"/>`
        : `<div class="player-placeholder" style="background:linear-gradient(135deg,${color}44,${color}22)">
               <span style="font-family:'Barlow Condensed',sans-serif;font-size:3rem;font-weight:800;color:${txtColor};opacity:0.7">${initials(p.name)}</span>
             </div>`}
        <span class="player-flag">${flag}</span>
      </div>
      <div class="player-showcase-body">
        <div class="player-showcase-name">${p.name}</div>
        <div class="player-showcase-role">${p.role}</div>
        <div class="player-showcase-stat">${p.stat}</div>
        <div class="player-showcase-stat-lbl">${p.statLbl}</div>
      </div>`;
    wrap.appendChild(card);
  });
  observeReveal(wrap.querySelectorAll('.reveal'));
}

/* ════════════════════════════════════════
   STATS TABS (Batting / Bowling)
════════════════════════════════════════ */
function initStatsTabs() {
  document.querySelectorAll('#statsTabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#statsTabs .tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.dataset.panel;
      document.getElementById('panelBatting').classList.toggle('hidden', panel !== 'batting');
      document.getElementById('panelBowling').classList.toggle('hidden', panel !== 'bowling');
    });
  });
}

/* ════════════════════════════════════════
   NEWS / KEY MOMENTS
════════════════════════════════════════ */
function buildNews() {
  const stories = [
    {
      emoji: '🏆', bg: 'linear-gradient(135deg,#1a2e4a,#0a1628)',
      tag: 'Final', title: 'India Crowned T20 World Champions',
      excerpt: 'India defeated South Africa by 7 runs in a nail-biting final at Kensington Oval, Barbados — completing an unbeaten run through the tournament.'
    },
    {
      emoji: '⚡', bg: 'linear-gradient(135deg,#1a2e40,#0d1b2e)',
      tag: 'Upset of the Tournament', title: 'USA Stuns Pakistan in Super Over',
      excerpt: 'In one of the biggest upsets in cricket history, the United States of America tied with Pakistan and won the super over at Grand Prairie Stadium, Dallas.'
    },
    {
      emoji: '🎳', bg: 'linear-gradient(135deg,#1a2840,#0a1628)',
      tag: 'Bowling Masterclass', title: 'Arshdeep Singh — Wicket Machine',
      excerpt: 'Arshdeep Singh topped the wicket charts for India, consistently troubling batters with swing and seam — playing a pivotal role in India\'s title run.'
    },
    {
      emoji: '🏏', bg: 'linear-gradient(135deg,#1d2e1a,#0a1628)',
      tag: 'Batting', title: 'Rahmanullah Gurbaz Lights Up the Tournament',
      excerpt: 'The Afghanistan opener was the leading run scorer, showing explosive form from ball one. His aggressive stroke play set the tone for Afghanistan\'s campaign.'
    },
    {
      emoji: '🌀', bg: 'linear-gradient(135deg,#2a1a40,#0a1628)',
      tag: 'Spin Magic', title: "Afghanistan's Spin Unit Baffles World Cricket",
      excerpt: "Rashid Khan, Noor Ahmad and Naveen-ul-Haq created one of the most feared bowling combinations — spinning a web against some of the world's best batters."
    },
    {
      emoji: '📍', bg: 'linear-gradient(135deg,#1a2438,#0a1628)',
      tag: 'Venues', title: 'New York Drops the Ball — and Wickets',
      excerpt: 'The drop-in pitches at Nassau County International Cricket Stadium produced seam-friendly conditions, creating memorable upsets and low-scoring thrillers.'
    },
  ];

  const grid = document.getElementById('newsGrid');
  stories.forEach(s => {
    const card = document.createElement('div');
    card.className = 'news-card reveal';
    card.innerHTML = `
      <div class="news-img" style="background:${s.bg}">
        <span style="position:relative;z-index:1;font-size:3.5rem">${s.emoji}</span>
        <div class="news-img-overlay"></div>
      </div>
      <div class="news-body">
        <div class="news-tag">${s.tag}</div>
        <div class="news-title">${s.title}</div>
        <div class="news-excerpt">${s.excerpt}</div>
      </div>`;
    grid.appendChild(card);
  });
  observeReveal(grid.querySelectorAll('.reveal'));

  // POM chart
  buildPOMChart();
}

function buildPOMChart() {
  const pom = WC_DATA.playerOfMatch;
  const colors = [C.gold, C.orange, C.teal, C.blue, C.purple, C.red, C.green, '#60a5fa', '#f472b6', '#a3e635'];
  new Chart(document.getElementById('pomChart'), {
    type: 'bar',
    data: {
      labels: pom.map(p => shortName(p.player)),
      datasets: [{
        data: pom.map(p => p.count),
        backgroundColor: pom.map((_, i) => colors[i % colors.length] + 'cc'),
        borderRadius: 6, borderSkipped: false,
      }],
    },
    options: {
      ...barOpts({
        raw: { indexAxis: 'y' },
        x: { ticks: { stepSize: 1 } },
        tooltip: { callbacks: { label: ctx => ` Player of the Match: ${ctx.raw}×` } },
      })
    },
  });
}

/* ════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════ */
function initBackTop() {
  const btn = document.getElementById('backTop');
  window.addEventListener('scroll', () =>
    btn.classList.toggle('visible', window.scrollY > 500), { passive: true }
  );
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════
   UTILITIES
════════════════════════════════════════ */
function observeReveal(els) {
  const io = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
    { threshold: 0.06 }
  );
  els.forEach(el => io.observe(el));
}

function shortName(n) {
  if (!n) return '';
  const p = n.trim().split(' ');
  return p.length === 1 ? n : p[0][0] + '. ' + p.slice(1).join(' ');
}

function shortTeam(n) {
  const m = {
    'United States of America': 'USA', 'Papua New Guinea': 'PNG',
    'South Africa': 'SA', 'West Indies': 'WI', 'New Zealand': 'NZ',
    'Afghanistan': 'AFG', 'Bangladesh': 'BAN', 'Australia': 'AUS',
    'Netherlands': 'NED', 'Sri Lanka': 'SL', 'England': 'ENG',
  };
  return m[n] || n;
}
