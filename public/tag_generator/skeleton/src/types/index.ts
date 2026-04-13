// ============================================================
// src/types/index.ts  —  MODULE 2
// Your task: fill in every TODO below.
// Open src/data/heroes/abrams.json and src/data/items/headshot_booster.json
// side-by-side with this file to see the exact field names.
// ============================================================

// -----------------------------------------------------------
// TAG
// A single entry from tags.json, e.g.
//   { "code": "bullet_damage", "name": "Bullet Damage", "description": "" }
// -----------------------------------------------------------
export interface Tag {
  code: string;
  // TODO: name field  (string)
  // TODO: description field  (string)
}

// -----------------------------------------------------------
// TAG WEIGHTS
// Maps tag codes → weight values.
// null means "this tag is not relevant to this hero/item".
// HINT: TypeScript's typed dictionary is  Record<KeyType, ValueType>
//       like Dictionary<string, float?> in C#.
// -----------------------------------------------------------
export type TagWeights = Record<string, /* TODO: number or null */ never>;

// -----------------------------------------------------------
// BUILD VALUES
// A hero build has FOUR sets of TagWeights — one per relationship.
//   ally_weight  : how much this build cares about ally traits
//   self_weight  : how much this build benefits from items for itself
//   enemy_weight : how much this build counters enemy traits
//   self_score   : this build's own strengths/weaknesses (used by item scoring)
// -----------------------------------------------------------
export interface BuildValues {
  // TODO: add all four fields — all are TagWeights
}

// -----------------------------------------------------------
// HERO BUILD
// One strategy for a hero (e.g. "General", "Aggressive").
// Fields in the JSON:
//   name, normalized_build_name, build_description_eng, values
// -----------------------------------------------------------
export interface HeroBuild {
  name: string;
  // TODO: normalized_build_name  (string)
  // TODO: build_description_eng  (string)
  // TODO: values  (BuildValues)
}

// -----------------------------------------------------------
// HERO
// Fields in the JSON:
//   eng_name, normalized_name, desc_eng,
//   image_path, mini_image_path, wiki_url, builds
// -----------------------------------------------------------
export interface Hero {
  eng_name: string;
  normalized_name: string;
  // TODO: remaining fields
  // HINT: builds is an array of HeroBuild
}

// -----------------------------------------------------------
// ITEM CATEGORY
// Items belong to exactly one of three categories.
// HINT: In TypeScript a "string literal union" replaces an enum:
//   type Direction = 'North' | 'South' | 'East' | 'West';
// -----------------------------------------------------------
export type ItemCategory = /* TODO: 'Weapon' | ... */ never;

// -----------------------------------------------------------
// ITEM
// Fields in the JSON:
//   name, normalized_name, category, tier,
//   image_path, wiki_url, remarks, upgrades_from, values
// NOTE: values is an object with ONE field: self_score (TagWeights)
// -----------------------------------------------------------
export interface Item {
  name: string;
  normalized_name: string;
  // TODO: remaining fields
  // HINT: upgrades_from is string[]  (list of item keys this one upgrades from)
  // HINT: values is  { self_score: TagWeights }
}

// -----------------------------------------------------------
// APP DATA
// The full dataset loaded at startup.
// heroes and items are stored as keyed dictionaries for O(1) lookup.
// -----------------------------------------------------------
export interface AppData {
  tags: Tag[];
  heroes: Record<string, Hero>;   // key = normalized_name
  // TODO: items field
}

// The two modes for the data toggle in Settings
export type DataMode = 'defaults' | 'custom';
