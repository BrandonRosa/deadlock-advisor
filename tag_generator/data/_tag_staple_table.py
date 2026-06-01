# -*- coding: utf-8 -*-
"""
Tag Staple Table generator (Round 11+ pipeline Step 4).

For every (tag, tier) combination, emits:
  • The Comparative-raw VALUE NEEDED to hit normalized anchors 0.5 / 1.0 / 1.5 / 2.0
    (derived from each tag's qmax/ceiling computed by _normalize.py)
  • The actual ITEMS sitting closest to each anchor, with their normalized values

Used as a sanity check between Pass 2 (normalize) and Pass 3 (audit) — if a tag's
2.0-staple item isn't actually the tag's named anchor, something upstream needs
correction. ASK the user before proceeding to audit.

Reads item_interpretations.md; writes _tag_staple_table.md.

Doesn't modify any other file.
"""
import io, os, re, sys

# Reuse _normalize.py parsing + anchor logic by importing
import importlib.util
spec = importlib.util.spec_from_file_location(
    '_normalize', os.path.join(os.path.dirname(os.path.abspath(__file__)), '_normalize.py'))
_n = importlib.util.module_from_spec(spec)
spec.loader.exec_module(_n)

DATA = os.path.dirname(os.path.abspath(__file__))
MD = os.path.join(DATA, 'item_interpretations.md')
OUT = os.path.join(DATA, '_tag_staple_table.md')

ANCHORS = (0.5, 1.0, 1.5, 2.0)

# Tag → display unit hint (purely cosmetic for the threshold column).
UNIT_HINTS = {
    'bullet_damage': '%', 'fire_rate': '%', 'spirit_damage': ' SP-eq',
    'magazine_size_dependant': '%', 'high_max_hp': ' HP', 'low_max_hp': ' HP',
    'continous_heal': ' HP', 'self_heal': ' HP', 'burst_heal': ' HP', 'team_heal': ' HP', 'shield': ' HP',
    'bullet_resistance': '%', 'spirit_resistance': '%', 'melee_resistance': '%',
    'debuff_resistance': '%', 'cc_resist': '%',
    'bullet_resist_shred': '%', 'spirit_resist_shred': '%', 'anti_heal': '%',
    'movement_slow': ' weighted', 'fire_rate_slow': '%',
    'cooldown_reduction': '%', 'duration_dependant': '%', 'range_extender_dependant': '%',
    'melee_damage': '%', 'headshot_damage': '%', 'bullet_lifesteal': '%', 'spirit_lifesteal': '%',
    'horizontal_mobility': ' m/s', 'vertical_mobility': ' units',
    'gun_burst_damage': ' dmg', 'gun_continuous_damage': ' dmg',
    'spirit_burst_damage': ' dmg', 'spirit_continuous_damage': ' dmg', 'dot': ' dmg',
    'gun_burst_resistance': '%', 'gun_continuous_resistance': '%',
    'spirit_burst_resistance': '%', 'spirit_continuous_resistance': '%',
    'stun': 's', 'silence': '', 'disarm': '',
}


def threshold_raw(tag, tier, anchor, anchors_data):
    """Compute the Comparative raw value needed at this tier to normalize to `anchor`."""
    a = anchors_data.get(tag)
    if a is None:
        return None
    if tag in _n.LADDERED:
        # norm = 2 * (raw / 1.5^tier) / qmax  →  raw = anchor * qmax * 1.5^tier / 2
        return anchor * a['qmax'] * (1.5 ** tier) / 2.0
    else:
        # norm = 2 * raw / ceiling  →  raw = anchor * ceiling / 2
        return anchor * a['ceiling'] / 2.0


def fmt_raw(v, tag):
    if v is None:
        return 'n/a'
    unit = UNIT_HINTS.get(tag, '')
    if abs(v) >= 100:
        return '%.0f%s' % (v, unit)
    if abs(v) >= 10:
        return '%.1f%s' % (v, unit)
    return '%.2f%s' % (v, unit)


def fmt_pair(item_name, norm_val):
    return '%s (%.2f)' % (item_name, norm_val) if item_name else 'n/a'


