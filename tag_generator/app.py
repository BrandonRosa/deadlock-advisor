from flask import Flask, jsonify, request, render_template, send_from_directory
import json, uuid
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

BASE        = Path(__file__).parent
DATA        = BASE / "data"
HEROES_DIR  = DATA / "heroes"
ITEMS_DIR   = DATA / "items"
BASELINES_DIR = DATA / "baselines"
TAGS_F      = DATA / "tags.json"
QA_DIR      = DATA / "qa"
REPORTS_DIR = QA_DIR / "reports"
SIM_LOGS    = DATA / "sim_logs"

SOURCE_ROOT = Path(__file__).parent.parent
SOURCE_HEROES     = SOURCE_ROOT / "resources" / "heroes"
SOURCE_ITEMS_DIR  = SOURCE_ROOT / "resources" / "items"
SOURCE_ITEMS_IDX  = SOURCE_ITEMS_DIR / "index.json"

HERO_KEYS = [
    "abrams","apollo","bebop","billy","calico","celeste",
    "the_doorman","drifter","dynamo","graves","grey_talon",
    "haze","holliday","infernus","ivy","kelvin","lady_geist",
    "lash","mcginnis","mina","mirage","mo_&_krill","paige",
    "paradox","pocket","rem","seven","shiv","silver",
    "sinclair","venator","victor","vindicta","viscous","vyper",
    "warden","wraith","yamato",
]

DEFAULT_TAGS = [
    {"code":"pure_damage",          "name":"Pure Damage",           "description":""},
    {"code":"spirit_damage",        "name":"Spirit Damage",         "description":""},
    {"code":"bullet_damage",        "name":"Bullet Damage",         "description":""},
    {"code":"melee_damage",         "name":"Melee Damage",          "description":""},
    {"code":"spirit_resistance",    "name":"Spirit Resistance",     "description":""},
    {"code":"bullet_resistance",    "name":"Bullet Resistance",     "description":""},
    {"code":"melee_resistance",     "name":"Melee Resistance",      "description":""},
    {"code":"spirit_resist_shred",  "name":"Spirit Resist Shred",   "description":""},
    {"code":"bullet_resist_shred",  "name":"Bullet Resist Shred",   "description":""},
    {"code":"burst_damage",         "name":"Burst Damage",          "description":""},
    {"code":"continuous_damage",    "name":"Continuous Damage",     "description":""},
    {"code":"dot",                  "name":"DoT",                   "description":""},
    {"code":"debuff",               "name":"Debuff",                "description":""},
    {"code":"burst_resistance",     "name":"Burst Resistance",      "description":""},
    {"code":"continuous_resistance","name":"Continuous Resistance", "description":""},
    {"code":"debuff_resistance",    "name":"Debuff Resistance",     "description":""},
    {"code":"bullet_proc",          "name":"Bullet Proc",           "description":""},
    {"code":"bullet_evasion",       "name":"Bullet Evasion",        "description":""},
    {"code":"fire_rate",            "name":"Fire Rate",             "description":""},
    {"code":"fire_rate_slow",       "name":"Fire Rate Slow",        "description":""},
    {"code":"aoe_cluster",          "name":"AoE / Cluster",         "description":""},
    {"code":"close_range",          "name":"Close Range",           "description":""},
    {"code":"mid_range",            "name":"Mid Range",             "description":""},
    {"code":"long_range",           "name":"Long Range",            "description":""},
    {"code":"stun",                 "name":"Stun / CC",             "description":""},
    {"code":"aerial",               "name":"Aerial",                "description":""},
    {"code":"grounded",             "name":"Grounded",              "description":""},
    {"code":"horizontal_mobility",  "name":"Horizontal Mobility",   "description":""},
    {"code":"vertical_mobility",    "name":"Vertical Mobility",     "description":""},
    {"code":"movement_slow",        "name":"Movement Slow",         "description":""},
    {"code":"silence",              "name":"Silence",               "description":""},
    {"code":"disarm",               "name":"Disarm",                "description":""},
    {"code":"cc_resist",            "name":"CC Resist",             "description":""},
    {"code":"team_heal",            "name":"Team Heal",             "description":""},
    {"code":"self_heal",            "name":"Self Heal",             "description":""},
    {"code":"anti_heal",            "name":"Anti-Heal",             "description":""},
    {"code":"high_max_hp",          "name":"High Max HP",           "description":""},
    {"code":"low_max_hp",           "name":"Low Max HP",            "description":""},
    {"code":"shield",               "name":"Shield",                "description":""},
    {"code":"scaling_early",        "name":"Early Scaling",         "description":""},
    {"code":"scaling_late",         "name":"Late Scaling",          "description":""},
    {"code":"farmer",               "name":"Farmer",                "description":""},
    {"code":"self_buff",            "name":"Self Buff",             "description":""},
    {"code":"ally_buff",            "name":"Ally Buff",             "description":""},
]


