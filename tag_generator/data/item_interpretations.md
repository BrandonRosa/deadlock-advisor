# Deadlock item interpretations

Source of truth for AI-judged item effectiveness. Each item is interpreted by hand from
the **fresh structured scrape** (`_scrape_raw_dump.json`, BASE / non-enhanced variant) against
the governed tag vocabulary in [tags.json](tags.json) and [tag_descriptions.md](tag_descriptions.md).

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
- **normalized_name**: `extended_magazine` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_extended_magazine`
- **wiki**: https://deadlock.wiki/Extended_Magazine

### Interpretation
The clean passive-ammo baseline: +30% max ammo and +8% weapon damage, always on, no conditions. It is the named anchor for `magazine_size_dependant` — sets the bar a fancier ammo item must beat for its tier.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +30% | Passive |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +30% ammo, passive | 30 (eff. ammo %) | 0.9 | adds | Pure passive, full uptime |
| `bullet_damage` | +8% weapon dmg | 8 (eff. gun-dmg %) | 0.6 | adds | Always-on weapon damage |
| `gun_continuous_damage` | bigger mag, more shots/reload | 8 | 0.5 | adds | More sustained fire before reload |
| `gun_burst_damage` | +8% per shot | 4 | 0.2 | adds | Minor burst lift |
| `scaling_early` | cheap always-useful | 60% | 1.2 | adds | Strong early, flattens late |

### Corrections
Applies to all, be more conservative with the scaling early/scaling late items

---

## Rapid Rounds
- **normalized_name**: `rapid_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_rapid_rounds`
- **wiki**: https://deadlock.wiki/Rapid_Rounds

### Interpretation
Pure passive +9% fire rate. Named anchor for `fire_rate` — the cleanest possible fire-rate provider, no conditions.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +9% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +9% fire rate | 9 (eff. fire-rate %) | 0.9 | adds | Clean passive, full uptime |
| `gun_continuous_damage` | more shots/sec | 9 | 0.6 | adds | Directly lifts sustained DPS |
| `gun_burst_damage` | faster ramp | 5 | 0.2 | adds | Faster ramp inside the burst window |
| `scaling_early` | cheap DPS mult | 50% | 1.0 | adds | Cheap early multiplier |

---

## Close Quarters
- **normalized_name**: `close_quarters` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_close_quarters`
- **wiki**: https://deadlock.wiki/Close_Quarters

### Interpretation
+20% weapon damage when an enemy is within 15m, plus a flat +20% melee resist. Damage bonus is short-range gated; melee resist is unconditional. Named `close_range` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +20% | Conditional — enemy within 15m |
| Close Range | 15m | Range gate |
| Melee Resist | +20% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `close_range` | +20% dmg within 15m | 80% | 1.6 | adds | Item built around the <10–15m band |
| `bullet_damage` | +20% (close only) | 16 (20×0.8 uptime) | 1.2 | adds | High close-range uptime for brawlers |
| `bullet_damage` | range-gated value | 20 | 1.5 | relies | Only pays off if built to fight close |
| `melee_resistance` | +20% melee resist | 20 (eff. %) | 1.2 | adds | Unconditional melee defense |
| `melee_damage` | close gun-amp | 10 | 0.3 | adds | Close gun-amp counts partially toward melee |
| `gun_burst_damage` | per-shot amp | 8 | 0.4 | adds | Propagation (0.5×bullet_damage) |
| `gun_continuous_damage` | per-shot amp | 5 | 0.3 | adds | Propagation (0.3×bullet_damage) |
| `engage` | must close to use | 40% | 0.8 | adds | Forces closing distance |

### Corrections
melee damage def needs a boost here, Its straight up a gun boost to everythin in melee range. Look at https://deadlock.wiki/Melee_Damage, "Melee damage scales with Boons and Items. It also scales with the Weapon Damage stat at a rate of 50%. However, melee damage is not considered weapon damage, and thus isn't affected by items such as  Metal Skin unless noted otherwise."

---

## Headshot Booster
- **normalized_name**: `headshot_booster` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_headshot_booster`
- **wiki**: https://deadlock.wiki/Headshot_Booster

### Interpretation
+45 flat bonus headshot damage (NPCs excluded) and +30 HP. Skill-gated burst spike. Named anchor for `headshot_damage` and `gun_burst_proc`/`single_target`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Head Shot Bonus Damage | +45 | Hero headshots only; affected by falloff |
| Bonus Health | +30 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `headshot_damage` | +45/headshot | 45 (flat headshot dmg) | 1.1 | adds | Clean headshot scaler |
| `headshot_damage` | requires landing heads | 80% | 2.0 | relies | Heavy aim/playstyle dependence |
| `gun_burst_damage` | +45 spike on head | 45 | 2.0 | adds | Lands inside the burst window |
| `gun_burst_proc` | proc on first headshot | 1.0 (burst index) | 1.3 | adds | 100%×(dur/window); easy single-shot trigger, big payout |
| `single_target` | no AoE | 90% | 2.0 | adds | Pure single-target spike |
| `long_range` | slow-fire heads at range | 40% | 0.8 | adds | Favors mid/long ranged play |
| `high_max_hp` | +30 HP | 30 (flat HP) | 0.3 | adds | Token HP |

### Corrections
headshot damage's units shouldnt be damage, its kinda a judgement one, it should rather be kinda a % for headshot importance. Ontop of that gun gamage kinda currently has two units, % up and flat damage. This headshot damage is done before the % increases.. So youd have to do a psudo effective % up..
---

## High-Velocity Rounds
- **normalized_name**: `high_velocity_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_high_velocity_rounds`
- **wiki**: https://deadlock.wiki/High-Velocity_Rounds

### Interpretation
Pure passive: +8% weapon damage, +60% bullet velocity. Velocity adds no raw DPS but lands shots at range — tier-flat 60%.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive (tier-flat) |
| Weapon Damage | +8% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% weapon dmg | 8 | 0.6 | adds | Clean weapon damage |
| `long_range` | +60% velocity | 40% | 0.8 | adds | Velocity lands ranged shots; no raw dmg of its own |
| `mid_range` | lead-time help | 40% | 1.3 | adds | Helps 11–19m gunfights |
| `gun_burst_damage` | per-shot amp | 4 | 0.2 | adds | Propagation |
| `gun_continuous_damage` | per-shot amp | 3 | 0.2 | adds | Propagation |

---

## Monster Rounds
- **normalized_name**: `monster_rounds` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_non_player_bonus`
- **wiki**: https://deadlock.wiki/Monster_Rounds

### Interpretation
Pure farming item: +25% weapon damage and +25% bullet resist, both **vs NPCs only**, plus +1 OOC regen. The named `farmer` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs NPCs | +25% | NPC-only |
| Bullet Resist vs NPCs | +25% | NPC-only |
| Out of Combat Regen | +1 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | +25% dmg & resist vs NPCs | 100% | 2.0 | adds | Dedicated farm tool, the cleanest in the game |
| `lane_pusher` | NPC damage clears waves | 70% | 1.8 | adds | Solo wave clear |
| `bullet_damage` | 0 vs heroes | 0 | 0.0 | adds | Explicitly NPC-only — no PvP credit |
| `self_heal` | +1 OOC regen | 0.3 (HP/s eff.) | 0.0 | adds | Trivial sustain |


---

## Restorative Shot
- **normalized_name**: `restorative_shot` · **tier**: 1 (800) · **category**: Weapon · **codename**: `upgrade_restorative_shot`
- **wiki**: https://deadlock.wiki/Restorative_Shot

### Interpretation
+6% weapon damage plus a bullet-triggered self-heal (50 off heroes, 20 off NPCs) on a cooldown that ticks regardless of hit. A slow bullet-gated self-heal trickle.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Healing From Heroes | 50 | Per proc |
| Healing From NPCs / Orbs | 20 | Per proc |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +6% weapon dmg | 6 | 0.4 | adds | Sub-baseline weapon damage |
| `self_heal` | 50/proc off heroes | ~120 (HP/fight eff.) | 0.8 | adds | Several procs over a sustained fight |
| `continous_heal` | ~8 HP/s trickle | 8 (HP/s) | 0.8 | adds | Sustained out-of-1s heal |
| `bullet_lifesteal` | bullet-gated self-heal | 6 (eff. lifesteal %) | 1.2 | adds | Functions as weak gun lifesteal |
| `gun_continuous_proc` | per-shot, cd-gated | ProcImportance 90%/(6×?) | 2.0 | adds | Heals on a cadence as you sustain fire |

### Corrections
It should have both continous and burst proc, for continous it should either b 90%/(6x6) or 90%/(6x.1) or 90%/(6x3) you could argue the duration is either the whole cooldown, .1(instant), or (half the coldown..)

---

## Extra Health
- **normalized_name**: `extra_health` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health_t1`
- **wiki**: https://deadlock.wiki/Extra_Health

### Interpretation
Pure +210 HP passive. The cleanest T1 `high_max_hp` provider.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +210 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | +210 HP | 210 (flat HP) | 2.0 | adds | Large clean HP pool |
| `damage_sponge` | raw HP soaks dmg | 60% | 1.3 | adds | Core of soaking damage |
| `scaling_early` | cheap survivability | 50% | 1.0 | adds | Strong early |

---

## Extra Regen
- **normalized_name**: `extra_regen` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_health_regen`
- **wiki**: https://deadlock.wiki/Extra_Regen

### Interpretation
+2.5 health regen (always-on) and +1.5 OOC regen. Cheap sustain.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +2.5/sec | Passive (always on) |
| Out of Combat Regen | +1.5/sec | OOC only |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 2.5/s + 1.5 OOC | ~3.0 (HP/s eff.) | 0.3 | adds | 2.5 always-on + 1.5×0.3 OOC |
| `self_heal` | all self regen | ~3.0 (HP/s) | 0.0 | adds | Self-directed |
| `scaling_early` | cheap laning sustain | 40% | 0.8 | adds | Early lane staying power |

---

## Extra Stamina
- **normalized_name**: `extra_stamina` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_stamina`
- **wiki**: https://deadlock.wiki/Extra_Stamina

### Interpretation
+1 stamina charge and +12% stamina recovery. Split mobility. Named `vertical_mobility` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive charge |
| Stamina Recovery | +12% | Faster regen |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +1 stamina + 12% regen | 1.0 (stamina charge) | 0.1 | adds | One extra air-jump/dash per cycle |
| `horizontal_mobility` | half-charge | 0.5 (stamina, m/s eq.) | 0.8 | adds | Half toward sprint/dash distance |
| `escape` | panic dash | 60% | 1.2 | adds | Strong disengage |
| `engage` | jump-on | 40% | 0.8 | adds | Also helps commit |
| `scaling_early` | cheap, owned early | 50% | 1.0 | adds | Owned from start |


### Corrections
horizontal mobility's main unit is m/s we need to find a conversion for stamina to this. Verical mobility's unit is m ...

---

## Healing Rite
- **normalized_name**: `healing_rite` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_heal_t1`
- **wiki**: https://deadlock.wiki/Healing_Rite

### Interpretation
Active: heals 300 HP over 20s, +2m sprint while channeling, 30m cast. OOC/laning sustain reset; dispelled by damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Total HP Regen | 300 | Over 20s; dispelled if damaged |
| Sprint Speed | +2m | While active |
| Regen Duration | 20s | — |
| Cast Range | 30m | Self/ally |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `self_heal` | 300 over 20s | 300 (total HP) | 2.0 | adds | Huge raw heal, OOC-gated (dispels on damage) |
| `continous_heal` | 15 HP/s, 20s | 15 (HP/s) | 1.5 | adds | Big sustained OOC heal |
| `horizontal_mobility` | +2m sprint while channeling | 1.0 (m/s eff.) | 1.5 | adds | 2m sprint × 0.5 weight, channel-only |
| `escape` | heal+sprint reset | 40% | 0.8 | adds | Disengage-and-recover |


### Corrections
Horizontal mobility needs to look at the effective sprint speed. 

---

## Melee Lifesteal
- **normalized_name**: `melee_lifesteal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_melee_lifesteal`
- **wiki**: https://deadlock.wiki/Melee_Lifesteal

### Interpretation
+12% melee damage and 100 HP heal on melee hit. Sustain + offense for melee heroes.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +12% | Passive |
| Heal on Melee Hit | 100 | Per hit |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +12% + heal | 12 (eff. %) + heal | 0.4 | adds | Direct amp plus melee-triggered lifesteal |
| `self_heal` | 100/melee hit | ~200 (HP/fight eff.) | 1.3 | adds | Strong on-hit sustain in melee |
| `burst_heal` | 100/hit | 100 (HP within 1s) | 0.8 | adds | Each hit is a sub-1s spike |
| `melee_damage` | melee-committed value | 60% | 2.0 | relies | Pays off on melee heroes |
| `engage` | dive to heal | 50% | 1.0 | adds | Rewards committing to melee |
| `close_range` | melee only | 50% | 1.0 | adds | Functions only up close |

### Corrections
close range should be closer to 100%

---

## Rebuttal
- **normalized_name**: `rebuttal` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_rebuttal`
- **wiki**: https://deadlock.wiki/Rebuttal

### Interpretation
-1.75s parry cooldown, +18% melee resist, +75 HP, and +30% bonus damage (6s) after a parry. A defensive/parry-tempo melee item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Parry Cooldown | -1.75s | Passive |
| Melee Resist | +18% | Passive |
| Bonus Health | +75 | Passive |
| Bonus Damage | +30% | After a parry, 6s |
| Buff Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_resistance` | +18% melee resist | 18 (eff. %) | 1.1 | adds | Solid melee defense |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.7 | adds | Decent HP top-up |
| `melee_damage` | +30% after parry | 30×0.4 = 12 | 1.0 | adds | Strong but parry-gated uptime |
| `counter_importance` | punishes melee divers | 70% | 1.4 | adds | Anti-melee / parry reaction |
| `damage_sponge` | HP + melee resist | 40% | 0.9 | adds | Soaks melee pressure |


### Corrections
the effective melee resistance should be higher, it lowers the parry cooldown. 


---

## Sprint Boots
- **normalized_name**: `sprint_boots` · **tier**: 1 (800) · **category**: Vitality · **codename**: `upgrade_sprint_boots`
- **wiki**: https://deadlock.wiki/Sprint_Boots

### Interpretation
+2m sprint speed and +2 OOC regen. Rotation mobility; sprint counts at ×0.5. Named `horizontal_mobility`/`small_hitbox` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +2m | Only while sprinting |
| Out of Combat Regen | +2/sec | OOC only |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m sprint | 1.0 (m/s eff.) | 1.5 | adds | 2m sprint × 0.5 weight |
| `farmer` | faster traversal | 50% | 1.0 | adds | Camp-to-camp speed |
| `escape` | sprint disengage | 40% | 0.8 | adds | OOC speed aids retreat |
| `engage` | close distance | 30% | 0.6 | adds | Pre-fight positioning |
| `self_heal` | +2 OOC regen | 0.6 (HP/s eff.) | 0.0 | adds | OOC regen × 0.3 |
| `small_hitbox` | mobility build | 40% | 1.6 | adds | Harder to track when moving |


### Corrections
self hel's current unit is total healing, so for OOC calculate the total health from a single OOC session, id say itl be around 10-30ish seconds?? idk. But that should make this item around 6-12 total self heal..

---

## Extra Charge
- **normalized_name**: `extra_charge` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_extra_charge`
- **wiki**: https://deadlock.wiki/Extra_Charge

### Interpretation
+1 ability charge and +7 Spirit Power for charged abilities. Pure synergy item for charge-based kits. Named `charge_dependant` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Ability Charges | +1 | Charge abilities only |
| Spirit Power (charged) | +7 | Gated to charged abilities |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +1 charge | 1.0 (extra charge) | 0.0 | adds | Entire value is the extra charge |
| `charge_dependant` | useless off-kit | 100% | 2.0 | relies | Pure synergy — needs charge abilities |
| `spirit_damage` | +7 SP (charged) | 5 (eff. SP) | 0.5 | adds | Gated SP → modest effective |
| `single_ability_focus` | one charged ability | 60% | 1.2 | adds | Value concentrates on one ability |

### Corrections
Chrge dependant is more of a judgment based one... this should be closer to 1.5

---

## Extra Spirit
- **normalized_name**: `extra_spirit` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_extra_spirit`
- **wiki**: https://deadlock.wiki/Extra_Spirit

### Interpretation
Pure +10 Spirit Power passive. The clean T1 spirit baseline; named `self_buff` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +10 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +10 SP | 10 (eff. SP) | 0.9 | adds | Clean flat Spirit Power |
| `self_buff` | generic stat-up | 80% | 1.8 | adds | Pure self stat boost |
| `scaling_early` | cheap early SP | 50% | 1.0 | adds | Early caster pickup |

### Corrections
this is not a buff..
---

## Golden Goose Egg
- **normalized_name**: `golden_goose_egg` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_golden_goose_egg`
- **wiki**: https://deadlock.wiki/Golden_Goose_Egg

### Interpretation
Souls-economy consumable: 90 souls/min, -10% damage penalty, +1m sprint, +1 OOC regen. Pure gold acceleration with a small offense cost.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Soul Value per Minute | 90 | ~4m27s to pay back its 800 cost |
| Damage Penalty | -10% | Downside |
| Sprint Speed | +1m | Passive |
| Out of Combat Regen | +1/sec | OOC only |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | 90 souls/min | 60% | 1.2 | adds | Economy acceleration without farming |
| `scaling_late` | front-loaded souls | 60% | 1.7 | adds | Compounds into a stronger late build |
| `bullet_damage` | -10% penalty | -10 | -0.8 | adds | Real self downside |
| `spirit_damage` | -10% penalty | -10 (eff. SP eq.) | -0.9 | adds | Penalty hits abilities too |
| `horizontal_mobility` | +1m sprint | 0.5 (m/s eff.) | 0.8 | adds | 1m sprint × 0.5 |

### Corrections
The negative damage penalty makes the farming aspect worse, scaling late aspect here is good, maybe just dont look into bullet or spirit damage sinccthe goal is to sell this item to get a boost..

---

## Mystic Burst
- **normalized_name**: `mystic_burst` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_mystic_burst`
- **wiki**: https://deadlock.wiki/Mystic_Burst

### Interpretation
Charge-up proc: 40 bonus spirit damage on trigger. Named anchor for `spirit_proc`/`spirit_burst_proc`/`scaling_early`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Damage | 40 | Charge-up proc; triggers spirit-lifesteal |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 40 spike | 40 (dmg in 1s) | 1.3 | adds | Clean sub-1s spirit burst |
| `spirit_proc` | 40 × reliable trigger | high | 1.3 | adds | Reliable cheap spirit proc |
| `spirit_burst_proc` | instant/instant | 1.0 (burst index) | 1.5 | adds | 100%×(0.1/0.1) per `tag_descriptions.md` |
| `spirit_damage` | 40 dmg | 8 (eff. SP) | 0.8 | relies | 40/5 = 8 effective SP |
| `aoe_cluster` | small AoE proc | 50% | 1.0 | adds | Some area coverage |
| `scaling_early` | dominant cheap spirit | 100% | 2.0 | adds | Named scaling_early anchor |

---

## Mystic Expansion
- **normalized_name**: `mystic_expansion` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_mystic_reach`
- **wiki**: https://deadlock.wiki/Mystic_Expansion

### Interpretation
+20% ability range, kit-wide. Named anchor for `range_extender_dependant`/`multi_ability_focus`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +20% | Passive, all abilities |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +20% range | 20 (% range, add) | 2.0 | adds | Full-credit range up |
| `multi_ability_focus` | kit-wide | 100% | 2.0 | adds | Affects every ability's reach |
| `self_buff` | enabler stat | 60% | 1.3 | adds | Self utility |
| `long_range` | more poke range | 40% | 0.8 | adds | Extends ranged casters |

### Corrections
it got full credit for range extender, it shouldnt have, the tag_descriptions markdown should explicitley ssy that since it only imbues a single item it should effectvley discont that a bit. this is NOT kit wide, how did this mis interpretation even happen?

---

## Mystic Regeneration
- **normalized_name**: `mystic_regeneration` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_mystic_regeneration`
- **wiki**: https://deadlock.wiki/Mystic_Regeneration

### Interpretation
+50 HP and a triggered 4 HP/s regen for 7s (28 HP/trigger). Small spirit-side sustain.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Regeneration | 4 HP/s | Triggered |
| Regeneration Duration | 7s | 28 HP/trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 28/trigger over 7s | ~4 (HP/s eff.) | 0.4 | adds | Triggered sustained regen |
| `self_heal` | ~28/trigger | ~28 (HP) | 0.2 | adds | Self-directed |
| `high_max_hp` | +50 HP | 50 (flat HP) | 0.5 | adds | Token HP |
| `spirit_lifesteal` | spirit-uptime sustain | 30% | 2.0 | relies | Rewards ability uptime |

### Corrections
Total healing should be 4 HP/s*7s with an uptime of about 75% so the total healing (During combat when it matters) should be closer to (21 HP) why is the unit ~4??? especially when the self heal unit right after is 28 (closer to being right). 

---

## Rusted Barrel
- **normalized_name**: `rusted_barrel` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_withering_whip`
- **wiki**: https://deadlock.wiki/Rusted_Barrel

### Interpretation
Active debuff (32m cast, 5s): -32% fire rate and -8% bullet resist on the target, plus +60 HP and +0.5m sprint passive. Named anchor for `fire_rate_slow` (single-target). NOT `movement_slow`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | -32% | 5s debuff on target |
| Bullet Resist | -8% | 5s |
| Cast Range | 32m | — |
| Duration | 5s | — |
| Bonus Health | +60 | Passive |
| Sprint Speed | +0.5m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -32% fire rate, 5s, 1 target | 32 (eff. %, positive) | 2.0 | adds | Single-target gun shutdown; full debuff value |
| `bullet_resist_shred` | -8% bullet resist, 1 target | 1.6 (8×0.2 single-target) | 0.4 | adds | Small shred on the debuff, positive |
| `gun_continuous_resistance` | cuts enemy fire rate | 32% | 2.0 | adds | Throttling fire ≈ gun mitigation |
| `counter_importance` | shuts a gun threat | 80% | 1.6 | adds | Bought vs gun-DPS |
| `single_target` | one-target cast | 60% | 1.3 | adds | No AoE |
| `high_max_hp` | +60 HP | 60 (flat HP) | 0.6 | adds | HP rider |

### Corrections
tag_descriptions litterally says the unit is effective fire rate down %xuptimexunitsHit, why is it just a %?? You pretty much ignored my units! 
---

## Spirit Strike
- **normalized_name**: `spirit_strike` · **tier**: 1 (800) · **category**: Spirit · **codename**: `upgrade_spirit_strike`
- **wiki**: https://deadlock.wiki/Spirit_Strike

### Interpretation
Melee-triggered: 40 (+0.37×Spirit Power) spirit damage and -6% spirit resist for 6s. Melee-spirit hybrid proc that also shreds spirit resist.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage | 40 base + 0.37×Spirit Power | On melee hit |
| Spirit Resist | -6% | 6s debuff |
| Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | 40 dmg on melee | 8 (eff. SP) | 0.8 | adds | 40/5 effective SP |
| `spirit_damage` | 0.37×SP scaling | 15 (eff. SP) | 1.4 | relies | 40/5 + 0.37×20 ≈ 15 SP-equiv, scales with SP |
| `spirit_resist_shred` | -6% spirit resist | 6 (eff. %, positive) | 1.4 | adds | Self-applied, enables spirit follow-up |
| `melee_damage` | melee-triggered | 40% | 1.3 | adds | Rewards melee-spirit hybrids |
| `spirit_burst_damage` | 40 spike | 40 (dmg in 1s) | 1.3 | adds | Burst inside 1s window |
| `engage` | melee trigger | 40% | 0.8 | adds | Rewards diving in |


---

# T2 (1600 souls)

## Active Reload
- **normalized_name**: `active_reload` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_active_reload`
- **wiki**: https://deadlock.wiki/Active_Reload

### Interpretation
+20% max ammo passive plus a skill-timed instant reload granting a 7s buff: +25% fire rate, +16% bullet lifesteal, +0.75m move. A burst-DPS tempo spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Fire Rate | +25% | Active, 7s |
| Bullet Lifesteal | +16% | Active, 7s |
| Move Speed | +0.75m | Active |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +20% ammo + instant reload | 55 (eff. ammo %) | 1.1 | adds | 20% nominal, bumped for the instant-reload mechanic |
| `fire_rate` | +25% (7s window) | 18 (eff. %, ×~0.7 uptime) | 1.2 | adds | Strong but windowed |
| `bullet_lifesteal` | +16% (7s) | 11 (eff. %) | 1.4 | adds | Real sustain during the buff |
| `gun_burst_damage` | reload buff window | 20 | 0.6 | adds | Designed burst spike |
| `ability_spam` | rewards reload timing | 40% | 0.8 | adds | Repeated active use |

### Corrections
guns dont count as an ability, so no ability spam

---

## Fleetfoot
- **normalized_name**: `fleetfoot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_fleetfoot_boots`
- **wiki**: https://deadlock.wiki/Fleetfoot

### Interpretation
+6% weapon damage, +35% slide distance, +6% bullet resist, plus active (5s): +3m move and +40% slow resist. Mobility/kiting weapon item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +6% | Passive |
| Slide Distance | +35% | Passive |
| Bullet Resist | +6% | Passive |
| Move Speed | +3m | Active, 5s |
| Slow Resist | +40% | Active, 5s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +3m (active) | 1.2 (m/s eff.) | 1.2 | adds | Full move-speed burst, windowed |
| `bullet_resistance` | +6% | 6 (eff. %) | 0.5 | adds | Minor passive bullet resist |
| `bullet_damage` | +6% | 6 | 0.3 | adds | Small weapon damage |
| `cc_resist` | +40% slow resist (active) | 24 (eff. %) | 0.8 | adds | Windowed slow resistance |
| `escape` | move+slow-resist active | 60% | 1.2 | adds | Disengage tool |
| `small_hitbox` | mobility build | 40% | 1.6 | adds | Harder to track |

### Corrections
small hit box is a good choice, but a very high...

---

## Intensifying Magazine
- **normalized_name**: `intensifying_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_intensifying_clip`
- **wiki**: https://deadlock.wiki/Intensifying_Magazine

### Interpretation
+20% max ammo, ramping to +45% weapon damage after 2.5s sustained fire. Named anchor for `gun_continuous_damage`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Max Weapon Damage | +45% | Ramps over 2.5s sustained fire |
| Time for Max Damage | 2.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_continuous_damage` | +45% at full ramp | 45 | 2.0 | adds | Defines sustained-fire DPS |
| `bullet_damage` | ramps 0→45% | 30 (eff. avg %) | 1.5 | adds | Averaged below the 45% peak |
| `magazine_size_dependant` | +20% ammo | 20 (eff. ammo %) | 0.4 | adds | Sustains the ramp |
| `gun_burst_damage` | back-loaded | 5 | 0.1 | adds | Little early-burst value |
| `fire_rate` | reaches peak faster | 30% | 2.0 | relies | Faster fire ramps sooner |

### Corrections
Im afraid the titanic magazine is pulling too much weight in scoring, make it so that any 2.0 items should have less weight on the general curve since its not uncommon for 2.0 items are outliers and leages ahead of others

---

## Kinetic Dash
- **normalized_name**: `kinetic_dash` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_kinetic_sash`
- **wiki**: https://deadlock.wiki/Kinetic_Dash

### Interpretation
+1 stamina, +12% stamina recovery, plus a dash-triggered buff (7s): +25% fire rate, +6 temp ammo. Rewards dash-heavy gunplay.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Fire Rate | +25% | After dashing, 7s |
| Temporary Ammo | +6 | Conditional, 7s |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +25% (dash-gated) | 16 (eff. %, ×~0.65) | 1.1 | adds | Strong but requires dashing |
| `vertical_mobility` | +1 stamina | 1.0 (stamina) | 0.1 | adds | Extra dash/jump charge |
| `horizontal_mobility` | half-charge | 0.5 (stamina) | 0.5 | adds | Half toward horizontal |
| `magazine_size_dependant` | +6 temp ammo | 8 (eff. ammo %) | 0.2 | adds | Windowed ammo |
| `aerial` | dash-triggered | 50% | 1.1 | adds | Rewards air/dash play |
| `engage` | dash-in trigger | 40% | 0.8 | adds | Dash to start DPS buff |

---

## Long Range
- **normalized_name**: `long_range` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_long_range`
- **wiki**: https://deadlock.wiki/Long_Range

### Interpretation
+8% falloff range, +0.75m sprint, +40% weapon damage beyond 15m. Named anchor for `long_range`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Fall-off Range | +8% | Passive |
| Sprint Speed | +0.75m | Passive |
| Weapon Damage | +40% | Target beyond 15m |
| Min. Distance | 15m | Range gate |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | +40% beyond 15m | 100% | 2.0 | adds | The defining 20m+ damage amp |
| `bullet_damage` | +40% (range only) | 32 (40×0.8 uptime) | 1.6 | adds | Huge for ranged heroes |
| `bullet_damage` | range-gated | 40 | 2.0 | relies | Only pays off at range |
| `mid_range` | partial in 11–19m | 40% | 1.3 | adds | Some value mid-band |
| `gun_burst_damage` | per-shot amp | 16 | 0.5 | adds | Propagation |
| `gun_continuous_damage` | per-shot amp | 10 | 0.4 | adds | Propagation |
| `aerial` | preserves air-shots | 40% | 0.9 | adds | Air sniping |

### Corrections
whats up with the random 40 in bullet damage relies???

---

## Melee Charge
- **normalized_name**: `melee_charge` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_melee_charge`
- **wiki**: https://deadlock.wiki/Melee_Charge

### Interpretation
+50% heavy melee distance, +10% melee damage, +6% bullet resist, +25% bonus heavy melee damage. Named anchor for `melee_damage`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +50% | Passive |
| Melee Damage | +10% | Passive |
| Bullet Resist | +6% | Passive |
| Bonus Heavy Damage | +25% | Heavy melee |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +10% + 25% heavy | 30 (eff. %) | 0.7 | adds | Both light and heavy melee scaled |
| `melee_damage` | melee-committed | 60% | 1.3 | relies | Pays off on melee heroes |
| `close_range` | heavy melee tool | 80% | 1.6 | adds | Point-blank |
| `grounded` | melee is grounded | 60% | 2.0 | adds | Implicit per `tags.json` |
| `bullet_resistance` | +6% | 6 (eff. %) | 0.5 | adds | Small bullet resist |
| `engage` | extended reach | 60% | 1.2 | adds | Heavy-melee gap closer |

### Corrections
HOW THE HELL IS MELEE DAMAGE ONLY .7 NROMALIZED THIS SHOULD DEF BE HIGHER, like MAYBE 1.15

---

## Mystic Shot
- **normalized_name**: `mystic_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_crackshot`
- **wiki**: https://deadlock.wiki/Mystic_Shot

