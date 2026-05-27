# Skill: Recreate the item interpretations audit

How to (re)produce the audit appended at the bottom of [item_interpretations.md](item_interpretations.md). The audit compares the AI's per-item Calculator tag scores against the values currently stored in each item's `data/items/<key>.json` `values.playstyle_score` and lists the discrepancies as actionable rows.

This document is the runbook for a fresh session. Read it end-to-end before re-running the audit — the order of operations matters (you populate the Calculator tags tables FIRST, then generate the audit from them).

---

## 0. Tag scoring semantics — canonical reference

**Before scoring any tag**, consult [tag_descriptions.md](tag_descriptions.md). Each of the 90 tags has a comparison unit, what counts as the tag, hero-specific nuances, and item-specific anchors. Short summaries also live in `tags.json` (`description`) with full versions in `detailed_description`. **[tag_descriptions.md](tag_descriptions.md) is the source of truth for units and anchors — this section mirrors it operationally.**

These rules cross-cut every tag and override anything that contradicts them:

### Comparison units — what each score is proportional to

The "raw" you compute before normalizing is in the tag's comparison unit. Embed the specific window / range in the reasoning when the unit names one (`<1s` burst vs `>1s` continuous; 10m / 11–19m / 20m+ range bands; within-25m team proximity). Full per-tag table is the "Comparison Units — Cheat Sheet" in [tag_descriptions.md](tag_descriptions.md); the headline units:

| Tag(s) | Comparison unit |
|---|---|
| pure / spirit / bullet damage | effective damage |
| headshot damage | required headshot frequency × item-effectiveness multiplier |
| melee damage | effective damage on melee strikes |
| basic resistances / shreds | effective resistance % |
| burst / continuous damage | effective TOTAL damage (`<1s` burst, `>1s` continuous from first hit) |
| general procs | item effectiveness |
| bullet evasion | effective % evaded |
| magazine size dependant | effective ammo up × effective uptime |
| fire rate / fire rate slow | effective fire rate (%) |
| aoe / cluster | AoE effect importance × effective enemies affected |
| single target | effect importance × effective uptime |
| close / mid / long range | effectiveness × importance within 10m / 11–19m / 20m+ |
| stun / cc | effective total time stunned |
| aerial / grounded | effectiveness while airborne / on ground |
| horizontal mobility | effective m/s (sprint = partial, uptime concern) |
| vertical mobility | effective vertical traverse / dash distance boost |
| movement slow | effective slow % × duration × affected count |
| silence | effective abilities silenced × total duration |
| disarm | disarm duration × affected count |
| cc resist | effective % CC resistance / reduction |
| team heal | amount healed/resisted/shielded to ALLIES (not self) |
| self heal | total HP healed (self) |
| anti-heal | effective % heal reduction |
| high / low max hp | HP (or temp HP) up + effectiveness from having higher / lower HP |
| shield | total shield granted |
| scaling early / late | effectiveness × importance from owning this early / late |
| farmer | effectiveness for farming NPCs |
| cooldown reduction | % CDR (+ if item depends on it; + more covering multiple abilities; most if it also cuts ITEM cooldowns) |
| range_extender / duration_dependant | % range/duration up (ADD, full weight) **OR** % of item effectiveness that relies on it (RELY, **smaller** weight) |
| charge_dependant | effectiveness for charge-STACK items (NOT channels / windups) |
| large / small hitbox | effectiveness for having a large / small hitbox |
| close to / away from team | effectiveness / reliance from being within / outside 25m of teammates |
| spawn minions | effective minions (count × durability × DPS) |
| assist / counter importance | % of total item usage directed at supporting others / countering a specific threat |
| ult focused | reliance on ult being used / available |
| spirit/gun burst damage | total damage within 1s of first hit |
| spirit/gun continuous damage | total damage outside the 1s window |
| x_burst_resistance / x_continuous_resistance | effective % reduction within / outside the 1s window |
| damage sponge | affinity / % of item importance / effectiveness from taking damage |
| anti air | % item importance against airborne enemies |
| trap / block / obstruct | effective players × seconds trapped |
| displace | effective enemies × distance displaced |
| hybrid damage | importance to BOTH spirit AND gun damage/firerate simultaneously |
| single / multi ability focus | % importance for one ability / % of abilities affected |
| interrupt | effective interrupt frequency |
| ability spam | ideal any-ability usage rate (uses/s) |
| assist / kill count | % of item importance to assists / kills (kills also count as assists) |
| engage / escape | effectiveness × importance to engaging / escaping a fight |
| burst / continuous heal | total HP healed within 1s / outside the 1s window |
| lifesteals | % |
| lane pusher | effectiveness × importance pushing a lane without allies |

### Proc index formulas (NEW — burst vs continuous procs)

Procs are scored by a dimensionless index, not a raw stat. **ProcImportance%** rates what the proc *does*: damage = **100%**, universal effects (e.g. movement slow) = **90%**, narrow/specific effects (e.g. fire-rate slow) = **70%** (scale between for other effects).

- **Burst proc** (`spirit_burst_proc` / `gun_burst_proc`):
  `score ∝ ProcImportance% × (EffectDuration / MaxProcWindow)`
  **MaxProcWindow = how much time you have to deal the triggering damage** (the window to MEET the proc condition) — NOT the item's reuse cooldown. EffectDuration = how long the resulting effect lasts. Bigger effect duration and/or shorter trigger window → higher score.
  - *Mystic Burst*: instant effect (~0.1s) triggered by instant damage (~0.1s window) → `100% × (0.1/0.1) = 1.0`.
  - *Spirit Burst*: effect lasts 8s, must be triggered within a 5s window → `100% × (8/5) = 1.6`.