def blank_vals(tags):
    return {t["code"]: None for t in tags}


def init_hero(manifest, nname, tags):
    return {
        "eng_name":        manifest.get("name", ""),
        "normalized_name": nname,
        "desc_eng":        "",
        "image_path":      manifest.get("portrait", ""),
        "mini_image_path": manifest.get("mini_icon", ""),
        "wiki_url":        manifest.get("wiki_url", ""),
        "builds": [{
            "name":                    "General",
            "normalized_build_name":   f"{nname}_general",
            "build_description_eng":   "",
            "values": {
                "ally_weight":  blank_vals(tags),
                "item_affinity":  blank_vals(tags),
                "enemy_weight": blank_vals(tags),
                "playstyle_score":   blank_vals(tags),
            }
        }]
    }


def init_item(manifest, nname, tags):
    return {
        "name":            manifest.get("name", ""),
        "normalized_name": nname,
        "category":        manifest.get("category", ""),
        "tier":            manifest.get("tier", 0),
        "wiki_url":        manifest.get("wiki_url", ""),
        "image_path":      manifest.get("image", ""),
        "values": {
            "playstyle_score": blank_vals(tags)
        }
    }


def bootstrap():
    HEROES_DIR.mkdir(parents=True, exist_ok=True)
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)
    QA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    if not TAGS_F.exists():
        TAGS_F.write_text(json.dumps(DEFAULT_TAGS, indent=2, ensure_ascii=False))

    tags = json.loads(TAGS_F.read_text())

    for h in HERO_KEYS:
        hf = HEROES_DIR / f"{h}.json"
        if not hf.exists():
            mp = SOURCE_HEROES / h / f"manifest_{h}.json"
            if mp.exists():
                m = json.loads(mp.read_text())
                hf.write_text(json.dumps(init_hero(m, h, tags), indent=2, ensure_ascii=False))

    if SOURCE_ITEMS_IDX.exists():
        for item_n in json.loads(SOURCE_ITEMS_IDX.read_text()):
            itf = ITEMS_DIR / f"{item_n}.json"
            if not itf.exists():
                mp = SOURCE_ITEMS_DIR / item_n / f"manifest_{item_n}.json"
                if mp.exists():
                    m = json.loads(mp.read_text())
                    itf.write_text(json.dumps(init_item(m, item_n, tags), indent=2, ensure_ascii=False))


bootstrap()


# ── Static image proxy ───────────────────────────────────────────────────────
@app.route("/src/<path:filepath>")
def src_image(filepath):
    full_path = SOURCE_ROOT / filepath
    print(f"Looking for: {full_path}, exists: {full_path.exists()}")
    return send_from_directory(SOURCE_ROOT, filepath)


# ── Tags ─────────────────────────────────────────────────────────────────────
@app.route("/api/tags", methods=["GET"])
def get_tags():
    return jsonify(json.loads(TAGS_F.read_text()))


@app.route("/api/tags", methods=["POST"])
def create_tag():
    d = request.json
    tags = json.loads(TAGS_F.read_text())
    if any(t["code"] == d["code"] for t in tags):
        return jsonify({"error": "Code already exists"}), 400
    tags.append({
        "code": d["code"],
        "name": d["name"],
        "short_label": d.get("short_label", ""),
        "description": d.get("description", ""),
    })
    TAGS_F.write_text(json.dumps(tags, indent=2, ensure_ascii=False))
    return jsonify(tags[-1]), 201


