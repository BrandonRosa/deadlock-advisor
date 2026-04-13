// ============================================================
// src/data/loader.ts  —  MODULE 5
// Loads all hero and item JSON files at build time using Vite's
// import.meta.glob — like Resources.LoadAll() in Unity.
//
// WHY import.meta.glob?
//   You have 171 item files and 39 hero files. You can't import
//   them one-by-one. Vite resolves the glob pattern at build time
//   and bundles all matching files into the app automatically.
// ============================================================

// TODO: import type { AppData, Hero, Item, Tag } from '../types'
// TODO: import tagsData from './tags.json'

// Vite glob import — runs at BUILD time, not runtime.
// { eager: true }          = synchronous, no await needed
// { import: 'default' }   = get the JSON object (not the module wrapper)
// The result is an object: { './heroes/abrams.json': HeroObject, ... }
const heroFiles = import.meta.glob</* TODO: what type? */never>(
  './heroes/*.json',
  { eager: true, import: 'default' }
);

// TODO: Do the same for item files  './items/*.json'

export function loadDefaultData(): /* TODO: return type */ void {
  // Build the heroes record: { normalized_name: HeroObject, ... }
  const heroes: Record<string, /* TODO */never> = {};

  // TODO: Loop over Object.values(heroFiles)
  //       For each hero, add it to the heroes record using hero.normalized_name as the key

  // TODO: Do the same for items

  // TODO: Return an AppData object with:
  //   tags: tagsData cast to Tag[]
  //   heroes: the heroes record you built
  //   items:  the items record you built
}
