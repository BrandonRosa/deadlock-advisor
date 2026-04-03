from flask import Flask, jsonify, request, render_template, send_from_directory
import json
from pathlib import Path

app = Flask(__name__)

BASE        = Path(__file__).parent
DATA        = BASE / "data"
HEROES_DIR  = DATA / "heroes"
ITEMS_DIR   = DATA / "items"
TAGS_F      = DATA / "tags.json"

SOURCE_ROOT       = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public")
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
                "self_weight":  blank_vals(tags),
                "enemy_weight": blank_vals(tags),
                "self_score":   blank_vals(tags),
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
            "self_score": blank_vals(tags)
        }
    }


def bootstrap():
    HEROES_DIR.mkdir(parents=True, exist_ok=True)
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)

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
    tags.append({"code": d["code"], "name": d["name"], "description": d.get("description", "")})
    TAGS_F.write_text(json.dumps(tags, indent=2, ensure_ascii=False))
    return jsonify(tags[-1]), 201


@app.route("/api/tags/<code>", methods=["PUT"])
def update_tag(code):
    d = request.json
    tags = json.loads(TAGS_F.read_text())
    for t in tags:
        if t["code"] == code:
            t["name"]        = d.get("name", t["name"])
            t["description"] = d.get("description", t["description"])
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
    f.write_text(json.dumps(request.json, indent=2, ensure_ascii=False))
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
                "self_weight":  blank_vals(tags),
                "enemy_weight": blank_vals(tags),
                "self_score":   blank_vals(tags),
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


# ── App ───────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    print("Tag Generator running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000, use_reloader=False)
