// ============================================================
// src/pages/ItemDetailPage.tsx  —  MODULE 7
// Edit a single item's tag weights.
//
// PATTERN — "local copy for editing":
//   1. On load, copy the item from the store into local useState
//   2. All edits update the LOCAL copy (doesn't affect other pages)
//   3. "Save" button writes the local copy back to the store
//   This is the standard React pattern for forms.
//
// URL PARAM:
//   This page is mounted on the route  /items/:name
//   Read the :name param with:  const { name } = useParams()
// ============================================================

import { useState, useEffect } from 'react';
// TODO: import useParams, useNavigate from 'react-router-dom'
// TODO: import useDataStore from '../store/dataStore'
// TODO: import Button, Input from shadcn
// TODO: import type { Item, Tag } from '../types'
// TODO: import assetPath from '../utils/assetPath'

export default function ItemDetailPage() {
  // TODO: const { name } = useParams()  ← reads ':name' from the URL
  // TODO: const navigate = useNavigate()

  // Get store data and the updateItem action
  // TODO: const data      = useDataStore(s => s.getData())
  // TODO: const updateItem = useDataStore(s => s.updateItem)
  // TODO: const mode      = useDataStore(s => s.mode)

  // Local copy of the item — edits go here before saving
  const [localItem, setLocalItem] = useState<Item | null>(null);

  // Load the item when the URL param changes
  useEffect(() => {
    // TODO: const item = data.items[name ?? '']
    // TODO: if (!item) navigate('/items')  ← redirect if not found
    // TODO: setLocalItem(item)
    //
    // HINT: useEffect dependencies = [name, data]
    //       Without this, changing the URL won't reload the item.
  }, [/* TODO: name, data */]);

  // --- Weight change handler ---
  function handleWeightChange(tagCode: string, raw: string) {
    if (!localItem) return;
    // TODO: Parse the input:
    //   If raw is empty string → null (not applicable)
    //   Otherwise → parseFloat(raw)  (could be negative!)
    //
    // TODO: Update localItem immutably:
    //   setLocalItem({
    //     ...localItem,
    //     values: {
    //       self_score: {
    //         ...localItem.values.self_score,
    //         [tagCode]: parsedValue,
    //       }
    //     }
    //   })
  }

  function handleSave() {
    // TODO: if (!localItem) return
    // TODO: updateItem(localItem)
    // TODO: Show a success toast or navigate back
  }

  if (!localItem) return <div>Loading...</div>;

  const tags = /* TODO: data.tags */ [] as Tag[];
  const isCustom = /* TODO: mode === 'custom' */ false;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {/* TODO: Show item image using assetPath(localItem.image_path) */}
        <div>
          <h1 className="text-2xl font-bold">{localItem.name}</h1>
          <div className="text-slate-400 text-sm">
            {localItem.category} · {localItem.tier} souls
          </div>
          {/* TODO: Show wiki link if localItem.wiki_url exists */}
        </div>
        <div className="ml-auto flex gap-2">
          {/* TODO: Back button → navigate('/items') */}
          {/* TODO: Save button → handleSave(), disabled if !isCustom */}
        </div>
      </div>

      {/* Tag weights table */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-4 py-2">Tag</th>
              <th className="text-left px-4 py-2 w-32">Weight</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map over tags and render one row per tag
                Each row:
                  <tr key={tag.code}>
                    <td>{tag.name}</td>
                    <td>
                      <input
                        type="number"
                        step="0.05"
                        value={localItem.values.self_score[tag.code] ?? ''}
                        onChange={e => handleWeightChange(tag.code, e.target.value)}
                        disabled={!isCustom}
                      />
                    </td>
                  </tr>

                HINT: null weights display as empty string ('')
                      Empty string input means null (not applicable) */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
