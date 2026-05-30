# Build Screen — Working Notes (cross-machine handoff)

Living doc for the new **Build Screen** panel on Calc Build Detail. Captures
what's shipped, every direct correction the user has made, and what's still
open. Pair-read with [DESIGN.md](DESIGN.md) — but treat DESIGN.md as a high-
level map; for any conflict, the live code wins.

The Build Screen sits **above** the existing Build Path Guide on the Calc
Build Detail page and presents the same data as a Deadlock-in-game-style
sectioned grid: Phase rows (Core + Optional) on the left, Counter Picks and
Assist Picks on the right. Same input as Build Path Guide; lower attention
than the Simulator.

---

## Entry points

| File | Role |
|---|---|
| [public/tag_generator/static/app.js](static/app.js) `mkBuildScreenPanel` | Top-level render, inserted by `openCalcBuild` between Assist/Counter panel and Build Path panel |
| [public/tag_generator/static/app.js](static/app.js) `bsCategorizeAllItems` | Single-pass categorization → `{core, optional, assist, counterGroups}` |
| [public/tag_generator/static/app.js](static/app.js) `bsConsensusVulnerability` | Perspective-aware enemy weakness vector (used by Counter) |
| [public/tag_generator/static/app.js](static/app.js) `bsRenderItemTile` | Capsule renderer (icon area + name band + label-above-pill) |
| [public/tag_generator/static/app.js](static/app.js) `bsBuildCounterSection` | Phase-rowed Counter Picks render (FOR-tag groups, side-by-side) |
| [public/tag_generator/static/style.css](static/style.css) §`Build Screen` block | All `.bs-*` styling (capsules, tier shading, label pill, counter rows) |
| [public/tag_generator/data/tags.json](data/tags.json) | `short_label` field on every tag — surfaces in Build Screen tile captions + FOR-tag headers |

---

## What's shipped

### Layout
- 3-column grid: phases column (`Lane / Early / Mid / Late / Extra Late` × {Core, Optional}) + Counter Picks column + Assist Picks column
- Each item rendered as a Deadlock-style **capsule**: 64×84 with neutral dark icon area, category-tinted name band, tier roman cap top-right
- Tier shading via `--bs-cat-tone` mix-with-warm-gray (T1) → mix-with-black (T4) — pale early tiers, deeper late tiers
- Glow halo reserved for **spike + anti-spike only** (no glow on required/signature/recommended)

### Categorization (`bsCategorizeAllItems`)
- **Core** — soul-budget walk: walk phases Lane→Extra Late; per phase, place top-priority required first, then highest-scoring remaining items until phase's `BUILD_PHASES[i].addBudget` is exceeded (soft cap, last item still goes in). Items cross-tier within a phase naturally.
- **Counter Picks** — global scoring against perspective-aware enemy team vuln vector; top 12; grouped by **primary** countered tag; each group bucketed into a phase row by **average item cost** (`bsMergedPhaseForTier(avgCost)`); within a phase row, groups flow **side-by-side** (`.bs-counter-groups-row` flex-wrap). Group header reads `FOR <TAG>` (we score what the items _provide_, not what enemies share).
- **Assist Picks** — tier-bucketed (small side column); items with `assist_importance >= 0.5`, sorted by `.ally`, capped 4/phase.
- **Optional** — soul-budget walk over leftovers, same as Core; tile cap 5/phase.

### Labels (`bsRenderItemTile`)
- Calc label is rendered as a **horizontal pill above the capsule** (was a top-left clip-path chip — moved per user direction)
- Pill backdrop is a paler mix of the glyph's own color (per-label rules in CSS): spike→`--danger`, required→`--gold`, anti→`#c79bff`, signature→`--accent`, recommended→`--info`
- Tile reserves a 14px top margin when no label is present so rows still align