### Interpretation
+7 Spirit Power, and a bullet proc dealing 40 (+1.2×Spirit Power) spirit damage. Hybrid gun/spirit; scales hard with SP.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Spirit Damage (proc) | 40 base + 1.2×Spirit Power | On bullet proc |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +7 SP flat | 7 (eff. SP) | 0.4 | adds | Small flat SP |
| `spirit_damage` | 40 + 1.2×SP proc | 32 (eff. SP) | 2.0 | relies | 40/5 + 1.2×20 = 32 — scales hard with SP |
| `bullet_proc` | per-shot spirit | high | 1.3 | adds | Bullet-triggered spirit proc |
| `gun_burst_proc` | single-shot | index | 1.0 | adds | Procs off single shots |
| `hybrid_damage_usage` | gun trigger + spirit payoff | 100% | 2.0 | adds | Iconic double-dipper |
| `spirit_burst_damage` | 40+ spike | 40 (dmg in 1s) | 0.8 | adds | Spirit spike in 1s |

### Corrections
for spirit damage add it shouldve done the +7 flat and the actual damage all at once, more like 7+(40+1.2x20)/5

---

## Opening Rounds
- **normalized_name**: `opening_rounds` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_pristine_emblem`
- **wiki**: https://deadlock.wiki/Opening_Rounds

### Interpretation
+60% bullet velocity, +8% weapon damage, +4 Spirit Power, and +30% weapon damage at the start of an engagement. Flat-stat staple (Pristine Emblem) with a fight-opening spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Spirit Power | +4 | Passive |
| Weapon Damage (opening) | +30% | Start of engagement |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +8% + 30% opening | 18 (eff. avg %) | 0.9 | adds | Flat + averaged opening burst |
| `gun_burst_damage` | +30% opening | 30 | 0.9 | adds | Designed opening burst |
| `long_range` | +60% velocity | 40% | 0.8 | adds | Velocity lands ranged shots |
| `self_buff` | broad staple | 80% | 1.8 | adds | Pristine Emblem stat staple |
| `spirit_damage` | +4 SP | 4 (eff. SP) | 0.2 | adds | Token SP |
| `scaling_early` | opening aggression | 60% | 1.2 | adds | Rewards early fights |

---

## Recharging Rush
- **normalized_name**: `recharging_rush` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_rechargingbullets`
- **wiki**: https://deadlock.wiki/Recharging_Rush

### Interpretation
+20% max ammo, +10% weapon damage, plus a move/ammo recharge after dealing 200 damage in 3.5s. Sustained-fire mobility reward.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Weapon Damage | +10% | Passive |
| Damage Threshold | 200 | Trigger |
| Time Frame | 3.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +20% ammo + recharge | 28 (eff. ammo %) | 0.6 | adds | Ammo + on-damage recharge |
| `bullet_damage` | +10% | 10 | 0.5 | adds | Solid weapon damage |
| `horizontal_mobility` | move on trigger | 0.7 (m/s eff.) | 0.7 | adds | Speed reward post-damage |
| `gun_continuous_damage` | rewards sustained fire | 10 | 0.4 | adds | Hit the threshold by sustaining |
| `gun_continuous_proc` | 200 dmg/3.5s | index | 1.0 | adds | Sustained-damage trigger |

### Corrections
gun burst proc wouldve worked here too
---

## Slowing Bullets
- **normalized_name**: `slowing_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_slowing_bullets`
- **wiki**: https://deadlock.wiki/Slowing_Bullets

### Interpretation
+15% weapon damage; bullets apply -30% move slow and -22% dash for 3.5s. Gun-applied sticky slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Move Speed | -30% | On hit, 3.5s |
| Dash Distance | -22% | Conditional |
| Slow Duration | 3.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% on bullet hit, 3.5s | 30 (eff. %, positive) | 1.0 | adds | Reliable high-uptime gun-applied slow |
| `bullet_damage` | +15% | 15 | 0.8 | adds | Solid weapon damage |
| `bullet_proc` | per-shot slow | high | 1.3 | adds | Refreshes every hit |
| `gun_continuous_proc` | per-shot | index | 1.0 | adds | Sustained fire keeps slow up |
| `counter_importance` | anti-mobility | 60% | 1.2 | adds | Catches slippery targets |
| `single_target` | per-shot target | 50% | 1.1 | adds | Lands on the shot target |

---

## Spirit Shredder Bullets
- **normalized_name**: `spirit_shredder_bullets` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_tech_defense_shredders`
- **wiki**: https://deadlock.wiki/Spirit_Shredder_Bullets

### Interpretation
Bullets apply -8% spirit resist and grant +10% spirit lifesteal for 8s. Gun-applied spirit-resist shred.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | -8% | On bullet hit, 8s |
| Spirit Lifesteal | +10% | Conditional, 8s |
| Debuff Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% on bullet hit, 8s | 8 (eff. %, positive) | 1.2 | adds | Gun-applied, high uptime, team-wide effect |
| `spirit_lifesteal` | +10% (8s) | 7 (eff. %) | 0.3 | adds | Spirit sustain while debuff up |
| `bullet_proc` | per-shot debuff | high | 1.3 | adds | Applies/refreshes every hit |
| `hybrid_damage_usage` | gun enabling spirit | 70% | 1.4 | adds | Gun trigger → spirit benefit |
| `counter_importance` | cracks spirit-resist | 50% | 1.0 | adds | Vs spirit-tanky targets |

---

## Split Shot
- **normalized_name**: `split_shot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_split_shot`
- **wiki**: https://deadlock.wiki/Split_Shot

### Interpretation
Active (5s): fire 5 projectiles per shot, +8% weapon damage per stack (max 5). Multishot wave-clear / AoE.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Multishot | 5 | Active |
| Weapon Damage per Stack | +8% | Up to 5 stacks |
| Buff Duration | 5s | — |
| Max Stacks | 5 | — |
| Stack Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 5 projectiles | 75% | 1.5 | adds | Spreads damage across grouped enemies |
| `bullet_damage` | up to +40% stacked | 25 (eff. avg %) | 1.2 | adds | 8%×5 during active, averaged |
| `farmer` | shreds waves/camps | 80% | 1.6 | adds | Multishot clears creeps |
| `lane_pusher` | solo wave clear | 70% | 1.8 | adds | Strong push |
| `gun_continuous_damage` | sustained multishot | 20 | 0.9 | adds | Sustained DPS in window |
| `mid_range` | spread works mid | 40% | 1.3 | adds | Best at moderate range |

---

## Stalker
- **normalized_name**: `stalker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_weapon_backstabber`
- **wiki**: https://deadlock.wiki/Stalker

### Interpretation
-50% footstep sound, +50 HP, and a close-range (8m) 17/s DoT applying -6% bullet resist and +1.5m move for 5s. Flanker/ambush gun item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Footstep Sound Distance | -50% | Passive |
| Bonus Health | +50 | Passive |
| Damage Per Second | 17 | Close-range (8m) |
| Bullet Resist | -6% | Conditional, 5s |
| Move Speed | +1.5m | Conditional, 5s |
| Close Range | 8m | Gate |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_continuous_damage` | 17 DPS close | 17 | 0.8 | adds | Sustained close-range bonus damage |
| `dot` | 17/s | 30 (eff. total) | 0.9 | adds | Tick-based bonus damage |
| `bullet_resist_shred` | -6%, 5s | 6 (eff. %, positive) | 0.9 | adds | Small bullet shred on the debuff |
| `close_range` | 8m gate | 80% | 1.6 | adds | Only within 8m |
| `away_from_team` | footstep silence | 70% | 1.6 | adds | Flank/solo tool |
| `horizontal_mobility` | +1.5m (active) | 0.75 (m/s eff.) | 0.8 | adds | Windowed move |
| `engage` | ambush | 50% | 1.0 | adds | Ambush-engage flavor |

---

## Swift Striker
- **normalized_name**: `swift_striker` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_blitz_bullets`
- **wiki**: https://deadlock.wiki/Swift_Striker

### Interpretation
+20% fire rate and +0.75m sprint, pure passive. Clean T2 fire-rate scaler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +20% | Passive |
| Sprint Speed | +0.75m | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +20% | 20 (eff. %) | 1.3 | adds | Clean unconditional fire rate |
| `gun_continuous_damage` | more shots/sec | 20 | 0.9 | adds | Lifts sustained DPS |
| `gun_burst_damage` | faster ramp | 12 | 0.4 | adds | Faster burst ramp |
| `horizontal_mobility` | +0.75m sprint | 0.4 (m/s eff.) | 0.4 | adds | Sprint × 0.5 |

---

## Titanic Magazine
- **normalized_name**: `titanic_magazine` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_titan_round`
- **wiki**: https://deadlock.wiki/Titanic_Magazine

### Interpretation
+100% max ammo and +14% weapon damage, pure passive. Cross-tier ceiling for raw magazine size.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +100% | Passive |
| Weapon Damage | +14% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | +100% ammo | 100 (eff. ammo %) | 2.0 | adds | Highest raw ammo in the set |
| `bullet_damage` | +14% | 14 | 0.7 | adds | Solid weapon damage rider |
| `gun_continuous_damage` | huge mag | 20 | 0.9 | adds | Far more sustained fire pre-reload |
| `gun_burst_damage` | per-shot | 7 | 0.2 | adds | Minor burst |

---

## Weakening Headshot
- **normalized_name**: `weakening_headshot` · **tier**: 2 (1600) · **category**: Weapon · **codename**: `upgrade_headshot_booster2`
- **wiki**: https://deadlock.wiki/Weakening_Headshot

### Interpretation
+60 HP, and a headshot applies -13% bullet resist for 12s. Headshot-gated bullet shred.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +60 | Passive |
| Bullet Resist | -13% | On headshot, 12s |
| Debuff Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -13% on headshot, 12s | 13 (eff. %, positive) | 2.0 | adds | Strong shred, long uptime, headshot-gated |
| `headshot_damage` | requires heads | 60% | 1.0 | relies | Must land heads to apply |
| `counter_importance` | anti-armor | 70% | 1.4 | adds | Vs tanky targets |
| `high_max_hp` | +60 HP | 60 (flat HP) | 0.4 | adds | HP rider |
| `single_target` | one-target debuff | 50% | 1.1 | adds | Single target |

---

## Battle Vest
- **normalized_name**: `battle_vest` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_regenerating_bullet_shield`
- **wiki**: https://deadlock.wiki/Battle_Vest

### Interpretation
+18% bullet resist, +3 OOC regen, plus a damage-reaction buff (+18% weapon damage, +7% fire rate when hit). Defensive-into-offensive.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +18% | Passive |
| Out of Combat Regen | +3/sec | OOC |
| Weapon Damage | +18% | Reaction to taking damage |
| Fire Rate | +7% | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +18% | 18 (eff. %) | 1.4 | adds | Solid flat bullet resist |
| `gun_continuous_resistance` | +18% | 18 | 0.8 | adds | Sustained bullet mitigation |
| `damage_sponge` | buff procs when hit | 80% | 1.8 | adds | Value from being shot |
| `bullet_damage` | +18% (reaction) | 12 (eff. %) | 0.6 | adds | Conditional weapon damage |
| `fire_rate` | +7% (reaction) | 5 (eff. %) | 0.3 | adds | Small conditional fire rate |

---

## Bullet Lifesteal
- **normalized_name**: `bullet_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vampire`
- **wiki**: https://deadlock.wiki/Bullet_Lifesteal_(item)

### Interpretation
+13% bullet lifesteal, +90 HP, +6% weapon damage, pure passive. Named anchor for `bullet_lifesteal`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Weapon Damage | +6% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +13% | 13 (eff. %) | 1.7 | adds | Clean passive gun lifesteal |
| `self_heal` | lifesteal trickle | 0.3× (covered by lifesteal) | 0.0 | adds | Sustained self-heal from gun damage |
| `continous_heal` | sustains long fights | 30% | 2.0 | adds | Lifesteal across fights |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.6 | adds | Good HP rider |
| `bullet_damage` | +6% | 6 | 0.3 | adds | Small weapon damage |
| `damage_sponge` | sustain rewards staying | 40% | 0.9 | adds | Stay in fight |

---

## Debuff Reducer
- **normalized_name**: `debuff_reducer` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_debuff_reducer`
- **wiki**: https://deadlock.wiki/Debuff_Reducer

### Interpretation
+90 HP and +25% debuff resist. Shortens stuns/slows/silences on you.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +90 | Passive |
| Debuff Resist | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `debuff_resistance` | +25% | 25 (eff. %) | 0.8 | adds | Flat debuff-duration cut |
| `cc_resist` | +25% | 25 (eff. %) | 0.8 | adds | Same vs CC |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.6 | adds | Good HP rider |
| `counter_importance` | anti-CC | 80% | 1.6 | adds | Vs CC-heavy comps |

---

## Enchanters Emblem
- **normalized_name**: `enchanters_emblem` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_magic_shield`
- **wiki**: https://deadlock.wiki/Enchanters_Emblem

### Interpretation
+18% spirit resist, +2 OOC regen, +15 Spirit Power, +5% CDR. Defensive spirit-stat hybrid.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +18% | Passive |
| Out of Combat Regen | +2/sec | OOC |
| Spirit Power | +15 | Passive |
| Ability Cooldown Reduction | +5% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +18% | 18 (eff. %) | 1.2 | adds | Solid flat spirit resist |
| `spirit_continuous_resistance` | +18% | 18 | 1.4 | adds | Sustained spirit mitigation |
| `spirit_damage` | +15 SP | 15 (eff. SP) | 0.9 | adds | Strong flat SP |
| `cooldown_reduction` | +5% | 5 (eff. %) | 0.4 | adds | Minor CDR |
| `self_buff` | broad package | 70% | 1.6 | adds | Self-stat bundle |

---

## Enduring Speed
- **normalized_name**: `enduring_speed` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_cardio_calibrator`
- **wiki**: https://deadlock.wiki/Enduring_Speed

### Interpretation
+2m move speed (full weight), +2 OOC regen, +25% slow resist. Named `horizontal_mobility` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Move Speed | +2m | Passive (full move speed) |
| Out of Combat Regen | +2/sec | OOC |
| Slow Resist | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `horizontal_mobility` | +2m move | 2.0 (m/s eff.) | 2.0 | adds | Full move speed (not discounted sprint) |
| `cc_resist` | +25% slow resist | 12 (eff. %, slows only) | 0.4 | adds | Partial CC resist |
| `small_hitbox` | mobility build | 50% | 2.0 | adds | Harder to hit |
| `escape` | move+slow-resist | 60% | 1.2 | adds | Disengage |
| `vertical_mobility` | minor traverse | 20% | 2.0 | adds | Slight |

---

## Guardian Ward
- **normalized_name**: `guardian_ward` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_guardian_ward`
- **wiki**: https://deadlock.wiki/Guardian_Ward

### Interpretation
+8% ability range, +1.5 OOC regen, active (40m, 6s): 250 barrier + 2.75m move to ally/self. Support peel.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +8% | Passive |
| Out of Combat Regen | +1.5/sec | OOC |
| Barrier | 250 | Active |
| Move Speed | +2.75m | Active, 6s |
| Buff Duration | 6s | — |
| Cast Range | 40m | Ally-targetable |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 250 | 250 (shield HP) | 0.6 | adds | Solid targetable barrier |
| `team_heal` | 250 shield to ally | 250 (to ally) | 1.9 | adds | 40m cast shields teammates |
| `assist_importance` | peeling for allies | 80% | 1.6 | adds | Value mostly ally-facing |
| `horizontal_mobility` | +2.75m (active) | 1.0 (m/s eff.) | 1.0 | adds | Strong target speed |
| `range_extender_dependant` | +8% range | 8 (% range, add) | 0.5 | adds | Direct range up |
| `close_to_team` | shield allies near | 60% | 1.5 | adds | Best near allies |

---

## Healbane
- **normalized_name**: `healbane` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healbane`
- **wiki**: https://deadlock.wiki/Healbane

### Interpretation
+7 Spirit Power, on hit -35% healing reduction (8s); heals 275 on hero kill. T2 anti-heal with sustain payoff.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +7 | Passive |
| Healing Reduction | -35% | On hit, 8s |
| Heal On Hero Kill | 275 | On kill |
| Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -35% on hit, 8s | 35 (eff. %, positive) | 2.0 | adds | Strong heal cut, high on-hit uptime |
| `counter_importance` | anti-sustain | 100% | 2.0 | adds | Bought vs sustain comps |
| `self_heal` | 275/kill | ~140 (eff. HP) | 0.6 | adds | Burst sustain on kills |
| `burst_heal` | 275 | 275 (HP in 1s) | 1.4 | adds | Kill heal spike |
| `spirit_damage` | +7 SP | 7 (eff. SP) | 0.4 | adds | Token SP |
| `high_kill_count` | kill-gated heal | 40% | 1.1 | adds | Rewards securing kills |

---

## Healing Booster
- **normalized_name**: `healing_booster` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_healing_booster`
- **wiki**: https://deadlock.wiki/Healing_Booster

### Interpretation
+3 health regen, +1 OOC regen, +20% healing effectiveness. Named anchor for `continous_heal`; amplifies team heals.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Health Regen | +3/sec | Passive (always on) |
| Out of Combat Regen | +1/sec | OOC |
| Healing Effectiveness | +20% | Passive amp |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 3/s + 20% amp | ~6 (HP/s eq.) | 0.4 | adds | Always-on regen plus heal multiplier |
| `self_heal` | +20% amp | 40% | 0.2 | adds | Amplifies all self-healing |
| `team_heal` | +20% amp | 40% | 0.3 | adds | Boosts heals given to allies |
| `assist_importance` | amp flows to team | 50% | 1.0 | adds | Partly ally-facing |

---

## Reactive Barrier
- **normalized_name**: `reactive_barrier` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_vex_barrier`
- **wiki**: https://deadlock.wiki/Reactive_Barrier

### Interpretation
+1 OOC regen, and a 325 (+1.8×Spirit Power) barrier reacting to incoming damage (10s). Named anchor for `damage_sponge`/`burst_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier | 325 base + 1.8×Spirit Power | Reaction to damage |
| Duration | 10s | — |
| Out of Combat Regen | +1/sec | OOC |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 325 (+SP) | 325 (shield HP) | 0.7 | adds | Big reactive barrier |
| `damage_sponge` | triggers from being hit | 90% | 2.0 | adds | Value from taking damage |
| `burst_resistance` | absorbs first burst | 80% | 1.8 | adds | Soaks the burst window |
| `counter_importance` | anti-burst | 80% | 1.6 | adds | Reaction tool |
| `shield` | +1.8×SP scaling | 36 (SP-scaled HP) | 0.1 | relies | Barrier scales with carrier SP |

---

## Restorative Locket
- **normalized_name**: `restorative_locket` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_restorative_locket`
- **wiki**: https://deadlock.wiki/Restorative_Locket

### Interpretation
+10% spirit resist, active heals 16/stack (max 25 = 400) + restores 3 stamina. Stacks build then dump. Named anchor for `burst_heal`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Heal Per Stack | 16 | Active dump |
| Max Stacks | 25 | 400 HP at full |
| Max Stamina Restore | 3 | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `burst_heal` | up to 400 | 400 (HP in 1s) | 2.0 | adds | Big sub-1s emergency heal |
| `self_heal` | ~400 | 400 (total HP) | 1.8 | adds | Large self-restore |
| `spirit_resistance` | +10% | 10 (eff. %) | 0.7 | adds | Minor flat spirit resist |
| `vertical_mobility` | +3 stamina | 3.0 (stamina) | 0.3 | adds | Stamina dump = mobility reset |
| `counter_importance` | anti-burst panic | 60% | 1.2 | adds | Emergency button |

---

## Return Fire
- **normalized_name**: `return_fire` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_return_fire`
- **wiki**: https://deadlock.wiki/Return_Fire

### Interpretation
+10% bullet resist, active (6.5s) reflects 65% bullet / 25% spirit damage taken. Named anchor for `damage_sponge`/`melee_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +10% | Passive |
| Bullet Damage Returned | 65% | Active, 6.5s |
| Spirit Damage Returned | 25% | Active, 6.5s |
| Duration | 6.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `damage_sponge` | reflect when shot | 90% | 2.0 | adds | Value comes from being shot |
| `bullet_resistance` | +10% | 10 (eff. %) | 0.8 | adds | Small flat bullet resist |
| `melee_resistance` | reflect deters divers | 50% | 2.0 | adds | Punishes melee divers |
| `counter_importance` | anti focus-fire | 100% | 2.0 | adds | Reaction vs heavy focus |
| `burst_damage` | reflected dmg | 40% | 2.0 | adds | Can punish a kill window |

---

## Spirit Lifesteal
- **normalized_name**: `spirit_lifesteal` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_health_stealing_magic`
- **wiki**: https://deadlock.wiki/Spirit_Lifesteal_(item)

### Interpretation
+13% spirit lifesteal, +90 HP, +6 Spirit Power, pure passive. Named anchor for `spirit_lifesteal`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Power | +6 | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | +13% | 13 (eff. %) | 0.6 | adds | Clean passive spirit lifesteal |
| `self_heal` | lifesteal trickle | 0.3× | 0.0 | adds | Sustained self-heal from spirit |
| `continous_heal` | sustains fights | 30% | 2.0 | adds | Across long fights |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.6 | adds | Good HP rider |
| `spirit_damage` | +6 SP | 6 (eff. SP) | 0.4 | adds | Token SP |

---

## Spirit Shielding
- **normalized_name**: `spirit_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_spirit_bubble`
- **wiki**: https://deadlock.wiki/Spirit_Shielding

### Interpretation
+2.5 OOC regen; after 225 spirit damage in 3.5s grants a 300 barrier (×5 = up to 1500) + 18% spirit resist (8s). Named anchor for `shield`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier | 300 ×5 | After 225 spirit dmg in 3.5s |
| Spirit Resist | +18% | Conditional, 8s |
| Damage Threshold | 225 | Trigger |
| Time Frame | 3.5s | — |
| Barrier Duration | 8s | — |
| Out of Combat Regen | +2.5/sec | OOC |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | up to 1500 | 900 (eff. shield HP) | 2.0 | adds | Large but conditional/stacking spirit-triggered barrier |
| `spirit_resistance` | +18% (windowed) | 14 (eff. %) | 0.9 | adds | Strong while active |
| `spirit_burst_resistance` | barrier soaks burst | 70% | 2.0 | adds | Tanks spirit burst windows |
| `damage_sponge` | spirit-triggered | 70% | 1.6 | adds | From taking spirit damage |
| `counter_importance` | anti-spirit | 90% | 1.8 | adds | Vs spirit comps |

---

## Weapon Shielding
- **normalized_name**: `weapon_shielding` · **tier**: 2 (1600) · **category**: Vitality · **codename**: `upgrade_weapon_shielding`
- **wiki**: https://deadlock.wiki/Weapon_Shielding

### Interpretation
+2.5 OOC regen; after 250 bullet damage in 4s grants a 300 barrier (×5 = up to 1500) + 18% bullet resist (8s). Bullet-side mirror of Spirit Shielding.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier | 300 ×5 | After 250 bullet dmg in 4s |
| Bullet Resist | +18% | Conditional, 8s |
| Damage Threshold | 250 | Trigger |
| Time Frame | 4s | — |
| Barrier Duration | 8s | — |
| Out of Combat Regen | +2.5/sec | OOC |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | up to 1500 | 900 (eff. shield HP) | 2.0 | adds | Large conditional bullet-triggered barrier |
| `bullet_resistance` | +18% (windowed) | 14 (eff. %) | 1.1 | adds | Strong while active |
| `gun_burst_resistance` | barrier soaks burst | 70% | 2.0 | adds | Tanks gun burst windows |
| `damage_sponge` | bullet-triggered | 70% | 1.6 | adds | From taking bullet damage |
| `counter_importance` | anti-gun | 90% | 1.8 | adds | Vs gun comps |

---

## Arcane Surge
- **normalized_name**: `arcane_surge` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_arcane_surge`
- **wiki**: https://deadlock.wiki/Arcane_Surge

### Interpretation
+1 stamina, +12% stamina recovery; after using stamina a 7s window grants +12% range, +15% duration, +20 Spirit Power. Movement-into-casting spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +1 | Passive |
| Stamina Recovery | +12% | Passive |
| Ability Range | +12% | 7s window |
| Ability Duration | +15% | 7s |
| Spirit Power | +20 | 7s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +20 SP (windowed) | 14 (eff. SP, ×0.7) | 0.9 | adds | Strong but dash-window-gated |
| `vertical_mobility` | +1 stamina | 1.0 (stamina) | 0.1 | adds | Extra dash/jump |
| `range_extender_dependant` | +12% (windowed) | 8 (% range) | 0.5 | adds | Conditional range up |
| `duration_dependant` | +15% (windowed) | 10 (% duration) | 0.9 | adds | Conditional duration up |
| `horizontal_mobility` | half-charge | 0.5 (stamina) | 0.5 | adds | Half toward horizontal |
| `ability_spam` | dash→cast cycle | 50% | 1.0 | adds | Rewards the loop |

---

## Bullet Resist Shredder
- **normalized_name**: `bullet_resist_shredder` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_bullet_resist_shredder`
- **wiki**: https://deadlock.wiki/Bullet_Resist_Shredder

### Interpretation
+9% bullet resist, +9% weapon damage, on hit -10% bullet resist (8s). Bullet-shred enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +9% | Passive |
| Weapon Damage | +9% | Passive |
| Bullet Resist (debuff) | -10% | On hit, 8s |
| Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -10% on hit, 8s | 10 (eff. %, positive) | 1.5 | adds | Reliable on-hit shred, high uptime |
| `bullet_resistance` | +9% | 9 (eff. %) | 0.7 | adds | Small flat bullet resist |
| `bullet_damage` | +9% | 9 | 0.4 | adds | Small weapon damage |
| `counter_importance` | anti-armor | 70% | 1.4 | adds | Vs tanks |
| `gun_continuous_proc` | on-hit refresh | index | 1.0 | adds | Sustained fire |

---

## Cold Front
- **normalized_name**: `cold_front` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_cold_front`
- **wiki**: https://deadlock.wiki/Cold_Front

### Interpretation
+6% spirit resist; active (25s cd, 10m) ice blast: 95 (+0.47×Spirit Power) spirit damage and -60% move slow for 4s. Named anchor for `spirit_proc`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +6% | Passive |
| Spirit Damage | 95 base + 0.47×Spirit Power | Active, AoE |
| Move Speed | -60% | Conditional, 4s |
| Duration | 4s | — |
| End Radius | 10m | AoE |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_proc` | 95+ AoE + slow | high | 1.3 | adds | General spirit proc anchor |
| `movement_slow` | -60% AoE, 4s | 60 (eff. %, positive) | 2.0 | adds | Huge AoE slow |
| `spirit_damage` | 95 + 0.47×SP | 28 (eff. SP) | 1.8 | relies | 95/5 + 0.47×20 = 28 |
| `spirit_burst_damage` | 95+ on cast | 95 (dmg in 1s) | 2.0 | adds | Big sub-1s spirit hit |
| `aoe_cluster` | 10m radius | 70% | 1.4 | adds | Hits grouped enemies |
| `spirit_resistance` | +6% | 6 (eff. %) | 0.4 | adds | Token flat spirit resist |

---

## Compress Cooldown
- **normalized_name**: `compress_cooldown` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_compress_cooldown`
- **wiki**: https://deadlock.wiki/Compress_Cooldown

### Interpretation
+18% ability cooldown reduction, pure passive. Clean T2 `cooldown_reduction`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Cooldown Reduction | +18% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +18% | 18 (eff. %) | 1.4 | adds | Clean kit-wide CDR (add credit) |
| `ability_spam` | more casts | 100% | 2.0 | adds | More casts per fight |
| `multi_ability_focus` | kit-wide | 80% | 1.6 | adds | Lowers every cooldown |
| `ult_focused` | shortens ult | 40% | 0.8 | adds | Helps ult uptime too |

---

## Duration Extender
- **normalized_name**: `duration_extender` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_duration_extender`
- **wiki**: https://deadlock.wiki/Duration_Extender

### Interpretation
+22% ability duration, pure passive. Clean `duration_dependant` add-credit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +22% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `duration_dependant` | +22% | 22 (% duration, add) | 2.0 | adds | Clean duration up |
| `multi_ability_focus` | kit-wide | 70% | 1.4 | adds | Extends every timed ability |
| `self_buff` | enabler stat | 50% | 1.1 | adds | Generic enabler |

---

## Improved Spirit
- **normalized_name**: `improved_spirit` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_improved_spirit`
- **wiki**: https://deadlock.wiki/Improved_Spirit

### Interpretation
+18 Spirit Power, +1.5 OOC regen, pure passive. Named anchor for raw `spirit_damage` (Spirit Power).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +18 | Passive |
| Out of Combat Regen | +1.5/sec | OOC |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +18 SP | 18 (eff. SP) | 1.1 | adds | Clean flat Spirit Power |
| `self_buff` | broad spirit up | 80% | 1.8 | adds | Spirit stat-up |
| `scaling_early` | cheap caster spike | 50% | 1.0 | adds | Early spirit |

---

## Mystic Slow
- **normalized_name**: `mystic_slow` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_mystic_slow`
- **wiki**: https://deadlock.wiki/Mystic_Slow

### Interpretation
+50 HP, +0.75m sprint; spirit-triggered -30% move slow and -12% dash for 2s. Short spirit-applied slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Sprint Speed | +0.75m | Passive |
| Move Speed | -30% | Conditional, 2s |
| Dash Distance | -12% | Conditional, 2s |
| Duration | 2s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30%, 2s, spirit-applied | 24 (eff. %, positive) | 0.8 | adds | Reliable but short 2s window |
| `spirit_continuous_proc` | spirit-gated slow | index | 1.0 | adds | Re-applied with spirit damage |
| `high_max_hp` | +50 HP | 50 (flat HP) | 0.3 | adds | Token HP |
| `counter_importance` | anti-mobility | 50% | 1.0 | adds | For casters |
| `cooldown_reduction` | CDR component | 5 (eff. %) | 0.4 | adds | Listed minor CDR rider |

---

## Mystic Vulnerability
- **normalized_name**: `mystic_vulnerability` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_mystic_vulnerability`
- **wiki**: https://deadlock.wiki/Mystic_Vulnerability

### Interpretation
+8% spirit resist; on spirit hit -8% spirit resist (7s). Named anchor for `spirit_resist_shred`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +8% | Passive |
| Spirit Resist (debuff) | -8% | On spirit hit, 7s |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8% on spirit hit, 7s | 8 (eff. %, positive) | 1.2 | adds | Team-wide effect, high uptime |
| `spirit_resistance` | +8% | 8 (eff. %) | 0.5 | adds | Small flat spirit resist |
| `counter_importance` | cracks spirit-resist | 80% | 1.6 | adds | Vs spirit-tanky targets |
| `assist_importance` | opens target for team | 60% | 1.2 | adds | Team spirit benefits |
| `debuff` | low-priority | 30% | 0.8 | adds | Rarely cleansed |

---

