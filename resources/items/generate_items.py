import requests
import json
import csv
import time
from pathlib import Path

BASE_URL = "https://deadlock.wiki"
ITEMS_DIR = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public\resources\items")

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
    return (name.lower()
                .replace(" ", "_")
                .replace("'", "")
                .replace("-", "_")
                .replace("&", "and")
                .replace("(", "")
                .replace(")", ""))

def hn(name):
    """Hero norm — same as norm but heroes already stored normalized."""
    return norm(name)

# ─── ITEMS DATA ──────────────────────────────────────────────────────────────
# (name, category, tier, thumb_path)
ITEMS = [
    # WEAPON 800
    ("Close Quarters",          "Weapon", 800,  "/images/thumb/4/43/Close_Quarters.png"),
    ("Extended Magazine",       "Weapon", 800,  "/images/thumb/8/8a/Extended_Magazine.png"),
    ("Headshot Booster",        "Weapon", 800,  "/images/thumb/a/ac/Headshot_Booster.png"),
    ("High-Velocity Rounds",    "Weapon", 800,  "/images/thumb/0/0e/High-Velocity_Rounds.png"),
    ("Monster Rounds",          "Weapon", 800,  "/images/thumb/f/f8/Monster_Rounds.png"),
    ("Rapid Rounds",            "Weapon", 800,  "/images/thumb/6/6e/Rapid_Rounds.png"),
    ("Restorative Shot",        "Weapon", 800,  "/images/thumb/4/4c/Restorative_Shot.png"),
    # WEAPON 1600
    ("Active Reload",           "Weapon", 1600, "/images/thumb/b/b4/Active_Reload.png"),
    ("Fleetfoot",               "Weapon", 1600, "/images/thumb/c/cf/Fleetfoot.png"),
    ("Intensifying Magazine",   "Weapon", 1600, "/images/thumb/6/65/Intensifying_Magazine.png"),
    ("Kinetic Dash",            "Weapon", 1600, "/images/thumb/3/3e/Kinetic_Dash.png"),
    ("Long Range",              "Weapon", 1600, "/images/thumb/0/0a/Long_Range.png"),
    ("Melee Charge",            "Weapon", 1600, "/images/thumb/e/ea/Melee_Charge.png"),
    ("Mystic Shot",             "Weapon", 1600, "/images/thumb/5/5a/Mystic_Shot.png"),
    ("Opening Rounds",          "Weapon", 1600, "/images/thumb/8/8d/Opening_Rounds.png"),
    ("Recharging Rush",         "Weapon", 1600, "/images/thumb/1/17/Recharging_Rush.png"),
    ("Slowing Bullets",         "Weapon", 1600, "/images/thumb/d/db/Slowing_Bullets.png"),
    ("Spirit Shredder Bullets", "Weapon", 1600, "/images/thumb/9/96/Spirit_Shredder_Bullets.png"),
    ("Split Shot",              "Weapon", 1600, "/images/thumb/0/04/Split_Shot.png"),
    ("Stalker",                 "Weapon", 1600, "/images/thumb/4/4b/Stalker.png"),
    ("Swift Striker",           "Weapon", 1600, "/images/thumb/e/e4/Swift_Striker.png"),
    ("Titanic Magazine",        "Weapon", 1600, "/images/thumb/d/d8/Titanic_Magazine.png"),
    ("Weakening Headshot",      "Weapon", 1600, "/images/thumb/a/ad/Weakening_Headshot.png"),
    # WEAPON 3200
    ("Alchemical Fire",         "Weapon", 3200, "/images/thumb/f/fc/Alchemical_Fire.png"),
    ("Ballistic Enchantment",   "Weapon", 3200, "/images/thumb/d/d4/Ballistic_Enchantment.png"),
    ("Berserker",               "Weapon", 3200, "/images/thumb/a/a8/Berserker.png"),
    ("Blood Tribute",           "Weapon", 3200, "/images/thumb/a/af/Blood_Tribute.png"),
    ("Burst Fire",              "Weapon", 3200, "/images/thumb/b/b0/Burst_Fire.png"),
    ("Cultist Sacrifice",       "Weapon", 3200, "/images/thumb/e/eb/Cultist_Sacrifice.png"),
    ("Escalating Resilience",   "Weapon", 3200, "/images/thumb/5/57/Escalating_Resilience.png"),
    ("Express Shot",            "Weapon", 3200, "/images/thumb/e/e6/Express_Shot.png"),
    ("Headhunter",              "Weapon", 3200, "/images/thumb/0/06/Headhunter.png"),
    ("Heroic Aura",             "Weapon", 3200, "/images/thumb/6/60/Heroic_Aura.png"),
    ("Hollow Point",            "Weapon", 3200, "/images/thumb/3/30/Hollow_Point.png"),
    ("Hunters Aura",            "Weapon", 3200, "/images/thumb/0/08/Hunter%27s_Aura.png"),
    ("Point Blank",             "Weapon", 3200, "/images/thumb/7/79/Point_Blank.png"),
    ("Sharpshooter",            "Weapon", 3200, "/images/thumb/2/25/Sharpshooter.png"),
    ("Spirit Rend",             "Weapon", 3200, "/images/thumb/4/42/Spirit_Rend.png"),
    ("Tesla Bullets",           "Weapon", 3200, "/images/thumb/5/56/Tesla_Bullets.png"),
    ("Toxic Bullets",           "Weapon", 3200, "/images/thumb/f/f0/Toxic_Bullets.png"),
    ("Weighted Shots",          "Weapon", 3200, "/images/thumb/8/88/Weighted_Shots.png"),
    # WEAPON 6400
    ("Armor Piercing Rounds",   "Weapon", 6400, "/images/thumb/1/10/Armor_Piercing_Rounds.png"),
    ("Capacitor",               "Weapon", 6400, "/images/thumb/b/b5/Capacitor.png"),
    ("Crippling Headshot",      "Weapon", 6400, "/images/thumb/6/6c/Crippling_Headshot.png"),
    ("Crushing Fists",          "Weapon", 6400, "/images/thumb/c/ca/Crushing_Fists.png"),
    ("Frenzy",                  "Weapon", 6400, "/images/thumb/f/f1/Frenzy.png"),
    ("Glass Cannon",            "Weapon", 6400, "/images/thumb/6/6e/Glass_Cannon.png"),
    ("Lucky Shot",              "Weapon", 6400, "/images/thumb/0/06/Lucky_Shot.png"),
    ("Ricochet",                "Weapon", 6400, "/images/thumb/8/87/Ricochet.png"),
    ("Shadow Weave",            "Weapon", 6400, "/images/thumb/4/4e/Shadow_Weave.png"),
    ("Silencer",                "Weapon", 6400, "/images/thumb/4/43/Silencer.png"),
    ("Spellslinger",            "Weapon", 6400, "/images/thumb/a/a8/Spellslinger.png"),
    ("Spiritual Overflow",      "Weapon", 6400, "/images/thumb/4/46/Spiritual_Overflow.png"),
    # WEAPON 9999
    ("Haunting Shot",           "Weapon", 9999, "/images/thumb/0/01/Haunting_Shot.png"),
    ("Infinite Rounds",         "Weapon", 9999, "/images/thumb/1/1f/Infinite_Rounds.png"),
    ("Runed Gauntlets",         "Weapon", 9999, "/images/thumb/4/40/Runed_Gauntlets.png"),
    # VITALITY 800
    ("Extra Health",            "Vitality", 800,  "/images/thumb/6/69/Extra_Health.png"),
    ("Extra Regen",             "Vitality", 800,  "/images/thumb/6/60/Extra_Regen.png"),
    ("Extra Stamina",           "Vitality", 800,  "/images/thumb/2/28/Extra_Stamina.png"),
    ("Healing Rite",            "Vitality", 800,  "/images/thumb/7/72/Healing_Rite.png"),
    ("Melee Lifesteal",         "Vitality", 800,  "/images/thumb/2/24/Melee_Lifesteal.png"),
    ("Rebuttal",                "Vitality", 800,  "/images/thumb/4/4c/Rebuttal.png"),
    ("Sprint Boots",            "Vitality", 800,  "/images/thumb/d/da/Sprint_Boots.png"),
    # VITALITY 1600
    ("Battle Vest",             "Vitality", 1600, "/images/thumb/7/7d/Battle_Vest.png"),
    ("Bullet Lifesteal",        "Vitality", 1600, "/images/thumb/5/57/Bullet_Lifesteal_%28item%29.png"),
    ("Debuff Reducer",          "Vitality", 1600, "/images/thumb/c/c3/Debuff_Reducer.png"),
    ("Enchanters Emblem",       "Vitality", 1600, "/images/thumb/0/03/Enchanter%27s_Emblem.png"),
    ("Enduring Speed",          "Vitality", 1600, "/images/thumb/c/cd/Enduring_Speed.png"),
    ("Guardian Ward",           "Vitality", 1600, "/images/thumb/6/60/Guardian_Ward.png"),
    ("Healbane",                "Vitality", 1600, "/images/thumb/6/62/Healbane.png"),
    ("Healing Booster",         "Vitality", 1600, "/images/thumb/b/b0/Healing_Booster.png"),
    ("Reactive Barrier",        "Vitality", 1600, "/images/thumb/f/f2/Reactive_Barrier.png"),
    ("Restorative Locket",      "Vitality", 1600, "/images/thumb/0/07/Restorative_Locket.png"),
    ("Return Fire",             "Vitality", 1600, "/images/thumb/7/7c/Return_Fire.png"),
    ("Spirit Lifesteal",        "Vitality", 1600, "/images/thumb/d/d9/Spirit_Lifesteal_%28item%29.png"),
    ("Spirit Shielding",        "Vitality", 1600, "/images/thumb/4/4a/Spirit_Shielding.png"),
    ("Weapon Shielding",        "Vitality", 1600, "/images/thumb/f/f4/Weapon_Shielding.png"),
    # VITALITY 3200
    ("Bullet Resilience",       "Vitality", 3200, "/images/thumb/4/4d/Bullet_Resilience.png"),
    ("Counterspell",            "Vitality", 3200, "/images/thumb/5/51/Counterspell.png"),
    ("Dispel Magic",            "Vitality", 3200, "/images/thumb/d/da/Dispel_Magic.png"),
    ("Fortitude",               "Vitality", 3200, "/images/thumb/c/c6/Fortitude.png"),
    ("Fury Trance",             "Vitality", 3200, "/images/thumb/1/15/Fury_Trance.png"),
    ("Healing Nova",            "Vitality", 3200, "/images/thumb/a/ae/Healing_Nova.png"),
    ("Lifestrike",              "Vitality", 3200, "/images/thumb/6/6a/Lifestrike.png"),
    ("Majestic Leap",           "Vitality", 3200, "/images/thumb/d/d7/Majestic_Leap.png"),
    ("Metal Skin",              "Vitality", 3200, "/images/thumb/f/fa/Metal_Skin.png"),
    ("Rescue Beam",             "Vitality", 3200, "/images/thumb/c/c2/Rescue_Beam.png"),
    ("Spirit Resilience",       "Vitality", 3200, "/images/thumb/7/7f/Spirit_Resilience.png"),
    ("Stamina Mastery",         "Vitality", 3200, "/images/thumb/e/eb/Stamina_Mastery.png"),
    ("Trophy Collector",        "Vitality", 3200, "/images/thumb/b/b0/Trophy_Collector.png"),
    ("Veil Walker",             "Vitality", 3200, "/images/thumb/6/69/Veil_Walker.png"),
    ("Warp Stone",              "Vitality", 3200, "/images/thumb/4/4f/Warp_Stone.png"),
    # VITALITY 6400
    ("Cheat Death",             "Vitality", 6400, "/images/thumb/f/f7/Cheat_Death.png"),
    ("Colossus",                "Vitality", 6400, "/images/thumb/b/bb/Colossus.png"),
    ("Divine Barrier",          "Vitality", 6400, "/images/thumb/7/74/Divine_Barrier.png"),
    ("Diviners Kevlar",         "Vitality", 6400, "/images/thumb/0/0a/Diviner%27s_Kevlar.png"),
    ("Healing Tempo",           "Vitality", 6400, "/images/thumb/7/70/Healing_Tempo.png"),
    ("Infuser",                 "Vitality", 6400, "/images/thumb/c/c3/Infuser.png"),
    ("Inhibitor",               "Vitality", 6400, "/images/thumb/9/99/Inhibitor.png"),
    ("Juggernaut",              "Vitality", 6400, "/images/thumb/0/07/Juggernaut.png"),
    ("Leech",                   "Vitality", 6400, "/images/thumb/3/32/Leech.png"),
    ("Phantom Strike",          "Vitality", 6400, "/images/thumb/e/e6/Phantom_Strike.png"),
    ("Plated Armor",            "Vitality", 6400, "/images/thumb/4/4c/Plated_Armor.png"),
    ("Siphon Bullets",          "Vitality", 6400, "/images/thumb/2/2c/Siphon_Bullets.png"),
    ("Spellbreaker",            "Vitality", 6400, "/images/thumb/2/27/Spellbreaker.png"),
    ("Unstoppable",             "Vitality", 6400, "/images/thumb/e/eb/Unstoppable.png"),
    ("Vampiric Burst",          "Vitality", 6400, "/images/thumb/d/dc/Vampiric_Burst.png"),
    ("Witchmail",               "Vitality", 6400, "/images/thumb/0/09/Witchmail.png"),
    # VITALITY 9999
    ("Celestial Blessing",      "Vitality", 9999, "/images/thumb/a/af/Celestial_Blessing.png"),
    ("Cloak of Opportunity",    "Vitality", 9999, "/images/thumb/6/6b/Cloak_of_Opportunity.png"),
    ("Electric Slippers",       "Vitality", 9999, "/images/thumb/1/13/Electric_Slippers.png"),
    ("Eternal Gift",            "Vitality", 9999, "/images/thumb/4/45/Eternal_Gift.png"),
    ("Nullification Burst",     "Vitality", 9999, "/images/thumb/8/8b/Nullification_Burst.png"),
    ("Seraphim Wings",          "Vitality", 9999, "/images/thumb/c/c3/Seraphim_Wings.png"),
    ("Shadow Strike",           "Vitality", 9999, "/images/thumb/4/46/Shadow_Strike.png"),
    # SPIRIT 800
    ("Extra Charge",            "Spirit", 800,  "/images/thumb/4/4a/Extra_Charge.png"),
    ("Extra Spirit",            "Spirit", 800,  "/images/thumb/9/94/Extra_Spirit.png"),
    ("Golden Goose Egg",        "Spirit", 800,  "/images/thumb/a/a8/Golden_Goose_Egg.png"),
    ("Mystic Burst",            "Spirit", 800,  "/images/thumb/9/95/Mystic_Burst.png"),
    ("Mystic Expansion",        "Spirit", 800,  "/images/thumb/d/df/Mystic_Expansion.png"),
    ("Mystic Regeneration",     "Spirit", 800,  "/images/thumb/1/17/Mystic_Regeneration.png"),
    ("Rusted Barrel",           "Spirit", 800,  "/images/thumb/5/54/Rusted_Barrel.png"),
    ("Spirit Strike",           "Spirit", 800,  "/images/thumb/7/7c/Spirit_Strike.png"),
    # SPIRIT 1600
    ("Arcane Surge",            "Spirit", 1600, "/images/thumb/b/bb/Arcane_Surge.png"),
    ("Bullet Resist Shredder",  "Spirit", 1600, "/images/thumb/7/7d/Bullet_Resist_Shredder.png"),
    ("Cold Front",              "Spirit", 1600, "/images/thumb/4/4d/Cold_Front.png"),
    ("Compress Cooldown",       "Spirit", 1600, "/images/thumb/d/d4/Compress_Cooldown.png"),
    ("Duration Extender",       "Spirit", 1600, "/images/thumb/f/fb/Duration_Extender.png"),
    ("Improved Spirit",         "Spirit", 1600, "/images/thumb/c/c9/Improved_Spirit.png"),
    ("Mystic Slow",             "Spirit", 1600, "/images/thumb/6/65/Mystic_Slow.png"),
    ("Mystic Vulnerability",    "Spirit", 1600, "/images/thumb/c/c7/Mystic_Vulnerability.png"),
    ("Quicksilver Reload",      "Spirit", 1600, "/images/thumb/3/3b/Quicksilver_Reload.png"),
    ("Slowing Hex",             "Spirit", 1600, "/images/thumb/1/18/Slowing_Hex.png"),
    ("Spirit Sap",              "Spirit", 1600, "/images/thumb/0/03/Spirit_Sap.png"),
    ("Suppressor",              "Spirit", 1600, "/images/thumb/2/21/Suppressor.png"),
    # SPIRIT 3200
    ("Decay",                   "Spirit", 3200, "/images/thumb/9/93/Decay.png"),
    ("Disarming Hex",           "Spirit", 3200, "/images/thumb/2/2d/Disarming_Hex.png"),
    ("Greater Expansion",       "Spirit", 3200, "/images/thumb/4/4e/Greater_Expansion.png"),
    ("Knockdown",               "Spirit", 3200, "/images/thumb/3/36/Knockdown.png"),
    ("Radiant Regeneration",    "Spirit", 3200, "/images/thumb/c/c7/Radiant_Regeneration.png"),
    ("Rapid Recharge",          "Spirit", 3200, "/images/thumb/a/a9/Rapid_Recharge.png"),
    ("Silence Wave",            "Spirit", 3200, "/images/thumb/8/88/Silence_Wave.png"),
    ("Spirit Snatch",           "Spirit", 3200, "/images/thumb/8/83/Spirit_Snatch.png"),
    ("Superior Cooldown",       "Spirit", 3200, "/images/thumb/9/93/Superior_Cooldown.png"),
    ("Superior Duration",       "Spirit", 3200, "/images/thumb/c/c7/Superior_Duration.png"),
    ("Surge of Power",          "Spirit", 3200, "/images/thumb/d/d4/Surge_of_Power.png"),
    ("Tankbuster",              "Spirit", 3200, "/images/thumb/d/d8/Tankbuster.png"),
    ("Torment Pulse",           "Spirit", 3200, "/images/thumb/4/42/Torment_Pulse.png"),
    # SPIRIT 6400
    ("Arctic Blast",            "Spirit", 6400, "/images/thumb/3/30/Arctic_Blast.png"),
    ("Boundless Spirit",        "Spirit", 6400, "/images/thumb/9/97/Boundless_Spirit.png"),
    ("Cursed Relic",            "Spirit", 6400, "/images/thumb/6/61/Cursed_Relic.png"),
    ("Echo Shard",              "Spirit", 6400, "/images/thumb/a/ab/Echo_Shard.png"),
    ("Escalating Exposure",     "Spirit", 6400, "/images/thumb/2/21/Escalating_Exposure.png"),
    ("Ethereal Shift",          "Spirit", 6400, "/images/thumb/3/3c/Ethereal_Shift.png"),
    ("Focus Lens",              "Spirit", 6400, "/images/thumb/3/3c/Focus_Lens.png"),
    ("Lightning Scroll",        "Spirit", 6400, "/images/thumb/b/b8/Lightning_Scroll.png"),
    ("Magic Carpet",            "Spirit", 6400, "/images/thumb/2/25/Magic_Carpet.png"),
    ("Mercurial Magnum",        "Spirit", 6400, "/images/thumb/a/af/Mercurial_Magnum.png"),
    ("Mystic Reverb",           "Spirit", 6400, "/images/thumb/0/07/Mystic_Reverb.png"),
    ("Refresher",               "Spirit", 6400, "/images/thumb/5/53/Refresher.png"),
    ("Scourge",                 "Spirit", 6400, "/images/thumb/5/58/Scourge.png"),
    ("Spirit Burn",             "Spirit", 6400, "/images/thumb/e/ef/Spirit_Burn.png"),
    ("Transcendent Cooldown",   "Spirit", 6400, "/images/thumb/b/bd/Transcendent_Cooldown.png"),
    ("Vortex Web",              "Spirit", 6400, "/images/thumb/8/85/Vortex_Web.png"),
    # SPIRIT 9999
    ("Frostbite Charm",         "Spirit", 9999, "/images/thumb/5/5a/Frostbite_Charm.png"),
    ("Mystic Conduit",          "Spirit", 9999, "/images/thumb/5/5e/Mystic_Conduit.png"),
    ("Mystical Piano",          "Spirit", 9999, "/images/thumb/9/9f/Mystical_Piano.png"),
    ("Omnicharge Signet",       "Spirit", 9999, "/images/thumb/1/18/Omnicharge_Signet.png"),
    ("Prism Blast",             "Spirit", 9999, "/images/thumb/d/d2/Prism_Blast.png"),
    ("Shrink Ray",              "Spirit", 9999, "/images/thumb/e/e9/Shrink_Ray.png"),
    ("Unstable Concoction",     "Spirit", 9999, "/images/thumb/f/fe/Unstable_Concoction.png"),
]