@app.route("/api/tags/<code>", methods=["PUT"])
def update_tag(code):
    d = request.json
    tags = json.loads(TAGS_F.read_text())
    for t in tags:
        if t["code"] == code:
            t["name"]        = d.get("name", t["name"])
            if "short_label" in d:
                t["short_label"] = d["short_label"]
            t["description"] = d.get("description", t.get("description", ""))
            break
    TAGS_F.write_text(json.dumps(tags, indent=2, ensure_ascii=False))
    return jsonify({"ok": True})


@app.route("/api/tags", methods=["PUT"])
def reorder_tags():
    tags = request.json      # full array in new order
    TAGS_F.write_text(json.dumps(tags, indent=2, ensure_ascii=False))
    return jsonify({"ok": True})


@app.route("/api/tags/<code>", methods=["DELETE"])
def delete_tag(code):
    tags = json.loads(TAGS_F.read_text())
    tags = [t for t in tags if t["code"] != code]
    TAGS_F.write_text(json.dumps(tags, indent=2, ensure_ascii=False))
    return jsonify({"ok": True})


# ── Heroes ───────────────────────────────────────────────────────────────────
@app.route("/api/heroes", methods=["GET"])
def get_heroes():
    presets = []
    regular = []

    def read_hero(f):
        try:
            d = json.loads(f.read_text())
            return {
                "normalized_name": d["normalized_name"],
                "eng_name":        d["eng_name"],
                "image_path":      d.get("image_path", ""),
                "build_count":     len(d.get("builds", [])),
                "is_preset":       d.get("is_preset", False),
                "colors":          d.get("colors", []),
                "search_terms":    d.get("search_terms", []),
            }
        except Exception:
            return None

    # Preset heroes first (any .json with is_preset=true)
    for f in sorted(HEROES_DIR.glob("*.json")):
        if f.stem in HERO_KEYS:
            continue
        h = read_hero(f)
        if h and h["is_preset"]:
            presets.append(h)

    # Regular heroes in canonical order
    for key in HERO_KEYS:
        f = HEROES_DIR / f"{key}.json"
        if f.exists():
            h = read_hero(f)
            if h:
                regular.append(h)

    # Any other custom (non-preset) heroes not in HERO_KEYS
    for f in sorted(HEROES_DIR.glob("*.json")):
        key = f.stem
        if key not in HERO_KEYS:
            h = read_hero(f)
            if h and not h["is_preset"]:
                regular.append(h)

    return jsonify(presets + regular)


@app.route("/api/heroes/<name>", methods=["GET"])
def get_hero(name):
    f = HEROES_DIR / f"{name}.json"
    if not f.exists():
        return jsonify({"error": "Not found"}), 404
    return jsonify(json.loads(f.read_text()))


@app.route("/api/heroes/<name>", methods=["PUT"])
def save_hero(name):
    f = HEROES_DIR / f"{name}.json"
    # Always write UTF-8 — without the explicit encoding, write_text uses the
    # platform default (cp1252 on Windows), which produces files that the
    # utf-8-strict reader in /api/heroes/all then silently drops.
    f.write_text(json.dumps(request.json, indent=2, ensure_ascii=False), encoding='utf-8')
    return jsonify({"ok": True})


@app.route("/api/heroes", methods=["POST"])
def create_hero():
    d = request.json
    n = d["normalized_name"]
    f = HEROES_DIR / f"{n}.json"
    if f.exists():
        return jsonify({"error": "Already exists"}), 400
    tags = json.loads(TAGS_F.read_text())
    hero = {
        "eng_name": d.get("eng_name", ""),
        "normalized_name": n,
        "desc_eng": "",
        "image_path": "",
        "mini_image_path": "",
        "wiki_url": "",
        "builds": [{
            "name": "General",
            "normalized_build_name": f"{n}_general",
            "build_description_eng": "",
            "values": {
                "ally_weight":  blank_vals(tags),
                "item_affinity":  blank_vals(tags),
                "enemy_weight": blank_vals(tags),
                "playstyle_score":   blank_vals(tags),
            }
        }]
    }
    f.write_text(json.dumps(hero, indent=2, ensure_ascii=False))
    return jsonify(hero), 201


