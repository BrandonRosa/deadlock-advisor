# T2 (1600 souls)

## Active Reload
- **normalized_name**: `active_reload` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_active_reload`
- **wiki**: https://deadlock.wiki/Active_Reload

### Interpretation
Active-triggered reload + 7s buff window: +25% Fire Rate, +16% Bullet Lifesteal, +0.75m Move Speed. The T2 gun-burst enabler — instant-reload + post-reload power spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Fire Rate Conditional | +25% | Active (post-reload buff) |
| Bullet Lifesteal Conditional | +16% | Active (post-reload buff) |
| Move Speed | +0.75m | Active (post-reload buff) |
| Duration | 7s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +20% ammo + instant-reload | 32 (eff ammo %) |  | adds | 20% explicit + instant-reload bump (per 01 convention). |
| `fire_rate` | +25% × ~7/14 active uptime | 12 (eff %) |  | adds | Active conditional, ~50% uptime in fights. |
| `bullet_lifesteal` | +16% × uptime | 8 (eff %) |  | adds | 16 × ~0.5 active uptime. |
| `gun_burst_damage` | post-reload burst window + fire-rate burst | 20 (dmg-% within 1s) |  | adds | R2: fire_rate lifts gun_burst MORE than continuous (DPS in 1s window). |
| `gun_continuous_damage` | sustained DPS during buff | 8 (dmg-% outside 1s) |  | adds | R2: continuous gets lighter fire-rate credit. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31 implicit T2 baseline. |
| `horizontal_mobility` | +0.75m × uptime | 0.4 (m/s eff) |  | adds | 0.75 × ~0.5 active uptime. |
| `self_heal` | lifesteal heal during buff | 30 (HP total) |  | adds | 16% lifesteal × burst DPS over the 7s window. |
| `burst_heal` | first-1s of lifesteal | 6 (HP within 1s) |  | adds | One trigger-window worth of lifesteal. |
| `continous_heal` | rest of lifesteal | 24 (HP outside 1s) |  | adds | Lifesteal sustained over remaining 6s window. |

---

## Fleetfoot
- **normalized_name**: `fleetfoot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_fleetfoot_boots`
- **wiki**: https://deadlock.wiki/Fleetfoot

### Interpretation
Hybrid mobility/defense weapon: +6% Wpn Dmg, +35% Slide Distance, +6% Bullet Resist passive; active +3m Move Speed + 40% Slow Resist for 5s. Cleanse-flavored mobility booster.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Slide Distance | +35% | Passive |
| Bullet Resist | +6% | Passive |
| Move Speed Conditional | +3m | Active |
| Slow Resist | +40% | Active |
| Duration | 5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +3m × 5/15 active + 35% slide | 1.2 (m/s eff) |  | adds | Active 3m × (5/15 uptime) = 1.0; + slide-distance contribution. |
| `cc_resist` | +40% Slow Resist × 5/15 uptime | 13 (eff %) |  | adds | 40 × 0.33. |
| `bullet_resistance` | +6% Bullet Resist passive | 6 (eff %) |  | adds | Full uptime. |
| `bullet_damage` | +6% + T2 baseline | 13.2 (eff gun-dmg %) |  | adds | 6 + 7.2 T2 baseline. |
| `gun_burst_damage` | per-shot lift | 7 (dmg-% within 1s) |  | adds | R2 — bullet_damage equal both. |
| `gun_continuous_damage` | sustained lift | 7 (dmg-% outside 1s) |  | adds | R2. |
| `escape` | +Move Speed + slow resist | 55 (% importance) |  | adds | Mobility + cleanse → disengage. |
| `engage` | also helps gap-close | 35 (% importance) |  | adds | Same speed buff. |
| `counter_importance` | cleanses slows | 45 (% importance) |  | adds | R13. |
| `farmer` | mobility helps farm | 25 (% importance) |  | adds | R28. |

---

## Intensifying Magazine
- **normalized_name**: `intensifying_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_intensifying_clip`
- **wiki**: https://deadlock.wiki/Intensifying_Magazine

### Interpretation
Sustained-fire ramp-up: +20% Max Ammo and up-to-45% Max Weapon Damage that ramps over 2.5s of continuous fire. The named anchor for `gun_continuous_damage` at T2.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Max Weapon Damage Conditional | 45% | Passive (ramped over 2.5s) |
| Time for Max Damage | 2.5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +20% ammo | 20 (eff ammo %) |  | adds | Pure passive ammo. |
| `gun_continuous_damage` | ramp to 45% wpn dmg @ 2.5s sustained | 30 (dmg-% outside 1s) |  | adds | Avg ~30% across sustained fire (ramp-in 0→45). Named anchor for sustained gun. |
| `gun_burst_damage` | first 1s only at ramp-start | 9 (dmg-% within 1s) |  | adds | First-1s window is below max — ramp doesn't favor burst. |
| `bullet_damage` | avg amp + T2 baseline | 29.7 (eff gun-dmg %) |  | adds | Avg 45/2 = 22.5 + 7.2 baseline. |
| `bullet_damage` | scales with sustained-fire build | 30 (eff gun-dmg %) |  | relies | The 45% only realizes when player commits to long bursts. |
| `gun_continuous_proc` | rewards sustained fire | 0.4 (proc index) |  | adds | Long-pressure-trigger flavor. |

---

## Kinetic Dash
- **normalized_name**: `kinetic_dash` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_kinetic_sash`
- **wiki**: https://deadlock.wiki/Kinetic_Dash

### Interpretation
Stamina-bundle weapon: +1 Stamina, +12% Stamina Recovery, plus a 7s post-dash buff (+25% Fire Rate, +6 Temp Ammo). R9 stamina-suite item; dash triggers a burst gun spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Fire Rate Conditional | +25% | Active (post-dash buff) |
| Temporary Ammo Conditional | +6 | Active |
| Duration | 7s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +1 stamina | 1 (units) |  | adds | R9. |
| `horizontal_mobility` | +1 stamina dash | 0.7 (m/s eff) |  | adds | R9: 0.6–0.7 m/s. |
| `aerial` | extra dash | 40 (% importance) |  | adds | R9. |
| `engage` | dash + post-dash buff | 60 (% importance) |  | adds | R9 + engage flavor. |
| `escape` | dash | 40 (% importance) |  | adds | R9. |
| `fire_rate` | +25% × 7/14 uptime | 12 (eff %) |  | adds | Active uptime. |
| `magazine_size_dependant` | +6 temp ammo × uptime | 12 (eff ammo %) |  | adds | Conditional ammo. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `gun_burst_damage` | post-dash burst window | 18 (dmg-% within 1s) |  | adds | R2 (fire_rate lifts burst heavier). |
| `gun_continuous_damage` | sustained DPS during buff | 7 (dmg-% outside 1s) |  | adds | R2 lighter. |
| `farmer` | dash mobility + ammo | 30 (% importance) |  | adds | R28. |

---

