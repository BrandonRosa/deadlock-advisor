/**
 * ResultsPage.jsx
 * Shown after hitting Calculate.
 * Displays the best build for each hero in the current roster,
 * with scores from the matrix calculation.
 */

import React from 'react';

function BuildResult({ hero, buildScores }) {
  if (!buildScores || buildScores.length === 0) return null;

  const best = buildScores[0];
  const rest = buildScores.slice(1);

  return (
    <div className="build-result">
      <div className="build-result__hero">
        <img
          src={hero.mini_icon}
          alt={hero.name}
          className="build-result__icon"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <span className="build-result__name">{hero.name}</span>
      </div>

      {/* Best build highlighted */}
      <div className="build-result__best">
        <span className="build-result__best-label">Best Build</span>
        <span className="build-result__best-name">{best.build}</span>
        <span className="build-result__best-score">
          {best.score > 0 ? '+' : ''}{best.score.toFixed(1)}
        </span>
      </div>

      {/* Other builds ranked */}
      <div className="build-result__others">
        {rest.map((b, i) => (
          <div key={b.build} className="build-result__other-row">
            <span className="build-result__rank">#{i + 2}</span>
            <span className="build-result__other-name">{b.build}</span>
            <span className="build-result__other-score">
              {b.score > 0 ? '+' : ''}{b.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage({ results, allHeroes, rosterKeys, onBack }) {
  // Only show results for heroes in the current roster
  const rosterHeroes = allHeroes.filter(h => rosterKeys.includes(h.normalized_name));

  return (
    <div className="results-page">
      <div className="results-page__header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="results-page__title">Recommended Builds</h1>
      </div>

      <div className="results-grid">
        {rosterHeroes.map(hero => (
          <BuildResult
            key={hero.normalized_name}
            hero={hero}
            buildScores={results[hero.normalized_name]}
          />
        ))}
      </div>
    </div>
  );
}
