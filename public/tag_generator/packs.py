"""
Weight Pack system — layered override engine for hero / item / tag data.

Reads in this app go through `resolve_hero`, `resolve_item`, `resolve_tags`.
The resolver applies the **default** data first (the files in `data/heroes/`,
`data/items/`, `data/tags.json`) then layers each **active** pack on top in
priority order: `active[0]` overrides default, `active[1]` overrides
`active[0]` + default, etc.

Each pack is a single JSON file under `data/packs/<pack_id>.json`. Soft-
deleted packs live in `data/packs/_trash/`. The stack order + enabled state
is in `data/packs/_index.json`.

Pack file shape (see Phase 1 design doc):

    {
      "id":             "pack-pq8r",
      "name":           "My tweaks",
      "description":    "…",
      "format_version": 1,
      "created":        "ISO-8601 timestamp",
      "updated":        "ISO-8601 timestamp",
      "_remove":        { "heroes": [...], "items": [...], "tags": [...] },
      "heroes":         { "<hero_key>": { …partial override… }, … },
      "items":          { "<item_key>": { …partial override… }, … },
      "tags":           [ {code,name,…}, … ]    # additions only
    }

Hero overrides may also carry `_remove: ["<build name>", …]` to drop builds
that exist in lower layers.

Cache: `_resolved_cache` keyed by the tuple of active pack ids. Every
mutation (pack file write, index write, etc.) calls `invalidate_cache()`.

Intentionally has no Flask coupling so it can be unit-tested in isolation.
"""

from __future__ import annotations

import json
import secrets
import shutil
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

# ── Config ─────────────────────────────────────────────────────────────────
FORMAT_VERSION = 1
PACK_ID_BYTES  = 3          # 6 hex chars = 16M ids, low collision risk
ISO_NOW = lambda: datetime.now(timezone.utc).isoformat(timespec="seconds")


# ── Path helpers (configurable for tests) ──────────────────────────────────
class Paths:
    """Resolved at app start; tests can monkey-patch this single object."""
    base:        Path
    heroes_dir:  Path
    items_dir:   Path
    tags_file:   Path
    packs_dir:   Path
    pack_trash:  Path
    pack_index:  Path
    pack_meta:   Path

    @classmethod
    def configure(cls, data_dir: Path) -> None:
        cls.base       = Path(data_dir)
        cls.heroes_dir = cls.base / "heroes"
        cls.items_dir  = cls.base / "items"
        cls.tags_file  = cls.base / "tags.json"
        cls.packs_dir  = cls.base / "packs"
        cls.pack_trash = cls.packs_dir / "_trash"
        cls.pack_index = cls.packs_dir / "_index.json"
        cls.pack_meta  = cls.packs_dir / "_meta.json"


# ── Bootstrap ──────────────────────────────────────────────────────────────
def bootstrap_packs() -> None:
    """Create the packs directory + index/meta files if they don't exist.
    Idempotent — safe to call at every app start."""
    Paths.packs_dir.mkdir(parents=True, exist_ok=True)
    Paths.pack_trash.mkdir(parents=True, exist_ok=True)
    if not Paths.pack_index.exists():
        Paths.pack_index.write_text(json.dumps(
            {"version": 1, "active": [], "inactive": []},
            indent=2,
        ), encoding="utf-8")
    if not Paths.pack_meta.exists():
        Paths.pack_meta.write_text(json.dumps(
            {"format_version": FORMAT_VERSION, "created": ISO_NOW()},
            indent=2,
        ), encoding="utf-8")


# ── Index ──────────────────────────────────────────────────────────────────
def load_index() -> dict:
    return json.loads(Paths.pack_index.read_text(encoding="utf-8"))

def save_index(idx: dict) -> None:
    # Validate shape lightly so a bad PUT doesn't corrupt the file forever.
    if not isinstance(idx, dict):
        raise ValueError("index must be an object")
    out = {
        "version":  int(idx.get("version", 1)),
        "active":   list(idx.get("active", []) or []),
        "inactive": list(idx.get("inactive", []) or []),
    }
    # Drop any duplicates between the two lists (active wins).
    out["inactive"] = [p for p in out["inactive"] if p not in set(out["active"])]
    Paths.pack_index.write_text(json.dumps(out, indent=2), encoding="utf-8")
    invalidate_cache()

def get_active_packs() -> list[str]:
    return list(load_index().get("active", []))


