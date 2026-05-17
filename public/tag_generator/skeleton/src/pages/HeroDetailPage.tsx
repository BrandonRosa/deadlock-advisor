// @ts-nocheck
// ============================================================
// src/pages/HeroDetailPage.tsx  —  MODULE 8
// Edit a hero's builds and tag weights.
//
// COMPLEXITY vs ItemDetailPage:
//   - Heroes have MULTIPLE builds (not just one weight column)
//   - Each build has FOUR weight columns (ally/self/enemy/playstyle_score)
//   - Builds can be added and deleted
//   - Builds can follow another build (inherit + override values)
//   - Same local-copy-then-save pattern applies
//
// IMMUTABLE UPDATE PATTERN (important!):
//   When editing nested data in React, always create NEW objects at
//   every level from root to the changed value.
//   DO NOT mutate existing objects — React won't detect the change.
//
//   Example — changing one weight in build[i]:
//   setLocalHero({
//     ...localHero,
//     builds: localHero.builds.map((b, idx) =>
//       idx !== buildIdx ? b : {
//         ...b,
//         values: {
//           ...b.values,
//           [weightKey]: {          ← 'ally_weight' | 'item_affinity' etc.
//             ...b.values[weightKey],
//             [tagCode]: newValue,
//           }
//         }
//       }
//     )
//   })
//
// FOLLOW CHAIN PATTERN:
//   When a build has followed_build set, its raw stored values are
//   overrides/deltas on top of the parent.  Before any math, call
//   resolveBuildValues(build, localHero.builds) to get plain numbers.
//   For display, show the resolved parent value alongside the stored
//   raw value so the user can see what they're overriding.
// ============================================================

import { useState, useEffect } from 'react';
// TODO: import useParams, useNavigate from 'react-router-dom'
// TODO: import Tabs, TabsContent, TabsList, TabsTrigger from shadcn/tabs
// TODO: import Button, Input from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import type { Hero, HeroBuild, BuildValues, TagWeights } from '../types'
// TODO: import assetPath from '../utils/assetPath'
// TODO: import {
//         resolveBuildValues,
//         getAvailableFollowOptions,
//         parseWeightEntry,
//         formatWeightEntry,
//       } from '../utils/buildFollow'
// TODO: import type { ResolvedBuildValues } from '../utils/buildFollow'

// Column definitions for the weight table
const WEIGHT_COLUMNS: { key: keyof BuildValues; label: string }[] = [
  { key: 'ally_weight',  label: 'Ally' },
  { key: 'item_affinity',  label: 'Self' },
  { key: 'enemy_weight', label: 'Enemy' },
  { key: 'playstyle_score',   label: 'Score' },
];

