/**
 * ResultsPage.jsx
 * Shown after hitting Calculate.
 * Displays the best build for each hero in the current roster,
 * with scores from the matrix calculation.
 */

import React from 'react';

function BuildResult({ hero, buildScores, team, isSelf }) {
  if (!buildScores || buildScores.length === 0) return null;
  const best = buildScores[0];
  const rest = buildScores.slice(1);

  return (
    <div className={`build-result build-result--${isSelf ? 'self' : team}`}>
      <div className="build-result__hero">
        <img src={hero.mini_icon} alt={hero.name} className="build-result__icon"
          onError={e => { e.target.style.display = 'none'; }} />
        <span className="build-result__name">{hero.name}</span>
        {isSelf && <span className="build-result__self-badge">★ You</span>}
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

export default function ResultsPage({ results, allHeroes, getCount, onBack }) {
  // Only show results for heroes in the current roster
  const rosterHeroes = allHeroes.filter(h => getCount(h.normalized_name).ally+getCount(h.normalized_name).enemy>0);
  const rosterAllyHeroes = allHeroes.filter(h => getCount(h.normalized_name).ally>0);
  const rosterEnemyHeroes = allHeroes.filter(h => getCount(h.normalized_name).enemy>0);
  const rosterSelfHeroes = allHeroes.filter(h => getCount(h.normalized_name).self>0);

  console.log(rosterAllyHeroes)
  console.log(rosterEnemyHeroes)

  return (
    <div className="results-page">
      <div className="results-page__header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="results-page__title">Recommended Builds</h1>
      </div>

      <div className="results-columns">
        {/* Ally side */}
        <div className="results-column results-column--ally">
          <h2 className="results-column__title">Your Team</h2>
          {rosterAllyHeroes.map(hero => (
            <BuildResult
              key={hero.normalized_name}
              hero={hero}
              buildScores={results.allyTeam[hero.normalized_name]}
              team="ally"
              isSelf={getCount(hero.normalized_name).self > 0}
            />
          ))}
        </div>

        {/* Enemy side */}
        <div className="results-column results-column--enemy">
          <h2 className="results-column__title">Enemy Team</h2>
          {rosterEnemyHeroes.map(hero => (
            <BuildResult
              key={hero.normalized_name}
              hero={hero}
              buildScores={results.enemyTeam[hero.normalized_name]}
              team="enemy"
              isSelf={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
