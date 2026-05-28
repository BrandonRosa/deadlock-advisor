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
| `spirit_damage` | 45 DPS × 5s = 225 + 0.2×20×5 = 245 → /5 SP-equiv + T3 baseline | 58 (SP-equiv) |  | adds | (45×5 + 0.2×20×5)/5 = 49 + 9.6 baseline = 58. (T3 baseline NOT applied since Weapon item — only spirit_damage from item's own SP.) |
| `bullet_resist_shred` | -7% × 5s × AoE uptime | 5 (eff shred %) |  | adds | (7 + 0.055×20) × (5/25 cycle) × ~3 AoE targets ≈ 5. |
| `aoe_cluster` | 10m AoE DoT | 70 (% importance) |  | adds | Wide AoE. |
| `spirit_continuous_damage` | sustained DoT outside 1s | 196 (raw dmg outside 1s) |  | adds | DPS × (duration−1s) × AoE-multiplier. |
| `spirit_burst_damage` | first tick in 1s | 49 (raw dmg within 1s) |  | adds | First-1s tick on multiple targets. |
| `spirit_continuous_proc` | sustained ground DoT | 0.35 (proc index) |  | adds | R5 continuous-flavor. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `farmer` | AoE clears jungle | 45 (% importance) |  | adds | R28. |
| `dot` | DoT damage | 220 (raw dmg) |  | adds | Direct DoT — burn effect. |
| `counter_importance` | anti-tank DoT + gun-shred | 45 (% importance) |  | adds | R13. |

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
| `bullet_damage` | +20%/stack × ~3 avg stacks + T3 baseline | 32 (eff gun-dmg %) |  | adds | 20 × ~3 stacks × ~0.4 uptime + 9.6 baseline. R23: imbue-tied bonus. |
| `range_extender_dependant` | +22% Range (imbue) | 22 (eff %) |  | adds | R23: single-ability range. |
| `single_ability_focus` | imbue → one ability | 80 (% importance) |  | adds | R23. |
| `gun_burst_damage` | post-cast burst lifted | 16 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained DPS on stacked imbue | 16 (dmg-% outside 1s) |  | adds | R2. |
| `farmer` | +5% NPC dmg, 8-stack NPC build | 35 (% importance) |  | adds | R28: NPC stack on creeps for econ. |
| `scaling_late` | stack-build item rewards prolonged engagements | 35 (% importance) |  | adds | Stacking imbue scales the longer you play. |

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
| `damage_sponge` | trigger = damage taken | 95 (% importance) |  | adds | R26: this IS the item's purpose. Named anchor. |
| `bullet_damage` | up to +70% × stack-build uptime + T3 baseline | 35 (eff gun-dmg %) |  | adds | (7×~4 avg stacks) × 0.7 uptime + 9.6 baseline ≈ 30. |
| `bullet_damage` | scales with sustaining stacks | 30 (eff gun-dmg %) |  | relies | The 7%/stack only realizes when stacked. |
| `bullet_resistance` | +8% Bullet Resist | 8 (eff %) |  | adds | Direct passive. |
| `gun_burst_damage` | per-shot stacked amp | 25 (dmg-% within 1s) |  | adds | R2 + stack lift. |
| `gun_continuous_damage` | sustained DPS scales as stacks build | 28 (dmg-% outside 1s) |  | adds | R2. |
| `gun_continuous_proc` | self-buff stack proc on damage taken | 0.5 (proc index) |  | adds | R25: every-120-dmg trigger; continuous-leaning. |
| `gun_burst_proc` | stack-initialization burst | 0.4 (proc index) |  | adds | R25. |
| `low_max_hp` | takes damage to scale (low-HP trigger) | 45 (HP) |  | adds | Item scales as you eat damage. |

---

## Blood Tribute
- **normalized_name**: `blood_tribute` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_blood_tribute`
- **wiki**: https://deadlock.wiki/Blood_Tribute

### Interpretation
Active self-damage tradeoff: drain 50 HP/s for +35% Fire Rate, +35% Debuff Resist, +2m MS; +8% Spirit Resist, +8% Debuff Resist, +4 OOC passive. R24: flat self-damage → NEGATIVE `low_max_hp` + POSITIVE `high_max_hp relies`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +8% | Passive |
| Spirit Resist | +8% | Passive |
| Out of Combat Regen | +4 | Passive |
| Health Drain | 50/s | Active (self-damage) |
| Fire Rate | +35% | Active |
| Debuff Resist | +35% | Active |
| Move Speed | +2m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +35% × ~5/15 active uptime | 12 (eff %) |  | adds | Active cost-gated uptime. |
| `cc_resist` | +35% × uptime + 8% passive | 20 (eff %) |  | adds | Combined. |
| `debuff_resistance` | +8% passive + 35% active | 19 (eff %) |  | adds | Same. |
| `spirit_resistance` | +8% passive | 8 (eff %) |  | adds | Passive. |
| `horizontal_mobility` | +2m × uptime | 0.7 (m/s eff) |  | adds | 2 × ~0.35 active. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `gun_burst_damage` | active fire-rate burst window | 22 (dmg-% within 1s) |  | adds | R2 (fire_rate lifts burst more). |
| `gun_continuous_damage` | sustained DPS during buff | 9 (dmg-% outside 1s) |  | adds | R2 lighter. |
| `low_max_hp` | flat-HP-cost mechanic hurts low-HP | -25 (% importance) |  | adds | R24: NEGATIVE on low_max_hp (low-HP heroes bleed out faster from 50/s drain). |
| `high_max_hp` | item safer for high-HP carriers | 45 (HP) |  | relies | R24: positive relies — high HP cushion makes drain manageable. |
| `self_heal` | +4 OOC | 18 (HP total) |  | adds | 4 × 15 × 0.3. |
| `continous_heal` | +4 OOC outside 1s | 16.8 (HP outside 1s) |  | adds | 4 × 14 × 0.3. |

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
| `fire_rate` | +10% passive + 32% × uptime | 20 (eff %) |  | adds | 10 + (32 × 4.5/16 uptime). |
| `gun_burst_damage` | burst window during active | 28 (dmg-% within 1s) |  | adds | R2 corrected — fire_rate lifts burst heavier. |
| `gun_continuous_damage` | sustained mild lift | 8 (dmg-% outside 1s) |  | adds | R2 lighter. |
| `horizontal_mobility` | +1.25m × 4.5/16 + slide | 0.5 (m/s eff) |  | adds | Active uptime. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `engage` | active burst window = engage tool | 35 (% importance) |  | adds | Slide + active for committing. |
| `magazine_size_dependant` | fire-rate items rely on ammo | 8 (eff ammo %) |  | relies | RELY: needs ammo to sustain RPM. |

---

## Cultist Sacrifice
- **normalized_name**: `cultist_sacrifice` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_non_player_bonus_sacrifice`
- **wiki**: https://deadlock.wiki/Cultist_Sacrifice

### Interpretation
NPC-kill stacker: +30% Wpn Dmg / +30% Bullet Resist vs NPCs (passive); +10×0.8% Wpn Dmg per stack and +50×4 HP per stack, +12% Ability Range, 160s buff duration. Pure greedy farm-stack item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +2 | Passive |
| Weapon Damage vs. NPCs | +30% | Passive (NPC-only) |
| Bullet Resist vs. NPCs | +30% | Passive (NPC-only) |
| Weapon Damage Conditional | +10×0.8% | Active (per-NPC-kill stack) |
| Bonus Health Conditional | +50×4 | Active (per stack) |
| Ability Range Conditional | +12% | Active |
| Duration | 160s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | dedicated NPC-kill stacker | 85 (% importance) |  | adds | The strongest farm item at T3. |
| `bullet_damage` | +10×0.8 = ~8% per stack avg × stack uptime + baseline | 25 (eff gun-dmg %) |  | adds | (8 × ~2 avg stacks × 0.7 uptime) + 9.6 baseline. |
| `high_max_hp` | +200 HP at 4 stacks × uptime | 110 (HP) |  | adds | 50×4 × 0.7 uptime = 140 effective; weapon-item (no HP baseline). |
| `range_extender_dependant` | +12% Ability Range × uptime | 8 (eff %) |  | adds | Conditional. |
| `scaling_late` | NPC-stack item rewards prolonged farming | 60 (% importance) |  | adds | Stack-builder needs farm-time to fire. |
| `self_heal` | +2 OOC | 9 (HP total) |  | adds | Standard. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) |  | adds | 2 × 14 × 0.3. |
| `gun_continuous_damage` | stacked sustained DPS | 14 (dmg-% outside 1s) |  | adds | R2. |
| `gun_burst_damage` | stacked per-shot amp | 14 (dmg-% within 1s) |  | adds | R2. |

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
| `magazine_size_dependant` | +35% Max Ammo | 35 (eff ammo %) |  | adds | Direct passive ammo. |
| `bullet_damage` | +18% Wpn Dmg + T3 baseline | 27.6 (eff gun-dmg %) |  | adds | 18 + 9.6. |
| `bullet_resistance` | up to 30% × stack uptime | 22 (eff %) |  | adds | 30 × ~0.7 stack-uptime. |
| `melee_resistance` | bullet resist pseudo | 11 (eff %) |  | adds | Per 01 ~0.5x. |
| `high_max_hp` | +75 HP (Weapon item) | 75 (HP) |  | adds | Weapon-item explicit only. |
| `gun_burst_damage` | per-shot lift | 18 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained DPS + mag | 25 (dmg-% outside 1s) |  | adds | R2 + ammo lifts continuous. |
| `gun_continuous_proc` | self-resist stack per shot | 0.5 (proc index) |  | adds | R25: stacks every shot — continuous-leaning. |
| `gun_burst_proc` | initial stack build | 0.3 (proc index) |  | adds | R25. |
| `damage_sponge` | stacks favor enduring fights (incidental) | 35 (% importance) |  | relies | R26. |

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
| `gun_burst_damage` | +250% per shot active burst | 110 (dmg-% within 1s) |  | adds | The 125×2 = 250% shot is the defining burst payout. |
| `bullet_damage` | +8% passive + active burst amortized + T3 baseline | 30 (eff gun-dmg %) |  | adds | 8 + (250 × ~0.05 single-shot frequency) + 9.6 baseline. |
| `gun_burst_proc` | single-shot proc-style burst | 1.2 (proc index) |  | adds | Burst-flavored: large effect in tight window. |
| `long_range` | +60% bullet velocity + range scaling | 50 (% importance) |  | adds | Bullet velocity heavy. |
| `mid_range` | also mid | 30 (% importance) |  | adds | Mid-range tracking. |
| `single_target` | aimed single-shot | 60 (% importance) |  | adds | Single-target burst. |
| `headshot_damage` | rewards landing aimed shots | 40 (% importance) |  | adds | Bullet velocity + per-shot burst. |
| `magazine_size_dependant` | consumes 2 ammo per shot | 8 (eff ammo %) |  | relies | Item RELIES on having ammo for the high-cost shot. |
| `gun_continuous_damage` | minor sustained lift | 8 (dmg-% outside 1s) |  | adds | R2 lighter — burst-heavy. |

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
| `headshot_damage` | +75×4 + 4% heal | 85 (% importance) |  | adds | T3 named anchor for headshot-importance. |
| `bullet_damage` | +5% + T3 baseline | 14.6 (eff gun-dmg %) |  | adds | 5 + 9.6. |
| `gun_burst_damage` | first-head burst (+75 dmg in 1s) | 60 (raw dmg within 1s) |  | adds | First-head delivers 75 raw burst dmg in 1s window. |
| `gun_burst_proc` | first-head proc | 1.0 (proc index) |  | adds | Burst index 1.0. |
| `self_heal` | 4% per headshot (~3 heads/fight) | 60 (HP total) |  | adds | 4% × 500 HP × ~3 heads = 60. |
| `bullet_lifesteal` | functions like bullet-lifesteal on heads | 6 (eff %) |  | adds | 4% × headshot-rate effective. |
| `burst_heal` | per-head heal within 1s of triggering shot | 20 (HP within 1s) |  | adds | First headshot heals 20 HP within 1s. |
| `horizontal_mobility` | +1.75m × headshot-trigger uptime | 0.5 (m/s eff) |  | adds | 1.75 × ~0.3 head-trigger uptime. |
| `single_target` | headshots are single-target | 65 (% importance) |  | adds | Targeted. |
| `mid_range` / `long_range` | scoped headshots | 40 (% importance) |  | adds | Mid-range headshots primary. |
| `high_max_hp` | +50 HP (Weapon item) | 50 (HP) |  | adds | Weapon explicit only. |

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
| `bullet_resistance` | +17% aura | 17 (eff %) |  | adds | Wide-radius aura. |
| `melee_resistance` | bullet pseudo | 9 (eff %) |  | adds | Per 01. |
| `ally_buff` | team-wide aura buff | 80 (% importance) |  | adds | Aura item — primary purpose. |
| `team_heal` | aura saves teammates | 35 (HP total) |  | adds | Effective shielding via resist. |
| `assist_importance` | team-fight presence | 60 (% importance) |  | adds | R27: universal-strong. |
| `close_to_team` | aura needs allies nearby | 70 (% importance) |  | adds | 35m radius wants team grouped. |
| `fire_rate` | +26% × active uptime | 13 (eff %) |  | adds | 26 × ~0.5 active. |
| `horizontal_mobility` | +1.5m sprint + active MS | 1.0 (m/s eff) |  | adds | Sprint passive ×0.5 + active. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `gun_burst_damage` | fire-rate burst lift on team | 18 (dmg-% within 1s) |  | adds | R2 burst-heavy. |
| `engage` | aura active = team push | 50 (% importance) |  | adds | Active rewards group engages. |
| `high_assist_count` | aura → assists | 50 (% importance) |  | adds | Team-presence. |

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
| `bullet_resist_shred` | -9% × 8s × on-hit | 7 (eff shred %) |  | adds | 9 × ~0.8 maintain. |
| `bullet_damage` | +35% × uptime + T3 baseline | 27.6 (eff gun-dmg %) |  | adds | (35 × ~0.5 condition uptime) + 9.6 baseline. |
| `bullet_damage` | scales with maintaining condition | 35 (eff gun-dmg %) |  | relies | RELY on the condition. |
| `gun_burst_damage` | conditional per-shot amp | 18 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained DPS | 18 (dmg-% outside 1s) |  | adds | R2. |
| `gun_continuous_proc` | every bullet applies shred | 0.4 (proc index) |  | adds | R5. |
| `high_max_hp` | +125 HP (Weapon item) | 125 (HP) |  | adds | Explicit only. |
| `self_heal` | +4.5 OOC | 20 (HP total) |  | adds | 4.5 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 18.9 (HP outside 1s) |  | adds | 4.5 × 14 × 0.3. |

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
| `bullet_resist_shred` | -10% × aura uptime × ~2 enemies | 18 (eff shred %) |  | adds | 10 × 0.9 in-range × 2 AoE. |
| `fire_rate_slow` | -15% × aura × 2 enemies | 25 (eff slow %) |  | adds | 15 × 0.9 × 2 — passive, multi-target. |
| `bullet_resistance` | fire-rate-slow pseudo | 10 (eff %) |  | adds | Per 01. |
| `gun_continuous_resistance` | sustained gun blunting | 10 (eff %) |  | adds | Per 01. |
| `aoe_cluster` | 15m aura | 55 (% importance) |  | adds | AoE flavor. |
| `ally_buff` | aura effectively buffs team gun output | 60 (% importance) |  | adds | Team shred. |
| `high_max_hp` | +100 HP (Weapon item) | 100 (HP) |  | adds | Explicit. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) |  | adds | Sprint × 0.5. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `close_to_team` | aura wants team grouped | 35 (% importance) |  | adds | Team-fight item. |

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
| `bullet_damage` | +50% × close uptime + T3 baseline | 37 (eff gun-dmg %) |  | adds | (50 × ~0.55 close uptime) + 9.6 baseline. |
| `bullet_damage` | scales with close-range build | 50 (eff gun-dmg %) |  | relies | RELY on close-range. |
| `melee_damage` | R18 close-range gun amp at melee dist | 50 (eff melee-dmg %) |  | adds | ⚖️ Judgment anchor — R12/R18: close-range weapon power IS melee_damage. |
| `close_range` | gun amp <15m | 90 (% importance) |  | adds | R21. |
| `long_range` | anti-affinity | -40 (% importance) |  | adds | R30. |
| `melee_resistance` | +30% | 30 (eff %) |  | adds | Direct. |
| `movement_slow` | -25% × 2s × on-hit | 25 (eff slow weighted) |  | adds | 25 × ~0.9 uptime × 1 target × 1s avg. |
| `gun_burst_damage` | per-shot close amp | 30 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained close fire | 30 (dmg-% outside 1s) |  | adds | R2. |
| `high_max_hp` | +75 HP (Weapon) | 75 (HP) |  | adds | Explicit. |
| `engage` | rewards committing | 70 (% importance) |  | adds | R11/close-range engage. |
| `grounded` | close-fight grounded | 50 (% importance) |  | adds | R7. |

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
| `long_range` | range kit + +60% wpn dmg >15m | 90 (% importance) |  | adds | ⚖️ Named anchor for long_range. |
| `bullet_damage` | +10% + 60% × long uptime + T3 baseline | 42 (eff gun-dmg %) |  | adds | 10 + (60 × ~0.4 long-range) + 9.6 baseline. |
| `bullet_damage` | scales with maintaining long range | 60 (eff gun-dmg %) |  | relies | RELY on >15m. |
| `close_range` | anti-affinity | -40 (% importance) |  | adds | Mirror R30 — sniper kit anti-close. |
| `gun_burst_damage` | per-shot amp | 35 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained lift | 35 (dmg-% outside 1s) |  | adds | R2. |
| `headshot_damage` | zoom + velocity aid heads | 55 (% importance) |  | adds | Big zoom + velocity. |
| `single_target` | scope shots single-target | 60 (% importance) |  | adds | Sniper. |
| `horizontal_mobility` | net -0.7 + 1m sprint × 0.5 | 0 (m/s eff) |  | adds | Net ~0 (penalty offsets sprint). |

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
| `spirit_resist_shred` | -8% on-hit + 7%×4 stacks × headshot uptime | 22 (eff shred %) |  | adds | 8 + (7×4 × ~0.5 head-uptime) = 22. |
| `spirit_lifesteal` | +10% × on-hit uptime | 7 (eff %) |  | adds | 10 × ~0.7. |
| `headshot_damage` | rewards heads for stack | 50 (% importance) |  | adds | Head-driven stacking. |
| `gun_continuous_proc` | every-bullet shred | 0.4 (proc index) |  | adds | R5. |
| `gun_burst_proc` | head-stack burst | 0.6 (proc index) |  | adds | R5. |
| `high_max_hp` | +75 HP (Weapon) | 75 (HP) |  | adds | Explicit. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `hybrid_damage_usage` | shred + lifesteal + bullet | 50 (% importance) |  | adds | Spirit/gun bridge. |
| `counter_importance` | anti-spirit tank shred | 45 (% importance) |  | adds | R13. |

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
| `spirit_damage` | (33+0.19×20)×4 jumps × 0.15 proc / 5 + T3 baseline | 21 (SP-equiv) |  | adds | Per 01: (37×4)/5 × 0.15 = 4.4 SP-equiv + 9.6 baseline (weapon item — no SP baseline). 4.4 only. Score 4.4. Hmm — Weapon item. Score just 4.4. |
| `aoe_cluster` | chain to 4 enemies | 70 (% importance) |  | adds | AoE proc on bullet hit. |
| `gun_continuous_proc` | 15% chance every bullet | 0.45 (proc index) |  | adds | R5: per-shot proc. |
| `gun_burst_proc` | first-shot chain burst | 0.4 (proc index) |  | adds | R5. |
| `spirit_continuous_damage` | sustained spirit chain dmg | 70 (raw dmg outside 1s) |  | adds | (37×4)×0.15 = 22/shot × ~3 shots/s sustained. |
| `spirit_burst_damage` | first-1s chain dmg | 30 (raw dmg within 1s) |  | adds | First hits chain. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `farmer` | chain clears NPCs | 50 (% importance) |  | adds | R28: AoE = farm. |
| `hybrid_damage_usage` | spirit-via-gun proc | 50 (% importance) |  | adds | Double-dip. |
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
| `anti_heal` | -35% × 4s × on-hit uptime | 26 (eff %) |  | adds | 35 × ~0.75 maintain. |
| `dot` | 1.7%/s bleed × 4s | 80 (raw dmg) |  | adds | %/s of max HP × 4s × ~1.5 avg HP fraction = ~80 DoT. |
| `gun_continuous_proc` | per-bullet DoT/anti-heal | 0.45 (proc index) |  | adds | R5: short refresh, 4s effect. |
| `gun_burst_proc` | first-tick burst | 0.3 (proc index) |  | adds | R5 burst-light. |
| `bullet_damage` | T3 weapon baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `bullet_proc` | general anchor (per tag_desc) | 0.4 (proc index) |  | adds | Anchor for bullet_proc. |
| `gun_continuous_damage` | DoT sustained | 60 (raw dmg outside 1s) |  | adds | DoT outside 1s. |
| `gun_burst_damage` | first-tick within 1s | 20 (raw dmg within 1s) |  | adds | First DoT tick. |
| `counter_importance` | heal counter | 55 (% importance) |  | adds | R13/R27. |
| `debuff` | priority debuff (anti-heal) | 40 (% importance) |  | adds | High priority. |

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
| `bullet_damage` | +40% Wpn Dmg + T3 baseline | 49.6 (eff gun-dmg %) |  | adds | 40 + 9.6. |
| `gun_burst_damage` | per-shot heavy amp | 28 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained heavy | 28 (dmg-% outside 1s) |  | adds | R2. |
| `movement_slow` | -30% × 3.5s × on-hit | 27 (eff slow weighted) |  | adds | 30 × ~0.9 uptime × 1. |
| `debuff_resistance` | +22% | 22 (eff %) |  | adds | Direct. |
| `cc_resist` | partial CC blunting | 16 (eff %) |  | adds | Per 04 — debuff_resistance blunts CC. |
| `gun_continuous_proc` | every bullet slows | 0.45 (proc index) |  | adds | R5. |
| `horizontal_mobility` | -0.5m + -14% stamina rec | -0.5 (m/s eff) |  | adds | Net mobility penalty. |
| `vertical_mobility` | -14% stamina recovery (anti) | -0.3 (units) |  | adds | Anti-vertical. |
| `grounded` | slow heavy-gunner | 35 (% importance) |  | adds | R7 grounded leaning. |
| `counter_importance` | slow + debuff resist counters | 40 (% importance) |  | adds | R13. |

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
| `bullet_resistance` | +30% + 15% × uptime | 39 (eff %) |  | adds | 30 + (15 × ~0.6 conditional uptime). T3 anchor. |
| `melee_resistance` | bullet pseudo | 20 (eff %) |  | adds | Per 01. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `self_heal` | +3 OOC | 14 (HP total) |  | adds | 3 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 12.6 (HP outside 1s) |  | adds | 3 × 14 × 0.3. |
| `damage_sponge` | bullet-resist tank synergy (incidental) | 30 (% importance) |  | relies | R26 partial. |
| `gun_continuous_resistance` | sustained gun defense | 25 (eff %) |  | adds | Per 01. |
| `gun_burst_resistance` | gun-burst defense | 15 (eff %) |  | adds | Lower than continuous for flat resist. |

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
| `spirit_burst_resistance` | 0.8s spell parry = 100% spirit-burst absorb | 60 (eff %) |  | adds | ⚖️ judgment anchor: parry window negates a spirit burst entirely (per 03 anchor: Spellbreaker/Counterspell). |
| `counter_importance` | dedicated anti-spirit-burst | 80 (% importance) |  | adds | R27: niche counter, high score. |
| `bullet_evasion` | partial — spell parry doesn't help bullets | 0 |  | adds | (Skip — wrong axis.) |
| `self_heal` | 150 per-parry × ~0.5 trigger uptime | 75 (HP total) |  | adds | 150 × 0.5 success rate. |
| `burst_heal` | 150 on parry-trigger within 1s | 75 (HP within 1s) |  | adds | Instant heal on parry. |
| `spirit_damage` | +5 + 20 × uptime + baseline | 14 (SP-equiv) |  | adds | 5 + (20 × 6/30 active uptime) = 9 — Vitality item, no SP baseline. |
| `horizontal_mobility` | +1.75m × uptime | 0.4 (m/s eff) |  | adds | 1.75 × ~0.2. |
| `high_max_hp` | +50 + T3 baseline | 79 (HP) |  | adds | 50 + 29. |
| `damage_sponge` | reactive-on-spell tank (incidental) | 25 (% importance) |  | relies | R26. |

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
| `debuff_resistance` | cleanse on cast (full removal) | 35 (eff %) |  | adds | Per 01: cleanse = full credit modulo cooldown. |
| `cc_resist` | cleanse covers CC too | 30 (eff %) |  | adds | Per 04. |
| `counter_importance` | reactive cleanse | 75 (% importance) |  | adds | R27 niche counter. |
| `self_heal` | 250 HP per cast | 110 (HP total) |  | adds | 250 × ~0.45 per-fight cast freq. |
| `burst_heal` | 250 instant on cast | 110 (HP within 1s) |  | adds | Burst heal flavor. |
| `horizontal_mobility` | +2m × uptime | 0.5 (m/s eff) |  | adds | 2 × 0.25 active uptime. |
| `escape` | cleanse + MS = escape tool | 55 (% importance) |  | adds | Disengage utility. |
| `spirit_resistance` | +10% | 10 (eff %) |  | adds | Passive. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |

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
| `high_max_hp` | +375 HP + T3 baseline | 404 (HP) |  | adds | 375 + 29. T3 anchor for HP per 03. |
| `continous_heal` | +2% Max HP/s outside 1s | 130 (HP outside 1s) |  | adds | 2% × ~1000 effective HP × 14s post-fight = ~280; weighted by trigger ~0.5 = 140. |
| `self_heal` | total regen across cycle | 150 (HP total) |  | adds | Sum estimate. |
| `burst_heal` | first 1s regen | 10 (HP within 1s) |  | adds | Small first tick. |
| `damage_sponge` | tank-class HP item | 60 (% importance) |  | relies | R26: HP cushion is tank's purpose. |
| `large_hitbox` | large HP softly correlates | 25 (% importance) |  | relies | Partial. |
| `horizontal_mobility` | +1.5m × ~0.5 uptime | 0.4 (m/s eff) |  | adds | Conditional partial. |

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
| `bullet_lifesteal` | +14% passive | 14 (eff %) |  | adds | Direct. |
| `spirit_resistance` | +40% × ~6.5/20 active | 13 (eff %) |  | adds | Active uptime. |
| `fire_rate` | 32% × uptime | 11 (eff %) |  | adds | Active. |
| `bullet_damage` | +6% (Vitality, no weapon baseline) | 6 (eff gun-dmg %) |  | adds | Vitality item — only explicit. |
| `gun_burst_damage` | fire-rate burst window | 16 (dmg-% within 1s) |  | adds | R2 (fire_rate burst-heavy). |
| `gun_continuous_damage` | sustained lift | 7 (dmg-% outside 1s) |  | adds | R2. |
| `self_heal` | bullet-lifesteal sustain | 85 (HP total) |  | adds | 14% × ~600 gun dmg. |
| `continous_heal` | lifesteal outside 1s | 75 (HP outside 1s) |  | adds | Sustained pings. |
| `burst_heal` | first-1s lifesteal | 10 (HP within 1s) |  | adds | Initial. |
| `high_max_hp` | +100 + T3 baseline | 129 (HP) |  | adds | 100 + 29. |
| `damage_sponge` | lifesteal+resist on cooldown | 35 (% importance) |  | relies | R26. |

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
| `team_heal` | 325 × ~3 allies in 18m | 700 (HP total) |  | adds | AoE heal benefits team. |
| `self_heal` | self contribution | 325 (HP total) |  | adds | Self-targeted in nova too. |
| `burst_heal` | 325 in 2s ≈ ~160 in first 1s | 160 (HP within 1s) |  | adds | Per 04: BURST heal flavor (tight 2s window). |
| `continous_heal` | rest outside 1s | 165 (HP outside 1s) |  | adds | 325 − 160. |
| `aoe_cluster` | 18m heal aura | 65 (% importance) |  | adds | Wide AoE. |
| `assist_importance` | team-heal pulse | 80 (% importance) |  | adds | R27: niche team support. |
| `range_extender_dependant` | +5% Range | 5 (eff %) |  | adds | Direct. |
| `close_to_team` | 18m aura wants team grouped | 40 (% importance) |  | adds | Aura wants team. |
| `spirit_damage` | +8 SP (Vitality) | 8 (SP-equiv) |  | adds | Direct. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `counter_importance` | reactive vs burst | 45 (% importance) |  | adds | R13. |

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
| `melee_damage` | +16% + heal-on-hit synergy | 22 (eff melee-dmg %) |  | adds | Strong direct melee dmg. |
| `self_heal` | 100 HP + 30% melee heal × melee hits | 170 (HP total) |  | adds | 100 base × ~1.5 procs + 30% melee-heal lift. |
| `burst_heal` | each melee proc instant within 1s | 100 (HP within 1s) |  | adds | Single-tick on contact. |
| `movement_slow` | -60% × 2.5s × melee-trigger | 60 (eff slow weighted) |  | adds | 60 × ~0.4 melee uptime × 1 target. |
| `close_range` | melee-only | 95 (% importance) |  | adds | R21. |
| `long_range` | anti-affinity | -45 (% importance) |  | adds | R30. |
| `engage` | melee strikes commit | 75 (% importance) |  | adds | R11. |
| `grounded` | melee = grounded | 50 (% importance) |  | adds | R7. |
| `high_max_hp` | +125 + T3 baseline | 154 (HP) |  | adds | 125 + 29. |
| `damage_sponge` | melee brawler (incidental) | 30 (% importance) |  | relies | R26. |

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
| `shield` | 200 × 12 = 2400 nominal × ~0.3 uptime | 700 (shield HP) |  | adds | Massive nominal but cooldown-gated. |
| `vertical_mobility` | active jump-burst | 2 (units) |  | adds | Major vertical traverse. |
| `aerial` | +50% air control during active | 70 (% importance) |  | adds | Aerial-focused active. |
| `escape` | jump = disengage | 65 (% importance) |  | adds | Major escape tool. |
| `engage` | jump = also commit | 35 (% importance) |  | adds | Engage utility. |
| `interrupt` | 5s interrupt cooldown reduction? | 10 (eff freq) |  | adds | Item helps recover post-interrupt. |
| `cc_resist` | interrupt resilience | 12 (eff %) |  | adds | Partial recovery. |
| `damage_sponge` | shield-on-cast (incidental) | 40 (% importance) |  | relies | R26. |
| `burst_resistance` | shield absorbs burst | 35 (eff %) |  | adds | Per 01. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |

