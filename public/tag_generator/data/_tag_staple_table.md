# Tag Staple Table (Round 11+)

Per-tag sanity-check between normalize (Step 3b) and audit (Step 5). Each tag gets one section; the section lists every tier the tag appears at (T1 → T2 → T3 → T4 → T? = Street Brawl).

For each (tag, tier) row:

1. **Effective Raw thresholds** — the comparative raw value an item would need at that tier to normalize to 0.5 / 1.0 / 1.5 / 2.0.
2. **Staple Items** — the actual items in that tier sitting closest to each normalized anchor, with their measured normalized value in parentheses.

If a tag's 2.0 staple item at a tier isn't the tag's named anchor (per [tag_descriptions.md](Mass Item AI Audit Skill/tag_descriptions.md)), something is off — re-check Pass 1/2 for that tag before approving the audit.

*Street Brawl items (T?) are capped at norm=1.5, so their 2.0 column is always n/a.*

## `ability_spam`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                  | All Items at Tier (Raw/Norm)                                                                                                                             |
|------|----------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (18.8/37.5/56.2/75.0)            | (n/a/Extra Charge (0.93)/n/a/n/a)                                                | Extra Charge (35.0/0.93)                                                                                                                                 |
| T2   | (18.8/37.5/56.2/75.0)            | (n/a/Compress Cooldown (1.20)/Recharging Rush (1.47)/n/a)                        | Recharging Rush (55.0/1.47), Compress Cooldown (45.0/1.20)                                                                                               |
| T3   | (18.8/37.5/56.2/75.0)            | (n/a/Radiant Regeneration (0.93)/Superior Cooldown (1.33)/Rapid Recharge (1.87)) | Rapid Recharge (70.0/1.87), Superior Cooldown (50.0/1.33), Radiant Regeneration (35.0/0.93)                                                              |
| T4   | (18.8/37.5/56.2/75.0)            | (n/a/Escalating Exposure (1.07)/Spellslinger (1.60)/Refresher (2.00))            | Refresher (75.0/2.00), Spirit Burn (70.0/1.87), Spellslinger (60.0/1.60), Echo Shard (60.0/1.60), Witchmail (50.0/1.33), Escalating Exposure (40.0/1.07) |
| T?   | (18.8/37.5/56.2/n/a)             | (n/a/n/a/Mystic Conduit (1.50)/n/a)                                              | Mystic Conduit (70.0/1.50), Omnicharge Signet (80.0/1.50), Runed Gauntlets (50.0/1.33)                                                                   |

**Notes:**

Refresher is a bit high, spirit burn should be around .5 normalized,echo shard should be closer to .75 norm, Escelating Exposure closer to .5 norm (Doesnt directly contribute to ability spams)

## `aerial`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                     | All Items at Tier (Raw/Norm)                                                     |
|------|----------------------------------|-----------------------------------------------------|----------------------------------------------------------------------------------|
| T1   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                                                |
| T2   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/Kinetic Dash (1.65)/n/a)                   | Kinetic Dash (70.0/1.65)                                                         |
| T3   | (21.2/42.5/63.8/85.0)            | (Shadow Weave (0.41)/n/a/Majestic Leap (1.65)/n/a)  | Majestic Leap (70.0/1.65), Stamina Mastery (70.0/1.65), Shadow Weave (17.5/0.41) |
| T4   | (21.2/42.5/63.8/85.0)            | (n/a/Ethereal Shift (0.94)/n/a/Magic Carpet (2.00)) | Magic Carpet (85.0/2.00), Ethereal Shift (40.0/0.94)                             |
| T?   | (21.2/42.5/63.8/n/a)             | (n/a/n/a/Seraphim Wings (1.50)/n/a)                 | Seraphim Wings (100/1.50)                                                        |

**Notes:**

Missing extra stamina, should be normalized to around 1 Norm, Kinetic Dash is a bit high (Lower to around .5), also add arcane surge and make it mirror kinetic dash (remember, anything with stamina needs some aerial since it helps keep you up in the air). Majestic leap needs to be lowere to 1 (Cooldown and uptime is too high). Etherial shift doesnt really count for aerial, make it .5

## `ally_buff`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                       | All Items at Tier (Raw/Norm)                                                                                                    |
|------|----------------------------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| T1   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/n/a/n/a)                                     | —                                                                                                                               |
| T2   | (20.0/40.0/60.0/80.0)            | (n/a/Healing Booster (1.12)/Guardian Ward (1.38)/n/a) | Guardian Ward (55.0/1.38), Spirit Shredder Bullets (50.0/1.25), Healing Booster (45.0/1.12), Bullet Resist Shredder (35.0/0.88) |
| T3   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/Hunters Aura (1.50)/Heroic Aura (2.00))      | Heroic Aura (80.0/2.00), Hunters Aura (60.0/1.50)                                                                               |
| T4   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/Scourge (1.50)/Divine Barrier (1.75))        | Divine Barrier (70.0/1.75), Scourge (60.0/1.50), Healing Tempo (55.0/1.38)                                                      |
| T?   | (20.0/40.0/60.0/n/a)             | (n/a/n/a/Celestial Blessing (1.50)/n/a)               | Celestial Blessing (90.0/1.50), Mystic Conduit (75.0/1.50), Shrink Ray (65.0/1.50)                                              |

**Notes:**
Completley left out healing rite (1.0 raw). spirit shredder lower to .75.  

## `anti_air`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)     | All Items at Tier (Raw/Norm) |
|------|----------------------------------|-------------------------------------|------------------------------|
| T1   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/n/a)                   | —                            |
| T2   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/n/a)                   | —                            |
| T3   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/Knockdown (2.00))      | Knockdown (75.0/2.00)        |
| T4   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/Phantom Strike (1.73)/n/a) | Phantom Strike (65.0/1.73)   |
| T?   | (18.8/37.5/56.2/n/a)             | (n/a/Seraphim Wings (0.80)/n/a/n/a) | Seraphim Wings (30.0/0.80)   |

**Notes:**

Add slowing hex and make it 1, add vortex web and make it .5.