## Quicksilver Reload
- **normalized_name**: `quicksilver_reload` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_quicksilver_reload`
- **wiki**: https://deadlock.wiki/Quicksilver_Reload

### Interpretation
Spirit proc 44 (+0.16×Spirit Power), +10% fire rate, instant 100% reload. Hybrid gun/spirit tempo.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage (proc) | 44 base + 0.16×Spirit Power | Proc |
| Fire Rate | +10% | Passive |
| Bullets Reloaded | 100% | Instant reload |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `magazine_size_dependant` | instant 100% reload | 40 (eff. ammo %) | 0.8 | adds | Instant full reload |
| `fire_rate` | +10% | 10 (eff. %) | 0.7 | adds | Solid fire rate rider |
| `spirit_damage` | 44 + 0.16×SP | 12 (eff. SP) | 0.8 | relies | 44/5 + 0.16×20 = 12 |
| `spirit_proc` | 44+ on reload | mid | 0.8 | adds | Spirit burst on reload |
| `hybrid_damage_usage` | reload tempo + spirit | 90% | 1.8 | adds | Couples gun + spirit |

---

## Slowing Hex
- **normalized_name**: `slowing_hex` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_slowing_hex`
- **wiki**: https://deadlock.wiki/Slowing_Hex

### Interpretation
+0.5m sprint; active (25m, 3.5s) -20% move slow and -30% dash. Named anchor for `movement_slow` (pick-setup).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +0.5m | Passive |
| Move Speed | -20% | Conditional, 3.5s |
| Dash Distance | -30% | Conditional, 3.5s |
| Cast Range | 25m | — |
| Duration | 3.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -20% + -30% dash, 3.5s | 40 (eff. %, positive) | 1.3 | adds | Dash-lock makes it a hard pick-setup slow |
| `counter_importance` | anti-mobility | 100% | 2.0 | adds | Catches slippery targets |
| `single_target` | targeted cast | 60% | 1.3 | adds | One-target |
| `engage` | locks target down | 60% | 1.2 | adds | Team collapses on it |
| `assist_importance` | sets up kills | 50% | 1.0 | adds | For allies |

---

## Spirit Sap
- **normalized_name**: `spirit_sap` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_spirit_sap`
- **wiki**: https://deadlock.wiki/Spirit_Sap

### Interpretation
+50 HP; active (40m, 12s) -9% spirit resist and -30 Spirit Power on target. Shreds resist + saps enemy spirit output.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Spirit Resist | -9% | Conditional, 12s |
| Spirit Power | -30 | Drains target's SP, 12s |
| Duration | 12s | — |
| Cast Range | 40m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -9% single-target, 12s | 9 (eff. %, positive) | 1.4 | adds | Lowers target spirit resist, long uptime |
| `spirit_resistance` | -30 SP on enemy | 30 (eff. SP denied) | 2.0 | adds | Saps enemy output → defensive spirit mitigation |
| `counter_importance` | counters spirit carry | 100% | 2.0 | adds | Direct counter |
| `single_target` | targeted debuff | 60% | 1.3 | adds | One-target |
| `high_max_hp` | +50 HP | 50 (flat HP) | 0.3 | adds | Token HP |

---

## Suppressor
- **normalized_name**: `suppressor` · **tier**: 2 (1600) · **category**: Spirit · **codename**: `upgrade_suppressor`
- **wiki**: https://deadlock.wiki/Suppressor

### Interpretation
+6 Spirit Power, +8% bullet resist; spirit-triggered -28% fire rate for 5s. `fire_rate_slow` tool. NOT `movement_slow`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +6 | Passive |
| Bullet Resist | +8% | Passive |
| Fire Rate | -28% | On spirit hit, 5s |
| Duration | 5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -28%, 5s | 28 (eff. %, positive) | 1.2 | adds | Strong fire-rate cut |
| `gun_continuous_resistance` | throttles enemy fire | 28% | 1.2 | adds | Fire-rate cut ≈ gun mitigation |
| `bullet_resistance` | +8% | 8 (eff. %) | 0.6 | adds | Small flat bullet resist |
| `counter_importance` | anti gun-DPS | 80% | 1.6 | adds | Vs gun threats |
| `spirit_damage` | +6 SP | 6 (eff. SP) | 0.4 | adds | Token SP |

---

# T3 (3200 souls)

## Alchemical Fire
- **normalized_name**: `alchemical_fire` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_alchemical_fire`
- **wiki**: https://deadlock.wiki/Alchemical_Fire

### Interpretation
+10 Spirit Power, and a thrown active (10m, 5s) that deals 45 (+0.2×SP) impact + a 95 (+0.4×SP) burning AoE DoT and reduces healing. A spirit AoE damage/zone tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +10 | Passive |
| Impact Damage | 45 base + 0.2×Spirit Power | Active |
| Burn DoT | 95 base + 0.4×Spirit Power | Over 5s |
| Healing Reduction (DoT) | -7 base + -0.055×Spirit Power | While burning |
| Radius | 10m | AoE |
| Duration | 5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_continuous_damage` | 95 burn over 5s | 95 (total spirit dmg) | 2.0 | adds | Sustained AoE spirit DoT |
| `spirit_damage` | impact + burn | 40 (eff. SP) | 1.7 | relies | (45+95)/5 + 0.6×20 ≈ 40 SP-equiv; scales with SP |
| `dot` | burn | 95 | 2.0 | adds | Status-effect burn |
| `aoe_cluster` | 10m | 80% | 1.6 | adds | Hits grouped enemies |
| `anti_heal` | burn cuts healing | 15 (eff. %) | 0.6 | adds | Small heal-reduction while burning |
| `spirit_damage` | +10 SP flat | 10 (eff. SP) | 0.4 | adds | Flat Spirit Power |
| `farmer` | AoE clears camps | 60% | 1.2 | adds | Zone damage farms |

---

## Ballistic Enchantment
- **normalized_name**: `ballistic_enchantment` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_ballistic_enchantment`
- **wiki**: https://deadlock.wiki/Ballistic_Enchantment

### Interpretation
Stacking weapon-damage on hit (up to +20%/stack), +22% ability range, plus minor non-hero damage. A sustained-fire weapon-damage ramp with a kit-wide range bonus.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage per Stack | +20% | Conditional — ramps on hit |
| Ability Range | +22% | Passive |
| Duration | 14s | Stack window |
| Non-Hero Weapon Damage | +5% | NPC |
| Non-Hero Stack Limit | 8 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | up to +20%/stack ramp | 24 (eff. avg %) | 0.8 | adds | Sustained-fire ramp — substantial effective weapon damage |
| `gun_continuous_damage` | stacks while firing | 24 | 0.7 | adds | Rewards staying on target |
| `range_extender_dependant` | +22% range | 22 (% range, add) | 1.0 | adds | Direct kit-wide range up |
| `gun_burst_damage` | back-loaded ramp | 6 | 0.1 | adds | Little early burst |
| `farmer` | +5% vs NPCs | 40% | 0.8 | adds | Minor NPC damage |
| `multi_ability_focus` | kit-wide range | 50% | 1.0 | adds | Range helps all abilities |

---

## Berserker
- **normalized_name**: `berserker` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_berserker`
- **wiki**: https://deadlock.wiki/Berserker

### Interpretation
+8% bullet resist, and +7% weapon damage per stack (max 10, gained per 120 damage taken). A damage-sponge weapon scaler — the more you eat, the harder you hit.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +8% | Passive |
| Weapon Damage per Stack | +7% | 120 damage taken to stack |
| Max Stacks | 10 | up to +70% |
| Duration | 10s | Stack window |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +7%/stack (max 70%) | 42 (eff. avg %, ~0.6×max) | 1.4 | adds | Big weapon damage when stacked in a brawl |
| `damage_sponge` | stacks from taking damage | 90% | 2.0 | adds | Value scales with damage taken |
| `gun_continuous_damage` | sustained brawl DPS | 35 | 1.0 | adds | Pays off in long fights |
| `bullet_resistance` | +8% | 8 (eff. %) | 0.4 | adds | Small flat bullet resist |
| `scaling_late` | snowballs in brawls | 60% | 1.7 | adds | Compounds in extended fights |

---

## Blood Tribute
- **normalized_name**: `blood_tribute` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_blood_tribute`
- **wiki**: https://deadlock.wiki/Blood_Tribute

### Interpretation
+8% debuff & spirit resist, +4 OOC regen; active drains 50 HP/s in exchange for +35% fire rate, +35% debuff resist, +2m move. A high-risk DPS active that costs your own HP.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +8% | Passive |
| Spirit Resist | +8% | Passive |
| Out of Combat Regen | +4/sec | OOC |
| Health Drain | 50/s | Active self-cost |
| Fire Rate | +35% | Active |
| Debuff Resist | +35% | Active |
| Move Speed | +2m | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +35% (active, self-cost) | 25 (eff. %) | 1.1 | adds | Big fire rate, discounted for the HP drain |
| `low_max_hp` | 50/s self-drain | 60% | 1.5 | adds | Effectiveness tied to spending your own HP |
| `cc_resist` | +35% debuff resist (active) | 25 (eff. %) | 0.6 | adds | Strong windowed CC resist |
| `debuff_resistance` | +8% + 35% | 20 (eff. %) | 0.4 | adds | Flat + active |
| `horizontal_mobility` | +2m (active) | 1.0 (m/s eff.) | 0.7 | adds | Move-speed burst |
| `spirit_resistance` | +8% | 8 (eff. %) | 0.4 | adds | Small flat spirit resist |

---

## Burst Fire
- **normalized_name**: `burst_fire` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_burst_fire`
- **wiki**: https://deadlock.wiki/Burst_Fire

### Interpretation
+50% slide distance, +10% fire rate; on trigger +32% fire rate and +1.25m move for 4.5s. A fire-rate tempo item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Slide Distance | +50% | Passive |
| Fire Rate | +10% | Passive |
| Fire Rate (active) | +32% | Conditional, 4.5s |
| Move Speed | +1.25m | Conditional, 4.5s |
| Duration | 4.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +10% + 32% (window) | 32 (eff. %) | 1.4 | adds | Strong combined fire rate |
| `gun_continuous_damage` | more shots/sec | 32 | 0.9 | adds | Sustained DPS |
| `gun_burst_damage` | ramp inside window | 18 | 0.4 | adds | Burst ramp |
| `horizontal_mobility` | +1.25m (active) | 0.6 (m/s eff.) | 0.4 | adds | Windowed move |
| `scaling_early` | tempo spike | 40% | 0.8 | adds | Early aggression |

---

## Cultist Sacrifice
- **normalized_name**: `cultist_sacrifice` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_cultist_sacrifice`
- **wiki**: https://deadlock.wiki/Cultist_Sacrifice

### Interpretation
+2 OOC regen, +30% weapon damage & bullet resist vs NPCs; active grants stacking weapon damage, HP, and ability range on NPC kills (160s). A heavy farming/snowball item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs NPCs | +30% | NPC |
| Bullet Resist vs NPCs | +30% | NPC |
| Out of Combat Regen | +2/sec | OOC |
| Weapon Damage (stack) | +10% ×0.8 | Conditional, on NPC kill |
| Bonus Health (stack) | +50 ×4 | Conditional |
| Ability Range (stack) | +12% | Conditional |
| Duration | 160s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | +30% dmg/resist vs NPCs + stacks | 90% | 1.8 | adds | Strong dedicated farm/snowball tool |
| `scaling_late` | NPC-kill stacks compound | 70% | 2.0 | adds | Builds power through farming |
| `bullet_damage` | +stacks (vs all once stacked) | 18 (eff. %) | 0.6 | adds | Stacked weapon damage |
| `high_max_hp` | +50×4 stacked | 120 (eff. HP) | 0.5 | adds | Stacked HP |
| `lane_pusher` | NPC damage | 60% | 1.5 | adds | Wave/jungle clear |

---

## Escalating Resilience
- **normalized_name**: `escalating_resilience` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_escalating_resilience`
- **wiki**: https://deadlock.wiki/Escalating_Resilience

### Interpretation
+35% max ammo, +75 HP, +18% weapon damage, plus stacking bullet resist (2%/stack to 30%) as you fire. A gun-bruiser hybrid that gets tankier the longer it shoots.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +35% | Passive |
| Bonus Health | +75 | Passive |
| Weapon Damage | +18% | Passive |
| Max Bullet Resist | 30% | Stacked |
| Bullet Resist per Stack | 2% | Per shot |
| Stack Duration | 24s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | up to +30% stacked | 20 (eff. avg %) | 1.1 | adds | Strong sustained bullet resist while firing |
| `bullet_damage` | +18% | 18 | 0.6 | adds | Solid flat weapon damage |
| `magazine_size_dependant` | +35% ammo | 35 (eff. ammo %) | 0.5 | adds | Good ammo |
| `gun_continuous_resistance` | resist ramps as you fire | 20 | 0.6 | adds | Sustained mitigation |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.3 | adds | HP rider |
| `damage_sponge` | tankier in fights | 50% | 1.1 | adds | Rewards staying in |

---

## Express Shot
- **normalized_name**: `express_shot` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_express_shot`
- **wiki**: https://deadlock.wiki/Express_Shot

### Interpretation
+60% velocity, +8% weapon damage, and a big bonus on the next shot after an ability cast (+125%×2 weapon damage). Named anchor for `gun_burst_proc` — converts ability casts into a gun burst.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% (passive) +100% (proc) | Passive + proc |
| Weapon Damage | +8% | Passive |
| Next-Shot Weapon Damage | +125% ×2 | Conditional — after ability cast |
| Secondary Fire | +40% ×1.3 | Conditional |
| Extra Ammo Consumed | 2 | Proc cost |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_burst_proc` | proc on first shot after cast | 1.5 (burst index) | 2.0 | adds | Single-shot trigger, big payout; named anchor |
| `gun_burst_damage` | +125%×2 next shot | 60 | 1.2 | adds | Huge single-shot spike |
| `bullet_damage` | +8% + proc | 20 (eff. avg %) | 0.7 | adds | Flat + amortized proc |
| `ability_spam` | proc resets on cast | 70% | 1.4 | adds | Rewards weaving casts and shots |
| `long_range` | +60% velocity | 40% | 0.8 | adds | Velocity lands ranged shots |
| `hybrid_damage_usage` | ability→gun combo | 70% | 1.4 | adds | Couples casting with gun burst |

---

## Headhunter
- **normalized_name**: `headhunter` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_headhunter`
- **wiki**: https://deadlock.wiki/Headhunter

### Interpretation
+5% weapon damage, +50 HP, and +75 (×4 stacks) bonus headshot damage with a 4% heal + move speed on headshot. A T3 headshot scaler with sustain.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +5% | Passive |
| Bonus Health | +50 | Passive |
| Head Shot Bonus Damage | +75 ×4 | Stacking |
| Heal Per Headshot | 4% | On headshot |
| Move Speed | +1.75m | 3s after headshot |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `headshot_damage` | +75 ×4 stacks | 75 (flat headshot dmg) | 0.8 | adds | Strong stacking headshot scaler |
| `headshot_damage` | requires heads | 80% | 0.9 | relies | Heavy aim dependence |
| `gun_burst_damage` | headshot spikes | 40 | 0.8 | adds | Per-head spike |
| `self_heal` | 4%/headshot | 60% | 0.2 | adds | Sustain on landing heads |
| `single_target` | per-target heads | 80% | 1.8 | adds | No AoE |
| `horizontal_mobility` | +1.75m on head | 0.7 (m/s eff.) | 0.5 | adds | Speed on headshot |
| `high_kill_count` | execute-y headshots | 50% | 1.4 | adds | Kill pressure |

---

## Heroic Aura
- **normalized_name**: `heroic_aura` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_heroic_aura`
- **wiki**: https://deadlock.wiki/Heroic_Aura

### Interpretation
+1.5m sprint, a passive 35m aura granting +17% bullet resist, and an active (7s) giving the team +2.25m move and +26% fire rate. Named anchor for `ally_buff`/`lane_pusher`/`high_assist_count`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +1.5m | Passive |
| Bullet Resist (aura) | +17% | 35m radius |
| Move Speed (active) | +2.25m | 7s, team |
| Fire Rate (active) | +26% | 7s, team |
| Active Radius | 35m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ally_buff` | aura + team active | 90% | 2.0 | adds | Value flows to the whole team |
| `high_assist_count` | team fight buff | 80% | 2.0 | adds | Drives kill participation |
| `fire_rate` | +26% (team, active) | 18 (eff. %, self share) | 0.8 | adds | Self-share of the team fire-rate buff |
| `bullet_resistance` | +17% aura | 17 (eff. %) | 0.9 | adds | Team-wide bullet resist (self portion) |
| `lane_pusher` | team push tool | 70% | 1.8 | adds | Group push enabler |
| `close_to_team` | aura needs allies | 80% | 2.0 | adds | Value requires nearby allies |
| `horizontal_mobility` | +2.25m (active) | 1.0 (m/s eff.) | 0.7 | adds | Team speed buff |

---

## Hollow Point
- **normalized_name**: `hollow_point` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_hollow_point`
- **wiki**: https://deadlock.wiki/Hollow_Point

### Interpretation
+4.5 OOC regen, +125 HP, and a conditional +35% weapon damage with -9% bullet resist on the target (8s). Damage amp with a bullet-shred rider.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4.5/sec | OOC |
| Bonus Health | +125 | Passive |
| Weapon Damage | +35% | Conditional |
| Bullet Resist | -9% | Conditional, 8s |
| Debuff Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +35% (conditional) | 28 (eff. %) | 0.9 | adds | Strong conditional weapon damage |
| `bullet_resist_shred` | -9% on target, 8s | 9 (eff. %, positive) | 0.9 | adds | Shred on the same hit, written positive |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.5 | adds | Good HP |
| `gun_continuous_damage` | sustained | 22 | 0.7 | adds | Propagation |
| `gun_burst_damage` | per-shot | 14 | 0.3 | adds | Propagation |

---

## Hunters Aura
- **normalized_name**: `hunters_aura` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_hunters_aura`
- **wiki**: https://deadlock.wiki/Hunter's_Aura

### Interpretation
+100 HP, +0.75m sprint, and a 15m aura that applies -10% bullet resist and -15% fire rate to nearby enemies. An AoE debuff aura — both bullet-shred and fire-rate-slow. (fire_rate_slow, NOT movement_slow.)

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Sprint Speed | +0.75m | Passive |
| Bullet Resist (enemy) | -10% | 15m aura |
| Fire Rate (enemy) | -15% | 15m aura |
| Radius | 15m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -15% aura, multi-target | 22 (eff. %, AoE-boosted, positive) | 0.6 | adds | AoE multiplies effective value |
| `bullet_resist_shred` | -10% aura, multi-target | 10 (eff. %, positive) | 1.0 | adds | Team-wide bullet shred aura |
| `aoe_cluster` | 15m aura | 70% | 1.4 | adds | Affects multiple enemies |
| `counter_importance` | anti gun-DPS | 80% | 1.6 | adds | Shuts down enemy gun output |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.4 | adds | Good HP for an aura carrier |
| `close_to_team` | brawl aura | 50% | 1.2 | adds | Best in grouped fights |

---

## Point Blank
- **normalized_name**: `point_blank` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_point_blank`
- **wiki**: https://deadlock.wiki/Point_Blank

### Interpretation
+75 HP, +30% melee resist, +50% weapon damage at close range, with a -25% move slow applied to targets (2s) within 15m. Named anchor for `close_range`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Melee Resist | +30% | Passive |
| Weapon Damage | +50% | Close range |
| Move Speed (enemy) | -25% | Conditional, 2s |
| Close Range | 15m | Gate |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `close_range` | +50% dmg close | 100% | 2.0 | adds | The defining close-range damage amp |
| `bullet_damage` | +50% (close) | 40 (50×0.8 uptime) | 1.3 | adds | Huge close-range weapon damage |
| `bullet_damage` | close-built value | 30 | 1.0 | relies | Pays off built for close |
| `melee_resistance` | +30% | 30 (eff. %) | 0.8 | adds | Strong melee defense |
| `melee_damage` | close gun amp | 25 | 0.4 | adds | Close amp counts toward melee |
| `movement_slow` | -25% on hit, 2s | 20 (eff. %, positive) | 0.4 | adds | Sticks targets in your range |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.3 | adds | HP rider |
| `engage` | must be close | 70% | 1.4 | adds | Forces close commitment |

---

## Sharpshooter
- **normalized_name**: `sharpshooter` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_sharpshooter`
- **wiki**: https://deadlock.wiki/Sharpshooter

### Interpretation
A loaded long-range package: +20% falloff range, +25% zoom, +60% velocity, +10% weapon damage, +1m sprint (−0.7m base move), and +60% weapon damage beyond 15m. The cross-tier ceiling for `long_range`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Fall-off Range | +20% | Passive |
| Weapon Zoom | +25% | Passive |
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +10% | Passive |
| Sprint Speed | +1m | Passive |
| Move Speed | -0.7m | Downside |
| Weapon Damage (ranged) | +60% | Beyond 15m |
| Min. Distance | 15m | Gate |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `long_range` | +60% dmg + zoom/velocity/range | 100% | 2.0 | adds | Cross-tier ceiling for the 20m+ band |
| `bullet_damage` | +10% + 60% ranged | 48 (eff. %, ×0.8 uptime) | 1.6 | adds | Massive ranged weapon damage |
| `bullet_damage` | ranged-built | 60 | 2.0 | relies | Only at range |
| `gun_burst_damage` | per-shot | 24 | 0.5 | adds | Propagation |
| `gun_continuous_damage` | per-shot | 14 | 0.4 | adds | Propagation |
| `single_target` | precision shots | 70% | 1.6 | adds | Picker tool |
| `aerial` | preserves air-shots | 50% | 1.1 | adds | Air sniping |
| `close_range` | -0.7m move, ranged-only | -20% | -0.4 | adds | Anti-synergy with close play |

---

## Spirit Rend
- **normalized_name**: `spirit_rend` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_spirit_rend`
- **wiki**: https://deadlock.wiki/Spirit_Rend

### Interpretation
+75 HP, and headshots/spirit hits apply -8% (up to 4 stacks) spirit resist plus grant +10% spirit lifesteal (8s). A stacking spirit-resist shred that opens targets for the team. Named `assist_importance`/`spirit_resist_shred` reference.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Spirit Resist (debuff) | -8% | Conditional, 8s |
| Spirit Lifesteal | +10% | Conditional |
| Spirit Resist on Headshot | -7% | Conditional |
| Debuff Duration | 8s | — |
| Max Stacks | 4 | up to -32% |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -8%/stack (max -32%) | 20 (eff. %, ~0.6×max, positive) | 2.0 | adds | Big team-wide spirit shred when stacked |
| `spirit_lifesteal` | +10% (8s) | 7 (eff. %) | 0.2 | adds | Spirit sustain while debuff up |
| `assist_importance` | opens target for team | 80% | 1.6 | adds | Team's spirit output benefits (Spirit Rend = the assist/amp anchor) |
| `counter_importance` | cracks spirit-resist | 70% | 1.4 | adds | Vs spirit-tanky targets |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.3 | adds | HP rider |

---

## Tesla Bullets
- **normalized_name**: `tesla_bullets` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_tesla_bullets`
- **wiki**: https://deadlock.wiki/Tesla_Bullets

### Interpretation
Bullets have a 15% chance to chain 33 (+0.19×SP) spirit lightning to up to 4 nearby targets (8m). A bullet-triggered AoE spirit proc — strong wave clear and group damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage (chain) | 33 base + 0.19×Spirit Power | On proc |
| Proc Chance | 15% | Per bullet |
| Max Jumps | 4 | — |
| Jump Radius | 8m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | chains to 4 targets | 90% | 1.8 | adds | Strong multi-target chain |
| `bullet_proc` | 15% per bullet | high | 1.3 | adds | Bullet-triggered spirit chain |
| `spirit_damage` | 33 + 0.19×SP chain | 11 (eff. SP) | 0.5 | relies | 33/5 + 0.19×20 = 11; scales with SP |
| `farmer` | chains clear waves | 90% | 1.8 | adds | Excellent wave/jungle clear |
| `lane_pusher` | wave clear | 80% | 2.0 | adds | Solo push |
| `spirit_continuous_damage` | sustained chains | 33 | 0.7 | adds | Per-proc spirit damage over a fight |
| `gun_continuous_proc` | per-bullet chance | index | 1.0 | adds | Rewards sustained fire |

---

## Toxic Bullets
- **normalized_name**: `toxic_bullets` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_toxic_bullets`
- **wiki**: https://deadlock.wiki/Toxic_Bullets

### Interpretation
Bullets build up a bleed DoT (1.7 +0.005×SP per tick) and apply -35% healing reduction (4s) once buildup completes. Named anchor for `bullet_proc`/`dot`/`anti_heal` (heal-shred). Buildup is faster the higher your fire rate.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bleed DoT | 1.7 base + 0.005×Spirit Power | Per tick after buildup |
| Healing Reduction | -35% | Conditional, 4s |
| Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -35% on full buildup | 35 (eff. %, positive) | 1.3 | adds | Strong heal-shred (named counter anchor) |
| `bullet_proc` | buildup bleed | high | 1.3 | adds | Named bullet_proc anchor |
| `dot` | bleed | 40 (eff. total) | 0.8 | adds | Sustained bleed damage |
| `counter_importance` | anti-sustain | 100% | 2.0 | adds | Bought vs healing comps |
| `gun_continuous_proc` | buildup, fire-rate gated | index | 1.0 | adds | Faster fire = faster proc |
| `fire_rate` | rewards high fire rate | 40% | 1.8 | relies | Buildup scales with fire rate |
| `spirit_damage` | 1.7+0.005×SP bleed | 3 (eff. SP) | 0.1 | relies | Tiny SP scaling |

---

## Weighted Shots
- **normalized_name**: `weighted_shots` · **tier**: 3 (3200) · **category**: Weapon · **codename**: `upgrade_weighted_shots`
- **wiki**: https://deadlock.wiki/Weighted_Shots

### Interpretation
+40% weapon damage, +22% debuff resist, with a self penalty (-14% stamina recovery, -0.5m move) and a -30% move slow applied to hit targets (3.5s). A heavy gun-damage item with a built-in slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +40% | Passive |
| Debuff Resist | +22% | Passive |
| Stamina Recovery | -14% | Downside |
| Move Speed | -0.5m | Downside |
| Move Speed (enemy) | -30% | On hit, 3.5s |
| Dash Distance (enemy) | -22% | Conditional |
| Slow Duration | 3.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +40% | 40 | 1.3 | adds | Big flat weapon damage |
| `movement_slow` | -30% on hit, 3.5s | 30 (eff. %, positive) | 0.7 | adds | High-uptime gun-applied slow |
| `debuff_resistance` | +22% | 22 (eff. %) | 0.5 | adds | Solid debuff resist |
| `gun_continuous_damage` | sustained | 24 | 0.7 | adds | Propagation |
| `gun_burst_damage` | per-shot | 20 | 0.4 | adds | Propagation |
| `counter_importance` | anti-mobility | 60% | 1.2 | adds | Catches mobile targets |
| `horizontal_mobility` | -0.5m self | -0.25 | -0.2 | adds | Small self move penalty |

---

## Bullet Resilience
- **normalized_name**: `bullet_resilience` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_bullet_resilience`
- **wiki**: https://deadlock.wiki/Bullet_Resilience

### Interpretation
+30% bullet resist, +3 OOC regen, and a conditional +15% bullet resist. The cross-tier ceiling for flat `bullet_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +30% | Passive |
| Out of Combat Regen | +3/sec | OOC |
| Bullet Resist (conditional) | +15% | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resistance` | +30% (+15% cond) | 38 (eff. %) | 2.0 | adds | Highest flat bullet resist in the set |
| `gun_continuous_resistance` | sustained | 38 | 1.1 | adds | Bread-and-butter sustained mitigation |
| `gun_burst_resistance` | flat resist | 12 (eff. %, ~0.3×) | 0.2 | adds | Partial burst credit |
| `damage_sponge` | tank vs guns | 60% | 1.3 | adds | Eats gunfire |
| `counter_importance` | anti-gun | 70% | 1.4 | adds | Vs gun comps |

---

## Counterspell
- **normalized_name**: `counterspell` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_counterspell`
- **wiki**: https://deadlock.wiki/Counterspell

### Interpretation
+50 HP, +5 Spirit Power, and a 0.8s spell-parry window that, on a successful parry, heals 150, grants +20 SP and +1.75m move (6s). Named anchor for `spirit_burst_resistance` — a reactive anti-spirit counter.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Spirit Power | +5 | Passive |
| Healing (on parry) | 150 | Conditional |
| Spirit Power (on parry) | +20 | Conditional, 6s |
| Move Speed (on parry) | +1.75m | Conditional, 6s |
| Spell Parry Duration | 0.8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_resistance` | spell parry | 90% | 1.7 | adds | Negates a spirit burst on a timed parry |
| `counter_importance` | anti-spirit reaction | 100% | 2.0 | adds | Pure counter tool |
| `burst_heal` | 150 on parry | 150 (HP in 1s) | 0.5 | adds | Burst heal payoff |
| `spirit_damage` | +5 + 20 on parry | 12 (eff. SP) | 0.5 | adds | Flat + parry SP |
| `cc_resist` | parry negates spell | 50% | 1.1 | adds | Avoids the parried effect |
| `horizontal_mobility` | +1.75m on parry | 0.7 (m/s eff.) | 0.5 | adds | Speed payoff |

---

## Dispel Magic
- **normalized_name**: `dispel_magic` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_dispel_magic`
- **wiki**: https://deadlock.wiki/Dispel_Magic

### Interpretation
+10% spirit resist; active heals 250, cleanses debuffs, and grants +2m move (3s). A cleanse + heal counter to CC/DoT.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| HP Healed On Activate | 250 | Active |
| Move Speed | +2m | Active, 3s |
| Buff Duration | 3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cc_resist` | cleanse on activate | 90% | 2.0 | adds | Full removal of active debuffs (modulo cd) |
| `debuff_resistance` | cleanse | 90% | 2.0 | adds | Clears stuns/slows |
| `counter_importance` | anti-CC/DoT | 100% | 2.0 | adds | Pure reaction tool |
| `burst_heal` | 250 | 250 (HP in 1s) | 0.8 | adds | Heal on activate |
| `self_heal` | 250 | 250 (total HP) | 0.7 | adds | Self-restore |
| `horizontal_mobility` | +2m (active) | 1.0 (m/s eff.) | 0.7 | adds | Escape speed |

---

## Fortitude
- **normalized_name**: `fortitude` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_fortitude`
- **wiki**: https://deadlock.wiki/Fortitude

### Interpretation
+375 HP, +2% max-health regen, +1.5m move when not recently damaged. Named cross-tier anchor for `high_max_hp`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +375 | Passive |
| Restore Delay | +10s | — |
| Max Health Regen | +2% | Passive |
| Move Speed | +1.5m | When not recently damaged |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | +375 HP | 375 (flat HP) | 1.6 | adds | Cross-tier ceiling for raw HP |
| `damage_sponge` | huge HP pool | 70% | 1.6 | adds | Core damage soak |
| `continous_heal` | +2% max HP regen | ~7 (HP/s eff.) | 0.3 | adds | Scales with the big pool |
| `large_hitbox` | HP-stacking tank | 40% | 0.9 | adds | Synergy with big-body tanks |
| `horizontal_mobility` | +1.5m (OOC) | 0.5 (m/s eff.) | 0.3 | adds | Move when not hit recently |
| `scaling_late` | big HP late | 50% | 1.4 | adds | Tank scaling |

---

## Fury Trance
- **normalized_name**: `fury_trance` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_fury_trance`
- **wiki**: https://deadlock.wiki/Fury_Trance

