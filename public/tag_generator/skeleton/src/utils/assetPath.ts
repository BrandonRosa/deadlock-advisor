// ============================================================
// src/utils/assetPath.ts  —  MODULE 4
// Small helper that fixes image paths for GitHub Pages.
//
// PROBLEM: Image paths in JSON look like  /resources/heroes/abrams/abrams.png
// On GitHub Pages the site lives at  /deadlock-advisor/
// so images need to be at  /deadlock-advisor/resources/heroes/abrams/abrams.png
//
// SOLUTION: Vite exposes import.meta.env.BASE_URL which equals:
//   /deadlock-advisor/  in production (GitHub Pages)
//   /                   in dev (localhost)
//
// Usage in JSX:
//   <img src={assetPath(hero.image_path)} alt={hero.eng_name} />
// ============================================================

export function assetPath(path: string): string {
  // TODO: Get the base URL from import.meta.env.BASE_URL
  //       Strip its trailing slash with  .replace(/\/$/, '')

  // TODO: If path starts with '/' strip the leading slash
  //       so we don't get double slashes

  // TODO: Return  `${base}/${cleanPath}`

  return path; // placeholder — remove this line when done
}
