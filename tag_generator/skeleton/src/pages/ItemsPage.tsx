// ============================================================
// src/pages/ItemsPage.tsx  —  MODULE 7
// Grid of all items with search and category filter.
// Clicking an item navigates to /items/:normalizedName.
//
// KEY CONCEPT — useMemo for derived state:
//   When you compute a filtered/sorted list from state, wrap it in
//   useMemo so it only recomputes when its dependencies change.
//   Without it, React recomputes on every keystroke in an unrelated input.
// ============================================================

import { useState, useMemo } from 'react';
// TODO: import useNavigate from 'react-router-dom'
// TODO: import Input from shadcn
// TODO: import useDataStore from '../store/dataStore'
// TODO: import type { ItemCategory } from '../types'
// TODO: import assetPath from '../utils/assetPath'

const CATEGORIES = ['All', 'Weapon', 'Vitality', 'Spirit'] as const;
const TIER_LABELS: Record<number, string> = { 800: 'T1', 1600: 'T2', 3200: 'T3', 6400: 'T4', 9999: 'SB' };

export default function ItemsPage() {
  // TODO: const navigate = useNavigate()
  // TODO: const data = useDataStore(s => s.getData())

  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('All');

  // Filtered + sorted item list
  const items = useMemo(() => {
    // TODO: const allItems = Object.values(data.items)
    // TODO: return allItems
    //   .filter(i => category === 'All' || i.category === category)
    //   .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    //   .sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name))
    return [];
  }, [/* TODO: data, category, search */]);

  return (
    <div>
      {/* Header with search and category filter */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        {/* TODO: <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." /> */}
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded text-sm ${category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map(item => (
          <div
            key={item.normalized_name}
            onClick={() => {/* TODO: navigate(`/items/${item.normalized_name}`) */}}
            className="bg-slate-800 rounded-lg p-3 cursor-pointer hover:bg-slate-700 transition-colors"
          >
            {/* TODO: Item image — assetPath(item.image_path) */}
            <div className="text-xs font-medium text-slate-200 mt-2 truncate">{item.name}</div>
            <div className="flex justify-between mt-1">
              {/* TODO: Category badge — different color per category */}
              <span className="text-xs text-slate-400">{TIER_LABELS[item.tier] ?? item.tier}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-slate-500 text-center py-12">No items match your filter.</div>
      )}
    </div>
  );
}
