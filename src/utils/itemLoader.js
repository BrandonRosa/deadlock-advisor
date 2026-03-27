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
  const lines = csvText.trim().split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);         // ← skip blank lines

  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      const val = values[i] ?? '';       // ← missing columns default to ''
      if (header === '') {
        row[header] = val;
      } else {
        const num = parseFloat(val);
        row[header] = isNaN(num) ? 0 : num;  // ← blanks and bad values → 0
      }
    });
    return row;
  });
}

/**
 * Loads all items dynamically.
 * 1. Fetches /resources/items/index.json to get the list of item keys
 * 2. For each key, fetches their manifest_[key].json
 * 3. For each item, fetches and parses their matrix CSV
 * Returns an array of item objects ready to use in the app.
 */
export async function loadAllItems() {
  // Step 1: Get the list of hero keys
  const base = import.meta.env.BASE_URL;
  const indexRes = await fetch(`${base}resources/items/index.json`);
  if (!indexRes.ok) throw new Error('Failed to load item index');
  const itemKeys = await indexRes.json();

  // Step 2: Load all manifests in parallel
  const manifests = await Promise.all(
    itemKeys.map(async (key) => {
      const res = await fetch(`${base}resources/items/${key}/manifest_${key}.json`);
      if (!res.ok) throw new Error(`Failed to load manifest for ${key}`);
      return res.json();
    })
  );

  // Step 3: Load all matrices in parallel
  const items = await Promise.all(
    manifests.map(async (manifest) => {
      const res = await fetch(`${base}${manifest.matrix.replace(/^\//, '')}`);
      if (!res.ok) throw new Error(`Failed to load matrix for ${manifest.normalized_name}`);
      const csvText = await res.text();
      const matrixRows = parseCSV(csvText);


      return {
        ...manifest,
        image: `${base}${manifest.portrait.replace(/^\//, '')}`,
        matrix: `${base}${manifest.matrix.replace(/^\//, '')}`,
        matrixRows,   // raw parsed rows
      };
    })
  );

  return items;
}
