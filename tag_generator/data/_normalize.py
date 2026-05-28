# -*- coding: utf-8 -*-
"""
Pass-2 normalizer for item_interpretations.md.

Reads every `### Calculator tags` table (5-col Pass-1 format:
`| Calc tag | Descriptive raw | Comparative raw | Mode | Reasoning |`),
compares each row's COMPARATIVE RAW against the rest of the set tag-by-tag, and
INSERTS a `Normalized` column (0–2) between Comparative raw and Mode, producing the
6-col format `| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |`.

Normalization model (per Mass Item AI Audit Skill/03_normalization.md + tag_descriptions.md):
  • LADDERED tags (physical effective-stat units expected to grow ~1.5×/tier): we DIVIDE OUT
    the tier growth first — quality = |raw| / 1.5^tier — so tiers are comparable on an
    effect-PER-COST basis. The best quality among STANDARD (non-Street-Brawl) items = 2.0
    (best effect-per-cost in the game); everything scales linearly to it: norm = 2×quality/qmax.
    This is the key point: 2.0 is NOT the biggest raw number — a cheap low-tier item that
    over-delivers for its tier can out-quality a bigger high-tier stat and take the 2.0.
  • DIRECT tags (dimensionless "% importance", proc indices): NO tier division (you can't
    scale a fraction across tiers). norm = 2×|raw|/max(non-SB |raw|).
  • Street Brawl items (tier "?") are scored but EXCLUDED from setting the 2.0 anchor, and
    CAPPED at 1.5 (quality computed at eff_tier=4).
  • Enemy-debuff tags (shred/slow/anti-heal) always contribute POSITIVE.
  • Sign preserved for genuine downsides (negative comparative raw → negative normalized).
  • Non-numeric comparative raws (general procs written "high"/"mid"/"index") use a fallback map.

Default = DRY RUN. Pass --write to insert the column in place (crash-safe: temp + os.replace).
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA = os.path.dirname(os.path.abspath(__file__))
MD = os.path.join(DATA, 'item_interpretations.md')

# Tags whose comparative raw is a physical effective stat that grows ~1.5×/tier.
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
# Enemy-debuff tags → contribution is always positive.
DEBUFF_TAGS = {'bullet_resist_shred', 'spirit_resist_shred', 'anti_heal',
               'movement_slow', 'fire_rate_slow'}
# Non-numeric comparative-raw tokens (general proc fallbacks).
TOKEN = {'high': None, 'mid': None, 'low': None, 'index': None}  # filled per-tag below

TIER_NUM = {'1': 1, '2': 2, '3': 3, '4': 4, '?': None}


def num_of(cell):
    m = re.search(r'-?\d+(?:\.\d+)?', cell.replace(',', ''))
    return float(m.group()) if m else None


def fmt(v):
    s = '%.1f' % v
    return s


# ── row regex: 5-col Pass-1 table row ────────────────────────────────────────────
ROW = re.compile(r'^\| \`([a-z_]+)\` \| (.*?) \| (.*?) \| (adds|relies) \| (.*?) \|\s*$')
HEADER = '| Calc tag | Descriptive raw | Comparative raw | Mode | Reasoning |'
NEWHEADER = '| Calc tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning |'
SEP_OLD = '|---|---|---|---|---|'
SEP_NEW = '|---|---|---|---|---|---|'


def parse(md):
    """Yield (tag, comparative_text, value_or_None, tier, is_sb) for every calc row."""
    tier = None
    for line in md.split('\n'):
        mt = re.search(r'\*\*tier\*\*:\s*([0-9?]+)', line)
        if mt:
            tier = TIER_NUM.get(mt.group(1), None)
        m = ROW.match(line)
        if not m:
            continue
        tag, _desc, comp, _mode, _r = m.groups()
        yield tag, comp.strip(), num_of(comp), tier, (tier is None)


def quality(av, tier):
    """Effect-per-cost: divide out the expected 1.5×/tier growth. SB → eff_tier 4."""
    eff_tier = tier if tier else 4
    return av / (1.5 ** eff_tier)


def build_anchors(md):
    """Per-tag anchor among STANDARD (non-SB) numeric rows:
       LADDERED → qmax (max quality, effect-per-cost); DIRECT → ceiling (max |raw|)."""
    qrows, rrows = {}, {}
    for tag, comp, val, tier, is_sb in parse(md):
        if val is None or is_sb:
            continue
        qrows.setdefault(tag, []).append(quality(abs(val), tier))
        rrows.setdefault(tag, []).append(abs(val))
    anchors = {}
    for tag in set(qrows) | set(rrows):
        anchors[tag] = {'qmax': max(qrows.get(tag, [1.0])) or 1.0,
                        'ceiling': max(rrows.get(tag, [1.0])) or 1.0}
    return anchors


def normalize(tag, val, tier, is_sb, anchors):
    a = anchors.get(tag)
    if a is None:
        return None
    sign = 1.0 if tag in DEBUFF_TAGS else (-1.0 if (val is not None and val < 0) else 1.0)
    if val is None:
        return None
    av = abs(val)
    if tag in LADDERED:
        n = 2.0 * quality(av, tier) / a['qmax']
    else:
        n = 2.0 * av / a['ceiling']
    n = min(1.5, n) if is_sb else min(2.0, n)
    return sign * n


# general-proc fallback values (tag-relative; applied when comparative raw is a token)
PROC_TOKEN = {'high': 1.3, 'mid': 0.8, 'low': 0.5, 'index': 1.0}


def main():
    write = '--write' in sys.argv
    md = io.open(MD, encoding='utf-8').read()
    anchors = build_anchors(md)

    out = []
    tier = None
    changed = 0
    for line in md.split('\n'):
        mt = re.search(r'\*\*tier\*\*:\s*([0-9?]+)', line)
        if mt:
            tier = TIER_NUM.get(mt.group(1), None)
        if line.strip() == HEADER:
            out.append(NEWHEADER); continue
        if line.strip() == SEP_OLD:
            out.append(SEP_NEW); continue
        m = ROW.match(line)
        if not m:
            out.append(line); continue
        tag, desc, comp, mode, reason = m.groups()
        val = num_of(comp)
        is_sb = (tier is None)
        if val is None:
            tok = comp.strip().lower()
            n = PROC_TOKEN.get(tok)
            norm = (min(1.5, n) if (n is not None and is_sb) else n)
        else:
            norm = normalize(tag, val, tier, is_sb, anchors)
        cell = fmt(norm) if norm is not None else '—'
        out.append('| `%s` | %s | %s | %s | %s | %s |' % (tag, desc.strip(), comp.strip(), cell, mode, reason.strip()))
        changed += 1

    print('rows rewritten=%d  laddered tags=%d  direct tags=%d  write=%s' % (
        changed, len(LADDERED & set(anchors)), len(set(anchors) - LADDERED), write))
    print('\nper-tag anchor (non-SB best → 2.0):')
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
        print('\n--write: inserted Normalized column into %d rows.' % changed)
    else:
        print('\n(dry run — pass --write to insert the column.)')


if __name__ == '__main__':
    main()
