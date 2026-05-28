# 01 — Tag scoring semantics

**Before scoring any tag**, consult [tag_descriptions.md](tag_descriptions.md). Each of the 90 tags has a comparison unit, what counts as the tag, hero-specific nuances, and item-specific anchors. Short summaries also live in `../tags.json` (`description`) with full versions in `detailed_description`. **[tag_descriptions.md](tag_descriptions.md) is the source of truth for units and anchors — this file mirrors it operationally.**

These rules cross-cut every tag and override anything that contradicts them.

## Comparison units — what each score is proportional to

The "raw" you compute before normalizing is in the tag's comparison unit. Embed the specific window / range in the reasoning when the unit names one (`<1s` burst vs `>1s` continuous; 10m / 11–19m / 20m+ range bands; within-25m team proximity). Full per-tag table is the "Comparison Units — Cheat Sheet" in [tag_descriptions.md](tag_descriptions.md); the headline units:

| Tag(s) | Comparison unit |
|---|---|
| pure / spirit / bullet damage | effective damage |
| headshot damage | **% headshot importance (judgment-derived, 0–100%)** — NOT flat damage. Headshot damage is a skill/aim mechanic; score how much the item rewards or depends on headshots relative to the best headshot item in the game. Flat bonus damage is too tier-biased to compare directly; convert to an importance % instead. |
| melee damage | effective damage on melee strikes |
| basic resistances / shreds | effective resistance % |
| burst / continuous damage | effective TOTAL damage (`<1s` burst, `>1s` continuous from first hit) |
| general procs | item effectiveness |
| bullet evasion | effective % evaded |
| magazine size dependant | effective ammo up × effective uptime |
| fire rate | effective fire rate (%) |
| fire rate slow | **effective slow% × uptime × affected targets** — do NOT use just the raw slow%. `uptime = active_duration / cooldown`. Single-target active items like Rusted Barrel get a much lower score than passive or AoE slow items. Juggernaut (passive, 36%, 1 target) = 36; Rusted Barrel (active 5s/20s cooldown, 32%, 1 target) = 32 × 0.25 × 1 = 8. |
| aoe / cluster | AoE effect importance × effective enemies affected |
| single target | effect importance × effective uptime |
| close / mid / long range | effectiveness × importance within 10m / 11–19m / 20m+ |
| stun / cc | effective total time stunned |
| aerial / grounded | effectiveness while airborne / on ground |
| horizontal mobility | **effective m/s** — sprint speed is in m/s directly (×0.5 for sprint-only, ×0.25–0.5 for channel-only conditions). For stamina charges: 1 stamina dash ≈ 6m over a ~9–10s effective cycle → ~0.6–0.7 m/s effective. Channel-only bonuses (e.g. sprint while channeling Healing Rite): discount by ~50% for restricted uptime. |
| vertical mobility | effective vertical traverse / dash distance boost |
| movement slow | effective slow % × duration × affected count |
| silence | effective abilities silenced × total duration |
| disarm | disarm duration × affected count |
| cc resist | effective % CC resistance / reduction |
| team heal | amount healed/resisted/shielded to ALLIES (not self) |
| self heal | **total HP healed (self)**. For OOC regen items: `HP/s × estimated OOC session (15–20s) × between-fight uptime (~0.3)`. E.g. +2 OOC regen = 2 × 15 × 0.3 ≈ 9 HP total. For triggered regen (e.g. 4 HP/s for 7s at 75% trigger rate): 4 × 7 × 0.75 = 21 HP total. Do NOT use raw HP/s as the comparative raw for self_heal. |
| anti-heal | effective % heal reduction |
| high / low max hp | HP (or temp HP) up + effectiveness from having higher / lower HP |
| shield | total shield granted |
| scaling early / late | effectiveness × importance from owning this early / late. **Be conservative** — most T1 items should score 0.4–0.7 for scaling_early; 0.8–1.0 is "really good early"; 1.5–2.0 reserved for the named anchor (e.g. Mystic Burst) that defines the early-game paradigm. Don't give every cheap item a high scaling_early just because it's cheap. |
| farmer | effectiveness for farming NPCs |
| cooldown reduction | % CDR (+ if item depends on it; + more covering multiple abilities; most if it also cuts ITEM cooldowns) |
| range_extender / duration_dependant | % range/duration up (ADD, full weight) **OR** % of item effectiveness that relies on it (RELY, **smaller** weight) |
| charge_dependant | **dimensionless/judgment** — importance of extra charges for charge-STACK items (NOT channels / windups). Score 0–2 directly on importance scale (1.5 = very high for a dedicated charge item). Do NOT use the number of charges as a raw stat. Active Reload does NOT belong here. |
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
| ability spam | ideal any-ability usage rate (uses/s). **Weapon actives do NOT qualify** — Active Reload, item-triggered reloads, and gun mechanics are NOT abilities. Only items that directly reward rapid QWER/Space ability casting count. |
| assist / kill count | % of item importance to assists / kills (kills also count as assists) |
| engage / escape | effectiveness × importance to engaging / escaping a fight |
| burst / continuous heal | total HP healed within 1s / outside the 1s window |
| lifesteals | % |
| lane pusher | effectiveness × importance pushing a lane without allies |