### Interpretation
+14% bullet lifesteal, +100 HP, +6% weapon damage, plus an active (6.5s): +32% fire rate and +40% spirit resist. A gun-bruiser sustain/tempo item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +14% | Passive |
| Bonus Health | +100 | Passive |
| Weapon Damage | +6% | Passive |
| Fire Rate | +32% | Active, 6.5s |
| Spirit Resist | +40% | Active, 6.5s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +14% | 14 (eff. %) | 1.2 | adds | Strong passive gun lifesteal |
| `fire_rate` | +32% (active) | 22 (eff. %) | 1.0 | adds | Big windowed fire rate |
| `spirit_resistance` | +40% (active) | 28 (eff. %) | 1.2 | adds | Strong windowed spirit resist |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.4 | adds | HP rider |
| `self_heal` | lifesteal | 30% | 0.1 | adds | Sustain via lifesteal |
| `bullet_damage` | +6% | 6 | 0.2 | adds | Small weapon damage |
| `damage_sponge` | sustain in fights | 50% | 1.1 | adds | Rewards staying in |

---

## Healing Nova
- **normalized_name**: `healing_nova` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_healing_nova`
- **wiki**: https://deadlock.wiki/Healing_Nova

### Interpretation
+5% range, +8 SP; active AoE (18m) heals 325 over 2s to self and allies. Named anchor for `burst_heal` + a team heal.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +5% | Passive |
| Spirit Power | +8 | Passive |
| Total HP Regen | 325 | Over 2s, AoE |
| Regen Duration | 2s | — |
| Aura Radius | 18m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `burst_heal` | 325 over 2s, AoE | 325 (HP in ~1s) | 1.1 | adds | Big fast AoE heal (named anchor) |
| `team_heal` | 325 to allies | 325 (to allies) | 1.6 | adds | Heals the whole team in radius |
| `self_heal` | 325 to self | 325 (total HP) | 1.0 | adds | Self-heals too |
| `assist_importance` | team sustain | 70% | 1.4 | adds | Mostly ally-facing |
| `close_to_team` | 18m aura | 60% | 1.5 | adds | Best near allies |
| `spirit_damage` | +8 SP | 8 (eff. SP) | 0.3 | adds | Token SP |

---

## Lifestrike
- **normalized_name**: `lifestrike` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_lifestrike`
- **wiki**: https://deadlock.wiki/Lifestrike

### Interpretation
+16% melee damage, +125 HP, with a 100 HP + 30% melee-hit heal and a -60% move slow on melee hit (2.5s). Named anchor for `melee_damage` (melee lifesteal). Heavy melee sustain + slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +16% | Passive |
| Bonus Health | +125 | Passive |
| Move Speed (enemy) | -60% | On melee hit, 2.5s |
| Heal on Melee Hit | 100 | + 30% of melee hit |
| Slow Duration | 2.5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +16% + heal | 16 (eff. %) + heal | 0.2 | adds | Strong melee amp; named lifesteal-melee anchor |
| `self_heal` | 100 + 30% on melee | ~250 (eff. HP/fight) | 0.7 | adds | Heavy melee sustain |
| `movement_slow` | -60% on melee, 2.5s | 50 (eff. %, positive) | 1.1 | adds | Hard slow keeps targets in melee |
| `melee_damage` | melee-committed | 70% | 1.0 | relies | Pays off on melee heroes |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.5 | adds | Good HP |
| `engage` | dive + slow + heal | 60% | 1.2 | adds | Sticky melee engage |
| `low_max_hp` | sustain enables low play | 30% | 0.8 | adds | Lifesteal supports aggressive low HP |

---

## Majestic Leap
- **normalized_name**: `majestic_leap` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_majestic_leap`
- **wiki**: https://deadlock.wiki/Majestic_Leap

### Interpretation
Active: a huge leap with +50% air control, and a 200 (×12 = up to 2400) barrier while airborne. Named anchor for `vertical_mobility`/`aerial` — a mobility + escape/engage leap.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier | 200 ×12 | Conditional (airborne) |
| Interrupt Cooldown | 5s | — |
| Barrier Duration | 8s | — |
| Air Control | +50% | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | big leap | 2.0 (leap distance) | 0.1 | adds | Cross-tier vertical traverse tool |
| `aerial` | +50% air control | 90% | 2.0 | adds | Built around airborne play |
| `escape` | leap away | 80% | 1.6 | adds | Strong disengage |
| `engage` | leap in | 70% | 1.4 | adds | Dive tool |
| `shield` | 200×12 airborne | 600 (eff. shield HP) | 0.9 | adds | Conditional airborne barrier |
| `anti_air` | — | 0 | 0.0 | adds | (self mobility, not anti-air) |

---

## Metal Skin
- **normalized_name**: `metal_skin` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_metal_skin`
- **wiki**: https://deadlock.wiki/Metal_Skin

### Interpretation
+12% bullet resist; active (5s) makes you nearly immune to bullet damage (with a small move/dash penalty). Named anchor for `bullet_evasion`/`gun_burst_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +12% | Passive |
| Active Move Penalty | -1.5m | Active |
| Dash Distance | -20% | Active |
| Duration | 5s | Bullet-immunity window |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | near-immunity 5s | 90% | 2.0 | adds | True bullet-immunity window (named anchor) |
| `gun_burst_resistance` | absorbs gun burst | 90% | 1.7 | adds | Negates a gun burst window |
| `gun_continuous_resistance` | 5s windowed | 70% | 1.9 | adds | Strong while active |
| `bullet_resistance` | +12% flat | 12 (eff. %) | 0.6 | adds | Small passive resist |
| `counter_importance` | anti gun-burst | 100% | 2.0 | adds | Reaction vs gun deletes |

---

## Rescue Beam
- **normalized_name**: `rescue_beam` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_rescue_beam`
- **wiki**: https://deadlock.wiki/Rescue_Beam

### Interpretation
+0.75m sprint, +6% range; active channel (35m) heals 20% of an ally (or self) and pulls them to safety. Named anchor for `team_heal`/`assist_importance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +0.75m | Passive |
| Ability Range | +6% | Passive |
| Heal Amount | 20% | Of target max HP |
| Channel Duration | 2.5s | — |
| Cast Range | 35m | Ally-targetable |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `team_heal` | 20% ally HP + pull | 90% | 0.5 | adds | Named team_heal anchor; big ally peel |
| `assist_importance` | ally rescue | 100% | 2.0 | adds | Pure support tool |
| `self_heal` | 20% self | 60% | 0.2 | adds | Can heal self too |
| `close_to_team` | rescues allies | 70% | 1.8 | adds | Value requires allies |
| `escape` | pulls to safety | 60% | 1.2 | adds | Disengage for the target |
| `ally_buff` | — | 50% | 1.1 | adds | Ally-facing utility |

---

## Spirit Resilience
- **normalized_name**: `spirit_resilience` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_spirit_resilience`
- **wiki**: https://deadlock.wiki/Spirit_Resilience

### Interpretation
+30% spirit resist, +3 OOC regen, and a conditional +15% spirit resist. The cross-tier ceiling for flat `spirit_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +30% | Passive |
| Out of Combat Regen | +3/sec | OOC |
| Spirit Resist (conditional) | +15% | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +30% (+15% cond) | 38 (eff. %) | 1.7 | adds | Highest flat spirit resist in the set |
| `spirit_continuous_resistance` | sustained | 38 | 2.0 | adds | Bread-and-butter spirit mitigation |
| `spirit_burst_resistance` | flat resist | 12 (eff. %, ~0.3×) | 0.2 | adds | Partial burst credit |
| `damage_sponge` | tank vs spirit | 60% | 1.3 | adds | Eats spirit damage |
| `counter_importance` | anti-spirit | 70% | 1.4 | adds | Vs spirit comps |

---

## Stamina Mastery
- **normalized_name**: `stamina_mastery` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_stamina_mastery`
- **wiki**: https://deadlock.wiki/Stamina_Mastery

### Interpretation
+2 stamina, +18% stamina recovery, +23% air-jump/dash distance. A pure mobility item — the cross-tier `vertical_mobility` stat ceiling.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +2 | Passive |
| Stamina Recovery | +18% | Passive |
| Air Jump/Dash Distance | +23% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +2 stamina + 23% air dist | 2.3 (stamina+air) | 0.2 | adds | Cross-tier vertical-mobility stat ceiling |
| `horizontal_mobility` | +1 stamina eq. | 1.0 (stamina) | 0.7 | adds | Half of +2 charges toward horizontal |
| `aerial` | +23% air dist | 80% | 1.8 | adds | Built for air play |
| `escape` | multiple dashes | 70% | 1.4 | adds | Panic mobility |
| `engage` | dash in | 50% | 1.0 | adds | Commit tool |

---

## Trophy Collector
- **normalized_name**: `trophy_collector` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_trophy_collector`
- **wiki**: https://deadlock.wiki/Trophy_Collector

### Interpretation
-15% weapon damage vs NPCs, +2m sprint, +2 OOC regen; stacks souls/min and small sprint/range per stack (16 max). An economy/scaling item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage vs NPCs | -15% | Downside |
| Sprint Speed | +2m | Passive |
| Out of Combat Regen | +2/sec | OOC |
| Sprint Speed per Stack | +0.15m | Stacking |
| Ability Range per Stack | +0.75% | Stacking |
| Souls per Minute | 18 | — |
| Max Stacks | 16 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `farmer` | 18 souls/min + stacks | 50% | 1.0 | adds | Economy/scaling (penalizes NPC damage though) |
| `scaling_late` | stacks compound | 70% | 2.0 | adds | Builds power over the game |
| `horizontal_mobility` | +2m sprint + stacks | 1.2 (m/s eff.) | 0.8 | adds | Strong sprint base + stacks |
| `range_extender_dependant` | +0.75%/stack | 12 (% range, stacked) | 0.5 | adds | Stacked range up |
| `bullet_damage` | -15% vs NPCs | -8 | -0.3 | adds | NPC-damage downside |

---

## Veil Walker
- **normalized_name**: `veil_walker` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_veil_walker`
- **wiki**: https://deadlock.wiki/Veil_Walker

### Interpretation
+2m sprint, +2 OOC regen, +125 HP, +10 SP, and an invisibility (8s) granting +3.5m move while invis and an 85 burst heal on entering. A flank/repositioning + sustain item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Sprint Speed | +2m | Passive |
| Out of Combat Regen | +2/sec | OOC |
| Bonus Health | +125 | Passive |
| Spirit Power | +10 | Passive |
| Invis Move Speed | +3.5m | While invisible |
| Heal | 85 | On entering invis |
| Invisibility Duration | 8s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `away_from_team` | flank/repositioning | 80% | 1.8 | adds | Invis is a flank/solo tool |
| `escape` | invis disengage | 80% | 1.6 | adds | Strong escape |
| `engage` | invis approach | 60% | 1.2 | adds | Flank engage |
| `horizontal_mobility` | +2m + 3.5m invis | 1.5 (m/s eff.) | 1.0 | adds | Strong move speed |
| `burst_heal` | 85 on enter | 85 (HP in 1s) | 0.3 | adds | Burst heal (not continuous) |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.5 | adds | Good HP |
| `spirit_damage` | +10 SP | 10 (eff. SP) | 0.4 | adds | Flat SP |

---

## Warp Stone
- **normalized_name**: `warp_stone` · **tier**: 3 (3200) · **category**: Vitality · **codename**: `upgrade_warp_stone`
- **wiki**: https://deadlock.wiki/Warp_Stone

### Interpretation
Active: instant 11m teleport + 30% bullet resist (6s). Named anchor for `escape` — a clean blink with no post-slow penalty.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Teleport Range | 11m | Active |
| Bullet Resist | +30% | Conditional, 6s |
| Buff Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `escape` | clean 11m blink | 100% | 2.0 | adds | Named anchor; no post-slow penalty |
| `engage` | blink in | 70% | 1.4 | adds | Also a gap-closer |
| `horizontal_mobility` | instant 11m | 2.0 (m/s eff.) | 1.3 | adds | Large instant reposition |
| `bullet_resistance` | +30% (6s) | 20 (eff. %) | 1.1 | adds | Windowed bullet resist on warp |
| `vertical_mobility` | blink clears gaps | 0.8 (traverse) | 0.1 | adds | Can blink up/over |
| `counter_importance` | anti-burst reposition | 60% | 1.2 | adds | Escapes focus windows |

---

## Decay
- **normalized_name**: `decay` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_decay`
- **wiki**: https://deadlock.wiki/Decay

### Interpretation
+8 SP, +65 HP; active applies a bleeding %max-HP DoT (2.6 +0.004×SP per tick) plus 20 (+0.1×SP) and -50% healing reduction (10s). Named anchor for `pure_damage`/`anti_heal`/`spirit_continuous_damage`/`dot`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +8 | Passive |
| Bonus Health | +65 | Passive |
| %HP DoT | 2.6 base + 0.004×Spirit Power | Per tick |
| Healing Reduction | -50% | Conditional, 10s |
| Bonus Damage | 20 base + 0.1×Spirit Power | — |
| Duration | 10s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | %max-HP bleed | 90% | 2.0 | adds | %max-HP DoT is signature anti-tank (named anchor) |
| `anti_heal` | -50% heal, 10s | 50 (eff. %, positive) | 1.9 | adds | Strong heal cripple |
| `spirit_continuous_damage` | %HP DoT over 10s | 60 (eff. total) | 1.3 | adds | Sustained spirit DoT |
| `dot` | bleed | 60 | 1.3 | adds | Status-effect DoT |
| `debuff` | high-priority | 80% | 2.0 | adds | Worth cleansing (named high-priority debuff) |
| `counter_importance` | anti-tank + anti-heal | 90% | 1.8 | adds | Counter tool |
| `spirit_damage` | 20 + scaling | 14 (eff. SP) | 0.6 | relies | DoT + bonus, scales with SP |

---

## Disarming Hex
- **normalized_name**: `disarming_hex` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_disarming_hex`
- **wiki**: https://deadlock.wiki/Disarming_Hex

