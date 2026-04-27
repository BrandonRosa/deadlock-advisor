// ============================================================
// src/utils/buildFollow.ts  —  PRE-WRITTEN UTILITY
// Follow-chain resolution for hero builds.
//
// CONCEPT — "Follow" system:
//   Each build can declare  followed_build: "some_build_name"
//   This means: start from that build's values, then apply this
//   build's overrides on top.
//
//   Three relationship types control HOW to override:
//     '=' (equals / override)  → replace the parent's value entirely
//     '+' (add)                → add to the parent's value
//     'x' (multiply)           → multiply the parent's value
//
// STORAGE FORMAT  (raw JSON in HeroBuild.values):
//   '=' → plain number,     e.g.  0.5
//   '+' → string "+<n>",   e.g.  "+0.25"  or  "+-0.25" for negative
//   'x' → string "x<n>",   e.g.  "x0.5"
//   null                  → not applicable (skip)
//
// CHAIN EXAMPLE:
//   Tank  follows  General (not set → null base)
//   Big   follows  Tank
//   Resolving Big: walk Tank → General → (no more) → raw values
//
// CYCLE GUARD: pass a visited Set; if a name appears twice, stop
// recursing and treat remaining values as raw (= override, no parent).
// ============================================================

import type { HeroBuild, BuildValues } from '../types';

// ------------------------------------------------------------
// RelType — the three relationship types
// ------------------------------------------------------------
export type RelType = '=' | '+' | 'x';

// ------------------------------------------------------------
// ParsedWeight — result of breaking apart a stored raw value
// ------------------------------------------------------------
export interface ParsedWeight {
  value: number | null;   // numeric component (null if the slot is N/A)
  rel:   RelType;         // how to combine with parent
}

// ------------------------------------------------------------
// ResolvedBuildValues — fully computed numbers (no strings)
// Consumed by the calculator. All values are number | null.
// ------------------------------------------------------------
export interface ResolvedBuildValues {
  ally_weight:  Record<string, number | null>;
  self_weight:  Record<string, number | null>;
  enemy_weight: Record<string, number | null>;
  self_score:   Record<string, number | null>;
}

// ------------------------------------------------------------
// parseWeightEntry
// Converts a stored value into { value, rel }.
//
// Rules:
//   null        → { value: null, rel: '=' }
//   number      → { value: n,    rel: '=' }   ← override
//   string "+…" → { value: parseFloat(s.slice(1)), rel: '+' }
//   string "x…" → { value: parseFloat(s.slice(1)), rel: 'x' }
// ------------------------------------------------------------
export function parseWeightEntry(raw: number | string | null): ParsedWeight {
  // TODO: if raw is null → return { value: null, rel: '=' }
  // TODO: if raw is a number → return { value: raw, rel: '=' }
  // TODO: if raw starts with '+' → return { value: parseFloat(raw.slice(1)), rel: '+' }
  // TODO: if raw starts with 'x' → return { value: parseFloat(raw.slice(1)), rel: 'x' }
  // TODO: fallback → return { value: null, rel: '=' }
  return { value: null, rel: '=' }; // placeholder
}

// ------------------------------------------------------------
// formatWeightEntry
// The inverse of parseWeightEntry — converts back to storage form.
//
// Rules:
//   value null, any rel → null
//   rel '='             → value  (plain number)
//   rel '+'             → `+${value}`   e.g. "+0.25" or "+-0.1"
//   rel 'x'             → `x${value}`   e.g. "x0.5"
// ------------------------------------------------------------
export function formatWeightEntry(value: number | null, rel: RelType): number | string | null {
  // TODO: if value is null → return null
  // TODO: if rel === '=' → return value
  // TODO: if rel === '+' → return `+${value}`
  // TODO: if rel === 'x' → return `x${value}`
  return null; // placeholder
}

// ------------------------------------------------------------
// applyRelation
// Applies a child value onto a parent value with the given RelType.
//
//   '=' → ignore parent; return child value
//   '+' → return (parent ?? 0) + child
//   'x' → return (parent ?? 0) * child
//
// If child is null → return parent unchanged (inherit)
// ------------------------------------------------------------
function applyRelation(
  parent: number | null,
  child:  number | null,
  rel:    RelType
): number | null {
  // TODO: if child is null → return parent  (null child = inherit)
  // TODO: switch on rel:
  //         '=' → return child
  //         '+' → return (parent ?? 0) + child
  //         'x' → return (parent ?? 0) * child
  // TODO: fallback → return child
  return parent; // placeholder
}

