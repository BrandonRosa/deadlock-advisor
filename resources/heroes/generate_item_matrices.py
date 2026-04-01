import csv
import json
from pathlib import Path

HEROES_DIR = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public\resources\heroes")
ITEMS_INDEX = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public\resources\items\index.json")

HEROES = [
    "Abrams", "Apollo", "Bebop", "Billy", "Calico", "Celeste",
    "The Doorman", "Drifter", "Dynamo", "Graves", "Grey Talon",
    "Haze", "Holliday", "Infernus", "Ivy", "Kelvin", "Lady Geist",
    "Lash", "McGinnis", "Mina", "Mirage", "Mo & Krill", "Paige",
    "Paradox", "Pocket", "Rem", "Seven", "Shiv", "Silver",
    "Sinclair", "Venator", "Victor", "Vindicta", "Viscous", "Vyper",
    "Warden", "Wraith", "Yamato",
]

def norm(name):
    """Match the hero folder naming: lowercase, spaces → underscores, keep & and -"""
    return name.lower().replace(" ", "_")

def main():
    items = json.loads(ITEMS_INDEX.read_text())
    item_names = [item["normalized_name"] for item in items]

    for hero_name in HEROES:
        n = norm(hero_name)
        hero_dir = HEROES_DIR / n
        csv_path = hero_dir / f"item_matrix_{n}.csv"
        manifest_path = hero_dir / f"manifest_{n}.json"

        # Build CSV
        rows = [["", f"self_{n}", f"ally_{n}", f"enemy_{n}"]]
        for item_n in item_names:
            rows.append([item_n, "", "", ""])

        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerows(rows)

        # Update manifest
        manifest = json.loads(manifest_path.read_text())
        manifest["item_matrix"] = f"/resources/heroes/{n}/item_matrix_{n}.csv"
        manifest_path.write_text(json.dumps(manifest, indent=2))

        print(f"[{hero_name}] item_matrix_{n}.csv + manifest updated")

    print(f"\nDone. {len(HEROES)} heroes updated.")

if __name__ == "__main__":
    main()
