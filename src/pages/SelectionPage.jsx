/**
 * SelectionPage.jsx
 * The main hero picker page.
 * 7-column max grid of hero cards, roster panel on the right, calculate button at bottom.
 */

import React from 'react';
import HeroCard, { HERO_STATE } from '../components/HeroCard';
import RosterPanel from '../components/RosterPanel';

export default function SelectionPage({
  heroes,
  heroStates,        // Map: normalized_name -> HERO_STATE
  onSetState,        // (heroKey, newState) => void
  onRemove,          // (heroKey) => void
  onCalculate,
  multiMode,
}) {
  // Determines what happens when you click a button on a hero card
  // In toggle mode: clicking again deselects; selecting a new hero for a slot deselects the previous
  // In multi mode: you can stack multiple heroes per team (future setting)
  function handleAlly(heroKey) {
    const current = heroStates.get(heroKey)??HERO_STATE.NONE;

    if (!multiMode) {
      // Default: toggle on/off, but prevent same hero on both teams
      if (current === HERO_STATE.ALLY) {
        onSetState(heroKey, HERO_STATE.NONE);
      } else if (current === HERO_STATE.ENEMY) {
        // Already on enemy — switch to ally instead
        onSetState(heroKey, HERO_STATE.ALLY);
      } else {
        onSetState(heroKey, HERO_STATE.ALLY);
      }
    } else {
      // Multi mode: just toggle, duplicates handled elsewhere
      onSetState(heroKey, current === HERO_STATE.ALLY ? HERO_STATE.NONE : HERO_STATE.ALLY);
    }
  }

  function handleSelf(heroKey) {
    const current = heroStates.get(heroKey);
    if (current === HERO_STATE.SELF) {
      onSetState(heroKey, HERO_STATE.NONE);
    } else {
      // Only one self allowed always
      heroes.forEach(h => {
        if (h.normalized_name !== heroKey && heroStates.get(h.normalized_name) === HERO_STATE.SELF) {
          onSetState(h.normalized_name, HERO_STATE.NONE);
        }
      });
      onSetState(heroKey, HERO_STATE.SELF);
    }
  }

  function handleEnemy(heroKey) {
    const current = heroStates.get(heroKey);
    if (!multiMode) {
      if (current === HERO_STATE.ENEMY) {
        onSetState(heroKey, HERO_STATE.NONE);
      } else {

        onSetState(heroKey, HERO_STATE.ENEMY);
      }
    } else {
      onSetState(heroKey, current === HERO_STATE.ENEMY ? HERO_STATE.NONE : HERO_STATE.ENEMY);
    }
  }

  // Can only calculate if there's at least one hero selected
  const hasSelection = [...heroStates.values()].some(v => v !== HERO_STATE.NONE);

  return (
    <div className="selection-page">
      {/* Left: hero grid */}
      <div className="selection-main">
        <h1 className="app-title">Deadlock Advisor</h1>
        <p className="app-subtitle">Select your team, yourself, and your enemies</p>

        <div className="hero-grid">
          {heroes.map(hero => (
            <HeroCard
              key={hero.normalized_name}
              hero={hero}
              state={heroStates.get(hero.normalized_name) ?? HERO_STATE.NONE}
              onAlly={() => handleAlly(hero.normalized_name)}
              onSelf={() => handleSelf(hero.normalized_name)}
              onEnemy={() => handleEnemy(hero.normalized_name)}
              multiMode={multiMode}
            />
          ))}
        </div>

        <button
          className={`calculate-btn ${hasSelection ? 'calculate-btn--ready' : ''}`}
          onClick={onCalculate}
          disabled={!hasSelection}
        >
          Calculate Best Builds
        </button>
      </div>

      {/* Right: roster panel */}
      <RosterPanel
        heroStates={heroStates}
        allHeroes={heroes}
        onRemove={onRemove}
      />
    </div>
  );
}