## Long Range
- **normalized_name**: `long_range` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_long_range`
- **wiki**: https://deadlock.wiki/Long_Range

### Interpretation
Range-gated weapon amp: +40% Weapon Damage past 15m, +8% fall-off, +0.75m Sprint. The T2 long-range named anchor — pure scope kit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Fall-off Range | +8% | Passive |
| Sprint Speed | +0.75m | Passive |
| Weapon Damage Conditional | +40% | Passive (>15m) |
| Min. Distance | 15m | Condition |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | +40% wpn dmg >15m | 70 (% importance) |  | adds | T2 named long-range anchor. |
| `bullet_damage` | +40% × long-range uptime + T2 baseline | 25.2 (eff gun-dmg %) |  | adds | (40 × ~0.45 long-range uptime) + 7.2 baseline. |
| `bullet_damage` | scales with long-range build | 40 (eff gun-dmg %) |  | relies | The 40% only realizes when actively at range. |
| `close_range` | nothing past 15m | -30 (% importance) |  | adds | Mirror R30 anti-close. |
| `gun_burst_damage` | per-shot amp lifts burst | 18 (dmg-% within 1s) |  | adds | R2 equal. |
| `gun_continuous_damage` | sustained lift | 18 (dmg-% outside 1s) |  | adds | R2 equal. |
| `single_target` | scope shots | 35 (% importance) |  | adds | Long-range tends single-target. |
| `horizontal_mobility` | +0.75m sprint-only | 0.4 (m/s eff) |  | adds | Sprint-only ×0.5. |

---

## Melee Charge
- **normalized_name**: `melee_charge` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_melee_charge`
- **wiki**: https://deadlock.wiki/Melee_Charge

### Interpretation
Heavy-melee amplifier: +50% Heavy Melee Distance, +10% Melee Damage, +6% Bullet Resist, +25% Bonus Heavy Damage. The T2 melee anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +50% | Passive |
| Melee Damage | +10% | Passive |
| Bullet Resist | +6% | Passive |
| Bonus Heavy Damage | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +10% melee + +25% heavy + 50% range | 32 (eff melee-dmg %) |  | adds | T2 melee combining direct dmg, heavy-dmg amp, and reach. |
| `close_range` | melee-only mechanic | 85 (% importance) |  | adds | R21. |
| `long_range` | anti-affinity | -40 (% importance) |  | adds | R30. |
| `bullet_resistance` | +6% Bullet Resist | 6 (eff %) |  | adds | Full passive. |
| `engage` | heavy melee = engage tool | 65 (% importance) |  | adds | R11. |
| `grounded` | melee = grounded | 50 (% importance) |  | adds | R7. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `gun_burst_damage` | baseline floor | 4 (dmg-% within 1s) |  | adds | R2 floor from baseline. |
| `gun_continuous_damage` | baseline floor | 4 (dmg-% outside 1s) |  | adds | R2 floor. |
| `stun` | heavy melee can stun briefly | 0.5 (eff s) |  | adds | Heavy melee stagger window. |

---

## Mystic Shot
- **normalized_name**: `mystic_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_crackshot`
- **wiki**: https://deadlock.wiki/Mystic_Shot

### Interpretation
Hybrid Weapon/Spirit proc: +7 SP flat + spirit-damage proc (40 + 1.2×SP) per shot. Classic hybrid-damage T2 anchor — gun trigger drives spirit damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Spirit Damage Proc | 40 + 1.2×SP | Passive (per-shot trigger) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 7 SP flat + (40+1.2×20)/5 proc | 19.8 (SP-equiv) |  | adds | Per 01: 7 + (40+24)/5 = 7 + 12.8. |
| `spirit_damage` | proc scales with SP | 24 (SP-equiv) |  | relies | The 1.2×SP scaling. |
| `spirit_burst_proc` | proc on each shot | 0.7 (proc index) |  | adds | Burst per-shot, short window. |
| `spirit_continuous_proc` | sustained shot stream | 0.2 (proc index) |  | adds | Continuous: every shot procs. |
| `spirit_burst_damage` | per-shot spirit dmg in 1s | 64 (raw dmg within 1s) |  | adds | (40+1.2×20) = 64 raw spirit dmg per proc. |
| `spirit_continuous_damage` | sustained spirit | 96 (raw dmg outside 1s) |  | adds | ~1.5 procs/s sustained × 64 dmg. |
| `hybrid_damage_usage` | gun trigger + spirit damage | 80 (% importance) |  | adds | The double-dip case. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `multi_ability_focus` | SP lifts all abilities | 25 (% importance) |  | adds | R4. |

---

## Opening Rounds
- **normalized_name**: `opening_rounds` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_pristine_emblem`
- **wiki**: https://deadlock.wiki/Opening_Rounds

### Interpretation
Opening-fight gun spike: +60% Bullet Velocity, +8% Wpn Dmg, +4 SP passive, plus +30% Weapon Damage Conditional (on fresh engagement). Greedy `scaling_early` flavor — wins the opener-burst trade. R32: long_range capped <1.5 (Sharpshooter is the 2.0 anchor).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Spirit Power | +4 | Passive |
| Weapon Damage Conditional | +30% | Conditional (fight opener) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_buff` | +30% wpn dmg on engage | 45 (% importance) |  | adds | R19: legitimate conditional-uptime buff state. |
| `bullet_damage` | +8% + 30% × opener uptime + T2 baseline | 30.2 (eff gun-dmg %) |  | adds | 8 + (30 × ~0.5 opener-uptime) + 7.2 baseline. |
| `gun_burst_damage` | opener-burst window | 25 (dmg-% within 1s) |  | adds | R2 + opener-burst flavor. |
| `gun_continuous_damage` | sustained lift | 10 (dmg-% outside 1s) |  | adds | R2 — opener fades. |
| `long_range` | +60% bullet velocity helps long | 50 (% importance) |  | adds | Bullet velocity at range. Capped <1.5 per Sharpshooter anchor. |
| `mid_range` | also helps mid | 30 (% importance) |  | adds | Mid-range tracking. |
| `engage` | opener buff = engage flavor | 60 (% importance) |  | adds | Opener mechanic. |
| `spirit_damage` | +4 SP secondary | 4 (SP-equiv) |  | adds | Small. |
| `headshot_damage` | bullet velocity aids headshots | 25 (% importance) |  | adds | Partial. |
| `scaling_early` | greedy opener-burst tempo | 70 (% importance) |  | adds | Opener buff favors early-peak heroes. |

---

