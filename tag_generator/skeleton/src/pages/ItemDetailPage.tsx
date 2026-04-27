// @ts-nocheck
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
//
// COMPARE-TO COLUMNS:
//   An item can optionally declare a list of other item keys in
//   compare_to: string[].  When present, those items' self_score
//   weights appear as read-only columns alongside the main column,
//   so you can visually compare how similar items are weighted.
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

  // Items currently shown as comparison columns.
  // Loaded from data.items using localItem.compare_to key list.
  // TODO: const [compareItems, setCompareItems] = useState<Item[]>([])

  // Load the item when the URL param changes
  useEffect(() => {
    // TODO: const item = data.items[name ?? '']
    // TODO: if (!item) navigate('/items')  ← redirect if not found
    // TODO: setLocalItem(item)
    //
    // TODO: Also load comparison items:
    //   const loaded = (item.compare_to ?? [])
    //     .map(key => data.items[key])
    //     .filter(Boolean)          ← skip any keys that don't exist
    //   setCompareItems(loaded)
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

  // --- Compare-to add/remove ---
  function handleAddCompareTo(key: string) {
    if (!localItem) return;
    // TODO: If key is already in localItem.compare_to (or key doesn't exist in data.items), do nothing.
    //
    // TODO: Update localItem immutably to append key:
    //   setLocalItem({
    //     ...localItem,
    //     compare_to: [...(localItem.compare_to ?? []), key],
    //   })
    //
    // TODO: Also append the loaded item to compareItems:
    //   setCompareItems([...compareItems, data.items[key]])
  }

  function handleRemoveCompareTo(key: string) {
    if (!localItem) return;
    // TODO: Update localItem immutably to remove key:
    //   setLocalItem({
    //     ...localItem,
    //     compare_to: (localItem.compare_to ?? []).filter(k => k !== key),
    //   })
    //
    // TODO: Also remove from compareItems:
    //   setCompareItems(compareItems.filter(i => i.normalized_name !== key))
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

      {/* Compare-to controls — add/remove comparison columns */}
      {isCustom && (
        <div className="compare-to-row mb-4">
          <label>Compare To</label>
          <div className="compare-to-inner">
            {/* TODO: <input
                  id="compare-to-search"
                  type="text"
                  placeholder="item key…"
                  className="compare-to-input"
                />
                <button onClick={() => {
                  const input = document.getElementById('compare-to-search') as HTMLInputElement
                  handleAddCompareTo(input.value.trim())
                  input.value = ''
                }}>+ Add</button> */}

            {/* Chip list — one chip per compare item with a remove button */}
            {/* TODO: (localItem.compare_to ?? []).map(key => (
                  <span key={key} className="compare-chip">
                    {key}
                    <button className="chip-x" onClick={() => handleRemoveCompareTo(key)}>×</button>
                  </span>
                )) */}
          </div>
        </div>
      )}

      {/* Tag weights table — main column + optional compare columns */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-4 py-2">Tag</th>
              <th className="text-left px-4 py-2 w-32">Weight</th>
              {/* TODO: compareItems.map(ci => (
                    <th key={ci.normalized_name} className="text-left px-4 py-2 w-32">
                      {ci.name}
                    </th>
                  ))

                  HINT: thead must be rebuilt whenever compareItems changes.
                        React handles this automatically because compareItems
                        is in state — any change triggers a re-render. */}
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map over tags and render one row per tag
                Each row:
                  <tr key={tag.code}>
                    <td>{tag.name}</td>

                    Main editable column:
                    <td>
                      <input
                        type="number"
                        step="0.05"
                        value={localItem.values.self_score[tag.code] ?? ''}
                        onChange={e => handleWeightChange(tag.code, e.target.value)}
                        disabled={!isCustom}
                      />
                    </td>

                    Compare columns (read-only):
                    {compareItems.map(ci => (
                      <td key={ci.normalized_name}>
                        <input
                          type="number"
                          value={ci.values.self_score[tag.code] ?? ''}
                          readOnly
                          className="opacity-60"
                        />
                      </td>
                    ))}
                  </tr>

                HINT: null weights display as empty string ('')
                      Empty string input means null (not applicable) */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