// ------------------------------------------------------------
// resolveBuildValues
// Walks the follow chain and returns fully resolved numbers.
//
// Algorithm:
//   1. If build.followed_build is set, recurse to resolve the parent build.
//      Pass visited Set to detect cycles (if cycle detected, treat parent as blank).
//   2. For each weight column and each tag:
//      parse this build's raw value → { value, rel }
//      call applyRelation(parent[col][tag], value, rel)
//   3. Return the merged ResolvedBuildValues.
//
// HINT — resolving the parent:
//   const parentBuild = heroBuilds.find(b => b.name === build.followed_build);
//   const parent = parentBuild
//     ? resolveBuildValues(parentBuild, heroBuilds, visited)
//     : blankResolved(heroBuilds[0]?.values);  ← blank = all nulls
// ------------------------------------------------------------
export function resolveBuildValues(
  build:      HeroBuild,
  heroBuilds: HeroBuild[],
  visited:    Set<string> = new Set()
): ResolvedBuildValues {
  // TODO: If visited.has(build.name) → cycle detected, return raw values as override
  //   (map each stored value through parseWeightEntry and use just the .value)
  // TODO: visited.add(build.name)

  // TODO: Resolve parent:
  //   if build.followed_build is set and not in visited:
  //     find parentBuild in heroBuilds by name
  //     if found: parentResolved = resolveBuildValues(parentBuild, heroBuilds, visited)
  //     else:     parentResolved = blankResolved(build.values)
  //   else:
  //     parentResolved = blankResolved(build.values)  ← no parent

  // TODO: const COLS = ['ally_weight', 'self_weight', 'enemy_weight', 'self_score'] as const
  // TODO: For each col in COLS, for each tagCode in build.values[col]:
  //   const { value, rel } = parseWeightEntry(build.values[col][tagCode])
  //   merged[col][tagCode] = applyRelation(parentResolved[col][tagCode] ?? null, value, rel)
  // TODO: return merged

  return {
    ally_weight:  {},
    self_weight:  {},
    enemy_weight: {},
    self_score:   {},
  }; // placeholder
}

// blankResolved — all tags set to null (used when there is no parent build)
function blankResolved(values: BuildValues): ResolvedBuildValues {
  const blank = (tw: Record<string, number | string | null>): Record<string, number | null> =>
    Object.fromEntries(Object.keys(tw).map(k => [k, null]));
  return {
    ally_weight:  blank(values.ally_weight),
    self_weight:  blank(values.self_weight),
    enemy_weight: blank(values.enemy_weight),
    self_score:   blank(values.self_score),
  };
}

// ------------------------------------------------------------
// getAvailableFollowOptions
// Returns the builds that build[buildIdx] is allowed to follow.
// A build may NOT follow itself, and may NOT follow a build that
// would create a cycle (A → B → A).
//
// HINT — cycle check:
//   Walk the would-be target's own followed_build chain.
//   If you reach buildIdx's name, it's a cycle.
// ------------------------------------------------------------
export function getAvailableFollowOptions(
  builds:   HeroBuild[],
  buildIdx: number
): HeroBuild[] {
  const self = builds[buildIdx];
  if (!self) return [];

  // TODO: return builds.filter((b, i) => {
  //   if (i === buildIdx) return false          // can't follow self
  //   if (wouldCreateCycle(builds, buildIdx, b.name)) return false
  //   return true
  // })
  return []; // placeholder
}

// wouldCreateCycle — returns true if making builds[buildIdx] follow targetName
// would create a cycle anywhere in the chain.
function wouldCreateCycle(
  builds:   HeroBuild[],
  buildIdx: number,
  targetName: string
): boolean {
  const selfName = builds[buildIdx].name;
  // Walk from targetName, following the chain.
  // If we ever reach selfName, it's a cycle.
  // TODO: let current = builds.find(b => b.name === targetName)
  // TODO: while (current?.followed_build) {
  //         if (current.followed_build === selfName) return true
  //         current = builds.find(b => b.name === current!.followed_build)
  //       }
  // TODO: return false
  return false; // placeholder
}