// -----------------------------------------------------------
// WeightCell — renders one weight cell for a NON-General build.
//
// The cell has three parts stacked vertically:
//   TOP:    diff indicator (^^/^/=/v/vv) + resolved parent value
//   MIDDLE: number input for the raw stored value
//   BOTTOM: rel-toggle button cycling = → + → × → =
//
// Props:
//   raw      — the stored TagWeights value (number | string | null)
//              e.g. 0.5, "+0.25", "x1.5", null
//   parentVal — the resolved value from the parent build (number | null)
//              null if this build has no parent (standalone)
//   hasParent — true when this build follows another build
//   onChange  — called with (newRaw: number | string | null)
//               whenever the input or toggle changes
//   disabled  — true when not in custom mode
//
// IMPLEMENTATION HINT — computing diff for top row:
//   const { value: numVal, rel } = parseWeightEntry(raw)
//   const resolvedSelf = applyRelation(parentVal, numVal, rel)  ← what this cell evaluates to
//   const diff = resolvedSelf - (parentVal ?? 0)               ← delta vs parent
//   diff >  0.5 → class "diff-up2"  symbol "^^"
//   diff >  0   → class "diff-up1"  symbol "^"
//   diff === 0  → class "diff-eq"   symbol "="
//   diff < -0.5 → class "diff-dn2"  symbol "vv"
//   diff <  0   → class "diff-dn1"  symbol "v"
//
// IMPLEMENTATION HINT — rel toggle:
//   const cycle = { '=': '+', '+': 'x', 'x': '=' }
//   onClick: newRel = cycle[rel]; onChange(formatWeightEntry(numVal, newRel))
// -----------------------------------------------------------
// TODO: function WeightCell({ raw, parentVal, hasParent, onChange, disabled }) {
//   // 1. parseWeightEntry(raw) → { value: numVal, rel }
//   // 2. Compute resolvedSelf and diff for the diff indicator:
//   //      resolvedSelf = rel='+' ? (parentVal??0)+(numVal??0)
//   //                   : rel='x' ? (parentVal??0)*(numVal??0)
//   //                   : numVal
//   //      diff = resolvedSelf - (parentVal ?? 0)
//   //      diffClass:  diff > 0.5 → 'diff-up2', > 0 → 'diff-up1', 0 → 'diff-eq',
//   //                  < -0.5 → 'diff-dn2', < 0 → 'diff-dn1'
//   //      diffSymbol: '^^' / '^' / '=' / 'v' / 'vv'
//   //
//   // 3. Return JSX — layout: [input] [side-column]
//   //
//   //    <div className="semicell">
//   //      <input
//   //        type="number" step="0.05"
//   //        value={numVal ?? ''}
//   //        onChange={e => {
//   //          const n = e.target.value === '' ? null : parseFloat(e.target.value)
//   //          onChange(formatWeightEntry(n, rel))
//   //        }}
//   //        disabled={disabled}
//   //      />
//   //      {hasParent && (
//   //        <div className="semicell-side">
//   //          <span className={`diff-ind ${diffClass}`}>{diffSymbol}</span>
//   //          <span className="parent-val">{parentVal?.toFixed(2) ?? '—'}</span>
//   //          <button className="rel-toggle" onClick={() => {
//   //            const cycle = { '=': '+', '+': 'x', 'x': '=' }
//   //            onChange(formatWeightEntry(numVal, cycle[rel]))
//   //          }} disabled={disabled}>{rel === 'x' ? '×' : rel}</button>
//   //        </div>
//   //      )}
//   //    </div>
//   //
//   //  The side column is narrow (26px). Its three items stack top-to-bottom:
//   //    1. diff symbol (colored)      e.g. "^"
//   //    2. parent resolved value      e.g. "1.00"
//   //    3. rel toggle button          e.g. "="
// }

// -----------------------------------------------------------
// GeneralBuildCell — renders one weight cell for the General build.
//
// The General build shows aggregate stats from all other builds:
//   TOP:    "min – max" range in subdued color
//   MIDDLE: number input (the General build's own stored value)
//   BOTTOM: average of other builds' RESOLVED values
//
// Props: same as WeightCell minus rel/parent props, plus:
//   stats — { min: number, max: number, avg: number } computed
//           from all non-General builds for this tag+column
//
// IMPLEMENTATION HINT — computing stats:
//   For each non-General build, call resolveBuildValues, then read
//   resolved[weightKey][tagCode] (or 0 if null).
//   min = Math.min(...values), max = Math.max(...), avg = mean
// -----------------------------------------------------------
// TODO: function GeneralBuildCell({ raw, stats, onChange, disabled }) {
//   // Return JSX:
//   //   <div className="semicell">
//   //     <div className="gen-range">{stats.min.toFixed(2)} – {stats.max.toFixed(2)}</div>
//   //     <input
//   //       type="number" step="0.05"
//   //       value={raw ?? ''}
//   //       onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
//   //       disabled={disabled}
//   //     />
//   //     <div className="gen-avg">avg {stats.avg.toFixed(2)}</div>
//   //   </div>
// }

