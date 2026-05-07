"""One-shot helper: inject `colors` + `search_terms` fields into every hero JSON.

Color choices were determined by inspecting each hero's portrait. Run once:
    py _apply_colors.py
Safe to re-run: only sets fields that are missing (preserves any user edits).
"""
import json
from pathlib import Path

# Canonical filter palette: 12 broad swatches (kept short by design)
PALETTE = ["red", "orange", "yellow", "green", "blue", "purple",
           "pink", "brown", "tan", "white", "black", "grey"]

HERO_COLORS = {
    "abrams":      ["blue", "grey"],
    "apollo":      ["red", "brown", "yellow"],
    "bebop":       ["orange", "white", "green"],
    "billy":       ["brown", "pink", "tan", "black"],
    "calico":      ["purple", "black"],
    "celeste":     ["blue", "purple", "pink"],
    "drifter":     ["red", "black"],
    "dynamo":      ["blue", "green", "black"],
    "graves":      ["white", "black"],
    "grey_talon":  ["green", "white", "orange"],
    "haze":        ["black", "yellow", "tan"],
    "holliday":    ["orange", "brown", "green"],
    "infernus":    ["red", "orange", "black", "yellow"],
    "ivy":         ["brown", "tan", "purple", "green"],
    "kelvin":      ["orange", "white"],
    "lady_geist":  ["white", "green"],
    "lash":        ["blue", "tan", "black"],
    "mcginnis":    ["red", "blue", "black"],
    "mina":        ["red", "black"],
    "mirage":      ["purple", "brown"],
    "mo_&_krill":  ["black", "white", "brown"],
    "paige":       ["orange", "green"],
    "paradox":     ["black", "pink", "blue", "red"],
    "pocket":      ["black", "yellow", "tan", "red"],
    "rem":         ["blue", "black", "purple", "white"],
    "seven":       ["black", "yellow"],
    "shiv":        ["black", "white", "tan"],
    "silver":      ["tan", "orange", "black"],
    "sinclair":    ["purple", "black"],
    "the_doorman": ["red", "orange", "yellow"],
    "venator":     ["grey", "purple", "black"],
    "victor":      ["black", "green"],
    "vindicta":    ["blue", "purple"],
    "viscous":     ["green"],
    "vyper":       ["green", "orange", "red"],
    "warden":      ["blue", "brown"],
    "wraith":      ["black", "pink", "white"],
    "yamato":      ["purple", "brown", "tan"],
}

HERE = Path(__file__).parent

def read_json_lenient(p: Path):
    raw = p.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return json.loads(raw.decode(enc))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    raise RuntimeError(f"Could not decode {p}")

for f in sorted(HERE.glob("*.json")):
    key = f.stem
    if key == "preset":
        continue
    data = read_json_lenient(f)
    changed = False
    if "colors" not in data:
        data["colors"] = HERO_COLORS.get(key, [])
        changed = True
    if "search_terms" not in data:
        data["search_terms"] = []
        changed = True
    if changed:
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  + {key}: colors={data['colors']}")
    else:
        print(f"    {key}: already set, skipped")

# Validate: report any unrecognized colors
unknown = set()
for colors in HERO_COLORS.values():
    for c in colors:
        if c not in PALETTE:
            unknown.add(c)
if unknown:
    print(f"\nWARNING: colors not in palette: {sorted(unknown)}")
else:
    print(f"\nAll colors in canonical palette of {len(PALETTE)}.")
