# Deadlock Advisor — Design & Code Reference

> Comprehensive walkthrough of every screen, button, label, algorithm, and system in the Deadlock Advisor build advisor. Each subsection has **Purpose** (what it does and why it exists), **Reasoning** (design intent / historical context), and a **Correction** line for you to overwrite anything that's wrong.
>
> Code references use the form `app.js: functionName()` since exact line numbers drift as the file is edited.
>
> **Note on this document:** Originally written by an automated agent; reviewed and corrected against actual code as of 2026-05-17. Re-audited and re-synced against the live code on **2026-06-01** — drift was concentrated in §4 (Sidebar/Page System), §14 (Build Detail, now tabbed), §22 (algorithm list), and various AUGMENT-tier additions for the Codex visual redesign. Sections marked `[UNCERTAIN]` may still be inaccurate — please correct them.

## Table of Contents

1. [Overview](#1-overview)
2. [File Structure](#2-file-structure)
3. [Major Runtime Objects](#3-major-runtime-objects)
4. [Sidebar & Page System](#4-sidebar--page-system)
5. [Heroes List Page](#5-heroes-list-page)
6. [Hero Edit Page](#6-hero-edit-page)
7. [Reverse Engineer Page](#7-reverse-engineer-page)
8. [Items List Page](#8-items-list-page)
9. [Item Edit Page](#9-item-edit-page)
10. [Tags Page](#10-tags-page)
11. [Calculator Setup Page](#11-calculator-setup-page)
12. [Match Results Summary Page](#12-match-results-summary-page)
13. [Calc Hero Detail Page](#13-calc-hero-detail-page)
14. [Calc Build Detail Page](#14-calc-build-detail-page)
15. [Build Path Guide Panel](#15-build-path-guide-panel)
16. [Simulator Page](#16-simulator-page)
17. [Live Match Mode](#17-live-match-mode)
18. [QA Pages](#18-qa-pages)
19. [Sim Log Comparison Harness](#19-sim-log-comparison-harness)
20. [Universal Label System](#20-universal-label-system)
21. [Scoring Formulas (V1 / V2 / V3)](#21-scoring-formulas-v1--v2--v3)
22. [Build-Path Algorithms](#22-build-path-algorithms)
23. [Modals & Misc UI](#23-modals--misc-ui)
24. [Backend (`app.py`)](#24-backend-apppy)
25. [Data Files](#25-data-files)
26. [Visual Design — Theme, Colors, Fonts, Icons](#26-visual-design--theme-colors-fonts-icons)
27. [Codex Redesign Overlay (2026-06-01)](#27-codex-redesign-overlay-2026-06-01)

---

## 1. Overview

**Purpose:** A Flask + vanilla-JS web tool for designing Deadlock hero builds and analyzing how those builds perform against a given team composition. It does two distinct jobs:

1. **Authoring** — edit per-hero tag weights, define multiple "builds" per hero (e.g. gun Grey Talon vs spirit Grey Talon), and tag-score the items pool.
2. **Match analysis** — drag heroes into ally/enemy teams, score every hero's builds vs the lineup, then drill in to a single build and walk through its recommended buy order (Build Path Guide) or play a Simulator / Live Match against it.

**Reasoning:** The whole architecture rests on a tag system. Heroes have per-tag `item_affinity` / `ally_weight` / `enemy_weight` / `playstyle_score` vectors. Items have per-tag `playstyle_score` vectors. Build scoring is the dot product of these vectors weighted by team membership. The simulator and the algorithms all rely on the same vectors — no separate scoring system.

**Correction:** _(your note here)_

---

## 2. File Structure

```
public/tag_generator/
├── app.py                    Flask backend (data CRUD + index render)
├── templates/index.html      Single-page app shell with every screen as a <section>
├── static/
│   ├── app.js                ~12.5k lines — every screen render, every algorithm, the CODEX IIFE
│   └── style.css             ~3.5k lines — theme + per-component styling + Codex overlay block
└── data/
    ├── tags.json             Master tag list (~50 tag codes)
    ├── heroes/<key>.json     One file per hero, contains builds[] with full vectors
    ├── items/<key>.json      One file per item, contains tier + per-tag playstyle_score
    ├── qa/scenarios.json     Saved QA scenarios (roster + algos to test)
    ├── qa/reports/<uuid>.json  One file per saved QA report
    ├── sim_logs/<ts>_<hero>.json  One file per saved sim/live run
    └── sim_log_baselines/    Frozen markdown snapshots for QA regression comparisons
```

**Purpose:** Single-page front end (`templates/index.html` renders once, all navigation is client-side via `showPage()`); Flask is purely a JSON-on-disk CRUD layer.

**Reasoning:** Hero/item data is small and rarely changes, so JSON-on-disk is enough (no DB). Persistence of "what was I doing last" lives in browser `localStorage` via `saveMatchState()`, not on the server.

**Correction:** _(your note here)_

---

## 3. Major Runtime Objects

### `MATCH` — calculator state (`app.js`, declared once near the top)
**Purpose:** Holds everything about the currently-active match / calculation: rosters, hero data caches, the current results array, simulator states, scoring multipliers, selected build path algorithm, etc.

Key fields (verified against code):
- `MATCH.allies[]`, `MATCH.enemies[]` — arrays of hero `normalized_name` for the two teams
- `MATCH.heroData[name]` — raw JSON fetched from `/api/heroes/<name>`
- `MATCH.itemData[]` — flat array of all items, fetched once per calc
- `MATCH.results[]` — per-hero `{ name, builds: [buildResult, ...], topBuilds }` computed by `computeResults()`
- `MATCH.selectedBuilds[heroName]` — which build index of each hero is "currently viewed" AND is used as that hero's vector source for cross-hero scoring
- `MATCH.mult` — six scoring multipliers: `{ buildAlly: 1.5, buildEnemy: 1.5, itemAlly: 1.5, itemEnemy: 1.5, allyBuild: 0.75, enemyBuild: 0.75 }` (defaults)
- `MATCH.bpAlgo` — currently selected algorithm name (default `'architect'`)
- `MATCH.scoreFormula` — `'v1'` | `'v2'` | `'v3'` (default `'v3'`)
- `MATCH.autoRegen` — when true, `runCalculation` does a second pass after promoting each hero's top build
- `MATCH.simStates[heroName::buildIdx]` — per-build sim states (tick, owned items, history, etc.)
- `MATCH.simEnabled` — whether to show the "Simulate this build" buttons on each build detail page
- `MATCH.multiMode` — when false (default), only one self hero allowed per calc
- `MATCH.include9999` — include tier-9999 placeholder items in scoring
- `MATCH.lazyBuildPaths` — [UNCERTAIN] deferred build path computation

**Reasoning:** A single global object simplifies persistence (one `JSON.stringify(MATCH)` call) and lets every render function read from the same source of truth.

### `S` — editor state
**Purpose:** Tracks which hero/item/build the user is currently EDITING (separate from `MATCH` which is about analysis).

Key fields: `S.currentHero`, `S.currentBuildIdx`, `S.currentItem`, `S.heroList`, `S.itemList`, `S.tags`.

**Reasoning:** Editor and calculator are conceptually different — user could edit hero data while a match is mid-analysis. Keeping them separate avoids accidental cross-coupling.

### `SIM` — simulator session pointer
**Purpose:** `SIM.current = { heroName, buildIdx, b, key }` points to whichever sim state is currently open on the sim page. `SIM.states` aliases `MATCH.simStates`. `SIM.fullscreen` toggles a fullscreen view.

### `_bpDbg` — build-path debug capture
**Purpose:** When the user clicks "Debug Build", this gets temporarily populated by `computeBuildPath()` with `phases`, `guide`, algorithm-specific traces (`architectTicks`, `inverseTicks`, `surgeTicks`, `surgeAnchors`, etc.). `formatBpDebug()` turns it into a clipboard-friendly text dump.

### `CODEX` — settings + IA module (IIFE at the top of `app.js`)
**Purpose:** All state introduced by the Codex visual redesign (§27) lives here. Handles theme + density + advanced + developer toggles, the settings drawer, the Selected-Instance sidebar block, and the Match-Results nav visibility gate. Persists to `localStorage` under the key `codex_settings_v1`.

State shape (loaded with `DEFAULTS` then merged with whatever's in `localStorage`):
- `theme`: `'dark' | 'light'` (default `'dark'`) — sets `data-theme` on `<html>`
- `density`: `'dense' | 'simple'` (default `'dense'`) — sets `data-density` on `<html>`; toggles `.dense-only` visibility
- `advanced`: boolean (default `false`) — reveals nav items with `data-nav-group="advanced"` (Heroes, Items)
- `developer`: boolean (default `false`) — reveals nav items with `data-nav-group="developer"` (Tags, QA)

Exported methods (attached to `window.CODEX`):
- `set(patch)` — merges into state, persists, calls `apply()`, redirects to Calculator if the current page got hidden by a toggle-off
- `openDrawer()` / `closeDrawer()` — slides `#settings-drawer` in/out
- `setNavInstance(spec | null)` — populates `#nav-instance-host` and `#botnav-instance-host` with a hero+build card (portrait, name, build, `onOpen`/`onBuild`/`onLive` action callbacks); pass `null` to clear
- `refreshNavVisibility()` — hides the Match Results nav button until `MATCH.results` exists

**Reasoning:** Keeping all the redesign-driven IA state in one IIFE keeps it isolated from `MATCH` / `S` / `SIM` and makes it easy to find. The `localStorage` key is namespaced (`codex_*`) so it doesn't collide with future stores.

**Correction:** _(your note here)_

---

## 4. Sidebar & Page System

The IA was restructured during the **Codex visual redesign** (see §27). The sidebar is no longer a flat five-button list — it's now three groups (Default / Advanced / Developer) plus a contextual Selected-Instance card, plus a foot cluster, plus a mobile-only bottom nav and a mobile-only floating top-right cluster.

### 4.1 Sidebar markup (`index.html` lines ~15-45)

The sidebar (`<nav id="sidebar">`) contains, top to bottom:

1. **Brand row** (`.sidebar-logo`) — gradient ❋ tile (`.sidebar-mark`) + "DEADLOCK / ADVISOR" wordmark (`.sidebar-title` + `.sidebar-sub`).
2. **Default nav group** (always shown, `data-nav-group="default"`):
   - **Calculator** — `data-page="calc"`, glyph `⊞`
   - **Match Results** — `data-page="calc-summary"`, glyph `▤`. **Hidden by default** (inline `style="display:none"`); `CODEX.refreshNavVisibility()` reveals it after `MATCH.results` is populated by `runCalculation`.
3. **Selected Instance slot** (`<div id="nav-instance-host">`) — empty container. Populated by `CODEX.setNavInstance(spec)` when a hero or build is opened. Shows a green-bordered card with portrait + name + current build + action buttons (Build Screen / Live Match) + "× clear selection". Cleared by `showPage()` for any route in `NON_INSTANCE_PAGES`.
4. **Advanced group** (gated by `state.advanced`, `data-nav-group="advanced"`):
   - **Heroes** — `data-page="heroes"`
   - **Items** — `data-page="items"`
5. **Developer group** (gated by `state.developer`, `data-nav-group="developer"`):
   - **Tags** — `data-page="tags"`
   - **QA** — `data-page="qa"`
6. **Spacer** (`.nav-spacer`) pushes the foot down.
7. **Foot cluster** (`.nav-foot`): **Theme toggle** (`#btn-theme-toggle`, ☾/☀) and **Settings** (`#btn-open-settings`, ⚙ — opens the drawer).

**Purpose:** Default landing collapses to a single core loop (Calculator → Match Results → Build → optional Sim). Heavy-machinery surfaces (Hero editor, Item editor, Tag manager, QA harness) stay hidden until the Advanced or Developer toggle is flipped on in the Settings drawer. A first-time visitor never meets a tag-weight table.

**Reasoning:** The original five-button flat nav exposed authoring tools to consumers and made the surface feel like a dev console. Grouping by audience (default / advanced / developer) keeps the powerful editors a single click away while letting visitors see only the build advisor.

### 4.2 Settings drawer (`#settings-drawer`)

Right-slide panel (`templates/index.html`) opened by the ⚙ button in the sidebar foot or by the **Settings** tab on the mobile bottom nav. Contains:

- **Appearance** group:
  - **Theme** — segmented control (`#seg-theme`) with two buttons: Dark / Light
  - **Dense layout** — toggle (`#toggle-density`). When off, density flips to `simple`, which hides every element marked `.dense-only` and shows every `.simple-only` element.
- **Feature level** group:
  - **Advanced features** — toggle (`#toggle-advanced`) controlling the Heroes + Items nav group visibility
  - **Developer features** — toggle (`#toggle-developer`, purple-tinted) controlling the Tags + QA nav group visibility

Scrim element (`#drawer-scrim`) absorbs background clicks to close. State persists via `CODEX.set()` → `localStorage.codex_settings_v1` on every change.

### 4.3 Mobile bottom nav (`#botnav`)

Hidden on desktop; visible at `≤760px` via media query. Markup:

```
Calc | <span id="botnav-instance-host">…filled by setNavInstance…</span> | Settings
```

The instance-host span uses **`display: contents`** so its child buttons (Build, Live, when an instance is selected) become direct flex children of `.botnav` and share the same `flex: 1` distribution as the static Calc and Settings buttons. Without that trick, Build + Live would overflow the wrapper and force a second row.

### 4.4 Mobile floating top-right cluster (`.mobile-top-actions`)

Fixed-position pair of icon buttons (`#mtop-theme`, `#mtop-settings`) anchored to the top-right corner on `≤760px`. Same handlers as the sidebar foot — needed because the sidebar (and its theme/settings buttons) is hidden on mobile. Backdrop-blurred so it reads against any page content scrolling underneath.

### 4.5 `showPage(id)` (`app.js: showPage()`)

**Purpose:** Hides every `<section class="page">`, reveals the section with matching `id="page-<id>"`, and syncs the sidebar `.nav-btn.active` class via `data-page` match.

**New behavior:** If `id ∈ NON_INSTANCE_PAGES` (`heroes`, `items`, `tags`, `calc`, `qa`, `calc-summary`), `showPage` also calls `CODEX.setNavInstance(null)` to clear the sidebar instance card. Pages like `hero-edit`, `calc-hero`, `calc-build`, and `sim` do NOT clear it — they're considered "instance" routes and rely on the opener (`openHeroEdit` / `openCalcHero` / `openCalcBuild`) to re-set the card themselves.

The nav-button click handler (`document.querySelectorAll('.nav-btn').forEach`) also routes through showPage, with a special branch for `data-page="calc-summary"`: if `MATCH.results` doesn't yet exist, the handler toasts and redirects to `calc` instead of showing an empty results page.

**Reasoning:** Single-page layout means no full reloads — calculator state, sim state, and editor state all persist across nav clicks. The instance-clearing logic ensures the sidebar's contextual card doesn't lie about what the user is currently looking at.

**Correction:** _(your note here)_

---

## 5. Heroes List Page

**Section:** `#page-heroes`

**Purpose:** Grid of every hero card. Click a card → opens Hero Edit. The "+ New Hero" button opens a modal to create one.

**Reasoning:** First thing the user sees. Stays simple — just a grid. Presets (downloaded community heroes) are shown first; regular custom heroes follow.

### + New Hero button
Opens `#modal-new-hero` (English name + normalized key inputs). On confirm, POSTs to `/api/heroes` and reloads the list.

### Hero card
Image, English name, build count badge, color chips, search-term chips. Clicking opens `renderHeroEditPage()`.

**Correction:** _(your note here)_

---

## 6. Hero Edit Page

**Section:** `#page-hero-edit` — the heaviest editor in the app.

### 6.1 Hero header bar
- **← Heroes** — return to grid
- **Unsaved badge** — appears when `setHeroDirty(true)` was called
- **⟲ Reverse Engineer** — opens the Reverse Engineer page for this hero
- **Save** — `saveHero()` PUTs `S.currentHero` to `/api/heroes/<key>` and clears dirty state

**Purpose / Reasoning:** Editor follows a "dirty-and-save" pattern — changes stay client-side until you press Save, so you can abandon them by navigating away.

**Sidebar instance card (Codex):** `openHeroEdit(name)` now also calls `window.CODEX.setNavInstance({...})` to populate the sidebar Selected Instance card (§4.1) with this hero's portrait + name + current build's name, and wires the Build Screen / Live Match action buttons to jump back to the hero-edit and sim screens. The card is cleared when the user navigates to a `NON_INSTANCE_PAGES` route.

### 6.2 Hero info panel (left column)
Two preview images (portrait + mini icon) + a fields column with **English Name**, **Hero Key (normalized)**, **Description**, **Portrait Path**, **Mini Icon Path**, **Wiki URL**, **Default Build** (dropdown), **Filter Colors** (clickable swatch grid), **Search Terms** (chip input).

#### Default Build dropdown (`app.js: renderDefaultBuildSelect()`)
**Purpose:** Lists every build for the current hero. The chosen build's `normalized_build_name` is saved as `h.default_build_name`. On every `runCalculation` call, each hero's `MATCH.selectedBuilds[name]` is seeded from this default — so this is the build that gets sent to OTHER heroes when scoring against this hero.

**Correction:** _(your note here)_

#### Filter Colors row
**Purpose:** Pick one or more colors that this hero "feels like". Used by the calculator roster filter to narrow heroes down by visual identity.

**Correction:** _(your note here)_

#### Search Terms chips
**Purpose:** Aliases / alt-names / role keywords. Used by the calculator's text-filter so typing "tank" or "carry" surfaces heroes flagged accordingly.

**Correction:** _(your note here)_

### 6.3 Build tabs bar (`app.js: renderBuildTabs()`)
Horizontal row of tabs, one per build. Tab 0 is always "General" and is non-draggable. Other tabs can be dragged to reorder, clicked to switch, or have their `×` clicked to delete. A `+` tab opens the "Add Build" modal.

**Purpose:** Quick switching between builds for the same hero.

**Reasoning:** General is special because index 0 is the historical default vector source. Even with `default_build_name`, internal code falls back to `hero.builds[0]` in many places.

**Correction:** _(your note here)_

### 6.4 Build meta row (under tabs)
Per-build fields: **Build Name**, **Code Name**, **Description**, **Follows Build** (inheritance source), **Confidence** (manual ±0.5 nudge with relative operator `=` / `+` / `x`), **Disabled** (checkbox), **Delete Build**.

#### Follows Build
**Purpose:** Lets this build inherit weights from another build of the same hero. `resolveBuildValues()` walks this chain at score time. Value inheritance operators: plain number = override (`=`), `"+0.25"` = add, `"x0.5"` = multiply.

**Correction:** _(your note here)_

#### Confidence operator + value
- `=` — overrides parent confidence
- `+` — adds to parent confidence
- `x` — multiplies parent confidence

**Purpose:** Manually nudge how strongly this build is recommended vs sibling builds, without changing the underlying tag values.

**Correction:** _(your note here)_

#### Disabled checkbox
**Purpose:** Skip this build in the match calculator (still appears in the editor). Lets you stage WIP builds without deleting them.

**Correction:** _(your note here)_

### 6.5 Build Constraints (`<details>` expander)
Four columns:
1. **Signature Items** — `×1.4` score boost (or `×1.9` "strong" variant for non-greedy algos like beam/expert)
2. **Required Items** — `×2.0` (or `×2.6` strong) + force-buy + sell-stickiness (`×1.5` stickiness mult)
3. **Blacklist Items** — never recommended; their chain components still allowed elsewhere
4. **Counter Items per Phase** — per-phase `[min, max]` slots that override `DEFAULT_COUNTER_SLOTS` (defaults: Lane `[0,1]`, Early `[0,2]`, Mid `[1,2]`, Late `[2,3]`, Extra Late `[2,4]`)

Search inputs autocomplete from `MATCH.itemData`. Selected items appear as chips below.

**Purpose:** Lets the build author force-include or force-exclude specific items per build, and explicitly control how many "counter" items the algorithm reserves slots for in each phase.

**Correction:** _(your note here)_

### 6.6 Preset banner
**Purpose:** Shown only when the General build is empty. Lets you pre-fill General by copying weights from another hero's build.

**Correction:** _(your note here)_

### 6.7 Tag table (`#hero-tag-table`)
Rows = tags from `tags.json`. Columns:
1. **Tag** — display name
2. **Ally Weight** (`ally_weight`) — how much this hero values a teammate having this tag
3. **Item Affinity** (`item_affinity`) — how much this hero values items with this tag (direct self-buy scoring)
4. **Enemy Weight** (`enemy_weight`) — how much an enemy having this tag hurts this hero (negative = vulnerability)
5. **Playstyle Score** (`playstyle_score`) — how much this hero's own kit embodies this tag; used when OTHER heroes score against this hero

Cells accept numbers in `-1..+1`. A blank/null cell means "inherits from followed build" (or 0 if no follow chain).

**Purpose:** Core data entry. Every score in the entire app is some dot product of an item's `playstyle_score` against one of these weight vectors.

**Correction:** _(your note here)_

---

## 7. Reverse Engineer Page

**Section:** `#page-reverse-engineer`

**Purpose:** Given an observed real game (items bought + enemies killed + allies played with), infer a tag-weight build vector for this hero. The result fills `S.currentHero`'s currently-active build.

### Left column — Build Order
**Purpose:** Add items in purchase order. Earlier buys carry a small bonus; higher-tier items count more. Each chip has a `○` toggle that cycles **none → ★ Signature → REQ Required** to mark foundational items.

**Correction:** _(your note here)_

### Right column — Context + settings
- **Enemies Killed Most** — heroes you got kills on this game. Click to select; click again to mark **★ impactful**. The build vector leans toward tags those enemies are weak to.
- **Allies They Played With** — heroes on your team. Click to mark **★ impactful**. The build leans toward tags those allies synergize with.
- **Build Name** — defaults to "Reverse Engineered"
- **Algorithm** — `items+context` (full inference) or `items-only` (ignore matchup, just tag-score the items)

### Reverse Engineer Build → button
Runs the inference, opens the Build Editor pre-filled.

**Correction:** _(your note here)_

---

## 8. Items List Page

**Section:** `#page-items`

**Purpose:** Browse / search the full item pool. Filter by category (All / Weapon / Vitality / Spirit) via top-right tabs and a search box.

### Item card
Image, name, tier, category. Clicking opens the Item Edit page.

**Correction:** _(your note here)_

---

## 9. Item Edit Page

**Section:** `#page-item-edit`

**Purpose:** Edit a single item's metadata + tag playstyle_scores.

### Header (back / dirty / save)
Same dirty-and-save pattern as Hero Edit.

### Item info panel
- **Name**, **Normalized Name** (readonly), **Category**, **Tier**
- **Wiki URL**, **Image Path**
- **Remarks** — freeform note
- **Confidence** — `±0.5` manual recommendation nudge specific to this item
- **Upgrades From** — comma-separated list of component item keys. Defines the upgrade chain so the build path knows that buying a T4 "consumes" specific T1/T2/T3 components.
- **Compare To** — chip list of related items for reference (UI helper, doesn't affect scoring)

### Tag table
Single column: **Item Score** (`playstyle_score`) per tag. Multiplied by each hero's `item_affinity` (or `ally_weight` / `enemy_weight`) to produce per-item scoring.

**Correction:** _(your note here)_

---

## 10. Tags Page

**Section:** `#page-tags`

**Purpose:** CRUD the master tag list (`tags.json`). Columns: drag-handle, code, display name, description, delete.

### + Add Tag button
Opens `#modal-tag`. New tags get blank values in every hero and item; the user has to backfill them.

**Reasoning:** Tags are the dimensions of the whole vector space — adding one widens every hero/item file.

**Correction:** _(your note here)_

---

## 11. Calculator Setup Page

**Section:** `#page-calc`

**Purpose:** Pick the rosters (ally team + enemy team), tune scoring knobs, choose algorithm, then "Calculate Builds →".

### 11.1 Control bar (sticky header)

Row 1 — toggles:
- **Multi-mode** — when off, only one self hero is allowed per calc; when on, every hero scores fully against the lineup
- **Uncap teams** — removes the 6-per-team cap
- **Include 9999 items** — items with tier 9999 (placeholder/special items)
- **Simulator** — show the "Simulate this build" button on each build's detail page
- **Build** multipliers — `Ally / Enemy` — global multiplier on the build-level ally/enemy score terms
- **Items** multipliers — `Ally / Enemy` — global multiplier on the per-item ally/enemy score terms

Row 2:
- **Build Path Algorithm** dropdown — see [§22 Algorithms](#22-build-path-algorithms)
- **Score Formula** dropdown — V1 / V2 / V3, see [§21 Scoring](#21-scoring-formulas-v1--v2--v3)
- **V2/V3 Build** group (`Ally←Me`, `Enemy→Me`) — reverse-direction symmetric terms
- **Auto-regen** checkbox — after first calc, auto-promote each hero's top build and re-run once
- **Calculate Builds →** — fires `runCalculation()`

**Default mult values:** all four main multipliers default to 1.5; the two V2/V3 reverse terms default to 0.75.

**Correction:** _(your note here)_

### 11.2 Teams bar
Two drop zones: **Allies (0/6)** and **Enemies (0/6)**. Drag heroes from the roster grid into either column. Each chip can be dragged between teams or removed.

### 11.3 Filter bar
- **Text filter** — searches `eng_name`, `normalized_name`, `search_terms`. Word-prefix match.
- **Color filter chips** — narrow the roster grid by hero color tags
- **Clear filter** / **Clear all** buttons
- A **mini-icon tray** appears below when a filter is active for drag-drop convenience

### 11.4 Roster grid
The full filtered hero list rendered as draggable cards.

**Correction:** _(your note here)_

---

## 12. Match Results Summary Page

**Section:** `#page-calc-summary`

**Purpose:** Per-hero summary cards after `runCalculation()` completes.

### Header
- **← Setup** — back to the roster picker
- **Auto-Regenerate** — `autoRegenPromote()` — finds each hero's highest-`.total` build, writes that idx into `MATCH.selectedBuilds`, re-runs `computeResults()`.
- **Re-generate** — toggles a panel with per-hero dropdowns for manual override before re-running

### Regen panel (`#regen-panel`)
Two columns: **Ally Builds** / **Enemy Builds**. Each row is a hero name + a dropdown of their builds. Changing the dropdown sets `MATCH.selectedBuilds[name]` immediately.

### Summary tag panel
**Purpose:** Aggregate "what tags this match is about" — top tags the ally team benefits from + top tags the enemy team is weak to.

**Correction:** _(your note here)_

### Hero summary card (`app.js: makeSummaryCard()`)
Portrait + name + role pill (`★ YOU` / `ALLY` / `ENEMY`) + score pill (+/- %). Each build listed in its own row with `.total` score; the row is **independently clickable** and jumps straight to `openCalcBuild(heroName, buildIdx)`. Clicks on the card body (outside any build row) open `openCalcHero` instead — implemented via `e.stopPropagation()` on the row handler so the two click targets don't collide.

After the build rows: a chip strip with this build's Strengths (good chips) + Counters (bad chips). Then a "Top Items" mini-list (3 items with portraits + score). Then an Items-to-Assist / Items-to-Counter dual column. Then a Targeting / Best-vs / Worst-vs matchup row.

**Codex visual rhythm:** Cards adopt the `.hcard` pattern — 14px radius, soft shadow, lift on hover, role pill in `--green-soft` (ally) / gold (self) / `--bad-soft` (enemy), score pill in matching color. Build rows render as inset-bg pills with a `›` arrow that turns green on hover.

**Dense-only sections** (stripped in Simple Layout via `[data-density="simple"] .dense-only { display: none }`):
- Top-of-page Best/Worst Matchup band
- Per-card Top Items mini-list
- Per-card Items-to-Assist / Items-to-Counter dual column
- Per-card matchup row

**Reasoning:** Build rows being directly clickable saves a hop — power users no longer have to open the hero detail just to drill into a specific build. The dense/simple split lets a phone or glance-view collapse a card to just header + build rows + chip strip without losing the rich data on desktop.

**Correction:** _(your note here)_

---

## 13. Calc Hero Detail Page

**Section:** `#page-calc-hero` (`app.js: openCalcHero()`)

**Purpose:** Per-hero detail view listing all their builds with full scoring breakdowns (ally contributions, enemy contributions, vs-breakdown by individual enemy).

**Sidebar instance card (Codex):** `openCalcHero(name)` calls `window.CODEX.setNavInstance({...})` after rendering — populates the sidebar Selected Instance card (§4.1) with the hero's portrait + name + top-scoring build's name. The card's action buttons jump to: ◈ row → reopens this page; ✦ Build Screen → opens the top build's `openCalcBuild`; ◉ Live Match → starts a sim session with `simStart(name, topBuildIdx)`.

**Correction:** _(your note here)_

---

## 14. Calc Build Detail Page

**Section:** `#page-calc-build`

**Purpose:** Deep-dive view for a single build. The page is **tabbed** (Codex B4) — `openCalcBuild(heroName, buildIdx)` builds a `.tabbar` plus four `.tab-panel` divs inside `#calc-build-detail`.

### 14.1 Tab structure

Four tabs (left to right). The first is open by default:

| Tab            | Star | Content (builders, all in `app.js`)                            |
|----------------|------|----------------------------------------------------------------|
| **Summary**    | ★    | `mkScorePanel(b)` + `mkTagPanel(heroName, buildIdx)` + `mkBestWorstVsPanel(b)` |
| **Build Path** |      | `mkBuildScreenPanel(b, heroName, buildIdx)` + `mkBuildPathPanel(b)` (see §15) |
| **Items**      |      | `mkAssistCounterBuildPanel(b, heroName, buildIdx)` + `mkItemsPanel(b, heroName)` |
| **Breakdown**  |      | `mkBreakdownPanel(b)` (ally / +ally / enemy / +enemy contributions per hero) |

### 14.2 Lazy build

Only the Summary tab is built eagerly on `openCalcBuild`. The other three tabs' content is built on first activation via `activateTab(id)` — the panel checks `panel.dataset.built === '1'` and runs the builder if not. This keeps the initial open fast on a heavy build.

### 14.3 State tracking

`openCalcBuild` sets BOTH `MATCH.viewHeroName` (new) AND `MATCH.viewBuildIdx`. The viewHeroName field is used by `back-from-sim` and other deep-link handlers to figure out where to return to. The viewBuildIdx is used by the regen panel and various scoring re-renders.

### 14.4 Sidebar instance card (Codex)

After `showPage('calc-build')`, `openCalcBuild` calls `window.CODEX.setNavInstance({...})` with the current hero + specific build name + portrait. Action buttons:
- ◈ row → reopens `openCalcHero(heroName)`
- ✦ Build Screen → reopens this same `openCalcBuild(heroName, buildIdx)` (acts as a return-here shortcut)
- ◉ Live Match → starts a sim session with `simStart(heroName, buildIdx)` then jumps to `#page-sim`

**Reasoning:** The original flat-panel layout grew unwieldy as the page accumulated 8 mkX panels. Tabbing groups them by purpose (Summary = the headline; Build Path = the order-of-purchases story; Items = the full table; Breakdown = the math). Lazy build means a user who just wants the Summary doesn't pay for rendering the 200-row Items table.

**Historical:** Before 2026-06-01 the page rendered all eight panels in a single flat sequence. The flat layout shipped from the doc's previous review (§14 originally said "Bottom panel of Calc Build Detail" for the Build Path Guide — that's no longer accurate; Build Path is now a peer tab).

**Correction:** _(your note here)_

---

## 15. Build Path Guide Panel

Content of the **Build Path** tab on Calc Build Detail (§14.1). Was a "bottom panel" of a flat layout until the 2026-06-01 tab restructure; now it's a peer tab (lazy-built on first activation alongside the Build Screen Panel).

### 15.1 Title bar
- **Build Path Guide** label
- **Debug Build** — runs `computeBuildPath()` with `_bpDbg` capture, formats with `formatBpDebug()`, copies to clipboard
- **Show Step-by-Step ▾** — toggles the detail panel

### 15.2 Summary row (`bp-summary-row`)
End-of-Late inventory rendered as chips. Each chip layout (top → bottom):
- **[Symbol slot]** — fixed `min-height: 18px` reserved height so chips align even when empty. Shows the role symbol for spike / required / recommended labels (those with `summary: true` in `BP_LABEL_META`).
- **[Item image]**
- **[Item name]**

**Correction:** _(your note here)_

### 15.3 Sim row (`bp-sim-row`)
Two buttons when `MATCH.simEnabled !== false`:
- **▶ Simulate this build** — opens tick-based simulator. Label → "▶ Resume Simulation" if saved session exists.
- **▶ Live Match** — opens budget-based simulator. Label → "▶ Resume Live Match" if saved.

**Correction:** _(your note here)_

### 15.4 Detail / step-by-step (`bp-detail`, hidden by default)
Per-phase blocks (Lane / Early / Mid / Late / Extra Late). Each phase has a left column with main-path changes and a right column with assist/counter changes.

A main-path row's columns: **action badge** (`+`/`↑`/`−`) → **item image** → **item name** → **Priority** column (the label symbol) → **cost**.

Row backgrounds tint for the top 3 label tiers:
- `bp-row-hl-spike` — orange gradient + 3px left border (loudest)
- `bp-row-hl-required` — gold gradient + 2px left border
- `bp-row-hl-anti` — purple gradient + 2px left border (added for anti-spike row highlight)
- `bp-row-hl-recommended` — faint blue + 1px left border

**Purpose:** "Priority" column shows the symbol for EVERY label kind. Row tint is reserved for the top-tier categories so the eye snaps to them.

**Correction:** _(your note here)_

### 15.5 Upgrade hint
When action is `upgrade`, a `bp-upgrade-from` line reads `from: T1A, T2B` listing consumed components.

**Correction:** _(your note here)_

### 15.6 Close-alt panel
When `c.runnerUp` exists and hasn't been bought, a `bp-alt-panel` appears with "Close alt: <item>".

**Correction:** _(your note here)_

---

## 16. Simulator Page

**Section:** `#page-sim` (`app.js: openSimulation(heroName, buildIdx, b, mode)`, `renderSim()`)

**Purpose:** Tick-based playthrough — you "play" the game by clicking through 35 simulated ticks. Each tick you receive simulated income; the app recommends 3 items (one per column) and you pick / skip / sell / unlock-slot.

**Mode parameter:** `openSimulation(..., mode)` accepts `'tick'` (the default — described here in §16) or `'live'` (Live Match, see §17). The Live Match mode is **not a separate page** — it's the same `#page-sim` with `state.mode = 'live'`, swapping the tick-advance loop for a user-typed souls input. The Codex prototype had a separate clean buy-advisor "Live Match" layout; the current Flask app reuses the simulator chrome for both modes.

### 16.1 Header bar
- **← Build** — back to Calc Build Detail
- Title: `<Hero> — <Build>  ·  Simulation` (or `Live Match` in live mode)
- Subtitle: `N allies vs N enemies · <algo> · <formula>`
- **Focus…** — opens modal to mark "focused" allies/enemies (weighted 2× in scoring)
- **⛶ Fullscreen** — toggles fullscreen layout
- **Blocked** — manage the blocked-items list
- **Save Log** — POSTs current state to `/api/sim-logs`
- **Reset** — clear state and restart

### 16.2 Stats row
- **Souls** — current remaining souls
- **Earned** — cumulative income received
- **Tick** — current tick / max (35)
- **Phase** — Lane / Early / Mid / Late / Extra Late
- **Slots** — owned items / current slot cap (base 9, max 12)
- **+ Slot Unlocked!** — spend an unlocker to raise the cap (9 → 10 → 11 → 12)
- **Save up banner** (Live mode only) — gold pulsing pill that reads `Save up · X more → ItemName` when the globally top-scored item is unaffordable. When this is showing, no item gets the "Recommended" badge.

### 16.3 Sim controls
- **◀ Back** — pop history, rewind one tick
- **Skip** — confirm "no buy this tick". Label flips to **Wait ⏸** (with mint pulse) when the globally top-scored item is unaffordable — meaning the algorithm's single top recommendation can't be purchased yet. Hidden in Live mode.
- **Confirm ▶** — apply the pending choice + advance tick
- **Override…** — manually pick an item not in the 3 recommendation columns
- **Sell Item…** — appears only when at slot cap

**Recommended / Skip logic:** One unified source of truth — `globalBest` = the highest-scored item across all three columns regardless of affordability. If `globalBest.eff <= state.remaining` → badge it as "Recommended". If `globalBest.eff > state.remaining` → show "Wait ⏸" (tick mode) or save-up banner (live mode), and suppress all item recommendation badges.

### 16.4 Body — left aside
- **Lobby** — team comp display (focus stars on focused heroes)
- **Inventory** — items owned so far + slot cap
- **Timeline** — chronological history of buys/sells/skips

### 16.5 Body — three recommendation columns
- **Balance** — fill the build's shape (dot product against `balanceGuide`: self + 0.5×ally − 0.75×enemy, clamped ≥ 0)
- **Strength** — push raw score (per-item: `(ally/gm)×0.15 + self/gm + (enemy/gm)×0.20`, normalized by tier mult)
- **Counter / Survive / Assist** — react to the lobby (dot product against `counterGuide`: self + 0.4×ally + 1.5×enemy, with bonus for counter-tag items)

Each column shows up to 2 affordable cards plus 1 "soon" (next reachable) and 1 "later" (horizon/important pick).

**Column item scoring also applies:**
- Constraint boosts: Required ×3.0, req-component ×1.7, Signature ×1.5, sig-component ×1.2
- Spike anchor boost: ×2.5 always (ensures spike items win Recommended once affordable and surface as save target while not)
- Anti-spike post-spike boost: ×1.8 for anti1 / ×1.3–1.8 for anti2 after owning corresponding spikes
- **Soul-tier fit** (quadratic): `score *= 0.55 + 0.65 * (tier/remaining)²` — sharply penalizes items priced well below your current soul ceiling. At 4400 souls: T2(1600)→×0.63, T3(3200)→×0.90. Ensures tier-appropriate items surface over cheap ones.
- Phase-tier mult: `PHASE_TIER_MULTS[phase][tier_bucket]` — see §22.14.

### 16.6 Sim card (`app.js: makeSimCard()`)
- Item image + name + cost + tier
- **Flag stack** — inline inside card body, shows the highest-priority universal label glyph. See [§20 Labels](#20-universal-label-system).
- **Attribution icons** — mini portraits of allies helped + enemies countered
- **next** / **horizon** badge if unaffordable
- **Recommended** word badge (blue) on the algo's top pick — suppressed when save/wait is recommended
- **Block** button — adds to `state.blocked`

**Card-level visual treatment:**
- **Spike anchor** → hard orange outline (2px)
- **Required** → hard gold outline (2px)
- **Signature** → soft mint halo glow
- **Anti-spike (plain)** → purple outline + glow
- **Required-anti / Signature-anti (dual-role)** → animated rotating conic-gradient border (purple `#c79bff` ↔ gold `#f5c84a` comet sweeping around a dim base ring) + pulsing box-shadow alternating purple/gold. This is rare — only shows when an item is simultaneously a build anchor AND the top counter pick.
- **Most-recommended** (algo top pick) → blue halo

**Correction:** _(your note here)_

---

## 17. Live Match Mode

**Purpose:** Same UI as the Simulator but the user types their CURRENT souls instead of advancing ticks. Used during an actual game.

### Differences from tick mode (`app.js: openSimulation(..., 'live')`)
- `state.mode = 'live'`
- The **Souls** stat cell becomes an editable `<input type="number">` plus three quick-adjust buttons: **−800** / **+800** / **+3200**
- `simLiveTotalEarned(state)` derives `totalEarned = remaining + net-spent` so phase advances when souls cross thresholds
- `simInferTickFromSouls(totalEarned)` picks the closest tick by cumulative income → drives the **Phase** pill display ("~12/35")
- `simAdvanceTick()` is skipped — user drives time, not the sim
- **Skip button** is hidden (no ticks to skip); replaced by the **Save up banner** when saving is recommended
- "Match complete" terminal block never fires (no end of run)
- Fresh live sessions seed `totalEarned = simSuggestedLiveStart()` (tick-7-equivalent souls, roughly mid-Early)

### Save up banner
When `globalBest.eff > state.remaining`, a gold pulsing pill appears in the stats row:
`💰 Save up · X more → ItemName`

When this banner is showing, no item gets the Recommended badge. The banner disappears (and Recommended reappears on an item) the moment you type enough souls to afford the top pick.

**Correction:** _(your note here)_

---

## 18. QA Pages

### 18.1 QA Scenario List (`#page-qa`)
Shows saved scenarios + saved reports + the Sim Log Comparison harness.

- **+ New Scenario** → opens the Scenario Editor
- Each scenario card shows name, allies, enemies, algorithms — clicking it runs the scenario
- Reports section lists saved reports for previously-run scenarios

**Correction:** _(your note here)_

### 18.2 QA Scenario Editor (`#page-qa-edit`)
Left column: name, score formula, algorithm checkboxes, roster picker, optional hero notes.
Right column: hero filter + side toggle + hero grid.

**Correction:** _(your note here)_

### 18.3 QA Run Results (`#page-qa-run`)
Per-algorithm tab. Shows calc results from running each selected algo against the scenario. **Save Report** writes to `/api/qa/reports`.

### 18.4 QA Report Viewer (`#page-qa-report`)
Read-only view of a saved report.

**Correction:** _(your note here)_

---

## 19. Sim Log Comparison Harness

**Section:** At the bottom of `#page-qa`.

**Purpose:** For each saved sim log, runs EVERY build-path algorithm on the same hero/team comp/build, then scores how closely each algo's output matches what you actually bought.

### Bucket scoring
Logs bucketed by `(outcome, feel)`:
- `win:good` = +5 (golden cases)
- `loss:good` = +4
- `win:neutral` = +3
- `loss:neutral` = +2
- `win:bad` = +1
- `loss:bad` = −2 (patterns to avoid)

### Similarity metrics (`app.js: slcSimulateAlgoTicks()`, `slcBucketSim()`, `slcTickActionMatch()`)
- **Inventory similarity** — Jaccard between final inventories
- **Per-souls-bucket similarity** — slice purchases into souls-budget buckets; compare per-bucket
- **Per-tick action match** — at the same tick, did both player and algo buy the same item?

### Output
Markdown-ish report per algo with affinity ranking + per-bucket breakdown. Snapshots saved to `data/sim_log_baselines/` for regression comparison.

**Correction:** _(your note here)_

---

## 20. Universal Label System

Built late in the project to unify how items get tagged across summary chips, step view, and sim cards.

### 20.1 Icon implementation
Icons use **Material Symbols** (Google icon font) via `<span class="msym">icon_name</span>`. The `msym` class applies the font-family and variation settings. Icon names below are the Material Symbols names.

### 20.2 Label types, priority order (loudest → quietest)

| Key | Icon name | Color | `summary` | Notes |
|-----|-----------|-------|-----------|-------|
| `spike` | `trending_up` | `#ffb05a` orange | ✓ | Power-spike anchor |
| `spike-component` | `trending_up` | orange, dim | — | Component of spike |
| `required` | `star` | `--gold` | ✓ | User-flagged required |
| `required-component` | `star` | gold, dim | — | |
| `required-anti` | `star` + `local_police` | gold + purple | ✓ | **Dual-role**: item is both required AND anti-spike anchor. Rare. Gets animated border in sim. |
| `anti` | `local_police` | `#c79bff` purple | — | Anti-spike counter anchor |
| `anti-component` | `local_police` | purple, dim | — | |
| `signature` | `thumb_up` | `--accent` mint | — | User-flagged signature |
| `signature-component` | `thumb_up` | mint, dim | — | |
| `signature-anti` | `thumb_up` + `local_police` | mint + purple | ✓ | **Dual-role**: item is both signature AND anti-spike anchor. Rare. Gets animated border in sim. |
| `recommended` | `bedtime` | `--info` blue | ✓ | Top algo pick per tier |
| `recommended-component` | `bedtime` | blue, dim | — | |

`labelFor(key)` priority: dual-role checks (`required-anti`, `signature-anti`) come BEFORE single-role checks so an item that is both required and anti gets the dual label, not just required.

Anti icon uses thin/outlined weight (`FILL 0, wght 200`) for visual differentiation from the filled spike icon.

### 20.3 Where it lives
- `app.js: BP_LABEL_META` — metadata table (text, title, klass, `summary` flag)
- `app.js: computeBuildLabels(b, pathData)` — returns `{ labelFor, sets }`
- `app.js: computeSurgeAnchors(b, sets)` — universal anchor computation

### 20.4 Where it's used
- **Summary chips** — only `summary: true` labels show. Symbol sits above the image in a reserved-height slot.
- **Step view** — Priority column shows symbol for ALL labels. Component variants are smaller and dimmer.
- **Step view row highlight** — only spike / required / anti / recommended tint the row background.
- **Simulator cards** — single highest-priority glyph in flag stack. See §16.6 for card-level visual treatment.

### 20.5 "Recommended" definition
Top-1 self-score item per tier (4 tiers → max 4 items), excluding required + signature.

**Reasoning:** Old definition was top-4 per tier → 16 items → flooded the chip row. Top-1 keeps the ☾ rare so it means something.

**Correction:** _(your note here)_

### 20.6 Spike anchors are universal
`computeSurgeAnchors()` runs for every algorithm and is attached to `pathData.surgeAnchors`. Architect, Inverse, etc. all get spike/anti markers in the build path display.

**Correction:** _(your note here)_

---

## 21. Scoring Formulas (V1 / V2 / V3)

Selected via `Score Formula` dropdown. Stored in `MATCH.scoreFormula`. Default: `'v3'`.

### V1 — Classic
`total = ally × multBuildAlly + enemy × multBuildEnemy`

Just ally synergy + enemy counter. No symmetric "what do allies/enemies think of MY build" terms.

### V2 — Symmetric
`total = ally × multBuildAlly + allyScoreSelf × multAllyBuild + enemy × multBuildEnemy + enemyScoreSelf × multEnemyBuild`

Adds two reverse-direction terms: how much MY items help allies, how much enemies react to my build.

### V3 — Target Focus (default)
Same shape as V2 but enemy/ally axis weighting tilts toward `v3Targets` — specific heroes flagged as the worst matchup. Rewards builds that specifically beat THEM rather than the average enemy.

**`v3Targets` display:** When `MATCH.scoreFormula === 'v3'`, each build's `v3Targets` array (heroes this build is optimized to counter) is rendered as a "Targeting" row on both the Hero Detail per-build sections (§13) and the Build Detail Summary tab (§14). The row reads `Targeting <Hero1>, <Hero2>` and is colored gold to distinguish it from the regular Best/Worst Vs chips.

**Correction:** _(your note here)_

### Multipliers (default values verified)
- `multBuildAlly` = 1.5 — build-level ally synergy weight
- `multBuildEnemy` = 1.5 — build-level enemy-counter weight
- `multItemAlly` = 1.5 — per-item ally weight
- `multItemEnemy` = 1.5 — per-item enemy weight
- `multAllyBuild` = 0.75 (V2/V3 only) — how much allies benefit from my build
- `multEnemyBuild` = 0.75 (V2/V3 only) — how much enemies react to my build

**Correction:** _(your note here)_

---

## 22. Build-Path Algorithms

The dropdown lives in calc setup row 2. Stored in `MATCH.bpAlgo`. All dispatch through `app.js: computeBuildPath(b, algo)`.

**Currently in the `BP_ALGO_OPTIONS` dropdown** (`app.js: BP_ALGO_OPTIONS` at the top of the QA TAB block, ~line 9736). 11 algorithms total — see §22.1 through §22.11 below.

**Legacy algorithms removed from the dropdown** (per the inline code comment dated 2026-05-13): `assassin`, `lookahead`, `oracle`. Their runner functions remain inside `computeBuildPath` so old saved QA scenarios still resolve correctly, but they aren't surfaced to the user or to the sim-log harness. Reasons (from the comment): `assassin` worst affinity 23.25, over-buys + over-sells; `lookahead` had an ends-early bug + T4 deficit; `oracle` was mediocre across every metric with no differentiator.

### 22.1 `greedy-phase` — Greedy (Phase)
**Algo:** Per phase, fills slots with the highest-`.total` affordable items respecting phase slot budgets. Wrapped by `applyConstraintsFixup()` to force required-item inclusion.
**Code:** `app.js: greedyMain()` + `bpScore()`
**Purpose:** The baseline. Every other algo started life as a tweak to this one.
**Weakness:** Greedy on raw total → T4-slam builds (too many max-tier items) and overuses sells.
**Correction:** _(your note here)_

### 22.2 `marginal` — Marginal Value
**Algo:** `marginalScoreFn` — scores each candidate's marginal contribution given items already owned. Uses cosine-style normalization to penalize tag overlap (diminishing returns per tag).
**Code:** `app.js: marginalScoreFn()`
**Correction:** _(your note here)_

### 22.3 `cosine` — Cosine Deficit
**Algo:** `cosineScoreFn` — items that move the build vector toward a "guide" vector get scored higher.
**Code:** `app.js: cosineScoreFn()`
**Correction:** _(your note here)_

### 22.4 `beam` — Beam Search
**Algo:** Keeps top-K (~3) candidate inventories at each step, expands each, prunes to top-K. Higher quality than greedy but more expensive.
**Code:** `app.js: runBeamSearch()`
**Correction:** _(your note here)_

### 22.5 `expert` — Expert Greedy
**Algo:** Hand-tuned heuristics layered on top of greedy — always upgrade existing chains before starting new ones, etc.
**Code:** `app.js: runExpertGreedy()`
**Correction:** _(your note here)_

### 22.6 `adaptive` — Hybrid Rotation
**Algo:** Rotates between cosine / marginal / lookahead scoring per phase based on heuristics. Was the previous default before Architect.
**Code:** `app.js: runHybridRotation('adaptive')`
**Correction:** _(your note here)_

### 22.7 `fusion` — Fusion (Best of All)
**Algo:** Picks the best move across all scorers each step.
**Code:** `app.js: runHybridRotation('fusion')`
**Correction:** _(your note here)_

### 22.8 `architect` — Architect (Path Planner) — **DEFAULT**
**Algo:** Two-stage:
1. **Architecting** — priority-orders all items (required → signature → rest by `.total`), takes top-2×-slots, walks upgrade chains to build a `componentOf` map.
2. **Tick execution** — per tick, scores affordable candidates by `priorityScore(it) = total × role-boost × (1.2 if needed-by-something) × (1.15 if upgrades-owned-component)`. Souls brackets gate which tier can fire.
**Code:** `app.js: runArchitect()`
**Purpose:** Plans toward a target endgame inventory; uses souls brackets to avoid T4-slamming.
**Correction:** _(your note here)_

### 22.9 `inverse` — Inverse (Endgame Solver)
**Algo:** Backward induction:
1. **Endgame solver** — greedy-fill the 12-slot endgame: required → signature → top score+pair-synergy.
2. **Chain resolver** — for each endgame item, walk to cheapest ancestor chain → ordered `chainPlan`.
3. **Scheduler** — per tick, fire any unowned chainPlan item that's affordable. Escape valve fires off-plan picks after 3+ idle ticks.
**Code:** `app.js: runInverse()`
**Correction:** _(your note here)_

### 22.10 `surge` — Surge (Power Spike)
**Algo:** Two phases:
1. **Anchor planning** — picks 4 anchors:
    - **firstSpike** — top self-axis item from T3+T4 pool, T3-biased (×1.15). HARD priority: if any required item is in the T3+T4 pool, ONLY consider required; else only signature; else normal.
    - **secondSpike** — top self-axis T4-only item, T4-biased.
    - **firstAntiSpike** — top counter-axis T3+T4 item, T3-biased. Scoring uses consensus enemy vulnerability: for each enemy hero, find their top-4 most-negative `enemy_weight` tags; count how many enemies share each tag (consensus count); rank by count then magnitude sum. This means 6 enemies with moderate CC-resist beats 3 enemies with high bullet-resist.
    - **secondAntiSpike** — top counter-axis T3+T4 item, T4-biased. Masked against anti1's top 3 strongest tags to prevent redundant coverage.
    - If an item qualifies as BOTH a spike anchor AND the top counter pick, it gets the `required-anti` / `signature-anti` dual label and ×1.5 additional boost in `priorityScore`.
2. **Execution** — Architect-style souls brackets + `priorityScore × roleBoost × chainBonus` + **anchor-window boost (×5.0)** when an anchor is in its tick window. Post-spike: anti-spike items get a ×1.8 boost once the corresponding spike is owned.

**Code:** `app.js: runSurge()`
**Purpose:** Plans two power spikes timed to guardian/walker and midboss/siege fights; two anti-spikes that punish the enemy team's consensus vulnerability.

**Correction:** _(your note here)_

### 22.11 `fullsurvey` — FullSurvey (CPU KILLER)
**Algo:** Exhaustive (or near-exhaustive) search across the candidate space — explores far more branches than `beam`. The dropdown label literally says "CPU KILLER" because it's expensive enough to lock the browser on a full roster.
**Code:** `app.js: runFullSurvey()` (or whichever runner `computeBuildPath` dispatches `'fullsurvey'` to)
**Purpose:** Brute-force baseline for QA — useful when you want to know "what's the best a search algorithm could find for this build given infinite time?" Compare other algos against it.
**Weakness:** Wall-clock cost. Don't use it inside a QA scenario with more than a couple heroes.
**Correction:** _(your note here)_

### 22.12 Algorithm constants reference

**`PHASE_TIER_MULTS`** (verified against code):
```
           T1(≤800)  T2(≤1600)  T3(≤3200)  T4(>3200)
Lane:       1.30      0.95       0.15        0.00
Early:      0.75      0.90       0.80        0.05
Mid:        0.45      0.80       1.05        0.65
Late:       0.10      0.40       1.00        1.20
Extra Late: 0.00      0.20       0.80        1.30
```

Note the **Lane** phase has high T1 (1.30) and very low T3/T4 — appropriate for the opening phase. Early now gives T3 a real score (0.80) rather than heavily penalizing it (was 0.55 before a recent tuning pass).

**Other constants:**
- `BUILD_PHASES` — name, addBudget, totalSlots, minSlots, maxSells per phase (Lane → Extra Late)
- `COUNTER_TAG_THRESH` = 0.2 (lowered from 0.3; below this threshold no item trips the counter tag flag)
- `DEFAULT_COUNTER_SLOTS` = `[[0,1],[0,2],[1,2],[2,3],[2,4]]` (Lane → Extra Late)
- `SIM_TICK_INCOME` — 35-element income curve growing from 800 → 4300
- `SIM_NUM_TICKS` = 35
- `SIM_BASE_SLOT_CAP` = 9 (initial), `SIM_MAX_SLOT_CAP` = 12

**Correction:** _(your note here)_

---

## 23. Modals & Misc UI

### 23.1 `#modal-tag` — Add / Edit Tag
Code + display name + description.

### 23.2 `#modal-build` — Add Build
Build name + code name + description. Optional "Copy from preset hero" with hero + source-build selectors.

### 23.3 `#modal-new-hero` — New Hero
English name + normalized key.

### 23.4 `#toast` — bottom-right notification
`toast(msg, type?)` helper. `type = 'error'` → red styling. Auto-dismisses after a few seconds.

### 23.5 `#sim-modal-host` — dynamic simulator modal container
Empty `<div id="sim-modal-host"></div>` in `templates/index.html` used by the simulator (§16) to dynamically render its **Override**, **Sell Item**, **Focus**, **Blocked**, and **Save Log** panels. The `simShowModal(title, builder)` helper writes a `.modal-overlay > .modal.sim-modal` skeleton into the host and lets the caller populate the body. `simCloseModal()` clears the host.

### 23.6 `#settings-drawer` / `#drawer-scrim` — Codex settings drawer
Right-slide panel introduced by the Codex visual redesign — see §4.2 for the full spec. Lives at body level and is opened/closed by `window.CODEX.openDrawer()` / `closeDrawer()`.

**Correction:** _(your note here)_

---

## 24. Backend (`app.py`)

Flask app, single file. Bootstraps directories on first run. Reads/writes JSON files; no database.

### 24.1 Endpoints

**Static image proxy**
- `GET /src/<filepath>` — serves images from `../resources/...`

**Tags**
- `GET /api/tags`, `POST /api/tags`, `PUT /api/tags/<code>`, `PUT /api/tags` (reorder), `DELETE /api/tags/<code>`

**Heroes**
- `GET /api/heroes` — summary list (presets first, then canonical `HERO_KEYS` order, then custom)
- `GET /api/heroes/<name>` — full hero JSON
- `PUT /api/heroes/<name>` — overwrite file
- `POST /api/heroes` — create with blank General build

**Items**
- `GET /api/items` — summary list sorted by `index.json` order
- `GET /api/items/<name>` — full item JSON
- `PUT /api/items/<name>` — save
- `GET /api/items/all` — full item array (what the calculator uses)

**QA**
- `GET/POST /api/qa/scenarios`, `PUT/DELETE /api/qa/scenarios/<id>`
- `GET/POST /api/qa/reports`, `GET/DELETE /api/qa/reports/<rid>`

**Sim Logs**
- `POST /api/sim-logs` — write new log
- `GET /api/sim-logs` — list summaries
- `GET /api/sim-logs/<log_id>` — single log content

**Index**
- `GET /` — renders `templates/index.html`

### 24.2 Bootstrap
On import, creates data directories and seeds them: writes `DEFAULT_TAGS` if `tags.json` doesn't exist; creates blank hero JSONs for `HERO_KEYS` if missing (sourcing portraits + wiki URLs from `../resources/heroes/<key>/manifest_<key>.json`).

**Correction:** _(your note here)_

---

## 25. Data Files

### 25.1 `data/tags.json`
Array of `{ code, name, description }`. ~50 entries. Special tags: `assist_importance`, `counter_importance` are excluded from normal scoring via `SKIP_TAGS` but used as tiebreakers in specific contexts (e.g. `counter_importance` gives a 4% tiebreaker in anti-spike item selection).

**Correction:** _(your note here)_

### 25.2 `data/heroes/<key>.json`
```jsonc
{
  "eng_name": "Grey Talon",
  "normalized_name": "grey_talon",
  "desc_eng": "...",
  "image_path": "...",
  "mini_image_path": "...",
  "wiki_url": "...",
  "colors": ["white", "orange", "yellow"],
  "search_terms": ["Talon"],
  "default_build_name": "grey_talon_gun",     // sets the starting selectedBuilds
  "builds": [
    {
      "name": "General",
      "normalized_build_name": "grey_talon_general",
      "build_description_eng": "...",
      "follow_build_name": null,              // for inheritance
      "confidence": { "rel": "=", "val": 0 },
      "disabled": false,
      "signature_items": [...],
      "required_items":  [...],
      "blacklist_items": [...],
      "counter_phase_slots": [[0,1],[0,2],[1,2],[2,3],[2,4]],
      "values": {
        "ally_weight":    { tag_code: number_or_null, ... },
        "item_affinity":  { tag_code: number_or_null, ... },
        "enemy_weight":   { tag_code: number_or_null, ... },
        "playstyle_score":{ tag_code: number_or_null, ... }
      }
    }
  ]
}
```

**Correction:** _(your note here)_

### 25.3 `data/items/<key>.json`
```jsonc
{
  "name": "Frenzy",
  "normalized_name": "frenzy",
  "category": "Weapon",
  "tier": 3200,          // 800/1600/3200/6400 (or 9999 for placeholders)
  "wiki_url": "...",
  "image_path": "...",
  "remarks": "...",
  "confidence": 0,
  "upgrades_from": ["headhunter"],
  "compare_to": ["headhunter"],
  "values": {
    "playstyle_score": { tag_code: number_or_null, ... }
  }
}
```

**Correction:** _(your note here)_

### 25.4–25.7 QA and sim log files
See original descriptions — no known corrections.

---

## 26. Visual Design — Theme, Colors, Fonts, Icons

### 26.1 Theme posture

**Choice:** Dark, flat, painterly — not glass / glossy / Material. Matches Deadlock's stenciled, occult, lived-in aesthetic.

**Correction:** _(your note here)_

### 26.2 Surface hierarchy

CSS variables in `style.css: :root`:

| Variable       | Hex       | Where                                          |
|----------------|-----------|------------------------------------------------|
| `--bg`         | `#121412` | Page backdrop                                  |
| `--bg-elev`    | `#181a18` | Subtle lift                                    |
| `--surface`    | `#121412` | Page-panel bg (matches bg deliberately)        |
| `--surface-lt` | `#1c1f1c` | Hover state for surfaces                       |
| `--panel`      | `#1a1d1a` | Inner panels / sidebar                         |
| `--card`       | `#1c1f1c` | Cards / inputs                                 |
| `--card-warm`  | `#1f221d` | Warm variant for spotlighted cards             |
| `--border`     | `#2e3230` | Default border                                 |
| `--border-soft`| `#232624` | Quieter divider                                |
| `--border-dark`| `#0a0c0a` | Deep pencil-line edge                          |

**Correction:** _(your note here)_

### 26.3 Primary accent — Deadlock Green

| Variable       | Hex       | Where                               |
|----------------|-----------|-------------------------------------|
| `--accent`     | `#75e8a2` | Solid-color contexts                |
| `--accent-top` | `#5ad894` | Gradient top                        |
| `--accent-bot` | `#90f8b1` | Gradient bottom                     |
| `--accent-dk`  | `#3da970` | Active button border                |

**Correction:** _(your note here)_

### 26.4 Text colors

| Variable     | Hex       | Where                                  |
|--------------|-----------|----------------------------------------|
| `--text`     | `#e4d7c1` | Primary text — light tan parchment     |
| `--cream`    | `#efe2cc` | Lighter; hover-elevated text           |
| `--muted`    | `#7c7468` | Secondary text — labels, hints         |
| `--muted-dim`| `#555049` | Very-faded — empty states              |

**Correction:** _(your note here)_

### 26.5 Semantic accents

| Variable     | Hex       | Stands for                                          |
|--------------|-----------|-----------------------------------------------------|
| `--good`     | `#53c055` | Wins, positives, buy-action badges                  |
| `--danger`   | `#b9463e` | Losses, sells, destructive actions                  |
| `--vitality` | `#a5c941` | Vitality items                                      |
| `--spirit`   | `#b26ed7` | Spirit items                                        |
| `--weapon`   | `#deb11b` | Weapon items (saffron/orange)                       |
| `--gold`     | `#f5c84a` | Required items, star markers, key callouts          |
| `--soul`     | `#93cdab` | Pale mint — soul currency                           |
| `--info`     | `#62a7af` | Recommended items, upgrade badges                   |

**Correction:** _(your note here)_

### 26.6 Tier colors

| Variable   | Hex       | Tier     |
|------------|-----------|----------|
| `--tier-1` | `#d4b07a` | 800 souls  |
| `--tier-2` | `#d97a1f` | 1600 souls |
| `--tier-3` | `#c44b3c` | 3200 souls |
| `--tier-4` | `#8a2828` | 6400 souls |

Note: In sim card display, tier is shown as `T${Math.round(tier/800)} · ${souls}` — so a 3200-soul item displays as "T4 · 3200".

**Correction:** _(your note here)_

### 26.7–26.8 Shadows and Typography
See original document — no confirmed corrections.

**Correction:** _(your note here)_

### 26.9 Iconography

#### Sidebar nav icons
[UNCERTAIN — original descriptions may be correct; please verify]

#### Universal label glyphs (see §20 for full table)
Labels use **Material Symbols** icon names, not Unicode characters:

| Icon name     | Label          | Color          | Treatment                                          |
|---------------|----------------|----------------|----------------------------------------------------|
| `trending_up` | Spike          | `#ffb05a` orange | Largest, text-shadow pulse; outlined variant for dual-role |
| `star`        | Required       | `--gold`       | Bold                                               |
| `local_police`| Anti-spike     | `#c79bff` purple | Outlined weight (FILL 0, wght 200)               |
| `thumb_up`    | Signature      | `--accent` mint | Smaller / dimmer                                  |
| `bedtime`     | Recommended    | `--info` blue  | Same size as signature                             |

Dual-role labels (`required-anti`, `signature-anti`) show two icons side by side. First icon colored for the primary role (gold / mint), second icon (`local_police`) colored purple.

#### Build-path action badges
| Symbol | Action  | Color           |
|--------|---------|-----------------|
| `+`    | Buy     | `--success` green tint |
| `↑`    | Upgrade | `--info` blue tint |
| `−`    | Sell    | `--danger` red tint |

**Correction:** _(your note here)_

### 26.10 Buttons — variants
[Original descriptions appear correct — no confirmed corrections]

**Correction:** _(your note here)_

### 26.11 Interaction states

#### Selected sim card
White halo (`box-shadow: 0 0 0 2px #ffffff, 0 0 12px 3px rgba(255,255,255,.45)`) — overrides any other border treatment.

#### Recommended (most-rec on sim card)
- Blue word badge "Recommended" — bottom-left of card
- Blue halo around card
- Suppressed when the globally top-scored item is unaffordable (save/wait state)

#### Save up banner (live mode)
Gold pulsing pill with `@keyframes save-banner-pulse` (box-shadow breathes 6px → 16px). Shows in stats row, disappears when you can afford the top pick.

**Correction:** _(your note here)_

### 26.12 Animation principles

Sparing use — reserved for functional signaling:

| Animation | Element | Purpose |
|-----------|---------|---------|
| `bp-spike-glyph-pulse` | Spike anchor glyph | Orange text-shadow 4px→10px, 1.8s. "This is the loudest thing on the page." |
| `sim-wait-pulse` | Wait ⏸ button | Mint halo pulses when algo recommends waiting |
| `dual-anchor-sweep` | `.bp-label-required-anti` / `.bp-label-signature-anti` sim card `::before` | Conic-gradient `from` angle animates 0°→360° (3s). Creates a purple↔gold comet sweeping around a dim base border ring. The element does NOT rotate — only the gradient's `from` angle changes, requiring `@property --da-angle`. |
| `dual-anchor-glow` | Same dual-role sim cards | Box-shadow alternates between purple and gold glow (3s ease-in-out). |
| `save-banner-pulse` | `#sim-save-banner` | Gold box-shadow breathes 5px→16px (1.8s). |

**Key principle:** No global loading spinners; toasts are slide-in. Animation is reserved for "this thing matters right now," not decoration.

**Correction:** _(your note here)_

### 26.13 Spacing & layout
[Original descriptions appear correct — no confirmed corrections]

**Correction:** _(your note here)_

### 26.14 Toast notifications
Bottom-right `#toast`. `toast(msg, type?)`. Default: mint-tinted border. `'error'`: red border. Auto-dismisses ~2.5s.

**Correction:** _(your note here)_

### 26.15 Decision log — visual changes during development

1. **Required style:** red pulsing halo → gold star (avoids conflicting with Sell red)
2. **Recommended:** mint glow → light gold → blue `--info` (gold conflicted with Required gold)
3. **Symbol position on summary chips:** corner badge over image → own slot above image with reserved height
4. **Step view badge position:** before name → after name in dedicated Priority column
5. **Sim card borders:** every role had colored border → only spike + required get hard outlines; signature gets soft halo; rest are glyph-only
6. **Spike/anti visibility:** Surge-only → universal labels for every algorithm
7. **Sim card flag stack:** absolute top-left overlay → inline in card body (image stays clean)
8. **Signature size:** same as Required → shrunk (~11px / 0.8 opacity)
9. **Recommended definition:** top-4 per tier → top-1 per tier
10. **Row highlight:** every labeled row → only spike / required / anti / recommended
11. **Dual-role items (required-anti, signature-anti):** New. Items that are both a required/signature build anchor AND the top anti-spike counter pick get both icons, both scoring multipliers (×1.5 dual-anchor bonus in `priorityScore`), and an animated rotating border in the simulator.
12. **Anti-spike scoring:** Was based on item-correlation aggregation (always picked bullet resist) → now uses consensus `enemy_weight` vectors from actual enemy heroes' builds. Each enemy's top-4 most-negative `enemy_weight` tags counted; sorted by how many enemies share each tag.
13. **Recommended / Save-up banner unification:** Were two separate algorithms (topKey from affordable items; save heuristics from gap-ratio/quality-ratio). Now one system: `globalBest` = highest-scored item across all columns regardless of affordability. If affordable → badge it; if not → save banner. Skip button / Wait ⏸ same logic.
14. **Soul-tier fit in sim column scoring:** Quadratic multiplier `0.55 + 0.65 * (tier/remaining)²` added to all three column scorers. At 4400 souls: T2→×0.63, T3→×0.90. Ensures higher-tier items naturally surface as you accumulate souls.

**Correction / additional history:** _(your note here)_

---

## 27. Codex Redesign Overlay (2026-06-01)

A second visual direction landed on top of the original "Atelier" theme: the **Codex** direction, sourced from an Anthropic Claude Design handoff (`Deadlock Advisor-handoff.zip`). Codex is an esports-companion structure (op.gg / Mobalytics feel) skinned in Deadlock colors — rounded cards, wider sidebar, bigger tap targets, a sticky topbar, a settings drawer, a parchment light mode, and a mobile bottom nav.

The original Atelier sections (§26.1–§26.15) remain accurate for legacy components — Codex layers on top via token swaps and component additions, **without renaming the existing classes the JS depends on**.

### 27.1 Surface hierarchy (current)

The `:root` block in `style.css` was rewritten. Old vars are kept as aliases (e.g. `--bg → var(--page)`) so the 2,800 existing rules still resolve.

| Variable (new) | Hex (dark)   | Hex (light, `[data-theme="light"]`) | Where                                  |
|----------------|--------------|--------------------------------------|----------------------------------------|
| `--page`       | `#15181c`    | `#e6dcc4`                            | Page backdrop                          |
| `--page2`      | `#191c21`    | `#efe7d4`                            | Sidebar / topbar surface               |
| `--panel`      | `#20242a`    | `#f3ecdc`                            | Framed section bg                      |
| `--card`       | `#22262b`    | `#f6f0e2`                            | Cards / inputs                         |
| `--card-h`     | `#2a2f36`    | `#fbf6ea`                            | Card hover                             |
| `--inset`      | `#1a1d22`    | `#e3d8bf`                            | Sunken row / drawer body               |
| `--line`       | `#2f343b`    | `#d2c5a6`                            | Primary divider                        |
| `--line-soft`  | `#262a30`    | `#ddd1b5`                            | Row separator                          |
| `--ink`        | `#e9e4d8`    | `#2b2a22`                            | Primary text (replaces `--text`)       |
| `--dim`        | `#8b8f96`    | `#857c63`                            | Secondary text                         |
| `--faint`      | `#5e636b`    | `#a99d80`                            | Placeholder / very dim                 |

### 27.2 Light theme

`[data-theme="light"]` on `<html>` flips the palette to warm parchment (per the Overhaul Proposal's Direction-A swatches). The accent shifts to a deeper green (`#3a7a52`) since the bright `#75e8a2` would wash out on cream. Default = dark; persists via `localStorage.codex_settings_v1.theme`.

### 27.3 Layout primitives (new)

| Variable     | Value  | Where                                           |
|--------------|--------|-------------------------------------------------|
| `--nav-w`    | `228px`| Sidebar width (was `--sidebar-w: 168px`)        |
| `--gut`      | `22px` | Page gutter                                     |
| `--gap`      | `16px` | Card gap                                        |
| `--r`        | `14px` | Large radius (panels, cards)                    |
| `--r-sm`     | `9px`  | Small radius (buttons, chips, inputs)           |
| `--r-pill`   | `999px`| Pill radius (chips, instance-pill)              |
| `--shadow`   | `0 10px 30px rgba(0,0,0,.45)` | card hover shadow                |
| `--shadow-sm`| `0 3px 10px rgba(0,0,0,.35)`  | resting shadow                   |
| `--green-soft` | `rgba(117,232,162,.14)` | nav-item.active bg               |
| `--green-line` | `rgba(117,232,162,.40)` | nav-item.active border           |
| `--you`      | `var(--gold)` | "Self" hero highlight on chips/cards       |

### 27.4 New IA — Default / Advanced / Developer

Sidebar nav items carry `data-nav-group` and the **settings drawer** controls visibility:

- **Default** (always shown): Calculator
- **Advanced** (gated by `Advanced features` toggle): Heroes, Items
- **Developer** (gated by `Developer features` toggle): Tags, QA

The toggles persist via `CODEX.set({advanced, developer})` → `localStorage.codex_settings_v1`. First-time visitors see only the build-loop entry (Calculator) until they switch on the deeper surfaces.

### 27.5 Settings drawer (B1)

Right-slide panel (`#settings-drawer`) opens from the sidebar ⚙ button or the mobile bottom-nav Settings tab. Contains a theme `.seg` (Dark/Light), a Dense-layout `.toggle`, an Advanced `.toggle`, and a Developer `.toggle` (purple-tinted). State is held by the `CODEX` module at the top of `app.js`.

### 27.6 Selected-instance sidebar block (B3)

When the user opens a hero in Hero Edit, a green-bordered card slots into `#nav-instance-host` showing the hero portrait + name + current build, plus action buttons. The API:

```js
window.CODEX.setNavInstance({
  key:         'seven',          // hero key
  name:        'Seven',          // display name
  build:       'GVS — Power Surge',
  portraitUrl: '/src/heroes/seven.png',
  onOpen:      () => showPage('hero-edit'),
  onBuild:     () => showPage('hero-edit'),
  onLive:      () => showPage('sim'),
});
// Clear:
window.CODEX.setNavInstance(null);
```

`showPage` automatically clears the instance when navigating to a top-level page (heroes / items / tags / calc / qa) via the `NON_INSTANCE_PAGES` set.

### 27.7 Mobile bottom nav (B7) + density toggle (B8)

At `≤760px` the sidebar hides and `.botnav` appears — Calc tab + dynamic instance buttons + Settings tab. `[data-density="simple"]` hides any element marked `.dense-only` and reveals `.simple-only` — used for phone "glance-while-playing" mode on the simulator.

### 27.8 Topbar / tabbar / drawer / toggle / seg — new component primitives

Defined at the bottom of `style.css` under the `CODEX OVERLAY` banner. The legacy `.page-header` is **not** physically replaced — it now inherits the new tokens and gets a non-uppercase serif h1. The `.topbar` class is available for new pages but not retrofitted onto every existing page (keeps the layout-rewrite risk low). Likewise the `.tabbar` / `.tab-btn` system is ready but not yet wired into `#calc-build-detail` — that's a follow-up since the build detail is rendered dynamically by JS and would need its render function restructured.

### 27.9 Sidebar restyle

`#sidebar` is now 228px wide with `--page2` background and a horizontal brand row (gradient tile + serif wordmark). Nav buttons are non-uppercase, 14.5px, with the active state in green-soft/green-line instead of solid green block. Foot of the sidebar holds Theme toggle + Settings buttons separated by a thin divider.

### 27.10 Deferred from this pass

- **B4 — Tabbed Build Detail.** The current `#page-calc-build` is rendered dynamically by JS into a single container. CSS for `.tabbar` / `.tab-btn` / `.tab-panel` is ready, but slotting tabs in needs the render function restructured. Picked up next.
- **B5 — Build Screen grid (phase × Core/Optional/Counter).** Out of scope per Brandon's choice.
- **Editor structural cleanup (C).** Token swap covers the visual feel; the `.topbar` pattern is not yet applied to `.page-header` blocks page-by-page. Form/table rhythm inherits from the new tokens automatically.

### 27.11 Persistence schema

```jsonc
// localStorage.codex_settings_v1
{
  "theme":     "dark",      // 'dark' | 'light'
  "density":   "dense",     // 'dense' | 'simple'
  "advanced":  false,       // hides Heroes/Items in sidebar when false
  "developer": false        // hides Tags/QA in sidebar when false
}
```

The `CODEX` IIFE at the top of `app.js` reads this on every load, applies `data-theme`/`data-density` to `<html>`, toggles `[data-nav-group]` element visibility, and rebinds drawer/toggle handlers.

---

## End

Sections with `[UNCERTAIN]` tags need verification. Every **Correction** line is available for you to fill in and ask for a rewrite of that section.