## `anti_heal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                           | All Items at Tier (Raw/Norm)                                                      |
|------|----------------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------------------|
| T1   | (4.44%/8.89%/13.3%/17.8%)        | (n/a/n/a/n/a/n/a)                                         | —                                                                                 |
| T2   | (6.67%/13.3%/20.0%/26.7%)        | (n/a/n/a/n/a/Healbane (1.88))                             | Healbane (25.0%/1.88)                                                             |
| T3   | (10.0%/20.0%/30.0%/40.0%)        | (n/a/n/a/Spirit Rend (1.30)/Decay (2.00))                 | Decay (40.0%/2.00), Spirit Rend (26.0%/1.30)                                      |
| T4   | (15.0%/30.0%/45.0%/60.0%)        | (n/a/Inhibitor (0.93)/Spirit Burn (1.67)/n/a)             | Spirit Burn (50.0%/1.67), Inhibitor (28.0%/0.93), Crippling Headshot (25.0%/0.83) |
| T?   | (15.0%/30.0%/45.0%/n/a)          | (n/a/Haunting Shot (1.00)/Nullification Burst (1.50)/n/a) | Nullification Burst (50.0%/1.50), Haunting Shot (30.0%/1.00)                      |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `aoe_cluster`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                         | All Items at Tier (Raw/Norm)                                                                                                                                                                                |
|------|----------------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/n/a/n/a)                                       | —                                                                                                                                                                                                           |
| T2   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/Split Shot (1.50)/n/a)                         | Split Shot (60.0/1.50), Cold Front (55.0/1.38)                                                                                                                                                              |
| T3   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/Surge of Power (1.50)/Alchemical Fire (1.75))  | Alchemical Fire (70.0/1.75), Spirit Rend (70.0/1.75), Healing Nova (65.0/1.62), Surge of Power (60.0/1.50), Hunters Aura (55.0/1.38)                                                                        |
| T4   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/Capacitor (1.62)/Vortex Web (2.00))            | Vortex Web (80.0/2.00), Colossus (75.0/1.88), Arctic Blast (75.0/1.88), Mystic Reverb (75.0/1.88), Spirit Burn (75.0/1.88), Ricochet (70.0/1.75), Scourge (70.0/1.75), Capacitor (65.0/1.62)                |
| T?   | (20.0/40.0/60.0/n/a)             | (n/a/Haunting Shot (0.88)/Electric Slippers (1.50)/n/a) | Electric Slippers (65.0/1.50), Nullification Burst (95.0/1.50), Mystic Conduit (70.0/1.50), Mystical Piano (80.0/1.50), Prism Blast (85.0/1.50), Unstable Concoction (95.0/1.50), Haunting Shot (35.0/0.88) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `assist_importance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                       | All Items at Tier (Raw/Norm)                                                       |
|------|----------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------|
| T1   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/Healing Rite (1.65)/n/a)                     | Healing Rite (70.0/1.65)                                                           |
| T2   | (21.2/42.5/63.8/85.0)            | (n/a/Healing Booster (0.82)/Guardian Ward (1.53)/n/a) | Guardian Ward (65.0/1.53), Healing Booster (35.0/0.82)                             |
| T3   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/Heroic Aura (1.41)/Rescue Beam (2.00))       | Rescue Beam (85.0/2.00), Healing Nova (80.0/1.88), Heroic Aura (60.0/1.41)         |
| T4   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/Healing Tempo (1.65)/Divine Barrier (1.88))  | Divine Barrier (80.0/1.88), Healing Tempo (70.0/1.65), Scourge (70.0/1.65)         |
| T?   | (21.2/42.5/63.8/n/a)             | (n/a/n/a/Celestial Blessing (1.50)/n/a)               | Celestial Blessing (95.0/1.50), Mystic Conduit (80.0/1.50), Shrink Ray (70.0/1.50) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `away_from_team`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)  | All Items at Tier (Raw/Norm) |
|------|----------------------------------|----------------------------------|------------------------------|
| T1   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T2   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T3   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/Veil Walker (2.00)) | Veil Walker (50.0/2.00)      |
| T4   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T?   | (12.5/25.0/37.5/n/a)             | (n/a/n/a/n/a/n/a)                | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                     | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|------|----------------------------------|-------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (8.89%/17.8%/26.7%/35.6%)        | (Rapid Rounds (0.51)/Close Quarters (0.90)/n/a/n/a)                                 | Close Quarters (16.0%/0.90), Extended Magazine (13.0%/0.73), High-Velocity Rounds (13.0%/0.73), Headshot Booster (11.0%/0.62), Restorative Shot (11.0%/0.62), Rapid Rounds (9.00%/0.51), Monster Rounds (5.20%/0.29)                                                                                                                                                                                                                                                                                                                                                      |
| T2   | (13.3%/26.7%/40.0%/53.3%)        | (Fleetfoot (0.49)/Long Range (1.01)/Swift Striker (1.43)/n/a)                       | Swift Striker (38.0%/1.43), Intensifying Magazine (32.0%/1.20), Split Shot (31.0%/1.16), Opening Rounds (30.0%/1.13), Long Range (27.0%/1.01), Slowing Bullets (22.0%/0.83), Recharging Rush (17.0%/0.64), Active Reload (14.0%/0.53), Fleetfoot (13.0%/0.49), Kinetic Dash (13.0%/0.49), Battle Vest (11.0%/0.41), Bullet Resist Shredder (9.00%/0.34), Melee Charge (7.20%/0.27), Mystic Shot (7.20%/0.27), Spirit Shredder Bullets (7.20%/0.27), Stalker (7.20%/0.27), Weakening Headshot (7.20%/0.27), Bullet Lifesteal (6.00%/0.23), Quicksilver Reload (0.00%/0.00) |
| T3   | (20.0%/40.0%/60.0%/80.0%)        | (Headhunter (0.37)/Cultist Sacrifice (1.07)/Point Blank (1.55)/Sharpshooter (1.80)) | Sharpshooter (72.0%/1.80), Point Blank (62.0%/1.55), Berserker (50.0%/1.25), Weighted Shots (49.6%/1.24), Hollow Point (45.1%/1.13), Cultist Sacrifice (43.0%/1.07), Ballistic Enchantment (32.0%/0.80), Express Shot (30.0%/0.75), Spirit Rend (28.8%/0.72), Escalating Resilience (27.6%/0.69), Headhunter (14.6%/0.37), Shadow Weave (10.0%/0.25), Alchemical Fire (9.60%/0.24), Blood Tribute (9.60%/0.24), Burst Fire (9.60%/0.24), Heroic Aura (9.60%/0.24), Hunters Aura (9.60%/0.24), Fury Trance (6.00%/0.15)                                                    |
| T4   | (30.0%/60.0%/90.0%/120%)         | (Mercurial Magnum (0.50)/n/a/n/a/Glass Cannon (2.00))                               | Glass Cannon (120%/2.00), Lucky Shot (35.0%/0.58), Mercurial Magnum (30.0%/0.50), Armor Piercing Rounds (25.0%/0.42), Spellslinger (25.0%/0.42), Ricochet (22.0%/0.37), Spiritual Overflow (20.0%/0.33), Frenzy (18.0%/0.30), Colossus (15.0%/0.25), Phantom Strike (15.0%/0.25), Siphon Bullets (15.0%/0.25), Crushing Fists (12.0%/0.20), Leech (12.0%/0.20), Vampiric Burst (12.0%/0.20), Inhibitor (10.0%/0.17), Capacitor (9.60%/0.16), Crippling Headshot (9.60%/0.16), Silencer (9.60%/0.16)                                                                       |
| T?   | (30.0%/60.0%/90.0%/n/a)          | (Seraphim Wings (0.50)/Infinite Rounds (0.83)/n/a/n/a)                              | Infinite Rounds (50.0%/0.83), Haunting Shot (35.0%/0.58), Unstable Concoction (35.0%/0.58), Seraphim Wings (30.0%/0.50), Eternal Gift (25.0%/0.42)                                                                                                                                                                                                                                                                                                                                                                                                                        |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_evasion`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)        | All Items at Tier (Raw/Norm)                          |
|------|----------------------------------|----------------------------------------|-------------------------------------------------------|
| T1   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/n/a)                      | —                                                     |
| T2   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/n/a)                      | —                                                     |
| T3   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/Veil Walker (1.67)/n/a)       | Veil Walker (25.0/1.67), Counterspell (0.00/0.00)     |
| T4   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/Plated Armor (2.00))      | Plated Armor (30.0/2.00)                              |
| T?   | (7.50/15.0/22.5/n/a)             | (n/a/n/a/Electric Slippers (1.50)/n/a) | Electric Slippers (25.0/1.50), Shrink Ray (25.0/1.50) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_lifesteal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                        | All Items at Tier (Raw/Norm)                              |
|------|----------------------------------|--------------------------------------------------------|-----------------------------------------------------------|
| T1   | (2.17%/4.33%/6.50%/8.67%)        | (n/a/n/a/n/a/n/a)                                      | —                                                         |
| T2   | (3.25%/6.50%/9.75%/13.0%)        | (n/a/n/a/Active Reload (1.38)/Bullet Lifesteal (2.00)) | Bullet Lifesteal (13.0%/2.00), Active Reload (9.00%/1.38) |
| T3   | (4.88%/9.75%/14.6%/19.5%)        | (Headhunter (0.62)/n/a/Fury Trance (1.44)/n/a)         | Fury Trance (14.0%/1.44), Headhunter (6.00%/0.62)         |
| T4   | (7.31%/14.6%/21.9%/29.2%)        | (n/a/n/a/Leech (1.71)/n/a)                             | Leech (25.0%/1.71), Vampiric Burst (25.0%/1.71)           |
| T?   | (7.31%/14.6%/21.9%/n/a)          | (n/a/n/a/n/a/n/a)                                      | —                                                         |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_proc`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)  | All Items at Tier (Raw/Norm) |
|------|----------------------------------|----------------------------------|------------------------------|
| T1   | (0.10/0.20/0.30/0.40)            | (n/a/n/a/n/a/n/a)                | —                            |
| T2   | (0.10/0.20/0.30/0.40)            | (n/a/n/a/n/a/n/a)                | —                            |
| T3   | (0.10/0.20/0.30/0.40)            | (n/a/n/a/n/a/Spirit Rend (2.00)) | Spirit Rend (0.40/2.00)      |
| T4   | (0.10/0.20/0.30/0.40)            | (n/a/n/a/n/a/n/a)                | —                            |
| T?   | (0.10/0.20/0.30/n/a)             | (n/a/n/a/n/a/n/a)                | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_resist_shred`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                    | All Items at Tier (Raw/Norm)                                                                                   |
|------|----------------------------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| T1   | (2.00%/4.00%/6.00%/8.00%)        | (Rusted Barrel (0.63)/n/a/n/a/n/a)                                                 | Rusted Barrel (2.50%/0.63)                                                                                     |
| T2   | (3.00%/6.00%/9.00%/12.0%)        | (Stalker (0.67)/Bullet Resist Shredder (1.17)/Weakening Headshot (1.50)/n/a)       | Weakening Headshot (9.00%/1.50), Bullet Resist Shredder (7.00%/1.17), Stalker (4.00%/0.67)                     |
| T3   | (4.50%/9.00%/13.5%/18.0%)        | (Alchemical Fire (0.56)/Hollow Point (0.78)/n/a/Hunters Aura (2.00))               | Hunters Aura (18.0%/2.00), Hollow Point (7.00%/0.78), Alchemical Fire (5.00%/0.56), Disarming Hex (4.00%/0.44) |
| T4   | (6.75%/13.5%/20.2%/27.0%)        | (Crushing Fists (0.52)/Crippling Headshot (0.81)/Armor Piercing Rounds (1.41)/n/a) | Armor Piercing Rounds (19.0%/1.41), Crippling Headshot (11.0%/0.81), Crushing Fists (7.00%/0.52)               |
| T?   | (6.75%/13.5%/20.2%/n/a)          | (n/a/n/a/Infinite Rounds (1.50)/n/a)                                               | Infinite Rounds (22.0%/1.50), Shadow Strike (25.0%/1.50)                                                       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `bullet_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                 | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                  |
|------|----------------------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (4.33%/8.67%/13.0%/17.3%)        | (n/a/n/a/n/a/n/a)                                                               | —                                                                                                                                                                                                                                                             |
| T2   | (6.50%/13.0%/19.5%/26.0%)        | (Fleetfoot (0.46)/Return Fire (0.77)/Battle Vest (1.38)/n/a)                    | Battle Vest (18.0%/1.38), Return Fire (10.0%/0.77), Bullet Resist Shredder (9.00%/0.69), Suppressor (8.00%/0.62), Fleetfoot (6.00%/0.46), Melee Charge (6.00%/0.46), Weapon Shielding (4.00%/0.31)                                                            |
| T3   | (9.75%/19.5%/29.2%/39.0%)        | (Hunters Aura (0.51)/Escalating Resilience (1.13)/n/a/Bullet Resilience (2.00)) | Bullet Resilience (39.0%/2.00), Metal Skin (37.0%/1.90), Escalating Resilience (22.0%/1.13), Heroic Aura (17.0%/0.87), Hunters Aura (10.0%/0.51), Warp Stone (9.00%/0.46), Berserker (8.00%/0.41), Disarming Hex (8.00%/0.41), Superior Duration (8.00%/0.41) |
| T4   | (14.6%/29.2%/43.9%/58.5%)        | (Cheat Death (0.51)/n/a/n/a/n/a)                                                | Plated Armor (18.0%/0.62), Cheat Death (15.0%/0.51), Crushing Fists (12.0%/0.41), Colossus (12.0%/0.41), Indomitable (10.0%/0.34), Siphon Bullets (10.0%/0.34), Vampiric Burst (10.0%/0.34), Echo Shard (5.00%/0.17)                                          |
| T?   | (14.6%/29.2%/43.9%/n/a)          | (n/a/Seraphim Wings (0.85)/n/a/n/a)                                             | Seraphim Wings (25.0%/0.85)                                                                                                                                                                                                                                   |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `burst_heal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                          | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                |
|------|----------------------------------|----------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (46.7 HP/93.3 HP/140 HP/187 HP)  | (Restorative Shot (0.54)/Melee Lifesteal (1.07)/n/a/n/a) | Melee Lifesteal (100 HP/1.07), Rebuttal (60.0 HP/0.64), Restorative Shot (50.0 HP/0.54), Healing Rite (15.0 HP/0.16), Mystic Regeneration (4.00 HP/0.04), Extra Regen (2.50 HP/0.03)                                                                                                        |
| T2   | (70.0 HP/140 HP/210 HP/280 HP)   | (n/a/n/a/n/a/Restorative Locket (2.00))                  | Restorative Locket (280 HP/2.00), Healbane (275 HP/1.96), Healing Booster (3.00 HP/0.02)                                                                                                                                                                                                    |
| T3   | (105 HP/210 HP/315 HP/420 HP)    | (Lifestrike (0.48)/Healing Nova (0.76)/n/a/n/a)          | Healing Nova (160 HP/0.76), Dispel Magic (110 HP/0.52), Lifestrike (100 HP/0.48), Veil Walker (85.0 HP/0.40), Rescue Beam (80.0 HP/0.38), Counterspell (75.0 HP/0.36), Radiant Regeneration (70.0 HP/0.33), Headhunter (20.0 HP/0.10), Fortitude (10.0 HP/0.05), Fury Trance (10.0 HP/0.05) |
| T4   | (158 HP/315 HP/472 HP/630 HP)    | (n/a/n/a/n/a/n/a)                                        | Juggernaut (8.00 HP/0.03), Healing Tempo (6.00 HP/0.02)                                                                                                                                                                                                                                     |
| T?   | (158 HP/315 HP/472 HP/n/a)       | (n/a/n/a/Mystic Conduit (1.50)/n/a)                      | Mystic Conduit (700 HP/1.50), Celestial Blessing (400 HP/1.27)                                                                                                                                                                                                                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `burst_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                  | All Items at Tier (Raw/Norm)                      |
|------|----------------------------------|--------------------------------------------------|---------------------------------------------------|
| T1   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                | —                                                 |
| T2   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                | —                                                 |
| T3   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/Majestic Leap (1.40)/Metal Skin (2.00)) | Metal Skin (50.0/2.00), Majestic Leap (35.0/1.40) |
| T4   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                | —                                                 |
| T?   | (12.5/25.0/37.5/n/a)             | (n/a/n/a/n/a/n/a)                                | —                                                 |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `cc_resist`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                | All Items at Tier (Raw/Norm)                                                                                                                                                                                          |
|------|----------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (4.81%/9.63%/14.4%/19.3%)        | (n/a/n/a/n/a/n/a)                                                              | —                                                                                                                                                                                                                     |
| T2   | (7.22%/14.4%/21.7%/28.9%)        | (n/a/Fleetfoot (0.83)/n/a/n/a)                                                 | Debuff Reducer (18.0%/1.25), Enduring Speed (18.0%/1.25), Fleetfoot (12.0%/0.83), Reactive Barrier (12.0%/0.83)                                                                                                       |
| T3   | (10.8%/21.7%/32.5%/43.3%)        | (Majestic Leap (0.55)/n/a/Blood Tribute (1.48)/n/a)                            | Blood Tribute (32.0%/1.48), Dispel Magic (30.0%/1.38), Weighted Shots (16.0%/0.74), Majestic Leap (12.0%/0.55)                                                                                                        |
| T4   | (16.2%/32.5%/48.8%/65.0%)        | (Cheat Death (0.37)/Magic Carpet (0.92)/Unstoppable (1.54)/Indomitable (2.00)) | Indomitable (65.0%/2.00), Unstoppable (50.0%/1.54), Ethereal Shift (50.0%/1.54), Juggernaut (40.0%/1.23), Magic Carpet (30.0%/0.92), Divine Barrier (25.0%/0.77), Spellbreaker (25.0%/0.77), Cheat Death (12.0%/0.37) |
| T?   | (16.2%/32.5%/48.8%/n/a)          | (n/a/Celestial Blessing (1.08)/Cloak of Opportunity (1.50)/n/a)                | Cloak of Opportunity (75.0%/1.50), Prism Blast (60.0%/1.50), Unstable Concoction (50.0%/1.50), Celestial Blessing (35.0%/1.08)                                                                                        |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `charge_dependant`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                            | All Items at Tier (Raw/Norm)                                |
|------|----------------------------------|------------------------------------------------------------|-------------------------------------------------------------|
| T1   | (23.8/47.5/71.2/95.0)            | (n/a/Mystic Burst (1.05)/Extra Charge (1.47)/n/a)          | Extra Charge (70.0/1.47), Mystic Burst (50.0/1.05)          |
| T2   | (23.8/47.5/71.2/95.0)            | (n/a/Recharging Rush (1.05)/Quicksilver Reload (1.37)/n/a) | Quicksilver Reload (65.0/1.37), Recharging Rush (50.0/1.05) |
| T3   | (23.8/47.5/71.2/95.0)            | (n/a/Surge of Power (1.05)/n/a/Rapid Recharge (2.00))      | Rapid Recharge (95.0/2.00), Surge of Power (50.0/1.05)      |
| T4   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/Mercurial Magnum (1.68)/n/a)                      | Mercurial Magnum (80.0/1.68)                                |
| T?   | (23.8/47.5/71.2/n/a)             | (n/a/n/a/Omnicharge Signet (1.50)/n/a)                     | Omnicharge Signet (95.0/1.50)                               |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `close_range`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                    | All Items at Tier (Raw/Norm)                                                                                                       |
|------|----------------------------------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/Spirit Strike (1.58)/Melee Lifesteal (1.89))              | Melee Lifesteal (90.0/1.89), Close Quarters (80.0/1.68), Spirit Strike (75.0/1.58)                                                 |
| T2   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/Stalker (1.68)/Melee Charge (1.79))                       | Melee Charge (85.0/1.79), Stalker (80.0/1.68)                                                                                      |
| T3   | (23.8/47.5/71.2/95.0)            | (n/a/Surge of Power (1.05)/Spirit Snatch (1.68)/Lifestrike (2.00)) | Lifestrike (95.0/2.00), Point Blank (90.0/1.89), Spirit Snatch (80.0/1.68), Surge of Power (50.0/1.05), Sharpshooter (-40.0/-0.84) |
| T4   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/n/a/Crushing Fists (2.00))                                | Crushing Fists (95.0/2.00)                                                                                                         |
| T?   | (23.8/47.5/71.2/n/a)             | (n/a/n/a/Runed Gauntlets (1.50)/n/a)                               | Runed Gauntlets (95.0/1.50), Shadow Strike (95.0/1.50), Prism Blast (65.0/1.37)                                                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `close_to_team`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                 | All Items at Tier (Raw/Norm)                                                                         |
|------|----------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| T1   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                               | —                                                                                                    |
| T2   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                               | —                                                                                                    |
| T3   | (17.5/35.0/52.5/70.0)            | (n/a/Hunters Aura (1.00)/Rescue Beam (1.43)/Heroic Aura (2.00)) | Heroic Aura (70.0/2.00), Rescue Beam (50.0/1.43), Healing Nova (40.0/1.14), Hunters Aura (35.0/1.00) |
| T4   | (17.5/35.0/52.5/70.0)            | (n/a/Colossus (1.14)/n/a/n/a)                                   | Colossus (40.0/1.14)                                                                                 |
| T?   | (17.5/35.0/52.5/n/a)             | (n/a/n/a/Mystic Conduit (1.43)/n/a)                             | Mystic Conduit (50.0/1.43)                                                                           |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `continous_heal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                  | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                       |
|------|----------------------------------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (71.2 HP/142 HP/214 HP/285 HP)   | (Extra Regen (0.70)/n/a/n/a/Healing Rite (2.00)) | Healing Rite (285 HP/2.00), Extra Regen (100 HP/0.70), Mystic Regeneration (24.0 HP/0.17)                                                                                                                                                                                                                                                                                          |
| T2   | (107 HP/214 HP/321 HP/428 HP)    | (Healing Booster (0.47)/n/a/n/a/n/a)             | Healing Booster (100 HP/0.47)                                                                                                                                                                                                                                                                                                                                                      |
| T3   | (160 HP/321 HP/481 HP/641 HP)    | (Healing Nova (0.51)/n/a/n/a/n/a)                | Healing Nova (165 HP/0.51), Fortitude (130 HP/0.41), Rescue Beam (120 HP/0.37), Fury Trance (75.0 HP/0.23), Radiant Regeneration (30.0 HP/0.09), Hollow Point (18.9 HP/0.06), Blood Tribute (16.8 HP/0.05), Superior Cooldown (16.8 HP/0.05), Bullet Resilience (12.6 HP/0.04), Spirit Resilience (12.6 HP/0.04), Cultist Sacrifice (8.40 HP/0.03), Stamina Mastery (8.40 HP/0.03) |
| T4   | (240 HP/481 HP/721 HP/962 HP)    | (Juggernaut (0.50)/n/a/n/a/n/a)                  | Juggernaut (240 HP/0.50), Healing Tempo (200 HP/0.42)                                                                                                                                                                                                                                                                                                                              |
| T?   | (240 HP/481 HP/721 HP/n/a)       | (n/a/n/a/n/a/n/a)                                | —                                                                                                                                                                                                                                                                                                                                                                                  |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `cooldown_reduction`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                           | All Items at Tier (Raw/Norm)                                                                                                  |
|------|----------------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| T1   | (3.70%/7.41%/11.1%/14.8%)        | (n/a/n/a/n/a/n/a)                                                         | —                                                                                                                             |
| T2   | (5.56%/11.1%/16.7%/22.2%)        | (Enchanters Emblem (0.27)/n/a/Compress Cooldown (1.62)/n/a)               | Compress Cooldown (18.0%/1.62), Recharging Rush (14.0%/1.26), Enchanters Emblem (3.00%/0.27)                                  |
| T3   | (8.33%/16.7%/25.0%/33.3%)        | (n/a/Superior Cooldown (1.20)/Rapid Recharge (1.50)/n/a)                  | Rapid Recharge (25.0%/1.50), Superior Cooldown (20.0%/1.20)                                                                   |
| T4   | (12.5%/25.0%/37.5%/50.0%)        | (Indomitable (0.32)/n/a/Refresher (1.40)/Spirit Burn (2.00))              | Spirit Burn (50.0%/2.00), Refresher (35.0%/1.40), Witchmail (18.0%/0.72), Indomitable (8.00%/0.32), Spellslinger (5.00%/0.20) |
| T?   | (12.5%/25.0%/37.5%/n/a)          | (Runed Gauntlets (0.56)/Frostbite Charm (1.00)/Mystic Conduit (1.50)/n/a) | Mystic Conduit (50.0%/1.50), Omnicharge Signet (50.0%/1.50), Frostbite Charm (25.0%/1.00), Runed Gauntlets (14.0%/0.56)       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `counter_importance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                     | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|------|----------------------------------|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (25.0/50.0/75.0/100)             | (Healing Rite (0.70)/Rebuttal (0.90)/n/a/n/a)                                       | Rusted Barrel (55.0/1.10), Rebuttal (45.0/0.90), Healing Rite (35.0/0.70)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| T2   | (25.0/50.0/75.0/100)             | (Fleetfoot (0.70)/Stalker (1.00)/Slowing Hex (1.50)/n/a)                            | Slowing Hex (75.0/1.50), Reactive Barrier (70.0/1.40), Spirit Sap (70.0/1.40), Spirit Shielding (65.0/1.30), Weapon Shielding (65.0/1.30), Return Fire (60.0/1.20), Debuff Reducer (55.0/1.10), Healbane (55.0/1.10), Restorative Locket (55.0/1.10), Suppressor (55.0/1.10), Stalker (50.0/1.00), Enduring Speed (50.0/1.00), Bullet Resist Shredder (50.0/1.00), Cold Front (50.0/1.00), Spirit Shredder Bullets (45.0/0.90), Mystic Slow (45.0/0.90), Slowing Bullets (40.0/0.80), Healing Booster (40.0/0.80), Mystic Vulnerability (40.0/0.80), Fleetfoot (35.0/0.70), Mystic Shot (35.0/0.70), Weakening Headshot (35.0/0.70)                                                                                                                                                                                    |
| T3   | (25.0/50.0/75.0/100)             | (Shadow Weave (0.60)/Alchemical Fire (0.90)/Dispel Magic (1.50)/Spirit Rend (2.00)) | Spirit Rend (100/2.00), Counterspell (80.0/1.60), Decay (80.0/1.60), Surge of Power (80.0/1.60), Dispel Magic (75.0/1.50), Disarming Hex (75.0/1.50), Knockdown (75.0/1.50), Silence Wave (75.0/1.50), Metal Skin (65.0/1.30), Warp Stone (60.0/1.20), Rescue Beam (55.0/1.10), Alchemical Fire (45.0/0.90), Healing Nova (45.0/0.90), Weighted Shots (40.0/0.80), Shadow Weave (30.0/0.60)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| T4   | (25.0/50.0/75.0/100)             | (Ricochet (0.60)/Capacitor (1.00)/Inhibitor (1.50)/Cursed Relic (1.90))             | Cursed Relic (95.0/1.90), Cheat Death (90.0/1.80), Plated Armor (85.0/1.70), Unstoppable (85.0/1.70), Silencer (80.0/1.60), Indomitable (80.0/1.60), Spellbreaker (80.0/1.60), Scourge (80.0/1.60), Inhibitor (75.0/1.50), Siphon Bullets (75.0/1.50), Focus Lens (75.0/1.50), Armor Piercing Rounds (70.0/1.40), Juggernaut (70.0/1.40), Witchmail (70.0/1.40), Ethereal Shift (70.0/1.40), Spirit Burn (70.0/1.40), Lightning Scroll (65.0/1.30), Vortex Web (65.0/1.30), Crippling Headshot (60.0/1.20), Phantom Strike (60.0/1.20), Arctic Blast (60.0/1.20), Divine Barrier (55.0/1.10), Capacitor (50.0/1.00), Refresher (50.0/1.00), Crushing Fists (40.0/0.80), Lucky Shot (40.0/0.80), Frenzy (35.0/0.70), Mystic Reverb (35.0/0.70), Ricochet (30.0/0.60), Healing Tempo (30.0/0.60), Echo Shard (30.0/0.60) |
| T?   | (25.0/50.0/75.0/n/a)             | (Runed Gauntlets (0.70)/Electric Slippers (1.00)/Haunting Shot (1.50)/n/a)          | Haunting Shot (95.0/1.50), Cloak of Opportunity (90.0/1.50), Nullification Burst (95.0/1.50), Mystical Piano (85.0/1.50), Prism Blast (75.0/1.50), Unstable Concoction (75.0/1.50), Celestial Blessing (70.0/1.40), Infinite Rounds (65.0/1.30), Frostbite Charm (60.0/1.20), Mystic Conduit (60.0/1.20), Electric Slippers (50.0/1.00), Shrink Ray (50.0/1.00), Runed Gauntlets (35.0/0.70), Eternal Gift (35.0/0.70), Shadow Strike (35.0/0.70)                                                                                                                                                                                                                                                                                                                                                                      |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `damage_sponge`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                         | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                |
|------|----------------------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (23.8/47.5/71.2/95.0)            | (n/a/Extra Health (0.95)/n/a/n/a)                                       | Extra Health (45.0/0.95)                                                                                                                                                                                                                                                                                                                                                                                                    |
| T2   | (23.8/47.5/71.2/95.0)            | (Enchanters Emblem (0.53)/Spirit Shielding (1.05)/n/a/n/a)              | Spirit Shielding (50.0/1.05), Weapon Shielding (50.0/1.05), Return Fire (45.0/0.95), Restorative Locket (40.0/0.84), Battle Vest (35.0/0.74), Bullet Lifesteal (35.0/0.74), Reactive Barrier (35.0/0.74), Spirit Lifesteal (35.0/0.74), Debuff Reducer (30.0/0.63), Enchanters Emblem (25.0/0.53)                                                                                                                           |
| T3   | (23.8/47.5/71.2/95.0)            | (Blood Tribute (0.42)/n/a/n/a/Berserker (2.00))                         | Berserker (95.0/2.00), Fortitude (30.0/0.63), Blood Tribute (20.0/0.42), Majestic Leap (20.0/0.42), Escalating Resilience (17.5/0.37), Fury Trance (17.5/0.37), Bullet Resilience (15.0/0.32), Lifestrike (15.0/0.32), Metal Skin (15.0/0.32), Spirit Resilience (15.0/0.32), Radiant Regeneration (15.0/0.32), Cultist Sacrifice (12.5/0.26), Counterspell (12.5/0.26), Warp Stone (12.5/0.26), Surge of Power (12.5/0.26) |
| T4   | (23.8/47.5/71.2/95.0)            | (Glass Cannon (-0.63)/Frenzy (1.05)/Cheat Death (1.47)/Colossus (2.00)) | Colossus (95.0/2.00), Cheat Death (70.0/1.47), Diviners Kevlar (65.0/1.37), Juggernaut (65.0/1.37), Plated Armor (60.0/1.26), Spellbreaker (55.0/1.16), Frenzy (50.0/1.05), Leech (50.0/1.05), Unstoppable (50.0/1.05), Witchmail (50.0/1.05), Indomitable (40.0/0.84), Scourge (40.0/0.84), Glass Cannon (-30.0/-0.63)                                                                                                     |
| T?   | (23.8/47.5/71.2/n/a)             | (n/a/Eternal Gift (1.05)/Prism Blast (1.47)/n/a)                        | Prism Blast (70.0/1.47), Unstable Concoction (70.0/1.47), Cloak of Opportunity (55.0/1.16), Nullification Burst (55.0/1.16), Eternal Gift (50.0/1.05), Runed Gauntlets (40.0/0.84)                                                                                                                                                                                                                                          |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `debuff`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                             | All Items at Tier (Raw/Norm)                                                                                           |
|------|----------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| T1   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/n/a/n/a)                                           | —                                                                                                                      |
| T2   | (20.0/40.0/60.0/80.0)            | (n/a/Healbane (0.88)/n/a/n/a)                               | Spirit Sap (45.0/1.12), Healbane (35.0/0.88), Suppressor (35.0/0.88)                                                   |
| T3   | (20.0/40.0/60.0/80.0)            | (n/a/Spirit Rend (1.00)/Decay (1.75)/Decay (1.75))          | Decay (70.0/1.75), Disarming Hex (50.0/1.25), Silence Wave (45.0/1.12), Spirit Rend (40.0/1.00), Knockdown (35.0/0.88) |
| T4   | (20.0/40.0/60.0/80.0)            | (n/a/Silencer (0.88)/Focus Lens (1.50)/Cursed Relic (2.00)) | Cursed Relic (80.0/2.00), Focus Lens (60.0/1.50), Inhibitor (55.0/1.38), Spirit Burn (50.0/1.25), Silencer (35.0/0.88) |
| T?   | (20.0/40.0/60.0/n/a)             | (n/a/n/a/Haunting Shot (1.50)/n/a)                          | Haunting Shot (90.0/1.50), Nullification Burst (95.0/1.50), Mystical Piano (80.0/1.50)                                 |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `debuff_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                      | All Items at Tier (Raw/Norm)                                                                                             |
|------|----------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| T1   | (4.17%/8.33%/12.5%/16.7%)        | (n/a/n/a/n/a/n/a)                                                    | —                                                                                                                        |
| T2   | (6.25%/12.5%/18.7%/25.0%)        | (n/a/n/a/n/a/Debuff Reducer (2.00))                                  | Debuff Reducer (25.0%/2.00)                                                                                              |
| T3   | (9.38%/18.8%/28.1%/37.5%)        | (n/a/Weighted Shots (1.17)/Blood Tribute (1.71)/Dispel Magic (1.87)) | Dispel Magic (35.0%/1.87), Blood Tribute (32.0%/1.71), Weighted Shots (22.0%/1.17)                                       |
| T4   | (14.1%/28.1%/42.2%/56.2%)        | (Scourge (0.60)/Frenzy (0.89)/n/a/n/a)                               | Unstoppable (35.0%/1.24), Frenzy (25.0%/0.89), Indomitable (25.0%/0.89), Spellbreaker (25.0%/0.89), Scourge (17.0%/0.60) |
| T?   | (14.1%/28.1%/42.2%/n/a)          | (n/a/n/a/Cloak of Opportunity (1.42)/n/a)                            | Cloak of Opportunity (40.0%/1.42), Nullification Burst (40.0%/1.42)                                                      |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `disarm`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)    | All Items at Tier (Raw/Norm)                         |
|------|----------------------------------|------------------------------------|------------------------------------------------------|
| T1   | (0.44/0.89/1.33/1.78)            | (n/a/n/a/n/a/n/a)                  | —                                                    |
| T2   | (0.67/1.33/2.00/2.67)            | (n/a/n/a/n/a/n/a)                  | —                                                    |
| T3   | (1.00/2.00/3.00/4.00)            | (n/a/n/a/n/a/Disarming Hex (2.00)) | Disarming Hex (4.00/2.00)                            |
| T4   | (1.50/3.00/4.50/6.00)            | (n/a/n/a/n/a/n/a)                  | Phantom Strike (0.26/0.09), Cursed Relic (0.20/0.07) |
| T?   | (1.50/3.00/4.50/n/a)             | (n/a/n/a/n/a/n/a)                  | Mystical Piano (0.45/0.15)                           |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `displace`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*) | All Items at Tier (Raw/Norm) |
|------|----------------------------------|---------------------------------|------------------------------|
| T1   | (6.25/12.5/18.8/25.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T2   | (6.25/12.5/18.8/25.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T3   | (6.25/12.5/18.8/25.0)            | (Knockdown (0.64)/n/a/n/a/n/a)  | Knockdown (8.00/0.64)        |
| T4   | (6.25/12.5/18.8/25.0)            | (n/a/n/a/n/a/Vortex Web (2.00)) | Vortex Web (25.0/2.00)       |
| T?   | (6.25/12.5/18.8/n/a)             | (n/a/n/a/n/a/n/a)               | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `dot`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)     | Staple Items (0.5/1.0/1.5/2.0*)                              | All Items at Tier (Raw/Norm)                                                      |
|------|--------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------|
| T1   | (28.9 dmg/57.8 dmg/86.7 dmg/116 dmg) | (n/a/n/a/n/a/n/a)                                            | —                                                                                 |
| T2   | (43.3 dmg/86.7 dmg/130 dmg/173 dmg)  | (n/a/Stalker (0.98)/n/a/n/a)                                 | Stalker (85.0 dmg/0.98)                                                           |
| T3   | (65.0 dmg/130 dmg/195 dmg/260 dmg)   | (Spirit Rend (0.62)/n/a/Alchemical Fire (1.69)/Decay (2.00)) | Decay (260 dmg/2.00), Alchemical Fire (220 dmg/1.69), Spirit Rend (80.0 dmg/0.62) |
| T4   | (97.5 dmg/195 dmg/292 dmg/390 dmg)   | (Scourge (0.46)/Spirit Burn (1.03)/n/a/n/a)                  | Spirit Burn (200 dmg/1.03), Scourge (90.0 dmg/0.46)                               |
| T?   | (97.5 dmg/195 dmg/292 dmg/n/a)       | (n/a/n/a/n/a/n/a)                                            | —                                                                                 |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `duration_dependant`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                        | All Items at Tier (Raw/Norm)                                                             |
|------|----------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------------|
| T1   | (3.67%/7.33%/11.0%/14.7%)        | (n/a/n/a/n/a/n/a)                                      | —                                                                                        |
| T2   | (5.50%/11.0%/16.5%/22.0%)        | (n/a/Arcane Surge (0.82)/n/a/Duration Extender (2.00)) | Duration Extender (22.0%/2.00), Arcane Surge (9.00%/0.82)                                |
| T3   | (8.25%/16.5%/24.8%/33.0%)        | (n/a/n/a/Superior Duration (1.70)/n/a)                 | Superior Duration (28.0%/1.70)                                                           |
| T4   | (12.4%/24.8%/37.1%/49.5%)        | (Spiritual Overflow (0.61)/n/a/n/a/n/a)                | Spiritual Overflow (15.0%/0.61), Diviners Kevlar (15.0%/0.61), Magic Carpet (15.0%/0.61) |
| T?   | (12.4%/24.8%/37.1%/n/a)          | (n/a/n/a/n/a/n/a)                                      | —                                                                                        |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `engage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                 | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                      |
|------|----------------------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (22.5/45.0/67.5/90.0)            | (n/a/Rebuttal (1.00)/Melee Lifesteal (1.44)/n/a)                | Melee Lifesteal (65.0/1.44), Close Quarters (50.0/1.11), Spirit Strike (50.0/1.11), Rebuttal (45.0/1.00)                                                                                                                                                                                                                                                          |
| T2   | (22.5/45.0/67.5/90.0)            | (n/a/Fleetfoot (0.89)/Melee Charge (1.44)/n/a)                  | Melee Charge (65.0/1.44), Stalker (60.0/1.33), Cold Front (60.0/1.33), Opening Rounds (50.0/1.11), Arcane Surge (50.0/1.11), Slowing Hex (50.0/1.11), Fleetfoot (40.0/0.89), Return Fire (35.0/0.78)                                                                                                                                                              |
| T3   | (22.5/45.0/67.5/90.0)            | (n/a/Heroic Aura (1.11)/Point Blank (1.56)/Shadow Weave (1.89)) | Shadow Weave (85.0/1.89), Lifestrike (75.0/1.67), Point Blank (70.0/1.56), Stamina Mastery (65.0/1.44), Spirit Snatch (60.0/1.33), Veil Walker (55.0/1.22), Heroic Aura (50.0/1.11), Warp Stone (50.0/1.11), Knockdown (50.0/1.11), Burst Fire (35.0/0.78), Majestic Leap (35.0/0.78)                                                                             |
| T4   | (22.5/45.0/67.5/90.0)            | (n/a/Frenzy (1.00)/Unstoppable (1.56)/Phantom Strike (2.00))    | Phantom Strike (90.0/2.00), Crushing Fists (80.0/1.78), Colossus (80.0/1.78), Vortex Web (80.0/1.78), Unstoppable (70.0/1.56), Arctic Blast (65.0/1.44), Vampiric Burst (55.0/1.22), Diviners Kevlar (50.0/1.11), Juggernaut (50.0/1.11), Cursed Relic (50.0/1.11), Scourge (50.0/1.11), Frenzy (45.0/1.00), Spellslinger (35.0/0.78), Divine Barrier (35.0/0.78) |
| T?   | (22.5/45.0/67.5/n/a)             | (n/a/Celestial Blessing (1.22)/Runed Gauntlets (1.50)/n/a)      | Runed Gauntlets (75.0/1.50), Electric Slippers (75.0/1.50), Nullification Burst (80.0/1.50), Seraphim Wings (70.0/1.50), Shadow Strike (95.0/1.50), Mystical Piano (90.0/1.50), Prism Blast (75.0/1.50), Unstable Concoction (95.0/1.50), Frostbite Charm (65.0/1.44), Cloak of Opportunity (60.0/1.33), Shrink Ray (60.0/1.33), Celestial Blessing (55.0/1.22)   |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `escape`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                     | All Items at Tier (Raw/Norm)                                                                                                                                                                            |
|------|----------------------------------|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (26.2/52.5/78.8/105)             | (Extra Stamina (0.67)/Grit (0.76)/n/a/n/a)                          | Grit (40.0/0.76), Sprint Boots (40.0/0.76), Extra Stamina (35.0/0.67)                                                                                                                                   |
| T2   | (26.2/52.5/78.8/105)             | (n/a/Enduring Speed (1.05)/n/a/n/a)                                 | Fleetfoot (60.0/1.14), Enduring Speed (55.0/1.05), Guardian Ward (45.0/0.86), Reactive Barrier (40.0/0.76)                                                                                              |
| T3   | (26.2/52.5/78.8/105)             | (n/a/Shadow Weave (1.05)/Veil Walker (1.52)/Stamina Mastery (2.00)) | Stamina Mastery (105/2.00), Warp Stone (85.0/1.62), Veil Walker (80.0/1.52), Majestic Leap (65.0/1.24), Shadow Weave (55.0/1.05), Dispel Magic (55.0/1.05)                                              |
| T4   | (26.2/52.5/78.8/105)             | (n/a/Divine Barrier (0.95)/n/a/Ethereal Shift (1.81))               | Ethereal Shift (95.0/1.81), Magic Carpet (95.0/1.81), Cheat Death (65.0/1.24), Juggernaut (60.0/1.14), Unstoppable (60.0/1.14), Divine Barrier (50.0/0.95), Indomitable (45.0/0.86)                     |
| T?   | (26.2/52.5/78.8/n/a)             | (n/a/Electric Slippers (1.05)/Cloak of Opportunity (1.50)/n/a)      | Cloak of Opportunity (80.0/1.50), Prism Blast (90.0/1.50), Shrink Ray (80.0/1.50), Seraphim Wings (75.0/1.43), Celestial Blessing (65.0/1.24), Shadow Strike (65.0/1.24), Electric Slippers (55.0/1.05) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `farmer`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                          | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                    |
|------|----------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (25.0/50.0/75.0/100)             | (Extra Stamina (0.60)/Extended Magazine (1.00)/Monster Rounds (1.60)/n/a)                | Monster Rounds (80.0/1.60), Golden Goose Egg (60.0/1.20), Extended Magazine (50.0/1.00), Mystic Regeneration (45.0/0.90), Extra Regen (40.0/0.80), Sprint Boots (40.0/0.80), Restorative Shot (35.0/0.70), Extra Stamina (30.0/0.60)                                                            |
| T2   | (25.0/50.0/75.0/100)             | (Healing Booster (0.60)/Intensifying Magazine (1.00)/n/a/n/a)                            | Intensifying Magazine (50.0/1.00), Swift Striker (50.0/1.00), Split Shot (45.0/0.90), Active Reload (35.0/0.70), Enduring Speed (35.0/0.70), Healing Booster (30.0/0.60)                                                                                                                        |
| T3   | (25.0/50.0/75.0/100)             | (Rescue Beam (0.40)/Shadow Weave (1.00)/Stamina Mastery (1.70)/Cultist Sacrifice (2.00)) | Cultist Sacrifice (100/2.00), Stamina Mastery (85.0/1.70), Surge of Power (65.0/1.30), Shadow Weave (50.0/1.00), Spirit Rend (50.0/1.00), Alchemical Fire (45.0/0.90), Rapid Recharge (40.0/0.80), Ballistic Enchantment (35.0/0.70), Radiant Regeneration (30.0/0.60), Rescue Beam (20.0/0.40) |
| T4   | (25.0/50.0/75.0/100)             | (Juggernaut (0.60)/Spirit Burn (1.00)/n/a/n/a)                                           | Ricochet (60.0/1.20), Magic Carpet (60.0/1.20), Spirit Burn (50.0/1.00), Glass Cannon (45.0/0.90), Healing Tempo (45.0/0.90), Juggernaut (30.0/0.60)                                                                                                                                            |
| T?   | (25.0/50.0/75.0/n/a)             | (n/a/Shrink Ray (1.00)/Eternal Gift (1.40)/n/a)                                          | Eternal Gift (70.0/1.40), Shrink Ray (50.0/1.00)                                                                                                                                                                                                                                                |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `fire_rate`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                           | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                        |
|------|----------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (3.33%/6.67%/10.0%/13.3%)        | (n/a/n/a/Rapid Rounds (1.35)/n/a)                                         | Rapid Rounds (9.00%/1.35)                                                                                                                                                                                                                                                                           |
| T2   | (5.00%/10.0%/15.0%/20.0%)        | (Quicksilver Reload (0.50)/n/a/Active Reload (1.50)/Swift Striker (2.00)) | Swift Striker (20.0%/2.00), Active Reload (15.0%/1.50), Kinetic Dash (13.0%/1.30), Quicksilver Reload (5.00%/0.50), Battle Vest (4.00%/0.40)                                                                                                                                                        |
| T3   | (7.50%/15.0%/22.5%/30.0%)        | (Surge of Power (0.53)/Heroic Aura (0.87)/Blood Tribute (1.67)/n/a)       | Blood Tribute (25.0%/1.67), Burst Fire (20.0%/1.33), Heroic Aura (13.0%/0.87), Fury Trance (11.0%/0.73), Surge of Power (8.00%/0.53), Shadow Weave (3.00%/0.20)                                                                                                                                     |
| T4   | (11.2%/22.5%/33.8%/45.0%)        | (Mercurial Magnum (0.49)/Healing Tempo (0.93)/n/a/Spellslinger (1.96))    | Spellslinger (44.0%/1.96), Frenzy (40.0%/1.78), Glass Cannon (28.0%/1.24), Healing Tempo (21.0%/0.93), Spiritual Overflow (19.0%/0.84), Ricochet (18.0%/0.80), Mercurial Magnum (11.0%/0.49), Focus Lens (10.0%/0.44), Vampiric Burst (6.00%/0.27), Capacitor (5.00%/0.22), Echo Shard (5.00%/0.22) |
| T?   | (11.2%/22.5%/33.8%/n/a)          | (Eternal Gift (0.53)/Electric Slippers (1.07)/Infinite Rounds (1.50)/n/a) | Infinite Rounds (35.0%/1.50), Electric Slippers (24.0%/1.07), Shrink Ray (14.0%/0.62), Eternal Gift (12.0%/0.53)                                                                                                                                                                                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `fire_rate_slow`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)    | All Items at Tier (Raw/Norm) |
|------|----------------------------------|------------------------------------|------------------------------|
| T1   | (5.00%/10.0%/15.0%/20.0%)        | (n/a/n/a/Rusted Barrel (1.50)/n/a) | Rusted Barrel (15.0%/1.50)   |
| T2   | (7.50%/15.0%/22.5%/30.0%)        | (n/a/n/a/n/a/Suppressor (2.00))    | Suppressor (30.0%/2.00)      |
| T3   | (11.2%/22.5%/33.8%/45.0%)        | (n/a/Hunters Aura (1.11)/n/a/n/a)  | Hunters Aura (25.0%/1.11)    |
| T4   | (16.9%/33.8%/50.6%/67.5%)        | (n/a/n/a/Juggernaut (1.42)/n/a)    | Juggernaut (48.0%/1.42)      |
| T?   | (16.9%/33.8%/50.6%/n/a)          | (n/a/n/a/n/a/n/a)                  | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `grounded`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                        | All Items at Tier (Raw/Norm)                                                                             |
|------|----------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| T1   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/Close Quarters (1.40)/Melee Lifesteal (1.80)) | Melee Lifesteal (45.0/1.80), Rebuttal (40.0/1.60), Spirit Strike (40.0/1.60), Close Quarters (35.0/1.40) |
| T2   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/Melee Charge (1.80))                      | Melee Charge (45.0/1.80)                                                                                 |
| T3   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/Weighted Shots (1.40)/Point Blank (2.00))     | Point Blank (50.0/2.00), Lifestrike (50.0/2.00), Spirit Snatch (45.0/1.80), Weighted Shots (35.0/1.40)   |
| T4   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/Phantom Strike (1.40)/Crushing Fists (2.00))  | Crushing Fists (50.0/2.00), Colossus (50.0/2.00), Phantom Strike (35.0/1.40), Arctic Blast (35.0/1.40)   |
| T?   | (12.5/25.0/37.5/n/a)             | (n/a/n/a/Runed Gauntlets (1.50)/n/a)                   | Runed Gauntlets (50.0/1.50), Seraphim Wings (-50.0/-1.50), Shadow Strike (50.0/1.50)                     |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_burst_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)      | Staple Items (0.5/1.0/1.5/2.0*)                                                             | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|------|---------------------------------------|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (16.7 dmg/33.3 dmg/50.0 dmg/66.7 dmg) | (Extended Magazine (0.45)/Rapid Rounds (1.20)/n/a/n/a)                                      | Rapid Rounds (40.0 dmg/1.20), Close Quarters (20.0 dmg/0.60), Extended Magazine (15.0 dmg/0.45), High-Velocity Rounds (15.0 dmg/0.45)                                                                                                                                                                                                                                                                                                                                                                                                        |
| T2   | (25.0 dmg/50.0 dmg/75.0 dmg/100 dmg)  | (Intensifying Magazine (0.50)/Opening Rounds (1.00)/Split Shot (1.40)/Swift Striker (2.00)) | Swift Striker (100 dmg/2.00), Split Shot (70.0 dmg/1.40), Active Reload (60.0 dmg/1.20), Kinetic Dash (55.0 dmg/1.10), Opening Rounds (50.0 dmg/1.00), Return Fire (40.0 dmg/0.80), Battle Vest (35.0 dmg/0.70), Intensifying Magazine (25.0 dmg/0.50), Long Range (25.0 dmg/0.50)                                                                                                                                                                                                                                                           |
| T3   | (37.5 dmg/75.0 dmg/112 dmg/150 dmg)   | (Sharpshooter (0.47)/Shadow Weave (0.93)/Express Shot (1.47)/n/a)                           | Express Shot (110 dmg/1.47), Shadow Weave (70.0 dmg/0.93), Headhunter (60.0 dmg/0.80), Sharpshooter (35.0 dmg/0.47), Blood Tribute (30.0 dmg/0.40), Point Blank (30.0 dmg/0.40), Burst Fire (28.0 dmg/0.37), Weighted Shots (28.0 dmg/0.37), Berserker (25.0 dmg/0.33), Spirit Rend (20.0 dmg/0.27), Escalating Resilience (18.0 dmg/0.24), Heroic Aura (18.0 dmg/0.24), Hollow Point (18.0 dmg/0.24), Ballistic Enchantment (16.0 dmg/0.21), Cultist Sacrifice (16.0 dmg/0.21), Fury Trance (16.0 dmg/0.21), Surge of Power (9.00 dmg/0.12) |
| T4   | (56.2 dmg/112 dmg/169 dmg/225 dmg)    | (Armor Piercing Rounds (0.58)/Lucky Shot (0.98)/Spellslinger (1.42)/Glass Cannon (1.96))    | Glass Cannon (220 dmg/1.96), Spellslinger (160 dmg/1.42), Ricochet (150 dmg/1.33), Spiritual Overflow (130 dmg/1.16), Mercurial Magnum (130 dmg/1.16), Lucky Shot (110 dmg/0.98), Vampiric Burst (95.0 dmg/0.84), Frenzy (90.0 dmg/0.80), Leech (70.0 dmg/0.62), Armor Piercing Rounds (65.0 dmg/0.58)                                                                                                                                                                                                                                       |
| T?   | (56.2 dmg/112 dmg/169 dmg/n/a)        | (n/a/Seraphim Wings (0.89)/Infinite Rounds (1.50)/n/a)                                      | Infinite Rounds (180 dmg/1.50), Unstable Concoction (220 dmg/1.50), Seraphim Wings (100 dmg/0.89), Haunting Shot (95.0 dmg/0.84)                                                                                                                                                                                                                                                                                                                                                                                                             |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_burst_proc`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                         | All Items at Tier (Raw/Norm)                                                                                                        |
|------|----------------------------------|-------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (0.33/0.65/0.98/1.30)            | (Headshot Booster (0.31)/n/a/n/a/n/a)                                   | Headshot Booster (0.20/0.31), Restorative Shot (0.15/0.23)                                                                          |
| T2   | (0.33/0.65/0.98/1.30)            | (n/a/n/a/n/a/n/a)                                                       | —                                                                                                                                   |
| T3   | (0.33/0.65/0.98/1.30)            | (Escalating Resilience (0.46)/n/a/Headhunter (1.54)/Spirit Rend (2.00)) | Spirit Rend (1.30/2.00), Express Shot (1.20/1.85), Headhunter (1.00/1.54), Berserker (0.40/0.62), Escalating Resilience (0.30/0.46) |
| T4   | (0.33/0.65/0.98/1.30)            | (Mercurial Magnum (0.54)/n/a/n/a/n/a)                                   | Mercurial Magnum (0.35/0.54), Armor Piercing Rounds (0.30/0.46), Lucky Shot (0.30/0.46)                                             |
| T?   | (0.33/0.65/0.98/n/a)             | (Infinite Rounds (0.62)/n/a/n/a/n/a)                                    | Infinite Rounds (0.40/0.62)                                                                                                         |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_burst_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                      | All Items at Tier (Raw/Norm)                                                                                 |
|------|----------------------------------|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| T1   | (6.67%/13.3%/20.0%/26.7%)        | (n/a/n/a/n/a/n/a)                                    | —                                                                                                            |
| T2   | (10.0%/20.0%/30.0%/40.0%)        | (n/a/n/a/n/a/Weapon Shielding (2.00))                | Weapon Shielding (40.0%/2.00)                                                                                |
| T3   | (15.0%/30.0%/45.0%/60.0%)        | (Bullet Resilience (0.50)/n/a/n/a/Metal Skin (2.00)) | Metal Skin (60.0%/2.00), Bullet Resilience (15.0%/0.50), Warp Stone (12.0%/0.40), Disarming Hex (8.00%/0.27) |
| T4   | (22.5%/45.0%/67.5%/90.0%)        | (Plated Armor (0.40)/n/a/n/a/n/a)                    | Plated Armor (18.0%/0.40)                                                                                    |
| T?   | (22.5%/45.0%/67.5%/n/a)          | (n/a/n/a/n/a/n/a)                                    | —                                                                                                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_continuous_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)      | Staple Items (0.5/1.0/1.5/2.0*)                                                | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------|---------------------------------------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (16.3 dmg/32.6 dmg/48.9 dmg/65.2 dmg) | (High-Velocity Rounds (0.46)/Extended Magazine (0.92)/n/a/n/a)                 | Extended Magazine (30.0 dmg/0.92), Close Quarters (20.0 dmg/0.61), High-Velocity Rounds (15.0 dmg/0.46), Rapid Rounds (10.0 dmg/0.31)                                                                                                                                                                                                                                                                                                                |
| T2   | (24.4 dmg/48.9 dmg/73.3 dmg/97.8 dmg) | (Recharging Rush (0.51)/n/a/Intensifying Magazine (1.43)/n/a)                  | Swift Striker (80.0 dmg/1.64), Intensifying Magazine (70.0 dmg/1.43), Long Range (35.0 dmg/0.72), Split Shot (35.0 dmg/0.72), Opening Rounds (30.0 dmg/0.61), Recharging Rush (25.0 dmg/0.51), Active Reload (20.0 dmg/0.41), Battle Vest (20.0 dmg/0.41), Fleetfoot (15.0 dmg/0.31)                                                                                                                                                                 |
| T3   | (36.7 dmg/73.3 dmg/110 dmg/147 dmg)   | (Sharpshooter (0.48)/Spirit Rend (0.82)/n/a/n/a)                               | Spirit Rend (60.0 dmg/0.82), Sharpshooter (35.0 dmg/0.48), Point Blank (30.0 dmg/0.41), Berserker (28.0 dmg/0.38), Weighted Shots (28.0 dmg/0.38), Escalating Resilience (25.0 dmg/0.34), Hollow Point (18.0 dmg/0.25), Ballistic Enchantment (16.0 dmg/0.22), Cultist Sacrifice (16.0 dmg/0.22), Shadow Weave (15.0 dmg/0.20), Blood Tribute (14.0 dmg/0.19), Burst Fire (8.00 dmg/0.11), Express Shot (8.00 dmg/0.11), Fury Trance (7.00 dmg/0.10) |
| T4   | (55.0 dmg/110 dmg/165 dmg/220 dmg)    | (Mercurial Magnum (0.55)/Glass Cannon (1.00)/n/a/Armor Piercing Rounds (2.00)) | Armor Piercing Rounds (220 dmg/2.00), Lucky Shot (200 dmg/1.82), Glass Cannon (110 dmg/1.00), Ricochet (90.0 dmg/0.82), Spellslinger (90.0 dmg/0.82), Leech (70.0 dmg/0.64), Siphon Bullets (65.0 dmg/0.59), Mercurial Magnum (60.0 dmg/0.55), Spiritual Overflow (50.0 dmg/0.45), Vampiric Burst (50.0 dmg/0.45), Crushing Fists (40.0 dmg/0.36), Frenzy (30.0 dmg/0.27)                                                                            |
| T?   | (55.0 dmg/110 dmg/165 dmg/n/a)        | (n/a/n/a/Infinite Rounds (1.50)/n/a)                                           | Infinite Rounds (280 dmg/1.50)                                                                                                                                                                                                                                                                                                                                                                                                                       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_continuous_proc`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                               | All Items at Tier (Raw/Norm)                                                                                                                             |
|------|----------------------------------|---------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (0.33/0.65/0.98/1.30)            | (n/a/n/a/n/a/n/a)                                             | —                                                                                                                                                        |
| T2   | (0.33/0.65/0.98/1.30)            | (Slowing Bullets (0.31)/n/a/n/a/n/a)                          | Slowing Bullets (0.20/0.31), Spirit Shredder Bullets (0.20/0.31)                                                                                         |
| T3   | (0.33/0.65/0.98/1.30)            | (Hollow Point (0.62)/Berserker (0.77)/n/a/Spirit Rend (2.00)) | Spirit Rend (1.30/2.00), Berserker (0.50/0.77), Escalating Resilience (0.50/0.77), Weighted Shots (0.45/0.69), Hollow Point (0.40/0.62)                  |
| T4   | (0.33/0.65/0.98/1.30)            | (Siphon Bullets (0.46)/Armor Piercing Rounds (0.85)/n/a/n/a)  | Armor Piercing Rounds (0.55/0.85), Lucky Shot (0.55/0.85), Siphon Bullets (0.30/0.46), Ricochet (0.20/0.31), Silencer (0.20/0.31), Inhibitor (0.20/0.31) |
| T?   | (0.33/0.65/0.98/n/a)             | (n/a/Infinite Rounds (1.00)/n/a/n/a)                          | Infinite Rounds (0.65/1.00)                                                                                                                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `gun_continuous_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                      | All Items at Tier (Raw/Norm)                                                                                   |
|------|----------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| T1   | (3.89%/7.78%/11.7%/15.6%)        | (n/a/n/a/n/a/n/a)                                                    | —                                                                                                              |
| T2   | (5.83%/11.7%/17.5%/23.3%)        | (n/a/n/a/n/a/n/a)                                                    | —                                                                                                              |
| T3   | (8.75%/17.5%/26.2%/35.0%)        | (Hunters Aura (0.57)/n/a/Bullet Resilience (1.43)/Metal Skin (2.00)) | Metal Skin (35.0%/2.00), Bullet Resilience (25.0%/1.43), Disarming Hex (12.0%/0.69), Hunters Aura (10.0%/0.57) |
| T4   | (13.1%/26.2%/39.4%/52.5%)        | (Plated Armor (0.69)/n/a/n/a/n/a)                                    | Plated Armor (18.0%/0.69)                                                                                      |
| T?   | (13.1%/26.2%/39.4%/n/a)          | (n/a/n/a/n/a/n/a)                                                    | —                                                                                                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `headshot_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                 | All Items at Tier (Raw/Norm)                                                                            |
|------|----------------------------------|-----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| T1   | (13.8%/27.5%/41.2%/55.0%)        | (High-Velocity Rounds (0.73)/n/a/n/a/Headshot Booster (2.00))   | Headshot Booster (55.0%/2.00), High-Velocity Rounds (20.0%/0.73)                                        |
| T2   | (20.6%/41.2%/61.9%/82.5%)        | (n/a/n/a/Weakening Headshot (1.33)/n/a)                         | Weakening Headshot (55.0%/1.33)                                                                         |
| T3   | (30.9%/61.9%/92.8%/124%)         | (Express Shot (0.65)/Sharpshooter (0.89)/Headhunter (1.37)/n/a) | Headhunter (85.0%/1.37), Sharpshooter (55.0%/0.89), Spirit Rend (50.0%/0.81), Express Shot (40.0%/0.65) |
| T4   | (46.4%/92.8%/139%/186%)          | (n/a/Crippling Headshot (0.81)/n/a/n/a)                         | Crippling Headshot (75.0%/0.81)                                                                         |
| T?   | (46.4%/92.8%/139%/n/a)           | (n/a/n/a/n/a/n/a)                                               | —                                                                                                       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `high_assist_count`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)  | All Items at Tier (Raw/Norm) |
|------|----------------------------------|----------------------------------|------------------------------|
| T1   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T2   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T3   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/Heroic Aura (2.00)) | Heroic Aura (50.0/2.00)      |
| T4   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                | —                            |
| T?   | (12.5/25.0/37.5/n/a)             | (n/a/n/a/n/a/n/a)                | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `high_kill_count`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)        | All Items at Tier (Raw/Norm)  |
|------|----------------------------------|----------------------------------------|-------------------------------|
| T1   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                      | —                             |
| T2   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/Healbane (1.43)/n/a)          | Healbane (50.0/1.43)          |
| T3   | (17.5/35.0/52.5/70.0)            | (n/a/Cultist Sacrifice (0.86)/n/a/n/a) | Cultist Sacrifice (30.0/0.86) |
| T4   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/Glass Cannon (2.00))      | Glass Cannon (70.0/2.00)      |
| T?   | (17.5/35.0/52.5/n/a)             | (n/a/n/a/n/a/n/a)                      | —                             |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `high_max_hp`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                   | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|------|----------------------------------|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (57.2 HP/114 HP/172 HP/229 HP)   | (Rusted Barrel (0.52)/Rebuttal (0.82)/n/a/Extra Health (2.00))                    | Extra Health (229 HP/2.00), Rebuttal (94.0 HP/0.82), Rusted Barrel (60.0 HP/0.52), Mystic Regeneration (50.0 HP/0.44), Headshot Booster (30.0 HP/0.26), Grit (27.0 HP/0.24), Extra Regen (19.0 HP/0.17), Extra Stamina (19.0 HP/0.17), Healing Rite (19.0 HP/0.17), Melee Lifesteal (19.0 HP/0.17), Sprint Boots (19.0 HP/0.17)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| T2   | (85.9 HP/172 HP/258 HP/344 HP)   | (Weakening Headshot (0.35)/n/a/n/a/n/a)                                           | Bullet Lifesteal (112 HP/0.65), Debuff Reducer (112 HP/0.65), Spirit Lifesteal (112 HP/0.65), Weakening Headshot (60.0 HP/0.35), Weapon Shielding (55.0 HP/0.32), Stalker (50.0 HP/0.29), Spirit Shielding (50.0 HP/0.29), Mystic Slow (50.0 HP/0.29), Spirit Sap (50.0 HP/0.29), Reactive Barrier (35.0 HP/0.20), Battle Vest (22.0 HP/0.13), Enchanters Emblem (22.0 HP/0.13), Enduring Speed (22.0 HP/0.13), Guardian Ward (22.0 HP/0.13), Healbane (22.0 HP/0.13), Healing Booster (22.0 HP/0.13), Restorative Locket (22.0 HP/0.13), Return Fire (22.0 HP/0.13)                                                                                                                                                                                                                                                                                                           |
| T3   | (129 HP/258 HP/386 HP/515 HP)    | (Fury Trance (0.50)/n/a/Fortitude (1.57)/n/a)                                     | Fortitude (404 HP/1.57), Cultist Sacrifice (160 HP/0.62), Lifestrike (154 HP/0.60), Veil Walker (154 HP/0.60), Surge of Power (150 HP/0.58), Fury Trance (129 HP/0.50), Hollow Point (125 HP/0.49), Hunters Aura (100 HP/0.39), Radiant Regeneration (99.0 HP/0.38), Counterspell (79.0 HP/0.31), Escalating Resilience (75.0 HP/0.29), Point Blank (75.0 HP/0.29), Spirit Rend (75.0 HP/0.29), Disarming Hex (75.0 HP/0.29), Knockdown (75.0 HP/0.29), Spirit Snatch (75.0 HP/0.29), Decay (65.0 HP/0.25), Stamina Mastery (58.0 HP/0.23), Headhunter (50.0 HP/0.19), Silence Wave (50.0 HP/0.19), Blood Tribute (30.0 HP/0.12), Bullet Resilience (29.0 HP/0.11), Dispel Magic (29.0 HP/0.11), Healing Nova (29.0 HP/0.11), Majestic Leap (29.0 HP/0.11), Metal Skin (29.0 HP/0.11), Rescue Beam (29.0 HP/0.11), Spirit Resilience (29.0 HP/0.11), Warp Stone (29.0 HP/0.11) |
| T4   | (193 HP/386 HP/580 HP/773 HP)    | (Inhibitor (0.46)/n/a/n/a/n/a)                                                    | Cheat Death (254 HP/0.66), Leech (209 HP/0.54), Inhibitor (179 HP/0.46), Frenzy (160 HP/0.41), Plated Armor (159 HP/0.41), Colossus (154 HP/0.40), Unstoppable (154 HP/0.40), Infuser (129 HP/0.33), Vampiric Burst (129 HP/0.33), Crippling Headshot (125 HP/0.32), Magic Carpet (125 HP/0.32), Spellbreaker (119 HP/0.31), Diviners Kevlar (100 HP/0.26), Siphon Bullets (100 HP/0.26), Scourge (100 HP/0.26), Spiritual Overflow (90.0 HP/0.23), Boundless Spirit (75.0 HP/0.19), Glass Cannon (-65.0 HP/-0.17), Indomitable (60.0 HP/0.16), Lightning Scroll (50.0 HP/0.13), Divine Barrier (29.0 HP/0.08), Healing Tempo (29.0 HP/0.08), Juggernaut (29.0 HP/0.08), Phantom Strike (29.0 HP/0.08), Witchmail (29.0 HP/0.08)                                                                                                                                               |
| T?   | (193 HP/386 HP/580 HP/n/a)       | (Cloak of Opportunity (0.26)/Shadow Strike (0.91)/Unstable Concoction (1.50)/n/a) | Unstable Concoction (600 HP/1.50), Shadow Strike (350 HP/0.91), Nullification Burst (300 HP/0.78), Cloak of Opportunity (100 HP/0.26), Eternal Gift (100 HP/0.26)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `horizontal_mobility`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)      | Staple Items (0.5/1.0/1.5/2.0*)                                                        | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|------|---------------------------------------|----------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (0.35 m/s/0.70 m/s/1.05 m/s/1.40 m/s) | (Rusted Barrel (0.50)/Golden Goose Egg (1.00)/Healing Rite (1.43)/Sprint Boots (2.00)) | Sprint Boots (1.40 m/s/2.00), Healing Rite (1.00 m/s/1.43), Golden Goose Egg (0.70 m/s/1.00), Extra Stamina (0.65 m/s/0.93), Rusted Barrel (0.35 m/s/0.50)                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| T2   | (0.52 m/s/1.05 m/s/1.57 m/s/2.10 m/s) | (Long Range (0.48)/Stalker (1.14)/Enduring Speed (1.33)/n/a)                           | Enduring Speed (1.40 m/s/1.33), Fleetfoot (1.30 m/s/1.24), Stalker (1.20 m/s/1.14), Kinetic Dash (0.70 m/s/0.67), Arcane Surge (0.65 m/s/0.62), Long Range (0.50 m/s/0.48), Swift Striker (0.50 m/s/0.48), Mystic Slow (0.50 m/s/0.48), Active Reload (0.40 m/s/0.38), Guardian Ward (0.40 m/s/0.38), Slowing Hex (0.35 m/s/0.33)                                                                                                                                                                                                                                                               |
| T3   | (0.79 m/s/1.57 m/s/2.36 m/s/3.15 m/s) | (Heroic Aura (0.63)/Warp Stone (0.95)/Stamina Mastery (1.52)/Shadow Weave (1.90))      | Shadow Weave (3.00 m/s/1.90), Veil Walker (2.50 m/s/1.59), Stamina Mastery (2.40 m/s/1.52), Warp Stone (1.50 m/s/0.95), Blood Tribute (1.40 m/s/0.89), Heroic Aura (1.00 m/s/0.63), Burst Fire (0.50 m/s/0.32), Headhunter (0.50 m/s/0.32), Weighted Shots (-0.50 m/s/-0.32), Dispel Magic (0.50 m/s/0.32), Surge of Power (0.50 m/s/0.32), Hunters Aura (0.40 m/s/0.25), Counterspell (0.40 m/s/0.25), Fortitude (0.40 m/s/0.25), Metal Skin (-0.40 m/s/-0.25), Rescue Beam (0.40 m/s/0.25), Disarming Hex (0.40 m/s/0.25), Radiant Regeneration (0.40 m/s/0.25), Sharpshooter (0.00 m/s/0.00) |
| T4   | (1.18 m/s/2.36 m/s/3.54 m/s/4.72 m/s) | (Divine Barrier (0.42)/Frenzy (1.06)/n/a/n/a)                                          | Frenzy (2.50 m/s/1.06), Juggernaut (2.50 m/s/1.06), Magic Carpet (2.50 m/s/1.06), Phantom Strike (1.50 m/s/0.63), Divine Barrier (1.00 m/s/0.42), Healing Tempo (0.75 m/s/0.32), Lightning Scroll (0.75 m/s/0.32), Vortex Web (0.75 m/s/0.32), Ethereal Shift (0.40 m/s/0.17)                                                                                                                                                                                                                                                                                                                   |
| T?   | (1.18 m/s/2.36 m/s/3.54 m/s/n/a)      | (Celestial Blessing (0.42)/Electric Slippers (1.06)/Seraphim Wings (1.48)/n/a)         | Seraphim Wings (3.50 m/s/1.48), Shrink Ray (3.50 m/s/1.48), Electric Slippers (2.50 m/s/1.06), Unstable Concoction (1.60 m/s/0.68), Cloak of Opportunity (1.50 m/s/0.63), Celestial Blessing (1.00 m/s/0.42)                                                                                                                                                                                                                                                                                                                                                                                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `hybrid_damage_usage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                         | All Items at Tier (Raw/Norm)                                                                                                                                                          |
|------|----------------------------------|---------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (25.0/50.0/75.0/100)             | (n/a/n/a/n/a/n/a)                                       | —                                                                                                                                                                                     |
| T2   | (25.0/50.0/75.0/100)             | (n/a/Recharging Rush (1.00)/Mystic Shot (1.50)/n/a)     | Mystic Shot (75.0/1.50), Bullet Resist Shredder (70.0/1.40), Quicksilver Reload (70.0/1.40), Spirit Shredder Bullets (60.0/1.20), Recharging Rush (50.0/1.00), Suppressor (50.0/1.00) |
| T3   | (25.0/50.0/75.0/100)             | (n/a/Surge of Power (1.10)/n/a/Spirit Rend (2.00))      | Spirit Rend (100/2.00), Surge of Power (55.0/1.10)                                                                                                                                    |
| T4   | (25.0/50.0/75.0/100)             | (n/a/Crippling Headshot (1.00)/Spellslinger (1.40)/n/a) | Mercurial Magnum (85.0/1.70), Spiritual Overflow (80.0/1.60), Leech (80.0/1.60), Spellslinger (70.0/1.40), Crippling Headshot (50.0/1.00)                                             |
| T?   | (25.0/50.0/75.0/n/a)             | (n/a/n/a/n/a/n/a)                                       | —                                                                                                                                                                                     |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `interrupt`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                 | All Items at Tier (Raw/Norm)                                               |
|------|----------------------------------|-------------------------------------------------|----------------------------------------------------------------------------|
| T1   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/n/a)                               | —                                                                          |
| T2   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/n/a)                               | —                                                                          |
| T3   | (18.8/37.5/56.2/75.0)            | (Majestic Leap (0.27)/n/a/Knockdown (1.60)/n/a) | Knockdown (60.0/1.60), Silence Wave (50.0/1.33), Majestic Leap (10.0/0.27) |
| T4   | (18.8/37.5/56.2/75.0)            | (n/a/n/a/n/a/Cursed Relic (2.00))               | Cursed Relic (75.0/2.00)                                                   |
| T?   | (18.8/37.5/56.2/n/a)             | (n/a/n/a/n/a/n/a)                               | —                                                                          |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `large_hitbox`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*) | All Items at Tier (Raw/Norm) |
|------|----------------------------------|---------------------------------|------------------------------|
| T1   | (15.0/30.0/45.0/60.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T2   | (15.0/30.0/45.0/60.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T3   | (15.0/30.0/45.0/60.0)            | (Fortitude (0.42)/n/a/n/a/n/a)  | Fortitude (12.5/0.42)        |
| T4   | (15.0/30.0/45.0/60.0)            | (n/a/n/a/n/a/Colossus (2.00))   | Colossus (60.0/2.00)         |
| T?   | (15.0/30.0/45.0/n/a)             | (n/a/n/a/n/a/n/a)               | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `long_range`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                        | All Items at Tier (Raw/Norm)                                                                                                                                                                                                        |
|------|----------------------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (22.5/45.0/67.5/90.0)            | (n/a/High-Velocity Rounds (0.89)/n/a/n/a)                              | High-Velocity Rounds (40.0/0.89)                                                                                                                                                                                                    |
| T2   | (22.5/45.0/67.5/90.0)            | (Opening Rounds (0.67)/n/a/Long Range (1.56)/n/a)                      | Long Range (70.0/1.56), Opening Rounds (30.0/0.67)                                                                                                                                                                                  |
| T3   | (22.5/45.0/67.5/90.0)            | (Decay (0.49)/Lifestrike (-1.00)/Knockdown (1.33)/Sharpshooter (2.00)) | Sharpshooter (90.0/2.00), Knockdown (60.0/1.33), Express Shot (50.0/1.11), Silence Wave (50.0/1.11), Lifestrike (-45.0/-1.00), Point Blank (-40.0/-0.89), Disarming Hex (35.0/0.78), Spirit Snatch (-35.0/-0.78), Decay (22.0/0.49) |
| T4   | (22.5/45.0/67.5/90.0)            | (n/a/Crushing Fists (-0.89)/n/a/n/a)                                   | Crushing Fists (-40.0/-0.89), Armor Piercing Rounds (35.0/0.78)                                                                                                                                                                     |
| T?   | (22.5/45.0/67.5/n/a)             | (n/a/Haunting Shot (1.00)/Infinite Rounds (1.44)/n/a)                  | Infinite Rounds (65.0/1.44), Haunting Shot (45.0/1.00), Runed Gauntlets (-40.0/-0.89)                                                                                                                                               |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `low_max_hp`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)  | Staple Items (0.5/1.0/1.5/2.0*)                            | All Items at Tier (Raw/Norm)                                                                                  |
|------|-----------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| T1   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP) | (n/a/n/a/n/a/n/a)                                          | —                                                                                                             |
| T2   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP) | (n/a/n/a/n/a/n/a)                                          | —                                                                                                             |
| T3   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP) | (Blood Tribute (-0.59)/Berserker (1.06)/n/a/n/a)           | Berserker (45.0 HP/1.06), Blood Tribute (-25.0 HP/-0.59)                                                      |
| T4   | (21.2 HP/42.5 HP/63.8 HP/85.0 HP) | (n/a/Cheat Death (1.18)/Glass Cannon (1.53)/Frenzy (2.00)) | Frenzy (85.0 HP/2.00), Siphon Bullets (80.0 HP/1.88), Glass Cannon (65.0 HP/1.53), Cheat Death (50.0 HP/1.18) |
| T?   | (21.2 HP/42.5 HP/63.8 HP/n/a)     | (n/a/n/a/n/a/n/a)                                          | —                                                                                                             |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `magazine_size_dependant`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                     | All Items at Tier (Raw/Norm)                                                                                                                                                        |
|------|----------------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (16.7%/33.3%/50.0%/66.7%)        | (n/a/Extended Magazine (0.90)/n/a/n/a)              | Extended Magazine (30.0%/0.90)                                                                                                                                                      |
| T2   | (25.0%/50.0%/75.0%/100%)         | (Active Reload (0.50)/n/a/n/a/Swift Striker (2.00)) | Swift Striker (100%/2.00), Active Reload (25.0%/0.50), Intensifying Magazine (20.0%/0.40), Recharging Rush (20.0%/0.40), Quicksilver Reload (20.0%/0.40), Kinetic Dash (12.0%/0.24) |
| T3   | (37.5%/75.0%/112%/150%)          | (Escalating Resilience (0.47)/n/a/n/a/n/a)          | Escalating Resilience (35.0%/0.47), Burst Fire (4.00%/0.05), Express Shot (4.00%/0.05)                                                                                              |
| T4   | (56.2%/112%/169%/225%)           | (Mercurial Magnum (0.31)/n/a/n/a/n/a)               | Mercurial Magnum (35.0%/0.31), Lucky Shot (30.0%/0.27), Spellslinger (25.0%/0.22), Vampiric Burst (13.0%/0.12), Crushing Fists (12.0%/0.11)                                         |
| T?   | (56.2%/112%/169%/n/a)            | (Infinite Rounds (0.44)/n/a/n/a/n/a)                | Infinite Rounds (50.0%/0.44)                                                                                                                                                        |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `melee_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                 | All Items at Tier (Raw/Norm)                                                                             |
|------|----------------------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| T1   | (5.56%/11.1%/16.7%/22.2%)        | (Spirit Strike (0.72)/Melee Lifesteal (1.08)/n/a/n/a)           | Melee Lifesteal (12.0%/1.08), Spirit Strike (8.00%/0.72)                                                 |
| T2   | (8.33%/16.7%/25.0%/33.3%)        | (n/a/Melee Charge (1.20)/n/a/n/a)                               | Melee Charge (20.0%/1.20)                                                                                |
| T3   | (12.5%/25.0%/37.5%/50.0%)        | (Spirit Snatch (0.60)/Lifestrike (0.88)/n/a/Point Blank (2.00)) | Point Blank (50.0%/2.00), Lifestrike (22.0%/0.88), Spirit Snatch (15.0%/0.60), Shadow Weave (3.00%/0.12) |
| T4   | (18.8%/37.5%/56.2%/75.0%)        | (n/a/Crushing Fists (1.20)/n/a/n/a)                             | Crushing Fists (45.0%/1.20), Colossus (6.00%/0.16)                                                       |
| T?   | (18.8%/37.5%/56.2%/n/a)          | (n/a/Shadow Strike (1.07)/Runed Gauntlets (1.47)/n/a)           | Runed Gauntlets (55.0%/1.47), Shadow Strike (40.0%/1.07)                                                 |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `melee_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                | All Items at Tier (Raw/Norm)                                                                                                                                                                                                          |
|------|----------------------------------|--------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (5.00%/10.0%/15.0%/20.0%)        | (n/a/n/a/n/a/Close Quarters (2.00))                                            | Close Quarters (20.0%/2.00), Rebuttal (18.0%/1.80)                                                                                                                                                                                    |
| T2   | (7.50%/15.0%/22.5%/30.0%)        | (n/a/n/a/n/a/n/a)                                                              | —                                                                                                                                                                                                                                     |
| T3   | (11.2%/22.5%/33.8%/45.0%)        | (Escalating Resilience (0.49)/Bullet Resilience (0.89)/Point Blank (1.33)/n/a) | Point Blank (30.0%/1.33), Bullet Resilience (20.0%/0.89), Metal Skin (18.0%/0.80), Surge of Power (18.0%/0.80), Escalating Resilience (11.0%/0.49), Heroic Aura (9.00%/0.40), Warp Stone (4.50%/0.20), Superior Duration (4.00%/0.18) |
| T4   | (16.9%/33.8%/50.6%/67.5%)        | (Juggernaut (0.74)/n/a/n/a/n/a)                                                | Juggernaut (25.0%/0.74)                                                                                                                                                                                                               |
| T?   | (16.9%/33.8%/50.6%/n/a)          | (n/a/n/a/Runed Gauntlets (1.48)/n/a)                                           | Runed Gauntlets (50.0%/1.48)                                                                                                                                                                                                          |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `mid_range`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                            | All Items at Tier (Raw/Norm)                                                                                            |
|------|----------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| T1   | (11.2/22.5/33.8/45.0)            | (n/a/Headshot Booster (1.11)/n/a/n/a)                      | Headshot Booster (25.0/1.11), Monster Rounds (25.0/1.11), Mystic Regeneration (25.0/1.11)                               |
| T2   | (11.2/22.5/33.8/45.0)            | (n/a/Slowing Bullets (1.11)/Weakening Headshot (1.33)/n/a) | Weakening Headshot (30.0/1.33), Slowing Bullets (25.0/1.11)                                                             |
| T3   | (11.2/22.5/33.8/45.0)            | (n/a/Disarming Hex (1.11)/Decay (1.56)/n/a)                | Decay (35.0/1.56), Express Shot (30.0/1.33), Knockdown (30.0/1.33), Disarming Hex (25.0/1.11), Silence Wave (25.0/1.11) |
| T4   | (11.2/22.5/33.8/45.0)            | (n/a/n/a/Ricochet (1.56)/Crippling Headshot (2.00))        | Crippling Headshot (45.0/2.00), Ricochet (35.0/1.56), Silencer (35.0/1.56), Inhibitor (35.0/1.56)                       |
| T?   | (11.2/22.5/33.8/n/a)             | (n/a/n/a/n/a/n/a)                                          | —                                                                                                                       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `movement_slow`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)                          | Staple Items (0.5/1.0/1.5/2.0*)                                   | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                      |
|------|-----------------------------------------------------------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (7.50 weighted/15.0 weighted/22.5 weighted/30.0 weighted) | (n/a/n/a/n/a/n/a)                                                 | —                                                                                                                                                                                                                                                 |
| T2   | (11.2 weighted/22.5 weighted/33.8 weighted/45.0 weighted) | (Slowing Hex (0.53)/Slowing Bullets (1.11)/n/a/Cold Front (2.00)) | Cold Front (45.0 weighted/2.00), Slowing Bullets (25.0 weighted/1.11), Mystic Slow (18.0 weighted/0.80), Slowing Hex (12.0 weighted/0.53)                                                                                                         |
| T3   | (16.9 weighted/33.8 weighted/50.6 weighted/67.5 weighted) | (Point Blank (0.74)/Weighted Shots (0.80)/n/a/Lifestrike (1.78))  | Lifestrike (60.0 weighted/1.78), Weighted Shots (27.0 weighted/0.80), Point Blank (25.0 weighted/0.74)                                                                                                                                            |
| T4   | (25.3 weighted/50.6 weighted/75.9 weighted/101 weighted)  | (Colossus (0.49)/n/a/n/a/n/a)                                     | Arctic Blast (35.0 weighted/0.69), Capacitor (32.0 weighted/0.63), Vortex Web (32.0 weighted/0.63), Phantom Strike (30.0 weighted/0.59), Lightning Scroll (30.0 weighted/0.59), Mystic Reverb (30.0 weighted/0.59), Colossus (25.0 weighted/0.49) |
| T?   | (25.3 weighted/50.6 weighted/75.9 weighted/n/a)           | (Haunting Shot (0.69)/n/a/n/a/n/a)                                | Haunting Shot (35.0 weighted/0.69), Mystical Piano (35.0 weighted/0.69)                                                                                                                                                                           |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `multi_ability_focus`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                       | All Items at Tier (Raw/Norm)                                                                              |
|------|----------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| T1   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                                     | —                                                                                                         |
| T2   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                                     | —                                                                                                         |
| T3   | (17.5/35.0/52.5/70.0)            | (Rapid Recharge (0.71)/n/a/Greater Expansion (1.71)/n/a)              | Greater Expansion (60.0/1.71), Superior Cooldown (60.0/1.71), Rapid Recharge (25.0/0.71)                  |
| T4   | (17.5/35.0/52.5/70.0)            | (n/a/Escalating Exposure (1.00)/Spellslinger (1.29)/Refresher (2.00)) | Refresher (70.0/2.00), Spirit Burn (70.0/2.00), Spellslinger (45.0/1.29), Escalating Exposure (35.0/1.00) |
| T?   | (17.5/35.0/52.5/n/a)             | (n/a/Omnicharge Signet (1.00)/n/a/n/a)                                | Omnicharge Signet (35.0/1.00)                                                                             |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `pure_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)              | All Items at Tier (Raw/Norm)                              |
|------|----------------------------------|----------------------------------------------|-----------------------------------------------------------|
| T1   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/n/a/n/a)                            | —                                                         |
| T2   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/n/a/n/a)                            | —                                                         |
| T3   | (21.2/42.5/63.8/85.0)            | (Decay (0.71)/n/a/n/a/Surge of Power (1.88)) | Surge of Power (80.0/1.88), Decay (30.0/0.71)             |
| T4   | (21.2/42.5/63.8/85.0)            | (n/a/n/a/n/a/Scourge (2.00))                 | Scourge (85.0/2.00), Siphon Bullets (75.0/1.76)           |
| T?   | (21.2/42.5/63.8/n/a)             | (n/a/n/a/Haunting Shot (1.50)/n/a)           | Haunting Shot (90.0/1.50), Unstable Concoction (200/1.50) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `range_extender_dependant`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                      | All Items at Tier (Raw/Norm)                                                                                                                                                                                  |
|------|----------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (5.00%/10.0%/15.0%/20.0%)        | (n/a/n/a/n/a/Mystic Expansion (2.00))                                                | Mystic Expansion (20.0%/2.00)                                                                                                                                                                                 |
| T2   | (7.50%/15.0%/22.5%/30.0%)        | (Guardian Ward (0.53)/n/a/n/a/n/a)                                                   | Guardian Ward (8.00%/0.53), Arcane Surge (7.00%/0.47)                                                                                                                                                         |
| T3   | (11.2%/22.5%/33.8%/45.0%)        | (Cultist Sacrifice (0.44)/Ballistic Enchantment (0.98)/Greater Expansion (1.33)/n/a) | Greater Expansion (30.0%/1.33), Ballistic Enchantment (22.0%/0.98), Cultist Sacrifice (10.0%/0.44), Stamina Mastery (9.00%/0.40), Rescue Beam (6.00%/0.27), Healing Nova (5.00%/0.22), Knockdown (5.00%/0.22) |
| T4   | (16.9%/33.8%/50.6%/67.5%)        | (Divine Barrier (0.44)/n/a/n/a/n/a)                                                  | Divine Barrier (15.0%/0.44), Scourge (12.0%/0.36), Vortex Web (8.00%/0.24), Spirit Burn (6.00%/0.18)                                                                                                          |
| T?   | (16.9%/33.8%/50.6%/n/a)          | (n/a/Mystic Conduit (1.19)/n/a/n/a)                                                  | Mystic Conduit (40.0%/1.19)                                                                                                                                                                                   |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `scaling_early`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                     | All Items at Tier (Raw/Norm)                         |
|------|----------------------------------|-----------------------------------------------------|------------------------------------------------------|
| T1   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/Monster Rounds (1.43)/Mystic Burst (1.86)) | Mystic Burst (65.0/1.86), Monster Rounds (50.0/1.43) |
| T2   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/Opening Rounds (1.43)/Cold Front (2.00))   | Cold Front (70.0/2.00), Opening Rounds (50.0/1.43)   |
| T3   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                    |
| T4   | (17.5/35.0/52.5/70.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                    |
| T?   | (17.5/35.0/52.5/n/a)             | (n/a/Eternal Gift (1.00)/n/a/n/a)                   | Eternal Gift (35.0/1.00)                             |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `scaling_late`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                    | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                |
|------|----------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/n/a/Golden Goose Egg (2.00))                                              | Golden Goose Egg (80.0/2.00)                                                                                                                                                                                                                                                                |
| T2   | (20.0/40.0/60.0/80.0)            | (n/a/n/a/n/a/n/a)                                                                  | —                                                                                                                                                                                                                                                                                           |
| T3   | (20.0/40.0/60.0/80.0)            | (n/a/Ballistic Enchantment (0.88)/Stamina Mastery (1.62)/Cultist Sacrifice (2.00)) | Cultist Sacrifice (80.0/2.00), Stamina Mastery (65.0/1.62), Ballistic Enchantment (35.0/0.88)                                                                                                                                                                                               |
| T4   | (20.0/40.0/60.0/80.0)            | (n/a/Witchmail (1.00)/Leech (1.38)/Glass Cannon (2.00))                            | Glass Cannon (80.0/2.00), Boundless Spirit (65.0/1.62), Escalating Exposure (65.0/1.62), Refresher (65.0/1.62), Leech (55.0/1.38), Spirit Burn (55.0/1.38), Diviners Kevlar (50.0/1.25), Siphon Bullets (50.0/1.25), Witchmail (40.0/1.00), Echo Shard (40.0/1.00), Cheat Death (35.0/0.88) |
| T?   | (20.0/40.0/60.0/n/a)             | (n/a/Unstable Concoction (1.12)/Eternal Gift (1.50)/n/a)                           | Eternal Gift (90.0/1.50), Omnicharge Signet (55.0/1.38), Mystic Conduit (50.0/1.25), Unstable Concoction (45.0/1.12)                                                                                                                                                                        |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `self_buff`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                      | All Items at Tier (Raw/Norm)                                                                                                                                                  |
|------|----------------------------------|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (17.5/35.0/52.5/70.0)            | (n/a/Grit (1.00)/n/a/n/a)                                            | Grit (35.0/1.00)                                                                                                                                                              |
| T2   | (17.5/35.0/52.5/70.0)            | (n/a/Return Fire (1.00)/Guardian Ward (1.29)/n/a)                    | Guardian Ward (45.0/1.29), Return Fire (35.0/1.00)                                                                                                                            |
| T3   | (17.5/35.0/52.5/70.0)            | (n/a/Spirit Snatch (1.00)/Surge of Power (1.43)/Shadow Weave (2.00)) | Shadow Weave (70.0/2.00), Surge of Power (50.0/1.43), Spirit Snatch (35.0/1.00)                                                                                               |
| T4   | (17.5/35.0/52.5/70.0)            | (n/a/Spellbreaker (1.00)/Divine Barrier (1.57)/n/a)                  | Ethereal Shift (60.0/1.71), Divine Barrier (55.0/1.57), Infuser (55.0/1.57), Scourge (55.0/1.57), Unstoppable (40.0/1.14), Spellbreaker (35.0/1.00), Plated Armor (30.0/0.86) |
| T?   | (17.5/35.0/52.5/n/a)             | (n/a/n/a/Cloak of Opportunity (1.50)/n/a)                            | Cloak of Opportunity (60.0/1.50), Eternal Gift (55.0/1.50), Shrink Ray (60.0/1.50)                                                                                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `self_heal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                             | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|------|----------------------------------|---------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (50.0 HP/100 HP/150 HP/200 HP)   | (Mystic Regeneration (0.56)/Extra Regen (1.05)/Restorative Shot (1.50)/Healing Rite (2.00)) | Healing Rite (200 HP/2.00), Restorative Shot (150 HP/1.50), Melee Lifesteal (150 HP/1.50), Extra Regen (105 HP/1.05), Rebuttal (60.0 HP/0.60), Mystic Regeneration (56.0 HP/0.56), Sprint Boots (40.0 HP/0.40), Grit (30.0 HP/0.30), Monster Rounds (20.0 HP/0.20), Golden Goose Egg (20.0 HP/0.20)                                                                                                                                                                                                                           |
| T2   | (75.0 HP/150 HP/225 HP/300 HP)   | (Active Reload (0.53)/Healbane (0.93)/n/a/Restorative Locket (1.87))                        | Restorative Locket (280 HP/1.87), Healbane (140 HP/0.93), Healing Booster (120 HP/0.80), Bullet Lifesteal (90.0 HP/0.60), Spirit Lifesteal (90.0 HP/0.60), Active Reload (80.0 HP/0.53), Battle Vest (60.0 HP/0.40), Spirit Shielding (50.0 HP/0.33), Weapon Shielding (50.0 HP/0.33), Enchanters Emblem (40.0 HP/0.27), Enduring Speed (40.0 HP/0.27), Guardian Ward (30.0 HP/0.20), Improved Spirit (30.0 HP/0.20), Reactive Barrier (20.0 HP/0.13)                                                                         |
| T3   | (113 HP/225 HP/338 HP/450 HP)    | (Dispel Magic (0.49)/Lifestrike (0.76)/Healing Nova (1.44)/n/a)                             | Healing Nova (325 HP/1.44), Lifestrike (170 HP/0.76), Fortitude (150 HP/0.67), Dispel Magic (110 HP/0.49), Shadow Weave (100 HP/0.44), Radiant Regeneration (90.0 HP/0.40), Fury Trance (85.0 HP/0.38), Counterspell (75.0 HP/0.33), Veil Walker (65.0 HP/0.29), Headhunter (60.0 HP/0.27), Hollow Point (20.0 HP/0.09), Blood Tribute (18.0 HP/0.08), Superior Cooldown (18.0 HP/0.08), Bullet Resilience (14.0 HP/0.06), Spirit Resilience (14.0 HP/0.06), Cultist Sacrifice (9.00 HP/0.04), Stamina Mastery (9.00 HP/0.04) |
| T4   | (169 HP/338 HP/506 HP/675 HP)    | (Infuser (0.53)/Leech (0.95)/n/a/n/a)                                                       | Leech (320 HP/0.95), Siphon Bullets (250 HP/0.74), Vampiric Burst (250 HP/0.74), Juggernaut (240 HP/0.71), Healing Tempo (220 HP/0.65), Infuser (180 HP/0.53), Mystic Reverb (90.0 HP/0.27), Boundless Spirit (80.0 HP/0.24), Spirit Burn (80.0 HP/0.24), Spiritual Overflow (60.0 HP/0.18), Indomitable (40.0 HP/0.12), Divine Barrier (25.0 HP/0.07)                                                                                                                                                                        |
| T?   | (169 HP/338 HP/506 HP/n/a)       | (n/a/Celestial Blessing (1.19)/Mystic Conduit (1.50)/n/a)                                   | Mystic Conduit (700 HP/1.50), Celestial Blessing (400 HP/1.19)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `shield`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                     | All Items at Tier (Raw/Norm)                                                                                                  |
|------|----------------------------------|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| T1   | (77.8 HP/156 HP/233 HP/311 HP)   | (Grit (0.64)/n/a/n/a/n/a)                           | Grit (100 HP/0.64)                                                                                                            |
| T2   | (117 HP/233 HP/350 HP/467 HP)    | (Spirit Shielding (0.56)/n/a/n/a/n/a)               | Weapon Shielding (170 HP/0.73), Spirit Shielding (130 HP/0.56), Reactive Barrier (65.0 HP/0.28), Guardian Ward (33.0 HP/0.14) |
| T3   | (175 HP/350 HP/525 HP/700 HP)    | (n/a/n/a/n/a/Majestic Leap (2.00))                  | Majestic Leap (700 HP/2.00)                                                                                                   |
| T4   | (262 HP/525 HP/788 HP/1050 HP)   | (Cheat Death (0.38)/Diviners Kevlar (0.95)/n/a/n/a) | Diviners Kevlar (500 HP/0.95), Cheat Death (200 HP/0.38), Divine Barrier (120 HP/0.23), Indomitable (65.0 HP/0.12)            |
| T?   | (262 HP/525 HP/788 HP/n/a)       | (Cloak of Opportunity (0.48)/n/a/n/a/n/a)           | Cloak of Opportunity (250 HP/0.48)                                                                                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `silence`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)               | All Items at Tier (Raw/Norm)                                                                  |
|------|----------------------------------|-----------------------------------------------|-----------------------------------------------------------------------------------------------|
| T1   | (1.33/2.67/4.00/5.33)            | (n/a/n/a/n/a/n/a)                             | —                                                                                             |
| T2   | (2.00/4.00/6.00/8.00)            | (n/a/n/a/n/a/Slowing Hex (2.00))              | Slowing Hex (8.00/2.00)                                                                       |
| T3   | (3.00/6.00/9.00/12.0)            | (n/a/Silence Wave (1.00)/n/a/n/a)             | Silence Wave (6.00/1.00)                                                                      |
| T4   | (4.50/9.00/13.5/18.0)            | (Cursed Relic (0.56)/n/a/Silencer (1.67)/n/a) | Silencer (15.0/1.67), Capacitor (6.00/0.67), Focus Lens (6.00/0.67), Cursed Relic (5.00/0.56) |
| T?   | (4.50/9.00/13.5/n/a)             | (n/a/Mystical Piano (0.89)/n/a/n/a)           | Mystical Piano (8.00/0.89)                                                                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `single_ability_focus`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                                    | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------|----------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (20.0/40.0/60.0/80.0)            | (n/a/Extra Charge (1.12)/Mystic Expansion (1.50)/n/a)                              | Mystic Expansion (60.0/1.50), Extra Charge (45.0/1.12), Mystic Burst (35.0/0.88)                                                                                                                                                                                                                                                                                                                                                                  |
| T2   | (20.0/40.0/60.0/80.0)            | (n/a/Quicksilver Reload (1.25)/Arcane Surge (1.38)/n/a)                            | Arcane Surge (55.0/1.38), Compress Cooldown (55.0/1.38), Duration Extender (55.0/1.38), Quicksilver Reload (50.0/1.25)                                                                                                                                                                                                                                                                                                                            |
| T3   | (20.0/40.0/60.0/80.0)            | (Greater Expansion (-0.50)/n/a/Rapid Recharge (1.50)/Ballistic Enchantment (2.00)) | Ballistic Enchantment (80.0/2.00), Superior Duration (75.0/1.88), Surge of Power (75.0/1.88), Rapid Recharge (60.0/1.50), Greater Expansion (-20.0/-0.50), Superior Cooldown (-20.0/-0.50)                                                                                                                                                                                                                                                        |
| T4   | (20.0/40.0/60.0/80.0)            | (n/a/Cheat Death (1.00)/Diviners Kevlar (1.50)/Lightning Scroll (1.75))            | Lightning Scroll (70.0/1.75), Mystic Reverb (70.0/1.75), Diviners Kevlar (60.0/1.50), Echo Shard (60.0/1.50), Mercurial Magnum (50.0/1.25), Vortex Web (50.0/1.25), Vampiric Burst (45.0/1.12), Ethereal Shift (45.0/1.12), Focus Lens (45.0/1.12), Cheat Death (40.0/1.00), Infuser (40.0/1.00), Arctic Blast (40.0/1.00), Magic Carpet (40.0/1.00), Capacitor (35.0/0.88), Colossus (35.0/0.88), Unstoppable (35.0/0.88), Refresher (35.0/0.88) |
| T?   | (20.0/40.0/60.0/n/a)             | (n/a/Mystical Piano (1.25)/Frostbite Charm (1.50)/n/a)                             | Frostbite Charm (80.0/1.50), Omnicharge Signet (65.0/1.50), Unstable Concoction (65.0/1.50), Mystical Piano (50.0/1.25)                                                                                                                                                                                                                                                                                                                           |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `single_target`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                             | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                              |
|------|----------------------------------|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (16.2/32.5/48.8/65.0)            | (n/a/Headshot Booster (1.08)/Rusted Barrel (1.54)/n/a)                      | Rusted Barrel (50.0/1.54), Headshot Booster (35.0/1.08), Golden Goose Egg (25.0/0.77)                                                                                                                                                                                                                                                     |
| T2   | (16.2/32.5/48.8/65.0)            | (n/a/Slowing Bullets (1.08)/Weakening Headshot (1.38)/Spirit Sap (1.85))    | Spirit Sap (60.0/1.85), Slowing Hex (55.0/1.69), Weakening Headshot (45.0/1.38), Mystic Shot (40.0/1.23), Slowing Bullets (35.0/1.08)                                                                                                                                                                                                     |
| T3   | (16.2/32.5/48.8/65.0)            | (n/a/Cultist Sacrifice (0.77)/Shadow Weave (1.54)/Headhunter (2.00))        | Headhunter (65.0/2.00), Decay (65.0/2.00), Disarming Hex (65.0/2.00), Knockdown (65.0/2.00), Express Shot (60.0/1.85), Sharpshooter (60.0/1.85), Silence Wave (55.0/1.69), Shadow Weave (50.0/1.54), Cultist Sacrifice (25.0/0.77)                                                                                                        |
| T4   | (16.2/32.5/48.8/65.0)            | (n/a/Boundless Spirit (1.08)/Glass Cannon (1.54)/Crippling Headshot (2.00)) | Crippling Headshot (65.0/2.00), Phantom Strike (65.0/2.00), Focus Lens (65.0/2.00), Silencer (60.0/1.85), Inhibitor (60.0/1.85), Cursed Relic (60.0/1.85), Escalating Exposure (60.0/1.85), Armor Piercing Rounds (55.0/1.69), Siphon Bullets (55.0/1.69), Glass Cannon (50.0/1.54), Lucky Shot (50.0/1.54), Boundless Spirit (35.0/1.08) |
| T?   | (16.2/32.5/48.8/n/a)             | (n/a/n/a/Haunting Shot (1.50)/n/a)                                          | Haunting Shot (70.0/1.50), Infinite Rounds (50.0/1.50), Shadow Strike (60.0/1.50), Frostbite Charm (55.0/1.50)                                                                                                                                                                                                                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `small_hitbox`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                     | All Items at Tier (Raw/Norm)                         |
|------|----------------------------------|-----------------------------------------------------|------------------------------------------------------|
| T1   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                    |
| T2   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                    |
| T3   | (12.5/25.0/37.5/50.0)            | (n/a/Stamina Mastery (1.20)/n/a/Veil Walker (2.00)) | Veil Walker (50.0/2.00), Stamina Mastery (30.0/1.20) |
| T4   | (12.5/25.0/37.5/50.0)            | (n/a/n/a/n/a/n/a)                                   | —                                                    |
| T?   | (12.5/25.0/37.5/n/a)             | (n/a/n/a/Shrink Ray (1.50)/n/a)                     | Shrink Ray (95.0/1.50)                               |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_burst_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)      | Staple Items (0.5/1.0/1.5/2.0*)                                                      | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|------|---------------------------------------|--------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (18.2 dmg/36.4 dmg/54.7 dmg/72.9 dmg) | (Extra Spirit (0.41)/Mystic Burst (1.10)/Spirit Strike (1.29)/n/a)                   | Spirit Strike (47.0 dmg/1.29), Mystic Burst (40.0 dmg/1.10), Extra Spirit (15.0 dmg/0.41)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| T2   | (27.3 dmg/54.7 dmg/82.0 dmg/109 dmg)  | (Arcane Surge (0.46)/Quicksilver Reload (0.90)/Mystic Shot (1.39)/Cold Front (1.99)) | Cold Front (109 dmg/1.99), Mystic Shot (76.0 dmg/1.39), Quicksilver Reload (49.0 dmg/0.90), Arcane Surge (25.0 dmg/0.46), Improved Spirit (25.0 dmg/0.46), Stalker (17.0 dmg/0.31), Enchanters Emblem (15.0 dmg/0.27)                                                                                                                                                                                                                                                                                                |
| T3   | (41.0 dmg/82.0 dmg/123 dmg/164 dmg)   | (Alchemical Fire (0.60)/Silence Wave (1.09)/n/a/Surge of Power (2.00))               | Surge of Power (164 dmg/2.00), Silence Wave (89.0 dmg/1.09), Spirit Snatch (67.0 dmg/0.82), Alchemical Fire (49.0 dmg/0.60), Spirit Rend (30.0 dmg/0.37), Rapid Recharge (9.00 dmg/0.11)                                                                                                                                                                                                                                                                                                                             |
| T4   | (61.5 dmg/123 dmg/184 dmg/246 dmg)    | (Spiritual Overflow (0.49)/Lightning Scroll (0.89)/Arctic Blast (1.46)/n/a)          | Spirit Burn (200 dmg/1.63), Arctic Blast (180 dmg/1.46), Lightning Scroll (110 dmg/0.89), Mystic Reverb (100 dmg/0.81), Phantom Strike (95.0 dmg/0.77), Escalating Exposure (90.0 dmg/0.73), Focus Lens (90.0 dmg/0.73), Refresher (80.0 dmg/0.65), Spiritual Overflow (60.0 dmg/0.49), Boundless Spirit (60.0 dmg/0.49), Echo Shard (55.0 dmg/0.45), Capacitor (50.0 dmg/0.41), Scourge (50.0 dmg/0.41), Diviners Kevlar (35.0 dmg/0.28), Infuser (30.0 dmg/0.24), Leech (25.0 dmg/0.20), Witchmail (25.0 dmg/0.20) |
| T?   | (61.5 dmg/123 dmg/184 dmg/n/a)        | (Seraphim Wings (0.41)/Shadow Strike (1.02)/Nullification Burst (1.50)/n/a)          | Nullification Burst (250 dmg/1.50), Frostbite Charm (200 dmg/1.50), Prism Blast (270 dmg/1.50), Unstable Concoction (180 dmg/1.46), Shadow Strike (125 dmg/1.02), Electric Slippers (100 dmg/0.81), Omnicharge Signet (80.0 dmg/0.65), Seraphim Wings (50.0 dmg/0.41)                                                                                                                                                                                                                                                |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_burst_proc`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                      | All Items at Tier (Raw/Norm)                                                    |
|------|----------------------------------|------------------------------------------------------|---------------------------------------------------------------------------------|
| T1   | (0.23/0.45/0.68/0.90)            | (n/a/Mystic Burst (1.11)/n/a/n/a)                    | Mystic Burst (0.50/1.11), Spirit Strike (0.50/1.11)                             |
| T2   | (0.23/0.45/0.68/0.90)            | (n/a/Mystic Shot (0.89)/n/a/n/a)                     | Mystic Shot (0.40/0.89), Cold Front (0.40/0.89)                                 |
| T3   | (0.23/0.45/0.68/0.90)            | (n/a/Surge of Power (1.11)/n/a/Silence Wave (2.00))  | Silence Wave (0.90/2.00), Spirit Snatch (0.90/2.00), Surge of Power (0.50/1.11) |
| T4   | (0.23/0.45/0.68/0.90)            | (Mystic Reverb (0.67)/Phantom Strike (0.89)/n/a/n/a) | Phantom Strike (0.40/0.89), Arctic Blast (0.40/0.89), Mystic Reverb (0.30/0.67) |
| T?   | (0.23/0.45/0.68/n/a)             | (n/a/Nullification Burst (0.89)/n/a/n/a)             | Nullification Burst (0.40/0.89), Frostbite Charm (0.40/0.89)                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_burst_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                           | All Items at Tier (Raw/Norm)                              |
|------|----------------------------------|-----------------------------------------------------------|-----------------------------------------------------------|
| T1   | (6.67%/13.3%/20.0%/26.7%)        | (n/a/n/a/n/a/n/a)                                         | —                                                         |
| T2   | (10.0%/20.0%/30.0%/40.0%)        | (n/a/n/a/Spirit Shielding (1.75)/Spirit Shielding (1.75)) | Spirit Shielding (35.0%/1.75)                             |
| T3   | (15.0%/30.0%/45.0%/60.0%)        | (Spirit Resilience (0.50)/n/a/n/a/Counterspell (2.00))    | Counterspell (60.0%/2.00), Spirit Resilience (15.0%/0.50) |
| T4   | (22.5%/45.0%/67.5%/90.0%)        | (n/a/n/a/Spellbreaker (1.33)/n/a)                         | Spellbreaker (60.0%/1.33)                                 |
| T?   | (22.5%/45.0%/67.5%/n/a)          | (n/a/n/a/n/a/n/a)                                         | —                                                         |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_continuous_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)     | Staple Items (0.5/1.0/1.5/2.0*)                                                | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                      |
|------|--------------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (26.7 dmg/53.3 dmg/80.0 dmg/107 dmg) | (Extra Spirit (0.28)/n/a/n/a/n/a)                                              | Extra Spirit (15.0 dmg/0.28)                                                                                                                                                                                                                                                                                                      |
| T2   | (40.0 dmg/80.0 dmg/120 dmg/160 dmg)  | (Improved Spirit (0.31)/Stalker (0.88)/n/a/n/a)                                | Stalker (70.0 dmg/0.88), Improved Spirit (25.0 dmg/0.31), Enchanters Emblem (15.0 dmg/0.19)                                                                                                                                                                                                                                       |
| T3   | (60.0 dmg/120 dmg/180 dmg/240 dmg)   | (Spirit Rend (0.58)/Surge of Power (1.20)/Alchemical Fire (1.63)/Decay (2.00)) | Decay (240 dmg/2.00), Alchemical Fire (196 dmg/1.63), Surge of Power (144 dmg/1.20), Spirit Rend (70.0 dmg/0.58), Rapid Recharge (9.00 dmg/0.07)                                                                                                                                                                                  |
| T4   | (90.0 dmg/180 dmg/270 dmg/360 dmg)   | (Spiritual Overflow (0.33)/Escalating Exposure (1.22)/Spirit Burn (1.47)/n/a)  | Spirit Burn (265 dmg/1.47), Scourge (250 dmg/1.39), Escalating Exposure (220 dmg/1.22), Capacitor (140 dmg/0.78), Spiritual Overflow (60.0 dmg/0.33), Boundless Spirit (60.0 dmg/0.33), Mystic Reverb (40.0 dmg/0.22), Diviners Kevlar (35.0 dmg/0.19), Infuser (30.0 dmg/0.17), Leech (25.0 dmg/0.14), Witchmail (25.0 dmg/0.14) |
| T?   | (90.0 dmg/180 dmg/270 dmg/n/a)       | (Omnicharge Signet (0.44)/n/a/Prism Blast (1.50)/n/a)                          | Prism Blast (1500 dmg/1.50), Shadow Strike (250 dmg/1.39), Omnicharge Signet (80.0 dmg/0.44)                                                                                                                                                                                                                                      |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_continuous_proc`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)              | All Items at Tier (Raw/Norm)                                                                         |
|------|----------------------------------|----------------------------------------------|------------------------------------------------------------------------------------------------------|
| T1   | (0.21/0.43/0.64/0.85)            | (n/a/n/a/n/a/n/a)                            | —                                                                                                    |
| T2   | (0.21/0.43/0.64/0.85)            | (n/a/n/a/n/a/n/a)                            | —                                                                                                    |
| T3   | (0.21/0.43/0.64/0.85)            | (n/a/Decay (0.94)/n/a/Surge of Power (2.00)) | Surge of Power (0.85/2.00), Decay (0.40/0.94), Alchemical Fire (0.35/0.82)                           |
| T4   | (0.21/0.43/0.64/0.85)            | (n/a/Escalating Exposure (1.06)/n/a/n/a)     | Capacitor (0.50/1.18), Scourge (0.50/1.18), Spirit Burn (0.50/1.18), Escalating Exposure (0.45/1.06) |
| T?   | (0.21/0.43/0.64/n/a)             | (n/a/n/a/Prism Blast (1.41)/n/a)             | Prism Blast (0.60/1.41)                                                                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_continuous_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)        | All Items at Tier (Raw/Norm)   |
|------|----------------------------------|----------------------------------------|--------------------------------|
| T1   | (3.33%/6.67%/10.0%/13.3%)        | (n/a/n/a/n/a/n/a)                      | —                              |
| T2   | (5.00%/10.0%/15.0%/20.0%)        | (n/a/n/a/n/a/n/a)                      | —                              |
| T3   | (7.50%/15.0%/22.5%/30.0%)        | (n/a/n/a/n/a/Spirit Resilience (2.00)) | Spirit Resilience (30.0%/2.00) |
| T4   | (11.2%/22.5%/33.8%/45.0%)        | (n/a/n/a/n/a/n/a)                      | —                              |
| T?   | (11.2%/22.5%/33.8%/n/a)          | (n/a/n/a/n/a/n/a)                      | —                              |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_damage`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)              | Staple Items (0.5/1.0/1.5/2.0*)                                              | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|------|-----------------------------------------------|------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (9.78 SP-eq/19.6 SP-eq/29.3 SP-eq/39.1 SP-eq) | (Extra Charge (0.46)/n/a/n/a/n/a)                                            | Extra Spirit (14.0 SP-eq/0.72), Extra Charge (9.00 SP-eq/0.46), Spirit Strike (9.00 SP-eq/0.46), Mystic Burst (7.00 SP-eq/0.36), Golden Goose Egg (4.30 SP-eq/0.22), Mystic Expansion (4.30 SP-eq/0.22), Mystic Regeneration (4.30 SP-eq/0.22), Rusted Barrel (4.30 SP-eq/0.22)                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| T2   | (14.7 SP-eq/29.3 SP-eq/44.0 SP-eq/58.7 SP-eq) | (Mystic Shot (0.58)/Improved Spirit (0.82)/n/a/n/a)                          | Improved Spirit (24.0 SP-eq/0.82), Mystic Shot (17.0 SP-eq/0.58), Arcane Surge (17.0 SP-eq/0.58), Suppressor (12.0 SP-eq/0.41), Quicksilver Reload (11.0 SP-eq/0.38), Cold Front (10.0 SP-eq/0.34), Enchanters Emblem (9.00 SP-eq/0.31), Healbane (7.00 SP-eq/0.24), Spirit Lifesteal (6.00 SP-eq/0.20), Bullet Resist Shredder (5.50 SP-eq/0.19), Compress Cooldown (5.50 SP-eq/0.19), Duration Extender (5.50 SP-eq/0.19), Mystic Slow (5.50 SP-eq/0.19), Mystic Vulnerability (5.50 SP-eq/0.19), Slowing Hex (5.50 SP-eq/0.19), Spirit Sap (5.50 SP-eq/0.19), Reactive Barrier (3.00 SP-eq/0.10)                                                                                                                                |
| T3   | (22.0 SP-eq/44.0 SP-eq/66.0 SP-eq/88.0 SP-eq) | (Spirit Rend (0.48)/Spirit Snatch (0.88)/Decay (1.36)/Surge of Power (2.00)) | Surge of Power (88.0 SP-eq/2.00), Decay (60.0 SP-eq/1.36), Alchemical Fire (58.0 SP-eq/1.32), Spirit Snatch (38.5 SP-eq/0.88), Silence Wave (26.0 SP-eq/0.59), Spirit Rend (21.0 SP-eq/0.48), Rapid Recharge (16.0 SP-eq/0.36), Counterspell (14.0 SP-eq/0.32), Veil Walker (10.0 SP-eq/0.23), Disarming Hex (8.30 SP-eq/0.19), Greater Expansion (8.30 SP-eq/0.19), Knockdown (8.30 SP-eq/0.19), Radiant Regeneration (8.30 SP-eq/0.19), Superior Cooldown (8.30 SP-eq/0.19), Superior Duration (8.30 SP-eq/0.19), Healing Nova (8.00 SP-eq/0.18), Cultist Sacrifice (6.00 SP-eq/0.14), Shadow Weave (1.50 SP-eq/0.03)                                                                                                            |
| T4   | (33.0 SP-eq/66.0 SP-eq/99.0 SP-eq/132 SP-eq)  | (Spirit Burn (0.52)/Boundless Spirit (0.80)/n/a/n/a)                         | Boundless Spirit (53.0 SP-eq/0.80), Escalating Exposure (50.0 SP-eq/0.76), Capacitor (38.0 SP-eq/0.58), Spirit Burn (34.0 SP-eq/0.52), Spiritual Overflow (30.0 SP-eq/0.45), Mystic Reverb (30.0 SP-eq/0.45), Diviners Kevlar (26.0 SP-eq/0.39), Mercurial Magnum (25.0 SP-eq/0.38), Magic Carpet (22.0 SP-eq/0.33), Lightning Scroll (18.0 SP-eq/0.27), Refresher (18.0 SP-eq/0.27), Arctic Blast (16.0 SP-eq/0.24), Witchmail (14.0 SP-eq/0.21), Infuser (13.0 SP-eq/0.20), Echo Shard (13.0 SP-eq/0.20), Leech (12.0 SP-eq/0.18), Phantom Strike (11.0 SP-eq/0.17), Ethereal Shift (11.0 SP-eq/0.17), Focus Lens (8.30 SP-eq/0.13), Vortex Web (8.30 SP-eq/0.13), Indomitable (2.50 SP-eq/0.04), Cursed Relic (0.00 SP-eq/0.00) |
| T?   | (33.0 SP-eq/66.0 SP-eq/99.0 SP-eq/n/a)        | (Shadow Strike (0.53)/Prism Blast (1.06)/Frostbite Charm (1.36)/n/a)         | Frostbite Charm (90.0 SP-eq/1.36), Prism Blast (70.0 SP-eq/1.06), Omnicharge Signet (60.0 SP-eq/0.91), Shadow Strike (35.0 SP-eq/0.53), Mystic Conduit (35.0 SP-eq/0.53), Nullification Burst (30.0 SP-eq/0.45), Unstable Concoction (30.0 SP-eq/0.45), Electric Slippers (25.0 SP-eq/0.38), Eternal Gift (25.0 SP-eq/0.38), Seraphim Wings (20.0 SP-eq/0.30), Mystical Piano (18.0 SP-eq/0.27)                                                                                                                                                                                                                                                                                                                                    |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_lifesteal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                        | All Items at Tier (Raw/Norm)                                                                          |
|------|----------------------------------|--------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| T1   | (2.33%/4.67%/7.00%/9.33%)        | (n/a/n/a/n/a/n/a)                                      | —                                                                                                     |
| T2   | (3.50%/7.00%/10.5%/14.0%)        | (n/a/n/a/n/a/Spirit Shredder Bullets (2.00))           | Spirit Shredder Bullets (14.0%/2.00), Spirit Lifesteal (13.0%/1.86)                                   |
| T3   | (5.25%/10.5%/15.8%/21.0%)        | (Spirit Rend (0.67)/n/a/n/a/n/a)                       | Spirit Rend (7.00%/0.67)                                                                              |
| T4   | (7.88%/15.8%/23.6%/31.5%)        | (n/a/Mystic Reverb (1.14)/Leech (1.59)/Infuser (1.84)) | Infuser (29.0%/1.84), Leech (25.0%/1.59), Mystic Reverb (18.0%/1.14), Spiritual Overflow (13.0%/0.83) |
| T?   | (7.88%/15.8%/23.6%/n/a)          | (n/a/n/a/n/a/n/a)                                      | —                                                                                                     |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_resist_shred`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                | All Items at Tier (Raw/Norm)                                                                     |
|------|----------------------------------|----------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| T1   | (2.44%/4.89%/7.33%/9.78%)        | (Spirit Strike (0.61)/n/a/n/a/n/a)                             | Spirit Strike (3.00%/0.61)                                                                       |
| T2   | (3.67%/7.33%/11.0%/14.7%)        | (n/a/Spirit Shredder Bullets (0.95)/n/a/n/a)                   | Spirit Shredder Bullets (7.00%/0.95), Mystic Vulnerability (7.00%/0.95), Spirit Sap (6.00%/0.82) |
| T3   | (5.50%/11.0%/16.5%/22.0%)        | (Spirit Snatch (0.55)/n/a/n/a/Spirit Rend (2.00))              | Spirit Rend (22.0%/2.00), Spirit Snatch (6.00%/0.55)                                             |
| T4   | (8.25%/16.5%/24.7%/33.0%)        | (Crippling Headshot (0.67)/n/a/Escalating Exposure (1.52)/n/a) | Escalating Exposure (25.0%/1.52), Crippling Headshot (11.0%/0.67), Focus Lens (4.00%/0.24)       |
| T?   | (8.25%/16.5%/24.7%/n/a)          | (n/a/n/a/Shadow Strike (1.50)/n/a)                             | Shadow Strike (25.0%/1.50)                                                                       |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `spirit_resistance`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                                            | All Items at Tier (Raw/Norm)                                                                                                                                                                                                                                                                                         |
|------|----------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (4.33%/8.67%/13.0%/17.3%)        | (n/a/n/a/n/a/n/a)                                                          | —                                                                                                                                                                                                                                                                                                                    |
| T2   | (6.50%/13.0%/19.5%/26.0%)        | (Cold Front (0.46)/Restorative Locket (0.77)/Enchanters Emblem (1.38)/n/a) | Enchanters Emblem (18.0%/1.38), Restorative Locket (10.0%/0.77), Mystic Vulnerability (8.00%/0.62), Cold Front (6.00%/0.46), Spirit Shielding (3.00%/0.23)                                                                                                                                                           |
| T3   | (9.75%/19.5%/29.2%/39.0%)        | (Dispel Magic (0.51)/n/a/n/a/Spirit Resilience (2.00))                     | Spirit Resilience (39.0%/2.00), Fury Trance (13.0%/0.67), Dispel Magic (10.0%/0.51), Greater Expansion (10.0%/0.51), Blood Tribute (8.00%/0.41), Silence Wave (8.00%/0.41)                                                                                                                                           |
| T4   | (14.6%/29.2%/43.9%/58.5%)        | (Escalating Exposure (0.58)/Witchmail (0.75)/n/a/n/a)                      | Witchmail (22.0%/0.75), Spellbreaker (18.0%/0.62), Escalating Exposure (17.0%/0.58), Silencer (12.0%/0.41), Healing Tempo (10.0%/0.34), Indomitable (10.0%/0.34), Infuser (10.0%/0.34), Arctic Blast (10.0%/0.34), Colossus (7.00%/0.24), Scourge (6.00%/0.21), Echo Shard (5.00%/0.17), Ethereal Shift (4.00%/0.14) |
| T?   | (14.6%/29.2%/43.9%/n/a)          | (n/a/Seraphim Wings (0.85)/n/a/n/a)                                        | Seraphim Wings (25.0%/0.85)                                                                                                                                                                                                                                                                                          |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `stun`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                            | All Items at Tier (Raw/Norm)                                                                |
|------|----------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| T1   | (0.11s/0.22s/0.33s/0.44s)        | (n/a/n/a/n/a/n/a)                                          | —                                                                                           |
| T2   | (0.17s/0.33s/0.50s/0.67s)        | (n/a/n/a/n/a/n/a)                                          | —                                                                                           |
| T3   | (0.25s/0.50s/0.75s/1.00s)        | (n/a/n/a/n/a/Knockdown (2.00))                             | Knockdown (1.00s/2.00)                                                                      |
| T4   | (0.38s/0.75s/1.12s/1.50s)        | (Lightning Scroll (0.53)/n/a/n/a/n/a)                      | Lightning Scroll (0.40s/0.53), Crushing Fists (0.30s/0.40), Arctic Blast (0.12s/0.16)       |
| T?   | (0.38s/0.75s/1.12s/n/a)          | (n/a/Mystical Piano (1.13)/Unstable Concoction (1.47)/n/a) | Unstable Concoction (1.10s/1.47), Mystical Piano (0.85s/1.13), Frostbite Charm (0.60s/0.80) |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `team_heal`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                           | All Items at Tier (Raw/Norm)                                                      |
|------|----------------------------------|-----------------------------------------------------------|-----------------------------------------------------------------------------------|
| T1   | (77.8 HP/156 HP/233 HP/311 HP)   | (Healing Rite (0.64)/n/a/n/a/n/a)                         | Healing Rite (100 HP/0.64)                                                        |
| T2   | (117 HP/233 HP/350 HP/467 HP)    | (Guardian Ward (0.43)/n/a/n/a/n/a)                        | Guardian Ward (100 HP/0.43)                                                       |
| T3   | (175 HP/350 HP/525 HP/700 HP)    | (Rescue Beam (0.71)/n/a/n/a/Healing Nova (2.00))          | Healing Nova (700 HP/2.00), Rescue Beam (250 HP/0.71), Heroic Aura (35.0 HP/0.10) |
| T4   | (262 HP/525 HP/788 HP/1050 HP)   | (Divine Barrier (0.38)/n/a/n/a/n/a)                       | Divine Barrier (200 HP/0.38), Scourge (100 HP/0.19)                               |
| T?   | (262 HP/525 HP/788 HP/n/a)       | (n/a/Mystic Conduit (0.95)/Celestial Blessing (1.50)/n/a) | Celestial Blessing (2000 HP/1.50), Mystic Conduit (500 HP/0.95)                   |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `trap_block_obstruct`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*) | All Items at Tier (Raw/Norm) |
|------|----------------------------------|---------------------------------|------------------------------|
| T1   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T2   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T3   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/n/a)               | —                            |
| T4   | (7.50/15.0/22.5/30.0)            | (n/a/n/a/n/a/Vortex Web (2.00)) | Vortex Web (30.0/2.00)       |
| T?   | (7.50/15.0/22.5/n/a)             | (n/a/n/a/n/a/n/a)               | —                            |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `ult_focused`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*) | Staple Items (0.5/1.0/1.5/2.0*)                              | All Items at Tier (Raw/Norm)                                                                                                                                |
|------|----------------------------------|--------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/n/a/n/a)                                            | —                                                                                                                                                           |
| T2   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/n/a/n/a)                                            | —                                                                                                                                                           |
| T3   | (23.8/47.5/71.2/95.0)            | (n/a/n/a/n/a/n/a)                                            | —                                                                                                                                                           |
| T4   | (23.8/47.5/71.2/95.0)            | (n/a/Cursed Relic (1.05)/Echo Shard (1.58)/Refresher (2.00)) | Refresher (95.0/2.00), Diviners Kevlar (90.0/1.89), Lightning Scroll (90.0/1.89), Echo Shard (75.0/1.58), Cursed Relic (50.0/1.05), Unstoppable (40.0/0.84) |
| T?   | (23.8/47.5/71.2/n/a)             | (n/a/n/a/n/a/n/a)                                            | —                                                                                                                                                           |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

