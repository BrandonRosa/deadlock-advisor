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

## Tag Inference Rules (Round 7)

These rules formalize how raw item stats translate into Calculator tag rows. They exist because Round-6 tagging under-scored items by reading only the literal stats and ignoring practical implications. Apply them whenever scoring or rescoring an item.

**R1 — `spirit_power` → `spirit_damage` consolidation.** The JSON schema has no `spirit_power` tag; it's all `spirit_damage`. When normalizing an item that provides flat SP or % SP, score it under `spirit_damage`, not `spirit_power`. Rewrite all existing `spirit_power` rows accordingly.

**R2 — Propagation: damage stats lift burst/continuous on BOTH sides.** Items that boost a damage axis should also lift the matching burst/continuous flavor tags.

*Spirit side:*
- General SP items → `spirit_burst_damage adds` (≈ 0.3-0.5 × spirit_damage value) AND `spirit_continuous_damage adds` (≈ 0.3-0.5 × spirit_damage value), roughly equal lift because SP scales both burst and DoT abilities.

*Weapon side:*
- **Bullet damage items** (`BaseAttackDamagePercent` and similar raw boosts to per-shot damage) → `gun_burst_damage adds` (≈ 0.5 × bullet_damage value) heavier weight, `gun_continuous_damage adds` (≈ 0.3 × bullet_damage value) lighter weight. Per-shot damage hits harder on single big shots, so burst gets the larger lift.
- **Fire rate items** → `gun_continuous_damage adds` (≈ 0.5 × fire_rate value) heavier weight, `gun_burst_damage adds` (≈ 0.2 × fire_rate value) lighter weight. Fire rate scales sustained DPS, so continuous gets the larger lift.
- Items with BOTH bullet damage and fire rate (e.g., Active Reload, Spiritual Overflow) lift both tags via both rules — sum the contributions.

Don't apply to items that ONLY provide narrow gated bonuses (charge-gated, lowhp-gated, kill-gated) — those keep narrow tagging.

**R3 — Default category baseline (+0.15).** On purchase, every item gives a small implicit boost based on its category. Score this as a baseline row:
- Weapon items → `bullet_damage adds 0.15` (unless an explicit bullet_damage row is already ≥ 0.15) + R2 floor propagation to `gun_burst_damage adds 0.07` and `gun_continuous_damage adds 0.05`.
- Spirit items → `spirit_damage adds 0.15` (unless explicit spirit_damage is already ≥ 0.15) + R2 floor propagation to `spirit_burst_damage adds 0.05` and `spirit_continuous_damage adds 0.05`.
- Vitality items → `high_max_hp adds 0.15` (unless explicit high_max_hp is already ≥ 0.15).

**R4 — Ability-focus tags.**
- **Items boosting all/multiple abilities** (general SP, range/radius multipliers, durations, broad CDR) → small negative `single_ability_focus` (-0.2 typical) AND positive `multi_ability_focus`. They help less if you're optimizing one ability but still raise general output.
- **Items boosting charged abilities** (+1 charge, charge-gated SP, CDR on charged) → positive `single_ability_focus`, because most heroes only have 1-2 charged abilities so the buff naturally narrows.
- **Imbued items** (player picks one ability to attach the effect to) → positive `single_ability_focus` by definition.

**R5 — Proc items get BOTH burst-proc and continuous-proc tags.** A proc mechanism (on-bullet, on-cast, on-hit) is both:
- `x_burst_proc adds` — how strongly the proc fires when triggered.
- `x_continuous_proc adds` — how often the proc re-fires.

Where x = `spirit` or `gun` depending on the trigger source. Lean by cd:
- Short ICD / per-bullet → continuous_proc higher, burst_proc smaller.
- Long cd / per-cast → burst_proc higher, continuous_proc smaller.

Mystic Burst, Mystic Regeneration, Spirit Strike, Tesla Bullets, etc. should each carry both proc tags rather than dropping one.

**R6 — Item-deals-damage rule (don't drop the damage row).** If an item literally deals damage of a type — even small per-tick or per-proc — encode that damage row at the appropriate amortized score (often 0.3-0.7) rather than dropping it. Mystic Burst at +40 spirit/cycle still scores `spirit_damage` ≈ 0.3. Spirit Strike's per-melee spirit proc keeps `spirit_damage`. Toxic Bullets' DoT keeps `spirit_damage` (as continuous).

**R7 — Class-fit tags (`grounded` / `aerial`).** Items whose mechanic only works in one mobility profile should carry the matching tag:
- Melee items, ground-slams, close-range gun items → `grounded adds` (typical 0.3-0.5).
- Flight, leap, stamina-heavy, multi-jump items → `aerial adds` (typical 0.5-1.0 depending on how much air-time the item enables).

Prefer a single positive tag (`grounded` OR `aerial`) over a negative on the opposite — encoding a negative `aerial` on a melee item double-counts the same anti-synergy.

**R8 — Healing items get `high_max_hp relies`.** Heals scale (in cushion / value) with the carrier's HP pool. Add `high_max_hp adds 0.3-0.5 relies` to any item with regen / lifesteal / burst-heal / barrier mechanics.

**R9 — Stamina items get the full mobility/escape suite.** Any item with `Stamina` or `StaminaCooldownReduction` raw stat gets:
- `horizontal_mobility adds` + `vertical_mobility adds` (split per +1 stamina rule — 0.5 weight to each per +1 charge)
- `aerial adds` (stamina enables air-dashes / multi-jumps)
- `escape adds` (panic-button mobility)
- `engage adds` (stamina lets you "jump on" enemies just as well as away)

**R10 — Heal-item bundle.** Self-heal / regen / burst-heal items typically also score:
- `assist_importance adds` (if ally-targetable, e.g., Healing Rite, Healing Nova)
- `farmer adds` (heals counter neutral-camp damage; small 0.3-0.5)
- BOTH `burst_heal` AND `continous_heal` (any heal-over-time is a blend — encode both, lean per duration)
- `high_max_hp relies` (R8)
- `damage_sponge relies` if the heal triggers under sustained damage

**R11 — Melee items need `close_range` + `engage`.** Any item with melee damage / heavy-melee proc / melee-on-hit / melee-resist (on the carrier's side) → `close_range adds` and usually `engage adds`. Melee inherently forces close engagement.

**R12 — Melee counts as weapon damage.** Close-range weapon-damage items (Close Quarters, Point Blank, Crushing Fists) implicitly boost melee output as well — add a `melee_damage adds` row (often 0.5-1.0). Melee resist items that involve the carrier brawling also pick up `melee_damage` since brawling is the intended playstyle.

**R13 — Counter-flavor items get `counter_importance`.** Items bought specifically to counter a playstyle (anti-heal items, parry-rewarders like Rebuttal, anti-spirit-burst like Spellbreaker, anti-aerial like Knockdown) score `counter_importance adds` (typical 1.0-1.5).

**R14 — Movement-speed items get small `farmer`.** Sprint and in-fight MS items help with farm efficiency (jungle traversal, jungle camp positioning). Add `farmer adds 0.3-0.5` to any item whose primary mechanic is move/sprint speed. Don't apply to items where MS is only a side benefit.

**R15 — Don't drop tags just because the math is small.** If an item logically touches a tag, encode it at the small value (e.g., 0.2-0.3) rather than dropping. Mystic Regeneration's 4 HP/sec on spirit-damage trigger IS a lifesteal mechanic — give it `spirit_lifesteal adds`, plus both `spirit_burst_proc` and `spirit_continuous_proc`. The user's review was very explicit that dropping these is wrong.

**R16 — Special-case items get prose flags in Interpretation, not tag gymnastics.** Golden Goose Egg is a two-phase item (buy early, "pop" later) — the Interpretation should explicitly call out the two-phase usage and the audit row for it is informational, not actionable cleanup. Don't try to encode the time-shifting via tags.

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
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage lifts burst windows heavier (0.5 × bullet_damage) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage also lifts sustained DPS (0.3 × bullet_damage) |

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
| `burst_heal` | 50/proc | 0.4 | adds | R10 blend partner: each 50 HP proc is a small burst on top of the trickle |
| `bullet_lifesteal` | — | 0.6 | adds | R15: bullet-triggered self-heal IS a lifesteal mechanic, even if it's gated by cd |
| `gun_burst_damage` | — | 0.35 | adds | R2: per-shot damage propagation (0.5 × 0.7) |
| `gun_continuous_damage` | — | 0.2 | adds | R2: per-shot damage propagation (0.3 × 0.7) |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales (in cushion) with the carrier's HP pool |
| `farmer` | — | 0.3 | adds | R10: sustained heal counters neutral-camp damage during jungle clears |
| `gun_burst_proc` | — | 0.3 | adds | R5: 6s-cd bullet proc — burst-leaning |
| `gun_continuous_proc` | — | 0.4 | adds | R5: 6s cd is medium — continuous flavor still meaningful per cycle |

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
| `continous_heal` | 0.6/sec | 0.3 | adds | R10 cadence flavor: OOC regen is a slow continuous heal |
| `farmer` | — | 0.5 | adds | R14: sprint speed dramatically improves jungle traversal and rotation between camps |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline (no explicit HP row on this item) |
| `escape` | — | 0.3 | adds | Sprint helps disengage from fights |
| `engage` | — | 0.2 | adds | Sprint also helps close to engage; weaker than escape since sprint drops out of combat |

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
| `aerial` | — | 0.6 | adds | R9 stamina suite: air-dashes and multi-jumps draw on stamina charges |
| `engage` | — | 0.4 | adds | R9 stamina suite: extra stamina lets you "jump on" enemies, not just escape |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `melee_damage` | — | 0.6 | adds | R12: close-range weapon damage IS melee damage by extension — melee counts as weapon damage (per user) |
| `engage` | — | 0.4 | adds | R11: close-range items force engaging the enemy to extract value |
| `grounded` | — | 0.4 | adds | R7: close-range gunfighting happens grounded; aerials don't benefit |
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage propagation (0.5 × bullet_damage 1.0) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation (0.3 × bullet_damage 1.0) |

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
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline (no explicit bullet_damage row on this item) |
| `gun_burst_damage` | — | 0.4 | adds | R5: 9s-cd headshot proc adds a meaningful burst spike on top of base shots |
| `gun_continuous_damage` | — | 0.1 | adds | R5: low-frequency proc contributes little to sustained DPS |
| `gun_burst_proc` | 45/9s | 0.5 | adds | R5: long-cd, big-spike per-shot proc — burst-leaning |
| `gun_continuous_proc` | — | 0.2 | adds | R5: still procs once per cycle so some continuous flavor remains |
| `single_target` | — | 0.4 | adds | Headshot proc only hits one target — no AoE component |

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
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage propagation (0.5 × bullet_damage 1.0) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation (0.3 × bullet_damage 1.0) |

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
| `self_heal` | 0.3/sec | 0.2 | adds | Token OOC regen |
| `scaling_early` | — | 1.0 | adds | Item gets purchased early and falls off as creep farm matters less |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline (no hero-targeting bullet_damage on this item; baseline still applies) |
| `gun_burst_damage` | — | 0.07 | adds | R3 floor propagation |
| `gun_continuous_damage` | — | 0.05 | adds | R3 floor propagation |
| `continous_heal` | 0.3/sec | 0.2 | adds | R10 cadence partner for the OOC regen |

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
| `gun_continuous_damage` | — | 0.5 | adds | R2: fire-rate scales sustained DPS heavier (0.5 × fire_rate 1.0) |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire-rate also lifts burst windows lightly (0.2 × fire_rate 1.0) |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline (no direct per-shot damage stat — just the implicit purchase boost) |

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
| `burst_heal` | — | 0.3 | adds | R10 cadence partner: regen still accumulates a meaningful chunk over a few seconds |
| `high_max_hp` | — | 0.5 | relies | R8 (per user): regen scales (in effective cushion) with the carrier's HP pool — bigger pool = more buffer per tick |
| `damage_sponge` | — | 0.4 | relies | R10: continuous regen rewards heroes who absorb sustained damage |
| `farmer` | — | 0.3 | adds | R10: regen offsets neutral-camp damage during jungle clears |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `continous_heal` | ~4 HP/sec | 0.7 | adds | R10 blend partner: 300 over 20s also reads as a continuous trickle while undamaged |
| `team_heal` | 300 / 70s | 1.0 | adds | Can target allies at 30m range |
| `ally_buff` | sprint+heal | 0.5 | adds | Provides both heal and sprint to ally |
| `assist_importance` | — | 0.7 | adds | R10 (per user): ally-targetable heal — directly supports teammate sustain |
| `horizontal_mobility` | 0.57 m/s | 0.3 | adds | Sprint × 0.5 × uptime; small contribution |
| `escape` | — | 0.5 | adds | Sprint + heal burst is a classic disengage tool |
| `farmer` | — | 0.4 | adds | R10/R14 (per user): heal + sprint helps both jungle traversal and offsetting camp damage |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales (in cushion) with the recipient's HP pool |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `burst_heal` | 100/proc | 0.8 | adds | R10/R15 (per user): 100 HP on heavy-melee hit IS a burst of healing — encode it explicitly |
| `continous_heal` | — | 0.3 | adds | R10 blend partner: if you sustain melee pressure the per-proc heals chain into a trickle |
| `close_range` | — | 0.6 | adds | R11 (per user): melee item — close range is mandatory |
| `engage` | — | 0.5 | adds | R11: melee-on-hit forces you to engage in person |
| `grounded` | — | 0.4 | adds | R7: melee mechanic only realized while grounded |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Rebuttal
- **normalized_name**: `rebuttal`
- **tier**: 1 (800 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Rebuttal

### Interpretation
Parry-reward item that buffs your existing parry mechanic. Passive: +75 HP, +18% melee resist. On successful parry against a hero: heal yourself for the damage parried, gain +30% damage to ALL damage types for 6s, and reduce parry cd by 2s. Rewards aggressive melee engagement and parry-fishing — players who park near brawling enemies. Per WebFetch: "30% Bonus Damage affects all damage" (melee + bullet + spirit, not just one type).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `MeleeResistPercent` | 18% | 18% | 18% | Passive |
| `BonusDamagePercent` (post-parry) | 0 | 30% | ~6% | × 6/30 active uptime (parry every ~30s with cd reduction, all-damage scope) |
| `ParryCooldownReduction` | -2 | -2 | -2 | On successful parry |
| `BuffDuration` | 6 | 6 | — | (buff window) |
| `ParrySuccessHealPercentage` | 100% | 100% | ~var | Heals damage parried — variable but real burst-heal |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 75 | 0.4 | adds | Sub-baseline T1 HP (Extra Health 210 is the T1 ceiling); just a token bump |
| `melee_resistance` | 18% | 1.0 | adds | Solid T1 melee defense, just under Close Quarters' 20% |
| `melee_damage` | — | 0.5 | adds | R12 (per user): parry-rewarder is fundamentally a melee item — encode melee_damage explicitly, not bullet_damage |
| `melee_damage` | — | 0.8 | relies | Item is built around the parry/melee playstyle |
| `burst_heal` | var | 0.6 | adds | Parry refund heals the damage parried — can be huge per successful parry |
| `counter_importance` | — | 1.2 | adds | R13 (per user): item is specifically bought to counter melee-heavy enemies |
| `close_range` | — | 0.5 | adds | R11 (per user): parry only matters in melee range |
| `engage` | — | 0.4 | adds | R11: parry play forces standing in brawling range |
| `grounded` | — | 0.4 | adds | R7: parry mechanic is grounded brawling |
| `damage_sponge` | — | 0.3 | relies | Item rewards heroes who absorb melee attacks |
| `high_max_hp` | — | 0.4 | relies | R8: parry heal scales with HP cushion |

---

## Extra Charge
- **normalized_name**: `extra_charge`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Extra_Charge

### Interpretation
+1 ability charge for charged abilities (e.g., Dynamo's Singularity, McGinnis turrets) plus +7 SP that scales only with charged abilities. Defines the `charge_dependant` axis at T1 — the only T1 item with this stat. Useless on heroes whose abilities don't have charges; transformative for heroes who do.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityCharges` | +1 | +1 | +1 | Passive — only matters for heroes with charged abilities |
| `BonusSpiritForChargedAbilities` | 7 | 7 | 7 | Passive — only applies during charged-ability casts |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `charge_dependant` | +1 charge | 1.5 | adds | T1 ceiling (only item with this stat at T1); +1 extra charge is significant for charge-builds |
| `charge_dependant` | +1 + 7 SP | 1.5 | relies | Pays off massively only on heroes with charged abilities — pure synergy item |
| `spirit_damage` | 7 | 0.3 | adds | R1: was spirit_power — gated SP that only counts when casting a charged ability |
| `single_ability_focus` | — | 0.6 | adds | R4 (per user): most heroes only have 1-2 charged abilities, so the buff naturally narrows the kit |
| `multi_ability_focus` | — | 0.3 | adds | Mild — more charges = more total ability uses across the kit (but most kits only have one charge ability) |
| `spirit_burst_damage` | — | 0.15 | adds | R3 spirit floor propagation |
| `spirit_continuous_damage` | — | 0.1 | adds | R3 spirit floor propagation |
| `cooldown_reduction` | — | 0.3 | adds | Extra charges function similarly to CDR — they let you re-cast sooner |

---

## Extra Spirit
- **normalized_name**: `extra_spirit`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Extra_Spirit

### Interpretation
Simplest T1 SP stick: pure +10 SP passive, no conditions. Sets T1 ceiling for `spirit_power`. Cross-tier 2.0 is Diviners Kevlar T4 +35 SP / Boundless Spirit T4 +30 + 15% multiplier.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 10 | 10 | 10 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 10 | 1.5 | adds | R1 (per user): consolidated from spirit_power — T1 best general SP, defines the band on the curve toward Diviners 35 = 2.0 |
| `spirit_burst_damage` | — | 0.6 | adds | R2 (per user): general SP lifts burst-spirit abilities (0.5 × spirit_damage 1.5 ≈ 0.75, dialed to 0.6) |
| `spirit_continuous_damage` | — | 0.6 | adds | R2 (per user): same propagation for continuous-spirit abilities |
| `multi_ability_focus` | — | 0.5 | adds | R4 (per user): untargeted SP buffs the entire ability kit |
| `single_ability_focus` | — | -0.2 | adds | R4 (per user): item helps less if you're trying to optimize one ability — small negative |

---

## Golden Goose Egg
- **normalized_name**: `golden_goose_egg`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Golden_Goose_Egg

### Interpretation
Greed item: +400 gold on purchase, +90 gold/min passive, +1 m/s sprint, +1 OOC regen — paired with -10% damage. The flat -10% is a real cost; this is a strict farming-tempo trade. T1 candidate for the `farmer` axis alongside Monster Rounds. The damage penalty creates a `bullet_damage`/`spirit_damage` `relies` row (you want to play around the cost) but mainly registers as a direct negative `adds`.

**R16 special-case flag (per user):** Golden Goose Egg is awkward to tag because it's a two-phase item — buy it early for the gold tempo on heroes that don't deal early damage, accept the -10% during the weak phase, then it pays off as gold accumulates and you can complete bigger items off the lead. The audit rows below capture the steady-state numbers but the actual playstyle weight is "early-game tempo bet" which doesn't map cleanly onto any single Calculator tag. Treat this row as informational, not actionable cleanup.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StartingGold` | 400 | 400 | 400 | One-time on purchase |
| `BonusGoldPerMinute` | 90/min | 90/min | 90/min | Passive |
| `OutgoingDamagePenaltyPercent` | -10% | -10% | -10% | Passive DOWNSIDE — all damage types |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `farmer` | 400 + 90/min | 1.5 | adds | T1 farming-tempo ceiling alongside Monster Rounds |
| `bullet_damage` | -10% | -0.5 | adds | Flat damage penalty across all attacks |
| `spirit_damage` | -10% | -0.5 | adds | Same penalty hits ability damage too |
| `gun_burst_damage` | — | -0.25 | adds | R2 propagation of the -10% penalty (per-shot side) |
| `gun_continuous_damage` | — | -0.15 | adds | R2 propagation of the -10% penalty (sustained side) |
| `spirit_burst_damage` | — | -0.25 | adds | R2 propagation of the -10% penalty (spirit burst side) |
| `spirit_continuous_damage` | — | -0.25 | adds | R2 propagation of the -10% penalty (spirit continuous side) |
| `horizontal_mobility` | 0.5 m/s | 0.3 | adds | 1 m/s sprint × 0.5 weight |
| `self_heal` | 0.3/sec | 0.2 | adds | Token OOC regen |
| `scaling_early` | — | 1.0 | adds | Gold lead converts to tempo in early/mid; falls off late |
| `scaling_late` | — | -0.3 | adds | Late-game the -10% damage penalty outweighs the gold lead that's no longer accumulating quickly |

---

## Mystic Burst
- **normalized_name**: `mystic_burst`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Burst

### Interpretation
Charges up over 14s; the next ability that deals MORE than 80 spirit damage gets an extra +40 spirit damage tacked on. Per WebFetch: not a cd-gated proc — it's a charge-up mechanic, ready whenever the 14s has elapsed AND you land an ability that crosses the 80-damage threshold. Big-cast burst-spike heroes (e.g., a one-shot McGinnis turret salvo, a Seven Stormcloud) benefit; ability-spam heroes whose individual abilities don't cross 80 dmg get nothing.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 40 | 40 | ~2.8/sec | 40 / 14s charge if you reliably proc each cycle |
| `MinimumDamage` | 80 | 80 | — | Gate: ability must deal >80 spirit damage to trigger |
| `AbilityChargeUpTime` | 14 | 14 | — | (timing — proc charge-up) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 40/cycle | 0.4 | adds | R6/R15 (per user): item literally deals spirit damage (40 / 14s ≈ 2.8/sec amortized) — encode the damage row, don't drop it |
| `spirit_burst_damage` | 40/cast | 1.0 | adds | T1 spirit-burst proc on top of an existing burst hit |
| `spirit_burst_proc` | 40/14s | 1.0 | adds | Procs on ability cast — defines T1 baseline for the proc axis |
| `spirit_continuous_proc` | — | 0.3 | adds | R5: 14s charge-up still re-fires periodically — small continuous flavor |
| `spirit_continuous_damage` | — | 0.15 | adds | R3 spirit floor propagation (item is weighted toward burst, but the trickle is real) |
| `burst_damage` | — | 0.5 | relies | Pays off only when your ability already crosses the 80-damage threshold — synergy with burst heroes |
| `single_ability_focus` | — | 0.5 | adds | R4: 80-damage gate naturally narrows the buff to your one big nuke ability |
| `single_ability_focus` | — | 0.5 | relies | Better for heroes with one big nuke than for ability-spam kits |

---

## Mystic Expansion
- **normalized_name**: `mystic_expansion`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Expansion

### Interpretation
Pure passive: +20% ability range and +20% ability radius. Sets the T1 anchor for `range_extender_dependant` — cross-tier 2.0 is the T3 Greater Expansion item (verify exact raw in B3). Has zero value on heroes whose kit is point-blank only (Lash melee, Yamato slashes).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechRangeMultiplier` | 20% | 20% | 20% | Passive |
| `TechRadiusMultiplier` | 20% | 20% | 20% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `range_extender_dependant` | 20%/20% | 1.5 | adds | T1 ceiling for the range axis |
| `range_extender_dependant` | — | 1.0 | relies | Pays off only on heroes with ranged/AoE kits — pure synergy |
| `aoe_cluster` | — | 0.5 | adds | Bigger radius makes AoE abilities hit more targets |
| `long_range` | — | 0.5 | adds | Bigger range helps long-range ability heroes (e.g., Vindicta) |
| `single_ability_focus` | — | 0.6 | adds | R4 (per user): Mystic Expansion is imbued — player attaches it to one chosen ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline (per user: every spirit item provides a small implicit SP boost on purchase) |
| `spirit_burst_damage` | — | 0.05 | adds | R3 spirit floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 spirit floor propagation |

---

## Mystic Regeneration
- **normalized_name**: `mystic_regeneration`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Regeneration

### Interpretation
Passive: +50 HP plus a regen trigger — landing spirit damage on an enemy hero starts a 4 HP/s regen for 6 seconds. T1 component of the Radiant Regeneration upgrade chain. The trigger is constant if you're actively casting, so effective regen is roughly 4 HP/s while engaged with abilities. Defines the T1 ability-driven sustain niche.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `Regeneration` | 4/sec | 4/sec | ~3.2/sec | Active during combat when abilities land on heroes; ~0.8 uptime in fights |
| `RegenerationDuration` | 6 | 6 | — | (per-trigger duration; re-procs on next ability hit) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | ~3.2/sec | 1.0 | adds | Ability-driven sustain — competitive with Extra Regen's flat 3/sec, but conditional |
| `continous_heal` | ~3.2/sec | 1.0 | adds | Same effect, cadence axis — sustains during ability engagement |
| `burst_heal` | — | 0.3 | adds | R10 blend partner: 6s regen window after each proc reads slightly burst-flavored |
| `self_heal` | — | 0.8 | relies | Pays off only if you're landing spirit damage on enemy heroes consistently |
| `spirit_damage` | — | 0.5 | relies | Requires ability damage to proc — synergy with spirit-damage builds |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_lifesteal` | — | 0.5 | adds | R15 (per user): spirit-damage-triggered regen IS a spirit_lifesteal mechanic — encode it explicitly |
| `spirit_burst_proc` | — | 0.4 | adds | R5 (per user): per-ability-hit proc — re-triggers each time you land spirit damage |
| `spirit_continuous_proc` | — | 0.5 | adds | R5: 6s linger window means the proc continuously refreshes during ability uptime |
| `high_max_hp` | 50 | 0.3 | adds | Token T1 HP bump |
| `high_max_hp` | — | 0.4 | relies | R8: regen scales with HP cushion |
| `farmer` | — | 0.3 | adds | R10: regen offsets neutral-camp damage during ability-based jungle clears |
| `spirit_burst_damage` | — | 0.05 | adds | R3 spirit floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 spirit floor propagation |

---

## Rusted Barrel
- **normalized_name**: `rusted_barrel`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Rusted_Barrel

### Interpretation
Active single-target debuff: target an enemy at up to 32m, apply -32% fire rate and -8 bullet resist for 5s on a 16s cd. Passive +50 HP and +0.5 m/s sprint. Strong single-target shutdown for the gunfight phase — cripples a key enemy DPS during a window. Per the single-target × 0.2 × uptime convention: 32% × 0.2 × (5/16) ≈ 2% effective, but the strategic value is higher than the math suggests since it targets the threat.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `FireRateSlow` | 32% | 32% | ~2% | × 0.2 single-target × 5/16 uptime; strategic value > math |
| `BulletArmorReduction` | -8 | -8 | -0.5 | × 0.2 ST × 5/16 uptime |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `BonusSprintSpeed` | 0.5 m/s | 0.5 m/s | 0.5 m/s | Passive |
| `AbilityDuration` | 5 | 5 | — | (timing — debuff window) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityCastRange` | 32 m | 32 m | — | (single-target cast range) |
| `AbilityCastDelay` | 0.1 | 0.1 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate_slow` | 32% × 0.2 × 5/16 | 1.0 | adds | T1 best for the fire_rate_slow axis (Rusted Barrel is the only T1 item with this stat); cross-tier 2.0 = Juggernaut T4 36% passive aura |
| `bullet_resist_shred` | -8 × 0.2 × 5/16 | 0.3 | adds | Sub-baseline shred (T2 Weakening Headshot -13 = T2 best) |
| `disarm` | — | 0.5 | adds | The fire-rate-slow approximates a soft disarm — significantly cuts enemy DPS during the window |
| `high_max_hp` | 50 | 0.3 | adds | Token T1 HP |
| `horizontal_mobility` | 0.25 m/s | 0.1 | adds | 0.5 m/s sprint × 0.5 weight |
| `single_target` | — | 0.5 | adds | Item is built around single-target debuff |
| `counter_importance` | — | 1.0 | adds | R13: targeted shutdown — bought specifically to counter a key enemy DPS |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 spirit floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 spirit floor propagation |

---

## Spirit Strike
- **normalized_name**: `spirit_strike`
- **tier**: 1 (800 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Strike

### Interpretation
Melee-on-hit proc against heroes: 40 spirit damage + 0.37 SP scaling, plus -6 TechArmor (spirit resist shred) on the target for 6s. 8s cd between heavy-melee procs; 16s if proc'd via light melee. Combines a small spirit damage tick with a meaningful spirit-resist debuff that lingers — enables follow-up ability damage on the target. Rewards heroes who close to melee range.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritDamage_Value` | 40 | 40 | ~5/sec | 40 / 8s on heavy-melee cycle (+ 0.37 SP scaling not factored) |
| `TechArmorDamageReduction` | -6 | -6 | -4.5 | × 6/8 uptime on the target after a proc |
| `LightMeleeCooldownMult` | 2 | 2 | — | (light-melee procs incur 2× cd → 16s) |
| `AbilityDuration` | 6 | 6 | — | (debuff linger window) |
| `AbilityCooldown` | 8 | 8 | — | (heavy-melee proc cd) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 40/cycle | 0.4 | adds | R6/R15 (per user): item literally deals spirit damage on melee — don't drop the row even though the source is melee |
| `spirit_burst_damage` | 40/cycle | 0.7 | adds | T1 melee-proc spirit damage; sub-baseline vs Mystic Burst's 40 because the trigger is harder to land |
| `spirit_continuous_damage` | — | 0.25 | adds | R2: per-melee proc has frequency over a brawl — adds to sustained spirit DPS too |
| `spirit_resist_shred` | -4.5 × 0.2 ST | 0.5 | adds | The lingering -6 spirit armor is the headline; single-target × 0.2 discount applied |
| `melee_damage` | — | 0.5 | adds | Item rewards / enables a melee playstyle |
| `melee_damage` | — | 1.0 | relies | Requires hitting heavy melee to proc — strong synergy with melee-focused heroes |
| `close_range` | — | 0.6 | adds | R11 (per user): melee item — close range is mandatory |
| `engage` | — | 0.4 | adds | R11: melee proc forces engaging in person |
| `grounded` | — | 0.5 | adds | R7 (per user): melee mechanic only realized while grounded — encode positive `grounded` instead of a negative `aerial` |
| `spirit_burst_proc` | — | 0.4 | adds | R5 (per user): 8s-cd melee-triggered spirit proc — encode the burst flavor |
| `spirit_continuous_proc` | — | 0.6 | adds | R5: short proc cd means it re-fires frequently during a brawl — continuous-leaning |

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
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire_rate light propagation (0.2 × 0.9) — Active Reload also has a small per-shot lift from the lifesteal-window dmg |
| `gun_continuous_damage` | — | 0.45 | adds | R2: fire_rate heavy propagation (0.5 × 0.9) |
| `self_heal` | — | 0.5 | adds | The lifesteal during active window is real self-sustain |
| `continous_heal` | — | 0.4 | adds | R10 blend partner for the bullet-driven sustain |
| `high_max_hp` | — | 0.3 | relies | R8: lifesteal scales effective HP cushion |

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
| `gun_burst_damage` | — | 0.6 | adds | R2: per-shot damage propagation (0.5 × 1.2) |
| `gun_continuous_damage` | — | 0.4 | adds | R2: per-shot damage propagation (0.3 × 1.2) |

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
| `counter_importance` | — | 1.0 | adds | R13: strong vs. SP-reliant enemies (Seven, Mirage); situational pick |
| `close_to_team` | — | 0.5 | adds | Debuff value scales when the team can capitalize on the weakened target |
| `single_target` | — | 0.5 | adds | Single-target active debuff |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 spirit floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 spirit floor propagation |

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
Active 5s self-buff on 16s cd: +3 m/s move speed, removes the shoot-walk and zoom-walk penalties, +35% slide scale. Passive +6% bullet resist and +35% slow resist. Designed for kiting/gunkata heroes who fight while moving — shoot-walk penalty removal is the headline. ~31% uptime on the active window.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 6% | 6% | 6% | Passive |
| `SlowResistancePercent` | 35% | 35% | 35% | Passive |
| `ActiveBonusMoveSpeed` | 0 | 3 m/s | 0.94 m/s | × 5/16 uptime |
| `MoveWhileShootingSpeedPenaltyReductionPercent` | 0 | 100% | ~31% | × 5/16 uptime |
| `MoveWhileZoomedSpeedPenaltyReductionPercent` | 0 | 100% | ~31% | × 5/16 uptime |
| `SlideScale` | 35% | 35% | — | (slide reach buff during active) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityDuration` | 5 | 5 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | 0.94 m/s | 0.5 | adds | 3 m/s active × 5/16 uptime |
| `bullet_evasion` | shoot-walk fix | 1.0 | adds | Shoot-walk penalty removal lets you fight while moving — defines this niche at T2 |
| `bullet_resistance` | 6% | 0.4 | adds | Sub-baseline T2 bullet resist (Battle Vest 18% is T2 best) |
| `cc_resist` | 35% | 1.0 | adds | Solid slow-resist passive |
| `escape` | — | 0.5 | adds | Active sprint burst can disengage |
| `engage` | — | 0.4 | adds | Same sprint burst works as a gap-closer when chasing |
| `aerial` | — | 0.4 | adds | R7: shoot-walk-while-airborne also benefits — supports aerial gunfighting |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `gun_burst_damage` | — | 0.07 | adds | R3 floor propagation |
| `gun_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Intensifying Magazine
- **normalized_name**: `intensifying_magazine`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Intensifying_Magazine

### Interpretation
+20% ammo passive plus a ramp-up: sustained fire over 2.5s scales weapon damage from 0 → +45%. Rewards extended fire windows on heroes with big magazines (sustained-DPS profile). Burst gunners (single-shot snipers) get almost nothing from the ramp. Average effective damage over a sustained mag is closer to ~25% (assume you're in the higher half of the ramp once you commit).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusClipSizePercent` | 20% | 20% | 20% | Passive |
| `BaseAttackDamagePercentAtMaxDuration` | 0 | 45% | ~25% | Avg over sustained-fire window after the ramp |
| `ShootDurationForMax` | 2.5 | 2.5 | — | (ramp duration) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | 20% | 0.6 | adds | Below Titanic 100% (cross-tier 2.0); within-tier solid but well below the 2.0 anchor |
| `bullet_damage` | ~25% | 1.0 | adds | Strong ramp-up damage; sub-Glass Cannon (80% = 2.0) but on the curve |
| `gun_continuous_damage` | 25% ramp | 1.5 | adds | R2: sustained-fire ramp IS the continuous-damage axis at T2 |
| `gun_burst_damage` | — | 0.3 | adds | R2: per-shot damage propagation (light, since burst windows can't ramp up) |
| `bullet_damage` | — | 1.0 | relies | Item rewards sustained-fire gunners (big-mag heroes) — synergy strong |
| `magazine_size_dependant` | — | 1.0 | relies | Bigger mags from other items extend the high-ramp window |

---

## Long Range
- **normalized_name**: `long_range`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Long_Range

### Interpretation
+40% weapon damage when target is >15m away, +8% bullet range, +0.75 m/s sprint. The signature `long_range` item — defines the long-range axis at T2. Uptime depends entirely on the hero: snipers like Vindicta sit at 70-80% uptime, brawlers like Lash 0%. Effective ~32% for long-range mains.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LongRangeBonusWeaponPower` | 40% | 40% | ~32% | × 0.8 uptime for long-range heroes |
| `LongRangeBonusWeaponPowerMinRange` | 15 m | 15 m | — | (range gate) |
| `BonusAttackRangePercent` | 8% | 8% | 8% | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `long_range` | 40% + range | 1.5 | adds | T2 long-range ceiling (the axis-defining item at T2) |
| `bullet_damage` | ~32% | 1.0 | adds | Strong gated damage; sub-Glass Cannon |
| `long_range` | — | 1.0 | relies | Pays off massively on snipers — pure synergy |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | 0.75 m/s sprint × 0.5 weight |
| `away_from_team` | — | 0.5 | adds | Range gating encourages playing off the team |
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage propagation (0.5 × 1.0) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation (0.3 × 1.0) |
| `mid_range` | — | 0.4 | adds | The 15m gate means anything past mid-range benefits — not just snipers |

---

## Melee Charge
- **normalized_name**: `melee_charge`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Melee_Charge

### Interpretation
+10% melee damage passive, +6% bullet resist, plus a charged heavy-melee: +25 bonus heavy melee damage with +50% reach on 7s cd. The extended reach is the headline — turns heavy melee into a gap-closer and burst hit. Specifically rewards melee-focused heroes (Abrams, Lash, Yamato).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusMeleeDamagePercent` | 10% | 10% | 10% | Passive |
| `BonusHeavyMeleeDamage` | 25 | 25 | ~3.6/sec | 25 / 7s cd if landing heavy melee each cycle |
| `MeleeDistanceScale` | 50% | 50% | — | (heavy melee reach extended) |
| `BulletResist` | 6% | 6% | 6% | Passive |
| `AbilityCooldown` | 7 | 7 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `melee_damage` | 10% + 25/heavy | 1.0 | adds | T2 melee scaler + bonus damage proc |
| `melee_damage` | — | 1.0 | relies | Pays off only for melee-focused heroes |
| `engage` | 50% reach | 1.0 | adds | R11: Extended heavy-melee reach is a real gap-closer |
| `bullet_resistance` | 6% | 0.4 | adds | Token defensive layer |
| `close_range` | — | 0.6 | adds | R11: melee item — close range is mandatory |
| `grounded` | — | 0.4 | adds | R7: heavy-melee mechanic only realized while grounded |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `gun_burst_damage` | — | 0.07 | adds | R3 floor propagation |
| `gun_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Mystic Shot
- **normalized_name**: `mystic_shot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Mystic_Shot

### Interpretation
Bullet → spirit-damage converter: every bullet hit applies +40 spirit damage on a 1s internal cd. +7 SP passive. Effective spirit DPS ≈ 40 spirit per second when shooting. Sets T2 anchor for the bullet→spirit hybrid niche on the curve toward Tesla Bullets (T3) and Spirit Burst conversion items.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `ProcBonusMagicDamage_Value` | 40 | 40 | ~40/sec | 1s ICD when actively shooting |
| `ProcChance` | 100% | 100% | — | (always procs when ready) |
| `ProcCooldown` | 1 | 1 | — | (ICD) |
| `SpiritPower` | 7 | 7 | 7 | Passive |
| `AbilityCooldown` | 8 | 8 | — | (timing — long cd but irrelevant given 1s ICD) |
| `Radius` | 1 m | 1 m | — | (hit radius) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_proc` | 40/sec | 1.5 | adds | T2 best on-hit spirit proc — defines this niche |
| `hybrid_damage_usage` | — | 1.5 | adds | Item is designed for hybrid bullet/spirit playstyle |
| `gun_continuous_proc` | 40/sec | 1.5 | adds | R5: continuous bullet-driven spirit damage |
| `gun_burst_proc` | — | 0.5 | adds | R5: still procs each shot — burst flavor at any moment is real |
| `spirit_damage` | 40/sec | 1.0 | adds | R1/R6: was spirit_power consolidated; the bullet proc IS spirit damage |
| `spirit_burst_damage` | 40/hit | 0.5 | adds | Per-shot spirit damage; the burst-window contribution is real but procs continuously |
| `spirit_continuous_damage` | 40/sec | 1.2 | adds | R2: continuous bullet proc IS continuous spirit damage |
| `hybrid_damage_usage` | — | 1.0 | relies | Synergy with heroes who use both gun and ability damage |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Opening Rounds
- **normalized_name**: `opening_rounds`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Opening_Rounds

### Interpretation
Picker-opener: +8% bullet damage passive, +30% bonus when enemy is above 50% HP. +60% bullet speed and +7 SP. The 30% conditional is huge but only fires during the opening of an engagement; once the target drops below 50% HP, it's gone. Best on burst-pick heroes who can blast someone from full HP through the threshold in a few shots.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |
| `BaseAttackDamagePercentBonus` | 0 | 30% | ~12% | × 0.4 avg uptime (~first half of engagement) |
| `EnemyLifeThreshold` | 50% | 50% | — | (target-HP threshold) |
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive |
| `TechPower` | 7 | 7 | 7 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 8% + 12% | 1.0 | adds | Solid T2 damage with conditional ramp |
| `gun_burst_damage` | ~12% | 1.0 | adds | R2: front-loaded damage in opening — burst-pick synergy |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation (light, since threshold-gating cuts continuous) |
| `long_range` | 60% bullet speed | 1.0 | adds | Tier-flat 60% bullet speed |
| `engage` | — | 0.5 | adds | Item rewards initiating fights |
| `spirit_damage` | 7 | 0.3 | adds | R1: was spirit_power — small SP secondary |
| `bullet_damage` | — | 0.5 | relies | Synergy with burst-pick heroes that can crit through threshold |
| `mid_range` | — | 0.3 | adds | Bullet speed compounds at mid-range too |

---

## Slowing Bullets
- **normalized_name**: `slowing_bullets`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Slowing_Bullets

### Interpretation
Bullet-proc slow: each shot adds 0.7 stacks (5 stacks = 30% MS slow + 25% dash reduction, refreshes per shot, 3.5s linger). Passive +15% bullet damage. Defines the T2 `movement_slow` axis for sustained-fire heroes — needs ~7 hits to max the slow then maintains it while shooting.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 15% | 15% | 15% | Passive |
| `SlowPercent` | 0 | 30% | ~24% | × 0.8 ramp uptime in sustained fire |
| `GroundDashReductionPercent` | 0 | -25% | ~-20% | Same ramp |
| `SlowDuration` | 3.5 | 3.5 | — | (linger) |
| `BuildUpDuration` | 5 | 5 | — | (ramp window) |
| `BuildUpPerShot` | 0.7 | 0.7 | — | (per-shot ramp) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `movement_slow` | 24% | 1.0 | adds | Solid T2 slow; cross-tier 2.0 is Lightning Scroll 80% / Lifestrike 60% |
| `bullet_damage` | 15% | 1.0 | adds | T2 baseline weapon damage |
| `disarm` | — | 0.3 | adds | Dash reduction soft-locks enemy mobility |
| `bullet_proc` | per-shot ramp | 0.5 | adds | Item works via bullets but mostly for the slow, not damage |
| `gun_continuous_damage` | — | 0.5 | adds | R2: bullet_damage propagation (lighter — slow is the headline, not DPS) |
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage propagation (0.5 × 1.0) |
| `gun_continuous_proc` | per-shot | 0.6 | adds | R5: per-shot slow stack — high frequency |
| `gun_burst_proc` | — | 0.3 | adds | R5: still procs each shot — small burst flavor |

---

## Spirit Shredder Bullets
- **normalized_name**: `spirit_shredder_bullets`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spirit_Shredder_Bullets

### Interpretation
Bullet-proc spirit-resist debuff: -8 spirit armor applied on each bullet hit, 8s linger. Passive +10% spirit lifesteal. Pairs with hybrid bullet+spirit heroes — landing shots makes follow-up ability damage hit harder. Lower raw debuff than Spirit Sap's -9 but applies per bullet, so uptime is much higher.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechArmorDamageReduction` | -8 | -8 | ~-8 | High uptime while shooting (8s linger renews each hit) |
| `DebuffDuration` | 8 | 8 | — | (linger) |
| `AbilityLifestealPercentHero` | 10% | 10% | 10% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resist_shred` | -8 | 1.0 | adds | T2 best for the bullet-applied variant; cross-tier 2.0 = Crippling Headshot -16 |
| `spirit_lifesteal` | 10% | 1.0 | adds | T2 baseline (Spirit Lifesteal 13% is T2 best) |
| `bullet_proc` | per-shot | 1.0 | adds | The mechanic is bullet-driven |
| `hybrid_damage_usage` | — | 1.5 | adds | Item exists to bridge gun and ability damage |
| `hybrid_damage_usage` | — | 1.0 | relies | Pays off only on hybrid heroes |
| `gun_continuous_proc` | per-shot | 1.0 | adds | R5: per-bullet spirit-shred proc — high frequency |
| `gun_burst_proc` | — | 0.4 | adds | R5: still procs each shot — burst flavor exists |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `gun_burst_damage` | — | 0.07 | adds | R3 floor propagation |
| `gun_continuous_damage` | — | 0.05 | adds | R3 floor propagation |
| `high_max_hp` | — | 0.3 | relies | R8: lifesteal cushion scales with HP |

---

## Split Shot
- **normalized_name**: `split_shot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Split_Shot

### Interpretation
Active 5s shot-splitter: each shot fires 5 bullets in a 45° cone (massive close-range damage spike), then leaves +8% damage per stack (max 5) for 12s. 27s cd ≈ 19% uptime on the split window. The cone makes it borderline useless at long range but devastating point-blank. Per-stack damage afterwards is a continued damage ramp.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletSplitShot` | 0 | 5 | ~0.93 (×5 pellets × 5/27 uptime) | Active 5s / 27s cd |
| `SpreadAngleDegrees` | 45° | 45° | — | (cone spread — close range only) |
| `WeaponDamagePerStack` | 0% | 40% (5×8%) | ~18% | Per-stack ramp during active + 12s afterwards |
| `MaxStacks` | 5 | 5 | — | (cap) |
| `AbilityCooldown` | 27 | 27 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `gun_burst_damage` | 5× bullets cone | 1.5 | adds | R2: T2 ceiling for burst-shot windows |
| `close_range` | 45° cone | 1.0 | adds | R11: cone spread makes this close-range only |
| `bullet_damage` | ~18% | 0.8 | adds | Per-stack ramp damage after the split window |
| `gun_continuous_damage` | — | 0.5 | adds | R2: per-stack ramp also adds to sustained DPS during the 12s window |
| `magazine_size_dependant` | — | 0.8 | relies | Each "shot" eats 1 ammo but fires 5 pellets — bigger mags extend the burst |
| `bullet_damage` | — | 0.5 | relies | Pays off best for high-DPS shotgun/SMG heroes |
| `engage` | — | 0.4 | adds | R11: close-range cone forces you to engage |
| `grounded` | — | 0.4 | adds | R7: close-range cone shooting is grounded play |
| `melee_damage` | — | 0.4 | adds | R12: close-range weapon overlaps with melee playstyle |

---

## Swift Striker
- **normalized_name**: `swift_striker`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Swift_Striker

### Interpretation
Pure passive +20% fire rate and +0.75 m/s sprint. Sets the T2 baseline for `fire_rate` providers alongside Active Reload's gated 25%. Cross-tier 2.0 is Blood Tribute T3 35% / Healing Tempo T4 35%.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 20% | 20% | 20% | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate` | 20% | 1.1 | adds | Solid T2 fire-rate; on the curve toward Blood Tribute 35% = 2.0 |
| `gun_continuous_damage` | — | 0.55 | adds | R2: fire-rate heavy propagation (0.5 × 1.1) — sustained DPS axis |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire-rate light burst propagation |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | 0.75 sprint × 0.5 weight |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Weakening Headshot
- **normalized_name**: `weakening_headshot`
- **tier**: 2 (1600 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Weakening_Headshot

### Interpretation
On-headshot bullet resist shred: -13 bullet resist on the target with 12s linger, diminishing returns on stack. Passive +60 HP. T2 best for the `bullet_resist_shred` axis; cross-tier 2.0 is Crippling Headshot T4 at -16. Effective uptime is high if you land headshots regularly.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResistReduction` | -13 | -13 | ~-10 | After diminishing avg + miss-rate; high uptime due to 12s linger |
| `DebuffDuration` | 12 | 12 | — | (linger) |
| `DiminishingMultiplier` | 0.5 | 0.5 | — | (subsequent applications scaled by 0.5) |
| `BonusHealth` | 60 | 60 | 60 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resist_shred` | -10 effective | 1.5 | adds | T2 ceiling for the axis; cross-tier 2.0 = Crippling -16 |
| `headshot_damage` | — | 1.0 | relies | Requires landing headshots to proc |
| `high_max_hp` | 60 | 0.3 | adds | Token T2 HP |
| `long_range` | — | 0.5 | adds | Headshot mechanic favors long-range gun heroes |
| `gun_burst_proc` | per-headshot | 0.6 | adds | R5: per-headshot proc — long-cycle, burst-leaning |
| `gun_continuous_proc` | — | 0.3 | adds | R5: still refreshes on each successful headshot |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `gun_burst_damage` | — | 0.07 | adds | R3 floor propagation |
| `gun_continuous_damage` | — | 0.05 | adds | R3 floor propagation |
| `single_target` | — | 0.4 | adds | Headshot proc only hits one target |

---

## Battle Vest
- **normalized_name**: `battle_vest`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Battle_Vest

### Interpretation
HP-gated bruiser stat stick: +18% bullet resist passive, +3 OOC regen. While the carrier is above 65% HP, +15% bullet damage and +7% fire rate. Carrier-side HP threshold mirrors Hollow Point — rewards staying topped off. Uptime ~0.7 if you manage HP well. T2 best raw value for `bullet_resistance` (18% is on the curve toward Bullet Resilience T3 30% = 2.0).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 18% | 18% | 18% | Passive |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |
| `BaseAttackDamagePercent` (gated) | 0 | 15% | ~10.5% | × 0.7 carrier-HP uptime |
| `BonusFireRate` (gated) | 0 | 7% | ~5% | Same gate |
| `LifeThreshold` | 65% | 65% | — | (carrier-HP gate) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resistance` | 18% | 1.5 | adds | T2 ceiling for bullet resist on the curve toward 30% = 2.0 |
| `gun_burst_resistance` | — | 0.6 | adds | R2 analogue: bullet_resistance applies to burst windows too |
| `gun_continuous_resistance` | — | 0.6 | adds | R2 analogue: same for sustained-fire incoming |
| `bullet_damage` | ~10.5% | 0.8 | adds | Gated bonus + flat resist makes this a strong bruiser package |
| `gun_burst_damage` | — | 0.4 | adds | R2: per-shot damage propagation (0.5 × 0.8) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation + fire-rate compounds |
| `fire_rate` | ~5% | 0.4 | adds | Gated modest fire rate |
| `self_heal` | 0.9/sec | 0.4 | adds | OOC regen × 0.3 uptime |
| `continous_heal` | 0.9/sec | 0.3 | adds | R10 cadence partner for OOC regen |
| `high_max_hp` | — | 0.8 | relies | Carrier-HP gating rewards stacking max HP for higher uptime |
| `damage_sponge` | — | 0.5 | relies | Item rewards bruiser playstyle |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Bullet Lifesteal
- **normalized_name**: `bullet_lifesteal`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Bullet_Lifesteal

### Interpretation
Pure passive: +13% bullet lifesteal and +90 HP. T2 baseline for the `bullet_lifesteal` axis. Cross-tier 2.0 is Leech T4 25%. The 90 HP is sub-T1-Extra-Health (210) — sparse-tier rule applies to T2 HP (T2's HP best is just 90).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletLifestealPercent` | 13% | 13% | 13% | Passive |
| `BonusHealth` | 90 | 90 | 90 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_lifesteal` | 13% | 1.0 | adds | T2 best alongside Active Reload; on curve toward Leech 25% = 2.0 |
| `self_heal` | passive | 0.8 | adds | Continuous gun-driven sustain |
| `continous_heal` | — | 0.7 | adds | R10 cadence partner: continuous bullet-driven heal |
| `burst_heal` | — | 0.3 | adds | R10 blend partner: chunks of lifesteal heal in bursts on big hits |
| `high_max_hp` | 90 | 0.5 | adds | T2 best raw HP (sparse-tier — well below T1 Extra Health 210) |
| `bullet_damage` | — | 0.5 | relies | More damage = more lifesteal |
| `high_max_hp` | — | 0.4 | relies | R8: lifesteal scales with HP cushion |
| `farmer` | — | 0.3 | adds | R10: lifesteal also restores you during jungle clears |
| `damage_sponge` | — | 0.3 | relies | R10: rewards sustained-fire bruisers who absorb hits |

---

## Debuff Reducer
- **normalized_name**: `debuff_reducer`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Debuff_Reducer

### Interpretation
Pure passive +25% status resist. Reduces duration/strength of incoming CC/debuffs. T2 defines the `debuff_resistance` axis; cross-tier 2.0 is T4 Spellbreaker / Unstoppable also 25% (tier-flat) — so this is on the tier-flat curve and earns 1.5 here, not 2.0 since later tiers don't beat it.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StatusResistancePercent` | 25% | 25% | 25% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `debuff_resistance` | 25% | 1.5 | adds | T2 ceiling on a tier-flat curve (Spellbreaker T4 also 25%) — strong everywhere |
| `cc_resist` | 25% | 1.5 | adds | Status resist directly cuts CC duration |
| `counter_importance` | — | 0.8 | adds | R13: bought specifically to counter CC-heavy comps |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Enchanters Emblem
- **normalized_name**: `enchanters_emblem`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Enchanters_Emblem

### Interpretation
Spirit-side bruiser package: +15 SP, +18% spirit resist passive, +2 OOC regen. The 5% CDR appears HP-gated (mirrors Battle Vest's pattern). Solid all-around stat stick for hybrid spirit builds — combines defensive resist with offensive scaling.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 15 | 15 | 15 | Passive |
| `TechResist` | 18% | 18% | 18% | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `CooldownReduction` | 5% | 5% | ~3.5% | × 0.7 carrier-HP gate uptime |
| `LifeThreshold` | 65% | 65% | — | (carrier-HP gate) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 15 | 1.0 | adds | R1: was spirit_power — solid T2 SP (Improved Spirit 18 is T2 best) |
| `spirit_burst_damage` | — | 0.5 | adds | R2: general SP propagation (≈0.5 × 1.0) |
| `spirit_continuous_damage` | — | 0.5 | adds | R2: general SP propagation |
| `spirit_resistance` | 18% | 1.0 | adds | T2 best alongside Enchanters Emblem itself; cross-tier 2.0 = Fury Trance 40% |
| `spirit_burst_resistance` | — | 0.4 | adds | Spirit resist applies to incoming burst-spirit too |
| `spirit_continuous_resistance` | — | 0.4 | adds | Same for sustained-spirit incoming |
| `cooldown_reduction` | ~3.5% | 0.3 | adds | Gated CDR — minor |
| `self_heal` | 0.6/sec | 0.3 | adds | Token OOC regen |
| `multi_ability_focus` | — | 0.4 | adds | R4: general SP + CDR helps the whole kit |
| `single_ability_focus` | — | -0.15 | adds | R4: small negative — general buff helps less when narrowed |
| `high_max_hp` | — | 0.5 | relies | Carrier-HP gating rewards HP-stacking |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Enduring Speed
- **normalized_name**: `enduring_speed`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Enduring_Speed

### Interpretation
Pure passive: +2 m/s in-fight move speed, +25% slow resist, +2 OOC regen. Defines T2 ceiling for non-sprint move speed (2 m/s). Slow resist is meaningful in slow-heavy comps. Cross-tier 2.0 is Veil Walker T3 +3.5 m/s.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusMoveSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `SlowResistancePercent` | 25% | 25% | 25% | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | 2 m/s | 1.3 | adds | T2 best in-fight move speed; on curve toward Veil Walker 3.5 = 2.0 |
| `cc_resist` | 25% | 1.0 | adds | Solid slow-resist |
| `escape` | — | 0.5 | adds | In-fight move speed helps disengage |
| `engage` | — | 0.4 | adds | Same move speed helps close to engage |
| `self_heal` | 0.6/sec | 0.3 | adds | Token OOC regen |
| `continous_heal` | 0.6/sec | 0.3 | adds | R10 cadence partner for OOC regen |
| `farmer` | — | 0.4 | adds | R14: in-fight move speed also helps jungle traversal |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Guardian Ward
- **normalized_name**: `guardian_ward`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Guardian_Ward

### Interpretation
Pure support active: bestow on an ally (40m range) a 6s buff with 50% CDR, 200 HP barrier, +2.75 m/s move speed, and +8% range/radius. 45s cd ≈ 13% uptime on the ally. The 50% CDR for 6s is the headline — lets the buffed ally double-cast a key ability. Defines `ally_buff` at T2.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReductionPctOnOthers` | 0 | 50% | ~6.7% | × 6/45 active uptime |
| `GuardianWardCombatBarrier` | 0 | 200 HP | ~26 HP | × 6/45 amortized |
| `BonusMoveSpeed` (active, ally) | 0 | 2.75 m/s | ~0.37 m/s | × 6/45 uptime |
| `TechRangeMultiplier` (active, ally) | 0 | 8% | ~1% | × 6/45 uptime |
| `TechRadiusMultiplier` (active, ally) | 0 | 8% | ~1% | × 6/45 uptime |
| `BuffDuration` | 6 | 6 | — | (buff window) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |
| `AbilityCastRange` | 40 m | 40 m | — | (ally cast range) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `ally_buff` | full kit | 1.5 | adds | T2 defining ally-buff item |
| `team_heal` | barrier 200 | 0.7 | adds | Barrier on cast — counts as a heal proxy |
| `burst_heal` | 200 barrier | 0.7 | adds | R10: barrier IS a burst heal-equivalent on cast |
| `continous_heal` | — | 0.3 | adds | R10 blend partner |
| `cooldown_reduction` | ~6.7% | 0.3 | adds | Cast-on-ally CDR; not self |
| `assist_importance` | — | 1.5 | adds | R10: item exists specifically to enable a teammate's burst window |
| `close_to_team` | — | 0.5 | adds | Requires being near teammates to use effectively |
| `high_max_hp` | — | 0.4 | relies | R8: barrier strength scales (in effective cushion) with HP pool |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius boost helps multiple abilities |

---

## Healbane
- **normalized_name**: `healbane`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healbane

### Interpretation
Anti-heal proc: -35% heal received and -35% regen on enemies for 8s when hit. +7 SP passive. On kill, heal carrier +275 HP. Hard counter to heal-heavy comps and bruisers. T2 anchor for `anti_heal`; cross-tier 2.0 is Spirit Burn T4 -70%.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealAmpReceivePenaltyPercent` | 0 | -35% | -35% | High uptime in fights |
| `HealAmpRegenPenaltyPercent` | 0 | -35% | -35% | Same |
| `TechPower` | 7 | 7 | 7 | Passive |
| `HealOnKill` | 0 | 275 | varies | Per kill — situational |
| `AbilityDuration` | 8 | 8 | — | (debuff window — easy to maintain) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `anti_heal` | -35% | 1.0 | adds | T2 baseline on curve toward Spirit Burn -70% = 2.0 |
| `counter_importance` | — | 1.5 | adds | R13: item exists specifically to counter heal-heavy comps |
| `burst_heal` | 275/kill | 0.5 | adds | On-kill heal — adds sustain to aggressive carries |
| `spirit_damage` | 7 | 0.3 | adds | R1: was spirit_power — small SP secondary |
| `high_kill_count` | — | 0.5 | relies | On-kill heal pays off best for carries with kill participation |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |
| `spirit_burst_damage` | — | 0.1 | adds | R3/R2 floor propagation |
| `spirit_continuous_damage` | — | 0.1 | adds | R3/R2 floor propagation |

---

## Healing Booster
- **normalized_name**: `healing_booster`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Booster

### Interpretation
Pure passive healing amplifier: +20% to all heals received (both burst and regen), +3/sec in-combat regen, +1 OOC regen. Glue item for heal-heavy comps and lifesteal builds. The 3/sec regen alone matches Extra Regen T1 — and the heal amp is what makes this T2-priced.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealAmpCastPercent` | 20% | 20% | 20% | Passive — amplifies received healing from casts |
| `HealAmpRegenPercent` | 20% | 20% | 20% | Passive — amplifies regen |
| `BonusHealthRegen` | 3/sec | 3/sec | 3/sec | Passive in-combat regen |
| `OutOfCombatHealthRegen` | 1/sec | 1/sec | 0.3/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | 3.3/sec + 20% amp | 1.5 | adds | T2 best self-heal glue (regen + amp); cross-tier 2.0 = Juggernaut 8/sec |
| `continous_heal` | 3/sec + amp | 1.3 | adds | Same effect under cadence axis |
| `burst_heal` | — | 0.5 | adds | R10 blend partner: the 20% amp multiplies burst heals from other sources |
| `self_heal` | — | 1.0 | relies | The amp multiplies other heal sources — synergy with healing-stacker builds |
| `team_heal` | — | 0.5 | adds | Amp also applies to heals received from teammates |
| `assist_importance` | — | 0.5 | adds | R10: the amp lets teammates' heals on you go further (and vice versa for support carriers) |
| `farmer` | — | 0.3 | adds | R10: regen offsets neutral-camp damage during clears |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion |
| `damage_sponge` | — | 0.4 | relies | R10: continuous regen rewards sustained-damage absorbers |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Reactive Barrier
- **normalized_name**: `reactive_barrier`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Reactive_Barrier

### Interpretation
Self-active 325 HP barrier for 10s on a 55s cd. ~18% uptime. Pure clutch button — pop pre-fight or in a panic to absorb a big incoming hit. Effective HP add ≈ 60 amortized but the actual value is higher because it's discretionary (timed for fights).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `VexBarrierCombatBarrier_Value` | 0 | 325 HP | ~60 HP | × 10/55 amortized; strategic value > math |
| `AbilityDuration` | 10 | 10 | — | (timing) |
| `AbilityCooldown` | 55 | 55 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `burst_heal` | 325/cast | 1.0 | adds | Big situational barrier — pre-fight protection |
| `continous_heal` | — | 0.3 | adds | R10 blend partner: 10s window does provide some sustained protection too |
| `damage_sponge` | — | 1.0 | adds | Item exists to absorb big damage windows |
| `burst_resistance` | — | 1.0 | adds | Reactive barrier shines against burst damage |
| `escape` | — | 0.5 | adds | Lets you survive bad disengage attempts |
| `engage` | — | 0.4 | adds | Pre-fight barrier also lets you initiate without melting |
| `high_max_hp` | — | 0.4 | relies | R8: barrier IS effective HP — scales with the base pool |
| `damage_sponge` | — | 0.4 | relies | R10: rewards heroes who absorb damage |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Restorative Locket
- **normalized_name**: `restorative_locket`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Restorative_Locket

### Interpretation
Stacking heal storage: take spirit damage to build up to 25 stacks (16 HP each = 400 HP at cap). Active releases as a burst heal + stamina restore (1-4 stamina depending on stacks), 35m cast range, 20s cd. Spirit-tank sustain item — turns incoming spirit damage into stored healing. Passive +10% spirit resist.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HealPerStack_Value` | 16 | 16 | ~16/stack | Per stack at cast time |
| `MaxStacks` | 25 | 25 | — | (cap = 400 HP max storage) |
| `MinStaminaRestore` | 1 | 1 | 1 | Per cast minimum |
| `MaxStaminaRestore` | 4 | 4 | 4 | Per cast at high stacks |
| `TechResist` | 10% | 10% | 10% | Passive |
| `AbilityCastRange` | 35 m | 35 m | — | (cast range — ally target) |
| `AbilityCooldown` | 20 | 20 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `burst_heal` | up to 400/cast | 1.5 | adds | Defines T2 burst-heal ceiling (Healing Rite T1 was 300/cast for context) |
| `continous_heal` | — | 0.5 | adds | R10 blend partner: the stack-building phase is a slow continuous conversion of damage into heal |
| `team_heal` | 400/cast at 35m | 1.5 | adds | Ally-targetable burst heal |
| `self_heal` | — | 1.0 | adds | Can self-cast for sustain |
| `assist_importance` | — | 1.0 | adds | R10: ally-targetable heal — directly supports teammate sustain |
| `spirit_resistance` | 10% | 0.5 | adds | Modest defensive layer |
| `vertical_mobility` | up to +4 stamina | 0.5 | adds | Stamina refund = mobility burst |
| `horizontal_mobility` | up to +4 stamina | 0.5 | adds | Same — stamina refund |
| `aerial` | — | 0.4 | adds | R9: stamina refund enables air-dashes / multi-jumps |
| `escape` | — | 0.5 | adds | R9: heal + stamina is a panic-button kit |
| `engage` | — | 0.3 | adds | R9: stamina also helps closing |
| `damage_sponge` | — | 0.8 | relies | Building stacks requires taking spirit damage |
| `spirit_resistance` | — | 0.5 | relies | Spirit damage feeds the kit — pays off vs spirit comps |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales with HP cushion |
| `counter_importance` | — | 0.8 | adds | R13: bought specifically vs spirit comps (the stack mechanic only fires on spirit damage taken) |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Return Fire
- **normalized_name**: `return_fire`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Return_Fire

### Interpretation
Active 6s damage reflect: 65% bullet damage + 25% spirit damage bounced back to attackers. 23s cd ≈ 26% uptime. Passive +10% bullet resist. Hard counter to focused-fire on the carrier; less useful against single-burst nukes.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletDamageReflectedPct` | 0 | 65% | ~17% | × 6/23 active uptime |
| `SpiritDamageReflectedPct` | 0 | 25% | ~6.5% | Same |
| `BulletResist` | 10% | 10% | 10% | Passive |
| `AbilityDuration` | 6 | 6 | — | (timing) |
| `AbilityCooldown` | 23 | 23 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | ~17% reflect | 0.7 | adds | Reflect damage isn't direct DPS but can punish focused fire |
| `gun_burst_damage` | — | 0.3 | adds | R2: reflect lift on burst windows |
| `gun_continuous_damage` | — | 0.2 | adds | R2: reflect lift on sustained-fire returns |
| `bullet_resistance` | 10% | 0.7 | adds | Sub-T2-baseline (Battle Vest 18% is T2 best) |
| `gun_burst_resistance` | — | 0.3 | adds | R2 analogue: bullet resist works on burst-shots incoming |
| `gun_continuous_resistance` | — | 0.3 | adds | Same for sustained-fire |
| `damage_sponge` | — | 1.0 | adds | Item rewards being focused — convert incoming bullets into outgoing |
| `damage_sponge` | — | 0.5 | relies | High HP heroes get more out of the reflect window |
| `counter_importance` | — | 1.2 | adds | R13: strong counter to bullet-DPS comps — bought specifically for this |
| `high_max_hp` | — | 0.4 | relies | R8: longer reflect uptime requires HP to survive being focused |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Spirit Lifesteal
- **normalized_name**: `spirit_lifesteal`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Lifesteal

### Interpretation
Pure passive +13% spirit lifesteal (vs heroes; 3% vs non-heroes), +6 SP, +70 HP. T2 best raw for `spirit_lifesteal`. Cross-tier ceiling = Infuser T4 70% (active) or Leech T4 25% (passive). Among passive spirit-lifesteal items it's the highest in T2.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityLifestealPercentHero` | 13% | 13% | 13% | Passive |
| `TechPower` | 6 | 6 | 6 | Passive |
| `BonusHealth` | 70 | 70 | 70 | Passive |
| `NonHeroAbilityLifestealTooltipOnly` | 3% | 3% | 3% | (vs non-heroes only) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_lifesteal` | 13% | 1.3 | adds | T2 best for spirit_lifesteal; passive curve toward Leech T4 25% |
| `self_heal` | passive | 0.8 | adds | Ability-driven sustain |
| `continous_heal` | — | 0.6 | adds | R10 cadence partner: spirit-driven sustain |
| `burst_heal` | — | 0.3 | adds | R10 blend partner: big ability hits convert to bigger heals |
| `spirit_damage` | 6 | 0.3 | adds | R1: was spirit_power — token SP |
| `high_max_hp` | 70 | 0.4 | adds | Modest HP (T2 HP best is Bullet Lifesteal 90) |
| `spirit_damage` | — | 0.8 | relies | Pays off massively for ability-heavy heroes |
| `high_max_hp` | — | 0.4 | relies | R8: lifesteal scales with HP cushion |
| `farmer` | — | 0.3 | adds | R10: ability-driven heal during jungle clears |
| `spirit_burst_damage` | — | 0.1 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.1 | adds | R3 floor propagation |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline (HP row above is the bigger anchor; this is duplicated but harmless) |

---

## Spirit Shielding
- **normalized_name**: `spirit_shielding`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Shielding

### Interpretation
Reactive defensive: taking 225+ spirit damage in a 3.5s window triggers a 300 HP barrier for 8s. 45s cd. Passive +2.5 OOC regen, +1.75 m/s move speed. Acts as anti-burst-spirit insurance — barrier auto-pops when the carrier is about to be deleted by ability damage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `OutOfCombatHealthRegen` | 2.5/sec | 2.5/sec | 0.75/sec | × 0.3 OOC uptime |
| `BonusMoveSpeed` | 1.75 m/s | 1.75 m/s | 1.75 m/s | Passive |
| `CombatBarrier_Value` | 0 | 300 HP | ~50 HP | × 8/45 amortized |
| `DamageThreshold` | 225 | 225 | — | (barrier trigger threshold) |
| `DamageWindow` | 3.5 | 3.5 | — | (trigger window) |
| `BarrierDuration` | 8 | 8 | — | (timing) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `burst_resistance` | 300 reactive | 1.0 | adds | Anti-burst-spirit barrier — fires in big-damage windows |
| `spirit_resistance` | 300/8s reactive | 1.0 | adds | Specifically guards against incoming spirit damage |
| `spirit_burst_resistance` | — | 0.8 | adds | R2 analogue: specifically catches incoming spirit burst |
| `horizontal_mobility` | 1.75 m/s | 1.1 | adds | Solid in-fight move speed; on curve toward Veil Walker 3.5 = 2.0 |
| `self_heal` | 0.75/sec | 0.3 | adds | Token OOC regen |
| `continous_heal` | 0.75/sec | 0.3 | adds | R10 cadence partner for OOC regen |
| `burst_heal` | 300 barrier | 0.6 | adds | R10: reactive barrier IS a burst-heal-equivalent |
| `escape` | — | 0.5 | adds | Move speed + reactive barrier helps disengage |
| `engage` | — | 0.3 | adds | Move speed + barrier also lets you initiate without being deleted |
| `counter_importance` | — | 1.0 | adds | R13: bought specifically vs burst-spirit comps |
| `farmer` | — | 0.3 | adds | R14: in-fight move speed helps jungle traversal |
| `high_max_hp` | — | 0.4 | relies | R8: barrier scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Trophy Collector
- **normalized_name**: `trophy_collector`
- **tier**: 2 (1600 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Trophy_Collector

### Interpretation
Stacking farm utility: passive +2 m/s sprint, +2 OOC regen. Per stack: +0.15 m/s sprint, +18 gold/min, +0.75% ability range/radius (cap 16 stacks). Penalty: -15% bullet damage vs non-heroes. Stacks come from hero kills/assists — a snowball item for carries already farming hero takedowns. At 16 stacks: +4.4 m/s sprint, +288 gold/min, +12% ability range/radius.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSprintSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `StackingBonusSprintSpeed` | 0 | 2.4 m/s | ~1.4 m/s | Avg at ~10 stacks late-game |
| `StackingGoldPerMinute` | 0 | 288/min | ~180/min | Avg ~10 stacks |
| `StackingTechRangeMultiplier` | 0 | 12% | ~7.5% | Avg ~10 stacks |
| `StackingTechRadiusMultiplier` | 0 | 12% | ~7.5% | Avg ~10 stacks |
| `NonPlayerBonusWeaponPower` | -15% | -15% | -15% | Passive DOWNSIDE vs non-heroes |
| `MaxStacks` | 16 | 16 | — | (cap) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `farmer` | up to 288/min | 1.5 | adds | T2 best for late-game farming tempo (gold/min scaling) |
| `horizontal_mobility` | up to 1.7 m/s sprint | 1.0 | adds | Sprint passive 2 m/s + stacks × 0.5 weight |
| `range_extender_dependant` | up to 12% | 0.6 | adds | Modest stacking range/radius |
| `high_kill_count` | — | 1.5 | relies | Stacks come from kills — pure snowball synergy |
| `scaling_late` | — | 1.0 | adds | Stacking item, weak early, strong late |
| `self_heal` | 0.6/sec | 0.3 | adds | Token OOC regen |
| `continous_heal` | 0.6/sec | 0.3 | adds | R10 cadence partner for OOC regen |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius boost helps multiple abilities |
| `escape` | — | 0.4 | adds | Sprint speed helps disengage |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Arcane Surge
- **normalized_name**: `arcane_surge`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Arcane_Surge

### Interpretation
Active 7s spirit-power burst: +20 SP, +12% range/radius, +1 stamina, +12% stamina regen, +15% ability duration. Burst-window setup for big ability rotations. The combined effect is a "spell power-up" — best when used right before a key combo. CD not in cache; assume ~30s → ~23% uptime. Per user feedback, +1 stamina also gets an `escape` row.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritPower` | 20 | 20 | ~4.7 | × 7/30 active uptime |
| `TechRangeMultiplierBuff` | 12% | 12% | ~2.8% | × 7/30 uptime |
| `TechRadiusMultiplierBuff` | 12% | 12% | ~2.8% | × 7/30 uptime |
| `Stamina` | +1 | +1 | +1 | Passive stamina charge |
| `StaminaCooldownReduction` | 12% | 12% | 12% | Passive (stamina regen) |
| `BonusAbilityDurationPercent` | 15% | 15% | ~3.5% | × 7/30 active uptime |
| `AbilityDuration` | 7 | 7 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | ~4.7 | 0.5 | adds | R1: was spirit_power — active SP burst, modest amortized |
| `spirit_burst_damage` | — | 1.0 | adds | R2/burst-window: item exists to enable a burst-window ability combo |
| `spirit_continuous_damage` | — | 0.25 | adds | R2: small lift on continuous spirit too |
| `range_extender_dependant` | ~2.8% | 0.3 | adds | Active range/radius burst |
| `duration_dependant` | ~3.5% | 0.3 | adds | Active duration burst |
| `horizontal_mobility` | +0.5 | 0.5 | adds | +1 stamina × 0.5 |
| `vertical_mobility` | +0.5 | 0.5 | adds | Same |
| `aerial` | — | 0.6 | adds | R9 stamina suite: stamina enables air-dashes / multi-jumps |
| `escape` | — | 0.5 | adds | R9: stamina-item panic-button mobility |
| `engage` | — | 0.5 | adds | R9: stamina also lets you "jump on" enemies + active burst window favors initiating |
| `single_ability_focus` | — | 0.5 | relies | Designed to boost one big combo cast |
| `multi_ability_focus` | — | 0.3 | adds | R4: general SP+range+duration boost helps multiple abilities |
| `farmer` | — | 0.3 | adds | R14: extra stamina helps jungle traversal |

---

## Bullet Resist Shredder
- **normalized_name**: `bullet_resist_shredder`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Bullet_Resist_Shredder

### Interpretation
Spirit→bullet hybrid enabler: deal spirit damage to an enemy and they take -10 bullet resist for 8s. Passive +65 HP, +8% bullet resist on the carrier. Bridges spirit-cast and gun-DPS — cast an ability to set up a follow-up gun window. Cross-tier 2.0 for `bullet_resist_shred` is Crippling Headshot T4 -16.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` | -10 | -10 | ~-10 | High uptime when actively casting on heroes |
| `BonusHealth` | 65 | 65 | 65 | Passive |
| `BulletResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 8 | 8 | — | (debuff linger) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resist_shred` | -10 | 1.0 | adds | T2 best alongside Weakening Headshot; on curve toward Crippling -16 = 2.0 |
| `hybrid_damage_usage` | — | 1.5 | adds | Designed for spirit→bullet hybrid playstyle |
| `bullet_resistance` | 8% | 0.5 | adds | Token defensive |
| `high_max_hp` | 65 | 0.4 | adds | Modest T2 HP |
| `spirit_damage` | — | 0.8 | relies | Requires landing spirit damage to proc — synergy with spirit casters |
| `spirit_burst_proc` | per-cast | 0.6 | adds | R5: per-ability-hit proc — burst-leaning since it requires a cast |
| `spirit_continuous_proc` | — | 0.4 | adds | R5: 8s linger means decent continuous-proc value when casting frequently |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Compress Cooldown
- **normalized_name**: `compress_cooldown`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Compress_Cooldown

### Interpretation
Pure passive +18% cooldown reduction. T2 ceiling for raw CDR. On the curve: Superior Cooldown T3 20%, Transcendent Cooldown T4 25% = 2.0.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 18% | 18% | 18% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cooldown_reduction` | 18% | 1.3 | adds | T2 ceiling; on curve toward Transcendent 25% = 2.0 |
| `ability_spam` | — | 1.0 | adds | Lower cooldowns = more casts per fight |
| `multi_ability_focus` | — | 0.3 | adds | R4: CDR helps kits with multiple ability slots — but Compress Cooldown is imbued so the multi-ability lift is modest |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued item — player attaches the CDR to one selected ability, making this fundamentally a single-ability item |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Duration Extender
- **normalized_name**: `duration_extender`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Duration_Extender

### Interpretation
Pure passive +22% ability duration. T2 ceiling for `duration_dependant`. On curve toward Superior Duration T3 28% = 2.0. Pays off massively on heroes with duration-based abilities (Dynamo singularity, Pocket ult, McGinnis turrets) — useless on instant-cast kits.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityDurationPercent` | 22% | 22% | 22% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `duration_dependant` | 22% | 1.5 | adds | T2 ceiling; on curve toward Superior Duration 28% = 2.0 |
| `duration_dependant` | — | 1.5 | relies | Pure synergy item — only pays off for duration-ability heroes |
| `ult_focused` | — | 0.5 | adds | Long-duration ults benefit most |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued item — attaches to one chosen ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Improved Spirit
- **normalized_name**: `improved_spirit`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Improved_Spirit

### Interpretation
T2 SP all-rounder: +18 SP, +1 m/s sprint, +75 HP, +1.5 OOC regen. The 18 SP is the T2 ceiling on the curve toward Diviners Kevlar T4 +35 = 2.0. Solid generalist for spirit-focused builds.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 18 | 18 | 18 | Passive |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `OutOfCombatHealthRegen` | 1.5/sec | 1.5/sec | 0.45/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 18 | 1.3 | adds | R1: was spirit_power — T2 best raw SP; on curve toward Diviners 35 = 2.0 |
| `spirit_burst_damage` | — | 0.6 | adds | R2: general SP propagation (≈0.5 × 1.3) |
| `spirit_continuous_damage` | — | 0.6 | adds | R2: general SP propagation |
| `high_max_hp` | 75 | 0.4 | adds | Modest HP |
| `horizontal_mobility` | 0.5 m/s | 0.2 | adds | 1 m/s sprint × 0.5 weight |
| `self_heal` | 0.45/sec | 0.2 | adds | Token OOC regen |
| `continous_heal` | 0.45/sec | 0.2 | adds | R10 cadence partner for OOC regen |
| `multi_ability_focus` | — | 0.5 | adds | R4: general SP buffs the whole kit |
| `single_ability_focus` | — | -0.2 | adds | R4: helps less if narrowed to one ability |

---

## Mystic Vulnerability
- **normalized_name**: `mystic_vulnerability`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Vulnerability

### Interpretation
Spirit-damage-triggered spirit resist shred: cast an ability on a hero, they take -8 spirit armor for 7s. Passive +8% spirit resist on carrier. The spirit-side mirror to Spirit Shredder Bullets — same shred value but driven by ability damage instead of bullets. T2 ceiling for `spirit_resist_shred`; cross-tier 2.0 = Crippling Headshot T4 -16.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechArmorDamageReduction` | -8 | -8 | ~-8 | High uptime when actively casting |
| `TechResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 7 | 7 | — | (debuff linger) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resist_shred` | -8 | 1.0 | adds | T2 best alongside Spirit Sap -9; on curve toward Crippling -16 = 2.0 |
| `spirit_resistance` | 8% | 0.5 | adds | Token defensive |
| `spirit_damage` | — | 0.5 | relies | Requires casting abilities to proc |
| `spirit_burst_proc` | per-cast | 0.8 | adds | R5: procs on each ability hit — burst-leaning since it's per-cast |
| `spirit_continuous_proc` | — | 0.5 | adds | R5: 7s linger gives meaningful continuous-proc value when casting often |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Quicksilver Reload
- **normalized_name**: `quicksilver_reload`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Quicksilver_Reload

### Interpretation
Active hybrid: instant 100% ammo reload + 44 spirit burst + +10% fire rate for 12s, all on 18s cd. ~67% uptime on the fire-rate buff. Defines the bullet/spirit hybrid niche at T2 alongside Mystic Shot — pop active to refresh mag AND scale outgoing DPS for a sustained-fire window.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AmmoReloadPercent` | 0 | 100% | per cast | One free reload per 18s |
| `BonusFireRate` | 0 | 10% | ~6.7% | × 12/18 active uptime |
| `Damage_Value` | 0 | 44 | ~2.4/sec | 44 / 18s amortized |
| `BuffDuration` | 12 | 12 | — | (buff window) |
| `AbilityCooldown` | 18 | 18 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `magazine_size_dependant` | free reload/18s | 0.7 | adds | Effectively extra ammo via reload — modest T2 value |
| `fire_rate` | ~6.7% | 0.5 | adds | Below baseline 9% T1 Rapid; but combined with reload it's solid |
| `spirit_damage` | 44/cast | 0.4 | adds | Item literally deals spirit damage on cast (R6) |
| `spirit_burst_damage` | 44/cast | 0.5 | adds | Modest spirit burst on cast |
| `spirit_continuous_damage` | — | 0.15 | adds | R3 floor propagation |
| `hybrid_damage_usage` | — | 1.5 | adds | Pure bullet/spirit hybrid item |
| `gun_continuous_damage` | — | 0.4 | adds | R2: fire-rate propagation (0.5 × 0.5 fire_rate + active reload window) |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire-rate light burst propagation |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Slowing Hex
- **normalized_name**: `slowing_hex`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Slowing_Hex

### Interpretation
Active single-target slow: target an enemy at 25m, apply -20% MS + -30% dash reduction for 3.5s. 27s cd. Passive +0.5 m/s sprint. Reliable mid-range kite/slow tool — long cd means it's a strategic press, not spam.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SlowPercent` | 0 | 20% | ~0.5% | × 0.2 single-target × 3.5/27 uptime |
| `GroundDashReductionPercent` | 0 | -30% | ~-0.8% | Same |
| `BonusSprintSpeed` | 0.5 m/s | 0.5 m/s | 0.5 m/s | Passive |
| `AbilityDuration` | 3.5 | 3.5 | — | (timing) |
| `AbilityCooldown` | 27 | 27 | — | (timing) |
| `AbilityCastRange` | 25 m | 25 m | — | (cast range) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `movement_slow` | 20% × 3.5s | 0.7 | adds | Reliable targeted slow; sub-Slowing Bullets 30% |
| `single_target` | — | 1.0 | adds | Single-target press item |
| `disarm` | — | 0.3 | adds | Dash reduction soft-locks enemy mobility |
| `counter_importance` | — | 1.0 | adds | R13: targeted shutdown — bought specifically vs mobile heroes |
| `horizontal_mobility` | 0.25 m/s | 0.1 | adds | 0.5 sprint × 0.5 weight |
| `engage` | — | 0.3 | adds | Slow + dash reduction helps catch fleeing targets |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued item — attaches to one chosen ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

---

## Suppressor
- **normalized_name**: `suppressor`
- **tier**: 2 (1600 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Suppressor

### Interpretation
Spirit-damage-triggered fire-rate slow: cast an ability on an enemy hero, they take -28% fire rate for 5s. Passive +6 SP, +8% bullet resist. T2 best `fire_rate_slow` debuff (raw value beats Hunters Aura T3 14% — Hunters Aura is an aura with broader reach though). Cross-tier 2.0 is Juggernaut T4 36% passive aura.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `FireRateSlow` | 0 | -28% | ~-28% | High uptime when actively casting on heroes |
| `TechPower` | 6 | 6 | 6 | Passive |
| `BulletResist` | 8% | 8% | 8% | Passive |
| `AbilityDuration` | 5 | 5 | — | (debuff linger) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate_slow` | -28% | 1.3 | adds | T2 best raw value; on curve toward Juggernaut 36% = 2.0 |
| `disarm` | — | 0.8 | adds | -28% fire rate is a meaningful soft disarm |
| `spirit_damage` | 6 | 0.3 | adds | R1: was spirit_power — token SP |
| `bullet_resistance` | 8% | 0.4 | adds | Token defensive |
| `spirit_damage` | — | 0.5 | relies | Requires landing spirit damage to proc |
| `counter_importance` | — | 1.3 | adds | R13: strong counter to gun-DPS comps |
| `spirit_burst_proc` | per-cast | 0.6 | adds | R5: per-ability-hit proc — burst-leaning since requires a cast |
| `spirit_continuous_proc` | — | 0.3 | adds | R5: 5s linger means modest continuous-proc value |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to one chosen ability |
| `spirit_burst_damage` | — | 0.1 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.1 | adds | R3 floor propagation |

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
| `gun_burst_damage` | — | 0.5 | adds | R2: per-shot damage propagation (0.5 × 1.0) |
| `gun_continuous_damage` | — | 0.3 | adds | R2: per-shot damage propagation (0.3 × 1.0) |
| `charge_dependant` | 1 charge / 24s | 1.5 | adds | T2 ceiling for charge supply; the entire mechanic refills a charge per cycle |
| `ability_spam` | — | 0.5 | adds | Extra charges = more casts per fight; gated to charge-using heroes |
| `hybrid_damage_usage` | — | 1.0 | adds | Mechanic literally requires shooting to fuel abilities |
| `magazine_size_dependant` | — | 0.3 | relies | The "shoot a lot to refund" loop rewards heroes with bigger clips |
| `single_ability_focus` | — | 0.5 | adds | R4: charge-refunding favors heroes with 1-2 charged abilities (per user logic for Extra Charge) |
| `cooldown_reduction` | — | 0.4 | adds | Charge refund functions like CDR for charge-based abilities |

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
| `aerial` | — | 0.7 | adds | R9: stamina + dash-jump buff IS aerial-focused — dash-jumping into a fight is the whole mechanic |
| `escape` | — | 0.4 | adds | R9: stamina charge for panic-button mobility |
| `engage` | — | 0.6 | adds | R9 + user note: dash-jump-into-fight is engagement-focused (per existing "Correction" note in item) |
| `gun_continuous_damage` | — | 0.4 | adds | R2: fire-rate propagation during the buff window |
| `gun_burst_damage` | — | 0.15 | adds | R2: light burst propagation |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
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
| `spirit_damage` | ~14 DPS | 0.6 | adds | R6: item literally deals spirit damage — encode it |
| `spirit_continuous_damage` | ~14 DPS | 1.0 | adds | Average Good Situation DPS — the wound DoT, sustained against the marked target |
| `spirit_burst_damage` | — | 0.2 | adds | R3 floor + small burst on initial wound application |
| `gun_continuous_proc` | TTP ~0.2s | 1.2 | adds | R5: per-bullet wound trigger — high frequency but small per-bullet effect (per user proc note) |
| `gun_burst_proc` | — | 0.4 | adds | R5: still procs each shot — modest burst flavor since the wound itself is the durable proc |
| `bullet_resist_shred` | -5 | 0.5 | adds | -6 × (5/6) duration uptime; single-target |
| `horizontal_mobility` | +1.25 m/s | 0.7 | adds | Move speed bonus when an enemy is wounded |
| `close_range` | — | 1.0 | adds | R11: 8m proc radius forces close engagement |
| `engage` | — | 1.0 | adds | R11: stealth + wallhack reveal = strong initiation tool |
| `grounded` | — | 0.4 | adds | R7: close-range mechanic only realized while grounded |
| `assist_importance` | — | 0.4 | adds | Wallhack reveal helps the team — but per user note this is mostly a self-benefit so scored modestly |
| `hybrid_damage_usage` | — | 0.5 | adds | Gun damage triggers a spirit DoT — modest gun↔spirit synergy |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `continous_heal` | 0.75/sec | 0.3 | adds | R10 cadence partner for OOC regen |
| `burst_heal` | 300 barrier | 0.7 | adds | R10: reactive barrier IS a burst-heal-equivalent on trigger |
| `shield` | 300 HP / 35s | 1.0 | adds | One barrier per ~major fight; T2 ceiling for reactive shield |
| `bullet_resistance` | ~10% | 0.8 | adds | Per user correction — barrier triggered by weapon dmg counts as `bullet_resistance` (~300 HP / ~3000 HP fight pool ≈ 10% mitigation) |
| `gun_burst_resistance` | — | 0.9 | adds | User correction: this is literally `bullet_burst_resistance` flavored — barrier triggers on burst gun damage |
| `gun_continuous_resistance` | — | 0.4 | adds | User correction: also some continuous lift, but trigger is burst-focused |
| `burst_resistance` | ~12% | 1.0 | adds | Specifically triggers on burst (250 in 4s) so weighted higher vs. burst damage profile |
| `damage_sponge` | — | 0.7 | adds | Passive barrier soaks one burst per fight |
| `damage_sponge` | — | 0.4 | relies | R10: rewards heroes who absorb damage |
| `escape` | — | 0.5 | adds | User correction: barrier + move speed is a classic disengage combo |
| `counter_importance` | — | 1.0 | adds | R13: bought specifically vs gun-burst comps |
| `high_max_hp` | — | 0.4 | relies | R8: barrier scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `spirit_damage` | ~12 DPS | 0.6 | adds | R6: item literally deals spirit damage on cast — encode the damage row |
| `spirit_burst_damage` | ~12 DPS | 0.8 | adds | Avg Good Situation DPS — 95 burst × 3 enemies hit / 25s cd ≈ 11-13 DPS team-wide |
| `spirit_continuous_damage` | — | 0.2 | adds | R3/R2 floor — burst-flavored item; small continuous lift |
| `movement_slow` | 9.6% | 1.0 | adds | 60% × (4/25) sustained team slow |
| `aoe_cluster` | 60% | 1.0 | adds | 12m end radius typically catches 3 of 5 enemies in a teamfight |
| `spirit_damage` | — | 0.5 | relies | Damage scales 0.47× SP — modest reliance |
| `engage` | — | 1.0 | adds | Slow + AoE = solid fight initiator |
| `trap_block_obstruct` | ~8 | 1.0 | adds | Effective time × heroes — 4s slow × ~2 heroes ≈ 8 hero-seconds per cast |
| `close_to_team` | — | 0.3 | adds | Slow lets team capitalize — but per user correction, scored lower than 0.5 |
| `assist_importance` | — | 0.5 | adds | R10/R13: AoE slow helps the team collapse on slowed targets |

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
| `spirit_continuous_proc` | refresh-on-cast | 1.2 | adds | R5 (per user correction): short 2s duration means the proc must be refreshed often — continuous-proc is heavier here |
| `spirit_burst_proc` | TTP ~2s | 0.5 | adds | R5: small burst-proc flavor on each cast, but slow duration is brief so the burst component is light |
| `spirit_damage` | — | 0.3 | relies | Slow doesn't scale with SP, but proc cadence is dictated by ability casts |
| `close_to_team` | — | 0.3 | adds | Slow lets teammates capitalize on slowed targets |
| `assist_importance` | — | 0.4 | adds | R13: slow helps team collapse on targets (scored modest per user note) |
| `counter_importance` | — | 0.5 | adds | R13: useful vs mobile heroes specifically |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |

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
| `spirit_damage` | ~37 DPS | 0.7 | adds | R6: item literally deals spirit damage — encode it |
| `spirit_continuous_damage` | ~37 DPS | 1.2 | adds | Avg Good Situation DPS — 70 mid-DPS over 5s window / 30s cd; fight-relevance averaged |
| `spirit_burst_damage` | — | 0.3 | adds | R3/R2 floor — DoT but has some burst component when enemy first enters pool |
| `spirit_damage` | 10 | 0.4 | adds | R1: was spirit_power — flat passive SP, small for T3 |
| `spirit_damage` | +5 | 0.5 | relies | DoT scales with carrier's SP; rewards SP-heavy builds (extra synergy ≈ 0.5× the flat passive) |
| `bullet_resist_shred` | -2 | 0.2 | adds | -7 × (5/30) × 0.2 single-target ≈ very minor; only enemies in the pool |
| `aoe_cluster` | ~50% | 0.8 | adds | 10m radius pool; in a teamfight ~2-3 of 5 enemies pass through |
| `trap_block_obstruct` | ~10 | 1.0 | adds | 5s zone × ~2 hero-seconds of effective denial per cast |
| `hybrid_damage_usage` | — | 0.3 | adds | Spirit damage item that rewards SP investment |
| `range_extender_dependant` | — | 0.4 | relies | Per user correction: the 10m pool benefits from range/radius extenders |
| `duration_dependant` | — | 0.3 | relies | Per user correction: 5s duration benefits from duration items |
| `cooldown_reduction` | — | 0.3 | relies | Per user correction: 30s cd benefits from CDR |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `gun_burst_damage` | — | 0.75 | adds | R2: per-shot damage propagation (0.5 × 1.5) |
| `gun_continuous_damage` | — | 0.45 | adds | R2: per-shot damage propagation (0.3 × 1.5) |
| `bullet_resistance` | 8% | 0.6 | adds | Passive, modest for T3 |
| `gun_burst_resistance` | — | 0.3 | adds | R2 analogue: bullet resist works on incoming burst gun damage |
| `gun_continuous_resistance` | — | 0.3 | adds | Same for sustained-fire |
| `high_max_hp` | — | 1.0 | relies | Stack gain requires absorbing 120 damage per stack — bigger HP pool = more stacks ramped before dying |
| `damage_sponge` | — | 1.0 | relies | Same logic — item rewards high-EHP / mitigation builds that can soak damage to fuel stacks |
| `self_heal` | — | 0.5 | relies | Sustain helps you stay alive long enough to keep stacks refreshing |
| `close_range` | — | 0.4 | adds | R11: brawler stack-builder works best at close range where you absorb damage |
| `engage` | — | 0.4 | adds | R11: pre-stacked, becomes a strong initiator |
| `grounded` | — | 0.4 | adds | R7: bruiser brawling is grounded |
| `melee_damage` | — | 0.4 | adds | R12: brawler-flavored item — melee damage is part of the playstyle |
| `scaling_late` | — | 0.5 | adds | Stack ramp favors longer engagements |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `gun_continuous_damage` | — | 0.75 | adds | R2: fire-rate heavy propagation (0.5 × 1.5) |
| `gun_burst_damage` | — | 0.3 | adds | R2: fire-rate light burst propagation |
| `high_max_hp` | -37 HP/sec | -1.0 | adds | Self-damage drain; significant downside encoded as negative `high_max_hp` (candidate `self_damage` tag once added) |
| `spirit_resistance` | 8% | 0.6 | adds | Passive, modest for T3 |
| `debuff_resistance` | 35% | 1.5 | adds | Best-for-T3 debuff resistance |
| `cc_resist` | 35% | 1.5 | adds | Status resist directly cuts CC duration |
| `horizontal_mobility` | 2 m/s | 1.0 | adds | Move speed (not sprint), full weight — great for T3 |
| `self_heal` | 1.2/sec | 0.4 | adds | OOC regen × 0.3 uptime |
| `continous_heal` | 1.2/sec | 0.4 | adds | R10 cadence partner for OOC regen |
| `self_heal` | — | 1.0 | relies | Self-damage drain rewards heroes with strong self-heal to offset — pairs well with sustain abilities |
| `damage_sponge` | — | 0.5 | relies | Big HP pools tolerate the drain better than squishies |
| `high_max_hp` | — | 0.5 | relies | R8: HP pool tolerates the drain |
| `escape` | — | 0.4 | adds | Move speed + status resist helps disengage |
| `engage` | — | 0.5 | adds | Move speed + fire rate spike favors initiating |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `gun_burst_damage` | — | 0.65 | adds | R2: per-shot damage propagation (0.5 × 1.3) |
| `gun_continuous_damage` | — | 0.4 | adds | R2: per-shot damage propagation (0.3 × 1.3) |
| `bullet_resist_shred` | -7 | 1.0 | adds | -9 × 0.75 carrier-side uptime; lingers 8s on the engaged target |
| `high_max_hp` | 125 | 1.2 | adds | T3 baseline HP — and the +125 helps satisfy the 65%-HP gate longer |
| `self_heal` | 1.35/sec | 0.4 | adds | 4.5/sec × 0.3 OOC uptime |
| `continous_heal` | 1.35/sec | 0.4 | adds | R10 cadence partner for OOC regen |
| `self_heal` | — | 0.5 | relies | Sustain keeps the carrier above 65% HP longer (lengthens bonus window) |
| `high_max_hp` | — | 0.5 | relies | More base HP → more absolute HP above the 65% threshold → longer bonus window |
| `gun_burst_proc` | per-hit | 0.4 | adds | R5: per-shot bullet-resist proc — small burst flavor |
| `gun_continuous_proc` | — | 0.6 | adds | R5: per-shot, refreshes with each bullet — continuous-leaning |

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
| `gun_burst_resistance` | — | 0.6 | adds | R2 analogue: bullet resist on burst incoming |
| `gun_continuous_resistance` | — | 0.6 | adds | R2 analogue: bullet resist on sustained-fire incoming |
| `fire_rate` | 8.3% | 0.7 | adds | 26% × (7/22) active uptime; applies to self + allies |
| `gun_continuous_damage` | — | 0.35 | adds | R2: fire-rate propagation |
| `gun_burst_damage` | — | 0.15 | adds | R2: light burst propagation |
| `horizontal_mobility` | +0.72 m/s | 0.5 | adds | 2.25 × (7/22) active uptime |
| `ally_buff` | — | 1.5 | adds | Multi-ally bullet-resist aura is the headline value driver |
| `close_to_team` | — | 1.5 | adds | Item only pays out when allies are within 30m |
| `assist_importance` | — | 1.2 | adds | R10: aura buffs allies — strong team-glue |
| `engage` | — | 1.0 | adds | Active is a clear team-fight initiator |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |
| `farmer` | — | 0.3 | adds | R14: sprint speed helps jungle traversal |

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
| `spirit_damage` | ~80 DPS | 1.0 | adds | R6: item literally deals spirit damage on bullet proc |
| `spirit_burst_damage` | ~80 DPS | 1.5 | adds | Avg Good Situation DPS — 33 × ~3 chains hit × ~0.75 procs/sec ≈ 75-85 DPS in clustered fight |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: continuous bullet proc also lifts sustained spirit DPS |
| `gun_continuous_proc` | TTP ~1.3s | 1.5 | adds | R5: high-frequency bullet-triggered proc — continuous-leaning |
| `gun_burst_proc` | — | 0.7 | adds | R5: still procs per bullet — burst flavor is real but secondary |
| `spirit_burst_proc` | — | 1.0 | adds | R5: each chain hit IS a small spirit burst |
| `spirit_continuous_proc` | — | 0.8 | adds | R5: continuous flavor of the same proc |
| `bullet_proc` | — | 1.5 | adds | Headline T3 bullet-proc item |
| `aoe_cluster` | ~70% | 1.5 | adds | Chains to 4 → 80% team coverage in a stacked fight |
| `spirit_damage` | — | 1.0 | relies | Chain damage scales 0.19× SP per hop × 4 hops = 0.76× total scaling — meaningful SP synergy |
| `hybrid_damage_usage` | — | 1.5 | adds | Textbook item rewarding mixed gun + SP builds |
| `close_to_team` | — | 0.5 | adds | Chain radius rewards enemies being clustered (contested objectives) |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `self_heal` | — | 0.7 | adds | R10: lifesteal during the active is meaningful sustain |
| `continous_heal` | — | 0.5 | adds | R10 cadence partner: lifesteal scales over time |
| `burst_heal` | — | 0.3 | adds | R10 blend partner |
| `fire_rate` | 10% | 0.7 | adds | 30% × (6/18) active uptime |
| `gun_continuous_damage` | — | 0.35 | adds | R2: fire-rate propagation |
| `gun_burst_damage` | — | 0.15 | adds | R2: light burst propagation |
| `spirit_resistance` | 13% | 1.0 | adds | 40% × (6/18) effective % reduction; great for T3 active |
| `spirit_burst_resistance` | — | 0.5 | adds | R2 analogue: spirit resist on burst incoming |
| `spirit_continuous_resistance` | — | 0.5 | adds | R2 analogue: spirit resist on continuous incoming |
| `damage_sponge` | — | 0.5 | adds | Lifesteal + spirit resist windows soak burst |
| `escape` | — | -0.5 | adds | NEGATIVE — silence + stamina lock during active actively prevents escape |
| `ability_spam` | — | -0.5 | adds | NEGATIVE — silenced for active window, hostile to ability-spam builds |
| `single_ability_focus` | — | 0.3 | relies | Best on heroes who can commit to gun-only output during the active (don't need their abilities to fight) |
| `engage` | — | 0.5 | adds | Pop pre-fight, commit to brawling — engagement-focused |
| `high_max_hp` | — | 0.4 | relies | R8: lifesteal scales with HP cushion |
| `counter_importance` | — | 0.6 | adds | R13: spirit resist active works as a counter pick vs burst-spirit |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `continous_heal` | — | 0.3 | adds | R10 blend partner |
| `team_heal` | 160 HP / 60s | 1.5 | adds | Big single-target ally heal; save-an-ally use spikes value well above the raw |
| `self_heal` | ~160 HP / 60s | 1.0 | adds | Caster heals at full value via SelfModifier=100 |
| `displace` | — | 1.5 | adds | Pull mechanic literally displaces an ally |
| `escape` | — | 1.0 | adds | Pulling a dying ally out of bad position = save tool |
| `engage` | — | 0.5 | adds | Can pull a diver ally into reinforcement range |
| `assist_importance` | — | 1.5 | adds | R10: Entire item is about enabling allies, not self kills |
| `ally_buff` | — | 1.0 | adds | Heal + displace = strong ally support |
| `close_to_team` | — | 1.0 | adds | Only useful with allies in 35m range |
| `escape` | — | -0.5 | adds | NEGATIVE during the 2.5s channel — caster is locked and exposed |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales with HP cushion |
| `farmer` | — | 0.3 | adds | R10/R14: heal offsets jungle damage; range helps traversal |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `aerial` | — | 0.4 | adds | R9-adjacent: blink can clear vertical obstacles / get airborne briefly |
| `escape` | — | 1.5 | adds | Best-in-tier escape — instant repositioning with built-in bullet resist landing |
| `engage` | — | 1.0 | adds | Same blink works as offensive gap-close |
| `bullet_resistance` | 11% | 1.0 | adds | 30% × (6/16) sustained uptime — meaningful when used in engagements |
| `gun_burst_resistance` | — | 0.5 | adds | R2 analogue |
| `gun_continuous_resistance` | — | 0.5 | adds | R2 analogue |
| `cc_resist` | — | 0.5 | adds | Per user correction — mobility helps avoid getting CC'd in the first place |
| `range_extender_dependant` | — | 0.3 | relies | Per user correction — blink range benefits from range items |
| `cooldown_reduction` | — | 0.4 | relies | Per user correction — 16s cd benefits from CDR |
| `farmer` | — | 0.4 | adds | R14: blink helps jungle traversal between camps |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `spirit_burst_resistance` | — | 0.4 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.4 | adds | R2 analogue |
| `cc_resist` | — | 1.5 | adds | Full dispel of non-ult debuffs — strongest cc_resist effect at T3 |
| `debuff_resistance` | — | 1.2 | adds | Cleansing IS effective debuff resistance for the moments it matters |
| `burst_heal` | 250 HP | 1.0 | adds | Effective Total Healing per cast |
| `continous_heal` | — | 0.3 | adds | R10 blend partner |
| `self_heal` | 250 HP / 40s | 1.0 | adds | Same burst, framed per-cooldown |
| `horizontal_mobility` | +0.15 m/s | 0.1 | adds | 2 × (3/40) sustained — minor |
| `counter_importance` | — | 1.5 | adds | R13: direct counter to silence/stun/disarm comps |
| `escape` | — | 1.0 | adds | Cleanse + heal + speed = strong panic-out button |
| `high_max_hp` | — | 0.3 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

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
| `self_heal` | ~6 HP/sec | 1.2 | adds | Strong dual-trigger sustain |
| `continous_heal` | ~6 HP/sec | 1.0 | adds | Effective Healing/Second — 4/sec base regen with 1-2 stacks active in a fight |
| `burst_heal` | ~70 HP / 6s | 1.0 | adds | Effective Total Healing per ability cast |
| `spirit_damage` | — | 0.5 | relies | R1: was spirit_power — regen scales 0.04× SP, so SP-heavy builds amplify the continuous heal |
| `spirit_lifesteal` | — | 0.7 | adds | R15: spirit-damage-triggered regen IS a spirit_lifesteal mechanic (same as Mystic Regeneration parent item) |
| `spirit_burst_proc` | per-cast | 0.5 | adds | R5: ability-cast trigger — burst-leaning |
| `spirit_continuous_proc` | — | 0.7 | adds | R5: 6s linger means continuous-proc is heavier (per spirit Strike pattern) |
| `horizontal_mobility` | +0.87 m/s | 0.6 | adds | 1.75 × (3/6) sustained when casting on cooldown |
| `ability_spam` | — | 0.5 | relies | Heal triggers on cast — frequent casters extract more value |
| `multi_ability_focus` | — | 0.5 | adds | R4: any ability cast triggers; not gated to one slot |
| `single_ability_focus` | — | -0.15 | adds | R4: helps less if narrowed to one ability |
| `damage_sponge` | — | 0.5 | adds | Two heal triggers = better effective HP through sustain |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion |
| `farmer` | — | 0.4 | adds | R10: ability-driven heal offsets jungle damage |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor propagation |
| `escape` | — | 0.4 | adds | Move speed + heal on cast = mini panic button |

---

## Ballistic Enchantment
- **normalized_name**: `ballistic_enchantment`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Ballistic_Enchantment

### Interpretation
Active 14s buff: stacks weapon damage from hero hits (high per-stack), non-hero hits also stack (small per-stack) up to 8. +20% ability range/radius during the active. Per-stack ramp damage during the buff window — rewards sustained fire in fights.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `WeaponPowerPerStack` | 0 | 20% per stack | ~20% avg | Stacks rapidly during active fire windows |
| `WeaponPowerPerStackNonHero` | 0 | 5% per stack | ~20% (8 × 5%) | Non-hero stacks fully load over the 14s |
| `NonHeroStackLimit` | 8 | 8 | — | (cap) |
| `TechRangeMultiplier` | 20% | 20% | ~10% | × 0.5 active uptime (assume 30s effective cd) |
| `TechRadiusMultiplier` | 20% | 20% | ~10% | Same |
| `AbilityDuration` | 14 | 14 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | ~20% during active | 1.3 | adds | Strong active-window damage scaler |
| `gun_continuous_damage` | — | 1.5 | adds | R2: designed for sustained-fire stacking (ramp damage) |
| `gun_burst_damage` | — | 0.65 | adds | R2: per-shot damage propagation (0.5 × 1.3) |
| `range_extender_dependant` | ~10% | 0.5 | adds | Sub-Greater Expansion T3 ceiling |
| `magazine_size_dependant` | — | 0.8 | relies | Bigger mags extend the active stacking window |
| `farmer` | — | 0.5 | adds | Non-hero stacks help farm efficiency |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius helps multiple abilities |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches the buff to a chosen ability cast |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Burst Fire
- **normalized_name**: `burst_fire`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Burst_Fire

### Interpretation
+10% fire rate passive plus a 4.5s active: +32% fire rate, +1.25 m/s MS. 9s cd → 50% active uptime. Effective fire-rate ≈ 26% averaged. The high active uptime makes this a near-permanent fire-rate boost during fights.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 10% | 10% | 10% | Passive |
| `ActivatedFireRate` | 0 | 32% | 16% | × 0.5 active uptime |
| `BonusMoveSpeed` | 0 | 1.25 m/s | 0.63 m/s | × 0.5 active uptime |
| `SlideScale` | 50% | 50% | — | (slide reach buff during active) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate` | 10% + ~16% = ~26% | 1.5 | adds | T3 ceiling alongside Blood Tribute 35%; high active uptime |
| `gun_continuous_damage` | — | 0.75 | adds | R2: fire-rate heavy propagation (0.5 × 1.5) |
| `gun_burst_damage` | — | 0.3 | adds | R2: fire-rate light burst propagation |
| `horizontal_mobility` | 0.31 m/s | 0.2 | adds | 0.63 active move × 0.5 weight |
| `engage` | — | 0.4 | adds | Active fire-rate burst rewards initiating |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Cultist Sacrifice
- **normalized_name**: `cultist_sacrifice`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Cultist_Sacrifice

### Interpretation
Hybrid farm/utility stat stick: passive +50 HP, +8% bullet damage, +1 ability charge, +12% range/radius, +30% bullet damage vs creeps, +30% bullet resist vs creeps, +2 OOC regen. Active sacrifice (270s cd) grants +170% souls bonus for 160s. Strong farm-tempo + ability-charge package — does many things at once.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSoulsPct` | 170% | 170% | ~100% during active | × 160/270 amortized into farm windows |
| `NonPlayerBonusWeaponPower` | 30% | 30% | 30% | Passive vs. non-heroes |
| `NonPlayerBulletResist` | 30% | 30% | 30% | Passive vs. non-heroes |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `BonusHealth_Value` | 50 | 50 | 50 | Passive |
| `BaseAttackDamagePercent_Value` | 8% | 8% | 8% | Passive |
| `BonusAbilityCharges` | +1 | +1 | +1 | Passive |
| `TechRangeMultiplier` | 12% | 12% | 12% | Passive |
| `TechRadiusMultiplier` | 12% | 12% | 12% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `farmer` | +170% souls + creep buffs | 1.5 | adds | T3 best farming tempo via souls bonus |
| `charge_dependant` | +1 | 1.0 | adds | Charge bonus solid for T3 |
| `range_extender_dependant` | 12% | 0.7 | adds | Modest passive range/radius |
| `bullet_damage` | 8% | 0.4 | adds | Token T3 weapon damage |
| `gun_burst_damage` | — | 0.2 | adds | R2: per-shot damage light propagation |
| `gun_continuous_damage` | — | 0.15 | adds | R2: per-shot damage light propagation |
| `high_max_hp` | 50 | 0.2 | adds | Sub-baseline T3 HP |
| `single_ability_focus` | — | 0.4 | adds | R4: charge bonus narrows to charge-using abilities |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius helps multiple abilities |
| `scaling_early` | — | 0.6 | adds | Farm-tempo item — early game where farm matters most |
| `self_heal` | 0.6/sec | 0.3 | adds | Token OOC regen |
| `continous_heal` | 0.6/sec | 0.3 | adds | R10 cadence partner for OOC regen |

---

## Escalating Resilience
- **normalized_name**: `escalating_resilience`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Escalating_Resilience

### Interpretation
Per-stack bullet resist scaler: shooting heroes builds stacks (each = +2% bullet resist), cap 30 stacks for 60% bullet resist max. 24s per-stack duration so stacks decay if you stop shooting. Passive +15% bullet damage, +75 HP, +30% ammo. Tank-style sustained-fire glue — keeps you safe in extended firefights.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResistPerStack` | 0 | 2% per stack | ~36% | × 0.6 avg stacks (18 of 30 max maintained in fights) |
| `MaxArmorStacks` | 30 | 30 | — | (cap) |
| `BulletResistDuration` | 24 | 24 | — | (per-stack duration) |
| `BaseAttackDamagePercent` | 15% | 15% | 15% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `BonusClipSizePercent` | 30% | 30% | 30% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resistance` | ~36% sustained | 1.5 | adds | Strong sustained bullet resist; cross-tier 2.0 = Bullet Resilience 30% (but flat passive) |
| `gun_burst_resistance` | — | 0.6 | adds | R2 analogue: bullet resist on burst incoming |
| `gun_continuous_resistance` | — | 0.6 | adds | R2 analogue: bullet resist on continuous incoming |
| `magazine_size_dependant` | 30% | 0.6 | adds | Sub-Titanic Magazine 100% — sparse-tier extrapolation applies |
| `bullet_damage` | 15% | 0.7 | adds | T3 baseline damage |
| `gun_burst_damage` | — | 0.35 | adds | R2: per-shot damage propagation (0.5 × 0.7) |
| `gun_continuous_damage` | — | 0.25 | adds | R2: per-shot damage propagation (0.3 × 0.7) |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude 375 |
| `damage_sponge` | — | 0.5 | relies | Bigger HP pool extends the time-to-build window |
| `damage_sponge` | — | 0.6 | adds | Stacking resistance is naturally bruiser-flavored |
| `engage` | — | 0.4 | adds | Stacking item rewards sustained brawling |
| `scaling_late` | — | 0.5 | adds | Stack ramp favors longer fights |

---

## Express Shot
- **normalized_name**: `express_shot`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Express_Shot

### Interpretation
Charged-shot burst: every 8s, your next shot deals +125% weapon damage at 100% bullet velocity bonus (consumes 2 ammo). Passive +60% bullet speed, +8% damage. Defines T3 long-range burst — pop a key headshot on a fragile carry. Best on slow-firing high-damage weapons (snipers).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive (tier-flat 60%) |
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |
| `ProcBaseAttackDamagePercent_Value` | 0 | 125% | ~16/8s | Major hit per cd |
| `ProcBulletVelocity` | 0 | 100% | per proc | On charged shot |
| `ProcAmmoConsumed` | 2 | 2 | — | (ammo cost per proc) |
| `AbilityCooldown` | 8 | 8 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `gun_burst_damage` | +125% / 8s | 1.5 | adds | R2: T3 defining bullet-burst per-shot scaler |
| `gun_continuous_damage` | — | 0.3 | adds | R2: small continuous lift from per-cycle proc + passive |
| `long_range` | 60% bullet speed | 1.0 | adds | Tier-flat 60% bullet speed |
| `bullet_damage` | 8% passive | 0.4 | adds | Token T3 weapon damage |
| `headshot_damage` | — | 1.0 | relies | Best on heroes who can land a charged crit |
| `single_target` | — | 0.7 | adds | Per-cd burst favors single-target picks |
| `single_ability_focus` | — | 0.3 | adds | One big shot per cycle — burst focus |
| `gun_burst_proc` | per-cycle | 0.6 | adds | R5: 8s-cd proc — burst-leaning |
| `gun_continuous_proc` | — | 0.2 | adds | R5: still cycles continuously over time |
| `mid_range` | — | 0.4 | adds | Bullet speed also helps mid-range fights |

---

## Headhunter
- **normalized_name**: `headhunter`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Headhunter

### Interpretation
T3 headshot scaler: +75 bonus damage on headshot, heal 4% max HP, +1.75 m/s MS for 3s. 8s proc cd. Passive +5% damage, +50 HP. Strong on headshot-leaning kits — combines damage burst, sustain, and mobility on each landed crit.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `HeadShotBonusDamage_Value` | 0 | 75 | ~9.4/sec | 75 / 8s if landing crits |
| `HealPercentPerHeadshot_Value` | 0 | 4% | per proc | Per landed headshot |
| `BonusMoveSpeed` (post-headshot) | 0 | 1.75 m/s | ~0.66 m/s | × 3/8 uptime |
| `MovementSpeedBonusDuration` | 3 | 3 | — | (move buff duration) |
| `BaseAttackDamagePercent` | 5% | 5% | 5% | Passive |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `AbilityCooldown` | 8 | 8 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `headshot_damage` | 75/8s | 1.5 | adds | T3 best for headshot scaling |
| `headshot_damage` | — | 1.0 | relies | Requires landing headshots — heavy synergy |
| `self_heal` | 4%HP/proc | 0.8 | adds | On-crit heal scales with max HP |
| `burst_heal` | 4%HP | 0.6 | adds | R10: per-headshot heal IS a burst per proc |
| `continous_heal` | — | 0.3 | adds | R10 blend partner: chained headshots create a sustained heal |
| `horizontal_mobility` | 0.33 m/s | 0.2 | adds | Active move × 0.5 weight |
| `bullet_damage` | 5% | 0.3 | adds | Token T3 damage |
| `gun_burst_damage` | — | 0.5 | adds | R2 + headshot crit windows: per-headshot is burst-flavored |
| `gun_continuous_damage` | — | 0.15 | adds | R2 floor |
| `high_max_hp` | 50 | 0.2 | adds | Token HP |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion (literal 4% max HP scaling) |
| `long_range` | — | 0.5 | adds | Headshots favor long-range gunners |
| `gun_burst_proc` | per-headshot | 0.6 | adds | R5: 8s-cd proc — burst-leaning |
| `gun_continuous_proc` | — | 0.3 | adds | R5: still procs each successful headshot |
| `single_target` | — | 0.4 | adds | Headshot procs hit one target |
| `engage` | — | 0.3 | adds | MS-on-crit favors chasing |

---

## Hunters Aura
- **normalized_name**: `hunters_aura`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Hunters_Aura

### Interpretation
Passive 15m AoE aura that constantly debuffs nearby enemies: -10 bullet resist, -14% fire rate. Single-target enemy in aura doubles those values. +100 HP, +0.75 sprint passive. Defines aura-debuff playstyle at T3 — no cast required, just be near enemies. Cross-tier ceilings: bullet shred -16 (Crippling), fire rate slow -36% (Juggernaut).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` (aura) | -10 | -20 (1v1) | -12 avg | Aura always-on; ST 2× when isolated |
| `FireRateSlow` (aura) | 0 | -28% (1v1) | -17% avg | Same aura, ST doubled |
| `Radius` | 15 m | 15 m | — | (aura radius) |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resist_shred` | -12 aura | 1.3 | adds | Aura uptime is constant; on curve toward Crippling -16 = 2.0 |
| `fire_rate_slow` | -17% aura | 1.0 | adds | Strong aura disarm; cross-tier 2.0 = Juggernaut -36% |
| `disarm` | — | 1.0 | adds | Fire-rate aura soft-disarms enemies |
| `high_max_hp` | 100 | 0.4 | adds | T3 HP — well below Fortitude 375 |
| `close_to_team` | — | 0.5 | adds | Aura only works at 15m — favors close fights |
| `assist_importance` | — | 1.2 | adds | R10/R13: aura debuff helps the entire team focus the slowed/shredded enemies |
| `counter_importance` | — | 0.8 | adds | R13: bought specifically vs gun-DPS comps |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | 0.75 sprint × 0.5 weight |
| `close_range` | — | 0.5 | adds | R11: 15m aura forces close fights |
| `engage` | — | 0.4 | adds | Aura debuff helps team initiate |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Point Blank
- **normalized_name**: `point_blank`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Point_Blank

### Interpretation
T3 close-range scaler — Close Quarters T1's big brother. +50% bullet damage within 15m, applies a 25% slow on close-range hits for 2s, +30% melee resist passive, +75 HP. Strong for shotguns and SMG heroes who naturally fight in close. Slow-on-hit keeps targets stuck in your effective range.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CloseRangeBonusWeaponPower` | 50% | 50% | 40% | × 0.8 uptime for close-range heroes |
| `CloseRangeBonusDamageRange` | 15 m | 15 m | — | (range gate) |
| `SlowPercent` | 0 | 25% | ~20% | On-hit, refreshes constantly while shooting |
| `SlowDuration` | 2 | 2 | — | (timing) |
| `MeleeResistPercent` | 30% | 30% | 30% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 40% gated | 1.3 | adds | Strong close-range damage; on curve toward Glass Cannon 80% = 2.0 |
| `gun_burst_damage` | — | 0.65 | adds | R2: per-shot damage propagation (0.5 × 1.3) |
| `gun_continuous_damage` | — | 0.4 | adds | R2: per-shot damage propagation (0.3 × 1.3) |
| `close_range` | — | 1.5 | adds | T3 defining close-range item |
| `movement_slow` | ~20% sustained | 1.0 | adds | On-hit slow keeps targets in range |
| `melee_resistance` | 30% | 1.5 | adds | T3 best melee resist (cross-tier alongside Crushing Fists / Colossus) |
| `melee_damage` | — | 0.7 | adds | R12 (per user): close-range weapon damage IS melee damage — encode it |
| `bullet_damage` | — | 1.0 | relies | Close-range gun heroes synergize hard |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude 375 |
| `engage` | — | 0.5 | adds | R11: close-range item rewards engaging |
| `grounded` | — | 0.5 | adds | R7: close-range gunfighting is grounded |
| `gun_continuous_proc` | per-shot | 0.6 | adds | R5: on-hit slow refreshes every shot — continuous-leaning |
| `gun_burst_proc` | — | 0.3 | adds | R5: still procs each shot — modest burst |

---

## Shadow Weave
- **normalized_name**: `shadow_weave`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Shadow_Weave

### Interpretation
Classic ambush opener: 10s invis on 45s cd. During invis: +5 m/s MS. Break invis (e.g., shoot) and gain 5s ambush window: +20% fire rate, +20 SP, +20 heavy melee damage. Passive +1.5 sprint, +5 OOC regen. Best for engage/picks — slip past frontline, then burst a backline carry. 5/45 ambush uptime = ~11%.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `InvisDuration` | 0 | 10s | per cd | Active engage tool |
| `InvisMoveSpeedMod` | 0 | 5 m/s | ~1.1 m/s | × 10/45 uptime |
| `AmbushBonusFireRate` | 0 | 20% | ~2.2% | × 5/45 uptime |
| `AmbushBonusTechPower` | 0 | 20 | ~2.2 | Same |
| `AmbushBonusMeleeDamage` | 0 | 20 | ~2.2 | Same |
| `BonusSprintSpeed` | 1.5 m/s | 1.5 m/s | 1.5 m/s | Passive |
| `OutOfCombatHealthRegen` | 5/sec | 5/sec | 1.5/sec | × 0.3 OOC uptime |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `engage` | invis + ambush | 1.5 | adds | T3 defining ambush/engage tool |
| `gun_burst_damage` | ambush window | 1.0 | adds | R2: strong front-loaded ambush burst |
| `gun_continuous_damage` | — | 0.4 | adds | R2: small lift during ambush window |
| `horizontal_mobility` | 0.75 + 1.1 active | 1.0 | adds | Sprint passive + invis speed |
| `escape` | invis | 1.0 | adds | Invis is also a strong disengage |
| `away_from_team` | — | 0.5 | adds | Item rewards solo-flank initiation |
| `self_heal` | 1.5/sec OOC | 0.5 | adds | Strong OOC regen helps post-ambush recovery |
| `continous_heal` | 1.5/sec | 0.4 | adds | R10 cadence partner for OOC regen |
| `fire_rate` | ~2.2% | 0.2 | adds | Small fire-rate amortized |
| `spirit_damage` | ~2.2 | 0.2 | adds | R1: was spirit_power — token amortized SP |
| `melee_damage` | ambush heavy | 0.3 | adds | +20 heavy melee in ambush window |
| `farmer` | — | 0.4 | adds | R14: sprint helps jungle traversal |
| `single_ability_focus` | — | 0.3 | adds | R4: ambush window favors one big combo |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Sharpshooter
- **normalized_name**: `sharpshooter`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Sharpshooter

### Interpretation
T3 long-range gun glue: +70% bullet damage at >15m, +20% bullet range, +25% zoom. -0.7 m/s in-fight MS downside. The damage scaler is huge for snipers. T3 ceiling for `long_range` (cross-tier high — 70% > T2 Long Range 40%); paired with the move speed penalty, it's a stand-still-and-shoot tradeoff.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LongRangeBonusWeaponPower` | 70% | 70% | ~56% | × 0.8 uptime for long-range heroes |
| `BonusAttackRangePercent` | 20% | 20% | 20% | Passive |
| `BonusZoomPercent` | 25% | 25% | 25% | Passive |
| `BonusMoveSpeed` | -0.7 m/s | -0.7 m/s | -0.7 m/s | Passive DOWNSIDE |
| `BonusSprintSpeed` | 1 m/s | 1 m/s | 1 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `long_range` | 70% + 20% range | 1.5 | adds | T3 best for the long_range axis; cross-tier ceiling for ranged scaling |
| `bullet_damage` | ~56% gated | 1.5 | adds | Strong gated damage — close to Glass Cannon 80% within the range gate |
| `gun_burst_damage` | — | 0.75 | adds | R2: per-shot damage propagation (0.5 × 1.5) |
| `gun_continuous_damage` | — | 0.45 | adds | R2: per-shot damage propagation (0.3 × 1.5) |
| `long_range` | — | 1.5 | relies | Pure synergy item — pays off heavily on snipers |
| `horizontal_mobility` | -0.35 m/s | -0.3 | adds | In-fight move penalty hurts kiting |
| `away_from_team` | — | 0.7 | adds | Range gating encourages playing back |
| `headshot_damage` | — | 0.5 | adds | Zoom + range buff helps land crits |
| `single_target` | — | 0.5 | adds | Sniper-focused — single-target damage |
| `aerial` | — | -0.3 | adds | R7: in-fight MS penalty hurts mobility-heavy aerial play (single negative tag) |

---

## Spirit Rend
- **normalized_name**: `spirit_rend`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spirit_Rend

### Interpretation
Stacking bullet-proc spirit shred (4-stack cap, -7 per stack = -28 max). Each proc also applies -8 per stack to spirit armor (= -32 max). 2s ICD between procs, 8s linger. Passive +10% spirit lifesteal, +75 HP. Strongest spirit-resist shred in T3 for hybrid bullet+spirit builds.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `MagicResistReduction` | 0 | -28 (full stacks) | ~-18 | × 0.65 avg stacks maintained |
| `TechArmorDamageReduction` | 0 | -32 (full stacks) | ~-20 | Same |
| `MaxStacks` | 4 | 4 | — | (cap) |
| `DebuffDuration` | 8 | 8 | — | (per-stack linger) |
| `ProcCooldown` | 2 | 2 | — | (ICD between procs) |
| `AbilityLifestealPercentHero` | 10% | 10% | 10% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resist_shred` | -18 stacked | 1.5 | adds | Strong stacked shred; exceeds Crippling -16 = 2.0 only at full stacks (still 1.5 on average) |
| `spirit_lifesteal` | 10% | 0.7 | adds | Modest T3 spirit lifesteal |
| `hybrid_damage_usage` | — | 1.5 | adds | Bullet→spirit-shred is canonical hybrid |
| `bullet_proc` | per shot | 1.0 | adds | Procs from gun damage |
| `gun_continuous_proc` | per shot | 1.0 | adds | R5: per-bullet spirit-shred proc — continuous-leaning |
| `gun_burst_proc` | — | 0.4 | adds | R5: still procs each shot — small burst flavor |
| `self_heal` | — | 0.5 | adds | R10: spirit lifesteal contributes self-sustain |
| `continous_heal` | — | 0.4 | adds | R10 cadence partner |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude 375 |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches the shred mechanic to a chosen ability |
| `high_max_hp` | — | 0.3 | relies | R8: lifesteal scales with HP cushion |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Toxic Bullets
- **normalized_name**: `toxic_bullets`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Toxic_Bullets

### Interpretation
Tank-killer per-shot ramp DoT: bullets build a 1.7% max HP/tick DoT over 5 shots, ticking every 0.5s for 4s. Also applies -35% heal received / regen during the DoT. Half effect vs creeps. Combines max-HP damage (anti-tank) with anti-heal (anti-bruiser) — devastating against high-HP heals-heavy targets.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DotHealthPercent_Value` | 0 | 1.7%/tick | ~2.7%/sec | 1.7% × 2 ticks/sec × ~0.8 sustained-fire uptime |
| `DotDuration` | 4 | 4 | — | (DoT window) |
| `BuildUpDuration` | 5 | 5 | — | (ramp window) |
| `HealAmpReceivePenaltyPercent` | 0 | -35% | -35% | High uptime while shooting |
| `HealAmpRegenPenaltyPercent` | 0 | -35% | -35% | Same |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `dot` | ~2.7% max HP/sec | 1.5 | adds | T3 best max-HP-based DoT |
| `spirit_damage` | ~2.7%/sec | 1.0 | adds | R6: DoT IS spirit damage — encode the damage row |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: continuous DoT lifts the continuous-spirit axis |
| `spirit_burst_damage` | — | 0.2 | adds | R3 floor — small burst on initial application |
| `anti_heal` | -35% | 1.0 | adds | Solid anti-heal; cross-tier 2.0 = Spirit Burn -70% |
| `bullet_proc` | per-shot ramp | 1.0 | adds | Bullet-driven proc mechanic |
| `gun_continuous_proc` | per-shot | 1.2 | adds | R5: per-bullet ramp — continuous-leaning |
| `gun_burst_proc` | — | 0.4 | adds | R5: still procs per shot |
| `damage_sponge` | — | 1.0 | adds | Counter to high-HP targets (scales with target HP) |
| `counter_importance` | — | 1.5 | adds | R13: strong counter to heal/bruiser comps |
| `hybrid_damage_usage` | — | 1.0 | adds | Bullet trigger applies a spirit DoT |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Weighted Shots
- **normalized_name**: `weighted_shots`
- **tier**: 3 (3200 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Weighted_Shots

### Interpretation
T3 weapon-damage powerhouse with built-in soft-CC: +40% bullet damage passive. Each bullet ramps a 30% MS slow + 25% dash reduction over 5 shots, 3.5s linger. +20% status resist. Downsides: -14% stamina regen, -0.5 m/s MS. The 40% raw bullet damage is enormous — closest passive damage stat to Glass Cannon outside of T4.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 40% | 40% | 40% | Passive |
| `SlowPercent` | 0 | 30% | ~24% | × 0.8 ramp uptime |
| `GroundDashReductionPercent` | 0 | -25% | ~-20% | Same |
| `StatusResistancePercent` | 20% | 20% | 20% | Passive |
| `StaminaCooldownReduction` | -14% | -14% | -14% | Passive DOWNSIDE |
| `BonusMoveSpeed` | -0.5 m/s | -0.5 m/s | -0.5 m/s | Passive DOWNSIDE |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 40% | 1.5 | adds | T3 best passive bullet damage; on curve toward Glass Cannon 80% = 2.0 |
| `gun_burst_damage` | — | 0.75 | adds | R2: per-shot damage propagation (0.5 × 1.5) |
| `gun_continuous_damage` | — | 0.45 | adds | R2: per-shot damage propagation (0.3 × 1.5) |
| `movement_slow` | ~24% | 1.0 | adds | Solid ramp slow |
| `debuff_resistance` | 20% | 1.0 | adds | Status resist on the carrier |
| `cc_resist` | 20% | 1.0 | adds | Same |
| `horizontal_mobility` | -0.5 m/s | -0.3 | adds | In-fight MS penalty |
| `vertical_mobility` | -0.07 | -0.1 | adds | Stamina regen penalty |
| `aerial` | — | -0.3 | adds | R7: stamina penalty hurts aerial play |
| `gun_continuous_proc` | per-shot | 0.7 | adds | R5: per-bullet slow ramp — continuous-leaning |
| `gun_burst_proc` | — | 0.3 | adds | R5: per-shot proc — small burst flavor |
| `engage` | — | 0.4 | adds | Slow + damage rewards initiating |

---

## Bullet Resilience
- **normalized_name**: `bullet_resilience`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Bullet_Resilience

### Interpretation
+30% bullet resist passive, with an extra +15% when below 50% HP (clutch threshold). +3 OOC regen. Defines the cross-tier 2.0 anchor for `bullet_resistance` at 30% (tied with Warp Stone T3). The lowhp gate creates a `damage_sponge relies` row — you keep more value when you're absorbing damage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 30% | 30% | 30% | Passive |
| `BulletResistBelowThreshold` | 0 | 15% | ~3.75% | × 0.25 lowhp uptime |
| `HealthThreshold` | 50% | 50% | — | (carrier-HP gate) |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resistance` | 30% + 3.75% lowhp | 2.0 | adds | Cross-tier ceiling for bullet_resistance |
| `gun_burst_resistance` | — | 0.8 | adds | R2 analogue: bullet resist on incoming burst |
| `gun_continuous_resistance` | — | 0.8 | adds | R2 analogue: bullet resist on incoming continuous |
| `damage_sponge` | — | 1.0 | adds | Designed to soak bullet damage |
| `damage_sponge` | — | 0.5 | relies | Low-HP gate rewards tanky/HP-stacking heroes |
| `self_heal` | 0.9/sec | 0.4 | adds | OOC regen |
| `continous_heal` | 0.9/sec | 0.4 | adds | R10 cadence partner for OOC regen |
| `counter_importance` | — | 0.8 | adds | R13: bought specifically vs gun-DPS comps |
| `high_max_hp` | — | 0.4 | relies | R8: defensive scaling pairs with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Counterspell
- **normalized_name**: `counterspell`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Counterspell

### Interpretation
Spell-parry: active 0.8s parry window on 23s cd that blocks enemy ability damage. On success: 150 HP heal, 6s buff (+20 SP, +1.75 m/s MS). Passive +8 SP, +50 HP. Hard counter to ability-spam comps but requires reading enemy casts (skill-gated).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpellParryDuration` | 0 | 0.8 | per cd | One block per 23s |
| `HealOnSuccess` | 0 | 150 | ~50 | Per successful parry, amortized |
| `SpiritPower` (active) | 0 | 20 | ~5 | × 6/23 active uptime |
| `BonusMoveSpeed` (active) | 0 | 1.75 m/s | ~0.46 m/s | × 6/23 uptime |
| `SpiritPowerInnate` | 8 | 8 | 8 | Passive flat SP |
| `BonusHealth` | 50 | 50 | 50 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | spell-block | 1.5 | adds | Total nullification of one enemy cast per cd |
| `spirit_burst_resistance` | — | 1.2 | adds | R2 analogue: spell-block specifically catches incoming spirit burst |
| `counter_importance` | — | 1.5 | adds | R13: strong counter to ability-spam comps |
| `burst_resistance` | — | 1.0 | adds | Blocks big nukes |
| `burst_heal` | 150/parry | 0.7 | adds | Mid-fight heal on success |
| `continous_heal` | — | 0.2 | adds | R10 blend partner |
| `spirit_damage` | 8 + ~5 | 0.7 | adds | R1: was spirit_power — modest SP, total ~13 avg |
| `spirit_burst_damage` | — | 0.35 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.35 | adds | R2: general SP propagation |
| `horizontal_mobility` | 0.23 m/s | 0.1 | adds | Active move × 0.5 |
| `high_max_hp` | 50 | 0.2 | adds | Sub-Fortitude |
| `high_max_hp` | — | 0.3 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Fortitude
- **normalized_name**: `fortitude`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Fortitude

### Interpretation
Biggest raw HP stick in the game: +375 HP, +1.25 m/s MS, plus 2% life/sec restorative regen out of combat (after 10s delay, requires staying above 75% HP). Cross-tier 2.0 anchor for `high_max_hp`. Pure tank stat stick.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 375 | 375 | 375 | Passive — cross-tier ceiling |
| `BonusMoveSpeed` | 1.25 m/s | 1.25 m/s | 1.25 m/s | Passive |
| `HealLifePercentOutOfCombat` | 0 | 2% | ~0.4%/sec | × 0.2 uptime (>75% HP + post-delay) |
| `RestoreDelay` | 10 | 10 | — | (delay after combat ends) |
| `HealthThreshold` | 75% | 75% | — | (gate for the regen kick-in) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | 375 | 2.0 | adds | Cross-tier ceiling for HP |
| `damage_sponge` | — | 1.5 | adds | Big HP pool is the defining tank profile |
| `horizontal_mobility` | 1.25 m/s | 0.8 | adds | In-fight MS — solid |
| `self_heal` | ~0.4%/sec | 0.5 | adds | OOC restorative regen, gated |
| `continous_heal` | ~0.4%/sec | 0.5 | adds | R10 cadence partner for OOC regen |
| `engage` | — | 0.4 | adds | MS + huge HP pool favors initiating |
| `escape` | — | 0.3 | adds | MS also helps disengage |
| `farmer` | — | 0.3 | adds | R14: in-fight MS helps jungle traversal |

---

## Healing Nova
- **normalized_name**: `healing_nova`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Nova

### Interpretation
Active AoE team-heal burst: 325 HP over 2s within 18m. 60s cd. Passive +8 SP, +5% range/radius. Strong teamfight support — heals the entire team in one cast. The big radius makes it a true team-heal, not just self.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TotalHealthRegen_Value` (active) | 0 | 325 | ~11/sec | Per ally hit, amortized over 60s |
| `RegenDuration` | 2 | 2 | — | (timing) |
| `AuraRadius` | 18 m | 18 m | — | (heal radius) |
| `SpiritPower` | 8 | 8 | 8 | Passive |
| `TechRangeMultiplier` | 5% | 5% | 5% | Passive |
| `TechRadiusMultiplier` | 5% | 5% | 5% | Passive |
| `AbilityCooldown` | 60 | 60 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `team_heal` | 325 × team | 1.5 | adds | T3 best AoE team heal |
| `burst_heal` | 325/cast | 1.5 | adds | Big burst heal per use |
| `continous_heal` | — | 0.4 | adds | R10 blend partner: 2s heal-over-time has a continuous component |
| `assist_importance` | — | 1.5 | adds | R10: pure team-support item |
| `self_heal` | 325/60s | 0.5 | adds | Also heals self |
| `spirit_damage` | 8 | 0.3 | adds | R1: was spirit_power — token SP |
| `close_to_team` | — | 1.0 | adds | Heal requires team in 18m radius |
| `aoe_cluster` | 18m | 0.8 | adds | Big radius AoE heal |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius buff helps multiple abilities |
| `farmer` | — | 0.3 | adds | R10: heal offsets jungle camp damage |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |
| `spirit_burst_damage` | — | 0.1 | adds | R3 floor propagation |
| `spirit_continuous_damage` | — | 0.1 | adds | R3 floor propagation |

---

## Lifestrike
- **normalized_name**: `lifestrike`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Lifestrike

### Interpretation
T3 melee bruiser: on heavy melee hit, heal 100 HP + 30% lifesteal AND slow target -60% for 2.5s. 4s cd. Passive +16% melee damage, +125 HP. Combines sustain, control, and damage on every melee. Best on Abrams/Lash/heavy-melee heroes.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `LifestealHeal_Value` | 0 | 100 | ~25/sec | 100 / 4s if landing heavy melee |
| `LifestealHealPercent_Value` | 0 | 30% | per hit | Lifesteal portion of dmg dealt |
| `SlowPercent` | 0 | 60% | ~37% | × 2.5/4 uptime on the slow |
| `BonusMeleeDamagePercent` | 16% | 16% | 16% | Passive |
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `NonHeroHealPct` | 40% | 40% | — | (heal reduced vs NPCs) |
| `AbilityCooldown` | 4 | 4 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | ~25/sec | 1.5 | adds | T3 best melee sustain |
| `burst_heal` | 100/proc | 1.0 | adds | R10/R15 (per user): 100 HP on melee hit IS a burst heal — encode it |
| `continous_heal` | — | 0.6 | adds | R10 blend partner: chained melees create a continuous heal stream |
| `melee_damage` | 16% + 100/4s | 1.5 | adds | T3 best melee package |
| `movement_slow` | ~37% | 1.0 | adds | Strong slow per melee swing |
| `high_max_hp` | 125 | 0.4 | adds | Sub-Fortitude 375 |
| `melee_damage` | — | 1.5 | relies | Heavy synergy with melee-focused heroes |
| `engage` | — | 0.7 | adds | R11: slow keeps targets in melee range |
| `close_range` | — | 0.6 | adds | R11: melee item — close range mandatory |
| `grounded` | — | 0.5 | adds | R7: melee mechanic only realized while grounded |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion |
| `damage_sponge` | — | 0.5 | relies | R10: rewards sustained-damage brawlers |
| `farmer` | — | 0.3 | adds | R10: melee + heal helps jungle clears |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Majestic Leap
- **normalized_name**: `majestic_leap`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Majestic_Leap

### Interpretation
Active mobility/engage: leap 27m up, slam down into a 10m AoE applying 40% slow for 2.5s, granting carrier a 200 HP barrier for 8s. 45s cd. Strong vertical engage tool for picks from above or escape upwards.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `JumpVelocityHidden` | 27 m | 27 m | — | (leap height) |
| `SlamDownRadius` | 10 m | 10 m | — | (slam AoE) |
| `SlowPercent` | 0 | 40% | ~2.2% | × 0.2 ST × 2.5/45 amortized |
| `CombatBarrier_Value` | 0 | 200 HP | ~36 HP | × 8/45 amortized |
| `AirControlPercent` | 100% | 100% | — | (full air control during leap) |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `vertical_mobility` | 27m leap | 2.0 | adds | Cross-tier ceiling for vertical mobility — pure leap item |
| `horizontal_mobility` | — | 0.5 | adds | Air control during leap also displaces you horizontally |
| `engage` | leap + slam | 1.5 | adds | R7: T3 defining vertical engage |
| `escape` | upward leap | 1.5 | adds | Same leap is also a strong disengage |
| `movement_slow` | ~2.2% | 0.2 | adds | Amortized slow on slam |
| `aerial` | — | 1.5 | adds | R7: item is built around air mobility |
| `displace` | self leap | 0.5 | adds | Self-displacement on cast |
| `damage_sponge` | 200 barrier | 0.3 | adds | Modest reactive shield |
| `burst_heal` | 200 barrier | 0.3 | adds | R10: barrier counts as burst-heal-equivalent |
| `aoe_cluster` | 10m slam | 0.6 | adds | Slam catches clustered enemies |
| `high_max_hp` | — | 0.3 | relies | R8: barrier scales with HP cushion |
| `farmer` | — | 0.3 | adds | R14: vertical mobility helps jungle traversal |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Metal Skin
- **normalized_name**: `metal_skin`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Metal_Skin

### Interpretation
Active 5s defensive commit: +12% bullet resist + (likely much higher damage reduction on active — verify in audit), pay -1.5 m/s MS and -20% dash distance during the 5s window. 24s cd → 21% uptime. A "plant your feet" tank button — trades mobility for stand-and-take-damage durability.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` (active) | 0 | 12% | ~2.5% | × 5/24 active uptime |
| `ActiveMoveSpeedPenalty` | 0 | -1.5 m/s | -0.31 m/s | × 5/24 amortized DOWNSIDE |
| `GroundDashReductionPercent` (active) | 0 | -20% | ~-4% | × 5/24 amortized DOWNSIDE |
| `AbilityDuration` | 5 | 5 | — | (timing) |
| `AbilityCooldown` | 24 | 24 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resistance` | ~2.5% amortized | 0.5 | adds | Modest amortized active resist |
| `gun_burst_resistance` | — | 0.7 | adds | R2 analogue: active is burst-window focused |
| `gun_continuous_resistance` | — | 0.4 | adds | R2 analogue: smaller continuous lift |
| `burst_resistance` | active commit | 1.5 | adds | Strong burst tankiness during the active window |
| `damage_sponge` | — | 1.0 | adds | Item is a stand-and-take-damage commit |
| `horizontal_mobility` | -0.31 m/s | -0.2 | adds | Active MS penalty hurts kiting |
| `damage_sponge` | — | 0.5 | relies | Pays off on tank/bruiser builds |
| `engage` | — | 0.4 | adds | Active commit favors initiating a brawl |
| `counter_importance` | — | 0.5 | adds | R13: useful vs burst-heavy comps |
| `grounded` | — | 0.3 | adds | R7: active commit is grounded play |
| `aerial` | — | -0.2 | adds | R7: MS/dash penalty hurts aerial play |
| `melee_damage` | — | 0.3 | adds | R12: bruiser commit-style item — melee output is part of the play |
| `high_max_hp` | — | 0.3 | relies | R8: defensive scaling pairs with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Spirit Resilience
- **normalized_name**: `spirit_resilience`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spirit_Resilience

### Interpretation
Spirit-side mirror of Bullet Resilience: +30% spirit resist passive, +15% extra below 50% HP. +3 OOC regen. T3 ceiling for `spirit_resistance` at 30% (Fury Trance T3 40% is the true 2.0 anchor but is gated on active).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 30% | 30% | 30% | Passive |
| `TechResistBelowThreshold` | 0 | 15% | ~3.75% | × 0.25 lowhp uptime |
| `HealthThreshold` | 50% | 50% | — | (carrier-HP gate) |
| `OutOfCombatHealthRegen` | 3/sec | 3/sec | 0.9/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | 30% + 3.75% lowhp | 1.5 | adds | T3 best passive (Fury Trance 40% is active) |
| `spirit_burst_resistance` | — | 0.8 | adds | R2 analogue: spirit resist on burst incoming |
| `spirit_continuous_resistance` | — | 0.8 | adds | R2 analogue: spirit resist on continuous incoming |
| `damage_sponge` | — | 1.0 | adds | Spirit damage soak |
| `damage_sponge` | — | 0.5 | relies | Low-HP gate rewards tanky builds |
| `self_heal` | 0.9/sec | 0.4 | adds | OOC regen |
| `continous_heal` | 0.9/sec | 0.4 | adds | R10 cadence partner |
| `counter_importance` | — | 0.8 | adds | R13: bought vs spirit-DPS comps |
| `high_max_hp` | — | 0.4 | relies | R8 |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Stamina Mastery
- **normalized_name**: `stamina_mastery`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Stamina_Mastery

### Interpretation
Cross-tier stamina ceiling: +2 stamina charges (the 2.0 anchor — no other item gives this much), +18% stamina regen, +23% air move speed. T3 best mobility item via stamina. Per user feedback, stamina items also get an `escape` row.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Stamina` | +2 | +2 | +2 | Passive — cross-tier ceiling |
| `StaminaCooldownReduction` | 18% | 18% | 18% | Passive |
| `AirMoveIncreasePercent` | 23% | 23% | 23% | Passive (in-air move speed buff) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `vertical_mobility` | +1 vert + 23% air | 2.0 | adds | Cross-tier ceiling for stamina-driven vertical mobility |
| `horizontal_mobility` | +1 horizontal | 1.0 | adds | +2 stamina × 0.5 horizontal weight |
| `escape` | — | 1.0 | adds | R9: stamina items net escape per user feedback |
| `engage` | — | 0.8 | adds | R9 (per user): stamina also lets you "jump on" enemies |
| `aerial` | 23% air | 1.5 | adds | R9: in-air move bonus + extra stamina = strong aerial play |
| `vertical_mobility` | — | 1.0 | relies | Pays off for heroes who use vertical play (Lash, Vindicta) |
| `farmer` | — | 0.4 | adds | R14: extra stamina helps jungle traversal |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Veil Walker
- **normalized_name**: `veil_walker`
- **tier**: 3 (3200 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Veil_Walker

### Interpretation
T3 invis + mobility ceiling: 7s invis on 15s cd (47% uptime — very high), +3.5 m/s during invis (cross-tier ceiling for in-fight MS), +85 HP heal on cast. Passive +2 sprint, +125 HP, +10 SP, +2 OOC regen. Versatile escape/engage with sustain glue baked in.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `InvisDuration` | 0 | 7s | per cd | High uptime tool |
| `BonusMoveSpeed` (invis) | 0 | 3.5 m/s | ~1.6 m/s | × 7/15 uptime |
| `HealOnVeil_Value` | 0 | 85 | ~5.7/sec | 85 / 15 amortized |
| `BonusSprintSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `SpiritPower` | 10 | 10 | 10 | Passive |
| `OutOfCombatHealthRegen` | 2/sec | 2/sec | 0.6/sec | × 0.3 OOC uptime |
| `AbilityCooldown` | 15 | 15 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `horizontal_mobility` | 1 m/s + 1.6 active | 2.0 | adds | Cross-tier ceiling for in-fight MS via stamina-style mobility |
| `escape` | 7s invis | 1.5 | adds | Invis is the canonical escape tool |
| `engage` | invis | 1.0 | adds | Equally good for engages |
| `self_heal` | 5.7/sec heal | 1.0 | adds | On-cast heal amortized |
| `burst_heal` | 85/cast | 0.6 | adds | R10: per-cast burst heal |
| `continous_heal` | — | 0.5 | adds | R10 cadence partner |
| `high_max_hp` | 125 | 0.4 | adds | Sub-Fortitude 375 |
| `spirit_damage` | 10 | 0.4 | adds | R1: was spirit_power — modest T3 SP |
| `spirit_burst_damage` | — | 0.2 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.2 | adds | R2: general SP propagation |
| `farmer` | — | 0.4 | adds | R14: sprint + heal helps jungle clears |
| `high_max_hp` | — | 0.4 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Decay
- **normalized_name**: `decay`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Decay

### Interpretation
Active 10s anti-tank/anti-heal hex on target at 20m: 2.6% max HP/tick (×10 ticks = 26% max HP DoT) + -50% heal amp/regen. 32s cd → 31% uptime. Passive +8 SP, +65 HP. Devastating against high-HP heal-stacking targets, paired with the heal-amp shutdown.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DotHealthPercent_Value` | 0 | 2.6%/tick | ~0.8%/sec | × 10/32 amortized over cd |
| `HealAmpReceivePenaltyPercent` | 0 | -50% | ~-15.6% | × 10/32 amortized; targeted ST so apply × 0.2 → ~-3% blended; raw vs single target is -50% |
| `HealAmpRegenPenaltyPercent` | 0 | -50% | ~-50% during active | Same |
| `TechPower` | 8 | 8 | 8 | Passive |
| `BonusHealth` | 65 | 65 | 65 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `dot` | ~0.8%/sec max HP | 1.3 | adds | Amortized max-HP DoT |
| `spirit_damage` | ~0.8%/sec max HP | 1.0 | adds | R6: item literally deals spirit damage via the DoT — encode the damage row |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: DoT lifts continuous-spirit axis |
| `spirit_burst_damage` | — | 0.2 | adds | R3 floor — small burst on initial application |
| `anti_heal` | -50% (10/32 uptime) | 1.5 | adds | T3 best anti-heal on curve toward Spirit Burn -70% = 2.0 |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to tank/heal comps |
| `single_target` | — | 1.0 | adds | Single-target hex |
| `spirit_damage` | 8 | 0.3 | adds | R1: was spirit_power — token SP |
| `damage_sponge` | — | 1.0 | adds | Counter to high-HP targets (max HP DoT) |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches DoT mechanic to a cast |
| `debuff` | — | 0.6 | adds | Strong cleansable debuff applied to enemies |

---

## Disarming Hex
- **normalized_name**: `disarming_hex`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Disarming_Hex

### Interpretation
T3 hard-CC disarm on target: 4s disarm + -13 bullet resist for 4s. 16s cd → 25% uptime. Cast range 32m. Passive +0.75 sprint, +75 HP. The disarm is the headline — completely shuts off enemy gun for 4s, plus the shred makes follow-up bullets hit harder.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletArmorReduction` | 0 | -13 | -3.25 | × 4/16 amortized |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `AbilityDuration` | 4 | 4 | — | (timing) |
| `AbilityCooldown` | 16 | 16 | — | (timing) |
| `AbilityCastRange` | 32 m | 32 m | — | (cast range) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `disarm` | 4s/16s ST | 2.0 | adds | Cross-tier ceiling — hardest disarm (not just slow) |
| `bullet_resist_shred` | -3.25 amortized | 0.5 | adds | Amortized shred; cross-tier 2.0 = Crippling -16 |
| `interrupt` | 4s lockout | 1.0 | adds | 4s gun lockout interrupts active fire |
| `counter_importance` | — | 1.5 | adds | R13: targets gun-DPS heroes |
| `single_target` | — | 1.0 | adds | ST press item |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | 0.75 sprint × 0.5 weight |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to one cast |
| `assist_importance` | — | 0.6 | adds | R10: disarm helps the team focus the disabled enemy |
| `debuff` | — | 0.6 | adds | Strong cleansable debuff |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Greater Expansion
- **normalized_name**: `greater_expansion`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Greater_Expansion

### Interpretation
T3 ceiling for `range_extender_dependant`: pure passive +30% ability range and +30% radius, +10% spirit resist. Upgrade of Mystic Expansion T1. The 30% is the cross-tier ceiling at 2.0 since no T4 item passively beats it (Spirit Burn T4 has 6× but ult-only).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechRangeMultiplier` | 30% | 30% | 30% | Passive |
| `TechRadiusMultiplier` | 30% | 30% | 30% | Passive |
| `TechResist` | 10% | 10% | 10% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `range_extender_dependant` | 30% | 2.0 | adds | Cross-tier ceiling for passive range/radius |
| `range_extender_dependant` | — | 1.0 | relies | Pure synergy item — only pays off for range/AoE heroes |
| `aoe_cluster` | 30% radius | 1.0 | adds | Bigger radius helps AoE abilities cluster more targets |
| `long_range` | 30% range | 0.7 | adds | Bigger range helps long-range ability heroes |
| `spirit_resistance` | 10% | 0.5 | adds | Token defensive |
| `spirit_burst_resistance` | — | 0.25 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.25 | adds | R2 analogue |
| `multi_ability_focus` | — | 0.5 | adds | R4: range/radius helps multiple abilities — broad lift |
| `single_ability_focus` | — | -0.15 | adds | R4: helps less if narrowed to one ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Knockdown
- **normalized_name**: `knockdown`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Knockdown

### Interpretation
Single-target stun with anti-aerial bonus: 0.5s base stun + up to 1.5s extra based on target's air height (max ~2s total against an aerial target). 2s delay before stun lands. 35s cd, 45m range. +75 HP passive. T3 hard-CC against fliers (Vindicta/Mo-Krill flight, Lash swings).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `StunDuration` | 0 | 0.5s base | per cd | Plus aerial bonus |
| `MaxBonusDuration` | 1.5 | 1.5 | per cd | When targeting aerial enemy |
| `StunDelay` | 2 | 2 | — | (delay before stun applies) |
| `BonusHealth` | 75 | 75 | 75 | Passive |
| `TechRangeMultiplier` | 5% | 5% | 5% | Passive |
| `TechRadiusMultiplier` | 5% | 5% | 5% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `stun` | up to 2s/35s | 1.0 | adds | Targeted stun with anti-aerial bonus |
| `anti_air` | up to +1.5s vs aerial | 2.0 | adds | Cross-tier defining anti-aerial CC |
| `interrupt` | 35s cd | 0.7 | adds | Single-target interrupt for high-value picks |
| `single_target` | — | 0.7 | adds | Targeted press |
| `counter_importance` | — | 1.5 | adds | R13: strong counter to flying heroes |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude |
| `displace` | 1.5s+ knockdown | 0.6 | adds | Knocking an aerial enemy to the ground is a vertical displace |
| `assist_importance` | — | 0.6 | adds | R10: locking down a target helps the team focus |
| `debuff` | — | 0.5 | adds | Stun is a meaningful debuff to cleanse |
| `multi_ability_focus` | — | 0.3 | adds | R4: range/radius buff helps multiple abilities |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Rapid Recharge
- **normalized_name**: `rapid_recharge`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Rapid_Recharge

### Interpretation
T3 ceiling for `charge_dependant`: +2 ability charges (massive — Extra Charge T1 only gives +1), +14% CDR on charged abilities, +30% recharge speed between charges, +10 SP only on charged-ability casts. Transformative on charged-ability heroes; useless on everyone else.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityCharges` | +2 | +2 | +2 | Passive |
| `CooldownBetweenChargeReduction` | 30% | 30% | 30% | Passive — recharge interval reduced |
| `CooldownReductionOnChargedAbilities` | 14% | 14% | 14% | Passive — only on charged abilities |
| `BonusSpiritForChargedAbilities` | 10 | 10 | 10 | Passive — only on charged ability casts |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `charge_dependant` | +2 + 30% + 14% | 2.0 | adds | Cross-tier ceiling for charge_dependant |
| `charge_dependant` | — | 1.5 | relies | Pure synergy item — only pays off for charge-using kits |
| `ability_spam` | — | 1.5 | adds | More charges + faster recharge = more casts per fight |
| `spirit_damage` | 10 (gated) | 0.4 | adds | R1: was spirit_power — gated SP — only on charged casts |
| `cooldown_reduction` | 14% gated | 0.5 | adds | Gated CDR |
| `single_ability_focus` | — | 0.7 | adds | R4 (per user logic): charge-ability items narrow to 1-2 charged abilities |
| `spirit_burst_damage` | — | 0.2 | adds | R2: spirit damage propagation |
| `spirit_continuous_damage` | — | 0.2 | adds | R2: spirit damage propagation |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Silence Wave
- **normalized_name**: `silence_wave`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Silence_Wave

### Interpretation
AoE silence wave: 3s silence + 75 spirit damage in a cone-wave extending up to 40m, widening from 5m → 11m. 42s cd (30s if it misses everything). T3 hard-counter to ability-spam comps — the silence lockout is the headline. Skill-cast — needs to land on enemies.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 0 | 3s | per cd | Silence duration on hit enemies |
| `Damage_Value` | 0 | 75 | ~1.8/sec | 75 / 42s amortized |
| `InitialWidth` | 5 m | 5 m | — | (initial wave width) |
| `AbilityCastRange` | 40 m | 40 m | — | (max wave length) |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `CooldownOnMiss` | 30 | 30 | — | (reduced cd if missed) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `silence` | 3s/42s AoE | 2.0 | adds | Cross-tier ceiling — only AoE silence item |
| `interrupt` | — | 1.5 | adds | Silences mid-cast |
| `aoe_cluster` | — | 1.5 | adds | AoE wave hits multiple enemies |
| `counter_importance` | — | 1.5 | adds | R13: hard-counter to ability-spam comps |
| `engage` | — | 0.5 | adds | Silence opens engages |
| `spirit_damage` | 75/cast | 0.5 | adds | R6: item literally deals spirit damage on cast |
| `spirit_burst_damage` | 75/cast | 0.5 | adds | Token burst on top of the CC |
| `spirit_continuous_damage` | — | 0.15 | adds | R3/R2 floor |
| `assist_importance` | — | 1.0 | adds | R10: AoE silence helps the whole team focus targets |
| `single_ability_focus` | — | 0.3 | adds | R4: imbued — applies the silence on cast |
| `debuff` | — | 0.8 | adds | Silence is a major cleansable debuff |
| `high_max_hp` | 50 | 0.2 | adds | Token T3 HP |

---

## Spirit Snatch
- **normalized_name**: `spirit_snatch`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Snatch

### Interpretation
Heavy-melee SP-and-armor steal: hit enemy for 50 spirit + steal -20 SP and -12 spirit armor from them, give +20 SP and +12 spirit armor to self for 10s. 6s cd. Passive +7% melee damage, +75 HP. A "vampire" item — both shred and self-buff in one hit. Strong on melee bruisers.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `SpiritDamage_Value` | 0 | 50 | ~8/sec | 50 / 6s on heavy-melee cycle |
| `TechPowerReduction` (debuff) | 0 | -20 | ~-13 | × 10/6 stacks (refreshes) on target |
| `TechPowerGain` (buff self) | 0 | +20 | ~+13 | Same uptime on self |
| `TechArmorDamageReduction` | 0 | -12 | ~-8 | × stacks/refresh |
| `TechArmorGain` (buff self) | 0 | +12 | ~+8 | Same |
| `BonusMeleeDamagePercent` | 7% | 7% | 7% | Passive |
| `BonusHealth` | 75 | 75 | 75 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resist_shred` | -8 + self +8 spirit armor | 1.5 | adds | Combined shred + self-buff = effectively ~-16 differential |
| `spirit_damage` | ~+13 self buff | 1.0 | adds | R1: was spirit_power — steal-gain on heavy melee |
| `spirit_burst_damage` | 50/cycle | 0.7 | adds | Per-melee proc spirit damage |
| `spirit_continuous_damage` | — | 0.4 | adds | R2: melee proc has frequency in a brawl |
| `melee_damage` | 7% | 0.3 | adds | Token melee scaler |
| `melee_damage` | — | 1.0 | relies | Heavy-melee trigger — synergy with melee builds |
| `high_max_hp` | 75 | 0.3 | adds | Sub-Fortitude |
| `close_range` | — | 0.6 | adds | R11: melee item — close range mandatory |
| `engage` | — | 0.5 | adds | R11: melee proc forces engaging |
| `grounded` | — | 0.5 | adds | R7: melee proc realized while grounded |
| `spirit_burst_proc` | per-melee | 0.5 | adds | R5: per-heavy-melee proc — burst flavor |
| `spirit_continuous_proc` | — | 0.6 | adds | R5: short cd in a brawl = continuous flavor |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Superior Cooldown
- **normalized_name**: `superior_cooldown`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Superior_Cooldown

### Interpretation
T3 best raw CDR: +20% cooldown reduction passive, +4 OOC regen. On curve toward Transcendent Cooldown T4 25% = 2.0. The OOC regen is a free sustain bonus.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 20% | 20% | 20% | Passive |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC uptime |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cooldown_reduction` | 20% | 1.5 | adds | T3 best on curve toward 25% = 2.0 |
| `ability_spam` | — | 1.0 | adds | Lower cd = more casts |
| `multi_ability_focus` | — | 0.4 | adds | R4: CDR helps multi-cast kits — but Superior Cooldown is imbued |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued — attaches CDR to a chosen ability |
| `self_heal` | 1.2/sec | 0.5 | adds | Solid OOC regen |
| `continous_heal` | 1.2/sec | 0.5 | adds | R10 cadence partner |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Superior Duration
- **normalized_name**: `superior_duration`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Superior_Duration

### Interpretation
Cross-tier ceiling for `duration_dependant`: pure passive +28% ability duration, +8% bullet resist. The 2.0 anchor — Magic Carpet T4 at 15% is well below this even though it's the T4 best (sparse-tier rule).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusAbilityDurationPercent` | 28% | 28% | 28% | Passive — cross-tier ceiling |
| `BulletResist` | 8% | 8% | 8% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `duration_dependant` | 28% | 2.0 | adds | Cross-tier ceiling |
| `duration_dependant` | — | 1.5 | relies | Pure synergy — pays off only on duration-based kits |
| `ult_focused` | — | 0.5 | adds | Long ults benefit most |
| `bullet_resistance` | 8% | 0.4 | adds | Token defensive |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued — attaches duration to a chosen ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Surge of Power
- **normalized_name**: `surge_of_power`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Surge_of_Power

### Interpretation
Active imbue: 8s buff with +24 SP, +20% fire rate, +1.75 m/s MS, no shoot-walk/zoom-walk penalty. 14s cd → 57% uptime — very high. Hybrid gun-spirit booster designed for fight rotations.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `ImbuedTechPower` | 0 | 24 | ~13.7 | × 8/14 uptime |
| `FireRateBonus` | 0 | 20% | ~11.4% | × 8/14 uptime |
| `BonusMoveSpeed` | 0 | 1.75 m/s | ~1 m/s | × 8/14 uptime |
| `MoveWhileShootingSpeedPenaltyReductionPercent` | 0 | 100% | ~57% | × 8/14 uptime |
| `AbilityCooldown` | 14 | 14 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | ~13.7 | 1.0 | adds | R1: was spirit_power — solid amortized SP boost |
| `spirit_burst_damage` | — | 0.5 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.5 | adds | R2: general SP propagation |
| `fire_rate` | ~11.4% | 0.7 | adds | Modest amortized fire rate |
| `gun_continuous_damage` | — | 0.35 | adds | R2: fire-rate propagation |
| `gun_burst_damage` | — | 0.15 | adds | R2: fire-rate light burst |
| `horizontal_mobility` | 0.5 m/s | 0.4 | adds | Active MS × 0.5 weight |
| `bullet_evasion` | shoot-walk fix | 0.7 | adds | Shoot-walk penalty removal for 8s windows |
| `hybrid_damage_usage` | — | 1.5 | adds | Pure bullet/spirit hybrid item |
| `engage` | — | 0.5 | adds | Active fight-window setup |
| `multi_ability_focus` | — | 0.4 | adds | R4: general SP boost helps multiple abilities |
| `single_ability_focus` | — | -0.15 | adds | R4: helps less if narrowed to one ability |

---

## Tankbuster
- **normalized_name**: `tankbuster`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Tankbuster

### Interpretation
Anti-tank pure-damage proc: 8% of target's current HP + min 165 damage on charge-up cast, 14s cd. Charge-up mechanic — ready every 14s, fires next time you proc. +50 HP passive. Counter to high-HP targets — pure damage that scales with their HP pool.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 40 | 40 | per cast | Flat base damage |
| `MinimumDamage` | 165 | 165 | per cast | Minimum guaranteed |
| `CurrentHealthDamage` | 0 | 8% current HP | per cast | Anti-tank scaling |
| `ReProcLockoutTime` | 5 | 5 | — | (target re-proc lockout) |
| `AbilityChargeUpTime` | 14 | 14 | — | (timing) |
| `BonusHealth` | 50 | 50 | 50 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `pure_damage` | 165+ / 14s | 1.5 | adds | Pure damage ignoring resist — strong T3 |
| `spirit_damage` | 165+ proc | 0.7 | adds | R6: item literally deals spirit damage |
| `spirit_burst_damage` | 165+ proc | 1.0 | adds | R2: burst-window damage |
| `spirit_continuous_damage` | — | 0.2 | adds | R3 floor — mostly burst |
| `damage_sponge` | — | 1.5 | adds | Counter to high-HP targets — scales with their HP |
| `counter_importance` | — | 1.5 | adds | R13: strong tank-killer counter |
| `burst_damage` | 165+ proc | 1.0 | adds | Per-cd burst |
| `single_target` | — | 1.0 | adds | ST proc |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued/charge-style — one big proc per cycle |
| `high_max_hp` | 50 | 0.2 | adds | Token HP |
| `spirit_burst_proc` | per-cycle | 0.6 | adds | R5: 14s charge-up — burst-leaning |
| `spirit_continuous_proc` | — | 0.2 | adds | R5: cycles continuously over time |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Torment Pulse
- **normalized_name**: `torment_pulse`
- **tier**: 3 (3200 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Torment_Pulse

### Interpretation
Always-on AoE pulse: 25 spirit damage every 1.4s to all enemies in 9m radius. Passive +100 HP, +15% melee resist. ~18 DPS sustained AoE just by being near enemies — defining `aoe_cluster` continuous-damage item at T3.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DamagePulseAmount_Value` | 25 | 25 | ~18/sec | 25 / 1.4s, always on per enemy in radius |
| `DamagePulseRadius` | 9 m | 9 m | — | (radius) |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `MeleeResistPercent` | 15% | 15% | 15% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | ~18/sec | 0.9 | adds | R6: item literally deals continuous spirit damage |
| `spirit_continuous_damage` | ~18/sec | 1.5 | adds | T3 best sustained AoE spirit damage |
| `spirit_burst_damage` | — | 0.25 | adds | R3 floor — mostly continuous |
| `aoe_cluster` | 9m radius pulse | 1.5 | adds | Always-on AoE damage |
| `close_range` | — | 0.6 | adds | R11: 9m radius is close-range play |
| `close_to_team` | — | 0.4 | adds | Close-range pulse rewards team formation |
| `melee_resistance` | 15% | 0.7 | adds | Modest melee defense |
| `melee_damage` | — | 0.3 | adds | R12: close-range bruiser flavor |
| `engage` | — | 0.4 | adds | R11: aura forces close engagement |
| `grounded` | — | 0.3 | adds | R7: close-range pulse is grounded play |
| `high_max_hp` | 100 | 0.4 | adds | Modest T3 HP |
| `damage_sponge` | — | 0.5 | relies | Tanky frontline pays off |
| `farmer` | — | 0.4 | adds | Always-on AoE clears jungle camps efficiently |
| `spirit_continuous_proc` | always-on | 0.4 | adds | R5: always-on aura — continuous-leaning |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

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
| `gun_burst_damage` | — | 1.0 | adds | R2: per-shot damage propagation (0.5 × 2.0) |
| `gun_continuous_damage` | — | 0.6 | adds | R2: per-shot damage propagation (0.3 × 2.0) |
| `low_max_hp` | -15% | -0.5 | adds | One-time upfront cost; always present once purchased |
| `high_max_hp` | -15% | -0.5 | adds | Negative — direct HP penalty |
| `fire_rate` | ~25% | 1.0 | adds | +7% × ~3.5 average held stacks in a typical fight |
| `gun_continuous_damage` | — | 0.5 | adds | R2: fire-rate propagation also lifts sustained DPS |
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
| `gun_continuous_damage` | — | 0.75 | adds | R2: fire-rate heavy propagation (0.5 × 1.5) |
| `gun_burst_damage` | — | 0.3 | adds | R2: fire-rate light burst propagation |
| `hybrid_damage_usage` | — | 1.5 | adds | The entire mechanic rewards mixing gun + ability play |
| `ability_spam` | — | 1.0 | adds | Every cast refreshes stacks — frequent casting is heavily rewarded |
| `multi_ability_focus` | — | 1.0 | adds | R4: any ability or item cast triggers a stack, all slots qualify |
| `single_ability_focus` | — | -0.2 | adds | R4: broadest when you spam multiple abilities |
| `scaling_late` | — | 1.0 | adds | T4 stat-stick with ramp — rewards extended fights more than short ones |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

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
| `spirit_damage` | 30 + 15% mult | 2.0 | adds | R1 + user correction: was spirit_power — the 15% multiplier compounds heavily, so adds value is huge (user explicit: "needs allot more weight here") |
| `spirit_burst_damage` | — | 1.0 | adds | R2: general SP propagation (≈0.5 × 2.0) |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: general SP propagation |
| `spirit_damage` | 15% multiplier | 1.5 | relies | The 15% scaler rewards stacking SP from other sources — pure scaling synergy |
| `high_max_hp` | 75 | 0.5 | adds | Modest HP for T4 |
| `self_heal` | 1.2/sec | 0.4 | adds | 4/sec × 0.3 OOC uptime |
| `continous_heal` | 1.2/sec | 0.4 | adds | R10 cadence partner |
| `scaling_late` | — | 1.5 | adds | T4 cost, % scaler that compounds with other SP items, no early-game value |
| `ult_focused` | — | 0.5 | adds | Biggest spike per cast goes to highest-damage ability, usually the ult |
| `hybrid_damage_usage` | — | 0.5 | relies | Best on heroes who can leverage spirit power across multiple damage profiles |
| `multi_ability_focus` | — | 0.5 | adds | R4: general SP buffs the whole kit |
| `single_ability_focus` | — | -0.2 | adds | R4: helps less if narrowed |

### Correction
the 15% multiplier is huge, so the "adds" value needs allot more weight here because yes it depends on it but it more ADDS to it more. 

## Armor Piercing Rounds
- **normalized_name**: `armor_piercing_rounds`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Armor_Piercing_Rounds

### Interpretation
Pure passive T4 weapon item: +8% bullet damage, +60% bullet speed, 55% proc chance to apply armor-piercing on bullet hit (ignores bullet armor on proc). The proc effectively converts armored shots into raw damage — strong against tanky targets.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBulletSpeedPercent` | 60% | 60% | 60% | Passive (tier-flat) |
| `ProcChance` | 55% | 55% | 55% | Per-bullet proc rate |
| `BaseAttackDamagePercent` | 8% | 8% | 8% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resist_shred` | 55% AP proc | 1.5 | adds | Piercing armor on 55% of shots = effective shred against tanks |
| `bullet_damage` | 8% + proc value | 0.8 | adds | Sub-Glass Cannon 80% T4 ceiling |
| `gun_burst_damage` | — | 0.4 | adds | R2: per-shot damage propagation (0.5 × 0.8) |
| `gun_continuous_damage` | — | 0.25 | adds | R2: per-shot damage propagation (0.3 × 0.8) |
| `long_range` | 60% bullet speed | 1.0 | adds | Tier-flat 60% |
| `damage_sponge` | — | 1.0 | adds | Strong vs high-HP/armored targets |
| `bullet_proc` | per-shot | 1.0 | adds | Bullet-driven proc |
| `gun_continuous_proc` | per-shot 55% | 1.0 | adds | R5: high-frequency per-shot proc — continuous-leaning |
| `gun_burst_proc` | — | 0.5 | adds | R5: still procs per shot — burst flavor |
| `counter_importance` | — | 1.0 | adds | R13: anti-tank tool — bought specifically vs armored comps |
| `mid_range` | — | 0.4 | adds | Bullet speed helps mid-range too |

---

## Capacitor
- **normalized_name**: `capacitor`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Capacitor

### Interpretation
Active chain-lightning burst: 100 + 43 damage chains across 6 targets in 10m radius with 75% slow for 3s. 20% on-bullet proc chance for the chain effect. 40s cd. +5% fire rate passive. T4 AoE-burst chain damage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 100 + 43×6 chains | up to 358 burst | ~9/sec | Per cd, full chain |
| `ChainCount` | 6 | 6 | — | (chain hops) |
| `ProcChance` | 20% | 20% | 20% | Per-bullet proc for chain |
| `MaxSlowPercent` | 75% | 75% | ~22% | × 0.3 ST × 3/40 amortized |
| `BonusFireRate` | 5% | 5% | 5% | Passive |
| `AbilityCooldown` | 40 | 40 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 358 burst / 40s | 0.8 | adds | R6: item literally deals spirit damage |
| `spirit_burst_damage` | 358 burst / 40s | 1.0 | adds | Per-cd AoE chain burst |
| `spirit_continuous_damage` | — | 0.3 | adds | R2: per-bullet trigger gives some continuous flavor |
| `aoe_cluster` | chain 6 targets | 1.5 | adds | Chains across clusters of enemies |
| `movement_slow` | 75% × 3s | 1.0 | adds | Big slow on chained targets |
| `bullet_proc` | 20% chain | 1.0 | adds | Per-bullet proc trigger |
| `gun_continuous_proc` | per-shot 20% | 0.7 | adds | R5: per-bullet 20% proc — continuous-leaning |
| `gun_burst_proc` | — | 0.4 | adds | R5: bullet-triggered with big payoff = burst flavor too |
| `spirit_burst_proc` | — | 0.5 | adds | R5: chain payoff per-trigger |
| `engage` | — | 0.5 | adds | Chain initiator |
| `fire_rate` | 5% | 0.2 | adds | Token T4 fire rate |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches the chain to a chosen cast |
| `hybrid_damage_usage` | — | 1.2 | adds | Bullet-trigger spirit damage = hybrid |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Crippling Headshot
- **normalized_name**: `crippling_headshot`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Crippling_Headshot

### Interpretation
T4 ultimate resist-shred + anti-heal package on headshot: -16 bullet resist, -16 spirit resist, -35% heal received/regen for 12s. Diminishing returns on repeat applications. Passive +125 HP. Cross-tier 2.0 anchor for both `bullet_resist_shred` and `spirit_resist_shred`. Lights up a target so the team can collapse on them.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `BulletResistReduction` | -16 | -16 | ~-12 | High uptime with 12s linger × diminishing |
| `MagicResistReduction` | -16 | -16 | ~-12 | Same |
| `HealAmpReceivePenaltyPercent` | -35 | -35 | -35 | Same uptime |
| `HealAmpRegenPenaltyPercent` | -35 | -35 | -35 | Same |
| `DebuffDuration` | 12 | 12 | — | (linger) |
| `DiminishingMultiplier` | 0.5 | 0.5 | — | (subsequent applications halved) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resist_shred` | -12 effective | 2.0 | adds | Cross-tier ceiling |
| `spirit_resist_shred` | -12 effective | 2.0 | adds | Cross-tier ceiling |
| `anti_heal` | -35% | 1.0 | adds | Solid; sub-Spirit Burn -70% |
| `headshot_damage` | — | 1.0 | relies | Requires headshots to apply |
| `hybrid_damage_usage` | — | 1.5 | adds | Both bullet+spirit shred — defines hybrid setup |
| `counter_importance` | — | 1.5 | adds | R13: the lit-up target enables team focus |
| `assist_importance` | — | 1.2 | adds | R10: shredded target benefits the team's follow-up |
| `high_max_hp` | 125 | 0.5 | adds | Modest T4 HP |
| `long_range` | — | 0.5 | adds | Headshot mechanic favors long-range gunners |
| `gun_burst_proc` | per-headshot | 0.6 | adds | R5: long-cd headshot proc — burst-leaning |
| `gun_continuous_proc` | — | 0.3 | adds | R5: still procs each headshot |
| `single_target` | — | 0.4 | adds | Headshot proc — single-target lit-up |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Crushing Fists
- **normalized_name**: `crushing_fists`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Crushing_Fists

### Interpretation
T4 melee package: +20% melee damage, +25 heavy melee bonus, +60% melee distance scale, +12% bullet resist passive. Per-melee proc applies -4 bullet resist to target (stacking to 6 = -24 max) with 8s linger and a 0.5s stun. Heavy melee × 2 multiplier. Ultimate melee bruiser glue.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 12% | 12% | 12% | Passive |
| `BonusMeleeDamagePercent` | 20% | 20% | 20% | Passive |
| `MeleeDistanceScale` | 60% | 60% | 60% | Passive |
| `BonusHeavyMeleeDamage` | 25 | 25 | 25 | Per heavy melee |
| `BulletResistReduction` | -4 (per stack) | -24 (full) | ~-15 | × 0.6 avg stack maintenance |
| `StunDuration` | 0.5 | 0.5 | per cycle | Mini-stun on heavy melee |
| `MaxStacks` | 6 | 6 | — | (cap) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `melee_damage` | 20% + 25 heavy | 2.0 | adds | Cross-tier ceiling for melee damage |
| `melee_damage` | — | 1.5 | relies | Heavy synergy with melee-focused heroes |
| `bullet_resist_shred` | ~-15 stacked | 1.5 | adds | Strong melee-triggered shred |
| `stun` | 0.5s/7s cd | 0.7 | adds | Mini-stun per melee cycle |
| `engage` | 60% reach | 1.5 | adds | R11: extended melee = strong gap-closer |
| `bullet_resistance` | 12% | 0.7 | adds | Token defensive |
| `melee_resistance` | — | 1.0 | adds | Item is built around melee combat — likely also boosts melee resist via the package |
| `close_range` | — | 0.7 | adds | R11: melee item — close range mandatory |
| `grounded` | — | 0.5 | adds | R7: melee mechanic realized while grounded |
| `bullet_damage` | — | 0.2 | adds | R3 weapon baseline + the package implies some gun lift |
| `gun_burst_damage` | — | 0.1 | adds | R3 floor |
| `gun_continuous_damage` | — | 0.07 | adds | R3 floor |
| `gun_burst_proc` | per-melee | 0.4 | adds | R5 (using gun_ for weapon-cat): per-melee cycle proc — burst-leaning |
| `gun_continuous_proc` | — | 0.5 | adds | R5: stacks build up over a brawl — continuous-leaning |

---

## Frenzy
- **normalized_name**: `frenzy`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Frenzy

### Interpretation
Lowhp-gated fervor proc: passive +15% fire rate, +160 HP. When you drop below 50% HP, gain 10s fervor window: +4 m/s MS, +40% fire rate, +30% status resist. 16s cd between procs. Clutch sustained-fire burst when you're in danger — sticks the carrier in fights longer.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 15% | 15% | 15% | Passive |
| `BonusHealth` | 160 | 160 | 160 | Passive |
| `FervorFireRate` | 0 | 40% | ~10% | × 0.25 lowhp uptime |
| `FervorMovespeed` | 0 | 4 m/s | ~1 m/s | × 0.25 lowhp uptime |
| `FervorStatusResistancePercent` | 0 | 30% | ~7.5% | × 0.25 lowhp uptime |
| `LowHealthThreshold` | 50% | 50% | — | (gate) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `fire_rate` | 15% + ~10% lowhp | 1.5 | adds | Strong combined T4 fire rate |
| `gun_continuous_damage` | — | 0.75 | adds | R2: fire-rate heavy propagation (0.5 × 1.5) |
| `gun_burst_damage` | — | 0.3 | adds | R2: fire-rate light burst propagation |
| `horizontal_mobility` | 0.5 m/s amortized | 0.5 | adds | Lowhp move burst × 0.5 |
| `cc_resist` | ~7.5% | 0.5 | adds | Lowhp status resist |
| `high_max_hp` | 160 | 0.7 | adds | Modest T4 HP |
| `damage_sponge` | — | 0.7 | relies | Lowhp-gated rewards staying in fights tanky |
| `scaling_late` | — | 0.5 | adds | Lowhp-window scaling shines in long fights |
| `self_heal` | — | 0.3 | relies | R10: lowhp gate rewards sustain to keep fighting in the window |
| `engage` | — | 0.4 | adds | Lowhp burst supports aggressive trades when you're in trouble |
| `escape` | — | 0.4 | adds | Same buff helps escape when low |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Lucky Shot
- **normalized_name**: `lucky_shot`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Lucky_Shot

### Interpretation
25% chance per bullet to deal +100% (double) damage. +30% ammo. Effective bullet damage ≈ +25% averaged. Pure stat stick — gun-focus damage RNG with bigger mags. Cross-tier note: 30% ammo is T4-best but well below T2 Titanic 100% (sparse-tier).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `ProcChance` | 25% | 25% | 25% | Per bullet |
| `CritDamagePercent` | 100% | 100% | +25% avg | × proc chance |
| `BonusClipSizePercent` | 30% | 30% | 30% | Passive |
| `Radius` | 1 m | 1 m | — | (proc detection?) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | +25% avg | 1.3 | adds | Strong RNG damage scaler |
| `gun_burst_damage` | crit RNG | 1.0 | adds | R2: lucky crit can swing burst trades — burst-leaning |
| `gun_continuous_damage` | — | 0.5 | adds | R2: per-shot RNG also adds to sustained DPS |
| `magazine_size_dependant` | 30% | 0.5 | adds | Sub-Titanic 100% (sparse-tier — T4 best but well below ceiling) |
| `bullet_proc` | per shot | 0.5 | adds | Per-bullet RNG proc |
| `gun_continuous_proc` | 25%/shot | 0.7 | adds | R5: 25% per-shot proc — continuous-leaning |
| `gun_burst_proc` | — | 0.5 | adds | R5: each proc IS a damage burst |

---

## Ricochet
- **normalized_name**: `ricochet`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Ricochet

### Interpretation
T4 cleave: bullets bounce to 2 additional targets within 13m, dealing 65% of original damage to each. +18% fire rate passive. Effectively multiplies your gun DPS by ~2.3× against clustered enemies. Defines the multi-target gun-DPS niche.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `RicochetDamagePercent` | 65% | 65% | 65% | Per bounce |
| `RicochetRadius` | 13 m | 13 m | — | (bounce range) |
| `RicochetTargets` | 2 | 2 | — | (bounce count) |
| `BonusFireRate` | 18% | 18% | 18% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_damage` | 65% × 2 cleave | 1.5 | adds | Strong cleave multiplier — ~2.3× DPS vs grouped targets |
| `gun_burst_damage` | — | 0.75 | adds | R2: per-shot damage propagation (0.5 × 1.5) |
| `gun_continuous_damage` | — | 1.0 | adds | R2: cleave + fire-rate stack for big sustained DPS lift |
| `aoe_cluster` | 13m bounce | 2.0 | adds | Cross-tier ceiling for gun-cleave AoE |
| `fire_rate` | 18% | 0.7 | adds | Sub-Blood Tribute 35% T3 ceiling |
| `close_to_team` | — | 0.3 | adds | Cleave shines when enemies are grouped |
| `farmer` | — | 0.5 | adds | Cleave devastates jungle camps |
| `lane_pusher` | — | 0.5 | adds | Cleave on lane creeps |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline (rolled into top row, but explicit floor) |

---

## Silencer
- **normalized_name**: `silencer`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Silencer

### Interpretation
T4 bullet-built-up silence: shoot ~5 hits at an enemy to build up; on the next bullet they're silenced for 2.5s + take -25% tech damage for 6s. 10s immunity per target after silence ends. +15% spirit resist passive. T4 anti-caster gun-driven silence — uses bullets to apply hard CC.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 15% | 15% | 15% | Passive |
| `TechDamageReduction` | -25% | -25% | -25% | Applied debuff during 6s window |
| `SilenceDuration` | 2.5 | 2.5 | per cycle | After 5-shot buildup |
| `BuildUpPerShot` | 1.04 | 1.04 | — | (~5 shots to silence) |
| `ImmunityDuration` | 10 | 10 | — | (target immunity post-silence) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `silence` | 2.5s/12.5s ST | 1.5 | adds | Strong bullet-built silence (Silence Wave T3 is cross-tier AoE 2.0) |
| `bullet_proc` | per-shot buildup | 1.0 | adds | Built up via bullets |
| `gun_continuous_proc` | per-shot | 0.7 | adds | R5: per-shot buildup — continuous-leaning |
| `gun_burst_proc` | — | 0.4 | adds | R5: triggers a big effect after buildup — burst flavor |
| `interrupt` | 2.5s silence | 1.0 | adds | Silences cast attempts |
| `spirit_resistance` | 15% | 0.7 | adds | Decent T4 spirit resist |
| `spirit_burst_resistance` | — | 0.3 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.3 | adds | R2 analogue |
| `spirit_damage` | — | 0.5 | relies | Pairs well with spirit-damage builds for the -25% tech-damage application |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to ability-cast heroes |
| `debuff` | — | 0.7 | adds | Silence is a major cleansable debuff |
| `assist_importance` | — | 0.6 | adds | Silencing helps team focus an enemy caster |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Spiritual Overflow
- **normalized_name**: `spiritual_overflow`
- **tier**: 4 (6400 souls)
- **category**: Weapon
- **wiki**: https://deadlock.wiki/Spiritual_Overflow

### Interpretation
T4 hybrid bullet→spirit conversion: cross-tier 2.0 anchor for `BonusSpirit` at +40. After 5-shot buildup, gain 15s active: +32% fire rate, +16% spirit lifesteal, +15% ability duration. Defines the late-game hybrid carry profile — gun damage feeds spirit power, spirit power feeds ability burst.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusSpirit` | 40 | 40 | 40 | Passive — cross-tier ceiling |
| `AbilityLifestealPercentHero` | 0 | 16% | ~8% | Active window roughly half-uptime |
| `BonusFireRate` | 0 | 32% | ~16% | Same |
| `BonusAbilityDurationPercent` | 0 | 15% | ~7.5% | Same |
| `BuildUpPerShot` | 0.75 | 0.75 | — | (~7 shots to active) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 40 | 2.0 | adds | R1: was spirit_power — cross-tier ceiling for BonusSpirit |
| `spirit_burst_damage` | — | 1.0 | adds | R2: general SP propagation (0.5 × 2.0) |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: general SP propagation |
| `hybrid_damage_usage` | — | 2.0 | adds | Defining hybrid item — bullet damage fuels spirit damage |
| `fire_rate` | ~16% | 1.0 | adds | Amortized active fire rate |
| `gun_continuous_damage` | — | 0.5 | adds | R2: fire-rate propagation |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire-rate light burst |
| `spirit_lifesteal` | ~8% | 0.7 | adds | Active-window spirit sustain |
| `self_heal` | — | 0.5 | adds | R10: spirit lifesteal contributes self-sustain |
| `continous_heal` | — | 0.4 | adds | R10 cadence partner |
| `duration_dependant` | ~7.5% | 0.5 | adds | Modest amortized duration |
| `hybrid_damage_usage` | — | 1.5 | relies | Pure synergy with hybrid kits |
| `multi_ability_focus` | — | 0.4 | adds | R4: general SP buffs the kit |
| `engage` | — | 0.4 | adds | Active commit window favors initiating |
| `bullet_damage` | — | 0.15 | adds | R3 weapon baseline |

---

## Cheat Death
- **normalized_name**: `cheat_death`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Cheat_Death

### Interpretation
Anti-execute insurance: passive +200 HP, +15% bullet resist. When killed, instead trigger 4.5s death-immunity with -60% damage reduction (you take 60% less while immune), but -60% heal amp/regen during the window. 90s cd. Cross-tier defining anti-burst protection.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 200 | 200 | 200 | Passive |
| `BulletResist` | 15% | 15% | 15% | Passive |
| `DeathImmunityDuration` | 4.5 | 4.5 | per cd | Triggered on fatal damage |
| `DeathImmunityDamageReduction` | -60% (reduction) | -60% | -60% | (Listed as -60 because the effect is reducing damage taken — this is a BENEFIT, not a downside; it's a self-applied damage-reduction during immunity) |
| `HealAmpReceivePenaltyPercent` | -60% | -60% | -60% | (Downside during immunity — can't heal back as fast) |
| `AbilityCooldown` | 90 | 90 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `burst_resistance` | 4.5s immunity | 2.0 | adds | Cross-tier ceiling for anti-execute / anti-burst |
| `gun_burst_resistance` | — | 1.0 | adds | R2 analogue: catches gun-burst executes |
| `spirit_burst_resistance` | — | 1.0 | adds | R2 analogue: catches spirit-burst executes |
| `damage_sponge` | 200 + cheat | 1.5 | adds | HP plus death-save = ultimate tank insurance |
| `high_max_hp` | 200 | 0.8 | adds | Modest T4 HP (Fortitude T3 still 2.0 anchor at 375) |
| `bullet_resistance` | 15% | 0.7 | adds | Sub-Bullet Resilience 30% ceiling |
| `damage_sponge` | — | 1.0 | relies | Tankier carries get more out of the cheat window |
| `anti_heal` | -60% on self | -0.5 | adds | Listed as downside — your healing is gimped during the immunity window |
| `counter_importance` | — | 1.0 | adds | R13: bought specifically vs burst/execute comps |
| `escape` | — | 0.7 | adds | Cheat-death window is also a survival/escape tool |
| `high_max_hp` | — | 0.4 | relies | R8: HP cushion extends the survival window |

---

## Colossus
- **normalized_name**: `colossus`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Colossus

### Interpretation
T4 tank mode active: grow large (20% bigger hitbox) for 7s, gaining +25% base HP, +15% bullet damage, +35% bullet/spirit resist, +30% melee damage, and 30% slow + 25% dash reduction to enemies in 14m AoE. 37s cd → 19% uptime. Tank/initiator hybrid. Cross-tier 2.0 for `BonusBaseHealth` (only Colossus has this).

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusBaseHealth` | 0 | 25% | ~4.7% | × 7/37 active uptime |
| `BaseAttackDamagePercent` | 0 | 15% | ~2.8% | Same |
| `BuffBulletResist` | 0 | 35% | ~6.6% | Same |
| `BuffTechResist` | 0 | 35% | ~6.6% | Same |
| `SlowPercent` | 0 | 30% | ~5.7% | × 7/37 amortized |
| `BonusMeleeDamagePercent` | 0 | 30% | ~5.7% | Same |
| `Radius` | 14 m | 14 m | — | (aura radius) |
| `AbilityCooldown` | 37 | 37 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `high_max_hp` | +25% base HP active | 2.0 | adds | Cross-tier ceiling for BonusBaseHealth (unique stat) |
| `damage_sponge` | active tank mode | 1.5 | adds | Massive active resist boost |
| `bullet_resistance` | ~6.6% amortized | 1.0 | adds | Active +35% is huge in window |
| `gun_burst_resistance` | — | 0.5 | adds | R2 analogue |
| `gun_continuous_resistance` | — | 0.5 | adds | R2 analogue |
| `spirit_resistance` | ~6.6% amortized | 1.0 | adds | Same |
| `spirit_burst_resistance` | — | 0.5 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.5 | adds | R2 analogue |
| `movement_slow` | ~5.7% | 0.5 | adds | AoE slow on active |
| `melee_damage` | ~5.7% | 0.3 | adds | Active melee bonus + R12: bruiser commit favors melee |
| `bullet_damage` | ~2.8% | 0.3 | adds | Active bullet bonus |
| `engage` | growth + AoE slow | 1.5 | adds | R11: initiation tool |
| `burst_resistance` | active commit | 1.5 | adds | Burst-window tankiness |
| `aoe_cluster` | 14m | 0.5 | adds | AoE slow catches grouped enemies |
| `large_hitbox` | 20% bigger | -0.4 | adds | Self-applied: bigger hitbox = easier to hit |
| `close_range` | — | 0.4 | adds | R11: bruiser/melee playstyle |
| `grounded` | — | 0.4 | adds | R7: tank growth is grounded play |
| `counter_importance` | — | 0.7 | adds | R13: anti-burst commit useful vs nuke comps |

---

## Divine Barrier
- **normalized_name**: `divine_barrier`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Divine_Barrier

### Interpretation
T4 ally super-buff: cast on an ally at 40m, give 600 HP barrier, 50% CDR on others (??), +2.75 m/s MS, +10% range/radius for 6s. 45s cd. Massive support active — far stronger than Guardian Ward T2 across the board. Defines T4 `ally_buff` ceiling.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CombatBarrier` | 0 | 600 | ~80 HP | × 6/45 amortized |
| `CooldownReductionPctOnOthers` | 0 | 50% | ~6.7% | × 6/45 amortized |
| `BonusMoveSpeed` (active, ally) | 0 | 2.75 m/s | ~0.37 m/s | × 6/45 uptime |
| `TechRangeMultiplier` (ally) | 0 | 10% | ~1.3% | × 6/45 uptime |
| `TechRadiusMultiplier` (ally) | 0 | 10% | ~1.3% | × 6/45 uptime |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `ally_buff` | 600 + CDR + MS | 2.0 | adds | Cross-tier ceiling for ally-buff |
| `team_heal` | 600 barrier | 1.5 | adds | Big barrier on ally counts as heal proxy |
| `burst_heal` | 600 barrier | 1.2 | adds | R10: barrier IS a burst-heal-equivalent |
| `continous_heal` | — | 0.4 | adds | R10 blend partner |
| `cooldown_reduction` | ~6.7% | 0.5 | adds | CDR on others (not self) |
| `assist_importance` | — | 2.0 | adds | R10: pure support item — enables a teammate's burst window |
| `close_to_team` | — | 0.5 | adds | Requires being near teammate at cast time |
| `multi_ability_focus` | — | 0.4 | adds | R4: range/radius helps multiple abilities |
| `high_max_hp` | — | 0.4 | relies | R8: barrier scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |
| `farmer` | — | 0.3 | adds | R10: ally heal pays off in lane-clear support roles too |

---

## Diviners Kevlar
- **normalized_name**: `diviners_kevlar`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Diviners_Kevlar

### Interpretation
T4 spirit tank: passive +35 SP (cross-tier ceiling), +15% ability duration, 1000 HP combat barrier on a 20s buff (presumably triggered by spirit damage; 40s cd). The +35 SP is the cross-tier 2.0 anchor alongside Boundless Spirit's 30+15% multiplier.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 35 | 35 | 35 | Passive — cross-tier ceiling |
| `BonusAbilityDurationPercent` | 15% | 15% | 15% | Passive |
| `CombatBarrier` | 0 | 1000 | ~500 | × 20/40 amortized |
| `BuffDuration` | 20 | 20 | — | (barrier window) |
| `AbilityCooldown` | 40 | 40 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 35 | 2.0 | adds | R1: was spirit_power — cross-tier ceiling |
| `spirit_burst_damage` | — | 1.0 | adds | R2: general SP propagation (0.5 × 2.0) |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: general SP propagation |
| `burst_resistance` | 1000 barrier | 1.5 | adds | Massive reactive barrier amortized over fights |
| `spirit_burst_resistance` | — | 0.8 | adds | R2 analogue: barrier catches spirit burst |
| `damage_sponge` | — | 1.0 | adds | Barrier-stacking sustain |
| `burst_heal` | 1000 barrier | 1.0 | adds | R10: barrier counts as burst-heal-equivalent |
| `continous_heal` | — | 0.3 | adds | R10 blend partner |
| `duration_dependant` | 15% | 0.7 | adds | Modest amortized duration (cross-tier 2.0 Superior Duration 28%) |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued — attaches duration to a chosen ability |
| `multi_ability_focus` | — | 0.3 | adds | R4: big SP also broadly buffs the kit |
| `high_max_hp` | — | 0.4 | relies | R8: barrier scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Healing Tempo
- **normalized_name**: `healing_tempo`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Healing_Tempo

### Interpretation
T4 healer's ultimate buff: passive +1.25 m/s MS, +6 in-combat HP regen, +10% spirit resist, +4 OOC regen, +25% heal amp on cast/regen. Mechanic: when you heal someone (any heal source), gain +35% fire rate for 7s. Defines healer-as-DPS-enabler — every heal you cast also makes you shoot harder.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` (on heal) | 0 | 35% | ~25% | High uptime if regularly healing |
| `BonusHealthRegen` | 6/sec | 6/sec | 6/sec | Passive in-combat |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC |
| `BonusMoveSpeed` | 1.25 m/s | 1.25 m/s | 1.25 m/s | Passive |
| `TechResist` | 10% | 10% | 10% | Passive |
| `HealAmpCastPercent` | 25% | 25% | 25% | Passive |
| `HealAmpRegenPercent` | 25% | 25% | 25% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `self_heal` | 6/sec + 25% amp | 1.5 | adds | Strong sustain (cross-tier 2.0 = Juggernaut 8/sec) |
| `continous_heal` | 6/sec | 1.5 | adds | Same under cadence |
| `burst_heal` | — | 0.5 | adds | R10 blend partner: 25% amp boosts burst heals too |
| `fire_rate` | ~25% | 1.5 | adds | T3-tier fire rate on a vitality item |
| `gun_continuous_damage` | — | 0.75 | adds | R2: fire-rate heavy propagation |
| `gun_burst_damage` | — | 0.3 | adds | R2: fire-rate light burst |
| `team_heal` | amp 25% | 1.0 | adds | Heal amp helps received heals |
| `horizontal_mobility` | 1.25 m/s | 0.8 | adds | In-fight MS |
| `assist_importance` | — | 1.5 | adds | R10: item designed to enable healer/support roles |
| `self_heal` | — | 1.0 | relies | Heal-amp synergy with healer kits |
| `farmer` | — | 0.4 | adds | R10+R14: heal + MS helps jungle clears |
| `damage_sponge` | — | 0.4 | relies | R10: continuous heal rewards sustained-damage absorbers |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion |
| `spirit_resistance` | 10% | 0.5 | adds | Token defensive |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Indomitable
- **normalized_name**: `indomitable`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Indomitable

### Interpretation
T4 anti-CC: passive +8% bullet resist, +8% spirit resist. When hard CC'd (stun/silence/disarm), pop a 325 HP barrier and gain CC immunity for 10s. 55s cd. -20% cd on subsequent procs. Cross-tier ceiling for `cc_resist` insurance — completely shrugs off the next hard CC.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletResist` | 8% | 8% | 8% | Passive |
| `TechResist` | 8% | 8% | 8% | Passive |
| `VexBarrierCombatBarrier_Value` | 0 | 325 | ~59 | × 10/55 amortized |
| `CooldownReductionOnProc` | 20 | 20 | — | (-20% cd on subsequent procs) |
| `AbilityDuration` | 10 | 10 | — | (immunity window) |
| `AbilityCooldown` | 55 | 55 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cc_resist` | 10s immunity | 2.0 | adds | Cross-tier ceiling — outright CC immunity |
| `debuff_resistance` | — | 1.5 | adds | Hard-CC immunity |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to CC-stacking comps |
| `burst_resistance` | 325 barrier | 0.7 | adds | Amortized barrier |
| `burst_heal` | 325 barrier | 0.5 | adds | R10: barrier counts as burst-heal-equivalent |
| `bullet_resistance` | 8% | 0.4 | adds | Token defensive |
| `spirit_resistance` | 8% | 0.4 | adds | Token |
| `escape` | — | 0.5 | adds | CC immunity is a strong escape tool |
| `high_max_hp` | — | 0.3 | relies | R8: barrier scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Infuser
- **normalized_name**: `infuser`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Infuser

### Interpretation
T4 spirit-lifesteal active: 6s burst with +70% spirit lifesteal (cross-tier max), +30 SP, +100 HP, +10% spirit resist. Passive +13% spirit lifesteal. 30s cd → 20% uptime. Defines burst-spirit-sustain combos.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityLifestealPercentHeroPassive` | 13% | 13% | 13% | Passive |
| `AbilityLifestealPercentHero` (active) | 0 | 70% | ~14% | × 6/30 amortized; full 70% in 6s windows |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `BonusSpirit` | 0 | 30 | ~6 | × 6/30 active uptime |
| `TechResist` | 10% | 10% | 10% | Passive |
| `AbilityCooldown` | 30 | 30 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_lifesteal` | 13% + 70% active | 1.5 | adds | T4 best (Leech 25% passive is the cleaner ceiling); Infuser is gated active |
| `burst_heal` | 70% active window | 1.0 | adds | Big sustain in 6s windows |
| `continous_heal` | — | 0.7 | adds | R10 cadence partner: passive 13% lifesteal sustains continuously |
| `self_heal` | active spirit sustain | 1.5 | adds | Strong burst sustain on cd |
| `spirit_damage` | 30 active | 0.5 | adds | R1: was spirit_power — active SP burst |
| `spirit_burst_damage` | — | 0.4 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.4 | adds | R2: general SP propagation |
| `spirit_damage` | — | 1.0 | relies | Pays off massively on ability-heavy heroes |
| `spirit_resistance` | 10% | 0.5 | adds | Token defensive |
| `engage` | — | 0.5 | adds | Active commit window enables aggressive trades |
| `high_max_hp` | 100 | 0.4 | adds | Modest T4 HP |
| `high_max_hp` | — | 0.5 | relies | R8: lifesteal scales with HP cushion |
| `damage_sponge` | — | 0.4 | relies | R10: rewards sustained-damage builds |
| `multi_ability_focus` | — | 0.4 | adds | R4: general SP buffs the kit |
| `farmer` | — | 0.3 | adds | R10: spirit lifesteal heals during ability jungle clears |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Inhibitor
- **normalized_name**: `inhibitor`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Inhibitor

### Interpretation
T4 enemy-suppression: bullet build-up debuff applies -30% outgoing damage and -40% heal received/regen for 5s. Passive +10% bullet damage, +150 HP. Effectively gimps an enemy carry's DPS and sustain during the build-up window — bullet-driven counter to fed heroes.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` | 150 | 150 | 150 | Passive |
| `BaseAttackDamagePercent` | 10% | 10% | 10% | Passive |
| `OutgoingDamagePenaltyPercent` | -30% | -30% | -30% | Applied to target |
| `HealAmpReceivePenaltyPercent` | -40% | -40% | -40% | Applied to target |
| `HealAmpRegenPenaltyPercent` | -40% | -40% | -40% | Applied to target |
| `DebuffDuration` | 5 | 5 | — | (debuff window) |
| `BuildUpDuration` | 5 | 5 | — | (~6.5 shots to apply) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `anti_heal` | -40% | 1.5 | adds | Strong anti-heal; sub-Spirit Burn -70% 2.0 |
| `bullet_proc` | per-shot buildup | 1.0 | adds | Bullet-driven debuff |
| `gun_continuous_proc` | per-shot | 0.7 | adds | R5: per-shot buildup — continuous-leaning |
| `gun_burst_proc` | — | 0.4 | adds | R5: triggers a big effect after buildup |
| `debuff` | -30% outgoing dmg | 1.5 | adds | Major outgoing-damage debuff |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to fed enemy carries |
| `assist_importance` | — | 1.0 | adds | R10: gimping enemy carry helps the whole team |
| `bullet_damage` | 10% | 0.4 | adds | Token T4 weapon damage |
| `gun_burst_damage` | — | 0.2 | adds | R2: per-shot damage light propagation |
| `gun_continuous_damage` | — | 0.15 | adds | R2: per-shot damage light propagation |
| `high_max_hp` | 150 | 0.7 | adds | Modest T4 HP |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Juggernaut
- **normalized_name**: `juggernaut`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Juggernaut

### Interpretation
Cross-tier 2.0 anchor for both `continous_heal` (+8 HP/sec) and `fire_rate_slow` (-36% to attackers, passive aura). +25% melee resist, +50% slow resist, +2 m/s in-fight MS. T4 ultimate tank — laughs at sustained fire while regenerating.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealthRegen` | 8/sec | 8/sec | 8/sec | Passive — cross-tier ceiling |
| `MeleeResistPercent` | 25% | 25% | 25% | Passive |
| `SlowResistancePercent` | 50% | 50% | 50% | Passive |
| `FireRateSlow` | 36% | 36% | -36% | Passive aura on attackers |
| `FireRateSlowDuration` | 4 | 4 | — | (linger per attack) |
| `BonusMoveSpeed` | 2 m/s | 2 m/s | 2 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `continous_heal` | 8/sec | 2.0 | adds | Cross-tier ceiling |
| `self_heal` | 8/sec | 2.0 | adds | Same value |
| `burst_heal` | — | 0.4 | adds | R10 blend partner: big regen accumulates into meaningful chunks |
| `fire_rate_slow` | -36% aura | 2.0 | adds | Cross-tier ceiling for fire_rate_slow |
| `disarm` | aura | 1.5 | adds | Strong soft disarm on attackers |
| `melee_resistance` | 25% | 1.0 | adds | Solid melee defense |
| `cc_resist` | 50% | 1.5 | adds | High slow resist |
| `horizontal_mobility` | 2 m/s | 1.3 | adds | In-fight MS |
| `damage_sponge` | — | 1.5 | adds | Item is built for soaking sustained fire |
| `damage_sponge` | — | 0.5 | relies | R10: rewards sustained-damage absorbers |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to gun-DPS comps |
| `assist_importance` | — | 1.0 | adds | Aura debuff helps the whole team |
| `close_to_team` | — | 0.5 | adds | Aura works on attackers in range |
| `engage` | — | 0.6 | adds | MS + tank stats favor frontline initiation |
| `farmer` | — | 0.4 | adds | R14: in-fight MS + regen helps jungle |
| `high_max_hp` | — | 0.5 | relies | R8: heal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Leech
- **normalized_name**: `leech`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Leech

### Interpretation
T4 dual-lifesteal stat stick: cross-tier 2.0 anchor for both `bullet_lifesteal` (+25%) AND `spirit_lifesteal` (+25% passive). +12% bullet damage, +12 SP, +160 HP. The defining "everything-heals-you" item for hybrid carries.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 12 | 12 | 12 | Passive |
| `AbilityLifestealPercentHero` | 25% | 25% | 25% | Passive — cross-tier ceiling |
| `BulletLifestealPercent` | 25% | 25% | 25% | Passive — cross-tier ceiling |
| `BaseAttackDamagePercent` | 12% | 12% | 12% | Passive |
| `BonusHealth` | 160 | 160 | 160 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_lifesteal` | 25% | 2.0 | adds | Cross-tier ceiling |
| `spirit_lifesteal` | 25% | 2.0 | adds | Cross-tier ceiling (passive variant; Infuser 70% is active) |
| `self_heal` | dual lifesteal | 1.5 | adds | Combined gun+ability sustain |
| `continous_heal` | — | 1.0 | adds | R10 cadence partner: dual lifesteal sustains continuously |
| `burst_heal` | — | 0.5 | adds | R10 blend partner: big hits convert to bigger heals |
| `hybrid_damage_usage` | — | 1.5 | adds | Item built for hybrid carries |
| `bullet_damage` | 12% | 0.5 | adds | Token T4 weapon damage |
| `gun_burst_damage` | — | 0.25 | adds | R2: per-shot damage light propagation |
| `gun_continuous_damage` | — | 0.15 | adds | R2: per-shot damage light propagation |
| `spirit_damage` | 12 | 0.4 | adds | R1: was spirit_power — token T4 SP |
| `spirit_burst_damage` | — | 0.2 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.2 | adds | R2: general SP propagation |
| `high_max_hp` | 160 | 0.7 | adds | Modest T4 HP |
| `high_max_hp` | — | 0.5 | relies | R8: lifesteal scales with HP cushion |
| `damage_sponge` | — | 0.5 | relies | R10: rewards sustained-damage builds |
| `farmer` | — | 0.4 | adds | R10: dual lifesteal heals during jungle clears |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Phantom Strike
- **normalized_name**: `phantom_strike`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Phantom_Strike

### Interpretation
T4 engage/gap-closer: teleport to target at 25m, deal 75 impact damage + 50% slow for 3s. Active grants the carrier +8 SP, +15% bullet damage for the next attacks (likely during slow window). 35s cd. Versatile pick tool — closes distance, slows, and buffs follow-up damage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` (active) | 0 | 8 | ~0.7 | × 3/35 amortized |
| `BaseAttackDamagePercent` (active) | 0 | 15% | ~1.3% | Same |
| `SlowPercent` | 0 | 50% | ~4.3% | × 3/35 amortized |
| `ImpactDamage_Value` | 75 | 75 | ~2.1/sec | 75 / 35s amortized |
| `AbilityCastRange` | 25 m | 25 m | — | (teleport range) |
| `AbilityCooldown` | 35 | 35 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `engage` | 25m teleport | 2.0 | adds | Cross-tier ceiling for engage — instant teleport to target |
| `horizontal_mobility` | active reposition | 1.5 | adds | Massive blink-style mobility |
| `vertical_mobility` | — | 0.5 | adds | Teleport can clear vertical obstacles too |
| `displace` | teleport | 1.0 | adds | Self-displace tool |
| `movement_slow` | ~4.3% | 0.3 | adds | Amortized slow on target |
| `spirit_damage` | 75 impact | 0.3 | adds | R6: item literally deals impact damage |
| `spirit_burst_damage` | 75 impact | 0.5 | adds | Token impact burst |
| `bullet_damage` | ~1.3% active | 0.3 | adds | Active +15% bullet damage during follow-up window |
| `melee_damage` | — | 0.4 | adds | R12: gap-closer enables melee follow-up |
| `close_range` | — | 0.5 | adds | R11: teleport-into-melee playstyle |
| `grounded` | — | 0.3 | adds | R7: post-teleport melee fight is grounded |
| `escape` | teleport | 0.7 | adds | Can teleport away to fleeing target — versatile escape |
| `single_target` | — | 0.4 | adds | ST teleport press |
| `farmer` | — | 0.4 | adds | R14: teleport helps jungle traversal |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Plated Armor
- **normalized_name**: `plated_armor`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Plated_Armor

### Interpretation
T4 deflection passive: 30% chance to fully deflect incoming bullets, 50% chance to deflect bullet procs. +130 HP. Statistical resist — averages out to ~30% effective bullet mitigation but with RNG variance.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DeflectionPercent` | 30% | 30% | 30% | Passive deflection chance |
| `BulletProcDeflectionPercent` | 50% | 50% | 50% | Passive deflection chance vs procs |
| `BonusHealth` | 130 | 130 | 130 | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_resistance` | 30% deflect | 1.5 | adds | Effective resist via deflection RNG |
| `gun_burst_resistance` | — | 0.7 | adds | R2 analogue |
| `gun_continuous_resistance` | — | 0.7 | adds | R2 analogue |
| `bullet_evasion` | 30% RNG miss | 1.5 | adds | Bullets deflected = effectively dodged |
| `damage_sponge` | — | 1.0 | adds | Item is built for bullet-tanking |
| `high_max_hp` | 130 | 0.5 | adds | Modest T4 HP |
| `counter_importance` | — | 1.3 | adds | R13: hard counter to bullet-DPS comps |
| `damage_sponge` | — | 0.5 | relies | R10: pairs with tanky builds |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Siphon Bullets
- **normalized_name**: `siphon_bullets`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Siphon_Bullets

### Interpretation
T4 stacking HP-steal: bullets steal 2.5% of target's max HP per hit (capped via 1.2s ICD), +1 stack per hit. Each stack persists 17s. Bonus +1 on hero kill. Lose 2 stacks on death. Effectively uncapped (9999 max stacks) — pure snowball item with permanent HP gain for the carry that lives long enough.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BaseAttackDamagePercent` | 15% | 15% | 15% | Passive |
| `BulletResist` | 10% | 10% | 10% | Passive |
| `StealPerHit` | 1 | 1 | 1 | Per-bullet stack (1.2s ICD) |
| `StealPerKill` | 1 | 1 | 1 | Per hero kill |
| `HealthStealPctHero` | 2.5% | 2.5% | 2.5% | Per stack (target max HP) |
| `StealDuration` | 17 | 17 | — | (per-stack window) |
| `StackLostPerDeath` | 2 | 2 | — | (death penalty) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_lifesteal` | 2.5%/hit max HP | 1.5 | adds | Strong sustained HP gain on hits |
| `self_heal` | — | 1.0 | adds | R10: HP-steal is sustained self-heal |
| `continous_heal` | — | 1.0 | adds | R10 cadence partner |
| `burst_heal` | — | 0.5 | adds | R10 blend partner: big hits convert to big heals |
| `bullet_damage` | 15% | 0.7 | adds | Solid T4 weapon damage |
| `gun_burst_damage` | — | 0.35 | adds | R2: per-shot damage propagation |
| `gun_continuous_damage` | — | 0.2 | adds | R2: per-shot damage propagation |
| `bullet_resistance` | 10% | 0.5 | adds | Token defensive |
| `damage_sponge` | scaling HP | 1.5 | adds | Scales endlessly with stacks |
| `scaling_late` | — | 1.5 | adds | Snowball/late-game scaling |
| `high_kill_count` | — | 1.0 | relies | More kills = more stacks |
| `bullet_proc` | per-shot | 0.7 | adds | Bullet-driven mechanic |
| `gun_continuous_proc` | per-shot | 0.6 | adds | R5: per-hit HP-steal = continuous-leaning |
| `gun_burst_proc` | — | 0.3 | adds | R5: each hit still triggers a small burst |
| `close_range` | — | 0.4 | adds | R11: brawler-style sustain |
| `grounded` | — | 0.3 | adds | R7: bruiser playstyle |
| `engage` | — | 0.4 | adds | Stack-builder rewards initiating |
| `melee_damage` | — | 0.3 | adds | R12: close-range bruiser flavor |
| `high_max_hp` | — | 0.5 | relies | R8: lifesteal scales with HP cushion |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Spellbreaker
- **normalized_name**: `spellbreaker`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Spellbreaker

### Interpretation
T4 anti-spirit-burst: passive +18% spirit resist + 25% status resist. When taking 175+ spirit damage in a 9s window, gain 65% spirit damage reduction for some duration (verify). Reactive insurance against big spirit nukes — Mystic Reverb, Boundless Spirit ults.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechResist` | 18% | 18% | 18% | Passive |
| `StatusResistancePercent` | 25% | 25% | 25% | Passive |
| `DamageThreshold` | 175 | 175 | — | (trigger threshold) |
| `SpiritDamageReductionProc` | 65 | 65 | 65% | Active reduction on proc |
| `AbilityCooldown` | 9 | 9 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | 18% + 65% reactive | 1.5 | adds | Strong passive + reactive layer |
| `spirit_burst_resistance` | — | 1.2 | adds | R2 analogue: trigger is burst-flavored |
| `spirit_continuous_resistance` | — | 0.6 | adds | R2 analogue: passive base lifts continuous too |
| `burst_resistance` | 65% reactive | 1.5 | adds | Counter to spirit-burst nukes |
| `debuff_resistance` | 25% | 1.5 | adds | T4 status resist on tier-flat curve |
| `cc_resist` | 25% | 1.5 | adds | Same |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to spirit-burst comps |
| `damage_sponge` | — | 1.0 | adds | Spirit-tank profile |
| `damage_sponge` | — | 0.4 | relies | R10 |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Unstoppable
- **normalized_name**: `unstoppable`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Unstoppable

### Interpretation
T4 active CC immunity / debuff cleanse: 5.5s active that grants +125 HP and +25% status resist (and likely cleanses incoming CC — verify on wiki). 65s cd → 8.5% uptime. Designed as a panic-button anti-CC commit, mid-fight.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusHealth` (active) | 0 | 125 | ~11 | × 5.5/65 amortized |
| `StatusResistancePercent` (active) | 0 | 25% | ~2.1% | × 5.5/65 amortized |
| `AbilityDuration` | 5.5 | 5.5 | — | (timing) |
| `AbilityCooldown` | 65 | 65 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cc_resist` | 25% + cleanse | 1.5 | adds | Strong active CC immunity for 5.5s |
| `debuff_resistance` | active cleanse | 1.5 | adds | Wipes incoming debuffs |
| `counter_importance` | — | 1.5 | adds | R13: hard counter to CC-stacking comps |
| `engage` | — | 0.5 | adds | Active immunity enables aggressive plunges |
| `escape` | — | 0.6 | adds | CC cleanse is a strong panic-button escape too |
| `damage_sponge` | 125 HP active | 0.5 | adds | Brief HP boost |
| `burst_heal` | 125 HP | 0.4 | adds | R10: HP boost on cast IS a small burst-heal-equivalent |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Vampiric Burst
- **normalized_name**: `vampiric_burst`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Vampiric_Burst

### Interpretation
T4 active gun-DPS burst: 4.5s buff with +34% fire rate, +70% bullet lifesteal, instant 75% reload. 30s cd → 15% uptime. Passive +100 HP, +10% bullet resist, +13% bullet lifesteal. Strong gun-carry burst window with massive in-window sustain.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BulletLifestealPercent` (passive) | 13% | 13% | 13% | Passive |
| `BulletResist` | 10% | 10% | 10% | Passive |
| `BonusHealth` | 100 | 100 | 100 | Passive |
| `ActiveBonusFireRate` | 0 | 34% | ~5.1% | × 4.5/30 amortized |
| `ActiveBonusLifesteal` | 0 | 70% | ~10.5% | × 4.5/30 amortized; effective on top of passive 13% |
| `ActiveReloadPercent` | 0 | 75% | per cd | Free reload on cast |
| `AbilityCooldown` | 30 | 30 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_lifesteal` | 13% + 10.5% active | 1.5 | adds | Combined sustain (cross-tier 2.0 = Leech 25%) |
| `fire_rate` | ~5% amortized | 0.7 | adds | Active fire-rate burst |
| `gun_burst_damage` | active fire-rate window | 1.0 | adds | R2: 4.5s burst window |
| `gun_continuous_damage` | — | 0.5 | adds | R2: fire-rate also lifts continuous |
| `magazine_size_dependant` | free reload | 0.7 | adds | Instant reload on cast |
| `self_heal` | active sustain | 1.0 | adds | Big burst-window sustain |
| `continous_heal` | — | 0.7 | adds | R10 cadence partner: passive 13% lifesteal trickles |
| `burst_heal` | — | 0.5 | adds | R10 blend partner: active window converts big hits to big heals |
| `bullet_resistance` | 10% | 0.5 | adds | Sub-Bullet Resilience 30% |
| `high_max_hp` | 100 | 0.4 | adds | Modest T4 HP |
| `engage` | — | 0.6 | adds | Active burst window favors initiating |
| `farmer` | — | 0.3 | adds | R10: lifesteal helps during jungle clears |
| `high_max_hp` | — | 0.5 | relies | R8: lifesteal scales with HP cushion |
| `damage_sponge` | — | 0.4 | relies | R10: rewards sustained-fire bruisers |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Witchmail
- **normalized_name**: `witchmail`
- **tier**: 4 (6400 souls)
- **category**: Vitality
- **wiki**: https://deadlock.wiki/Witchmail

### Interpretation
T4 spirit-tank with ability-spam enabler: passive +14 SP, +20% spirit resist, +7% CDR. Take 75+ damage from spirit attacks to get -4% per-hit CDR (stacks). Effectively, getting attacked by spirit damage cycles your own abilities faster — converts being focused into ability spam.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 14 | 14 | 14 | Passive |
| `TechResist` | 20% | 20% | 20% | Passive |
| `CooldownReduction` | 7% | 7% | 7% | Passive |
| `CooldownReductionPerHit` | 0 | -4% per hit | ~-15% | Sustained when being attacked by spirit |
| `DamageThreshold` | 75 | 75 | — | (trigger threshold) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resistance` | 20% | 1.0 | adds | Sub-Fury Trance 40% T3 ceiling |
| `spirit_burst_resistance` | — | 0.4 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.4 | adds | R2 analogue |
| `cooldown_reduction` | 7% + ~15% reactive | 1.5 | adds | Combined CDR is high amortized |
| `ability_spam` | reactive CDR | 1.5 | adds | Item built around enabling spam |
| `damage_sponge` | — | 0.8 | relies | Pays off when soaking spirit damage |
| `spirit_damage` | 14 | 0.5 | adds | R1: was spirit_power — modest T4 SP |
| `spirit_burst_damage` | — | 0.25 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.25 | adds | R2: general SP propagation |
| `multi_ability_focus` | — | 0.5 | adds | R4: CDR helps multi-cast kits |
| `counter_importance` | — | 0.7 | adds | R13: anti-spirit-burst with reactive CDR |
| `high_max_hp` | — | 0.15 | adds | R3 vitality baseline |

---

## Arctic Blast
- **normalized_name**: `arctic_blast`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Arctic_Blast

### Interpretation
T4 AoE freeze + slow: expanding blast (2m→12m) deals 175 damage + 15% max HP, applies -60% MS slow for 4s and 0.75s freeze. 24s cd, +10% spirit resist passive. Strong AoE pick + control. The 0.75s freeze is a mini-stun.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 24 | 24 | TBD | cd / timing |
| `SlowPercent` | 0 | 60% | ~10% | × 4/24 amortized |
| `Damage_Value` | 0 | 175 | ~7.3/sec | 175 / 24s amortized |
| `PercentDamage` | 0 | 15% max HP | ~0.6%/sec | Same |
| `FreezeDuration` | 0 | 0.75 | per cd | Mini-stun |
| `TechResist` | 10% | 10% | 10% | Passive |
| `EndRadius` | 12 m | 12 m | — | (AoE) |
| `AbilityCooldown` | 24 | 24 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `movement_slow` | ~10% amortized | 1.0 | adds | Strong AoE slow |
| `aoe_cluster` | 12m blast | 1.5 | adds | Big AoE radius |
| `spirit_damage` | 175 + 15% max HP | 0.8 | adds | R6: item literally deals AoE spirit damage |
| `spirit_burst_damage` | 175 + 15% max HP | 1.5 | adds | Strong AoE burst |
| `spirit_continuous_damage` | — | 0.3 | adds | R3/R2 floor — mostly burst |
| `stun` | 0.75s freeze | 0.7 | adds | Mini-freeze stun |
| `engage` | — | 1.0 | adds | AoE pick / control opener |
| `damage_sponge` | — | 0.5 | adds | Max-HP scaling helps vs tanks |
| `counter_importance` | — | 0.7 | adds | R13: anti-tank scaling + AoE control |
| `assist_importance` | — | 0.8 | adds | AoE slow + freeze helps team focus |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to one cast |
| `spirit_burst_proc` | per-cast | 0.5 | adds | R5: per-cast trigger — burst-leaning |
| `spirit_continuous_proc` | — | 0.4 | adds | R5: 4s slow keeps continuous flavor |
| `spirit_resistance` | 10% | 0.5 | adds | Token defensive |

---

## Cursed Relic
- **normalized_name**: `cursed_relic`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Cursed_Relic

### Interpretation
T4 single-target glitch debuff: target an enemy at 20m, apply a 3.25s debuff that skips 6 input frames per tick (effectively input-stutter — disrupts aim/cast). Applies -10% outgoing damage. 55s cd. Niche soft-disrupt against high-skill targets.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 3.25 | 3.25 | per cd | Glitch window |
| `AbilityCastRange` | 20 m | 20 m | — | (range) |
| `SkipFrames` | 6 | 6 | — | (input stutter) |
| `OutgoingDamagePenaltyPercent` | -10% | -10% | -10% | Applied to target |
| `AbilityCooldown` | 55 | 55 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `silence` | input disrupt | 0.7 | adds | Soft input-disrupt — disrupts aim/cast but not full silence |
| `debuff` | -10% outgoing | 0.7 | adds | Modest damage debuff |
| `interrupt` | — | 0.7 | adds | Glitches mid-cast |
| `counter_importance` | — | 1.3 | adds | R13: niche but effective vs high-skill carries |
| `single_target` | — | 1.0 | adds | ST press |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to a cast |
| `assist_importance` | — | 0.5 | adds | R10: disrupting a key enemy helps the whole team focus |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Echo Shard
- **normalized_name**: `echo_shard`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Echo_Shard

### Interpretation
T4 ability double-cast: activate to re-cast your most recent ability immediately. 35s cd. Passive +5% fire rate, +5% bullet/spirit resist. The signature double-cast item — defines combo-spam potential.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `BonusFireRate` | 5% | 5% | 5% | Passive |
| `TechResist` | 5% | 5% | 5% | Passive |
| `BulletResist` | 5% | 5% | 5% | Passive |
| `AbilityCooldown` | 35 | 35 | — | (timing — re-cast button cd) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `ability_spam` | double-cast | 2.0 | adds | Cross-tier defining ability-spam item |
| `spirit_burst_damage` | — | 1.0 | adds | Double-cast enables huge spirit-burst combos |
| `spirit_continuous_damage` | — | 0.5 | adds | R2: also lifts continuous spirit on re-cast |
| `single_ability_focus` | — | 1.0 | adds | R4 (per user logic for charges): re-cast amplifies one ability |
| `single_ability_focus` | — | 1.0 | relies | Pays off most for heroes with one big ability |
| `ult_focused` | — | 1.0 | adds | Re-cast ult is the dream usage |
| `fire_rate` | 5% | 0.2 | adds | Token T4 fire rate |
| `bullet_resistance` | 5% | 0.2 | adds | Token |
| `spirit_resistance` | 5% | 0.2 | adds | Token |
| `cooldown_reduction` | — | 0.7 | adds | Re-cast functions like effective cd halving for the re-cast ability |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Escalating Exposure
- **normalized_name**: `escalating_exposure`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Escalating_Exposure

### Interpretation
T4 stacking spirit-damage scaler: every spirit ability hit applies +4.5% magic-damage-taken stack on target (12 max = +54%). 12s linger, 0.7s proc cd. Passive +17% spirit resist, -8 spirit armor passive (downside on the carrier? — odd, verify). The stacking spirit amp is enormous on sustained-cast comps.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `MagicIncreasePerStack` | 0 | 4.5% per stack | ~32% | × 0.6 avg stacks (~7 of 12) |
| `TechResist` | 17% | 17% | 17% | Passive |
| `TechArmorDamageReduction` | -8 | -8 | -8 | (Likely applied to target on proc, not downside; verify) |
| `MaxStacks` | 12 | 12 | — | (cap) |
| `AbilityDuration` | 12 | 12 | — | (per-stack linger) |
| `ProcCooldown` | 0.7 | 0.7 | — | (ICD) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_burst_damage` | +32% on target | 1.5 | adds | Massive damage amp on focused target |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: stacking continuous mechanic |
| `spirit_continuous_proc` | per spirit hit | 1.5 | adds | R5: continuous spirit-driven proc mechanic |
| `spirit_burst_proc` | — | 0.6 | adds | R5: still triggers per spirit hit |
| `spirit_resist_shred` | -8 effective | 0.8 | adds | Modest shred component |
| `spirit_resistance` | 17% | 0.7 | adds | Token T4 spirit resist |
| `spirit_damage` | — | 1.5 | relies | Pure synergy with spirit-cast heroes |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to one ability |
| `single_target` | — | 0.7 | adds | Per-target stacking — single-target amp focus |
| `assist_importance` | — | 1.0 | adds | R10: amped target lets team focus down |
| `counter_importance` | — | 0.7 | adds | R13: tank-killer via stacking amp |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Ethereal Shift
- **normalized_name**: `ethereal_shift`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Ethereal_Shift

### Interpretation
T4 ethereal/immunity active: 4s "phase out" — become untargetable, lift into the air (float at 2.5 m/s), +30% spirit resist, +3 m/s MS, +20 SP. 35s cd. Strong panic-button escape with offensive buff after — phase out, then come down with active SP/MS for a counter-engage.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityDuration` | 4 | 4 | per cd | Ethereal window |
| `TechResist` | 0 | 30% | ~3.4% | × 4/35 amortized |
| `BonusSpirit` | 0 | 20 | ~2.3 | × 4/35 amortized |
| `BonusMoveSpeed` | 0 | 3 m/s | ~0.34 m/s | × 4/35 amortized |
| `FloatMoveSpeed` | 2.5 m/s | 2.5 m/s | active | (aerial float) |
| `AbilityCooldown` | 35 | 35 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `escape` | 4s untargetable | 2.0 | adds | Cross-tier ceiling — full untargetability |
| `burst_resistance` | untargetable | 2.0 | adds | Outright cannot be damaged during active |
| `gun_burst_resistance` | — | 1.5 | adds | R2 analogue: catches all gun damage |
| `spirit_burst_resistance` | — | 1.5 | adds | R2 analogue: catches all spirit damage |
| `gun_continuous_resistance` | — | 1.5 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 1.5 | adds | R2 analogue |
| `aerial` | lift + float | 1.5 | adds | R9: vertical mobility during active |
| `vertical_mobility` | lift 200 | 1.5 | adds | Lift height is significant |
| `horizontal_mobility` | 3 m/s amortized | 0.4 | adds | Active MS × 0.5 weight |
| `cc_resist` | untargetable | 1.5 | adds | Cleanses ongoing target-based CC |
| `debuff_resistance` | untargetable | 1.0 | adds | Untargetability shrugs incoming debuffs |
| `spirit_damage` | ~2.3 active | 0.2 | adds | R1: was spirit_power — token amortized |
| `spirit_resistance` | ~3.4% | 0.3 | adds | Token amortized |
| `engage` | counter-engage | 0.5 | adds | Land out with SP/MS active for re-engage |
| `counter_importance` | — | 0.8 | adds | R13: anti-CC escape — counter pick vs lockdown comps |
| `farmer` | — | 0.3 | adds | R14: float/MS helps jungle traversal |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Focus Lens
- **normalized_name**: `focus_lens`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Focus_Lens

### Interpretation
T4 single-target damage marker: cast on target at 20m → 4s buff, target takes +30% damage from carrier's abilities AND has -9 spirit resist + -30 SP. Carrier gains +10% fire rate during window. 12s linger on resist debuffs after the active. 45s cd. Pick-tool — selects a victim and amplifies them as a target.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `PercentDamage` | 0 | 30% | ~2.7% | × 4/45 amortized |
| `BonusFireRate` | 0 | 10% | ~0.9% | × 4/45 amortized |
| `MagicResistReduction` | -9 | -9 | ~-2.4 | × 12/45 amortized |
| `TechPowerReduction` | -30 | -30 | ~-8 | × 12/45 amortized |
| `AbilityCooldown` | 45 | 45 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_resist_shred` | ~-2.4 amortized | 0.5 | adds | Sub-Crippling -16 |
| `debuff` | -30 SP on target | 1.5 | adds | Reducing target's SP cripples their abilities |
| `single_target` | — | 1.5 | adds | ST damage-marker item |
| `counter_importance` | — | 1.5 | adds | R13: strong pick on enemy carries |
| `spirit_burst_damage` | +30% amp window | 0.7 | adds | R2: buff carrier's own burst on target |
| `gun_continuous_damage` | — | 0.3 | adds | R2: fire-rate side of carrier buff |
| `gun_burst_damage` | — | 0.15 | adds | R2: fire-rate light burst |
| `assist_importance` | — | 1.0 | adds | R10: marked target helps team focus |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches to one cast |
| `fire_rate` | ~0.9% | 0.1 | adds | Carrier active fire rate (small amortized) |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Lightning Scroll
- **normalized_name**: `lightning_scroll`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Lightning_Scroll

### Interpretation
T4 reactive lightning trap: when an enemy gets too close, lightning binds them — 30% MS slow, -12 dash reduction, building up to 0.75s stun after 3s delay. Deals 150 damage on full stun + bonus slow at 80% (verify mechanics). +50 HP, +0.75 sprint passive. Anti-engage anchor.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `Damage` | 150 | 150 | ~per trigger | Per stun proc |
| `SlowPercent` | 80 | 80 | per proc | During pre-stun build-up |
| `MovementSpeedSlow` | 30 | 30 | 30 | Initial slow on proximity |
| `StunDuration` | 0.75 | 0.75 | per proc | After 3s buildup |
| `BonusHealth` | 50 | 50 | 50 | Passive |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `movement_slow` | 80% (peak) / 30% sustained | 1.5 | adds | Strong slow on engagers |
| `spirit_damage` | 150/proc | 0.5 | adds | R6: item literally deals spirit damage on stun |
| `spirit_burst_damage` | 150/proc | 0.7 | adds | R6: burst damage per proc |
| `stun` | 0.75s | 1.0 | adds | Mini-stun on engagement |
| `counter_importance` | — | 1.5 | adds | R13: counter to dive/engage heroes |
| `interrupt` | — | 0.5 | adds | Stun interrupts attackers |
| `assist_importance` | — | 0.7 | adds | R10: stunned attacker helps team focus |
| `high_max_hp` | 50 | 0.2 | adds | Token T4 HP |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | 0.75 sprint × 0.5 |
| `farmer` | — | 0.3 | adds | R14: sprint speed helps jungle |
| `escape` | — | 0.5 | adds | Auto-stun proximity-CC is a strong disengage tool |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Magic Carpet
- **normalized_name**: `magic_carpet`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Magic_Carpet

### Interpretation
T4 flight item: 12s flying carpet (7 m/s fly speed) on 32s cd. Passive +14 SP, +15% ability duration, +125 HP. Per user's earlier sparse-tier example: duration buff of 15% is well below Superior Duration T3 28% = 2.0, so duration_dependant lands at ~1.0, not 1.5, despite being T4-best.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 14 | 14 | 14 | Passive |
| `FlyMoveSpeed` | 0 | 7 m/s | ~2.6 m/s | × 12/32 active uptime |
| `BonusHealth` | 125 | 125 | 125 | Passive |
| `BonusAbilityDurationPercent` | 15% | 15% | 15% | Passive |
| `AbilityDuration` | 12 | 12 | — | (flight window) |
| `AbilityCooldown` | 32 | 32 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `aerial` | 7 m/s fly | 2.0 | adds | Cross-tier ceiling — actual flight |
| `vertical_mobility` | flight | 1.5 | adds | Vertical freedom of flight |
| `horizontal_mobility` | flight | 1.5 | adds | Horizontal speed at 7 m/s × 12/32 ~uptime |
| `escape` | — | 1.5 | adds | R9: flight escape is universal |
| `engage` | — | 1.0 | adds | R9: flight reach for picks |
| `duration_dependant` | 15% | 1.0 | adds | Sparse-tier: T4-best but undershoots Superior Duration 28% curve |
| `spirit_damage` | 14 | 0.5 | adds | R1: was spirit_power — modest T4 SP |
| `spirit_burst_damage` | — | 0.25 | adds | R2: general SP propagation |
| `spirit_continuous_damage` | — | 0.25 | adds | R2: general SP propagation |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches duration to a chosen ability |
| `multi_ability_focus` | — | 0.3 | adds | R4: general SP buff helps the kit |
| `farmer` | — | 0.5 | adds | R14: flight makes jungle traversal trivial |
| `high_max_hp` | 125 | 0.4 | adds | Modest T4 HP |
| `high_max_hp` | — | 0.15 | adds | R3 (item is Spirit category — replace with spirit baseline) — actually this is spirit cat so use spirit baseline |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `high_max_hp` | 125 | 0.5 | adds | Modest T4 HP |

---

## Mercurial Magnum
- **normalized_name**: `mercurial_magnum`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mercurial_Magnum

### Interpretation
T4 spirit-on-bullets hybrid: charges up over 14s; pop active to instantly reload + +25 spirit damage per bullet + +22% fire rate + 60 burst spirit damage for 12s. 15s cd. Passive +7 SP, +20% ammo. Defines the gun-to-spirit converter at T4.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechPower` | 7 | 7 | 7 | Passive |
| `BonusClipSizePercent` | 20% | 20% | 20% | Passive |
| `BonusFireRate` | 0 | 22% | ~17.6% | × 12/15 active uptime |
| `BulletsBonusMagicDamage_Value` | 0 | +25/bullet | ~+20/bullet | Same uptime |
| `Damage_Value` | 60 | 60 | per cast | Burst on cast |
| `AmmoReloadPercent` | 100% | 100% | per cd | Free reload |
| `AbilityChargeUpTime` | 14 | 14 | — | (build) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `bullet_proc` | +25 spirit/bullet | 1.5 | adds | T4 bullet→spirit conversion |
| `hybrid_damage_usage` | — | 2.0 | adds | Defines the bullet-spirit hybrid axis at T4 |
| `fire_rate` | ~17.6% | 1.0 | adds | Amortized active fire rate |
| `gun_continuous_damage` | — | 0.5 | adds | R2: fire-rate propagation |
| `gun_burst_damage` | — | 0.2 | adds | R2: fire-rate light burst |
| `magazine_size_dependant` | 20% + reload | 0.5 | adds | Sub-Titanic 100% — sparse-tier |
| `spirit_damage` | 7 + +25/bullet | 1.0 | adds | R1/R6: passive SP + bullet-converted spirit damage |
| `spirit_burst_damage` | 60 burst | 0.5 | adds | Token burst on cast |
| `spirit_continuous_damage` | — | 0.8 | adds | R2: continuous spirit from per-bullet proc |
| `gun_continuous_proc` | per-bullet | 1.5 | adds | R5: bullet-driven continuous spirit |
| `gun_burst_proc` | — | 0.7 | adds | R5: per-bullet trigger has burst flavor too |
| `spirit_burst_proc` | — | 0.5 | adds | R5: each bullet IS a small spirit proc |
| `spirit_continuous_proc` | — | 1.0 | adds | R5: per-bullet = high frequency |
| `hybrid_damage_usage` | — | 1.0 | relies | Pays off only on hybrid heroes |
| `engage` | — | 0.4 | adds | Active commit window favors initiating |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Mystic Reverb
- **normalized_name**: `mystic_reverb`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Mystic_Reverb

### Interpretation
T4 delayed AoE echo: spirit-damage trigger creates a 16m AoE 3s later dealing 50% repeat damage (min 100) + 10% max HP + 40% slow. 6.25s cd. +22% spirit lifesteal (imbued). Cross-tier 2.0 for `TechDamagePercent`. Massive AoE follow-up on ability casts.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `TechDamagePercent` | 50% | 50% | 50% | Passive — cross-tier ceiling |
| `MinimumDamage` | 100 | 100 | per proc | Floor on echo |
| `MaxHealthDamage` | 10% | 10% | per proc | Max-HP component |
| `Radius` | 16 m | 16 m | — | (AoE radius) |
| `MovementSpeedSlow` | 40% | 40% | per proc | -40% slow on hit |
| `AbilityLifestealPercentHero` | 8% | 8% | 8% | Passive |
| `ImbueAbilityLifesteal` | 22% | 22% | 22% | Imbued on echo cast |
| `DelayDuration` | 3 | 3 | — | (delay) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `spirit_damage` | 50% echo + max HP | 1.5 | adds | R6: item literally deals delayed spirit damage |
| `spirit_burst_damage` | 50% echo + max HP | 2.0 | adds | TechDamagePercent cross-tier ceiling |
| `spirit_continuous_damage` | — | 0.7 | adds | R2: delayed echo on each cast adds sustained DPS |
| `aoe_cluster` | 16m AoE | 2.0 | adds | Massive AoE radius |
| `spirit_continuous_proc` | per spirit hit | 1.5 | adds | R5: procs on each ability cast |
| `spirit_burst_proc` | — | 0.8 | adds | R5: per-cast trigger has burst flavor |
| `movement_slow` | -40% on hit | 1.0 | adds | Strong AoE slow |
| `spirit_lifesteal` | 8% + 22% imbue | 1.0 | adds | Solid sustain on echo damage |
| `self_heal` | — | 0.6 | adds | R10: lifesteal contributes self-sustain |
| `continous_heal` | — | 0.5 | adds | R10 cadence partner |
| `damage_sponge` | — | 0.8 | adds | Max-HP component scales with target HP |
| `counter_importance` | — | 1.0 | adds | R13: anti-tank scaling |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches the echo to a chosen cast |
| `assist_importance` | — | 0.7 | adds | R10: AoE slow + damage helps team focus |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Refresher
- **normalized_name**: `refresher`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Refresher

### Interpretation
T4 full ability cd reset: 300s cd → effectively once-per-fight. Refreshes ALL ability cooldowns instantly. Passive +14% spirit resist, +15% bullet resist. The "second ult" item — game-changing teamfight pickup.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `AbilityCooldown` | 300 | 300 | — | (very long cd — once per teamfight) |
| `TechResist` | 14% | 14% | 14% | Passive |
| `BulletResist` | 15% | 15% | 15% | Passive |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `ability_spam` | full reset/fight | 2.0 | adds | Cross-tier ceiling — total cd reset |
| `ult_focused` | — | 2.0 | adds | Lets you re-cast ult mid-fight |
| `spirit_burst_damage` | — | 1.5 | adds | R2: second-cast burst from any spirit ability |
| `spirit_continuous_damage` | — | 0.5 | adds | R2: also lifts continuous |
| `bullet_resistance` | 15% | 0.7 | adds | Decent passive |
| `spirit_resistance` | 14% | 0.7 | adds | Decent passive |
| `gun_burst_resistance` | — | 0.3 | adds | R2 analogue |
| `gun_continuous_resistance` | — | 0.3 | adds | R2 analogue |
| `spirit_burst_resistance` | — | 0.3 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.3 | adds | R2 analogue |
| `single_ability_focus` | — | 0.7 | adds | R4 (per user logic): reset rewards heroes with one big nuke |
| `single_ability_focus` | — | 0.7 | relies | Pays off best on heroes with one big ability |
| `cooldown_reduction` | — | 1.5 | adds | Full reset = ultimate CDR effect |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Scourge
- **normalized_name**: `scourge`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Scourge

### Interpretation
T4 max-HP DoT discord: active for 10s, target an enemy at 35m, they take 3.5%/sec max-HP DPS in a 10m aura around them. While active: carrier gets +40% spirit resist, +15% status resist, +100 HP. 35s cd. Anti-tank zone-control — converts target into a death zone.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `MaxHealthPercentAsDPS` | 0 | 3.5%/sec | ~1%/sec | × 10/35 active |
| `TechResist` (active, self) | 0 | 40% | ~11.4% | × 10/35 amortized |
| `StatusResistancePercent` (active) | 0 | 15% | ~4.3% | Same |
| `BonusHealth` (active) | 0 | 100 | ~29 | × 10/35 amortized |
| `AuraRadius` | 10 m | 10 m | — | (debuff aura on target) |
| `AbilityCastRange` | 35 m | 35 m | — | (cast range) |
| `AbilityCooldown` | 35 | 35 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `dot` | ~1%/sec max HP | 1.5 | adds | Max-HP DoT amortized |
| `spirit_damage` | ~1%/sec max HP | 0.8 | adds | R6: item literally deals continuous spirit damage |
| `spirit_continuous_damage` | — | 1.0 | adds | R2: DoT lifts continuous-spirit axis |
| `spirit_burst_damage` | — | 0.2 | adds | R3 floor — mostly continuous |
| `damage_sponge` | counter to tanks | 1.5 | adds | Scales with target HP |
| `spirit_resistance` | ~11.4% amortized | 1.0 | adds | Burst resist in 10s window (cross-tier 2.0 = Fury Trance 40%) |
| `spirit_burst_resistance` | — | 0.5 | adds | R2 analogue |
| `spirit_continuous_resistance` | — | 0.5 | adds | R2 analogue |
| `aoe_cluster` | 10m aura on target | 1.0 | adds | AoE around marked target |
| `counter_importance` | — | 1.5 | adds | R13: anti-tank counter |
| `anti_heal` | — | 0.4 | adds | Health-shred works similarly to anti-heal vs heal-stack targets |
| `single_target` | — | 1.0 | adds | ST press item |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches DoT to a cast |
| `assist_importance` | — | 0.8 | adds | R10: marked target's debuff zone helps team focus |
| `debuff_resistance` | 15% on self | 0.5 | adds | Self status resist during active |
| `cc_resist` | 15% on self | 0.5 | adds | Same |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Spirit Burn
- **normalized_name**: `spirit_burn`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Spirit_Burn

### Interpretation
T4 anti-heal DoT: dealing 500+ spirit damage in 5s to a target ignites them — 24 DPS for 8s, plus -70% heal received/regen, plus an explosion (110 damage in 12m AoE). 20s cd. Cross-tier 2.0 anchor for `anti_heal`. Also has +6× range/radius multiplier (but only for the ult — niche). Devastating against heal-stacking comps.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `DPS_Value` | 0 | 24/sec | ~19/sec | × 8s active per proc with high uptime |
| `ExplosionDamage` | 0 | 110 | ~5.5/sec | 110 amortized over 20s cd |
| `HealAmpReceivePenaltyPercent` | 0 | -70% | -70% | Applied during DoT |
| `HealAmpRegenPenaltyPercent` | 0 | -70% | -70% | Same |
| `TechRangeMultiplier` | 6× | 6× | ult-only | Massive multiplier for ult radius |
| `TechRadiusMultiplier` | 6× | 6× | ult-only | Same |
| `ExplosionRadius` | 12 m | 12 m | — | (explosion AoE) |
| `DamageThreshold` | 500 | 500 | — | (trigger gate) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `anti_heal` | -70% | 2.0 | adds | Cross-tier ceiling |
| `dot` | ~19/sec | 1.5 | adds | Strong continuous DoT |
| `spirit_damage` | ~19/sec + 110 burst | 1.2 | adds | R6: item literally deals spirit damage (DoT + explosion) |
| `spirit_continuous_damage` | ~19/sec | 1.5 | adds | R2: DoT lifts continuous-spirit axis |
| `spirit_burst_damage` | 110 explosion | 0.7 | adds | Per-trigger burst |
| `aoe_cluster` | 12m explosion | 1.0 | adds | AoE component on proc |
| `range_extender_dependant` (ult-only) | 6× ult | 1.0 | adds | Massive but ult-only multiplier — niche but defining |
| `ult_focused` | — | 1.5 | adds | The range multiplier is ult-gated |
| `counter_importance` | — | 2.0 | adds | R13: hard counter to heal-heavy comps |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches the ignite to a cast |
| `spirit_burst_proc` | per-cast | 0.6 | adds | R5: triggered by 500+ spirit damage threshold — burst-flavored |
| `spirit_continuous_proc` | DoT phase | 0.5 | adds | R5: the DoT phase keeps spirit pressure on |
| `assist_importance` | — | 1.0 | adds | R10: anti-heal helps the team kill tanks |
| `damage_sponge` | — | 0.6 | adds | Counter to high-HP heal-stacking tanks |
| `bullet_proc` | 500+ trigger | 0.5 | adds | The 500-dmg threshold often filled via bullets (hybrid) |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |

---

## Transcendent Cooldown
- **normalized_name**: `transcendent_cooldown`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Transcendent_Cooldown

### Interpretation
Cross-tier 2.0 anchor for `cooldown_reduction`: passive +25% ability CDR and +25% item CDR. +4 OOC regen. Pure spirit-spam stat stick — every ability and active item comes back faster.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CooldownReduction` | 25% | 25% | 25% | Passive — cross-tier ceiling |
| `ItemCooldownReduction` | 25% | 25% | 25% | Passive — also applies to items |
| `OutOfCombatHealthRegen` | 4/sec | 4/sec | 1.2/sec | × 0.3 OOC |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `cooldown_reduction` | 25% + 25% items | 2.0 | adds | Cross-tier ceiling |
| `ability_spam` | — | 2.0 | adds | Item active CDR too — full cd toolkit |
| `multi_ability_focus` | — | 0.5 | adds | R4: CDR helps multi-cast kits — but imbued so the lift is mild |
| `single_ability_focus` | — | 0.5 | adds | R4: imbued — attaches CDR to a chosen ability |
| `self_heal` | 1.2/sec | 0.5 | adds | Solid OOC regen |
| `continous_heal` | 1.2/sec | 0.5 | adds | R10 cadence partner |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

---

## Vortex Web
- **normalized_name**: `vortex_web`
- **tier**: 4 (6400 souls)
- **category**: Spirit
- **wiki**: https://deadlock.wiki/Vortex_Web

### Interpretation
T4 AoE root/web: deploy at 30m range, captures all enemies in 12m for 4s, tethering them in place with -40% dash reduction and -35% slow. 42s cd. Passive +0.75 sprint. Massive AoE root — defines `trap_block_obstruct` at T4.

### Game stats
| Game stat tag | Min raw | Max raw | Effective | Notes |
|---|---|---|---|---|
| `CaptureRadius` | 12 m | 12 m | — | (web AoE) |
| `AbilityDuration` | 4 | 4 | per cd | Root window |
| `SlowPercent` | 0 | 35% | ~3.3% | × 4/42 amortized |
| `GroundDashReductionPercent` | 0 | -40% | ~-3.8% | × 4/42 amortized |
| `TechRangeMultiplier` (active) | 0 | 8% | ~0.8% | × 4/42 amortized |
| `BonusSprintSpeed` | 0.75 m/s | 0.75 m/s | 0.75 m/s | Passive |
| `AbilityCooldown` | 42 | 42 | — | (timing) |

### Calculator tags
| Calc tag | Effective Raw | Normalized | Mode | Reasoning |
|---|---|---|---|---|
| `trap_block_obstruct` | 4s AoE root | 2.0 | adds | Cross-tier ceiling — AoE root |
| `aoe_cluster` | 12m capture | 1.5 | adds | Big AoE pickup |
| `movement_slow` | 35% × 4s | 1.0 | adds | Strong AoE slow during root |
| `engage` | — | 1.5 | adds | Initiation tool — lock enemies for follow-up |
| `disarm` | dash reduction | 0.7 | adds | Dash lock is soft disarm |
| `horizontal_mobility` | 0.38 m/s | 0.2 | adds | Token sprint × 0.5 |
| `assist_importance` | — | 1.5 | adds | R10: AoE root sets up team focus |
| `counter_importance` | — | 1.0 | adds | R13: counter to mobility-heavy comps |
| `single_ability_focus` | — | 0.4 | adds | R4: imbued — attaches root to a chosen cast |
| `farmer` | — | 0.3 | adds | R14: sprint helps jungle |
| `debuff` | 4s root | 0.7 | adds | Root is a major cleansable debuff |
| `interrupt` | — | 0.5 | adds | Root interrupts movement-based actions |
| `spirit_damage` | — | 0.15 | adds | R3 spirit baseline |
| `spirit_burst_damage` | — | 0.05 | adds | R3 floor |
| `spirit_continuous_damage` | — | 0.05 | adds | R3 floor |

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

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
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*

---



# Audit: AI Normalized vs. existing JSON playstyle_score (Round 7)

**Blending convention** (per plan): `AI blended = adds + 0.25 × relies` per tag. Multiple rows of the same mode for the same tag are summed before blending. The JSONs carry a single number per tag that conceptually blends adds and relies, so this blend is what should be compared.

**Filtering**: only tags where |Diff| ≥ 0.15 OR where AI added a row the JSON didn't have. Rows where AI and JSON agree within 0.15 are skipped to keep the report scannable.

**Negative AI values** signal downsides; if the JSON is positive there, the JSON likely overstates the item's contribution to that tag.

**Street Brawl items** are flagged but their Calculator tags were marked n/a — no audit rows generated unless JSON had nonzero values that AI doesn't match.

**Apply? column smart defaults** (per plan):
- `[x]` for `Bump` / `Cut` / `Add row` actions with |diff| ≤ 0.6 (small/medium correction — likely a Round-6 mistake worth fixing).
- `[ ]` for `Drop row` actions (R15 says don't drop — Drop suggestions are usually wrong now; user can opt in selectively).
- `[ ]` for ANY action with |diff| > 0.6 (huge diffs need manual review before applying).


## T1 (800 souls)

### Extended Magazine (`extended_magazine`, T1 Weapon)
Path: `data/items/extended_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.80 | 1.00 | +0.20 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `magazine_size_dependant` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |

### Restorative Shot (`restorative_shot`, T1 Weapon)
Path: `data/items/restorative_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `continous_heal` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `farmer` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `gun_burst_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `gun_burst_proc` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_damage` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `gun_continuous_proc` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `self_heal` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |

### Sprint Boots (`sprint_boots`, T1 Vitality)
Path: `data/items/sprint_boots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `engage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `escape` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `self_heal` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |

### Extra Stamina (`extra_stamina`, T1 Vitality)
Path: `data/items/extra_stamina.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `vertical_mobility` | 0.33 | 0.53 | +0.20 | Bump JSON → 0.53 | `[x]` |

### Close Quarters (`close_quarters`, T1 Weapon)
Path: `data/items/close_quarters.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `bullet_damage` | 0.60 | 1.12 | +0.53 | Bump JSON → 1.12 | `[x]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `close_range` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.60 | -0.15 | Cut JSON → 0.60 | `[ ]` |
| `melee_resistance` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[ ]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[x]` |

### Headshot Booster (`headshot_booster`, T1 Weapon)
Path: `data/items/headshot_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | 0.15 | -0.85 | Cut JSON → 0.15  *(large diff — review)* | `[ ]` |
| `burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `long_range` | -0.05 | 0.40 | +0.45 | Bump JSON → 0.40 | `[x]` |
| `single_target` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |

### High-Velocity Rounds (`high_velocity_rounds`, T1 Weapon)
Path: `data/items/high_velocity_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.85 | 1.00 | +0.15 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_damage` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `headshot_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.50 | 1.62 | +1.12 | Bump JSON → 1.62  *(large diff — review)* | `[x]` |
| `mid_range` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |

### Monster Rounds (`monster_rounds`, T1 Weapon)
Path: `data/items/monster_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `continous_heal` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `self_heal` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |

### Rapid Rounds (`rapid_rounds`, T1 Weapon)
Path: `data/items/rapid_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `fire_rate` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[ ]` |
| `gun_burst_damage` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `gun_continuous_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Extra Health (`extra_health`, T1 Vitality)
Path: `data/items/extra_health.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `high_max_hp` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[x]` |

### Extra Regen (`extra_regen`, T1 Vitality)
Path: `data/items/extra_regen.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[ ]` |
| `continous_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `self_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |

### Healing Rite (`healing_rite`, T1 Vitality)
Path: `data/items/healing_rite.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `assist_importance` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `burst_heal` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `horizontal_mobility` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `team_heal` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |

### Melee Lifesteal (`melee_lifesteal`, T1 Vitality)
Path: `data/items/melee_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `close_range` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `grounded` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.33 | 1.25 | +0.92 | Bump JSON → 1.25  *(large diff — review)* | `[x]` |
| `self_heal` | 0.20 | 1.05 | +0.85 | Bump JSON → 1.05  *(large diff — review)* | `[x]` |

### Rebuttal (`rebuttal`, T1 Vitality)
Path: `data/items/rebuttal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `close_range` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `counter_importance` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20  *(large diff — review)* | `[x]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[ ]` |
| `grounded` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `high_max_hp` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `long_range` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[x]` |
| `melee_resistance` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |

### Extra Charge (`extra_charge`, T1 Spirit)
Path: `data/items/extra_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `charge_dependant` | 1.50 | 1.88 | +0.38 | Bump JSON → 1.88 | `[x]` |
| `cooldown_reduction` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `single_ability_focus` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |

### Extra Spirit (`extra_spirit`, T1 Spirit)
Path: `data/items/extra_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `single_ability_focus` | 0.20 | -0.20 | -0.40 | Cut JSON → -0.20 | `[ ]` |
| `spirit_burst_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |
| `spirit_continuous_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |
| `spirit_damage` | 1.33 | 1.50 | +0.17 | Bump JSON → 1.50 | `[x]` |
| `spirit_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |

### Golden Goose Egg (`golden_goose_egg`, T1 Spirit)
Path: `data/items/golden_goose_egg.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | -0.50 | -0.65 | Cut JSON → -0.50  *(large diff — review)* | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `fire_rate` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | -0.25 | -0.35 | Cut JSON → -0.25 | `[ ]` |
| `gun_continuous_damage` | 0.10 | -0.15 | -0.25 | Cut JSON → -0.15 | `[ ]` |
| `high_kill_count` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | -0.20 | 1.00 | +1.20 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `scaling_late` | 0.20 | -0.30 | -0.50 | Cut JSON → -0.30 | `[ ]` |
| `self_heal` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_burst_damage` | 0.10 | -0.25 | -0.35 | Cut JSON → -0.25 | `[ ]` |
| `spirit_continuous_damage` | 0.10 | -0.25 | -0.35 | Cut JSON → -0.25 | `[ ]` |
| `spirit_damage` | 0.20 | -0.50 | -0.70 | Cut JSON → -0.50  *(large diff — review)* | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Burst (`mystic_burst`, T1 Spirit)
Path: `data/items/mystic_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.66 | 0.12 | -0.54 | Cut JSON → 0.12 | `[x]` |
| `single_ability_focus` | (null) | 0.62 | +0.62 | Add row, set 0.62  *(large diff — review)* | `[x]` |
| `spirit_burst_damage` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[ ]` |
| `spirit_burst_proc` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[ ]` |
| `spirit_continuous_damage` | -0.25 | 0.15 | +0.40 | Bump JSON → 0.15 | `[x]` |
| `spirit_continuous_proc` | -0.50 | 0.30 | +0.80 | Bump JSON → 0.30  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Expansion (`mystic_expansion`, T1 Spirit)
Path: `data/items/mystic_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `long_range` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[ ]` |
| `range_extender_dependant` | 1.25 | 1.75 | +0.50 | Bump JSON → 1.75 | `[x]` |
| `single_ability_focus` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[ ]` |

### Mystic Regeneration (`mystic_regeneration`, T1 Spirit)
Path: `data/items/mystic_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continous_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[ ]` |
| `high_max_hp` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `self_heal` | 0.25 | 1.20 | +0.95 | Bump JSON → 1.20  *(large diff — review)* | `[x]` |
| `spirit_burst_proc` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `spirit_continuous_damage` | 0.20 | 0.05 | -0.15 | Cut JSON → 0.05 | `[x]` |
| `spirit_continuous_proc` | 0.80 | 0.50 | -0.30 | Cut JSON → 0.50 | `[ ]` |
| `spirit_lifesteal` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Rusted Barrel (`rusted_barrel`, T1 Spirit)
Path: `data/items/rusted_barrel.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[ ]` |
| `counter_importance` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[x]` |
| `disarm` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `fire_rate_slow` | 0.85 | 1.00 | +0.15 | Bump JSON → 1.00 | `[x]` |
| `single_target` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Spirit Strike (`spirit_strike`, T1 Spirit)
Path: `data/items/spirit_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.50 | 0.75 | +0.25 | Bump JSON → 0.75 | `[x]` |
| `spirit_burst_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_continuous_proc` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[ ]` |
| `spirit_damage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `spirit_resist_shred` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |

## T2 (1600 souls)

### Active Reload (`active_reload`, T2 Weapon)
Path: `data/items/active_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.33 | 0.15 | -0.18 | Cut JSON → 0.15 | `[x]` |
| `bullet_lifesteal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.66 | 0.90 | +0.24 | Bump JSON → 0.90 | `[x]` |
| `gun_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `gun_continuous_damage` | 0.20 | 0.45 | +0.25 | Bump JSON → 0.45 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `hybrid_damage_usage` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |

### Titanic Magazine (`titanic_magazine`, T2 Weapon)
Path: `data/items/titanic_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `gun_burst_damage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `gun_continuous_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `magazine_size_dependant` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |

### Spirit Sap (`spirit_sap`, T2 Spirit)
Path: `data/items/spirit_sap.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[x]` |
| `close_to_team` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `counter_importance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[x]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.30 | 0.50 | +0.20 | Bump JSON → 0.50 | `[x]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[x]` |
| `single_target` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.85 | 0.60 | -0.25 | Cut JSON → 0.60 | `[ ]` |

### Fleetfoot (`fleetfoot`, T2 Weapon)
Path: `data/items/fleetfoot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[ ]` |
| `bullet_evasion` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `cc_resist` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `engage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[ ]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | 0.05 | -0.28 | Cut JSON → 0.05 | `[ ]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 1.15 | 0.50 | -0.65 | Cut JSON → 0.50  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Intensifying Magazine (`intensifying_magazine`, T2 Weapon)
Path: `data/items/intensifying_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_damage` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[x]` |
| `gun_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.66 | 0.85 | +0.19 | Bump JSON → 0.85 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Long Range (`long_range`, T2 Weapon)
Path: `data/items/long_range.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `bullet_damage` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `close_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `long_range` | 1.00 | 1.75 | +0.75 | Bump JSON → 1.75  *(large diff — review)* | `[x]` |
| `mid_range` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[x]` |

### Melee Charge (`melee_charge`, T2 Weapon)
Path: `data/items/melee_charge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[ ]` |
| `engage` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `grounded` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.25 | 0.07 | -0.18 | Cut JSON → 0.07 | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.50 | 1.25 | -0.25 | Cut JSON → 1.25 | `[ ]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Shot (`mystic_shot`, T2 Weapon)
Path: `data/items/mystic_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.10 | 1.50 | +1.40 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `hybrid_damage_usage` | 0.15 | 1.75 | +1.60 | Bump JSON → 1.75  *(large diff — review)* | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.85 | 0.50 | -0.35 | Cut JSON → 0.50 | `[x]` |
| `spirit_burst_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | (null) | 1.20 | +1.20 | Add row, set 1.20  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |

### Opening Rounds (`opening_rounds`, T2 Weapon)
Path: `data/items/opening_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `engage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `headshot_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `mid_range` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[ ]` |

### Slowing Bullets (`slowing_bullets`, T2 Weapon)
Path: `data/items/slowing_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[ ]` |
| `gun_burst_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_burst_proc` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_continuous_proc` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[ ]` |
| `long_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[x]` |
| `movement_slow` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |

### Spirit Shredder Bullets (`spirit_shredder_bullets`, T2 Weapon)
Path: `data/items/spirit_shredder_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `counter_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | -0.10 | 0.07 | +0.17 | Bump JSON → 0.07 | `[x]` |
| `gun_burst_proc` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `hybrid_damage_usage` | 0.33 | 1.75 | +1.42 | Bump JSON → 1.75  *(large diff — review)* | `[x]` |
| `self_heal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Split Shot (`split_shot`, T2 Weapon)
Path: `data/items/split_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.70 | 0.93 | +0.23 | Bump JSON → 0.93 | `[x]` |
| `bullet_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `engage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.05 | 0.40 | +0.35 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.10 | 1.50 | +1.40 | Bump JSON → 1.50  *(large diff — review)* | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `melee_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Swift Striker (`swift_striker`, T2 Weapon)
Path: `data/items/swift_striker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `fire_rate` | 1.33 | 1.10 | -0.23 | Cut JSON → 1.10 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Weakening Headshot (`weakening_headshot`, T2 Weapon)
Path: `data/items/weakening_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.33 | 0.15 | -0.18 | Cut JSON → 0.15 | `[ ]` |
| `bullet_resist_shred` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.10 | 0.60 | +0.50 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_proc` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `headshot_damage` | 0.75 | 0.25 | -0.50 | Cut JSON → 0.25 | `[ ]` |
| `high_max_hp` | 0.80 | 0.30 | -0.50 | Cut JSON → 0.30 | `[x]` |
| `long_range` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[ ]` |
| `single_target` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |

### Battle Vest (`battle_vest`, T2 Vitality)
Path: `data/items/battle_vest.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.20 | 0.80 | +0.60 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | 0.85 | 1.50 | +0.65 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `high_max_hp` | 0.15 | 0.35 | +0.20 | Bump JSON → 0.35 | `[x]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.05 | 0.40 | +0.35 | Bump JSON → 0.40 | `[x]` |

### Bullet Lifesteal (`bullet_lifesteal`, T2 Vitality)
Path: `data/items/bullet_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_lifesteal` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continous_heal` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `self_heal` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |

### Debuff Reducer (`debuff_reducer`, T2 Vitality)
Path: `data/items/debuff_reducer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `counter_importance` | 0.15 | 0.80 | +0.65 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `debuff_resistance` | 0.85 | 1.50 | +0.65 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Enchanters Emblem (`enchanters_emblem`, T2 Vitality)
Path: `data/items/enchanters_emblem.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `self_heal` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `single_ability_focus` | (null) | -0.15 | -0.15 | Add row, set -0.15 | `[x]` |
| `spirit_burst_damage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `spirit_continuous_damage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `spirit_damage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |

### Enduring Speed (`enduring_speed`, T2 Vitality)
Path: `data/items/enduring_speed.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | 1.00 | +0.95 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `escape` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `farmer` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |
| `self_heal` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Guardian Ward (`guardian_ward`, T2 Vitality)
Path: `data/items/guardian_ward.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `assist_importance` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `burst_heal` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `close_to_team` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `horizontal_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `shield` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |

### Healbane (`healbane`, T2 Vitality)
Path: `data/items/healbane.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.33 | 0.12 | -0.21 | Cut JSON → 0.12 | `[x]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `spirit_lifesteal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Booster (`healing_booster`, T2 Vitality)
Path: `data/items/healing_booster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `bullet_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `continous_heal` | 0.33 | 1.30 | +0.97 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `self_heal` | 0.66 | 1.75 | +1.09 | Bump JSON → 1.75  *(large diff — review)* | `[ ]` |
| `spirit_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |

### Reactive Barrier (`reactive_barrier`, T2 Vitality)
Path: `data/items/reactive_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `burst_resistance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `cc_resist` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `counter_importance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | (null) | 1.10 | +1.10 | Add row, set 1.10  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Restorative Locket (`restorative_locket`, T2 Vitality)
Path: `data/items/restorative_locket.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.66 | 0.40 | +1.06 | Bump JSON → 0.40  *(large diff — review)* | `[ ]` |
| `assist_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `engage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `vertical_mobility` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |

### Return Fire (`return_fire`, T2 Vitality)
Path: `data/items/return_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `bullet_resistance` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.75 | 1.20 | +0.45 | Bump JSON → 1.20 | `[x]` |
| `damage_sponge` | 0.80 | 1.12 | +0.32 | Bump JSON → 1.12 | `[x]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_resistance` | -0.10 | 0.30 | +0.40 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_resistance` | 0.45 | 0.30 | -0.15 | Cut JSON → 0.30 | `[x]` |
| `long_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Lifesteal (`spirit_lifesteal`, T2 Vitality)
Path: `data/items/spirit_lifesteal.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continous_heal` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `high_max_hp` | 0.33 | 0.65 | +0.32 | Bump JSON → 0.65 | `[x]` |
| `self_heal` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `spirit_lifesteal` | 1.50 | 1.30 | -0.20 | Cut JSON → 1.30 | `[x]` |

### Spirit Shielding (`spirit_shielding`, T2 Vitality)
Path: `data/items/spirit_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `burst_resistance` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `horizontal_mobility` | 0.50 | 1.10 | +0.60 | Bump JSON → 1.10  *(large diff — review)* | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `shield` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |

### Trophy Collector (`trophy_collector`, T2 Vitality)
Path: `data/items/trophy_collector.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `escape` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | -0.20 | 1.50 | +1.70 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `high_assist_count` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 1.00 | 0.38 | -0.62 | Cut JSON → 0.38  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.85 | 1.00 | +0.15 | Bump JSON → 1.00 | `[x]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `range_extender_dependant` | 0.90 | 0.60 | -0.30 | Cut JSON → 0.60 | `[x]` |
| `scaling_early` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |

### Arcane Surge (`arcane_surge`, T2 Spirit)
Path: `data/items/arcane_surge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.10 | 0.60 | +0.50 | Bump JSON → 0.60 | `[x]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `engage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `horizontal_mobility` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `range_extender_dependant` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `single_ability_focus` | 0.33 | 0.12 | -0.21 | Cut JSON → 0.12 | `[x]` |
| `spirit_burst_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | 0.10 | 0.25 | +0.15 | Bump JSON → 0.25 | `[x]` |
| `spirit_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |

### Bullet Resist Shredder (`bullet_resist_shredder`, T2 Spirit)
Path: `data/items/bullet_resist_shredder.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.85 | 1.00 | +0.15 | Bump JSON → 1.00 | `[x]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.85 | 1.50 | +0.65 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | -0.10 | 0.05 | +0.15 | Bump JSON → 0.05 | `[x]` |
| `spirit_burst_proc` | -0.15 | 0.60 | +0.75 | Bump JSON → 0.60  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `spirit_damage` | 0.15 | 0.35 | +0.20 | Bump JSON → 0.35 | `[x]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Compress Cooldown (`compress_cooldown`, T2 Spirit)
Path: `data/items/compress_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `charge_dependant` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_ability_focus` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |

### Duration Extender (`duration_extender`, T2 Spirit)
Path: `data/items/duration_extender.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 1.25 | 1.88 | +0.62 | Bump JSON → 1.88  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `spirit_continuous_damage` | 0.33 | 0.05 | -0.28 | Cut JSON → 0.05 | `[x]` |
| `ult_focused` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |

### Improved Spirit (`improved_spirit`, T2 Spirit)
Path: `data/items/improved_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `high_max_hp` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `horizontal_mobility` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `single_ability_focus` | 0.20 | -0.20 | -0.40 | Cut JSON → -0.20 | `[x]` |
| `spirit_burst_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |
| `spirit_continuous_damage` | 0.80 | 0.60 | -0.20 | Cut JSON → 0.60 | `[x]` |
| `spirit_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Vulnerability (`mystic_vulnerability`, T2 Spirit)
Path: `data/items/mystic_vulnerability.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `spirit_continuous_proc` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Quicksilver Reload (`quicksilver_reload`, T2 Spirit)
Path: `data/items/quicksilver_reload.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `gun_continuous_damage` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `magazine_size_dependant` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `single_ability_focus` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `spirit_damage` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |

### Slowing Hex (`slowing_hex`, T2 Spirit)
Path: `data/items/slowing_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.80 | 1.00 | +0.20 | Bump JSON → 1.00 | `[x]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `displace` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `horizontal_mobility` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `silence` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `single_target` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `stun` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Suppressor (`suppressor`, T2 Spirit)
Path: `data/items/suppressor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |
| `disarm` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `fire_rate_slow` | 1.15 | 1.30 | +0.15 | Bump JSON → 1.30 | `[x]` |
| `gun_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_proc` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `spirit_continuous_proc` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `spirit_damage` | 0.65 | 0.42 | -0.23 | Cut JSON → 0.42 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Recharging Rush (`recharging_rush`, T2 Weapon)
Path: `data/items/recharging_rush.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `bullet_damage` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `charge_dependant` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `cooldown_reduction` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `gun_burst_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `magazine_size_dependant` | 0.40 | 1.07 | +0.67 | Bump JSON → 1.07  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Kinetic Dash (`kinetic_dash`, T2 Weapon)
Path: `data/items/kinetic_dash.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.05 | 0.70 | +0.65 | Bump JSON → 0.70  *(large diff — review)* | `[ ]` |
| `close_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | 0.60 | -0.15 | Cut JSON → 0.60 | `[x]` |
| `escape` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.85 | 0.70 | -0.15 | Cut JSON → 0.70 | `[x]` |
| `gun_continuous_damage` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Stalker (`stalker`, T2 Weapon)
Path: `data/items/stalker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `away_from_team` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | (null) | 1.20 | +1.20 | Add row, set 1.20  *(large diff — review)* | `[ ]` |
| `high_max_hp` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `hybrid_damage_usage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `long_range` | -0.80 | (drop) | +0.80 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_continuous_damage` | 0.05 | 1.00 | +0.95 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.05 | 0.60 | +0.55 | Bump JSON → 0.60 | `[x]` |

### Weapon Shielding (`weapon_shielding`, T2 Vitality)
Path: `data/items/weapon_shielding.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_resistance` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `burst_heal` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `burst_resistance` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `horizontal_mobility` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `shield` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |

### Cold Front (`cold_front`, T2 Spirit)
Path: `data/items/cold_front.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `assist_importance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `engage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `farmer` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_continuous_damage` | -0.15 | 0.20 | +0.35 | Bump JSON → 0.20 | `[x]` |
| `spirit_damage` | 0.45 | 0.72 | +0.27 | Bump JSON → 0.72 | `[x]` |
| `spirit_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `trap_block_obstruct` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |

### Mystic Slow (`mystic_slow`, T2 Spirit)
Path: `data/items/mystic_slow.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `counter_importance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_proc` | -0.50 | 0.50 | +1.00 | Bump JSON → 0.50  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.75 | 1.20 | +0.45 | Bump JSON → 1.20 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

## T3 (3200 souls)

### Alchemical Fire (`alchemical_fire`, T3 Weapon)
Path: `data/items/alchemical_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -3.00 | (drop) | +3.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_air` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | -0.15 | 0.30 | +0.45 | Bump JSON → 0.30 | `[x]` |
| `spirit_continuous_damage` | 0.66 | 1.20 | +0.54 | Bump JSON → 1.20 | `[x]` |
| `spirit_continuous_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.40 | 1.23 | +0.83 | Bump JSON → 1.23  *(large diff — review)* | `[ ]` |
| `trap_block_obstruct` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Berserker (`berserker`, T3 Weapon)
Path: `data/items/berserker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.15 | 1.65 | +0.50 | Bump JSON → 1.65 | `[x]` |
| `close_range` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `damage_sponge` | 1.15 | 0.25 | -0.90 | Cut JSON → 0.25  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `gun_burst_resistance` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.45 | +0.45 | Add row, set 0.45 | `[x]` |
| `high_max_hp` | 0.66 | 0.25 | -0.41 | Cut JSON → 0.25 | `[x]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `scaling_late` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Blood Tribute (`blood_tribute`, T3 Weapon)
Path: `data/items/blood_tribute.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `debuff_resistance` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `engage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `escape` | -0.15 | 0.40 | +0.55 | Bump JSON → 0.40 | `[x]` |
| `fire_rate` | 1.33 | 1.50 | +0.17 | Bump JSON → 1.50 | `[x]` |
| `gun_continuous_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | -0.88 | -1.12 | Cut JSON → -0.88  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `low_max_hp` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Hollow Point (`hollow_point`, T3 Weapon)
Path: `data/items/hollow_point.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.65 | 1.30 | +0.65 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |
| `bullet_resist_shred` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.65 | +0.65 | Add row, set 0.65  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_proc` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `high_max_hp` | 1.00 | 1.32 | +0.32 | Bump JSON → 1.32 | `[x]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Heroic Aura (`heroic_aura`, T3 Weapon)
Path: `data/items/heroic_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `assist_importance` | 0.20 | 1.20 | +1.00 | Bump JSON → 1.20  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` (ally)` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `close_to_team` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `engage` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `gun_continuous_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `high_assist_count` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | 1.10 | +0.35 | Bump JSON → 1.10 | `[x]` |
| `lane_pusher` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spawn_minions` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Tesla Bullets (`tesla_bullets`, T3 Weapon)
Path: `data/items/tesla_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.55 | 1.50 | +0.95 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `close_to_team` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | -0.66 | 0.70 | +1.36 | Bump JSON → 0.70  *(large diff — review)* | `[ ]` |
| `gun_continuous_proc` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `hybrid_damage_usage` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `spirit_burst_proc` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.10 | 0.80 | +0.70 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.20 | 1.25 | +1.05 | Bump JSON → 1.25  *(large diff — review)* | `[ ]` |

### Fury Trance (`fury_trance`, T3 Vitality)
Path: `data/items/fury_trance.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | -0.50 | -0.50 | Add row, set -0.50 | `[x]` |
| `aerial` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `counter_importance` | 0.75 | 0.60 | -0.15 | Cut JSON → 0.60 | `[x]` |
| `damage_sponge` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `engage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `escape` | (null) | -0.50 | -0.50 | Add row, set -0.50 | `[x]` |
| `fire_rate` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `gun_continuous_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `high_max_hp` | 0.15 | 0.95 | +0.80 | Bump JSON → 0.95  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `spirit_burst_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_resistance` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_resistance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `vertical_mobility` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Rescue Beam (`rescue_beam`, T3 Vitality)
Path: `data/items/rescue_beam.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `burst_heal` | 1.75 | 1.50 | -0.25 | Cut JSON → 1.50 | `[x]` |
| `cc_resist` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `counter_importance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `displace` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `horizontal_mobility` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` | 0.10 | 0.70 | +0.60 | Bump JSON → 0.70 | `[x]` |
| `self_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `team_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |

### Warp Stone (`warp_stone`, T3 Vitality)
Path: `data/items/warp_stone.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `bullet_resistance` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `cc_resist` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `escape` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_resistance` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `horizontal_mobility` | 0.40 | 0.70 | +0.30 | Bump JSON → 0.70 | `[x]` |
| `melee_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Dispel Magic (`dispel_magic`, T3 Vitality)
Path: `data/items/dispel_magic.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `cc_resist` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `counter_importance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `escape` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `self_heal` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_resistance` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `spirit_continuous_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |

### Radiant Regeneration (`radiant_regeneration`, T3 Spirit)
Path: `data/items/radiant_regeneration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 0.12 | -0.88 | Cut JSON → 0.12  *(large diff — review)* | `[ ]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `continous_heal` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `escape` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.72 | +0.47 | Bump JSON → 0.72 | `[x]` |
| `multi_ability_focus` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `self_heal` | 0.50 | 1.20 | +0.70 | Bump JSON → 1.20  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | -0.15 | -0.15 | Add row, set -0.15 | `[x]` |
| `spirit_burst_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_continuous_damage` | 0.25 | 0.05 | -0.20 | Cut JSON → 0.05 | `[x]` |
| `spirit_continuous_proc` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `spirit_continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `spirit_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Ballistic Enchantment (`ballistic_enchantment`, T3 Weapon)
Path: `data/items/ballistic_enchantment.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.66 | 1.45 | +0.79 | Bump JSON → 1.45  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_burst_damage` | (null) | 0.65 | +0.65 | Add row, set 0.65  *(large diff — review)* | `[ ]` |
| `gun_continuous_damage` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `range_extender_dependant` | 0.90 | 0.50 | -0.40 | Cut JSON → 0.50 | `[x]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Burst Fire (`burst_fire`, T3 Weapon)
Path: `data/items/burst_fire.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `farmer` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.66 | 1.50 | -0.16 | Cut JSON → 1.50 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | 0.75 | +0.60 | Bump JSON → 0.75 | `[x]` |
| `gun_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | 0.20 | -0.55 | Cut JSON → 0.20 | `[x]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Cultist Sacrifice (`cultist_sacrifice`, T3 Weapon)
Path: `data/items/cultist_sacrifice.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `charge_dependant` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `farmer` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `gun_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `gun_continuous_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `scaling_early` | 0.05 | 0.60 | +0.55 | Bump JSON → 0.60 | `[x]` |
| `self_heal` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |

### Escalating Resilience (`escalating_resilience`, T3 Weapon)
Path: `data/items/escalating_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `bullet_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `damage_sponge` | (null) | 0.72 | +0.72 | Add row, set 0.72  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `gun_burst_resistance` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `magazine_size_dependant` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `scaling_late` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Express Shot (`express_shot`, T3 Weapon)
Path: `data/items/express_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `burst_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_damage` | -0.15 | 0.30 | +0.45 | Bump JSON → 0.30 | `[x]` |
| `gun_continuous_proc` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `mid_range` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_target` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |

### Headhunter (`headhunter`, T3 Weapon)
Path: `data/items/headhunter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.66 | 0.30 | -0.36 | Cut JSON → 0.30 | `[x]` |
| `bullet_lifesteal` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.20 | 0.60 | +0.40 | Bump JSON → 0.60 | `[x]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `engage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `gun_burst_proc` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `gun_continuous_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `headshot_damage` | 1.25 | 1.75 | +0.50 | Bump JSON → 1.75 | `[x]` |
| `horizontal_mobility` | 0.50 | 0.20 | -0.30 | Cut JSON → 0.20 | `[x]` |
| `long_range` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `self_heal` | 0.45 | 0.80 | +0.35 | Bump JSON → 0.80 | `[x]` |
| `single_target` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Hunters Aura (`hunters_aura`, T3 Weapon)
Path: `data/items/hunters_aura.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | (null) | 1.20 | +1.20 | Add row, set 1.20  *(large diff — review)* | `[ ]` |
| `bullet_resist_shred` | 0.75 | 1.30 | +0.55 | Bump JSON → 1.30 | `[x]` |
| `close_range` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `close_to_team` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `counter_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `disarm` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `fire_rate_slow` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `high_max_hp` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Point Blank (`point_blank`, T3 Weapon)
Path: `data/items/point_blank.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | 1.55 | +0.80 | Bump JSON → 1.55  *(large diff — review)* | `[ ]` |
| `engage` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `farmer` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.65 | +0.50 | Bump JSON → 0.65 | `[x]` |
| `gun_burst_proc` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_damage` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `high_max_hp` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `long_range` | -1.25 | (drop) | +1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 1.66 | 1.50 | -0.16 | Cut JSON → 1.50 | `[x]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Shadow Weave (`shadow_weave`, T3 Weapon)
Path: `data/items/shadow_weave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `bullet_damage` | 0.33 | 0.15 | -0.18 | Cut JSON → 0.15 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `engage` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `escape` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.66 | 0.20 | -0.46 | Cut JSON → 0.20 | `[x]` |
| `gun_burst_damage` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `gun_continuous_damage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `hybrid_damage_usage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `self_buff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `single_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `small_hitbox` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |

### Sharpshooter (`sharpshooter`, T3 Weapon)
Path: `data/items/sharpshooter.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | -0.30 | -0.45 | Cut JSON → -0.30 | `[x]` |
| `away_from_team` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `bullet_damage` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `close_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `gun_continuous_damage` | (null) | 0.45 | +0.45 | Add row, set 0.45 | `[x]` |
| `headshot_damage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `horizontal_mobility` | -0.15 | -0.30 | -0.15 | Cut JSON → -0.30 | `[x]` |
| `long_range` | 1.50 | 1.88 | +0.38 | Bump JSON → 1.88 | `[x]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |

### Spirit Rend (`spirit_rend`, T3 Weapon)
Path: `data/items/spirit_rend.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `headshot_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.75 | 0.38 | -0.38 | Cut JSON → 0.38 | `[x]` |
| `hybrid_damage_usage` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |

### Toxic Bullets (`toxic_bullets`, T3 Weapon)
Path: `data/items/toxic_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | 0.66 | 1.20 | +0.54 | Bump JSON → 1.20 | `[x]` |
| `hybrid_damage_usage` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_continuous_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Weighted Shots (`weighted_shots`, T3 Weapon)
Path: `data/items/weighted_shots.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | -0.30 | -0.30 | Add row, set -0.30 | `[x]` |
| `bullet_damage` | 1.15 | 1.50 | +0.35 | Bump JSON → 1.50 | `[x]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 0.05 | 1.00 | +0.95 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `engage` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `gun_continuous_damage` | (null) | 0.45 | +0.45 | Add row, set 0.45 | `[x]` |
| `horizontal_mobility` | -0.15 | -0.30 | -0.15 | Cut JSON → -0.30 | `[x]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Bullet Resilience (`bullet_resilience`, T3 Vitality)
Path: `data/items/bullet_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_resistance` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `counter_importance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `gun_burst_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `gun_continuous_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `melee_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |

### Counterspell (`counterspell`, T3 Vitality)
Path: `data/items/counterspell.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_resistance` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `cc_resist` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `counter_importance` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.35 | +0.35 | Add row, set 0.35 | `[x]` |
| `spirit_damage` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `spirit_resistance` | 0.40 | 1.50 | +1.10 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |

### Fortitude (`fortitude`, T3 Vitality)
Path: `data/items/fortitude.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `damage_sponge` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `escape` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `farmer` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `high_max_hp` | 1.33 | 2.00 | +0.67 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Nova (`healing_nova`, T3 Vitality)
Path: `data/items/healing_nova.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `assist_importance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `away_from_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.75 | 1.50 | -0.25 | Cut JSON → 1.50 | `[x]` |
| `close_to_team` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `spirit_damage` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `team_heal` | 1.75 | 1.50 | -0.25 | Cut JSON → 1.50 | `[x]` |

### Lifestrike (`lifestrike`, T3 Vitality)
Path: `data/items/lifestrike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[x]` |
| `close_range` | 1.15 | 0.60 | -0.55 | Cut JSON → 0.60 | `[x]` |
| `continous_heal` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `engage` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `farmer` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `grounded` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `high_max_hp` | 0.25 | 0.68 | +0.43 | Bump JSON → 0.68 | `[x]` |
| `long_range` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.33 | 1.88 | +1.54 | Bump JSON → 1.88  *(large diff — review)* | `[ ]` |
| `movement_slow` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `self_heal` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |

### Majestic Leap (`majestic_leap`, T3 Vitality)
Path: `data/items/majestic_leap.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `aoe_cluster` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `burst_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `damage_sponge` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `displace` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `engage` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `escape` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `high_max_hp` | (null) | 0.22 | +0.22 | Add row, set 0.22 | `[x]` |
| `horizontal_mobility` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `movement_slow` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `shield` | 0.40 | (drop) | -0.40 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |

### Metal Skin (`metal_skin`, T3 Vitality)
Path: `data/items/metal_skin.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_evasion` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.01 | 1.50 | +1.49 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `counter_importance` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `damage_sponge` | (null) | 1.12 | +1.12 | Add row, set 1.12  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `gun_burst_resistance` | 1.15 | 0.70 | -0.45 | Cut JSON → 0.70 | `[x]` |
| `gun_continuous_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `melee_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `vertical_mobility` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Resilience (`spirit_resilience`, T3 Vitality)
Path: `data/items/spirit_resilience.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `counter_importance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `self_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_continuous_resistance` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_resistance` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |

### Stamina Mastery (`stamina_mastery`, T3 Vitality)
Path: `data/items/stamina_mastery.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[x]` |
| `farmer` | 0.05 | 0.40 | +0.35 | Bump JSON → 0.40 | `[x]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `vertical_mobility` | 0.90 | 2.25 | +1.35 | Bump JSON → 2.25  *(large diff — review)* | `[ ]` |

### Veil Walker (`veil_walker`, T3 Vitality)
Path: `data/items/veil_walker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `engage` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `escape` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `farmer` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `high_max_hp` | (null) | 0.65 | +0.65 | Add row, set 0.65  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.66 | 2.00 | +1.34 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_damage` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `vertical_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Decay (`decay`, T3 Spirit)
Path: `data/items/decay.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `debuff` | 1.25 | 0.60 | -0.65 | Cut JSON → 0.60  *(large diff — review)* | `[ ]` |
| `dot` | 0.75 | 1.30 | +0.55 | Bump JSON → 1.30 | `[x]` |
| `high_max_hp` | 0.30 | (drop) | -0.30 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `spirit_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_continuous_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.35 | 1.30 | +0.95 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |

### Disarming Hex (`disarming_hex`, T3 Spirit)
Path: `data/items/disarming_hex.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `bullet_evasion` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `bullet_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.25 | 0.60 | +0.35 | Bump JSON → 0.60 | `[x]` |
| `disarm` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `engage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.95 | (drop) | -0.95 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |

### Greater Expansion (`greater_expansion`, T3 Spirit)
Path: `data/items/greater_expansion.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `long_range` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `multi_ability_focus` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `range_extender_dependant` | 1.33 | 2.25 | +0.92 | Bump JSON → 2.25  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | 0.33 | -0.15 | -0.48 | Cut JSON → -0.15 | `[x]` |
| `spirit_burst_resistance` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_continuous_resistance` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `ult_focused` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Knockdown (`knockdown`, T3 Spirit)
Path: `data/items/knockdown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_air` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | 0.05 | 0.60 | +0.55 | Bump JSON → 0.60 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `interrupt` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `range_extender_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `stun` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[x]` |

### Rapid Recharge (`rapid_recharge`, T3 Spirit)
Path: `data/items/rapid_recharge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `charge_dependant` | 1.75 | 2.38 | +0.62 | Bump JSON → 2.38  *(large diff — review)* | `[ ]` |
| `cooldown_reduction` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `single_ability_focus` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `spirit_damage` | 0.25 | 0.55 | +0.30 | Bump JSON → 0.55 | `[x]` |

### Silence Wave (`silence_wave`, T3 Spirit)
Path: `data/items/silence_wave.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `assist_importance` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `burst_damage` | 0.35 | (drop) | -0.35 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `engage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `grounded` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `spirit_damage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_resistance` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |

### Spirit Snatch (`spirit_snatch`, T3 Spirit)
Path: `data/items/spirit_snatch.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `debuff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `grounded` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `high_max_hp` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `long_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.75 | 0.55 | -0.20 | Cut JSON → 0.55 | `[x]` |
| `spirit_burst_damage` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `spirit_burst_proc` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_damage` | -0.10 | 0.40 | +0.50 | Bump JSON → 0.40 | `[x]` |
| `spirit_continuous_proc` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `spirit_damage` | 0.33 | 1.15 | +0.82 | Bump JSON → 1.15  *(large diff — review)* | `[ ]` |
| `spirit_resist_shred` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Superior Cooldown (`superior_cooldown`, T3 Spirit)
Path: `data/items/superior_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `charge_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `cooldown_reduction` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `self_heal` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Superior Duration (`superior_duration`, T3 Spirit)
Path: `data/items/superior_duration.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_resistance` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 2.00 | 2.38 | +0.38 | Bump JSON → 2.38 | `[x]` |
| `multi_ability_focus` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_continuous_damage` | 0.50 | 0.05 | -0.45 | Cut JSON → 0.05 | `[x]` |
| `ult_focused` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |

### Surge of Power (`surge_of_power`, T3 Spirit)
Path: `data/items/surge_of_power.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `fire_rate` | 0.45 | 0.70 | +0.25 | Bump JSON → 0.70 | `[x]` |
| `horizontal_mobility` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `hybrid_damage_usage` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `multi_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_ability_focus` | 0.15 | -0.15 | -0.30 | Cut JSON → -0.15 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_damage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `spirit_damage` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Tankbuster (`tankbuster`, T3 Spirit)
Path: `data/items/tankbuster.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `counter_importance` | 0.05 | 1.50 | +1.45 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `pure_damage` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | 0.05 | 0.40 | +0.35 | Bump JSON → 0.40 | `[x]` |
| `single_target` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_proc` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `spirit_continuous_proc` | -0.25 | 0.20 | +0.45 | Bump JSON → 0.20 | `[x]` |
| `spirit_damage` | 0.20 | 0.85 | +0.65 | Bump JSON → 0.85  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Torment Pulse (`torment_pulse`, T3 Spirit)
Path: `data/items/torment_pulse.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `close_to_team` | -0.33 | 0.40 | +0.73 | Bump JSON → 0.40  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `high_max_hp` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.05 | 0.30 | +0.25 | Bump JSON → 0.30 | `[x]` |
| `melee_resistance` | 0.20 | 0.70 | +0.50 | Bump JSON → 0.70 | `[x]` |
| `mid_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | 0.25 | +0.15 | Bump JSON → 0.25 | `[x]` |
| `spirit_continuous_damage` | 0.10 | 1.50 | +1.40 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_damage` | 0.30 | 1.05 | +0.75 | Bump JSON → 1.05  *(large diff — review)* | `[ ]` |

## T4 (6400 souls)

### Glass Cannon (`glass_cannon`, T4 Weapon)
Path: `data/items/glass_cannon.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |
| `damage_sponge` | -0.15 | 0.12 | +0.28 | Bump JSON → 0.12 | `[x]` |
| `fire_rate` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_damage` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `gun_continuous_damage` | 0.66 | 1.10 | +0.44 | Bump JSON → 1.10 | `[x]` |
| `high_kill_count` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `high_max_hp` | -0.15 | -0.50 | -0.35 | Cut JSON → -0.50 | `[x]` |
| `low_max_hp` | 0.15 | -0.50 | -0.65 | Cut JSON → -0.50  *(large diff — review)* | `[ ]` |
| `melee_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |

### Spellslinger (`spellslinger`, T4 Weapon)
Path: `data/items/spellslinger.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.50 | 1.00 | -0.50 | Cut JSON → 1.00 | `[x]` |
| `charge_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `fire_rate` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `hybrid_damage_usage` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `magazine_size_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `scaling_late` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | -0.20 | -0.20 | Add row, set -0.20 | `[x]` |

### Boundless Spirit (`boundless_spirit`, T4 Spirit)
Path: `data/items/boundless_spirit.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `high_max_hp` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `multi_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `scaling_late` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `self_heal` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `single_ability_focus` | (null) | -0.20 | -0.20 | Add row, set -0.20 | `[x]` |
| `spirit_damage` | 1.75 | 2.38 | +0.62 | Bump JSON → 2.38  *(large diff — review)* | `[ ]` |
| `ult_focused` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Armor Piercing Rounds (`armor_piercing_rounds`, T4 Weapon)
Path: `data/items/armor_piercing_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `bullet_proc` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `bullet_resist_shred` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `counter_importance` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `gun_burst_damage` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `gun_burst_proc` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `long_range` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `pure_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Capacitor (`capacitor`, T4 Weapon)
Path: `data/items/capacitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `engage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_proc` | -0.15 | 0.40 | +0.55 | Bump JSON → 0.40 | `[x]` |
| `hybrid_damage_usage` | 0.45 | 1.20 | +0.75 | Bump JSON → 1.20  *(large diff — review)* | `[ ]` |
| `movement_slow` | 0.45 | 1.00 | +0.55 | Bump JSON → 1.00 | `[x]` |
| `silence` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_proc` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `spirit_damage` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |

### Crippling Headshot (`crippling_headshot`, T4 Weapon)
Path: `data/items/crippling_headshot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `assist_importance` | 0.15 | 1.20 | +1.05 | Bump JSON → 1.20  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.66 | 2.00 | +1.34 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.50 | 0.30 | -0.20 | Cut JSON → 0.30 | `[x]` |
| `headshot_damage` | 0.66 | 0.25 | -0.41 | Cut JSON → 0.25 | `[x]` |
| `hybrid_damage_usage` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `long_range` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.66 | 2.00 | +1.34 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |

### Crushing Fists (`crushing_fists`, T4 Weapon)
Path: `data/items/crushing_fists.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.25 | 0.70 | -0.55 | Cut JSON → 0.70 | `[x]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `grounded` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `gun_burst_damage` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `gun_burst_proc` | 0.20 | 0.40 | +0.20 | Bump JSON → 0.40 | `[x]` |
| `gun_continuous_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 2.00 | 2.38 | +0.38 | Bump JSON → 2.38 | `[x]` |
| `melee_resistance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |

### Frenzy (`frenzy`, T4 Weapon)
Path: `data/items/frenzy.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `cc_resist` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `damage_sponge` | 0.75 | 0.17 | -0.57 | Cut JSON → 0.17 | `[x]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `escape` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `fire_rate` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `scaling_late` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Lucky Shot (`lucky_shot`, T4 Weapon)
Path: `data/items/lucky_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `bullet_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `fire_rate` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_proc` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_damage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |

### Ricochet (`ricochet`, T4 Weapon)
Path: `data/items/ricochet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `bullet_damage` | 0.33 | 1.65 | +1.32 | Bump JSON → 1.65  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `fire_rate` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `gun_burst_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `gun_continuous_proc` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `lane_pusher` | 1.25 | 0.50 | -0.75 | Cut JSON → 0.50  *(large diff — review)* | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Silencer (`silencer`, T4 Weapon)
Path: `data/items/silencer.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `bullet_proc` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `interrupt` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.25 | 1.50 | +0.25 | Bump JSON → 1.50 | `[x]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `spirit_continuous_resistance` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |

### Spiritual Overflow (`spiritual_overflow`, T4 Weapon)
Path: `data/items/spiritual_overflow.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `duration_dependant` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `gun_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `gun_continuous_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.66 | 2.38 | +1.71 | Bump JSON → 2.38  *(large diff — review)* | `[ ]` |
| `multi_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `self_heal` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_damage` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `spirit_lifesteal` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |

### Cheat Death (`cheat_death`, T4 Vitality)
Path: `data/items/cheat_death.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | (null) | -0.50 | -0.50 | Add row, set -0.50 | `[x]` |
| `away_from_team` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.50 | 0.70 | +0.20 | Bump JSON → 0.70 | `[x]` |
| `burst_resistance` | 0.50 | 2.00 | +1.50 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `cc_resist` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 1.00 | 1.75 | +0.75 | Bump JSON → 1.75  *(large diff — review)* | `[ ]` |
| `gun_burst_resistance` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.75 | 0.90 | +0.15 | Bump JSON → 0.90 | `[x]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Colossus (`colossus`, T4 Vitality)
Path: `data/items/colossus.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `burst_resistance` | 0.85 | 1.50 | +0.65 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `close_range` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `grounded` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_resistance` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `gun_continuous_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `large_hitbox` | 1.00 | -0.40 | -1.40 | Cut JSON → -0.40  *(large diff — review)* | `[ ]` |
| `melee_damage` | 0.75 | 0.30 | -0.45 | Cut JSON → 0.30 | `[x]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 1.00 | 0.50 | -0.50 | Cut JSON → 0.50 | `[x]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.66 | 0.50 | -0.16 | Cut JSON → 0.50 | `[x]` |
| `spirit_continuous_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `spirit_resistance` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Divine Barrier (`divine_barrier`, T4 Vitality)
Path: `data/items/divine_barrier.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | 0.75 | 2.00 | +1.25 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `burst_heal` | (null) | 1.20 | +1.20 | Add row, set 1.20  *(large diff — review)* | `[ ]` |
| `close_to_team` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `continous_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.05 | 0.50 | +0.45 | Bump JSON → 0.50 | `[x]` |
| `counter_importance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `range_extender_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |

### Diviners Kevlar (`diviners_kevlar`, T4 Vitality)
Path: `data/items/diviners_kevlar.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `burst_resistance` | 0.10 | 1.50 | +1.40 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `duration_dependant` | 0.15 | 0.70 | +0.55 | Bump JSON → 0.70 | `[x]` |
| `gun_burst_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `low_max_hp` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_burst_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_resistance` | 0.10 | 0.80 | +0.70 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.45 | 2.00 | +1.55 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `ult_focused` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Healing Tempo (`healing_tempo`, T4 Vitality)
Path: `data/items/healing_tempo.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `bullet_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `close_to_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_damage` | (null) | 0.75 | +0.75 | Add row, set 0.75  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.25 | 0.80 | +0.55 | Bump JSON → 0.80 | `[x]` |
| `lane_pusher` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.45 | 1.75 | +1.30 | Bump JSON → 1.75  *(large diff — review)* | `[ ]` |
| `spirit_lifesteal` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Indomitable (`indomitable`, T4 Vitality)
Path: `data/items/indomitable.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `burst_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `burst_resistance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `cc_resist` | 1.75 | 2.00 | +0.25 | Bump JSON → 2.00 | `[x]` |
| `counter_importance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `debuff_resistance` | 0.05 | 1.50 | +1.45 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `ult_focused` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |

### Infuser (`infuser`, T4 Vitality)
Path: `data/items/infuser.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `continous_heal` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `high_max_hp` | 0.25 | 0.68 | +0.43 | Bump JSON → 0.68 | `[x]` |
| `multi_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `self_heal` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | 0.10 | 0.40 | +0.30 | Bump JSON → 0.40 | `[x]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.25 | 0.40 | +0.15 | Bump JSON → 0.40 | `[x]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | 0.75 | +0.25 | Bump JSON → 0.75 | `[x]` |
| `spirit_lifesteal` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `spirit_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |

### Inhibitor (`inhibitor`, T4 Vitality)
Path: `data/items/inhibitor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `assist_importance` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_damage` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `gun_burst_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_continuous_damage` | (null) | 0.15 | +0.15 | Add row, set 0.15 | `[x]` |
| `gun_continuous_proc` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `gun_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.33 | 0.85 | +0.52 | Bump JSON → 0.85 | `[x]` |
| `melee_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Juggernaut (`juggernaut`, T4 Vitality)
Path: `data/items/juggernaut.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `cc_resist` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `continous_heal` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 0.75 | 1.62 | +0.88 | Bump JSON → 1.62  *(large diff — review)* | `[ ]` |
| `disarm` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `escape` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `fire_rate_slow` | 0.85 | 2.00 | +1.15 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |
| `low_max_hp` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `self_heal` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Leech (`leech`, T4 Vitality)
Path: `data/items/leech.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `bullet_lifesteal` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.66 | 0.12 | -0.54 | Cut JSON → 0.12 | `[x]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.40 | 0.97 | +0.57 | Bump JSON → 0.97 | `[x]` |
| `hybrid_damage_usage` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `melee_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `spirit_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_lifesteal` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

### Phantom Strike (`phantom_strike`, T4 Vitality)
Path: `data/items/phantom_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_air` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `burst_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `close_to_team` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `disarm` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `displace` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `engage` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `escape` | -0.20 | 0.70 | +0.90 | Bump JSON → 0.70  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `gun_burst_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.15 | 0.40 | +0.25 | Bump JSON → 0.40 | `[x]` |
| `mid_range` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `spirit_burst_damage` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_burst_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |

### Plated Armor (`plated_armor`, T4 Vitality)
Path: `data/items/plated_armor.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_evasion` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `bullet_resistance` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `continuous_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 1.00 | 1.30 | +0.30 | Bump JSON → 1.30 | `[x]` |
| `damage_sponge` | 1.50 | 1.12 | -0.38 | Cut JSON → 1.12 | `[x]` |
| `gun_continuous_resistance` | 1.25 | 0.70 | -0.55 | Cut JSON → 0.70 | `[x]` |
| `high_max_hp` | 0.33 | 0.65 | +0.32 | Bump JSON → 0.65 | `[x]` |

### Siphon Bullets (`siphon_bullets`, T4 Vitality)
Path: `data/items/siphon_bullets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `bullet_lifesteal` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `bullet_proc` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `bullet_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `close_range` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `continous_heal` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `grounded` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_damage` | 0.15 | 0.35 | +0.20 | Bump JSON → 0.35 | `[x]` |
| `gun_burst_proc` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_proc` | 1.00 | 0.60 | -0.40 | Cut JSON → 0.60 | `[x]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_kill_count` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `high_max_hp` | 0.75 | 0.28 | -0.47 | Cut JSON → 0.28 | `[x]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `pure_damage` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_late` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `self_heal` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Spellbreaker (`spellbreaker`, T4 Vitality)
Path: `data/items/spellbreaker.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_resistance` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `cc_resist` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `debuff_resistance` | 0.33 | 1.50 | +1.17 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.75 | 1.20 | -0.55 | Cut JSON → 1.20 | `[x]` |
| `spirit_resistance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |

### Unstoppable (`unstoppable`, T4 Vitality)
Path: `data/items/unstoppable.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `burst_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `cc_resist` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.75 | 1.50 | +0.75 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `debuff_resistance` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `escape` | 0.15 | 0.60 | +0.45 | Bump JSON → 0.60 | `[x]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Vampiric Burst (`vampiric_burst`, T4 Vitality)
Path: `data/items/vampiric_burst.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_lifesteal` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `bullet_proc` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | 0.50 | +0.17 | Bump JSON → 0.50 | `[x]` |
| `continous_heal` | 0.33 | 0.70 | +0.37 | Bump JSON → 0.70 | `[x]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `farmer` | 0.10 | 0.30 | +0.20 | Bump JSON → 0.30 | `[x]` |
| `gun_burst_damage` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | 0.68 | +0.43 | Bump JSON → 0.68 | `[x]` |
| `magazine_size_dependant` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `melee_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Witchmail (`witchmail`, T4 Vitality)
Path: `data/items/witchmail.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `away_from_team` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 1.00 | 0.20 | -0.80 | Cut JSON → 0.20  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_burst_damage` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_burst_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_continuous_resistance` | 0.75 | 0.40 | -0.35 | Cut JSON → 0.40 | `[x]` |
| `spirit_damage` | 0.70 | 0.50 | -0.20 | Cut JSON → 0.50 | `[x]` |
| `spirit_resistance` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |

### Arctic Blast (`arctic_blast`, T4 Spirit)
Path: `data/items/arctic_blast.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.55 | (drop) | +0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.45 | 1.50 | +1.05 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `assist_importance` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `engage` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `farmer` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_damage` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `spirit_burst_proc` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `spirit_continuous_damage` | -0.15 | 0.30 | +0.45 | Bump JSON → 0.30 | `[x]` |
| `spirit_continuous_proc` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_damage` | 0.45 | 0.80 | +0.35 | Bump JSON → 0.80 | `[x]` |
| `spirit_resistance` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `stun` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |

### Cursed Relic (`cursed_relic`, T4 Spirit)
Path: `data/items/cursed_relic.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.15 | 0.50 | +0.35 | Bump JSON → 0.50 | `[x]` |
| `counter_importance` | 0.50 | 1.30 | +0.80 | Bump JSON → 1.30  *(large diff — review)* | `[ ]` |
| `debuff` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `disarm` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `interrupt` | 1.25 | 0.70 | -0.55 | Cut JSON → 0.70 | `[x]` |
| `silence` | 1.25 | 0.70 | -0.55 | Cut JSON → 0.70 | `[x]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Echo Shard (`echo_shard`, T4 Spirit)
Path: `data/items/echo_shard.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `cooldown_reduction` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `duration_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `single_ability_focus` | 2.00 | 1.25 | -0.75 | Cut JSON → 1.25  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_resistance` | 0.05 | 0.20 | +0.15 | Bump JSON → 0.20 | `[x]` |
| `ult_focused` | -0.25 | 1.00 | +1.25 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |

### Escalating Exposure (`escalating_exposure`, T4 Spirit)
Path: `data/items/escalating_exposure.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `farmer` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_assist_count` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `spirit_burst_proc` | -0.15 | 0.60 | +0.75 | Bump JSON → 0.60  *(large diff — review)* | `[ ]` |
| `spirit_continuous_damage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `spirit_continuous_proc` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `spirit_damage` | 0.33 | 0.53 | +0.20 | Bump JSON → 0.53 | `[x]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.20 | 0.80 | +0.60 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `spirit_resistance` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |

### Ethereal Shift (`ethereal_shift`, T4 Spirit)
Path: `data/items/ethereal_shift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.33 | 2.00 | +1.67 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `cc_resist` | 1.75 | 1.50 | -0.25 | Cut JSON → 1.50 | `[x]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 0.80 | +0.30 | Bump JSON → 0.80 | `[x]` |
| `debuff_resistance` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `engage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `escape` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_burst_resistance` | -0.50 | 1.50 | +2.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_continuous_resistance` | -0.50 | 1.50 | +2.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.66 | 0.40 | -0.26 | Cut JSON → 0.40 | `[x]` |
| `long_range` | -0.33 | (drop) | +0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `spirit_continuous_resistance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `vertical_mobility` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |

### Focus Lens (`focus_lens`, T4 Spirit)
Path: `data/items/focus_lens.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `assist_importance` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `bullet_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `fire_rate` | 0.25 | 0.10 | -0.15 | Cut JSON → 0.10 | `[x]` |
| `gun_continuous_damage` | 0.15 | 0.30 | +0.15 | Bump JSON → 0.30 | `[x]` |
| `headshot_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 1.00 | 1.50 | +0.50 | Bump JSON → 1.50 | `[x]` |
| `spirit_burst_damage` | 0.25 | 0.70 | +0.45 | Bump JSON → 0.70 | `[x]` |
| `spirit_continuous_damage` | 0.20 | 0.05 | -0.15 | Cut JSON → 0.05 | `[x]` |
| `spirit_damage` | 0.30 | 0.15 | -0.15 | Cut JSON → 0.15 | `[x]` |
| `spirit_resist_shred` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |

### Lightning Scroll (`lightning_scroll`, T4 Spirit)
Path: `data/items/lightning_scroll.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `counter_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `debuff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `escape` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `interrupt` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `movement_slow` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `single_target` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | 0.70 | +0.60 | Bump JSON → 0.70 | `[x]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | 0.65 | +0.40 | Bump JSON → 0.65 | `[x]` |
| `spirit_proc` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `stun` | 1.25 | 1.00 | -0.25 | Cut JSON → 1.00 | `[x]` |
| `ult_focused` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Magic Carpet (`magic_carpet`, T4 Spirit)
Path: `data/items/magic_carpet.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 0.10 | 2.00 | +1.90 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `away_from_team` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `duration_dependant` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |
| `engage` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `escape` | 2.00 | 1.50 | -0.50 | Cut JSON → 1.50 | `[x]` |
| `farmer` | 0.20 | 0.50 | +0.30 | Bump JSON → 0.50 | `[x]` |
| `gun_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.20 | 1.05 | +0.85 | Bump JSON → 1.05  *(large diff — review)* | `[ ]` |
| `horizontal_mobility` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `mid_range` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `multi_ability_focus` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `spirit_burst_damage` | (null) | 0.25 | +0.25 | Add row, set 0.25 | `[x]` |
| `spirit_burst_resistance` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | -0.10 | 0.25 | +0.35 | Bump JSON → 0.25 | `[x]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.20 | 0.65 | +0.45 | Bump JSON → 0.65 | `[x]` |
| `vertical_mobility` | 0.66 | 1.50 | +0.84 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |

### Mercurial Magnum (`mercurial_magnum`, T4 Spirit)
Path: `data/items/mercurial_magnum.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.20 | 1.00 | +0.80 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `gun_burst_proc` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `gun_continuous_damage` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `gun_continuous_proc` | 0.15 | 1.50 | +1.35 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `hybrid_damage_usage` | 0.66 | 2.25 | +1.59 | Bump JSON → 2.25  *(large diff — review)* | `[ ]` |
| `magazine_size_dependant` | 1.25 | 0.50 | -0.75 | Cut JSON → 0.50  *(large diff — review)* | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `spirit_burst_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_continuous_damage` | 0.20 | 0.80 | +0.60 | Bump JSON → 0.80  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.15 | 1.00 | +0.85 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.33 | 1.15 | +0.82 | Bump JSON → 1.15  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Mystic Reverb (`mystic_reverb`, T4 Spirit)
Path: `data/items/mystic_reverb.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | 2.00 | +1.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `counter_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 0.80 | +0.80 | Add row, set 0.80  *(large diff — review)* | `[ ]` |
| `farmer` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.33 | 1.00 | +0.67 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `self_heal` | 0.33 | 0.60 | +0.27 | Bump JSON → 0.60 | `[x]` |
| `single_ability_focus` | 1.00 | 0.40 | -0.60 | Cut JSON → 0.40 | `[x]` |
| `single_target` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.50 | 2.00 | +0.50 | Bump JSON → 2.00 | `[x]` |
| `spirit_burst_proc` | 1.00 | 0.80 | -0.20 | Cut JSON → 0.80 | `[x]` |
| `spirit_continuous_damage` | -0.10 | 0.70 | +0.80 | Bump JSON → 0.70  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | -0.15 | 1.50 | +1.65 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_damage` | 0.25 | 1.65 | +1.40 | Bump JSON → 1.65  *(large diff — review)* | `[ ]` |
| `spirit_lifesteal` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Refresher (`refresher`, T4 Spirit)
Path: `data/items/refresher.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `bullet_resistance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `charge_dependant` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.25 | 1.50 | +1.25 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `gun_burst_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `gun_continuous_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `hybrid_damage_usage` | -0.15 | (drop) | +0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | 0.25 | 0.88 | +0.62 | Bump JSON → 0.88  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `spirit_burst_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `spirit_continuous_damage` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `spirit_continuous_resistance` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `spirit_resistance` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `ult_focused` | 1.15 | 2.00 | +0.85 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |

### Scourge (`scourge`, T4 Spirit)
Path: `data/items/scourge.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `anti_heal` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `aoe_cluster` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | 0.33 | 0.80 | +0.47 | Bump JSON → 0.80 | `[x]` |
| `cc_resist` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `close_range` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `damage_sponge` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `debuff_resistance` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `dot` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `grounded` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.25 | (drop) | +0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `spirit_burst_damage` | -0.15 | 0.20 | +0.35 | Bump JSON → 0.20 | `[x]` |
| `spirit_continuous_damage` | 0.50 | 1.00 | +0.50 | Bump JSON → 1.00 | `[x]` |
| `spirit_continuous_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.75 | 0.50 | -0.25 | Cut JSON → 0.50 | `[x]` |
| `spirit_damage` | 0.20 | 0.95 | +0.75 | Bump JSON → 0.95  *(large diff — review)* | `[ ]` |
| `spirit_resistance` | 0.66 | 1.00 | +0.34 | Bump JSON → 1.00 | `[x]` |

### Spirit Burn (`spirit_burn`, T4 Spirit)
Path: `data/items/spirit_burn.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 1.25 | 2.00 | +0.75 | Bump JSON → 2.00  *(large diff — review)* | `[ ]` |
| `aoe_cluster` | 0.25 | 1.00 | +0.75 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `assist_importance` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `bullet_proc` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `damage_sponge` | (null) | 0.60 | +0.60 | Add row, set 0.60 | `[x]` |
| `dot` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `range_extender_dependant` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `range_extender_dependant` (ult-only)` | (null) | 1.00 | +1.00 | Add row, set 1.00  *(large diff — review)* | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 1.00 | 0.70 | -0.30 | Cut JSON → 0.70 | `[x]` |
| `spirit_burst_proc` | 0.90 | 0.60 | -0.30 | Cut JSON → 0.60 | `[x]` |
| `spirit_continuous_damage` | 0.50 | 1.50 | +1.00 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `spirit_continuous_proc` | 0.25 | 0.50 | +0.25 | Bump JSON → 0.50 | `[x]` |
| `spirit_damage` | 0.50 | 1.35 | +0.85 | Bump JSON → 1.35  *(large diff — review)* | `[ ]` |
| `spirit_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `ult_focused` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |

### Transcendent Cooldown (`transcendent_cooldown`, T4 Spirit)
Path: `data/items/transcendent_cooldown.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ability_spam` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |
| `continous_heal` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `multi_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `self_heal` | 0.10 | 0.50 | +0.40 | Bump JSON → 0.50 | `[x]` |
| `single_ability_focus` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |

### Vortex Web (`vortex_web`, T4 Spirit)
Path: `data/items/vortex_web.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.20 | 1.50 | +1.30 | Bump JSON → 1.50  *(large diff — review)* | `[ ]` |
| `assist_importance` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `close_to_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.10 | 1.00 | +0.90 | Bump JSON → 1.00  *(large diff — review)* | `[ ]` |
| `debuff` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `disarm` | (null) | 0.70 | +0.70 | Add row, set 0.70  *(large diff — review)* | `[ ]` |
| `displace` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `engage` | (null) | 1.50 | +1.50 | Add row, set 1.50  *(large diff — review)* | `[ ]` |
| `farmer` | (null) | 0.30 | +0.30 | Add row, set 0.30 | `[x]` |
| `horizontal_mobility` | (null) | 0.20 | +0.20 | Add row, set 0.20 | `[x]` |
| `interrupt` | (null) | 0.50 | +0.50 | Add row, set 0.50 | `[x]` |
| `movement_slow` | 0.75 | 1.00 | +0.25 | Bump JSON → 1.00 | `[x]` |
| `range_extender_dependant` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `silence` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_ability_focus` | (null) | 0.40 | +0.40 | Add row, set 0.40 | `[x]` |
| `stun` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `trap_block_obstruct` | (null) | 2.00 | +2.00 | Add row, set 2.00  *(large diff — review)* | `[ ]` |

## T? (Street Brawl, 9999 souls)

### Haunting Shot (`haunting_shot`, T? Weapon)
Path: `data/items/haunting_shot.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `anti_heal` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `hybrid_damage_usage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `pure_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Infinite Rounds (`infinite_rounds`, T? Weapon)
Path: `data/items/infinite_rounds.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_proc` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 1.00 | (drop) | -1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Runed Gauntlets (`runed_gauntlets`, T? Weapon)
Path: `data/items/runed_gauntlets.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 1.25 | (drop) | -1.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Celestial Blessing (`celestial_blessing`, T? Vitality)
Path: `data/items/celestial_blessing.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `ally_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `assist_importance` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_heal` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `team_heal` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |

### Cloak of Opportunity (`cloak_of_opportunity`, T? Vitality)
Path: `data/items/cloak_of_opportunity.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `cc_resist` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `shield` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |

### Electric Slippers (`electric_slippers`, T? Vitality)
Path: `data/items/electric_slippers.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `aoe_cluster` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -0.66 | (drop) | +0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |

### Eternal Gift (`eternal_gift`, T? Vitality)
Path: `data/items/eternal_gift.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `cooldown_reduction` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `fire_rate` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `magazine_size_dependant` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `scaling_early` | 0.20 | (drop) | -0.20 | Drop row (AI does not mark this tag) | `[ ]` |
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
| `aoe_cluster` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.15 | (drop) | -1.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `counter_importance` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `debuff_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.20 | (drop) | +1.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `mid_range` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `movement_slow` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |

### Seraphim Wings (`seraphim_wings`, T? Vitality)
Path: `data/items/seraphim_wings.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `aerial` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `away_from_team` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | -0.75 | (drop) | +0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_to_team` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `damage_sponge` | -0.20 | (drop) | +0.20 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `gun_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | 0.75 | (drop) | -0.75 | Drop row (AI does not mark this tag) | `[ ]` |
| `low_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | -0.50 | (drop) | +0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_resistance` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.55 | (drop) | -0.55 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_continuous_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resistance` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 2.00 | (drop) | -2.00 | Drop row (AI does not mark this tag) | `[ ]` |

### Shadow Strike (`shadow_strike`, T? Vitality)
Path: `data/items/shadow_strike.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `away_from_team` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_evasion` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `bullet_resist_shred` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_damage` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `burst_resistance` | 0.15 | (drop) | -0.15 | Drop row (AI does not mark this tag) | `[ ]` |
| `close_range` | 1.50 | (drop) | -1.50 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `continuous_resistance` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `dot` | 0.33 | (drop) | -0.33 | Drop row (AI does not mark this tag) | `[ ]` |
| `grounded` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `high_max_hp` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `horizontal_mobility` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `long_range` | -1.00 | (drop) | +1.00 | Drop row (AI does not mark this tag) | `[ ]` |
| `melee_damage` | 0.66 | (drop) | -0.66 | Drop row (AI does not mark this tag) | `[ ]` |
| `self_buff` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `single_target` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_damage` | 0.25 | (drop) | -0.25 | Drop row (AI does not mark this tag) | `[ ]` |
| `spirit_resist_shred` | 0.45 | (drop) | -0.45 | Drop row (AI does not mark this tag) | `[ ]` |
| `vertical_mobility` | 0.50 | (drop) | -0.50 | Drop row (AI does not mark this tag) | `[ ]` |

---

## Apply these changes to JSONs

*(Cross-tier high-level cleanup checklist. Per-row Apply? checkboxes in the audit tables above are the per-tag tracker; this section is for tier-wide patterns.)*

### T1
- [ ] (placeholder)

### T2
- [ ] (placeholder)

### T3
- [ ] (placeholder)

### T4
- [ ] (placeholder)
