# Mass Item AI Audit Skill

How to (re)produce the per-item Calculator tag scores and the audit appended at the bottom of [../item_interpretations.md](../item_interpretations.md). The audit compares the AI's hand-authored scores against each item's `data/items/<key>.json` `values.playstyle_score` and lists discrepancies as actionable rows.

This skill is split into focused modules. **Read SKILL.md first**, then load whichever module is relevant to your current task. For a fresh session running the full audit, read in order: 01 → 02 → 03 → 04, with 05 and tag_descriptions.md available as reference.

## Modules

| File | Role |
|---|---|
| [SKILL.md](SKILL.md) | This file — workflow overview, file index, round history |
| [01_scoring_units.md](01_scoring_units.md) | Tag scoring semantics — comparison units, proc index formulas, direction rules, pseudo-effects, judgment vs stat-mappable vs dimensionless |
| [02_tag_inference_rules.md](02_tag_inference_rules.md) | R1–R22 mechanical Tag Inference Rules + canonical Calculator tag list |
| [03_normalization.md](03_normalization.md) | §5b normalization methodology (0–2 scale), cross-tier ceiling reference, sparse-tier rule, Street Brawl handling |
| [04_audit_pipeline.md](04_audit_pipeline.md) | The runbook — scrape → interpret → normalize → audit; scripts; Apply? column; verification checklist; quick-start commands |
| [05_common_mistakes.md](05_common_mistakes.md) | Common mistakes to avoid + user-pushback pattern |
| [tag_descriptions.md](tag_descriptions.md) | **Canonical long-form per-tag reference** — source of truth for units and item-specific anchors. 01_scoring_units.md mirrors this operationally. |

## Workflow at a glance (Round 11+)

> **IMPORTANT:** At each step that says "ask", pause and confirm with the user before proceeding. The user may want to skip steps if the data is fresh, or jump back to a previous step if a downstream check reveals an upstream issue.

**Step 0 — Scrape if necessary** *(ask)*
`python _scrape_items.py` rebuilds `_scrape_raw_dump.json` from the wiki. Skip if the dump is fresh and the wiki hasn't changed. Re-scrape ONLY changed items by passing names: `python _scrape_items.py "Indomitable" "Grit"`. Always re-scrape after editing `generate_items.py` to add or re-tier items.

**Step 1 — Re-interpret items summary if necessary** *(ask)*
For each item, re-author the `### Interpretation` prose + `### Wiki stats` table from the scrape data. Skip if the structural template is current. Treat existing Interpretation prose as a starting point, not gospel — re-derive from scrape `descriptions` + `sections` (Notes, Interactions) so behavioral nuances (self-cast, threshold gates, range gates, "Can be self cast", etc.) are captured.

**Step 2 — Re-evaluate Calculator tags WITH context clues inline**
For every item, author the `### Calculator tags` table. **In this pass, leave context clues (tag descriptions, formulas, unit hints) inline in the table** as comments OR as `(unit hint)` parentheticals in the Comparative raw column. This keeps reasoning auditable while you work. Sources to consult:
- [tag_descriptions.md](tag_descriptions.md) — canonical per-tag reference
- [01_scoring_units.md](01_scoring_units.md) — comparison units, proc formulas, direction rules
- [02_tag_inference_rules.md](02_tag_inference_rules.md) — R1–R32 inference rules
- [05_common_mistakes.md](05_common_mistakes.md) — known pitfalls

**Step 3a — Re-evaluate Raw effective stats; remove injected context clues**
Re-read each Comparative raw value — does the number actually express what the tag's comparison unit demands? Once you're confident, strip the inline `(unit hint)` parentheticals OR move them to a tighter form so the table is clean. The Normalized column is still blank at this point.

**Step 3b — Normalize raws**
`python _normalize.py --write` fills the `Normalized` column based on the §5b effect-per-cost methodology.

