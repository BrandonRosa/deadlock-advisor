# Mechanic Translation Rules (proposed)

This doc lists the rules that translate **item mechanics** (read from structured fields + Description text) into contributions to canonical baseline stats and synergy tags. Currently the scraper only handles direct field-name matches in `STAT_MAP`; these rules add the item-level interpretations the user asked for ("the item isn't just its tags — interpret what it does").

Each rule below shows: trigger, output contribution, conversion formula, uptime discount, synergy tags, and affected items. **Please edit/annotate this doc before I wire any of it into code.**

Output of every rule is a synthetic contribution to `mapped_stats[<stat>]` like:
```
{ wiki_key: '<source field>', raw: <wiki value>, effective: <raw × discount × conversion>, context: '<context>', uptime: <factor>, derived_from_mechanic: '<rule name>' }
```

---

## Rule 1: CombatBarrier → resist contribution

**Trigger:** `CombatBarrier.Value` exists (nested object).

**Affected items (3):** Majestic Leap, Spirit Shielding, Weapon Shielding.

**Reasoning:** A combat barrier is a flat HP absorber on damage type X — functionally a defensive stat. It should land in the corresponding resist baseline alongside true resist items because that's how players actually use it.

**Routing:** read the Description for trigger damage type:
- contains `BulletDamage` → contribute to `bullet_resist`
- contains `SpiritDamage` → contribute to `spirit_resist`
- contains `damage` generically (no qualifier) → split 50/50 across `bullet_resist` + `spirit_resist`

**Conversion:** `equivalent_resist_pct = barrier.Value × 0.05`
(rationale: 300 barrier × 0.05 = 15% equivalent resist. Tunable — see Open Q1.)

**Uptime:** 0.40 (matches `damage_window` context — barrier fires once per cooldown when threshold is breached).

**Synergy tags added:** `damage_sponge`, `low_max_hp` (barrier matters more on squishier heroes).

**Correction:** Yes, but dont forget about my `escape` tag. These items are good to counter `engage` Pretty much anything that gives shields based on enemy triggering event should have some `escape`.

---

## Rule 2: VexBarrierCombatBarrier → resist contribution

**Trigger:** `VexBarrierCombatBarrier.Value` exists.

**Affected items (2):** Indomitable, Reactive Barrier.

Same logic as Rule 1 but specifically for the Vex-style barriers (sometimes have different scaling). For now treat identically to Rule 1.

**Open Q2:** Should Vex barriers use a different conversion factor? They tend to be larger numbers but with stricter triggers.

**Correction:** Correct, same conversion factor.

---

## Rule 3: TotalHealthRegen burst → health_regen contribution

**Trigger:** `TotalHealthRegen.Value` exists.

**Affected items (2):** Healing Nova, Healing Rite.

**Reasoning:** Flat burst of healing on cast. Functionally a self_heal contributor.

**Conversion:** `equivalent_regen_per_sec = totalRegen.Value / AbilityCooldown`
(e.g., 1000 burst heal on 30s cooldown = 33 hp/s equivalent; comparable to BonusHealthRegen.)

**Uptime:** 1.0 (the conversion already amortizes over cooldown).

**Synergy tags added:** none extra (already a heal, no implied secondaries).

**Correction:** Yes but consider using `burst_heal` (Immediate within one second) and `continuous_heal` (regen and up to things like Healing Rite that lasts for quite a bit)
---

## Rule 4: PerKill stacking → contribute to relevant stat with per_stack context

**Trigger:** any field ending in `PerKill`.

**Affected items / fields:**
- `BonusClipPerKill` (Glass Cannon) → `ammo`
- `FireRatePerKill` (Glass Cannon) → `fire_rate` (already wired but as part of STAT_MAP; ensure per_stack discount applies)
- `StealPerKill` (Siphon Bullets) → ?  (Open Q3: not obviously any of our target stats — soul steal mechanic. Maybe synergy with `farmer` / `scaling_late` only, no baseline contribution.)

**Conversion:** `effective = perKillValue × 0.5 × MaxStacks` (assume 50% of max stacks on average).

**Uptime:** treat as already amortized in the multiplier; context tag = `per_stack`.

**Synergy tags added:** `high_kill_count`, `scaling_late`.

---

## Rule 5: Lifestrike-style heal-on-damage → bullet_lifesteal or spirit_lifesteal

**Trigger:** `LifestealHealPercent.Value` exists (currently only Lifestrike) OR Description contains "lifesteal"/"lifestrike" without a `*LifestealPercent` field.

**Affected items:** Lifestrike (LifestealHealPercent), plus ~4 other items whose Description mentions lifesteal but don't have the canonical field.