## `vertical_mobility`

| Tier | Effective Raw (0.5/1.0/1.5/2.0*)              | Staple Items (0.5/1.0/1.5/2.0*)                          | All Items at Tier (Raw/Norm)                                                                                                           |
|------|-----------------------------------------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| T1   | (0.62 units/1.25 units/1.88 units/2.50 units) | (n/a/n/a/n/a/Extra Stamina (2.00))                       | Extra Stamina (2.50 units/2.00)                                                                                                        |
| T2   | (0.94 units/1.88 units/2.81 units/3.75 units) | (n/a/Arcane Surge (1.07)/Kinetic Dash (1.33)/n/a)        | Kinetic Dash (2.50 units/1.33), Arcane Surge (2.00 units/1.07), Restorative Locket (1.50 units/0.80)                                   |
| T3   | (1.41 units/2.81 units/4.22 units/5.62 units) | (Majestic Leap (0.71)/n/a/n/a/n/a)                       | Majestic Leap (2.00 units/0.71), Stamina Mastery (2.00 units/0.71), Metal Skin (-0.40 units/-0.14), Weighted Shots (-0.30 units/-0.11) |
| T4   | (2.11 units/4.22 units/6.33 units/8.44 units) | (n/a/Magic Carpet (1.19)/n/a/n/a)                        | Magic Carpet (5.00 units/1.19)                                                                                                         |
| T?   | (2.11 units/4.22 units/6.33 units/n/a)        | (Electric Slippers (0.71)/n/a/Seraphim Wings (1.50)/n/a) | Seraphim Wings (8.00 units/1.50), Electric Slippers (3.00 units/0.71)                                                                  |

**Notes:**

> _(leave corrections, anchor disagreements, or follow-ups for this tag here)_