## Recharging Rush
- **normalized_name**: `recharging_rush` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_rechargingbullets`
- **wiki**: https://deadlock.wiki/Recharging_Rush

### Interpretation
Mag-recharge gun item: +20% Max Ammo, +10% Weapon Damage, plus a damage-threshold trigger (200 dmg in 3.5s). R5: gets both burst and continuous proc tags.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Weapon Damage | +10% | Passive |
| Damage Threshold | 200 | Passive (trigger) |
| Time Frame | 3.5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +20% ammo + recharge | 25 (eff ammo %) |  | adds | 20% + recharge bump. |
| `bullet_damage` | +10% + T2 baseline | 17.2 (eff gun-dmg %) |  | adds | 10 + 7.2. |
| `gun_burst_damage` | per-shot amp | 10 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained + recharge | 14 (dmg-% outside 1s) |  | adds | R2 + recharge sustains DPS. |
| `gun_burst_proc` | 200dmg/3.5s threshold trigger | 0.9 (proc index) |  | adds | R5: threshold proc, burst-flavor. |
| `gun_continuous_proc` | sustained trigger pace | 0.1 (proc index) |  | adds | R5 weaker continuous. |

---

## Slowing Bullets
- **normalized_name**: `slowing_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_slowing_bullets`
- **wiki**: https://deadlock.wiki/Slowing_Bullets

### Interpretation
On-hit slow weapon: +15% Wpn Dmg, -30% Move Speed and -22% Dash Distance on hit (3.5s). The T2 universal-slow gun mod.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Move Speed Conditional | -30% | Passive (on hit) |
| Dash Distance | -22% | Passive |
| Slow Duration | 3.5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% × 3.5s × ~0.9 on-hit uptime × 1 target | 27 (eff slow weighted) |  | adds | Per 01: slow% × duration × count × uptime. |
| `bullet_damage` | +15% + T2 baseline | 22.2 (eff gun-dmg %) |  | adds | 15 + 7.2. |
| `gun_burst_damage` | per-shot lift | 16 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained lift | 16 (dmg-% outside 1s) |  | adds | R2 equal. |
| `gun_continuous_proc` | every bullet applies slow | 0.5 (proc index) |  | adds | R5 continuous-flavored every-shot proc. |
| `debuff` | enemy slow debuff | 18 (% importance) |  | adds | Cleanseable mild debuff. |
| `counter_importance` | counter to mobile heroes | 45 (% importance) |  | adds | R13. |
| `vertical_mobility` | -22% dash distance (anti) | 10 (units) |  | adds | Dash-restrict anti-vertical. |

---

## Spirit Shredder Bullets
- **normalized_name**: `spirit_shredder_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_tech_defense_shredders`
- **wiki**: https://deadlock.wiki/Spirit_Shredder_Bullets

### Interpretation
On-hit gun proc: -8% Spirit Resist (shred) and +10% Spirit Lifesteal conditional, 8s. The T2 gun-driven spirit-resist shred.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist Conditional | -8% | Passive (debuff on hit) |
| Spirit Lifesteal Conditional | +10% | Passive (self-buff) |
| Debuff Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% × 8s × on-hit uptime | 6 (eff shred %) |  | adds | 8 × ~0.75 maintain. |
| `spirit_lifesteal` | +10% conditional | 6 (eff %) |  | adds | 10 × ~0.6 uptime. |
| `gun_continuous_proc` | every bullet applies shred | 0.35 (proc index) |  | adds | R5 continuous-flavor proc. |
| `gun_burst_proc` | first-shot proc | 0.4 (proc index) |  | adds | R5 burst-flavor. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `debuff` | enemy spirit-resist shred | 20 (% importance) |  | adds | Mild debuff. |

---

## Split Shot
- **normalized_name**: `split_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_split_shot`
- **wiki**: https://deadlock.wiki/Split_Shot

### Interpretation
Active multishot: 5 weapon multishot during buff; stacks (max 5) of +8% Wpn Dmg per stack. AoE/cluster-flavored weapon item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Multishot Conditional | 5 | Active |
| Weapon Damage per Stack | +8% | Active |
| Buff Duration | 5s | Active |
| Max Stacks | 5 | Active |
| Stack Duration | 12s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 5 multishot during active | 65 (% importance) |  | adds | Multi-shot = AoE clustering. |
| `bullet_damage` | up to +40% × uptime + T2 baseline | 19.2 (eff gun-dmg %) |  | adds | (8×5) × (5/20 uptime) × 0.6 stack-build + 7.2 baseline = 12 + 7.2. |
| `gun_burst_damage` | burst window during 5s active | 22 (dmg-% within 1s) |  | adds | R2 + multishot burst within active. |
| `gun_continuous_damage` | stack buildup over fight | 14 (dmg-% outside 1s) |  | adds | R2. |
| `farmer` | multishot clears NPCs | 40 (% importance) |  | adds | R28: cap 50. |

---

## Stalker
- **normalized_name**: `stalker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_weapon_backstabber`
- **wiki**: https://deadlock.wiki/Stalker

### Interpretation
Close-range stealth flank weapon: -50% footstep sound, +50 HP; 17 DPS, -6% Bullet Resist, +1.5m Move Speed when within 8m. The flank-assassin T2 item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Footstep Sound Distance | -50% | Passive |
| Bonus Health | +50 | Passive |
| Damage Per Second | 17 | Passive (close-range) |
| Bullet Resist Conditional | -6% | Passive (debuff on victim) |
| Move Speed Conditional | +1.5m | Passive (close-range) |
| Debuff Duration | 5s | Passive |
| Close Range | 8m | Trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `close_range` | DPS & buffs only within 8m | 80 (% importance) |  | adds | R21 close-only. |
| `long_range` | anti-affinity | -35 (% importance) |  | adds | R30. |
| `bullet_damage` | T2 weapon baseline (17 DPS is hero-targeted close DoT) | 7.2 (eff gun-dmg %) |  | adds | R31. (17 DPS captured in continuous_damage rows.) |
| `bullet_resist_shred` | -6% × duration × on-hit | 5 (eff shred %) |  | adds | 6 × ~0.8 close-range uptime. |
| `gun_continuous_damage` | 17 DPS sustained close | 17 (raw dmg outside 1s) |  | adds | DoT-style sustained DPS. |
| `gun_burst_damage` | small burst from DoT first 1s | 17 (raw dmg within 1s) |  | adds | DoT first tick. |
| `horizontal_mobility` | +1.5m close-range buff | 0.7 (m/s eff) |  | adds | 1.5 × ~0.45 close-range uptime. |
| `engage` | close-flank engage | 60 (% importance) |  | adds | R11/R30. |
| `high_max_hp` | +50 HP explicit | 50 (HP) |  | adds | Weapon item, only explicit HP. |
| `away_from_team` | flank tool | 50 (% importance) |  | adds | Sneak-flank flavor. |
| `assist_importance` | flank picks help team | 25 (% importance) |  | adds | Partial. |

---

## Swift Striker
- **normalized_name**: `swift_striker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_blitz_bullets`
- **wiki**: https://deadlock.wiki/Swift_Striker

### Interpretation
Pure passive fire-rate + sprint: +20% Fire Rate, +0.75m Sprint Speed. The clean T2 fire-rate baseline.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +20% | Passive |
| Sprint Speed | +0.75m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +20% Fire Rate passive | 20 (eff %) |  | adds | T2 clean passive fire-rate. |
| `horizontal_mobility` | +0.75m sprint-only | 0.4 (m/s eff) |  | adds | Sprint-only ×0.5. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `gun_burst_damage` | RPM lifts burst | 20 (dmg-% within 1s) |  | adds | R2 corrected: fire_rate lifts burst more — DPS in 1s window. |
| `gun_continuous_damage` | sustained mild lift | 10 (dmg-% outside 1s) |  | adds | R2 corrected lighter. |
| `farmer` | mobility + RPM | 25 (% importance) |  | adds | R28. |

---

## Titanic Magazine
- **normalized_name**: `titanic_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_titan_round`
- **wiki**: https://deadlock.wiki/Titanic_Magazine

### Interpretation
Massive flat passive: +100% Max Ammo, +14% Weapon Damage. The game-wide 2.0 outlier anchor for `magazine_size_dependant` per 03_normalization (with outlier protection on neighbors).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +100% | Passive |
| Weapon Damage | +14% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +100% Max Ammo passive | 100 (eff ammo %) |  | adds | Game-wide 2.0 anchor. |
| `bullet_damage` | +14% + T2 baseline | 21.2 (eff gun-dmg %) |  | adds | 14 + 7.2. |
| `gun_continuous_damage` | huge mag = sustained fire | 28 (dmg-% outside 1s) |  | adds | R2 + mag heavily lifts continuous. |
| `gun_burst_damage` | per-shot amp only (mag doesn't lift burst) | 14 (dmg-% within 1s) |  | adds | R2: bullet_damage lifts burst, mag doesn't. |
| `farmer` | massive mag clears waves | 40 (% importance) |  | adds | R28. |

---

## Weakening Headshot
- **normalized_name**: `weakening_headshot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_headshot_booster2`
- **wiki**: https://deadlock.wiki/Weakening_Headshot

### Interpretation
On-headshot debuff: -13% Bullet Resist on enemy for 12s, +60 HP. T2 bullet_resist_shred via headshot trigger.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +60 | Passive |
| Bullet Resist Conditional | -13% | Passive (on headshot) |
| Debuff Duration | 12s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -13% × 12s × headshot uptime | 9 (eff shred %) |  | adds | 13 × ~0.7 headshot-maintenance. |
| `headshot_damage` | rewards landing heads | 30 (% importance) |  | adds | Importance % for headshot trigger. |
| `gun_burst_proc` | first-head proc | 0.7 (proc index) |  | adds | Burst-flavor. |
| `bullet_damage` | T2 weapon baseline | 7.2 (eff gun-dmg %) |  | adds | R31. |
| `high_max_hp` | +60 HP explicit | 60 (HP) |  | adds | Weapon item. |
| `single_target` | headshot is single-target | 35 (% importance) |  | adds | Targeted. |
| `debuff` | enemy resist debuff | 22 (% importance) |  | adds | Mild. |

---

## Battle Vest
- **normalized_name**: `battle_vest` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_regenerating_bullet_shield`
- **wiki**: https://deadlock.wiki/Battle_Vest