**Conversion:** raw % value as-is.

**Routing:** determine bullet vs spirit by Description (mentions "bullet damage" → bullet_lifesteal; mentions "ability"/"spirit" → spirit_lifesteal).

**Uptime:** 1.0 (lifesteal is continuous when triggered).

**Synergy tags added:** `bullet_lifesteal` or `spirit_lifesteal` (the stat tag itself), no extras.

**Open Q4:** Should "Heal" rather than "Lifesteal" in Description trigger a separate rule (health_regen)? Probably not — that's too broad (27 items mention heal).
**Correction:** Unfortunatley Heal and lifesteal CAN mean different things. It depends on item descirption.
---

## Rule 6: Stealth/Invis active → mobility + ambush synergy

**Trigger:** `InvisMoveSpeedMod` field OR `FullInvisDistance` field.

**Affected items (1 currently):** Shadow Weave.

**Reasoning:** Stealth active enables ambush plays — escape, repositioning, single-target burst.

**Output:** treat `InvisMoveSpeedMod` as a `sprint_speed` contribution with `ambush` context (uptime = duration/cooldown of the stealth, which is `AbilityDuration / AbilityCooldown`).

**Synergy tags added:** `escape`, `away_from_team`, `single_target`, `ult_focused`.

**Open Q5:** worth adding a separate "stealth" canonical stat with no current tag mapping? Right now we'd only fold it into `sprint_speed`, which doesn't capture the full mechanic.

**Correction:**This should contribute to `escape`, `away_from_team`, `single_target`, `ult_focused` (ONLY A TINY BIT), and `engage`

---

## Rule 7: DPS / damage pulse → bullet_damage or spirit_damage

**Trigger:** `DPS.Value`, `DamagePerChain.Value`, `DamagePulseAmount.Value`, `Damage.Value` (top-level damage scalars in nested objects).

**Affected items (8+):**
- Tesla Bullets (`DamagePerChain` → bullet/spirit damage)
- Capacitor (`DamagePerChain` → spirit damage)
- Spirit Burn, Alchemical Fire (`DPS` → spirit damage DoT)
- Torment Pulse (`DamagePulseAmount` → spirit damage)
- Arctic Blast, Cold Front, Mercurial Magnum, Quicksilver Reload, Silence Wave (`Damage` → spirit damage active)

**Conversion (PROPOSED — please review):** Hard to convert flat damage to a baseline % since most of our stats are %-based. Two options:

(a) **Skip baseline contribution; only add synergy tags.** Damage values vary too much by mechanic to bin cleanly with %-based stats. Just flag the item as "deals X damage on Y trigger" and add `spirit_damage` synergy. RECOMMENDED.

(b) **Try to convert to spirit-power-equivalent:** `equivalent_spirit_power = damage × scaling_factor`. Too fragile — different mechanics scale differently.

**Open Q6:** lean toward option (a)? It means we won't add Tesla Bullets etc. to a spirit_power baseline, but their existing playstyle_score on `spirit_damage` should suffice.

**Correction:** Neither, make it proportianal on the main trigger. For example if its deal spirit damage on bullet chance proc trigger. Then the spirit damage should be a fraction of the item's main damage source (fire rate) in this case. Make it like a .25 multiplier based on the procc type. BUT, things like tesla bullets and capacitor, and spirit burn all have different tags with how things are procced. For example, they should also have: `gun_continuous_proc` for Tesla/Capacitor, `spirit_burst_proc` and a tiny but `spirit_continous_proc` for Spirit burn (It triggers on damage window, PLUS it contributes to other procs since it deals a burst of damage then a DOT).. 

---

## Rule 8: DoT / DotHealthPercent → spirit_damage synergy + anti_heal synergy

**Trigger:** `DotHealthPercent.Value` exists OR Description contains "DoT" / "burn" / "poison".

**Affected items (2):** Decay, Toxic Bullets.

