# -*- coding: utf-8 -*-
"""
Pass-2 normalizer for item_interpretations.md (Round 10+ pipeline).

Reads every `### Calculator tags` table, blends `(adds + 0.5 × relies)` of the
COMPARATIVE RAW per (item, tag) BEFORE normalization, then writes a single
Normalized value into the first `adds` row for each (item, tag). Subsequent
adds or relies rows for that same tag show `—` in Normalized (their
contribution lives in the blended adds-row value).

Two table formats are accepted on input:
  • 5-col Pass-1:  | Calc tag | Descriptive raw | Comparative raw | Mode | Reasoning |
  • 6-col Pass-2:  | Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |
Output is always the 6-col format.

Normalization model (per Mass Item AI Audit Skill/03_normalization.md):
  • LADDERED tags (physical effective-stat units that grow ~1.5×/tier):
        quality = |effective_raw| / 1.5^tier   (effect-per-cost)
        norm    = 2.0 × quality / qmax_over_standard_items
  • DIRECT tags (dimensionless % importance, proc indices):
        norm    = 2.0 × |effective_raw| / ceiling_over_standard_items
  • Street Brawl items (tier "?") use eff_tier=4, are EXCLUDED from anchors,
    and are capped at 1.5.
  • Enemy-debuff tags (shred/slow/anti-heal) contribute positive.
  • Sign preserved for genuine downsides (negative effective_raw → negative norm).

Default = DRY RUN. Pass --write to insert/update in place (crash-safe).
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA = os.path.dirname(os.path.abspath(__file__))
MD = os.path.join(DATA, 'item_interpretations.md')

# Tags whose comparative raw is a physical effective stat growing ~1.5×/tier.
LADDERED = {
    'bullet_damage', 'fire_rate', 'spirit_damage', 'magazine_size_dependant', 'high_max_hp',
    'continous_heal', 'self_heal', 'burst_heal', 'team_heal', 'shield',
    'bullet_resistance', 'spirit_resistance', 'melee_resistance', 'debuff_resistance', 'cc_resist',
    'bullet_resist_shred', 'spirit_resist_shred', 'anti_heal', 'movement_slow', 'fire_rate_slow',
    'cooldown_reduction', 'duration_dependant', 'range_extender_dependant', 'melee_damage',
    'headshot_damage', 'bullet_lifesteal', 'spirit_lifesteal', 'horizontal_mobility', 'vertical_mobility',
    'gun_burst_damage', 'gun_continuous_damage', 'spirit_burst_damage', 'spirit_continuous_damage', 'dot',
    'gun_burst_resistance', 'gun_continuous_resistance', 'spirit_burst_resistance',
    'spirit_continuous_resistance', 'stun', 'silence', 'disarm', 'burst_damage', 'continuous_damage',
}
DEBUFF_TAGS = {'bullet_resist_shred', 'spirit_resist_shred', 'anti_heal',
               'movement_slow', 'fire_rate_slow'}

TIER_NUM = {'1': 1, '2': 2, '3': 3, '4': 4, '?': None}

# Row regexes — handle 5-col (pre-normalize) and 6-col (already-normalized) input.
ROW5 = re.compile(r'^\| \`([a-z_]+)\` \| (.*?) \| (.*?) \| (adds|relies) \| (.*?) \|\s*$')
ROW6 = re.compile(r'^\| \`([a-z_]+)\` \| (.*?) \| (.*?) \| (.*?) \| (adds|relies) \| (.*?) \|\s*$')
HEADER5 = '| Calc tag | Descriptive raw | Comparative raw | Mode | Reasoning |'
HEADER6 = '| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |'
SEP5 = '|---|---|---|---|---|'
SEP6 = '|---|---|---|---|---|---|'

# General-proc fallback values when comparative raw is a token like "high"/"mid".
PROC_TOKEN = {'high': 1.3, 'mid': 0.8, 'low': 0.5, 'index': 1.0}


def num_of(cell):
    m = re.search(r'-?\d+(?:\.\d+)?', cell.replace(',', ''))
    return float(m.group()) if m else None


def parse_row(line):
    """Return (tag, desc, comp, mode, reason, had_norm) or None."""
    m = ROW6.match(line)
    if m:
        tag, desc, comp, _norm, mode, reason = m.groups()
        return (tag, desc, comp, mode, reason, True)
    m = ROW5.match(line)
    if m:
        tag, desc, comp, mode, reason = m.groups()
        return (tag, desc, comp, mode, reason, False)
    return None


def collect_per_item_blends(md):
    """First pass: walk the file. For each item, accumulate per-tag blended raws.
    Returns:
      blends: list of dicts {tier_num, is_sb, per_tag: {tag: blended_raw_or_None}}
      blends_by_item_idx: same list (alias for clarity)
    The per-tag blended raw is `Σ adds + 0.5 × Σ relies` of the comparative raws.
    If a row's comparative raw is a non-numeric token, it counts via PROC_TOKEN
    (but only if all rows for that (item, tag) are tokens; otherwise tokens are
    ignored in the blend and the numeric raws define it).
    """
    items = []
    cur = None
    tier_num = None
    for line in md.split('\n'):
        # Item header begins a new chunk
        if line.startswith('## ') and not line.startswith('## T'):
            if cur is not None:
                items.append(cur)
            cur = {'tier_num': None, 'is_sb': False, 'per_tag_numeric': {},
                   'per_tag_token': {}, 'tier_seen': False}
        mt = re.search(r'\*\*tier\*\*:\s*([0-9?]+)', line)
        if mt and cur is not None:
            t = mt.group(1)
            cur['tier_num'] = TIER_NUM.get(t, None)
            cur['is_sb'] = (t == '?')
            cur['tier_seen'] = True
        pr = parse_row(line)
        if pr and cur is not None:
            tag, _desc, comp, mode, _reason, _had_norm = pr
            val = num_of(comp)
            weight = 1.0 if mode == 'adds' else 0.5
            if val is None:
                tok = comp.strip().lower()
                if tok in PROC_TOKEN:
                    cur['per_tag_token'].setdefault(tag, []).append(
                        (PROC_TOKEN[tok], weight))
            else:
                acc = cur['per_tag_numeric'].setdefault(tag, 0.0)
                cur['per_tag_numeric'][tag] = acc + weight * val
    if cur is not None:
        items.append(cur)
    return items


def quality(av, tier):
    eff_tier = tier if tier else 4
    return av / (1.5 ** eff_tier)


def build_anchors(items):
    """Per-tag anchor among STANDARD (non-SB) items, computed over BLENDED effective raws."""
    qrows, rrows = {}, {}
    for it in items:
        if it['is_sb']:
            continue
        tier = it['tier_num']
        for tag, val in it['per_tag_numeric'].items():
            qrows.setdefault(tag, []).append(quality(abs(val), tier))
            rrows.setdefault(tag, []).append(abs(val))
    anchors = {}
    for tag in set(qrows) | set(rrows):
        anchors[tag] = {'qmax': max(qrows.get(tag, [1.0])) or 1.0,
                        'ceiling': max(rrows.get(tag, [1.0])) or 1.0}
    return anchors


def normalize(tag, val, tier, is_sb, anchors):
    a = anchors.get(tag)
    if a is None or val is None:
        return None
    sign = 1.0 if tag in DEBUFF_TAGS else (-1.0 if val < 0 else 1.0)
    av = abs(val)
    if tag in LADDERED:
        n = 2.0 * quality(av, tier) / a['qmax']
    else:
        n = 2.0 * av / a['ceiling']
    n = min(1.5, n) if is_sb else min(2.0, n)
    return sign * n


def fmt(v):
    if v is None:
        return '—'
    return '%.1f' % v


def main():
    write = '--write' in sys.argv
    md = io.open(MD, encoding='utf-8').read()

    items = collect_per_item_blends(md)
    anchors = build_anchors(items)

    # Pre-compute per-item per-tag normalized values from blended raws.
    item_norms = []  # list aligned with items: dict tag -> normalized
    for it in items:
        tier = it['tier_num']
        is_sb = it['is_sb']
        norms = {}
        for tag, val in it['per_tag_numeric'].items():
            norms[tag] = normalize(tag, val, tier, is_sb, anchors)
        # Token-only tags: fold token to a "raw" via PROC_TOKEN and normalize as DIRECT.
        for tag, toks in it['per_tag_token'].items():
            if tag in norms:
                continue
            blended = sum(w * t for t, w in toks)
            n = blended  # already a 0-2-ish token
            if is_sb:
                n = min(1.5, n)
            norms[tag] = n
        item_norms.append(norms)

    # Second pass: rewrite the markdown.
    out = []
    item_idx = -1
    tag_seen_for_item = {}  # tag -> bool, reset per item
    changed = 0
    in_item = False
    for line in md.split('\n'):
        if line.startswith('## ') and not line.startswith('## T'):
            item_idx += 1
            in_item = True
            tag_seen_for_item = {}
        if line.strip() == HEADER5 or line.strip() == HEADER6:
            out.append(HEADER6)
            continue
        if line.strip() == SEP5 or line.strip() == SEP6:
            out.append(SEP6)
            continue
        pr = parse_row(line)
        if not pr:
            out.append(line)
            continue
        tag, desc, comp, mode, reason, _had_norm = pr
        # For this row, decide whether to write the merged Normalized or "—".
        norms = item_norms[item_idx] if 0 <= item_idx < len(item_norms) else {}
        first_adds = (mode == 'adds') and not tag_seen_for_item.get((tag, 'adds'), False)
        if first_adds:
            tag_seen_for_item[(tag, 'adds')] = True
            cell = fmt(norms.get(tag))
        else:
            cell = '—'
        out.append('| `%s` | %s | %s | %s | %s | %s |' % (
            tag, desc.strip(), comp.strip(), cell, mode, reason.strip()))
        changed += 1

    print('rows rewritten=%d  items=%d  laddered tags=%d  direct tags=%d  write=%s' % (
        changed, len(items), len(LADDERED & set(anchors)), len(set(anchors) - LADDERED), write))
    print('\nper-tag anchor (non-SB best blended → 2.0):')
    for t in sorted(anchors):
        if t in LADDERED:
            print('  %-26s LADDER qmax=%.3f (effect-per-cost; ceiling raw=%.1f)' % (
                t, anchors[t]['qmax'], anchors[t]['ceiling']))
        else:
            print('  %-26s direct ceiling=%.1f' % (t, anchors[t]['ceiling']))

    if write:
        new = '\n'.join(out)
        tmp = MD + '.tmp'
        io.open(tmp, 'w', encoding='utf-8').write(new)
        os.replace(tmp, MD)
        print('\n--write: rewrote Normalized column in %d rows.' % changed)
    else:
        print('\n(dry run — pass --write to rewrite the column.)')


if __name__ == '__main__':
    main()
