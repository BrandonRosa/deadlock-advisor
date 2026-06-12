"""
Phase 1 unit tests for the Weight Pack merge engine.

Run from the `public/tag_generator/` directory:

    python -m unittest tests/test_packs.py -v

These tests are intentionally hermetic — they spin up a temp directory,
point `packs.Paths` at it, and never touch the real data dir.
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

# Make the parent dir importable so `import packs` resolves when the test
# runner is launched from the project root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import packs  # noqa: E402


def _write(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


class _PacksTestBase(unittest.TestCase):
    """Sets up a fresh temp data dir with `heroes/`, `items/`, `tags.json`
    and an empty `packs/` for every test. Tears it down afterwards."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.data = Path(self._tmp.name)
        (self.data / "heroes").mkdir()
        (self.data / "items").mkdir()
        _write(self.data / "tags.json", [
            {"code": "stun",  "name": "Stun"},
            {"code": "burst", "name": "Burst Damage"},
        ])
        packs.Paths.configure(self.data)
        packs.bootstrap_packs()
        packs.invalidate_cache()

    def tearDown(self):
        packs.invalidate_cache()
        self._tmp.cleanup()

    # ── helpers ─────────────────────────────────────────────────────────
    def _seed_hero(self, key, builds=None):
        _write(self.data / "heroes" / f"{key}.json", {
            "normalized_name": key,
            "eng_name":        key.capitalize(),
            "builds":          builds or [{
                "name": "General",
                "values": {"ally_weight": {"stun": 0.5, "burst": 0.2}},
            }],
        })

    def _seed_item(self, key, ps=None):
        _write(self.data / "items" / f"{key}.json", {
            "normalized_name": key,
            "name":            key,
            "tier":            1250,
            "values":          {"playstyle_score": ps or {"stun": 0.4}},
        })


class TestDeepMerge(unittest.TestCase):
    def test_dict_merge(self):
        out = packs.deep_merge_dict({"a": 1, "b": 2}, {"b": 3, "c": 4})
        self.assertEqual(out, {"a": 1, "b": 3, "c": 4})

    def test_nested_dict_merge(self):
        out = packs.deep_merge_dict(
            {"v": {"stun": 0.5, "burst": 0.2}, "k": 1},
            {"v": {"burst": 0.9}})
        self.assertEqual(out, {"v": {"stun": 0.5, "burst": 0.9}, "k": 1})

    def test_scalar_replaces(self):
        self.assertEqual(packs.deep_merge_dict(5, 7), 7)
        self.assertEqual(packs.deep_merge_dict("a", "b"), "b")

    def test_list_replaces_not_concatenates(self):
        out = packs.deep_merge_dict({"l": [1, 2, 3]}, {"l": [9]})
        self.assertEqual(out, {"l": [9]})

    def test_does_not_mutate_inputs(self):
        base = {"v": {"a": 1}}
        over = {"v": {"b": 2}}
        out  = packs.deep_merge_dict(base, over)
        out["v"]["c"] = 3
        self.assertNotIn("c", base["v"])
        self.assertNotIn("c", over["v"])


class TestResolverWithoutPacks(_PacksTestBase):
    """With zero active packs, the resolver must return the defaults
    untouched. This is the backwards-compat contract."""

    def test_resolve_heroes_empty(self):
        self.assertEqual(packs.resolve_heroes(), {})

    def test_resolve_heroes_returns_defaults(self):
        self._seed_hero("seven")
        self.assertEqual(set(packs.resolve_heroes()), {"seven"})
        self.assertEqual(
            packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"],
            0.5,
        )

    def test_resolve_tags_returns_defaults(self):
        tags = packs.resolve_tags()
        self.assertEqual([t["code"] for t in tags], ["stun", "burst"])


class TestPackCRUD(_PacksTestBase):
    def test_create_pack_lands_in_inactive(self):
        p = packs.create_pack("My Tweaks", "desc")
        self.assertTrue(p["id"].startswith("pack-"))
        idx = packs.load_index()
        self.assertIn(p["id"], idx["inactive"])
        self.assertNotIn(p["id"], idx["active"])

    def test_load_pack_roundtrip(self):
        p = packs.create_pack("X")
        loaded = packs.load_pack(p["id"])
        self.assertEqual(loaded["name"], "X")
        self.assertEqual(loaded["id"], p["id"])

    def test_soft_delete_moves_to_trash(self):
        p = packs.create_pack("Y")
        packs.soft_delete_pack(p["id"])
        self.assertFalse(packs.pack_exists(p["id"]))
        # ...but it's still in trash, and not in the index.
        idx = packs.load_index()
        self.assertNotIn(p["id"], idx["active"])
        self.assertNotIn(p["id"], idx["inactive"])

    def test_restore_pack(self):
        p = packs.create_pack("Z")
        packs.soft_delete_pack(p["id"])
        self.assertTrue(packs.restore_pack(p["id"]))
        self.assertTrue(packs.pack_exists(p["id"]))
        self.assertIn(p["id"], packs.load_index()["inactive"])

    def test_restore_missing_pack_returns_false(self):
        self.assertFalse(packs.restore_pack("pack-nonexistent"))