### Interpretation
Hybrid defensive/offensive: +18% Bullet Resist, +3 OOC Regen, +18% Wpn Dmg conditional, +7% Fire Rate conditional. Defensive item with gun-amp synergy.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +18% | Passive |
| Out of Combat Regen | +3 | Passive |
| Weapon Damage Conditional | +18% | Passive (conditional) |
| Fire Rate Conditional | +7% | Passive (conditional) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +18% Bullet Resist | 18 (eff %) |  | adds | Full passive. |
| `melee_resistance` | bullet resist → pseudo melee | 9 (eff %) |  | adds | Per 01 pseudo (~0.5x). |
| `bullet_damage` | +18% × ~0.5 uptime | 9 (eff gun-dmg %) |  | adds | Conditional × uptime. (Vitality item — no R31 weapon baseline.) |
| `fire_rate` | +7% × uptime | 4 (eff %) |  | adds | Conditional. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +3 OOC | 14 (HP total) |  | adds | 3 × 15 × 0.3 = 13.5 HP cycle. |
| `continous_heal` | +3 OOC outside 1s | 12.6 (HP outside 1s) |  | adds | 3 × 14 × 0.3 = 12.6. |
| `burst_heal` | +3 OOC first 1s | 0.9 (HP within 1s) |  | adds | Small initial tick. |
| `gun_burst_damage` | per-shot amp + fire-rate burst | 14 (dmg-% within 1s) |  | adds | R2 corrected (fire_rate lifts burst more). |
| `gun_continuous_damage` | sustained lift | 6 (dmg-% outside 1s) |  | adds | R2 lighter. |
| `damage_sponge` | conditional damage when hit | 35 (% importance) |  | relies | R26: conditional likely triggers on being damaged. |

---

## Bullet Lifesteal
- **normalized_name**: `bullet_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vampire`
- **wiki**: https://deadlock.wiki/Bullet_Lifesteal_(item)

### Interpretation
Pure passive bullet lifesteal: +13% Bullet Lifesteal, +90 HP, +6% Wpn Dmg. The T2 raw bullet-lifesteal baseline (Vampiric Burst T4 is the effective 2.0 anchor).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Weapon Damage | +6% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +13% passive | 13 (eff %) |  | adds | Direct passive. |
| `self_heal` | lifesteal-as-heal (per fight) | 80 (HP total) |  | adds | 13% of typical 600 gun dmg dealt = ~78 HP per fight. |
| `continous_heal` | sustained lifesteal | 70 (HP outside 1s) |  | adds | Lifesteal pings outside the 1s window. |
| `burst_heal` | first-1s of lifesteal | 10 (HP within 1s) |  | adds | First burst of shots. |
| `high_max_hp` | +90 HP + T2 baseline | 112 (HP) |  | adds | 90 + 22. |
| `high_max_hp` | lifesteal scales with HP cushion | 18 (HP) |  | relies | R8/R10. |
| `bullet_damage` | +6% (Vitality item, no baseline) | 6 (eff gun-dmg %) |  | adds | Direct. |
| `gun_burst_damage` | per-shot amp | 6 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained DPS w/ sustain | 6 (dmg-% outside 1s) |  | adds | R2. |
| `damage_sponge` | lifesteal rewards taking damage (incidental) | 25 (% importance) |  | relies | R26 partial. |

---

## Debuff Reducer
- **normalized_name**: `debuff_reducer` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_debuff_reducer`
- **wiki**: https://deadlock.wiki/Debuff_Reducer

### Interpretation
Pure passive debuff resistance: +90 HP, +25% Debuff Resist. The T2 anti-CC defensive.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +90 | Passive |
| Debuff Resist | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `debuff_resistance` | +25% Debuff Resist | 25 (eff %) |  | adds | Direct. |
| `cc_resist` | duration-reduction covers slow/stun | 18 (eff %) |  | adds | Per 04 judgment — debuff reducer also blunts CC. |
| `high_max_hp` | +90 + T2 baseline | 112 (HP) |  | adds | 90 + 22. |
| `counter_importance` | tactical counter to CC | 65 (% importance) |  | adds | R13/R27. |
| `damage_sponge` | HP/CC-tank synergy (incidental) | 30 (% importance) |  | relies | R26. |

---

## Enchanters Emblem
- **normalized_name**: `enchanters_emblem` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_magic_shield`
- **wiki**: https://deadlock.wiki/Enchanter's_Emblem

### Interpretation
Hybrid spirit-defense/offense: +18% Spirit Resist, +2 OOC Regen, +15 SP, +5% Ability CDR. Strong dual-purpose T2 item for spirit casters.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +18% | Passive |
| Out of Combat Regen | +2 | Passive |
| Spirit Power | +15 | Passive |
| Ability Cooldown Reduction | +5% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +18% Spirit Resist | 18 (eff %) |  | adds | Full passive. |
| `spirit_damage` | +15 SP (Vitality item, no SP baseline) | 15 (SP-equiv) |  | adds | Direct flat. |
| `spirit_burst_damage` | SP lifts spirit burst | 12 (dmg-equiv within 1s) |  | adds | R2 (equal lift). |
| `spirit_continuous_damage` | SP lifts sustained | 12 (dmg-equiv outside 1s) |  | adds | R2. |
| `cooldown_reduction` | +5% CDR | 5 (eff CDR %) |  | adds | Direct passive CDR. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2 OOC | 9 (HP total) |  | adds | 2 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) |  | adds | 2 × 14 × 0.3. |
| `burst_heal` | OOC first 1s | 0.6 (HP within 1s) |  | adds | Small. |
| `multi_ability_focus` | SP + CDR universal | 50 (% importance) |  | adds | R4. |
| `hybrid_damage_usage` | broadly slotted in spirit kits | 10 (% importance) |  | adds | Small partial. |

---