def main():
    md = io.open(MD, encoding='utf-8').read()
    items_raw = _n.collect_per_item_blends(md)

    # We also need item NAMES (collect_per_item_blends doesn't capture them).
    # Re-walk; aligned to the same parser logic (only count headings followed by
    # a `**tier**:` line as items, matching _normalize.collect_per_item_blends).
    names_in_order = []
    pending = None
    for line in md.split('\n'):
        if line.startswith('# Audit:'):
            break
        if line.startswith('## ') and not line.startswith('## T'):
            pending = line[3:].strip()
        if '**tier**:' in line and pending is not None:
            names_in_order.append(pending)
            pending = None
    if len(names_in_order) != len(items_raw):
        sys.stderr.write('WARN: name/item count mismatch: %d names vs %d items\n' % (
            len(names_in_order), len(items_raw)))

    items = []
    for i, it in enumerate(items_raw):
        if not it['tier_seen']:
            continue
        nm = names_in_order[i] if i < len(names_in_order) else '?'
        items.append({'name': nm, 'tier': it['tier_num'], 'is_sb': it['is_sb'],
                      'per_tag': dict(it['per_tag_numeric'])})

    anchors = _n.build_anchors(items_raw)

    # Compute per-item normalized values per tag.
    def norm_of(item, tag):
        val = item['per_tag'].get(tag)
        if val is None:
            return None
        return _n.normalize(tag, val, item['tier'] or 4, item['is_sb'], anchors)

    # Group items by tier for tier-restricted staple selection.
    by_tier = {1: [], 2: [], 3: [], 4: [], None: []}  # None = SB
    for it in items:
        tier = it['tier'] if not it['is_sb'] else None
        by_tier.setdefault(tier, []).append(it)

    L = []
    a = L.append
    a('# Tag Staple Table (Round 11+)')
    a('')
    a('Per-tier sanity-check between normalize (Step 3b) and audit (Step 5). For every tag, shows:')
    a('')
    a('1. **Effective Raw thresholds** — the comparative raw value an item would need at that tier to normalize to 0.5 / 1.0 / 1.5 / 2.0.')
    a('2. **Staple Items** — the actual items in that tier sitting closest to each normalized anchor, with their measured normalized value in parentheses.')
    a('')
    a('If a tag\'s 2.0-staple item isn\'t the tag\'s named anchor (per [tag_descriptions.md](Mass Item AI Audit Skill/tag_descriptions.md)), something is off — re-check Pass 1/2 for that tag before approving the audit.')
    a('')

    all_tags = sorted(anchors.keys())
    tiers_in_order = [(1, 'T1'), (2, 'T2'), (3, 'T3'), (4, 'T4'), (None, 'T? (SB)')]

    for tier_num, tier_lbl in tiers_in_order:
        section_rows = []
        for tag in all_tags:
            # Threshold raws at each anchor.
            eff_tier = tier_num if tier_num else 4
            thresholds = []
            for anc in ANCHORS:
                if tier_num is None and anc > 1.5:
                    thresholds.append(None)  # SB is capped at 1.5
                    continue
                thresholds.append(threshold_raw(tag, eff_tier, anc, anchors))

            # Staple items at each anchor.
            candidates = []
            for it in by_tier.get(tier_num, []):
                n = norm_of(it, tag)
                if n is None:
                    continue
                candidates.append((n, it['name'], it['per_tag'].get(tag)))
            staples = []
            for anc in ANCHORS:
                if tier_num is None and anc > 1.5:
                    staples.append(None)
                    continue
                if not candidates:
                    staples.append(None)
                    continue
                # Only show items genuinely within ±0.25 of the anchor; otherwise
                # the cell is n/a (no real staple at this anchor for this tier).
                near = [c for c in candidates if abs(abs(c[0]) - anc) <= 0.25]
                if not near:
                    staples.append(None)
                    continue
                best = min(near, key=lambda c: abs(abs(c[0]) - anc))
                staples.append(best)

            # Only emit a row if any staple exists OR any threshold computable.
            if all(s is None for s in staples) and all(t is None for t in thresholds):
                continue

            raw_cell = '(' + '/'.join(fmt_raw(t, tag) for t in thresholds) + ')'
            staple_cell = '(' + '/'.join(
                fmt_pair(s[1], s[0]) if s else 'n/a' for s in staples) + ')'
            section_rows.append((tag, raw_cell, staple_cell))

        if not section_rows:
            continue
        a('## %s' % tier_lbl)
        a('')
        headers = ('Tag', 'Effective Raw (0.5/1.0/1.5/2.0*)', 'Staple Items (0.5/1.0/1.5/2.0*)', 'Notes')
        cells = [(('`%s`' % tag), raw_cell, staple_cell, '') for tag, raw_cell, staple_cell in section_rows]
        widths = [len(h) for h in headers]
        for row in cells:
            for i, c in enumerate(row):
                if len(c) > widths[i]:
                    widths[i] = len(c)
        def fmt_row(row):
            return '| ' + ' | '.join(row[i].ljust(widths[i]) for i in range(len(row))) + ' |'
        a(fmt_row(headers))
        a('|' + '|'.join('-' * (w + 2) for w in widths) + '|')
        for row in cells:
            a(fmt_row(row))
        a('')
        if tier_num is None:
            a('*Street Brawl items are capped at norm=1.5; the 2.0 column is always n/a.*')
            a('')

    new = '\n'.join(L) + '\n'
    tmp = OUT + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8') as f:
        f.write(new)
    os.replace(tmp, OUT)
    sys.stderr.write('wrote %s -- tags=%d tiers=5\n' % (OUT, len(all_tags)))


if __name__ == '__main__':
    main()
