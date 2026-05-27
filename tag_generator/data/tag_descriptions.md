# Tag Descriptions — Playstyle Score Perspective

Long-form reference for every tag in [tags.json](tags.json). Companion to [mechanic_rules.md](mechanic_rules.md) — that file documents how to interpret item *mechanics*; this file documents what each *tag* means and how to score it.

## Per-entry template

- **Comparison unit** — the numeric quantity the score is proportional to.
- **Description** — what the tag captures; includes specific units / windows when the unit is meaningful (e.g. "within 10m", "within 1s").
- **playstyle_score nuance (item)** — what counts on an item, what pseudo-effects contribute partially, what does NOT count.
- **playstyle_score nuance (hero/build)** — what positive/negative means on a hero profile (used to compare builds).
- **item_affinity nuance** — when an item with this tag is high vs low affinity for a hero.
- **ally_weight nuance** — *only included if the hero/build has a specific synergy or anti-synergy with allies carrying this*. Generic "universal good" cases are not listed.
- **enemy_weight nuance** — *only included if the hero/build is specifically affected*. Direction: **NEGATIVE = enemy having this is BAD for the hero. POSITIVE = enemy having this is GOOD for the hero.**
- **Item-specific anchors** — real Deadlock items that exemplify the scoring extremes.

If a section legitimately doesn't apply, it's omitted.

---

## General Rules

These cross-cut every tag.

1. **Damage-type over-reliance → negative ally_weight.** A team of five spirit-casters loses to mass spirit resist. Hero that relies heavily on spirit_damage → NEGATIVE ally spirit_damage so the recommender steers allies away from doubling up. **Less negative** if the hero shreds spirit resist (opens the door for allies). **Less negative again** for bullet_damage than spirit_damage — bullet resist is easier to bypass in current meta.
2. **Resist-shred inverts the synergy.** If the hero relies on a damage type AND has shred for it → POSITIVE ally_weight on the shred items of that damage type. Less positive if the hero plays lone-wolf and doesn't team-fight.
3. **enemy_weight is from the hero's perspective.** "Is it good or bad for me that the enemy has this?"
   - Enemy has spirit_resistance and hero deals spirit damage → BAD for hero → **negative**.
   - Enemy has large_hitbox and hero is a headshot specialist → GOOD for hero → **positive**.
   - Enemy has anti_heal and hero is the team's primary sustain → BAD → **negative**.
4. **Hero-specific only.** ally_weight / enemy_weight notes are NOT included when something is universally good for any character. Only when there is a specific synergy or anti-synergy for THIS hero. Defaults are zero / neutral.
5. **General vs specific — prefer specific.** `burst_damage` / `continuous_damage` / `spirit_proc` / `bullet_proc` are fallbacks. If the damage source is known (spirit or gun), use the specific variant. General tags score only when the source is genuinely mixed/undefined.
6. **Pseudo-effects count partially.** Silencing → ~0.3x credit toward spirit_resistance (silenced enemies deal no spirit damage). Disarms → ~0.4x toward bullet_resistance. Fire-rate slow → proportional toward bullet_resistance. Bullet resist counts ~0.5x toward melee_resistance (not vice versa).
7. **"Rely-on" items score smaller than "add" items.** For range_extender_dependant / duration_dependant / cooldown_reduction: items that **add** the % bonus score larger than items whose effectiveness merely **relies on** that bonus existing. A +20% range item scores higher here than a separate item whose damage is range-gated.
8. **playstyle_score is dual-purpose.** On a HERO, it describes what the hero is good or bad at (used for build-vs-build comparison). On an ITEM, it describes what the item contributes to a hero's build. Same number, different reading depending on which JSON it sits in.

---

## Comparison Units — Cheat Sheet

| Tag(s) | Comparison unit |
|---|---|
| pure / spirit / bullet damage | effective damage |
| headshot damage | required headshot frequency × item effectiveness multiplier |
| melee damage | effective damage on melee |
| basic resistances / shreds | effective resistance % |
| burst / continuous damage | effective TOTAL damage (window: <1s for burst, >1s for continuous) |
| general procs | item effectiveness |
| bullet evasion | effective % evaded |
| magazine size dependant | effective ammo up × effective uptime |
| fire rate / fire rate slow | effective fire rate |
| aoe / cluster | AoE effect importance × effective enemies affected |
| single target | effect importance × effective uptime |
| close / mid / long range | effectiveness within 10m / 11–19m / 20m+ |
| stun / CC | effective total time stunned |
| aerial / grounded | effectiveness while airborne / on ground |
| horizontal mobility | effective m/s |
| vertical mobility | effective distance traveled boost |
| movement slow | effective slow % |
| silence | effective abilities silenced × total duration |
| disarm | duration |
| cc resist | effective resistance |
| team heal | amount healed/resisted/shielded to ally (not self) |
| self heal | total healed |
| anti-heal | % heal reduction |
| high max hp | HP up + effectiveness from having higher HP |
| low max hp | temp HP up + effectiveness from having lower HP |
| shield | total shield |
| scaling early / late | effectiveness from owning this early / late |
| farmer | effectiveness for farming NPCs |
| cooldown reduction | % reduction (more if item depends on it; more if covers multiple abilities; more if covers item cooldowns) |
| range_extender_dependant | % range up (additive) OR % of item effectiveness that relies on the range up (smaller weight) |
| duration_dependant | % duration up (additive) OR % of item effectiveness that relies on duration up (smaller weight) |
| charge_dependant | effectiveness for **charge-stack** items (multi-use abilities with stored charges) — NOT channel times or charging windups |
| large / small hitbox | effectiveness for having a large / small hitbox |
| close to / away from team | effectiveness/reliance from being within / outside 25m of teammates |
| spawn minions | effective minions |
| assist / counter importance | % of total item usage being used for others / specifically to counter another |
| ult focused | reliance on ult being used |
| spirit/gun burst damage | total damage dealt within 1s window of first hit |
| spirit/gun continuous damage | total damage dealt outside 1s window of first hit |
| x_burst_resistance | effective % reduction within 1s window |
| x_continuous_resistance | effective % reduction outside 1s window |
| damage sponge | affinity / % of item importance / effectiveness from taking damage |
| anti air | % item importance against airborne enemies |
| trap/block/obstruct | effective players × seconds trapped |
| displace | effective enemies × distance displaced |
| hybrid damage | importance to both spirit damage AND gun damage/firerate simultaneously |
| single ability focus | % of importance for one specific ability |
| multi ability focus | % of abilities this affects |
| interrupt | effective frequency |
| spirit burst proc | high trigger threshold + low time window + long duration + burst payout = higher score |
| spirit continuous proc | spirit damage required to trigger × time window / effect duration |
| gun burst proc | bullet damage required to trigger ÷ time window + effect duration |
| gun continuous proc | gun damage / frequency required to trigger × time window / effect duration |
| ability spam | ideal any-ability usage/s |
| assist count | % of item importance to assists (kills count too — kills are also assists) |
| kill count | % of item importance to kill participation |
| engage / escape | effectiveness × importance to engaging / escaping a fight |
| burst heal | total HP healed within 1s |
| continuous heal | total HP healed outside 1s window |
| lifesteals | % |
| lane pusher | effectiveness × importance in pushing a lane without allies |

---

## Tags — Damage Types

### pure_damage

**Comparison unit:** effective damage.

**Description:** Damage that bypasses resistances entirely — ignores resist, deals %max-HP, or executes the victim at a HP threshold. The signature anti-tank damage type.

**playstyle_score nuance (item):** Resist-bypassing damage, %max-HP damage, and execute thresholds all contribute. Flat-damage items that get multiplied by resistance do NOT count.

**playstyle_score nuance (hero/build):** Positive = hero's kit has built-in anti-tank tooling.

**item_affinity nuance:** High for heroes who struggle against big-HP targets.