export default function HeroDetailPage() {
  // TODO: const { name } = useParams()
  // TODO: const navigate = useNavigate()
  // TODO: const data = useDataStore(s => s.getData())
  // TODO: const updateHero = useDataStore(s => s.updateHero)
  // TODO: const mode = useDataStore(s => s.mode)

  const [localHero, setLocalHero]     = useState<Hero | null>(null);
  const [activeBuild, setActiveBuild] = useState(0);  // index of the selected build tab
  const [newBuildName, setNewBuildName] = useState('');

  useEffect(() => {
    // TODO: Load the hero from data.heroes[name ?? '']
    // TODO: If not found, navigate('/heroes')
    // TODO: setLocalHero(hero)
    // TODO: Reset activeBuild to 0 when hero changes
  }, [/* TODO: name, data */]);

  // --- Weight edit ---
  function handleWeightChange(
    buildIdx: number,
    weightKey: keyof BuildValues,  // 'ally_weight' | 'item_affinity' | 'enemy_weight' | 'playstyle_score'
    tagCode: string,
    newRaw: number | string | null  // already formatted by WeightCell/GeneralBuildCell
  ) {
    if (!localHero) return;
    // TODO: Update localHero immutably using the pattern described at the top.
    //       localHero.builds[buildIdx].values[weightKey][tagCode] = newRaw
    //       But immutably! Spread at every level.
  }

  // --- Follow build change ---
  function handleFollowChange(buildIdx: number, newFollowName: string) {
    if (!localHero) return;
    // TODO: Update localHero immutably:
    //   builds[buildIdx].followed_build = newFollowName || undefined
    //   (empty string means "no follow" → set to undefined)
    //
    // HINT: same spread pattern as handleWeightChange but at the build level:
    //   setLocalHero({
    //     ...localHero,
    //     builds: localHero.builds.map((b, idx) =>
    //       idx !== buildIdx ? b : {
    //         ...b,
    //         followed_build: newFollowName || undefined,
    //       }
    //     )
    //   })
  }

  // --- Add build ---
  function handleAddBuild() {
    if (!localHero || !newBuildName.trim()) return;

    // TODO: Create a new HeroBuild with:
    //   name: newBuildName
    //   normalized_build_name: `${localHero.normalized_name}_${newBuildName.toLowerCase().replace(/\s+/g, '_')}`
    //   build_description_eng: ''
    //   followed_build: undefined
    //   values: {
    //     ally_weight:  { ...all tags from data.tags set to null }
    //     item_affinity:  { ... same }
    //     enemy_weight: { ... same }
    //     playstyle_score:   { ... same }
    //   }
    //
    // HINT to create an all-null TagWeights:
    //   Object.fromEntries(data.tags.map(t => [t.code, null]))
    //
    // TODO: setLocalHero({ ...localHero, builds: [...localHero.builds, newBuild] })
    // TODO: setActiveBuild(localHero.builds.length)  ← switch to new tab
    // TODO: setNewBuildName('')
  }

  // --- Delete build ---
  function handleDeleteBuild(buildIdx: number) {
    if (!localHero) return;
    if (buildIdx === 0) return;  // can't delete the General build
    if (!confirm('Delete this build?')) return;
    // TODO: Remove the build at buildIdx from localHero.builds
    // TODO: Reset activeBuild to 0
  }

  function handleSave() {
    // TODO: if (!localHero) return
    // TODO: updateHero(localHero)
  }

  if (!localHero) return <div>Loading...</div>;

  const tags = /* TODO: data.tags */ [];
  const isCustom = /* TODO: mode === 'custom' */ false;

  // Pre-compute General stats for all tag+column combinations.
  // These show in GeneralBuildCell (index 0 = General build).
  //
  // TODO: const nonGeneralBuilds = localHero.builds.slice(1)
  // TODO: const generalStats: Record<string, Record<keyof BuildValues, { min: number, max: number, avg: number }>> = {}
  //         For each tag.code and each WEIGHT_COLUMNS entry:
  //           const vals = nonGeneralBuilds.map(b => {
  //             const resolved = resolveBuildValues(b, localHero.builds)
  //             return resolved[col.key][tag.code] ?? 0
  //           })
  //           generalStats[tag.code][col.key] = {
  //             min: Math.min(...vals),
  //             max: Math.max(...vals),
  //             avg: vals.reduce((a, b) => a + b, 0) / (vals.length || 1)
  //           }

  const build = localHero.builds[activeBuild];

  // Resolve the parent build's values for semicell display.
  // null parentResolved = this build is standalone (no follow).
  //
  // TODO: const parentResolved: ResolvedBuildValues | null =
  //         build.followed_build
  //           ? resolveBuildValues(
  //               localHero.builds.find(b => b.name === build.followed_build)!,
  //               localHero.builds
  //             )
  //           : null

  // Available follow options (excludes options that would create a cycle).
  //
  // TODO: const followOptions = getAvailableFollowOptions(localHero.builds, activeBuild)
  //       Returns HeroBuild[] that are safe to follow.

  return (
    <div>
      {/* Hero header */}
      <div className="flex items-center gap-4 mb-6">
        {/* TODO: Hero image */}
        <h1 className="text-2xl font-bold">{localHero.eng_name}</h1>
        <div className="ml-auto flex gap-2">
          {/* TODO: Back button, Save button */}
        </div>
      </div>

      {/* Build tabs */}
      {/* TODO: <Tabs value={String(activeBuild)} onValueChange={v => setActiveBuild(Number(v))}>
            <TabsList>
              {localHero.builds.map((b, i) => (
                <TabsTrigger key={i} value={String(i)}>{b.name}</TabsTrigger>
              ))}
            </TabsList>

            {localHero.builds.map((b, buildIdx) => (
              <TabsContent key={buildIdx} value={String(buildIdx)}>
                [build-meta row + weight table go here — see below]
              </TabsContent>
            ))}
          </Tabs> */}

      {/* Build meta row — shown above the weight table */}
      <div className="build-meta-row">
        {/* Build name and description inputs (same as before) */}
        {/* TODO: inputs for build.name and build.build_description_eng */}

        {/* Follow-build dropdown — hidden for the General build (buildIdx === 0) */}
        {activeBuild !== 0 && (
          <div className="field-row">
            <label>Follows Build</label>
            {/* TODO: <select
                  value={build.followed_build ?? ''}
                  onChange={e => handleFollowChange(activeBuild, e.target.value)}
                  disabled={!isCustom}
                >
                  <option value="">— none —</option>
                  {followOptions.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                  ))}
                </select>

              HINT: followOptions comes from getAvailableFollowOptions(localHero.builds, activeBuild)
                    It already excludes options that would create a cycle, so no extra filtering needed. */}
          </div>
        )}

        {/* Delete build button — hidden for General build */}
        {activeBuild !== 0 && isCustom && (
          <button onClick={() => handleDeleteBuild(activeBuild)}>
            Delete Build
          </button>
        )}
      </div>

      {/* Weight table for the active build */}
      {/* TODO: <table>
              <thead>
                <tr>
                  <th>Tag</th>
                  {WEIGHT_COLUMNS.map(col => <th key={col.key}>{col.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {tags.map(tag => (
                  <tr key={tag.code}>
                    <td>{tag.name}</td>

                    {WEIGHT_COLUMNS.map(col => {
                      const raw = build.values[col.key][tag.code]  ← raw stored value

                      if (activeBuild === 0) {
                        // General build → show range / avg across other builds
                        return (
                          <td key={col.key}>
                            <GeneralBuildCell
                              raw={raw}
                              stats={generalStats[tag.code][col.key]}
                              onChange={newRaw => handleWeightChange(0, col.key, tag.code, newRaw)}
                              disabled={!isCustom}
                            />
                          </td>
                        )
                      } else {
                        // Non-General build → show semicell with diff and rel toggle
                        const parentVal = parentResolved?.[col.key][tag.code] ?? null
                        return (
                          <td key={col.key}>
                            <WeightCell
                              raw={raw}
                              parentVal={parentVal}
                              hasParent={!!build.followed_build}
                              onChange={newRaw => handleWeightChange(activeBuild, col.key, tag.code, newRaw)}
                              disabled={!isCustom}
                            />
                          </td>
                        )
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

        HINT: null weights display as empty string ('')
              Empty string input means null (not applicable)
              WeightCell / GeneralBuildCell call onChange with the
              already-formatted value — just pass it to handleWeightChange. */}

      {/* Add build section */}
      {isCustom && (
        <div className="mt-4 flex gap-2">
          <input
            value={newBuildName}
            onChange={e => setNewBuildName(e.target.value)}
            placeholder="New build name..."
            className="bg-slate-700 rounded px-3 py-1 text-sm"
          />
          {/* TODO: Add button → handleAddBuild() */}
        </div>
      )}
    </div>
  );
}