class TestSingleHeroOverride(_PacksTestBase):
    def test_single_value_override(self):
        self._seed_hero("seven")
        p = packs.create_pack("Sharper Seven")
        # Promote to active.
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_hero(p["id"], "seven", {
            "builds": [{
                "name":   "General",
                "values": {"ally_weight": {"stun": 0.95}},
            }],
        })
        # The overridden cell changed; the other cell still comes from default.
        merged = packs.resolve_hero("seven")
        weights = merged["builds"][0]["values"]["ally_weight"]
        self.assertAlmostEqual(weights["stun"],  0.95)
        self.assertAlmostEqual(weights["burst"], 0.2)

    def test_new_build_appended(self):
        self._seed_hero("seven")
        p = packs.create_pack("New build")
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_hero(p["id"], "seven", {
            "builds": [{
                "name":   "Ult Carry",
                "values": {"ally_weight": {"burst": 0.9}},
            }],
        })
        merged = packs.resolve_hero("seven")
        names = [b["name"] for b in merged["builds"]]
        self.assertEqual(names, ["General", "Ult Carry"])

    def test_per_hero_build_remove(self):
        self._seed_hero("seven", builds=[
            {"name": "General", "values": {"ally_weight": {"stun": 0.5}}},
            {"name": "Ult",     "values": {"ally_weight": {"stun": 0.9}}},
        ])
        p = packs.create_pack("No Ult")
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_hero(p["id"], "seven", {"_remove": ["Ult"]})
        merged = packs.resolve_hero("seven")
        self.assertEqual([b["name"] for b in merged["builds"]], ["General"])

    def test_omitted_cells_pass_through(self):
        self._seed_hero("seven")
        p = packs.create_pack("Empty override")
        packs.save_index({"active": [p["id"]], "inactive": []})
        # Pack mentions seven but only renames the hero — the values vector
        # must keep the default cell content intact.
        packs.put_slice_hero(p["id"], "seven", {"eng_name": "SEVEN!!!"})
        merged = packs.resolve_hero("seven")
        self.assertEqual(merged["eng_name"], "SEVEN!!!")
        self.assertEqual(merged["builds"][0]["values"]["ally_weight"]["stun"], 0.5)


