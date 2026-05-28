# 02 — Tag Inference Rules + Canonical tag list

## Tag Inference Rules (R1–R22)

These also live in [../item_interpretations.md](../item_interpretations.md) under `## Tag Inference Rules` (the file is the canonical per-round source, but keep this index in sync). Apply rules per-item using judgment. R1, R3, R9 are mechanical (always fire on trigger). R2 is mechanical given the trigger row exists. R4-R8, R10-R22 require reading the item's mechanic and deciding which rules apply.

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
| R17 | **scaling_early/late conservatism**: most T1 items → 0.4–0.7; best T1 → 0.8–1.0; 1.5–2.0 = named anchor only. Don't give every cheap item a high scaling_early just because it is cheap. |
| R18 | **weapon damage in melee range → partial melee_damage**: weapon damage bonuses that only apply within melee strike range also count toward `melee_damage` at the weapon-damage→melee multiplier (50% per the wiki). E.g. +20% weapon damage at <15m → score `melee_damage` adds raw ≈ 20 (since the weapon amp enables melee hits within that range). |
| R19 | **self_buff is NOT for flat passive stats**: flat +Spirit Power, +fire_rate, +HP, etc. are NOT self_buff. self_buff is for items that grant a conditional-uptime buff state (Berserker, Opening Rounds opener, etc.). |
| R20 | **Items meant to be sold** (Golden Goose Egg): don't score negative side effects (damage penalties). Score only the positive soul-economy or scaling value. |
| R21 | **Melee-only items → close_range 80–100%**: items that ONLY trigger or function in melee range (melee lifesteal, melee damage items) should score `close_range` at 80–100% importance, not 50%. The item literally cannot work outside melee range. |
| R22 | **Parry/dodge CD reduction → pseudo-melee resistance**: a faster parry cooldown lets the hero parry more often, adding effective melee mitigation. Estimate: `(CD_reduction / base_CD) × base_resist_effect` and add to the `melee_resistance` effective raw. |
| R23 | **Imbue items → `single_ability_focus` only.** Codenames containing `imbue` (e.g. `upgrade_bulletshredimbue`) bind to one ability. ALL bonuses the imbue carries (range, duration, damage, fire rate) are single-ability — score `single_ability_focus` positive and DO NOT score `multi_ability_focus`. A "+22% ability range" stat on an imbue is single-ability range, not kit-wide. (Fixes Ballistic Enchantment.) |
| R24 | **Flat self-damage items → negative `low_max_hp` + positive `high_max_hp relies`.** Items with a flat HP-cost mechanic (Blood Tribute draining 50 HP/s; any future "spend N HP/s to gain X" item) cost a *larger fraction* of total HP on low-HP heroes than on high-HP ones. Score `low_max_hp` **NEGATIVE** (item hurts more if your max HP is low — you bleed out faster) and `high_max_hp` **POSITIVE relies** (item is safer/better-scaling for high-HP carriers). DO NOT score `low_max_hp` positive — that's the *trigger-on-low-HP* synergy pattern (Soul Shredder), not the *flat-self-damage* pattern. |
| R25 | **Proc tags apply to ALL procs including self-buff / resist-buff procs.** R5 said "proc items get both `x_burst_proc` AND `x_continuous_proc`"; that has been read narrowly as damage procs only. Clarify: ANY item where firing/hitting/striking triggers a stacking or duration effect — whether enemy damage, enemy debuff, OR a self-buff like Escalating Resilience's bullet-resist stacks — counts as a proc and gets the proc tags. Lean by inter-stack cooldown: stacks every shot → continuous-heavy; stacks once per ~3–5s → burst-heavy. (Fixes Escalating Resilience — should have both `gun_continuous_proc` and `gun_burst_proc`, continuous-leaning.) |
| R26 | **Don't over-interpret partial / incidental contributions to dimensionless tags.** For `small_hitbox`, `damage_sponge`, `single_target`, `single_ability_focus`, `multi_ability_focus`, `ult_focused`, `engage`, `escape`: only the item's **primary, intentional** contribution to the tag counts at full value. Incidental side effects (faster movement "kinda" making your hitbox smaller; an HP item "kinda" making you a damage sponge; a stamina item "kinda" helping engage AND escape; a CDR item "kinda" boosting every ability) get **fractional credit, not full credit**. A pure mobility item is NOT a `small_hitbox` item — score `small_hitbox` at 0.2–0.4 at most. A pure HP item is NOT a `damage_sponge` item — it's a `high_max_hp` item; `damage_sponge` ≥ 1.0 is reserved for items whose mechanic *rewards* taking damage (Berserker, Soul Shredder triggers). The tag has to be the item's **purpose**, not its **side effect**. |
| R27 | **`counter_importance` and `assist_importance` use a niche-vs-universal axis, not a power axis.** These tags measure how *specifically* the item is built around countering a threat or assisting allies — NOT how strong it is. Items that ONLY work as a counter or ONLY benefit teammates (Knockdown vs ult-channelers, Healbane vs heal comps, Healing Rite cast on ally) score **above 0.5**, climbing to 1.5–2.0 for the most single-purpose tools. Items where the counter/assist benefit is incidental on top of a generally-useful kit (Heroic Aura, Restorative Locket — items broadly good for any team) score **below 0.5**. Don't conflate "this item is good in fights" with "this item is counter-flavored": the universal-but-strong item gets a LOW score on this axis. |
| R28 | **Sustain / mobility / charge-economy items get a small `farmer adds` (0.2–0.5).** The `farmer` tag captures economic uptime, not just NPC damage. Heal/regen/lifesteal items (Restorative Shot, Healing Rite, Extra Regen, Mystic Regeneration), sprint/stamina items (Sprint Boots, Extra Stamina, Enduring Speed), and charge-economy items that let you re-cast farm abilities (Extra Charge, Refresher) all enable farming uptime even when they don't damage NPCs directly. Score `farmer adds` 0.2–0.5 on these. Cap at 0.5 — pushing past 0.5 is reserved for items whose mechanic *is* farming (Monster Rounds, Cultist Sacrifice, Soul Shredder Bullets). |
| R29 | **Charge-stack items get a small `cooldown_reduction adds` (0.3–0.5).** Items that add an ability charge (Extra Charge `+1 Bonus Ability Charges`, Refresher, Mystic Reverb) effectively reduce the per-cast cooldown by allowing back-to-back casts. Score `cooldown_reduction adds` 0.3–0.5 on these items even though their wiki box does not show a `cooldown_seconds` reduction stat — the *effect* on cast cadence is equivalent. Codename hint: `upgrade_extra_charge`, `upgrade_refresher`. |
| R30 | **Close-only / melee-only items keep a small NEGATIVE `long_range adds` (-0.3 to -0.5).** Overrides R7's "prefer single positive over negative on opposite" specifically for *range-restricted* items: when an item literally cannot function outside ~15m (Close Quarters, Melee Lifesteal, Melee Charge, Point Blank), authoring should encode BOTH the positive `close_range adds` AND a small negative `long_range adds` to express the explicit anti-affinity. The negative tells the recommender "do NOT pair this with long-range builds"; the positive doesn't capture that on its own. Range-flat items (most weapons) still follow R7 — only items physically gated to close range get the negative `long_range`. |
| R31 | **Apply R3 category baselines universally — every Weapon/Spirit/Vitality item gets a non-zero baseline row.** R3 already says "+0.15 category baseline: Weapon→bullet_damage, Spirit→spirit_damage, Vitality→high_max_hp", but the AI has been dropping these rows on items whose main mechanic is in a different axis (e.g., Mystic Regeneration is Spirit but score-as-heal-item, so AI drops its `spirit_damage` row). Don't drop. EVERY Spirit item carries the per-tier SP baseline from the implicit-baselines section in [01_scoring_units.md](01_scoring_units.md); EVERY Weapon item carries the per-tier weapon-damage baseline; EVERY Vitality item carries the per-tier HP baseline. The row may be small (0.1–0.3 Normalized) but it must exist. |
| R32 | **Cap pure single-axis "named anchor" items at 1.5 Normalized — the 2.0 anchor is reserved for hybrid/scaling items.** Extra Health is the named `high_max_hp` anchor, but it's pure flat HP — score it 1.5, not 2.0. The 2.0 ceiling should belong to an item that scales HP with another axis or provides bonus mechanics on top (Colossus's HP-scaling spirit; Fortitude's HP + regen combo). Mirror for: `self_heal` (Healing Rite is pure utility heal → cap 1.5; reserve 2.0 for Restorative Locket-style hybrid heal+shield items), `fire_rate` (Rapid Rounds is pure passive → cap 1.5; 2.0 for items that *condition* fire-rate plus another mechanic). The general principle: a single-axis flat-stat item, no matter how clean, doesn't reach the game-wide 2.0 effect-per-cost ceiling — that takes hybrid power. |

## Canonical Calculator tag list

The Calculator tags table can ONLY use tags that exist in `data/items/<any>.json` → `values.playstyle_score` keys. Cross-check against [../tags.json](../tags.json). Common mistakes:

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
