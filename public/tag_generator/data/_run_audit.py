# -*- coding: utf-8 -*-
"""
Item-interpretations audit (Pipeline A — hand-table driven, per AUDIT_SKILL.md §2/§9).

Reads the hand-authored `### Calculator tags` tables in item_interpretations.md,
blends `AI = adds + 0.25 x relies` per tag, compares against each item's current
`data/items/<key>.json` -> values.playstyle_score, and appends a per-item audit
section at the BOTTOM of item_interpretations.md (replacing any prior audit).

Crash-safe: the new file is built in memory and swapped in atomically with
os.replace, so an interruption (e.g. out of credits) never leaves the .md
half-written — the original stays intact until the whole audit is ready.

Output is SUGGESTIONS ONLY. It never touches item JSONs.
"""
import io, json, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(DATA, 'item_interpretations.md')
ITEMS_DIR = os.path.join(DATA, 'items')

AUDIT_THRESHOLD = 0.15   # only emit a row when |diff| >= this, or one side is missing
BIG_DIFF = 0.6           # |diff| above this defaults the Apply? box to unchecked
ROUND_LABEL = 'Round 8'

# ── parse ─────────────────────────────────────────────────────────────────────
def parse_float(cell):
    cell = cell.strip().strip('`').replace('%', '')
    if cell in ('', '—', '-', '(null)', 'null', 'n/a'):
        return None
    try:
        return float(cell)
    except ValueError:
        return None

def parse_items(body):
    items = []
    # tier header labels in the body, e.g. "# T1 (800 souls)" -> {1: "T1 (800 souls)"}
    tier_labels = {}
    for m in re.finditer(r'^#\s+T(\?|\d)\s*(\([^)]*\))?', body, re.M):
        key = m.group(1)
        lbl = ('T' + key + (' ' + m.group(2) if m.group(2) else '')).strip()
        tier_labels[key] = lbl

    for chunk in re.split(r'\n##\s+', body)[1:]:
        name = chunk.splitlines()[0].strip()
        nn = re.search(r'\*\*normalized_name\*\*:\s*`?([a-z0-9_]+)`?', chunk)
        if not nn:
            continue
        nname = nn.group(1)
        tm = re.search(r'\*\*tier\*\*:\s*(\S+)', chunk)
        tier_raw = tm.group(1).lstrip('T') if tm else '?'
        cat = re.search(r'\*\*category\*\*:\s*(\w+)', chunk)
        category = cat.group(1) if cat else '?'

        # locate the Calculator tags table
        ct = re.search(r'###\s+Calculator tags\s*\n(.*?)(?:\n###|\n---|\Z)', chunk, re.S)
        rows = []
        if ct:
            for line in ct.group(1).splitlines():
                if not line.strip().startswith('|'):
                    continue
                cells = [c.strip() for c in line.strip().strip('|').split('|')]
                if len(cells) < 6:
                    continue
                tag = cells[0].strip().strip('`')
                if tag in ('Calc tag', '') or set(tag) <= {'-', ' ', ':'}:
                    continue
                # 6-col format: tag | Descriptive raw | Comparative raw | Normalized | Mode | Reasoning
                norm = parse_float(cells[3])         # Normalized column
                mode = cells[4].strip().lower()
                if norm is None or mode not in ('adds', 'relies'):
                    continue
                rows.append((tag, norm, mode))
        items.append({'name': name, 'nname': nname, 'tier': tier_raw,
                      'category': category, 'rows': rows, 'tier_labels': tier_labels})
    return items, tier_labels

def blend(rows):
    adds, relies = {}, {}
    for tag, norm, mode in rows:
        (adds if mode == 'adds' else relies)[tag] = \
            (adds if mode == 'adds' else relies).get(tag, 0.0) + norm
    return {t: round(adds.get(t, 0.0) + 0.25 * relies.get(t, 0.0), 2)
            for t in set(adds) | set(relies)}

def load_json_scores(nname):
    fp = os.path.join(ITEMS_DIR, nname + '.json')
    if not os.path.exists(fp):
        return None
    ps = (json.load(io.open(fp, encoding='utf-8')).get('values') or {}).get('playstyle_score') or {}
    return {t: float(v) for t, v in ps.items() if isinstance(v, (int, float))}