# ── Pack file I/O ──────────────────────────────────────────────────────────
def _pack_path(pack_id: str) -> Path:
    return Paths.packs_dir / f"{pack_id}.json"

def _trash_path(pack_id: str) -> Path:
    return Paths.pack_trash / f"{pack_id}.json"

def _new_pack_id() -> str:
    while True:
        candidate = f"pack-{secrets.token_hex(PACK_ID_BYTES)}"
        if not _pack_path(candidate).exists() and not _trash_path(candidate).exists():
            return candidate

def pack_exists(pack_id: str) -> bool:
    return _pack_path(pack_id).exists()

def load_pack(pack_id: str) -> dict:
    """Load a pack file. Raises FileNotFoundError if missing."""
    return json.loads(_pack_path(pack_id).read_text(encoding="utf-8"))

def save_pack(pack: dict) -> None:
    """Persist a pack to disk. Caller is responsible for setting `id` + bumping
    `updated`. Invalidates the resolved cache."""
    pid = pack.get("id")
    if not pid or not str(pid).startswith("pack-"):
        raise ValueError(f"pack must have an id starting with 'pack-': {pid!r}")
    pack.setdefault("format_version", FORMAT_VERSION)
    pack["updated"] = ISO_NOW()
    _pack_path(pid).write_text(json.dumps(pack, indent=2, ensure_ascii=False), encoding="utf-8")
    invalidate_cache()

def create_pack(name: str, description: str = "") -> dict:
    """Mint a new empty pack and persist it. Returns the pack dict (with id)."""
    pid = _new_pack_id()
    now = ISO_NOW()
    pack = {
        "id":             pid,
        "name":           name or "Untitled Pack",
        "description":    description or "",
        "format_version": FORMAT_VERSION,
        "created":        now,
        "updated":        now,
        "_remove":        {"heroes": [], "items": [], "tags": []},
        "heroes":         {},
        "items":          {},
        "tags":           [],
    }
    save_pack(pack)
    # Newly created packs land in the inactive list — user opts in to activate.
    idx = load_index()
    if pid not in idx["active"] and pid not in idx["inactive"]:
        idx["inactive"].append(pid)
        save_index(idx)
    return pack

def soft_delete_pack(pack_id: str) -> None:
    """Move the pack file into `_trash/`. Removes from active + inactive in
    the index. Idempotent — calling on a missing pack is a no-op."""
    src = _pack_path(pack_id)
    if not src.exists():
        return
    shutil.move(str(src), str(_trash_path(pack_id)))
    idx = load_index()
    idx["active"]   = [p for p in idx["active"]   if p != pack_id]
    idx["inactive"] = [p for p in idx["inactive"] if p != pack_id]
    save_index(idx)

def restore_pack(pack_id: str) -> bool:
    """Move a pack out of trash back into the inactive list. Returns True
    on success, False if the trash file doesn't exist."""
    src = _trash_path(pack_id)
    if not src.exists():
        return False
    shutil.move(str(src), str(_pack_path(pack_id)))
    idx = load_index()
    if pack_id not in idx["active"] and pack_id not in idx["inactive"]:
        idx["inactive"].append(pack_id)
        save_index(idx)
    return True

def list_all_packs() -> list[dict]:
    """Returns metadata for every (non-trash) pack on disk, in stack order:
    active (priority order) → inactive. Each entry has the pack's full
    metadata MINUS the heavy heroes/items/tags maps (kept lean for the
    manager page)."""
    idx = load_index()
    seen: set[str] = set()
    out:  list[dict] = []
    def _meta(pid: str, state: str) -> dict | None:
        if not _pack_path(pid).exists():
            return None
        p = load_pack(pid)
        return {
            "id":             p.get("id", pid),
            "name":           p.get("name", "Untitled"),
            "description":    p.get("description", ""),
            "format_version": p.get("format_version", FORMAT_VERSION),
            "created":        p.get("created"),
            "updated":        p.get("updated"),
            "state":          state,
            "hero_count":     len(p.get("heroes", {}) or {}),
            "item_count":     len(p.get("items", {}) or {}),
            "tag_count":      len(p.get("tags", []) or []),
            "remove_counts":  {
                "heroes": len((p.get("_remove") or {}).get("heroes", [])),
                "items":  len((p.get("_remove") or {}).get("items", [])),
                "tags":   len((p.get("_remove") or {}).get("tags", [])),
            },
        }
    for pid in idx.get("active", []):
        if pid in seen: continue
        seen.add(pid)
        m = _meta(pid, "active")
        if m: out.append(m)
    for pid in idx.get("inactive", []):
        if pid in seen: continue
        seen.add(pid)
        m = _meta(pid, "inactive")
        if m: out.append(m)
    # Catch any pack files on disk that aren't in the index (e.g. dropped in
    # by hand) — surface them as inactive so the user can decide.
    for f in sorted(Paths.packs_dir.glob("pack-*.json")):
        pid = f.stem
        if pid in seen: continue
        seen.add(pid)
        m = _meta(pid, "inactive")
        if m: out.append(m)
    return out


