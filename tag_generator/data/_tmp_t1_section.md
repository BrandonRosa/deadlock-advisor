# T1 (800 souls)

## Extended Magazine
- **normalized_name**: `extended_magazine` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_clip_size`
- **wiki**: https://deadlock.wiki/Extended_Magazine

### Interpretation
Pure passive mag-size baseline: +30% Max Ammo and +8% Weapon Damage, always-on, no conditions. The named anchor for `magazine_size_dependant` at T1 — sets the bar that fancier ammo items must beat for their tier.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +30% | Passive |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +30% Max Ammo passive | 30 (eff ammo %) |  | adds | 30% × 1.0 uptime (pure passive). Sets the T1 anchor for clean passive ammo items. |
| `bullet_damage` | +8% Wpn Dmg + T1 weapon baseline | 13.2 (eff gun-dmg %) |  | adds | 8% explicit + 5.2% T1 implicit weapon baseline. Always-on. |
| `gun_burst_damage` | +8% per-shot in 1s window | 8 (dmg-% within 1s) |  | adds | R2: bullet_damage lifts gun_burst — per-shot amp applies inside <1s window. |
| `gun_continuous_damage` | +8% dmg sustained + bigger mag | 12 (dmg-% outside 1s) |  | adds | R2: bullet_damage lifts continuous; mag size adds more shots before reload break (mag lifts continuous only). |
| `farmer` | mag size aids wave clear | 25 (% importance) |  | adds | R28: cap 50. More shots/reload helps farm cadence. |

---

## Rapid Rounds
- **normalized_name**: `rapid_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_rapid_rounds`
- **wiki**: https://deadlock.wiki/Rapid_Rounds

### Interpretation
Clean passive fire-rate baseline: +9% Fire Rate, no conditions. The T1 anchor for pure passive fire-rate items per R32 — caps at 1.5, since pure-axis flat-stat items don't reach the 2.0 effect-per-cost ceiling.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +9% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +9% Fire Rate passive | 9 (eff %) |  | adds | Direct fire-rate %, full uptime. R32: cap 1.5 — pure flat-stat single-axis. |
| `bullet_damage` | T1 weapon baseline (implicit) | 5.2 (eff gun-dmg %) |  | adds | R31: every Weapon item carries the per-tier weapon baseline even with no explicit weapon% stat. |
| `gun_burst_damage` | +9% RPM → more shots/sec inside 1s | 9 (dmg-% within 1s) |  | adds | R2 corrected: fire_rate lifts burst MORE than continuous — burst is DPS in 1s, fire rate directly increases shots-per-second in that window. |
| `gun_continuous_damage` | +9% RPM lifts sustained mildly | 5 (dmg-% outside 1s) |  | adds | R2 corrected: continuous is mag/ammo-gated; fire_rate only helps until you reload. |
| `magazine_size_dependant` | faster fire drains mag faster | 3 (eff ammo %) |  | relies | Fire-rate items rely on having enough ammo to sustain. |

---

## Close Quarters
- **normalized_name**: `close_quarters` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_close_range`
- **wiki**: https://deadlock.wiki/Close_Quarters

### Interpretation
Conditional weapon-damage amp for fights inside 15m, plus +20% Melee Resist. The T1 close-range gun-amp template: huge in-the-pocket DPS at the cost of zero long-range value.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +20% | Passive, conditional <15m |
| Melee Resist | +20% | Passive |
| Close Range | 15m | Condition trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +20% Wpn Dmg <15m + T1 baseline | 16 (eff gun-dmg %) |  | adds | (20% × ~0.55 close-range uptime) + 5.2% T1 baseline ≈ 11 + 5.2 = 16. |
| `bullet_damage` | scales with close-range gun build | 20 (eff gun-dmg %) |  | relies | The full 20% only realizes within 15m — RELIES on close-range play. |
| `close_range` | gun amp inside 15m | 90 (% importance) |  | adds | Item literally cannot deliver outside 15m. |
| `long_range` | anti-affinity at 20m+ | -25 (% importance) |  | adds | R30: range-gated item, encode small negative for explicit anti-synergy. |
| `melee_damage` | R18 close-range gun amp at melee dist. | 10 (eff melee-dmg %) |  | adds | R18: weapon damage in melee range counts toward melee_damage at ~50% weight (20×0.5=10). |
| `melee_resistance` | +20% Melee Resist passive | 20 (eff %) |  | adds | Full passive uptime. |
| `gun_burst_damage` | per-shot amp lifts burst (close) | 11 (dmg-% within 1s) |  | adds | R2 + close-range uptime applied. |
| `gun_continuous_damage` | sustained close-fire | 11 (dmg-% outside 1s) |  | adds | R2 + uptime — bullet_damage lifts both equally. |
| `engage` | rewards committing to close range | 60 (% importance) |  | adds | Item rewards engaging. |
| `grounded` | close-range fighting is grounded | 40 (% importance) |  | adds | R7. |