- **Continuous proc** (`spirit_continuous_proc` / `gun_continuous_proc`):
  `raw = ProcImportance% / (RefreshWindow × EffectDuration)`
  This is the **Effective Raw** value — it gets normalized across all continuous-proc items afterward (§5b), so only the *relative ranking* matters, not the magnitude. **Smaller RefreshWindow and smaller EffectDuration → higher score** (frequent procs of short-lived effects demand the most constant re-application = most "continuous").
  - **RefreshWindow** = the time for ONE full re-application. If the proc has an internal cooldown, use it. **If it has no internal cooldown (damage-threshold / buildup procs), use `10s / DamageWindow`** (DamageWindow = the time allowed to accumulate the trigger), so threshold procs are computable.
  - Worked (raw, pre-normalize):
    - *Escalating Exposure*: internal cd 0.7s, effect 12s → `100% / (0.7×12) = 0.119`
    - *Siphon Bullets*: internal cd 1.2s, effect 17s → `100% / (1.2×17) = 0.049`
    - *Spirit Burn*: no internal cd, 500-dmg/5s window → R = 10/5 = 2; burn 8s → `100% / (2×8) = 0.063` ("some, not a lot")
    - *Toxic Bullets*: no internal cd, 5s buildup → R = 10/5 = 2; DoT 4s → `100% / (2×4) = 0.125`

### Judgment-derived vs stat-mappable vs dimensionless

- **Stat-mappable** tags have a raw stat on the wiki data-table (and in the AI-built `_scrape_cache.json` `mapped_stats`) — derive their Effective Raw + Normalized directly from the stat during Stage A.
- **Judgment-derived** tags (procs, CC, burst/continuous splits, range bands, counter/assist importance, etc.) have no raw stat — score them by hand using the same `effective _` reasoning the existing item interpretations use. Look at `item_interpretations.md` for precedent.
- **Dimensionless** tags — pure "% of item importance/effectiveness" indices (assist/counter importance, ult_focused, single/multi ability focus, damage_sponge, the proc indices, etc.) — **do NOT get the 1.5×-per-tier cross-tier multiplier**; you can't scale a percentage-of-importance across tiers. Score them directly on the 0–2 importance scale.

### Direction rules (CRITICAL — easy to get backwards)

- **`playstyle_score` is dual-purpose.** On a HERO, positive = the hero is good at this; negative = the hero is weak. On an ITEM, positive = the item contributes to this; negative = the item harms this. Same number, different reading depending on which JSON.
- **`ally_weight`** = "is it good or bad for ME that an ally has this?" Positive = good synergy for THIS hero/build. Negative = anti-synergy (e.g. mass damage-type stacking).
- **`enemy_weight`** = "is it good or bad for ME that an enemy has this?" **NEGATIVE = enemy having this is BAD for the hero. POSITIVE = enemy having this is GOOD for the hero.** This is the opposite of what intuition might suggest — the weight is from the hero's perspective, not "is this dangerous in general".
- **Only score ally/enemy weight when the hero is SPECIFICALLY affected.** Don't add a generic "universal good" weight. Default is zero.

### Damage-type over-reliance (the negative-ally-weight rule)

A hero whose damage is concentrated in one type gets a **NEGATIVE ally_weight** on that damage type — a team of 5 spirit casters loses to mass spirit resist.