**enemy_weight nuance:** When the ENEMY deals pure / execute / %max-HP damage, this is negative ONLY if the hero is a high-HP / tank build — that damage bypasses the very HP pool the hero invested in. Neutral for squishy heroes (who weren't relying on a big HP bar anyway).

**Item-specific anchors:** Curse, Decay.

---

### spirit_damage

**Comparison unit:** effective spirit damage dealt.

**Description:** Both raw spirit damage and potential to deal spirit damage (gaining Spirit Power). Spirit shielding (defensive) does NOT count here.

**playstyle_score nuance (item):** Direct spirit damage + Spirit Power scaling. Per-cast bonuses count by trigger frequency.

**playstyle_score nuance (hero/build):** Positive = hero's primary or secondary damage type is spirit.

**item_affinity nuance:** High for any spirit-leaning hero.

**ally_weight nuance:** **NEGATIVE if the hero relies on spirit damage** — mass spirit gets resisted. Less negative if the hero also shreds spirit resist.

**enemy_weight nuance:** Negative ONLY if the hero is specifically vulnerable to spirit damage (low natural spirit resist / squishy into spirit); positive if the hero specifically has spirit-resist attributes that blunt incoming spirit. Same pattern applies to every damage type. (Separately: give a negative **spirit_resistance** enemy_weight when the hero RELIES on spirit damage and lacks spirit_resist_shred — enemy spirit resist walls the hero's output.)

**Item-specific anchors:** Mystic Reach, Improved Spirit, Boundless Spirit, Echo Shard.

---

### bullet_damage

**Comparison unit:** effective gun damage dealt.

**Description:** General gun damage + potential to deal gun damage (Weapon Damage %). Long-range scope items don't contribute to melee context; close-range gun-amp items contribute a slice to melee_damage.

**playstyle_score nuance (item):** Direct bullet damage + Weapon Damage %. Fire rate is its own tag.

**playstyle_score nuance (hero/build):** Positive = hero leans on gunplay.

**item_affinity nuance:** High for gun-DPS heroes.

**ally_weight nuance:** **NEGATIVE if the hero relies on bullet damage** — but **less negative than the spirit case** because bullet resist is easier to bypass via debuffs, fire-rate slows, displaces. Less negative again with bullet resist shred.

**enemy_weight nuance:** When the ENEMY deals heavy bullet damage, this is negative ONLY if the hero is specifically vulnerable to bullets (squishy, low natural bullet resist); positive if the hero specifically stacks bullet-resist attributes.

**Item-specific anchors:** Basic Magazine, Soul Shredder Bullets, Headshot Booster, Crippling Headshot.

---

### headshot_damage

**Comparison unit:** required headshot frequency × item effectiveness multiplier.

**Description:** Both headshot damage and headshot affinity (large bullets, point-blank range, slow-firing weapons all increase how often you land heads).

**playstyle_score nuance (item):** Items that boost headshot damage AND items that boost effective head-rate (large bullets, slow projectiles). Fire rate gets fractional credit (more chances to land heads).

**playstyle_score nuance (hero/build):** Positive = hero has accurate slow-firing high-damage shots or kit synergy with headshots.

**item_affinity nuance:** High for slow-fire, large-bullet heroes. Low for spirit casters and full-auto sprayers.

**enemy_weight nuance:** **NEGATIVE if the hero has a large head hitbox** (Seven, Mo & Krill, Cadence) — these heroes get headshotted reliably, enemy headshot items hurt them more. Positive if the hero's head is hard to hit.

**Item-specific anchors:** Headshot Booster, Crippling Headshot, Sharp Shooter.

---

### melee_damage

**Comparison unit:** effective damage on melee strikes.

**Description:** Both actual melee damage and melee-damage assistance. Gun-damage-% items contribute partial credit only when they apply at melee range (close-quarters / point-blank items, yes; long-range scope items, zero).

**playstyle_score nuance (item):** Direct melee damage, melee-on-hit procs, ambush bonuses, and close-range gun-amps all count. Lifestrike contributes heavily.

**playstyle_score nuance (hero/build):** Positive = hero leans on melee (Abrams, Mo & Krill).

**item_affinity nuance:** High for melee-leaning heroes; close-range gun-amps double up here.

**ally_weight nuance:** **NEGATIVE if hero is a primary melee hero** — melee-resist shuts a team down hard. Less negative with melee-resist shred or ranged options.

**enemy_weight nuance:** When the ENEMY deals heavy melee damage, this is negative ONLY if the hero is specifically vulnerable to melee (gets dived, low melee resist); positive if the hero stacks melee-resist attributes.

**Item-specific anchors:** Melee Charge, Heavy Melee, Lifestrike.

---

## Tags — Resistances & Shreds

### spirit_resistance

**Comparison unit:** effective % spirit resistance.

**Description:** Both actual spirit resistance AND pseudo-resistance — shield-on-spirit-trigger items, silences (denied spirit damage), effects that reduce enemy spirit power.

**playstyle_score nuance (item):** Flat spirit resist 1:1. Shield-on-spirit-damage ~0.6x. Silencing ~0.3x. Spirit slow ~0.2x. Reducing enemy spirit power directly contributes.

**playstyle_score nuance (hero/build):** Positive = hero's kit is naturally tanky against spirit.

**item_affinity nuance:** High for any hero that plays near spirit casters.

**enemy_weight nuance:** **NEGATIVE if the hero relies on spirit damage** (less negative with spirit_resist_shred). Enemies stacking spirit resist directly counter the hero's damage output.

**Item-specific anchors:** Spirit Armor, Improved Spirit Armor, Spirit Shielding.

---

### bullet_resistance

**Comparison unit:** effective % bullet resistance.

**Description:** Both actual bullet resistance AND pseudo-resistance — disarms (no shots fired), fire-rate slows (fewer shots fired), bullet-shield items. Bullet resistance implicitly counts as melee resistance (reverse is not true).

**playstyle_score nuance (item):** Flat bullet resist 1:1. Disarm ~0.4x for its duration. Fire-rate slow proportional to slow %. Bullet evasion contributes partial credit (own tag).

**playstyle_score nuance (hero/build):** Positive = naturally tanky against gunfire (Bebop, Abrams, Pocket).

**item_affinity nuance:** Highest for slow big-HP heroes that get focused by gun comps. Lower for mobile heroes who dodge.

**enemy_weight nuance:** **NEGATIVE if the hero relies on bullet damage** (less negative than the spirit case because bullet resist is easier to bypass). Less negative again with bullet_resist_shred.

**Item-specific anchors:** Bullet Armor, Improved Bullet Armor, Knockdown (disarm pseudo-credit).

---

### melee_resistance

**Comparison unit:** effective % melee resistance.

**Description:** Both actual melee resistance and pseudo-resistance. Bullet resistance contributes partially (every bullet resist is also melee resist; reverse is not true).

**playstyle_score nuance (item):** Direct melee resist 1:1. Bullet resist ~0.5x. Knockback / pushback items that disengage melees ~0.3x.

**playstyle_score nuance (hero/build):** Positive = naturally tanky in melee range.

**item_affinity nuance:** High for close-range heroes who get punished by melee dives.

**enemy_weight nuance:** Negative if the hero relies on melee damage (less negative with melee-resist shred).

**Item-specific anchors:** Return Fire, Reactive Barrier.

---

### spirit_resist_shred

**Comparison unit:** effective % spirit resistance removed from enemies.

**Description:** Anything that lowers enemy spirit resist, including making enemies take more spirit damage from all sources. Lower if it only applies to your spirit damage; higher if team-wide.

**playstyle_score nuance (item):** Direct resist reduction = full credit. Vulnerability debuffs (behave like negative resist) = full credit. Self-only spirit-damage amp = ~0.5x (team can't benefit).

**playstyle_score nuance (hero/build):** Positive = hero brings spirit-resist-shred natively (Mystic Vulnerability fits the kit).

**item_affinity nuance:** High for ALL spirit-damage heroes.

**ally_weight nuance:** **POSITIVE if the hero relies on spirit damage** (allies opening enemies up for your kit). Less positive if the hero is lone-wolf.

**Item-specific anchors:** Mystic Vulnerability, Escalating Exposure, Decay.

---

### bullet_resist_shred

**Comparison unit:** effective % bullet resistance removed from enemies.

**Description:** Same as spirit_resist_shred but for bullet resist.

**playstyle_score nuance (item):** Direct armor reduction = full credit. Bullet vulnerability debuffs = full credit. Self-only bullet damage amp = ~0.5x.

**playstyle_score nuance (hero/build):** Positive = hero brings bullet-shred natively.

**item_affinity nuance:** High for bullet-damage heroes.

**ally_weight nuance:** **POSITIVE if the hero relies on bullet damage.** Same logic as spirit_resist_shred.

**Item-specific anchors:** Armor Piercing Rounds, Toxic Bullets (heal-shred adjacent, partial).

---

## Tags — Damage Timing & Procs

### burst_damage

**Comparison unit:** effective TOTAL damage delivered within 1s of first hit.

**Description:** GENERAL burst — large damage in <1s window. Used when the damage source is unspecified, mixed, or kit-dependent. **Prefer the specific variants** (spirit_burst_damage, gun_burst_damage) when known.

**playstyle_score nuance (item):** Total damage in the 1s window after the first hit. Multi-shot items sum up within 1s.

**playstyle_score nuance (hero/build):** Positive = hero has a "delete" button. Hybrids especially.

**Cross-ref:** [spirit_burst_damage](#spirit_burst_damage), [gun_burst_damage](#gun_burst_damage).

---

### continuous_damage

**Comparison unit:** effective TOTAL damage delivered outside the 1s window.

**Description:** Sustained damage — builds up over time. **Prefer the specific variants** when the source is known.

**playstyle_score nuance (item):** Damage past the 1s window. DoT effects count here (also tagged with dot).

**playstyle_score nuance (hero/build):** Positive = hero applies steady pressure rather than spike damage.

**Cross-ref:** [spirit_continuous_damage](#spirit_continuous_damage), [gun_continuous_damage](#gun_continuous_damage).

---

### dot

**Comparison unit:** total damage from DoT status effects.

**Description:** Similar to continuous_damage but specifically tied to a *status effect* (burn, bleed, poison). DoTs can be cleansed or amplified by debuff items, which matters tactically.

**playstyle_score nuance (item):** Direct DoT damage + items that extend/amplify enemy DoTs. Generic non-status continuous damage doesn't count here.

**playstyle_score nuance (hero/build):** Positive = hero has burn/bleed/poison in their kit (Infernus, Shiv).

**enemy_weight nuance:** Negative when enemies stack DoT threats AND the hero has no cleanse (DoTs grind down sustain).

**Item-specific anchors:** Toxic Bullets (poison DoT), Shiv signature bleed.

---

### debuff

**Comparison unit:** debuff severity × duration × difficulty-of-cleansing.

**Description:** Cleanse-priority of debuffs applied to enemies. Mystic Vulnerability stacks aren't worth dispelling; Decay / Shiv bleed / Seven stun / Infernus burn very much are.

**playstyle_score nuance (item):** Items that apply high-impact cleansable debuffs score high. Mild routine debuffs (slows no one cleanses) score lower.

**playstyle_score nuance (hero/build):** Positive = hero loads enemies with priority debuffs.

**enemy_weight nuance:** Negative when enemies stack priority debuffs — the hero's cleanse window is contested.

**Item-specific anchors:** Decay (high-priority), Mystic Vulnerability (low-priority), Knockdown.

---

### burst_resistance

**Comparison unit:** effective % reduction within first 1s window of getting hit.

**Description:** Resistances tailored for big damage bursts. Shield/barrier items, Spellbreaker-style burst reducers, first-hit absorbers.

**playstyle_score nuance (item):** Shield-on-damage = full credit. Damage absorption windows = full credit. Generic flat resist contributes ~0.3x here (its job is sustained, not burst).

**playstyle_score nuance (hero/build):** Positive = hero shrugs off burst (innate shields, dodge mechanics).

**item_affinity nuance:** High for squishy heroes who get blown up in single windows.

**Item-specific anchors:** Spellbreaker, Etherial Shift (partial — short window), Soul Rebirth.

---

### continuous_resistance

**Comparison unit:** effective % reduction outside the first 1s window.

**Description:** Resistances tailored for sustained engagements — flat resist items, regen-heavy items.

**playstyle_score nuance (item):** Flat resist = full credit (this is its bread and butter). Health regen that scales with damage taken = high credit. Burst-flavored items (Spellbreaker, Metal Skin) score lower here than they do in burst_resistance.

**playstyle_score nuance (hero/build):** Positive = hero outlasts in long fights.

**item_affinity nuance:** High for tanks, brawlers, lane bullies.

**Item-specific anchors:** Improved Bullet Armor, Improved Spirit Armor, Juggernaut.

---

### debuff_resistance

**Comparison unit:** effective % reduction in active debuff/stun duration.

**Description:** Reduces duration of debuffs and stuns affecting your character. Cleanse / Debuff Remover effects count (full removal modulo cooldown).

**playstyle_score nuance (item):** Direct duration reduction = full credit. Cleanse effects = full credit accounting for cooldown.

**playstyle_score nuance (hero/build):** Positive = hero is hard to lock down.

**item_affinity nuance:** High for slow/big heroes who can't dodge stuns and for high-priority focus targets.

**enemy_weight nuance:** When the ENEMY stacks debuff_resistance, this is negative ONLY if the hero relies on debuffs / CC to win — the enemy shrugs off the hero's lockdown and the gameplan stalls.

**Item-specific anchors:** Debuff Remover, Unstoppable, Debuff Reducer.

---

### spirit_proc

**Comparison unit:** item effectiveness (proc damage × proc rate × duration). Roughly 50/50 burst vs continuous flavored.

**Description:** GENERAL spirit-damage proc — triggers when the enemy takes spirit damage. Score balances effect quality against trigger difficulty. **Prefer specific variants** ([spirit_burst_proc](#spirit_burst_proc), [spirit_continuous_proc](#spirit_continuous_proc)) when the proc timing is known.

**playstyle_score nuance (item):** Higher proc damage / better effect = higher score. Harder-to-trigger procs (high threshold, long cooldown) = lower score even if the effect is good.

**playstyle_score nuance (hero/build):** Positive = hero's kit feeds spirit procs reliably.

**Item-specific anchors:** Mystic Burst, Cold Front.

---

### bullet_proc

**Comparison unit:** item effectiveness (proc damage × proc rate × duration).

**Description:** GENERAL bullet-damage proc. **Prefer specific variants** ([gun_burst_proc](#gun_burst_proc), [gun_continuous_proc](#gun_continuous_proc)) when known.

**playstyle_score nuance (item):** Per-bullet procs on full-auto get more total value than per-hit-with-cooldown items.

**playstyle_score nuance (hero/build):** Positive = hero triggers bullet-procs reliably.

**Item-specific anchors:** Toxic Bullets, Soul Shredder Bullets.

---

### bullet_evasion

**Comparison unit:** effective % of incoming bullets evaded.

**Description:** How well the item ignores bullet damage entirely. Metal Skin / Plated Armor are nearly pure evasion. Etherial Shift only partially counts — you're vulnerable / slowed AFTER the window.

**playstyle_score nuance (item):** True bullet immunity window = full credit. Partial protections that compromise mobility post-effect = ~0.5x.

**playstyle_score nuance (hero/build):** Positive = hero has innate dodge mechanics (Lash dive, Vyper jets).

**Item-specific anchors:** Metal Skin, Plated Armor, Etherial Shift (partial credit).

---

## Tags — Bullet Mechanics

### magazine_size_dependant

**Comparison unit:** effective ammo bonus × effective uptime.

**Description:** Blend of magazine size, reload speed, and instant reload. Items / abilities that require sustained bullet flow (procs, fire-rate stackers) benefit from a larger mag and get fractional credit here.

**playstyle_score nuance (item):** Direct magazine boost = full credit. Reload speed ~0.7x. Instant Reload = high credit. Fire-rate items that drain mag faster contribute ~0.3x.

**playstyle_score nuance (hero/build):** Positive = hero's kit cares deeply about magazine (Haze fixation, McGinnis sustained-fire).

**item_affinity nuance:** High for high-fire-rate or proc-stacking heroes.

**Item-specific anchors:** Basic Magazine, Extra Magazine, Active Reload.

---

### fire_rate

**Comparison unit:** effective fire rate boost (%).

**Description:** Direct fire rate increase. Items whose effectiveness scales with high fire rate (Toxic Bullets, Haze ult scaling) get fractional credit.

**playstyle_score nuance (item):** Direct fire-rate % = full credit. Items whose proc effectiveness scales with fire rate get fractional credit.

**playstyle_score nuance (hero/build):** Positive = hero's kit leverages high fire rate.

**ally_weight nuance:** Same as bullet_damage — mildly negative for over-reliance, mildly positive with shred.

**enemy_weight nuance:** Negative when enemies have fire-rate threats AND the hero lacks slows/disarms.

**Item-specific anchors:** Rapid Rounds, Berserker, Intensifying Magazine.

---

### fire_rate_slow

**Comparison unit:** effective fire rate reduction (%) × duration × affected count.

**Description:** How well the hero / item slows enemy fire rate. Score multiplies by AoE / affected count.

**playstyle_score nuance (item):** Direct fire-rate-slow % = full credit. AoE multi-target multiplies. Single-target with long cooldown loses score.

**playstyle_score nuance (hero/build):** Positive = hero shuts down gun comps natively.

**item_affinity nuance:** High for tanks / brawlers who eat bullets and benefit from slowing the income.

**enemy_weight nuance:** When the ENEMY applies fire-rate slow, this is negative ONLY if the hero is gun-reliant — their bullet DPS gets throttled. Neutral for spirit/ability heroes who don't lean on sustained gunfire.

**Item-specific anchors:** Rusted Barrel, Juggernaut.

---

### aoe_cluster

**Comparison unit:** AoE effect importance × effective enemies affected.

**Description:** How good the hero / item is at hitting multiple enemies at once. Score = enemies hit × damage per hit.

**playstyle_score nuance (item):** Area damage = full credit weighted by typical enemies-in-area. Bouncing/chaining damage = high credit. Single-target effects = 0.

**playstyle_score nuance (hero/build):** Positive = hero teamfights from one button (Pocket ult, Mo & Krill ult, Seven ult).

**enemy_weight nuance:** Positive when enemies group up (the hero's AoE punishes their formation). Less valuable into highly mobile / aerial enemy teams — they scatter out of the cluster easily, so the AoE rarely lands on multiple targets.

**Item-specific anchors:** Mystic Burst (AoE component), Boundless Spirit (passive AoE).

---

### single_target

**Comparison unit:** effect importance × effective uptime.

**Description:** How good the hero / effect is at picking and singling out a single target. Targeted debuffs count at ~0.5x (debuffs are lockdown, not always damage).

**playstyle_score nuance (item):** Single-target damage = full credit. Single-target debuffs = ~0.5x. AoE = 0.

**playstyle_score nuance (hero/build):** Positive = hero is a picker (Vindicta, Grey Talon, Vyper).

**Item-specific anchors:** Headshot Booster, Crippling Headshot, Sharp Shooter.

---

## Tags — Range

### close_range

**Comparison unit:** effectiveness × importance within **10m**.

**Description:** Effectiveness AND importance within 10m. Most close-range items correlate with negative long_range on the same item.

**playstyle_score nuance (item):** Items whose value comes from being close (Close-Quarters damage, melee gun-amp) score high. Long-range items score zero or negative here.

**playstyle_score nuance (hero/build):** Positive = hero wants to be close (Abrams, Mo & Krill).

**item_affinity nuance:** High for in-your-face brawlers.

**enemy_weight nuance:** Negative when enemies dive — the hero gets pressured in the band they want to occupy.

**Item-specific anchors:** Close Quarters, Point Blank, Glass Cannon.

---

### mid_range

**Comparison unit:** effectiveness × importance within **11–19m**.

**Description:** The "default" band — often overlooked because kits skew close or long.

**playstyle_score nuance (item):** Items whose effective range falls in 11–19m. Most bullet items live here implicitly.

**playstyle_score nuance (hero/build):** Positive = hero plays mid (McGinnis turret range, Lash mid-air engages).

**Item-specific anchors:** Long-range scope items partially count; Ricochet at moderate range.

---

### long_range

**Comparison unit:** effectiveness × importance at **20m+**.

**Description:** Long-range heroes typically require line of sight; enemies who control LOS (smokes, displaces, vertical-mobility plays) are particularly effective counters.

**playstyle_score nuance (item):** Long-range damage amps, scope items, items that scale with range bonuses.

**playstyle_score nuance (hero/build):** Positive = hero plays long (Vindicta, Grey Talon).

**item_affinity nuance:** High for snipers and back-line heroes.

**enemy_weight nuance:** Negative when enemies have long-range pickers — the hero's range advantage gets neutralized.

**Item-specific anchors:** Long Range, Sharp Shooter.

---

## Tags — Crowd Control

### stun

**Comparison unit:** effective total time stunned.

**Description:** Stun + general hard CC. Score = seconds locked down per use × frequency of use.

**playstyle_score nuance (item):** Direct stun durations + reliable hard CC. Disorients ~0.5x. Slows don't count (own tag).

**playstyle_score nuance (hero/build):** Positive = hero brings reliable CC (Seven's 2, Bebop hook).

**item_affinity nuance:** High for any hero whose damage requires a stationary target.

**enemy_weight nuance:** Negative when enemies bring heavy lockdown the hero can't outplay (squishies, slow tanks).

**Item-specific anchors:** Knockdown. (**Curse does NOT stun** — it silences/disarms; see [silence](#silence) / [disarm](#disarm).)

---

### aerial

**Comparison unit:** effectiveness while airborne.

**Description:** Items / effects that work best while airborne — air-strafe damage bonuses, mid-air ability bonuses, jet-pack-friendly items.

**playstyle_score nuance (item):** Items with mid-air bonuses or that work best while airborne.

**playstyle_score nuance (hero/build):** Positive = hero spends time in the air (Lash, Vindicta hover, Grey Talon).

**item_affinity nuance:** High for air-heroes.

**enemy_weight nuance:** When the ENEMY plays heavy air, this is negative ONLY if the hero lacks anti-air to contest elevation — air enemies attack from angles the hero can't answer. Neutral if the hero has anti-air tools.

**Item-specific anchors:** Long Range (preserves air-shots), hover-friendly cooldown items.

---

### grounded

**Comparison unit:** effectiveness while on the ground.

**Description:** Mirror of aerial. Items that proc on ground stance, items with reduced uptime when airborne. **Melee items are implicitly grounded** — melee almost only happens close-range and on the ground, so melee-leaning items count toward grounded.

**playstyle_score nuance (item):** Items that proc on ground / lose value while airborne. Melee items count implicitly.

**playstyle_score nuance (hero/build):** Positive = hero stays grounded (most tanks, brawlers).

**item_affinity nuance:** High for ground-fighters.

**Item-specific anchors:** Melee items (Melee Charge, Lifestrike) are implicitly grounded; heroes with no air mobility benefit from any grounded-only item.

---

### horizontal_mobility

**Comparison unit:** effective m/s gained.

**Description:** Raw horizontal movement speed boost.

**playstyle_score nuance (item):** Movement speed % = full credit. Sprint speed = partial credit (uptime concern — sprint isn't available while aiming/shooting, so it's a rotation tool more than a fight tool). Mobility-on-hit triggers = high credit when reliable.

**playstyle_score nuance (hero/build):** Positive = hero is mobile (Lash, Vyper).

**item_affinity nuance:** High for mobile heroes.

**enemy_weight nuance:** Negative when enemies are mobile AND the hero lacks slows/locks.

**Item-specific anchors:** Sprint Boots, Enduring Speed, Enduring Spirit.

---

### vertical_mobility

**Comparison unit:** effective vertical traverse / dash distance boost.

**Description:** Boost to going up or recovering air. Less raw m/s, more about reaching elevation.

**playstyle_score nuance (item):** Items that boost stamina / jump count / dash height.

**playstyle_score nuance (hero/build):** Positive = hero uses verticality (Lash divebomb, Vindicta hover).

**item_affinity nuance:** High for sky-heroes.

**enemy_weight nuance:** Negative when enemies stack verticality AND the hero lacks anti-air.

**Item-specific anchors:** Extra Stamina, Enduring Speed (stamina component).

---

### movement_slow

**Comparison unit:** effective movement slow % × duration × affected count.

**Description:** How well the hero / item slows enemy movement.

**playstyle_score nuance (item):** Direct slow % = full credit. AoE slows multiply by affected count. Slow + DoT combos count here for slow component.

**playstyle_score nuance (hero/build):** Positive = hero applies movement lock (Pocket, Cold Front carriers).

**item_affinity nuance:** High for snipers / brawlers landing skill shots on slowed targets.

**enemy_weight nuance:** Negative when enemies bring sticky slows AND the hero is mobility-reliant.

**Item-specific anchors:** Slowing Hex, Cold Front, Mystic Slow.

---

### silence

**Comparison unit:** effective abilities silenced × total duration.

**Description:** Score = average abilities denied per use × duration.

**playstyle_score nuance (item):** Silence duration × AoE size determines the score.

**playstyle_score nuance (hero/build):** Positive = hero shuts down casters natively.

**item_affinity nuance:** High in matchups with ability-reliant enemy heroes.

**enemy_weight nuance:** Negative when enemies bring silences AND the hero is ability-reliant.

**Item-specific anchors:** Silence Glyph, Curse (silence component).

---

### disarm

**Comparison unit:** disarm duration × affected count.

**Description:** Prevents enemies from firing. Counts toward bullet_resistance pseudo-resistance.

**playstyle_score nuance (item):** Direct disarm duration × area. Items with disarm-on-trigger count proportional to trigger uptime.

**playstyle_score nuance (hero/build):** Positive = hero shuts down gun comps natively.

**item_affinity nuance:** High for slow tanks who eat bullets — turning the gun off is huge.

**enemy_weight nuance:** Negative when enemies disarm AND the hero is gun-reliant — the hero's bullet items get gated.

**Item-specific anchors:** Disarm (the item literally named Disarm), Knockdown.

---

### cc_resist

**Comparison unit:** effective % CC resistance / reduction.

**Description:** How well the hero / item resists CC effects (stuns, silences, slows, disarms). Cleansing also counts.

**playstyle_score nuance (item):** Direct CC resistance % = full credit. Tenacity = full credit. Cleanse effects = high credit modulo cooldown.

**playstyle_score nuance (hero/build):** Positive = hero is hard to lock down.

**item_affinity nuance:** High for high-priority focus targets (carries, slow tanks).

**enemy_weight nuance:** When the ENEMY stacks cc_resist, this is negative ONLY if the hero relies on CC (stuns/slows/silences) to set up kills — the enemy breaks free and the hero's lockdown game falls apart.

**Item-specific anchors:** Debuff Remover, Unstoppable, Debuff Reducer.

---

## Tags — Healing & Sustain

### team_heal

**Comparison unit:** amount healed / resisted / shielded to ALLIES (not self).

**Description:** Output that flows from the hero to teammates — ally-target heals, regen auras, ally-target shields. Self-only healing doesn't count.

**playstyle_score nuance (item):** Ally-target heals / shields = full credit by HP value. Auras count by avg ally uptime × HP/s.

**playstyle_score nuance (hero/build):** Positive = hero is a team-heal source.

**item_affinity nuance:** High for hybrid/support kits.

**ally_weight nuance:** Positive — team healers benefit from being near allies; mutual scaling.

**enemy_weight nuance:** Negative when enemies have heavy team-heal AND the hero lacks anti_heal.

**Item-specific anchors:** Rescue Beam, Healing Booster (amplifies team heals).

---

### self_heal

**Comparison unit:** total HP healed (to self).

**Description:** Healing applied only to self. Lifesteal partially counts (own tag covers most of it).

**playstyle_score nuance (item):** Direct self-heal = full credit. Lifesteal ~0.3x here (covered by lifesteal tags). Damage-on-low-HP self-restoration counts.

**playstyle_score nuance (hero/build):** Positive = hero sustains in lane (Abrams passive, Mo & Krill burrow).

**item_affinity nuance:** High for solo-laners.

**enemy_weight nuance:** Negative when enemies sustain AND the hero lacks anti_heal — long fights tilt against the hero.

**Item-specific anchors:** Restorative Locket (self), Healing Rite.

---

### anti_heal

**Comparison unit:** effective % heal reduction.

**Description:** Reduces enemy healing output. Stacks count proportionally to coverage.

**playstyle_score nuance (item):** Direct heal-reduction % = full credit. Items that apply on hit gain credit proportional to hit uptime.

**playstyle_score nuance (hero/build):** Positive = hero brings heal-shutdown natively.

**item_affinity nuance:** High vs. sustain-heavy enemy comps.

**enemy_weight nuance:** **NEGATIVE if the hero is the team's primary sustain source** — enemy anti_heal is a direct counter to them.

**Item-specific anchors:** Toxic Bullets (heal-shred component), Decay (heal cripple).

---

### burst_heal

**Comparison unit:** total HP healed within 1s.

**Description:** Heals delivered in a tight (<1s) window — emergency button heals, full-pool restores, AoE pulses.

**playstyle_score nuance (item):** Heals with short windows = full credit. Large-pool single-tick heals = full credit.

**playstyle_score nuance (hero/build):** Positive = hero has an emergency button.

**item_affinity nuance:** High for heroes who get blown up in burst windows.

**enemy_weight nuance:** Negative when enemies burst-heal AND the hero relies on burst damage to secure kills.

**Item-specific anchors:** Healing Nova, Restorative Locket, Soul Rebirth, Healing Rite.

---

### continous_heal

**Comparison unit:** total HP healed outside 1s window.

**Description:** Sustained heals — regen auras, tick-based heals, slow lifesteal in extended engagements. **NOT** burst pulses like Healing Nova or Restorative Locket — those are burst_heal.

**playstyle_score nuance (item):** Heal-per-second × expected uptime. Per-tick auras count by avg in-range uptime.

**playstyle_score nuance (hero/build):** Positive = hero outlasts in long fights.

**item_affinity nuance:** High for brawlers and tanks.

**enemy_weight nuance:** Negative when enemies sustain continuously AND the hero relies on sustained pressure to win fights.

**Item-specific anchors:** Healing Booster, Health Regen, lifesteal tier items (sustained component).

---

### spirit_lifesteal

**Comparison unit:** effective spirit lifesteal % .

**Description:** % of spirit damage returned as healing. Vampiric Burst is gun-flavored and does NOT count here.

**playstyle_score nuance (item):** Direct spirit lifesteal % = full credit weighted by hero spirit-damage output. Conditional spirit lifesteal counts proportional to trigger uptime.

**playstyle_score nuance (hero/build):** Positive = hero scales heavily with spirit lifesteal (high spirit DPS).

**item_affinity nuance:** Very high affinity for spirit-damage heroes; near-zero for gun-only heroes.

**Item-specific anchors:** Spirit Lifesteal, Mystic Lifesteal-flavored items.

---

### bullet_lifesteal

**Comparison unit:** effective bullet lifesteal % .

**Description:** % of bullet damage returned as healing. **Lifestrike is MELEE lifesteal — does NOT count here.**

**playstyle_score nuance (item):** Direct bullet lifesteal % = full credit weighted by hero bullet-damage output. Conditional bullet lifesteal counts proportional to trigger uptime.

**playstyle_score nuance (hero/build):** Positive = hero scales heavily with bullet lifesteal.

**item_affinity nuance:** Very high affinity for gun-DPS heroes.

**Item-specific anchors:** Bullet Lifesteal, Vampiric Burst.

---

## Tags — HP & Shielding

### high_max_hp

**Comparison unit:** HP up + effectiveness from already having higher HP.

**Description:** Both HP-pool boost AND items whose effectiveness scales with how much HP the hero has.

**playstyle_score nuance (item):** Direct max HP boosts = full credit. % HP scaling items get the "scales with HP" component. "Deals % missing HP" items don't count (low_max_hp tag).

**playstyle_score nuance (hero/build):** Positive = tank hero. Heroes with HP-scaling kits sit highest.

**item_affinity nuance:** High for tanks who chain HP scaling.

**enemy_weight nuance:** When the ENEMY is a high-HP tank, this is negative ONLY if the hero lacks anti-tank damage (no pure / %max-HP / sustained DPS to chew through a big pool) — the hero simply can't kill the bruiser. Neutral/positive if the hero already brings tank-shredding damage.

**Item-specific anchors:** Colossus, Fortitude.

---

### low_max_hp

**Comparison unit:** temp HP up + effectiveness from having lower HP.

**Description:** Glass-cannon flavor — items whose effectiveness scales with low or missing HP. Often paired with damage amps that proc when low. **Lifestrike does NOT belong here** (it's a melee lifesteal item).

**playstyle_score nuance (item):** Damage / lifesteal / mobility that scales as HP decreases. Items that grant temporary HP from low-HP triggers count (threshold matters).

**playstyle_score nuance (hero/build):** Positive = hero plays close to death (Vyper signature builds, low-HP-trigger kits).

**item_affinity nuance:** High for aggressive low-HP brawlers.

**Item-specific anchors:** Glass Cannon (low-HP scaling), Soul Rebirth (revive at low HP).

---

### shield

**Comparison unit:** total shield amount granted.

**Description:** Shield/barrier output (vs raw HP). Includes proc-shields, spirit-trigger shields, and ally-shielding (cross-credit team_heal).

**playstyle_score nuance (item):** Direct shield = full credit by HP value. Proc-shields count weighted by trigger rate. Ally-shields cross-credit team_heal.

**playstyle_score nuance (hero/build):** Positive = hero has shielding mechanics natively.

**item_affinity nuance:** High for brittle heroes that benefit from cushioning.

**Item-specific anchors:** Spirit Shielding (proc shield), Reactive Barrier.

---

### damage_sponge

**Comparison unit:** affinity / % of item importance / effectiveness derived from taking damage.

**Description:** Items / heroes whose effectiveness comes from being on the receiving end of damage — stacking armor on hit, healing on hit, building resources from incoming damage.

**playstyle_score nuance (item):** Items that scale per-damage-taken = full credit. Items that proc on getting hit = full credit weighted by trigger uptime.

**playstyle_score nuance (hero/build):** Positive = hero builds resources from taking damage (Abrams berserker-style scaling).

**item_affinity nuance:** High for tanks who eat damage on purpose.

**enemy_weight nuance:** When the ENEMY is a damage sponge (tank that thrives on incoming damage), this is negative ONLY if the hero lacks any way to deal damage into tanks — a hero with no anti-tank tools (execute, %max-HP, sustained DPS) simply can't kill the sponge. Neutral/positive otherwise.

**Item-specific anchors:** Reactive Barrier, Soul Rebirth, Return Fire.

---

## Tags — Scaling & Tempo

### scaling_early

**Comparison unit:** effectiveness × importance from owning this early.

**Description:** Items / effects that pop off in early-mid phases. Cheap items that meaningfully shift lane outcomes.

**playstyle_score nuance (item):** T1/T2 items that punch above their souls value. Items whose value flattens at high-souls get full credit here.

**playstyle_score nuance (hero/build):** Positive = early-tempo hero (lane bullies, sniper opener heroes).

**item_affinity nuance:** High for lane-bully heroes.

**Item-specific anchors:** Mystic Burst (early T2), Extra Stamina, Basic Magazine.

---

### scaling_late

**Comparison unit:** effectiveness × importance from owning this late.

**Description:** Items whose value compounds with souls / time. T4 items with stacking effects, items that scale with stats only available late.

**playstyle_score nuance (item):** T4 items, stacking-scaling items, items with hard prereqs.

**playstyle_score nuance (hero/build):** Positive = late-game scaler (most carries).

**item_affinity nuance:** High for carries / scaling kits.

**Item-specific anchors:** Boundless Spirit, Crippling Headshot, Glass Cannon.

---

### farmer

**Comparison unit:** effectiveness for farming NPCs (creeps / jungle).

**Description:** Items / mechanics that accelerate farming creeps and jungle camps. Note: not many items target this specifically — Monster Rounds is the cleanest dedicated farm item.

**playstyle_score nuance (item):** Damage-vs-NPCs % bonuses, cleave damage that hits multiple creeps, items that proc on NPC kills.

**playstyle_score nuance (hero/build):** Positive = hero farms NPCs efficiently (cleave kits, AoE caster kits).

**item_affinity nuance:** High for late-game-reliant carries who need to farm efficiently.

**Item-specific anchors:** Monster Rounds.

---

### lane_pusher

**Comparison unit:** effectiveness × importance in pushing a lane WITHOUT ally support.

**Description:** Solo wave-clear and tower-pressure — a hero / item that can shove a lane alone.

**playstyle_score nuance (item):** AoE wave clear, items that boost minion damage, building-damage %.

**playstyle_score nuance (hero/build):** Positive = hero can solo split-push (McGinnis turrets, Bebop bombs).

**item_affinity nuance:** High for solo-lane heroes and split-push enablers.

**enemy_weight nuance:** Negative when enemies have heavy split-push threats AND the hero lacks global mobility.

**Item-specific anchors:** Heroic Aura, Monster Rounds, Tesla Bullets.

---

## Tags — Buffs

### self_buff

**Comparison unit:** % of item value that comes from self-only stat boosts.

**Description:** Items whose value is concentrated in personal stat boosts that don't directly damage / heal / CC. Generic self-flat-stat items live here.

**playstyle_score nuance (item):** Generic self-stat items (a flat % spirit power passive without procs).

**playstyle_score nuance (hero/build):** Positive = hero benefits broadly from generic stat-up items.

**item_affinity nuance:** High for stats-snowball heroes; lower for synergy/proc-driven kits.

**Item-specific anchors:** Extra Spirit, Mystic Expansion (stat up + range), Pristine Emblem.

---

### ally_buff

**Comparison unit:** % of item value that comes from boosting allies (excluding heals).

**Description:** Auras, ally-buffing actives, items that grant bonuses to nearby teammates.

**playstyle_score nuance (item):** Aura items, ally-target buff actives.

**playstyle_score nuance (hero/build):** Positive = support / aura hero.

**item_affinity nuance:** High for team-fight presence heroes.

**ally_weight nuance:** Positive — ally buffs scale with team presence; the hero benefits from being near teammates.

**Item-specific anchors:** Heroic Aura, Rescue Beam.

---

## Tags — Ability Mechanics

### cooldown_reduction

**Comparison unit:** % cooldown reduction. Score boosted more when the item itself depends on the CDR, more again when it covers multiple abilities, and most when it also reduces item cooldowns.

**Description:** % CDR on abilities. Mirror the [range_extender_dependant](#range_extender_dependant) add-vs-relies logic: an item that **adds** cooldown reduction gets FULL credit; an item that merely **has its own cooldown and relies on CDR** to come up faster gets a PARTIAL score (per general rule 7).

**playstyle_score nuance (item):** Direct CDR % the item grants = full credit. An item that itself has an active/cooldown and only benefits from CDR (relies on it) = partial credit (~0.25x), same as range_extender. Item that grants CDR AND has its own active = full add credit. CDR that also covers ITEM cooldowns (not just abilities) = highest credit.

**playstyle_score nuance (hero/build):** Positive = hero gains a lot from CDR (low-CD-spam kits, ult-reliant heroes).

**item_affinity nuance:** High for ability-spam kits (Pocket, Wraith).

**Item-specific anchors:** Improved Cooldown, Superior Cooldown, Mystic Slow (CDR component).

---

### range_extender_dependant

**Comparison unit:** % range up (ADD, full weight) OR % of item effectiveness that relies on the range up (RELY, smaller weight).

**Description:** Items that extend ability range AND items whose effectiveness scales with range improvements. Per general rule 7: "add" items score larger than "rely-on" items.

**playstyle_score nuance (item):** Direct range % bonus = full credit. Items whose effective area / hit distance scales with range bonuses get partial credit.

**playstyle_score nuance (hero/build):** Positive = hero has range-extendable abilities (Vindicta shot, Lash slam range).

**item_affinity nuance:** High for kits with range-bound abilities.

**Item-specific anchors:** Improved Reach, Long Range, Mystic Expansion (range component).

---

### duration_dependant

**Comparison unit:** % duration up (ADD, full weight) OR % of item effectiveness that relies on duration up (RELY, smaller weight).

**Description:** Items that extend ability duration AND items whose effectiveness scales with duration improvements. "Add" items score larger than "rely-on" items.

**playstyle_score nuance (item):** Direct duration % bonus = full credit. Items whose effective uptime scales with duration = partial credit.

**playstyle_score nuance (hero/build):** Positive = hero's abilities have meaningful duration (slow zones, channel ults).

**item_affinity nuance:** High for channel-ult heroes (Pocket, Dynamo).

**Item-specific anchors:** Superior Duration.

---

### charge_dependant

**Comparison unit:** effectiveness for items with **charge stacks** (multi-use abilities/items with stored charges) — NOT channel times or ability windups.

**Description:** Charge-STACK based items only. Items like Echo Shard, Refresher, Mystic Reverb that have multiple stored uses. **NOT** items with channel/windup times like Active Reload — that's a different mechanic.

**playstyle_score nuance (item):** Items granting extra charges, items reducing charge cooldown, items that proc per-charge-use.

**playstyle_score nuance (hero/build):** Positive = hero's kit has charge-stack mechanics (multi-use abilities with stored charges).

**item_affinity nuance:** High for charge-stack kits.

**Item-specific anchors:** Rapid Recharge (charge cooldown).

---

### large_hitbox

**Comparison unit:** effectiveness for having a large hitbox (the hero's own).

**Description:** Items / strategies that work well for / care about heroes with a large hitbox. Some items even INCREASE hitbox (Colossus) — the bigger you are, the more some items pay out.

**playstyle_score nuance (item):** Items whose value increases for big-hitbox heroes (extra HP, evasion, mobility). Items that make the hero larger.

**playstyle_score nuance (hero/build):** Positive = hero has a large hitbox (Mo & Krill, Bebop, Seven).

**item_affinity nuance:** High for big-bodied heroes.

**enemy_weight nuance:** When the ENEMY has a large hitbox, this should rarely be negative. It's POSITIVE when the hero deals lots of AoE damage, deals headshot damage (bigger head to hit), or plays long-range and benefits from a bigger target to land shots on. **Cross-ref [headshot_damage](#headshot_damage), [aoe_cluster](#aoe_cluster), [long_range](#long_range).**

**Item-specific anchors:** Colossus (grows hitbox), Juggernaut.

---

### small_hitbox

**Comparison unit:** effectiveness for having a small hitbox.

**Description:** Mirror — items / strategies tuned for compact heroes who naturally dodge / are harder to hit.

**playstyle_score nuance (item):** Items whose value increases for small-hitbox heroes (mobility multipliers, fragile-but-fast builds).

**playstyle_score nuance (hero/build):** Positive = hero has a small hitbox (Calico, Vyper).

**item_affinity nuance:** High for small heroes.

**Item-specific anchors:** Sprint Boots, Enduring Speed.

---

### close_to_team

**Comparison unit:** effectiveness / reliance from being within **25m** of teammates.

**Description:** Items / mechanics that require or reward staying near allies (auras, ally-shielding triggers, formation play).

**playstyle_score nuance (item):** Aura items, items that proc on ally proximity, formation buffs.

**playstyle_score nuance (hero/build):** Positive = hero plays with the team (supports, brawlers in group fights).

**item_affinity nuance:** High for team-anchor heroes.

**ally_weight nuance:** Positive — allies near you = more value.

**Item-specific anchors:** Rescue Beam, Heroic Aura.

---

### away_from_team

**Comparison unit:** effectiveness / reliance from being outside **25m** of teammates.

**Description:** Items / mechanics that reward solo play — split-push, flanker tools, lone-wolf damage amps.

**playstyle_score nuance (item):** Solo-flank items, items that proc on isolation, split-push tools.

**playstyle_score nuance (hero/build):** Positive = hero plays solo (split pushers, flank assassins).

**item_affinity nuance:** High for solo-flank heroes.

**Item-specific anchors:** Phantom Strike (flank tool).

---

### spawn_minions

**Comparison unit:** effective minions spawned (count × durability × DPS contribution).

**Description:** Items / effects that summon minions (turrets, pets, totems).

**playstyle_score nuance (item):** Minion DPS × uptime × survivability.

**playstyle_score nuance (hero/build):** Positive = summoner hero (McGinnis turrets).

**item_affinity nuance:** High for summoner kits.

**enemy_weight nuance:** When the ENEMY spawns minions/summons, this is negative ONLY if the hero lacks AoE to clear the extra bodies — the summons soak damage, block shots, and apply pressure the hero can't efficiently answer. Neutral if the hero has strong AoE clear.

**Item-specific anchors:** McGinnis-flavor turret items, Tesla Bullets (auxiliary).

---

## Tags — Item Purpose

### assist_importance

**Comparison unit:** % of total item usage that's directed at supporting others.

**Description:** What share of this item's value comes from helping teammates rather than self-power.

**playstyle_score nuance (item):** Heals, shields, buff auras, target-ally actives, ally-damage amps. High = the item exists to help allies.

**playstyle_score nuance (hero/build):** Positive = hero leans support / hybrid-support.

**item_affinity nuance:** High for support / hybrid kits.

**ally_weight nuance:** Positive — team play synergy.

**Item-specific anchors:** Spirit Rend (ally damage amp), Rescue Beam.

---

### counter_importance

**Comparison unit:** % of total item usage that's specifically used to counter another threat.

**Description:** What share of this item's value comes from explicit counter-play (anti-CC, anti-burst, anti-heal, anti-mobility).

**playstyle_score nuance (item):** Cleanses, anti-heal, anti-burst (Spellbreaker), bullet evasion. High = the item is a reaction tool.

**playstyle_score nuance (hero/build):** Positive = hero brings tactical counter tools.

**item_affinity nuance:** Highly contextual — depends on enemy comp.

**Item-specific anchors:** Debuff Remover, Toxic Bullets (anti-heal), Spellbreaker.

---

### ult_focused

**Comparison unit:** reliance on ult being used / available.

**Description:** Items / kits whose effectiveness is tied to ult uptime — ult CDR, ult-amp passives, ult-trigger procs.

**playstyle_score nuance (item):** Direct ult-CDR, items that boost ult specifically, items whose value cycles around an ult window.

**playstyle_score nuance (hero/build):** Positive = ult-reliant hero (Haze ult, Seven ult).

**item_affinity nuance:** High for ult-reliant kits.

**ally_weight nuance:** **POSITIVE if the hero relies on ults** — ult-reliant heroes synergize with ult-reliant allies (ults stack, ult-windows align for teamfights).

**enemy_weight nuance:** Negative ONLY if the hero relies on ults AND cannot interrupt or escape enemy ults easily — a hero with no interrupt and no reliable escape gets blown up inside the enemy ult window before landing its own. If the hero has solid interrupts/escape tools this is neutral.

**Item-specific anchors:** Refresher (ult reset), ult-CDR items. **Echo Shard re-casts the last ABILITY but specifically CANNOT re-cast ults**, so it is not an ult-focused enabler.

---

## Tags — Spirit/Gun Damage Splits

### spirit_burst_damage

**Comparison unit:** total spirit damage delivered within 1s of first hit.

**Description:** Spirit damage in a tight (<1s) window. Prefer over general [burst_damage](#burst_damage) when the source is clearly spirit.

**playstyle_score nuance (item):** Spirit damage in the 1s window. Multi-hit spirit items within 1s sum up.

**playstyle_score nuance (hero/build):** Positive = hero has spirit-burst combos (Wraith one-shot, Vyper combo).

**item_affinity nuance:** High for spirit burst kits.

**ally_weight nuance:** Inherits from [spirit_damage](#spirit_damage) — negative if hero relies on spirit, less negative with shred.

**enemy_weight nuance:** When the ENEMY deals spirit burst damage, this is negative ONLY if the hero is specifically susceptible to spirit burst (squishy into spirit, no spirit burst_resistance / no Spellbreaker-style tools). Positive/neutral if the hero already runs spirit burst defenses.

**Item-specific anchors:** Mystic Burst, Echo Shard (double cast).

---

### spirit_burst_resistance

**Comparison unit:** effective % reduction of spirit damage within 1s window.

**Description:** Defenses tailored for tanking spirit burst windows. Spellbreaker is the iconic anchor. **Metal Skin is NOT a spirit burst tool** — it's bullet evasion / gun_burst_resistance.

**playstyle_score nuance (item):** Spell-specific damage absorption / reduction in short windows = full credit. Generic spirit resist counts partially (~0.3x).

**playstyle_score nuance (hero/build):** Positive = hero shrugs off spirit bursts natively.

**item_affinity nuance:** High for squishy heroes vulnerable to spirit combo deletes.

**enemy_weight nuance:** Negative if the hero is a spirit-burst dealer — direct counter to their gameplan.

**Item-specific anchors:** Spellbreaker, Etherial Shift (short window).

---

### spirit_continuous_damage

**Comparison unit:** total spirit damage delivered outside the 1s window of first hit.

**Description:** Sustained spirit pressure — DoTs, channel damage, stack-building spirit damage.

**playstyle_score nuance (item):** Spirit DoT / channel damage / spirit-trigger sustained ticks.

**playstyle_score nuance (hero/build):** Positive = hero sustains with spirit (Infernus, Seven).

**item_affinity nuance:** High for spirit-sustain kits.

**ally_weight nuance:** Inherits from [spirit_damage](#spirit_damage).

**enemy_weight nuance:** When the ENEMY deals sustained spirit damage, this is negative ONLY if the hero is specifically vulnerable to it (low spirit resist, no sustain to outlast the grind). Neutral if the hero has spirit resist / strong healing.

**Item-specific anchors:** Decay, Mystic Slow (slow + tick).

---

### spirit_continuous_resistance

**Comparison unit:** effective % reduction of spirit damage outside 1s window.

**Description:** Defenses tailored for sustained spirit engagements — spirit resist tiers, regen against spirit damage.

**playstyle_score nuance (item):** Direct spirit resist = full credit. Regen scaling with spirit damage taken = high credit.

**playstyle_score nuance (hero/build):** Positive = hero outlasts spirit comps.

**item_affinity nuance:** High for brawlers in spirit-heavy lobbies.

**enemy_weight nuance:** Negative if the hero deals spirit-continuous damage — direct counter.

**Item-specific anchors:** Improved Spirit Armor, sustained spirit-mitigation regen.

---

### gun_burst_damage

**Comparison unit:** total gun damage delivered within 1s of first hit.

**Description:** Gun damage in a tight (<1s) window. Prefer over general [burst_damage](#burst_damage) when the source is gunfire.

**playstyle_score nuance (item):** Single-trigger high-damage shots, Active Reload bursts, headshot multi-hit.

**playstyle_score nuance (hero/build):** Positive = hero has burst gun combos (Vindicta charged shot, Grey Talon).

**item_affinity nuance:** High for burst-gun heroes.

**ally_weight nuance:** Inherits from [bullet_damage](#bullet_damage).

**enemy_weight nuance:** When the ENEMY deals gun burst, this is negative ONLY if the hero is specifically squishy to it (low HP / low bullet resist, no gun burst_resistance like Metal Skin). Neutral if the hero already runs bullet-burst defenses.

**Item-specific anchors:** Express Shot, Active Reload, Headshot Booster, Crippling Headshot.

---

### gun_burst_resistance

**Comparison unit:** effective % reduction of gun damage within 1s window.

**Description:** Defenses tailored for tanking gun-burst windows.

**playstyle_score nuance (item):** Items that absorb / dodge gun damage in short windows.

**playstyle_score nuance (hero/build):** Positive = hero shrugs off gun bursts.

**item_affinity nuance:** High for squishy back-liners.

**enemy_weight nuance:** Negative if the hero is a gun-burst dealer — direct counter.

**Item-specific anchors:** Metal Skin, Etherial Shift (short window), Plated Armor.

---

### gun_continuous_damage

**Comparison unit:** total gun damage delivered outside the 1s window of first hit.

**Description:** Sustained gun damage — fire-rate-stacked engagements, mag-dependent sustained DPS. **Berserker is NOT this** (it's flat damage scaling); **Frenzy is NOT specifically this either**.

**playstyle_score nuance (item):** Sustained-fire DPS items, stack-on-hit ramp-up damage, items that reward staying in fights.

**playstyle_score nuance (hero/build):** Positive = hero sustains gunfire (McGinnis, Haze).

**item_affinity nuance:** High for sustained-fire kits.

**ally_weight nuance:** Inherits from [bullet_damage](#bullet_damage).

**enemy_weight nuance:** When the ENEMY deals sustained gun damage, this is negative ONLY if the hero is specifically vulnerable to it (low bullet resist, no sustain to outlast a long gunfight). Neutral if the hero stacks bullet resist / healing.

**Item-specific anchors:** Intensifying Magazine.

---

### gun_continuous_resistance

**Comparison unit:** effective % reduction of gun damage outside 1s window.

**Description:** Defenses tailored for sustained gun engagements. **Knockdown is NOT a great anchor here** (it's a stun/disarm, fire-rate slow is separate).

**playstyle_score nuance (item):** Direct bullet resist = full credit. Regen scaling with damage taken = high credit. Disarms / fire-rate slows count partially.

**playstyle_score nuance (hero/build):** Positive = hero outlasts gun comps.

**item_affinity nuance:** High for tanks in gun-heavy lobbies.

**enemy_weight nuance:** Negative if the hero deals gun-continuous damage — direct counter.

**Item-specific anchors:** Juggernaut, Improved Bullet Armor.

---

## Tags — Specialized Combat

### anti_air

**Comparison unit:** % item importance against airborne enemies.

**Description:** Items that specifically punish airborne enemies — drop them, deny their air mobility, amplify damage against airborne targets.

**playstyle_score nuance (item):** Items that explicitly target / damage / pull airborne enemies score highest. Curse counts a little (ground-locks, but not its main function).

**playstyle_score nuance (hero/build):** Positive = hero counters air-heroes natively.

**item_affinity nuance:** Very high in lobbies with air-heavy enemy comps (Lash, Vindicta).

**enemy_weight nuance:** When the ENEMY brings anti-air (can pull/shoot you out of the air), this is negative ONLY if the hero is air-reliant (Lash, Vindicta hover, Grey Talon) — their core airborne gameplan gets denied. Neutral for grounded heroes.

**Item-specific anchors:** Knockdown (drops them — the iconic anchor).

---

### trap_block_obstruct

**Comparison unit:** effective players × seconds trapped / blocked.

**Description:** Effects that physically gate, wall, or root enemies (not stun — they can act but can't move *through*). Few items do this directly; mostly hero kit territory.

**playstyle_score nuance (item):** Wall items, root items, terrain-creating items. Score by area-time gated.

**playstyle_score nuance (hero/build):** Positive = hero brings traps / walls natively (McGinnis turrets-as-blockers, Bebop hook-back-then-wall).

**item_affinity nuance:** High for kits that force engagements.

**Item-specific anchors:** Vortex Web (the closest item to a trap/root in the inventory).

---

### displace

**Comparison unit:** effective enemies × distance displaced.

**Description:** Effects that physically move enemies (knockback, hook, pull, fling). **Not many items displace** — this is mostly hero-ability territory. Vortex Web is the closest item to a displacement tool.

**playstyle_score nuance (item):** Direct displacement effects. Score = avg targets × avg distance per use.

**playstyle_score nuance (hero/build):** Positive = hero displaces natively (Bebop hook, Lash slam).

**item_affinity nuance:** High for kits that punish out-of-position enemies.

**enemy_weight nuance:** Negative when enemies displace AND the hero is a positioning-reliant ranged hero.

**Item-specific anchors:** Vortex Web (closest item).

---

### hybrid_damage_usage

**Comparison unit:** importance to BOTH spirit damage AND gun damage/firerate simultaneously.

**Description:** Mainly for items that **double-dip** — they benefit spirit AND gun output at the same time. Also gets a TINY score for items that are *staples in either damage type* on its own (signals the item is broadly slotted).

**playstyle_score nuance (item):** Items granting both spirit power AND weapon damage / fire rate = full credit. Items that proc both types = full credit. Items that are universal staples in only one damage type = small partial credit.

**playstyle_score nuance (hero/build):** Positive = hero is genuinely hybrid (Mo & Krill, Pocket).

**item_affinity nuance:** High for hybrid kits.

**Item-specific anchors:** Spiritual Overflow, Mercurial Magnum (the iconic double-dippers).

---

## Tags — Ability Focus & Spam

### single_ability_focus

**Comparison unit:** % of importance / effectiveness for ONE specific ability (its damage / duration / range / cooldown).

**Description:** Items / effects that concentrate value on a single ability slot.

**playstyle_score nuance (item):** Items that buff one specific ability slot, items that proc only off one ability.

**playstyle_score nuance (hero/build):** Positive = hero has one signature ability driving most of their damage (Vindicta 4, Wraith 3).

**item_affinity nuance:** High for one-trick kits.

**Item-specific anchors:** Ability-slot-specific amps (Ability 1/2/3/4 cooldown/damage boosters).

---

### multi_ability_focus

**Comparison unit:** % of abilities this affects / is important to.

**Description:** Items that touch multiple abilities — kit-wide CDR, kit-wide damage boost, kit-wide range.

**playstyle_score nuance (item):** Universal ability boosts. Items that grant kit-wide bonuses.

**playstyle_score nuance (hero/build):** Positive = hero distributes damage across abilities evenly (Pocket, Dynamo).

**item_affinity nuance:** High for balanced kits.

**Item-specific anchors:** Mystic Expansion (kit-wide range), Boundless Spirit (kit-wide spirit up).

---

### interrupt

**Comparison unit:** effective interrupt frequency × ability classes interrupted.

**Description:** Effects that cancel enemy channels / abilities mid-cast.

**playstyle_score nuance (item):** Direct interrupt effects. Long-range or AoE interrupts score higher.

**playstyle_score nuance (hero/build):** Positive = hero interrupts natively (Bebop hook, Lash slam).

**item_affinity nuance:** High vs. channel-ult enemy heroes (Dynamo ult, Haze ult).

**enemy_weight nuance:** **NEGATIVE if the hero is ult-focused** — enemy interrupts shut down the hero's gameplan. Cross-ref [ult_focused](#ult_focused).

**Item-specific anchors:** Knockdown, Hook, stun items.

---

## Tags — Procs (Specific)

### spirit_burst_proc

**Comparison unit:** `ProcImportance% × (EffectDuration / MaxProcWindow)`. ProcImportance%: damage = 100%, universal effects (slow) ≈ 90%, narrow effects (fire-rate slow) ≈ 70%. **MaxProcWindow = how long you have to deal the triggering damage** (the window to meet the proc condition), NOT the item's reuse cooldown. Longer effect duration + shorter trigger window → higher. (e.g. Mystic Burst instant/instant → 100%×(0.1/0.1)=1.0; Spirit Burst 8s effect / 5s window → 100%×(8/5)=1.6.)

**Description:** Proc that triggers off spirit damage in a tight (<1s) window. The score logic: harder triggers, shorter windows, longer payout durations, and bigger burst output all push the score UP — counter to general procs (where harder triggers usually lower the score).

**playstyle_score nuance (item):** Items with high spirit-damage trigger thresholds but big payout durations and impactful burst windows score highest. Easy-to-trigger but low-impact procs score lower.

**playstyle_score nuance (hero/build):** Positive = hero feeds spirit-burst procs reliably with one-shot combos.

**item_affinity nuance:** High for spirit-burst kits.

**Item-specific anchors:** Mystic Burst, Echo Shard.

---

### spirit_continuous_proc

**Comparison unit:** `ProcImportance% / (RefreshWindow × EffectDuration)` (raw value → normalized across proc items after; only ranking matters). **Smaller RefreshWindow and smaller EffectDuration → higher score** (frequent procs of short-lived effects demand the most constant re-application). RefreshWindow = the proc's internal cooldown; if it has none (damage-threshold/buildup procs), use `10s / DamageWindow`. ProcImportance%: damage = 100%, universal effects ≈ 90%, narrow effects ≈ 70%. (e.g. Escalating Exposure cd 0.7s / 12s → 100%/(0.7×12)=0.119; Spirit Burn no cd, 500dmg/5s window → R=10/5=2, burn 8s → 100%/(2×8)=0.063.)

**Description:** Proc that triggers off a sustained stream of spirit damage. Requires the hero to keep up consistent spirit pressure to maintain the effect.

**playstyle_score nuance (item):** Sustained-spirit triggers, longer effect durations, items that compound with repeated procs over a fight.

**playstyle_score nuance (hero/build):** Positive = hero sustains spirit damage over long fights (Infernus, Seven).

**item_affinity nuance:** High for spirit-sustain kits.

**Item-specific anchors:** Escalating Exposure (the iconic continuous-spirit proc — requires a constant stream of damage).

---

### gun_burst_proc

**Comparison unit:** `ProcImportance% × (EffectDuration / MaxProcWindow)` (same as spirit_burst_proc, gun-triggered). MaxProcWindow = how long you have to land the triggering gun damage, NOT the reuse cooldown. Longer effect + shorter trigger window → higher.

**Description:** Proc that triggers off a tight burst of gun damage — typically a single high-damage shot or a fast cluster within <1s.

**playstyle_score nuance (item):** Items proccing off a single shot / short window of fire. Higher-damage single-shot procs score better.

**playstyle_score nuance (hero/build):** Positive = hero deals burst gun damage (charged shots, headshots).

**item_affinity nuance:** High for burst-gun kits.

**Item-specific anchors:** Express Shot, Headshot Booster (proc on first head).

---

### gun_continuous_proc

**Comparison unit:** `ProcImportance% / (RefreshWindow × EffectDuration)` (same as spirit_continuous_proc, gun-triggered). Smaller RefreshWindow and smaller EffectDuration → higher score. RefreshWindow = proc internal cooldown, or `10s / DamageWindow` if none.

**Description:** Proc that triggers off sustained gunfire — apply-rate-capped procs that reward keeping the trigger pulled across extended fights. Note: **Berserker is NOT a proc on damage YOU deal** (it's a tank-stack item). **Toxic Bullets is more burst-flavored** (faster fire = faster proc) — works here partially but its primary scoring is elsewhere.

**playstyle_score nuance (item):** Apply-rate-capped sustained procs. Items that reward maintaining fire over a long engagement.

**playstyle_score nuance (hero/build):** Positive = hero sustains gunfire (Haze, McGinnis).

**item_affinity nuance:** High for sustained-fire kits.

**Item-specific anchors:** Siphon Bullets (apply-rate-capped, rewards sustained pressure — the canonical anchor).

---

### ability_spam

**Comparison unit:** ideal any-ability usage rate (uses/s).

**Description:** Items / kits whose value scales with high ability usage rate.

**playstyle_score nuance (item):** Items that proc on ability cast, items granting per-cast bonuses, CDR amps.

**playstyle_score nuance (hero/build):** Positive = hero spams short-CD abilities (Pocket, Wraith).

**item_affinity nuance:** High for short-CD kits.

**enemy_weight nuance:** When the ENEMY is an ability-spam hero (constant low-CD ability pressure), this is negative ONLY if the hero is squishy to that chip / lacks the silence or burst to shut a spammer down. Neutral if the hero out-trades or locks the caster out.

**Item-specific anchors:** Improved Cooldown, Superior Cooldown.

---

## Tags — Player Profile

### high_assist_count

**Comparison unit:** % of item importance to getting assists. **Note: kills also count as assists** — if you contributed to a kill, you assist credit, even if you got the killing blow.

**Description:** Items that drive assist / kill-participation broadly (kills are also assists in Deadlock's scoring — you don't lose the assist if you tag the kill).

**playstyle_score nuance (item):** Damage-amp auras, ally-boost items, items that proc on ally-takedown, items that contribute to fight pressure.

**playstyle_score nuance (hero/build):** Positive = hero participates broadly in fights.

**item_affinity nuance:** High for team-fight presence heroes.

**Item-specific anchors:** Heroic Aura, ally-amp items.

---

### high_kill_count

**Comparison unit:** % of item importance to direct kill participation.

**Description:** Items that drive lethal damage and kill secures.

**playstyle_score nuance (item):** Burst damage items, execute mechanics, items that scale with kills.

**playstyle_score nuance (hero/build):** Positive = hero is a primary killer (carries, assassins).

**item_affinity nuance:** High for damage carries.

**Item-specific anchors:** Crippling Headshot, execute items.

---

### engage

**Comparison unit:** effectiveness × importance for committing to an attack.

**Description:** Items that enable the hero to commit to a fight — gap closers, dive tools, opening-burst tools.

**playstyle_score nuance (item):** Gap-closers, dive tools, items that proc on engaging.

**playstyle_score nuance (hero/build):** Positive = hero engages (Abrams charge, Bebop hook, Lash slam).

**item_affinity nuance:** High for engagers.

**ally_weight nuance:** Positive — engagers set up the fight for the team.

**Item-specific anchors:** Phantom Strike (engage-only — does not function as escape), Knockdown (engage stun), hook tools.

---

### escape

**Comparison unit:** effectiveness × importance for breaking off an attack.

**Description:** Items that let the hero retreat — speed bursts, invulnerability windows, smoke / vision denial. **Etherial Shift is NOT a full escape** — you're slowed afterward so the enemy team has time to converge. **Phantom Strike is engage, not escape**.

**playstyle_score nuance (item):** Mobility actives (with no post-slow penalty), invulnerability frames, position-warps to safety.

**playstyle_score nuance (hero/build):** Positive = hero has reliable escape tools natively.

**item_affinity nuance:** High for squishy / flank heroes.

**enemy_weight nuance:** When the ENEMY has strong escape tools, this is negative ONLY if the hero is a pick / burst hero who needs to secure kills — slippery enemies slip out of the hero's burst window and survive. Neutral for sustained-fight heroes who don't depend on the kill confirm.

**Item-specific anchors:** Warp Stone (clean teleport away), Magic Carpet (mobility-without-slow-penalty).

---