### Counter perspective
- `bsConsensusVulnerability(b)` decides "this hero's opponents" by checking whether `b.heroName` is in `MATCH.enemies` (it's an enemy hero → opponents = `MATCH.allies`) or not (ally hero → opponents = `MATCH.enemies`). When viewing an enemy's build, Counter Picks are computed against **our** team's vulnerabilities, not theirs.

### Tag manager additions
- `short_label` field added to every entry in [tags.json](data/tags.json)
- Editable in **Tag Manager**: new column in the tags table + new input row in the Add/Edit Tag modal (`#mt-short`)
- Wired through `POST /api/tags` and `PUT /api/tags/<code>` in [app.py](app.py)
- Build Screen tile captions + Counter `FOR <TAG>` headers prefer `short_label`, fall back to `name`, then humanized code (`bsTagDisplayName`)

### Optional tile captions
- Each Optional capsule shows up to 2 chips beneath the name band, listing the item's top playstyle tags by `short_label` (so "+Spirit DMG", "+Speed", etc.)
- Quantity hint per phase header ("Buy 1–2 of these" / "Buy 1 if you have extra" / "Get if desperate") computed from `coreItems` souls vs `bsCorePhaseBudget`

### Focus button (scaffolded)
- Header has a `Focus heroes…` button; opens placeholder `bsOpenFocus` — real wiring still pending (see Open work)

---

## Direct user corrections logged

These are the actual rules to honor; many of these contradict the original plan. Listed in chronological order so context is preserved.

1. **Required items in Core via constraints resolver** — don't read `b.required_items` directly; use `resolveBuildConstraints` (handles `followed_build` inheritance + `_excluded` variants).
2. **All 5 phases visible** — Lane / Early / Mid / Late / Extra Late as separate rows (initial design merged Lane→Early and Late→Extra Late).
3. **Icon area is neutral dark** — `#14171a`, no category tint behind the item art. Only the name band carries category color.
4. **Tier shading is paler early, deeper late** — T1 mixes with `#b0a89c` warm parchment gray (not blinding-vibrant); T4 mixes with `#000`.
5. **No "complementary" backdrops for label chips** — chip backdrop is a paler version of the glyph's own color (e.g. spike glyph red → chip backdrop red-tinted).
6. **Glows only for spike + anti-spike**. Required / signature / recommended communicate via chip only.
7. **Capsule has no border around the image** — flat solid backdrop, no padding-as-frame.
8. **Calc label moves ABOVE the capsule** (was top-left corner clip-path). Reserved space keeps tile heights aligned.
9. **Spike backdrop must match glyph color** — glyph is `var(--danger)` red, so chip backdrop is `color-mix(in srgb, var(--danger) 38%, #1a1614)`.
10. **Counter Picks** —
    - Group by what items _provide_ → header reads `FOR <TAG>`, NOT `vs <TAG>`. "vs" would require checking what enemies share — not in scope right now.
    - Top-N counter items globally, ranked by `Σ(playstyle_score[vulnTag] × consensus.strength) × counter_importance`.
    - Group items by their **primary** countered tag (the single tag they score highest against).
    - Compute **average item cost** per group → place group in a phase row (Lane / Early / Mid / Late / Extra Late). Placement is visual only — items remain usable any time.
    - Multiple groups within a phase **flow side-by-side** (wrap on overflow). Singleton-group merging was discussed and ROLLED BACK — keep them as their own group but allow horizontal layout so the column stays short.
    - Mini icons next to a `FOR <TAG>` header use the hero's `mini_image_path`. Fallback chain: `mini_image_path → image_path` (some summary endpoints don't expose `mini_image_path`).
    - Perspective-aware: for an enemy hero's build, opponents = `MATCH.allies`.
11. **Core sizing is SOULS-driven, not COUNT-driven** — `BUILD_PHASES[i].addBudget` is the cap; the item that overshoots still goes in (no stranding near the boundary).
12. **Algorithm walks phases sequentially** — start at Lane, accumulate souls as items are added in priority order, advance to Early once Lane is over budget, etc. Items are NOT pre-bucketed by tier; an item that fits the current phase's remaining budget goes in regardless of tier.
13. **Tag short labels live in tags.json** — not in a JS map. Editable through Tag Manager. Use the current `name` if `short_label` is empty (no auto-prefix like "+").
14. **User-supplied short-label overrides applied**: `Bullet Shred`, `Bullet Evasion`, `Glass Cannon Support`, `Big Model`, `Small Model`, `Ult`, `Damage Sponge`, `Imbue Focus`. No `+` prefix.
15. **DESIGN.md is stale** — verify function names / `MATCH.*` shapes against the live code before relying on the doc. Flag any disagreement.

