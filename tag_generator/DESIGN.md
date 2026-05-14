# Deadlock Advisor — Design & Code Reference

> Comprehensive walkthrough of every screen, button, label, algorithm, and system in the Deadlock Advisor build advisor. Each subsection has **Purpose** (my interpretation of what it does and why it exists), **Reasoning** (the design intent / historical context I inferred), and a **Correction** line for you to overwrite anything I got wrong.
>
> Code references use the form `app.js: functionName()` since exact line numbers drift as the file is edited.

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

---

## 1. Overview

**Purpose:** A Flask + vanilla-JS web tool for designing Deadlock hero builds and analyzing how those builds perform against a given team composition. It does two distinct jobs:

1. **Authoring** — edit per-hero tag weights, define multiple "builds" per hero (e.g. gun Grey Talon vs spirit Grey Talon), and tag-score the items pool.
2. **Match analysis** — drag heroes into ally/enemy teams, score every hero's builds vs the lineup, then drill in to a single build and walk through its recommended buy order (Build Path Guide) or play a Simulator / Live Match against it.

**Reasoning:** The whole architecture rests on a tag system. Heroes have per-tag `self_weight` / `ally_weight` / `enemy_weight` / `self_score` vectors. Items have per-tag `self_score` vectors. Build scoring is the dot product of these vectors weighted by team membership. The simulator and the algorithms all rely on the same vectors — no separate scoring system anywhere.

**Correction:** _(your note here)_

---

## 2. File Structure

```
public/tag_generator/
├── app.py                    Flask backend (data CRUD + index render)
├── templates/index.html      Single-page app shell with every screen as a <section>
├── static/
│   ├── app.js                ~9k lines — every screen render, every algorithm
│   └── style.css             Theme + per-component styling
└── data/
    ├── tags.json             Master tag list (40-ish tag codes)
    ├── heroes/<key>.json     One file per hero, contains builds[] with full vectors
    ├── items/<key>.json      One file per item, contains tier + per-tag self_score
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

Key fields:
- `MATCH.allies[]`, `MATCH.enemies[]` — arrays of hero `normalized_name` for the two teams
- `MATCH.heroData[name]` — raw JSON fetched from `/api/heroes/<name>`
- `MATCH.itemData[]` — flat array of all items, fetched once per calc
- `MATCH.results[]` — per-hero `{ name, builds: [buildResult, ...], topBuilds }` computed by `computeResults()`
- `MATCH.selectedBuilds[heroName]` — which build index of each hero is "currently viewed" AND is used as that hero's vector source for cross-hero scoring
- `MATCH.mult` — six scoring multipliers (build×ally, build×enemy, item×ally, item×enemy, ally←me, enemy→me)
- `MATCH.bpAlgo` — currently selected algorithm name (default `'architect'`)
- `MATCH.scoreFormula` — `'v1'` | `'v2'` | `'v3'` (default `'v3'`)
- `MATCH.autoRegen` — when true, `runCalculation` does a second pass after promoting each hero's top build
- `MATCH.simStates[heroName::buildIdx]` — per-build sim states (tick, owned items, history, etc.)
- `MATCH.simEnabled` — whether to show the "Simulate this build" buttons on each build detail page

**Reasoning:** A single global object simplifies persistence (one `JSON.stringify(MATCH)` call) and lets every render function read from the same source of truth.

### `S` — editor state
**Purpose:** Tracks which hero/item/build the user is currently EDITING (separate from `MATCH` which is about analysis).

Key fields: `S.currentHero`, `S.currentBuildIdx`, `S.currentItem`, `S.heroList`, `S.itemList`, `S.tags`.

**Reasoning:** Editor and calculator are conceptually different — user could edit hero data while a match is mid-analysis. Keeping them separate avoids accidental cross-coupling.

### `SIM` — simulator session pointer
**Purpose:** `SIM.current = { heroName, buildIdx, b, key }` points to whichever sim state is currently open on the sim page. `SIM.states` aliases `MATCH.simStates`. `SIM.fullscreen` toggles a fullscreen view.

### `_bpDbg` — build-path debug capture
**Purpose:** When the user clicks "Debug Build", this gets temporarily populated by `computeBuildPath()` with `phases`, `guide`, algorithm-specific traces (`architectTicks`, `inverseTicks`, `surgeTicks`, `surgeAnchors`, etc.). `formatBpDebug()` turns it into a clipboard-friendly text dump.

**Correction:** _(your note here)_

---

## 4. Sidebar & Page System

### Sidebar (`index.html` lines 14-21)
Five nav buttons: **Heroes**, **Items**, **Tags**, **Calculator**, **QA**.

**Purpose:** Top-level navigation. Clicking each one calls `showPage(id)` which hides all `<section class="page">` elements and reveals one. The matching `nav-btn` also gets `.active`.

**Reasoning:** Single-page layout means no full page reloads — calculator state, sim state, and editor state all persist across nav clicks.

**Correction:** _(your note here)_

### `showPage(id)` (`app.js: showPage()`)
**Purpose:** Hides every `.page`, reveals the requested one, and syncs the sidebar `.nav-btn` `.active` class based on a `data-page` match (looking back at the page id stem).

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

### 6.2 Hero info panel (left column)
Two preview images (portrait + mini icon) + a fields column with **English Name**, **Hero Key (normalized)**, **Description**, **Portrait Path**, **Mini Icon Path**, **Wiki URL**, **Default Build** (dropdown), **Filter Colors** (clickable swatch grid), **Search Terms** (chip input).

#### Default Build dropdown (`app.js: renderDefaultBuildSelect()`)
**Purpose:** Lists every build for the current hero. The chosen build's `normalized_build_name` is saved as `h.default_build_name`. On every `runCalculation` call, each hero's `MATCH.selectedBuilds[name]` is seeded from this default — so this is the build that gets sent to OTHER heroes when scoring against this hero.

**Reasoning:** General build (index 0) used to be the implicit vector source. Heroes with bimodal playstyles (Grey Talon's gun vs spirit, for instance) needed a way to declare which playstyle other heroes should assume by default without making the user toggle a dropdown every match.

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

**Reasoning:** General is special because index 0 is the historical default vector source. Even with the new `default_build_name` field, lots of internal code falls back to `hero.builds[0]` so it's pinned.

**Correction:** _(your note here)_

### 6.4 Build meta row (under tabs)
Per-build fields: **Build Name**, **Code Name**, **Description**, **Follows Build** (inheritance source), **Confidence** (manual ±0.5 nudge with relative operator `=` / `+` / `x`), **Disabled** (checkbox), **Delete Build**.

#### Follows Build
**Purpose:** Lets this build inherit weights from another build of the same hero. The inherited build acts as a baseline; you only override what's different. `resolveBuildValues()` walks this chain at score time.

**Reasoning:** Lets you define a "Spirit" build that just tweaks a few tags from "General" without copy-pasting the entire vector.

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
1. **Signature Items** — `×1.5` score boost (or `×1.9` "strong" variant for non-greedy algos)
2. **Required Items** — `×2.0` (or `×2.6` strong) + force-buy + sell-stickiness
3. **Blacklist Items** — never recommended; their chain components still allowed elsewhere
4. **Counter Items per Phase** — per-phase `[min, max]` slots that override `DEFAULT_COUNTER_SLOTS` (defaults: Lane `[0,1]`, Early `[0,2]`, Mid `[1,2]`, Late `[2,3]`, Extra Late `[2,4]`)

Search inputs autocomplete from `MATCH.itemData`. Selected items appear as chips below.

**Purpose:** Lets the build author force-include or force-exclude specific items per build, and explicitly control how many "counter" items the algorithm reserves slots for in each phase.

**Reasoning:** Algorithms are noisy — sometimes you KNOW a hero needs a specific item every game. Required is the strongest knob; Signature is softer. Blacklist removes options entirely (useful for hero-specific anti-synergies). Counter slots constrain the assist/counter column so e.g. Late always reserves at least 2 counter slots.

**Correction:** _(your note here)_

### 6.6 Preset banner
**Purpose:** Shown only when the General build is empty. Lets you pre-fill General by copying weights from another hero's build.

**Correction:** _(your note here)_

### 6.7 Tag table (`#hero-tag-table`)
Rows = tags from `tags.json`. Columns:
1. **Tag** — display name
2. **Ally Weight** — multiplied with teammates' item self_scores during scoring; "how does THIS hero benefit from a teammate having this tag"
3. **Self Item Weight** — multiplied with item self_scores during item recommendation; "how strong is an item with this tag FOR THIS hero"
4. **Enemy Weight** — multiplied with enemies' item self_scores; "how does an enemy with this tag HURT this hero"
5. **Playstyle/Ability Score** (`self_score`) — used directly in self build calculations AND multiplied into other heroes' ally/enemy scoring; "how much does THIS hero's kit have this tag"

