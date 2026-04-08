import React from 'react';
import { getFlag } from '../utils';

const TeamWins = ({ teamWins, boundaries, tossDecision }) => {
  const maxWins = Math.max(...teamWins.map(t => t.wins));
  const totalToss = tossDecision.reduce((s, d) => s + d.count, 0);

  return (
    <div id="teams" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-2">Tournament Analysis</p>
        <h2 className="font-condensed text-5xl md:text-6xl font-black uppercase text-white">
          Team <span className="gold-text">Performance</span>
        </h2>
        <div className="section-divider max-w-xs mx-auto mt-4"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wins chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="font-condensed font-bold text-lg text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <span>🏆</span> Team Wins
          </h3>
          <div className="space-y-3">
            {teamWins.map((team, idx) => (
              <div key={team.team} className="flex items-center gap-3">
                <img src={getFlag(team.team)} alt={team.team}
                  className="w-8 h-5 object-cover rounded shadow-sm flex-shrink-0"
                  onError={e => e.target.src = 'https://flagcdn.com/w40/un.png'} />
                <span className="text-sm font-condensed text-gray-300 w-36 flex-shrink-0 uppercase tracking-wide truncate">{team.team}</span>
                <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] font-black transition-all duration-700"
                    style={{
                      width: `${(team.wins / maxWins) * 100}%`,
                      background: idx === 0 ? 'linear-gradient(90deg,#FFD700,#FF8C00)' :
                        idx === 1 ? 'linear-gradient(90deg,#C0C0C0,#808080)' :
                          idx === 2 ? 'linear-gradient(90deg,#CD7F32,#8B4513)' :
                            'linear-gradient(90deg,#3b82f6,#2563eb)',
                      color: idx < 3 ? '#000' : '#fff'
                    }}>
                    {team.wins}
                  </div>
                </div>
                <span className="text-yellow-400 font-black w-4 text-sm">{team.wins}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-5">
          {/* Toss decisions */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-condensed font-bold text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🪙</span> Toss Decisions
            </h3>
            <div className="space-y-3">
              {tossDecision.map(d => (
                <div key={d.decision}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 capitalize font-medium">{d.decision === 'bat' ? '🏏 Elected to Bat' : '🏃 Elected to Field'}</span>
                    <span className="text-yellow-400 font-bold">{d.count}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${(d.count / totalToss) * 100}%` }}>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{((d.count / totalToss) * 100).toFixed(1)}% of matches</p>
                </div>
              ))}
            </div>
          </div>

          {/* Boundaries */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-condensed font-bold text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💥</span> Most Boundaries
            </h3>
            <div className="space-y-2">
              {[...boundaries].sort((a, b) => (b.fours + b.sixes) - (a.fours + a.sixes)).slice(0, 8).map((b, idx) => (
                <div key={b.batting_team} className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs w-4">{idx + 1}</span>
                  <img src={getFlag(b.batting_team)} alt={b.batting_team}
                    className="w-7 h-5 object-cover rounded"
                    onError={e => e.target.src = 'https://flagcdn.com/w40/un.png'} />
                  <span className="text-xs text-gray-300 flex-1 truncate font-medium">{b.batting_team.replace('United States of America', 'USA')}</span>
                  <span className="text-emerald-400 text-xs font-bold">{b.fours}×4</span>
                  <span className="text-blue-400 text-xs font-bold">{b.sixes}×6</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamWins;
