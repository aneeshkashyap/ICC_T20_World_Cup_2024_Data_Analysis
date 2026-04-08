import React from 'react';
import PlayerCard from './PlayerCard';

const PlayersSection = ({ players }) => {
  return (
    <section className="bg-[#091526] py-16" id="players">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-white">Featured <span className="text-icc-gold">Players</span></h2>
          <div className="h-1 w-20 bg-icc-gold mx-auto mt-4"></div>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Top performers leading the charge at the World Cup</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {players.slice(0, 10).map((player, idx) => (
            <PlayerCard key={idx} {...player} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default PlayersSection;