Cells accept numbers in `-1..+1`. A blank/null cell means "inherits from followed build" (or 0 if no follow chain).

**Purpose:** Core data entry. Every score in the entire app is some dot product of an item's self_score against one of these weight vectors.

**Reasoning:** Four vectors per build because each represents a different relationship: how I weight items for me (`self_weight`), how I value an ally's items (`ally_weight`), how I dislike an enemy's items (`enemy_weight`), and how I describe my own playstyle (`self_score`).

**Correction:** _(your note here)_

---

## 7. Reverse Engineer Page

**Section:** `#page-reverse-engineer`

**Purpose:** Given an observed real game (items bought + enemies killed + allies played with), infer a tag-weight build vector for this hero. The result fills `S.currentHero`'s currently-active build so the user can review and tweak before saving.

### Left column — Build Order
**Purpose:** Add items in purchase order. Earlier buys carry a small bonus; higher-tier items count more. Each chip has a `○` toggle that cycles **none → ★ Signature (×1.6) → REQ Required (×2.5)** to mark which items should be considered foundational.

**Reasoning:** Sometimes you replay a game and notice a specific item is what made the build click. Marking it Required at reverse-engineer time pre-fills the build constraints panel.

**Correction:** _(your note here)_

### Right column — Context + settings
- **Enemies Killed Most** — heroes you got kills on this game. Click to select; click again to mark **★ impactful**. The build vector then leans toward tags those enemies are weak to.
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

**Purpose:** Edit a single item's metadata + tag self_scores.

### Header (back / dirty / save)
Same pattern as Hero Edit.

