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
