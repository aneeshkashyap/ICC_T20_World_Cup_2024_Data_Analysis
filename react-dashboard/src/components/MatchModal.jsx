import React, { useState } from 'react';
import { getFlag, getFlagCode } from '../utils';
import scorecards from '../scorecards.json';

/* ─── Helpers ─── */
const srColor  = sr  => sr >= 200 ? 'text-green-300 font-black' : sr >= 150 ? 'text-green-400 font-bold' : sr >= 120 ? 'text-amber-400 font-bold' : sr >= 80 ? 'text-orange-400' : 'text-red-400';
const econColor = e  => e <= 5 ? 'text-green-300 font-bold' : e <= 7 ? 'text-green-400' : e <= 9 ? 'text-amber-400' : e <= 11 ? 'text-orange-400' : 'text-red-400';

/* ─── Batting table ─── */
const BattingTable = ({ rows, total_runs, total_wickets, overs, extras }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="th-cell text-left w-1/3">Batter</th>
          <th className="th-cell text-left">Dismissal</th>
          <th className="th-cell text-center text-icc-gold">R</th>
          <th className="th-cell text-center">B</th>
          <th className="th-cell text-center text-green-400">4s</th>
          <th className="th-cell text-center text-blue-400">6s</th>
          <th className="th-cell text-center">SR</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
            <td className="td-cell font-bold text-white">{row.name}</td>
            <td className="td-cell text-xs text-icc-muted italic capitalize">{row.how_out || 'not out'}</td>
            <td className="td-cell text-center">
              <span className={`font-black text-base ${row.runs >= 50 ? 'text-icc-gold' : 'text-white'}`}>{row.runs}</span>
              {row.runs >= 100 && <span className="text-[9px] text-icc-gold ml-0.5">💯</span>}
              {row.runs >= 50 && row.runs < 100 && <span className="text-[9px] text-amber-400 ml-0.5">★</span>}
            </td>
            <td className="td-cell text-center text-icc-muted">{row.balls}</td>
            <td className="td-cell text-center font-semibold text-green-400">{row.fours}</td>
            <td className="td-cell text-center font-semibold text-blue-400">{row.sixes}</td>
            <td className={`td-cell text-center text-xs ${srColor(row.sr)}`}>{row.sr}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-white/10 bg-white/[0.02]">
          <td colSpan={2} className="px-3 py-2 text-xs text-icc-muted">
            Extras: <span className="text-white font-semibold">{extras}</span>
            <span className="mx-2 text-icc-border">·</span>
            Overs: <span className="text-white font-semibold">{overs}</span>
          </td>
          <td className="px-3 py-2 text-center">
            <span className="font-black text-icc-gold text-base">{total_runs}/{total_wickets}</span>
          </td>
          <td colSpan={4} />
        </tr>
      </tfoot>
    </table>
  </div>
);

