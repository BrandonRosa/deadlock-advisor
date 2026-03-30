/**
 * useItems.js
 * Custom React hook — loads all items once on app startup and exposes them globally.
 * Think of this like a Start() method in Unity that populates a static data store.
 */

import { useState, useEffect } from 'react';
import { loadAllItemsPerHero } from '../utils/itemLoader';

export function useItems() {
  const [items, setItems] = useState([]);       // All loaded item objects
  const [loading, setLoading] = useState(true);   // True while fetching
  const [error, setError] = useState(null);       // Any load error

  useEffect(() => {
    let cancelled = false; // Prevents state update if component unmounts mid-fetch

    async function load() {
      try {
        const data = await loadAllItemsPerHero();
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // Empty array = run once on mount, like Start() in Unity

  return { items, loading, error };
}