# ─── SYNERGY DATA ────────────────────────────────────────────────────────────
# Keys: item normalized name → dict of { "self_hero" / "ally_hero" / "enemy_hero": value }
# Values: -5 to +5. Omit entry entirely if interaction is neutral/unknown (blank in CSV).
SYNERGY = {

    # ── WEAPON ITEMS ─────────────────────────────────────────────────────────

    "close_quarters": {
        "self_abrams": 4, "self_billy": 4, "self_shiv": 4, "self_lash": 3,
        "self_silver": 3, "self_mina": 3, "self_mo_and_krill": 3,
        "self_viscous": 3, "self_yamato": 3, "self_vyper": 2, "self_bebop": 2,
        "self_calico": 2, "self_drifter": 2,
        "self_vindicta": -3, "self_grey_talon": -3, "self_haze": -2,
        "enemy_vindicta": -2, "enemy_grey_talon": -2,
    },
    "monster_rounds": {
        "self_abrams": 1, "self_vindicta": 2, "self_grey_talon": 2,
        "self_haze": 2, "self_wraith": 2,
        "enemy_abrams": 3, "enemy_viscous": 3, "enemy_warden": 3,
        "enemy_dynamo": 2, "enemy_kelvin": 2, "enemy_pocket": 2,
        "enemy_mo_and_krill": 3, "enemy_mcginnis": 2,
    },
    "slowing_bullets": {
        "ally_lash": 3, "ally_abrams": 2, "ally_silver": 2, "ally_shiv": 2,
        "ally_mina": 2, "ally_mo_and_krill": 2, "ally_bebop": 2,
        "enemy_vindicta": 3, "enemy_drifter": 3, "enemy_haze": 2,
        "enemy_grey_talon": 2, "enemy_ivy": 2, "enemy_calico": 2,
    },
    "melee_charge": {
        "self_abrams": 3, "self_billy": 3, "self_shiv": 3, "self_lash": 3,
        "self_silver": 3, "self_mina": 3, "self_mo_and_krill": 3,
        "self_viscous": 2, "self_yamato": 3, "self_vyper": 2,
        "self_vindicta": -3, "self_grey_talon": -3,
    },
    "mystic_shot": {
        "self_infernus": 4, "self_holliday": 3, "self_wraith": 3,
        "self_grey_talon": 2, "self_calico": 3, "self_mirage": 2,
        "self_venator": 2, "self_sinclair": 2,
    },
    "spirit_shredder_bullets": {
        "self_infernus": 3, "self_holliday": 2, "self_wraith": 3,
        "self_grey_talon": 2, "self_calico": 2,
        "enemy_warden": 3, "enemy_abrams": 2,
    },
    "alchemical_fire": {
        "self_abrams": 2, "self_kelvin": 2, "self_bebop": 2,
        "self_mo_and_krill": 2, "self_dynamo": 2, "self_lash": 2,
        "enemy_mcginnis": 3,
        "ally_dynamo": 2,
    },
    "headhunter": {
        "self_vindicta": 4, "self_grey_talon": 3, "self_wraith": 2,
        "self_silver": 2, "self_graves": 2, "self_haze": 2,
    },
    "hunters_aura": {
        "ally_abrams": 2, "ally_lash": 2, "ally_shiv": 2, "ally_silver": 2,
        "ally_mo_and_krill": 2, "ally_mina": 2, "ally_billy": 2,
        "enemy_warden": 3, "enemy_abrams": 2, "enemy_viscous": 2,
    },
    "point_blank": {
        "self_abrams": 3, "self_bebop": 3, "self_shiv": 3, "self_lash": 3,
        "self_silver": 2, "self_mo_and_krill": 3, "self_viscous": 2,
        "self_yamato": 2, "self_vyper": 2, "self_mina": 3,
        "self_vindicta": -3, "self_grey_talon": -3,
    },
    "tesla_bullets": {
        "ally_dynamo": 4, "ally_kelvin": 3,
        "self_kelvin": 2, "self_mcginnis": 2, "self_dynamo": 2,
        "enemy_mcginnis": 2,
    },
    "toxic_bullets": {
        "enemy_abrams": 2, "enemy_viscous": 2, "enemy_warden": 2,
        "enemy_pocket": 2, "enemy_mo_and_krill": 2,
    },
    "armor_piercing_rounds": {
        "enemy_abrams": 4, "enemy_warden": 4, "enemy_mcginnis": 3,
        "enemy_viscous": 3, "enemy_pocket": 3, "enemy_kelvin": 3,
        "enemy_victor": 3, "enemy_dynamo": 2, "enemy_mo_and_krill": 3,
    },
    "crippling_headshot": {
        "self_vindicta": 4, "self_grey_talon": 4, "self_silver": 3,
        "self_haze": 2,
        "ally_lash": 4, "ally_abrams": 3, "ally_shiv": 3, "ally_silver": 3,
        "ally_mina": 2, "ally_mo_and_krill": 2,
    },
    "crushing_fists": {
        "self_abrams": 4, "self_shiv": 4, "self_silver": 4, "self_billy": 3,
        "self_lash": 4, "self_mina": 4, "self_mo_and_krill": 4,
        "self_viscous": 3, "self_yamato": 4, "self_vyper": 3, "self_bebop": 3,
        "self_vindicta": -4, "self_grey_talon": -4,
    },
    "frenzy": {
        "self_haze": 3, "self_vindicta": 2, "self_wraith": 3,
        "self_graves": 2, "self_venator": 2,
    },
    "glass_cannon": {
        "self_vindicta": 3, "self_grey_talon": 3, "self_haze": 3,
        "self_wraith": 3, "self_seven": 2, "self_lady_geist": 2,
        "self_pocket": 2,
        "enemy_haze": -4, "enemy_lash": -4, "enemy_abrams": -3,
        "enemy_seven": -3, "enemy_dynamo": -3, "enemy_sinclair": -3,
    },
    "ricochet": {
        "ally_dynamo": 4, "ally_kelvin": 3,
        "enemy_mcginnis": 3,
        "self_mcginnis": 3,
    },
    "silencer": {
        "self_vindicta": 4, "self_grey_talon": 4, "self_haze": 3,
        "self_silver": 3,
        "enemy_seven": 4, "enemy_lady_geist": 3, "enemy_pocket": 3,
        "enemy_celeste": 3, "enemy_sinclair": 3, "enemy_infernus": 3,
        "enemy_kelvin": 2, "enemy_yamato": 3, "enemy_ivy": 3,
        "enemy_dynamo": 2,
    },
    "spellslinger": {
        "self_infernus": 3, "self_holliday": 3, "self_wraith": 3,
        "self_grey_talon": 2, "self_calico": 2,
    },
    "infinite_rounds": {
        "self_haze": 5, "self_vindicta": 3, "self_wraith": 4,
        "self_mcginnis": 4, "self_grey_talon": 3,
    },
    "runed_gauntlets": {
        "self_abrams": 4, "self_shiv": 4, "self_silver": 4,
        "self_lash": 4, "self_mina": 4, "self_mo_and_krill": 4,
        "self_viscous": 3, "self_yamato": 4, "self_vyper": 3,
    },

    # ── VITALITY ITEMS ───────────────────────────────────────────────────────

    "sprint_boots": {
        "self_abrams": 2, "self_billy": 2, "self_shiv": 3, "self_silver": 2,
        "self_lash": 2, "self_mo_and_krill": 2, "self_mina": 2,
        "enemy_vindicta": 2, "enemy_grey_talon": 2,
    },
    "melee_lifesteal": {
        "self_abrams": 4, "self_shiv": 4, "self_silver": 3, "self_billy": 3,
        "self_lash": 3, "self_mina": 3, "self_mo_and_krill": 3,
        "self_viscous": 3, "self_yamato": 3, "self_vyper": 2, "self_bebop": 2,
        "self_vindicta": -3, "self_grey_talon": -3, "self_haze": -2,
    },
    "bullet_lifesteal": {
        "self_haze": 4, "self_vindicta": 4, "self_grey_talon": 3,
        "self_wraith": 3, "self_graves": 3, "self_venator": 3,
        "self_silver": 2, "self_mcginnis": 2,
        "self_seven": -2, "self_pocket": -2, "self_lady_geist": -2,
    },
    "debuff_reducer": {
        "enemy_seven": 3, "enemy_haze": 4, "enemy_kelvin": 3,
        "enemy_lash": 3, "enemy_warden": 4, "enemy_dynamo": 3,
        "enemy_sinclair": 3, "enemy_bebop": 2, "enemy_paradox": 2,
    },
    "healbane": {
        "enemy_ivy": 5, "enemy_kelvin": 4, "enemy_celeste": 4,
        "enemy_abrams": 4, "enemy_warden": 3, "enemy_holliday": 3,
        "enemy_paige": 3, "enemy_rem": 3, "enemy_seven": 2,
        "ally_abrams": -2, "ally_kelvin": -2, "ally_ivy": -3,
        "ally_celeste": -2,
    },
    "healing_booster": {
        "self_abrams": 3, "self_kelvin": 3, "self_ivy": 3,
        "self_warden": 2, "self_holliday": 2, "self_celeste": 2,
    },
    "spirit_lifesteal": {
        "self_seven": 4, "self_lady_geist": 4, "self_pocket": 3,
        "self_celeste": 3, "self_infernus": 4, "self_kelvin": 3,
        "self_viscous": 3, "self_yamato": 3, "self_sinclair": 2,
        "self_ivy": 2, "self_lash": 2,
        "self_haze": -2, "self_vindicta": -2, "self_grey_talon": -2,
    },
    "counterspell": {
        "enemy_seven": 4, "enemy_pocket": 4, "enemy_lady_geist": 4,
        "enemy_celeste": 4, "enemy_sinclair": 4, "enemy_infernus": 3,
        "enemy_yamato": 3, "enemy_kelvin": 3, "enemy_lash": 2,
        "enemy_ivy": 2, "enemy_holliday": 2,
    },
    "bullet_resilience": {
        "self_abrams": 2, "self_mo_and_krill": 2, "self_shiv": 2,
        "self_lash": 2, "self_viscous": 2,
        "enemy_haze": 3, "enemy_vindicta": 3, "enemy_mcginnis": 3,
        "enemy_grey_talon": 3, "enemy_wraith": 3, "enemy_graves": 2,
    },
    "lifestrike": {
        "self_abrams": 5, "self_shiv": 4, "self_silver": 4,
        "self_mo_and_krill": 4, "self_lash": 4, "self_billy": 3,
        "self_mina": 4, "self_viscous": 3, "self_yamato": 4,
        "self_vyper": 3, "self_bebop": 3, "self_calico": 2,
        "self_drifter": 2,
        "self_vindicta": -3, "self_grey_talon": -3, "self_haze": -2,
        "self_wraith": -2,
    },
    "metal_skin": {
        "enemy_haze": 4, "enemy_vindicta": 4, "enemy_grey_talon": 4,
        "enemy_mcginnis": 3, "enemy_wraith": 3, "enemy_graves": 3,
        "enemy_silver": 3,
        "self_abrams": 2, "self_mo_and_krill": 2, "self_lash": 2,
        "self_shiv": 2,
    },
    "rescue_beam": {
        "self_ivy": 4, "self_kelvin": 4, "self_celeste": 4,
        "self_dynamo": 3, "self_warden": 3, "self_paige": 3, "self_rem": 3,
        "ally_abrams": 3, "ally_viscous": 2, "ally_mo_and_krill": 2,
        "ally_dynamo": 2,
        "self_vindicta": -2, "self_haze": -2,
    },
    "spirit_resilience": {
        "enemy_seven": 4, "enemy_pocket": 4, "enemy_lady_geist": 4,
        "enemy_celeste": 4, "enemy_yamato": 4, "enemy_infernus": 3,
        "enemy_sinclair": 3, "enemy_kelvin": 2, "enemy_lash": 2,
        "enemy_ivy": 2,
    },
    "fortitude": {
        "self_abrams": 3, "self_warden": 3, "self_viscous": 3,
        "self_mo_and_krill": 3, "self_dynamo": 3, "self_pocket": 2,
        "self_kelvin": 2, "self_victor": 2,
    },
    "cheat_death": {
        "self_haze": 4, "self_vindicta": 4, "self_grey_talon": 3,
        "self_lady_geist": 3, "self_seven": 2, "self_pocket": 2,
        "enemy_haze": 3, "enemy_seven": 3, "enemy_lash": 3, "enemy_dynamo": 2,
    },
    "colossus": {
        "self_abrams": 4, "self_lash": 4, "self_mo_and_krill": 4,
        "self_viscous": 3, "self_dynamo": 3, "self_warden": 3,
        "self_shiv": 2, "self_silver": 2,
        "enemy_vindicta": 3, "enemy_seven": 2, "enemy_haze": 3,
    },
    "inhibitor": {
        "enemy_ivy": 5, "enemy_kelvin": 4, "enemy_celeste": 4,
        "enemy_abrams": 4, "enemy_warden": 3, "enemy_holliday": 3,
    },
    "juggernaut": {
        "self_abrams": 4, "self_mo_and_krill": 4, "self_viscous": 4,
        "self_warden": 3, "self_dynamo": 3, "self_lash": 3,
        "self_pocket": 2, "self_kelvin": 2,
    },
    "leech": {
        "self_seven": 3, "self_lady_geist": 3, "self_pocket": 3,
        "self_yamato": 3, "self_infernus": 3, "self_kelvin": 2,
        "self_sinclair": 2,
    },
    "plated_armor": {
        "enemy_haze": 3, "enemy_vindicta": 3, "enemy_mcginnis": 3,
        "enemy_grey_talon": 3, "enemy_wraith": 3, "enemy_graves": 2,
        "self_abrams": 2, "self_mo_and_krill": 2,
    },
    "spellbreaker": {
        "enemy_seven": 4, "enemy_pocket": 4, "enemy_sinclair": 4,
        "enemy_lady_geist": 3, "enemy_kelvin": 3, "enemy_yamato": 3,
        "enemy_ivy": 3, "enemy_lash": 2,
    },
    "unstoppable": {
        "self_seven": 5, "self_kelvin": 5, "self_mcginnis": 4,
        "self_grey_talon": 4, "self_haze": 5, "self_wraith": 4,
        "self_dynamo": 4, "self_lash": 3, "self_lady_geist": 3,
        "enemy_lash": 3, "enemy_dynamo": 3, "enemy_warden": 3,
        "enemy_kelvin": 3, "enemy_seven": 2, "enemy_bebop": 2,
        "enemy_sinclair": 2,
    },
    "vampiric_burst": {
        "self_abrams": 3, "self_shiv": 3, "self_mo_and_krill": 3,
        "self_lash": 3, "self_silver": 2, "self_viscous": 2,
        "self_yamato": 3, "self_mina": 2,
    },
    "witchmail": {
        "enemy_seven": 4, "enemy_pocket": 4, "enemy_lady_geist": 4,
        "enemy_celeste": 4, "enemy_yamato": 3, "enemy_sinclair": 3,
        "enemy_infernus": 3, "enemy_kelvin": 2,
    },
    "healing_tempo": {
        "self_ivy": 4, "self_kelvin": 4, "self_abrams": 3,
        "self_celeste": 3, "self_warden": 3, "self_holliday": 2,
        "self_paige": 2,
    },
    "divine_barrier": {
        "enemy_haze": 4, "enemy_seven": 3, "enemy_lash": 3,
        "enemy_dynamo": 3, "enemy_lady_geist": 3, "enemy_yamato": 3,
        "enemy_infernus": 3,
    },
    "seraphim_wings": {
        "self_seven": 4, "self_kelvin": 3, "self_ivy": 3,
        "self_haze": 3, "self_grey_talon": 3, "self_wraith": 3,
        "ally_dynamo": 3,
    },
    "nullification_burst": {
        "enemy_seven": 5, "enemy_kelvin": 4, "enemy_lady_geist": 4,
        "enemy_pocket": 4, "enemy_sinclair": 4, "enemy_yamato": 4,
        "enemy_infernus": 3, "enemy_ivy": 3,
    },
    "eternal_gift": {
        "self_ivy": 4, "self_kelvin": 3, "self_celeste": 3,
        "self_warden": 3, "self_dynamo": 3,
        "ally_abrams": 3, "ally_viscous": 2,
    },

    # ── SPIRIT ITEMS ─────────────────────────────────────────────────────────

    "extra_charge": {
        "self_bebop": 4, "self_mcginnis": 4, "self_paradox": 3,
        "self_ivy": 3, "self_lash": 3, "self_kelvin": 2,
        "self_holliday": 3, "self_lady_geist": 3,
    },
    "mystic_expansion": {
        "self_seven": 4, "self_dynamo": 4, "self_kelvin": 4,
        "self_mcginnis": 3, "self_holliday": 3, "self_infernus": 3,
        "self_yamato": 3, "self_lady_geist": 3,
        "ally_dynamo": 4,
    },
    "compress_cooldown": {
        "self_bebop": 3, "self_paradox": 3, "self_lash": 3,
        "self_sinclair": 3, "self_kelvin": 3, "self_seven": 3,
        "self_mcginnis": 3, "self_holliday": 2,
    },
    "duration_extender": {
        "self_kelvin": 4, "self_seven": 4, "self_dynamo": 4,
        "self_haze": 3, "self_mcginnis": 3, "self_warden": 3,
        "self_lash": 3,
    },
    "mystic_slow": {
        "self_infernus": 4, "self_kelvin": 3, "self_seven": 3,
        "self_pocket": 3, "self_lady_geist": 3, "self_yamato": 2,
        "ally_lash": 3, "ally_abrams": 2, "ally_shiv": 3, "ally_silver": 2,
    },
    "mystic_vulnerability": {
        "self_lady_geist": 4, "self_seven": 4, "self_pocket": 4,
        "self_yamato": 3, "self_infernus": 3, "self_sinclair": 3,
        "self_celeste": 3, "self_lash": 2,
        "enemy_warden": 4,
    },
    "slowing_hex": {
        "ally_lash": 3, "ally_grey_talon": 3, "ally_abrams": 2,
        "ally_shiv": 3, "ally_silver": 2,
        "enemy_vindicta": 3, "enemy_drifter": 3, "enemy_haze": 2,
        "enemy_ivy": 2,
    },
    "suppressor": {
        "enemy_seven": 3, "enemy_kelvin": 3, "enemy_haze": 3,
        "enemy_grey_talon": 3, "enemy_wraith": 3, "enemy_mcginnis": 3,
        "enemy_lash": 2,
    },
    "decay": {
        "enemy_abrams": 3, "enemy_warden": 3, "enemy_viscous": 3,
        "enemy_mo_and_krill": 3, "enemy_pocket": 2, "enemy_kelvin": 2,
        "self_lady_geist": 3, "self_infernus": 3, "self_seven": 2,
    },
    "disarming_hex": {
        "enemy_haze": 5, "enemy_vindicta": 4, "enemy_grey_talon": 4,
        "enemy_wraith": 4, "enemy_mcginnis": 3, "enemy_graves": 3,
        "enemy_silver": 3,
    },
    "knockdown": {
        "ally_grey_talon": 4, "ally_haze": 4, "ally_seven": 4,
        "ally_lash": 5, "ally_shiv": 4, "ally_silver": 3,
        "ally_abrams": 3, "ally_bebop": 3,
        "enemy_seven": 4, "enemy_kelvin": 3, "enemy_mcginnis": 3,
        "enemy_haze": 3, "enemy_grey_talon": 3, "enemy_wraith": 3,
    },
    "silence_wave": {
        "self_lash": 3, "self_abrams": 3, "self_bebop": 3, "self_mo_and_krill": 2,
        "ally_seven": 3, "ally_grey_talon": 3, "ally_haze": 3, "ally_lash": 3,
        "ally_shiv": 2,
        "enemy_seven": 5, "enemy_pocket": 4, "enemy_sinclair": 4,
        "enemy_lady_geist": 4, "enemy_ivy": 4, "enemy_kelvin": 4,
        "enemy_yamato": 3, "enemy_infernus": 3, "enemy_lash": 3,
        "enemy_dynamo": 3,
    },
    "superior_cooldown": {
        "self_bebop": 4, "self_paradox": 4, "self_lash": 4,
        "self_sinclair": 4, "self_kelvin": 3, "self_seven": 3,
        "self_mcginnis": 3, "self_dynamo": 3,
    },
    "superior_duration": {
        "self_kelvin": 4, "self_seven": 4, "self_dynamo": 4,
        "self_haze": 4, "self_mcginnis": 4, "self_warden": 3,
        "self_lash": 3, "self_grey_talon": 3,
    },
    "tankbuster": {
        "enemy_abrams": 4, "enemy_warden": 4, "enemy_viscous": 4,
        "enemy_mo_and_krill": 4, "enemy_dynamo": 3, "enemy_pocket": 3,
        "enemy_kelvin": 3, "enemy_victor": 3,
    },
    "torment_pulse": {
        "self_abrams": 4, "self_mo_and_krill": 4, "self_viscous": 4,
        "self_lash": 3, "self_warden": 3, "self_dynamo": 3,
        "self_shiv": 3, "self_kelvin": 3,
        "ally_dynamo": 3,
    },
    "arctic_blast": {
        "ally_lash": 5, "ally_shiv": 5, "ally_grey_talon": 4,
        "ally_haze": 4, "ally_bebop": 4, "ally_silver": 4,
        "ally_abrams": 3, "ally_mina": 3, "ally_mo_and_krill": 3,
        "ally_billy": 3, "ally_yamato": 3,
    },
    "boundless_spirit": {
        "self_seven": 5, "self_pocket": 5, "self_lady_geist": 5,
        "self_celeste": 4, "self_sinclair": 4, "self_yamato": 4,
        "self_kelvin": 4, "self_infernus": 4, "self_lash": 3,
        "self_ivy": 3,
    },
    "echo_shard": {
        "self_paradox": 5, "self_sinclair": 5, "self_lash": 4,
        "self_dynamo": 4, "self_bebop": 4, "self_seven": 4,
        "self_kelvin": 3, "self_lady_geist": 3, "self_holliday": 3,
        "self_yamato": 4, "self_haze": 3,
    },
    "escalating_exposure": {
        "enemy_warden": 5, "enemy_abrams": 3, "enemy_viscous": 2,
        "self_seven": 3, "self_pocket": 3, "self_lady_geist": 3,
        "self_yamato": 3, "self_infernus": 3,
    },
    "ethereal_shift": {
        "self_haze": 5, "self_vindicta": 5, "self_grey_talon": 4,
        "self_lady_geist": 4, "self_seven": 3, "self_pocket": 3,
        "enemy_haze": 5, "enemy_seven": 4, "enemy_lash": 4,
        "enemy_dynamo": 4, "enemy_yamato": 3,
    },
    "focus_lens": {
        "self_kelvin": 4, "self_seven": 4, "self_mcginnis": 4,
        "self_lady_geist": 4, "self_infernus": 3, "self_dynamo": 3,
        "self_lash": 3, "self_yamato": 3,
    },
    "magic_carpet": {
        "self_infernus": 5, "self_yamato": 3, "self_pocket": 3,
        "self_seven": 3, "self_lady_geist": 3, "self_lash": 3,
    },
    "mystic_reverb": {
        "self_seven": 4, "self_kelvin": 4, "self_infernus": 3,
        "self_pocket": 3, "self_lady_geist": 3, "self_yamato": 3,
        "ally_dynamo": 3,
    },
    "refresher": {
        "self_seven": 5, "self_lash": 5, "self_dynamo": 5,
        "self_kelvin": 4, "self_haze": 4, "self_wraith": 4,
        "self_yamato": 5, "self_vindicta": 3, "self_grey_talon": 4,
        "self_bebop": 3, "self_paradox": 3, "self_sinclair": 4,
    },
    "scourge": {
        "self_infernus": 4, "self_seven": 3, "self_kelvin": 3,
        "self_lady_geist": 3, "self_yamato": 3,
    },
    "vortex_web": {
        "ally_grey_talon": 4, "ally_haze": 4, "ally_seven": 4,
        "ally_lash": 4, "ally_dynamo": 4, "ally_mcginnis": 3,
        "ally_infernus": 3, "ally_shiv": 3, "ally_bebop": 3,
        "ally_wraith": 3,
    },
    "frostbite_charm": {
        "self_kelvin": 4, "self_infernus": -1,
        "ally_lash": 4, "ally_shiv": 4, "ally_grey_talon": 3,
        "ally_haze": 3, "ally_silver": 3, "ally_abrams": 3,
    },
    "mystic_conduit": {
        "self_seven": 5, "self_pocket": 5, "self_lady_geist": 4,
        "self_celeste": 4, "self_sinclair": 4, "self_yamato": 4,
        "self_kelvin": 4, "self_infernus": 4,
    },
    "shrink_ray": {
        "enemy_abrams": 5, "enemy_warden": 5, "enemy_viscous": 4,
        "enemy_mo_and_krill": 4, "enemy_dynamo": 4, "enemy_pocket": 3,
        "enemy_juggernaut": 3,
    },
    "prism_blast": {
        "self_seven": 4, "self_kelvin": 4, "self_dynamo": 3,
        "self_infernus": 3, "self_yamato": 3,
        "ally_dynamo": 4,
    },
    "unstable_concoction": {
        "self_seven": 4, "self_lady_geist": 3, "self_pocket": 3,
        "ally_dynamo": 3, "ally_kelvin": 2,
        "enemy_abrams": 3, "enemy_warden": 3, "enemy_viscous": 3,
    },
    "omnicharge_signet": {
        "self_seven": 4, "self_kelvin": 4, "self_infernus": 4,
        "self_pocket": 3, "self_lash": 3, "self_yamato": 3,
        "self_sinclair": 3, "self_bebop": 3,
    },
}