---

## Open work / TODO

### Confirmed-pending from earlier todo list

- **Soul-milestone phase labels** in section headers (`EARLY · 4K–10K` etc., derived from `SIM_TICK_INCOME` summed over the phase's tick range).
- **Wire Focus button** properly — reuse the Simulator's Focus modal per build sim state (`MATCH.simStates[heroName::buildIdx].focused`); right now it just toasts a placeholder.
- **Visual parity check vs screenshot #5** in [build_structure.md §13](data/build_structure.md). This is checkpoint F from the plan — side-by-side a real Seven Ball build with the screenshot and confirm the feel.

### Followups from current iteration

- **Too many T4 / not enough T1** — partly addressed by the soul-budget walk (Lane's 3200-soul budget fits ~4 T1 items naturally), but verify on rich builds. If the priority ranking still over-weights T4 items, consider tier-aware ranking or a phase-fit gate (skip an item if its tier wildly exceeds the current phase budget, defer to a later phase).
- **Optional tile cap may strand items** — currently 5/phase plus soul-budget cap. Re-check on dense builds whether the cap or the budget is binding.
- **Counter empty state** — when there are no enemies (or a hero with no consensus vulns), the section says "no counter picks (add enemies + calculate)". Look correct, but worth a once-over after the perspective change.
- **Counter group de-duplication** — primary-tag grouping can produce many small groups (1–2 items). User chose horizontal layout over merging; revisit if a real build produces unreadably many singletons.
- **Build Path Guide alignment** — Build Screen wraps the same `pathData` but with its own logic. Spot-check that Build Path's anti-spike anchors line up with items that get the `anti` / `spike` chip on the Build Screen.
- **`mini_image_path` on `/api/heroes` summary endpoint** — the summary endpoint at `app.py:207-251` returns `image_path` but **not** `mini_image_path`. The current fallback to `image_path` works, but cleaner fix is to add `mini_image_path` to the summary serializer so we never have to fall back.

### Design.md updates

DESIGN.md predates this work. Sections that need refresh after the Build Screen lands:

- §14 (Calc Build Detail layout) — add Build Screen panel between Assist/Counter and Build Path Guide.
- §15 (Build Path Guide section) — note the parallel `bs-*` capsule structure that mirrors `bp-summary-chip`.
- §20 (Label glyphs) — note that Build Screen renders labels as horizontal pills above the capsule, with paler-tone backdrops; glows only on spike/anti.
- §22.10 (Surge anti-spike consensus) — note that `bsConsensusVulnerability` is the perspective-aware counterpart used by the Build Screen.

---

## Verification cheatsheet

When picking this up on the other machine, sanity-check in this order:

1. `python app.py` from `public/tag_generator/`, load the index page.
2. Tags page: confirm the new **Short Label** column shows for all 90 tags (Pure DMG, Spirit DMG, Bullet Shred, etc.). Click ✏️ on one — modal shows the **Short Label** input pre-filled. Edit, save, reload — change persists in `tags.json`.
3. Heroes page: pick Seven, run Calculate. Open the **Ball** build's Calc Detail.
4. Verify the Build Screen panel renders above Build Path Guide. Five phase rows (Lane / Early / Mid / Late / Extra Late) on the left, Counter Picks + Assist Picks on the right.
5. Verify calc labels (gold ★ for required, mint thumbs-up for signature, etc.) appear as **pills above** the capsules, not in the top-left corner.
6. Verify Counter headers read `FOR <TAG>` (e.g. `FOR BULLET RESIST`), not `VS <TAG>`. Multiple groups within a phase row should sit side-by-side.
7. Add a roster of 6 enemies + 6 allies, click Calculate, open an **enemy's** build's Calc Detail. The Counter Picks should reflect the player's team's vulnerabilities (since "this enemy's opponents" = `MATCH.allies`), NOT the enemy team's own.
8. Optional tile captions show up to 2 short labels from `tags.json` per tile (e.g. "Spirit DMG", "Speed").
9. Lane row should have several T1 items (not just one expensive T4) — confirms the soul-budget walk is working.

If any of the above fails, root-cause before adding more features.
