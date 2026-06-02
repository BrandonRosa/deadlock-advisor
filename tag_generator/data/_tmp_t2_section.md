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
| `fire_rate` | +25% × (7/12) buff uptime | 15 (eff %) |  | adds | Mid uptime on skill check. |
| `bullet_damage` | T2 baseline + FR-derived | 14 (eff gun-dmg %) |  | adds | 7.2 baseline + ~7 FR-derived. |
| `bullet_lifesteal` | +16% × (7/12) | 9 (eff %) |  | adds | Window-gated. |
| `gun_burst_damage` | FR burst lift | 60 (raw dmg within 1s) |  | adds | R2: FR primarily lifts burst. |
| `gun_continuous_damage` | sustained gun + mag | 20 (raw dmg outside 1s) |  | adds | R2 lighter + mag depth. |
| `magazine_size_dependant` | +20% direct + instant reload | 25 (eff ammo %) |  | adds | Direct + reload skip. |
| `horizontal_mobility` | +0.75m × (7/12) | 0.4 (m/s eff) |  | adds | Active mobility. |
| `self_heal` | bullet lifesteal sustain | 80 (HP total) |  | adds | Lifesteal-driven. |
| `farmer` | reload skip helps wave clear | 35 (% importance) |  | adds | R28. |


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
| `horizontal_mobility` | +3m × (5/16) uptime + slide passive | 1.3 (m/s eff) |  | adds | Direct mobility burst. |
| `bullet_damage` | +6% direct + T2 baseline | 13 (eff gun-dmg %) |  | adds | 7.2 baseline + 6 explicit. |
| `cc_resist` | +40% × (5/16) slow resist | 12 (eff %) |  | adds | Active-only slow resist. |
| `bullet_resistance` | +6% direct | 6 (eff %) |  | adds | Direct. |
| `escape` | mobility + slow resist | 60 (% importance) |  | adds | ⚖️ Dual mobility tool. |
| `engage` | active dive ability | 40 (% importance) |  | adds | R11. |
| `counter_importance` | counter to slow comps | 35 (% importance) |  | adds | R13. |
| `gun_continuous_damage` | sustained gun lift | 15 (raw dmg outside 1s) |  | adds | R2. |


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
| `bullet_damage` | +45% × ~0.55 ramp uptime + T2 baseline | 32 (eff gun-dmg %) |  | adds | ⚖️ Strong sustained gun amp. |
| `gun_continuous_damage` | full ramp lives in continuous window | 70 (raw dmg outside 1s) |  | adds | ⚖️ T2 named gun_continuous anchor. |
| `gun_burst_damage` | 1s mark gets ~18% partial ramp | 25 (raw dmg within 1s) |  | adds | R2: pre-charge enables burst. |
| `magazine_size_dependant` | +20% Max Ammo | 20 (eff ammo %) |  | adds | Direct. |
| `farmer` | sustained ramp helps wave clear | 50 (% importance) |  | adds | R28. |


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
| `fire_rate` | +25% × ~0.5 dash-uptime | 13 (eff %) |  | adds | Mid uptime — dash-gated. |
| `bullet_damage` | T2 baseline + FR-derived | 13 (eff gun-dmg %) |  | adds | 7.2 baseline + 6 FR-derived. |
| `gun_burst_damage` | FR burst window after dash | 55 (raw dmg within 1s) |  | adds | R2: FR lifts burst. |
| `aerial` | dash-jump triggered | 70 (% importance) |  | adds | ⚖️ Named aerial trigger. |
| `vertical_mobility` | +1 stamina + recovery + dash-trigger reward | 2.5 (units) |  | adds | Direct mobility synergy. |
| `horizontal_mobility` | stamina-dash | 0.7 (m/s eff) |  | adds | Stamina-derived. |
| `magazine_size_dependant` | +6 temp ammo per dash | 12 (eff ammo %) |  | adds | Temporary ammo. |


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
| `long_range` | gun-amp >15m gating | 70 (% importance) |  | adds | ⚖️ Named long_range T2 anchor. |
| `bullet_damage` | +40% × ~0.5 long uptime + T2 baseline | 27 (eff gun-dmg %) |  | adds | 7.2 baseline + 20 effective. |
| `gun_continuous_damage` | sustained long-range fire | 35 (raw dmg outside 1s) |  | adds | R2. |
| `gun_burst_damage` | per-shot long amp | 25 (raw dmg within 1s) |  | adds | R2. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) |  | adds | Small mobility. |


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
| `melee_damage` | +10% + 25% on Heavy/5s | 20 (eff melee-dmg %) |  | adds | 10 direct + ~10 effective Heavy-on-CD. |
| `bullet_damage` | T2 baseline (Weapon item, no Vit baseline) | 7.2 (eff gun-dmg %) |  | adds | R31 baseline only. |
| `bullet_resistance` | +6% direct | 6 (eff %) |  | adds | Direct. |
| `close_range` | melee-gated | 85 (% importance) |  | adds | R21. |
| `engage` | heavy melee = engage | 65 (% importance) |  | adds | R11. |
| `grounded` | melee is grounded | 45 (% importance) |  | adds | R7. |


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
| `hybrid_damage_usage` | gun-triggered spirit burst | 75 (% importance) |  | adds | ⚖️ Named hybrid anchor. |
| `spirit_burst_damage` | 40+1.2×30 = 76 within 1s | 76 (raw dmg within 1s) |  | adds | Per-bullet spirit chunk. |
| `spirit_burst_proc` | per-bullet on 8s CD | 0.40 (proc index) |  | adds | R6: per-bullet, 8s gate. |
| `spirit_damage` | +7 SP + proc-equiv (Weapon, no Spirit baseline) | 17 (SP-equiv) |  | adds | 7 explicit + 10 proc-equiv. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `counter_importance` | immune to evasion | 35 (% importance) |  | adds | Per Notes — bypasses evasion. |
| `single_target` | per-bullet single-target | 40 (% importance) |  | adds | Per-shot proc. |


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
| `bullet_damage` | +8% + 30% × ~0.5 (>50% HP window) + T2 baseline | 30 (eff gun-dmg %) |  | adds | 7.2 + 8 + 15. |
| `gun_burst_damage` | per-shot opener amp | 50 (raw dmg within 1s) |  | adds | R2: opener-burst. |
| `gun_continuous_damage` | sustained till target dropped | 30 (raw dmg outside 1s) |  | adds | R2 lighter. |
| `scaling_early` | rewards committing to opener | 50 (% importance) |  | adds | Opens-fight flavor. |
| `engage` | opener-amp = first-engage tool | 50 (% importance) |  | adds | R11. |
| `long_range` | +60% velocity favors range | 30 (% importance) |  | adds | Velocity-aided. |


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
| `bullet_damage` | +10% direct + T2 baseline | 17 (eff gun-dmg %) |  | adds | 7.2 + 10. |
| `magazine_size_dependant` | +20% Max Ammo | 20 (eff ammo %) |  | adds | Direct. |
| `ability_spam` | charge refresh on weapon dmg | 55 (% importance) |  | adds | R20: enables more ability uses. |
| `charge_dependant` | only useful on charged abilities | 50 (% importance) |  | adds | Direct mechanic. |
| `cooldown_reduction` | charge refresh ≈ effective CDR | 14 (eff CDR %) |  | adds | Conditional CDR via gun dmg. |
| `gun_continuous_damage` | sustained gun amp | 25 (raw dmg outside 1s) |  | adds | R2. |
| `hybrid_damage_usage` | gun output enables abilities | 50 (% importance) |  | adds | Gun-ability bridge. |


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
| `movement_slow` | -30% × 3.5s × on-bullet uptime ~0.7 | 25 (eff slow weighted) |  | adds | ⚖️ T2 movement_slow gun anchor. |
| `bullet_damage` | +15% + T2 baseline | 22 (eff gun-dmg %) |  | adds | 7.2 + 15. |
| `counter_importance` | slow vs mobile heroes | 40 (% importance) |  | adds | R13. |
| `gun_continuous_proc` | per-bullet buildup | 0.20 (proc index) |  | adds | R6: per-bullet. |
| `single_target` | per-bullet single-target | 35 (% importance) |  | adds | Per-shot. |
| `mid_range` | gun-range slow | 25 (% importance) |  | adds | Standard rifle range. |


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
| `spirit_resist_shred` | -8% × ~0.85 uptime | 7 (eff shred %) |  | adds | ⚖️ T2 spirit_resist_shred gun anchor. |
| `spirit_lifesteal` | +10% flat (skips DR) for you AND allies | 14 (eff %) |  | adds | Team-share lifesteal. |
| `hybrid_damage_usage` | gun bullet enables spirit-DPS | 60 (% importance) |  | adds | Gun-spirit bridge. |
| `ally_buff` | grants lifesteal to allies | 50 (% importance) |  | adds | R24: team benefit. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `gun_continuous_proc` | per-bullet debuff | 0.20 (proc index) |  | adds | R6: per-bullet. |
| `counter_importance` | vs spirit-resist tanks | 45 (% importance) |  | adds | R13. |


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
| `bullet_damage` | +8% × ~3 typical stacks + T2 baseline | 31 (eff gun-dmg %) |  | adds | 7.2 baseline + ~24 stack effective. |
| `aoe_cluster` | 5-shot multishot hits crowds | 60 (% importance) |  | adds | Multishot crowd amp. |
| `gun_burst_damage` | 5-shot per-trigger burst | 70 (raw dmg within 1s) |  | adds | R2: multishot burst. |
| `gun_continuous_damage` | sustained gun ramp | 35 (raw dmg outside 1s) |  | adds | R2. |
| `farmer` | multishot helps wave clear | 45 (% importance) |  | adds | R28. |


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
| `dot` | 17 DPS × 5s = 85 spirit DoT | 85 (eff dmg) |  | adds | ⚖️ Strong T2 DoT trigger. |
| `close_range` | <8m trigger | 80 (% importance) |  | adds | Close-gated. |
| `spirit_continuous_damage` | sustained DoT outside 1s | 70 (raw dmg outside 1s) |  | adds | R2: DoT continuous. |
| `spirit_burst_damage` | first-1s DoT tick | 17 (raw dmg within 1s) |  | adds | Initial. |
| `bullet_resist_shred` | -6% × ~0.7 uptime | 4 (eff shred %) |  | adds | Close-gated. |
| `horizontal_mobility` | +1.5m × (5/6) trigger uptime | 1.2 (m/s eff) |  | adds | High uptime on weapon dmg. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `engage` | close-range commit + tracker | 60 (% importance) |  | adds | R11. |
| `high_max_hp` | +50 HP (Weapon, no Vit baseline) | 50 (HP) |  | adds | Explicit. |
| `counter_importance` | wall-reveal counters stealth | 50 (% importance) |  | adds | R13. |


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
| `fire_rate` | +20% direct | 20 (eff %) |  | adds | ⚖️ T2 named fire_rate anchor. |
| `bullet_damage` | T2 baseline + FR-derived | 17 (eff gun-dmg %) |  | adds | 7.2 + ~10. |
| `gun_burst_damage` | FR primarily lifts burst | 75 (raw dmg within 1s) |  | adds | R2. |
| `gun_continuous_damage` | FR lighter on continuous | 20 (raw dmg outside 1s) |  | adds | R2. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) |  | adds | Direct. |


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
| `magazine_size_dependant` | +100% direct | 100 (eff ammo %) |  | adds | ⚖️ Named T2 magazine_size anchor. |
| `bullet_damage` | +14% direct + T2 baseline | 21 (eff gun-dmg %) |  | adds | 7.2 + 14. |
| `gun_continuous_damage` | mag depth + per-shot WD | 60 (raw dmg outside 1s) |  | adds | R2: mag-heavy. |
| `gun_burst_damage` | per-shot WD lift | 25 (raw dmg within 1s) |  | adds | R2 lighter. |
| `farmer` | huge ammo helps wave clear | 50 (% importance) |  | adds | R28. |


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
| `bullet_resist_shred` | -13% × ~0.7 headshot uptime | 9 (eff shred %) |  | adds | Headshot-gated. |
| `headshot_damage` | headshot-trigger pure-skill | 55 (% importance) |  | adds | R29. |
| `bullet_damage` | T2 baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `single_target` | per-headshot single-target | 45 (% importance) |  | adds | Per-target debuff. |
| `mid_range` | headshot range | 30 (% importance) |  | adds | Headshot tool. |
| `high_max_hp` | +60 HP (Weapon, no Vit baseline) | 60 (HP) |  | adds | Explicit. |
| `counter_importance` | shred vs bulky targets | 35 (% importance) |  | adds | R13. |


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
| `bullet_resistance` | +18% direct | 18 (eff %) |  | adds | Direct. |
| `bullet_damage` | +18% × ~0.6 healthy uptime (Vit, no Weapon baseline) | 11 (eff gun-dmg %) |  | adds | Direct conditional only. |
| `fire_rate` | +7% × ~0.6 healthy uptime | 4 (eff %) |  | adds | Conditional. |
| `gun_burst_damage` | FR+WD burst lift while healthy | 35 (raw dmg within 1s) |  | adds | R2 healthy-state. |
| `gun_continuous_damage` | sustained healthy fire | 20 (raw dmg outside 1s) |  | adds | R2. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +3 OOC × 20s | 60 (HP total) |  | adds | OOC sustain. |
| `damage_sponge` | rewards staying healthy | 35 (% importance) |  | adds | R26: healthy-bully. |


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
| `bullet_lifesteal` | +13% direct | 13 (eff %) |  | adds | ⚖️ T2 bullet_lifesteal anchor. |
| `bullet_damage` | +6% direct (Vit, no Weapon baseline) | 6 (eff gun-dmg %) |  | adds | Direct only. |
| `self_heal` | lifesteal sustain | 90 (HP total) |  | adds | Lifesteal-driven. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) |  | adds | 22 + 90. |
| `damage_sponge` | lifesteal + HP = sustained tank | 35 (% importance) |  | adds | R26. |


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
| `debuff_resistance` | +25% direct | 25 (eff %) |  | adds | ⚖️ T2 debuff_resistance anchor. |
| `cc_resist` | debuff resist reduces CC | 18 (eff %) |  | adds | R13. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) |  | adds | 22 + 90. |
| `counter_importance` | vs CC-heavy comps | 55 (% importance) |  | adds | R13. |
| `damage_sponge` | debuff resist + HP | 30 (% importance) |  | adds | R26. |


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
| `spirit_resistance` | +18% direct | 18 (eff %) |  | adds | Direct. |
| `spirit_damage` | +15 SP × ~0.6 healthy uptime (Vit, no Spirit baseline) | 9 (SP-equiv) |  | adds | Conditional only. |
| `cooldown_reduction` | +5% × ~0.6 healthy uptime | 3 (eff CDR %) |  | adds | Conditional. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2 OOC × 20s | 40 (HP total) |  | adds | OOC. |
| `spirit_burst_damage` | SP lifts spirit burst | 15 (raw dmg within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 15 (raw dmg outside 1s) |  | adds | R2. |
| `damage_sponge` | healthy-bully | 25 (% importance) |  | adds | R26. |


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
| `horizontal_mobility` | +2m direct | 1.4 (m/s eff) |  | adds | Direct. |
| `cc_resist` | +25% slow resist | 18 (eff %) |  | adds | Slow + dash slow. |
| `counter_importance` | vs slow comps | 50 (% importance) |  | adds | R13. |
| `escape` | mobility + slow resist | 55 (% importance) |  | adds | R14. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2 OOC × 20s | 40 (HP total) |  | adds | OOC. |
| `farmer` | mobility = rotations | 35 (% importance) |  | adds | R28. |


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
| `shield` | 250 × (6/45 avg uptime) | 33 (shield HP) |  | adds | Active barrier. |
| `assist_importance` | ally-cast halves CD | 65 (% importance) |  | adds | Ally-cast incentivized. |
| `self_buff` | also self-cast | 45 (% importance) |  | adds | Self-cast option per description. |
| `team_heal` | 250 barrier on ally | 100 (HP total) |  | adds | Barrier = effective HP. |
| `ally_buff` | +2.75m MS + barrier | 55 (% importance) |  | adds | R24. |
| `horizontal_mobility` | +2.75m × (6/45) | 0.4 (m/s eff) |  | adds | Active uptime. |
| `range_extender_dependant` | +8% direct | 8 (eff %) |  | adds | Direct. |
| `escape` | barrier + MS escape | 45 (% importance) |  | adds | R14. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +1.5 OOC × 20s | 30 (HP total) |  | adds | Small OOC. |


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
| `anti_heal` | -35% × ~0.7 spirit-dmg uptime | 25 (eff %) |  | adds | ⚖️ T2 anti_heal anchor. |
| `spirit_damage` | +7 SP (Vit, no Spirit baseline) | 7 (SP-equiv) |  | adds | Direct. |
| `self_heal` | 275 on kill × ~0.5 kills/fight | 140 (HP total) |  | adds | Kill-reward heal. |
| `burst_heal` | 275 instant on kill | 275 (HP within 1s) |  | adds | Instant on kill. |
| `counter_importance` | vs healing-stack comps | 55 (% importance) |  | adds | R13. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `high_kill_count` | rewards securing kills | 50 (% importance) |  | adds | Kill-reward. |
| `debuff` | anti-heal debuff | 35 (% importance) |  | adds | Hard-to-counter. |


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
| `self_heal` | 3 × 30s + 20% amp on lifesteal | 120 (HP total) |  | adds | Sustained + amp. |
| `continous_heal` | regen outside 1s | 100 (HP outside 1s) |  | adds | 3 × ~25s + amp on bullet/spirit lifesteal. |
| `burst_heal` | first-1s tick | 3 (HP within 1s) |  | adds | Small. |
| `ally_buff` | also amps ally heal received | 45 (% importance) |  | adds | Per Notes: amps healing applied TO allies. |
| `assist_importance` | helps team heal effectiveness | 35 (% importance) |  | adds | R27. |
| `counter_importance` | counter to anti-heal debuffs | 40 (% importance) |  | adds | R13. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `farmer` | regen sustains farm | 30 (% importance) |  | adds | R28. |


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
| `shield` | (325 + 1.8×20) × (10/55) uptime | 65 (shield HP) |  | adds | ~360 HP × ~18%. |
| `counter_importance` | dedicated anti-CC | 70 (% importance) |  | adds | ⚖️ Named anti-CC barrier. |
| `cc_resist` | barrier softens CC dmg | 12 (eff %) |  | adds | Indirect CC dmg mitigation. |
| `damage_sponge` | barrier soaks burst during CC | 35 (% importance) |  | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 35 (HP) |  | adds | 22 + ~13. |
| `escape` | barrier lets you survive CC | 40 (% importance) |  | adds | R14. |
| `self_heal` | +1 OOC × 20s | 20 (HP total) |  | adds | Small OOC. |
| `spirit_damage` | barrier scales with SP | 6 (SP-equiv) |  | relies | RELY: scaling matters only with SP. |


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
| `burst_heal` | up to 400 HP instant per consume | 280 (HP within 1s) |  | adds | ⚖️ T2 burst_heal anchor. ~280 typical with ~18 stacks. |
| `self_heal` | sustained per fight ≈ 280 | 280 (HP total) |  | adds | Per-fight self-sustain. |
| `vertical_mobility` | stamina-3 restore | 1.5 (units) |  | adds | Stamina burst. |
| `spirit_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `counter_importance` | counters ability-spam comps | 55 (% importance) |  | adds | R13: anti-caster heal. |
| `damage_sponge` | big burst heal soaks burst | 40 (% importance) |  | adds | R26. |


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
| `gun_burst_damage` | reflect 65% bullet within 1s window | 40 (raw dmg within 1s) |  | adds | Reflect-burst. |
| `bullet_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `counter_importance` | counter to focus-fire comps | 60 (% importance) |  | adds | ⚖️ Reflect-counter anchor. |
| `damage_sponge` | reflect-while-tanky | 45 (% importance) |  | adds | R26. |
| `high_max_hp` | T2 Vit baseline | 22 (HP) |  | adds | R31. |
| `engage` | active aggressive option | 35 (% importance) |  | adds | R11. |
| `self_buff` | active is self-only | 35 (% importance) |  | adds | Self-only. |


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
| `spirit_lifesteal` | +13% direct | 13 (eff %) |  | adds | ⚖️ T2 spirit_lifesteal anchor. |
| `spirit_damage` | +6 SP (Vit, no Spirit baseline) | 6 (SP-equiv) |  | adds | Direct. |
| `self_heal` | lifesteal sustain | 90 (HP total) |  | adds | Lifesteal-driven. |
| `high_max_hp` | T2 Vit baseline + 90 HP | 112 (HP) |  | adds | 22 + 90. |
| `damage_sponge` | lifesteal + HP | 35 (% importance) |  | adds | R26. |


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
| `shield` | 1500 × (8/45) trigger uptime × 0.5 stack avg | 130 (shield HP) |  | adds | ⚖️ T2 spirit-burst barrier anchor. |
| `spirit_resistance` | +18% × (8/45) | 3 (eff %) |  | adds | Active uptime. |
| `spirit_burst_resistance` | spirit-burst defense | 35 (eff %) |  | adds | ⚖️ Named spirit-burst defense. |
| `counter_importance` | dedicated anti-spirit-burst | 65 (% importance) |  | adds | R13. |
| `damage_sponge` | massive spirit-burst soak | 50 (% importance) |  | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 50 (HP) |  | adds | 22 + ~28. |
| `self_heal` | +2.5 OOC × 20s | 50 (HP total) |  | adds | OOC. |


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
| `shield` | 1500 × (8/35) trigger uptime × 0.5 stack avg | 170 (shield HP) |  | adds | ⚖️ T2 bullet-burst barrier anchor. |
| `bullet_resistance` | +18% × (8/35) | 4 (eff %) |  | adds | Active uptime. |
| `gun_burst_resistance` | bullet-burst defense | 40 (eff %) |  | adds | ⚖️ Named bullet-burst defense. |
| `counter_importance` | dedicated anti-bullet-burst | 65 (% importance) |  | adds | R13. |
| `damage_sponge` | massive bullet-burst soak | 50 (% importance) |  | adds | R26. |
| `high_max_hp` | T2 Vit baseline + shield-as-HP | 55 (HP) |  | adds | 22 + ~33. |
| `self_heal` | +2.5 OOC × 20s | 50 (HP total) |  | adds | OOC. |


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
| `spirit_damage` | +20 SP × ~0.6 dash-uptime + T2 baseline | 17 (SP-equiv) |  | adds | 5.5 + 12. |
| `range_extender_dependant` | +12% × ~0.6 uptime | 7 (eff %) |  | adds | Dash-gated. |
| `duration_dependant` | +15% × ~0.6 uptime | 9 (eff %) |  | adds | Dash-gated. |
| `single_ability_focus` | next-ability-only amp | 55 (% importance) |  | adds | R17. |
| `vertical_mobility` | stamina + recovery | 2.0 (units) |  | adds | Stamina-direct. |
| `horizontal_mobility` | stamina-dash | 0.65 (m/s eff) |  | adds | Stamina-derived. |
| `engage` | dash-into-cast = engage | 50 (% importance) |  | adds | R11. |
| `spirit_burst_damage` | dash-cast = burst window | 25 (raw dmg within 1s) |  | adds | R2. |


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
| `bullet_resist_shred` | -10% × ~0.7 uptime | 7 (eff shred %) |  | adds | ⚖️ T2 bullet_resist_shred Spirit anchor. |
| `hybrid_damage_usage` | spirit triggers gun amp | 70 (% importance) |  | adds | ⚖️ Named hybrid anchor. |
| `bullet_damage` | +9% (Spirit, no Weapon baseline) | 9 (eff gun-dmg %) |  | adds | Direct. |
| `bullet_resistance` | +9% direct | 9 (eff %) |  | adds | Direct. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `counter_importance` | vs bullet-resist tanks | 50 (% importance) |  | adds | R13. |
| `ally_buff` | teammates can use debuff | 35 (% importance) |  | adds | Per Notes — team-shareable. |


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
| `movement_slow` | -60% × 4s × ~3 enemies | 45 (eff slow weighted) |  | adds | ⚖️ T2 movement_slow AoE anchor. |
| `aoe_cluster` | 10m AoE | 55 (% importance) |  | adds | Mid AoE radius. |
| `spirit_burst_damage` | 95+0.47×30 ≈ 109 within 1s | 109 (raw dmg within 1s) |  | adds | Cast-burst. |
| `spirit_burst_proc` | one big cast proc | 0.40 (proc index) |  | adds | R6: instant. |
| `spirit_damage` | (95+0.47×30)/25 + baseline | 10 (SP-equiv) |  | adds | 5.5 + 4.4. |
| `scaling_early` | greedy spirit caster snowball | 70 (% importance) |  | adds | ⚖️ Greedy early-peak. |
| `engage` | AoE slow = engage | 60 (% importance) |  | adds | R11. |
| `counter_importance` | counter to mobile comps | 50 (% importance) |  | adds | R13. |
| `spirit_resistance` | +6% direct | 6 (eff %) |  | adds | Direct. |


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
| `cooldown_reduction` | +18% direct (imbued) | 18 (eff CDR %) |  | adds | ⚖️ T2 imbued CDR anchor. |
| `single_ability_focus` | imbues one ability | 55 (% importance) |  | adds | R17. |
| `ability_spam` | CDR enables more casts | 45 (% importance) |  | adds | R20. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |


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
| `duration_dependant` | +22% direct (imbued) | 22 (eff %) |  | adds | ⚖️ T2 imbued duration anchor. |
| `single_ability_focus` | imbues one ability | 55 (% importance) |  | adds | R17. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |


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
| `spirit_damage` | +18 SP direct + T2 baseline | 24 (SP-equiv) |  | adds | ⚖️ T2 spirit_damage anchor. 5.5 + 18. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) |  | adds | R2. |
| `self_heal` | +1.5 OOC × 20s | 30 (HP total) |  | adds | Small OOC. |


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
| `movement_slow` | -30% × 2s × ~2 enemies × spirit uptime | 18 (eff slow weighted) |  | adds | Spirit-trigger gates. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) |  | adds | Explicit. |
| `counter_importance` | counter to mobility comps | 45 (% importance) |  | adds | R13. |
| `horizontal_mobility` | +0.75m sprint | 0.5 (m/s eff) |  | adds | Direct. |


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
| `spirit_resist_shred` | -8% × ~0.8 spirit-uptime | 7 (eff shred %) |  | adds | ⚖️ T2 spirit_resist_shred component anchor. |
| `spirit_resistance` | +8% direct | 8 (eff %) |  | adds | Direct. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `counter_importance` | vs spirit-resist tanks | 40 (% importance) |  | adds | R13. |


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
| `hybrid_damage_usage` | imbued bullets + spirit dmg + reload | 70 (% importance) |  | adds | ⚖️ T2 hybrid anchor. |
| `charge_dependant` | Charge-Up mechanic per Notes | 65 (% importance) |  | adds | ⚖️ T2 charge-up anchor. |
| `fire_rate` | +10% × ~0.5 charge uptime | 5 (eff %) |  | adds | Active-only. |
| `spirit_burst_damage` | 44+0.16×30 ≈ 49 within 1s | 49 (raw dmg within 1s) |  | adds | One-shot imbued. |
| `spirit_damage` | (~49 dmg per charge) + baseline | 11 (SP-equiv) |  | adds | 5.5 + ~5.5. |
| `bullet_damage` | T2 baseline (Spirit item, no Weapon baseline) | 0 (eff gun-dmg %) |  | adds | No baseline. |
| `magazine_size_dependant` | 100% reload on imbue trigger | 20 (eff ammo %) |  | adds | Reload skip. |
| `single_ability_focus` | imbues one ability | 50 (% importance) |  | adds | R17. |


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
| `movement_slow` | -20% × 3.5s × 1 target × (3.5/27) | 12 (eff slow weighted) |  | adds | Single-target slow. |
| `silence` | movement-items silenced × 3.5s | 8 (weighted) |  | adds | ⚖️ Targeted movement-silence. |
| `counter_importance` | anti-mobility lockdown | 75 (% importance) |  | adds | ⚖️ Named anti-mobility T2. |
| `single_target` | per-target lockdown | 55 (% importance) |  | adds | Targeted cast. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `horizontal_mobility` | +0.5m sprint | 0.35 (m/s eff) |  | adds | Direct. |
| `engage` | anti-escape commits engage | 50 (% importance) |  | adds | R11. |


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
| `spirit_resist_shred` | -9% × (12/18) uptime | 6 (eff shred %) |  | adds | Active uptime. |
| `counter_importance` | counter to caster comps | 70 (% importance) |  | adds | ⚖️ Named anti-caster T2. |
| `debuff` | resist + SP drain | 45 (% importance) |  | adds | Dual debuff. |
| `single_target` | per-target debuff | 60 (% importance) |  | adds | Targeted. |
| `spirit_damage` | T2 baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) |  | adds | Explicit. |


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
| `fire_rate_slow` | -28% × 5s × ~2 enemies × spirit uptime | 30 (eff slow %) |  | adds | ⚖️ T2 fire_rate_slow Spirit anchor. |
| `counter_importance` | anti-DPS via spirit | 55 (% importance) |  | adds | R13. |
| `spirit_damage` | +6 SP + T2 baseline | 12 (SP-equiv) |  | adds | 5.5 + 6. |
| `bullet_resistance` | +8% direct | 8 (eff %) |  | adds | Direct. |
| `hybrid_damage_usage` | spirit triggers anti-gun | 50 (% importance) |  | adds | Hybrid bridge. |
| `debuff` | FR slow debuff | 35 (% importance) |  | adds | Anti-gun debuff. |


---
