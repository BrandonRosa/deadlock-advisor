# Deadlock item interpretations

Source of truth for AI-judged item effectiveness. Replaces the algorithmic `mapped_stats` table from `_scrape_cache.json` with human-readable prose and reasoned effective values. A later UI pass will read the "Max" and "Effective contribution" columns from this file to drive the baseline-compare-panel.

## Format

Each item has:
- Name, normalized_name, tier, category, wiki link.
- **Interpretation** — short prose describing what the item actually does in a real game.
- **Stat ranges** — table of raw values from the wiki (min when off / conditional, max when fully active).
- **Effective contribution** — table of the values to actually use in scoring, with reasoning. `Mode` is `adds` (item directly provides the stat → full value) or `relies` (item scales with / depends on the stat → reduced value, default ×0.5).

## Stat focus

We score these tags only:
- `health` (flat HP) and the equivalent for % health up
- `bullet_damage` — raw weapon damage actually being dealt (covers BaseAttackDamagePercent as a multiplier on the carrier's gun)
- `spirit_power` — flat Spirit added to the carrier's abilities
- `spirit_damage` — actual spirit damage dealt by the item itself
- `horizontal_mobility` — move speed contributions; **sprint speed counts at ×0.5** of move speed weight
- `vertical_mobility` — stamina contributes to both horizontal & vertical (split 0.5 / 0.5 per +1 stamina)
- `fire_rate` and `fire_rate_slow` — included because conditional fire rate is the canonical judgment case (Blood Tribute, Glass Cannon)
- Resistances (`bullet_resistance`, `spirit_resistance`, `melee_resistance`, `debuff_resistance`) — and **single-target damage-reduction debuffs** like Spirit Sap's TechPowerReduction count as resistance, but discount heavily (single-target ×0.2, plus duration uptime).

## Conventions

- **adds** mode → full effective value.
- **relies** mode → reduced value (default ×0.5; can vary, always justify in Reasoning).
- Sprint speed → ×0.5 of move speed weight (player heuristic — sprint isn't always available).
- Stamina → +1 stamina ≈ +0.5 horizontal_mobility + +0.5 vertical_mobility.
- Conditional uptime — pick a realistic combat uptime and show the math (`raw × uptime = effective`):
  - `passive` → uptime 1.0
  - `out_of_combat` regen → uptime 0.3 (regen doesn't help in fights; usable in lane between engagements)
  - `lowhp` conditional (active only below threshold) → uptime ~0.25-0.30 (you only spend a portion of a fight below half HP)
  - `ambush` (active for N seconds after entering combat) → `duration / cooldown`
  - `per_stack` (stacks to a max) → average stacks held in a typical fight ≈ 0.6 × max
  - `toggled` (manual on/off with downside) → ~0.7-0.8 of fight duration with the toggle on
- Resistance debuffs on enemies → discount by single-target factor ×0.2 (you reduce one enemy's output, not the team's) AND by duration uptime (`duration / cooldown`).

## Sourcing

For every item, **fetch the wiki page directly** (`https://deadlock.wiki/<Item_Name>`) before judging effective values. Primary structured source is the stat-effects table at XPath
`/html/body/div[3]/div[3]/div[5]/div[1]/div[1]/section/article[1]/div/table/tbody`
— it groups stats under "Passive" / "Active" headers and spells out the conditions in plain English. Read the rest of the page (description, notes) for nuance, but trust the table for which stats are conditional and on what.

`_scrape_cache.json` has the raw numbers but not the prose context — who gets healed, whose HP is being checked, whether a cost is one-time vs per-stack. Round 1 made four wrong calls from cache-only guessing (Restorative Shot, Active Reload, Hollow Point, Glass Cannon).

When the wiki table and the scrape cache disagree on which stats exist (e.g. cache lists slow/ammo fields that the wiki doesn't mention for the item), the wiki wins.

## Two vocabularies: Game stats vs. Calculator tags

Every item below carries two tag tables side by side. They are intentionally distinct vocabularies, with different rules:

- **Game stats** — names come from the wiki / `Data:ItemData.json` (`BonusHealth`, `BonusFireRate`, `BulletResist`, `OutOfCombatHealthRegen`, etc.). Purpose: UI / clarity / debugging. Naming isn't governed — add new ones freely as long as they're applied consistently across items. The `Game stats` table holds the raw min/max and the effective (post-uptime/conditional) value.
- **Calculator tags** — the governed playstyle vocabulary in [public/tag_generator/data/tags.json](public/tag_generator/data/tags.json) (`high_max_hp`, `fire_rate`, `bullet_resistance`, `self_heal`, etc.). These drive scoring; don't rename or invent them without coordinating across `tags.json` + ~170 item JSONs + the baseline files. The `Calculator tags` table holds the effective raw value (when applicable), a normalized 0-2 score per row, mode (`adds` / `relies`), and reasoning.

The Stat-to-tag mapping table below documents the standard conversion from Game stat → Calculator tag.

## Stat to tag mapping

How each Game stat (wiki key) maps to one or more Calculator tags. Built from a survey of `_scrape_cache.json` raw_stats keys, `tags.json`, and the prior 27 interpretations — **not** copied from `_baseline_table.json` (which is currently unreliable). Mark with `?` rows where the mapping is uncertain.

| Game stat tag (wiki/scrape) | Calculator tag(s) | Conversion notes / formula |
|---|---|---|
| `BonusHealth` | `high_max_hp` | Direct: raw HP → effective HP. Calibrate against tier (T1 ~50-75 HP, T2 ~100, T3 ~125, T4 ~200+). |
| `BonusClipSizePercent` / `BonusClipSize` / `BonusClipPerKill` | `magazine_size_dependant` | % or flat ammo → effective %. Per-kill flavors use `per_stack ≈ 0.5 × max stacks held`. |
| `BonusFireRate` / `FireRatePerKill` / `FervorFireRate` / `ActiveBonusFireRate` | `fire_rate` | Direct %; apply uptime discount if conditional (active window, per-stack, per-kill). |
| `BonusMoveSpeed` / `ActiveBonusMoveSpeed` | `horizontal_mobility` | Direct m/s, full weight. Active flavors get duration/cd uptime. |
| `BonusSprintSpeed` | `horizontal_mobility` | × 0.5 sprint weight (player heuristic — sprint isn't always available). |
| `Stamina` | `horizontal_mobility` + `vertical_mobility` | Split: per +1 stamina → +0.5 horizontal + +0.5 vertical. |
| `StaminaCooldownReduction` | (folded into the Stamina split) | +12% stamina regen ≈ +0.12 effective stamina → ×0.5 weight further → trivial direct effect. Often paired with Stamina row. |
| `BaseAttackDamagePercent` / `WeaponPowerPerStack` / `CloseRangeBonusWeaponPower` / `NonPlayerBonusWeaponPower` | `bullet_damage` | All weapon-% sources. For per_stack apply ≈ 0.6 × max. For context-gated (close range, low-HP) apply uptime. |
| `BonusMeleeDamagePercent` / `AmbushBonusMeleeDamage` | `melee_damage` | Ambush flavor uptime = duration / cooldown. |
| `BulletResist` / `BulletResistBelowThreshold` / `BulletResistPerStack` | `bullet_resistance` | Below-threshold ≈ 0.25-0.30 uptime; per_stack 0.6 × max. |
| `TechResist` | `spirit_resistance` | Direct %. |
| `MeleeResistPercent` | `melee_resistance` | Direct %. |
| `StatusResistancePercent` / `FervorStatusResistancePercent` / `SlowResistancePercent` / `InnateStatusResistancePercent` | `debuff_resistance` | Direct %. |
| `BonusHealthRegen` | `self_heal` (`continous_heal` flavor) | Direct HP/sec, always-on. |
| `OutOfCombatHealthRegen` | `self_heal` | × 0.3 OOC fight uptime (regen does little in active combat). |
| `HealOnActivate` / `HealingPerCast_Value` | `self_heal` and/or `burst_heal` | Burst per cast / cooldown. Burst_heal unit = Effective Total Healing per cast. |
| `HealFromHero` / `HealFromNPC` | `self_heal` | Per-hit heal × hit rate ÷ cooldown (Restorative Shot). |
| `HealPercentAmount` (with `SelfModifier`) | `team_heal` + `self_heal` | If SelfModifier=100, applies to caster at full value too (Rescue Beam). |
| `Regeneration_Value` / `RegenerationDuration` | `self_heal` (`continous_heal`) | Triggered regen (Radiant Regeneration); scale by trigger frequency. |
| `TechPower` / `BonusSpirit` / `SpiritPower` | `spirit_power` | Direct flat SP. |
| `TechPowerPercent` | `spirit_power` (multiplier) | TWO rows: `adds` (it grants %) + `relies` (rewards existing SP). |
| `AmbushBonusTechPower` | `spirit_power` | Ambush uptime = duration / cooldown. |
| `BulletLifestealPercent` / `LowHealthLifeStealPercent` | `bullet_lifesteal` | Low-health flavor at 0.25-0.30 uptime. |
| `AbilityLifestealPercentHero` | `spirit_lifesteal` | Direct %. |
| `SlowPercent` / `MovementSpeedSlow` | `movement_slow` | Apply duration/cooldown uptime. |
| `FireRateSlow` | `fire_rate_slow` | Distinct from `movement_slow`. |
| `GroundDashReductionPercent` | `movement_slow` (dash-slow flavor) | Folds into movement_slow at full value. |
| `TechRangeMultiplier` / `TechRadiusMultiplier` | `range_extender_dependant` | Effective range % up on all items (mode = adds). |
| `BonusAbilityDurationPercent` / `BuffDuration` | `duration_dependant` | Effective duration % up. |
| `BonusAbilityCharges` | `charge_dependant` | Direct flat charges (mode = adds). |
| `CooldownReduction` / `StaminaCooldownReduction` | `cooldown_reduction` | Direct %. |
| `BulletArmorReduction` / `BulletArmorReduction_Value` / `BulletResistReduction` | `bullet_resist_shred` | Single-target × 0.2 if not team-wide. |
| `MagicResistReduction` | `spirit_resist_shred` | Same single-target discount. |
| `TechPowerReduction` | `spirit_resistance` (defensive via debuff) | Single-target × 0.2 × duration uptime (Spirit Sap). |
| `MaxHealthLossPercent` | `low_max_hp` / negative `high_max_hp` | Negative one-time cost (Glass Cannon). Sign matters. |
| `HealthDrainedPerSecond` / `HealthDrainedPerSecondPercent` | `high_max_hp` (negative, per-use) ?? | User flagged a candidate new tag `self_damage`; until added, encode as negative `high_max_hp` with a note. |
| `CombatBarrier_Value` | `shield` + `bullet_resistance` + `burst_resistance` | Per user correction — barrier on weapon damage is a defensive reaction to bullet/burst. Multi-tag row. |
| `LifeThreshold` | (gating, not a stat) | The condition for another stat. Note in reasoning; no own row. |
| `MaxStacks` / `DamageDuration` / `DamageToStack` | (per_stack params) | Used to compute uptime / effective value for other rows. No own tag. |
| `ReloadSpeedMultiplier` | `fire_rate` | Mechanically equivalent to fire rate when accumulated (cite in reasoning). |
| `AbilityCooldown` / `AbilityDuration` / `AbilityCastDelay` / `AbilityCastRange` / `AbilityChannelTime` | (timing params) | Used to compute active uptime. No own tag. |
| `Radius` / `ChainRadius` / `ProcRadius` / `EndRadius` / `DebuffRadius` / `StartRadius` / `SpreadDuration` | (informs `aoe_cluster` % of team hit) | Not their own Calc-tag row. |
| `ChainCount` | `aoe_cluster` | Direct multiplier on team-coverage estimate. |
| `ProcChance` / `ProcCooldown` / `TickRate` | (informs `gun_*_proc` / `spirit_*_proc` TTP unit) | Used to compute time-to-proc for proc tags. |
| `Damage_Value` / `DPS_Value` / `DPSMax_Value` / `DPSIncrease_Value` / `DamagePerChain_Value` / `BonusPerChain_Value` | `spirit_burst_damage` / `spirit_continuous_damage` / `gun_burst_damage` / `gun_continuous_damage` | Pick by source (gun proc vs. spirit/ability) and time window (instant vs. ticking). |
| `ReduceFootstepSound` | (Game-stat only — informs `engage`) | No Calc-tag row directly. Mention in `engage` reasoning if relevant. |
| `NonHeroReductionPercent` / `NonHeroMult` / `NPCDamageMult` | (informs `farmer` scoring) | NPC-damage multipliers. |
| `ProcChance` (heal/proc style) | (varies) | Use Mode column + reasoning to clarify. |

Rows marked `??` are uncertain mappings — flag for user review.

## Suggested tag improvements

Notes for the user to act on later — **no code changes this session**. Existing tag names in `tags.json` are unchanged.

### Suggested new Calculator tag
- **`self_damage`** (user approved) — per-use HP-per-second drain like Blood Tribute. Distinct from `low_max_hp` (which is a permanent max-HP reduction) because `self_damage` is recurring and uptime-gated. Currently we encode it as negative `high_max_hp` but the pattern reads differently. One-time max-HP costs (Glass Cannon's -15%) stay on `low_max_hp` — `hp_cost` would be redundant with that.

### Suggested new Game stat tags (UI-only — only add when reused across multiple items AND helps either scoring or user readability)
- **`enemy_vision`** ✓ — Stalker reveals wounded enemies through walls. Useful at-a-glance info; also informs `assist_importance` / `engage` Calc-tag scoring.
- **`stealth`** ✓ — Stalker's -50% footstep sound. Positioning info for the user; informs `engage`.
- **`channeled_vulnerable`** ✓ — Rescue Beam's 2.5s channel during which the caster is locked. Commit-risk info; informs negative `escape` / `damage_sponge` reliance.
- **`reactive_barrier`** — folded into the Notes column on `CombatBarrier_Value` rather than a dedicated tag. One pattern (Weapon Shielding) doesn't justify a new tag.

### Suggested Calculator tag renames (high coordination cost — flag only)
- `magazine_size_dependant` → `magazine_size_importance` — the "dependant" suffix reads as "consumer only" but the tag covers both providers (`adds`) and consumers (`relies`). Same issue on `charge_dependant`, `duration_dependant`, `range_extender_dependant`. The Mode column already carries directionality, so the suffix is redundant.
- `continous_heal` → `continuous_heal` — misspelled in the current tag list.

### Redundant Calculator tags to consider deprecating
- **`bullet_proc`** — generic umbrella; every concrete proc item also gets one of `gun_burst_proc` / `gun_continuous_proc` / `spirit_burst_proc` / `spirit_continuous_proc`. `bullet_proc` adds no scoring information beyond those.
- **`spirit_proc`** — same problem as `bullet_proc`; supplanted by the burst/continuous spirit-proc variants.
- **`dot`** — strict subset of `continuous_damage` (continuous + single-target). Could fold in.
- **`pure_damage`** — per the tag's name in tags.json (`Pure/Execute/MaxHP Damage`) it conflates three mechanics: true damage, execute thresholds, and HP-scaling damage. Consider splitting into `true_damage` / `hp_scaling_damage` / `execute` if they need distinct scoring; otherwise leave as-is.
- **`single_ability_focus` vs `multi_ability_focus`** — these are largely mutually exclusive. Could be replaced with a single `ability_breadth` axis. Low priority.

Will add further redundancies surfaced during the round-4 retrofit to this list as I find them.

## Tag interpretations

How I read each non-obvious tag. Skips the dead-obvious ones (`health`, `bullet_damage`, `spirit_damage`, `fire_rate`, `horizontal_mobility`, `stun`, `silence`, `team_heal`, `self_heal`, the resistances, etc.).

**Unit conventions** (per user): `Normalized` = a per-tier 0-2 score where 0 is nothing, 0.5 is okay, 1 is great, 1.5 is confidently best in tier, 2 is confidently best in game for that tag. Negative values allowed. Some tags have specific numeric units (DPS, %-reduction, time-to-proc, etc.).

- **pure_damage** (Unit: Normalized) — damage that bypasses resistance entirely (rare; true damage / ignores resist) **OR** scales with the enemy's HP / Max HP %. Anti-tank scaling items also qualify here.
- **burst_damage / continuous_damage / dot** (Unit: Average DPS) — by time window: burst = single instant (proc, on-hit, ability cast), continuous = sustained over seconds (DoT pool, channeled beam, aura tick).
- **burst_resistance / continuous_resistance** (Unit: Effective % reduction) — resistance vs. those damage profiles. **Any defensive reaction toward a damage type counts as that resistance** — e.g. Weapon Shielding's barrier on weapon-damage burst can also be tagged as `bullet_resistance` / `burst_resistance`. Barrier-on-hit items = `burst_resistance`; flat % reduction = `continuous_resistance`.
- **bullet_proc** (Unit: Normalized) — bullets carry rider effects on hit (Tesla Bullets, Mystic Slow). Not raw damage; the bullet itself triggers extra effects.
- **gun_burst_proc / gun_continuous_proc / spirit_burst_proc / spirit_continuous_proc** (Unit: Average Time To Proc in a good regular scenario; for burst use 1/TTP) — the **burst vs. continuous distinction is about HOW it's triggered**, not the post-trigger effect. Spirit Burn requires burst spirit damage to trigger (with a small DoT after) → `spirit_burst_proc`. Escalating Exposure / Siphon Bullets need sustained damage → `spirit_continuous_proc`. Toxic Bullets can be both (burst-trigger or sustained-trigger).
- **gun_burst_damage / gun_continuous_damage / spirit_burst_damage / spirit_continuous_damage** (Unit: Average Good Situation DPS) — damage profile of the **item's own output**, split by source (gun/spirit) and time window (burst/continuous).
- **bullet_evasion** (Unit: Normalized) — chance to dodge / phase through enemy bullets.
- **aoe_cluster** (Unit: Effective % of whole team this would hit under the duration of the effect in good circumstances) — damage hits multiple enemies in one cast (radius, chain, splash).
- **movement_slow** (vs **fire_rate_slow**) (Unit: Effective slow %) — slow targeting MS / dash. `fire_rate_slow` is a separate debuff that reduces enemy fire rate.
- **cc_resist** (Unit: Normalized) — reduces duration/effect of CC (stun, silence, disarm). Includes dispels **and anything that helps avoid getting CC'd in the first place** (mobility, blinks, etc. — up for interpretation).
- **anti_heal** (Unit: Effective heal reduction) — reduces healing received by the enemy (heal-reduction debuff).
- **shield** — grants a barrier (consumable HP layer that absorbs damage).
- **scaling_early / scaling_late** (Unit: Normalized) — strongest in first ~10 min / last ~20 min of a match.
- **farmer** (Unit: Normalized) — accelerates souls / jungle income (NPC damage, soul magnet, etc.).
- **ability_spam** (Unit: Normalized) — rewards frequent low-cd ability casts.
- **single_ability_focus / multi_ability_focus / ult_focused** (Unit: Normalized) — which ability slot the item rewards.
- **charge_dependant** (Unit: Normalized) — synergizes with abilities that have multiple charges.
- **duration_dependant** (Unit: Effective duration up on ALL ITEMS — note that some items only boost the duration of a single imbued item; since you choose it, only a minor multiplier like ×0.8 since you'll likely pick a good one. Items that DEPEND on duration get a minor score too) — synergizes with abilities that have duration/ramp.
- **range_extender_dependant** (Unit: Effective range % up on all items — same logic as duration% up) — synergizes with range/radius-scaling abilities.
- **magazine_size_dependant** (Unit: Effective Ammo Mag % size up — also how important ammo is to that hero; full-reload-on-cast items mix into this unit) — synergizes with carriers whose damage profile rewards big clips.
- **counter_importance** (Unit: Normalized) — meaningful as a counter pick (anti-heal vs. healers, etc.).
- **assist_importance** (Unit: Normalized) — supports allies' kills more than secures own.
- **engage / escape / interrupt / displace** (Unit: Normalized) — utility-by-purpose: starting fights / leaving fights / breaking enemy casts / moving enemy positions.
- **hybrid_damage_usage** (Unit: Normalized — staples of either build have a tiny bit of scoring here) — item rewards builds that mix gun and spirit damage.
- **damage_sponge** (Unit: Normalized) — high effective HP / mitigation; can soak hits for the team.
- **close_to_team / away_from_team** (Unit: Normalized — also when an item simply works better with teammates, like resist reduction or slows that the team can capitalize on) — item rewards positioning.
- **continous_heal / burst_heal** (Unit: Effective Healing/Second for continuous; Effective Total Healing for burst) — same continuous-vs-burst split applied to healing. Note: existing tag list misspells it `continous_heal`; preserved for compatibility.
- **spawn_minions** (Unit: Normalized) — produces NPCs that fight for the carrier.
- **trap_block_obstruct** (Unit: Effective time trapped × heroes trapped) — denies space (slow zones, walls, traps).
- **small_hitbox / large_hitbox** (Unit: Normalized) — rewards / punishes heroes by hitbox size (rare).
- **headshot_damage** (Unit: Normalized — also slightly rewards headshots in general, like Spirit Rend; treated as headshot affinity) — multiplies / rewards headshot bonuses.
- **single_target** (Unit: Normalized) — only affects one enemy (not AoE).
- **high_max_hp** (Unit: Effective HP boost) / **low_max_hp** (Unit: Normalized) — rewards / punishes high or low max HP builds. Glass Cannon's -15% HP = `low_max_hp adds`; an item that scales with the carrier's HP = `high_max_hp relies`.
- **high_kill_count / high_assist_count** (Unit: Normalized) — rewards a player carrying kills / assists (stat gates on participation).

---

# T1 (800 souls)

## Extended Magazine
- **normalized_name**: `extended_magazine`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Extended_Magazine

### Interpretation
The most boring T1 weapon possible — pure passive. +30% ammo and +8% bullet damage, always-on, no conditions. Sets the ceiling for what a clean passive T1 weapon contributes; anything fancier should beat this for tier.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 30% | 30% | 30% | Passive |
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | 30% | 1.5 | adds | Best-for-T1 ammo provider (T1 band 1.5 ≈ 30%); pure passive |
| `bullet_damage` | 8% | 1.0 | adds | Great-for-T1 weapon-damage (T1 band 1.0 ≈ 8%); pure passive |

---

## Restorative Shot
- **normalized_name**: `restorative_shot`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Restorative_Shot

### Interpretation
+6% weapon damage passive, plus a self-heal proc on a 6s cooldown: your next bullet (after cd) heals YOU for 50 HP if it hits a hero, or 15 HP if it hits an NPC/orb. Cooldown ticks regardless of whether the bullet lands, and on shotguns only the center pellet procs. Functionally this is a slow continuous self-heal trickle — in a sustained gunfight where you're landing hero shots, you net roughly one heal per cooldown ≈ 8 HP/sec self-heal. Closer to a weak `bullet_lifesteal` than a healing item.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 6% | 6% | 6% | Passive |
| `HealFromHero` | 50 | 50 | ~8 HP/sec | Per-hit heal; 50 HP / 6s cd ≈ 8 HP/sec sustained when hitting heroes |
| `HealFromNPC` | 15 | 15 | ~2.5 HP/sec | Per-hit heal vs NPCs; only when shooting non-hero targets |
| `AbilityCooldown` | 6 | 6 | — | (timing only; informs effective HP/sec) |
| `ProcChance` | 100% | 100% | — | (timing only; proc always succeeds on hit) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 6% | 0.7 | adds | Sub-baseline T1 weapon-damage (T1 band 1.0 ≈ 8%) |
| `self_heal` | ~8 HP/sec | 0.8 | adds | 50 HP / 6s when consistently hitting heroes; lower if missing or shooting NPCs |
| `continous_heal` | ~8 HP/sec | 0.8 | adds | Same physical effect, encoded under the cadence axis — sustained, not burst |

---

## Sprint Boots
- **normalized_name**: `sprint_boots`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Sprint_Boots

### Interpretation
+2 m/s sprint and +2 out-of-combat regen. Sprint is only active when the player is sprinting (not aiming / shooting), so it's a rotation / lane-to-lane mobility tool, not a fight tool. Per the project's convention, sprint counts at ×0.5 of move speed weight toward horizontal_mobility.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSprintSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive (only matters while sprinting) |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC fight uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | 1.0 m/s | 0.8 | adds | 2 m/s sprint × 0.5 sprint weight |
| `self_heal` | 0.6/sec | 0.3 | adds | 2/sec × 0.3 OOC fight uptime; regen doesn't help in fights |

---

## Extra Stamina
- **normalized_name**: `extra_stamina`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Extra_Stamina

### Interpretation
+1 stamina charge and +12% stamina regen cooldown reduction. More stamina = more sprints, dashes, and air-jumps before having to wait. Treated as a split mobility contribution — half horizontal (extra sprint distance), half vertical (extra air-jumps). The 12% regen is a small multiplier on the same axis (stamina charges refresh faster) and is folded into the same line at a smaller weight. Per user feedback, also nets `escape` since extra stamina is a strong panic-button mobility option.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Stamina` | +1 | +1 | +1 | Passive charge bonus |
| `StaminaCooldownReduction` | 12% | 12% | 12% | Passive; accelerates stamina regen only (not ability CDR) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | +0.5 | 0.5 | adds | +1 stamina × 0.5 horizontal weight; one extra sprint/dash per regen cycle |
| `vertical_mobility` | +0.5 | 0.5 | adds | +1 stamina × 0.5 vertical weight; one extra air-jump per cycle |
| `horizontal_mobility` | +0.1 | 0.1 | relies | 12% stamina regen ≈ +0.12 effective stamina × 0.5 horizontal × 0.5 (regen synergy only — not a new charge) |
| `vertical_mobility` | +0.1 | 0.1 | relies | Same logic on the vertical axis |
| `escape` | — | 0.5 | adds | Extra stamina charge is a panic-button mobility burst (per user note) |

---

## Close Quarters
- **normalized_name**: `close_quarters`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Close_Quarters

### Interpretation
+20% weapon damage when enemy is within 15m, plus a flat +20% melee resist passive. The damage bonus is short-range gated: works for shotgun/SMG heroes who naturally fight in melee/close range, useless for snipers. Melee resist is unconditional. Solid T1 close-range scaler with a useful defensive secondary.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CloseRangeBonusWeaponPower` | 20% | 20% | 16% | Conditional on enemy within 15m; ~0.8 uptime for close-range heroes |
| `CloseRangeBonusDamageRange` | 15 m | 15 m | — | (range gate) |
| `MeleeResistPercent` | 20% | 20% | 20% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 16% | 1.0 | adds | 20% × 0.8 uptime for close-range heroes; competitive with flat 8% T1 |
| `bullet_damage` | 16% | 0.5 | relies | Item only pays off if you're built to fight at close range — synergizes with close_range playstyle |
| `close_range` | — | 1.0 | adds | Item is built around the close-range gameplay axis |
| `melee_resistance` | 20% | 1.0 | adds | Solid T1 melee defense |

---

## Headshot Booster
- **normalized_name**: `headshot_booster`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Headshot_Booster

### Interpretation
+45 flat bonus damage on headshot, 9s internal cd, plus +30 HP. Hits hardest on slow-firing high-damage weapons that can reliably land headshots between cooldowns. Skill-gated payoff — bad aim turns this into a 30-HP item. Sets T1 baseline for `headshot_damage`.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HeadShotBonusDamage` | 45 | 45 | ~5 dmg/sec | 45 / 9s cd, assumes consistent headshot landings |
| `BonusHealth` | 30 | 30 | 30 | Passive |
| `AbilityCooldown` | 9 | 9 | — | (timing — headshot proc cd) |
| `ProcChance` | 100% | 100% | — | (always procs when cd is ready) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `headshot_damage` | 45/9s | 1.0 | adds | T1 baseline headshot scaler |
| `headshot_damage` | — | 0.8 | relies | Item requires you to actually land headshots — heavy synergy with the playstyle |
| `high_max_hp` | 30 | 0.2 | adds | Token T1 HP top-up |
| `long_range` | — | 0.4 | adds | Headshots are easier at range with slow-firing weapons; favors mid/long range gameplay |

---

## High-Velocity Rounds
- **normalized_name**: `high_velocity_rounds`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/High-Velocity_Rounds

### Interpretation
Pure passive: +8% weapon damage and +60% bullet speed. Bullet speed has no direct DPS contribution but makes hits land more reliably at range. T1 ceiling for `long_range` since +60% speed is the same value across all tiers.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive |
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 8% | 1.0 | adds | T1 baseline weapon damage |
| `long_range` | 60% | 1.5 | adds | T1 best for ranged-bullet utility; bullet speed compounds with range to make hits land |
| `long_range` | — | 0.5 | relies | Pays off most on snipers / mid-long range heroes |
| `mid_range` | — | 0.5 | adds | Also helps mid-range gunfights where lead time matters |

---

## Monster Rounds
- **normalized_name**: `monster_rounds`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Monster_Rounds

### Interpretation
Pure farming item: +25% weapon damage and +25% bullet resist, both ONLY vs. non-hero targets (creeps, jungle camps). +1 OOC regen. Useless in PvP fights, dominant in PvE farm. Defines the `farmer` axis at T1.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `NonPlayerBonusWeaponPower` | 25% | 25% | 25% | Passive vs. non-heroes only |
| `NonPlayerBulletResist` | 25% | 25% | 25% | Passive vs. non-heroes only |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `farmer` | — | 1.5 | adds | T1 best-in-tier farming tool |
| `lane_pusher` | — | 1.0 | adds | The bullet resist vs creeps is huge for lane tanking |
| `self_heal` | 0.3/sec | 0.2 | adds | Token OOC regen |
| `scaling_early` | — | 1.0 | adds | Item gets purchased early and falls off as creep farm matters less |

---

## Rapid Rounds
- **normalized_name**: `rapid_rounds`
- **tier**: 1 (800 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Rapid_Rounds

### Interpretation
Simplest possible T1 fire-rate boost: pure +9% passive. Sets the T1 baseline for `fire_rate`. T2 fire-rate items start at 20-25% so 9% is genuinely the floor.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 9% | 9% | 9% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate` | 9% | 1.0 | adds | Defines T1 baseline (≈ great-for-tier); cross-tier ceiling is T2 Active Reload 25% / T3 Blood Tribute 35% = 2.0 |
| `continuous_damage` | — | 0.5 | adds | Fire-rate items inherently scale sustained DPS more than burst |

---

## Extra Health
- **normalized_name**: `extra_health`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Extra_Health

### Interpretation
Simplest T1 HP stick: +210 flat HP, no conditions. Across the file the only T1 item that puts +210 HP on a single line; sets T1 ceiling for `high_max_hp`. Cross-tier ceiling is T3 Fortitude at +375 HP (= 2.0).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 210 | 210 | 210 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 210 | 1.5 | adds | T1 best-in-tier raw HP; cross-tier ceiling = Fortitude 375 = 2.0 |
| `damage_sponge` | — | 0.5 | adds | Bigger HP pool inherently helps tanky play |

---

## Extra Regen
- **normalized_name**: `extra_regen`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Extra_Regen

### Interpretation
+3 HP/sec always-on regen plus +1 OOC regen. The always-on regen is the headline: it ticks during fights too, so 3/sec is a real continuous self-heal trickle. Sets T1 ceiling for `continous_heal`; T4 Juggernaut hits +8/sec for cross-tier 2.0.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealthRegen` | 3/sec | 3/sec | 3/sec | Passive (in-combat too) |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | 3.3/sec | 1.5 | adds | T1 best continuous self-heal; cross-tier ceiling Juggernaut +8/sec = 2.0 |
| `continous_heal` | 3/sec | 1.5 | adds | Same value encoded under cadence axis — sustained, not burst |

---

## Healing Rite
- **normalized_name**: `healing_rite`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Rite

### Interpretation
Active heal-over-time on self OR an ally: 300 HP across 20s with +2 m/s sprint during the buff. 70s cooldown — long. Dispels if the target takes damage, so it's an OOC heal-up, not an in-fight clutch. Per WebFetch: "Can be self-cast" and the +2 sprint applies during the regen window. Cross-tier comparison: heal totals are tier-equal (T2 Restorative Locket also 300 HP), so T1 Healing Rite is best-in-tier for `burst_heal`/`team_heal` at this cost.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TotalHealthRegen_Value` | 300 | 300 | ~4 HP/sec | 300 / 70s cd amortized (assumes available when needed) |
| `RegenDuration` | 20 | 20 | — | (heal window, dispels on damage) |
| `BonusSprintSpeed` | +2 m/s | +2 m/s | 0.57 m/s | × 20/70 active uptime |
| `AbilityCastRange` | 30 m | 30 m | — | (ally targeting range) |
| `AbilityCastDelay` | 0.2 | 0.2 | — | (timing) |
| `AbilityCooldown` | 70 | 70 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | ~4 HP/sec | 1.0 | adds | 300 HP / 70s amortized; long cd hurts but raw heal is strong |
| `burst_heal` | 300/cast | 1.0 | adds | Largest single heal in T1 — but dispels on damage, so closer to setup heal |
| `team_heal` | 300 / 70s | 1.0 | adds | Can target allies at 30m range |
| `ally_buff` | sprint+heal | 0.5 | adds | Provides both heal and sprint to ally |
| `horizontal_mobility` | 0.57 m/s | 0.3 | adds | Sprint × 0.5 × uptime; small contribution |
| `escape` | — | 0.5 | adds | Sprint + heal burst is a classic disengage tool |

---

## Melee Lifesteal
- **normalized_name**: `melee_lifesteal`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Melee_Lifesteal

### Interpretation
On heavy-melee hit: heal 100 HP (30% vs non-heroes), 8s cd between procs. Passive +12% melee damage. Niche T1 item rewarding heroes whose kit uses heavy melee — most builds will not be melee-focused. The `LightMeleeCooldownMult: 1.5` hint suggests light-melee usage extends the proc cd; verify in audit.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LifestrikeHeal` | 100 | 100 | ~12.5 HP/sec | 100 / 8s cd if hero-heavy-melee landing every cycle |
| `NonHeroHealPct` | 30% | 30% | — | (heal reduced vs non-heroes) |
| `BonusMeleeDamagePercent` | 12% | 12% | 12% | Passive |
| `LightMeleeCooldownMult` | 1.5 | 1.5 | — | (light melee extends heavy cd) |
| `AbilityCooldown` | 8 | 8 | — | (timing — proc cd) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `melee_damage` | 12% | 1.0 | adds | T1 melee scaler |
| `self_heal` | 12.5 HP/sec | 0.8 | adds | If actually hitting heavy melee on hero each cycle; sporadic in practice |
| `self_heal` | — | 1.0 | relies | Pays off massively for melee-heavy heroes; useless otherwise |
| `melee_damage` | — | 1.0 | relies | Item is built for the melee-damage playstyle |
| `close_to_team` | — | 0.3 | adds | Forces close-range engagement to benefit |

---

## Rebuttal
- **normalized_name**: `rebuttal`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Rebuttal

### Interpretation
*(Phase A stub)* Parry-reward item: +75 HP, +18% melee resist passive. On successful parry: +30% damage buff for 6s, full HP refund, and parry cd reduced by 2s.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `MeleeResistPercent` | 18% | 18% | 18% | Passive |
| `BonusDamagePercent` (post-parry) | 0 | 30% | TBD | 6s buff after parry; cd = base parry cd - 2s |
| `ParryCooldownReduction` | 2 | 2 | — | (parry cd reduced by 2s on success) |
| `BuffDuration` | 6 | 6 | — | (buff window) |
| `ParrySuccessHealPercentage` | 100% | 100% | — | (heals you on parry; verify in Phase B) |

### Calculator tags
*(TBD — Phase B)*

---

## Extra Charge
- **normalized_name**: `extra_charge`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Extra_Charge

### Interpretation
*(Phase A stub)* +1 ability charge for charged abilities, plus +7 SP that scales with charged abilities. T1 ceiling for `charge_dependant` providers.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityCharges` | +1 | +1 | +1 | Passive flat charge |
| `BonusSpiritForChargedAbilities` | 7 | 7 | 7 | Passive — only applies to charged-ability casts |

### Calculator tags
*(TBD — Phase B)*

---

## Extra Spirit
- **normalized_name**: `extra_spirit`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Extra_Spirit

### Interpretation
*(Phase A stub)* Simplest T1 SP stick: pure +10 SP passive. Baseline T1 spirit_power provider.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 10 | 10 | 10 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Golden Goose Egg
- **normalized_name**: `golden_goose_egg`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Golden_Goose_Egg

### Interpretation
*(Phase A stub)* Farming utility: starts you with +400 gold, +90 gold/min passive, +1 m/s sprint, +1 OOC regen — but you deal -10% damage. The damage penalty is the cost; the gold lead is the prize. Classic `farmer` tag candidate.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StartingGold` | 400 | 400 | 400 | One-time on purchase |
| `BonusGoldPerMinute` | 90/min | 90/min | 90/min | Passive |
| `OutgoingDamagePenaltyPercent` | -10% | -10% | -10% | Passive DOWNSIDE |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |
| `BonusBuffsPerGold` | 100 | 100 | — | (?) |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Burst
- **normalized_name**: `mystic_burst`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Burst

### Interpretation
*(Phase A stub)* On-cast proc: spirit damage on ability use. 14s cd. Damage 40 base / 80 min — verify which is the actual damage and what gates the minimum in Phase B.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 40 | 40 | TBD | Per ability cast, 14s cd |
| `MinimumDamage` | 80 | 80 | — | (?) verify gating |
| `AbilityCooldown` | 14 | 14 | — | (timing) |
| `AbilityChargeUpTime` | 14 | 14 | — | (timing — proc charge-up) |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Expansion
- **normalized_name**: `mystic_expansion`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Expansion

### Interpretation
*(Phase A stub)* Pure passive: +20% ability range and +20% ability radius. T1 ceiling for `range_extender_dependant`. Pairs with any heroes whose kit scales with range/radius.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechRangeMultiplier` | 20% | 20% | 20% | Passive |
| `TechRadiusMultiplier` | 20% | 20% | 20% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Regeneration
- **normalized_name**: `mystic_regeneration`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Regeneration

### Interpretation
*(Phase A stub)* +50 HP passive plus a regen trigger — verify whether the regen procs on spirit damage / ability cast / etc. in Phase B (likely a Radiant Regeneration-style continuous heal).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `Regeneration` | 4/sec | 4/sec | TBD | Verify trigger in Phase B |
| `RegenerationDuration` | 6 | 6 | — | (per-trigger duration) |

### Calculator tags
*(TBD — Phase B)*

---

## Rusted Barrel
- **normalized_name**: `rusted_barrel`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Rusted_Barrel

### Interpretation
*(Phase A stub)* Active fire-rate-slow debuff on enemies, plus passive +50 HP, +0.5 sprint, -8 bullet resist on enemies (?). T1 candidate for `fire_rate_slow` tag.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `FireRateSlow` | 32% | 32% | TBD | Active 5s / 16s cd; on enemy |
| `BulletArmorReduction` | -8 | -8 | TBD | Active window; on enemy |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `BonusSprintSpeed` | 0.5 m/s | 0.5 m/s | 0.5 m/s | Passive |
| `AbilityDuration` | 5 | 5 | — | (timing) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityCastRange` | 32 m | 32 m | — | (cast range) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Strike
- **normalized_name**: `spirit_strike`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Strike

### Interpretation
*(Phase A stub)* Heavy-melee proc: 40 spirit damage on melee hit plus -6 TechArmor (spirit_resist_shred) on target. 8s cd. Verify in Phase B whether scales with SP.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritDamage_Value` | 40 | 40 | TBD | Per heavy melee, 8s cd |
| `TechArmorDamageReduction` | -6 | -6 | TBD | Same proc, 6s linger? Verify |
| `LightMeleeCooldownMult` | 2 | 2 | — | (?) |
| `AbilityDuration` | 6 | 6 | — | (timing) |
| `AbilityCooldown` | 8 | 8 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

# T2 (1600 souls)

## Active Reload
- **normalized_name**: `active_reload`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Active_Reload

### Interpretation
Passive +20% ammo always-on, plus a timed-reload mini-game: press Reload during a 0.3s highlighted window to instantly finish reloading and gain a 7s buff (+25% fire rate, +14% bullet lifesteal, +0.75 m/s move speed). 12s cooldown after a successful activation; missing the timing means no buff but also no cooldown. A competent player nails the active most of the time during a fight, so the buff's effective combat uptime ≈ 7/12 ≈ 0.58. The lifesteal in particular is gated to the moment you're already shooting, which is exactly when you want it.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 20% | 20% | 20% | Passive (above Active header on wiki) |
| `BonusFireRate` (active) | 0 | 25% | 14.5% | 7s buff / 12s cd active uptime |
| `BonusMoveSpeed` (active) | 0 | 0.75 m/s | 0.44 m/s | 7s / 12s |
| `BulletLifestealPercent` (active) | 0 | 14% | 8.2% | 7s / 12s; window aligns with shooting |
| `AbilityCooldown` | 12 | 12 | — | (timing only) |
| `AbilityDuration` | 7 | 7 | — | (timing only) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | 20% | 1.0 | adds | Solid passive ammo for T2 (T2 baseline ~20-25%) |
| `fire_rate` | 14.5% | 0.9 | adds | 25% × (7/12) active uptime; good for T2 active fire-rate |
| `horizontal_mobility` | 0.44 m/s | 0.4 | adds | 0.75 m/s × (7/12); move speed (not sprint) |
| `bullet_lifesteal` | 8.2% | 1.0 | adds | 14% × (7/12); active window aligns with shooting — premium uptime |

---

## Titanic Magazine
- **normalized_name**: `titanic_magazine`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Titanic_Magazine

### Interpretation
+100% ammo, +14% bullet damage, both passive — no conditions. This is the game-best ammo provider by a huge margin (most ammo items sit at 20-30%). Probably the only T2 weapon that should score at the `2.0` band for ammo. Bullet damage is a healthy secondary at T2.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 100% | 100% | 100% | Passive — cross-tier ceiling |
| `BaseAttackDamagePercent` | 14% | 14% | 14% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | 100% | 2.0 | adds | Cross-tier ceiling for ammo — no item in any tier matches +100% magazine |
| `bullet_damage` | 14% | 1.2 | adds | High for T2 (T2 band 1.5 ≈ 14-15%); passive |

---

## Spirit Sap
- **normalized_name**: `spirit_sap`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Sap

### Interpretation
User-flagged "resistance via debuff" example. Active ability that, for 12s on a target enemy (18s cooldown, 40m range), strips 30% of their spirit power and 9 magic resist. Also gives the holder +50 flat HP passively. The TechPowerReduction is a major effective spirit_resistance for the team — but only against one enemy, and only for the active window. By the project's conventions, that's ×0.2 (single-target) × (12/18) (active uptime) ≈ 13% of the nominal 30% = effectively ~4% team spirit_resistance.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `TechPowerReduction` (debuff) | 0 | -30% on target | -20% | -30% × (12/18) duration uptime; single-target only |
| `MagicResistReduction` (debuff) | 0 | -9 on target | -6 | Same uptime, single-target |
| `AbilityCastRange` | 40 m | 40 m | — | (timing/range only) |
| `AbilityCooldown` | 18 | 18 | — | (timing only) |
| `AbilityDuration` | 12 | 12 | — | (timing only) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 50 | 0.5 | adds | Passive HP, modest for T2 |
| `spirit_resistance` | 4% | 0.4 | relies | 30% × 0.2 single-target × (12/18) duration uptime ≈ 4% effective team resist; only vs. one debuffed enemy |
| `spirit_resist_shred` | -6 | 0.6 | adds | -9 × (12/18) duration uptime; single-target so further discount applies downstream |
| `debuff` | — | 1.0 | adds | Item's whole identity is applying an enemy debuff |
| `counter_importance` | — | 1.0 | adds | Strong vs. SP-reliant enemies (Seven, Mirage); situational pick |
| `close_to_team` | — | 0.5 | adds | Debuff value scales when the team can capitalize on the weakened target |

### Notes
GREAT interpretation!
Debuff is a tag for how important would it be to CLEAR this debuff. Something like a fire rate slow is low. But something like a stun debuff is high. Might need to rename that tag.

*(Noted for Phase B: `debuff` tag = severity of "wanting to cleanse THIS kind of CC", not "this item applies a debuff." For items that APPLY a debuff, use the specific axis — `movement_slow`, `fire_rate_slow`, `stun`, `silence`, `disarm`, etc. — and reserve `debuff` for scoring how cleanseworthy each kind is. Spirit Sap's row needs revisiting in Phase B. Also flag in Suggested tag improvements as a rename candidate.)*

---

## Fleetfoot
- **normalized_name**: `fleetfoot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Fleetfoot

### Interpretation
*(Phase A stub)* Active 5s buff: +3 m/s move speed, removes shoot/zoom movement penalty, slide scaling. Passive +6% bullet resist + 35% slow resist. 16s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 6% | 6% | 6% | Passive |
| `SlowResistancePercent` | 35% | 35% | 35% | Passive |
| `ActiveBonusMoveSpeed` | 0 | 3 m/s | TBD | Active 5s / 16s cd |
| `MoveWhileShootingSpeedPenaltyReductionPercent` | 0 | 100% | TBD | Active window — removes shoot-walk penalty |
| `MoveWhileZoomedSpeedPenaltyReductionPercent` | 0 | 100% | TBD | Active window — removes zoom-walk penalty |
| `SlideScale` | 35% | 35% | — | (slide reach buff) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityDuration` | 5 | 5 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Intensifying Magazine
- **normalized_name**: `intensifying_magazine`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Intensifying_Magazine

### Interpretation
*(Phase A stub)* +20% ammo passive. Damage ramps with sustained fire — up to +45% weapon damage after 2.5s of continuous shooting. Rewards extended fire windows.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 20% | 20% | 20% | Passive |
| `BaseAttackDamagePercentAtMaxDuration` | 0 | 45% | TBD | Ramps over 2.5s of sustained fire |
| `ShootDurationForMax` | 2.5 | 2.5 | — | (ramp duration) |

### Calculator tags
*(TBD — Phase B)*

---

## Long Range
- **normalized_name**: `long_range`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Long_Range

### Interpretation
*(Phase A stub)* Range-gated weapon damage: +40% damage at long range (>15m), +8% bullet range, +0.75 m/s sprint. Long-range gun glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LongRangeBonusWeaponPower` | 40% | 40% | TBD | Conditional on enemy >15m |
| `LongRangeBonusWeaponPowerMinRange` | 15 m | 15 m | — | (range gate) |
| `BonusAttackRangePercent` | 8% | 8% | 8% | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Melee Charge
- **normalized_name**: `melee_charge`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Melee_Charge

### Interpretation
*(Phase A stub)* Melee-focused gap-closer: +25 heavy melee damage, +10% melee damage, melee distance ×1.5. Passive +6% bullet resist. 7s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusMeleeDamagePercent` | 10% | 10% | 10% | Passive |
| `BonusHeavyMeleeDamage` | 25 | 25 | TBD | Per heavy melee, 7s cd |
| `MeleeDistanceScale` | 50% | 50% | — | (heavy melee reach extended) |
| `BulletResist` | 6% | 6% | 6% | Passive |
| `AbilityCooldown` | 7 | 7 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Shot
- **normalized_name**: `mystic_shot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Mystic_Shot

### Interpretation
*(Phase A stub)* Bullet proc: +40 magic (spirit) damage on hit. 1s ICD, 8s ability cd, 100% proc chance when ready. +7 SP passive. Cheap gun→spirit converter.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `ProcBonusMagicDamage_Value` | 40 | 40 | TBD | Per bullet hit when ICD ready |
| `ProcChance` | 100% | 100% | — | (always procs when ready) |
| `ProcCooldown` | 1 | 1 | — | (ICD) |
| `SpiritPower` | 7 | 7 | 7 | Passive |
| `AbilityCooldown` | 8 | 8 | — | (timing) |
| `Radius` | 1 m | 1 m | — | (hit radius) |

### Calculator tags
*(TBD — Phase B)*

---

## Opening Rounds
- **normalized_name**: `opening_rounds`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Opening_Rounds

### Interpretation
*(Phase A stub)* Conditional damage: massive +30% bonus weapon damage when enemy is above 50% HP. Plus passive +8% damage, +60% bullet speed, +7 SP. Strong opener for picks.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |
| `BaseAttackDamagePercentBonus` | 0 | 30% | TBD | Conditional on enemy >50% HP |
| `EnemyLifeThreshold` | 50% | 50% | — | (target-HP threshold) |
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive |
| `TechPower` | 7 | 7 | 7 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Slowing Bullets
- **normalized_name**: `slowing_bullets`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Slowing_Bullets

### Interpretation
*(Phase A stub)* Bullet proc that ramps a 30% MS slow + 25% dash reduction over 5 shots, 3.5s duration. Passive +15% weapon damage. Strong gunner-control glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 15% | 15% | 15% | Passive |
| `SlowPercent` | 0 | 30% | TBD | Builds up over 5 shots, 3.5s duration |
| `GroundDashReductionPercent` | 0 | -25% | TBD | Same buildup |
| `SlowDuration` | 3.5 | 3.5 | — | (timing) |
| `BuildUpDuration` | 5 | 5 | — | (ramp window) |
| `BuildUpPerShot` | 0.7 | 0.7 | — | (per-shot ramp) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Shredder Bullets
- **normalized_name**: `spirit_shredder_bullets`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spirit_Shredder_Bullets

### Interpretation
*(Phase A stub)* Bullet proc: -8 TechArmor on hit (spirit_resist_shred), 8s linger. Passive +10% spirit lifesteal.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechArmorDamageReduction` | -8 | -8 | TBD | Applied on bullet hit, 8s linger |
| `DebuffDuration` | 8 | 8 | — | (linger) |
| `AbilityLifestealPercentHero` | 10% | 10% | 10% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Split Shot
- **normalized_name**: `split_shot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Split_Shot

### Interpretation
*(Phase A stub)* Active 5s buff: each shot splits into 5 bullets across 45° spread. Per-stack weapon damage +8% / stack to 5 max for 12s after activating. 27s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletSplitShot` | 0 | 5 | TBD | Active 5s / 27s cd; multi-pellet conversion |
| `SpreadAngleDegrees` | 45° | 45° | — | (cone spread) |
| `WeaponDamagePerStack` | 0% | 8% per stack | TBD | Up to 5 stacks, 12s duration |
| `MaxStacks` | 5 | 5 | — | (cap) |
| `BonusShotsDuration` | 5 | 5 | — | (split-shot buff window) |
| `WeaponDamageBonusDuration` | 12 | 12 | — | (per-stack duration) |
| `AbilityCooldown` | 27 | 27 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Swift Striker
- **normalized_name**: `swift_striker`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Swift_Striker

### Interpretation
*(Phase A stub)* Pure passive: +20% fire rate, +0.75 m/s sprint. Sets the T2 baseline for fire-rate providers.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 20% | 20% | 20% | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Weakening Headshot
- **normalized_name**: `weakening_headshot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Weakening_Headshot

### Interpretation
*(Phase A stub)* On-headshot bullet_resist_shred: -13 bullet resist, 12s linger, diminishing on subsequent applications. Passive +60 HP. Rewards headshot-leaning kits.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResistReduction` | -13 | -13 | TBD | On-headshot, 12s linger, diminishing |
| `DebuffDuration` | 12 | 12 | — | (linger) |
| `DiminishingMultiplier` | 0.5 | 0.5 | — | (subsequent applications halved?) |
| `BonusHealth` | 60 | 60 | 60 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Battle Vest
- **normalized_name**: `battle_vest`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Battle_Vest

### Interpretation
*(Phase A stub)* HP-gated bruiser stat stick: +18% bullet resist, +3 OOC regen, +15% weapon damage and +7% fire rate when you're above 65% HP. Mirrors Hollow Point's carrier-side threshold.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 18% | 18% | 18% | Passive |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |
| `BaseAttackDamagePercent` (gated) | 0 | 15% | TBD | Gated on carrier >65% HP |
| `BonusFireRate` (gated) | 0 | 7% | TBD | Same gate |
| `LifeThreshold` | 65% | 65% | — | (carrier-HP gate) |

### Calculator tags
*(TBD — Phase B)*

---

## Bullet Lifesteal
- **normalized_name**: `bullet_lifesteal`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Bullet_Lifesteal

### Interpretation
*(Phase A stub)* Pure passive: +13% bullet lifesteal, +90 HP. Sets T2 baseline for `bullet_lifesteal` tag.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletLifestealPercent` | 13% | 13% | 13% | Passive |
| `BonusHealth` | 90 | 90 | 90 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Debuff Reducer
- **normalized_name**: `debuff_reducer`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Debuff_Reducer

### Interpretation
*(Phase A stub)* Pure passive +25% status resist. The simplest T2 `debuff_resistance` stick.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StatusResistancePercent` | 25% | 25% | 25% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Enchanters Emblem
- **normalized_name**: `enchanters_emblem`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Enchanters_Emblem

### Interpretation
*(Phase A stub)* Hybrid HP-gated stick: +15 SP, +18% spirit resist, +5% cooldown reduction (verify gate). +2 OOC regen. Above 65% HP suggests carrier-gating.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 15 | 15 | 15 | Passive |
| `TechResist` | 18% | 18% | 18% | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `CooldownReduction` | 5% | 5% | TBD | Verify HP-gating in Phase B |
| `LifeThreshold` | 65% | 65% | — | (carrier-HP gate?) |

### Calculator tags
*(TBD — Phase B)*

---

## Enduring Speed
- **normalized_name**: `enduring_speed`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Enduring_Speed

### Interpretation
*(Phase A stub)* Pure passive mobility + slow-resist: +2 m/s move speed, +25% slow resist, +2 OOC regen.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusMoveSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `SlowResistancePercent` | 25% | 25% | 25% | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Guardian Ward
- **normalized_name**: `guardian_ward`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Guardian_Ward

### Interpretation
*(Phase A stub)* Active ally-buff: 50% cooldown reduction on others, 200 barrier, +2.75 m/s move speed, +8% ability range/radius for 6s. 40m range, 45s cd. Strong support glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReductionPctOnOthers` | 0 | 50% | TBD | Active 6s / 45s cd; applies to ally targets |
| `GuardianWardCombatBarrier` | 0 | 200 HP | TBD | Active barrier on ally |
| `BonusMoveSpeed` (active, ally) | 0 | 2.75 m/s | TBD | Active window |
| `TechRangeMultiplier` (active, ally) | 0 | 8% | TBD | Active window |
| `TechRadiusMultiplier` (active, ally) | 0 | 8% | TBD | Active window |
| `BuffDuration` | 6 | 6 | — | (timing) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |
| `AbilityCastRange` | 40 m | 40 m | — | (cast range) |
| `AbilityCastDelay` | 0.2 | 0.2 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Healbane
- **normalized_name**: `healbane`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healbane

### Interpretation
*(Phase A stub)* Anti-heal proc: -35% heal received + -35% regen on enemy for 8s. +7 SP passive. +275 HP heal on kill. Counter to heal-heavy comps.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealAmpReceivePenaltyPercent` | 0 | -35% | TBD | On enemy hit, 8s duration |
| `HealAmpRegenPenaltyPercent` | 0 | -35% | TBD | Same |
| `TechPower` | 7 | 7 | 7 | Passive |
| `HealOnKill` | 0 | 275 | TBD | On hero kill |
| `AbilityDuration` | 8 | 8 | — | (debuff window) |

### Calculator tags
*(TBD — Phase B)*

---

## Healing Booster
- **normalized_name**: `healing_booster`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Booster

### Interpretation
*(Phase A stub)* +20% healing amp on cast + +20% on regen, +3/sec passive regen, +1 OOC regen. Strong sustain glue for heal-heavy builds.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealAmpCastPercent` | 20% | 20% | 20% | Passive — amplifies healing received from casts |
| `HealAmpRegenPercent` | 20% | 20% | 20% | Passive — amplifies regen |
| `BonusHealthRegen` | 3/sec | 3/sec | 3/sec | Passive in-combat regen |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Reactive Barrier
- **normalized_name**: `reactive_barrier`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Reactive_Barrier

### Interpretation
*(Phase A stub)* Active 10s barrier of 325 HP. 55s cd. Self-cast only? Verify in Phase B.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `VexBarrierCombatBarrier_Value` | 0 | 325 HP | TBD | Active 10s / 55s cd |
| `AbilityDuration` | 10 | 10 | — | (timing) |
| `AbilityCooldown` | 55 | 55 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Restorative Locket
- **normalized_name**: `restorative_locket`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Restorative_Locket

### Interpretation
*(Phase A stub)* Stacking heal storage: 16 HP per stack to 25 max via spirit damage; active releases as burst heal + stamina restore at 20s cd, 35m range. Passive +10% spirit resist. Support-style sustain.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealPerStack_Value` | 16 | 16 | TBD | Per stack (up to 25); released on cast |
| `MaxStacks` | 25 | 25 | — | (cap = 400 HP max storage) |
| `MinStaminaRestore` | 1 | 1 | TBD | Per cast |
| `MaxStaminaRestore` | 4 | 4 | TBD | Per cast (scales with stacks) |
| `TechResist` | 10% | 10% | 10% | Passive |
| `AbilityCastRange` | 35 m | 35 m | — | (cast range — ally target?) |
| `Radius` | 35 m | 35 m | — | (aura/effect range) |
| `AbilityCooldown` | 20 | 20 | — | (timing) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Return Fire
- **normalized_name**: `return_fire`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Return_Fire

### Interpretation
*(Phase A stub)* Active 6s reflect: 65% bullet damage + 25% spirit damage returned to attackers. Passive +10% bullet resist. 23s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletDamageReflectedPct` | 0 | 65% | TBD | Active 6s / 23s cd |
| `SpiritDamageReflectedPct` | 0 | 25% | TBD | Same window |
| `BulletResist` | 10% | 10% | 10% | Passive |
| `AbilityDuration` | 6 | 6 | — | (timing) |
| `AbilityCooldown` | 23 | 23 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Lifesteal
- **normalized_name**: `spirit_lifesteal`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Lifesteal

### Interpretation
*(Phase A stub)* Pure passive: +13% spirit lifesteal, +6 SP, +70 HP. Sets T2 baseline for `spirit_lifesteal` tag.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityLifestealPercentHero` | 13% | 13% | 13% | Passive |
| `TechPower` | 6 | 6 | 6 | Passive |
| `BonusHealth` | 70 | 70 | 70 | Passive |
| `NonHeroAbilityLifestealTooltipOnly` | 3% | 3% | 3% | (vs non-heroes only) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Shielding
- **normalized_name**: `spirit_shielding`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Shielding

### Interpretation
*(Phase A stub)* Spirit-side mirror of Weapon Shielding: 300 HP barrier triggered by 225+ spirit damage in 3.5s window. Passive +2.5 OOC regen, +1.75 m/s move speed. 45s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `OutOfCombatHealthRegen` | 2.5/sec | 2.5/sec | 0.75/sec | × 0.3 OOC uptime |
| `BonusMoveSpeed` | 1.75 m/s | 1.75 m/s | 1.75 m/s | Passive |
| `CombatBarrier_Value` | 0 | 300 HP | TBD | Reactive — triggers on 225+ spirit damage in 3.5s |
| `DamageThreshold` | 225 | 225 | — | (barrier trigger threshold) |
| `DamageWindow` | 3.5 | 3.5 | — | (trigger window) |
| `BarrierDuration` | 8 | 8 | — | (timing) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Trophy Collector
- **normalized_name**: `trophy_collector`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Trophy_Collector

### Interpretation
*(Phase A stub)* Stacking farm utility: +18 gold/min, +0.15 sprint, +0.75% ability range/radius per stack to 16 max. Passive +2 sprint, +2 OOC regen. -15% weapon damage vs non-heroes (anti-farm penalty?).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSprintSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `StackingBonusSprintSpeed` | 0 | 0.15 m/s per stack | TBD | Up to 16 stacks = 2.4 m/s extra sprint |
| `StackingGoldPerMinute` | 0 | 18/min per stack | TBD | Up to 288/min at 16 stacks |
| `StackingTechRangeMultiplier` | 0 | 0.75% per stack | TBD | Up to 12% at 16 stacks |
| `StackingTechRadiusMultiplier` | 0 | 0.75% per stack | TBD | Up to 12% at 16 stacks |
| `NonPlayerBonusWeaponPower` | -15% | -15% | -15% | Passive DOWNSIDE vs non-heroes |
| `MaxStacks` | 16 | 16 | — | (cap) |
| `ThinkRate` | 3 | 3 | — | (stacking tick rate?) |

### Calculator tags
*(TBD — Phase B)*

---

## Arcane Surge
- **normalized_name**: `arcane_surge`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Arcane_Surge

### Interpretation
*(Phase A stub)* Burst spirit-buff active: +20 SP, +12% ability range/radius, +1 stamina, +12% stamina regen, +15% ability duration for 7s. Passive baseline of all those stats? Verify in Phase B.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritPower` | 20 | 20 | TBD | During 7s active? Verify passive vs. active |
| `TechRangeMultiplierBuff` | 12% | 12% | TBD | Same — verify timing |
| `TechRadiusMultiplierBuff` | 12% | 12% | TBD | Same |
| `Stamina` | +1 | +1 | TBD | Same |
| `StaminaCooldownReduction` | 12% | 12% | TBD | Same |
| `BonusAbilityDurationPercent` | 15% | 15% | TBD | Same |
| `AbilityDuration` | 7 | 7 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Bullet Resist Shredder
- **normalized_name**: `bullet_resist_shredder`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Bullet_Resist_Shredder

### Interpretation
*(Phase A stub)* Spirit-damage-triggered bullet armor shred: -10 BulletResist for 8s. Passive +65 HP, +8% bullet resist on carrier.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` | -10 | -10 | TBD | Triggered by spirit damage, 8s linger |
| `BonusHealth` | 65 | 65 | 65 | Passive |
| `BulletResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 8 | 8 | — | (debuff linger) |

### Calculator tags
*(TBD — Phase B)*

---

## Compress Cooldown
- **normalized_name**: `compress_cooldown`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Compress_Cooldown

### Interpretation
*(Phase A stub)* Pure passive: +18% cooldown reduction. T2 ceiling for raw CDR.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 18% | 18% | 18% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Duration Extender
- **normalized_name**: `duration_extender`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Duration_Extender

### Interpretation
*(Phase A stub)* Pure passive +22% ability duration. T2 ceiling candidate for `duration_dependant`.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityDurationPercent` | 22% | 22% | 22% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Improved Spirit
- **normalized_name**: `improved_spirit`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Improved_Spirit

### Interpretation
*(Phase A stub)* T2 SP stat stick: +18 SP, +1 m/s sprint, +75 HP, +1.5 OOC regen.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 18 | 18 | 18 | Passive |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `OutOfCombatHealthRegen` | 1.5/sec | 1.5/sec | 0.45/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Vulnerability
- **normalized_name**: `mystic_vulnerability`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Vulnerability

### Interpretation
*(Phase A stub)* Spirit-damage-triggered spirit_resist_shred: -8 TechArmor for 7s. Passive +8% spirit resist. T2 spirit-side mirror to Spirit Shredder Bullets.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechArmorDamageReduction` | -8 | -8 | TBD | Triggered by spirit damage, 7s linger |
| `TechResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 7 | 7 | — | (debuff linger) |

### Calculator tags
*(TBD — Phase B)*

---

## Quicksilver Reload
- **normalized_name**: `quicksilver_reload`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Quicksilver_Reload

### Interpretation
*(Phase A stub)* Active: instant 100% ammo reload + +10% fire rate for 12s + 44 spirit damage burst. 18s cd. Hybrid gun/spirit item.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AmmoReloadPercent` | 0 | 100% | TBD | On active cast |
| `BonusFireRate` | 0 | 10% | TBD | 12s buff after cast |
| `Damage_Value` | 0 | 44 | TBD | Burst on cast |
| `BuffDuration` | 12 | 12 | — | (buff window) |
| `AbilityCooldown` | 18 | 18 | — | (timing) |
| `AbilityChargeUpTime` | 18 | 18 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Slowing Hex
- **normalized_name**: `slowing_hex`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Slowing_Hex

### Interpretation
*(Phase A stub)* Active 3.5s slow on target: -20% MS, -30% dash distance. 27s cd, 25m cast range. Passive +0.5 m/s sprint.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SlowPercent` | 0 | 20% | TBD | Active 3.5s / 27s cd; single target |
| `GroundDashReductionPercent` | 0 | -30% | TBD | Same window |
| `BonusSprintSpeed` | 0.5 m/s | 0.5 m/s | 0.5 m/s | Passive |
| `AbilityDuration` | 3.5 | 3.5 | — | (timing) |
| `AbilityCooldown` | 27 | 27 | — | (timing) |
| `AbilityCastRange` | 25 m | 25 m | — | (cast range) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Suppressor
- **normalized_name**: `suppressor`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Suppressor

### Interpretation
*(Phase A stub)* Spirit-damage-triggered fire_rate_slow: -28% enemy fire rate for 5s. +6 SP, +8% bullet resist passive. T2 `fire_rate_slow` provider.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `FireRateSlow` | 0 | -28% | TBD | Triggered by spirit damage, 5s linger |
| `TechPower` | 6 | 6 | 6 | Passive |
| `BulletResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 5 | 5 | — | (linger) |

### Calculator tags
*(TBD — Phase B)*

---

## Recharging Rush
- **normalized_name**: `recharging_rush`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Recharging_Rush

### Interpretation
Passive +20% ammo and +10% weapon damage, plus the headline mechanic: dealing 200+ weapon damage within a 3.5s window **refunds one charge of every charged ability you have**. 24s cooldown between refunds. This is the canonical `charge_dependant` provider — on a hero like Lash, Shiv, or Vindicta who builds around extra ability charges, the value is enormous; on a hero with no charge-based abilities it's a flat ammo+damage stick. Strong hybrid-build glue (shooting refills abilities).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 20% | 20% | 20% | Passive |
| `BaseAttackDamagePercent` | 10% | 10% | 10% | Passive |
| `DamageThreshold` | 200 | 200 | — | Charge refund trigger: deal 200 wpn dmg within `DamageWindow` |
| `DamageWindow` | 3.5 | 3.5 | — | (timing) |
| `AbilityCooldown` (charge refund) | 24 | 24 | 1 charge / 24s | Max one ability charge refunded per cd |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | 20% | 1.0 | adds | Solid passive ammo for T2 |
| `bullet_damage` | 10% | 1.0 | adds | Solid for T2 (band 1.0 ≈ 12%) |
| `charge_dependant` | 1 charge / 24s | 1.5 | adds | T2 ceiling for charge supply; the entire mechanic refills a charge per cycle |
| `ability_spam` | — | 0.5 | adds | Extra charges = more casts per fight; gated to charge-using heroes |
| `hybrid_damage_usage` | — | 1.0 | adds | Mechanic literally requires shooting to fuel abilities |
| `magazine_size_dependant` | — | 0.3 | relies | The "shoot a lot to refund" loop rewards heroes with bigger clips |

---

## Kinetic Dash
- **normalized_name**: `kinetic_dash`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Kinetic_Dash

### Interpretation
Passive +1 stamina and +12% stamina recovery, plus on every Dash-Jump you gain a 7s buff: +25% fire rate and +6 temp ammo (until reload). Mobile-shooter glue — encourages dash-shoot-reload-dash loops. Effective fire-rate uptime depends on how often you dash-jump in fights; a typical fight has 2-3 dash-jumps → ~50% uptime on the buff.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Stamina` | +1 | +1 | +1 | Passive charge bonus |
| `StaminaCooldownReduction` | 12% | 12% | 12% | Passive |
| `BonusFireRate` (dash-jump) | 0 | 25% | 12.5% | ~0.5 fight uptime (depends on dash-jump cadence) |
| `BonusClipSize` (temp, dash-jump) | 0 | +6 | +3 | × ~0.5 uptime; consumed by next reload |
| `AbilityDuration` | 7 | 7 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | +0.5 | 0.5 | adds | +1 stamina × 0.5 horizontal weight |
| `vertical_mobility` | +0.5 | 0.5 | adds | +1 stamina × 0.5 vertical weight (dash-jumping is vertical) |
| `fire_rate` | 12.5% | 0.7 | adds | 25% × ~0.5 fight uptime |
| `magazine_size_dependant` | +3 ammo | 0.4 | adds | +6 temp × ~0.5 uptime; flat ammo, not % |
| `charge_dependant` | — | 0.5 | relies | Rewards stamina-charge users (every dash refreshes the buff window) |

### Correction:
The uptime is actually a little bit higher, since its not too hard to use it twice within a single fight, especially if your engaging them. Which is why this should probably also have the engage tag

---

## Stalker
- **normalized_name**: `stalker`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Stalker

### Interpretation
Passive +50 HP and -50% footstep sound (a stealth utility, not a stat). The mechanic: dealing weapon damage to an enemy within 8m **opens a wound** for 5s — wounded enemies take 17 spirit DPS, get -6 bullet resist, and are revealed through walls. 6s cooldown to re-wound. Close-range pressure tool with a strong info component (wallhack on hit). Fits gun→spirit proc pattern with a continuous trigger (sustained close-range fire keeps wounds applied).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `DPS` (wound DoT) | 0 | 17 | ~14 | 17 DPS × (5s/6s cd); item's own output, triggered by close-range gun damage |
| `BulletResistReduction` | 0 | -6 | -5 | -6 × (5/6) duration uptime |
| `BonusMoveSpeed` (wounded enemy) | 0 | +1.5 m/s | +1.25 m/s | × (5/6) uptime |
| `ReduceFootstepSound` | -50% | -50% | -50% | Passive stealth utility |
| `enemy_vision` (wallhack reveal) | — | wounded enemies | active during wound | Reveals through walls for 5s; UI-only tag |
| `ProcRadius` | 8 m | 8 m | — | (proc trigger range) |
| `DebuffRadius` | 25 m | 25 m | — | (linger range for reveal) |
| `AbilityCooldown` | 6 | 6 | — | (timing) |
| `AbilityDuration` | 5 | 5 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 50 | 0.5 | adds | Passive HP, modest for T2 |
| `spirit_continuous_damage` | ~14 DPS | 1.0 | adds | Average Good Situation DPS — the wound DoT, sustained against the marked target |
| `spirit_continuous_proc` | TTP ~0.2s | 1.5 | adds | Triggered by sustained close-range gun damage; proc-per-bullet at <8m |
| `bullet_resist_shred` | -5 | 0.5 | adds | -6 × (5/6) duration uptime; single-target |
| `horizontal_mobility` | +1.25 m/s | 0.7 | adds | Move speed bonus when an enemy is wounded |
| `close_range` | — | 1.0 | adds | 8m proc radius forces close engagement |
| `engage` | — | 1.0 | adds | Stealth + wallhack reveal = strong initiation tool |
| `assist_importance` | — | 1.0 | adds | Reveals-through-walls helps the team collapse on a marked target |
| `hybrid_damage_usage` | — | 0.5 | adds | Gun damage triggers a spirit DoT — modest gun↔spirit synergy |

### Correction:
proccing tags are a little weird. so spirit_continuous_proc is wrong (maybe the unit is wrong). It works like this x_burst_proc is two things in one "Does this require burst damage to proc? and How important is the effect it procs?" same thing with continuous. For example mystic slow has a decent spirit continuous proc since it procs on any spirit damage. BUT because of its low duration it requires the proccing to be refreshed often, so it has both burst proc and continuous proc, but leans more on the continuous. Does this make sense? Also, assist importance would be a bit lower since its mostly scored highly for items that rescue or heal teamates or applies a debuf to enemies that helps EVERYONE not just yourself (this application alot less so).

---

## Weapon Shielding
- **normalized_name**: `weapon_shielding`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Weapon_Shielding

### Interpretation
Passive +2.5 OOC regen and +1.75 m/s move speed, plus a reactive 300 HP barrier (8s duration) that triggers whenever you take 250+ weapon damage from enemy heroes within a 4s window. 35s cooldown. This is per the user's correction a `bullet_resistance` (defensive reaction to weapon damage) *and* a `burst_resistance` (triggers on a burst) *and* a `shield` (it's a literal barrier). One item, three resistance flavors.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `OutOfCombatHealthRegen` | 2.5/sec | 2.5/sec | 0.75/sec | × 0.3 OOC fight uptime |
| `BonusMoveSpeed` | 1.75 m/s | 1.75 m/s | 1.75 m/s | Passive |
| `CombatBarrier_Value` | 0 | 300 HP | ~300 HP / 35s | Reactive barrier — triggers on 250+ weapon damage in 4s window; 8s duration; multi-tag (`shield` + `bullet_resistance` + `burst_resistance`) |
| `DamageThreshold` | 250 | 250 | — | (barrier trigger threshold) |
| `DamageWindow` | 4 | 4 | — | (trigger window) |
| `BarrierDuration` | 8 | 8 | — | (timing) |
| `AbilityCooldown` | 35 | 35 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | 1.75 m/s | 0.8 | adds | Move speed (not sprint), full weight |
| `self_heal` | 0.75/sec | 0.3 | adds | 2.5 × 0.3 OOC uptime |
| `shield` | 300 HP / 35s | 1.0 | adds | One barrier per ~major fight; T2 ceiling for reactive shield |
| `bullet_resistance` | ~10% | 0.8 | adds | Per user correction — barrier triggered by weapon dmg counts as `bullet_resistance` (~300 HP / ~3000 HP fight pool ≈ 10% mitigation) |
| `burst_resistance` | ~12% | 1.0 | adds | Specifically triggers on burst (250 in 4s) so weighted higher vs. burst damage profile |
| `damage_sponge` | — | 0.7 | adds | Passive barrier soaks one burst per fight |

### Correction
Dont forget to look at the existing tags. bullet_burst_resistance would have litterally been perfect here. With a bit of bullet_continous_resistance too.  also some escape as well.
---

## Cold Front
- **normalized_name**: `cold_front`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Cold_Front

### Interpretation
Passive +6% spirit resist, plus an active cone-AoE on 25s cooldown: expands from 2m to 12m over 0.6s, deals 95 spirit damage (+ 0.47× SP scaling) and slows enemies by -60% for 4s. Big-radius zoning ability — slow more than damage. The 12m end radius means in a clustered fight you can hit most of the enemy team.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 6% | 6% | 6% | Passive |
| `Damage_Value` (active) | 0 | 95 + 0.47×SP | ~36/cast | 95 burst per 25s cd, scales with SP |
| `MovementSpeedSlow` (active) | 0 | 60% | 9.6% | 60% × (4s/25s cd) sustained team slow |
| `EndRadius` | 12 m | 12 m | — | (informs aoe_cluster) |
| `AbilityDuration` | 4 | 4 | — | (timing) |
| `AbilityCooldown` | 25 | 25 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | 6% | 0.5 | adds | Passive, effective % reduction |
| `spirit_burst_damage` | ~12 DPS | 0.8 | adds | Avg Good Situation DPS — 95 burst × 3 enemies hit / 25s cd ≈ 11-13 DPS team-wide |
| `movement_slow` | 9.6% | 1.0 | adds | 60% × (4/25) sustained team slow |
| `aoe_cluster` | 60% | 1.0 | adds | 12m end radius typically catches 3 of 5 enemies in a teamfight |
| `spirit_power` | — | 0.5 | relies | Damage scales 0.47× SP — modest reliance |
| `engage` | — | 1.0 | adds | Slow + AoE = solid fight initiator |
| `trap_block_obstruct` | ~8 | 1.0 | adds | Effective time × heroes — 4s slow × ~2 heroes ≈ 8 hero-seconds per cast |
| `close_to_team` | — | 0.5 | adds | Slow value scales when the team can capitalize on the affected enemies |

### Correction
maybe add some burst damage? Maybe a rule should be that burst damage is spiritburst/2+weaponburst/2 idk.
close to team is a bit stretching it, probably a bit lower but its fine.

---

## Mystic Slow
- **normalized_name**: `mystic_slow`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Slow

### Interpretation
Passive +30 HP and +0.75 m/s sprint, plus a proc: any spirit damage you deal applies a -30% move speed / -12% dash distance debuff for 2s. No internal cooldown listed, so every spirit hit refreshes the slow. Cheap T2 control glue for any spirit-damage hero.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 30 | 30 | 30 | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |
| `MovementSpeedSlow` (proc) | 0 | 30% | 24% | 30% × ~0.8 uptime (refreshes on every spirit hit) |
| `GroundDashReductionPercent` (proc) | 0 | -12% | -10% | Same proc, same uptime |
| `AbilityDuration` | 2 | 2 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 30 | 0.3 | adds | Modest HP for T2 |
| `horizontal_mobility` | +0.375 m/s | 0.4 | adds | 0.75 sprint × 0.5 sprint weight |
| `movement_slow` | 24% | 1.2 | adds | 30% × ~0.8 uptime — strong slow when paired with any spirit damage |
| `spirit_burst_proc` | TTP ~2s | 1.0 | adds | Triggered by spirit damage; typical spirit hero casts every 2-3s |
| `spirit_power` | — | 0.3 | relies | Slow doesn't scale with SP, but proc cadence is dictated by ability casts |
| `close_to_team` | — | 0.5 | adds | Slow lets teammates capitalize on slowed targets |

### Correction
Needs spirit continous proc and needs it to be higher than burst proc. This only lasts a couple seconds so bursts of damage is less effective than continous.  You reminded me of annother thing. In the game you get weapon damage up, spirit up, and health up for buying items in weapon/spirit/vitality categories. All items of those categories should have atleast a base .15 to reflect that.

---

# T3 (3200 souls)

## Alchemical Fire
- **normalized_name**: `alchemical_fire`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Alchemical_Fire

### Interpretation
User-flagged "relies on spirit power" example. Thrown active on a 30s cooldown: leaves a 10m radius fire pool for 5s dealing 45 DPS (95 max with stacking ticks; tick rate 0.5s). Also reduces bullet armor by 7 on hit (a small bullet_resist_shred). The +10 SpiritPower is a flat passive bonus.

The item itself **deals spirit damage** (45-95 DPS), so it adds full credit to `spirit_damage`. It **also benefits from spirit power** (the DPS scales with the carrier's SP, as is standard for spirit items), so it's a `relies` for `spirit_power` — buying this rewards SP-heavy builds. The +10 SP it grants is itself a small `adds` to `spirit_power`. Don't double-count: one row for each mode.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DPS_Value` (fire pool) | 0 | 45 → 95 ramp | ~37 burst-avg | DoT for 5s every 30s; ramps from 45 → 95 over the 5s window |
| `DPSMax_Value` | 95 | 95 | — | (ceiling of the DoT ramp) |
| `SpiritPower` | 10 | 10 | 10 | Passive flat |
| `BulletArmorReduction_Value` | 0 | -7 | -2 | -7 × (5/30) × 0.2 single-target |
| `Radius` | 10 m | 10 m | — | (aoe footprint) |
| `NonHeroReductionPercent` | 50% | 50% | — | (dmg vs. NPCs halved) |
| `AbilityCooldown` | 30 | 30 | — | (timing) |
| `AbilityDuration` | 5 | 5 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_continuous_damage` | ~37 DPS | 1.2 | adds | Avg Good Situation DPS — 70 mid-DPS over 5s window / 30s cd; fight-relevance averaged |
| `spirit_power` | 10 | 0.4 | adds | Flat passive — small for T3 |
| `spirit_power` | +5 | 0.5 | relies | DoT scales with carrier's SP; rewards SP-heavy builds (extra synergy ≈ 0.5× the flat passive) |
| `bullet_resist_shred` | -2 | 0.2 | adds | -7 × (5/30) × 0.2 single-target ≈ very minor; only enemies in the pool |
| `aoe_cluster` | ~50% | 0.8 | adds | 10m radius pool; in a teamfight ~2-3 of 5 enemies pass through |
| `trap_block_obstruct` | ~10 | 1.0 | adds | 5s zone × ~2 hero-seconds of effective denial per cast |
| `hybrid_damage_usage` | — | 0.5 | adds | Spirit damage item that rewards SP investment |

### Correction
Forgot to account for range, duration, and cooldown dependance. Remember since its dependant its significantly smaller but still there. 
---

## Berserker
- **normalized_name**: `berserker`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Berserker

### Interpretation
Per-stack item: gain +7% weapon damage per stack, up to 10 stacks (= 70% max). One stack per 120 damage taken; stacks last 10s. Also passive +8 bullet_resist. In a real fight you don't reach max stacks instantly — you need to eat 1200 damage to cap, which only happens in extended bruiser fights. Use the project convention `per_stack ≈ 0.6 × max` for typical fight uptime → ~6 stacks = 42% weapon damage on average.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `WeaponPowerPerStack` | 7% | 7% per stack | 42% | × ~6 average held stacks (0.6 × max 10) |
| `BulletResist` | 8% | 8% | 8% | Passive |
| `DamageToStack` | 120 | 120 | — | (120 damage taken to gain 1 stack) |
| `MaxStacks` | 10 | 10 | — | (cap) |
| `DamageDuration` | 10 | 10 | — | (stack lifetime; refreshes on new stack) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 42% | 1.5 | adds | 70% × 0.6 per_stack ramp — best-for-T3 weapon damage when ramped (T3 band 1.5 ≈ 35%) |
| `bullet_resistance` | 8% | 0.6 | adds | Passive, modest for T3 |
| `high_max_hp` | — | 1.0 | relies | Stack gain requires absorbing 120 damage per stack — bigger HP pool = more stacks ramped before dying |
| `damage_sponge` | — | 1.0 | relies | Same logic — item rewards high-EHP / mitigation builds that can soak damage to fuel stacks |
| `self_heal` | — | 0.5 | relies | Sustain helps you stay alive long enough to keep stacks refreshing |

---

## Blood Tribute
- **normalized_name**: `blood_tribute`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Blood_Tribute

### Interpretation
User's worked example. Toggleable: +35% fire rate while active, but you drain 50 HP/sec from yourself (TickRate 0.1s, so really 5 HP per tick, 10 ticks/sec = 50/sec). Passive +8 spirit resist, +35% status resist, +2 m/s move speed, +4 out-of-combat regen. The toggle is the main thing — players keep it on during target windows, off otherwise, so effective uptime in a team fight is ~75%.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` (toggled) | 0 | 35% | 26% | 35% × 0.75 toggle uptime — user's worked example |
| `HealthDrainedPerSecond` (toggled) | 0 | -50/sec | -37/sec | Self-damage cost; -50 × 0.75 toggle uptime |
| `TechResist` | 8% | 8% | 8% | Passive |
| `StatusResistancePercent` | 35% | 35% | 35% | Passive |
| `InnateStatusResistancePercent` | 8% | 8% | 8% | Passive (combines with the 35%) |
| `BonusMoveSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC uptime |
| `TickRate` | 0.1 | 0.1 | — | (HP drain ticks 10×/sec at 5 HP each) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate` | 26% | 1.5 | adds | Best-for-T3 fire-rate; 35% × 0.75 toggle uptime |
| `high_max_hp` | -37 HP/sec | -1.0 | adds | Self-damage drain; significant downside encoded as negative `high_max_hp` (candidate `self_damage` tag once added) |
| `spirit_resistance` | 8% | 0.6 | adds | Passive, modest for T3 |
| `debuff_resistance` | 35% | 1.5 | adds | Best-for-T3 debuff resistance |
| `horizontal_mobility` | 2 m/s | 1.0 | adds | Move speed (not sprint), full weight — great for T3 |
| `self_heal` | 1.2/sec | 0.4 | adds | OOC regen × 0.3 uptime |
| `self_heal` | — | 1.0 | relies | Self-damage drain rewards heroes with strong self-heal to offset — pairs well with sustain abilities |
| `damage_sponge` | — | 0.5 | relies | Big HP pools tolerate the drain better than squishies |

---

## Hollow Point
- **normalized_name**: `hollow_point`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Hollow_Point

### Interpretation
Conditional weapon damage: +35% bullet damage when **YOU (the carrier)** are above 65% HP. Wiki wording: *"When you are above 65% health, deal additional Weapon Damage and your bullets reduce enemy Bullet Resist."* Players start each fight at 100% and only fall below 65% in the latter portion of an extended engagement, so the buff is active for the *majority* of a fight — effective uptime ≈ 0.75. The item's own +125 HP passively helps keep the carrier above the threshold (mild self-synergy). On hit applies -9 bullet armor reduction (bullet_resist_shred) for 8s on the enemy.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` (gated) | 0 | 35% | 26% | Gated on carrier >65% HP; ≈ 0.75 fight uptime |
| `BulletArmorReduction` (gated) | 0 | -9 | -7 | -9 × 0.75 carrier-side uptime; on-hit, 8s linger |
| `LifeThreshold` | 65% | 65% | — | (carrier-HP threshold; gates the above two) |
| `BonusHealth` | 125 | 125 | 125 | Passive — also helps stay above the 65% threshold |
| `OutOfCombatHealthRegen` | 4.5/sec | 4.5/sec | 1.35/sec | × 0.3 OOC uptime |
| `DebuffDuration` | 8 | 8 | — | (bullet_resist_shred linger) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 26% | 1.3 | adds | 35% × 0.75 carrier-side uptime — strong T3 conditional weapon damage |
| `bullet_resist_shred` | -7 | 1.0 | adds | -9 × 0.75 carrier-side uptime; lingers 8s on the engaged target |
| `high_max_hp` | 125 | 1.2 | adds | T3 baseline HP — and the +125 helps satisfy the 65%-HP gate longer |
| `self_heal` | 1.35/sec | 0.4 | adds | 4.5/sec × 0.3 OOC uptime |
| `self_heal` | — | 0.5 | relies | Sustain keeps the carrier above 65% HP longer (lengthens bonus window) |
| `high_max_hp` | — | 0.5 | relies | More base HP → more absolute HP above the 65% threshold → longer bonus window |

---

## Heroic Aura
- **normalized_name**: `heroic_aura`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Heroic_Aura

### Interpretation
Passive +1.5 m/s sprint to self, plus +17% bullet resist aura to nearby ALLIES (30m, ally-only). Active on 22s cd, 7s duration: grants self + nearby allies +26% fire rate and +2.25 m/s move speed; minions get 2× the move speed bonus. Pure team-glue item — every effect either buffs allies or wants allies near you. Closest thing to a hard `close_to_team` item in the focus list so far.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSprintSpeed` (self) | 1.5 m/s | 1.5 m/s | 1.5 m/s | Passive |
| `BulletResist` (ally aura) | 17% | 17% | 17% | Aura to allies in 30m; does NOT apply to self |
| `BonusFireRate` (active, self+allies) | 0 | 26% | 8.3% | × (7/22) active uptime |
| `ActiveBonusMoveSpeed` (active, self+allies) | 0 | 2.25 m/s | 0.72 m/s | × (7/22) active uptime |
| `Radius` / `ActiveRadius` | 30 m | 30 m | — | (aura range) |
| `NonHeroMult` | 2 | 2 | — | (minions get 2× move speed) |
| `AbilityCooldown` | 22 | 22 | — | (timing) |
| `AbilityDuration` | 7 | 7 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | +0.75 m/s | 0.6 | adds | 1.5 sprint × 0.5 sprint weight |
| `bullet_resistance` (ally) | 17% | 1.5 | adds | Strong ally bullet-resist aura at T3 (full uptime when close) |
| `fire_rate` | 8.3% | 0.7 | adds | 26% × (7/22) active uptime; applies to self + allies |
| `horizontal_mobility` | +0.72 m/s | 0.5 | adds | 2.25 × (7/22) active uptime |
| `ally_buff` | — | 1.5 | adds | Multi-ally bullet-resist aura is the headline value driver |
| `close_to_team` | — | 1.5 | adds | Item only pays out when allies are within 30m |
| `assist_importance` | — | 1.0 | adds | Buffs ally damage uptime more than self kill-securing |
| `engage` | — | 1.0 | adds | Active is a clear team-fight initiator |

---

## Tesla Bullets
- **normalized_name**: `tesla_bullets`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Tesla_Bullets

### Interpretation
Bullet proc: 15% chance per shot to spawn a 33-spirit-damage shock that chains to up to 4 nearby enemies within 8m. 0.25s internal cooldown between procs. Damage scales 0.19× spirit power. Classic gun→spirit damage converter and the canonical `aoe_cluster` weapon item — in a stacked fight a single proc can hit the entire enemy team. Best when the carrier has fire rate to maximize proc rolls.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DamagePerChain_Value` | 33 + 0.19×SP | 33 + 0.19×SP | per chain | Damage per shock jump; scales with SP |
| `ChainCount` | 1 | 4 | ~3 | Typical clustered fight; up to 4 in stacked fights |
| `ChainRadius` | 8 m | 8 m | — | (chain hop range) |
| `ProcChance` | 15% | 15% | — | per bullet |
| `ProcCooldown` | 0.25 | 0.25 | — | internal cooldown between procs |
| `ChainTickRate` | 0.4 | 0.4 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_burst_damage` | ~80 DPS | 1.5 | adds | Avg Good Situation DPS — 33 × ~3 chains hit × ~0.75 procs/sec ≈ 75-85 DPS in clustered fight |
| `spirit_burst_proc` | TTP ~1.3s | 1.5 | adds | 5 shots/sec × 15% = 0.75 procs/sec; T3 ceiling for bullet-triggered spirit procs |
| `bullet_proc` | — | 1.5 | adds | Headline T3 bullet-proc item |
| `aoe_cluster` | ~70% | 1.5 | adds | Chains to 4 → 80% team coverage in a stacked fight |
| `spirit_power` | — | 1.0 | relies | Chain damage scales 0.19× SP per hop × 4 hops = 0.76× total scaling — meaningful SP synergy |
| `hybrid_damage_usage` | — | 1.5 | adds | Textbook item rewarding mixed gun + SP builds |
| `close_to_team` | — | 0.5 | adds | Chain radius rewards enemies being clustered (contested objectives) |

---

## Fury Trance
- **normalized_name**: `fury_trance`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Fury_Trance

### Interpretation
Passive +100 HP and +14% bullet lifesteal. Active on 18s cd, 6s duration: +30% fire rate, +40% spirit resist — but **silences you and disables stamina** for the whole window. So you can't cast abilities, can't dash, can't air-jump for 6 seconds. It's a "win-more / commit-to-shooting" button: pop it when you're already in a clean gunfight, never as a panic button. Effective uptime depends on disciplined activation; assume 6/18 ≈ 33% in a fight where you committed to it.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `BulletLifestealPercent` | 14% | 14% | 14% | Passive |
| `ActiveBonusFireRate` | 0 | 30% | 10% | × (6/18) active uptime |
| `TechResist` (active) | 0 | 40% | 13% | × (6/18) active uptime |
| `self_silence` (active) | — | — | DOWNSIDE | Silenced for the 6s active window |
| `stamina_lock` (active) | — | — | DOWNSIDE | No stamina use during the active |
| `AbilityCooldown` | 18 | 18 | — | (timing) |
| `AbilityDuration` | 6 | 6 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 100 | 0.7 | adds | Passive HP, decent for T3 |
| `bullet_lifesteal` | 14% | 1.0 | adds | Strong passive lifesteal for T3 |
| `fire_rate` | 10% | 0.7 | adds | 30% × (6/18) active uptime |
| `spirit_resistance` | 13% | 1.0 | adds | 40% × (6/18) effective % reduction; great for T3 active |
| `damage_sponge` | — | 0.5 | adds | Lifesteal + spirit resist windows soak burst |
| `escape` | — | -0.5 | adds | NEGATIVE — silence + stamina lock during active actively prevents escape |
| `ability_spam` | — | -0.5 | adds | NEGATIVE — silenced for active window, hostile to ability-spam builds |
| `single_ability_focus` | — | 0.3 | relies | Best on heroes who can commit to gun-only output during the active (don't need their abilities to fight) |

---

## Rescue Beam
- **normalized_name**: `rescue_beam`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Rescue_Beam

### Interpretation
Passive +0.75 m/s sprint and +6% ability range, plus an active beam on 60s cd: channel for 2.5s at up to 35m range to heal a target ally for 20% of their max HP — and yourself for 20%. Once per channel you can **pull the ally toward you**. Pure support glue: save-an-ally tool that doubles as a long-range engage by yanking allies into the fight. Self-cast works but at reduced benefit.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |
| `TechRangeMultiplier` | 6% | 6% | 6% | Passive (also `TechRadiusMultiplier` same value) |
| `HealPercentAmount` (ally + self) | 0 | 20% Max HP | ~160 HP/cast | 2.5s channel; `SelfModifier=100` means caster heals at full value too |
| `AbilityCastRange` | 35 m | 35 m | — | (long range) |
| `AbilityChannelTime` | 2.5 | 2.5 | — | (commit window; channeled_vulnerable) |
| `AbilityCooldown` | 60 | 60 | — | (timing) |
| `channeled_vulnerable` | 2.5s exposed | 2.5s exposed | — | UI-only — caster locked in channel |
| pull (option during channel) | 0 | 1 ally / cast | 1 / 60s | Optional displace toward caster |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | +0.375 m/s | 0.3 | adds | 0.75 sprint × 0.5 sprint weight |
| `range_extender_dependant` | 6% | 0.7 | adds | Effective range % up on all range/radius items |
| `burst_heal` | ~160 HP | 1.5 | adds | Effective Total Healing per cast — 20% × ~800 ally HP ≈ 160 HP burst |
| `team_heal` | 160 HP / 60s | 1.5 | adds | Big single-target ally heal; save-an-ally use spikes value well above the raw |
| `self_heal` | ~160 HP / 60s | 1.0 | adds | Caster heals at full value via SelfModifier=100 |
| `displace` | — | 1.5 | adds | Pull mechanic literally displaces an ally |
| `escape` | — | 1.0 | adds | Pulling a dying ally out of bad position = save tool |
| `engage` | — | 0.5 | adds | Can pull a diver ally into reinforcement range |
| `assist_importance` | — | 1.5 | adds | Entire item is about enabling allies, not self kills |
| `ally_buff` | — | 1.0 | adds | Heal + displace = strong ally support |
| `close_to_team` | — | 1.0 | adds | Only useful with allies in 35m range |
| `escape` | — | -0.5 | adds | NEGATIVE during the 2.5s channel — caster is locked and exposed |

---

## Warp Stone
- **normalized_name**: `warp_stone`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Warp_Stone

### Interpretation
Active-only item. On 16s cd, teleport 11m straight ahead (camera direction; requires line of sight, halts your velocity on cast). For 6s after the warp, +30% bullet resist. The signature `escape` item — instant repositioning + a meaningful damage-reduction window after landing. Doubles as an engage tool on aggressive heroes.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| teleport distance | 0 | 11 m | 0.69 m/s | 11m / 16s cd averaged into continuous repositioning |
| `BulletResist` (post-warp) | 0 | 30% | 11% | × (6/16) sustained uptime |
| `AbilityCastRange` | 11 m | 11 m | — | (blink range) |
| `CasterBuffDuration` | 6 | 6 | — | (timing of post-warp buff) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | +0.69 m/s | 0.7 | adds | 11m / 16s cd = 0.69 m/s effective continuous repositioning |
| `vertical_mobility` | +0.35 m/s | 0.4 | adds | Half — blink can clear vertical obstacles when aimed up |
| `escape` | — | 1.5 | adds | Best-in-tier escape — instant repositioning with built-in bullet resist landing |
| `engage` | — | 1.0 | adds | Same blink works as offensive gap-close |
| `bullet_resistance` | 11% | 1.0 | adds | 30% × (6/16) sustained uptime — meaningful when used in engagements |
| `cc_resist` | — | 0.5 | adds | Per user correction — mobility helps avoid getting CC'd in the first place |

### Notes
Other than the lack of coldown redution and range dependency good!


---

## Dispel Magic
- **normalized_name**: `dispel_magic`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Dispel_Magic

### Interpretation
Passive +10% spirit resist, plus an active on 40s cd that **purges all non-ultimate negative effects** on you, heals 250 HP, and gives +2 m/s move speed for 3s. Self-cast only. Cannot be used while stunned or asleep (the obvious gotcha). The canonical hard-counter to CC-heavy enemy comps; nearly mandatory if the enemy team has Yamato, Bebop, or a heavy silence kit.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 10% | 10% | 10% | Passive |
| `dispel` (active) | 0 | full non-ult cleanse | 1 cleanse / 40s | Self-cast only; cannot use while stunned/asleep |
| `HealOnActivate` | 0 | 250 HP burst | 250 HP / 40s | Active |
| `ActiveBonusMoveSpeed` | 0 | +2 m/s | +0.15 m/s | × (3/40) sustained |
| `BuffDuration` | 3 | 3 | — | (move-speed buff window) |
| `AbilityCooldown` | 40 | 40 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | 10% | 0.8 | adds | Passive, effective % reduction |
| `cc_resist` | — | 1.5 | adds | Full dispel of non-ult debuffs — strongest cc_resist effect at T3 |
| `burst_heal` | 250 HP | 1.0 | adds | Effective Total Healing per cast |
| `self_heal` | 250 HP / 40s | 1.0 | adds | Same burst, framed per-cooldown |
| `horizontal_mobility` | +0.15 m/s | 0.1 | adds | 2 × (3/40) sustained — minor |
| `counter_importance` | — | 1.5 | adds | Direct counter to silence/stun/disarm comps |
| `escape` | — | 1.0 | adds | Cleanse + heal + speed = strong panic-out button |

---

## Radiant Regeneration
- **normalized_name**: `radiant_regeneration`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Radiant_Regeneration

### Interpretation
Passive +90 HP, plus two distinct heal triggers — neither is an aura (self-heal only). **Trigger A**: dealing spirit damage to enemy heroes grants you regen at `4 + 0.04×SP` HP/sec for 6s, *stacks once per different hero hit*. **Trigger B**: every ability cast heals you for `70 + 2×Boon` HP and gives +1.75 m/s move speed for 3s, 6s cd. Sustain-tuned spirit item: more abilities cast and more enemy heroes hit = more healing.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 90 | 90 | 90 | Passive |
| `Regeneration_Value` (spirit-dmg trigger) | 0 | (4 + 0.04×SP)/sec | ~6 HP/sec | Triggered by spirit damage to enemy heroes; stacks per different hero hit, 6s duration each |
| `HealingPerCast_Value` (ability-cast trigger) | 0 | 70 HP | ~12 HP/sec | 70 HP / 6s cd ≈ 12 HP/sec sustained when casting on cooldown |
| `BonusMoveSpeed` (post-cast) | 0 | +1.75 m/s | +0.87 m/s | × (3/6) sustained when casting on cooldown |
| `AbilityCooldown` (cast trigger) | 6 | 6 | — | (timing) |
| `RegenerationDuration` | 6 | 6 | — | (per-stack duration of regen trigger) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 90 | 0.6 | adds | Passive HP, modest for T3 |
| `continous_heal` | ~6 HP/sec | 1.0 | adds | Effective Healing/Second — 4/sec base regen with 1-2 stacks active in a fight |
| `burst_heal` | ~70 HP / 6s | 1.0 | adds | Effective Total Healing per ability cast |
| `spirit_power` | — | 0.5 | relies | Regen scales 0.04× SP, so SP-heavy builds amplify the continuous heal |
| `horizontal_mobility` | +0.87 m/s | 0.6 | adds | 1.75 × (3/6) sustained when casting on cooldown |
| `ability_spam` | — | 0.5 | relies | Heal triggers on cast — frequent casters extract more value |
| `multi_ability_focus` | — | 0.5 | adds | Any ability cast triggers; not gated to one slot |
| `damage_sponge` | — | 0.5 | adds | Two heal triggers = better effective HP through sustain |

---

## Ballistic Enchantment
- **normalized_name**: `ballistic_enchantment`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Ballistic_Enchantment

### Interpretation
*(Phase A stub)* Active 14s buff with per-stack weapon damage: +20% per stack on hero hits, +5% per stack on non-hero hits (cap 8 stacks). Also +20% ability range/radius. Bullet-shot weapon-power scaler.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `WeaponPowerPerStack` | 0 | 20% per stack | TBD | Hero hits stack — verify cap |
| `WeaponPowerPerStackNonHero` | 0 | 5% per stack | TBD | Non-hero hits stack to `NonHeroStackLimit=8` |
| `NonHeroStackLimit` | 8 | 8 | — | (cap) |
| `TechRangeMultiplier` | 20% | 20% | TBD | During 14s active? Verify |
| `TechRadiusMultiplier` | 20% | 20% | TBD | Same |
| `AbilityDuration` | 14 | 14 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Burst Fire
- **normalized_name**: `burst_fire`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Burst_Fire

### Interpretation
*(Phase A stub)* Passive +10% fire rate. Active 4.5s burst: +32% fire rate, +1.25 m/s move speed, +50% slide scale. 9s cd.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 10% | 10% | 10% | Passive |
| `ActivatedFireRate` | 0 | 32% | TBD | Active 4.5s / 9s cd |
| `BonusMoveSpeed` | 0 | 1.25 m/s | TBD | Active window |
| `SlideScale` | 50% | 50% | — | (slide reach buff) |
| `AbilityCooldown` | 9 | 9 | — | (timing) |
| `AbilityDuration` | 4.5 | 4.5 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Cultist Sacrifice
- **normalized_name**: `cultist_sacrifice`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Cultist_Sacrifice

### Interpretation
*(Phase A stub)* Sacrifice-allied-creep utility with a long 270s cd. +170% souls bonus and farm bonuses. Verify mechanics in Phase B — likely a farm/jungle item.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSoulsPct` | 170% | 170% | TBD | On sacrifice cast |
| `NonPlayerBonusWeaponPower` | 30% | 30% | 30% | Passive vs. non-heroes |
| `NonPlayerBulletResist` | 30% | 30% | 30% | Passive vs. non-heroes |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `BonusHealth_Value` | 50 | 50 | 50 | Passive |
| `BaseAttackDamagePercent_Value` | 8% | 8% | 8% | Passive |
| `BonusAbilityCharges` | +1 | +1 | +1 | Passive |
| `TechRangeMultiplier` | 12% | 12% | 12% | Passive |
| `TechRadiusMultiplier` | 12% | 12% | 12% | Passive |
| `AbilityCooldown` | 270 | 270 | — | (timing — very long) |
| `AbilityDuration` | 160 | 160 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Escalating Resilience
- **normalized_name**: `escalating_resilience`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Escalating_Resilience

### Interpretation
*(Phase A stub)* Per-stack bullet resist (up to 30 stacks × 2% = 60% bullet resist cap). 24s stack duration. Passive +15% weapon damage, +75 HP, +30% ammo.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResistPerStack` | 0 | 2% per stack | TBD | Up to 30 stacks = 60% bullet resist |
| `MaxArmorStacks` | 30 | 30 | — | (cap) |
| `BulletResistDuration` | 24 | 24 | — | (per-stack duration) |
| `BaseAttackDamagePercent` | 15% | 15% | 15% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `BonusClipSizePercent` | 30% | 30% | 30% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Express Shot
- **normalized_name**: `express_shot`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Express_Shot

### Interpretation
*(Phase A stub)* Charged shot: consumes 2 ammo, fires at 100% bullet velocity bonus, deals +125% weapon damage (40% on alt-fire). 8s cd. Passive +60% bullet speed, +8% damage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive |
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |
| `ProcBaseAttackDamagePercent_Value` | 0 | 125% | TBD | On charged shot, 8s cd |
| `ProcBaseAttackDamagePercentAltFire_Value` | 0 | 40% | TBD | On alt-fire variant |
| `ProcBulletVelocity` | 0 | 100% | TBD | On charged shot |
| `ProcAmmoConsumed` | 2 | 2 | — | (ammo cost per proc) |
| `AbilityCooldown` | 8 | 8 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Headhunter
- **normalized_name**: `headhunter`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Headhunter

### Interpretation
*(Phase A stub)* On-headshot proc: +75 bonus damage, heal 4% of max HP, +1.75 m/s move speed for 3s. 8s cd. Passive +5% damage, +50 HP. Headshot-affinity item.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HeadShotBonusDamage_Value` | 0 | 75 | TBD | Per headshot, 8s cd |
| `HealPercentPerHeadshot_Value` | 0 | 4% | TBD | Per headshot heal |
| `BonusMoveSpeed` (post-headshot) | 0 | 1.75 m/s | TBD | 3s buff after proc |
| `MovementSpeedBonusDuration` | 3 | 3 | — | (move buff duration) |
| `BaseAttackDamagePercent` | 5% | 5% | 5% | Passive |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `ProcChance` | 100% | 100% | — | (always procs when cd ready) |
| `AbilityCooldown` | 8 | 8 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Hunters Aura
- **normalized_name**: `hunters_aura`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Hunters_Aura

### Interpretation
*(Phase A stub)* Passive aura: enemies in 15m radius take -10 bullet armor, -14% fire rate. Single-target enemies get 2× the values. +100 HP, +0.75 sprint.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` (aura) | -10 | -10 | -10 | Passive aura, 15m radius |
| `FireRateSlow` (aura) | 0 | -14% | -14% | Same aura |
| `SingleTargetPlayerMultiplier` | 2 | 2 | — | (single-target enemy doubles the values) |
| `Radius` | 15 m | 15 m | — | (aura radius) |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Point Blank
- **normalized_name**: `point_blank`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Point_Blank

### Interpretation
*(Phase A stub)* Close-range stat stick: +50% weapon damage within 15m, +25% slow on hit at close range, +30% melee resist, +75 HP. The T3 close-range scaler.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CloseRangeBonusWeaponPower` | 50% | 50% | TBD | Conditional on enemy within 15m |
| `CloseRangeBonusDamageRange` | 15 m | 15 m | — | (range gate) |
| `SlowPercent` | 0 | 25% | TBD | On hit at close range, 2s duration |
| `SlowDuration` | 2 | 2 | — | (timing) |
| `MeleeResistPercent` | 30% | 30% | 30% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Shadow Weave
- **normalized_name**: `shadow_weave`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Shadow_Weave

### Interpretation
*(Phase A stub)* Invisibility active (10s) with ambush buffs: +20% fire rate, +20 SP, +20 heavy melee damage during the 5s ambush window after breaking invis. +5 m/s invis move speed, +1.5 sprint, +5 OOC regen. 45s cd. Classic ambush opener.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `InvisDuration` | 0 | 10s | TBD | Active 10s / 45s cd |
| `InvisMoveSpeedMod` | 0 | 5 m/s | TBD | During invis |
| `AmbushBonusFireRate` | 0 | 20% | TBD | 5s after breaking invis (ambush window) |
| `AmbushBonusTechPower` | 0 | 20 | TBD | Same |
| `AmbushBonusMeleeDamage` | 0 | 20 | TBD | Same |
| `AmbushDuration` | 5 | 5 | — | (ambush window) |
| `BonusSprintSpeed` | 1.5 m/s | 1.5 m/s | 1.5 m/s | Passive |
| `OutOfCombatHealthRegen` | 5/sec | 5/sec | 1.5/sec | × 0.3 OOC uptime |
| `AbilityCooldown` | 45 | 45 | — | (timing) |
| `AbilityDuration` | 10 | 10 | — | (invis duration) |
| `FullInvisDistance` | 30 m | 30 m | — | (visible-from range) |
| `SpottedRadius` | 20 m | 20 m | — | (detection range) |

### Calculator tags
*(TBD — Phase B)*

---

## Sharpshooter
- **normalized_name**: `sharpshooter`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Sharpshooter

### Interpretation
*(Phase A stub)* Long-range scaler: +70% weapon damage at long range (>15m), +20% bullet range, +25% zoom. -0.7 m/s move speed downside, +1 m/s sprint. T3 long-range gun glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LongRangeBonusWeaponPower` | 70% | 70% | TBD | Conditional on enemy >15m |
| `LongRangeBonusWeaponPowerMinRange` | 15 m | 15 m | — | (range gate) |
| `BonusAttackRangePercent` | 20% | 20% | 20% | Passive |
| `BonusZoomPercent` | 25% | 25% | 25% | Passive |
| `BonusMoveSpeed` | -0.7 m/s | -0.7 m/s | -0.7 m/s | Passive DOWNSIDE |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Rend
- **normalized_name**: `spirit_rend`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spirit_Rend

### Interpretation
*(Phase A stub)* Bullet proc that stacks (4 max): -7 spirit resist + -8 bullet resist per stack, 8s linger. Passive +10% spirit lifesteal, +75 HP. 2s ICD between procs. Resist-shred glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `MagicResistReduction` | 0 | -7 per stack | TBD | Bullet proc; 4 stacks × -7 = -28 max |
| `TechArmorDamageReduction` | 0 | -8 per stack | TBD | Same proc; 4 × -8 = -32 max |
| `MaxStacks` | 4 | 4 | — | (cap) |
| `DebuffDuration` | 8 | 8 | — | (per-stack linger) |
| `ProcCooldown` | 2 | 2 | — | (ICD between procs) |
| `AbilityLifestealPercentHero` | 10% | 10% | 10% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Toxic Bullets
- **normalized_name**: `toxic_bullets`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Toxic_Bullets

### Interpretation
*(Phase A stub)* Per-shot ramp DoT: 1.7% max HP / tick on enemy, 4s DoT duration, ramps up over 5 shots. Also applies anti-heal -35%. Half DoT vs. troopers. Tank-killer / anti-heal hybrid.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DotHealthPercent_Value` | 0 | 1.7% max HP per tick | TBD | DoT after build-up; tick rate 0.5s |
| `DotDuration` | 4 | 4 | — | (DoT window) |
| `BuildUpPerShot` | 1.28 | 1.28 | — | (per-shot ramp) |
| `BuildUpDuration` | 5 | 5 | — | (ramp window) |
| `TickRate` | 0.5 | 0.5 | — | (tick cadence) |
| `HealAmpReceivePenaltyPercent` | 0 | -35% | TBD | Anti-heal during DoT |
| `HealAmpRegenPenaltyPercent` | 0 | -35% | TBD | Same |
| `DotMultiplerTroopers` | 0.5 | 0.5 | — | (DoT halved vs. NPCs) |

### Calculator tags
*(TBD — Phase B)*

---

## Weighted Shots
- **normalized_name**: `weighted_shots`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Weighted_Shots

### Interpretation
*(Phase A stub)* Heavy weapon damage stat stick: +40% damage passive. Builds up a 30% slow + 25% dash reduction on enemy over 5 shots, 3.5s linger. Also -14% stamina regen, -0.5 m/s MS, +20% status resist. T3 weapon-damage + soft CC.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 40% | 40% | 40% | Passive |
| `SlowPercent` | 0 | 30% | TBD | Builds over 5 shots, 3.5s linger |
| `GroundDashReductionPercent` | 0 | -25% | TBD | Same buildup |
| `SlowDuration` | 3.5 | 3.5 | — | (linger) |
| `BuildUpDuration` | 5 | 5 | — | (ramp window) |
| `BuildUpPerShot` | 0.7 | 0.7 | — | (per-shot ramp) |
| `StatusResistancePercent` | 20% | 20% | 20% | Passive |
| `StaminaCooldownReduction` | -14% | -14% | -14% | Passive DOWNSIDE |
| `BonusMoveSpeed` | -0.5 m/s | -0.5 m/s | -0.5 m/s | Passive DOWNSIDE |

### Calculator tags
*(TBD — Phase B)*

---

## Bullet Resilience
- **normalized_name**: `bullet_resilience`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Bullet_Resilience

### Interpretation
*(Phase A stub)* +30% bullet resist passive, +15% extra when below 50% HP, +3 OOC regen. Below-threshold bonus = lowhp-gated.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 30% | 30% | 30% | Passive |
| `BulletResistBelowThreshold` | 0 | 15% | TBD | Active below 50% HP (lowhp-gated) |
| `HealthThreshold` | 50% | 50% | — | (carrier-HP gate) |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Counterspell
- **normalized_name**: `counterspell`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Counterspell

### Interpretation
*(Phase A stub)* Spell-parry active: 0.8s parry window blocks enemy abilities. On success: +20 SP, +1.75 m/s MS, 150 HP heal, 6s buff. 23s cd. +8 SP passive, +50 HP. Counter to ability-spam comps.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpellParryDuration` | 0 | 0.8 | TBD | Active parry window, 23s cd |
| `HealOnSuccess` | 0 | 150 | TBD | Heal on successful parry |
| `SpiritPower` (active) | 0 | 20 | TBD | 6s buff after parry |
| `BonusMoveSpeed` (active) | 0 | 1.75 m/s | TBD | Same buff |
| `SpiritPowerInnate` | 8 | 8 | 8 | Passive flat SP |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `BuffDuration` | 6 | 6 | — | (timing) |
| `AbilityCooldown` | 23 | 23 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Fortitude
- **normalized_name**: `fortitude`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Fortitude

### Interpretation
*(Phase A stub)* Big T3 HP stick: +375 HP, +1.25 m/s MS. Restorative heal: 2% life/sec OOC when above 75% HP threshold (so kicks in after a 10s restore delay).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 375 | 375 | 375 | Passive — likely T3 ceiling for raw HP |
| `BonusMoveSpeed` | 1.25 m/s | 1.25 m/s | 1.25 m/s | Passive |
| `HealLifePercentOutOfCombat` | 0 | 2% | TBD | Conditional on >75% HP threshold + 10s OOC |
| `RestoreDelay` | 10 | 10 | — | (delay after combat ends) |
| `HealthThreshold` | 75% | 75% | — | (gate for the regen kick-in) |

### Calculator tags
*(TBD — Phase B)*

---

## Healing Nova
- **normalized_name**: `healing_nova`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Nova

### Interpretation
*(Phase A stub)* Active AoE heal: 325 HP burst over 2s in 18m radius. 60s cd. +8 SP passive, +5% ability range/radius. Team heal aura.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TotalHealthRegen_Value` (active) | 0 | 325 | TBD | AoE heal over 2s; affects allies in 18m radius |
| `RegenDuration` | 2 | 2 | — | (timing) |
| `AuraRadius` | 18 m | 18 m | — | (heal radius) |
| `SpiritPower` | 8 | 8 | 8 | Passive |
| `TechRangeMultiplier` | 5% | 5% | 5% | Passive |
| `TechRadiusMultiplier` | 5% | 5% | 5% | Passive |
| `AbilityCooldown` | 60 | 60 | — | (timing) |
| `AbilityCastDelay` | 0.25 | 0.25 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Lifestrike
- **normalized_name**: `lifestrike`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Lifestrike

### Interpretation
*(Phase A stub)* Heavy-melee on-hit: 100 HP + 30% lifesteal heal, slows target 60% for 2.5s. 4s cd. Passive +16% melee damage, +125 HP. T3 melee-focus sustain.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LifestealHeal_Value` | 0 | 100 | TBD | Per heavy melee hit, 4s cd |
| `LifestealHealPercent_Value` | 0 | 30% | TBD | Per heavy melee — % of damage dealt |
| `SlowPercent` | 0 | 60% | TBD | On heavy melee hit, 2.5s linger |
| `SlowDuration` | 2.5 | 2.5 | — | (linger) |
| `BonusMeleeDamagePercent` | 16% | 16% | 16% | Passive |
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `NonHeroHealPct` | 40% | 40% | — | (heal reduced vs NPCs) |
| `LightMeleeCooldownMult` | 1.5 | 1.5 | — | (light melee cd multiplier?) |
| `AbilityCooldown` | 4 | 4 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Majestic Leap
- **normalized_name**: `majestic_leap`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Majestic_Leap

### Interpretation
*(Phase A stub)* Active high-jump + ground slam: launch upward, slam down into a 10m radius zone with 40% slow / 2.5s, granting a 200 HP barrier for 8s. 45s cd. T3 mobility/engage tool.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `JumpVelocityHidden` | 27 m | 27 m | — | (leap height) |
| `SlamDownRadius` | 10 m | 10 m | — | (slam AoE) |
| `SlowPercent` | 0 | 40% | TBD | On slam, 2.5s |
| `SlowDuration` | 2.5 | 2.5 | — | (timing) |
| `CombatBarrier_Value` | 0 | 200 HP | TBD | 8s barrier on slam |
| `BarrierDuration` | 8 | 8 | — | (barrier window) |
| `AirControlPercent` | 100% | 100% | — | (full air control during leap) |
| `InterruptCooldown` | 5 | 5 | — | (?) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Metal Skin
- **normalized_name**: `metal_skin`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Metal_Skin

### Interpretation
*(Phase A stub)* Active 5s buff: +12% bullet resist, -20% dash distance, -1.5 m/s move speed (immobilized for the cost). 24s cd. Defensive commit button.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` (active) | 0 | 12% | TBD | Active 5s / 24s cd |
| `ActiveMoveSpeedPenalty` | 0 | -1.5 m/s | TBD | During active DOWNSIDE |
| `GroundDashReductionPercent` (active) | 0 | -20% | TBD | During active DOWNSIDE |
| `AbilityDuration` | 5 | 5 | — | (timing) |
| `AbilityCooldown` | 24 | 24 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Resilience
- **normalized_name**: `spirit_resilience`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Resilience

### Interpretation
*(Phase A stub)* Spirit-side mirror of Bullet Resilience: +30% spirit resist, +15% below 50% HP. +3 OOC regen.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 30% | 30% | 30% | Passive |
| `TechResistBelowThreshold` | 0 | 15% | TBD | Active below 50% HP (lowhp-gated) |
| `HealthThreshold` | 50% | 50% | — | (carrier-HP gate) |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Stamina Mastery
- **normalized_name**: `stamina_mastery`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Stamina_Mastery

### Interpretation
*(Phase A stub)* Big stamina stack: +2 stamina charges, +18% stamina regen, +23% air move speed. T3 ceiling for stamina-supplied mobility.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Stamina` | +2 | +2 | +2 | Passive |
| `StaminaCooldownReduction` | 18% | 18% | 18% | Passive |
| `AirMoveIncreasePercent` | 23% | 23% | 23% | Passive (in-air move speed buff) |

### Calculator tags
*(TBD — Phase B)*

---

## Veil Walker
- **normalized_name**: `veil_walker`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Veil_Walker

### Interpretation
*(Phase A stub)* Active 7s invis: +3.5 m/s MS during invis, +85 HP heal on invis cast. Passive +2 sprint, +125 HP, +10 SP, +2 OOC regen. 15s cd. Mobility/escape with sustain glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `InvisDuration` | 0 | 7s | TBD | Active 7s / 15s cd |
| `BonusMoveSpeed` (invis) | 0 | 3.5 m/s | TBD | During invis |
| `HealOnVeil_Value` | 0 | 85 | TBD | Heal on cast |
| `BonusSprintSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `SpiritPower` | 10 | 10 | 10 | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `AbilityDuration` | 16 | 16 | — | (timing) |
| `AbilityCooldown` | 15 | 15 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Decay
- **normalized_name**: `decay`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Decay

### Interpretation
*(Phase A stub)* Active 10s DoT + anti-heal on target: 2.6% max HP/tick, -50% heal amp + -50% regen. 32s cd, 20m range. +8 SP passive, +65 HP. T3 anti-heal + DoT.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DotHealthPercent_Value` | 0 | 2.6% max HP/tick | TBD | Active 10s / 32s cd; tick rate 1s |
| `HealAmpReceivePenaltyPercent` | 0 | -50% | TBD | Same window |
| `HealAmpRegenPenaltyPercent` | 0 | -50% | TBD | Same |
| `TechPower` | 8 | 8 | 8 | Passive |
| `BonusHealth` | 65 | 65 | 65 | Passive |
| `TickRate` | 1 | 1 | — | (DoT tick cadence) |
| `AbilityCastRange_Value` | 20 m | 20 m | — | (cast range) |
| `AbilityDuration` | 10 | 10 | — | (timing) |
| `AbilityCooldown` | 32 | 32 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Disarming Hex
- **normalized_name**: `disarming_hex`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Disarming_Hex

### Interpretation
*(Phase A stub)* Active 4s disarm on target: -13 bullet armor + disarm. 16s cd, 32m range. Passive +0.75 sprint, +75 HP. T3 hard-CC weapon-disarm.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` | 0 | -13 | TBD | Active 4s / 16s cd; on target |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `AbilityDuration` | 4 | 4 | — | (timing) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityCastRange` | 32 m | 32 m | — | (cast range) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Greater Expansion
- **normalized_name**: `greater_expansion`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Greater_Expansion

### Interpretation
*(Phase A stub)* T3 upgrade of Mystic Expansion: pure passive +30% ability range/radius, +10% spirit resist. Strong `range_extender_dependant` provider.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechRangeMultiplier` | 30% | 30% | 30% | Passive |
| `TechRadiusMultiplier` | 30% | 30% | 30% | Passive |
| `TechResist` | 10% | 10% | 10% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Knockdown
- **normalized_name**: `knockdown`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Knockdown

### Interpretation
*(Phase A stub)* Single-target delayed stun: 2s delay → 0.5s stun on target. 35s cd, 45m range. Up to 1.5s bonus stun duration based on enemy height. +75 HP passive. Anti-aerial CC.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StunDuration` | 0 | 0.5s base | TBD | Active 35s cd; on target |
| `MaxBonusDuration` | 1.5 | 1.5 | TBD | Bonus stun based on aerial height |
| `MaxHeightForBonus` | 30 m | 30 m | — | (max aerial height for full bonus) |
| `StunDelay` | 2 | 2 | — | (delay before stun applies) |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `TechRangeMultiplier` | 5% | 5% | 5% | Passive |
| `TechRadiusMultiplier` | 5% | 5% | 5% | Passive |
| `AbilityCooldown` | 35 | 35 | — | (timing) |
| `AbilityCastRange` | 45 m | 45 m | — | (cast range) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Rapid Recharge
- **normalized_name**: `rapid_recharge`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Rapid_Recharge

### Interpretation
*(Phase A stub)* T3 charge-dependent stick: +2 ability charges, +14% CDR on charged abilities, +30% recharge speed between charges, +10 SP for charged abilities. The T3 ceiling for `charge_dependant` providers.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityCharges` | +2 | +2 | +2 | Passive |
| `CooldownBetweenChargeReduction` | 30% | 30% | 30% | Passive — recharge interval reduced |
| `CooldownReductionOnChargedAbilities` | 14% | 14% | 14% | Passive — only on charged abilities |
| `BonusSpiritForChargedAbilities` | 10 | 10 | 10 | Passive — only on charged ability casts |

### Calculator tags
*(TBD — Phase B)*

---

## Silence Wave
- **normalized_name**: `silence_wave`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Silence_Wave

### Interpretation
*(Phase A stub)* AoE silence: 3s silence in a 5m wave expanding to 5 + (40m × 0.15) = 11m. 42s cd (30s if missed). 75 damage. +50 HP. T3 hard-counter to ability-spam comps.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 0 | 3s | TBD | Silence duration on hit enemies, 42s cd |
| `Damage_Value` | 0 | 75 | TBD | Burst damage on hit |
| `InitialWidth` | 5 m | 5 m | — | (initial wave width) |
| `GrowthPerMeter` | 0.15 m | 0.15 m | — | (wave widens with distance) |
| `AbilityCastRange` | 40 m | 40 m | — | (max wave length) |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `CooldownOnMiss` | 30 | 30 | — | (reduced cd if missed) |
| `AbilityCooldown` | 42 | 42 | — | (timing) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Snatch
- **normalized_name**: `spirit_snatch`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Snatch

### Interpretation
*(Phase A stub)* Heavy-melee SP-steal: deal 50 spirit damage, steal -20 SP / -12 TechArmor from target (10s duration), gain +20 SP / +12 TechArmor for yourself. 6s cd. +7% melee damage, +75 HP passive.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritDamage_Value` | 0 | 50 | TBD | Heavy melee hit, 6s cd |
| `TechPowerReduction` (debuff) | 0 | -20 | TBD | On enemy, 10s |
| `TechPowerGain` (buff self) | 0 | +20 | TBD | On carrier, 10s |
| `TechArmorDamageReduction` | 0 | -12 | TBD | On enemy, 10s |
| `TechArmorGain` (buff self) | 0 | +12 | TBD | On carrier, 10s |
| `BonusMeleeDamagePercent` | 7% | 7% | 7% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `LightMeleeReduction` | 30% | 30% | — | (light melee cd reduction) |
| `AbilityCooldown` | 6 | 6 | — | (timing) |
| `AbilityDuration` | 10 | 10 | — | (buff/debuff duration) |

### Calculator tags
*(TBD — Phase B)*

---

## Superior Cooldown
- **normalized_name**: `superior_cooldown`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Superior_Cooldown

### Interpretation
*(Phase A stub)* T3 ceiling for raw CDR: +20% cooldown reduction passive, +4 OOC regen.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 20% | 20% | 20% | Passive |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC uptime |

### Calculator tags
*(TBD — Phase B)*

---

## Superior Duration
- **normalized_name**: `superior_duration`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Superior_Duration

### Interpretation
*(Phase A stub)* T3 ceiling for `duration_dependant`: +28% ability duration passive, +8% bullet resist. Cross-tier best per user's earlier note — Magic Carpet T4 only gets 15%.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityDurationPercent` | 28% | 28% | 28% | Passive — cross-tier ceiling |
| `BulletResist` | 8% | 8% | 8% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

## Surge of Power
- **normalized_name**: `surge_of_power`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Surge_of_Power

### Interpretation
*(Phase A stub)* Imbue active: +24 SP, +20% fire rate, +1.75 m/s MS for 8s. Removes shoot/zoom MS penalty. 14s cd. Hybrid gun-spirit booster.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `ImbuedTechPower` | 0 | 24 | TBD | Active 8s / 14s cd |
| `FireRateBonus` | 0 | 20% | TBD | Same window |
| `BonusMoveSpeed` | 0 | 1.75 m/s | TBD | Same window |
| `MovementSpeedBonusDuration` | 8 | 8 | — | (timing) |
| `MoveWhileShootingSpeedPenaltyReductionPercent` | 0 | 100% | TBD | Same window |
| `MoveWhileZoomedSpeedPenaltyReductionPercent` | 0 | 100% | TBD | Same window |
| `AbilityCooldown` | 14 | 14 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Tankbuster
- **normalized_name**: `tankbuster`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Tankbuster

### Interpretation
*(Phase A stub)* Anti-tank execute: 8% of target's current HP + 40 + 165 minimum damage. 14s cd. Best vs. high-HP targets — clean `pure_damage` candidate.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 40 | 40 | TBD | Flat base damage per cast, 14s cd |
| `MinimumDamage` | 165 | 165 | TBD | Minimum guaranteed damage |
| `CurrentHealthDamage` | 0 | 8% current HP | TBD | Anti-tank scaling |
| `ReProcLockoutTime` | 5 | 5 | — | (target re-proc lockout) |
| `WatcherMaxDuration` | 30 | 30 | — | (?) |
| `AbilityChargeUpTime` | 14 | 14 | — | (timing) |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `AbilityCooldown` | 14 | 14 | — | (timing) |

### Calculator tags
*(TBD — Phase B)*

---

## Torment Pulse
- **normalized_name**: `torment_pulse`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Torment_Pulse

### Interpretation
*(Phase A stub)* Passive AoE pulse: 25 damage every 1.4s in 9m radius. +100 HP, +15% melee resist. Continuous AoE pressure.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DamagePulseAmount_Value` | 25 | 25 | TBD | Per 1.4s pulse, 9m radius — always-on |
| `DamagePulseRadius` | 9 m | 9 m | — | (radius) |
| `AbilityCooldown` | 1.4 | 1.4 | — | (pulse cadence) |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `MeleeResistPercent` | 15% | 15% | 15% | Passive |

### Calculator tags
*(TBD — Phase B)*

---

# T4 (6400 souls)

## Glass Cannon
- **normalized_name**: `glass_cannon`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Glass_Cannon

### Interpretation
Permanent stat bargain — pay a flat one-time **-15% Max Health** when you buy the item, gain a passive **+80% Weapon Damage** always-on (no condition). On top of that, each hero kill grants +7% Fire Rate stacking up to 8 kills (lose 1 stack on death). Wiki wording: *"-15% Max Health"* (singular stat, not per-stack) and *"Each hero kill grants permanent Fire Rate (up to a max of 8 times)"*.

The +80% damage is the headline — at T4 nothing else comes close to that as a flat passive. The 15% HP cost is real but predictable (you build around it). The fire-rate-per-kill is gravy: realistically a competent player holds 3-4 stacks across a fight, losing them on deaths. No per-kill ammo, no slow on hit — those were artifacts of misreading the scrape cache.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 80% | 80% | 80% | Passive — no condition |
| `MaxHealthLossPercent` | -15% | -15% | -15% | One-time purchase cost (singular stat, not per-stack) |
| `FireRatePerKill` | 0% | 7% per stack | ~25% | +7% × ~3.5 average held kill stacks; lose 1 stack on death |
| `MaxStacks` | 8 | 8 | — | (per-kill cap) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 80% | 2.0 | adds | Cross-tier ceiling for flat passive bullet damage — the headline T4 effect |
| `low_max_hp` | -15% | -0.5 | adds | One-time upfront cost; always present once purchased |
| `fire_rate` | ~25% | 1.0 | adds | +7% × ~3.5 average held stacks in a typical fight |
| `damage_sponge` | — | 0.5 | relies | High base HP / mitigation builds tolerate the -15% better than squishies |
| `self_heal` | — | 0.5 | relies | Sustain helps you stay alive long enough to ramp kill stacks |
| `high_kill_count` | — | 1.5 | adds | Per-kill scaling rewards players who close kills (and snowballs from there) |
| `scaling_late` | — | 1.0 | adds | T4 cost; per-kill ramp rewards extended games where stacks accumulate |

---

## Spellslinger
- **normalized_name**: `spellslinger`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spellslinger

### Interpretation
Passive +6% cooldown reduction. In combat, every ability or item cast adds a stack of +11% fire rate and -10% reload time. Up to 6 stacks, 18s duration, each new cast refreshes all stacks. So a hero casting on cooldown holds near-max stacks for the duration of a fight; a hero who casts once a fight gets minimal value. Quintessential `hybrid_damage_usage` item — designed for builds that interleave spell casts with shooting.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 6% | 6% | 6% | Passive |
| `BonusFireRate` (per stack) | 0% | 11% per stack | ~38% | × ~3.5 average held stacks of 6 max |
| `ReloadSpeedMultipler` (per stack) | 0% | -10% per stack | -35% | × ~3.5 held stacks; mechanically equivalent to additional fire rate uptime |
| `BuffDuration` | 18 | 18 | — | (stack lifetime, refreshes on cast) |
| `MaxStacks` | 6 | 6 | — | (cap) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cooldown_reduction` | 6% | 0.6 | adds | Passive baseline CDR |
| `fire_rate` | 38% | 1.5 | adds | 11% × ~3.5 average held stacks — best-for-T4 conditional fire rate |
| `fire_rate` | +35% (reload) | 0.5 | adds | -10% reload × ~3.5 stacks; mechanically equivalent to extra fire rate uptime |
| `hybrid_damage_usage` | — | 1.5 | adds | The entire mechanic rewards mixing gun + ability play |
| `ability_spam` | — | 1.0 | adds | Every cast refreshes stacks — frequent casting is heavily rewarded |
| `multi_ability_focus` | — | 1.0 | adds | Any ability or item cast triggers a stack, all slots qualify |
| `scaling_late` | — | 1.0 | adds | T4 stat-stick with ramp — rewards extended fights more than short ones |

---

## Boundless Spirit
- **normalized_name**: `boundless_spirit`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Boundless_Spirit

### Interpretation
Pure passive stat stick. +30 flat Spirit Power, +15% Spirit Power scaling (a multiplier on your current SP — per the wiki, the only item that gives a percentage of your existing SP), +75 HP, +4 OOC regen. The 15% multiplier is the signature: it's an adds (it grants raw SP) AND a relies (the more SP your other items already provide, the more value this one extracts). Late-game SP-build capstone.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritPower` / `TechPower` | 30 | 30 | 30 | Passive flat |
| `TechPowerPercent` | 15% | 15% | 15% | Passive multiplier on current SP — only item in the game with this stat |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_power` | 30 | 1.0 | adds | Solid flat SP for T4 |
| `spirit_power` | 15% multiplier | 1.5 | relies | The 15% scaler rewards stacking SP from other sources; on a 150-SP build it adds ~22 effective SP on top of the flat 30 — cross-tier unique |
| `high_max_hp` | 75 | 0.5 | adds | Modest HP for T4 |
| `self_heal` | 1.2/sec | 0.4 | adds | 4/sec × 0.3 OOC uptime |
| `scaling_late` | — | 1.5 | adds | T4 cost, % scaler that compounds with other SP items, no early-game value |
| `ult_focused` | — | 0.5 | adds | Biggest spike per cast goes to highest-damage ability, usually the ult |
| `hybrid_damage_usage` | — | 0.5 | relies | Best on heroes who can leverage spirit power across multiple damage profiles |

### Correction
the 15% multiplier is huge, so the "adds" value needs allot more weight here because yes it depends on it but it more ADDS to it more. 

## Armor Piercing Rounds
- **normalized_name**: `armor_piercing_rounds`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Armor_Piercing_Rounds

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBulletSpeedPercent` | 60 | 60 | TBD | passive |
| `ProcChance` | 55 | 55 | TBD | proc chance |
| `BaseAttackDamagePercent` | 8 | 8 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Capacitor
- **normalized_name**: `capacitor`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Capacitor

### Interpretation
*(Phase A stub — Weapon/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 40 | 40 | TBD | cd / timing |
| `AbilityCastDelay` | 0.2 | 0.2 | TBD | active (cd: 40s) |
| `ProcCooldown` | 0.25 | 0.25 | TBD | cd / timing |
| `DamagePerChain_Value` | 43 | 43 | TBD | active (cd: 40s) |
| `BonusPerChain_Value` | 43 | 43 | TBD | active (cd: 40s) |
| `ChainRadius` | 10m | 10m | TBD | active (cd: 40s) |
| `ProcChance` | 20 | 20 | TBD | proc chance |
| `ChainCount` | 6 | 6 | TBD | active (cd: 40s) |
| `ChainTickRate` | 0.4 | 0.4 | TBD | active (cd: 40s) |
| `Damage` | 100 | 100 | TBD | active (cd: 40s) |
| `MaxSlowPercent` | 75 | 75 | TBD | active (cd: 40s) |
| `SlowDuration` | 3 | 3 | TBD | duration / timing |
| `BonusFireRate` | 5 | 5 | TBD | active (cd: 40s) |

### Calculator tags
*(TBD — Phase B)*

---

## Crippling Headshot
- **normalized_name**: `crippling_headshot`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Crippling_Headshot

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 125 | 125 | TBD | passive |
| `BulletResistReduction` | -16 | -16 | TBD | downside / debuff |
| `MagicResistReduction` | -16 | -16 | TBD | downside / debuff |
| `HealAmpReceivePenaltyPercent` | -35 | -35 | TBD | downside |
| `HealAmpRegenPenaltyPercent` | -35 | -35 | TBD | downside |
| `DebuffDuration` | 12 | 12 | TBD | duration / timing |
| `DiminishingMultiplier` | 0.5 | 0.5 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Crushing Fists
- **normalized_name**: `crushing_fists`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Crushing_Fists

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 7 | 7 | TBD | cd / timing |
| `BulletResist` | 12 | 12 | TBD | passive |
| `BonusMeleeDamagePercent` | 20 | 20 | TBD | passive |
| `MeleeDistanceScale` | 60 | 60 | TBD | passive |
| `BonusHeavyMeleeDamage` | 25 | 25 | TBD | passive |
| `MaxStacks` | 6 | 6 | TBD | per-stack cap |
| `DebuffDuration` | 8 | 8 | TBD | duration / timing |
| `StunDuration` | 0.5 | 0.5 | TBD | duration / timing |
| `LightMeleeStacks` | 1 | 1 | TBD | per-stack |
| `LightMeleeAmmo` | 15 | 15 | TBD | passive |
| `HeavyMeleeMultiplier` | 2 | 2 | TBD | passive |
| `BulletResistReduction` | -4 | -4 | TBD | downside / debuff |

### Calculator tags
*(TBD — Phase B)*

---

## Frenzy
- **normalized_name**: `frenzy`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Frenzy

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 16 | 16 | TBD | cd / timing |
| `AbilityDuration` | 10 | 10 | TBD | duration / timing |
| `LowHealthThreshold` | 50 | 50 | TBD | lowhp-gated |
| `BonusHealth` | 160 | 160 | TBD | passive |
| `BonusFireRate` | 15 | 15 | TBD | passive |
| `FervorMovespeed` | 4m | 4m | TBD | passive |
| `FervorFireRate` | 40 | 40 | TBD | passive |
| `FervorStatusResistancePercent` | 30 | 30 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Lucky Shot
- **normalized_name**: `lucky_shot`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Lucky_Shot

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Radius` | 1m | 1m | TBD | passive |
| `ProcChance` | 25 | 25 | TBD | proc chance |
| `CritDamagePercent` | 100 | 100 | TBD | passive |
| `BonusClipSizePercent` | 30 | 30 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Ricochet
- **normalized_name**: `ricochet`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Ricochet

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `RicochetDamagePercent` | 65 | 65 | TBD | passive |
| `RicochetRadius` | 13m | 13m | TBD | passive |
| `RicochetTargetsTooltipOnly` | 2 | 2 | TBD | passive |
| `BonusFireRate` | 18 | 18 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Silencer
- **normalized_name**: `silencer`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Silencer

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 15 | 15 | TBD | passive |
| `TechDamageReduction` | -25 | -25 | TBD | downside / debuff |
| `SilenceDuration` | 2.5 | 2.5 | TBD | duration / timing |
| `DebuffDuration` | 6 | 6 | TBD | duration / timing |
| `ImmunityDuration` | 10 | 10 | TBD | duration / timing |
| `BuildUpPerShot` | 1.04 | 1.04 | TBD | passive |
| `BuildUpDuration` | 5 | 5 | TBD | duration / timing |

### Calculator tags
*(TBD — Phase B)*

---

## Spiritual Overflow
- **normalized_name**: `spiritual_overflow`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spiritual_Overflow

### Interpretation
*(Phase A stub — Weapon/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 15 | 15 | TBD | duration / timing |
| `AbilityLifestealPercentHero` | 16 | 16 | TBD | passive |
| `BonusFireRate` | 32 | 32 | TBD | passive |
| `BonusSpirit` | 40 | 40 | TBD | passive |
| `BonusAbilityDurationPercent` | 15 | 15 | TBD | duration / timing |
| `BuildUpPerShot` | 0.75 | 0.75 | TBD | passive |
| `BuildUpDuration` | 5 | 5 | TBD | duration / timing |

### Calculator tags
*(TBD — Phase B)*

---

## Cheat Death
- **normalized_name**: `cheat_death`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Cheat_Death

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 90 | 90 | TBD | cd / timing |
| `DeathImmunityDuration` | 4.5 | 4.5 | TBD | duration / timing |
| `BonusHealth` | 200 | 200 | TBD | passive |
| `BulletResist` | 15 | 15 | TBD | passive |
| `DeathImmunityDamageReduction` | -60 | -60 | TBD | downside / debuff |
| `HealAmpReceivePenaltyPercent` | -60 | -60 | TBD | downside |
| `HealAmpRegenPenaltyPercent` | -60 | -60 | TBD | downside |
| `BonusMoveSpeed` | 0m | 0m | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Colossus
- **normalized_name**: `colossus`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Colossus

### Interpretation
*(Phase A stub — Armor/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 37 | 37 | TBD | cd / timing |
| `AbilityDuration` | 7 | 7 | TBD | duration / timing |
| `BonusBaseHealth` | 25 | 25 | TBD | active (cd: 37s / dur: 7s) |
| `BaseAttackDamagePercent` | 15 | 15 | TBD | active (cd: 37s / dur: 7s) |
| `BuffBulletResist` | 35 | 35 | TBD | active (cd: 37s / dur: 7s) |
| `BuffTechResist` | 35 | 35 | TBD | active (cd: 37s / dur: 7s) |
| `SlowPercent` | 30 | 30 | TBD | active (cd: 37s / dur: 7s) |
| `GroundDashReductionPercent` | -25 | -25 | TBD | downside / debuff |
| `Radius` | 14m | 14m | TBD | active (cd: 37s / dur: 7s) |
| `ModelScaleGrowth` | 1.2 | 1.2 | TBD | active (cd: 37s / dur: 7s) |
| `ModelScaleGrowthTooltip` | 20 | 20 | TBD | active (cd: 37s / dur: 7s) |
| `BonusMeleeDamagePercent` | 30 | 30 | TBD | active (cd: 37s / dur: 7s) |

### Calculator tags
*(TBD — Phase B)*

---

## Divine Barrier
- **normalized_name**: `divine_barrier`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Divine_Barrier

### Interpretation
*(Phase A stub — Armor/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 45 | 45 | TBD | cd / timing |
| `AbilityCastRange` | 40m | 40m | TBD | active (cd: 45s) |
| `AbilityCastDelay` | 0.2 | 0.2 | TBD | active (cd: 45s) |
| `CooldownReductionPctOnOthers` | 50 | 50 | TBD | cd / timing |
| `BuffDuration` | 6 | 6 | TBD | duration / timing |
| `CombatBarrier` | 600 | 600 | TBD | active (cd: 45s) |
| `BonusMoveSpeed` | 2.75m | 2.75m | TBD | active (cd: 45s) |
| `TechRangeMultiplier` | 10 | 10 | TBD | active (cd: 45s) |
| `TechRadiusMultiplier` | 10 | 10 | TBD | active (cd: 45s) |

### Calculator tags
*(TBD — Phase B)*

---

## Diviners Kevlar
- **normalized_name**: `diviners_kevlar`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Diviners_Kevlar

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 40 | 40 | TBD | cd / timing |
| `TechPower` | 35 | 35 | TBD | passive |
| `CombatBarrier` | 1000 | 1000 | TBD | passive |
| `BuffDuration` | 20 | 20 | TBD | duration / timing |
| `BonusAbilityDurationPercent` | 15 | 15 | TBD | duration / timing |

### Calculator tags
*(TBD — Phase B)*

---

## Healing Tempo
- **normalized_name**: `healing_tempo`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Tempo

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 1 | 1 | TBD | cd / timing |
| `BonusFireRate` | 35 | 35 | TBD | passive |
| `BuffDuration` | 7 | 7 | TBD | duration / timing |
| `BonusMoveSpeed` | 1.25m | 1.25m | TBD | passive |
| `MinimumHealAmount` | 1 | 1 | TBD | passive |
| `TechResist` | 10 | 10 | TBD | passive |
| `BonusHealthRegen` | 6 | 6 | TBD | passive |
| `HealAmpCastPercent` | 25 | 25 | TBD | passive |
| `HealAmpRegenPercent` | 25 | 25 | TBD | passive |
| `OutOfCombatHealthRegen` | 4 | 4 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Indomitable
- **normalized_name**: `indomitable`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Indomitable

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 55 | 55 | TBD | cd / timing |
| `AbilityDuration` | 10 | 10 | TBD | duration / timing |
| `BulletResist` | 8 | 8 | TBD | passive |
| `TechResist` | 8 | 8 | TBD | passive |
| `CooldownReductionOnProc` | 20 | 20 | TBD | cd / timing |
| `VexBarrierCombatBarrier_Value` | 325 | 325 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Infuser
- **normalized_name**: `infuser`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Infuser

### Interpretation
*(Phase A stub — Armor/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 30 | 30 | TBD | cd / timing |
| `AbilityDuration` | 6 | 6 | TBD | duration / timing |
| `BonusHealth` | 100 | 100 | TBD | active (cd: 30s / dur: 6s) |
| `BonusSpirit` | 30 | 30 | TBD | active (cd: 30s / dur: 6s) |
| `AbilityLifestealPercentHero` | 70 | 70 | TBD | active (cd: 30s / dur: 6s) |
| `TechResist` | 10 | 10 | TBD | active (cd: 30s / dur: 6s) |
| `AbilityLifestealPercentHeroPassive` | 13 | 13 | TBD | active (cd: 30s / dur: 6s) |
| `NonHeroAbilityLifestealTooltipOnly` | 3 | 3 | TBD | active (cd: 30s / dur: 6s) |

### Calculator tags
*(TBD — Phase B)*

---

## Inhibitor
- **normalized_name**: `inhibitor`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Inhibitor

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 150 | 150 | TBD | passive |
| `DebuffDuration` | 5 | 5 | TBD | duration / timing |
| `BuildUpPerShot` | 0.77 | 0.77 | TBD | passive |
| `BuildUpDuration` | 5 | 5 | TBD | duration / timing |
| `OutgoingDamagePenaltyPercent` | -30 | -30 | TBD | downside |
| `BaseAttackDamagePercent` | 10 | 10 | TBD | passive |
| `HealAmpReceivePenaltyPercent` | -40 | -40 | TBD | downside |
| `HealAmpRegenPenaltyPercent` | -40 | -40 | TBD | downside |

### Calculator tags
*(TBD — Phase B)*

---

## Juggernaut
- **normalized_name**: `juggernaut`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Juggernaut

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `MeleeResistPercent` | 25 | 25 | TBD | passive |
| `SlowResistancePercent` | 50 | 50 | TBD | passive |
| `FireRateSlow` | 36 | 36 | TBD | passive |
| `BonusHealthRegen` | 8 | 8 | TBD | passive |
| `BonusMoveSpeed` | 2m | 2m | TBD | passive |
| `FireRateSlowDuration` | 4 | 4 | TBD | duration / timing |

### Calculator tags
*(TBD — Phase B)*

---

## Leech
- **normalized_name**: `leech`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Leech

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 12 | 12 | TBD | passive |
| `AbilityLifestealPercentHero` | 25 | 25 | TBD | passive |
| `BulletLifestealPercent` | 25 | 25 | TBD | passive |
| `BaseAttackDamagePercent` | 12 | 12 | TBD | passive |
| `BonusHealth` | 160 | 160 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Phantom Strike
- **normalized_name**: `phantom_strike`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Phantom_Strike

### Interpretation
*(Phase A stub — Armor/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 35 | 35 | TBD | cd / timing |
| `AbilityCastRange` | 25m | 25m | TBD | active (cd: 35s) |
| `AbilityCastDelay` | 0.35 | 0.35 | TBD | active (cd: 35s) |
| `TechPower` | 8 | 8 | TBD | active (cd: 35s) |
| `BaseAttackDamagePercent` | 15 | 15 | TBD | active (cd: 35s) |
| `SlowPercent` | 50 | 50 | TBD | active (cd: 35s) |
| `SlowDuration` | 3 | 3 | TBD | duration / timing |
| `ImpactDamage_Value` | 75 | 75 | TBD | active (cd: 35s) |

### Calculator tags
*(TBD — Phase B)*

---

## Plated Armor
- **normalized_name**: `plated_armor`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Plated_Armor

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 1 | 1 | TBD | cd / timing |
| `DeflectionPercent` | 30 | 30 | TBD | passive |
| `BulletProcDeflectionPercent` | 50 | 50 | TBD | passive |
| `DeflectionRandomness` | 1 | 1 | TBD | passive |
| `BonusHealth` | 130 | 130 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Siphon Bullets
- **normalized_name**: `siphon_bullets`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Siphon_Bullets

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 15 | 15 | TBD | passive |
| `BulletResist` | 10 | 10 | TBD | passive |
| `StealPerHit` | 1 | 1 | TBD | passive |
| `StealPerKill` | 1 | 1 | TBD | per-kill |
| `StackLostPerDeath` | 2 | 2 | TBD | per-stack cap |
| `MaxStacks` | 9999 | 9999 | TBD | per-stack cap |
| `StealDuration` | 17 | 17 | TBD | duration / timing |
| `ProcCooldown` | 1.2 | 1.2 | TBD | cd / timing |
| `HealthStealPctHero` | 2.5 | 2.5 | TBD | passive |
| `ParticleRadius` | 1m | 1m | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Spellbreaker
- **normalized_name**: `spellbreaker`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spellbreaker

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 9 | 9 | TBD | cd / timing |
| `TechResist` | 18 | 18 | TBD | passive |
| `StatusResistancePercent` | 25 | 25 | TBD | passive |
| `DamageThreshold` | 175 | 175 | TBD | passive |
| `SpiritDamageReductionProc` | 65 | 65 | TBD | downside / debuff |

### Calculator tags
*(TBD — Phase B)*

---

## Unstoppable
- **normalized_name**: `unstoppable`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Unstoppable

### Interpretation
*(Phase A stub — Armor/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 65 | 65 | TBD | cd / timing |
| `AbilityDuration` | 5.5 | 5.5 | TBD | duration / timing |
| `BonusHealth` | 125 | 125 | TBD | active (cd: 65s / dur: 5.5s) |
| `StatusResistancePercent` | 25 | 25 | TBD | active (cd: 65s / dur: 5.5s) |

### Calculator tags
*(TBD — Phase B)*

---

## Vampiric Burst
- **normalized_name**: `vampiric_burst`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Vampiric_Burst

### Interpretation
*(Phase A stub — Armor/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 30 | 30 | TBD | cd / timing |
| `AbilityDuration` | 4.5 | 4.5 | TBD | duration / timing |
| `ActiveBonusFireRate` | 34 | 34 | TBD | active (cd: 30s / dur: 4.5s) |
| `ActiveBonusLifesteal` | 70 | 70 | TBD | active (cd: 30s / dur: 4.5s) |
| `BonusHealth` | 100 | 100 | TBD | active (cd: 30s / dur: 4.5s) |
| `ActiveReloadPercent` | 75 | 75 | TBD | active (cd: 30s / dur: 4.5s) |
| `BulletResist` | 10 | 10 | TBD | active (cd: 30s / dur: 4.5s) |
| `BulletLifestealPercent` | 13 | 13 | TBD | active (cd: 30s / dur: 4.5s) |

### Calculator tags
*(TBD — Phase B)*

---

## Witchmail
- **normalized_name**: `witchmail`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Witchmail

### Interpretation
*(Phase A stub — Armor/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 1 | 1 | TBD | cd / timing |
| `TechPower` | 14 | 14 | TBD | passive |
| `TechResist` | 20 | 20 | TBD | passive |
| `CooldownReductionPerHit` | 4 | 4 | TBD | cd / timing |
| `CooldownReduction` | 7 | 7 | TBD | cd / timing |
| `DamageThreshold` | 75 | 75 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Arctic Blast
- **normalized_name**: `arctic_blast`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Arctic_Blast

### Interpretation
*(Phase A stub — Tech/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 24 | 24 | TBD | cd / timing |
| `SpreadDuration` | 0.6 | 0.6 | TBD | duration / timing |
| `StartRadius` | 2m | 2m | TBD | active (cd: 24s) |
| `EndRadius` | 12m | 12m | TBD | active (cd: 24s) |
| `SlowPercent` | 60 | 60 | TBD | active (cd: 24s) |
| `SlowDuration` | 4 | 4 | TBD | duration / timing |
| `Damage_Value` | 175 | 175 | TBD | active (cd: 24s) |
| `DamageHeight` | 5m | 5m | TBD | active (cd: 24s) |
| `NPCDamageMult` | 1 | 1 | TBD | active (cd: 24s) |
| `TechResist` | 10 | 10 | TBD | active (cd: 24s) |
| `FreezeDuration` | 0.75 | 0.75 | TBD | duration / timing |
| `PercentDamage` | 15 | 15 | TBD | active (cd: 24s) |

### Calculator tags
*(TBD — Phase B)*

---

## Cursed Relic
- **normalized_name**: `cursed_relic`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Cursed_Relic

### Interpretation
*(Phase A stub — Tech/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 55 | 55 | TBD | cd / timing |
| `AbilityDuration` | 3.25 | 3.25 | TBD | duration / timing |
| `AbilityCastRange` | 20m | 20m | TBD | active (cd: 55s / dur: 3.25s) |
| `AbilityCastDelay` | 0.1 | 0.1 | TBD | active (cd: 55s / dur: 3.25s) |
| `SkipFrames` | 6 | 6 | TBD | active (cd: 55s / dur: 3.25s) |
| `OutgoingDamagePenaltyPercent` | -10 | -10 | TBD | downside |

### Calculator tags
*(TBD — Phase B)*

---

## Echo Shard
- **normalized_name**: `echo_shard`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Echo_Shard

### Interpretation
*(Phase A stub — Tech/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 35 | 35 | TBD | cd / timing |
| `BonusFireRate` | 5 | 5 | TBD | active (cd: 35s) |
| `TechResist` | 5 | 5 | TBD | active (cd: 35s) |
| `BulletResist` | 5 | 5 | TBD | active (cd: 35s) |

### Calculator tags
*(TBD — Phase B)*

---

## Escalating Exposure
- **normalized_name**: `escalating_exposure`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Escalating_Exposure

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 12 | 12 | TBD | duration / timing |
| `ProcCooldown` | 0.7 | 0.7 | TBD | cd / timing |
| `MagicIncreasePerStack` | 4.5 | 4.5 | TBD | per-stack |
| `TechResist` | 17 | 17 | TBD | passive |
| `MaxStacks` | 12 | 12 | TBD | per-stack cap |
| `TechArmorDamageReduction` | -8 | -8 | TBD | downside / debuff |

### Calculator tags
*(TBD — Phase B)*

---

## Ethereal Shift
- **normalized_name**: `ethereal_shift`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Ethereal_Shift

### Interpretation
*(Phase A stub — Tech/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 35 | 35 | TBD | cd / timing |
| `AbilityDuration` | 4 | 4 | TBD | duration / timing |
| `BuffDuration` | 5 | 5 | TBD | duration / timing |
| `TechResist` | 30 | 30 | TBD | active (cd: 35s / dur: 4s) |
| `DampingFactor` | 3 | 3 | TBD | active (cd: 35s / dur: 4s) |
| `LiftHeight` | 200 | 200 | TBD | active (cd: 35s / dur: 4s) |
| `BonusSpirit` | 20 | 20 | TBD | active (cd: 35s / dur: 4s) |
| `FloatMoveSpeed` | 2.5m | 2.5m | TBD | active (cd: 35s / dur: 4s) |
| `BonusMoveSpeed` | 3m | 3m | TBD | active (cd: 35s / dur: 4s) |

### Calculator tags
*(TBD — Phase B)*

---

## Focus Lens
- **normalized_name**: `focus_lens`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Focus_Lens

### Interpretation
*(Phase A stub — Tech/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 45 | 45 | TBD | cd / timing |
| `AbilityDuration` | 4 | 4 | TBD | duration / timing |
| `AbilityCastRange` | 20m | 20m | TBD | active (cd: 45s / dur: 4s) |
| `AbilityCastDelay` | 0.1 | 0.1 | TBD | active (cd: 45s / dur: 4s) |
| `PercentDamage` | 30 | 30 | TBD | active (cd: 45s / dur: 4s) |
| `BonusFireRate` | 10 | 10 | TBD | active (cd: 45s / dur: 4s) |
| `MagicResistReduction` | -9 | -9 | TBD | downside / debuff |
| `TechPowerReduction` | -30 | -30 | TBD | downside / debuff |
| `ResistReductionDuration` | 12 | 12 | TBD | downside / debuff |

### Calculator tags
*(TBD — Phase B)*

---

## Lightning Scroll
- **normalized_name**: `lightning_scroll`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Lightning_Scroll

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 2 | 2 | TBD | duration / timing |
| `Damage` | 150 | 150 | TBD | passive |
| `SlowPercent` | 80 | 80 | TBD | passive |
| `BonusHealth` | 50 | 50 | TBD | passive |
| `StunDuration` | 0.75 | 0.75 | TBD | duration / timing |
| `DelayBeforeStun` | 3 | 3 | TBD | passive |
| `BonusSprintSpeed` | 0.75m | 0.75m | TBD | passive |
| `MovementSpeedSlow` | 30 | 30 | TBD | passive |
| `GroundDashReductionPercent` | -12 | -12 | TBD | downside / debuff |

### Calculator tags
*(TBD — Phase B)*

---

## Magic Carpet
- **normalized_name**: `magic_carpet`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Magic_Carpet

### Interpretation
*(Phase A stub — Tech/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 32 | 32 | TBD | cd / timing |
| `AbilityDuration` | 12 | 12 | TBD | duration / timing |
| `AbilityCastDelay` | 0.2 | 0.2 | TBD | active (cd: 32s / dur: 12s) |
| `TechPower` | 14 | 14 | TBD | active (cd: 32s / dur: 12s) |
| `SummonDuration` | 1.3 | 1.3 | TBD | duration / timing |
| `FlyMoveSpeed` | 7m | 7m | TBD | active (cd: 32s / dur: 12s) |
| `BonusHealth` | 125 | 125 | TBD | active (cd: 32s / dur: 12s) |
| `BonusAbilityDurationPercent` | 15 | 15 | TBD | duration / timing |

### Calculator tags
*(TBD — Phase B)*

---

## Mercurial Magnum
- **normalized_name**: `mercurial_magnum`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mercurial_Magnum

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 15 | 15 | TBD | cd / timing |
| `TechPower` | 7 | 7 | TBD | passive |
| `BonusFireRate` | 22 | 22 | TBD | passive |
| `BuffDuration` | 12 | 12 | TBD | duration / timing |
| `Damage_Value` | 60 | 60 | TBD | passive |
| `AmmoReloadPercent` | 100 | 100 | TBD | passive |
| `AbilityChargeUpTime` | 14 | 14 | TBD | passive |
| `BulletsBonusMagicDamage_Value` | 25 | 25 | TBD | passive |
| `BonusClipSizePercent` | 20 | 20 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Reverb
- **normalized_name**: `mystic_reverb`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Reverb

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 6.25 | 6.25 | TBD | cd / timing |
| `TechDamagePercent` | 50 | 50 | TBD | passive |
| `DelayDuration` | 3 | 3 | TBD | duration / timing |
| `MinimumDamage` | 100 | 100 | TBD | passive |
| `Radius` | 16m | 16m | TBD | passive |
| `AbilityLifestealPercentHero` | 8 | 8 | TBD | passive |
| `ImbueAbilityLifesteal` | 22 | 22 | TBD | passive |
| `MovementSpeedSlow` | 40 | 40 | TBD | passive |
| `MaxHealthDamage` | 10 | 10 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Refresher
- **normalized_name**: `refresher`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Refresher

### Interpretation
*(Phase A stub — Tech/InstantCast item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 300 | 300 | TBD | cd / timing |
| `AbilityCastDelay` | 0.6 | 0.6 | TBD | active (cd: 300s) |
| `TechResist` | 14 | 14 | TBD | active (cd: 300s) |
| `BulletResist` | 15 | 15 | TBD | active (cd: 300s) |

### Calculator tags
*(TBD — Phase B)*

---

## Scourge
- **normalized_name**: `scourge`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Scourge

### Interpretation
*(Phase A stub — Tech/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 35 | 35 | TBD | cd / timing |
| `AbilityDuration` | 10 | 10 | TBD | duration / timing |
| `AbilityCastRange` | 35m | 35m | TBD | active (cd: 35s / dur: 10s) |
| `AbilityCastDelay` | 0.25 | 0.25 | TBD | active (cd: 35s / dur: 10s) |
| `TickRate` | 0.25 | 0.25 | TBD | active (cd: 35s / dur: 10s) |
| `MaxHealthPercentAsDPS` | 3.5 | 3.5 | TBD | active (cd: 35s / dur: 10s) |
| `AuraRadius` | 10m | 10m | TBD | active (cd: 35s / dur: 10s) |
| `TechResist` | 40 | 40 | TBD | active (cd: 35s / dur: 10s) |
| `BonusHealth` | 100 | 100 | TBD | active (cd: 35s / dur: 10s) |
| `StatusResistancePercent` | 15 | 15 | TBD | active (cd: 35s / dur: 10s) |

### Calculator tags
*(TBD — Phase B)*

---

## Spirit Burn
- **normalized_name**: `spirit_burn`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Burn

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 20 | 20 | TBD | cd / timing |
| `TechRangeMultiplier` | 6 | 6 | TBD | passive |
| `TechRadiusMultiplier` | 6 | 6 | TBD | passive |
| `DamageThreshold` | 500 | 500 | TBD | passive |
| `DamageThresholdDuration` | 5 | 5 | TBD | duration / timing |
| `ExplosionDamage` | 110 | 110 | TBD | passive |
| `ExplosionRadius` | 12m | 12m | TBD | passive |
| `DPS_Value` | 24 | 24 | TBD | passive |
| `DebuffDuration` | 8 | 8 | TBD | duration / timing |
| `HealAmpReceivePenaltyPercent` | -70 | -70 | TBD | downside |
| `HealAmpRegenPenaltyPercent` | -70 | -70 | TBD | downside |
| `TickRate` | 0.5 | 0.5 | TBD | passive |
| `CooldownReductionPctOnNonHeroes` | 50 | 50 | TBD | cd / timing |
| `DamagePctVsNonHeroes` | 50 | 50 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Transcendent Cooldown
- **normalized_name**: `transcendent_cooldown`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Transcendent_Cooldown

### Interpretation
*(Phase A stub — Tech/Passive item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 25 | 25 | TBD | cd / timing |
| `ItemCooldownReduction` | 25 | 25 | TBD | cd / timing |
| `OutOfCombatHealthRegen` | 4 | 4 | TBD | passive |

### Calculator tags
*(TBD — Phase B)*

---

## Vortex Web
- **normalized_name**: `vortex_web`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Vortex_Web

### Interpretation
*(Phase A stub — Tech/Press item. Brief description deferred to Phase B WebFetch.)*

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 42 | 42 | TBD | cd / timing |
| `AbilityDuration` | 4 | 4 | TBD | duration / timing |
| `AbilityCastRange` | 30m | 30m | TBD | active (cd: 42s / dur: 4s) |
| `AbilityCastDelay` | 0.2 | 0.2 | TBD | active (cd: 42s / dur: 4s) |
| `CaptureRadius` | 12m | 12m | TBD | active (cd: 42s / dur: 4s) |
| `TetherDuration` | 0.5 | 0.5 | TBD | duration / timing |
| `TetherRadius` | 1m | 1m | TBD | active (cd: 42s / dur: 4s) |
| `SlowPercent` | 35 | 35 | TBD | active (cd: 42s / dur: 4s) |
| `GroundDashReductionPercent` | -40 | -40 | TBD | downside / debuff |
| `TechRangeMultiplier` | 8 | 8 | TBD | active (cd: 42s / dur: 4s) |
| `TechRadiusMultiplier` | 8 | 8 | TBD | active (cd: 42s / dur: 4s) |
| `BonusSprintSpeed` | 0.75m | 0.75m | TBD | active (cd: 42s / dur: 4s) |

### Calculator tags
*(TBD — Phase B)*

---


# T? (9999 souls — non-standard / Street Brawl variants)

*All 17 items below are flagged `streetbrawl_only: true` in the scrape cache and have no `raw_stats` populated. Per user rule, Street Brawl items cap Normalized at 1.5 (never 2.0) since their reach is mode-locked. Phase B will WebFetch each; some pages may not exist or may describe these as ability-variants rather than purchasable items, in which case the Calculator tags table will be left sparse or marked `n/a (non-purchase)`.*

## Haunting Shot
- **normalized_name**: `haunting_shot`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Haunting_Shot
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Infinite Rounds
- **normalized_name**: `infinite_rounds`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Infinite_Rounds
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Runed Gauntlets
- **normalized_name**: `runed_gauntlets`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Runed_Gauntlets
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Celestial Blessing
- **normalized_name**: `celestial_blessing`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Celestial_Blessing
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Cloak of Opportunity
- **normalized_name**: `cloak_of_opportunity`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Cloak_of_Opportunity
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Electric Slippers
- **normalized_name**: `electric_slippers`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Electric_Slippers
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Eternal Gift
- **normalized_name**: `eternal_gift`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Eternal_Gift
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Nullification Burst
- **normalized_name**: `nullification_burst`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Nullification_Burst
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Seraphim Wings
- **normalized_name**: `seraphim_wings`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Seraphim_Wings
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Shadow Strike
- **normalized_name**: `shadow_strike`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Shadow_Strike
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Frostbite Charm
- **normalized_name**: `frostbite_charm`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Frostbite_Charm
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Mystic Conduit
- **normalized_name**: `mystic_conduit`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Conduit
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Mystical Piano
- **normalized_name**: `mystical_piano`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystical_Piano
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Omnicharge Signet
- **normalized_name**: `omnicharge_signet`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Omnicharge_Signet
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Prism Blast
- **normalized_name**: `prism_blast`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Prism_Blast
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Shrink Ray
- **normalized_name**: `shrink_ray`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Shrink_Ray
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---

## Unstable Concoction
- **normalized_name**: `unstable_concoction`
- **tier**: ? (Street Brawl) (9999 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Unstable_Concoction
- **street_brawl_only**: true (caps Normalized at 1.5 in Phase B)

### Interpretation
*(Phase A stub — Street Brawl mode-locked item with no scrape-cache stats; Phase B WebFetch will populate Game stats and Calculator tags. Slot/activation: unknown/unknown.)*

### Game stats
*(No raw stats in scrape cache — Phase B WebFetch will populate.)*

### Calculator tags
*(TBD — Phase B)*

---