# ── Items ────────────────────────────────────────────────────────────────────
@app.route("/api/items", methods=["GET"])
def get_items():
    order = []
    if SOURCE_ITEMS_IDX.exists():
        order = json.loads(SOURCE_ITEMS_IDX.read_text())
    out = []
    seen = set()
    for key in order:
        f = ITEMS_DIR / f"{key}.json"
        if f.exists():
            try:
                d = json.loads(f.read_text())
                out.append({
                    "normalized_name": d["normalized_name"],
                    "name":     d["name"],
                    "category": d.get("category", ""),
                    "tier":     d.get("tier", 0),
                    "image_path": d.get("image_path", ""),
                })
                seen.add(key)
            except Exception:
                pass
    for f in sorted(ITEMS_DIR.glob("*.json")):
        if f.stem not in seen:
            try:
                d = json.loads(f.read_text())
                out.append({
                    "normalized_name": d["normalized_name"],
                    "name":     d["name"],
                    "category": d.get("category", ""),
                    "tier":     d.get("tier", 0),
                    "image_path": d.get("image_path", ""),
                })
            except Exception:
                pass
    return jsonify(out)


@app.route("/api/items/<name>", methods=["GET"])
def get_item(name):
    f = ITEMS_DIR / f"{name}.json"
    if not f.exists():
        return jsonify({"error": "Not found"}), 404
    return jsonify(json.loads(f.read_text()))


@app.route("/api/items/<name>", methods=["PUT"])
def save_item(name):
    f = ITEMS_DIR / f"{name}.json"
    f.write_text(json.dumps(request.json, indent=2, ensure_ascii=False))
    return jsonify({"ok": True})


@app.route("/api/items/all")
def get_all_items():
    out = []
    for f in sorted(ITEMS_DIR.glob("*.json")):
        try:
            out.append(json.loads(f.read_text(encoding='utf-8')))
        except Exception:
            pass
    return jsonify(out)


@app.route("/api/heroes/all")
def get_all_heroes():
    out = []
    for f in sorted(HEROES_DIR.glob("*.json")):
        try:
            # Tolerate Windows cp1252 bytes (e.g. 0x85 ellipsis) that can leak
            # in via OS clipboards. Read as bytes; try utf-8 first, fall back
            # to cp1252 — which is what /api/heroes does implicitly via the
            # platform default. Silently swallowing UnicodeDecodeError was
            # what caused grey_talon / mcginnis / viscous to vanish from the
            # tag-explorer's Heroes/Builds tab.
            raw = f.read_bytes()
            try:
                text = raw.decode('utf-8')
            except UnicodeDecodeError:
                text = raw.decode('cp1252')
            out.append(json.loads(text))
        except Exception as e:
            print(f"[heroes/all] skipped {f.name}: {e}")
    return jsonify(out)


@app.route("/api/baselines", methods=["GET"])
def list_baselines():
    """List all individual baseline JSONs (one row per synthetic item).
    The aggregated comparison table lives at /api/baselines/table; this is
    the flat list used for the Browse view + click-to-edit lookups."""
    out = []
    for f in sorted(BASELINES_DIR.glob("_bl_*.json")):
        try:
            d = json.loads(f.read_text(encoding='utf-8'))
            out.append({
                "normalized_name": d["normalized_name"],
                "name":     d["name"],
                "category": d.get("category", ""),
                "tier":     d.get("tier", 0),
                "synthetic": True,
                "baseline_meta": d.get("baseline_meta", {}),
            })
        except Exception:
            pass
    return jsonify(out)


@app.route("/api/baselines/<name>", methods=["GET"])
def get_baseline(name):
    f = BASELINES_DIR / f"{name}.json"
    if not f.exists():
        return jsonify({"error": "Not found"}), 404
    return jsonify(json.loads(f.read_text(encoding='utf-8')))


