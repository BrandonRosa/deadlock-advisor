#!/usr/bin/env node
// Deadlock item scraper + auditor.
// Pipeline: fetch ItemData.json → normalize → join to local items → write
// _scrape_cache.json + wiki_audit.md + anomalies.md + baselines/.
//
// Usage:
//   node scripts/wiki_audit.js [--refetch] [--phase=audit|baselines|all]
//
// Default: --phase=all, uses cached raw fetch if present.

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'public', 'tag_generator', 'data');
const ITEMS_DIR = path.join(DATA, 'items');
const BASELINES_DIR = path.join(DATA, 'baselines');
const RAW_CACHE = path.join(ROOT, '_scrape_cache_raw.json');
const NORM_CACHE = path.join(DATA, '_scrape_cache.json');

const WIKI_URL = 'https://deadlock.wiki/index.php?title=Data:ItemData.json&action=raw';

const SLOT_TO_CATEGORY = { Weapon: 'Weapon', Armor: 'Vitality', Tech: 'Spirit' };

// stat → tag mapping. Wiki keys derived from actual observed ItemData.json fields.
// Conditional variants (Ambush*, *BelowThreshold, Fervor*, *PerStack, CloseRange*) ARE included
// here so they contribute to the baseline at their effective (uptime-discounted) value.
const STAT_MAP = {
  ammo:              { wikiKeys: ['BonusClipSizePercent','BonusClipSize','BonusClipPerKill'], tag: 'magazine_size_dependant' },
  bullet_damage_pct: { wikiKeys: ['BaseAttackDamagePercent','WeaponPowerPerStack','CloseRangeBonusWeaponPower','NonPlayerBonusWeaponPower'], tag: 'bullet_damage' },
  melee_damage:      { wikiKeys: ['BonusMeleeDamagePercent','AmbushBonusMeleeDamage'], tag: 'melee_damage' },
  bullet_velocity:   { wikiKeys: ['BonusBulletSpeedPercent'], tag: null },
  fire_rate:         { wikiKeys: ['BonusFireRate','AmbushBonusFireRate','FervorFireRate','FireRatePerKill'], tag: 'fire_rate' },
  bullet_resist:     { wikiKeys: ['BulletResist','BulletResistBelowThreshold','BulletResistPerStack'], tag: 'bullet_resistance' },
  spirit_resist:     { wikiKeys: ['TechResist'], tag: 'spirit_resistance' },
  melee_resist:      { wikiKeys: ['MeleeResistPercent'], tag: 'melee_resistance' },
  debuff_resist:     { wikiKeys: ['StatusResistancePercent','FervorStatusResistancePercent','SlowResistancePercent'], tag: 'debuff_resistance' },
  health:            { wikiKeys: ['BonusHealth'], tag: 'high_max_hp' },
  health_regen:      { wikiKeys: ['BonusHealthRegen','OutOfCombatHealthRegen'], tag: 'self_heal' },
  move_speed:        { wikiKeys: ['BonusMoveSpeed','FervorMovespeed','ActiveBonusMoveSpeed'], tag: 'horizontal_mobility' },
  sprint_speed:      { wikiKeys: ['BonusSprintSpeed'], tag: 'horizontal_mobility' },
  stamina:           { wikiKeys: ['Stamina','BonusStamina'], tag: null },
  cooldown_reduction:{ wikiKeys: ['CooldownReduction','StaminaCooldownReduction'], tag: 'cooldown_reduction' },
  duration_up:       { wikiKeys: ['BonusAbilityDurationPercent','BuffDuration'], tag: 'duration_dependant' },
  range_up:          { wikiKeys: ['TechRangeMultiplier','TechRadiusMultiplier'], tag: 'range_extender_dependant' },
  charge_up:         { wikiKeys: ['BonusAbilityCharges'], tag: 'charge_dependant' },
  spirit_power:      { wikiKeys: ['TechPower','BonusSpirit','SpiritPower','AmbushBonusTechPower'], tag: 'spirit_damage' },
  spirit_power_pct:  { wikiKeys: ['TechPowerPercent'], tag: 'spirit_damage' },
  bullet_lifesteal:  { wikiKeys: ['BulletLifestealPercent','LowHealthLifeStealPercent'], tag: 'bullet_lifesteal' },
  spirit_lifesteal:  { wikiKeys: ['AbilityLifestealPercentHero'], tag: 'spirit_lifesteal' },
  slow:              { wikiKeys: ['SlowPercent','MovementSpeedSlow','FireRateSlow'], tag: 'movement_slow' },
};

const UNMAPPABLE_STATS = Object.entries(STAT_MAP).filter(([_,v]) => v.tag === null).map(([k]) => k);

