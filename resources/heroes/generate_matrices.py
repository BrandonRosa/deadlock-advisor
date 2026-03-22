import csv
from pathlib import Path

HEROES_DIR = Path(r"C:\Users\Brandon Rosa-Parada\deadlock-advisor\public\resources\heroes")

# Hero order matches PORTRAIT_CARDS order (used throughout the project)
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
    return name.lower().replace(" ", "_")

# ─── BUILDS PER HERO ────────────────────────────────────────────────────────
BUILDS = {
    "Abrams":      ["Tank", "Gun", "Spirit", "Melee"],
    "Apollo":      ["Spirit", "Gun", "Mobility"],
    "Bebop":       ["Bomb", "Gun", "Melee"],
    "Billy":       ["Melee", "Gun"],
    "Calico":      ["Spirit", "Melee", "Gun"],
    "Celeste":     ["Spirit", "Support"],
    "The Doorman": ["Spirit", "Tank", "Support"],
    "Drifter":     ["Gun", "Spirit", "Melee"],
    "Dynamo":      ["Spirit", "Tank", "CC Ult"],
    "Graves":      ["Gun", "Spirit"],
    "Grey Talon":  ["Spirit", "Gun", "Sniper"],
    "Haze":        ["Gun", "Ult", "Spirit"],
    "Holliday":    ["Spirit", "Gun", "Bomb"],
    "Infernus":    ["Spirit", "Gun", "Flame Dash"],
    "Ivy":         ["Support", "Gun", "Spirit"],
    "Kelvin":      ["Spirit", "Tank", "Beam"],
    "Lady Geist":  ["Spirit", "Gun", "Bomb"],
    "Lash":        ["Spirit", "Melee", "Ult"],
    "McGinnis":    ["Gun", "Turret", "Spirit"],
    "Mina":        ["Spirit", "Melee"],
    "Mirage":      ["Spirit", "Gun"],
    "Mo & Krill":  ["Tank", "Spirit", "Melee"],
    "Paige":       ["Support", "Gun"],
    "Paradox":     ["Spirit", "Gun", "Ult"],
    "Pocket":      ["Tank", "Spirit"],
    "Rem":         ["Support", "Spirit", "Melee"],
    "Seven":       ["Spirit", "Ult", "Gun"],
    "Shiv":        ["Melee", "Bleed", "Gun"],
    "Silver":      ["Melee", "Werewolf", "Gun"],
    "Sinclair":    ["Spirit", "Hex", "Gun"],
    "Venator":     ["Gun", "Spirit"],
    "Victor":      ["Tank", "Gun", "Spirit"],
    "Vindicta":    ["Gun", "Sniper", "Spirit"],
    "Viscous":     ["Melee", "Tank", "Spirit"],
    "Vyper":       ["Gun", "Melee"],
    "Warden":      ["Tank", "Support", "Spirit"],
    "Wraith":      ["Gun", "Spirit", "Ult"],
    "Yamato":      ["Spirit", "Melee", "Ult"],
    "Mina":        ["Spirit", "Melee"],
}

