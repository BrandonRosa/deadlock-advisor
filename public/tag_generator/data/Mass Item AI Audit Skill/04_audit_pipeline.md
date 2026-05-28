# 04 — Audit pipeline (the runbook)

## What the audit is

The audit is a long markdown section at the end of [../item_interpretations.md](../item_interpretations.md). For every item it shows:

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|

The audit answers: "for each tag where the per-item Calculator tags table I wrote disagrees with what's already in the JSON, what should change, and how confident should the user be in auto-applying that change?"

It does NOT modify any JSONs. The user reviews the Apply? checkboxes and applies changes in a separate follow-up session.

## Workflow — re-scrape, then two interpretation passes, then audit

The audit ALWAYS re-runs the interpretations from a fresh scrape unless explicitly told not to.

**Step 0 — Re-scrape.** `python _scrape_items.py` rebuilds `../_scrape_raw_dump.json` from the wiki (BASE / non-enhanced variant — it reads the `#tabber-Default` panel). It captures structured passive + active/passive ability blocks (scaling expanded, e.g. `95×0.47` → "95 base + 0.47×Spirit Power"), value/label per stat chip (NOT the misleading icon title), and prose sections (Notes / Notable Interactions / Buildup Per Shot). Disambiguation/apostrophe pages use `SLUG_OVERRIDES`.

**Pass 1 — Interpret (hand-judgment).** For every item, author the `### Calculator tags` table. Columns (6):
```
| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
```
- **Descriptive raw** — what the item literally provides (e.g. `-32% fire rate, 5s, single-target`).
- **Comparative raw** — a single number in the tag's comparison unit (see [01_scoring_units.md](01_scoring_units.md) / [tag_descriptions.md](tag_descriptions.md)), derived by judgment so it is comparable across EVERY item (effective gun-dmg %, effective Spirit Power, effective % shred after uptime/single-target discounts, proc-index value, or — for dimensionless tags — a 0–100% importance estimate). Apply the conversion conventions: spirit_damage = effective SP (`TotalDamage/5 + SpiritScaling×20` → relies); enemy-debuff tags written POSITIVE; proc indices via the formulas in 01.
- **Mode** — `adds` or `relies`.
- During Pass 1 the `Normalized` column is left for Pass 2. **Do NOT assign 0–2 in isolation** — you cannot normalize one item without the rest of the set.

**Pass 2 — Normalize (effect-per-cost).** ONLY after every item across ALL tiers has a comparative raw. `python _normalize.py --write` compares comparative raws tag-by-tag across the whole set and fills the `Normalized` column. (Judgment lives in the Pass-1 comparative raws + the laddered/direct classification; the script applies the model — see [03_normalization.md](03_normalization.md).)

**Step 3 — Audit.** `python _run_audit.py` blends `adds + 0.25×relies`, compares to each `data/items/<key>.json` → `values.playstyle_score`, and appends a `# Audit:` suggestions section at the bottom of `../item_interpretations.md`. SUGGESTIONS ONLY — it never writes item JSONs.

Critical: Pass 1 + Pass 2 must be complete and saved before the audit runs. The audit script only reads.

## The blending convention (Round 10+)

JSONs carry a single number per tag. The merge of `adds` and `relies` modes now happens **before normalization**, inside `_normalize.py` — so each (item, tag) pair has exactly one Normalized value.

```
effective_raw[item, tag] = Σ adds.raw + 0.5 × Σ relies.raw      (pre-normalize)
Normalized[item, tag]    = normalize(effective_raw, anchors)    (per-tag anchor set)
```

The audit then reads `Normalized` directly — no further blending at audit time.

**Table cosmetics**: the single Normalized is written into the *first `adds` row* for that tag. Any subsequent `adds` row OR any `relies` row for the same tag shows `—` in the Normalized column. Their contribution is folded into the adds-row's blended effective raw.

Concrete example for **Extra Spirit** under the new pipeline:
- Calc tags table rows: `spirit_damage 17 adds` (flat +SP), `multi_ability_focus 0.5 adds`, `single_ability_focus -0.2 adds`.
- No `relies` row → effective_raw equals the single adds raw for each tag.
- After normalize: `Normalized[spirit_damage]` = whatever the per-tag anchor gives → audit compares directly.

Concrete example with a `relies` row — **Close Quarters**:
- Rows: `bullet_damage 16 adds` (uptime-discounted close-range value), `bullet_damage 20 relies` (range-gate scaling benefit).
- `effective_raw[bullet_damage] = 16 + 0.5 × 20 = 26` (pre-normalize).
- `_normalize.py` normalizes 26 against the per-tag anchor; writes the Normalized into the `adds` row and `—` into the `relies` row.

## The audit pipeline → `_run_audit.py` (hand-table driven)