@app.route("/api/baselines/<name>", methods=["PUT"])
def save_baseline(name):
    """Save a baseline JSON and propagate edits into _baseline_table.json so
    the comparison table + per-item audit panel reflect the new value
    immediately (without rerunning wiki_audit.cjs)."""
    f = BASELINES_DIR / f"{name}.json"
    payload = request.json
    f.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding='utf-8')
    _sync_baseline_into_table(name, payload)
    return jsonify({"ok": True})


_TIER_IDX = {800: 1, 1600: 2, 3200: 3, 6400: 4}


def _coerce_raw_number(raw_value):
    """'+15%' / '15' / 15 → 15. Falls back to original value if non-numeric."""
    if isinstance(raw_value, str):
        cleaned = raw_value.strip().lstrip("+").rstrip("%")
        try:
            return float(cleaned) if "." in cleaned else int(cleaned)
        except ValueError:
            return raw_value
    return raw_value


def _apply_band_to_table(table, stat, tier_souls, band_key, raw_for_table, *,
                         percentile=None, derivation=None,
                         sample_count=None, tier_distribution=None):
    """Patch one (stat, tier, band) cell in the in-memory baseline table.

    Only updates fields the UI owns (raw / percentile / derived flag, plus
    optional n + distribution at the tier level). Sample lists and
    current_score_at_band stay owned by wiki_audit.cjs."""
    cell = table.get("baselines", {}).get(stat, {}).get(f"tier_{tier_souls}", {})
    bands = cell.get("bands")
    if not bands:
        return False
    band_entry = bands.get(band_key)
    if not band_entry:
        return False
    band_entry["raw"] = raw_for_table
    # Populating a 2.0 cell that was previously a placeholder: drop the
    # not-best-in-game flag so it renders as a real value.
    if band_entry.get("not_best_in_game"):
        band_entry.pop("not_best_in_game", None)
        band_entry.pop("tier_max", None)
        band_entry.pop("game_max", None)
        band_entry.pop("note", None)
    if percentile is not None:
        band_entry["percentile"] = percentile
    if derivation:
        band_entry["derived"] = derivation == "extrapolated_from_neighbor"
    if sample_count is not None:
        cell["n"] = sample_count
    td = tier_distribution or {}
    if any(td.get(k) is not None for k in ("min", "median", "max")):
        dist = cell.get("distribution") or {}
        for k in ("min", "median", "max"):
            if td.get(k) is not None:
                dist[k] = td[k]
        cell["distribution"] = dist
    return True


def _sync_baseline_into_table(name, payload):
    """Patch the corresponding cell in _baseline_table.json from a single
    baseline file save. The table is the rolled-up summary the UI shows —
    keeping it in sync with the underlying _bl_*.json files means edits
    round-trip immediately."""
    table_f = BASELINES_DIR / "_baseline_table.json"
    if not table_f.exists():
        return
    meta = (payload or {}).get("baseline_meta") or {}
    stat = meta.get("stat")
    if not stat:
        return
    tier_souls = payload.get("tier") or 0
    if tier_souls not in _TIER_IDX:
        return
    band_num = meta.get("score_band")
    if band_num is None:
        return
    try:
        band_key = f"{float(band_num):.1f}"
    except (TypeError, ValueError):
        return
    raw_for_table = _coerce_raw_number(meta.get("raw_value"))
    try:
        table = json.loads(table_f.read_text(encoding='utf-8'))
        if not _apply_band_to_table(
            table, stat, tier_souls, band_key, raw_for_table,
            percentile=meta.get("percentile"),
            derivation=meta.get("derivation"),
            sample_count=meta.get("sample_count"),
            tier_distribution=meta.get("tier_distribution"),
        ):
            return
        table_f.write_text(json.dumps(table, indent=2, ensure_ascii=False), encoding='utf-8')
    except Exception:
        # Sync is best-effort — failure here doesn't block the primary save.
        pass


