// ============================================================
// src/pages/HeroesPage.tsx  —  MODULE 8
// Grid of all heroes. Same pattern as ItemsPage but simpler
// (no category filter, just search).
// ============================================================

import { useState, useMemo } from 'react';
// TODO: import useNavigate from 'react-router-dom'
// TODO: import Input from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import assetPath from '../utils/assetPath'

export default function HeroesPage() {
  // TODO: const navigate = useNavigate()
  // TODO: const data = useDataStore(s => s.getData())
  const [search, setSearch] = useState('');

  const heroes = useMemo(() => {
    // TODO: Object.values(data.heroes)
    //   .filter(h => h.eng_name.toLowerCase().includes(search.toLowerCase()))
    //   .sort((a, b) => a.eng_name.localeCompare(b.eng_name))
    return [];
  }, [/* TODO: data, search */]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Heroes</h1>
        {/* TODO: Search input */}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {heroes.map(hero => (
          <div
            key={hero.normalized_name}
            onClick={() => {/* TODO: navigate(`/heroes/${hero.normalized_name}`) */}}
            className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors text-center"
          >
            {/* TODO: Hero image — assetPath(hero.image_path) */}
            <div className="text-sm font-medium mt-2">{hero.eng_name}</div>
            <div className="text-xs text-slate-400">{hero.builds.length} build{hero.builds.length !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
