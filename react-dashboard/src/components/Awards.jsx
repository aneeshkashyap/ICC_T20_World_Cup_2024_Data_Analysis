import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PLAYER_PHOTOS } from '../playerPhotos';

/* Stateful avatar so onError can fall back to the letter tile */
const AwardAvatar = ({ player, isTop }) => {
  const [imgError, setImgError] = useState(false);
  const photo = PLAYER_PHOTOS?.[player];
  const showPhoto = photo && !imgError;
  return (
    <div className={`w-16 h-16 rounded-full overflow-hidden ring-2 ${isTop ? 'ring-icc-gold' : 'ring-white/10'} shadow-lg`}>
      {showPhoto ? (
        <img
          src={photo}
          alt={player}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-icc-navy to-blue-900 flex items-center justify-center text-xl font-black text-white">
          {player?.charAt(0)}
        </div>
      )}
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: i => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Awards = ({ playerOfMatch }) => {
  return (
    <section id="awards" className="py-16 border-b border-icc-border/40" aria-labelledby="awards-heading">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="eyebrow mb-4" aria-hidden="true">Spotlight</p>
          <h2
            id="awards-heading"
            className="font-condensed font-black text-4xl sm:text-5xl text-white uppercase tracking-wide"
          >
            Player of the <span className="text-icc-gold">Match</span>
          </h2>
          <p className="text-icc-muted text-sm mt-2">Most impactful players across the tournament</p>
          <div className="w-16 h-0.5 bg-icc-gold rounded-full mx-auto mt-3" aria-hidden="true" />
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {playerOfMatch.map((entry, idx) => (
            <motion.div
              key={entry.player}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{
                y: -6, scale: 1.05,
                boxShadow: idx === 0
                  ? '0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.45), 0 0 32px rgba(255,215,0,0.18)'
                  : '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)',
              }}
              whileTap={{ scale: 0.97 }}
              className={`glass-card rounded-2xl p-4 text-center flex flex-col items-center gap-3 relative overflow-hidden cursor-default
                ${idx === 0 ? 'border border-icc-gold/40' : 'border border-white/[0.06]'}`}
            >
              {/* Count badge */}
              <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                ${idx === 0 ? 'bg-icc-gold text-icc-dark' : 'bg-white/10 text-gray-400'}`}>
                {entry.count}
              </div>

              {idx < 3 && (
                <div className="absolute top-2 left-3 text-base" aria-hidden="true">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
              )}

              {/* Gold shimmer strip top */}
              {idx === 0 && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-icc-gold/60 to-transparent"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              <AwardAvatar player={entry.player} isTop={idx === 0} />

              <div>
                <h4 className={`font-condensed font-black text-sm uppercase tracking-wide leading-tight
                  ${idx === 0 ? 'text-icc-gold' : 'text-white'}`}>
                  {entry.player}
                </h4>
                <p className="text-[10px] text-icc-muted mt-0.5">{entry.count} award{entry.count > 1 ? 's' : ''}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Awards;

/* Stateful avatar so onError can fall back to the letter tile */
const AwardAvatar = ({ player, isTop }) => {
  const [imgError, setImgError] = useState(false);
  const photo = PLAYER_PHOTOS?.[player];
  const showPhoto = photo && !imgError;
  return (
    <div className={`w-16 h-16 rounded-full overflow-hidden ring-2 ${isTop ? 'ring-yellow-400' : 'ring-white/10'} shadow-lg`}>
      {showPhoto ? (
        <img
          src={photo}
          alt={player}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-icc-navy to-blue-900 flex items-center justify-center text-xl font-black text-white">
          {player?.charAt(0)}
        </div>
      )}
    </div>
  );
};

const Awards = ({ playerOfMatch }) => {
  return (
    <section id="awards" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-yellow-400 text-sm font-bold uppercase tracking-widest mb-2">Spotlight</p>
        <h2 className="font-condensed text-5xl md:text-6xl font-black uppercase text-white">
          Player of the <span className="gold-text">Match</span>
        </h2>
        <p className="text-gray-400 mt-3">Most impactful players across the tournament</p>
        <div className="section-divider max-w-xs mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {playerOfMatch.map((entry, idx) => {
          return (
            <div key={entry.player}
              className={`glass rounded-2xl p-4 card-hover text-center flex flex-col items-center gap-3 relative overflow-hidden
                ${idx === 0 ? 'border border-yellow-400/40 glow-gold' : 'border border-white/5'}`}>

              {/* Count badge */}
              <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                ${idx === 0 ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                {entry.count}
              </div>

              {idx < 3 && (
                <div className="absolute top-2 left-3 text-base">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </div>
              )}

              {/* Avatar */}
              <AwardAvatar player={entry.player} isTop={idx === 0} />

              <div>
                <h4 className={`font-condensed font-black text-sm uppercase tracking-wide leading-tight ${idx === 0 ? 'text-yellow-400' : 'text-white'}`}>
                  {entry.player}
                </h4>
                <p className="text-[10px] text-gray-500 mt-0.5">{entry.count} award{entry.count > 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Awards;
