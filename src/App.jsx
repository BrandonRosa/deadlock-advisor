/**
 * App.jsx
 * Root component. Manages:
 * - Hero loading on startup
 * - Global hero selection state (the Map of heroKey -> HERO_STATE)
 * - Page transitions: Selection <-> Results
 * - Settings (multiMode toggle, expandable later)
 */

import React, { useState, useCallback } from 'react';
import { useHeroes } from './hooks/useHeroes';
import { useItems } from './hooks/useItems';
import { HERO_STATE } from './components/HeroCard';
import { calculateAll } from './utils/matrixEngine';
import SelectionPage from './pages/SelectionPage';
import ResultsPage from './components/ResultsPage';
import './styles/main.css';

export default function App() {
  // Load all heroes dynamically on startup
  const { heroes, loading: loadingHeroes, error: errorHeroes } = useHeroes();

  // Load all items dynamically on startup
  const {items, loading: loadingItems, error: errorItems } = useItems();

  // Map of heroKey -> HERO_STATE — the source of truth for all selections
  const [heroStates, setHeroStates] = useState(new Map());

  const [heroCounts, setHeroCounts] = useState(new Map());
  // stores {self: n, ally: n, enemy: n } per hero key

  // Which page we're on
  const [page, setPage] = useState('selection'); // 'selection' | 'results'

  // Calculation results
  const [results, setResults] = useState(null);

  // Settings
  const [multiMode, setMultiMode] = useState(false);

  const [customWeightsEnabled, setCustomWeightsEnabled] = useState(false);
  const [heroWeights, setHeroWeights] = useState(new Map());
  // Map: heroKey -> { matrixRows with user-edited values, same shape as hero.matrixRows }

  const [heroItemWeights, setItemWeights] = useState(new Map());
  // Map: itemKey -> { matrixRows with user-edited values }

  // Update a single hero's state
  const handleSetState = useCallback((heroKey, newState) => {
    setHeroStates(prev => {
      const next = new Map(prev);
      next.set(heroKey, newState);
      return next;
    });
  }, []);

  // Remove a hero (set back to NONE)
  const handleRemove = useCallback((heroKey) => {
    adjustCount(heroKey,{self:0,ally:0,enemy:0});
  }, []);

  // Run the calculation and navigate to results
  function handleCalculate() {
    const allyKeys = [];
    const enemyKeys = [];

    heroCounts.forEach((counts,heroKey)=> {
      if(counts.ally>0) allyKeys.push(heroKey);
      if(counts.enemy>0) enemyKeys.push(heroKey);
    })

    const calcResults = calculateAll(heroes, allyKeys, enemyKeys, heroCounts,multiMode,getHeroMatrix,getItemMatrix);
    setResults(calcResults);
    setPage('results');
  }

  function getCount(heroKey) {
    return heroCounts.get(heroKey) ?? { self:0, ally: 0, enemy: 0 };
  }

  function adjustCount(heroKey,newMap){
    setHeroCounts(prev=>{
      const next=new Map(prev);
      next.set(heroKey,newMap);
      return next;
    })
  }

  function getHeroMatrix(heroKey) {
    if (customWeightsEnabled && heroWeights.has(heroKey)) {
      return heroWeights.get(heroKey);
    }
    return heroes.find(h => h.normalized_name === heroKey)?.matrixRows ?? [];
  }

  function getItemMatrix(heroKey) {
    if (customWeightsEnabled && heroItemWeights.has(heroKey)) {
      return heroItemWeights.get(heroKey);
    }
    return heroes.find(h => h.normalized_name === heroKey)?.itemMatrixRows ?? [];
  }

  // function adjustCount(heroKey, team, delta) {
  //   setHeroCounts(prev => {
  //     const next = new Map(prev);
  //     const current = next.get(heroKey) ?? { ally: 0, enemy: 0 };
  //     const newVal = Math.max(0, current[team] + delta);
  //     next.set(heroKey, { ...current, [team]: newVal });
  //     return next;
  //   });
  // }

  // All heroes currently in the roster (for results page)
  const rosterKeys = [...heroCounts.entries()]
    .filter(([, v]) => v.ally+v.enemy>0)
    .map(([k]) => k);
  
  const allyKeys = [...heroCounts.entries()]
    .filter(([, v]) => v.ally>0)
    .map(([k]) => k);
  
  const enemyKeys = [...heroCounts.entries()]
    .filter(([, v]) => v.enemy>0)
    .map(([k]) => k);

  // --- Loading / Error states ---
  if (loadingHeroes || loadingItems) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading heroes...</p>
      </div>
    );
  }

  if (errorHeroes) {
    return (
      <div className="app-error">
        <h2>Failed to load heroes</h2>
        <p>{errorHeroes}</p>
        <p>Check that your <code>/public/resources/heroes/</code> folder and <code>index.json</code> are set up correctly.</p>
      </div>
    );
  }

  if (errorItems) {
    return (
      <div className="app-error">
        <h2>Failed to load items</h2>
        <p>{errorItems}</p>
        <p>Check that your <code>/public/resources/items/</code> folder and <code>index.json</code> are set up correctly.</p>
      </div>
    );
  }

  // --- Page routing ---
  return (
    <div className="app">
      {/* Settings bar */}
      <div className="settings-bar">
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={multiMode}
            onChange={e => setMultiMode(e.target.checked)}
          />
          Multi-pick mode
        </label>
      </div>

      {/* Page transitions */}
      <div className={`page-container page-container--${page}`}>
        {page === 'selection' && (
          <SelectionPage
            heroes={heroes}
            heroStates={heroStates}
            onSetState={handleSetState}
            onRemove={handleRemove}
            onCalculate={handleCalculate}
            multiMode={multiMode}
            heroCounts={heroCounts}
            onAdjustCount={adjustCount}
            getCount={getCount}
          />
        )}

        {page === 'results' && results && (
          <ResultsPage
            results={results}
            allHeroes={heroes}
            getCount={getCount}
            onBack={() => setPage('selection')}
          />
        )}
      </div>
    </div>
  );
}
