// ============================================================
// src/utils/calculator.ts  —  MODULE 9
// The scoring engine. Pure TypeScript — no React, no side effects.
// Every function here is a pure function: same inputs = same outputs.
//
// THE ALGORITHM (in plain English):
//   For each tag in the game:
//     item.values.self_score[tag]  = how much the item provides this stat
//     build.values.ally_weight[tag]  = how much this build wants it for ally synergy
//     build.values.self_weight[tag]  = how much this build wants it for itself
//     build.values.enemy_weight[tag] = how much this build uses it to counter enemies
//
//   Item total score =
//     ( Σ(item[tag] × build.ally_weight[tag])  × allyMult
//     + Σ(item[tag] × build.self_weight[tag])
//     + Σ(item[tag] × build.enemy_weight[tag]) × enemyMult
//     ) × tierMultiplier
//
// This is a DOT PRODUCT — the same math as vector multiplication.
// ============================================================

// TODO: import type { Hero, Item, Tag, HeroBuild, TagWeights } from '../types'

// Tier multipliers — higher tier items are inherently stronger
// T800 = 1.0 baseline, T9999 = 2.0 (Street Brawl)
export const TIER_MULTIPLIERS: Record<number, number> = {
  800:  1.0,
  1600: 1.2,
  3200: 1.4,
  6400: 1.6,
  9999: 2.0,
};

// -----------------------------------------------------------
// INTERFACES — the shapes of data this module produces
// -----------------------------------------------------------

export interface TeamSetup {
  self:    /* TODO: Hero   */ never;
  allies:  /* TODO: Hero[] */ never;
  enemies: /* TODO: Hero[] */ never;
}

export interface CalculatorConfig {
  allyMult:  number;   // multiplier for the ally synergy score
  enemyMult: number;   // multiplier for the enemy counter score
}

export interface ItemScore {
  item:       /* TODO: Item   */ never;
  allyScore:  number;
  selfScore:  number;
  enemyScore: number;
  total:      number;
}

export interface BuildResult {
  hero:       /* TODO: Hero       */ never;
  build:      /* TODO: HeroBuild  */ never;
  buildScore: number;
  itemScores: /* TODO: ItemScore[] */ never;
}

// -----------------------------------------------------------
// PRIVATE HELPER — dot product of two weight maps
// -----------------------------------------------------------
// Σ(weights[tag] × scores[tag]) for all tags
// Skip tags where weight is null (not applicable)
// Treat missing score entries as 0
function dotProduct(
  weights: /* TODO: TagWeights */ never,
  scores:  /* TODO: TagWeights */ never
): number {
  // TODO: let sum = 0
  // TODO: for (const [tag, weight] of Object.entries(weights))
  //         if weight is null, skip (continue)
  //         sum += weight × (scores[tag] ?? 0)
  //             The ?? 0 means "if scores[tag] is undefined or null, use 0"
  // TODO: return sum
  return 0; // placeholder
}

// -----------------------------------------------------------
// scoreItem — how good is this item for this build + team?
// -----------------------------------------------------------
export function scoreItem(
  item:   /* TODO: Item         */ never,
  build:  /* TODO: HeroBuild    */ never,
  config: CalculatorConfig = { allyMult: 1.0, enemyMult: 1.0 }
): ItemScore {
  // TODO: Get the item's self_score weights: item.values.self_score
  // TODO: Get the build's four weight maps from build.values

  // TODO: allyScore  = dotProduct(build.values.ally_weight,  itemScores)
  // TODO: selfScore  = dotProduct(build.values.self_weight,  itemScores)
  // TODO: enemyScore = dotProduct(build.values.enemy_weight, itemScores)

  // TODO: Get the tier multiplier: TIER_MULTIPLIERS[item.tier] ?? 1.0

  // TODO: total = (allyScore × config.allyMult + selfScore + enemyScore × config.enemyMult) × tierMult

  // TODO: return { item, allyScore, selfScore, enemyScore, total }
  return null as never; // placeholder
}

// -----------------------------------------------------------
// scoreBuild — how well does this build fit the team composition?
// -----------------------------------------------------------
export function scoreBuild(
  build:   /* TODO: HeroBuild */ never,
  allies:  /* TODO: Hero[]    */ never,
  enemies: /* TODO: Hero[]    */ never
): number {
  // TODO: let score = 0
  //
  // For each ally hero, for each of that ally's builds:
  //   score += dotProduct(build.values.ally_weight, allyBuild.values.self_score)
  //
  // For each enemy hero, for each of that enemy's builds:
  //   score += dotProduct(build.values.enemy_weight, enemyBuild.values.self_score)
  //
  // TODO: return score
  return 0; // placeholder
}

// -----------------------------------------------------------
// runCalculation — entry point, scores everything
// -----------------------------------------------------------
export function runCalculation(
  setup:  TeamSetup,
  items:  /* TODO: Item[]          */ never,
  _tags:  /* TODO: Tag[]  (unused) */ never,
  config: CalculatorConfig = { allyMult: 1.0, enemyMult: 1.0 }
): BuildResult[] {
  // TODO: For each build in setup.self.builds:
  //   1. buildScore = scoreBuild(build, setup.allies, setup.enemies)
  //   2. itemScores = items.map(item => scoreItem(item, build, config))
  //                       .sort((a, b) => b.total - a.total)   ← highest score first
  //   3. Return { hero: setup.self, build, buildScore, itemScores }
  //
  // TODO: Sort the final array by buildScore descending
  // TODO: return the sorted array
  return []; // placeholder
}