### Interpretation
+75 HP, +0.75m sprint; active (32m, 4.25s) disarms the target (can't fire) and applies -13% bullet resist. Named anchor for `disarm`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Sprint Speed | +0.75m | Passive |
| Disarm | yes | 4.25s |
| Bullet Resist | -13% | Conditional |
| Cast Range | 32m | — |
| Duration | 4.25s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `disarm` | 4.25s disarm | 4.25 (disarm dur) | 0.2 | adds | Named disarm anchor; turns off a gun hero |
| `bullet_resistance` | disarm pseudo-credit | 30 (eff. %, 0.4× disarm) | 1.6 | adds | Disarm ≈ bullet mitigation per `tag_descriptions.md` |
| `bullet_resist_shred` | -13% on target | 13 (eff. %, positive) | 1.3 | adds | Shred on the same target |
| `counter_importance` | anti gun-DPS | 100% | 2.0 | adds | Shuts down a gun carry |
| `single_target` | targeted | 60% | 1.3 | adds | One target |

---

## Greater Expansion
- **normalized_name**: `greater_expansion` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_greater_expansion`
- **wiki**: https://deadlock.wiki/Greater_Expansion

### Interpretation
+10% spirit resist and +30% ability range. The cross-tier ceiling for `range_extender_dependant`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Ability Range | +30% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `range_extender_dependant` | +30% range | 30 (% range, add) | 1.3 | adds | Highest clean range up in the set |
| `multi_ability_focus` | kit-wide | 90% | 1.8 | adds | Extends every ability's reach |
| `long_range` | more poke | 50% | 1.0 | adds | Extends ranged casters |
| `spirit_resistance` | +10% | 10 (eff. %) | 0.4 | adds | Small flat spirit resist |
| `self_buff` | enabler | 60% | 1.3 | adds | Self utility |

---

## Knockdown
- **normalized_name**: `knockdown` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_knockdown`
- **wiki**: https://deadlock.wiki/Knockdown

### Interpretation
+75 HP, +5% range; active (45m) stuns the target and drops airborne enemies. Named anchor for `stun`/`anti_air`/`interrupt`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +75 | Passive |
| Ability Range | +5% | Passive |
| Stun | yes | 0.5s |
| Stun Duration | 0.5s | — |
| Cast Range | 45m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `stun` | 0.5s long-range stun | 0.5 (stun sec) | 1.5 | adds | Reliable ranged hard CC (named anchor) |
| `anti_air` | drops airborne | 100% | 2.0 | adds | The iconic anti-air tool |
| `interrupt` | cancels channels | 90% | 2.0 | adds | Long-range interrupt |
| `disarm` | knockdown denies action | 50% | 2.0 | adds | Pseudo-disarm during the drop |
| `bullet_resistance` | CC pseudo-credit | 20 (eff. %, ~0.4× CC) | 1.1 | adds | Stunned enemy fires nothing |
| `counter_importance` | anti-air/anti-channel | 90% | 1.8 | adds | Reaction tool |
| `engage` | stun to open | 60% | 1.2 | adds | Initiation CC |

---

## Radiant Regeneration
- **normalized_name**: `radiant_regeneration` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_radiant_regeneration`
- **wiki**: https://deadlock.wiki/Radiant_Regeneration

### Interpretation
+90 HP, a triggered 4 HP/s regen (7s), and 70 healing + 1.75m move on each ability cast (3s). Sustain that rewards ability spam.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +90 | Passive |
| Regeneration | 4 HP/s | Triggered |
| Regeneration Duration | 7s | 28/trigger |
| Healing on Ability Cast | 70 | Per cast |
| Move Speed | +1.75m | 3s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 4/s + 70/cast | ~10 (HP/s eff.) | 0.4 | adds | Sustained regen + per-cast heals |
| `self_heal` | 70/cast + regen | ~150 (eff. HP/fight) | 0.4 | adds | Strong cast-driven sustain |
| `ability_spam` | heals per cast | 70% | 1.4 | relies | Scales with cast frequency |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.4 | adds | HP rider |
| `horizontal_mobility` | +1.75m on cast | 0.7 (m/s eff.) | 0.5 | adds | Speed on cast |

---

## Rapid Recharge
- **normalized_name**: `rapid_recharge` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_rapid_recharge`
- **wiki**: https://deadlock.wiki/Rapid_Recharge

### Interpretation
+2 ability charges, +30% faster charge regen, +14% CDR and +14 SP for charged abilities. Named anchor for `charge_dependant`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Ability Charges | +2 | Charge abilities |
| Faster Time Between Charges | +30% | — |
| Cooldown Reduction (charged) | +14% | — |
| Spirit Power (charged) | +14 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +2 charges + 30% regen | 2.5 (extra charges eq.) | 0.1 | adds | Cross-tier charge-stack ceiling |
| `charge_dependant` | useless off-kit | 100% | 2.0 | relies | Pure synergy with charge abilities |
| `cooldown_reduction` | +14% (charged) | 14 (eff. %) | 0.7 | adds | CDR on charged abilities |
| `ability_spam` | more charges to spam | 80% | 1.6 | adds | More uses per fight |
| `spirit_damage` | +14 SP (charged) | 10 (eff. SP) | 0.4 | adds | Gated SP |
| `single_ability_focus` | the charge ability | 70% | 1.4 | adds | Concentrates on charged abilities |

---

## Silence Wave
- **normalized_name**: `silence_wave` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_silence_wave`
- **wiki**: https://deadlock.wiki/Silence_Wave

### Interpretation
+50 HP; active AoE (40m) silences enemies (3s) and deals 75 (+0.7×SP) spirit damage. Named anchor for `silence`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Silence | yes | 3s |
| Spirit Damage | 75 base + 0.7×Spirit Power | AoE |
| Cast Range | 40m | — |
| Silence Duration | 3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 3s AoE silence | 3 (silence sec × AoE) | 2.0 | adds | Named silence anchor; multi-target |
| `spirit_resistance` | silence pseudo-credit | 9 (eff. %, ~0.3× silence) | 0.4 | adds | Silenced enemies deal no spirit |
| `spirit_damage` | 75 + 0.7×SP | 29 (eff. SP) | 1.2 | relies | 75/5 + 0.7×20 = 29 |
| `spirit_burst_damage` | 75+ on cast | 75 (dmg in 1s) | 1.1 | adds | Burst on cast |
| `aoe_cluster` | AoE silence+dmg | 80% | 1.6 | adds | Hits grouped casters |
| `counter_importance` | anti-caster | 90% | 1.8 | adds | Shuts down ability heroes |
| `interrupt` | silence cancels casts | 60% | 1.3 | adds | Denies channels |

---

## Spirit Snatch
- **normalized_name**: `spirit_snatch` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_spirit_snatch`
- **wiki**: https://deadlock.wiki/Spirit_Snatch

### Interpretation
+7% melee damage, +75 HP; a proc deals 50 (+0.84×SP) spirit damage and steals 12% spirit resist + 25 SP from the target (10s). Spirit burst + resist/SP theft.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Melee Damage | +7% | Passive |
| Bonus Health | +75 | Passive |
| Spirit Damage | 50 base + 0.84×Spirit Power | Proc |
| Spirit Resist Steal | 12% | Conditional, 10s |
| Spirit Power Steal | 25 | Conditional, 10s |
| Duration | 10s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -12% steal | 12 (eff. %, positive) | 1.2 | adds | Lowers target spirit resist (you gain it) |
| `spirit_damage` | 50 + 0.84×SP + 25 steal | 27 (eff. SP) | 1.1 | relies | 50/5 + 0.84×20 = 27, plus the stolen SP |
| `spirit_burst_damage` | 50+ proc | 50 (dmg in 1s) | 0.7 | adds | Burst hit |
| `self_buff` | steals SP for self | 50% | 1.1 | adds | Self spirit gain |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.3 | adds | HP rider |
| `counter_importance` | drains enemy caster | 60% | 1.2 | adds | Saps an enemy spirit threat |

---

## Superior Cooldown
- **normalized_name**: `superior_cooldown` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_superior_cooldown`
- **wiki**: https://deadlock.wiki/Superior_Cooldown

### Interpretation
+4 OOC regen and +20% ability cooldown reduction. The cross-tier ceiling for `cooldown_reduction`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4/sec | OOC |
| Ability Cooldown Reduction | +20% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +20% | 20 (eff. %) | 1.0 | adds | Highest clean kit-wide CDR |
| `ability_spam` | more casts | 100% | 2.0 | adds | Drives cast frequency |
| `multi_ability_focus` | kit-wide | 80% | 1.6 | adds | Lowers every cooldown |
| `ult_focused` | shortens ult | 50% | 1.0 | adds | Helps ult uptime |

---

## Superior Duration
- **normalized_name**: `superior_duration` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_superior_duration`
- **wiki**: https://deadlock.wiki/Superior_Duration

### Interpretation
+8% bullet resist and +28% ability duration. Named cross-tier anchor for `duration_dependant`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Resist | +8% | Passive |
| Ability Duration | +28% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `duration_dependant` | +28% | 28 (% duration, add) | 1.7 | adds | Cross-tier ceiling for duration up |
| `multi_ability_focus` | kit-wide | 80% | 1.6 | adds | Extends every timed ability |
| `bullet_resistance` | +8% | 8 (eff. %) | 0.4 | adds | Small flat bullet resist |
| `self_buff` | enabler | 50% | 1.1 | adds | Generic enabler |

---

## Surge of Power
- **normalized_name**: `surge_of_power` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_surge_of_power`
- **wiki**: https://deadlock.wiki/Surge_of_Power

### Interpretation
+28 imbued-ability Spirit Power, plus +20% fire rate and +1.75m move after casting the imbued ability (8s). A single-ability spirit amp with a gun tempo rider.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Imbued Ability Spirit Power | +28 | One imbued ability |
| Fire Rate | +20% | Conditional, 8s |
| Move Speed | +1.75m | Conditional, 8s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +28 SP (one ability) | 24 (eff. SP) | 1.0 | adds | Big SP on the imbued ability |
| `single_ability_focus` | one imbued slot | 100% | 2.0 | adds | Value concentrates on one ability |
| `fire_rate` | +20% after cast | 14 (eff. %) | 0.6 | adds | Windowed fire rate |
| `hybrid_damage_usage` | spirit cast → gun tempo | 70% | 1.4 | adds | Couples ability and gun |
| `horizontal_mobility` | +1.75m after cast | 0.7 (m/s eff.) | 0.5 | adds | Windowed move |
| `ability_spam` | cast to trigger | 50% | 1.0 | adds | Rewards casting |

---

## Tankbuster
- **normalized_name**: `tankbuster` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_tankbuster`
- **wiki**: https://deadlock.wiki/Tankbuster

### Interpretation
+50 HP, and a proc dealing 40 + 8% of the target's current HP as bonus damage. Named anti-tank tool — scales with enemy HP.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +50 | Passive |
| Bonus Damage | 40 | Proc |
| Current Health Bonus Damage | 8% | Of target current HP |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 8% current HP | 80% | 1.8 | adds | %current-HP bypasses big HP pools (anti-tank) |
| `spirit_damage` | 40 + %HP | 14 (eff. SP) | 0.6 | relies | Flat + %HP scaling component |
| `counter_importance` | anti-tank | 90% | 1.8 | adds | Bought specifically vs big-HP enemies |
| `single_target` | per-target proc | 70% | 1.6 | adds | Single-target damage |
| `high_max_hp` | +50 HP | 50 (flat HP) | 0.2 | adds | Token HP |

---

## Torment Pulse
- **normalized_name**: `torment_pulse` · **tier**: 3 (3200) · **category**: Spirit · **codename**: `upgrade_torment_pulse`
- **wiki**: https://deadlock.wiki/Torment_Pulse

### Interpretation
+100 HP, +18% melee resist, and a passive 9m aura pulsing 25 (+0.23×SP) spirit damage to nearby enemies. A sustained spirit-aura DoT for brawlers.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Melee Resist | +18% | Passive |
| Spirit Damage (pulse) | 25 base + 0.23×Spirit Power | 9m aura |
| Pulse Radius | 9m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_continuous_damage` | aura pulse | 50 (eff. total) | 1.1 | adds | Sustained passive spirit aura |
| `aoe_cluster` | 9m aura | 80% | 1.6 | adds | Hits everyone near you |
| `spirit_damage` | 25 + 0.23×SP | 10 (eff. SP) | 0.4 | relies | 25/5 + 0.23×20 = 10 |
| `melee_resistance` | +18% | 18 (eff. %) | 0.5 | adds | Solid melee defense |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.4 | adds | Good brawler HP |
| `close_range` | aura is short-range | 60% | 1.2 | adds | Value near enemies |
| `farmer` | aura clears camps | 60% | 1.2 | adds | Passive AoE farm |

---

# T4 (6400 souls)

## Armor Piercing Rounds
- **normalized_name**: `armor_piercing_rounds` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_armor_piercing_rounds`
- **wiki**: https://deadlock.wiki/Armor_Piercing_Rounds

### Interpretation
+60% velocity, +8% weapon damage, and a 55% chance per bullet to ignore the target's bullet armor. A self-only anti-armor bullet item. Named anchor for `bullet_resist_shred` (effective, gun-flavored).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +60% | Passive |
| Weapon Damage | +8% | Passive |
| Proc Chance | 55% | Per bullet — ignores bullet armor |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | 55% armor-pierce chance, self-only | 27 (eff. %, 55%×0.5 self-only) | 1.8 | adds | Per user: 0.55 × 0.5 self-only penalty = 27% effective bullet shred |
| `bullet_damage` | +8% + effective pierce | 20 (eff. %) | 0.4 | adds | Pierce raises effective gun damage vs armored targets |
| `counter_importance` | anti-tank | 90% | 1.8 | adds | Bought specifically vs armored/tank comps |
| `gun_continuous_proc` | 55% per-bullet | index | 1.0 | adds | Apply-rate per sustained fire |
| `long_range` | +60% velocity | 40% | 0.8 | adds | Velocity lands ranged shots |
| `gun_continuous_damage` | sustained | 12 | 0.2 | adds | Propagation |

---

## Capacitor
- **normalized_name**: `capacitor` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_capacitor`
- **wiki**: https://deadlock.wiki/Capacitor

### Interpretation
+5% fire rate, a 20% bullet proc chaining 43 (+0.19×SP) spirit lightning to 6 targets, plus an active dealing 100 + a -75% slow (3s). Bullet-triggered AoE spirit + a hard slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +5% | Passive |
| Spirit Damage (chain) | 43 base + 0.19×Spirit Power | 20% proc, 6 jumps, 10m |
| Active Damage | 100 | — |
| Move Speed (enemy) | -75% | Active, 3s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | chains to 6 | 100% | 2.0 | adds | Strong multi-target chain |
| `bullet_proc` | 20% per bullet | high | 1.3 | adds | Bullet-triggered spirit chain |
| `movement_slow` | -75% active, 3s | 60 (eff. %, positive) | 0.9 | adds | Huge active slow |
| `spirit_damage` | 43 + 0.19×SP chain | 12 (eff. SP) | 0.3 | relies | 43/5 + 0.19×20 = 12 |
| `farmer` | chain clears waves | 90% | 1.8 | adds | Excellent wave clear |
| `spirit_continuous_damage` | repeated chains | 43 | 0.6 | adds | Sustained spirit |
| `fire_rate` | +5% | 5 (eff. %) | 0.1 | adds | Small fire rate |

---

## Crippling Headshot
- **normalized_name**: `crippling_headshot` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_crippling_headshot`
- **wiki**: https://deadlock.wiki/Crippling_Headshot

### Interpretation
+125 HP, and a headshot applies -16% bullet resist, -16% spirit resist, and -35% healing reduction for 12s. The cross-tier anchor for both resist shreds — lights a target up for the whole team.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +125 | Passive |
| Bullet Resist | -16% | On headshot, 12s |
| Spirit Resist | -16% | On headshot, 12s |
| Healing Reduction | -35% | Conditional, 12s |
| Debuff Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_resist_shred` | -16% on headshot, 12s | 16 (eff. %, positive) | 1.1 | adds | Cross-tier ceiling; team-wide, long uptime |
| `spirit_resist_shred` | -16% on headshot, 12s | 16 (eff. %, positive) | 1.1 | adds | Cross-tier ceiling for spirit shred too |
| `anti_heal` | -35%, 12s | 35 (eff. %, positive) | 0.9 | adds | Strong heal cut on the same debuff |
| `headshot_damage` | requires heads | 70% | 0.5 | relies | Must land heads to apply |
| `counter_importance` | anti-armor + anti-heal | 90% | 1.8 | adds | Multi-purpose counter |
| `high_kill_count` | lights up focus target | 70% | 2.0 | adds | Sets up kills |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.4 | adds | Good HP rider |

---

## Crushing Fists
- **normalized_name**: `crushing_fists` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_crushing_fists`
- **wiki**: https://deadlock.wiki/Crushing_Fists

### Interpretation
+60% heavy melee distance, +22% melee damage, +12% bullet resist, +25% bonus heavy damage, plus a stacking ammo/bullet-shred and a 0.5s stun on heavy. The cross-tier melee weapon ceiling.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +60% | Passive |
| Melee Damage | +22% | Passive |
| Bullet Resist | +12% | Passive |
| Bonus Heavy Damage | +25% | Heavy melee |
| Ammo | +15% | Stacking |
| Bullet Resist (enemy) | -4% | Conditional |
| Stun Duration | 0.5s | Heavy melee |
| Max Stacks | 6 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +22% + 25% heavy | 45 (eff. %) | 0.4 | adds | Highest melee amp in the set |
| `melee_damage` | melee-committed | 70% | 0.7 | relies | Pays off on melee heroes |
| `stun` | 0.5s on heavy | 0.5 (stun sec) | 1.0 | adds | Heavy-melee CC |
| `close_range` | heavy melee tool | 80% | 1.6 | adds | Point-blank |
| `bullet_resistance` | +12% | 12 (eff. %) | 0.4 | adds | Solid bullet resist |
| `bullet_resist_shred` | -4% stacks | 4 (eff. %, positive) | 0.3 | adds | Small shred on heavy |
| `engage` | gap-closing heavy | 70% | 1.4 | adds | Extended-reach engage |
| `grounded` | melee grounded | 60% | 2.0 | adds | Implicit |

---

## Frenzy
- **normalized_name**: `frenzy` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_frenzy`
- **wiki**: https://deadlock.wiki/Frenzy

### Interpretation
+160 HP, +15% fire rate, and a low-HP trigger granting +40% fire rate, +4m/s move, +40% debuff resist (10s). A comeback DPS spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +160 | Passive |
| Fire Rate | +15% | Passive |
| Move Speed | +4m/s | Conditional (low HP), 10s |
| Fire Rate (active) | +40% | Conditional, 10s |
| Debuff Resist | +40% | Conditional, 10s |
| Duration | 10s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +15% + 40% (low HP) | 35 (eff. %) | 1.0 | adds | Big fire rate, low-HP-gated |
| `low_max_hp` | triggers at low HP | 70% | 1.8 | adds | Effectiveness scales as HP drops |
| `gun_continuous_damage` | sustained DPS spike | 30 | 0.6 | adds | Brawl DPS |
| `horizontal_mobility` | +4m/s (active) | 1.4 (m/s eff.) | 0.6 | adds | Strong windowed move |
| `cc_resist` | +40% debuff resist | 24 (eff. %) | 0.4 | adds | Windowed CC resist |
| `high_max_hp` | +160 HP | 160 (flat HP) | 0.5 | adds | Good HP |

---

## Glass Cannon
- **normalized_name**: `glass_cannon` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_glass_cannon`
- **wiki**: https://deadlock.wiki/Glass_Cannon

### Interpretation
+80% weapon damage, -13% max HP, and +7% fire rate per kill. The cross-tier ceiling for `bullet_damage`; named anchor for `low_max_hp`/`close_range`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +80% | Passive |
| Max Health | -13% | Downside |
| Fire Rate per Kill | +7% | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +80% | 80 | 1.8 | adds | Cross-tier ceiling for raw weapon damage |
| `low_max_hp` | -13% HP, scales aggressive | 80% | 2.0 | adds | Named anchor; glass-cannon trade |
| `fire_rate` | +7%/kill | 25 (eff. %, ~stacked) | 0.7 | adds | Snowballs with kills |
| `gun_burst_damage` | per-shot | 40 | 0.5 | adds | Propagation |
| `gun_continuous_damage` | per-shot | 24 | 0.5 | adds | Propagation |
| `high_kill_count` | kill-stacking | 70% | 2.0 | adds | Snowball carry |
| `scaling_late` | carry scaling | 70% | 2.0 | adds | Late-game damage |
| `high_max_hp` | -13% HP | -49 (eff. HP) | -0.1 | adds | Real HP downside |

---

## Lucky Shot
- **normalized_name**: `lucky_shot` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_lucky_shot`
- **wiki**: https://deadlock.wiki/Lucky_Shot

### Interpretation
+30% max ammo, and a 25% chance per bullet to deal +100% bonus weapon damage. A high-variance sustained-fire gun proc.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +30% | Passive |
| Bonus Weapon Damage | +100% | 25% proc chance |
| Proc Chance | 25% | Per bullet |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_damage` | +100% × 25% proc | 25 (eff. avg %) | 0.6 | adds | Averaged proc damage |
| `gun_continuous_proc` | 25% per bullet | index | 1.0 | adds | Rewards sustained fire |
| `bullet_proc` | per-bullet crit | high | 1.3 | adds | Bullet-triggered burst |
| `gun_continuous_damage` | sustained crits | 25 | 0.5 | adds | Pays off over a mag |
| `magazine_size_dependant` | +30% ammo | 30 (eff. ammo %) | 0.3 | adds | More shots = more procs |
| `gun_burst_damage` | spike on proc | 30 | 0.4 | adds | Big single-bullet spike |

---

## Ricochet
- **normalized_name**: `ricochet` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_ricochet`
- **wiki**: https://deadlock.wiki/Ricochet

### Interpretation
+18% fire rate, and bullets ricochet 65% damage to 2 nearby targets (13m). Named `aoe_cluster`/`mid_range` reference — turns single-target fire into spread damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +18% | Passive |
| Ricochet Damage | 65% | To secondary targets |
| Ricochet Targets | 2 | — |
| Ricochet Range | 13m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aoe_cluster` | 65% to 2 targets | 90% | 1.8 | adds | Strong gun-AoE spread |
| `fire_rate` | +18% | 18 (eff. %) | 0.5 | adds | Solid fire rate |
| `farmer` | ricochet clears waves | 90% | 1.8 | adds | Excellent wave/jungle clear |
| `lane_pusher` | wave clear | 70% | 1.8 | adds | Solo push |
| `gun_continuous_damage` | sustained spread | 24 | 0.5 | adds | More effective DPS in groups |
| `mid_range` | 13m ricochet | 60% | 2.0 | adds | Works at moderate range |

---

## Shadow Weave
- **normalized_name**: `shadow_weave` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_shadow_weave`
- **wiki**: https://deadlock.wiki/Shadow_Weave

### Interpretation
+5 OOC regen, +1.5m sprint, and a long invisibility (13s, +5m invis sprint) with an ambush burst on breaking stealth (+25% fire rate, +25 SP, +25% melee, 5s). A flank/ambush package.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +5/sec | OOC |
| Sprint Speed | +1.5m | Passive |
| Stealth Duration | 13s | Invisible |
| Invis Sprint Speed | +5m | While invis |
| Ambush Fire Rate | +25% | 5s after breaking |
| Ambush Spirit Power | +25 | 5s |
| Ambush Melee Damage | +25% | 5s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `away_from_team` | long invis flank | 90% | 2.0 | adds | Flank/solo tool |
| `engage` | ambush opener | 80% | 1.6 | adds | Stealth into burst |
| `escape` | invis disengage | 70% | 1.4 | adds | Vanish to safety |
| `horizontal_mobility` | +5m invis sprint | 1.5 (m/s eff.) | 0.7 | adds | Fast repositioning |
| `fire_rate` | +25% ambush | 12 (eff. %, windowed) | 0.4 | adds | Ambush DPS |
| `spirit_damage` | +25 ambush SP | 12 (eff. SP) | 0.3 | adds | Ambush spirit burst |
| `melee_damage` | +25% ambush | 12 (eff. %) | 0.1 | adds | Ambush melee |

---

## Silencer
- **normalized_name**: `silencer` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_silencer`
- **wiki**: https://deadlock.wiki/Silencer

### Interpretation
+12% spirit resist, and a proc that silences (2.5s) and reduces the target's spirit damage by 25% (6s). An anti-caster gun item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +12% | Passive |
| Spirit Damage Reduction (enemy) | -25% | Conditional, 6s |
| Silence | yes | 2.5s |
| Silence Duration | 2.5s | — |
| Immunity Duration | 10s | Re-silence immunity |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 2.5s silence | 2.5 (silence sec) | 1.1 | adds | Reliable single-target silence |
| `spirit_resistance` | +12% + silence + -25% enemy SP | 22 (eff. %) | 0.7 | adds | Flat resist plus silence/SP-reduction pseudo-credit |
| `counter_importance` | anti-caster | 100% | 2.0 | adds | Pure counter to spirit heroes |
| `interrupt` | silence cancels casts | 50% | 1.1 | adds | Denies channels |
| `single_target` | targeted | 60% | 1.3 | adds | One target |

---

## Spellslinger
- **normalized_name**: `spellslinger` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_spellslinger`
- **wiki**: https://deadlock.wiki/Spellslinger

### Interpretation
+5% CDR, and stacking +11% fire rate (6 stacks = +66%) and -10% reload as you cast abilities (18s). Hugely effective fire rate for ability-spam heroes who keep stacks up.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Cooldown Reduction | +5% | Passive |
| Fire Rate | +11% | Per stack |
| Reload Time | -10% | Per stack |
| Max Stacks | 6 | up to +66% |
| Buff Duration | 18s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +11%/stack (max +66%) | 45 (eff. avg %, ability-spam upkeep) | 1.3 | adds | Very high effective fire rate for caster-gun hybrids |
| `ability_spam` | stacks on cast | 80% | 1.6 | relies | Effectiveness relies on frequent casting to hold stacks |
| `gun_continuous_damage` | sustained DPS | 38 | 0.8 | adds | Big sustained gun DPS when stacked |
| `magazine_size_dependant` | -10% reload/stack | 25 (eff. ammo %) | 0.2 | adds | Reload speed counts toward mag |
| `cooldown_reduction` | +5% | 5 (eff. %) | 0.2 | adds | Minor CDR |
| `hybrid_damage_usage` | casting feeds gun DPS | 80% | 1.6 | adds | Couples abilities and gun |

---

## Spiritual Overflow
- **normalized_name**: `spiritual_overflow` · **tier**: 4 (6400) · **category**: Weapon · **codename**: `upgrade_spiritual_overflow`
- **wiki**: https://deadlock.wiki/Spiritual_Overflow

### Interpretation
+15% duration, +13% spirit lifesteal, +90 HP, +6 SP, and an active granting +32% fire rate and +40 SP (15s). The iconic `hybrid_damage_usage` double-dipper.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Spirit Lifesteal | +13% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Power | +6 | Passive |
| Fire Rate (active) | +32% | 15s |
| Spirit Power (active) | +40 | 15s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | +fire rate AND +SP together | 100% | 2.0 | adds | Iconic double-dipper (named anchor) |
| `fire_rate` | +32% (active) | 22 (eff. %) | 0.7 | adds | Big windowed fire rate |
| `spirit_damage` | +6 + 40 (active) | 30 (eff. SP) | 0.8 | adds | Strong combined Spirit Power |
| `spirit_lifesteal` | +13% | 13 (eff. %) | 0.3 | adds | Clean spirit lifesteal |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.3 | adds | HP rider |
| `duration_dependant` | +15% | 15 (% duration) | 0.6 | adds | Duration up |

---

## Cheat Death
- **normalized_name**: `cheat_death` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_cheat_death`
- **wiki**: https://deadlock.wiki/Cheat_Death

### Interpretation
+200 HP, +15% bullet resist, and a death-save: on lethal damage, become 60% damage-reduced (and 60% heal-reduced) for 4.5s instead of dying. A clutch survival item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +200 | Passive |
| Bullet Resist | +15% | Passive |
| Death Immunity Duration | 4.5s | On lethal damage |
| Damage Reduction | -60% | During window |
| Healing Reduction | -60% | During window |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `damage_sponge` | death-save window | 90% | 2.0 | adds | Survives a lethal burst |
| `burst_resistance` | -60% during window | 90% | 2.0 | adds | Negates the killing burst |
| `low_max_hp` | triggers at death | 60% | 1.5 | adds | Effectiveness when about to die |
| `high_max_hp` | +200 HP | 200 (flat HP) | 0.6 | adds | Big HP pool |
| `bullet_resistance` | +15% | 15 (eff. %) | 0.5 | adds | Solid flat bullet resist |
| `counter_importance` | anti-burst | 90% | 1.8 | adds | Counters delete combos |

---

## Colossus
- **normalized_name**: `colossus` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_colossus`
- **wiki**: https://deadlock.wiki/Colossus

### Interpretation
+25% base HP, +15% weapon damage, and an active granting 35% bullet/spirit resist, +30% melee, -30% enemy slow (14m), while growing your model 20%. The cross-tier anchor for `high_max_hp`/`large_hitbox`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Base Health | +25% | Passive |
| Weapon Damage | +15% | Passive |
| Bullet Resist | 35% | Active, 7s |
| Spirit Resist | 35% | Active, 7s |
| Melee Damage | +30% | Active |
| Move Speed (enemy) | -30% | Active, AoE |
| Model Scale | +20% | — |
| Radius | 14m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `high_max_hp` | +25% base HP | 200 (eff. HP) | 0.6 | adds | % HP scaling — cross-tier tank anchor |
| `large_hitbox` | +20% model + HP scaling | 90% | 2.0 | adds | Named anchor; grows your hitbox |
| `bullet_resistance` | 35% (active) | 25 (eff. %) | 0.9 | adds | Strong windowed bullet resist |
| `spirit_resistance` | 35% (active) | 25 (eff. %) | 0.7 | adds | Strong windowed spirit resist |
| `damage_sponge` | massive HP + resist | 90% | 2.0 | adds | The premier damage soak |
| `melee_damage` | +30% (active) | 20 (eff. %) | 0.2 | adds | Windowed melee |
| `movement_slow` | -30% AoE (active) | 24 (eff. %, positive) | 0.4 | adds | AoE slow during the active |
| `bullet_damage` | +15% | 15 | 0.3 | adds | Weapon damage rider |

---

## Divine Barrier
- **normalized_name**: `divine_barrier` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_divine_barrier`
- **wiki**: https://deadlock.wiki/Divine_Barrier

### Interpretation
+10% range, +1.5 OOC regen; active (40m, 6s) grants a 600 barrier and +2.75m move to an ally or self. A big targetable shield/peel — the T4 Guardian Ward.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +10% | Passive |
| Out of Combat Regen | +1.5/sec | OOC |
| Barrier | 600 | Active |
| Move Speed | +2.75m | Active, 6s |
| Buff Duration | 6s | — |
| Cast Range | 40m | Ally-targetable |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 600 | 600 (shield HP) | 0.6 | adds | Large targetable barrier |
| `team_heal` | 600 shield to ally | 600 (to ally) | 2.0 | adds | Big ally peel at 40m |
| `assist_importance` | peel for allies | 80% | 1.6 | adds | Mostly ally-facing |
| `burst_resistance` | absorbs a burst | 70% | 1.6 | adds | Soaks a burst window |
| `horizontal_mobility` | +2.75m (active) | 1.0 (m/s eff.) | 0.4 | adds | Speed buff on target |
| `range_extender_dependant` | +10% range | 10 (% range, add) | 0.3 | adds | Direct range up |
| `close_to_team` | shields allies | 60% | 1.5 | adds | Best near allies |

---

## Diviners Kevlar
- **normalized_name**: `diviners_kevlar` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_diviners_kevlar`
- **wiki**: https://deadlock.wiki/Diviner's_Kevlar

### Interpretation
+15% ability duration, and a triggered 1000 barrier + 35 SP (20s). The main value is the large barrier and SP burst; the +15% duration is a modest rider (not the headline).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Barrier | 1000 | Conditional |
| Spirit Power | +35 | Conditional, 20s |
| Buff Duration | 20s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 1000 | 700 (eff. shield HP) | 0.7 | adds | Big conditional barrier — the headline value |
| `spirit_damage` | +35 SP (conditional) | 28 (eff. SP) | 0.8 | adds | Strong windowed Spirit Power |
| `duration_dependant` | +15% | 15 (% duration) | 0.6 | adds | Modest rider, NOT inflated to a headline |
| `burst_resistance` | barrier soaks burst | 60% | 1.3 | adds | Absorbs a burst window |
| `damage_sponge` | triggered barrier | 50% | 1.1 | adds | Reactive cushion |
| `self_buff` | self barrier + SP | 60% | 1.3 | adds | Self-focused package |

---

## Healing Tempo
- **normalized_name**: `healing_tempo` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_healing_tempo`
- **wiki**: https://deadlock.wiki/Healing_Tempo

### Interpretation
+25% healing effectiveness, +10% spirit resist, +6 health regen, +4 OOC regen, plus a +35% fire rate / +1.25m move buff (7s). A sustain + tempo hybrid that meaningfully boosts self-healing.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Healing Effectiveness | +25% | Passive amp |
| Spirit Resist | +10% | Passive |
| Health Regen | +6/sec | Passive |
| Out of Combat Regen | +4/sec | OOC |
| Fire Rate (buff) | +35% | 7s |
| Move Speed (buff) | +1.25m | 7s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `continous_heal` | 6/s + 25% amp | ~9 (HP/s eff.) | 0.3 | adds | Strong always-on regen plus heal multiplier |
| `self_heal` | +25% amp + regen | ~250 (eff. HP/fight) | 0.5 | adds | Meaningfully boosts all self-healing (per user) |
| `fire_rate` | +35% (buff) | 22 (eff. %) | 0.7 | adds | Big windowed fire rate |
| `team_heal` | +25% amp | 40% | 0.1 | adds | Amplifies heals to allies |
| `spirit_resistance` | +10% | 10 (eff. %) | 0.3 | adds | Small flat spirit resist |
| `horizontal_mobility` | +1.25m (buff) | 0.6 (m/s eff.) | 0.3 | adds | Windowed move |

---

## Infuser
- **normalized_name**: `infuser` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_infuser`
- **wiki**: https://deadlock.wiki/Infuser

### Interpretation
+13% spirit lifesteal, +10% spirit resist, +100 HP, +6 SP, and an active (7s): +70% spirit lifesteal and +30 SP. A spirit-carry sustain spike.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +13% | Passive |
| Spirit Resist | +10% | Passive |
| Bonus Health | +100 | Passive |
| Spirit Power | +6 | Passive |
| Spirit Lifesteal (active) | +70% | 7s |
| Spirit Power (active) | +30 | 7s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_lifesteal` | +13% + 70% (active) | 30 (eff. %, active-windowed) | 0.6 | adds | Huge active lifesteal spike for spirit carries |
| `spirit_damage` | +6 + 30 (active) | 24 (eff. SP) | 0.7 | adds | Strong windowed Spirit Power |
| `self_heal` | active lifesteal | 60% | 0.1 | adds | Big self-sustain during the window |
| `spirit_resistance` | +10% | 10 (eff. %) | 0.3 | adds | Small flat spirit resist |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.3 | adds | Good HP |

---

## Inhibitor
- **normalized_name**: `inhibitor` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_inhibitor`
- **wiki**: https://deadlock.wiki/Inhibitor

### Interpretation
+10% weapon damage, +150 HP, and on hit applies a -30% damage penalty and -40% healing reduction to the target (5s). A bruiser counter that both weakens enemy output and cuts their healing.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +10% | Passive |
| Bonus Health | +150 | Passive |
| Damage Penalty (enemy) | -30% | On hit, 5s |
| Healing Reduction (enemy) | -40% | On hit, 5s |
| Debuff Duration | 5s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -40% on hit, 5s | 40 (eff. %, positive) | 1.0 | adds | Strong heal cut |
| `debuff` | -30% damage penalty | 70% | 1.8 | adds | High-impact enemy-damage cripple |
| `counter_importance` | anti-carry + anti-heal | 100% | 2.0 | adds | Shuts down a key enemy |
| `high_max_hp` | +150 HP | 150 (flat HP) | 0.4 | adds | Good HP |
| `bullet_damage` | +10% | 10 | 0.2 | adds | Small weapon damage |
| `single_target` | on-hit target | 60% | 1.3 | adds | One-target debuff |

---

## Juggernaut
- **normalized_name**: `juggernaut` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_juggernaut`
- **wiki**: https://deadlock.wiki/Juggernaut

### Interpretation
+50% slow resist, +2.5m move, +25% melee resist, +8 health regen, and a -40% fire rate applied to nearby enemies (4s). A move-tank that resists SLOWS (not generic debuffs) and shuts down enemy gun output. Named `fire_rate_slow` anchor.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Slow Resist | +50% | Passive |
| Move Speed | +2.5m | Passive |
| Melee Resist | +25% | Passive |
| Health Regen | +8/sec | Passive |
| Fire Rate (enemy) | -40% | Conditional, 4s |
| Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate_slow` | -40% on enemies, 4s | 40 (eff. %, positive) | 0.7 | adds | Cross-tier fire-rate-slow ceiling; written positive |
| `cc_resist` | +50% slow resist | 25 (eff. %, slows only) | 0.4 | adds | Resists SLOWS specifically (NOT generic debuffs) |
| `horizontal_mobility` | +2.5m move | 2.5 (m/s eff.) | 1.1 | adds | Strong full move speed |
| `melee_resistance` | +25% | 25 (eff. %) | 0.4 | adds | Solid melee defense |
| `gun_continuous_resistance` | throttles enemy fire | 40 | 0.7 | adds | Fire-rate cut ≈ gun mitigation |
| `continous_heal` | +8 regen | 8 (HP/s) | 0.2 | adds | Sustained regen |
| `large_hitbox` | move-tank | 40% | 0.9 | adds | Bruiser synergy |

---

## Leech
- **normalized_name**: `leech` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_leech`
- **wiki**: https://deadlock.wiki/Leech

### Interpretation
+25% spirit lifesteal, +25% bullet lifesteal, +180 HP, +12% weapon damage, +12 SP, pure passive. The cross-tier ceiling for both lifesteal tags — a hybrid sustain monster.

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
| `spirit_lifesteal` | +25% | 25 (eff. %) | 0.5 | adds | Cross-tier ceiling (clean passive) |
| `bullet_lifesteal` | +25% | 25 (eff. %) | 1.4 | adds | Cross-tier ceiling (clean passive) |
| `self_heal` | dual lifesteal | 60% | 0.1 | adds | Heavy hybrid sustain |
| `continous_heal` | sustained lifesteal | 50% | 1.5 | adds | Across long fights |
| `high_max_hp` | +180 HP | 180 (flat HP) | 0.5 | adds | Big HP |
| `bullet_damage` | +12% | 12 | 0.3 | adds | Weapon damage rider |
| `spirit_damage` | +12 SP | 12 (eff. SP) | 0.3 | adds | Flat SP |
| `hybrid_damage_usage` | both lifesteals | 60% | 1.2 | adds | Rewards hybrid damage |

---

## Phantom Strike
- **normalized_name**: `phantom_strike` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_phantom_strike`
- **wiki**: https://deadlock.wiki/Phantom_Strike

### Interpretation
+15% weapon damage, +8 SP; active (25m) teleport-strikes a target, disarming them and applying -50% slow and 75 (+0.93×SP) damage (3s). Named `engage` anchor — a commit-only gap-closer (does not work as escape).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Spirit Power | +8 | Passive |
| Disarm | yes | 3s |
| Move Speed (enemy) | -50% | Conditional |
| Spirit Damage | 75 base + 0.93×Spirit Power | On strike |
| Cast Range | 25m | — |
| Duration | 3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `engage` | teleport-strike | 100% | 2.0 | adds | Named anchor; engage-only (no escape function) |
| `disarm` | 3s disarm | 3 (disarm sec) | 0.1 | adds | Turns off the target's gun on arrival |
| `away_from_team` | flank dive | 80% | 1.8 | adds | Solo-flank assassin tool |
| `movement_slow` | -50%, 3s | 40 (eff. %, positive) | 0.6 | adds | Sticks the target after the strike |
| `spirit_damage` | 75 + 0.93×SP | 34 (eff. SP) | 0.9 | relies | 75/5 + 0.93×20 = 34 |
| `bullet_damage` | +15% | 15 | 0.3 | adds | Weapon damage rider |
| `single_target` | pick tool | 70% | 1.6 | adds | Targets one |

---

## Plated Armor
- **normalized_name**: `plated_armor` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_plated_armor`
- **wiki**: https://deadlock.wiki/Plated_Armor

### Interpretation
+130 HP, 30% bullet deflection, and 50% on-hit damage prevention (caps incoming bullet hits). Named `bullet_evasion` reference — heavy sustained gun mitigation.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +130 | Passive |
| Deflection Percent | 30% | Bullet |
| On-Hit Prevention | 50% | Caps per-hit bullet damage |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | 30% deflect + 50% hit cap | 70% | 1.6 | adds | Strong sustained bullet mitigation |
| `gun_continuous_resistance` | caps per-hit | 30 (eff. %) | 0.6 | adds | Bread-and-butter sustained gun mitigation |
| `bullet_resistance` | deflection | 30 (eff. %) | 1.1 | adds | Acts like bullet resist |
| `damage_sponge` | tanks gunfire | 70% | 1.6 | adds | Eats bullets |
| `high_max_hp` | +130 HP | 130 (flat HP) | 0.4 | adds | HP rider |
| `counter_importance` | anti-gun | 80% | 1.6 | adds | Vs gun comps |

---

## Siphon Bullets
- **normalized_name**: `siphon_bullets` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_siphon_bullets`
- **wiki**: https://deadlock.wiki/Siphon_Bullets

### Interpretation
+15% weapon damage, +10% bullet resist, and bullets steal 2.5% of the target's max HP (permanent steal, 17s). Named anchor for `gun_continuous_proc` — apply-rate-capped, rewards sustained fire.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Weapon Damage | +15% | Passive |
| Bullet Resist | +10% | Passive |
| Max HP Steal | 2.5% | Per proc |
| Steal Duration | 17s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `gun_continuous_proc` | apply-rate-capped HP steal | 1.0 (cont. proc index) | 0.0 | adds | Named anchor; rewards sustained pressure |
| `pure_damage` | %max-HP steal | 60% | 1.3 | adds | %max-HP component bypasses big pools |
| `bullet_lifesteal` | HP steal acts as sustain | 12 (eff. %) | 0.7 | adds | Steal heals you — lifesteal-flavored |
| `bullet_damage` | +15% | 15 | 0.3 | adds | Weapon damage |
| `bullet_resistance` | +10% | 10 (eff. %) | 0.4 | adds | Small bullet resist |
| `high_max_hp` | grows your max via steal | 50% | 0.1 | adds | Steal raises your effective HP |

---

## Spellbreaker
- **normalized_name**: `spellbreaker` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_spellbreaker`
- **wiki**: https://deadlock.wiki/Spellbreaker

### Interpretation
+18% spirit resist, +25% debuff resist, +90 HP, and 65% spirit damage reduction above a 175 damage threshold. Named anchor for `spirit_burst_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +18% | Passive |
| Debuff Resist | +25% | Passive |
| Bonus Health | +90 | Passive |
| Spirit Damage Reduction | 65% | Above 175 damage threshold |
| Damage Threshold | 175 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_resistance` | 65% above 175 threshold | 90% | 1.1 | adds | Named anchor; negates spirit burst windows |
| `spirit_resistance` | +18% + 65% reduction | 35 (eff. %) | 1.0 | adds | Strong spirit mitigation |
| `debuff_resistance` | +25% | 25 (eff. %) | 0.4 | adds | Solid debuff resist |
| `counter_importance` | anti-spirit-burst | 100% | 2.0 | adds | Pure counter to spirit deletes |
| `high_max_hp` | +90 HP | 90 (flat HP) | 0.3 | adds | HP rider |

---

## Unstoppable
- **normalized_name**: `unstoppable` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_unstoppable`
- **wiki**: https://deadlock.wiki/Unstoppable

### Interpretation
+25% debuff resist, +125 HP, and an active granting full CC immunity (5.5s). Named anchor for `cc_resist`/`debuff_resistance`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +25% | Passive |
| Bonus Health | +125 | Passive |
| Duration | 5.5s | Full CC immunity |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cc_resist` | full immunity 5.5s + 25% | 90% | 1.3 | adds | Named anchor; total CC immunity window |
| `debuff_resistance` | +25% + immunity | 90% | 1.3 | adds | Strongest debuff defense |
| `counter_importance` | anti-CC | 100% | 2.0 | adds | Pure counter to lockdown comps |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.4 | adds | Good HP |
| `engage` | immune commit | 60% | 1.2 | adds | Dive through CC |

---

## Vampiric Burst
- **normalized_name**: `vampiric_burst` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_vampiric_burst`
- **wiki**: https://deadlock.wiki/Vampiric_Burst

### Interpretation
+13% bullet lifesteal, +10% bullet resist, +100 HP, +6% weapon damage, and an active (5s): +70% bullet lifesteal, +34% fire rate, +75% ammo. Named anchor for `bullet_lifesteal` (the active-burst flavor).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Lifesteal | +13% | Passive |
| Bullet Resist | +10% | Passive |
| Bonus Health | +100 | Passive |
| Weapon Damage | +6% | Passive |
| Bullet Lifesteal (active) | +70% | 5s |
| Fire Rate (active) | +34% | 5s |
| Ammo (active) | +75% | 5s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_lifesteal` | +13% + 70% (active) | 35 (eff. %, active-windowed) | 2.0 | adds | Named anchor; huge active lifesteal burst |
| `fire_rate` | +34% (active) | 22 (eff. %) | 0.7 | adds | Big windowed fire rate |
| `self_heal` | active lifesteal | 70% | 0.1 | adds | Massive self-sustain during the window |
| `magazine_size_dependant` | +75% ammo (active) | 30 (eff. ammo %) | 0.3 | adds | Windowed ammo |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.3 | adds | Good HP |
| `bullet_resistance` | +10% | 10 (eff. %) | 0.4 | adds | Small bullet resist |
| `damage_sponge` | sustain to brawl | 50% | 1.1 | adds | Rewards staying in |

---

## Witchmail
- **normalized_name**: `witchmail` · **tier**: 4 (6400) · **category**: Vitality · **codename**: `upgrade_witchmail`
- **wiki**: https://deadlock.wiki/Witchmail

### Interpretation
+22% spirit resist, +14 SP, and -4s cooldown per hit taken (above a 75 damage threshold). A spirit-bruiser that turns incoming damage into ability uptime.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +22% | Passive |
| Spirit Power | +14 | Passive |
| Cooldown Reduction per Hit | 4s | Above 75 damage threshold |
| Damage Threshold | 75 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resistance` | +22% | 22 (eff. %) | 0.7 | adds | Strong flat spirit resist |
| `cooldown_reduction` | -4s/hit taken | 18 (eff. %, damage-gated) | 0.6 | adds | Damage-sponge CDR engine |
| `damage_sponge` | CDR from being hit | 80% | 1.8 | adds | Value scales with damage taken |
| `spirit_damage` | +14 SP | 14 (eff. SP) | 0.4 | adds | Solid flat SP |
| `ability_spam` | CDR feeds casts | 60% | 1.2 | adds | More casts in a brawl |
| `spirit_continuous_resistance` | sustained | 22 | 0.8 | adds | Sustained spirit mitigation |

---

## Arctic Blast
- **normalized_name**: `arctic_blast` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_arctic_blast`
- **wiki**: https://deadlock.wiki/Arctic_Blast

### Interpretation
+10% spirit resist; active AoE (16m) deals 175 (+0.7×SP) spirit damage and freezes targets (1s). A big spirit nuke with hard CC.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist | +10% | Passive |
| Spirit Damage | 175 base + 0.7×Spirit Power | AoE |
| Freeze Duration | 1s | — |
| End Radius | 16m | AoE |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 175+ AoE | 175 (dmg in 1s) | 1.6 | adds | Big sub-1s AoE spirit hit |
| `stun` | 1s freeze | 1.0 (stun sec) | 2.0 | adds | Hard CC on the AoE |
| `aoe_cluster` | 16m | 90% | 1.8 | adds | Hits grouped enemies |
| `spirit_damage` | 175 + 0.7×SP | 49 (eff. SP) | 1.4 | relies | 175/5 + 0.7×20 = 49 |
| `spirit_proc` | AoE nuke | high | 1.3 | adds | Strong spirit effect |
| `engage` | freeze opens | 60% | 1.2 | adds | Initiation CC |
| `spirit_resistance` | +10% | 10 (eff. %) | 0.3 | adds | Token flat resist |

---

## Boundless Spirit
- **normalized_name**: `boundless_spirit` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_boundless_spirit`
- **wiki**: https://deadlock.wiki/Boundless_Spirit

### Interpretation
+15% Spirit Power, +30 flat SP, +75 HP, +4 OOC regen, pure passive. The cross-tier ceiling for `spirit_damage` and a `multi_ability_focus` staple.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Power | +15% | Passive multiplier |
| Spirit Power | +30 | Passive flat |
| Bonus Health | +75 | Passive |
| Out of Combat Regen | +4/sec | OOC |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +30 flat SP | 30 (eff. SP) | 0.8 | adds | Cross-tier ceiling for clean flat Spirit Power |
| `spirit_damage` | +15% SP multiplier | 30 (eff. SP eq.) | 0.8 | relies | Rewards stacking SP from other sources |
| `self_buff` | broad spirit up | 90% | 2.0 | adds | Universal spirit stat staple |
| `multi_ability_focus` | kit-wide | 80% | 1.6 | adds | Lifts every spirit ability |
| `high_max_hp` | +75 HP | 75 (flat HP) | 0.2 | adds | HP rider |
| `scaling_late` | compounds with SP | 70% | 2.0 | adds | % multiplier scales late |

---

## Cursed Relic
- **normalized_name**: `cursed_relic` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_cursed_relic`
- **wiki**: https://deadlock.wiki/Cursed_Relic

### Interpretation
-10% damage penalty; active (20m) silences AND disarms the target for 3.25s. The "Curse" tool — note it silences/disarms, it does NOT stun.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Damage Penalty | -10% | Downside |
| Silence | yes | 3.25s |
| Disarm | yes | 3.25s |
| Duration | 3.25s | — |
| Cast Range | 20m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `silence` | 3.25s | 3.25 (silence sec) | 1.4 | adds | Full caster lockout (Curse silence component) |
| `disarm` | 3.25s | 3.25 (disarm sec) | 0.1 | adds | Full gun lockout too |
| `counter_importance` | total shutdown | 100% | 2.0 | adds | Removes a target from the fight |
| `bullet_resistance` | disarm pseudo-credit | 30 (eff. %, 0.4× disarm) | 1.1 | adds | Disarmed enemy fires nothing |
| `spirit_resistance` | silence pseudo-credit | 10 (eff. %, 0.3× silence) | 0.3 | adds | Silenced enemy casts nothing |
| `bullet_damage` | -10% self penalty | -10 | -0.2 | adds | Real self downside |
| `single_target` | targeted | 70% | 1.6 | adds | One target, but full lockout |

---

## Echo Shard
- **normalized_name**: `echo_shard` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_echo_shard`
- **wiki**: https://deadlock.wiki/Echo_Shard

### Interpretation
+5% fire rate / spirit resist / bullet resist, and re-casts your last ability (NOT ults). Named anchor for `spirit_burst_proc` (double-cast) — doubles a key ability's burst.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +5% | Passive |
| Spirit Resist | +5% | Passive |
| Bullet Resist | +5% | Passive |
| Ability Recast | yes | Last ability; cannot recast ults |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_proc` | doubles an ability | 1.3 (burst index) | 2.0 | adds | Named anchor; re-casts for a second burst |
| `spirit_burst_damage` | double-cast burst | 60 | 0.6 | adds | Doubles a key ability's spike |
| `charge_dependant` | extra ability use | 1.0 (use eq.) | 0.0 | adds | Functions like a stored extra cast |
| `single_ability_focus` | repeats one ability | 90% | 1.8 | adds | Concentrates on the best ability |
| `ability_spam` | extra cast | 50% | 1.0 | adds | More casts per fight |
| `spirit_resistance` | +5% | 5 (eff. %) | 0.1 | adds | Token resist |
| `fire_rate` | +5% | 5 (eff. %) | 0.1 | adds | Token fire rate |

---

## Escalating Exposure
- **normalized_name**: `escalating_exposure` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_escalating_exposure`
- **wiki**: https://deadlock.wiki/Escalating_Exposure

### Interpretation
On spirit damage, applies -8% spirit resist and stacks +4.5% spirit amp per hit (12 stacks, 12s); +17% spirit resist passive. Named anchor for `spirit_continuous_proc` — rewards a constant stream of spirit damage.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Resist (debuff) | -8% | On spirit damage |
| Spirit Resist | +17% | Passive |
| Spirit Amp per Stack | +4.5% | 12 max = +54% |
| Max Stacks | 12 | — |
| Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_continuous_proc` | cd ~0.7s / 12s effect | 0.12 (cont. proc index) | 2.0 | adds | Named anchor; 100%/(0.7×12) per `tag_descriptions.md` |
| `spirit_resist_shred` | -8% + +54% amp stacked | 30 (eff. %, positive) | 2.0 | adds | Big stacked spirit amp (acts as shred) |
| `spirit_continuous_damage` | amp on sustained spirit | 50 (eff. total) | 0.7 | adds | Compounds over a fight |
| `spirit_resistance` | +17% | 17 (eff. %) | 0.5 | adds | Solid flat spirit resist |
| `counter_importance` | spirit amp enabler | 70% | 1.4 | adds | Cracks spirit-resistant targets |
| `scaling_late` | stacks compound | 60% | 1.7 | adds | Snowballs in long fights |

---

## Ethereal Shift
- **normalized_name**: `ethereal_shift` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_ethereal_shift`
- **wiki**: https://deadlock.wiki/Ethereal_Shift

### Interpretation
Active: become intangible/floating (4s, immune to damage), then buff +20 SP, +30% spirit resist, +3m move (5s). A defensive reset — but you're slowed/vulnerable after, so only a partial escape.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Duration | 4s | Intangible/float |
| Spirit Power | +20 | Buff, 5s |
| Spirit Resist | +30% | Buff, 5s |
| Move Speed | +3m | Buff, 5s |
| Float Speed | 2.5m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `bullet_evasion` | intangible 4s | 50% | 1.1 | adds | Damage-immune window (partial — vulnerable after) |
| `burst_resistance` | dodges a burst | 70% | 1.6 | adds | Negates a burst window |
| `spirit_burst_resistance` | dodges spirit burst | 60% | 0.8 | adds | Short-window spirit defense |
| `escape` | partial (slowed after) | 60% | 1.2 | adds | Not a full escape — team can converge after |
| `spirit_resistance` | +30% (buff) | 18 (eff. %) | 0.5 | adds | Windowed spirit resist |
| `counter_importance` | anti-burst | 80% | 1.6 | adds | Reaction tool |
| `spirit_damage` | +20 SP (buff) | 12 (eff. SP) | 0.3 | adds | Windowed SP |

---

## Focus Lens
- **normalized_name**: `focus_lens` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_focus_lens`
- **wiki**: https://deadlock.wiki/Focus_Lens

### Interpretation
+10% fire rate; active stores damage dealt and releases 30% as bonus on expire, while applying -9% spirit resist and -30 SP to the target (12s). A delayed-burst + spirit-debuff tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Fire Rate | +10% | Passive |
| Damage On Expire | 30% | Of stored damage |
| Spirit Resist (enemy) | -9% | 12s |
| Spirit Power (enemy) | -30 | 12s |
| Cast Range | 20m | — |
| Resist Reduction Duration | 12s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_resist_shred` | -9% on target, 12s | 9 (eff. %, positive) | 0.6 | adds | Single-target spirit shred, long uptime |
| `spirit_resistance` | -30 SP on enemy | 30 (eff. SP denied) | 0.9 | adds | Saps enemy spirit output |
| `burst_damage` | 30% stored release | 60% | 1.3 | adds | Delayed burst payout |
| `fire_rate` | +10% | 10 (eff. %) | 0.3 | adds | Fire rate rider |
| `counter_importance` | anti-spirit carry | 80% | 1.6 | adds | Cripples an enemy caster |
| `single_target` | targeted | 60% | 1.3 | adds | One target |

---

## Lightning Scroll
- **normalized_name**: `lightning_scroll` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_lightning_scroll`
- **wiki**: https://deadlock.wiki/Lightning_Scroll

### Interpretation
On spirit damage, applies a -30% move slow; +50 HP, +0.75m sprint; and a delayed (3s) 150-damage stun (0.75s). A spirit-applied slow + delayed stun nuke. (Single slow source — no double-count.)

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Move Speed (enemy) | -30% | On spirit damage |
| Bonus Health | +50 | Passive |
| Sprint Speed | +0.75m | Passive |
| Stun | yes | 0.75s |
| Damage | 150 | After 3s delay |
| Delay Before Effect | 3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `movement_slow` | -30% on spirit dmg | 30 (eff. %, positive) | 0.4 | adds | Spirit-applied slow (single source — not double-counted) |
| `stun` | 0.75s delayed | 0.75 (stun sec) | 1.5 | adds | Delayed hard CC |
| `spirit_burst_damage` | 150 on trigger | 150 (dmg in 1s) | 1.4 | adds | Burst spirit nuke |
| `spirit_continuous_proc` | spirit-gated slow | index | 1.0 | adds | Re-applied with spirit damage |
| `counter_importance` | anti-mobility | 60% | 1.2 | adds | Catches mobile targets |
| `high_max_hp` | +50 HP | 50 (flat HP) | 0.1 | adds | Token HP |

---

## Magic Carpet
- **normalized_name**: `magic_carpet` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_magic_carpet`
- **wiki**: https://deadlock.wiki/Magic_Carpet

### Interpretation
+15% duration, +125 HP, +14 SP, -15% gravity, +25% air control, and an active flying carpet (+7m fly speed, 12s). Named `escape` reference (mobility without slow penalty) + heavy air play.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Duration | +15% | Passive |
| Bonus Health | +125 | Passive |
| Spirit Power | +14 | Passive |
| Gravity Scale | -15% | Passive |
| Air Control | +25% | Passive |
| Bonus Fly Speed | +7m | Active, 12s |
| Summon Duration | 1.3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `escape` | flight, no slow penalty | 90% | 1.8 | adds | Clean long-range escape |
| `aerial` | +25% air control, flight | 90% | 2.0 | adds | Built for air play |
| `vertical_mobility` | flight + low gravity | 2.0 (traverse) | 0.1 | adds | Strong vertical/global mobility |
| `horizontal_mobility` | +7m fly | 1.5 (m/s eff.) | 0.7 | adds | Fast travel |
| `spirit_damage` | +14 SP | 14 (eff. SP) | 0.4 | adds | Flat SP |
| `high_max_hp` | +125 HP | 125 (flat HP) | 0.4 | adds | Good HP |
| `duration_dependant` | +15% | 15 (% duration) | 0.6 | adds | Duration up |

---

## Mercurial Magnum
- **normalized_name**: `mercurial_magnum` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_mercurial_magnum`
- **wiki**: https://deadlock.wiki/Mercurial_Magnum

### Interpretation
+20% ammo, +7 SP; converts shots to spirit (25 +0.49×SP, 60 +0.16×SP), +22% fire rate, instant reload. The iconic `hybrid_damage_usage` double-dipper — gun and spirit at once.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Ammo | +20% | Passive |
| Spirit Power | +7 | Passive |
| Bonus Damage | +25 base + 0.49×Spirit Power | Per shot |
| Spirit Damage | 60 base + 0.16×Spirit Power | — |
| Fire Rate | +22% | — |
| Bullets Reloaded | 100% | Instant reload |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `hybrid_damage_usage` | gun shots deal spirit | 100% | 2.0 | adds | Iconic double-dipper (named anchor) |
| `fire_rate` | +22% | 22 (eff. %) | 0.7 | adds | Strong fire rate |
| `spirit_damage` | 25/60 + scaling | 30 (eff. SP) | 0.8 | relies | (85)/5 + 0.65×20 ≈ 30; scales with SP |
| `magazine_size_dependant` | +20% + instant reload | 35 (eff. ammo %) | 0.3 | adds | Ammo + instant reload |
| `bullet_proc` | per-shot spirit | high | 1.3 | adds | Every shot procs spirit |
| `gun_continuous_damage` | sustained hybrid | 30 | 0.6 | adds | Sustained DPS |

---

## Mystic Reverb
- **normalized_name**: `mystic_reverb` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_mystic_reverb`
- **wiki**: https://deadlock.wiki/Mystic_Reverb

### Interpretation
+8% spirit lifesteal, and abilities echo 50% bonus damage in a 16m radius, grant +22% imbued lifesteal, and apply a -40% slow (3s delay). A spirit-burst amplifier + AoE slow.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Lifesteal | +8% | Passive |
| Echo Damage | 50% | Conditional, 16m |
| Imbued Lifesteal | +22% | Conditional |
| Move Speed (enemy) | -40% | Conditional |
| Radius | 16m | — |
| Delay Duration | 3s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 50% echo | 60 | 0.6 | adds | Amplifies ability burst |
| `aoe_cluster` | 16m echo | 80% | 1.6 | adds | AoE echo damage |
| `movement_slow` | -40%, delayed | 30 (eff. %, positive) | 0.4 | adds | AoE slow on the echo |
| `spirit_lifesteal` | +8% + 22% imbued | 18 (eff. %) | 0.4 | adds | Strong spirit sustain |
| `spirit_proc` | ability echo | high | 1.3 | adds | Spirit amplification proc |
| `spirit_continuous_damage` | repeated echoes | 50 | 0.7 | adds | Sustained spirit |

---

## Refresher
- **normalized_name**: `refresher` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_refresher`
- **wiki**: https://deadlock.wiki/Refresher

### Interpretation
Active: instantly resets all your ability and item cooldowns. Named anchor for `ult_focused` — a second full rotation including your ult.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Cooldown Reset | all abilities + items | Active |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ult_focused` | resets ult | 100% | 2.0 | adds | Named anchor; doubles your ult in a fight |
| `cooldown_reduction` | full reset | 60 (eff. %, burst) | 2.0 | adds | Effectively a huge one-shot CDR |
| `ability_spam` | second full rotation | 90% | 1.8 | adds | Doubles your combo |
| `charge_dependant` | extra full kit use | 80% | 1.6 | adds | Like a stored second rotation |
| `multi_ability_focus` | resets everything | 80% | 1.6 | adds | Affects the whole kit + items |
| `scaling_late` | big-ult payoff | 70% | 2.0 | adds | Scales with ult impact |

---

## Scourge
- **normalized_name**: `scourge` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_scourge`
- **wiki**: https://deadlock.wiki/Scourge

### Interpretation
+100 HP, +17% debuff resist; active (35m, 10m aura) deals 3.5% max HP/s and grants +40% spirit resist (10s). A %max-HP anti-tank aura with a defensive rider.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bonus Health | +100 | Passive |
| Debuff Resist | +17% | Passive |
| %HP Damage | 3.5%/s | Aura |
| Spirit Resist | +40% | Conditional, 10s |
| Duration | 10s | — |
| Cast Range | 35m | — |
| Aura Radius | 10m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 3.5% max HP/s | 90% | 2.0 | adds | %max-HP damage — signature anti-tank |
| `spirit_continuous_damage` | %HP DoT over 10s | 60 (eff. total) | 0.8 | adds | Sustained spirit aura damage |
| `aoe_cluster` | 10m aura | 70% | 1.4 | adds | Hits grouped enemies |
| `spirit_resistance` | +40% (active) | 28 (eff. %) | 0.8 | adds | Strong windowed spirit resist |
| `counter_importance` | anti-tank | 90% | 1.8 | adds | Bought vs big-HP enemies |
| `debuff_resistance` | +17% | 17 (eff. %) | 0.3 | adds | Solid debuff resist |
| `high_max_hp` | +100 HP | 100 (flat HP) | 0.3 | adds | Good HP |

---

## Spirit Burn
- **normalized_name**: `spirit_burn` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_spirit_burn`
- **wiki**: https://deadlock.wiki/Spirit_Burn

### Interpretation
+6% range; after dealing 500 spirit damage, explodes for 110 + a 24 (+0.06×SP)/s burn and applies -70% healing reduction (8s). Named anchor for `anti_heal` and a `spirit_continuous_proc`.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +6% | Passive |
| Damage Threshold | 500 | Trigger |
| Explosion Damage | 110 | On trigger |
| Burn DoT | 24 base + 0.06×Spirit Power | Per second |
| Explosion Radius | 12m | — |
| Debuff Duration | 8s | — |
| Healing Reduction | -70% | 8s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `anti_heal` | -70%, 8s | 70 (eff. %, positive) | 1.8 | adds | Strongest heal cut in the set (named anchor) |
| `spirit_continuous_proc` | no cd, 500dmg/5s, 8s effect | 0.06 (cont. proc index) | 1.0 | adds | 100%/((10/5)×8) per `tag_descriptions.md` |
| `spirit_continuous_damage` | burn over 8s | 110+ (eff. total) | 1.5 | adds | Sustained spirit DoT + explosion |
| `dot` | burn | 110 | 1.5 | adds | Status burn |
| `aoe_cluster` | 12m explosion | 70% | 1.4 | adds | AoE explosion |
| `counter_importance` | anti-sustain | 100% | 2.0 | adds | Bought vs healing comps |
| `spirit_damage` | explosion + burn | 40 (eff. SP) | 1.1 | relies | Converted spirit damage |

---

## Transcendent Cooldown
- **normalized_name**: `transcendent_cooldown` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_transcendent_cooldown`
- **wiki**: https://deadlock.wiki/Transcendent_Cooldown

### Interpretation
+4 OOC regen, +25% ability cooldown reduction AND +25% item cooldown reduction. The absolute ceiling for `cooldown_reduction` — uniquely covers item cooldowns too.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Out of Combat Regen | +4/sec | OOC |
| Ability Cooldown Reduction | +25% | Passive |
| Item Cooldown Reduction | +25% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `cooldown_reduction` | +25% ability + 25% item | 30 (eff. %) | 1.0 | adds | Highest credit — covers item cooldowns too |
| `ability_spam` | more casts | 100% | 2.0 | adds | Drives cast + item frequency |
| `multi_ability_focus` | kit + items | 90% | 1.8 | adds | Lowers everything |
| `ult_focused` | shortens ult | 50% | 1.0 | adds | Helps ult uptime |

---

## Vortex Web
- **normalized_name**: `vortex_web` · **tier**: 4 (6400) · **category**: Spirit · **codename**: `upgrade_vortex_web`
- **wiki**: https://deadlock.wiki/Vortex_Web

### Interpretation
+8% range, +0.75m sprint; active creates a 12m capture zone applying -35% slow and -40% dash (4s). Named anchor for `trap_block_obstruct`/`displace` — the closest item to a root/trap.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range | +8% | Passive |
| Sprint Speed | +0.75m | Passive |
| Capture Radius | 12m | Active |
| Move Speed (enemy) | -35% | Conditional, 4s |
| Dash Distance (enemy) | -40% | Conditional |
| Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `trap_block_obstruct` | 12m capture zone, 4s | 90% | 2.0 | adds | Closest thing to a root/trap (named anchor) |
| `displace` | pulls/holds in zone | 70% | 2.0 | adds | Closest item to a displacement tool |
| `movement_slow` | -35% + -40% dash, AoE | 40 (eff. %, positive) | 0.6 | adds | Strong AoE zone slow |
| `aoe_cluster` | 12m zone | 80% | 1.6 | adds | Holds grouped enemies |
| `counter_importance` | anti-mobility | 90% | 1.8 | adds | Locks down mobile enemies |
| `engage` | zone locks for collapse | 70% | 1.4 | adds | Team-fight setup |
| `range_extender_dependant` | +8% range | 8 (% range, add) | 0.2 | adds | Range rider |

---

# T? (9999 souls — Street Brawl / non-standard)

> **Pass-2 note:** Street Brawl items ARE scored, but they are EXCLUDED from the 2.0 cross-tier
> anchor and the tier ladder, and capped at 1.5 normalized. Their comparative raws below are
> still authored honestly (often very high) — the cap is applied during normalization, not here.

## Haunting Shot
- **normalized_name**: `haunting_shot` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_haunting_shot`
- **wiki**: https://deadlock.wiki/Haunting_Shot

### Interpretation
A bullet that deals 10% current-HP damage and applies a heavy debuff: -40% damage, -40% healing, -40% move/dash (4s). An all-in-one anti-everything bullet (Street Brawl).

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Current Health Damage | 10% | Per shot |
| Damage Penalty (enemy) | -40% | 4s |
| Healing Reduction (enemy) | -40% | 4s |
| Move Speed (enemy) | -40% | — |
| Dash Distance (enemy) | -40% | — |
| Bullet Radius | 1.5m | — |
| Debuff Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 10% current HP | 80% | 1.5 | adds | %current-HP bypasses HP pools |
| `anti_heal` | -40%, 4s | 40 (eff. %, positive) | 1.0 | adds | Strong heal cut |
| `movement_slow` | -40%, 4s | 40 (eff. %, positive) | 0.6 | adds | Strong slow |
| `debuff` | -40% damage | 80% | 1.5 | adds | Heavy enemy-damage cripple |
| `counter_importance` | anti-everything | 90% | 1.5 | adds | Multi-purpose counter |
| `bullet_resist_shred` | — | 0 | 0.0 | adds | (not a resist shred) |

---

## Infinite Rounds
- **normalized_name**: `infinite_rounds` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_infinite_rounds`
- **wiki**: https://deadlock.wiki/Infinite_Rounds

### Interpretation
+200% bullet velocity, +35% fire rate, and a 65% proc (Street Brawl gun-amp). Extreme sustained DPS.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Bullet Velocity | +200% | Passive |
| Fire Rate | +35% | Passive |
| Proc Chance | 65% | Per bullet |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `fire_rate` | +35% | 35 (eff. %) | 1.0 | adds | High fire rate |
| `gun_continuous_damage` | sustained + proc | 40 | 0.8 | adds | Extreme sustained DPS |
| `bullet_proc` | 65% per bullet | high | 1.3 | adds | Frequent proc |
| `long_range` | +200% velocity | 60% | 1.2 | adds | Lands ranged shots |
| `gun_burst_damage` | per-shot | 20 | 0.3 | adds | Propagation |

---

## Runed Gauntlets
- **normalized_name**: `runed_gauntlets` · **tier**: ? (9999) · **category**: Weapon · **codename**: `upgrade_runed_gauntlets`
- **wiki**: https://deadlock.wiki/Runed_Gauntlets

### Interpretation
+150% heavy melee distance, +50% melee resist, +30% melee damage, and 16% CDR on hit. A Street Brawl melee monster.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heavy Melee Distance | +150% | Passive |
| Melee Resist | +50% | Passive |
| Melee Damage | +30% | Passive |
| Cooldown Reduction on Hit | 16% | Min 4s |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `melee_damage` | +30% + reach | 30 (eff. %) | 0.3 | adds | Strong melee amp |
| `melee_resistance` | +50% | 50 (eff. %) | 0.9 | adds | Huge melee defense |
| `cooldown_reduction` | 16% on hit | 16 (eff. %) | 0.5 | adds | Melee-driven CDR |
| `close_range` | heavy melee | 80% | 1.5 | adds | Point-blank |
| `engage` | extended reach | 70% | 1.4 | adds | Gap-closing heavy |
| `grounded` | melee | 60% | 1.5 | adds | Implicit |

---

## Celestial Blessing
- **normalized_name**: `celestial_blessing` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_celestial_blessing`
- **wiki**: https://deadlock.wiki/Celestial_Blessing

### Interpretation
Active heals 60% (min 400) and grants +100% stamina recovery and +5m move (6s). A Street Brawl burst heal + mobility.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Heal Amount | 60% | Of max HP |
| Min. Heal | 400 | — |
| Stamina Recovery | +100% | 6s |
| Move Speed | +5m | 6s |
| Buff Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `burst_heal` | 60% / min 400 | 400 (HP in 1s) | 0.9 | adds | Big emergency heal |
| `self_heal` | 60% max HP | 400 (total HP) | 0.8 | adds | Large self-restore |
| `horizontal_mobility` | +5m (active) | 1.6 (m/s eff.) | 0.7 | adds | Strong move burst |
| `escape` | heal + speed | 70% | 1.4 | adds | Disengage/reset |
| `vertical_mobility` | +100% stamina regen | 1.0 (stamina) | 0.0 | adds | Fast stamina refresh |

---

## Cloak of Opportunity
- **normalized_name**: `cloak_of_opportunity` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_cloak_of_opportunity`
- **wiki**: https://deadlock.wiki/Cloak_of_Opportunity

### Interpretation
Grants a 500 barrier, +3m move, and 4s unstoppable (CC immunity). A Street Brawl bulwark/engage tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Barrier | 500 | Conditional |
| Move Speed | +3m | Conditional |
| Unstoppable Duration | 4s | CC immunity |
| Buff Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `shield` | 500 | 500 (shield HP) | 0.5 | adds | Solid barrier |
| `cc_resist` | 4s unstoppable | 80% | 1.2 | adds | CC-immunity window |
| `horizontal_mobility` | +3m | 1.2 (m/s eff.) | 0.5 | adds | Move burst |
| `engage` | immune commit | 70% | 1.4 | adds | Dive through CC |
| `damage_sponge` | barrier cushion | 50% | 1.1 | adds | Soaks damage |

---

## Electric Slippers
- **normalized_name**: `electric_slippers` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_electric_slippers`
- **wiki**: https://deadlock.wiki/Electric_Slippers

### Interpretation
+2 stamina, +80% slide distance, with slide-triggered AoE damage (100), evasion, and fire rate. A Street Brawl mobility/slide brawler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +2 | Passive |
| Slide Distance | +80% | Passive |
| Damage | 100 | Slide AoE, 12m |
| Evasion While Sliding | 60 | Conditional |
| Fire Rate While Sliding | 60% | Conditional |
| Radius | 12m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `vertical_mobility` | +2 stamina | 2.0 (stamina) | 0.1 | adds | Extra dashes/jumps |
| `horizontal_mobility` | +80% slide | 1.0 (m/s eff.) | 0.4 | adds | Slide mobility |
| `bullet_evasion` | 60 while sliding | 50% | 1.1 | adds | Conditional evasion |
| `fire_rate` | +60% sliding | 20 (eff. %, conditional) | 0.6 | adds | Slide-gated fire rate |
| `aoe_cluster` | 100 slide AoE | 50% | 1.0 | adds | Slide damage |
| `aerial` | slide/dash play | 50% | 1.1 | adds | Mobility flavor |

---

## Eternal Gift
- **normalized_name**: `eternal_gift` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_eternal_gift`
- **wiki**: https://deadlock.wiki/Eternal_Gift

### Interpretation
Periodic team buffs and -70% respawn time. A Street Brawl team-utility/economy item.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Buff Frequency | 2s | — |
| Respawn Time | -70% | Conditional |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ally_buff` | periodic team buffs | 70% | 1.5 | adds | Team-facing utility |
| `assist_importance` | team support | 60% | 1.2 | adds | Helps allies |
| `scaling_late` | -70% respawn | 60% | 1.5 | adds | Sustained presence late |
| `close_to_team` | team buffs | 50% | 1.2 | adds | Best with team |

---

## Nullification Burst
- **normalized_name**: `nullification_burst` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_nullification_burst`
- **wiki**: https://deadlock.wiki/Nullification_Burst

### Interpretation
+40% debuff resist, +300 HP; active AoE (20m) deals 250 (+0.47×SP) spirit damage (7s). A Street Brawl tank-nuke.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Debuff Resist | +40% | Passive |
| Bonus Health | +300 | Passive |
| Spirit Damage | 250 base + 0.47×Spirit Power | AoE |
| End Radius | 20m | — |
| Duration | 7s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 250+ AoE | 250 (dmg in 1s) | 1.5 | adds | Big AoE spirit hit |
| `aoe_cluster` | 20m | 90% | 1.5 | adds | Large AoE |
| `spirit_damage` | 250 + 0.47×SP | 59 (eff. SP) | 1.5 | relies | 250/5 + 0.47×20 = 59 |
| `debuff_resistance` | +40% | 40 (eff. %) | 0.6 | adds | Strong debuff resist |
| `high_max_hp` | +300 HP | 300 (flat HP) | 0.8 | adds | Big HP |

---

## Seraphim Wings
- **normalized_name**: `seraphim_wings` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_seraphim_wings`
- **wiki**: https://deadlock.wiki/Seraphim_Wings

### Interpretation
+120% stamina recovery, -70% gravity, +100% air control, +50% air accel, +40% in-air damage, -40% in-air damage taken. A Street Brawl flight/air-combat package.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina Recovery | +120% | Passive |
| Gravity Scale | -70% | Passive |
| Air Control | +100% | Passive |
| Air Acceleration | +50% | Passive |
| In Air Damage | +40% | Passive |
| In Air Damage Received | -40% | Passive |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `aerial` | full air package | 100% | 1.5 | adds | Built entirely around air play |
| `vertical_mobility` | low gravity + air control | 2.0 (traverse) | 0.1 | adds | Strong vertical freedom |
| `bullet_damage` | +40% in air | 30 (eff. %, air-gated) | 0.7 | adds | Air-conditional damage |
| `gun_burst_resistance` | -40% in-air dmg taken | 40% | 0.5 | adds | Air-conditional mitigation |
| `escape` | flight | 70% | 1.4 | adds | Air disengage |
| `horizontal_mobility` | air accel | 1.0 (m/s eff.) | 0.4 | adds | Fast air travel |

---

## Shadow Strike
- **normalized_name**: `shadow_strike` · **tier**: ? (9999) · **category**: Vitality · **codename**: `upgrade_shadow_strike`
- **wiki**: https://deadlock.wiki/Shadow_Strike

### Interpretation
+3 stamina, +350 HP; active deals 125 (+0.4×SP), goes invisible (3s), and steals 40% resist (6s). A Street Brawl flank/burst + resist-steal.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stamina | +3 | Passive |
| Bonus Health | +350 | Passive |
| Spirit Damage | 125 base + 0.4×Spirit Power | On strike |
| Invisibility Duration | 3s | — |
| Resist Stolen | 40% | 6s |
| Steal Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 125+ on strike | 125 (dmg in 1s) | 1.2 | adds | Burst spirit hit |
| `spirit_damage` | 125 + 0.4×SP | 33 (eff. SP) | 0.9 | relies | 125/5 + 0.4×20 = 33 |
| `away_from_team` | invis flank | 80% | 1.5 | adds | Flank/assassin tool |
| `engage` | invis strike | 80% | 1.5 | adds | Burst engage |
| `high_max_hp` | +350 HP | 350 (flat HP) | 1.0 | adds | Big HP |
| `spirit_resist_shred` | 40% resist steal | 40 (eff. %, positive) | 1.5 | adds | Steals enemy resist (you gain it) |
| `vertical_mobility` | +3 stamina | 3.0 (stamina) | 0.1 | adds | Mobility charges |

---

## Frostbite Charm
- **normalized_name**: `frostbite_charm` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_frostbite_charm`
- **wiki**: https://deadlock.wiki/Frostbite_Charm

### Interpretation
Imbues an ability with +50% CDR, +70 SP, and a 200-damage freeze (1s). A Street Brawl single-ability spirit amp + CC.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Imbued Ability Cooldown Reduction | +50% | — |
| Imbued Ability Spirit Power | +70 | — |
| Damage | 200 | — |
| Freeze Duration | 1s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_damage` | +70 imbued SP | 60 (eff. SP) | 1.5 | adds | Huge single-ability Spirit Power |
| `single_ability_focus` | one imbued ability | 100% | 1.5 | adds | Concentrates on one ability |
| `cooldown_reduction` | +50% imbued | 30 (eff. %, single-ability) | 1.0 | adds | Big single-ability CDR |
| `stun` | 1s freeze | 1.0 (stun sec) | 1.5 | adds | Hard CC on the imbued ability |
| `spirit_burst_damage` | 200 freeze hit | 200 (dmg in 1s) | 1.5 | adds | Burst on cast |

---

## Mystic Conduit
- **normalized_name**: `mystic_conduit` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_mystic_conduit`
- **wiki**: https://deadlock.wiki/Mystic_Conduit

### Interpretation
A team aura (25m): +40% ability range, +40% CDR to allies; plus a 700 heal aura (35m). A Street Brawl team-caster enabler.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Ability Range (aura) | +40% | 25m |
| Ability Cooldown Reduction (aura) | +40% | 25m |
| Ally Percentage | +50% | — |
| Heal Amount | 700 | 35m |
| Heal Radius | 35m | — |
| Damage Threshold | 300 | Trigger |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `ally_buff` | team CDR + range aura | 90% | 1.5 | adds | Big team-caster enabler |
| `team_heal` | 700 aura | 700 (to allies) | 1.5 | adds | Large team heal |
| `cooldown_reduction` | +40% (self + allies) | 30 (eff. %) | 1.0 | adds | Strong CDR (self share) |
| `range_extender_dependant` | +40% range | 40 (% range, add) | 1.2 | adds | Kit-wide range |
| `assist_importance` | team-facing | 90% | 1.5 | adds | Mostly ally value |
| `close_to_team` | auras | 80% | 1.5 | adds | Needs allies nearby |

---

## Mystical Piano
- **normalized_name**: `mystical_piano` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_mystical_piano`
- **wiki**: https://deadlock.wiki/Mystical_Piano

### Interpretation
Active AoE (12m) stun (2s) + daze after a 1.7s delay. A Street Brawl team-CC setup tool.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Stun Duration | 2s | — |
| Daze Duration | 2s | — |
| Stun Delay | 1.7s | — |
| Radius | 12m | AoE |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `stun` | 2s AoE | 2.0 (stun sec × AoE) | 1.5 | adds | Strong AoE hard CC |
| `aoe_cluster` | 12m | 80% | 1.5 | adds | Hits grouped enemies |
| `interrupt` | AoE stun cancels casts | 70% | 1.5 | adds | Denies channels |
| `engage` | AoE lockdown | 70% | 1.4 | adds | Team-fight initiation |
| `disarm` | stunned can't act | 50% | 1.3 | adds | Pseudo-disarm during stun |
| `bullet_resistance` | CC pseudo-credit | 20 (eff. %) | 0.7 | adds | Stunned enemies don't fire |

---

## Omnicharge Signet
- **normalized_name**: `omnicharge_signet` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_omnicharge_signet`
- **wiki**: https://deadlock.wiki/Omnicharge_Signet

### Interpretation
+70% faster charge regen, +30% CDR for charged abilities, +50 SP for charged abilities, +4 charged / +2 non-charged ability charges. A Street Brawl charge-stack engine.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Faster Time Between Charges | +70% | — |
| Cooldown Reduction (charged) | +30% | — |
| Spirit Power (charged) | +50 | — |
| Charged Ability | +4 | — |
| Non Charged Ability | +2 | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `charge_dependant` | +4/+2 charges + 70% regen | 4.0 (extra charges eq.) | 0.1 | adds | Extreme charge-stack supply |
| `charge_dependant` | useless off-kit | 100% | 1.5 | relies | Pure charge-ability synergy |
| `cooldown_reduction` | +30% charged | 30 (eff. %) | 1.0 | adds | Charged-ability CDR |
| `spirit_damage` | +50 SP (charged) | 40 (eff. SP) | 1.1 | adds | Big gated Spirit Power |
| `ability_spam` | many charges | 90% | 1.5 | adds | Spam charged abilities |
| `single_ability_focus` | charge ability | 70% | 1.4 | adds | Concentrates on charge abilities |

---

## Prism Blast
- **normalized_name**: `prism_blast` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_prism_blast`
- **wiki**: https://deadlock.wiki/Prism_Blast

### Interpretation
Active deals 270 (+1.8×SP) spirit damage (6s). A Street Brawl high-scaling spirit nuke.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Spirit Damage | 270 base + 1.8×Spirit Power | Active |
| Duration | 6s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `spirit_burst_damage` | 270+ | 270 (dmg in 1s) | 1.5 | adds | Big spirit nuke |
| `spirit_damage` | 270 + 1.8×SP | 90 (eff. SP) | 1.5 | relies | 270/5 + 1.8×20 = 90; scales massively with SP |
| `aoe_cluster` | blast | 60% | 1.2 | adds | Some area |
| `single_ability_focus` | one big nuke | 70% | 1.4 | adds | Concentrated burst |

---

## Shrink Ray
- **normalized_name**: `shrink_ray` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_shrink_ray`
- **wiki**: https://deadlock.wiki/Shrink_Ray

### Interpretation
Active (40m) shrinks the target -50% model scale while giving you +5m move, +20% fire rate (60s). A Street Brawl debuff/buff tool — small target = harder to hit you, easier to hit them.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Model Scale (enemy) | -50% | 60s |
| Move Speed | +5m | — |
| Fire Rate | +20% | — |
| Shrink Duration | 60s | — |
| Cast Range | 40m | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `debuff` | -50% model scale | 70% | 1.5 | adds | Shrinks the target's output/presence |
| `horizontal_mobility` | +5m | 1.6 (m/s eff.) | 0.7 | adds | Strong self move |
| `fire_rate` | +20% | 20 (eff. %) | 0.6 | adds | Self fire rate |
| `counter_importance` | shrinks a threat | 70% | 1.4 | adds | Neutralizes a key enemy |
| `single_target` | targeted | 60% | 1.3 | adds | One target |

---

## Unstable Concoction
- **normalized_name**: `unstable_concoction` · **tier**: ? (9999) · **category**: Spirit · **codename**: `upgrade_unstable_concoction`
- **wiki**: https://deadlock.wiki/Unstable_Concoction

### Interpretation
A self-buff/throwable: 30% max-HP AoE damage + 3s stun, with +10m move, +3000 temp HP, +150% weapon damage, +150 SP (4s, 22m). A Street Brawl all-out nuke + super-buff.

### Wiki stats
| Stat | Value | Notes |
|---|---|---|
| Max Health Damage | 30% | AoE |
| Stun Duration | 3s | — |
| Move Speed | +10m | Conditional |
| Bonus Health | +3000 | Conditional |
| Weapon Damage | +150% | — |
| Spirit Power | +150 | — |
| Radius | 22m | — |
| Duration | 4s | — |

### Calculator tags
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|---|
| `pure_damage` | 30% max HP AoE | 100% | 1.5 | adds | Massive %max-HP AoE |
| `stun` | 3s AoE | 3.0 (stun sec × AoE) | 1.5 | adds | Strong AoE hard CC |
| `bullet_damage` | +150% | 80 (eff. %, capped) | 1.5 | adds | Enormous weapon-damage buff |
| `spirit_damage` | +150 SP | 90 (eff. SP) | 1.5 | adds | Enormous Spirit Power |
| `high_max_hp` | +3000 temp | 300 (eff. HP) | 0.8 | adds | Huge temp HP |
| `aoe_cluster` | 22m | 90% | 1.5 | adds | Large AoE |
| `horizontal_mobility` | +10m | 2.0 (m/s eff.) | 0.9 | adds | Huge move burst |
| `engage` | all-in nuke | 90% | 1.5 | adds | Total commit tool |

# Audit: AI Normalized vs. existing JSON playstyle_score (Round 8)

**Generated by `_run_audit.py`** from the hand-authored `### Calculator tags` tables in this file vs each item's `data/items/<key>.json`. SUGGESTIONS ONLY — no JSON is modified.

**Blending convention**: `AI blended = adds + 0.25 × relies` per tag (same-mode rows summed first).

**Filtering**: a row appears only where |Diff| ≥ 0.15 OR one side is missing.

**Apply? column** (see AUDIT_SKILL.md §10): `[x]` = apply the AI blended value · `[ ]` = skip · a **number** (e.g. `0.8`) = force that exact value. Defaults: `[x]` for Bump/Cut/Add with |diff| ≤ 0.6; `[ ]` for Drops and for |diff| > 0.6.

## T1 (800 souls)

### Extended Magazine (`extended_magazine`, T1 Weapon)
Path: `data/items/extended_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_damage` | 0.30 | 0.50 | +0.20 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `scaling_early` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |

### Rapid Rounds (`rapid_rounds`, T1 Weapon)
Path: `data/items/rapid_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.00 | (drop) | +-0.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.25 | 0.90 | -0.35 | Cut JSON → 0.90 | `[x]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_target` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Close Quarters (`close_quarters`, T1 Weapon)
Path: `data/items/close_quarters.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.12 | 1.57 | +0.45 | Bump JSON → 1.57 | `[x]` |
| `close_range` | 1.25 | 1.60 | +0.35 | Bump JSON → 1.60 | `[x]` |
| `engage` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[.1]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[ ]` |
| `melee_resistance` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Headshot Booster (`headshot_booster`, T1 Weapon)
Path: `data/items/headshot_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.45 | 2.00 | +1.55 | Bump JSON → 2.00 | `[1.5]` |
| `gun_burst_proc` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `gun_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 1.25 | 1.60 | +0.35 | Bump JSON → 1.60 | `[x]` |
| `long_range` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `scaling_early` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[ ]` |

### High-Velocity Rounds (`high_velocity_rounds`, T1 Weapon)
Path: `data/items/high_velocity_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `close_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `headshot_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 1.62 | 0.80 | -0.82 | Cut JSON → 0.80 | `[ ]` |
| `mid_range` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |

### Monster Rounds (`monster_rounds`, T1 Weapon)
Path: `data/items/monster_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.25 | 0.00 | -0.25 | Cut JSON → 0.00 | `[x]` |
| `continous_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `lane_pusher` | 0.75 | 1.80 | +1.05 | Bump JSON → 1.80 | `[ ]` |
| `self_heal` | 0.20 | 0.00 | -0.20 | Cut JSON → 0.00 | `[x]` |

### Restorative Shot (`restorative_shot`, T1 Weapon)
Path: `data/items/restorative_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `bullet_lifesteal` | 0.60 | 1.20 | +0.60 | Bump JSON → 1.20 | `[x]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[ ]` |
| `scaling_early` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Extra Health (`extra_health`, T1 Vitality)
Path: `data/items/extra_health.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `damage_sponge` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `high_max_hp` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |

### Extra Regen (`extra_regen`, T1 Vitality)
Path: `data/items/extra_regen.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 1.50 | 0.30 | -1.20 | Cut JSON → 0.30 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `self_heal` | 1.50 | 0.00 | -1.50 | Cut JSON → 0.00 | `[ ]` |

### Extra Stamina (`extra_stamina`, T1 Vitality)
Path: `data/items/extra_stamina.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `escape` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `vertical_mobility` | 0.53 | 0.10 | -0.43 | Cut JSON → 0.10 | `[x]` |

### Healing Rite (`healing_rite`, T1 Vitality)
Path: `data/items/healing_rite.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.80 | 1.50 | +0.70 | Bump JSON → 1.50 | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.30 | 1.50 | +1.20 | Bump JSON → 1.50 | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `spirit_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |

### Melee Lifesteal (`melee_lifesteal`, T1 Vitality)
Path: `data/items/melee_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.25 | 0.90 | -0.35 | Cut JSON → 0.90 | `[x]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.05 | 1.30 | +0.25 | Bump JSON → 1.30 | `[x]` |

### Rebuttal (`rebuttal`, T1 Vitality)
Path: `data/items/rebuttal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.20 | 1.40 | +0.20 | Bump JSON → 1.40 | `[x]` |
| `damage_sponge` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `long_range` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.70 | 1.00 | +0.30 | Bump JSON → 1.00 | `[x]` |

### Sprint Boots (`sprint_boots`, T1 Vitality)
Path: `data/items/sprint_boots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `escape` | 0.30 | 0.80 | +0.50 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.85 | 1.50 | +0.65 | Bump JSON → 1.50 | `[ ]` |
| `self_heal` | 0.30 | 0.00 | -0.30 | Cut JSON → 0.00 | `[x]` |
| `small_hitbox` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |

### Extra Charge (`extra_charge`, T1 Spirit)
Path: `data/items/extra_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `charge_dependant` | 1.88 | 0.50 | -1.38 | Cut JSON → 0.50 | `[ ]` |
| `cooldown_reduction` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.60 | 1.20 | +0.60 | Bump JSON → 1.20 | `[x]` |
| `spirit_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Extra Spirit (`extra_spirit`, T1 Spirit)
Path: `data/items/extra_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `self_buff` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `single_ability_focus` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.50 | 0.90 | -0.60 | Cut JSON → 0.90 | `[x]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Golden Goose Egg (`golden_goose_egg`, T1 Spirit)
Path: `data/items/golden_goose_egg.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | -0.80 | -0.95 | Cut JSON → -0.80 | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `fire_rate` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | 0.80 | +0.47 | Bump JSON → 0.80 | `[x]` |
| `hybrid_damage_usage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.20 | 1.70 | +1.50 | Bump JSON → 1.70 | `[ ]` |
| `self_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | -0.90 | -1.10 | Cut JSON → -0.90 | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Burst (`mystic_burst`, T1 Spirit)
Path: `data/items/mystic_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `burst_damage` | 0.12 | (drop) | -0.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `single_ability_focus` | 0.62 | (drop) | -0.62 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.35 | 1.30 | +0.95 | Bump JSON → 1.30 | `[ ]` |

### Mystic Expansion (`mystic_expansion`, T1 Spirit)
Path: `data/items/mystic_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `multi_ability_focus` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `range_extender_dependant` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |
| `self_buff` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `single_ability_focus` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Regeneration (`mystic_regeneration`, T1 Spirit)
Path: `data/items/mystic_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.20 | 0.20 | -1.00 | Cut JSON → 0.20 | `[ ]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Rusted Barrel (`rusted_barrel`, T1 Spirit)
Path: `data/items/rusted_barrel.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `disarm` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `gun_continuous_resistance` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `high_max_hp` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `horizontal_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Strike (`spirit_strike`, T1 Spirit)
Path: `data/items/spirit_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 1.30 | +0.55 | Bump JSON → 1.30 | `[x]` |
| `mid_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.75 | 1.30 | +0.55 | Bump JSON → 1.30 | `[x]` |
| `spirit_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.40 | 1.15 | +0.75 | Bump JSON → 1.15 | `[ ]` |
| `spirit_resist_shred` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[ ]` |

## T2 (1600 souls)

### Active Reload (`active_reload`, T2 Weapon)
Path: `data/items/active_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.90 | 1.20 | +0.30 | Bump JSON → 1.20 | `[x]` |
| `gun_burst_damage` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_damage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.90 | 1.10 | +0.20 | Bump JSON → 1.10 | `[x]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Fleetfoot (`fleetfoot`, T2 Weapon)
Path: `data/items/fleetfoot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `cc_resist` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |

### Intensifying Magazine (`intensifying_magazine`, T2 Weapon)
Path: `data/items/intensifying_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | -0.05 | 0.50 | +0.55 | Bump JSON → 0.50 | `[x]` |
| `gun_burst_damage` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_damage` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.85 | 0.40 | -0.45 | Cut JSON → 0.40 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Kinetic Dash (`kinetic_dash`, T2 Weapon)
Path: `data/items/kinetic_dash.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.70 | 1.10 | +0.40 | Bump JSON → 1.10 | `[x]` |
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.60 | 0.80 | +0.20 | Bump JSON → 0.80 | `[x]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.70 | 1.10 | +0.40 | Bump JSON → 1.10 | `[x]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |

### Long Range (`long_range`, T2 Weapon)
Path: `data/items/long_range.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `anti_air` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.00 | 2.10 | +1.10 | Bump JSON → 2.10 | `[ ]` |
| `close_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |
| `melee_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.40 | 1.30 | +0.90 | Bump JSON → 1.30 | `[ ]` |

### Melee Charge (`melee_charge`, T2 Weapon)
Path: `data/items/melee_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | 2.00 | +1.60 | Bump JSON → 2.00 | `[ ]` |
| `gun_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.50 | 1.02 | -0.48 | Cut JSON → 1.02 | `[x]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Shot (`mystic_shot`, T2 Weapon)
Path: `data/items/mystic_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.15 | 1.30 | +1.15 | Bump JSON → 1.30 | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `spirit_burst_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Opening Rounds (`opening_rounds`, T2 Weapon)
Path: `data/items/opening_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.15 | 0.90 | -0.25 | Cut JSON → 0.90 | `[x]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.33 | 0.80 | +0.47 | Bump JSON → 0.80 | `[x]` |
| `mid_range` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `self_buff` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `spirit_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |

### Recharging Rush (`recharging_rush`, T2 Weapon)
Path: `data/items/recharging_rush.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `charge_dependant` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00 | `[ ]` |
| `horizontal_mobility` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `hybrid_damage_usage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 1.07 | 0.60 | -0.47 | Cut JSON → 0.60 | `[x]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Slowing Bullets (`slowing_bullets`, T2 Weapon)
Path: `data/items/slowing_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `bullet_proc` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.10 | 1.10 | +1.00 | Bump JSON → 1.10 | `[ ]` |

### Spirit Shredder Bullets (`spirit_shredder_bullets`, T2 Weapon)
Path: `data/items/spirit_shredder_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00 | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.07 | (drop) | -0.07 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.75 | 1.40 | -0.35 | Cut JSON → 1.40 | `[x]` |
| `self_heal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.90 | 0.30 | -0.60 | Cut JSON → 0.30 | `[ ]` |
| `spirit_resist_shred` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |

### Split Shot (`split_shot`, T2 Weapon)
Path: `data/items/split_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[ ]` |
| `bullet_damage` | 0.93 | 1.20 | +0.27 | Bump JSON → 1.20 | `[x]` |
| `bullet_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | 1.60 | +1.50 | Bump JSON → 1.60 | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[x]` |
| `headshot_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | 1.30 | +0.97 | Bump JSON → 1.30 | `[ ]` |
| `scaling_late` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Stalker (`stalker`, T2 Weapon)
Path: `data/items/stalker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.66 | 1.60 | +0.94 | Bump JSON → 1.60 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[x]` |
| `close_range` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.15 | 0.90 | +0.75 | Bump JSON → 0.90 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80 | `[ ]` |
| `high_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.80 | (drop) | +0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |

### Swift Striker (`swift_striker`, T2 Weapon)
Path: `data/items/swift_striker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.10 | 1.30 | +0.20 | Bump JSON → 1.30 | `[x]` |
| `gun_burst_damage` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_damage` | 0.66 | 0.90 | +0.24 | Bump JSON → 0.90 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Titanic Magazine (`titanic_magazine`, T2 Weapon)
Path: `data/items/titanic_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.15 | 0.70 | -0.45 | Cut JSON → 0.70 | `[x]` |
| `gun_burst_damage` | 0.60 | 0.20 | -0.40 | Cut JSON → 0.20 | `[x]` |
| `gun_continuous_damage` | 0.40 | 0.90 | +0.50 | Bump JSON → 0.90 | `[x]` |

### Weakening Headshot (`weakening_headshot`, T2 Weapon)
Path: `data/items/weakening_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.75 | 0.25 | -0.50 | Cut JSON → 0.25 | `[x]` |
| `single_target` | 0.40 | 1.10 | +0.70 | Bump JSON → 1.10 | `[ ]` |

### Battle Vest (`battle_vest`, T2 Vitality)
Path: `data/items/battle_vest.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `gun_burst_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |

### Bullet Lifesteal (`bullet_lifesteal`, T2 Vitality)
Path: `data/items/bullet_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[x]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[ ]` |
| `damage_sponge` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.80 | 0.00 | -0.80 | Cut JSON → 0.00 | `[ ]` |
| `spirit_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Debuff Reducer (`debuff_reducer`, T2 Vitality)
Path: `data/items/debuff_reducer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[ ]` |
| `counter_importance` | 0.80 | 1.60 | +0.80 | Bump JSON → 1.60 | `[ ]` |
| `debuff_resistance` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[ ]` |
| `high_max_hp` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Enchanters Emblem (`enchanters_emblem`, T2 Vitality)
Path: `data/items/enchanters_emblem.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cooldown_reduction` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.40 | 1.40 | +1.00 | Bump JSON → 1.40 | `[ ]` |
| `spirit_resistance` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |

### Enduring Speed (`enduring_speed`, T2 Vitality)
Path: `data/items/enduring_speed.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `vertical_mobility` | 0.25 | 2.00 | +1.75 | Bump JSON → 2.00 | `[ ]` |

### Guardian Ward (`guardian_ward`, T2 Vitality)
Path: `data/items/guardian_ward.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00 | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `self_heal` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 1.25 | 0.60 | -0.65 | Cut JSON → 0.60 | `[ ]` |
| `team_heal` | 0.70 | 1.90 | +1.20 | Bump JSON → 1.90 | `[ ]` |

### Healbane (`healbane`, T2 Vitality)
Path: `data/items/healbane.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00 | `[ ]` |
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.33 | 1.10 | +0.77 | Bump JSON → 1.10 | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | 0.60 | +0.50 | Bump JSON → 0.60 | `[x]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Booster (`healing_booster`, T2 Vitality)
Path: `data/items/healing_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `bullet_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.30 | 0.40 | -0.90 | Cut JSON → 0.40 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.75 | 0.20 | -1.55 | Cut JSON → 0.20 | `[ ]` |
| `spirit_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |

### Reactive Barrier (`reactive_barrier`, T2 Vitality)
Path: `data/items/reactive_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `cc_resist` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `damage_sponge` | 1.10 | 2.00 | +0.90 | Bump JSON → 2.00 | `[ ]` |
| `debuff_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Restorative Locket (`restorative_locket`, T2 Vitality)
Path: `data/items/restorative_locket.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.80 | 1.20 | +0.40 | Bump JSON → 1.20 | `[x]` |
| `damage_sponge` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `vertical_mobility` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |

### Return Fire (`return_fire`, T2 Vitality)
Path: `data/items/return_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.20 | 2.00 | +0.80 | Bump JSON → 2.00 | `[ ]` |
| `damage_sponge` | 1.12 | 2.00 | +0.88 | Bump JSON → 2.00 | `[ ]` |
| `disarm` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `mid_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Lifesteal (`spirit_lifesteal`, T2 Vitality)
Path: `data/items/spirit_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.60 | 2.00 | +1.40 | Bump JSON → 2.00 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.80 | 0.00 | -0.80 | Cut JSON → 0.00 | `[ ]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[ ]` |

### Spirit Shielding (`spirit_shielding`, T2 Vitality)
Path: `data/items/spirit_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `damage_sponge` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.10 | (drop) | -1.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[ ]` |
| `spirit_burst_resistance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `spirit_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Weapon Shielding (`weapon_shielding`, T2 Vitality)
Path: `data/items/weapon_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.80 | 1.10 | +0.30 | Bump JSON → 1.10 | `[x]` |
| `burst_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `damage_sponge` | 0.80 | 1.60 | +0.80 | Bump JSON → 1.60 | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Arcane Surge (`arcane_surge`, T2 Spirit)
Path: `data/items/arcane_surge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `aerial` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.30 | 0.90 | +0.60 | Bump JSON → 0.90 | `[ ]` |
| `engage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.30 | 0.50 | +0.20 | Bump JSON → 0.50 | `[x]` |
| `single_ability_focus` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.90 | +0.40 | Bump JSON → 0.90 | `[x]` |
| `vertical_mobility` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |

### Bullet Resist Shredder (`bullet_resist_shredder`, T2 Spirit)
Path: `data/items/bullet_resist_shredder.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `bullet_resist_shred` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `bullet_resistance` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `high_max_hp` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Cold Front (`cold_front`, T2 Spirit)
Path: `data/items/cold_front.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `assist_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
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
| `scaling_early` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.80 | 2.00 | +1.20 | Bump JSON → 2.00 | `[ ]` |
| `spirit_burst_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.72 | 0.45 | -0.27 | Cut JSON → 0.45 | `[x]` |
| `spirit_proc` | 0.10 | 1.30 | +1.20 | Bump JSON → 1.30 | `[ ]` |

### Compress Cooldown (`compress_cooldown`, T2 Spirit)
Path: `data/items/compress_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `charge_dependant` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | 1.60 | +1.30 | Bump JSON → 1.60 | `[ ]` |
| `single_ability_focus` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |

### Duration Extender (`duration_extender`, T2 Spirit)
Path: `data/items/duration_extender.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `self_buff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_ability_focus` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Improved Spirit (`improved_spirit`, T2 Spirit)
Path: `data/items/improved_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `self_buff` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `self_heal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.33 | 1.10 | -0.23 | Cut JSON → 1.10 | `[x]` |
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
| `cooldown_reduction` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `counter_importance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.15 | 0.80 | -0.35 | Cut JSON → 0.80 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 1.20 | 1.00 | -0.20 | Cut JSON → 1.00 | `[x]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Vulnerability (`mystic_vulnerability`, T2 Spirit)
Path: `data/items/mystic_vulnerability.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | 1.20 | +0.87 | Bump JSON → 1.20 | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | 1.60 | +1.27 | Bump JSON → 1.60 | `[ ]` |
| `debuff` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |

### Quicksilver Reload (`quicksilver_reload`, T2 Spirit)
Path: `data/items/quicksilver_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.45 | 0.70 | +0.25 | Bump JSON → 0.70 | `[x]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `single_ability_focus` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.40 | 0.20 | -0.20 | Cut JSON → 0.20 | `[x]` |
| `spirit_proc` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |

### Slowing Hex (`slowing_hex`, T2 Spirit)
Path: `data/items/slowing_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00 | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `displace` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.30 | 1.20 | +0.90 | Bump JSON → 1.20 | `[ ]` |
| `horizontal_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

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
| `counter_importance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `long_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `spirit_burst_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.85 | 1.40 | +0.55 | Bump JSON → 1.40 | `[x]` |
| `spirit_resistance` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |

### Suppressor (`suppressor`, T2 Spirit)
Path: `data/items/suppressor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.40 | 0.60 | +0.20 | Bump JSON → 0.60 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 1.60 | +0.30 | Bump JSON → 1.60 | `[x]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.33 | 1.20 | +0.87 | Bump JSON → 1.20 | `[ ]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
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
| `anti_heal` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `aoe_cluster` | 0.75 | 1.60 | +0.85 | Bump JSON → 1.60 | `[ ]` |
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.20 | 2.00 | +1.80 | Bump JSON → 2.00 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20 | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.20 | 2.00 | +0.80 | Bump JSON → 2.00 | `[ ]` |
| `spirit_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.40 | 0.82 | +0.42 | Bump JSON → 0.82 | `[x]` |
| `stun` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Ballistic Enchantment (`ballistic_enchantment`, T3 Weapon)
Path: `data/items/ballistic_enchantment.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 1.45 | 0.80 | -0.65 | Cut JSON → 0.80 | `[ ]` |
| `farmer` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `gun_burst_damage` | 0.65 | 0.10 | -0.55 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_ability_focus` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Berserker (`berserker`, T3 Weapon)
Path: `data/items/berserker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.65 | 1.40 | -0.25 | Cut JSON → 1.40 | `[x]` |
| `bullet_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `close_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `gun_continuous_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.50 | 1.70 | +1.20 | Bump JSON → 1.70 | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Blood Tribute (`blood_tribute`, T3 Weapon)
Path: `data/items/blood_tribute.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `gun_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.66 | 1.50 | +2.16 | Bump JSON → 1.50 | `[ ]` |
| `self_heal` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |

### Burst Fire (`burst_fire`, T3 Weapon)
Path: `data/items/burst_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | 0.90 | +0.15 | Bump JSON → 0.90 | `[x]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |

### Cultist Sacrifice (`cultist_sacrifice`, T3 Weapon)
Path: `data/items/cultist_sacrifice.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |

### Escalating Resilience (`escalating_resilience`, T3 Weapon)
Path: `data/items/escalating_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `damage_sponge` | 0.72 | 1.10 | +0.38 | Bump JSON → 1.10 | `[x]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Express Shot (`express_shot`, T3 Weapon)
Path: `data/items/express_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `bullet_damage` | 0.40 | 0.70 | +0.30 | Bump JSON → 0.70 | `[x]` |
| `burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `gun_burst_proc` | 0.60 | 2.00 | +1.40 | Bump JSON → 2.00 | `[ ]` |
| `gun_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | 1.40 | +1.55 | Bump JSON → 1.40 | `[ ]` |
| `long_range` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `magazine_size_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |

### Headhunter (`headhunter`, T3 Weapon)
Path: `data/items/headhunter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 1.75 | 1.03 | -0.72 | Cut JSON → 1.03 | `[ ]` |
| `high_kill_count` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `high_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `self_heal` | 0.80 | 0.20 | -0.60 | Cut JSON → 0.20 | `[ ]` |
| `single_target` | 0.40 | 1.80 | +1.40 | Bump JSON → 1.80 | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Heroic Aura (`heroic_aura`, T3 Weapon)
Path: `data/items/heroic_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `assist_importance` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `lane_pusher` | 2.00 | 1.80 | -0.20 | Cut JSON → 1.80 | `[x]` |
| `range_extender_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spawn_minions` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Hollow Point (`hollow_point`, T3 Weapon)
Path: `data/items/hollow_point.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.30 | 0.90 | -0.40 | Cut JSON → 0.90 | `[x]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.65 | 0.30 | -0.35 | Cut JSON → 0.30 | `[x]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | 0.70 | +0.30 | Bump JSON → 0.70 | `[x]` |
| `gun_continuous_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 1.32 | 0.50 | -0.82 | Cut JSON → 0.50 | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Hunters Aura (`hunters_aura`, T3 Weapon)
Path: `data/items/hunters_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[ ]` |
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 1.30 | 1.00 | -0.30 | Cut JSON → 1.00 | `[x]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `counter_importance` | 0.80 | 1.60 | +0.80 | Bump JSON → 1.60 | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Point Blank (`point_blank`, T3 Weapon)
Path: `data/items/point_blank.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | 1.55 | +0.80 | Bump JSON → 1.55 | `[ ]` |
| `close_range` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `engage` | 0.50 | 1.40 | +0.90 | Bump JSON → 1.40 | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.65 | (drop) | -0.65 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.25 | (drop) | +1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `melee_resistance` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[ ]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Sharpshooter (`sharpshooter`, T3 Weapon)
Path: `data/items/sharpshooter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | 1.10 | +0.95 | Bump JSON → 1.10 | `[ ]` |
| `bullet_damage` | 0.75 | 2.10 | +1.35 | Bump JSON → 2.10 | `[ ]` |
| `close_range` | -1.00 | -0.40 | +0.60 | Bump JSON → -0.40 | `[x]` |
| `gun_burst_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `headshot_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[ ]` |
| `spirit_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Rend (`spirit_rend`, T3 Weapon)
Path: `data/items/spirit_rend.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | 1.60 | +1.45 | Bump JSON → 1.60 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 1.40 | +1.25 | Bump JSON → 1.40 | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.66 | 0.20 | -0.46 | Cut JSON → 0.20 | `[x]` |
| `spirit_resist_shred` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |

### Tesla Bullets (`tesla_bullets`, T3 Weapon)
Path: `data/items/tesla_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[ ]` |
| `fire_rate` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `hybrid_damage_usage` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00 | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | 0.70 | +0.60 | Bump JSON → 0.70 | `[x]` |
| `spirit_continuous_proc` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |

### Toxic Bullets (`toxic_bullets`, T3 Weapon)
Path: `data/items/toxic_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.15 | 1.30 | +0.15 | Bump JSON → 1.30 | `[x]` |
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | 0.45 | +0.30 | Bump JSON → 0.45 | `[x]` |
| `gun_burst_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.20 | 1.00 | -0.20 | Cut JSON → 1.00 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | 0.03 | -0.22 | Cut JSON → 0.03 | `[x]` |

### Weighted Shots (`weighted_shots`, T3 Weapon)
Path: `data/items/weighted_shots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `debuff` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.45 | 0.70 | +0.25 | Bump JSON → 0.70 | `[x]` |
| `gun_continuous_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Bullet Resilience (`bullet_resilience`, T3 Vitality)
Path: `data/items/bullet_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `damage_sponge` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `gun_burst_resistance` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |

### Counterspell (`counterspell`, T3 Vitality)
Path: `data/items/counterspell.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.75 | 1.10 | +0.35 | Bump JSON → 1.10 | `[x]` |
| `close_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.15 | 1.70 | +0.55 | Bump JSON → 1.70 | `[x]` |
| `spirit_continuous_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `spirit_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Dispel Magic (`dispel_magic`, T3 Vitality)
Path: `data/items/dispel_magic.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `cc_resist` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `debuff_resistance` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00 | `[ ]` |
| `escape` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.10 | 0.70 | +0.60 | Bump JSON → 0.70 | `[x]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Fortitude (`fortitude`, T3 Vitality)
Path: `data/items/fortitude.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `counter_importance` | 0.01 | (drop) | -0.01 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 2.00 | 1.60 | -0.40 | Cut JSON → 1.60 | `[x]` |
| `horizontal_mobility` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `large_hitbox` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `scaling_late` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Fury Trance (`fury_trance`, T3 Vitality)
Path: `data/items/fury_trance.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `aerial` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.70 | 1.00 | +0.30 | Bump JSON → 1.00 | `[x]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `horizontal_mobility` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.70 | 0.10 | -0.60 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `vertical_mobility` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Nova (`healing_nova`, T3 Vitality)
Path: `data/items/healing_nova.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `close_to_team` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |

### Lifestrike (`lifestrike`, T3 Vitality)
Path: `data/items/lifestrike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.68 | 0.50 | -0.18 | Cut JSON → 0.50 | `[x]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `melee_damage` | 1.88 | 0.45 | -1.43 | Cut JSON → 0.45 | `[ ]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Majestic Leap (`majestic_leap`, T3 Vitality)
Path: `data/items/majestic_leap.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `anti_air` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `aoe_cluster` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.01 | (drop) | -0.01 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.22 | (drop) | -0.22 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.40 | 0.90 | +0.50 | Bump JSON → 0.90 | `[x]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.00 | 0.10 | -1.90 | Cut JSON → 0.10 | `[ ]` |

### Metal Skin (`metal_skin`, T3 Vitality)
Path: `data/items/metal_skin.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `burst_resistance` | 0.01 | (drop) | -0.01 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.02 | (drop) | -0.02 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `damage_sponge` | 1.12 | (drop) | -1.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.15 | 1.70 | +0.55 | Bump JSON → 1.70 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 1.90 | +1.15 | Bump JSON → 1.90 | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Rescue Beam (`rescue_beam`, T3 Vitality)
Path: `data/items/rescue_beam.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20 | `[ ]` |
| `team_heal` | 1.50 | 0.50 | -1.00 | Cut JSON → 0.50 | `[ ]` |

### Spirit Resilience (`spirit_resilience`, T3 Vitality)
Path: `data/items/spirit_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `damage_sponge` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.80 | 0.20 | -0.60 | Cut JSON → 0.20 | `[ ]` |
| `spirit_continuous_resistance` | 0.80 | 2.00 | +1.20 | Bump JSON → 2.00 | `[ ]` |
| `spirit_resistance` | 1.50 | 1.70 | +0.20 | Bump JSON → 1.70 | `[x]` |

### Stamina Mastery (`stamina_mastery`, T3 Vitality)
Path: `data/items/stamina_mastery.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `away_from_team` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.25 | 0.20 | -2.05 | Cut JSON → 0.20 | `[ ]` |

### Trophy Collector (`trophy_collector`, T3 Vitality)
Path: `data/items/trophy_collector.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | (null) | -0.30 | -0.30 | Add row, set -0.30 | `[x]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | -0.20 | 1.00 | +1.20 | Bump JSON → 1.00 | `[ ]` |
| `high_assist_count` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.90 | 0.50 | -0.40 | Cut JSON → 0.50 | `[x]` |
| `scaling_early` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |

### Veil Walker (`veil_walker`, T3 Vitality)
Path: `data/items/veil_walker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.33 | 1.80 | +1.47 | Bump JSON → 1.80 | `[ ]` |
| `bullet_evasion` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
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
| `high_max_hp` | 0.65 | 0.50 | -0.15 | Cut JSON → 0.50 | `[x]` |
| `horizontal_mobility` | 2.00 | 1.00 | -1.00 | Cut JSON → 1.00 | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Warp Stone (`warp_stone`, T3 Vitality)
Path: `data/items/warp_stone.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `escape` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.70 | 1.30 | +0.60 | Bump JSON → 1.30 | `[ ]` |
| `long_range` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |

### Decay (`decay`, T3 Spirit)
Path: `data/items/decay.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 1.50 | 1.90 | +0.40 | Bump JSON → 1.90 | `[x]` |
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `debuff` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00 | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.25 | 2.00 | +1.75 | Bump JSON → 2.00 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `spirit_damage` | 0.35 | 0.15 | -0.20 | Cut JSON → 0.15 | `[x]` |
| `spirit_proc` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Disarming Hex (`disarming_hex`, T3 Spirit)
Path: `data/items/disarming_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `bullet_resistance` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 2.00 | 0.20 | -1.80 | Cut JSON → 0.20 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.95 | (drop) | -0.95 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Greater Expansion (`greater_expansion`, T3 Spirit)
Path: `data/items/greater_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[ ]` |
| `range_extender_dependant` | 2.25 | 1.30 | -0.95 | Cut JSON → 1.30 | `[ ]` |
| `self_buff` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `single_ability_focus` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Knockdown (`knockdown`, T3 Spirit)
Path: `data/items/knockdown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `displace` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `high_max_hp` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |

### Radiant Regeneration (`radiant_regeneration`, T3 Spirit)
Path: `data/items/radiant_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 0.35 | -0.65 | Cut JSON → 0.35 | `[ ]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.72 | 0.40 | -0.32 | Cut JSON → 0.40 | `[x]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.20 | 0.40 | -0.80 | Cut JSON → 0.40 | `[ ]` |
| `single_ability_focus` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Rapid Recharge (`rapid_recharge`, T3 Spirit)
Path: `data/items/rapid_recharge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | 2.38 | 0.60 | -1.78 | Cut JSON → 0.60 | `[ ]` |
| `continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `multi_ability_focus` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.70 | 1.40 | +0.70 | Bump JSON → 1.40 | `[ ]` |
| `spirit_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.55 | 0.40 | -0.15 | Cut JSON → 0.40 | `[x]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Silence Wave (`silence_wave`, T3 Spirit)
Path: `data/items/silence_wave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | 1.60 | +1.45 | Bump JSON → 1.60 | `[ ]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `long_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10 | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `spirit_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |

### Spirit Snatch (`spirit_snatch`, T3 Spirit)
Path: `data/items/spirit_snatch.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_target` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20 | `[ ]` |
| `spirit_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Superior Cooldown (`superior_cooldown`, T3 Spirit)
Path: `data/items/superior_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `charge_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `multi_ability_focus` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |

### Superior Duration (`superior_duration`, T3 Spirit)
Path: `data/items/superior_duration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 2.38 | 1.70 | -0.68 | Cut JSON → 1.70 | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[ ]` |
| `self_buff` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Surge of Power (`surge_of_power`, T3 Spirit)
Path: `data/items/surge_of_power.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Tankbuster (`tankbuster`, T3 Spirit)
Path: `data/items/tankbuster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.05 | 1.80 | +1.75 | Bump JSON → 1.80 | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.85 | 0.15 | -0.70 | Cut JSON → 0.15 | `[ ]` |
| `spirit_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Torment Pulse (`torment_pulse`, T3 Spirit)
Path: `data/items/torment_pulse.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `close_to_team` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | 1.20 | +0.80 | Bump JSON → 1.20 | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | 1.10 | +1.00 | Bump JSON → 1.10 | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.05 | 0.10 | -0.95 | Cut JSON → 0.10 | `[ ]` |
| `spirit_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

## T4 (6400 souls)

### Armor Piercing Rounds (`armor_piercing_rounds`, T4 Weapon)
Path: `data/items/armor_piercing_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.80 | 0.40 | -0.40 | Cut JSON → 0.40 | `[x]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `counter_importance` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `gun_burst_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80 | `[ ]` |
| `mid_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Capacitor (`capacitor`, T4 Weapon)
Path: `data/items/capacitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | 2.00 | +1.75 | Bump JSON → 2.00 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | 1.80 | +1.65 | Bump JSON → 1.80 | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `spirit_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.80 | 0.07 | -0.73 | Cut JSON → 0.07 | `[ ]` |

### Crippling Headshot (`crippling_headshot`, T4 Weapon)
Path: `data/items/crippling_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 2.00 | 1.10 | -0.90 | Cut JSON → 1.10 | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `debuff` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.66 | 0.12 | -0.54 | Cut JSON → 0.12 | `[x]` |
| `high_kill_count` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `hybrid_damage_usage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 2.00 | 1.10 | -0.90 | Cut JSON → 1.10 | `[ ]` |

### Crushing Fists (`crushing_fists`, T4 Weapon)
Path: `data/items/crushing_fists.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.70 | 0.40 | -0.30 | Cut JSON → 0.40 | `[x]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.70 | 1.60 | +0.90 | Bump JSON → 1.60 | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `grounded` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 2.38 | 0.57 | -1.81 | Cut JSON → 0.57 | `[ ]` |
| `melee_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.00 | (drop) | +-0.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.70 | 1.00 | +0.30 | Bump JSON → 1.00 | `[x]` |

### Frenzy (`frenzy`, T4 Weapon)
Path: `data/items/frenzy.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `high_max_hp` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `low_max_hp` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `scaling_late` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Glass Cannon (`glass_cannon`, T4 Weapon)
Path: `data/items/glass_cannon.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 2.00 | 1.80 | -0.20 | Cut JSON → 1.80 | `[x]` |
| `damage_sponge` | 0.12 | (drop) | -0.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `gun_burst_damage` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 1.10 | 0.50 | -0.60 | Cut JSON → 0.50 | `[ ]` |
| `gun_continuous_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `high_max_hp` | -0.50 | -0.10 | +0.40 | Bump JSON → -0.10 | `[x]` |
| `low_max_hp` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00 | `[ ]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |

### Lucky Shot (`lucky_shot`, T4 Weapon)
Path: `data/items/lucky_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.30 | 0.60 | -0.70 | Cut JSON → 0.60 | `[ ]` |
| `bullet_proc` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30 | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `magazine_size_dependant` | 0.45 | 0.30 | -0.15 | Cut JSON → 0.30 | `[x]` |

### Ricochet (`ricochet`, T4 Weapon)
Path: `data/items/ricochet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.25 | 1.80 | +0.55 | Bump JSON → 1.80 | `[x]` |
| `bullet_damage` | 1.65 | (drop) | -1.65 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[ ]` |
| `fire_rate` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `gun_burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 1.25 | 1.80 | +0.55 | Bump JSON → 1.80 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Shadow Weave (`shadow_weave`, T4 Weapon)
Path: `data/items/shadow_weave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.15 | 0.70 | -0.45 | Cut JSON → 0.70 | `[x]` |
| `hybrid_damage_usage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.30 | 0.10 | -0.20 | Cut JSON → 0.10 | `[x]` |
| `self_buff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Silencer (`silencer`, T4 Weapon)
Path: `data/items/silencer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `single_target` | 0.15 | 1.30 | +1.15 | Bump JSON → 1.30 | `[ ]` |
| `spirit_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |

### Spellslinger (`spellslinger`, T4 Weapon)
Path: `data/items/spellslinger.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.50 | 0.40 | -1.10 | Cut JSON → 0.40 | `[ ]` |
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.60 | 0.20 | -0.40 | Cut JSON → 0.20 | `[x]` |
| `fire_rate` | 2.00 | 1.30 | -0.70 | Cut JSON → 1.30 | `[ ]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Spiritual Overflow (`spiritual_overflow`, T4 Weapon)
Path: `data/items/spiritual_overflow.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `hybrid_damage_usage` | 2.38 | 2.00 | -0.38 | Cut JSON → 2.00 | `[x]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[x]` |

### Cheat Death (`cheat_death`, T4 Vitality)
Path: `data/items/cheat_death.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `cc_resist` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.80 | +1.70 | Bump JSON → 1.80 | `[ ]` |
| `damage_sponge` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.90 | 0.60 | -0.30 | Cut JSON → 0.60 | `[x]` |
| `low_max_hp` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50 | `[ ]` |
| `melee_resistance` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Colossus (`colossus`, T4 Vitality)
Path: `data/items/colossus.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 2.00 | 0.60 | -1.40 | Cut JSON → 0.60 | `[ ]` |
| `large_hitbox` | 1.00 | 2.00 | +1.00 | Bump JSON → 2.00 | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[x]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |

### Divine Barrier (`divine_barrier`, T4 Vitality)
Path: `data/items/divine_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 2.00 | 1.60 | -0.40 | Cut JSON → 1.60 | `[x]` |
| `away_from_team` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.20 | (drop) | -1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.10 | 1.60 | +1.50 | Bump JSON → 1.60 | `[ ]` |
| `cc_resist` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[ ]` |
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `self_buff` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |

### Diviners Kevlar (`diviners_kevlar`, T4 Vitality)
Path: `data/items/diviners_kevlar.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `continous_heal` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | 1.30 | +1.15 | Bump JSON → 1.30 | `[ ]` |
| `self_heal` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.45 | 0.80 | +0.35 | Bump JSON → 0.80 | `[x]` |
| `ult_focused` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Tempo (`healing_tempo`, T4 Vitality)
Path: `data/items/healing_tempo.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `ally_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.50 | 0.30 | -1.20 | Cut JSON → 0.30 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.50 | 0.70 | -0.80 | Cut JSON → 0.70 | `[ ]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.80 | 0.30 | -0.50 | Cut JSON → 0.30 | `[x]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.75 | 0.50 | -1.25 | Cut JSON → 0.50 | `[ ]` |
| `spirit_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.00 | 0.10 | -0.90 | Cut JSON → 0.10 | `[ ]` |
| `vertical_mobility` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

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
| `high_max_hp` | 0.68 | 0.30 | -0.38 | Cut JSON → 0.30 | `[x]` |
| `multi_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.66 | 0.10 | -0.56 | Cut JSON → 0.10 | `[x]` |
| `spirit_burst_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[ ]` |
| `spirit_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Inhibitor (`inhibitor`, T4 Vitality)
Path: `data/items/inhibitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `bullet_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 1.80 | +1.05 | Bump JSON → 1.80 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.85 | 0.40 | -0.45 | Cut JSON → 0.40 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | 1.30 | +1.05 | Bump JSON → 1.30 | `[ ]` |
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
| `burst_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.50 | 0.40 | -1.10 | Cut JSON → 0.40 | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.62 | (drop) | -1.62 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 2.00 | 0.70 | -1.30 | Cut JSON → 0.70 | `[ ]` |
| `grounded` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.30 | 1.10 | -0.20 | Cut JSON → 1.10 | `[x]` |
| `large_hitbox` | 0.10 | 0.90 | +0.80 | Bump JSON → 0.90 | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `mid_range` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Leech (`leech`, T4 Vitality)
Path: `data/items/leech.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `bullet_lifesteal` | 2.00 | 1.40 | -0.60 | Cut JSON → 1.40 | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.12 | (drop) | -0.12 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.97 | 0.50 | -0.47 | Cut JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | 0.66 | 1.20 | +0.54 | Bump JSON → 1.20 | `[x]` |
| `melee_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.50 | 0.10 | -1.40 | Cut JSON → 0.10 | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `spirit_lifesteal` | 2.00 | 0.50 | -1.50 | Cut JSON → 0.50 | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Phantom Strike (`phantom_strike`, T4 Vitality)
Path: `data/items/phantom_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_air` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[ ]` |
| `burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate_slow` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | 1.60 | +0.94 | Bump JSON → 1.60 | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Plated Armor (`plated_armor`, T4 Vitality)
Path: `data/items/plated_armor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 1.50 | 1.10 | -0.40 | Cut JSON → 1.10 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 1.60 | +0.30 | Bump JSON → 1.60 | `[x]` |
| `damage_sponge` | 1.12 | 1.60 | +0.48 | Bump JSON → 1.60 | `[x]` |
| `gun_burst_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.65 | 0.40 | -0.25 | Cut JSON → 0.40 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Siphon Bullets (`siphon_bullets`, T4 Vitality)
Path: `data/items/siphon_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[x]` |
| `bullet_lifesteal` | 1.50 | 0.70 | -0.80 | Cut JSON → 0.70 | `[ ]` |
| `bullet_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.60 | 0.00 | -0.60 | Cut JSON → 0.00 | `[x]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.28 | 0.10 | -0.18 | Cut JSON → 0.10 | `[x]` |
| `long_range` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `scaling_late` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Spellbreaker (`spellbreaker`, T4 Vitality)
Path: `data/items/spellbreaker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.50 | 0.40 | -1.10 | Cut JSON → 0.40 | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |

### Unstoppable (`unstoppable`, T4 Vitality)
Path: `data/items/unstoppable.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20 | `[ ]` |
| `escape` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Vampiric Burst (`vampiric_burst`, T4 Vitality)
Path: `data/items/vampiric_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `bullet_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.68 | 0.30 | -0.38 | Cut JSON → 0.30 | `[x]` |
| `magazine_size_dependant` | 0.70 | 0.30 | -0.40 | Cut JSON → 0.30 | `[x]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 0.10 | -0.90 | Cut JSON → 0.10 | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |

### Witchmail (`witchmail`, T4 Vitality)
Path: `data/items/witchmail.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.50 | 1.20 | -0.30 | Cut JSON → 1.20 | `[x]` |
| `away_from_team` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 1.50 | 0.60 | -0.90 | Cut JSON → 0.60 | `[ ]` |
| `counter_importance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 1.00 | 1.80 | +0.80 | Bump JSON → 1.80 | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `large_hitbox` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.40 | 0.80 | +0.40 | Bump JSON → 0.80 | `[x]` |
| `spirit_resistance` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |

### Arctic Blast (`arctic_blast`, T4 Spirit)
Path: `data/items/arctic_blast.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.45 | 1.80 | +1.35 | Bump JSON → 1.80 | `[ ]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 1.00 | 1.20 | +0.20 | Bump JSON → 1.20 | `[x]` |
| `farmer` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.80 | 0.35 | -0.45 | Cut JSON → 0.35 | `[x]` |
| `spirit_proc` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `spirit_resistance` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `stun` | 0.70 | 2.00 | +1.30 | Bump JSON → 2.00 | `[ ]` |

### Boundless Spirit (`boundless_spirit`, T4 Spirit)
Path: `data/items/boundless_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `multi_ability_focus` | 0.50 | 1.60 | +1.10 | Bump JSON → 1.60 | `[ ]` |
| `scaling_late` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `self_buff` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `self_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 2.38 | 1.00 | -1.38 | Cut JSON → 1.00 | `[ ]` |
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
| `bullet_resistance` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.30 | 2.00 | +0.70 | Bump JSON → 2.00 | `[ ]` |
| `debuff` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 1.25 | 0.10 | -1.15 | Cut JSON → 0.10 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.70 | 1.40 | +0.70 | Bump JSON → 1.40 | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.00 | 1.60 | +0.60 | Bump JSON → 1.60 | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |

### Echo Shard (`echo_shard`, T4 Spirit)
Path: `data/items/echo_shard.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `bullet_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `cooldown_reduction` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 2.00 | 1.80 | -0.20 | Cut JSON → 1.80 | `[x]` |
| `spirit_burst_damage` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `spirit_burst_proc` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Escalating Exposure (`escalating_exposure`, T4 Spirit)
Path: `data/items/escalating_exposure.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.70 | +1.70 | Add row, set 1.70 | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `spirit_damage` | 0.53 | (drop) | -0.53 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.20 | 2.00 | +1.80 | Bump JSON → 2.00 | `[ ]` |
| `spirit_resistance` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |

### Ethereal Shift (`ethereal_shift`, T4 Spirit)
Path: `data/items/ethereal_shift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |
| `bullet_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.33 | 1.60 | +1.27 | Bump JSON → 1.60 | `[ ]` |
| `cc_resist` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.80 | 1.60 | +0.80 | Bump JSON → 1.60 | `[ ]` |
| `debuff_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.50 | 0.80 | -0.70 | Cut JSON → 0.80 | `[ ]` |
| `spirit_continuous_resistance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Focus Lens (`focus_lens`, T4 Spirit)
Path: `data/items/focus_lens.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | 1.30 | +0.97 | Bump JSON → 1.30 | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `headshot_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `spirit_burst_damage` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |

### Lightning Scroll (`lightning_scroll`, T4 Spirit)
Path: `data/items/lightning_scroll.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `debuff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.70 | 1.40 | +0.70 | Bump JSON → 1.40 | `[ ]` |
| `spirit_burst_proc` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00 | `[ ]` |
| `spirit_damage` | 0.65 | (drop) | -0.65 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `ult_focused` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Magic Carpet (`magic_carpet`, T4 Spirit)
Path: `data/items/magic_carpet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `engage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `farmer` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 1.05 | 0.40 | -0.65 | Cut JSON → 0.40 | `[ ]` |
| `horizontal_mobility` | 1.50 | 0.70 | -0.80 | Cut JSON → 0.70 | `[ ]` |
| `long_range` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.05 | (drop) | +0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.65 | 0.40 | -0.25 | Cut JSON → 0.40 | `[x]` |
| `vertical_mobility` | 0.66 | 0.10 | -0.56 | Cut JSON → 0.10 | `[x]` |

### Mercurial Magnum (`mercurial_magnum`, T4 Spirit)
Path: `data/items/mercurial_magnum.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.25 | 1.30 | +1.05 | Bump JSON → 1.30 | `[ ]` |
| `burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 2.25 | 2.00 | -0.25 | Cut JSON → 2.00 | `[x]` |
| `magazine_size_dependant` | 1.25 | 0.30 | -0.95 | Cut JSON → 0.30 | `[ ]` |
| `single_ability_focus` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.15 | 0.20 | -0.95 | Cut JSON → 0.20 | `[ ]` |
| `spirit_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Reverb (`mystic_reverb`, T4 Spirit)
Path: `data/items/mystic_reverb.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | 1.60 | +1.45 | Bump JSON → 1.60 | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `multi_ability_focus` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 2.00 | 0.60 | -1.40 | Cut JSON → 0.60 | `[ ]` |
| `spirit_burst_proc` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | -0.10 | 0.70 | +0.80 | Bump JSON → 0.70 | `[ ]` |
| `spirit_continuous_proc` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 1.65 | (drop) | -1.65 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `spirit_proc` | 0.25 | 1.30 | +1.05 | Bump JSON → 1.30 | `[ ]` |

### Refresher (`refresher`, T4 Spirit)
Path: `data/items/refresher.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.80 | +1.80 | Add row, set 1.80 | `[ ]` |
| `charge_dependant` | 0.25 | 1.60 | +1.35 | Bump JSON → 1.60 | `[ ]` |
| `cooldown_reduction` | 0.25 | 2.00 | +1.75 | Bump JSON → 2.00 | `[ ]` |
| `gun_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 1.60 | +1.60 | Add row, set 1.60 | `[ ]` |
| `scaling_late` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `single_ability_focus` | 0.88 | (drop) | -0.88 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Scourge (`scourge`, T4 Spirit)
Path: `data/items/scourge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `assist_importance` | 0.80 | (drop) | -0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.50 | 1.80 | +0.30 | Bump JSON → 1.80 | `[x]` |
| `damage_sponge` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `dot` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.95 | (drop) | -0.95 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `team_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Burn (`spirit_burn`, T4 Spirit)
Path: `data/items/spirit_burn.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 2.00 | 1.80 | -0.20 | Cut JSON → 1.80 | `[x]` |
| `aoe_cluster` | 1.00 | 1.40 | +0.40 | Bump JSON → 1.40 | `[x]` |
| `assist_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 2.00 | +2.00 | Add row, set 2.00 | `[ ]` |
| `damage_sponge` | 0.60 | (drop) | -0.60 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.70 | (drop) | -0.70 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.90 | (drop) | -0.90 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `spirit_damage` | 1.35 | 0.28 | -1.07 | Cut JSON → 0.28 | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Transcendent Cooldown (`transcendent_cooldown`, T4 Spirit)
Path: `data/items/transcendent_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 2.00 | 1.00 | -1.00 | Cut JSON → 1.00 | `[ ]` |
| `multi_ability_focus` | 0.50 | 1.80 | +1.30 | Bump JSON → 1.80 | `[ ]` |
| `self_heal` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |

### Vortex Web (`vortex_web`, T4 Spirit)
Path: `data/items/vortex_web.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.80 | +1.70 | Bump JSON → 1.80 | `[ ]` |
| `displace` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00 | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `silence` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

## T? (9999 souls — Street Brawl / non-standard)

### Haunting Shot (`haunting_shot`, T? Weapon)
Path: `data/items/haunting_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00 | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | (null) | 0.00 | +0.00 | Add row, set 0.00 | `[x]` |
| `bullet_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `debuff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `pure_damage` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50 | `[ ]` |
| `spirit_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Infinite Rounds (`infinite_rounds`, T? Weapon)
Path: `data/items/infinite_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.15 | 1.30 | +1.15 | Bump JSON → 1.30 | `[ ]` |
| `bullet_resist_shred` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `long_range` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20 | `[ ]` |
| `magazine_size_dependant` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Runed Gauntlets (`runed_gauntlets`, T? Weapon)
Path: `data/items/runed_gauntlets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `cooldown_reduction` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `engage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `grounded` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.25 | 0.30 | -0.95 | Cut JSON → 0.30 | `[ ]` |
| `melee_resistance` | 0.15 | 0.90 | +0.75 | Bump JSON → 0.90 | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Celestial Blessing (`celestial_blessing`, T? Vitality)
Path: `data/items/celestial_blessing.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.45 | 0.70 | +0.25 | Bump JSON → 0.70 | `[x]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.45 | 0.00 | -0.45 | Cut JSON → 0.00 | `[x]` |

### Cloak of Opportunity (`cloak_of_opportunity`, T? Vitality)
Path: `data/items/cloak_of_opportunity.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.66 | 1.10 | +0.44 | Bump JSON → 1.10 | `[x]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Electric Slippers (`electric_slippers`, T? Vitality)
Path: `data/items/electric_slippers.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | 1.10 | +1.85 | Bump JSON → 1.10 | `[ ]` |
| `aoe_cluster` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00 | `[ ]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.66 | 1.10 | +0.44 | Bump JSON → 1.10 | `[x]` |
| `bullet_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `large_hitbox` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |

### Eternal Gift (`eternal_gift`, T? Vitality)
Path: `data/items/eternal_gift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `assist_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `self_buff` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Nullification Burst (`nullification_burst`, T? Vitality)
Path: `data/items/nullification_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50 | `[ ]` |
| `away_from_team` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `long_range` | -1.20 | (drop) | +1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50 | `[ ]` |

### Seraphim Wings (`seraphim_wings`, T? Vitality)
Path: `data/items/seraphim_wings.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `bullet_evasion` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `grounded` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `long_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.00 | 0.10 | -1.90 | Cut JSON → 0.10 | `[ ]` |

### Shadow Strike (`shadow_strike`, T? Vitality)
Path: `data/items/shadow_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50 | `[ ]` |
| `bullet_evasion` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.05 | (drop) | -0.05 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `grounded` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00 | `[ ]` |
| `horizontal_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | 1.20 | +1.10 | Bump JSON → 1.20 | `[ ]` |
| `spirit_burst_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.10 | (drop) | -0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.45 | 1.50 | +1.05 | Bump JSON → 1.50 | `[ ]` |
| `ult_focused` | -0.10 | (drop) | +0.10 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | 0.10 | -0.40 | Cut JSON → 0.10 | `[x]` |

### Frostbite Charm (`frostbite_charm`, T? Spirit)
Path: `data/items/frostbite_charm.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cooldown_reduction` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_ability_focus` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `stun` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Mystic Conduit (`mystic_conduit`, T? Spirit)
Path: `data/items/mystic_conduit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `assist_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `close_to_team` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `cooldown_reduction` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `range_extender_dependant` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `team_heal` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Mystical Piano (`mystical_piano`, T? Spirit)
Path: `data/items/mystical_piano.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `bullet_resistance` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `disarm` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |
| `engage` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `interrupt` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `stun` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |

### Omnicharge Signet (`omnicharge_signet`, T? Spirit)
Path: `data/items/omnicharge_signet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `charge_dependant` | (null) | 0.47 | +0.47 | Add row, set 0.47 | `[x]` |
| `cooldown_reduction` | (null) | 1.00 | +1.00 | Add row, set 1.00 | `[ ]` |
| `single_ability_focus` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `spirit_damage` | (null) | 1.10 | +1.10 | Add row, set 1.10 | `[ ]` |

### Prism Blast (`prism_blast`, T? Spirit)
Path: `data/items/prism_blast.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.20 | +1.20 | Add row, set 1.20 | `[ ]` |
| `single_ability_focus` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `spirit_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_damage` | (null) | 0.38 | +0.38 | Add row, set 0.38 | `[x]` |

### Shrink Ray (`shrink_ray`, T? Spirit)
Path: `data/items/shrink_ray.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `counter_importance` | (null) | 1.40 | +1.40 | Add row, set 1.40 | `[ ]` |
| `debuff` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `fire_rate` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `horizontal_mobility` | (null) | 0.70 | +0.70 | Add row, set 0.70 | `[ ]` |
| `single_target` | (null) | 1.30 | +1.30 | Add row, set 1.30 | `[ ]` |

### Unstable Concoction (`unstable_concoction`, T? Spirit)
Path: `data/items/unstable_concoction.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `bullet_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `high_max_hp` | (null) | 0.80 | +0.80 | Add row, set 0.80 | `[ ]` |
| `horizontal_mobility` | (null) | 0.90 | +0.90 | Add row, set 0.90 | `[ ]` |
| `pure_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
| `spirit_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50 | `[ ]` |
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
