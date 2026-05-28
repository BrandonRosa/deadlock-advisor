# Comparison-unit cheat sheet (for Comparative raw column)

Format: write Comparative raw as `<number> (<unit hint>)`. The normalizer reads the FIRST number.

## Numeric-stat tags (write effective % or count, no decimal)
- `spirit_damage` → effective SP (flat SP + proc SP-equiv per 01) → `(SP-equiv)`
- `bullet_damage` → effective gun-dmg % → `(eff gun-dmg %)`
- `melee_damage` → effective melee dmg % → `(eff melee-dmg %)`
- `pure_damage` → effective damage → `(eff dmg)`
- `spirit_resistance` / `bullet_resistance` / `melee_resistance` → effective % → `(eff %)`
- `spirit_resist_shred` / `bullet_resist_shred` → effective % shred → `(eff shred %)`
- `fire_rate` → effective fire-rate % → `(eff %)`
- `fire_rate_slow` → slow% × uptime × targets → `(eff slow %)`
- `movement_slow` → slow% × duration × count → `(eff slow weighted)`
- `cooldown_reduction` → effective CDR % → `(eff CDR %)`
- `range_extender_dependant` / `duration_dependant` → effective % up → `(eff %)`
- `bullet_evasion` → effective % evaded → `(eff %)`
- `cc_resist` / `debuff_resistance` → effective % → `(eff %)`
- `anti_heal` → effective % heal reduction → `(eff %)`
- `magazine_size_dependant` → effective ammo% × uptime → `(eff ammo %)`
- `spirit_lifesteal` / `bullet_lifesteal` → effective % → `(eff %)`
- `disarm` → duration × count → `(s × count)`
- `silence` → abilities silenced × duration → `(weighted)`
- `stun` → effective total time stunned (seconds) → `(eff s)`
- `interrupt` → effective frequency → `(eff freq)`
- `trap_block_obstruct` → players × seconds → `(p × s)`
- `displace` → enemies × distance → `(e × m)`

## HP / total-amount tags (write total HP)
- `self_heal` → total HP healed self → `(HP total)`
- `team_heal` → total HP healed allies → `(HP total)`
- `burst_heal` → total HP within 1s → `(HP within 1s)`
- `continous_heal` → total HP outside 1s → `(HP outside 1s)`
- `high_max_hp` → HP up (effective) → `(HP)`
- `low_max_hp` → temp HP up / low-HP scaling → `(HP)`
- `shield` → total shield → `(shield HP)`
- `spirit_burst_damage` / `gun_burst_damage` → total raw damage in 1s window → `(dmg within 1s)`
- `spirit_continuous_damage` / `gun_continuous_damage` → total raw damage outside 1s → `(dmg outside 1s)`
- `spirit_burst_resistance` / `gun_burst_resistance` → effective % reduction in 1s → `(eff %)`
- `spirit_continuous_resistance` / `gun_continuous_resistance` → effective % reduction outside 1s → `(eff %)`

## Mobility (m/s or distance unit)
- `horizontal_mobility` → effective m/s → `(m/s eff)`
- `vertical_mobility` → effective traverse/dash boost (stamina count) → `(units)`

## Proc indices (decimal 0–2 per formulas in 01)
- `spirit_burst_proc` / `gun_burst_proc` → ProcImportance × (EffectDur / MaxProcWindow) → `(proc index)`
- `spirit_continuous_proc` / `gun_continuous_proc` → ProcImportance / (RefreshWindow × EffectDur) → `(proc index)`
- `spirit_proc` / `bullet_proc` → general fallback → `(proc index)`

## Dimensionless % importance tags (0–100 number, NOT 0–1 decimal)
These ALL use the SAME unit: `% importance`. Format: `30 (% importance)`. DO NOT use 0.3.
- `aerial` / `grounded`
- `close_range` / `mid_range` / `long_range`
- `aoe_cluster` / `single_target`
- `engage` / `escape`
- `assist_importance` / `counter_importance` / `ult_focused`
- `farmer`
- **`scaling_early` / `scaling_late`** — see special note below
- `self_buff` / `ally_buff`
- `damage_sponge`
- `charge_dependant`
- `large_hitbox` / `small_hitbox`
- `close_to_team` / `away_from_team`
- `single_ability_focus` / `multi_ability_focus`
- `anti_air`
- `hybrid_damage_usage`
- `high_assist_count` / `high_kill_count`
- `debuff` (severity × duration × cleanse priority — still 0–100 importance)
- `ability_spam` (also dimensionless — uses/s scaled to 0–100)
- `lane_pusher` (NOT canonical per 02 — DO NOT USE)
- `dot` (per tag_descriptions — total DoT damage; use HP-style number)
- `spawn_minions` (effective minions number, not 0–100)

## SCALING_EARLY / SCALING_LATE — narrow scope
- `scaling_early` = item that REWARDS heroes who PEAK EARLY (greedy, snowball-flavored). Examples: Cold Front (greedy spirit caster early-game burst), Mystic Burst (named early-game proc anchor), Opening Rounds, etc.
- `scaling_late` = item that REWARDS heroes who PEAK LATE (often punishes early, pays off later). Examples: Golden Goose Egg (the named anchor), Glass Cannon-flavor, big T4 stacking items.
- **NOT "cheap means scaling_early"** — most cheap T1 items should NOT carry scaling_early just because they're affordable.
- **NOT "expensive means scaling_late"** — most T4 items don't carry scaling_late either.
- Drop the row entirely if the item isn't specifically greedy-early or punish-now-pay-later.

## Category baselines (R31) — ONLY same-category
- Weapon items → `bullet_damage` baseline (T1: 5.2%, T2: 7.2%, T3: 9.6%, T4: 9.6%)
- Spirit items → `spirit_damage` baseline (T1: 4.3, T2: 5.5, T3: 8.3, T4: 8.3 — flat SP)
- Vitality items → `high_max_hp` baseline (T1: 19, T2: 22, T3: 29, T4: 29 — HP equivalent at base 500 HP)
- **Do NOT cross-baseline.** A Weapon item gets ONLY bullet_damage baseline (not high_max_hp), even if it provides bonus HP — score only the explicit HP.

## R2 fire-rate propagation (corrected)
- fire_rate lifts `gun_burst_damage` HEAVILY and `gun_continuous_damage` LIGHTLY. Reason: burst = DPS in 1s window; more shots/sec means more DPS lands within that window. Continuous is DPS over time, ammo/mag-gated, so fire_rate's effect is smaller there.
- bullet_damage lifts both gun_burst and gun_continuous about equally (per-shot amp helps both).
- spirit_damage (SP) lifts both spirit_burst and spirit_continuous about equally.
- magazine_size lifts gun_continuous (sustained fire) but NOT gun_burst (which is gated by fire rate × per-shot dmg, not mag).
