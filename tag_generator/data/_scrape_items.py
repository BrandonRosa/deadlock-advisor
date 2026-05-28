# -*- coding: utf-8 -*-
"""
Bulk wiki scraper for Deadlock item pages -> _scrape_raw_dump.json

Purpose: after a balance patch, re-fetch every item's BASE (non-enhanced) data from
deadlock.wiki in one run, in a STRUCTURED, AI-readable shape so the interpretation
re-pass (re-judging the Calculator tags in item_interpretations.md) has clean source.

Why structured (not mashed text): the wiki encodes meaning in CSS classes/tabs that
a flat text scrape destroys. We preserve it:
  * BASE vs ENHANCED — each page has a `.tabber__panel` per variant
    (#tabber-Default = base, #tabber-Enhanced = enhanced). We read ONLY the Default
    panel for base stats. (The page-level `.codename` is the same internal id for
    both variants, e.g. `upgrade_cold_front`; we record it but it is NOT the base
    indicator — the panel is.)
  * SCALING factors — `.active-main-stat` holds {base number, `.ss-value` scaling
    like "x 0.47", and the scaling-source via a nested `a[title]` e.g. "Spirit Power"}.
    We expand "95 x 0.47 Damage" -> {value:95, type:"Spirit Damage",
    scaling:0.47, scales_with:"Spirit Power", raw:"95 base + 0.47xSpirit Power"}
    instead of stamping the words together.
  * ACTIVE / component blocks — `.active-stat-container` -> header + cooldown +
    description + the structured stat chips above.
  * Passives — `.infobox-stat` rows (e.g. "+6% Spirit Resist").
  * Prose sections — Notes / Notable Interactions / Buildup Per Shot / etc.
    (every H2 except Contents/Gallery/Navigation) captured as text.
  * Changelog (Update history).

Interpretation (turning this into effective-raw Calculator tags) is the JUDGMENT
step done against Mass Item AI Audit Skill/01_scoring_units.md — this tool only gathers structured source.

The authoritative item list (name, category, tier, wiki slug) is imported from
public/resources/items/generate_items.py so the two never drift.

Usage:
    python _scrape_items.py            # all items
    python _scrape_items.py "Cold Front" "Spirit Burn"   # just these (testing)

Crash-safe: writes to a temp file then os.replace. Per-item errors are caught and
recorded so one bad page never aborts the whole run. Partial re-runs (specific
items) MERGE into the existing dump instead of discarding the rest.
"""
import io, os, re, sys, json, time, urllib.request

DATA = os.path.dirname(os.path.abspath(__file__))
ITEMS_PY = os.path.normpath(os.path.join(DATA, '..', '..', 'resources', 'items'))
OUT = os.path.join(DATA, '_scrape_raw_dump.json')
BASE_URL = 'https://deadlock.wiki'
UA = 'Mozilla/5.0 (compatible; DeadlockAdvisor/1.0)'

sys.path.insert(0, ITEMS_PY)
from generate_items import ITEMS, norm   # noqa: E402  (name, category, tier_souls, thumb)
from bs4 import BeautifulSoup            # noqa: E402

TIER_BY_SOULS = {800: 1, 1600: 2, 3200: 3, 6400: 4, 9999: '?'}

# Display names whose wiki slug differs (apostrophes dropped in the ITEMS list).
SLUG_OVERRIDES = {
    'Hunters Aura':      "Hunter's_Aura",
    'Enchanters Emblem': "Enchanter's_Emblem",
    'Diviners Kevlar':   "Diviner's_Kevlar",
    # plain slug is a disambiguation page; the item lives at the (item) suffix
    'Bullet Lifesteal':  'Bullet_Lifesteal_(item)',
    'Spirit Lifesteal':  'Spirit_Lifesteal_(item)',
}

# H2/H3 sections we never want as prose ('Heroes' = a hero-list table CSS dump).
SKIP_SECTIONS = {'Contents', 'Gallery', 'Navigation', 'References', 'See also', 'Heroes'}


