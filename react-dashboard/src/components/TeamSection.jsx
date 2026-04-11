import React from 'react';
import { motion } from 'framer-motion';
import PlayerCard from './PlayerCard';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

const TeamSection = ({ teamName, teamFlag, players = [] }) => {
  if (!players.length) return null;

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Team header */}
      <div className="flex items-center justify-between gap-4 pb-3 mb-4 border-b border-icc-border">
        <div className="flex items-center gap-3">
          {teamFlag && (
            <img
              src={teamFlag}
              alt={teamName}
              className="w-9 h-6 object-cover rounded border border-white/10 shadow-card flex-shrink-0"
              onError={e => e.target.style.display = 'none'}
            />
          )}
          <div>
            <h3 className="font-condensed font-extrabold text-xl text-white uppercase tracking-wide leading-none">
              {teamName}
            </h3>
            <p className="text-xs text-icc-muted mt-0.5">
              {players.length} player{players.length !== 1 ? 's' : ''} in leaderboard
            </p>
          </div>
        </div>
        <span className="badge badge-blue">{players.length}</span>
      </div>

      {/* Player grid — staggered entrance */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {players.map((player, idx) => (
          <motion.div key={player.id || idx} variants={itemVariants}>
            <PlayerCard player={player} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TeamSection;