## Enduring Speed
- **normalized_name**: `enduring_speed` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_cardio_calibrator`
- **wiki**: https://deadlock.wiki/Enduring_Speed

### Interpretation
Universal mobility + cleanse: +2m Move Speed, +2 OOC Regen, +25% Slow Resist. Per 04 judgment: slow-resist → `cc_resist`, NOT `debuff_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Move Speed | +2m | Passive |
| Out of Combat Regen | +2 | Passive |
| Slow Resist | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m universal MS | 2.0 (m/s eff) |  | adds | Universal — full credit. |
| `cc_resist` | +25% Slow Resist | 25 (eff %) |  | adds | Per 04: slow-resist → cc_resist. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2 OOC | 9 (HP total) |  | adds | Standard. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) |  | adds | Same. |
| `burst_heal` | OOC first 1s | 0.6 (HP within 1s) |  | adds | Small. |
| `escape` | high MS + slow resist | 60 (% importance) |  | adds | Escape-focused. |
| `engage` | universal MS helps engage too | 35 (% importance) |  | adds | Smaller credit. |
| `farmer` | mobility helps farm | 30 (% importance) |  | adds | R28/R14. |
| `counter_importance` | counter to slow comps | 40 (% importance) |  | adds | R13. |
| `small_hitbox` | mobility partial | 20 (% importance) |  | adds | R26 incidental. |

---

## Guardian Ward
- **normalized_name**: `guardian_ward` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_guardian_ward`
- **wiki**: https://deadlock.wiki/Guardian_Ward

### Interpretation
Active ally-target barrier + MS: 250 barrier, +2.75m MS, 6s, 40m cast. The T2 ally-support shield item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +8% | Passive |
| Out of Combat Regen | +1.5 | Passive |
| Barrier Conditional | 250 | Active |
| Move Speed Conditional | +2.75m | Active |
| Buff Duration | 6s | Active |
| Cast Range | 40m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 250 barrier active | 100 (shield HP) |  | adds | 250 × ~0.4 uptime weight. |
| `team_heal` | ally-target shield value | 100 (HP total) |  | adds | Ally-target shield = team_heal cross-credit. |
| `assist_importance` | ally-target active | 75 (% importance) |  | adds | R27: niche ally-focused. |
| `horizontal_mobility` | +2.75m active to ally | 1.0 (m/s eff) |  | adds | Cast on ally — partial self-credit. |
| `range_extender_dependant` | +8% Ability Range | 8 (eff %) |  | adds | Direct. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +1.5 OOC | 7 (HP total) |  | adds | 1.5 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 6.5 (HP outside 1s) |  | adds | 1.5 × 14 × 0.3. |
| `close_to_team` | ally-aim incentivizes proximity | 30 (% importance) |  | adds | 40m cast range but proximity rewarded. |
| `counter_importance` | shield save vs burst | 40 (% importance) |  | adds | R13. |

---

## Healbane
- **normalized_name**: `healbane` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healbane`
- **wiki**: https://deadlock.wiki/Healbane

### Interpretation
Anti-heal trigger: +7 SP, -35% Healing Reduction conditional, 275 heal-on-hero-kill, 8s. The T2 dedicated anti-heal item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Healing Reduction Conditional | -35% | Passive (on-hit/on-trigger) |
| Heal On Hero Kill | 275 | Passive |
| Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -35% × 8s × on-hit uptime | 28 (eff %) |  | adds | 35 × ~0.8 uptime. T2 dedicated. |
| `counter_importance` | dedicated anti-heal counter | 75 (% importance) |  | adds | R27: niche counter, high score. |
| `self_heal` | 275 heal on hero kill (avg per fight) | 80 (HP total) |  | adds | ~0.3 kills/fight × 275 HP. |
| `burst_heal` | 275 on kill is burst-flavor | 80 (HP within 1s) |  | adds | Single-tick heal on kill. |
| `assist_importance` | kill-trigger covers assists | 25 (% importance) |  | adds | Per 01: kills count as assists. |
| `spirit_damage` | +7 SP (Vitality item, no SP baseline) | 7 (SP-equiv) |  | adds | Direct flat. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `high_kill_count` | kill-trigger reward | 35 (% importance) |  | adds | Item rewards securing kills. |

---

## Healing Booster
- **normalized_name**: `healing_booster` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healing_booster`
- **wiki**: https://deadlock.wiki/Healing_Booster

### Interpretation
Pure heal-amp + passive regen: +3 HP/s, +1 OOC, +20% Healing Effectiveness. Per 04 judgment: meaningful self_heal credit too.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +3 | Passive |
| Out of Combat Regen | +1 | Passive |
| Healing Effectiveness | +20% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `team_heal` | +20% heal amp on teammates | 50 (HP total) |  | adds | Amp benefits ally heals received. |
| `continous_heal` | 3 HP/s × 29s post-fight + OOC | 80 (HP outside 1s) |  | adds | 3×(30−1) + 1×(15−1)×0.3 ≈ 87 + 4 (amp lift) total. |
| `burst_heal` | first 1s | 4 (HP within 1s) |  | adds | 3 + small OOC contribution. |
| `self_heal` | total HP per cycle | 95 (HP total) |  | adds | Sum. |
| `assist_importance` | heal amp helps allies | 50 (% importance) |  | adds | R27: hybrid utility. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `high_max_hp` | heal scales with HP | 20 (HP) |  | relies | R8. |
| `farmer` | sustain → farm uptime | 30 (% importance) |  | adds | R28. |

---

## Reactive Barrier
- **normalized_name**: `reactive_barrier` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vex_barrier`
- **wiki**: https://deadlock.wiki/Reactive_Barrier

### Interpretation
On-damage shield trigger: 325 + 1.8×SP barrier, 10s. The T2 damage-sponge shield-on-hit item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +1 | Passive |
| Barrier Conditional | 325 + 1.8×SP | Passive (on damage taken) |
| Duration | 10s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 325 + 1.8×SP barrier | 361 (shield HP) |  | adds | 325 + 1.8×20 = 361 effective. |
| `damage_sponge` | shield-on-damage trigger | 70 (% importance) |  | adds | R26 — this IS the item's purpose. |
| `burst_resistance` | shield absorbs incoming burst | 40 (eff %) |  | adds | Per 01: shield-on-damage = full credit toward burst_resistance. |
| `bullet_resistance` | reduces incoming bullet | 8 (eff %) |  | adds | Per 01 pseudo: shield ~0.6x. |
| `spirit_resistance` | reduces incoming spirit | 8 (eff %) |  | adds | Same pseudo. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `high_max_hp` | shield = effective HP buff | 30 (HP) |  | relies | R8/R10. |
| `self_heal` | +1 OOC | 4.5 (HP total) |  | adds | Small. |
| `counter_importance` | reactive vs burst | 50 (% importance) |  | adds | R13. |
| `spirit_damage` | barrier scales with SP | 7 (SP-equiv) |  | relies | The 1.8×SP scaling. |

---