---

## Metal Skin
- **normalized_name**: `metal_skin` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_metal_skin`
- **wiki**: https://deadlock.wiki/Metal_Skin

### Interpretation
Bullet-immunity active: +12% Bullet Resist passive, active grants bullet immunity (per 03 anchor: gun_burst_resistance 2.0 anchor candidate), -1.5m MS penalty, 5s. ⚖️ NOT a spirit-burst tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +12% | Passive |
| Active Movespeed Penalty | -1.5m | Active |
| Dash Distance | -20% | Active (self penalty) |
| Duration | 5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | active bullet immunity 5s | 30 (eff %) |  | adds | Per tag_descriptions: Metal Skin is a bullet-evasion anchor. |
| `bullet_resistance` | +12% passive + immunity uptime | 28 (eff %) |  | adds | 12 + (100 × 5/20 active = 25). |
| `melee_resistance` | bullet pseudo | 14 (eff %) |  | adds | Per 01. |
| `gun_burst_resistance` | tanks gun burst windows | 50 (eff %) |  | adds | Per 01 anchor: active bullet immunity = strong burst R. |
| `gun_continuous_resistance` | sustained gun defense | 30 (eff %) |  | adds | Less heavy than burst for active. |
| `counter_importance` | reactive vs gun comps | 65 (% importance) |  | adds | R13/R27. |
| `damage_sponge` | active reactive defense (incidental) | 30 (% importance) |  | relies | R26. |
| `burst_resistance` | active short window | 40 (eff %) |  | adds | Per 01 partial. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `horizontal_mobility` | -1.5m active penalty | -0.4 (m/s eff) |  | adds | Active penalty. |
| `vertical_mobility` | -20% dash penalty | -0.4 (units) |  | adds | Self penalty. |

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
| `team_heal` | 20% ally max HP per cast | 250 (HP total) |  | adds | ~20% × 1000 ally HP × ~0.4 trigger uptime × 1 cast = 250. |
| `burst_heal` | 20% over 2.5s channel = bursty | 80 (HP within 1s) |  | adds | ~80 HP within first 1s of channel. |
| `continous_heal` | rest over 1.5s | 120 (HP outside 1s) |  | adds | Remaining channel. |
| `assist_importance` | dedicated ally heal | 85 (% importance) |  | adds | R27: high niche support. |
| `counter_importance` | reactive save | 55 (% importance) |  | adds | R13. |
| `range_extender_dependant` | +6% Range | 6 (eff %) |  | adds | Direct. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) |  | adds | Sprint × 0.5. |
| `close_to_team` | ally-cast benefits from team | 50 (% importance) |  | adds | Team-utility. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `farmer` | mobility + sustain | 20 (% importance) |  | adds | R28 small. |

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
| `spirit_resistance` | +30% + 15% × uptime | 39 (eff %) |  | adds | ⚖️ Named judgment anchor for spirit_resistance. |
| `spirit_continuous_resistance` | sustained spirit defense | 30 (eff %) |  | adds | Per 01. |
| `spirit_burst_resistance` | spirit burst partial | 15 (eff %) |  | adds | Per 01 (flat resist ~0.3x burst). |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `self_heal` | +3 OOC | 14 (HP total) |  | adds | Standard. |
| `continous_heal` | OOC outside 1s | 12.6 (HP outside 1s) |  | adds | 3 × 14 × 0.3. |
| `damage_sponge` | spirit-tank synergy | 30 (% importance) |  | relies | R26. |

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
| `vertical_mobility` | +2 stamina + 23% dash | 2 (units) |  | adds | T3 anchor for vertical. |
| `horizontal_mobility` | +2 stamina dashes | 1.4 (m/s eff) |  | adds | R9: 2 × 0.7. |
| `aerial` | +23% air dash + +2 stamina | 70 (% importance) |  | adds | R9 — aerial focused. |
| `engage` | extra dashes commit | 65 (% importance) |  | adds | R9. |
| `escape` | extra dashes retreat | 65 (% importance) |  | adds | R9. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `small_hitbox` | mobility partial | 30 (% importance) |  | adds | R26 incidental. |
| `farmer` | mobility helps rotations | 25 (% importance) |  | adds | R28. |

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
| `farmer` | souls/min via stacking | 60 (% importance) |  | adds | R28: dedicated econ-stack item. |
| `scaling_late` | stack-eco rewards prolonged play | 65 (% importance) |  | adds | Stacks compound late. |
| `horizontal_mobility` | +2m sprint + stacks | 1.0 (m/s eff) |  | adds | 2 × 0.5 + (0.15 × ~10 stacks × 0.5). |
| `range_extender_dependant` | +0.75% × stacks | 9 (eff %) |  | adds | 0.75 × ~12 avg stacks. |
| `self_heal` | +2 OOC | 9 (HP total) |  | adds | Standard. |
| `continous_heal` | OOC outside 1s | 8.4 (HP outside 1s) |  | adds | 2 × 14 × 0.3. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `escape` | sprint + mobility | 40 (% importance) |  | adds | Mobility utility. |

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
| `burst_heal` | 85 HP on cast within 1s | 85 (HP within 1s) |  | adds | Per 04: BURST heal. |
| `self_heal` | 85 per cast | 65 (HP total) |  | adds | 85 × ~0.75 cast freq. |
| `horizontal_mobility` | +2m sprint + invis-MS active | 2.5 (m/s eff) |  | adds | Sprint × 0.5 + active 3.5 × 0.4 active uptime. |
| `escape` | invis = clean disengage | 80 (% importance) |  | adds | Strong escape. |
| `engage` | invis-flank initiate | 55 (% importance) |  | adds | R11. |
| `bullet_evasion` | invis dodges incoming | 25 (eff %) |  | adds | Stealth defense. |
| `away_from_team` | flank-tool | 50 (% importance) |  | adds | Solo/flank flavor. |
| `spirit_damage` | +10 SP (Vitality) | 10 (SP-equiv) |  | adds | Direct. |
| `high_max_hp` | +125 + T3 baseline | 154 (HP) |  | adds | 125 + 29. |
| `small_hitbox` | invis effectively zero-hitbox | 50 (% importance) |  | adds | Stealth = harder to hit. |

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
| `escape` | clean 11m teleport | 85 (% importance) |  | adds | ⚖️ Named anchor for clean teleport-escape. |
| `engage` | teleport in also possible | 50 (% importance) |  | adds | Bidirectional but escape-flavored primarily. |
| `bullet_resistance` | +30% × 6/30 active | 9 (eff %) |  | adds | Active uptime. |
| `melee_resistance` | bullet pseudo | 4.5 (eff %) |  | adds | Per 01. |
| `gun_burst_resistance` | post-tp resist | 12 (eff %) |  | adds | Bullet resist + tp removes you from the line of fire. |
| `horizontal_mobility` | teleport active mobility | 1.5 (m/s eff) |  | adds | 11m / typical 15s cooldown effective. |
| `counter_importance` | reactive vs burst | 60 (% importance) |  | adds | R13. |
| `high_max_hp` | T3 Vitality baseline | 29 (HP) |  | adds | R31. |
| `damage_sponge` | reactive defense (incidental) | 25 (% importance) |  | relies | R26. |

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
| `anti_heal` | -50% × 10s × ~0.5 cycle | 40 (eff %) |  | adds | Strong active anti-heal. |
| `dot` | 2.6%/s × 10s = ~26% target HP | 260 (raw dmg) |  | adds | 26% of ~1000 HP = 260 raw DoT. |
| `debuff` | high-priority (priority cleanse) | 70 (% importance) |  | adds | ⚖️ Per tag_desc: Decay is a top-priority debuff. |
| `counter_importance` | dedicated anti-sustain counter | 80 (% importance) |  | adds | R27. |
| `spirit_damage` | dot SP-equiv + T3 baseline | 60 (SP-equiv) |  | adds | DoT amortized as SP-equiv + 8.3 baseline. |
| `spirit_continuous_damage` | sustained DoT | 240 (raw dmg outside 1s) |  | adds | Full DoT outside 1s. |
| `spirit_continuous_proc` | sustained debuff stream | 0.4 (proc index) |  | adds | R5. |
| `pure_damage` | %max-HP DoT counts | 30 (eff dmg) |  | adds | %max-HP bleed = pure-damage flavor. |
| `single_target` | targeted active | 65 (% importance) |  | adds | Targeted. |
| `mid_range` | ~22m cast | 35 (% importance) |  | adds | Mid range. |
| `long_range` | 22m partial | 22 (% importance) |  | adds | Borderline. |
| `high_max_hp` | +65 HP (Spirit) | 65 (HP) |  | adds | Explicit. |

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
| `disarm` | 4.25s × 1 target | 4 (s × count) |  | adds | Direct duration × target. T3 anchor. |
| `bullet_resist_shred` | -13% × 4.25/25 cycle | 4 (eff shred %) |  | adds | Active single-target. |
| `bullet_resistance` | disarm pseudo (no bullets fired) | 8 (eff %) |  | adds | Per 01: disarm ~0.4x bullet_resistance for duration. |
| `gun_continuous_resistance` | sustained gun shutoff | 12 (eff %) |  | adds | Disarm primarily denies sustained fire. |
| `gun_burst_resistance` | disarm during burst | 8 (eff %) |  | adds | Disarm blocks burst too. |
| `counter_importance` | anti-gun-comp counter | 75 (% importance) |  | adds | R27. |
| `single_target` | targeted disarm | 65 (% importance) |  | adds | Single-target active. |
| `long_range` | 32m cast | 35 (% importance) |  | adds | Long cast. |
| `mid_range` | also mid | 25 (% importance) |  | adds | Partial. |
| `debuff` | high-priority debuff | 50 (% importance) |  | adds | Disarm is priority. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) |  | adds | Explicit. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff) |  | adds | Sprint × 0.5. |

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
| `range_extender_dependant` | +30% Range | 30 (eff %) |  | adds | T3 range anchor. |
| `multi_ability_focus` | kit-wide range | 60 (% importance) |  | adds | R4. |
| `spirit_resistance` | +10% | 10 (eff %) |  | adds | Direct. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) |  | adds | R4. |

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
| `stun` | 0.5s × 1 target × ~6 casts/fight | 1.0 (eff s) |  | adds | T3 stun anchor. |
| `anti_air` | drops airborne enemies | 75 (% importance) |  | adds | ⚖️ Per tag_desc: Knockdown is THE anti-air anchor. |
| `interrupt` | hard interrupt | 60 (eff freq) |  | adds | Channel-ult interrupt. |
| `counter_importance` | counter to ult-channel + flying | 75 (% importance) |  | adds | R27. |
| `single_target` | targeted stun | 65 (% importance) |  | adds | Targeted active. |
| `long_range` | 45m cast | 60 (% importance) |  | adds | Long cast for stun. |
| `mid_range` | also covers mid | 30 (% importance) |  | adds | Mid. |
| `debuff` | priority stun debuff | 35 (% importance) |  | adds | Cleanseable, priority. |
| `engage` | stun sets up engage | 50 (% importance) |  | adds | R11. |
| `displace` | knockdown displaces airborne | 8 (e × m) |  | adds | Vertical knock. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) |  | adds | Explicit. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `range_extender_dependant` | +5% Range | 5 (eff %) |  | adds | Small direct. |

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
| `self_heal` | 4×7×0.75 trigger + 70 per-cast | 90 (HP total) |  | adds | 21 (regen) + ~70 ability-cast heal per fight. |
| `continous_heal` | 4 × 6s × 0.75 + cast-heal outside 1s | 30 (HP outside 1s) |  | adds | 18 regen outside 1s + ~10 cast-heal beyond. |
| `burst_heal` | regen first 1s + per-cast | 70 (HP within 1s) |  | adds | 70 burst per cast within 1s. |
| `horizontal_mobility` | +1.75m × 3/15 active | 0.4 (m/s eff) |  | adds | Active. |
| `high_max_hp` | +90 HP (Spirit) | 90 (HP) |  | adds | Explicit. |
| `high_max_hp` | heal scales with HP | 18 (HP) |  | relies | R8. |
| `damage_sponge` | regen on damage trigger | 30 (% importance) |  | relies | R26 partial. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `farmer` | sustain enables farm | 30 (% importance) |  | adds | R28. |
| `ability_spam` | per-cast trigger rewards spam | 35 (% importance) |  | adds | The ability-cast heal incentivizes casts. |

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
| `charge_dependant` | +2 charges + 30% faster + 14% CDR | 95 (% importance) |  | adds | ⚖️ Named anchor for charge_dependant. |
| `cooldown_reduction` | +14% CDR + 30% faster + extra charges | 25 (eff CDR %) |  | adds | R29: combined effective CDR. |
| `spirit_damage` | +14 SP for charged × uptime + baseline | 16 (SP-equiv) |  | adds | (14 × 0.6 charged-uptime) + 8.3 baseline. |
| `single_ability_focus` | charges bind primarily to one slot | 60 (% importance) |  | adds | Most heroes one charged ability. |
| `ability_spam` | extra charges = spam | 70 (% importance) |  | adds | Direct spam-enabler. |
| `spirit_burst_damage` | charged-ability burst | 9 (dmg-equiv within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | charged-ability sustained | 9 (dmg-equiv outside 1s) |  | adds | R2. |
| `farmer` | charge-eco = farm casts | 40 (% importance) |  | adds | R28/R29. |
| `multi_ability_focus` | partial — some heroes have multiple | 25 (% importance) |  | adds | Some heroes have multi-charge kits. |

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
| `silence` | 3s × ~2 abilities denied | 6 (weighted) |  | adds | T3 anchor: 3s denies ~2 ability casts. |
| `spirit_resistance` | silence pseudo (no spirit dmg from silenced) | 8 (eff %) |  | adds | Per 01: silence ~0.3x toward spirit_resistance. |
| `counter_importance` | anti-spirit-caster | 75 (% importance) |  | adds | R27. |
| `interrupt` | breaks channels | 50 (eff freq) |  | adds | Silence interrupts. |
| `single_target` | targeted silence | 55 (% importance) |  | adds | Targeted. |
| `spirit_damage` | 75+0.7×SP /5 + T3 baseline | 26 (SP-equiv) |  | adds | (75+14)/5 + 8.3 = 26. |
| `spirit_burst_damage` | active instant dmg in 1s | 89 (raw dmg within 1s) |  | adds | 75 + 0.7×20 = 89 instant. |
| `spirit_burst_proc` | instant active proc | 0.9 (proc index) |  | adds | Instant trigger, large effect. |
| `long_range` | 40m cast | 50 (% importance) |  | adds | Long. |
| `mid_range` | partial | 25 (% importance) |  | adds | Partial. |
| `debuff` | priority silence debuff | 45 (% importance) |  | adds | Priority. |
| `high_max_hp` | +50 HP (Spirit) | 50 (HP) |  | adds | Explicit. |

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
| `spirit_damage` | (50+0.84×20)/5 proc + 25 steal × uptime + T3 baseline | 30 (SP-equiv) |  | adds | (50+16.8)/5 = 13.4 + 25×0.4 steal + 8.3 baseline. |
| `spirit_damage` | proc scales with SP | 17 (SP-equiv) |  | relies | The 0.84×SP scaling. |
| `spirit_resist_shred` | 12% × melee-uptime | 6 (eff shred %) |  | adds | 12 × ~0.5 melee uptime. |
| `spirit_burst_proc` | melee-trigger proc | 0.9 (proc index) |  | adds | Burst-flavored melee proc. |
| `melee_damage` | +7% + spirit-on-melee | 15 (eff melee-dmg %) |  | adds | Direct + R12 melee-counts. |
| `spirit_burst_damage` | proc dmg in 1s | 67 (raw dmg within 1s) |  | adds | 50 + 0.84×20 = 66.8 per melee hit. |
| `close_range` | melee-trigger | 80 (% importance) |  | adds | R21. |
| `long_range` | anti-affinity | -35 (% importance) |  | adds | R30. |
| `grounded` | melee = grounded | 45 (% importance) |  | adds | R7. |
| `engage` | melee commits | 60 (% importance) |  | adds | R11. |
| `high_max_hp` | +75 HP (Spirit) | 75 (HP) |  | adds | Explicit. |
| `self_buff` | 25 SP steal × uptime is self-state | 35 (% importance) |  | adds | R19 legitimate buff state. |

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
| `cooldown_reduction` | +20% CDR | 20 (eff CDR %) |  | adds | Direct passive. |
| `multi_ability_focus` | kit-wide CDR | 60 (% importance) |  | adds | R4. |
| `ability_spam` | CDR enables spam | 50 (% importance) |  | adds | Enabler. |
| `self_heal` | +4 OOC | 18 (HP total) |  | adds | 4 × 15 × 0.3. |
| `continous_heal` | OOC outside 1s | 16.8 (HP outside 1s) |  | adds | 4 × 14 × 0.3. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | offsets multi | -20 (% importance) |  | adds | R4. |

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
| `duration_dependant` | +28% Duration | 28 (eff %) |  | adds | T3 named anchor. |
| `single_ability_focus` | imbue → one ability | 75 (% importance) |  | adds | R23: codename has `imbued`. |
| `bullet_resistance` | +8% Bullet Resist | 8 (eff %) |  | adds | Direct. |
| `melee_resistance` | bullet pseudo | 4 (eff %) |  | adds | Per 01. |
| `spirit_damage` | T3 Spirit baseline | 8.3 (SP-equiv) |  | adds | R31. |

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
| `spirit_damage` | +28 SP for imbued + T3 baseline | 25 (SP-equiv) |  | adds | (28 × ~0.6 imbue-uptime) + 8.3 baseline = 25. |
| `single_ability_focus` | imbue → one ability | 75 (% importance) |  | adds | R23. |
| `fire_rate` | +20% × uptime | 8 (eff %) |  | adds | 20 × ~0.4 post-cast uptime. |
| `horizontal_mobility` | +1.75m × 8/20 | 0.5 (m/s eff) |  | adds | Active uptime. |
| `spirit_burst_damage` | post-cast SP burst | 14 (dmg-equiv within 1s) |  | adds | R2 + cast-burst flavor. |
| `spirit_continuous_damage` | SP lifts sustained | 14 (dmg-equiv outside 1s) |  | adds | R2. |
| `gun_burst_damage` | fire-rate burst window | 9 (dmg-% within 1s) |  | adds | R2 (fire_rate burst-heavy). |
| `hybrid_damage_usage` | spirit+gun bridge | 55 (% importance) |  | adds | Hybrid imbue. |
| `self_buff` | post-cast buff state | 50 (% importance) |  | adds | R19 legitimate buff. |

---

## Tankbuster
- **normalized_name**: `tankbuster` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_magic_shock`
- **wiki**: https://deadlock.wiki/Tankbuster