**Output:** synergy tags only (no baseline contribution since it's % HP-based DoT, not directly comparable to flat spirit_power). Synergy: `spirit_damage`, `continuous_damage`, `anti_heal` (DoTs counter heal stacking).

**Correction:** Anything that does % HP should be `pure_damage` mapped. Otherwise look at the description for context..

---

## Rule 9: Description-keyword-only inferences (for items with no canonical fields)

Used as a **fallback** when structured fields don't capture the mechanic. Each keyword triggers a synergy-tag suggestion (no baseline contribution — too imprecise without numeric anchor).

| Keyword (case-insensitive, in Description) | Synergy tags |
|---|---|
| `slow` (as in movement slow) | `movement_slow`, `cc_resist` (it's a counter to mobile enemies) |
| `silence` | `silence`, `cc_resist` |
| `stun` | `stun`, `cc_resist` |
| `disarm` | `disarm` |
| `barrier` (no CombatBarrier field) | `damage_sponge`, `low_max_hp` |
| `lifesteal` (no Lifesteal field) | `bullet_lifesteal` or `spirit_lifesteal` based on context keyword |
| `stealth` / `invisible` | `escape`, `single_target` |
| `anti-heal` / `heal reduction` | `anti_heal` |
| `headshot` | `headshot_damage` |
| `melee` | `melee_damage` |

**Open Q7:** these synergy suggestions surface in the audit as "this item probably should be scored on tag X". If the user disagrees, flagged but harmless.

**Correction:** Slow and silence work for cc_resist, but it should be a low value. `barrier` is the same as shield. Stealth and invisible forget about `engage` 

---

## Rule 10: HealOnVeil / Veil-triggered heals

**Trigger:** `HealOnVeil.Value` exists (1 item: Veil Walker).

**Output:** `health_regen` contribution with `out_of_combat` context (Veil is essentially out-of-combat regen). `equivalent_regen = HealOnVeil.Value × 0.30` (heuristic; Veil charges are gated).

**Synergy:** `farmer`, `away_from_team`, `escape`.
**Correction:** Dont forget about `burst_heal`
---

## Rule 11: Headshot heal / Headhunter-style

**Trigger:** `HealPercentPerHeadshot.Value` exists.

**Affected items:** Headhunter.

**Output:** `health_regen` synergy only — small heals per headshot, hard to baseline-bin. Add synergy: `headshot_damage`, `self_heal`.

**Correction:** Dont forget Burst heal and continous heal (Do the math on uptime ratio), and technically bullet lifesteal...

---

# Summary table — what currently gets missed

If we wire ALL the rules above:

| Item | Currently in baseline | After rules |
|---|---|---|
| Spirit Shielding (T2) | nothing | `spirit_resist` ~15% effective |
| Weapon Shielding (T2) | nothing | `bullet_resist` ~15% effective |
| Majestic Leap | nothing | both resists at lower weight (mixed trigger) |
| Indomitable / Reactive Barrier | nothing | resist contribution from Vex barrier |
| Healing Nova / Healing Rite | nothing | `health_regen` derived value |
| Glass Cannon | partial (FireRatePerKill in fire_rate) | `ammo` from BonusClipPerKill added |
| Lifestrike | nothing | `spirit_lifesteal` from LifestealHealPercent |
| Shadow Weave | passive sprint only | `sprint_speed` ambush contribution + synergy tags |
| Tesla Bullets / Capacitor | their existing playstyle_score | unchanged in baseline; synergy tags flagged |
| Decay / Toxic Bullets | unchanged | synergy: anti_heal added |
| Veil Walker | unchanged | small `health_regen` derived from HealOnVeil |
| Headhunter | partial | `self_heal` synergy added |

---

# Open Questions for User

1. **Barrier conversion factor (Rule 1):** I'm proposing `barrier.Value × 0.05 = equivalent resist %` (300 barrier → 15%). Too high? Too low? Spirit Shielding feels like a "decent" spirit resist item — does 15% sound right for a T2?
2. **VexBarrier scaling (Rule 2):** Same as regular barrier or different multiplier?
3. **StealPerKill (Rule 4):** Should it just add `farmer` synergy and skip baseline contribution? It's the soul-stealing mechanic, not really any of our 20 target stats.
4. **Lifesteal heuristic (Rule 5):** Reading Description for "lifesteal" keyword is fuzzy — if you've got a list of items you KNOW have lifesteal-equivalent mechanics without a canonical field, I'd rather hard-code than NLP it.
5. **Stealth canonical stat (Rule 6):** Worth adding a `stealth_uptime` stat with no current tag mapping (so it shows up as "unmappable, needs new tag" in the audit), or just absorb into `sprint_speed`?
6. **Damage rules (Rule 7):** Lean toward option (a) — skip baseline contribution, synergy tags only — agreed?
7. **Description-keyword inferences (Rule 9):** Are the keyword → synergy mappings right? Specifically the `slow` → `cc_resist` link (item that applies slow is a counter to mobile enemies, hence cc_resist synergy)?
8. **Anti-heal items:** No items currently use the words "anti-heal" or "antiheal" in their Description even though several (Decay, Toxic Bullets, Healbane) are anti-heal mechanically. Should Rule 8 (DoT items) imply `anti_heal` synergy, OR is there a structured field I should be looking for instead?
9. **General:** Any mechanic I missed? Skim the affected items list — anything obvious?


Look at all `corrections` i put in place!