function fetchRaw() {
  return new Promise((resolve, reject) => {
    https.get(WIKI_URL, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function normName(s) { return String(s).replace(/['‘’]/g, '').trim(); }

function parseUnitValue(v) {
  if (typeof v === 'number') return { value: v, unit: '' };
  if (typeof v !== 'string') return null;
  const m = v.match(/^([\-\d\.]+)([a-zA-Z%]*)$/);
  if (!m) return null;
  return { value: parseFloat(m[1]), unit: m[2] };
}

// Heuristic: keep stat-like fields, drop metadata
const SKIP_FIELDS = new Set([
  'Name','Description','Cost','Tier','Activation','Slot','Components','TargetTypes',
  'ShopFilters','IsDisabled','StreetBrawl','PropertyUpgrades',
  // ambient flags that aren't stats
  'AbilityUnitTargetLimit','AbilityCooldownBetweenCharge','ChannelMoveSpeed',
]);

function extractStats(wikiEntry) {
  const stats = {};
  for (const [k, v] of Object.entries(wikiEntry)) {
    if (SKIP_FIELDS.has(k)) continue;
    if (v == null) continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      // Pull `Value` out of nested objects like CombatBarrier: {Value:300, Scale:{...}}.
      // We promote it to a flat synthetic key "<Original>_Value" so downstream
      // mapping can target it cleanly.
      if (v.Value != null) {
        const parsed = parseUnitValue(v.Value);
        if (parsed) stats[k + '_Value'] = parsed;
      }
      continue;
    }
    const parsed = parseUnitValue(v);
    if (parsed) stats[k] = parsed;
  }
  return stats;
}

function mapWikiKeyToStat(wikiKey) {
  for (const [stat, def] of Object.entries(STAT_MAP)) {
    if (def.wikiKeys.includes(wikiKey)) return stat;
  }
  return null;
}

function tagsForStat(stat) {
  const def = STAT_MAP[stat];
  if (!def || def.tag == null) return [];
  return Array.isArray(def.tag) ? def.tag : [def.tag];
}

// ----- Context (uptime) classification -----
// Each wiki stat field gets classified as one of these contexts. Default = "passive".
// Conditional bonuses get an uptime discount when contributing to baseline distributions
// and trigger synergy-tag suggestions in the audit.
const FIELD_CONTEXTS = [
  { name: 'ambush',        match: /^Ambush(Bonus)?/,                          synergy: ['ult_focused','single_ability_focus'] },
  { name: 'fervor',        match: /^Fervor/,                                  synergy: ['low_max_hp','damage_sponge','scaling_late'] },
  { name: 'lowhp',         match: /BelowThreshold$|^LowHealth/,               synergy: ['low_max_hp','damage_sponge'] },
  { name: 'per_stack',     match: /PerStack$|PerKill$/,                       synergy: ['high_kill_count','scaling_late'] },
  { name: 'damage_window', match: /^DamageWindow$|^DamageThreshold$/,         synergy: ['damage_sponge','low_max_hp'] },
  { name: 'close_range',   match: /^CloseRange/,                              synergy: ['close_range'] },
  { name: 'out_of_combat', match: /^OutOfCombat/,                             synergy: ['farmer','away_from_team'] },
  { name: 'meta',          match: /^FullInvisDistance|^SpottedRadius/,        synergy: [] },
];

// Default uptime discounts applied per context. Per-item Ambush is computed dynamically
// from AmbushDuration / AbilityCooldown.
const DEFAULT_UPTIME = {
  passive:       1.0,
  ambush:        0.15,   // fallback when AmbushDuration / AbilityCooldown can't be computed
  fervor:        0.25,
  lowhp:         0.30,
  per_stack:     0.5,    // assume 50% of MaxStacks on average
  damage_window: 0.40,
  close_range:   0.50,
  out_of_combat: 0.70,
  meta:          0,      // informational fields shouldn't contribute to baselines
};

function classifyField(wikiKey) {
  for (const c of FIELD_CONTEXTS) {
    if (c.match.test(wikiKey)) return { context: c.name, synergy: c.synergy };
  }
  return { context: 'passive', synergy: [] };
}

function computeUptime(context, wikiEntry, wikiKey) {
  if (context === 'ambush') {
    const dur = wikiEntry.AmbushDuration;
    const cd = wikiEntry.AbilityCooldown;
    if (typeof dur === 'number' && typeof cd === 'number' && cd > 0) {
      return Math.min(1, dur / cd);
    }
    return DEFAULT_UPTIME.ambush;
  }
  if (context === 'per_stack') {
    const stacks = wikiEntry.MaxStacks;
    if (typeof stacks === 'number' && stacks > 0) {
      return 0.5 * stacks;   // multiplier: bonus × this gives expected total
    }
    return DEFAULT_UPTIME.per_stack;
  }
  return DEFAULT_UPTIME[context] != null ? DEFAULT_UPTIME[context] : 1.0;
}

// ────────────────────────────────────────────────────────────────────────────
//   Phase J — Item-mechanic translator
//   Rules and corrections from data/mechanic_rules.md (user-reviewed).
// ────────────────────────────────────────────────────────────────────────────

function descClean(desc) {
  // Wiki descriptions contain {g:citadel_inline_attribute:'SpiritDamage'} style markup.
  // Pull the quoted attribute name out (e.g., 'SpiritDamage') before stripping the wrapper,
  // so damage-type routing keywords survive.
  return String(desc || '')
    .replace(/<[^>]+>/g, '')                                  // strip HTML tags
    .replace(/\{g:[^}]*['"]([^'"]+)['"][^}]*\}/g, ' $1 ')     // extract attribute name from {g:...:'NAME'}
    .replace(/\{g:[^}]+\}/g, ' ')                             // strip any remaining {g:...}
    .toLowerCase();
}

function pushMapped(mappedStats, stat, contrib) {
  (mappedStats[stat] = mappedStats[stat] || []).push(contrib);
}
function pushSynergy(synergy, tag, reason) {
  (synergy[tag] = synergy[tag] || []).push(reason);
}

function applyMechanicRules(wikiEntry, mappedStats, synergySuggestions, rawStats) {
  if (!wikiEntry) return;
  const desc = descClean(wikiEntry.Description);
  const activation = wikiEntry.Activation || '';

  // ----- Rule 1 & 2: CombatBarrier / VexBarrierCombatBarrier → resist contribution -----
  for (const barrierKey of ['CombatBarrier_Value', 'VexBarrierCombatBarrier_Value']) {
    const r = rawStats[barrierKey];
    if (!r || !r.value) continue;
    const ruleNum = barrierKey.startsWith('Vex') ? 2 : 1;
    const equivResistPct = r.value * 0.05;   // 300 → 15%
    const uptime = 0.40;
    const effective = Math.round(equivResistPct * uptime * 100) / 100;
    // Routing by trigger damage type in description ("WeaponDamage" is a wiki alias for bullet damage)
    const isBullet = /bulletdamage|bullet damage|weapondamage|weapon damage/.test(desc);
    const isSpirit = /spiritdamage|spirit damage/.test(desc);
    const targets = [];
    if (isBullet && !isSpirit) targets.push('bullet_resist');
    else if (isSpirit && !isBullet) targets.push('spirit_resist');
    else targets.push('bullet_resist', 'spirit_resist');  // 50/50 split
    const splitFactor = targets.length > 1 ? 0.5 : 1.0;
    for (const stat of targets) {
      pushMapped(mappedStats, stat, {
        wiki_key: barrierKey,
        raw: r.value,
        effective: Math.round(effective * splitFactor * 100) / 100,
        unit: '',
        value: r.value,
        context: 'damage_window',
        uptime,
        derived_from_mechanic: `rule_${ruleNum}_barrier`,
      });
    }
    for (const tag of ['damage_sponge', 'low_max_hp', 'escape']) {
      pushSynergy(synergySuggestions, tag, `${barrierKey}=${r.value} (barrier counters engage)`);
    }
  }

  // ----- Rule 3: TotalHealthRegen burst → self_heal contribution + burst/continous heal synergy -----
  const totalRegen = rawStats['TotalHealthRegen_Value'];
  if (totalRegen && totalRegen.value > 0) {
    const cd = wikiEntry.AbilityCooldown && wikiEntry.AbilityCooldown > 0 ? wikiEntry.AbilityCooldown : 30;
    const effective = Math.round((totalRegen.value / cd) * 100) / 100;
    pushMapped(mappedStats, 'health_regen', {
      wiki_key: 'TotalHealthRegen_Value',
      raw: totalRegen.value,
      effective,
      unit: '',
      value: totalRegen.value,
      context: 'passive',
      uptime: 1.0,
      derived_from_mechanic: 'rule_3_total_health_regen',
    });
    // Burst vs continuous distinction
    const isContinuous = /regen|over time|gradually/.test(desc) || (typeof wikiEntry.AbilityDuration === 'number' && wikiEntry.AbilityDuration > 2);
    if (isContinuous) {
      pushSynergy(synergySuggestions, 'continous_heal', `TotalHealthRegen=${totalRegen.value} sustained (duration>${wikiEntry.AbilityDuration || '?'}s or "regen" in desc)`);
    } else {
      pushSynergy(synergySuggestions, 'burst_heal', `TotalHealthRegen=${totalRegen.value} instant cast`);
    }
  }

  // ----- Rule 5: Lifestrike-style lifesteal-on-damage -----
  const lifesteal = rawStats['LifestealHealPercent_Value'];
  if (lifesteal && lifesteal.value > 0) {
    // Bullet vs spirit lifesteal based on description
    const isBullet = /bullet/.test(desc);
    const isSpirit = /spirit|ability/.test(desc);
    const stat = isBullet && !isSpirit ? 'bullet_lifesteal' : (isSpirit && !isBullet ? 'spirit_lifesteal' : 'spirit_lifesteal');
    pushMapped(mappedStats, stat, {
      wiki_key: 'LifestealHealPercent_Value',
      raw: lifesteal.value,
      effective: lifesteal.value,
      unit: '',
      value: lifesteal.value,
      context: 'passive',
      uptime: 1.0,
      derived_from_mechanic: 'rule_5_lifestrike',
    });
  }

  // ----- Rule 6: Stealth/Invis (structured) → sprint_speed + synergies -----
  if (wikiEntry.InvisMoveSpeedMod != null || wikiEntry.FullInvisDistance != null) {
    const dur = wikiEntry.AbilityDuration, cd = wikiEntry.AbilityCooldown;
    const uptime = (typeof dur === 'number' && typeof cd === 'number' && cd > 0) ? Math.min(1, dur / cd) : 0.15;
    // Treat InvisMoveSpeedMod as a sprint_speed contribution with ambush context
    const invisMod = rawStats['InvisMoveSpeedMod'];
    if (invisMod) {
      pushMapped(mappedStats, 'sprint_speed', {
        wiki_key: 'InvisMoveSpeedMod',
        raw: invisMod.value,
        effective: Math.round(invisMod.value * uptime * 100) / 100,
        unit: invisMod.unit,
        value: invisMod.value,
        context: 'ambush',
        uptime,
        derived_from_mechanic: 'rule_6_stealth',
      });
    }
    pushSynergy(synergySuggestions, 'escape', 'stealth active');
    pushSynergy(synergySuggestions, 'away_from_team', 'stealth active');
    pushSynergy(synergySuggestions, 'single_target', 'stealth ambush');
    pushSynergy(synergySuggestions, 'ult_focused', 'stealth (tiny — score ≤0.2)');
    pushSynergy(synergySuggestions, 'engage', 'structured stealth enables engage');
  }

  // ----- Rule 7: Damage / proc-triggered damage → proc-tag synergies -----
  // Heuristic: classify the damage shape and emit appropriate proc tags.
  // Mixed-mechanic items (active+bullet-proc) emit BOTH spirit_burst_proc and gun_continuous_proc.
  const damageFields = [
    ['DPS_Value', 'sustained'],
    ['DamagePerChain_Value', 'bullet_chain'],
    ['DamagePulseAmount_Value', 'sustained'],
    ['Damage_Value', 'single_active'],
    ['DPSMax_Value', 'sustained'],
  ];
  const damageMechanicsPresent = [];
  for (const [key, kind] of damageFields) {
    if (rawStats[key]) damageMechanicsPresent.push({ key, value: rawStats[key].value, kind });
  }
  if (damageMechanicsPresent.length > 0) {
    const isActive = activation === 'InstantCast' || activation === 'Press';
    const isPassive = activation === 'Passive';
    const isBulletProc = wikiEntry.ProcChance != null || damageMechanicsPresent.some(d => d.kind === 'bullet_chain');
    const isDoT = wikiEntry.DotHealthPercent != null || wikiEntry.BuildUpDuration != null || damageMechanicsPresent.some(d => d.kind === 'sustained');
    const damageType = /bulletdamage|bullet damage|weapondamage|weapon damage/.test(desc) ? 'bullet'
                     : /spiritdamage|spirit damage/.test(desc) ? 'spirit' : 'mixed';

    const procTags = new Set();
    if (isPassive && isBulletProc) {
      // Passive bullet-trigger: gun_continuous_proc (no proc-cooldown) or gun_burst_proc (with cooldown)
      if (wikiEntry.ProcCooldown != null && wikiEntry.ProcCooldown > 0.5) procTags.add('gun_burst_proc');
      else procTags.add('gun_continuous_proc');
    }
    if (isActive) {
      procTags.add(damageType === 'bullet' ? 'gun_burst_proc' : 'spirit_burst_proc');
      if (isDoT) procTags.add(damageType === 'bullet' ? 'gun_continuous_proc' : 'spirit_continuous_proc');
    }
    if (isDoT && isPassive && !isActive) {
      procTags.add(damageType === 'bullet' ? 'gun_continuous_proc' : 'spirit_continuous_proc');
    }

    // Mixed-mechanic items: if both active-style and bullet-side trigger fields present, emit both proc families
    if (isActive && isBulletProc) {
      procTags.add('gun_continuous_proc');
    }

    // Explicit user-assigned overrides
    if (wikiEntry.Name === 'Tesla Bullets' || wikiEntry.Name === 'Capacitor') {
      procTags.clear();
      procTags.add('gun_continuous_proc');
    } else if (wikiEntry.Name === 'Spirit Burn') {
      procTags.clear();
      procTags.add('spirit_burst_proc');
      procTags.add('spirit_continuous_proc');  // tiny — flag presence; consumer can apply a small score
    }

    for (const tag of procTags) {
      const reason = damageMechanicsPresent.map(d => `${d.key}=${d.value}`).join(', ');
      pushSynergy(synergySuggestions, tag, `proc-style damage (${reason}, activation=${activation})`);
    }
  }

  // ----- Rule 8: % HP DoT → pure_damage + anti_heal synergies -----
  const dotPct = rawStats['DotHealthPercent'];
  const dotPctValue = wikiEntry.DotHealthPercent;
  if (dotPct || (typeof dotPctValue === 'number' && dotPctValue > 0)) {
    const val = dotPct ? dotPct.value : dotPctValue;
    pushSynergy(synergySuggestions, 'pure_damage', `DotHealthPercent=${val} (%HP DoT)`);
    pushSynergy(synergySuggestions, 'anti_heal', `DotHealthPercent=${val} (DoTs counter heal stacking)`);
  } else if (/\bburn\b|\bpoison\b|\%\s*hp/.test(desc)) {
    pushSynergy(synergySuggestions, 'pure_damage', 'description mentions burn/poison/%HP');
    pushSynergy(synergySuggestions, 'anti_heal', 'description implies DoT (counters heals)');
  }

  // ----- Rule 9: Description-keyword fallbacks (no structured field present) -----
  // Each keyword adds synergy tag(s). cc_resist is a low-value suggestion.
  const kwRules = [
    { kw: /\bslow(?!ed)/, tags: ['movement_slow'], lowCc: true },
    { kw: /\bsilence/, tags: ['silence'], lowCc: true },
    { kw: /\bstun/, tags: ['stun'], lowCc: true },
    { kw: /\bdisarm/, tags: ['disarm'], lowCc: false },
    { kw: /\bbarrier|\bshield/, tags: ['damage_sponge', 'low_max_hp', 'escape'], lowCc: false },
    { kw: /\bstealth|\binvisible/, tags: ['escape', 'single_target'], lowCc: false },
    { kw: /\banti[-\s]?heal|\bheal\s*reduc/, tags: ['anti_heal'], lowCc: false },
    { kw: /\bheadshot/, tags: ['headshot_damage'], lowCc: false },
    { kw: /\bmelee/, tags: ['melee_damage'], lowCc: false },
  ];
  for (const rule of kwRules) {
    if (rule.kw.test(desc)) {
      for (const tag of rule.tags) {
        pushSynergy(synergySuggestions, tag, `description contains "${rule.kw.source}"`);
      }
      if (rule.lowCc) pushSynergy(synergySuggestions, 'cc_resist', `description applies CC ("${rule.kw.source}") — low-value suggestion`);
    }
  }

  // ----- Rule 10: HealOnVeil → health_regen + burst_heal -----
  const veilHeal = rawStats['HealOnVeil_Value'];
  if (veilHeal && veilHeal.value > 0) {
    const effective = Math.round(veilHeal.value * 0.30 * 100) / 100;
    pushMapped(mappedStats, 'health_regen', {
      wiki_key: 'HealOnVeil_Value',
      raw: veilHeal.value,
      effective,
      unit: '',
      value: veilHeal.value,
      context: 'out_of_combat',
      uptime: 0.30,
      derived_from_mechanic: 'rule_10_heal_on_veil',
    });
    for (const tag of ['farmer', 'away_from_team', 'escape', 'burst_heal']) {
      pushSynergy(synergySuggestions, tag, `HealOnVeil=${veilHeal.value}`);
    }
  }

  // ----- Rule 11: HealPercentPerHeadshot (Headhunter) -----
  const headshotHeal = rawStats['HealPercentPerHeadshot_Value'];
  if (headshotHeal && headshotHeal.value > 0) {
    pushSynergy(synergySuggestions, 'self_heal', `HealPercentPerHeadshot=${headshotHeal.value}`);
    pushSynergy(synergySuggestions, 'burst_heal', `HealPercentPerHeadshot=${headshotHeal.value} (per-shot instant)`);
    pushSynergy(synergySuggestions, 'continous_heal', `HealPercentPerHeadshot=${headshotHeal.value} (sustained if firing rate keeps trigger uptime)`);
    pushSynergy(synergySuggestions, 'bullet_lifesteal', `HealPercentPerHeadshot=${headshotHeal.value} (functionally lifesteal on headshot)`);
    pushSynergy(synergySuggestions, 'headshot_damage', `HealPercentPerHeadshot=${headshotHeal.value}`);
  }
}

// =================================================================
// PHASE B — fetch + normalize
// =================================================================

async function phaseB({ refetch }) {
  let rawText;
  if (refetch || !fs.existsSync(RAW_CACHE)) {
    console.log('Fetching wiki data...');
    rawText = await fetchRaw();
    fs.writeFileSync(RAW_CACHE, rawText);
  } else {
    rawText = fs.readFileSync(RAW_CACHE, 'utf8');
  }
  const wiki = JSON.parse(rawText);

  // Build wiki-by-name (apostrophe-normalized). Track Streetbrawl-only separately.
  const wikiByName = {};
  const wikiStreetbrawlByName = {};
  for (const codename of Object.keys(wiki)) {
    const w = wiki[codename];
    if (w.IsDisabled || !w.Name) continue;
    if (w.StreetBrawl) {
      // Track Streetbrawl-only entries separately so local items pointing here can be flagged
      wikiStreetbrawlByName[normName(w.Name)] = { codename, raw: w };
      continue;
    }
    if (w.Cost == null) continue;
    wikiByName[normName(w.Name)] = { codename, raw: w };
  }

  // Load local items
  const localFiles = fs.readdirSync(ITEMS_DIR).filter(f => f.endsWith('.json'));
  const items = [];
  for (const f of localFiles) {
    const local = JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, f), 'utf8'));
    const nn = normName(local.name);
    const wikiMatch = wikiByName[nn];
    const streetbrawlOnly = !wikiMatch && !!wikiStreetbrawlByName[nn];
    items.push({ local, wikiMatch, streetbrawlOnly });
  }

  // Build the index of which wiki keys map to which stat (across all matched items)
  const allWikiKeysSeen = new Set();
  const normalized = [];

  for (const { local, wikiMatch, streetbrawlOnly } of items) {
    let stats = {};
    let unmapped = [];
    let mappedStats = {};        // stat → [{wiki_key, raw, effective, unit, context, uptime, synergy}]
    let synergySuggestions = {}; // tag → [reasons]

    if (wikiMatch) {
      stats = extractStats(wikiMatch.raw);
      for (const k of Object.keys(stats)) {
        allWikiKeysSeen.add(k);
        const { context, synergy } = classifyField(k);
        const uptime = computeUptime(context, wikiMatch.raw, k);
        const raw = stats[k].value;
        const effective = raw * uptime;
        const stat = mapWikiKeyToStat(k);

        if (stat) {
          mappedStats[stat] = mappedStats[stat] || [];
          mappedStats[stat].push({
            wiki_key: k,
            raw,
            effective: Math.round(effective * 100) / 100,
            unit: stats[k].unit,
            value: stats[k].value,
            context,
            uptime: Math.round(uptime * 100) / 100,
          });
        } else {
          unmapped.push(k);
        }

        // Collect synergy suggestions from conditional fields
        if (context !== 'passive' && context !== 'meta') {
          for (const tag of synergy) {
            (synergySuggestions[tag] = synergySuggestions[tag] || []).push(
              `${k}=${raw}${stats[k].unit} (${context}, uptime≈${Math.round(uptime*100)/100})`
            );
          }
        }
      }

      // Phase J: run mechanic-translator rules to add item-level interpretations
      // (barriers, lifesteal, heal classification, proc tagging, %HP DoT, keyword fallbacks).
      applyMechanicRules(wikiMatch.raw, mappedStats, synergySuggestions, stats);
    }

    normalized.push({
      key: local.normalized_name,
      name: local.name,
      category: local.category,
      tier: local.tier,
      tier_num: { 800:1, 1600:2, 3200:3, 6400:4 }[local.tier] || 0,
      has_wiki_entry: !!wikiMatch,
      streetbrawl_only: streetbrawlOnly,
      wiki_codename: wikiMatch ? wikiMatch.codename : null,
      wiki_slot: wikiMatch ? wikiMatch.raw.Slot : null,
      wiki_activation: wikiMatch ? wikiMatch.raw.Activation : null,
      raw_stats: stats,
      mapped_stats: mappedStats,
      unmapped_wiki_keys: unmapped,
      synergy_suggestions: synergySuggestions,
      playstyle_score: local.values && local.values.playstyle_score || {},
    });
  }

  // Wiki-only items (no local file)
  const localNames = new Set(items.map(i => normName(i.local.name)));
  const wikiExtras = [];
  for (const name of Object.keys(wikiByName)) {
    if (!localNames.has(name)) wikiExtras.push(wikiByName[name]);
  }

  fs.writeFileSync(NORM_CACHE, JSON.stringify({
    generated_at: new Date().toISOString(),
    items: normalized,
    wiki_extras: wikiExtras.map(w => ({ codename: w.codename, name: w.raw.Name, cost: w.raw.Cost, slot: w.raw.Slot })),
    all_wiki_stat_keys_seen: [...allWikiKeysSeen].sort(),
  }, null, 2));

  console.log(`Normalized ${normalized.length} local items (${normalized.filter(n=>n.has_wiki_entry).length} matched to wiki).`);
  console.log(`Wiki extras (no local file): ${wikiExtras.length}`);
  console.log(`Unique wiki stat keys observed: ${allWikiKeysSeen.size}`);

  return JSON.parse(fs.readFileSync(NORM_CACHE, 'utf8'));
}