## Proc index formulas (burst vs continuous procs)

Procs are scored by a dimensionless index, not a raw stat. **ProcImportance%** rates what the proc *does*: damage = **100%**, universal effects (e.g. movement slow) = **90%**, narrow/specific effects (e.g. fire-rate slow) = **70%** (scale between for other effects).

- **Burst proc** (`spirit_burst_proc` / `gun_burst_proc`):
  `score ∝ ProcImportance% × (EffectDuration / MaxProcWindow)`
  **MaxProcWindow = how much time you have to deal the triggering damage** (the window to MEET the proc condition) — NOT the item's reuse cooldown. EffectDuration = how long the resulting effect lasts. Bigger effect duration and/or shorter trigger window → higher score.
  - *Mystic Burst*: instant effect (~0.1s) triggered by instant damage (~0.1s window) → `100% × (0.1/0.1) = 1.0`.
  - *Spirit Burst*: effect lasts 8s, must be triggered within a 5s window → `100% × (8/5) = 1.6`.
- **Continuous proc** (`spirit_continuous_proc` / `gun_continuous_proc`):
  `raw = ProcImportance% × PotentialEffectiveEnemiesAffected / (RefreshWindow × EffectDuration)`
  This is the **Effective Raw** value — it gets normalized across all continuous-proc items afterward ([03_normalization.md](03_normalization.md)), so only the *relative ranking* matters, not the magnitude. **Smaller RefreshWindow and smaller EffectDuration → higher score; more enemies affected → higher score.** Frequent procs of short-lived effects across many enemies demand the most constant re-application and have the broadest impact.
  - **RefreshWindow** = the time for ONE full re-application. If the proc has an internal cooldown, use it. **If it has no internal cooldown (damage-threshold / buildup procs), use `10s / DamageWindow`** (DamageWindow = the time allowed to accumulate the trigger), so threshold procs are computable.
  - **PotentialEffectiveEnemiesAffected (PEE)** — how many enemies a single proc reapplication can hit at once:
    - `PEE = 1` — single-target proc (on-hit bullet procs, per-target spirit DoTs)
    - `PEE = 3` — typical AoE proc (small aura, 10m AoE)
    - `PEE = 5` — wide aura / team-wide proc
  - Worked (raw, pre-normalize):
    - *Escalating Exposure*: internal cd 0.7s, effect 12s, single-target → `100% × 1 / (0.7×12) = 0.119`
    - *Siphon Bullets*: internal cd 1.2s, effect 17s, single-target → `100% × 1 / (1.2×17) = 0.049`
    - *Spirit Burn*: no internal cd, 500-dmg/5s window → R = 10/5 = 2; burn 8s, single-target → `100% × 1 / (2×8) = 0.063`
    - *Toxic Bullets*: no internal cd, 5s buildup → R = 10/5 = 2; DoT 4s, single-target → `100% × 1 / (2×4) = 0.125`
    - *Hypothetical AoE 5s/8s proc* (10m AoE, PEE=3): `100% × 3 / (2×8) = 0.188` — three times the single-target equivalent.

## Blend formula — `(adds + 0.5 × relies) BEFORE normalization`

The `adds` and `relies` modes encode different *kinds* of contribution: `adds` is what the item provides directly; `relies` is the scaling/conditional benefit on top. To produce one Normalized per (item, tag), the normalizer first merges the modes into a single effective raw, then normalizes:

```
effective_raw[item, tag] = Σ adds.raw + 0.5 × Σ relies.raw     (pre-normalize)
Normalized[item, tag]    = normalize(effective_raw, anchors)   (per-tag anchor set)
```

There is **no further blending at audit time** — the audit reads the single Normalized per (item, tag) directly. In the markdown tables, the merged Normalized is written into the *first `adds` row* for that tag; any `relies` row (and additional adds rows for the same tag) shows `—` in the Normalized column. This is mechanical — done by `_normalize.py`. Authoring is unchanged: write one row per (tag, mode) with a clean comparative raw; the script does the merge.

## spirit_damage adds row — combines flat SP AND proc damage

