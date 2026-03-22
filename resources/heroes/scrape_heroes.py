import requests
import json
import os
import re
import csv
import time
from bs4 import BeautifulSoup
from pathlib import Path

BASE_URL = "https://deadlock.wiki"
HEROES_DIR = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public\resources\heroes")

# Known portrait card URLs (full-size, not thumbnail)
PORTRAIT_CARDS = {
    "Abrams":      "/images/6/6d/Abrams_card.png",
    "Apollo":      "/images/0/0f/Apollo_card.png",
    "Bebop":       "/images/4/49/Bebop_card.png",
    "Billy":       "/images/e/e5/Billy_card.png",
    "Calico":      "/images/e/e4/Calico_card.png",
    "Celeste":     "/images/9/90/Celeste_card.png",
    "The Doorman": "/images/6/6f/The_Doorman_card.png",
    "Drifter":     "/images/4/4d/Drifter_card.png",
    "Dynamo":      "/images/7/70/Dynamo_card.png",
    "Graves":      "/images/3/35/Graves_card.png",
    "Grey Talon":  "/images/5/5a/Grey_Talon_card.png",
    "Haze":        "/images/1/1b/Haze_card.png",
    "Holliday":    "/images/1/10/Holliday_card.png",
    "Infernus":    "/images/6/6b/Infernus_card.png",
    "Ivy":         "/images/2/2c/Ivy_card.png",
    "Kelvin":      "/images/7/76/Kelvin_card.png",
    "Lady Geist":  "/images/e/e8/Lady_Geist_card.png",
    "Lash":        "/images/5/5a/Lash_card.png",
    "McGinnis":    "/images/5/55/McGinnis_card.png",
    "Mina":        "/images/a/a5/Mina_card.png",
    "Mirage":      "/images/7/77/Mirage_card.png",
    "Mo & Krill":  "/images/a/a1/Mo_%26_Krill_card.png",
    "Paige":       "/images/b/b0/Paige_card.png",
    "Paradox":     "/images/0/08/Paradox_card.png",
    "Pocket":      "/images/0/06/Pocket_card.png",
    "Rem":         "/images/2/2a/Rem_card.png",
    "Seven":       "/images/c/cf/Seven_card.png",
    "Shiv":        "/images/b/b8/Shiv_card.png",
    "Silver":      "/images/1/1e/Silver_card.png",
    "Sinclair":    "/images/4/41/Sinclair_card.png",
    "Venator":     "/images/6/6e/Venator_card.png",
    "Victor":      "/images/3/3d/Victor_card.png",
    "Vindicta":    "/images/6/69/Vindicta_card.png",
    "Viscous":     "/images/5/53/Viscous_card.png",
    "Vyper":       "/images/b/bd/Vyper_card.png",
    "Warden":      "/images/1/10/Warden_card.png",
    "Wraith":      "/images/8/85/Wraith_card.png",
    "Yamato":      "/images/2/2b/Yamato_card.png",
}


def normalize(name):
    """Lowercase, replace spaces with underscores."""
    return name.lower().replace(" ", "_")


def get_wiki_slug(name):
    """Convert hero name to wiki URL slug."""
    return name.replace(" ", "_")


def get_mini_icon_url(hero_name, soup):
    """
    Find the mini head icon from the hero's page.
    Looks for [HeroName].png (direct image, not _card) pattern.
    """
    wiki_name = get_wiki_slug(hero_name)
    # Try exact filename match first: HeroName.png (not _card, not _Render, etc.)
    for img in soup.find_all("img"):
        src = img.get("src", "")
        # Match /images/X/XX/HeroName.png (direct path, not thumb)
        if re.search(rf'/images/[a-f0-9]/[a-f0-9]{{2}}/{re.escape(wiki_name)}\.png$', src, re.IGNORECASE):
            return src
    # Try thumb version as fallback
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if re.search(rf'/{re.escape(wiki_name)}\.png', src, re.IGNORECASE):
            # Convert thumb URL to direct URL if needed
            # e.g., /images/thumb/e/e0/Abrams.png/20px-Abrams.png -> /images/e/e0/Abrams.png
            thumb_match = re.match(r'/images/thumb/([a-f0-9]/[a-f0-9]{2})/(.+\.png)/\d+px-.+\.png', src)
            if thumb_match:
                return f"/images/{thumb_match.group(1)}/{thumb_match.group(2)}"
            return src
    return None