// =================================================================
// PHASE C — audit doc
// =================================================================

function fmtStatValue(s) {
  const u = s.unit || '';
  const sign = s.value > 0 ? '+' : '';
  return `${sign}${s.value}${u}`;
}

function phaseC(norm) {
  const groups = {}; // "Weapon-800" → [items]
  for (const it of norm.items) {
    const key = `${it.category}-${it.tier}`;
    (groups[key] = groups[key] || []).push(it);
  }

  const CATEGORY_ORDER = ['Weapon','Vitality','Spirit'];
  const TIER_ORDER = [800,1600,3200,6400];

  // Item is "needs review" if:
  // - has wiki entry AND any non-trivial wiki stat lacks a non-null playstyle_score for its mapped tag
  // - OR <3 non-null entries in playstyle_score
  // - OR no wiki entry (fallback / manual)
  function classify(it) {
    if (it.streetbrawl_only) return { flag: 'streetbrawl', reason: 'Streetbrawl-only item — not in standard game. Consider removing from `data/items/` or moving to a streetbrawl subfolder.' };
    if (!it.has_wiki_entry) return { flag: 'no_wiki', reason: 'No wiki ItemData entry — manual stats required.' };

    const nonNullScores = Object.entries(it.playstyle_score).filter(([_,v]) => v != null);
    const gaps = [];
    const synergyGaps = [];

    for (const [stat, rawList] of Object.entries(it.mapped_stats)) {
      const def = STAT_MAP[stat];
      if (def.tag == null) {
        gaps.push({ stat, raw: rawList.map(r => `${r.wiki_key}=${fmtStatValue(r)}`).join(', '), reason: 'unmappable (no tag exists)' });
        continue;
      }
      const tags = tagsForStat(stat);
      const anyScored = tags.some(t => it.playstyle_score[t] != null && it.playstyle_score[t] !== 0);
      if (!anyScored) {
        gaps.push({ stat, raw: rawList.map(r => `${r.wiki_key}=${fmtStatValue(r)}`).join(', '), reason: `expected tag(s) ${tags.join('/')} are null/zero` });
      }
    }

    // Synergy-tag gaps: conditional bonuses imply this item should score on certain tags
    // (low-HP gated bonuses → low_max_hp / damage_sponge, ambush → ult_focused, etc.)
    for (const [tag, reasons] of Object.entries(it.synergy_suggestions || {})) {
      const v = it.playstyle_score[tag];
      if (v == null || v === 0) {
        synergyGaps.push({ tag, reasons });
      }
    }

    const fewScores = nonNullScores.length < 3;
    if (gaps.length || synergyGaps.length || fewScores) {
      return { flag: 'review', gaps, synergyGaps, fewScores, nonNullCount: nonNullScores.length };
    }
    return { flag: 'clean' };
  }

  // Sort within each group by name
  for (const k of Object.keys(groups)) {
    groups[k].sort((a,b) => a.name.localeCompare(b.name));
  }

  const lines = [];
  lines.push('# Deadlock Item Audit');
  lines.push('');
  lines.push(`Generated: ${norm.generated_at}`);
  lines.push('');
  lines.push('Source: `Data:ItemData.json` (Default mode only — Streetbrawl / Enhanced ignored).');
  lines.push('');
  lines.push('## Index');
  lines.push('');
  for (const cat of CATEGORY_ORDER) {
    for (const t of TIER_ORDER) {
      const g = groups[`${cat}-${t}`] || [];
      const tierLabel = `T${TIER_ORDER.indexOf(t)+1}`;
      lines.push(`- [${cat} — ${tierLabel} (${t} souls)](#${cat.toLowerCase()}--${tierLabel.toLowerCase()}-${t}-souls) — ${g.length} items`);
    }
  }
  lines.push('');

  for (const cat of CATEGORY_ORDER) {
    for (const t of TIER_ORDER) {
      const g = groups[`${cat}-${t}`] || [];
      if (g.length === 0) continue;
      const tierLabel = `T${TIER_ORDER.indexOf(t)+1}`;
      lines.push(`## ${cat} — ${tierLabel} (${t} souls)`);
      lines.push('');

      const reviewed = g.map(it => ({ it, cls: classify(it) }));
      const needsReview = reviewed.filter(r => r.cls.flag !== 'clean');
      const clean = reviewed.filter(r => r.cls.flag === 'clean');

      if (needsReview.length > 0) {
        lines.push('### Items needing review');
        lines.push('');
        for (const { it, cls } of needsReview) {
          const wikiUrl = `https://deadlock.wiki/${it.name.replace(/ /g, '_')}`;
          lines.push(`#### ${it.name}`);
          lines.push('');
          lines.push(`- **Wiki**: ${wikiUrl}`);
          if (cls.flag === 'streetbrawl' || cls.flag === 'no_wiki') {
            lines.push(`- **Status**: ⚠ ${cls.reason}`);
            const psCount = Object.values(it.playstyle_score).filter(v => v != null).length;
            lines.push(`- **playstyle_score**: ${psCount} non-null entries`);
          } else {
            // Build a flat map keyed by wiki field showing its context + effective value
            const contextByKey = {};
            for (const [stat, rawList] of Object.entries(it.mapped_stats)) {
              for (const r of rawList) contextByKey[r.wiki_key] = r;
            }
            const allWikiStats = Object.entries(it.raw_stats);
            if (allWikiStats.length > 0) {
              lines.push(`- **Raw stats (Default)**:`);
              for (const [k,v] of allWikiStats) {
                const ctx = contextByKey[k];
                if (ctx && ctx.context && ctx.context !== 'passive') {
                  lines.push(`  - ${k}: ${fmtStatValue(v)} — *${ctx.context}, uptime≈${ctx.uptime}, effective ${ctx.effective}${v.unit}*`);
                } else {
                  lines.push(`  - ${k}: ${fmtStatValue(v)}`);
                }
              }
            }
            const ps = Object.entries(it.playstyle_score).filter(([_,v]) => v != null);
            if (ps.length > 0) {
              lines.push(`- **playstyle_score** (non-null):`);
              for (const [k,v] of ps) lines.push(`  - \`${k}: ${v}\``);
            }
            if (cls.fewScores) {
              lines.push(`- **Missing-stat**: only ${cls.nonNullCount} non-null tags scored`);
            }
            if (cls.gaps && cls.gaps.length > 0) {
              lines.push(`- **Stat gaps**:`);
              for (const gap of cls.gaps) {
                lines.push(`  - ⚠ ${gap.stat} (${gap.raw}) — ${gap.reason}`);
              }
            }
            if (cls.synergyGaps && cls.synergyGaps.length > 0) {
              lines.push(`- **Synergy gaps** (conditional bonuses imply these tags should be scored):`);
              for (const sg of cls.synergyGaps) {
                lines.push(`  - ⚠ \`${sg.tag}\` is null/zero — implied by: ${sg.reasons.join('; ')}`);
              }
            }
          }
          lines.push('');
        }
      }

      if (clean.length > 0) {
        lines.push(`### Reviewed clean (${clean.length} items)`);
        lines.push('');
        lines.push(clean.map(r => r.it.name).join(', '));
        lines.push('');
      }
    }
  }

  // Streetbrawl-only section (items in local data/items but only present in wiki as StreetBrawl=true)
  const streetbrawlItems = norm.items.filter(it => it.streetbrawl_only);
  if (streetbrawlItems.length > 0) {
    lines.push(`## Streetbrawl-only items (${streetbrawlItems.length})`);
    lines.push('');
    lines.push('These items exist in `data/items/` (tier 9999) but in `Data:ItemData.json` they are flagged `StreetBrawl: true`, meaning they only appear in Streetbrawl mode. They are filtered out of normal builds via `tier !== 9999` in the algorithm. Consider moving them to a `data/items/streetbrawl/` subfolder for hygiene.');
    lines.push('');
    streetbrawlItems.sort((a,b) => a.name.localeCompare(b.name));
    for (const it of streetbrawlItems) {
      lines.push(`- **${it.name}** (${it.category}) — https://deadlock.wiki/${it.name.replace(/ /g, '_')}`);
    }
    lines.push('');
  }

  // Wiki extras section
  if (norm.wiki_extras.length > 0) {
    lines.push('## Wiki entries with no local file');
    lines.push('');
    for (const x of norm.wiki_extras) {
      lines.push(`- **${x.name}** (codename: \`${x.codename}\`, slot: ${x.slot}, cost: ${x.cost})`);
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(DATA, 'wiki_audit.md'), lines.join('\n'));
  console.log('Wrote wiki_audit.md');
}

// =================================================================
// PHASE D — baseline derivation
// =================================================================

function phaseD(norm) {
  // Cross-tier-anchored percentile binning.
  //   Score 1.0 = "high for this tier"   → tier's 50th percentile of raw values
  //   Score 1.5 = "very good for this tier" → tier's 75th percentile
  //   Score 2.0 = "best in the entire game for this stat" → only populated if
  //               tierMax ≥ globalMax * 0.95 (this tier contains the game-best provider)
  //
  // The output also captures `current_score_at_band` (mean playstyle_score of items
  // in each percentile bucket) so miscalibrations are visible.
  function percentile(sortedAsc, p) {
    if (sortedAsc.length === 0) return null;
    if (sortedAsc.length === 1) return sortedAsc[0];
    const idx = (sortedAsc.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sortedAsc[lo];
    return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
  }
  function mean(arr) { return arr.length === 0 ? 0 : arr.reduce((a,b)=>a+b,0)/arr.length; }
  function round(x, p=2) { const f=Math.pow(10,p); return Math.round(x*f)/f; }

  const baselines = {};

  // First pass: gather samples per (stat, tier) and compute globalMax per stat
  const samplesByStatTier = {};
  const globalMaxByStat = {};

  for (const [stat, def] of Object.entries(STAT_MAP)) {
    if (def.tag == null) continue;
    samplesByStatTier[stat] = {};
    let globalMax = 0;

    for (const tier of [800, 1600, 3200, 6400]) {
      const samples = [];
      for (const it of norm.items) {
        if (it.tier !== tier) continue;
        if (!it.mapped_stats[stat]) continue;
        // Effective sum: each contribution discounted by its uptime context (passive=1.0,
        // ambush=duration/cooldown, lowhp=0.30, per_stack=0.5×MaxStacks, etc.)
        const rawSum = it.mapped_stats[stat].reduce((s, r) => s + r.raw, 0);
        const effSum = it.mapped_stats[stat].reduce((s, r) => s + (r.effective != null ? r.effective : r.raw), 0);
        if (effSum === 0) continue;
        const tags = tagsForStat(stat);
        const currentScore = tags.reduce((m, t) => {
          const v = it.playstyle_score[t];
          return v != null && v > m ? v : m;
        }, 0);
        // Detect whether any conditional contribution was applied so the audit can
        // distinguish raw vs effective in the samples list.
        const hasConditional = it.mapped_stats[stat].some(r => r.context && r.context !== 'passive');
        samples.push({
          name: it.name,
          raw: rawSum,
          effective: Math.round(effSum * 100) / 100,
          has_conditional: hasConditional,
          current_score: currentScore,
          unit: it.mapped_stats[stat][0].unit,
        });
        if (Math.abs(effSum) > globalMax) globalMax = Math.abs(effSum);
      }
      samplesByStatTier[stat][tier] = samples;
    }
    globalMaxByStat[stat] = globalMax;
  }

  // Second pass: compute bands per (stat, tier)
  for (const [stat, byTier] of Object.entries(samplesByStatTier)) {
    baselines[stat] = { global_max: round(globalMaxByStat[stat]) };

    for (const tier of [800, 1600, 3200, 6400]) {
      const samples = byTier[tier];
      const tierKey = `tier_${tier}`;

      if (samples.length < 2) {
        // Defer: sparse buckets are filled by phaseH cross-tier interpolation below.
        baselines[stat][tierKey] = {
          sparse: true,
          n: samples.length,
          samples: samples.map(s => `${s.name}: raw=${s.raw}${s.unit} eff=${s.effective}${s.unit} (cur_score=${s.current_score})`),
          single_sample: samples[0] || null,
        };
        continue;
      }

      // Use effective values (uptime-discounted) for the distribution.
      const sortedVals = samples.map(s => s.effective).sort((a, b) => a - b);
      const unit = samples[0].unit;
      const p50 = percentile(sortedVals, 0.50);
      const p75 = percentile(sortedVals, 0.75);
      const tierMax = sortedVals[sortedVals.length - 1];
      const isGameBest = Math.abs(tierMax) >= globalMaxByStat[stat] * 0.95;

      // Current_score at each band: mean playstyle_score of items in the relevant percentile bucket
      const bucketAt = (loP, hiP) => samples.filter(s => {
        const rank = sortedVals.indexOf(s.effective) / (sortedVals.length - 1);
        return rank >= loP && rank <= hiP;
      });
      const at50 = bucketAt(0.40, 0.60);
      const at75 = bucketAt(0.65, 0.85);
      const atMax = bucketAt(0.95, 1.00);

      baselines[stat][tierKey] = {
        n: samples.length,
        unit,
        bands: {
          '1.0': {
            raw: round(p50),
            percentile: 50,
            current_score_at_band: {
              mean: round(mean(at50.map(s=>s.current_score))),
              items: at50.map(s => `${s.name}=${s.raw}${s.unit} (cur=${s.current_score})`),
            },
          },
          '1.5': {
            raw: round(p75),
            percentile: 75,
            current_score_at_band: {
              mean: round(mean(at75.map(s=>s.current_score))),
              items: at75.map(s => `${s.name}=${s.raw}${s.unit} (cur=${s.current_score})`),
            },
          },
          '2.0': isGameBest ? {
            raw: round(tierMax),
            percentile: 100,
            current_score_at_band: {
              mean: round(mean(atMax.map(s=>s.current_score))),
              items: atMax.map(s => `${s.name}=${s.raw}${s.unit} (cur=${s.current_score})`),
            },
          } : {
            not_best_in_game: true,
            tier_max: round(tierMax),
            game_max: round(globalMaxByStat[stat]),
            note: 'this tier does not contain the game-best provider; a higher tier exists',
          },
        },
        distribution: {
          min: round(sortedVals[0]),
          median: round(p50),
          max: round(tierMax),
        },
        samples: samples.map(s => ({
          name: s.name,
          raw: s.raw,
          effective: s.effective,
          has_conditional: s.has_conditional,
          unit: s.unit,
          current_score: s.current_score,
        })),
      };
    }
  }

  // ---- Phase H: cross-tier interpolation for sparse buckets ----
  // For each stat, derive a per-stat tier-to-tier ratio when both neighbors have ≥2 samples.
  // Also derive a global default ratio (median across stats) so isolated samples can still
  // be projected when nothing else is available.
  const TIER_ORDER = [800, 1600, 3200, 6400];
  const allRatios = [];                    // global pool for default ratio
  const ratiosByStat = {};

  for (const [stat, byTier] of Object.entries(baselines)) {
    ratiosByStat[stat] = [];
    for (let i = 0; i < TIER_ORDER.length - 1; i++) {
      const a = byTier[`tier_${TIER_ORDER[i]}`];
      const b = byTier[`tier_${TIER_ORDER[i+1]}`];
      if (!a || !b) continue;
      if (a.sparse || b.sparse || a.insufficient_data || b.insufficient_data) continue;
      if (a.bands && b.bands && a.bands['1.0'] && b.bands['1.0']) {
        const ra = a.bands['1.0'].raw, rb = b.bands['1.0'].raw;
        if (ra > 0 && rb > 0) {
          const r = rb / ra;
          ratiosByStat[stat].push({ from: TIER_ORDER[i], to: TIER_ORDER[i+1], ratio: r });
          allRatios.push(r);
        }
      }
    }
  }
  const globalRatio = allRatios.length === 0 ? 1.5
    : (allRatios.slice().sort((a,b)=>a-b))[Math.floor(allRatios.length / 2)];

  function fillSparse(stat, tier) {
    const tierKey = `tier_${tier}`;
    const slot = baselines[stat][tierKey];
    if (!slot || !slot.sparse) return;
    const sample = slot.single_sample;
    if (!sample) {
      baselines[stat][tierKey] = { insufficient_data: true, n: 0 };
      return;
    }
    // Find a neighbor tier with bands; use the per-stat ratio if possible, else global.
    let usedRatio = globalRatio;
    const i = TIER_ORDER.indexOf(tier);
    for (const otherIdx of [i-1, i+1, i-2, i+2]) {
      if (otherIdx < 0 || otherIdx >= TIER_ORDER.length) continue;
      const ot = TIER_ORDER[otherIdx];
      const otherSlot = baselines[stat][`tier_${ot}`];
      if (otherSlot && otherSlot.bands && otherSlot.bands['1.0'] && otherSlot.bands['1.0'].raw > 0) {
        // Per-stat ratio between i and otherIdx
        const direction = Math.sign(i - otherIdx);
        const baseRaw = otherSlot.bands['1.0'].raw;
        const steps = Math.abs(i - otherIdx);
        const perStatRatios = ratiosByStat[stat];
        const useR = perStatRatios && perStatRatios.length > 0
          ? (perStatRatios.reduce((s,x)=>s+x.ratio,0) / perStatRatios.length)
          : globalRatio;
        usedRatio = useR;
        // Scale base toward our tier
        const projectedP50 = direction > 0
          ? baseRaw * Math.pow(useR, steps)        // we're at higher tier
          : baseRaw / Math.pow(useR, steps);       // we're at lower tier
        // Sanity: anchor on observed sample but blend toward projection
        const anchor = sample.effective;
        const p50 = round((anchor + projectedP50) / 2);
        const p75 = round(p50 * 1.10);
        const isGameBest = Math.abs(p50) >= globalMaxByStat[stat] * 0.95;
        baselines[stat][tierKey] = {
          n: 1,
          unit: sample.unit,
          derivation: 'extrapolated_from_neighbor',
          anchor: { name: sample.name, raw: sample.raw, effective: sample.effective },
          ratio_used: round(useR),
          neighbor_tier: ot,
          bands: {
            '1.0': { raw: p50, percentile: 50, derived: true },
            '1.5': { raw: p75, percentile: 75, derived: true },
            '2.0': isGameBest
              ? { raw: round(anchor), percentile: 100, derived: true }
              : { not_best_in_game: true, tier_max: round(anchor), game_max: round(globalMaxByStat[stat]) },
          },
          distribution: { min: sample.effective, median: p50, max: sample.effective },
          samples: [{ name: sample.name, raw: sample.raw, effective: sample.effective, unit: sample.unit, current_score: sample.current_score }],
        };
        return;
      }
    }
    // No neighbors at all → fall back to just the single sample as 1.0 anchor
    baselines[stat][tierKey] = {
      n: 1,
      unit: sample.unit,
      derivation: 'single_sample_no_neighbor',
      anchor: { name: sample.name, raw: sample.raw, effective: sample.effective },
      bands: {
        '1.0': { raw: round(sample.effective), percentile: 50, derived: true },
        '1.5': { raw: round(sample.effective * 1.10), percentile: 75, derived: true },
        '2.0': { not_best_in_game: true, tier_max: round(sample.effective), game_max: round(globalMaxByStat[stat]) },
      },
      distribution: { min: sample.effective, median: round(sample.effective), max: sample.effective },
      samples: [{ name: sample.name, raw: sample.raw, effective: sample.effective, unit: sample.unit, current_score: sample.current_score }],
    };
  }

  for (const stat of Object.keys(baselines)) {
    for (const tier of TIER_ORDER) fillSparse(stat, tier);
  }

  const table = {
    generated_at: new Date().toISOString(),
    source: 'Data:ItemData.json (Default mode only)',
    methodology: {
      score_semantics: '1.0=high-for-tier (p50), 1.5=very-good-for-tier (p75), 2.0=best-in-game (cross-tier)',
      effective_value: 'raw × uptime; conditional bonuses are discounted (lowhp=0.30, ambush=duration/cooldown, per_stack=0.5×MaxStacks, etc.)',
      sparse_handling: 'tiers with 1 sample are extrapolated using the per-stat (or global) tier-to-tier ratio; flagged with derivation: extrapolated_from_neighbor',
    },
    stat_to_tag_mapping: Object.fromEntries(Object.entries(STAT_MAP).map(([k,v]) => [k, { wiki_keys: v.wikiKeys, tag: v.tag }])),
    global_tier_ratio: round(globalRatio),
    baselines,
    unmappable_stats: UNMAPPABLE_STATS,
  };
  fs.writeFileSync(path.join(BASELINES_DIR, '_baseline_table.json'), JSON.stringify(table, null, 2));
  console.log('Wrote _baseline_table.json (global_tier_ratio=' + round(globalRatio) + ')');
  return table;
}

// =================================================================
// PHASE E — synthetic items
// =================================================================

function phaseE(table) {
  // Category per stat — which slot most commonly carries it.
  const STAT_CATEGORY = {
    ammo: 'Weapon', bullet_damage_pct: 'Weapon', melee_damage: 'Weapon',
    fire_rate: 'Weapon', bullet_lifesteal: 'Weapon',
    bullet_resist: 'Vitality', spirit_resist: 'Vitality', melee_resist: 'Vitality',
    debuff_resist: 'Vitality', health: 'Vitality', health_regen: 'Vitality',
    move_speed: 'Vitality', sprint_speed: 'Vitality',
    cooldown_reduction: 'Spirit', duration_up: 'Spirit', range_up: 'Spirit',
    charge_up: 'Spirit', spirit_power: 'Spirit', spirit_power_pct: 'Spirit',
    spirit_lifesteal: 'Spirit', slow: 'Spirit',
  };

  // Wipe old baselines (except _baseline_table.json)
  for (const f of fs.readdirSync(BASELINES_DIR)) {
    if (f.startsWith('_bl_')) fs.unlinkSync(path.join(BASELINES_DIR, f));
  }

  let written = 0;
  for (const [stat, byTier] of Object.entries(table.baselines)) {
    const cat = STAT_CATEGORY[stat];
    if (!cat) continue;
    for (const [tierKey, info] of Object.entries(byTier)) {
      if (tierKey === 'global_max') continue;
      if (info.insufficient_data) continue;
      const tier = parseInt(tierKey.replace('tier_',''), 10);
      if (!info.bands) continue;
      const tierNum = { 800:1, 1600:2, 3200:3, 6400:4 }[tier];
      const tags = tagsForStat(stat);

      for (const [band, bandInfo] of Object.entries(info.bands)) {
        if (bandInfo.not_best_in_game) continue;   // skip score 2.0 if not game-best
        const score = parseFloat(band);
        const playstyle_score = {};
        for (const t of tags) playstyle_score[t] = score;

        const norm = `_bl_t${tierNum}_${stat}_${band.replace('.','_')}`;
        const raw = `${bandInfo.raw>0?'+':''}${bandInfo.raw}${info.unit}`;
        const synthItem = {
          name: `[Baseline] T${tierNum} ${stat} @${band}`,
          normalized_name: norm,
          category: cat,
          tier,
          synthetic: true,
          baseline_meta: {
            stat,
            raw_value: raw,
            score_band: score,
            percentile: bandInfo.percentile,
            sample_count: info.n,
            derivation: info.derivation || (bandInfo.derived ? 'extrapolated' : 'measured'),
            tier_distribution: info.distribution,
          },
          upgrades_from: [],
          values: { playstyle_score },
          wiki_url: null,
        };
        fs.writeFileSync(path.join(BASELINES_DIR, norm + '.json'), JSON.stringify(synthItem, null, 2));
        written++;
      }
    }
  }
  console.log(`Wrote ${written} synthetic baseline items.`);
}

// =================================================================
// PHASE F — anomalies report
// =================================================================

function phaseF(norm) {
  const lines = [];
  lines.push('# Item Anomaly Report');
  lines.push('');
  lines.push(`Generated: ${norm.generated_at}`);
  lines.push('');
  lines.push('## 1. Semantic mismatches');
  lines.push('');
  lines.push('Items where a Default-mode wiki stat has no corresponding non-null `playstyle_score` tag.');
  lines.push('');

  const high = [], medium = [], low = [];

  for (const it of norm.items) {
    if (!it.has_wiki_entry) continue;
    for (const [stat, rawList] of Object.entries(it.mapped_stats)) {
      const def = STAT_MAP[stat];
      if (def.tag == null) continue;
      const tags = tagsForStat(stat);
      const anyScored = tags.some(t => it.playstyle_score[t] != null && it.playstyle_score[t] !== 0);
      if (anyScored) continue;
      const severity = Array.isArray(def.tag) ? 'medium' : 'high';
      const entry = { name: it.name, tier: it.tier, category: it.category, stat, tags, raw: rawList.map(r => `${r.wiki_key}=${fmtStatValue(r)}`).join(', ') };
      (severity === 'high' ? high : medium).push(entry);
    }
    // Low: unmapped wiki keys
    for (const k of it.unmapped_wiki_keys) {
      low.push({ name: it.name, tier: it.tier, category: it.category, wiki_key: k });
    }
  }

  function writeBlock(label, list) {
    lines.push(`### ${label} (${list.length})`);
    lines.push('');
    if (list.length === 0) { lines.push('_None._'); lines.push(''); return; }
    for (const e of list) {
      if (e.stat) {
        lines.push(`- **${e.name}** (${e.category} T${{800:1,1600:2,3200:3,6400:4}[e.tier]}) — ${e.stat}: ${e.raw} → tag(s) \`${e.tags.join(', ')}\` null/zero`);
      } else {
        lines.push(`- **${e.name}** (${e.category} T${{800:1,1600:2,3200:3,6400:4}[e.tier]}) — unmapped wiki key: \`${e.wiki_key}\``);
      }
    }
    lines.push('');
  }

  writeBlock('High severity (target stat, direct tag null)', high);
  writeBlock('Medium severity (target stat, composite mapping null)', medium);
  // Low severity is voluminous; roll up as count per wiki_key
  const lowByKey = {};
  for (const e of low) (lowByKey[e.wiki_key] = lowByKey[e.wiki_key] || []).push(e.name);
  lines.push(`### Low severity / informational — unmapped wiki keys`);
  lines.push('');
  lines.push('Wiki stat keys observed across items that are not in `STAT_MAP`. Count + sample item names.');
  lines.push('');
  for (const [k, names] of Object.entries(lowByKey).sort((a,b) => b[1].length - a[1].length)) {
    lines.push(`- \`${k}\` — ${names.length} items (${names.slice(0,5).join(', ')}${names.length>5?', ...':''})`);
  }
  lines.push('');

  // Synergy-tag gaps: items with conditional bonuses that imply specific tag scores
  // but the relevant playstyle_score is null/zero (e.g. Bullet Resilience missing low_max_hp).
  lines.push('## 2. Synergy-tag gaps from conditional bonuses');
  lines.push('');
  lines.push('Items where a conditional bonus (low-HP gated, Ambush, per-stack, damage-window, etc.) implies a synergy tag should be scored but it is null/zero.');
  lines.push('');
  const synergyGapItems = [];
  for (const it of norm.items) {
    if (!it.has_wiki_entry || !it.synergy_suggestions) continue;
    for (const [tag, reasons] of Object.entries(it.synergy_suggestions)) {
      const v = it.playstyle_score[tag];
      if (v == null || v === 0) {
        synergyGapItems.push({ name: it.name, tier: it.tier, category: it.category, tag, reasons });
      }
    }
  }
  if (synergyGapItems.length === 0) lines.push('_None._');
  else {
    for (const e of synergyGapItems) {
      lines.push(`- **${e.name}** (${e.category} T${{800:1,1600:2,3200:3,6400:4}[e.tier]}) — \`${e.tag}\` is null/zero. Implied by: ${e.reasons.join('; ')}`);
    }
  }
  lines.push('');

  lines.push('## 3. Missing-stat items');
  lines.push('');
  lines.push('Items with fewer than 3 non-null entries in `playstyle_score`.');
  lines.push('');
  const sparse = norm.items.filter(it => Object.values(it.playstyle_score).filter(v => v != null).length < 3);
  if (sparse.length === 0) lines.push('_None._');
  else {
    for (const it of sparse) {
      const n = Object.values(it.playstyle_score).filter(v => v != null).length;
      const wiki = Object.keys(it.raw_stats).length;
      lines.push(`- **${it.name}** (${it.category} T${{800:1,1600:2,3200:3,6400:4}[it.tier]}) — ${n} non-null tags, ${wiki} wiki stat keys`);
    }
  }
  lines.push('');

  fs.writeFileSync(path.join(DATA, 'anomalies.md'), lines.join('\n'));
  console.log(`Wrote anomalies.md (high: ${high.length}, medium: ${medium.length}, low-keys: ${Object.keys(lowByKey).length}, synergy_gaps: ${synergyGapItems.length}, sparse: ${sparse.length})`);
}

// =================================================================
// Main
// =================================================================

(async () => {
  const args = process.argv.slice(2);
  const refetch = args.includes('--refetch');
  const phase = (args.find(a => a.startsWith('--phase=')) || '--phase=all').split('=')[1];

  const norm = await phaseB({ refetch });
  if (phase === 'audit' || phase === 'all') {
    phaseC(norm);
    phaseF(norm);
  }
  if (phase === 'baselines' || phase === 'all') {
    const table = phaseD(norm);
    phaseE(table);
  }
  console.log('Done.');
})().catch(err => { console.error(err); process.exit(1); });