## Restorative Locket
- **normalized_name**: `restorative_locket` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_restorative_locket`
- **wiki**: https://deadlock.wiki/Restorative_Locket

### Interpretation
Active stack-consume heal: 16 heal/stack (25 max → 400 burst), 3 max stamina restored. Hybrid burst-heal anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heal Per Stack | 16 | Active |
| Max Stacks | 25 | Active |
| Max Stamina Restore | 3 | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | up to 400 HP burst self-cast | 220 (HP total) |  | adds | ~14 stacks × 16 = 220 typical self-cast. |
| `team_heal` | ally-cast option | 110 (HP total) |  | adds | ~50/50 self/ally split. |
| `burst_heal` | single-tick stack heal | 220 (HP within 1s) |  | adds | Burst-flavor: instant heal on cast. |
| `assist_importance` | ally-targetable hybrid | 55 (% importance) |  | adds | R27. |
| `vertical_mobility` | 3 stamina restored | 1 (units) |  | adds | Direct stamina restore. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `high_max_hp` | heal cushion | 18 (HP) |  | relies | R8. |
| `counter_importance` | reactive heal vs burst | 50 (% importance) |  | adds | R13. |
| `farmer` | sustain enables farm | 25 (% importance) |  | adds | R28. |
| `damage_sponge` | stack-build flavor (incidental) | 15 (% importance) |  | relies | R26 small. |

---

## Return Fire
- **normalized_name**: `return_fire` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_return_fire`
- **wiki**: https://deadlock.wiki/Return_Fire

### Interpretation
Active damage-reflect: 65% bullet / 25% spirit returned for 6.5s + 10% Bullet Resist passive. Counter-flavored item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +10% | Passive |
| Bullet Damage Returned | 65% | Active |
| Spirit Damage Returned | 25% | Active |
| Duration | 6.5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +10% passive + 65% return effective | 22 (eff %) |  | adds | 10 + (65 × ~6.5/20 uptime × ~0.5 weighting). |
| `melee_resistance` | bullet resist → pseudo melee | 11 (eff %) |  | adds | Per 01 pseudo ~0.5x. |
| `spirit_resistance` | 25% spirit return × uptime | 8 (eff %) |  | adds | 25 × (6.5/20). |
| `damage_sponge` | reflect-on-damage | 60 (% importance) |  | adds | R26 — purpose-built reflect. |
| `counter_importance` | reactive counter | 60 (% importance) |  | adds | R13. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `bullet_damage` | reflected gun damage | 8 (eff gun-dmg %) |  | adds | Reflect damage counts. |

---

## Spirit Lifesteal
- **normalized_name**: `spirit_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_health_stealing_magic`
- **wiki**: https://deadlock.wiki/Spirit_Lifesteal_(item)

### Interpretation
Pure passive spirit lifesteal: +13% Spirit Lifesteal, +90 HP, +6 SP. T2 spirit-sustain baseline.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Power | +6 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | +13% passive | 13 (eff %) |  | adds | Direct passive. |
| `self_heal` | spirit lifesteal sustain | 70 (HP total) |  | adds | 13% × spirit DPS over fight. |
| `continous_heal` | sustained spirit lifesteal outside 1s | 60 (HP outside 1s) |  | adds | Spirit DoT-style lifesteal pings. |
| `burst_heal` | spirit-burst lifesteal first 1s | 10 (HP within 1s) |  | adds | Initial spirit cast lifesteal. |
| `high_max_hp` | +90 + T2 baseline | 112 (HP) |  | adds | 90 + 22. |
| `high_max_hp` | lifesteal-HP synergy | 18 (HP) |  | relies | R8. |
| `spirit_damage` | +6 SP | 6 (SP-equiv) |  | adds | Flat. |
| `spirit_burst_damage` | SP lifts burst | 5 (dmg-equiv within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts sustained + sustained lifesteal | 8 (dmg-equiv outside 1s) |  | adds | R2 + sustain. |
| `damage_sponge` | lifesteal rewards taking damage (incidental) | 25 (% importance) |  | relies | R26 partial. |

---

## Spirit Shielding
- **normalized_name**: `spirit_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_spirit_bubble`
- **wiki**: https://deadlock.wiki/Spirit_Shielding

### Interpretation
Spirit-proc shield: 300×5 barrier on taking 225 spirit dmg in 3.5s, plus +18% Spirit Resist conditional, 8s barrier duration. Damage-sponge anti-spirit defense.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2.5 | Passive |
| Barrier Conditional | 300 × 5 | Passive (threshold trigger) |
| Spirit Resist Conditional | +18% | Passive |
| Damage Threshold | 225 | Trigger |
| Time Frame | 3.5s | Trigger window |
| Barrier Duration | 8s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 300 × 5 = 1500 amortized × trigger rate | 600 (shield HP) |  | adds | 1500 max × ~0.4 trigger rate. |
| `spirit_resistance` | +18% × proc uptime + shield pseudo | 15 (eff %) |  | adds | Per 01: shield-on-spirit-damage ~0.6x credit. |
| `spirit_burst_resistance` | tanks spirit burst | 45 (eff %) |  | adds | Direct purpose. |
| `spirit_continuous_resistance` | sustained spirit defense | 20 (eff %) |  | adds | Lower weight than burst. |
| `damage_sponge` | shield-on-damage | 55 (% importance) |  | adds | R26 — purpose. |
| `burst_resistance` | shield absorbs burst | 35 (eff %) |  | adds | Per 01. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2.5 OOC | 11 (HP total) |  | adds | 2.5 × 15 × 0.3. |
| `counter_importance` | reactive vs spirit comps | 55 (% importance) |  | adds | R13. |

---

## Weapon Shielding
- **normalized_name**: `weapon_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_weapon_shielding`
- **wiki**: https://deadlock.wiki/Weapon_Shielding

### Interpretation
Mirror of Spirit Shielding for bullet damage: 300×5 barrier on 250 bullet dmg in 4s, +18% Bullet Resist conditional, 8s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2.5 | Passive |
| Barrier Conditional | 300 × 5 | Passive (threshold trigger) |
| Bullet Resist Conditional | +18% | Passive |
| Damage Threshold | 250 | Trigger |
| Time Frame | 4s | Trigger window |
| Barrier Duration | 8s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 300 × 5 amortized | 600 (shield HP) |  | adds | Mirror Spirit Shielding. |
| `bullet_resistance` | +18% × proc uptime + shield pseudo | 15 (eff %) |  | adds | Conditional resist + shield pseudo. |
| `melee_resistance` | bullet resist → pseudo melee | 8 (eff %) |  | adds | Per 01 ~0.5x. |
| `gun_burst_resistance` | tanks gun burst | 45 (eff %) |  | adds | Direct purpose. |
| `gun_continuous_resistance` | sustained gun defense | 20 (eff %) |  | adds | Lower weight. |
| `damage_sponge` | shield-on-damage | 55 (% importance) |  | adds | R26. |
| `burst_resistance` | absorbs burst | 35 (eff %) |  | adds | Per 01. |
| `high_max_hp` | T2 Vitality baseline | 22 (HP) |  | adds | R31. |
| `self_heal` | +2.5 OOC | 11 (HP total) |  | adds | Same formula. |
| `counter_importance` | reactive vs gun comps | 55 (% importance) |  | adds | R13. |

---

## Arcane Surge
- **normalized_name**: `arcane_surge` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_arcane_surge`
- **wiki**: https://deadlock.wiki/Arcane_Surge

### Interpretation
Stamina-bundle Spirit item: +1 Stamina, +12% Stamina Recovery, plus 7s cast-window self-buff (+12% Ability Range, +15% Duration, +20 SP).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Ability Range Conditional | +12% | Passive (post-cast buff) |
| Ability Duration Conditional | +15% | Passive |
| Spirit Power Conditional | +20 | Passive |
| Cast Window | 7s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +1 stamina | 1 (units) |  | adds | R9. |
| `horizontal_mobility` | +1 stamina dash | 0.7 (m/s eff) |  | adds | R9. |
| `aerial` | extra dash | 40 (% importance) |  | adds | R9. |
| `engage` | dash + spirit buff window | 55 (% importance) |  | adds | R9. |
| `escape` | dash | 40 (% importance) |  | adds | R9. |
| `spirit_damage` | +20 SP × uptime + T2 baseline | 15.5 (SP-equiv) |  | adds | (20 × 7/14 uptime) + 5.5 baseline. |
| `range_extender_dependant` | +12% Ability Range × uptime | 6 (eff %) |  | adds | RELY-flavored partial. |
| `duration_dependant` | +15% Ability Duration × uptime | 8 (eff %) |  | adds | Same. |
| `self_buff` | conditional cast-window buff | 55 (% importance) |  | adds | R19 legitimate. |
| `spirit_burst_damage` | SP lifts burst | 8 (dmg-equiv within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts sustained | 8 (dmg-equiv outside 1s) |  | adds | R2. |
| `ability_spam` | cast-window rewards spam | 35 (% importance) |  | adds | The 7s buff incentivizes back-to-back casts. |

---

## Bullet Resist Shredder
- **normalized_name**: `bullet_resist_shredder` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_bullet_resist_shredder`
- **wiki**: https://deadlock.wiki/Bullet_Resist_Shredder

### Interpretation
Hybrid Spirit/Weapon: +9% Bullet Resist, +9% Wpn Dmg passive, plus -10% Bullet Resist debuff on enemy 8s. Anti-gun-tank role.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +9% | Passive |
| Weapon Damage | +9% | Passive |
| Bullet Resist Conditional | -10% | Passive (debuff) |
| Duration | 8s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -10% × 8s × on-hit | 8 (eff shred %) |  | adds | 10 × ~0.8 maintain. |
| `bullet_resistance` | +9% Bullet Resist | 9 (eff %) |  | adds | Passive. |
| `melee_resistance` | bullet resist pseudo | 5 (eff %) |  | adds | Per 01. |
| `bullet_damage` | +9% Wpn Dmg (Spirit item, no weapon baseline) | 9 (eff gun-dmg %) |  | adds | Direct. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `counter_importance` | counter-flavored | 50 (% importance) |  | adds | R13. |
| `gun_burst_damage` | +9% per-shot | 5 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained | 5 (dmg-% outside 1s) |  | adds | R2. |

---

## Cold Front
- **normalized_name**: `cold_front` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_cold_front`
- **wiki**: https://deadlock.wiki/Cold_Front

### Interpretation
Active AoE damage + slow: 95 + 0.47×SP damage, -60% Move Speed in 10m radius, 4s. Greedy `scaling_early` spirit burst — early-peak hero's combo opener.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +6% | Passive |
| Damage | 95 + 0.47×SP | Active |
| Move Speed Conditional | -60% | Active (enemy) |
| Duration | 4s | Active |
| End Radius | 10m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -60% × 4s × ~2 enemies (AoE) | 60 (eff slow weighted) |  | adds | 60 × 1.0 active × 2 AoE-targets average. |
| `spirit_damage` | 95+0.47×SP/5 + T2 baseline | 26.4 (SP-equiv) |  | adds | (95 + 0.47×20)/5 + 5.5 baseline. |
| `spirit_damage` | scales with SP | 9 (SP-equiv) |  | relies | The 0.47×SP scaling. |
| `aoe_cluster` | 10m AoE | 65 (% importance) |  | adds | AoE active. |
| `spirit_burst_damage` | instant SP damage in 1s | 104 (raw dmg within 1s) |  | adds | 95 + 0.47×20 = 104.4 instant. |
| `spirit_continuous_damage` | slow sustains follow-up dmg | 30 (raw dmg outside 1s) |  | adds | Follow-up dmg on slowed targets. |
| `spirit_resistance` | +6% Spirit Resist passive | 6 (eff %) |  | adds | Passive. |
| `spirit_burst_proc` | active proc burst | 1.0 (proc index) |  | adds | Instant trigger, large effect duration. |
| `counter_importance` | slow counter to mobility | 50 (% importance) |  | adds | R13. |
| `debuff` | enemy slow debuff | 25 (% importance) |  | adds | Moderate priority. |
| `scaling_early` | greedy spirit-caster combo opener | 70 (% importance) |  | adds | The named anchor for early-peak greedy spirit-caster items. |

---

## Compress Cooldown
- **normalized_name**: `compress_cooldown` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_tempo`
- **wiki**: https://deadlock.wiki/Compress_Cooldown

### Interpretation
Pure passive CDR: +18% Ability Cooldown Reduction. The clean T2 CDR baseline.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Cooldown Reduction | +18% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +18% CDR | 18 (eff CDR %) |  | adds | Pure passive CDR. |
| `multi_ability_focus` | kit-wide CDR | 60 (% importance) |  | adds | R4: applies to all abilities. |
| `ability_spam` | CDR enables spam | 45 (% importance) |  | adds | Direct enabler. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) |  | adds | R4 small offset. |