def _blank_playstyle_score():
    """Return the canonical {tag: null, …} shape used by every _bl_*.json.

    Sourced from an existing baseline file rather than tags.json so the
    surface stays identical even if tags.json has been edited (the audit
    script's existing files act as the authoritative shape)."""
    for f in sorted(BASELINES_DIR.glob("_bl_*.json")):
        try:
            d = json.loads(f.read_text(encoding='utf-8'))
            ps = d.get("values", {}).get("playstyle_score")
            if isinstance(ps, dict) and ps:
                return {k: None for k in ps.keys()}
        except Exception:
            continue
    # Fallback: derive from tags.json
    try:
        tags = json.loads(TAGS_F.read_text(encoding='utf-8'))
        return {t["code"]: None for t in tags}
    except Exception:
        return {}


def _format_raw_display(raw_for_table, stat, table):
    """Render a numeric threshold as the +N / +N% display string used in
    baseline_meta.raw_value. Picks the unit from the table's tier slot if
    one is set."""
    if not isinstance(raw_for_table, (int, float)):
        return str(raw_for_table)
    unit = ""
    stat_block = (table.get("baselines") or {}).get(stat) or {}
    for k in ("tier_800", "tier_1600", "tier_3200", "tier_6400"):
        u = (stat_block.get(k) or {}).get("unit")
        if u:
            unit = u
            break
    sign = "+" if raw_for_table >= 0 else ""
    return f"{sign}{raw_for_table}{unit}"


def _write_baseline_file(stat, tier_souls, band_key, raw_for_table, mapped_tag, table):
    """Create or update _bl_t{idx}_{stat}_{band}.json for one cell.

    On create: scaffolds a minimal synthetic-item shape so the file looks
    identical to ones the audit script produces.
    On update: only touches baseline_meta.raw_value and
    values.playstyle_score[<mapped_tag>] — leaves derivation, sample counts,
    etc. alone so a later wiki_audit run can still own them."""
    tier_idx = _TIER_IDX[tier_souls]
    band_slug = band_key.replace(".", "_")
    nname = f"_bl_t{tier_idx}_{stat}_{band_slug}"
    f = BASELINES_DIR / f"{nname}.json"
    band_num = float(band_key)
    raw_display = _format_raw_display(raw_for_table, stat, table)

    if f.exists():
        try:
            d = json.loads(f.read_text(encoding='utf-8'))
        except Exception:
            d = None
    else:
        d = None

    if d is None:
        # Scaffold a new synthetic baseline item.
        d = {
            "baseline_meta": {
                "derivation": "manual",
                "percentile": {"1.0": 50, "1.5": 75, "2.0": 100}.get(band_key, None),
                "raw_value": raw_display,
                "sample_count": 0,
                "score_band": band_num,
                "stat": stat,
                "tier_distribution": {"max": None, "median": None, "min": None},
            },
            "category": "Weapon",
            "compare_to": [],
            "name": f"[Baseline] T{tier_idx} {stat} @{band_key}",
            "normalized_name": nname,
            "synthetic": True,
            "tier": tier_souls,
            "upgrades_from": [],
            "values": {"playstyle_score": _blank_playstyle_score()},
            "wiki_url": None,
        }
    else:
        meta = d.setdefault("baseline_meta", {})
        meta["raw_value"] = raw_display
        meta.setdefault("stat", stat)
        meta.setdefault("score_band", band_num)

    if mapped_tag:
        ps = d.setdefault("values", {}).setdefault("playstyle_score", _blank_playstyle_score())
        ps[mapped_tag] = band_num

    f.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding='utf-8')


