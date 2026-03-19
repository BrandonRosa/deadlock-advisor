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
import { HERO_STATE } from './components/HeroCard';
import { calculateAll } from './utils/matrixEngine';
import SelectionPage from './pages/SelectionPage';
import ResultsPage from './components/ResultsPage';
import './styles/main.css';

export default function App() {
  // Load all heroes dynamically on startup
  const { heroes, loading, error } = useHeroes();

  // Map of heroKey -> HERO_STATE — the source of truth for all selections
  const [heroStates, setHeroStates] = useState(new Map());

  // Which page we're on
  const [page, setPage] = useState('selection'); // 'selection' | 'results'

  // Calculation results
  const [results, setResults] = useState(null);

  // Settings
  const [multiMode, setMultiMode] = useState(false);

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
    handleSetState(heroKey, HERO_STATE.NONE);
  }, [handleSetState]);

  // Run the calculation and navigate to results
  function handleCalculate() {
    const allyKeys = [...heroStates.entries()]
      .filter(([, v]) => v === HERO_STATE.ALLY || v === HERO_STATE.SELF)
      .map(([k]) => k);

    const enemyKeys = [...heroStates.entries()]
      .filter(([, v]) => v === HERO_STATE.ENEMY)
      .map(([k]) => k);

    const calcResults = calculateAll(heroes, allyKeys, enemyKeys);
    setResults(calcResults);
    setPage('results');
  }

  // All heroes currently in the roster (for results page)
  const rosterKeys = [...heroStates.entries()]
    .filter(([, v]) => v !== HERO_STATE.NONE)
    .map(([k]) => k);

  // --- Loading / Error states ---
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading heroes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Failed to load heroes</h2>
        <p>{error}</p>
        <p>Check that your <code>/public/resources/heroes/</code> folder and <code>index.json</code> are set up correctly.</p>
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
          />
        )}

        {page === 'results' && results && (
          <ResultsPage
            results={results}
            allHeroes={heroes}
            rosterKeys={rosterKeys}
            onBack={() => setPage('selection')}
          />
        )}
      </div>
    </div>
  );
}