---

## Duration Extender
- **normalized_name**: `duration_extender` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_arcane_extension`
- **wiki**: https://deadlock.wiki/Duration_Extender

### Interpretation
Pure passive duration boost: +22% Ability Duration. The T2 duration_dependant adds anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +22% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `duration_dependant` | +22% Ability Duration | 22 (eff %) |  | adds | T2 adds anchor. |
| `multi_ability_focus` | kit-wide duration | 55 (% importance) |  | adds | R4. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) |  | adds | R4. |

---

## Improved Spirit
- **normalized_name**: `improved_spirit` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_soaring_spirit`
- **wiki**: https://deadlock.wiki/Improved_Spirit

### Interpretation
Pure flat SP: +18 Spirit Power, +1.5 OOC Regen. The clean T2 SP baseline (per tag_descriptions anchor: "Improved Spirit").

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +18 | Passive |
| Out of Combat Regen | +1.5 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +18 SP + T2 baseline | 23.5 (SP-equiv) |  | adds | 18 + 5.5. |
| `spirit_burst_damage` | SP lifts burst | 12 (dmg-equiv within 1s) |  | adds | R2 (equal lift). |
| `spirit_continuous_damage` | SP lifts sustained | 12 (dmg-equiv outside 1s) |  | adds | R2. |
| `multi_ability_focus` | SP universal | 55 (% importance) |  | adds | R4. |
| `single_ability_focus` | offsets multi | -20 (% importance) |  | adds | R4. |
| `self_heal` | +1.5 OOC | 7 (HP total) |  | adds | Standard. |
| `continous_heal` | OOC outside 1s | 6.5 (HP outside 1s) |  | adds | 1.5 × 14 × 0.3. |

---

## Mystic Slow
- **normalized_name**: `mystic_slow` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_slow`
- **wiki**: https://deadlock.wiki/Mystic_Slow

### Interpretation
Proc slow on spirit damage: -30% Move Speed, -12% Dash Distance, 2s. Plus +50 HP, +0.75m Sprint.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Sprint Speed | +0.75m | Passive |
| Move Speed Conditional | -30% | Passive (on spirit hit) |
| Dash Distance Conditional | -12% | Passive |
| Duration | 2s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% × 2s × spirit-trigger uptime | 18 (eff slow weighted) |  | adds | 30 × ~0.6. |
| `spirit_continuous_proc` | every spirit hit applies | 0.4 (proc index) |  | adds | R5: short refresh, short duration. |
| `spirit_burst_proc` | first-proc burst | 0.5 (proc index) |  | adds | R5. |
| `high_max_hp` | +50 HP (Spirit item) | 50 (HP) |  | adds | Direct explicit only. |
| `horizontal_mobility` | +0.75m sprint-only | 0.4 (m/s eff) |  | adds | Sprint × 0.5. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `vertical_mobility` | -12% dash disrupt (anti) | 5 (units) |  | adds | Anti-dash. |
| `counter_importance` | counter to mobility | 35 (% importance) |  | adds | R13. |
| `debuff` | enemy slow debuff | 18 (% importance) |  | adds | Mild. |

---

## Mystic Vulnerability
- **normalized_name**: `mystic_vulnerability` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_magic_vulnerability`
- **wiki**: https://deadlock.wiki/Mystic_Vulnerability