# ── Slice access (what an editor reads/writes per pack) ───────────────────
def get_slice_hero(pack_id: str, hero_key: str) -> dict | None:
    pack = load_pack(pack_id)
    return (pack.get("heroes") or {}).get(hero_key)

def put_slice_hero(pack_id: str, hero_key: str, slice_obj: dict) -> None:
    pack = load_pack(pack_id)
    pack.setdefault("heroes", {})
    pack["heroes"][hero_key] = slice_obj
    save_pack(pack)

def delete_slice_hero(pack_id: str, hero_key: str) -> None:
    pack = load_pack(pack_id)
    if "heroes" in pack and hero_key in pack["heroes"]:
        del pack["heroes"][hero_key]
        save_pack(pack)

def get_slice_item(pack_id: str, item_key: str) -> dict | None:
    pack = load_pack(pack_id)
    return (pack.get("items") or {}).get(item_key)

def put_slice_item(pack_id: str, item_key: str, slice_obj: dict) -> None:
    pack = load_pack(pack_id)
    pack.setdefault("items", {})
    pack["items"][item_key] = slice_obj
    save_pack(pack)

def delete_slice_item(pack_id: str, item_key: str) -> None:
    pack = load_pack(pack_id)
    if "items" in pack and item_key in pack["items"]:
        del pack["items"][item_key]
        save_pack(pack)

def get_slice_tags(pack_id: str) -> list[dict]:
    return load_pack(pack_id).get("tags", []) or []

def put_slice_tags(pack_id: str, tags: list[dict]) -> None:
    pack = load_pack(pack_id)
    pack["tags"] = list(tags or [])
    save_pack(pack)


# ── Merge engine ──────────────────────────────────────────────────────────
_BUILD_LIST_KEYS = ("builds",)  # hero key whose list-of-dicts merges by `name`

def deep_merge_dict(base: Any, over: Any) -> Any:
    """Recursive merge: dicts merge key-by-key, dicts inside dicts recurse,
    scalars and lists *replace*. Returns a new value — does not mutate
    inputs. Used by every hero/item override path."""
    if isinstance(base, dict) and isinstance(over, dict):
        out = dict(base)
        for k, v in over.items():
            if k in out:
                out[k] = deep_merge_dict(out[k], v)
            else:
                out[k] = deepcopy(v)
        return out
    # Scalars + lists: override replaces. (lists-of-builds get special-cased
    # by `_merge_hero` below, not here, since this generic merger is also
    # used inside `values` dicts.)
    return deepcopy(over)


def _merge_builds(base_builds: list[dict], over_builds: list[dict]) -> list[dict]:
    """Merge two lists of build dicts by `name`. New names append; existing
    deep-merge over the base entry."""
    if not isinstance(base_builds, list): base_builds = []
    if not isinstance(over_builds, list): over_builds = []
    out: list[dict] = [deepcopy(b) for b in base_builds]
    index = {b.get("name"): i for i, b in enumerate(out) if isinstance(b, dict)}
    for ob in over_builds:
        if not isinstance(ob, dict):
            continue
        name = ob.get("name")
        if name in index:
            out[index[name]] = deep_merge_dict(out[index[name]], ob)
        else:
            out.append(deepcopy(ob))
            if name is not None:
                index[name] = len(out) - 1
    return out


def _merge_hero(base_hero: dict, over_hero: dict) -> dict:
    """Hero-aware merge — `builds` list merges by name, top-level fields
    deep-merge, `_remove` list at hero level drops builds by name."""
    base_hero = deepcopy(base_hero)
    if not isinstance(over_hero, dict):
        return base_hero
    # Pull `builds` out for special handling.
    over_no_builds = {k: v for k, v in over_hero.items() if k not in ("builds", "_remove")}
    base_no_builds = {k: v for k, v in base_hero.items() if k not in ("builds",)}
    merged: dict = deep_merge_dict(base_no_builds, over_no_builds)
    merged["builds"] = _merge_builds(base_hero.get("builds", []), over_hero.get("builds", []))
    # Per-hero build removals (from the over layer).
    rm_names: set[str] = set(over_hero.get("_remove") or [])
    if rm_names:
        merged["builds"] = [b for b in merged["builds"] if b.get("name") not in rm_names]
    return merged


