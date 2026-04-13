// ============================================================
// src/pages/HeroDetailPage.tsx  —  MODULE 8
// Edit a hero's builds and tag weights.
//
// COMPLEXITY vs ItemDetailPage:
//   - Heroes have MULTIPLE builds (not just one weight column)
//   - Each build has FOUR weight columns (ally/self/enemy/self_score)
//   - Builds can be added and deleted
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
//           [weightKey]: {          ← 'ally_weight' | 'self_weight' etc.
//             ...b.values[weightKey],
//             [tagCode]: newValue,
//           }
//         }
//       }
//     )
//   })
// ============================================================

import { useState, useEffect } from 'react';
// TODO: import useParams, useNavigate from 'react-router-dom'
// TODO: import Tabs, TabsContent, TabsList, TabsTrigger from shadcn/tabs
// TODO: import Button, Input from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import type { Hero, HeroBuild, BuildValues, TagWeights } from '../types'
// TODO: import assetPath from '../utils/assetPath'

// Column definitions for the weight table
const WEIGHT_COLUMNS: { key: keyof BuildValues; label: string }[] = [
  { key: 'ally_weight',  label: 'Ally' },
  { key: 'self_weight',  label: 'Self' },
  { key: 'enemy_weight', label: 'Enemy' },
  { key: 'self_score',   label: 'Score' },
];

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
    weightKey: keyof BuildValues,  // 'ally_weight' | 'self_weight' | 'enemy_weight' | 'self_score'
    tagCode: string,
    raw: string
  ) {
    if (!localHero) return;
    const value = raw === '' ? null : parseFloat(raw);

    // TODO: Update localHero immutably using the pattern described at the top.
    //       localHero.builds[buildIdx].values[weightKey][tagCode] = value
    //       But immutably! Spread at every level.
  }

  // --- Add build ---
  function handleAddBuild() {
    if (!localHero || !newBuildName.trim()) return;

    // TODO: Create a new HeroBuild with:
    //   name: newBuildName
    //   normalized_build_name: `${localHero.normalized_name}_${newBuildName.toLowerCase().replace(/\s+/g, '_')}`
    //   build_description_eng: ''
    //   values: {
    //     ally_weight:  { ...all tags from data.tags set to null }
    //     self_weight:  { ... same }
    //     enemy_weight: { ... same }
    //     self_score:   { ... same }
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

            {localHero.builds.map((build, buildIdx) => (
              <TabsContent key={buildIdx} value={String(buildIdx)}>
                [weight table goes here]
              </TabsContent>
            ))}
          </Tabs> */}

      {/* Weight table for the active build */}
      {/* TODO: Table with columns: Tag | Ally | Self | Enemy | Score
               One row per tag, each weight cell has a number input
               Inputs disabled when !isCustom
               HINT: use handleWeightChange(activeBuild, weightKey, tag.code, e.target.value) */}

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
