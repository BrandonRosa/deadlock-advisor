# Skill: Recreate the item interpretations audit

How to (re)produce the audit appended at the bottom of [item_interpretations.md](item_interpretations.md). The audit compares the AI's per-item Calculator tag scores against the values currently stored in each item's `data/items/<key>.json` `values.playstyle_score` and lists the discrepancies as actionable rows.

This document is the runbook for a fresh session. Read it end-to-end before re-running the audit — the order of operations matters (you populate the Calculator tags tables FIRST, then generate the audit from them).

---

## 1. What the audit is

The audit is a long markdown section at the end of [item_interpretations.md](item_interpretations.md). For every item it shows:

| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |
|---|---|---|---|---|---|

The audit answers: "for each tag where the per-item Calculator tags table I wrote disagrees with what's already in the JSON, what should change, and how confident should the user be in auto-applying that change?"

It does NOT modify any JSONs. The user reviews the Apply? checkboxes and applies changes in a separate follow-up session.

---

## 2. Two-stage workflow

Stage A — **Per-item Calculator tags tables** (the hand-judgment part).
- Each item in `item_interpretations.md` has a `### Calculator tags` table with rows like:
  ```
  | Calc tag | Effective Raw | Normalized | Mode | Reasoning |
  ```
- Each row has a `Mode` of either `adds` (item provides the stat directly) or `relies` (item scales with / depends on the stat).
- This stage is judgment-heavy. Apply the Tag Inference Rules (R1-R16, see §4) to each item.