**Step 4 — Create Tag Staple Table + ask if it's good**
`python _tag_staple_table.py` (NEW) emits a per-tier-per-tag table showing the (0.5 / 1.0 / 1.5 / 2.0) raw thresholds and the items currently sitting closest to each milestone. This is a sanity-check for "is the tag's anchor set reasonable?" — if a tag's 2.0-staple item isn't actually that tag's named anchor, something upstream is off. **ASK the user:** does the staple table look right? If corrections are needed, loop back to Step 2 (re-author tag rows) or Step 3a (re-derive raw values) per the user's direction.

**Step 5 — Create audit approval tables**
`python _run_audit.py` reads the (already-blended) Normalized column from `### Calculator tags` tables, compares to each item's `data/items/<key>.json` `values.playstyle_score`, and appends the `# Audit:` section at the bottom of `item_interpretations.md`. SUGGESTIONS ONLY — no JSON writes. The audit table is column-padded for readability (Round 11+). Apply? defaults: `[x]` for Bump/Cut/Add with |diff| ≤ 0.6; `[ ]` for Drops and for |diff| > 0.6.

The scripts (`_scrape_items.py`, `_normalize.py`, `_run_audit.py`, `_tag_staple_table.py`) live in `../` (the `data/` directory). The skill folder contains only documentation.

## Apply? column conventions (Step 5)