def download_image(url, dest_path):
    """Download image from URL to dest_path."""
    full_url = BASE_URL + url if url.startswith("/") else url
    headers = {"User-Agent": "Mozilla/5.0 (compatible; DeadlockAdvisor/1.0)"}
    r = requests.get(full_url, headers=headers, timeout=30)
    r.raise_for_status()
    with open(dest_path, "wb") as f:
        f.write(r.content)
    print(f"  Downloaded: {dest_path.name}")


def main():
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (compatible; DeadlockAdvisor/1.0)"})

    heroes = list(PORTRAIT_CARDS.keys())
    results = []

    for hero_name in heroes:
        norm = normalize(hero_name)
        wiki_slug = get_wiki_slug(hero_name)
        hero_dir = HEROES_DIR / norm
        hero_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n[{hero_name}] -> folder: {norm}")

        # Fetch hero's individual wiki page
        wiki_url = f"{BASE_URL}/{wiki_slug}"
        try:
            resp = session.get(wiki_url, timeout=30)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, "html.parser")
        except Exception as e:
            print(f"  ERROR fetching page: {e}")
            soup = None

        # --- Portrait card ---
        portrait_rel = PORTRAIT_CARDS[hero_name]
        portrait_filename = f"portrait_{norm}.png"
        portrait_path = hero_dir / portrait_filename
        try:
            download_image(portrait_rel, portrait_path)
        except Exception as e:
            print(f"  ERROR downloading portrait: {e}")
            portrait_path = None

        # --- Mini icon ---
        mini_icon_rel = None
        mini_icon_filename = f"mini_icon_{norm}.png"
        mini_icon_path = hero_dir / mini_icon_filename

        if soup:
            mini_icon_rel = get_mini_icon_url(hero_name, soup)

        if mini_icon_rel:
            try:
                download_image(mini_icon_rel, mini_icon_path)
            except Exception as e:
                print(f"  ERROR downloading mini icon: {e}")
                mini_icon_path = None
        else:
            print(f"  WARNING: mini icon not found for {hero_name}")
            mini_icon_path = None

        results.append({
            "name": hero_name,
            "norm": norm,
            "wiki_url": wiki_url,
            "portrait_path": f"/resources/heroes/{norm}/{portrait_filename}" if portrait_path else None,
            "mini_icon_path": f"/resources/heroes/{norm}/{mini_icon_filename}" if mini_icon_path else None,
            "portrait_wiki_url": BASE_URL + portrait_rel,
            "mini_icon_wiki_url": (BASE_URL + mini_icon_rel) if mini_icon_rel else None,
        })

        # Write manifest for this hero
        manifest = {
            "name": hero_name,
            "normalized_name": norm,
            "wiki_url": wiki_url,
            "portrait": f"/resources/heroes/{norm}/{portrait_filename}",
            "mini_icon": f"/resources/heroes/{norm}/{mini_icon_filename}",
        }
        manifest_path = hero_dir / f"manifest_{norm}.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"  Wrote manifest: {manifest_path.name}")

        time.sleep(0.3)  # Be polite to the server

    # --- Write CSV ---
    csv_path = HEROES_DIR / "heroes.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([""])  # A1 blank
        for hero in results:
            writer.writerow([f"ally_{hero['norm']}"])
        for hero in results:
            writer.writerow([f"enemy_{hero['norm']}"])
    print(f"\nWrote CSV: {csv_path}")

    # Summary
    print(f"\n=== DONE ===")
    print(f"Processed {len(results)} heroes")
    missing_icons = [r["name"] for r in results if not r["mini_icon_path"]]
    if missing_icons:
        print(f"Missing mini icons: {missing_icons}")
    else:
        print("All mini icons downloaded successfully!")


if __name__ == "__main__":
    main()