Stage B — **Audit generation** (mechanical, scripted).
- Parse every item's Calculator tags table.
- Compute `AI blended = sum(adds rows for tag) + 0.25 × sum(relies rows for tag)`.
- Read `data/items/<key>.json` → `values.playstyle_score` → `<tag>` for the JSON value.
- Compare; emit a row if they disagree (or if AI has a tag JSON doesn't).
- Apply smart defaults to the Apply? checkbox.

Critical: Stage A must be complete and saved to the .md before Stage B runs. The audit script only reads, it doesn't generate tags.

---

## 3. The blending convention

JSONs carry a single number per tag that conceptually blends both modes. To compare apples-to-apples:

```
AI_blended[tag] = sum(normalized for rows where mode=adds and tag matches)
              + 0.25 × sum(normalized for rows where mode=relies and tag matches)
```

`adds` dominates. `relies` is a small synergy bonus. Multiple rows of the same mode for the same tag are summed before blending.

Concrete example for **Extra Spirit** after Round 7:
- Calc tags table has rows: `spirit_damage 1.5 adds`, `spirit_burst_damage 0.6 adds`, `spirit_continuous_damage 0.6 adds`, `multi_ability_focus 0.5 adds`, `single_ability_focus -0.2 adds`.
- Blended:
  - `spirit_damage` = 1.5 + 0.25 × 0 = **1.5**
  - `spirit_burst_damage` = 0.6 + 0.25 × 0 = **0.6**
  - `single_ability_focus` = -0.2

---

## 4. Tag Inference Rules (R1-R16)

These live in [item_interpretations.md](item_interpretations.md) under `## Tag Inference Rules (Round 7)`. Read them there — they are the canonical source. Quick index:

| # | Rule |
|---|---|
| R1 | `spirit_power` → `spirit_damage` consolidation (no `spirit_power` tag exists) |
| R2 | Damage propagation: SP lifts burst+continuous spirit; bullet_damage lifts gun_burst (heavier) + gun_continuous (lighter); fire_rate lifts gun_continuous (heavier) + gun_burst (lighter) |
| R3 | +0.15 category baseline: Weapon→bullet_damage, Spirit→spirit_damage, Vitality→high_max_hp (+ R2 floor propagation) |
| R4 | Ability-focus tags: multi-ability boosters → +multi_ability_focus + small -single_ability_focus; charged-ability items → +single_ability_focus; imbued items → +single_ability_focus |
| R5 | Proc items get BOTH `x_burst_proc` AND `x_continuous_proc`; lean by cd (short = continuous-heavier, long = burst-heavier) |
| R6 | Item-deals-damage rule: don't drop the damage row, encode at amortized score |
| R7 | Class-fit: melee/close-range items → `grounded adds`; flight/leap items → `aerial adds`. Prefer single positive over negative on opposite |
| R8 | Healing items get `high_max_hp relies` (heals scale with carrier HP cushion) |
| R9 | Stamina items get full suite: horizontal_mobility + vertical_mobility + aerial + escape + engage |
| R10 | Heal-item bundle: assist_importance (if ally-targetable), farmer, burst_heal AND continous_heal blend, high_max_hp relies, damage_sponge relies |
| R11 | Melee items get close_range + engage |
| R12 | Melee counts as weapon damage — close-range weapon items get melee_damage |
| R13 | Counter-flavor items get `counter_importance adds` (1.0-1.5 typical) |
| R14 | Movement-speed items get small `farmer adds` (0.3-0.5) |
| R15 | Don't drop tags just because the math is small — encode at 0.2-0.3 instead |
| R16 | Special-case items get prose flags in Interpretation, not tag gymnastics (Golden Goose Egg) |

Apply rules per-item using judgment. R1, R3, R9 are mechanical (always fire on trigger). R2 is mechanical given the trigger row exists. R4-R8, R10-R15 require reading the item's mechanic and deciding which rules apply.

---

## 5. Canonical Calculator tag list

The Calculator tags table can ONLY use tags that exist in `data/items/<any>.json` → `values.playstyle_score` keys. Cross-check against [tags.json](tags.json). Common mistakes:

- `lane_pusher` — NOT a canonical tag (used in some interpretations but the JSON schema doesn't have it). Drop these rows or rename to something canonical.
- `spirit_power` — NOT a canonical tag. R1 says rename to `spirit_damage`.
- `continuous_damage` vs `gun_continuous_damage` — both exist but mean different things. `continuous_damage` is the generic axis; `gun_continuous_damage` is bullet-specific. Use the more specific one when the source is clear.

Run a sanity check before audit generation:

```python
# In Python:
import json
with open('data/items/extra_spirit.json') as f:
    canonical = set(json.load(f)['values']['playstyle_score'].keys())
# Then compare each row's tag against canonical.
```

---

## 6. Cross-tier ceiling reference

When deciding Normalized values (0-2 scale), each stat has a cross-tier 2.0 anchor. Look up the stat in the table in [item_interpretations.md](item_interpretations.md) under `## Cross-tier ceiling reference` (in the Round 7 plan, also embedded). Highlights:

| Stat / axis | 2.0 ceiling | Notes |
|---|---|---|
| `magazine_size_dependant` | Titanic Magazine T2 **100%** | T3/T4 best falls FAR below — sparse-tier rule pulls them to ≤1.0 |
| `bullet_damage` (BaseAttackDamagePercent) | Glass Cannon T4 **80%** | Smooth growth curve |
| `bullet_damage` (BonusBulletSpeedPercent) | tier-flat **60%** | Treat under `long_range` |
| `high_max_hp` (BonusHealth) | Fortitude T3 **375** | T2 best is weak (90) — sparse-tier |
| `fire_rate` | Blood Tribute T3 **35%** | Active windows reduce effective rate |
| `continous_heal` (BonusHealthRegen) | Juggernaut T4 **8/sec** | T3 has no big regen item |
| `bullet_resistance` | Bullet Resilience T3 / Warp Stone T3 **30%** | T4 best undershoots |
| `spirit_resistance` | Fury Trance T3 / Scourge T4 **40%** | Tied T3 and T4 |
| `bullet_lifesteal` | Leech T4 **25%** | T2/T3 plateaus |
| `spirit_lifesteal` | Infuser T4 **70%** (active) | Passive ceiling much lower |
| `spirit_damage` (TechPower) | Diviners Kevlar T4 **35** + Boundless 30+15%mult | Boundless mult is unique 2.0 axis |
| `cooldown_reduction` | Transcendent Cooldown T4 **25%** | Smooth growth |
| `duration_dependant` | Superior Duration T3 **28%** | T4 best (Magic Carpet 15%) undershoots |
| `vertical_mobility` (Stamina) | Stamina Mastery T3 **+2** | T4 has no stamina item — sparse upper hole |
| `movement_slow` | Lightning Scroll T4 **80%** | Active items dominate |
| `fire_rate_slow` | Juggernaut T4 **36%** | T3 best is anomalously low |
| `anti_heal` | Spirit Burn T4 **-70%** | Score magnitude of debuff |
| `bullet_resist_shred` | Crippling Headshot T4 **-16** | Score by absolute magnitude |
| `spirit_resist_shred` | Crippling Headshot T4 **-16** | Same |

---

## 7. Sparse-tier extrapolation (the dual-scaling rule)

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

---

## 8. Street Brawl (T?) items

The 17 T? items are flagged `streetbrawl_only: true` in `_scrape_cache.json`. They cap Normalized at 1.5 (never 2.0) since their reach is mode-locked. Most function as ability-variants rather than calculator entries — Calculator tags table is left as:

```
### Calculator tags
*(n/a — Street Brawl mode-locked item; no purchasable form in standard play. Per plan, T? items cap at 1.5 Normalized if/when populated, and most function as ability-variants rather than calculator entries.)*
```

The audit script skips these items because they have no calc tag rows.

---

## 9. Audit generation script

Write a Python script (temp file, delete after running). Skeleton:

```python
"""Round N audit regeneration."""
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

MD_PATH = r"public\tag_generator\data\item_interpretations.md"
ITEMS_DIR = r"public\tag_generator\data\items"
AUDIT_THRESHOLD = 0.15
BIG_DIFF_THRESHOLD = 0.6

def parse_items(md_text):
    """Split on '\n## ', extract normalized_name/tier/category, parse Calculator tags table rows."""
    items = []
    parts = re.split(r'\n## ', md_text)
    for part in parts[1:]:
        # Extract metadata from "- **normalized_name**: `name`" etc.
        # Then regex-find the "### Calculator tags\n" block and parse | tag | raw | norm | mode | reasoning | rows.
        ...
    return items

def blend_ai(rows):
    """AI blended = sum(adds) + 0.25 × sum(relies) per tag."""
    adds, relies = {}, {}
    for r in rows:
        bucket = adds if r['mode'] == 'adds' else relies
        bucket[r['tag']] = bucket.get(r['tag'], 0.0) + r['normalized']
    return {t: adds.get(t, 0) + 0.25 * relies.get(t, 0) for t in set(adds) | set(relies)}

def load_json_scores(nname):
    """Load values.playstyle_score for an item from data/items/<nname>.json."""
    path = os.path.join(ITEMS_DIR, f'{nname}.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f).get('values', {}).get('playstyle_score', {})

def make_action(ai, js, has_ai, has_js):
    """Return (kind, diff, action_text, apply_default) or None if no row needed."""
    if has_ai and has_js:
        diff = ai - js
        if abs(diff) < AUDIT_THRESHOLD: return None
        kind = 'bump' if diff > 0 else 'cut'
        text = f'{kind.capitalize()} JSON → {ai:.2f}'
        apply = '[x]' if abs(diff) <= BIG_DIFF_THRESHOLD else '[ ]'
        if abs(diff) > BIG_DIFF_THRESHOLD: text += '  *(large diff — review)*'
        return (kind, diff, text, apply)
    elif has_ai:
        # AI has tag, JSON doesn't — Add
        apply = '[x]' if abs(ai) <= BIG_DIFF_THRESHOLD else '[ ]'
        text = f'Add row, set {ai:.2f}'
        if abs(ai) > BIG_DIFF_THRESHOLD: text += '  *(large diff — review)*'
        return ('add', ai, text, apply)
    elif has_js:
        # JSON has tag, AI doesn't — Drop (default no per R15)
        return ('drop', -js, 'Drop row (AI does not mark this tag)', '[ ]')
    return None

def main():
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        full = f.read()
    audit_idx = full.find('\n# Audit:')
    body = full[:audit_idx].rstrip() if audit_idx >= 0 else full.rstrip()
    items = parse_items(body)
    # Write audit sections per tier, with table rows for each item.
    # Append empty per-tier checklists at the bottom.
    out = ['', '# Audit: AI Normalized vs. existing JSON playstyle_score (Round N)', ...]
    # ... iterate items, group by tier, emit tables ...
    with open(MD_PATH, 'w', encoding='utf-8') as f:
        f.write(body + '\n' + '\n'.join(out))

main()
```

Key implementation details:
- **Always use UTF-8** with `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')`. Some tag strings contain `→`, `—`, etc. and Windows cp1252 will choke without this.
- **Tier extraction regex**: `re.search(r'-\s*\*\*tier\*\*:\s*(\S+)', body)` then `tier[0]` gives '1' / '2' / '3' / '4' / '?'.
- **Calc tags table parsing**: split on lines starting with `|`, skip `|---` separator and `| Calc tag` header. Parse Normalized as float; treat `—` / `-` / empty as None (skip the row).
- **Mode parsing**: trim cell, lowercase, accept only `adds` or `relies`. Other modes skip.
- **Filter threshold**: AUDIT_THRESHOLD = 0.15 (only emit rows where |diff| ≥ 0.15 or one side is missing).
- **Big diff threshold**: BIG_DIFF_THRESHOLD = 0.6 (auto-default to `[ ]` for review).

---

## 10. Apply? checkbox smart defaults

| Action | |diff| ≤ 0.6 | |diff| > 0.6 |
|---|---|---|
| Bump | `[x]` | `[ ]` *(large diff — review)* |
| Cut | `[x]` | `[ ]` *(large diff — review)* |
| Add row | `[x]` | `[ ]` *(large diff — review)* |
| Drop row | `[ ]` (R15: don't drop) | `[ ]` (also don't drop) |

Reasoning:
- Drops default to off because R15 says "don't drop tags just because the math is small."
- Large diffs default to off because they need eyeball review — a +1.2 diff often means the JSON is missing the tag entirely or the AI is wildly miscalibrated.

---

## 11. End-of-audit per-tier checklist

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

The user fills these in with cross-tier patterns they spot during review (e.g., "all weapon items still need R3 baseline added to JSON").

---

## 12. Verification checklist (before declaring audit done)

- [ ] No `spirit_power` rows remain in Calculator tags tables (R1).
- [ ] Every item has at least one row matching its category baseline at ≥ 0.15 (R3).
- [ ] Every Spirit item with `spirit_damage adds N` has `spirit_burst_damage` and `spirit_continuous_damage` rows (R2).
- [ ] Every Stamina item has aerial/escape/engage rows (R9).
- [ ] Every healing/regen/lifesteal item has `high_max_hp relies` (R8).
- [ ] Every melee item has close_range + engage; close-range weapon items also have melee_damage (R11/R12).
- [ ] Counter-flavor items have counter_importance (R13).
- [ ] Sprint/MS items have a farmer adds row (R14).
- [ ] Street Brawl items (T?) remain n/a — no calc tags rows.
- [ ] Audit section appended (not duplicated). Old audit deleted if regenerating.
- [ ] Audit has the Apply? column with smart defaults.
- [ ] Empty per-tier "Apply these changes to JSONs" checklist at the very bottom.
- [ ] No item JSONs modified during this session (audit is read-only against JSONs).

---

## 13. Files this skill touches

| File | Role |
|---|---|
| [item_interpretations.md](item_interpretations.md) | Read AND write. Calc tags tables and the audit section both live here. |
| [_scrape_cache.json](_scrape_cache.json) | Read-only. Source of raw_stats per item, also where streetbrawl_only flag lives. |
| [tags.json](tags.json) | Read-only. Canonical Calculator tag list (sanity check before using a tag). |
| [items/&lt;key&gt;.json](items/) | Read-only during audit. Each has `values.playstyle_score` which the audit compares against. NEVER write these during audit. |
| `_baseline_table.json` | Tertiary hint only; unreliable, don't trust. |

---

## 14. When the user pushes back on a per-item score

This always happens. The pattern:

1. User identifies a class of items the AI scored poorly (e.g., "all stamina items should have aerial").
2. Codify the correction as a new rule (or refine an existing rule) in the `## Tag Inference Rules` section of `item_interpretations.md`.
3. Re-pass any items the new rule touches (don't try to re-pass everything — only items where the new rule applies).
4. Regenerate the audit (it re-runs over the whole file).
5. Spot-check the user-named items in the new audit to confirm the rule landed.

The rule doc is the canonical reference for "why is this item scored this way" — keep it current.

---

## 15. Common mistakes to avoid

- **Don't run the audit script before updating Calculator tags tables.** The audit reads tables, doesn't generate them.
- **Don't modify item JSONs during the audit session.** Audit is read-only against JSONs. JSON updates are a separate follow-up.
- **Don't use tags that aren't in the canonical list.** `lane_pusher` and `spirit_power` are common offenders. Audit will flag these as `Drop row` but they were always wrong — the AI table itself shouldn't have them.
- **Don't double-encode negative tags.** R7 says prefer single positive (`grounded adds 0.4`) over negative on opposite (`aerial adds -0.4`). Picking both double-counts the anti-synergy.
- **Don't write Reasoning columns that just restate the rule name.** Include WHY: which raw stat triggered the rule, what the propagation values were derived from, why the Normalized landed where it did.
- **Don't forget Street Brawl items get skipped.** If your audit script doesn't handle items with empty Calc tags tables, it'll crash.

---

## 16. Quick-start commands

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

---

## 17. Round history (for context)

- Round 5: Phase A — populated raw-stub Game stats tables for all 172 items from `_scrape_cache.json`.
- Round 6: Phase B — populated Calculator tags tables for all 172 items using sparse-tier extrapolation and the dual-scaling rule. Phase C — first audit appended.
- Round 7: Codified R1-R16 Tag Inference Rules after user identified systemic gaps in T1 audit. Full re-pass of all 172 items + regenerated audit with Apply? checkbox column.

Future rounds should follow the same pattern: identify a class of mistakes → write a rule → re-pass affected items → regenerate audit → spot-check.