---

## Headshot Booster
- **normalized_name**: `headshot_booster` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_headshot_booster`
- **wiki**: https://deadlock.wiki/Headshot_Booster

### Interpretation
Flat +45 bonus damage on headshots plus +30 HP cushion. The named anchor for `headshot_damage` at T1 — the cheapest way to start scaling the headshot-importance axis.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Head Shot Bonus Damage | +45 | Passive |
| Bonus Health | +30 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `headshot_damage` | +45 bonus dmg per headshot | 60 (% importance) |  | adds | Per 01: headshot_damage is % importance, not flat damage. T1 named anchor → ~60. |
| `bullet_damage` | T1 weapon baseline (implicit) | 5.2 (eff gun-dmg %) |  | adds | R31: per-tier weapon baseline only. |
| `gun_burst_proc` | +45 dmg on first head — burst-flavored | 1.0 (proc index) |  | adds | Instant proc (single-shot head) with instant payout, MaxProcWindow≈0.1s → 100%×(0.1/0.1)=1.0 burst index. |
| `gun_burst_damage` | first-head dmg in 1s | 45 (raw dmg within 1s) |  | adds | One headshot delivers 45 raw bonus damage in the 1s window. |
| `single_target` | headshots are single-target | 60 (% importance) |  | adds | Headshot is point-and-click. |
| `high_max_hp` | +30 HP explicit | 30 (HP) |  | adds | Weapon item — only explicit HP counts (no Vitality baseline cross-credit). |
| `mid_range` | typical head-range bands | 40 (% importance) |  | adds | Headshots happen most at mid-range engagements. |
| `long_range` | small head-rate at scope ranges | 30 (% importance) |  | adds | Headshots happen at long range with patience too. |

---

## High-Velocity Rounds
- **normalized_name**: `high_velocity_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_high_velocity_mag`
- **wiki**: https://deadlock.wiki/High-Velocity_Rounds

### Interpretation
+60% Bullet Velocity and +8% Weapon Damage — faster bullets mean easier long-range tracking and better headshot landing at distance. The T1 long-range enabler; range-flat 60% bullet speed earns the same Normalized at every tier (per 03 sparse-tier rule).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | faster bullets = easier hits 20m+ | 50 (% importance) |  | adds | Bullet velocity matters most at long range where projectile lead matters. |
| `mid_range` | also helps 11–19m tracking | 30 (% importance) |  | adds | Moderate help in default band. |
| `bullet_damage` | +8% Wpn Dmg + T1 baseline | 13.2 (eff gun-dmg %) |  | adds | 8% explicit + 5.2% T1 implicit. |
| `gun_burst_damage` | per-shot amp | 8 (dmg-% within 1s) |  | adds | R2: bullet_damage equally lifts both. |
| `gun_continuous_damage` | sustained DPS | 8 (dmg-% outside 1s) |  | adds | R2. |
| `headshot_damage` | faster bullets aid headshots | 30 (% importance) |  | adds | Headshot affinity from bullet velocity. |
| `single_target` | aimed shots are single-target | 35 (% importance) |  | adds | Long-range aim. |

---

## Monster Rounds
- **normalized_name**: `monster_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_non_player_bonus`
- **wiki**: https://deadlock.wiki/Monster_Rounds

### Interpretation
NPC-focused farm item: +25% Weapon Damage and +25% Bullet Resist vs NPCs, plus +1 OOC Regen. The cleanest dedicated `farmer` item — NPC-only bonus does NOT inflate hero `bullet_damage` (per 03 judgment anchor rule).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs. NPCs | +25% | Passive (NPC-only) |
| Bullet Resist vs. NPCs | +25% | Passive (NPC-only) |
| Out of Combat Regen | +1 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | +25% wpn dmg + 25% resist vs NPCs | 80 (% importance) |  | adds | Highest-purity farm item at T1. |
| `bullet_damage` | T1 weapon baseline ONLY | 5.2 (eff gun-dmg %) |  | adds | R31: NPC-only damage does NOT count toward hero bullet_damage (per 03 anchor rule). |
| `self_heal` | +1 OOC regen | 4.5 (HP total) |  | adds | 1 HP/s × ~15s OOC session × 0.3 between-fight uptime ≈ 4.5 HP per cycle. |
| `continous_heal` | OOC regen outside 1s | 4.2 (HP outside 1s) |  | adds | 1 × (15−1)s × 0.3 = 4.2 HP outside the first 1s of OOC. |
| `high_max_hp` | OOC sustain = effective HP cushion | 15 (HP) |  | relies | R8: heal-pseudo items rely on HP cushion. |
| `gun_burst_damage` | hero damage floor only | 5 (dmg-% within 1s) |  | adds | R2 floor from baseline; NPC-only doesn't count. |
| `gun_continuous_damage` | hero damage floor only | 5 (dmg-% outside 1s) |  | adds | R2 floor. |

---

## Restorative Shot
- **normalized_name**: `restorative_shot` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_medic_bullets`
- **wiki**: https://deadlock.wiki/Restorative_Shot

