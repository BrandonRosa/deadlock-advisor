# 05 — Common mistakes + user-pushback pattern

## When the user pushes back on a per-item score

This always happens. The pattern:

1. User identifies a class of items the AI scored poorly (e.g., "all stamina items should have aerial").
2. Codify the correction as a new rule (or refine an existing rule) in [02_tag_inference_rules.md](02_tag_inference_rules.md) and in `## Tag Inference Rules` section of `../item_interpretations.md`.
3. Re-pass any items the new rule touches (don't try to re-pass everything — only items where the new rule applies).
4. Regenerate the audit (it re-runs over the whole file).
5. Spot-check the user-named items in the new audit to confirm the rule landed.

The rule doc is the canonical reference for "why is this item scored this way" — keep it current.

## Common mistakes to avoid

- **Don't run the audit script before updating Calculator tags tables.** The audit reads tables, doesn't generate them.
- **Don't modify item JSONs during the audit session.** Audit is read-only against JSONs. JSON updates are a separate follow-up.
- **Don't use tags that aren't in the canonical list.** `lane_pusher` and `spirit_power` are common offenders. Audit will flag these as `Drop row` but they were always wrong — the AI table itself shouldn't have them.
- **Don't double-encode negative tags.** R7 says prefer single positive (`grounded adds 0.4`) over negative on opposite (`aerial adds -0.4`). Picking both double-counts the anti-synergy.
- **Don't write Reasoning columns that just restate the rule name.** Include WHY: which raw stat triggered the rule, what the propagation values were derived from, why the Normalized landed where it did.
- **Don't forget Street Brawl items get skipped.** If your audit script doesn't handle items with empty Calc tags tables, it'll crash.
- **Don't score ability_spam for weapon actives.** Active Reload, Kinetic Dash buff, and any mechanic gated on "gun fires / bullet lands" is NOT ability spam. Only actual ability (QWER/Space) casting qualifies.
- **Don't add a bullet/spirit_damage relies row that restates the adds row.** The `relies` mode is for scaling benefit — "this item's damage output scales as you stack more of this stat." A range-gated item that ADDS damage already captures the condition in the adds row (with uptime applied); adding a separate `relies` row with the same raw stat double-counts the contribution through the blend formula.
- **small_hitbox on generic mobility items is partial credit only.** Faster movement makes you harder to hit, but small_hitbox is primarily for heroes/items with actual small projectile-collision. Score 0.5–1.0 max for mobility-only items (not 1.5–2.0).
- **Don't give flat passive stat items a self_buff row.** +10 SP, +210 HP, +9% fire_rate: those are the relevant tags directly. self_buff is reserved for items creating a persistent conditional-state buff.
- **Don't let outlier 2.0 anchors collapse other scores.** When a tag's anchor is an extreme outlier (Titanic Magazine 100% for magazine_size_dependant), apply the outlier-protection rule from [03_normalization.md](03_normalization.md) — score other items against the expected curve, not the raw max.
- **Don't add tags the scrape doesn't justify.** Alchemical Fire was tagged `anti_heal` because the Interpretation prose said "reduces healing" — but the wiki scrape only listed `Bullet Resist Conditional`, no healing reduction stat. **Read the wiki/scrape literally**; if a stat isn't in the data table or the Notes section, don't invent it. Always derive the Interpretation prose FROM the scrape, never the other way around. The `changelog` field in `_scrape_raw_dump.json` is the authoritative record of recent removals — e.g. Blood Tribute *had* a healing-reduction component until March 2026, when the changelog records it was removed. Cross-check the changelog before crediting a mechanic.
- **Watch for codename suffixes — they carry mechanical category.** The `codename` field is a stable category hint the description prose can miss:
  - `_imbue` → imbue item, single-ability binding (R23). All its bonuses (range, duration, damage) are single-ability.
  - `_per_npc_kill` → farm-scaling stacker.
  - `_burst` / `_continuous` → proc category hint.
  Skim the codename before writing the Calc tags table; it routinely catches mechanical category errors a quick read of the description misses.