def thumb_to_direct(thumb_path):
    """Convert /images/thumb/x/xx/File.png to /images/x/xx/File.png"""
    return thumb_path.replace("/images/thumb/", "/images/")


def generate_matrix(item_name, synergy):
    n = norm(item_name)
    rows = [["", n]]
    for prefix in ("self", "ally", "enemy"):
        for hero in HEROES:
            h = hn(hero)
            key = f"{prefix}_{h}"
            val = synergy.get(key, "")
            rows.append([f"{prefix}_{h}", val])
    return rows


def download_image(session, url, dest_path):
    r = session.get(url, timeout=30)
    r.raise_for_status()
    with open(dest_path, "wb") as f:
        f.write(r.content)


def main():
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0 (compatible; DeadlockAdvisor/1.0)"})

    index = []

    for (item_name, category, tier, thumb_path) in ITEMS:
        n = norm(item_name)
        item_dir = ITEMS_DIR / n
        item_dir.mkdir(parents=True, exist_ok=True)

        wiki_slug = item_name.replace(" ", "_")
        wiki_url = f"{BASE_URL}/{wiki_slug}"
        img_filename = f"{n}.png"
        img_path = item_dir / img_filename
        matrix_filename = f"matrix_{n}.csv"
        matrix_path = item_dir / matrix_filename
        manifest_filename = f"manifest_{n}.json"
        manifest_path = item_dir / manifest_filename

        print(f"[{item_name}]", end=" ")

        # Download image
        direct_url = BASE_URL + thumb_to_direct(thumb_path)
        try:
            download_image(session, direct_url, img_path)
            print("img OK", end=" ")
        except Exception as e:
            print(f"img FAIL({e})", end=" ")

        # Write manifest
        manifest = {
            "name": item_name,
            "normalized_name": n,
            "category": category,
            "tier": tier,
            "wiki_url": wiki_url,
            "image": f"/resources/items/{n}/{img_filename}",
            "matrix": f"/resources/items/{n}/{matrix_filename}",
        }
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print("manifest OK", end=" ")

        # Write matrix
        synergy = SYNERGY.get(n, {})
        rows = generate_matrix(item_name, synergy)
        with open(matrix_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        print("matrix OK")

        index.append({
            "name": item_name,
            "normalized_name": n,
            "category": category,
            "tier": tier,
        })

        time.sleep(0.2)

    # Write index.json
    with open(ITEMS_DIR / "index.json", "w") as f:
        json.dump(index, f, indent=2)
    print(f"\nWrote index.json with {len(index)} items.")


if __name__ == "__main__":
    main()
