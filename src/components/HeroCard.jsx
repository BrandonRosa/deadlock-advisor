/**
 * HeroCard.jsx
 * Displays a single hero portrait with team selection controls.
 * 
 * Toggle mode (default): buttons act as toggles — one hero per team max
 * Multi mode (setting): buttons act as +/- counters for multiple picks
 */

import React from 'react';

// Which "state" a hero can be in for a given team slot
export const HERO_STATE = {
  NONE: 'none',
  ALLY: 'ally',
  SELF: 'self',   // Self implies ally too
  ENEMY: 'enemy',
};

export default function HeroCard({ hero, heroCounts, onAlly, onSelf, onEnemy, multiMode = false }) {
  const isAlly = heroCounts.ally>0;
  const isSelf = heroCounts.self>0;
  const isEnemy = heroCounts.enemy>0;

  // Glow color based on current state
  const glowClass = isSelf
    ? 'card--self'
    : isAlly
    ? 'card--ally'
    : isEnemy
    ? 'card--enemy'
    : '';

  return (
    <div className={`hero-card ${glowClass}`}>
      {/* Portrait */}
      <div className="hero-card__portrait-wrap">
        <img
          className="hero-card__portrait"
          src={hero.portrait}
          alt={hero.name}
          // Fallback if image missing — shows hero name initial
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback placeholder */}
        <div className="hero-card__portrait-fallback" style={{ display: 'none' }}>
          {hero.name[0]}
        </div>

        {/* State badge overlay */}
        {isAlly && (
          <div className={`hero-card__badge hero-card__badge--ally`}>
            {'◀'}
          </div>
        )}
        {isSelf && (
          <div className={`hero-card__badge hero-card__badge--self`}>
            {'★'}
          </div>
        )}
        {isEnemy && (
          <div className={`hero-card__badge hero-card__badge--enemy`}>
            {'▶'}
          </div>
        )}
      </div>

      <p className="hero-card__name">{hero.name}</p>

      {/* Selection buttons */}
      <div className="hero-card__buttons">
        {multiMode ? (
          <>
            {/* Ally side */}
            <div className="hero-btn-group">
              <button className="hero-btn hero-btn--ally" onClick={() => onAlly(-1)}>−</button>
              <span className="hero-btn-count">{heroCounts.ally}</span>
              <button className="hero-btn hero-btn--ally" onClick={() => onAlly(1)}>+</button>
            </div>

            {/* Self button stays the same */}
            <button className={`hero-btn hero-btn--self ${isSelf ? 'active' : ''}`} onClick={onSelf}>★</button>

            {/* Enemy side */}
            <div className="hero-btn-group">
              <button className="hero-btn hero-btn--enemy" onClick={()=>onEnemy(-1)}>−</button>
              <span className="hero-btn-count">{heroCounts.enemy}</span>
              <button className="hero-btn hero-btn--enemy" onClick={()=>onEnemy(1)}>+</button>
            </div>
          </>
        ) : (
          /* original toggle buttons */
          <>
            <button className={`hero-btn hero-btn--ally ${isAlly ? 'active' : ''}`} onClick={onAlly}>◀</button>
            <button className={`hero-btn hero-btn--self ${isSelf ? 'active' : ''}`} onClick={onSelf}>★</button>
            <button className={`hero-btn hero-btn--enemy ${isEnemy ? 'active' : ''}`} onClick={onEnemy}>▶</button>
          </>
        )}
      </div>
    </div>
  );
}