- `[ ]` = skip (don't apply)
- `[x]` = apply the AI blended value exactly
- `[<number>]` (e.g. `[.66]`, `[1.5]`) = force this specific value into the JSON

## Known AI biases (from Round 10 audit-decision analysis)

The user has reviewed thousands of audit rows. These patterns repeat — when authoring/editing tags, be aware:

1. **Proc tags are overscored.** Practical uptime + range/threshold difficulty is not captured by the raw formula. Scale down: aura/range-gated procs ×0.5–0.7; threshold-gated procs (>X dmg before triggering) ×0.6–0.8; single-instance bullet-on-hit ×1.0.
2. **Range/positional tags get over-mirrored.** Only apply `close_range`/`mid_range`/`long_range`/`aerial`/`grounded` when they're a CORE identity, not as an automatic anti-affinity mirror.
3. **`single_target`, `counter_importance`, `engage`, `aoe_cluster`, `damage_sponge` get over-applied.** Be strict — only score these where the item's primary mechanic actually drives that axis, not where the axis is incidentally touched.
4. **`single_ability_focus = -0.5` (negative anti-affinity) is universally rejected.** Don't author negative single_ability_focus — drop the row instead.
5. **Don't cross-baseline.** Weapon items only get the Weapon baseline (`bullet_damage`); Vitality only get `high_max_hp`; Spirit only get `spirit_damage`. Score additional stats explicitly, don't grant baselines outside the item's category.
6. **`hybrid_damage_usage` is reserved for TRUE hybrids** (Mystic Shot, Tesla Bullets, Spiritual Overflow, Mercurial Magnum). Don't apply it just because an item has both a +SP and a +WD stat.
7. **Mystic-prefix items get over-tagged.** Compound effects ≠ many high tags. Be selective.
8. **`farmer` at T2–T4 is over-applied.** Only true farm-rotation items (movement-speed-heavy, regen-heavy) score farmer above T1.
9. **`continous_heal` at T4 is over-applied.** Reserve for items whose primary purpose is sustained healing outside the 1s burst window.
10. **`scaling_late` is reserved for TRUE late-game scalers.** T4 stat sticks ≠ scaling_late automatically.

## Files this skill touches

| File | Role |
|---|---|
| [../item_interpretations.md](../item_interpretations.md) | Read AND write. Calc tags tables and the audit section both live here. |
| [../_scrape_cache.json](../_scrape_cache.json) | Read-only. Source of raw_stats per item, also where streetbrawl_only flag lives. |
| [../tags.json](../tags.json) | Read-only. Canonical Calculator tag list (sanity check before using a tag). |
| `../items/<key>.json` | Read-only during audit. Each has `values.playstyle_score` which the audit compares against. **NEVER write these during audit.** |
| `../_baseline_table.json` | Tertiary hint only; unreliable, don't trust. |

## Round history (for context)

- Round 5: Phase A — populated raw-stub Game stats tables for all 172 items from `_scrape_cache.json`.
- Round 6: Phase B — populated Calculator tags tables for all 172 items using sparse-tier extrapolation and the dual-scaling rule. Phase C — first audit appended.
- Round 7: Codified R1-R16 Tag Inference Rules after user identified systemic gaps in T1 audit. Full re-pass of all 172 items + regenerated audit with Apply? checkbox column.
- Round 8: Rewrote all 90 `tag_descriptions.md` + `tags.json` entries (playstyle-score perspective). Corrected `enemy_weight` direction to be hero-specific. Added §5b governing normalization methodology (0/1/1.5/2 anchors, raw-first-then-normalize, 1.5×-per-tier ladder, Street Brawl included but excluded from tier scaling / 2.0 anchor).
- Round 8 (audit pipeline correction): confirmed the audit is **hand-table driven** and lives at the bottom of `item_interpretations.md`. `_run_audit.py` parses `### Calculator tags` tables → blends `adds + 0.25 × relies` → compares JSON → appends per-item audit, crash-safe.
- Round 8 (skill sync): synced AUDIT_SKILL.md to `tag_descriptions.md`. Added comparison-units table, proc index formulas, judgment-derived vs stat-mappable vs dimensionless distinction, effective-≠-raw-cache + ⚖️ judgment anchors, Round-8 judgment facts.
- Round 9 (systematic corrections): User reviewed Round-8 audit and left `### Corrections` notes on 22 items. Corrections codified as new rules/clarifications: (1) `headshot_damage` unit → % importance, not flat damage; (2) `fire_rate_slow` unit → slow% × uptime × targets (NOT raw %); (3) `self_heal` unit → total HP with OOC session formula; (4) `horizontal_mobility` → stamina=0.6–0.7 m/s, channel-only ×0.5 discount; (5) `scaling_early/late` → conservative (0.4–0.7 typical); (6) `ability_spam` excludes weapon actives; (7) `charge_dependant` is dimensionless (score direct 0–2); (8) `self_buff` NOT for flat stat bonuses; (9) R17-R22 added; (10) `spirit_damage adds` = flat_SP + proc_equiv combined; (11) outlier-anchor protection in §7/§5b; (12) items meant to be sold (Golden Goose Egg): skip negative side effects. Applied all corrections to Calculator tags tables and regenerated audit.
- Round 9 (skill split — this entry): Split monolithic AUDIT_SKILL.md into focused modules under `Mass Item AI Audit Skill/` folder. Moved `tag_descriptions.md` into the same folder (it's the canonical detailed reference; 01_scoring_units.md mirrors it operationally). Updated cross-references in `item_interpretations.md`.
- Round 10 (full re-author): Re-authored all 173 items' Interpretation + Wiki stats + Calculator tags from scrape. Fixed scraper to capture missing items (`Grit` T1, `Indomitable` T4) and re-tier `Shadow Weave` T4→T3. Added 10 systemic corrections via user feedback during authoring (unit conventions, R2 fire-rate burst-vs-continuous direction, scaling_early scope, category-baseline rule, dimensionless unit standardization, heal-unit windows).
- Round 11 (workflow + bias analysis): Analyzed 2639 audit decisions across Round-10 audit. Identified 10 systemic AI biases (proc-tag overscore, range/position over-mirror, incidental-tag over-application, anti-affinity negatives, cross-baseline, hybrid_damage_usage over-use, mystic-prefix over-tagging, farmer/continous_heal/scaling_late over-application). Restructured workflow into 6 steps (0–5) with ask-points and a new Tag Staple Table sanity-check step. Added `_tag_staple_table.py` script. Made `_run_audit.py` emit column-padded tables for raw-text readability.

Future rounds should follow the same pattern: identify a class of mistakes → write a rule → re-pass affected items → regenerate audit → spot-check.
