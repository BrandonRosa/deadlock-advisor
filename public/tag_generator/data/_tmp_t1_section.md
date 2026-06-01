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
| `bullet_damage` | +8% direct + T1 Weapon baseline | 13 (eff gun-dmg %) |  | adds | 5.2 baseline + 8 explicit. |
| `magazine_size_dependant` | +30% Max Ammo | 30 (eff ammo %) |  | adds | Direct passive. |
| `gun_continuous_damage` | sustained fire + ammo depth | 30 (raw dmg outside 1s) |  | adds | R2: ammo extends continuous fire. |
| `gun_burst_damage` | per-shot WD lift in 1s | 15 (raw dmg within 1s) |  | adds | R2: bullet_damage lifts burst lightly. |
| `farmer` | ammo depth enables wave-clear | 50 (% importance) |  | adds | R28: T1 farmer-friendly. |


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
| `fire_rate` | +9% direct | 9 (eff %) |  | adds | Direct. |
| `bullet_damage` | T1 baseline + FR-derived lift | 9 (eff gun-dmg %) |  | adds | 5.2 baseline + small FR-derived per-shot DPS lift. |
| `gun_burst_damage` | FR lifts burst HEAVILY (R2 corrected) | 40 (raw dmg within 1s) |  | adds | R2: fire_rate primarily lifts gun_burst. |
| `gun_continuous_damage` | FR lifts continuous lightly | 10 (raw dmg outside 1s) |  | adds | R2: less impact (ammo/mag-gated). |


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
| `bullet_damage` | +20% × ~0.55 close uptime + T1 baseline | 16 (eff gun-dmg %) |  | adds | 5.2 baseline + 11 effective (close-gated). |
| `close_range` | <15m gun-amp gating | 80 (% importance) |  | adds | ⚖️ Named close_range T1 anchor. |
| `melee_resistance` | +20% direct | 20 (eff %) |  | adds | Direct passive. |
| `engage` | close-fight commit | 50 (% importance) |  | adds | R11: close fights need engagement. |
| `gun_burst_damage` | per-shot close amp | 20 (raw dmg within 1s) |  | adds | R2: close-range bullet amp lifts burst. |
| `gun_continuous_damage` | sustained close fire | 20 (raw dmg outside 1s) |  | adds | R2: bullet amp on continuous. |
| `grounded` | close-fight grounded | 35 (% importance) |  | adds | R7. |


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
| `headshot_damage` | 45 bonus dmg per headshot proc | 55 (% importance) |  | adds | ⚖️ T1 headshot anchor. |
| `bullet_damage` | T1 baseline + per-headshot amp | 11 (eff gun-dmg %) |  | adds | 5.2 baseline + ~5.8 effective from 45-dmg proc. |
| `gun_burst_proc` | proc per 9s CD on headshot | 0.20 (proc index) |  | adds | Hits within 1s window; gated by 9s CD. |
| `single_target` | per-headshot single-target | 35 (% importance) |  | adds | One target at a time. |
| `mid_range` | headshots reward mid-range aim | 25 (% importance) |  | adds | Mid-range identity. |
| `high_max_hp` | +30 HP (Weapon, no Vit baseline) | 30 (HP) |  | adds | Explicit only. |


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
| `bullet_damage` | +8% direct + T1 baseline | 13 (eff gun-dmg %) |  | adds | 5.2 baseline + 8 explicit. |
| `long_range` | +60% velocity lands ranged shots | 40 (% importance) |  | adds | Velocity directly benefits range. |
| `gun_burst_damage` | per-shot WD lift in 1s | 15 (raw dmg within 1s) |  | adds | R2. |
| `gun_continuous_damage` | per-shot WD lift sustained | 15 (raw dmg outside 1s) |  | adds | R2 symmetric. |
| `headshot_damage` | velocity aids landing heads | 20 (% importance) |  | adds | Indirect aim assist. |


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
| `farmer` | NPC-only weapon damage + resist | 80 (% importance) |  | adds | ⚖️ T1 farmer anchor — NPC bonus. |
| `bullet_damage` | T1 baseline only (NPC-only conditional excluded) | 5.2 (eff gun-dmg %) |  | adds | Baseline only — NPC damage doesn't lift hero gun-damage axis. |
| `scaling_early` | early-game lane-push farmer | 50 (% importance) |  | adds | Early game souls advantage. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) |  | adds | Small OOC tick. |
| `mid_range` | NPC-clear lane positioning | 25 (% importance) |  | adds | Lane skirmish range. |


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
| `bullet_damage` | +6% direct + T1 baseline | 11 (eff gun-dmg %) |  | adds | 5.2 baseline + 6 explicit. |
| `self_heal` | 50/6s × typical combat ≈ 150 HP | 150 (HP total) |  | adds | Sustained self-heal via aim. |
| `burst_heal` | 50 HP within 1s on each proc | 50 (HP within 1s) |  | adds | Instant per-proc heal. |
| `gun_burst_proc` | per-bullet heal proc | 0.15 (proc index) |  | adds | 6s CD throttles. |
| `farmer` | NPC heal also triggers | 35 (% importance) |  | adds | R28: aim-while-farming. |


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
| `high_max_hp` | T1 Vit baseline + 210 HP | 229 (HP) |  | adds | ⚖️ T1 high_max_hp anchor. |
| `damage_sponge` | raw HP = sponge identity | 45 (% importance) |  | adds | Pure HP stat stick. |


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
| `self_heal` | 2.5×30s combat + 1.5×20s OOC | 105 (HP total) |  | adds | Sustained self-regen. |
| `continous_heal` | regen ticks outside 1s | 100 (HP outside 1s) |  | adds | ⚖️ T1 continous_heal flavor. |
| `burst_heal` | first-1s tick | 2.5 (HP within 1s) |  | adds | Small per-second. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) |  | adds | R31. |
| `farmer` | regen sustains lane farm | 40 (% importance) |  | adds | R28. |


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
| `vertical_mobility` | +1 stamina + faster recovery | 2.5 (units) |  | adds | Direct mobility enabler. |
| `horizontal_mobility` | stamina-dash adds m/s | 0.65 (m/s eff) |  | adds | Stamina × 0.65 m/s effective. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) |  | adds | R31. |
| `escape` | mobility-flavored | 35 (% importance) |  | adds | R14: mobility = escape. |
| `farmer` | stamina enables rotations | 30 (% importance) |  | adds | R28. |


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
| `shield` | 200 barrier on-demand burst soak | 100 (shield HP) |  | adds | Full 200 HP soak per cast; ~100 effective per fight. |
| `high_max_hp` | T1 Vit baseline + barrier-as-HP | 27 (HP) |  | adds | 19 baseline + 8 effective shield HP. |
| `self_buff` | self-cast active | 35 (% importance) |  | adds | Self-only. |
| `escape` | reactive barrier covers retreat | 40 (% importance) |  | adds | Panic-button defense. |
| `self_heal` | +1 OOC × 30s | 30 (HP total) |  | adds | Small OOC. |


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
| `self_heal` | 300 HP × ~0.67 self-cast share | 200 (HP total) |  | adds | Self-cast dominant. |
| `team_heal` | 300 HP × ~0.33 ally-cast share | 100 (HP total) |  | adds | Ally-cast option per description. |
| `continous_heal` | 300/20s = 15 HP/s outside 1s | 285 (HP outside 1s) |  | adds | Most heal is over 19s. |
| `burst_heal` | first-1s tick | 15 (HP within 1s) |  | adds | Small initial. |
| `assist_importance` | ally-cast utility heal | 70 (% importance) |  | adds | R27. |
| `horizontal_mobility` | +2m sprint × channel-only ×0.5 | 1.0 (m/s eff) |  | adds | Channel-only discount. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) |  | adds | R31. |
| `counter_importance` | reactive heal vs poke | 35 (% importance) |  | adds | R13. |


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
| `melee_damage` | +12% direct | 12 (eff melee-dmg %) |  | adds | Direct passive. |
| `self_heal` | 100 HP per proc × ~1.5 procs/fight | 150 (HP total) |  | adds | Sustained melee sustain. |
| `burst_heal` | 100 HP within 1s of proc | 100 (HP within 1s) |  | adds | Instant on contact. |
| `close_range` | melee-gated entirely | 90 (% importance) |  | adds | R21: melee = close. |
| `engage` | melee commits a fight | 65 (% importance) |  | adds | R11. |
| `grounded` | melee is grounded | 45 (% importance) |  | adds | R7. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) |  | adds | R31. |


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
| `melee_resistance` | +18% direct | 18 (eff %) |  | adds | Direct passive. |
| `high_max_hp` | T1 Vit baseline + 75 HP | 94 (HP) |  | adds | 19 + 75. |
| `self_heal` | parry heals = ~60 HP per typical fight | 60 (HP total) |  | adds | Reactive heal on parry. |
| `burst_heal` | parry heal lands instantly | 60 (HP within 1s) |  | adds | Single-instance on parry. |
| `counter_importance` | parry counter to melee/abilities | 45 (% importance) |  | adds | R13. |
| `engage` | parry commits a melee read | 45 (% importance) |  | adds | R11: parry-read commits. |
| `grounded` | parry is grounded | 40 (% importance) |  | adds | R7. |


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
| `horizontal_mobility` | +2m sprint direct | 1.4 (m/s eff) |  | adds | ⚖️ T1 horizontal_mobility anchor. |
| `self_heal` | +2 OOC × 20s OOC | 40 (HP total) |  | adds | Small OOC tick. |
| `high_max_hp` | T1 Vit baseline | 19 (HP) |  | adds | R31. |
| `farmer` | mobility = farm rotation | 40 (% importance) |  | adds | R28: T1 mobility-farmer. |
| `escape` | mobility = escape | 40 (% importance) |  | adds | R14. |


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
| `charge_dependant` | +1 charge on charged abilities | 70 (% importance) |  | adds | ⚖️ Named T1 charge_dependant anchor. |
| `spirit_damage` | +7 SP on charged abilities + T1 baseline | 9 (SP-equiv) |  | adds | 4.3 baseline + ~5 conditional. |
| `ability_spam` | +1 charge enables more casts | 35 (% importance) |  | adds | R20. |
| `single_ability_focus` | rewards your key charged ability | 45 (% importance) |  | adds | R17: charged-ability-flavored. |


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
| `spirit_damage` | +10 SP direct + T1 baseline | 14 (SP-equiv) |  | adds | ⚖️ T1 spirit_damage anchor. 4.3 baseline + 10 explicit. |
| `spirit_burst_damage` | SP lifts spirit burst | 15 (raw dmg within 1s) |  | adds | R2: SP lifts spirit burst. |
| `spirit_continuous_damage` | SP lifts continuous | 15 (raw dmg outside 1s) |  | adds | R2 symmetric. |


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
| `scaling_late` | bank souls + hatch into permanent buffs late game | 80 (% importance) |  | adds | ⚖️ Named scaling_late anchor T1 — peaks late. |
| `farmer` | soul income | 60 (% importance) |  | adds | R28: greedy soul-economy item. |
| `spirit_damage` | T1 Spirit baseline | 4.3 (SP-equiv) |  | adds | R31 baseline only — meant to be sold, skip negative side effects. |
| `horizontal_mobility` | +1m sprint | 0.7 (m/s eff) |  | adds | Direct. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) |  | adds | Small OOC. |
| `single_target` | hatch is single-cast | 25 (% importance) |  | adds | Self-affecting only. |


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
| `spirit_burst_damage` | 40 bonus dmg per qualifying ability hit | 40 (raw dmg within 1s) |  | adds | ⚖️ T1 spirit burst-flavor anchor. |
| `spirit_burst_proc` | per-ability burst proc | 0.50 (proc index) |  | adds | R6: per-ability instant trigger, gated by 80-dmg threshold. |
| `spirit_damage` | T1 baseline + proc-equiv | 7 (SP-equiv) |  | adds | 4.3 baseline + ~2.5 proc-equiv. |
| `scaling_early` | greedy early-game spirit caster | 65 (% importance) |  | adds | ⚖️ Named scaling_early anchor — peaks early. |
| `charge_dependant` | Charge-Up mechanic per Notes | 50 (% importance) |  | adds | Charge-up flavor. |
| `single_ability_focus` | best when one big ability triggers it | 35 (% importance) |  | adds | R17: per-cast trigger. |


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
| `range_extender_dependant` | +20% direct | 20 (eff %) |  | adds | ⚖️ Named T1 range-extender anchor. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | imbues exactly one ability | 60 (% importance) |  | adds | R17: imbue is single-ability. |


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
| `self_heal` | 4 HP/s × 7s × ~2 stacks avg | 56 (HP total) |  | adds | Spirit-poke sustain. |
| `continous_heal` | regen outside 1s | 24 (HP outside 1s) |  | adds | 4 × 6s × 0.75 uptime. |
| `burst_heal` | first-1s tick | 4 (HP within 1s) |  | adds | One tick. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) |  | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) |  | adds | Explicit. |
| `farmer` | sustained spirit-poke farmer | 45 (% importance) |  | adds | R28. |
| `mid_range` | spirit-poke range typical | 25 (% importance) |  | adds | Caster-range identity. |


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
| `fire_rate_slow` | -32% × 5s × 1 target × (5/16) uptime | 15 (eff slow %) |  | adds | ⚖️ T1 fire_rate_slow anchor. |
| `bullet_resist_shred` | -8% × (5/16) uptime | 2.5 (eff shred %) |  | adds | Active uptime. |
| `counter_importance` | dedicated anti-gun debuff | 55 (% importance) |  | adds | R13. |
| `single_target` | per-target debuff | 50 (% importance) |  | adds | Cast on one enemy. |
| `spirit_damage` | T1 baseline | 4.3 (SP-equiv) |  | adds | R31. |
| `high_max_hp` | +60 HP (Spirit, no Vit baseline) | 60 (HP) |  | adds | Explicit. |
| `horizontal_mobility` | +0.5m sprint | 0.35 (m/s eff) |  | adds | Direct. |


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
| `spirit_burst_damage` | 40 + 0.37×20 = 47 within 1s | 47 (raw dmg within 1s) |  | adds | Per-melee burst. |
| `spirit_burst_proc` | per-melee proc | 0.50 (proc index) |  | adds | R6: melee instant-trigger, 8s CD. |
| `spirit_resist_shred` | -6% × melee-uptime ~0.4 | 3 (eff shred %) |  | adds | Melee-gated. |
| `spirit_damage` | T1 baseline + proc-equiv | 9 (SP-equiv) |  | adds | 4.3 baseline + 5 proc-equiv. |
| `melee_damage` | melee-triggered effects lift melee | 8 (eff melee-dmg %) |  | adds | R12. |
| `close_range` | melee-gated | 75 (% importance) |  | adds | R21. |
| `engage` | melee commits | 50 (% importance) |  | adds | R11. |
| `grounded` | melee is grounded | 40 (% importance) |  | adds | R7. |


---