/* ─── Bowling table ─── */
const BowlingTable = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="th-cell text-left">Bowler</th>
          <th className="th-cell text-center">O</th>
          <th className="th-cell text-center">M</th>
          <th className="th-cell text-center">R</th>
          <th className="th-cell text-center text-icc-gold">W</th>
          <th className="th-cell text-center text-orange-400">WD</th>
          <th className="th-cell text-center text-red-400">NB</th>
          <th className="th-cell text-center">Econ</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
            <td className="td-cell font-bold text-white">{row.name}</td>
            <td className="td-cell text-center text-icc-muted">{row.overs}</td>
            <td className="td-cell text-center text-icc-muted">{row.maidens}</td>
            <td className="td-cell text-center text-icc-muted">{row.runs}</td>
            <td className="td-cell text-center">
              <span className={`font-black text-base ${row.wickets >= 4 ? 'text-icc-gold' : row.wickets >= 2 ? 'text-green-400' : row.wickets === 1 ? 'text-blue-400' : 'text-icc-muted'}`}>
                {row.wickets}
              </span>
            </td>
            <td className="td-cell text-center text-orange-400">{row.wides || 0}</td>
            <td className="td-cell text-center text-red-400">{row.noballs || 0}</td>
            <td className={`td-cell text-center text-xs ${econColor(row.economy)}`}>{row.economy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ─── Innings panel ─── */
const InningPanel = ({ inning, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 text-left p-3 rounded-xl border transition-all
      ${active ? 'border-icc-gold/40 bg-icc-gold/[0.08]' : 'border-icc-border hover:border-white/20 hover:bg-white/[0.03]'}`}
  >
    <div className="flex items-center gap-1.5 mb-1.5">
      <img
        src={`https://flagcdn.com/w40/${getFlagCode(inning.batting_team)}.png`}
        alt=""
        className="w-6 h-4 object-cover rounded flex-shrink-0"
        onError={e => e.target.style.display = 'none'}
      />
      <span className="text-xs text-gray-300 font-medium truncate">{inning.batting_team}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className={`font-condensed font-black text-xl ${active ? 'text-icc-gold' : 'text-white'}`}>
        {inning.total_runs}/{inning.total_wickets}
      </span>
      <span className="text-[11px] text-icc-muted">({inning.overs} ov)</span>
    </div>
  </button>
);

/* ─── MatchModal ─── */
const MatchModal = ({ match, onClose }) => {
  const [activeInning, setActiveInning]  = useState(0);
  const [mainTab,      setMainTab]       = useState('scorecard');
  const [scorecardTab, setScorecardTab]  = useState('batting');

  if (!match) return null;

  const {
    match_num, date, team1, team2, winner, margin,
    venue, city, toss_winner, toss_decision, player_of_match,
    umpire1, umpire2, reserve_umpire, match_referee, match_type
  } = match;

  const matchNumber  = parseInt(match_num.replace('Match ', ''));
  const inningsList  = scorecards[matchNumber] || [];
  const currentInning = inningsList[activeInning] || null;
  const team1Won  = winner === team1;
  const team2Won  = winner === team2;

  const TYPE_CLASS = { Final: 'badge-final', 'Semi Final': 'badge-semi' };
  const typeBadge = TYPE_CLASS[match_type] || 'badge-group';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col max-h-[95vh] bg-icc-navy border border-icc-gold/15 shadow-card-hover"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="px-5 py-4 border-b border-icc-border bg-icc-gold/[0.04] flex-shrink-0">
          <div className="flex items-start gap-3 justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs text-icc-gold font-bold uppercase tracking-widest">{match_num}</span>
                <span className="text-icc-border">·</span>
                <span className="text-xs text-icc-muted">{date}</span>
                <span className={`badge ${typeBadge}`}>{match_type}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[{ team: team1, won: team1Won }, { team: team2, won: team2Won }].map(({ team, won }, idx) => (
                  <React.Fragment key={team}>
                    <div className="flex items-center gap-2">
                      <img src={getFlag(team)} alt={team}
                        className="w-8 h-5 rounded object-cover"
                        onError={e => e.target.style.display = 'none'} />
                      <span className={`font-condensed text-xl font-black uppercase ${won ? 'text-icc-gold' : 'text-white'}`}>{team}</span>
                      {won && <span>🏆</span>}
                    </div>
                    {idx === 0 && <span className="text-icc-muted font-black text-sm">VS</span>}
                  </React.Fragment>
                ))}
              </div>
              {winner && (
                <p className={`text-sm font-bold mt-1 ${winner === 'No Result' ? 'text-icc-muted' : 'text-green-400'}`}>
                  {winner === 'No Result' ? '⚠️ No Result' : `${winner} won by ${margin}`}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-icc-muted">
                <span>📍 {city}</span>
                {toss_winner && <span>🪙 {toss_winner?.split(' ').pop()} chose to {toss_decision}</span>}
                {player_of_match && <span>⭐ POTM: <span className="text-icc-gold">{player_of_match}</span></span>}
              </div>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 text-icc-muted hover:text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-all text-lg">
              ✕
            </button>
          </div>
        </div>

        {/* ── Main tabs ── */}
        <div className="flex border-b border-icc-border flex-shrink-0">
          {[['scorecard', '🏏 Scorecard'], ['info', 'ℹ️ Match Info']].map(([key, label]) => (
            <button key={key} onClick={() => setMainTab(key)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
                ${mainTab === key ? 'text-icc-gold border-b-2 border-icc-gold bg-icc-gold/[0.04]' : 'text-icc-muted hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">

          {/* Scorecard tab */}
          {mainTab === 'scorecard' && (
            <div className="p-4">
              {inningsList.length === 0 ? (
                <p className="text-center text-icc-muted py-16 text-sm">No ball-by-ball data available.</p>
              ) : (
                <>
                  {/* Innings selector */}
                  <div className={`grid gap-2 mb-4`} style={{ gridTemplateColumns: `repeat(${inningsList.length}, 1fr)` }}>
                    {inningsList.map((inn, idx) => (
                      <InningPanel key={idx} inning={inn} active={activeInning === idx}
                        onClick={() => { setActiveInning(idx); setScorecardTab('batting'); }} />
                    ))}
                  </div>

                  {/* Batting / bowling sub-tabs */}
                  {currentInning && (
                    <>
                      <div className="flex gap-2 mb-4">
                        {[['batting', '🏏 Batting'], ['bowling', '⚡ Bowling']].map(([k, label]) => (
                          <button key={k} onClick={() => setScorecardTab(k)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all
                              ${scorecardTab === k ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-icc-muted hover:text-white hover:bg-white/[0.05]'}`}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Table card */}
                      <div className="card-base rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-icc-border bg-white/[0.03] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/w40/${getFlagCode(scorecardTab === 'batting' ? currentInning.batting_team : currentInning.bowling_team)}.png`}
                              alt="" className="w-7 h-5 object-cover rounded"
                              onError={e => e.target.style.display = 'none'} />
                            <span className="font-condensed font-bold text-sm text-white uppercase tracking-wide">
                              {scorecardTab === 'batting' ? currentInning.batting_team : currentInning.bowling_team}
                              {scorecardTab === 'batting' ? ' Innings' : ' Bowling'}
                            </span>
                          </div>
                          {scorecardTab === 'batting' && (
                            <span className="font-condensed font-black text-icc-gold text-lg">
                              {currentInning.total_runs}/{currentInning.total_wickets}
                              <span className="text-icc-muted text-xs font-normal ml-1.5">({currentInning.overs} ov)</span>
                            </span>
                          )}
                        </div>

                        {scorecardTab === 'batting' && (
                          <BattingTable
                            rows={currentInning.batting}
                            total_runs={currentInning.total_runs}
                            total_wickets={currentInning.total_wickets}
                            overs={currentInning.overs}
                            extras={currentInning.extras}
                          />
                        )}
                        {scorecardTab === 'bowling' && <BowlingTable rows={currentInning.bowling} />}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Info tab */}
          {mainTab === 'info' && (
            <div className="p-5 flex flex-col gap-4">
              {/* Team flags */}
              <div className="grid grid-cols-2 gap-3">
                {[{ team: team1, won: team1Won }, { team: team2, won: team2Won }].map(({ team, won }) => (
                  <div key={team}
                    className={`card-base rounded-xl p-4 flex flex-col items-center gap-2
                      ${won ? 'border-icc-gold/25 bg-icc-gold/[0.06]' : ''}`}>
                    <img src={getFlag(team)} alt={team} className="w-14 h-10 object-cover rounded-lg shadow-card"
                      onError={e => e.target.style.display = 'none'} />
                    <span className="font-condensed text-xs font-bold uppercase tracking-wider text-center text-white">{team}</span>
                    {won && <span className="text-icc-gold text-xs font-bold">🏆 Winner</span>}
                  </div>
                ))}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Venue',          value: venue,           icon: '📍' },
                  { label: 'City',            value: city,            icon: '🏙️' },
                  { label: 'Toss Winner',     value: toss_winner,     icon: '🪙' },
                  { label: 'Toss Decision',   value: toss_decision?.toUpperCase(), icon: '🔄' },
                  { label: 'Match Referee',   value: match_referee,   icon: '👔' },
                  { label: 'Umpire 1',        value: umpire1,         icon: '🧑‍⚖️' },
                  { label: 'Umpire 2',        value: umpire2,         icon: '🧑‍⚖️' },
                  { label: 'Reserve Umpire',  value: reserve_umpire,  icon: '🧑‍⚖️' },
                  { label: 'Match Type',      value: match_type,      icon: '🏆' },
                ].filter(d => d.value).map(({ label, value, icon }) => (
                  <div key={label} className="card-base rounded-xl p-3">
                    <p className="text-[9px] text-icc-muted uppercase tracking-wider">{icon} {label}</p>
                    <p className="text-xs text-white font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* POTM */}
              {player_of_match && (
                <div className="flex items-center gap-4 bg-icc-gold/[0.08] border border-icc-gold/20 rounded-xl p-4">
                  <div className="w-12 h-12 rounded-full bg-icc-gold/20 flex items-center justify-center text-2xl flex-shrink-0">⭐</div>
                  <div>
                    <p className="text-[9px] text-icc-muted uppercase tracking-widest">Player of the Match</p>
                    <p className="font-condensed text-xl font-black text-icc-gold uppercase">{player_of_match}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