# ── action + apply default ─────────────────────────────────────────────────────
def make_row(tag, ai, js):
    has_ai, has_js = ai is not None, js is not None
    if has_ai and has_js:
        diff = ai - js
        if abs(diff) < AUDIT_THRESHOLD:
            return None
        kind = 'Bump' if diff > 0 else 'Cut'
        action = '%s JSON → %.2f' % (kind, ai)
        apply = '[x]' if abs(diff) <= BIG_DIFF else '[ ]'
        return ('%.2f' % js, '%.2f' % ai, diff, action, apply)
    if has_ai:
        diff = ai
        action = 'Add row, set %.2f' % ai
        apply = '[x]' if abs(ai) <= BIG_DIFF else '[ ]'
        return ('(null)', '%.2f' % ai, diff, action, apply)
    if has_js:
        return ('%.2f' % js, '(drop)', -js, 'Drop row (AI does not mark this tag)', '[ ]')
    return None

# ── build ───────────────────────────────────────────────────────────────────────
def main():
    full = io.open(MD_PATH, encoding='utf-8').read()
    cut = full.find('\n# Audit:')
    body = (full[:cut] if cut >= 0 else full).rstrip()

    items, tier_labels = parse_items(body)

    def tlabel(t):
        return tier_labels.get(t, 'Street Brawl (T?)' if t == '?' else 'T' + t)

    # group emitted items by tier, preserving file order
    by_tier = {}
    order = []
    total_rows = 0
    for it in items:
        ai = blend(it['rows'])
        js = load_json_scores(it['nname'])
        if js is None:          # no JSON to compare against
            continue
        out_rows = []
        for tag in sorted(set(ai) | set(js)):
            r = make_row(tag, ai.get(tag), js.get(tag))
            if r:
                out_rows.append((tag,) + r)
        if not out_rows:
            continue
        total_rows += len(out_rows)
        by_tier.setdefault(it['tier'], [])
        if it['tier'] not in order:
            order.append(it['tier'])
        by_tier[it['tier']].append((it, out_rows))

    def tier_sort_key(t):
        return (1, 0) if t == '?' else (0, int(t))
    order.sort(key=tier_sort_key)

    L = []
    a = L.append
    a('')
    a('# Audit: AI Normalized vs. existing JSON playstyle_score (%s)' % ROUND_LABEL)
    a('')
    a('**Generated by `_run_audit.py`** from the hand-authored `### Calculator tags` tables in this file vs each item\'s `data/items/<key>.json`. SUGGESTIONS ONLY — no JSON is modified.')
    a('')
    a('**Blending convention**: `AI blended = adds + 0.25 × relies` per tag (same-mode rows summed first).')
    a('')
    a('**Filtering**: a row appears only where |Diff| ≥ %.2f OR one side is missing.' % AUDIT_THRESHOLD)
    a('')
    a('**Apply? column** (see AUDIT_SKILL.md §10): `[x]` = apply the AI blended value · `[ ]` = skip · a **number** (e.g. `0.8`) = force that exact value. Defaults: `[x]` for Bump/Cut/Add with |diff| ≤ %.1f; `[ ]` for Drops and for |diff| > %.1f.' % (BIG_DIFF, BIG_DIFF))
    a('')

    for t in order:
        a('## %s' % tlabel(t))
        a('')
        for it, out_rows in by_tier[t]:
            a('### %s (`%s`, T%s %s)' % (it['name'], it['nname'], it['tier'], it['category']))
            a('Path: `data/items/%s.json`' % it['nname'])
            a('')
            a('| Calc tag | JSON current | AI blended | Diff | Suggested action | Apply? |')
            a('|---|---|---|---|---|---|')
            for tag, js_s, ai_s, diff, action, apply in out_rows:
                sgn = '+' if diff >= 0 else ''
                a('| `%s` | %s | %s | %s%.2f | %s | `%s` |' % (
                    tag, js_s, ai_s, sgn, diff, action, apply))
            a('')

    # empty cross-tier checklist
    a('---')
    a('')
    a('## Apply these changes to JSONs')
    a('')
    a('*(Cross-tier cleanup checklist. The per-row Apply? boxes above are the per-tag tracker; this is for tier-wide patterns.)*')
    a('')
    for t in order:
        a('### %s' % tlabel(t))
        a('- [ ] (placeholder)')
        a('')

    new_full = body + '\n' + '\n'.join(L)

    tmp = MD_PATH + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8') as f:
        f.write(new_full)
    os.replace(tmp, MD_PATH)   # atomic — only reached once the whole file is built

    n_items = sum(len(v) for v in by_tier.values())
    print('audit regenerated in item_interpretations.md: items=%d rows=%d tiers=%s' % (
        n_items, total_rows, ','.join(tlabel(t) for t in order)))

main()
