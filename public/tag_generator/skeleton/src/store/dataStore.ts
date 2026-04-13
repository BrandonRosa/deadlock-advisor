// ============================================================
// src/store/dataStore.ts  —  MODULE 5
// Global state using Zustand + localStorage persistence.
//
// MENTAL MODEL (Unity analogy):
//   Think of this as a singleton ScriptableObject that any
//   component can read/write. When data changes, every component
//   that reads from it automatically re-renders.
//
// KEY CONCEPT — persist middleware:
//   Wrapping the store in persist() makes Zustand automatically
//   save state to localStorage and reload it on startup.
//   Like PlayerPrefs but for objects.
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// TODO: import type { AppData, DataMode, Tag, Hero, Item } from '../types'
// TODO: import { loadDefaultData } from '../data/loader'

// Load the bundled defaults ONCE at module level (outside any function).
// HINT: Call loadDefaultData() here and store the result in a const.
// TODO: const defaultData = ...

// -----------------------------------------------------------
// STORE INTERFACE — defines the shape of the store
// -----------------------------------------------------------
interface DataState {
  mode:       /* TODO: DataMode */ never;
  customData: /* TODO: AppData | null */ never;

  // Read the active dataset based on current mode
  getData: () => /* TODO: AppData */ void;

  // Mode switching
  setMode:           (mode: /* TODO */never) => void;
  activateCustomMode: () => void;
  resetToDefaults:    () => void;

  // Edit actions — these only ever modify customData, never defaultData
  updateTags:  (tags:  /* TODO: Tag[]  */ never) => void;
  updateHero:  (hero:  /* TODO: Hero   */ never) => void;
  updateItem:  (item:  /* TODO: Item   */ never) => void;

  // Export / Import
  exportData:  () => void;
  importData:  (data: /* TODO: AppData */ never) => void;
}

// -----------------------------------------------------------
// STORE CREATION
// create<T>()( persist( (set, get) => ({ ... }), { name: 'key' } ) )
//              ^persist wraps the store creator
// -----------------------------------------------------------
export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      mode:       'defaults',
      customData: null,

      getData: () => {
        // TODO: Get mode and customData from get()
        // TODO: If mode is 'custom' AND customData is not null, return customData
        //       Otherwise return defaultData
      },

      setMode: (mode) => {
        // TODO: call set({ mode })
      },

      activateCustomMode: () => {
        // TODO: Get customData from get()
        // TODO: If customData is null (first time):
        //         deep-clone defaultData with JSON.parse(JSON.stringify(defaultData))
        //         and set both mode: 'custom' and customData: <the clone>
        //       Else just set mode: 'custom'
      },

      resetToDefaults: () => {
        // TODO: set mode back to 'defaults' and customData to null
      },

      updateTags: (tags) => {
        // TODO: Get customData — if null, return early (can't edit in defaults mode)
        // TODO: set customData with tags replaced:  { ...customData, tags }
        // HINT: The spread operator { ...obj } creates a shallow copy of obj.
        //       You only need to copy the top level here since tags is a new array.
      },

      updateHero: (hero) => {
        // TODO: Get customData — if null, return early
        // TODO: set customData with heroes record updated:
        //   { ...customData, heroes: { ...customData.heroes, [hero.normalized_name]: hero } }
        // HINT: [variable] as a key means "use the VALUE of variable as the key"
      },

      updateItem: (item) => {
        // TODO: Same pattern as updateHero but for items
      },

      exportData: () => {
        // TODO: Get customData — if null, return (nothing to export)
        // BROWSER FILE DOWNLOAD PATTERN:
        //   1. Create a Blob from JSON.stringify(data, null, 2)  (the 2 = pretty-print indent)
        //   2. URL.createObjectURL(blob) to get a temporary URL
        //   3. Create a hidden <a> element, set href = url, download = 'filename.json'
        //   4. document.body.appendChild(a); a.click(); document.body.removeChild(a)
        //   5. URL.revokeObjectURL(url) to free memory
        // HINT: Use new Date().toISOString().slice(0, 10) for a date string like "2025-04-13"
      },

      importData: (data) => {
        // TODO: set both customData = data and mode = 'custom'
      },
    }),
    {
      name: 'deadlock-advisor-data',
      // partialize = only save these fields to localStorage (don't save functions)
      partialize: (state) => ({ mode: state.mode, customData: state.customData }),
    }
  )
);
