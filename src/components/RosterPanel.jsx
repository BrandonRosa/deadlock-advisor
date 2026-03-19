/**
 * RosterPanel.jsx
 * The right-side panel showing your team vs enemy team composition.
 * Clicking a mini portrait opens a small menu to visit wiki or remove them.
 */

import React, { useState } from 'react';
import { HERO_STATE } from './HeroCard';

function MiniPortrait({ hero, isSelf, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mini-portrait-wrap">
      <div
        className={`mini-portrait ${isSelf ? 'mini-portrait--self' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
        title={hero.name}
      >
        <img
          src={hero.mini_icon}
          alt={hero.name}
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="mini-portrait__fallback" style={{ display: 'none' }}>
          {hero.name[0]}
        </div>
        {isSelf && <span className="mini-portrait__star">★</span>}
      </div>

      {/* Popup menu */}
      {menuOpen && (
        <div className="mini-portrait__menu">
          <a
            href={hero.wiki_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mini-menu-btn"
          >
            Wiki
          </a>
          <button
            className="mini-menu-btn mini-menu-btn--remove"
            onClick={() => { onRemove(); setMenuOpen(false); }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function RosterPanel({ heroStates, allHeroes, onRemove }) {
  // Build ally and enemy lists from heroStates
  // heroStates is a Map: normalized_name -> HERO_STATE value
  const allies = allHeroes.filter(h =>
    heroStates.get(h.normalized_name) === HERO_STATE.ALLY ||
    heroStates.get(h.normalized_name) === HERO_STATE.SELF
  );
  const enemies = allHeroes.filter(h =>
    heroStates.get(h.normalized_name) === HERO_STATE.ENEMY
  );
  const selfKey = [...heroStates.entries()]
    .find(([, v]) => v === HERO_STATE.SELF)?.[0];

  const isEmpty = allies.length === 0 && enemies.length === 0;

  return (
    <div className="roster-panel">
      <h2 className="roster-panel__title">Match Roster</h2>

      {isEmpty ? (
        <p className="roster-panel__empty">Select heroes to build your roster</p>
      ) : (
        <>
          {/* Your team */}
          <div className="roster-section">
            <h3 className="roster-section__label roster-section__label--ally">Your Team</h3>
            <div className="roster-section__portraits">
              {allies.map(hero => (
                <MiniPortrait
                  key={hero.normalized_name}
                  hero={hero}
                  isSelf={hero.normalized_name === selfKey}
                  onRemove={() => onRemove(hero.normalized_name)}
                />
              ))}
            </div>
          </div>

          {/* Enemy team */}
          {enemies.length > 0 && (
            <div className="roster-section">
              <h3 className="roster-section__label roster-section__label--enemy">Enemy Team</h3>
              <div className="roster-section__portraits">
                {enemies.map(hero => (
                  <MiniPortrait
                    key={hero.normalized_name}
                    hero={hero}
                    isSelf={false}
                    onRemove={() => onRemove(hero.normalized_name)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