The audit is **hand-table driven** and the output lives at the **bottom of [../item_interpretations.md](../item_interpretations.md)** (the format the user likes). The persistent generator is [`../_run_audit.py`](../_run_audit.py). There is **no automated scraper** — `../_scrape_cache.json` is an AI-built artifact (each item's wiki data-table was read by hand/WebFetch, *not* the "enhanced" table), so a patch is reflected by re-passing the tables, not by re-running a scraper.

### Two stages

- **Stage A — author/update the `### Calculator tags` tables (judgment).** For each item, read the wiki data-table → write the Interpretation + Game stats → derive Calculator tags with effective stats + the units ([01_scoring_units.md](01_scoring_units.md)) + normalization ([03_normalization.md](03_normalization.md)). *This is where a balance patch / tag clarification gets incorporated.* Rows are `| Calc tag | Effective Raw | Normalized | Mode | Reasoning |` with Mode = `adds` or `relies`.
- **Stage B — run `_run_audit.py` (mechanical).** It parses every item's Calculator tags table, blends `AI = adds + 0.25 × relies`, compares to each `data/items/<key>.json` `values.playstyle_score`, and appends the per-item audit section at the bottom of `../item_interpretations.md`, replacing any prior `# Audit:` section. SUGGESTIONS ONLY — it never writes item JSONs.

```
python _run_audit.py    # → rewrites the "# Audit:" section at the bottom of item_interpretations.md
```

The script is **crash-safe**: it builds the new file in memory and swaps it in with `os.replace` (atomic). If interrupted (e.g. out of credits), the original `item_interpretations.md` is untouched — the swap only happens once the whole file is built. Re-running is idempotent (it always replaces the single `# Audit:` section).

### Output format (per item, grouped by tier)

```
### Extended Magazine (`extended_magazine`, T1 Weapon)
Path: `data/items/extended_magazine.json`

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|
| `bullet_damage` | 0.80 | 1.00 | +0.20 | Bump JSON → 1.00 | `[x]` |
```

- A row appears only where **|Diff| ≥ 0.15** OR one side is missing.
- JSON current = item JSON value or `(null)`; AI blended = blended table value or `(drop)`.
- Actions: `Bump JSON → X` / `Cut JSON → X` (both present) · `Add row, set X` (AI only) · `Drop row` (JSON only).
- Apply? defaults per the Apply? convention below; the box also accepts a forced number.

### Judgment facts to apply when (re-)passing the Stage-A tables

These are correct *readings* (independent of any script) — apply them when authoring the Calculator tags tables:

| Item | Correct read |
|---|---|
| Rusted Barrel / Suppressor / Hunters Aura / Juggernaut | `fire_rate_slow` (NOT `movement_slow`); fire-rate slow also earns partial `bullet_resistance` / `gun_continuous_resistance` pseudo-credit (see [01_scoring_units.md](01_scoring_units.md)) |
| Juggernaut / Enduring Speed / Fleetfoot | resist **slows** → `cc_resist`, NOT generic `debuff_resistance` |
| Lightning Scroll | its `SlowPercent` + `MovementSpeedSlow` are one effect — don't double-count `movement_slow` |
| Spellslinger | high *effective* `fire_rate` (ability-spam) despite no raw fire-rate stat |
| Leech | carries `spirit_lifesteal` (25%) |
| Veil Walker | `burst_heal` (NOT `continous_heal`) |
| Healing Booster / Healing Tempo | meaningful `self_heal` too |
| Diviner's Kevlar | `duration_dependant` is inflated — score down |
| Monster Rounds | bullet damage is NPC-only — don't inflate hero `bullet_damage` |
| Opening Rounds | `long_range` capped below 1.5 (Sharpshooter ceiling) |
| Ballistic Enchantment | include its effective bullet-damage-up |
| ⚖️ judgment anchors (see [03_normalization.md](03_normalization.md)) | Vampiric Burst (`bullet_lifesteal`), Spirit Resilience (`spirit_resistance`), Sharpshooter (`long_range`), Point Blank (`melee_damage`) |
| Stamina items (horizontal_mobility) | 1 stamina charge ≈ 0.6–0.7 m/s effective horizontal mobility (6m dash / 9s cycle). Use m/s, not raw charge count. |
| Sprint-only / channel-only bonuses | Sprint speed while channeling or sprinting only: take the m/s raw, then apply ×0.5 discount for restricted uptime (you can't always be sprinting/channeling in a fight). |
| spirit_damage adds row with a proc | Combine flat SP + proc SP-equiv in one row: `adds raw = flat_SP + (proc_base + proc_scaling × 20) / 5`. Leave the `relies` row for the SP-scaling benefit. |
| Items meant to be sold (Golden Goose Egg) | Do NOT score negative side effects (damage penalties, etc.) — the hero sells this item before those penalties matter in real fights. |
| Triggered regen (Mystic Regeneration pattern) | Apply trigger-rate uptime to both units: `self_heal raw = rate × duration × uptime`; `continous_heal raw = rate × uptime` (not raw rate). |

### Refreshing source data after a patch → `_scrape_items.py`

`../_scrape_cache.json` is an AI-built artifact — there is no live scraper feeding it. To pull fresh wiki data after a balance patch, use [`../_scrape_items.py`](../_scrape_items.py). It is **standalone**: it only *imports* the authoritative item list (`ITEMS`, `norm`) from `public/resources/items/generate_items.py` — it does NOT modify that file (which exists to fetch item images/descriptions for the app; leave it alone).

What it does, per item, from `https://deadlock.wiki/<Item_Name>`:
- selects the **base (non-enhanced) infobox** — the first `table.item-infobox` with no `Enhanced` row (NOT the enhanced variant);
- captures `infobox_lines` (cost, tier, passive/active, the stat blob, "Upgrades From", codename), the `description`, and the **`changelog`** (date + change) — the changelog tells you exactly what the patch altered;
- writes everything to `../_scrape_raw_dump.json` (crash-safe temp-then-`os.replace`; per-item errors are recorded, not fatal).

```
python _scrape_items.py                       # all 172
python _scrape_items.py "Toxic Bullets" ...   # just-these, for spot-checks
```

**Full post-patch workflow (repeatable):**
1. `python _scrape_items.py` → fresh `../_scrape_raw_dump.json`.
2. Skim each item's `changelog` to find what changed since last pass (stat tweaks, reworks).
3. For changed items, re-do **Stage A** in `../item_interpretations.md`: update Interpretation + Game stats from the new `infobox_lines`, then re-derive the `### Calculator tags`.
4. `python _run_audit.py` → regenerates the `# Audit:` section at the bottom of `../item_interpretations.md`.
5. Review the `Apply?` boxes; apply in a follow-up session.

Note: the scrape gives raw text, not structured `raw_stats`. Re-building structured `raw_stats`/`mapped_stats` (the old `../_scrape_cache.json` shape) is optional — Stage A can read the `infobox_lines` directly.

## Apply? column — values and smart defaults

The **Apply?** box on each suggestion row is how the user tells the follow-up apply step what to do. It accepts three kinds of value:

| Value | Meaning |
|---|---|
| `[x]` | Apply the **Suggested** value to the item JSON. |
| `[ ]` | Skip — leave the current JSON value untouched. |
| a **number** (e.g. `0.8`) | **Force that exact value** into the JSON, overriding the AI's Suggested number. |

The number-override lets the user accept the *direction* of a suggestion while dictating the magnitude — e.g. the audit suggests `1.5` but the user types `0.9` and `0.9` is what gets written. The apply-reader parses the cell: a bare number → use it; `[x]` → use Suggested; anything else (`[ ]`, blank) → skip.

Smart defaults (set by `_run_audit.py`):

| Action | \|diff\| ≤ 0.6 | \|diff\| > 0.6 |
|---|---|---|
| Bump | `[x]` | `[ ]` *(large diff — review)* |
| Cut | `[x]` | `[ ]` *(large diff — review)* |
| Add row | `[x]` | `[ ]` *(large diff — review)* |
| Drop row | `[ ]` (R15: don't drop) | `[ ]` (also don't drop) |

Reasoning:
- Drops default to off because R15 says "don't drop tags just because the math is small."
- Large diffs default to off because they need eyeball review — a +1.2 diff often means the JSON is missing the tag entirely or the AI is wildly miscalibrated.
- The user can always override a default by typing a number.

## End-of-audit per-tier checklist

After all per-item tables, append:

```markdown
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
```

The user fills these in with cross-tier patterns they spot during review.

## Verification checklist (before declaring audit done)

- [ ] No `spirit_power` rows remain in Calculator tags tables (R1).
- [ ] Every item has at least one row matching its category baseline at ≥ 0.15 (R3).
- [ ] Every Spirit item with `spirit_damage adds N` has `spirit_burst_damage` and `spirit_continuous_damage` rows (R2).
- [ ] Every Stamina item has aerial/escape/engage rows (R9).
- [ ] Every healing/regen/lifesteal item has `high_max_hp relies` (R8).
- [ ] Every melee item has close_range + engage; close-range weapon items also have melee_damage (R11/R12).
- [ ] Counter-flavor items have counter_importance (R13).
- [ ] Sprint/MS items have a farmer adds row (R14).
- [ ] Street Brawl items (T?) remain n/a — no calc tags rows (unless they have real stats).
- [ ] Audit section appended (not duplicated). Old audit deleted if regenerating.
- [ ] Audit has the Apply? column with smart defaults.
- [ ] Empty per-tier "Apply these changes to JSONs" checklist at the very bottom.
- [ ] No item JSONs modified during this session (audit is read-only against JSONs).

## Quick-start commands

```powershell
# Sanity check: how many items have Calculator tags tables?
$content = Get-Content -Raw "public\tag_generator\data\item_interpretations.md"
([regex]::Matches($content, '### Calculator tags\n\|')).Count
# Should be ~155 (172 items - 17 Street Brawl)

# Find any spirit_power rows that R1 missed:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`spirit_power`'

# Verify audit section was regenerated:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '^# Audit:'
# Should show ONE match. Two means old audit wasn't deleted.

# Count audit rows by Apply? state:
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`\[x\]`'
Select-String -Path "public\tag_generator\data\item_interpretations.md" -Pattern '`\[ \]`'
```