### Interpretation
Heal-on-hit Weapon: +6% Weapon Damage passive, plus 50 HP heal on hero hit / 20 HP heal on NPC-or-orb hit. The T1 lane-sustain weapon — combines gun lifesteal flavor with farming sustain.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Healing From Heroes | 50 | Passive (on hit) |
| Healing From NPCs / Orbs | 20 | Passive (on hit) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 50 HP per hero hit + 20 per NPC hit (per-fight total) | 65 (HP total) |  | adds | Typical fight: ~1 hero proc (50 HP) + several NPC procs (~15 HP cumulative). |
| `burst_heal` | proc fires inside 1s of trigger | 35 (HP within 1s) |  | adds | 50 × 0.7 uptime — proc is instant on the triggering hit. |
| `continous_heal` | sustained heal-on-hit outside 1s | 28 (HP outside 1s) |  | adds | 50/5s = 10 HP/s × 4s × 0.7 uptime = 28 HP outside the first 1s window. |
| `farmer` | NPC heals enable laning sustain | 40 (% importance) |  | adds | R28: sustain enables farming uptime. |
| `bullet_damage` | +6% Wpn Dmg + T1 baseline | 11.2 (eff gun-dmg %) |  | adds | 6% + 5.2% T1 baseline. |
| `gun_burst_damage` | per-shot lift | 6 (dmg-% within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained DPS+heal pairing | 6 (dmg-% outside 1s) |  | adds | R2. |
| `high_max_hp` | heal scales with HP cushion | 15 (HP) |  | relies | R8. |
| `gun_continuous_proc` | every bullet hit heals — sustained proc | 0.12 (proc index) |  | adds | R5: heal-proc on hit, no internal cd, single-target. ProcImportance≈70% / (1.0 × 6s effect amortized) = 0.12. |

---

## Extra Health
- **normalized_name**: `extra_health` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health`
- **wiki**: https://deadlock.wiki/Extra_Health

### Interpretation
Pure flat +210 Bonus Health. The T1 named anchor for `high_max_hp` — cap 1.5 per R32 (pure single-axis flat-stat items don't reach 2.0; hybrid HP-scaling items like Colossus / Fortitude do).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +210 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | +210 Bonus Health passive | 210 (HP) |  | adds | Pure flat HP. T1 anchor; cap 1.5 per R32. |
| `damage_sponge` | bigger HP = absorb more (incidental) | 20 (% importance) |  | relies | R26: incidental, not the item's purpose — small partial. |
| `large_hitbox` | more HP softly correlates | 10 (% importance) |  | relies | Very small partial. |

---

## Extra Regen
- **normalized_name**: `extra_regen` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_endurance`
- **wiki**: https://deadlock.wiki/Extra_Regen

### Interpretation
+2.5 Health Regen and +1.5 Out of Combat Regen — pure passive sustain item, no triggers. The T1 always-on regen baseline for lane sustain.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +2.5 | Passive (always on) |
| Out of Combat Regen | +1.5 | Passive (OOC only) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 2.5 always × ~29s post-burst + 1.5 OOC × 9s | 88.5 (HP outside 1s) |  | adds | Realistic gank/escape: 1.5×(10−1)s OOC + 2.5×30s always-on = 13.5 + 75 = 88.5 HP total outside 1s. |
| `burst_heal` | regen within first 1s | 4 (HP within 1s) |  | adds | 2.5+1.5 ≈ 4 HP in the first 1s window. |
| `self_heal` | total per gank/escape cycle | 92 (HP total) |  | adds | Sum of burst + continuous. |
| `high_max_hp` | T1 Vitality baseline | 19 (HP) |  | adds | R31: T1 Vitality baseline ≈ +3.8% × 500 base ≈ +19 HP equivalent. |
| `high_max_hp` | regen scales with HP cushion | 25 (HP) |  | relies | R8/R10. |
| `farmer` | sustain enables farm uptime | 30 (% importance) |  | adds | R28. |
| `damage_sponge` | regen-tank synergy (incidental) | 15 (% importance) |  | relies | R26 small. |

---

## Extra Stamina
- **normalized_name**: `extra_stamina` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_improved_stamina`
- **wiki**: https://deadlock.wiki/Extra_Stamina

### Interpretation
+1 Stamina charge and +12% Stamina Recovery — the T1 stamina-bundle item. Per R9, stamina items get the full mobility suite: horizontal + vertical + aerial + engage + escape.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive (extra charge) |
| Stamina Recovery | +12% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +1 stamina = extra dash/jump | 1 (units) |  | adds | R9: each stamina charge ≈ +1 vertical traverse unit. |
| `horizontal_mobility` | +1 stamina dash = ~0.7 m/s effective | 0.7 (m/s eff) |  | adds | Per 01: 1 stamina dash ≈ 6m over ~9–10s cycle → 0.6–0.7 m/s. |
| `aerial` | extra mid-air dash | 40 (% importance) |  | adds | R9. |
| `engage` | extra dash to close gaps | 50 (% importance) |  | adds | R9. |
| `escape` | extra dash to retreat | 50 (% importance) |  | adds | R9. |
| `high_max_hp` | T1 Vitality baseline | 19 (HP) |  | adds | R31. |
| `farmer` | mobility enables jungle/lane rotations | 25 (% importance) |  | adds | R28: cap 50. |
| `small_hitbox` | mobility = harder to hit (partial) | 25 (% importance) |  | adds | R26: incidental, not item's purpose. |

---

## Healing Rite
- **normalized_name**: `healing_rite` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health_stimpak`
- **wiki**: https://deadlock.wiki/Healing_Rite

### Interpretation
Active heal cast on self or ally: 300 total HP over 20s, +2m sprint while channeling, 30m cast range. The T1 utility-heal anchor — self OR ally cast makes it `assist_importance`-relevant.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Total HP Regen | 300 | Active (over 20s) |
| Sprint Speed Conditional | +2m | Active (while channeling) |
| Regen Duration | 20s | Active |
| Cast Range | 30m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 300 HP / 20s on self-cast (~67% self) | 200 (HP total) |  | adds | 300 × 0.67 self-uptime = 200 HP per cast on self. R32: pure utility heal — cap 1.5. |
| `team_heal` | 300 HP / 20s on ally-cast (~33% ally) | 100 (HP total) |  | adds | 33% ally-cast share × 300 HP = 100. |
| `burst_heal` | first-1s tick value | 15 (HP within 1s) |  | adds | 300/20s = 15 HP/s — only 15 HP within the 1s window (not a burst tool). |
| `continous_heal` | rest of the heal outside 1s | 285 (HP outside 1s) |  | adds | 300 − 15 = 285 HP over the remaining 19s. |
| `assist_importance` | ally-targetable heal | 70 (% importance) |  | adds | R27: clear support-flavored tool. |
| `counter_importance` | reactive heal vs burst | 35 (% importance) |  | adds | R13. |
| `horizontal_mobility` | +2m sprint while channeling | 1.0 (m/s eff) |  | adds | Channel-only ×0.5 discount: 2 × 0.5 = 1 m/s effective. |
| `high_max_hp` | T1 Vitality baseline | 19 (HP) |  | adds | R31. |
| `high_max_hp` | heal scales with carrier HP | 20 (HP) |  | relies | R8/R10. |
| `farmer` | sustain enables farm uptime | 30 (% importance) |  | adds | R28. |

---

## Melee Lifesteal
- **normalized_name**: `melee_lifesteal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_lifestrike_gauntlets`
- **wiki**: https://deadlock.wiki/Melee_Lifesteal

### Interpretation
+12% Melee Damage and 100 HP heal on melee hit. The T1 melee-flavored sustain item — implicitly grounded, R21 makes it a close_range-only item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +12% | Passive |
| Heal on Melee Hit | 100 | Passive (on melee strike) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +12% melee dmg | 12 (eff melee-dmg %) |  | adds | Direct passive %. |
| `self_heal` | 100 HP per melee strike (typical 1–2 procs/fight) | 120 (HP total) |  | adds | ~1.2 melee-strikes per fight × 100 HP. |
| `burst_heal` | each melee proc lands instantly | 100 (HP within 1s) |  | adds | The 100 HP heal triggers on contact — single-tick. |
| `close_range` | melee-only item | 90 (% importance) |  | adds | R21: melee items score close_range 80–100 (cannot function outside ~3m). |
| `long_range` | anti-affinity | -40 (% importance) |  | adds | R30: melee-gated item gets small negative long_range. |
| `engage` | melee strike commits a fight | 70 (% importance) |  | adds | R11. |
| `grounded` | melee is grounded | 50 (% importance) |  | adds | R7. |
| `high_max_hp` | T1 Vitality baseline | 19 (HP) |  | adds | R31. |
| `high_max_hp` | heal scales with HP | 15 (HP) |  | relies | R8. |
| `damage_sponge` | melee brawler synergy (incidental) | 20 (% importance) |  | relies | R26 partial. |

---

## Rebuttal
- **normalized_name**: `rebuttal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_melee_rebuttal`
- **wiki**: https://deadlock.wiki/Rebuttal

### Interpretation
Parry-flavored defensive: -1.75s Parry Cooldown, +18% Melee Resist, +75 Bonus Health, and a conditional +30% Bonus Damage 6s buff after parry. R19 case where `self_buff` legitimately applies (conditional-uptime buff state).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Parry Cooldown | -1.75s | Passive |
| Melee Resist | +18% | Passive |
| Bonus Health | +75 | Passive |
| Bonus Damage Conditional | +30% | Conditional (post-parry buff) |
| Buff Duration | 6s | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_resistance` | +18% + parry-cd pseudo | 23 (eff %) |  | adds | 18% explicit + R22 parry-CD pseudo (-1.75s on ~6s base ≈ +29% more parries × ~15% base parry effect ≈ +5%). |
| `bullet_resistance` | parry-cd small pseudo bullet | 4 (eff %) |  | adds | R22 partial. |
| `high_max_hp` | +75 HP + T1 baseline | 94 (HP) |  | adds | 75 + 19 T1 baseline. |
| `self_buff` | +30% bonus dmg post-parry, 6s | 30 (% importance) |  | adds | R19 legitimate: conditional-uptime buff state. |
| `bullet_damage` | self_buff dmg lifts gun | 8 (eff gun-dmg %) |  | relies | The 30% buff lifts bullet damage when active. |
| `counter_importance` | parry is reactive | 70 (% importance) |  | adds | R13/R27: explicit counter to melee strikes. |
| `engage` | post-parry damage window | 30 (% importance) |  | adds | The buff rewards engaging after a parry. |
| `grounded` | parry mechanic is grounded | 30 (% importance) |  | adds | R7. |
| `damage_sponge` | tank-counter synergy (incidental) | 20 (% importance) |  | relies | R26. |

---

## Sprint Boots
- **normalized_name**: `sprint_boots` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_sprint_booster`
- **wiki**: https://deadlock.wiki/Sprint_Boots

### Interpretation
+2m Sprint Speed and +2 Out of Combat Regen — the cheapest rotation/sustain hybrid. Sprint speed only applies while sprinting (not aiming/shooting), so ×0.5 channel-only discount applies to the mobility raw.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +2m | Passive (sprint only) |
| Out of Combat Regen | +2 | Passive (OOC only) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m sprint-only | 1.0 (m/s eff) |  | adds | Sprint-only ×0.5: 2 × 0.5 = 1 m/s effective. |
| `self_heal` | +2 OOC regen | 9 (HP total) |  | adds | 2 HP/s × 15s OOC × 0.3 uptime ≈ 9 HP per cycle. |
| `continous_heal` | OOC regen outside 1s | 8.4 (HP outside 1s) |  | adds | 2 × (15−1) × 0.3 = 8.4. |
| `burst_heal` | OOC first-1s contribution | 0.6 (HP within 1s) |  | adds | Small initial tick. |
| `farmer` | rotation speed = farm uptime | 35 (% importance) |  | adds | R28/R14: mobility item gets farm credit. |
| `high_max_hp` | T1 Vitality baseline | 19 (HP) |  | adds | R31. |
| `escape` | sprint disengage | 45 (% importance) |  | adds | Sprint enables retreats. |
| `engage` | sprint approach | 35 (% importance) |  | adds | Sprint also enables rotations into fights. |
| `small_hitbox` | faster = harder to hit (partial) | 20 (% importance) |  | adds | R26 incidental. |

---

## Extra Charge
- **normalized_name**: `extra_charge` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_extra_charge`
- **wiki**: https://deadlock.wiki/Extra_Charge

### Interpretation
+1 Bonus Ability Charge for a chosen ability, +7 Bonus Spirit Power for Charged Abilities. The T1 charge-stack item per R29 — gets `cooldown_reduction adds` credit even though it has no explicit CDR%. NOT an imbue item (R23 does NOT apply).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Ability Charges | +1 | Passive (single chosen ability) |
| Bonus Spirit Power for Charged Abilities | +7 | Passive (charged abilities scope) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +1 charge — defining axis | 70 (% importance) |  | adds | T1 charge-economy anchor. |
| `cooldown_reduction` | extra charge ≈ back-to-back casts | 8 (eff CDR %) |  | adds | R29: 0.3–0.5 Normalized range. ~8% effective CDR for the target ability. |
| `spirit_damage` | +7 SP for charged abilities + T1 baseline | 8.5 (SP-equiv) |  | adds | T1 Spirit baseline 4.3 + (7 SP × ~0.6 charged-uptime) = 8.5. |
| `spirit_burst_damage` | charge-ability burst | 5 (dmg-equiv within 1s) |  | adds | R2 propagation (SP equally lifts spirit burst/continuous). |
| `spirit_continuous_damage` | charge-ability sustained | 5 (dmg-equiv outside 1s) |  | adds | R2. |
| `ability_spam` | more casts possible | 35 (% importance) |  | adds | Extra charge = higher uses/s ceiling. |
| `farmer` | charge-eco = more farm casts | 30 (% importance) |  | adds | R28/R29 — charge-stack helps farm cadence. |

---

## Extra Spirit
- **normalized_name**: `extra_spirit` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_improved_spirit`
- **wiki**: https://deadlock.wiki/Extra_Spirit

### Interpretation
Pure flat +10 Spirit Power, no conditions. The cleanest T1 SP baseline — R19 explicitly says flat SP is NOT `self_buff` (already captured by `spirit_damage`).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +10 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +10 SP flat + T1 baseline | 14.3 (SP-equiv) |  | adds | 10 + 4.3 T1 implicit. |
| `spirit_burst_damage` | SP lifts spirit burst | 8 (dmg-equiv within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts sustained spirit | 8 (dmg-equiv outside 1s) |  | adds | R2 (SP equally lifts both). |
| `multi_ability_focus` | SP boosts all spirit abilities | 50 (% importance) |  | adds | R4: stat item that lifts every ability. |
| `single_ability_focus` | offsets multi-focus | -20 (% importance) |  | adds | R4. |

---

## Golden Goose Egg
- **normalized_name**: `golden_goose_egg` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_goose_egg`
- **wiki**: https://deadlock.wiki/Golden_Goose_Egg

### Interpretation
Soul-farming oddity: 90 souls/min, -10% damage penalty (sold-before-it-matters per R20), +1m sprint, +1 OOC regen. The iconic `scaling_late` anchor — bought early, sold once it has generated souls for a late-game spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Soul Value per Minute | 90 | Active |
| Damage Penalty | -10% | Passive (penalty, ignored per R20) |
| Sprint Speed | +1m | Passive (sprint only) |
| Out of Combat Regen | +1 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `scaling_late` | item rewards late-peaking heroes via souls | 80 (% importance) |  | adds | The defining `scaling_late` anchor — penalty now, soul-snowball later. |
| `farmer` | direct soul/min econ | 80 (% importance) |  | adds | R28: highest-purity econ item at T1. |
| `horizontal_mobility` | +1m sprint-only | 0.5 (m/s eff) |  | adds | Sprint-only ×0.5: 1 × 0.5 = 0.5 m/s. |
| `self_heal` | +1 OOC regen | 4.5 (HP total) |  | adds | 1 × 15 × 0.3 ≈ 4.5 HP per OOC cycle. |
| `spirit_damage` | T1 Spirit baseline only | 4.3 (SP-equiv) |  | adds | R31. (Damage penalty NOT scored per R20.) |
| `escape` | sprint helps disengage | 25 (% importance) |  | adds | Mobility utility. |

---

## Mystic Burst
- **normalized_name**: `mystic_burst` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_magic_burst`
- **wiki**: https://deadlock.wiki/Mystic_Burst

### Interpretation
Spirit-damage proc: deal 40 bonus damage on next spirit hit, 14s cooldown. The named anchor for `spirit_burst_proc` (instant trigger, instant payout, 100% × 0.1/0.1 = 1.0 burst index) and the T1 paradigm for `scaling_early` per R17 — defines greedy early-spirit burst.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Damage | 40 | Passive (proc on spirit damage) |
| Cooldown | 14s | Passive (between procs) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_proc` | 40 dmg, instant trigger, instant payout | 1.0 (proc index) |  | adds | 100% × (0.1s effect / 0.1s window) = 1.0. The named proc-index anchor. |
| `spirit_burst_damage` | 40 raw spirit dmg in 1s | 40 (raw dmg within 1s) |  | adds | The 40 bonus damage IS spirit damage delivered in the 1s burst window. |
| `spirit_damage` | proc dmg as SP-equiv + T1 baseline | 12.3 (SP-equiv) |  | adds | (40 + 0×20)/5 = 8 SP-equiv (no scaling field) + 4.3 T1 baseline = 12.3. |
| `aoe_cluster` | small AoE on proc | 25 (% importance) |  | adds | Wiki notes typically show some splash; small partial. |
| `multi_ability_focus` | works with any spirit ability | 40 (% importance) |  | adds | R4: universal spirit proc. |
| `scaling_early` | T1 paradigm-defining greedy early proc | 90 (% importance) |  | adds | R17: this IS the early-game greedy-spirit-caster anchor. |
| `farmer` | proc-on-cast aids farming | 30 (% importance) |  | adds | R28. |

---

## Mystic Expansion
- **normalized_name**: `mystic_expansion` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_magic_reach`
- **wiki**: https://deadlock.wiki/Mystic_Expansion

### Interpretation
+20% Ability Range as an IMBUED item (binds to one ability slot per R23). The T1 anchor for `range_extender_dependant adds` — score larger as an "adds" item than as a "relies" item per general rule 7.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +20% | Passive (imbued — single ability) |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +20% Ability Range | 20 (eff %) |  | adds | The named anchor for ADD-mode range extension at T1. |
| `single_ability_focus` | imbue → one ability | 75 (% importance) |  | adds | R23: imbue items are single-ability by codename + mechanic. |
| `spirit_damage` | T1 Spirit baseline only | 4.3 (SP-equiv) |  | adds | R31. |

---

## Mystic Regeneration
- **normalized_name**: `mystic_regeneration` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_mystic_regeneration`
- **wiki**: https://deadlock.wiki/Mystic_Regeneration

### Interpretation
Triggered self-regen: +50 Bonus Health and 4 HP/s for 7s on trigger. Per the 04 judgment-fact table: `self_heal raw = rate × duration × uptime`; `continous_heal raw = rate × (duration−1s) × uptime` for total HP outside 1s.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| HP/s Regeneration | 4 | Triggered (post-damage) |
| Regeneration Duration | 7s | Triggered |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 4 HP/s × 7s × 0.75 trigger uptime | 21 (HP total) |  | adds | Per 04: rate × duration × uptime = 4 × 7 × 0.75. |
| `continous_heal` | rest of heal outside 1s | 18 (HP outside 1s) |  | adds | 4 × (7−1) × 0.75 = 18 HP outside the 1s window. |
| `burst_heal` | first 1s tick | 3 (HP within 1s) |  | adds | 4 × 1 × 0.75 = 3 HP inside the 1s window. |
| `high_max_hp` | +50 HP explicit (Spirit item, no Vitality baseline) | 50 (HP) |  | adds | 50 explicit. Spirit category — no cross-baseline credit. |
| `high_max_hp` | heal scales with HP | 15 (HP) |  | relies | R8/R10. |
| `damage_sponge` | regen triggers on damage (small) | 30 (% importance) |  | relies | R26 partial — trigger IS on damage, but item's purpose is sustain. |
| `spirit_damage` | T1 Spirit baseline | 4.3 (SP-equiv) |  | adds | R31. |
| `farmer` | sustain → farm uptime | 30 (% importance) |  | adds | R28. |

---

## Rusted Barrel
- **normalized_name**: `rusted_barrel` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_withering_whip`
- **wiki**: https://deadlock.wiki/Rusted_Barrel

### Interpretation
Single-target active debuff: -32% Fire Rate and -8% Bullet Resist (shred) on enemy, 5s/20s cycle, 32m cast range. Per 01: fire_rate_slow = slow% × uptime × targets → 32 × (5/20) × 1 = 8 effective (not the raw 32%).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +60 | Passive |
| Sprint Speed | +0.5m | Passive (sprint only) |
| Fire Rate Conditional | -32% | Active (enemy debuff) |
| Bullet Resist Conditional | -8% | Active (enemy debuff) |
| Cast Range | 32m | Active |
| Duration | 5s | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -32% × 5/20 × 1 target | 8 (eff slow %) |  | adds | Per 01 formula: 32×0.25×1=8 effective slow. |
| `bullet_resist_shred` | -8% × 5/20 active | 2 (eff shred %) |  | adds | Active uptime ×0.25 single-target: 8×0.25=2. |
| `bullet_resistance` | fire-rate-slow pseudo-credit | 5 (eff %) |  | adds | Per 01 pseudo: fire-rate slow proportional toward bullet_resistance. |
| `gun_continuous_resistance` | sustained-fire denial | 5 (eff %) |  | adds | Same pseudo. |
| `high_max_hp` | +60 HP explicit (Spirit item) | 60 (HP) |  | adds | Direct. |
| `horizontal_mobility` | +0.5m sprint-only | 0.25 (m/s eff) |  | adds | Sprint-only ×0.5. |
| `single_target` | single-target active | 60 (% importance) |  | adds | Per 01: importance × uptime. |
| `mid_range` | 32m cast | 30 (% importance) |  | adds | Cast range straddles mid/long. |
| `long_range` | 32m cast also covers long | 25 (% importance) |  | adds | Lower weight at 20m+. |
| `counter_importance` | reactive fire-rate denial | 50 (% importance) |  | adds | R13. |
| `debuff` | enemy debuff (low cleanse priority) | 15 (% importance) |  | adds | Low priority. |
| `spirit_damage` | T1 Spirit baseline | 4.3 (SP-equiv) |  | adds | R31. |

---

## Spirit Strike
- **normalized_name**: `spirit_strike` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_acolytes_glove`
- **wiki**: https://deadlock.wiki/Spirit_Strike

### Interpretation
Melee-proc spirit damage: 40 + 0.37×Spirit Power on melee hit, applies -6% Spirit Resist (shred) for 6s. The T1 melee-spirit hybrid — grounded close-range proc.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage | 40 base + 0.37 × Spirit Power | Passive (melee-hit proc) |
| Spirit Resist Conditional | -6% | Passive (debuff on melee) |
| Duration | 6s | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 40 + 0.37×SP proc + T1 baseline | 13.8 (SP-equiv) |  | adds | (40 + 0.37×20)/5 + 4.3 baseline = 9.5 + 4.3. |
| `spirit_damage` | scales with SP stacking | 7 (SP-equiv) |  | relies | The 0.37×SP scaling. |
| `spirit_burst_damage` | proc dmg in 1s window | 47 (raw dmg within 1s) |  | adds | 40 + 0.37×20 = 47.4 raw spirit dmg per melee hit. |
| `spirit_burst_proc` | proc on melee impact | 0.8 (proc index) |  | adds | Burst-flavored (melee = instant trigger), 6s effect duration with ~0.5s trigger window. |
| `spirit_resist_shred` | -6% × melee-uptime | 3 (eff shred %) |  | adds | 6% × ~0.5 melee uptime. |
| `melee_damage` | melee-triggered spirit | 8 (eff melee-dmg %) |  | adds | R12: melee counts; proc lives on melee triggers. |
| `close_range` | melee-trigger only | 75 (% importance) |  | adds | R21: melee-only proc. |
| `long_range` | anti-affinity | -30 (% importance) |  | adds | R30: melee-gated. |
| `grounded` | melee is grounded | 40 (% importance) |  | adds | R7. |
| `engage` | melee strikes commit | 50 (% importance) |  | adds | R11. |


---