### Interpretation
On-spirit-hit proc: -8% Spirit Resist (shred) for 7s, +8% Spirit Resist passive. The T2 spirit-resist shred named anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +8% | Passive |
| Spirit Resist Conditional | -8% | Passive (debuff on hit) |
| Duration | 7s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% × 7s × on-hit uptime | 6 (eff shred %) |  | adds | 8 × ~0.8 maintain. |
| `spirit_resistance` | +8% Spirit Resist passive | 8 (eff %) |  | adds | Passive. |
| `spirit_continuous_proc` | every spirit-hit applies | 0.3 (proc index) |  | adds | R5 continuous-flavor. |
| `spirit_burst_proc` | first-proc burst | 0.4 (proc index) |  | adds | R5. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `counter_importance` | shred vs spirit tanks | 40 (% importance) |  | adds | R13. |
| `debuff` | low-priority debuff | 10 (% importance) |  | adds | Per tag_descriptions: vulnerability stacks low-cleanse-priority. |

---

## Quicksilver Reload
- **normalized_name**: `quicksilver_reload` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_quick_silver`
- **wiki**: https://deadlock.wiki/Quicksilver_Reload

### Interpretation
Active reload + spirit proc: 100% bullets reloaded instantly, +10% Fire Rate, fires a 44+0.16×SP spirit damage burst on reload.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage | 44 + 0.16×SP | Active |
| Fire Rate | +10% | Active |
| Bullets Reloaded | 100% | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | instant reload | 35 (eff ammo %) |  | adds | Instant-reload boost. |
| `fire_rate` | +10% × uptime | 5 (eff %) |  | adds | Active × ~0.5. |
| `spirit_damage` | (44 + 0.16×20)/5 + T2 baseline | 15 (SP-equiv) |  | adds | (44 + 3.2)/5 + 5.5. |
| `spirit_burst_damage` | reload burst dmg in 1s | 47 (raw dmg within 1s) |  | adds | 44 + 0.16×20 = 47.2 instant. |
| `gun_burst_damage` | post-reload + fire-rate burst | 14 (dmg-% within 1s) |  | adds | R2 (fire_rate-heavy burst). |
| `gun_continuous_damage` | reload sustains DPS | 8 (dmg-% outside 1s) |  | adds | R2 lighter. |
| `spirit_burst_proc` | reload proc | 0.7 (proc index) |  | adds | Instant proc on cast. |
| `hybrid_damage_usage` | spirit+gun dual | 55 (% importance) |  | adds | Double-dip. |
| `ability_spam` | reload-cast cadence | 30 (% importance) |  | adds | Spammable. |

---

## Slowing Hex
- **normalized_name**: `slowing_hex` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_containment`
- **wiki**: https://deadlock.wiki/Slowing_Hex

### Interpretation
Active single-target slow: -20% Move Speed, -30% Dash Distance, 3.5s, 25m cast. The T2 single-target slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +0.5m | Passive |
| Move Speed Conditional | -20% | Active (target) |
| Dash Distance Conditional | -30% | Active |
| Cast Range | 25m | Active |
| Duration | 3.5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -20% × 3.5/15 × 1 target | 5 (eff slow weighted) |  | adds | Active single-target × uptime. |
| `single_target` | targeted active | 65 (% importance) |  | adds | Single-target active. |
| `vertical_mobility` | -30% dash (anti) | 10 (units) |  | adds | Anti-dash. |
| `mid_range` | 25m cast | 35 (% importance) |  | adds | Mid-range tool. |
| `long_range` | 25m partial | 20 (% importance) |  | adds | Borderline long. |
| `horizontal_mobility` | +0.5m sprint passive | 0.25 (m/s eff) |  | adds | Sprint-only. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `counter_importance` | counter to mobility | 50 (% importance) |  | adds | R13. |
| `debuff` | enemy slow debuff | 18 (% importance) |  | adds | Mild. |

---

## Spirit Sap
- **normalized_name**: `spirit_sap` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_spirit_sap`
- **wiki**: https://deadlock.wiki/Spirit_Sap

### Interpretation
Active enemy SP drain + shred: -9% Spirit Resist, -30 SP from enemy, 12s, 40m cast. Anti-spirit-caster T2 tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Spirit Resist Conditional | -9% | Active (debuff) |
| Spirit Power | -30 | Active (enemy SP drain) |
| Duration | 12s | Active |
| Cast Range | 40m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -9% × 12/30 cycle | 4 (eff shred %) |  | adds | Active uptime × 1 target. |
| `spirit_resistance` | -30 SP from enemy = spirit denial | 10 (eff %) |  | adds | Per 01: reducing enemy SP counts toward spirit_resistance. |
| `counter_importance` | anti-spirit-caster | 65 (% importance) |  | adds | R13/R27. |
| `single_target` | targeted active | 55 (% importance) |  | adds | Single-target. |
| `long_range` | 40m cast | 35 (% importance) |  | adds | Long-cast. |
| `mid_range` | 40m also covers mid | 20 (% importance) |  | adds | Partial. |
| `high_max_hp` | +50 HP (Spirit item) | 50 (HP) |  | adds | Direct explicit. |
| `spirit_damage` | T2 Spirit baseline | 5.5 (SP-equiv) |  | adds | R31. |
| `debuff` | enemy SP debuff | 25 (% importance) |  | adds | Moderate priority. |

---

## Suppressor
- **normalized_name**: `suppressor` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_suppressor`
- **wiki**: https://deadlock.wiki/Suppressor

### Interpretation
Conditional enemy fire-rate slow: +6 SP, +8% Bullet Resist passive, plus -28% Fire Rate enemy debuff 5s. Per 04 judgment: fire_rate_slow item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +6 | Passive |
| Bullet Resist | +8% | Passive |
| Fire Rate Conditional | -28% | Passive (debuff) |
| Duration | 5s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -28% × ~0.7 trigger uptime × 1 target | 20 (eff slow %) |  | adds | Per 04 judgment fact. |
| `bullet_resistance` | +8% passive + fire-rate-slow pseudo | 14 (eff %) |  | adds | 8 explicit + fire-rate-slow pseudo. |
| `gun_continuous_resistance` | sustained gun blunting | 12 (eff %) |  | adds | Per 01 pseudo. |
| `melee_resistance` | bullet pseudo | 4 (eff %) |  | adds | Per 01. |
| `spirit_damage` | +6 SP + T2 baseline | 11.5 (SP-equiv) |  | adds | 6 + 5.5. |
| `counter_importance` | gun-comp counter | 55 (% importance) |  | adds | R13. |
| `debuff` | enemy fire-rate debuff | 18 (% importance) |  | adds | Mild. |


---

