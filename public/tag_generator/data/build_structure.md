# Deadlock build structure

Research notes on how good Deadlock builds are *structured* — phases, slot roles, branches, terminology — distilled from the in-game build browser, top community builds (tracklock.gg / in-game shared), official Valve patch notes, and the live `deadlock-api.com` taxonomy. Companion to [item_interpretations.md](item_interpretations.md). The **future build-generation task** in the tag generator will consume this doc as its conceptual spec.

> **Reliability cutoff: 2025-05-08.**
> The "Shop Rework Update" replaced the old category-locked 4+4+4+4 inventory with **12 universal slots** (9 base + 3 unlockable). Any guide/article/video predating this patch is wrong about slot mechanics and is **not cited here for slot or category-cap claims**. General build *theory* (power spikes, core/flex roles, branching) survives the rework and is cited where helpful regardless of date, with the date noted. ([Steam DB notes](https://steamdb.io/patchnotes/18393584/) · [deadlock.wiki/Update:May_8,_2025](https://deadlock.wiki/Update:May_8,_2025))

---

## What Valve enforces vs. what is community convention

This distinction matters for the future generator. Valve enforces very little build structure:

| Valve-enforced (hard) | Community convention (soft) |
|---|---|
| Item belongs to one of {Weapon, Vitality, Spirit} | Phase labels (Lane / Early / Mid / Late) |
| Item tier (T1 500 / T2 1250 / T3 3000 / T4 6200 souls) | "Core" vs "Optional" sectioning |
| 12 universal slots (9 base + 3 unlockable) | L→R priority within a section |
| Build-browser tag taxonomy (see below) | Named branches ("Ricochet Route", "Anti-Spirit") |
| `OPTIONAL` flag on a build section (Quickbuy skips it) | Pick-N sections ("Pick 1", "Choose One") |
| | Soul-milestone labels ("Lane - Early 22K") |
| | Substitution / sell-order notes |
| | Annotation cards (free-text notes anywhere) |

The **only structural primitive the game itself ships** is the `OPTIONAL` flag on a category and the build-browser tags (Damage / Healing / CC / Mobility / Headshots / Melee / Spirit / Vitality / Weapon / Utility + 3 complexity levels). Everything else — phases, core/flex split, branches, priority order — is **author convention** that the in-game UI happens to render as free-form labeled sections. ([build tags live](https://api.deadlock-api.com/v1/assets/build-tags?language=english))

---

## Phase skeleton

A near-universal four-phase model. Real builds use a *subset* (often Early / Mid / Late, sometimes merging Lane into Early) and label sections with soul milestones rather than minute timers:

| Phase | Typical souls | Typical goal | Item tiers most relevant |
|---|---|---|---|
| **Lane** | 0 – ~6k | Stabilize the lane; first sustain/farm buys | T1 (500) |
| **Early** | ~6k – ~16k | First power spike; core T2 / early T3 | T2 (1250), early T3 (3000) |
| **Mid** | ~16k – ~32k | Complete core T3; flex slots unlock from objectives | T3 (3000) |
| **Late** | ~32k+ | T4 luxury, 6th-slot game-changers, comeback or win-more | T4 (6200) |

Real builds in §13 use labels like `Lane - Early 22K`, `Mid + Late 32K`, `After 5 Point Ball Upgrade` (hero-ability scaling milestone). The future generator should treat phase boundaries as **soul-amount checkpoints**, not fixed clock times. Items in [items/](items/) map to phases via their `tier` field (1600 → Lane/Early, 2400 → Early/Mid, 4200 → Mid, 5600 → Late) — note these are post-rework tier prices; pre-rework guides cite older numbers.

---

## Slot system (post-2025-05-08)

- **12 universal slots total** — items of any category fit any slot. No per-category inventory cap.
- **9 base slots + 3 unlockable** — the extra 3 unlock through in-game progression.
- **Categories still exist** (Weapon / Vitality / Spirit) — items belong to one, stats scale by it, but you choose freely how many of each to buy.
- Common build target in the new meta: **~4.8k souls in each category** for even-distribution heroes (per the "Super Ult Seven" build in §13). This is a heuristic, not a rule — gun heroes still skew Weapon, ability heroes still skew Spirit.
- Same patch shipped: **component-discount pricing** (you pay less if you already own components), **sell-priority** (1–100 auto-sell when full), and the **`OPTIONAL` flag** on build categories so Quickbuy skips them.

---

## Section types in real builds

The in-game build browser lets authors create any number of free-form named sections. From the 8 top community builds reviewed in §13, sections cluster into these recurring **types** — this is the vocabulary the future generator should use:

### `core`
Locked-in items the hero needs regardless of game state. Usually 3–6 items per phase. Labeled `Early Core`, `Mid Game/Core`, `Late Core`, `CORE`, or simply the phase name with no qualifier. **Not flagged OPTIONAL.**

### `optional`
Flex picks chosen based on game state. Always flagged with the **blue `OPTIONAL` pill** in the UI. Often paired with a core section as `Early Optional` / `Late Optional`. Quickbuy skips these.

### `pick-n`
Explicitly bounded choice from a group: "Pick 1", "Pick One", "CHOOSE ONE". Usually 2–6 candidates, ordered L→R by priority. The author intends exactly N items from this group, not "buy them all".

### `branch`
Named alternative paths the player commits to mid-game. Multiple branches are mutually-exclusive routes:
- `Commiting Harder To The Bit` / `Ult Branch` / `Gun Branch` ("Big Balls For Everyone")
- `Ricochet Route` / `Tank Route` ("Renon's Gun Haze")
- Often introduced by a `Branch Point: OPTIONAL` annotation card that says "from here, decide…"

### `counter`
Reactive picks against the enemy comp. Labeled `Counter Picks`, `Anti-Spirit`, `Anti-Gun`, `Anti Tanks`, `HEALCUT/SHRED` (heal-cut + armor-shred functional grouping). Usually paired with imperative annotations: *"BUY AT LEAST ONE BEFORE LATE GAME"*.

### `replacement` / `upgrade`
Items that **replace** something already bought. Labeled `Replacements`, `Replacements/Upgrades`, paired with sell-order notes (*"SELL EGG IF YOU HAVE IT"*, *"Sell order: SlowHex → BRS → Slowbullet → Opening"*). The future generator must model both buy order and sell order.

### `annotation`
Empty-card text blocks holding free-form notes — patch updates, streamer plugs, jokes, or *"READ ANNOTATION"* call-outs that gate other sections. Not items; pure author commentary. The generator should support attaching prose to any section and supporting a "standalone note card" primitive.

---

## L→R priority convention

**Items within a section are ordered LEFT → RIGHT in buy priority.** This is so widespread it's effectively standard. Authors often state it explicitly:

- *"Left -> Right for all sections"* (Renon's Gun Haze)
- *"Mostly L>R, Get What You Need From Below"* (Burgercat's Electricity Storm)
- *"L -> R For Best Results"* (Parzelion's Haze)
- *"From The Right, Enchanters 1st Against Spirit Heavy"* (overriding the default for matchup)

Exceptions are called out explicitly: *"NOT L-R, Pick as required"* (SN|P3R Spirit Godshot, Late Core). The generator should default to L→R and allow a section-level `unordered: true` override.

---

## Soul milestones in section labels

Authors embed soul targets into section names so players know *when* to transition: `Lane - Early 22K`, `Mid + Late 32K`, `Early Game 4.8k per category`. The number is total team souls or per-hero souls, context-dependent. The generator should support an optional `souls_target` field on a section.

---

## Substitution / sell-order notes

The post-rework `OPTIONAL` flag plus the sell-priority system make explicit sell guidance valuable. Real builds carry:

- **Sell-on-trigger**: *"SELL EGG IF YOU HAVE IT"* (sell Golden Goose Egg once 5-Point Ball Upgrade unlocks)
- **Sell order**: *"SlowHex → BRS → Slowbullet → Opening"* (ordered drop-list when slots fill)
- **Conditional swap**: *"Sharpshooter ⇄ R.Rush + O.Rounds"* (1-for-2 substitution path)
- **Component-aware**: *"Stamina Mastery is delayed for key Spirit spikes, can buy earlier if needed"*

The generator should model sell guidance as first-class metadata, not bury it in free-text annotations.

---

## Category balance ("4.8k per category" rule)

From "SUPER ULT SEVEN - SHMUCK" in §13: *"With the new meta, try to get 4.8k souls in each catagory to be the most effective."* This is the post-rework heuristic for hybrid heroes — roughly even spend across Weapon, Vitality, Spirit during early phases gives the most stat coverage before specializing late.

Specialist heroes still skew heavily (Haze stacks Weapon, Seven stacks Spirit, etc.), but the 4.8k baseline is the rule-of-thumb starting point. The generator can score a candidate build by category spend variance against this baseline.

---

## Quality signals on real builds

- **Win-rate in title**: `[63% WR]`, `[57% WR]` — community builds publicly display win rate. tracklock.gg surfaces this.
- **Patch dating**: `[5/29 UPDATE]`, *"Latest Update May 23rd"* — top builds are kept current with balance patches. A build without a recent date is stale.
- **Build IDs are queryable** via [`GET /v1/analytics/hero-build-stats/{hero_id}?hero_build_id={id}`](https://api.deadlock-api.com/openapi.json) — gives win-rate, match count, badge bracket. Use this to validate any generated build against real match outcomes.
- **No "list all published builds" endpoint** on deadlock-api.com — to browse builds you go to tracklock.gg or the in-game Build Browser. The API returns *analytics on* existing builds.

---

## Terminology glossary

For the generator to produce builds in idiomatic Deadlock English:

| Term | Meaning |
|---|---|
| **Core** | Locked-in item set regardless of state |
| **Optional / Flex** | Picked based on game state or matchup |
| **Pick N** | Choose exactly N from a candidate group |
| **Branch** | Mutually-exclusive route committed mid-game |
| **Counter pick** | Item targeting one specific enemy threat |
| **Replacement / Upgrade** | Item bought to replace one already owned |
| **Sell order** | Ordered drop-list when slots fill |
| **Power spike** | Moment of strength (item or ability rank-up) |
| **Come online** | Hero reaches viable combat threshold |
| **L→R** | Read items in section left-to-right priority |
| **Imbue** | Item that imbues an ability with an effect |
| **Active** | Item with a manually-triggered ability |
| **Quickbuy** | In-game one-click buy of next non-optional item |
| **Category 12** | The 12th (last unlockable) universal slot |
| **5-Point upgrade** | Hero-ability scaling milestone (also "E6 Doctors" jokey ref) |

---

## Common pitfalls

From cross-referencing the community builds with what they *don't* do:

- **Wrong tier progression** — chasing T4 before completing T3 core leaves a soft mid-game.
- **No `optional` allocation** — a rigid all-core list can't react to stomps or rough matchups.
- **No counter slot** — no Anti-Spirit / Anti-Gun section means heroes get hard-countered by single threats.
- **Category bottleneck** — over-spending one category and starving another (e.g., 9 Spirit items on a gun hero gives no DPS scaling).
- **Stale sell guidance** — buying T3 component-upgrades without telling the player to sell the T2 leaves slots clogged.
- **Unstated branch trigger** — branches without a *"From here, decide based on X"* annotation leave players guessing when to commit.
- **No annotation discipline** — burying critical conditions ("READ ANNOTATION") in free-form prose instead of structured fields.

---

## Screenshot annotations

Eight top community builds (provided 2026-05-29 — IDs queryable via the `/v1/analytics/hero-build-stats` endpoint with the IDs below). Notes apply the framework from §4–§9 to each.

### 1. "Big Balls For Everyone!" — ID `659839`
*Section types used:* Early Game (core) · Mid Game (core) · Pick 1 OPTIONAL · Farm Helpers OPTIONAL · After 5 Point Ball Upgrade (milestone-gated core) · Branch Point OPTIONAL → 3 branches (`Commiting Harder To The Bit`, `Ult Branch`, `Gun Branch`) · Universally Good Late.
*Notable:* The clearest **branch-point pattern** in the set — an explicit annotation card introduces a 3-way mutually-exclusive route. Also the cleanest **milestone-gated section** (`After 5 Point Ball Upgrade`) tied to a hero-ability event with explicit sell guidance (*"SELL EGG IF YOU HAVE IT"*).

### 2. "Electricity Storm [5/29 UPDATE]" — Burgercat's Seven, ID `267109`
*Section types used:* Lane - Early 22K · Replacements / Survivability + HEALS OPTIONAL · Mid + Late 32K · Replacements/Upgrades · Anti Tanks · Core Survivability + Survivability +++ · Ult Maxing OPTIONAL · Misc OPTIONAL · Category 12 · 3 annotation cards (patch notes, streamer plug, joke).
*Notable:* **Souls-target labels** (`22K`, `32K`) on every phase section. Uses `Category 12` literally as a section name — confirms the 12-slot system is in active community parlance. Carries a `Latest Update May 23rd | 05/23/2026: Balance Patch` annotation explaining what changed and what items got buffed/nerfed — a model the generator should emulate when patches invalidate items.

### 3. "Seven - Spirit-Vampiric [63% WR]" — tracklock.gg, ID `317822`
*Section types used:* Early Core · Early Optional OPTIONAL · Mid Game · Late Core · Late Optional OPTIONAL.
*Notable:* The **cleanest formal four-quadrant structure** in the set — Core × {Early, Late} and Optional × {Early, Mid, Late}. No branches, no counter sections, no annotations. This is the **minimal viable build structure** the generator should produce as default output, then layer branches/counters as opt-in additions.

### 4. "SUPER ULT SEVEN - SHMUCK" — ID `283398`
*Section types used:* Early Game (with *"4.8k souls per category"* annotation) · Extra Lane Picks OPTIONAL · Mid Game/Core · CHOOSE ONE · Counter Picks OPTIONAL (*"BUY AT LEAST ONE BEFORE LATE GAME. LOOK TO SEE WHAT THEY HAVE OR ELSE YOU WILL DIE LIKE A MORON."*) · Late Game · Optional OPTIONAL.
*Notable:* Best example of a **`CHOOSE ONE` pick-1 section** (Leech vs. Infuser) and an **imperative counter-pick directive**. The counter section lists 12 candidates spanning Anti-Spirit / Anti-Heal / Anti-Gun — a one-stop counter buffet, not split by enemy type like build #8.

### 5. "Haze - Gun-Crowd Control [57% WR]" — tracklock.gg, ID `317831`
*Section types used:* Early Core · Early Optional · Mid Game · Late Core · Late Optional.
*Notable:* Same four-quadrant template as #3 but for a Weapon-focused hero — confirms the template is hero-agnostic. Use as a structural twin to #3 when the generator emits a "baseline" build.

### 6. "Renon's Gun Haze" — ID `239009`
*Section types used:* Early Game (*"Left -> Right for all sections"*) · Pick One "Flex Timing" · Lane Sustain OPTIONAL · Mid Game · `Ricochet Route` (AOE DPS, named branch) · `Tank Route` OPTIONAL (named branch) · Utility Core Options OPTIONAL · Anti-Spirit OPTIONAL · Anti-Gun OPTIONAL.
*Notable:* The **named-route branch pattern** (`Ricochet Route` / `Tank Route`) made fully explicit, plus **enemy-class-split counter sections** (`Anti-Spirit` / `Anti-Gun` as separate panels). This is the model for a generator that wants to emit two playstyle routes for the same hero from the same core.

### 7. "Parzelion's Haze Build" — ID `211035`
*Section types used:* Early Game · `You have Ascended` (milestone section, with sell-order annotation) · OP OPTIONAL "READ ANNOTATION" · HEALCUT/SHRED OPTIONAL · Late Game L → R in importance · Metal Skin OPTIONAL "READ ANNOTATION" · Bunch of Bullshit OPTIONAL.
*Notable:* **Functional grouping** (`HEALCUT/SHRED` = healing-cut + bullet-resist-shred, two effects bundled by purpose) and **`READ ANNOTATION` gating** — sections whose use depends on reading prose elsewhere. Also the most explicit **sell-order annotation**: *"Sell order: SlowHex - BRS - Slowbullet - Opening. Buy curse after fortitude if you are full roaming for kills off ult cooldown."*

### 8. "SN|P3R : Spirit Godshot" — ID `234632`
*Section types used:* `1. Early L-R` (with substitution map *"Sharpshooter ⇄ R.Rush + O.Rounds"*) · Early OPTIONAL · `2. CORE L-R` (with conditional ordering note) · Best Mid Game Greens OPTIONAL · `3. Late CORE NOT L-R, Pick as required` · Late Greens OPTIONAL · Green Options OPTIONAL · Spirit Options OPTIONAL · Spirit Utilities OPTIONAL · Gun Options OPTIONAL.
*Notable:* **Numbered phase sections** (`1.`, `2.`, `3.`) for unambiguous order, **explicit L-R override** (`NOT L-R, Pick as required`), and **substitution-map syntax** (`A ⇄ B + C`). Also splits optional sections by **category color** (`Late Greens`, `Spirit Options`, `Gun Options`) — using the in-game tag colors as a sectioning axis.

### Cross-build patterns

Aggregating §1–§8: **every** build has core sections + at least one optional section. **6 of 8** use explicit phase labels. **4 of 8** use named branches or counter splits. **3 of 8** carry sell-order annotations. **2 of 8** use soul-milestone labels in section names. **1 of 8** numbers its phases. The structural primitives the generator must support, ranked by frequency:

1. `core` section (8/8) ← required
2. `optional` section with `OPTIONAL` flag (8/8) ← required
3. Phase labels Early/Mid/Late (6/8) ← strongly recommended default
4. Named branches and/or split counter sections (4/8) ← opt-in for complex builds
5. Annotation cards (4/8) ← needed for any build with conditional logic
6. Sell-order metadata (3/8) ← needed once builds exceed ~8 items
7. Soul-milestone labels (2/8) ← nice-to-have
8. Numbered phase order (1/8) ← rare, generator can skip

---

## Implications for the tag-generator build generator (forward-looking)

When the **later task** implements build generation in the tag generator, the data model should include:

**Per-build:**
- `hero_id`, `playstyle` (gun / spirit / hybrid / tank / etc.), `target_total_souls`
- Optional: `category_targets: {weapon: 4800, vitality: 4800, spirit: 4800}` for balance scoring
- An ordered list of `sections`.

**Per-section:**
- `name` (free-form, e.g., "Early Core", "Ricochet Route", "Anti-Spirit")
- `type` ∈ {`core`, `optional`, `pick-n`, `branch`, `counter`, `replacement`, `annotation`}
- `flagged_optional: bool` (maps to Valve's in-game OPTIONAL pill)
- `phase` ∈ {`lane`, `early`, `mid`, `late`} (nullable for cross-phase sections)
- `souls_target: number` (nullable)
- `ordering: "lr" | "unordered"` (default `"lr"`)
- `pick_count: number` (only for `pick-n` type)
- `branch_group: string` (mutually-exclusive routes share a group ID)
- `items: [normalized_name]` (ordered by priority)
- `sell_order: [normalized_name]` (optional drop list)
- `annotation: string` (free-form notes)

**Existing tag-generator hooks the generator will use:**
- Item `category` and `tier` from [items/*.json](items/) for phase bucketing
- Item `playstyle_score` (60+ normalized tags) for matching items to the hero's playstyle and to counter-section enemy threats
- Hero matchup matrices in [public/resources/heroes/](../../resources/heroes/) (`matrix_<hero>.csv`) to score how the build's items perform against an actual enemy lineup

**Validation hook:** for any generated build, the live `deadlock-api.com` analytics endpoints (`/v1/analytics/hero-build-stats/{hero_id}` and `/v1/analytics/build-item-stats`) can cross-check whether the item combination has real-match win-rate data — a sanity check against pure-theory hallucination.

---

## Sources

**Primary (authoritative, post-cutoff or live):**
- `GET /v1/assets/build-tags` — [api.deadlock-api.com](https://api.deadlock-api.com/v1/assets/build-tags?language=english) — Valve's in-game tag taxonomy (live).
- `GET /v1/analytics/hero-build-stats/{hero_id}` and `/v1/analytics/build-item-stats` — [api.deadlock-api.com](https://api.deadlock-api.com/openapi.json) — real-match win-rate / item-combo analytics.
- Valve Shop Rework Update patch notes (2025-05-08) — [Steam DB](https://steamdb.io/patchnotes/18393584/) · [deadlock.wiki/Update:May_8,_2025](https://deadlock.wiki/Update:May_8,_2025).
- 8 community builds (in-game build browser, IDs in §13), captured 2026-05-29.

**Secondary (community guides, dates verified):**
- deadlockcalc.com — Item Categories Guide (published 2026-01-22)
- games.gg/deadlock — Mid-Game Mastery (updated 2026-03-16)
- tracklock.gg — referenced in build subtitles (builds #3 and #5); not directly cited for theory.

**Excluded for slot/category claims** (predates 2025-05-08 cutoff or date unverifiable):
- blast.tv Deadlock item guide (2024-10-28)
- carrylord.com Deadlock Meta (no date)
- mobalytics.gg/deadlock (couldn't verify date — 403)
- deadlocktracker.gg (relative timestamps only)

**Mentioned but not investigated** (per user, *"not sure if its useful"*): statlocker.gg — a Deadlock stats / match-analytics tracker. Worth a deeper look if the future generator wants more analytics sources beyond deadlock-api.com.