def slug_for(name):
    return SLUG_OVERRIDES.get(name, name.replace(' ', '_'))


def fetch(slug):
    url = '%s/%s' % (BASE_URL, slug)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    return url, urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'ignore')


def txt(el, sep=' '):
    return ' '.join(el.get_text(sep, strip=True).split()) if el else ''


def parse_stat_chip(st):
    """One `.active-stat`/`.passive-stat` chip -> structured dict.

    The chip's VISIBLE TEXT is the source of truth (value + descriptive label, e.g.
    '500 Damage Threshold', '-60% Move Speed Conditional', '24 Damage Per Second').
    We deliberately do NOT trust the icon's `a[title]` as the stat's meaning — the icon
    often links to a generic stat page that mislabels the chip (e.g. a Damage-Threshold
    chip carries a 'Damage Resistance' icon). The only title we keep is the SCALING
    SOURCE inside `.ss-wrapper` (e.g. 'Spirit Power'), which is reliable because scaling
    badges always link the real stat the multiplier rides on."""
    ssv = st.select_one('.ss-value') or st.select_one('.ss-wrapper')
    scaling = None
    scales_with = None
    if ssv:
        m = re.search(r'-?\d+(?:\.\d+)?', ssv.get_text(' ', strip=True))
        if m:
            scaling = float(m.group())
            src = ssv.find('a', title=True) or st.select_one('.ss-wrapper a[title]')
            scales_with = src.get('title') if src else None
    # visible text without the scaling badge
    clone = BeautifulSoup(str(st), 'lxml')
    for junk in clone.select('.ss-wrapper'):
        junk.extract()
    text = ' '.join(clone.get_text(' ', strip=True).split())
    # first whitespace token = value (e.g. '500', '-60%', '4s', '10m'); rest = label
    parts = text.split(' ', 1)
    chip = {'value': parts[0] if parts else text,
            'label': parts[1] if len(parts) > 1 else '',
            'text': text}
    if scaling is not None:
        chip['scaling'] = scaling
        chip['scales_with'] = scales_with
        chip['raw'] = '%s base + %s x %s' % (chip['value'], scaling, scales_with or 'scaling')
    return chip


def _nearest(cont, sel):
    """Look for `sel` inside the container, else in its enclosing infobox-row block."""
    hit = cont.select_one(sel)
    if hit:
        return txt(hit)
    block = cont.find_parent('tr') or cont.find_parent('table')
    return txt(block.select_one(sel)) if block else ''


def parse_block(cont, kind):
    """One `.active-stat-container` / `.passive-stat-container` -> structured block.
    Both hold the same chip shape (`.active-stat` / `.passive-stat`, incl. *-main-stat
    which carries scaling). `kind` is 'active' or 'passive'."""
    return {
        'kind': kind,
        'header': _nearest(cont, '.active-header, .passive-header') or None,
        'cooldown': _nearest(cont, '.cooldown-value') or None,
        'description': _nearest(cont, '.active-description, .passive-description') or None,
        'stats': [parse_stat_chip(st) for st in cont.select('.active-stat, .passive-stat')],
    }


def parse_base_panel(soup):
    """Return the structured BASE block + whether an Enhanced variant exists."""
    enhanced_present = soup.find(id='tabber-Enhanced') is not None
    panel = (soup.find(id='tabber-Default')
             or soup.find(class_='tabber__panel')
             or soup)
    box = panel.select_one('.item-infobox') or panel.select_one('.infobox-table') or panel

    passives = []
    seen = set()
    for s in box.select('.infobox-stat'):
        t = txt(s)
        if t and t not in seen:
            seen.add(t)
            passives.append(t)

    components = []
    seen_comp = set()
    for cont in box.select('.active-stat-container, .passive-stat-container'):
        kind = 'active' if 'active-stat-container' in (cont.get('class') or []) else 'passive'
        comp = parse_block(cont, kind)
        if not comp['stats']:          # empty container = layout noise
            continue
        key = (kind, comp['header'], tuple(s['text'] for s in comp['stats']))
        if key in seen_comp:
            continue
        seen_comp.add(key)
        components.append(comp)

    return {'passives': passives, 'components': components}, enhanced_present