# ─── SYNERGY / COUNTER VALUES ─────────────────────────────────────────────────
# Format: SYNERGY[hero][build][ally_X or enemy_X] = int(-5 to 5)
# Omit entries where the interaction is blank/neutral (user: "leave blank if unsure")
SYNERGY = {

    # ── ABRAMS ──────────────────────────────────────────────────────────────
    "Abrams": {
        "Tank": {
            "ally_kelvin":    2,   # freeze gives Abrams engage window
            "ally_dynamo":    2,   # Grav Zone holds enemies in melee range
            "ally_warden":    2,   # CC chains extend threat window
            "enemy_vindicta": -2,  # kiting/flying counters approach
            "enemy_grey_talon": -2,# long-range kiting
            "enemy_haze":     -1,  # sleep disrupts engage
            "enemy_lash":     -2,  # Ground Strike punishes melee engage
            "enemy_seven":    -1,  # lightning harassment chips tank
        },
        "Gun": {
            "ally_dynamo":    3,   # Grav Zone = free shots
            "ally_kelvin":    2,   # freeze = stationary target
            "enemy_kelvin":   -1,  # Arctic Beam shield reduces gun damage
            "enemy_viscous":  -2,  # Goo Ball is very hard to damage with guns
            "enemy_abrams":   -1,  # mirror: both tanky
            "enemy_warden":   -2,  # high armor
        },
        "Spirit": {
            "ally_ivy":       2,   # Watcher's Covenant spirit amp
            "ally_celeste":   1,
            "ally_seven":     1,
            "enemy_warden":   -3,  # spirit resist aura
            "enemy_seven":    -2,  # silence interrupts
        },
        "Melee": {
            "ally_kelvin":    3,   # freeze = can't escape melee
            "ally_dynamo":    3,   # Grav Zone = can't kite
            "ally_warden":    3,   # CC = free melee hits
            "ally_lash":      2,   # Ground Strike synergy
            "enemy_vindicta": -4,  # flying/kiting completely counters melee
            "enemy_grey_talon": -3,# long-range kiting
            "enemy_haze":     -2,  # sleep + kiting
            "enemy_lash":     -2,  # Ground Strike interrupts engage
            "enemy_ivy":      -1,  # air dash escape
            "enemy_drifter":  -2,  # high mobility
        },
    },

    # ── APOLLO ──────────────────────────────────────────────────────────────
    "Apollo": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,   # spirit synergy
            "ally_dynamo":    2,   # Grav Zone amps spirit combo
            "enemy_warden":   -3,  # spirit resist
            "enemy_seven":    -2,  # silence
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Mobility": {
            "ally_kelvin":    -1,  # Blizzard blocks movement paths
            "ally_mcginnis":  -1,  # turret walls block paths
            "enemy_haze":     -2,  # sleep interrupts mobility abilities
            "enemy_seven":    -2,  # silence disrupts
            "enemy_mcginnis": -1,  # wall blocks dash routes
        },
    },

    # ── BEBOP ────────────────────────────────────────────────────────────────
    "Bebop": {
        "Bomb": {
            "ally_dynamo":    4,   # Grav Zone = can't escape bombs
            "ally_kelvin":    3,   # freeze = can't escape bombs
            "ally_warden":    3,   # CC = place bomb at will
            "ally_sinclair":  2,   # hex + bomb combo
            "enemy_vindicta": -1,  # flying reduces hook range
            "enemy_ivy":      -1,  # aerial escape
            "enemy_haze":     -2,  # sleep can interrupt hook cast
        },
        "Gun": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Melee": {
            "ally_kelvin":    3,
            "ally_dynamo":    3,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
    },

    # ── BILLY ────────────────────────────────────────────────────────────────
    "Billy": {
        "Melee": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
            "enemy_ivy":      -1,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── CALICO ───────────────────────────────────────────────────────────────
    "Calico": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    2,
            "ally_dynamo":    3,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── CELESTE ──────────────────────────────────────────────────────────────
    "Celeste": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -4,  # spirit resist is a severe counter
            "enemy_seven":    -2,
        },
        "Support": {
            "ally_abrams":    2,
            "ally_dynamo":    2,
            "ally_viscous":   1,
            "ally_warden":    1,
            "ally_kelvin":    2,
            "enemy_haze":     -3,  # sleep disrupts all support casts
            "enemy_seven":    -2,
            "enemy_sinclair": -2,
        },
    },

    # ── THE DOORMAN ──────────────────────────────────────────────────────────
    "The Doorman": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     1,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Tank": {
            "ally_ivy":       2,
            "ally_kelvin":    1,
            "enemy_lash":     -2,
            "enemy_seven":    -1,
        },
        "Support": {
            "ally_abrams":    2,
            "ally_viscous":   2,
            "ally_kelvin":    2,
            "enemy_haze":     -3,
            "enemy_seven":    -3,
            "enemy_sinclair": -2,
        },
    },

    # ── DRIFTER ──────────────────────────────────────────────────────────────
    "Drifter": {
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     1,
            "enemy_warden":   -2,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    2,
            "ally_dynamo":    2,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
    },

    # ── DYNAMO ──────────────────────────────────────────────────────────────
    "Dynamo": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_bebop":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Tank": {
            "ally_abrams":    2,  # double frontline
            "ally_ivy":       2,
            "enemy_lash":     -2,
            "enemy_haze":     -1,
        },
        "CC Ult": {
            "ally_bebop":     4,  # bomb inside Grav Zone = insane
            "ally_seven":     4,  # full Storm Cloud inside Grav Zone
            "ally_mcginnis":  3,  # turrets shred in Grav Zone
            "ally_infernus":  3,  # Flame Dash + DoTs inside Grav Zone
            "ally_grey_talon":3,  # Rain of Arrows inside Grav Zone
            "ally_haze":      3,  # Bullet Hell inside Grav Zone
            "ally_holliday":  3,  # bombs inside Grav Zone
            "ally_wraith":    3,  # Full Auto inside Grav Zone
            "ally_lash":      3,  # Ground Strike into Grav Zone
            "ally_lady_geist":2,
            "ally_yamato":    2,
            "ally_sinclair":  2,
            "enemy_seven":    -2,  # Static Field disrupts close range
            "enemy_kelvin":   -1,  # Blizzard competes for area control
            "enemy_pocket":   -2,  # Pocket Dimension lets ally escape Grav Zone
            "enemy_ivy":      -2,  # Watcher's Covenant lets ally escape Grav Zone
        },
    },

    # ── GRAVES ──────────────────────────────────────────────────────────────
    "Graves": {
        "Gun": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
            "enemy_abrams":   -1,
            "enemy_warden":   -2,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── GREY TALON ──────────────────────────────────────────────────────────
    "Grey Talon": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -4,  # spirit resist devastates spirit GT
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    3,   # stationary targets = free shots
            "ally_kelvin":    3,   # freeze = free shots
            "ally_warden":    2,
            "enemy_drifter":  -2,
            "enemy_haze":     -1,
            "enemy_vindicta": -1,  # mirror sniper duel
        },
        "Sniper": {
            "ally_dynamo":    4,   # Rain of Arrows inside Grav Zone = wipe
            "ally_kelvin":    3,
            "ally_warden":    2,
            "enemy_mcginnis": 2,   # stationary McGinnis is easy to snipe
            "enemy_abrams":   -1,  # high health soaks shots
            "enemy_drifter":  -3,  # mobility makes sniping hard
            "enemy_ivy":      -2,  # aerial evasion
            "enemy_vindicta": -1,
        },
    },

    # ── HAZE ────────────────────────────────────────────────────────────────
    "Haze": {
        "Gun": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
            "enemy_abrams":   -2,
        },
        "Ult": {  # Bullet Hell
            "ally_dynamo":    4,  # Grav Zone + Bullet Hell = guaranteed wipe
            "ally_kelvin":    3,  # freeze = can't move out of ult
            "ally_warden":    3,  # CC = stuck in ult
            "ally_sinclair":  2,  # hex + ult
            "ally_lash":      2,  # Ground Strike into ult
            "enemy_kelvin":   -2, # Arctic Beam shields reduce gun damage
            "enemy_abrams":   -2, # tank absorbs ult
            "enemy_ivy":      -1, # Watcher's Covenant keeps allies alive through ult
            "enemy_pocket":   -2, # Pocket Dimension dodges ult
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,  # Sleep Dart empowered by spirit
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
    },

    # ── HOLLIDAY ────────────────────────────────────────────────────────────
    "Holliday": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Bomb": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "ally_warden":    2,
            "enemy_mcginnis": 3,  # turrets can't dodge bombs
            "enemy_vindicta": -1,
            "enemy_ivy":      -1,
        },
    },

    # ── INFERNUS ────────────────────────────────────────────────────────────
    "Infernus": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Flame Dash": {
            "ally_dynamo":    3,  # Grav Zone = enemies can't dodge dashes
            "ally_kelvin":    -1, # Blizzard blocks dash paths occasionally
            "ally_mcginnis":  -1, # turret walls can block dash routes
            "ally_warden":    2,  # CC = enemies can't escape dash
            "enemy_mcginnis": 4,  # slow/immobile McGinnis = perfect Flame Dash target
            "enemy_kelvin":   1,  # can dash through/around freeze zone
            "enemy_haze":     2,  # sleeping targets can't dodge dash follow-up
            "enemy_vindicta": -3, # flying counters ground-based Flame Dash
            "enemy_grey_talon": -2,# poke damage punishes dash approach
            "enemy_seven":    -2, # silence cancels Flame Dash combos
            "enemy_abrams":   -1, # Siphon Life reduces dash effectiveness
            "enemy_lash":     -1, # Ground Strike interrupts dash
            "enemy_mcginnis": 4,  # duplicate entry resolved: McGinnis is ideal dash target
        },
    },

    # ── IVY ─────────────────────────────────────────────────────────────────
    "Ivy": {
        "Support": {
            "ally_abrams":    3,  # Watcher's Covenant on a tank = massive value
            "ally_dynamo":    3,
            "ally_viscous":   2,
            "ally_warden":    2,
            "ally_kelvin":    2,
            "ally_mo_&_krill":2,
            "ally_pocket":    2,
            "enemy_seven":    -3, # silence shuts down all Ivy abilities
            "enemy_haze":     -2, # sleep disrupts support cast timing
            "enemy_sinclair": -2, # hex/disable shuts down Ivy
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_abrams":   -2,
        },
        "Spirit": {
            "ally_ivy":       1,  # double ivy rare, minor synergy
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── KELVIN ──────────────────────────────────────────────────────────────
    "Kelvin": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
        "Tank": {
            "ally_abrams":    2,
            "ally_ivy":       2,
            "enemy_lash":     -1,
            "enemy_seven":    -1,
        },
        "Beam": {  # Arctic Beam
            "ally_dynamo":    4,  # Grav Zone = can't escape beam
            "ally_bebop":     3,  # frozen = easy hook
            "ally_grey_talon":3,  # frozen = free shots
            "ally_haze":      3,  # frozen = can't escape sleep/ult
            "ally_lash":      3,  # frozen = free Ground Strike
            "ally_abrams":    3,  # frozen = free melee
            "ally_billy":     2,
            "ally_shiv":      3,  # frozen = bleed stacks tick uninterrupted
            "ally_silver":    2,
            "ally_mina":      2,
            "ally_mo_&_krill":2,
            "ally_viscous":   2,
            "enemy_vindicta": -2, # flying limits beam effectiveness
            "enemy_ivy":      -2, # aerial movement escapes beam
            "enemy_haze":     -1, # sleep interrupts beam channeling
            "enemy_seven":    -2, # silence breaks beam
            "enemy_drifter":  -2, # high mobility
            "enemy_infernus": -1, # fire thematic counter
        },
    },

    # ── LADY GEIST ──────────────────────────────────────────────────────────
    "Lady Geist": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    3,  # Grav Zone = Life Drain hits everyone
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Bomb": {  # Essence Bomb
            "ally_dynamo":    3,
            "ally_kelvin":    3,
            "ally_warden":    2,
            "ally_sinclair":  2,
            "enemy_vindicta": -1,
            "enemy_abrams":   -2,  # high health = bomb less effective
            "enemy_viscous":  -2,
        },
    },

    # ── LASH ────────────────────────────────────────────────────────────────
    "Lash": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    3,
            "ally_dynamo":    3,
            "ally_warden":    3,
            "enemy_vindicta": -3,
            "enemy_ivy":      -2,
            "enemy_haze":     -2,
            "enemy_lash":     -1,
        },
        "Ult": {  # Death Slam
            "ally_dynamo":    4,  # Grav Zone + Death Slam = devastating
            "ally_kelvin":    3,
            "ally_warden":    3,
            "ally_ivy":       2,
            "ally_bebop":     2,  # hook pulls target, then slam
            "ally_paradox":   3,  # Paradoxical Swap into Death Slam
            "enemy_seven":    -2,
            "enemy_haze":     -2, # sleep prevents ult activation
            "enemy_mcginnis": 2,  # slow target = easy slam
            "enemy_abrams":   -1,
            "enemy_pocket":   -2, # Pocket Dimension dodges slam
        },
    },

    # ── MCGINNIS ────────────────────────────────────────────────────────────
    "McGinnis": {
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Turret": {
            "ally_dynamo":    4,  # turrets behind Grav Zone = enemy walks into them
            "ally_kelvin":    3,  # freeze = can't destroy turrets
            "ally_warden":    3,  # CC = helpless against turrets
            "ally_seven":     2,  # lightning amplifies turret damage
            "enemy_bebop":    -3, # bombs shred turrets
            "enemy_holliday": -3, # bombs shred turrets
            "enemy_lady_geist": -2,
            "enemy_grey_talon": -2, # sniping turrets from range
            "enemy_vindicta": -2, # flying over turret lines
            "enemy_ivy":      -1,
            "enemy_seven":    -2, # lightning ball hits turrets from range
            "enemy_lash":     -2, # Ground Strike hits multiple turrets
            "enemy_infernus": -2, # Flame Dash bypasses turret line
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── MINA ────────────────────────────────────────────────────────────────
    "Mina": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    3,
            "ally_dynamo":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_ivy":      -2,
            "enemy_lash":     -2,
        },
    },

    # ── MIRAGE ──────────────────────────────────────────────────────────────
    "Mirage": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── MO & KRILL ──────────────────────────────────────────────────────────
    "Mo & Krill": {
        "Tank": {
            "ally_ivy":       3,  # Watcher's Covenant on a tank = great
            "ally_kelvin":    1,
            "ally_celeste":   2,
            "enemy_lash":     -3, # Ground Strike while tunneling = devastating
            "enemy_haze":     -1,
            "enemy_bebop":    -2, # hook interrupts tunnel
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_dynamo":    3,
            "ally_kelvin":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -4,
            "enemy_haze":     -3, # sleep + kiting
            "enemy_ivy":      -2,
            "enemy_lash":     -2,
            "enemy_drifter":  -2,
        },
    },

    # ── PAIGE ───────────────────────────────────────────────────────────────
    "Paige": {
        "Support": {
            "ally_abrams":    2,
            "ally_dynamo":    2,
            "ally_viscous":   2,
            "ally_kelvin":    2,
            "enemy_seven":    -3,
            "enemy_haze":     -2,
            "enemy_sinclair": -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── PARADOX ─────────────────────────────────────────────────────────────
    "Paradox": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Ult": {  # Paradoxical Swap
            "ally_dynamo":    4,  # swap enemy into Grav Zone
            "ally_bebop":     3,  # swap = free hook
            "ally_abrams":    3,  # swap enemy to melee range
            "ally_lash":      3,  # swap = free Ground Strike
            "ally_mo_&_krill":2,
            "ally_shiv":      2,
            "ally_silver":    2,
            "enemy_vindicta": 3,  # swap her out of flight
            "enemy_ivy":      2,  # swap her out of aerial
            "enemy_kelvin":   -1, # may swap Kelvin out of beam position
            "enemy_haze":     -1,
            "enemy_seven":    -2, # silence cancels ult cast
        },
    },

    # ── POCKET ──────────────────────────────────────────────────────────────
    "Pocket": {
        "Tank": {
            "ally_ivy":       2,
            "ally_kelvin":    2,
            "ally_celeste":   2,
            "enemy_lash":     -2,
            "enemy_seven":    -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -4,
            "enemy_seven":    -3,
        },
    },

    # ── REM ─────────────────────────────────────────────────────────────────
    "Rem": {
        "Support": {
            "ally_abrams":    2,
            "ally_dynamo":    2,
            "ally_viscous":   2,
            "enemy_seven":    -3,
            "enemy_haze":     -2,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     1,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    2,
            "ally_dynamo":    2,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
    },

    # ── SEVEN ───────────────────────────────────────────────────────────────
    "Seven": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_dynamo":    3,
            "ally_celeste":   2,
            "enemy_warden":   -4,
            "enemy_seven":    -1,
        },
        "Ult": {  # Storm Cloud
            "ally_dynamo":    5,  # peak synergy: Grav Zone = everyone inside Storm Cloud
            "ally_kelvin":    3,  # freeze = can't leave cloud
            "ally_warden":    3,  # CC = stuck in cloud
            "ally_lash":      2,  # Ground Strike into cloud
            "ally_sinclair":  2,
            "enemy_warden":   -4, # spirit resist devastates Storm Cloud damage
            "enemy_ivy":      -3, # can toss allies out of Storm Cloud
            "enemy_haze":     -2, # sleep prevents ult activation
            "enemy_pocket":   -2, # Pocket Dimension dodges ult
            "enemy_seven":    -1, # mirror
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── SHIV ────────────────────────────────────────────────────────────────
    "Shiv": {
        "Melee": {
            "ally_kelvin":    3,
            "ally_dynamo":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
            "enemy_ivy":      -1,
        },
        "Bleed": {
            "ally_kelvin":    4,  # freeze = bleed stacks tick uninterrupted on frozen target
            "ally_dynamo":    4,  # Grav Zone = can't escape bleed DoT
            "ally_warden":    3,
            "ally_lash":      2,  # Ground Strike applies bleed window
            "enemy_pocket":   -3, # Pocket Dimension cleanses debuffs incl. bleed
            "enemy_abrams":   -2, # high HP = bleed takes forever
            "enemy_kelvin":   2,  # Kelvin has no cleanse
            "enemy_haze":     1,  # sleep doesn't stop bleed ticking
            "enemy_warden":   -2, # may have cleanse
            "enemy_ivy":      -1, # lifesteal offsets bleed
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── SILVER ──────────────────────────────────────────────────────────────
    "Silver": {
        "Melee": {
            "ally_kelvin":    2,
            "ally_dynamo":    2,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
        "Werewolf": {
            "ally_dynamo":    3,
            "ally_kelvin":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_ivy":      -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
            "enemy_kelvin":   -1, # ice blocks movement
            "enemy_mcginnis": -1, # turrets punish slow transformation engage
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── SINCLAIR ────────────────────────────────────────────────────────────
    "Sinclair": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
        "Hex": {  # Spectral Wall / Hex CC build
            "ally_bebop":     3,  # hex + Sticky Bomb combo
            "ally_seven":     3,  # hex + Storm Cloud
            "ally_lash":      3,  # hex + Ground Strike / Death Slam
            "ally_abrams":    2,  # hex + Siphon Life
            "ally_haze":      3,  # hex + Bullet Hell
            "ally_dynamo":    3,  # hex + Grav Zone
            "enemy_seven":    -3, # silence disrupts hex
            "enemy_haze":     -2, # sleep prevents hex activation
            "enemy_pocket":   -2, # Pocket Dimension removes hex
        },
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
    },

    # ── VENATOR ─────────────────────────────────────────────────────────────
    "Venator": {
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     1,
            "ally_dynamo":    2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── VICTOR ──────────────────────────────────────────────────────────────
    "Victor": {
        "Tank": {
            "ally_ivy":       2,
            "ally_kelvin":    2,
            "ally_celeste":   2,
            "enemy_lash":     -2,
            "enemy_seven":    -1,
        },
        "Gun": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
            "enemy_abrams":   -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── VINDICTA ────────────────────────────────────────────────────────────
    "Vindicta": {
        "Gun": {
            "ally_dynamo":    3,  # Grav Zone = stationary targets
            "ally_kelvin":    2,  # freeze = can't dodge
            "ally_warden":    2,
            "enemy_kelvin":   -1,
            "enemy_abrams":   -2,
            "enemy_viscous":  -2,
            "enemy_drifter":  -3, # high mobility
            "enemy_haze":     -1,
            "enemy_infernus": -1,
        },
        "Sniper": {
            "ally_dynamo":    3,
            "ally_kelvin":    3,
            "ally_warden":    2,
            "enemy_drifter":  -3,
            "enemy_ivy":      -2,
            "enemy_mo_&_krill":1,  # underground = vulnerable when surfacing
            "enemy_abrams":   -2,
            "enemy_haze":     -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3,
            "enemy_seven":    -2,
        },
    },

    # ── VISCOUS ─────────────────────────────────────────────────────────────
    "Viscous": {
        "Melee": {
            "ally_dynamo":    3,
            "ally_kelvin":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_ivy":      -2,
        },
        "Tank": {  # Goo Ball
            "ally_ivy":       3,
            "ally_kelvin":    1,
            "ally_celeste":   2,
            "enemy_lash":     -3, # Ground Strike + Goo Ball = bad
            "enemy_abrams":   -1,
            "enemy_bebop":    -2, # hook can interrupt Goo Ball
            "enemy_seven":    -1,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    3,
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
    },

    # ── VYPER ───────────────────────────────────────────────────────────────
    "Vyper": {
        "Gun": {
            "ally_dynamo":    2,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
        },
        "Melee": {
            "ally_kelvin":    2,
            "ally_dynamo":    2,
            "ally_warden":    2,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_lash":     -2,
        },
    },

    # ── WARDEN ──────────────────────────────────────────────────────────────
    "Warden": {
        "Tank": {
            "ally_ivy":       2,
            "ally_kelvin":    2,
            "ally_celeste":   2,
            "enemy_lash":     -2,
            "enemy_seven":    -2,
        },
        "Support": {  # Spirit Shackles aura / CC lockdown
            "ally_abrams":    3,
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "ally_lash":      3,  # CC into Ground Strike
            "ally_shiv":      3,  # CC into Bleed stacks
            "ally_silver":    2,
            "ally_mina":      2,
            "ally_mo_&_krill":2,
            "enemy_haze":     -3,
            "enemy_seven":    -3, # silence shuts down Warden's aura/abilities
            "enemy_pocket":   -2, # Pocket Dimension removes Warden shackles
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "enemy_warden":   -3, # his own spirit resist hurts in mirror
            "enemy_seven":    -2,
        },
    },

    # ── WRAITH ──────────────────────────────────────────────────────────────
    "Wraith": {
        "Gun": {
            "ally_dynamo":    3,
            "ally_kelvin":    2,
            "enemy_viscous":  -2,
            "enemy_kelvin":   -1,
            "enemy_abrams":   -2,
        },
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    2,
            "enemy_warden":   -4,
            "enemy_seven":    -3,
        },
        "Ult": {  # Full Auto
            "ally_dynamo":    4,  # Grav Zone = can't escape Full Auto
            "ally_kelvin":    3,  # freeze = stuck in ult
            "ally_warden":    3,
            "ally_sinclair":  2,
            "enemy_viscous":  -2,
            "enemy_abrams":   -2,
            "enemy_kelvin":   -2,
            "enemy_haze":     -2, # sleep prevents ult activation
            "enemy_pocket":   -2, # Pocket Dimension dodges ult
        },
    },

    # ── YAMATO ──────────────────────────────────────────────────────────────
    "Yamato": {
        "Spirit": {
            "ally_ivy":       2,
            "ally_seven":     2,
            "ally_dynamo":    3,
            "enemy_warden":   -4,
            "enemy_seven":    -2,
        },
        "Melee": {
            "ally_kelvin":    3,
            "ally_dynamo":    3,
            "ally_warden":    3,
            "enemy_vindicta": -4,
            "enemy_grey_talon": -3,
            "enemy_haze":     -2,
            "enemy_ivy":      -2,
        },
        "Ult": {  # Shadow Explosion
            "ally_dynamo":    4,  # Grav Zone = everyone hit by ult
            "ally_kelvin":    3,
            "ally_warden":    3,
            "ally_bebop":     2,
            "enemy_warden":   -4, # spirit resist guts ult
            "enemy_seven":    -2, # silence prevents ult
            "enemy_haze":     -2, # sleep prevents ult
            "enemy_ivy":      -2, # can escape ult with aerial
            "enemy_pocket":   -2, # Pocket Dimension dodges ult
        },
    },
}


def generate_matrix(hero_name):
    n = norm(hero_name)
    builds = BUILDS[hero_name]
    synergy = SYNERGY.get(hero_name, {})

    rows = []

    # Header row: blank A1, then build names
    rows.append([""] + builds)

    # Ally rows
    for other in HEROES:
        other_n = norm(other)
        row = [f"ally_{other_n}"]
        if other_n == n:
            row += [""] * len(builds)  # no self-interaction
        else:
            for build in builds:
                val = synergy.get(build, {}).get(f"ally_{other_n}", "")
                row.append(val)
        rows.append(row)

    # Enemy rows
    for other in HEROES:
        other_n = norm(other)
        row = [f"enemy_{other_n}"]
        if other_n == n:
            row += [""] * len(builds)
        else:
            for build in builds:
                val = synergy.get(build, {}).get(f"enemy_{other_n}", "")
                row.append(val)
        rows.append(row)

    return rows


def main():
    for hero_name in HEROES:
        n = norm(hero_name)
        hero_dir = HEROES_DIR / n
        csv_path = hero_dir / f"matrix_{n}.csv"

        rows = generate_matrix(hero_name)
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(rows)

        builds = BUILDS[hero_name]
        print(f"[{hero_name}] {len(builds)} builds -> {csv_path.name}")

    print(f"\nDone. {len(HEROES)} matrices written.")


if __name__ == "__main__":
    main()