# ── Cache ──────────────────────────────────────────────────────────────────
_resolved_cache: dict[tuple[str, ...], dict[str, Any]] = {}

def invalidate_cache() -> None:
    _resolved_cache.clear()

def _cache_get(active: Iterable[str]) -> dict[str, Any]:
    key = tuple(active)
    if key not in _resolved_cache:
        _resolved_cache[key] = {}
    return _resolved_cache[key]


# ── Default loaders ────────────────────────────────────────────────────────
def _load_default_heroes() -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not Paths.heroes_dir.exists():
        return out
    for f in sorted(Paths.heroes_dir.glob("*.json")):
        try:
            d = json.loads(f.read_bytes().decode("utf-8", errors="replace"))
            key = d.get("normalized_name") or f.stem
            out[key] = d
        except Exception:
            pass
    return out

def _load_default_items() -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not Paths.items_dir.exists():
        return out
    for f in sorted(Paths.items_dir.glob("*.json")):
        try:
            d = json.loads(f.read_bytes().decode("utf-8", errors="replace"))
            key = d.get("normalized_name") or f.stem
            out[key] = d
        except Exception:
            pass
    return out

def _load_default_tags() -> list[dict]:
    if not Paths.tags_file.exists():
        return []
    try:
        return json.loads(Paths.tags_file.read_text(encoding="utf-8"))
    except Exception:
        return []


# ── Resolve (the layered read path) ────────────────────────────────────────
def resolve_heroes(active_packs: list[str] | None = None) -> dict[str, dict]:
    """Returns { hero_key: merged_hero } across default + packs in priority
    order. Caches per-active-tuple."""
    active = list(active_packs) if active_packs is not None else get_active_packs()
    bucket = _cache_get(active)
    if "heroes" in bucket:
        return bucket["heroes"]
    merged = _load_default_heroes()
    # Build a per-layer view so removals stack correctly.
    for pid in active:
        if not _pack_path(pid).exists():
            continue
        pack = load_pack(pid)
        pack_heroes = pack.get("heroes") or {}
        for key, over in pack_heroes.items():
            merged[key] = _merge_hero(merged.get(key, {}), over)
        # Hero-level removals (from this pack's _remove.heroes).
        for rm in (pack.get("_remove") or {}).get("heroes", []) or []:
            merged.pop(rm, None)
    bucket["heroes"] = merged
    return merged

def resolve_hero(hero_key: str, active_packs: list[str] | None = None) -> dict | None:
    return resolve_heroes(active_packs).get(hero_key)

def resolve_items(active_packs: list[str] | None = None) -> dict[str, dict]:
    active = list(active_packs) if active_packs is not None else get_active_packs()
    bucket = _cache_get(active)
    if "items" in bucket:
        return bucket["items"]
    merged = _load_default_items()
    for pid in active:
        if not _pack_path(pid).exists():
            continue
        pack = load_pack(pid)
        pack_items = pack.get("items") or {}
        for key, over in pack_items.items():
            merged[key] = deep_merge_dict(merged.get(key, {}), over)
        for rm in (pack.get("_remove") or {}).get("items", []) or []:
            merged.pop(rm, None)
    bucket["items"] = merged
    return merged

def resolve_item(item_key: str, active_packs: list[str] | None = None) -> dict | None:
    return resolve_items(active_packs).get(item_key)