def parse_sections(soup):
    """Prose H2 sections (Notes, Notable Interactions, Buildup Per Shot, ...)."""
    content = soup.select_one('.mw-parser-output') or soup
    out = {}
    for h in content.find_all(['h2', 'h3']):
        title = txt(h).replace('[ edit ]', '').strip()
        title = re.sub(r'\s*\[\s*edit\s*\]\s*$', '', title).strip()
        if not title or title in SKIP_SECTIONS or title.lower().startswith('update'):
            continue
        # walk forward from the heading wrapper to the next heading
        node = h.find_parent(class_='mw-heading') or h
        parts = []
        for sib in node.find_next_siblings():
            cls = sib.get('class') or []
            if 'mw-heading' in cls or sib.name in ('h2', 'h3'):
                break
            t = txt(sib)
            if t:
                parts.append(t)
        body = ' '.join(parts).strip()
        if body:
            out[title] = body[:2000]
    return out


def parse_changelog(soup):
    out = []
    for t in soup.find_all('table'):
        first = t.find('tr')
        head = txt(first).lower() if first else ''
        if 'update' in head and 'change' in head:
            for tr in t.find_all('tr')[1:]:
                cells = [txt(c) for c in tr.find_all(['th', 'td'])]
                cells = [c for c in cells if c]
                if len(cells) >= 2:
                    out.append({'date': cells[0], 'change': ' '.join(cells[1:])})
            break
    return out


def codename_of(soup):
    el = soup.select_one('.codename')
    if not el:
        return None
    return txt(el).split(':', 1)[-1].strip()


def main():
    only = set(a.lower() for a in sys.argv[1:])
    items = [it for it in ITEMS if (not only or it[0].lower() in only)]
    results = []
    for i, (name, category, souls, _thumb) in enumerate(items, 1):
        slug = slug_for(name)
        entry = {'name': name, 'normalized_name': norm(name), 'category': category,
                 'cost_souls': souls, 'tier': TIER_BY_SOULS.get(souls, '?')}
        try:
            url, html = fetch(slug)
            soup = BeautifulSoup(html, 'lxml')
            for junk in soup.find_all(['style', 'script']):
                junk.decompose()
            base, enhanced = parse_base_panel(soup)
            entry['wiki_url'] = url
            entry['codename'] = codename_of(soup)
            entry['has_enhanced_variant'] = enhanced
            entry['base'] = base
            entry['sections'] = parse_sections(soup)
            entry['changelog'] = parse_changelog(soup)
            print('[%3d/%d] %-26s OK (%d passives, %d comps, %d sections, %d log)' % (
                i, len(items), name, len(base['passives']), len(base['components']),
                len(entry['sections']), len(entry['changelog'])))
        except Exception as e:
            entry['error'] = '%s: %s' % (type(e).__name__, e)
            print('[%3d/%d] %-26s FAIL %s' % (i, len(items), name, entry['error']))
        results.append(entry)
        time.sleep(0.25)

    # Merge into any existing dump so a partial re-run updates those entries only.
    merged = {}
    if only and os.path.exists(OUT):
        for e in json.load(io.open(OUT, encoding='utf-8')).get('items', []):
            merged[e['normalized_name']] = e
    for r in results:
        merged[r['normalized_name']] = r
    out_items = list(merged.values())

    tmp = OUT + '.tmp'
    with io.open(tmp, 'w', encoding='utf-8') as f:
        json.dump({'scraped_at': time.strftime('%Y-%m-%d %H:%M'), 'count': len(out_items),
                   'items': out_items}, f, indent=2, ensure_ascii=False)
    os.replace(tmp, OUT)
    ok = sum(1 for r in results if 'error' not in r)
    print('\nwrote %s: ran %d (%d ok, %d failed); dump now holds %d items' % (
        OUT, len(results), ok, len(results) - ok, len(out_items)))


if __name__ == '__main__':
    main()
