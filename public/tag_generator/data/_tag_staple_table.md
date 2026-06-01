# Tag Staple Table (Round 11+)

Per-tier sanity-check between normalize (Step 3b) and audit (Step 5). For every tag, shows:

1. **Effective Raw thresholds** — the comparative raw value an item would need at that tier to normalize to 0.5 / 1.0 / 1.5 / 2.0.
2. **Staple Items** — the actual items in that tier sitting closest to each normalized anchor, with their measured normalized value in parentheses.

If a tag's 2.0-staple item isn't the tag's named anchor (per [tag_descriptions.md](Mass Item AI Audit Skill/tag_descriptions.md)), something is off — re-check Pass 1/2 for that tag before approving the audit.

## T1

| Tag                            | Effective Raw (0.5/1.0/1.5/2.0*)                          | Staple Items (0.5/1.0/1.5/2.0*)                                       | Notes |
|--------------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------|-------|
| `ability_spam`                 | (18.8/37.5/56.2/75.0)                                     | (n/a/Extra Spirit (0.93)/n/a/n/a)                                     |       |
| `aerial`                       | (21.2/42.5/63.8/85.0)                                     | (n/a/Grit (0.94)/n/a/n/a)                                             |       |
| `ally_buff`                    | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `anti_air`                     | (18.8/37.5/56.2/75.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `anti_heal`                    | (4.67%/9.33%/14.0%/18.7%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `aoe_cluster`                  | (20.0/40.0/60.0/80.0)                                     | (Mystic Expansion (0.62)/n/a/n/a/n/a)                                 |       |
| `assist_importance`            | (21.2/42.5/63.8/85.0)                                     | (n/a/n/a/Melee Lifesteal (1.65)/n/a)                                  |       |
| `away_from_team`               | (15.0/30.0/45.0/60.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `bullet_damage`                | (8.89%/17.8%/26.7%/35.6%)                                 | (Extra Health (0.63)/n/a/Headshot Booster (1.46)/n/a)                 |       |
| `bullet_evasion`               | (7.50/15.0/22.5/30.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `bullet_lifesteal`             | (2.17%/4.33%/6.50%/8.67%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `bullet_proc`                  | (0.10/0.20/0.30/0.40)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `bullet_resist_shred`          | (2.00%/4.00%/6.00%/8.00%)                                 | (Spirit Strike (0.50)/n/a/n/a/n/a)                                    |       |
| `bullet_resistance`            | (4.33%/8.67%/13.0%/17.3%)                                 | (Sprint Boots (0.46)/n/a/n/a/n/a)                                     |       |
| `burst_heal`                   | (36.7 HP/73.3 HP/110 HP/147 HP)                           | (Extra Health (0.48)/n/a/Rebuttal (1.36)/n/a)                         |       |
| `burst_resistance`             | (12.5/25.0/37.5/50.0)                                     | (n/a/Healing Rite (1.00)/n/a/n/a)                                     |       |
| `cc_resist`                    | (4.81%/9.63%/14.4%/19.3%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `charge_dependant`             | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/Extra Spirit (1.47)/n/a)                                     |       |
| `close_range`                  | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/Active Reload (1.58)/Headshot Booster (1.89))                |       |
| `close_to_team`                | (17.5/35.0/52.5/70.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `continous_heal`               | (71.2 HP/142 HP/214 HP/285 HP)                            | (Extra Stamina (0.62)/n/a/n/a/Melee Lifesteal (2.00))                 |       |
| `cooldown_reduction`           | (3.70%/7.41%/11.1%/14.8%)                                 | (n/a/Extra Spirit (1.08)/n/a/n/a)                                     |       |
| `counter_importance`           | (25.0/50.0/75.0/100)                                      | (Healing Rite (0.50)/Spirit Strike (1.00)/Sprint Boots (1.40)/n/a)    |       |
| `damage_sponge`                | (23.8/47.5/71.2/95.0)                                     | (Rusted Barrel (0.32)/n/a/n/a/n/a)                                    |       |
| `debuff`                       | (20.0/40.0/60.0/80.0)                                     | (Spirit Strike (0.38)/n/a/n/a/n/a)                                    |       |
| `debuff_resistance`            | (4.17%/8.33%/12.5%/16.7%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `disarm`                       | (0.44/0.89/1.33/1.78)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `displace`                     | (6.25/12.5/18.8/25.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `dot`                          | (28.9 dmg/57.8 dmg/86.7 dmg/116 dmg)                      | (n/a/n/a/n/a/n/a)                                                     |       |
| `duration_dependant`           | (3.67%/7.33%/11.0%/14.7%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `engage`                       | (22.5/45.0/67.5/90.0)                                     | (Sprint Boots (0.67)/Grit (1.11)/Rebuttal (1.56)/n/a)                 |       |
| `escape`                       | (26.2/52.5/78.8/105)                                      | (Mystic Burst (0.48)/Grit (0.95)/n/a/n/a)                             |       |
| `farmer`                       | (25.0/50.0/75.0/100)                                      | (Rapid Rounds (0.50)/Extra Health (0.80)/Restorative Shot (1.60)/n/a) |       |
| `fire_rate`                    | (3.33%/6.67%/10.0%/13.3%)                                 | (n/a/n/a/Close Quarters (1.35)/n/a)                                   |       |
| `fire_rate_slow`               | (3.56%/7.11%/10.7%/14.2%)                                 | (n/a/Spirit Strike (1.12)/n/a/n/a)                                    |       |
| `grounded`                     | (12.5/25.0/37.5/50.0)                                     | (n/a/Sprint Boots (1.20)/Headshot Booster (1.60)/Rebuttal (2.00))     |       |
| `gun_burst_damage`             | (16.3 dmg/32.6 dmg/48.9 dmg/65.2 dmg)                     | (Headshot Booster (0.34)/n/a/High-Velocity Rounds (1.38)/n/a)         |       |
| `gun_burst_proc`               | (0.33/0.65/0.98/1.30)                                     | (n/a/n/a/High-Velocity Rounds (1.54)/n/a)                             |       |
| `gun_burst_resistance`         | (7.50%/15.0%/22.5%/30.0%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `gun_continuous_damage`        | (16.3 dmg/32.6 dmg/48.9 dmg/65.2 dmg)                     | (Rapid Rounds (0.37)/n/a/n/a/n/a)                                     |       |
| `gun_continuous_proc`          | (0.33/0.65/0.98/1.30)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `gun_continuous_resistance`    | (3.89%/7.78%/11.7%/15.6%)                                 | (Spirit Strike (0.64)/n/a/n/a/n/a)                                    |       |
| `headshot_damage`              | (15.0%/30.0%/45.0%/60.0%)                                 | (n/a/Monster Rounds (1.00)/n/a/High-Velocity Rounds (2.00))           |       |
| `high_assist_count`            | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `high_kill_count`              | (17.5/35.0/52.5/70.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `high_max_hp`                  | (52.5 HP/105 HP/158 HP/210 HP)                            | (Rusted Barrel (0.55)/Sprint Boots (0.90)/n/a/Extra Regen (2.00))     |       |
| `horizontal_mobility`          | (0.33 m/s/0.67 m/s/1.00 m/s/1.33 m/s)                     | (Spirit Strike (0.38)/Grit (1.05)/Melee Lifesteal (1.50)/n/a)         |       |
| `hybrid_damage_usage`          | (25.0/50.0/75.0/100)                                      | (n/a/n/a/n/a/n/a)                                                     |       |
| `interrupt`                    | (18.8/37.5/56.2/75.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `large_hitbox`                 | (15.0/30.0/45.0/60.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `long_range`                   | (22.5/45.0/67.5/90.0)                                     | (Headshot Booster (-0.56)/Monster Rounds (1.11)/n/a/n/a)              |       |
| `low_max_hp`                   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP)                         | (n/a/n/a/n/a/n/a)                                                     |       |
| `magazine_size_dependant`      | (16.7%/33.3%/50.0%/66.7%)                                 | (n/a/Rapid Rounds (0.90)/n/a/n/a)                                     |       |
| `melee_damage`                 | (5.56%/11.1%/16.7%/22.2%)                                 | (Active Reload (0.72)/Rebuttal (1.08)/n/a/n/a)                        |       |
| `melee_resistance`             | (5.75%/11.5%/17.2%/23.0%)                                 | (n/a/n/a/Headshot Booster (1.74)/Sprint Boots (2.00))                 |       |
| `mid_range`                    | (11.2/22.5/33.8/45.0)                                     | (n/a/n/a/Monster Rounds (1.33)/High-Velocity Rounds (1.78))           |       |
| `movement_slow`                | (10.0 weighted/20.0 weighted/30.0 weighted/40.0 weighted) | (n/a/n/a/n/a/n/a)                                                     |       |
| `multi_ability_focus`          | (17.5/35.0/52.5/70.0)                                     | (n/a/Mystic Expansion (1.14)/Golden Goose Egg (1.43)/n/a)             |       |
| `pure_damage`                  | (21.2/42.5/63.8/85.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `range_extender_dependant`     | (5.00%/10.0%/15.0%/20.0%)                                 | (n/a/n/a/n/a/Mystic Regeneration (2.00))                              |       |
| `scaling_early`                | (22.5/45.0/67.5/90.0)                                     | (n/a/n/a/n/a/Mystic Expansion (2.00))                                 |       |
| `scaling_late`                 | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/n/a/Mystic Burst (2.00))                                     |       |
| `self_buff`                    | (17.5/35.0/52.5/70.0)                                     | (n/a/Healing Rite (1.14)/n/a/n/a)                                     |       |
| `self_heal`                    | (50.0 HP/100 HP/150 HP/200 HP)                            | (Extra Health (0.65)/Extra Stamina (0.92)/n/a/Melee Lifesteal (2.00)) |       |
| `shield`                       | (100 HP/200 HP/300 HP/400 HP)                             | (Healing Rite (0.50)/n/a/n/a/n/a)                                     |       |
| `silence`                      | (1.11/2.22/3.33/4.44)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `single_ability_focus`         | (20.0/40.0/60.0/80.0)                                     | (Golden Goose Egg (-0.50)/n/a/n/a/Mystic Regeneration (1.88))         |       |
| `single_target`                | (16.2/32.5/48.8/65.0)                                     | (n/a/Monster Rounds (1.08)/n/a/High-Velocity Rounds (1.85))           |       |
| `small_hitbox`                 | (12.5/25.0/37.5/50.0)                                     | (n/a/Grit (1.00)/n/a/n/a)                                             |       |
| `spirit_burst_damage`          | (32.0 dmg/64.0 dmg/96.0 dmg/128 dmg)                      | (Mystic Expansion (0.63)/n/a/n/a/n/a)                                 |       |
| `spirit_burst_proc`            | (0.25/0.50/0.75/1.00)                                     | (n/a/n/a/Active Reload (1.60)/Mystic Expansion (2.00))                |       |
| `spirit_burst_resistance`      | (7.50%/15.0%/22.5%/30.0%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `spirit_continuous_damage`     | (32.0 dmg/64.0 dmg/96.0 dmg/128 dmg)                      | (n/a/n/a/n/a/n/a)                                                     |       |
| `spirit_continuous_proc`       | (0.21/0.43/0.64/0.85)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `spirit_continuous_resistance` | (3.33%/6.67%/10.0%/13.3%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `spirit_damage`                | (9.78 SP-eq/19.6 SP-eq/29.3 SP-eq/39.1 SP-eq)             | (Extra Spirit (0.43)/Active Reload (0.88)/n/a/n/a)                    |       |
| `spirit_lifesteal`             | (2.17%/4.33%/6.50%/8.67%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `spirit_resist_shred`          | (2.44%/4.89%/7.33%/9.78%)                                 | (Active Reload (0.61)/n/a/n/a/n/a)                                    |       |
| `spirit_resistance`            | (4.33%/8.67%/13.0%/17.3%)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `stun`                         | (0.11s/0.22s/0.33s/0.44s)                                 | (n/a/n/a/n/a/n/a)                                                     |       |
| `team_heal`                    | (77.8 HP/156 HP/233 HP/311 HP)                            | (Melee Lifesteal (0.64)/n/a/n/a/n/a)                                  |       |
| `trap_block_obstruct`          | (7.50/15.0/22.5/30.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `ult_focused`                  | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/n/a/n/a)                                                     |       |
| `vertical_mobility`            | (1.67 units/3.33 units/5.00 units/6.67 units)             | (Grit (0.30)/n/a/n/a/n/a)                                             |       |

## T2

| Tag                            | Effective Raw (0.5/1.0/1.5/2.0*)                          | Staple Items (0.5/1.0/1.5/2.0*)                                                           | Notes |
|--------------------------------|-----------------------------------------------------------|-------------------------------------------------------------------------------------------|-------|
| `ability_spam`                 | (18.8/37.5/56.2/75.0)                                     | (n/a/Slowing Bullets (1.07)/n/a/n/a)                                                      |       |
| `aerial`                       | (21.2/42.5/63.8/85.0)                                     | (n/a/Long Range (0.94)/n/a/n/a)                                                           |       |
| `ally_buff`                    | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `anti_air`                     | (18.8/37.5/56.2/75.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `anti_heal`                    | (7.00%/14.0%/21.0%/28.0%)                                 | (n/a/n/a/n/a/Healing Booster (2.00))                                                      |       |
| `aoe_cluster`                  | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/Stalker (1.62)/n/a)                                                              |       |
| `assist_importance`            | (21.2/42.5/63.8/85.0)                                     | (Healing Booster (0.59)/Reactive Barrier (1.18)/Return Fire (1.29)/Healbane (1.76))       |       |
| `away_from_team`               | (15.0/30.0/45.0/60.0)                                     | (n/a/n/a/n/a/Swift Striker (2.00))                                                        |       |
| `bullet_damage`                | (13.3%/26.7%/40.0%/53.3%)                                 | (Intensifying Magazine (0.49)/Weakening Headshot (1.06)/Kinetic Dash (1.68)/n/a)          |       |
| `bullet_evasion`               | (7.50/15.0/22.5/30.0)                                     | (Opening Rounds (-0.67)/n/a/n/a/n/a)                                                      |       |
| `bullet_lifesteal`             | (3.25%/6.50%/9.75%/13.0%)                                 | (Reactive Barrier (0.31)/Fleetfoot (1.23)/n/a/Debuff Reducer (2.00))                      |       |
| `bullet_proc`                  | (0.10/0.20/0.30/0.40)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `bullet_resist_shred`          | (3.00%/6.00%/9.00%/12.0%)                                 | (n/a/Swift Striker (0.83)/Battle Vest (1.50)/n/a)                                         |       |
| `bullet_resistance`            | (6.50%/13.0%/19.5%/26.0%)                                 | (Intensifying Magazine (0.46)/Alchemical Fire (1.08)/Bullet Lifesteal (1.38)/n/a)         |       |
| `burst_heal`                   | (55.0 HP/110 HP/165 HP/220 HP)                            | (Healing Booster (0.73)/n/a/n/a/Return Fire (2.00))                                       |       |
| `burst_resistance`             | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/Restorative Locket (1.40)/n/a)                                                   |       |
| `cc_resist`                    | (7.22%/14.4%/21.7%/28.9%)                                 | (n/a/Intensifying Magazine (0.90)/Guardian Ward (1.73)/n/a)                               |       |
| `charge_dependant`             | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/Slowing Bullets (1.47)/n/a)                                                      |       |
| `close_range`                  | (23.8/47.5/71.2/95.0)                                     | (Melee Charge (-0.63)/n/a/Swift Striker (1.68)/Mystic Shot (1.79))                        |       |
| `close_to_team`                | (17.5/35.0/52.5/70.0)                                     | (n/a/Healbane (0.86)/n/a/n/a)                                                             |       |
| `continous_heal`               | (107 HP/214 HP/321 HP/428 HP)                             | (Reactive Barrier (0.40)/n/a/n/a/n/a)                                                     |       |
| `cooldown_reduction`           | (5.56%/11.1%/16.7%/22.2%)                                 | (Enduring Speed (0.45)/Slowing Bullets (1.08)/Duration Extender (1.62)/n/a)               |       |
| `counter_importance`           | (25.0/50.0/75.0/100)                                      | (Swift Striker (0.70)/Return Fire (1.00)/Healing Booster (1.50)/n/a)                      |       |
| `damage_sponge`                | (23.8/47.5/71.2/95.0)                                     | (Bullet Lifesteal (0.37)/Weapon Shielding (1.16)/Spirit Lifesteal (1.26)/n/a)             |       |
| `debuff`                       | (20.0/40.0/60.0/80.0)                                     | (Split Shot (0.50)/n/a/n/a/n/a)                                                           |       |
| `debuff_resistance`            | (6.25%/12.5%/18.7%/25.0%)                                 | (n/a/n/a/n/a/Enchanters Emblem (2.00))                                                    |       |
| `disarm`                       | (0.67/1.33/2.00/2.67)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `displace`                     | (6.25/12.5/18.8/25.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `dot`                          | (43.3 dmg/86.7 dmg/130 dmg/173 dmg)                       | (Swift Striker (0.69)/n/a/n/a/n/a)                                                        |       |
| `duration_dependant`           | (5.50%/11.0%/16.5%/22.0%)                                 | (Bullet Resist Shredder (0.73)/n/a/n/a/Improved Spirit (2.00))                            |       |
| `engage`                       | (22.5/45.0/67.5/90.0)                                     | (n/a/Intensifying Magazine (0.78)/Mystic Shot (1.44)/n/a)                                 |       |
| `escape`                       | (26.2/52.5/78.8/105)                                      | (n/a/Intensifying Magazine (1.05)/n/a/n/a)                                                |       |
| `farmer`                       | (25.0/50.0/75.0/100)                                      | (Intensifying Magazine (0.50)/Stalker (0.80)/Weakening Headshot (1.30)/n/a)               |       |
| `fire_rate`                    | (5.00%/10.0%/15.0%/20.0%)                                 | (Slowing Hex (0.50)/Fleetfoot (1.20)/n/a/Weakening Headshot (2.00))                       |       |
| `fire_rate_slow`               | (5.33%/10.7%/16.0%/21.3%)                                 | (n/a/n/a/n/a/Alchemical Fire (1.88))                                                      |       |
| `grounded`                     | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/n/a/Mystic Shot (2.00))                                                          |       |
| `gun_burst_damage`             | (24.4 dmg/48.9 dmg/73.3 dmg/97.8 dmg)                     | (Recharging Rush (0.51)/n/a/n/a/n/a)                                                      |       |
| `gun_burst_proc`               | (0.33/0.65/0.98/1.30)                                     | (Split Shot (0.62)/Battle Vest (1.08)/n/a/n/a)                                            |       |
| `gun_burst_resistance`         | (11.2%/22.5%/33.8%/45.0%)                                 | (n/a/n/a/n/a/Arcane Surge (2.00))                                                         |       |
| `gun_continuous_damage`        | (24.4 dmg/48.9 dmg/73.3 dmg/97.8 dmg)                     | (Kinetic Dash (0.61)/Weakening Headshot (0.78)/n/a/n/a)                                   |       |
| `gun_continuous_proc`          | (0.33/0.65/0.98/1.30)                                     | (Split Shot (0.54)/Spirit Shredder Bullets (0.77)/n/a/n/a)                                |       |
| `gun_continuous_resistance`    | (5.83%/11.7%/17.5%/23.3%)                                 | (n/a/Alchemical Fire (1.03)/Arcane Surge (1.71)/n/a)                                      |       |
| `headshot_damage`              | (22.5%/45.0%/67.5%/90.0%)                                 | (Recharging Rush (0.56)/n/a/n/a/n/a)                                                      |       |
| `high_assist_count`            | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `high_kill_count`              | (17.5/35.0/52.5/70.0)                                     | (n/a/Healing Booster (1.00)/n/a/n/a)                                                      |       |
| `high_max_hp`                  | (78.8 HP/158 HP/236 HP/315 HP)                            | (Battle Vest (0.38)/Debuff Reducer (0.77)/n/a/n/a)                                        |       |
| `horizontal_mobility`          | (0.50 m/s/1.00 m/s/1.50 m/s/2.00 m/s)                     | (Fleetfoot (0.40)/Healbane (1.00)/n/a/Guardian Ward (2.00))                               |       |
| `hybrid_damage_usage`          | (25.0/50.0/75.0/100)                                      | (n/a/Slowing Bullets (1.00)/n/a/Opening Rounds (1.80))                                    |       |
| `interrupt`                    | (18.8/37.5/56.2/75.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `large_hitbox`                 | (15.0/30.0/45.0/60.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `long_range`                   | (22.5/45.0/67.5/90.0)                                     | (Spirit Sap (0.44)/Mystic Shot (-0.89)/Melee Charge (1.56)/n/a)                           |       |
| `low_max_hp`                   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP)                         | (n/a/n/a/n/a/n/a)                                                                         |       |
| `magazine_size_dependant`      | (25.0%/50.0%/75.0%/100%)                                  | (Kinetic Dash (0.40)/n/a/n/a/Weakening Headshot (2.00))                                   |       |
| `melee_damage`                 | (8.33%/16.7%/25.0%/33.3%)                                 | (n/a/n/a/n/a/Mystic Shot (1.92))                                                          |       |
| `melee_resistance`             | (8.62%/17.2%/25.9%/34.5%)                                 | (Bullet Lifesteal (0.52)/n/a/n/a/n/a)                                                     |       |
| `mid_range`                    | (11.2/22.5/33.8/45.0)                                     | (n/a/Suppressor (0.89)/Spirit Sap (1.56)/n/a)                                             |       |
| `movement_slow`                | (15.0 weighted/30.0 weighted/45.0 weighted/60.0 weighted) | (Mystic Vulnerability (0.60)/Spirit Shredder Bullets (0.90)/n/a/Compress Cooldown (2.00)) |       |
| `multi_ability_focus`          | (17.5/35.0/52.5/70.0)                                     | (Opening Rounds (0.71)/n/a/Enduring Speed (1.43)/n/a)                                     |       |
| `pure_damage`                  | (21.2/42.5/63.8/85.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `range_extender_dependant`     | (7.50%/15.0%/22.5%/30.0%)                                 | (Healbane (0.53)/n/a/n/a/n/a)                                                             |       |
| `scaling_early`                | (22.5/45.0/67.5/90.0)                                     | (n/a/n/a/Recharging Rush (1.56)/n/a)                                                      |       |
| `scaling_late`                 | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `self_buff`                    | (17.5/35.0/52.5/70.0)                                     | (n/a/n/a/Bullet Resist Shredder (1.57)/n/a)                                               |       |
| `self_heal`                    | (75.0 HP/150 HP/225 HP/300 HP)                            | (Debuff Reducer (0.53)/n/a/Return Fire (1.47)/n/a)                                        |       |
| `shield`                       | (150 HP/300 HP/450 HP/600 HP)                             | (Restorative Locket (0.67)/n/a/n/a/Weapon Shielding (2.00))                               |       |
| `silence`                      | (1.67/3.33/5.00/6.67)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `single_ability_focus`         | (20.0/40.0/60.0/80.0)                                     | (Duration Extender (-0.50)/n/a/n/a/n/a)                                                   |       |
| `single_target`                | (16.2/32.5/48.8/65.0)                                     | (n/a/Melee Charge (1.08)/Swift Striker (1.69)/Spirit Sap (2.00))                          |       |
| `small_hitbox`                 | (12.5/25.0/37.5/50.0)                                     | (n/a/Swift Striker (1.00)/n/a/n/a)                                                        |       |
| `spirit_burst_damage`          | (48.0 dmg/96.0 dmg/144 dmg/192 dmg)                       | (Slowing Hex (0.49)/Compress Cooldown (1.08)/n/a/Opening Rounds (2.00))                   |       |
| `spirit_burst_proc`            | (0.25/0.50/0.75/1.00)                                     | (n/a/Mystic Vulnerability (1.00)/Opening Rounds (1.60)/Compress Cooldown (2.00))          |       |
| `spirit_burst_resistance`      | (11.2%/22.5%/33.8%/45.0%)                                 | (n/a/n/a/n/a/Weapon Shielding (2.00))                                                     |       |
| `spirit_continuous_damage`     | (48.0 dmg/96.0 dmg/144 dmg/192 dmg)                       | (Swift Striker (0.63)/n/a/n/a/Opening Rounds (2.00))                                      |       |
| `spirit_continuous_proc`       | (0.21/0.43/0.64/0.85)                                     | (Swift Striker (0.71)/Mystic Vulnerability (0.94)/n/a/n/a)                                |       |
| `spirit_continuous_resistance` | (5.00%/10.0%/15.0%/20.0%)                                 | (n/a/n/a/n/a/Weapon Shielding (2.00))                                                     |       |
| `spirit_damage`                | (14.7 SP-eq/29.3 SP-eq/44.0 SP-eq/58.7 SP-eq)             | (Enduring Speed (0.51)/Compress Cooldown (1.05)/n/a/n/a)                                  |       |
| `spirit_lifesteal`             | (3.25%/6.50%/9.75%/13.0%)                                 | (Reactive Barrier (0.31)/Split Shot (0.92)/n/a/Spirit Shielding (2.00))                   |       |
| `spirit_resist_shred`          | (3.67%/7.33%/11.0%/14.7%)                                 | (Suppressor (0.55)/Split Shot (0.82)/n/a/n/a)                                             |       |
| `spirit_resistance`            | (6.50%/13.0%/19.5%/26.0%)                                 | (Restorative Locket (0.46)/Weapon Shielding (1.15)/Enduring Speed (1.38)/n/a)             |       |
| `stun`                         | (0.17s/0.33s/0.50s/0.67s)                                 | (n/a/n/a/Mystic Shot (1.50)/n/a)                                                          |       |
| `team_heal`                    | (117 HP/233 HP/350 HP/467 HP)                             | (Return Fire (0.47)/n/a/n/a/n/a)                                                          |       |
| `trap_block_obstruct`          | (7.50/15.0/22.5/30.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `ult_focused`                  | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/n/a/n/a)                                                                         |       |
| `vertical_mobility`            | (2.50 units/5.00 units/7.50 units/10.0 units)             | (n/a/Mystic Vulnerability (1.00)/n/a/Spirit Shredder Bullets (2.00))                      |       |

## T3

| Tag                            | Effective Raw (0.5/1.0/1.5/2.0*)                          | Staple Items (0.5/1.0/1.5/2.0*)                                                                    | Notes |
|--------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------|-------|
| `ability_spam`                 | (18.8/37.5/56.2/75.0)                                     | (n/a/Rapid Recharge (0.93)/Superior Duration (1.33)/Silence Wave (1.87))                           |       |
| `aerial`                       | (21.2/42.5/63.8/85.0)                                     | (Sharpshooter (0.41)/n/a/Metal Skin (1.65)/n/a)                                                    |       |
| `ally_buff`                    | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/Point Blank (1.50)/Hollow Point (2.00))                                                   |       |
| `anti_air`                     | (18.8/37.5/56.2/75.0)                                     | (n/a/n/a/n/a/Radiant Regeneration (2.00))                                                          |       |
| `anti_heal`                    | (10.5%/21.0%/31.5%/42.0%)                                 | (n/a/Weighted Shots (1.24)/n/a/Disarming Hex (1.90))                                               |       |
| `aoe_cluster`                  | (20.0/40.0/60.0/80.0)                                     | (n/a/n/a/Armor Piercing Rounds (1.50)/Ballistic Enchantment (1.75))                                |       |
| `assist_importance`            | (21.2/42.5/63.8/85.0)                                     | (n/a/n/a/Hollow Point (1.41)/Spirit Resilience (2.00))                                             |       |
| `away_from_team`               | (15.0/30.0/45.0/60.0)                                     | (n/a/n/a/Warp Stone (1.67)/n/a)                                                                    |       |
| `bullet_damage`                | (20.0%/40.0%/60.0%/80.0%)                                 | (Heroic Aura (0.37)/Escalating Resilience (1.07)/Shadow Weave (1.55)/Spirit Rend (1.80))           |       |
| `bullet_evasion`               | (7.50/15.0/22.5/30.0)                                     | (n/a/n/a/Warp Stone (1.67)/n/a)                                                                    |       |
| `bullet_lifesteal`             | (4.88%/9.75%/14.6%/19.5%)                                 | (Heroic Aura (0.62)/n/a/Healing Nova (1.44)/n/a)                                                   |       |
| `bullet_proc`                  | (0.10/0.20/0.30/0.40)                                     | (n/a/n/a/n/a/Weighted Shots (2.00))                                                                |       |
| `bullet_resist_shred`          | (4.50%/9.00%/13.5%/18.0%)                                 | (Ballistic Enchantment (0.56)/Hunters Aura (0.78)/n/a/Point Blank (2.00))                          |       |
| `bullet_resistance`            | (9.75%/19.5%/29.2%/39.0%)                                 | (Point Blank (0.51)/Express Shot (1.13)/n/a/Counterspell (2.00))                                   |       |
| `burst_heal`                   | (82.5 HP/165 HP/247 HP/330 HP)                            | (Spirit Resilience (0.48)/Lifestrike (0.97)/n/a/n/a)                                               |       |
| `burst_resistance`             | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/Metal Skin (1.40)/Rescue Beam (2.00))                                                     |       |
| `cc_resist`                    | (10.8%/21.7%/32.5%/43.3%)                                 | (Metal Skin (0.55)/n/a/Burst Fire (1.48)/n/a)                                                      |       |
| `charge_dependant`             | (23.8/47.5/71.2/95.0)                                     | (n/a/Armor Piercing Rounds (1.05)/n/a/Silence Wave (2.00))                                         |       |
| `close_range`                  | (23.8/47.5/71.2/95.0)                                     | (n/a/Armor Piercing Rounds (1.05)/Superior Cooldown (1.68)/Majestic Leap (2.00))                   |       |
| `close_to_team`                | (17.5/35.0/52.5/70.0)                                     | (n/a/Point Blank (1.00)/Spirit Resilience (1.43)/Hollow Point (2.00))                              |       |
| `continous_heal`               | (160 HP/321 HP/481 HP/641 HP)                             | (Lifestrike (0.51)/n/a/n/a/n/a)                                                                    |       |
| `cooldown_reduction`           | (8.33%/16.7%/25.0%/33.3%)                                 | (n/a/Superior Duration (1.20)/Silence Wave (1.50)/n/a)                                             |       |
| `counter_importance`           | (25.0/50.0/75.0/100)                                      | (Sharpshooter (0.60)/Ballistic Enchantment (0.90)/Fortitude (1.50)/Weighted Shots (2.00))          |       |
| `damage_sponge`                | (23.8/47.5/71.2/95.0)                                     | (Burst Fire (0.42)/n/a/n/a/Blood Tribute (2.00))                                                   |       |
| `debuff`                       | (20.0/40.0/60.0/80.0)                                     | (n/a/Weighted Shots (1.00)/Disarming Hex (1.75)/Disarming Hex (1.75))                              |       |
| `debuff_resistance`            | (9.38%/18.8%/28.1%/37.5%)                                 | (n/a/Bullet Resilience (1.17)/Burst Fire (1.71)/Fortitude (1.87))                                  |       |
| `disarm`                       | (1.00/2.00/3.00/4.00)                                     | (n/a/n/a/n/a/Greater Expansion (2.00))                                                             |       |
| `displace`                     | (6.25/12.5/18.8/25.0)                                     | (Radiant Regeneration (0.64)/n/a/n/a/n/a)                                                          |       |
| `dot`                          | (65.0 dmg/130 dmg/195 dmg/260 dmg)                        | (Weighted Shots (0.62)/n/a/Ballistic Enchantment (1.69)/Disarming Hex (2.00))                      |       |
| `duration_dependant`           | (8.25%/16.5%/24.8%/33.0%)                                 | (n/a/n/a/Surge of Power (1.70)/n/a)                                                                |       |
| `engage`                       | (22.5/45.0/67.5/90.0)                                     | (n/a/Hollow Point (1.11)/Shadow Weave (1.56)/Sharpshooter (1.89))                                  |       |
| `escape`                       | (26.2/52.5/78.8/105)                                      | (n/a/Sharpshooter (1.05)/Warp Stone (1.52)/Veil Walker (2.00))                                     |       |
| `farmer`                       | (25.0/50.0/75.0/100)                                      | (Spirit Resilience (0.40)/Sharpshooter (1.00)/Veil Walker (1.70)/Escalating Resilience (2.00))     |       |
| `fire_rate`                    | (7.50%/15.0%/22.5%/30.0%)                                 | (Armor Piercing Rounds (0.53)/Hollow Point (0.87)/Burst Fire (1.67)/n/a)                           |       |
| `fire_rate_slow`               | (8.00%/16.0%/24.0%/32.0%)                                 | (n/a/n/a/Point Blank (1.56)/n/a)                                                                   |       |
| `grounded`                     | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/Bullet Resilience (1.40)/Shadow Weave (2.00))                                             |       |
| `gun_burst_damage`             | (36.7 dmg/73.3 dmg/110 dmg/147 dmg)                       | (Spirit Rend (0.48)/Sharpshooter (0.95)/Headhunter (1.50)/n/a)                                     |       |
| `gun_burst_proc`               | (0.33/0.65/0.98/1.30)                                     | (Express Shot (0.46)/n/a/Heroic Aura (1.54)/Weighted Shots (2.00))                                 |       |
| `gun_burst_resistance`         | (16.9%/33.8%/50.6%/67.5%)                                 | (Counterspell (0.44)/n/a/n/a/Rescue Beam (1.78))                                                   |       |
| `gun_continuous_damage`        | (36.7 dmg/73.3 dmg/110 dmg/147 dmg)                       | (Spirit Rend (0.48)/Weighted Shots (0.82)/n/a/n/a)                                                 |       |
| `gun_continuous_proc`          | (0.33/0.65/0.98/1.30)                                     | (Hunters Aura (0.62)/Blood Tribute (0.77)/n/a/Weighted Shots (2.00))                               |       |
| `gun_continuous_resistance`    | (8.75%/17.5%/26.2%/35.0%)                                 | (Point Blank (0.57)/n/a/Counterspell (1.43)/Rescue Beam (2.00))                                    |       |
| `headshot_damage`              | (33.8%/67.5%/101%/135%)                                   | (Headhunter (0.59)/Spirit Rend (0.81)/Heroic Aura (1.26)/n/a)                                      |       |
| `high_assist_count`            | (12.5/25.0/37.5/50.0)                                     | (n/a/n/a/n/a/Hollow Point (2.00))                                                                  |       |
| `high_kill_count`              | (17.5/35.0/52.5/70.0)                                     | (n/a/Escalating Resilience (0.86)/n/a/n/a)                                                         |       |
| `high_max_hp`                  | (118 HP/236 HP/354 HP/472 HP)                             | (Hunters Aura (0.53)/n/a/Fury Trance (1.71)/n/a)                                                   |       |
| `horizontal_mobility`          | (0.75 m/s/1.50 m/s/2.25 m/s/3.00 m/s)                     | (Hollow Point (0.67)/Decay (1.00)/Veil Walker (1.60)/Sharpshooter (2.00))                          |       |
| `hybrid_damage_usage`          | (25.0/50.0/75.0/100)                                      | (n/a/Armor Piercing Rounds (1.10)/n/a/Weighted Shots (2.00))                                       |       |
| `interrupt`                    | (18.8/37.5/56.2/75.0)                                     | (Metal Skin (0.27)/n/a/Radiant Regeneration (1.60)/n/a)                                            |       |
| `large_hitbox`                 | (15.0/30.0/45.0/60.0)                                     | (Fury Trance (0.42)/n/a/n/a/n/a)                                                                   |       |
| `long_range`                   | (22.5/45.0/67.5/90.0)                                     | (Disarming Hex (0.49)/Majestic Leap (-1.00)/Radiant Regeneration (1.33)/Spirit Rend (2.00))        |       |
| `low_max_hp`                   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP)                         | (Burst Fire (-0.59)/Blood Tribute (1.06)/n/a/n/a)                                                  |       |
| `magazine_size_dependant`      | (37.5%/75.0%/112%/150%)                                   | (Express Shot (0.47)/n/a/n/a/n/a)                                                                  |       |
| `melee_damage`                 | (12.5%/25.0%/37.5%/50.0%)                                 | (Superior Cooldown (0.60)/Majestic Leap (0.88)/n/a/Shadow Weave (2.00))                            |       |
| `melee_resistance`             | (12.9%/25.9%/38.8%/51.8%)                                 | (Express Shot (0.43)/Shadow Weave (1.16)/n/a/n/a)                                                  |       |
| `mid_range`                    | (11.2/22.5/33.8/45.0)                                     | (n/a/Greater Expansion (1.11)/Disarming Hex (1.56)/n/a)                                            |       |
| `movement_slow`                | (22.5 weighted/45.0 weighted/67.5 weighted/90.0 weighted) | (Shadow Weave (0.56)/n/a/Majestic Leap (1.33)/n/a)                                                 |       |
| `multi_ability_focus`          | (17.5/35.0/52.5/70.0)                                     | (Silence Wave (0.71)/n/a/Knockdown (1.71)/n/a)                                                     |       |
| `pure_damage`                  | (21.2/42.5/63.8/85.0)                                     | (Disarming Hex (0.71)/n/a/n/a/Armor Piercing Rounds (1.88))                                        |       |
| `range_extender_dependant`     | (11.2%/22.5%/33.8%/45.0%)                                 | (Escalating Resilience (0.44)/Berserker (0.98)/Knockdown (1.33)/n/a)                               |       |
| `scaling_early`                | (22.5/45.0/67.5/90.0)                                     | (n/a/n/a/n/a/n/a)                                                                                  |       |
| `scaling_late`                 | (20.0/40.0/60.0/80.0)                                     | (n/a/Berserker (0.88)/Veil Walker (1.62)/Escalating Resilience (2.00))                             |       |
| `self_buff`                    | (17.5/35.0/52.5/70.0)                                     | (n/a/Superior Cooldown (1.00)/Armor Piercing Rounds (1.43)/Sharpshooter (2.00))                    |       |
| `self_heal`                    | (113 HP/225 HP/338 HP/450 HP)                             | (Fortitude (0.49)/Majestic Leap (0.76)/Lifestrike (1.44)/n/a)                                      |       |
| `shield`                       | (225 HP/450 HP/675 HP/900 HP)                             | (n/a/n/a/Metal Skin (1.56)/n/a)                                                                    |       |
| `silence`                      | (2.50/5.00/7.50/10.0)                                     | (n/a/Spirit Snatch (1.20)/n/a/n/a)                                                                 |       |
| `single_ability_focus`         | (20.0/40.0/60.0/80.0)                                     | (Knockdown (-0.50)/n/a/Silence Wave (1.50)/Berserker (2.00))                                       |       |
| `single_target`                | (16.2/32.5/48.8/65.0)                                     | (n/a/Escalating Resilience (0.77)/Sharpshooter (1.54)/Heroic Aura (2.00))                          |       |
| `small_hitbox`                 | (12.5/25.0/37.5/50.0)                                     | (n/a/Veil Walker (1.20)/n/a/Warp Stone (2.00))                                                     |       |
| `spirit_burst_damage`          | (72.0 dmg/144 dmg/216 dmg/288 dmg)                        | (Superior Cooldown (0.47)/Armor Piercing Rounds (1.14)/n/a/n/a)                                    |       |
| `spirit_burst_proc`            | (0.25/0.50/0.75/1.00)                                     | (n/a/Armor Piercing Rounds (1.00)/n/a/Spirit Snatch (1.80))                                        |       |
| `spirit_burst_resistance`      | (16.9%/33.8%/50.6%/67.5%)                                 | (Stamina Mastery (0.44)/n/a/n/a/Dispel Magic (1.78))                                               |       |
| `spirit_continuous_damage`     | (72.0 dmg/144 dmg/216 dmg/288 dmg)                        | (Weighted Shots (0.49)/Armor Piercing Rounds (1.00)/Ballistic Enchantment (1.36)/n/a)              |       |
| `spirit_continuous_proc`       | (0.21/0.43/0.64/0.85)                                     | (n/a/Disarming Hex (0.94)/n/a/Armor Piercing Rounds (2.00))                                        |       |
| `spirit_continuous_resistance` | (7.50%/15.0%/22.5%/30.0%)                                 | (n/a/n/a/n/a/Stamina Mastery (2.00))                                                               |       |
| `spirit_damage`                | (22.0 SP-eq/44.0 SP-eq/66.0 SP-eq/88.0 SP-eq)             | (Weighted Shots (0.48)/Superior Cooldown (0.88)/Disarming Hex (1.36)/Armor Piercing Rounds (2.00)) |       |
| `spirit_lifesteal`             | (4.88%/9.75%/14.6%/19.5%)                                 | (Weighted Shots (0.72)/n/a/n/a/n/a)                                                                |       |
| `spirit_resist_shred`          | (5.50%/11.0%/16.5%/22.0%)                                 | (Superior Cooldown (0.55)/n/a/n/a/Weighted Shots (2.00))                                           |       |
| `spirit_resistance`            | (9.75%/19.5%/29.2%/39.0%)                                 | (Fortitude (0.51)/n/a/n/a/Stamina Mastery (2.00))                                                  |       |
| `stun`                         | (0.25s/0.50s/0.75s/1.00s)                                 | (n/a/n/a/n/a/Radiant Regeneration (2.00))                                                          |       |
| `team_heal`                    | (175 HP/350 HP/525 HP/700 HP)                             | (Spirit Resilience (0.71)/n/a/n/a/Lifestrike (2.00))                                               |       |
| `trap_block_obstruct`          | (7.50/15.0/22.5/30.0)                                     | (n/a/n/a/n/a/n/a)                                                                                  |       |
| `ult_focused`                  | (23.8/47.5/71.2/95.0)                                     | (n/a/n/a/n/a/n/a)                                                                                  |       |
| `vertical_mobility`            | (3.75 units/7.50 units/11.2 units/15.0 units)             | (Metal Skin (0.27)/n/a/n/a/n/a)                                                                    |       |

## T4

| Tag                            | Effective Raw (0.5/1.0/1.5/2.0*)                        | Staple Items (0.5/1.0/1.5/2.0*)                                                 | Notes |
|--------------------------------|---------------------------------------------------------|---------------------------------------------------------------------------------|-------|
| `ability_spam`                 | (18.8/37.5/56.2/75.0)                                   | (n/a/Ethereal Shift (1.07)/Spiritual Overflow (1.60)/Scourge (2.00))            |       |
| `aerial`                       | (21.2/42.5/63.8/85.0)                                   | (n/a/Focus Lens (0.94)/n/a/Mercurial Magnum (2.00))                             |       |
| `ally_buff`                    | (20.0/40.0/60.0/80.0)                                   | (n/a/n/a/Spirit Burn (1.50)/Diviners Kevlar (1.75))                             |       |
| `anti_air`                     | (18.8/37.5/56.2/75.0)                                   | (n/a/n/a/Plated Armor (1.73)/n/a)                                               |       |
| `anti_heal`                    | (15.8%/31.5%/47.2%/63.0%)                               | (n/a/Juggernaut (0.89)/Vortex Web (1.59)/n/a)                                   |       |
| `aoe_cluster`                  | (20.0/40.0/60.0/80.0)                                   | (n/a/n/a/Crippling Headshot (1.62)/Haunting Shot (2.00))                        |       |
| `assist_importance`            | (21.2/42.5/63.8/85.0)                                   | (n/a/n/a/Indomitable (1.65)/Diviners Kevlar (1.88))                             |       |
| `away_from_team`               | (15.0/30.0/45.0/60.0)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `bullet_damage`                | (30.0%/60.0%/90.0%/120%)                                | (Mystic Reverb (0.50)/n/a/n/a/Lucky Shot (2.00))                                |       |
| `bullet_evasion`               | (7.50/15.0/22.5/30.0)                                   | (n/a/n/a/n/a/Siphon Bullets (2.00))                                             |       |
| `bullet_lifesteal`             | (7.31%/14.6%/21.9%/29.2%)                               | (n/a/n/a/Phantom Strike (1.71)/n/a)                                             |       |
| `bullet_proc`                  | (0.10/0.20/0.30/0.40)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `bullet_resist_shred`          | (6.75%/13.5%/20.2%/27.0%)                               | (Frenzy (0.52)/Crushing Fists (0.81)/Capacitor (1.41)/n/a)                      |       |
| `bullet_resistance`            | (14.6%/29.2%/43.9%/58.5%)                               | (Colossus (0.51)/n/a/n/a/n/a)                                                   |       |
| `burst_heal`                   | (124 HP/247 HP/371 HP/495 HP)                           | (n/a/n/a/n/a/n/a)                                                               |       |
| `burst_resistance`             | (12.5/25.0/37.5/50.0)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `cc_resist`                    | (16.2%/32.5%/48.8%/65.0%)                               | (Colossus (0.37)/Mercurial Magnum (0.92)/Vampiric Burst (1.54)/Infuser (2.00))  |       |
| `charge_dependant`             | (23.8/47.5/71.2/95.0)                                   | (n/a/n/a/Mystic Reverb (1.68)/n/a)                                              |       |
| `close_range`                  | (23.8/47.5/71.2/95.0)                                   | (n/a/n/a/n/a/Frenzy (2.00))                                                     |       |
| `close_to_team`                | (17.5/35.0/52.5/70.0)                                   | (n/a/Divine Barrier (1.14)/n/a/n/a)                                             |       |
| `continous_heal`               | (240 HP/481 HP/721 HP/962 HP)                           | (Leech (0.50)/n/a/n/a/n/a)                                                      |       |
| `cooldown_reduction`           | (12.5%/25.0%/37.5%/50.0%)                               | (Infuser (0.32)/n/a/Scourge (1.40)/Vortex Web (2.00))                           |       |
| `counter_importance`           | (25.0/50.0/75.0/100)                                    | (Silencer (0.60)/Crippling Headshot (1.00)/Juggernaut (1.50)/Echo Shard (1.90)) |       |
| `damage_sponge`                | (23.8/47.5/71.2/95.0)                                   | (Lucky Shot (-0.63)/Glass Cannon (1.05)/Colossus (1.47)/Divine Barrier (2.00))  |       |
| `debuff`                       | (20.0/40.0/60.0/80.0)                                   | (n/a/Spellslinger (0.88)/Lightning Scroll (1.50)/Echo Shard (2.00))             |       |
| `debuff_resistance`            | (14.1%/28.1%/42.2%/56.2%)                               | (Spirit Burn (0.60)/Glass Cannon (0.89)/n/a/n/a)                                |       |
| `disarm`                       | (1.50/3.00/4.50/6.00)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `displace`                     | (6.25/12.5/18.8/25.0)                                   | (n/a/n/a/n/a/Haunting Shot (2.00))                                              |       |
| `dot`                          | (97.5 dmg/195 dmg/292 dmg/390 dmg)                      | (Spirit Burn (0.46)/Vortex Web (1.03)/n/a/n/a)                                  |       |
| `duration_dependant`           | (12.4%/24.8%/37.1%/49.5%)                               | (Cheat Death (0.61)/n/a/n/a/n/a)                                                |       |
| `engage`                       | (22.5/45.0/67.5/90.0)                                   | (n/a/Glass Cannon (1.00)/Vampiric Burst (1.56)/Plated Armor (2.00))             |       |
| `escape`                       | (26.2/52.5/78.8/105)                                    | (n/a/Diviners Kevlar (0.95)/n/a/Focus Lens (1.81))                              |       |
| `farmer`                       | (25.0/50.0/75.0/100)                                    | (Leech (0.60)/Vortex Web (1.00)/n/a/n/a)                                        |       |
| `fire_rate`                    | (11.2%/22.5%/33.8%/45.0%)                               | (Mystic Reverb (0.49)/Indomitable (0.93)/n/a/Spiritual Overflow (1.96))         |       |
| `fire_rate_slow`               | (12.0%/24.0%/36.0%/48.0%)                               | (n/a/n/a/n/a/Leech (2.00))                                                      |       |
| `grounded`                     | (12.5/25.0/37.5/50.0)                                   | (n/a/n/a/Plated Armor (1.40)/Frenzy (2.00))                                     |       |
| `gun_burst_damage`             | (55.0 dmg/110 dmg/165 dmg/220 dmg)                      | (Capacitor (0.59)/Ricochet (1.00)/Spiritual Overflow (1.45)/Lucky Shot (2.00))  |       |
| `gun_burst_proc`               | (0.33/0.65/0.98/1.30)                                   | (Mystic Reverb (0.54)/n/a/n/a/n/a)                                              |       |
| `gun_burst_resistance`         | (25.3%/50.6%/75.9%/101%)                                | (Siphon Bullets (0.36)/n/a/n/a/n/a)                                             |       |
| `gun_continuous_damage`        | (55.0 dmg/110 dmg/165 dmg/220 dmg)                      | (Mystic Reverb (0.55)/Lucky Shot (1.00)/n/a/Capacitor (2.00))                   |       |
| `gun_continuous_proc`          | (0.33/0.65/0.98/1.30)                                   | (Spellbreaker (0.46)/Capacitor (0.85)/n/a/n/a)                                  |       |
| `gun_continuous_resistance`    | (13.1%/26.2%/39.4%/52.5%)                               | (Siphon Bullets (0.69)/n/a/n/a/n/a)                                             |       |
| `headshot_damage`              | (50.6%/101%/152%/202%)                                  | (Crushing Fists (0.74)/n/a/n/a/n/a)                                             |       |
| `high_assist_count`            | (12.5/25.0/37.5/50.0)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `high_kill_count`              | (17.5/35.0/52.5/70.0)                                   | (n/a/n/a/n/a/Lucky Shot (2.00))                                                 |       |
| `high_max_hp`                  | (177 HP/354 HP/532 HP/709 HP)                           | (Juggernaut (0.51)/n/a/n/a/n/a)                                                 |       |
| `horizontal_mobility`          | (1.12 m/s/2.25 m/s/3.38 m/s/4.50 m/s)                   | (Diviners Kevlar (0.44)/Glass Cannon (1.11)/n/a/n/a)                            |       |
| `hybrid_damage_usage`          | (25.0/50.0/75.0/100)                                    | (n/a/Crushing Fists (1.00)/Spiritual Overflow (1.40)/n/a)                       |       |
| `interrupt`                    | (18.8/37.5/56.2/75.0)                                   | (n/a/n/a/n/a/Echo Shard (2.00))                                                 |       |
| `large_hitbox`                 | (15.0/30.0/45.0/60.0)                                   | (n/a/n/a/n/a/Divine Barrier (2.00))                                             |       |
| `long_range`                   | (22.5/45.0/67.5/90.0)                                   | (n/a/Frenzy (-0.89)/n/a/n/a)                                                    |       |
| `low_max_hp`                   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP)                       | (n/a/Colossus (1.18)/Lucky Shot (1.53)/Glass Cannon (2.00))                     |       |
| `magazine_size_dependant`      | (56.2%/112%/169%/225%)                                  | (Mystic Reverb (0.31)/n/a/n/a/n/a)                                              |       |
| `melee_damage`                 | (18.8%/37.5%/56.2%/75.0%)                               | (n/a/Frenzy (1.20)/n/a/n/a)                                                     |       |
| `melee_resistance`             | (19.4%/38.8%/58.2%/77.6%)                               | (Leech (0.64)/n/a/n/a/n/a)                                                      |       |
| `mid_range`                    | (11.2/22.5/33.8/45.0)                                   | (n/a/n/a/Silencer (1.56)/Crushing Fists (2.00))                                 |       |
| `movement_slow`                | (33.8 weighted/67.5 weighted/101 weighted/135 weighted) | (Boundless Spirit (0.52)/n/a/n/a/n/a)                                           |       |
| `multi_ability_focus`          | (17.5/35.0/52.5/70.0)                                   | (n/a/Ethereal Shift (1.00)/Spiritual Overflow (1.29)/Scourge (2.00))            |       |
| `pure_damage`                  | (21.2/42.5/63.8/85.0)                                   | (n/a/n/a/n/a/Spirit Burn (2.00))                                                |       |
| `range_extender_dependant`     | (16.9%/33.8%/50.6%/67.5%)                               | (Diviners Kevlar (0.44)/n/a/n/a/n/a)                                            |       |
| `scaling_early`                | (22.5/45.0/67.5/90.0)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `scaling_late`                 | (20.0/40.0/60.0/80.0)                                   | (n/a/Arctic Blast (1.00)/Phantom Strike (1.38)/Lucky Shot (2.00))               |       |
| `self_buff`                    | (17.5/35.0/52.5/70.0)                                   | (n/a/Unstoppable (1.00)/Diviners Kevlar (1.57)/n/a)                             |       |
| `self_heal`                    | (169 HP/338 HP/506 HP/675 HP)                           | (Inhibitor (0.53)/Phantom Strike (0.95)/n/a/n/a)                                |       |
| `shield`                       | (338 HP/675 HP/1012 HP/1350 HP)                         | (Colossus (0.30)/n/a/n/a/n/a)                                                   |       |
| `silence`                      | (3.75/7.50/11.2/15.0)                                   | (Echo Shard (0.67)/Crippling Headshot (0.80)/n/a/Spellslinger (2.00))           |       |
| `single_ability_focus`         | (20.0/40.0/60.0/80.0)                                   | (n/a/Colossus (1.00)/Healing Tempo (1.50)/Magic Carpet (1.75))                  |       |
| `single_target`                | (16.2/32.5/48.8/65.0)                                   | (n/a/Cursed Relic (1.08)/Lucky Shot (1.54)/Crushing Fists (2.00))               |       |
| `small_hitbox`                 | (12.5/25.0/37.5/50.0)                                   | (n/a/n/a/n/a/n/a)                                                               |       |
| `spirit_burst_damage`          | (108 dmg/216 dmg/324 dmg/432 dmg)                       | (Magic Carpet (0.51)/Vortex Web (0.93)/n/a/n/a)                                 |       |
| `spirit_burst_proc`            | (0.25/0.50/0.75/1.00)                                   | (Refresher (0.60)/Plated Armor (0.80)/n/a/n/a)                                  |       |
| `spirit_burst_resistance`      | (25.3%/50.6%/75.9%/101%)                                | (n/a/Unstoppable (1.19)/n/a/n/a)                                                |       |
| `spirit_continuous_damage`     | (108 dmg/216 dmg/324 dmg/432 dmg)                       | (Crippling Headshot (0.65)/Ethereal Shift (1.02)/n/a/n/a)                       |       |
| `spirit_continuous_proc`       | (0.21/0.43/0.64/0.85)                                   | (n/a/Ethereal Shift (1.06)/n/a/n/a)                                             |       |
| `spirit_continuous_resistance` | (11.2%/22.5%/33.8%/45.0%)                               | (n/a/n/a/n/a/n/a)                                                               |       |
| `spirit_damage`                | (33.0 SP-eq/66.0 SP-eq/99.0 SP-eq/132 SP-eq)            | (Vortex Web (0.52)/Cursed Relic (0.80)/n/a/n/a)                                 |       |
| `spirit_lifesteal`             | (7.31%/14.6%/21.9%/29.2%)                               | (n/a/Cheat Death (0.89)/Phantom Strike (1.71)/Inhibitor (1.98))                 |       |
| `spirit_resist_shred`          | (8.25%/16.5%/24.7%/33.0%)                               | (Crushing Fists (0.67)/n/a/Ethereal Shift (1.52)/n/a)                           |       |
| `spirit_resistance`            | (14.6%/29.2%/43.9%/58.5%)                               | (Ethereal Shift (0.58)/Arctic Blast (0.75)/n/a/n/a)                             |       |
| `stun`                         | (0.38s/0.75s/1.12s/1.50s)                               | (Magic Carpet (0.53)/n/a/n/a/n/a)                                               |       |
| `team_heal`                    | (262 HP/525 HP/788 HP/1050 HP)                          | (Diviners Kevlar (0.38)/n/a/n/a/n/a)                                            |       |
| `trap_block_obstruct`          | (7.50/15.0/22.5/30.0)                                   | (n/a/n/a/n/a/Haunting Shot (2.00))                                              |       |
| `ult_focused`                  | (23.8/47.5/71.2/95.0)                                   | (n/a/Echo Shard (1.05)/Escalating Exposure (1.58)/Scourge (2.00))               |       |
| `vertical_mobility`            | (5.62 units/11.2 units/16.9 units/22.5 units)           | (Mercurial Magnum (0.44)/n/a/n/a/n/a)                                           |       |

## T? (SB)

| Tag                            | Effective Raw (0.5/1.0/1.5/2.0*)               | Staple Items (0.5/1.0/1.5/2.0*)                                             | Notes |
|--------------------------------|------------------------------------------------|-----------------------------------------------------------------------------|-------|
| `ability_spam`                 | (18.8/37.5/56.2/n/a)                           | (n/a/n/a/Mystical Piano (1.50)/n/a)                                         |       |
| `aerial`                       | (21.2/42.5/63.8/n/a)                           | (n/a/n/a/Shadow Strike (1.50)/n/a)                                          |       |
| `ally_buff`                    | (20.0/40.0/60.0/n/a)                           | (n/a/n/a/Cloak of Opportunity (1.50)/n/a)                                   |       |
| `anti_air`                     | (18.8/37.5/56.2/n/a)                           | (n/a/Shadow Strike (0.80)/n/a/n/a)                                          |       |
| `anti_heal`                    | (15.8%/31.5%/47.2%/n/a)                        | (n/a/Infinite Rounds (0.95)/Seraphim Wings (1.50)/n/a)                      |       |
| `aoe_cluster`                  | (20.0/40.0/60.0/n/a)                           | (n/a/Infinite Rounds (0.88)/Eternal Gift (1.50)/n/a)                        |       |
| `assist_importance`            | (21.2/42.5/63.8/n/a)                           | (n/a/n/a/Cloak of Opportunity (1.50)/n/a)                                   |       |
| `away_from_team`               | (15.0/30.0/45.0/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `bullet_damage`                | (30.0%/60.0%/90.0%/n/a)                        | (Shadow Strike (0.50)/Runed Gauntlets (0.83)/n/a/n/a)                       |       |
| `bullet_evasion`               | (7.50/15.0/22.5/n/a)                           | (n/a/n/a/Eternal Gift (1.50)/n/a)                                           |       |
| `bullet_lifesteal`             | (7.31%/14.6%/21.9%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `bullet_proc`                  | (0.10/0.20/0.30/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `bullet_resist_shred`          | (6.75%/13.5%/20.2%/n/a)                        | (n/a/n/a/Runed Gauntlets (1.50)/n/a)                                        |       |
| `bullet_resistance`            | (14.6%/29.2%/43.9%/n/a)                        | (n/a/Shadow Strike (0.85)/n/a/n/a)                                          |       |
| `burst_heal`                   | (124 HP/247 HP/371 HP/n/a)                     | (n/a/n/a/Cloak of Opportunity (1.50)/n/a)                                   |       |
| `burst_resistance`             | (12.5/25.0/37.5/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `cc_resist`                    | (16.2%/32.5%/48.8%/n/a)                        | (n/a/Cloak of Opportunity (1.08)/Electric Slippers (1.50)/n/a)              |       |
| `charge_dependant`             | (23.8/47.5/71.2/n/a)                           | (n/a/n/a/Prism Blast (1.50)/n/a)                                            |       |
| `close_range`                  | (23.8/47.5/71.2/n/a)                           | (n/a/n/a/Celestial Blessing (1.50)/n/a)                                     |       |
| `close_to_team`                | (17.5/35.0/52.5/n/a)                           | (n/a/n/a/Mystical Piano (1.43)/n/a)                                         |       |
| `continous_heal`               | (240 HP/481 HP/721 HP/n/a)                     | (n/a/n/a/n/a/n/a)                                                           |       |
| `cooldown_reduction`           | (12.5%/25.0%/37.5%/n/a)                        | (Celestial Blessing (0.56)/Mystic Conduit (1.00)/Mystical Piano (1.50)/n/a) |       |
| `counter_importance`           | (25.0/50.0/75.0/n/a)                           | (Celestial Blessing (0.70)/Eternal Gift (1.00)/Infinite Rounds (1.50)/n/a)  |       |
| `damage_sponge`                | (23.8/47.5/71.2/n/a)                           | (n/a/Nullification Burst (1.05)/Shrink Ray (1.47)/n/a)                      |       |
| `debuff`                       | (20.0/40.0/60.0/n/a)                           | (n/a/n/a/Infinite Rounds (1.50)/n/a)                                        |       |
| `debuff_resistance`            | (14.1%/28.1%/42.2%/n/a)                        | (n/a/n/a/Electric Slippers (1.42)/n/a)                                      |       |
| `disarm`                       | (1.50/3.00/4.50/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `displace`                     | (6.25/12.5/18.8/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `dot`                          | (97.5 dmg/195 dmg/292 dmg/n/a)                 | (n/a/n/a/n/a/n/a)                                                           |       |
| `duration_dependant`           | (12.4%/24.8%/37.1%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `engage`                       | (22.5/45.0/67.5/n/a)                           | (n/a/Cloak of Opportunity (1.22)/Celestial Blessing (1.50)/n/a)             |       |
| `escape`                       | (26.2/52.5/78.8/n/a)                           | (n/a/Eternal Gift (1.05)/Electric Slippers (1.50)/n/a)                      |       |
| `farmer`                       | (25.0/50.0/75.0/n/a)                           | (n/a/Unstable Concoction (1.00)/Nullification Burst (1.40)/n/a)             |       |
| `fire_rate`                    | (11.2%/22.5%/33.8%/n/a)                        | (Nullification Burst (0.53)/Eternal Gift (1.07)/Runed Gauntlets (1.50)/n/a) |       |
| `fire_rate_slow`               | (12.0%/24.0%/36.0%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `grounded`                     | (12.5/25.0/37.5/n/a)                           | (n/a/n/a/Celestial Blessing (1.50)/n/a)                                     |       |
| `gun_burst_damage`             | (55.0 dmg/110 dmg/165 dmg/n/a)                 | (n/a/Shadow Strike (0.91)/Runed Gauntlets (1.50)/n/a)                       |       |
| `gun_burst_proc`               | (0.33/0.65/0.98/n/a)                           | (Runed Gauntlets (0.62)/n/a/n/a/n/a)                                        |       |
| `gun_burst_resistance`         | (25.3%/50.6%/75.9%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `gun_continuous_damage`        | (55.0 dmg/110 dmg/165 dmg/n/a)                 | (n/a/n/a/Runed Gauntlets (1.50)/n/a)                                        |       |
| `gun_continuous_proc`          | (0.33/0.65/0.98/n/a)                           | (n/a/Runed Gauntlets (1.00)/n/a/n/a)                                        |       |
| `gun_continuous_resistance`    | (13.1%/26.2%/39.4%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `headshot_damage`              | (50.6%/101%/152%/n/a)                          | (n/a/n/a/n/a/n/a)                                                           |       |
| `high_assist_count`            | (12.5/25.0/37.5/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `high_kill_count`              | (17.5/35.0/52.5/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `high_max_hp`                  | (177 HP/354 HP/532 HP/n/a)                     | (Electric Slippers (0.28)/Frostbite Charm (0.99)/? (1.50)/n/a)              |       |
| `horizontal_mobility`          | (1.12 m/s/2.25 m/s/3.38 m/s/n/a)               | (Cloak of Opportunity (0.44)/Eternal Gift (1.11)/Shadow Strike (1.50)/n/a)  |       |
| `hybrid_damage_usage`          | (25.0/50.0/75.0/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `interrupt`                    | (18.8/37.5/56.2/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `large_hitbox`                 | (15.0/30.0/45.0/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `long_range`                   | (22.5/45.0/67.5/n/a)                           | (n/a/Infinite Rounds (1.00)/Runed Gauntlets (1.44)/n/a)                     |       |
| `low_max_hp`                   | (21.2 HP/42.5 HP/63.8 HP/n/a)                  | (n/a/n/a/n/a/n/a)                                                           |       |
| `magazine_size_dependant`      | (56.2%/112%/169%/n/a)                          | (Runed Gauntlets (0.44)/n/a/n/a/n/a)                                        |       |
| `melee_damage`                 | (18.8%/37.5%/56.2%/n/a)                        | (n/a/Frostbite Charm (1.07)/Celestial Blessing (1.47)/n/a)                  |       |
| `melee_resistance`             | (19.4%/38.8%/58.2%/n/a)                        | (n/a/n/a/Celestial Blessing (1.29)/n/a)                                     |       |
| `mid_range`                    | (11.2/22.5/33.8/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `movement_slow`                | (33.8 weighted/67.5 weighted/101 weighted/n/a) | (Infinite Rounds (0.52)/n/a/n/a/n/a)                                        |       |
| `multi_ability_focus`          | (17.5/35.0/52.5/n/a)                           | (n/a/Prism Blast (1.00)/n/a/n/a)                                            |       |
| `pure_damage`                  | (21.2/42.5/63.8/n/a)                           | (n/a/n/a/Infinite Rounds (1.50)/n/a)                                        |       |
| `range_extender_dependant`     | (16.9%/33.8%/50.6%/n/a)                        | (n/a/Mystical Piano (1.19)/n/a/n/a)                                         |       |
| `scaling_early`                | (22.5/45.0/67.5/n/a)                           | (n/a/Nullification Burst (0.78)/n/a/n/a)                                    |       |
| `scaling_late`                 | (20.0/40.0/60.0/n/a)                           | (n/a/? (1.12)/Nullification Burst (1.50)/n/a)                               |       |
| `self_buff`                    | (17.5/35.0/52.5/n/a)                           | (n/a/n/a/Electric Slippers (1.50)/n/a)                                      |       |
| `self_heal`                    | (169 HP/338 HP/506 HP/n/a)                     | (n/a/Cloak of Opportunity (1.19)/Mystical Piano (1.50)/n/a)                 |       |
| `shield`                       | (338 HP/675 HP/1012 HP/n/a)                    | (Electric Slippers (0.37)/n/a/n/a/n/a)                                      |       |
| `silence`                      | (3.75/7.50/11.2/n/a)                           | (n/a/Omnicharge Signet (1.07)/n/a/n/a)                                      |       |
| `single_ability_focus`         | (20.0/40.0/60.0/n/a)                           | (n/a/Omnicharge Signet (1.25)/Mystic Conduit (1.50)/n/a)                    |       |
| `single_target`                | (16.2/32.5/48.8/n/a)                           | (n/a/n/a/Infinite Rounds (1.50)/n/a)                                        |       |
| `small_hitbox`                 | (12.5/25.0/37.5/n/a)                           | (n/a/n/a/Unstable Concoction (1.50)/n/a)                                    |       |
| `spirit_burst_damage`          | (108 dmg/216 dmg/324 dmg/n/a)                  | (Eternal Gift (0.46)/Mystic Conduit (0.93)/Shrink Ray (1.25)/n/a)           |       |
| `spirit_burst_proc`            | (0.25/0.50/0.75/n/a)                           | (n/a/Seraphim Wings (0.80)/n/a/n/a)                                         |       |
| `spirit_burst_resistance`      | (25.3%/50.6%/75.9%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `spirit_continuous_damage`     | (108 dmg/216 dmg/324 dmg/n/a)                  | (Prism Blast (0.37)/Frostbite Charm (1.16)/Shrink Ray (1.50)/n/a)           |       |
| `spirit_continuous_proc`       | (0.21/0.43/0.64/n/a)                           | (n/a/n/a/Shrink Ray (1.41)/n/a)                                             |       |
| `spirit_continuous_resistance` | (11.2%/22.5%/33.8%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `spirit_damage`                | (33.0 SP-eq/66.0 SP-eq/99.0 SP-eq/n/a)         | (Frostbite Charm (0.53)/Shrink Ray (1.06)/Mystic Conduit (1.36)/n/a)        |       |
| `spirit_lifesteal`             | (7.31%/14.6%/21.9%/n/a)                        | (n/a/n/a/n/a/n/a)                                                           |       |
| `spirit_resist_shred`          | (8.25%/16.5%/24.7%/n/a)                        | (n/a/n/a/Frostbite Charm (1.50)/n/a)                                        |       |
| `spirit_resistance`            | (14.6%/29.2%/43.9%/n/a)                        | (n/a/Shadow Strike (0.85)/n/a/n/a)                                          |       |
| `stun`                         | (0.38s/0.75s/1.12s/n/a)                        | (n/a/Omnicharge Signet (1.13)/? (1.47)/n/a)                                 |       |
| `team_heal`                    | (262 HP/525 HP/788 HP/n/a)                     | (n/a/Mystical Piano (0.95)/Cloak of Opportunity (1.50)/n/a)                 |       |
| `trap_block_obstruct`          | (7.50/15.0/22.5/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `ult_focused`                  | (23.8/47.5/71.2/n/a)                           | (n/a/n/a/n/a/n/a)                                                           |       |
| `vertical_mobility`            | (5.62 units/11.2 units/16.9 units/n/a)         | (Shadow Strike (0.71)/n/a/n/a/n/a)                                          |       |

*Street Brawl items are capped at norm=1.5; the 2.0 column is always n/a.*