### Item info panel
- **Name**, **Normalized Name** (readonly), **Category**, **Tier**
- **Wiki URL**, **Image Path**
- **Remarks** — freeform note (shown on hover in some contexts)
- **Confidence** — `±0.5` manual recommendation nudge specific to this item
- **Upgrades From** — comma-separated list of component item keys. Defines the upgrade chain so the build path knows that buying a T4 "consumes" specific T1/T2/T3 components.
- **Compare To** — chip list of related items for tag-similarity reference (UI helper, doesn't affect scoring)

### Tag table
Single column: **Item Score** per tag. Multiplies with each hero's Self Item Weight to produce per-item scoring.

**Correction:** _(your note here)_

---

## 10. Tags Page

**Section:** `#page-tags`

**Purpose:** CRUD the master tag list (`tags.json`). Columns: drag-handle, code, display name, description, delete.

### + Add Tag button
Opens `#modal-tag`. New tags get blank values in every hero and item; the user has to backfill them.

**Reasoning:** Tags are the dimensions of the whole vector space — adding one is a big deal because it widens every hero/item file. Removing one is destructive (data is gone in every file).

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
- **V2 Build** group (`Ally←Me`, `Enemy→Me`) — V2-only / V3-only symmetric build synergy terms
- **Auto-regen** checkbox — after first calc, auto-promote each hero's top build and re-run once
- **Calculate Builds →** — the main button; fires `runCalculation()`

**Purpose / Reasoning:** All scoring knobs live here so you can fiddle without leaving the screen. The default values (1.5 / 1.5 / 1.5 / 1.5 + 0.75 / 0.75) are tuned to give roughly the same magnitudes between the ally-axis and the enemy-axis.

**Correction:** _(your note here)_

### 11.2 Teams bar
Two drop zones: **Allies (0/6)** and **Enemies (0/6)**. Drag heroes from the roster grid below into either column. Each chip can be dragged between teams or removed.

### 11.3 Filter bar
- **Text filter** — searches `eng_name`, `normalized_name`, `search_terms`. Word-prefix match (so "iv" finds "Ivy" but not "Shiv")
- **Color filter chips** — narrow the roster grid by hero color tags
- **Clear filter** / **Clear all** buttons
- A **mini-icon tray** appears below when a filter is active, so you can drag-drop pre-filtered heroes onto teams faster

### 11.4 Roster grid
The full filtered hero list rendered as draggable cards. Card portrait, name, build count.

**Correction:** _(your note here)_

---

## 12. Match Results Summary Page

**Section:** `#page-calc-summary`

**Purpose:** Per-hero summary cards after `runCalculation()` completes. Each card shows that hero's top builds against the lobby with build scores.

### Header
- **← Setup** — back to the roster picker
- **Auto-Regenerate** — `autoRegenPromote()` — finds each hero's highest-`.total` build, writes that idx into `MATCH.selectedBuilds`, re-runs `computeResults()`. One-click "use the top builds and re-score."
- **Re-generate** — toggles a panel with per-hero dropdowns for manual override before re-running

### Regen panel (`#regen-panel`)
Two columns: **Ally Builds** / **Enemy Builds**. Each row is a hero name + a dropdown of their builds. Changing the dropdown sets `MATCH.selectedBuilds[name]` immediately. "Re-run Calculation" button triggers a fresh `computeResults()` without going back to setup.

**Purpose:** Lets you say "what if Grey Talon plays Spirit instead of Gun, how do the matchups change?" without changing his default.

**Reasoning:** Build selection has two flavors: a starting value (set by hero config's Default Build) and a per-match override (set here). The dropdown is the per-match override.

**Correction:** _(your note here)_

### Summary tag panel (top of grid)
**Purpose:** Aggregate "what tags this match is about" panel — shows top tags that the ally team benefits from + top tags the enemy team is weak to. Helps you read the matchup at a glance before drilling into individual heroes.

**Correction:** _(your note here)_

### Hero summary card (`app.js: makeSummaryCard()`)
Per hero in the calc. Layout:
- Portrait + name + side (ALLY/ENEMY badge)
- Each build listed with its `.total` score, broken into `ally` + `enemy` components
- Click a build → opens the Calc Build Detail page

**Correction:** _(your note here)_

---

## 13. Calc Hero Detail Page

**Section:** `#page-calc-hero` (`app.js: openCalcHero()`)

**Purpose:** Click a hero card on the summary page → this opens a per-hero detail view listing all their builds with full scoring breakdowns (ally contributions, enemy contributions, vs-breakdown by individual enemy).

**Reasoning:** Lets you understand WHY a build scored what it did — which ally synergies and enemy counters contributed how much.

**Correction:** _(your note here)_

---

## 14. Calc Build Detail Page

**Section:** `#page-calc-build`

**Purpose:** The deep-dive view for a single build of a single hero. Shows:
- Build name + description
- Score breakdown (ally contributions, enemy contributions, vsBreakdown per enemy)
- Items table — every item sorted by `.total`, with attribution columns (ally / self / enemy / total)
- Assist Items + Counter Items (top 3 of each)
- The **Build Path Guide** panel (see next section)

**Correction:** _(your note here)_

---

## 15. Build Path Guide Panel

This is the bottom panel of Calc Build Detail. It's where most of the recent work has gone.

### 15.1 Title bar
- **Build Path Guide** label
- **Debug Build** — runs `computeBuildPath()` with `_bpDbg` capture for THIS build only, formats with `formatBpDebug()`, copies to clipboard. Earlier version dumped all heroes; now build-specific.
- **Show Step-by-Step ▾** — toggles the detail panel

### 15.2 Summary row (`bp-summary-row`)
End-of-Late inventory rendered as chips. Each chip layout (top → bottom):
- **[Symbol slot]** — fixed `min-height: 18px` so chips align even when empty. Shows the role symbol from the [universal label system](#20-universal-label-system) only for spike / required / recommended labels.
- **[Item image]**
- **[Item name]**

**Reasoning:** Symbol-above-image-above-name layout (vs the old "overlay corner badge") came from the "don't busy up the image" feedback. Reserving the symbol slot height keeps the row visually flat.

**Correction:** _(your note here)_

### 15.3 Sim row (`bp-sim-row`)
Two buttons when `MATCH.simEnabled !== false`:
- **▶ Simulate this build** — opens the tick-based simulator. Label changes to "▶ Resume Simulation" if there's a saved tick-mode session.
- **▶ Live Match** — opens the budget-based simulator. Label changes to "▶ Resume Live Match" if there's a saved live-mode session.

**Reasoning:** Two parallel "what if" modes — simulator is for theoretical pacing tests; Live Match is for active-game decision-making.

**Correction:** _(your note here)_

### 15.4 Detail / step-by-step (`bp-detail`, hidden by default)
Per-phase blocks (Lane / Early / Mid / Late / Extra Late). Each phase has a left column with main-path changes and a right column with assist/counter changes.

A main-path row's columns: **action badge** (`+`/`↑`/`−`) → **item image** → **item name** → **Priority** column (the label symbol) → **cost**.

Row backgrounds tint for the top 3 label tiers:
- `bp-row-hl-spike` — orange gradient + 3px left border (loudest)
- `bp-row-hl-required` — gold gradient + 2px left border
- `bp-row-hl-recommended` — faint blue + 1px left border

**Purpose:** "Priority" column shows the symbol for EVERY label kind (including dimmer / smaller component variants). Row tint is reserved for the three top-tier categories so the eye snaps to them.

**Correction:** _(your note here)_

### 15.5 Upgrade hint
When an action is `upgrade`, a `bp-upgrade-from` line below the row reads `from: T1A, T2B` listing which owned components were consumed.

**Correction:** _(your note here)_

### 15.6 Close-alt panel
When `c.runnerUp` exists and hasn't already been bought, a small `bp-alt-panel` appears with "Close alt: <item>" — showing the second-best pick the algo considered. The row gets a `⇌` cursor hint.

**Purpose:** Helps you see which decisions were close calls vs runaway picks.

**Correction:** _(your note here)_

---

## 16. Simulator Page

**Section:** `#page-sim` (`app.js: openSimulation()`, `renderSim()`)

**Purpose:** Tick-based playthrough — you "play" the game by clicking through 35 simulated ticks. Each tick you receive simulated income; the app recommends 3 items (one per column) and you pick / skip / sell / unlock-slot.

### 16.1 Header bar
- **← Build** — back to Calc Build Detail
- Title: `<Hero> — <Build>  ·  Simulation` (or `Live Match` in live mode)
- Subtitle: `N allies vs N enemies · <algo> · <formula>`
- **Focus…** — opens modal to mark "focused" allies/enemies (weighted 2× in scoring)
- **⛶ Fullscreen** — toggles fullscreen layout
- **Blocked** — manage the blocked-items list
- **Save Log** — POSTs current state to `/api/sim-logs` (outcome / feel selectors first)
- **Reset** — clear state and restart

### 16.2 Stats row
- **Souls** — current remaining souls
- **Earned** — cumulative income received
- **Tick** — current tick / max
- **Phase** — Lane / Early / Mid / Late / Extra Late
- **Slots** — owned items / current slot cap
- **+ Slot Unlocked!** — spend an unlocker to raise the cap (9 → 10 → 11 → 12)

### 16.3 Sim controls
- **◀ Back** — pop history, rewind one tick
- **Skip** — confirm "no buy this tick"; label flips to **Wait ⏸** when the algo thinks waiting beats every affordable pick (i.e. the top score is below 70% of the average affordable score)
- **Confirm ▶** — apply the pending choice + advance tick
- **Override…** — manually pick an item not in the 3 recommendation columns
- **Sell Item…** — appears only when at slot cap

### 16.4 Body — left aside
- **Lobby** — team comp display (focus stars on focused heroes)
- **Inventory** — items owned so far + slot cap
- **Timeline** — chronological history of buys/sells/skips

### 16.5 Body — three recommendation columns
- **Balance** — fill the build's shape (multi-objective: contribute to under-represented tags)
- **Strength** — push raw score (top item by self*ally - enemy)
- **Counter / Survive / Assist** — react to the lobby (top items by ally counter / max-hp / resists)

Each column shows up to 3 affordable cards plus 1 "soon" (next tick reachable) and 1 "later" (horizon).

### 16.6 Sim card (`app.js: makeSimCard()`)
- Item image + name + cost + tier
- **Flag stack** (inline, inside the card body, not over the image) — shows the universal label glyph (single highest-priority label that applies). See [§20 Labels](#20-universal-label-system).
- **Attribution icons** — mini portrait of allies the item helps + enemies it counters
- **next** / **horizon** badge if not currently affordable
- **Recommended** word badge (blue) on the algo's top affordable pick across all three columns
- **Block** button — adds the item to `state.blocked` so it won't be recommended again

**Visual priority on the card itself:**
- **Spike anchor** → hard orange outline
- **Required** → hard gold outline
- **Signature** → small mint halo glow
- **Anti / Recommended / components** → glyph only, no card-level treatment
- **Most-recommended** (algo top pick) → blue halo

**Correction:** _(your note here)_

---

## 17. Live Match Mode

**Purpose:** Same UI as the Simulator but the user types their CURRENT souls instead of advancing ticks. Used during an actual game — "I have X souls right now, what should I buy?"

### Differences from tick mode (`app.js: openSimulation(..., 'live')`)
- `state.mode = 'live'`
- The **Souls** stat cell becomes an editable `<input type="number">` plus three quick-adjust buttons: **−800** / **+800** / **+3200** (small/positive/big)
- `simLiveTotalEarned(state)` derives `totalEarned = remaining + net-spent` so phase advances when souls cross thresholds (sells refund and reduce net-spent, keeping totalEarned stable across a buy→sell→buy)
- `simInferTickFromSouls(totalEarned)` picks the closest tick by cumulative income → drives the **Phase** pill display ("~12/35", phase = Mid)
- `simAdvanceTick()` is skipped on Confirm and Back — user drives time, not the sim
- **Skip** button is hidden (no ticks to skip)
- "Match complete" terminal block never fires (no end of run)
- Fresh live sessions seed `totalEarned = simSuggestedLiveStart()` (tick-7-equivalent souls, roughly mid-Early) so recommendations are sensible before the user types anything

**Reasoning:** Algorithms still recommend per-budget (the same three columns apply). What changes is the input: instead of "tick advanced → income granted → recommend" it's "user typed souls → recommend." All the column scoring functions read `state.remaining` and don't care how souls got there.

### Mode-switch reset
If the user opens a hero/build that already has a sim state in the OTHER mode (tick → live or vice versa), the state resets to a fresh `simNewState(newMode)`. Each (hero, build, mode) gets its own conceptual slot.

**Correction:** _(your note here)_

---

## 18. QA Pages

### 18.1 QA Scenario List (`#page-qa`)
Shows saved scenarios + saved reports + the Sim Log Comparison harness.

- **+ New Scenario** → opens the Scenario Editor
- Each scenario card shows name, allies, enemies, algorithms — clicking it runs the scenario
- Reports section lists saved reports for previously-run scenarios

**Purpose:** Keep a bank of "test cases" — known matchups you want to verify don't regress when you tweak weights or algorithms.

**Correction:** _(your note here)_

### 18.2 QA Scenario Editor (`#page-qa-edit`)
Left column: name, score formula, algorithm checkboxes (which to run against), roster picker, optional hero notes (per-hero text comments).

Right column: hero filter + side toggle (Add as Ally / Add as Enemy) + hero grid.

**Correction:** _(your note here)_

### 18.3 QA Run Results (`#page-qa-run`)
Per-algorithm tab. Shows the calc results from running each selected algo against the scenario. **Save Report** writes to `/api/qa/reports`.

### 18.4 QA Report Viewer (`#page-qa-report`)
Read-only view of a saved report (immutable snapshot of what each algo produced at the time you saved).

**Correction:** _(your note here)_

---

## 19. Sim Log Comparison Harness

**Section:** At the bottom of `#page-qa`.

**Purpose:** For each saved sim log (a real playthrough you recorded), runs EVERY build-path algorithm on the same hero/team comp/build, then scores how closely each algo's output matches what you actually bought.

### Bucket scoring
Each sim log is bucketed by `(outcome, feel)` where outcome = win/loss and feel = good/neutral/bad. Buckets get weights:
- `win:good` = +5  (golden cases — the build worked AND you liked playing it)
- `loss:good` = +4
- `win:neutral` = +3
- `loss:neutral` = +2
- `win:bad` = +1
- `loss:bad` = −2  (lessons — both lost AND felt bad; algo should NOT mimic these)

### Similarity metrics (`app.js: slcSimulateAlgoTicks()`, `slcBucketSim()`, `slcTickActionMatch()`)
- **Inventory similarity** (default weight) — Jaccard between final inventories (player vs algo)
- **Per-souls-bucket similarity** — slice purchases into souls-budget buckets; compare per-bucket
- **Per-tick action match** — at the same tick, did both the player and the algo buy the same item?

### Output
Markdown-ish report per algo with affinity ranking + per-bucket breakdown. Snapshots can be saved to `data/sim_log_baselines/` for regression comparison.

**Reasoning:** This is the canary for algo changes — if you tweak Surge's anchor scoring and your win:good affinity tanks, you know you broke something good.

**Correction:** _(your note here)_

---

## 20. Universal Label System

Built late in the project to unify how items get tagged across summary chips, step view, and sim cards.

### 20.1 Priority order (loudest → quietest)
1. **spike** — `↗` orange — Surge power-spike anchor (top self-axis pick at T3/T4)
2. **spike-component** — `↗` orange dim — component of a spike item
3. **required** — `★` gold — user-flagged required item
4. **required-component** — `★` gold dim — component of a required item
5. **anti (anti-spike)** — `⤯` purple — Surge counter anchor (top enemy-axis pick at T3/T4)
6. **anti-component** — `⤯` purple dim
7. **signature** — `✓` mint — user-flagged signature item (lower priority than required)
8. **signature-component** — `✓` mint dim
9. **recommended** — `☾` blue — top-self item per tier (excluding required/signature)
10. **recommended-component** — `☾` blue dim

### 20.2 Where it lives
- `app.js: BP_LABEL_META` — single metadata table (text, title, klass, `summary` flag)
- `app.js: computeBuildLabels(b, pathData)` — returns `{ labelFor, sets }`
- `app.js: computeSurgeAnchors(b, sets)` — universal anchor computation (runs for every algorithm, not just Surge)

### 20.3 Where it's used
- **Summary chips** — only `summary: true` labels show (spike, required, recommended). Symbol sits above the image; slot is reserved-height so chips align.
- **Step view** — Priority column shows the symbol for ALL labels. Component variants are smaller and dimmer.
- **Step view row highlight** — only spike / required / recommended tint the row background.
- **Simulator cards** — single highest-priority glyph in the flag stack. Spike + required get hard outlines; signature gets a soft halo glow; rest are glyph-only.

### 20.4 New "recommended" definition
**Old:** top-4 self-score per tier (so 4 × 4 tiers = 16 items)
**New:** top-1 self-score per tier excluding required + signature (so 4 items max — one per tier)

**Reasoning:** Old definition flooded the summary chip row with rec moons. New definition keeps recommended rare so it actually means something.

**Correction:** _(your note here)_

### 20.5 Spike anchors are universal now
`computeSurgeAnchors()` runs for every algorithm — not just Surge — and the result is attached to `pathData.surgeAnchors`. So Architect, Inverse, etc. all show spike/anti markers in the build path.

**Reasoning:** The "what's the power spike of this build" concept is useful regardless of which algorithm produced the path. Used to be Surge-only because Surge actually USED the anchors during execution; now the anchors are also just decoration on other algos' outputs.

**Correction:** _(your note here)_

---

## 21. Scoring Formulas (V1 / V2 / V3)

Selected via `Score Formula` dropdown on the calc setup screen. Stored in `MATCH.scoreFormula`.

### V1 — Classic
`total = ally × multBuildAlly + enemy × multBuildEnemy`

Just the ally synergy and the enemy counter score. No symmetric "what do allies/enemies think of MY build" terms.

**Reasoning:** Original formula. Treats the build as a one-way thing — what value does it provide to me + counter to enemies.

### V2 — Symmetric
`total = ally × multBuildAlly + allyScoreSelf × multAllyBuild + enemy × multBuildEnemy + enemyScoreSelf × multEnemyBuild`

Adds two reverse-direction terms: how much do MY items help allies (`allyScoreSelf`), how much do enemies REACT to my build (`enemyScoreSelf`).

**Reasoning:** Build synergy is bidirectional. If you build for fire rate, that helps your ally with anti-heal items; conversely if you build squishy, enemies pivot toward burst items.

### V3 — Target Focus (default)
Same shape as V2 but enemy/ally axis weighting tilts toward `v3Targets` — specific heroes flagged as "the ones to beat" in this matchup. Used the worst-matchup enemy(ies) as targets so scoring rewards builds that specifically beat THEM rather than the average enemy.

**Reasoning:** Average-team scoring rewards generalist builds. V3 says "win the worst matchup specifically" because that's typically what loses you the game.

**Correction:** _(your note here)_

### Multipliers
- `mult-build-ally` (default 1.5) — build-level ally synergy weight
- `mult-build-enemy` (default 1.5) — build-level enemy-counter weight
- `mult-item-ally` (default 1.5) — per-item ally weight
- `mult-item-enemy` (default 1.5) — per-item enemy weight
- `mult-ally-build` (default 0.75, V2/V3 only) — how much allies benefit from my build (reverse)
- `mult-enemy-build` (default 0.75, V2/V3 only) — how much enemies react to my build (reverse)

**Correction:** _(your note here)_

---

## 22. Build-Path Algorithms

The dropdown lives in the calc setup row 2. Stored in `MATCH.bpAlgo`. All dispatch through `app.js: computeBuildPath(b, algo)`.

Below, each algo gets purpose / reasoning / status. **Active** = surfaced in the dropdown today. **Disabled** = code still exists for backward compat but should not be used.

### 22.1 `greedy-phase` — Greedy (Phase)
**Status:** Disabled in practice (still in dropdown).
**Algo:** Per phase, fills slots with the highest-`.total` affordable items respecting `phase.minSlots` / `phase.maxSlots` / `phase.maxSells`. Wrapped by `applyConstraintsFixup()` to force required-item inclusion.
**Code:** `app.js: greedyMain()` + `bpScore()`
**Purpose:** The baseline. Every other algo started life as a tweak to this one.
**Reasoning:** Simple and fast, but greedy on raw total → produces T4-slam builds (8+ T4s vs player baseline 4) and burns sells.
**Correction:** _(your note here)_

### 22.2 `marginal` — Marginal Value
**Status:** Active in dropdown.
**Algo:** `marginalScoreFn` — instead of raw total, scores each candidate's marginal contribution given items already owned. Uses cosine-style normalization to penalize tag overlap.
**Code:** `app.js: marginalScoreFn()`
**Purpose:** Avoids loading up on the same tag twice — diminishing returns on each additional contributor.
**Correction:** _(your note here)_

### 22.3 `cosine` / `cosine-match` — Cosine Deficit / Match
**Status:** Active.
**Algo:** `cosineScoreFn` — items that move the build vector toward a "guide" vector (blend of self_weight + ally synergies + enemy counters) get scored higher. Cosine-match is a variant that uses cosine to the team-fight vector.
**Code:** `app.js: cosineScoreFn()`
**Purpose:** Geometry-based — the build should LOOK like a certain shape (in tag space); pick items that move it that way fastest.
**Correction:** _(your note here)_

### 22.4 `beam` — Beam Search
**Status:** Active in dropdown.
**Algo:** Keeps top-K (~3) candidate inventories at each step, expands each, prunes to top-K again. Higher quality than greedy but expensive.
**Code:** `app.js: runBeamSearch()`
**Correction:** _(your note here)_

### 22.5 `expert` — Expert Greedy
**Status:** Disabled (still in dropdown).
**Algo:** Hand-tuned heuristics layered on top of greedy. Has special-case logic for "always upgrade existing chains before starting new ones," etc.
**Code:** `app.js: runExpertGreedy()`
**Correction:** _(your note here)_

### 22.6 `strengths` — Play to Strengths
**Status:** Disabled (still in dropdown).
**Algo:** Picks items that maximize the build's existing strongest-tag axis. Mono-axis bias.
**Code:** `app.js: runPlayToStrengths()` (currently unused; lint warning hint)
**Correction:** _(your note here)_

### 22.7 `adaptive` / `fusion` / `oracle` — Hybrid Rotations
**Status:** Disabled in dropdown (`adaptive` was the previous default before Architect).
**Algo:** Rotates between cosine / marginal / lookahead scoring per phase based on heuristics. Fusion picks the best move across all scorers. Oracle is a knowledge-distilled variant.
**Code:** `app.js: runHybridRotation(variant)`
**Correction:** _(your note here)_

### 22.8 `cyclic` — Cyclic Focus
**Status:** Disabled (still in dropdown).
**Algo:** Cycles through focus tags each phase — Lane focuses on early-game tags, Late on late-scaling, etc.
**Correction:** _(your note here)_

### 22.9 `lookahead` (in the dropdown? — not listed; live as a scorer)
**Status:** Disabled at top of `BP_ALGO_OPTIONS` per earlier conversation; scorer still used as `lookaheadScoreFn`.
**Algo:** Scores candidates by estimating future-tick budget vs target item costs.
**Code:** `app.js: lookaheadScoreFn()`
**Correction:** _(your note here)_

### 22.10 `assassin` — Target Assassin
**Status:** Disabled per earlier conversation.
**Algo:** Picks items that specifically counter the single worst-matchup enemy. Tunnel-vision on one target.
**Code:** `app.js: runTargetAssassin()`
**Correction:** _(your note here)_

### 22.11 `architect` — Architect (Path Planner) — **DEFAULT**
**Status:** Active, default.
**Algo:** Two-stage:
1. **Architecting** — priority-orders all items (required → signature → rest by `.total`), takes the top-2× slot count, walks their upgrade chains to build a `componentOf` map.
2. **Tick execution** — per tick, scores affordable candidates by `priorityScore(it) = it.total × role-boost × (1.2 if needed-by-something × 1.15 if upgrades-owned-component)`. Souls brackets gate which tier can fire: T1 if souls < 1600, T2/upg if 1600-3200, save mode 3200-6400 (only upgrades unless escape valve fires at 5500), T4 mode 6400+.
**Code:** `app.js: runArchitect()`
**Purpose:** Plans toward a target endgame inventory and uses souls brackets to avoid the greedy-family pathology of T4-slamming or sell-spamming.
**Reasoning:** Topped the affinity ranking in the 2026-05-13 baseline (36.94 vs ~33 for the field).
**Correction:** _(your note here)_

### 22.12 `inverse` — Inverse (Endgame Solver)
**Status:** Active.
**Algo:** Backward induction:
1. **Endgame solver** — greedy-fill the 12-slot endgame inventory: required → signature → top score+pair-synergy until full.
2. **Chain resolver** — for each endgame item, walk to the cheapest-`.total` ancestor chain. Builds an ordered `chainPlan` of items to acquire.
3. **Scheduler** — per tick, fire any unowned chainPlan item that's affordable. Escape valve allows off-plan picks after 3+ idle ticks if souls are ballooning.
**Code:** `app.js: runInverse()`
**Purpose:** Computer-style insight: the DESTINATION drives the path, not the local step value. T1 components can land in Lane purely because they're 4-hop precursors to a Late T4 anchor.
**Correction:** _(your note here)_

### 22.13 `surge` — Surge (Power Spike)
**Status:** Active. Latest iteration.
**Algo:** Two phases:
1. **Anchor planning** — picks 4 items:
    - **firstSpike** — top self-axis among T3+T4, T3-biased (×1.15). HARD priority: required → signature → normal (if any required item exists in the T3+T4 pool, ONLY consider required; else only signature; else normal).
    - **secondSpike** — top self-axis T4-only (the "huge one"), T4-biased.
    - **firstAntiSpike** — top enemy-axis T3+T4, T3-biased. Required/signature get a TINY 1.05× tie-breaker.
    - **secondAntiSpike** — top enemy-axis T3+T4, T4-biased.
    - Spike scoring axis = top-4 hero self_weight tags; Anti scoring axis = top-4 enemy-counter tags (derived from `Σ item.values[t] × item.enemy`).
2. **Execution** — Architect-style souls brackets + priorityScore × roleBoost × chainBonus, plus an **anchor-window boost (×5.0)** when an anchor is buyable IN its tick window (spike1 = ticks 10-14, spike2 = ticks 17-21).
**Code:** `app.js: runSurge()`
**Purpose:** Plan TWO power spikes that land in their objective windows (guardian/walker fights for spike1, midboss/siege for spike2), plus two anti-spikes that punish the enemy team's strongest tag axis.
**Reasoning:** Pro Deadlock theory says timing matters more than soul efficiency. A T3 spike that lands at the right walker fight beats a slightly bigger T4 that arrives late.

**Algorithm-continues-into-Extra-Late:** When `owned.size >= phaseCap`, Surge now allows upgrade-only buys (mode `cap-upg`) — upgrades consume an owned ancestor so net slot count = 0. Keeps the build deepening through Extra Late instead of freezing at slot cap.

**Assist/counter columns:** After the main loop, Surge calls `greedyAssist()` per phase for both ally and enemy axes — same pattern Architect uses.

**Correction:** _(your note here)_

### 22.14 Algorithm constants reference
- `BUILD_PHASES` — name, addBudget, totalSlots, minSlots, maxSells per phase (Lane → Extra Late)
- `PHASE_TIER_MULTS` — per-phase tier preference multipliers `[T1, T2, T3, T4]`. Late = `[0, 0.2, 1.1, 1.55]`, Extra Late = `[0, 0, 0.55, 2.05]`.
- `COUNTER_TAG_THRESH` — `0.2` (lowered from 0.3 on 2026-05-13 because at 0.3 no item ever tripped it)
- `SIM_TICK_INCOME` — 35-element income curve growing 800→4300
- `SIM_TICK_PHASE` — maps each tick index to a phase name

**Correction:** _(your note here)_

---

## 23. Modals & Misc UI

### 23.1 `#modal-tag` — Add / Edit Tag
Code + display name + description. Used by Tags page.

### 23.2 `#modal-build` — Add Build
Build name + code name + description. Optional "Copy from preset hero" with hero + source-build selectors.

### 23.3 `#modal-new-hero` — New Hero
English name + normalized key.

### 23.4 `#toast` — bottom-right notification
`toast(msg, type?)` helper. `type` can be `'error'` for red styling. Auto-dismisses after a few seconds.

**Correction:** _(your note here)_

---

## 24. Backend (`app.py`)

Flask app, single file. Bootstraps `data/heroes/`, `data/items/`, `data/qa/`, `data/qa/reports/` on first run. Reads/writes JSON files; no database.

### 24.1 Endpoints

**Static image proxy**
- `GET /src/<filepath>` — serves images from `../resources/...` so hero portraits and item icons load from the original source tree

**Tags**
- `GET    /api/tags` — full tag list
- `POST   /api/tags` — create one
- `PUT    /api/tags/<code>` — update name/description
- `PUT    /api/tags` — reorder (replace entire array)
- `DELETE /api/tags/<code>` — delete

**Heroes**
- `GET  /api/heroes` — summary list (no tag vectors). Presets first, regular heroes in canonical `HERO_KEYS` order, then any other custom heroes alphabetically.
- `GET  /api/heroes/<name>` — full hero JSON
- `PUT  /api/heroes/<name>` — overwrite the file with the JSON body
- `POST /api/heroes` — create a new hero with a blank General build

**Items**
- `GET /api/items` — summary list (no tag vectors) sorted by `index.json` order
- `GET /api/items/<name>` — full item JSON
- `PUT /api/items/<name>` — save
- `GET /api/items/all` — full item array (every item's full JSON; what the calculator uses)

**QA**
- `GET    /api/qa/scenarios`
- `POST   /api/qa/scenarios`
- `PUT    /api/qa/scenarios/<id>`
- `DELETE /api/qa/scenarios/<id>`
- `GET    /api/qa/reports`
- `POST   /api/qa/reports`
- `GET    /api/qa/reports/<rid>`
- `DELETE /api/qa/reports/<rid>`

**Sim Logs**
- `POST /api/sim-logs` — write a new log; filename is `<timestamp>_<hero>.json`
- `GET  /api/sim-logs` — list summaries (id, hero, build, outcome, feel, ts)
- `GET  /api/sim-logs/<log_id>` — single log content (with path sanitization)

**Index**
- `GET / ` — renders `templates/index.html`

### 24.2 Bootstrap
On import, `bootstrap()` creates the data directories and seeds them: writes `DEFAULT_TAGS` if `tags.json` doesn't exist, and creates blank hero JSONs for everything in `HERO_KEYS` if their files don't exist (sourcing portraits + wiki URLs from `../resources/heroes/<key>/manifest_<key>.json`).

**Reasoning:** Lets you clone the repo and run `python app.py` with no manual setup.

**Correction:** _(your note here)_

---

## 25. Data Files

### 25.1 `data/tags.json`
Array of `{ code, name, description }`. ~40-50 entries. Adding a tag requires backfilling every hero/item file because each one stores a value-or-null for every tag.

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
  "default_build_name": "grey_talon_gun",     // NEW — sets the starting selectedBuilds
  "builds": [
    {
      "name": "General",
      "normalized_build_name": "grey_talon_general",
      "build_description_eng": "...",
      "follow_build_name": null,              // for inheritance
      "confidence": { "rel": "=", "val": 0 }, // ±0.5 manual nudge
      "disabled": false,
      "signature_items": [...],
      "required_items":  [...],
      "blacklist_items": [...],
      "counter_phase_slots": [[0,1],[0,2],[1,2],[2,3],[2,4]],
      "values": {
        "ally_weight":  { tag_code: number_or_null, ... },
        "self_weight":  { tag_code: number_or_null, ... },
        "enemy_weight": { tag_code: number_or_null, ... },
        "self_score":   { tag_code: number_or_null, ... }
      }
    },
    /* ...more builds */
  ]
}
```

**Reasoning:** Builds[0] is conventionally "General" and acts as the inheritance root + historical default. `default_build_name` is the new way to declare which build acts as this hero's vector source when other heroes score against them.

**Correction:** _(your note here)_

### 25.3 `data/items/<key>.json`
```jsonc
{
  "name": "Frenzy",
  "normalized_name": "frenzy",
  "category": "Weapon",
  "tier": 3200,                          // 800/1600/3200/6400 (or 9999 for placeholders)
  "wiki_url": "...",
  "image_path": "...",
  "remarks": "...",
  "confidence": 0,                       // ±0.5
  "upgrades_from": ["headhunter", "...""],
  "compare_to": ["headhunter"],
  "values": {
    "self_score": { tag_code: number_or_null, ... }
  }
}
```

**Correction:** _(your note here)_

### 25.4 `data/qa/scenarios.json`
Single array of saved QA scenarios. Each has `{ id, name, created_at, allies, enemies, scoreFormula, algos, heroNotes }`.

### 25.5 `data/qa/reports/<uuid>.json`
One file per saved report. Immutable snapshot of a scenario run (results per algo).

### 25.6 `data/sim_logs/<ts>_<hero>.json`
Per-run sim/live log. Captures the full state machine of one playthrough — ticks, owned items, history of actions, outcome (win/loss), feel (good/neutral/bad).

**Reasoning:** These are the training data for the sim log comparison harness. Each `(outcome, feel)` bucket weights differently — golden cases (win:good) are the patterns you want algos to mimic; loss:bad is what to avoid.

**Correction:** _(your note here)_

### 25.7 `data/sim_log_baselines/<date>_baseline.md`
Frozen affinity ranking snapshots used as regression checkpoints when tuning algorithms. Generated manually after a sim-log comparison run that you want to lock in.

**Correction:** _(your note here)_

---

---

## 26. Visual Design — Theme, Colors, Fonts, Icons

This section maps every design decision: what each color stands for, what symbol means what, what font goes where, and the rules behind interaction visuals (hover / active / dirty / glow / pulse).

### 26.1 Theme posture

**Choice:** Dark, flat, painterly — not glass / glossy / Material.

**Reasoning:** The app is a companion to Deadlock, which itself uses a stenciled, occult, lived-in dark theme. Glass / neon would clash with that aesthetic. Flat solids + matte surfaces let the bright accents (gold staples, blue moons, orange spikes) read against the dark surfaces without competing with gloss reflections.

**Correction:** _(your note here)_

### 26.2 Surface hierarchy

CSS variables declared in `style.css: :root`:

| Variable      | Hex       | Where it shows up                            |
|---------------|-----------|----------------------------------------------|
| `--bg`        | `#121412` | Page backdrop, deep matte black-olive        |
| `--bg-elev`   | `#181a18` | Subtle lift (inputs, slot-cap row)           |
| `--surface`   | `#121412` | Page-panel background — matches bg deliberately so panels read as part of the surface, not floating |
| `--surface-lt`| `#1c1f1c` | Hover state for surfaces                     |
| `--surface-dk`| `#0c0d0c` | Deeper recessed areas                        |
| `--panel`     | `#1a1d1a` | Inner panels, sidebar zones — slight lift    |
| `--card`      | `#1c1f1c` | CONTENT layer — cards / inputs / switches    |
| `--card-warm` | `#1f221d` | Slightly warmer variant for spotlighted cards |
| `--border`    | `#2e3230` | Default border — readable on dark            |
| `--border-soft`| `#232624` | Quieter divider                              |
| `--border-dark`| `#0a0c0a` | Deep pencil-line edge (insets)               |
| `--border-warm`| `#2f3530` | Warm-tinted border for warm panels           |

**Reasoning:** Three-tier surface stack (bg → panel → card) gives depth without shadows. Borders are mostly horizontal-style separators; soft variants are used between rows in a list, hard ones around discrete cards. The decision to make `--surface == --bg` came from an earlier iteration that had a tan panel color — got removed because it competed with the gold accents.

**Correction:** _(your note here)_

### 26.3 Primary accent — Deadlock Green

| Variable       | Hex       | Where                                                            |
|----------------|-----------|------------------------------------------------------------------|
| `--accent`     | `#75e8a2` | Solid-color contexts — buttons, dropdown highlights              |
| `--accent-top` | `#5ad894` | Gradient top — active button background                          |
| `--accent-bot` | `#90f8b1` | Gradient bottom                                                  |
| `--accent-dk`  | `#3da970` | Active button border                                             |
| `--accent-lt`  | `#b5f5cc` | Subtle text highlights                                           |

**Choice:** Primary buttons use a top→bottom green gradient (`--accent-top` → `--accent-bot`) with a darker green border (`--accent-dk`). Hovers brighten / extend the gradient.

**Reasoning:** Only the primary action of a screen uses this. Helps the eye find the right button immediately. Mint green also reads as "go" / "confirm" without being aggressive.

**Correction:** _(your note here)_

### 26.4 Text colors

| Variable   | Hex       | Where                                              |
|------------|-----------|----------------------------------------------------|
| `--text`   | `#e4d7c1` | Primary text — light tan, lived-in parchment feel  |
| `--cream`  | `#efe2cc` | Slightly lighter; used on hover-elevated text      |
| `--muted`  | `#7c7468` | Secondary text — labels, hints                     |
| `--muted-dim`| `#555049` | Very-faded text — empty states, deemphasized info |

**Choice:** Light tan, not pure white.

**Reasoning:** White text on a dark teal-green background reads as cold / sterile. Tan ties into Deadlock's brass/sepia palette and feels handwritten / parchment-like.

**Correction:** _(your note here)_

### 26.5 Semantic accents

| Variable     | Hex       | Stands for                                                  |
|--------------|-----------|-------------------------------------------------------------|
| `--good` / `--success` | `#53c055` | Wins, positives, buy-action badges                  |
| `--success-bg` | `rgba(83, 192, 85, .15)` | Buy-action badge background tint               |
| `--danger`   | `#b9463e` | Losses, sells, the "−800" Live Match adjust button         |
| `--danger-bg` | `rgba(185, 70, 62, .15)` | Sell-action badge background tint              |
| `--vitality` | `#a5c941` | Lime-yellow — Vitality items, healing                       |
| `--spirit`   | `#b26ed7` | Spirit Purple/Pink — magic, assists                         |
| `--spirit-lt`| `#d29ce8` | Lighter spirit highlight                                    |
| `--weapon` / `--warm` | `#deb11b` | Gun Orange — saffron, weapon items                |
| `--warm-dk`  | `#a88212` | Darker gun orange — hover/active states                     |
| `--warm-lt`  | `#f0c84a` | Lighter gun orange                                          |
| `--gold`     | `#f5c84a` | Gold Highlight — star markers, REQUIRED items, key callouts |
| `--gold-lt`  | `#ffe294` | Lighter gold (was used for recommended ☾; now back to blue) |
| `--gold-dk`  | `#b88a25` | Darker gold — active gold states                            |
| `--soul`     | `#93cdab` | Pale mint — in-game soul currency (matches Deadlock UI)     |
| `--info`     | `#62a7af` | Other Blue — secondary cool accent, RECOMMENDED items       |
| `--info-dk`  | `#3a7077` | Darker info — upgrade badges                                |

**Decisions per concept:**
- **Required (★)** uses `--gold` because gold reads as "valuable / mandatory" universally. Saturated, not muted.
- **Signature (✓)** uses `--accent` (mint) — sits in a different tonal family from Required so they don't visually fight. Quieter weight + size.
- **Recommended (☾)** uses `--info` (blue). Distinct from both gold tones so the eye reads "different category" at a glance.
- **Spike (↗)** uses pure orange `#ffb05a` (NOT a CSS variable — too specific). Highest visual priority — bigger glyph + glow.
- **Anti-spike (⤯)** uses pure purple `#c79bff`. Loud but quieter than spike.
- **Sell** uses `--danger` red — sells are destructive actions, red signals "you're losing something."
- **Buy** uses `--success` green — adds to your inventory.

**Reasoning:** Each label has a distinct family (gold / mint / blue / orange / purple) so the user doesn't have to memorize symbols — color alone tells the story. Components of each category use the same color but smaller + dimmed so they read as "same family, lower priority."

**Correction:** _(your note here)_

### 26.6 Tier colors

| Variable   | Hex       | Stands for                       |
|------------|-----------|----------------------------------|
| `--tier-1` | `#d4b07a` | T1 — cream-gold (800 souls)      |
| `--tier-2` | `#d97a1f` | T2 — amber (1600)                |
| `--tier-3` | `#c44b3c` | T3 — red-orange (3200)           |
| `--tier-4` | `#8a2828` | T4 — deep wine (6400)            |

**Source:** Borrowed from the Fairfax / Curiosity Catalog aesthetic — vintage map / catalog feel.

**Reasoning:** Tier colors progress toward darker / more saturated as tier rises, conveying "this is heavier" without reading as alarming (which a pure red would).

**Correction:** _(your note here)_

### 26.7 Shadows

| Variable        | Value                                                                |
|-----------------|----------------------------------------------------------------------|
| `--shadow-card` | `0 1px 0 rgba(255,255,255,.02) inset, 0 8px 24px rgba(0,0,0,.55)`    |
| `--shadow-soft` | `0 4px 14px rgba(0,0,0,.4)`                                          |

**Choice:** Cards use the dual shadow (top inset highlight + bottom drop) for subtle depth without floating-glass feel.

**Reasoning:** The inset top adds a tiny "lit-from-above" suggestion that helps cards read as physical objects on a dark surface, without crossing into Material-3 territory.

**Correction:** _(your note here)_

### 26.8 Typography

#### Font stack
```css
--font-display: 'IM Fell English', 'IM Fell English SC', Georgia, 'Times New Roman', serif;
--font-body:    'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
```

Loaded from Google Fonts in `index.html: <head>`:
- **IM Fell English** — regular + italic (`ital@0;1`)
- **IM Fell English SC** — small caps variant
- **Inter** — weights 400 / 500 / 600 / 700

#### Usage
- **Display font (IM Fell English):** Page titles (`<h1>` in page headers), sidebar logo, the DEADLOCK wordmark
- **Body font (Inter):** Everything else — labels, buttons, inputs, table contents, tooltips

**Reasoning:** IM Fell English is a literal 17th-century printer's typeface with intentional ink-bleed irregularities — it's the closest Google Fonts approximation of the stenciled, lived-in Deadlock wordmark. Using a weathered display serif for headers + a clean modern sans for body is the standard editorial pairing — distinguishes "title / brand" from "content / interaction."

#### Body font size
- Base: `14px` on `html, body`
- Stat values: `15-18px` depending on context
- Tooltips / hints: `11-12px`
- Small badges: `9-11px`
- Sidebar nav: 14px

**Correction:** _(your note here)_

### 26.9 Iconography (every symbol)

#### Sidebar nav icons (geometric glyphs)
| Icon | Page       | Reasoning                                                  |
|------|------------|------------------------------------------------------------|
| `❋`  | Heroes & sidebar logo | Six-pointed asterisk — the Deadlock motif       |
| `◈`  | Items      | Diamond — "tangible asset"                                  |
| `❋`  | Tags       | Same asterisk — tags are the fundamental dimension          |
| `⊞`  | Calculator | Grid — "comparing teams"                                    |
| `⌬`  | QA         | Benzene/cog hybrid — "lab testing"                          |

#### Universal label glyphs (see §20)
| Symbol | Label                | Color           | Treatment                                       |
|--------|----------------------|-----------------|-------------------------------------------------|
| `↗`    | Spike anchor         | `#ffb05a` orange| Largest glyph + text-shadow pulse (loudest)     |
| `↗` dim| Spike-component      | orange, .55 opacity | Smaller, no animation                       |
| `★`    | Required             | `--gold`        | Bold filled badge or large glyph                |
| `★` dim| Required-component   | `--gold`, .55 opacity | Smaller, no halo                          |
| `⤯`    | Anti-spike anchor    | `#c79bff` purple| Bold filled or large glyph, no pulse            |
| `⤯` dim| Anti-component       | purple, .55 opacity | Smaller                                     |
| `✓`    | Signature            | `--accent` mint | Smaller / dimmer — minimal attention            |
| `✓` dim| Signature-component  | mint, .5 opacity| Smallest                                        |
| `☾`    | Recommended          | `--info` blue   | Same priority as signature                      |
| `☾` dim| Recommended-component| blue, .55 opacity | Smallest                                      |

**Reasoning behind each glyph choice:**
- `↗` (arrow up-right) → upward momentum, "going up" — a power spike
- `★` → universal "important" / "favorite" mark
- `⤯` (down-right arrow with stroke) → "interrupt / suppress" — counters the enemy
- `✓` → "checked / confirmed" — user has marked this as wanted
- `☾` (crescent moon) → orbits the build — "naturally falls into orbit," the algo's preference

**Correction:** _(your note here)_

#### Build-path action badges
| Symbol | Action  | Color           |
|--------|---------|-----------------|
| `+`    | Buy     | `--success` green tint |
| `↑`    | Upgrade | `--info` blue tint |
| `−`    | Sell    | `--danger` red tint |

**Reasoning:** Action badges sit next to each row in the step view. Color-coded so a quick scroll reveals at-a-glance whether the algorithm is acquiring (green +), upgrading (blue ↑), or shedding (red −).

**Correction:** _(your note here)_

#### Sim/Live controls
- `▶` — Simulate / Confirm
- `◀ Back` — undo last decision
- `▶ Confirm` — apply pending choice
- `⏸ Wait` — skip-when-recommended (the algorithm thinks waiting beats every affordable buy)
- `⛶ Fullscreen` — toggle fullscreen
- `+ Slot Unlocked!` — spend a slot unlocker (raises slot cap 9 → 10 → 11 → 12)
- `← Back` — back-arrow on every page header

#### Misc utility glyphs
- `×` — close buttons, delete-chip buttons
- `⇌` — runner-up indicator on build-path rows ("close alternative")
- `⋮⋮` — drag handle on build tabs / reorderable rows
- `○` — neutral / cycle toggle (e.g. reverse-engineer item-status toggle: none → ★ → REQ)
- `〉`, `▼` — accordion / dropdown indicators

**Correction:** _(your note here)_

### 26.10 Buttons — variants and intent

| Class           | Look                                              | When to use                                              |
|-----------------|---------------------------------------------------|----------------------------------------------------------|
| `.btn-primary`  | Mint gradient bg + dark green border              | Single primary action per screen — Save, Calculate, Confirm |
| `.btn-secondary`| Cream outline, transparent bg                     | Adjacent-to-primary actions — Live Match next to Simulate |
| `.btn-ghost`    | Muted text, no bg, hover-reveals border           | Tertiary actions — Re-generate, Debug, Reset            |
| `.btn-danger`   | Red bg + red border                               | Destructive — Delete Build, Delete Report                |
| `.btn-warm`     | Gun-orange variant                                | Special-attention actions — Slot Unlock, Sell Item       |
| `.btn-back`     | Plain link-style arrow                            | Back-arrow on page headers                               |
| `.btn-sm` / `.btn-xs` | Size modifiers, stack with any variant      | Tighter contexts — toolbars, in-card buttons             |

**Reasoning:** A primary/secondary/ghost three-step hierarchy means the user always knows which button is THE button on a screen. Destructive operations are red — universal convention so accidents are minimized.

**Correction:** _(your note here)_

### 26.11 Interaction states

#### Hover
- **Cards:** lift via `transform: translateY(-1px)` + accent-color border
- **Buttons:** bg brightens / border accent-color
- **Chips:** border accent + cursor pointer
- **Nav buttons:** icon color shifts to `--accent`

#### Active / selected
- **Sidebar nav:** mint-gradient bg, dark border, dark text
- **Sim card selected:** white halo (`box-shadow: 0 0 0 2px #ffffff, 0 0 12px 3px rgba(255,255,255,.45)`) — overrides any other border treatment so "this is your pick" is unambiguous
- **Active page section:** `.active` class — only one `.page` visible at a time

#### Disabled
- Reduced opacity to ~0.5
- `cursor: not-allowed`
- Buttons get a grey-out shade

#### Dirty (unsaved edits)
- `.dirty-badge` appears in the header — small "Unsaved" pill, slight yellow/orange tint
- The Save button gets emphasis

#### Recommended (most-rec on sim card)
- Blue word badge "Recommended" — bottom-left of the card
- Blue halo around the card (`box-shadow: 0 0 10px 1px rgba(98, 167, 175, .45)`)
- The Skip button transforms to "Wait ⏸" (with mint pulse) when the algo thinks waiting beats every affordable pick

**Correction:** _(your note here)_

### 26.12 Animation principles

Sparing use — only categories where motion conveys "ongoing attention" or "live data":

- **Spike glyph pulse** (`@keyframes bp-spike-glyph-pulse`) — orange text-shadow breathes 4px → 10px over 1.8s. ONLY on spike anchors. Tells the eye "this is the loudest thing on the page."
- **Sim wait pulse** (`@keyframes sim-wait-pulse`) — mint halo on the Wait button when the algo recommends waiting. Tells the user "the algorithm's recommendation is the negative one."
- **Sim spike pulse** (`@keyframes sim-spike-pulse`) — formerly used on sim spike cards (now replaced with a static outline per recent feedback that animations were too busy)

**Choice:** No global "loading" spinners; toasts are slide-in. Buttons don't bounce, cards don't shimmer. Animation is reserved for FUNCTIONAL signaling, not decoration.

**Reasoning:** Dashboards with constant motion are tiring. Reserving animation for "this thing matters right now" lets the user's eye find what's important without scanning every pulse on the page.

**Correction:** _(your note here)_

### 26.13 Spacing & layout

#### Sidebar
- Fixed width: `--sidebar-w: 168px`
- Sticky to the viewport — never scrolls
- Logo at top, nav buttons stack below

#### Page layout
- Single column of content, max-width is screen
- Sticky page header (each `<section>` has its own `.page-header.sticky-header`) so the title + back button stay visible while scrolling long content (e.g. tag tables)
- Most "card grids" use CSS grid with auto-fit minmax for responsive density

#### Card / chip / table
- Cards: `border-radius: 3-6px` (small — no Material rounding). Padding `8-14px` depending on density.
- Chips: tight pill shape with right-side `×` close button. Used for hero filters, item search results, tag chips.
- Tables: zebra-striping via `tbody tr:nth-child(even)` for the tag table — helps the eye walk a long row.

#### Build-path summary chip
- Flex-column layout: badge slot (18px reserved) → image (32×32) → name
- Reserved badge height means rows align even when only some chips have labels

#### Sim card
- Flex-row: image (40×40) + body (name, cost, tier, flag-stack inline, attribution mini-icons)
- Flag stack is INSIDE the card body, not over the image — image stays clean

**Reasoning:** Tight, ledger-like density. The user is reading data, not browsing imagery. Padding is conservative so screens fit a lot of information without scrolling.

**Correction:** _(your note here)_

### 26.14 Toast notifications

Bottom-right floating notification (`#toast`). `toast(msg, type?)` helper:
- Default type — neutral, mint-tinted left border
- `'error'` — red left border + danger-bg tint

Auto-dismisses after ~2.5s. Single instance — newer toasts replace older ones.

**Reasoning:** Bottom-right is the standard location for non-blocking confirmations. Single-instance avoids stacking annoyance.

**Correction:** _(your note here)_

### 26.15 Decision log — visual changes that happened during development

This is a partial timeline of visual/design changes the user requested, with the reasoning behind each pivot:

1. **Original Required style:** red pulsing halo → conflicted with the red Sell action button → switched to gold star (no halo competition)
2. **Original Recommended:** mint glow → too similar to Signature (mint) → switched to light gold → user noted that conflicted with Required gold → switched to blue (`--info`)
3. **Symbol position on summary chips:** corner badge (over image) → caused image clutter → moved to its own slot above the name with reserved height for visual alignment
4. **Step view badge position:** before the name → moved to AFTER the name in a dedicated Priority column so the column lines up vertically
5. **Sim card border treatment:** previously every role (req/sig/req-comp/sig-comp) had a colored border → user said that was visually busy → now ONLY spike + required get hard outlines, signature gets a soft halo, everything else is glyph-only
6. **Spike/anti visibility:** initially only when Surge was the active algorithm → user requested they show everywhere as universal labels → anchors now compute for every algorithm and surface as labels regardless of which algo built the path
7. **Sim card flag stack location:** absolute top-left corner overlay → moved inline into the card body (after cost/tier line) so it never overlaps the item image
8. **Signature size:** previously same size as Required → shrunk to ~11px / 0.8 opacity because user noted "some builds have lots of signatures, don't drown the UI"
9. **Recommended definition:** originally "top-4 self per tier" → flooded the UI → switched to "top-1 self per tier" so the ☾ label is rare and means something
10. **Step view row highlight:** previously every labeled row was tinted → user wanted only spike / required / recommended to highlight → others show the glyph in the Priority column but no row background

**Correction / additional history I missed:** _(your note here)_

---

## End

That's the system as it stands. If any **Correction** line above is blank and you want me to revise the section, fill it in and ask me to update; I'll rewrite the **Purpose** / **Reasoning** to match.

Open questions I'd love your input on (use the corrections inline or just tell me):
- Are there sections you'd like more or less depth on?
- Anything I didn't enumerate that you want covered (specific buttons / modals / hidden features)?
- Any sections that are simply wrong about WHY a feature exists?