- Spirit-reliant hero → NEGATIVE ally `spirit_damage`. Less negative if the hero shreds spirit resist (they're opening the door for allies).
- Bullet-reliant hero → NEGATIVE ally `bullet_damage`, but **less negative than the spirit case** because bullet resist is easier to bypass in current meta (debuffs, fire-rate slows, displaces, etc.).
- Melee-reliant hero → NEGATIVE ally `melee_damage`. Less negative with melee-resist shred or kit-paired ranged options.

### Resist-shred inverts the synergy

If the hero relies on damage type X AND has shred for X, give allies **POSITIVE** weight on shred items of that type — allies "opening the door" benefits the hero's damage output. Reduce this if the hero plays lone-wolf.

### General vs specific tags — prefer specific

`burst_damage` / `continuous_damage` / `spirit_proc` / `bullet_proc` are fallbacks. When the source is known (spirit or gun), use the specific variant: `spirit_burst_damage`, `gun_continuous_damage`, etc. General tags score only when the source is genuinely mixed/undefined.

### Pseudo-effects count partially

| Effect | Counts toward | Weight |
|---|---|---|
| Silencing | spirit_resistance | ~0.3x (no spirit damage from silenced enemies) |
| Disarm | bullet_resistance | ~0.4x for duration |
| Fire-rate slow | bullet_resistance | proportional to slow % |
| Bullet resist | melee_resistance | ~0.5x (bullet → melee yes, melee → bullet no) |
| Shield-on-spirit-damage | spirit_resistance | ~0.6x |

### "Add" beats "rely-on" — duration / range / cooldown

For `range_extender_dependant`, `duration_dependant`, `cooldown_reduction`: items that **ADD** the % bonus score larger than items whose effectiveness merely **RELIES ON** that bonus existing. A +20% range item scores higher here than a separate item whose damage is range-gated.

### Hero-specific anti-pattern audits

When auditing, flag any of these:

- **Self-counter enemy weight.** Hero `playstyle_score.spirit_damage > 0` AND hero `enemy_weight.spirit_resistance > 0` → wrong direction. Enemy spirit resist is BAD for a spirit-damage hero → should be NEGATIVE.
- **Mass-stacking ally damage type.** Hero relies on damage type X, hero has no X-shred in kit, AND hero `ally_weight.X > 0` → should be NEGATIVE.
- **Anti-heal threat on a sustain hero.** Hero kit is heavy team_heal / self_heal AND hero `enemy_weight.anti_heal > 0` → should be NEGATIVE (direct counter, not generic threat).
- **Headshot threat on a big-head-hitbox hero.** Hero is Seven / Mo & Krill / Cadence AND hero `enemy_weight.headshot_damage > 0` → should be NEGATIVE (the hero already eats headshots).
- **Interrupt threat on an ult-focused hero.** Hero `playstyle_score.ult_focused > 0` AND hero `enemy_weight.interrupt > 0` → should be NEGATIVE (channeled ults lost to interrupts).
- **Ult-focused ally synergy.** Hero relies on ults AND hero `ally_weight.ult_focused == 0` → should be POSITIVE (ult-reliant heroes synergize with ult-reliant allies — ult windows align).
- **General tag used when specific is known.** Item scores on `burst_damage` but item is clearly spirit-only → score should be on `spirit_burst_damage` instead.
- **Missing pseudo-credit.** Silence item with `spirit_resistance` = 0, or disarm item with `bullet_resistance` = 0 → expect partial credit per the table above.
- **Item that scores on a tag the item's mechanic can't deliver.** E.g. an item with `playstyle_score.long_range > 0` whose mechanic only fires within 10m → tag should move to `close_range`.
- **Wrong item type for lifesteal tags.** Lifestrike in `bullet_lifesteal` → wrong, it's melee. Vampiric Burst in `spirit_lifesteal` → wrong, it's gun-flavored. Cross-reference [tag_descriptions.md](tag_descriptions.md) for the right item anchors.
- **Burst heal mistaken for continuous heal.** Healing Nova, Restorative Locket are BURST heals (single tick). They should NOT be in `continous_heal`.
- **Charge_dependant confusion.** This tag is for items with **charge STACKS** (Echo Shard, Refresher, Mystic Reverb). It is NOT for channel times or aim windups — Active Reload does NOT belong here.

Refer to [tag_descriptions.md](tag_descriptions.md) for the full list of corrected item anchors per tag.

---

## 1. What the audit is

The audit is a long markdown section at the end of [item_interpretations.md](item_interpretations.md). For every item it shows:

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|

The audit answers: "for each tag where the per-item Calculator tags table I wrote disagrees with what's already in the JSON, what should change, and how confident should the user be in auto-applying that change?"

It does NOT modify any JSONs. The user reviews the Apply? checkboxes and applies changes in a separate follow-up session.

---

## 2. Workflow — re-scrape, then two interpretation passes, then audit

The audit ALWAYS re-runs the interpretations from a fresh scrape unless explicitly told not to.

**Step 0 — Re-scrape.** `python _scrape_items.py` rebuilds `_scrape_raw_dump.json` from the wiki
(BASE / non-enhanced variant — it reads the `#tabber-Default` panel). It captures structured
passive + active/passive ability blocks (scaling expanded, e.g. `95×0.47` → "95 base + 0.47×Spirit
Power"), value/label per stat chip (NOT the misleading icon title), and prose sections
(Notes / Notable Interactions / Buildup Per Shot). Disambiguation/apostrophe pages use `SLUG_OVERRIDES`.

**Pass 1 — Interpret (hand-judgment).** For every item, author the `### Calculator tags` table.
Columns (6):
```
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
```
- **Descriptive raw** — what the item literally provides (e.g. `-32% fire rate, 5s, single-target`).
- **Comparative raw** — a single number in the tag's comparison unit (see `tag_descriptions.md`),
  derived by judgment so it is comparable across EVERY item (effective gun-dmg %, effective Spirit
  Power, effective % shred after uptime/single-target discounts, proc-index value, or — for
  dimensionless tags — a 0–100% importance estimate). Apply the conversion conventions:
  spirit_damage = effective SP (`TotalDamage/5 + SpiritScaling×20` → relies); enemy-debuff tags
  written POSITIVE; proc indices via the §0 formulas.
- **Mode** — `adds` or `relies`.
- During Pass 1 the `Normalized` column is left for Pass 2. **Do NOT assign 0–2 in isolation** — you
  cannot normalize one item without the rest of the set.

**Pass 2 — Normalize (effect-per-cost, see §5b).** ONLY after every item across ALL tiers has a
comparative raw. `python _normalize.py --write` compares comparative raws tag-by-tag across the whole
set and fills the `Normalized` column. (Judgment lives in the Pass-1 comparative raws + the
laddered/direct classification; the script applies the model.)

**Step 3 — Audit.** `python _run_audit.py` blends `adds + 0.25×relies`, compares to each
`data/items/<key>.json` → `values.playstyle_score`, and appends a `# Audit:` suggestions section at
the bottom of `item_interpretations.md`. SUGGESTIONS ONLY — it never writes item JSONs.

Critical: Pass 1 + Pass 2 must be complete and saved before the audit runs. The audit script only reads.

---

## 3. The blending convention

JSONs carry a single number per tag that conceptually blends both modes. To compare apples-to-apples:

```
AI_blended[tag] = sum(normalized for rows where mode=adds and tag matches)
              + 0.25 × sum(normalized for rows where mode=relies and tag matches)
```

`adds` dominates. `relies` is a small synergy bonus. Multiple rows of the same mode for the same tag are summed before blending.

Concrete example for **Extra Spirit** after Round 7:
- Calc tags table has rows: `spirit_damage 1.5 adds`, `spirit_burst_damage 0.6 adds`, `spirit_continuous_damage 0.6 adds`, `multi_ability_focus 0.5 adds`, `single_ability_focus -0.2 adds`.
- Blended:
  - `spirit_damage` = 1.5 + 0.25 × 0 = **1.5**
  - `spirit_burst_damage` = 0.6 + 0.25 × 0 = **0.6**
  - `single_ability_focus` = -0.2

---

## 4. Tag Inference Rules (R1-R16)

These live in [item_interpretations.md](item_interpretations.md) under `## Tag Inference Rules (Round 7)`. Read them there — they are the canonical source. Quick index:

| # | Rule |
|---|---|
| R1 | `spirit_power` → `spirit_damage` consolidation (no `spirit_power` tag exists) |
| R2 | Damage propagation: SP lifts burst+continuous spirit; bullet_damage lifts gun_burst (heavier) + gun_continuous (lighter); fire_rate lifts gun_continuous (heavier) + gun_burst (lighter) |
| R3 | +0.15 category baseline: Weapon→bullet_damage, Spirit→spirit_damage, Vitality→high_max_hp (+ R2 floor propagation) |
| R4 | Ability-focus tags: multi-ability boosters → +multi_ability_focus + small -single_ability_focus; charged-ability items → +single_ability_focus; imbued items → +single_ability_focus |
| R5 | Proc items get BOTH `x_burst_proc` AND `x_continuous_proc`; lean by cd (short = continuous-heavier, long = burst-heavier) |
| R6 | Item-deals-damage rule: don't drop the damage row, encode at amortized score |
| R7 | Class-fit: melee/close-range items → `grounded adds`; flight/leap items → `aerial adds`. Prefer single positive over negative on opposite |
| R8 | Healing items get `high_max_hp relies` (heals scale with carrier HP cushion) |
| R9 | Stamina items get full suite: horizontal_mobility + vertical_mobility + aerial + escape + engage |
| R10 | Heal-item bundle: assist_importance (if ally-targetable), farmer, burst_heal AND continous_heal blend, high_max_hp relies, damage_sponge relies |
| R11 | Melee items get close_range + engage |
| R12 | Melee counts as weapon damage — close-range weapon items get melee_damage |
| R13 | Counter-flavor items get `counter_importance adds` (1.0-1.5 typical) |
| R14 | Movement-speed items get small `farmer adds` (0.3-0.5) |
| R15 | Don't drop tags just because the math is small — encode at 0.2-0.3 instead |
| R16 | Special-case items get prose flags in Interpretation, not tag gymnastics (Golden Goose Egg) |

Apply rules per-item using judgment. R1, R3, R9 are mechanical (always fire on trigger). R2 is mechanical given the trigger row exists. R4-R8, R10-R15 require reading the item's mechanic and deciding which rules apply.

---

## 5. Canonical Calculator tag list

The Calculator tags table can ONLY use tags that exist in `data/items/<any>.json` → `values.playstyle_score` keys. Cross-check against [tags.json](tags.json). Common mistakes:

- `lane_pusher` — NOT a canonical tag (used in some interpretations but the JSON schema doesn't have it). Drop these rows or rename to something canonical.
- `spirit_power` — NOT a canonical tag. R1 says rename to `spirit_damage`.
- `continuous_damage` vs `gun_continuous_damage` — both exist but mean different things. `continuous_damage` is the generic axis; `gun_continuous_damage` is bullet-specific. Use the more specific one when the source is clear.

Run a sanity check before audit generation:

```python
# In Python:
import json
with open('data/items/extra_spirit.json') as f:
    canonical = set(json.load(f)['values']['playstyle_score'].keys())
# Then compare each row's tag against canonical.
```

---

## 5b. Normalization methodology (0–2 scale) — GOVERNING PROCEDURE

This is the master procedure for turning raw effective values into Normalized 0–2 scores. §6 (cross-tier ceilings) and §7 (sparse-tier dual-scaling) are the lookup tables and edge-case rules this procedure uses — when anything below conflicts with them, this section's *ordering* governs.

### Score anchors

| Score | Meaning |
|---|---|
| **0** | No contribution to this tag. |
| **1** | A **good** contribution *within its own tier*. Assume each tier is ~**1.5× stronger** than the tier below — so "good for T2" is a higher raw value than "good for T1". |
| **1.5** | **Best-in-tier** — the strongest item for this tag at its tier, *provided* it falls in line with the 1.5×-per-tier growth curve. (If a tier's best item undershoots the curve — see §7 sparse-tier rule — it gets less than 1.5.) |
| **2** | The single **BEST effect-per-cost in the entire game** for this tag, across all tiers. There is normally exactly one 2.0 anchor per tag. |

The 1.5×-per-tier assumption means a "1" raw at T1, T2, T3, T4 forms a geometric ladder (×1.5 each step). Use that ladder to place an item: compute its raw, see which tier's "1" band it lands in, then rank within tier toward 1.5 / down toward 0.

### Procedure — ORDER MATTERS (effect-per-cost model)

**Do NOT normalize as you go.** Normalize only after every item's comparative raw is known, or the
per-cost ranking and the game-wide 2.0 anchor can't be calibrated.

1. **Author comparative raws FIRST, for every item across all tiers** (Pass 1). Each row has a number
   in the tag's comparison unit and **no** Normalized yet.
2. **THEN normalize**, per tag, across the full set (Pass 2):
   a. **Divide out the tier growth**: `quality = |comparative_raw| / 1.5^tier` (T1..T4 = 1..4). This puts
      every tier on a common effect-PER-COST scale.
   b. The **highest quality among STANDARD (non-Street-Brawl) items = 2.0**. **This is NOT the biggest
      raw number** — a cheaper low-tier item that over-delivers for its tier out-qualities a bigger
      high-tier stat and takes the 2.0 (e.g. Extra Health 210HP@T1 beats Fortitude 375HP@T3 per-cost).
   c. Everything scales linearly to it: `norm = 2 × quality / quality_max`. Solid tier-leaders that
      sit on the standard curve land near 1.5; the single best-per-cost item is 2.0; good = ~1.0.
   d. **Dimensionless / direct tags** (importance %, proc indices) skip step (a) — no tier division:
      `norm = 2 × |raw| / max(non-SB |raw|)`.
   e. Street Brawl: compute quality at eff_tier=4, **cap at 1.5**, and exclude from setting the 2.0 anchor.

### Effective ≠ raw-cache, and judgment anchors override

"Raw" means **effective** value, not the literal `_scrape_cache.json` number. The cache stores nominal stats (and `uptime`/`effective` are mostly un-curated — flat 1). Many items' true contribution is an *effective* read you supply by judgment:

- **Spellslinger** has no fire-rate stat in the cache but effectively grants ~33–55% fire rate for ability-spam heroes when used correctly → score `fire_rate` high.
- **Vampiric Burst** raw bullet-lifesteal is 13% vs Leech 25%, but its *effective* burst lifesteal is higher → it's the `bullet_lifesteal` 2.0 anchor.
- **Spirit Resilience** (30%) anchors `spirit_resistance` over Fury Trance (40%) on effect-per-cost.
- **Monster Rounds** bullet damage is NPC-only — it does NOT inflate hero `bullet_damage`.

When a user-supplied **judgment anchor** (see §6) disagrees with the raw-cache max, the judgment anchor wins for the 2.0; the script's raw-based number is only a starting suggestion the user reviews.

### Dimensionless tags skip the cross-tier ladder

Pure "% of item importance/effectiveness" tags (the proc indices, assist/counter importance, ult_focused, single/multi ability focus, damage_sponge, etc.) are **dimensionless** — there is no raw quantity that grows ~1.5× per tier, so do NOT apply the ladder or sparse-tier rule to them. Score them directly 0–2 on importance. (See §0 "Judgment-derived vs stat-mappable vs dimensionless".)

### Raw-authoring convention + `_normalize.py` (who computes what)

Per the locked Round-8 split: **I hand-author the raws (judgment); `_normalize.py` computes the §5b normalization for the laddered stat tags only.**

Authoring convention for the `Effective Raw` column:
- **One clean number** per row, in the tag's comparison unit (`30` not `+30%`, `8` not `8 HP/sec`). The normalizer reads the first number in the cell.
- **Contribution-signed**: positive when the row helps the carrier, negative for genuine downsides. So `anti_heal = 70`, `spirit_resist_shred = 16`, `fire_rate_slow = 32` are **positive** (they're good to bring); a self-damage / move-speed penalty is negative.
- **Propagation rows** (R2 floors etc.) with no independent stat: leave Raw as `—`; the normalizer passes the authored Normalized through untouched.

What `_normalize.py` does:
- Ladders ONLY the curated clean stat tags (`LADDER_ANCHORS`): `ec(tier) = ceiling × 1.5^(tier − anchor_tier)`, `norm = min(1.5, 1.5 × |raw| / ec)`, sign preserved; the per-tag global-max-raw standard item = **2.0**.
- **Everything else is passthrough** — judgment-only and dimensionless tags keep the Normalized I author (NO 1.5×/tier expectation, even if they carry units; a judgment-estimated "effective %" is not a clean cross-tier stat).
- **Street Brawl** items (tier `?`) are scored but EXCLUDED from the per-tag 2.0 anchor and the ladder, and capped at **1.5** (measured against the T4 ceiling).

Run order after a tier's raws are clean: `python _normalize.py --write` (fills laddered Normalized consistently across all items) → `python _run_audit.py` (blends + audits).

### Street Brawl items

Street Brawl items (`streetbrawl_only: true` in `_scrape_cache.json`, 17 of them) **must be included** — compute their raw and a Normalized score like any other item. BUT:

- They **do NOT contribute to tier scaling** — exclude them when building the 1.5×-per-tier ladder (their souls cost / availability is mode-locked, so they'd distort the curve).
- They **cannot define the 2.0** best-effect-per-cost anchor — the game-wide 2.0 must come from a standard purchasable item.
- Consequently a Street Brawl item caps at **1.5** Normalized (consistent with §8), measured against the standard-item curve.

---

## 6. Cross-tier ceiling reference

When deciding Normalized values (0-2 scale), each stat has a cross-tier 2.0 anchor. Look up the stat in the table in [item_interpretations.md](item_interpretations.md) under `## Cross-tier ceiling reference` (in the Round 7 plan, also embedded). Highlights:

| Stat / axis | 2.0 ceiling | Notes |
|---|---|---|
| `magazine_size_dependant` | Titanic Magazine T2 **100%** | T3/T4 best falls FAR below — sparse-tier rule pulls them to ≤1.0 |
| `bullet_damage` (BaseAttackDamagePercent) | Glass Cannon T4 **80%** | Smooth growth curve. NOTE: NPC-only damage (Monster Rounds) does NOT count toward hero bullet_damage |
| `high_max_hp` (BonusHealth) | Fortitude T3 **375** | T2 best is weak (90) — sparse-tier. Colossus/Fortitude are the anchors; ignore Improved Stamina/Inhibitor |
| `fire_rate` | Blood Tribute T3 **35%** | Active windows reduce effective rate. ⚖️ Spellslinger has high *effective* fire rate for ability-spam heroes despite no raw fire-rate stat |
| `continous_heal` (BonusHealthRegen) | Juggernaut T4 **8/sec** | T3 has no big regen item. Veil Walker is BURST heal, not continuous |
| `bullet_resistance` | Bullet Resilience T3 / Warp Stone T3 **30%** | T4 best undershoots |
| `spirit_resistance` | ⚖️ **Spirit Resilience T3 (30%)** | Judgment anchor (best effect-per-cost) — beats Fury Trance's raw 40%. `spirit_burst_resistance` 2.0 = Spellbreaker T4 / Counterspell T3 (metal skin is NOT a spirit-burst tool) |
| `bullet_lifesteal` | ⚖️ **Vampiric Burst T4** | Judgment anchor — higher *effective* bullet lifesteal than Leech's raw 25%. Lifestrike is MELEE lifesteal, not bullet |
| `spirit_lifesteal` | Infuser T4 **70%** (active) | Passive ceiling much lower. Vampiric Burst does NOT count here (gun-flavored). Leech carries spirit_lifesteal (25%) |
| `spirit_damage` (TechPower) | Diviners Kevlar T4 **35** + Boundless 30+15%mult | Boundless mult is unique 2.0 axis |
| `cooldown_reduction` | Transcendent Cooldown T4 **25%** | Smooth growth. ADD-vs-RELY (per range_extender): item that ADDS CDR = full credit; item with its own cooldown that merely benefits from CDR = partial |
| `duration_dependant` | Superior Duration T3 **28%** | T4 best (Magic Carpet 15%) undershoots. Diviner's Kevlar duration is currently *inflated* — score it down |
| `long_range` | ⚖️ **Sharpshooter T3** | Judgment anchor (range-damage). Bullet-speed (tier-flat 60%) items count partially. Opening Rounds capped below 1.5 because this ceiling exists |
| `melee_damage` | ⚖️ **Point Blank T3 (50% close-range weapon power)** | Judgment/R12 — close-range gun-amp counts as melee; cache files it under `bullet_damage_pct` |
| `vertical_mobility` (Stamina) | Stamina Mastery T3 **+2** | T4 has no stamina item — sparse upper hole |
| `movement_slow` | Lightning Scroll T4 **80%** | Active items dominate. Does NOT include fire-rate slow (own tag) |
| `fire_rate_slow` | Rusted Barrel / Juggernaut **~32–36%** | Rusted Barrel slows FIRE RATE, not movement. Higher score for AoE/multi-target |
| `anti_heal` | Spirit Burn T4 **-70%** | Score magnitude of debuff |
| `bullet_resist_shred` | Crippling Headshot T4 **-16** | Score by absolute magnitude |
| `spirit_resist_shred` | Crippling Headshot T4 **-16** | Same |

⚖️ = **judgment anchor**: the user-supplied effect-per-cost 2.0 that may not be the raw-cache maximum. These override the script's raw-based suggestion.

---

## 7. Sparse-tier extrapolation (the dual-scaling rule)

Normalized 0-2 scores should reflect *both* (a) within-tier ranking AND (b) extrapolated cross-tier growth curve. When they disagree, the curve wins.

**Algorithm**:
1. Find the highest raw value for the stat across all tiers. That's the 2.0 anchor.
2. Earlier tiers usually set lower ceilings; growth between tiers implies what each tier's "1.5" should look like.
3. If a later tier doesn't reach the extrapolated raw, its tier-best item gets less than 1.5 — proportional to how far it undershoots.

**Worked examples**:
- Magic Carpet T4 duration_dependant 15% — T3 Superior Duration 28% = 2.0. A real T4 1.5 would extrapolate to ~25%+. Magic Carpet undershoots, so it gets ~1.0, not 1.5.
- Titanic Magazine T2 100% sets the 2.0 ceiling. T3/T4 best ammo items (30% each) earn ≤1.0 against that anchor, not 1.5.
- HVR T1 60% bullet speed — every tier has a 60% bullet-speed item. Stat is tier-flat, so 60% earns the same Normalized at every tier.

**Counter-rule**: if a stat genuinely only exists in one tier (e.g., `BonusBaseHealth` only on Colossus T4 at 25%), don't pretend the curve is broken — that's the item's defining axis and it can earn 2.0 on its own.

---

## 8. Street Brawl (T?) items

The 17 T? items are flagged `streetbrawl_only: true` in `_scrape_cache.json`. Per the §5b methodology they **must now be included** in the audit — compute their raw effective values and a Normalized score like any other item — but with these caps (which is why §5b excludes them from tier scaling and the 2.0 anchor):

- Cap Normalized at **1.5** (never 2.0) since their reach is mode-locked.
- They do **not** contribute to the 1.5×-per-tier ladder and cannot define a tag's game-wide 2.0 anchor.

Where a Street Brawl item genuinely has no meaningful calc-tag contribution (pure ability-variant), the Calculator tags table may still be left as:

```
### Calculator tags
*(n/a — Street Brawl ability-variant; no calculator-relevant stats.)*
```

but if it carries scoreable stats, populate the rows (capped at 1.5) rather than skipping it.

---

## 9. The audit pipeline → `_run_audit.py` (hand-table driven)

The audit is **hand-table driven** and the output lives at the **bottom of [item_interpretations.md](item_interpretations.md)** (the format the user likes). The persistent generator is [`_run_audit.py`](_run_audit.py). There is **no automated scraper** — `_scrape_cache.json` is an AI-built artifact (each item's wiki data-table was read by hand/WebFetch, *not* the "enhanced" table), so a patch is reflected by re-passing the tables, not by re-running a scraper.

### Two stages

- **Stage A — author/update the `### Calculator tags` tables (judgment).** For each item, read the wiki data-table → write the Interpretation + Game stats → derive Calculator tags with effective stats + the units (§0) + §5b normalization. *This is where a balance patch / tag clarification gets incorporated.* Rows are `| Calc tag | Effective Raw | Normalized | Mode | Reasoning |` with Mode = `adds` or `relies`.
- **Stage B — run `_run_audit.py` (mechanical).** It parses every item's Calculator tags table, blends `AI = adds + 0.25 × relies`, compares to each `data/items/<key>.json` `values.playstyle_score`, and appends the per-item audit section at the bottom of `item_interpretations.md`, replacing any prior `# Audit:` section. SUGGESTIONS ONLY — it never writes item JSONs.

```
python _run_audit.py    # → rewrites the "# Audit:" section at the bottom of item_interpretations.md
```

The script is **crash-safe**: it builds the new file in memory and swaps it in with `os.replace` (atomic). If interrupted (e.g. out of credits), the original `item_interpretations.md` is untouched — the swap only happens once the whole file is built. Re-running is idempotent (it always replaces the single `# Audit:` section).

### Output format (per item, grouped by tier)

```
### Extended Magazine (`extended_magazine`, T1 Weapon)
Path: `data/items/extended_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.80 | 1.00 | +0.20 | Bump JSON → 1.00 | `[x]` |
```

- A row appears only where **|Diff| ≥ 0.15** OR one side is missing.
- JSON current = item JSON value or `(null)`; AI blended = blended table value or `(drop)`.
- Actions: `Bump JSON → X` / `Cut JSON → X` (both present) · `Add row, set X` (AI only) · `Drop row` (JSON only).
- Apply? defaults per §10; the box also accepts a forced number.

### Judgment facts to apply when (re-)passing the Stage-A tables

These are correct *readings* (independent of any script) — apply them when authoring the Calculator tags tables:

| Item | Correct read |
|---|---|
| Rusted Barrel / Suppressor / Hunters Aura / Juggernaut | `fire_rate_slow` (NOT `movement_slow`); fire-rate slow also earns partial `bullet_resistance` / `gun_continuous_resistance` pseudo-credit (§0) |
| Juggernaut / Enduring Speed / Fleetfoot | resist **slows** → `cc_resist`, NOT generic `debuff_resistance` |
| Lightning Scroll | its `SlowPercent` + `MovementSpeedSlow` are one effect — don't double-count `movement_slow` |
| Spellslinger | high *effective* `fire_rate` (ability-spam) despite no raw fire-rate stat |
| Leech | carries `spirit_lifesteal` (25%) |
| Veil Walker | `burst_heal` (NOT `continous_heal`) |
| Healing Booster / Healing Tempo | meaningful `self_heal` too |
| Diviner's Kevlar | `duration_dependant` is inflated — score down |
| Monster Rounds | bullet damage is NPC-only — don't inflate hero `bullet_damage` |
| Opening Rounds | `long_range` capped below 1.5 (Sharpshooter ceiling) |
| Ballistic Enchantment | include its effective bullet-damage-up |
| ⚖️ judgment anchors (§6) | Vampiric Burst (`bullet_lifesteal`), Spirit Resilience (`spirit_resistance`), Sharpshooter (`long_range`), Point Blank (`melee_damage`) |

### Refreshing source data after a patch → `_scrape_items.py`

`_scrape_cache.json` is an AI-built artifact — there is no live scraper feeding it. To pull fresh wiki data after a balance patch, use [`_scrape_items.py`](_scrape_items.py). It is **standalone**: it only *imports* the authoritative item list (`ITEMS`, `norm`) from `public/resources/items/generate_items.py` — it does NOT modify that file (which exists to fetch item images/descriptions for the app; leave it alone).

What it does, per item, from `https://deadlock.wiki/<Item_Name>`:
- selects the **base (non-enhanced) infobox** — the first `table.item-infobox` with no `Enhanced` row (NOT the enhanced variant);
- captures `infobox_lines` (cost, tier, passive/active, the stat blob, "Upgrades From", codename), the `description`, and the **`changelog`** (date + change) — the changelog tells you exactly what the patch altered;
- writes everything to `_scrape_raw_dump.json` (crash-safe temp-then-`os.replace`; per-item errors are recorded, not fatal).

```
python _scrape_items.py                       # all 172
python _scrape_items.py "Toxic Bullets" ...   # just-these, for spot-checks
```

**Full post-patch workflow (repeatable):**
1. `python _scrape_items.py` → fresh `_scrape_raw_dump.json`.
2. Skim each item's `changelog` to find what changed since last pass (stat tweaks, reworks).
3. For changed items, re-do **Stage A** in `item_interpretations.md`: update Interpretation + Game stats from the new `infobox_lines`, then re-derive the `### Calculator tags` (effective stats + §0 units + §5b normalization). The stat blob is free-text — interpreting it into structured stats IS the judgment step.
4. `python _run_audit.py` → regenerates the `# Audit:` section at the bottom of `item_interpretations.md`.
5. Review the `Apply?` boxes (§10); apply in a follow-up session.

Note: the scrape gives raw text, not structured `raw_stats`. Re-building structured `raw_stats`/`mapped_stats` (the old `_scrape_cache.json` shape) is optional — Stage A can read the `infobox_lines` directly.

---

## 10. Apply? column — values and smart defaults

The **Apply?** box on each suggestion row is how the user tells the follow-up apply step what to do. It accepts three kinds of value:

| Value | Meaning |
|---|---|
| `[x]` | Apply the **Suggested** value to the item JSON. |
| `[ ]` | Skip — leave the current JSON value untouched. |
| a **number** (e.g. `0.8`) | **Force that exact value** into the JSON, overriding the AI's Suggested number. |

The number-override lets the user accept the *direction* of a suggestion while dictating the magnitude — e.g. the audit suggests `1.5` but the user types `0.9` and `0.9` is what gets written. The apply-reader parses the cell: a bare number → use it; `[x]` → use Suggested; anything else (`[ ]`, blank) → skip.

Smart defaults (set by `_run_audit.py`):

| Action | |diff| ≤ 0.6 | |diff| > 0.6 |
|---|---|---|
| Bump | `[x]` | `[ ]` *(large diff — review)* |
| Cut | `[x]` | `[ ]` *(large diff — review)* |
| Add row | `[x]` | `[ ]` *(large diff — review)* |
| Drop row | `[ ]` (R15: don't drop) | `[ ]` (also don't drop) |

Reasoning:
- Drops default to off because R15 says "don't drop tags just because the math is small."
- Large diffs default to off because they need eyeball review — a +1.2 diff often means the JSON is missing the tag entirely or the AI is wildly miscalibrated.
- The user can always override a default by typing a number.

---

## 11. End-of-audit per-tier checklist

After all per-item tables, append:

```markdown
---

## Apply these changes to JSONs

*(Cross-tier high-level cleanup checklist. Per-row Apply? checkboxes in the audit tables above are the per-tag tracker; this section is for tier-wide patterns.)*

### T1
- [ ] (placeholder)

### T2
- [ ] (placeholder)

### T3
- [ ] (placeholder)

### T4
- [ ] (placeholder)
```

The user fills these in with cross-tier patterns they spot during review (e.g., "all weapon items still need R3 baseline added to JSON").

---

## 12. Verification checklist (before declaring audit done)

- [ ] No `spirit_power` rows remain in Calculator tags tables (R1).
- [ ] Every item has at least one row matching its category baseline at ≥ 0.15 (R3).
- [ ] Every Spirit item with `spirit_damage adds N` has `spirit_burst_damage` and `spirit_continuous_damage` rows (R2).
- [ ] Every Stamina item has aerial/escape/engage rows (R9).
- [ ] Every healing/regen/lifesteal item has `high_max_hp relies` (R8).
- [ ] Every melee item has close_range + engage; close-range weapon items also have melee_damage (R11/R12).
- [ ] Counter-flavor items have counter_importance (R13).
- [ ] Sprint/MS items have a farmer adds row (R14).
- [ ] Street Brawl items (T?) remain n/a — no calc tags rows.
- [ ] Audit section appended (not duplicated). Old audit deleted if regenerating.
- [ ] Audit has the Apply? column with smart defaults.
- [ ] Empty per-tier "Apply these changes to JSONs" checklist at the very bottom.
- [ ] No item JSONs modified during this session (audit is read-only against JSONs).

---

## 13. Files this skill touches

| File | Role |
|---|---|
| [item_interpretations.md](item_interpretations.md) | Read AND write. Calc tags tables and the audit section both live here. |
| [_scrape_cache.json](_scrape_cache.json) | Read-only. Source of raw_stats per item, also where streetbrawl_only flag lives. |
| [tags.json](tags.json) | Read-only. Canonical Calculator tag list (sanity check before using a tag). |
| [items/&lt;key&gt;.json](items/) | Read-only during audit. Each has `values.playstyle_score` which the audit compares against. NEVER write these during audit. |
| `_baseline_table.json` | Tertiary hint only; unreliable, don't trust. |

---

## 14. When the user pushes back on a per-item score

This always happens. The pattern:

1. User identifies a class of items the AI scored poorly (e.g., "all stamina items should have aerial").
2. Codify the correction as a new rule (or refine an existing rule) in the `## Tag Inference Rules` section of `item_interpretations.md`.
3. Re-pass any items the new rule touches (don't try to re-pass everything — only items where the new rule applies).
4. Regenerate the audit (it re-runs over the whole file).
5. Spot-check the user-named items in the new audit to confirm the rule landed.

The rule doc is the canonical reference for "why is this item scored this way" — keep it current.

---

## 15. Common mistakes to avoid

- **Don't run the audit script before updating Calculator tags tables.** The audit reads tables, doesn't generate them.
- **Don't modify item JSONs during the audit session.** Audit is read-only against JSONs. JSON updates are a separate follow-up.
- **Don't use tags that aren't in the canonical list.** `lane_pusher` and `spirit_power` are common offenders. Audit will flag these as `Drop row` but they were always wrong — the AI table itself shouldn't have them.
- **Don't double-encode negative tags.** R7 says prefer single positive (`grounded adds 0.4`) over negative on opposite (`aerial adds -0.4`). Picking both double-counts the anti-synergy.
- **Don't write Reasoning columns that just restate the rule name.** Include WHY: which raw stat triggered the rule, what the propagation values were derived from, why the Normalized landed where it did.
- **Don't forget Street Brawl items get skipped.** If your audit script doesn't handle items with empty Calc tags tables, it'll crash.

---

## 16. Quick-start commands

```powershell
# Sanity check: how many items have Calculator tags tables?
$content = Get-Content -Raw "public\tag_generator\data\item_interpretations.md"
([regex]::Matches($content, '### Calculator tags\n\|')).Count
# Should be ~155 (172 items - 17 Street Brawl)

# Find any spirit_power rows that R1 missed:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`spirit_power`'

# Verify audit section was regenerated:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '^# Audit:'
# Should show ONE match. Two means old audit wasn't deleted.

# Count audit rows by Apply? state:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`\[x\]`'
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`\[ \]`'
```

---

## 17. Round history (for context)

- Round 5: Phase A — populated raw-stub Game stats tables for all 172 items from `_scrape_cache.json`.
- Round 6: Phase B — populated Calculator tags tables for all 172 items using sparse-tier extrapolation and the dual-scaling rule. Phase C — first audit appended.
- Round 7: Codified R1-R16 Tag Inference Rules after user identified systemic gaps in T1 audit. Full re-pass of all 172 items + regenerated audit with Apply? checkbox column.
- Round 8: Rewrote all 90 `tag_descriptions.md` + `tags.json` entries (playstyle-score perspective). Corrected `enemy_weight` direction to be hero-specific ("if the enemy has this tag, how does it affect THIS build"). Added §5b governing normalization methodology (0/1/1.5/2 anchors, raw-first-then-normalize, 1.5×-per-tier ladder, Street Brawl included but excluded from tier scaling / 2.0 anchor).
- Round 8 (audit pipeline correction — this entry): confirmed the audit is **hand-table driven** and lives at the bottom of `item_interpretations.md` (the Round-7 format the user likes), NOT a separate file. Deleted the cache-based `audit_round_suggestions.md` (prior-chat artifact, confusing). `_run_audit.py` is now the hand-table generator: parses `### Calculator tags` tables → blends `adds + 0.25 × relies` → compares JSON → appends the per-item audit, crash-safe (atomic `os.replace`). Added the X-or-number **Apply?** convention (§10). `_scrape_cache.json` is an AI-built artifact (no auto-scraper); patches are reflected by re-passing the Stage-A tables.
- Round 8 (skill sync — this entry): synced AUDIT_SKILL.md to `tag_descriptions.md`. Added (1) the full comparison-units table to §0; (2) the burst/continuous **proc index formulas** with the ProcImportance% scale (damage 100% / universal 90% / specific 70%); (3) the judgment-derived vs stat-mappable vs **dimensionless** distinction (dimensionless tags skip the cross-tier 1.5× ladder); (4) the effective-≠-raw-cache note + ⚖️ judgment anchors that override raw (Vampiric Burst, Spirit Resilience, Sharpshooter, Point Blank, Spellslinger); (5) corrected §6 anchors; (6) the Round-8 judgment facts (FireRateSlow→fire_rate_slow, slow-resist≠debuff_resistance, Lightning Scroll de-dup, etc.) now in §9's Stage-A table. *(NOTE: this entry originally described a cache-based "Pipeline B" → `audit_round_suggestions.md`; that was superseded by the entry above — the audit is hand-table driven into `item_interpretations.md`.)*

Future rounds should follow the same pattern: identify a class of mistakes → write a rule → re-pass affected items → regenerate audit → spot-check.
