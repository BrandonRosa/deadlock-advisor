/**
 * matrixEngine.js
 * Core calculation logic.
 *
 * HOW IT WORKS:
 * For each hero you want to calculate builds for, we:
 * 1. Build a "composition vector" — a flat list of every hero in the game, first as ally, then as enemy.
 *    Each slot is 1 if that hero is in that role in the current match, 0 otherwise.
 *    e.g. [abrams_ally=1, haze_ally=0, ..., abrams_enemy=0, haze_enemy=1, ...]
 *
 * 2. Multiply the hero's matrix by this vector.
 *    Each build gets a score = sum of (matrix value * vector value) across all rows.
 *    Higher score = better build for this matchup.
 *
 * 3. Return builds sorted by score descending.
 */

/**
 * Builds the composition vector for the current match.
 * @param {string[]} allHeroKeys - All hero keys in the game, in order
 * @param {string[]} allyKeys - Hero keys on your team
 * @param {string[]} enemyKeys - Hero keys on the enemy team
 * @returns {Object} - { [heroKey_ally]: 0|1, [heroKey_enemy]: 0|1 }
 */
export function buildCompositionVector(allHeroKeys, allyKeys, enemyKeys, heroCounts, multiMode) {
  const vector = {};
  allHeroKeys.forEach(key => {
    if (multiMode && heroCounts) {
      const counts = heroCounts.get(key) ?? { self:0, ally: 0, enemy: 0 };
      vector[`ally_${key}`]  = counts.ally;
      vector[`enemy_${key}`] = counts.enemy;
    } else {
      vector[`ally_${key}`]  = allyKeys.includes(key) ? 1 : 0;
      vector[`enemy_${key}`] = enemyKeys.includes(key) ? 1 : 0;
    }
  });
  return vector;
}

/**
 * Calculates build scores for a single hero given the current composition.
 * @param {Object} hero - Hero object with matrixRows and buildNames
 * @param {Object} compositionVector - From buildCompositionVector()
 * @returns {Array} - [{ build: "Brawler", score: 7 }, ...] sorted best first
 */
export function calculateBuildScores(hero, compositionVector) {
  const { matrixRows, buildNames } = hero;
  
  // Initialize scores for each build
  const scores = {};
  buildNames.forEach(build => { scores[build] = 0; });

  // For each row in the matrix, check if that hero/team combo is in the vector
  matrixRows.forEach(row => {
    const vectorKey = row[''];   // ← was `${row.hero_key}_${row.team}`
    const weight = compositionVector[vectorKey] ?? 0;

    if (weight === 0) return; // This hero isn't in the match, skip

    // Add weighted contribution to each build score
    buildNames.forEach(build => {
      scores[build] += row[build] * weight;
    });
  });

  // Return sorted array, best build first
  return buildNames
    .map(build => ({ build, score: scores[build] }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Runs the full calculation for all heroes in the current roster.
 * @param {Object[]} allHeroes - All loaded hero objects
 * @param {string[]} allyKeys - Heroes on your team
 * @param {string[]} enemyKeys - Heroes on enemy team
 * @returns {Object} - { [heroKey]: [{ build, score }, ...] }
 */
export function calculateAll(allHeroes, allyKeys, enemyKeys, heroCounts, multiMode) {
  const allHeroKeys = allHeroes.map(h => h.normalized_name);
  const vector = buildCompositionVector(allHeroKeys, allyKeys, enemyKeys, heroCounts, multiMode);

  const results = {};
  allHeroes.forEach(hero => {
    results[hero.normalized_name] = calculateBuildScores(hero, vector);
  });

  return results;
}
