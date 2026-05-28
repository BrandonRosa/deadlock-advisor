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

## Workflow at a glance

1. **Scrape** — `python _scrape_items.py` rebuilds `_scrape_raw_dump.json` from the wiki.
2. **Pass 1 — Interpret** (hand-judgment). For every item, author the `### Calculator tags` table in `../item_interpretations.md` with Descriptive raw, Comparative raw (in the tag's comparison unit), Mode (`adds`/`relies`), and Reasoning. Leave `Normalized` blank.
3. **Pass 2 — Normalize.** `python _normalize.py --write` fills the `Normalized` column based on the §5b effect-per-cost methodology.
4. **Audit** — `python _run_audit.py` blends `adds + 0.25 × relies`, compares to `data/items/<key>.json`, and appends the `# Audit:` section at the bottom of `item_interpretations.md`. SUGGESTIONS ONLY — no JSON writes.

The scripts (`_scrape_items.py`, `_normalize.py`, `_run_audit.py`) live in `../` (the `data/` directory). The skill folder contains only documentation.

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

Future rounds should follow the same pattern: identify a class of mistakes → write a rule → re-pass affected items → regenerate audit → spot-check.
