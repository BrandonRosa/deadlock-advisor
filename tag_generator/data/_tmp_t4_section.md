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
| `bullet_resist_shred` | 55% chance to fully bypass BR + evasion | 19 (eff shred %) |  | adds | ⚖️ Named anchor. 0.55 × ~35% effective resist bypassed ≈ 19% effective shred. |
| `bullet_damage` | +8% + 55% bypass amp + T4 baseline | 25 (eff gun-dmg %) |  | adds | 8 + (0.55 × ~17% effective BR-bypass amp) + 9.6 baseline. |
| `gun_burst_damage` | per-shot amp within 1s | 65 (raw dmg within 1s) |  | adds | R2: bullet_damage lifts burst. Per-shot bypass on burst window. |
| `gun_continuous_damage` | sustained pierce dmg outside 1s | 220 (raw dmg outside 1s) |  | adds | R2: sustained per-shot amp. |
| `gun_burst_proc` | pierce roll every shot | 0.30 (proc index) |  | adds | R6: per-shot proc, instant effect. |
| `gun_continuous_proc` | sustained pierce roll | 0.55 (proc index) |  | adds | 55% per-shot in sustained fire. |
| `counter_importance` | counters Plated Armor + evasion + resist stacking | 70 (% importance) |  | adds | R13: ⚖️ Notes explicitly call out Plated Armor + bullet evasion bypass. |
| `single_target` | bullet-only, no AoE | 55 (% importance) |  | adds | Per-bullet effect. |
| `long_range` | +60% bullet velocity favors long-range | 35 (% importance) |  | adds | Velocity benefits ranged shots most. |


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
| `aoe_cluster` | 6 jumps × 10m chain | 65 (% importance) |  | adds | Chain-lightning AoE. |
| `spirit_damage` | (43+0.19×20) × proc-rate × jumps + T4 baseline (Weapon item, no spirit baseline) | 38 (SP-equiv) |  | adds | Weapon item — no spirit baseline. 47 dmg/proc × 0.20 × ~4 effective jumps ≈ 38 SP-equiv. |
| `spirit_continuous_damage` | sustained proc dmg outside 1s | 140 (raw dmg outside 1s) |  | adds | Per-bullet proc, sustained. |
| `spirit_burst_damage` | first proc + initial chain within 1s | 50 (raw dmg within 1s) |  | adds | First-bullet shock. |
| `spirit_continuous_proc` | passive per-bullet shock | 0.50 (proc index) |  | adds | 20% per shot with 0.25s ICD ≈ 0.5. |
| `fire_rate` | +5% passive | 5 (eff %) |  | adds | Direct. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) |  | adds | R31 baseline only. |
| `movement_slow` | -75% × 3s × 1 target (active) | 32 (eff slow weighted) |  | adds | Active 3s slow. |
| `silence` | active silences movement items | 6 (weighted) |  | adds | Narrow silence (movement-only). |
| `counter_importance` | counter to mobility + stamina spam | 50 (% importance) |  | adds | R13. |
| `single_ability_focus` | active is the main payoff | 35 (% importance) |  | adds | R17 partial. |


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
| `bullet_resist_shred` | -16% × headshot uptime | 11 (eff shred %) |  | adds | 16 × ~0.7 headshot uptime (12s buff window). |
| `spirit_resist_shred` | -16% × headshot uptime | 11 (eff shred %) |  | adds | Same. Hybrid debuff anchor. |
| `anti_heal` | -35% healing red × uptime | 25 (eff %) |  | adds | 35 × ~0.7 uptime. |
| `headshot_damage` | headshot-gated entirely | 75 (% importance) |  | adds | R29: pure headshot trigger. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `high_max_hp` | +125 HP (Weapon item, no Vitality baseline) | 125 (HP) |  | adds | Explicit HP only. |
| `single_target` | headshot is single-target | 65 (% importance) |  | adds | Per-target debuff. |
| `mid_range` | headshots favor mid-range | 45 (% importance) |  | adds | Headshot tool. |
| `counter_importance` | counter to high-resist + heal-stack builds | 60 (% importance) |  | adds | Hybrid resist + anti-heal in one. |
| `hybrid_damage_usage` | shreds BOTH BR and SR | 50 (% importance) |  | adds | Hybrid synergy. |


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
| `melee_damage` | +22% direct + +25% on heavy + ability scaling | 45 (eff melee-dmg %) |  | adds | ⚖️ Named anchor — melee-DPS amp. 22 + (25×0.5 heavy-on-CD). |
| `bullet_resist_shred` | -4% × ~3 stacks avg × uptime | 7 (eff shred %) |  | adds | Stack ramp on melee-only. |
| `stun` | 0.5s × stack-ramp uptime | 0.3 (eff s) |  | adds | Requires 6 stacks (3 heavy hits). |
| `bullet_damage` | T4 baseline + per-shot via ammo refill | 12 (eff gun-dmg %) |  | adds | 9.6 baseline + small lift via ammo. |
| `gun_continuous_damage` | ammo refill extends sustained fire | 40 (raw dmg outside 1s) |  | adds | R2: magazine-size-like effect lifts continuous. |
| `magazine_size_dependant` | +15% ammo per melee hit | 12 (eff ammo %) |  | adds | 15 × ~0.8 uptime (on 5s CD). |
| `bullet_resistance` | +12% | 12 (eff %) |  | adds | Direct. |
| `close_range` | melee-gated | 95 (% importance) |  | adds | R21: pure melee tool. |
| `long_range` | anti-affinity | -40 (% importance) |  | adds | R30: melee. |
| `engage` | melee + stun commits | 80 (% importance) |  | adds | R11: heavy melee = engage. |
| `grounded` | melee is grounded | 50 (% importance) |  | adds | R7. |
| `counter_importance` | counter to high-BR targets | 40 (% importance) |  | adds | BR shred. |


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
| `low_max_hp` | trigger is <50% HP | 85 (HP) |  | adds | ⚖️ Named anchor — explicit low-HP trigger. |
| `fire_rate` | +15% + 40% × (10/16) trigger uptime | 40 (eff %) |  | adds | 15 + 40 × 0.63 = 40. |
| `bullet_damage` | T4 baseline + fire-rate lift | 18 (eff gun-dmg %) |  | adds | 9.6 + fire-rate-derived. |
| `gun_burst_damage` | fire-rate IS burst lift | 90 (raw dmg within 1s) |  | adds | R2: fire_rate lifts burst HEAVILY. |
| `gun_continuous_damage` | sustained lift | 30 (raw dmg outside 1s) |  | adds | R2: fire_rate lifts continuous lightly. |
| `horizontal_mobility` | +4m/s × trigger uptime | 2.5 (m/s eff) |  | adds | 4 × 0.63 uptime. |
| `debuff_resistance` | +40% × trigger | 25 (eff %) |  | adds | 40 × 0.63. |
| `high_max_hp` | +160 HP (Weapon item, no Vitality baseline) | 160 (HP) |  | adds | Explicit. |
| `damage_sponge` | low-HP trigger rewards taking dmg | 50 (% importance) |  | adds | R26: comeback-flavored. |
| `counter_importance` | comeback mechanic | 35 (% importance) |  | adds | R13: clutch tool. |
| `engage` | aggressive low-HP brawler | 45 (% importance) |  | adds | Encourages staying in fights. |


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
| `bullet_damage` | +80% direct + ~+30% from stacking FR + T4 baseline | 120 (eff gun-dmg %) |  | adds | ⚖️ Named bullet_damage anchor at T4. 80 + (7 × ~4 typical stacks) + 9.6 = ~118. |
| `fire_rate` | +7% × 4 typical stacks | 28 (eff %) |  | adds | Snowball average. |
| `gun_burst_damage` | per-shot + fire-rate burst lift | 220 (raw dmg within 1s) |  | adds | R2: FR + bullet-damage = huge burst. |
| `gun_continuous_damage` | sustained gun lift | 110 (raw dmg outside 1s) |  | adds | R2. |
| `scaling_late` | snowballs across kills | 80 (% importance) |  | adds | ⚖️ Greedy farm/kill scaling — peaks with stacks. |
| `high_kill_count` | rewards securing kills | 70 (% importance) |  | adds | Direct stack mechanic. |
| `low_max_hp` | -13% Max HP penalty | 65 (HP) |  | adds | Direct HP reduction = penalty. |
| `high_max_hp` | -13% Max HP = anti-HP | -65 (HP) |  | adds | Negative HP (penalty). |
| `damage_sponge` | -13% Max HP = anti-sponge | -30 (% importance) |  | adds | R26 mirror — explicit anti. |
| `single_target` | gun-DPS item | 50 (% importance) |  | adds | Gun-only amp. |
| `farmer` | needs kills to scale | 45 (% importance) |  | adds | R28: snowball-greedy farmer. |


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
| `bullet_damage` | +100% × 25% proc + T4 baseline | 35 (eff gun-dmg %) |  | adds | 100 × 0.25 = +25% effective + 9.6 baseline. |
| `gun_burst_damage` | per-shot 25% proc within 1s | 110 (raw dmg within 1s) |  | adds | R2: bullet_damage lift on burst. |
| `gun_continuous_damage` | sustained 25% proc + +30% ammo | 200 (raw dmg outside 1s) |  | adds | R2: bullet_damage + magazine lift = continuous heavy. |
| `gun_burst_proc` | per-shot Lucky roll | 0.30 (proc index) |  | adds | 25% per shot, instant trigger. |
| `gun_continuous_proc` | sustained proc | 0.55 (proc index) |  | adds | 25% per shot in sustained. |
| `magazine_size_dependant` | +30% ammo | 30 (eff ammo %) |  | adds | Direct passive. |
| `counter_importance` | counters Bullet Evasion | 40 (% importance) |  | adds | R13: explicit Notes — immune to evasion. |
| `single_target` | per-bullet | 50 (% importance) |  | adds | Per-shot proc. |


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
| `aoe_cluster` | bounces to 2 extra targets | 70 (% importance) |  | adds | ⚖️ Crowd-DPS amp. |
| `fire_rate` | +18% | 18 (eff %) |  | adds | Direct. |
| `bullet_damage` | T4 baseline + 65% × 2 in crowd | 22 (eff gun-dmg %) |  | adds | 9.6 baseline + ~13% effective vs crowd (only in 2+ target situations). |
| `gun_burst_damage` | fire-rate lifts burst + crowd multiplier | 150 (raw dmg within 1s) |  | adds | R2: fire-rate heavy on burst. |
| `gun_continuous_damage` | sustained gun + crowd | 90 (raw dmg outside 1s) |  | adds | R2: fire-rate light on continuous. |
| `gun_continuous_proc` | per-bullet ricochet lifts proc rate | 0.20 (proc index) |  | adds | Indirect — extends proc reach. |
| `farmer` | clears NPC waves faster | 60 (% importance) |  | adds | R28: crowd-clearer. |
| `mid_range` | 13m radius favors mid-range | 35 (% importance) |  | adds | Standard rifle range. |
| `counter_importance` | vs clumped enemies | 30 (% importance) |  | adds | R13: punishes grouping. |


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
| `silence` | 2.5s silence × (12.5s window ≈ 20% uptime) per target | 15 (weighted) |  | adds | ⚖️ Named silence anchor. |
| `debuff` | -25% spirit dmg debuff + silence | 35 (% importance) |  | adds | Hybrid debuff. |
| `counter_importance` | counters spirit casters | 80 (% importance) |  | adds | ⚖️ Notes: counters spirit-burst comps. |
| `spirit_resistance` | +12% direct | 12 (eff %) |  | adds | Direct passive. |
| `bullet_damage` | T4 baseline | 9.6 (eff gun-dmg %) |  | adds | R31. |
| `gun_continuous_proc` | per-bullet silence buildup | 0.20 (proc index) |  | adds | Per-bullet. |
| `single_target` | per-bullet silence | 60 (% importance) |  | adds | One enemy at a time. |
| `mid_range` | gun-range silence | 35 (% importance) |  | adds | Standard rifle range. |


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
| `fire_rate` | +11% × ~4 typical stacks | 44 (eff %) |  | adds | Most builds proc 4 stacks routinely. |
| `bullet_damage` | T4 baseline + fire-rate-derived lift | 25 (eff gun-dmg %) |  | adds | 9.6 + fire-rate amp from stacks. |
| `gun_burst_damage` | fire-rate lifts burst heavily | 160 (raw dmg within 1s) |  | adds | R2. |
| `gun_continuous_damage` | sustained gun + reload speed | 90 (raw dmg outside 1s) |  | adds | R2 + reload helps continuous. |
| `cooldown_reduction` | +5% direct | 5 (eff CDR %) |  | adds | Direct. |
| `magazine_size_dependant` | -10% reload time × stacks | 25 (eff ammo %) |  | adds | Reload speed extends effective ammo uptime. |
| `ability_spam` | rewards casting items + abilities | 60 (% importance) |  | adds | ⚖️ Cast-to-stack mechanic. |
| `hybrid_damage_usage` | rewards using BOTH gun + abilities | 70 (% importance) |  | adds | ⚖️ Named hybrid anchor. |
| `multi_ability_focus` | every cast contributes | 45 (% importance) |  | adds | R20: rewards diverse ability use. |
| `engage` | in-combat stacks favor engagement | 35 (% importance) |  | adds | Stacks only build in combat. |


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
| `hybrid_damage_usage` | rewards using BOTH gun + spirit | 80 (% importance) |  | adds | ⚖️ Named hybrid anchor. |
| `fire_rate` | +32% × ~0.6 typical Overflow uptime | 19 (eff %) |  | adds | Charge → 15s buff. |
| `spirit_damage` | 6 flat + 40 × 0.6 uptime (Weapon item, no spirit baseline) | 30 (SP-equiv) |  | adds | No baseline (Weapon). |
| `spirit_burst_damage` | spirit per-shot during Overflow | 60 (raw dmg within 1s) |  | adds | SP lifts spirit-flavored procs in burst window. |
| `spirit_continuous_damage` | sustained spirit | 60 (raw dmg outside 1s) |  | adds | SP lifts continuous symmetrically. |
| `bullet_damage` | T4 baseline + fire-rate lift | 20 (eff gun-dmg %) |  | adds | 9.6 baseline + FR-derived. |
| `gun_burst_damage` | FR-driven burst lift | 130 (raw dmg within 1s) |  | adds | R2: FR heavy on burst. |
| `gun_continuous_damage` | sustained gun | 50 (raw dmg outside 1s) |  | adds | R2: light continuous. |
| `spirit_lifesteal` | +13% direct | 13 (eff %) |  | adds | Direct. |
| `duration_dependant` | +15% Ability Duration | 15 (eff %) |  | adds | Direct. |
| `high_max_hp` | +90 HP (Weapon, no baseline) | 90 (HP) |  | adds | Explicit. |
| `self_heal` | lifesteal sustain | 60 (HP total) |  | adds | 13% lifesteal × dmg dealt. |


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
| `counter_importance` | named anti-burst defense | 90 (% importance) |  | adds | ⚖️ Named anchor — lethal-damage save. |
| `damage_sponge` | death immunity ≈ second life | 70 (% importance) |  | adds | R26: dies → doesn't die. |
| `shield` | 4.5s invuln window ≈ effective HP | 200 (shield HP) |  | adds | Treats death-immune as ~200 HP barrier (procs once per 90s). |
| `high_max_hp` | T4 Vitality baseline + 200 HP + shield-as-HP | 254 (HP) |  | adds | 29 baseline + 200 + ~25 shield-equiv. |
| `bullet_resistance` | +15% direct | 15 (eff %) |  | adds | Direct. |
| `cc_resist` | removes non-stun debuffs on trigger | 12 (eff %) |  | adds | Partial cleanse. |
| `escape` | survives instant-death moments | 65 (% importance) |  | adds | Clutch survival. |
| `low_max_hp` | trigger fires at 1 HP | 50 (HP) |  | adds | Low-HP synergy with Frenzy etc. |
| `scaling_late` | 90s CD = better in extended fights | 35 (% importance) |  | adds | R32. |
| `single_ability_focus` | one-shot anti-execute | 40 (% importance) |  | adds | R17 partial. |


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
| `damage_sponge` | named anchor — giant tank | 95 (% importance) |  | adds | ⚖️ Named damage_sponge anchor at T4. |
| `bullet_resistance` | 35% × (7/37) uptime + R31 lift | 12 (eff %) |  | adds | 35 × 0.19 uptime. |
| `spirit_resistance` | 35% × (7/37) | 7 (eff %) |  | adds | Same. |
| `melee_damage` | +30% × (7/37) | 6 (eff melee-dmg %) |  | adds | R12: short-burst melee amp. |
| `movement_slow` | -30% × 7s × ~3 enemies in aura | 25 (eff slow weighted) |  | adds | Aura slow vs crowd. |
| `aoe_cluster` | 14m aura | 75 (% importance) |  | adds | Large radius. |
| `bullet_damage` | +15% + T4 Weapon baseline-equiv | 15 (eff gun-dmg %) |  | adds | Vitality item — +15% explicit only (no Weapon baseline). |
| `high_max_hp` | +25% base HP (≈ +125) + T4 Vitality baseline 29 | 154 (HP) |  | adds | R31 baseline + +125. |
| `engage` | activate-and-brawl tool | 80 (% importance) |  | adds | ⚖️ Named engage anchor for tanks. |
| `large_hitbox` | +20% Model Scale | 60 (% importance) |  | adds | Direct mechanic (trade-off). |
| `grounded` | brawler tank | 50 (% importance) |  | adds | R7. |
| `close_to_team` | aura wants allies nearby | 40 (% importance) |  | adds | Aura coverage. |
| `single_ability_focus` | active-driven | 35 (% importance) |  | adds | R17. |


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
| `shield` | 600 × (6/30 typical CD) | 120 (shield HP) |  | adds | ⚖️ Largest barrier T4 + low cd ally-cast. |
| `assist_importance` | ally-cast halves CD | 80 (% importance) |  | adds | ⚖️ Named ally-cast anchor. |
| `team_heal` | 600 barrier on ally | 200 (HP total) |  | adds | Barrier = effective HP for ally. |
| `ally_buff` | +2.75m MS + barrier | 70 (% importance) |  | adds | R24. |
| `cc_resist` | cleanse non-stun debuffs | 25 (eff %) |  | adds | Strong cleanse. |
| `counter_importance` | counter to debuff comps | 55 (% importance) |  | adds | R13: cleanse + barrier. |
| `range_extender_dependant` | +10% range + 40m cast | 15 (eff %) |  | adds | Direct + cast range. |
| `horizontal_mobility` | +2.75m × uptime | 1.0 (m/s eff) |  | adds | 2.75 × 0.4. |
| `escape` | barrier + MS = escape support | 50 (% importance) |  | adds | Self-or-ally escape. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) |  | adds | R31. |
| `self_heal` | +1.5 OOC | 25 (HP total) |  | adds | Small regen. |
| `engage` | barrier + MS for ally engage | 35 (% importance) |  | adds | Dive support. |


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
| `ult_focused` | trigger requires ultimate cast | 90 (% importance) |  | adds | ⚖️ Named ult_focused anchor. |
| `shield` | 1000 × (20/40) uptime | 500 (shield HP) |  | adds | Largest single barrier at T4. |
| `spirit_damage` | +35 × (20/40) + T4 Vitality baseline | 26 (SP-equiv) |  | adds | Vitality item — no spirit baseline. 35 × 0.5 + ~8 utility. |
| `spirit_burst_damage` | SP lifts spirit burst | 35 (raw dmg within 1s) |  | adds | R2: SP lifts spirit burst. |
| `spirit_continuous_damage` | SP lifts continuous | 35 (raw dmg outside 1s) |  | adds | R2 symmetric. |
| `damage_sponge` | massive barrier during ult | 65 (% importance) |  | adds | R26. |
| `duration_dependant` | +15% direct | 15 (eff %) |  | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline + barrier-as-HP | 100 (HP) |  | adds | 29 baseline + ~70 shield-equiv. |
| `scaling_late` | ult-tied = bigger fights | 50 (% importance) |  | adds | R32. |
| `engage` | barrier on ult = engage cushion | 50 (% importance) |  | adds | Ult-engage support. |
| `single_ability_focus` | tied to one ability slot (ult) | 60 (% importance) |  | adds | R17: ult-only trigger. |


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
| `assist_importance` | ally heals also trigger it | 70 (% importance) |  | adds | Buffs ally too. |
| `ally_buff` | ally-cast heals buff ally | 55 (% importance) |  | adds | R24. |
| `self_heal` | 6 regen + 4 OOC sustained | 220 (HP total) |  | adds | 6×30s combat + 4×20s OOC ≈ 260; net ~220. |
| `continous_heal` | regen over time outside 1s | 200 (HP outside 1s) |  | adds | Sustained regen. |
| `burst_heal` | first-1s regen | 6 (HP within 1s) |  | adds | Small per-second. |
| `fire_rate` | +35% × ~0.6 post-heal uptime | 21 (eff %) |  | adds | 35 × 0.6 (heal trigger uptime). |
| `horizontal_mobility` | +1.25m × 0.6 uptime | 0.75 (m/s eff) |  | adds | Channel-dependent. |
| `spirit_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) |  | adds | R31. |
| `farmer` | regen sustains farm | 45 (% importance) |  | adds | R28. |
| `counter_importance` | counters DoT/poke pressure | 30 (% importance) |  | adds | Regen-anchor counter. |


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
| `cc_resist` | auto-cleanse first CC + 10% SR + 10% BR | 65 (eff %) |  | adds | ⚖️ Named anchor — strongest anti-CC item. |
| `counter_importance` | counter to CC-heavy comps | 80 (% importance) |  | adds | ⚖️ Named anti-CC tool. |
| `shield` | (325+2×20) ≈ 365 × (10/55) uptime | 65 (shield HP) |  | adds | Trigger-gated barrier. |
| `cooldown_reduction` | -20% all abilities on trigger | 8 (eff CDR %) |  | adds | 20 × ~0.4 trigger frequency. |
| `bullet_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `spirit_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `debuff_resistance` | cleanse + reduced CC time | 25 (eff %) |  | adds | Cleanse effect on top of resistance. |
| `damage_sponge` | barrier on trigger | 40 (% importance) |  | adds | R26 partial — trigger-gated. |
| `spirit_damage` | barrier scales 2.0×SP | 5 (SP-equiv) |  | relies | RELY: scaling only matters with SP build. |
| `high_max_hp` | T4 Vitality baseline + shield-as-HP | 60 (HP) |  | adds | 29 baseline + ~30 effective HP. |
| `escape` | cleanse-driven survival | 45 (% importance) |  | adds | Auto-trigger panic-button. |
| `self_heal` | +2 OOC regen | 40 (HP total) |  | adds | 2 × 20s OOC. |


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
| `spirit_lifesteal` | 13% + 70% × (7/30) | 29 (eff %) |  | adds | ⚖️ Largest spirit lifesteal source. |
| `spirit_damage` | 6 flat + 30 × (7/30) (Vitality, no SP baseline) | 13 (SP-equiv) |  | adds | 6 + 7 conditional. |
| `spirit_burst_damage` | SP lifts spirit burst in 7s window | 30 (raw dmg within 1s) |  | adds | R2: 7s active window. |
| `spirit_continuous_damage` | SP lifts continuous | 30 (raw dmg outside 1s) |  | adds | R2 symmetric. |
| `spirit_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `self_heal` | lifesteal sustain | 180 (HP total) |  | adds | Lifesteal during 7s burst. |
| `self_buff` | self-cast active | 55 (% importance) |  | adds | Self-only. |
| `high_max_hp` | T4 Vitality baseline + 100 HP | 129 (HP) |  | adds | 29 + 100. |
| `single_ability_focus` | rewards one big nuke window | 40 (% importance) |  | adds | R17. |


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
| `anti_heal` | -40% × proc-uptime | 28 (eff %) |  | adds | ⚖️ T4 anti-heal anchor. 40 × ~0.7 uptime. |
| `debuff` | -30% dmg + anti-heal | 55 (% importance) |  | adds | ⚖️ Dual debuff = strong. |
| `counter_importance` | counter to heal stack + DPS heroes | 75 (% importance) |  | adds | R13: dual debuff. |
| `bullet_damage` | +10% + T4 Weapon baseline (Vitality item, no Weapon baseline) | 10 (eff gun-dmg %) |  | adds | Direct +10% only. |
| `high_max_hp` | T4 Vitality baseline + 150 HP | 179 (HP) |  | adds | 29 + 150. |
| `single_target` | per-target debuff | 60 (% importance) |  | adds | Single-target debuff. |
| `gun_continuous_proc` | per-bullet buildup | 0.20 (proc index) |  | adds | Buildup mechanic. |
| `mid_range` | gun-range debuff | 35 (% importance) |  | adds | Standard rifle range. |


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
| `fire_rate_slow` | -40% × 4s × ~2 attackers | 48 (eff slow %) |  | adds | ⚖️ Named anchor for fire_rate_slow. |
| `cc_resist` | +50% slow resist | 40 (eff %) |  | adds | ⚖️ Named slow-resist anchor. |
| `horizontal_mobility` | +2.5m direct | 2.5 (m/s eff) |  | adds | Direct sprint. |
| `melee_resistance` | +25% direct | 25 (eff %) |  | adds | Direct. |
| `self_heal` | +8 regen × combat time | 240 (HP total) |  | adds | 8 × 30s combat = 240. |
| `continous_heal` | regen outside 1s | 240 (HP outside 1s) |  | adds | Sustained regen. |
| `burst_heal` | first-1s regen | 8 (HP within 1s) |  | adds | 8 HP within 1s. |
| `damage_sponge` | fire-rate-slow tanks better | 65 (% importance) |  | adds | R26: anti-attacker debuff. |
| `counter_importance` | counters DPS dive + slows | 70 (% importance) |  | adds | R13. |
| `escape` | mobility + slow resist = escape | 60 (% importance) |  | adds | R14. |
| `engage` | safe dive (high MS) | 50 (% importance) |  | adds | Mobility tool. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) |  | adds | R31. |
| `farmer` | mobility helps farm | 30 (% importance) |  | adds | R28. |


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
| `spirit_lifesteal` | +25% direct | 25 (eff %) |  | adds | Direct. |
| `bullet_lifesteal` | +25% direct | 25 (eff %) |  | adds | Direct. |
| `hybrid_damage_usage` | gun+spirit lifesteal stat stick | 80 (% importance) |  | adds | ⚖️ Hybrid scaling anchor. |
| `bullet_damage` | +12% direct (Vitality, no Weapon baseline) | 12 (eff gun-dmg %) |  | adds | Direct. |
| `spirit_damage` | +12 SP (Vitality, no spirit baseline) | 12 (SP-equiv) |  | adds | Direct. |
| `gun_burst_damage` | per-shot lift | 70 (raw dmg within 1s) |  | adds | R2: bullet_damage symmetric. |
| `gun_continuous_damage` | sustained lift | 70 (raw dmg outside 1s) |  | adds | R2. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) |  | adds | R2. |
| `self_heal` | hybrid lifesteal sustain | 320 (HP total) |  | adds | Sustained dual lifesteal. |
| `scaling_late` | pure stat stick | 55 (% importance) |  | adds | R32: late-game accumulator. |
| `high_max_hp` | T4 Vitality baseline + 180 HP | 209 (HP) |  | adds | 29 + 180. |
| `damage_sponge` | lifesteal + HP = tank | 50 (% importance) |  | adds | R26. |


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
| `disarm` | 3s × 1 target × 35s CD | 0.26 (s × count) |  | adds | ⚖️ Named disarm anchor — only T4 disarm. |
| `engage` | teleport-to-enemy is named engage tool | 90 (% importance) |  | adds | ⚖️ Named engage anchor. |
| `spirit_burst_damage` | 75+0.93×20 = 94 within 1s | 95 (raw dmg within 1s) |  | adds | Single-hit burst. |
| `spirit_damage` | 8 flat + (75+0.93×20)/35s CD = ~11 SP-equiv | 11 (SP-equiv) |  | adds | Vitality item, no baseline. |
| `spirit_burst_proc` | one big burst on cast | 0.40 (proc index) |  | adds | R6: instant trigger. |
| `movement_slow` | -50% × 3s × 1 target | 30 (eff slow weighted) |  | adds | 50 × 0.6 weighted. |
| `single_target` | single-target engage | 65 (% importance) |  | adds | Direct. |
| `counter_importance` | pulls aerial → grounded | 60 (% importance) |  | adds | R13: anti-aerial. |
| `anti_air` | pulls enemies to ground | 65 (% importance) |  | adds | R7 mirror — explicit anti-aerial. |
| `grounded` | forces target grounded | 35 (% importance) |  | adds | Pull-to-ground mechanic. |
| `horizontal_mobility` | teleport = effective mobility | 1.5 (m/s eff) |  | adds | 25m teleport / 35s CD. |
| `bullet_damage` | +15% (Vitality, no baseline) | 15 (eff gun-dmg %) |  | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) |  | adds | R31. |


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
| `bullet_evasion` | 30% deflection | 30 (eff %) |  | adds | ⚖️ Named bullet_evasion anchor. |
| `bullet_resistance` | deflection ≈ effective BR | 18 (eff %) |  | adds | 30% × 60% chance combined ≈ ~18% effective. |
| `counter_importance` | counter to gun-DPS + on-hit procs | 85 (% importance) |  | adds | ⚖️ Notes: counters many gun items. |
| `damage_sponge` | RNG bullet block | 60 (% importance) |  | adds | R26. |
| `high_max_hp` | T4 Vitality baseline + 130 HP | 159 (HP) |  | adds | 29 + 130. |
| `gun_burst_resistance` | bullet block reduces burst | 18 (eff %) |  | adds | R2 mirror: deflection helps burst defense. |
| `gun_continuous_resistance` | sustained bullet block | 18 (eff %) |  | adds | Symmetric. |
| `self_buff` | passive self-only | 30 (% importance) |  | adds | Self-only. |


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
| `low_max_hp` | enemy max HP drain | 80 (HP) |  | adds | ⚖️ Named anchor — drains enemy max HP. |
| `high_max_hp` | user gains same max HP | 100 (HP) |  | adds | Mirror — self gains stolen HP. |
| `pure_damage` | 2.5% max HP per stack is pure dmg | 75 (eff dmg) |  | adds | ⚖️ Named pure_damage anchor (not blocked by BR/SR). |
| `self_heal` | user heals by stolen amount | 250 (HP total) |  | adds | Heals = stolen × stacks during 17s. |
| `bullet_damage` | +15% direct (Vitality, no Weapon baseline) | 15 (eff gun-dmg %) |  | adds | Direct. |
| `bullet_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `counter_importance` | counter to tanks / high-HP heroes | 75 (% importance) |  | adds | ⚖️ Notes: anti-tank tool. |
| `gun_continuous_damage` | per-bullet 1.2s ICD = sustained | 65 (raw dmg outside 1s) |  | adds | Sustained drain. |
| `gun_continuous_proc` | per-bullet siphon | 0.30 (proc index) |  | adds | Per-bullet effect. |
| `scaling_late` | stacks build over fight | 50 (% importance) |  | adds | R32: stack scaling. |
| `single_target` | per-bullet siphon | 55 (% importance) |  | adds | Per-target. |


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
| `spirit_burst_resistance` | 65% on threshold spirit hits + R31 lift | 60 (eff %) |  | adds | ⚖️ Named anchor — biggest spirit-burst defense. |
| `spirit_resistance` | +18% direct | 18 (eff %) |  | adds | Direct. |
| `debuff_resistance` | +25% direct | 25 (eff %) |  | adds | Direct. |
| `cc_resist` | debuff resist reduces all CC | 25 (eff %) |  | adds | R13. |
| `counter_importance` | counters spirit-burst comps | 80 (% importance) |  | adds | ⚖️ Named anti-caster anchor. |
| `damage_sponge` | spirit-resist sponge | 55 (% importance) |  | adds | R26. |
| `high_max_hp` | T4 Vitality baseline + 90 HP | 119 (HP) |  | adds | 29 + 90. |
| `self_buff` | passive self-only | 35 (% importance) |  | adds | Self-only. |


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
| `cc_resist` | total CC immunity 5.5s × (5.5/60) + 25% passive | 50 (eff %) |  | adds | ⚖️ Named CC-immunity anchor. |
| `debuff_resistance` | +25% direct + CC suppression | 35 (eff %) |  | adds | Combined CC + debuff resist. |
| `counter_importance` | counter to CC-heavy comps | 85 (% importance) |  | adds | ⚖️ Named anti-CC tool. |
| `engage` | CC-immune dive | 70 (% importance) |  | adds | R11: dive without fear of CC. |
| `escape` | CC-immune retreat | 60 (% importance) |  | adds | Bidirectional. |
| `ult_focused` | best in ult-windows | 40 (% importance) |  | adds | Synergy with ult timing. |
| `damage_sponge` | CC immune ≈ uptime tank | 50 (% importance) |  | adds | R26: indirect. |
| `high_max_hp` | T4 Vitality baseline + 125 HP | 154 (HP) |  | adds | 29 + 125. |
| `self_buff` | self-only active | 40 (% importance) |  | adds | Self-only. |
| `single_ability_focus` | one active does everything | 35 (% importance) |  | adds | R17. |


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
| `bullet_lifesteal` | 13% + 70% × (5/30) | 25 (eff %) |  | adds | ⚖️ Largest bullet lifesteal source. |
| `fire_rate` | 34% × (5/30) | 6 (eff %) |  | adds | Active burst FR. |
| `bullet_damage` | +6% + fire-rate burst amp (Vitality, no Weapon baseline) | 12 (eff gun-dmg %) |  | adds | 6 + FR lift. |
| `gun_burst_damage` | FR-driven burst in 5s = pure burst window | 95 (raw dmg within 1s) |  | adds | ⚖️ R2: 5s active is the textbook burst window. |
| `gun_continuous_damage` | extends mag past cap | 50 (raw dmg outside 1s) |  | adds | R2 + ammo extension. |
| `magazine_size_dependant` | +75% × (5/30) | 13 (eff ammo %) |  | adds | Active ammo refill, no mag cap. |
| `self_heal` | 70% lifesteal × 5s burst | 250 (HP total) |  | adds | Burst lifesteal sustain. |
| `bullet_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `high_max_hp` | T4 Vitality baseline + 100 HP | 129 (HP) |  | adds | 29 + 100. |
| `single_ability_focus` | active-driven | 45 (% importance) |  | adds | R17. |
| `engage` | 5s burst window favors commit | 55 (% importance) |  | adds | Engagement burst tool. |


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
| `cooldown_reduction` | -4s per hit × proc-rate | 18 (eff CDR %) |  | adds | ⚖️ Named cdr-via-taking-damage anchor. |
| `spirit_resistance` | +22% direct | 22 (eff %) |  | adds | Direct. |
| `spirit_damage` | +14 SP (Vitality, no baseline) | 14 (SP-equiv) |  | adds | Direct. |
| `counter_importance` | counter to spirit-burst | 70 (% importance) |  | adds | R13: spirit-resist + CDR mirror. |
| `damage_sponge` | rewards being hit | 50 (% importance) |  | adds | R26: incentivizes taking spirit dmg. |
| `ability_spam` | CDR enables more casts | 50 (% importance) |  | adds | R20: more uses/min. |
| `scaling_late` | CDR + SP = scaling caster | 40 (% importance) |  | adds | R32. |
| `spirit_burst_damage` | SP lifts spirit burst | 25 (raw dmg within 1s) |  | adds | R2 symmetric. |
| `spirit_continuous_damage` | SP lifts continuous | 25 (raw dmg outside 1s) |  | adds | R2. |
| `high_max_hp` | T4 Vitality baseline | 29 (HP) |  | adds | R31. |


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
| `aoe_cluster` | 16m radius | 75 (% importance) |  | adds | ⚖️ Large AoE. |
| `stun` | 1s freeze × ~3 enemies × (1/24s CD) | 0.12 (eff s) |  | adds | Freeze = hard CC. |
| `movement_slow` | slow + stamina freeze after | 35 (eff slow weighted) |  | adds | Slow + stamina lock. |
| `spirit_damage` | (175+0.7×20)/24s + T4 baseline | 16 (SP-equiv) |  | adds | 189/24 ≈ 7.9 + 8.3 baseline. |
| `spirit_burst_damage` | one big AoE burst within 1s | 180 (raw dmg within 1s) |  | adds | Single-cast burst. |
| `spirit_burst_proc` | one big proc on cast | 0.40 (proc index) |  | adds | R6: instant cast proc. |
| `spirit_resistance` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `engage` | AoE freeze = group engage | 65 (% importance) |  | adds | R11. |
| `counter_importance` | anti-stamina + anti-mobility | 60 (% importance) |  | adds | R13: freezes stamina regen. |
| `grounded` | grounded cast | 35 (% importance) |  | adds | R7. |
| `single_ability_focus` | active is the payoff | 40 (% importance) |  | adds | R17. |


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
| `spirit_damage` | 30 flat + (15% × 100 SP existing build) + T4 baseline | 53 (SP-equiv) |  | adds | ⚖️ Named SP anchor T4. 8.3 baseline + 30 + 15. |
| `spirit_burst_damage` | SP lifts burst | 60 (raw dmg within 1s) |  | adds | R2 symmetric. |
| `spirit_continuous_damage` | SP lifts continuous | 60 (raw dmg outside 1s) |  | adds | R2. |
| `scaling_late` | % of current SP rewards stacking | 65 (% importance) |  | adds | ⚖️ Greedy SP scaler — uniquely rewards SP stacking. |
| `high_max_hp` | +75 HP (Spirit, no Vit baseline) | 75 (HP) |  | adds | Explicit. |
| `self_heal` | +4 OOC | 80 (HP total) |  | adds | 4 × 20s OOC. |
| `single_target` | pure stat stick, no AoE | 35 (% importance) |  | adds | Stat stick neutrality. |


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
| `silence` | 3.25s × 1 target | 5 (weighted) |  | adds | ⚖️ Longest silence at T4. |
| `disarm` | 3.25s × 1 target × (3.25/55) | 0.20 (s × count) |  | adds | Same duration as silence. |
| `interrupt` | interrupts channels on cast | 75 (eff freq) |  | adds | ⚖️ Named interrupt anchor. |
| `debuff` | strips all non-ult buffs + silence + disarm | 80 (% importance) |  | adds | ⚖️ Largest buff-strip in game. |
| `counter_importance` | counter to buff-stack heroes/items | 95 (% importance) |  | adds | ⚖️ Named anti-buff anchor. |
| `ult_focused` | doesn't strip ults — punishes non-ults | 50 (% importance) |  | adds | R22: ult-flavored anti-utility. |
| `single_target` | per-target curse | 60 (% importance) |  | adds | Cast on one. |
| `spirit_damage` | T4 Spirit baseline (penalty subtracts) | 0 (SP-equiv) |  | adds | -10% damage penalty = no damage scaling. |
| `engage` | locks down then commit | 50 (% importance) |  | adds | R11: setup tool. |


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
| `ult_focused` | famously duplicates ults | 75 (% importance) |  | adds | ⚖️ Named ult-duplicator. |
| `ability_spam` | doubles a cast in fight | 60 (% importance) |  | adds | R20: enables 2× cast per fight. |
| `single_ability_focus` | one big copy per fight | 60 (% importance) |  | adds | R17: rewards a key ability. |
| `fire_rate` | +5% direct | 5 (eff %) |  | adds | Direct. |
| `spirit_resistance` | +5% direct | 5 (eff %) |  | adds | Direct. |
| `bullet_resistance` | +5% direct | 5 (eff %) |  | adds | Direct. |
| `spirit_damage` | T4 baseline + ult-duplication = SP-equiv burst | 13 (SP-equiv) |  | adds | 8.3 baseline + small ult-duplication value. |
| `spirit_burst_damage` | duplicates a burst ability | 55 (raw dmg within 1s) |  | adds | R2: ult-duplication is burst-flavored. |
| `counter_importance` | gives flex utility | 30 (% importance) |  | adds | R13. |
| `scaling_late` | shines in big-cooldown fights | 40 (% importance) |  | adds | R32. |


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
| `spirit_damage` | 4.5% × ~8 typical stacks + 8.3 baseline | 50 (SP-equiv) |  | adds | ⚖️ Named spirit-amp ramp anchor. |
| `spirit_resist_shred` | -8% direct on spirit hits + stack amp ≈ shred | 25 (eff shred %) |  | adds | Alt-form of shred (amp instead of resist debuff). |
| `scaling_late` | stack ramp rewards sustained casting | 65 (% importance) |  | adds | ⚖️ Stack scaling. |
| `spirit_burst_damage` | first stacks within 1s | 90 (raw dmg within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | stack ramp over 12s | 220 (raw dmg outside 1s) |  | adds | R2: sustained. |
| `spirit_continuous_proc` | per-hit stack | 0.45 (proc index) |  | adds | R5: ramp via continuous spirit. |
| `single_target` | stack per target | 60 (% importance) |  | adds | Stacks single-target. |
| `spirit_resistance` | +17% direct | 17 (eff %) |  | adds | Direct. |
| `ability_spam` | rewards repeated casting | 40 (% importance) |  | adds | R20. |
| `multi_ability_focus` | any spirit hit stacks | 35 (% importance) |  | adds | R20. |


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
| `escape` | untargetable 4s | 95 (% importance) |  | adds | ⚖️ Named escape anchor T4. |
| `cc_resist` | untargetable suppresses CC | 50 (eff %) |  | adds | Effective CC immunity 4s. |
| `counter_importance` | counter to burst chains | 70 (% importance) |  | adds | R13: deletes burst windows. |
| `spirit_damage` | +20 × (5/35) + T4 baseline | 11 (SP-equiv) |  | adds | 8.3 + 3 conditional. |
| `spirit_resistance` | +30% × (5/35) | 4 (eff %) |  | adds | Active-only. |
| `horizontal_mobility` | +3m × (5/35) | 0.4 (m/s eff) |  | adds | Active-only. |
| `self_buff` | self-only | 60 (% importance) |  | adds | Self-only. |
| `aerial` | floats while shifted | 40 (% importance) |  | adds | R7: aerial-friendly. |
| `single_ability_focus` | active is the payoff | 45 (% importance) |  | adds | R17. |


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
| `silence` | 4.5s × 1 target × (4.5/45) | 6 (weighted) |  | adds | ⚖️ T4 silence anchor. |
| `spirit_resist_shred` | -9% × (12/45) uptime | 4 (eff shred %) |  | adds | Resist shred uptime. |
| `debuff` | silence + SP-drain + resist-shred | 60 (% importance) |  | adds | Triple debuff. |
| `counter_importance` | counter to spirit casters | 75 (% importance) |  | adds | R13: anti-caster. |
| `spirit_damage` | T4 baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `spirit_burst_damage` | 30% stored dmg burst on expire | 90 (raw dmg within 1s) |  | adds | Burst spike when silence ends. |
| `fire_rate` | +10% direct | 10 (eff %) |  | adds | Direct. |
| `single_target` | per-target silence | 65 (% importance) |  | adds | Single-target. |
| `single_ability_focus` | active is the payoff | 45 (% importance) |  | adds | R17. |


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
| `ult_focused` | trigger gated to ultimate | 90 (% importance) |  | adds | ⚖️ Named ult_focused anchor. |
| `stun` | 0.75s × on-ult uptime | 0.40 (eff s) |  | adds | R6: per-ult-cast burst stun. |
| `spirit_burst_damage` | 150 bonus dmg per ult | 110 (raw dmg within 1s) |  | adds | Burst chunk on ult. |
| `spirit_damage` | 150/ult-CD ≈ effective T4 anchor | 18 (SP-equiv) |  | adds | 8.3 baseline + ~10 conditional. |
| `movement_slow` | -30% on spirit dmg dealt × ~3 targets | 30 (eff slow weighted) |  | adds | Passive on-hit slow. |
| `counter_importance` | huge ult-window control | 65 (% importance) |  | adds | R13. |
| `horizontal_mobility` | +0.75m sprint | 0.75 (m/s eff) |  | adds | Direct. |
| `single_ability_focus` | one ability does everything | 70 (% importance) |  | adds | R17. |
| `high_max_hp` | +50 HP (Spirit, no Vit baseline) | 50 (HP) |  | adds | Explicit. |


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
| `escape` | named escape anchor T4 | 95 (% importance) |  | adds | ⚖️ Long-distance escape. |
| `horizontal_mobility` | +7m × (12/32) flight | 2.5 (m/s eff) |  | adds | Active mobility. |
| `vertical_mobility` | flight = best vertical mobility | 5 (units) |  | adds | ⚖️ Named vertical_mobility anchor. |
| `aerial` | flight tool | 85 (% importance) |  | adds | ⚖️ Named aerial-flavored item. |
| `cc_resist` | slow-immune flight | 30 (eff %) |  | adds | Slow immunity during flight. |
| `spirit_damage` | +14 SP + T4 baseline | 22 (SP-equiv) |  | adds | 14 + 8.3. |
| `high_max_hp` | +125 HP (Spirit, no Vit baseline) | 125 (HP) |  | adds | Explicit. |
| `duration_dependant` | +15% direct | 15 (eff %) |  | adds | Direct. |
| `farmer` | long-rotation mobility | 60 (% importance) |  | adds | R28: enables farm flex. |
| `single_ability_focus` | one active = full mobility | 40 (% importance) |  | adds | R17. |


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
| `hybrid_damage_usage` | gun-spirit imbued bullets | 85 (% importance) |  | adds | ⚖️ Named hybrid anchor. |
| `charge_dependant` | Charge-Up mechanic per Notes | 80 (% importance) |  | adds | ⚖️ Charge-Up item. |
| `fire_rate` | +22% × ~0.5 charge uptime | 11 (eff %) |  | adds | Active-only. |
| `bullet_damage` | +25% + 0.49×SP per shot × charge uptime + T4 (Spirit, no Weapon baseline) | 30 (eff gun-dmg %) |  | adds | Big per-shot amp during buff. |
| `spirit_damage` | (60+0.16×20) one-shot imbued + 7 flat + baseline | 25 (SP-equiv) |  | adds | 8.3 baseline + 7 + 9 conditional. |
| `gun_burst_damage` | charge window is burst | 130 (raw dmg within 1s) |  | adds | R2: FR + amp burst. |
| `gun_continuous_damage` | charge window mostly burst | 60 (raw dmg outside 1s) |  | adds | R2 lighter. |
| `gun_burst_proc` | imbued ability proc | 0.35 (proc index) |  | adds | Single big proc on imbued ability. |
| `magazine_size_dependant` | reload 100% + +20% max ammo | 35 (eff ammo %) |  | adds | Major ammo lift. |
| `single_ability_focus` | one big ability proc | 50 (% importance) |  | adds | R17. |


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
| `aoe_cluster` | 16m AoE | 75 (% importance) |  | adds | Large radius. |
| `spirit_damage` | 50% dmg of imbued ability + T4 baseline | 30 (SP-equiv) |  | adds | 8.3 baseline + amp on ability. |
| `spirit_burst_damage` | delayed AoE within ~3-4s | 100 (raw dmg within 1s) |  | adds | First-target burst. |
| `spirit_burst_proc` | imbue triggers AoE delayed | 0.30 (proc index) |  | adds | R6 with delay. |
| `spirit_continuous_damage` | echo extends ability dmg | 40 (raw dmg outside 1s) |  | adds | Brief continuous extension. |
| `movement_slow` | -40% × 3s × 1 target | 30 (eff slow weighted) |  | adds | Per-imbue. |
| `spirit_lifesteal` | 8% + 22% imbued ≈ 18% effective | 18 (eff %) |  | adds | Combined. |
| `self_heal` | lifesteal sustain | 90 (HP total) |  | adds | Imbued lifesteal. |
| `single_ability_focus` | imbues one ability | 70 (% importance) |  | adds | R17. |
| `counter_importance` | crowd-punish | 35 (% importance) |  | adds | R13. |


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
| `cooldown_reduction` | resets all ability CDs once per fight | 35 (eff CDR %) |  | adds | ⚖️ Effective CDR via reset = ~35% in big fights. |
| `ult_focused` | famously used to double-ult | 95 (% importance) |  | adds | ⚖️ Named ult-reset anchor. |
| `ability_spam` | doubles all abilities once | 75 (% importance) |  | adds | R20: enables 2× cast cycle. |
| `multi_ability_focus` | resets ALL abilities | 70 (% importance) |  | adds | R20: hits all abilities. |
| `spirit_damage` | T4 baseline + ult-reset amp | 18 (SP-equiv) |  | adds | 8.3 baseline + ~10 via reset value. |
| `spirit_burst_damage` | enables double-burst combos | 80 (raw dmg within 1s) |  | adds | R2: reset enables 2× burst. |
| `scaling_late` | shines with bigger CDs | 65 (% importance) |  | adds | ⚖️ Late-game power-spike. |
| `counter_importance` | comeback / momentum tool | 50 (% importance) |  | adds | R13. |
| `single_ability_focus` | also rewards repeating key spell | 35 (% importance) |  | adds | R17. |


---

## Scourge
- **normalized_name**: `scourge` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_discord`
- **wiki**: https://deadlock.wiki/Scourge

### Interpretation
Ally-cast aura DoT: +100 HP, +17% Debuff Resist. Active (35s CD): +40% SR on ally + aura deals 3.5%/s of enemy max HP, 10s, 35m cast range, 10m aura radius.

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
| `pure_damage` | 3.5% max HP/s for 10s | 85 (eff dmg) |  | adds | ⚖️ Named pure-damage tank-shred anchor. |
| `aoe_cluster` | 10m aura | 70 (% importance) |  | adds | Aura DoT. |
| `assist_importance` | ally-cast aura | 85 (% importance) |  | adds | ⚖️ Named ally-cast utility. |
| `ally_buff` | +40% SR on ally for 10s | 70 (% importance) |  | adds | R24: big ally buff. |
| `spirit_resistance` | +40% × 10s on ally (no self) | 12 (eff %) |  | relies | RELY: ally-only. |
| `dot` | 3.5% max HP × 10s per target | 90 (eff dmg) |  | adds | ⚖️ Named DoT anchor. |
| `spirit_burst_damage` | first second of aura DoT | 50 (raw dmg within 1s) |  | adds | R2. |
| `spirit_continuous_damage` | 9s of sustained DoT | 250 (raw dmg outside 1s) |  | adds | R2: heavy sustained. |
| `spirit_continuous_proc` | per-second tick | 0.50 (proc index) |  | adds | R5. |
| `counter_importance` | counter to tanks (% max HP) | 80 (% importance) |  | adds | R13. |
| `debuff_resistance` | +17% direct | 17 (eff %) |  | adds | Direct. |
| `high_max_hp` | +100 HP (Spirit, no Vit baseline) | 100 (HP) |  | adds | Explicit. |
| `range_extender_dependant` | 35m cast range | 12 (eff %) |  | adds | Long-cast utility. |
| `team_heal` | resist buff acts like effective heal | 100 (HP total) |  | adds | Ally takes less dmg. |


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
| `dot` | 24+0.06×20 = 25 DPS × 8s + 110 explosion | 200 (eff dmg) |  | adds | ⚖️ Named DoT anchor T4. |
| `aoe_cluster` | 12m AoE | 75 (% importance) |  | adds | Big AoE. |
| `spirit_burst_damage` | 110 explosion + first-1s DoT | 130 (raw dmg within 1s) |  | adds | Initial chunk. |
| `spirit_continuous_damage` | 7×25 DPS sustained | 175 (raw dmg outside 1s) |  | adds | R2: sustained DoT. |
| `spirit_continuous_proc` | per-tick burn | 0.50 (proc index) |  | adds | R5. |
| `spirit_damage` | (~200 dmg/20s CD) + baseline | 18 (SP-equiv) |  | adds | 10 + 8.3 baseline. |
| `anti_heal` | -70% healing reduction × 8s | 50 (eff %) |  | adds | ⚖️ Strong anti-heal T4. |
| `debuff` | DoT + anti-heal | 50 (% importance) |  | adds | Dual debuff. |
| `counter_importance` | anti-tank + anti-heal | 70 (% importance) |  | adds | R13. |
| `range_extender_dependant` | +6% direct | 6 (eff %) |  | adds | Direct. |
| `farmer` | AoE DoT clears NPCs | 50 (% importance) |  | adds | R28. |


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
| `cooldown_reduction` | +25% ability + +25% item CDR | 50 (eff CDR %) |  | adds | ⚖️ Named cdr anchor — biggest CDR source. |
| `ability_spam` | rewards casting more | 70 (% importance) |  | adds | R20: CDR enables spam. |
| `spirit_damage` | CDR ≈ effective SP via more casts + baseline | 16 (SP-equiv) |  | adds | 8.3 baseline + ~8 CDR-derived. |
| `spirit_burst_damage` | more spirit casts per fight | 70 (raw dmg within 1s) |  | adds | R2: CDR amps burst. |
| `spirit_continuous_damage` | more sustained casts | 90 (raw dmg outside 1s) |  | adds | R2. |
| `scaling_late` | CDR stat stick scales late | 55 (% importance) |  | adds | R32. |
| `multi_ability_focus` | helps ALL abilities | 70 (% importance) |  | adds | R20: hits all abilities. |
| `self_heal` | +4 OOC | 80 (HP total) |  | adds | Small regen. |


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
| `displace` | vacuum-pulls enemies into small area | 25 (e × m) |  | adds | ⚖️ Named displace anchor — group pull. |
| `trap_block_obstruct` | vortex creates AoE trap zone | 30 (p × s) |  | adds | ⚖️ Named trap anchor — group lockdown. |
| `aoe_cluster` | 12m capture | 80 (% importance) |  | adds | Large group AoE. |
| `movement_slow` | -35% × 4s × ~3 enemies | 32 (eff slow weighted) |  | adds | Slow on multiple. |
| `engage` | group-pull engage tool | 80 (% importance) |  | adds | ⚖️ Named engage anchor for groups. |
| `counter_importance` | vs grouped enemies | 65 (% importance) |  | adds | R13: punishes grouping. |
| `range_extender_dependant` | +8% direct | 8 (eff %) |  | adds | Direct. |
| `horizontal_mobility` | +0.75m sprint | 0.75 (m/s eff) |  | adds | Direct. |
| `spirit_damage` | T4 baseline | 8.3 (SP-equiv) |  | adds | R31. |
| `single_ability_focus` | active is the payoff | 50 (% importance) |  | adds | R17. |


---
