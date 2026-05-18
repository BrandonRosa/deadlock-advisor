# Deadlock Item Audit

Generated: 2026-05-18T19:07:21.775Z

Source: `Data:ItemData.json` (Default mode only — Streetbrawl / Enhanced ignored).

## Index

- [Weapon — T1 (800 souls)](#weapon--t1-800-souls) — 7 items
- [Weapon — T2 (1600 souls)](#weapon--t2-1600-souls) — 16 items
- [Weapon — T3 (3200 souls)](#weapon--t3-3200-souls) — 19 items
- [Weapon — T4 (6400 souls)](#weapon--t4-6400-souls) — 11 items
- [Vitality — T1 (800 souls)](#vitality--t1-800-souls) — 7 items
- [Vitality — T2 (1600 souls)](#vitality--t2-1600-souls) — 15 items
- [Vitality — T3 (3200 souls)](#vitality--t3-3200-souls) — 14 items
- [Vitality — T4 (6400 souls)](#vitality--t4-6400-souls) — 17 items
- [Spirit — T1 (800 souls)](#spirit--t1-800-souls) — 8 items
- [Spirit — T2 (1600 souls)](#spirit--t2-1600-souls) — 12 items
- [Spirit — T3 (3200 souls)](#spirit--t3-3200-souls) — 13 items
- [Spirit — T4 (6400 souls)](#spirit--t4-6400-souls) — 16 items

## Weapon — T1 (800 souls)

### Items needing review

#### High-Velocity Rounds

- **Wiki**: https://deadlock.wiki/High-Velocity_Rounds
- **Raw stats (Default)**:
  - BonusBulletSpeedPercent: +60
  - BaseAttackDamagePercent: +8
- **playstyle_score** (non-null):
  - `anti_air: 0.1`
  - `bullet_damage: 0.25`
  - `close_range: -0.05`
  - `gun_burst_damage: 0.05`
  - `gun_continuous_damage: 0.15`
  - `headshot_damage: 0.25`
  - `long_range: 0.5`
  - `mid_range: 0.15`
- **Stat gaps**:
  - ⚠ bullet_velocity (BonusBulletSpeedPercent=+60) — unmappable (no tag exists)

### Reviewed clean (6 items)

Close Quarters, Extended Magazine, Headshot Booster, Monster Rounds, Rapid Rounds, Restorative Shot

## Weapon — T2 (1600 souls)

### Items needing review

#### Fleetfoot

- **Wiki**: https://deadlock.wiki/Fleetfoot
- **Raw stats (Default)**:
  - AbilityCooldown: +16
  - AbilityDuration: +5
  - MoveWhileShootingSpeedPenaltyReductionPercent: +100
  - MoveWhileZoomedSpeedPenaltyReductionPercent: +100
  - ActiveBonusMoveSpeed: +3m
  - SlideScale: +35
  - BulletResist: +6
  - SlowResistancePercent: +35
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `bullet_damage: 0.2`
  - `bullet_resistance: 0.33`
  - `close_range: 0.15`
  - `continuous_damage: 0.1`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `engage: 0.75`
  - `escape: 0.5`
  - `farmer: 0.05`
  - `grounded: 0.15`
  - `gun_burst_damage: 0.1`
  - `gun_continuous_damage: 0.33`
  - `gun_continuous_proc: 0.33`
  - `horizontal_mobility: 1`
  - `mid_range: 0.15`
- **Stat gaps**:
  - ⚠ debuff_resist (SlowResistancePercent=+35) — expected tag(s) debuff_resistance are null/zero

#### Kinetic Dash

- **Wiki**: https://deadlock.wiki/Kinetic_Dash
- **Raw stats (Default)**:
  - AbilityDuration: +7
  - BonusFireRate: +25
  - BonusClipSize: +6
  - Stamina: +1
  - StaminaCooldownReduction: +12
- **playstyle_score** (non-null):
  - `aerial: 0.05`
  - `bullet_damage: 0.25`
  - `close_range: 0.33`
  - `continuous_damage: 0.1`
  - `duration_dependant: 0.05`
  - `engage: 0.75`
  - `fire_rate: 0.85`
  - `grounded: 0.1`
  - `gun_burst_damage: 0.25`
  - `gun_burst_proc: 0.05`
  - `gun_continuous_damage: 0.2`
  - `gun_continuous_proc: 0.05`
  - `horizontal_mobility: 0.33`
  - `hybrid_damage_usage: -0.15`
  - `long_range: -0.1`
  - `magazine_size_dependant: 0.25`
  - `mid_range: 0.33`
  - `vertical_mobility: 0.5`
- **Stat gaps**:
  - ⚠ stamina (Stamina=+1) — unmappable (no tag exists)
  - ⚠ cooldown_reduction (StaminaCooldownReduction=+12) — expected tag(s) cooldown_reduction are null/zero

#### Opening Rounds

- **Wiki**: https://deadlock.wiki/Opening_Rounds
- **Raw stats (Default)**:
  - TechPower: +7
  - EnemyLifeThreshold: +50
  - BonusBulletSpeedPercent: +60
  - BaseAttackDamagePercent: +8
  - BaseAttackDamagePercentBonus: +30
- **playstyle_score** (non-null):
  - `bullet_damage: 1.15`
  - `engage: 0.15`
  - `farmer: 0.15`
  - `gun_burst_damage: 0.33`
  - `gun_continuous_damage: 0.15`
  - `headshot_damage: 0.15`
  - `hybrid_damage_usage: 0.2`
  - `long_range: 0.33`
  - `pure_damage: 0.05`
  - `spirit_damage: 0.45`
- **Stat gaps**:
  - ⚠ bullet_velocity (BonusBulletSpeedPercent=+60) — unmappable (no tag exists)

#### Recharging Rush

- **Wiki**: https://deadlock.wiki/Recharging_Rush
- **Raw stats (Default)**:
  - AbilityCooldown: +24
  - BonusClipSizePercent: +20
  - BaseAttackDamagePercent: +10
  - DamageThreshold: +200
  - DamageWindow: +3.5
- **playstyle_score** (non-null):
  - `ability_spam: 0.15`
  - `bullet_damage: 0.45`
  - `charge_dependant: 1`
  - `cooldown_reduction: 0.15`
  - `gun_burst_damage: 0.15`
  - `gun_burst_proc: 0.5`
  - `gun_continuous_proc: 0.33`
  - `hybrid_damage_usage: 0.33`
  - `magazine_size_dependant: 0.33`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: DamageThreshold=200 (damage_window, uptime≈0.4); DamageWindow=3.5 (damage_window, uptime≈0.4)
  - ⚠ `low_max_hp` is null/zero — implied by: DamageThreshold=200 (damage_window, uptime≈0.4); DamageWindow=3.5 (damage_window, uptime≈0.4)

#### Slowing Bullets

- **Wiki**: https://deadlock.wiki/Slowing_Bullets
- **Raw stats (Default)**:
  - SlowPercent: +30
  - GroundDashReductionPercent: -25
  - SlowDuration: +3.5
  - BaseAttackDamagePercent: +15
  - BuildUpDuration: +5
  - BuildUpPerShot: +0.7
- **playstyle_score** (non-null):
  - `bullet_damage: 0.45`
  - `bullet_proc: 0.5`
  - `close_range: 0.15`
  - `debuff: 0.15`
  - `farmer: -0.1`
  - `long_range: -0.15`
  - `melee_damage: 0.1`
  - `mid_range: 0.1`
  - `movement_slow: 0.75`
  - `single_target: 0.1`
  - `gun_burst_proc: 0.15`
  - `gun_continuous_proc: 1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Split Shot

- **Wiki**: https://deadlock.wiki/Split_Shot
- **Raw stats (Default)**:
  - AbilityCooldown: +27
  - BonusShotsDuration: +5
  - BulletSplitShot: +5
  - SpreadAngleDegrees: +45
  - WeaponDamageBonusDuration: +12
  - WeaponDamagePerStack: +8
  - MaxStacks: +5
- **playstyle_score** (non-null):
  - `aerial: -0.05`
  - `aoe_cluster: 0.5`
  - `bullet_damage: 0.7`
  - `bullet_proc: 0.15`
  - `burst_damage: 0.1`
  - `close_range: 0.75`
  - `continuous_damage: 0.1`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `engage: 0.25`
  - `farmer: 0.1`
  - `fire_rate: 0.15`
  - `grounded: 0.05`
  - `gun_burst_damage: 0.1`
  - `gun_burst_proc: 0.25`
  - `gun_continuous_damage: 0.25`
  - `headshot_damage: -0.1`
  - `long_range: -0.5`
  - `mid_range: 0.33`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: WeaponDamagePerStack=8 (per_stack, uptime≈2.5)
  - ⚠ `scaling_late` is null/zero — implied by: WeaponDamagePerStack=8 (per_stack, uptime≈2.5)

#### Titanic Magazine

- **Wiki**: https://deadlock.wiki/Titanic_Magazine
- **Raw stats (Default)**:
  - BonusClipSizePercent: +100
  - BaseAttackDamagePercent: +14
- **playstyle_score** (non-null):
  - `bullet_damage: 0.25`
  - `magazine_size_dependant: 1.75`
- **Missing-stat**: only 2 non-null tags scored

### Reviewed clean (9 items)

Active Reload, Intensifying Magazine, Long Range, Melee Charge, Mystic Shot, Spirit Shredder Bullets, Stalker, Swift Striker, Weakening Headshot

## Weapon — T3 (3200 souls)

### Items needing review

#### Alchemical Fire

- **Wiki**: https://deadlock.wiki/Alchemical_Fire
- **Raw stats (Default)**:
  - AbilityCooldown: +30
  - AbilityDuration: +5
  - AbilityCastDelay: +0.2
  - DPS_Value: +45
  - DPSIncrease_Value: +7
  - DPSMax_Value: +95
  - NonHeroReductionPercent: +50
  - Radius: +10m
  - HeightOffGround: +50
  - TickRate: +0.5
  - BulletArmorReduction_Value: -7
  - SpiritPower: +10
- **playstyle_score** (non-null):
  - `aerial: -3`
  - `anti_air: -0.15`
  - `aoe_cluster: 0.75`
  - `assist_importance: 0.1`
  - `bullet_damage: 0.15`
  - `bullet_resist_shred: 0.33`
  - `close_to_team: 0.1`
  - `continuous_damage: 0.33`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.1`
  - `debuff: 0.15`
  - `dot: 0.2`
  - `duration_dependant: 0.05`
  - `farmer: 0.15`
  - `hybrid_damage_usage: 0.33`
  - `range_extender_dependant: 0.05`
  - `single_target: -0.1`
  - `spirit_burst_damage: -0.15`
  - `spirit_continuous_damage: 0.66`
  - `spirit_continuous_proc: 0.15`
  - `spirit_damage: 0.33`
  - `stun: 0.1`
  - `trap_block_obstruct: 0.15`
  - `lane_pusher: 0.75`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `spirit_burst_proc` is null/zero — implied by: proc-style damage (DPS_Value=45, DPSMax_Value=95, activation=Press)

#### Ballistic Enchantment

- **Wiki**: https://deadlock.wiki/Ballistic_Enchantment
- **Raw stats (Default)**:
  - AbilityDuration: +14
  - TechRangeMultiplier: +20
  - TechRadiusMultiplier: +20
  - WeaponPowerPerStack: +20 — *per_stack, uptime≈0.5, effective 10*
  - WeaponPowerPerStackNonHero: +5
  - NonHeroStackLimit: +8
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.55`
  - `bullet_damage: 0.66`
  - `gun_continuous_damage: 0.15`
  - `gun_continuous_proc: 0.15`
  - `hybrid_damage_usage: 0.33`
  - `range_extender_dependant: 0.9`
  - `single_ability_focus: 0.33`
  - `spirit_continuous_proc: 0.15`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: WeaponPowerPerStack=20 (per_stack, uptime≈0.5)
  - ⚠ `scaling_late` is null/zero — implied by: WeaponPowerPerStack=20 (per_stack, uptime≈0.5)

#### Berserker

- **Wiki**: https://deadlock.wiki/Berserker
- **Raw stats (Default)**:
  - DamageDuration: +10
  - DamageToStack: +120
  - WeaponPowerPerStack: +7 — *per_stack, uptime≈5, effective 35*
  - MaxStacks: +10
  - BulletResist: +8
- **playstyle_score** (non-null):
  - `bullet_damage: 1`
  - `bullet_resistance: 0.33`
  - `damage_sponge: 1.15`
  - `duration_dependant: 0.05`
  - `gun_burst_resistance: 0.15`
  - `gun_continuous_resistance: 0.25`
  - `high_max_hp: 0.66`
  - `low_max_hp: -0.15`
  - `self_buff: 0.15`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: WeaponPowerPerStack=7 (per_stack, uptime≈5)
  - ⚠ `scaling_late` is null/zero — implied by: WeaponPowerPerStack=7 (per_stack, uptime≈5)

#### Blood Tribute

- **Wiki**: https://deadlock.wiki/Blood_Tribute
- **Raw stats (Default)**:
  - TechResist: +8
  - HealthDrainedPerSecond: +50
  - TickRate: +0.1
  - BonusFireRate: +35
  - StatusResistancePercent: +35
  - InnateStatusResistancePercent: +8
  - BonusMoveSpeed: +2m
  - OutOfCombatHealthRegen: +4 — *out_of_combat, uptime≈0.7, effective 2.8*
- **playstyle_score** (non-null):
  - `bullet_damage: 0.25`
  - `debuff_resistance: 0.33`
  - `engage: 0.33`
  - `escape: -0.15`
  - `fire_rate: 1`
  - `gun_burst_damage: 0.25`
  - `gun_continuous_resistance: 0.15`
  - `high_max_hp: 0.25`
  - `horizontal_mobility: 0.33`
  - `low_max_hp: -0.66`
  - `self_heal: 0.15`
  - `spirit_resistance: 0.33`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)

#### Cultist Sacrifice

- **Wiki**: https://deadlock.wiki/Cultist_Sacrifice
- **Raw stats (Default)**:
  - AbilityCooldown: +270
  - AbilityDuration: +160
  - AbilityCastRange: +7m
  - NonPlayerBonusWeaponPower: +30
  - OutOfCombatHealthRegen: +2 — *out_of_combat, uptime≈0.7, effective 1.4*
  - NonPlayerBulletResist: +30
  - BonusSoulsPct: +170
  - BonusHealth_Value: +50
  - BaseAttackDamagePercent_Value: +8
  - BonusAbilityCharges: +1
  - TechRangeMultiplier: +12
  - TechRadiusMultiplier: +12
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.25`
  - `bullet_damage: 0.45`
  - `farmer: 1.25`
  - `high_max_hp: 0.33`
  - `hybrid_damage_usage: 0.15`
  - `range_extender_dependant: 0.66`
  - `scaling_early: 0.05`
- **Stat gaps**:
  - ⚠ health_regen (OutOfCombatHealthRegen=+2) — expected tag(s) self_heal are null/zero
  - ⚠ charge_up (BonusAbilityCharges=+1) — expected tag(s) charge_dependant are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=2 (out_of_combat, uptime≈0.7)

#### Escalating Resilience

- **Wiki**: https://deadlock.wiki/Escalating_Resilience
- **Raw stats (Default)**:
  - MaxArmorStacks: +30
  - BulletResistPerStack: +2 — *per_stack, uptime≈0.5, effective 1*
  - BulletResistDuration: +24
  - BaseAttackDamagePercent: +15
  - BonusHealth: +75
  - BonusClipSizePercent: +30
- **playstyle_score** (non-null):
  - `bullet_damage: 0.5`
  - `bullet_proc: 0.2`
  - `bullet_resistance: 1`
  - `fire_rate: 0.15`
  - `gun_burst_resistance: 0.15`
  - `gun_continuous_damage: 0.15`
  - `gun_continuous_proc: 0.66`
  - `gun_continuous_resistance: 0.66`
  - `high_max_hp: 0.3`
  - `magazine_size_dependant: 0.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: BulletResistPerStack=2 (per_stack, uptime≈0.5)
  - ⚠ `scaling_late` is null/zero — implied by: BulletResistPerStack=2 (per_stack, uptime≈0.5)

#### Express Shot

- **Wiki**: https://deadlock.wiki/Express_Shot
- **Raw stats (Default)**:
  - AbilityCooldown: +8
  - BonusBulletSpeedPercent: +60
  - BaseAttackDamagePercent: +8
  - ProcAmmoConsumed: +2
  - ProcBulletVelocity: +100
  - ProcBaseAttackDamagePercent_Value: +125
  - ProcBaseAttackDamagePercentAltFire_Value: +40
- **playstyle_score** (non-null):
  - `bullet_damage: 0.75`
  - `burst_damage: 1`
  - `close_range: 0.5`
  - `cooldown_reduction: 0.05`
  - `farmer: 0.15`
  - `gun_burst_damage: 0.75`
  - `gun_continuous_damage: -0.15`
  - `headshot_damage: 0.15`
  - `hybrid_damage_usage: -0.15`
  - `long_range: 0.15`
  - `magazine_size_dependant: 0.1`
  - `single_target: 0.5`
  - `gun_burst_proc: 0.15`
- **Stat gaps**:
  - ⚠ bullet_velocity (BonusBulletSpeedPercent=+60) — unmappable (no tag exists)

#### Headhunter

- **Wiki**: https://deadlock.wiki/Headhunter
- **Raw stats (Default)**:
  - AbilityCooldown: +8
  - HeadShotBonusDamage_Value: +75
  - BaseAttackDamagePercent: +5
  - BonusHealth: +50
  - HealPercentPerHeadshot_Value: +4
  - BonusMoveSpeed: +1.75m
  - MovementSpeedBonusDuration: +3
  - ProcChance: +100
- **playstyle_score** (non-null):
  - `bullet_damage: 0.66`
  - `bullet_lifesteal: 0.2`
  - `burst_damage: 0.5`
  - `burst_heal: 0.2`
  - `close_range: 0.5`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `gun_burst_damage: 0.75`
  - `gun_burst_proc: 0.25`
  - `gun_continuous_proc: 0.33`
  - `headshot_damage: 1.25`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.5`
  - `self_heal: 0.45`
  - `single_target: 0.66`
  - `vertical_mobility: 0.15`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `continous_heal` is null/zero — implied by: HealPercentPerHeadshot=4 (sustained if firing rate keeps trigger uptime)

#### Hollow Point

- **Wiki**: https://deadlock.wiki/Hollow_Point
- **Raw stats (Default)**:
  - LifeThreshold: +65
  - BaseAttackDamagePercent: +35
  - OutOfCombatHealthRegen: +4.5 — *out_of_combat, uptime≈0.7, effective 3.15*
  - BonusHealth: +125
  - BulletArmorReduction: -9
  - DebuffDuration: +8
- **playstyle_score** (non-null):
  - `bullet_damage: 0.65`
  - `bullet_resist_shred: 0.25`
  - `debuff: 0.1`
  - `farmer: 0.2`
  - `high_max_hp: 0.5`
  - `self_buff: 0.15`
  - `self_heal: 0.33`
  - `gun_continuous_proc: 0.15`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4.5 (out_of_combat, uptime≈0.7)

#### Hunters Aura

- **Wiki**: https://deadlock.wiki/Hunters_Aura
- **Raw stats (Default)**:
  - BonusHealth: +100
  - Radius: +15m
  - BulletArmorReduction: -10
  - FireRateSlow: +14
  - SingleTargetPlayerMultiplier: +2
  - BonusSprintSpeed: +0.75m
- **playstyle_score** (non-null):
  - `aerial: -0.75`
  - `aoe_cluster: 0.15`
  - `bullet_damage: 0.25`
  - `bullet_resist_shred: 0.75`
  - `close_range: 1`
  - `farmer: 0.1`
  - `fire_rate_slow: 0.45`
  - `high_max_hp: 0.2`
  - `horizontal_mobility: 0.15`
  - `long_range: -1`
  - `range_extender_dependant: 0.05`
  - `single_target: 0.75`
  - `engage: 0.33`
- **Stat gaps**:
  - ⚠ slow (FireRateSlow=+14) — expected tag(s) movement_slow are null/zero

#### Point Blank

- **Wiki**: https://deadlock.wiki/Point_Blank
- **Raw stats (Default)**:
  - CloseRangeBonusWeaponPower: +50 — *close_range, uptime≈0.5, effective 25*
  - SlowPercent: +25
  - SlowDuration: +2
  - CloseRangeBonusDamageRange: +15m
  - MeleeResistPercent: +30
  - BonusHealth: +75
- **playstyle_score** (non-null):
  - `aerial: -0.75`
  - `away_from_team: 0.15`
  - `bullet_damage: 0.75`
  - `close_range: 1.5`
  - `engage: 0.15`
  - `farmer: 0.2`
  - `gun_burst_damage: 0.15`
  - `gun_continuous_damage: 0.1`
  - `high_max_hp: 0.25`
  - `long_range: -1.25`
  - `melee_damage: 0.75`
  - `melee_resistance: 0.75`
  - `mid_range: -0.25`
  - `movement_slow: 0.5`
  - `single_target: 0.5`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Shadow Weave

- **Wiki**: https://deadlock.wiki/Shadow_Weave
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - AbilityDuration: +10
  - InvisAlertWhenFading: +1
  - InvisCancelOnDamage: +1
  - InvisFadeToDuration: +0.6
  - InvisMoveSpeedMod: +5m — *ambush, uptime≈0.2222222222222222, effective 1.11m*
  - SpottedRadius: +20m
  - RevealOnDamageDuration: +1.5
  - RevealOnSpottedDuration: +1.5
  - FullInvisDistance: +30m
  - AmbushDuration: +5
  - AmbushBonusFireRate: +20 — *ambush, uptime≈0.11, effective 2.22*
  - AmbushBonusTechPower: +20 — *ambush, uptime≈0.11, effective 2.22*
  - AmbushBonusMeleeDamage: +20 — *ambush, uptime≈0.11, effective 2.22*
  - OutOfCombatHealthRegen: +5 — *out_of_combat, uptime≈0.7, effective 3.5*
  - BonusSprintSpeed: +1.5m
- **playstyle_score** (non-null):
  - `away_from_team: 0.75`
  - `bullet_damage: 0.33`
  - `close_range: 0.15`
  - `engage: 1.25`
  - `escape: 0.2`
  - `fire_rate: 0.66`
  - `gun_burst_damage: 0.75`
  - `horizontal_mobility: 0.25`
  - `hybrid_damage_usage: 0.45`
  - `melee_damage: 0.5`
  - `self_buff: 0.75`
  - `single_target: 0.25`
  - `small_hitbox: 0.25`
  - `spirit_burst_damage: 0.75`
  - `spirit_damage: 0.33`
- **Stat gaps**:
  - ⚠ health_regen (OutOfCombatHealthRegen=+5) — expected tag(s) self_heal are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `ult_focused` is null/zero — implied by: AmbushDuration=5 (ambush, uptime≈0.11); AmbushBonusFireRate=20 (ambush, uptime≈0.11); AmbushBonusTechPower=20 (ambush, uptime≈0.11); AmbushBonusMeleeDamage=20 (ambush, uptime≈0.11); stealth (tiny — score ≤0.2)
  - ⚠ `single_ability_focus` is null/zero — implied by: AmbushDuration=5 (ambush, uptime≈0.11); AmbushBonusFireRate=20 (ambush, uptime≈0.11); AmbushBonusTechPower=20 (ambush, uptime≈0.11); AmbushBonusMeleeDamage=20 (ambush, uptime≈0.11)
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=5 (out_of_combat, uptime≈0.7)

#### Spirit Rend

- **Wiki**: https://deadlock.wiki/Spirit_Rend
- **Raw stats (Default)**:
  - ProcCooldown: +2
  - BonusHealth: +75
  - MaxStacks: +4
  - AbilityLifestealPercentHero: +10
  - MagicResistReduction: -7
  - TechArmorDamageReduction: -8
  - DebuffDuration: +8
- **playstyle_score** (non-null):
  - `ally_buff: 0.25`
  - `assist_importance: 0.15`
  - `bullet_damage: 0.15`
  - `bullet_proc: 0.25`
  - `close_to_team: 0.5`
  - `continuous_damage: 0.15`
  - `counter_importance: 0.15`
  - `debuff: 0.75`
  - `gun_burst_proc: 0.25`
  - `gun_continuous_proc: 0.75`
  - `headshot_damage: 0.66`
  - `hybrid_damage_usage: 0.5`
  - `self_buff: 0.25`
  - `self_heal: 0.25`
  - `single_target: 0.15`
  - `spirit_damage: 0.25`
  - `spirit_lifesteal: 0.66`
  - `spirit_resist_shred: 1.25`
- **Stat gaps**:
  - ⚠ health (BonusHealth=+75) — expected tag(s) high_max_hp are null/zero

#### Weighted Shots

- **Wiki**: https://deadlock.wiki/Weighted_Shots
- **Raw stats (Default)**:
  - BaseAttackDamagePercent: +40
  - StatusResistancePercent: +20
  - StaminaCooldownReduction: -14
  - SlowPercent: +30
  - GroundDashReductionPercent: -25
  - SlowDuration: +3.5
  - BonusMoveSpeed: -0.5m
  - BuildUpDuration: +5
  - BuildUpPerShot: +0.7
- **playstyle_score** (non-null):
  - `bullet_damage: 0.75`
  - `bullet_proc: 0.5`
  - `cc_resist: 0.05`
  - `close_range: 0.5`
  - `debuff: 0.33`
  - `debuff_resistance: 0.66`
  - `duration_dependant: 0.05`
  - `headshot_damage: 0.1`
  - `horizontal_mobility: -0.15`
  - `long_range: -0.05`
  - `melee_damage: 0.15`
  - `mid_range: 0.15`
  - `movement_slow: 0.66`
  - `single_target: 0.25`
  - `vertical_mobility: -0.15`
  - `gun_burst_proc: 0.33`
  - `gun_continuous_proc: 0.66`
  - `engage: 0.2`
- **Stat gaps**:
  - ⚠ cooldown_reduction (StaminaCooldownReduction=-14) — expected tag(s) cooldown_reduction are null/zero

### Reviewed clean (5 items)

Burst Fire, Heroic Aura, Sharpshooter, Tesla Bullets, Toxic Bullets

## Weapon — T4 (6400 souls)

### Items needing review

#### Armor Piercing Rounds

- **Wiki**: https://deadlock.wiki/Armor_Piercing_Rounds
- **Raw stats (Default)**:
  - BonusBulletSpeedPercent: +60
  - ProcChance: +55
  - BaseAttackDamagePercent: +8
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.15`
  - `bullet_damage: 0.5`
  - `bullet_resist_shred: 0.33`
  - `counter_importance: 0.1`
  - `gun_burst_damage: 0.1`
  - `gun_burst_proc: 0.15`
  - `gun_continuous_damage: 0.25`
  - `gun_continuous_proc: 0.33`
  - `long_range: 0.15`
  - `mid_range: 0.15`
  - `pure_damage: 0.33`
  - `single_target: 0.15`
- **Stat gaps**:
  - ⚠ bullet_velocity (BonusBulletSpeedPercent=+60) — unmappable (no tag exists)

#### Capacitor

- **Wiki**: https://deadlock.wiki/Capacitor
- **Raw stats (Default)**:
  - AbilityCooldown: +40
  - AbilityCastDelay: +0.2
  - ProcCooldown: +0.25
  - DamagePerChain_Value: +43
  - BonusPerChain_Value: +43
  - ChainRadius: +10m
  - ProcChance: +20
  - ChainCount: +6
  - ChainTickRate: +0.4
  - Damage: +100
  - MaxSlowPercent: +75
  - SlowDuration: +3
  - BonusFireRate: +5
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.25`
  - `bullet_damage: 0.15`
  - `bullet_proc: 0.66`
  - `cooldown_reduction: 0.1`
  - `engage: 0.1`
  - `farmer: 0.15`
  - `fire_rate: 0.15`
  - `gun_burst_proc: -0.15`
  - `gun_continuous_damage: 0.1`
  - `gun_continuous_proc: 0.75`
  - `hybrid_damage_usage: 0.45`
  - `movement_slow: 0.45`
  - `silence: 0.25`
  - `spirit_burst_damage: 0.25`
  - `spirit_burst_proc: 0.1`
  - `spirit_continuous_damage: 0.25`
  - `spirit_continuous_proc: 0.1`
  - `spirit_damage: 0.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion; description applies CC ("\bsilence") — low-value suggestion

#### Crushing Fists

- **Wiki**: https://deadlock.wiki/Crushing_Fists
- **Raw stats (Default)**:
  - AbilityCooldown: +7
  - BulletResist: +12
  - BonusMeleeDamagePercent: +20
  - MeleeDistanceScale: +60
  - BonusHeavyMeleeDamage: +25
  - MaxStacks: +6
  - DebuffDuration: +8
  - StunDuration: +0.5
  - LightMeleeStacks: +1
  - LightMeleeAmmo: +15
  - HeavyMeleeMultiplier: +2
  - BulletResistReduction: -4
- **playstyle_score** (non-null):
  - `aerial: -0.75`
  - `away_from_team: 0.05`
  - `bullet_damage: 0.25`
  - `bullet_resist_shred: 0.2`
  - `bullet_resistance: 0.15`
  - `burst_damage: 0.33`
  - `close_range: 1.25`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `grounded: 0.2`
  - `gun_burst_damage: 0.25`
  - `horizontal_mobility: 0.15`
  - `long_range: -0.75`
  - `magazine_size_dependant: 0.15`
  - `melee_damage: 2`
  - `mid_range: 0`
  - `single_target: 0.5`
  - `stun: 0.15`
  - `gun_burst_proc: 0.2`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bstun") — low-value suggestion

#### Frenzy

- **Wiki**: https://deadlock.wiki/Frenzy
- **Raw stats (Default)**:
  - AbilityCooldown: +16
  - AbilityDuration: +10
  - LowHealthThreshold: +50
  - BonusHealth: +160
  - BonusFireRate: +15
  - FervorMovespeed: +4m — *fervor, uptime≈0.25, effective 1m*
  - FervorFireRate: +40 — *fervor, uptime≈0.25, effective 10*
  - FervorStatusResistancePercent: +30 — *fervor, uptime≈0.25, effective 7.5*
- **playstyle_score** (non-null):
  - `bullet_damage: 0.2`
  - `fire_rate: 0.66`
  - `high_max_hp: 0.75`
  - `horizontal_mobility: 0.75`
  - `spirit_resistance: 0.5`
  - `spirit_burst_resistance: 0.15`
  - `spirit_continuous_resistance: 0.5`
  - `damage_sponge: 0.75`
  - `escape: 0.15`
- **Stat gaps**:
  - ⚠ debuff_resist (FervorStatusResistancePercent=+30) — expected tag(s) debuff_resistance are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `low_max_hp` is null/zero — implied by: LowHealthThreshold=50 (lowhp, uptime≈0.3); FervorMovespeed=4m (fervor, uptime≈0.25); FervorFireRate=40 (fervor, uptime≈0.25); FervorStatusResistancePercent=30 (fervor, uptime≈0.25)
  - ⚠ `scaling_late` is null/zero — implied by: FervorMovespeed=4m (fervor, uptime≈0.25); FervorFireRate=40 (fervor, uptime≈0.25); FervorStatusResistancePercent=30 (fervor, uptime≈0.25)

#### Glass Cannon

- **Wiki**: https://deadlock.wiki/Glass_Cannon
- **Raw stats (Default)**:
  - BaseAttackDamagePercent: +80
  - MaxHealthLossPercent: -15
  - BonusClipPerKill: +2 — *per_stack, uptime≈4, effective 8*
  - FireRatePerKill: +7 — *per_stack, uptime≈4, effective 28*
  - MaxStacks: +8
  - SlowPercent: +30
  - SlowDuration: +3
  - BuildUpDuration: +2
  - BuildUpPerShot: +1.2
- **playstyle_score** (non-null):
  - `bullet_damage: 1.75`
  - `damage_sponge: -0.15`
  - `fire_rate: 0.5`
  - `gun_burst_damage: 0.33`
  - `gun_continuous_damage: 0.66`
  - `gun_continuous_proc: 0.1`
  - `high_kill_count: 0.66`
  - `high_max_hp: -0.15`
  - `low_max_hp: 0.15`
  - `melee_damage: 0.15`
- **Stat gaps**:
  - ⚠ ammo (BonusClipPerKill=+2) — expected tag(s) magazine_size_dependant are null/zero
  - ⚠ slow (SlowPercent=+30) — expected tag(s) movement_slow are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `scaling_late` is null/zero — implied by: BonusClipPerKill=2 (per_stack, uptime≈4); FireRatePerKill=7 (per_stack, uptime≈4)

#### Silencer

- **Wiki**: https://deadlock.wiki/Silencer
- **Raw stats (Default)**:
  - TechResist: +15
  - TechDamageReduction: -25
  - SilenceDuration: +2.5
  - DebuffDuration: +6
  - ImmunityDuration: +10
  - BuildUpPerShot: +1.04
  - BuildUpDuration: +5
- **playstyle_score** (non-null):
  - `bullet_damage: 0.15`
  - `close_range: 0.15`
  - `close_to_team: 0.15`
  - `continuous_resistance: 0.15`
  - `gun_burst_proc: 0.15`
  - `gun_continuous_proc: 0.75`
  - `mid_range: 0.25`
  - `silence: 1.25`
  - `single_target: 0.15`
  - `spirit_burst_resistance: 0.15`
  - `spirit_continuous_resistance: 0.75`
  - `spirit_resistance: 0.75`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bsilence") — low-value suggestion

#### Spellslinger

- **Wiki**: https://deadlock.wiki/Spellslinger
- **Raw stats (Default)**:
  - CooldownReduction: +6
  - BonusFireRate: +11
  - ReloadSpeedMultipler: -10
  - BuffDuration: +18
  - MaxStacks: +6
- **playstyle_score** (non-null):
  - `bullet_damage: 0.2`
  - `charge_dependant: 0.2`
  - `cooldown_reduction: 0.33`
  - `fire_rate: 0.75`
  - `hybrid_damage_usage: 0.66`
  - `magazine_size_dependant: 0.15`
  - `self_buff: 0.05`
  - `spirit_damage: 0.05`
  - `ability_spam: 1.5`
- **Stat gaps**:
  - ⚠ duration_up (BuffDuration=+18) — expected tag(s) duration_dependant are null/zero

### Reviewed clean (4 items)

Crippling Headshot, Lucky Shot, Ricochet, Spiritual Overflow

## Vitality — T1 (800 souls)

### Items needing review

#### Extra Regen

- **Wiki**: https://deadlock.wiki/Extra_Regen
- **Raw stats (Default)**:
  - BonusHealthRegen: +3
  - OutOfCombatHealthRegen: +1 — *out_of_combat, uptime≈0.7, effective 0.7*
- **playstyle_score** (non-null):
  - `continous_heal: 1`
  - `high_max_hp: 0.2`
  - `self_heal: 1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=1 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=1 (out_of_combat, uptime≈0.7)

#### Extra Stamina

- **Wiki**: https://deadlock.wiki/Extra_Stamina
- **Raw stats (Default)**:
  - Stamina: +1
  - StaminaCooldownReduction: +12
- **playstyle_score** (non-null):
  - `aerial: 0.33`
  - `engage: 0.5`
  - `escape: 0.5`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.66`
  - `vertical_mobility: 0.33`
- **Stat gaps**:
  - ⚠ stamina (Stamina=+1) — unmappable (no tag exists)
  - ⚠ cooldown_reduction (StaminaCooldownReduction=+12) — expected tag(s) cooldown_reduction are null/zero

#### Rebuttal

- **Wiki**: https://deadlock.wiki/Rebuttal
- **Raw stats (Default)**:
  - BonusHealth: +75
  - ParryCooldownReduction: +2
  - BuffDuration: +6
  - BonusDamagePercent: +30
  - ParrySuccessHealPercentage: +100
  - MeleeResistPercent: +18
- **playstyle_score** (non-null):
  - `close_range: 0.66`
  - `counter_importance: 0.25`
  - `high_max_hp: 0.66`
  - `long_range: -0.55`
  - `melee_resistance: 0.75`
  - `burst_heal: 0.25`
- **Stat gaps**:
  - ⚠ duration_up (BuffDuration=+6) — expected tag(s) duration_dependant are null/zero

### Reviewed clean (4 items)

Extra Health, Healing Rite, Melee Lifesteal, Sprint Boots

## Vitality — T2 (1600 souls)

### Items needing review

#### Battle Vest

- **Wiki**: https://deadlock.wiki/Battle_Vest
- **Raw stats (Default)**:
  - BulletResist: +18
  - OutOfCombatHealthRegen: +3 — *out_of_combat, uptime≈0.7, effective 2.1*
  - LifeThreshold: +65
  - BaseAttackDamagePercent: +15
  - BonusFireRate: +7
- **playstyle_score** (non-null):
  - `bullet_damage: 0.2`
  - `bullet_resistance: 0.85`
  - `counter_importance: 0.5`
  - `fire_rate: 0.25`
  - `gun_burst_damage: 0.15`
  - `gun_burst_resistance: 0.66`
  - `gun_continuous_damage: 0.15`
  - `gun_continuous_resistance: 0.66`
  - `high_max_hp: 0.15`
  - `melee_resistance: 0.15`
  - `self_heal: 0.05`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)

#### Enchanters Emblem

- **Wiki**: https://deadlock.wiki/Enchanters_Emblem
- **Raw stats (Default)**:
  - TechPower: +15
  - TechResist: +18
  - OutOfCombatHealthRegen: +2 — *out_of_combat, uptime≈0.7, effective 1.4*
  - LifeThreshold: +65
  - CooldownReduction: +5
- **playstyle_score** (non-null):
  - `cooldown_reduction: 0.25`
  - `counter_importance: 0.5`
  - `high_max_hp: 0.15`
  - `self_heal: 0.05`
  - `spirit_burst_damage: 0.15`
  - `spirit_burst_resistance: 0.66`
  - `spirit_continuous_damage: 0.15`
  - `spirit_continuous_resistance: 0.66`
  - `spirit_damage: 0.5`
  - `spirit_resistance: 1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=2 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=2 (out_of_combat, uptime≈0.7)

#### Enduring Speed

- **Wiki**: https://deadlock.wiki/Enduring_Speed
- **Raw stats (Default)**:
  - BonusMoveSpeed: +2m
  - SlowResistancePercent: +25
  - OutOfCombatHealthRegen: +2 — *out_of_combat, uptime≈0.7, effective 1.4*
- **playstyle_score** (non-null):
  - `away_from_team: 0.15`
  - `cc_resist: 0.05`
  - `counter_importance: 0.15`
  - `escape: 1`
  - `farmer: 0.1`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 1.5`
  - `self_heal: 0.05`
  - `vertical_mobility: 0.25`
- **Stat gaps**:
  - ⚠ debuff_resist (SlowResistancePercent=+25) — expected tag(s) debuff_resistance are null/zero

#### Guardian Ward

- **Wiki**: https://deadlock.wiki/Guardian_Ward
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - AbilityCastRange: +40m
  - AbilityCastDelay: +0.2
  - CooldownReductionPctOnOthers: +50
  - BuffDuration: +6
  - GuardianWardCombatBarrier: +200
  - BonusMoveSpeed: +2.75m
  - TechRangeMultiplier: +8
  - TechRadiusMultiplier: +8
- **playstyle_score** (non-null):
  - `ally_buff: 1`
  - `assist_importance: 0.25`
  - `burst_resistance: 0.1`
  - `cc_resist: 0.05`
  - `continuous_resistance: 0.33`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.25`
  - `low_max_hp: 0.75`
  - `range_extender_dependant: 0.1`
  - `self_heal: 0.05`
  - `shield: 1.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: description contains "\bbarrier|\bshield"
  - ⚠ `escape` is null/zero — implied by: description contains "\bbarrier|\bshield"

#### Healing Booster

- **Wiki**: https://deadlock.wiki/Healing_Booster
- **Raw stats (Default)**:
  - HealAmpCastPercent: +20
  - HealAmpRegenPercent: +20
  - BonusHealthRegen: +3
  - OutOfCombatHealthRegen: +1 — *out_of_combat, uptime≈0.7, effective 0.7*
- **playstyle_score** (non-null):
  - `bullet_lifesteal: 0.2`
  - `burst_heal: 0.33`
  - `continous_heal: 0.33`
  - `high_max_hp: 0.2`
  - `self_heal: 0.66`
  - `spirit_lifesteal: 0.2`
  - `team_heal: 0.66`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=1 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=1 (out_of_combat, uptime≈0.7)

#### Reactive Barrier

- **Wiki**: https://deadlock.wiki/Reactive_Barrier
- **Raw stats (Default)**:
  - AbilityCooldown: +55
  - AbilityDuration: +10
  - VexBarrierCombatBarrier_Value: +325 — *damage_window, uptime≈0.4, effective 3.25*
- **playstyle_score** (non-null):
  - `away_from_team: 0.15`
  - `cc_resist: 1`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 1`
  - `debuff_resistance: 0.05`
  - `duration_dependant: 0.05`
  - `escape: 0.5`
  - `gun_burst_resistance: 0.25`
  - `high_max_hp: 0.15`
  - `low_max_hp: 0.33`
  - `self_heal: 0.05`
  - `shield: 0.66`
  - `spirit_burst_resistance: 0.25`
  - `spirit_damage: 0.1`
  - `spirit_resistance: 0.1`
- **Stat gaps**:
  - ⚠ bullet_resist (VexBarrierCombatBarrier_Value=+325) — expected tag(s) bullet_resistance are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: VexBarrierCombatBarrier_Value=325 (barrier counters engage); description contains "\bbarrier|\bshield"
  - ⚠ `silence` is null/zero — implied by: description contains "\bsilence"
  - ⚠ `stun` is null/zero — implied by: description contains "\bstun"

#### Spirit Shielding

- **Wiki**: https://deadlock.wiki/Spirit_Shielding
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - DamageWindow: +3.5
  - DamageThreshold: +225
  - CombatBarrier_Value: +300 — *damage_window, uptime≈0.4, effective 6*
  - OutOfCombatHealthRegen: +2.5 — *out_of_combat, uptime≈0.7, effective 1.75*
  - BarrierDuration: +8
  - BonusMoveSpeed: +1.75m
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `burst_resistance: 0.2`
  - `continuous_resistance: 0.33`
  - `counter_importance: 1`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.5`
  - `long_range: -0.05`
  - `low_max_hp: 0.75`
  - `self_heal: 0.15`
  - `shield: 0.75`
  - `spirit_burst_resistance: 1`
  - `spirit_continuous_resistance: 0.75`
  - `spirit_resistance: 0.5`
  - `vertical_mobility: 0.05`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: DamageWindow=3.5 (damage_window, uptime≈0.4); DamageThreshold=225 (damage_window, uptime≈0.4); CombatBarrier_Value=300 (barrier counters engage); description contains "\bbarrier|\bshield"
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=2.5 (out_of_combat, uptime≈0.7)
  - ⚠ `escape` is null/zero — implied by: CombatBarrier_Value=300 (barrier counters engage); description contains "\bbarrier|\bshield"

#### Trophy Collector

- **Wiki**: https://deadlock.wiki/Trophy_Collector
- **Raw stats (Default)**:
  - BonusSprintSpeed: +2m
  - OutOfCombatHealthRegen: +2 — *out_of_combat, uptime≈0.7, effective 1.4*
  - StackingBonusSprintSpeed: +0.15m
  - StackingTechRangeMultiplier: +0.75
  - StackingTechRadiusMultiplier: +0.75
  - StackingGoldPerMinute: +18
  - ThinkRate: +3
  - MaxStacks: +16
  - NonPlayerBonusWeaponPower: -15
- **playstyle_score** (non-null):
  - `close_to_team: 0.1`
  - `farmer: -0.2`
  - `high_assist_count: 1.5`
  - `high_kill_count: 1`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.85`
  - `range_extender_dependant: 0.9`
  - `scaling_early: 0.66`
  - `self_buff: 0.15`
  - `self_heal: 0.1`
- **Stat gaps**:
  - ⚠ bullet_damage_pct (NonPlayerBonusWeaponPower=-15) — expected tag(s) bullet_damage are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=2 (out_of_combat, uptime≈0.7)

#### Weapon Shielding

- **Wiki**: https://deadlock.wiki/Weapon_Shielding
- **Raw stats (Default)**:
  - AbilityCooldown: +35
  - DamageWindow: +4
  - DamageThreshold: +250
  - CombatBarrier_Value: +300 — *damage_window, uptime≈0.4, effective 6*
  - OutOfCombatHealthRegen: +2.5 — *out_of_combat, uptime≈0.7, effective 1.75*
  - BarrierDuration: +8
  - BonusMoveSpeed: +1.75m
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `bullet_resistance: 0.5`
  - `burst_resistance: 0.2`
  - `continuous_resistance: 0.33`
  - `counter_importance: 1`
  - `gun_burst_resistance: 1`
  - `gun_continuous_resistance: 0.75`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.5`
  - `long_range: -0.05`
  - `low_max_hp: 0.75`
  - `melee_resistance: 0.15`
  - `self_heal: 0.15`
  - `shield: 0.75`
  - `vertical_mobility: 0.05`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: DamageWindow=4 (damage_window, uptime≈0.4); DamageThreshold=250 (damage_window, uptime≈0.4); CombatBarrier_Value=300 (barrier counters engage); description contains "\bbarrier|\bshield"
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=2.5 (out_of_combat, uptime≈0.7)
  - ⚠ `escape` is null/zero — implied by: CombatBarrier_Value=300 (barrier counters engage); description contains "\bbarrier|\bshield"

### Reviewed clean (6 items)

Bullet Lifesteal, Debuff Reducer, Healbane, Restorative Locket, Return Fire, Spirit Lifesteal

## Vitality — T3 (3200 souls)

### Items needing review

#### Bullet Resilience

- **Wiki**: https://deadlock.wiki/Bullet_Resilience
- **Raw stats (Default)**:
  - BulletResist: +30
  - HealthThreshold: +50
  - BulletResistBelowThreshold: +15 — *lowhp, uptime≈0.3, effective 4.5*
  - OutOfCombatHealthRegen: +3 — *out_of_combat, uptime≈0.7, effective 2.1*
- **playstyle_score** (non-null):
  - `bullet_resistance: 1.25`
  - `counter_importance: 1`
  - `damage_sponge: 1`
  - `gun_burst_resistance: 1`
  - `gun_continuous_resistance: 1`
  - `high_max_hp: 0.2`
  - `melee_resistance: 0.75`
- **Stat gaps**:
  - ⚠ health_regen (OutOfCombatHealthRegen=+3) — expected tag(s) self_heal are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `low_max_hp` is null/zero — implied by: BulletResistBelowThreshold=15 (lowhp, uptime≈0.3)
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)

#### Counterspell

- **Wiki**: https://deadlock.wiki/Counterspell
- **Raw stats (Default)**:
  - AbilityCooldown: +23
  - SpiritPower: +20
  - BonusMoveSpeed: +1.75m
  - BuffDuration: +6
  - SpellParryDuration: +0.8
  - BonusHealth: +50
  - SpiritPowerInnate: +8
  - HealOnSuccess: +150
- **playstyle_score** (non-null):
  - `burst_heal: 0.66`
  - `burst_resistance: 0.66`
  - `cc_resist: 0.75`
  - `close_range: 0.1`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.75`
  - `damage_sponge: 0.2`
  - `gun_burst_resistance: 0.25`
  - `high_max_hp: 0.33`
  - `horizontal_mobility: 0.15`
  - `long_range: -0.05`
  - `low_max_hp: 0.45`
  - `melee_resistance: 0.05`
  - `mid_range: 0.05`
  - `self_heal: 0.15`
  - `spirit_burst_resistance: 1.15`
  - `spirit_continuous_resistance: 0.1`
  - `spirit_damage: 0.25`
  - `spirit_resistance: 0.4`
  - `vertical_mobility: 0.1`
- **Stat gaps**:
  - ⚠ duration_up (BuffDuration=+6) — expected tag(s) duration_dependant are null/zero

#### Dispel Magic

- **Wiki**: https://deadlock.wiki/Dispel_Magic
- **Raw stats (Default)**:
  - AbilityCooldown: +40
  - TechResist: +10
  - ActiveBonusMoveSpeed: +2m
  - BuffDuration: +3
  - HealOnActivate: +250
- **playstyle_score** (non-null):
  - `away_from_team: 0.05`
  - `burst_heal: 0.75`
  - `cc_resist: 0.25`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 1`
  - `debuff_resistance: 1.25`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.25`
  - `low_max_hp: 0.1`
  - `self_heal: 0.33`
  - `spirit_burst_resistance: 0.66`
  - `spirit_continuous_damage: 0.66`
  - `spirit_resistance: 0.66`
- **Stat gaps**:
  - ⚠ duration_up (BuffDuration=+3) — expected tag(s) duration_dependant are null/zero

#### Lifestrike

- **Wiki**: https://deadlock.wiki/Lifestrike
- **Raw stats (Default)**:
  - AbilityCooldown: +4
  - LightMeleeCooldownMult: +1.5
  - SlowPercent: +60
  - SlowDuration: +2.5
  - BonusMeleeDamagePercent: +16
  - LifestealHeal_Value: +100
  - LifestealHealPercent_Value: +30
  - BonusHealth: +125
  - NonHeroHealPct: +40
- **playstyle_score** (non-null):
  - `aerial: -0.5`
  - `away_from_team: 0.15`
  - `bullet_damage: 0.05`
  - `burst_damage: 0.05`
  - `burst_heal: 1.25`
  - `close_range: 1.15`
  - `cooldown_reduction: 0.05`
  - `farmer: 0.05`
  - `grounded: 0.25`
  - `high_max_hp: 0.25`
  - `long_range: -0.5`
  - `melee_damage: 0.33`
  - `mid_range: -0.1`
  - `movement_slow: 0.25`
  - `self_heal: 0.75`
  - `single_target: 0.05`
- **Stat gaps**:
  - ⚠ spirit_lifesteal (LifestealHealPercent_Value=+30) — expected tag(s) spirit_lifesteal are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Majestic Leap

- **Wiki**: https://deadlock.wiki/Majestic_Leap
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - JumpVelocityHidden: +27m
  - InterruptCooldown: +5
  - AirControlPercent: +100
  - SlamDownRadius: +10m
  - VerticalDifferenceTolerance: +2m
  - TossSpeed: +500
  - SlowPercent: +40
  - SlowDuration: +2.5
  - DropDownSpeed: +35m
  - MaxLandingSpeed: +20m
  - ImpactHeight: +2m
  - MinAimAngle: +30
  - CombatBarrier_Value: +200 — *damage_window, uptime≈0.4, effective 2*
  - BarrierDuration: +8
- **playstyle_score** (non-null):
  - `burst_damage: 0.05`
  - `close_range: 0.05`
  - `cooldown_reduction: 0.05`
  - `engage: 1`
  - `grounded: 0.05`
  - `gun_burst_damage: 0.01`
  - `horizontal_mobility: 0.25`
  - `shield: 0.4`
  - `spirit_burst_damage: 0.05`
  - `ult_focused: 0.5`
  - `vertical_mobility: 0.5`
- **Stat gaps**:
  - ⚠ slow (SlowPercent=+40) — expected tag(s) movement_slow are null/zero
  - ⚠ bullet_resist (CombatBarrier_Value=+200) — expected tag(s) bullet_resistance are null/zero
  - ⚠ spirit_resist (CombatBarrier_Value=+200) — expected tag(s) spirit_resistance are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: CombatBarrier_Value=200 (barrier counters engage); description contains "\bbarrier|\bshield"
  - ⚠ `low_max_hp` is null/zero — implied by: CombatBarrier_Value=200 (barrier counters engage); description contains "\bbarrier|\bshield"
  - ⚠ `escape` is null/zero — implied by: CombatBarrier_Value=200 (barrier counters engage); description contains "\bbarrier|\bshield"

#### Spirit Resilience

- **Wiki**: https://deadlock.wiki/Spirit_Resilience
- **Raw stats (Default)**:
  - TechResist: +30
  - HealthThreshold: +50
  - TechResistBelowThreshold: +15
  - OutOfCombatHealthRegen: +3 — *out_of_combat, uptime≈0.7, effective 2.1*
- **playstyle_score** (non-null):
  - `counter_importance: 1`
  - `damage_sponge: 1`
  - `high_max_hp: 0.2`
  - `spirit_burst_resistance: 1`
  - `spirit_continuous_resistance: 1`
  - `spirit_resistance: 1.25`
- **Stat gaps**:
  - ⚠ health_regen (OutOfCombatHealthRegen=+3) — expected tag(s) self_heal are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `low_max_hp` is null/zero — implied by: TechResistBelowThreshold=15 (lowhp, uptime≈0.3)
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=3 (out_of_combat, uptime≈0.7)

#### Stamina Mastery

- **Wiki**: https://deadlock.wiki/Stamina_Mastery
- **Raw stats (Default)**:
  - Stamina: +2
  - StaminaCooldownReduction: +18
  - AirMoveIncreasePercent: +23
- **playstyle_score** (non-null):
  - `aerial: 0.5`
  - `away_from_team: 0.2`
  - `burst_resistance: 0.1`
  - `cc_resist: 0.05`
  - `close_range: 0.05`
  - `engage: 0.75`
  - `escape: 1.25`
  - `farmer: 0.05`
  - `grounded: 0.15`
  - `gun_burst_damage: 0.05`
  - `high_max_hp: 0.15`
  - `horizontal_mobility: 0.5`
  - `low_max_hp: 0.1`
  - `mid_range: 0.05`
  - `spirit_burst_resistance: 0.05`
  - `vertical_mobility: 0.9`
- **Stat gaps**:
  - ⚠ stamina (Stamina=+2) — unmappable (no tag exists)
  - ⚠ cooldown_reduction (StaminaCooldownReduction=+18) — expected tag(s) cooldown_reduction are null/zero

#### Veil Walker

- **Wiki**: https://deadlock.wiki/Veil_Walker
- **Raw stats (Default)**:
  - AbilityCooldown: +15
  - AbilityDuration: +16
  - InvisAlertWhenFading: +1
  - InvisFadeToDuration: +0.25
  - SpottedRadius: +20m
  - RevealOnDamageDuration: +0.5
  - RevealOnSpottedDuration: +1.25
  - BonusSprintSpeed: +2m
  - OutOfCombatHealthRegen: +2 — *out_of_combat, uptime≈0.7, effective 1.4*
  - BonusHealth: +125
  - SpiritPower: +10
  - InvisDuration: +7
  - BonusMoveSpeed: +3.5m
  - HealOnVeil_Value: +85 — *out_of_combat, uptime≈0.3, effective 25.5*
- **playstyle_score** (non-null):
  - `away_from_team: 0.33`
  - `bullet_evasion: 0.1`
  - `burst_damage: 0.15`
  - `burst_resistance: 0.05`
  - `cc_resist: 0.05`
  - `continuous_resistance: 0.05`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `engage: 0.66`
  - `escape: 0.66`
  - `farmer: 0.25`
  - `gun_burst_damage: 0.05`
  - `gun_burst_resistance: 0.05`
  - `horizontal_mobility: 0.66`
  - `low_max_hp: 0.15`
  - `self_heal: 0.1`
  - `spirit_burst_damage: 0.05`
  - `spirit_burst_resistance: 0.05`
  - `spirit_damage: 0.1`
  - `ult_focused: 0.05`
  - `vertical_mobility: 0.25`
  - `burst_heal: 0.66`
  - `continous_heal: 0.33`
- **Stat gaps**:
  - ⚠ health (BonusHealth=+125) — expected tag(s) high_max_hp are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `single_target` is null/zero — implied by: description contains "\bstealth|\binvisible"

### Reviewed clean (6 items)

Fortitude, Fury Trance, Healing Nova, Metal Skin, Rescue Beam, Warp Stone

## Vitality — T4 (6400 souls)

### Items needing review

#### Cheat Death

- **Wiki**: https://deadlock.wiki/Cheat_Death
- **Raw stats (Default)**:
  - AbilityCooldown: +90
  - DeathImmunityDuration: +4.5
  - BonusHealth: +200
  - BulletResist: +15
  - DeathImmunityDamageReduction: -60
  - HealAmpReceivePenaltyPercent: -60
  - HealAmpRegenPenaltyPercent: -60
  - BonusMoveSpeed: 0m
- **playstyle_score** (non-null):
  - `away_from_team: 1.5`
  - `bullet_resistance: 0.5`
  - `burst_resistance: 0.5`
  - `cc_resist: 0.25`
  - `close_range: 0.5`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.1`
  - `duration_dependant: 0.05`
  - `gun_burst_resistance: 0.75`
  - `gun_continuous_resistance: 0.66`
  - `high_max_hp: 0.75`
  - `low_max_hp: 0.15`
  - `melee_resistance: 0.05`
  - `scaling_late: 0.15`
  - `self_heal: 0.1`
  - `spirit_burst_resistance: 0.25`
  - `ult_focused: 0.1`
  - `damage_sponge: 1`
  - `escape: 0.75`
- **Stat gaps**:
  - ⚠ move_speed (BonusMoveSpeed=0m) — expected tag(s) horizontal_mobility are null/zero

#### Divine Barrier

- **Wiki**: https://deadlock.wiki/Divine_Barrier
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - AbilityCastRange: +40m
  - AbilityCastDelay: +0.2
  - CooldownReductionPctOnOthers: +50
  - BuffDuration: +6
  - CombatBarrier: +600
  - BonusMoveSpeed: +2.75m
  - TechRangeMultiplier: +10
  - TechRadiusMultiplier: +10
- **playstyle_score** (non-null):
  - `ally_buff: 1.15`
  - `assist_importance: 0.75`
  - `away_from_team: 0.05`
  - `burst_resistance: 0.1`
  - `cc_resist: 0.05`
  - `close_to_team: 0.15`
  - `continuous_resistance: 0.33`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.33`
  - `debuff_resistance: 1.15`
  - `duration_dependant: 0.05`
  - `gun_burst_resistance: 0.15`
  - `gun_continuous_resistance: 0.33`
  - `horizontal_mobility: 0.15`
  - `low_max_hp: 0.5`
  - `range_extender_dependant: 0.15`
  - `self_buff: 0.2`
  - `self_heal: 0.1`
  - `shield: 1`
  - `spirit_burst_resistance: 0.15`
  - `spirit_continuous_resistance: 0.33`
  - `team_heal: 0.15`
  - `escape: 0.5`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `stun` is null/zero — implied by: description contains "\bstun"
  - ⚠ `damage_sponge` is null/zero — implied by: description contains "\bbarrier|\bshield"

#### Diviners Kevlar

- **Wiki**: https://deadlock.wiki/Diviners_Kevlar
- **Raw stats (Default)**:
  - AbilityCooldown: +40
  - TechPower: +35
  - CombatBarrier: +1000
  - BuffDuration: +20
  - BonusAbilityDurationPercent: +15
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `burst_resistance: 0.1`
  - `continuous_resistance: 0.2`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.15`
  - `gun_burst_resistance: 0.2`
  - `gun_continuous_resistance: 0.1`
  - `low_max_hp: 0.2`
  - `scaling_late: 0.1`
  - `self_buff: 0.15`
  - `self_heal: 0.05`
  - `shield: 0.75`
  - `spirit_burst_damage: 0.25`
  - `spirit_burst_resistance: 0.1`
  - `spirit_continuous_damage: 0.25`
  - `spirit_continuous_resistance: 0.1`
  - `spirit_damage: 0.45`
  - `ult_focused: 1.15`
  - `damage_sponge: 0.1`
  - `burst_heal: 0.5`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `escape` is null/zero — implied by: description contains "\bbarrier|\bshield"

#### Healing Tempo

- **Wiki**: https://deadlock.wiki/Healing_Tempo
- **Raw stats (Default)**:
  - AbilityCooldown: +1
  - BonusFireRate: +35
  - BuffDuration: +7
  - BonusMoveSpeed: +1.25m
  - MinimumHealAmount: +1
  - TechResist: +10
  - BonusHealthRegen: +6
  - HealAmpCastPercent: +25
  - HealAmpRegenPercent: +25
  - OutOfCombatHealthRegen: +4 — *out_of_combat, uptime≈0.7, effective 2.8*
- **playstyle_score** (non-null):
  - `aerial: -0.05`
  - `ally_buff: 0.25`
  - `assist_importance: 0.66`
  - `bullet_lifesteal: 0.25`
  - `burst_heal: 0.75`
  - `close_to_team: 0.5`
  - `continous_heal: 1`
  - `duration_dependant: 0.05`
  - `fire_rate: 0.2`
  - `grounded: 0.05`
  - `high_max_hp: 0.25`
  - `horizontal_mobility: 0.25`
  - `low_max_hp: -0.05`
  - `range_extender_dependant: 0.05`
  - `self_buff: 0.25`
  - `self_heal: 0.45`
  - `spirit_lifesteal: 0.25`
  - `spirit_resistance: 0.4`
  - `team_heal: 1`
  - `vertical_mobility: 0.1`
  - `lane_pusher: 0.75`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)

#### Indomitable

- **Wiki**: https://deadlock.wiki/Indomitable
- **Raw stats (Default)**:
  - AbilityCooldown: +55
  - AbilityDuration: +10
  - BulletResist: +8
  - TechResist: +8
  - CooldownReductionOnProc: +20
  - VexBarrierCombatBarrier_Value: +325 — *damage_window, uptime≈0.4, effective 3.25*
- **playstyle_score** (non-null):
  - `away_from_team: 0.15`
  - `cc_resist: 1.75`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 1`
  - `debuff_resistance: 0.05`
  - `duration_dependant: 0.05`
  - `escape: 0.5`
  - `gun_burst_resistance: 0.25`
  - `high_max_hp: 0.15`
  - `low_max_hp: 0.75`
  - `self_heal: 0.05`
  - `shield: 0.66`
  - `spirit_burst_resistance: 0.25`
  - `spirit_damage: 0.1`
  - `spirit_resistance: 0.1`
  - `ult_focused: 0.2`
- **Stat gaps**:
  - ⚠ bullet_resist (BulletResist=+8, VexBarrierCombatBarrier_Value=+325) — expected tag(s) bullet_resistance are null/zero
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: VexBarrierCombatBarrier_Value=325 (barrier counters engage)

#### Juggernaut

- **Wiki**: https://deadlock.wiki/Juggernaut
- **Raw stats (Default)**:
  - MeleeResistPercent: +25
  - SlowResistancePercent: +50
  - FireRateSlow: +36
  - BonusHealthRegen: +8
  - BonusMoveSpeed: +2m
  - FireRateSlowDuration: +4
- **playstyle_score** (non-null):
  - `aerial: -0.05`
  - `away_from_team: 0.2`
  - `bullet_evasion: 0.05`
  - `bullet_resistance: 0.15`
  - `close_range: 0.2`
  - `continuous_resistance: 0.66`
  - `counter_importance: 0.33`
  - `damage_sponge: 0.75`
  - `duration_dependant: 0.05`
  - `escape: 0.25`
  - `fire_rate_slow: 0.85`
  - `grounded: 0.05`
  - `gun_burst_resistance: -0.05`
  - `gun_continuous_resistance: 0.75`
  - `high_max_hp: 0.25`
  - `horizontal_mobility: 0.5`
  - `large_hitbox: 0.1`
  - `long_range: -0.1`
  - `low_max_hp: -0.15`
  - `melee_resistance: 0.5`
  - `mid_range: 0.1`
  - `self_heal: 0.15`
  - `vertical_mobility: 0.15`
- **Stat gaps**:
  - ⚠ debuff_resist (SlowResistancePercent=+50) — expected tag(s) debuff_resistance are null/zero
  - ⚠ slow (FireRateSlow=+36) — expected tag(s) movement_slow are null/zero

#### Siphon Bullets

- **Wiki**: https://deadlock.wiki/Siphon_Bullets
- **Raw stats (Default)**:
  - BaseAttackDamagePercent: +15
  - BulletResist: +10
  - StealPerHit: +1
  - StealPerKill: +1
  - StackLostPerDeath: +2
  - MaxStacks: +9999
  - StealDuration: +17
  - ProcCooldown: +1.2
  - HealthStealPctHero: +2.5
  - ParticleRadius: +1m
- **playstyle_score** (non-null):
  - `bullet_damage: 0.33`
  - `bullet_lifesteal: 0.15`
  - `bullet_proc: 1`
  - `bullet_resistance: 0.33`
  - `burst_damage: 0.15`
  - `continuous_damage: 0.15`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.5`
  - `damage_sponge: 0.66`
  - `debuff: 0.75`
  - `duration_dependant: 0.05`
  - `fire_rate: 0.1`
  - `gun_burst_damage: 0.15`
  - `gun_burst_resistance: 0.15`
  - `gun_continuous_damage: 0.33`
  - `gun_continuous_proc: 1`
  - `gun_continuous_resistance: 0.15`
  - `high_max_hp: 0.75`
  - `long_range: -0.05`
  - `low_max_hp: 0.5`
  - `pure_damage: 1`
  - `self_heal: 0.5`
  - `single_target: 0.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: StealPerKill=1 (per_stack, uptime≈4999.5)
  - ⚠ `scaling_late` is null/zero — implied by: StealPerKill=1 (per_stack, uptime≈4999.5)

#### Unstoppable

- **Wiki**: https://deadlock.wiki/Unstoppable
- **Raw stats (Default)**:
  - AbilityCooldown: +65
  - AbilityDuration: +5.5
  - BonusHealth: +125
  - StatusResistancePercent: +25
- **playstyle_score** (non-null):
  - `cc_resist: 2`
  - `close_range: 0.15`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.75`
  - `damage_sponge: 0.2`
  - `debuff_resistance: 0.25`
  - `duration_dependant: 0.05`
  - `escape: 0.15`
  - `high_max_hp: 0.25`
  - `horizontal_mobility: 0.15`
  - `mid_range: 0.15`
  - `ult_focused: 0.45`
  - `vertical_mobility: 0.15`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `silence` is null/zero — implied by: description contains "\bsilence"
  - ⚠ `stun` is null/zero — implied by: description contains "\bstun"
  - ⚠ `disarm` is null/zero — implied by: description contains "\bdisarm"

#### Witchmail

- **Wiki**: https://deadlock.wiki/Witchmail
- **Raw stats (Default)**:
  - AbilityCooldown: +1
  - TechPower: +14
  - TechResist: +20
  - CooldownReductionPerHit: +4
  - CooldownReduction: +7
  - DamageThreshold: +75
- **playstyle_score** (non-null):
  - `away_from_team: 0.75`
  - `burst_resistance: 0.15`
  - `close_range: 0.2`
  - `continuous_resistance: 0.15`
  - `cooldown_reduction: 0.66`
  - `counter_importance: 0.75`
  - `damage_sponge: 1`
  - `high_max_hp: 0.25`
  - `large_hitbox: 0.05`
  - `long_range: -0.1`
  - `mid_range: 0.15`
  - `self_buff: 0.05`
  - `spirit_burst_resistance: 0.75`
  - `spirit_continuous_resistance: 0.75`
  - `spirit_damage: 0.7`
  - `spirit_resistance: 0.5`
  - `ability_spam: 1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `low_max_hp` is null/zero — implied by: DamageThreshold=75 (damage_window, uptime≈0.4)

### Reviewed clean (8 items)

Colossus, Infuser, Inhibitor, Leech, Phantom Strike, Plated Armor, Spellbreaker, Vampiric Burst

## Spirit — T1 (800 souls)

### Items needing review

#### Golden Goose Egg

- **Wiki**: https://deadlock.wiki/Golden_Goose_Egg
- **Raw stats (Default)**:
  - AbilityChannelTime: +2
  - BonusGoldPerMinute: +90
  - OutgoingDamagePenaltyPercent: -10
  - ThinkRate: +3
  - BonusSprintSpeed: +1m
  - OutOfCombatHealthRegen: +1 — *out_of_combat, uptime≈0.7, effective 0.7*
  - StartingGold: +400
  - BonusBuffsPerGold: +100
- **playstyle_score** (non-null):
  - `away_from_team: -0.2`
  - `bullet_damage: 0.15`
  - `burst_damage: 0.1`
  - `close_to_team: 0.1`
  - `continuous_damage: 0.1`
  - `cooldown_reduction: 0.2`
  - `farmer: 0.5`
  - `fire_rate: 0.2`
  - `gun_burst_damage: 0.1`
  - `gun_continuous_damage: 0.1`
  - `high_kill_count: -0.33`
  - `high_max_hp: 0.2`
  - `horizontal_mobility: 0.33`
  - `hybrid_damage_usage: 1`
  - `magazine_size_dependant: 0.2`
  - `scaling_early: -0.2`
  - `scaling_late: 0.2`
  - `spirit_burst_damage: 0.1`
  - `spirit_continuous_damage: 0.1`
  - `spirit_damage: 0.2`
  - `vertical_mobility: 0.15`
- **Stat gaps**:
  - ⚠ health_regen (OutOfCombatHealthRegen=+1) — expected tag(s) self_heal are null/zero

#### Rusted Barrel

- **Wiki**: https://deadlock.wiki/Rusted_Barrel
- **Raw stats (Default)**:
  - AbilityCooldown: +16
  - AbilityDuration: +5
  - AbilityCastRange: +32m
  - AbilityCastDelay: +0.1
  - FireRateSlow: +32
  - BonusHealth: +50
  - BonusSprintSpeed: +0.5m
  - BulletArmorReduction: -8
- **playstyle_score** (non-null):
  - `assist_importance: 0.15`
  - `bullet_resist_shred: 0.75`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.25`
  - `fire_rate_slow: 0.85`
  - `high_max_hp: 0.25`
  - `horizontal_mobility: 0.2`
  - `hybrid_damage_usage: 0.1`
  - `spirit_damage: 0.15`
- **Stat gaps**:
  - ⚠ slow (FireRateSlow=+32) — expected tag(s) movement_slow are null/zero

### Reviewed clean (6 items)

Extra Charge, Extra Spirit, Mystic Burst, Mystic Expansion, Mystic Regeneration, Spirit Strike

## Spirit — T2 (1600 souls)

### Items needing review

#### Arcane Surge

- **Wiki**: https://deadlock.wiki/Arcane_Surge
- **Raw stats (Default)**:
  - AbilityDuration: +7
  - BonusAbilityDurationPercent: +15
  - SpiritPower: +20
  - TechRadiusMultiplierBuff: +12
  - TechRangeMultiplierBuff: +12
  - Stamina: +1
  - StaminaCooldownReduction: +12
- **playstyle_score** (non-null):
  - `aerial: 0.1`
  - `burst_damage: 0.1`
  - `close_range: 0.33`
  - `duration_dependant: 0.75`
  - `engage: 0.75`
  - `grounded: 0.1`
  - `horizontal_mobility: 0.33`
  - `hybrid_damage_usage: -0.15`
  - `long_range: -0.1`
  - `mid_range: 0.33`
  - `multi_ability_focus: 0.15`
  - `range_extender_dependant: 0.66`
  - `single_ability_focus: 0.33`
  - `spirit_burst_damage: 0.25`
  - `spirit_burst_proc: 0.05`
  - `spirit_continuous_damage: 0.1`
  - `spirit_continuous_proc: 0.05`
  - `spirit_damage: 0.25`
  - `vertical_mobility: 0.5`
- **Stat gaps**:
  - ⚠ stamina (Stamina=+1) — unmappable (no tag exists)
  - ⚠ cooldown_reduction (StaminaCooldownReduction=+12) — expected tag(s) cooldown_reduction are null/zero

#### Cold Front

- **Wiki**: https://deadlock.wiki/Cold_Front
- **Raw stats (Default)**:
  - AbilityCooldown: +25
  - AbilityDuration: +4
  - SpreadDuration: +0.6
  - StartRadius: +2m
  - EndRadius: +12m
  - MovementSpeedSlow: +60
  - Damage_Value: +95
  - DamageHeight: +5m
  - NPCDamageMult: +1
  - TechResist: +6
- **playstyle_score** (non-null):
  - `aerial: -0.55`
  - `aoe_cluster: 0.45`
  - `away_from_team: 0.25`
  - `burst_damage: 0.66`
  - `close_range: 0.75`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `engage: 0.5`
  - `farmer: 0.25`
  - `grounded: 0.55`
  - `high_kill_count: 0.25`
  - `long_range: -1`
  - `mid_range: 0.33`
  - `movement_slow: 1`
  - `range_extender_dependant: 0.05`
  - `scaling_early: 0.25`
  - `spirit_burst_damage: 1`
  - `spirit_burst_proc: 0.1`
  - `spirit_continuous_damage: -0.15`
  - `spirit_damage: 0.45`
  - `spirit_proc: 0.1`
  - `spirit_resistance: 0.33`
  - `lane_pusher: 0.5`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Improved Spirit

- **Wiki**: https://deadlock.wiki/Improved_Spirit
- **Raw stats (Default)**:
  - TechPower: +18
  - BonusSprintSpeed: +1m
  - BonusHealth: +75
  - OutOfCombatHealthRegen: +1.5 — *out_of_combat, uptime≈0.7, effective 1.05*
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `charge_dependant: 0.05`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `farmer: 0.1`
  - `multi_ability_focus: 0.5`
  - `range_extender_dependant: 0.05`
  - `self_heal: 0.15`
  - `single_ability_focus: 0.2`
  - `spirit_burst_damage: 0.8`
  - `spirit_continuous_damage: 0.8`
  - `spirit_damage: 1.33`
  - `spirit_proc: 0.2`
  - `ult_focused: 0.1`
- **Stat gaps**:
  - ⚠ sprint_speed (BonusSprintSpeed=+1m) — expected tag(s) horizontal_mobility are null/zero
  - ⚠ health (BonusHealth=+75) — expected tag(s) high_max_hp are null/zero

#### Slowing Hex

- **Wiki**: https://deadlock.wiki/Slowing_Hex
- **Raw stats (Default)**:
  - AbilityCooldown: +27
  - AbilityDuration: +3.5
  - AbilityCastRange: +25m
  - AbilityCastDelay: +0.1
  - SlowPercent: +20
  - GroundDashReductionPercent: -30
  - BonusSprintSpeed: +0.5m
- **playstyle_score** (non-null):
  - `assist_importance: 0.2`
  - `close_range: 0.15`
  - `close_to_team: 0.1`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.8`
  - `debuff: 0.75`
  - `displace: 0.15`
  - `duration_dependant: 0.05`
  - `engage: 0.66`
  - `horizontal_mobility: 0.25`
  - `mid_range: 0.15`
  - `movement_slow: 1`
  - `range_extender_dependant: 0.05`
  - `silence: 0.75`
  - `single_target: 0.15`
  - `spirit_damage: 0.2`
  - `stun: 0.33`
  - `trap_block_obstruct: 0.5`
  - `vertical_mobility: 0.1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion; description applies CC ("\bsilence") — low-value suggestion

#### Suppressor

- **Wiki**: https://deadlock.wiki/Suppressor
- **Raw stats (Default)**:
  - AbilityDuration: +5
  - TechPower: +6
  - FireRateSlow: +28
  - BulletResist: +8
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.2`
  - `assist_importance: 0.33`
  - `bullet_resistance: 0.1`
  - `close_range: 0.15`
  - `close_to_team: 0.15`
  - `continuous_resistance: 0.05`
  - `counter_importance: 0.5`
  - `debuff: 0.1`
  - `duration_dependant: 0.05`
  - `fire_rate_slow: 1.15`
  - `gun_burst_resistance: 0.1`
  - `gun_continuous_resistance: 0.33`
  - `high_max_hp: 0.33`
  - `mid_range: 0.15`
  - `multi_ability_focus: 0.5`
  - `single_target: 0.05`
  - `spirit_damage: 0.65`
  - `spirit_proc: 0.5`
  - `spirit_burst_proc: 0.15`
  - `spirit_continuous_proc: 0.75`
- **Stat gaps**:
  - ⚠ slow (FireRateSlow=+28) — expected tag(s) movement_slow are null/zero

### Reviewed clean (7 items)

Bullet Resist Shredder, Compress Cooldown, Duration Extender, Mystic Slow, Mystic Vulnerability, Quicksilver Reload, Spirit Sap

## Spirit — T3 (3200 souls)

### Items needing review

#### Knockdown

- **Wiki**: https://deadlock.wiki/Knockdown
- **Raw stats (Default)**:
  - AbilityCooldown: +35
  - AbilityCastRange: +45m
  - AbilityCastDelay: +0.1
  - StunDelay: +2
  - StunDuration: +0.5
  - VisualContractRadius: +3m
  - BonusHealth: +75
  - MaxBonusDuration: +1.5
  - MaxHeightForBonus: +30m
  - TechRangeMultiplier: +5
  - TechRadiusMultiplier: +5
- **playstyle_score** (non-null):
  - `anti_air: 1.15`
  - `assist_importance: 0.05`
  - `close_range: 0.15`
  - `close_to_team: 0.15`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.75`
  - `debuff: 0.75`
  - `displace: 0.5`
  - `duration_dependant: 0.05`
  - `high_max_hp: 0.3`
  - `interrupt: 0.5`
  - `mid_range: 0.1`
  - `movement_slow: 0.1`
  - `range_extender_dependant: 0.25`
  - `single_target: 0.15`
  - `spirit_damage: 0.2`
  - `stun: 1.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bstun") — low-value suggestion

#### Silence Wave

- **Wiki**: https://deadlock.wiki/Silence_Wave
- **Raw stats (Default)**:
  - AbilityCooldown: +42
  - AbilityDuration: +3
  - AbilityCastRange: +40m
  - AbilityCastDelay: +0.1
  - BonusHealth: +50
  - CooldownOnMiss: +30
  - HeightOffGround: +1m
  - GrowthPerMeter: +0.15m
  - InitialWidth: +5m
  - Damage_Value: +75
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.15`
  - `assist_importance: 0.1`
  - `burst_damage: 0.35`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.25`
  - `duration_dependant: 0.05`
  - `grounded: 1`
  - `high_max_hp: 0.2`
  - `long_range: 0.1`
  - `mid_range: 0.2`
  - `range_extender_dependant: 0.05`
  - `silence: 1.15`
  - `single_target: 0.15`
  - `spirit_burst_damage: 0.75`
  - `spirit_damage: 0.33`
  - `spirit_resistance: 1`
  - `engage: 0.75`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `spirit_burst_proc` is null/zero — implied by: proc-style damage (Damage_Value=75, activation=InstantCast)
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bsilence") — low-value suggestion

#### Superior Cooldown

- **Wiki**: https://deadlock.wiki/Superior_Cooldown
- **Raw stats (Default)**:
  - CooldownReduction: +20
  - OutOfCombatHealthRegen: +4 — *out_of_combat, uptime≈0.7, effective 2.8*
- **playstyle_score** (non-null):
  - `ability_spam: 0.5`
  - `charge_dependant: 0.25`
  - `cooldown_reduction: 1`
  - `multi_ability_focus: 0.5`
  - `self_heal: 0.05`
  - `spirit_burst_damage: 0.05`
  - `spirit_continuous_damage: 0.05`
  - `spirit_damage: 0.2`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)

#### Surge of Power

- **Wiki**: https://deadlock.wiki/Surge_of_Power
- **Raw stats (Default)**:
  - AbilityCooldown: +14
  - ImbuedTechPower: +24
  - FireRateBonus: +20
  - BonusMoveSpeed: +1.75m
  - MovementSpeedBonusDuration: +8
  - MoveWhileShootingSpeedPenaltyReductionPercent: +100
  - MoveWhileZoomedSpeedPenaltyReductionPercent: +100
- **playstyle_score** (non-null):
  - `bullet_damage: 0.15`
  - `burst_damage: 0.15`
  - `continuous_damage: 0.15`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `farmer: 0.1`
  - `fire_rate: 0.45`
  - `gun_burst_damage: 0.15`
  - `gun_continuous_damage: 0.2`
  - `hybrid_damage_usage: 0.66`
  - `single_ability_focus: 0.15`
  - `single_target: 0.15`
  - `spirit_burst_damage: 0.25`
  - `spirit_continuous_damage: 0.1`
  - `spirit_damage: 0.33`
- **Stat gaps**:
  - ⚠ move_speed (BonusMoveSpeed=+1.75m) — expected tag(s) horizontal_mobility are null/zero

#### Torment Pulse

- **Wiki**: https://deadlock.wiki/Torment_Pulse
- **Raw stats (Default)**:
  - AbilityCooldown: +1.4
  - BonusHealth: +100
  - DamagePulseAmount_Value: +25
  - DamagePulseRadius: +9m
  - MeleeResistPercent: +15
- **playstyle_score** (non-null):
  - `aerial: -0.1`
  - `burst_damage: 0.1`
  - `close_range: 1`
  - `continuous_damage: 0.1`
  - `grounded: 0.15`
  - `high_max_hp: 0.25`
  - `long_range: -1`
  - `melee_damage: 0.05`
  - `melee_resistance: 0.2`
  - `mid_range: -0.25`
  - `spirit_damage: 0.3`
  - `spirit_proc: 0.1`
  - `single_target: 0.2`
  - `cooldown_reduction: 0.05`
  - `range_extender_dependant: 0.05`
  - `close_to_team: -0.33`
  - `away_from_team: 0.33`
  - `spirit_burst_damage: 0.1`
  - `spirit_continuous_damage: 0.1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `spirit_continuous_proc` is null/zero — implied by: proc-style damage (DamagePulseAmount_Value=25, activation=Passive)

### Reviewed clean (8 items)

Decay, Disarming Hex, Greater Expansion, Radiant Regeneration, Rapid Recharge, Spirit Snatch, Superior Duration, Tankbuster

## Spirit — T4 (6400 souls)

### Items needing review

#### Arctic Blast

- **Wiki**: https://deadlock.wiki/Arctic_Blast
- **Raw stats (Default)**:
  - AbilityCooldown: +24
  - SpreadDuration: +0.6
  - StartRadius: +2m
  - EndRadius: +12m
  - SlowPercent: +60
  - SlowDuration: +4
  - Damage_Value: +175
  - DamageHeight: +5m
  - NPCDamageMult: +1
  - TechResist: +10
  - FreezeDuration: +0.75
  - PercentDamage: +15
- **playstyle_score** (non-null):
  - `aerial: -0.55`
  - `aoe_cluster: 0.45`
  - `away_from_team: 0.25`
  - `burst_damage: 0.66`
  - `close_range: 0.75`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.05`
  - `farmer: 0.25`
  - `grounded: 0.55`
  - `long_range: -1`
  - `mid_range: 0.33`
  - `movement_slow: 1`
  - `pure_damage: 0.25`
  - `range_extender_dependant: 0.05`
  - `spirit_burst_damage: 1`
  - `spirit_burst_proc: 0.1`
  - `spirit_continuous_damage: -0.15`
  - `spirit_damage: 0.45`
  - `spirit_resistance: 0.2`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Boundless Spirit

- **Wiki**: https://deadlock.wiki/Boundless_Spirit
- **Raw stats (Default)**:
  - TechPower: +30
  - BonusHealth: +75
  - OutOfCombatHealthRegen: +4 — *out_of_combat, uptime≈0.7, effective 2.8*
  - TechPowerPercent: +15
- **playstyle_score** (non-null):
  - `high_max_hp: 0.1`
  - `self_heal: 0.1`
  - `spirit_damage: 1.75`
  - `spirit_resist_shred: 0.1`
  - `spirit_proc: 0.1`
  - `spirit_burst_damage: 1`
  - `spirit_continuous_damage: 1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)

#### Escalating Exposure

- **Wiki**: https://deadlock.wiki/Escalating_Exposure
- **Raw stats (Default)**:
  - AbilityDuration: +12
  - ProcCooldown: +0.7
  - MagicIncreasePerStack: +4.5
  - TechResist: +17
  - MaxStacks: +12
  - TechArmorDamageReduction: -8
- **playstyle_score** (non-null):
  - `ability_spam: 0.1`
  - `aoe_cluster: 0.15`
  - `continuous_damage: 0.15`
  - `cooldown_reduction: 0.1`
  - `debuff: 0.75`
  - `dot: 0.1`
  - `duration_dependant: 0.1`
  - `farmer: 0.33`
  - `high_assist_count: 0.25`
  - `hybrid_damage_usage: -0.1`
  - `multi_ability_focus: 0.15`
  - `spirit_burst_proc: -0.15`
  - `spirit_continuous_damage: 0.5`
  - `spirit_continuous_proc: 2`
  - `spirit_damage: 0.33`
  - `spirit_proc: 0.5`
  - `spirit_resist_shred: 0.2`
  - `spirit_resistance: 0.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `high_kill_count` is null/zero — implied by: MagicIncreasePerStack=4.5 (per_stack, uptime≈6)
  - ⚠ `scaling_late` is null/zero — implied by: MagicIncreasePerStack=4.5 (per_stack, uptime≈6)

#### Ethereal Shift

- **Wiki**: https://deadlock.wiki/Ethereal_Shift
- **Raw stats (Default)**:
  - AbilityCooldown: +35
  - AbilityDuration: +4
  - BuffDuration: +5
  - TechResist: +30
  - DampingFactor: +3
  - LiftHeight: +200
  - BonusSpirit: +20
  - FloatMoveSpeed: +2.5m
  - BonusMoveSpeed: +3m
- **playstyle_score** (non-null):
  - `away_from_team: 0.1`
  - `bullet_resistance: -0.5`
  - `burst_resistance: 0.33`
  - `cc_resist: 1.75`
  - `close_range: 0.15`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.5`
  - `debuff_resistance: 0.15`
  - `duration_dependant: 0.05`
  - `gun_burst_resistance: -0.5`
  - `gun_continuous_resistance: -0.5`
  - `horizontal_mobility: 0.66`
  - `long_range: -0.33`
  - `low_max_hp: 0.15`
  - `melee_resistance: -0.5`
  - `mid_range: 0.15`
  - `spirit_burst_resistance: 1`
  - `spirit_continuous_resistance: 0.5`
  - `spirit_damage: 0.25`
  - `spirit_resistance: 0.33`
  - `vertical_mobility: 0.25`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `movement_slow` is null/zero — implied by: description contains "\bslow(?!ed)"

#### Focus Lens

- **Wiki**: https://deadlock.wiki/Focus_Lens
- **Raw stats (Default)**:
  - AbilityCooldown: +45
  - AbilityDuration: +4
  - AbilityCastRange: +20m
  - AbilityCastDelay: +0.1
  - PercentDamage: +30
  - BonusFireRate: +10
  - MagicResistReduction: -9
  - TechPowerReduction: -30
  - ResistReductionDuration: +12
- **playstyle_score** (non-null):
  - `bullet_damage: 0.2`
  - `burst_damage: 0.33`
  - `close_range: 0.25`
  - `continuous_damage: 0.15`
  - `debuff: 0.25`
  - `fire_rate: 0.25`
  - `long_range: -0.25`
  - `melee_damage: 0.2`
  - `mid_range: 0.2`
  - `pure_damage: 0.1`
  - `silence: 1`
  - `spirit_damage: 0.3`
  - `spirit_resist_shred: 0.1`
  - `headshot_damage: 0.2`
  - `single_target: 1`
  - `cooldown_reduction: 0.05`
  - `range_extender_dependant: 0.05`
  - `duration_dependant: 0.1`
  - `close_to_team: 0.1`
  - `assist_importance: 0.1`
  - `counter_importance: 0.2`
  - `spirit_burst_damage: 0.25`
  - `spirit_continuous_damage: 0.2`
  - `gun_burst_damage: 0.15`
  - `gun_continuous_damage: 0.15`
  - `hybrid_damage_usage: 0.1`
  - `spirit_burst_proc: 0.1`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bsilence") — low-value suggestion

#### Magic Carpet

- **Wiki**: https://deadlock.wiki/Magic_Carpet
- **Raw stats (Default)**:
  - AbilityCooldown: +32
  - AbilityDuration: +12
  - AbilityCastDelay: +0.2
  - TechPower: +14
  - SummonDuration: +1.3
  - FlyMoveSpeed: +7m
  - BonusHealth: +125
  - BonusAbilityDurationPercent: +15
- **playstyle_score** (non-null):
  - `aerial: 0.1`
  - `away_from_team: 0.5`
  - `bullet_damage: -0.05`
  - `burst_resistance: -0.2`
  - `close_range: 0.2`
  - `continuous_damage: -0.1`
  - `continuous_resistance: 0.2`
  - `cooldown_reduction: 0.05`
  - `duration_dependant: 0.66`
  - `farmer: 0.2`
  - `grounded: 0.1`
  - `gun_burst_resistance: -0.15`
  - `gun_continuous_damage: -0.1`
  - `gun_continuous_resistance: 0.15`
  - `high_max_hp: 0.2`
  - `horizontal_mobility: 0.66`
  - `long_range: -0.1`
  - `melee_damage: -0.05`
  - `mid_range: 0.2`
  - `spirit_burst_resistance: -0.15`
  - `spirit_continuous_damage: -0.1`
  - `spirit_continuous_resistance: 0.15`
  - `spirit_damage: 0.2`
  - `vertical_mobility: 0.66`
  - `engage: 0.15`
  - `escape: 2`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `movement_slow` is null/zero — implied by: description contains "\bslow(?!ed)"
  - ⚠ `cc_resist` is null/zero — implied by: description applies CC ("\bslow(?!ed)") — low-value suggestion

#### Mystic Reverb

- **Wiki**: https://deadlock.wiki/Mystic_Reverb
- **Raw stats (Default)**:
  - AbilityCooldown: +6.25
  - TechDamagePercent: +50
  - DelayDuration: +3
  - MinimumDamage: +100
  - Radius: +16m
  - AbilityLifestealPercentHero: +8
  - ImbueAbilityLifesteal: +22
  - MovementSpeedSlow: +40
  - MaxHealthDamage: +10
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.15`
  - `burst_damage: 0.5`
  - `farmer: 0.15`
  - `movement_slow: 0.33`
  - `self_heal: 0.33`
  - `spirit_damage: 0.25`
  - `spirit_proc: 0.25`
  - `single_target: 0.33`
  - `cooldown_reduction: 0.05`
  - `range_extender_dependant: 0.05`
  - `spirit_burst_damage: 1.5`
  - `spirit_continuous_damage: -0.1`
  - `single_ability_focus: 1`
  - `multi_ability_focus: -0.1`
  - `spirit_burst_proc: 1`
  - `spirit_continuous_proc: -0.15`
- **Stat gaps**:
  - ⚠ spirit_lifesteal (AbilityLifestealPercentHero=+8) — expected tag(s) spirit_lifesteal are null/zero

#### Refresher

- **Wiki**: https://deadlock.wiki/Refresher
- **Raw stats (Default)**:
  - AbilityCooldown: +300
  - AbilityCastDelay: +0.6
  - TechResist: +14
  - BulletResist: +15
- **playstyle_score** (non-null):
  - `spirit_damage: 0.25`
  - `cooldown_reduction: 0.25`
  - `charge_dependant: 0.25`
  - `ult_focused: 1.15`
  - `hybrid_damage_usage: -0.15`
  - `single_ability_focus: 0.25`
- **Stat gaps**:
  - ⚠ spirit_resist (TechResist=+14) — expected tag(s) spirit_resistance are null/zero
  - ⚠ bullet_resist (BulletResist=+15) — expected tag(s) bullet_resistance are null/zero

#### Scourge

- **Wiki**: https://deadlock.wiki/Scourge
- **Raw stats (Default)**:
  - AbilityCooldown: +35
  - AbilityDuration: +10
  - AbilityCastRange: +35m
  - AbilityCastDelay: +0.25
  - TickRate: +0.25
  - MaxHealthPercentAsDPS: +3.5
  - AuraRadius: +10m
  - TechResist: +40
  - BonusHealth: +100
  - StatusResistancePercent: +15
- **playstyle_score** (non-null):
  - `ally_buff: 0.33`
  - `aoe_cluster: 0.1`
  - `close_range: 0.5`
  - `continuous_damage: 0.45`
  - `continuous_resistance: 0.15`
  - `grounded: 0.15`
  - `high_max_hp: 0.15`
  - `long_range: -0.25`
  - `mid_range: 0.15`
  - `pure_damage: 0.5`
  - `self_buff: 0.25`
  - `spirit_damage: 0.2`
  - `spirit_resistance: 0.66`
  - `team_heal: 0.1`
  - `cooldown_reduction: 0.15`
  - `range_extender_dependant: 0.05`
  - `duration_dependant: 0.05`
  - `assist_importance: 0.33`
  - `counter_importance: 0.5`
  - `spirit_burst_damage: -0.15`
  - `spirit_burst_resistance: 0.4`
  - `spirit_continuous_damage: 0.5`
  - `spirit_continuous_resistance: 0.75`
  - `damage_sponge: 0.2`
  - `spirit_continuous_proc: 0.15`
- **Stat gaps**:
  - ⚠ debuff_resist (StatusResistancePercent=+15) — expected tag(s) debuff_resistance are null/zero

#### Spirit Burn

- **Wiki**: https://deadlock.wiki/Spirit_Burn
- **Raw stats (Default)**:
  - AbilityCooldown: +20
  - TechRangeMultiplier: +6
  - TechRadiusMultiplier: +6
  - DamageThreshold: +500
  - DamageThresholdDuration: +5
  - ExplosionDamage: +110
  - ExplosionRadius: +12m
  - DPS_Value: +24
  - DebuffDuration: +8
  - HealAmpReceivePenaltyPercent: -70
  - HealAmpRegenPenaltyPercent: -70
  - TickRate: +0.5
  - CooldownReductionPctOnNonHeroes: +50
  - DamagePctVsNonHeroes: +50
- **playstyle_score** (non-null):
  - `anti_heal: 1.25`
  - `aoe_cluster: 0.25`
  - `burst_damage: 0.25`
  - `continuous_damage: 0.25`
  - `cooldown_reduction: 0.05`
  - `dot: 0.5`
  - `duration_dependant: 0.05`
  - `range_extender_dependant: 0.15`
  - `single_target: 0.25`
  - `spirit_burst_damage: 1`
  - `spirit_burst_proc: 0.9`
  - `spirit_continuous_damage: 0.5`
  - `spirit_continuous_proc: 0.25`
  - `spirit_damage: 0.5`
  - `spirit_proc: 0.5`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `damage_sponge` is null/zero — implied by: DamageThreshold=500 (damage_window, uptime≈0.4)
  - ⚠ `low_max_hp` is null/zero — implied by: DamageThreshold=500 (damage_window, uptime≈0.4)
  - ⚠ `pure_damage` is null/zero — implied by: description mentions burn/poison/%HP

#### Transcendent Cooldown

- **Wiki**: https://deadlock.wiki/Transcendent_Cooldown
- **Raw stats (Default)**:
  - CooldownReduction: +25
  - ItemCooldownReduction: +25
  - OutOfCombatHealthRegen: +4 — *out_of_combat, uptime≈0.7, effective 2.8*
- **playstyle_score** (non-null):
  - `cooldown_reduction: 2`
  - `self_heal: 0.1`
  - `spirit_damage: 0.2`
- **Synergy gaps** (conditional bonuses imply these tags should be scored):
  - ⚠ `farmer` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)
  - ⚠ `away_from_team` is null/zero — implied by: OutOfCombatHealthRegen=4 (out_of_combat, uptime≈0.7)

#### Vortex Web

- **Wiki**: https://deadlock.wiki/Vortex_Web
- **Raw stats (Default)**:
  - AbilityCooldown: +42
  - AbilityDuration: +4
  - AbilityCastRange: +30m
  - AbilityCastDelay: +0.2
  - CaptureRadius: +12m
  - TetherDuration: +0.5
  - TetherRadius: +1m
  - SlowPercent: +35
  - GroundDashReductionPercent: -40
  - TechRangeMultiplier: +8
  - TechRadiusMultiplier: +8
  - BonusSprintSpeed: +0.75m
- **playstyle_score** (non-null):
  - `aoe_cluster: 0.2`
  - `close_to_team: 0.15`
  - `cooldown_reduction: 0.05`
  - `counter_importance: 0.1`
  - `displace: 0.5`
  - `duration_dependant: 0.05`
  - `movement_slow: 0.75`
  - `range_extender_dependant: 0.2`
  - `silence: 0.25`
  - `spirit_damage: 0.2`
  - `stun: 0.2`
- **Stat gaps**:
  - ⚠ sprint_speed (BonusSprintSpeed=+0.75m) — expected tag(s) horizontal_mobility are null/zero

### Reviewed clean (4 items)

Cursed Relic, Echo Shard, Lightning Scroll, Mercurial Magnum

## Streetbrawl-only items (17)

These items exist in `data/items/` (tier 9999) but in `Data:ItemData.json` they are flagged `StreetBrawl: true`, meaning they only appear in Streetbrawl mode. They are filtered out of normal builds via `tier !== 9999` in the algorithm. Consider moving them to a `data/items/streetbrawl/` subfolder for hygiene.

- **Celestial Blessing** (Vitality) — https://deadlock.wiki/Celestial_Blessing
- **Cloak of Opportunity** (Vitality) — https://deadlock.wiki/Cloak_of_Opportunity
- **Electric Slippers** (Vitality) — https://deadlock.wiki/Electric_Slippers
- **Eternal Gift** (Vitality) — https://deadlock.wiki/Eternal_Gift
- **Frostbite Charm** (Spirit) — https://deadlock.wiki/Frostbite_Charm
- **Haunting Shot** (Weapon) — https://deadlock.wiki/Haunting_Shot
- **Infinite Rounds** (Weapon) — https://deadlock.wiki/Infinite_Rounds
- **Mystic Conduit** (Spirit) — https://deadlock.wiki/Mystic_Conduit
- **Mystical Piano** (Spirit) — https://deadlock.wiki/Mystical_Piano
- **Nullification Burst** (Vitality) — https://deadlock.wiki/Nullification_Burst
- **Omnicharge Signet** (Spirit) — https://deadlock.wiki/Omnicharge_Signet
- **Prism Blast** (Spirit) — https://deadlock.wiki/Prism_Blast
- **Runed Gauntlets** (Weapon) — https://deadlock.wiki/Runed_Gauntlets
- **Seraphim Wings** (Vitality) — https://deadlock.wiki/Seraphim_Wings
- **Shadow Strike** (Vitality) — https://deadlock.wiki/Shadow_Strike
- **Shrink Ray** (Spirit) — https://deadlock.wiki/Shrink_Ray
- **Unstable Concoction** (Spirit) — https://deadlock.wiki/Unstable_Concoction