When an item provides BOTH flat Spirit Power AND a spirit-damage proc, the `adds` row must combine them into one SP-equivalent value rather than encoding only the flat:

```
spirit_damage adds raw = flat_SP + (proc_base_damage + proc_scaling × assumed_SP) / 5
```

Example (Mystic Shot): +7 SP flat + proc 40+1.2×SP → at assumed SP=20: adds raw = 7 + (40 + 24)/5 = 7 + 12.8 = 19.8 ≈ 20.

A separate `spirit_damage relies` row then captures the SCALING benefit (the extra SP-equiv gained as SP stacks).

## Implicit category baseline per tier — add to `bullet_damage` / `high_max_hp` / `spirit_damage` raws

Every item carries an **implicit** category bonus that the wiki shows on the "Item Type Bonuses by Souls" table at [deadlock.wiki/Items](https://deadlock.wiki/Items) — i.e. spending souls on Weapon items grants a kit-wide bonus on top of each item's listed stats. When you compute the comparative raw for `bullet_damage` on a Weapon item, `high_max_hp` (or `spirit_damage`) on a Vitality / Spirit item, **add the implicit per-tier baseline to the item's explicit stat**. Two T1 Weapon items both list "+0 weapon damage" still differ from a T1 Spirit item — they both grant the T1 Weapon baseline silently.

**Derivation (per-tier baseline)**: `tier_cost_in_souls × 12 → round DOWN to the nearest row on the wiki totals table → divide that row's bonus by 12`.

| Tier | Cost | Total souls (× 12) | Wiki row used | Implicit baseline (÷ 12) |
|---|---|---|---|---|
| T1 | 800 | 9,600 | 8,000 | **+5.2% weapon · +3.8% bonus HP · +4.3 SP** |
| T2 | 1,600 | 19,200 | 16,000 | **+7.2% weapon · +4.5% bonus HP · +5.5 SP** |
| T3 | 3,200 | 38,400 | 28,800 | **+9.6% weapon · +5.8% bonus HP · +8.3 SP** |
| T4 | 6,400 | 76,800 | 28,800 (cap) | **+9.6% weapon · +5.8% bonus HP · +8.3 SP** |

Weapon and HP are percentages; Spirit Power is flat. The HP baseline is *bonus HP %* of the hero's base HP (typical hero base ≈ 500 HP, so T2 +4.5% ≈ +22.5 flat HP equivalent). When converting to the flat-HP raw used by `high_max_hp`, multiply by an assumed base HP.

**Authoring rule**: ALWAYS add the per-tier baseline to a Weapon item's `bullet_damage` raw, a Vitality item's `high_max_hp` raw, and a Spirit item's `spirit_damage` raw — even if the wiki box shows zero of that stat. Two T2 Weapon items with no explicit weapon-damage stat still both carry +7.2% baseline, which is what their `bullet_damage` raw should reflect (before further adjustments).

## Indirect defensive effects count toward resistance

Parry cooldown reduction, dodge CD reduction, or any effect that lets you parry/evade MORE OFTEN → adds **effective pseudo-melee/bullet resistance**. Estimate the additional mitigation: e.g. -1.75s parry cd on a 6s base ≈ 29% more parries → add ~5% to the effective resist % raw.

## Items meant to be sold — skip their negative side effects

Some items (e.g. Golden Goose Egg) are purchased early and sold later for a power spike. For these, **do NOT score the item's negative side effects** (damage penalties, etc.) — the hero will sell it before the penalty matters in fights. Score only the positive value (souls/min, scaling_late, etc.).

## self_buff — for conditional-state items only, NOT flat stat bonuses

`self_buff` represents items that create a **persistent conditional-uptime buff state** on the hero (e.g. Opening Rounds fight-opening damage buff, Berserker stacks). Do NOT score `self_buff` on items that simply add flat passive stats (+Spirit Power, +HP, +fire_rate). A flat passive stat is already captured by the relevant specific tag (spirit_damage, high_max_hp, etc.); scoring it ALSO as self_buff double-counts and inflates the score.

## Threshold procs qualify as burst procs

Items that proc when you "deal X damage within Y seconds" use Y seconds as their `MaxProcWindow` for the burst proc formula: `burst_index = ProcImportance% × (EffectDuration / Y)`. Score `gun_burst_proc` in addition to `gun_continuous_proc` for these items (per R5).

## Judgment-derived vs stat-mappable vs dimensionless

- **Stat-mappable** tags have a raw stat on the wiki data-table (and in the AI-built `../_scrape_cache.json` `mapped_stats`) — derive their Effective Raw + Normalized directly from the stat during Stage A.
- **Judgment-derived** tags (procs, CC, burst/continuous splits, range bands, counter/assist importance, etc.) have no raw stat — score them by hand using the same `effective _` reasoning the existing item interpretations use. Look at `../item_interpretations.md` for precedent.
- **Dimensionless** tags — pure "% of item importance/effectiveness" indices (assist/counter importance, ult_focused, single/multi ability focus, damage_sponge, the proc indices, etc.) — **do NOT get the 1.5×-per-tier cross-tier multiplier**; you can't scale a percentage-of-importance across tiers. Score them directly on the 0–2 importance scale.

## Direction rules (CRITICAL — easy to get backwards)

- **`playstyle_score` is dual-purpose.** On a HERO, positive = the hero is good at this; negative = the hero is weak. On an ITEM, positive = the item contributes to this; negative = the item harms this. Same number, different reading depending on which JSON.
- **`ally_weight`** = "is it good or bad for ME that an ally has this?" Positive = good synergy for THIS hero/build. Negative = anti-synergy (e.g. mass damage-type stacking).
- **`enemy_weight`** = "is it good or bad for ME that an enemy has this?" **NEGATIVE = enemy having this is BAD for the hero. POSITIVE = enemy having this is GOOD for the hero.** This is the opposite of what intuition might suggest — the weight is from the hero's perspective, not "is this dangerous in general".
- **Only score ally/enemy weight when the hero is SPECIFICALLY affected.** Don't add a generic "universal good" weight. Default is zero.

## Damage-type over-reliance (the negative-ally-weight rule)

A hero whose damage is concentrated in one type gets a **NEGATIVE ally_weight** on that damage type — a team of 5 spirit casters loses to mass spirit resist.

- Spirit-reliant hero → NEGATIVE ally `spirit_damage`. Less negative if the hero shreds spirit resist (they're opening the door for allies).
- Bullet-reliant hero → NEGATIVE ally `bullet_damage`, but **less negative than the spirit case** because bullet resist is easier to bypass in current meta (debuffs, fire-rate slows, displaces, etc.).
- Melee-reliant hero → NEGATIVE ally `melee_damage`. Less negative with melee-resist shred or kit-paired ranged options.

## Resist-shred inverts the synergy

If the hero relies on damage type X AND has shred for X, give allies **POSITIVE** weight on shred items of that type — allies "opening the door" benefits the hero's damage output. Reduce this if the hero plays lone-wolf.

## General vs specific tags — prefer specific

`burst_damage` / `continuous_damage` / `spirit_proc` / `bullet_proc` are fallbacks. When the source is known (spirit or gun), use the specific variant: `spirit_burst_damage`, `gun_continuous_damage`, etc. General tags score only when the source is genuinely mixed/undefined.

## Pseudo-effects count partially

| Effect | Counts toward | Weight |
|---|---|---|
| Silencing | spirit_resistance | ~0.3x (no spirit damage from silenced enemies) |
| Disarm | bullet_resistance | ~0.4x for duration |
| Fire-rate slow | bullet_resistance | proportional to slow % |
| Bullet resist | melee_resistance | ~0.5x (bullet → melee yes, melee → bullet no) |
| Shield-on-spirit-damage | spirit_resistance | ~0.6x |

## Resist shred can drive resists negative — diminishing returns past 0%

Resistance shred (`bullet_resist_shred`, `spirit_resist_shred`) can push an enemy's effective resist BELOW 0%, which scales the damage multiplier *above* 1.0× (e.g. -20% effective resist → enemy takes 1.20× damage). This is the resist axis going inverted, not a hard floor.

But the marginal value of additional shred *diminishes* once the target is already below 0%:
1. The expected damage uplift curve flattens (each further -5% adds less than the previous -5% in real fights because of HP/burst pacing).
2. Allies may be wasting shred on an already-shredded target (overkill on a shared debuff).
3. Hero design: most encounter targets start around 0-15% resist, so the FIRST -15% of shred is the highest-value chunk; everything past that is mop-up.

**Authoring rule**: score the shred raw at face value up to the first -15% (one team-typical enemy starting resist). Past that, apply a **×0.7 discount** for each additional -10% chunk. Example: an item providing -20% shred → first -15% counts at 100%, the next -5% counts at 70% → effective raw ≈ 15 + 0.7 × 5 = 18.5 (vs naive 20).

## "Add" beats "rely-on" — duration / range / cooldown

For `range_extender_dependant`, `duration_dependant`, `cooldown_reduction`: items that **ADD** the % bonus score larger than items whose effectiveness merely **RELIES ON** that bonus existing. A +20% range item scores higher here than a separate item whose damage is range-gated.

## Hero-specific anti-pattern audits

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
