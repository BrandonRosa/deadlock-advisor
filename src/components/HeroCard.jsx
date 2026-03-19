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

export default function HeroCard({ hero, state, onAlly, onSelf, onEnemy, multiMode = false }) {
  const isAlly = state === HERO_STATE.ALLY || state === HERO_STATE.SELF;
  const isSelf = state === HERO_STATE.SELF;
  const isEnemy = state === HERO_STATE.ENEMY;

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
        {state !== HERO_STATE.NONE && (
          <div className={`hero-card__badge hero-card__badge--${state}`}>
            {isSelf ? '★' : isAlly ? '◀' : '▶'}
          </div>
        )}
      </div>

      <p className="hero-card__name">{hero.name}</p>

      {/* Selection buttons */}
      <div className="hero-card__buttons">
        {/* Green — Add to your team */}
        <button
          className={`hero-btn hero-btn--ally ${isAlly ? 'active' : ''}`}
          onClick={onAlly}
          title="Add to your team"
        >
          {multiMode ? (isAlly ? '−' : '+') : '◀'}
        </button>

        {/* Yellow — Mark as yourself */}
        <button
          className={`hero-btn hero-btn--self ${isSelf ? 'active' : ''}`}
          onClick={onSelf}
          title="This is me"
        >
          ★
        </button>

        {/* Red — Add to enemy team */}
        <button
          className={`hero-btn hero-btn--enemy ${isEnemy ? 'active' : ''}`}
          onClick={onEnemy}
          title="Add to enemy team"
        >
          {multiMode ? (isEnemy ? '−' : '+') : '▶'}
        </button>
      </div>
    </div>
  );
}