@app.route("/api/baselines/by-stat/<stat>", methods=["PUT"])
def save_baselines_by_stat(stat):
    """Bulk-save all (tier × band) raw thresholds for one stat.

    Payload shape:
      { "bands": { "tier_800": {"1.0": 20, "1.5": 30, "2.0": null}, ... } }

    A null value leaves that cell untouched (no file written, table cell
    unchanged). A non-null value updates the existing _bl_*.json (or
    creates one) and patches _baseline_table.json. Returns the fresh
    table so the UI can refresh in one round-trip."""
    table_f = BASELINES_DIR / "_baseline_table.json"
    if not table_f.exists():
        return jsonify({"error": "baseline table missing"}), 500
    table = json.loads(table_f.read_text(encoding='utf-8'))
    if stat not in (table.get("baselines") or {}):
        return jsonify({"error": f"unknown stat: {stat}"}), 404

    mapping = (table.get("stat_to_tag_mapping") or {}).get(stat) or {}
    raw_tag = mapping.get("tag")
    # tag may be a list, a string, or null. Only auto-assign the playstyle
    # score when there's exactly one mapped tag (the common case).
    mapped_tag = raw_tag if isinstance(raw_tag, str) else None

    payload = request.json or {}
    bands_in = payload.get("bands") or {}
    applied = 0
    for tier_key, tier_souls in (("tier_800", 800), ("tier_1600", 1600),
                                 ("tier_3200", 3200), ("tier_6400", 6400)):
        cells = bands_in.get(tier_key) or {}
        for band_key in ("1.0", "1.5", "2.0"):
            if band_key not in cells:
                continue
            v = cells[band_key]
            if v is None or v == "":
                continue
            raw_for_table = _coerce_raw_number(v)
            if not _apply_band_to_table(table, stat, tier_souls, band_key, raw_for_table):
                continue
            _write_baseline_file(stat, tier_souls, band_key, raw_for_table, mapped_tag, table)
            applied += 1

    table_f.write_text(json.dumps(table, indent=2, ensure_ascii=False), encoding='utf-8')
    return jsonify({"ok": True, "applied": applied, "table": table})


@app.route("/api/baselines/table")
def get_baselines_table():
    f = DATA / "baselines" / "_baseline_table.json"
    if not f.exists():
        return jsonify({"baselines": {}, "stat_to_tag_mapping": {}, "error": "no baseline table"})
    return jsonify(json.loads(f.read_text(encoding='utf-8')))


@app.route("/api/baselines/scrape_cache")
def get_scrape_cache():
    f = DATA / "_scrape_cache.json"
    if not f.exists():
        return jsonify({"items": [], "error": "no scrape cache"})
    return jsonify(json.loads(f.read_text(encoding='utf-8')))


# ── QA ───────────────────────────────────────────────────────────────────────
def load_scenarios():
    f = QA_DIR / "scenarios.json"
    return json.loads(f.read_text()) if f.exists() else []

def save_scenarios(scenarios):
    (QA_DIR / "scenarios.json").write_text(json.dumps(scenarios, indent=2, ensure_ascii=False))

@app.route("/api/qa/scenarios", methods=["GET"])
def get_qa_scenarios():
    return jsonify(load_scenarios())

@app.route("/api/qa/scenarios", methods=["POST"])
def create_qa_scenario():
    d = request.json
    scenarios = load_scenarios()
    scenario = {
        "id":           str(uuid.uuid4()),
        "name":         d.get("name", "Unnamed"),
        "created_at":   datetime.utcnow().isoformat(),
        "allies":       d.get("allies", []),
        "enemies":      d.get("enemies", []),
        "scoreFormula": d.get("scoreFormula", "v2"),
        "algos":        d.get("algos", ["cosine"]),
        "heroNotes":    d.get("heroNotes", {}),
        "acceptance":   d.get("acceptance", {}),
        # testBuilds: which builds to RUN through the algo (filter).
        # viewBuilds: which build each hero "IS" when they appear as ally/enemy
        #             (sets MATCH.selectedBuilds before computeResults).
        "testBuilds":   d.get("testBuilds", d.get("buildSelections", {})),
        "viewBuilds":   d.get("viewBuilds", {}),
    }
    scenarios.append(scenario)
    save_scenarios(scenarios)
    return jsonify(scenario), 201