class TestStackOrderPriority(_PacksTestBase):
    def test_later_pack_wins(self):
        self._seed_hero("seven")
        a = packs.create_pack("a")
        b = packs.create_pack("b")
        packs.save_index({"active": [a["id"], b["id"]], "inactive": []})
        packs.put_slice_hero(a["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.3}}}]})
        packs.put_slice_hero(b["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.7}}}]})
        merged = packs.resolve_hero("seven")
        self.assertAlmostEqual(merged["builds"][0]["values"]["ally_weight"]["stun"], 0.7)

    def test_reordering_swaps_winner(self):
        self._seed_hero("seven")
        a = packs.create_pack("a")
        b = packs.create_pack("b")
        packs.put_slice_hero(a["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.3}}}]})
        packs.put_slice_hero(b["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.7}}}]})
        # b on top first → 0.7 wins.
        packs.save_index({"active": [a["id"], b["id"]], "inactive": []})
        self.assertAlmostEqual(packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"], 0.7)
        # Swap → a is now top, 0.3 wins.
        packs.save_index({"active": [b["id"], a["id"]], "inactive": []})
        self.assertAlmostEqual(packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"], 0.3)


class TestHeroLevelRemove(_PacksTestBase):
    def test_remove_heroes_drops_from_resolve(self):
        self._seed_hero("seven")
        self._seed_hero("bebop")
        p = packs.create_pack("dropbebop")
        packs.save_index({"active": [p["id"]], "inactive": []})
        pack = packs.load_pack(p["id"])
        pack["_remove"]["heroes"] = ["bebop"]
        packs.save_pack(pack)
        merged = packs.resolve_heroes()
        self.assertIn("seven", merged)
        self.assertNotIn("bebop", merged)


class TestItemMerge(_PacksTestBase):
    def test_item_override(self):
        self._seed_item("close_quarters")
        p = packs.create_pack("buff")
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_item(p["id"], "close_quarters", {
            "values": {"playstyle_score": {"stun": 0.9}}})
        merged = packs.resolve_item("close_quarters")
        self.assertAlmostEqual(merged["values"]["playstyle_score"]["stun"], 0.9)
        # Other fields preserved.
        self.assertEqual(merged["tier"], 1250)

    def test_item_remove(self):
        self._seed_item("close_quarters")
        self._seed_item("rebuttal")
        p = packs.create_pack("removeit")
        packs.save_index({"active": [p["id"]], "inactive": []})
        pack = packs.load_pack(p["id"])
        pack["_remove"]["items"] = ["rebuttal"]
        packs.save_pack(pack)
        merged = packs.resolve_items()
        self.assertIn("close_quarters", merged)
        self.assertNotIn("rebuttal", merged)


class TestTagMerge(_PacksTestBase):
    def test_tag_addition(self):
        p = packs.create_pack("add tag")
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_tags(p["id"], [{"code": "new_thing", "name": "New Thing"}])
        codes = [t["code"] for t in packs.resolve_tags()]
        self.assertEqual(codes, ["stun", "burst", "new_thing"])

    def test_tag_remove(self):
        p = packs.create_pack("rm tag")
        packs.save_index({"active": [p["id"]], "inactive": []})
        pack = packs.load_pack(p["id"])
        pack["_remove"]["tags"] = ["burst"]
        packs.save_pack(pack)
        codes = [t["code"] for t in packs.resolve_tags()]
        self.assertEqual(codes, ["stun"])

    def test_tag_field_override(self):
        p = packs.create_pack("rename")
        packs.save_index({"active": [p["id"]], "inactive": []})
        packs.put_slice_tags(p["id"], [{"code": "stun", "name": "Crowd Control"}])
        out = packs.resolve_tags()
        stun = next(t for t in out if t["code"] == "stun")
        self.assertEqual(stun["name"], "Crowd Control")


class TestValidation(_PacksTestBase):
    def test_validate_pack_against_tags_finds_missing(self):
        # Pack references "unknown_tag" but local tags.json only has stun + burst.
        blob = {
            "name": "External pack",
            "heroes": {"foo": {"builds": [{
                "name": "X",
                "values": {"ally_weight": {"stun": 0.5, "unknown_tag": 0.3}},
            }]}},
        }
        missing = packs.validate_pack_against_tags(blob, ["stun", "burst"])
        self.assertEqual(missing, ["unknown_tag"])

    def test_validate_pack_against_tags_clean(self):
        blob = {
            "heroes": {"foo": {"builds": [{
                "values": {"ally_weight": {"stun": 0.5}},
            }]}},
        }
        self.assertEqual(packs.validate_pack_against_tags(blob, ["stun", "burst"]), [])


class TestImport(_PacksTestBase):
    def test_import_pack_creates_new_id(self):
        blob = {
            "id":   "pack-fromsomeone-else",
            "name": "Theirs",
            "heroes": {},
            "items":  {},
            "tags":   [],
        }
        result = packs.import_pack(blob, known_tag_codes=["stun", "burst"])
        self.assertNotEqual(result["pack_id"], blob["id"])
        self.assertTrue(packs.pack_exists(result["pack_id"]))
        self.assertEqual(result["warnings"], [])
        # Newly imported lands in inactive.
        idx = packs.load_index()
        self.assertIn(result["pack_id"], idx["inactive"])

    def test_import_pack_rejects_newer_format_version(self):
        with self.assertRaises(ValueError):
            packs.import_pack({"format_version": packs.FORMAT_VERSION + 1})

    def test_import_returns_warnings(self):
        blob = {
            "name": "Has unknown tag",
            "heroes": {"x": {"builds": [{
                "values": {"ally_weight": {"new_metric": 0.3}},
            }]}},
        }
        result = packs.import_pack(blob, known_tag_codes=["stun", "burst"])
        self.assertEqual(result["warnings"], ["new_metric"])


class TestCacheInvalidation(_PacksTestBase):
    def test_cache_invalidated_on_save_pack(self):
        self._seed_hero("seven")
        p = packs.create_pack("c")
        packs.save_index({"active": [p["id"]], "inactive": []})
        # Read once — warm the cache with no override.
        first = packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"]
        self.assertAlmostEqual(first, 0.5)
        # Mutate the pack — cache should clear.
        packs.put_slice_hero(p["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.99}}}]})
        second = packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"]
        self.assertAlmostEqual(second, 0.99)

    def test_cache_invalidated_on_index_change(self):
        self._seed_hero("seven")
        p = packs.create_pack("c")
        packs.put_slice_hero(p["id"], "seven", {
            "builds": [{"name": "General", "values": {"ally_weight": {"stun": 0.99}}}]})
        # Pack is inactive — resolver returns the default value.
        self.assertAlmostEqual(packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"], 0.5)
        # Activate it — resolver must re-evaluate.
        packs.save_index({"active": [p["id"]], "inactive": []})
        self.assertAlmostEqual(packs.resolve_hero("seven")["builds"][0]["values"]["ally_weight"]["stun"], 0.99)


class TestIndexRoundTrip(_PacksTestBase):
    def test_save_strips_dupes(self):
        # Same id in both active and inactive — active should win, inactive
        # gets stripped, no duplicates after save.
        a = packs.create_pack("a")
        packs.save_index({"active": [a["id"]], "inactive": [a["id"]]})
        idx = packs.load_index()
        self.assertEqual(idx["active"], [a["id"]])
        self.assertEqual(idx["inactive"], [])


if __name__ == "__main__":
    unittest.main()