def resolve_tags(active_packs: list[str] | None = None) -> list[dict]:
    """Tag list = default + each pack's `tags` (additions only, dedup by
    `code`), then filtered by `_remove.tags` from each pack in priority
    order so a later pack can hide a tag added by an earlier one."""
    active = list(active_packs) if active_packs is not None else get_active_packs()
    bucket = _cache_get(active)
    if "tags" in bucket:
        return bucket["tags"]
    merged_by_code: dict[str, dict] = {t["code"]: deepcopy(t) for t in _load_default_tags() if "code" in t}
    order: list[str] = list(merged_by_code.keys())
    for pid in active:
        if not _pack_path(pid).exists():
            continue
        pack = load_pack(pid)
        for t in (pack.get("tags") or []):
            code = t.get("code")
            if not code:
                continue
            if code in merged_by_code:
                merged_by_code[code] = deep_merge_dict(merged_by_code[code], t)
            else:
                merged_by_code[code] = deepcopy(t)
                order.append(code)
        for rm in (pack.get("_remove") or {}).get("tags", []) or []:
            if rm in merged_by_code:
                del merged_by_code[rm]
                order = [c for c in order if c != rm]
    out = [merged_by_code[c] for c in order if c in merged_by_code]
    bucket["tags"] = out
    return out


# ── Import validation ─────────────────────────────────────────────────────
def collect_tag_references(pack: dict) -> set[str]:
    """Every tag code mentioned by the pack's hero/item vectors. Used during
    import to warn the user about tags they don't have locally."""
    seen: set[str] = set()
    def _scan_values(values: dict) -> None:
        if not isinstance(values, dict): return
        for vec_name in ("ally_weight", "enemy_weight", "item_affinity", "playstyle_score"):
            vec = values.get(vec_name)
            if isinstance(vec, dict):
                seen.update(vec.keys())
    for hero in (pack.get("heroes") or {}).values():
        for build in (hero.get("builds") or []):
            _scan_values(build.get("values") or {})
    for item in (pack.get("items") or {}).values():
        _scan_values(item.get("values") or {})
        # Items also have a flat playstyle_score under values usually.
        ps = (item.get("values") or {}).get("playstyle_score")
        if isinstance(ps, dict):
            seen.update(ps.keys())
    return seen

def validate_pack_against_tags(pack: dict, known_tag_codes: Iterable[str]) -> list[str]:
    """Return the sorted list of tag codes the pack references that aren't
    in the local known set. Empty list = clean import."""
    refs = collect_tag_references(pack)
    known = set(known_tag_codes)
    missing = sorted(refs - known)
    return missing


# ── Import (validate + persist) ───────────────────────────────────────────
def import_pack(blob: dict, *, known_tag_codes: Iterable[str] | None = None) -> dict:
    """Validate a pack blob and write it to disk as a new pack. The
    pack's incoming `id` is REPLACED with a freshly minted one to avoid
    collisions. Returns `{ pack_id, warnings }` — warnings is the list of
    tag codes the importing instance is missing.

    Raises ValueError on schema problems."""
    if not isinstance(blob, dict):
        raise ValueError("pack must be a JSON object")
    if blob.get("format_version", FORMAT_VERSION) > FORMAT_VERSION:
        raise ValueError(
            f"pack format_version={blob['format_version']} is newer than this "
            f"app supports (={FORMAT_VERSION}); please update the app first.")
    warnings: list[str] = []
    if known_tag_codes is not None:
        warnings = validate_pack_against_tags(blob, known_tag_codes)
    new_id = _new_pack_id()
    now = ISO_NOW()
    pack = {
        "id":             new_id,
        "name":           blob.get("name") or "Imported Pack",
        "description":    blob.get("description") or "",
        "format_version": FORMAT_VERSION,
        "created":        now,
        "updated":        now,
        "_remove":        blob.get("_remove") or {"heroes": [], "items": [], "tags": []},
        "heroes":         blob.get("heroes") or {},
        "items":          blob.get("items") or {},
        "tags":           blob.get("tags") or [],
    }
    save_pack(pack)
    # Newly imported packs land in inactive so the user opts in.
    idx = load_index()
    if new_id not in idx["active"] and new_id not in idx["inactive"]:
        idx["inactive"].append(new_id)
        save_index(idx)
    return {"pack_id": new_id, "warnings": warnings}


# ── Default-pack metadata (for the manager UI) ─────────────────────────────
def default_pack_meta() -> dict:
    """Returns a synthetic 'pack metadata' entry for the default layer so the
    Pack Manager page can show it pinned at the bottom of the active stack."""
    return {
        "id":             "default",
        "name":           "Default",
        "description":    "Shipped data — read-only outside Dev mode.",
        "format_version": FORMAT_VERSION,
        "created":        None,
        "updated":        None,
        "state":          "default",
        "hero_count":     len(_load_default_heroes()),
        "item_count":     len(_load_default_items()),
        "tag_count":      len(_load_default_tags()),
        "remove_counts":  {"heroes": 0, "items": 0, "tags": 0},
    }