@app.route("/api/qa/scenarios/<sid>", methods=["PUT"])
def update_qa_scenario(sid):
    scenarios = load_scenarios()
    d = request.json
    for s in scenarios:
        if s["id"] == sid:
            s["name"]         = d.get("name", s["name"])
            s["allies"]       = d.get("allies", s["allies"])
            s["enemies"]      = d.get("enemies", s["enemies"])
            s["scoreFormula"] = d.get("scoreFormula", s.get("scoreFormula", "v2"))
            s["algos"]        = d.get("algos", s.get("algos", []))
            s["heroNotes"]  = d.get("heroNotes", s.get("heroNotes", {}))
            s["acceptance"] = d.get("acceptance", s.get("acceptance", {}))
            s["testBuilds"] = d.get("testBuilds", s.get("testBuilds", s.get("buildSelections", {})))
            s["viewBuilds"] = d.get("viewBuilds", s.get("viewBuilds", {}))
            # legacy field — keep clearing it so old scenarios migrate forward
            s.pop("buildSelections", None)
            save_scenarios(scenarios)
            return jsonify(s)
    return jsonify({"error": "Not found"}), 404

@app.route("/api/qa/scenarios/<sid>", methods=["DELETE"])
def delete_qa_scenario(sid):
    save_scenarios([s for s in load_scenarios() if s["id"] != sid])
    return jsonify({"ok": True})

@app.route("/api/qa/reports", methods=["GET"])
def get_qa_reports():
    reports = []
    for f in sorted(REPORTS_DIR.glob("*.json"), reverse=True):
        try:
            d = json.loads(f.read_text())
            reports.append({
                "id":            d["id"],
                "scenario_name": d.get("scenario_name", ""),
                "run_at":        d.get("run_at", ""),
                "allies":        d.get("allies", []),
                "enemies":       d.get("enemies", []),
            })
        except Exception:
            pass
    return jsonify(reports)

@app.route("/api/qa/reports", methods=["POST"])
def save_qa_report():
    d = request.json
    rid = str(uuid.uuid4())
    report = {"id": rid, "run_at": datetime.utcnow().isoformat(), **d}
    (REPORTS_DIR / f"{rid}.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    return jsonify({"id": rid}), 201

@app.route("/api/qa/reports/<rid>", methods=["GET"])
def get_qa_report(rid):
    f = REPORTS_DIR / f"{rid}.json"
    if not f.exists():
        return jsonify({"error": "Not found"}), 404
    return jsonify(json.loads(f.read_text()))

@app.route("/api/qa/reports/<rid>", methods=["DELETE"])
def delete_qa_report(rid):
    f = REPORTS_DIR / f"{rid}.json"
    if f.exists():
        f.unlink()
    return jsonify({"ok": True})


# ── Simulation Logs ─────────────────────────────────────────────────────────
# Each saved sim run gets its own JSON file under data/sim_logs. Filename is
# `<ts>_<hero>.json` so they sort chronologically. Used as training data for
# learning user override patterns vs. algorithm recommendations.
@app.route("/api/sim-logs", methods=["POST"])
def save_sim_log():
    SIM_LOGS.mkdir(parents=True, exist_ok=True)
    payload = request.json or {}
    ts   = (payload.get("ts") or datetime.utcnow().isoformat()).replace(":", "-")
    hero = payload.get("hero", "unknown")
    f = SIM_LOGS / f"{ts}_{hero}.json"
    f.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    return jsonify({"ok": True, "id": f.stem})


@app.route("/api/sim-logs", methods=["GET"])
def list_sim_logs():
    SIM_LOGS.mkdir(parents=True, exist_ok=True)
    items = []
    for f in sorted(SIM_LOGS.glob("*.json")):
        try:
            d = json.loads(f.read_text())
            items.append({
                "id":      f.stem,
                "hero":    d.get("hero"),
                "build":   d.get("build_name"),
                "outcome": d.get("outcome"),
                "feel":    d.get("feel"),
                "ts":      d.get("ts"),
            })
        except Exception:
            continue
    return jsonify(items)


@app.route("/api/sim-logs/<log_id>", methods=["GET"])
def get_sim_log(log_id):
    # Strip anything that could escape the directory.
    safe = log_id.replace("/", "_").replace("\\", "_").replace("..", "_")
    f = SIM_LOGS / f"{safe}.json"
    if not f.exists():
        return jsonify({"error": "not found"}), 404
    return jsonify(json.loads(f.read_text()))


# ── App ───────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    print("Tag Generator running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000, use_reloader=True)
    #app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True)
