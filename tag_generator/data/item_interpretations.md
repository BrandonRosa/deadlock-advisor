# Deadlock item interpretations

Source of truth for AI-judged item effectiveness. Each item is interpreted by hand from
the **fresh structured scrape** (`_scrape_raw_dump.json`, BASE / non-enhanced variant) against
the governed tag vocabulary in [tags.json](tags.json) and [Mass Item AI Audit Skill/tag_descriptions.md](Mass%20Item%20AI%20Audit%20Skill/tag_descriptions.md). See [Mass Item AI Audit Skill/SKILL.md](Mass%20Item%20AI%20Audit%20Skill/SKILL.md) for the full audit runbook.

> **Rebuild policy:** the audit always re-runs these interpretations from a fresh scrape unless
> explicitly told not to. After a balance patch: `python _scrape_items.py` → re-judge below →
> normalize → regenerate the suggestion audit with `python _run_audit.py`.

## Two-pass workflow (IMPORTANT)

1. **Pass 1 — interpret (this file's per-item tables).** For every item, author both raw columns.
   **Do NOT assign normalized 0–2 scores yet.**
2. **Pass 2 — normalize.** ONLY after *every* item across *all* tiers has a comparative raw, compare
   the comparative raws tag-by-tag across the whole set and assign the 0–2 normalized scores
   (separate pass — script or judgment). You cannot normalize an item in isolation; the 1.5/2.0
   anchors are defined relative to the rest of the set.

## Two vocabularies

Each item carries two tables:

- **Wiki stats** — faithful readout of the wiki infobox (passives + active/passive ability blocks),
  for readability/debugging. Scaling is expanded (`95×0.47` → "95 base + 0.47×Spirit Power").
- **Calculator tags** — the governed playstyle vocabulary (`tags.json`). Columns:
  - **Descriptive raw** — what the item literally provides for this tag (e.g. `20% + instant reload`,
    `-32% fire rate, 5s, single-target`). Human-readable, not yet comparable.
  - **Comparative raw** — a single **number in the tag's comparison unit** (see `tag_descriptions.md`),
    derived by judgment so it is comparable across *every* item. This is what Pass 2 normalizes.
    Examples of units: effective gun-damage %, effective ammo % × uptime, effective fire-rate %,
    effective Spirit Power, effective % resist/shred (after uptime / single-target / condition
    discounts), effective m/s, total HP healed, proc-index value, or — for dimensionless "% item
    importance" tags — a 0–100% importance estimate.
  - **Mode** — `adds` (item directly provides the stat → full value) or `relies` (item scales with /
    depends on the stat → partial credit). Pass-2 blend: `AI = adds + 0.25×relies`.
  - **Reasoning** — show the math behind the comparative raw.

## Comparative-raw conventions

- **Effective, not nominal.** Apply realistic uptime/conditional discounts and credit mechanics:
  `passive`=1.0; `OOC regen`≈0.3; below-threshold≈0.25–0.30; active=`duration/cooldown` (or a
  per-fight uptime); per-stack≈0.6×max; single-target enemy debuff ×0.2 vs team-wide; instant
  reload / huge mag get a credited bump above their nominal %.
- **Enemy-debuff tags are positive** — `*_resist_shred`, `movement_slow`, `fire_rate_slow`,
  `anti_heal` help the buyer, so their comparative raw is written **positive** (the word
  "shred"/"slow" already implies it hurts the enemy). Real self-penalties stay negative.
- **spirit_damage = effective Spirit Power.** Flat Spirit Power → `adds`. Actual spirit damage dealt
  is converted to an SP-equivalent via `TotalDamage/5 + SpiritScaling×20` and entered as the
  `relies` value. One shared unit → comparable across all items.
- **Proc indices** (`*_proc`) — burst-proc index = `ProcImportance% × (EffectDuration / MaxProcWindow)`
  (MaxProcWindow = the time you have to land the trigger, not the reuse cooldown);
  continuous-proc index = `ProcImportance% / (RefreshWindow × EffectDuration)` (bigger = better;
  RefreshWindow = internal proc cd, or `10s/DamageWindow` if none). ProcImportance%: damage 100%,
  universal effect (slow) 90%, narrow effect (fire-rate slow) 70%. The index IS the comparative raw.
- **Dimensionless / importance tags** (`self_buff`, `counter_importance`, `scaling_*`, `*_focus`,
  `engage`/`escape`, `farmer`, `damage_sponge`, etc.) — comparative raw is a 0–100% importance
  estimate; these do not get cross-tier 1.5× growth in Pass 2.
- **Damage-type propagation** — a `bullet_damage` row also lifts `gun_burst_damage` / `gun_continuous_damage`;
  a `spirit_damage` row lifts the spirit_* equivalents; melee-range gun amps give partial `melee_damage`.

---

# T1 (800 souls)

## Extended Magazine
- **normalized_name**: `extended_magazine` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_clip_size`
- **wiki**: https://deadlock.wiki/Extended_Magazine

### Interpretation
Pure ammo stick: +30% Max Ammo, +8% Weapon Damage. Sustained-fire enabler for any gun — extra magazine depth lets you push through farming and skirmishes without reloads.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +30% | Passive |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% direct + T1 Weapon baseline | 13 (eff gun-dmg %) | 0.7 | adds | 5.2 baseline + 8 explicit. |
| `magazine_size_dependant` | +30% Max Ammo | 30 (eff ammo %) | 0.9 | adds | Direct passive. |
| `gun_continuous_damage` | sustained fire + ammo depth | 30 (raw dmg outside 1s) | 0.9 | adds | R2: ammo extends continuous fire. |
| `gun_burst_damage` | per-shot WD lift in 1s | 15 (raw dmg within 1s) | 0.5 | adds | R2: bullet_damage lifts burst lightly. |
| `farmer` | ammo depth enables wave-clear | 50 (% importance) | 1.0 | adds | R28: T1 farmer-friendly. |


---

## Rapid Rounds
- **normalized_name**: `rapid_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_rapid_rounds`
- **wiki**: https://deadlock.wiki/Rapid_Rounds

### Interpretation
Pure fire-rate stick: +9% Fire Rate. T1 burst-damage enabler that lifts every weapon's DPS within a 1s window.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +9% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +9% direct | 9 (eff %) | 1.3 | adds | Direct. |
| `bullet_damage` | T1 baseline + FR-derived lift | 9 (eff gun-dmg %) | 0.5 | adds | 5.2 baseline + small FR-derived per-shot DPS lift. |
| `gun_burst_damage` | FR lifts burst HEAVILY (R2 corrected) | 40 (raw dmg within 1s) | 1.2 | adds | R2: fire_rate primarily lifts gun_burst. |
| `gun_continuous_damage` | FR lifts continuous lightly | 10 (raw dmg outside 1s) | 0.3 | adds | R2: less impact (ammo/mag-gated). |


---

## Close Quarters
- **normalized_name**: `close_quarters` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_close_range`
- **wiki**: https://deadlock.wiki/Close_Quarters

### Interpretation
Close-range bullet amp: +20% Melee Resist, +20% Weapon Damage when target is within 15m. T1 close-fight anchor — rewards brawler positioning.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Resist | +20% | Passive |
| Weapon Damage Conditional | +20% | Passive (within 15m) |
| Close Range | 15m | Trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +20% × ~0.55 close uptime + T1 baseline | 16 (eff gun-dmg %) | 0.9 | adds | 5.2 baseline + 11 effective (close-gated). |
| `close_range` | <15m gun-amp gating | 80 (% importance) | 1.7 | adds | ⚖️ Named close_range T1 anchor. |
| `melee_resistance` | +20% direct | 20 (eff %) | 2.0 | adds | Direct passive. |
| `engage` | close-fight commit | 50 (% importance) | 1.1 | adds | R11: close fights need engagement. |
| `gun_burst_damage` | per-shot close amp | 20 (raw dmg within 1s) | 0.6 | adds | R2: close-range bullet amp lifts burst. |
| `gun_continuous_damage` | sustained close fire | 20 (raw dmg outside 1s) | 0.6 | adds | R2: bullet amp on continuous. |
| `grounded` | close-fight grounded | 35 (% importance) | 1.4 | adds | R7. |


---

## Headshot Booster
- **normalized_name**: `headshot_booster` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_headshot_booster`
- **wiki**: https://deadlock.wiki/Headshot_Booster

### Interpretation
Headshot proc gun amp: +30 HP, +45 bonus damage on the next headshot vs enemy Heroes (9s CD). Per Notes: doesn't apply to Troopers/NPCs with headshot hitboxes; affected by Damage Falloff. T1 headshot anchor — rewards aim.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +30 | Passive |
| Head Shot Bonus Damage | +45 | Passive (next headshot, 9s CD) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `headshot_damage` | 45 bonus dmg per headshot proc | 55 (% importance) | 2.0 | adds | ⚖️ T1 headshot anchor. |
| `bullet_damage` | T1 baseline + per-headshot amp | 11 (eff gun-dmg %) | 0.6 | adds | 5.2 baseline + ~5.8 effective from 45-dmg proc. |
| `gun_burst_proc` | proc per 9s CD on headshot | 0.20 (proc index) | 0.3 | adds | Hits within 1s window; gated by 9s CD. |
| `single_target` | per-headshot single-target | 35 (% importance) | 1.1 | adds | One target at a time. |
| `mid_range` | headshots reward mid-range aim | 25 (% importance) | 1.1 | adds | Mid-range identity. |
| `high_max_hp` | +30 HP (Weapon, no Vit baseline) | 30 (HP) | 0.3 | adds | Explicit only. |


---

## High-Velocity Rounds
- **normalized_name**: `high_velocity_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_high_velocity_mag`
- **wiki**: https://deadlock.wiki/High-Velocity_Rounds

### Interpretation
Velocity stat stick: +60% Bullet Velocity, +8% Weapon Damage. Lands ranged shots more reliably — long-range bullet supporter.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% direct + T1 baseline | 13 (eff gun-dmg %) | 0.7 | adds | 5.2 baseline + 8 explicit. |
| `long_range` | +60% velocity lands ranged shots | 40 (% importance) | 0.9 | adds | Velocity directly benefits range. |
| `gun_burst_damage` | per-shot WD lift in 1s | 15 (raw dmg within 1s) | 0.5 | adds | R2. |
| `gun_continuous_damage` | per-shot WD lift sustained | 15 (raw dmg outside 1s) | 0.5 | adds | R2 symmetric. |
| `headshot_damage` | velocity aids landing heads | 20 (% importance) | 0.7 | adds | Indirect aim assist. |


---

## Monster Rounds
- **normalized_name**: `monster_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_non_player_bonus`
- **wiki**: https://deadlock.wiki/Monster_Rounds

### Interpretation
NPC-focused farm/sustain stick: +25% Weapon Damage vs NPCs, +25% Bullet Resist vs NPCs, +1 OOC Regen. Per Notes: applies vs Troopers + Guardians + Walkers + Denizen + Patron + Graves' Ghouls. T1 farm anchor for lane push.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs NPCs | +25% | Passive (NPC-conditional) |
| Bullet Resist vs NPCs | +25% | Passive |
| Out of Combat Regen | +1 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | NPC-only weapon damage + resist | 80 (% importance) | 1.6 | adds | ⚖️ T1 farmer anchor — NPC bonus. |
| `bullet_damage` | T1 baseline only (NPC-only conditional excluded) | 5.2 (eff gun-dmg %) | 0.3 | adds | Baseline only — NPC damage doesn't lift hero gun-damage axis. |
| `scaling_early` | early-game lane-push farmer | 50 (% importance) | 1.4 | adds | Early game souls advantage. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) | 0.2 | adds | Small OOC tick. |
| `mid_range` | NPC-clear lane positioning | 25 (% importance) | 1.1 | adds | Lane skirmish range. |


---

## Restorative Shot
- **normalized_name**: `restorative_shot` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_medic_bullets`
- **wiki**: https://deadlock.wiki/Restorative_Shot

### Interpretation
Bullet-on-hit heal: +6% Weapon Damage, next bullet heals 50 (hero) / 20 (NPC), 6s CD. Per Notes: goes on cooldown even on miss. T1 sustain-on-aim hybrid.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Heal On Hero Hit | 50 | Passive (6s CD) |
| Heal On NPC Hit | 20 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +6% direct + T1 baseline | 11 (eff gun-dmg %) | 0.6 | adds | 5.2 baseline + 6 explicit. |
| `self_heal` | 50/6s × typical combat ≈ 150 HP | 150 (HP total) | 1.5 | adds | Sustained self-heal via aim. |
| `burst_heal` | 50 HP within 1s on each proc | 50 (HP within 1s) | 0.5 | adds | Instant per-proc heal. |
| `gun_burst_proc` | per-bullet heal proc | 0.15 (proc index) | 0.2 | adds | 6s CD throttles. |
| `farmer` | NPC heal also triggers | 35 (% importance) | 0.7 | adds | R28: aim-while-farming. |


---

## Extra Health
- **normalized_name**: `extra_health` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health`
- **wiki**: https://deadlock.wiki/Extra_Health

### Interpretation
Pure HP stick: +210 Bonus Health. The T1 raw-HP anchor — biggest single-stat HP buy at T1.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +210 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | T1 Vit baseline + 210 HP | 229 (HP) | 2.0 | adds | ⚖️ T1 high_max_hp anchor. |
| `damage_sponge` | raw HP = sponge identity | 45 (% importance) | 0.9 | adds | Pure HP stat stick. |


---

## Extra Regen
- **normalized_name**: `extra_regen` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_endurance`
- **wiki**: https://deadlock.wiki/Extra_Regen

### Interpretation
Pure regen stick: +2.5 Health Regen, +1.5 OOC Regen. Continuous self-heal anchor for T1 — sustains lane presence between fights.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +2.5 | Passive |
| Out of Combat Regen | +1.5 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 2.5×30s combat + 1.5×20s OOC | 105 (HP total) | 1.0 | adds | Sustained self-regen. |
| `continous_heal` | regen ticks outside 1s | 100 (HP outside 1s) | 0.7 | adds | ⚖️ T1 continous_heal flavor. |
| `burst_heal` | first-1s tick | 2.5 (HP within 1s) | 0.0 | adds | Small per-second. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) | 0.2 | adds | R31. |
| `farmer` | regen sustains lane farm | 40 (% importance) | 0.8 | adds | R28. |


---

## Extra Stamina
- **normalized_name**: `extra_stamina` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_improved_stamina`
- **wiki**: https://deadlock.wiki/Extra_Stamina

### Interpretation
Stamina stat stick: +1 Stamina, +12% Stamina Recovery. Mobility/jumping enabler — more dashes, more aerial options.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +1 stamina + faster recovery | 2.5 (units) | 2.0 | adds | Direct mobility enabler. |
| `horizontal_mobility` | stamina-dash adds m/s | 0.65 (m/s eff) | 0.9 | adds | Stamina × 0.65 m/s effective. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) | 0.2 | adds | R31. |
| `escape` | mobility-flavored | 35 (% importance) | 0.7 | adds | R14: mobility = escape. |
| `farmer` | stamina enables rotations | 30 (% importance) | 0.6 | adds | R28. |


---

## Grit
- **normalized_name**: `grit` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_grit`
- **wiki**: https://deadlock.wiki/Grit

### Interpretation
T1 active barrier: +1 OOC regen, 200 barrier for 4s on 60s cooldown. Component for Weapon Shielding, Reactive Barrier, Guardian Ward, Spirit Shielding.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +1 | Passive |
| Barrier | 200 | Active (4s) |
| Active Cooldown | 60s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 200 barrier on-demand burst soak | 100 (shield HP) | 0.6 | adds | Full 200 HP soak per cast; ~100 effective per fight. |
| `high_max_hp` | T1 Vit baseline + barrier-as-HP | 27 (HP) | 0.2 | adds | 19 baseline + 8 effective shield HP. |
| `self_buff` | self-cast active | 35 (% importance) | 1.0 | adds | Self-only. |
| `escape` | reactive barrier covers retreat | 40 (% importance) | 0.8 | adds | Panic-button defense. |
| `self_heal` | +1 OOC × 30s | 30 (HP total) | 0.3 | adds | Small OOC. |


---

## Healing Rite
- **normalized_name**: `healing_rite` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health_stimpak`
- **wiki**: https://deadlock.wiki/Healing_Rite

### Interpretation
Self-OR-ally cast heal: 300 HP regen over 20s + +2m sprint while channeling, 30m cast range, 70s CD. Per Notes: dispelled if you take damage (even through barriers). Per description: "Can be self-cast." T1 utility-heal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Total HP Regen | 300 | Active (over 20s) |
| Sprint Speed Conditional | +2m | Active (while channeling) |
| Regen Duration | 20s | Active |
| Cast Range | 30m | Active |
| Cooldown | 70s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 300 HP × ~0.67 self-cast share | 200 (HP total) | 2.0 | adds | Self-cast dominant. |
| `team_heal` | 300 HP × ~0.33 ally-cast share | 100 (HP total) | 0.6 | adds | Ally-cast option per description. |
| `continous_heal` | 300/20s = 15 HP/s outside 1s | 285 (HP outside 1s) | 2.0 | adds | Most heal is over 19s. |
| `burst_heal` | first-1s tick | 15 (HP within 1s) | 0.2 | adds | Small initial. |
| `assist_importance` | ally-cast utility heal | 70 (% importance) | 1.6 | adds | R27. |
| `horizontal_mobility` | +2m sprint × channel-only ×0.5 | 1.0 (m/s eff) | 1.4 | adds | Channel-only discount. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) | 0.2 | adds | R31. |
| `counter_importance` | reactive heal vs poke | 35 (% importance) | 0.7 | adds | R13. |


---

## Melee Lifesteal
- **normalized_name**: `melee_lifesteal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_lifestrike_gauntlets`
- **wiki**: https://deadlock.wiki/Melee_Lifesteal

### Interpretation
Melee-flavored sustain: +12% Melee Damage, 100 heal on melee hit (8s CD; 1.5× longer for Light Melee, 30% effective vs non-heroes). T1 melee-brawler anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +12% | Passive |
| Heal on Melee Hit | 100 | Passive (8s CD, Heavy; 12s Light) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +12% direct | 12 (eff melee-dmg %) | 1.1 | adds | Direct passive. |
| `self_heal` | 100 HP per proc × ~1.5 procs/fight | 150 (HP total) | 1.5 | adds | Sustained melee sustain. |
| `burst_heal` | 100 HP within 1s of proc | 100 (HP within 1s) | 1.1 | adds | Instant on contact. |
| `close_range` | melee-gated entirely | 90 (% importance) | 1.9 | adds | R21: melee = close. |
| `engage` | melee commits a fight | 65 (% importance) | 1.4 | adds | R11. |
| `grounded` | melee is grounded | 45 (% importance) | 1.8 | adds | R7. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) | 0.2 | adds | R31. |


---

## Rebuttal
- **normalized_name**: `rebuttal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_melee_rebuttal`
- **wiki**: https://deadlock.wiki/Rebuttal

### Interpretation
Parry-focused reactive kit: -1.75s Parry CD, +18% Melee Resist, +75 HP. On successful Parry vs hero: heal damage parried + return that damage + +30% damage 6s. Per Notes: procs vs Viscous' Puddle Punch; does NOT proc when parrying through Counterspell.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Parry Cooldown | -1.75s | Passive |
| Melee Resist | +18% | Passive |
| Bonus Health | +75 | Passive |
| Bonus Damage Conditional | +30% | Passive (on parry, 6s) |
| Buff Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_resistance` | +18% direct | 18 (eff %) | 1.8 | adds | Direct passive. |
| `high_max_hp` | T1 Vit baseline + 75 HP | 94 (HP) | 0.8 | adds | 19 + 75. |
| `self_heal` | parry heals = ~60 HP per typical fight | 60 (HP total) | 0.6 | adds | Reactive heal on parry. |
| `burst_heal` | parry heal lands instantly | 60 (HP within 1s) | 0.6 | adds | Single-instance on parry. |
| `counter_importance` | parry counter to melee/abilities | 45 (% importance) | 0.9 | adds | R13. |
| `engage` | parry commits a melee read | 45 (% importance) | 1.0 | adds | R11: parry-read commits. |
| `grounded` | parry is grounded | 40 (% importance) | 1.6 | adds | R7. |


---

## Sprint Boots
- **normalized_name**: `sprint_boots` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_sprint_booster`
- **wiki**: https://deadlock.wiki/Sprint_Boots

### Interpretation
Mobility stat stick: +2m Sprint Speed, +2 OOC Regen. Pure map-rotation enabler — every hero buys some flavor of mobility, and this is the T1 anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +2m | Passive |
| Out of Combat Regen | +2 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m sprint direct | 1.4 (m/s eff) | 2.0 | adds | ⚖️ T1 horizontal_mobility anchor. |
| `self_heal` | +2 OOC × 20s OOC | 40 (HP total) | 0.4 | adds | Small OOC tick. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) | 0.2 | adds | R31. |
| `farmer` | mobility = farm rotation | 40 (% importance) | 0.8 | adds | R28: T1 mobility-farmer. |
| `escape` | mobility = escape | 40 (% importance) | 0.8 | adds | R14. |


---

## Extra Charge
- **normalized_name**: `extra_charge` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_extra_charge`
- **wiki**: https://deadlock.wiki/Extra_Charge

### Interpretation
Charge-stacker: +1 Bonus Ability Charge for charged abilities, +7 Bonus SP for Charged Abilities. Per Notes: only affects abilities that are already charged (or become charged via upgrades). T1 charge_dependant anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Ability Charges | +1 | Passive (charged abilities only) |
| Bonus Spirit Power for Charged Abilities | +7 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +1 charge on charged abilities | 70 (% importance) | 1.5 | adds | ⚖️ Named T1 charge_dependant anchor. |
| `spirit_damage` | +7 SP on charged abilities + T1 baseline | 9 (SP-equiv) | 0.5 | adds | 4.3 baseline + ~5 conditional. |
| `ability_spam` | +1 charge enables more casts | 35 (% importance) | 0.9 | adds | R20. |
| `single_ability_focus` | rewards your key charged ability | 45 (% importance) | 1.1 | adds | R17: charged-ability-flavored. |


---

## Extra Spirit
- **normalized_name**: `extra_spirit` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_improved_spirit`
- **wiki**: https://deadlock.wiki/Extra_Spirit

### Interpretation
Pure SP stat stick: +10 Spirit Power. T1 baseline spirit-damage stick — lifts every spirit ability.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +10 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +10 SP direct + T1 baseline | 14 (SP-equiv) | 0.7 | adds | ⚖️ T1 spirit_damage anchor. 4.3 baseline + 10 explicit. |
| `spirit_burst_damage` | SP lifts spirit burst | 15 (raw dmg within 1s) | 0.4 | adds | R2: SP lifts spirit burst. |
| `spirit_continuous_damage` | SP lifts continuous | 15 (raw dmg outside 1s) | 0.3 | adds | R2 symmetric. |


---

## Golden Goose Egg
- **normalized_name**: `golden_goose_egg` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_goose_egg`
- **wiki**: https://deadlock.wiki/Golden_Goose_Egg

### Interpretation
Soul-bank consumable: -10% Damage Penalty (sold-out cost), +1m Sprint, +1 OOC Regen. Bank value grows at 90 souls/min; hatch grants a permanent buff per 80 souls accrued. Held for late-game payoff (per Notes: 4m 27s to break even on cost). ⚖️ Named scaling_late anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage Penalty | -10% | Passive (drawback while held — meant to be sold) |
| Sprint Speed | +1m | Passive |
| Out of Combat Regen | +1 | Passive |
| Soul Value per Minute | 90 | Active (hatch on demand) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `scaling_late` | bank souls + hatch into permanent buffs late game | 80 (% importance) | 2.0 | adds | ⚖️ Named scaling_late anchor T1 — peaks late. |
| `farmer` | soul income | 60 (% importance) | 1.2 | adds | R28: greedy soul-economy item. |
| `spirit_damage` | T1 Spirit baseline | 4.3 (SP-equiv) | 0.2 | adds | R31 baseline only — meant to be sold, skip negative side effects. |
| `horizontal_mobility` | +1m sprint | 0.7 (m/s eff) | 1.0 | adds | Direct. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) | 0.2 | adds | Small OOC. |
| `single_target` | hatch is single-cast | 25 (% importance) | 0.8 | adds | Self-affecting only. |


---

## Mystic Burst
- **normalized_name**: `mystic_burst` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_magic_burst`
- **wiki**: https://deadlock.wiki/Mystic_Burst

### Interpretation
Charge-Up spirit burst proc: abilities dealing >80 spirit damage trigger +40 bonus spirit damage. Per Notes: triggers off spirit damage only (NOT weapon-dmg abilities like Venator's Consecrating Grenade). T1 spirit-burst anchor for early-peak casters.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Damage | 40 | Passive (Charge-Up; triggers if ability dmg > 80) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 40 bonus dmg per qualifying ability hit | 40 (raw dmg within 1s) | 1.1 | adds | ⚖️ T1 spirit burst-flavor anchor. |
| `spirit_burst_proc` | per-ability burst proc | 0.50 (proc index) | 1.1 | adds | R6: per-ability instant trigger, gated by 80-dmg threshold. |
| `spirit_damage` | T1 baseline + proc-equiv | 7 (SP-equiv) | 0.4 | adds | 4.3 baseline + ~2.5 proc-equiv. |
| `scaling_early` | greedy early-game spirit caster | 65 (% importance) | 1.9 | adds | ⚖️ Named scaling_early anchor — peaks early. |
| `charge_dependant` | Charge-Up mechanic per Notes | 50 (% importance) | 1.1 | adds | Charge-up flavor. |
| `single_ability_focus` | best when one big ability triggers it | 35 (% importance) | 0.9 | adds | R17: per-cast trigger. |


---

## Mystic Expansion
- **normalized_name**: `mystic_expansion` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_magic_reach`
- **wiki**: https://deadlock.wiki/Mystic_Expansion

### Interpretation
Imbued range extender: +20% Ability Range and effect radius on one imbued ability. T1 range-extender anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +20% | Passive (imbued, single ability) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +20% direct | 20 (eff %) | 2.0 | adds | ⚖️ Named T1 range-extender anchor. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) | 0.2 | adds | R31. |
| `single_ability_focus` | imbues exactly one ability | 60 (% importance) | 1.5 | adds | R17: imbue is single-ability. |


---

## Mystic Regeneration
- **normalized_name**: `mystic_regeneration` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_mystic_regeneration`
- **wiki**: https://deadlock.wiki/Mystic_Regeneration

### Interpretation
Spirit-damage-triggered regen: +50 HP. Dealing spirit damage to enemy heroes grants 4 HP/s regen for 7s (stacks per distinct enemy hit). T1 sustained-poke healer.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Regen | 4 HP/s | Passive (on spirit damage to hero) |
| Regen Duration | 7s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 4 HP/s × 7s × ~2 stacks avg | 56 (HP total) | 0.6 | adds | Spirit-poke sustain. |
| `continous_heal` | regen outside 1s | 24 (HP outside 1s) | 0.2 | adds | 4 × 6s × 0.75 uptime. |
| `burst_heal` | first-1s tick | 4 (HP within 1s) | 0.0 | adds | One tick. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) | 0.2 | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) | 0.4 | adds | Explicit. |
| `farmer` | sustained spirit-poke farmer | 45 (% importance) | 0.9 | adds | R28. |
| `mid_range` | spirit-poke range typical | 25 (% importance) | 1.1 | adds | Caster-range identity. |


---

## Rusted Barrel
- **normalized_name**: `rusted_barrel` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_withering_whip`
- **wiki**: https://deadlock.wiki/Rusted_Barrel

### Interpretation
Targeted anti-gun debuff: +60 HP, +0.5m Sprint. Active (16s CD): -32% Fire Rate, -8% Bullet Resist on target for 5s, 32m cast range. T1 anti-DPS counter tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +60 | Passive |
| Sprint Speed | +0.5m | Passive |
| Fire Rate Conditional | -32% | Active (5s on target) |
| Bullet Resist Conditional | -8% | Active (5s on target) |
| Cast Range | 32m | Active |
| Duration | 5s | Active |
| Cooldown | 16s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -32% × 5s × 1 target × (5/16) uptime | 15 (eff slow %) | 1.5 | adds | ⚖️ T1 fire_rate_slow anchor. |
| `bullet_resist_shred` | -8% × (5/16) uptime | 2.5 (eff shred %) | 0.6 | adds | Active uptime. |
| `counter_importance` | dedicated anti-gun debuff | 55 (% importance) | 1.1 | adds | R13. |
| `single_target` | per-target debuff | 50 (% importance) | 1.5 | adds | Cast on one enemy. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) | 0.2 | adds | R31. |
| `high_max_hp` | +60 HP (Spirit, no Vit baseline) | 60 (HP) | 0.5 | adds | Explicit. |
| `horizontal_mobility` | +0.5m sprint | 0.35 (m/s eff) | 0.5 | adds | Direct. |


---

## Spirit Strike
- **normalized_name**: `spirit_strike` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_acolytes_glove`
- **wiki**: https://deadlock.wiki/Spirit_Strike

### Interpretation
Melee-triggered spirit proc: on Light/Heavy melee vs hero, +40+0.37×SP spirit damage + -6% Spirit Resist 6s. CD = 8s (Heavy), 16s (Light). T1 melee-spirit hybrid.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage | 40 + 0.37×SP | Passive (on melee vs hero) |
| Spirit Resist Conditional | -6% | Passive (6s debuff) |
| Duration | 6s | — |
| Cooldown | 8s (Heavy), 16s (Light) | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 40 + 0.37×20 = 47 within 1s | 47 (raw dmg within 1s) | 1.3 | adds | Per-melee burst. |
| `spirit_burst_proc` | per-melee proc | 0.50 (proc index) | 1.1 | adds | R6: melee instant-trigger, 8s CD. |
| `spirit_resist_shred` | -6% × melee-uptime ~0.4 | 3 (eff shred %) | 0.6 | adds | Melee-gated. |
| `spirit_damage` | T1 baseline + proc-equiv | 9 (SP-equiv) | 0.5 | adds | 4.3 baseline + 5 proc-equiv. |
| `melee_damage` | melee-triggered effects lift melee | 8 (eff melee-dmg %) | 0.7 | adds | R12. |
| `close_range` | melee-gated | 75 (% importance) | 1.6 | adds | R21. |
| `engage` | melee commits | 50 (% importance) | 1.1 | adds | R11. |
| `grounded` | melee is grounded | 40 (% importance) | 1.6 | adds | R7. |


---

# T2 (1600 souls)

## Active Reload
- **normalized_name**: `active_reload` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_active_reload`
- **wiki**: https://deadlock.wiki/Active_Reload

### Interpretation
Active-triggered reload + 7s buff window: +20% Max Ammo passive. On hitting the highlighted reload window: instant reload + +25% Fire Rate + +16% Bullet Lifesteal + +0.75m Move Speed for 7s (12s CD). Per Notes: skill-gated — miss the window and the item fails. T2 gun-burst enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Fire Rate Conditional | +25% | Active (7s after instant reload) |
| Bullet Lifesteal Conditional | +16% | Active (7s) |
| Move Speed | +0.75m | Active (7s) |
| Buff Duration | 7s | Active |
| Cooldown | 12s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +25% × (7/12) buff uptime | 15 (eff %) | 1.5 | adds | Mid uptime on skill check. |
| `bullet_damage` | T2 baseline + FR-derived | 14 (eff gun-dmg %) | 0.5 | adds | 7.2 baseline + ~7 FR-derived. |
| `bullet_lifesteal` | +16% × (7/12) | 9 (eff %) | 1.4 | adds | Window-gated. |
| `gun_burst_damage` | FR burst lift | 60 (raw dmg within 1s) | 1.2 | adds | R2: FR primarily lifts burst. |
| `gun_continuous_damage` | sustained gun + mag | 20 (raw dmg outside 1s) | 0.4 | adds | R2 lighter + mag depth. |
| `magazine_size_dependant` | +20% direct + instant reload | 25 (eff ammo %) | 0.5 | adds | Direct + reload skip. |
| `horizontal_mobility` | +0.75m × (7/12) | 0.4 (m/s eff) | 0.4 | adds | Active mobility. |
| `self_heal` | bullet lifesteal sustain | 80 (HP total) | 0.5 | adds | Lifesteal-driven. |
| `farmer` | reload skip helps wave clear | 35 (% importance) | 0.7 | adds | R28. |


---

## Fleetfoot
- **normalized_name**: `fleetfoot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_fleetfoot_boots`
- **wiki**: https://deadlock.wiki/Fleetfoot

### Interpretation
Mobility-flavored Weapon kit: +6% Weapon Damage, +35% Slide Distance, +6% Bullet Resist. Active (16s CD): +3m Move Speed + +40% Slow Resist for 5s. Hybrid mobility + escape tool worn on guns.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Slide Distance | +35% | Passive |
| Bullet Resist | +6% | Passive |
| Move Speed Conditional | +3m | Active (5s) |
| Slow Resist | +40% | Active (5s) |
| Cooldown | 16s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +3m × (5/16) uptime + slide passive | 1.3 (m/s eff) | 1.2 | adds | Direct mobility burst. |
| `bullet_damage` | +6% direct + T2 baseline | 13 (eff gun-dmg %) | 0.5 | adds | 7.2 baseline + 6 explicit. |
| `cc_resist` | +40% × (5/16) slow resist | 12 (eff %) | 0.8 | adds | Active-only slow resist. |
| `bullet_resistance` | +6% direct | 6 (eff %) | 0.5 | adds | Direct. |
| `escape` | mobility + slow resist | 60 (% importance) | 1.1 | adds | ⚖️ Dual mobility tool. |
| `engage` | active dive ability | 40 (% importance) | 0.9 | adds | R11. |
| `counter_importance` | counter to slow comps | 35 (% importance) | 0.7 | adds | R13. |
| `gun_continuous_damage` | sustained gun lift | 15 (raw dmg outside 1s) | 0.3 | adds | R2. |


---

## Intensifying Magazine
- **normalized_name**: `intensifying_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_intensifying_clip`
- **wiki**: https://deadlock.wiki/Intensifying_Magazine

### Interpretation
Sustained-fire ramp gun stick: +20% Max Ammo. Holding Fire ramps +0% → +45% Weapon Damage over 2.5s. Per Mechanics: some abilities flag "firing" while not shooting, letting you pre-charge before fights. T2 sustained-DPS anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Max Weapon Damage Conditional | 45% | Passive (after 2.5s holding Fire) |
| Time for Max Damage | 2.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +45% × ~0.55 ramp uptime + T2 baseline | 32 (eff gun-dmg %) | 1.2 | adds | ⚖️ Strong sustained gun amp. |
| `gun_continuous_damage` | full ramp lives in continuous window | 70 (raw dmg outside 1s) | 1.4 | adds | ⚖️ T2 named gun_continuous anchor. |
| `gun_burst_damage` | 1s mark gets ~18% partial ramp | 25 (raw dmg within 1s) | 0.5 | adds | R2: pre-charge enables burst. |
| `magazine_size_dependant` | +20% Max Ammo | 20 (eff ammo %) | 0.4 | adds | Direct. |
| `farmer` | sustained ramp helps wave clear | 50 (% importance) | 1.0 | adds | R28. |


---

## Kinetic Dash
- **normalized_name**: `kinetic_dash` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_kinetic_sash`
- **wiki**: https://deadlock.wiki/Kinetic_Dash

### Interpretation
Dash-jump triggered fire-rate burst: +1 Stamina, +12% Stamina Recovery. On Dash-Jump: +25% Fire Rate + 6 temp ammo for 7s (or until next reload). Aerial-DPS enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Fire Rate Conditional | +25% | Passive (Dash-Jump, 7s) |
| Temporary Ammo Conditional | +6 | Passive |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +25% × ~0.5 dash-uptime | 13 (eff %) | 1.3 | adds | Mid uptime — dash-gated. |
| `bullet_damage` | T2 baseline + FR-derived | 13 (eff gun-dmg %) | 0.5 | adds | 7.2 baseline + 6 FR-derived. |
| `gun_burst_damage` | FR burst window after dash | 55 (raw dmg within 1s) | 1.1 | adds | R2: FR lifts burst. |
| `aerial` | dash-jump triggered | 70 (% importance) | 1.6 | adds | ⚖️ Named aerial trigger. |
| `vertical_mobility` | +1 stamina + recovery + dash-trigger reward | 2.5 (units) | 1.3 | adds | Direct mobility synergy. |
| `horizontal_mobility` | stamina-dash | 0.7 (m/s eff) | 0.7 | adds | Stamina-derived. |
| `magazine_size_dependant` | +6 temp ammo per dash | 12 (eff ammo %) | 0.2 | adds | Temporary ammo. |


---

## Long Range
- **normalized_name**: `long_range` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_long_range`
- **wiki**: https://deadlock.wiki/Long_Range

### Interpretation
Distance-gated gun amp: +8% Weapon Fall-off Range, +0.75m Sprint Speed. +40% Weapon Damage when target is beyond 15m. T2 long-range gun anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Fall-off Range | +8% | Passive |
| Sprint Speed | +0.75m | Passive |
| Weapon Damage Conditional | +40% | Passive (>15m) |
| Min. Distance | 15m | Trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | gun-amp >15m gating | 70 (% importance) | 1.6 | adds | ⚖️ Named long_range T2 anchor. |
| `bullet_damage` | +40% × ~0.5 long uptime + T2 baseline | 27 (eff gun-dmg %) | 1.0 | adds | 7.2 baseline + 20 effective. |
| `gun_continuous_damage` | sustained long-range fire | 35 (raw dmg outside 1s) | 0.7 | adds | R2. |
| `gun_burst_damage` | per-shot long amp | 25 (raw dmg within 1s) | 0.5 | adds | R2. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) | 0.5 | adds | Small mobility. |


---

## Melee Charge
- **normalized_name**: `melee_charge` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_melee_charge`
- **wiki**: https://deadlock.wiki/Melee_Charge

### Interpretation
Heavy-melee amp: +50% Heavy Melee Distance, +10% Melee Damage, +6% Bullet Resist. +25% Bonus Heavy Damage on next Heavy Melee (5s CD). T2 heavy-melee setup tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +50% | Passive |
| Melee Damage | +10% | Passive |
| Bullet Resist | +6% | Passive |
| Bonus Heavy Damage | +25% | Passive (next heavy, 5s CD) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +10% + 25% on Heavy/5s | 20 (eff melee-dmg %) | 1.2 | adds | 10 direct + ~10 effective Heavy-on-CD. |
| `bullet_damage` | T2 baseline (Weapon item, no Vit baseline) | 7.2 (eff gun-dmg %) | 0.3 | adds | R31 baseline only. |
| `bullet_resistance` | +6% direct | 6 (eff %) | 0.5 | adds | Direct. |
| `close_range` | melee-gated | 85 (% importance) | 1.8 | adds | R21. |
| `engage` | heavy melee = engage | 65 (% importance) | 1.4 | adds | R11. |
| `grounded` | melee is grounded | 45 (% importance) | 1.8 | adds | R7. |


---

## Mystic Shot
- **normalized_name**: `mystic_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_crackshot`
- **wiki**: https://deadlock.wiki/Mystic_Shot

### Interpretation
Hybrid gun-spirit bullet proc: +7 Spirit Power, next bullet deals +40+1.2×SP bonus spirit damage (8s CD). Per Notes: creates an additional purple bullet that mimics the regular shot. Cannot crit, immune to evasion. T2 hybrid_damage_usage anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Spirit Damage | 40 + 1.2×SP | Passive (next bullet, 8s CD) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | gun-triggered spirit burst | 75 (% importance) | 1.5 | adds | ⚖️ Named hybrid anchor. |
| `spirit_burst_damage` | 40+1.2×30 = 76 within 1s | 76 (raw dmg within 1s) | 1.4 | adds | Per-bullet spirit chunk. |
| `spirit_burst_proc` | per-bullet on 8s CD | 0.40 (proc index) | 0.9 | adds | R6: per-bullet, 8s gate. |
| `spirit_damage` | +7 SP + proc-equiv (Weapon, no Spirit baseline) | 17 (SP-equiv) | 0.6 | adds | 7 explicit + 10 proc-equiv. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) | 0.3 | adds | R31. |
| `counter_importance` | immune to evasion | 35 (% importance) | 0.7 | adds | Per Notes — bypasses evasion. |
| `single_target` | per-bullet single-target | 40 (% importance) | 1.2 | adds | Per-shot proc. |


---

## Opening Rounds
- **normalized_name**: `opening_rounds` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_pristine_emblem`
- **wiki**: https://deadlock.wiki/Opening_Rounds

### Interpretation
Above-50%-HP gun amp: +60% Bullet Velocity, +8% Weapon Damage, +4 Spirit Power. +30% Weapon Damage when enemy is above 50% health. T2 burst-opener — peaks before the enemy is wounded.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Spirit Power | +4 | Passive |
| Weapon Damage Conditional | +30% | Passive (enemy above 50% HP) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% + 30% × ~0.5 (>50% HP window) + T2 baseline | 30 (eff gun-dmg %) | 1.1 | adds | 7.2 + 8 + 15. |
| `gun_burst_damage` | per-shot opener amp | 50 (raw dmg within 1s) | 1.0 | adds | R2: opener-burst. |
| `gun_continuous_damage` | sustained till target dropped | 30 (raw dmg outside 1s) | 0.6 | adds | R2 lighter. |
| `scaling_early` | rewards committing to opener | 50 (% importance) | 1.4 | adds | Opens-fight flavor. |
| `engage` | opener-amp = first-engage tool | 50 (% importance) | 1.1 | adds | R11. |
| `long_range` | +60% velocity favors range | 30 (% importance) | 0.7 | adds | Velocity-aided. |


---

## Recharging Rush
- **normalized_name**: `recharging_rush` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_rechargingbullets`
- **wiki**: https://deadlock.wiki/Recharging_Rush

### Interpretation
Gun-damage triggered charge refresh: +20% Max Ammo, +10% Weapon Damage. Dealing 200 weapon damage in 3.5s replenishes a charge on each of your charged abilities (25s CD). Per Affected Abilities list: helps multi-charge spell heroes (Mirage, Shiv, Holliday, etc.). Bridge between gun output and ability uptime.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Weapon Damage | +10% | Passive |
| Damage Threshold | 200 | Passive (in 3.5s window) |
| Cooldown | 25s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +10% direct + T2 baseline | 17 (eff gun-dmg %) | 0.6 | adds | 7.2 + 10. |
| `magazine_size_dependant` | +20% Max Ammo | 20 (eff ammo %) | 0.4 | adds | Direct. |
| `ability_spam` | charge refresh on weapon dmg | 55 (% importance) | 1.5 | adds | R20: enables more ability uses. |
| `charge_dependant` | only useful on charged abilities | 50 (% importance) | 1.1 | adds | Direct mechanic. |
| `cooldown_reduction` | charge refresh ≈ effective CDR | 14 (eff CDR %) | 1.3 | adds | Conditional CDR via gun dmg. |
| `gun_continuous_damage` | sustained gun amp | 25 (raw dmg outside 1s) | 0.5 | adds | R2. |
| `hybrid_damage_usage` | gun output enables abilities | 50 (% importance) | 1.0 | adds | Gun-ability bridge. |


---

## Slowing Bullets
- **normalized_name**: `slowing_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_slowing_bullets`
- **wiki**: https://deadlock.wiki/Slowing_Bullets

### Interpretation
Bullet build-up slow: +15% Weapon Damage. Bullets build to -30% Move Speed + -22% Dash Distance for 3.5s. Per Notes: 2–10 shots to proc by hero.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Move Speed Conditional | -30% | Passive (3.5s after buildup) |
| Dash Distance | -22% | Passive |
| Slow Duration | 3.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% × 3.5s × on-bullet uptime ~0.7 | 25 (eff slow weighted) | 1.1 | adds | ⚖️ T2 movement_slow gun anchor. |
| `bullet_damage` | +15% + T2 baseline | 22 (eff gun-dmg %) | 0.8 | adds | 7.2 + 15. |
| `counter_importance` | slow vs mobile heroes | 40 (% importance) | 0.8 | adds | R13. |
| `gun_continuous_proc` | per-bullet buildup | 0.20 (proc index) | 0.3 | adds | R6: per-bullet. |
| `single_target` | per-bullet single-target | 35 (% importance) | 1.1 | adds | Per-shot. |
| `mid_range` | gun-range slow | 25 (% importance) | 1.1 | adds | Standard rifle range. |


---

## Spirit Shredder Bullets
- **normalized_name**: `spirit_shredder_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_tech_defense_shredders`
- **wiki**: https://deadlock.wiki/Spirit_Shredder_Bullets

### Interpretation
Bullet spirit-resist debuff + team spirit lifesteal: passive bullets/melee → -8% Spirit Resist + +10% Spirit Lifesteal (you AND allies) on target for 8s. Per Notes: lifesteal is flat — bypasses diminishing returns. T2 hybrid-team enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist Conditional | -8% | Passive (8s debuff) |
| Spirit Lifesteal Conditional | +10% | Passive (you + allies vs target) |
| Debuff Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% × ~0.85 uptime | 7 (eff shred %) | 1.0 | adds | ⚖️ T2 spirit_resist_shred gun anchor. |
| `spirit_lifesteal` | +10% flat (skips DR) for you AND allies | 14 (eff %) | 2.0 | adds | Team-share lifesteal. |
| `hybrid_damage_usage` | gun bullet enables spirit-DPS | 60 (% importance) | 1.2 | adds | Gun-spirit bridge. |
| `ally_buff` | grants lifesteal to allies | 50 (% importance) | 1.2 | adds | R24: team benefit. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) | 0.3 | adds | R31. |
| `gun_continuous_proc` | per-bullet debuff | 0.20 (proc index) | 0.3 | adds | R6: per-bullet. |
| `counter_importance` | vs spirit-resist tanks | 45 (% importance) | 0.9 | adds | R13. |


---

## Split Shot
- **normalized_name**: `split_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_split_shot`
- **wiki**: https://deadlock.wiki/Split_Shot

### Interpretation
Active 5-shot multishot + stack-ramp gun amp: 5-bullet multishot for 5s (27s CD); hitting 2+ heroes per multishot grants stacking +8% WD per stack (max 5 stacks, 12s). Per Notes: ~20° total spread. Special for Celeste (3 shots, 70° spread).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Multishot Conditional | 5 | Active (5s) |
| Weapon Damage per Stack | +8% | Active (max 5 stacks) |
| Buff Duration | 5s | Active |
| Max Stacks | 5 | Active |
| Stack Duration | 12s | — |
| Cooldown | 27s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% × ~3 typical stacks + T2 baseline | 31 (eff gun-dmg %) | 1.2 | adds | 7.2 baseline + ~24 stack effective. |
| `aoe_cluster` | 5-shot multishot hits crowds | 60 (% importance) | 1.5 | adds | Multishot crowd amp. |
| `gun_burst_damage` | 5-shot per-trigger burst | 70 (raw dmg within 1s) | 1.4 | adds | R2: multishot burst. |
| `gun_continuous_damage` | sustained gun ramp | 35 (raw dmg outside 1s) | 0.7 | adds | R2. |
| `farmer` | multishot helps wave clear | 45 (% importance) | 0.9 | adds | R28. |


---

## Stalker
- **normalized_name**: `stalker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_weapon_backstabber`
- **wiki**: https://deadlock.wiki/Stalker

### Interpretation
Close-range stealth-flavored hybrid: -50% Footstep Sound, +50 HP. On weapon damage at <8m: +1.5m MS + opens a wound on target (17 DPS spirit DoT, -6% Bullet Resist, wall-reveal for 5s). Per Notes: triggers off any physical/melee ability damage. T2 close-range tracker.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Footstep Sound Distance | -50% | Passive |
| Bonus Health | +50 | Passive |
| Damage Per Second | 17 | Passive (spirit DoT, 5s) |
| Bullet Resist Conditional | -6% | Passive (5s on target) |
| Move Speed Conditional | +1.5m | Passive (5s buff) |
| Close Range | 8m | Trigger |
| Cooldown | 6s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `dot` | 17 DPS × 5s = 85 spirit DoT | 85 (eff dmg) | 1.0 | adds | ⚖️ Strong T2 DoT trigger. |
| `close_range` | <8m trigger | 80 (% importance) | 1.7 | adds | Close-gated. |
| `spirit_continuous_damage` | sustained DoT outside 1s | 70 (raw dmg outside 1s) | 0.9 | adds | R2: DoT continuous. |
| `spirit_burst_damage` | first-1s DoT tick | 17 (raw dmg within 1s) | 0.3 | adds | Initial. |
| `bullet_resist_shred` | -6% × ~0.7 uptime | 4 (eff shred %) | 0.7 | adds | Close-gated. |
| `horizontal_mobility` | +1.5m × (5/6) trigger uptime | 1.2 (m/s eff) | 1.1 | adds | High uptime on weapon dmg. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) | 0.3 | adds | R31. |
| `engage` | close-range commit + tracker | 60 (% importance) | 1.3 | adds | R11. |
| `high_max_hp` | +50 HP (Weapon, no Vit baseline) | 50 (HP) | 0.3 | adds | Explicit. |
| `counter_importance` | wall-reveal counters stealth | 50 (% importance) | 1.0 | adds | R13. |


---

## Swift Striker
- **normalized_name**: `swift_striker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_blitz_bullets`
- **wiki**: https://deadlock.wiki/Swift_Striker

### Interpretation
Pure fire-rate + mobility stick: +20% Fire Rate, +0.75m Sprint Speed. T2 named fire_rate anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +20% | Passive |
| Sprint Speed | +0.75m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +20% direct | 20 (eff %) | 2.0 | adds | ⚖️ T2 named fire_rate anchor. |
| `bullet_damage` | T2 baseline + FR-derived | 17 (eff gun-dmg %) | 1.4 | adds | 7.2 + ~10. |
| `gun_burst_damage` | FR primarily lifts burst | 75 (raw dmg within 1s) | 2.0 | adds | R2. |
| `gun_continuous_damage` | FR lighter on continuous | 20 (raw dmg outside 1s) | 1.6 | adds | R2. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) | 0.5 | adds | Direct. |


---

## Titanic Magazine
- **normalized_name**: `titanic_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_titan_round`
- **wiki**: https://deadlock.wiki/Titanic_Magazine

### Interpretation
Pure ammo + WD stick: +100% Max Ammo, +14% Weapon Damage. T2 magazine_size anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +100% | Passive |
| Weapon Damage | +14% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +100% direct | 100 (eff ammo %) | 2.0 | adds | ⚖️ Named T2 magazine_size anchor. |
| `bullet_damage` | +14% direct + T2 baseline | 21 (eff gun-dmg %) | — | adds | 7.2 + 14. |
| `gun_continuous_damage` | mag depth + per-shot WD | 60 (raw dmg outside 1s) | — | adds | R2: mag-heavy. |
| `gun_burst_damage` | per-shot WD lift | 25 (raw dmg within 1s) | — | adds | R2 lighter. |
| `farmer` | huge ammo helps wave clear | 50 (% importance) | 1.0 | adds | R28. |


---

## Weakening Headshot
- **normalized_name**: `weakening_headshot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_headshot_booster2`
- **wiki**: https://deadlock.wiki/Weakening_Headshot

### Interpretation
Headshot-gated debuff: +60 HP. Headshot → -13% Bullet Resist on target for 12s. T2 headshot-driven resist shred.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +60 | Passive |
| Bullet Resist Conditional | -13% | Passive (on headshot, 12s) |
| Debuff Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -13% × ~0.7 headshot uptime | 9 (eff shred %) | 1.5 | adds | Headshot-gated. |
| `headshot_damage` | headshot-trigger pure-skill | 55 (% importance) | 1.3 | adds | R29. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) | 0.3 | adds | R31. |
| `single_target` | per-headshot single-target | 45 (% importance) | 1.4 | adds | Per-target debuff. |
| `mid_range` | headshot range | 30 (% importance) | 1.3 | adds | Headshot tool. |
| `high_max_hp` | +60 HP (Weapon, no Vit baseline) | 60 (HP) | 0.3 | adds | Explicit. |
| `counter_importance` | shred vs bulky targets | 35 (% importance) | 0.7 | adds | R13. |


---

## Battle Vest
- **normalized_name**: `battle_vest` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_regenerating_bullet_shield`
- **wiki**: https://deadlock.wiki/Battle_Vest

### Interpretation
Above-65%-HP combat buff: +18% Bullet Resist, +3 OOC Regen. While above 65% HP: +18% Weapon Damage + +7% Fire Rate. T2 healthy-bully kit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +18% | Passive |
| Out of Combat Regen | +3 | Passive |
| Weapon Damage Conditional | +18% | Passive (>65% HP) |
| Fire Rate Conditional | +7% | Passive (>65% HP) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +18% direct | 18 (eff %) | 1.4 | adds | Direct. |
| `bullet_damage` | +18% × ~0.6 healthy uptime (Vit, no Weapon baseline) | 11 (eff gun-dmg %) | 0.4 | adds | Direct conditional only. |
| `fire_rate` | +7% × ~0.6 healthy uptime | 4 (eff %) | 0.4 | adds | Conditional. |
| `gun_burst_damage` | FR+WD burst lift while healthy | 35 (raw dmg within 1s) | 0.7 | adds | R2 healthy-state. |
| `gun_continuous_damage` | sustained healthy fire | 20 (raw dmg outside 1s) | 0.4 | adds | R2. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `self_heal` | +3 OOC × 20s | 60 (HP total) | 0.4 | adds | OOC sustain. |
| `damage_sponge` | rewards staying healthy | 35 (% importance) | 0.7 | adds | R26: healthy-bully. |


---

## Bullet Lifesteal
- **normalized_name**: `bullet_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vampire`
- **wiki**: https://deadlock.wiki/Bullet_Lifesteal_(item)

### Interpretation
Pure bullet sustain stat stick: +13% Bullet Lifesteal, +90 HP, +6% Weapon Damage. T2 bullet_lifesteal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Weapon Damage | +6% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +13% direct | 13 (eff %) | 2.0 | adds | ⚖️ T2 bullet_lifesteal anchor. |
| `bullet_damage` | +6% direct (Vit, no Weapon baseline) | 6 (eff gun-dmg %) | 0.2 | adds | Direct only. |
| `self_heal` | lifesteal sustain | 90 (HP total) | 0.6 | adds | Lifesteal-driven. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) | 0.7 | adds | 22 + 90. |
| `damage_sponge` | lifesteal + HP = sustained tank | 35 (% importance) | 0.7 | adds | R26. |


---

## Debuff Reducer
- **normalized_name**: `debuff_reducer` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_debuff_reducer`
- **wiki**: https://deadlock.wiki/Debuff_Reducer

### Interpretation
Pure debuff-resist stick: +90 HP, +25% Debuff Resist. Reduces duration of all negative effects. T2 anti-CC counter-stick.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +90 | Passive |
| Debuff Resist | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `debuff_resistance` | +25% direct | 25 (eff %) | 2.0 | adds | ⚖️ T2 debuff_resistance anchor. |
| `cc_resist` | debuff resist reduces CC | 18 (eff %) | 1.2 | adds | R13. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) | 0.7 | adds | 22 + 90. |
| `counter_importance` | vs CC-heavy comps | 55 (% importance) | 1.1 | adds | R13. |
| `damage_sponge` | debuff resist + HP | 30 (% importance) | 0.6 | adds | R26. |


---

## Enchanters Emblem
- **normalized_name**: `enchanters_emblem` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_magic_shield`
- **wiki**: https://deadlock.wiki/Enchanters_Emblem

### Interpretation
Above-65%-HP caster kit: +18% Spirit Resist, +2 OOC Regen. While above 65% HP: +15 Spirit Power + +5% Ability CDR. T2 healthy-caster amp.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +18% | Passive |
| Out of Combat Regen | +2 | Passive |
| Spirit Power Conditional | +15 | Passive (>65% HP) |
| Ability Cooldown Reduction | +5% | Passive (>65% HP) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +18% direct | 18 (eff %) | 1.4 | adds | Direct. |
| `spirit_damage` | +15 SP × ~0.6 healthy uptime (Vit, no Spirit baseline) | 9 (SP-equiv) | 0.3 | adds | Conditional only. |
| `cooldown_reduction` | +5% × ~0.6 healthy uptime | 3 (eff CDR %) | 0.3 | adds | Conditional. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `self_heal` | +2 OOC × 20s | 40 (HP total) | 0.3 | adds | OOC. |
| `spirit_burst_damage` | SP lifts spirit burst | 15 (raw dmg within 1s) | 0.3 | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 15 (raw dmg outside 1s) | 0.2 | adds | R2. |
| `damage_sponge` | healthy-bully | 25 (% importance) | 0.5 | adds | R26. |


---

## Enduring Speed
- **normalized_name**: `enduring_speed` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_cardio_calibrator`
- **wiki**: https://deadlock.wiki/Enduring_Speed

### Interpretation
Mobility + slow resist stick: +2m Move Speed, +2 OOC Regen, +25% Slow Resist. Per Notes: slow resist multiplicatively reduces incoming slows by 25% (60% slow → 45%). Also protects vs dash slows. T2 mobility anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Move Speed | +2m | Passive |
| Out of Combat Regen | +2 | Passive |
| Slow Resist | +25% | Passive (also dash slow) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m direct | 1.4 (m/s eff) | 1.3 | adds | Direct. |
| `cc_resist` | +25% slow resist | 18 (eff %) | 1.2 | adds | Slow + dash slow. |
| `counter_importance` | vs slow comps | 50 (% importance) | 1.0 | adds | R13. |
| `escape` | mobility + slow resist | 55 (% importance) | 1.0 | adds | R14. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `self_heal` | +2 OOC × 20s | 40 (HP total) | 0.3 | adds | OOC. |
| `farmer` | mobility = rotations | 35 (% importance) | 0.7 | adds | R28. |


---

## Guardian Ward
- **normalized_name**: `guardian_ward` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_guardian_ward`
- **wiki**: https://deadlock.wiki/Guardian_Ward

### Interpretation
Self-OR-ally cast barrier: +8% Ability Range, +1.5 OOC Regen. Active (60s self / 30s ally): 250 barrier + +2.75m MS for 6s, 40m cast range. Per description: "Can be self-cast." T2 utility-barrier anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +8% | Passive |
| Out of Combat Regen | +1.5 | Passive |
| Barrier Conditional | 250 | Active (6s) |
| Move Speed Conditional | +2.75m | Active |
| Buff Duration | 6s | Active |
| Cast Range | 40m | Active |
| Cooldown | 60s (30s ally-cast) | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 250 × (6/45 avg uptime) | 33 (shield HP) | 0.1 | adds | Active barrier. |
| `assist_importance` | ally-cast halves CD | 65 (% importance) | 1.5 | adds | Ally-cast incentivized. |
| `self_buff` | also self-cast | 45 (% importance) | 1.3 | adds | Self-cast option per description. |
| `team_heal` | 250 barrier on ally | 100 (HP total) | 0.4 | adds | Barrier = effective HP. |
| `ally_buff` | +2.75m MS + barrier | 55 (% importance) | 1.4 | adds | R24. |
| `horizontal_mobility` | +2.75m × (6/45) | 0.4 (m/s eff) | 0.4 | adds | Active uptime. |
| `range_extender_dependant` | +8% direct | 8 (eff %) | 0.5 | adds | Direct. |
| `escape` | barrier + MS escape | 45 (% importance) | 0.9 | adds | R14. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `self_heal` | +1.5 OOC × 20s | 30 (HP total) | 0.2 | adds | Small OOC. |


---

## Healbane
- **normalized_name**: `healbane` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healbane`
- **wiki**: https://deadlock.wiki/Healbane

### Interpretation
Spirit-damage anti-heal + kill bonus: +7 SP. Spirit damage → -35% Healing Reduction for 8s; if enemy dies under effect: +275 heal to you. T2 anti-heal anchor for spirit users.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Healing Reduction Conditional | -35% | Passive (8s on spirit dmg) |
| Heal On Hero Kill | 275 | Passive |
| Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -35% × ~0.7 spirit-dmg uptime | 25 (eff %) | 1.9 | adds | ⚖️ T2 anti_heal anchor. |
| `spirit_damage` | +7 SP (Vit, no Spirit baseline) | 7 (SP-equiv) | 0.2 | adds | Direct. |
| `self_heal` | 275 on kill × ~0.5 kills/fight | 140 (HP total) | 0.9 | adds | Kill-reward heal. |
| `burst_heal` | 275 instant on kill | 275 (HP within 1s) | 2.0 | adds | Instant on kill. |
| `counter_importance` | vs healing-stack comps | 55 (% importance) | 1.1 | adds | R13. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `high_kill_count` | rewards securing kills | 50 (% importance) | 1.4 | adds | Kill-reward. |
| `debuff` | anti-heal debuff | 35 (% importance) | 0.9 | adds | Hard-to-counter. |


---

## Healing Booster
- **normalized_name**: `healing_booster` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healing_booster`
- **wiki**: https://deadlock.wiki/Healing_Booster

### Interpretation
Healing amp: +3 Health Regen, +1 OOC Regen, +20% Healing Effectiveness. Per Notes: amps Bullet/Spirit Lifesteal AND ally heals; doesn't amp constant Health Regen (only temporary regen sources). T2 healing-effectiveness anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +3 | Passive |
| Out of Combat Regen | +1 | Passive |
| Healing Effectiveness | +20% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 3 × 30s + 20% amp on lifesteal | 120 (HP total) | 0.8 | adds | Sustained + amp. |
| `continous_heal` | regen outside 1s | 100 (HP outside 1s) | 0.5 | adds | 3 × ~25s + amp on bullet/spirit lifesteal. |
| `burst_heal` | first-1s tick | 3 (HP within 1s) | 0.0 | adds | Small. |
| `ally_buff` | also amps ally heal received | 45 (% importance) | 1.1 | adds | Per Notes: amps healing applied TO allies. |
| `assist_importance` | helps team heal effectiveness | 35 (% importance) | 0.8 | adds | R27. |
| `counter_importance` | counter to anti-heal debuffs | 40 (% importance) | 0.8 | adds | R13. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `farmer` | regen sustains farm | 30 (% importance) | 0.6 | adds | R28. |


---

## Reactive Barrier
- **normalized_name**: `reactive_barrier` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vex_barrier`
- **wiki**: https://deadlock.wiki/Reactive_Barrier

### Interpretation
CC-triggered barrier: +1 OOC Regen. When Stunned/Chained/Immobilized/Slept/Silenced (55s CD): gain 325 + 1.8×SP barrier for 10s. Per Abilities/items list: triggers off dozens of hero abilities + item actives like Silencer, Knockdown, Curse, etc. T2 anti-CC counter.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +1 | Passive |
| Barrier Conditional | 325 + 1.8×SP | Passive (on CC trigger, 10s) |
| Duration | 10s | — |
| Cooldown | 55s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | (325 + 1.8×20) × (10/55) uptime | 65 (shield HP) | 0.3 | adds | ~360 HP × ~18%. |
| `counter_importance` | dedicated anti-CC | 70 (% importance) | 1.4 | adds | ⚖️ Named anti-CC barrier. |
| `cc_resist` | barrier softens CC dmg | 12 (eff %) | 0.8 | adds | Indirect CC dmg mitigation. |
| `damage_sponge` | barrier soaks burst during CC | 35 (% importance) | 0.7 | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 35 (HP) | 0.2 | adds | 22 + ~13. |
| `escape` | barrier lets you survive CC | 40 (% importance) | 0.8 | adds | R14. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) | 0.1 | adds | Small OOC. |
| `spirit_damage` | barrier scales with SP | 6 (SP-equiv) | — | relies | RELY: scaling matters only with SP. |


---

## Restorative Locket
- **normalized_name**: `restorative_locket` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_restorative_locket`
- **wiki**: https://deadlock.wiki/Restorative_Locket

### Interpretation
Stack-consume burst heal: +10% Spirit Resist. Active (20s CD): when enemy in 35m uses an ability, store a Restoration Stack (16 heal/stack, max 25 = 400 burst); consume stacks to heal + restore up to 3 stamina. Per Notes: only Active Abilities trigger stacks. T2 burst-heal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Heal Per Stack | 16 | Active (20s CD) |
| Max Stacks | 25 (= 400 burst) | Active |
| Max Stamina Restore | 3 | Active |
| Cast Range | 35m | Passive (stack-collection) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `burst_heal` | up to 400 HP instant per consume | 280 (HP within 1s) | 2.0 | adds | ⚖️ T2 burst_heal anchor. ~280 typical with ~18 stacks. |
| `self_heal` | sustained per fight ≈ 280 | 280 (HP total) | 1.9 | adds | Per-fight self-sustain. |
| `vertical_mobility` | stamina-3 restore | 1.5 (units) | 0.8 | adds | Stamina burst. |
| `spirit_resistance` | +10% direct | 10 (eff %) | 0.8 | adds | Direct. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `counter_importance` | counters ability-spam comps | 55 (% importance) | 1.1 | adds | R13: anti-caster heal. |
| `damage_sponge` | big burst heal soaks burst | 40 (% importance) | 0.8 | adds | R26. |


---

## Return Fire
- **normalized_name**: `return_fire` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_return_fire`
- **wiki**: https://deadlock.wiki/Return_Fire

### Interpretation
Damage-reflection active: +10% Bullet Resist. Active (23s CD): for 6.5s, automatically fire bullets back at any attacker — 65% bullet damage returned, 25% spirit damage returned. Per Notes: returns pre-mitigation damage; works even with 100% immunity (e.g. via Metal Skin); doesn't apply buildup procs.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +10% | Passive |
| Bullet Damage Returned | 65% | Active (6.5s) |
| Spirit Damage Returned | 25% | Active (6.5s) |
| Duration | 6.5s | Active |
| Cooldown | 23s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_burst_damage` | reflect 65% bullet within 1s window | 40 (raw dmg within 1s) | 0.8 | adds | Reflect-burst. |
| `bullet_resistance` | +10% direct | 10 (eff %) | 0.8 | adds | Direct. |
| `counter_importance` | counter to focus-fire comps | 60 (% importance) | 1.2 | adds | ⚖️ Reflect-counter anchor. |
| `damage_sponge` | reflect-while-tanky | 45 (% importance) | 0.9 | adds | R26. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) | 0.1 | adds | R31. |
| `engage` | active aggressive option | 35 (% importance) | 0.8 | adds | R11. |
| `self_buff` | active is self-only | 35 (% importance) | 1.0 | adds | Self-only. |


---

## Spirit Lifesteal
- **normalized_name**: `spirit_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_health_stealing_magic`
- **wiki**: https://deadlock.wiki/Spirit_Lifesteal_(item)

### Interpretation
Pure spirit sustain stat stick: +13% Spirit Lifesteal, +90 HP, +6 Spirit Power. T2 spirit_lifesteal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Power | +6 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | +13% direct | 13 (eff %) | 1.9 | adds | ⚖️ T2 spirit_lifesteal anchor. |
| `spirit_damage` | +6 SP (Vit, no Spirit baseline) | 6 (SP-equiv) | 0.2 | adds | Direct. |
| `self_heal` | lifesteal sustain | 90 (HP total) | 0.6 | adds | Lifesteal-driven. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) | 0.7 | adds | 22 + 90. |
| `damage_sponge` | lifesteal + HP | 35 (% importance) | 0.7 | adds | R26. |


---

## Spirit Shielding
- **normalized_name**: `spirit_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_spirit_bubble`
- **wiki**: https://deadlock.wiki/Spirit_Shielding

### Interpretation
Spirit-damage triggered barrier: +2.5 OOC Regen. Passive (45s CD): on taking 225 spirit damage in 3.5s, gain 5× 300 barrier (≈1500 HP) + +18% Spirit Resist for 8s. T2 anti-spirit-burst counter.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2.5 | Passive |
| Barrier | 300 × 5 (= 1500) | Passive (on threshold trigger) |
| Spirit Resist Conditional | +18% | Passive |
| Damage Threshold | 225 (in 3.5s) | — |
| Barrier Duration | 8s | — |
| Cooldown | 45s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 1500 × (8/45) trigger uptime × 0.5 stack avg | 130 (shield HP) | 0.6 | adds | ⚖️ T2 spirit-burst barrier anchor. |
| `spirit_resistance` | +18% × (8/45) | 3 (eff %) | 0.2 | adds | Active uptime. |
| `spirit_burst_resistance` | spirit-burst defense | 35 (eff %) | 1.8 | adds | ⚖️ Named spirit-burst defense. |
| `counter_importance` | dedicated anti-spirit-burst | 65 (% importance) | 1.3 | adds | R13. |
| `damage_sponge` | massive spirit-burst soak | 50 (% importance) | 1.1 | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 50 (HP) | 0.3 | adds | 22 + ~28. |
| `self_heal` | +2.5 OOC × 20s | 50 (HP total) | 0.3 | adds | OOC. |


---

## Weapon Shielding
- **normalized_name**: `weapon_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_weapon_shielding`
- **wiki**: https://deadlock.wiki/Weapon_Shielding

### Interpretation
Weapon-damage triggered barrier: +2.5 OOC Regen. Passive (35s CD): on taking 250 weapon damage in 4s, gain 5× 300 barrier (≈1500 HP) + +18% Bullet Resist for 8s. T2 anti-bullet-burst counter.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2.5 | Passive |
| Barrier | 300 × 5 (= 1500) | Passive (on threshold trigger) |
| Bullet Resist Conditional | +18% | Passive |
| Damage Threshold | 250 (in 4s) | — |
| Barrier Duration | 8s | — |
| Cooldown | 35s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 1500 × (8/35) trigger uptime × 0.5 stack avg | 170 (shield HP) | 0.7 | adds | ⚖️ T2 bullet-burst barrier anchor. |
| `bullet_resistance` | +18% × (8/35) | 4 (eff %) | 0.3 | adds | Active uptime. |
| `gun_burst_resistance` | bullet-burst defense | 40 (eff %) | 2.0 | adds | ⚖️ Named bullet-burst defense. |
| `counter_importance` | dedicated anti-bullet-burst | 65 (% importance) | 1.3 | adds | R13. |
| `damage_sponge` | massive bullet-burst soak | 50 (% importance) | 1.1 | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 55 (HP) | 0.3 | adds | 22 + ~33. |
| `self_heal` | +2.5 OOC × 20s | 50 (HP total) | 0.3 | adds | OOC. |


---

## Arcane Surge
- **normalized_name**: `arcane_surge` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_arcane_surge`
- **wiki**: https://deadlock.wiki/Arcane_Surge

### Interpretation
Dash-jump triggered single-ability amp: +1 Stamina, +12% Stamina Recovery. After Dash-Jump (7s window), next ability cast gets: +12% Ability Range + +15% Ability Duration + +20 Spirit Power. Per Notes: items/passives don't benefit. T2 single-ability burst-amp.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Ability Range Conditional | +12% | Passive (post-Dash-Jump, 7s window) |
| Ability Duration Conditional | +15% | Passive |
| Spirit Power Conditional | +20 | Passive |
| Cast Window | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +20 SP × ~0.6 dash-uptime + T2 baseline | 17 (SP-equiv) | 0.6 | adds | 5.5 + 12. |
| `range_extender_dependant` | +12% × ~0.6 uptime | 7 (eff %) | 0.5 | adds | Dash-gated. |
| `duration_dependant` | +15% × ~0.6 uptime | 9 (eff %) | 0.8 | adds | Dash-gated. |
| `single_ability_focus` | next-ability-only amp | 55 (% importance) | 1.4 | adds | R17. |
| `vertical_mobility` | stamina + recovery | 2.0 (units) | 1.1 | adds | Stamina-direct. |
| `horizontal_mobility` | stamina-dash | 0.65 (m/s eff) | 0.6 | adds | Stamina-derived. |
| `engage` | dash-into-cast = engage | 50 (% importance) | 1.1 | adds | R11. |
| `spirit_burst_damage` | dash-cast = burst window | 25 (raw dmg within 1s) | 0.5 | adds | R2. |


---

## Bullet Resist Shredder
- **normalized_name**: `bullet_resist_shredder` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_bullet_resist_shredder`
- **wiki**: https://deadlock.wiki/Bullet_Resist_Shredder

### Interpretation
Spirit-damage-triggered bullet resist shred: +9% Bullet Resist, +9% Weapon Damage. Spirit damage → -10% Bullet Resist on target for 8s. Per Notes: debuff can be used by teammates. T2 spirit-gun hybrid debuff.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +9% | Passive |
| Weapon Damage | +9% | Passive |
| Bullet Resist Conditional | -10% | Passive (8s on spirit dmg) |
| Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -10% × ~0.7 uptime | 7 (eff shred %) | 1.2 | adds | ⚖️ T2 bullet_resist_shred Spirit anchor. |
| `hybrid_damage_usage` | spirit triggers gun amp | 70 (% importance) | 1.4 | adds | ⚖️ Named hybrid anchor. |
| `bullet_damage` | +9% (Spirit, no Weapon baseline) | 9 (eff gun-dmg %) | 0.3 | adds | Direct. |
| `bullet_resistance` | +9% direct | 9 (eff %) | 0.7 | adds | Direct. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |
| `counter_importance` | vs bullet-resist tanks | 50 (% importance) | 1.0 | adds | R13. |
| `ally_buff` | teammates can use debuff | 35 (% importance) | 0.9 | adds | Per Notes — team-shareable. |


---

## Cold Front
- **normalized_name**: `cold_front` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_cold_front`
- **wiki**: https://deadlock.wiki/Cold_Front

### Interpretation
Expanding ice AoE: +6% Spirit Resist. Active (25s CD): 95+0.47×SP damage + -60% Move Speed for 4s, 10m end radius. Per Notes: wave expands over ~1s, can be dodged. T2 AoE-slow caster nuke.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +6% | Passive |
| Damage | 95 + 0.47×SP | Active (25s CD) |
| Move Speed Conditional | -60% | Active (4s) |
| Duration | 4s | Active |
| End Radius | 10m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -60% × 4s × ~3 enemies | 45 (eff slow weighted) | 2.0 | adds | ⚖️ T2 movement_slow AoE anchor. |
| `aoe_cluster` | 10m AoE | 55 (% importance) | 1.4 | adds | Mid AoE radius. |
| `spirit_burst_damage` | 95+0.47×30 ≈ 109 within 1s | 109 (raw dmg within 1s) | 2.0 | adds | Cast-burst. |
| `spirit_burst_proc` | one big cast proc | 0.40 (proc index) | 0.9 | adds | R6: instant. |
| `spirit_damage` | (95+0.47×30)/25 + baseline | 10 (SP-equiv) | 0.3 | adds | 5.5 + 4.4. |
| `scaling_early` | greedy spirit caster snowball | 70 (% importance) | 2.0 | adds | ⚖️ Greedy early-peak. |
| `engage` | AoE slow = engage | 60 (% importance) | 1.3 | adds | R11. |
| `counter_importance` | counter to mobile comps | 50 (% importance) | 1.0 | adds | R13. |
| `spirit_resistance` | +6% direct | 6 (eff %) | 0.5 | adds | Direct. |


---

## Compress Cooldown
- **normalized_name**: `compress_cooldown` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_tempo`
- **wiki**: https://deadlock.wiki/Compress_Cooldown

### Interpretation
Imbued cooldown reducer: +18% Ability Cooldown Reduction on one imbued ability. T2 single-ability CDR anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Cooldown Reduction | +18% | Passive (imbued ability) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +18% direct (imbued) | 18 (eff CDR %) | 1.6 | adds | ⚖️ T2 imbued CDR anchor. |
| `single_ability_focus` | imbues one ability | 55 (% importance) | 1.4 | adds | R17. |
| `ability_spam` | CDR enables more casts | 45 (% importance) | 1.2 | adds | R20. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |


---

## Duration Extender
- **normalized_name**: `duration_extender` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_arcane_extension`
- **wiki**: https://deadlock.wiki/Duration_Extender

### Interpretation
Imbued duration extender: +22% Ability Duration on one imbued ability. T2 single-ability duration anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +22% | Passive (imbued ability) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `duration_dependant` | +22% direct (imbued) | 22 (eff %) | 2.0 | adds | ⚖️ T2 imbued duration anchor. |
| `single_ability_focus` | imbues one ability | 55 (% importance) | 1.4 | adds | R17. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |


---

## Improved Spirit
- **normalized_name**: `improved_spirit` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_soaring_spirit`
- **wiki**: https://deadlock.wiki/Improved_Spirit

### Interpretation
Pure SP + OOC stat stick: +18 Spirit Power, +1.5 OOC Regen. T2 spirit-damage anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +18 | Passive |
| Out of Combat Regen | +1.5 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +18 SP direct + T2 baseline | 24 (SP-equiv) | 0.8 | adds | ⚖️ T2 spirit_damage anchor. 5.5 + 18. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) | 0.5 | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) | 0.3 | adds | R2. |
| `self_heal` | +1.5 OOC × 20s | 30 (HP total) | 0.2 | adds | Small OOC. |


---

## Mystic Slow
- **normalized_name**: `mystic_slow` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_slow`
- **wiki**: https://deadlock.wiki/Mystic_Slow

### Interpretation
Spirit-damage triggered slow: +50 HP, +0.75m Sprint. Spirit damage → -30% Move Speed + -12% Dash Distance for 2s. T2 caster-poke slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Sprint Speed | +0.75m | Passive |
| Move Speed Conditional | -30% | Passive (2s on spirit dmg) |
| Dash Distance Conditional | -12% | Passive |
| Duration | 2s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% × 2s × ~2 enemies × spirit uptime | 18 (eff slow weighted) | 0.8 | adds | Spirit-trigger gates. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) | 0.3 | adds | Explicit. |
| `counter_importance` | counter to mobility comps | 45 (% importance) | 0.9 | adds | R13. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) | 0.5 | adds | Direct. |


---

## Mystic Vulnerability
- **normalized_name**: `mystic_vulnerability` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_vulnerability`
- **wiki**: https://deadlock.wiki/Mystic_Vulnerability

### Interpretation
Spirit-damage triggered SR shred: +8% Spirit Resist. Spirit damage → -8% Spirit Resist on target for 7s. Per Notes: does NOT stack (refreshes only); Escalating Exposure takes priority. T2 spirit-poke resist-shred.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +8% | Passive |
| Spirit Resist Conditional | -8% | Passive (7s on spirit dmg) |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% × ~0.8 spirit-uptime | 7 (eff shred %) | 1.0 | adds | ⚖️ T2 spirit_resist_shred component anchor. |
| `spirit_resistance` | +8% direct | 8 (eff %) | 0.6 | adds | Direct. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |
| `counter_importance` | vs spirit-resist tanks | 40 (% importance) | 0.8 | adds | R13. |


---

## Quicksilver Reload
- **normalized_name**: `quicksilver_reload` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_quick_silver`
- **wiki**: https://deadlock.wiki/Quicksilver_Reload

### Interpretation
Charge-Up imbued bullet amp: imbues one ability — first hit deals +44+0.16×SP bonus damage + +10% Fire Rate + reloads 100% of magazine. Per Notes: Charge-Up (NOT affected by CDR), 12s buff duration; bonus only triggers if initial damage > 0. T2 hybrid charge-bullet enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage | 44 + 0.16×SP | Passive (imbued ability first hit) |
| Fire Rate | +10% | Passive (12s buff post-charge) |
| Bullets Reloaded | 100% | Passive (instant reload) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | imbued bullets + spirit dmg + reload | 70 (% importance) | 1.4 | adds | ⚖️ T2 hybrid anchor. |
| `charge_dependant` | Charge-Up mechanic per Notes | 65 (% importance) | 1.4 | adds | ⚖️ T2 charge-up anchor. |
| `fire_rate` | +10% × ~0.5 charge uptime | 5 (eff %) | 0.5 | adds | Active-only. |
| `spirit_burst_damage` | 44+0.16×30 ≈ 49 within 1s | 49 (raw dmg within 1s) | 0.9 | adds | One-shot imbued. |
| `spirit_damage` | (~49 dmg per charge) + baseline | 11 (SP-equiv) | 0.4 | adds | 5.5 + ~5.5. |
| `bullet_damage` | T2 baseline (Spirit item, no Weapon baseline) | 0 (eff gun-dmg %) | 0.0 | adds | No baseline. |
| `magazine_size_dependant` | 100% reload on imbue trigger | 20 (eff ammo %) | 0.4 | adds | Reload skip. |
| `single_ability_focus` | imbues one ability | 50 (% importance) | 1.2 | adds | R17. |


---

## Slowing Hex
- **normalized_name**: `slowing_hex` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_containment`
- **wiki**: https://deadlock.wiki/Slowing_Hex

### Interpretation
Targeted slow + movement-silence: +0.5m Sprint. Active (27s CD): -20% Move Speed + -30% Dash Distance + silences movement abilities/items + increases gravity, 25m cast range, 3.5s. Per Notes: silences ~20 hero movement abilities + items like Warp Stone / Majestic Leap / Phantom Strike actives. T2 anti-mobility lockdown.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +0.5m | Passive |
| Move Speed Conditional | -20% | Active (3.5s on target) |
| Dash Distance Conditional | -30% | Active |
| Cast Range | 25m | Active |
| Duration | 3.5s | Active |
| Cooldown | 27s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -20% × 3.5s × 1 target × (3.5/27) | 12 (eff slow weighted) | 0.5 | adds | Single-target slow. |
| `silence` | movement-items silenced × 3.5s | 8 (weighted) | 2.0 | adds | ⚖️ Targeted movement-silence. |
| `counter_importance` | anti-mobility lockdown | 75 (% importance) | 1.5 | adds | ⚖️ Named anti-mobility T2. |
| `single_target` | per-target lockdown | 55 (% importance) | 1.7 | adds | Targeted cast. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |
| `horizontal_mobility` | +0.5m sprint | 0.35 (m/s eff) | 0.3 | adds | Direct. |
| `engage` | anti-escape commits engage | 50 (% importance) | 1.1 | adds | R11. |


---

## Spirit Sap
- **normalized_name**: `spirit_sap` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_spirit_sap`
- **wiki**: https://deadlock.wiki/Spirit_Sap

### Interpretation
Targeted spirit-resist + SP drain: +50 HP. Active (18s CD): -9% Spirit Resist + -30 Spirit Power on target for 12s, 40m cast range. T2 anti-caster shutdown.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Spirit Resist Conditional | -9% | Active (12s on target) |
| Spirit Power | -30 | Active (target's SP) |
| Duration | 12s | Active |
| Cast Range | 40m | Active |
| Cooldown | 18s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -9% × (12/18) uptime | 6 (eff shred %) | 0.8 | adds | Active uptime. |
| `counter_importance` | counter to caster comps | 70 (% importance) | 1.4 | adds | ⚖️ Named anti-caster T2. |
| `debuff` | resist + SP drain | 45 (% importance) | 1.1 | adds | Dual debuff. |
| `single_target` | per-target debuff | 60 (% importance) | 1.8 | adds | Targeted. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) | 0.2 | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) | 0.3 | adds | Explicit. |


---

## Suppressor
- **normalized_name**: `suppressor` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_suppressor`
- **wiki**: https://deadlock.wiki/Suppressor

### Interpretation
Spirit-damage triggered fire-rate slow: +6 Spirit Power, +8% Bullet Resist. Spirit damage → -28% Fire Rate on target for 5s. T2 anti-gun debuff via spirit poke.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +6 | Passive |
| Bullet Resist | +8% | Passive |
| Fire Rate Conditional | -28% | Passive (5s on spirit dmg) |
| Duration | 5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -28% × 5s × ~2 enemies × spirit uptime | 30 (eff slow %) | 2.0 | adds | ⚖️ T2 fire_rate_slow Spirit anchor. |
| `counter_importance` | anti-DPS via spirit | 55 (% importance) | 1.1 | adds | R13. |
| `spirit_damage` | +6 SP + T2 baseline | 12 (SP-equiv) | 0.4 | adds | 5.5 + 6. |
| `bullet_resistance` | +8% direct | 8 (eff %) | 0.6 | adds | Direct. |
| `hybrid_damage_usage` | spirit triggers anti-gun | 50 (% importance) | 1.0 | adds | Hybrid bridge. |
| `debuff` | FR slow debuff | 35 (% importance) | 0.9 | adds | Anti-gun debuff. |


---

# T3 (3200 souls)

## Alchemical Fire
- **normalized_name**: `alchemical_fire` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_thermal_detonator`
- **wiki**: https://deadlock.wiki/Alchemical_Fire

### Interpretation
Active AoE DoT + bullet shred: 45 DPS (+0.2×SP) burning ground in 10m for 5s, -7% Bullet Resist scaling with SP. T3 spirit-flavored Weapon item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +10 | Passive |
| Damage Per Second | 45 + 0.2×SP | Active (AoE DoT) |
| Bullet Resist Conditional | -7% − 0.055×SP | Active (enemy debuff) |
| Max DPS | 95 + 0.4×SP | Active |
| Radius | 10m | Active |
| Duration | 5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 45 DPS × 5s = 225 + 0.2×20×5 = 245 → /5 SP-equiv + T3 baseline | 58 (SP-equiv) | 1.3 | adds | (45×5 + 0.2×20×5)/5 = 49 + 9.6 baseline = 58. (T3 baseline NOT applied since Weapon item — only spirit_damage from item's own SP.) |
| `bullet_resist_shred` | -7% × 5s × AoE uptime | 5 (eff shred %) | 0.6 | adds | (7 + 0.055×20) × (5/25 cycle) × ~3 AoE targets ≈ 5. |
| `aoe_cluster` | 10m AoE DoT | 70 (% importance) | 1.8 | adds | Wide AoE. |
| `spirit_continuous_damage` | sustained DoT outside 1s | 196 (raw dmg outside 1s) | 1.6 | adds | DPS × (duration−1s) × AoE-multiplier. |
| `spirit_burst_damage` | first tick in 1s | 49 (raw dmg within 1s) | 0.6 | adds | First-1s tick on multiple targets. |
| `spirit_continuous_proc` | sustained ground DoT | 0.35 (proc index) | 0.8 | adds | R5 continuous-flavor. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `farmer` | AoE clears jungle | 45 (% importance) | 0.9 | adds | R28. |
| `dot` | DoT damage | 220 (raw dmg) | 1.7 | adds | Direct DoT — burn effect. |
| `counter_importance` | anti-tank DoT + gun-shred | 45 (% importance) | 0.9 | adds | R13. |

---

## Ballistic Enchantment
- **normalized_name**: `ballistic_enchantment` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_bulletshredimbue`
- **wiki**: https://deadlock.wiki/Ballistic_Enchantment

### Interpretation
Imbue item that stacks weapon damage on ability cast: +20% Weapon Damage per stack, 14s duration, +22% Ability Range. Per R23 (codename contains `imbue`) — single_ability_focus only, all bonuses bind to one ability.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage per Stack Conditional | +20% | Passive (imbued) |
| Ability Range | +22% | Passive (imbued — single ability) |
| Duration | 14s | Passive |
| Non-Hero Weapon Damage | +5% | Passive |
| Non-Hero Stack Limit | 8 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +20%/stack × ~3 avg stacks + T3 baseline | 32 (eff gun-dmg %) | 0.8 | adds | 20 × ~3 stacks × ~0.4 uptime + 9.6 baseline. R23: imbue-tied bonus. |
| `range_extender_dependant` | +22% Range (imbue) | 22 (eff %) | 1.0 | adds | R23: single-ability range. |
| `single_ability_focus` | imbue → one ability | 80 (% importance) | 2.0 | adds | R23. |
| `gun_burst_damage` | post-cast burst lifted | 16 (dmg-% within 1s) | 0.2 | adds | R2. |
| `gun_continuous_damage` | sustained DPS on stacked imbue | 16 (dmg-% outside 1s) | 0.2 | adds | R2. |
| `farmer` | +5% NPC dmg, 8-stack NPC build | 35 (% importance) | 0.7 | adds | R28: NPC stack on creeps for econ. |
| `scaling_late` | stack-build item rewards prolonged engagements | 35 (% importance) | 0.9 | adds | Stacking imbue scales the longer you play. |

---

## Berserker
- **normalized_name**: `berserker` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_berserker`
- **wiki**: https://deadlock.wiki/Berserker

### Interpretation
Take-damage stacker: +7% Weapon Damage per stack (10 stacks), gained from 120 damage taken, 10s duration, +8% Bullet Resist passive. R25: this IS a proc item — gets both gun_burst_proc and gun_continuous_proc (continuous-leaning). The named `damage_sponge` paradigm.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +8% | Passive |
| Weapon Damage per Stack | +7% | Passive (stacks 1–10) |
| Damage taken to Stack | 120 | Trigger |
| Max Stacks | 10 | Passive |
| Duration | 10s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `damage_sponge` | trigger = damage taken | 95 (% importance) | 2.0 | adds | R26: this IS the item's purpose. Named anchor. |
| `bullet_damage` | up to +70% × stack-build uptime + T3 baseline | 35 (eff gun-dmg %) | 1.2 | adds | (7×~4 avg stacks) × 0.7 uptime + 9.6 baseline ≈ 30. |
| `bullet_damage` | scales with sustaining stacks | 30 (eff gun-dmg %) | — | relies | The 7%/stack only realizes when stacked. |
| `bullet_resistance` | +8% Bullet Resist | 8 (eff %) | 0.4 | adds | Direct passive. |
| `gun_burst_damage` | per-shot stacked amp | 25 (dmg-% within 1s) | 0.3 | adds | R2 + stack lift. |
| `gun_continuous_damage` | sustained DPS scales as stacks build | 28 (dmg-% outside 1s) | 0.4 | adds | R2. |
| `gun_continuous_proc` | self-buff stack proc on damage taken | 0.5 (proc index) | 0.8 | adds | R25: every-120-dmg trigger; continuous-leaning. |
| `gun_burst_proc` | stack-initialization burst | 0.4 (proc index) | 0.6 | adds | R25. |
| `low_max_hp` | takes damage to scale (low-HP trigger) | 45 (HP) | 1.1 | adds | Item scales as you eat damage. |

---

## Blood Tribute
- **normalized_name**: `blood_tribute` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_blood_tribute`
- **wiki**: https://deadlock.wiki/Blood_Tribute

### Interpretation
TOGGLEABLE self-damage tradeoff (NO cooldown, NO duration limit per Notes): drain 50 HP/s for +35% Fire Rate, +35% Debuff Resist, +2m MS; +8% Spirit Resist, +8% Debuff Resist, +4 OOC passive. Drain can't kill the user. Effective uptime is much higher than typical actives — closer to "on whenever you can afford HP" than "5/15 cycle."

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +8% | Passive |
| Spirit Resist | +8% | Passive |
| Out of Combat Regen | +4 | Passive |
| Health Drain | 50/s | Active toggle (self-damage, can't kill) |
| Fire Rate | +35% | Active toggle |
| Debuff Resist | +35% | Active toggle |
| Move Speed | +2m | Active toggle |
| Cooldown / Duration | NONE | Toggleable on/off indefinitely (per Notes) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +35% × ~0.7 toggle uptime (no cooldown — per Notes) | 25 (eff %) | 1.7 | adds | Per Notes: TOGGLEABLE, no cooldown limit. Limiting factor is HP cushion, not active uptime. ~70% sustained in fights. |
| `cc_resist` | +35% × uptime + 8% passive | 32 (eff %) | 1.5 | adds | Combined toggle + passive. |
| `debuff_resistance` | +8% passive + 35% × toggle uptime | 32 (eff %) | 1.7 | adds | Same. |
| `spirit_resistance` | +8% passive | 8 (eff %) | 0.4 | adds | Passive. |
| `horizontal_mobility` | +2m × toggle uptime | 1.4 (m/s eff) | 0.9 | adds | 2 × 0.7. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `gun_burst_damage` | active fire-rate burst window | 30 (dmg-% within 1s) | 0.4 | adds | R2 (fire_rate lifts burst more), high uptime. |
| `gun_continuous_damage` | sustained DPS during toggle | 14 (dmg-% outside 1s) | 0.2 | adds | R2 lighter but high uptime. |
| `low_max_hp` | flat-HP-cost mechanic hurts low-HP | -25 (% importance) | -0.6 | adds | R24: low-HP heroes bleed out faster from 50/s drain. |
| `high_max_hp` | item safer for high-HP carriers | 60 (HP) | — | relies | R24: high HP cushion makes drain manageable; higher value with the toggle's high uptime. |
| `self_heal` | +4 OOC | 18 (HP total) | 0.1 | adds | 4 × 15 × 0.3. |
| `continous_heal` | +4 OOC outside 1s | 16.8 (HP outside 1s) | 0.1 | adds | 4 × 14 × 0.3. |
| `damage_sponge` | needing HP cushion to sustain drain | 40 (% importance) | — | relies | Item's effective use requires sustaining damage to keep toggling. |

---

## Burst Fire
- **normalized_name**: `burst_fire` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_burst_fire`
- **wiki**: https://deadlock.wiki/Burst_Fire

### Interpretation
Fire-rate active burst window: +10% Fire Rate passive, +32% Fire Rate Conditional active (4.5s), +50% Slide Distance, +1.25m MS active.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Slide Distance | +50% | Passive |
| Fire Rate | +10% | Passive |
| Fire Rate Conditional | +32% | Active |
| Move Speed Conditional | +1.25m | Active |
| Duration | 4.5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +10% passive + 32% × uptime | 20 (eff %) | 1.3 | adds | 10 + (32 × 4.5/16 uptime). |
| `gun_burst_damage` | burst window during active | 28 (dmg-% within 1s) | 0.4 | adds | R2 corrected — fire_rate lifts burst heavier. |
| `gun_continuous_damage` | sustained mild lift | 8 (dmg-% outside 1s) | 0.1 | adds | R2 lighter. |
| `horizontal_mobility` | +1.25m × 4.5/16 + slide | 0.5 (m/s eff) | 0.3 | adds | Active uptime. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `engage` | active burst window = engage tool | 35 (% importance) | 0.8 | adds | Slide + active for committing. |
| `magazine_size_dependant` | fire-rate items rely on ammo | 8 (eff ammo %) | — | relies | RELY: needs ammo to sustain RPM. |

---

## Cultist Sacrifice
- **normalized_name**: `cultist_sacrifice` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_non_player_bonus_sacrifice`
- **wiki**: https://deadlock.wiki/Cultist_Sacrifice

### Interpretation
NPC-consume mechanic with permanent-stack buff: target enemy NPC → consume for +180% bonus souls (270% total bounty) AND grant a 160s stacking buff (+10×0.8% Wpn Dmg, +50×4 HP, +12% Ability Range per stack). Buff PERSISTS THROUGH DEATH. The active is itself Spirit Damage and triggers on-hit spirit procs (e.g. Spirit Burn). The defining greedy farm-snowball item — converts NPCs into gold acceleration + a stacked self-buff.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2 | Passive |
| Weapon Damage vs. NPCs | +30% | Passive (NPC-only) |
| Bullet Resist vs. NPCs | +30% | Passive (NPC-only) |
| Bonus Souls per Consume | +180% | Active (270% total of bounty) |
| Weapon Damage Conditional | +10×0.8% per stack | Active (per-NPC-consume stack) |
| Bonus Health Conditional | +50×4 per stack | Active (per stack) |
| Ability Range Conditional | +12% | Active |
| Duration | 160s | Active (buff persists through death) |
| Active counts as | Spirit Damage | Active (triggers spirit procs) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | NPC-consume + 180% bonus souls + NPC dmg/resist | 100 (% importance) | 2.0 | adds | The named farm-snowball anchor — actively converts NPCs into permanent stat snowball. |
| `scaling_late` | NPC-consume → late-game stacked buff persisting through death | 80 (% importance) | 2.0 | adds | Buff persists through death, builds across the game — quintessential punish-now-pay-later late-game scaler. |
| `bullet_damage` | +10×0.8 = ~8% per stack × stack uptime + baseline | 28 (eff gun-dmg %) | 1.1 | adds | (8 × ~3 avg stacks × 0.8 uptime — 160s buff) + 9.6 T3 baseline. |
| `bullet_damage` | scales with maintained stacks | 30 (eff gun-dmg %) | — | relies | RELY on stacking to realize full value. |
| `high_max_hp` | +200 HP at 4 stacks × uptime | 160 (HP) | 0.6 | adds | 50×4 × 0.8 uptime = 160 effective. Weapon-item (no HP baseline). |
| `range_extender_dependant` | +12% Ability Range × uptime | 10 (eff %) | 0.4 | adds | Conditional. |
| `self_heal` | +2 OOC | 9 (HP total) | 0.0 | adds | Standard. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) | 0.0 | adds | 2 × 14 × 0.3. |
| `gun_continuous_damage` | stacked sustained DPS | 16 (dmg-% outside 1s) | 0.2 | adds | R2. |
| `gun_burst_damage` | stacked per-shot amp | 16 (dmg-% within 1s) | 0.2 | adds | R2. |
| `spirit_damage` | active counts as Spirit Damage (per Notes) | 6 (SP-equiv) | 0.1 | adds | Per Notes: active is a spirit-damage trigger — small contribution + capable of triggering procs (Spirit Burn etc.). |
| `damage_sponge` | +200 HP stacks let you take more dmg (incidental) | 25 (% importance) | — | relies | R26 partial — incidental. |
| `single_target` | active targets single NPC | 25 (% importance) | 0.8 | adds | NPC-consume is single-target. |
| `high_kill_count` | bonus-souls reward consuming-kills | 30 (% importance) | 0.9 | adds | Item rewards NPC-kill participation specifically. |

---

## Escalating Resilience
- **normalized_name**: `escalating_resilience` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_reinforcing_casings`
- **wiki**: https://deadlock.wiki/Escalating_Resilience

### Interpretation
Bullet-hit stacker: +35% Max Ammo, +75 HP, +18% Wpn Dmg passive; stacks +2% Bullet Resist per stack (max 30%) over 24s. R25: gun_burst_proc AND gun_continuous_proc (continuous-leaning, stacks per shot).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +35% | Passive |
| Bonus Health | +75 | Passive |
| Weapon Damage | +18% | Passive |
| Max Bullet Resist | 30% | Stacking |
| Bullet Resist per Stack | 2% | Stacking |
| Stack Duration | 24s | Stacking |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +35% Max Ammo | 35 (eff ammo %) | 0.5 | adds | Direct passive ammo. |
| `bullet_damage` | +18% Wpn Dmg + T3 baseline | 27.6 (eff gun-dmg %) | 0.7 | adds | 18 + 9.6. |
| `bullet_resistance` | up to 30% × stack uptime | 22 (eff %) | 1.1 | adds | 30 × ~0.7 stack-uptime. |
| `melee_resistance` | bullet resist pseudo | 11 (eff %) | 0.5 | adds | Per 01 ~0.5x. |
| `high_max_hp` | +75 HP (Weapon item) | 75 (HP) | 0.3 | adds | Weapon-item explicit only. |
| `gun_burst_damage` | per-shot lift | 18 (dmg-% within 1s) | 0.2 | adds | R2. |
| `gun_continuous_damage` | sustained DPS + mag | 25 (dmg-% outside 1s) | 0.3 | adds | R2 + ammo lifts continuous. |
| `gun_continuous_proc` | self-resist stack per shot | 0.5 (proc index) | 0.8 | adds | R25: stacks every shot — continuous-leaning. |
| `gun_burst_proc` | initial stack build | 0.3 (proc index) | 0.5 | adds | R25. |
| `damage_sponge` | stacks favor enduring fights (incidental) | 35 (% importance) | — | relies | R26. |

---

## Express Shot
- **normalized_name**: `express_shot` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_express_shot`
- **wiki**: https://deadlock.wiki/Express_Shot

### Interpretation
Single-shot burst weapon: +60% Bullet Velocity, +8% Wpn Dmg, +125×2% Weapon Damage Conditional (consume 2 ammo), +100% Bullet Velocity active. T3 gun_burst_damage anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Weapon Damage Conditional | +125×2% | Active (2-ammo shot) |
| Secondary Fire Weapon Damage Conditional | +40×1.3% | Active |
| Bullet Velocity | +100% | Active |
| Extra Ammo Consumed | 2 | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_burst_damage` | +250% per shot active burst | 110 (dmg-% within 1s) | 1.5 | adds | The 125×2 = 250% shot is the defining burst payout. |
| `bullet_damage` | +8% passive + active burst amortized + T3 baseline | 30 (eff gun-dmg %) | 0.8 | adds | 8 + (250 × ~0.05 single-shot frequency) + 9.6 baseline. |
| `gun_burst_proc` | single-shot proc-style burst | 1.2 (proc index) | 1.8 | adds | Burst-flavored: large effect in tight window. |
| `long_range` | +60% bullet velocity + range scaling | 50 (% importance) | 1.1 | adds | Bullet velocity heavy. |
| `mid_range` | also mid | 30 (% importance) | 1.3 | adds | Mid-range tracking. |
| `single_target` | aimed single-shot | 60 (% importance) | 1.8 | adds | Single-target burst. |
| `headshot_damage` | rewards landing aimed shots | 40 (% importance) | 0.6 | adds | Bullet velocity + per-shot burst. |
| `magazine_size_dependant` | consumes 2 ammo per shot | 8 (eff ammo %) | — | relies | Item RELIES on having ammo for the high-cost shot. |
| `gun_continuous_damage` | minor sustained lift | 8 (dmg-% outside 1s) | 0.1 | adds | R2 lighter — burst-heavy. |

---

## Headhunter
- **normalized_name**: `headhunter` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_headhunter`
- **wiki**: https://deadlock.wiki/Headhunter

### Interpretation
Headshot scaler: +5% Wpn Dmg, +50 HP, +75×4 head bonus dmg, 4% Heal per headshot, +1.75m Move Speed for 3s on head. T3 headshot-importance anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +5% | Passive |
| Bonus Health | +50 | Passive |
| Head Shot Bonus Damage | +75×4 | Passive (stacking) |
| Heal Per Headshot | 4% | Passive |
| Move Speed | +1.75m | Active (post-head) |
| Move Speed Duration | 3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `headshot_damage` | +75×4 + 4% heal | 85 (% importance) | 1.4 | adds | T3 named anchor for headshot-importance. |
| `bullet_damage` | +5% + T3 baseline | 14.6 (eff gun-dmg %) | 0.4 | adds | 5 + 9.6. |
| `gun_burst_damage` | first-head burst (+75 dmg in 1s) | 60 (raw dmg within 1s) | 0.8 | adds | First-head delivers 75 raw burst dmg in 1s window. |
| `gun_burst_proc` | first-head proc | 1.0 (proc index) | 1.5 | adds | Burst index 1.0. |
| `self_heal` | 4% per headshot (~3 heads/fight) | 60 (HP total) | 0.3 | adds | 4% × 500 HP × ~3 heads = 60. |
| `bullet_lifesteal` | functions like bullet-lifesteal on heads | 6 (eff %) | 0.6 | adds | 4% × headshot-rate effective. |
| `burst_heal` | per-head heal within 1s of triggering shot | 20 (HP within 1s) | 0.1 | adds | First headshot heals 20 HP within 1s. |
| `horizontal_mobility` | +1.75m × headshot-trigger uptime | 0.5 (m/s eff) | 0.3 | adds | 1.75 × ~0.3 head-trigger uptime. |
| `single_target` | headshots are single-target | 65 (% importance) | 2.0 | adds | Targeted. |
| `mid_range` / `long_range` | scoped headshots | 40 (% importance) |  | adds | Mid-range headshots primary. |
| `high_max_hp` | +50 HP (Weapon item) | 50 (HP) | 0.2 | adds | Weapon explicit only. |

---

## Heroic Aura
- **normalized_name**: `heroic_aura` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_dps_aura`
- **wiki**: https://deadlock.wiki/Heroic_Aura

### Interpretation
Team-buff aura: +17% Bullet Resist passive aura (35m), +2.25m MS / +26% Fire Rate active aura (7s, 35m). Per R27: universal-strong = below 0.5 on counter_importance.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +1.5m | Passive |
| Bullet Resist | +17% | Passive (35m aura) |
| Radius | 35m | Passive |
| Move Speed Conditional | +2.25m | Active (aura) |
| Fire Rate Conditional | +26% | Active (aura) |
| Active Radius | 35m | Active |
| Duration | 7s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +17% aura | 17 (eff %) | 0.9 | adds | Wide-radius aura. |
| `melee_resistance` | bullet pseudo | 9 (eff %) | 0.4 | adds | Per 01. |
| `ally_buff` | team-wide aura buff | 80 (% importance) | 2.0 | adds | Aura item — primary purpose. |
| `team_heal` | aura saves teammates | 35 (HP total) | 0.1 | adds | Effective shielding via resist. |
| `assist_importance` | team-fight presence | 60 (% importance) | 1.4 | adds | R27: universal-strong. |
| `close_to_team` | aura needs allies nearby | 70 (% importance) | 2.0 | adds | 35m radius wants team grouped. |
| `fire_rate` | +26% × active uptime | 13 (eff %) | 0.9 | adds | 26 × ~0.5 active. |
| `horizontal_mobility` | +1.5m sprint + active MS | 1.0 (m/s eff) | 0.6 | adds | Sprint passive ×0.5 + active. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `gun_burst_damage` | fire-rate burst lift on team | 18 (dmg-% within 1s) | 0.2 | adds | R2 burst-heavy. |
| `engage` | aura active = team push | 50 (% importance) | 1.1 | adds | Active rewards group engages. |
| `high_assist_count` | aura → assists | 50 (% importance) | 2.0 | adds | Team-presence. |

---

## Hollow Point
- **normalized_name**: `hollow_point` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_hollow_point_rounds`
- **wiki**: https://deadlock.wiki/Hollow_Point

### Interpretation
On-hit shred + dmg conditional: +4.5 OOC, +125 HP, +35% Weapon Damage Conditional, -9% Bullet Resist debuff 8s. Strong dual-purpose gun item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4.5 | Passive |
| Bonus Health | +125 | Passive |
| Weapon Damage Conditional | +35% | Passive (conditional) |
| Bullet Resist Conditional | -9% | Passive (debuff on hit) |
| Debuff Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -9% × 8s × on-hit | 7 (eff shred %) | 0.8 | adds | 9 × ~0.8 maintain. |
| `bullet_damage` | +35% × uptime + T3 baseline | 27.6 (eff gun-dmg %) | 1.1 | adds | (35 × ~0.5 condition uptime) + 9.6 baseline. |
| `bullet_damage` | scales with maintaining condition | 35 (eff gun-dmg %) | — | relies | RELY on the condition. |
| `gun_burst_damage` | conditional per-shot amp | 18 (dmg-% within 1s) | 0.2 | adds | R2. |
| `gun_continuous_damage` | sustained DPS | 18 (dmg-% outside 1s) | 0.2 | adds | R2. |
| `gun_continuous_proc` | every bullet applies shred | 0.4 (proc index) | 0.6 | adds | R5. |
| `high_max_hp` | +125 HP (Weapon item) | 125 (HP) | 0.5 | adds | Explicit only. |
| `self_heal` | +4.5 OOC | 20 (HP total) | 0.1 | adds | 4.5 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 18.9 (HP outside 1s) | 0.1 | adds | 4.5 × 14 × 0.3. |

---

## Hunters Aura
- **normalized_name**: `hunters_aura` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_bullet_armor_reduction_aura`
- **wiki**: https://deadlock.wiki/Hunter's_Aura

### Interpretation
Enemy-debuff aura: -10% Bullet Resist and -15% Fire Rate on enemies within 15m, +100 HP, +0.75m Sprint. Per 04: `fire_rate_slow`. Passive AoE shred for team.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Sprint Speed | +0.75m | Passive |
| Bullet Resist Conditional | -10% | Passive (aura, enemy) |
| Fire Rate Conditional | -15% | Passive (aura, enemy) |
| Radius | 15m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -10% × aura uptime × ~2 enemies | 18 (eff shred %) | 2.0 | adds | 10 × 0.9 in-range × 2 AoE. |
| `fire_rate_slow` | -15% × aura × 2 enemies | 25 (eff slow %) | 1.1 | adds | 15 × 0.9 × 2 — passive, multi-target. |
| `bullet_resistance` | fire-rate-slow pseudo | 10 (eff %) | 0.5 | adds | Per 01. |
| `gun_continuous_resistance` | sustained gun blunting | 10 (eff %) | 0.6 | adds | Per 01. |
| `aoe_cluster` | 15m aura | 55 (% importance) | 1.4 | adds | AoE flavor. |
| `ally_buff` | aura effectively buffs team gun output | 60 (% importance) | 1.5 | adds | Team shred. |
| `high_max_hp` | +100 HP (Weapon item) | 100 (HP) | 0.4 | adds | Explicit. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) | 0.3 | adds | Sprint × 0.5. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `close_to_team` | aura wants team grouped | 35 (% importance) | 1.0 | adds | Team-fight item. |

---

## Point Blank
- **normalized_name**: `point_blank` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_close_quarter_combat`
- **wiki**: https://deadlock.wiki/Point_Blank

### Interpretation
Close-range gun-amp anchor: +50% Weapon Damage within 15m + 25% slow, +75 HP, +30% Melee Resist. ⚖️ Judgment anchor for `melee_damage` (close-range weapon power per R12/R18).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Melee Resist | +30% | Passive |
| Weapon Damage | +50% | Passive (close-range) |
| Move Speed Conditional | -25% | Passive (enemy slow on hit) |
| Slow Duration | 2s | Passive |
| Close Range | 15m | Trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +50% × close uptime + T3 baseline | 37 (eff gun-dmg %) | 1.6 | adds | (50 × ~0.55 close uptime) + 9.6 baseline. |
| `bullet_damage` | scales with close-range build | 50 (eff gun-dmg %) | — | relies | RELY on close-range. |
| `melee_damage` | R18 close-range gun amp at melee dist | 50 (eff melee-dmg %) | 2.0 | adds | ⚖️ Judgment anchor — R12/R18: close-range weapon power IS melee_damage. |
| `close_range` | gun amp <15m | 90 (% importance) | 1.9 | adds | R21. |
| `long_range` | anti-affinity | -40 (% importance) | -0.9 | adds | R30. |
| `melee_resistance` | +30% | 30 (eff %) | 1.3 | adds | Direct. |
| `movement_slow` | -25% × 2s × on-hit | 25 (eff slow weighted) | 0.7 | adds | 25 × ~0.9 uptime × 1 target × 1s avg. |
| `gun_burst_damage` | per-shot close amp | 30 (dmg-% within 1s) | 0.4 | adds | R2. |
| `gun_continuous_damage` | sustained close fire | 30 (dmg-% outside 1s) | 0.4 | adds | R2. |
| `high_max_hp` | +75 HP (Weapon) | 75 (HP) | 0.3 | adds | Explicit. |
| `engage` | rewards committing | 70 (% importance) | 1.6 | adds | R11/close-range engage. |
| `grounded` | close-fight grounded | 50 (% importance) | 2.0 | adds | R7. |

---

## Shadow Weave
- **normalized_name**: `shadow_weave` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_cloaking_device_active`
- **wiki**: https://deadlock.wiki/Shadow_Weave

### Interpretation
Stealth + ambush kit: +5 OOC regen, +1.5m sprint, 13s invisibility active (45s CD, 20m spot radius, +5m invis sprint). Attacking/casting ends stealth and grants a 5s ambush buff: +25% Fire Rate, +25 Spirit Power, +25% Melee Damage. Per Notes, the fire-rate buff ramps gradually over ~0.5s. The named engage-from-stealth tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +5 | Passive |
| Sprint Speed | +1.5m | Passive |
| Stealth Duration | 13s | Active (Invisible status) |
| Spot Radius | 20m | Active |
| Invis Sprint Speed | +5m | Active (while stealthed) |
| Ambush Fire Rate Conditional | +25% | Active (5s post-break) |
| Ambush Spirit Power Conditional | +25 | Active (5s post-break) |
| Ambush Melee Damage Conditional | +25% | Active (5s post-break) |
| Ambush Duration | 5s | Active |
| Active Cooldown | 45s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `engage` | stealth → ambush is a dedicated engage tool | 85 (% importance) | 1.9 | adds | Named engage-from-stealth. R14 friendly. |
| `escape` | stealth also serves disengage | 55 (% importance) | 1.0 | adds | Invis works both ways; +5m sprint while invis. |
| `bullet_damage` | +25% FR × 5s × (5/45) ≈ baseline lift | 10 (eff gun-dmg %) | 0.2 | adds | T3 baseline 9.6 + small fire-rate-derived burst lift (gradual ramp Notes-confirmed). |
| `fire_rate` | +25% × (5s/45s) ambush uptime | 3 (eff %) | 0.2 | adds | 25 × 0.11 ambush uptime. |
| `spirit_damage` | +25 SP × (5/45) | 3 (SP-equiv) | — | relies | RELY: only during ambush. |
| `melee_damage` | +25% × (5/45) | 3 (eff melee-dmg %) | 0.1 | adds | Ambush amp. |
| `gun_burst_damage` | post-stealth ambush = first-1s gun burst | 70 (raw dmg within 1s) | 0.9 | adds | Ambush window IS designed for burst opener. R2 fire-rate lifts burst more. |
| `gun_continuous_damage` | 5s window mostly fits burst not sustained | 15 (raw dmg outside 1s) | 0.2 | adds | Small sustained lift. |
| `horizontal_mobility` | +1.5m sprint passive + 5m invis sprint × (13/45) | 3 (m/s eff) | 1.9 | adds | 1.5 + 5 × 0.29 = 3.0 effective. |
| `aerial` | stealth helps aerial flanks | 35 (% importance) | — | relies | R7 partial — invis enables aerial routes. |
| `self_buff` | self-cast stealth + ambush | 70 (% importance) | 2.0 | adds | Self-only utility. |
| `single_target` | ambush opener is single-target | 50 (% importance) | 1.5 | adds | First-target burst tool. |
| `self_heal` | +5 OOC regen × OOC time | 100 (HP total) | 0.4 | adds | 5 HP/s × 20s OOC ≈ 100 HP. |
| `farmer` | invis enables map rotation + safe farm | 50 (% importance) | 1.0 | adds | R28: stealth IS a farmer enabler. |
| `counter_importance` | counter to ward / vision plays | 30 (% importance) | 0.6 | adds | R13: stealth bypasses vision. |


---

## Sharpshooter
- **normalized_name**: `sharpshooter` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_sharpshooter`
- **wiki**: https://deadlock.wiki/Sharpshooter

### Interpretation
Long-range sniper kit: +20% Fall-off, +25% Zoom, +60% Bullet Velocity, +10% Wpn Dmg, +1m Sprint, -0.7m Move Speed; +60% Wpn Dmg Conditional past 15m. ⚖️ The named anchor for `long_range`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Fall-off Range | +20% | Passive |
| Weapon Zoom | +25% | Passive |
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +10% | Passive |
| Sprint Speed | +1m | Passive |
| Move Speed | -0.7m | Passive (penalty) |
| Weapon Damage Conditional | +60% | Passive (>15m) |
| Min. Distance | 15m | Condition |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | range kit + +60% wpn dmg >15m | 90 (% importance) | 2.0 | adds | ⚖️ Named anchor for long_range. |
| `bullet_damage` | +10% + 60% × long uptime + T3 baseline | 42 (eff gun-dmg %) | 1.8 | adds | 10 + (60 × ~0.4 long-range) + 9.6 baseline. |
| `bullet_damage` | scales with maintaining long range | 60 (eff gun-dmg %) | — | relies | RELY on >15m. |
| `close_range` | anti-affinity | -40 (% importance) | -0.8 | adds | Mirror R30 — sniper kit anti-close. |
| `gun_burst_damage` | per-shot amp | 35 (dmg-% within 1s) | 0.5 | adds | R2. |
| `gun_continuous_damage` | sustained lift | 35 (dmg-% outside 1s) | 0.5 | adds | R2. |
| `headshot_damage` | zoom + velocity aid heads | 55 (% importance) | 0.9 | adds | Big zoom + velocity. |
| `single_target` | scope shots single-target | 60 (% importance) | 1.8 | adds | Sniper. |
| `horizontal_mobility` | net -0.7 + 1m sprint × 0.5 | 0 (m/s eff) | 0.0 | adds | Net ~0 (penalty offsets sprint). |

---

## Spirit Rend
- **normalized_name**: `spirit_rend` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_spellslinger_headshots`
- **wiki**: https://deadlock.wiki/Spirit_Rend

### Interpretation
Headshot spirit-resist stacker: +75 HP, on-hit: -8% Spirit Resist + 10% Spirit Lifesteal; on-headshot: -7% Spirit Resist stack (up to 4, 8s). Hybrid spirit-gun synergy.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Spirit Resist Conditional (on-hit) | -8% | Passive |
| Spirit Lifesteal Conditional | +10% | Passive |
| Spirit Resist on Headshot Conditional | -7% | Stacking (4 max) |
| Debuff Duration | 8s | Passive |
| Max Stacks | 4 | Stacking |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% on-hit + 7%×4 stacks × headshot uptime | 22 (eff shred %) | 2.0 | adds | 8 + (7×4 × ~0.5 head-uptime) = 22. |
| `spirit_lifesteal` | +10% × on-hit uptime | 7 (eff %) | 0.7 | adds | 10 × ~0.7. |
| `headshot_damage` | rewards heads for stack | 50 (% importance) | 0.8 | adds | Head-driven stacking. |
| `gun_continuous_proc` | every-bullet shred | 0.4 (proc index) | 2.0 | adds | R5. |
| `gun_burst_proc` | head-stack burst | 0.6 (proc index) | 2.0 | adds | R5. |
| `high_max_hp` | +75 HP (Weapon) | 75 (HP) | 0.3 | adds | Explicit. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | 0.7 | adds | R31. |
| `hybrid_damage_usage` | shred + lifesteal + bullet | 50 (% importance) | 2.0 | adds | Spirit/gun bridge. |
| `counter_importance` | anti-spirit tank shred | 45 (% importance) | 2.0 | adds | R13. |

---

## Tesla Bullets
- **normalized_name**: `tesla_bullets` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_chain_lightning`
- **wiki**: https://deadlock.wiki/Tesla_Bullets

### Interpretation
Chain-lightning gun proc: 33 + 0.19×SP shock damage, 15% proc chance, 4 jumps, 8m radius. AoE-cluster gun proc.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Shock Damage | 33 + 0.19×SP | Passive (proc) |
| Proc Chance | 15% | Passive |
| Max Jumps | 4 | Passive |
| Jump Radius | 8m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | (33+0.19×20)×4 jumps × 0.15 proc / 5 + T3 baseline | 21 (SP-equiv) | 0.5 | adds | Per 01: (37×4)/5 × 0.15 = 4.4 SP-equiv + 9.6 baseline (weapon item — no SP baseline). 4.4 only. Score 4.4. Hmm — Weapon item. Score just 4.4. |
| `aoe_cluster` | chain to 4 enemies | 70 (% importance) | 1.8 | adds | AoE proc on bullet hit. |
| `gun_continuous_proc` | 15% chance every bullet | 0.45 (proc index) | — | adds | R5: per-shot proc. |
| `gun_burst_proc` | first-shot chain burst | 0.4 (proc index) | — | adds | R5. |
| `spirit_continuous_damage` | sustained spirit chain dmg | 70 (raw dmg outside 1s) | 0.6 | adds | (37×4)×0.15 = 22/shot × ~3 shots/s sustained. |
| `spirit_burst_damage` | first-1s chain dmg | 30 (raw dmg within 1s) | 0.4 | adds | First hits chain. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | — | adds | R31. |
| `farmer` | chain clears NPCs | 50 (% importance) | 1.0 | adds | R28: AoE = farm. |
| `hybrid_damage_usage` | spirit-via-gun proc | 50 (% importance) | — | adds | Double-dip. |
| `lane_pusher` | NOT canonical, drop | — | — | — | (Skip non-canonical.) |

---

## Toxic Bullets
- **normalized_name**: `toxic_bullets` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_toxic_bullets`
- **wiki**: https://deadlock.wiki/Toxic_Bullets

### Interpretation
On-hit DoT + anti-heal: 1.7%/s Bleed Damage (+0.005×SP), -35% Healing Reduction, 4s. The dual anti-heal/DoT gun mod.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bleed Damage | 1.7 + 0.005×SP %/s | Passive (DoT on hit) |
| Healing Reduction Conditional | -35% | Passive |
| Duration | 4s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -35% × 4s × on-hit uptime | 26 (eff %) | 1.3 | adds | 35 × ~0.75 maintain. |
| `dot` | 1.7%/s bleed × 4s | 80 (raw dmg) | 0.6 | adds | %/s of max HP × 4s × ~1.5 avg HP fraction = ~80 DoT. |
| `gun_continuous_proc` | per-bullet DoT/anti-heal | 0.45 (proc index) | — | adds | R5: short refresh, 4s effect. |
| `gun_burst_proc` | first-tick burst | 0.3 (proc index) | — | adds | R5 burst-light. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) | — | adds | R31. |
| `bullet_proc` | general anchor (per tag_desc) | 0.4 (proc index) | 2.0 | adds | Anchor for bullet_proc. |
| `gun_continuous_damage` | DoT sustained | 60 (raw dmg outside 1s) | 0.8 | adds | DoT outside 1s. |
| `gun_burst_damage` | first-tick within 1s | 20 (raw dmg within 1s) | 0.3 | adds | First DoT tick. |
| `counter_importance` | heal counter | 55 (% importance) | — | adds | R13/R27. |
| `debuff` | priority debuff (anti-heal) | 40 (% importance) | 1.0 | adds | High priority. |

---

## Weighted Shots
- **normalized_name**: `weighted_shots` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_weighted_shots`
- **wiki**: https://deadlock.wiki/Weighted_Shots

### Interpretation
Heavy-gun tank package: +40% Wpn Dmg, +22% Debuff Resist, -14% Stamina Recovery, -0.5m Move Speed; on-hit -30% MS, -22% Dash, 3.5s slow. Slow but heavy-hitting.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +40% | Passive |
| Debuff Resist | +22% | Passive |
| Stamina Recovery | -14% | Passive (penalty) |
| Move Speed | -0.5m | Passive (penalty) |
| Move Speed Conditional | -30% | Passive (enemy slow on hit) |
| Dash Distance | -22% | Passive (enemy) |
| Slow Duration | 3.5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +40% Wpn Dmg + T3 baseline | 49.6 (eff gun-dmg %) | 1.2 | adds | 40 + 9.6. |
| `gun_burst_damage` | per-shot heavy amp | 28 (dmg-% within 1s) | 0.4 | adds | R2. |
| `gun_continuous_damage` | sustained heavy | 28 (dmg-% outside 1s) | 0.4 | adds | R2. |
| `movement_slow` | -30% × 3.5s × on-hit | 27 (eff slow weighted) | 0.8 | adds | 30 × ~0.9 uptime × 1. |
| `debuff_resistance` | +22% | 22 (eff %) | 1.2 | adds | Direct. |
| `cc_resist` | partial CC blunting | 16 (eff %) | 0.7 | adds | Per 04 — debuff_resistance blunts CC. |
| `gun_continuous_proc` | every bullet slows | 0.45 (proc index) | 0.7 | adds | R5. |
| `horizontal_mobility` | -0.5m + -14% stamina rec | -0.5 (m/s eff) | -0.3 | adds | Net mobility penalty. |
| `vertical_mobility` | -14% stamina recovery (anti) | -0.3 (units) | -0.1 | adds | Anti-vertical. |
| `grounded` | slow heavy-gunner | 35 (% importance) | 1.4 | adds | R7 grounded leaning. |
| `counter_importance` | slow + debuff resist counters | 40 (% importance) | 0.8 | adds | R13. |

---

## Bullet Resilience
- **normalized_name**: `bullet_resilience` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_improved_bullet_armor`
- **wiki**: https://deadlock.wiki/Bullet_Resilience

### Interpretation
Major bullet-resist defensive: +30% Bullet Resist, +3 OOC, +15% Bullet Resist Conditional. The T3 named anchor for `bullet_resistance` (per 03 cross-tier table).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +30% | Passive |
| Out of Combat Regen | +3 | Passive |
| Bullet Resist Conditional | +15% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +30% + 15% × uptime | 39 (eff %) | 2.0 | adds | 30 + (15 × ~0.6 conditional uptime). T3 anchor. |
| `melee_resistance` | bullet pseudo | 20 (eff %) | 0.9 | adds | Per 01. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `self_heal` | +3 OOC | 14 (HP total) | 0.1 | adds | 3 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 12.6 (HP outside 1s) | 0.0 | adds | 3 × 14 × 0.3. |
| `damage_sponge` | bullet-resist tank synergy (incidental) | 30 (% importance) | — | relies | R26 partial. |
| `gun_continuous_resistance` | sustained gun defense | 25 (eff %) | 1.4 | adds | Per 01. |
| `gun_burst_resistance` | gun-burst defense | 15 (eff %) | 0.5 | adds | Lower than continuous for flat resist. |

---

## Counterspell
- **normalized_name**: `counterspell` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_counterspell`
- **wiki**: https://deadlock.wiki/Counterspell

### Interpretation
Spell-parry counter: 0.8s spell parry window, on-parry 150 heal + 20 SP + 1.75m MS, 6s buff. The ⚖️ judgment anchor for `spirit_burst_resistance` (counter-flavored anti-spirit-burst).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Spirit Power | +5 | Passive |
| Healing Conditional | 150 | Active (parry-trigger) |
| Spirit Power Conditional | +20 | Active |
| Move Speed Conditional | +1.75m | Active |
| Buff Duration | 6s | Active |
| Spell Parry Duration | 0.8s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_resistance` | 0.8s spell parry = 100% spirit-burst absorb | 60 (eff %) | 2.0 | adds | ⚖️ judgment anchor: parry window negates a spirit burst entirely (per 03 anchor: Spellbreaker/Counterspell). |
| `counter_importance` | dedicated anti-spirit-burst | 80 (% importance) | 1.6 | adds | R27: niche counter, high score. |
| `bullet_evasion` | partial — spell parry doesn't help bullets | 0 | 0.0 | adds | (Skip — wrong axis.) |
| `self_heal` | 150 per-parry × ~0.5 trigger uptime | 75 (HP total) | 0.3 | adds | 150 × 0.5 success rate. |
| `burst_heal` | 150 on parry-trigger within 1s | 75 (HP within 1s) | 0.4 | adds | Instant heal on parry. |
| `spirit_damage` | +5 + 20 × uptime + baseline | 14 (SP-equiv) | 0.3 | adds | 5 + (20 × 6/30 active uptime) = 9 — Vitality item, no SP baseline. |
| `horizontal_mobility` | +1.75m × uptime | 0.4 (m/s eff) | 0.3 | adds | 1.75 × ~0.2. |
| `high_max_hp` | +50 + T3 baseline | 79 (HP) | 0.3 | adds | 50 + 29. |
| `damage_sponge` | reactive-on-spell tank (incidental) | 25 (% importance) | — | relies | R26. |

---

## Dispel Magic
- **normalized_name**: `dispel_magic` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_reduce_debuff_duration`
- **wiki**: https://deadlock.wiki/Dispel_Magic

### Interpretation
Active cleanse + heal: 250 HP heal on cast, +2m MS, 3s; +10% Spirit Resist passive. Counter-flavored cleanse.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| HP Healed On Activate | 250 | Active |
| Move Speed | +2m | Active |
| Buff Duration | 3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `debuff_resistance` | cleanse on cast (full removal) | 35 (eff %) | 1.9 | adds | Per 01: cleanse = full credit modulo cooldown. |
| `cc_resist` | cleanse covers CC too | 30 (eff %) | 1.4 | adds | Per 04. |
| `counter_importance` | reactive cleanse | 75 (% importance) | 1.5 | adds | R27 niche counter. |
| `self_heal` | 250 HP per cast | 110 (HP total) | 0.5 | adds | 250 × ~0.45 per-fight cast freq. |
| `burst_heal` | 250 instant on cast | 110 (HP within 1s) | 0.5 | adds | Burst heal flavor. |
| `horizontal_mobility` | +2m × uptime | 0.5 (m/s eff) | 0.3 | adds | 2 × 0.25 active uptime. |
| `escape` | cleanse + MS = escape tool | 55 (% importance) | 1.0 | adds | Disengage utility. |
| `spirit_resistance` | +10% | 10 (eff %) | 0.5 | adds | Passive. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |

---

## Fortitude
- **normalized_name**: `fortitude` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_chonky`
- **wiki**: https://deadlock.wiki/Fortitude

### Interpretation
Big HP + regen: +375 Bonus Health, +2% Max Health Regen, +1.5m MS Conditional. The T3 anchor for `high_max_hp` (per 03: Fortitude T3 375 HP). Tanker-class hybrid.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +375 | Passive |
| Restore Delay | +10s | Passive |
| Max Health Regen | +2% | Passive |
| Move Speed Conditional | +1.5m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | +375 HP + T3 baseline | 404 (HP) | 1.6 | adds | 375 + 29. T3 anchor for HP per 03. |
| `continous_heal` | +2% Max HP/s outside 1s | 130 (HP outside 1s) | 0.4 | adds | 2% × ~1000 effective HP × 14s post-fight = ~280; weighted by trigger ~0.5 = 140. |
| `self_heal` | total regen across cycle | 150 (HP total) | 0.7 | adds | Sum estimate. |
| `burst_heal` | first 1s regen | 10 (HP within 1s) | 0.0 | adds | Small first tick. |
| `damage_sponge` | tank-class HP item | 60 (% importance) | — | relies | R26: HP cushion is tank's purpose. |
| `large_hitbox` | large HP softly correlates | 25 (% importance) | — | relies | Partial. |
| `horizontal_mobility` | +1.5m × ~0.5 uptime | 0.4 (m/s eff) | 0.3 | adds | Conditional partial. |

---

## Fury Trance
- **normalized_name**: `fury_trance` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_fury_trance`
- **wiki**: https://deadlock.wiki/Fury_Trance

### Interpretation
Bullet-lifesteal + spirit defense: +14% Bullet Lifesteal, +100 HP, +6% Wpn Dmg passive; 32% Fire Rate + 40% Spirit Resist active, 6.5s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +14% | Passive |
| Bonus Health | +100 | Passive |
| Weapon Damage | +6% | Passive |
| Fire Rate | 32% | Active |
| Spirit Resist | +40% | Active |
| Duration | 6.5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +14% passive | 14 (eff %) | 1.4 | adds | Direct. |
| `spirit_resistance` | +40% × ~6.5/20 active | 13 (eff %) | 0.7 | adds | Active uptime. |
| `fire_rate` | 32% × uptime | 11 (eff %) | 0.7 | adds | Active. |
| `bullet_damage` | +6% (Vitality, no weapon baseline) | 6 (eff gun-dmg %) | 0.1 | adds | Vitality item — only explicit. |
| `gun_burst_damage` | fire-rate burst window | 16 (dmg-% within 1s) | 0.2 | adds | R2 (fire_rate burst-heavy). |
| `gun_continuous_damage` | sustained lift | 7 (dmg-% outside 1s) | 0.1 | adds | R2. |
| `self_heal` | bullet-lifesteal sustain | 85 (HP total) | 0.4 | adds | 14% × ~600 gun dmg. |
| `continous_heal` | lifesteal outside 1s | 75 (HP outside 1s) | 0.2 | adds | Sustained pings. |
| `burst_heal` | first-1s lifesteal | 10 (HP within 1s) | 0.0 | adds | Initial. |
| `high_max_hp` | +100 + T3 baseline | 129 (HP) | 0.5 | adds | 100 + 29. |
| `damage_sponge` | lifesteal+resist on cooldown | 35 (% importance) | — | relies | R26. |

---

## Healing Nova
- **normalized_name**: `healing_nova` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_health_nova`
- **wiki**: https://deadlock.wiki/Healing_Nova

### Interpretation
AoE burst heal: 325 Total HP regen in 2s, 18m aura; +5% Ability Range, +8 SP. Per 04: BURST heal (single-tick), NOT continuous.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +5% | Passive |
| Spirit Power | +8 | Passive |
| Total HP Regen | 325 | Active (AoE) |
| Regen Duration | 2s | Active |
| Aura Radius | 18m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `team_heal` | 325 × ~3 allies in 18m | 700 (HP total) | 2.0 | adds | AoE heal benefits team. |
| `self_heal` | self contribution | 325 (HP total) | 1.4 | adds | Self-targeted in nova too. |
| `burst_heal` | 325 in 2s ≈ ~160 in first 1s | 160 (HP within 1s) | 0.8 | adds | Per 04: BURST heal flavor (tight 2s window). |
| `continous_heal` | rest outside 1s | 165 (HP outside 1s) | 0.5 | adds | 325 − 160. |
| `aoe_cluster` | 18m heal aura | 65 (% importance) | 1.6 | adds | Wide AoE. |
| `assist_importance` | team-heal pulse | 80 (% importance) | 1.9 | adds | R27: niche team support. |
| `range_extender_dependant` | +5% Range | 5 (eff %) | 0.2 | adds | Direct. |
| `close_to_team` | 18m aura wants team grouped | 40 (% importance) | 1.1 | adds | Aura wants team. |
| `spirit_damage` | +8 SP (Vitality) | 8 (SP-equiv) | 0.2 | adds | Direct. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `counter_importance` | reactive vs burst | 45 (% importance) | 0.9 | adds | R13. |

---

## Lifestrike
- **normalized_name**: `lifestrike` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_boxing_glove`
- **wiki**: https://deadlock.wiki/Lifestrike

### Interpretation
Melee lifesteal upgrade: +16% Melee Damage, +125 HP, on-melee 100 heal + 30% melee heal-on-hit %, -60% MS slow, 2.5s. ⚖️ MELEE lifesteal (NOT bullet) — does NOT count for bullet_lifesteal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +16% | Passive |
| Bonus Health | +125 | Passive |
| Move Speed Conditional | -60% | Passive (enemy slow on hit) |
| Heal on Melee Hit | 100 | Passive |
| Melee Hit Heal | 30% | Passive |
| Slow Duration | 2.5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +16% + heal-on-hit synergy | 22 (eff melee-dmg %) | 0.9 | adds | Strong direct melee dmg. |
| `self_heal` | 100 HP + 30% melee heal × melee hits | 170 (HP total) | 0.8 | adds | 100 base × ~1.5 procs + 30% melee-heal lift. |
| `burst_heal` | each melee proc instant within 1s | 100 (HP within 1s) | 0.5 | adds | Single-tick on contact. |
| `movement_slow` | -60% × 2.5s × melee-trigger | 60 (eff slow weighted) | 1.8 | adds | 60 × ~0.4 melee uptime × 1 target. |
| `close_range` | melee-only | 95 (% importance) | 2.0 | adds | R21. |
| `long_range` | anti-affinity | -45 (% importance) | -1.0 | adds | R30. |
| `engage` | melee strikes commit | 75 (% importance) | 1.7 | adds | R11. |
| `grounded` | melee = grounded | 50 (% importance) | 2.0 | adds | R7. |
| `high_max_hp` | +125 + T3 baseline | 154 (HP) | 0.6 | adds | 125 + 29. |
| `damage_sponge` | melee brawler (incidental) | 30 (% importance) | — | relies | R26. |

---

## Majestic Leap
- **normalized_name**: `majestic_leap` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_rocket_booster`
- **wiki**: https://deadlock.wiki/Majestic_Leap

### Interpretation
Active jump-burst with barrier: 200×12 Barrier (huge), 5s Interrupt Cooldown, +50% Air Control, 8s. Mobility + shield combo.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier Conditional | 200 × 12 | Active |
| Interrupt Cooldown | 5s | Active |
| Barrier Duration | 8s | Active |
| Air Control | +50% | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 200 × 12 = 2400 nominal × ~0.3 uptime | 700 (shield HP) | 2.0 | adds | Massive nominal but cooldown-gated. |
| `vertical_mobility` | active jump-burst | 2 (units) | 0.7 | adds | Major vertical traverse. |
| `aerial` | +50% air control during active | 70 (% importance) | 1.6 | adds | Aerial-focused active. |
| `escape` | jump = disengage | 65 (% importance) | 1.2 | adds | Major escape tool. |
| `engage` | jump = also commit | 35 (% importance) | 0.8 | adds | Engage utility. |
| `interrupt` | 5s interrupt cooldown reduction? | 10 (eff freq) | 0.3 | adds | Item helps recover post-interrupt. |
| `cc_resist` | interrupt resilience | 12 (eff %) | 0.6 | adds | Partial recovery. |
| `damage_sponge` | shield-on-cast (incidental) | 40 (% importance) | — | relies | R26. |
| `burst_resistance` | shield absorbs burst | 35 (eff %) | 1.4 | adds | Per 01. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |

---

## Metal Skin
- **normalized_name**: `metal_skin` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_metal_skin`
- **wiki**: https://deadlock.wiki/Metal_Skin

### Interpretation
Active bullet damage immunity: +12% Bullet Resist passive, active grants 5s of full weapon damage absorption (blocks damage entirely, NOT evasion per Notes), -1.5m MS penalty, -20% dash. Per Notes: on-bullet-hit effects + Build-Ups (Haze Fixation, Mirage Djinn's Mark, Slowing Bullets) still apply — only the DAMAGE is blocked. Doesn't block Paradox Kinetic Carbine (spirit damage). ⚖️ Strong gun_burst_resistance, NOT a bullet_evasion item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +12% | Passive |
| Active Effect | Block 100% Weapon Damage | Active (NOT evasion; build-ups still apply) |
| Active Movespeed Penalty | -1.5m | Active |
| Dash Distance | -20% | Active (self penalty) |
| Duration | 5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +12% passive + 100% damage block × 5/20 active | 37 (eff %) | 1.9 | adds | 12 + (100 × 0.25 active uptime). Per Notes: blocks damage entirely during active. |
| `melee_resistance` | bullet pseudo | 18 (eff %) | 0.8 | adds | Per 01. |
| `gun_burst_resistance` | tanks gun burst windows entirely during active | 60 (eff %) | 2.0 | adds | Per 01 anchor: active blocks ALL weapon damage = strongest burst-R counter. |
| `gun_continuous_resistance` | sustained gun defense during active | 35 (eff %) | 2.0 | adds | Same active blocks sustained too. |
| `burst_resistance` | active = full burst absorb window | 50 (eff %) | 2.0 | adds | Per 01: damage absorption during active. |
| `counter_importance` | reactive vs gun comps | 65 (% importance) | 1.3 | adds | R13/R27. |
| `damage_sponge` | reactive defense on cooldown (incidental) | 30 (% importance) | — | relies | R26. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `horizontal_mobility` | -1.5m active penalty | -0.4 (m/s eff) | -0.3 | adds | Active penalty. |
| `vertical_mobility` | -20% dash penalty | -0.4 (units) | -0.1 | adds | Self penalty. |

---

## Rescue Beam
- **normalized_name**: `rescue_beam` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_rescue_beam`
- **wiki**: https://deadlock.wiki/Rescue_Beam

### Interpretation
Dedicated ally save: 20% Heal Amount channel 2.5s, 35m cast range, +0.75m sprint, +6% Ability Range. The T3 ally-target support item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +0.75m | Passive |
| Ability Range | +6% | Passive |
| Heal Amount | 20% | Active (channeled) |
| Channel Duration | 2.5s | Active |
| Cast Range | 35m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `team_heal` | 20% ally max HP per cast | 250 (HP total) | 0.7 | adds | ~20% × 1000 ally HP × ~0.4 trigger uptime × 1 cast = 250. |
| `burst_heal` | 20% over 2.5s channel = bursty | 80 (HP within 1s) | 0.4 | adds | ~80 HP within first 1s of channel. |
| `continous_heal` | rest over 1.5s | 120 (HP outside 1s) | 0.4 | adds | Remaining channel. |
| `assist_importance` | dedicated ally heal | 85 (% importance) | 2.0 | adds | R27: high niche support. |
| `counter_importance` | reactive save | 55 (% importance) | 1.1 | adds | R13. |
| `range_extender_dependant` | +6% Range | 6 (eff %) | 0.3 | adds | Direct. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) | 0.3 | adds | Sprint × 0.5. |
| `close_to_team` | ally-cast benefits from team | 50 (% importance) | 1.4 | adds | Team-utility. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `farmer` | mobility + sustain | 20 (% importance) | 0.4 | adds | R28 small. |

---

## Spirit Resilience
- **normalized_name**: `spirit_resilience` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_tech_purge`
- **wiki**: https://deadlock.wiki/Spirit_Resilience

### Interpretation
Major spirit-resist defensive: +30% Spirit Resist, +3 OOC, +15% Spirit Resist Conditional. ⚖️ The judgment anchor for `spirit_resistance` (best effect-per-cost, beats Fury Trance's raw 40%).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +30% | Passive |
| Out of Combat Regen | +3 | Passive |
| Spirit Resist Conditional | +15% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +30% + 15% × uptime | 39 (eff %) | 2.0 | adds | ⚖️ Named judgment anchor for spirit_resistance. |
| `spirit_continuous_resistance` | sustained spirit defense | 30 (eff %) | 2.0 | adds | Per 01. |
| `spirit_burst_resistance` | spirit burst partial | 15 (eff %) | 0.5 | adds | Per 01 (flat resist ~0.3x burst). |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `self_heal` | +3 OOC | 14 (HP total) | 0.1 | adds | Standard. |
| `continous_heal` | OOC outside 1s | 12.6 (HP outside 1s) | 0.0 | adds | 3 × 14 × 0.3. |
| `damage_sponge` | spirit-tank synergy | 30 (% importance) | — | relies | R26. |

---

## Stamina Mastery
- **normalized_name**: `stamina_mastery` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_superior_stamina`
- **wiki**: https://deadlock.wiki/Stamina_Mastery

### Interpretation
Major stamina bundle: +2 Stamina, +18% Stamina Recovery, +23% Air Jump/Dash Distance. The T3 named anchor for `vertical_mobility` (per 03 anchor table).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +2 | Passive |
| Stamina Recovery | +18% | Passive |
| Air Jump/Dash Distance | +23% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +2 stamina + 23% dash | 2 (units) | 0.7 | adds | T3 anchor for vertical. |
| `horizontal_mobility` | +2 stamina dashes | 1.4 (m/s eff) | 1.5 | adds | R9: 2 × 0.7. |
| `aerial` | +23% air dash + +2 stamina | 70 (% importance) | 1.6 | adds | R9 — aerial focused. |
| `engage` | extra dashes commit | 65 (% importance) | 1.4 | adds | R9. |
| `escape` | extra dashes retreat | 65 (% importance) | 2.0 | adds | R9. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.2 | adds | R31. |
| `small_hitbox` | mobility partial | 30 (% importance) | 1.2 | adds | R26 incidental. |
| `farmer` | mobility helps rotations | 25 (% importance) | 1.7 | adds | R28. |

---

## Trophy Collector
- **normalized_name**: `trophy_collector` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_trophy_collector`
- **wiki**: https://deadlock.wiki/Trophy_Collector

### Interpretation
Soul-stack rotation tool: -15% NPC dmg (penalty for non-NPC stacker?), +2m Sprint, +2 OOC; +0.15m Sprint and +0.75% Range per stack (16 max), 18 souls/min. Scaling_late flavor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs. NPCs | -15% | Passive (penalty) |
| Sprint Speed | +2m | Passive |
| Out of Combat Regen | +2 | Passive |
| Sprint Speed per Stack | +0.15m | Stacking |
| Ability Range per Stack | +0.75% | Stacking |
| Souls per Minute | 18 | Stacking |
| Max Stacks | 16 | Stacking |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | souls/min via stacking | 60 (% importance) | — | adds | R28: dedicated econ-stack item. |
| `scaling_late` | stack-eco rewards prolonged play | 65 (% importance) | 1.6 | adds | Stacks compound late. |
| `horizontal_mobility` | +2m sprint + stacks | 1.0 (m/s eff) | — | adds | 2 × 0.5 + (0.15 × ~10 stacks × 0.5). |
| `range_extender_dependant` | +0.75% × stacks | 9 (eff %) | 0.4 | adds | 0.75 × ~12 avg stacks. |
| `self_heal` | +2 OOC | 9 (HP total) | 0.0 | adds | Standard. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) | 0.0 | adds | 2 × 14 × 0.3. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | — | adds | R31. |
| `escape` | sprint + mobility | 40 (% importance) | — | adds | Mobility utility. |

---

## Veil Walker
- **normalized_name**: `veil_walker` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_veil_walker`
- **wiki**: https://deadlock.wiki/Veil_Walker

### Interpretation
Invisibility + burst heal: +2m Sprint, +2 OOC, +125 HP, +10 SP; Invisibility status with 3.5m invis-MS, 85 burst heal, 8s. Per 04 judgment: BURST heal (NOT continuous).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +2m | Passive |
| Out of Combat Regen | +2 | Passive |
| Bonus Health | +125 | Passive |
| Spirit Power | +10 | Passive |
| Status Effect | Invisible | Active |
| Invis Move Speed Conditional | 3.5m | Active |
| Heal | 85 | Active (on activation) |
| Invisibility Duration | 8s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `burst_heal` | 85 HP on cast within 1s | 85 (HP within 1s) | 0.4 | adds | Per 04: BURST heal. |
| `self_heal` | 85 per cast | 65 (HP total) | 0.3 | adds | 85 × ~0.75 cast freq. |
| `horizontal_mobility` | +2m sprint + invis-MS active | 2.5 (m/s eff) | 1.6 | adds | Sprint × 0.5 + active 3.5 × 0.4 active uptime. |
| `escape` | invis = clean disengage | 80 (% importance) | 1.5 | adds | Strong escape. |
| `engage` | invis-flank initiate | 55 (% importance) | 1.2 | adds | R11. |
| `bullet_evasion` | invis dodges incoming | 25 (eff %) | 1.7 | adds | Stealth defense. |
| `away_from_team` | flank-tool | 50 (% importance) | 2.0 | adds | Solo/flank flavor. |
| `spirit_damage` | +10 SP (Vitality) | 10 (SP-equiv) | 0.2 | adds | Direct. |
| `high_max_hp` | +125 + T3 baseline | 154 (HP) | 0.6 | adds | 125 + 29. |
| `small_hitbox` | invis effectively zero-hitbox | 50 (% importance) | 2.0 | adds | Stealth = harder to hit. |

---

## Warp Stone
- **normalized_name**: `warp_stone` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_warp_stone`
- **wiki**: https://deadlock.wiki/Warp_Stone

### Interpretation
Active teleport + resist: 11m Teleport, +30% Bullet Resist 6s. The clean escape teleport — ⚖️ judgment anchor for `escape` (Warp Stone is the clean teleport-away anchor).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Teleport Range | 11m | Active |
| Bullet Resist Conditional | +30% | Active |
| Buff Duration | 6s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `escape` | clean 11m teleport | 85 (% importance) | 1.6 | adds | ⚖️ Named anchor for clean teleport-escape. |
| `engage` | teleport in also possible | 50 (% importance) | 1.1 | adds | Bidirectional but escape-flavored primarily. |
| `bullet_resistance` | +30% × 6/30 active | 9 (eff %) | 0.5 | adds | Active uptime. |
| `melee_resistance` | bullet pseudo | 4.5 (eff %) | 0.2 | adds | Per 01. |
| `gun_burst_resistance` | post-tp resist | 12 (eff %) | 0.4 | adds | Bullet resist + tp removes you from the line of fire. |
| `horizontal_mobility` | teleport active mobility | 1.5 (m/s eff) | 1.0 | adds | 11m / typical 15s cooldown effective. |
| `counter_importance` | reactive vs burst | 60 (% importance) | 1.2 | adds | R13. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `damage_sponge` | reactive defense (incidental) | 25 (% importance) | — | relies | R26. |

---

## Decay
- **normalized_name**: `decay` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_rupture`
- **wiki**: https://deadlock.wiki/Decay

### Interpretation
Anti-heal + DoT active: 2.6%/s Bleed (+0.004×SP), -50% Healing Reduction, 10s, 20+0.1×SP cast range. ⚖️ High-priority `debuff` anchor + dedicated `anti_heal`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +8 | Passive |
| Bonus Health | +65 | Passive |
| Bleed Damage | 2.6 + 0.004×SP %/s | Active (DoT) |
| Healing Reduction Conditional | -50% | Active |
| Cast Range | 20 + 0.1×SP | Active |
| Duration | 10s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -50% × 10s × ~0.5 cycle | 40 (eff %) | 2.0 | adds | Strong active anti-heal. |
| `dot` | 2.6%/s × 10s = ~26% target HP | 260 (raw dmg) | 2.0 | adds | 26% of ~1000 HP = 260 raw DoT. |
| `debuff` | high-priority (priority cleanse) | 70 (% importance) | 1.8 | adds | ⚖️ Per tag_desc: Decay is a top-priority debuff. |
| `counter_importance` | dedicated anti-sustain counter | 80 (% importance) | 1.6 | adds | R27. |
| `spirit_damage` | dot SP-equiv + T3 baseline | 60 (SP-equiv) | 1.4 | adds | DoT amortized as SP-equiv + 8.3 baseline. |
| `spirit_continuous_damage` | sustained DoT | 240 (raw dmg outside 1s) | 2.0 | adds | Full DoT outside 1s. |
| `spirit_continuous_proc` | sustained debuff stream | 0.4 (proc index) | 0.9 | adds | R5. |
| `pure_damage` | %max-HP DoT counts | 30 (eff dmg) | 0.7 | adds | %max-HP bleed = pure-damage flavor. |
| `single_target` | targeted active | 65 (% importance) | 2.0 | adds | Targeted. |
| `mid_range` | ~22m cast | 35 (% importance) | 1.6 | adds | Mid range. |
| `long_range` | 22m partial | 22 (% importance) | 0.5 | adds | Borderline. |
| `high_max_hp` | +65 HP (Spirit) | 65 (HP) | 0.3 | adds | Explicit. |

---

## Disarming Hex
- **normalized_name**: `disarming_hex` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_greater_withering_whip`
- **wiki**: https://deadlock.wiki/Disarming_Hex

### Interpretation
Active disarm + bullet shred: Disarm + -13% Bullet Resist, 32m cast, 4.25s. ⚖️ Disarm anchor at T3.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Sprint Speed | +0.75m | Passive |
| Status Effect | Disarm | Active |
| Bullet Resist Conditional | -13% | Active (debuff) |
| Cast Range | 32m | Active |
| Duration | 4.25s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `disarm` | 4.25s × 1 target | 4 (s × count) | 2.0 | adds | Direct duration × target. T3 anchor. |
| `bullet_resist_shred` | -13% × 4.25/25 cycle | 4 (eff shred %) | 0.4 | adds | Active single-target. |
| `bullet_resistance` | disarm pseudo (no bullets fired) | 8 (eff %) | 0.4 | adds | Per 01: disarm ~0.4x bullet_resistance for duration. |
| `gun_continuous_resistance` | sustained gun shutoff | 12 (eff %) | 0.7 | adds | Disarm primarily denies sustained fire. |
| `gun_burst_resistance` | disarm during burst | 8 (eff %) | 0.3 | adds | Disarm blocks burst too. |
| `counter_importance` | anti-gun-comp counter | 75 (% importance) | 1.5 | adds | R27. |
| `single_target` | targeted disarm | 65 (% importance) | 2.0 | adds | Single-target active. |
| `long_range` | 32m cast | 35 (% importance) | 0.8 | adds | Long cast. |
| `mid_range` | also mid | 25 (% importance) | 1.1 | adds | Partial. |
| `debuff` | high-priority debuff | 50 (% importance) | 1.2 | adds | Disarm is priority. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) | 0.3 | adds | Explicit. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) | 0.3 | adds | Sprint × 0.5. |

---

## Greater Expansion
- **normalized_name**: `greater_expansion` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_tech_range`
- **wiki**: https://deadlock.wiki/Greater_Expansion

### Interpretation
Pure range extender: +30% Ability Range, +10% Spirit Resist. T3 imbued-or-universal? Codename `upgrade_tech_range` — NOT imbue suffix; treat as kit-wide.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Ability Range | +30% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +30% Range | 30 (eff %) | 1.3 | adds | T3 range anchor. |
| `multi_ability_focus` | kit-wide range | 60 (% importance) | 1.7 | adds | R4. |
| `spirit_resistance` | +10% | 10 (eff %) | 0.5 | adds | Direct. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) | -0.5 | adds | R4. |

---

## Knockdown
- **normalized_name**: `knockdown` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_target_stun`
- **wiki**: https://deadlock.wiki/Knockdown

### Interpretation
Stun + ground-lock: Stun status, 0.5s stun, 45m cast range, +75 HP, +5% Range. ⚖️ The named anchor for `stun` and `anti_air` (drops enemies to ground).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Ability Range | +5% | Passive |
| Status Effect | Stun | Active |
| Stun Duration | 0.5s | Active |
| Cast Range | 45m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `stun` | 0.5s × 1 target × ~6 casts/fight | 1.0 (eff s) | 2.0 | adds | T3 stun anchor. |
| `anti_air` | drops airborne enemies | 75 (% importance) | 2.0 | adds | ⚖️ Per tag_desc: Knockdown is THE anti-air anchor. |
| `interrupt` | hard interrupt | 60 (eff freq) | 1.6 | adds | Channel-ult interrupt. |
| `counter_importance` | counter to ult-channel + flying | 75 (% importance) | 1.5 | adds | R27. |
| `single_target` | targeted stun | 65 (% importance) | 2.0 | adds | Targeted active. |
| `long_range` | 45m cast | 60 (% importance) | 1.3 | adds | Long cast for stun. |
| `mid_range` | also covers mid | 30 (% importance) | 1.3 | adds | Mid. |
| `debuff` | priority stun debuff | 35 (% importance) | 0.9 | adds | Cleanseable, priority. |
| `engage` | stun sets up engage | 50 (% importance) | 1.1 | adds | R11. |
| `displace` | knockdown displaces airborne | 8 (e × m) | 0.6 | adds | Vertical knock. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) | 0.3 | adds | Explicit. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |
| `range_extender_dependant` | +5% Range | 5 (eff %) | 0.2 | adds | Small direct. |

---

## Radiant Regeneration
- **normalized_name**: `radiant_regeneration` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_resonant_healing`
- **wiki**: https://deadlock.wiki/Radiant_Regeneration

### Interpretation
Triggered regen + ability-cast heal: 4 HP/s for 7s; on ability cast 70 heal + 1.75m MS for 3s; +90 HP. Hybrid sustain item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +90 | Passive |
| HP/s Regeneration | 4 | Triggered |
| Regeneration Duration | 7s | Triggered |
| Healing on Ability Cast | 70 | Active |
| Move Speed | +1.75m | Active |
| Duration | 3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 4×7×0.75 trigger + 70 per-cast | 90 (HP total) | 0.4 | adds | 21 (regen) + ~70 ability-cast heal per fight. |
| `continous_heal` | 4 × 6s × 0.75 + cast-heal outside 1s | 30 (HP outside 1s) | 0.1 | adds | 18 regen outside 1s + ~10 cast-heal beyond. |
| `burst_heal` | regen first 1s + per-cast | 70 (HP within 1s) | 0.3 | adds | 70 burst per cast within 1s. |
| `horizontal_mobility` | +1.75m × 3/15 active | 0.4 (m/s eff) | 0.3 | adds | Active. |
| `high_max_hp` | +90 HP (Spirit) | 90 (HP) | 0.4 | adds | Explicit. |
| `high_max_hp` | heal scales with HP | 18 (HP) | — | relies | R8. |
| `damage_sponge` | regen on damage trigger | 30 (% importance) | — | relies | R26 partial. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |
| `farmer` | sustain enables farm | 30 (% importance) | 0.6 | adds | R28. |
| `ability_spam` | per-cast trigger rewards spam | 35 (% importance) | 0.9 | adds | The ability-cast heal incentivizes casts. |

---

## Rapid Recharge
- **normalized_name**: `rapid_recharge` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_rapid_recharge`
- **wiki**: https://deadlock.wiki/Rapid_Recharge

### Interpretation
Heavy charge-economy: +2 charges, +30% faster recharge, +14% CDR for charged, +14 Bonus SP for charged. ⚖️ The named anchor for `charge_dependant` at T3.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Ability Charges | +2 | Passive |
| Faster Time Between Charges | +30% | Passive |
| Cooldown Reduction For Charged Abilities | +14% | Passive |
| Bonus Spirit Power for Charged Abilities | +14 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +2 charges + 30% faster + 14% CDR | 95 (% importance) | 2.0 | adds | ⚖️ Named anchor for charge_dependant. |
| `cooldown_reduction` | +14% CDR + 30% faster + extra charges | 25 (eff CDR %) | 1.5 | adds | R29: combined effective CDR. |
| `spirit_damage` | +14 SP for charged × uptime + baseline | 16 (SP-equiv) | 0.4 | adds | (14 × 0.6 charged-uptime) + 8.3 baseline. |
| `single_ability_focus` | charges bind primarily to one slot | 60 (% importance) | 1.5 | adds | Most heroes one charged ability. |
| `ability_spam` | extra charges = spam | 70 (% importance) | 1.9 | adds | Direct spam-enabler. |
| `spirit_burst_damage` | charged-ability burst | 9 (dmg-equiv within 1s) | 0.1 | adds | R2. |
| `spirit_continuous_damage` | charged-ability sustained | 9 (dmg-equiv outside 1s) | 0.1 | adds | R2. |
| `farmer` | charge-eco = farm casts | 40 (% importance) | 0.8 | adds | R28/R29. |
| `multi_ability_focus` | partial — some heroes have multiple | 25 (% importance) | 0.7 | adds | Some heroes have multi-charge kits. |

---

## Silence Wave
- **normalized_name**: `silence_wave` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_targeted_silence`
- **wiki**: https://deadlock.wiki/Silence_Wave

### Interpretation
AoE silence + damage: Silenced status, 75+0.7×SP damage, 40m cast range, 3s silence. ⚖️ Named anchor for `silence`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Status Effect | Silenced | Active |
| Damage | 75 + 0.7×SP | Active |
| Cast Range | 40m | Active |
| Silence Duration | 3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 3s × ~2 abilities denied | 6 (weighted) | 1.0 | adds | T3 anchor: 3s denies ~2 ability casts. |
| `spirit_resistance` | silence pseudo (no spirit dmg from silenced) | 8 (eff %) | 0.4 | adds | Per 01: silence ~0.3x toward spirit_resistance. |
| `counter_importance` | anti-spirit-caster | 75 (% importance) | 1.5 | adds | R27. |
| `interrupt` | breaks channels | 50 (eff freq) | 1.3 | adds | Silence interrupts. |
| `single_target` | targeted silence | 55 (% importance) | 1.7 | adds | Targeted. |
| `spirit_damage` | 75+0.7×SP /5 + T3 baseline | 26 (SP-equiv) | 0.6 | adds | (75+14)/5 + 8.3 = 26. |
| `spirit_burst_damage` | active instant dmg in 1s | 89 (raw dmg within 1s) | 1.1 | adds | 75 + 0.7×20 = 89 instant. |
| `spirit_burst_proc` | instant active proc | 0.9 (proc index) | 2.0 | adds | Instant trigger, large effect. |
| `long_range` | 40m cast | 50 (% importance) | 1.1 | adds | Long. |
| `mid_range` | partial | 25 (% importance) | 1.1 | adds | Partial. |
| `debuff` | priority silence debuff | 45 (% importance) | 1.1 | adds | Priority. |
| `high_max_hp` | +50 HP (Spirit) | 50 (HP) | 0.2 | adds | Explicit. |

---

## Spirit Snatch
- **normalized_name**: `spirit_snatch` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_spirit_snatch`
- **wiki**: https://deadlock.wiki/Spirit_Snatch

### Interpretation
Melee-spirit hybrid: 50 + 0.84×SP Spirit Damage, 12% Spirit Resist Steal, 25 SP Steal, 10s, +7% Melee Dmg, +75 HP. Significant melee-spirit hybrid item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +7% | Passive |
| Bonus Health | +75 | Passive |
| Spirit Damage | 50 + 0.84×SP | Passive (melee proc) |
| Spirit Resist Steal Conditional | 12% | Passive (on melee) |
| Spirit Power Steal Conditional | 25 | Passive |
| Duration | 10s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | (50+0.84×20)/5 proc + 25 steal × uptime + T3 baseline | 30 (SP-equiv) | 0.9 | adds | (50+16.8)/5 = 13.4 + 25×0.4 steal + 8.3 baseline. |
| `spirit_damage` | proc scales with SP | 17 (SP-equiv) | — | relies | The 0.84×SP scaling. |
| `spirit_resist_shred` | 12% × melee-uptime | 6 (eff shred %) | 0.5 | adds | 12 × ~0.5 melee uptime. |
| `spirit_burst_proc` | melee-trigger proc | 0.9 (proc index) | 2.0 | adds | Burst-flavored melee proc. |
| `melee_damage` | +7% + spirit-on-melee | 15 (eff melee-dmg %) | 0.6 | adds | Direct + R12 melee-counts. |
| `spirit_burst_damage` | proc dmg in 1s | 67 (raw dmg within 1s) | 0.8 | adds | 50 + 0.84×20 = 66.8 per melee hit. |
| `close_range` | melee-trigger | 80 (% importance) | 1.7 | adds | R21. |
| `long_range` | anti-affinity | -35 (% importance) | -0.8 | adds | R30. |
| `grounded` | melee = grounded | 45 (% importance) | 1.8 | adds | R7. |
| `engage` | melee commits | 60 (% importance) | 1.3 | adds | R11. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) | 0.3 | adds | Explicit. |
| `self_buff` | 25 SP steal × uptime is self-state | 35 (% importance) | 1.0 | adds | R19 legitimate buff state. |

---

## Superior Cooldown
- **normalized_name**: `superior_cooldown` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_cooldown_reduction`
- **wiki**: https://deadlock.wiki/Superior_Cooldown

### Interpretation
Pure CDR upgrade: +20% Ability CDR, +4 OOC.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4 | Passive |
| Ability Cooldown Reduction | +20% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +20% CDR | 20 (eff CDR %) | 1.2 | adds | Direct passive. |
| `multi_ability_focus` | kit-wide CDR | 60 (% importance) | 1.7 | adds | R4. |
| `ability_spam` | CDR enables spam | 50 (% importance) | 1.3 | adds | Enabler. |
| `self_heal` | +4 OOC | 18 (HP total) | 0.1 | adds | 4 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 16.8 (HP outside 1s) | 0.1 | adds | 4 × 14 × 0.3. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) | -0.5 | adds | R4. |

---

## Superior Duration
- **normalized_name**: `superior_duration` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_imbued_duration_extender`
- **wiki**: https://deadlock.wiki/Superior_Duration

### Interpretation
T3 duration anchor: +28% Ability Duration, +8% Bullet Resist. ⚖️ The named anchor for `duration_dependant` at T3 (per 03: Superior Duration T3 28%). Codename has `imbued` suffix per R23 — but this item's stat says "Ability Duration" without imbue restriction in the data; check codename. Note codename = `upgrade_imbued_duration_extender` → R23 applies, single-ability.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +8% | Passive |
| Ability Duration | +28% | Passive (imbued — single ability per R23) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `duration_dependant` | +28% Duration | 28 (eff %) | 1.7 | adds | T3 named anchor. |
| `single_ability_focus` | imbue → one ability | 75 (% importance) | 1.9 | adds | R23: codename has `imbued`. |
| `bullet_resistance` | +8% Bullet Resist | 8 (eff %) | 0.4 | adds | Direct. |
| `melee_resistance` | bullet pseudo | 4 (eff %) | 0.2 | adds | Per 01. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) | 0.2 | adds | R31. |

---

## Surge of Power
- **normalized_name**: `surge_of_power` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_magic_storm`
- **wiki**: https://deadlock.wiki/Surge_of_Power

### Interpretation
Imbue post-cast buff: +28 Imbued Ability SP, 20% Fire Rate Conditional, +1.75m MS, 8s. Hybrid spirit-gun via imbue.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Imbued Ability Spirit Power | +28 | Passive (imbued) |
| Fire Rate Bonus Conditional | 20% | Passive (post-cast) |
| Move Speed Conditional | +1.75m | Passive (post-cast) |
| Move Speed Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +28 SP for imbued + T3 baseline | 25 (SP-equiv) | 2.0 | adds | (28 × ~0.6 imbue-uptime) + 8.3 baseline = 25. |
| `single_ability_focus` | imbue → one ability | 75 (% importance) | 1.9 | adds | R23. |
| `fire_rate` | +20% × uptime | 8 (eff %) | 0.5 | adds | 20 × ~0.4 post-cast uptime. |
| `horizontal_mobility` | +1.75m × 8/20 | 0.5 (m/s eff) | 0.3 | adds | Active uptime. |
| `spirit_burst_damage` | post-cast SP burst | 14 (dmg-equiv within 1s) | 2.0 | adds | R2 + cast-burst flavor. |
| `spirit_continuous_damage` | SP lifts sustained | 14 (dmg-equiv outside 1s) | 1.2 | adds | R2. |
| `gun_burst_damage` | fire-rate burst window | 9 (dmg-% within 1s) | 0.1 | adds | R2 (fire_rate burst-heavy). |
| `hybrid_damage_usage` | spirit+gun bridge | 55 (% importance) | 1.1 | adds | Hybrid imbue. |
| `self_buff` | post-cast buff state | 50 (% importance) | 1.4 | adds | R19 legitimate buff. |

---

## Tankbuster
- **normalized_name**: `tankbuster` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_magic_shock`
- **wiki**: https://deadlock.wiki/Tankbuster

### Interpretation
Anti-tank %max-HP proc with Charge-Up mechanic (NOT affected by CDR per Notes): 40 base + 8% Current Health Bonus Damage, +50 HP. Only goes on cooldown when affecting enemy heroes (free on NPC use). Damage threshold trigger is pre-resistance — resist/amp don't help or block trigger.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Damage | 40 | Passive (proc) |
| Current Health Bonus Damage | 8% | Passive (%current HP) |
| Mechanic | Charge-Up | NOT affected by CDR |
| Cooldown trigger | Hero hit only | Free use on NPCs |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 8% current HP bonus damage | 80 (eff dmg) | 1.9 | adds | %max-HP scaling damage — anti-tank pure dmg axis. |
| `counter_importance` | dedicated anti-tank counter | 80 (% importance) | 1.6 | adds | R27: dedicated tank-buster. |
| `spirit_damage` | 40 + 8%HP proc as SP-equiv + T3 baseline | 25 (SP-equiv) | — | adds | Per 01 amortized. |
| `spirit_continuous_proc` | per-ability proc | 0.4 (proc index) | 2.0 | adds | R5 continuous-flavor. |
| `spirit_burst_proc` | first-proc burst | 0.5 (proc index) | 1.1 | adds | R5. |
| `spirit_burst_damage` | first-trigger dmg in 1s | 120 (raw dmg within 1s) | — | adds | 40 + 8%×1000HP = 120 raw on a 1000-HP target. |
| `charge_dependant` | Charge-Up mechanic per Notes | 50 (% importance) | 1.1 | adds | Charge-Up item — fits charge_dependant axis. |
| `farmer` | free use on NPCs (no CD trigger) per Notes | 25 (% importance) | 1.3 | adds | Cooldown only triggers on heroes; can spam on NPCs. |
| `high_max_hp` | +50 HP (Spirit) | 50 (HP) | 0.6 | adds | Explicit. |

---

## Torment Pulse
- **normalized_name**: `torment_pulse` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_tech_damage_pulse`
- **wiki**: https://deadlock.wiki/Torment_Pulse

### Interpretation
Aura AoE DoT: 25 + 0.23×SP pulse damage, 9m radius passive. Constant-pressure DoT aura.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Melee Resist | +18% | Passive |
| Pulse Damage | 25 + 0.23×SP | Passive (AoE pulse) |
| Pulse Radius | 9m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 9m AoE pulse | 60 (% importance) | 1.5 | adds | AoE flavor. |
| `spirit_damage` | (25+0.23×20)×pulses /5 + T3 baseline | 38 (SP-equiv) | — | adds | (29.6 × ~5 pulses/fight)/5 + 8.3 = 38. |
| `spirit_continuous_damage` | sustained pulse DPS outside 1s | 130 (raw dmg outside 1s) | — | adds | Sustained pulse damage. |
| `spirit_burst_damage` | first pulse within 1s | 30 (raw dmg within 1s) | — | adds | First pulse. |
| `spirit_continuous_proc` | passive pulse-on-tick | 0.45 (proc index) | — | adds | R5 continuous. |
| `melee_resistance` | +18% | 18 (eff %) | 0.8 | adds | Direct passive. |
| `close_range` | 9m aura → close-fight friendly | 50 (% importance) | 1.1 | adds | Aura helps in close brawl. |
| `farmer` | aura clears nearby NPCs | 40 (% importance) | — | adds | R28. |
| `high_max_hp` | +100 HP (Spirit) | 100 (HP) | — | adds | Explicit. |
| `damage_sponge` | aura works while taking hits (incidental) | 25 (% importance) | — | relies | R26. |


---

# T4 (6400 souls)

## Armor Piercing Rounds
- **normalized_name**: `armor_piercing_rounds` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_aprounds`
- **wiki**: https://deadlock.wiki/Armor_Piercing_Rounds

### Interpretation
+60% bullet velocity, +8% weapon damage, and a 55% chance per bullet to become "unavoidable" — piercing through enemies, ignoring bullet resist, and bypassing bullet evasion. Per Notes: counters Plated Armor, Kelvin's Frozen Shelter, McGinnis' Spectral Wall (passes through), but does NOT bypass Vyper's Petrifying Bola or damage Invincible enemies. Named anchor for `bullet_resist_shred` in its hard-bypass form.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Proc Chance | 55% | Passive — bullets pierce + ignore bullet resist + bypass bullet evasion |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | 55% chance to fully bypass BR + evasion | 19 (eff shred %) | 1.4 | adds | ⚖️ Named anchor. 0.55 × ~35% effective resist bypassed ≈ 19% effective shred. |
| `bullet_damage` | +8% + 55% bypass amp + T4 baseline | 25 (eff gun-dmg %) | 0.4 | adds | 8 + (0.55 × ~17% effective BR-bypass amp) + 9.6 baseline. |
| `gun_burst_damage` | per-shot amp within 1s | 65 (raw dmg within 1s) | 0.6 | adds | R2: bullet_damage lifts burst. Per-shot bypass on burst window. |
| `gun_continuous_damage` | sustained pierce dmg outside 1s | 220 (raw dmg outside 1s) | 2.0 | adds | R2: sustained per-shot amp. |
| `gun_burst_proc` | pierce roll every shot | 0.30 (proc index) | 0.5 | adds | R6: per-shot proc, instant effect. |
| `gun_continuous_proc` | sustained pierce roll | 0.55 (proc index) | 0.8 | adds | 55% per-shot in sustained fire. |
| `counter_importance` | counters Plated Armor + evasion + resist stacking | 70 (% importance) | 1.4 | adds | R13: ⚖️ Notes explicitly call out Plated Armor + bullet evasion bypass. |
| `single_target` | bullet-only, no AoE | 55 (% importance) | 1.7 | adds | Per-bullet effect. |
| `long_range` | +60% bullet velocity favors long-range | 35 (% importance) | 0.8 | adds | Velocity benefits ranged shots most. |


---

## Capacitor
- **normalized_name**: `capacitor` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_capacitor`
- **wiki**: https://deadlock.wiki/Capacitor

### Interpretation
+5% fire rate passive plus a chain-shock proc: 43+0.19×SP shock damage, 20% proc chance per bullet (0.25s ICD), jumps 6 times within 10m. Notes: shock is Spirit Damage (reduced by Spirit Resist). Active (40s CD): 100 dmg projectile with -75% MS slow for 3s, prevents stamina, silences movement items.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +5% | Passive |
| Shock Damage | 43 + 0.19×SP | Passive (Spirit Damage, 0.25s ICD) |
| Proc Chance | 20% | Passive (per bullet) |
| Max Jumps | 6 | Passive |
| Jump Radius | 10m | Passive |
| Active Damage | 100 | Active (40s CD) |
| Active Move Speed | -75% | Active (3s slow) |
| Active Slow Duration | 3s | Active (prevents Stamina + silences movement items) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 6 jumps × 10m chain | 65 (% importance) | 1.6 | adds | Chain-lightning AoE. |
| `spirit_damage` | (43+0.19×20) × proc-rate × jumps + T4 baseline (Weapon item, no spirit baseline) | 38 (SP-equiv) | 0.6 | adds | Weapon item — no spirit baseline. 47 dmg/proc × 0.20 × ~4 effective jumps ≈ 38 SP-equiv. |
| `spirit_continuous_damage` | sustained proc dmg outside 1s | 140 (raw dmg outside 1s) | 0.8 | adds | Per-bullet proc, sustained. |
| `spirit_burst_damage` | first proc + initial chain within 1s | 50 (raw dmg within 1s) | 0.4 | adds | First-bullet shock. |
| `spirit_continuous_proc` | passive per-bullet shock | 0.50 (proc index) | 1.2 | adds | 20% per shot with 0.25s ICD ≈ 0.5. |
| `fire_rate` | +5% passive | 5 (eff %) | 0.2 | adds | Direct. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31 baseline only. |
| `movement_slow` | -75% × 3s × 1 target (active) | 32 (eff slow weighted) | 0.6 | adds | Active 3s slow. |
| `silence` | active silences movement items | 6 (weighted) | 0.7 | adds | Narrow silence (movement-only). |
| `counter_importance` | counter to mobility + stamina spam | 50 (% importance) | 1.0 | adds | R13. |
| `single_ability_focus` | active is the main payoff | 35 (% importance) | 0.9 | adds | R17 partial. |


---

## Crippling Headshot
- **normalized_name**: `crippling_headshot` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_banshee_slugs`
- **wiki**: https://deadlock.wiki/Crippling_Headshot

### Interpretation
Headshot-gated armor strip + healing reduction: +125 HP, on-headshot debuff (-16% Bullet Resist, -16% Spirit Resist, -35% Healing Reduction, 12s). Per Notes: headshot damage applied BEFORE debuff, so the trigger shot doesn't benefit from the resist reduction itself.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +125 | Passive |
| Bullet Resist Conditional | -16% | Passive (on headshot, 12s) |
| Spirit Resist Conditional | -16% | Passive (on headshot, 12s) |
| Healing Reduction Conditional | -35% | Passive (on headshot, 12s) |
| Debuff Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -16% × headshot uptime | 11 (eff shred %) | 0.8 | adds | 16 × ~0.7 headshot uptime (12s buff window). |
| `spirit_resist_shred` | -16% × headshot uptime | 11 (eff shred %) | 0.7 | adds | Same. Hybrid debuff anchor. |
| `anti_heal` | -35% healing red × uptime | 25 (eff %) | 0.8 | adds | 35 × ~0.7 uptime. |
| `headshot_damage` | headshot-gated entirely | 75 (% importance) | 0.8 | adds | R29: pure headshot trigger. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `high_max_hp` | +125 HP (Weapon item, no Vitality baseline) | 125 (HP) | 0.3 | adds | Explicit HP only. |
| `single_target` | headshot is single-target | 65 (% importance) | 2.0 | adds | Per-target debuff. |
| `mid_range` | headshots favor mid-range | 45 (% importance) | 2.0 | adds | Headshot tool. |
| `counter_importance` | counter to high-resist + heal-stack builds | 60 (% importance) | 1.2 | adds | Hybrid resist + anti-heal in one. |
| `hybrid_damage_usage` | shreds BOTH BR and SR | 50 (% importance) | 1.0 | adds | Hybrid synergy. |


---

## Crushing Fists
- **normalized_name**: `crushing_fists` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_crushing_fists`
- **wiki**: https://deadlock.wiki/Crushing_Fists

### Interpretation
The melee-engage anchor: +60% Heavy Melee Distance, +22% Melee Damage, +12% Bullet Resist. Passive 1 (5s CD): next heavy melee +25% bonus damage. Passive 2 (5s CD): melee restores +15% ammo and applies stacking -4% bullet resist debuff on enemies (heavy = 2 stacks); 6 stacks = 0.5s Stun, 8s debuff duration. Many hero abilities scale with melee damage per the Affected Abilities list.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +60% | Passive |
| Melee Damage | +22% | Passive |
| Bullet Resist | +12% | Passive |
| Bonus Heavy Damage | +25% | Passive (next heavy, 5s CD) |
| Ammo Restored | +15% | Passive (on melee, 5s CD) |
| Bullet Resist Conditional | -4% | Passive (per stack on enemy) |
| Max Stacks | 6 | Passive |
| Stun Duration | 0.5s | Passive (at max stacks) |
| Debuff Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +22% direct + +25% on heavy + ability scaling | 45 (eff melee-dmg %) | 1.2 | adds | ⚖️ Named anchor — melee-DPS amp. 22 + (25×0.5 heavy-on-CD). |
| `bullet_resist_shred` | -4% × ~3 stacks avg × uptime | 7 (eff shred %) | 0.5 | adds | Stack ramp on melee-only. |
| `stun` | 0.5s × stack-ramp uptime | 0.3 (eff s) | 0.4 | adds | Requires 6 stacks (3 heavy hits). |
| `bullet_damage` | T4 baseline + per-shot via ammo refill | 12 (eff gun-dmg %) | 0.2 | adds | 9.6 baseline + small lift via ammo. |
| `gun_continuous_damage` | ammo refill extends sustained fire | 40 (raw dmg outside 1s) | 0.4 | adds | R2: magazine-size-like effect lifts continuous. |
| `magazine_size_dependant` | +15% ammo per melee hit | 12 (eff ammo %) | 0.1 | adds | 15 × ~0.8 uptime (on 5s CD). |
| `bullet_resistance` | +12% | 12 (eff %) | 0.4 | adds | Direct. |
| `close_range` | melee-gated | 95 (% importance) | 2.0 | adds | R21: pure melee tool. |
| `long_range` | anti-affinity | -40 (% importance) | -0.9 | adds | R30: melee. |
| `engage` | melee + stun commits | 80 (% importance) | 1.8 | adds | R11: heavy melee = engage. |
| `grounded` | melee is grounded | 50 (% importance) | 2.0 | adds | R7. |
| `counter_importance` | counter to high-BR targets | 40 (% importance) | 0.8 | adds | BR shred. |


---

## Frenzy
- **normalized_name**: `frenzy` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_fervor`
- **wiki**: https://deadlock.wiki/Frenzy

### Interpretation
Low-HP triggered combat boost: +160 HP, +15% Fire Rate. While below 50% HP (16s CD): +4m/s Move Speed, +40% Fire Rate, +40% Debuff Resist, 10s; existing debuffs are reduced. Comeback / desperate-brawler kit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +160 | Passive |
| Fire Rate | +15% | Passive |
| Move Speed Conditional | +4m/s | Passive (<50% HP, 10s, 16s CD) |
| Fire Rate Conditional | +40% | Passive (<50% HP) |
| Debuff Resist Conditional | +40% | Passive (<50% HP) |
| Trigger Duration | 10s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `low_max_hp` | trigger is <50% HP | 85 (HP) | 2.0 | adds | ⚖️ Named anchor — explicit low-HP trigger. |
| `fire_rate` | +15% + 40% × (10/16) trigger uptime | 40 (eff %) | 1.8 | adds | 15 + 40 × 0.63 = 40. |
| `bullet_damage` | T4 baseline + fire-rate lift | 18 (eff gun-dmg %) | 0.3 | adds | 9.6 + fire-rate-derived. |
| `gun_burst_damage` | fire-rate IS burst lift | 90 (raw dmg within 1s) | 0.8 | adds | R2: fire_rate lifts burst HEAVILY. |
| `gun_continuous_damage` | sustained lift | 30 (raw dmg outside 1s) | 0.3 | adds | R2: fire_rate lifts continuous lightly. |
| `horizontal_mobility` | +4m/s × trigger uptime | 2.5 (m/s eff) | 1.1 | adds | 4 × 0.63 uptime. |
| `debuff_resistance` | +40% × trigger | 25 (eff %) | 0.9 | adds | 40 × 0.63. |
| `high_max_hp` | +160 HP (Weapon item, no Vitality baseline) | 160 (HP) | 0.4 | adds | Explicit. |
| `damage_sponge` | low-HP trigger rewards taking dmg | 50 (% importance) | 1.1 | adds | R26: comeback-flavored. |
| `counter_importance` | comeback mechanic | 35 (% importance) | 0.7 | adds | R13: clutch tool. |
| `engage` | aggressive low-HP brawler | 45 (% importance) | 1.0 | adds | Encourages staying in fights. |


---

## Glass Cannon
- **normalized_name**: `glass_cannon` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_glass_cannon`
- **wiki**: https://deadlock.wiki/Glass_Cannon

### Interpretation
Greedy snowball weapon item: +80% Weapon Damage, -13% Max Health. +7% Fire Rate permanent per hero kill (max 8 stacks = +56% FR). Death = -1 stack. Pure scaling-late kit — rewards getting kills while punishing dying.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +80% | Passive |
| Max Health | -13% | Passive (penalty) |
| Fire Rate per Kill Conditional | +7% | Passive (permanent, max 8 stacks; death = -1 stack) |
| Max Stacks | 8 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +80% direct + ~+30% from stacking FR + T4 baseline | 120 (eff gun-dmg %) | 2.0 | adds | ⚖️ Named bullet_damage anchor at T4. 80 + (7 × ~4 typical stacks) + 9.6 = ~118. |
| `fire_rate` | +7% × 4 typical stacks | 28 (eff %) | 1.2 | adds | Snowball average. |
| `gun_burst_damage` | per-shot + fire-rate burst lift | 220 (raw dmg within 1s) | 2.0 | adds | R2: FR + bullet-damage = huge burst. |
| `gun_continuous_damage` | sustained gun lift | 110 (raw dmg outside 1s) | 1.0 | adds | R2. |
| `scaling_late` | snowballs across kills | 80 (% importance) | 2.0 | adds | ⚖️ Greedy farm/kill scaling — peaks with stacks. |
| `high_kill_count` | rewards securing kills | 70 (% importance) | 2.0 | adds | Direct stack mechanic. |
| `low_max_hp` | -13% Max HP penalty | 65 (HP) | 1.5 | adds | Direct HP reduction = penalty. |
| `high_max_hp` | -13% Max HP = anti-HP | -65 (HP) | -0.2 | adds | Negative HP (penalty). |
| `damage_sponge` | -13% Max HP = anti-sponge | -30 (% importance) | -0.6 | adds | R26 mirror — explicit anti. |
| `single_target` | gun-DPS item | 50 (% importance) | 1.5 | adds | Gun-only amp. |
| `farmer` | needs kills to scale | 45 (% importance) | 0.9 | adds | R28: snowball-greedy farmer. |


---

## Lucky Shot
- **normalized_name**: `lucky_shot` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_critshot`
- **wiki**: https://deadlock.wiki/Lucky_Shot

### Interpretation
Bullet proc gun amp: +30% Max Ammo. 25% chance per bullet to deal +100% Bonus Weapon Damage (cannot crit). Per Notes: based on total bullet damage (not weapon damage bonus); IMMUNE to Bullet Evasion. Pure sustained-DPS amp.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +30% | Passive |
| Bonus Weapon Damage | +100% | Passive (on proc, cannot crit) |
| Proc Chance | 25% | Passive (per bullet, immune to Bullet Evasion) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +100% × 25% proc + T4 baseline | 35 (eff gun-dmg %) | 0.6 | adds | 100 × 0.25 = +25% effective + 9.6 baseline. |
| `gun_burst_damage` | per-shot 25% proc within 1s | 110 (raw dmg within 1s) | 1.0 | adds | R2: bullet_damage lift on burst. |
| `gun_continuous_damage` | sustained 25% proc + +30% ammo | 200 (raw dmg outside 1s) | 1.8 | adds | R2: bullet_damage + magazine lift = continuous heavy. |
| `gun_burst_proc` | per-shot Lucky roll | 0.30 (proc index) | 0.5 | adds | 25% per shot, instant trigger. |
| `gun_continuous_proc` | sustained proc | 0.55 (proc index) | 0.8 | adds | 25% per shot in sustained. |
| `magazine_size_dependant` | +30% ammo | 30 (eff ammo %) | 0.3 | adds | Direct passive. |
| `counter_importance` | counters Bullet Evasion | 40 (% importance) | 0.8 | adds | R13: explicit Notes — immune to evasion. |
| `single_target` | per-bullet | 50 (% importance) | 1.5 | adds | Per-shot proc. |


---

## Ricochet
- **normalized_name**: `ricochet` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_ricochet`
- **wiki**: https://deadlock.wiki/Ricochet

### Interpretation
+18% Fire Rate. Bullets ricochet to 2 nearby enemies within 13m for 65% damage, applying all bullet procs. Per Notes: bullet-based procs apply to ricocheted shots; bullets do NOT bounce off objectives. AoE-DPS multiplier.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +18% | Passive |
| Ricochet Damage | 65% | Passive |
| Ricochet Targets | 2 | Passive |
| Ricochet Range | 13m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | bounces to 2 extra targets | 70 (% importance) | 1.8 | adds | ⚖️ Crowd-DPS amp. |
| `fire_rate` | +18% | 18 (eff %) | 0.8 | adds | Direct. |
| `bullet_damage` | T4 baseline + 65% × 2 in crowd | 22 (eff gun-dmg %) | 0.4 | adds | 9.6 baseline + ~13% effective vs crowd (only in 2+ target situations). |
| `gun_burst_damage` | fire-rate lifts burst + crowd multiplier | 150 (raw dmg within 1s) | 1.3 | adds | R2: fire-rate heavy on burst. |
| `gun_continuous_damage` | sustained gun + crowd | 90 (raw dmg outside 1s) | 0.8 | adds | R2: fire-rate light on continuous. |
| `gun_continuous_proc` | per-bullet ricochet lifts proc rate | 0.20 (proc index) | 0.3 | adds | Indirect — extends proc reach. |
| `farmer` | clears NPC waves faster | 60 (% importance) | 1.2 | adds | R28: crowd-clearer. |
| `mid_range` | 13m radius favors mid-range | 35 (% importance) | 1.6 | adds | Standard rifle range. |
| `counter_importance` | vs clumped enemies | 30 (% importance) | 0.6 | adds | R13: punishes grouping. |


---

## Silencer
- **normalized_name**: `silencer` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_proc_silence`
- **wiki**: https://deadlock.wiki/Silencer

### Interpretation
Anti-spirit gun item: +12% Spirit Resist. Passive 1: bullets apply -25% Spirit Damage Reduction debuff for 6s. Passive 2: bullets build up to a 2.5s Silence (10s immunity after expire). Per Notes: 3–16 shots to proc by hero. Damage Reduction applies even through Unstoppable; Silence does not.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +12% | Passive |
| Spirit Damage Reduction Conditional | -25% | Passive (6s debuff) |
| Silence Duration | 2.5s | Passive (after buildup) |
| Immunity Duration | 10s | Passive (post-silence) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 2.5s silence × (12.5s window ≈ 20% uptime) per target | 15 (weighted) | 1.7 | adds | ⚖️ Named silence anchor. |
| `debuff` | -25% spirit dmg debuff + silence | 35 (% importance) | 0.9 | adds | Hybrid debuff. |
| `counter_importance` | counters spirit casters | 80 (% importance) | 1.6 | adds | ⚖️ Notes: counters spirit-burst comps. |
| `spirit_resistance` | +12% direct | 12 (eff %) | 0.4 | adds | Direct passive. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) | 0.2 | adds | R31. |
| `gun_continuous_proc` | per-bullet silence buildup | 0.20 (proc index) | 0.3 | adds | Per-bullet. |
| `single_target` | per-bullet silence | 60 (% importance) | 1.8 | adds | One enemy at a time. |
| `mid_range` | gun-range silence | 35 (% importance) | 1.6 | adds | Standard rifle range. |


---

## Spellslinger
- **normalized_name**: `spellslinger` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_enchanted_holsters`
- **wiki**: https://deadlock.wiki/Spellslinger

### Interpretation
Hybrid gun/ability ramp: +5% Ability CDR. While in-combat, every ability/item cast = stack: +11% Fire Rate + -10% Reload Time (6 max, 18s refresh). Caster-shooter hybrid.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Cooldown Reduction | +5% | Passive |
| Fire Rate | +11% per stack | Passive (6 max, 18s refresh) |
| Reload Time | -10% per stack | Passive (6 max) |
| Max Stacks | 6 | — |
| Buff Duration | 18s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +11% × ~4 typical stacks | 44 (eff %) | 2.0 | adds | Most builds proc 4 stacks routinely. |
| `bullet_damage` | T4 baseline + fire-rate-derived lift | 25 (eff gun-dmg %) | 0.4 | adds | 9.6 + fire-rate amp from stacks. |
| `gun_burst_damage` | fire-rate lifts burst heavily | 160 (raw dmg within 1s) | 1.4 | adds | R2. |
| `gun_continuous_damage` | sustained gun + reload speed | 90 (raw dmg outside 1s) | 0.8 | adds | R2 + reload helps continuous. |
| `cooldown_reduction` | +5% direct | 5 (eff CDR %) | 0.2 | adds | Direct. |
| `magazine_size_dependant` | -10% reload time × stacks | 25 (eff ammo %) | 0.2 | adds | Reload speed extends effective ammo uptime. |
| `ability_spam` | rewards casting items + abilities | 60 (% importance) | 1.6 | adds | ⚖️ Cast-to-stack mechanic. |
| `hybrid_damage_usage` | rewards using BOTH gun + abilities | 70 (% importance) | 1.4 | adds | ⚖️ Named hybrid anchor. |
| `multi_ability_focus` | every cast contributes | 45 (% importance) | 1.3 | adds | R20: rewards diverse ability use. |
| `engage` | in-combat stacks favor engagement | 35 (% importance) | 0.8 | adds | Stacks only build in combat. |


---

## Spiritual Overflow
- **normalized_name**: `spiritual_overflow` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_tech_overflow`
- **wiki**: https://deadlock.wiki/Spiritual_Overflow

### Interpretation
Build-up hybrid amp: +15% Ability Duration, +13% Spirit Lifesteal, +90 HP, +6 SP. Charge bar via shooting enemy heroes triggers Overflow: +32% Fire Rate, +40 SP, 15s. Per Notes: 2–12 shots to proc by hero. Hybrid weapon-spirit scaler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Spirit Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Power | +6 | Passive |
| Overflow Fire Rate | +32% | Passive (15s after buildup) |
| Overflow Spirit Power | +40 | Passive (15s) |
| Duration | 15s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | rewards using BOTH gun + spirit | 80 (% importance) | 1.6 | adds | ⚖️ Named hybrid anchor. |
| `fire_rate` | +32% × ~0.6 typical Overflow uptime | 19 (eff %) | 0.8 | adds | Charge → 15s buff. |
| `spirit_damage` | 6 flat + 40 × 0.6 uptime (Weapon item, no spirit baseline) | 30 (SP-equiv) | 0.5 | adds | No baseline (Weapon). |
| `spirit_burst_damage` | spirit per-shot during Overflow | 60 (raw dmg within 1s) | 0.5 | adds | SP lifts spirit-flavored procs in burst window. |
| `spirit_continuous_damage` | sustained spirit | 60 (raw dmg outside 1s) | 0.3 | adds | SP lifts continuous symmetrically. |
| `bullet_damage` | T4 baseline + fire-rate lift | 20 (eff gun-dmg %) | 0.3 | adds | 9.6 baseline + FR-derived. |
| `gun_burst_damage` | FR-driven burst lift | 130 (raw dmg within 1s) | 1.2 | adds | R2: FR heavy on burst. |
| `gun_continuous_damage` | sustained gun | 50 (raw dmg outside 1s) | 0.5 | adds | R2: light continuous. |
| `spirit_lifesteal` | +13% direct | 13 (eff %) | 0.8 | adds | Direct. |
| `duration_dependant` | +15% Ability Duration | 15 (eff %) | 0.6 | adds | Direct. |
| `high_max_hp` | +90 HP (Weapon, no baseline) | 90 (HP) | 0.2 | adds | Explicit. |
| `self_heal` | lifesteal sustain | 60 (HP total) | 0.2 | adds | 13% lifesteal × dmg dealt. |


---

## Cheat Death
- **normalized_name**: `cheat_death` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_cheat_death`
- **wiki**: https://deadlock.wiki/Cheat_Death

### Interpretation
The named anti-burst panic button: +200 HP, +15% Bullet Resist. On lethal damage (90s CD): 4.5s death immunity + remove non-stun debuffs + -60% dmg out + -60% healing. Per Notes: complex priority interactions (triggers after Rejuvenator, before/with Shocking Reanimation).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +200 | Passive |
| Bullet Resist | +15% | Passive |
| Death Immunity Duration | 4.5s | Passive (on lethal, 90s CD) |
| Damage Reduction | -60% | Passive (during immunity, self-applied to outgoing) |
| Healing Reduction | -60% | Passive (self) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `counter_importance` | named anti-burst defense | 90 (% importance) | 1.8 | adds | ⚖️ Named anchor — lethal-damage save. |
| `damage_sponge` | death immunity ≈ second life | 70 (% importance) | 1.5 | adds | R26: dies → doesn't die. |
| `shield` | 4.5s invuln window ≈ effective HP | 200 (shield HP) | 0.4 | adds | Treats death-immune as ~200 HP barrier (procs once per 90s). |
| `high_max_hp` | T4 Vitality baseline + 200 HP + shield-as-HP | 254 (HP) | 0.7 | adds | 29 baseline + 200 + ~25 shield-equiv. |
| `bullet_resistance` | +15% direct | 15 (eff %) | 0.5 | adds | Direct. |
| `cc_resist` | removes non-stun debuffs on trigger | 12 (eff %) | 0.4 | adds | Partial cleanse. |
| `escape` | survives instant-death moments | 65 (% importance) | 1.2 | adds | Clutch survival. |
| `low_max_hp` | trigger fires at 1 HP | 50 (HP) | 1.2 | adds | Low-HP synergy with Frenzy etc. |
| `scaling_late` | 90s CD = better in extended fights | 35 (% importance) | 0.9 | adds | R32. |
| `single_ability_focus` | one-shot anti-execute | 40 (% importance) | 1.0 | adds | R17 partial. |


---

## Colossus
- **normalized_name**: `colossus` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_colossus`
- **wiki**: https://deadlock.wiki/Colossus

### Interpretation
The named damage-sponge anchor: +25% Base Health, +15% Weapon Damage. Active (37s CD): become large for 7s — 35% BR, 35% SR, +30% Melee Damage, -30% MS aura (-25% Dash) on enemies in 14m, +20% Model Scale. Per Notes: cancels heavy melee windup.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Base Health | +25% | Passive |
| Weapon Damage | +15% | Passive |
| Bullet Resist Conditional | 35% | Active (7s) |
| Spirit Resist Conditional | 35% | Active |
| Melee Damage | +30% | Active |
| Move Speed Conditional | -30% (aura) | Active (enemies) |
| Aura Radius | 14m | Active |
| Duration | 7s | Active |
| Model Scale | +20% | Active (larger hitbox) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `damage_sponge` | named anchor — giant tank | 95 (% importance) | 2.0 | adds | ⚖️ Named damage_sponge anchor at T4. |
| `bullet_resistance` | 35% × (7/37) uptime + R31 lift | 12 (eff %) | 0.4 | adds | 35 × 0.19 uptime. |
| `spirit_resistance` | 35% × (7/37) | 7 (eff %) | 0.2 | adds | Same. |
| `melee_damage` | +30% × (7/37) | 6 (eff melee-dmg %) | 0.2 | adds | R12: short-burst melee amp. |
| `movement_slow` | -30% × 7s × ~3 enemies in aura | 25 (eff slow weighted) | 0.5 | adds | Aura slow vs crowd. |
| `aoe_cluster` | 14m aura | 75 (% importance) | 1.9 | adds | Large radius. |
| `bullet_damage` | +15% + T4 Weapon baseline-equiv | 15 (eff gun-dmg %) | 0.2 | adds | Vitality item — +15% explicit only (no Weapon baseline). |
| `high_max_hp` | +25% base HP (≈ +125) + T4 Vitality baseline 29 | 154 (HP) | 0.4 | adds | R31 baseline + +125. |
| `engage` | activate-and-brawl tool | 80 (% importance) | 1.8 | adds | ⚖️ Named engage anchor for tanks. |
| `large_hitbox` | +20% Model Scale | 60 (% importance) | 2.0 | adds | Direct mechanic (trade-off). |
| `grounded` | brawler tank | 50 (% importance) | 2.0 | adds | R7. |
| `close_to_team` | aura wants allies nearby | 40 (% importance) | 1.1 | adds | Aura coverage. |
| `single_ability_focus` | active-driven | 35 (% importance) | 0.9 | adds | R17. |


---

## Divine Barrier
- **normalized_name**: `divine_barrier` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_divine_barrier`
- **wiki**: https://deadlock.wiki/Divine_Barrier

### Interpretation
Ally-cast utility shield: +10% Ability Range, +1.5 OOC Regen. Active (45s, 22.5s if ally-cast): cleanse non-stun debuffs + 600 barrier + +2.75m MS for 6s, 40m cast range. Support-flavored anti-debuff tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +10% | Passive |
| Out of Combat Regen | +1.5 | Passive |
| Barrier Conditional | 600 | Active (6s) |
| Move Speed Conditional | +2.75m | Active |
| Buff Duration | 6s | Active |
| Cast Range | 40m | Active |
| Active Cooldown | 45s (22.5s ally-cast) | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 600 × (6/30 typical CD) | 120 (shield HP) | 0.2 | adds | ⚖️ Largest barrier T4 + low cd ally-cast. |
| `assist_importance` | ally-cast halves CD | 80 (% importance) | 1.9 | adds | ⚖️ Named ally-cast anchor — ally-cast is incentivized. |
| `self_buff` | also self-cast (description: "Can be self-cast") | 55 (% importance) | 1.6 | adds | Self-cast = barrier + MS + cleanse on you. |
| `team_heal` | 600 barrier on ally | 200 (HP total) | 0.4 | adds | Barrier = effective HP for ally. |
| `ally_buff` | +2.75m MS + barrier | 70 (% importance) | 1.8 | adds | R24. |
| `cc_resist` | cleanse non-stun debuffs | 25 (eff %) | 0.8 | adds | Strong cleanse. |
| `counter_importance` | counter to debuff comps | 55 (% importance) | 1.1 | adds | R13: cleanse + barrier. |
| `range_extender_dependant` | +10% range + 40m cast | 15 (eff %) | 0.4 | adds | Direct + cast range. |
| `horizontal_mobility` | +2.75m × uptime | 1.0 (m/s eff) | 0.4 | adds | 2.75 × 0.4. |
| `escape` | barrier + MS = escape support | 50 (% importance) | 1.0 | adds | Self-or-ally escape. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `self_heal` | +1.5 OOC | 25 (HP total) | 0.1 | adds | Small regen. |
| `engage` | barrier + MS for ally engage | 35 (% importance) | 0.8 | adds | Dive support. |


---

## Diviners Kevlar
- **normalized_name**: `diviners_kevlar` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_diviners_kevlar`
- **wiki**: https://deadlock.wiki/Diviner's_Kevlar

### Interpretation
Ult-tied barrier + spirit ramp: +15% Ability Duration. Passive (40s CD): on ultimate cast, gain 1000 Barrier + 35 SP for 20s. Per Notes: spirit buff has inconsistent timing interactions per ability.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Barrier Conditional | 1000 | Passive (on ult, 20s) |
| Spirit Power Conditional | +35 | Passive (on ult, 20s) |
| Buff Duration | 20s | Passive |
| Cooldown | 40s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ult_focused` | trigger requires ultimate cast | 90 (% importance) | 1.9 | adds | ⚖️ Named ult_focused anchor. |
| `shield` | 1000 × (20/40) uptime | 500 (shield HP) | 1.0 | adds | Largest single barrier at T4. |
| `spirit_damage` | +35 × (20/40) + T4 Vitality baseline | 26 (SP-equiv) | 0.4 | adds | Vitality item — no spirit baseline. 35 × 0.5 + ~8 utility. |
| `spirit_burst_damage` | SP lifts spirit burst | 35 (raw dmg within 1s) | 0.3 | adds | R2: SP lifts spirit burst. |
| `spirit_continuous_damage` | SP lifts continuous | 35 (raw dmg outside 1s) | 0.2 | adds | R2 symmetric. |
| `damage_sponge` | massive barrier during ult | 65 (% importance) | 1.4 | adds | R26. |
| `duration_dependant` | +15% direct | 15 (eff %) | 0.6 | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline + barrier-as-HP | 100 (HP) | 0.3 | adds | 29 baseline + ~70 shield-equiv. |
| `scaling_late` | ult-tied = bigger fights | 50 (% importance) | 1.2 | adds | R32. |
| `engage` | barrier on ult = engage cushion | 50 (% importance) | 1.1 | adds | Ult-engage support. |
| `single_ability_focus` | tied to one ability slot (ult) | 60 (% importance) | 1.5 | adds | R17: ult-only trigger. |


---

## Healing Tempo
- **normalized_name**: `healing_tempo` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_healbuff`
- **wiki**: https://deadlock.wiki/Healing_Tempo

### Interpretation
Healing-triggered combat amp: +25% Healing Effectiveness, +10% Spirit Resist, +6 HP Regen, +4 OOC Regen. Passive: applying heal to self or ally → +35% Fire Rate + +1.25m MS for 7s. Does NOT trigger from innate Regen or passive lifesteals.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Healing Effectiveness | +25% | Passive |
| Spirit Resist | +10% | Passive |
| Health Regen | +6 | Passive |
| Out of Combat Regen | +4 | Passive |
| Fire Rate | +35% | Passive (7s post-heal) |
| Move Speed | +1.25m | Passive (7s post-heal) |
| Buff Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `assist_importance` | ally heals also trigger it | 70 (% importance) | 1.6 | adds | Buffs ally too. |
| `ally_buff` | ally-cast heals buff ally | 55 (% importance) | 1.4 | adds | R24. |
| `self_heal` | 6 regen + 4 OOC sustained | 220 (HP total) | 0.7 | adds | 6×30s combat + 4×20s OOC ≈ 260; net ~220. |
| `continous_heal` | regen over time outside 1s | 200 (HP outside 1s) | 0.4 | adds | Sustained regen. |
| `burst_heal` | first-1s regen | 6 (HP within 1s) | 0.0 | adds | Small per-second. |
| `fire_rate` | +35% × ~0.6 post-heal uptime | 21 (eff %) | 0.9 | adds | 35 × 0.6 (heal trigger uptime). |
| `horizontal_mobility` | +1.25m × 0.6 uptime | 0.75 (m/s eff) | 0.3 | adds | Channel-dependent. |
| `spirit_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `farmer` | regen sustains farm | 45 (% importance) | 0.9 | adds | R28. |
| `counter_importance` | counters DoT/poke pressure | 30 (% importance) | 0.6 | adds | Regen-anchor counter. |


---

## Indomitable
- **normalized_name**: `indomitable` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_auto_cleanse`
- **wiki**: https://deadlock.wiki/Indomitable

### Interpretation
Auto-cleanse anti-CC kit: +10% Bullet Resist, +10% Spirit Resist, +2 OOC Regen. Passive (55s CD): the next Stun, Chain, Immobilize, Sleep, or Silence is auto-cleansed; on trigger gain a 325+2×SP barrier for 10s AND -20% ability cooldowns. Per Notes: prevents Hotel Guest teleport but doesn't trigger against Dynamo's Singularity or Apollo's Itani Lo Sahn.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +10% | Passive |
| Spirit Resist | +10% | Passive |
| Out of Combat Regen | +2 | Passive |
| Barrier Conditional | 325 + 2.0×SP | Passive (on cleanse, 10s) |
| Cooldown | 55s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cc_resist` | auto-cleanse first CC + 10% SR + 10% BR | 65 (eff %) | 2.0 | adds | ⚖️ Named anchor — strongest anti-CC item. |
| `counter_importance` | counter to CC-heavy comps | 80 (% importance) | 1.6 | adds | ⚖️ Named anti-CC tool. |
| `shield` | (325+2×20) ≈ 365 × (10/55) uptime | 65 (shield HP) | 0.1 | adds | Trigger-gated barrier. |
| `cooldown_reduction` | -20% all abilities on trigger | 8 (eff CDR %) | 0.3 | adds | 20 × ~0.4 trigger frequency. |
| `bullet_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `spirit_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `debuff_resistance` | cleanse + reduced CC time | 25 (eff %) | 0.9 | adds | Cleanse effect on top of resistance. |
| `damage_sponge` | barrier on trigger | 40 (% importance) | 0.8 | adds | R26 partial — trigger-gated. |
| `spirit_damage` | barrier scales 2.0×SP | 5 (SP-equiv) | — | relies | RELY: scaling only matters with SP build. |
| `high_max_hp` | T4 Vitality baseline + shield-as-HP | 60 (HP) | 0.2 | adds | 29 baseline + ~30 effective HP. |
| `escape` | cleanse-driven survival | 45 (% importance) | 0.9 | adds | Auto-trigger panic-button. |
| `self_heal` | +2 OOC regen | 40 (HP total) | 0.1 | adds | 2 × 20s OOC. |


---

## Infuser
- **normalized_name**: `infuser` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_infuser`
- **wiki**: https://deadlock.wiki/Infuser

### Interpretation
Vitality/spirit sustain hybrid: +13% Spirit Lifesteal, +10% Spirit Resist, +100 HP, +6 SP. Active (30s CD): +70% Spirit Lifesteal + +30 SP for 7s. Spirit-flavored Vitality.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +13% | Passive |
| Spirit Resist | +10% | Passive |
| Bonus Health | +100 | Passive |
| Spirit Power | +6 | Passive |
| Spirit Lifesteal Conditional | +70% | Active (7s) |
| Spirit Power Conditional | +30 | Active (7s) |
| Duration | 7s | Active |
| Cooldown | 30s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | 13% + 70% × (7/30) | 29 (eff %) | 1.8 | adds | ⚖️ Largest spirit lifesteal source. |
| `spirit_damage` | 6 flat + 30 × (7/30) (Vitality, no SP baseline) | 13 (SP-equiv) | 0.2 | adds | 6 + 7 conditional. |
| `spirit_burst_damage` | SP lifts spirit burst in 7s window | 30 (raw dmg within 1s) | 0.2 | adds | R2: 7s active window. |
| `spirit_continuous_damage` | SP lifts continuous | 30 (raw dmg outside 1s) | 0.2 | adds | R2 symmetric. |
| `spirit_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `self_heal` | lifesteal sustain | 180 (HP total) | 0.5 | adds | Lifesteal during 7s burst. |
| `self_buff` | self-cast active | 55 (% importance) | 1.6 | adds | Self-only. |
| `high_max_hp` | T4 Vitality baseline + 100 HP | 129 (HP) | 0.3 | adds | 29 + 100. |
| `single_ability_focus` | rewards one big nuke window | 40 (% importance) | 1.0 | adds | R17. |


---

## Inhibitor
- **normalized_name**: `inhibitor` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_inhibitor`
- **wiki**: https://deadlock.wiki/Inhibitor

### Interpretation
Buildup damage-reduce + anti-heal: +10% Weapon Damage, +150 HP. Bullet buildup → -30% Damage Penalty + -40% Healing Reduction on target for 5s. Per Notes: applies through Unstoppable. 2–12 shots to proc by hero.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +10% | Passive |
| Bonus Health | +150 | Passive |
| Damage Penalty Conditional | -30% | Passive (5s debuff) |
| Healing Reduction Conditional | -40% | Passive (5s debuff) |
| Debuff Duration | 5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -40% × proc-uptime | 28 (eff %) | 0.9 | adds | ⚖️ T4 anti-heal anchor. 40 × ~0.7 uptime. |
| `debuff` | -30% dmg + anti-heal | 55 (% importance) | 1.4 | adds | ⚖️ Dual debuff = strong. |
| `counter_importance` | counter to heal stack + DPS heroes | 75 (% importance) | 1.5 | adds | R13: dual debuff. |
| `bullet_damage` | +10% + T4 Weapon baseline (Vitality item, no Weapon baseline) | 10 (eff gun-dmg %) | 0.2 | adds | Direct +10% only. |
| `high_max_hp` | T4 Vitality baseline + 150 HP | 179 (HP) | 0.5 | adds | 29 + 150. |
| `single_target` | per-target debuff | 60 (% importance) | 1.8 | adds | Single-target debuff. |
| `gun_continuous_proc` | per-bullet buildup | 0.20 (proc index) | 0.3 | adds | Buildup mechanic. |
| `mid_range` | gun-range debuff | 35 (% importance) | 1.6 | adds | Standard rifle range. |


---

## Juggernaut
- **normalized_name**: `juggernaut` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_juggernaut`
- **wiki**: https://deadlock.wiki/Juggernaut

### Interpretation
Anti-CC brawler kit: +50% Slow Resist, +2.5m Move Speed, +25% Melee Resist, +8 HP Regen. Passive: enemies that shoot you have their Fire Rate slowed by -40% for 4s. Per Notes: Slow Resist reduces ALL slow effects by 50%.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Slow Resist | +50% | Passive |
| Move Speed | +2.5m | Passive |
| Melee Resist | +25% | Passive |
| Health Regen | +8 | Passive |
| Fire Rate Conditional | -40% | Passive (4s on attackers) |
| Debuff Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -40% × 4s × ~2 attackers | 48 (eff slow %) | 1.4 | adds | ⚖️ Named anchor for fire_rate_slow. |
| `cc_resist` | +50% slow resist | 40 (eff %) | 1.2 | adds | ⚖️ Named slow-resist anchor. |
| `horizontal_mobility` | +2.5m direct | 2.5 (m/s eff) | 1.1 | adds | Direct sprint. |
| `melee_resistance` | +25% direct | 25 (eff %) | 0.7 | adds | Direct. |
| `self_heal` | +8 regen × combat time | 240 (HP total) | 0.7 | adds | 8 × 30s combat = 240. |
| `continous_heal` | regen outside 1s | 240 (HP outside 1s) | 0.5 | adds | Sustained regen. |
| `burst_heal` | first-1s regen | 8 (HP within 1s) | 0.0 | adds | 8 HP within 1s. |
| `damage_sponge` | fire-rate-slow tanks better | 65 (% importance) | 1.4 | adds | R26: anti-attacker debuff. |
| `counter_importance` | counters DPS dive + slows | 70 (% importance) | 1.4 | adds | R13. |
| `escape` | mobility + slow resist = escape | 60 (% importance) | 1.1 | adds | R14. |
| `engage` | safe dive (high MS) | 50 (% importance) | 1.1 | adds | Mobility tool. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |
| `farmer` | mobility helps farm | 30 (% importance) | 0.6 | adds | R28. |


---

## Leech
- **normalized_name**: `leech` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_damage_recycler`
- **wiki**: https://deadlock.wiki/Leech

### Interpretation
Pure-stat hybrid stat stick: +25% Spirit Lifesteal, +25% Bullet Lifesteal, +180 HP, +12% Weapon Damage, +12 SP. No active. Late-game raw-stat scaling vessel.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +25% | Passive |
| Bullet Lifesteal | +25% | Passive |
| Bonus Health | +180 | Passive |
| Weapon Damage | +12% | Passive |
| Spirit Power | +12 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | +25% direct | 25 (eff %) | 1.6 | adds | Direct. |
| `bullet_lifesteal` | +25% direct | 25 (eff %) | 1.7 | adds | Direct. |
| `hybrid_damage_usage` | gun+spirit lifesteal stat stick | 80 (% importance) | 1.6 | adds | ⚖️ Hybrid scaling anchor. |
| `bullet_damage` | +12% direct (Vitality, no Weapon baseline) | 12 (eff gun-dmg %) | 0.2 | adds | Direct. |
| `spirit_damage` | +12 SP (Vitality, no spirit baseline) | 12 (SP-equiv) | 0.2 | adds | Direct. |
| `gun_burst_damage` | per-shot lift | 70 (raw dmg within 1s) | 0.6 | adds | R2: bullet_damage symmetric. |
| `gun_continuous_damage` | sustained lift | 70 (raw dmg outside 1s) | 0.6 | adds | R2. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) | 0.2 | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) | 0.1 | adds | R2. |
| `self_heal` | hybrid lifesteal sustain | 320 (HP total) | 0.9 | adds | Sustained dual lifesteal. |
| `scaling_late` | pure stat stick | 55 (% importance) | 1.4 | adds | R32: late-game accumulator. |
| `high_max_hp` | T4 Vitality baseline + 180 HP | 209 (HP) | 0.5 | adds | 29 + 180. |
| `damage_sponge` | lifesteal + HP = tank | 50 (% importance) | 1.1 | adds | R26. |


---

## Phantom Strike
- **normalized_name**: `phantom_strike` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_phantom_strike`
- **wiki**: https://deadlock.wiki/Phantom_Strike

### Interpretation
Teleport-engage active: +15% Weapon Damage, +8 SP. Active (35s CD): teleport to enemy + pull to ground, 75+0.93×SP dmg, -50% MS + Disarm for 3s, 25m range. Per Notes: short teleport delay/animation before strike. Named disarm anchor + anti-aerial engage tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Spirit Power | +8 | Passive |
| Impact Damage | 75 + 0.93×SP | Active (35s CD) |
| Move Speed Conditional | -50% | Active (3s) |
| Status Effect | Disarm | Active |
| Cast Range | 25m | Active |
| Debuff Duration | 3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `disarm` | 3s × 1 target × 35s CD | 0.26 (s × count) | 0.1 | adds | ⚖️ Named disarm anchor — only T4 disarm. |
| `engage` | teleport-to-enemy is named engage tool | 90 (% importance) | 2.0 | adds | ⚖️ Named engage anchor. |
| `spirit_burst_damage` | 75+0.93×20 = 94 within 1s | 95 (raw dmg within 1s) | 0.8 | adds | Single-hit burst. |
| `spirit_damage` | 8 flat + (75+0.93×20)/35s CD = ~11 SP-equiv | 11 (SP-equiv) | 0.2 | adds | Vitality item, no baseline. |
| `spirit_burst_proc` | one big burst on cast | 0.40 (proc index) | 0.9 | adds | R6: instant trigger. |
| `movement_slow` | -50% × 3s × 1 target | 30 (eff slow weighted) | 0.6 | adds | 50 × 0.6 weighted. |
| `single_target` | single-target engage | 65 (% importance) | 2.0 | adds | Direct. |
| `counter_importance` | pulls aerial → grounded | 60 (% importance) | 1.2 | adds | R13: anti-aerial. |
| `anti_air` | pulls enemies to ground | 65 (% importance) | 1.7 | adds | R7 mirror — explicit anti-aerial. |
| `grounded` | forces target grounded | 35 (% importance) | 1.4 | adds | Pull-to-ground mechanic. |
| `horizontal_mobility` | teleport = effective mobility | 1.5 (m/s eff) | 0.6 | adds | 25m teleport / 35s CD. |
| `bullet_damage` | +15% (Vitality, no baseline) | 15 (eff gun-dmg %) | 0.2 | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |


---

## Plated Armor
- **normalized_name**: `plated_armor` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_deflecting_armor`
- **wiki**: https://deadlock.wiki/Plated_Armor

### Interpretation
Bullet deflection panic-armor: +130 HP. 30% chance to deflect bullets (prevents all weapon dmg) + 50% chance to prevent on-hit effects (rolled independently). Per Notes: complex interactions — counters Headhunter, Slow Bullets, Silencer buildup; Armor Piercing Rounds bypasses Plated Armor. Named bullet_evasion anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +130 | Passive |
| Deflection Percent | 30% | Passive |
| On-Hit Prevention Percent | 50% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | 30% deflection | 30 (eff %) | 2.0 | adds | ⚖️ Named bullet_evasion anchor. |
| `bullet_resistance` | deflection ≈ effective BR | 18 (eff %) | 0.6 | adds | 30% × 60% chance combined ≈ ~18% effective. |
| `counter_importance` | counter to gun-DPS + on-hit procs | 85 (% importance) | 1.7 | adds | ⚖️ Notes: counters many gun items. |
| `damage_sponge` | RNG bullet block | 60 (% importance) | 1.3 | adds | R26. |
| `high_max_hp` | T4 Vitality baseline + 130 HP | 159 (HP) | 0.4 | adds | 29 + 130. |
| `gun_burst_resistance` | bullet block reduces burst | 18 (eff %) | 0.4 | adds | R2 mirror: deflection helps burst defense. |
| `gun_continuous_resistance` | sustained bullet block | 18 (eff %) | 0.7 | adds | Symmetric. |
| `self_buff` | passive self-only | 30 (% importance) | 0.9 | adds | Self-only. |


---

## Siphon Bullets
- **normalized_name**: `siphon_bullets` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_siphon_bullets`
- **wiki**: https://deadlock.wiki/Siphon_Bullets

### Interpretation
Max-HP steal: +15% Weapon Damage, +10% Bullet Resist. Bullets steal 2.5% max HP (1.2s ICD, 17s duration, stacks infinitely). Per Notes: damage is pure-damage (ignores resists), refreshes on subsequent hits, user gains same max HP. Stacking max-HP swing item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Bullet Resist | +10% | Passive |
| Max HP Steal | 2.5% per hit | Passive (1.2s ICD) |
| Steal Duration | 17s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `low_max_hp` | enemy max HP drain | 80 (HP) | 1.9 | adds | ⚖️ Named anchor — drains enemy max HP. |
| `high_max_hp` | user gains same max HP | 100 (HP) | 0.3 | adds | Mirror — self gains stolen HP. |
| `pure_damage` | 2.5% max HP per stack is pure dmg | 75 (eff dmg) | 1.8 | adds | ⚖️ Named pure_damage anchor (not blocked by BR/SR). |
| `self_heal` | user heals by stolen amount | 250 (HP total) | 0.7 | adds | Heals = stolen × stacks during 17s. |
| `bullet_damage` | +15% direct (Vitality, no Weapon baseline) | 15 (eff gun-dmg %) | 0.2 | adds | Direct. |
| `bullet_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `counter_importance` | counter to tanks / high-HP heroes | 75 (% importance) | 1.5 | adds | ⚖️ Notes: anti-tank tool. |
| `gun_continuous_damage` | per-bullet 1.2s ICD = sustained | 65 (raw dmg outside 1s) | 0.6 | adds | Sustained drain. |
| `gun_continuous_proc` | per-bullet siphon | 0.30 (proc index) | 0.5 | adds | Per-bullet effect. |
| `scaling_late` | stacks build over fight | 50 (% importance) | 1.2 | adds | R32: stack scaling. |
| `single_target` | per-bullet siphon | 55 (% importance) | 1.7 | adds | Per-target. |


---

## Spellbreaker
- **normalized_name**: `spellbreaker` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_spellbreaker`
- **wiki**: https://deadlock.wiki/Spellbreaker

### Interpretation
Anti-spirit-burst panic shield: +18% Spirit Resist, +25% Debuff Resist, +90 HP. Passive (9s CD): the next instance of high spirit damage (>175 threshold) is reduced by 65%. Long list of CC durations reduced via Debuff Resist passive.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +18% | Passive |
| Debuff Resist | +25% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Damage Reduction | 65% | Passive (per-trigger, 9s CD) |
| Damage Threshold | 175 | Passive (only reduces hits >175) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_resistance` | 65% on threshold spirit hits + R31 lift | 60 (eff %) | 1.3 | adds | ⚖️ Named anchor — biggest spirit-burst defense. |
| `spirit_resistance` | +18% direct | 18 (eff %) | 0.6 | adds | Direct. |
| `debuff_resistance` | +25% direct | 25 (eff %) | 0.9 | adds | Direct. |
| `cc_resist` | debuff resist reduces all CC | 25 (eff %) | 0.8 | adds | R13. |
| `counter_importance` | counters spirit-burst comps | 80 (% importance) | 1.6 | adds | ⚖️ Named anti-caster anchor. |
| `damage_sponge` | spirit-resist sponge | 55 (% importance) | 1.2 | adds | R26. |
| `high_max_hp` | T4 Vitality baseline + 90 HP | 119 (HP) | 0.3 | adds | 29 + 90. |
| `self_buff` | passive self-only | 35 (% importance) | 1.0 | adds | Self-only. |


---

## Unstoppable
- **normalized_name**: `unstoppable` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_unstoppable`
- **wiki**: https://deadlock.wiki/Unstoppable

### Interpretation
Pre-emptive total-CC immunity: +25% Debuff Resist, +125 HP. Active (60s CD): for 5.5s, immune to Stun/Silence/Sleep/Root/Disarm and existing such effects suppressed. Per Notes: must be PRE-cast (can't activate while stunned/slept). Long Debuff Resist effect list.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +25% | Passive |
| Bonus Health | +125 | Passive |
| Active Duration | 5.5s | Active (60s CD) |
| Active Cooldown | 60s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cc_resist` | total CC immunity 5.5s × (5.5/60) + 25% passive | 50 (eff %) | 1.5 | adds | ⚖️ Named CC-immunity anchor. |
| `debuff_resistance` | +25% direct + CC suppression | 35 (eff %) | 1.2 | adds | Combined CC + debuff resist. |
| `counter_importance` | counter to CC-heavy comps | 85 (% importance) | 1.7 | adds | ⚖️ Named anti-CC tool. |
| `engage` | CC-immune dive | 70 (% importance) | 1.6 | adds | R11: dive without fear of CC. |
| `escape` | CC-immune retreat | 60 (% importance) | 1.1 | adds | Bidirectional. |
| `ult_focused` | best in ult-windows | 40 (% importance) | 0.8 | adds | Synergy with ult timing. |
| `damage_sponge` | CC immune ≈ uptime tank | 50 (% importance) | 1.1 | adds | R26: indirect. |
| `high_max_hp` | T4 Vitality baseline + 125 HP | 154 (HP) | 0.4 | adds | 29 + 125. |
| `self_buff` | self-only active | 40 (% importance) | 1.1 | adds | Self-only. |
| `single_ability_focus` | one active does everything | 35 (% importance) | 0.9 | adds | R17. |


---

## Vampiric Burst
- **normalized_name**: `vampiric_burst` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_surging_power`
- **wiki**: https://deadlock.wiki/Vampiric_Burst

### Interpretation
DPS-window burst: +13% Bullet Lifesteal, +10% Bullet Resist, +100 HP, +6% Weapon Damage. Active (30s CD): +70% Bullet Lifesteal + 34% Fire Rate + +75% Ammo for 5s (ammo not magazine-capped).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +13% | Passive |
| Bullet Resist | +10% | Passive |
| Bonus Health | +100 | Passive |
| Weapon Damage | +6% | Passive |
| Bullet Lifesteal Conditional | +70% | Active (5s) |
| Fire Rate Conditional | +34% | Active (5s) |
| Ammo Conditional | +75% | Active (5s, no mag cap) |
| Duration | 5s | Active |
| Cooldown | 30s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 13% + 70% × (5/30) | 25 (eff %) | 1.7 | adds | ⚖️ Largest bullet lifesteal source. |
| `fire_rate` | 34% × (5/30) | 6 (eff %) | 0.3 | adds | Active burst FR. |
| `bullet_damage` | +6% + fire-rate burst amp (Vitality, no Weapon baseline) | 12 (eff gun-dmg %) | 0.2 | adds | 6 + FR lift. |
| `gun_burst_damage` | FR-driven burst in 5s = pure burst window | 95 (raw dmg within 1s) | 0.8 | adds | ⚖️ R2: 5s active is the textbook burst window. |
| `gun_continuous_damage` | extends mag past cap | 50 (raw dmg outside 1s) | 0.5 | adds | R2 + ammo extension. |
| `magazine_size_dependant` | +75% × (5/30) | 13 (eff ammo %) | 0.1 | adds | Active ammo refill, no mag cap. |
| `self_heal` | 70% lifesteal × 5s burst | 250 (HP total) | 0.7 | adds | Burst lifesteal sustain. |
| `bullet_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline + 100 HP | 129 (HP) | 0.3 | adds | 29 + 100. |
| `single_ability_focus` | active-driven | 45 (% importance) | 1.1 | adds | R17. |
| `engage` | 5s burst window favors commit | 55 (% importance) | 1.2 | adds | Engagement burst tool. |


---

## Witchmail
- **normalized_name**: `witchmail` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_absorbing_armor`
- **wiki**: https://deadlock.wiki/Witchmail

### Interpretation
Anti-spirit-caster CDR sponge: +22% Spirit Resist, +14 SP. Passive (1s ICD): every spirit hit >75 dmg reduces a random ability cooldown by 4s. Rewards taking spirit damage while ability-flush.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +22% | Passive |
| Spirit Power | +14 | Passive |
| Cooldown Reduction per Hit | 4s | Passive (1s ICD) |
| Damage Threshold | 75 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | -4s per hit × proc-rate | 18 (eff CDR %) | 0.7 | adds | ⚖️ Named cdr-via-taking-damage anchor. |
| `spirit_resistance` | +22% direct | 22 (eff %) | 0.8 | adds | Direct. |
| `spirit_damage` | +14 SP (Vitality, no baseline) | 14 (SP-equiv) | 0.2 | adds | Direct. |
| `counter_importance` | counter to spirit-burst | 70 (% importance) | 1.4 | adds | R13: spirit-resist + CDR mirror. |
| `damage_sponge` | rewards being hit | 50 (% importance) | 1.1 | adds | R26: incentivizes taking spirit dmg. |
| `ability_spam` | CDR enables more casts | 50 (% importance) | 1.3 | adds | R20: more uses/min. |
| `scaling_late` | CDR + SP = scaling caster | 40 (% importance) | 1.0 | adds | R32. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) | 0.2 | adds | R2 symmetric. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) | 0.1 | adds | R2. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) | 0.1 | adds | R31. |


---

## Arctic Blast
- **normalized_name**: `arctic_blast` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_arctic_blast`
- **wiki**: https://deadlock.wiki/Arctic_Blast

### Interpretation
AoE freeze + stamina-lock: +10% Spirit Resist. Active (24s CD): 175+0.7×SP damage, Freeze 1s then Slow, 16m end radius — slowed targets have their stamina regen frozen.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Damage | 175 + 0.7×SP | Active (24s CD) |
| Freeze Duration | 1s | Active |
| End Radius | 16m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 16m radius | 75 (% importance) | 1.9 | adds | ⚖️ Large AoE. |
| `stun` | 1s freeze × ~3 enemies × (1/24s CD) | 0.12 (eff s) | 0.2 | adds | Freeze = hard CC. |
| `movement_slow` | slow + stamina freeze after | 35 (eff slow weighted) | 0.7 | adds | Slow + stamina lock. |
| `spirit_damage` | (175+0.7×20)/24s + T4 baseline | 16 (SP-equiv) | 0.2 | adds | 189/24 ≈ 7.9 + 8.3 baseline. |
| `spirit_burst_damage` | one big AoE burst within 1s | 180 (raw dmg within 1s) | 1.5 | adds | Single-cast burst. |
| `spirit_burst_proc` | one big proc on cast | 0.40 (proc index) | 0.9 | adds | R6: instant cast proc. |
| `spirit_resistance` | +10% direct | 10 (eff %) | 0.3 | adds | Direct. |
| `engage` | AoE freeze = group engage | 65 (% importance) | 1.4 | adds | R11. |
| `counter_importance` | anti-stamina + anti-mobility | 60 (% importance) | 1.2 | adds | R13: freezes stamina regen. |
| `grounded` | grounded cast | 35 (% importance) | 1.4 | adds | R7. |
| `single_ability_focus` | active is the payoff | 40 (% importance) | 1.0 | adds | R17. |


---

## Boundless Spirit
- **normalized_name**: `boundless_spirit` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_boundless_spirit`
- **wiki**: https://deadlock.wiki/Boundless_Spirit

### Interpretation
The named Spirit stat-stick anchor: +15% Spirit Power (% of current — unique), +30 SP, +75 HP, +4 OOC Regen. Per Notes: only item providing % of current SP. Pure scaling vehicle for spirit builds.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power (%) | +15% | Passive (multiplicative on current SP) |
| Spirit Power | +30 | Passive (flat) |
| Bonus Health | +75 | Passive |
| Out of Combat Regen | +4 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 30 flat + (15% × 100 SP existing build) + T4 baseline | 53 (SP-equiv) | 0.8 | adds | ⚖️ Named SP anchor T4. 8.3 baseline + 30 + 15. |
| `spirit_burst_damage` | SP lifts burst | 60 (raw dmg within 1s) | 0.5 | adds | R2 symmetric. |
| `spirit_continuous_damage` | SP lifts continuous | 60 (raw dmg outside 1s) | 0.3 | adds | R2. |
| `scaling_late` | % of current SP rewards stacking | 65 (% importance) | 1.6 | adds | ⚖️ Greedy SP scaler — uniquely rewards SP stacking. |
| `high_max_hp` | +75 HP (Spirit, no Vit baseline) | 75 (HP) | 0.2 | adds | Explicit. |
| `self_heal` | +4 OOC | 80 (HP total) | 0.2 | adds | 4 × 20s OOC. |
| `single_target` | pure stat stick, no AoE | 35 (% importance) | 1.1 | adds | Stat stick neutrality. |


---

## Cursed Relic
- **normalized_name**: `cursed_relic` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_glitch`
- **wiki**: https://deadlock.wiki/Cursed_Relic

### Interpretation
Buff stripper / lockdown active: -10% Damage Penalty. Active (55s CD): Silence + Disarm + interrupt + prevent item usage + REMOVE all non-ultimate buffs. 3.25s, 20m range. Per Notes: long list of stripped hero/item buffs (Berserker stacks, Active Reload, Fleetfoot, etc).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage Penalty | -10% | Passive (self) |
| Status Effect | Silenced + Disarm | Active |
| Duration | 3.25s | Active |
| Cast Range | 20m | Active |
| Cooldown | 55s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 3.25s × 1 target | 5 (weighted) | 0.6 | adds | ⚖️ Longest silence at T4. |
| `disarm` | 3.25s × 1 target × (3.25/55) | 0.20 (s × count) | 0.1 | adds | Same duration as silence. |
| `interrupt` | interrupts channels on cast | 75 (eff freq) | 2.0 | adds | ⚖️ Named interrupt anchor. |
| `debuff` | strips all non-ult buffs + silence + disarm | 80 (% importance) | 2.0 | adds | ⚖️ Largest buff-strip in game. |
| `counter_importance` | counter to buff-stack heroes/items | 95 (% importance) | 1.9 | adds | ⚖️ Named anti-buff anchor. |
| `ult_focused` | doesn't strip ults — punishes non-ults | 50 (% importance) | 1.1 | adds | R22: ult-flavored anti-utility. |
| `single_target` | per-target curse | 60 (% importance) | 1.8 | adds | Cast on one. |
| `spirit_damage` | T4 Spirit baseline (penalty subtracts) | 0 (SP-equiv) | 0.0 | adds | -10% damage penalty = no damage scaling. |
| `engage` | locks down then commit | 50 (% importance) | 1.1 | adds | R11: setup tool. |


---

## Echo Shard
- **normalized_name**: `echo_shard` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_ability_power_shard`
- **wiki**: https://deadlock.wiki/Echo_Shard

### Interpretation
Ability-duplicator (effect detail not captured in scrape — small stat passives: +5% Fire Rate, +5% Spirit Resist, +5% Bullet Resist). Famously used to duplicate ultimates / key abilities.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +5% | Passive |
| Spirit Resist | +5% | Passive |
| Bullet Resist | +5% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ult_focused` | famously duplicates ults | 75 (% importance) | 1.6 | adds | ⚖️ Named ult-duplicator. |
| `ability_spam` | doubles a cast in fight | 60 (% importance) | 1.6 | adds | R20: enables 2× cast per fight. |
| `single_ability_focus` | one big copy per fight | 60 (% importance) | 1.5 | adds | R17: rewards a key ability. |
| `fire_rate` | +5% direct | 5 (eff %) | 0.2 | adds | Direct. |
| `spirit_resistance` | +5% direct | 5 (eff %) | 0.2 | adds | Direct. |
| `bullet_resistance` | +5% direct | 5 (eff %) | 0.2 | adds | Direct. |
| `spirit_damage` | T4 baseline + ult-duplication = SP-equiv burst | 13 (SP-equiv) | 0.2 | adds | 8.3 baseline + small ult-duplication value. |
| `spirit_burst_damage` | duplicates a burst ability | 55 (raw dmg within 1s) | 0.4 | adds | R2: ult-duplication is burst-flavored. |
| `counter_importance` | gives flex utility | 30 (% importance) | 0.6 | adds | R13. |
| `scaling_late` | shines in big-cooldown fights | 40 (% importance) | 1.0 | adds | R32. |


---

## Escalating Exposure
- **normalized_name**: `escalating_exposure` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_escalating_exposure`
- **wiki**: https://deadlock.wiki/Escalating_Exposure

### Interpretation
Stacking spirit amp on target: -8% Spirit Resist On Spirit Damage (built-in mechanic) + +17% Spirit Resist self. Passive (0.7s ICD): spirit damage applies +4.5% Spirit Amp per stack, 12 max, 12s, 12s duration. Per Notes: amplified dmg is separate instance (matters for Tankbuster style).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist On Spirit Damage | -8% | Passive (built-in shred on spirit hits) |
| Spirit Resist | +17% | Passive |
| Spirit Amp per Stack | +4.5% | Passive (0.7s ICD) |
| Max Stacks | 12 | Passive |
| Duration | 12s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 4.5% × ~8 typical stacks + 8.3 baseline | 50 (SP-equiv) | 0.8 | adds | ⚖️ Named spirit-amp ramp anchor. |
| `spirit_resist_shred` | -8% direct on spirit hits + stack amp ≈ shred | 25 (eff shred %) | 1.5 | adds | Alt-form of shred (amp instead of resist debuff). |
| `scaling_late` | stack ramp rewards sustained casting | 65 (% importance) | 1.6 | adds | ⚖️ Stack scaling. |
| `spirit_burst_damage` | first stacks within 1s | 90 (raw dmg within 1s) | 0.7 | adds | R2. |
| `spirit_continuous_damage` | stack ramp over 12s | 220 (raw dmg outside 1s) | 1.2 | adds | R2: sustained. |
| `spirit_continuous_proc` | per-hit stack | 0.45 (proc index) | 1.1 | adds | R5: ramp via continuous spirit. |
| `single_target` | stack per target | 60 (% importance) | 1.8 | adds | Stacks single-target. |
| `spirit_resistance` | +17% direct | 17 (eff %) | 0.6 | adds | Direct. |
| `ability_spam` | rewards repeated casting | 40 (% importance) | 1.1 | adds | R20. |
| `multi_ability_focus` | any spirit hit stacks | 35 (% importance) | 1.0 | adds | R20. |


---

## Ethereal Shift
- **normalized_name**: `ethereal_shift` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_self_bubble`
- **wiki**: https://deadlock.wiki/Ethereal_Shift

### Interpretation
Void-state untargetable: no flat passives. Active (35s CD): 4s untargetable + invincible (can float 2.5m/s but no actions). Afterwards: +20 SP, +30% SR, +3m MS for 5s. Per Notes: cancels own channeled abilities on cast.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Active Duration | 4s | Active (untargetable + invincible, 35s CD) |
| Spirit Power | +20 | Active (5s post-shift) |
| Spirit Resist | +30% | Active (5s post-shift) |
| Move Speed | +3m | Active (5s post-shift) |
| Buff Duration | 5s | — |
| Float Speed | 2.5m | Active (during shift) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `escape` | untargetable 4s | 95 (% importance) | 1.8 | adds | ⚖️ Named escape anchor T4. |
| `cc_resist` | untargetable suppresses CC | 50 (eff %) | 1.5 | adds | Effective CC immunity 4s. |
| `counter_importance` | counter to burst chains | 70 (% importance) | 1.4 | adds | R13: deletes burst windows. |
| `spirit_damage` | +20 × (5/35) + T4 baseline | 11 (SP-equiv) | 0.2 | adds | 8.3 + 3 conditional. |
| `spirit_resistance` | +30% × (5/35) | 4 (eff %) | 0.1 | adds | Active-only. |
| `horizontal_mobility` | +3m × (5/35) | 0.4 (m/s eff) | 0.2 | adds | Active-only. |
| `self_buff` | self-only | 60 (% importance) | 1.7 | adds | Self-only. |
| `aerial` | floats while shifted | 40 (% importance) | 0.9 | adds | R7: aerial-friendly. |
| `single_ability_focus` | active is the payoff | 45 (% importance) | 1.1 | adds | R17. |


---

## Focus Lens
- **normalized_name**: `focus_lens` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_focus_lens`
- **wiki**: https://deadlock.wiki/Focus_Lens

### Interpretation
Delayed silence + damage-store: +10% Fire Rate. Active (45s CD): silence target 4.5s — 30% of damage dealt during silence applied as bonus on expire; -9% SR + -30 SP for 12s. Per Notes: cleanse removes Lens but still deals stored damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +10% | Passive |
| Silence Duration | 4.5s | Active (45s CD) |
| Damage On Expire | 30% | Active (of dmg dealt during silence) |
| Spirit Resist | -9% | Active (12s on target) |
| Spirit Power | -30 | Active (target's SP, 12s) |
| Cast Range | 20m | Active |
| Resist Reduction Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 4.5s × 1 target × (4.5/45) | 6 (weighted) | 0.7 | adds | ⚖️ T4 silence anchor. |
| `spirit_resist_shred` | -9% × (12/45) uptime | 4 (eff shred %) | 0.2 | adds | Resist shred uptime. |
| `debuff` | silence + SP-drain + resist-shred | 60 (% importance) | 1.5 | adds | Triple debuff. |
| `counter_importance` | counter to spirit casters | 75 (% importance) | 1.5 | adds | R13: anti-caster. |
| `spirit_damage` | T4 baseline | 8.3 (SP-equiv) | 0.1 | adds | R31. |
| `spirit_burst_damage` | 30% stored dmg burst on expire | 90 (raw dmg within 1s) | 0.7 | adds | Burst spike when silence ends. |
| `fire_rate` | +10% direct | 10 (eff %) | 0.4 | adds | Direct. |
| `single_target` | per-target silence | 65 (% importance) | 2.0 | adds | Single-target. |
| `single_ability_focus` | active is the payoff | 45 (% importance) | 1.1 | adds | R17. |


---

## Lightning Scroll
- **normalized_name**: `lightning_scroll` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_ultimate_burst`
- **wiki**: https://deadlock.wiki/Lightning_Scroll

### Interpretation
Ult-triggered stun + bonus dmg: -30% Move Speed on Spirit Damage, +50 HP, +0.75m Sprint. Passive: ultimate damage → 0.75s stun + 150 spirit dmg after 3s delay. Per Notes: 5 heroes can't buy it (their ults don't trigger); Geist's ult bug.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Move Speed Conditional | -30% | Passive (on spirit dmg dealt) |
| Bonus Health | +50 | Passive |
| Sprint Speed | +0.75m | Passive |
| Stun Duration | 0.75s | Passive (on ult dmg) |
| Damage | 150 | Passive (post-delay) |
| Delay Before Effect | 3s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ult_focused` | trigger gated to ultimate | 90 (% importance) | 1.9 | adds | ⚖️ Named ult_focused anchor. |
| `stun` | 0.75s × on-ult uptime | 0.40 (eff s) | 0.5 | adds | R6: per-ult-cast burst stun. |
| `spirit_burst_damage` | 150 bonus dmg per ult | 110 (raw dmg within 1s) | 0.9 | adds | Burst chunk on ult. |
| `spirit_damage` | 150/ult-CD ≈ effective T4 anchor | 18 (SP-equiv) | 0.3 | adds | 8.3 baseline + ~10 conditional. |
| `movement_slow` | -30% on spirit dmg dealt × ~3 targets | 30 (eff slow weighted) | 0.6 | adds | Passive on-hit slow. |
| `counter_importance` | huge ult-window control | 65 (% importance) | 1.3 | adds | R13. |
| `horizontal_mobility` | +0.75m sprint | 0.75 (m/s eff) | 0.3 | adds | Direct. |
| `single_ability_focus` | one ability does everything | 70 (% importance) | 1.8 | adds | R17. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) | 0.1 | adds | Explicit. |


---

## Magic Carpet
- **normalized_name**: `magic_carpet` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_magic_carpet`
- **wiki**: https://deadlock.wiki/Magic_Carpet

### Interpretation
Flying escape: +15% Ability Duration, +125 HP, +14 SP, -15% Gravity Scale, +25% Air Control. Active (32s CD): fly 12s, slow-immune, dismiss on any action, 1.3s summon, +7m fly speed. Long-distance traversal + escape.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Bonus Health | +125 | Passive |
| Spirit Power | +14 | Passive |
| Gravity Scale | -15% | Passive (lighter) |
| Air Control | +25% | Passive |
| Carpet Duration | 12s | Active (32s CD) |
| Bonus Fly Speed | +7m | Active |
| Summon Duration | 1.3s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `escape` | named escape anchor T4 | 95 (% importance) | 1.8 | adds | ⚖️ Long-distance escape. |
| `horizontal_mobility` | +7m × (12/32) flight | 2.5 (m/s eff) | 1.1 | adds | Active mobility. |
| `vertical_mobility` | flight = best vertical mobility | 5 (units) | 1.2 | adds | ⚖️ Named vertical_mobility anchor. |
| `aerial` | flight tool | 85 (% importance) | 2.0 | adds | ⚖️ Named aerial-flavored item. |
| `cc_resist` | slow-immune flight | 30 (eff %) | 0.9 | adds | Slow immunity during flight. |
| `spirit_damage` | +14 SP + T4 baseline | 22 (SP-equiv) | 0.3 | adds | 14 + 8.3. |
| `high_max_hp` | +125 HP (Spirit, no Vit baseline) | 125 (HP) | 0.3 | adds | Explicit. |
| `duration_dependant` | +15% direct | 15 (eff %) | 0.6 | adds | Direct. |
| `farmer` | long-rotation mobility | 60 (% importance) | 1.2 | adds | R28: enables farm flex. |
| `single_ability_focus` | one active = full mobility | 40 (% importance) | 1.0 | adds | R17. |


---

## Mercurial Magnum
- **normalized_name**: `mercurial_magnum` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_ethereal_bullets`
- **wiki**: https://deadlock.wiki/Mercurial_Magnum

### Interpretation
Charge-up imbued bullets: +20% Max Ammo, +7 SP. Charge-Up (NOT affected by CDR per Notes, 12s buff): imbues ability with +25% base bullet damage spirit + 60+0.16×SP dmg + +22% Fire Rate + reload 100% bullets. Hybrid gun-spirit charge tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Spirit Power | +7 | Passive |
| Base Bullet Damage Spirit | +25 + 0.49×SP | Passive (12s buff post-charge) |
| Damage | 60 + 0.16×SP | Passive (imbued ability extra dmg) |
| Fire Rate | +22% | Passive (12s buff) |
| Bullets Reloaded | 100% | Passive |
| Buff Duration | 12s | Charge-Up — NOT affected by CDR |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | gun-spirit imbued bullets | 85 (% importance) | 1.7 | adds | ⚖️ Named hybrid anchor. |
| `charge_dependant` | Charge-Up mechanic per Notes | 80 (% importance) | 1.7 | adds | ⚖️ Charge-Up item. |
| `fire_rate` | +22% × ~0.5 charge uptime | 11 (eff %) | 0.5 | adds | Active-only. |
| `bullet_damage` | +25% + 0.49×SP per shot × charge uptime + T4 (Spirit, no Weapon baseline) | 30 (eff gun-dmg %) | 0.5 | adds | Big per-shot amp during buff. |
| `spirit_damage` | (60+0.16×20) one-shot imbued + 7 flat + baseline | 25 (SP-equiv) | 0.4 | adds | 8.3 baseline + 7 + 9 conditional. |
| `gun_burst_damage` | charge window is burst | 130 (raw dmg within 1s) | 1.2 | adds | R2: FR + amp burst. |
| `gun_continuous_damage` | charge window mostly burst | 60 (raw dmg outside 1s) | 0.5 | adds | R2 lighter. |
| `gun_burst_proc` | imbued ability proc | 0.35 (proc index) | 0.5 | adds | Single big proc on imbued ability. |
| `magazine_size_dependant` | reload 100% + +20% max ammo | 35 (eff ammo %) | 0.3 | adds | Major ammo lift. |
| `single_ability_focus` | one big ability proc | 50 (% importance) | 1.2 | adds | R17. |


---

## Mystic Reverb
- **normalized_name**: `mystic_reverb` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_mystic_reverb`
- **wiki**: https://deadlock.wiki/Mystic_Reverb

### Interpretation
Delayed AoE echo on imbued ability: +8% Spirit Lifesteal. Passive (6.25s ICD): imbue an ability with +50% of damage as AoE at 16m, +22% lifesteal on imbued, -40% MS slow, 3s delay. Per Notes: pure dmg doesn't trigger reverb; can store Quicksilver/Tankbuster dmg.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +8% | Passive |
| Damage Conditional | 50% | Passive (imbued ability extra AoE dmg) |
| Imbued Lifesteal | +22% | Passive |
| Move Speed Conditional | -40% | Passive (slow at target) |
| Radius | 16m | Passive |
| Delay Duration | 3s | Passive |
| Cooldown | 6.25s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 16m AoE | 75 (% importance) | 1.9 | adds | Large radius. |
| `spirit_damage` | 50% dmg of imbued ability + T4 baseline | 30 (SP-equiv) | 0.5 | adds | 8.3 baseline + amp on ability. |
| `spirit_burst_damage` | delayed AoE within ~3-4s | 100 (raw dmg within 1s) | 0.8 | adds | First-target burst. |
| `spirit_burst_proc` | imbue triggers AoE delayed | 0.30 (proc index) | 0.7 | adds | R6 with delay. |
| `spirit_continuous_damage` | echo extends ability dmg | 40 (raw dmg outside 1s) | 0.2 | adds | Brief continuous extension. |
| `movement_slow` | -40% × 3s × 1 target | 30 (eff slow weighted) | 0.6 | adds | Per-imbue. |
| `spirit_lifesteal` | 8% + 22% imbued ≈ 18% effective | 18 (eff %) | 1.1 | adds | Combined. |
| `self_heal` | lifesteal sustain | 90 (HP total) | 0.3 | adds | Imbued lifesteal. |
| `single_ability_focus` | imbues one ability | 70 (% importance) | 1.8 | adds | R17. |
| `counter_importance` | crowd-punish | 35 (% importance) | 0.7 | adds | R13. |


---

## Refresher
- **normalized_name**: `refresher` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_ability_refresher`
- **wiki**: https://deadlock.wiki/Refresher

### Interpretation
The ult / cooldown-reset utility (active not captured in scrape — famously resets all ability cooldowns once). Pure ult-tempo enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| (No flat passives in scrape) | — | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | resets all ability CDs once per fight | 35 (eff CDR %) | 1.4 | adds | ⚖️ Effective CDR via reset = ~35% in big fights. |
| `ult_focused` | famously used to double-ult | 95 (% importance) | 2.0 | adds | ⚖️ Named ult-reset anchor. |
| `ability_spam` | doubles all abilities once | 75 (% importance) | 2.0 | adds | R20: enables 2× cast cycle. |
| `multi_ability_focus` | resets ALL abilities | 70 (% importance) | 2.0 | adds | R20: hits all abilities. |
| `spirit_damage` | T4 baseline + ult-reset amp | 18 (SP-equiv) | 0.3 | adds | 8.3 baseline + ~10 via reset value. |
| `spirit_burst_damage` | enables double-burst combos | 80 (raw dmg within 1s) | 0.7 | adds | R2: reset enables 2× burst. |
| `scaling_late` | shines with bigger CDs | 65 (% importance) | 1.6 | adds | ⚖️ Late-game power-spike. |
| `counter_importance` | comeback / momentum tool | 50 (% importance) | 1.0 | adds | R13. |
| `single_ability_focus` | also rewards repeating key spell | 35 (% importance) | 0.9 | adds | R17. |


---

## Scourge
- **normalized_name**: `scourge` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_discord`
- **wiki**: https://deadlock.wiki/Scourge

### Interpretation
Self-OR-ally-cast aura DoT: +100 HP, +17% Debuff Resist. Active (35s CD): +40% SR on target + aura deals 3.5%/s of enemy max HP, 10s, 35m cast range, 10m aura radius. Per description: "Can be self cast" — so it's a tank-shred dive tool when self-cast AND a save-tool when ally-cast.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Debuff Resist | +17% | Passive |
| Max Health per Second | 3.5% | Active (aura, 10s) |
| Spirit Resist Conditional | +40% | Active (ally) |
| Duration | 10s | Active |
| Cast Range | 35m | Active |
| Aura Radius | 10m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 3.5% max HP/s for 10s | 85 (eff dmg) | 2.0 | adds | ⚖️ Named pure-damage tank-shred anchor. |
| `aoe_cluster` | 10m aura | 70 (% importance) | 1.8 | adds | Aura DoT. |
| `assist_importance` | ally-cast option | 70 (% importance) | 1.6 | adds | Can be ally-cast — R27. |
| `self_buff` | self-cast option (description: "Can be self cast") | 55 (% importance) | 1.6 | adds | ⚖️ Self-cast IS a primary use — full SR + aura on self. |
| `ally_buff` | +40% SR on ally for 10s | 60 (% importance) | 1.5 | adds | R24: ally use case. |
| `spirit_resistance` | +40% × (10/35) × self-cast share | 6 (eff %) | 0.2 | adds | Self-cast option gives self +40% SR; ~50/50 self vs ally cast. |
| `dot` | 3.5% max HP × 10s per target | 90 (eff dmg) | 0.5 | adds | ⚖️ Named DoT anchor. |
| `spirit_burst_damage` | first second of aura DoT | 50 (raw dmg within 1s) | 0.4 | adds | R2. |
| `spirit_continuous_damage` | 9s of sustained DoT | 250 (raw dmg outside 1s) | 1.4 | adds | R2: heavy sustained. |
| `spirit_continuous_proc` | per-second tick | 0.50 (proc index) | 1.2 | adds | R5. |
| `counter_importance` | counter to tanks (% max HP) | 80 (% importance) | 1.6 | adds | R13. |
| `debuff_resistance` | +17% direct | 17 (eff %) | 0.6 | adds | Direct. |
| `high_max_hp` | +100 HP (Spirit, no Vit baseline) | 100 (HP) | 0.3 | adds | Explicit. |
| `range_extender_dependant` | 35m cast range | 12 (eff %) | 0.4 | adds | Long-cast utility. |
| `team_heal` | resist buff acts like effective heal | 100 (HP total) | 0.2 | adds | Ally takes less dmg. |
| `engage` | self-cast aura when diving | 50 (% importance) | 1.1 | adds | R11: self-cast = dive aura. |
| `damage_sponge` | self-cast +40% SR makes you tankier | 40 (% importance) | 0.8 | adds | R26: self-cast tank tool. |


---

## Spirit Burn
- **normalized_name**: `spirit_burn` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_spirit_burn`
- **wiki**: https://deadlock.wiki/Spirit_Burn

### Interpretation
DoT explosion + anti-heal: +6% Ability Range. Passive (20s CD): significant spirit dmg (>500 in 5s) → 110 explosion + 24+0.06×SP DPS burn over 8s in 12m, -70% Healing Reduction. Half dmg + half CD on non-heroes.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +6% | Passive |
| Damage Threshold | 500 | Passive (in 5s) |
| Explosion Damage | 110 | Passive |
| Damage Per Second | 24 + 0.06×SP | Passive (8s burn) |
| Explosion Radius | 12m | Passive |
| Debuff Duration | 8s | Passive |
| Healing Reduction | -70% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `dot` | 24+0.06×20 = 25 DPS × 8s + 110 explosion | 200 (eff dmg) | 1.0 | adds | ⚖️ Named DoT anchor T4. |
| `aoe_cluster` | 12m AoE | 75 (% importance) | 1.9 | adds | Big AoE. |
| `spirit_burst_damage` | 110 explosion + first-1s DoT | 130 (raw dmg within 1s) | 1.6 | adds | Initial chunk. |
| `spirit_continuous_damage` | 7×25 DPS sustained | 175 (raw dmg outside 1s) | 1.5 | adds | R2: sustained DoT. |
| `spirit_continuous_proc` | per-tick burn | 0.50 (proc index) | 1.2 | adds | R5. |
| `spirit_damage` | (~200 dmg/20s CD) + baseline | 18 (SP-equiv) | 0.5 | adds | 10 + 8.3 baseline. |
| `anti_heal` | -70% healing reduction × 8s | 50 (eff %) | 1.7 | adds | ⚖️ Strong anti-heal T4. |
| `debuff` | DoT + anti-heal | 50 (% importance) | 1.2 | adds | Dual debuff. |
| `counter_importance` | anti-tank + anti-heal | 70 (% importance) | 1.4 | adds | R13. |
| `range_extender_dependant` | +6% direct | 6 (eff %) | 0.2 | adds | Direct. |
| `farmer` | AoE DoT clears NPCs | 50 (% importance) | 1.0 | adds | R28. |


---

## Transcendent Cooldown
- **normalized_name**: `transcendent_cooldown` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_transcendent_cooldown`
- **wiki**: https://deadlock.wiki/Transcendent_Cooldown

### Interpretation
Pure CDR stat stick: +4 OOC Regen. Passive: +25% Ability CDR + +25% Item CDR. Per Notes: retroactive on active CDs; does NOT affect Charge-Up items (Mercurial Magnum, Tankbuster).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4 | Passive |
| Ability Cooldown Reduction | +25% | Passive |
| Item Cooldown Reduction | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +25% ability + +25% item CDR | 50 (eff CDR %) | 2.0 | adds | ⚖️ Named cdr anchor — biggest CDR source. |
| `ability_spam` | rewards casting more | 70 (% importance) | 1.9 | adds | R20: CDR enables spam. |
| `spirit_damage` | CDR ≈ effective SP via more casts + baseline | 16 (SP-equiv) | — | adds | 8.3 baseline + ~8 CDR-derived. |
| `spirit_burst_damage` | more spirit casts per fight | 70 (raw dmg within 1s) | — | adds | R2: CDR amps burst. |
| `spirit_continuous_damage` | more sustained casts | 90 (raw dmg outside 1s) | — | adds | R2. |
| `scaling_late` | CDR stat stick scales late | 55 (% importance) | 1.4 | adds | R32. |
| `multi_ability_focus` | helps ALL abilities | 70 (% importance) | 2.0 | adds | R20: hits all abilities. |
| `self_heal` | +4 OOC | 80 (HP total) | 0.2 | adds | Small regen. |


---

## Vortex Web
- **normalized_name**: `vortex_web` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_aoe_root`
- **wiki**: https://deadlock.wiki/Vortex_Web

### Interpretation
Group-pull AoE trap: +8% Ability Range, +0.75m Sprint Speed. Active (42s CD): vacuum grenade pulls enemies in 12m to a small area + Slowing Hex (-35% MS, -40% Dash) for 4s. Alt-cast targets a unit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +8% | Passive |
| Sprint Speed | +0.75m | Passive |
| Capture Radius | 12m | Active (42s CD) |
| Move Speed Conditional | -35% | Active |
| Dash Distance | -40% | Active |
| Duration | 4s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `displace` | vacuum-pulls enemies into small area | 25 (e × m) | 2.0 | adds | ⚖️ Named displace anchor — group pull. |
| `trap_block_obstruct` | vortex creates AoE trap zone | 30 (p × s) | 2.0 | adds | ⚖️ Named trap anchor — group lockdown. |
| `aoe_cluster` | 12m capture | 80 (% importance) | 2.0 | adds | Large group AoE. |
| `movement_slow` | -35% × 4s × ~3 enemies | 32 (eff slow weighted) | 0.6 | adds | Slow on multiple. |
| `engage` | group-pull engage tool | 80 (% importance) | 1.8 | adds | ⚖️ Named engage anchor for groups. |
| `counter_importance` | vs grouped enemies | 65 (% importance) | 1.3 | adds | R13: punishes grouping. |
| `range_extender_dependant` | +8% direct | 8 (eff %) | 0.2 | adds | Direct. |
| `horizontal_mobility` | +0.75m sprint | 0.75 (m/s eff) | 0.3 | adds | Direct. |
| `spirit_damage` | T4 baseline | 8.3 (SP-equiv) | 0.1 | adds | R31. |
| `single_ability_focus` | active is the payoff | 50 (% importance) | 1.2 | adds | R17. |


---
# T? (9999 souls — Street Brawl / non-standard)

> **Pass-2 note:** Street Brawl items ARE scored, but they are EXCLUDED from the 2.0 cross-tier
> anchor and the tier ladder, and capped at 1.5 normalized. Their comparative raws below are
> still authored honestly (often very high) — the cap is applied during normalization, not here.

## Haunting Shot
- **normalized_name**: `haunting_shot` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_eldritch_shot`
- **wiki**: https://deadlock.wiki/Haunting_Shot

### Interpretation
Street Brawl gun nuke: charged shot (2.5s CD) deals +10% current-HP spirit damage AND applies a -40% damage / -40% healing / -40% MS / -40% Dash debuff for 4s. Bullet is enlarged (1.5m radius) and penetrates. Multi-debuff anti-everything bullet.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Current Health Damage | 10% | Passive (per charged shot, 2.5s CD) |
| Damage Penalty Conditional | -40% | Passive (enemy debuff, 4s) |
| Healing Reduction Conditional | -40% | Passive (enemy debuff, 4s) |
| Move Speed | -40% | Passive |
| Dash Distance | -40% | Passive |
| Bullet Radius | 1.5m | Passive (penetrates) |
| Debuff Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 10% current HP per shot | 90 (eff dmg) | 1.5 | adds | ⚖️ SB pure-damage anchor — % current HP bypasses pools. |
| `anti_heal` | -40% × 4s × ~0.7 uptime | 30 (eff %) | 1.0 | adds | Heavy anti-heal. |
| `movement_slow` | -40% × 4s × on-bullet | 35 (eff slow weighted) | 0.7 | adds | Strong slow. |
| `debuff` | triple-axis debuff per shot | 90 (% importance) | 1.5 | adds | ⚖️ Multi-debuff bullet. |
| `counter_importance` | anti-tank + anti-heal + anti-mobility | 95 (% importance) | 1.5 | adds | ⚖️ SB anti-everything counter. |
| `bullet_damage` | per-shot amp (Weapon, no SB baseline) | 35 (eff gun-dmg %) | 0.6 | adds | Direct gun amp from %HP dmg. |
| `gun_burst_damage` | charged-shot is single big burst | 95 (raw dmg within 1s) | 0.8 | adds | R2: per-shot heavy. |
| `single_target` | per-target | 70 (% importance) | 1.5 | adds | Per-shot bullet. |
| `aoe_cluster` | 1.5m bullet penetration | 35 (% importance) | 0.9 | adds | Mild AoE via bullet radius. |
| `long_range` | enlarged piercing bullet favors range | 45 (% importance) | 1.0 | adds | Penetration helps long shots. |


---

## Infinite Rounds
- **normalized_name**: `infinite_rounds` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_infinite_rounds`
- **wiki**: https://deadlock.wiki/Infinite_Rounds

### Interpretation
Street Brawl sustained DPS: +200% Bullet Velocity, +35% Fire Rate, and 65% Proc Chance for bullets to pierce + ignore Bullet Resist. Per Notes: magazine is infinite but you can still reload (interacts with reload-tied effects).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +200% | Passive |
| Fire Rate | +35% | Passive |
| Proc Chance | 65% | Passive (bullets pierce + ignore BR) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +35% direct | 35 (eff %) | 1.5 | adds | Direct. |
| `bullet_damage` | per-shot amp + 65% bypass | 50 (eff gun-dmg %) | 0.8 | adds | ⚖️ SB gun-DPS amp. 35 FR amp + 65% bypass effective. |
| `bullet_resist_shred` | 65% chance to bypass BR | 22 (eff shred %) | 1.5 | adds | 0.65 × ~35% effective resist bypassed. |
| `gun_burst_damage` | fire-rate + bypass = burst | 180 (raw dmg within 1s) | 1.5 | adds | R2: fire-rate heavy on burst. |
| `gun_continuous_damage` | infinite magazine + bypass | 280 (raw dmg outside 1s) | 1.5 | adds | R2: sustained. |
| `gun_burst_proc` | per-bullet pierce roll | 0.40 (proc index) | 0.6 | adds | R6 high. |
| `gun_continuous_proc` | sustained per-shot proc | 0.65 (proc index) | 1.0 | adds | 65% per shot. |
| `magazine_size_dependant` | infinite mag | 50 (eff ammo %) | 0.4 | adds | Effectively unlimited ammo. |
| `long_range` | +200% velocity | 65 (% importance) | 1.4 | adds | Velocity favors range. |
| `counter_importance` | counters bullet-defense | 65 (% importance) | 1.3 | adds | R13: bypasses BR + evasion. |
| `single_target` | bullet-only | 50 (% importance) | 1.5 | adds | Per-shot proc. |


---

## Runed Gauntlets
- **normalized_name**: `runed_gauntlets` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_runed_gauntlets`
- **wiki**: https://deadlock.wiki/Runed_Gauntlets

### Interpretation
Street Brawl melee monster: +150% Heavy Melee Distance, +50% Melee Resist, +30% Melee Damage. Passive (10s CD): on heavy melee hit, 16% CDR (min 4s). Per Notes: parry-piercing on cooldown after a pierce; Viscous' Puddle Punch can still be parried.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +150% | Passive |
| Melee Resist | +50% | Passive |
| Melee Damage | +30% | Passive |
| Cooldown Reduction on Hit | 16% | Passive (10s CD between procs) |
| Min Reduction | 4s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +30% + heavy reach + ability scaling | 55 (eff melee-dmg %) | 1.5 | adds | ⚖️ SB melee anchor. |
| `melee_resistance` | +50% direct | 50 (eff %) | 1.5 | adds | Direct. |
| `cooldown_reduction` | 16% × heavy-hit uptime | 14 (eff CDR %) | 0.6 | adds | Melee-gated CDR. |
| `engage` | heavy melee = commit | 75 (% importance) | 1.5 | adds | R11. |
| `close_range` | melee-gated | 95 (% importance) | 1.5 | adds | R21. |
| `long_range` | anti-affinity | -40 (% importance) | -0.9 | adds | R30. |
| `grounded` | melee is grounded | 50 (% importance) | 1.5 | adds | R7. |
| `damage_sponge` | +50% melee resist | 40 (% importance) | 0.8 | adds | R26. |
| `ability_spam` | melee-driven CDR enables more casts | 50 (% importance) | 1.3 | adds | R20. |
| `counter_importance` | counter to parry / melee meta | 35 (% importance) | 0.7 | adds | R13: parry pierce. |


---

## Celestial Blessing
- **normalized_name**: `celestial_blessing` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_celestial_guidance`
- **wiki**: https://deadlock.wiki/Celestial_Blessing

### Interpretation
Street Brawl global team-heal + cleanse: Active (30s CD) globally heals allies 60% missing HP (min 400), cleanses, +100% Stamina Recovery + +5m MS for 6s. Massive team-utility ult.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heal Amount | 60% (of missing) | Active (30s CD, global) |
| Min Heal | 400 | Active |
| Stamina Recovery Conditional | +100% | Active (6s) |
| Move Speed Conditional | +5m | Active (6s) |
| Buff Duration | 6s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `team_heal` | 400 min heal × 5 allies global | 2000 (HP total) | 1.5 | adds | ⚖️ SB team-heal anchor. |
| `assist_importance` | global team cleanse + heal | 95 (% importance) | 1.5 | adds | ⚖️ Best support ult in SB. |
| `ally_buff` | +5m MS + stamina + heal globally | 90 (% importance) | 1.5 | adds | R24: best ally buff. |
| `burst_heal` | instant 400+ HP per ally | 400 (HP within 1s) | 1.3 | adds | Instant burst heal. |
| `self_heal` | also heals self | 400 (HP total) | 1.2 | adds | Self included. |
| `cc_resist` | cleanse | 35 (eff %) | 1.1 | adds | Strong cleanse. |
| `horizontal_mobility` | +5m × (6/30) | 1.0 (m/s eff) | 0.4 | adds | Ally MS burst. |
| `counter_importance` | counter to wipe / focus | 70 (% importance) | 1.4 | adds | R13: comeback ult. |
| `engage` | re-stamina + MS for ally team push | 55 (% importance) | 1.2 | adds | Team-engage utility. |
| `escape` | global heal + MS = retreat | 65 (% importance) | 1.2 | adds | Team retreat. |


---

## Cloak of Opportunity
- **normalized_name**: `cloak_of_opportunity` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_cloak_of_opportunity`
- **wiki**: https://deadlock.wiki/Cloak_of_Opportunity

### Interpretation
Street Brawl auto-Unstoppable: Passive (12s CD): block next movement-lock / Stun / Chained / Immobilize / Sleep AND become Unstoppable for 4s + 500 barrier + +3m MS for 6s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier Conditional | 500 | Passive (on trigger) |
| Move Speed Conditional | +3m | Passive (6s) |
| Unstoppable Duration | 4s | Passive |
| Buff Duration | 6s | Passive |
| Cooldown | 12s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cc_resist` | block CC + Unstoppable 4s × (4/12) | 75 (eff %) | 1.5 | adds | ⚖️ SB CC-immunity anchor — auto-trigger. |
| `counter_importance` | counter to CC-heavy comps | 90 (% importance) | 1.5 | adds | ⚖️ Best anti-CC in SB. |
| `shield` | 500 × (6/12) uptime | 250 (shield HP) | 0.5 | adds | High-uptime barrier. |
| `horizontal_mobility` | +3m × (6/12) | 1.5 (m/s eff) | 0.6 | adds | High uptime MS. |
| `debuff_resistance` | block + Unstoppable | 40 (eff %) | 1.4 | adds | Combined. |
| `escape` | barrier + MS + Unstoppable | 80 (% importance) | 1.5 | adds | Strong escape combo. |
| `engage` | dive without fear of CC | 60 (% importance) | 1.3 | adds | R11. |
| `damage_sponge` | barrier-soak + Unstoppable | 55 (% importance) | 1.2 | adds | R26. |
| `high_max_hp` | barrier ≈ effective HP | 100 (HP) | 0.3 | adds | Shield-as-HP. |
| `self_buff` | self-trigger | 60 (% importance) | 1.5 | adds | Self-only. |


---

## Electric Slippers
- **normalized_name**: `electric_slippers` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_electric_slippers`
- **wiki**: https://deadlock.wiki/Electric_Slippers

### Interpretation
Street Brawl slide-DPS kit: +2 Stamina, +80% Slide Distance. Passive (0.3s per-target ICD): while sliding, evade bullets (60), gain +60% Fire Rate, deal 100 dmg to enemies in 12m.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +2 | Passive |
| Slide Distance | +80% | Passive |
| Damage | 100 | Passive (sliding) |
| Evasion While Sliding Conditional | 60 | Passive |
| Fire Rate While Sliding Conditional | +60% | Passive |
| Radius | 12m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | 60% × slide uptime | 25 (eff %) | 1.5 | adds | Conditional on sliding. |
| `fire_rate` | +60% × slide uptime ~0.4 | 24 (eff %) | 1.1 | adds | Slide-gated. |
| `aoe_cluster` | 12m slide AoE dmg | 65 (% importance) | 1.5 | adds | Slide-AoE crowd dmg. |
| `spirit_damage` | 100 dmg × slide hits | 25 (SP-equiv) | 0.4 | adds | Per-target dmg. |
| `spirit_burst_damage` | sliding AoE burst | 100 (raw dmg within 1s) | 0.8 | adds | Slide-burst. |
| `vertical_mobility` | +80% slide distance + stamina | 3 (units) | 0.7 | adds | Slide IS mobility. |
| `horizontal_mobility` | slide = mobile fight | 2.5 (m/s eff) | 1.1 | adds | Direct mobility. |
| `engage` | slide-into-fight | 75 (% importance) | 1.5 | adds | R11: slide engage. |
| `escape` | slide-out-of-fight | 55 (% importance) | 1.0 | adds | Slide utility. |
| `counter_importance` | counter to gun-DPS via evasion | 50 (% importance) | 1.0 | adds | R13. |


---

## Eternal Gift
- **normalized_name**: `eternal_gift` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_eternal_gift`
- **wiki**: https://deadlock.wiki/Eternal_Gift

### Interpretation
Street Brawl random-stat snowball: Passive — periodically (2s frequency) gain a random PERMANENT stat buff, plus -70% respawn timer on next death (165s CD). Pure scaling-late farm tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Buff Frequency | 2s | Passive (random stat buff every 2s) |
| Respawn Time Conditional | -70% | Passive (next death only, 165s CD) |
| Cooldown | 165s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `scaling_late` | permanent random stats over time | 90 (% importance) | 1.5 | adds | ⚖️ SB scaling-late anchor. |
| `high_max_hp` | random stat buffs include HP | 100 (HP) | 0.3 | adds | Random HP allocations accumulate. |
| `bullet_damage` | random stat buffs include WD | 25 (eff gun-dmg %) | 0.4 | adds | Random WD share. |
| `spirit_damage` | random stat buffs include SP | 25 (SP-equiv) | 0.4 | adds | Random SP share. |
| `fire_rate` | random share of stat buffs | 12 (eff %) | 0.5 | adds | Random FR share. |
| `farmer` | game-time-gated growth | 70 (% importance) | 1.4 | adds | R28: rewards staying alive. |
| `damage_sponge` | random HP scaling | 50 (% importance) | 1.1 | adds | R26. |
| `counter_importance` | comeback / momentum tool | 35 (% importance) | 0.7 | adds | R13: respawn reduction. |
| `scaling_early` | -70% respawn = recovery from early deaths | 35 (% importance) | 1.0 | adds | Comeback-flavored. |
| `self_buff` | self-only stat scaling | 55 (% importance) | 1.5 | adds | Self-only. |


---

## Nullification Burst
- **normalized_name**: `nullification_burst` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_nullification_aura`
- **wiki**: https://deadlock.wiki/Nullification_Burst

### Interpretation
Street Brawl AoE buff-strip + lockout: +40% Debuff Resist, +300 HP. Active (18s CD): 250+0.47×SP dmg + remove buffs + prevent stamina + prevent healing, 20m radius, 7s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +40% | Passive |
| Bonus Health | +300 | Passive |
| Damage | 250 + 0.47×SP | Active (18s CD) |
| Duration | 7s | Active |
| End Radius | 20m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 20m + 7s lockout | 95 (% importance) | 1.5 | adds | ⚖️ SB AoE strip anchor. |
| `debuff` | buff-strip + anti-stam + anti-heal | 95 (% importance) | 1.5 | adds | ⚖️ Triple-debuff AoE. |
| `anti_heal` | prevents healing 7s × ~3 enemies | 50 (eff %) | 1.5 | adds | Hard healing lock. |
| `counter_importance` | AoE buff-strip = team teamfight win | 95 (% importance) | 1.5 | adds | ⚖️ Best AoE counter in SB. |
| `spirit_damage` | (250+0.47×40)/18 ≈ ~15 dps + amp | 30 (SP-equiv) | 0.5 | adds | Direct amp. |
| `spirit_burst_damage` | one big AoE burst | 250 (raw dmg within 1s) | 1.5 | adds | Initial burst. |
| `spirit_burst_proc` | one big proc | 0.40 (proc index) | 0.9 | adds | R6. |
| `debuff_resistance` | +40% direct | 40 (eff %) | 1.4 | adds | Direct. |
| `high_max_hp` | +300 HP | 300 (HP) | 0.8 | adds | Explicit. |
| `engage` | team-engage lockout | 80 (% importance) | 1.5 | adds | R11: AoE strip. |
| `damage_sponge` | +300 HP + 40% debuff resist | 55 (% importance) | 1.2 | adds | R26. |


---

## Seraphim Wings
- **normalized_name**: `seraphim_wings` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_icarus_wings`
- **wiki**: https://deadlock.wiki/Seraphim_Wings

### Interpretation
Street Brawl aerial god mode: +120% Stamina Recovery, -70% Gravity, +100% Air Control, +50% Air Acceleration. Passive: airborne = +40% dmg + -40% dmg taken + unlimited Air Dash/Jump.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina Recovery | +120% | Passive |
| Gravity Scale | -70% | Passive |
| Air Control | +100% | Passive |
| Air Acceleration | +50% | Passive |
| In Air Damage | +40% | Passive (while airborne) |
| In Air Damage Received | -40% | Passive (while airborne) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aerial` | flight-grade kit + +40% dmg airborne | 100 (% importance) | 1.5 | adds | ⚖️ SB aerial anchor — peak aerial item. |
| `vertical_mobility` | unlimited jump + dash | 8 (units) | 1.5 | adds | ⚖️ Best vertical mobility. |
| `horizontal_mobility` | air-control + low gravity ≈ effective MS | 3.5 (m/s eff) | 1.5 | adds | Air mobility. |
| `bullet_damage` | +40% airborne damage | 30 (eff gun-dmg %) | 0.5 | adds | Airborne-gated 40% × ~0.7. |
| `spirit_damage` | +40% airborne spirit | 20 (SP-equiv) | 0.3 | adds | Airborne 40% × spirit. |
| `gun_burst_damage` | airborne burst lift | 100 (raw dmg within 1s) | 0.9 | adds | R2. |
| `spirit_burst_damage` | airborne spirit burst | 50 (raw dmg within 1s) | 0.4 | adds | R2. |
| `bullet_resistance` | -40% in air dmg received | 25 (eff %) | 0.9 | adds | Airborne defense. |
| `spirit_resistance` | -40% in air dmg received | 25 (eff %) | 0.9 | adds | Symmetric. |
| `anti_air` | rules the air ↔ helps anti-air play | 60 (% importance) | — | relies | R7: aerial helps anti-air. |
| `grounded` | anti-affinity | -50 (% importance) | -1.5 | adds | Aerial kit anti-ground. |
| `escape` | air mobility = escape | 75 (% importance) | 1.4 | adds | R14. |
| `engage` | flying engages | 70 (% importance) | 1.5 | adds | R11. |


---

## Shadow Strike
- **normalized_name**: `shadow_strike` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_shadow_strike`
- **wiki**: https://deadlock.wiki/Shadow_Strike

### Interpretation
Street Brawl stamina-stealth-melee combo: +3 Stamina, +350 HP. Active (passive trigger on Stamina use): go invisible 3s with no detection, melee while invis → steal -40% bullet/spirit resist + 125+0.4×SP DPS for 6s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +3 | Passive |
| Bonus Health | +350 | Passive |
| Damage Per Second | 125 + 0.4×SP | Active (on melee while invis) |
| Invisibility Duration | 3s | Active |
| Steal Duration | 6s | Active |
| Resist Stolen | 40% | Active |
| Fade Time | 0.2s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `engage` | stealth-melee assassination tool | 95 (% importance) | 1.5 | adds | ⚖️ SB engage anchor. |
| `bullet_resist_shred` | 40% × steal duration × melee uptime | 25 (eff shred %) | 1.5 | adds | Big resist steal. |
| `spirit_resist_shred` | 40% × steal | 25 (eff shred %) | 1.5 | adds | Symmetric. |
| `melee_damage` | melee-trigger DPS | 40 (eff melee-dmg %) | 1.1 | adds | R12 + named melee combo. |
| `spirit_damage` | (125+0.4×40)/melee-CD × steal | 35 (SP-equiv) | 0.5 | adds | DoT scales with SP. |
| `spirit_continuous_damage` | 6s steal DoT outside 1s | 250 (raw dmg outside 1s) | 1.4 | adds | R2: sustained DoT. |
| `spirit_burst_damage` | first-1s of DoT | 125 (raw dmg within 1s) | 1.0 | adds | Heavy initial burst. |
| `close_range` | melee-gated | 95 (% importance) | 1.5 | adds | R21. |
| `escape` | invis on stamina | 65 (% importance) | 1.2 | adds | Stealth escape. |
| `grounded` | melee grounded | 50 (% importance) | 1.5 | adds | R7. |
| `high_max_hp` | +350 HP | 350 (HP) | 0.9 | adds | Explicit. |
| `counter_importance` | bypasses vision | 35 (% importance) | 0.7 | adds | R13. |
| `single_target` | per-target melee | 60 (% importance) | 1.5 | adds | Per-melee proc. |


---

## Frostbite Charm
- **normalized_name**: `frostbite_charm` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_shivas_bracelet`
- **wiki**: https://deadlock.wiki/Frostbite_Charm

### Interpretation
Street Brawl imbued freeze + amp: Active (10s CD): imbue ability with +50% CD reduction + +70 SP; on damage, freeze (1s) + +200 bonus damage. Per-target CD.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Imbued Ability Cooldown Reduction | +50% | Active (imbued) |
| Imbued Ability Spirit Power | +70 | Active |
| Damage | 200 | Active (on imbued ability hit) |
| Freeze Duration | 1s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `stun` | 1s freeze × per-target uptime | 0.6 (eff s) | 0.8 | adds | ⚖️ SB freeze anchor on imbued. |
| `spirit_damage` | +70 SP × imbue + 200 dmg | 90 (SP-equiv) | 1.4 | adds | ⚖️ Big SP amp on imbued. |
| `cooldown_reduction` | +50% on imbued ability | 25 (eff CDR %) | 1.0 | adds | Imbue-targeted CDR. |
| `spirit_burst_damage` | +200 dmg burst on imbued hit | 200 (raw dmg within 1s) | 1.5 | adds | Imbued burst. |
| `spirit_burst_proc` | imbued ability trigger | 0.40 (proc index) | 0.9 | adds | R6. |
| `single_ability_focus` | imbues one ability | 80 (% importance) | 1.5 | adds | ⚖️ R17 named — single imbue anchor. |
| `engage` | freeze enables engage | 65 (% importance) | 1.4 | adds | R11. |
| `counter_importance` | CC + amp = anti-tank | 60 (% importance) | 1.2 | adds | R13. |
| `single_target` | per-target freeze | 55 (% importance) | 1.5 | adds | Single-target. |


---

## Mystic Conduit
- **normalized_name**: `mystic_conduit` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_patrons_blessing`
- **wiki**: https://deadlock.wiki/Mystic_Conduit

### Interpretation
Street Brawl spirit-team aura + heal-on-damage: Passive (25s CD): self/ally aura — +40% Ability Range, +40% Ability CDR (ally values reduced 50%), 25m radius. Damaging hero >300 dmg in 5s → 700 heal to self + allies in 35m.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +40% | Passive (aura) |
| Ability Cooldown Reduction | +40% | Passive (aura) |
| Ally Percentage | 50% | Passive (ally values halved) |
| Radius | 25m | Passive |
| Heal Amount | 700 | Passive (on dmg trigger) |
| Heal Radius | 35m | Passive |
| Damage Threshold | 300 | Passive |
| Cooldown | 25s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +40% direct | 40 (eff %) | 1.2 | adds | ⚖️ SB range anchor. |
| `cooldown_reduction` | +40% direct + 20% to allies | 50 (eff CDR %) | 1.5 | adds | ⚖️ SB cdr anchor. |
| `team_heal` | 700 × ~3 allies in 35m × on-trigger | 500 (HP total) | 1.0 | adds | Big team heal. |
| `burst_heal` | 700 instant per trigger | 700 (HP within 1s) | 1.5 | adds | Instant. |
| `assist_importance` | aura + heal benefits team | 80 (% importance) | 1.5 | adds | R27. |
| `ally_buff` | range + CDR to allies | 75 (% importance) | 1.5 | adds | R24. |
| `self_heal` | 700 to self on trigger | 700 (HP total) | 1.5 | adds | Self-included. |
| `ability_spam` | massive CDR enables spam | 70 (% importance) | 1.5 | adds | R20. |
| `spirit_damage` | range + CDR ≈ effective SP | 35 (SP-equiv) | 0.5 | adds | CDR + range amp. |
| `aoe_cluster` | 25m aura + 35m heal | 70 (% importance) | 1.5 | adds | Big radius. |
| `counter_importance` | comeback heal in fights | 60 (% importance) | 1.2 | adds | R13. |
| `close_to_team` | aura wants allies near | 50 (% importance) | 1.4 | adds | Aura coverage. |
| `scaling_late` | aura + heal = teamfight | 50 (% importance) | 1.2 | adds | R32. |


---

## Mystical Piano
- **normalized_name**: `mystical_piano` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_mystical_piano`
- **wiki**: https://deadlock.wiki/Mystical_Piano

### Interpretation
Street Brawl delayed AoE stun + daze: Active (23s CD): after 1.7s delay, stun all enemies in 12m for 2s + deplete their stamina + 2s daze after. Per Notes: dazed = slowed + disarmed + silenced + no actives.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stun Duration | 2s | Active (1.7s delay) |
| Daze Duration | 2s | Active (after stun: slowed + disarmed + silenced + no items) |
| Stun Delay | 1.7s | Active |
| Radius | 12m | Active |
| Cooldown | 23s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `stun` | 2s × ~3 enemies × (2/23 CD) | 0.85 (eff s) | 1.1 | adds | ⚖️ SB AoE-stun anchor. |
| `silence` | 2s daze × ~3 enemies | 8 (weighted) | 0.9 | adds | Daze includes silence. |
| `disarm` | 2s daze × ~3 enemies × (2/23) | 0.45 (s × count) | 0.2 | adds | Daze includes disarm. |
| `movement_slow` | daze slows | 35 (eff slow weighted) | 0.7 | adds | Daze slow. |
| `aoe_cluster` | 12m AoE | 80 (% importance) | 1.5 | adds | Big radius. |
| `engage` | AoE CC = team engage | 90 (% importance) | 1.5 | adds | ⚖️ Named engage anchor. |
| `counter_importance` | CC + lockout = anti-everything | 85 (% importance) | 1.5 | adds | R13: AoE CC ult. |
| `debuff` | stun + daze + stamina lock | 80 (% importance) | 1.5 | adds | Triple debuff. |
| `spirit_damage` | utility — no direct dmg, but CC = effective SP | 18 (SP-equiv) | 0.3 | adds | CC enables team dmg. |
| `single_ability_focus` | one active does it all | 50 (% importance) | 1.2 | adds | R17. |


---

## Omnicharge Signet
- **normalized_name**: `omnicharge_signet` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_omnicharge_pendant`
- **wiki**: https://deadlock.wiki/Omnicharge_Signet

### Interpretation
Street Brawl charge-stacking utility: +70% Faster Time Between Charges, +30% CDR for Charged Abilities, +50 SP for Charged Abilities. Passive: imbue non-ult ability with +2 charges (or +4 if already charged). Per Notes: bugs with Pain Battery and Flame Dash.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Time Between Charges | +70% faster | Passive |
| Charged Ability Cooldown Reduction | +30% | Passive |
| Charged Ability Spirit Power | +50 | Passive |
| Charged Ability | +4 charges | Passive (if already charged) |
| Non Charged Ability | +2 charges | Passive (if not charged) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | named anchor for charge_dependant | 95 (% importance) | 1.5 | adds | ⚖️ SB charge-dependant anchor. |
| `cooldown_reduction` | +30% charged + 70% faster between charges | 50 (eff CDR %) | 1.5 | adds | CDR for charges. |
| `spirit_damage` | +50 SP on charged abilities × imbue | 60 (SP-equiv) | 0.9 | adds | Big SP for charged. |
| `ability_spam` | charges enable spam | 80 (% importance) | 1.5 | adds | ⚖️ Charge stacking. |
| `single_ability_focus` | rewards key charged ability | 65 (% importance) | 1.5 | adds | R17. |
| `spirit_burst_damage` | charged ability burst | 80 (raw dmg within 1s) | 0.7 | adds | R2. |
| `spirit_continuous_damage` | repeated charges sustained | 80 (raw dmg outside 1s) | 0.4 | adds | R2. |
| `scaling_late` | charge-stacker scales late | 55 (% importance) | 1.4 | adds | R32. |
| `multi_ability_focus` | imbue extends to any active | 35 (% importance) | 1.0 | adds | Half-mirror to single-focus. |


---

## Prism Blast
- **normalized_name**: `prism_blast` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_prism_blast`
- **wiki**: https://deadlock.wiki/Prism_Blast

### Interpretation
Street Brawl invuln-spin-laser: Active (40s CD): void state — untargetable + invincible 6s — lasers blast out rotating, 270+1.8×SP DPS.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage Per Second | 270 + 1.8×SP | Active (40s CD) |
| Duration | 6s | Active (untargetable + invincible) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | rotating laser around self | 85 (% importance) | 1.5 | adds | ⚖️ SB AoE-DPS anchor. |
| `escape` | untargetable 6s | 90 (% importance) | 1.5 | adds | ⚖️ Best invuln in SB. |
| `spirit_damage` | (270+1.8×40) × 6 / 40 CD | 70 (SP-equiv) | 1.1 | adds | Heavy sustained amp. |
| `spirit_burst_damage` | first second of laser | 270 (raw dmg within 1s) | 1.5 | adds | Heavy burst. |
| `spirit_continuous_damage` | 5s sustained laser | 1500 (raw dmg outside 1s) | 1.5 | adds | ⚖️ Massive sustained DPS. |
| `spirit_continuous_proc` | per-second tick | 0.60 (proc index) | 1.4 | adds | R5. |
| `cc_resist` | invincible 6s | 60 (eff %) | 1.5 | adds | Untargetable. |
| `damage_sponge` | invuln-while-DPS | 70 (% importance) | 1.5 | adds | R26. |
| `counter_importance` | invuln teamfight pivot | 75 (% importance) | 1.5 | adds | R13. |
| `close_range` | rotating around self favors close fight | 65 (% importance) | 1.4 | adds | R21. |
| `engage` | invuln-dive | 75 (% importance) | 1.5 | adds | R11. |


---

## Shrink Ray
- **normalized_name**: `shrink_ray` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_shrink_ray`
- **wiki**: https://deadlock.wiki/Shrink_Ray

### Interpretation
Street Brawl self-or-ally model-shrink: Active (30s CD): target reduced to -50% Model Scale + +5m MS + +20% Fire Rate for 60s, 40m cast range. "Can be self-cast" per description; allows tunnel usage. Per Notes: alters voice when cast on ally.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Model Scale | -50% | Active (60s, on target) |
| Move Speed | +5m | Active |
| Fire Rate | +20% | Active |
| Shrink Duration | 60s | Active |
| Cast Range | 40m | Active |
| Cooldown | 30s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `small_hitbox` | -50% model scale | 95 (% importance) | 1.5 | adds | ⚖️ SB small_hitbox anchor. |
| `horizontal_mobility` | +5m × (60/90 typical uptime) | 3.5 (m/s eff) | 1.5 | adds | Huge MS. |
| `fire_rate` | +20% × uptime | 14 (eff %) | 0.6 | adds | Direct. |
| `assist_importance` | ally-cast option | 70 (% importance) | 1.5 | adds | Ally-cast utility. |
| `self_buff` | self-cast option | 60 (% importance) | 1.5 | adds | Description: "Can be self-cast." |
| `ally_buff` | full buff on ally | 65 (% importance) | 1.5 | adds | R24. |
| `escape` | small + fast = escape | 80 (% importance) | 1.5 | adds | R14. |
| `engage` | small + fast = dive | 60 (% importance) | 1.3 | adds | R11. |
| `bullet_evasion` | small hitbox ≈ effective evasion | 25 (eff %) | 1.5 | adds | R26 partial. |
| `counter_importance` | counter to AoE focus / large-hitbox targeting | 50 (% importance) | 1.0 | adds | R13. |
| `farmer` | huge MS = farm | 50 (% importance) | 1.0 | adds | R28. |


---

## Unstable Concoction
- **normalized_name**: `unstable_concoction` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_unstable_concoction`
- **wiki**: https://deadlock.wiki/Unstable_Concoction

### Interpretation
Street Brawl suicide-bomber ult: Active (25s CD): become Unstoppable + +10m MS + +3000 HP + +150% WD + +150 SP for 4s, then die exploding for 30% max HP dmg + 3s stun in 22m. Reduces respawn by 50%. Per Notes: Cheat Death/Bloodletting can save you from suicide.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Health Damage | 30% | Active (explosion at end) |
| Stun Duration | 3s | Active (explosion) |
| Move Speed Conditional | +10m | Active (4s) |
| Bonus Health Conditional | +3000 | Active (4s) |
| Weapon Damage | +150% | Active (4s) |
| Spirit Power | +150 | Active (4s) |
| Radius | 22m | Active (explosion) |
| Duration | 4s | Active |
| Cooldown | 25s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 30% max HP explosion × ~3 enemies | 200 (eff dmg) | 1.5 | adds | ⚖️ SB pure-damage anchor. |
| `stun` | 3s × ~3 enemies × (3/25 CD) | 1.1 (eff s) | 1.5 | adds | ⚖️ SB stun anchor — biggest AoE stun. |
| `aoe_cluster` | 22m explosion | 95 (% importance) | 1.5 | adds | ⚖️ Largest AoE. |
| `engage` | Unstoppable charge-bomb | 95 (% importance) | 1.5 | adds | ⚖️ SB engage anchor. |
| `cc_resist` | 4s Unstoppable | 50 (eff %) | 1.5 | adds | Pre-explosion immunity. |
| `bullet_damage` | +150% WD × 4s × (4/25) | 35 (eff gun-dmg %) | 0.6 | adds | Burst window WD. |
| `spirit_damage` | +150 SP × (4/25) | 30 (SP-equiv) | 0.5 | adds | Burst window SP. |
| `gun_burst_damage` | +150% WD in 4s burst window | 220 (raw dmg within 1s) | 1.5 | adds | R2: heavy burst. |
| `spirit_burst_damage` | +150 SP burst | 180 (raw dmg within 1s) | 1.5 | adds | R2: heavy spirit burst. |
| `horizontal_mobility` | +10m × (4/25) | 1.6 (m/s eff) | 0.7 | adds | Pre-suicide rush MS. |
| `high_max_hp` | +3000 HP for 4s | 600 (HP) | 1.5 | adds | Massive temporary HP. |
| `damage_sponge` | Unstoppable + 3000 HP | 70 (% importance) | 1.5 | adds | R26. |
| `counter_importance` | comeback / team wipe tool | 75 (% importance) | 1.5 | adds | R13. |
| `scaling_late` | -50% respawn = revive faster | 45 (% importance) | 1.1 | adds | Comeback. |
| `single_ability_focus` | one active does everything | 65 (% importance) | 1.5 | adds | R17. |


---

# Audit: AI Normalized vs. existing JSON playstyle_score (Round 10)

**Generated by `_run_audit.py`** from the hand-authored `### Calculator tags` tables in this file vs each item's `data/items/<key>.json`. SUGGESTIONS ONLY — no JSON is modified.

**Blending convention** (Round 10+): Single Normalized per (item, tag) authored by `_normalize.py` from `(adds + 0.5 × relies)` BEFORE normalization. The audit reads it directly — no further blending.

**Filtering**: a row appears only where |Diff| ≥ 0.15 OR one side is missing.

**Apply? column** (see Mass Item AI Audit Skill/04_audit_pipeline.md): `[x]` = apply the AI blended value · `[ ]` = skip · a **number** (e.g. `0.8`) = force that exact value. Defaults: `[x]` for Bump/Cut/Add with |diff| ≤ 0.6; `[ ]` for Drops and for |diff| > 0.6.

## T1 (800 souls)

### Extended Magazine (`extended_magazine`, T1 Weapon)
Path: `data/items/extended_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `farmer` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Rapid Rounds (`rapid_rounds`, T1 Weapon)
Path: `data/items/rapid_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.00 | (drop) | +-0.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.90 | 1.30 | +0.40 | Bump JSON → 1.30 | `[x]` |
| `gun_continuous_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Close Quarters (`close_quarters`, T1 Weapon)
Path: `data/items/close_quarters.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.12 | 1.50 | +0.38 | Bump JSON → 1.50 | `[x]` |
| `close_range` | 1.60 | 1.90 | +0.30 | Bump JSON → 1.90 | `[1.5]` |
| `engage` | 0.80 | 1.30 | +0.50 | Bump JSON → 1.30 | `[x]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | 1.60 | +1.20 | Bump JSON → 1.60 | `[1]` |
| `gun_burst_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `long_range` | -1.00 | -0.60 | +0.40 | Bump JSON → -0.60 | `[x]` |
| `melee_damage` | 0.75 | 0.90 | +0.15 | Bump JSON → 0.90 | `[x]` |
| `melee_resistance` | 1.20 | 1.70 | +0.50 | Bump JSON → 1.70 | `[1.5]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Headshot Booster (`headshot_booster`, T1 Weapon)
Path: `data/items/headshot_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[ ]` |
| `burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 1.30 | 1.50 | +0.20 | Bump JSON → 1.50 | `[x]` |
| `gun_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 1.60 | 2.00 | +0.40 | Bump JSON → 2.00 | `[x]` |
| `mid_range` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[1.5]` |
| `scaling_early` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1.5]` |

### High-Velocity Rounds (`high_velocity_rounds`, T1 Weapon)
Path: `data/items/high_velocity_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00 | `[x]` |
| `mid_range` | 0.66 | 1.30 | +0.64 | Bump JSON → 1.30 | `[1]` |
| `single_target` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.5]` |

### Monster Rounds (`monster_rounds`, T1 Weapon)
Path: `data/items/monster_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.00 | 0.30 | +0.30 | Bump JSON → 0.30 | `[x]` |
| `continous_heal` | 0.20 | 0.00 | -0.20 | Cut JSON → 0.00 | `[x]` |
| `farmer` | 2.00 | 1.60 | -0.40 | Cut JSON → 1.60 | `[1.5]` |
| `gun_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `gun_continuous_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `lane_pusher` | 1.80 | (drop) | -1.80 | Drop row (AI does not mark this tag) | `[ ]` |

### Restorative Shot (`restorative_shot`, T1 Weapon)
Path: `data/items/restorative_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `bullet_lifesteal` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[.66]` |
| `continous_heal` | 0.80 | 0.20 | -0.60 | Cut JSON → 0.20 | `[.4]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | 0.80 | +0.50 | Bump JSON → 0.80 | `[x]` |
| `gun_burst_proc` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[.8]` |
| `gun_continuous_proc` | 0.66 | 0.20 | -0.46 | Cut JSON → 0.20 | `[x]` |
| `scaling_early` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Extra Health (`extra_health`, T1 Vitality)
Path: `data/items/extra_health.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `damage_sponge` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[ ]` |

### Extra Regen (`extra_regen`, T1 Vitality)
Path: `data/items/extra_regen.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `continous_heal` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[1]` |
| `farmer` | 0.30 | 0.60 | +0.30 | Bump JSON → 0.60 | `[x]` |
| `self_heal` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[1]` |

### Extra Stamina (`extra_stamina`, T1 Vitality)
Path: `data/items/extra_stamina.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.60 | 0.90 | +0.30 | Bump JSON → 0.90 | `[x]` |
| `engage` | 0.80 | 1.10 | +0.30 | Bump JSON → 1.10 | `[x]` |
| `escape` | 1.20 | 1.00 | -0.20 | Cut JSON → 1.00 | `[x]` |
| `farmer` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `small_hitbox` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[.5]` |
| `vertical_mobility` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |

### Grit (`grit`, T1 Vitality)
Path: `data/items/grit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_resistance` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00 | `[x]` |
| `continous_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[x]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `damage_sponge` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `farmer` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[x]` |
| `self_heal` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `shield` | 0.85 | 0.50 | -0.35 | Cut JSON → 0.50 | `[.66]` |

### Healing Rite (`healing_rite`, T1 Vitality)
Path: `data/items/healing_rite.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.70 | 1.60 | +0.90 | Bump JSON → 1.60 | `[1.5]` |
| `continous_heal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `horizontal_mobility` | 0.30 | 1.50 | +1.20 | Bump JSON → 1.50 | `[.66]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[ ]` |
| `spirit_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |

### Melee Lifesteal (`melee_lifesteal`, T1 Vitality)
Path: `data/items/melee_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.75 | 1.40 | +0.65 | Bump JSON → 1.40 | `[1]` |
| `close_range` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `grounded` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[ ]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -0.50 | -0.90 | -0.40 | Cut JSON → -0.90 | `[x]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Rebuttal (`rebuttal`, T1 Vitality)
Path: `data/items/rebuttal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_resistance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `burst_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.90 | (drop) | -0.90 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[.45]` |
| `grounded` | 0.40 | 1.20 | +0.80 | Bump JSON → 1.20 | `[x]` |
| `high_max_hp` | 0.70 | 0.90 | +0.20 | Bump JSON → 0.90 | `[x]` |
| `long_range` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 1.40 | 2.00 | +0.60 | Bump JSON → 2.00 | `[x]` |
| `self_buff` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |

### Sprint Boots (`sprint_boots`, T1 Vitality)
Path: `data/items/sprint_boots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[ ]` |
| `continous_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `engage` | 0.60 | 0.80 | +0.20 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `small_hitbox` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |

### Extra Charge (`extra_charge`, T1 Spirit)
Path: `data/items/extra_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[.5]` |
| `charge_dependant` | 1.88 | 1.50 | -0.38 | Cut JSON → 1.50 | `[x]` |
| `cooldown_reduction` | 0.30 | 1.10 | +0.80 | Bump JSON → 1.10 | `[.5]` |
| `farmer` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `multi_ability_focus` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Extra Spirit (`extra_spirit`, T1 Spirit)
Path: `data/items/extra_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `multi_ability_focus` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[x]` |
| `single_ability_focus` | 0.20 | -0.50 | -0.70 | Cut JSON → -0.50 | `[ ]` |
| `spirit_burst_damage` | 0.60 | 0.10 | -0.50 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_damage` | 0.60 | 0.10 | -0.50 | Cut JSON → 0.10 | `[x]` |
| `spirit_damage` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Golden Goose Egg (`golden_goose_egg`, T1 Spirit)
Path: `data/items/golden_goose_egg.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | 0.00 | 1.60 | +1.60 | Bump JSON → 1.60 | `[ ]` |
| `fire_rate` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.70 | 2.00 | +0.30 | Bump JSON → 2.00 | `[x]` |
| `self_heal` | 0.20 | 0.00 | -0.20 | Cut JSON → 0.00 | `[x]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Burst (`mystic_burst`, T1 Spirit)
Path: `data/items/mystic_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `burst_damage` | 0.12 | (drop) | -0.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `multi_ability_focus` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `scaling_early` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[1]` |
| `single_ability_focus` | 0.62 | (drop) | -0.62 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.25 | 0.60 | -0.65 | Cut JSON → 0.60 | `[1]` |
| `spirit_burst_proc` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `spirit_proc` | 1.30 | (drop) | -1.30 | Drop row (AI does not mark this tag) | `[.7]` |

### Mystic Expansion (`mystic_expansion`, T1 Spirit)
Path: `data/items/mystic_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 1.20 | 2.00 | +0.80 | Bump JSON → 2.00 | `[ ]` |
| `single_ability_focus` | 1.40 | 1.90 | +0.50 | Bump JSON → 1.90 | `[1.5]` |

### Mystic Regeneration (`mystic_regeneration`, T1 Spirit)
Path: `data/items/mystic_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `continous_heal` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[.45]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `self_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Rusted Barrel (`rusted_barrel`, T1 Spirit)
Path: `data/items/rusted_barrel.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.60 | 1.00 | -0.60 | Cut JSON → 1.00 | `[x]` |
| `debuff` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `disarm` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[x]` |
| `horizontal_mobility` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `mid_range` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `single_target` | 1.30 | 1.80 | +0.50 | Bump JSON → 1.80 | `[ ]` |

### Spirit Strike (`spirit_strike`, T1 Spirit)
Path: `data/items/spirit_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.80 | 1.10 | +0.30 | Bump JSON → 1.10 | `[x]` |
| `grounded` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[1.5]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.30 | 0.70 | -0.60 | Cut JSON → 0.70 | `[1]` |
| `mid_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.40 | 1.60 | +1.20 | Bump JSON → 1.60 | `[.7]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.66 | 0.90 | +0.24 | Bump JSON → 0.90 | `[x]` |

## T2 (1600 souls)

### Active Reload (`active_reload`, T2 Weapon)
Path: `data/items/active_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `bullet_lifesteal` | 1.40 | 1.20 | -0.20 | Cut JSON → 1.20 | `[x]` |
| `burst_heal` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `continous_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.60 | 0.40 | -0.20 | Cut JSON → 0.40 | `[x]` |
| `gun_continuous_damage` | 0.45 | 0.20 | -0.25 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 1.10 | 0.60 | -0.50 | Cut JSON → 0.60 | `[.8]` |
| `self_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Fleetfoot (`fleetfoot`, T2 Weapon)
Path: `data/items/fleetfoot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[ ]` |
| `farmer` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | 0.10 | -0.23 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |

### Intensifying Magazine (`intensifying_magazine`, T2 Weapon)
Path: `data/items/intensifying_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[x]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 2.00 | 0.60 | -1.40 | Cut JSON → 0.60 | `[ ]` |
| `gun_continuous_proc` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.85 | 0.40 | -0.45 | Cut JSON → 0.40 | `[.5]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Kinetic Dash (`kinetic_dash`, T2 Weapon)
Path: `data/items/kinetic_dash.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.70 | 0.90 | +0.20 | Bump JSON → 0.90 | `[x]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.80 | 1.30 | +0.50 | Bump JSON → 1.30 | `[x]` |
| `escape` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `farmer` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |

### Long Range (`long_range`, T2 Weapon)
Path: `data/items/long_range.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.90 | (drop) | -0.90 | Drop row (AI does not mark this tag) | `[.45]` |
| `anti_air` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.00 | 1.70 | +0.70 | Bump JSON → 1.70 | `[1.25]` |
| `close_range` | -0.25 | -0.60 | -0.35 | Cut JSON → -0.60 | `[-.4]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 2.00 | 1.60 | -0.40 | Cut JSON → 1.60 | `[x]` |
| `melee_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.5]` |

### Melee Charge (`melee_charge`, T2 Weapon)
Path: `data/items/melee_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.60 | 1.80 | +0.20 | Bump JSON → 1.80 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.66 | 1.40 | +0.74 | Bump JSON → 1.40 | `[1]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `gun_burst_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | -0.90 | -0.65 | Cut JSON → -0.90 | `[ ]` |
| `melee_damage` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[1.5]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Mystic Shot (`mystic_shot`, T2 Weapon)
Path: `data/items/mystic_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `bullet_evasion` | (null) | -0.70 | -0.70 | Add row, set -0.70 | `[ ]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1.5]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `scaling_late` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.80 | 2.00 | +1.20 | Bump JSON → 2.00 | `[1.5]` |
| `spirit_burst_proc` | 0.66 | 1.60 | +0.94 | Bump JSON → 1.60 | `[ ]` |
| `spirit_continuous_damage` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `spirit_continuous_proc` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |

### Opening Rounds (`opening_rounds`, T2 Weapon)
Path: `data/items/opening_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.90 | 1.10 | +0.20 | Bump JSON → 1.10 | `[x]` |
| `engage` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `headshot_damage` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `hybrid_damage_usage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.80 | 1.10 | +0.30 | Bump JSON → 1.10 | `[ ]` |
| `mid_range` | 0.30 | 1.30 | +1.00 | Bump JSON → 1.30 | `[.5]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[.5]` |
| `self_buff` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `spirit_damage` | 0.33 | 0.10 | -0.23 | Cut JSON → 0.10 | `[x]` |

### Recharging Rush (`recharging_rush`, T2 Weapon)
Path: `data/items/recharging_rush.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[ ]` |
| `bullet_damage` | 0.75 | 0.60 | -0.15 | Cut JSON → 0.60 | `[x]` |
| `charge_dependant` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[1.25]` |
| `cooldown_reduction` | 0.40 | 1.10 | +0.70 | Bump JSON → 1.10 | `[.66]` |
| `gun_burst_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `gun_burst_proc` | 0.80 | 1.20 | +0.40 | Bump JSON → 1.20 | `[x]` |
| `gun_continuous_proc` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `magazine_size_dependant` | 0.60 | 0.40 | -0.20 | Cut JSON → 0.40 | `[x]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Slowing Bullets (`slowing_bullets`, T2 Weapon)
Path: `data/items/slowing_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | 0.90 | +0.45 | Bump JSON → 0.90 | `[ ]` |
| `debuff` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[.45]` |
| `farmer` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `gun_continuous_proc` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `melee_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |

### Spirit Shredder Bullets (`spirit_shredder_bullets`, T2 Weapon)
Path: `data/items/spirit_shredder_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `bullet_proc` | 1.30 | (drop) | -1.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.07 | (drop) | -0.07 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_proc` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | 1.40 | (drop) | -1.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.20 | 0.80 | -0.40 | Cut JSON → 0.80 | `[x]` |

### Split Shot (`split_shot`, T2 Weapon)
Path: `data/items/split_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `bullet_damage` | 0.93 | 0.70 | -0.23 | Cut JSON → 0.70 | `[x]` |
| `bullet_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.50 | 0.50 | -1.00 | Cut JSON → 0.50 | `[1]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.90 | 0.30 | -0.60 | Cut JSON → 0.30 | `[x]` |
| `headshot_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Stalker (`stalker`, T2 Weapon)
Path: `data/items/stalker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.40 | 0.70 | +0.30 | Bump JSON → 0.70 | `[x]` |
| `away_from_team` | 1.60 | 2.00 | +0.40 | Bump JSON → 2.00 | `[ ]` |
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.90 | 0.70 | -0.20 | Cut JSON → 0.70 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.15 | 1.40 | +0.25 | Bump JSON → 1.40 | `[x]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `hybrid_damage_usage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | (null) | 1.70 | +1.70 | Add row, set 1.70 | `[1]` |
| `small_hitbox` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `spirit_continuous_proc` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[x]` |
| `spirit_damage` | 0.60 | 0.40 | -0.20 | Cut JSON → 0.40 | `[x]` |

### Swift Striker (`swift_striker`, T2 Weapon)
Path: `data/items/swift_striker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | 1.10 | +0.85 | Bump JSON → 1.10 | `[.66]` |
| `farmer` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `fire_rate` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[x]` |
| `gun_burst_damage` | 0.40 | 0.70 | +0.30 | Bump JSON → 0.70 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Titanic Magazine (`titanic_magazine`, T2 Weapon)
Path: `data/items/titanic_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.90 | (drop) | -0.90 | Drop row (AI does not mark this tag) | `[ ]` |

### Weakening Headshot (`weakening_headshot`, T2 Weapon)
Path: `data/items/weakening_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `gun_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.60 | 1.10 | +0.50 | Bump JSON → 1.10 | `[1]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |

### Battle Vest (`battle_vest`, T2 Vitality)
Path: `data/items/battle_vest.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.60 | 0.30 | -0.30 | Cut JSON → 0.30 | `[x]` |
| `burst_heal` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[ ]` |
| `continous_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.35 | 0.10 | -0.25 | Cut JSON → 0.10 | `[x]` |
| `melee_resistance` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `self_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |

### Bullet Lifesteal (`bullet_lifesteal`, T2 Vitality)
Path: `data/items/bullet_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 1.70 | 2.00 | +0.30 | Bump JSON → 2.00 | `[x]` |
| `burst_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `continous_heal` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[.7]` |
| `damage_sponge` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.60 | 0.80 | +0.20 | Bump JSON → 0.80 | `[x]` |
| `spirit_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Debuff Reducer (`debuff_reducer`, T2 Vitality)
Path: `data/items/debuff_reducer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | 0.80 | 1.20 | +0.40 | Bump JSON → 1.20 | `[x]` |
| `counter_importance` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `debuff_resistance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[x]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Enchanters Emblem (`enchanters_emblem`, T2 Vitality)
Path: `data/items/enchanters_emblem.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `continous_heal` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `multi_ability_focus` | 0.40 | 1.40 | +1.00 | Bump JSON → 1.40 | `[.75]` |
| `self_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_damage` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_resistance` | 1.40 | (drop) | -1.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `spirit_resistance` | 1.20 | 1.40 | +0.20 | Bump JSON → 1.40 | `[x]` |

### Enduring Speed (`enduring_speed`, T2 Vitality)
Path: `data/items/enduring_speed.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `cc_resist` | 0.66 | 1.70 | +1.04 | Bump JSON → 1.70 | `[1]` |
| `continous_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `counter_importance` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80 | `[.45]` |
| `engage` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `self_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `small_hitbox` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Guardian Ward (`guardian_ward`, T2 Vitality)
Path: `data/items/guardian_ward.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[1.5]` |
| `burst_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[x]` |
| `continous_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00 | `[.66]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[.75]` |
| `team_heal` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[.75]` |

### Healbane (`healbane`, T2 Vitality)
Path: `data/items/healbane.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `burst_heal` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_lifesteal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Booster (`healing_booster`, T2 Vitality)
Path: `data/items/healing_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `bullet_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | 0.00 | -0.50 | Cut JSON → 0.00 | `[x]` |
| `continous_heal` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `farmer` | 0.30 | 0.60 | +0.30 | Bump JSON → 0.60 | `[x]` |
| `spirit_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[ ]` |

### Reactive Barrier (`reactive_barrier`, T2 Vitality)
Path: `data/items/reactive_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `damage_sponge` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |

### Restorative Locket (`restorative_locket`, T2 Vitality)
Path: `data/items/restorative_locket.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.20 | 1.00 | -0.20 | Cut JSON → 1.00 | `[x]` |
| `damage_sponge` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.15 | 0.50 | +0.65 | Bump JSON → 0.50 | `[ ]` |
| `horizontal_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Return Fire (`return_fire`, T2 Vitality)
Path: `data/items/return_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `bullet_resistance` | 0.70 | 1.70 | +1.00 | Bump JSON → 1.70 | `[ ]` |
| `burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `disarm` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | 0.10 | -0.23 | Cut JSON → 0.10 | `[x]` |
| `long_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `mid_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |

### Spirit Lifesteal (`spirit_lifesteal`, T2 Vitality)
Path: `data/items/spirit_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `continous_heal` | 0.60 | 0.30 | -0.30 | Cut JSON → 0.30 | `[x]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.65 | 0.80 | +0.15 | Bump JSON → 0.80 | `[x]` |
| `self_heal` | 0.80 | 0.50 | -0.30 | Cut JSON → 0.50 | `[x]` |
| `spirit_burst_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_lifesteal` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00 | `[x]` |

### Spirit Shielding (`spirit_shielding`, T2 Vitality)
Path: `data/items/spirit_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `damage_sponge` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.10 | (drop) | -1.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `shield` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_burst_resistance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_continuous_resistance` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[1]` |
| `spirit_resistance` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Weapon Shielding (`weapon_shielding`, T2 Vitality)
Path: `data/items/weapon_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `damage_sponge` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 1.70 | +0.95 | Bump JSON → 1.70 | `[1]` |
| `horizontal_mobility` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `self_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `shield` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Arcane Surge (`arcane_surge`, T2 Spirit)
Path: `data/items/arcane_surge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[ ]` |
| `aerial` | 0.60 | 0.90 | +0.30 | Bump JSON → 0.90 | `[x]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | 1.20 | +0.45 | Bump JSON → 1.20 | `[x]` |
| `escape` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `single_ability_focus` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | 0.10 | -0.90 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.90 | 0.50 | -0.40 | Cut JSON → 0.50 | `[x]` |
| `vertical_mobility` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |

### Bullet Resist Shredder (`bullet_resist_shredder`, T2 Spirit)
Path: `data/items/bullet_resist_shredder.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.45 | 1.20 | +0.75 | Bump JSON → 1.20 | `[x]` |
| `bullet_resist_shred` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[.45]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `high_max_hp` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Cold Front (`cold_front`, T2 Spirit)
Path: `data/items/cold_front.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `assist_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `debuff` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[1.5]` |
| `spirit_burst_damage` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[ ]` |
| `spirit_burst_proc` | 0.10 | 2.00 | +1.90 | Bump JSON → 2.00 | `[1]` |
| `spirit_damage` | 0.45 | 1.10 | +0.65 | Bump JSON → 1.10 | `[1]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Compress Cooldown (`compress_cooldown`, T2 Spirit)
Path: `data/items/compress_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `charge_dependant` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 1.25 | 1.60 | +0.35 | Bump JSON → 1.60 | `[ ]` |
| `single_ability_focus` | 1.00 | -0.50 | -1.50 | Cut JSON → -0.50 | `[ ]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |

### Duration Extender (`duration_extender`, T2 Spirit)
Path: `data/items/duration_extender.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 1.40 | 1.60 | +0.20 | Bump JSON → 1.60 | `[0]` |
| `single_ability_focus` | 1.00 | -0.50 | -1.50 | Cut JSON → -0.50 | `[ ]` |
| `spirit_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Improved Spirit (`improved_spirit`, T2 Spirit)
Path: `data/items/improved_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `charge_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.20 | 0.00 | -0.20 | Cut JSON → 0.00 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[1.5]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | 0.00 | -0.15 | Cut JSON → 0.00 | `[x]` |
| `single_ability_focus` | 0.20 | -0.50 | -0.70 | Cut JSON → -0.50 | `[ ]` |
| `spirit_burst_damage` | 0.60 | 0.10 | -0.50 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_damage` | 0.60 | 0.10 | -0.50 | Cut JSON → 0.10 | `[x]` |
| `spirit_damage` | 1.10 | 0.80 | -0.30 | Cut JSON → 0.80 | `[ ]` |
| `spirit_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Slow (`mystic_slow`, T2 Spirit)
Path: `data/items/mystic_slow.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `debuff` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[ ]` |
| `spirit_continuous_proc` | 1.15 | 0.90 | -0.25 | Cut JSON → 0.90 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00 | `[ ]` |

### Mystic Vulnerability (`mystic_vulnerability`, T2 Spirit)
Path: `data/items/mystic_vulnerability.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | 0.80 | +0.35 | Bump JSON → 0.80 | `[.45]` |
| `debuff` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.20 | 0.80 | -0.40 | Cut JSON → 0.80 | `[x]` |
| `spirit_resistance` | 0.44 | 0.60 | +0.16 | Bump JSON → 0.60 | `[x]` |

### Quicksilver Reload (`quicksilver_reload`, T2 Spirit)
Path: `data/items/quicksilver_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `bullet_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `single_ability_focus` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |

### Slowing Hex (`slowing_hex`, T2 Spirit)
Path: `data/items/slowing_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `displace` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `mid_range` | 0.15 | 1.60 | +1.45 | Bump JSON → 1.60 | `[ ]` |
| `movement_slow` | 1.30 | 0.20 | -1.10 | Cut JSON → 0.20 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[1.5]` |
| `stun` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.10 | 2.00 | +1.90 | Bump JSON → 2.00 | `[ ]` |

### Spirit Sap (`spirit_sap`, T2 Spirit)
Path: `data/items/spirit_sap.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.10 | 0.80 | +0.70 | Bump JSON → 0.80 | `[ ]` |
| `mid_range` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.30 | 1.70 | +0.40 | Bump JSON → 1.70 | `[1.5]` |
| `spirit_burst_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.40 | 0.50 | -0.90 | Cut JSON → 0.50 | `[.75]` |

### Suppressor (`suppressor`, T2 Spirit)
Path: `data/items/suppressor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.60 | 1.10 | +0.50 | Bump JSON → 1.10 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 1.10 | -0.20 | Cut JSON → 1.10 | `[x]` |
| `debuff` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 1.30 | 1.90 | +0.60 | Bump JSON → 1.90 | `[1.5]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

## T3 (3200 souls)

### Alchemical Fire (`alchemical_fire`, T3 Weapon)
Path: `data/items/alchemical_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.75 | 1.80 | +1.05 | Bump JSON → 1.80 | `[1]` |
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 0.90 | +0.80 | Bump JSON → 0.90 | `[.45]` |
| `dot` | 0.80 | 1.70 | +0.90 | Bump JSON → 1.70 | `[1]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.20 | 1.40 | +0.20 | Bump JSON → 1.40 | `[1]` |
| `spirit_continuous_proc` | 0.20 | 0.80 | +0.60 | Bump JSON → 0.80 | `[x]` |
| `spirit_damage` | 0.82 | 1.30 | +0.48 | Bump JSON → 1.30 | `[.9]` |
| `stun` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Ballistic Enchantment (`ballistic_enchantment`, T3 Weapon)
Path: `data/items/ballistic_enchantment.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `gun_continuous_damage` | 0.70 | 0.20 | -0.50 | Cut JSON → 0.20 | `[.5]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `single_ability_focus` | 0.33 | 2.00 | +1.67 | Bump JSON → 2.00 | `[1]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Berserker (`berserker`, T3 Weapon)
Path: `data/items/berserker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.40 | 1.20 | -0.20 | Cut JSON → 1.20 | `[x]` |
| `close_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `gun_burst_proc` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[.3]` |
| `gun_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[.66]` |
| `gun_continuous_proc` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `gun_continuous_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.15 | 1.10 | +1.25 | Bump JSON → 1.10 | `[ ]` |
| `melee_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.70 | (drop) | -1.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Blood Tribute (`blood_tribute`, T3 Weapon)
Path: `data/items/blood_tribute.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | 0.60 | 1.50 | +0.90 | Bump JSON → 1.50 | `[ ]` |
| `continous_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `debuff_resistance` | 0.40 | 1.70 | +1.30 | Bump JSON → 1.70 | `[.5]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.10 | 1.70 | +0.60 | Bump JSON → 1.70 | `[1.25]` |
| `gun_burst_damage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_damage` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.66 | 0.90 | +0.24 | Bump JSON → 0.90 | `[.75]` |
| `self_heal` | 0.75 | 0.10 | -0.65 | Cut JSON → 0.10 | `[.5]` |

### Burst Fire (`burst_fire`, T3 Weapon)
Path: `data/items/burst_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `fire_rate` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.90 | 0.10 | -0.80 | Cut JSON → 0.10 | `[.66]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Cultist Sacrifice (`cultist_sacrifice`, T3 Weapon)
Path: `data/items/cultist_sacrifice.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.45 | 1.10 | +0.65 | Bump JSON → 1.10 | `[.75]` |
| `continous_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `farmer` | 1.80 | 2.00 | +0.20 | Bump JSON → 2.00 | `[x]` |
| `high_kill_count` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `high_max_hp` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.80 | 0.40 | -0.40 | Cut JSON → 0.40 | `[x]` |
| `scaling_early` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[1]` |
| `self_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `spirit_damage` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |

### Escalating Resilience (`escalating_resilience`, T3 Weapon)
Path: `data/items/escalating_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.10 | (drop) | -1.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[.25]` |
| `gun_burst_resistance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |

### Express Shot (`express_shot`, T3 Weapon)
Path: `data/items/express_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.60 | 1.80 | +1.20 | Bump JSON → 1.80 | `[1.5]` |
| `gun_continuous_damage` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.40 | 1.30 | +0.90 | Bump JSON → 1.30 | `[1]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.70 | 1.80 | +1.10 | Bump JSON → 1.80 | `[1]` |

### Headhunter (`headhunter`, T3 Weapon)
Path: `data/items/headhunter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `bullet_lifesteal` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.60 | 0.10 | -0.50 | Cut JSON → 0.10 | `[x]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.60 | 1.50 | +0.90 | Bump JSON → 1.50 | `[x]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 1.75 | 1.30 | -0.45 | Cut JSON → 1.30 | `[1.5]` |
| `high_max_hp` | 0.45 | 0.20 | -0.25 | Cut JSON → 0.20 | `[x]` |
| `self_heal` | 0.80 | 0.30 | -0.50 | Cut JSON → 0.30 | `[x]` |
| `single_target` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[1.5]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Heroic Aura (`heroic_aura`, T3 Weapon)
Path: `data/items/heroic_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `assist_importance` | 1.20 | 1.40 | +0.20 | Bump JSON → 1.40 | `[x]` |
| `away_from_team` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | 1.10 | +0.77 | Bump JSON → 1.10 | `[.5]` |
| `escape` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.66 | 0.90 | +0.24 | Bump JSON → 0.90 | `[x]` |
| `gun_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[1]` |
| `lane_pusher` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `range_extender_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spawn_minions` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Hollow Point (`hollow_point`, T3 Weapon)
Path: `data/items/hollow_point.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.30 | 1.10 | -0.20 | Cut JSON → 1.10 | `[x]` |
| `bullet_resist_shred` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `continous_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.65 | 0.20 | -0.45 | Cut JSON → 0.20 | `[x]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `high_max_hp` | 1.32 | 0.50 | -0.82 | Cut JSON → 0.50 | `[x]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.66 | 0.10 | -0.56 | Cut JSON → 0.10 | `[x]` |

### Hunters Aura (`hunters_aura`, T3 Weapon)
Path: `data/items/hunters_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `ally_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[.33]` |
| `aoe_cluster` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[.33]` |
| `bullet_resist_shred` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[1.5]` |
| `bullet_resistance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `counter_importance` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[1.15]` |
| `gun_continuous_resistance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `horizontal_mobility` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Point Blank (`point_blank`, T3 Weapon)
Path: `data/items/point_blank.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | 1.60 | +0.85 | Bump JSON → 1.60 | `[1]` |
| `close_range` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[x]` |
| `engage` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[1]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[x]` |
| `gun_burst_damage` | 0.65 | 0.40 | -0.25 | Cut JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.25 | -0.90 | +0.35 | Bump JSON → -0.90 | `[x]` |
| `melee_damage` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[x]` |
| `melee_resistance` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Shadow Weave (`shadow_weave`, T3 Weapon)
Path: `data/items/shadow_weave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[.33]` |
| `engage` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[x]` |
| `farmer` | 0.40 | 1.00 | +0.60 | Bump JSON → 1.00 | `[.75]` |
| `gun_continuous_damage` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `horizontal_mobility` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00 | `[ ]` |
| `hybrid_damage_usage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `self_buff` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[1.15]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[x]` |
| `small_hitbox` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Sharpshooter (`sharpshooter`, T3 Weapon)
Path: `data/items/sharpshooter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | 1.80 | +1.05 | Bump JSON → 1.80 | `[1]` |
| `close_range` | -1.00 | -0.80 | +0.20 | Bump JSON → -0.80 | `[x]` |
| `gun_burst_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `headshot_damage` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `horizontal_mobility` | -0.15 | 0.00 | +0.15 | Bump JSON → 0.00 | `[x]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[1]` |
| `spirit_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Rend (`spirit_rend`, T3 Weapon)
Path: `data/items/spirit_rend.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[1]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[1]` |
| `gun_continuous_proc` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[1.5]` |
| `hybrid_damage_usage` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[1.5]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |

### Tesla Bullets (`tesla_bullets`, T3 Weapon)
Path: `data/items/tesla_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `fire_rate` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_continuous_damage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_proc` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |

### Toxic Bullets (`toxic_bullets`, T3 Weapon)
Path: `data/items/toxic_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[x]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `dot` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[1]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `gun_continuous_proc` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Weighted Shots (`weighted_shots`, T3 Weapon)
Path: `data/items/weighted_shots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `debuff` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `gun_burst_damage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | -0.15 | -0.30 | -0.15 | Cut JSON → -0.30 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | -0.15 | 0.00 | +0.15 | Bump JSON → 0.00 | `[x]` |

### Bullet Resilience (`bullet_resilience`, T3 Vitality)
Path: `data/items/bullet_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | 0.00 | -0.40 | Cut JSON → 0.00 | `[x]` |
| `counter_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[.66]` |
| `gun_continuous_resistance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `self_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |

### Counterspell (`counterspell`, T3 Vitality)
Path: `data/items/counterspell.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_evasion` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[ ]` |
| `burst_heal` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `spirit_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.15 | 1.80 | +0.65 | Bump JSON → 1.80 | `[1.5]` |
| `spirit_continuous_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[x]` |
| `spirit_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Dispel Magic (`dispel_magic`, T3 Vitality)
Path: `data/items/dispel_magic.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.25 | 1.90 | +0.65 | Bump JSON → 1.90 | `[x]` |
| `horizontal_mobility` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |

### Fortitude (`fortitude`, T3 Vitality)
Path: `data/items/fortitude.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.10 | +0.10 | Add row, set 0.10 | `[x]` |
| `counter_importance` | 0.01 | (drop) | -0.01 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 2.00 | 1.70 | -0.30 | Cut JSON → 1.70 | `[ ]` |
| `horizontal_mobility` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `self_heal` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Fury Trance (`fury_trance`, T3 Vitality)
Path: `data/items/fury_trance.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `aerial` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `burst_heal` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `continous_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.35 | 0.10 | -0.25 | Cut JSON → 0.10 | `[x]` |
| `high_max_hp` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `horizontal_mobility` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.70 | 0.40 | -0.30 | Cut JSON → 0.40 | `[x]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `vertical_mobility` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Nova (`healing_nova`, T3 Vitality)
Path: `data/items/healing_nova.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `assist_importance` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[x]` |
| `away_from_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[1]` |
| `team_heal` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |

### Lifestrike (`lifestrike`, T3 Vitality)
Path: `data/items/lifestrike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `close_range` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00 | `[1.5]` |
| `continous_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.70 | +1.70 | Add row, set 1.70 | `[1]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[1]` |
| `long_range` | -0.50 | -1.00 | -0.50 | Cut JSON → -1.00 | `[x]` |
| `melee_damage` | 1.88 | 0.90 | -0.98 | Cut JSON → 0.90 | `[1.25]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Majestic Leap (`majestic_leap`, T3 Vitality)
Path: `data/items/majestic_leap.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[.66]` |
| `aoe_cluster` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[.66]` |
| `cc_resist` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[x]` |
| `escape` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[.33]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[x]` |
| `gun_burst_damage` | 0.01 | (drop) | -0.01 | Drop row (AI does not mark this tag) | `[x]` |
| `horizontal_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[ ]` |
| `shield` | 0.40 | 1.60 | +1.20 | Bump JSON → 1.60 | `[.66]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.00 | 0.30 | -1.70 | Cut JSON → 0.30 | `[1.5]` |

### Metal Skin (`metal_skin`, T3 Vitality)
Path: `data/items/metal_skin.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.45 | 1.90 | +1.45 | Bump JSON → 1.90 | `[1.5]` |
| `burst_resistance` | 0.01 | 2.00 | +1.99 | Bump JSON → 2.00 | `[1]` |
| `continuous_resistance` | 0.02 | (drop) | -0.02 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `damage_sponge` | 1.12 | (drop) | -1.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.15 | 1.80 | +0.65 | Bump JSON → 1.80 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[1.15]` |
| `horizontal_mobility` | -0.15 | -0.30 | -0.15 | Cut JSON → -0.30 | `[x]` |
| `low_max_hp` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[.35]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | -0.25 | -0.10 | +0.15 | Bump JSON → -0.10 | `[x]` |

### Rescue Beam (`rescue_beam`, T3 Vitality)
Path: `data/items/rescue_beam.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[x]` |
| `ally_buff` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.50 | 0.50 | -1.00 | Cut JSON → 0.50 | `[1]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.10 | +0.85 | Bump JSON → 1.10 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[.5]` |
| `self_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.50 | 0.70 | -0.80 | Cut JSON → 0.70 | `[1]` |

### Spirit Resilience (`spirit_resilience`, T3 Vitality)
Path: `data/items/spirit_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | 0.00 | -0.40 | Cut JSON → 0.00 | `[x]` |
| `counter_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_resistance` | 0.80 | 0.40 | -0.40 | Cut JSON → 0.40 | `[x]` |
| `spirit_continuous_resistance` | 0.80 | 2.00 | +1.20 | Bump JSON → 2.00 | `[x]` |
| `spirit_resistance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |

### Stamina Mastery (`stamina_mastery`, T3 Vitality)
Path: `data/items/stamina_mastery.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | 1.40 | +0.65 | Bump JSON → 1.40 | `[x]` |
| `escape` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00 | `[x]` |
| `farmer` | 0.40 | 1.70 | +1.30 | Bump JSON → 1.70 | `[1]` |
| `gun_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[1]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.25 | 0.30 | -1.95 | Cut JSON → 0.30 | `[1.5]` |

### Trophy Collector (`trophy_collector`, T3 Vitality)
Path: `data/items/trophy_collector.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.90 | 0.40 | -0.50 | Cut JSON → 0.40 | `[.75]` |
| `scaling_early` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[1.15]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |

### Veil Walker (`veil_walker`, T3 Vitality)
Path: `data/items/veil_walker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.33 | 1.70 | +1.37 | Bump JSON → 1.70 | `[1.5]` |
| `bullet_evasion` | 0.10 | 1.70 | +1.60 | Bump JSON → 1.70 | `[.33]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 2.00 | 1.70 | -0.30 | Cut JSON → 1.70 | `[x]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[.5]` |
| `small_hitbox` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[1]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `ult_focused` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Warp Stone (`warp_stone`, T3 Vitality)
Path: `data/items/warp_stone.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[.75]` |
| `cc_resist` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20 | `[.45]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[x]` |
| `gun_burst_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.70 | 1.00 | +0.30 | Bump JSON → 1.00 | `[ ]` |
| `long_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Decay (`decay`, T3 Spirit)
Path: `data/items/decay.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[x]` |
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 1.25 | 1.80 | +0.55 | Bump JSON → 1.80 | `[x]` |
| `dot` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[x]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `long_range` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `mid_range` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `pure_damage` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[1.5]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 1.70 | +0.70 | Bump JSON → 1.70 | `[1.5]` |
| `spirit_continuous_proc` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `spirit_damage` | 0.35 | 1.40 | +1.05 | Bump JSON → 1.40 | `[.75]` |
| `spirit_proc` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Disarming Hex (`disarming_hex`, T3 Spirit)
Path: `data/items/disarming_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.60 | 1.20 | +0.60 | Bump JSON → 1.20 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.66 | 0.20 | -0.46 | Cut JSON → 0.20 | `[ ]` |
| `gun_continuous_resistance` | 0.95 | 0.70 | -0.25 | Cut JSON → 0.70 | `[ ]` |
| `horizontal_mobility` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[.25]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Greater Expansion (`greater_expansion`, T3 Spirit)
Path: `data/items/greater_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.70 | +1.20 | Bump JSON → 1.70 | `[1.5]` |
| `range_extender_dependant` | 2.25 | 1.30 | -0.95 | Cut JSON → 1.30 | `[2]` |
| `single_ability_focus` | 0.33 | -0.50 | -0.83 | Cut JSON → -0.50 | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Knockdown (`knockdown`, T3 Spirit)
Path: `data/items/knockdown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 0.90 | +0.15 | Bump JSON → 0.90 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.5]` |
| `interrupt` | 0.70 | 1.60 | +0.90 | Bump JSON → 1.60 | `[ ]` |
| `long_range` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `mid_range` | 0.10 | 1.30 | +1.20 | Bump JSON → 1.30 | `[.5]` |
| `movement_slow` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[x]` |
| `stun` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00 | `[x]` |

### Radiant Regeneration (`radiant_regeneration`, T3 Spirit)
Path: `data/items/radiant_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `continous_heal` | 1.00 | 0.10 | -0.90 | Cut JSON → 0.10 | `[.5]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.72 | 0.40 | -0.32 | Cut JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 0.45 | 0.30 | -0.15 | Cut JSON → 0.30 | `[x]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.20 | 0.40 | -0.80 | Cut JSON → 0.40 | `[.75]` |
| `single_ability_focus` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Rapid Recharge (`rapid_recharge`, T3 Spirit)
Path: `data/items/rapid_recharge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[ ]` |
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | 2.38 | 2.00 | -0.38 | Cut JSON → 2.00 | `[x]` |
| `continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[ ]` |
| `farmer` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `multi_ability_focus` | 0.05 | 0.70 | +0.65 | Bump JSON → 0.70 | `[ ]` |
| `single_ability_focus` | 0.70 | 1.50 | +0.80 | Bump JSON → 1.50 | `[x]` |
| `spirit_damage` | 0.55 | 0.40 | -0.15 | Cut JSON → 0.40 | `[x]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Silence Wave (`silence_wave`, T3 Spirit)
Path: `data/items/silence_wave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[x]` |
| `burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `long_range` | 0.10 | 1.10 | +1.00 | Bump JSON → 1.10 | `[.5]` |
| `mid_range` | 0.20 | 1.10 | +0.90 | Bump JSON → 1.10 | `[.5]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 2.00 | 1.20 | -0.80 | Cut JSON → 1.20 | `[1.5]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | 1.70 | +1.55 | Bump JSON → 1.70 | `[1]` |
| `spirit_burst_proc` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[.75]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[.66]` |

### Spirit Snatch (`spirit_snatch`, T3 Spirit)
Path: `data/items/spirit_snatch.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 1.70 | +0.70 | Bump JSON → 1.70 | `[1.5]` |
| `close_to_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[1]` |
| `grounded` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[1]` |
| `hybrid_damage_usage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.60 | -0.15 | Cut JSON → 0.60 | `[x]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_target` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `spirit_burst_proc` | 0.05 | 1.80 | +1.75 | Bump JSON → 1.80 | `[ ]` |
| `spirit_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.33 | 0.90 | +0.57 | Bump JSON → 0.90 | `[.5]` |
| `spirit_resist_shred` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `spirit_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Superior Cooldown (`superior_cooldown`, T3 Spirit)
Path: `data/items/superior_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `charge_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `cooldown_reduction` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.70 | +1.20 | Bump JSON → 1.70 | `[1.5]` |
| `self_heal` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `single_ability_focus` | 0.50 | -0.50 | -1.00 | Cut JSON → -0.50 | `[ ]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Superior Duration (`superior_duration`, T3 Spirit)
Path: `data/items/superior_duration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 2.38 | 1.70 | -0.68 | Cut JSON → 1.70 | `[2]` |
| `melee_resistance` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.50 | 1.90 | +1.40 | Bump JSON → 1.90 | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Surge of Power (`surge_of_power`, T3 Spirit)
Path: `data/items/surge_of_power.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `single_ability_focus` | 0.15 | 1.90 | +1.75 | Bump JSON → 1.90 | `[1]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[1]` |
| `spirit_continuous_damage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `spirit_damage` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[1.15]` |

### Tankbuster (`tankbuster`, T3 Spirit)
Path: `data/items/tankbuster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `counter_importance` | 0.05 | 1.60 | +1.55 | Bump JSON → 1.60 | `[.45]` |
| `farmer` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `high_max_hp` | 0.10 | 0.60 | +0.50 | Bump JSON → 0.60 | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[1.5]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | -0.25 | 2.00 | +2.25 | Bump JSON → 2.00 | `[ ]` |
| `spirit_damage` | 0.85 | (drop) | -0.85 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Torment Pulse (`torment_pulse`, T3 Spirit)
Path: `data/items/torment_pulse.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[.5]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.05 | (drop) | -1.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

## T4 (6400 souls)

### Armor Piercing Rounds (`armor_piercing_rounds`, T4 Weapon)
Path: `data/items/armor_piercing_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.80 | 0.40 | -0.40 | Cut JSON → 0.40 | `[.66]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[ ]` |
| `gun_burst_damage` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_damage` | 0.25 | 2.00 | +1.75 | Bump JSON → 2.00 | `[1]` |
| `gun_continuous_proc` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `long_range` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80 | `[x]` |
| `mid_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | 1.70 | +1.55 | Bump JSON → 1.70 | `[ ]` |

### Capacitor (`capacitor`, T4 Weapon)
Path: `data/items/capacitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[1]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[.45]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `silence` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `single_ability_focus` | 0.40 | 0.90 | +0.50 | Bump JSON → 0.90 | `[ ]` |
| `spirit_burst_damage` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[.33]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `spirit_continuous_proc` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[1]` |
| `spirit_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |

### Crippling Headshot (`crippling_headshot`, T4 Weapon)
Path: `data/items/crippling_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `assist_importance` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 2.00 | 0.80 | -1.20 | Cut JSON → 0.80 | `[1.5]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `debuff` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `long_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `single_target` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 2.00 | 0.70 | -1.30 | Cut JSON → 0.70 | `[1.5]` |

### Crushing Fists (`crushing_fists`, T4 Weapon)
Path: `data/items/crushing_fists.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `bullet_resistance` | 0.70 | 0.40 | -0.30 | Cut JSON → 0.40 | `[.5]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[1.5]` |
| `grounded` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[1]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.75 | -0.90 | -0.15 | Cut JSON → -0.90 | `[x]` |
| `melee_damage` | 2.38 | 1.20 | -1.18 | Cut JSON → 1.20 | `[2]` |
| `melee_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.00 | (drop) | +-0.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.70 | 0.40 | -0.30 | Cut JSON → 0.40 | `[x]` |

### Frenzy (`frenzy`, T4 Weapon)
Path: `data/items/frenzy.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[x]` |
| `damage_sponge` | 0.75 | 1.10 | +0.35 | Bump JSON → 1.10 | `[x]` |
| `debuff_resistance` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `engage` | 0.40 | 1.00 | +0.60 | Bump JSON → 1.00 | `[x]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.66 | 1.80 | +1.14 | Bump JSON → 1.80 | `[1.5]` |
| `gun_burst_damage` | 0.30 | 0.80 | +0.50 | Bump JSON → 0.80 | `[x]` |
| `gun_continuous_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `high_max_hp` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[ ]` |
| `horizontal_mobility` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[.75]` |
| `low_max_hp` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[.33]` |
| `scaling_late` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Glass Cannon (`glass_cannon`, T4 Weapon)
Path: `data/items/glass_cannon.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `damage_sponge` | 0.12 | -0.60 | -0.72 | Cut JSON → -0.60 | `[x]` |
| `farmer` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `fire_rate` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `gun_burst_damage` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[x]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `high_max_hp` | -0.50 | -0.20 | +0.30 | Bump JSON → -0.20 | `[x]` |
| `low_max_hp` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50 | `[1]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[x]` |
| `single_target` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Lucky Shot (`lucky_shot`, T4 Weapon)
Path: `data/items/lucky_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.30 | 0.60 | -0.70 | Cut JSON → 0.60 | `[1]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[1]` |
| `magazine_size_dependant` | 0.45 | 0.30 | -0.15 | Cut JSON → 0.30 | `[x]` |
| `single_target` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Ricochet (`ricochet`, T4 Weapon)
Path: `data/items/ricochet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.25 | 1.80 | +0.55 | Bump JSON → 1.80 | `[x]` |
| `bullet_damage` | 1.65 | 0.40 | -1.25 | Cut JSON → 0.40 | `[x]` |
| `bullet_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `farmer` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[1]` |
| `gun_burst_damage` | 0.75 | 1.40 | +0.65 | Bump JSON → 1.40 | `[ ]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `gun_continuous_proc` | 1.50 | 0.30 | -1.20 | Cut JSON → 0.30 | `[ ]` |
| `lane_pusher` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Silencer (`silencer`, T4 Weapon)
Path: `data/items/silencer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[.35]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[ ]` |
| `mid_range` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[ ]` |
| `silence` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `single_target` | 0.15 | 1.80 | +1.65 | Bump JSON → 1.80 | `[1]` |
| `spirit_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |

### Spellslinger (`spellslinger`, T4 Weapon)
Path: `data/items/spellslinger.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `charge_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.60 | 0.20 | -0.40 | Cut JSON → 0.20 | `[x]` |
| `engage` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `gun_burst_damage` | 0.30 | 1.50 | +1.20 | Bump JSON → 1.50 | `[x]` |
| `multi_ability_focus` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `scaling_late` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Spiritual Overflow (`spiritual_overflow`, T4 Weapon)
Path: `data/items/spiritual_overflow.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `gun_burst_damage` | 0.20 | 1.20 | +1.00 | Bump JSON → 1.20 | `[x]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `hybrid_damage_usage` | 2.38 | 1.60 | -0.78 | Cut JSON → 1.60 | `[2]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_burst_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[x]` |
| `spirit_continuous_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[x]` |
| `spirit_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_lifesteal` | 0.70 | 0.90 | +0.20 | Bump JSON → 0.90 | `[x]` |

### Cheat Death (`cheat_death`, T4 Vitality)
Path: `data/items/cheat_death.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `burst_resistance` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.80 | +1.70 | Bump JSON → 1.80 | `[.45]` |
| `damage_sponge` | 1.75 | 1.50 | -0.25 | Cut JSON → 1.50 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.75 | 1.20 | +0.45 | Bump JSON → 1.20 | `[x]` |
| `gun_burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.90 | 0.70 | -0.20 | Cut JSON → 0.70 | `[x]` |
| `low_max_hp` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20 | `[x]` |
| `melee_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.15 | 0.90 | +0.75 | Bump JSON → 0.90 | `[ ]` |
| `self_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_ability_focus` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `spirit_burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Colossus (`colossus`, T4 Vitality)
Path: `data/items/colossus.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.50 | 1.90 | +1.40 | Bump JSON → 1.90 | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[ ]` |
| `burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.5]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[.75]` |
| `grounded` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[.5]` |
| `gun_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 2.00 | 0.40 | -1.60 | Cut JSON → 0.40 | `[ ]` |
| `large_hitbox` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[.5]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |

### Divine Barrier (`divine_barrier`, T4 Vitality)
Path: `data/items/divine_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 2.00 | 1.80 | -0.20 | Cut JSON → 1.80 | `[x]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | 0.80 | +0.75 | Bump JSON → 0.80 | `[x]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | 1.10 | +0.77 | Bump JSON → 1.10 | `[ ]` |
| `debuff_resistance` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `escape` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `horizontal_mobility` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `self_buff` | 0.20 | 1.60 | +1.40 | Bump JSON → 1.60 | `[1]` |
| `shield` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.50 | 0.40 | -1.10 | Cut JSON → 0.40 | `[ ]` |

### Diviners Kevlar (`diviners_kevlar`, T4 Vitality)
Path: `data/items/diviners_kevlar.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `engage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.5]` |
| `gun_burst_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[1]` |
| `spirit_burst_damage` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |
| `spirit_burst_resistance` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 1.15 | 1.90 | +0.75 | Bump JSON → 1.90 | `[x]` |

### Healing Tempo (`healing_tempo`, T4 Vitality)
Path: `data/items/healing_tempo.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ally_buff` | 0.25 | 1.40 | +1.15 | Bump JSON → 1.40 | `[x]` |
| `bullet_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | 0.00 | -0.50 | Cut JSON → 0.00 | `[x]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.50 | 0.40 | -1.10 | Cut JSON → 0.40 | `[ ]` |
| `counter_importance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | 0.90 | +0.50 | Bump JSON → 0.90 | `[ ]` |
| `fire_rate` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `horizontal_mobility` | 0.80 | 0.30 | -0.50 | Cut JSON → 0.30 | `[x]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.75 | 0.70 | -1.05 | Cut JSON → 0.70 | `[1]` |
| `spirit_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Indomitable (`indomitable`, T4 Vitality)
Path: `data/items/indomitable.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `damage_sponge` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `debuff_resistance` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[1]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[x]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.66 | 0.10 | -0.56 | Cut JSON → 0.10 | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Infuser (`infuser`, T4 Vitality)
Path: `data/items/infuser.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.68 | 0.40 | -0.28 | Cut JSON → 0.40 | `[x]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `self_heal` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `single_ability_focus` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[x]` |
| `spirit_burst_damage` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.40 | 0.10 | -0.30 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[x]` |
| `spirit_lifesteal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Inhibitor (`inhibitor`, T4 Vitality)
Path: `data/items/inhibitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 1.40 | +0.65 | Bump JSON → 1.40 | `[1]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[x]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.85 | 0.50 | -0.35 | Cut JSON → 0.50 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `single_target` | 0.25 | 1.80 | +1.55 | Bump JSON → 1.80 | `[.5]` |
| `spirit_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Juggernaut (`juggernaut`, T4 Vitality)
Path: `data/items/juggernaut.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.40 | 0.00 | -0.40 | Cut JSON → 0.00 | `[x]` |
| `cc_resist` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.62 | 1.40 | -0.22 | Cut JSON → 1.40 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.60 | 1.10 | +0.50 | Bump JSON → 1.10 | `[.75]` |
| `escape` | 0.25 | 1.10 | +0.85 | Bump JSON → 1.10 | `[x]` |
| `farmer` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `horizontal_mobility` | 1.30 | 1.10 | -0.20 | Cut JSON → 1.10 | `[x]` |
| `large_hitbox` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Leech (`leech`, T4 Vitality)
Path: `data/items/leech.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `bullet_lifesteal` | 2.00 | 1.70 | -0.30 | Cut JSON → 1.70 | `[x]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.12 | 1.10 | +0.98 | Bump JSON → 1.10 | `[.66]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.97 | 0.60 | -0.37 | Cut JSON → 0.60 | `[.75]` |
| `hybrid_damage_usage` | 0.66 | 1.60 | +0.94 | Bump JSON → 1.60 | `[1]` |
| `melee_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `self_heal` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `spirit_burst_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_lifesteal` | 2.00 | 1.70 | -0.30 | Cut JSON → 1.70 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Phantom Strike (`phantom_strike`, T4 Vitality)
Path: `data/items/phantom_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_air` | 1.15 | 1.70 | +0.55 | Bump JSON → 1.70 | `[x]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20 | `[ ]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.25 | 1.40 | +1.15 | Bump JSON → 1.40 | `[ ]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | 2.00 | +1.34 | Bump JSON → 2.00 | `[x]` |
| `spirit_burst_proc` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80 | `[x]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Plated Armor (`plated_armor`, T4 Vitality)
Path: `data/items/plated_armor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `bullet_resistance` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[1]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 1.70 | +0.40 | Bump JSON → 1.70 | `[1.5]` |
| `damage_sponge` | 1.12 | 1.30 | +0.18 | Bump JSON → 1.30 | `[x]` |
| `gun_burst_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `high_max_hp` | 0.65 | 0.40 | -0.25 | Cut JSON → 0.40 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |

### Siphon Bullets (`siphon_bullets`, T4 Vitality)
Path: `data/items/siphon_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.70 | 0.20 | -0.50 | Cut JSON → 0.20 | `[.5]` |
| `bullet_lifesteal` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[.45]` |
| `damage_sponge` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.50 | 1.90 | +1.40 | Bump JSON → 1.90 | `[1]` |
| `pure_damage` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1.5]` |
| `scaling_late` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `self_heal` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `single_target` | 0.25 | 1.70 | +1.45 | Bump JSON → 1.70 | `[ ]` |

### Spellbreaker (`spellbreaker`, T4 Vitality)
Path: `data/items/spellbreaker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[.75]` |
| `cc_resist` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `debuff_resistance` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[.75]` |

### Unstoppable (`unstoppable`, T4 Vitality)
Path: `data/items/unstoppable.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[x]` |
| `damage_sponge` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[.75]` |
| `debuff_resistance` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[ ]` |
| `escape` | 0.60 | 1.10 | +0.50 | Bump JSON → 1.10 | `[x]` |
| `high_max_hp` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_ability_focus` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `ult_focused` | 0.45 | 0.80 | +0.35 | Bump JSON → 0.80 | `[x]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Vampiric Burst (`vampiric_burst`, T4 Vitality)
Path: `data/items/vampiric_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[x]` |
| `bullet_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.60 | 1.20 | +0.60 | Bump JSON → 1.20 | `[1]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.68 | 0.40 | -0.28 | Cut JSON → 0.40 | `[x]` |
| `magazine_size_dependant` | 0.70 | 0.10 | -0.60 | Cut JSON → 0.10 | `[ ]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `single_ability_focus` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Witchmail (`witchmail`, T4 Vitality)
Path: `data/items/witchmail.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `away_from_team` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 1.50 | 0.70 | -0.80 | Cut JSON → 0.70 | `[x]` |
| `counter_importance` | 0.75 | 1.40 | +0.65 | Bump JSON → 1.40 | `[x]` |
| `high_max_hp` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `large_hitbox` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[x]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `spirit_continuous_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `spirit_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |

### Arctic Blast (`arctic_blast`, T4 Spirit)
Path: `data/items/arctic_blast.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.45 | 1.90 | +1.45 | Bump JSON → 1.90 | `[.5]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `farmer` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.55 | 1.40 | +0.85 | Bump JSON → 1.40 | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[.75]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | 1.00 | +0.60 | Bump JSON → 1.00 | `[ ]` |
| `spirit_burst_damage` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[1]` |
| `spirit_burst_proc` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `spirit_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.80 | 0.20 | -0.60 | Cut JSON → 0.20 | `[ ]` |
| `spirit_resistance` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `stun` | 0.70 | 0.20 | -0.50 | Cut JSON → 0.20 | `[x]` |

### Boundless Spirit (`boundless_spirit`, T4 Spirit)
Path: `data/items/boundless_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `single_ability_focus` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `spirit_burst_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[.8]` |
| `spirit_continuous_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[.8]` |
| `spirit_damage` | 2.38 | 0.80 | -1.58 | Cut JSON → 0.80 | `[2]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Cursed Relic (`cursed_relic`, T4 Spirit)
Path: `data/items/cursed_relic.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_air` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 1.90 | +0.60 | Bump JSON → 1.90 | `[2]` |
| `debuff` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[2]` |
| `disarm` | 1.25 | 0.10 | -1.15 | Cut JSON → 0.10 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.75]` |
| `interrupt` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[2]` |
| `melee_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1.5]` |
| `spirit_damage` | 0.15 | 0.00 | -0.15 | Cut JSON → 0.00 | `[ ]` |
| `ult_focused` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |

### Echo Shard (`echo_shard`, T4 Spirit)
Path: `data/items/echo_shard.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[.5]` |
| `cooldown_reduction` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `duration_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_ability_focus` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `spirit_burst_damage` | 1.00 | 0.30 | -0.70 | Cut JSON → 0.30 | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | -0.25 | 1.60 | +1.85 | Bump JSON → 1.60 | `[ ]` |

### Escalating Exposure (`escalating_exposure`, T4 Spirit)
Path: `data/items/escalating_exposure.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.10 | 1.10 | +1.00 | Bump JSON → 1.10 | `[.33]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00 | `[.5]` |
| `scaling_late` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `spirit_burst_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 2.00 | 1.10 | -0.90 | Cut JSON → 1.10 | `[2]` |
| `spirit_damage` | 0.53 | 0.80 | +0.27 | Bump JSON → 0.80 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50 | `[.5]` |

### Ethereal Shift (`ethereal_shift`, T4 Spirit)
Path: `data/items/ethereal_shift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.80 | 1.40 | +0.60 | Bump JSON → 1.40 | `[x]` |
| `debuff_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[.33]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `long_range` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.70 | +1.70 | Add row, set 1.70 | `[ ]` |
| `single_ability_focus` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `spirit_burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.33 | 0.10 | -0.23 | Cut JSON → 0.10 | `[ ]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Focus Lens (`focus_lens`, T4 Spirit)
Path: `data/items/focus_lens.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `single_ability_focus` | 0.40 | 1.10 | +0.70 | Bump JSON → 1.10 | `[ ]` |
| `single_target` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_burst_damage` | 0.70 | 0.40 | -0.30 | Cut JSON → 0.40 | `[ ]` |
| `spirit_burst_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |

### Lightning Scroll (`lightning_scroll`, T4 Spirit)
Path: `data/items/lightning_scroll.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[.25]` |
| `aoe_cluster` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `debuff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[.5]` |
| `single_ability_focus` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `spirit_burst_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.65 | 0.30 | -0.35 | Cut JSON → 0.30 | `[x]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[1]` |
| `ult_focused` | 1.15 | 1.90 | +0.75 | Bump JSON → 1.90 | `[2]` |

### Magic Carpet (`magic_carpet`, T4 Spirit)
Path: `data/items/magic_carpet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `engage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `farmer` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[1]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 1.05 | 0.40 | -0.65 | Cut JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | 1.00 | +0.60 | Bump JSON → 1.00 | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.65 | 0.30 | -0.35 | Cut JSON → 0.30 | `[x]` |
| `vertical_mobility` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |

### Mercurial Magnum (`mercurial_magnum`, T4 Spirit)
Path: `data/items/mercurial_magnum.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `bullet_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | (null) | 1.70 | +1.70 | Add row, set 1.70 | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `gun_burst_damage` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[1]` |
| `gun_burst_proc` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 2.25 | 1.70 | -0.55 | Cut JSON → 1.70 | `[2]` |
| `magazine_size_dependant` | 1.25 | 0.30 | -0.95 | Cut JSON → 0.30 | `[ ]` |
| `single_ability_focus` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[.25]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.15 | 0.40 | -0.75 | Cut JSON → 0.40 | `[ ]` |
| `spirit_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Reverb (`mystic_reverb`, T4 Spirit)
Path: `data/items/mystic_reverb.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | 1.90 | +1.75 | Bump JSON → 1.90 | `[.45]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `multi_ability_focus` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.60 | 0.30 | -0.30 | Cut JSON → 0.30 | `[x]` |
| `single_ability_focus` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1]` |
| `single_target` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 2.00 | 0.50 | -1.50 | Cut JSON → 0.50 | `[ ]` |
| `spirit_burst_proc` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[ ]` |
| `spirit_continuous_damage` | -0.10 | 0.20 | +0.30 | Bump JSON → 0.20 | `[ ]` |
| `spirit_continuous_proc` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.65 | 0.50 | -1.15 | Cut JSON → 0.50 | `[1]` |
| `spirit_lifesteal` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[1]` |
| `spirit_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Refresher (`refresher`, T4 Spirit)
Path: `data/items/refresher.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[.5]` |
| `charge_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.25 | 1.40 | +1.15 | Bump JSON → 1.40 | `[.5]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `gun_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[.5]` |
| `scaling_late` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `spirit_burst_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[ ]` |
| `spirit_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |

### Scourge (`scourge`, T4 Spirit)
Path: `data/items/scourge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50 | `[x]` |
| `anti_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[1.25]` |
| `assist_importance` | 0.80 | 1.60 | +0.80 | Bump JSON → 1.60 | `[1.5]` |
| `cc_resist` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[1]` |
| `dot` | 1.50 | 0.50 | -1.00 | Cut JSON → 0.50 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[.75]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[1.5]` |
| `range_extender_dependant` | 0.05 | 0.40 | +0.35 | Bump JSON → 0.40 | `[x]` |
| `self_buff` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[x]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `spirit_continuous_proc` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20 | `[.5]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.95 | (drop) | -0.95 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |

### Spirit Burn (`spirit_burn`, T4 Spirit)
Path: `data/items/spirit_burn.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 2.00 | 1.60 | -0.40 | Cut JSON → 1.60 | `[x]` |
| `aoe_cluster` | 1.00 | 1.90 | +0.90 | Bump JSON → 1.90 | `[1.25]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[.45]` |
| `damage_sponge` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[x]` |
| `dot` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[.75]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.70 | 0.90 | +0.20 | Bump JSON → 0.90 | `[x]` |
| `spirit_burst_proc` | 0.90 | (drop) | -0.90 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `spirit_continuous_proc` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[.66]` |
| `spirit_damage` | 1.35 | 0.50 | -0.85 | Cut JSON → 0.50 | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Transcendent Cooldown (`transcendent_cooldown`, T4 Spirit)
Path: `data/items/transcendent_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[x]` |
| `scaling_late` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `self_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Vortex Web (`vortex_web`, T4 Spirit)
Path: `data/items/vortex_web.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `assist_importance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.30 | +1.20 | Bump JSON → 1.30 | `[.45]` |
| `displace` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[1]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `silence` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | 1.20 | +0.80 | Bump JSON → 1.20 | `[ ]` |
| `stun` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

## T? (9999 souls — Street Brawl / non-standard)

### Haunting Shot (`haunting_shot`, T? Weapon)
Path: `data/items/haunting_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00 | `[x]` |
| `aoe_cluster` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `bullet_damage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `debuff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `gun_burst_damage` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `pure_damage` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[x]` |
| `single_target` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `spirit_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Infinite Rounds (`infinite_rounds`, T? Weapon)
Path: `data/items/infinite_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[x]` |
| `counter_importance` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `fire_rate` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `gun_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `gun_burst_proc` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `gun_continuous_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `gun_continuous_proc` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[x]` |
| `long_range` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[x]` |
| `magazine_size_dependant` | 1.25 | 0.40 | -0.85 | Cut JSON → 0.40 | `[ ]` |
| `single_target` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Runed Gauntlets (`runed_gauntlets`, T? Weapon)
Path: `data/items/runed_gauntlets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `cooldown_reduction` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `damage_sponge` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `grounded` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | -0.90 | -0.90 | Add row, set -0.90 | `[ ]` |
| `melee_damage` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `melee_resistance` | 0.15 | 1.30 | +1.15 | Bump JSON → 1.30 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Celestial Blessing (`celestial_blessing`, T? Vitality)
Path: `data/items/celestial_blessing.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[x]` |
| `assist_importance` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `burst_heal` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[x]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `damage_sponge` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `escape` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.75 | 1.20 | +0.45 | Bump JSON → 1.20 | `[x]` |
| `spirit_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `vertical_mobility` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |

### Cloak of Opportunity (`cloak_of_opportunity`, T? Vitality)
Path: `data/items/cloak_of_opportunity.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | 1.50 | +1.05 | Bump JSON → 1.50 | `[x]` |
| `damage_sponge` | 0.66 | 1.20 | +0.54 | Bump JSON → 1.20 | `[x]` |
| `debuff_resistance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `escape` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `horizontal_mobility` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `self_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Electric Slippers (`electric_slippers`, T? Vitality)
Path: `data/items/electric_slippers.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50 | `[.75]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50 | `[x]` |
| `bullet_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `damage_sponge` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `escape` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[x]` |
| `fire_rate` | 0.66 | 1.10 | +0.44 | Bump JSON → 1.10 | `[x]` |
| `grounded` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | 1.10 | +0.35 | Bump JSON → 1.10 | `[x]` |
| `large_hitbox` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_damage` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `ult_focused` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |

### Eternal Gift (`eternal_gift`, T? Vitality)
Path: `data/items/eternal_gift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[x]` |
| `damage_sponge` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[x]` |
| `farmer` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[x]` |
| `fire_rate` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `gun_burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.45 | 0.30 | -0.15 | Cut JSON → 0.30 | `[x]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.20 | 0.80 | +0.60 | Bump JSON → 0.80 | `[x]` |
| `scaling_late` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `self_buff` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[x]` |
| `spirit_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |

### Nullification Burst (`nullification_burst`, T? Vitality)
Path: `data/items/nullification_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `aoe_cluster` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50 | `[x]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[x]` |
| `damage_sponge` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[x]` |
| `debuff` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50 | `[x]` |
| `debuff_resistance` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[x]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `long_range` | -1.20 | (drop) | +1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20 | `[x]` |
| `spirit_burst_proc` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[x]` |
| `spirit_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |

### Seraphim Wings (`seraphim_wings`, T? Vitality)
Path: `data/items/seraphim_wings.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `bullet_evasion` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | 0.90 | +0.57 | Bump JSON → 0.90 | `[x]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `escape` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `grounded` | -1.00 | -1.50 | -0.50 | Cut JSON → -1.50 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.90 | +0.75 | Bump JSON → 0.90 | `[x]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50 | `[ ]` |
| `long_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `spirit_resistance` | 0.33 | 0.90 | +0.57 | Bump JSON → 0.90 | `[x]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.00 | 0.70 | -1.30 | Cut JSON → 0.70 | `[1.5]` |

### Shadow Strike (`shadow_strike`, T? Vitality)
Path: `data/items/shadow_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.45 | 1.50 | +1.05 | Bump JSON → 1.50 | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `dot` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `escape` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `grounded` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00 | `[ ]` |
| `horizontal_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.66 | 1.10 | +0.44 | Bump JSON → 1.10 | `[x]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[ ]` |
| `spirit_burst_damage` | 0.10 | 0.60 | +0.50 | Bump JSON → 0.60 | `[x]` |
| `spirit_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `spirit_resist_shred` | 0.45 | 1.50 | +1.05 | Bump JSON → 1.50 | `[ ]` |
| `ult_focused` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Frostbite Charm (`frostbite_charm`, T? Spirit)
Path: `data/items/frostbite_charm.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cooldown_reduction` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `engage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `single_ability_focus` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `single_target` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_burst_damage` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `spirit_burst_proc` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `spirit_damage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `stun` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |

### Mystic Conduit (`mystic_conduit`, T? Spirit)
Path: `data/items/mystic_conduit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `ally_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `assist_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `burst_heal` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `close_to_team` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `cooldown_reduction` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `range_extender_dependant` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `scaling_late` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `self_heal` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `team_heal` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |

### Mystical Piano (`mystical_piano`, T? Spirit)
Path: `data/items/mystical_piano.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `debuff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `disarm` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `movement_slow` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `silence` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_ability_focus` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `spirit_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `stun` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |

### Omnicharge Signet (`omnicharge_signet`, T? Spirit)
Path: `data/items/omnicharge_signet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `charge_dependant` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `cooldown_reduction` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `multi_ability_focus` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `scaling_late` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `single_ability_focus` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_burst_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_damage` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |

### Prism Blast (`prism_blast`, T? Spirit)
Path: `data/items/prism_blast.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `cc_resist` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `close_range` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `damage_sponge` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `escape` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_burst_damage` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `spirit_continuous_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_continuous_proc` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `spirit_damage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |

### Shrink Ray (`shrink_ray`, T? Spirit)
Path: `data/items/shrink_ray.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `assist_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `bullet_evasion` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `engage` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `escape` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `farmer` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `fire_rate` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `horizontal_mobility` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `self_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `small_hitbox` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Unstable Concoction (`unstable_concoction`, T? Spirit)
Path: `data/items/unstable_concoction.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `bullet_damage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `cc_resist` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `damage_sponge` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `gun_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `high_max_hp` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `horizontal_mobility` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `pure_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `scaling_late` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_ability_focus` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_burst_damage` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `spirit_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `stun` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

---

## Apply these changes to JSONs

*(Cross-tier cleanup checklist. The per-row Apply? boxes above are the per-tag tracker; this is for tier-wide patterns.)*

### T1 (800 souls)
- [ ] (placeholder)

### T2 (1600 souls)
- [ ] (placeholder)

### T3 (3200 souls)
- [ ] (placeholder)

### T4 (6400 souls)
- [ ] (placeholder)

### T? (9999 souls — Street Brawl / non-standard)
- [ ] (placeholder)
