# 03 — Normalization methodology (0–2 scale) — GOVERNING PROCEDURE

This is the master procedure for turning raw effective values into Normalized 0–2 scores. The Cross-tier ceiling reference table and Sparse-tier dual-scaling rule (below) are the lookup tables and edge-case rules this procedure uses — when anything below conflicts with them, this section's *ordering* governs.

## Score anchors

| Score | Meaning |
|---|---|
| **0** | No contribution to this tag. |
| **1** | A **good** contribution *within its own tier*. Assume each tier is ~**1.5× stronger** than the tier below — so "good for T2" is a higher raw value than "good for T1". |
| **1.5** | **Best-in-tier** — the strongest item for this tag at its tier, *provided* it falls in line with the 1.5×-per-tier growth curve. (If a tier's best item undershoots the curve — see Sparse-tier rule below — it gets less than 1.5.) |
| **2** | The single **BEST effect-per-cost in the entire game** for this tag, across all tiers. There is normally exactly one 2.0 anchor per tag. |

The 1.5×-per-tier assumption means a "1" raw at T1, T2, T3, T4 forms a geometric ladder (×1.5 each step). Use that ladder to place an item: compute its raw, see which tier's "1" band it lands in, then rank within tier toward 1.5 / down toward 0.

## Procedure — ORDER MATTERS (effect-per-cost model)

**Do NOT normalize as you go.** Normalize only after every item's comparative raw is known, or the per-cost ranking and the game-wide 2.0 anchor can't be calibrated.

1. **Author comparative raws FIRST, for every item across all tiers** (Pass 1). Each row has a number in the tag's comparison unit and **no** Normalized yet.
2. **THEN normalize**, per tag, across the full set (Pass 2):
   a. **Divide out the tier growth**: `quality = |comparative_raw| / 1.5^tier` (T1..T4 = 1..4). This puts every tier on a common effect-PER-COST scale.
   b. The **highest quality among STANDARD (non-Street-Brawl) items = 2.0**. **This is NOT the biggest raw number** — a cheaper low-tier item that over-delivers for its tier out-qualities a bigger high-tier stat and takes the 2.0 (e.g. Extra Health 210HP@T1 beats Fortitude 375HP@T3 per-cost).
   c. Everything scales linearly to it: `norm = 2 × quality / quality_max`. Solid tier-leaders that sit on the standard curve land near 1.5; the single best-per-cost item is 2.0; good = ~1.0.
   d. **Dimensionless / direct tags** (importance %, proc indices) skip step (a) — no tier division: `norm = 2 × |raw| / max(non-SB |raw|)`.
   e. Street Brawl: compute quality at eff_tier=4, **cap at 1.5**, and exclude from setting the 2.0 anchor.

## Effective ≠ raw-cache, and judgment anchors override

"Raw" means **effective** value, not the literal `../_scrape_cache.json` number. The cache stores nominal stats (and `uptime`/`effective` are mostly un-curated — flat 1). Many items' true contribution is an *effective* read you supply by judgment:

- **Spellslinger** has no fire-rate stat in the cache but effectively grants ~33–55% fire rate for ability-spam heroes when used correctly → score `fire_rate` high.
- **Vampiric Burst** raw bullet-lifesteal is 13% vs Leech 25%, but its *effective* burst lifesteal is higher → it's the `bullet_lifesteal` 2.0 anchor.
- **Spirit Resilience** (30%) anchors `spirit_resistance` over Fury Trance (40%) on effect-per-cost.
- **Monster Rounds** bullet damage is NPC-only — it does NOT inflate hero `bullet_damage`.

When a user-supplied **judgment anchor** (see Cross-tier ceiling reference below) disagrees with the raw-cache max, the judgment anchor wins for the 2.0; the script's raw-based number is only a starting suggestion the user reviews.

## Dimensionless tags skip the cross-tier ladder

Pure "% of item importance/effectiveness" tags (the proc indices, assist/counter importance, ult_focused, single/multi ability focus, damage_sponge, etc.) are **dimensionless** — there is no raw quantity that grows ~1.5× per tier, so do NOT apply the ladder or sparse-tier rule to them. Score them directly 0–2 on importance. (See [01_scoring_units.md](01_scoring_units.md) "Judgment-derived vs stat-mappable vs dimensionless".)

## Raw-authoring convention + `_normalize.py` (who computes what)

Per the locked Round-8 split: **I hand-author the raws (judgment); `_normalize.py` computes the normalization for the laddered stat tags only.**

Authoring convention for the `Effective Raw` column:
- **One clean number** per row, in the tag's comparison unit (`30` not `+30%`, `8` not `8 HP/sec`). The normalizer reads the first number in the cell.
- **Contribution-signed**: positive when the row helps the carrier, negative for genuine downsides. So `anti_heal = 70`, `spirit_resist_shred = 16`, `fire_rate_slow = 32` are **positive** (they're good to bring); a self-damage / move-speed penalty is negative.
- **Propagation rows** (R2 floors etc.) with no independent stat: leave Raw as `—`; the normalizer passes the authored Normalized through untouched.

What `_normalize.py` does:
- Ladders ONLY the curated clean stat tags (`LADDER_ANCHORS`): `ec(tier) = ceiling × 1.5^(tier − anchor_tier)`, `norm = min(1.5, 1.5 × |raw| / ec)`, sign preserved; the per-tag global-max-raw standard item = **2.0**.
- **Everything else is passthrough** — judgment-only and dimensionless tags keep the Normalized I author (NO 1.5×/tier expectation, even if they carry units; a judgment-estimated "effective %" is not a clean cross-tier stat).
- **Street Brawl** items (tier `?`) are scored but EXCLUDED from the per-tag 2.0 anchor and the ladder, and capped at **1.5** (measured against the T4 ceiling).

Run order after a tier's raws are clean: `python _normalize.py --write` (fills laddered Normalized consistently across all items) → `python _run_audit.py` (blends + audits).

## Street Brawl items

Street Brawl items (`streetbrawl_only: true` in `../_scrape_cache.json`, 17 of them) **must be included** — compute their raw and a Normalized score like any other item. BUT:

- They **do NOT contribute to tier scaling** — exclude them when building the 1.5×-per-tier ladder (their souls cost / availability is mode-locked, so they'd distort the curve).
- They **cannot define the 2.0** best-effect-per-cost anchor — the game-wide 2.0 must come from a standard purchasable item.
- Consequently a Street Brawl item caps at **1.5** Normalized, measured against the standard-item curve.

Where a Street Brawl item genuinely has no meaningful calc-tag contribution (pure ability-variant), the Calculator tags table may still be left as:

```
### Calculator tags
*(n/a — Street Brawl ability-variant; no calculator-relevant stats.)*
```

but if it carries scoreable stats, populate the rows (capped at 1.5) rather than skipping it.

---

## Cross-tier ceiling reference

When deciding Normalized values (0-2 scale), each stat has a cross-tier 2.0 anchor. The Cross-tier ceiling reference table is also embedded in [../item_interpretations.md](../item_interpretations.md). Highlights:

| Stat / axis | 2.0 ceiling | Notes |
|---|---|---|
| `magazine_size_dependant` | Titanic Magazine T2 **100%** | T3/T4 best falls FAR below — sparse-tier rule pulls them to ≤1.0 |
| `bullet_damage` (BaseAttackDamagePercent) | Glass Cannon T4 **80%** | Smooth growth curve. NOTE: NPC-only damage (Monster Rounds) does NOT count toward hero bullet_damage |
| `high_max_hp` (BonusHealth) | Fortitude T3 **375** | T2 best is weak (90) — sparse-tier. Colossus/Fortitude are the anchors; ignore Improved Stamina/Inhibitor |
| `fire_rate` | Blood Tribute T3 **35%** | Active windows reduce effective rate. ⚖️ Spellslinger has high *effective* fire rate for ability-spam heroes despite no raw fire-rate stat |
| `continous_heal` (BonusHealthRegen) | Juggernaut T4 **8/sec** | T3 has no big regen item. Veil Walker is BURST heal, not continuous |
| `bullet_resistance` | Bullet Resilience T3 / Warp Stone T3 **30%** | T4 best undershoots |
| `spirit_resistance` | ⚖️ **Spirit Resilience T3 (30%)** | Judgment anchor (best effect-per-cost) — beats Fury Trance's raw 40%. `spirit_burst_resistance` 2.0 = Spellbreaker T4 / Counterspell T3 (metal skin is NOT a spirit-burst tool) |
| `bullet_lifesteal` | ⚖️ **Vampiric Burst T4** | Judgment anchor — higher *effective* bullet lifesteal than Leech's raw 25%. Lifestrike is MELEE lifesteal, not bullet |
| `spirit_lifesteal` | Infuser T4 **70%** (active) | Passive ceiling much lower. Vampiric Burst does NOT count here (gun-flavored). Leech carries spirit_lifesteal (25%) |
| `spirit_damage` (TechPower) | Diviners Kevlar T4 **35** + Boundless 30+15%mult | Boundless mult is unique 2.0 axis |
| `cooldown_reduction` | Transcendent Cooldown T4 **25%** | Smooth growth. ADD-vs-RELY: item that ADDS CDR = full credit; item with its own cooldown that merely benefits from CDR = partial |
| `duration_dependant` | Superior Duration T3 **28%** | T4 best (Magic Carpet 15%) undershoots. Diviner's Kevlar duration is currently *inflated* — score it down |
| `long_range` | ⚖️ **Sharpshooter T3** | Judgment anchor (range-damage). Bullet-speed (tier-flat 60%) items count partially. Opening Rounds capped below 1.5 because this ceiling exists |
| `melee_damage` | ⚖️ **Point Blank T3 (50% close-range weapon power)** | Judgment/R12 — close-range gun-amp counts as melee; cache files it under `bullet_damage_pct` |
| `vertical_mobility` (Stamina) | Stamina Mastery T3 **+2** | T4 has no stamina item — sparse upper hole |
| `movement_slow` | Lightning Scroll T4 **80%** | Active items dominate. Does NOT include fire-rate slow (own tag) |
| `fire_rate_slow` | ⚖️ **Juggernaut T4 passive 36** (effective = 36×1.0×1=36) | Rusted Barrel is a single-target ACTIVE: 32×(5s/20s)×1≈8. AoE/passive items dominate. Apply the full effective formula (see [01_scoring_units.md](01_scoring_units.md)). |
| `anti_heal` | Spirit Burn T4 **-70%** | Score magnitude of debuff |
| `bullet_resist_shred` | Crippling Headshot T4 **-16** | Score by absolute magnitude |
| `spirit_resist_shred` | Crippling Headshot T4 **-16** | Same |

⚖️ = **judgment anchor**: the user-supplied effect-per-cost 2.0 that may not be the raw-cache maximum. These override the script's raw-based suggestion.

---

## Sparse-tier extrapolation (the dual-scaling rule)

Normalized 0-2 scores should reflect *both* (a) within-tier ranking AND (b) extrapolated cross-tier growth curve. When they disagree, the curve wins.

**Algorithm**:
1. Find the highest raw value for the stat across all tiers. That's the 2.0 anchor.
2. Earlier tiers usually set lower ceilings; growth between tiers implies what each tier's "1.5" should look like.
3. If a later tier doesn't reach the extrapolated raw, its tier-best item gets less than 1.5 — proportional to how far it undershoots.

**Worked examples**:
- Magic Carpet T4 duration_dependant 15% — T3 Superior Duration 28% = 2.0. A real T4 1.5 would extrapolate to ~25%+. Magic Carpet undershoots, so it gets ~1.0, not 1.5.
- Titanic Magazine T2 100% sets the 2.0 ceiling. T3/T4 best ammo items (30% each) earn ≤1.0 against that anchor, not 1.5.
- HVR T1 60% bullet speed — every tier has a 60% bullet-speed item. Stat is tier-flat, so 60% earns the same Normalized at every tier.

**Counter-rule**: if a stat genuinely only exists in one tier (e.g., `BonusBaseHealth` only on Colossus T4 at 25%), don't pretend the curve is broken — that's the item's defining axis and it can earn 2.0 on its own.

**Outlier-anchor protection**: if the 2.0 anchor is a CLEAR OUTLIER (far above the extrapolated curve, e.g. Titanic Magazine 100% when the T2 expected-on-curve ceiling is ~45%), don't let it collapse all other items near zero. Instead, score other items against the **extrapolated curve** (what a T2 1.5-anchor "should" be), not the raw outlier max. In practice: Titanic Magazine earns 2.0; the next T2 ammo item at 20% (expected-on-curve ~45% for T2) earns ~0.9 rather than the raw-proportional 0.4.