### Interpretation
Anti-tank %max-HP proc: 40 damage + 8% Current Health Bonus Damage, +50 HP. Counter-flavored anti-tank pure damage tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Damage | 40 | Passive (proc) |
| Current Health Bonus Damage | 8% | Passive (%current HP) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 8% current HP bonus | 80 (eff dmg) |  | adds | %max-HP scaling damage. |
| `counter_importance` | anti-tank counter | 80 (% importance) |  | adds | R27: dedicated tank-buster. |
| `spirit_damage` | 40 + 8%HP proc as SP-equiv + T3 baseline | 25 (SP-equiv) |  | adds | Per 01 amortized. |
| `spirit_continuous_proc` | per-ability proc | 0.4 (proc index) |  | adds | R5 continuous-flavor. |
| `spirit_burst_proc` | first-proc burst | 0.5 (proc index) |  | adds | R5. |
| `spirit_burst_damage` | first-trigger dmg in 1s | 120 (raw dmg within 1s) |  | adds | 40 + 8%×1000HP = 120 raw on a 1000-HP target. |
| `enemy_weight` — N/A row | — | — | — | — | (Skip — hero-specific not item.) |
| `high_max_hp` | +50 HP (Spirit) | 50 (HP) |  | adds | Explicit. |

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
| `aoe_cluster` | 9m AoE pulse | 60 (% importance) |  | adds | AoE flavor. |
| `spirit_damage` | (25+0.23×20)×pulses /5 + T3 baseline | 38 (SP-equiv) |  | adds | (29.6 × ~5 pulses/fight)/5 + 8.3 = 38. |
| `spirit_continuous_damage` | sustained pulse DPS outside 1s | 130 (raw dmg outside 1s) |  | adds | Sustained pulse damage. |
| `spirit_burst_damage` | first pulse within 1s | 30 (raw dmg within 1s) |  | adds | First pulse. |
| `spirit_continuous_proc` | passive pulse-on-tick | 0.45 (proc index) |  | adds | R5 continuous. |
| `melee_resistance` | +18% | 18 (eff %) |  | adds | Direct passive. |
| `close_range` | 9m aura → close-fight friendly | 50 (% importance) |  | adds | Aura helps in close brawl. |
| `farmer` | aura clears nearby NPCs | 40 (% importance) |  | adds | R28. |
| `high_max_hp` | +100 HP (Spirit) | 100 (HP) |  | adds | Explicit. |
| `damage_sponge` | aura works while taking hits (incidental) | 25 (% importance) |  | relies | R26. |


---

