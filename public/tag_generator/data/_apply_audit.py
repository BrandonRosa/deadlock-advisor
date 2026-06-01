# -*- coding: utf-8 -*-
"""
Apply audit decisions (Apply? column) from item_interpretations.md to data/items/*.json.

Reads the `# Audit:` section, walks each per-item table, and for every row:
  [x]      -> write the AI blended value (or null for "Drop row")
  [<num>]  -> write that exact number, overriding the AI suggestion
  [ ]      -> skip

Default = DRY RUN. Pass --write to actually modify JSON files (atomic via
os.replace). On --write, backs up data/items/ to a timestamped sibling directory
before touching anything.
"""
import io, json, os, re, shutil, sys, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(DATA, 'item_interpretations.md')
ITEMS_DIR = os.path.join(DATA, 'items')

# Cell parsing ------------------------------------------------------------------
APPLY_RE = re.compile(r'`\[\s*(.*?)\s*\]`')

def parse_apply(cell):
    """Return ('accept', None) | ('skip', None) | ('override', float) | ('unknown', None)."""
    m = APPLY_RE.search(cell)
    if not m:
        return ('unknown', None)
    inner = m.group(1).strip()
    if inner.lower() == 'x':
        return ('accept', None)
    if inner == '':
        return ('skip', None)
    try:
        return ('override', float(inner))
    except ValueError:
        return ('unknown', None)

def parse_ai_blended(cell):
    """The 'AI blended' column shows e.g. '1.00', '(drop)'. Returns float or None for drop."""
    s = cell.strip().strip('`')
    if s in ('(drop)', '—', '-', ''):
        return None
    try:
        return float(s)
    except ValueError:
        return None

def parse_action(cell):
    """Return 'drop' if the suggested action is Drop row, else 'set'."""
    return 'drop' if 'drop row' in cell.lower() else 'set'

# Parse audit -------------------------------------------------------------------
ITEM_HEADER_RE = re.compile(
    r'^###\s+(.+?)\s+\(`([a-z0-9_]+)`,\s+T([?\d])\s+(\w+)\)\s*$')

def parse_audit(md):
    """Yield (display_name, slug, tier, category, rows) per audit item block."""
    cut = md.find('\n# Audit:')
    if cut < 0:
        raise RuntimeError('No # Audit: section found in markdown.')
    audit = md[cut:]

    lines = audit.split('\n')
    i = 0
    while i < len(lines):
        m = ITEM_HEADER_RE.match(lines[i])
        if not m:
            i += 1
            continue
        display, slug, tier, category = m.group(1), m.group(2), m.group(3), m.group(4)
        # Find the table — header line starts with "| Calc tag |"
        i += 1
        while i < len(lines) and not lines[i].startswith('| Calc tag'):
            i += 1
        if i >= len(lines):
            break
        i += 2  # skip header + separator
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
            if len(cells) >= 6:
                tag = cells[0].strip().strip('`')
                ai_blended = parse_ai_blended(cells[2])
                action = parse_action(cells[4])
                apply_kind, apply_num = parse_apply(cells[5])
                rows.append({
                    'tag': tag,
                    'ai_blended': ai_blended,
                    'action': action,
                    'apply_kind': apply_kind,
                    'apply_num': apply_num,
                })
            i += 1
        yield {
            'display': display,
            'slug': slug,
            'tier': tier,
            'category': category,
            'rows': rows,
        }

# JSON write --------------------------------------------------------------------
def write_json_atomic(path, obj):
    """Preserve insertion order; 2-space indent; trailing newline omitted to match repo style."""
    tmp = path + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

def load_json(path):
    with io.open(path, encoding='utf-8') as f:
        return json.load(f)

def apply_to_json(item, write):
    slug = item['slug']
    path = os.path.join(ITEMS_DIR, slug + '.json')
    if not os.path.exists(path):
        return ('missing', 0, 0, 0, 0)
    data = load_json(path)
    ps = data.setdefault('values', {}).setdefault('playstyle_score', {})

    bumps = drops = overrides = skipped = 0
    for row in item['rows']:
        tag = row['tag']
        kind = row['apply_kind']
        if kind == 'skip' or kind == 'unknown':
            skipped += 1
            continue
        if kind == 'accept':
            if row['action'] == 'drop':
                if tag in ps and ps[tag] is not None:
                    ps[tag] = None
                    drops += 1
                else:
                    skipped += 1
            else:
                ps[tag] = row['ai_blended']
                bumps += 1
        elif kind == 'override':
            ps[tag] = row['apply_num']
            overrides += 1

    if write and (bumps or drops or overrides):
        write_json_atomic(path, data)
    return ('ok', bumps, drops, overrides, skipped)

# Backup ------------------------------------------------------------------------
def backup_items():
    ts = time.strftime('%Y%m%d_%H%M%S')
    dst = os.path.join(DATA, 'items_backup_' + ts)
    shutil.copytree(ITEMS_DIR, dst)
    return dst

# Main --------------------------------------------------------------------------
def main():
    write = '--write' in sys.argv
    if not os.path.isdir(ITEMS_DIR):
        sys.exit('items dir not found: ' + ITEMS_DIR)
    md = io.open(MD_PATH, encoding='utf-8').read()

    if write:
        print('backing up items/ ...')
        backup_dir = backup_items()
        print('  -> ' + backup_dir)
    else:
        backup_dir = None
        print('DRY RUN (re-run with --write to apply)')

    items = list(parse_audit(md))
    print('found %d audit items' % len(items))

    totals = {'items': 0, 'missing': 0, 'bumps': 0, 'drops': 0, 'overrides': 0, 'skipped': 0}
    for it in items:
        status, b, d, o, s = apply_to_json(it, write)
        if status == 'missing':
            print('  MISSING JSON: %s' % it['slug'])
            totals['missing'] += 1
            continue
        totals['items'] += 1
        totals['bumps'] += b; totals['drops'] += d; totals['overrides'] += o; totals['skipped'] += s
        if b or d or o:
            print('  %s: %d bumps, %d drops, %d overrides, %d skipped' % (it['slug'], b, d, o, s))

    print('')
    print('done. items=%(items)d  bumps=%(bumps)d  drops=%(drops)d  overrides=%(overrides)d  skipped=%(skipped)d  missing=%(missing)d' % totals)
    if backup_dir:
        print('backup at %s' % backup_dir)

if __name__ == '__main__':
    main()
