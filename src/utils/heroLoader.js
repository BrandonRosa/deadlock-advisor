/**
 * heroLoader.js
 * Dynamically loads all heroes from public/resources/heroes/
 * Add a new hero by: creating their folder + manifest + matrix, then adding their key to index.json
 */

/**
 * Fetches and parses a CSV string into an array of objects.
 * Each row becomes { hero_key, team, [build1]: value, [build2]: value, ... }
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      // Convert numeric strings to numbers, keep others as strings
      row[header] = isNaN(values[i]) ? values[i] : parseFloat(values[i]);
    });
    return row;
  });
}

/**
 * Loads all heroes dynamically.
 * 1. Fetches /resources/heroes/index.json to get the list of hero keys
 * 2. For each key, fetches their manifest_[key].json
 * 3. For each hero, fetches and parses their matrix CSV
 * Returns an array of hero objects ready to use in the app.
 */
export async function loadAllHeroes() {
  // Step 1: Get the list of hero keys
  const base = import.meta.env.BASE_URL;
  const indexRes = await fetch(`${base}resources/heroes/index.json`);
  if (!indexRes.ok) throw new Error('Failed to load hero index');
  const heroKeys = await indexRes.json();

  // Step 2: Load all manifests in parallel
  const manifests = await Promise.all(
    heroKeys.map(async (key) => {
      const res = await fetch(`${base}resources/heroes/${key}/manifest_${key}.json`);
      if (!res.ok) throw new Error(`Failed to load manifest for ${key}`);
      return res.json();
    })
  );

  // Step 3: Load all matrices in parallel
  const heroes = await Promise.all(
    manifests.map(async (manifest) => {
      const res = await fetch(`${base}${manifest.matrix.replace(/^\//, '')}`);
      if (!res.ok) throw new Error(`Failed to load matrix for ${manifest.normalized_name}`);
      const csvText = await res.text();
      const matrixRows = parseCSV(csvText);

      // Extract build names from the CSV (everything after hero_key and team columns)
      const buildNames = Object.keys(matrixRows[0]).filter(
        k => k !== 'hero_key' && k !== 'team'
      );

      return {
        ...manifest,
        portrait: `${base}${manifest.portrait.replace(/^\//, '')}`,
        mini_icon: `${base}${manifest.mini_icon.replace(/^\//, '')}`,
        matrix: `${base}${manifest.matrix.replace(/^\//, '')}`,
        matrixRows,   // raw parsed rows
        buildNames,   // e.g. ["Brawler", "Tank", "Aggressive"]
      };
    })
  );

  return heroes;
}
