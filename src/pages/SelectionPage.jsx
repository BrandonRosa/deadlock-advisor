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
  heroCounts,
  onAdjustCount,
  getCount
}) {
  // Determines what happens when you click a button on a hero card
  // In toggle mode: clicking again deselects; selecting a new hero for a slot deselects the previous
  // In multi mode: you can stack multiple heroes per team (future setting)
  function handleAlly(heroKey,delta=1) {
    //const current = heroStates.get(heroKey)??HERO_STATE.NONE;
    const counts= getCount(heroKey) ?? {self:0, ally: 0, enemy: 0 };

    if (!multiMode) {
      // Default: toggle on/off, but prevent same hero on both teams
      if (counts.ally >0) {
        //onSetState(heroKey, HERO_STATE.NONE);
        onAdjustCount(heroKey,{self:0,ally:0,enemy:0});
      } else {
        //onSetState(heroKey, HERO_STATE.ALLY);
        onAdjustCount(heroKey,{self:0, ally:1, enemy:0});
      }
    } else {
      // Multi mode: just toggle, duplicates handled elsewhere
      if(counts.self==1 && counts.ally+delta<1)
        onAdjustCount(heroKey,{self:0,ally:0,enemy:counts.enemy})
      else
        onAdjustCount(heroKey,{...counts,ally:Math.max(0, counts.ally+delta)});
    }
  }

  function handleSelf(heroKey) {
    const counts= getCount(heroKey) ?? {self:0, ally: 0, enemy: 0 };
    if (counts.self>0) {
      onAdjustCount(heroKey,{...counts,self:0,ally:counts.ally-1})
    } else {
      // Only one self allowed always
      heroes.forEach(h => {
        if (h.normalized_name !== heroKey && getCount(h.normalized_name).self>0) {
          onAdjustCount(h.normalized_name,{...counts,self:0})
        }
      });
      onAdjustCount(heroKey,{...counts,self:1,ally:counts.ally+1})
    }
  }

  function handleEnemy(heroKey,delta=1) {
    const current = heroStates.get(heroKey);
    const counts= getCount(heroKey) ?? {self:0, ally: 0, enemy: 0 };

    if (!multiMode) {
      // Default: toggle on/off, but prevent same hero on both teams
      if (counts.enemy >0) {
        //onSetState(heroKey, HERO_STATE.NONE);
        onAdjustCount(heroKey,{self:0,ally:0,enemy:0});
      } else {
        //onSetState(heroKey, HERO_STATE.ALLY);
        onAdjustCount(heroKey,{self:0, ally:0, enemy:1});
      }
    } else {
      // Multi mode: just toggle, duplicates handled elsewhere
      onAdjustCount(heroKey,{...counts,enemy:Math.max(0, counts.enemy+delta)});
    }
  }

  const hasSelection = [...heroCounts.values()].some(v => v.ally > 0 || v.enemy > 0 || v.self > 0);

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
              heroCounts={getCount(hero.normalized_name)}
              onAlly={(delta=1) => handleAlly(hero.normalized_name,delta)}
              onSelf={() => handleSelf(hero.normalized_name)}
              onEnemy={(delta=1) => handleEnemy(hero.normalized_name,delta)}
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
        heroCounts={heroCounts}
        allHeroes={heroes}
        onRemove={onRemove}
        heroStates={heroStates}
        getCount={getCount}
      />
    </div>
  );
}
